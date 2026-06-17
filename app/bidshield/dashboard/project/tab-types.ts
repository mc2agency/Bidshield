// ── BidShield Preflight Architecture ──
// 5 phases that mirror the bid submission preflight process:
//   1. INTAKE  → create project, upload specs/drawings, assembly recognition
//   2. READ    → scope extraction, addenda tracking, RFIs, vendor quotes
//   3. VERIFY  → checklist — confirm scope items, 95+ preflight checks
//   4. VALIDATE → bid quals + readiness scoring, blocker resolution
//   5. SUBMIT  → log the submission, confirmation tracking

export type TabId =
  | "setup"
  | "checklist"
  | "documents"
  | "validate"
  | "bidquals"
  | "submit"
  // Legacy tab IDs kept for internal sub-tab routing / onNavigateTab compatibility
  | "overview"
  | "estimate"
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
  onNavigate?: (tab: TabId) => void;
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

// ── Phase definitions ──
export type PhaseId = "setup" | "documents" | "checklist" | "validate" | "submit";

export interface Phase {
  id: PhaseId;
  label: string;
  shortLabel: string;
  desc: string;
  tabs: TabId[];
  defaultTab: TabId;
}

export const CROSS_PHASE_TABS: TabId[] = [];

export const PHASES: Phase[] = [
  { id: "setup",     label: "Intake",   shortLabel: "INTAKE",   desc: "Project info & assemblies",  tabs: ["setup"], defaultTab: "setup" },
  { id: "documents", label: "Read",     shortLabel: "READ",     desc: "Specs, scope & documents",   tabs: ["documents", "scope", "addenda", "rfis", "quotes"], defaultTab: "documents" },
  { id: "checklist", label: "Verify",   shortLabel: "VERIFY",   desc: "Preflight checklist",        tabs: ["checklist"], defaultTab: "checklist" },
  { id: "validate",  label: "Validate", shortLabel: "VALIDATE", desc: "Risk & readiness",           tabs: ["validate", "validator", "decisions", "bidquals"], defaultTab: "validate" },
  { id: "submit",    label: "Submit",   shortLabel: "SUBMIT",   desc: "Log submission",             tabs: ["submit"], defaultTab: "submit" },
];

export function getPhaseForTab(tabId: TabId): Phase | undefined {
  return PHASES.find((p) => p.tabs.includes(tabId));
}

export function getPhaseIndex(tabId: TabId): number {
  return PHASES.findIndex((p) => p.tabs.includes(tabId));
}
