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

export default function OverviewTab({ projectId, isDemo, project, userId, onNavigateTab, cachedData }: TabProps) {
  const [showCompleted, setShowCompleted] = useState(false);
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

  // Stats
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
  const matTotalCost = matList.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
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

  // Bid deadline
  const bidDeadlineMs = useMemo(() => {
    if (!project?.bidDate) return null;
    const bidTimeStr = (project as any)?.bidTime as string | undefined;
    if (bidTimeStr) return new Date(`${project.bidDate}T${bidTimeStr}:00`).getTime();
    return new Date(`${project.bidDate}T23:59:59`).getTime();
  }, [project]);
  const msUntilBid = bidDeadlineMs !== null ? bidDeadlineMs - nowMs : null;
  const hoursUntilBid = msUntilBid !== null ? msUntilBid / 3600000 : null;
  const daysUntilBid = msUntilBid !== null ? Math.ceil(msUntilBid / (1000 * 60 * 60 * 24)) : null;

  // Section scores (for progress bars)
  const sectionScores = useMemo(() => {
    const takeoffScore = (() => {
      if (controlSF === 0) return 50;
      if (deltaPct === null) return 50;
      return Math.max(0, Math.round(100 - deltaPct * 10));
    })();
    return {
      checklist: checklistPct,
      scope: Math.round(scopePct),
      takeoff: takeoffScore,
      pricing: pricingComplete ? 100 : (bidAmt ? 50 : 0),
      materials: matItemCount > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      quotes: quoteCount > 0 ? (expiredQuotes === 0 ? (expiringQuotes === 0 ? 100 : 70) : 40) : 50,
      addenda: addendaCount > 0 ? (scopeNotRepriced === 0 && addendaNotReviewed === 0 ? 100 : 40) : 100,
      rfis: rfiCount > 0 ? (pendingRFIs === 0 ? 100 : 60) : 100,
    };
  }, [checklistPct, scopePct, controlSF, deltaPct, pricingComplete, bidAmt, matItemCount, matUnpriced, quoteCount, expiredQuotes, expiringQuotes, addendaCount, scopeNotRepriced, addendaNotReviewed, rfiCount, pendingRFIs]);

  const sectionLabels: Record<string, string> = {
    checklist: "Checklist", scope: "Scope", takeoff: "Takeoff",
    pricing: "Pricing", materials: "Materials", quotes: "Quotes",
    addenda: "Addenda", rfis: "RFIs",
  };

  // Action items
  const actionItems: ActionItem[] = [];
  if (scopeTotal > 0) {
    if (scopePct < 80) actionItems.push({ level: "red", text: `${scopeUnaddressed} scope items not addressed`, tab: "scope" });
    else if (scopePct < 100) actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope items remaining`, tab: "scope" });
  }
  if (scopeNotRepriced > 0) actionItems.push({ level: "red", text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope — not re-priced`, tab: "addenda" });
  if (addendaNotReviewed > 0) actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not yet reviewed`, tab: "addenda" });
  if (controlSF > 0 && deltaPct !== null) {
    if (deltaPct > 5) actionItems.push({ level: "red", text: `${deltaSF.toLocaleString()} SF unaccounted in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    else if (deltaPct > 2) actionItems.push({ level: "yellow", text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
  }
  if (expiredQuotes > 0) actionItems.push({ level: "red", text: `${expiredQuotes} expired quote${expiredQuotes !== 1 ? "s" : ""}`, tab: "quotes" });
  if (expiringQuotes > 0) actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`, tab: "quotes" });
  if (pendingRFIs > 0) actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`, tab: "rfis" });
  if (checklistPct < 80) actionItems.push({ level: checklistPct < 50 ? "red" : "yellow", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  if (rfiItems > 0) actionItems.push({ level: "yellow", text: `${rfiItems} checklist items flagged as RFI`, tab: "checklist" });
  if (matItemCount === 0) actionItems.push({ level: "yellow", text: "Materials not yet calculated", tab: "materials" });
  else if (matUnpriced > 0) actionItems.push({ level: "yellow", text: `${matUnpriced} materials missing pricing`, tab: "materials" });
  if (!pricingComplete && (!bidAmt || bidAmt === 0)) actionItems.push({ level: "yellow", text: "Pricing not entered", tab: "pricing" });

  actionItems.sort((a, b) => ({ red: 0, yellow: 1, green: 2 }[a.level]) - ({ red: 0, yellow: 1, green: 2 }[b.level]));
  const greenCount = [
    scopeTotal > 0 && scopePct >= 100,
    addendaCount > 0 && addendaNotReviewed === 0 && scopeNotRepriced === 0,
    quoteCount > 0 && expiredQuotes === 0 && expiringQuotes === 0,
    rfiCount > 0 && pendingRFIs === 0,
    checklistPct >= 80,
    matItemCount > 0 && matUnpriced === 0,
    pricingComplete,
  ].filter(Boolean).length;

  const tabLabels: Record<string, string> = {
    scope: "Scope", addenda: "Addenda", takeoff: "Takeoff", quotes: "Quotes",
    rfis: "RFIs", checklist: "Checklist", materials: "Materials", pricing: "Pricing",
  };

  const levelStyles = {
    red: { borderColor: "#ef4444", bg: "#fef2f2", dot: "#ef4444", text: "#991b1b" },
    yellow: { borderColor: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b", text: "#78350f" },
  };

  const completeSections = Object.values(sectionScores).filter(s => s >= 75).length;
  const totalSections = Object.values(sectionScores).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Bid deadline card */}
      {msUntilBid !== null && (() => {
        const isOverdue = msUntilBid <= 0;
        const isCritical = !isOverdue && hoursUntilBid! <= 4;
        const isWarning = !isOverdue && !isCritical && hoursUntilBid! <= 24;
        const accentColor = isOverdue || isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
        const countdownText = isOverdue ? "Past due" : hoursUntilBid! < 24 ? formatCountdown(msUntilBid) : (daysUntilBid === 1 ? "1 day" : `${daysUntilBid} days`);
        const countdownLabel = isOverdue ? "" : hoursUntilBid! < 24 ? "until bid" : "to bid";
        const statusLabel = isOverdue ? "Overdue" : isCritical ? "Critical" : isWarning ? "Due today" : "On track";
        return (
          <div style={{
            background: isOverdue || isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "white",
            borderRadius: 12,
            border: `1px solid ${isOverdue || isCritical ? "#fecaca" : isWarning ? "#fde68a" : "#e5e7eb"}`,
            borderLeft: `4px solid ${accentColor}`,
            padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Bid Deadline</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: `${accentColor}18`, color: accentColor, padding: "1px 6px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.06em" }}>{statusLabel}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1, color: isOverdue || isCritical ? "#dc2626" : isWarning ? "#d97706" : "#111827", letterSpacing: "-0.03em" }}>
                {countdownText}
                {countdownLabel && <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280", marginLeft: 6 }}>{countdownLabel}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                {project?.bidDate ? (() => {
                  const bidTimeStr = (project as any)?.bidTime as string | undefined;
                  const dateLabel = new Date(`${project.bidDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  return bidTimeStr ? `${dateLabel} at ${bidTimeStr}` : dateLabel;
                })() : "No deadline set"}
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={accentColor}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
        );
      })()}

      {/* Key stats — 3-column stat cards */}
      {(bidAmt || grossArea) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Sq. Footage", value: grossArea ? `${grossArea.toLocaleString()}` : "—", unit: "SF", accent: "#334155" },
            { label: "Total Bid", value: bidAmt ? `$${(bidAmt / 1000).toFixed(0)}K` : "—", unit: null, accent: "#059669" },
            { label: "Cost / SF", value: dpsf ? `$${dpsf.toFixed(2)}` : "—", unit: null, accent: "#3b82f6" },
          ].map(({ label, value, unit, accent }) => (
            <div key={label} style={{ background: "white", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${accent}`, boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {value}{unit && <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginLeft: 3 }}>{unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action items */}
      {actionItems.length === 0 ? (
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "18px 20px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#dcfce7", border: "1px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#16a34a">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46", lineHeight: 1.3 }}>All clear — bid is ready to submit</div>
            <div style={{ fontSize: 12, color: "#16a34a", marginTop: 3 }}>{greenCount} section{greenCount !== 1 ? "s" : ""} passing</div>
          </div>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {/* Header */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Needs Attention</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {greenCount > 0 && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>{greenCount} passing</span>}
              <span style={{ fontSize: 11, fontWeight: 700, background: actionItems.some(a => a.level === "red") ? "#fef2f2" : "#fffbeb", color: actionItems.some(a => a.level === "red") ? "#dc2626" : "#d97706", padding: "2px 8px", borderRadius: 99 }}>
                {actionItems.length} issue{actionItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {/* Items */}
          <div style={{ padding: "4px 0" }}>
            {actionItems.map((item, i) => {
              const style = levelStyles[item.level as "red" | "yellow"];
              const isRed = item.level === "red";
              return (
                <button
                  key={`${item.tab}-${i}`}
                  onClick={() => onNavigateTab?.(item.tab)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                    padding: "10px 16px", cursor: "pointer", transition: "background 0.1s",
                    background: "transparent", border: "none", outline: "none", borderLeft: `3px solid ${style.borderColor}`, marginLeft: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = style.bg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${style.borderColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isRed ? (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={style.borderColor}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={style.borderColor}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: "#1e293b", fontWeight: 500, lineHeight: 1.35 }}>{item.text}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${style.borderColor}15`, color: style.borderColor, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                      {tabLabels[item.tab]}
                    </span>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section progress — table style */}
      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Section Progress</span>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{completeSections}/{totalSections} ready</span>
        </div>
        <div>
          {Object.entries(sectionScores).map(([key, score], idx, arr) => {
            const color = score >= 75 ? "#10b981" : score >= 25 ? "#f59e0b" : "#ef4444";
            const tabId = key as any;
            return (
              <button
                key={key}
                onClick={() => onNavigateTab?.(tabId)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  padding: "9px 16px", cursor: "pointer", transition: "background 0.1s", background: "transparent",
                  border: "none", outline: "none",
                  borderBottom: idx < arr.length - 1 ? "1px solid #f8fafc" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 36, height: 22, borderRadius: 4, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: "-0.01em" }}>{score}%</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151", width: 80, flexShrink: 0 }}>{sectionLabels[key]}</span>
                <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 9999, background: color, width: `${score}%`, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
                </div>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project notes */}
      {project?.notes && (
        <div style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Notes</div>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{project.notes}</p>
        </div>
      )}
    </div>
  );
}
