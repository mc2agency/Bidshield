// ── BidShield Workflow Architecture ──
// 5 views that mirror the real estimating process:
//   1. Setup → project info, spec upload, assemblies
//   2. Checklist → 18-phase QA pre-flight check
//   3. Estimate → takeoff + materials + labor + gen. conds + pricing summary
//   4. Documents → scope, quotes, addenda, RFIs, bid quals
//   5. Validate → readiness scoring

export type TabId =
  | "setup"
  | "checklist"
  | "estimate"
  | "documents"
  | "validate"
  // Legacy tab IDs kept for internal sub-tab routing / onNavigateTab compatibility
  | "overview"
  | "takeoff"
  | "pricing"
  | "materials"
  | "scope"
  | "quotes"
  | "rfis"
  | "addenda"
  | "labor"
  | "generalconditions"
  | "validator"
  | "bidquals"
  | "decisions";

export type TabBadge = {
  label: string;
  color: "green" | "amber" | "red" | "slate" | "blue";
};

export type TabConfig = {
  id: TabId;
  label: string;
  icon: string;
  badge?: TabBadge;
};

export interface TabProps {
  projectId: string;
  isDemo: boolean;
  isPro?: boolean;
  project: any;
  userId?: string;
  onNavigateTab?: (tab: TabId) => void;
  cachedData?: {
    checklist?: any[];
    quotes?: any[];
    rfis?: any[];
    addenda?: any[];
    projectMaterials?: any[];
    scopeItems?: any[];
    takeoffSections?: any[];
  };
}

// ── Phase definitions (simplified) ──
export type PhaseId = "setup" | "checklist" | "estimate" | "documents" | "validate";

export interface Phase {
  id: PhaseId;
  label: string;
  shortLabel: string;
  tabs: TabId[];
  defaultTab: TabId;
}

export const CROSS_PHASE_TABS: TabId[] = [];

export const PHASES: Phase[] = [
  { id: "setup", label: "Project Setup", shortLabel: "Setup", tabs: ["setup"], defaultTab: "setup" },
  { id: "checklist", label: "Checklist", shortLabel: "Checklist", tabs: ["checklist"], defaultTab: "checklist" },
  { id: "estimate", label: "Estimate", shortLabel: "Estimate", tabs: ["estimate", "takeoff", "materials", "pricing", "labor", "generalconditions"], defaultTab: "estimate" },
  { id: "documents", label: "Documents", shortLabel: "Docs", tabs: ["documents", "scope", "quotes", "addenda", "rfis", "bidquals"], defaultTab: "documents" },
  { id: "validate", label: "Validate", shortLabel: "Validate", tabs: ["validate", "validator", "decisions"], defaultTab: "validate" },
];

export function getPhaseForTab(tabId: TabId): Phase | undefined {
  return PHASES.find((p) => p.tabs.includes(tabId));
}

export function getPhaseIndex(tabId: TabId): number {
  return PHASES.findIndex((p) => p.tabs.includes(tabId));
}
