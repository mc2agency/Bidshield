/**
 * Stripe Product Configuration for BidShield
 * 
 * Pricing (from research):
 * - Individual templates: $29 each
 * - 3-Pack (any 3): $59
 * - Full Bundle (all 8): $99
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  priceDisplay: string;
  files: string[]; // file paths in /templates folder
  popular?: boolean;
}

export const PRODUCTS: Record<string, Product> = {
  // Individual Templates - $29 each
  'asphalt-shingle': {
    id: 'asphalt-shingle',
    name: 'Asphalt Shingle Estimator',
    description: 'Professional estimating template for 3-tab, architectural, and designer shingles',
    price: 2900,
    priceDisplay: '$29',
    files: ['Roofing_Estimator_Template.xlsx'],
  },
  'bur': {
    id: 'bur',
    name: 'BUR (Built-Up Roofing) Estimator',
    description: 'Hot-applied & cold-applied multi-ply roofing systems',
    price: 2900,
    priceDisplay: '$29',
    files: ['BUR_Estimator_Template.xlsx'],
  },
  'epdm': {
    id: 'epdm',
    name: 'EPDM Estimator',
    description: 'Mechanically attached, fully adhered, and ballasted rubber roofing',
    price: 2900,
    priceDisplay: '$29',
    files: ['EPDM_Roofing_Estimator_Template.xlsx'],
  },
  'metal': {
    id: 'metal',
    name: 'Metal Standing Seam Estimator',
    description: 'Standing seam, corrugated, and metal shingle systems',
    price: 2900,
    priceDisplay: '$29',
    files: ['Metal_Roofing_Estimator_Template.xlsx'],
  },
  'sbs': {
    id: 'sbs',
    name: 'Siplast SBS Modified Bitumen Estimator',
    description: 'Torch-applied & self-adhered modified bitumen systems',
    price: 2900,
    priceDisplay: '$29',
    files: ['Siplast_SBS_Estimator_Template.xlsx'],
  },
  'spray-foam': {
    id: 'spray-foam',
    name: 'Spray Foam Insulation Estimator',
    description: 'Open-cell, closed-cell, and roof coating systems',
    price: 2900,
    priceDisplay: '$29',
    files: ['Spray_Foam_Insulation_Estimator_Template.xlsx'],
  },
  'tile': {
    id: 'tile',
    name: 'Tile Roofing Estimator',
    description: 'Concrete, clay, and interlocking tile roofing',
    price: 2900,
    priceDisplay: '$29',
    files: ['Tile_Roofing_Estimator_Template.xlsx'],
  },
  'tpo': {
    id: 'tpo',
    name: 'TPO Single-Ply Estimator',
    description: 'Mechanically attached & fully adhered TPO systems',
    price: 2900,
    priceDisplay: '$29',
    files: ['TPO_Roofing_Estimator_Template.xlsx'],
  },

  // Bundles
  'bundle-full': {
    id: 'bundle-full',
    name: 'Complete Template Bundle',
    description: 'All 8 professional estimating templates - Best Value!',
    price: 9900,
    priceDisplay: '$99',
    popular: true,
    files: [
      'Roofing_Estimator_Template.xlsx',
      'BUR_Estimator_Template.xlsx',
      'EPDM_Roofing_Estimator_Template.xlsx',
      'Metal_Roofing_Estimator_Template.xlsx',
      'Siplast_SBS_Estimator_Template.xlsx',
      'Spray_Foam_Insulation_Estimator_Template.xlsx',
      'Tile_Roofing_Estimator_Template.xlsx',
      'TPO_Roofing_Estimator_Template.xlsx',
    ],
  },
};

// Helper to get product by ID
export function getProduct(id: string): Product | undefined {
  return PRODUCTS[id];
}

// Get all products as array
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}

// Get individual templates only
export function getTemplates(): Product[] {
  return Object.values(PRODUCTS).filter(p => !p.id.startsWith('bundle'));
}

// Get bundles only
export function getBundles(): Product[] {
  return Object.values(PRODUCTS).filter(p => p.id.startsWith('bundle'));
}
