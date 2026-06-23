import { cn } from "@/lib/bidshield/utils";
import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Optional trailing badge (e.g. progress %, blocker count). */
  badge?: ReactNode;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * TabBar — the phase/sub-tab navigation row. Active tab uses the token-driven
 * `.bs-nav-item-active` treatment; consumers own the surrounding layout.
 */
export function TabBar({ tabs, activeId, onSelect, className }: TabBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)} role="tablist">
      {tabs.map((t) => {
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(t.id)}
            className={cn("bs-nav-item focus-ring", active && "bs-nav-item-active")}
          >
            <span>{t.label}</span>
            {t.badge != null && <span className="ml-1.5">{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
