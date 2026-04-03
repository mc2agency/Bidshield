// Default scope items for the Scope Gap Checker.
// These auto-populate when a user first opens the Scope tab.

export type ScopeCategory = "demolition" | "access" | "protection" | "schedule" | "sheetmetal" | "warranty" | "safety" | "general";

export interface DefaultScopeItem {
  category: ScopeCategory;
  name: string;
  sortOrder: number;
}

export const SCOPE_CATEGORIES: Record<ScopeCategory, { label: string; icon: string }> = {
  demolition: { label: "Demolition & Removal", icon: "🔨" },
  access: { label: "Site Access & Logistics", icon: "🚧" },
  protection: { label: "Temporary Protection", icon: "🛡️" },
  schedule: { label: "Schedule & Phasing", icon: "📅" },
  sheetmetal: { label: "Sheet Metal & Drainage", icon: "🔩" },
  warranty: { label: "Warranty & Inspections", icon: "📜" },
  safety: { label: "Safety & Compliance", icon: "⚠️" },
  general: { label: "General Conditions", icon: "📋" },
};

export const DEFAULT_SCOPE_ITEMS: DefaultScopeItem[] = [
  // Demolition & Removal
  { category: "demolition", name: "Demo / Tear-off of existing roof", sortOrder: 1 },
  { category: "demolition", name: "Hazmat / Asbestos abatement", sortOrder: 3 },
  { category: "demolition", name: "Wet insulation removal", sortOrder: 4 },

  // Site Access & Logistics
  { category: "access", name: "Roof access (ladder, stairs, hatch)", sortOrder: 6 },
  { category: "access", name: "Material staging area", sortOrder: 7 },

  // Temporary Protection
  { category: "protection", name: "Interior protection", sortOrder: 11 },
  { category: "protection", name: "Vapor barrier", sortOrder: 12 },
  { category: "protection", name: "Dust / debris protection for occupied spaces", sortOrder: 13 },

  // Schedule & Phasing
  { category: "schedule", name: "Phasing / Sequencing plan", sortOrder: 14 },
  { category: "schedule", name: "After-hours / Weekend premium", sortOrder: 15 },
  { category: "schedule", name: "Winter conditions premium", sortOrder: 16 },
  { category: "schedule", name: "Occupied building restrictions", sortOrder: 17 },

  // Sheet Metal & Drainage
  { category: "sheetmetal", name: "Scuppers / Overflow provisions", sortOrder: 19 },
  { category: "sheetmetal", name: "Coping / Edge metal fabrication", sortOrder: 20 },
  { category: "sheetmetal", name: "Counterflashing (furnished by GC or roofer?)", sortOrder: 21 },
  { category: "sheetmetal", name: "Roof drain bodies (furnished by plumber or roofer?)", sortOrder: 22 },

  // Warranty & Inspections
  { category: "warranty", name: "Manufacturer warranty inspection fee", sortOrder: 23 },
  { category: "warranty", name: "Extended warranty upgrade", sortOrder: 24 },
  { category: "warranty", name: "Warranty-required details", sortOrder: 25 },
  { category: "warranty", name: "As-built documentation / Photos", sortOrder: 26 },

  // Safety & Compliance
  { category: "safety", name: "OSHA fall protection (guardrails, anchors)", sortOrder: 27 },
  { category: "safety", name: "Safety netting / Debris containment", sortOrder: 28 },
  { category: "safety", name: "Fire watch", sortOrder: 29 },
  { category: "safety", name: "Hot work permits", sortOrder: 30 },

  // General Conditions
  { category: "general", name: "Project management / Supervision", sortOrder: 35 },
  { category: "general", name: "Punch list / Final cleanup", sortOrder: 36 },
  { category: "general", name: "Owner / GC-required meetings", sortOrder: 38 },
];
