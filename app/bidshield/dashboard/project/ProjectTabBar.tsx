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
    <div className="sticky top-16 z-40 bg-white" style={{ borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Phase tabs row */}
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
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 cursor-pointer ${
                  isActive
                    ? "text-emerald-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                style={{ borderBottom: isActive ? "2px solid #059669" : "2px solid transparent" }}
              >
                <span>{phase.shortLabel}</span>
                {status && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 9999,
                    background: blockers > 0 ? "#fee2e2" : pct >= 90 ? "#d1fae5" : pct > 0 ? "#fef3c7" : "#f1f5f9",
                    color: blockers > 0 ? "#dc2626" : pct >= 90 ? "#059669" : pct > 0 ? "#d97706" : "#94a3b8",
                  }}>
                    {blockers > 0 ? `${blockers}!` : pct >= 90 ? "✓" : pct > 0 ? `${pct}%` : "—"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-tabs row */}
        {stageSubTabs.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none" style={{ borderTop: "1px solid #f1f5f9", background: "#fafafa" }}>
            {stageSubTabs.map((tab) => {
              if (!tab) return null;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                    isTabActive ? "text-emerald-700 bg-white" : "text-slate-400 hover:text-slate-700"
                  }`}
                  style={{ borderBottom: isTabActive ? "2px solid #10b981" : "2px solid transparent" }}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 9999, lineHeight: 1.6,
                      background: tab.badge.color === "green" ? "#d1fae5" : tab.badge.color === "amber" ? "#fef3c7" : tab.badge.color === "red" ? "#fee2e2" : tab.badge.color === "blue" ? "#dbeafe" : "#f1f5f9",
                      color: tab.badge.color === "green" ? "#065f46" : tab.badge.color === "amber" ? "#92400e" : tab.badge.color === "red" ? "#991b1b" : tab.badge.color === "blue" ? "#1e40af" : "#64748b",
                    }}>
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
