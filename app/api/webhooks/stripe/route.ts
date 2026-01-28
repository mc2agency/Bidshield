import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      case 'payment_intent.succeeded': {
        console.log('Payment succeeded:', event.data.object);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const productId = session.metadata?.productId;
  const productName = session.metadata?.productName;
  const files = session.metadata?.files ? JSON.parse(session.metadata.files) : [];

  console.log('✅ Payment successful!');
  console.log('   Customer:', customerEmail);
  console.log('   Product:', productName);
  console.log('   Files:', files);

  // TODO: Send email with download links
  // For now, we'll use the success page to provide downloads
  // In production, integrate with Resend, SendGrid, or similar

  // You could also:
  // 1. Store purchase in database (Convex)
  // 2. Generate signed download URLs
  // 3. Send email with links
  // 4. Grant access in user dashboard

  // Example: Store in Convex (if you want to track purchases)
  /*
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  await convex.mutation(api.purchases.create, {
    email: customerEmail,
    productId,
    productName,
    files,
    stripeSessionId: session.id,
    amount: session.amount_total,
    createdAt: Date.now(),
  });
  */
}
