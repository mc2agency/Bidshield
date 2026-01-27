import type {
  Project,
  ChecklistPhase,
  VendorGroup,
  LaborRate,
  MaterialPrice,
} from "@/lib/bidshield/types";

export const demoProjects: Project[] = [
  {
    id: "1",
    name: "550 Harbor Point Tower",
    location: "Jersey City, NJ",
    bid_date: "2026-02-10",
    status: "In Progress",
    progress: 68,
    gc: "Meridian Builders Corp",
    sqft: 15000,
    assemblies: ["RT-1 IRMA", "RT-2 Green Roof", "Traffic Coating"],
    user_id: "demo",
    created_at: "2025-01-01",
  },
  {
    id: "2",
    name: "Riverside Medical Center",
    location: "Newark, NJ",
    bid_date: "2026-02-22",
    status: "Setup",
    progress: 15,
    gc: "Atlantic Construction Group",
    sqft: 8500,
    assemblies: ["Modified Bitumen", "IRMA Ballasted"],
    user_id: "demo",
    created_at: "2025-01-05",
  },
];

export const masterChecklist: Record<string, ChecklistPhase> = {
  phase1: {
    key: "phase1",
    title: "Phase 1: Project Setup",
    icon: "📋",
    items: [
      { id: "p1-1", text: "Project name & address entered", status: "done" },
      { id: "p1-2", text: "GC/Owner identified", status: "done" },
      { id: "p1-3", text: "Bid date confirmed", status: "done" },
      { id: "p1-4", text: "Bid time confirmed", status: "done" },
      { id: "p1-5", text: "Delivery method noted (email/upload/hardcopy)", status: "done" },
      { id: "p1-6", text: "Pre-bid meeting scheduled", status: "pending" },
      { id: "p1-7", text: "Site visit scheduled", status: "pending" },
    ],
  },
  phase2: {
    key: "phase2",
    title: "Phase 2: Document Receipt",
    icon: "📁",
    items: [
      { id: "p2-1", text: "All addenda received", status: "done" },
      { id: "p2-2", text: "Drawing set complete (A, S, M, P, E)", status: "done" },
      { id: "p2-3", text: "Specifications received", status: "done" },
      { id: "p2-4", text: "Geotechnical report (if applicable)", status: "na" },
      { id: "p2-5", text: "Bid form received", status: "done" },
    ],
  },
  phase3: {
    key: "phase3",
    title: "Phase 3: Architectural Review",
    icon: "🏗️",
    items: [
      { id: "p3-1", text: "Roof plan reviewed - all levels", status: "done" },
      { id: "p3-2", text: "Roof assembly types identified (RT-1, RT-2, etc.)", status: "done" },
      { id: "p3-3", text: "Parapet heights & types noted", status: "done" },
      { id: "p3-4", text: "Roof details reviewed (parapets, curbs, drains)", status: "done" },
      { id: "p3-5", text: "Wall sections reviewed for flashing terminations", status: "done" },
      { id: "p3-6", text: "Expansion joints identified", status: "pending" },
      { id: "p3-7", text: "Hatches & access points counted", status: "done" },
      { id: "p3-8", text: "Roof slope direction confirmed", status: "done" },
      { id: "p3-9", text: "Green roof areas identified (if applicable)", status: "done" },
      { id: "p3-10", text: "Paver/walking pad areas identified", status: "done" },
    ],
  },
  phase4: {
    key: "phase4",
    title: "Phase 4: Structural Review",
    icon: "🔩",
    items: [
      { id: "p4-1", text: "Roof deck type confirmed (steel, concrete, wood)", status: "done" },
      { id: "p4-2", text: "Deck gauge/thickness noted", status: "done" },
      { id: "p4-3", text: "Structural penetrations identified", status: "done" },
      { id: "p4-4", text: "Steel dunnage locations noted", status: "pending" },
      { id: "p4-5", text: "Equipment support framing identified", status: "done" },
    ],
  },
  phase5: {
    key: "phase5",
    title: "Phase 5: Mechanical Review",
    icon: "⚙️",
    critical: true,
    criticalRule: "⚠️ CRITICAL: ALWAYS trust equipment schedule over plan graphics for curb sizes!",
    items: [
      { id: "p5-1", text: "Equipment schedule reviewed (NOT plan graphics)", status: "done" },
      { id: "p5-2", text: "All curb sizes extracted from schedule", status: "done" },
      { id: "p5-3", text: "RTU count & sizes", status: "done" },
      { id: "p5-4", text: "ERV/HRV count & sizes", status: "done" },
      { id: "p5-5", text: "AHU count & sizes", status: "done" },
      { id: "p5-6", text: "Exhaust fan count & sizes", status: "done" },
      { id: "p5-7", text: "VRF/condensing unit count & sizes", status: "done" },
      { id: "p5-8", text: "Ductwork penetrations identified", status: "pending" },
      { id: "p5-9", text: "Refrigerant line penetrations identified", status: "pending" },
      { id: "p5-10", text: "Curb flashing linear feet calculated", status: "done" },
    ],
  },
  phase6: {
    key: "phase6",
    title: "Phase 6: Plumbing Review",
    icon: "🚰",
    items: [
      { id: "p6-1", text: "Roof drain schedule reviewed", status: "rfi" },
      { id: "p6-2", text: "Primary drain count & sizes", status: "done" },
      { id: "p6-3", text: "Overflow drain count & sizes", status: "done" },
      { id: "p6-4", text: "Drain leader sizes noted", status: "rfi" },
      { id: "p6-5", text: "Condensate drain penetrations", status: "pending" },
      { id: "p6-6", text: "Plumbing vent locations", status: "done" },
      { id: "p6-7", text: "Test plugs required?", status: "pending" },
    ],
  },
  phase7: {
    key: "phase7",
    title: "Phase 7: Electrical Review",
    icon: "⚡",
    items: [
      { id: "p7-1", text: "Conduit penetrations identified", status: "done" },
      { id: "p7-2", text: "Electrical equipment on roof", status: "done" },
      { id: "p7-3", text: "Lightning protection (if applicable)", status: "na" },
      { id: "p7-4", text: "Rooftop lighting", status: "done" },
      { id: "p7-5", text: "Solar panel provisions (if applicable)", status: "na" },
    ],
  },
  phase8: {
    key: "phase8",
    title: "Phase 8: Civil/Site/DOT Review",
    icon: "🚧",
    items: [
      { id: "p8-1", text: "Site access evaluated", status: "done" },
      { id: "p8-2", text: "Staging area identified", status: "done" },
      { id: "p8-3", text: "Material delivery route", status: "pending" },
      { id: "p8-4", text: "Crane placement options", status: "pending" },
      { id: "p8-5", text: "Sidewalk bridge required?", status: "rfi" },
      { id: "p8-6", text: "Street closure required?", status: "rfi" },
      { id: "p8-7", text: "DOT permits needed?", status: "pending" },
      { id: "p8-8", text: "Building occupied during work?", status: "done" },
    ],
  },
  phase9: {
    key: "phase9",
    title: "Phase 9: Specification Review",
    icon: "📖",
    items: [
      { id: "p9-1", text: "Section 07 52 00 - Modified Bitumen", status: "done" },
      { id: "p9-2", text: "Section 07 55 00 - Protected Membrane", status: "done" },
      { id: "p9-3", text: "Section 07 14 00 - Fluid Applied WP", status: "done" },
      { id: "p9-4", text: "Section 07 62 00 - Sheet Metal", status: "done" },
      { id: "p9-5", text: "Section 32 84 00 - Planting (Green Roof)", status: "done" },
      { id: "p9-6", text: "Manufacturers identified & matched to products", status: "done" },
      { id: "p9-7", text: "Warranty requirements noted", status: "done" },
      { id: "p9-8", text: "Submittal requirements noted", status: "done" },
    ],
  },
  phase10: {
    key: "phase10",
    title: "Phase 10: Takeoff - Areas",
    icon: "📐",
    items: [
      { id: "p10-1", text: "Zones identified & measured", status: "done" },
      { id: "p10-2", text: "Area by assembly type (RT-1, RT-2, etc.)", status: "done" },
      { id: "p10-3", text: "Horizontal vs sloped areas", status: "done" },
      { id: "p10-4", text: "Parapet face areas", status: "done" },
      { id: "p10-5", text: "Zoning reconciliation (areas match total)", status: "done" },
      { id: "p10-6", text: "Green roof area", status: "done" },
      { id: "p10-7", text: "Paver area", status: "done" },
    ],
  },
  phase11: {
    key: "phase11",
    title: "Phase 11: Takeoff - Linear",
    icon: "📏",
    items: [
      { id: "p11-1", text: "Perimeter/coping length", status: "done" },
      { id: "p11-2", text: "Parapet flashing (by height)", status: "done" },
      { id: "p11-3", text: "Wall flashing", status: "done" },
      { id: "p11-4", text: "Curb flashing (from schedule)", status: "done" },
      { id: "p11-5", text: "Expansion joint length", status: "pending" },
      { id: "p11-6", text: "Edge metal", status: "done" },
      { id: "p11-7", text: "Reglet/counterflashing", status: "done" },
    ],
  },
  phase12: {
    key: "phase12",
    title: "Phase 12: Takeoff - Counts",
    icon: "🔢",
    items: [
      { id: "p12-1", text: "Roof drains (primary)", status: "done" },
      { id: "p12-2", text: "Roof drains (overflow)", status: "done" },
      { id: "p12-3", text: "Penetrations (pipes, vents)", status: "done" },
      { id: "p12-4", text: "Equipment curbs (by size from schedule)", status: "done" },
      { id: "p12-5", text: "Hatches", status: "done" },
      { id: "p12-6", text: "Pitch pans", status: "pending" },
      { id: "p12-7", text: "Pedestals (for pavers)", status: "done" },
    ],
  },
  phase13: {
    key: "phase13",
    title: "Phase 13: Pricing - Materials",
    icon: "💰",
    items: [
      { id: "p13-1", text: "Quote status by manufacturer checked", status: "warning" },
      { id: "p13-2", text: "Quote expiration dates verified", status: "warning" },
      { id: "p13-3", text: "Price validation run", status: "pending" },
      { id: "p13-4", text: "Coverage rate validation run", status: "pending" },
      { id: "p13-5", text: "Missing items identified", status: "pending" },
    ],
  },
  phase14: {
    key: "phase14",
    title: "Phase 14: Pricing - Labor",
    icon: "👷",
    items: [
      { id: "p14-1", text: "Labor hours by task entered", status: "pending" },
      { id: "p14-2", text: "Benchmark validation run", status: "pending" },
      { id: "p14-3", text: "Crew sizes determined", status: "pending" },
      { id: "p14-4", text: "Duration calculated", status: "pending" },
      { id: "p14-5", text: "$/SF sanity check", status: "pending" },
    ],
  },
  phase15: {
    key: "phase15",
    title: "Phase 15: Pre-Submission",
    icon: "✅",
    items: [
      { id: "p15-1", text: "Insurance verified (CCIP or carry own)", status: "rfi" },
      { id: "p15-2", text: "MBE/WBE requirements reviewed", status: "pending" },
      { id: "p15-3", text: "Prevailing wage checked", status: "done" },
      { id: "p15-4", text: "Bond requirements checked", status: "done" },
      { id: "p15-5", text: "Qualifications documented", status: "pending" },
      { id: "p15-6", text: "Exclusions documented", status: "pending" },
      { id: "p15-7", text: "All RFIs logged", status: "done" },
      { id: "p15-8", text: "All validation errors resolved", status: "pending" },
    ],
  },
  phase16: {
    key: "phase16",
    title: "Phase 16: Bid Submission",
    icon: "📤",
    items: [
      { id: "p16-1", text: "Bid form completed", status: "pending" },
      { id: "p16-2", text: "Math double-checked", status: "pending" },
      { id: "p16-3", text: "All addenda acknowledged", status: "pending" },
      { id: "p16-4", text: "Alternates priced (if any)", status: "pending" },
      { id: "p16-5", text: "Unit prices provided (if required)", status: "pending" },
      { id: "p16-6", text: "Authorized signature", status: "pending" },
      { id: "p16-7", text: "Submitted before deadline", status: "pending" },
    ],
  },
};

export const vendorGroups: Record<string, VendorGroup> = {
  waterproofing: {
    key: "waterproofing",
    name: "Waterproofing (AquaGuard Systems)",
    vendors: [
      { id: "v1", name: "Maria Santos - AquaGuard Rep", email: "msantos@aquaguard.com", phone: "201-555-0142", lastQuote: "2024-06-03", quoteStatus: "expired" },
    ],
    products: ["AG-6000 Hot Rubberized", "AquaFlex 30", "FlexFlash Universal", "DrainMat HD", "FilterFabric Pro"],
  },
  modbit: {
    key: "modbit",
    name: "Modified Bitumen (RoofTech Pro)",
    vendors: [
      { id: "v3", name: "James Wilson - RoofTech Rep", email: "jwilson@rooftechpro.com", phone: "973-555-0188", lastQuote: "2025-11-06", quoteStatus: "valid", expires: "2026-02-05" },
    ],
    products: ["ProDiene 20 Base", "ProDiene 30 Cap FR", "ProTherm Insulation", "PT-900 Primer", "ProCap 50 Traffic"],
  },
  henry: {
    key: "henry",
    name: "Air Barriers (SealRight)",
    vendors: [
      { id: "v4", name: "Northeast Building Supply", email: "quotes@nebuildingsupply.com", phone: "908-555-0167", lastQuote: "2025-12-06", quoteStatus: "expiring", expires: "2025-12-21" },
    ],
    products: ["BlueSeal PE200", "SealRight LVC Primer", "AirBlock 31 VP", "MoistureStop SA"],
  },
  lumber: {
    key: "lumber",
    name: "Lumber & Plywood",
    vendors: [
      { id: "v5", name: "Garden State Lumber", email: "commercial@gslumber.com", phone: "201-555-0134", lastQuote: null, quoteStatus: "none" },
      { id: "v6", name: "Metro Building Materials", email: "quotes@metrobm.com", phone: "973-555-0156", lastQuote: null, quoteStatus: "none" },
    ],
    products: ['Plywood CDX 3/4"', "2x4 PT", "2x6 PT", "2x6 FRT", "Blocking"],
  },
  insulation: {
    key: "insulation",
    name: "Insulation (ThermalPro)",
    vendors: [
      { id: "v7", name: "ThermalPro Distribution", email: "orders@thermalpro.com", phone: "800-555-0145", lastQuote: null, quoteStatus: "none" },
    ],
    products: ['PolyISO 2.5"', 'PolyISO 3.0"', "XPS Type IV", "CoverBoard HD"],
  },
  pavers: {
    key: "pavers",
    name: "Pavers & Pedestals",
    vendors: [
      { id: "v8", name: "Urban Hardscape Supply", email: "sales@urbanhardscape.com", phone: "201-555-0178", lastQuote: null, quoteStatus: "none" },
    ],
    products: ["24x24 Concrete Pavers", "Adjustable Pedestals", "Fixed Pedestals"],
  },
  greenroof: {
    key: "greenroof",
    name: "Green Roof (EcoTop Systems)",
    vendors: [
      { id: "v9", name: "EcoTop Green Roof Systems", email: "projects@ecotop.com", phone: "212-555-0193", lastQuote: null, quoteStatus: "none" },
    ],
    products: ["Sedum Mat Pre-Grown", "Extensive Media Blend", "Root Barrier 40mil", "Drainage Board"],
  },
};

export const laborRates: Record<string, LaborRate[]> = {
  waterproofing: [
    { id: "l1", category: "waterproofing", task: "AG-6000 Hot Apply", rate: 150, unit: "SF/hr", crew: 4, notes: "Per kettle crew" },
    { id: "l2", category: "waterproofing", task: "AquaFlex 30 Self-Adhered", rate: 75, unit: "SF/hr", crew: 2, notes: "Including primer" },
    { id: "l3", category: "waterproofing", task: "FlexFlash Corners", rate: 8, unit: "EA/hr", crew: 1, notes: "Pre-formed corners" },
    { id: "l4", category: "waterproofing", task: "FlexFlash Field", rate: 40, unit: "LF/hr", crew: 2, notes: "Roll goods" },
  ],
  modbit: [
    { id: "l5", category: "modbit", task: "Base Sheet - Torch", rate: 200, unit: "SF/hr", crew: 2, notes: "Standard production" },
    { id: "l6", category: "modbit", task: "Cap Sheet - Torch", rate: 175, unit: "SF/hr", crew: 2, notes: "Careful of burns" },
    { id: "l7", category: "modbit", task: "Base Sheet - Mopped", rate: 180, unit: "SF/hr", crew: 3, notes: "Hot asphalt" },
    { id: "l8", category: "modbit", task: "Parapet Flashing", rate: 25, unit: "LF/hr", crew: 2, notes: "Full height" },
  ],
  pavers: [
    { id: "l9", category: "pavers", task: "Pedestal Set", rate: 15, unit: "EA/hr", crew: 2, notes: "Adjustable type" },
    { id: "l10", category: "pavers", task: "Paver Install", rate: 2.5, unit: "EA/hr", crew: 2, notes: "24x24 pavers on pedestals" },
    { id: "l11", category: "pavers", task: "Paver - Ballasted", rate: 40, unit: "SF/hr", crew: 2, notes: "Direct lay no pedestals" },
  ],
  misc: [
    { id: "l12", category: "misc", task: "Insulation - Adhered", rate: 200, unit: "SF/hr", crew: 2, notes: "4x4 boards" },
    { id: "l13", category: "misc", task: "Insulation - Mechanical", rate: 300, unit: "SF/hr", crew: 2, notes: "Faster with guns" },
    { id: "l14", category: "misc", task: "Cover Board", rate: 250, unit: "SF/hr", crew: 2, notes: "HD or similar" },
    { id: "l15", category: "misc", task: "Drain Install", rate: 0.5, unit: "EA/hr", crew: 2, notes: "2 hours per drain" },
    { id: "l16", category: "misc", task: "Curb Flash", rate: 4, unit: "EA/hr", crew: 2, notes: 'Small curbs <36"' },
  ],
};

export const materialPrices: MaterialPrice[] = [
  { product: 'BlueSeal PE200 36"x65\'', price: 154, unit: "ROLL", coverage: 195, coverageUnit: "SF/RL", quoteDate: "2025-12-06", vendor: "Northeast Building Supply" },
  { product: "SealRight LVC Primer 5gal", price: 384, unit: "PAIL", coverage: 900, coverageUnit: "SF/PL", quoteDate: "2025-12-06", vendor: "Northeast Building Supply" },
  { product: "ProDiene 20 Base", price: 95, unit: "ROLL", coverage: 108, coverageUnit: "SF/RL", quoteDate: "2025-11-06", vendor: "RoofTech Pro" },
  { product: "ProDiene 30 Cap FR", price: 130, unit: "ROLL", coverage: 75, coverageUnit: "SF/RL", quoteDate: "2025-11-06", vendor: "RoofTech Pro" },
  { product: "AG-6000 Hot Rubberized", price: 0.75, unit: "LB", coverage: 1.5, coverageUnit: "GAL/100SF", quoteDate: "2024-06-03", vendor: "AquaGuard Systems" },
  { product: "AquaFlex 30 SA", price: 119, unit: "ROLL", coverage: 216, coverageUnit: "SF/RL", quoteDate: "2024-06-03", vendor: "AquaGuard Systems" },
  { product: "24x24 Concrete Paver", price: 25, unit: "EA", coverage: 4, coverageUnit: "SF/EA", quoteDate: null, vendor: null },
  { product: "Adjustable Pedestal", price: 12, unit: "EA", coverage: 4, coverageUnit: "SF/EA", quoteDate: null, vendor: null },
];

export function getPhaseProgress(phase: ChecklistPhase): number {
  const completed = phase.items.filter((i) => i.status === "done").length;
  return Math.round((completed / phase.items.length) * 100);
}

export function getOverallProgress(): number {
  let total = 0;
  let completed = 0;
  Object.values(masterChecklist).forEach((phase) => {
    phase.items.forEach((item) => {
      total++;
      if (item.status === "done") completed++;
    });
  });
  return Math.round((completed / total) * 100);
}

export function getRFICount(): number {
  let count = 0;
  Object.values(masterChecklist).forEach((phase) => {
    phase.items.forEach((item) => {
      if (item.status === "rfi") count++;
    });
  });
  return count;
}

export function runValidation() {
  const results = {
    passed: [] as { type: string; item: string; message: string }[],
    warnings: [] as { type: string; item: string; message: string; action: string }[],
    errors: [] as { type: string; item: string; message: string; action: string }[],
  };

  Object.values(vendorGroups).forEach((group) => {
    group.vendors.forEach((vendor) => {
      if (vendor.quoteStatus === "expired") {
        results.errors.push({
          type: "Quote Expired",
          item: group.name,
          message: `Quote from ${vendor.lastQuote} has expired. Request new pricing immediately.`,
          action: "Request Quote",
        });
      } else if (vendor.quoteStatus === "expiring") {
        results.warnings.push({
          type: "Quote Expiring Soon",
          item: group.name,
          message: `Quote expires ${vendor.expires}. Verify pricing is valid for bid date.`,
          action: "Verify",
        });
      } else if (vendor.quoteStatus === "none") {
        results.warnings.push({
          type: "No Quote on File",
          item: group.name,
          message: "No quote on file. Request pricing before finalizing bid.",
          action: "Request Quote",
        });
      } else if (vendor.quoteStatus === "valid") {
        results.passed.push({
          type: "Quote Valid",
          item: group.name,
          message: `Quote valid until ${vendor.expires}`,
        });
      }
    });
  });

  results.warnings.push({
    type: "Price Delta",
    item: "BlueSeal PE200",
    message: 'Your estimate price ($190/roll) is 23% higher than current quote ($154/roll). Update to avoid being overpriced.',
    action: "Update Price",
  });

  results.errors.push({
    type: "Labor Underestimate",
    item: "Paver Installation (1,670 EA)",
    message: "Your estimate: 300 hrs (5.6 EA/hr). Benchmark: 2.5 EA/hr. Expected: 668 hrs. You may be $16,560 short on labor.",
    action: "Review Hours",
  });

  results.passed.push({
    type: "Coverage Rate Valid",
    item: "ProDiene 30 Cap FR",
    message: "Your formula (75 SF/RL) matches manufacturer data sheet specification.",
  });

  results.passed.push({
    type: "Coverage Rate Valid",
    item: "AquaFlex 30 SA",
    message: "Your formula (216 SF/RL) matches manufacturer data sheet specification.",
  });

  return results;
}
