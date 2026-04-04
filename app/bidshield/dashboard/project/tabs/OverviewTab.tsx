"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";

type ActionLevel = "red" | "yellow" | "green";
interface ActionItem { level: ActionLevel; text: string; tab: TabId }

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Due now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Section progress bar with % inside ──────────────────────────────────────
function ProgressBar({ score, color }: { score: number; color: string }) {
  const pct = Math.max(0, Math.min(100, score));
  const showInside = pct >= 28;
  return (
    <div className="relative h-7 rounded-lg overflow-hidden bg-slate-100 flex-1">
      <div
        className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
      {showInside ? (
        <span
          className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[11px] font-bold text-white"
          style={{ width: `${pct}%`, textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
        >
          {pct}%
        </span>
      ) : (
        <span
          className="absolute inset-y-0 flex items-center text-[11px] font-bold text-slate-500"
          style={{ left: `calc(${pct}% + 8px)` }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

export default function OverviewTab({ projectId, isDemo, project, userId, onNavigateTab, cachedData }: TabProps) {
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const hasCached = !!cachedData;
  const _checklist = useQuery(api.bidshield.getChecklist, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _quotes = useQuery(api.bidshield.getQuotes, !hasCached && !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined } : "skip");
  const _rfis = useQuery(api.bidshield.getRFIs, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _addenda = useQuery(api.bidshield.getAddenda, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _projectMaterials = useQuery(api.bidshield.getProjectMaterials, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _scopeItems = useQuery(api.bidshield.getScopeItems, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

  const checklist = cachedData?.checklist ?? _checklist;
  const quotes = cachedData?.quotes ?? _quotes;
  const rfis = cachedData?.rfis ?? _rfis;
  const addenda = cachedData?.addenda ?? _addenda;
  const projectMaterials = cachedData?.projectMaterials ?? _projectMaterials;
  const scopeItems = cachedData?.scopeItems ?? _scopeItems;

  // ── Stats ────────────────────────────────────────────────────────────────────
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: any) => i.status === "rfi").length;
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections = isDemo ? demoSections : (cachedData?.takeoffSections ?? takeoffSections ?? []);
  const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const controlSF = isDemo ? 68000 : project?.grossRoofArea ?? 0;
  const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct = controlSF > 0 ? Math.abs((controlSF - takenOff) / controlSF) * 100 : null;

  const bidAmt = isDemo ? 1250000 : project?.totalBidAmount;
  const matCost = isDemo ? 425000 : project?.materialCost;
  const labCost = isDemo ? 340000 : project?.laborCost;
  const grossArea = isDemo ? 68000 : project?.grossRoofArea;
  const dpsf = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;
  const pricingComplete = !!(bidAmt && bidAmt > 0 && matCost && labCost);

  const matList = isDemo
    ? [{ totalCost: 13680, unitPrice: 285 }, { totalCost: 50218, unitPrice: 34 }, { totalCost: 32494, unitPrice: 22 }, { totalCost: 3480, unitPrice: 145 }, { totalCost: 2640, unitPrice: 165 }, { totalCost: 36630, unitPrice: 185 }, { totalCost: 16120, unitPrice: 65 }, { totalCost: 1512, unitPrice: 18 }, { totalCost: 1764, unitPrice: 42 }, { totalCost: 840, unitPrice: 35 }, { totalCost: 1000, unitPrice: 125 }, { totalCost: 28600, unitPrice: 55 }]
    : (projectMaterials ?? []);
  const matItemCount = matList.length;
  const matUnpriced = matList.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

  const scopeList = isDemo ? Array.from({ length: 40 }, (_, i) => ({ status: i < 12 ? "included" : i < 16 ? "excluded" : i < 19 ? "by_others" : i < 21 ? "na" : "unaddressed" })) : (scopeItems ?? []);
  const scopeTotal = scopeList.length;
  const scopeAddressed = scopeList.filter((s: any) => s.status !== "unaddressed").length;
  const scopeUnaddressed = scopeTotal - scopeAddressed;
  const scopePct = scopeTotal > 0 ? (scopeAddressed / scopeTotal) * 100 : 100;

  const quoteList = isDemo ? [] : (quotes ?? []);
  const quoteCount = isDemo ? 5 : quoteList.length;
  const expiringQuotes = isDemo ? 1 : quoteList.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;
  const expiredQuotes = isDemo ? 0 : quoteList.filter((q: any) => { const d = q.expirationDate; return d && new Date(d).getTime() < Date.now(); }).length;

  const addendaList = isDemo ? [] : (addenda ?? []);
  const addendaCount = isDemo ? 3 : addendaList.length;
  const addendaNotReviewed = isDemo ? 0 : addendaList.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
  const scopeNotRepriced = isDemo ? 1 : addendaList.filter((a: any) => a.affectsScope === true && !a.repriced).length;

  const rfiList = isDemo ? [] : (rfis ?? []);
  const rfiCount = isDemo ? 3 : rfiList.length;
  const pendingRFIs = isDemo ? 1 : rfiList.filter((r: any) => r.status === "sent" || r.status === "draft").length;

  // ── Bid deadline ─────────────────────────────────────────────────────────────
  const bidDeadlineMs = useMemo(() => {
    if (!project?.bidDate) return null;
    const bidTimeStr = (project as any)?.bidTime as string | undefined;
    if (bidTimeStr) return new Date(`${project.bidDate}T${bidTimeStr}:00`).getTime();
    return new Date(`${project.bidDate}T23:59:59`).getTime();
  }, [project]);
  const msUntilBid = bidDeadlineMs !== null ? bidDeadlineMs - nowMs : null;
  const hoursUntilBid = msUntilBid !== null ? msUntilBid / 3600000 : null;
  const daysUntilBid = msUntilBid !== null ? Math.ceil(msUntilBid / (1000 * 60 * 60 * 24)) : null;

  const isOverdue  = msUntilBid !== null && msUntilBid <= 0;
  const isCritical = !isOverdue && hoursUntilBid !== null && hoursUntilBid <= 4;
  const isWarning  = !isOverdue && !isCritical && hoursUntilBid !== null && hoursUntilBid <= 24;
  const showBanner = (isOverdue || isCritical || isWarning) && !dismissedBanner;

  // ── Section scores ───────────────────────────────────────────────────────────
  const sectionScores = useMemo(() => {
    const takeoffScore = (() => {
      if (controlSF === 0) return 50;
      if (deltaPct === null) return 50;
      return Math.max(0, Math.round(100 - deltaPct * 10));
    })();
    return {
      checklist: checklistPct,
      scope:     Math.round(scopePct),
      takeoff:   takeoffScore,
      pricing:   pricingComplete ? 100 : (bidAmt ? 50 : 0),
      materials: matItemCount > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      quotes:    quoteCount > 0 ? (expiredQuotes === 0 ? (expiringQuotes === 0 ? 100 : 70) : 40) : 50,
      addenda:   addendaCount > 0 ? (scopeNotRepriced === 0 && addendaNotReviewed === 0 ? 100 : 40) : 100,
      rfis:      rfiCount > 0 ? (pendingRFIs === 0 ? 100 : 60) : 100,
    };
  }, [checklistPct, scopePct, controlSF, deltaPct, pricingComplete, bidAmt, matItemCount, matUnpriced, quoteCount, expiredQuotes, expiringQuotes, addendaCount, scopeNotRepriced, addendaNotReviewed, rfiCount, pendingRFIs]);

  const sectionLabels: Record<string, string> = {
    checklist: "Checklist", scope: "Scope", takeoff: "Takeoff",
    pricing: "Pricing", materials: "Materials", quotes: "Quotes",
    addenda: "Addenda", rfis: "RFIs",
  };

  // ── Action items ─────────────────────────────────────────────────────────────
  const actionItems: ActionItem[] = [];
  if (scopeTotal > 0) {
    if (scopePct < 80) actionItems.push({ level: "red",    text: `${scopeUnaddressed} scope items not addressed`,          tab: "scope" });
    else if (scopePct < 100) actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope items remaining`,         tab: "scope" });
  }
  if (scopeNotRepriced > 0)   actionItems.push({ level: "red",    text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope — not re-priced`, tab: "addenda" });
  if (addendaNotReviewed > 0) actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not yet reviewed`,          tab: "addenda" });
  if (controlSF > 0 && deltaPct !== null) {
    if (deltaPct > 5)      actionItems.push({ level: "red",    text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    else if (deltaPct > 2) actionItems.push({ level: "yellow", text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
  }
  if (expiredQuotes > 0)  actionItems.push({ level: "red",    text: `${expiredQuotes} expired quote${expiredQuotes !== 1 ? "s" : ""}`, tab: "quotes" });
  if (expiringQuotes > 0) actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`,  tab: "quotes" });
  if (pendingRFIs > 0)    actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`,       tab: "rfis" });
  if (checklistPct < 80)  actionItems.push({ level: checklistPct < 50 ? "red" : "yellow", text: `Checklist ${checklistPct}% complete`,          tab: "checklist" });
  if (rfiItems > 0)       actionItems.push({ level: "yellow", text: `${rfiItems} checklist items flagged as RFI`,                               tab: "checklist" });
  if (matItemCount === 0) actionItems.push({ level: "yellow", text: "Materials not yet calculated",                                              tab: "materials" });
  else if (matUnpriced > 0) actionItems.push({ level: "yellow", text: `${matUnpriced} materials missing pricing`,                               tab: "materials" });
  if (!pricingComplete && (!bidAmt || bidAmt === 0)) actionItems.push({ level: "yellow", text: "Pricing not entered", tab: "pricing" });
  actionItems.sort((a, b) => ({ red: 0, yellow: 1, green: 2 }[a.level]) - ({ red: 0, yellow: 1, green: 2 }[b.level]));

  const redCount    = actionItems.filter(a => a.level === "red").length;
  const yellowCount = actionItems.filter(a => a.level === "yellow").length;
  const greenCount  = [
    scopeTotal > 0 && scopePct >= 100,
    addendaCount > 0 && addendaNotReviewed === 0 && scopeNotRepriced === 0,
    quoteCount > 0 && expiredQuotes === 0 && expiringQuotes === 0,
    rfiCount > 0 && pendingRFIs === 0,
    checklistPct >= 80,
    matItemCount > 0 && matUnpriced === 0,
    pricingComplete,
  ].filter(Boolean).length;

  const completeSections = Object.values(sectionScores).filter(s => s >= 75).length;
  const totalSections = Object.values(sectionScores).length;

  const bidDateLabel = project?.bidDate
    ? (() => {
        const bidTimeStr = (project as any)?.bidTime as string | undefined;
        const dl = new Date(`${project.bidDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return bidTimeStr ? `${dl} at ${bidTimeStr}` : dl;
      })()
    : null;

  return (
    <div className="flex flex-col gap-6" style={{ background: "#F8FAFC", minHeight: "100%" }}>

      {/* ── 1. DEADLINE BANNER ───────────────────────────────────────────────── */}
      {showBanner && msUntilBid !== null && (
        <div
          className="flex items-center gap-4 px-6 py-3.5 -mx-6 -mt-6"
          style={{
            background: isOverdue || isCritical ? "#DC2626" : "#D97706",
            borderBottom: `1px solid ${isOverdue || isCritical ? "#B91C1C" : "#B45309"}`,
          }}
        >
          <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-white font-semibold text-sm">
              {isOverdue
                ? "Bid deadline has passed"
                : isCritical
                ? `Less than 4 hours until bid deadline — ${formatCountdown(msUntilBid)} remaining`
                : `Bid deadline today — ${formatCountdown(msUntilBid)} remaining`}
            </span>
            {bidDateLabel && (
              <span className="text-white/70 text-sm ml-2">· {bidDateLabel}</span>
            )}
          </div>
          {redCount > 0 && (
            <span className="text-white/90 text-sm font-medium shrink-0">
              {redCount} unresolved blocker{redCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setDismissedBanner(true)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── 2. KPI CARDS ─────────────────────────────────────────────────────── */}
      {(bidAmt || grossArea) && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Square Footage",
              value: grossArea ? grossArea.toLocaleString("en-US") : "—",
              suffix: grossArea ? "SF" : "",
              underline: "#334155",
              sub: null,
            },
            {
              label: "Total Bid",
              value: bidAmt ? `$${(bidAmt / 1000).toFixed(0)}K` : "—",
              suffix: "",
              underline: "#059669",
              sub: bidAmt ? `$${bidAmt.toLocaleString("en-US")}` : null,
            },
            {
              label: "Cost per SF",
              value: dpsf ? `$${dpsf.toFixed(2)}` : "—",
              suffix: dpsf ? "/SF" : "",
              underline: dpsf ? (dpsf < 15 ? "#059669" : dpsf < 25 ? "#F59E0B" : "#EF4444") : "#CBD5E1",
              sub: null,
            },
          ].map(({ label, value, suffix, underline, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl px-6 py-5 flex flex-col gap-1"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                borderBottom: `3px solid ${underline}`,
                border: "1px solid #E2E8F0",
                borderBottomWidth: 3,
                borderBottomColor: underline,
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-slate-900 tracking-tight leading-none tabular-nums">{value}</span>
                {suffix && <span className="text-base font-semibold text-slate-400">{suffix}</span>}
              </div>
              {sub && <span className="text-xs text-slate-400 tabular-nums">{sub}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── 3. NEEDS ATTENTION TABLE ─────────────────────────────────────────── */}
      {actionItems.length === 0 ? (
        <div
          className="bg-white rounded-xl px-6 py-5 flex items-center gap-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #D1FAE5" }}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">All sections passing</p>
            <p className="text-xs text-slate-500 mt-0.5">{greenCount} of {totalSections} sections complete — bid is ready to submit</p>
          </div>
          <button
            onClick={() => onNavigateTab?.("validator")}
            className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap"
          >
            Run Validator →
          </button>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}
        >
          {/* Card header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Needs Attention</span>
              <div className="flex items-center gap-1.5">
                {redCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    {redCount} blocker{redCount !== 1 ? "s" : ""}
                  </span>
                )}
                {yellowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    {yellowCount} warning{yellowCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            {greenCount > 0 && (
              <span className="text-[11px] font-medium text-emerald-600">{greenCount} passing</span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 w-full">Issue</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Section</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Severity</th>
                  <th className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item, i) => {
                  const isRed = item.level === "red";
                  return (
                    <tr
                      key={`${item.tab}-${i}`}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors duration-100 cursor-pointer"
                      onClick={() => onNavigateTab?.(item.tab)}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: isRed ? "#EF4444" : "#F59E0B" }}
                          />
                          <span className="text-sm text-slate-700">{item.text}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {item.tab === "checklist" ? "Checklist"
                           : item.tab === "scope" ? "Scope"
                           : item.tab === "takeoff" ? "Takeoff"
                           : item.tab === "quotes" ? "Quotes"
                           : item.tab === "rfis" ? "RFIs"
                           : item.tab === "addenda" ? "Addenda"
                           : item.tab === "materials" ? "Materials"
                           : item.tab === "pricing" ? "Pricing"
                           : item.tab}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: isRed ? "#FEE2E2" : "#FEF3C7",
                            color: isRed ? "#DC2626" : "#D97706",
                          }}
                        >
                          {isRed ? "Blocker" : "Warning"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right whitespace-nowrap">
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
        </div>
      )}

      {/* ── 4. SECTION PROGRESS ──────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Section Progress</span>
          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
            {completeSections} <span className="text-slate-300">/</span> {totalSections} ready
          </span>
        </div>
        <div className="px-6 py-4 flex flex-col gap-3">
          {Object.entries(sectionScores).map(([key, score]) => {
            const pct = Math.max(0, Math.min(100, score));
            const color = pct >= 75 ? "#10B981" : pct >= 25 ? "#F59E0B" : "#EF4444";
            return (
              <button
                key={key}
                onClick={() => onNavigateTab?.(key as TabId)}
                className="flex items-center gap-4 w-full text-left cursor-pointer group"
              >
                <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors w-20 shrink-0">
                  {sectionLabels[key]}
                </span>
                <ProgressBar score={pct} color={color} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. PROJECT NOTES ─────────────────────────────────────────────────── */}
      {project?.notes && (
        <div
          className="bg-white rounded-xl px-6 py-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0" }}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Notes</span>
          <p className="text-sm text-slate-600 leading-relaxed">{project.notes}</p>
        </div>
      )}

    </div>
  );
}
