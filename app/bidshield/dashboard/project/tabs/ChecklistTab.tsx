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
    <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
        Checklist Templates
      </div>

      {templateFlash && (
        <div style={{ fontSize: 12, color: "#059669", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
          {templateFlash}
        </div>
      )}

      {!showSaveTemplate ? (
        <button
          onClick={() => {
            setTemplateName(systemType ? `${systemType.toUpperCase()} Template` : "My Template");
            setShowSaveTemplate(true);
          }}
          style={{ fontSize: 12, fontWeight: 500, color: "#4f46e5", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6, padding: "6px 10px", cursor: "pointer", width: "100%", textAlign: "left" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e0e7ff")}
          onMouseLeave={e => (e.currentTarget.style.background = "#eef2ff")}
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
            style={{ fontSize: 12, border: "1px solid #c7d2fe", borderRadius: 6, padding: "6px 8px", outline: "none", width: "100%" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleSaveTemplate}
              disabled={templateSaving || !templateName.trim()}
              style={{ flex: 1, fontSize: 12, fontWeight: 600, background: templateSaving || !templateName.trim() ? "#a5b4fc" : "#4f46e5", color: "white", border: "none", borderRadius: 6, padding: "6px 0", cursor: templateSaving || !templateName.trim() ? "not-allowed" : "pointer" }}
            >
              {templateSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowSaveTemplate(false)}
              style={{ fontSize: 12, color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
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
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tpl.name}
                </div>
                {tpl.systemType && (
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{tpl.systemType.toUpperCase()}</div>
                )}
              </div>
              <button
                onClick={() => handleApplyTemplate(tpl._id as Id<"bidshield_checklist_templates">)}
                disabled={applyingTemplateId === tpl._id}
                title="Apply this template to the current project"
                style={{ fontSize: 11, fontWeight: 500, color: "#059669", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 5, padding: "3px 8px", cursor: applyingTemplateId === tpl._id ? "wait" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#dcfce7")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f0fdf4")}
              >
                {applyingTemplateId === tpl._id ? "..." : "Apply"}
              </button>
              <button
                onClick={() => handleDeleteTemplate(tpl._id as Id<"bidshield_checklist_templates">)}
                title="Delete this template"
                style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "3px 4px", flexShrink: 0, lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#b91c1c")}
                onMouseLeave={e => (e.currentTarget.style.color = "#ef4444")}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {templates && templates.length === 0 && !showSaveTemplate && (
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
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

export default function ChecklistTab({ projectId, isDemo, project, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const checklistItems   = useQuery(api.bidshield.getChecklist,         !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const overallProgress  = useQuery(api.bidshield.getChecklistProgress, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const updateChecklist  = useMutation(api.bidshield.updateChecklistItem);

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
  const deckType          = project?.deckType;
  const fmGlobal          = project?.fmGlobal ?? false;
  const pre1990           = project?.pre1990 ?? false;
  const energyCode        = project?.energyCode ?? false;
  const climateZone       = project?.climateZone ?? "";
  const checklistTemplate = isDemo ? demoChecklist : getChecklistForTrade(trade, systemType, deckType, fmGlobal, pre1990, energyCode);
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

      {/* ── LEFT: Checklist ── */}
      <div className="flex flex-col gap-3 min-w-0">

        {/* Filter tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, background: "#f3f4f6", padding: 4, borderRadius: 8 }}>
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                height: 30, padding: "0 12px", borderRadius: 6, fontSize: 13,
                fontWeight: filter === id ? 500 : 400,
                background: filter === id ? "#ffffff" : "transparent",
                color: filter === id ? "#111827" : "#6b7280",
                boxShadow: filter === id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status legend — inline pills below filters */}
        <div className="flex items-center gap-2 flex-wrap px-1">
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Click to mark:</span>
          <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", borderRadius: 99, padding: "2px 10px", fontWeight: 500 }}>✓ Done</span>
          <span style={{ fontSize: 11, background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: 99, padding: "2px 10px", fontWeight: 500 }}>N/A</span>
          <span style={{ fontSize: 11, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 99, padding: "2px 10px", fontWeight: 500 }}>⚑ Flag</span>
          <span style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", borderRadius: 99, padding: "2px 10px", fontWeight: 500 }}>? RFI</span>
        </div>

        {/* Empty state */}
        {visiblePhases.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="text-4xl mb-3">{filter === "incomplete" ? "🎉" : "📋"}</div>
            <p className="text-sm font-semibold text-slate-700">{filter === "incomplete" ? "All items complete!" : "No items match this filter"}</p>
          </div>
        )}

        {/* Phase cards */}
        <div className="flex flex-col gap-2">
          {visiblePhases.map(({ phaseKey, phase, items }) => {
            const stats       = getPhaseStats(phaseKey);
            const isComplete  = stats.total > 0 && stats.pct === 100;
            // Auto-collapse completed phases; expand incomplete ones by default
            const isOpen      = expanded[phaseKey] ?? (filter !== "done" && !isComplete);
            const isHighRisk  = !!phase.critical;
            const pctColor    = stats.pct === 100 ? "#10b981" : stats.pct >= 67 ? "#3b82f6" : stats.pct >= 34 ? "#f59e0b" : "#ef4444";
            const incompleteInPhase = (phase as any).items.filter((item: any) => {
              const s = getItemStatus(phaseKey, item.id);
              return s === "pending" || s === "rfi" || s === "warning";
            });
            const allPhaseSelected = incompleteInPhase.length > 0 && incompleteInPhase.every((item: any) => selected.has(selKey(phaseKey, item.id)));
            const somePhaseSelected = !allPhaseSelected && incompleteInPhase.some((item: any) => selected.has(selKey(phaseKey, item.id)));

            return (
              <div
                key={phaseKey}
                className="overflow-hidden"
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  borderLeft: `3px solid ${pctColor}`,
                }}
              >
                {/* Phase header */}
                <div className="flex items-center" style={{ background: "#f8fafc" }}>
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
                      style={{ width: 13, height: 13, cursor: "pointer", accentColor: "#64748b", flexShrink: 0 }}
                      title={allPhaseSelected ? "Deselect all" : "Select all incomplete"}
                    />
                  </div>
                  <button
                    onClick={() => setExpanded(p => ({ ...p, [phaseKey]: !isOpen }))}
                    className="flex-1 flex items-center gap-3 px-3 py-3 transition-colors text-left"
                    onMouseEnter={e => { (e.currentTarget.parentElement as HTMLElement).style.background = "#f1f5f9"; }}
                    onMouseLeave={e => { (e.currentTarget.parentElement as HTMLElement).style.background = "#f8fafc"; }}
                  >
                    <span className="text-base shrink-0">{phase.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{phase.title}</span>
                        {isHighRisk && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">CRITICAL</span>}
                        {stats.blockers > 0 && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">{stats.blockers} blocked</span>}
                        {stats.rfis > 0    && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{stats.rfis} RFI</span>}
                        {isComplete && (
                          <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 99, padding: "1px 8px" }}>✓ Complete</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span style={{ fontSize: 12, color: "#9ca3af" }} className="shrink-0">{(phase as any).items.length} items · {stats.pct}%</span>
                        <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden shrink-0">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, background: pctColor }} />
                        </div>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Critical rule banner */}
                {phase.criticalRule && isOpen && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-700 font-medium">
                    ⚠ {phase.criticalRule}
                  </div>
                )}

                {/* No system selected note — spec review only */}
                {phaseKey === "phase9" && !systemType && isOpen && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                    💡 Select a roof system in Project Settings to filter spec items to your system type. All items are shown until then.
                  </div>
                )}

                {/* All complete state */}
                {isOpen && items.length === 0 && (
                  <div className="px-4 py-2.5 border-t border-[#e2e8f0] text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                    <span>✓</span> All items complete
                  </div>
                )}

                {/* Items */}
                {isOpen && items.length > 0 && (
                  <div className="border-t border-[#e2e8f0] divide-y divide-[#f1f5f9]">
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

                      return (
                        <div
                          key={item.id}
                          className={`group transition-colors ${isSwipe ? "bg-slate-100" : ""}`}
                        >
                          {/* Main row */}
                          <div
                            className="flex items-center gap-3 cursor-pointer select-none"
                            style={{
                              padding: "10px 16px",
                              background: flashedItem === rowKey ? "#f0fdf4" : undefined,
                              transition: "background 0.5s",
                              borderLeft: itemIsHighRisk && !isDone ? "2px solid #fca5a5" : "2px solid transparent",
                            }}
                            onClick={() => cycleStatus(phaseKey, item.id)}
                            onMouseEnter={e => { if (flashedItem !== rowKey) (e.currentTarget as HTMLElement).style.background = itemIsHighRisk ? "#fef2f2" : "#f8fafc"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = flashedItem === rowKey ? "#f0fdf4" : ""; }}
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
                              style={{ width: 13, height: 13, accentColor: "#64748b", flexShrink: 0, cursor: "pointer" }}
                            />
                            {/* Item text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span style={{ fontSize: 14, lineHeight: 1.4, fontWeight: isDone ? 400 : itemIsHighRisk ? 500 : 400, color: isDone ? "#9ca3af" : itemIsHighRisk ? "#111827" : "#374151", textDecoration: isDone ? "line-through" : "none" }}>
                                  {item.id === "p9-ec1" && climateZone
                                    ? `${item.text} ${climateZone}`
                                    : item.text}
                                </span>
                                {/* Optional badge */}
                                {isOptional && !isDone && (
                                  <span style={{ fontSize: 9, background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1px 5px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                                    Optional
                                  </span>
                                )}
                              </div>
                              {item.helpUrl && !isDone && (
                                <a
                                  href={item.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  style={{ fontSize: 11, color: "#6366f1", marginTop: 2, display: "block", textDecoration: "none" }}
                                  className="hover:underline"
                                >
                                  ASHRAE 90.1 Climate Zone Table ↗
                                </a>
                              )}
                              {item.helpText && !isDone && (
                                <div style={{ marginTop: 3 }}>
                                  <button
                                    onClick={e => { e.stopPropagation(); setExpandedHelp(prev => prev === rowKey ? null : rowKey); }}
                                    style={{ fontSize: 11, color: "#f59e0b", fontWeight: 500, background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                                  >
                                    <span>{expandedHelp === rowKey ? "▲" : "▼"}</span>
                                    <span>Why this matters</span>
                                  </button>
                                  {expandedHelp === rowKey && (
                                    <p style={{ fontSize: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "8px 10px", marginTop: 5, lineHeight: 1.5 }}>
                                      {item.helpText}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* RFI badge — opens inline drawer */}
                            {status === "rfi" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setRfiDrawerKey(prev => prev === rowKey ? null : rowKey); setRfiQuestion(item.text); }}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 transition-colors ${isRfiDrawerOpen ? "bg-amber-200 text-amber-800" : "bg-amber-100 hover:bg-amber-200 text-amber-700"}`}
                              >
                                RFI {isRfiDrawerOpen ? "▲" : "▼"}
                              </button>
                            )}

                            {/* Flag button — hover only */}
                            {!isEditingThisNote && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, isFlagged ? "pending" : "warning"); }}
                                className={`transition-all shrink-0 text-sm ${isFlagged ? "text-orange-500" : "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-orange-400"}`}
                                title={isFlagged ? "Unflag" : "Flag for review"}
                              >
                                ⚑
                              </button>
                            )}

                            {/* 📝 Add note button — hover only */}
                            {!isEditingThisNote && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 hover:text-amber-600 shrink-0 whitespace-nowrap"
                              >
                                {note ? "📝 Edit" : "📝 Add note"}
                              </button>
                            )}

                            {/* Status pills — RIGHT side */}
                            {status !== "rfi" && status !== "warning" && (
                              status === "pending" ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "done"); }}
                                    className="rounded-full text-[11px] font-medium px-3 py-1 border transition-all whitespace-nowrap bg-white text-[#9ca3af] border-[#e2e8f0] hover:bg-[#f0fdf4] hover:text-[#16a34a] hover:border-[#86efac]"
                                  >
                                    Mark Done
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "na"); }}
                                    className="rounded-full text-[11px] font-medium px-3 py-1 border transition-all whitespace-nowrap bg-white text-[#9ca3af] border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#94a3b8] hover:border-[#cbd5e1]"
                                    title="Not applicable / not needed"
                                  >
                                    N/A
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setStatus(phaseKey, item.id, "pending"); }}
                                  className={`
                                    shrink-0 rounded-full text-[11px] font-medium px-3 py-1 border transition-all whitespace-nowrap
                                    ${status === "done"
                                      ? "bg-[#f0fdf4] text-[#16a34a] border-[#86efac]"
                                      : "bg-[#f8fafc] text-[#94a3b8] border-[#e2e8f0]"}
                                  `}
                                  title="Click to reset to pending"
                                >
                                  {status === "done" ? "✓ Done" : "N/A"}
                                </button>
                              )
                            )}
                          </div>

                          {/* Note display — styled amber callout */}
                          {note && !isEditingThisNote && (
                            <div
                              className="mx-4 mb-2 flex items-start justify-between cursor-pointer"
                              style={{ background: "#fffbeb", borderLeft: "3px solid #fbbf24", borderRadius: 4, padding: "6px 10px" }}
                              onClick={e => { e.stopPropagation(); setEditingNote(rowKey); setNoteText(note); }}
                            >
                              <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.4, flex: 1 }}>
                                <span style={{ fontWeight: 600 }}>📝 Note: </span>{note}
                              </p>
                              <span style={{ fontSize: 10, color: "#d97706", marginLeft: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
                                {formatNoteDate(noteTs) ? `· ${formatNoteDate(noteTs)}` : ""}
                              </span>
                              {noteSaved && (
                                <span className="text-[10px] text-emerald-600 font-semibold shrink-0 ml-1">Saved ✓</span>
                              )}
                            </div>
                          )}
                          {noteSaved && !note && (
                            <div className="mx-4 mb-2 text-[11px] text-emerald-600 font-medium px-2">Saved ✓</div>
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
                                className="w-full text-xs text-slate-700 bg-white border border-amber-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                              />
                              <p className="text-[10px] text-slate-400 mt-0.5">Blur or ⌘↵ to save · Esc to cancel</p>
                            </div>
                          )}

                          {/* RFI inline drawer */}
                          {isRfiDrawerOpen && (
                            <div className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg" onClick={e => e.stopPropagation()}>
                              <div className="text-[11px] font-semibold text-amber-800 mb-2">RFI Details</div>
                              <textarea
                                value={rfiQuestion}
                                onChange={e => setRfiQuestion(e.target.value)}
                                placeholder="Describe your question or clarification needed..."
                                rows={2}
                                className="w-full text-xs text-slate-700 bg-white border border-amber-200 rounded px-3 py-2 resize-none focus:outline-none focus:border-amber-400"
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => { setRfiDrawerKey(null); onNavigateTab?.("rfis"); }}
                                  className="text-[11px] bg-amber-600 text-white px-3 py-1.5 rounded font-medium hover:bg-amber-700 transition-colors"
                                >
                                  + Create RFI
                                </button>
                                <button
                                  onClick={() => setRfiDrawerKey(null)}
                                  className="text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
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
      </div>

      {/* ── RIGHT: Sticky panel ── */}
      <div className="hidden lg:flex flex-col gap-3 sticky top-4">

        {/* Bid readiness */}
        <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
          <div className="flex items-center justify-between mb-2">
            <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bid Readiness</div>
            <span className="text-2xl font-bold text-slate-900">{overall}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overall}%`, background: "#10b981" }} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="text-[13px] font-semibold text-slate-900 leading-snug">{project?.name || "—"}</div>
            {(project as any)?.gc && <div className="text-[11px] text-slate-500">GC: {(project as any).gc}</div>}
            {project?.bidDate && daysUntil !== null && (
              <div className={`text-[11px] font-medium ${daysUntil <= 0 ? "text-red-600" : daysUntil <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                {daysUntil <= 0 ? "Past due" : daysUntil === 0 ? "Due today" : `${daysUntil}d until bid`}
              </div>
            )}
            {dpsf && <div className="text-[11px] text-slate-400">${dpsf}/SF</div>}
          </div>
        </div>

        {/* Compact stats */}
        <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "12px 16px" }}>
          <div className="text-[14px]" style={{ color: "#64748b" }}>
            <span>{filterCounts.incomplete} incomplete</span>
            {rfiCount > 0 && <span> · <span className="text-amber-600 font-medium">{rfiCount} RFI{rfiCount !== 1 ? "s" : ""}</span></span>}
            {blockerCount > 0 && <span> · <span className="text-red-600 font-medium">{blockerCount} blocked</span></span>}
            <span> · <span className="text-emerald-600 font-medium">{filterCounts.done} done</span></span>
          </div>
        </div>

        {/* Quick actions */}
        {quickActions.length > 0 && (
          <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Quick Actions</div>
            <div className="flex flex-col gap-2.5">
              {quickActions.map((action, i) => (
                <button key={i} onClick={action.onClick} className="text-[13px] text-slate-600 hover:text-emerald-600 text-left transition-colors flex items-start gap-1.5">
                  <span className="shrink-0 mt-px">→</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Templates — silently hidden if the Convex function isn't
            deployed yet; SilentBoundary renders null on any query error */}
        {!isDemo && (
          <SilentBoundary>
            <ChecklistTemplatesPanel
              userId={userId}
              projectId={projectId}
              isDemo={isDemo}
              systemType={systemType}
              isValidConvexId={!!isValidConvexId}
            />
          </SilentBoundary>
        )}
      </div>
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
        background: "#1e293b",
        color: "white",
        borderRadius: 12,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        zIndex: 50,
        minWidth: 360,
        maxWidth: 560,
        width: "calc(100vw - 48px)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", flexShrink: 0, marginRight: 4 }}>
        {selected.size} selected
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={() => bulkSetStatus("done")}
        style={{ fontSize: 12, fontWeight: 600, background: "#10b981", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#059669"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#10b981"}
      >
        Mark Done
      </button>
      <button
        onClick={() => bulkSetStatus("na")}
        style={{ fontSize: 12, fontWeight: 500, background: "#334155", color: "#94a3b8", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#475569"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#334155"}
      >
        Mark N/A
      </button>
      <button
        onClick={() => bulkSetStatus("warning")}
        style={{ fontSize: 12, fontWeight: 500, background: "#334155", color: "#fb923c", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#475569"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#334155"}
      >
        Flag
      </button>
      <button
        onClick={clearSelection}
        style={{ fontSize: 12, fontWeight: 500, color: "#64748b", background: "none", border: "none", padding: "6px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748b"}
      >
        ✕ Clear
      </button>
    </div>
    </>
  );
}
