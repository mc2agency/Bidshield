"use client";

import React, { useState } from "react";
import { TabProps } from "../tab-types";
import ScopeTab from "./ScopeTab";
import QuotesTab from "./QuotesTab";
import AddendaTab from "./AddendaTab";
import RFIsTab from "./RFIsTab";
import BidQualsTab from "./BidQualsTab";

interface DocumentsTabProps extends TabProps {
  initialSubTab?: "scope" | "quotes" | "addenda" | "rfis" | "bid-quals";
}

type SubTabKey = "scope" | "quotes" | "addenda" | "rfis" | "bid-quals";

const SubTabConfig: Record<SubTabKey, { label: string; component: React.ComponentType<TabProps> }> = {
  scope: { label: "Scope", component: ScopeTab },
  quotes: { label: "Quotes", component: QuotesTab },
  addenda: { label: "Addenda", component: AddendaTab },
  rfis: { label: "RFIs", component: RFIsTab },
  "bid-quals": { label: "Bid Quals", component: BidQualsTab },
};

export default function DocumentsTab({ initialSubTab = "scope", ...tabProps }: DocumentsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>(initialSubTab);

  const ActiveComponent = SubTabConfig[activeSubTab].component;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Sub-tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid var(--bs-border)`,
          backgroundColor: `var(--bs-bg-card)`,
          paddingBottom: 0,
        }}
      >
        {(Object.keys(SubTabConfig) as SubTabKey[]).map((key) => {
          const config = SubTabConfig[key];
          const isActive = activeSubTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveSubTab(key)}
              style={{
                padding: "12px 16px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? `2px solid var(--bs-teal)` : "none",
                color: isActive ? `var(--bs-text-primary)` : `var(--bs-text-muted)`,
                fontSize: "14px",
                fontWeight: isActive ? 500 : 400,
                cursor: "pointer",
                transition: "color 0.2s ease, border-color 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = `var(--bs-text-primary)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = `var(--bs-text-muted)`;
                }
              }}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Active Sub-tab Component */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: `var(--bs-bg-elevated)`,
        }}
      >
        <ActiveComponent {...tabProps} />
      </div>
    </div>
  );
}
