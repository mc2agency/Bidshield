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

function ProgressRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 90 ? "#059669" : score >= 60 ? "#f59e0b" : "#dc2626";
  const bgColor = score >= 90 ? "#d1fae5" : score >= 60 ? "#fef3c7" : "#fee2e2";
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bgColor} strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold leading-none" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
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

  const [demoState, setDemoState]         = useState(demoItems);
  const [expanded, setExpanded]           = useState<Record<string, boolean>>({});
  const [filter, setFilter]               = useState<FilterMode>("incomplete");
  const [editingNote, setEditingNote]     = useState<string | null>(null); // "phaseKey-itemId"
  const [noteText, setNoteText]           = useState("");
  const touchStartX = useRef<number>(0);
  const [swipeActive, setSwipeActive]     = useState<string | null>(null);

  const trade        = project?.trade || "roofing";
  const systemType   = project?.systemType;
  const deckType     = project?.deckType;
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, systemType, deckType);
  const resolvedItems     = isDemo ? demoState : (checklistItems ?? []);

  const overall = isDemo
    ? (() => { const d = demoState.filter(i => i.status === "done" || i.status === "na").length; return demoState.length > 0 ? Math.round((d / demoState.length) * 100) : 0; })()
    : (overallProgress ?? 0);

  // Helpers
  const getItemStatus = useCallback((phaseKey: string, itemId: string): ChecklistStatus =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.status as ChecklistStatus) || "pending",
  [resolvedItems]);

  const getItemNote = useCallback((phaseKey: string, itemId: string): string =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.notes) || "",
  [resolvedItems]);

  // Status actions
  const setStatus = useCallback(async (phaseKey: string, itemId: string, target: ChecklistStatus) => {
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: target } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      const note = (current as any)?.notes;
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: target, notes: note });
    }
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  const cycleStatus = useCallback(async (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];
    const current = getItemStatus(phaseKey, itemId);
    const next = order[(order.indexOf(current) + 1) % order.length];
    await setStatus(phaseKey, itemId, next);
  }, [getItemStatus, setStatus]);

  const saveNote = useCallback(async (phaseKey: string, itemId: string, note: string) => {
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, notes: note } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      const currentStatus: ChecklistStatus = (current as any)?.status || "pending";
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: currentStatus, notes: note });
    }
    setEditingNote(null);
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  // Phase stats
  const getPhaseStats = useCallback((phaseKey: string) => {
    const items = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    const total    = items.length;
    const done     = items.filter((i: any) => i.status === "done" || i.status === "na").length;
    const blockers = items.filter((i: any) => i.status === "warning").length;
    const rfis     = items.filter((i: any) => i.status === "rfi").length;
    const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, blockers, rfis, pct };
  }, [resolvedItems]);

  // Global item counts per filter (for badge labels)
  const filterCounts = useMemo(() => {
    const allItems = Object.entries(checklistTemplate).flatMap(([phaseKey, phase]) =>
      (phase as any).items.map((item: any) => ({
        phaseKey, itemId: item.id, status: getItemStatus(phaseKey, item.id)
      }))
    );
    return {
      all:        allItems.length,
      incomplete: allItems.filter(i => matchesFilter(i.status, "incomplete")).length,
      flagged:    allItems.filter(i => matchesFilter(i.status, "flagged")).length,
      rfi:        allItems.filter(i => matchesFilter(i.status, "rfi")).length,
      done:       allItems.filter(i => matchesFilter(i.status, "done")).length,
    };
  }, [checklistTemplate, resolvedItems, getItemStatus]);

  // Phases to show + items within each
  const visiblePhases = useMemo(() => {
    return Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
      const p = phase as any;
      const items = p.items.filter((item: any) => matchesFilter(getItemStatus(phaseKey, item.id), filter));
      return { phaseKey, phase: p, items };
    }).filter(({ items }) => items.length > 0);
  }, [checklistTemplate, filter, resolvedItems, getItemStatus]);

  // Days until bid
  const bidDate = project?.bidDate ? new Date(project.bidDate) : null;
  const daysUntil = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / 86400000) : null;

  // Global blocker / warning counts for right panel
  const blockerCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).blockers, 0),
  [checklistTemplate, getPhaseStats]);
  const rfiCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).rfis, 0),
  [checklistTemplate, getPhaseStats]);

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: "all",        label: `All (${filterCounts.all})` },
    { id: "incomplete", label: `Incomplete (${filterCounts.incomplete})` },
    { id: "flagged",    label: `Flagged (${filterCounts.flagged})` },
    { id: "rfi",        label: `RFI (${filterCounts.rfi})` },
    { id: "done",       label: `Done (${filterCounts.done})` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

      {/* ── LEFT: Checklist ── */}
      <div className="flex flex-col gap-3 min-w-0">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-1.5 bg-white rounded-xl border border-slate-200 p-2">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === id
                  ? id === "flagged" ? "bg-red-600 text-white"
                  : id === "rfi"     ? "bg-amber-500 text-white"
                  : id === "done"    ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
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

        {/* Phase list */}
        <div className="flex flex-col gap-2">
          {visiblePhases.map(({ phaseKey, phase, items }) => {
            const stats = getPhaseStats(phaseKey);
            const isOpen = expanded[phaseKey] ?? (filter !== "done" && stats.pct < 100);
            const isHighRisk = !!phase.critical;
            const allItemsInPhase = (phase as any).items;

            return (
              <div
                key={phaseKey}
                className={`bg-white rounded-xl border overflow-hidden ${
                  isHighRisk ? "border-l-4 border-l-red-400 border-slate-200" : "border-slate-200"
                }`}
              >
                {/* Phase header */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [phaseKey]: !isOpen }))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-base flex-shrink-0">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isHighRisk ? "text-slate-900" : "text-slate-800"}`}>
                        {phase.title}
                      </span>
                      {isHighRisk && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">CRITICAL</span>}
                      {stats.blockers > 0 && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{stats.blockers} blocked</span>}
                      {stats.rfis > 0    && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{stats.rfis} RFI</span>}
                    </div>
                    {/* Mini dot progress bar */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex gap-0.5">
                        {allItemsInPhase.slice(0, 12).map((item: any) => {
                          const st = getItemStatus(phaseKey, item.id);
                          return (
                            <span key={item.id} className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              st === "done" || st === "na" ? "bg-emerald-400"
                              : st === "warning" ? "bg-red-400"
                              : st === "rfi"     ? "bg-amber-400"
                              : "bg-slate-200"
                            }`} />
                          );
                        })}
                        {allItemsInPhase.length > 12 && <span className="text-[9px] text-slate-400 ml-0.5">+{allItemsInPhase.length - 12}</span>}
                      </div>
                      <span className="text-[10px] text-slate-400">{allItemsInPhase.length} items</span>
                      <span className={`text-[10px] font-bold ml-auto ${stats.pct >= 80 ? "text-emerald-600" : stats.pct > 0 ? "text-amber-600" : "text-slate-400"}`}>
                        {stats.pct}%
                      </span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Critical rule banner */}
                {phase.criticalRule && isOpen && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-700 font-medium">
                    ⚠ {phase.criticalRule}
                  </div>
                )}

                {/* Items */}
                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {items.map((item: any) => {
                      const status   = getItemStatus(phaseKey, item.id);
                      const note     = getItemNote(phaseKey, item.id);
                      const config   = statusConfig[status];
                      const rowKey   = `${phaseKey}-${item.id}`;
                      const isDone   = status === "done" || status === "na";
                      const isSwipe  = swipeActive === rowKey;
                      const isEditingThisNote = editingNote === rowKey;

                      return (
                        <div
                          key={item.id}
                          className={`px-4 py-3 transition-colors ${isSwipe ? "bg-slate-100" : "hover:bg-slate-50/70"}`}
                        >
                          <div
                            className="flex items-start gap-3 cursor-pointer select-none"
                            onClick={() => cycleStatus(phaseKey, item.id)}
                            onTouchStart={(e) => {
                              touchStartX.current = e.touches[0].clientX;
                              setSwipeActive(rowKey);
                            }}
                            onTouchEnd={(e) => {
                              const dx = e.changedTouches[0].clientX - touchStartX.current;
                              setSwipeActive(null);
                              if (Math.abs(dx) > 60) setStatus(phaseKey, item.id, dx > 0 ? "done" : "na");
                            }}
                          >
                            {/* Status badge */}
                            <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ring-1 flex-shrink-0 mt-0.5 ${config.color} ${config.bg} ${config.ring}`}>
                              {config.icon}
                            </span>

                            {/* Item text + note preview */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm leading-snug ${isDone ? "text-slate-400 line-through" : isHighRisk ? "font-medium text-slate-900" : "text-slate-700"}`}>
                                {item.text}
                              </span>
                              {note && !isEditingThisNote && (
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">📝 {note.slice(0, 50)}{note.length > 50 ? "…" : ""}</p>
                              )}
                            </div>

                            {/* RFI badge — clickable */}
                            {status === "rfi" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateTab?.("rfis");
                                }}
                                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0 transition-colors"
                                title="Go to RFIs"
                              >
                                RFI →
                              </button>
                            )}
                          </div>

                          {/* Note field */}
                          {isEditingThisNote ? (
                            <div className="mt-2 ml-10" onClick={e => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                onBlur={() => saveNote(phaseKey, item.id, noteText)}
                                onKeyDown={e => { if (e.key === "Escape") { setEditingNote(null); } if (e.key === "Enter" && e.metaKey) saveNote(phaseKey, item.id, noteText); }}
                                placeholder="Add a note..."
                                rows={2}
                                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                              />
                              <p className="text-[10px] text-slate-400 mt-0.5">Blur or ⌘↵ to save · Esc to cancel</p>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                              className="mt-1.5 ml-10 text-[11px] text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              {note ? "Edit note" : "＋ Add note"}
                            </button>
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
        <div className="flex flex-wrap gap-3 px-3 py-2 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 self-center">Tap to cycle:</span>
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1">
              <span className={`w-4 h-4 flex items-center justify-center rounded ring-1 text-[8px] font-bold ${config.color} ${config.bg} ${config.ring}`}>{config.icon}</span>
              <span className="text-[10px] text-slate-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Sticky project panel ── */}
      <div className="hidden lg:flex flex-col gap-3 sticky top-4">

        {/* Progress ring + project info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing score={overall} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bid Readiness</div>
              <div className={`text-sm font-bold ${overall >= 90 ? "text-emerald-600" : overall >= 60 ? "text-amber-600" : "text-red-600"}`}>
                {overall >= 90 ? "Ready to submit" : overall >= 60 ? "In progress" : "Needs work"}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
            <div className="font-semibold text-slate-900 leading-snug">{project?.name || "—"}</div>
            {(project as any)?.gc && <div className="text-slate-500 text-xs">GC: {(project as any).gc}</div>}
            {project?.bidDate && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                daysUntil !== null && daysUntil <= 0 ? "text-red-600"
                : daysUntil !== null && daysUntil <= 3 ? "text-amber-600"
                : "text-slate-600"
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" /></svg>
                {daysUntil === null ? project.bidDate
                  : daysUntil <= 0 ? `Past due (${project.bidDate})`
                  : daysUntil === 0 ? "Due today"
                  : `${daysUntil}d until bid`}
              </div>
            )}
            {(project as any)?.totalBidAmount && (project as any)?.grossRoofArea && (
              <div className="text-xs text-slate-500">
                ${((project as any).totalBidAmount / (project as any).grossRoofArea).toFixed(2)}/SF
              </div>
            )}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Item Status</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-800">{filterCounts.incomplete}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Incomplete</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${blockerCount > 0 ? "bg-red-50" : "bg-slate-50"}`}>
              <div className={`text-2xl font-bold ${blockerCount > 0 ? "text-red-600" : "text-slate-400"}`}>{blockerCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Blocked</div>
            </div>
            <div className={`rounded-lg p-3 text-center ${rfiCount > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
              <div className={`text-2xl font-bold ${rfiCount > 0 ? "text-amber-600" : "text-slate-400"}`}>{rfiCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">RFIs</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{filterCounts.done}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Done</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {(blockerCount > 0 || rfiCount > 0) && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</div>
            <div className="flex flex-col gap-2">
              {blockerCount > 0 && (
                <button onClick={() => setFilter("flagged")} className="text-xs text-left px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors">
                  View {blockerCount} blocked item{blockerCount !== 1 ? "s" : ""} →
                </button>
              )}
              {rfiCount > 0 && (
                <button onClick={() => onNavigateTab?.("rfis")} className="text-xs text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors">
                  Review {rfiCount} open RFI{rfiCount !== 1 ? "s" : ""} →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
