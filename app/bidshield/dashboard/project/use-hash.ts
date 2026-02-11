"use client";

import { useState, useEffect, useCallback } from "react";
import type { TabId } from "./tab-types";

const VALID_TABS: TabId[] = [
  "overview", "checklist", "takeoff", "pricing", "materials",
  "scope", "quotes", "rfis", "addenda", "labor", "validator",
];

function parseHash(): TabId | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.includes(hash as TabId) ? (hash as TabId) : null;
}

export function useHashTab(defaultTab: TabId = "overview"): [TabId, (tab: TabId) => void] {
  const [activeTab, setActiveTabState] = useState<TabId>(defaultTab);

  useEffect(() => {
    const parsed = parseHash();
    if (parsed) setActiveTabState(parsed);

    const onHashChange = () => {
      const t = parseHash();
      if (t) setActiveTabState(t);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${tab}`);
  }, []);

  return [activeTab, setActiveTab];
}
