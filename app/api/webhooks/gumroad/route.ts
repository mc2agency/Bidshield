import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - never pre-render this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Product mapping: Gumroad product IDs (permalinks) to your internal tool/product IDs
// Add your Gumroad product permalinks here as you create them
const PRODUCT_MAPPING: Record<string, { type: 'tool' | 'product' | 'membership'; id: string }> = {
  // Template Bundles - ACTIVE
  'mc2-contractor-bundle': { type: 'product', id: 'template-bundle' },  // $129 - All 4 Templates

  // Individual Templates (add as you create them in Gumroad)
  'mc2-asphalt-shingle': { type: 'product', id: 'asphalt-shingle' },
  'mc2-tpo-pvc-epdm': { type: 'product', id: 'tpo-template' },
  'mc2-metal-roofing': { type: 'product', id: 'metal-roofing' },
  'mc2-tile-roofing': { type: 'product', id: 'tile-roofing' },
  'mc2-spray-foam': { type: 'product', id: 'spray-foam' },
  'mc2-restoration-coating': { type: 'product', id: 'restoration-coating' },
  'mc2-green-roof': { type: 'product', id: 'green-roof' },
  'mc2-sbs-modified': { type: 'product', id: 'sbs-template' },

  // Business Tools & Guides
  'mc2-estimating-checklist': { type: 'product', id: 'estimating-checklist' },
  'mc2-proposal-templates': { type: 'product', id: 'proposal-templates' },
  'mc2-lead-generation': { type: 'product', id: 'lead-gen-guide' },
  'mc2-insurance-compliance': { type: 'product', id: 'insurance-guide' },
  'mc2-osha-safety': { type: 'product', id: 'osha-guide' },
  'mc2-tech-setup': { type: 'product', id: 'tech-setup-guide' },

  // Tools (add as you create them in Gumroad)
  'mc2-estimating-essentials': { type: 'tool', id: 'estimating-essentials' },
  'mc2-bluebeam-mastery': { type: 'tool', id: 'bluebeam-mastery' },
  'mc2-autocad-submittals': { type: 'tool', id: 'autocad-submittals' },
  'mc2-sketchup-visualization': { type: 'tool', id: 'sketchup-visualization' },
  'mc2-measurement-technology': { type: 'tool', id: 'measurement-technology' },
  'mc2-construction-submittals': { type: 'tool', id: 'construction-submittals' },
  'mc2-estimating-software': { type: 'tool', id: 'estimating-software' },

  // Bundles
  'mc2-starter-bundle': { type: 'product', id: 'starter-bundle' },
  'mc2-professional-bundle': { type: 'product', id: 'professional-bundle' },
  'mc2-master-toolkit': { type: 'product', id: 'master-toolkit' },

  // Membership
  'mc2-pro-monthly': { type: 'membership', id: 'mc2-pro-monthly' },
  'mc2-pro-yearly': { type: 'membership', id: 'mc2-pro-yearly' },
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
