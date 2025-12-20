import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - never pre-render this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Product mapping: Gumroad product IDs to your internal course/product IDs
const PRODUCT_MAPPING: Record<string, { type: 'course' | 'product' | 'membership'; id: string }> = {
  // Courses
  'bluebeam-mastery': { type: 'course', id: 'bluebeam-mastery' },
  'estimating-fundamentals': { type: 'course', id: 'estimating-fundamentals' },
  'measurement-technology': { type: 'course', id: 'measurement-technology' },
  'construction-submittals': { type: 'course', id: 'construction-submittals' },
  'autocad-submittals': { type: 'course', id: 'autocad-submittals' },
  'estimating-software': { type: 'course', id: 'estimating-software' },
  'sketchup-visualization': { type: 'course', id: 'sketchup-visualization' },

  // Products
  'tpo-template': { type: 'product', id: 'tpo-template' },
  'asphalt-shingle-template': { type: 'product', id: 'asphalt-shingle-template' },
  'metal-roofing-template': { type: 'product', id: 'metal-roofing-template' },
  'tile-roofing-template': { type: 'product', id: 'tile-roofing-template' },
  'spray-foam-template': { type: 'product', id: 'spray-foam-template' },
  'estimating-checklist': { type: 'product', id: 'estimating-checklist' },
  'proposal-templates': { type: 'product', id: 'proposal-templates' },
  'template-bundle': { type: 'product', id: 'template-bundle' },

  // Membership
  'mc2-pro-membership': { type: 'membership', id: 'mc2-pro-membership' },
};

export async function POST(request: NextRequest) {
  try {
    // Check required environment variables first
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.warn('Gumroad webhook received but NEXT_PUBLIC_CONVEX_URL not configured');
      return NextResponse.json({
        success: false,
        error: 'Webhook not configured',
        hint: 'Set NEXT_PUBLIC_CONVEX_URL in environment variables'
      }, { status: 200 }); // Return 200 to avoid Vercel error logs
    }

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
      console.warn('Invalid seller_id received:', body.seller_id);
      return NextResponse.json(
        { success: false, error: 'Invalid seller' },
        { status: 200 } // Return 200 to avoid error logs for invalid requests
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

// Handle Gumroad ping requests and config check
export async function GET() {
  const hasConvexUrl = !!process.env.NEXT_PUBLIC_CONVEX_URL;
  const hasSellerId = !!process.env.GUMROAD_SELLER_ID;

  return NextResponse.json({
    message: 'Gumroad webhook endpoint is active',
    timestamp: new Date().toISOString(),
    config: {
      convexUrl: hasConvexUrl ? 'configured' : 'missing',
      sellerId: hasSellerId ? 'configured' : 'optional (not set)',
    },
    ready: hasConvexUrl,
  });
}
