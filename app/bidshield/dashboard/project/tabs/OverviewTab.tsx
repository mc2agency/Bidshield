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

// ─── Section progress bar (dark theme) ───────────────────────────────────────
function ProgressBar({ score, color }: { score: number; color: string }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="flex-1 h-[6px] rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
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
    <div className="flex flex-col gap-7" style={{ background: "var(--bs-bg-primary)", minHeight: "100%" }}>

      {/* ── 1. DEADLINE BANNER ───────────────────────────────────────────────── */}
      {showBanner && msUntilBid !== null && (
        <div
          className="flex items-center gap-4 px-6 py-3 -mx-7 -mt-7"
          style={{
            background: isOverdue || isCritical ? "var(--bs-red-dim)" : "var(--bs-amber-dim)",
            borderLeft: `3px solid ${isOverdue || isCritical ? "var(--bs-red)" : "var(--bs-amber)"}`,
            borderBottom: "1px solid var(--bs-border)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: isOverdue || isCritical ? "var(--bs-red)" : "var(--bs-amber)" }}>
            <path d="M8 2l6 11H2L8 2z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
            <path d="M8 7v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.6" fill="currentColor"/>
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-medium" style={{ color: isOverdue || isCritical ? "var(--bs-red)" : "var(--bs-amber)" }}>
              {isOverdue
                ? "Bid deadline has passed"
                : isCritical
                ? `Less than 4 hours until bid deadline — ${formatCountdown(msUntilBid)} remaining`
                : `Bid deadline today — ${formatCountdown(msUntilBid)} remaining`}
            </span>
            {bidDateLabel && (
              <span className="text-[12px] ml-2" style={{ color: "var(--bs-text-muted)" }}>· {bidDateLabel}</span>
            )}
          </div>
          {redCount > 0 && (
            <span className="text-[12px] shrink-0" style={{ color: "var(--bs-text-muted)" }}>
              {redCount} unresolved blocker{redCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setDismissedBanner(true)}
            className="cursor-pointer shrink-0 ml-2 transition-colors"
            style={{ color: "var(--bs-text-dim)" }}
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {/* ── 2. KPI CARDS ─────────────────────────────────────────────────────── */}
      {(bidAmt || grossArea) && (
        <div className="grid grid-cols-4 gap-3">
          {/* Readiness ring */}
          <div className="rounded-[10px] p-5 flex items-center gap-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="relative w-14 h-14 shrink-0">
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="24" fill="none" stroke="var(--bs-teal)" strokeWidth="5"
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - (completeSections / totalSections))}
                  strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium" style={{ color: "var(--bs-teal)" }}>
                {Math.round((completeSections / totalSections) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[15px] font-medium" style={{ color: "#fff" }}>
                {completeSections === totalSections ? "Ready" : "On track"}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                {completeSections}/{totalSections} sections ready
              </div>
            </div>
          </div>
          {/* Square footage */}
          <div className="rounded-[10px] p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Square footage</div>
            <div className="text-[28px] font-medium tabular-nums" style={{ color: "#fff", letterSpacing: "-1px" }}>
              {grossArea ? `${(grossArea / 1000).toFixed(1)}K` : "—"}
            </div>
            <div className="text-[12px] mt-1" style={{ color: "var(--bs-text-dim)" }}>SF gross roof area</div>
          </div>
          {/* Total bid */}
          <div className="rounded-[10px] p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Total bid</div>
            <div className="text-[28px] font-medium tabular-nums" style={{ color: "#fff", letterSpacing: "-1px" }}>
              {bidAmt ? `$${(bidAmt / 1_000_000).toFixed(2)}M` : "—"}
            </div>
            {bidAmt && (
              <div className="text-[12px] mt-1" style={{ color: "var(--bs-text-dim)" }}>${bidAmt.toLocaleString("en-US")}</div>
            )}
          </div>
          {/* Cost/SF */}
          <div className="rounded-[10px] p-5" style={{ background: "var(--bs-bg-card)", border: `1px solid var(--bs-teal)` }}>
            <div className="bs-metric-label">Cost / SF</div>
            <div className="text-[28px] font-medium tabular-nums" style={{ color: "var(--bs-teal)", letterSpacing: "-1px" }}>
              {dpsf ? `$${dpsf.toFixed(2)}` : "—"}
            </div>
            <div className="text-[12px] mt-1" style={{ color: "var(--bs-text-dim)" }}>per square foot</div>
          </div>
        </div>
      )}

      {/* ── 3. ACTION ITEMS TABLE ────────────────────────────────────────────── */}
      {actionItems.length === 0 ? (
        <div className="rounded-[10px] px-5 py-4 flex items-center gap-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-teal-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bs-teal-dim)" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="var(--bs-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "#fff" }}>All sections passing</p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{greenCount} of {totalSections} sections complete — bid is ready to submit</p>
          </div>
          <button
            onClick={() => onNavigateTab?.("validator")}
            className="ml-auto px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap bs-btn-ghost-teal"
          >
            Run Validator →
          </button>
        </div>
      ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          {/* Card header */}
          <div className="px-[18px] py-[10px] flex items-center justify-between" style={{ borderBottom: "1px solid var(--bs-border)" }}>
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.5px]" style={{ color: "var(--bs-text-dim)" }}>Action items</span>
              <div className="flex items-center gap-1.5">
                {redCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--bs-red)" }} />
                    {redCount} blocker{redCount !== 1 ? "s" : ""}
                  </span>
                )}
                {yellowCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--bs-amber)" }} />
                    {yellowCount} warning{yellowCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigateTab?.("validator")}
              className="text-[12px] cursor-pointer transition-colors bs-link"
            >
              Run validator
            </button>
          </div>

          {/* Table header */}
          <div className="grid px-[18px] py-[10px]" style={{ gridTemplateColumns: "1fr 120px 100px 80px", borderBottom: "1px solid var(--bs-border)" }}>
            {["Issue", "Section", "Status", "Action"].map(h => (
              <span key={h} className="text-[11px] uppercase tracking-[0.5px]" style={{ color: "var(--bs-text-dim)", textAlign: h === "Action" ? "right" : "left" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {actionItems.map((item, i) => {
            const isRed = item.level === "red";
            return (
              <div
                key={`${item.tab}-${i}`}
                className="grid px-[18px] py-3 cursor-pointer transition-colors bs-table-row"
                style={{ gridTemplateColumns: "1fr 120px 100px 80px", alignItems: "center" }}
                onClick={() => onNavigateTab?.(item.tab)}
              >
                <div className="flex items-center gap-2">
                  <span className="bs-dot shrink-0" style={{ background: isRed ? "var(--bs-red)" : "var(--bs-amber)" }} />
                  <span className="text-[13px]" style={{ color: "var(--bs-text-secondary)" }}>{item.text}</span>
                </div>
                <span className="text-[12px] px-[10px] py-0.5 rounded w-fit" style={{ background: "rgba(255,255,255,0.04)", color: "var(--bs-text-muted)" }}>
                  {item.tab.charAt(0).toUpperCase() + item.tab.slice(1)}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded w-fit" style={{ background: isRed ? "var(--bs-red-dim)" : "var(--bs-amber-dim)", color: isRed ? "var(--bs-red)" : "var(--bs-amber)" }}>
                  {isRed ? "Blocker" : "Warning"}
                </span>
                <button
                  className="text-[12px] text-right w-full cursor-pointer transition-colors bs-link"
                  onClick={(e) => { e.stopPropagation(); onNavigateTab?.(item.tab); }}
                >
                  Review
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. SECTION PROGRESS ──────────────────────────────────────────────── */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="px-[18px] py-[14px] flex items-center justify-between" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <h2 className="text-[15px] font-medium" style={{ color: "#fff" }}>Section progress</h2>
          <span className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>{completeSections}/{totalSections} ready</span>
        </div>
        <div className="px-[18px] py-4 flex flex-col gap-2">
          {Object.entries(sectionScores).map(([key, score]) => {
            const pct = Math.max(0, Math.min(100, score));
            const color = pct >= 75 ? "var(--bs-teal)" : pct >= 25 ? "var(--bs-amber)" : "var(--bs-red)";
            return (
              <button
                key={key}
                onClick={() => onNavigateTab?.(key as TabId)}
                className="grid items-center gap-3 w-full text-left cursor-pointer"
                style={{ gridTemplateColumns: "110px 1fr 50px" }}
              >
                <span className="text-[13px]" style={{ color: "var(--bs-text-muted)" }}>{sectionLabels[key]}</span>
                <ProgressBar score={pct} color={color} />
                <span className="text-[12px] font-medium text-right tabular-nums" style={{ color }}>{pct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. PROJECT NOTES ─────────────────────────────────────────────────── */}
      {project?.notes && (
        <div className="rounded-[10px] px-[18px] py-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <span className="text-[11px] uppercase tracking-[0.5px] block mb-3" style={{ color: "var(--bs-text-dim)" }}>Notes</span>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{project.notes}</p>
        </div>
      )}

    </div>
  );
}
