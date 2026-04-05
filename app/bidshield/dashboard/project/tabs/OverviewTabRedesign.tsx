"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";
import { PieChart, Pie, Cell } from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt$K(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtSF(n: number) {
  return n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toLocaleString();
}

function daysBetween(ms: number) {
  if (ms <= 0) return null;
  const d = Math.ceil(ms / 86_400_000);
  if (d === 1) return "1 day";
  return `${d} days`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Circular donut ring showing bid readiness % */
function ReadinessRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const data = [
    { value: pct },
    { value: 100 - pct },
  ];
  return (
    <div className="relative w-20 h-20 shrink-0">
      <PieChart width={80} height={80}>
        <Pie
          data={data}
          cx={40}
          cy={40}
          innerRadius={28}
          outerRadius={38}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#F1F5F9" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-bold text-slate-900 tabular-nums leading-none">{pct}%</span>
      </div>
    </div>
  );
}

/** Chunky horizontal progress bar with % inside */
function SectionBar({ label, pct, onClick }: { label: string; pct: number; onClick: () => void }) {
  const color = pct >= 75 ? "#10B981" : pct >= 25 ? "#F59E0B" : "#EF4444";
  const showInside = pct >= 22;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full group cursor-pointer"
    >
      <span className="w-24 shrink-0 text-[13px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors text-left">
        {label}
      </span>
      <div className="relative flex-1 h-7 rounded-md bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
        {showInside ? (
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-bold text-white"
            style={{ width: `${pct}%` }}
          >
            {pct}%
          </span>
        ) : (
          <span
            className="absolute inset-y-0 flex items-center text-[11px] font-bold text-slate-400"
            style={{ left: `calc(${pct}% + 8px)` }}
          >
            {pct}%
          </span>
        )}
      </div>
    </button>
  );
}

/** Section badge pill */
function SectionBadge({ tab }: { tab: string }) {
  const MAP: Record<string, string> = {
    checklist: "Checklist", scope: "Scope", takeoff: "Takeoff",
    quotes: "Quotes", rfis: "RFIs", addenda: "Addenda",
    materials: "Materials", pricing: "Pricing",
  };
  return (
    <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
      {MAP[tab] ?? tab}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type ActionLevel = "red" | "yellow";
interface ActionItem { level: ActionLevel; text: string; tab: TabId }

export default function OverviewTabRedesign({
  projectId, isDemo, project, userId, onNavigateTab, cachedData,
}: TabProps) {
  const [dismissed, setDismissed] = useState(false);
  const isValidId = projectId && !projectId.startsWith("demo_");

  // ── Data fetching ────────────────────────────────────────────────────────
  const skip = !!(cachedData || isDemo || !isValidId);
  const _checklist  = useQuery(api.bidshield.getChecklist,        !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _quotes     = useQuery(api.bidshield.getQuotes,           !skip && userId ? { userId, projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _rfis       = useQuery(api.bidshield.getRFIs,             !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _addenda    = useQuery(api.bidshield.getAddenda,          !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _takeoff    = useQuery(api.bidshield.getTakeoffSections,  !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _materials  = useQuery(api.bidshield.getProjectMaterials, !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _scope      = useQuery(api.bidshield.getScopeItems,       !skip ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

  const checklist  = cachedData?.checklist       ?? _checklist  ?? [];
  const quotes     = cachedData?.quotes          ?? _quotes     ?? [];
  const rfis       = cachedData?.rfis            ?? _rfis       ?? [];
  const addenda    = cachedData?.addenda         ?? _addenda    ?? [];
  const takeoff    = cachedData?.takeoffSections ?? _takeoff    ?? [];
  const materials  = cachedData?.projectMaterials ?? _materials ?? [];
  const scopeItems = cachedData?.scopeItems      ?? _scope      ?? [];

  // ── Demo overrides ───────────────────────────────────────────────────────
  const totalItems    = isDemo ? 95  : checklist.length;
  const doneItems     = isDemo ? 65  : checklist.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems      = isDemo ? 4   : checklist.filter((i: any) => i.status === "rfi").length;
  const checklistPct  = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections     = isDemo ? demoSections : takeoff;
  const takenOff     = sections.reduce((s: number, r: any) => s + (r.squareFeet || 0), 0);
  const controlSF    = isDemo ? 68000 : (project?.grossRoofArea ?? 0);
  const deltaSF      = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct     = controlSF > 0 ? Math.abs((controlSF - takenOff) / controlSF) * 100 : null;

  const bidAmt   = isDemo ? 1_250_000 : project?.totalBidAmount;
  const matCost  = isDemo ? 425_000   : project?.materialCost;
  const labCost  = isDemo ? 340_000   : project?.laborCost;
  const grossArea = isDemo ? 68_000   : project?.grossRoofArea;
  const dpsf     = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;
  const pricingComplete = !!(bidAmt && bidAmt > 0 && matCost && labCost);

  const matList     = isDemo
    ? [{ totalCost: 13680, unitPrice: 285 }, { totalCost: 50218, unitPrice: 34 }, { totalCost: 32494, unitPrice: 22 }]
    : materials;
  const matUnpriced = matList.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

  const demoScope   = Array.from({ length: 40 }, (_, i) => ({ status: i < 12 ? "included" : i < 16 ? "excluded" : i < 19 ? "by_others" : i < 21 ? "na" : "unaddressed" }));
  const scopeList   = isDemo ? demoScope : scopeItems;
  const scopeTotal  = scopeList.length;
  const scopeUnaddressed = scopeList.filter((s: any) => s.status === "unaddressed").length;
  const scopePct    = scopeTotal > 0 ? Math.round(((scopeTotal - scopeUnaddressed) / scopeTotal) * 100) : 100;

  const quoteCount    = isDemo ? 5 : quotes.length;
  const expiredQuotes  = isDemo ? 0 : quotes.filter((q: any) => q.expirationDate && new Date(q.expirationDate).getTime() < Date.now()).length;
  const expiringQuotes = isDemo ? 1 : quotes.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;

  const addendaCount       = isDemo ? 3 : addenda.length;
  const addendaNotReviewed = isDemo ? 0 : addenda.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
  const scopeNotRepriced   = isDemo ? 1 : addenda.filter((a: any) => a.affectsScope === true && !a.repriced).length;

  const rfiCount    = isDemo ? 3 : rfis.length;
  const pendingRFIs = isDemo ? 1 : rfis.filter((r: any) => r.status === "sent" || r.status === "draft").length;

  // ── Bid deadline ─────────────────────────────────────────────────────────
  const bidDeadlineMs = useMemo(() => {
    if (!project?.bidDate) return null;
    const t = (project as any)?.bidTime as string | undefined;
    return t
      ? new Date(`${project.bidDate}T${t}:00`).getTime()
      : new Date(`${project.bidDate}T23:59:59`).getTime();
  }, [project]);

  const msUntil    = bidDeadlineMs !== null ? bidDeadlineMs - Date.now() : null;
  const isOverdue  = msUntil !== null && msUntil <= 0;
  const isUrgent   = !isOverdue && msUntil !== null && msUntil < 86_400_000;
  const showBanner = (isOverdue || isUrgent) && !dismissed;
  const countdown  = msUntil !== null && msUntil > 0 ? daysBetween(msUntil) : null;

  // ── Section scores ────────────────────────────────────────────────────────
  const sectionScores = useMemo(() => {
    const tkScore = controlSF === 0 ? 50 : deltaPct === null ? 50 : Math.max(0, Math.round(100 - deltaPct * 10));
    return {
      Checklist: checklistPct,
      Scope:     Math.round(scopePct),
      Takeoff:   tkScore,
      Pricing:   pricingComplete ? 100 : (bidAmt ? 50 : 0),
      Materials: matList.length > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      Quotes:    quoteCount > 0 ? (expiredQuotes === 0 ? (expiringQuotes === 0 ? 100 : 70) : 40) : 50,
      Addenda:   addendaCount > 0 ? (scopeNotRepriced === 0 && addendaNotReviewed === 0 ? 100 : 40) : 100,
      RFIs:      rfiCount > 0 ? (pendingRFIs === 0 ? 100 : 60) : 100,
    };
  }, [checklistPct, scopePct, controlSF, deltaPct, pricingComplete, bidAmt, matList.length, matUnpriced, quoteCount, expiredQuotes, expiringQuotes, addendaCount, scopeNotRepriced, addendaNotReviewed, rfiCount, pendingRFIs]);

  const tabForSection: Record<string, TabId> = {
    Checklist: "checklist", Scope: "scope", Takeoff: "takeoff",
    Pricing: "pricing", Materials: "materials", Quotes: "quotes",
    Addenda: "addenda", RFIs: "rfis",
  };

  const readinessPct = Math.round(
    Object.values(sectionScores).reduce((a, b) => a + b, 0) / Object.values(sectionScores).length
  );

  // ── Action items ──────────────────────────────────────────────────────────
  const actionItems: ActionItem[] = [];
  if (scopeTotal > 0 && scopePct < 80)
    actionItems.push({ level: "red",    text: `${scopeUnaddressed} scope items not addressed`,                         tab: "scope" });
  else if (scopeTotal > 0 && scopePct < 100)
    actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope item${scopeUnaddressed !== 1 ? "s" : ""} remaining`, tab: "scope" });
  if (scopeNotRepriced > 0)
    actionItems.push({ level: "red",    text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope — not re-priced`, tab: "addenda" });
  if (addendaNotReviewed > 0)
    actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not reviewed`, tab: "addenda" });
  if (controlSF > 0 && deltaPct !== null && deltaPct > 5)
    actionItems.push({ level: "red",    text: `Takeoff gap: ${deltaSF.toLocaleString()} SF (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
  else if (controlSF > 0 && deltaPct !== null && deltaPct > 2)
    actionItems.push({ level: "yellow", text: `Takeoff gap: ${deltaSF.toLocaleString()} SF (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
  if (expiredQuotes > 0)
    actionItems.push({ level: "red",    text: `${expiredQuotes} expired quote${expiredQuotes !== 1 ? "s" : ""}`,        tab: "quotes" });
  if (expiringQuotes > 0)
    actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring within 14 days`, tab: "quotes" });
  if (pendingRFIs > 0)
    actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`,   tab: "rfis" });
  if (checklistPct < 80)
    actionItems.push({ level: checklistPct < 50 ? "red" : "yellow", text: `Checklist ${checklistPct}% complete`,       tab: "checklist" });
  if (rfiItems > 0)
    actionItems.push({ level: "yellow", text: `${rfiItems} checklist item${rfiItems !== 1 ? "s" : ""} flagged as RFI`, tab: "checklist" });
  if (matList.length === 0)
    actionItems.push({ level: "yellow", text: "Materials not calculated",                                               tab: "materials" });
  else if (matUnpriced > 0)
    actionItems.push({ level: "yellow", text: `${matUnpriced} material${matUnpriced !== 1 ? "s" : ""} missing pricing`, tab: "materials" });
  if (!pricingComplete && (!bidAmt || bidAmt === 0))
    actionItems.push({ level: "yellow", text: "Pricing not entered",                                                   tab: "pricing" });
  actionItems.sort((a, b) => (a.level === "red" ? -1 : 1) - (b.level === "red" ? -1 : 1));

  const blockers = actionItems.filter(a => a.level === "red").length;
  const warnings = actionItems.filter(a => a.level === "yellow").length;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 min-h-full">

      {/* ── DEADLINE BANNER ─────────────────────────────────────────────────── */}
      {showBanner && (
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl -mt-2"
          style={{
            background: isOverdue ? "#FEF2F2" : "#FFFBEB",
            border: `1px solid ${isOverdue ? "#FECACA" : "#FDE68A"}`,
          }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: isOverdue ? "#EF4444" : "#F59E0B" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: isOverdue ? "#DC2626" : "#D97706" }}>
              {isOverdue ? "Bid deadline has passed" : `Bid deadline in ${countdown ?? "less than a day"}`}
            </p>
            {blockers > 0 && (
              <p className="text-xs mt-0.5" style={{ color: isOverdue ? "#EF4444" : "#F59E0B" }}>
                {blockers} unresolved blocker{blockers !== 1 ? "s" : ""} — review action items below
              </p>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            style={{ color: isOverdue ? "#DC2626" : "#D97706" }}
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── KPI CARDS ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Bid Readiness */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <ReadinessRing pct={readinessPct} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bid Readiness</p>
            <p className="text-sm font-semibold text-slate-700 leading-snug">
              {readinessPct >= 75
                ? "On track"
                : readinessPct >= 40
                ? "Needs work"
                : "Critical gaps"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {Object.values(sectionScores).filter(s => s >= 75).length} of {Object.values(sectionScores).length} sections ready
            </p>
          </div>
        </div>

        {/* Square Footage */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Square Footage</p>
          <div className="mt-3">
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
              {grossArea ? fmtSF(grossArea) : "—"}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {grossArea ? "SF · gross roof area" : "Not set"}
            </p>
          </div>
          {takenOff > 0 && grossArea > 0 && (
            <p className="text-[11px] text-slate-400 mt-2 tabular-nums">
              {takenOff.toLocaleString()} SF taken off
              {deltaPct !== null && (
                <span className={deltaPct > 5 ? " text-red-500 font-semibold" : " text-slate-400"}>
                  {" "}· {deltaPct.toFixed(1)}% gap
                </span>
              )}
            </p>
          )}
        </div>

        {/* Total Bid */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Bid</p>
          <div className="mt-3">
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
              {bidAmt ? fmt$K(bidAmt) : "—"}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {bidAmt ? `$${bidAmt.toLocaleString()} · total amount` : "Not entered"}
            </p>
          </div>
          <div
            className="mt-2 h-1 rounded-full w-full bg-slate-100"
          >
            <div
              className="h-1 rounded-full"
              style={{
                width: pricingComplete ? "100%" : bidAmt ? "60%" : "0%",
                background: pricingComplete ? "#10B981" : "#F59E0B",
              }}
            />
          </div>
        </div>

        {/* Cost / SF */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Cost / SF</p>
          <div className="mt-3">
            <p className="text-4xl font-extrabold tracking-tight leading-none tabular-nums"
              style={{ color: dpsf ? (dpsf < 15 ? "#10B981" : dpsf < 25 ? "#F59E0B" : "#EF4444") : "#94A3B8" }}
            >
              {dpsf ? `$${dpsf.toFixed(2)}` : "—"}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {dpsf ? "per square foot" : "Pending pricing"}
            </p>
          </div>
          {dpsf && (
            <p className="text-[11px] mt-2"
              style={{ color: dpsf < 15 ? "#10B981" : dpsf < 25 ? "#F59E0B" : "#EF4444" }}
            >
              {dpsf < 15 ? "Below average" : dpsf < 25 ? "Mid-range" : "Above average"}
            </p>
          )}
        </div>
      </div>

      {/* ── ACTION ITEMS TABLE ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Action Items</h2>
            {blockers > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {blockers} blocker{blockers !== 1 ? "s" : ""}
              </span>
            )}
            {warnings > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {warnings} warning{warnings !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab?.("validator")}
            className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Run validator →
          </button>
        </div>

        {actionItems.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-900">All sections passing</p>
            <p className="text-xs text-slate-400">No action items — bid is ready to submit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Issue</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Section</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item, i) => {
                  const isRed = item.level === "red";
                  return (
                    <tr
                      key={`${item.tab}-${i}`}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onNavigateTab?.(item.tab)}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: isRed ? "#EF4444" : "#F59E0B" }}
                          />
                          <span className="text-sm text-slate-700 leading-snug">{item.text}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <SectionBadge tab={item.tab} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: isRed ? "#FEF2F2" : "#FFFBEB",
                            color:      isRed ? "#DC2626" : "#D97706",
                          }}
                        >
                          {isRed ? "Blocker" : "Warning"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onNavigateTab?.(item.tab); }}
                        >
                          {isRed ? "Fix →" : "Review →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SECTION PROGRESS ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Section Progress</h2>
          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
            {Object.values(sectionScores).filter(s => s >= 75).length}
            <span className="text-slate-300 mx-1">/</span>
            {Object.values(sectionScores).length} ready
          </span>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 gap-3">
          {Object.entries(sectionScores).map(([label, score]) => (
            <SectionBar
              key={label}
              label={label}
              pct={Math.max(0, Math.min(100, score))}
              onClick={() => onNavigateTab?.(tabForSection[label] ?? ("overview" as TabId))}
            />
          ))}
        </div>
      </div>

      {/* ── PROJECT NOTES ────────────────────────────────────────────────────── */}
      {project?.notes && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Notes</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{project.notes}</p>
        </div>
      )}

    </div>
  );
}
