"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string; ring: string }> = {
  done: { icon: "\u2713", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  pending: { icon: "\u25CB", color: "text-slate-400", bg: "bg-slate-50", ring: "ring-slate-200" },
  rfi: { icon: "?", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
  warning: { icon: "\u26A0", color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
  na: { icon: "\u2014", color: "text-slate-400", bg: "bg-slate-50", ring: "ring-slate-200" },
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ phase1: true });

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
        if (!current) return prev;
        const idx = order.indexOf(current.status);
        return prev.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: order[(idx + 1) % order.length] } : i);
      });
      return;
    }
    const currentItem = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
    if (!currentItem) return;
    const idx = order.indexOf(currentItem.status);
    await updateChecklistItemMut({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: order[(idx + 1) % order.length] });
  };

  const getItemStatus = (phaseKey: string, itemId: string): ChecklistStatus => {
    const item = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
    return (item?.status as ChecklistStatus) || "pending";
  };

  const getPhaseProgress = (phaseKey: string): number => {
    const items = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    if (items.length === 0) return 0;
    return Math.round((items.filter((i: any) => i.status === "done" || i.status === "na").length / items.length) * 100);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{project?.name || "Project"} Checklist</h2>
            {(systemType || deckType) && (
              <div className="flex gap-2 mt-1.5">
                {systemType && <span className="text-[10px] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md uppercase ring-1 ring-violet-200">{systemType}</span>}
                {deckType && <span className="text-[10px] font-medium bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md capitalize ring-1 ring-slate-200">{deckType} deck</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">{overall}%</span>
            <div className="w-32 sm:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overall >= 80 ? "bg-emerald-500" : overall >= 40 ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${overall}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="flex flex-col gap-3">
        {Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
          const progress = getPhaseProgress(phaseKey);
          const isOpen = expanded[phaseKey];

          return (
            <div key={phaseKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleExpand(phaseKey)}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <span className="text-lg">{phase.icon}</span>
                  <span className="text-left">{phase.title}</span>
                  {phase.critical && (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full ring-1 ring-red-200">CRITICAL</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress >= 80 ? "bg-emerald-500" : progress > 0 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={`text-sm font-semibold tabular-nums min-w-[40px] text-right ${progress >= 80 ? "text-emerald-600" : progress > 0 ? "text-amber-600" : "text-slate-400"}`}>{progress}%</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {phase.criticalRule && isOpen && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-sm text-amber-700 font-medium">
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
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ring-1 ${config.color} ${config.bg} ${config.ring}`}>
                          {config.icon}
                        </span>
                        <span className={`text-sm flex-1 ${status === "done" || status === "na" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          {item.text}
                        </span>
                        {status === "rfi" && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">RFI</span>}
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
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs text-slate-400">Click items to cycle status:</span>
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ring-1 ${config.color} ${config.bg} ${config.ring}`}>{config.icon}</span>
              <span className="text-xs text-slate-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
