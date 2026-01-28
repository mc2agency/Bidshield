import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readFile } from 'fs/promises';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

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

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('file');
    const sessionId = request.nextUrl.searchParams.get('session');

    if (!fileName || !sessionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify the Stripe session is valid and paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
    }

    // Check if the file was part of this purchase
    const purchasedFiles = session.metadata?.files ? JSON.parse(session.metadata.files) : [];
    if (!purchasedFiles.includes(fileName)) {
      return NextResponse.json({ error: 'File not part of purchase' }, { status: 403 });
    }

    // Check if file is allowed
    const filePath = ALLOWED_FILES[fileName];
    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fullPath = path.join(process.cwd(), filePath);
    const fileBuffer = await readFile(fullPath);

    // Return the file
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
