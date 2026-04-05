"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";

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

/** Circular SVG donut ring showing bid readiness % */
function ReadinessRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? "var(--bs-teal)" : pct >= 40 ? "var(--bs-amber)" : "var(--bs-red)";
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
      <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle
          cx={40} cy={40} r={r} fill="none"
          stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-medium tabular-nums leading-none" style={{ color: "var(--bs-text-primary)" }}>{pct}%</span>
      </div>
    </div>
  );
}

/** Thin dark progress bar for section scores */
function SectionBar({ label, pct, onClick }: { label: string; pct: number; onClick: () => void }) {
  const color = pct >= 75 ? "var(--bs-teal)" : pct >= 40 ? "var(--bs-amber)" : "var(--bs-red)";
  const textColor = pct >= 75 ? "var(--bs-teal)" : pct >= 40 ? "var(--bs-amber)" : "var(--bs-red)";
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full cursor-pointer group">
      <span className="w-20 shrink-0 text-[12px] text-left" style={{ color: "var(--bs-text-muted)" }}>{label}</span>
      <div className="flex-1 h-[4px] rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] tabular-nums w-8 text-right shrink-0" style={{ color: textColor }}>{pct}%</span>
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
    <span className="bs-badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)" }}>
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
    <div className="flex flex-col gap-5 min-h-full">

      {/* ── DEADLINE BANNER ─────────────────────────────────────────────────── */}
      {showBanner && (
        <div
          className="-mx-6 -mt-6 mb-1 flex items-center gap-4 px-6 py-3"
          style={{
            background: isOverdue ? "var(--bs-red-dim)" : "var(--bs-amber-dim)",
            borderLeft: `3px solid ${isOverdue ? "var(--bs-red)" : "var(--bs-amber)"}`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ minWidth: 16, color: isOverdue ? "var(--bs-red)" : "var(--bs-amber)" }}>
            <path d="M8 2l6 11H2L8 2z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
            <path d="M8 7v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.6" fill="currentColor"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium leading-none" style={{ color: isOverdue ? "var(--bs-red)" : "var(--bs-amber)" }}>
              {isOverdue ? "Bid deadline has passed" : `Bid deadline in ${countdown ?? "less than a day"}`}
            </p>
            {blockers > 0 && (
              <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                {blockers} unresolved blocker{blockers !== 1 ? "s" : ""} — review action items below
              </p>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded cursor-pointer"
            style={{ color: "var(--bs-text-dim)" }}
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {/* ── HERO ROW: Readiness + Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">

        {/* LEFT: Bid Readiness Panel (3 cols) */}
        <div className="col-span-3 rounded-[10px] p-5 flex flex-col gap-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>Bid Readiness</div>
          <div className="flex items-center gap-5">
            <ReadinessRing pct={readinessPct} />
            <div className="flex flex-col gap-1">
              <span
                className="bs-badge inline-block"
                style={readinessPct >= 75
                  ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
                  : readinessPct >= 40
                  ? { background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }
                  : { background: "var(--bs-red-dim)", color: "var(--bs-red)" }
                }
              >
                {readinessPct >= 75 ? "On Track" : readinessPct >= 40 ? "Needs Work" : "Critical"}
              </span>
              <span className="text-[11px]" style={{ color: "var(--bs-text-dim)" }}>
                {Object.values(sectionScores).filter(s => s >= 75).length}/{Object.values(sectionScores).length} sections ready
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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

        {/* RIGHT: Metric Stack (2 cols) */}
        <div className="col-span-2 flex flex-col gap-3">

          {/* Square Footage */}
          <div className="rounded-[10px] p-[18px] flex-1 flex flex-col justify-between" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="text-[11px] uppercase mb-2" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.5px" }}>Square Footage</div>
            <div>
              <div className="text-[24px] font-medium tabular-nums leading-none" style={{ color: "var(--bs-text-primary)", letterSpacing: "-0.3px" }}>
                {grossArea ? fmtSF(grossArea) : "—"}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: "var(--bs-text-dim)" }}>
                {grossArea ? "SF · gross roof area" : "Not set"}
                {takenOff > 0 && grossArea > 0 && deltaPct !== null && (
                  <span style={{ color: deltaPct > 5 ? "var(--bs-red)" : "var(--bs-text-dim)" }}> · {deltaPct.toFixed(1)}% gap</span>
                )}
              </div>
            </div>
          </div>

          {/* Total Bid */}
          <div className="rounded-[10px] p-[18px] flex-1 flex flex-col justify-between" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="text-[11px] uppercase mb-2" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.5px" }}>Total Bid</div>
            <div>
              <div className="text-[24px] font-medium tabular-nums leading-none" style={{ color: "var(--bs-text-primary)", letterSpacing: "-0.3px" }}>
                {bidAmt ? fmt$K(bidAmt) : "—"}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: "var(--bs-text-dim)" }}>
                {bidAmt ? `$${bidAmt.toLocaleString()}` : "Not entered"}
              </div>
            </div>
          </div>

          {/* Cost / SF */}
          <div className="rounded-[10px] p-[18px] flex-1 flex flex-col justify-between" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-teal)" }}>
            <div className="text-[11px] uppercase mb-2" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.5px" }}>Cost / SF</div>
            <div>
              <div className="text-[24px] font-medium tabular-nums leading-none" style={{ color: "var(--bs-teal)", letterSpacing: "-0.3px" }}>
                {dpsf ? `$${dpsf.toFixed(2)}` : "—"}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: "var(--bs-text-dim)" }}>
                {dpsf ? (dpsf < 15 ? "Below market" : dpsf < 25 ? "Mid-range" : "Above market") : "Pending pricing"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── ACTION ITEMS ─────────────────────────────────────────────────────── */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="flex items-center justify-between px-[18px] py-[12px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>Action Items</span>
            {blockers > 0 && (
              <span className="bs-badge bs-badge-danger inline-flex items-center gap-1.5">
                <span className="bs-dot" style={{ background: "var(--bs-red)" }} />
                {blockers} blocker{blockers !== 1 ? "s" : ""}
              </span>
            )}
            {warnings > 0 && (
              <span className="bs-badge bs-badge-warning inline-flex items-center gap-1.5">
                <span className="bs-dot" style={{ background: "var(--bs-amber)" }} />
                {warnings} warning{warnings !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab?.("validator")}
            className="bs-link cursor-pointer"
          >
            Run validator →
          </button>
        </div>

        {actionItems.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bs-teal)" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--bs-text-primary)" }}>All sections passing</p>
            <p className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>No action items — bid is ready to submit</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_100px_80px] bs-table-header">
              <span>Issue</span>
              <span>Section</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            {actionItems.map((item, i) => {
              const isRed = item.level === "red";
              return (
                <div
                  key={`${item.tab}-${i}`}
                  className="grid grid-cols-[1fr_120px_100px_80px] bs-table-row cursor-pointer"
                  onClick={() => onNavigateTab?.(item.tab)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="bs-dot shrink-0" style={{ background: isRed ? "var(--bs-red)" : "var(--bs-amber)" }} />
                    <span className="text-[13px]" style={{ color: "var(--bs-text-secondary)" }}>{item.text}</span>
                  </div>
                  <div className="flex items-center">
                    <SectionBadge tab={item.tab} />
                  </div>
                  <div className="flex items-center">
                    <span
                      className="bs-badge"
                      style={isRed
                        ? { background: "var(--bs-red-dim)", color: "var(--bs-red)" }
                        : { background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }
                      }
                    >
                      {isRed ? "Blocker" : "Warning"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      className="bs-link cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onNavigateTab?.(item.tab); }}
                    >
                      {isRed ? "Fix →" : "Review →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PROJECT NOTES ────────────────────────────────────────────────────── */}
      {project?.notes && (
        <div className="rounded-[10px] px-[18px] py-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="text-[11px] font-medium uppercase mb-3" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>Notes</div>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--bs-text-secondary)" }}>{project.notes}</p>
        </div>
      )}

    </div>
  );
}
