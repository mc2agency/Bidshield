"use client";

import { useState } from "react";
import { masterChecklist, getPhaseProgress, getOverallProgress } from "@/lib/bidshield/demo-data";
import type { ChecklistStatus } from "@/lib/bidshield/types";

const statusConfig: Record<ChecklistStatus, { icon: string; color: string; bg: string }> = {
  done: { icon: "✓", color: "text-emerald-500", bg: "bg-emerald-100" },
  pending: { icon: "○", color: "text-slate-500", bg: "" },
  rfi: { icon: "?", color: "text-amber-500", bg: "bg-amber-100" },
  warning: { icon: "⚠", color: "text-red-500", bg: "" },
  na: { icon: "—", color: "text-slate-400", bg: "" },
};

export default function ChecklistPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checklist, setChecklist] = useState(masterChecklist);
  const overall = getOverallProgress();

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleStatus = (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "rfi", "na"];
    setChecklist((prev) => {
      const updated = { ...prev };
      const phase = { ...updated[phaseKey] };
      phase.items = phase.items.map((item) => {
        if (item.id === itemId) {
          const idx = order.indexOf(item.status);
          const next = order[(idx + 1) % order.length];
          return { ...item, status: next };
        }
        return item;
      });
      updated[phaseKey] = phase;
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-white">
          📋 550 Harbor Point Tower - Bid Checklist
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Overall: {overall}%</span>
          <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(checklist).map(([phaseKey, phase]) => {
          const progress = getPhaseProgress(phase);
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
                  <span>{phase.title}</span>
                  {phase.critical && (
                    <span className="text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded">
                      CRITICAL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {phase.items.map((item) => {
                    const config = statusConfig[item.status];
                    return (
                      <div
                        key={item.id}
                        onClick={() => cycleStatus(phaseKey, item.id)}
                        className="flex items-center gap-3 p-3 bg-slate-900 rounded-md cursor-pointer hover:bg-slate-850 transition-colors"
                      >
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${config.color} ${config.bg}`}
                        >
                          {config.icon}
                        </span>
                        <span
                          className={`flex-1 text-sm ${
                            item.status === "done"
                              ? "line-through text-slate-500"
                              : "text-slate-200"
                          }`}
                        >
                          {item.text}
                        </span>
                        {item.status === "rfi" && (
                          <span className="text-[10px] font-semibold bg-amber-500 text-amber-900 px-2 py-0.5 rounded">
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
    </div>
  );
}
