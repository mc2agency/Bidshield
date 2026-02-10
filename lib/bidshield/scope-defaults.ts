// Default scope items for the Scope Gap Checker.
// These auto-populate when a user first opens the Scope tab.

export type ScopeCategory = "demolition" | "access" | "protection" | "schedule" | "flashing" | "warranty" | "safety" | "general";

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
  flashing: { label: "Flashing & Sheet Metal", icon: "🔩" },
  warranty: { label: "Warranty & Inspections", icon: "📜" },
  safety: { label: "Safety & Compliance", icon: "⚠️" },
  general: { label: "General Conditions", icon: "📋" },
};

export const DEFAULT_SCOPE_ITEMS: DefaultScopeItem[] = [
  // Demolition & Removal
  { category: "demolition", name: "Demo / Tear-off of existing roof", sortOrder: 1 },
  { category: "demolition", name: "Dumpster / Debris disposal", sortOrder: 2 },
  { category: "demolition", name: "Hazmat / Asbestos abatement", sortOrder: 3 },
  { category: "demolition", name: "Wet insulation removal", sortOrder: 4 },

  // Site Access & Logistics
  { category: "access", name: "Crane / Hoist time", sortOrder: 5 },
  { category: "access", name: "Roof access (ladder, stairs, hatch)", sortOrder: 6 },
  { category: "access", name: "Material staging area", sortOrder: 7 },
  { category: "access", name: "Material hoisting / conveyor", sortOrder: 8 },
  { category: "access", name: "Mobilization / Demobilization", sortOrder: 9 },

  // Temporary Protection
  { category: "protection", name: "Temporary waterproofing", sortOrder: 10 },
  { category: "protection", name: "Interior protection", sortOrder: 11 },
  { category: "protection", name: "Vapor barrier", sortOrder: 12 },
  { category: "protection", name: "Dust / debris protection for occupied spaces", sortOrder: 13 },

  // Schedule & Phasing
  { category: "schedule", name: "Phasing / Sequencing plan", sortOrder: 14 },
  { category: "schedule", name: "After-hours / Weekend premium", sortOrder: 15 },
  { category: "schedule", name: "Winter conditions premium", sortOrder: 16 },
  { category: "schedule", name: "Occupied building restrictions", sortOrder: 17 },

  // Flashing & Sheet Metal
  { category: "flashing", name: "Penetration flashings (all)", sortOrder: 18 },
  { category: "flashing", name: "Parapet wall flashing / coping", sortOrder: 19 },
  { category: "flashing", name: "Counterflashing / reglet", sortOrder: 20 },
  { category: "flashing", name: "Expansion joints / Area dividers", sortOrder: 21 },
  { category: "flashing", name: "Sheet metal gutters / Downspouts", sortOrder: 22 },
  { category: "flashing", name: "Edge metal / Drip edge", sortOrder: 23 },
  { category: "flashing", name: "Scupper flashings", sortOrder: 24 },

  // Warranty & Inspections
  { category: "warranty", name: "Manufacturer warranty inspection fee", sortOrder: 25 },
  { category: "warranty", name: "Extended warranty upgrade", sortOrder: 26 },
  { category: "warranty", name: "Warranty-required details", sortOrder: 27 },
  { category: "warranty", name: "As-built documentation / Photos", sortOrder: 28 },

  // Safety & Compliance
  { category: "safety", name: "OSHA fall protection (guardrails, anchors)", sortOrder: 29 },
  { category: "safety", name: "Safety netting / Debris containment", sortOrder: 30 },
  { category: "safety", name: "Fire watch", sortOrder: 31 },
  { category: "safety", name: "Hot work permits", sortOrder: 32 },

  // General Conditions
  { category: "general", name: "Permits", sortOrder: 33 },
  { category: "general", name: "Bonding (performance / payment)", sortOrder: 34 },
  { category: "general", name: "Insurance (additional insured)", sortOrder: 35 },
  { category: "general", name: "Submittals / Shop drawings", sortOrder: 36 },
  { category: "general", name: "Project management / Supervision", sortOrder: 37 },
  { category: "general", name: "Punch list / Final cleanup", sortOrder: 38 },
  { category: "general", name: "Testing (flood test, core cuts)", sortOrder: 39 },
  { category: "general", name: "Owner / GC-required meetings", sortOrder: 40 },
];
