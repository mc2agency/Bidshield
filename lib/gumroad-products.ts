/**
 * Gumroad Product Configuration
 *
 * Replace the placeholder IDs with your actual Gumroad product IDs
 * To get your product ID:
 * 1. Log into Gumroad
 * 2. Go to your product
 * 3. Look at the URL or product settings for the product permalink
 *
 * Example: https://gumroad.com/l/YOUR_PRODUCT_ID
 */

export const GUMROAD_PRODUCTS = {
  // Template Bundle & Individual Templates
  templateBundle: 'mc2-template-bundle',
  asphaltShingle: 'mc2-asphalt-shingle',
  tpoTemplate: 'mc2-tpo-pvc-epdm',
  metalRoofing: 'mc2-metal-roofing',
  tileRoofing: 'mc2-tile-roofing',
  sprayFoam: 'mc2-spray-foam',
  greenRoof: 'mc2-green-roof',
  sbsTemplate: 'mc2-sbs-modified',

  // Business Tools & Guides
  estimatingChecklist: 'mc2-estimating-checklist',
  proposalTemplates: 'mc2-proposal-templates',
  leadGenGuide: 'mc2-lead-generation',
  insuranceGuide: 'mc2-insurance-compliance',
  oshaGuide: 'mc2-osha-safety',
  techSetupGuide: 'mc2-tech-setup',

  // Courses
  estimatingFundamentals: 'mc2-estimating-fundamentals',
  bluebeamMastery: 'mc2-bluebeam-mastery',
  autocadSubmittals: 'mc2-autocad-submittals',
  sketchupVisualization: 'mc2-sketchup-visualization',
  measurementTechnology: 'mc2-measurement-technology',
  constructionSubmittals: 'mc2-construction-submittals',
  estimatingSoftware: 'mc2-estimating-software',

  // Bundles
  starterBundle: 'mc2-starter-bundle',
  professionalBundle: 'mc2-professional-bundle',
  completeAcademy: 'mc2-complete-academy',

  // Membership
  mc2ProMonthly: 'mc2-pro-monthly',
  mc2ProYearly: 'mc2-pro-yearly',
} as const;

export type GumroadProductKey = keyof typeof GUMROAD_PRODUCTS;

/**
 * Get the Gumroad product ID for a given product key
 */
export function getGumroadProductId(key: GumroadProductKey): string {
  return GUMROAD_PRODUCTS[key];
}

/**
 * Product metadata for display purposes
 */
export const PRODUCT_META = {
  templateBundle: {
    name: 'Complete Template Bundle',
    price: 129,
    category: 'template'
  },
  estimatingFundamentals: {
    name: 'Estimating Fundamentals Course',
    price: 497,
    category: 'course'
  },
  bluebeamMastery: {
    name: 'Bluebeam Mastery Course',
    price: 147,
    category: 'course'
  },
  mc2ProMonthly: {
    name: 'MC2 Pro Membership',
    price: 197,
    category: 'membership',
    interval: 'monthly'
  },
  // Add more as needed
};
