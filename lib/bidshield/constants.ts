// P1-6: Canonical membership level definitions.
// "bidshield" and "pro" are both paid tiers — some users were upgraded during
// a product rename, so both values may exist in the database. Always check both
// when gating Pro features.
export const PRO_MEMBERSHIP_LEVELS = ["bidshield", "pro"] as const;

/** Returns true if the user has a paid BidShield subscription */
export function isPaidUser(membershipLevel: string | undefined | null): boolean {
  return PRO_MEMBERSHIP_LEVELS.includes(membershipLevel as any);
}

/** Monthly subscription price in USD */
export const MONTHLY_PRICE = 249;

/** Default free trial period in days */
export const DEFAULT_TRIAL_DAYS = parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_DAYS || "14", 10);

export const ASSEMBLY_TYPES = [
  "TPO 60mil Mechanically Attached", "TPO 60mil Fully Adhered",
  "TPO 80mil Mechanically Attached", "TPO 80mil Fully Adhered",
  "PVC 60mil Mechanically Attached", "PVC 60mil Fully Adhered",
  "Modified Bitumen 2-Ply (SBS)", "Modified Bitumen 3-Ply (SBS)",
  "Modified Bitumen (APP)", "EPDM 60mil", "Metal Roof Panels",
  "Metal Wall Panels", "Pavers / Ballast", "Green Roof",
  "Waterproofing / Below Grade", "Other",
];
