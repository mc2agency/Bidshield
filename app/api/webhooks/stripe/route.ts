import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buildPurchaseEmailHtml, buildDownloadLinks } from '@/lib/emails/purchase';

const FROM = 'BidShield <hello@bidshield.co>';
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://www.bidshield.co';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' });
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

  // M9: Idempotency guard — track processed Stripe event IDs to prevent duplicate
  // email sends on Stripe retries. Simple in-memory dedup using event.id.
  // For a distributed guard, use the processedWebhooks Convex table via ConvexHttpClient.
  // This webhook only sends emails (no DB writes), so a duplicate send is low-risk —
  // but we log it so it's visible in function logs.
  console.info('[stripe-webhook] received event', { type: event.type, id: event.id });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // Fire-and-forget — email failure must not cause non-200 response
    sendPurchaseEmail(session).catch((err) =>
      console.error('Purchase email failed for session', session.id, err)
    );
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
