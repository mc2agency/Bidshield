import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    // Return 200 to prevent Vercel from logging as error - config issue, not runtime error
    console.warn('Clerk webhook received but CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook not configured',
        hint: 'Set CLERK_WEBHOOK_SECRET in environment variables'
      },
      { status: 200 }
    );
  }

  // Get the headers
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || email || 'User';

    console.log('New user created via Clerk webhook:', {
      clerkId: id,
      email,
      name,
    });

    // Create user in Convex
    try {
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@/convex/_generated/api');

      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
      }

      const convex = new ConvexHttpClient(convexUrl);
      await convex.mutation(api.users.getOrCreateUser, {
        email: email || '',
        name,
        clerkId: id,
      });

      console.log('User created in Convex:', id);
    } catch (error) {
      console.error('Error creating user in Convex:', error);
      // Don't return error - Clerk will retry
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    console.log('User updated:', id);
    // Optionally update user in Convex
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log('User deleted:', id);
    // Optionally mark user as deleted in Convex
  }

  return NextResponse.json({ success: true });
}

// Handle GET requests (for testing endpoint availability and config check)
export async function GET() {
  const hasWebhookSecret = !!process.env.CLERK_WEBHOOK_SECRET;
  const hasConvexUrl = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  return NextResponse.json({
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString(),
    config: {
      webhookSecret: hasWebhookSecret ? 'configured' : 'missing',
      convexUrl: hasConvexUrl ? 'configured' : 'missing',
    },
    ready: hasWebhookSecret && hasConvexUrl,
  });
}
