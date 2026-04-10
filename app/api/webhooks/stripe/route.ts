import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { buildPurchaseEmailHtml, buildDownloadLinks } from '@/lib/emails/purchase';

const FROM = 'BidShield <hello@bidshield.co>';
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://www.bidshield.co';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any });
}

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
  return new ConvexHttpClient(url);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.info('[stripe-webhook] received event', { type: event.type, id: event.id });

  // P0-4: Idempotency guard — check if this event has already been processed
  // Prevents duplicate email sends on Stripe retries (up to 3× over 3 days).
  const convex = getConvex();
  try {
    const alreadyProcessed = await convex.query(anyApi.webhooks.isEventProcessed, {
      stripeEventId: event.id,
    });
    if (alreadyProcessed) {
      console.info('[stripe-webhook] skipping duplicate event', event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (err) {
    // C4: If Convex is unreachable, return 500 so Stripe retries later when
    // the idempotency guard is available. This prevents duplicate processing.
    console.error('[stripe-webhook] idempotency check failed, returning 500 for retry:', err);
    return NextResponse.json(
      { error: 'Idempotency check unavailable — will retry' },
      { status: 500 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // P1-7: Await email send. If it fails, return 500 so Stripe retries.
    // The idempotency guard above will deduplicate on the retry.
    try {
      await sendPurchaseEmail(session);
    } catch (err) {
      console.error('Purchase email failed for session', session.id, err);
      return NextResponse.json(
        { error: 'Email delivery failed — Stripe will retry' },
        { status: 500 }
      );
    }
  }

  // Mark event as processed AFTER handling
  try {
    await convex.mutation(anyApi.webhooks.markEventProcessed, {
      stripeEventId: event.id,
    });
  } catch (err) {
    console.warn('[stripe-webhook] failed to mark event processed:', err);
  }

  return NextResponse.json({ received: true });
}

async function sendPurchaseEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping purchase email for session', session.id);
    return;
  }

  const customerEmail = session.customer_email || session.customer_details?.email;
  const productName = session.metadata?.productName || 'Your template';
  let files: string[] = [];
  try {
    files = session.metadata?.files ? JSON.parse(session.metadata.files) : [];
  } catch {
    console.error('[stripe-webhook] Failed to parse metadata files for session', session.id);
  }
  const sessionId = session.id;

  if (!customerEmail) {
    console.warn('No customer email in session', sessionId);
    return;
  }

  // P1-8: Basic email format validation before sending
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    console.error('[stripe-webhook] Invalid email format, skipping send:', { sessionId, customerEmail });
    return;
  }

  if (files.length === 0) {
    console.warn('No files in session metadata for session', sessionId);
    return;
  }

  const downloadLinks = buildDownloadLinks(files, BASE_URL, sessionId);
  const html = buildPurchaseEmailHtml({ productName, downloadLinks, baseUrl: BASE_URL, sessionId });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: customerEmail,
      subject: `Your download: ${productName}`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error for purchase email (session', sessionId, '):', text);
  } else {
    console.log('Purchase email sent to', customerEmail, 'for session', sessionId);
  }
}
