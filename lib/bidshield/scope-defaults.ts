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

// ── Dynamic scope generation based on project data ──

interface SpecSummary {
  scopeNotes?: string[];
  testingRequirements?: string[];
  laborRequirements?: { laborType?: string; certifiedInstaller?: boolean };
  generalConditions?: string[];
  submittals?: string[];
  warranty?: { type?: string; windSpeed?: string };
}

export function getDynamicScopeItems(project: any): DefaultScopeItem[] {
  const items: DefaultScopeItem[] = [...DEFAULT_SCOPE_ITEMS];
  let nextSort = 40; // continue after last default item (38)

  const seen = new Set(items.map(i => i.name.toLowerCase()));
  const add = (category: ScopeCategory, name: string) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ category, name, sortOrder: nextSort++ });
  };

  // Gather system types from assemblies
  const systemTypes = new Set<string>();
  const surfaceTypes = new Set<string>();
  if (project?.roofAssemblies && Array.isArray(project.roofAssemblies)) {
    for (const a of project.roofAssemblies) {
      if (a.systemType) systemTypes.add(a.systemType.toLowerCase());
      if (a.surfaceType) surfaceTypes.add(a.surfaceType.toLowerCase());
    }
  }
  if (project?.systemType) systemTypes.add(project.systemType.toLowerCase());

  // ── System-specific items ──
  for (const sys of systemTypes) {
    if (["sbs", "app", "bur", "modified_bitumen"].some(s => sys.includes(s))) {
      add("safety", "Hot kettle placement & fuel storage");
      add("schedule", "Multi-ply application sequencing");
    }
    if (sys.includes("spf")) {
      add("schedule", "Spray conditions monitoring (wind/temp/humidity)");
      add("protection", "Overspray containment & protection");
    }
    if (sys.includes("metal")) {
      add("sheetmetal", "Panel layout & alignment tolerances");
      add("sheetmetal", "Thermal movement provisions");
    }
    if (sys.includes("hydrotech") || sys.includes("irma")) {
      add("protection", "IRMA system waterproofing coordination");
      add("general", "Protection course installation");
    }
    if (sys.includes("tpo") || sys.includes("epdm") || sys.includes("pvc")) {
      add("warranty", "Membrane seam testing / verification");
    }
  }

  // ── Surface-specific items ──
  for (const surf of surfaceTypes) {
    if (surf.includes("green")) {
      add("general", "Green roof growing media delivery");
      add("general", "Plant material & irrigation");
      add("protection", "Root barrier / drainage layer");
    }
    if (surf.includes("paver") || surf.includes("pedestal")) {
      add("general", "Paver pedestal layout & leveling");
      add("access", "Paver delivery & crane time");
    }
    if (surf.includes("traffic")) {
      add("general", "Traffic coating surface prep");
      add("general", "Traffic coating application");
    }
  }

  // ── Compliance items ──
  if (project?.fmGlobal) {
    add("warranty", "FM Global inspection coordination");
    add("general", "FM-approved materials verification");
  }
  if (project?.pre1990) {
    add("demolition", "Pre-1990 hazmat testing (asbestos/lead)");
    add("demolition", "Abatement coordination");
  }
  if (project?.energyCode) {
    add("general", "Energy code R-value verification");
    add("general", "ASHRAE compliance documentation");
  }

  // ── Project type items ──
  if (project?.projectType === "reroof") {
    add("demolition", "Full tear-off to structural deck");
    add("demolition", "Dumpster / debris hauling");
  }
  if (project?.projectType === "recover") {
    add("protection", "Moisture scan of existing roof");
    add("general", "Recover board installation");
  }

  // ── Spec-extracted items ──
  if (project?.specSummary) {
    let spec: SpecSummary | null = null;
    try {
      spec = typeof project.specSummary === "string" ? JSON.parse(project.specSummary) : project.specSummary;
    } catch { /* ignore parse errors */ }

    if (spec) {
      if (spec.scopeNotes && Array.isArray(spec.scopeNotes)) {
        for (const note of spec.scopeNotes) {
          if (typeof note === "string" && note.length > 5 && note.length < 120) {
            add("general", note);
          }
        }
      }
      if (spec.testingRequirements && Array.isArray(spec.testingRequirements)) {
        for (const req of spec.testingRequirements) {
          if (typeof req === "string" && req.length > 5 && req.length < 120) {
            add("warranty", req);
          }
        }
      }
      if (spec.generalConditions && Array.isArray(spec.generalConditions)) {
        for (const cond of spec.generalConditions) {
          if (typeof cond === "string" && cond.length > 5 && cond.length < 120) {
            add("general", cond);
          }
        }
      }
      if (spec.submittals && Array.isArray(spec.submittals)) {
        for (const sub of spec.submittals) {
          if (typeof sub === "string" && sub.length > 5 && sub.length < 120) {
            add("warranty", sub);
          }
        }
      }
      if (spec.laborRequirements) {
        if (spec.laborRequirements.laborType === "prevailing_wage") {
          add("general", "Prevailing wage compliance");
        }
        if (spec.laborRequirements.laborType === "union") {
          add("general", "Union labor requirements");
        }
        if (spec.laborRequirements.certifiedInstaller) {
          add("general", "Manufacturer-certified installer required");
        }
      }
      if (spec.warranty?.type === "NDL") {
        add("warranty", "NDL warranty inspection & documentation");
      }
      if (spec.warranty?.windSpeed) {
        add("warranty", `Wind uplift testing to ${spec.warranty.windSpeed}`);
      }
    }
  }

  return items;
}

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
