import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

  const downloadLinks = files
    .map(
      (file) =>
        `<li style="margin-bottom:8px;"><a href="${BASE_URL}/api/download?file=${encodeURIComponent(file)}&session=${sessionId}" style="color:#059669;font-weight:600;">${file}</a></li>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #059669; padding: 24px 32px; }
  .header-logo { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .body { padding: 32px; color: #1e293b; font-size: 15px; line-height: 1.6; }
  .body h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
  .body p { margin: 0 0 16px; color: #334155; }
  .callout { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
  .callout p { margin: 0; color: #166534; font-size: 14px; }
  .footer { padding: 20px 32px; border-top: 1px solid #e2e8f0; }
  .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-logo">🛡️ BidShield</div>
  </div>
  <div class="body">
    <h2>Your download is ready</h2>
    <p>Thanks for purchasing <strong>${productName}</strong>. Click the link below to download your file:</p>
    <ul style="margin: 0 0 16px; padding-left: 20px;">
      ${downloadLinks}
    </ul>
    <div class="callout">
      <p><strong>Link not working?</strong> Go to <a href="${BASE_URL}/checkout/success?session_id=${sessionId}" style="color: #059669;">your order page</a> to re-access your download at any time.</p>
    </div>
    <p style="color: #475569;">— Carlos, BidShield</p>
  </div>
  <div class="footer">
    <p>BidShield &middot; <a href="${BASE_URL}" style="color: #94a3b8;">bidshield.co</a></p>
    <p style="margin-top: 6px;">You're receiving this because you purchased a template from BidShield.</p>
  </div>
</div>
</body>
</html>`;

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
