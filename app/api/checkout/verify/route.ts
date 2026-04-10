import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const productId = session.metadata?.productId;
    const productName = session.metadata?.productName;
    let files: string[] = [];
    try {
      files = session.metadata?.files ? JSON.parse(session.metadata.files) : [];
    } catch {
      console.error('Failed to parse session metadata files for session', sessionId);
    }
    const customerEmail = session.customer_email || session.customer_details?.email;

    // Generate download URLs (these point to our download API)
    const downloads = files.map((file: string) => ({
      name: file,
      url: `/api/download?file=${encodeURIComponent(file)}&session=${sessionId}`,
    }));

    return NextResponse.json({
      success: true,
      productId,
      productName,
      customerEmail,
      downloads,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
