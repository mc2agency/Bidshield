"use client";

import type { TabConfig, TabId } from "./tab-types";

export default function ProjectTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: TabConfig[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div className="sticky top-[57px] z-40 bg-slate-900 border-b border-slate-700">
      <div className="flex overflow-x-auto gap-0 max-w-[1400px] mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "bg-slate-800 text-white border-emerald-500"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                    tab.badge.color === "green" ? "bg-emerald-500/20 text-emerald-400" :
                    tab.badge.color === "amber" ? "bg-amber-500/20 text-amber-400" :
                    tab.badge.color === "red" ? "bg-red-500/20 text-red-400" :
                    tab.badge.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                    "bg-slate-700 text-slate-400"
                  }`}
                >
                  {tab.badge.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
