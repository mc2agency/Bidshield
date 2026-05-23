/**
 * Assembly System Configs
 *
 * Provides:
 *  - INSULATION_CODE_LABELS  — human-readable labels for insulation type codes
 *  - formatInsulationLabel   — normalised display string for an assembly's insulation
 *  - classifyAssemblySystem  — membrane-type + IRMA-flag classifier (sbs_irma, app_irma, etc.)
 *  - buildClassificationAudit — conflict detection between AI hint and detected system
 *  - validateAssembly        — overloaded: new ({system,...})→ValidationIssue[] and old (config,values)→ValidationResult[]
 *  - mapAIResultToSectionValues — canonical mapper (AIAssemblyResult)→AssemblySectionValues (no legacy path)
 *  - generateLayerStack, generateScope, getSystemConfig, getSystemBadges, getDeckCompatibilityWarning
 *  — All Phase 2 types and configs (SectionId, RoofSystemConfig, ROOF_SYSTEM_CONFIGS, etc.)
 */

import { computeInsulationRValue } from "@/lib/bidshield/insulation-data";

// ─── Insulation label lookup ───────────────────────────────────────────────────

export const INSULATION_CODE_LABELS: Record<string, string> = {
  polyiso: "Polyisocyanurate",
  xps: "XPS Rigid Insulation",
  xps_high: "XPS Rigid Insulation (High-R)",
  eps: "EPS Rigid Insulation",
  mineral_wool: "Mineral Wool",
  rigid: "Rigid Insulation",
  vacuum: "Vacuum Insulation Panel",
  fiberglass: "Fiberglass Batt",
  spray_foam: "Spray Foam",
};

/**
 * Formats an insulation type + thickness + optional rValue into a readable label.
 *
 * Examples:
 *   formatInsulationLabel("xps",   "7",  35)  → '7" XPS Rigid Insulation (R-35)'
 *   formatInsulationLabel("polyiso","3",  null) → '3" Polyisocyanurate'
 *   formatInsulationLabel("rigid", "7",  35)  → '7" Rigid Insulation (R-35)'
 *
 * Never returns bare codes like "3 rigid" or "7 xps".
 */
export function formatInsulationLabel(
  insulationType: string | null | undefined,
  insulationThickness: string | null | undefined,
  rValue?: number | null,
): string {
  const typeLabel =
    (insulationType && INSULATION_CODE_LABELS[insulationType.toLowerCase()]) ??
    insulationType ??
    "Insulation";

  const thickness = insulationThickness?.trim();

  const rPart = rValue != null ? ` (R-${rValue})` : "";

  if (thickness) {
    return `${thickness}" ${typeLabel}${rPart}`;
  }
  return `${typeLabel}${rPart}`;
}

// ─── Assembly classification ───────────────────────────────────────────────────

export type AssemblySystem =
  | "lam" | "lam_irma"
  | "sbs" | "sbs_irma" | "sbs_irma_green"
  | "app" | "app_irma"
  | "tpo" | "pvc" | "epdm" | "bur" | "metal" | "spf" | "hydrotech";

export interface AssemblyClassificationInput {
  ocrText?: string;
  /** AI-extracted ordered layer descriptions (deck → top) */
  layers?: string[] | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  surface?: string | null;
  /** AI's system hint — used as tiebreaker only, never overrides layer signals */
  aiSystem?: string | null;
  drawingTitle?: string | null;
}

export interface ClassificationAudit {
  titleSystem?: string;
  detectedSystem?: string;
  conflict?: boolean;
  reason?: string;
}

export interface ThermalAudit {
  insulationType?: string | null;
  thickness?: string | null;
  extractedR?: number | null;
  calculatedR?: number | null;
  conflict?: boolean;
}

export interface RawExtraction {
  sourceSystem?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  layers?: string[] | null;
  aiDescription?: string | null;
}

// Signal patterns — layer text is authoritative over assembly titles (domain rule)
const SBS_SIGNALS = /modified.?bitumen|base.?ply|finish.?ply|\bSBS\b/i;
const APP_SIGNALS = /\bAPP\b|torch.?applied/i;
const IRMA_SIGNALS =
  /\b(IRMA|PMR|inverted[\s-]roof|protected[\s-]membrane|drainage.?mat|filter.?fabric|pedestal|paver)\b/i;
const GREEN_SIGNALS = /green.?roof|vegetation|sedum|tray|planted/i;

// Kept for test backward compatibility
const IRMA_KEYWORDS = IRMA_SIGNALS;

/**
 * Classify an assembly from its layer stack signals and explicit flags.
 *
 * Priority (domain rule — layers beat title):
 *  SBS + IRMA + green → sbs_irma_green
 *  SBS + IRMA          → sbs_irma
 *  APP + IRMA          → app_irma
 *  SBS only            → sbs
 *  APP only            → app
 *  IRMA only           → lam_irma
 *  else                → aiSystem hint or lam
 */
export function classifyAssemblySystem(input: AssemblyClassificationInput): AssemblySystem {
  const { drainageMat, filterFabric, ocrText, layers, surface, aiSystem } = input;

  const allText = [ocrText, ...(layers ?? [])].filter(Boolean).join(" ");

  const irmaFlag = drainageMat === true || filterFabric === true;

  const hasSbs = SBS_SIGNALS.test(allText);
  const hasApp = APP_SIGNALS.test(allText);
  const hasIrma = irmaFlag || (allText.length > 0 && IRMA_SIGNALS.test(allText));
  const hasGreen = GREEN_SIGNALS.test(allText) || surface === "green_roof";

  if (hasSbs && hasIrma && hasGreen) return "sbs_irma_green";
  if (hasSbs && hasIrma) return "sbs_irma";
  if (hasApp && hasIrma) return "app_irma";
  if (hasSbs) return "sbs";
  if (hasApp) return "app";

  // No modified-bitumen signals — use aiSystem hint for single-ply / BUR
  const ai = aiSystem?.toLowerCase();
  if (ai && ["tpo", "pvc", "epdm", "bur", "metal", "spf", "hydrotech"].includes(ai)) {
    if (hasIrma) return "lam_irma";
    return ai as AssemblySystem;
  }

  if (hasIrma) return "lam_irma";
  return "lam";
}

/** Compare AI hint vs detected result and surface any conflict. */
export function buildClassificationAudit(
  input: AssemblyClassificationInput,
  detectedSystem: AssemblySystem,
): ClassificationAudit {
  const ai = input.aiSystem?.toLowerCase();
  if (!ai || ai === detectedSystem) return { detectedSystem };
  if (ai === "lam") return { detectedSystem }; // "lam" is ambiguous — not a conflict signal

  const detectedBase = detectedSystem.replace(/_irma.*$/, "").replace(/_green$/, "");
  if (ai === detectedBase) return { detectedSystem }; // same base type, different variant

  return {
    titleSystem: ai,
    detectedSystem,
    conflict: true,
    reason: `AI/title suggests '${ai}' but layer stack indicates '${detectedSystem}'`,
  };
}

// ─── New validation types ──────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

// ─── New AI extraction interfaces ─────────────────────────────────────────────

/**
 * Shape returned by the extract-assemblies AI route for a single assembly item.
 */
export interface AIAssemblyResult {
  label?: string | null;
  system?: string | null;
  insulation?: string | null;
  /** Raw thickness string from AI — e.g. "7", "3.5". Must be from insulation layer only. */
  thickness?: string | null;
  rValue?: number | null;
  surface?: string | null;
  area?: number | null;
  name?: string | null;
  deckType?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  /** Ordered layer stack extracted by AI (deck → top) */
  layers?: string[] | null;
}

/**
 * Normalised values ready for UI section population.
 */
export interface AssemblySectionValues {
  assemblySystem: AssemblySystem;
  insulationLabel: string | null;
  insulationType: string | null;
  insulationThickness: string | null;
  rValue: number | null;
  validationIssues: ValidationIssue[];
  classificationAudit: ClassificationAudit;
  thermalAudit: ThermalAudit;
  rawExtraction: RawExtraction;
}

// ─── Phase 2 types: SectionId, SectionDef, SectionValues ─────────────────────

export type SectionId =
  | "deck"
  | "vaporRetarder"
  | "insulation"
  | "taperedInsulation"
  | "coverBoard"
  | "burPlies"
  | "capSheet"
  | "surfacing"
  | "membrane"
  | "drainageMat"
  | "filterFabric"
  | "rootBarrier"
  | "protectionBoard"
  | "pedestals"
  | "ballast"
  | "ballastRestraint"
  | "greenRoof"
  | "growingMedia"
  | "drainageLayer"
  | "irrigation"
  | "concretePavement"
  | "reinforcement"
  | "drainage"
  | "flashing"
  | "penetrations"
  | "edgeConditions";

export interface SectionDef {
  id: SectionId;
  label: string;
  type: "text" | "boolean" | "select" | "number";
  placeholder?: string;
  options?: string[];
  unit?: string;
  helperText?: string;
}

export type SectionValues = Partial<Record<SectionId, string | boolean | null>>;

export const DECK_TYPE_OPTIONS = [
  "Steel Deck",
  "Concrete Deck",
  "Lightweight Concrete",
  "Gypsum Deck",
  "Wood / Plywood",
  "Tectum / Cementwood",
  "Other",
  "Unknown / Existing Conditions",
] as const;

// Map from AI extraction deckType codes → display values
export const DECK_TYPE_MAP: Record<string, string> = {
  steel: "Steel Deck",
  concrete: "Concrete Deck",
  wood: "Wood / Plywood",
  lightweight: "Lightweight Concrete",
  gypsum: "Gypsum Deck",
  tectum: "Tectum / Cementwood",
};

// ─── Section definitions ──────────────────────────────────────────────────────

export const SECTION_DEFS: Record<SectionId, SectionDef> = {
  deck: {
    id: "deck",
    label: "Structural Deck",
    type: "select",
    options: [...DECK_TYPE_OPTIONS],
    helperText: "Select the structural deck substrate — required for assembly validation",
  },
  vaporRetarder: { id: "vaporRetarder", label: "Vapor Retarder", type: "boolean" },
  insulation: {
    id: "insulation",
    label: "Insulation",
    type: "text",
    placeholder: "e.g. 3\" XPS, 7\" Polyiso, 4\" EPS",
  },
  taperedInsulation: {
    id: "taperedInsulation",
    label: "Tapered Insulation",
    type: "text",
    placeholder: "e.g. Polyiso tapered at 1/4\" per ft",
  },
  coverBoard: {
    id: "coverBoard",
    label: "Cover Board",
    type: "text",
    placeholder: "e.g. 1/2\" DensDeck Prime, 1/2\" gypsum",
  },
  burPlies: {
    id: "burPlies",
    label: "BUR Plies",
    type: "text",
    placeholder: "e.g. 4-ply felt + hot asphalt",
  },
  capSheet: {
    id: "capSheet",
    label: "Cap Sheet / Exposed Membrane",
    type: "text",
    placeholder: "e.g. Mineral-surfaced SBS cap sheet",
  },
  surfacing: {
    id: "surfacing",
    label: "Surfacing",
    type: "text",
    placeholder: "e.g. Gravel ballast, reflective coating",
  },
  membrane: {
    id: "membrane",
    label: "Waterproofing Membrane",
    type: "text",
    placeholder: "e.g. Cold Fluid Applied, MM6125, EPDM",
  },
  protectionBoard: {
    id: "protectionBoard",
    label: "Protection Sheet / Board",
    type: "text",
    placeholder: "e.g. Hydroflex®, 3/4\" CCW protection board",
  },
  drainageMat: {
    id: "drainageMat",
    label: "Drainage Mat",
    type: "text",
    placeholder: "e.g. Enkadrain 3611, Hydrodrain 40",
    helperText: "Required for IRMA / protected membrane assemblies",
  },
  filterFabric: {
    id: "filterFabric",
    label: "Filter Fabric",
    type: "boolean",
    helperText: "Install above insulation in IRMA assemblies",
  },
  rootBarrier: { id: "rootBarrier", label: "Root Barrier / Root Resistant Sheet", type: "boolean" },
  pedestals: {
    id: "pedestals",
    label: "Pedestal System",
    type: "text",
    placeholder: "e.g. Buzon DPH-1, min 4\" ht.",
  },
  ballast: {
    id: "ballast",
    label: "Ballast",
    type: "text",
    placeholder: "e.g. 1.5\" river stone, min 10 psf",
  },
  ballastRestraint: {
    id: "ballastRestraint",
    label: "Ballast Restraint / Paver Restraint",
    type: "text",
    placeholder: "e.g. Perimeter restraint at edges",
  },
  greenRoof: {
    id: "greenRoof",
    label: "Green Roof / Vegetated Assembly",
    type: "text",
    placeholder: "e.g. Extensive sedum, intensive planted",
  },
  growingMedia: {
    id: "growingMedia",
    label: "Growing Media",
    type: "text",
    placeholder: "e.g. 6\" extensive, 12\" intensive substrate",
  },
  drainageLayer: {
    id: "drainageLayer",
    label: "Drainage / Aggregate Layer",
    type: "text",
    placeholder: "e.g. LECA, expanded shale, drainage cell",
  },
  irrigation: { id: "irrigation", label: "Irrigation System", type: "boolean" },
  concretePavement: {
    id: "concretePavement",
    label: "Concrete Pavement Slab",
    type: "text",
    placeholder: "e.g. 4\" CIP w/ WWF 6x6 W2.1xW2.1",
  },
  reinforcement: {
    id: "reinforcement",
    label: "Reinforcement",
    type: "text",
    placeholder: "e.g. #4 @ 12\" EW, WWF",
  },
  drainage: {
    id: "drainage",
    label: "Primary Drainage",
    type: "text",
    placeholder: "e.g. Roof drains w/ overflow at +2\"",
  },
  flashing: {
    id: "flashing",
    label: "Flashing",
    type: "text",
    placeholder: "e.g. 24 ga. galv. sheet metal, min 8\" ht.",
  },
  penetrations: {
    id: "penetrations",
    label: "Penetrations",
    type: "text",
    placeholder: "e.g. Pipe boots, RTU curbs, skylight curbs",
  },
  edgeConditions: {
    id: "edgeConditions",
    label: "Edge Conditions",
    type: "text",
    placeholder: "e.g. Gravel stop, coping, parapet at 18\"",
  },
};

// ─── System config shape ───────────────────────────────────────────────────────

export interface ValidationRule {
  sectionId: SectionId;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  sectionId: SectionId;
  message: string;
  severity: "error" | "warning" | "info" | "success";
}

export interface SystemMetadata {
  assemblyType: string;
  membraneExposure: "Exposed" | "Protected" | "Buried";
  typicalInsulation: string;
  commonSurfaces: string[];
  isProtectedMembrane: boolean;
  isRecoverable: boolean;
  greenRoofCompatible: boolean;
  // Capability badges
  irmaCompatible: boolean;
  highWindRated: boolean;
  highTraffic: boolean;
  solarCompatible: boolean;
  coldApplied: boolean;
  typicalSlope?: string;
}

export interface RoofSystemConfig {
  systemId: string;
  label: string;
  category: string;
  icon: string;
  requiredSections: SectionId[];
  optionalSections: SectionId[];
  // hiddenSections = all sections NOT in required or optional
  defaultLayerOrder: SectionId[]; // bottom-to-top
  validationRules: ValidationRule[];
  scopeTemplate: string[]; // sentences with optional {sectionId} placeholders
  metadata: SystemMetadata;
}

// ─── All system configs ────────────────────────────────────────────────────────

export const ROOF_SYSTEM_CONFIGS: RoofSystemConfig[] = [
  // ── TPO ──────────────────────────────────────────────────────────────────────
  {
    systemId: "tpo",
    label: "TPO Single-Ply",
    category: "Low-Slope Membrane",
    icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "TPO membrane not specified.", severity: "error" },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" },
      { sectionId: "drainage", message: "Drainage not specified — confirm drain type and overflow details.", severity: "warning" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install TPO single-ply membrane.",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply mechanically attached or fully adhered",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed TPO", "Ballast", "Pavers"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: true,
      highTraffic: false,
      solarCompatible: true,
      coldApplied: false,
    },
  },

  // ── PVC ──────────────────────────────────────────────────────────────────────
  {
    systemId: "pvc",
    label: "PVC Single-Ply",
    category: "Low-Slope Membrane",
    icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "PVC membrane not specified.", severity: "error" },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install PVC single-ply membrane.",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply mechanically attached or fully adhered",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed PVC"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: true,
      highTraffic: true,
      solarCompatible: true,
      coldApplied: false,
    },
  },

  // ── EPDM ─────────────────────────────────────────────────────────────────────
  {
    systemId: "epdm",
    label: "EPDM Single-Ply",
    category: "Low-Slope Membrane",
    icon: "⬛",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "ballast", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "ballast"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "EPDM membrane not specified.", severity: "error" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install EPDM single-ply membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply ballasted, mechanically attached, or adhered",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed EPDM", "Ballast"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: false,
    },
  },

  // ── SBS Modified Bitumen ──────────────────────────────────────────────────────
  {
    systemId: "sbs",
    label: "SBS Modified Bitumen",
    category: "Modified Bitumen",
    icon: "🟫",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "SBS membrane not specified.", severity: "error" },
      { sectionId: "coverBoard", message: "Cover board not specified for SBS.", severity: "warning" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install SBS modified bitumen membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Torch-applied or cold-applied modified bitumen",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso",
      commonSurfaces: ["Granule-surfaced cap sheet", "Mineral surfaced", "Smooth + coating"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── APP Modified Bitumen ──────────────────────────────────────────────────────
  {
    systemId: "app",
    label: "APP Modified Bitumen",
    category: "Modified Bitumen",
    icon: "🟫",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "APP membrane not specified.", severity: "error" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install APP modified bitumen membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Torch-applied APP modified bitumen",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso",
      commonSurfaces: ["Granule cap sheet", "Reflective coating"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: false,
    },
  },

  // ── BUR ───────────────────────────────────────────────────────────────────────
  {
    systemId: "bur",
    label: "Built-Up Roof (BUR)",
    category: "Multi-Ply Asphaltic",
    icon: "🔲",
    requiredSections: ["deck", "insulation", "coverBoard", "burPlies", "capSheet", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "burPlies", "capSheet", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "burPlies", message: "BUR plies not specified — required for BUR assembly.", severity: "error" },
      { sectionId: "capSheet", message: "Cap sheet or exposed surface not specified.", severity: "error" },
      { sectionId: "coverBoard", message: "Cover board not specified — confirm or mark N/A.", severity: "warning" },
      { sectionId: "drainage", message: "Drainage details not specified.", severity: "warning" },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install built-up roofing plies ({burPlies}).",
      "Install cap sheet or exposed membrane ({capSheet}).",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: {
      assemblyType: "Multi-ply hot-mopped or cold-applied asphaltic",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Gravel ballast", "Mineral cap sheet", "Reflective coating"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: false,
    },
  },

  // ── Liquid Applied Membrane (Conventional) ───────────────────────────────────
  {
    systemId: "lam",
    label: "Liquid Applied Membrane",
    category: "Fluid-Applied",
    icon: "💧",
    requiredSections: ["deck", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "protectionBoard", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "Liquid-applied membrane product not specified.", severity: "error" },
      { sectionId: "drainage", message: "Drainage not specified — confirm drain type and overflow details.", severity: "warning" },
    ],
    scopeTemplate: [
      "Prepare structural deck and substrate for liquid-applied membrane.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}) and cover board ({coverBoard}).",
      "Install liquid-applied waterproofing membrane ({membrane}).",
      "Install flashing, drains, and edge conditions.",
    ],
    metadata: {
      assemblyType: "Conventional liquid-applied — membrane above substrate",
      membraneExposure: "Exposed",
      typicalInsulation: "Polyiso, XPS (below membrane)",
      commonSurfaces: ["Exposed", "Pavers on pedestals", "Traffic coating"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── Cold-Fluid IRMA / PMR ─────────────────────────────────────────────────────
  {
    systemId: "lam_irma",
    label: "Cold-Fluid IRMA / PMR",
    category: "Protected Membrane",
    icon: "🔷",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "Waterproofing membrane not specified — required for IRMA.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA assemblies — must be present above membrane.", severity: "error" },
      { sectionId: "insulation", message: "Insulation above membrane not specified — required for IRMA.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric should be installed above XPS insulation in IRMA assemblies.", severity: "warning" },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection sheet/board ({protectionBoard}) above membrane.",
      "Install drainage mat ({drainageMat}) above membrane assembly.",
      "Install insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden (ballast/pavers/green roof).",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — insulation above membrane (IRMA/PMR)",
      membraneExposure: "Protected",
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Concrete pavers on pedestals", "River ballast", "Green roof", "Concrete paving"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: true,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: true,
      coldApplied: true,
    },
  },

  // ── Hydrotech MM6125 (IRMA variant) ──────────────────────────────────────────
  {
    systemId: "hydrotech",
    label: "Hydrotech MM6125 (IRMA)",
    category: "Protected Membrane",
    icon: "🔷",
    requiredSections: ["deck", "membrane", "protectionBoard", "insulation", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "drainageMat", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "MM6125 membrane not specified.", severity: "error" },
      { sectionId: "protectionBoard", message: "Hydroflex® protection sheet not specified — required over MM6125.", severity: "error" },
      { sectionId: "insulation", message: "XPS insulation above membrane not specified.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed above insulation.", severity: "warning" },
    ],
    scopeTemplate: [
      "Apply surface conditioner and install Hydrotech MM6125® rubberized asphalt membrane.",
      "Install Hydroflex® or approved protection sheet.",
      "Install drainage mat ({drainageMat}) if required.",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden.",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — rubberized asphalt (Hydrotech)",
      membraneExposure: "Protected",
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Pavers on pedestals", "Ballast", "Intensive/extensive green roof", "Concrete plaza"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: true,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: true,
      coldApplied: false,
    },
  },

  // ── Green Roof ────────────────────────────────────────────────────────────────
  {
    systemId: "green",
    label: "Green Roof (Vegetated Assembly)",
    category: "Vegetated Assembly",
    icon: "🌿",
    requiredSections: ["deck", "membrane", "rootBarrier", "drainageLayer", "filterFabric", "growingMedia", "greenRoof", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "insulation", "drainageMat", "irrigation", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "rootBarrier", "protectionBoard", "insulation", "drainageMat", "drainageLayer", "filterFabric", "growingMedia", "greenRoof"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "rootBarrier", message: "Root barrier not specified — required for all vegetated assemblies.", severity: "error" },
      { sectionId: "drainageLayer", message: "Drainage layer not specified — required for green roof.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed — required above drainage layer.", severity: "error" },
      { sectionId: "growingMedia", message: "Growing media not specified.", severity: "warning" },
      { sectionId: "greenRoof", message: "Vegetation type not specified.", severity: "warning" },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).",
      "Install root barrier above membrane.",
      "Install protection board ({protectionBoard}).",
      "Install drainage mat and drainage layer ({drainageLayer}).",
      "Install filter fabric above drainage layer.",
      "Install growing media ({growingMedia}).",
      "Install vegetation assembly ({greenRoof}).",
      "Install irrigation system where required.",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Vegetated extensive or intensive green roof",
      membraneExposure: "Buried",
      typicalInsulation: "XPS, Polyiso",
      commonSurfaces: ["Sedum", "Grasses", "Intensive planted"],
      isProtectedMembrane: true,
      isRecoverable: false,
      greenRoofCompatible: true,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── Paver Pedestal Roof ───────────────────────────────────────────────────────
  {
    systemId: "paver_ped",
    label: "Paver Pedestal Roof",
    category: "Overburden Assembly",
    icon: "🔲",
    requiredSections: ["deck", "membrane", "drainageMat", "insulation", "filterFabric", "pedestals", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "pedestals"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "pedestals", message: "Pedestal system not specified — required for paver pedestal assembly.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA assemblies — must be present above membrane.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric should be installed above XPS insulation in IRMA assemblies.", severity: "warning" },
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).",
      "Install protection board ({protectionBoard}).",
      "Install drainage mat ({drainageMat}).",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric.",
      "Install adjustable pedestal system ({pedestals}).",
      "Install concrete pavers on pedestals.",
      "Install perimeter restraint and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane with pedestal paver overburden",
      membraneExposure: "Protected",
      typicalInsulation: "XPS",
      commonSurfaces: ["Concrete pavers on adjustable pedestals"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── Paver Ballast Roof ────────────────────────────────────────────────────────
  {
    systemId: "paver_bal",
    label: "Paver Ballast Roof",
    category: "Overburden Assembly",
    icon: "🔲",
    requiredSections: ["deck", "membrane", "drainageMat", "insulation", "filterFabric", "ballast", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "ballast", message: "Ballast not specified — required for ballasted assembly.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA assemblies — must be present above membrane.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric should be installed above XPS insulation in IRMA assemblies.", severity: "warning" },
      { sectionId: "ballastRestraint", message: "Ballast restraint detail should be reviewed at perimeter.", severity: "info" },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).",
      "Install drainage mat ({drainageMat}).",
      "Install XPS insulation ({insulation}).",
      "Install filter fabric above insulation.",
      "Install ballast ({ballast}).",
      "Install perimeter ballast restraint.",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane with ballast overburden",
      membraneExposure: "Protected",
      typicalInsulation: "XPS",
      commonSurfaces: ["River ballast stone", "Concrete pavers"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── Concrete Pavement Roof ────────────────────────────────────────────────────
  {
    systemId: "concrete",
    label: "Concrete Pavement Roof",
    category: "Hardscape Assembly",
    icon: "⬜",
    requiredSections: ["deck", "membrane", "protectionBoard", "drainageMat", "concretePavement", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "insulation", "reinforcement", "rootBarrier", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "reinforcement", "concretePavement"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" },
      { sectionId: "concretePavement", message: "Concrete pavement specification not provided.", severity: "error" },
      { sectionId: "protectionBoard", message: "Protection board not specified over membrane.", severity: "warning" },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection board ({protectionBoard}).",
      "Install drainage mat ({drainageMat}).",
      "Install insulation ({insulation}) where required.",
      "Install concrete pavement slab ({concretePavement}).",
      "Install saw-cut control joints.",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Buried membrane below concrete pavement slab",
      membraneExposure: "Buried",
      typicalInsulation: "XPS, none",
      commonSurfaces: ["Concrete pavement slab"],
      isProtectedMembrane: true,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── Standing Seam Metal ───────────────────────────────────────────────────────
  {
    systemId: "metal",
    label: "Standing Seam Metal",
    category: "Steep-Slope",
    icon: "🔩",
    requiredSections: ["deck", "membrane", "flashing", "drainage"],
    optionalSections: ["insulation", "vaporRetarder", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "membrane"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "Metal panel specification not provided.", severity: "error" },
      { sectionId: "flashing", message: "Flashing details not specified.", severity: "warning" },
    ],
    scopeTemplate: [
      "Install underlayment and vapor barrier.",
      "Install standing seam metal roofing panels ({membrane}).",
      "Install valley, ridge, and eave flashings.",
      "Install gutters and downspouts.",
    ],
    metadata: {
      assemblyType: "Standing seam metal panel system",
      membraneExposure: "Exposed",
      typicalInsulation: "Batt, Polyiso",
      commonSurfaces: ["Steel panels", "Aluminum panels"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: true,
      highTraffic: false,
      solarCompatible: true,
      coldApplied: false,
      typicalSlope: "3:12 min",
    },
  },

  // ── SPF ───────────────────────────────────────────────────────────────────────
  {
    systemId: "spf",
    label: "Spray Polyurethane Foam (SPF)",
    category: "Fluid-Applied",
    icon: "🟡",
    requiredSections: ["deck", "membrane", "surfacing", "drainage", "flashing"],
    optionalSections: ["insulation", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "insulation", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "SPF thickness and density not specified.", severity: "error" },
      { sectionId: "surfacing", message: "Protective coating/surfacing not specified — SPF requires UV protection.", severity: "error" },
    ],
    scopeTemplate: [
      "Prepare and clean existing substrate.",
      "Install spray polyurethane foam ({membrane}).",
      "Apply elastomeric protective coating ({surfacing}).",
      "Install flashing and roof drains.",
    ],
    metadata: {
      assemblyType: "Spray-applied closed-cell foam with protective coating",
      membraneExposure: "Exposed",
      typicalInsulation: "Integral to SPF",
      commonSurfaces: ["Elastomeric coating", "Granule-surfaced coating"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: true,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: false,
    },
  },

  // ── SBS IRMA / PMR ───────────────────────────────────────────────────────────
  {
    systemId: "sbs_irma",
    label: "SBS Mod-Bit IRMA / PMR",
    category: "Protected Membrane",
    icon: "🟫",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "SBS modified bitumen membrane not specified.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA/PMR assembly.", severity: "error" },
      { sectionId: "insulation", message: "Insulation above membrane not specified — required for IRMA.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric should be installed above insulation in IRMA assemblies.", severity: "warning" },
    ],
    scopeTemplate: [
      "Apply primer and install SBS modified bitumen base ply over structural deck.",
      "Install SBS modified bitumen finish ply.",
      "Install protection board ({protectionBoard}) above membrane.",
      "Install drainage mat ({drainageMat}) above membrane assembly.",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden (pavers / ballast).",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — SBS modified bitumen IRMA/PMR",
      membraneExposure: "Protected",
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Concrete pavers on pedestals", "Roofblok pavers", "River ballast"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── SBS IRMA Green Roof ───────────────────────────────────────────────────────
  {
    systemId: "sbs_irma_green",
    label: "SBS Mod-Bit IRMA Green Roof",
    category: "Protected Membrane",
    icon: "🌿",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "rootBarrier", "drainageLayer", "growingMedia", "greenRoof", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "irrigation", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "rootBarrier", "drainageMat", "insulation", "filterFabric", "drainageLayer", "growingMedia", "greenRoof"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "SBS modified bitumen membrane not specified.", severity: "error" },
      { sectionId: "rootBarrier", message: "Root barrier required for vegetated assemblies.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA green roof assembly.", severity: "error" },
      { sectionId: "insulation", message: "Insulation above membrane not specified.", severity: "error" },
      { sectionId: "growingMedia", message: "Growing media depth not specified.", severity: "warning" },
    ],
    scopeTemplate: [
      "Apply primer and install SBS modified bitumen base ply + finish ply over structural deck.",
      "Install root barrier / root-resistant sheet.",
      "Install drainage composite mat ({drainageMat}).",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install drainage/aggregate layer.",
      "Install growing media ({growingMedia}).",
      "Install vegetated green roof trays ({greenRoof}).",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — SBS mod-bit IRMA with vegetated overburden",
      membraneExposure: "Protected",
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Extensive green roof", "Pre-vegetated sedum trays", "Intensive planted"],
      isProtectedMembrane: true,
      isRecoverable: false,
      greenRoofCompatible: true,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: true,
    },
  },

  // ── APP IRMA / PMR ────────────────────────────────────────────────────────────
  {
    systemId: "app_irma",
    label: "APP Mod-Bit IRMA / PMR",
    category: "Protected Membrane",
    icon: "🟫",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "ballastRestraint", "penetrations", "edgeConditions"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals"],
    validationRules: [
      { sectionId: "deck", message: "Structural deck not selected — required for assembly validation.", severity: "error" },
      { sectionId: "membrane", message: "APP modified bitumen membrane not specified.", severity: "error" },
      { sectionId: "drainageMat", message: "Drainage mat required for IRMA/PMR assembly.", severity: "error" },
      { sectionId: "insulation", message: "Insulation above membrane not specified — required for IRMA.", severity: "error" },
      { sectionId: "filterFabric", message: "Filter fabric should be installed above insulation in IRMA assemblies.", severity: "warning" },
    ],
    scopeTemplate: [
      "Apply primer and install APP modified bitumen base ply (torch-applied) over structural deck.",
      "Install APP modified bitumen finish ply (torch-applied).",
      "Install protection board ({protectionBoard}) above membrane.",
      "Install drainage mat ({drainageMat}) above membrane assembly.",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden (pavers / ballast).",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — APP modified bitumen IRMA/PMR",
      membraneExposure: "Protected",
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Concrete pavers on pedestals", "River ballast"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highWindRated: false,
      highTraffic: true,
      solarCompatible: false,
      coldApplied: false,
    },
  },

  // ── Custom ────────────────────────────────────────────────────────────────────
  {
    systemId: "custom",
    label: "Custom / Other",
    category: "Custom",
    icon: "✏️",
    requiredSections: ["drainage", "flashing"],
    optionalSections: [
      "deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard",
      "burPlies", "capSheet", "surfacing", "membrane", "drainageMat",
      "filterFabric", "rootBarrier", "protectionBoard", "pedestals",
      "ballast", "ballastRestraint", "greenRoof", "growingMedia",
      "drainageLayer", "irrigation", "concretePavement", "reinforcement",
      "penetrations", "edgeConditions",
    ],
    defaultLayerOrder: ["deck", "insulation", "membrane"],
    validationRules: [],
    scopeTemplate: ["Perform roofing work per contract documents."],
    metadata: {
      assemblyType: "Custom or unlisted assembly",
      membraneExposure: "Exposed",
      typicalInsulation: "Varies",
      commonSurfaces: ["Varies"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: false,
      highTraffic: false,
      solarCompatible: false,
      coldApplied: false,
    },
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

export function getSystemConfig(systemId: string): RoofSystemConfig | undefined {
  return ROOF_SYSTEM_CONFIGS.find((c) => c.systemId === systemId);
}

export function getVisibleSections(config: RoofSystemConfig): SectionId[] {
  return [...config.requiredSections, ...config.optionalSections];
}

export function isHiddenSection(config: RoofSystemConfig, sectionId: SectionId): boolean {
  return !config.requiredSections.includes(sectionId) && !config.optionalSections.includes(sectionId);
}

// Returns capability/modifier badge labels for a system
export function getSystemBadges(config: RoofSystemConfig): string[] {
  const m = config.metadata;
  const badges: string[] = [];
  if (m.isProtectedMembrane) badges.push("PMR");
  if (m.irmaCompatible && !m.isProtectedMembrane) badges.push("IRMA Compatible");
  if (m.greenRoofCompatible) badges.push("Green Roof");
  if (m.isRecoverable) badges.push("Recoverable");
  if (m.highWindRated) badges.push("High Wind");
  if (m.highTraffic) badges.push("High Traffic");
  if (m.solarCompatible) badges.push("Solar Ready");
  if (m.coldApplied) badges.push("Cold Applied");
  return badges;
}

// ─── Deck intelligence ─────────────────────────────────────────────────────────

interface DeckWarning {
  message: string;
  severity: "error" | "warning" | "info";
}

// Warnings to show when selected deck is incompatible or unusual for a given system
const DECK_SYSTEM_WARNINGS: Record<string, Record<string, DeckWarning>> = {
  "Steel Deck": {
    lam_irma: {
      message: "IRMA/PMR cold-fluid systems are typically installed on concrete decks. Verify structural capacity and specify a primer compatible with steel substrate.",
      severity: "warning",
    },
    hydrotech: {
      message: "Hydrotech MM6125 is designed for concrete deck substrates. Verify compatibility with steel deck and specify surface conditioner.",
      severity: "warning",
    },
  },
  "Wood / Plywood": {
    bur: {
      message: "Hot-mopped BUR on wood decks requires fire resistance verification. Consider a cold-applied or torch-applied alternative.",
      severity: "warning",
    },
    lam: {
      message: "Fluid-applied membrane on wood substrate — verify manufacturer's surface preparation and primer requirements.",
      severity: "info",
    },
    lam_irma: {
      message: "IRMA/PMR cold-fluid systems are not compatible with wood substrates. Verify with manufacturer.",
      severity: "error",
    },
    hydrotech: {
      message: "Hydrotech MM6125 is not designed for wood deck substrates.",
      severity: "error",
    },
    paver_ped: {
      message: "Paver pedestal assemblies impose concentrated point loads — verify structural capacity of wood deck.",
      severity: "warning",
    },
    paver_bal: {
      message: "Ballasted assemblies impose significant dead loads — verify structural capacity of wood deck.",
      severity: "warning",
    },
    concrete: {
      message: "Concrete paving over wood deck — verify structural capacity for concrete dead load.",
      severity: "error",
    },
    green: {
      message: "Green roof assemblies require verification of saturated dead load. Wood decks rarely support intensive green roof loads.",
      severity: "error",
    },
  },
  "Gypsum Deck": {
    lam_irma: {
      message: "IRMA/PMR cold-fluid systems are not typical on gypsum decks. Verify structural capacity and manufacturer compatibility.",
      severity: "warning",
    },
    hydrotech: {
      message: "Hydrotech MM6125 not typical on gypsum deck substrates.",
      severity: "warning",
    },
  },
  "Tectum / Cementwood": {
    bur: {
      message: "Hot asphalt BUR not recommended on Tectum — verify fire resistance rating and hot asphalt adhesion.",
      severity: "warning",
    },
    lam_irma: {
      message: "Cold-fluid IRMA/PMR waterproofing not typical on Tectum decks. Verify compatibility with manufacturer.",
      severity: "warning",
    },
    lam: {
      message: "Fluid-applied membrane on Tectum/Cementwood — verify adhesion compatibility and primer requirements.",
      severity: "info",
    },
    hydrotech: {
      message: "Hydrotech MM6125 is not designed for Tectum/Cementwood substrates.",
      severity: "warning",
    },
    paver_ped: {
      message: "Paver pedestal point loads on Tectum — verify fastener pullout capacity.",
      severity: "warning",
    },
  },
  "Lightweight Concrete": {
    lam_irma: {
      message: "Verify that the LWIC substrate meets surface preparation and adhesion requirements for cold-fluid waterproofing.",
      severity: "info",
    },
    lam: {
      message: "Verify that the lightweight concrete substrate meets surface preparation requirements for fluid-applied membrane.",
      severity: "info",
    },
    paver_ped: {
      message: "Paver pedestal point loads on LWIC — verify fastener pullout values for selected LWIC system.",
      severity: "info",
    },
  },
};

export function getDeckCompatibilityWarning(
  deckType: string | null | undefined,
  systemId: string
): DeckWarning | null {
  if (!deckType || !systemId) return null;
  return DECK_SYSTEM_WARNINGS[deckType]?.[systemId] ?? null;
}

// ─── Smart presets ─────────────────────────────────────────────────────────────

export interface SmartPreset {
  id: string;
  label: string;
  description: string;
  systemId: string;
  sectionValues: SectionValues;
}

export const SMART_PRESETS: SmartPreset[] = [
  {
    id: "nyc_irma_plaza",
    label: "NYC IRMA Plaza Deck",
    description: "Cold fluid membrane · 7\" XPS · pedestal pavers",
    systemId: "lam_irma",
    sectionValues: {
      deck: "Concrete Deck",
      membrane: "Cold fluid-applied waterproofing membrane",
      protectionBoard: "Protection board / base sheet reinforcement",
      drainageMat: "Drainage mat as specified",
      insulation: "7\" XPS Plazamate XR (R-35)",
      filterFabric: true,
      pedestals: "Buzon DPH-1 adjustable pedestals",
      drainage: "Roof drains w/ overflow at +2\"",
      flashing: "24 ga. galv. sheet metal, min 8\" ht.",
    },
  },
  {
    id: "standard_tpo",
    label: "Standard Exposed TPO",
    description: "60 mil TPO · 3\" polyiso · DensDeck · steel deck",
    systemId: "tpo",
    sectionValues: {
      deck: "Steel Deck",
      insulation: "3\" Polyiso (R-19.5)",
      coverBoard: "1/2\" DensDeck Prime",
      membrane: "60 mil TPO mechanically attached",
      drainage: "Roof drains w/ overflow",
      flashing: "TPO-coated metal flashing, min 8\" ht.",
    },
  },
  {
    id: "green_roof",
    label: "Green Roof Assembly",
    description: "PMR · root barrier · drainage composite · sedum",
    systemId: "green",
    sectionValues: {
      deck: "Concrete Deck",
      membrane: "Fluid-applied waterproofing membrane",
      rootBarrier: true,
      protectionBoard: "Protection course",
      drainageMat: "Drainage composite mat",
      filterFabric: true,
      drainageLayer: "Drainage cell / LECA aggregate layer",
      growingMedia: "4\"-6\" extensive growing media",
      greenRoof: "Pre-vegetated sedum tray assembly",
      drainage: "Roof drains w/ overflow at +2\"",
      flashing: "Sheet metal flashing, min 8\" ht.",
    },
  },
  {
    id: "pmma_balcony",
    label: "PMMA Balcony Assembly",
    description: "Parapro® PMMA · reinforcement fleece · concrete deck",
    systemId: "lam",
    sectionValues: {
      deck: "Concrete Deck",
      membrane: "Siplast Parapro® PMMA liquid-applied membrane",
      coverBoard: "Pro Base TS + Pro Fleece reinforcement layer",
      insulation: "2\" XPS thermal break where req.",
      drainage: "Scupper or floor drain at low point",
      flashing: "PMMA-compatible flashing per manufacturer",
    },
  },
  {
    id: "ballasted_epdm",
    label: "Ballasted EPDM",
    description: "60 mil EPDM loose-laid · river stone ballast",
    systemId: "epdm",
    sectionValues: {
      deck: "Steel Deck",
      insulation: "2\" Polyiso (R-13)",
      membrane: "60 mil EPDM loose-laid",
      ballast: "1.5\" river stone, min 10 psf",
      drainage: "Roof drains w/ overflow at +2\"",
      flashing: "24 ga. galv. sheet metal, min 8\" ht.",
    },
  },
  {
    id: "recoverable_bur",
    label: "Recoverable BUR",
    description: "2-ply SBS + interply · polyiso · DensDeck",
    systemId: "bur",
    sectionValues: {
      deck: "Steel Deck",
      insulation: "3\" Polyiso (R-19.5)",
      coverBoard: "1/2\" DensDeck Prime",
      burPlies: "2-ply SBS + interply felt, hot asphalt",
      capSheet: "SBS mineral-surfaced granule cap sheet",
      drainage: "Roof drains w/ overflow",
      flashing: "24 ga. galv. sheet metal, min 8\" ht.",
    },
  },
];


// ─── Engine functions (pure — no Convex, instant) ─────────────────────────────

// validateAssembly — overloaded for backward compatibility.
// New call: validateAssembly({ system, drainageMat?, filterFabric?, insulationAboveMembrane? }) → ValidationIssue[]
// Old call: validateAssembly(config: RoofSystemConfig, values: SectionValues) → ValidationResult[]
export function validateAssembly(params: {
  system: AssemblySystem;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  insulationAboveMembrane?: boolean | null;
}): ValidationIssue[];
export function validateAssembly(
  config: RoofSystemConfig,
  values: SectionValues
): ValidationResult[];
export function validateAssembly(
  configOrParams:
    | { system: AssemblySystem; drainageMat?: boolean | null; filterFabric?: boolean | null; insulationAboveMembrane?: boolean | null }
    | RoofSystemConfig,
  values?: SectionValues
): ValidationIssue[] | ValidationResult[] {
  if (values !== undefined) {
    // Legacy call: (config, values) → ValidationResult[]
    const config = configOrParams as RoofSystemConfig;
    return config.validationRules
      .filter((rule) => {
        const val = values[rule.sectionId];
        return val === undefined || val === null || val === false || val === "";
      })
      .map((rule) => ({
        sectionId: rule.sectionId,
        message: rule.message,
        severity: rule.severity,
      }));
  }

  // New call: ({ system, drainageMat, filterFabric, insulationAboveMembrane }) → ValidationIssue[]
  const { system, drainageMat, filterFabric, insulationAboveMembrane } =
    configOrParams as {
      system: AssemblySystem;
      drainageMat?: boolean | null;
      filterFabric?: boolean | null;
      insulationAboveMembrane?: boolean | null;
    };
  const issues: ValidationIssue[] = [];

  if (system === "lam") {
    if (!drainageMat) {
      issues.push({
        severity: "info",
        code: "lam_drainage_review",
        message: "Drainage not specified — confirm drain type and overflow details.",
      });
    }
    return issues;
  }

  if (system === "lam_irma") {
    if (!drainageMat) {
      issues.push({
        severity: "error",
        code: "lam_irma_missing_drainage_mat",
        message: "IRMA/PMR assembly requires a drainage mat.",
      });
    }
    if (!filterFabric) {
      issues.push({
        severity: "error",
        code: "lam_irma_missing_filter_fabric",
        message: "IRMA/PMR assembly requires a filter fabric layer.",
      });
    }
    if (insulationAboveMembrane === false) {
      issues.push({
        severity: "error",
        code: "lam_irma_insulation_position",
        message: "IRMA/PMR assembly requires insulation above the waterproofing membrane.",
      });
    }
  }

  return issues;
}

export function generateLayerStack(
  config: RoofSystemConfig,
  values: SectionValues
): string[] {
  return config.defaultLayerOrder
    .filter((id) => {
      const val = values[id];
      return val !== undefined && val !== null && val !== false && val !== "";
    })
    .map((id) => {
      const def = SECTION_DEFS[id];
      const val = values[id];
      if (typeof val === "boolean") return def.label;
      return val ? `${def.label}: ${val}` : def.label;
    });
}

export function generateScope(
  config: RoofSystemConfig,
  values: SectionValues
): string[] {
  return config.scopeTemplate
    .map((line) => {
      return line.replace(/\{(\w+)\}/g, (_, id) => {
        const val = values[id as SectionId];
        if (!val || val === true) return "";
        return String(val);
      });
    })
    .filter((line) => {
      return !line.includes("()") && line.trim().length > 0;
    })
    .map((line) => line.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim());
}


/**
 * Maps a raw AI extraction result to normalised section values.
 * Single canonical function — no legacy path.
 */
export function mapAIResultToSectionValues(
  ai: AIAssemblyResult,
  ocrText?: string,
): AssemblySectionValues {
  // 1. Classify using layer signals + explicit flags (layers beat AI system hint)
  const assemblySystem = classifyAssemblySystem({
    ocrText,
    layers: ai.layers ?? undefined,
    drainageMat: ai.drainageMat,
    filterFabric: ai.filterFabric,
    surface: ai.surface,
    aiSystem: ai.system,
  });

  // 2. Classification audit — surface conflicts between AI hint and detected result
  const classificationAudit = buildClassificationAudit(
    { aiSystem: ai.system, layers: ai.layers, ocrText },
    assemblySystem,
  );

  // 3. Insulation fields
  const insulationType = ai.insulation ?? null;
  const insulationThickness = ai.thickness ?? null;
  const extractedR = ai.rValue ?? null;

  // 4. Thermal audit — compute expected R and flag conflicts
  const calculatedR =
    insulationType && insulationThickness
      ? (() => {
          const t = parseFloat(insulationThickness);
          return isNaN(t) ? null : Math.round(computeInsulationRValue(insulationType, t) * 10) / 10;
        })()
      : null;
  const thermalAudit: ThermalAudit = {
    insulationType,
    thickness: insulationThickness,
    extractedR,
    calculatedR,
    conflict:
      extractedR != null && calculatedR != null
        ? Math.abs(extractedR - calculatedR) > calculatedR * 0.2
        : false,
  };

  // 5. Format insulation label — never output "3 rigid" or "7 xps"
  const rValue = extractedR ?? calculatedR ?? null;
  const insulationLabel =
    insulationType || insulationThickness
      ? formatInsulationLabel(insulationType, insulationThickness, extractedR)
      : null;

  // 6. Validate
  const isIrmaType =
    assemblySystem === "lam_irma" ||
    assemblySystem === "sbs_irma" ||
    assemblySystem === "sbs_irma_green" ||
    assemblySystem === "app_irma";
  const validationIssues = validateAssembly({
    system: isIrmaType ? "lam_irma" : "lam",
    drainageMat: ai.drainageMat,
    filterFabric: ai.filterFabric,
    insulationAboveMembrane: isIrmaType ? true : undefined,
  });

  // 7. Preserve raw extraction
  const rawExtraction: RawExtraction = {
    sourceSystem: ai.system ?? null,
    drainageMat: ai.drainageMat ?? null,
    filterFabric: ai.filterFabric ?? null,
    layers: ai.layers ?? null,
    aiDescription: null,
  };

  return {
    assemblySystem,
    insulationLabel,
    insulationType,
    insulationThickness,
    rValue,
    validationIssues,
    classificationAudit,
    thermalAudit,
    rawExtraction,
  };
}
