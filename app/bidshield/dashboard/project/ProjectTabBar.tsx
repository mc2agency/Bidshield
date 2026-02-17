"use client";

import { PHASES, getPhaseIndex } from "./tab-types";
import type { TabConfig, TabId, Phase, PhaseId } from "./tab-types";

// Phase completion data passed from parent
export interface PhaseStatus {
  id: PhaseId;
  pct: number;         // 0-100
  blockers: number;    // red items needing attention
  warnings: number;    // amber items
}

const phaseIcons: Record<PhaseId, string> = {
  setup: "📋",
  takeoff: "📐",
  price: "💲",
  qa: "🔍",
  submit: "🛡️",
};

function getPhaseColor(pct: number, blockers: number): string {
  if (blockers > 0) return "red";
  if (pct >= 90) return "green";
  if (pct > 0) return "amber";
  return "slate";
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
    <div className="sticky top-[57px] z-40">
      {/* ── Phase Pipeline ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center">
            {PHASES.map((phase, idx) => {
              const isActive = idx === activePhaseIdx;
              const isCompleted = phaseStatuses
                ? (phaseStatuses.find(s => s.id === phase.id)?.pct ?? 0) >= 90
                : idx < activePhaseIdx;
              const status = phaseStatuses?.find(s => s.id === phase.id);
              const pct = status?.pct ?? 0;
              const blockers = status?.blockers ?? 0;
              const color = getPhaseColor(pct, blockers);

              return (
                <div key={phase.id} className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => onTabChange(phase.defaultTab)}
                    className={`flex items-center gap-1.5 sm:gap-2.5 py-2.5 px-1.5 sm:px-3 rounded-lg transition-all w-full ${
                      isActive
                        ? "bg-emerald-50 ring-1 ring-emerald-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Phase circle */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm"
                          : isCompleted
                          ? "bg-emerald-100 text-emerald-600"
                          : blockers > 0
                          ? "bg-red-100 text-red-600"
                          : pct > 0
                          ? "bg-amber-100 text-amber-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="text-sm">{phaseIcons[phase.id]}</span>
                      )}
                    </div>

                    {/* Label + status */}
                    <div className="min-w-0 text-left hidden sm:block">
                      <div className={`text-xs font-semibold truncate ${
                        isActive ? "text-emerald-800" : "text-slate-700"
                      }`}>
                        {phase.shortLabel}
                      </div>
                      {status && (
                        <div className={`text-[10px] font-medium ${
                          color === "green" ? "text-emerald-500" :
                          color === "red" ? "text-red-500" :
                          color === "amber" ? "text-amber-500" :
                          "text-slate-400"
                        }`}>
                          {blockers > 0
                            ? `${blockers} blocker${blockers > 1 ? "s" : ""}`
                            : pct >= 90
                            ? "Complete"
                            : pct > 0
                            ? `${pct}%`
                            : "Not started"}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Connector */}
                  {idx < PHASES.length - 1 && (
                    <div className="flex-shrink-0 mx-0.5 sm:mx-1">
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="flex-shrink-0">
                        <path d="M1 6H14M14 6L9 1M14 6L9 11" 
                          stroke={isCompleted ? "#059669" : "#e2e8f0"} 
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sub-tabs (only when phase has multiple tabs) ── */}
      {stageSubTabs.length > 1 && (
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1400px] mx-auto px-4 flex gap-0">
            {stageSubTabs.map((tab) => {
              if (!tab) return null;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                    isTabActive
                      ? "text-emerald-700 border-emerald-500 bg-white"
                      : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
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
        </div>
      )}
    </div>
  );
}
