import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { buildPurchaseEmailHtml, buildDownloadLinks } from '@/lib/emails/purchase';

const FROM = 'BidShield <hello@bidshield.co>';
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://www.bidshield.co';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' });
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
    // If Convex is unreachable, log but proceed — better to risk a duplicate
    // email than to reject a valid webhook (Stripe would retry anyway).
    console.warn('[stripe-webhook] idempotency check failed, proceeding:', err);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // Send email, then mark as processed
    await sendPurchaseEmail(session).catch((err) =>
      console.error('Purchase email failed for session', session.id, err)
    );
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
  const files: string[] = session.metadata?.files ? JSON.parse(session.metadata.files) : [];
  const sessionId = session.id;

  if (!customerEmail) {
    console.warn('No customer email in session', sessionId);
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
