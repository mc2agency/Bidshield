export type TabId =
  | "overview"
  | "checklist"
  | "takeoff"
  | "pricing"
  | "materials"
  | "quotes"
  | "rfis"
  | "addenda"
  | "labor"
  | "validator"
  | "analytics";

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
}
