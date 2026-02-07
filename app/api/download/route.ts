import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readFile } from 'fs/promises';
import path from 'path';
import { auth } from '@clerk/nextjs/server';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

// Map of allowed template files
const ALLOWED_FILES: Record<string, string> = {
  'Roofing_Estimator_Template.xlsx': 'templates/Roofing_Estimator_Template.xlsx',
  'BUR_Estimator_Template.xlsx': 'templates/BUR_Estimator_Template.xlsx',
  'EPDM_Roofing_Estimator_Template.xlsx': 'templates/EPDM_Roofing_Estimator_Template.xlsx',
  'Metal_Roofing_Estimator_Template.xlsx': 'templates/Metal_Roofing_Estimator_Template.xlsx',
  'Siplast_SBS_Estimator_Template.xlsx': 'templates/Siplast_SBS_Estimator_Template.xlsx',
  'Spray_Foam_Insulation_Estimator_Template.xlsx': 'templates/Spray_Foam_Insulation_Estimator_Template.xlsx',
  'Tile_Roofing_Estimator_Template.xlsx': 'templates/Tile_Roofing_Estimator_Template.xlsx',
  'TPO_Roofing_Estimator_Template.xlsx': 'templates/TPO_Roofing_Estimator_Template.xlsx',
};

// Map product IDs to their template files
const PRODUCT_FILES: Record<string, string[]> = {
  'asphalt-shingle': ['Roofing_Estimator_Template.xlsx'],
  'bur': ['BUR_Estimator_Template.xlsx'],
  'epdm': ['EPDM_Roofing_Estimator_Template.xlsx'],
  'metal': ['Metal_Roofing_Estimator_Template.xlsx'],
  'sbs': ['Siplast_SBS_Estimator_Template.xlsx'],
  'spray-foam': ['Spray_Foam_Insulation_Estimator_Template.xlsx'],
  'tile': ['Tile_Roofing_Estimator_Template.xlsx'],
  'tpo': ['TPO_Roofing_Estimator_Template.xlsx'],
  'tpo-template': ['TPO_Roofing_Estimator_Template.xlsx'],
  'metal-roofing': ['Metal_Roofing_Estimator_Template.xlsx'],
  'tile-roofing': ['Tile_Roofing_Estimator_Template.xlsx'],
  'sbs-template': ['Siplast_SBS_Estimator_Template.xlsx'],
  'template-bundle': Object.keys(ALLOWED_FILES),
  'starter-bundle': Object.keys(ALLOWED_FILES),
  'professional-bundle': Object.keys(ALLOWED_FILES),
  'master-toolkit': Object.keys(ALLOWED_FILES),
};

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file');
    const sessionId = request.nextUrl.searchParams.get('session');

    if (!fileName) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    // Check if file is allowed
    const filePath = ALLOWED_FILES[fileName];
    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Mode 1: Verify via Stripe session (existing flow)
    if (sessionId) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
      }

      const purchasedFiles = session.metadata?.files ? JSON.parse(session.metadata.files) : [];
      if (!purchasedFiles.includes(fileName)) {
        return NextResponse.json({ error: 'File not part of purchase' }, { status: 403 });
      }
    } else {
      // Mode 2: Verify via Clerk auth + Convex purchase records (Gumroad flow)
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      // Query Convex to check if user owns a product that includes this file
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@/convex/_generated/api');

      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('NEXT_PUBLIC_CONVEX_URL not configured');
      }

      const convex = new ConvexHttpClient(convexUrl);

      // Get user from Convex to find their email
      const user = await convex.query(api.users.getCurrentUser, { clerkId: userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Get user's purchases
      const purchases = await convex.query(api.gumroad.getPurchasedProductIds, {
        email: user.email,
      });

      // Check if any purchased product grants access to this file
      const hasAccess = purchases.some((p: { productId: string }) => {
        const files = PRODUCT_FILES[p.productId];
        return files && files.includes(fileName);
      });

      // Also check if user has pro membership (full access)
      const hasProAccess = user.membershipLevel === 'pro';

      if (!hasAccess && !hasProAccess) {
        return NextResponse.json({ error: 'File not part of your purchases' }, { status: 403 });
      }
    }

    // Read and return the file
    const fullPath = path.join(process.cwd(), filePath);
    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    );
  }
}
