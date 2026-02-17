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
import type { PhaseStatus } from "./ProjectTabBar";
import type { TabConfig, TabId, PhaseId } from "./tab-types";
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

// ── Readiness Score SVG ──
function ReadinessGauge({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 90 ? "#059669" : score >= 70 ? "#f59e0b" : score >= 50 ? "#ea580c" : "#dc2626";
  const bgColor = score >= 90 ? "#d1fae5" : score >= 70 ? "#fef3c7" : score >= 50 ? "#ffedd5" : "#fee2e2";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bgColor} strokeWidth="5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold" style={{ color, lineHeight: 1 }}>{score}%</span>
        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-wider">Ready</span>
      </div>
    </div>
  );
}

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

  // ── Calculate phase statuses ──
  const phaseStatuses: PhaseStatus[] = useMemo(() => {
    const checklistItems = isDemo ? [] : (checklist ?? []);
    const totalCl = isDemo ? 95 : checklistItems.length;
    const doneCl = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
    const clPct = totalCl > 0 ? Math.round((doneCl / totalCl) * 100) : 0;
    const scopeTotal = isDemo ? 40 : (scopeItems ?? []).length;
    const scopeUnaddressed = isDemo ? 19 : (scopeItems ?? []).filter((s: any) => s.status === "unaddressed").length;
    const scopePct = scopeTotal > 0 ? Math.round(((scopeTotal - scopeUnaddressed) / scopeTotal) * 100) : 0;
    const matItems = isDemo ? 12 : (projectMaterials ?? []).length;
    const unpricedMats = isDemo ? 0 : (projectMaterials ?? []).filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;
    const quoteCount = isDemo ? 5 : (quotes ?? []).length;
    const openRFIs = isDemo ? 1 : (rfis ?? []).filter((r: any) => r.status === "sent" || r.status === "draft").length;
    const addendaCount = isDemo ? 3 : (addenda ?? []).length;
    const addendaNeedsAction = isDemo ? 1 : (addenda ?? []).filter((a: any) =>
      (a.affectsScope === undefined || a.affectsScope === null) || (a.affectsScope === true && !a.repriced)
    ).length;
    const hasProject = !!projectData;
    const hasBidDate = !!projectData?.bidDate;
    const hasGC = !!(projectData as any)?.gc;

    return [
      {
        id: "setup" as PhaseId,
        pct: isDemo ? 85 : (hasProject && hasBidDate && hasGC ? 90 : hasProject ? 60 : 0),
        blockers: isDemo ? 0 : (openRFIs > 0 ? openRFIs : 0) + (addendaNeedsAction > 0 ? addendaNeedsAction : 0),
        warnings: openRFIs,
      },
      {
        id: "takeoff" as PhaseId,
        pct: isDemo ? 92 : (matItems > 0 ? 80 : 0),
        blockers: isDemo ? 1 : 0,
        warnings: 0,
      },
      {
        id: "price" as PhaseId,
        pct: isDemo ? 100 : (quoteCount > 0 && unpricedMats === 0 ? 90 : quoteCount > 0 ? 60 : 0),
        blockers: isDemo ? 0 : unpricedMats,
        warnings: 0,
      },
      {
        id: "qa" as PhaseId,
        pct: isDemo ? 55 : Math.round((clPct * 0.6 + scopePct * 0.4)),
        blockers: isDemo ? 2 : (scopeUnaddressed > 10 ? 1 : 0),
        warnings: isDemo ? 0 : (scopeUnaddressed > 0 ? scopeUnaddressed : 0),
      },
      {
        id: "submit" as PhaseId,
        pct: isDemo ? 0 : 0,
        blockers: 0,
        warnings: 0,
      },
    ];
  }, [isDemo, projectData, checklist, quotes, rfis, addenda, projectMaterials, scopeItems]);

  // Overall readiness (weighted average of phases)
  const readinessScore = useMemo(() => {
    const weights = [0.10, 0.25, 0.20, 0.30, 0.15]; // setup, takeoff, price, qa, submit
    return Math.round(phaseStatuses.reduce((sum, s, i) => sum + s.pct * weights[i], 0));
  }, [phaseStatuses]);

  const totalBlockers = phaseStatuses.reduce((sum, s) => sum + s.blockers, 0);

  // ── Tab configs (same as before but used by sub-tab row) ──
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
      { id: "overview" as TabId, label: "Overview", icon: "📋" },
      { id: "addenda" as TabId, label: "Addenda", icon: "📁",
        badge: addendaNeedsAction > 0 ? { label: `${addendaNeedsAction}`, color: "red" as const }
          : addendaCount > 0 ? { label: `${addendaCount}`, color: "green" as const }
          : undefined },
      { id: "rfis" as TabId, label: "RFIs", icon: "📨",
        badge: openRFIs > 0 ? { label: `${openRFIs}`, color: "amber" as const }
          : rfiCount > 0 ? { label: `${rfiCount}`, color: "green" as const }
          : undefined },
      { id: "takeoff" as TabId, label: "Takeoff", icon: "📐" },
      { id: "materials" as TabId, label: "Materials", icon: "🧱",
        badge: unpricedMats > 0 ? { label: `${unpricedMats}`, color: "amber" as const }
          : matItems > 0 ? { label: `${matItems}`, color: "green" as const }
          : undefined },
      { id: "pricing" as TabId, label: "Pricing", icon: "💲" },
      { id: "labor" as TabId, label: "Labor", icon: "👷" },
      { id: "quotes" as TabId, label: "Quotes", icon: "💰",
        badge: quoteCount > 0 ? { label: `${quoteCount}`, color: "blue" as const } : undefined },
      { id: "checklist" as TabId, label: "Checklist", icon: "📋",
        badge: checklistPct === 100 ? { label: "✓", color: "green" as const }
          : checklistPct > 0 ? { label: `${checklistPct}%`, color: checklistPct >= 70 ? "amber" as const : "red" as const }
          : undefined },
      { id: "scope" as TabId, label: "Scope", icon: "🔍",
        badge: scopeUnaddressed > 0 ? { label: `${scopeUnaddressed}`, color: "amber" as const }
          : scopeTotal > 0 ? { label: "✓", color: "green" as const }
          : undefined },
      { id: "validator" as TabId, label: "Validator", icon: "🛡️" },
    ];
  }, [isDemo, checklist, quotes, rfis, addenda, projectMaterials, scopeItems]);

  if (!projectIdParam) {
    return <div className="text-center py-20"><p className="text-slate-500">No project selected.</p></div>;
  }
  if (!isDemo && !projectData) {
    return <div className="text-center py-20"><div className="text-slate-400 text-sm">Loading project...</div></div>;
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
      {/* ═══ Project Header with Readiness Score ═══ */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Readiness Gauge */}
            <ReadinessGauge score={readinessScore} size={72} />

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
                className="text-[11px] text-slate-400 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                Dashboard
              </Link>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{projectData?.name || "Project"}</h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500">{projectData?.location}</span>
                {(projectData as any)?.gc && (
                  <span className="text-xs text-slate-400">· {(projectData as any).gc}</span>
                )}
                {systemType && <span className="text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded uppercase ring-1 ring-violet-200">{systemType}</span>}
                {deckType && <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded capitalize ring-1 ring-slate-200">{deckType}</span>}
              </div>
            </div>

            {/* Bid Date + Status */}
            <div className="text-right flex-shrink-0 hidden sm:block">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase ring-1 ${statusStyle.text} ${statusStyle.bg} ${statusStyle.ring}`}>
                {(projectData?.status || "setup").replace("_", " ")}
              </span>
              {daysUntilBid !== null && (
                <div className={`mt-1 text-xl font-bold ${
                  daysUntilBid <= 0 ? "text-red-600" : daysUntilBid <= 3 ? "text-amber-600" : daysUntilBid <= 7 ? "text-amber-500" : "text-emerald-600"
                }`}>
                  {daysUntilBid > 0 ? `${daysUntilBid}d` : daysUntilBid === 0 ? "TODAY" : "LATE"}
                </div>
              )}
              <div className="text-[10px] text-slate-400">
                {totalBlockers > 0 && <span className="text-red-500 font-semibold">{totalBlockers} blocker{totalBlockers > 1 ? "s" : ""} · </span>}
                {projectData?.bidDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Phase Pipeline + Sub-tabs ═══ */}
      <ProjectTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        phaseStatuses={phaseStatuses}
      />

      {/* ═══ Tab Content ═══ */}
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
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
