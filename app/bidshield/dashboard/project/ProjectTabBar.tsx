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
    <div className="sticky top-16 z-40" style={{ background: "var(--bs-bg-secondary)", borderBottom: "1px solid var(--bs-border)" }}>
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
                className="relative flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 focus-visible:outline-none cursor-pointer"
                style={{
                  color: isActive ? "var(--bs-teal)" : "var(--bs-text-muted)",
                  borderBottom: isActive ? "2px solid var(--bs-teal)" : "2px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--bs-text-secondary)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--bs-text-muted)"; }}
              >
                <span>{phase.shortLabel}</span>
                {status && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 9999,
                    background: blockers > 0 ? "var(--bs-red-dim)" : pct >= 90 ? "var(--bs-teal-dim)" : pct > 0 ? "var(--bs-amber-dim)" : "rgba(255,255,255,0.06)",
                    color: blockers > 0 ? "var(--bs-red)" : pct >= 90 ? "var(--bs-teal)" : pct > 0 ? "var(--bs-amber)" : "var(--bs-text-dim)",
                  }}>
                    {blockers > 0 ? `${blockers}!` : pct >= 90 ? "●" : pct > 0 ? `${pct}%` : "—"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-tabs row */}
        {stageSubTabs.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-bg-primary)" }}>
            {stageSubTabs.map((tab) => {
              if (!tab) return null;
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none"
                  style={{
                    color: isTabActive ? "var(--bs-teal)" : "var(--bs-text-dim)",
                    borderBottom: isTabActive ? "2px solid var(--bs-teal)" : "2px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isTabActive) e.currentTarget.style.color = "var(--bs-text-secondary)"; }}
                  onMouseLeave={e => { if (!isTabActive) e.currentTarget.style.color = "var(--bs-text-dim)"; }}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 9999, lineHeight: 1.6,
                      background: tab.badge.color === "green" ? "var(--bs-teal-dim)" : tab.badge.color === "amber" ? "var(--bs-amber-dim)" : tab.badge.color === "red" ? "var(--bs-red-dim)" : tab.badge.color === "blue" ? "var(--bs-blue-dim)" : "rgba(255,255,255,0.06)",
                      color: tab.badge.color === "green" ? "var(--bs-teal)" : tab.badge.color === "amber" ? "var(--bs-amber)" : tab.badge.color === "red" ? "var(--bs-red)" : tab.badge.color === "blue" ? "var(--bs-blue)" : "var(--bs-text-dim)",
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
