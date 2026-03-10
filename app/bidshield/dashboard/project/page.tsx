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

function ReadinessGauge({ score, size = 52 }: { score: number; size?: number }) {
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
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-extrabold" style={{ color, lineHeight: 1 }}>{score}%</span>
      </div>
    </div>
  );
}

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
  const goHome = useCallback(() => setActiveTab(null), []);

  const { actionItems, readinessScore, passCount } = useMemo(() => {
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
    if (deltaPct !== null && deltaPct > 5) items.push({ level: "blocker", title: `${deltaSF.toLocaleString()} SF gap in takeoff`, detail: `${deltaPct.toFixed(1)}% doesn't match plans`, tab: "takeoff" });
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
      checklist: clPct, scope: scPct,
      takeoff: deltaPct !== null ? Math.max(0, 100 - deltaPct * 10) : (controlSF > 0 ? 0 : 50),
      pricing: pricingDone ? 100 : (bidAmt ? 50 : 0),
      materials: mats.length > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      quotes: qCount > 0 ? (expired === 0 ? (expiring === 0 ? 100 : 70) : 40) : 50,
      addenda: adCount > 0 ? (adNotRepriced === 0 && adNotReviewed === 0 ? 100 : 40) : 100,
      rfis: rCount > 0 ? (rPending === 0 ? 100 : 60) : 100,
    };
    const w = { checklist: 0.25, scope: 0.20, takeoff: 0.15, pricing: 0.15, materials: 0.10, quotes: 0.05, addenda: 0.05, rfis: 0.05 };
    const readiness = Math.round(Object.entries(w).reduce((s, [k, v]) => s + (scores[k as keyof typeof scores] ?? 0) * v, 0));
    const passes = [scPct >= 100, adCount === 0 || (adNotRepriced === 0 && adNotReviewed === 0), expired === 0 && expiring === 0, rPending === 0, clPct >= 80, mats.length > 0 && matUnpriced === 0, pricingDone].filter(Boolean).length;

    return { actionItems: items, readinessScore: readiness, passCount: passes };
  }, [isDemo, projectData, checklist, scopeItems, takeoffSections, projectMaterials, quotes, addenda, rfis]);

  if (!projectIdParam) return <div className="text-center py-20"><p className="text-slate-500">No project selected.</p></div>;
  if (!isDemo && !projectData) return <div className="text-center py-20"><div className="text-slate-400 text-sm">Loading...</div></div>;

  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const blockerCount = actionItems.filter(a => a.level === "blocker").length;
  const tabProps = { projectId: projectIdParam, isDemo, project: projectData, userId: userId ?? undefined, onNavigateTab: openTab };

  // ── FOCUSED VIEW: user tapped into a specific section ──
  if (activeTab) {
    const tabLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label ?? activeTab;
    return (
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={goHome} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            Back
          </button>
          <span className="text-sm font-semibold text-slate-900">{tabLabel}</span>
          <div className="w-12" />
        </div>
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
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

  // ── HOME: What needs your attention ──
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex items-center gap-3">
          <ReadinessGauge score={readinessScore} />
          <div className="flex-1 min-w-0">
            <Link href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              className="text-[10px] text-slate-400 hover:text-emerald-600 inline-flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              Dashboard
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">{projectData?.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
              <span>{projectData?.location}</span>
              {(projectData as any)?.gc && <><span>·</span><span>{(projectData as any).gc}</span></>}
            </div>
          </div>
          {daysUntilBid !== null && (
            <div className="text-right flex-shrink-0">
              <div className={`text-xl font-extrabold leading-tight ${daysUntilBid <= 0 ? "text-red-600" : daysUntilBid <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                {daysUntilBid > 0 ? `${daysUntilBid}d` : daysUntilBid === 0 ? "TODAY" : "LATE"}
              </div>
              <div className="text-[9px] text-slate-400">until bid</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT — blockers + unflagged sections */}
        <div className="lg:col-span-3 flex flex-col gap-4">
        {actionItems.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-sm font-bold text-emerald-700">Bid ready to submit</div>
            <button onClick={() => openTab("validator")} className="mt-3 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700">
              Review & Export →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} · ` : ""}{actionItems.length} need attention
              </h2>
              {passCount > 0 && <span className="text-[10px] text-emerald-600 font-medium">{passCount} passing ✓</span>}
            </div>
            {actionItems.map((item, i) => (
              <button key={`${item.tab}-${i}`} onClick={() => openTab(item.tab)}
                className={`w-full text-left rounded-xl p-4 transition-all active:scale-[0.98] ${
                  item.level === "blocker" ? "bg-white border-l-4 border-red-500 shadow-sm"
                    : item.level === "warning" ? "bg-white border-l-4 border-amber-400"
                    : "bg-white border-l-4 border-blue-300"
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    {item.detail && <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.level === "blocker" ? "bg-red-100 text-red-600" : item.level === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    }`}>{item.level === "blocker" ? "Fix" : item.level === "warning" ? "Review" : "Info"}</span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* All sections — always visible */}
        {(() => {
          const flaggedTabs = new Set(actionItems.map(a => a.tab));
          return (
            <div className="flex flex-wrap gap-2">
              {BROWSE_ITEMS.map((item) => (
                <button key={item.id} onClick={() => openTab(item.id)}
                  className="bg-white rounded-lg px-3 py-2.5 text-left hover:shadow-sm active:scale-[0.98] border border-slate-100 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${flaggedTabs.has(item.id) ? "bg-amber-400" : "bg-emerald-400"}`} />
                  <span className="text-xs font-medium text-slate-500">{item.label}</span>
                </button>
              ))}
            </div>
          );
        })()}

        </div>{/* end left column */}

        {/* RIGHT — roof system card + notes + submit */}
        <div className="lg:col-span-2 flex flex-col gap-4">

        {/* Roof System Specs — research-backed */}
        {(() => {
          const sysId = (projectData as any)?.systemType;
          const assembly = (projectData as any)?.primaryAssembly;
          const sys = sysId ? getRoofSystem(sysId) : assembly ? getRoofSystemByAssembly(assembly) : undefined;
          const grossArea = (projectData as any)?.grossRoofArea;
          const bidAmt = (projectData as any)?.totalBidAmount;
          const dpsf = grossArea && bidAmt ? bidAmt / grossArea : null;

          return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* System header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Roof System</div>
                  <div className="text-sm font-bold">{assembly || sys?.fullName || sysId?.toUpperCase() || "Not set"}</div>
                </div>
                {sys && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">CSI {sys.csiSection}</span>}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px bg-slate-100">
                <div className="bg-white p-3 text-center">
                  <div className="text-sm font-bold text-slate-900">{grossArea ? grossArea.toLocaleString() : "—"}</div>
                  <div className="text-[10px] text-slate-400">SQ FT</div>
                </div>
                <div className="bg-white p-3 text-center">
                  <div className="text-sm font-bold text-slate-900">{bidAmt ? `$${(bidAmt / 1000).toFixed(0)}K` : "—"}</div>
                  <div className="text-[10px] text-slate-400">BID AMT</div>
                </div>
                <div className="bg-white p-3 text-center">
                  <div className="text-sm font-bold text-slate-900">{dpsf ? `$${dpsf.toFixed(2)}` : "—"}</div>
                  <div className="text-[10px] text-slate-400">$/SF</div>
                </div>
              </div>

              {/* System details — what you need to know for this system */}
              {sys && (
                <div className="px-4 py-3 flex flex-col gap-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Seam method</span>
                    <span className="text-xs text-slate-700">{sys.seamMethod.split("(")[0].trim()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Thickness options</span>
                    <span className="text-xs text-slate-700">{sys.thicknessOptions.join(" · ")}</span>
                  </div>

                  {/* Manufacturers */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium mb-1">Manufacturers</div>
                    <div className="flex flex-wrap gap-1">
                      {sys.manufacturers.slice(0, 5).map(m => (
                        <span key={m} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Warranty options */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium mb-1">Warranty tiers</div>
                    <div className="flex flex-wrap gap-1">
                      {sys.warrantyOptions.map(w => (
                        <span key={w} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>

                  {/* Materials for this system */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">{sys.requiredMaterials.length} materials for this system</span>
                    <button onClick={() => openTab("materials")} className="text-[10px] text-emerald-600 font-semibold">View materials →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {(projectData as any)?.notes && (
          <div className="bg-white rounded-lg p-3 border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</div>
            <p className="text-xs text-slate-600">{(projectData as any).notes}</p>
          </div>
        )}

        <div className="pb-6">
          <button onClick={() => openTab("validator")} disabled={blockerCount > 0}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              blockerCount > 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
            }`}>
            {blockerCount > 0 ? `Fix ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} to submit` : actionItems.length > 0 ? "Review & Submit →" : "Submit Bid →"}
          </button>
        </div>

        </div>{/* end right column */}
        </div>{/* end grid */}
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
