// ── BidShield Workflow Architecture ──
// 5 phases that mirror the real estimating process:
//   1. Setup → understand the project
//   2. Takeoff → measure quantities  
//   3. Price → put dollars on it
//   4. QA → check your work
//   5. Submit → validate and send

export type TabId =
  | "overview"
  | "checklist"
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
  };
}

// ── Phase definitions ──
export type PhaseId = "setup" | "takeoff" | "price" | "qa" | "submit";

export interface Phase {
  id: PhaseId;
  label: string;
  shortLabel: string;
  tabs: TabId[];
  defaultTab: TabId;
}

export const PHASES: Phase[] = [
  {
    id: "setup",
    label: "Project Setup",
    shortLabel: "Setup",
    tabs: ["overview", "addenda", "rfis"],
    defaultTab: "overview",
  },
  {
    id: "takeoff",
    label: "Takeoff & Quantities",
    shortLabel: "Takeoff",
    tabs: ["takeoff", "materials"],
    defaultTab: "takeoff",
  },
  {
    id: "price",
    label: "Pricing & Costs",
    shortLabel: "Price",
    tabs: ["pricing", "labor", "generalconditions", "quotes"],
    defaultTab: "pricing",
  },
  {
    id: "qa",
    label: "Scope & Quality",
    shortLabel: "QA",
    tabs: ["checklist", "scope"],
    defaultTab: "checklist",
  },
  {
    id: "submit",
    label: "Validate & Submit",
    shortLabel: "Submit",
    tabs: ["validator", "bidquals"],
    defaultTab: "validator",
  },
];

export function getPhaseForTab(tabId: TabId): Phase | undefined {
  return PHASES.find((p) => p.tabs.includes(tabId));
}

export function getPhaseIndex(tabId: TabId): number {
  return PHASES.findIndex((p) => p.tabs.includes(tabId));
}
