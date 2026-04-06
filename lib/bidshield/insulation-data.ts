// Insulation types, surface types, and R-value calculation helpers
// Used by the wizard assembly builder and AI system description generator

export interface InsulationType {
  id: string;
  label: string;
  rPerInch: number;
}

export const INSULATION_TYPES: InsulationType[] = [
  { id: "polyiso", label: "Polyisocyanurate (Polyiso)", rPerInch: 5.7 },
  { id: "xps", label: "XPS (Extruded Polystyrene)", rPerInch: 5.0 },
  { id: "eps", label: "EPS (Expanded Polystyrene)", rPerInch: 4.0 },
  { id: "mineral_wool", label: "Mineral Wool", rPerInch: 3.7 },
  { id: "vacuum", label: "Vacuum Insulated Panel (VIP)", rPerInch: 50.0 },
];

export interface SurfaceType {
  id: string;
  label: string;
}

export const SURFACE_TYPES: SurfaceType[] = [
  { id: "exposed", label: "Exposed Membrane" },
  { id: "pavers_pedestals", label: "Pavers on Pedestals" },
  { id: "pavers_ballast", label: "Ballast Pavers" },
  { id: "green_roof", label: "Green Roof Trays" },
  { id: "walkpads", label: "Walk Pads" },
  { id: "traffic_coating", label: "Traffic Coating" },
];

// Common R-value presets for quick selection in the wizard
export const R_VALUE_PRESETS = [
  { rValue: 10, label: "R-10" },
  { rValue: 15, label: "R-15" },
  { rValue: 20, label: "R-20" },
  { rValue: 25, label: "R-25" },
  { rValue: 30, label: "R-30" },
  { rValue: 40, label: "R-40" },
];

// Common thickness presets in inches
export const THICKNESS_PRESETS = ["1.5", "2", "2.5", "3", "4", "6", "8"];

/**
 * Compute the insulation R-value for a given type and thickness.
 * Returns just the insulation contribution (not total assembly R-value).
 */
export function computeInsulationRValue(insulationType: string, thicknessInches: number): number {
  const type = INSULATION_TYPES.find(t => t.id === insulationType);
  if (!type) return 0;
  return Math.round(type.rPerInch * thicknessInches * 100) / 100;
}

/**
 * Get the insulation thickness (inches) needed to achieve a target R-value.
 */
export function getThicknessForRValue(rValue: number, insulationType: string): number {
  const type = INSULATION_TYPES.find(t => t.id === insulationType);
  if (!type || type.rPerInch === 0) return 0;
  return Math.round((rValue / type.rPerInch) * 10) / 10;
}

/**
 * Parse a thickness string like "8in", "3in", "1.5in" to a number.
 */
export function parseThickness(thickness: string): number {
  return parseFloat(thickness.replace(/in$/i, "")) || 0;
}

/**
 * Format thickness as a display string like '3"' or '1-1/2"'.
 */
export function formatThickness(inches: number): string {
  if (inches === 1.5) return '1-1/2"';
  if (inches === 2.5) return '2-1/2"';
  return `${inches}"`;
}
