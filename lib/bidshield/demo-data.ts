/**
 * BidShield Demo Data — Meridian Business Park
 * 
 * A realistic commercial re-roof project that showcases every feature.
 * 68,000 SF warehouse complex, TPO over existing modified bitumen.
 * Bid due March 7, 2026 to Skanska USA.
 */

export type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";

// ─── PROJECT HEADER ───
export const DEMO_PROJECT = {
  name: "Meridian Business Park — Bldg C",
  location: "Charlotte, NC",
  bidDate: "2026-03-07",
  status: "in_progress" as const,
  gc: "Skanska USA",
  trade: "roofing",
  systemType: "tpo",
  deckType: "steel",
  grossRoofArea: 68000,
  totalBidAmount: 1250000,
  materialCost: 612000,
  laborCost: 488000,
  otherCost: 150000,
  notes: "Pre-bid walkthrough completed 2/12. Owner wants 20-yr NDL warranty. Existing roof has wet insulation in NE quadrant — core cuts confirmed.",
};

// ─── SCOPE ITEMS (40 items, mix of statuses) ───
export const DEMO_SCOPE_ITEMS: {
  _id: string; category: string; name: string; status: ScopeStatus;
  cost: number; note: string; isDefault: boolean; sortOrder: number;
}[] = [
  // Demolition (5) — 3 addressed, 2 unaddressed
  { _id: "sc_1", category: "demolition", name: "Remove existing modified bitumen membrane", status: "included", cost: 34000, note: "Full tear-off per spec", isDefault: true, sortOrder: 0 },
  { _id: "sc_2", category: "demolition", name: "Remove wet insulation (NE quadrant)", status: "included", cost: 18500, note: "~8,200 SF per core cuts", isDefault: true, sortOrder: 1 },
  { _id: "sc_3", category: "demolition", name: "Remove existing edge metal", status: "included", cost: 4200, note: "", isDefault: true, sortOrder: 2 },
  { _id: "sc_4", category: "demolition", name: "Dispose of debris off-site", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 3 },
  { _id: "sc_5", category: "demolition", name: "Remove rooftop satellite dishes", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 4 },
  // Site Access (4)
  { _id: "sc_6", category: "site_access", name: "Roof access (ladder, stairs, hatch)", status: "included", cost: 0, note: "Stair access from loading dock", isDefault: true, sortOrder: 5 },
  { _id: "sc_7", category: "site_access", name: "Material staging area", status: "by_others", cost: 0, note: "GC providing SW parking lot", isDefault: true, sortOrder: 6 },
  { _id: "sc_8", category: "site_access", name: "Crane / material hoisting", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 7 },
  { _id: "sc_9", category: "site_access", name: "Temporary protection of tenant spaces", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 8 },
  // Substrate Prep (4)
  { _id: "sc_10", category: "substrate", name: "Inspect and repair steel deck", status: "included", cost: 6500, note: "Allowance for minor deck repair", isDefault: true, sortOrder: 9 },
  { _id: "sc_11", category: "substrate", name: "Install vapor barrier", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 10 },
  { _id: "sc_12", category: "substrate", name: "Install tapered insulation system", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 11 },
  { _id: "sc_13", category: "substrate", name: "Install cover board", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 12 },
  // Membrane (3)
  { _id: "sc_14", category: "membrane", name: "Install TPO 60mil mechanically attached", status: "included", cost: 0, note: "Per spec section 075423", isDefault: true, sortOrder: 13 },
  { _id: "sc_15", category: "membrane", name: "Weld all seams — hot-air welded", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 14 },
  { _id: "sc_16", category: "membrane", name: "Install walkway pads at equipment", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 15 },
  // Flashing (6)
  { _id: "sc_17", category: "flashing", name: "Base flashing at parapet walls", status: "included", cost: 0, note: "Included in membrane scope", isDefault: true, sortOrder: 16 },
  { _id: "sc_18", category: "flashing", name: "Pipe penetration flashing (all)", status: "included", cost: 0, note: "32 penetrations per plans", isDefault: true, sortOrder: 17 },
  { _id: "sc_19", category: "flashing", name: "Coping — new prefinished aluminum", status: "excluded", cost: 0, note: "Sheet metal contractor handling", isDefault: true, sortOrder: 18 },
  { _id: "sc_20", category: "flashing", name: "Edge metal / drip edge", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 19 },
  { _id: "sc_21", category: "flashing", name: "Expansion joint covers", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 20 },
  { _id: "sc_22", category: "flashing", name: "Counterflashing at masonry walls", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 21 },
  // Drainage (3)
  { _id: "sc_23", category: "drainage", name: "Install new roof drains", status: "by_others", cost: 0, note: "Plumber installing — we flash", isDefault: true, sortOrder: 22 },
  { _id: "sc_24", category: "drainage", name: "Overflow / scupper drains", status: "na", cost: 0, note: "Internal drainage only", isDefault: true, sortOrder: 23 },
  { _id: "sc_25", category: "drainage", name: "Gutter and downspout reconnection", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 24 },
  // Equipment (5)
  { _id: "sc_26", category: "equipment", name: "RTU curb adapters (6 units)", status: "included", cost: 14400, note: "$2,400 each — confirm sizes with mech", isDefault: true, sortOrder: 25 },
  { _id: "sc_27", category: "equipment", name: "Flash exhaust fan curbs", status: "included", cost: 0, note: "4 fans, included in membrane", isDefault: true, sortOrder: 26 },
  { _id: "sc_28", category: "equipment", name: "Skylight re-flash / re-curb", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 27 },
  { _id: "sc_29", category: "equipment", name: "Lightning protection re-install", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 28 },
  { _id: "sc_30", category: "equipment", name: "Satellite dish / antenna re-mount", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 29 },
  // Warranty (4)
  { _id: "sc_31", category: "warranty", name: "Manufacturer 20-yr NDL warranty", status: "included", cost: 8500, note: "Carlisle SynTec — confirm pricing", isDefault: true, sortOrder: 30 },
  { _id: "sc_32", category: "warranty", name: "Provide as-built drawings", status: "na", cost: 0, note: "Not required per bid docs", isDefault: true, sortOrder: 31 },
  { _id: "sc_33", category: "warranty", name: "Core cuts / pull tests per spec", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 32 },
  { _id: "sc_34", category: "warranty", name: "Final roof inspection with owner", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 33 },
  // Safety (6)
  { _id: "sc_35", category: "safety", name: "Perimeter fall protection / guardrails", status: "included", cost: 22000, note: "Rent guardrail system 12 weeks", isDefault: true, sortOrder: 34 },
  { _id: "sc_36", category: "safety", name: "Daily cleanup and housekeeping", status: "included", cost: 0, note: "Included in labor", isDefault: true, sortOrder: 35 },
  { _id: "sc_37", category: "safety", name: "Weather protection / dry-in", status: "excluded", cost: 0, note: "GC responsible per contract", isDefault: true, sortOrder: 36 },
  { _id: "sc_38", category: "safety", name: "Permits and inspections", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 37 },
  { _id: "sc_39", category: "safety", name: "Traffic control / flagging", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 38 },
  { _id: "sc_40", category: "safety", name: "Noise / schedule restrictions", status: "unaddressed", cost: 0, note: "", isDefault: true, sortOrder: 39 },
];

// ─── TAKEOFF LINE ITEMS ───
export const DEMO_LINEAR_ITEMS = [
  { _id: "li_1", category: "linear" as const, itemType: "parapet_wall", label: "Parapet Wall", quantity: 1680, unit: "LF", verified: true, sortOrder: 0 },
  { _id: "li_2", category: "linear" as const, itemType: "coping", label: "Coping", quantity: 1680, unit: "LF", verified: true, sortOrder: 1 },
  { _id: "li_3", category: "linear" as const, itemType: "edge_metal", label: "Edge Metal / Drip Edge", quantity: 920, unit: "LF", verified: false, sortOrder: 2 },
  { _id: "li_4", category: "linear" as const, itemType: "counterflashing", label: "Counterflashing", quantity: 480, unit: "LF", verified: true, sortOrder: 3 },
  { _id: "li_5", category: "linear" as const, itemType: "expansion_joint", label: "Expansion Joint", quantity: 120, unit: "LF", verified: false, sortOrder: 4 },
  { _id: "li_6", category: "linear" as const, itemType: "base_flashing", label: "Base Flashing", quantity: 1680, unit: "LF", verified: true, sortOrder: 5 },
  { _id: "li_7", category: "linear" as const, itemType: "gutter", label: "Gutter", quantity: 340, unit: "LF", verified: false, sortOrder: 6 },
];

export const DEMO_COUNT_ITEMS = [
  { _id: "ci_1", category: "count" as const, itemType: "pipe_penetration", label: "Pipe Penetrations", quantity: 32, unit: "EA", verified: true, sortOrder: 0 },
  { _id: "ci_2", category: "count" as const, itemType: "roof_drain", label: "Roof Drains", quantity: 12, unit: "EA", verified: true, sortOrder: 1 },
  { _id: "ci_3", category: "count" as const, itemType: "overflow_drain", label: "Overflow Drains", quantity: 6, unit: "EA", verified: false, sortOrder: 2 },
  { _id: "ci_4", category: "count" as const, itemType: "rtu_curb", label: "RTU / Equipment Curbs", quantity: 6, unit: "EA", verified: true, sortOrder: 3 },
  { _id: "ci_5", category: "count" as const, itemType: "exhaust_fan", label: "Exhaust Fan Curbs", quantity: 4, unit: "EA", verified: true, sortOrder: 4 },
  { _id: "ci_6", category: "count" as const, itemType: "skylight", label: "Skylights", quantity: 8, unit: "EA", verified: false, sortOrder: 5 },
  { _id: "ci_7", category: "count" as const, itemType: "hatch", label: "Roof Hatches", quantity: 2, unit: "EA", verified: true, sortOrder: 6 },
  { _id: "ci_8", category: "count" as const, itemType: "vent", label: "Vents / Stacks", quantity: 14, unit: "EA", verified: false, sortOrder: 7 },
];

// ─── ADDENDA ───
export const DEMO_ADDENDA = [
  {
    _id: "add_1" as string, number: 1, title: "Revised RTU schedule — 2 additional units",
    receivedDate: "2026-02-14", affectsScope: true, acknowledged: true, incorporated: true,
    scopeImpact: "Added 2 RTU curbs (now 8 total). Requires additional curb adapters.",
    impactCategories: "material,labor", repriced: true, repricedDate: "2026-02-15",
    priceImpact: 5200, priority: "normal",
    notes: "Updated takeoff and material quantities.",
  },
  {
    _id: "add_2" as string, number: 2, title: "Warranty upgraded to 25-year NDL",
    receivedDate: "2026-02-18", affectsScope: true, acknowledged: true, incorporated: false,
    scopeImpact: "Manufacturer warranty fee increases. May require thicker membrane.",
    impactCategories: "material", repriced: false, repricedDate: undefined,
    priceImpact: undefined, priority: "critical",
    notes: "",
  },
  {
    _id: "add_3" as string, number: 3, title: "Clarification — tenant occupied during work",
    receivedDate: "2026-02-20", affectsScope: false, acknowledged: true, incorporated: false,
    scopeImpact: undefined, impactCategories: undefined, repriced: undefined,
    repricedDate: undefined, priceImpact: undefined, priority: "normal",
    notes: "Confirmed — east wing tenant moves out March 1. Work hours 7AM-5PM.",
  },
  {
    _id: "add_4" as string, number: 4, title: "Substitution: Carlisle to Firestone allowed",
    receivedDate: "2026-02-22", affectsScope: false, acknowledged: false, incorporated: false,
    scopeImpact: undefined, impactCategories: undefined, repriced: undefined,
    repricedDate: undefined, priceImpact: undefined, priority: "normal",
    notes: "",
  },
];

// ─── RFIs ───
export const DEMO_RFIS = [
  {
    _id: "rfi_1" as string, number: 1,
    question: "Drawing A-301 shows parapet height at 42\" but detail 7/A-501 shows 36\". Which is correct?",
    sentTo: "Skanska — John Peters", status: "sent",
    createdAt: Date.now() - 5 * 86400000, sentAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    _id: "rfi_2" as string, number: 2,
    question: "Spec calls for R-30 insulation but existing deck height limits us to R-25. Will owner accept?",
    sentTo: "Skanska — John Peters", status: "answered",
    response: "Owner approved R-25 with additional cover board. Revised spec section by 2/28.",
    createdAt: Date.now() - 7 * 86400000, sentAt: Date.now() - 6 * 86400000,
    respondedAt: Date.now() - 2 * 86400000, updatedAt: Date.now() - 2 * 86400000,
  },
  {
    _id: "rfi_3" as string, number: 3,
    question: "NE quadrant wet insulation — who covers deck drying time if rain during tear-off?",
    sentTo: undefined, status: "draft",
    createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000,
  },
];

// ─── QUOTES ───
export const DEMO_QUOTES = [
  {
    _id: "q_1" as string, vendorName: "ABC Supply — Charlotte", vendorEmail: "quotes@abcsupply.com",
    vendorPhone: "(704) 555-0142", category: "membrane",
    products: ["TPO 60mil White", "TPO Bonding Adhesive", "TPO Cover Tape"],
    quoteAmount: 186000, quoteDate: "2026-02-10", expirationDate: "2026-03-10",
    status: "received", notes: "Best price if ordered by 3/1",
  },
  {
    _id: "q_2" as string, vendorName: "Beacon Building Products", vendorEmail: "charlotte@becn.com",
    vendorPhone: "(704) 555-0388", category: "insulation",
    products: ["Polyiso 3.5\"", "Tapered Polyiso", "HD Cover Board"],
    quoteAmount: 142000, quoteDate: "2026-02-12", expirationDate: "2026-03-12",
    status: "received", notes: "Includes delivery. 2-week lead time.",
  },
  {
    _id: "q_3" as string, vendorName: "Metal Era", vendorEmail: "sales@metalera.com",
    category: "edge_metal",
    products: ["Perma-Tite Edge", "Coping System 12\""],
    quoteAmount: 28500, quoteDate: "2026-02-08", expirationDate: "2026-02-28",
    status: "received", notes: "EXPIRING — need to confirm or re-quote",
  },
  {
    _id: "q_4" as string, vendorName: "Carlisle SynTec", vendorEmail: "warranty@carlisle.com",
    category: "warranty",
    products: ["20-Year NDL Warranty"],
    quoteAmount: 8500, quoteDate: "2026-02-15", expirationDate: "2026-04-15",
    status: "received", notes: "Need to update for 25-yr per Addendum #2",
  },
  {
    _id: "q_5" as string, vendorName: "SRS Distribution",
    category: "accessories",
    products: ["Fasteners", "Plates", "Sealants", "Walkway Pads"],
    quoteAmount: undefined, quoteDate: undefined, expirationDate: undefined,
    status: "requested", notes: "Sent RFQ 2/14, awaiting response",
  },
];

// ─── MATERIALS ───
export const DEMO_MATERIALS = [
  { _id: "m_1", category: "membrane", name: "TPO 60mil White — 10' rolls", unit: "SF", quantity: 72000, unitPrice: 1.85, totalCost: 133200, wasteFactor: 1.06, templateKey: "tpo_60mil" },
  { _id: "m_2", category: "membrane", name: "TPO Bonding Adhesive", unit: "GAL", quantity: 480, unitPrice: 42.00, totalCost: 20160, wasteFactor: 1.05, templateKey: "tpo_adhesive" },
  { _id: "m_3", category: "insulation", name: "Polyiso 3.5\" (R-20)", unit: "SF", quantity: 68000, unitPrice: 1.65, totalCost: 112200, wasteFactor: 1.03, templateKey: "polyiso" },
  { _id: "m_4", category: "insulation", name: "Tapered Polyiso — cricket package", unit: "SF", quantity: 18000, unitPrice: 2.40, totalCost: 43200, wasteFactor: 1.05, templateKey: "tapered" },
  { _id: "m_5", category: "insulation", name: "HD Cover Board 1/2\"", unit: "SF", quantity: 68000, unitPrice: 0.82, totalCost: 55760, wasteFactor: 1.02, templateKey: "cover_board" },
  { _id: "m_6", category: "fasteners", name: "Fasteners & Plates", unit: "EA", quantity: 12500, unitPrice: 0.45, totalCost: 5625, wasteFactor: 1.10, templateKey: "fasteners" },
  { _id: "m_7", category: "flashing", name: "TPO Coated Metal Edge", unit: "LF", quantity: 920, unitPrice: 8.50, totalCost: 7820, wasteFactor: 1.05, templateKey: "edge_metal" },
  { _id: "m_8", category: "flashing", name: "Coping — Prefinished Aluminum 12\"", unit: "LF", quantity: 1680, unitPrice: 14.00, totalCost: 23520, wasteFactor: 1.03, templateKey: "coping" },
  { _id: "m_9", category: "accessories", name: "Pipe Boot Flashings", unit: "EA", quantity: 32, unitPrice: 28.00, totalCost: 896, wasteFactor: 1.0, templateKey: "pipe_boots" },
  { _id: "m_10", category: "accessories", name: "Walkway Pads", unit: "SF", quantity: 600, unitPrice: 4.50, totalCost: 2700, wasteFactor: 1.0, templateKey: "walkway" },
  { _id: "m_11", category: "accessories", name: "Roof Drain Retrofit Kits", unit: "EA", quantity: 12, unitPrice: 185.00, totalCost: 2220, wasteFactor: 1.0, templateKey: "drains" },
  { _id: "m_12", category: "accessories", name: "RTU Curb Adapters", unit: "EA", quantity: 6, unitPrice: 0, totalCost: 0, wasteFactor: 1.0, templateKey: "curbs" },
];

// ─── PRICING ───
export const DEMO_PRICING = {
  totalBidAmount: 1250000 as number | undefined,
  materialCost: 612000 as number | undefined,
  laborCost: 488000 as number | undefined,
  otherCost: 150000 as number | undefined,
  primaryAssembly: "TPO 60mil Mechanically Attached" as string | undefined,
  lossReason: undefined as string | undefined,
  lossReasonNote: undefined as string | undefined,
  actualCost: undefined as number | undefined,
  actualMaterialCost: undefined as number | undefined,
  actualLaborCost: undefined as number | undefined,
  actualOtherCost: undefined as number | undefined,
  postJobStatus: undefined as string | undefined,
  postJobNotes: undefined as string | undefined,
  completedDate: undefined as string | undefined,
};

// ─── TAKEOFF SECTIONS ───
export const DEMO_TAKEOFF_SECTIONS = [
  { _id: "ts_1", name: "Main Roof — West Wing", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 28500, completed: true, sortOrder: 0 },
  { _id: "ts_2", name: "Main Roof — East Wing", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 24800, completed: true, sortOrder: 1 },
  { _id: "ts_3", name: "Office Section", assemblyType: "TPO 60mil Fully Adhered", squareFeet: 8200, completed: true, sortOrder: 2 },
  { _id: "ts_4", name: "Loading Dock Canopy", assemblyType: "Metal Roof Panels", squareFeet: 3400, completed: false, sortOrder: 3, notes: "Need field verification" },
];

// ─── HOME PAGE STATS (pre-computed for action items) ───
export const DEMO_HOME_STATS = {
  checklist: { total: 95, done: 68, rfi: 3 },
  scope: { total: 40, unaddressed: 17 },
  takeoffControlSF: 68000,
  takeoffTakenOff: 64900, // 28500+24800+8200+3400
  quotes: { expiring: 1, expired: 0 },
  addenda: { notReviewed: 1, notRepriced: 1 },
  rfis: { pending: 2 },
  materials: { total: 12, unpriced: 1 },
};
