// Master checklist template - 16 phases for commercial roofing bids

export interface ChecklistItemDef {
  id: string;
  text: string;
}

export interface ChecklistPhaseDef {
  key: string;
  title: string;
  icon: string;
  critical?: boolean;
  criticalRule?: string;
  items: ChecklistItemDef[];
}

export const masterChecklist: Record<string, ChecklistPhaseDef> = {
  phase1: {
    key: "phase1",
    title: "Phase 1: Project Setup",
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
    title: "Phase 2: Document Receipt",
    icon: "📁",
    items: [
      { id: "p2-1", text: "All addenda received" },
      { id: "p2-2", text: "Drawing set complete (A, S, M, P, E)" },
      { id: "p2-3", text: "Specifications received" },
      { id: "p2-4", text: "Geotechnical report (if applicable)" },
      { id: "p2-5", text: "Bid form received" },
    ],
  },
  phase3: {
    key: "phase3",
    title: "Phase 3: Architectural Review",
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
    ],
  },
  phase4: {
    key: "phase4",
    title: "Phase 4: Structural Review",
    icon: "🔩",
    items: [
      { id: "p4-1", text: "Roof deck type confirmed (steel, concrete, wood)" },
      { id: "p4-2", text: "Deck gauge/thickness noted" },
      { id: "p4-3", text: "Structural penetrations identified" },
      { id: "p4-4", text: "Steel dunnage locations noted" },
      { id: "p4-5", text: "Equipment support framing identified" },
    ],
  },
  phase5: {
    key: "phase5",
    title: "Phase 5: Mechanical Review",
    icon: "⚙️",
    critical: true,
    criticalRule: "⚠️ CRITICAL: ALWAYS trust equipment schedule over plan graphics for curb sizes!",
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
    title: "Phase 6: Plumbing Review",
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
    title: "Phase 7: Electrical Review",
    icon: "⚡",
    items: [
      { id: "p7-1", text: "Conduit penetrations counted" },
      { id: "p7-2", text: "Rooftop electrical equipment identified" },
      { id: "p7-3", text: "Lightning protection requirements noted" },
      { id: "p7-4", text: "Photovoltaic provisions identified" },
      { id: "p7-5", text: "Emergency power equipment noted" },
    ],
  },
  phase8: {
    key: "phase8",
    title: "Phase 8: Civil/Site Review",
    icon: "🏙️",
    items: [
      { id: "p8-1", text: "Site access reviewed" },
      { id: "p8-2", text: "Material staging area identified" },
      { id: "p8-3", text: "Crane/equipment placement noted" },
      { id: "p8-4", text: "DOT requirements checked (if applicable)" },
      { id: "p8-5", text: "Adjacent property constraints noted" },
    ],
  },
  phase9: {
    key: "phase9",
    title: "Phase 9: Specification Review",
    icon: "📖",
    critical: true,
    criticalRule: "⚠️ CRITICAL: Check warranty requirements - may require specific manufacturers!",
    items: [
      { id: "p9-1", text: "Roof section(s) identified in spec" },
      { id: "p9-2", text: "Manufacturer requirements noted" },
      { id: "p9-3", text: "Warranty requirements (NDL, duration)" },
      { id: "p9-4", text: "Approved product submittals listed" },
      { id: "p9-5", text: "Installation requirements noted" },
      { id: "p9-6", text: "Testing requirements (flood, adhesion)" },
      { id: "p9-7", text: "Special inspections required?" },
    ],
  },
  phase10: {
    key: "phase10",
    title: "Phase 10: Takeoff - Areas",
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
    title: "Phase 11: Takeoff - Linear",
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
    title: "Phase 12: Takeoff - Counts",
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
  phase13: {
    key: "phase13",
    title: "Phase 13: Pricing - Materials",
    icon: "💵",
    items: [
      { id: "p13-1", text: "All vendor quotes current & valid" },
      { id: "p13-2", text: "Waste factors applied" },
      { id: "p13-3", text: "Freight costs included" },
      { id: "p13-4", text: "Tax calculated correctly" },
      { id: "p13-5", text: "Coverage rates verified" },
    ],
  },
  phase14: {
    key: "phase14",
    title: "Phase 14: Pricing - Labor",
    icon: "👷",
    critical: true,
    criticalRule: "⚠️ CRITICAL: Include full labor burden (WC, taxes, benefits)!",
    items: [
      { id: "p14-1", text: "Production rates realistic for scope" },
      { id: "p14-2", text: "Labor burden calculated (WC, FICA, UI)" },
      { id: "p14-3", text: "Overtime considered if needed" },
      { id: "p14-4", text: "Mobilization included" },
      { id: "p14-5", text: "Weather contingency considered" },
      { id: "p14-6", text: "Crane/equipment time included" },
    ],
  },
  phase15: {
    key: "phase15",
    title: "Phase 15: Pre-Submission",
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
    title: "Phase 16: Bid Submission",
    icon: "🚀",
    items: [
      { id: "p16-1", text: "Final number reviewed & approved" },
      { id: "p16-2", text: "Bid submitted before deadline" },
      { id: "p16-3", text: "Confirmation of receipt obtained" },
      { id: "p16-4", text: "Copy saved to project file" },
    ],
  },
};
