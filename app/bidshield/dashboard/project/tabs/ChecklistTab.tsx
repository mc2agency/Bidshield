"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string }> = {
  done: { icon: "✓", color: "text-emerald-500", bg: "bg-emerald-500/20" },
  pending: { icon: "○", color: "text-slate-500", bg: "bg-slate-700" },
  rfi: { icon: "?", color: "text-amber-500", bg: "bg-amber-500/20" },
  warning: { icon: "⚠", color: "text-red-500", bg: "bg-red-500/20" },
  na: { icon: "—", color: "text-slate-400", bg: "bg-slate-700" },
};

// Generate demo checklist items with some pre-filled
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

  // Convex queries
  const checklistItems = useQuery(
    api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const overallProgress = useQuery(
    api.bidshield.getChecklistProgress,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // Convex mutation
  const updateChecklistItemMut = useMutation(api.bidshield.updateChecklistItem);

  // Demo state
  const [demoChecklistState, setDemoChecklistState] = useState(demoItems);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ phase1: true });

  // Build trade-aware checklist template
  const trade = project?.trade || "roofing";
  const systemType = project?.systemType || undefined;
  const deckType = project?.deckType || undefined;
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, systemType, deckType);

  const resolvedItems = isDemo ? demoChecklistState : (checklistItems ?? []);
  const overall = isDemo
    ? (() => {
        const done = demoChecklistState.filter(i => i.status === "done" || i.status === "na").length;
        return demoChecklistState.length > 0 ? Math.round((done / demoChecklistState.length) * 100) : 0;
      })()
    : (overallProgress ?? 0);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleStatus = async (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];

    if (isDemo) {
      setDemoChecklistState((prev) => {
        const current = prev.find(i => i.phaseKey === phaseKey && i.itemId === itemId);
        if (!current) return prev;
        const idx = order.indexOf(current.status);
        const nextStatus = order[(idx + 1) % order.length];
        return prev.map(i =>
          i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: nextStatus } : i
        );
      });
      return;
    }

    const currentItem = resolvedItems.find(
      (i: any) => i.phaseKey === phaseKey && i.itemId === itemId
    );
    if (!currentItem) return;
    const idx = order.indexOf(currentItem.status);
    const nextStatus = order[(idx + 1) % order.length];

    await updateChecklistItemMut({
      projectId: projectId as Id<"bidshield_projects">,
      phaseKey,
      itemId,
      status: nextStatus,
    });
  };

  const getItemStatus = (phaseKey: string, itemId: string): ChecklistStatus => {
    const item = resolvedItems.find(
      (i: any) => i.phaseKey === phaseKey && i.itemId === itemId
    );
    return (item?.status as ChecklistStatus) || "pending";
  };

  const getPhaseProgress = (phaseKey: string): number => {
    const phaseItems = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    if (phaseItems.length === 0) return 0;
    const doneCount = phaseItems.filter((i: any) => i.status === "done" || i.status === "na").length;
    return Math.round((doneCount / phaseItems.length) * 100);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-white">
            📋 {project?.name || "Project"} Checklist
          </h2>
          {(systemType || deckType) && (
            <div className="flex gap-2 mt-1">
              {systemType && (
                <span className="text-[10px] font-medium bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase">{systemType}</span>
              )}
              {deckType && (
                <span className="text-[10px] font-medium bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded capitalize">{deckType} deck</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Overall: {overall}%</span>
          <div className="w-32 sm:w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
          const progress = getPhaseProgress(phaseKey);
          const isOpen = expanded[phaseKey];

          return (
            <div
              key={phaseKey}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(phaseKey)}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3 text-[15px] font-medium">
                  <span className="text-xl">{phase.icon}</span>
                  <span className="text-left">{phase.title}</span>
                  {phase.critical && (
                    <span className="text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded">
                      CRITICAL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-emerald-500 min-w-[40px] text-right">
                    {progress}%
                  </span>
                  <span className="text-xs text-slate-500">{isOpen ? "▼" : "▶"}</span>
                </div>
              </button>

              {phase.criticalRule && isOpen && (
                <div className="px-4 py-3 bg-amber-950/50 border-t border-amber-900 text-[13px] text-amber-400 font-medium">
                  {phase.criticalRule}
                </div>
              )}

              {isOpen && (
                <div className="border-t border-slate-700">
                  {phase.items.map((item) => {
                    const status = getItemStatus(phaseKey, item.id);
                    const config = statusConfig[status];

                    return (
                      <div
                        key={item.id}
                        onClick={() => cycleStatus(phaseKey, item.id)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-750 cursor-pointer border-b border-slate-700/50 last:border-0 transition-colors"
                      >
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${config.color} ${config.bg}`}
                        >
                          {config.icon}
                        </span>
                        <span
                          className={`text-sm flex-1 ${
                            status === "done" || status === "na"
                              ? "text-slate-500 line-through"
                              : "text-slate-200"
                          }`}
                        >
                          {item.text}
                        </span>
                        {status === "rfi" && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                            RFI
                          </span>
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
      <div className="flex flex-wrap gap-4 mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <span className="text-xs text-slate-400">Click items to cycle status:</span>
        <div className="flex flex-wrap gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`text-sm ${config.color}`}>{config.icon}</span>
              <span className="text-xs text-slate-400 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
