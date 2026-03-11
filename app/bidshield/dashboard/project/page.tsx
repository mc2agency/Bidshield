"use client";

import { Suspense, useMemo, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  LayoutList, AlignLeft, Ruler, Package,
  DollarSign, Users, Quote, FileText,
  HelpCircle, CheckSquare,
} from "lucide-react";

import { getRoofSystem, getRoofSystemByAssembly } from "@/lib/bidshield/roof-systems";

import type { TabId } from "./tab-types";
import {
  ChecklistTab, TakeoffTab, PricingTab, MaterialsTab,
  ScopeTab, QuotesTab, RFIsTab, AddendaTab, LaborTab, ValidatorTab,
} from "./tabs";

const BROWSE_ITEMS: { id: TabId; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "checklist", label: "Checklist", Icon: LayoutList },
  { id: "scope",     label: "Scope",     Icon: AlignLeft },
  { id: "takeoff",   label: "Takeoff",   Icon: Ruler },
  { id: "materials", label: "Materials", Icon: Package },
  { id: "pricing",   label: "Pricing",   Icon: DollarSign },
  { id: "labor",     label: "Labor",     Icon: Users },
  { id: "quotes",    label: "Quotes",    Icon: Quote },
  { id: "addenda",   label: "Addenda",   Icon: FileText },
  { id: "rfis",      label: "RFIs",      Icon: HelpCircle },
  { id: "validator", label: "Validate",  Icon: CheckSquare },
];

// 6-point dot color system: 0=gray, 1-49=amber, 50-99=blue, 100=green
function scoreDot(s: number): string {
  if (s === 0)   return "#6b7280";
  if (s < 50)    return "#f59e0b";
  if (s < 100)   return "#3b82f6";
  return "#10b981";
}

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

  return (
    <div className="-m-6 flex" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Panel A — premium dark sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 220,
          minHeight: "calc(100vh - 4rem)",
          background: "linear-gradient(180deg, #0f1117 0%, #141820 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Project info */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>
            {projectData?.name}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
            {projectData?.location}
          </div>
          {(projectData as any)?.gc && (
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{(projectData as any).gc}</div>
          )}
          {/* Progress bar — 4px, #10b981 fill */}
          <div style={{ marginTop: 14, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${readinessScore}%`, background: "#10b981", transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 5 }}>{readinessScore}% bid ready</div>
        </div>

        {/* Section nav — icons + label + status dot */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {BROWSE_ITEMS.map(({ id, label, Icon }) => {
            const sectionScore = scores[id as keyof typeof scores];
            const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
            const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
            const dot = sectionScore !== undefined
              ? scoreDot(sectionScore)
              : (hasBlocker ? "#ef4444" : hasWarning ? "#f59e0b" : "#6b7280");
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(isActive ? null : id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all group/item"
                style={isActive
                  ? { background: "rgba(16,185,129,0.1)", color: "#ffffff", borderLeft: "2px solid #10b981" }
                  : { color: "#6b7280" }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#d1d5db";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#6b7280";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} strokeWidth={1.75} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 500 : 400 }}>{label}</span>
                </div>
                {/* Status dot only — no colored % */}
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
              </button>
            );
          })}
        </nav>

        {/* Status pills */}
        <div className="px-3 pb-4 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {blockerCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: 9999 }}>
              {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
            </span>
          )}
          {warnCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "2px 8px", borderRadius: 9999 }}>
              {warnCount} warning{warnCount > 1 ? "s" : ""}
            </span>
          )}
          {passCount > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: 9999 }}>
              {passCount} passing
            </span>
          )}
        </div>
      </aside>

      {/* Right side: breadcrumb + panels B + C */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Breadcrumb bar — unified dark bg, 48px */}
        <div
          className="flex items-center justify-between shrink-0 px-5"
          style={{ background: "#0f1117", height: 48, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              className="hover:opacity-80 transition-opacity shrink-0 flex items-center gap-1"
              style={{ fontSize: 13, color: "#6b7280" }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              All projects
            </Link>
            <span style={{ fontSize: 13, color: "#374151" }}>/</span>
            <span
              style={{
                fontSize: 13,
                color: activeTab ? "#6b7280" : "#e5e7eb",
                cursor: activeTab ? "pointer" : undefined,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
              onClick={activeTab ? () => setActiveTab(null) : undefined}
            >
              {projectData?.name ?? "Project"}
            </span>
            {activeTab && (
              <>
                <span style={{ fontSize: 13, color: "#374151" }}>/</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, flexShrink: 0 }}>{activeTabLabel}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {daysUntilBid !== null && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 8,
                background: daysUntilBid <= 0 ? "rgba(239,68,68,0.15)" : "#1a2332",
                color: daysUntilBid <= 0 ? "#f87171" : "#10b981",
                border: `1px solid ${daysUntilBid <= 0 ? "rgba(239,68,68,0.4)" : "#10b981"}`,
              }}>
                {daysUntilBid > 0 ? `${daysUntilBid}d to bid` : daysUntilBid === 0 ? "Due today" : "Past due"}
              </span>
            )}
            {/* Static readiness — no spinner */}
            <span style={{ fontSize: 13, color: "#6b7280" }}>{readinessScore}% ready</span>
          </div>
        </div>

        {/* Panels B + C */}
        <div className="flex-1 flex overflow-hidden">

          {/* Panel B — main content, #f8fafc bg */}
          <main className="flex-1 overflow-auto min-w-0" style={{ background: "#f8fafc" }}>
            {activeTab ? (
              <>
                {/* Tab header */}
                <div
                  className="px-6 py-3 border-b flex items-center gap-3 sticky top-0 z-10"
                  style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  <button
                    onClick={() => setActiveTab(null)}
                    className="flex items-center gap-1 lg:hidden"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}>{activeTabLabel}</h2>
                </div>
                <div className="p-6">
                  {activeTab === "checklist" && <ChecklistTab {...tabProps} />}
                  {activeTab === "takeoff"   && <TakeoffTab   {...tabProps} />}
                  {activeTab === "pricing"   && <PricingTab   {...tabProps} />}
                  {activeTab === "materials" && <MaterialsTab {...tabProps} />}
                  {activeTab === "scope"     && <ScopeTab     {...tabProps} />}
                  {activeTab === "quotes"    && <QuotesTab    {...tabProps} />}
                  {activeTab === "rfis"      && <RFIsTab      {...tabProps} />}
                  {activeTab === "addenda"   && <AddendaTab   {...tabProps} />}
                  {activeTab === "labor"     && <LaborTab     {...tabProps} />}
                  {activeTab === "validator" && <ValidatorTab {...tabProps} />}
                </div>
              </>
            ) : (
              /* Overview */
              <div className="p-6 max-w-2xl">
                {/* Mobile section nav */}
                <div className="lg:hidden flex flex-wrap gap-2 mb-6">
                  {BROWSE_ITEMS.map(({ id, label, Icon }) => {
                    const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                    const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                    const dot = hasBlocker ? "#ef4444" : hasWarning ? "#f59e0b" : "#10b981";
                    return (
                      <button
                        key={id}
                        onClick={() => openTab(id)}
                        className="flex items-center gap-1.5 transition-all active:scale-95"
                        style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action items */}
                {actionItems.length === 0 ? (
                  <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "2rem", textAlign: "center" }}>
                    <div className="text-3xl mb-3">✅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Bid ready to submit</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>All sections are complete and passing.</div>
                    <button
                      onClick={() => openTab("validator")}
                      style={{ padding: "10px 24px", background: "#10b981", color: "white", fontSize: 14, fontWeight: 500, borderRadius: 8 }}
                    >
                      Review & Export →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <h2 style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} · ` : ""}
                        {actionItems.length} need attention
                      </h2>
                      {passCount > 0 && (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{passCount} passing ✓</span>
                      )}
                    </div>
                    {actionItems.map((item, i) => (
                      <button
                        key={`${item.tab}-${i}`}
                        onClick={() => openTab(item.tab)}
                        className="w-full text-left transition-all active:scale-[0.98]"
                        style={{
                          background: "white",
                          borderRadius: 10,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          padding: 16,
                          borderLeft: `3px solid ${item.level === "blocker" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#3b82f6"}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.title}</div>
                            {item.detail && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{item.detail}</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999,
                              background: item.level === "blocker" ? "#fef2f2" : item.level === "warning" ? "#fffbeb" : "#eff6ff",
                              color: item.level === "blocker" ? "#dc2626" : item.level === "warning" ? "#d97706" : "#2563eb",
                            }}>
                              {item.level === "blocker" ? "Fix" : item.level === "warning" ? "Review" : "Info"}
                            </span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#d1d5db">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section Progress */}
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
                    Section Progress
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {BROWSE_ITEMS.map(({ id, label }) => {
                      const score = scores[id as keyof typeof scores];
                      if (score === undefined) return null;
                      const dot = scoreDot(score);
                      return (
                        <button key={id} onClick={() => openTab(id)} className="flex items-center gap-3 group">
                          <span
                            className="group-hover:text-slate-900 transition-colors"
                            style={{ fontSize: 12, color: "#6b7280", width: 72, textAlign: "left", flexShrink: 0 }}
                          >
                            {label}
                          </span>
                          <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${score}%`, background: dot, borderRadius: 9999, transition: "width 0.5s" }} />
                          </div>
                          {/* Dot indicator */}
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                          {/* % in gray, no color */}
                          <span style={{ fontSize: 12, color: "#6b7280", width: 32, textAlign: "right", flexShrink: 0 }}>
                            {score}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Panel C — right info card, no dividers */}
          <aside
            className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
            style={{ width: 320, background: "#ffffff", borderLeft: "1px solid #e5e7eb", overflowX: "hidden" }}
          >
            <div style={{ padding: "20px 16px 0" }}>

              {/* Roof System */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>
                  Roof System
                </div>
                {(() => {
                  const raw = assembly || sys?.fullName || sysId?.toUpperCase() || "Not set";
                  const m = raw.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
                  const main = m?.[1]?.trim() ?? raw;
                  const sub = m?.[2]?.trim() ?? null;
                  return (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{main}</div>
                      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{sub}</div>}
                    </>
                  );
                })()}
                {sys && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>CSI {sys.csiSection}</div>}
              </div>

              {/* SF / BID / $/SF — card with no internal borders */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { value: grossArea ? grossArea.toLocaleString() : "—", label: "SF" },
                    { value: bidAmt ? `$${Math.round(bidAmt / 1000)}K` : "—", label: "Bid" },
                    { value: dpsf ? `$${dpsf.toFixed(2)}` : "—", label: "$/SF" },
                  ].map(({ value, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{value}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System details */}
              {sys && (
                <>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>
                      Seam Method
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                      {sys.seamMethod.split("(")[0].trim()}
                    </div>
                  </div>

                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>
                      Manufacturers
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sys.manufacturers.slice(0, 4).map(m => (
                        <span key={m} style={{ fontSize: 12, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 4 }}>{m}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => openTab("materials")}
                      style={{ fontSize: 12, color: "#10b981", marginTop: 8, fontWeight: 500 }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {sys.requiredMaterials.length} materials →
                    </button>
                  </div>

                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>
                      Warranty
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sys.warrantyOptions.map(w => (
                        <span key={w} style={{ fontSize: 12, background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: 4 }}>{w}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>
                      Thickness
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", wordBreak: "break-word" }}>
                      {sys.thicknessOptions.join(" · ")}
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {(projectData as any)?.notes && (
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>
                    Notes
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, wordBreak: "break-word" }}>
                    {(projectData as any).notes}
                  </p>
                </div>
              )}

              {/* Bid Readiness card — fills dead space before CTA */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>
                    Bid Readiness
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 10 }}>
                    {readinessScore}%
                  </div>
                  <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 9999, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${readinessScore}%`, background: "#10b981", borderRadius: 9999, transition: "width 0.5s" }} />
                  </div>
                  {daysUntilBid !== null && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {daysUntilBid > 0 ? `${daysUntilBid} days until bid` : daysUntilBid === 0 ? "Due today" : "Past due"}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* CTA — pinned to bottom */}
            <div style={{ padding: "0 16px 16px", marginTop: "auto" }}>
              <button
                onClick={() => openTab("validator")}
                disabled={blockerCount > 0}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: blockerCount > 0 ? "#f3f4f6" : "#10b981",
                  color: blockerCount > 0 ? "#9ca3af" : "#ffffff",
                  cursor: blockerCount > 0 ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s",
                }}
                className={blockerCount === 0 ? "hover:opacity-90" : ""}
              >
                {blockerCount > 0
                  ? `Fix ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} →`
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
