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
  type Project,
} from "@/lib/bidshield/storage";
import { masterChecklist } from "@/lib/bidshield/checklist-data";

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string }> = {
  done: { icon: "✓", color: "text-emerald-500", bg: "bg-emerald-500/20" },
  pending: { icon: "○", color: "text-slate-500", bg: "bg-slate-700" },
  rfi: { icon: "?", color: "text-amber-500", bg: "bg-amber-500/20" },
  warning: { icon: "⚠", color: "text-red-500", bg: "bg-red-500/20" },
  na: { icon: "—", color: "text-slate-400", bg: "bg-slate-700" },
};

// Generate demo checklist items with some pre-filled
function generateDemoChecklist(): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const doneItems = ["p1-1", "p1-2", "p1-3", "p2-1", "p2-2", "p2-3", "p3-1", "p3-2"];
  const rfiItems = ["p3-4", "p5-1"];
  
  for (const [phaseKey, phase] of Object.entries(masterChecklist)) {
    for (const item of phase.items) {
      let status: ChecklistStatus = "pending";
      if (doneItems.includes(item.id)) status = "done";
      if (rfiItems.includes(item.id)) status = "rfi";
      
      items.push({
        phaseKey,
        itemId: item.id,
        status,
      });
    }
  }
  return items;
}

function ChecklistContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [overall, setOverall] = useState(0);

  // Demo project data
  const demoProjects: Record<string, Project> = {
    demo_1: {
      id: "demo_1",
      name: "Harbor Point Tower",
      location: "Jersey City, NJ",
      bidDate: "2026-02-15",
      status: "in_progress",
      gc: "Turner Construction",
      sqft: 45000,
      estimatedValue: 850000,
      assemblies: ["TPO 60mil", "Tapered ISO"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    demo_2: {
      id: "demo_2",
      name: "Riverside Medical Center",
      location: "Newark, NJ",
      bidDate: "2026-02-20",
      status: "setup",
      gc: "Skanska",
      sqft: 28000,
      estimatedValue: 420000,
      assemblies: ["EPDM", "Green Roof"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };

  // Load data
  useEffect(() => {
    if (!projectId) return;

    if (isDemo) {
      // Demo mode - use fake data
      const demoProject = demoProjects[projectId] || {
        id: projectId,
        name: "Demo Project",
        location: "Demo Location",
        bidDate: "2026-02-15",
        status: "setup" as const,
        assemblies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setProject(demoProject);
      setChecklistItems(generateDemoChecklist());
      setOverall(12); // ~12% done in demo
      setExpanded({ phase1: true });
    } else {
      setProject(getProject(projectId));
      setChecklistItems(getChecklist(projectId));
      setOverall(getChecklistProgress(projectId));
      setExpanded({ phase1: true });
    }
  }, [projectId, isDemo]);

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

    if (isDemo) {
      // In demo mode, just update local state
      setChecklistItems((prev) =>
        prev.map((item) =>
          item.phaseKey === phaseKey && item.itemId === itemId
            ? { ...item, status: nextStatus }
            : item
        )
      );
      // Recalculate progress
      const updated = checklistItems.map((item) =>
        item.phaseKey === phaseKey && item.itemId === itemId
          ? { ...item, status: nextStatus }
          : item
      );
      const doneCount = updated.filter((i) => i.status === "done" || i.status === "na").length;
      setOverall(Math.round((doneCount / updated.length) * 100));
    } else {
      updateChecklistItem(projectId, phaseKey, itemId, nextStatus);
      setChecklistItems(getChecklist(projectId));
      setOverall(getChecklistProgress(projectId));
    }
  };

  const getItemStatus = (phaseKey: string, itemId: string): ChecklistStatus => {
    const item = checklistItems.find(
      (i) => i.phaseKey === phaseKey && i.itemId === itemId
    );
    return item?.status || "pending";
  };

  const getPhaseProgressCalc = (phaseKey: string): number => {
    if (isDemo) {
      const phaseItems = checklistItems.filter((i) => i.phaseKey === phaseKey);
      if (phaseItems.length === 0) return 0;
      const doneCount = phaseItems.filter((i) => i.status === "done" || i.status === "na").length;
      return Math.round((doneCount / phaseItems.length) * 100);
    }
    return projectId ? getPhaseProgress(projectId, phaseKey) : 0;
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
          const progress = getPhaseProgressCalc(phaseKey);
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

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading checklist...</div>}>
      <ChecklistContent />
    </Suspense>
  );
}
