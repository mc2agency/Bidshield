"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Doc } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

// Silent error boundary — renders nothing if the child throws.
// Used for the templates panel so a missing Convex deployment doesn't crash the whole tab.
class SilentBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

type ChecklistStatus = "pending" | "done" | "rfi" | "na" | "warning";
type FilterMode = "all" | "incomplete" | "flagged" | "rfi" | "done";

function matchesFilter(status: ChecklistStatus, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "incomplete") return status === "pending" || status === "rfi" || status === "warning";
  if (filter === "flagged") return status === "warning";
  if (filter === "rfi") return status === "rfi";
  if (filter === "done") return status === "done" || status === "na";
  return true;
}

function formatNoteDate(ts: number | null): string | null {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Checklist Templates sub-component ────────────────────────────────────────
// Isolated so that if the Convex function isn't deployed yet the query error
// is caught by the wrapping TabErrorBoundary rather than crashing the whole tab.
function ChecklistTemplatesPanel({
  userId,
  projectId,
  isDemo,
  systemType,
  isValidConvexId,
}: {
  userId: string;
  projectId: string | null;
  isDemo: boolean;
  systemType: string | undefined;
  isValidConvexId: boolean;
}) {
  const templates     = useQuery(api.checklistTemplates.getChecklistTemplates, !isDemo && userId ? { userId } : "skip");
  const saveTemplate  = useMutation(api.checklistTemplates.saveChecklistTemplate);
  const applyTemplate = useMutation(api.checklistTemplates.applyChecklistTemplate);
  const deleteTemplate = useMutation(api.checklistTemplates.deleteChecklistTemplate);

  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName]         = useState("");
  const [templateSaving, setTemplateSaving]     = useState(false);
  const [templateFlash, setTemplateFlash]       = useState<string | null>(null);
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);

  async function handleSaveTemplate() {
    if (!templateName.trim() || !isValidConvexId || !userId) return;
    setTemplateSaving(true);
    try {
      await saveTemplate({
        userId,
        projectId: projectId as Id<"bidshield_projects">,
        name: templateName.trim(),
        systemType: systemType ?? undefined,
      });
      setTemplateName("");
      setShowSaveTemplate(false);
      setTemplateFlash("Template saved!");
      setTimeout(() => setTemplateFlash(null), 2500);
    } finally {
      setTemplateSaving(false);
    }
  }

  async function handleApplyTemplate(templateId: Id<"bidshield_checklist_templates">) {
    if (!isValidConvexId || !userId) return;
    setApplyingTemplateId(templateId);
    try {
      await applyTemplate({
        userId,
        projectId: projectId as Id<"bidshield_projects">,
        templateId,
      });
      setTemplateFlash("Template applied!");
      setTimeout(() => setTemplateFlash(null), 2500);
    } finally {
      setApplyingTemplateId(null);
    }
  }

  async function handleDeleteTemplate(templateId: Id<"bidshield_checklist_templates">) {
    if (!userId) return;
    await deleteTemplate({ userId, templateId });
  }

  return (
    <div style={{ background: "var(--bs-bg-card)", borderRadius: 10, border: "1px solid var(--bs-border)", padding: 16 }}>
      <div style={{ fontSize: 11, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
        Checklist Templates
      </div>

      {templateFlash && (
        <div style={{ fontSize: 12, color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
          {templateFlash}
        </div>
      )}

      {!showSaveTemplate ? (
        <button
          onClick={() => {
            setTemplateName(systemType ? `${systemType.toUpperCase()} Template` : "My Template");
            setShowSaveTemplate(true);
          }}
          style={{ fontSize: 12, fontWeight: 500, color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", width: "100%", textAlign: "left" }}
        >
          + Save current checklist as template
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            autoFocus
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSaveTemplate(); if (e.key === "Escape") setShowSaveTemplate(false); }}
            placeholder="Template name..."
            style={{ fontSize: 12, border: "1px solid var(--bs-border)", background: "var(--bs-bg-input)", color: "var(--bs-text-secondary)", borderRadius: 6, padding: "6px 8px", outline: "none", width: "100%" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleSaveTemplate}
              disabled={templateSaving || !templateName.trim()}
              style={{ flex: 1, fontSize: 12, fontWeight: 500, background: "var(--bs-teal)", color: "#13151a", border: "none", borderRadius: 6, padding: "6px 0", cursor: templateSaving || !templateName.trim() ? "not-allowed" : "pointer", opacity: templateSaving || !templateName.trim() ? 0.5 : 1 }}
            >
              {templateSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowSaveTemplate(false)}
              style={{ fontSize: 12, color: "var(--bs-text-muted)", background: "none", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {templates && templates.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {templates.map((tpl: Doc<"bidshield_checklist_templates">) => (
            <div
              key={tpl._id}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", borderRadius: 7 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--bs-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tpl.name}
                </div>
                {tpl.systemType && (
                  <div style={{ fontSize: 10, color: "var(--bs-text-dim)", marginTop: 1 }}>{tpl.systemType.toUpperCase()}</div>
                )}
              </div>
              <button
                onClick={() => handleApplyTemplate(tpl._id as Id<"bidshield_checklist_templates">)}
                disabled={applyingTemplateId === tpl._id}
                title="Apply this template to the current project"
                style={{ fontSize: 11, fontWeight: 500, color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", borderRadius: 5, padding: "3px 8px", cursor: applyingTemplateId === tpl._id ? "wait" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                {applyingTemplateId === tpl._id ? "..." : "Apply"}
              </button>
              <button
                onClick={() => handleDeleteTemplate(tpl._id as Id<"bidshield_checklist_templates">)}
                title="Delete this template"
                style={{ fontSize: 11, color: "var(--bs-red)", background: "none", border: "none", cursor: "pointer", padding: "3px 4px", flexShrink: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {templates && templates.length === 0 && !showSaveTemplate && (
        <p style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 8 }}>
          No templates yet. Save your current checklist to reuse it on future bids.
        </p>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const demoChecklist = getChecklistForTrade("roofing", "tpo", "steel");
const demoItems = (() => {
  const items: { phaseKey: string; itemId: string; status: ChecklistStatus; notes: string; updatedAt: number }[] = [];
  const doneIds = ["p1-1", "p1-2", "p1-3", "p2-1", "p2-2", "p2-3", "p3-1", "p3-2"];
  const rfiIds  = ["p3-4", "p5-1"];
  for (const [phaseKey, phase] of Object.entries(demoChecklist)) {
    for (const item of (phase as any).items) {
      let status: ChecklistStatus = "pending";
      if (doneIds.includes(item.id)) status = "done";
      if (rfiIds.includes(item.id))  status = "rfi";
      items.push({ phaseKey, itemId: item.id, status, notes: item.id === "p3-1" ? "Confirmed — drawings received 3/10" : "", updatedAt: Date.now() - 86400000 });
    }
  }
  return items;
})();

export default function ChecklistTab({ projectId, isDemo, project, onNavigateTab, cachedData }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const checklistItems   = useQuery(api.bidshield.getChecklist,         !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const overallProgress  = useQuery(api.bidshield.getChecklistProgress, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const updateChecklist  = useMutation(api.bidshield.updateChecklistItem);
  const createRFIMut     = useMutation(api.bidshield.createRFI);

  // Queries for auto-complete detection
  const meetings   = useQuery(api.bidshield.getPreBidMeetings, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const gcItems    = useQuery(api.bidshield.getGCItems,        !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const laborTasks = useQuery(api.bidshield.getLaborTasks,     !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

  // Use cachedData where available, fallback to direct queries
  const quotes     = cachedData?.quotes;
  const rfis       = cachedData?.rfis;
  const addenda    = cachedData?.addenda;
  const materials  = cachedData?.projectMaterials;
  const scopeItems = cachedData?.scopeItems;
  const takeoffSections = cachedData?.takeoffSections;

  // Template functionality is in ChecklistTemplatesPanel (wrapped in SilentBoundary)
  const userId = project?.userId ?? "";

  const [demoState, setDemoState]     = useState(demoItems);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({});
  const [filter, setFilter]           = useState<FilterMode>("incomplete");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText]       = useState("");
  const [savedNoteFlash, setSavedNoteFlash] = useState<string | null>(null);
  const [rfiDrawerKey, setRfiDrawerKey] = useState<string | null>(null);
  const [rfiQuestion, setRfiQuestion]   = useState("");
  const [flashedItem, setFlashedItem]   = useState<string | null>(null);
  const prevPhasePcts = useRef<Record<string, number>>({});
  const touchStartX = useRef<number>(0);
  const [swipeActive, setSwipeActive] = useState<string | null>(null);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selKey = (pk: string, id: string) => `${pk}__${id}`;

  const toggleSelect = useCallback((key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const trade             = project?.trade || "roofing";
  const systemType        = project?.systemType;
  // Use all system types from roofAssemblies if available, fall back to single systemType
  const systemTypes       = (project as any)?.roofAssemblies?.map((a: any) => a.systemType) as string[] | undefined;
  const effectiveSystemType = systemTypes && systemTypes.length > 0 ? [...new Set(systemTypes)] : systemType;
  const deckType          = project?.deckType;
  const fmGlobal          = project?.fmGlobal ?? false;
  const pre1990           = project?.pre1990 ?? false;
  const energyCode        = project?.energyCode ?? false;
  const climateZone       = project?.climateZone ?? "";
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, effectiveSystemType, deckType, fmGlobal, pre1990, energyCode);
  const resolvedItems     = isDemo ? demoState : (checklistItems ?? []);

  const bulkSetStatus = useCallback(async (target: ChecklistStatus) => {
    const updates = [...selected].map(key => {
      const idx = key.indexOf("__");
      return { phaseKey: key.slice(0, idx), itemId: key.slice(idx + 2) };
    });
    if (isDemo) {
      setDemoState(prev => prev.map(i => {
        const hit = updates.find(u => u.phaseKey === i.phaseKey && u.itemId === i.itemId);
        return hit ? { ...i, status: target, updatedAt: Date.now() } : i;
      }));
    } else {
      await Promise.all(updates.map(({ phaseKey, itemId }) =>
        updateChecklist({
          projectId: projectId as Id<"bidshield_projects">,
          phaseKey,
          itemId,
          status: target,
          notes: (resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.notes || "",
        })
      ));
    }
    clearSelection();
  }, [selected, isDemo, updateChecklist, projectId, resolvedItems, clearSelection]);

  const overall = isDemo
    ? (() => { const d = demoState.filter(i => i.status === "done" || i.status === "na").length; return demoState.length > 0 ? Math.round((d / demoState.length) * 100) : 0; })()
    : (overallProgress ?? 0);

  const getItemStatus = useCallback((phaseKey: string, itemId: string): ChecklistStatus =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.status as ChecklistStatus) || "pending",
  [resolvedItems]);

  const getItemNote = useCallback((phaseKey: string, itemId: string): string =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.notes) || "",
  [resolvedItems]);

  const getItemUpdatedAt = useCallback((phaseKey: string, itemId: string): number | null =>
    ((resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId) as any)?.updatedAt) || null,
  [resolvedItems]);

  // ── Auto-satisfied detection ─────────────────────────────────────────────
  // Detects checklist items that are satisfied by data in other tabs.
  // Returns a Map of itemId → reason string for the auto-complete badge.
  const autoSatisfied = useMemo(() => {
    const map = new Map<string, string>();
    if (isDemo) return map;

    // Phase 1 — Project Setup
    if (project?.name && project?.location) map.set("p1-1", "Setup complete");
    if (project?.gc) map.set("p1-2", `GC: ${project.gc}`);
    if (project?.bidDate) map.set("p1-3", `Date: ${project.bidDate}`);
    if (project?.bidTime) map.set("p1-4", `Time: ${project.bidTime}`);
    if (project?.bidDate) {
      // p1-5 delivery method — check if submission tab has portal/recipient
    }
    if (meetings && meetings.length > 0) map.set("p1-6", `${meetings.length} meeting(s) logged`);
    if (meetings && meetings.some((m: any) => m.type === "site_visit" || (m.notes ?? "").toLowerCase().includes("site visit")))
      map.set("p1-7", "Site visit logged");

    // Phase 2 — Document Receipt & Addenda
    if ((addenda && addenda.length > 0) || project?.noAddendaAcknowledged)
      map.set("p2-1", addenda?.length ? `${addenda.length} addenda` : "No addenda confirmed");
    if (project?.specSummary) map.set("p2-3", "Spec uploaded");
    if (gcItems && gcItems.length > 0) map.set("p2-5", "Bid form items entered");
    if (project?.noAddendaAcknowledged || (addenda && addenda.length > 0))
      map.set("p2-6", project?.noAddendaAcknowledged ? "No addenda" : `${addenda?.length} addenda`);
    if (addenda && addenda.length > 0 && addenda.every((a: any) => a.reviewStatus === "reviewed"))
      map.set("p2-7", "All addenda reviewed");
    if (addenda && addenda.length > 0 && addenda.every((a: any) => a.repriced))
      map.set("p2-8", "All addenda repriced");

    // Phase 3 — Architectural Review
    if ((project as any)?.roofAssemblies?.length > 0) map.set("p3-2", "Assemblies defined in Setup");

    // Phase 4 — Structural Review
    if (project?.deckType) map.set("p4-1", `Deck: ${project.deckType}`);

    // Phase 9 — Specification Review
    if (project?.specSummary) map.set("p9-1", "Spec sections extracted");

    // Phase 10-12 — Takeoffs
    if (takeoffSections && takeoffSections.length > 0)
      map.set("p10-1", `${takeoffSections.length} section(s) measured`);

    // Phase 13 — Pricing Materials
    if (quotes && quotes.length > 0) map.set("p13-1", `${quotes.length} quote(s) on file`);
    if (materials && materials.length > 0) {
      const withWaste = materials.filter((m: any) => m.wasteFactor && m.wasteFactor > 0);
      if (withWaste.length > 0) map.set("p13-2", `${withWaste.length} items have waste factors`);
    }

    // Phase 14 — Pricing Labor
    if (laborTasks && laborTasks.length > 0) map.set("p14-1", `${laborTasks.length} labor task(s)`);

    // Phase 15 — Pre-Submission Review
    if (rfis && rfis.length > 0 && rfis.every((r: any) => r.answer))
      map.set("p15-1", "All RFIs answered");
    if (scopeItems && scopeItems.length > 0) {
      const excluded = scopeItems.filter((s: any) => s.status === "excluded");
      if (excluded.length > 0) map.set("p15-3", `${excluded.length} exclusion(s) defined`);
    }
    if (gcItems && gcItems.length > 0 && gcItems.every((g: any) => g.confirmed))
      map.set("p15-7", "All GC bid form items confirmed");

    // Phase 16 — Bid Submission
    if (project?.totalBidAmount) map.set("p16-1", `Bid: $${project.totalBidAmount.toLocaleString()}`);

    // Phase 17 — Scope Boundaries
    if (scopeItems && scopeItems.length > 0) {
      const excluded = scopeItems.filter((s: any) => s.status === "excluded");
      if (excluded.length > 0) map.set("p17-9", `${excluded.length} exclusion(s) listed`);
      const alternates = scopeItems.filter((s: any) => s.isAlternate);
      if (alternates.length > 0) map.set("p17-10", `${alternates.length} alternate(s) priced`);
    }

    // Phase 18 — General Conditions
    if (gcItems && gcItems.length > 0) map.set("p18-6", "GC bid forms reviewed");

    return map;
  }, [project, meetings, addenda, quotes, rfis, materials, scopeItems, takeoffSections, gcItems, laborTasks, isDemo]);

  // Count of auto-satisfied items that are still pending (could be auto-checked)
  const autoReadyCount = useMemo(() => {
    let count = 0;
    for (const [itemId] of autoSatisfied) {
      for (const [phaseKey, phase] of Object.entries(checklistTemplate)) {
        if ((phase as any).items.some((i: any) => i.id === itemId)) {
          const status = getItemStatus(phaseKey, itemId);
          if (status === "pending") { count++; break; }
        }
      }
    }
    return count;
  }, [autoSatisfied, checklistTemplate, getItemStatus]);

  // Bulk auto-check all satisfied items
  const handleAutoCheckAll = useCallback(async () => {
    const updates: { phaseKey: string; itemId: string }[] = [];
    for (const [itemId] of autoSatisfied) {
      for (const [phaseKey, phase] of Object.entries(checklistTemplate)) {
        if ((phase as any).items.some((i: any) => i.id === itemId)) {
          const status = getItemStatus(phaseKey, itemId);
          if (status === "pending") updates.push({ phaseKey, itemId });
          break;
        }
      }
    }
    if (updates.length === 0) return;
    if (isDemo) {
      setDemoState(prev => prev.map(i => {
        const hit = updates.find(u => u.phaseKey === i.phaseKey && u.itemId === i.itemId);
        return hit ? { ...i, status: "done" as ChecklistStatus, updatedAt: Date.now() } : i;
      }));
    } else {
      await Promise.all(updates.map(({ phaseKey, itemId }) =>
        updateChecklist({
          projectId: projectId as Id<"bidshield_projects">,
          phaseKey,
          itemId,
          status: "done",
          notes: `Auto-verified: ${autoSatisfied.get(itemId) ?? "data from other tabs"}`,
        })
      ));
    }
  }, [autoSatisfied, checklistTemplate, getItemStatus, isDemo, projectId, updateChecklist]);

  const setStatus = useCallback(async (phaseKey: string, itemId: string, target: ChecklistStatus) => {
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, status: target, updatedAt: Date.now() } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: target, notes: (current as any)?.notes });
    }
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  const cycleStatus = useCallback(async (phaseKey: string, itemId: string) => {
    const order: ChecklistStatus[] = ["pending", "done", "na"];
    const current = getItemStatus(phaseKey, itemId);
    const next = order[(order.indexOf(current) + 1) % order.length];
    await setStatus(phaseKey, itemId, next);
    if (next === "done" || next === "na") {
      const rk = `${phaseKey}-${itemId}`;
      setFlashedItem(rk);
      setTimeout(() => setFlashedItem(f => f === rk ? null : f), 500);
    }
  }, [getItemStatus, setStatus]);

  const saveNote = useCallback(async (phaseKey: string, itemId: string, note: string) => {
    const rk = `${phaseKey}-${itemId}`;
    if (isDemo) {
      setDemoState(p => p.map(i => i.phaseKey === phaseKey && i.itemId === itemId ? { ...i, notes: note, updatedAt: Date.now() } : i));
    } else {
      const current = resolvedItems.find((i: any) => i.phaseKey === phaseKey && i.itemId === itemId);
      await updateChecklist({ projectId: projectId as Id<"bidshield_projects">, phaseKey, itemId, status: (current as any)?.status || "pending", notes: note });
    }
    setEditingNote(null);
    if (note.trim()) {
      setSavedNoteFlash(rk);
      setTimeout(() => setSavedNoteFlash(f => f === rk ? null : f), 1500);
    }
  }, [isDemo, resolvedItems, projectId, updateChecklist]);

  const getPhaseStats = useCallback((phaseKey: string) => {
    const items    = resolvedItems.filter((i: any) => i.phaseKey === phaseKey);
    const total    = items.length;
    const done     = items.filter((i: any) => i.status === "done" || i.status === "na").length;
    const blockers = items.filter((i: any) => i.status === "warning").length;
    const rfis     = items.filter((i: any) => i.status === "rfi").length;
    const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, blockers, rfis, pct };
  }, [resolvedItems]);

  const filterCounts = useMemo(() => {
    const allItems = Object.entries(checklistTemplate).flatMap(([phaseKey, phase]) =>
      (phase as any).items.map((item: any) => ({ phaseKey, itemId: item.id, status: getItemStatus(phaseKey, item.id) }))
    );
    return {
      all:        allItems.length,
      incomplete: allItems.filter(i => matchesFilter(i.status, "incomplete")).length,
      flagged:    allItems.filter(i => matchesFilter(i.status, "flagged")).length,
      rfi:        allItems.filter(i => matchesFilter(i.status, "rfi")).length,
      done:       allItems.filter(i => matchesFilter(i.status, "done")).length,
    };
  }, [checklistTemplate, resolvedItems, getItemStatus]);

  const visiblePhases = useMemo(() => {
    const phases = Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
      const p = phase as any;
      // Sort: critical items first within each phase
      const sortedItems = [...p.items].sort((a: any, b: any) => (b.critical ? 1 : 0) - (a.critical ? 1 : 0));
      const items = sortedItems.filter((item: any) => matchesFilter(getItemStatus(phaseKey, item.id), filter));
      return { phaseKey, phase: p, items, sortedItems };
    }).filter(({ items }) => items.length > 0);
    // Always anchor Phase 1 at top in filtered views even if fully complete
    if (filter !== "all" && !phases.some(p => p.phaseKey === "phase1") && checklistTemplate["phase1"]) {
      const p1 = checklistTemplate["phase1"] as any;
      phases.unshift({ phaseKey: "phase1", phase: p1, items: [], sortedItems: [...p1.items] });
    }
    return phases;
  }, [checklistTemplate, filter, resolvedItems, getItemStatus]);

  const bidDate  = project?.bidDate ? new Date(project.bidDate) : null;
  const daysUntil = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / 86400000) : null;

  const blockerCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).blockers, 0),
  [checklistTemplate, getPhaseStats]);
  const rfiCount = useMemo(() =>
    Object.entries(checklistTemplate).reduce((sum, [phaseKey]) => sum + getPhaseStats(phaseKey).rfis, 0),
  [checklistTemplate, getPhaseStats]);

  const quickActions = useMemo(() => {
    const actions: { label: string; onClick: () => void }[] = [];
    const phaseIncomplete = Object.entries(checklistTemplate)
      .map(([phaseKey, phase]) => {
        const p = phase as any;
        const incomplete = p.items.filter((item: any) => matchesFilter(getItemStatus(phaseKey, item.id), "incomplete")).length;
        return { phaseKey, title: p.title, incomplete };
      })
      .filter(p => p.incomplete > 0)
      .sort((a, b) => b.incomplete - a.incomplete)
      .slice(0, 3);
    for (const ph of phaseIncomplete) {
      actions.push({
        label: `Complete ${ph.title} (${ph.incomplete} item${ph.incomplete !== 1 ? "s" : ""} left)`,
        onClick: () => { setFilter("incomplete"); setExpanded(p => ({ ...p, [ph.phaseKey]: true })); },
      });
    }
    if (rfiCount > 0) {
      actions.push({ label: `Review ${rfiCount} open RFI${rfiCount !== 1 ? "s" : ""}`, onClick: () => onNavigateTab?.("rfis") });
    }
    return actions;
  }, [checklistTemplate, resolvedItems, getItemStatus, rfiCount, onNavigateTab]);

  // Detect when phase just reached 100% → auto-collapse
  useEffect(() => {
    for (const [phaseKey] of Object.entries(checklistTemplate)) {
      const stats = getPhaseStats(phaseKey);
      const prev = prevPhasePcts.current[phaseKey] ?? 0;
      if (stats.total > 0 && stats.pct === 100 && prev < 100) {
        // Auto-collapse when phase completes
        setExpanded(p => ({ ...p, [phaseKey]: false }));
      }
      prevPhasePcts.current[phaseKey] = stats.pct;
    }
  }, [resolvedItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const dpsf = (project as any)?.totalBidAmount && (project as any)?.grossRoofArea
    ? Math.round(((project as any).totalBidAmount / (project as any).grossRoofArea) * 100) / 100
    : null;

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: "all",        label: `All (${filterCounts.all})` },
    { id: "incomplete", label: `Incomplete (${filterCounts.incomplete})` },
    { id: "flagged",    label: `Flagged (${filterCounts.flagged})` },
    { id: "rfi",        label: `RFI (${filterCounts.rfi})` },
    { id: "done",       label: `Done (${filterCounts.done})` },
  ];

  return (
    <>
    <div className="flex flex-col gap-4">

        {/* ── TOOLBAR: filters + summary ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: "1px solid var(--bs-border)", width: "100%" }}>
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="cursor-pointer transition-all"
                style={{
                  height: 36, padding: "0 16px", fontSize: 13, background: "none", border: "none",
                  borderBottom: filter === id ? `2px solid var(--bs-teal)` : "2px solid transparent",
                  color: filter === id ? "var(--bs-text-primary)" : "var(--bs-text-dim)",
                  fontWeight: filter === id ? 500 : 400,
                  whiteSpace: "nowrap", cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
            {/* Summary stats right side */}
            <div className="ml-auto hidden lg:flex items-center gap-3 text-[12px] pr-2">
              {filterCounts.incomplete > 0 && <span style={{ color: "var(--bs-text-dim)" }}>{filterCounts.incomplete} incomplete</span>}
              {rfiCount > 0 && <span className="font-medium" style={{ color: "var(--bs-amber)" }}>{rfiCount} RFI{rfiCount !== 1 ? "s" : ""}</span>}
              {blockerCount > 0 && <span className="font-medium" style={{ color: "var(--bs-red)" }}>{blockerCount} blocked</span>}
              <span className="font-medium" style={{ color: "var(--bs-teal)" }}>{filterCounts.done} done</span>
            </div>
          </div>
        </div>

        {/* Auto-check banner */}
        {autoReadyCount > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
            style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            <span style={{ fontSize: 12, color: "var(--bs-teal)", flex: 1 }}>
              <strong>{autoReadyCount}</strong> item{autoReadyCount !== 1 ? "s" : ""} can be auto-verified from data in other tabs
            </span>
            <button
              onClick={handleAutoCheckAll}
              className="cursor-pointer"
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6,
                background: "var(--bs-teal)", color: "#13151a", border: "none",
              }}
            >
              Auto-check all
            </button>
          </div>
        )}

        {/* Checklist table — single container, flat groups */}
        {visiblePhases.length === 0 ? (
          <div className="text-center py-16 rounded-[10px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
              {filter === "incomplete" ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
              )}
            </div>
            <p className="text-[13px] font-medium" style={{ color: "var(--bs-text-muted)" }}>{filter === "incomplete" ? "All items complete!" : "No items match this filter"}</p>
          </div>
        ) : (
        <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          {visiblePhases.map(({ phaseKey, phase, items }, phaseIdx) => {
            const stats       = getPhaseStats(phaseKey);
            const isComplete  = stats.total > 0 && stats.pct === 100;
            const isOpen      = expanded[phaseKey] ?? (filter !== "done" && !isComplete);
            const isHighRisk  = !!phase.critical;
            const pctColor    = stats.pct === 100 ? "var(--bs-teal)" : stats.pct >= 67 ? "var(--bs-blue)" : stats.pct >= 34 ? "var(--bs-amber)" : "var(--bs-red)";
            const incompleteInPhase = (phase as any).items.filter((item: any) => {
              const s = getItemStatus(phaseKey, item.id);
              return s === "pending" || s === "rfi" || s === "warning";
            });
            const allPhaseSelected = incompleteInPhase.length > 0 && incompleteInPhase.every((item: any) => selected.has(selKey(phaseKey, item.id)));
            const somePhaseSelected = !allPhaseSelected && incompleteInPhase.some((item: any) => selected.has(selKey(phaseKey, item.id)));

            return (
              <div
                key={phaseKey}
                style={phaseIdx > 0 ? { borderTop: "1px solid var(--bs-border)" } : {}}
              >
                {/* Phase header — sticky group row */}
                <div className="flex items-center sticky top-[52px] z-10" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                  {/* Select-all checkbox */}
                  <div
                    className="pl-4 flex items-center justify-center self-stretch"
                    style={{ minWidth: 36 }}
                    onClick={e => {
                      e.stopPropagation();
                      setSelected(prev => {
                        const next = new Set(prev);
                        if (allPhaseSelected) {
                          incompleteInPhase.forEach((item: any) => next.delete(selKey(phaseKey, item.id)));
                        } else {
                          incompleteInPhase.forEach((item: any) => next.add(selKey(phaseKey, item.id)));
                        }
                        return next;
                      });
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allPhaseSelected}
                      ref={el => { if (el) el.indeterminate = somePhaseSelected; }}
                      onChange={() => {}}
                      style={{ width: 13, height: 13, cursor: "pointer", accentColor: "var(--bs-teal)", flexShrink: 0 }}
                      title={allPhaseSelected ? "Deselect all" : "Select all incomplete"}
                    />
                  </div>
                  <button
                    onClick={() => setExpanded(p => ({ ...p, [phaseKey]: !isOpen }))}
                    className="flex-1 flex items-center gap-3 px-3 py-3 transition-colors text-left"
                  >
                    <span className="text-base shrink-0">{phase.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-primary)" }}>{phase.title}</span>
                        {isHighRisk && <span className="text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wide" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>Critical</span>}
                        {stats.blockers > 0 && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>{stats.blockers} blocked</span>}
                        {stats.rfis > 0    && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>{stats.rfis} RFI</span>}
                        {isComplete && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>
                            <svg style={{ width: 9, height: 9, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            Complete
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="shrink-0" style={{ fontSize: 12, color: "var(--bs-text-dim)" }}>{(phase as any).items.length} items · {stats.pct}%</span>
                        <div className="w-20 h-[3px] rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, background: pctColor }} />
                        </div>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: "var(--bs-text-dim)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Critical rule banner */}
                {phase.criticalRule && isOpen && (
                  <div className="px-4 py-2 text-xs font-medium flex items-center gap-1.5" style={{ background: "var(--bs-amber-dim)", borderTop: "1px solid var(--bs-border)", borderLeft: "3px solid var(--bs-amber)", color: "var(--bs-amber)" }}>
                    {phase.criticalRule}
                  </div>
                )}

                {/* No system selected note — spec review only */}
                {phaseKey === "phase9" && !systemType && isOpen && (
                  <div className="px-4 py-2 text-xs" style={{ background: "var(--bs-amber-dim)", borderTop: "1px solid var(--bs-border)", color: "var(--bs-amber)" }}>
                    Select a roof system in Project Settings to filter spec items to your system type. All items are shown until then.
                  </div>
                )}

                {/* All complete state */}
                {isOpen && items.length === 0 && (
                  <div className="px-4 py-2.5 text-xs font-medium flex items-center gap-1.5" style={{ borderTop: "1px solid var(--bs-border)", color: "var(--bs-teal)" }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    All items complete
                  </div>
                )}

                {/* Items */}
                {isOpen && items.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--bs-border)" }}>
                    {items.map((item: any) => {
                      const status            = getItemStatus(phaseKey, item.id);
                      const note              = getItemNote(phaseKey, item.id);
                      const noteTs            = getItemUpdatedAt(phaseKey, item.id);
                      const rowKey            = `${phaseKey}-${item.id}`;
                      const isDone            = status === "done" || status === "na";
                      const isFlagged         = status === "warning";
                      const isSwipe           = swipeActive === rowKey;
                      const isEditingThisNote = editingNote === rowKey;
                      const isRfiDrawerOpen   = rfiDrawerKey === rowKey;
                      const noteSaved         = savedNoteFlash === rowKey;
                      const itemIsHighRisk    = isHighRisk || !!item.critical;
                      const isOptional        = item.text.includes("(if applicable)");
                      const autoReason        = autoSatisfied.get(item.id);
                      const isAutoReady       = !!autoReason && !isDone;

                      return (
                        <div
                          key={item.id}
                          className="group transition-colors"
                          style={{ borderBottom: "1px solid var(--bs-border)" }}
                        >
                          {/* Main row */}
                          <div
                            className="flex items-center gap-3 select-none"
                            style={{
                              padding: "10px 16px",
                              background: flashedItem === rowKey ? "var(--bs-teal-dim)" : isSwipe ? "var(--bs-bg-elevated)" : undefined,
                              transition: "background 0.5s",
                              borderLeft: itemIsHighRisk && !isDone ? "2px solid var(--bs-red)" : "2px solid transparent",
                            }}
                            onMouseEnter={e => { if (flashedItem !== rowKey) (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = flashedItem === rowKey ? "var(--bs-teal-dim)" : ""; }}
                            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setSwipeActive(rowKey); }}
                            onTouchEnd={(e) => {
                              const dx = e.changedTouches[0].clientX - touchStartX.current;
                              setSwipeActive(null);
                              if (Math.abs(dx) > 60) setStatus(phaseKey, item.id, dx > 0 ? "done" : "na");
                            }}
                          >
                            {/* Selection checkbox */}
                            <input
                              type="checkbox"
                              checked={selected.has(selKey(phaseKey, item.id))}
                              onChange={e => { e.stopPropagation(); toggleSelect(selKey(phaseKey, item.id)); }}
                              onClick={e => e.stopPropagation()}
                              style={{ width: 13, height: 13, accentColor: "var(--bs-teal)", flexShrink: 0, cursor: "pointer" }}
                            />
                            {/* Item text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span style={{ fontSize: 13, lineHeight: 1.4, color: isDone ? "var(--bs-text-dim)" : "var(--bs-text-secondary)", textDecoration: isDone ? "line-through" : "none" }}>
                                  {item.id === "p9-ec1" && climateZone
                                    ? `${item.text} ${climateZone}`
                                    : item.text}
                                </span>
                                {isOptional && !isDone && (
                                  <span style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0 }}>
                                    Optional
                                  </span>
                                )}
                                {isAutoReady && (
                                  <span
                                    title={autoReason}
                                    style={{ fontSize: 9, background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0, cursor: "help" }}
                                  >
                                    Auto
                                  </span>
                                )}
                              </div>
                              {item.helpUrl && !isDone && (
                                <a
                                  href={item.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ fontSize: 11, color: "var(--bs-blue)", marginTop: 2, display: "block", textDecoration: "none" }}
                                  className="hover:underline"
                                >
                                  ASHRAE 90.1 Climate Zone Table ↗
                                </a>
                              )}
                              {item.helpText && !isDone && (
                                <div style={{ marginTop: 3 }}>
                                  <button
                                    onClick={e => { e.stopPropagation(); setExpandedHelp(prev => prev === rowKey ? null : rowKey); }}
                                    style={{ fontSize: 11, color: "var(--bs-amber)", fontWeight: 500, background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                                  >
                                    <span>{expandedHelp === rowKey ? "▲" : "▼"}</span>
                                    <span>Why this matters</span>
                                  </button>
                                  {expandedHelp === rowKey && (
                                    <p style={{ fontSize: 12, color: "var(--bs-amber)", background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)", borderRadius: 6, padding: "8px 10px", marginTop: 5, lineHeight: 1.5 }}>
                                      {item.helpText}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                              {status === "rfi" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRfiDrawerKey(prev => prev === rowKey ? null : rowKey); setRfiQuestion(item.text); }}
                                  className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded cursor-pointer transition-colors"
                                  style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)", border: "1px solid var(--bs-blue-border)" }}
                                >
                                  RFI {isRfiDrawerOpen ? "▲" : "▼"}
                                </button>
                              )}

                              {status !== "rfi" && status !== "warning" && (
                                <>
                                  {!isEditingThisNote && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, isFlagged ? "pending" : "warning"); }}
                                      className="shrink-0 h-8 px-3 flex items-center gap-1.5 rounded text-[12px] transition-all cursor-pointer"
                                      style={{ background: isFlagged ? "var(--bs-red-dim)" : "rgba(255,255,255,0.04)", color: isFlagged ? "var(--bs-red)" : "var(--bs-text-dim)", border: `1px solid ${isFlagged ? "var(--bs-red-border)" : "var(--bs-border)"}` }}
                                    >
                                      ⚑ Flag
                                    </button>
                                  )}
                                  {!isEditingThisNote && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                                      className="shrink-0 h-8 px-3 flex items-center gap-1.5 rounded text-[12px] transition-all cursor-pointer"
                                      style={{ background: "rgba(255,255,255,0.04)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}
                                    >
                                      {note ? "Edit note" : "Note"}
                                    </button>
                                  )}
                                  {status === "pending" ? (
                                    <>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "na"); }}
                                        className="shrink-0 h-8 rounded text-[12px] font-medium px-4 transition-all whitespace-nowrap cursor-pointer"
                                        style={{ background: "rgba(255,255,255,0.04)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
                                      >
                                        N/A
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "rfi"); }}
                                        className="shrink-0 h-8 rounded text-[12px] font-medium px-4 transition-all whitespace-nowrap cursor-pointer"
                                        style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)" }}
                                      >
                                        ? RFI
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "done"); }}
                                        className="shrink-0 h-8 rounded text-[12px] font-medium px-4 transition-all whitespace-nowrap cursor-pointer"
                                        style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}
                                      >
                                        Done
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "pending"); }}
                                      className="shrink-0 h-8 rounded text-[12px] font-medium px-4 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                                      style={{ background: status === "done" ? "var(--bs-teal-dim)" : "rgba(255,255,255,0.04)", color: status === "done" ? "var(--bs-teal)" : "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}
                                      title="Click to undo"
                                    >
                                      <span>{status === "done" ? "Done" : "N/A"}</span>
                                      <span className="text-xs opacity-60">✕</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Note display */}
                          {note && !isEditingThisNote && (
                            <div
                              className="mx-4 mb-2 flex items-start justify-between cursor-pointer"
                              style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--bs-amber)", padding: "6px 10px" }}
                              onClick={e => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                            >
                              <p style={{ fontSize: 12, color: "var(--bs-amber)", lineHeight: 1.4, flex: 1 }}>
                                <span style={{ fontWeight: 500 }}>Note: </span>{note}
                              </p>
                              <span style={{ fontSize: 10, color: "var(--bs-text-dim)", marginLeft: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
                                {formatNoteDate(noteTs) ? `· ${formatNoteDate(noteTs)}` : ""}
                              </span>
                              {noteSaved && (
                                <span className="text-[10px] font-medium shrink-0 ml-1" style={{ color: "var(--bs-teal)" }}>Saved</span>
                              )}
                            </div>
                          )}
                          {noteSaved && !note && (
                            <div className="mx-4 mb-2 text-[11px] font-medium px-2" style={{ color: "var(--bs-teal)" }}>Saved</div>
                          )}

                          {/* Note editing textarea */}
                          {isEditingThisNote && (
                            <div className="px-4 pb-3 pt-1 ml-4" onClick={e => e.stopPropagation()}>
                              <textarea
                                autoFocus
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                onBlur={() => saveNote(phaseKey, item.id, noteText)}
                                onKeyDown={e => { if (e.key === "Escape") setEditingNote(null); if (e.key === "Enter" && e.metaKey) saveNote(phaseKey, item.id, noteText); }}
                                placeholder="Add a note..."
                                rows={2}
                                className="w-full resize-none focus:outline-none"
                                style={{ fontSize: 12, color: "var(--bs-text-secondary)", background: "var(--bs-bg-input)", border: "1px solid var(--bs-amber-border)", borderRadius: 6, padding: "8px 10px" }}
                              />
                              <p className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>Blur or ⌘↵ to save · Esc to cancel</p>
                            </div>
                          )}

                          {/* RFI inline drawer */}
                          {isRfiDrawerOpen && (
                            <div className="mx-4 mb-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--bs-border)" }} onClick={e => e.stopPropagation()}>
                              <div className="text-[11px] font-medium mb-2" style={{ color: "var(--bs-amber)" }}>RFI Details</div>
                              <textarea
                                value={rfiQuestion}
                                onChange={e => setRfiQuestion(e.target.value)}
                                placeholder="Describe your question or clarification needed..."
                                rows={2}
                                className="w-full resize-none focus:outline-none"
                                style={{ fontSize: 12, color: "var(--bs-text-secondary)", background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "8px 10px" }}
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={async () => {
                                    if (!isDemo && isValidConvexId && userId && rfiQuestion.trim()) {
                                      await createRFIMut({
                                        projectId: projectId as Id<"bidshield_projects">,
                                        userId,
                                        question: rfiQuestion.trim(),
                                      });
                                    }
                                    setRfiDrawerKey(null);
                                    onNavigateTab?.("rfis");
                                  }}
                                  className="text-[11px] font-medium px-3 py-1.5 rounded cursor-pointer transition-colors"
                                  style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)" }}
                                >
                                  + Create RFI
                                </button>
                                <button
                                  onClick={() => setRfiDrawerKey(null)}
                                  className="text-[11px] cursor-pointer transition-colors"
                                  style={{ color: "var(--bs-text-dim)", background: "none", border: "none" }}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
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
        )}

      {/* ── TEMPLATES (bottom, only for non-demo) ── */}
      {!isDemo && (
        <div className="hidden lg:block">
          <SilentBoundary>
            <ChecklistTemplatesPanel
              userId={userId}
              projectId={projectId}
              isDemo={isDemo}
              systemType={systemType}
              isValidConvexId={!!isValidConvexId}
            />
          </SilentBoundary>
        </div>
      )}


    </div>

    {/* Floating bulk action bar */}
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: selected.size > 0 ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)",
        opacity: selected.size > 0 ? 1 : 0,
        pointerEvents: selected.size > 0 ? "auto" : "none",
        transition: "transform 0.25s ease-out, opacity 0.2s",
        background: "var(--bs-bg-elevated)",
        border: "1px solid var(--bs-border)",
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "var(--bs-shadow-dropdown)",
        zIndex: 50,
        minWidth: 360,
        maxWidth: 560,
        width: "calc(100vw - 48px)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-muted)", flexShrink: 0, marginRight: 4 }}>
        {selected.size} selected
      </span>
      <div style={{ flex: 1 }} />
      <button onClick={() => bulkSetStatus("done")} className="cursor-pointer" style={{ fontSize: 12, fontWeight: 500, background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)", borderRadius: 6, padding: "6px 12px", whiteSpace: "nowrap" }}>
        Mark Done
      </button>
      <button onClick={() => bulkSetStatus("na")} className="cursor-pointer" style={{ fontSize: 12, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "6px 12px", whiteSpace: "nowrap" }}>
        Mark N/A
      </button>
      <button onClick={() => bulkSetStatus("warning")} className="cursor-pointer" style={{ fontSize: 12, fontWeight: 500, background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)", borderRadius: 6, padding: "6px 12px", whiteSpace: "nowrap" }}>
        Flag
      </button>
      <button onClick={clearSelection} className="cursor-pointer" style={{ fontSize: 12, color: "var(--bs-text-dim)", background: "none", border: "none", padding: "6px 8px", whiteSpace: "nowrap" }}>
        ✕ Clear
      </button>
    </div>
    </>
  );
}
