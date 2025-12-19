import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - never pre-render this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Product mapping: Gumroad product IDs to your internal product IDs
const PRODUCT_MAPPING: Record<string, { type: 'product' | 'bundle' | 'membership'; id: string }> = {
  // Individual Templates
  'tpo-template': { type: 'product', id: 'tpo-template' },
  'asphalt-shingle-template': { type: 'product', id: 'asphalt-shingle-template' },
  'metal-roofing-template': { type: 'product', id: 'metal-roofing-template' },
  'tile-roofing-template': { type: 'product', id: 'tile-roofing-template' },
  'spray-foam-template': { type: 'product', id: 'spray-foam-template' },
  'green-roof-template': { type: 'product', id: 'green-roof-template' },
  'sbs-template': { type: 'product', id: 'sbs-template' },
  'restoration-coating-template': { type: 'product', id: 'restoration-coating-template' },

  // Tools & Guides
  'estimating-checklist': { type: 'product', id: 'estimating-checklist' },
  'proposal-templates': { type: 'product', id: 'proposal-templates' },
  'lead-generation-guide': { type: 'product', id: 'lead-generation-guide' },
  'insurance-compliance-guide': { type: 'product', id: 'insurance-compliance-guide' },
  'osha-safety-guide': { type: 'product', id: 'osha-safety-guide' },
  'technology-setup-guide': { type: 'product', id: 'technology-setup-guide' },

  // Bundles
  'template-bundle': { type: 'bundle', id: 'template-bundle' },
  'complete-bundle': { type: 'bundle', id: 'complete-bundle' },

  // Membership
  'mc2-pro-membership': { type: 'membership', id: 'mc2-pro-membership' },
};

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const body = await request.json();

    console.log('Gumroad webhook received:', {
      seller_id: body.seller_id,
      product_id: body.product_id,
      product_name: body.product_name,
      email: body.email,
      sale_id: body.sale_id,
    });

    // Verify seller_id matches your Gumroad account (basic security)
    const expectedSellerId = process.env.GUMROAD_SELLER_ID;
    if (expectedSellerId && body.seller_id !== expectedSellerId) {
      console.error('Invalid seller_id:', body.seller_id);
      return NextResponse.json(
        { error: 'Invalid seller' },
        { status: 401 }
      );
    }

    // Extract purchase data
    const {
      email,
      product_id,
      product_name,
      product_permalink,
      price,
      sale_id,
      order_id,
      subscription_id,
      recurrence,
      refunded,
      disputed,
    } = body;

    // Skip if refunded or disputed
    if (refunded === 'true' || disputed === 'true') {
      console.log('Purchase was refunded or disputed, skipping');
      return NextResponse.json({
        success: true,
        message: 'Refunded/disputed purchase ignored'
      });
    }

    // Determine product type from mapping or permalink
    const productKey = product_permalink || product_id;
    const mappedProduct = PRODUCT_MAPPING[productKey];

    if (!mappedProduct) {
      console.error('Unknown product:', productKey);
      return NextResponse.json({
        success: false,
        error: 'Unknown product'
      }, { status: 400 });
    }

    // Convert price to cents (Gumroad sends in dollars)
    const amountInCents = Math.round(parseFloat(price) * 100);

    // Dynamically import Convex to avoid build-time errors
    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }

    // Call Convex mutation to handle the purchase
    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.gumroad.handleGumroadPurchase, {
      email,
      productId: mappedProduct.id,
      productName: product_name,
      amount: amountInCents,
      currency: 'USD',
      gumroadOrderId: order_id,
      gumroadSaleId: sale_id,
    });

    console.log('Purchase processed successfully:', {
      email,
      productId: mappedProduct.id,
      productType: mappedProduct.type,
    });

    // If this is a subscription, log it
    if (subscription_id) {
      console.log('Subscription created:', {
        subscription_id,
        recurrence,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase processed successfully',
      productType: mappedProduct.type,
    });

  } catch (error) {
    console.error('Error processing Gumroad webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle Gumroad ping requests
export async function GET() {
  return NextResponse.json({
    message: 'Gumroad webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
