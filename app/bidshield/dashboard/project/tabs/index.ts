import dynamic from "next/dynamic";

// The 5 top-level tabs in the project page are lazy-loaded. Each one is
// fairly large (100–2000 LOC) and the user only ever views one at a time;
// eagerly bundling all five + their sub-tabs inflates the initial JS
// payload of /bidshield/dashboard/project by several hundred KB.
//
// ssr: false is safe — the parent page is "use client" and the tabs rely
// on Convex real-time subscriptions that must run client-side anyway.

export const SetupTab = dynamic(() => import("./SetupTab"), { ssr: false });
export const ChecklistTab = dynamic(() => import("./ChecklistTab"), { ssr: false });
export const EstimateTab = dynamic(() => import("./EstimateTab"), { ssr: false });
export const DocumentsTab = dynamic(() => import("./DocumentsTab"), { ssr: false });
export const ValidatorTab = dynamic(() => import("./ValidatorTab"), { ssr: false });

// Sub-tabs are consumed directly by EstimateTab / DocumentsTab and share
// their parent's chunk, so eager re-exports are fine here.
export { default as OverviewTab } from "./OverviewTabRedesign";
export { default as TakeoffTab } from "./TakeoffTab";
export { default as PricingTab } from "./PricingTab";
export { default as MaterialsTab } from "./MaterialsTab";
export { default as ScopeTab } from "./ScopeTab";
export { default as QuotesTab } from "./QuotesTab";
export { default as RFIsTab } from "./RFIsTab";
export { default as AddendaTab } from "./AddendaTab";
export { default as LaborTab } from "./LaborTab";
export { default as GeneralConditionsTab } from "./GeneralConditionsTab";
export { default as BidQualsTab } from "./BidQualsTab";
export { default as DecisionLogTab } from "./DecisionLogTab";
