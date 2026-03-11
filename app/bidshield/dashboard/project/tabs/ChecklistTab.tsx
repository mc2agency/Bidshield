"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";
type FilterMode = "all" | "incomplete" | "flagged" | "rfi" | "done";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string; ring: string }> = {
  done:    { icon: "✓", color: "text-emerald-600", bg: "bg-emerald-50",  ring: "ring-emerald-200" },
  pending: { icon: "○", color: "text-slate-400",   bg: "bg-slate-50",    ring: "ring-slate-200"   },
  rfi:     { icon: "?", color: "text-amber-600",   bg: "bg-amber-50",    ring: "ring-amber-200"   },
  warning: { icon: "⚠", color: "text-red-600",     bg: "bg-red-50",      ring: "ring-red-200"     },
  na:      { icon: "—", color: "text-slate-400",   bg: "bg-slate-50",    ring: "ring-slate-200"   },
};

function matchesFilter(status: ChecklistStatus, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "incomplete") return status === "pending" || status === "rfi" || status === "warning";
  if (filter === "flagged") return status === "warning";
  if (filter === "rfi") return status === "rfi";
  if (filter === "done") return status === "done" || status === "na";
  return true;
}

const demoChecklist = getChecklistForTrade("roofing", "tpo", "steel");
const demoItems = (() => {
  const items: { phaseKey: string; itemId: string; status: ChecklistStatus; notes: string }[] = [];
  const doneIds = ["p1-1", "p1-2", "p1-3", "p2-1", "p2-2", "p2-3", "p3-1", "p3-2"];
  const rfiIds  = ["p3-4", "p5-1"];
  for (const [phaseKey, phase] of Object.entries(demoChecklist)) {
    for (const item of (phase as any).items) {
      let status: ChecklistStatus = "pending";
      if (doneIds.includes(item.id)) status = "done";
      if (rfiIds.includes(item.id))  status = "rfi";
      items.push({ phaseKey, itemId: item.id, status, notes: "" });
    }
  }
  return items;
})();

export default function ChecklistTab({ projectId, isDemo, project, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const checklistItems   = useQuery(api.bidshield.getChecklist,         !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const overallProgress  = useQuery(api.bidshield.getChecklistProgress, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const updateChecklist  = useMutation(api.bidshield.updateChecklistItem);

  const [demoState, setDemoState]     = useState(demoItems);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({});
  const [filter, setFilter]           = useState<FilterMode>("incomplete");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText]       = useState("");
  const touchStartX = useRef<number>(0);
  const [swipeActive, setSwipeActive] = useState<string | null>(null);

  const trade             = project?.trade || "roofing";
  const systemType        = project?.systemType;
  const deckType          = project?.deckType;
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, systemType, deckType);
  const resolvedItems     = isDemo ? demoState : (checklistItems ?? []);

  const overall = isDemo
    ? (() => { const d = demoState.filter(i => i.status === "done" || i.status === "na").length; return demoState.length > 0 ? Math.round((d / demoState.length) * 100) : 0; })()
    : (overallProgress ?? 0);

  const getItemStatus = useCallback((phaseKey: string, itemId: string): ChecklistStatus =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.status as ChecklistStatus) || "pending",
  [resolvedItems]);

  const getItemNote = useCallback((phaseKey: string, itemId: string): string =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.notes) || "",
  [resolvedItems]);

  const setStatus = useCallback(async (phaseKey: string, itemId: string, target: ChecklistStatus) => {
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: target } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: target, notes: (current as any)?.notes });
    }
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  const cycleStatus = useCallback(async (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];
    const current = getItemStatus(phaseKey, itemId);
    await setStatus(phaseKey, itemId, order[(order.indexOf(current) + 1) % order.length]);
  }, [getItemStatus, setStatus]);

  const saveNote = useCallback(async (phaseKey: string, itemId: string, note: string) => {
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, notes: note } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: (current as any)?.status || "pending", notes: note });
    }
    setEditingNote(null);
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  const getPhaseStats = useCallback((phaseKey: string) => {
    const items    = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    const total    = items.length;
    const done     = items.filter((i: any) => i.status === "done" || i.status === "na").length;
    const blockers = items.filter((i: any) => i.status === "warning").length;
    const rfis     = items.filter((i: any) => i.status === "rfi").length;
    const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, blockers, rfis, pct };
  }, [resolvedItems]);

  const filterCounts = useMemo(() => {
    const allItems = Object.entries(checklistTemplate).flatMap(([phaseKey, phase]) =>
      (phase as any).items.map((item: any) => ({ phaseKey, itemId: item.id, status: getItemStatus(phaseKey, item.id) }))
    );
    return {
      all:        allItems.length,
      incomplete: allItems.filter(i => matchesFilter(i.status, "incomplete")).length,
      flagged:    allItems.filter(i => matchesFilter(i.status, "flagged")).length,
      rfi:        allItems.filter(i => matchesFilter(i.status, "rfi")).length,
      done:       allItems.filter(i => matchesFilter(i.status, "done")).length,
    };
  }, [checklistTemplate, resolvedItems, getItemStatus]);

  const visiblePhases = useMemo(() => {
    return Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
      const p = phase as any;
      const items = p.items.filter((item: any) => matchesFilter(getItemStatus(phaseKey, item.id), filter));
      return { phaseKey, phase: p, items };
    }).filter(({ items }) => items.length > 0);
  }, [checklistTemplate, filter, resolvedItems, getItemStatus]);

  const bidDate  = project?.bidDate ? new Date(project.bidDate) : null;
  const daysUntil = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / 86400000) : null;

  const blockerCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).blockers, 0),
  [checklistTemplate, getPhaseStats]);
  const rfiCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).rfis, 0),
  [checklistTemplate, getPhaseStats]);

  // Build quick action items dynamically
  const quickActions = useMemo(() => {
    const actions: { label: string; onClick: () => void }[] = [];
    // Top incomplete phases
    const phaseIncomplete = Object.entries(checklistTemplate)
      .map(([phaseKey, phase]) => {
        const p = phase as any;
        const incomplete = p.items.filter((item: any) => matchesFilter(getItemStatus(phaseKey, item.id), "incomplete")).length;
        return { phaseKey, title: p.title, incomplete };
      })
      .filter(p => p.incomplete > 0)
      .sort((a, b) => b.incomplete - a.incomplete)
      .slice(0, 3);
    for (const ph of phaseIncomplete) {
      actions.push({
        label: `Complete ${ph.title} (${ph.incomplete} item${ph.incomplete !== 1 ? "s" : ""} left)`,
        onClick: () => { setFilter("incomplete"); setExpanded(p => ({ ...p, [ph.phaseKey]: true })); },
      });
    }
    if (rfiCount > 0) {
      actions.push({ label: `Review ${rfiCount} open RFI${rfiCount !== 1 ? "s" : ""}`, onClick: () => onNavigateTab?.("rfis") });
    }
    return actions;
  }, [checklistTemplate, resolvedItems, getItemStatus, rfiCount, onNavigateTab]);

  const dpsf = (project as any)?.totalBidAmount && (project as any)?.grossRoofArea
    ? Math.round(((project as any).totalBidAmount / (project as any).grossRoofArea) * 100) / 100
    : null;

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: "all",        label: `All (${filterCounts.all})` },
    { id: "incomplete", label: `Incomplete (${filterCounts.incomplete})` },
    { id: "flagged",    label: `Flagged (${filterCounts.flagged})` },
    { id: "rfi",        label: `RFI (${filterCounts.rfi})` },
    { id: "done",       label: `Done (${filterCounts.done})` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

      {/* ── LEFT: Checklist ── */}
      <div className="flex flex-col gap-3 min-w-0">

        {/* Filter tabs — segmented control (Linear/Vercel pattern) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, background: "#f3f4f6", padding: 4, borderRadius: 8 }}>
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: filter === id ? 500 : 400,
                background: filter === id ? "#ffffff" : "transparent",
                color: filter === id ? "#111827" : "#6b7280",
                boxShadow: filter === id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {visiblePhases.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="text-4xl mb-3">{filter === "incomplete" ? "🎉" : "📋"}</div>
            <p className="text-sm font-semibold text-slate-700">{filter === "incomplete" ? "All items complete!" : "No items match this filter"}</p>
          </div>
        )}

        {/* Phase cards */}
        <div className="flex flex-col gap-2">
          {visiblePhases.map(({ phaseKey, phase, items }) => {
            const stats          = getPhaseStats(phaseKey);
            const isOpen         = expanded[phaseKey] ?? (filter !== "done" && stats.pct < 100);
            const isHighRisk     = !!phase.critical;
            const allItemsInPhase = (phase as any).items;
            const pctColor       = stats.pct === 0 ? "#6b7280" : stats.pct < 50 ? "#f59e0b" : stats.pct < 100 ? "#3b82f6" : "#10b981";

            return (
              <div
                key={phaseKey}
                className="overflow-hidden"
                style={{
                  background: "#fafafa",
                  border: `1px solid ${isHighRisk ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: 8,
                  borderLeft: isHighRisk ? "3px solid #f87171" : undefined,
                }}
              >
                {/* Phase header */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [phaseKey]: !isOpen }))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100/60 transition-colors text-left"
                >
                  <span className="text-base shrink-0">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-slate-800">{phase.title}</span>
                      {isHighRisk && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">CRITICAL</span>}
                      {stats.blockers > 0 && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{stats.blockers} blocked</span>}
                      {stats.rfis > 0    && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{stats.rfis} RFI</span>}
                    </div>
                    {/* Mini inline progress bar — replaces dot strip */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-slate-400 shrink-0">{allItemsInPhase.length} items</span>
                      <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${stats.pct}%`, background: pctColor }}
                        />
                      </div>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: pctColor }}>{stats.pct}%</span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Critical rule banner */}
                {phase.criticalRule && isOpen && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-700 font-medium">
                    ⚠ {phase.criticalRule}
                  </div>
                )}

                {/* Items — 40px rows, note hover-only */}
                {isOpen && (
                  <div className="border-t border-[#e2e8f0] divide-y divide-[#f1f5f9]">
                    {items.map((item: any) => {
                      const status           = getItemStatus(phaseKey, item.id);
                      const note             = getItemNote(phaseKey, item.id);
                      const config           = statusConfig[status];
                      const rowKey           = `${phaseKey}-${item.id}`;
                      const isDone           = status === "done" || status === "na";
                      const isSwipe          = swipeActive === rowKey;
                      const isEditingThisNote = editingNote === rowKey;

                      return (
                        <div
                          key={item.id}
                          className={`group transition-colors ${isSwipe ? "bg-slate-100" : ""}`}
                          style={{ background: isSwipe ? undefined : undefined }}
                        >
                          {/* Main row */}
                          <div
                            className="flex items-center gap-3 px-4 cursor-pointer select-none hover:bg-[#f8fafc]"
                            style={{ padding: "10px 16px" }}
                            onClick={() => cycleStatus(phaseKey, item.id)}
                            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setSwipeActive(rowKey); }}
                            onTouchEnd={(e) => {
                              const dx = e.changedTouches[0].clientX - touchStartX.current;
                              setSwipeActive(null);
                              if (Math.abs(dx) > 60) setStatus(phaseKey, item.id, dx > 0 ? "done" : "na");
                            }}
                          >
                            {/* Status badge */}
                            <span className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold ring-1 shrink-0 ${config.color} ${config.bg} ${config.ring}`}>
                              {config.icon}
                            </span>

                            {/* Item text */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-[13px] leading-snug ${isDone ? "text-slate-400 line-through" : isHighRisk ? "font-medium text-slate-900" : "text-slate-700"}`}>
                                {item.text}
                              </span>
                              {note && !isEditingThisNote && (
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">📝 {note.slice(0, 60)}{note.length > 60 ? "…" : ""}</p>
                              )}
                            </div>

                            {/* RFI badge */}
                            {status === "rfi" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onNavigateTab?.("rfis"); }}
                                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-semibold shrink-0 transition-colors"
                              >
                                RFI →
                              </button>
                            )}

                            {/* + Note button — hover only, fades in on right */}
                            {!isEditingThisNote && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 hover:text-emerald-600 shrink-0 ml-1"
                              >
                                {note ? "Edit note" : "+ Note"}
                              </button>
                            )}
                          </div>

                          {/* Note editing textarea */}
                          {isEditingThisNote && (
                            <div className="px-4 pb-3 pt-1 ml-9" onClick={e => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                onBlur={() => saveNote(phaseKey, item.id, noteText)}
                                onKeyDown={e => { if (e.key === "Escape") setEditingNote(null); if (e.key === "Enter" && e.metaKey) saveNote(phaseKey, item.id, noteText); }}
                                placeholder="Add a note..."
                                rows={2}
                                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                              />
                              <p className="text-[10px] text-slate-400 mt-0.5">Blur or ⌘↵ to save · Esc to cancel</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 px-3 py-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 self-center">Tap to cycle:</span>
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={`w-4 h-4 flex items-center justify-center rounded ring-1 text-[8px] font-bold ${config.color} ${config.bg} ${config.ring}`}>{config.icon}</span>
              <span className="text-[10px] text-slate-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Sticky panel ── */}
      <div className="hidden lg:flex flex-col gap-3 sticky top-4">

        {/* Bid readiness — progress bar, no donut */}
        <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
          <div className="flex items-center justify-between mb-2">
            <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bid Readiness</div>
            <span className="text-2xl font-bold text-slate-900">{overall}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overall}%`, background: "#10b981" }}
            />
          </div>

          {/* Project info */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="text-[13px] font-semibold text-slate-900 leading-snug">{project?.name || "—"}</div>
            {(project as any)?.gc && <div className="text-[11px] text-slate-500">GC: {(project as any).gc}</div>}
            {project?.bidDate && daysUntil !== null && (
              <div className={`text-[11px] font-medium ${daysUntil <= 0 ? "text-red-600" : daysUntil <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                {daysUntil <= 0 ? "Past due" : daysUntil === 0 ? "Due today" : `${daysUntil}d until bid`}
              </div>
            )}
            {dpsf && <div className="text-[11px] text-slate-400">${dpsf}/SF</div>}
          </div>
        </div>

        {/* Compact stats — single inline row, no boxes */}
        <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "12px 16px" }}>
          <div className="text-[14px]" style={{ color: "#64748b" }}>
            <span>{filterCounts.incomplete} incomplete</span>
            {rfiCount > 0 && <span> · <span className="text-amber-600 font-medium">{rfiCount} RFI{rfiCount !== 1 ? "s" : ""}</span></span>}
            {blockerCount > 0 && <span> · <span className="text-red-600 font-medium">{blockerCount} blocked</span></span>}
            <span> · <span className="text-emerald-600 font-medium">{filterCounts.done} done</span></span>
          </div>
        </div>

        {/* Quick actions — clean text links, no colored boxes */}
        {quickActions.length > 0 && (
          <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Quick Actions</div>
            <div className="flex flex-col gap-2.5">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="text-[13px] text-slate-600 hover:text-emerald-600 text-left transition-colors flex items-start gap-1.5"
                >
                  <span className="shrink-0 mt-px">→</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
