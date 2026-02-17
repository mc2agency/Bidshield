"use client";

import { Suspense, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

import { useHashTab } from "./use-hash";
import ProjectTabBar from "./ProjectTabBar";
import type { TabConfig, TabId } from "./tab-types";
import {
  OverviewTab, ChecklistTab, TakeoffTab, PricingTab, MaterialsTab,
  ScopeTab, QuotesTab, RFIsTab, AddendaTab, LaborTab, ValidatorTab,
} from "./tabs";

const statusColors: Record<string, { text: string; bg: string; ring: string }> = {
  setup: { text: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200" },
  in_progress: { text: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200" },
  submitted: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  won: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  lost: { text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
  no_bid: { text: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200" },
};

function ProjectDetail() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useHashTab("overview");

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );

  const checklist = useQuery(api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const quotes = useQuery(api.bidshield.getQuotes,
    !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip");
  const rfis = useQuery(api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const addenda = useQuery(api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const projectMaterials = useQuery(api.bidshield.getProjectMaterials,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const scopeItems = useQuery(api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");

  const projectData = isDemo
    ? {
        name: "Harbor Point Tower", location: "Jersey City, NJ", bidDate: "2026-02-15",
        status: "in_progress" as const, gc: "Turner Construction", sqft: 45000,
        estimatedValue: 850000, assemblies: ["TPO 60mil", "Tapered ISO"],
        notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
        trade: "roofing", systemType: "tpo", deckType: "steel",
        grossRoofArea: 45000, totalBidAmount: 850000,
      }
    : project;

  const onNavigateTab = useCallback((tab: TabId) => { setActiveTab(tab); }, [setActiveTab]);

  const tabs: TabConfig[] = useMemo(() => {
    const checklistItems = isDemo ? [] : (checklist ?? []);
    const totalItems = isDemo ? 95 : checklistItems.length;
    const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
    const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    const matItems = isDemo ? 12 : (projectMaterials ?? []).length;
    const unpricedMats = isDemo ? 0 : (projectMaterials ?? []).filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;
    const scopeTotal = isDemo ? 40 : (scopeItems ?? []).length;
    const scopeUnaddressed = isDemo ? 19 : (scopeItems ?? []).filter((s: any) => s.status === "unaddressed").length;
    const quoteCount = isDemo ? 5 : (quotes ?? []).length;
    const rfiCount = isDemo ? 3 : (rfis ?? []).length;
    const openRFIs = isDemo ? 1 : (rfis ?? []).filter((r: any) => r.status === "sent" || r.status === "draft").length;
    const addendaCount = isDemo ? 3 : (addenda ?? []).length;
    const addendaNeedsAction = isDemo ? 1 : (addenda ?? []).filter((a: any) =>
      (a.affectsScope === undefined || a.affectsScope === null) || (a.affectsScope === true && !a.repriced)
    ).length;

    return [
      { id: "overview" as TabId, label: "Overview", icon: "\uD83D\uDCCA" },
      { id: "checklist" as TabId, label: "Checklist", icon: "\uD83D\uDCCB",
        badge: checklistPct === 100 ? { label: "\u2713", color: "green" as const }
          : checklistPct > 0 ? { label: `${checklistPct}%`, color: checklistPct >= 70 ? "amber" as const : "red" as const }
          : undefined },
      { id: "takeoff" as TabId, label: "Takeoff", icon: "\uD83D\uDCD0" },
      { id: "pricing" as TabId, label: "Pricing", icon: "\uD83D\uDCB2" },
      { id: "materials" as TabId, label: "Materials", icon: "\uD83E\uDDF1",
        badge: unpricedMats > 0 ? { label: `${unpricedMats}`, color: "amber" as const }
          : matItems > 0 ? { label: `${matItems}`, color: "green" as const }
          : undefined },
      { id: "scope" as TabId, label: "Scope", icon: "\uD83D\uDD0D",
        badge: scopeUnaddressed > 0 ? { label: `${scopeUnaddressed}`, color: "amber" as const }
          : scopeTotal > 0 ? { label: "\u2713", color: "green" as const }
          : undefined },
      { id: "quotes" as TabId, label: "Quotes", icon: "\uD83D\uDCB0",
        badge: quoteCount > 0 ? { label: `${quoteCount}`, color: "blue" as const } : undefined },
      { id: "rfis" as TabId, label: "RFIs", icon: "\uD83D\uDCE8",
        badge: openRFIs > 0 ? { label: `${openRFIs}`, color: "amber" as const }
          : rfiCount > 0 ? { label: `${rfiCount}`, color: "green" as const }
          : undefined },
      { id: "addenda" as TabId, label: "Addenda", icon: "\uD83D\uDCC1",
        badge: addendaNeedsAction > 0 ? { label: `${addendaNeedsAction}`, color: "red" as const }
          : addendaCount > 0 ? { label: `${addendaCount}`, color: "green" as const }
          : undefined },
      { id: "labor" as TabId, label: "Labor", icon: "\uD83D\uDC77" },
      { id: "validator" as TabId, label: "Validator", icon: "\uD83D\uDEE1\uFE0F" },
    ];
  }, [isDemo, checklist, quotes, rfis, addenda, projectMaterials, scopeItems]);

  if (!projectIdParam) {
    return <div className="text-center py-20"><p className="text-slate-500">No project selected. Go back to the dashboard.</p></div>;
  }

  if (!isDemo && !projectData) {
    return <div className="text-center py-20"><p className="text-slate-500">Loading project...</p></div>;
  }

  const statusStyle = statusColors[projectData?.status || "setup"] || statusColors.setup;
  const systemType = (projectData as any)?.systemType;
  const deckType = (projectData as any)?.deckType;
  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const cachedData = {
    checklist: checklist ?? undefined, quotes: quotes ?? undefined, rfis: rfis ?? undefined,
    addenda: addenda ?? undefined, projectMaterials: projectMaterials ?? undefined, scopeItems: scopeItems ?? undefined,
  };

  const tabProps = { projectId: projectIdParam, isDemo, project: projectData, userId: userId ?? undefined, onNavigateTab };

  return (
    <div className="flex flex-col gap-0">
      {/* Project Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-5 max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <Link
                href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
                className="text-xs text-slate-400 hover:text-emerald-600 transition-colors mb-2 inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                Back to Dashboard
              </Link>
              <h2 className="text-xl font-bold text-slate-900">{projectData?.name || "Project"}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-slate-500">{projectData?.location}</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase ring-1 ${statusStyle.text} ${statusStyle.bg} ${statusStyle.ring}`}>
                  {(projectData?.status || "setup").replace("_", " ")}
                </span>
                {systemType && <span className="text-[10px] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md uppercase ring-1 ring-violet-200">{systemType}</span>}
                {deckType && <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md capitalize ring-1 ring-slate-200">{deckType} deck</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              {daysUntilBid !== null && (
                <div className={`text-2xl font-bold ${daysUntilBid <= 0 ? "text-red-600" : daysUntilBid <= 3 ? "text-amber-600" : daysUntilBid <= 7 ? "text-amber-500" : "text-emerald-600"}`}>
                  {daysUntilBid > 0 ? `${daysUntilBid} days` : daysUntilBid === 0 ? "TODAY" : "PAST DUE"}
                </div>
              )}
              <div className="text-xs text-slate-400">until bid &bull; {projectData?.bidDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <ProjectTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        {activeTab === "overview" && <OverviewTab {...tabProps} cachedData={cachedData} />}
        {activeTab === "checklist" && <ChecklistTab {...tabProps} />}
        {activeTab === "takeoff" && <TakeoffTab {...tabProps} />}
        {activeTab === "pricing" && <PricingTab {...tabProps} />}
        {activeTab === "materials" && <MaterialsTab {...tabProps} />}
        {activeTab === "scope" && <ScopeTab {...tabProps} />}
        {activeTab === "quotes" && <QuotesTab {...tabProps} />}
        {activeTab === "rfis" && <RFIsTab {...tabProps} />}
        {activeTab === "addenda" && <AddendaTab {...tabProps} />}
        {activeTab === "labor" && <LaborTab {...tabProps} />}
        {activeTab === "validator" && <ValidatorTab {...tabProps} />}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-slate-400 text-sm">Loading project...</div></div>}>
      <ProjectDetail />
    </Suspense>
  );
}
