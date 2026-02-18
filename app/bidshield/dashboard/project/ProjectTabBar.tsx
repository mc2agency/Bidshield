"use client";

import { PHASES, getPhaseIndex } from "./tab-types";
import type { TabConfig, TabId, PhaseId } from "./tab-types";

export interface PhaseStatus {
  id: PhaseId;
  pct: number;
  blockers: number;
  warnings: number;
}

export default function ProjectTabBar({
  tabs,
  activeTab,
  onTabChange,
  phaseStatuses,
}: {
  tabs: TabConfig[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  phaseStatuses?: PhaseStatus[];
}) {
  const activePhaseIdx = getPhaseIndex(activeTab);
  const activePhase = PHASES[activePhaseIdx];
  const stageSubTabs = activePhase?.tabs
    .map((id) => tabs.find((t) => t.id === id))
    .filter(Boolean) ?? [];

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-lg mx-auto">
        {/* Single row: phase tabs */}
        <div className="flex overflow-x-auto scrollbar-none">
          {PHASES.map((phase, idx) => {
            const isActive = idx === activePhaseIdx;
            const status = phaseStatuses?.find(s => s.id === phase.id);
            const pct = status?.pct ?? 0;
            const blockers = status?.blockers ?? 0;

            return (
              <button
                key={phase.id}
                onClick={() => onTabChange(phase.defaultTab)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                  isActive
                    ? "text-emerald-700 border-emerald-500"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
              >
                <span>{phase.shortLabel}</span>
                {/* Status indicator */}
                {status && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    blockers > 0
                      ? "bg-red-100 text-red-600"
                      : pct >= 90
                      ? "bg-emerald-100 text-emerald-600"
                      : pct > 0
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {blockers > 0 ? `${blockers}!` : pct >= 90 ? "✓" : pct > 0 ? `${pct}%` : "—"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-tabs: inline below phases, only when phase has multiple tabs */}
        {stageSubTabs.length > 1 && (
          <div className="flex border-t border-slate-100 bg-slate-50/50">
            {stageSubTabs.map((tab) => {
              if (!tab) return null;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                    isTabActive
                      ? "text-emerald-700 bg-white border-b border-emerald-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full leading-none ${
                      tab.badge.color === "green" ? "bg-emerald-100 text-emerald-700" :
                      tab.badge.color === "amber" ? "bg-amber-100 text-amber-700" :
                      tab.badge.color === "red" ? "bg-red-100 text-red-700" :
                      tab.badge.color === "blue" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.badge.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
