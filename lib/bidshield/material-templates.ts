// Built-in roofing material templates
// These are NOT stored in Convex — they're static reference data used to seed project material lists.

export type CalcType = "coverage" | "qty_per_sf" | "linear_from_takeoff" | "count_from_takeoff" | "fixed";

export type MaterialCategory = "membrane" | "insulation" | "fasteners" | "adhesive" | "sheet_metal" | "lumber" | "accessories" | "miscellaneous";

export interface MaterialTemplate {
  key: string;
  category: MaterialCategory;
  name: string;
  unit: string; // "RL", "BD", "BX", "CS", "GL", "PC", "EA", "LF"
  calcType: CalcType;
  defaultCoverage?: number; // SF per unit (for coverage calc)
  defaultQtyPerSf?: number; // units per SF (for qty_per_sf calc)
  takeoffItemType?: string; // links to takeoff line item for linear/count
  wasteFactor: number; // 1.0 = no waste, 1.10 = 10% waste
  defaultUnitPrice?: number; // suggested price
  systemTypes: string[]; // which roof systems use this ("tpo", "epdm", "sbs", "pvc", "all")
  sortOrder: number;
}

export const MATERIAL_CATEGORIES: Record<MaterialCategory, { label: string; icon: string }> = {
  membrane: { label: "Membrane", icon: "🔲" },
  insulation: { label: "Insulation", icon: "🧱" },
  fasteners: { label: "Fasteners & Plates", icon: "🔩" },
  adhesive: { label: "Adhesive & Sealant", icon: "🧴" },
  sheet_metal: { label: "Sheet Metal", icon: "⚙️" },
  lumber: { label: "Lumber & Blocking", icon: "🪵" },
  accessories: { label: "Accessories", icon: "🔧" },
  miscellaneous: { label: "Miscellaneous", icon: "📦" },
};

const ALL_SYSTEMS = ["tpo", "epdm", "sbs", "pvc"];

export const MATERIAL_TEMPLATES: MaterialTemplate[] = [
  // ===== MEMBRANE =====
  { key: "tpo-60mil", category: "membrane", name: "TPO 60mil Membrane (10' wide)", unit: "RL", calcType: "coverage", defaultCoverage: 1000, wasteFactor: 1.05, defaultUnitPrice: 285, systemTypes: ["tpo"], sortOrder: 1 },
  { key: "tpo-80mil", category: "membrane", name: "TPO 80mil Membrane (10' wide)", unit: "RL", calcType: "coverage", defaultCoverage: 1000, wasteFactor: 1.05, defaultUnitPrice: 365, systemTypes: ["tpo"], sortOrder: 2 },
  { key: "pvc-60mil", category: "membrane", name: "PVC 60mil Membrane (10' wide)", unit: "RL", calcType: "coverage", defaultCoverage: 1000, wasteFactor: 1.05, defaultUnitPrice: 340, systemTypes: ["pvc"], sortOrder: 3 },
  { key: "epdm-60mil", category: "membrane", name: "EPDM 60mil (10' wide)", unit: "RL", calcType: "coverage", defaultCoverage: 1000, wasteFactor: 1.05, defaultUnitPrice: 250, systemTypes: ["epdm"], sortOrder: 4 },
  { key: "epdm-90mil", category: "membrane", name: "EPDM 90mil (10' wide)", unit: "RL", calcType: "coverage", defaultCoverage: 1000, wasteFactor: 1.05, defaultUnitPrice: 395, systemTypes: ["epdm"], sortOrder: 5 },
  { key: "sbs-cap", category: "membrane", name: "SBS Modified Bitumen Cap Sheet", unit: "RL", calcType: "coverage", defaultCoverage: 100, wasteFactor: 1.10, defaultUnitPrice: 95, systemTypes: ["sbs"], sortOrder: 6 },
  { key: "sbs-base", category: "membrane", name: "SBS Modified Bitumen Base Sheet", unit: "RL", calcType: "coverage", defaultCoverage: 100, wasteFactor: 1.10, defaultUnitPrice: 65, systemTypes: ["sbs"], sortOrder: 7 },

  // ===== INSULATION =====
  { key: "iso-2in", category: "insulation", name: 'Polyiso 2" (4x8)', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.05, defaultUnitPrice: 28, systemTypes: ALL_SYSTEMS, sortOrder: 10 },
  { key: "iso-2.5in", category: "insulation", name: 'Polyiso 2.5" (4x8)', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.05, defaultUnitPrice: 34, systemTypes: ALL_SYSTEMS, sortOrder: 11 },
  { key: "iso-3in", category: "insulation", name: 'Polyiso 3" (4x8)', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.05, defaultUnitPrice: 40, systemTypes: ALL_SYSTEMS, sortOrder: 12 },
  { key: "iso-tapered", category: "insulation", name: 'Polyiso Tapered (1/4"/ft slope)', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.08, defaultUnitPrice: 45, systemTypes: ALL_SYSTEMS, sortOrder: 13 },
  { key: "eps-2in", category: "insulation", name: 'EPS 2" (4x8)', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.05, defaultUnitPrice: 18, systemTypes: ALL_SYSTEMS, sortOrder: 14 },
  { key: "densdeck", category: "insulation", name: 'DensDeck Cover Board 1/2"', unit: "BD", calcType: "coverage", defaultCoverage: 32, wasteFactor: 1.05, defaultUnitPrice: 22, systemTypes: ALL_SYSTEMS, sortOrder: 15 },

  // ===== FASTENERS & PLATES =====
  { key: "iso-fasteners", category: "fasteners", name: "Insulation Screws + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", defaultQtyPerSf: 1 / 4, wasteFactor: 1.05, defaultUnitPrice: 145, systemTypes: ALL_SYSTEMS, sortOrder: 20 },
  { key: "membrane-fasteners", category: "fasteners", name: "Membrane Fasteners + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", defaultQtyPerSf: 1 / 6, wasteFactor: 1.05, defaultUnitPrice: 165, systemTypes: ["tpo", "pvc"], sortOrder: 21 },
  { key: "term-bar-fasteners", category: "fasteners", name: "Termination Bar Screws (box of 250)", unit: "BX", calcType: "linear_from_takeoff", takeoffItemType: "base_flashing", wasteFactor: 1.10, defaultUnitPrice: 45, systemTypes: ALL_SYSTEMS, sortOrder: 22 },

  // ===== ADHESIVE & SEALANT =====
  { key: "bonding-adhesive", category: "adhesive", name: "Bonding Adhesive (5 gal pail)", unit: "GL", calcType: "coverage", defaultCoverage: 250, wasteFactor: 1.10, defaultUnitPrice: 185, systemTypes: ALL_SYSTEMS, sortOrder: 30 },
  { key: "tpo-primer", category: "adhesive", name: "TPO/PVC Primer (1 gal)", unit: "GL", calcType: "coverage", defaultCoverage: 200, wasteFactor: 1.10, defaultUnitPrice: 65, systemTypes: ["tpo", "pvc"], sortOrder: 31 },
  { key: "low-rise-foam", category: "adhesive", name: "Low-Rise Foam Adhesive (canister)", unit: "CS", calcType: "coverage", defaultCoverage: 350, wasteFactor: 1.10, defaultUnitPrice: 95, systemTypes: ALL_SYSTEMS, sortOrder: 32 },
  { key: "lap-sealant", category: "adhesive", name: "Lap Sealant (tube)", unit: "EA", calcType: "fixed", wasteFactor: 1.0, defaultUnitPrice: 12, systemTypes: ALL_SYSTEMS, sortOrder: 33 },
  { key: "pitch-pan-filler", category: "adhesive", name: "Pitch Pan Filler (gal)", unit: "GL", calcType: "count_from_takeoff", takeoffItemType: "pitch_pan", wasteFactor: 1.20, defaultUnitPrice: 48, systemTypes: ALL_SYSTEMS, sortOrder: 34 },

  // ===== SHEET METAL =====
  { key: "drip-edge", category: "sheet_metal", name: "Drip Edge (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", takeoffItemType: "edge_metal", wasteFactor: 1.05, defaultUnitPrice: 18, systemTypes: ALL_SYSTEMS, sortOrder: 40 },
  { key: "coping-cap", category: "sheet_metal", name: "Coping Cap (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", takeoffItemType: "coping", wasteFactor: 1.05, defaultUnitPrice: 42, systemTypes: ALL_SYSTEMS, sortOrder: 41 },
  { key: "gravel-stop", category: "sheet_metal", name: "Gravel Stop (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", takeoffItemType: "gravel_stop", wasteFactor: 1.05, defaultUnitPrice: 24, systemTypes: ALL_SYSTEMS, sortOrder: 42 },
  { key: "term-bar", category: "sheet_metal", name: "Termination Bar (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", takeoffItemType: "reglet", wasteFactor: 1.05, defaultUnitPrice: 8, systemTypes: ALL_SYSTEMS, sortOrder: 43 },
  { key: "counterflashing", category: "sheet_metal", name: "Counterflashing (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", takeoffItemType: "counterflashing", wasteFactor: 1.05, defaultUnitPrice: 28, systemTypes: ALL_SYSTEMS, sortOrder: 44 },

  // ===== LUMBER & BLOCKING =====
  { key: "2x6-pt-nailer", category: "lumber", name: '2x6 PT Nailer', unit: "LF", calcType: "fixed", wasteFactor: 1.10, defaultUnitPrice: 4, systemTypes: ALL_SYSTEMS, sortOrder: 48 },
  { key: "2x8-pt-nailer", category: "lumber", name: '2x8 PT Nailer', unit: "LF", calcType: "fixed", wasteFactor: 1.10, defaultUnitPrice: 5, systemTypes: ALL_SYSTEMS, sortOrder: 49 },

  // ===== ACCESSORIES =====
  { key: "pipe-boots", category: "accessories", name: "Pipe Boots (TPO/PVC)", unit: "EA", calcType: "count_from_takeoff", takeoffItemType: "pipe_penetration", wasteFactor: 1.0, defaultUnitPrice: 35, systemTypes: ["tpo", "pvc"], sortOrder: 50 },
  { key: "pipe-boots-epdm", category: "accessories", name: "Pipe Boots (EPDM)", unit: "EA", calcType: "count_from_takeoff", takeoffItemType: "pipe_penetration", wasteFactor: 1.0, defaultUnitPrice: 28, systemTypes: ["epdm"], sortOrder: 51 },
  { key: "drain-assembly", category: "accessories", name: "Drain Assemblies", unit: "EA", calcType: "count_from_takeoff", takeoffItemType: "roof_drain", wasteFactor: 1.0, defaultUnitPrice: 125, systemTypes: ALL_SYSTEMS, sortOrder: 52 },
  { key: "overflow-drain", category: "accessories", name: "Overflow Drain", unit: "EA", calcType: "count_from_takeoff", takeoffItemType: "overflow_drain", wasteFactor: 1.0, defaultUnitPrice: 85, systemTypes: ALL_SYSTEMS, sortOrder: 53 },
  { key: "walkway-pads", category: "accessories", name: "Walkway Pads (per pad)", unit: "EA", calcType: "fixed", wasteFactor: 1.0, defaultUnitPrice: 45, systemTypes: ALL_SYSTEMS, sortOrder: 54 },
  { key: "seam-tape", category: "accessories", name: "Seaming Tape (100' roll)", unit: "RL", calcType: "coverage", defaultCoverage: 100, wasteFactor: 1.10, defaultUnitPrice: 55, systemTypes: ["tpo", "pvc"], sortOrder: 55 },
];

/**
 * Get material templates filtered by system type.
 * Returns templates that match the system type or have "all" in their systemTypes.
 */
export function getTemplatesForSystem(systemType?: string): MaterialTemplate[] {
  if (!systemType) return MATERIAL_TEMPLATES;
  return MATERIAL_TEMPLATES.filter(
    (t) => t.systemTypes.includes(systemType) || t.systemTypes.length === 4 // all systems
  );
}

/**
 * Get templates grouped by category.
 */
export function getTemplatesGroupedByCategory(systemType?: string): Record<MaterialCategory, MaterialTemplate[]> {
  const templates = getTemplatesForSystem(systemType);
  const grouped: Record<MaterialCategory, MaterialTemplate[]> = {
    membrane: [],
    insulation: [],
    fasteners: [],
    adhesive: [],
    sheet_metal: [],
    lumber: [],
    accessories: [],
    miscellaneous: [],
  };
  for (const t of templates) {
    grouped[t.category].push(t);
  }
  return grouped;
}

/**
 * Calculate quantity for a material based on its calc type and project data.
 */
export function calculateMaterialQuantity(
  template: MaterialTemplate,
  totalSF: number,
  takeoffLineItems: { itemType: string; quantity: number | null }[],
  overrides?: { coverage?: number; qtyPerSf?: number; wasteFactor?: number }
): number | null {
  const waste = overrides?.wasteFactor ?? template.wasteFactor;

  switch (template.calcType) {
    case "coverage": {
      const coverage = overrides?.coverage ?? template.defaultCoverage;
      if (!coverage || coverage <= 0 || totalSF <= 0) return null;
      return Math.ceil((totalSF / coverage) * waste);
    }
    case "qty_per_sf": {
      const qtyPerSf = overrides?.qtyPerSf ?? template.defaultQtyPerSf;
      if (!qtyPerSf || totalSF <= 0) return null;
      // For box-based items: total fasteners = SF * qtyPerSf, then divide by box size
      // qtyPerSf is already normalized (e.g., 1/4 = 0.25 fasteners per SF means 1 box per 4 SF)
      return Math.ceil(totalSF * qtyPerSf * waste);
    }
    case "linear_from_takeoff": {
      if (!template.takeoffItemType) return null;
      const lineItem = takeoffLineItems.find((li) => li.itemType === template.takeoffItemType);
      if (!lineItem || lineItem.quantity == null) return null;
      // Convert LF to pieces (10' sticks)
      return Math.ceil((lineItem.quantity / 10) * waste);
    }
    case "count_from_takeoff": {
      if (!template.takeoffItemType) return null;
      const countItem = takeoffLineItems.find((li) => li.itemType === template.takeoffItemType);
      if (!countItem || countItem.quantity == null) return null;
      return Math.ceil(countItem.quantity * waste);
    }
    case "fixed":
      return null; // Manual entry
    default:
      return null;
  }
}
