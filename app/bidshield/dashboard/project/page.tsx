"use client";

import { Suspense, useMemo, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

import { getRoofSystem, getRoofSystemByAssembly } from "@/lib/bidshield/roof-systems";

import type { TabId } from "./tab-types";
import {
  ChecklistTab, TakeoffTab, PricingTab, MaterialsTab,
  ScopeTab, QuotesTab, RFIsTab, AddendaTab, LaborTab, ValidatorTab,
} from "./tabs";

const BROWSE_ITEMS: { id: TabId; label: string }[] = [
  { id: "checklist", label: "Checklist" },
  { id: "scope", label: "Scope" },
  { id: "takeoff", label: "Takeoff" },
  { id: "materials", label: "Materials" },
  { id: "pricing", label: "Pricing" },
  { id: "labor", label: "Labor" },
  { id: "quotes", label: "Quotes" },
  { id: "addenda", label: "Addenda" },
  { id: "rfis", label: "RFIs" },
  { id: "validator", label: "Validate" },
];

type ActionLevel = "blocker" | "warning" | "info";
interface ActionItem { level: ActionLevel; title: string; detail?: string; tab: TabId; }

function ProjectDetail() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  const project = useQuery(api.bidshield.getProject, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const checklist = useQuery(api.bidshield.getChecklist, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const quotes = useQuery(api.bidshield.getQuotes, !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip");
  const rfis = useQuery(api.bidshield.getRFIs, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const addenda = useQuery(api.bidshield.getAddenda, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const projectMaterials = useQuery(api.bidshield.getProjectMaterials, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const scopeItems = useQuery(api.bidshield.getScopeItems, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");

  const projectData = isDemo
    ? { name: "Meridian Business Park — Bldg C", location: "Charlotte, NC", bidDate: "2026-03-07",
        status: "in_progress" as const, gc: "Skanska USA", sqft: 68000,
        estimatedValue: 1250000, assemblies: ["TPO 60mil", "Tapered ISO"],
        notes: "Pre-bid walkthrough completed 2/12. Owner wants 20-yr NDL warranty. Existing roof has wet insulation in NE quadrant.",
        trade: "roofing", systemType: "tpo", deckType: "steel",
        primaryAssembly: "TPO 60mil Mechanically Attached",
        grossRoofArea: 68000, totalBidAmount: 1250000, materialCost: 612000, laborCost: 488000 }
    : project;

  const openTab = useCallback((tab: TabId) => setActiveTab(tab), []);

  const { actionItems, readinessScore, passCount, scores } = useMemo(() => {
    const items: ActionItem[] = [];
    const cl = isDemo ? [] : (checklist ?? []);
    const clTotal = isDemo ? 95 : cl.length;
    const clDone = isDemo ? 68 : cl.filter((i: any) => i.status === "done" || i.status === "na").length;
    const clPct = clTotal > 0 ? Math.round((clDone / clTotal) * 100) : 0;
    const clPending = clTotal - clDone;
    const clRfi = isDemo ? 3 : cl.filter((i: any) => i.status === "rfi").length;

    const sc = isDemo ? Array.from({ length: 40 }, (_, i) => ({ status: i < 14 ? "included" : i < 16 ? "excluded" : i < 18 ? "by_others" : i < 21 ? "na" : "unaddressed" })) : (scopeItems ?? []);
    const scTotal = sc.length;
    const scUnaddressed = sc.filter((s: any) => s.status === "unaddressed").length;
    const scPct = scTotal > 0 ? Math.round(((scTotal - scUnaddressed) / scTotal) * 100) : 100;

    const demoSections = [{ squareFeet: 28500 }, { squareFeet: 24800 }, { squareFeet: 8200 }, { squareFeet: 3400 }];
    const sections = isDemo ? demoSections : (takeoffSections ?? []);
    const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
    const controlSF = isDemo ? 68000 : (projectData as any)?.grossRoofArea ?? 0;
    const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
    const deltaPct = controlSF > 0 ? (deltaSF / controlSF) * 100 : null;

    const mats = isDemo ? Array.from({ length: 12 }, () => ({ unitPrice: 100, totalCost: 5000 })) : (projectMaterials ?? []);
    const matUnpriced = mats.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

    const qs = isDemo ? [] : (quotes ?? []);
    const qCount = isDemo ? 5 : qs.length;
    const expiring = isDemo ? 1 : qs.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;
    const expired = isDemo ? 0 : qs.filter((q: any) => { const d = q.expirationDate; return d && new Date(d).getTime() < Date.now(); }).length;

    const ad = isDemo ? [] : (addenda ?? []);
    const adCount = isDemo ? 3 : ad.length;
    const adNotReviewed = isDemo ? 0 : ad.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
    const adNotRepriced = isDemo ? 1 : ad.filter((a: any) => a.affectsScope === true && !a.repriced).length;

    const rs = isDemo ? [] : (rfis ?? []);
    const rCount = isDemo ? 3 : rs.length;
    const rPending = isDemo ? 1 : rs.filter((r: any) => r.status === "sent" || r.status === "draft").length;

    const bidAmt = (projectData as any)?.totalBidAmount;
    const matCost = (projectData as any)?.materialCost;
    const labCost = (projectData as any)?.laborCost;
    const pricingDone = !!(bidAmt && bidAmt > 0 && matCost && labCost);

    if (scUnaddressed > 0) items.push(scPct < 80
      ? { level: "blocker", title: `${scUnaddressed} scope items unaddressed`, detail: "Mark each as included, excluded, or by others", tab: "scope" }
      : { level: "warning", title: `${scUnaddressed} scope items remaining`, tab: "scope" });
    if (adNotRepriced > 0) items.push({ level: "blocker", title: `${adNotRepriced} addend${adNotRepriced > 1 ? "a" : "um"} not re-priced`, detail: "Scope changes need pricing updates", tab: "addenda" });
    if (deltaPct !== null && deltaPct > 5) items.push({ level: "blocker", title: `${deltaSF.toLocaleString()} SF gap in takeoff`, detail: `${Math.round(deltaPct)}% doesn't match plans`, tab: "takeoff" });
    else if (deltaPct !== null && deltaPct > 2) items.push({ level: "warning", title: `${deltaSF.toLocaleString()} SF takeoff gap`, tab: "takeoff" });
    if (expired > 0) items.push({ level: "blocker", title: `${expired} expired quote${expired > 1 ? "s" : ""}`, tab: "quotes" });
    if (expiring > 0) items.push({ level: "warning", title: `${expiring} quote${expiring > 1 ? "s" : ""} expiring soon`, tab: "quotes" });
    if (adNotReviewed > 0) items.push({ level: "warning", title: `${adNotReviewed} addend${adNotReviewed > 1 ? "a" : "um"} not reviewed`, tab: "addenda" });
    if (rPending > 0) items.push({ level: "info", title: `${rPending} RFI${rPending > 1 ? "s" : ""} awaiting response`, tab: "rfis" });
    if (clPct < 80) items.push({ level: clPct < 50 ? "blocker" : "warning", title: `Checklist ${clPct}% — ${clPending} items left`, tab: "checklist" });
    if (clRfi > 0) items.push({ level: "info", title: `${clRfi} checklist items flagged as RFI`, tab: "checklist" });
    if (mats.length === 0) items.push({ level: "warning", title: "Materials not calculated", tab: "materials" });
    else if (matUnpriced > 0) items.push({ level: "warning", title: `${matUnpriced} materials missing pricing`, tab: "materials" });
    if (!pricingDone) items.push({ level: "warning", title: "Pricing not complete", tab: "pricing" });

    items.sort((a, b) => ({ blocker: 0, warning: 1, info: 2 }[a.level]) - ({ blocker: 0, warning: 1, info: 2 }[b.level]));

    // All scores Math.rounded — no floats displayed
    const scores = {
      checklist: clPct,
      scope: scPct,
      takeoff: Math.round(deltaPct !== null ? Math.max(0, 100 - deltaPct * 10) : (controlSF > 0 ? 0 : 50)),
      pricing: pricingDone ? 100 : (bidAmt ? 50 : 0),
      materials: mats.length > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      quotes: qCount > 0 ? (expired === 0 ? (expiring === 0 ? 100 : 70) : 40) : 50,
      addenda: adCount > 0 ? (adNotRepriced === 0 && adNotReviewed === 0 ? 100 : 40) : 100,
      rfis: rCount > 0 ? (rPending === 0 ? 100 : 60) : 100,
    };
    const w = { checklist: 0.25, scope: 0.20, takeoff: 0.15, pricing: 0.15, materials: 0.10, quotes: 0.05, addenda: 0.05, rfis: 0.05 };
    const readiness = Math.round(Object.entries(w).reduce((s, [k, v]) => s + (scores[k as keyof typeof scores] ?? 0) * v, 0));
    const passes = [scPct >= 100, adCount === 0 || (adNotRepriced === 0 && adNotReviewed === 0), expired === 0 && expiring === 0, rPending === 0, clPct >= 80, mats.length > 0 && matUnpriced === 0, pricingDone].filter(Boolean).length;

    return { actionItems: items, readinessScore: readiness, passCount: passes, scores };
  }, [isDemo, projectData, checklist, scopeItems, takeoffSections, projectMaterials, quotes, addenda, rfis]);

  if (!projectIdParam) return <div className="text-center py-20"><p className="text-slate-500">No project selected.</p></div>;
  if (!isDemo && !projectData) return <div className="text-center py-20"><div className="text-slate-400 text-sm">Loading...</div></div>;

  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const blockerCount = actionItems.filter(a => a.level === "blocker").length;
  const warnCount = actionItems.filter(a => a.level === "warning").length;
  const tabProps = { projectId: projectIdParam, isDemo, project: projectData, userId: userId ?? undefined, onNavigateTab: openTab };
  const activeTabLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label;

  const sysId = (projectData as any)?.systemType;
  const assembly = (projectData as any)?.primaryAssembly;
  const sys = sysId ? getRoofSystem(sysId) : assembly ? getRoofSystemByAssembly(assembly) : undefined;
  const grossArea = (projectData as any)?.grossRoofArea;
  const bidAmt = (projectData as any)?.totalBidAmount;
  const dpsf = grossArea && bidAmt ? Math.round((bidAmt / grossArea) * 100) / 100 : null;

  const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="-m-6 flex" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Panel A — dark left project sidebar (full height) */}
      <aside
        className="hidden lg:flex flex-col shrink-0 border-r border-white/10 overflow-y-auto"
        style={{ width: 220, background: "#0f1117", minHeight: "calc(100vh - 4rem)" }}
      >
        {/* Project info */}
        <div className="px-4 pt-4 pb-3 border-b border-white/8">
          <div className="text-white font-semibold text-[13px] leading-snug">{projectData?.name}</div>
          <div className="text-slate-400 text-[11px] mt-0.5">{projectData?.location}</div>
          {(projectData as any)?.gc && (
            <div className="text-slate-500 text-[11px]">{(projectData as any).gc}</div>
          )}
          {/* Readiness bar — always green */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%`, background: "#10b981" }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{readinessScore}% bid ready</div>
        </div>

        {/* Section nav — no truncation, Math.rounded % */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {BROWSE_ITEMS.map(({ id, label }) => {
            const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
            const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
            const dotColor = hasBlocker ? "#ef4444" : hasWarning ? "#f59e0b" : "#10b981";
            const sectionScore = scores[id as keyof typeof scores];
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(isActive ? null : id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all"
                style={isActive
                  ? { background: "rgba(255,255,255,0.08)", color: "#ffffff", boxShadow: "inset 2px 0 0 #10b981" }
                  : { color: "#94a3b8" }
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                  {/* No truncate — sidebar is wide enough */}
                  <span className="text-[13px] font-medium">{label}</span>
                </div>
                {sectionScore !== undefined && (
                  <span className="text-[10px] font-bold shrink-0" style={{ color: scoreColor(sectionScore) }}>
                    {sectionScore}%
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status pills */}
        <div className="px-3 pb-4 pt-2 border-t border-white/8 flex flex-wrap gap-1.5">
          {blockerCount > 0 && (
            <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
              {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
              {warnCount} warning{warnCount > 1 ? "s" : ""}
            </span>
          )}
          {passCount > 0 && (
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
              {passCount} passing
            </span>
          )}
        </div>
      </aside>

      {/* Right side: breadcrumb + panels B + C stacked */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Breadcrumb bar — only spans panels B + C, no dark sidebar overlap */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <Link
              href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              All projects
            </Link>
            <span className="text-slate-200 shrink-0">/</span>
            <span
              className={`font-medium truncate max-w-[200px] ${activeTab ? "text-slate-500 cursor-pointer hover:text-slate-700" : "text-slate-800"}`}
              onClick={activeTab ? () => setActiveTab(null) : undefined}
            >
              {projectData?.name ?? "Project"}
            </span>
            {activeTab && (
              <>
                <span className="text-slate-200 shrink-0">/</span>
                <span className="text-slate-900 font-semibold shrink-0">{activeTabLabel}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {daysUntilBid !== null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                daysUntilBid <= 0 ? "bg-red-100 text-red-600"
                  : daysUntilBid <= 3 ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {daysUntilBid > 0 ? `${daysUntilBid}d to bid` : daysUntilBid === 0 ? "Due today" : "Past due"}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                <circle cx="12" cy="12" r="9" fill="none"
                  stroke={readinessScore >= 90 ? "#059669" : readinessScore >= 70 ? "#f59e0b" : "#dc2626"}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 9}`}
                  strokeDashoffset={`${2 * Math.PI * 9 * (1 - readinessScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                />
              </svg>
              <span className="text-xs text-slate-500 font-medium">{readinessScore}%</span>
            </div>
          </div>
        </div>

        {/* Panels B + C side by side */}
        <div className="flex-1 flex overflow-hidden">

          {/* Panel B — main white content */}
          <main className="flex-1 bg-white overflow-auto min-w-0">
            {activeTab ? (
              <>
                {/* Tab sticky header */}
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
                  <button
                    onClick={() => setActiveTab(null)}
                    className="text-sm text-slate-400 hover:text-slate-700 flex items-center gap-1 lg:hidden"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                  <h2 className="text-[15px] font-semibold text-slate-900">{activeTabLabel}</h2>
                </div>
                <div className="p-6">
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
              </>
            ) : (
              /* Overview */
              <div className="p-6 pb-28 max-w-2xl">
                {/* Mobile: Panel C stats (roof system + bid numbers) */}
                <div className="lg:hidden mb-6 rounded-xl border border-slate-200 overflow-hidden bg-white">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Roof System</div>
                    <div className="text-[13px] font-semibold text-slate-800">
                      {assembly || sys?.fullName || sysId?.toUpperCase() || "Not set"}
                    </div>
                    {sys && <div className="text-[11px] text-slate-500">CSI {sys.csiSection}</div>}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="px-3 py-2.5">
                      <div className="text-[13px] font-bold text-slate-800">{grossArea ? grossArea.toLocaleString() : "—"}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">SF</div>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="text-[13px] font-bold text-slate-800">{bidAmt ? `$${Math.round(bidAmt / 1000)}K` : "—"}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Bid</div>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="text-[13px] font-bold text-slate-800">{dpsf ? `$${dpsf.toFixed(2)}` : "—"}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">$/SF</div>
                    </div>
                  </div>
                </div>

                {/* Mobile section nav */}
                <div className="lg:hidden flex flex-wrap gap-2 mb-6">
                  {BROWSE_ITEMS.map(({ id, label }) => {
                    const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                    const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                    return (
                      <button
                        key={id}
                        onClick={() => openTab(id)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1.5 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${hasBlocker ? "bg-red-400" : hasWarning ? "bg-amber-400" : "bg-emerald-400"}`} />
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action items */}
                {actionItems.length === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                    <div className="text-3xl mb-3">✅</div>
                    <div className="text-sm font-bold text-emerald-700 mb-1">Bid ready to submit</div>
                    <div className="text-xs text-emerald-600 mb-4">All sections are complete and passing.</div>
                    <button
                      onClick={() => openTab("validator")}
                      className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Review & Export →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} · ` : ""}
                        {actionItems.length} need attention
                      </h2>
                      {passCount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">{passCount} passing ✓</span>
                      )}
                    </div>
                    {actionItems.map((item, i) => (
                      <button
                        key={`${item.tab}-${i}`}
                        onClick={() => openTab(item.tab)}
                        className={`w-full text-left rounded-xl p-4 transition-all active:scale-[0.98] border-l-4 border border-slate-100 ${
                          item.level === "blocker" ? "border-l-red-500 shadow-sm"
                            : item.level === "warning" ? "border-l-amber-400"
                            : "border-l-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-slate-900">{item.title}</div>
                            {item.detail && <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.level === "blocker" ? "bg-red-100 text-red-600"
                                : item.level === "warning" ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600"
                            }`}>
                              {item.level === "blocker" ? "Fix" : item.level === "warning" ? "Review" : "Info"}
                            </span>
                            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section Progress — fills the empty space below alerts */}
                <div className="mt-8">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Section Progress</h3>
                  <div className="flex flex-col gap-2.5">
                    {BROWSE_ITEMS.map(({ id, label }) => {
                      const score = scores[id as keyof typeof scores];
                      if (score === undefined) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => openTab(id)}
                          className="flex items-center gap-3 group"
                        >
                          <span className="text-[12px] text-slate-500 group-hover:text-slate-900 font-medium w-20 text-left shrink-0 transition-colors">
                            {label}
                          </span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${score}%`, background: scoreColor(score) }}
                            />
                          </div>
                          <span
                            className="text-[11px] font-bold w-8 text-right shrink-0"
                            style={{ color: scoreColor(score) }}
                          >
                            {score}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile validate / submit button */}
                <div className="lg:hidden mt-8">
                  <button
                    onClick={() => openTab("validator")}
                    disabled={blockerCount > 0}
                    className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all active:scale-[0.98] ${
                      blockerCount > 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {blockerCount > 0
                      ? `Fix ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} first`
                      : actionItems.length > 0 ? "Review & Submit →" : "Submit Bid →"}
                  </button>
                </div>

              </div>
            )}
          </main>

          {/* Panel C — light right rail, fixed 280px, overflow-hidden */}
          <aside
            className="hidden lg:flex flex-col shrink-0 border-l border-slate-200 overflow-y-auto"
            style={{ width: 280, background: "#f8fafc", overflowX: "hidden" }}
          >
            {/* Roof system header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roof System</div>
              <div
                className="text-[13px] font-semibold text-slate-800 leading-snug"
                style={{ wordBreak: "break-word" }}
              >
                {assembly || sys?.fullName || sysId?.toUpperCase() || "Not set"}
              </div>
              {sys && <div className="text-[11px] text-slate-500 mt-0.5">CSI {sys.csiSection}</div>}
            </div>

            {/* Bid stats */}
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="px-3 py-2.5 border-r border-slate-200">
                <div className="text-[12px] font-bold text-slate-800">{grossArea ? grossArea.toLocaleString() : "—"}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">SF</div>
              </div>
              <div className="px-3 py-2.5 border-r border-slate-200">
                <div className="text-[12px] font-bold text-slate-800">{bidAmt ? `$${Math.round(bidAmt / 1000)}K` : "—"}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Bid</div>
              </div>
              <div className="px-3 py-2.5">
                <div className="text-[12px] font-bold text-slate-800">{dpsf ? `$${dpsf.toFixed(2)}` : "—"}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">$/SF</div>
              </div>
            </div>

            {/* System details */}
            {sys && (
              <div className="px-4 py-3 flex flex-col gap-3 border-b border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seam Method</div>
                  <div className="text-[12px] text-slate-700" style={{ wordBreak: "break-word" }}>
                    {sys.seamMethod.split("(")[0].trim()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Manufacturers</div>
                  <div className="flex flex-wrap gap-1">
                    {sys.manufacturers.slice(0, 4).map(m => (
                      <span key={m} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full" style={{ wordBreak: "break-word" }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Warranty Tiers</div>
                  <div className="flex flex-wrap gap-1">
                    {sys.warrantyOptions.map(w => (
                      <span key={w} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thickness</div>
                  <div className="text-[12px] text-slate-700" style={{ wordBreak: "break-word" }}>
                    {sys.thicknessOptions.join(" · ")}
                  </div>
                </div>
                <button
                  onClick={() => openTab("materials")}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold text-left transition-colors"
                >
                  {sys.requiredMaterials.length} materials for this system →
                </button>
              </div>
            )}

            {/* Notes */}
            {(projectData as any)?.notes && (
              <div className="px-4 py-3 border-b border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</div>
                <p className="text-[11px] text-slate-600 leading-relaxed" style={{ wordBreak: "break-word" }}>
                  {(projectData as any).notes}
                </p>
              </div>
            )}

            {/* Submit CTA */}
            <div className="p-4 mt-auto">
              <button
                onClick={() => openTab("validator")}
                disabled={blockerCount > 0}
                className={`w-full py-3 rounded-lg text-[13px] font-bold transition-all ${
                  blockerCount > 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                }`}
              >
                {blockerCount > 0
                  ? `Fix ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} first`
                  : actionItems.length > 0 ? "Review & Submit →" : "Submit Bid →"}
              </button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-slate-400 text-sm">Loading...</div></div>}>
      <ProjectDetail />
    </Suspense>
  );
}
