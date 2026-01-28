"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getProject,
  getChecklist,
  updateChecklistItem,
  getChecklistProgress,
  getPhaseProgress,
  type ChecklistItem,
} from "@/lib/bidshield/storage";
import { masterChecklist } from "@/lib/bidshield/checklist-data";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string }> = {
  done: { icon: "✓", color: "text-emerald-500", bg: "bg-emerald-100" },
  pending: { icon: "○", color: "text-slate-500", bg: "" },
  rfi: { icon: "?", color: "text-amber-500", bg: "bg-amber-100" },
  warning: { icon: "⚠", color: "text-red-500", bg: "" },
  na: { icon: "—", color: "text-slate-400", bg: "" },
};

function ChecklistContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [project, setProject] = useState<ReturnType<typeof getProject>>(undefined);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overall, setOverall] = useState(0);

  // Load data
  useEffect(() => {
    if (!projectId) return;
    setProject(getProject(projectId));
    setChecklistItems(getChecklist(projectId));
    setOverall(getChecklistProgress(projectId));
    // Expand first phase by default
    setExpanded({ phase1: true });
  }, [projectId]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleStatus = (phaseKey: string, itemId: string) => {
    if (!projectId) return;
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];
    const currentItem = checklistItems.find(
      (i) => i.phaseKey === phaseKey && i.itemId === itemId
    );
    if (!currentItem) return;

    const idx = order.indexOf(currentItem.status);
    const nextStatus = order[(idx + 1) % order.length];

    updateChecklistItem(projectId, phaseKey, itemId, nextStatus);
    setChecklistItems(getChecklist(projectId));
    setOverall(getChecklistProgress(projectId));
  };

  const getItemStatus = (phaseKey: string, itemId: string): ChecklistStatus => {
    const item = checklistItems.find(
      (i) => i.phaseKey === phaseKey && i.itemId === itemId
    );
    return item?.status || "pending";
  };

  if (!projectId) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No project selected. Go back to the dashboard to select a project.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-white">
            📋 {project.name}
          </h2>
          <p className="text-sm text-slate-400">{project.location} • Bid: {project.bidDate}</p>
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
        {Object.entries(masterChecklist).map(([phaseKey, phase]) => {
          const progress = projectId ? getPhaseProgress(projectId, phaseKey) : 0;
          const isOpen = expanded[phaseKey];

          return (
            <div
              key={phaseKey}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              {/* Phase header */}
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

              {/* Critical rule */}
              {phase.criticalRule && isOpen && (
                <div className="px-4 py-3 bg-amber-950/50 border-t border-amber-900 text-[13px] text-amber-400 font-medium">
                  {phase.criticalRule}
                </div>
              )}

              {/* Items */}
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
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${config.color} ${
                            config.bg || "bg-slate-700"
                          }`}
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

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading checklist...</div>}>
      <ChecklistContent />
    </Suspense>
  );
}
