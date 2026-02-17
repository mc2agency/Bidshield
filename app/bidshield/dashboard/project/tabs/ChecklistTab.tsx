"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";
type FilterMode = "incomplete" | "all" | "complete";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string; ring: string }> = {
  done: { icon: "✓", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  pending: { icon: "○", color: "text-slate-400", bg: "bg-slate-50", ring: "ring-slate-200" },
  rfi: { icon: "?", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
  warning: { icon: "⚠", color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
  na: { icon: "—", color: "text-slate-400", bg: "bg-slate-50", ring: "ring-slate-200" },
};

const demoChecklist = getChecklistForTrade("roofing", "tpo", "steel");
const demoItems = (() => {
  const items: { phaseKey: string; itemId: string; status: ChecklistStatus }[] = [];
  const doneIds = ["p1-1", "p1-2", "p1-3", "p2-1", "p2-2", "p2-3", "p3-1", "p3-2"];
  const rfiIds = ["p3-4", "p5-1"];
  for (const [phaseKey, phase] of Object.entries(demoChecklist)) {
    for (const item of phase.items) {
      let status: ChecklistStatus = "pending";
      if (doneIds.includes(item.id)) status = "done";
      if (rfiIds.includes(item.id)) status = "rfi";
      items.push({ phaseKey, itemId: item.id, status });
    }
  }
  return items;
})();

export default function ChecklistTab({ projectId, isDemo, project }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const checklistItems = useQuery(api.bidshield.getChecklist, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const overallProgress = useQuery(api.bidshield.getChecklistProgress, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const updateChecklistItemMut = useMutation(api.bidshield.updateChecklistItem);

  const [demoChecklistState, setDemoChecklistState] = useState(demoItems);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterMode>("incomplete");

  const trade = project?.trade || "roofing";
  const systemType = project?.systemType || undefined;
  const deckType = project?.deckType || undefined;
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, systemType, deckType);
  const resolvedItems = isDemo ? demoChecklistState : (checklistItems ?? []);
  const overall = isDemo
    ? (() => { const done = demoChecklistState.filter(i => i.status === "done" || i.status === "na").length; return demoChecklistState.length > 0 ? Math.round((done / demoChecklistState.length) * 100) : 0; })()
    : (overallProgress ?? 0);

  const toggleExpand = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const cycleStatus = async (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];
    if (isDemo) {
      setDemoChecklistState((prev) => {
        const current = prev.find(i => i.phaseKey === phaseKey && i.itemId === itemId);
        const currentStatus = current?.status || "pending";
        const nextIdx = (order.indexOf(currentStatus) + 1) % order.length;
        return prev.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: order[nextIdx] } : i);
      });
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      const currentStatus = (current as any)?.status || "pending";
      const nextIdx = (order.indexOf(currentStatus) + 1) % order.length;
      const convexId = (current as any)?._id;
      if (convexId) await updateChecklistItemMut({ itemId: convexId, status: order[nextIdx] });
    }
  };

  const getItemStatus = (phaseKey: string, itemId: string): ChecklistStatus => {
    const item = resolvedItems.find((i: any) => (isDemo ? i.phaseKey === phaseKey && i.itemId === itemId : i.phaseKey === phaseKey && i.itemId === itemId));
    return ((item as any)?.status as ChecklistStatus) || "pending";
  };

  const getPhaseProgress = (phaseKey: string): number => {
    const items = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    if (items.length === 0) return 0;
    return Math.round((items.filter((i: any) => i.status === "done" || i.status === "na").length / items.length) * 100);
  };

  // Filter phases based on mode
  const phaseEntries = useMemo(() => {
    return Object.entries(checklistTemplate).filter(([phaseKey]) => {
      const progress = getPhaseProgress(phaseKey);
      if (filter === "incomplete") return progress < 100;
      if (filter === "complete") return progress >= 100;
      return true;
    });
  }, [checklistTemplate, filter, resolvedItems]);

  const incompleteCount = Object.keys(checklistTemplate).filter(k => getPhaseProgress(k) < 100).length;
  const completeCount = Object.keys(checklistTemplate).length - incompleteCount;

  return (
    <div className="flex flex-col gap-3">
      {/* Compact header: progress + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl p-3 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overall >= 80 ? "bg-emerald-500" : overall >= 40 ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${overall}%` }} />
            </div>
            <span className={`text-sm font-bold tabular-nums ${overall >= 80 ? "text-emerald-600" : overall >= 40 ? "text-amber-600" : "text-slate-500"}`}>{overall}%</span>
          </div>
          <span className="text-[10px] text-slate-400">{completeCount}/{Object.keys(checklistTemplate).length} phases done</span>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1">
          {(["incomplete", "all", "complete"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all capitalize ${
                filter === f
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f === "incomplete" ? `Needs Work (${incompleteCount})` : f === "complete" ? `Done (${completeCount})` : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Phases */}
      {phaseEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">{filter === "incomplete" ? "🎉" : "📋"}</div>
          <p className="text-sm text-slate-500">{filter === "incomplete" ? "All phases complete!" : "No phases match this filter"}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {phaseEntries.map(([phaseKey, phase]) => {
          const progress = getPhaseProgress(phaseKey);
          const isOpen = expanded[phaseKey] ?? (filter === "incomplete" && progress < 100 && phaseEntries.indexOf(phaseEntries.find(([k]) => k === phaseKey)!) === 0);

          return (
            <div key={phaseKey} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleExpand(phaseKey)}
                className="w-full flex justify-between items-center px-3 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 min-w-0">
                  <span className="text-base flex-shrink-0">{phase.icon}</span>
                  <span className="truncate">{phase.title}</span>
                  {phase.critical && (
                    <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex-shrink-0">!</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="hidden sm:block w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress >= 80 ? "bg-emerald-500" : progress > 0 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={`text-xs font-bold tabular-nums w-8 text-right ${progress >= 80 ? "text-emerald-600" : progress > 0 ? "text-amber-600" : "text-slate-400"}`}>{progress}%</span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {phase.criticalRule && isOpen && (
                <div className="px-3 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                  {phase.criticalRule}
                </div>
              )}

              {isOpen && (
                <div className="border-t border-slate-100">
                  {phase.items.map((item) => {
                    const status = getItemStatus(phaseKey, item.id);
                    const config = statusConfig[status];
                    return (
                      <div
                        key={item.id}
                        onClick={() => cycleStatus(phaseKey, item.id)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ring-1 flex-shrink-0 ${config.color} ${config.bg} ${config.ring}`}>
                          {config.icon}
                        </span>
                        <span className={`text-xs flex-1 ${status === "done" || status === "na" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          {item.text}
                        </span>
                        {status === "rfi" && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">RFI</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact legend */}
      <div className="flex flex-wrap gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200">
        <span className="text-[10px] text-slate-400">Tap to cycle:</span>
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center gap-1">
            <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[8px] ring-1 ${config.color} ${config.bg} ${config.ring}`}>{config.icon}</span>
            <span className="text-[10px] text-slate-500 capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
