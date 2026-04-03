/**
 * Roof System Specifications Database
 * 
 * Research-backed specs for each commercial membrane system.
 * Drives material generation, scope items, checklist filtering, and cost estimates.
 * 
 * Sources: IKO, Johns Manville, Carlisle SynTec, Versico, WeatherBond
 * Pricing: 2025-2026 market data (material only, per SF)
 */

export interface RoofSystemSpec {
  id: string;
  name: string;
  fullName: string;
  category: "single_ply" | "multi_ply" | "metal" | "coating";
  description: string;
  
  // Attachment methods available
  attachmentMethods: { id: string; label: string; description: string }[];
  
  // Material pricing (material only, per SF)
  materialCostRange: { low: number; high: number };
  // Installed pricing (material + labor, per SF)  
  installedCostRange: { low: number; high: number };
  
  // Performance
  lifespanYears: { min: number; max: number };
  warrantyOptions: string[];
  
  // Technical
  thicknessOptions: string[];
  rollSizes: string[];
  seamMethod: string;
  
  // Compatibility
  bestFor: string[];
  notIdealFor: string[];
  
  // Manufacturers
  manufacturers: string[];
  
  // CSI spec section
  csiSection: string;
  
  // Key materials needed (drives auto-generation)
  requiredMaterials: {
    category: string;
    name: string;
    unit: string;
    estimateMethod: "per_sf" | "per_lf" | "per_count" | "coverage";
    defaultRate?: number; // units per SF, or coverage per unit
    notes?: string;
  }[];
}

export const ROOF_SYSTEMS: RoofSystemSpec[] = [
  {
    id: "tpo",
    name: "TPO",
    fullName: "Thermoplastic Polyolefin (TPO)",
    category: "single_ply",
    description: "Heat-welded thermoplastic membrane. Market leader (~40% share) for commercial flat roofs. Energy-efficient white surface, strong welded seams.",
    attachmentMethods: [
      { id: "mech_attached", label: "Mechanically Attached", description: "Fasteners & plates through membrane into deck. Most common for steel decks." },
      { id: "fully_adhered", label: "Fully Adhered", description: "Bonding adhesive over cover board. Smoother appearance, better wind uplift." },
      { id: "induction_welded", label: "Induction Welded", description: "Fastener plates welded to membrane underside. No exposed fasteners." },
    ],
    materialCostRange: { low: 1.50, high: 3.50 },
    installedCostRange: { low: 5.00, high: 10.00 },
    lifespanYears: { min: 20, max: 30 },
    warrantyOptions: ["10-yr Standard", "15-yr NDL", "20-yr NDL", "25-yr NDL", "30-yr NDL"],
    thicknessOptions: ["45 mil", "60 mil (standard)", "80 mil (premium)"],
    rollSizes: ["5' x 100'", "10' x 100'", "12' x 100'"],
    seamMethod: "Hot-air welded (minimum 1.5\" wide weld)",
    bestFor: ["Energy efficiency / cool roof", "New construction", "Re-roofs over existing", "Budget-conscious commercial"],
    notIdealFor: ["Restaurants / grease exposure (use PVC)", "Rooftop gardens / green roofs", "Extreme foot traffic areas"],
    manufacturers: ["Carlisle SynTec", "Johns Manville", "Firestone / Elevate", "Versico", "GAF", "IKO"],
    csiSection: "07 54 23",
    requiredMaterials: [
      { category: "membrane", name: "TPO Membrane", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.06, notes: "6% waste factor" },
      { category: "membrane", name: "TPO Cover Tape", unit: "RL", estimateMethod: "per_lf", notes: "For metal flange strip-in" },
      { category: "insulation", name: "Polyiso Insulation", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.03, notes: "3% waste" },
      { category: "insulation", name: "Tapered Polyiso", unit: "SF", estimateMethod: "coverage", notes: "Cricket/drainage areas" },
      { category: "insulation", name: "Cover Board (HD or DensDeck)", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.02 },
      { category: "fasteners", name: "Membrane Fasteners & Plates", unit: "EA", estimateMethod: "per_sf", defaultRate: 1, notes: "1 per SF average for mech attached" },
      { category: "fasteners", name: "Insulation Fasteners & Plates", unit: "EA", estimateMethod: "per_sf", defaultRate: 0.25 },
      { category: "adhesive", name: "Bonding Adhesive", unit: "GAL", estimateMethod: "coverage", defaultRate: 60, notes: "60 SF/gal for fully adhered" },
      { category: "adhesive", name: "TPO Primer", unit: "GAL", estimateMethod: "coverage", defaultRate: 200, notes: "For flashing adhesion" },
      { category: "flashing", name: "TPO-Coated Metal Edge", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Coping Cap", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Pipe Boot Flashings", unit: "EA", estimateMethod: "per_count" },
      { category: "accessories", name: "Walkway Pads", unit: "SF", estimateMethod: "per_count", notes: "At equipment locations" },
      { category: "accessories", name: "Drain Retrofit Kits", unit: "EA", estimateMethod: "per_count" },
      { category: "accessories", name: "Termination Bar", unit: "LF", estimateMethod: "per_lf" },
    ],
  },
  {
    id: "epdm",
    name: "EPDM",
    fullName: "Ethylene Propylene Diene Monomer (EPDM)",
    category: "single_ply",
    description: "Synthetic rubber membrane with 30+ year track record. Available in black or white. Seams joined by adhesive or tape, not heat welded.",
    attachmentMethods: [
      { id: "mech_attached", label: "Mechanically Attached", description: "Fasteners through membrane or in seams" },
      { id: "fully_adhered", label: "Fully Adhered", description: "Contact adhesive bond to substrate" },
      { id: "ballasted", label: "Ballasted", description: "Loose-laid with river stone or pavers (10-12 PSF). Low cost but adds weight." },
    ],
    materialCostRange: { low: 1.25, high: 3.00 },
    installedCostRange: { low: 4.00, high: 9.00 },
    lifespanYears: { min: 20, max: 40 },
    warrantyOptions: ["10-yr Standard", "15-yr NDL", "20-yr NDL", "25-yr NDL"],
    thicknessOptions: ["45 mil (economy)", "60 mil (standard)", "90 mil (premium)"],
    rollSizes: ["10' x 100'", "10' x 200'", "20' x 100'", "50' x 100' (large format)"],
    seamMethod: "Adhesive (splice tape) or seam primer + adhesive",
    bestFor: ["Budget-conscious projects", "Large simple roof areas", "Cold climates", "Buildings with minimal foot traffic"],
    notIdealFor: ["Cool roof requirements (unless white)", "Areas with oil/grease exposure", "High-wind zones without mechanical attachment"],
    manufacturers: ["Carlisle SynTec", "Firestone / Elevate", "Versico", "Johns Manville", "WeatherBond"],
    csiSection: "07 53 23",
    requiredMaterials: [
      { category: "membrane", name: "EPDM Membrane", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.05, notes: "5% waste" },
      { category: "membrane", name: "EPDM Splice Tape (3\")", unit: "RL", estimateMethod: "per_lf", notes: "For seams" },
      { category: "membrane", name: "EPDM Splice Adhesive", unit: "GAL", estimateMethod: "per_lf", notes: "For seam priming" },
      { category: "insulation", name: "Polyiso Insulation", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.03 },
      { category: "insulation", name: "Cover Board", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.02 },
      { category: "fasteners", name: "Insulation Fasteners & Plates", unit: "EA", estimateMethod: "per_sf", defaultRate: 0.25 },
      { category: "adhesive", name: "Bonding Adhesive (EPDM)", unit: "GAL", estimateMethod: "coverage", defaultRate: 60 },
      { category: "adhesive", name: "Seam Primer", unit: "CAN", estimateMethod: "per_lf" },
      { category: "flashing", name: "EPDM Flashing Membrane", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Coping Cap", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Pipe Boot Flashings", unit: "EA", estimateMethod: "per_count" },
      { category: "accessories", name: "Termination Bar", unit: "LF", estimateMethod: "per_lf" },
      { category: "accessories", name: "Drain Accessories", unit: "EA", estimateMethod: "per_count" },
    ],
  },
  {
    id: "pvc",
    name: "PVC",
    fullName: "Polyvinyl Chloride (PVC)",
    category: "single_ply",
    description: "Premium single-ply with superior chemical resistance. Heat-welded seams like TPO. Best for restaurants, kitchens, and industrial facilities with grease/chemical exposure.",
    attachmentMethods: [
      { id: "mech_attached", label: "Mechanically Attached", description: "Fasteners & plates through membrane" },
      { id: "fully_adhered", label: "Fully Adhered", description: "Adhesive bond for smooth finish" },
    ],
    materialCostRange: { low: 2.00, high: 4.50 },
    installedCostRange: { low: 6.00, high: 12.00 },
    lifespanYears: { min: 20, max: 35 },
    warrantyOptions: ["15-yr NDL", "20-yr NDL", "25-yr NDL", "30-yr NDL"],
    thicknessOptions: ["50 mil", "60 mil (standard)", "80 mil (premium)"],
    rollSizes: ["5' x 100'", "10' x 100'"],
    seamMethod: "Hot-air welded (chemical bond, strongest seam in industry)",
    bestFor: ["Restaurants / food service", "Chemical plants", "Grease / oil exposure", "Long-term performance"],
    notIdealFor: ["Budget-constrained projects", "Simple warehouse roofs where TPO suffices"],
    manufacturers: ["Sika Sarnafil", "Carlisle SynTec", "IB Roof Systems", "Duro-Last", "Johns Manville"],
    csiSection: "07 54 19",
    requiredMaterials: [
      { category: "membrane", name: "PVC Membrane", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.06 },
      { category: "insulation", name: "Polyiso Insulation", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.03 },
      { category: "insulation", name: "Cover Board", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.02 },
      { category: "fasteners", name: "Membrane Fasteners & Plates", unit: "EA", estimateMethod: "per_sf", defaultRate: 1 },
      { category: "adhesive", name: "PVC Bonding Adhesive", unit: "GAL", estimateMethod: "coverage", defaultRate: 60 },
      { category: "flashing", name: "PVC-Coated Metal Edge", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Pipe Boot Flashings", unit: "EA", estimateMethod: "per_count" },
      { category: "accessories", name: "Walkway Pads", unit: "SF", estimateMethod: "per_count" },
    ],
  },
  {
    id: "sbs",
    name: "Modified Bit (SBS)",
    fullName: "SBS Modified Bitumen (2-Ply or 3-Ply)",
    category: "multi_ply",
    description: "Multi-layer asphalt-based system with SBS rubber modifier. Torch-applied, cold-applied, or self-adhered. Excellent puncture resistance and redundancy.",
    attachmentMethods: [
      { id: "torch_applied", label: "Torch Applied", description: "Open flame melts asphalt to bond layers. Traditional method." },
      { id: "cold_applied", label: "Cold Applied", description: "Adhesive-based, no flame. Safer for occupied buildings." },
      { id: "self_adhered", label: "Self-Adhered", description: "Peel-and-stick application. Fastest install." },
    ],
    materialCostRange: { low: 2.50, high: 5.00 },
    installedCostRange: { low: 6.00, high: 14.00 },
    lifespanYears: { min: 20, max: 30 },
    warrantyOptions: ["10-yr Standard", "15-yr NDL", "20-yr NDL"],
    thicknessOptions: ["2-Ply (standard)", "3-Ply (premium)"],
    rollSizes: ["3.3' x 33' (1 square)"],
    seamMethod: "Torch-welded or cold adhesive overlap (min 3\" side lap, 6\" end lap)",
    bestFor: ["Heavy foot traffic", "Rooftop equipment areas", "Hail-prone regions", "Industrial / warehouse"],
    notIdealFor: ["Cool roof requirements (dark surface)", "Rapid installation timelines", "Budget projects"],
    manufacturers: ["Carlisle SynTec", "Johns Manville", "GAF", "Siplast", "Polyglass"],
    csiSection: "07 52 13",
    requiredMaterials: [
      { category: "membrane", name: "SBS Cap Sheet", unit: "SQ", estimateMethod: "per_sf", defaultRate: 0.0106, notes: "1 SQ = 100 SF, 6% waste" },
      { category: "membrane", name: "SBS Base Sheet", unit: "SQ", estimateMethod: "per_sf", defaultRate: 0.0106 },
      { category: "insulation", name: "Polyiso Insulation", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.03 },
      { category: "insulation", name: "Cover Board", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.02 },
      { category: "fasteners", name: "Insulation Fasteners & Plates", unit: "EA", estimateMethod: "per_sf", defaultRate: 0.25 },
      { category: "adhesive", name: "Cold Adhesive (if cold-applied)", unit: "GAL", estimateMethod: "coverage", defaultRate: 40 },
      { category: "adhesive", name: "Asphalt Primer", unit: "GAL", estimateMethod: "coverage", defaultRate: 100 },
      { category: "flashing", name: "Modified Bit Flashing", unit: "LF", estimateMethod: "per_lf" },
      { category: "accessories", name: "Propane (torch-applied)", unit: "TANK", estimateMethod: "per_sf", defaultRate: 0.001 },
    ],
  },
  {
    id: "metal",
    name: "Standing Seam",
    fullName: "Standing Seam Metal Roof",
    category: "metal",
    description: "Interlocking metal panels with concealed fasteners. Premium option with 40-60 year lifespan. Available in steel, aluminum, copper, or zinc.",
    attachmentMethods: [
      { id: "clip_attached", label: "Clip Attached", description: "Floating clips allow thermal expansion. Standard for standing seam." },
      { id: "through_fastened", label: "Through Fastened", description: "Exposed fasteners. Lower cost, for R-panels and corrugated." },
    ],
    materialCostRange: { low: 4.00, high: 12.00 },
    installedCostRange: { low: 7.00, high: 15.00 },
    lifespanYears: { min: 40, max: 60 },
    warrantyOptions: ["20-yr Paint", "25-yr Weathertight", "35-yr Weathertight"],
    thicknessOptions: ["24 gauge (standard)", "22 gauge (heavy)", "26 gauge (economy)"],
    rollSizes: ["Custom lengths to 60'"],
    seamMethod: "Mechanical seam (single lock or double lock)",
    bestFor: ["Steep-slope commercial", "Long lifespan requirements", "Architectural appearance", "Snow country"],
    notIdealFor: ["Flat roofs (need min 1/2:12 slope)", "Budget projects", "Complex penetration-heavy roofs"],
    manufacturers: ["ATAS International", "Petersen Aluminum", "MBCI", "Firestone Metal Products", "Berridge"],
    csiSection: "07 41 13",
    requiredMaterials: [
      { category: "membrane", name: "Metal Panels", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.10, notes: "10% waste for cuts" },
      { category: "membrane", name: "Panel Clips", unit: "EA", estimateMethod: "per_sf", defaultRate: 0.5 },
      { category: "insulation", name: "Batt Insulation (if applicable)", unit: "SF", estimateMethod: "per_sf", defaultRate: 1.0 },
      { category: "fasteners", name: "Clip Screws", unit: "EA", estimateMethod: "per_sf", defaultRate: 0.5 },
      { category: "flashing", name: "Ridge Cap", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Eave Trim", unit: "LF", estimateMethod: "per_lf" },
      { category: "flashing", name: "Pipe Flashing Boots", unit: "EA", estimateMethod: "per_count" },
      { category: "accessories", name: "Butyl Tape Sealant", unit: "RL", estimateMethod: "per_lf" },
      { category: "accessories", name: "Touch-Up Paint", unit: "CAN", estimateMethod: "per_count" },
    ],
  },
];

// ─── HELPER FUNCTIONS ───

export function getRoofSystem(systemId: string): RoofSystemSpec | undefined {
  return ROOF_SYSTEMS.find(s => s.id === systemId);
}

export function getRoofSystemByAssembly(assemblyName: string): RoofSystemSpec | undefined {
  const lower = assemblyName.toLowerCase();
  if (lower.includes("tpo")) return getRoofSystem("tpo");
  if (lower.includes("epdm")) return getRoofSystem("epdm");
  if (lower.includes("pvc")) return getRoofSystem("pvc");
  if (lower.includes("modified") || lower.includes("sbs") || lower.includes("bitumen")) return getRoofSystem("sbs");
  if (lower.includes("metal") || lower.includes("standing seam")) return getRoofSystem("metal");
  return undefined;
}

export function getSystemDisplayName(systemId: string): string {
  return getRoofSystem(systemId)?.name ?? systemId.toUpperCase();
}

export function getAllSystems(): { id: string; name: string; fullName: string }[] {
  return ROOF_SYSTEMS.map(s => ({ id: s.id, name: s.name, fullName: s.fullName }));
}
