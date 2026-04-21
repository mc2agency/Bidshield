"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import PricingTab from "./PricingTab";
import TakeoffTab from "./TakeoffTab";
import MaterialsTab from "./MaterialsTab";
import LaborTab from "./LaborTab";
import GeneralConditionsTab from "./GeneralConditionsTab";

type SubTabId = "pricing" | "takeoff" | "materials" | "labor" | "genconds";

const SUB_TABS: { id: SubTabId; label: string }[] = [
  { id: "pricing", label: "Recap" },
  { id: "takeoff", label: "Takeoff" },
  { id: "materials", label: "Materials" },
  { id: "labor", label: "Labor" },
  { id: "genconds", label: "Gen. Conds" },
];

function formatDollar(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function EstimateTab({
  projectId,
  isDemo,
  isPro,
  project,
  userId,
  onNavigateTab,
}: TabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("pricing");

  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  // Queries for the summary bar
  const projectMaterials = useQuery(
    api.bidshield.getProjectMaterials,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborTotal = useQuery(
    api.bidshield.getLaborTotal,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const gcItems = useQuery(
    api.bidshield.getGCItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // Compute summary totals
  const materialTotal = isDemo
    ? 159978
    : Math.round((projectMaterials ?? []).reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0));

  const computedLaborTotal = isDemo ? 77430 : (laborTotal ?? 0);

  const gcLineItemsTotal = isDemo
    ? 14000
    : (gcItems ?? [])
        .filter((i: any) => !i.isMarkup)
        .reduce((s: number, i: any) => s + (i.total ?? 0), 0);

  const gcMarkupBase = materialTotal + computedLaborTotal + gcLineItemsTotal;
  const gcMarkupTotal = isDemo
    ? 36900
    : (gcItems ?? [])
        .filter((i: any) => i.isMarkup)
        .reduce((s: number, i: any) => s + gcMarkupBase * ((i.markupPct ?? 0) / 100), 0);

  const gcTotal = isDemo ? 50900 : Math.round(gcLineItemsTotal + gcMarkupTotal);

  // Total bid: use project.totalBidAmount if set, otherwise auto-sum
  const autoTotalBid = materialTotal + computedLaborTotal + gcTotal;
  const totalBid = project?.totalBidAmount || autoTotalBid;

  // Cost/SF
  const grossRoofArea = project?.grossRoofArea || 1;
  const costPerSf = totalBid / grossRoofArea;

  const summaryCards = [
    { label: "Material Total", value: materialTotal },
    { label: "Labor Total", value: computedLaborTotal },
    { label: "Gen. Conds Total", value: gcTotal },
    { label: "Total Bid", value: totalBid },
    { label: "Cost/SF", value: costPerSf, format: (n: number) => "$" + n.toFixed(2) },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Pricing Summary Bar */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-lg"
        style={{
          background: "var(--bs-bg-card)",
          border: "1px solid var(--bs-border)",
        }}
      >
        {summaryCards.map(({ label, value, format }) => (
          <div key={label} className="flex flex-col gap-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--bs-text-muted)" }}
            >
              {label}
            </p>
            <p
              className="text-lg font-bold bs-num"
              style={{ color: "var(--bs-text-primary)" }}
            >
              {format ? format(value) : formatDollar(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Sub-Tab Bar */}
      <div
        className="flex gap-1 border-b"
        style={{ borderColor: "var(--bs-border)", background: "var(--bs-bg-elevated)" }}
      >
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className="px-4 py-2 text-sm font-medium transition-colors relative"
            style={{
              color:
                activeSubTab === id ? "var(--bs-teal)" : "var(--bs-text-muted)",
            }}
          >
            {label}
            {activeSubTab === id && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "var(--bs-teal)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeSubTab === "pricing" && (
          <PricingTab
            projectId={projectId}
            isDemo={isDemo}
            isPro={isPro}
            project={project}
            userId={userId}
            onNavigateTab={onNavigateTab}
          />
        )}
        {activeSubTab === "takeoff" && (
          <TakeoffTab
            projectId={projectId}
            isDemo={isDemo}
            isPro={isPro}
            project={project}
            userId={userId}
            onNavigateTab={onNavigateTab}
          />
        )}
        {activeSubTab === "materials" && (
          <MaterialsTab
            projectId={projectId}
            isDemo={isDemo}
            isPro={isPro}
            project={project}
            userId={userId}
            onNavigateTab={onNavigateTab}
          />
        )}
        {activeSubTab === "labor" && (
          <LaborTab
            projectId={projectId}
            isDemo={isDemo}
            isPro={isPro}
            project={project}
            userId={userId}
            onNavigateTab={onNavigateTab}
          />
        )}
        {activeSubTab === "genconds" && (
          <GeneralConditionsTab
            projectId={projectId}
            isDemo={isDemo}
            isPro={isPro}
            project={project}
            userId={userId}
            onNavigateTab={onNavigateTab}
          />
        )}
      </div>
    </div>
  );
}
