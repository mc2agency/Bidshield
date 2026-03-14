// Master checklist template system — supports multiple trades with system/deck type filtering

// ===== TYPES =====

export interface ChecklistItemDef {
  id: string;
  text: string;
  systems?: string[]; // Only show for these system types. Omit = show for all.
  decks?: string[];   // Only show for these deck types. Omit = show for all.
  fmGlobal?: boolean; // Only show when building is FM Global insured.
  pre1990?: boolean;  // Only show when building was constructed before 1990.
  critical?: boolean; // Item-level critical flag (red border + bold text).
}

export interface ChecklistPhaseDef {
  key: string;
  title: string;
  icon: string;
  critical?: boolean;
  criticalRule?: string;
  items: ChecklistItemDef[];
}

export interface TradeConfig {
  id: string;
  label: string;
  available: boolean; // false = coming soon
  systemTypes: { id: string; label: string }[];
  deckTypes: { id: string; label: string }[];
}

// ===== TRADE CONFIGURATIONS =====

export const trades: TradeConfig[] = [
  {
    id: "roofing",
    label: "Commercial Roofing",
    available: true,
    systemTypes: [
      { id: "tpo", label: "TPO" },
      { id: "pvc", label: "PVC" },
      { id: "epdm", label: "EPDM" },
      { id: "sbs", label: "SBS Modified Bitumen" },
      { id: "app", label: "APP Modified Bitumen" },
      { id: "bur", label: "Built-Up Roofing (BUR)" },
      { id: "metal", label: "Standing Seam Metal" },
      { id: "spf", label: "Spray Foam (SPF)" },
    ],
    deckTypes: [
      { id: "steel", label: "Steel Deck" },
      { id: "concrete", label: "Concrete Deck" },
      { id: "wood", label: "Wood/Plywood Deck" },
      { id: "lightweight", label: "Lightweight Insulating Concrete" },
    ],
  },
  { id: "concrete", label: "Concrete / Masonry", available: false, systemTypes: [], deckTypes: [] },
  { id: "electrical", label: "Electrical", available: false, systemTypes: [], deckTypes: [] },
  { id: "hvac", label: "HVAC / Mechanical", available: false, systemTypes: [], deckTypes: [] },
  { id: "drywall", label: "Drywall / Metal Framing", available: false, systemTypes: [], deckTypes: [] },
  { id: "steel", label: "Structural Steel", available: false, systemTypes: [], deckTypes: [] },
  { id: "plumbing", label: "Plumbing", available: false, systemTypes: [], deckTypes: [] },
  { id: "insulation", label: "Insulation", available: false, systemTypes: [], deckTypes: [] },
  { id: "waterproofing", label: "Waterproofing", available: false, systemTypes: [], deckTypes: [] },
  { id: "painting", label: "Painting", available: false, systemTypes: [], deckTypes: [] },
];

// ===== ROOFING CHECKLIST (18 phases) =====
// Display order: 1-12, 17 (scope), 13-14 (pricing), 18 (general), 15-16 (submission)

const roofingPhases: Record<string, ChecklistPhaseDef> = {
  phase1: {
    key: "phase1",
    title: "Project Setup",
    icon: "📋",
    items: [
      { id: "p1-1", text: "Project name & address entered" },
      { id: "p1-2", text: "GC/Owner identified" },
      { id: "p1-3", text: "Bid date confirmed" },
      { id: "p1-4", text: "Bid time confirmed" },
      { id: "p1-5", text: "Delivery method noted (email/upload/hardcopy)" },
      { id: "p1-6", text: "Pre-bid meeting scheduled" },
      { id: "p1-7", text: "Site visit scheduled" },
    ],
  },
  phase2: {
    key: "phase2",
    title: "Document Receipt & Addenda",
    icon: "📁",
    items: [
      { id: "p2-1", text: "All addenda received" },
      { id: "p2-2", text: "Drawing set complete (A, S, M, P, E)" },
      { id: "p2-3", text: "Specifications received" },
      { id: "p2-4", text: "Owner's Project Requirements (OPR) received" },
      { id: "p2-5", text: "Bid form received" },
      { id: "p2-6", text: "Number of addenda confirmed with GC" },
      { id: "p2-7", text: "All addenda acknowledged on bid form" },
      { id: "p2-8", text: "Addenda changes incorporated into estimate" },
    ],
  },
  phase3: {
    key: "phase3",
    title: "Architectural Review",
    icon: "🏗️",
    items: [
      { id: "p3-1", text: "Roof plan reviewed - all levels" },
      { id: "p3-2", text: "Roof assembly types identified (RT-1, RT-2, etc.)" },
      { id: "p3-3", text: "Parapet heights & types noted" },
      { id: "p3-4", text: "Roof details reviewed (parapets, curbs, drains)" },
      { id: "p3-5", text: "Wall sections reviewed for flashing terminations" },
      { id: "p3-6", text: "Expansion joints identified" },
      { id: "p3-7", text: "Hatches & access points counted" },
      { id: "p3-8", text: "Roof slope direction confirmed" },
      { id: "p3-9", text: "Green roof areas identified (if applicable)" },
      { id: "p3-10", text: "Paver/walking pad areas identified" },
      { id: "p3-11", text: "Skylight locations and curb details identified" },
      { id: "p3-12", text: "Existing roof assembly confirmed (recover vs full tearoff)" },
      { id: "p3-pre90", text: "Designated Substance Survey required before pricing any tear-off scope", pre1990: true, critical: true },
    ],
  },
  phase4: {
    key: "phase4",
    title: "Structural Review",
    icon: "🔩",
    items: [
      { id: "p4-1", text: "Roof deck type confirmed (steel, concrete, wood)" },
      { id: "p4-2", text: "Deck gauge/thickness noted" },
      { id: "p4-3", text: "Structural penetrations identified" },
      { id: "p4-4", text: "Steel dunnage locations noted" },
      { id: "p4-5", text: "Equipment support framing identified" },
      { id: "p4-6", text: "Steel deck flute direction noted", decks: ["steel"] },
      { id: "p4-7", text: "Deck fastening pattern for wind uplift zones", decks: ["steel"] },
      { id: "p4-8", text: "Concrete deck moisture testing required?", decks: ["concrete", "lightweight"] },
      { id: "p4-9", text: "Lightweight concrete slope verified", decks: ["lightweight"] },
      { id: "p4-10", text: "Wood deck condition assessed / replacement scope", decks: ["wood"] },
      { id: "p4-11", text: "Wood nailer/blocking condition noted", decks: ["wood"] },
    ],
  },
  phase5: {
    key: "phase5",
    title: "Mechanical Review",
    icon: "⚙️",
    critical: true,
    criticalRule: "Mechanical curb misses cost $30K–$80K on average — verify every RTU curb height and dimensions against structural drawings",
    items: [
      { id: "p5-1", text: "RTU locations & curb sizes from schedule" },
      { id: "p5-2", text: "Exhaust fans counted & curb sizes noted" },
      { id: "p5-3", text: "Kitchen hoods & grease exhaust identified" },
      { id: "p5-4", text: "Ductwork penetrations noted" },
      { id: "p5-5", text: "Equipment supports/dunnage identified" },
      { id: "p5-6", text: "Future equipment provisions noted" },
    ],
  },
  phase6: {
    key: "phase6",
    title: "Plumbing Review",
    icon: "🔧",
    items: [
      { id: "p6-1", text: "Drain locations & sizes from schedule" },
      { id: "p6-2", text: "Overflow drains identified" },
      { id: "p6-3", text: "Roof drain bodies specified (cast iron/plastic)" },
      { id: "p6-4", text: "Vent penetrations counted" },
      { id: "p6-5", text: "Gas line penetrations identified" },
    ],
  },
  phase7: {
    key: "phase7",
    title: "Electrical Review",
    icon: "⚡",
    items: [
      { id: "p7-1", text: "Conduit penetrations counted" },
      { id: "p7-2", text: "Rooftop electrical equipment identified" },
      { id: "p7-3", text: "Lightning protection requirements noted" },
      { id: "p7-4", text: "Photovoltaic provisions identified" },
      { id: "p7-5", text: "Emergency power equipment noted" },
      { id: "p7-6", text: "Data, comm, and low-voltage penetrations counted" },
    ],
  },
  phase8: {
    key: "phase8",
    title: "Civil/Site Review",
    icon: "🏙️",
    items: [
      { id: "p8-1", text: "Site access reviewed" },
      { id: "p8-2", text: "Material staging area identified" },
      { id: "p8-3", text: "Crane/equipment placement noted" },
      { id: "p8-4", text: "DOT requirements checked (if applicable)" },
      { id: "p8-5", text: "Adjacent property constraints noted" },
      { id: "p8-6", text: "Working hours restrictions confirmed" },
      { id: "p8-7", text: "Delivery access and loading dock availability confirmed" },
    ],
  },
  phase9: {
    key: "phase9",
    title: "Specification Review",
    icon: "📖",
    critical: true,
    criticalRule: "Check warranty requirements — may require specific manufacturers!",
    items: [
      { id: "p9-1", text: "Roof section(s) identified in spec" },
      { id: "p9-2", text: "Manufacturer requirements noted" },
      { id: "p9-3", text: "Warranty requirements (NDL, duration)" },
      { id: "p9-4", text: "Approved product submittals listed" },
      { id: "p9-5", text: "Installation requirements noted" },
      { id: "p9-6", text: "Testing requirements (flood, adhesion)" },
      { id: "p9-7", text: "Special inspections required?" },
      { id: "p9-8", text: "Weld test / seam test requirements noted", systems: ["tpo", "pvc"] },
      { id: "p9-9", text: "Torch application safety requirements", systems: ["sbs", "app", "bur"] },
      { id: "p9-10", text: "Metal panel gauge, profile & finish specified", systems: ["metal"] },
      { id: "p9-11", text: "SPF density, thickness & coating requirements", systems: ["spf"] },
      { id: "p9-12", text: "EPDM adhesive & seam tape requirements", systems: ["epdm"] },
      { id: "p9-13", text: "Mock-up / test area required per spec?" },
      { id: "p9-fm1", text: "System verified via RoofNav before specifying", fmGlobal: true },
      { id: "p9-fm2", text: "FM rating confirmed (1-60, 1-90, or 1-120)", fmGlobal: true },
      { id: "p9-fm3", text: "No mixing components between FM-approved assemblies", fmGlobal: true },
    ],
  },
  phase10: {
    key: "phase10",
    title: "Takeoff - Areas",
    icon: "📐",
    items: [
      { id: "p10-1", text: "Field area measured by assembly type" },
      { id: "p10-2", text: "Tapered insulation areas calculated" },
      { id: "p10-3", text: "Green roof areas measured" },
      { id: "p10-4", text: "Paver/walking pad areas measured" },
      { id: "p10-5", text: "Traffic coating areas measured" },
    ],
  },
  phase11: {
    key: "phase11",
    title: "Takeoff - Linear",
    icon: "📏",
    items: [
      { id: "p11-1", text: "Perimeter edge metal measured" },
      { id: "p11-2", text: "Parapet cap/coping measured" },
      { id: "p11-3", text: "Wall flashings measured" },
      { id: "p11-4", text: "Expansion joint covers measured" },
      { id: "p11-5", text: "Curb flashings calculated" },
      { id: "p11-6", text: "Termination bars measured" },
    ],
  },
  phase12: {
    key: "phase12",
    title: "Takeoff - Counts",
    icon: "🔢",
    items: [
      { id: "p12-1", text: "Roof drains counted by size" },
      { id: "p12-2", text: "Overflow drains counted" },
      { id: "p12-3", text: "Pitch pans counted by size" },
      { id: "p12-4", text: "Pipe boots counted by size" },
      { id: "p12-5", text: "Equipment curbs counted" },
      { id: "p12-6", text: "Roof hatches counted" },
      { id: "p12-7", text: "Smoke vents counted" },
    ],
  },
  // Scope boundaries — after takeoff, before pricing
  phase17: {
    key: "phase17",
    title: "Scope Boundaries & Exclusions",
    icon: "🔍",
    critical: true,
    criticalRule: "Unclear scope boundaries are the #1 source of post-award disputes!",
    items: [
      { id: "p17-1", text: "Wood blocking — who provides & installs?" },
      { id: "p17-2", text: "Curb fabrication vs curb flashing — scope clear?" },
      { id: "p17-3", text: "Roof drain bodies — who furnishes & installs?" },
      { id: "p17-4", text: "Coping / edge metal — who provides?" },
      { id: "p17-5", text: "Lightning protection coordination noted" },
      { id: "p17-6", text: "Skylight curbs / frames — scope clear?" },
      { id: "p17-7", text: "Equipment screens / dunnage — scope clear?" },
      { id: "p17-8", text: "Tear-off scope defined (layers, disposal, recycling)" },
      { id: "p17-9", text: "All exclusions listed in proposal" },
      { id: "p17-10", text: "Alternates identified and priced separately" },
    ],
  },
  phase13: {
    key: "phase13",
    title: "Pricing - Materials",
    icon: "💵",
    items: [
      { id: "p13-1", text: "All vendor quotes current & valid" },
      { id: "p13-2", text: "Waste factors applied" },
      { id: "p13-3", text: "Freight costs included" },
      { id: "p13-4", text: "Tax calculated correctly" },
      { id: "p13-5", text: "Coverage rates verified" },
      { id: "p13-6", text: "Adhesive/bonding agent quantities calculated", systems: ["tpo", "pvc", "epdm"] },
      { id: "p13-7", text: "Asphalt/bitumen quantities calculated", systems: ["sbs", "app", "bur"] },
      { id: "p13-8", text: "Metal panel clips & fastener quantities", systems: ["metal"] },
      { id: "p13-9", text: "SPF foam & coating quantities calculated", systems: ["spf"] },
      { id: "p13-10", text: "Material lead times checked (note if >3 weeks)" },
    ],
  },
  phase14: {
    key: "phase14",
    title: "Pricing - Labor",
    icon: "👷",
    critical: true,
    criticalRule: "Include full labor burden (WC, taxes, benefits)!",
    items: [
      { id: "p14-1", text: "Production rates realistic for scope" },
      { id: "p14-2", text: "Labor burden calculated (WC, FICA, UI)" },
      { id: "p14-3", text: "Overtime considered if needed" },
      { id: "p14-4", text: "Mobilization included" },
      { id: "p14-5", text: "Weather contingency considered" },
      { id: "p14-6", text: "Crane/equipment time included" },
      { id: "p14-7", text: "Welding/seaming productivity adjusted for size", systems: ["tpo", "pvc"] },
      { id: "p14-8", text: "Torch crew rates and hot work permit time", systems: ["sbs", "app", "bur"] },
      { id: "p14-9", text: "Metal panel install crew rates", systems: ["metal"] },
      { id: "p14-10", text: "SPF spray crew rates & overspray protection time", systems: ["spf"] },
    ],
  },
  // General conditions — after pricing, before submission
  phase18: {
    key: "phase18",
    title: "General Conditions & Overhead",
    icon: "📊",
    items: [
      { id: "p18-1", text: "Dumpster / disposal costs included" },
      { id: "p18-2", text: "Crane / hoist rental costs included" },
      { id: "p18-3", text: "Temporary weather protection included" },
      { id: "p18-4", text: "Permit costs included" },
      { id: "p18-5", text: "Builders risk / additional insured requirements" },
      { id: "p18-6", text: "Project-specific insurance costs" },
      { id: "p18-7", text: "Mobilization / demobilization costs" },
      { id: "p18-8", text: "Daily cleanup & protection of adjacent work" },
      { id: "p18-9", text: "Overhead & profit markup applied" },
      { id: "p18-10", text: "Bond premium included (if required)" },
    ],
  },
  phase15: {
    key: "phase15",
    title: "Pre-Submission Review",
    icon: "✅",
    items: [
      { id: "p15-1", text: "All RFIs answered" },
      { id: "p15-2", text: "Scope clarifications documented" },
      { id: "p15-3", text: "Exclusions clearly stated" },
      { id: "p15-4", text: "Alternates priced (if requested)" },
      { id: "p15-5", text: "Bond requirements addressed" },
      { id: "p15-6", text: "Insurance requirements reviewed" },
      { id: "p15-7", text: "Bid form completed correctly" },
    ],
  },
  phase16: {
    key: "phase16",
    title: "Bid Submission",
    icon: "🚀",
    items: [
      { id: "p16-1", text: "Final number reviewed & approved" },
      { id: "p16-2", text: "Bid submitted before deadline" },
      { id: "p16-3", text: "Confirmation of receipt obtained" },
      { id: "p16-4", text: "Copy saved to project file" },
      { id: "p16-5", text: "Sub-bid deadline confirmed (if using subcontractors)" },
    ],
  },
};

// ===== UNIVERSAL PHASES (for trades without full checklists yet) =====

const universalPhases: Record<string, ChecklistPhaseDef> = {
  phase1: {
    key: "phase1",
    title: "Project Setup",
    icon: "📋",
    items: [
      { id: "p1-1", text: "Project name & address entered" },
      { id: "p1-2", text: "GC/Owner identified" },
      { id: "p1-3", text: "Bid date confirmed" },
      { id: "p1-4", text: "Bid time confirmed" },
      { id: "p1-5", text: "Delivery method noted (email/upload/hardcopy)" },
      { id: "p1-6", text: "Pre-bid meeting scheduled" },
      { id: "p1-7", text: "Site visit scheduled" },
    ],
  },
  phase2: {
    key: "phase2",
    title: "Document Receipt & Addenda",
    icon: "📁",
    items: [
      { id: "p2-1", text: "All addenda received" },
      { id: "p2-2", text: "Drawing set complete" },
      { id: "p2-3", text: "Specifications received" },
      { id: "p2-5", text: "Bid form received" },
      { id: "p2-6", text: "Number of addenda confirmed with GC" },
      { id: "p2-7", text: "All addenda acknowledged on bid form" },
      { id: "p2-8", text: "Addenda changes incorporated into estimate" },
      { id: "p2-pre90", text: "Designated Substance Survey required before pricing any tear-off scope", pre1990: true, critical: true },
    ],
  },
  phase9: {
    key: "phase9",
    title: "Specification Review",
    icon: "📖",
    critical: true,
    criticalRule: "Check warranty and special requirements carefully!",
    items: [
      { id: "p9-1", text: "Trade section(s) identified in spec" },
      { id: "p9-2", text: "Manufacturer requirements noted" },
      { id: "p9-3", text: "Warranty requirements noted" },
      { id: "p9-4", text: "Approved product submittals listed" },
      { id: "p9-5", text: "Installation requirements noted" },
      { id: "p9-6", text: "Testing requirements noted" },
      { id: "p9-7", text: "Special inspections required?" },
      { id: "p9-fm1", text: "System verified via RoofNav before specifying", fmGlobal: true },
      { id: "p9-fm2", text: "FM rating confirmed (1-60, 1-90, or 1-120)", fmGlobal: true },
      { id: "p9-fm3", text: "No mixing components between FM-approved assemblies", fmGlobal: true },
    ],
  },
  phase17: {
    key: "phase17",
    title: "Scope Boundaries & Exclusions",
    icon: "🔍",
    critical: true,
    criticalRule: "Unclear scope boundaries cause post-award disputes!",
    items: [
      { id: "p17-9", text: "All exclusions listed in proposal" },
      { id: "p17-10", text: "Alternates identified and priced separately" },
    ],
  },
  phase13: {
    key: "phase13",
    title: "Pricing - Materials",
    icon: "💵",
    items: [
      { id: "p13-1", text: "All vendor quotes current & valid" },
      { id: "p13-2", text: "Waste factors applied" },
      { id: "p13-3", text: "Freight costs included" },
      { id: "p13-4", text: "Tax calculated correctly" },
    ],
  },
  phase14: {
    key: "phase14",
    title: "Pricing - Labor",
    icon: "👷",
    critical: true,
    criticalRule: "Include full labor burden (WC, taxes, benefits)!",
    items: [
      { id: "p14-1", text: "Production rates realistic for scope" },
      { id: "p14-2", text: "Labor burden calculated (WC, FICA, UI)" },
      { id: "p14-3", text: "Overtime considered if needed" },
      { id: "p14-4", text: "Mobilization included" },
    ],
  },
  phase18: {
    key: "phase18",
    title: "General Conditions & Overhead",
    icon: "📊",
    items: [
      { id: "p18-1", text: "Dumpster / disposal costs included" },
      { id: "p18-4", text: "Permit costs included" },
      { id: "p18-5", text: "Insurance requirements reviewed" },
      { id: "p18-9", text: "Overhead & profit markup applied" },
      { id: "p18-10", text: "Bond premium included (if required)" },
    ],
  },
  phase15: {
    key: "phase15",
    title: "Pre-Submission Review",
    icon: "✅",
    items: [
      { id: "p15-1", text: "All RFIs answered" },
      { id: "p15-2", text: "Scope clarifications documented" },
      { id: "p15-3", text: "Exclusions clearly stated" },
      { id: "p15-4", text: "Alternates priced (if requested)" },
      { id: "p15-5", text: "Bond requirements addressed" },
      { id: "p15-6", text: "Insurance requirements reviewed" },
      { id: "p15-7", text: "Bid form completed correctly" },
    ],
  },
  phase16: {
    key: "phase16",
    title: "Bid Submission",
    icon: "🚀",
    items: [
      { id: "p16-1", text: "Final number reviewed & approved" },
      { id: "p16-2", text: "Bid submitted before deadline" },
      { id: "p16-3", text: "Confirmation of receipt obtained" },
      { id: "p16-4", text: "Copy saved to project file" },
      { id: "p16-5", text: "Sub-bid deadline confirmed (if using subcontractors)" },
    ],
  },
};

// ===== CHECKLIST BUILDER =====

function filterItems(
  items: ChecklistItemDef[],
  systemType?: string,
  deckType?: string,
  fmGlobal?: boolean,
  pre1990?: boolean
): ChecklistItemDef[] {
  return items.filter(item => {
    // If item is system-specific, only include when matching system is selected
    if (item.systems) {
      if (!systemType || !item.systems.includes(systemType)) return false;
    }
    // If item is deck-specific, only include when matching deck is selected
    if (item.decks) {
      if (!deckType || !item.decks.includes(deckType)) return false;
    }
    // FM Global items only shown when building is FM Global insured
    if (item.fmGlobal) {
      if (!fmGlobal) return false;
    }
    // Pre-1990 items only shown when building was constructed before 1990
    if (item.pre1990) {
      if (!pre1990) return false;
    }
    return true;
  });
}

export function getChecklistForTrade(
  trade: string,
  systemType?: string,
  deckType?: string,
  fmGlobal?: boolean,
  pre1990?: boolean
): Record<string, ChecklistPhaseDef> {
  let sourcePhases: Record<string, ChecklistPhaseDef>;

  switch (trade) {
    case "roofing":
      sourcePhases = roofingPhases;
      break;
    default:
      sourcePhases = universalPhases;
      break;
  }

  const result: Record<string, ChecklistPhaseDef> = {};
  for (const [key, phase] of Object.entries(sourcePhases)) {
    const filteredItems = filterItems(phase.items, systemType, deckType, fmGlobal, pre1990);
    if (filteredItems.length > 0) {
      result[key] = { ...phase, items: filteredItems };
    }
  }

  return result;
}

// Backward compatibility — default roofing checklist (no system/deck filter)
export const masterChecklist = getChecklistForTrade("roofing");

// ===== LABOR RATE DEFAULTS =====

export const defaultLaborRates = {
  membrane: [
    { task: "TPO/PVC Install (mechanically attached)", rate: "450 SF", unit: "/day", crew: 4, notes: "Standard conditions" },
    { task: "TPO/PVC Install (fully adhered)", rate: "350 SF", unit: "/day", crew: 4, notes: "Standard conditions" },
    { task: "EPDM Install (ballasted)", rate: "600 SF", unit: "/day", crew: 4, notes: "Includes stone" },
    { task: "Modified Bitumen (torch)", rate: "400 SF", unit: "/day", crew: 3, notes: "2-ply system" },
    { task: "Modified Bitumen (cold)", rate: "500 SF", unit: "/day", crew: 3, notes: "2-ply system" },
  ],
  insulation: [
    { task: "Polyiso (1 layer)", rate: "800 SF", unit: "/day", crew: 4, notes: "Mechanically attached" },
    { task: "Polyiso (2 layers)", rate: "500 SF", unit: "/day", crew: 4, notes: "Staggered joints" },
    { task: "Tapered System", rate: "400 SF", unit: "/day", crew: 4, notes: "Includes layout" },
    { task: "Cover Board Install", rate: "600 SF", unit: "/day", crew: 4, notes: "HD ISO or gypsum" },
  ],
  flashing: [
    { task: "Wall Flashing", rate: "100 LF", unit: "/day", crew: 2, notes: "Standard height" },
    { task: "Edge Metal", rate: "150 LF", unit: "/day", crew: 2, notes: "Fascia or gravel stop" },
    { task: "Coping Cap", rate: "80 LF", unit: "/day", crew: 2, notes: "2-piece system" },
    { task: "Curb Flashing", rate: "6 EA", unit: "/day", crew: 2, notes: "Standard curb" },
  ],
  accessories: [
    { task: "Roof Drain Install", rate: "4 EA", unit: "/day", crew: 2, notes: "New construction" },
    { task: "Pitch Pan", rate: "8 EA", unit: "/day", crew: 2, notes: "Standard size" },
    { task: "Pipe Boot", rate: "12 EA", unit: "/day", crew: 2, notes: "Prefab boot" },
    { task: "Equipment Curb", rate: "2 EA", unit: "/day", crew: 3, notes: "Includes flashing" },
  ],
};

// ===== VENDOR CATEGORIES =====

export const vendorCategories = [
  "insulation",
  "membrane",
  "sheet_metal",
  "fasteners",
  "adhesives",
  "coatings",
  "accessories",
  "equipment_rental",
];
