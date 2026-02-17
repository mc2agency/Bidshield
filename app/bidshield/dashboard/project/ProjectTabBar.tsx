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
    <div className="sticky top-[57px] z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex overflow-x-auto gap-0 max-w-[1400px] mx-auto px-2 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "text-emerald-700 border-emerald-500 font-semibold bg-emerald-50/50"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                    tab.badge.color === "green" ? "bg-emerald-100 text-emerald-700" :
                    tab.badge.color === "amber" ? "bg-amber-100 text-amber-700" :
                    tab.badge.color === "red" ? "bg-red-100 text-red-700" :
                    tab.badge.color === "blue" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
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
