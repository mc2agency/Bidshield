"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { DEFAULT_SCOPE_ITEMS } from "@/lib/bidshield/scope-defaults";
import { DEMO_SCOPE_ITEMS } from "@/lib/bidshield/demo-data";

type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";
type FilterMode = "all" | "unaddressed" | "included" | "excluded" | "by_others" | "na";

const PILL_OPTIONS: {
  value: ScopeStatus;
  label: string;
  short: string;
  color: string;
  dimBg: string;
  border: string;
}[] = [
  { value: "included",  label: "Included",  short: "Inc",    color: "var(--bs-teal)",  dimBg: "var(--bs-teal-dim)",  border: "var(--bs-teal-border)" },
  { value: "excluded",  label: "Excluded",  short: "Exc",    color: "var(--bs-red)",   dimBg: "var(--bs-red-dim)",   border: "var(--bs-red-border)" },
  { value: "by_others", label: "By Others", short: "Others", color: "var(--bs-blue)",  dimBg: "var(--bs-blue-dim)",  border: "var(--bs-blue-border)" },
  { value: "na",        label: "N/A",       short: "N/A",    color: "var(--bs-text-muted)", dimBg: "rgba(255,255,255,0.06)", border: "var(--bs-border)" },
];

function SegmentedPill({
  value,
  onChange,
}: {
  value: ScopeStatus;
  onChange: (v: ScopeStatus) => void;
}) {
  return (
    <div
      className="flex shrink-0"
      style={{ border: "1px solid var(--bs-border)", borderRadius: 6, overflow: "hidden" }}
    >
      {PILL_OPTIONS.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={(e) => { e.stopPropagation(); onChange(opt.value); }}
            className="transition-all active:opacity-80 cursor-pointer"
            style={{
              height: 28,
              padding: "0 10px",
              fontSize: 11,
              fontWeight: isSelected ? 500 : 400,
              background: isSelected ? opt.dimBg : "transparent",
              color: isSelected ? opt.color : "var(--bs-text-dim)",
              borderLeft: i > 0 ? "1px solid var(--bs-border)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ScopeTab({ projectId, isDemo, isPro, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const clarifications = useQuery(
    api.bidshield.getScopeClarifications,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const initScope        = useMutation(api.bidshield.initScopeItems);
  const updateItem       = useMutation(api.bidshield.updateScopeItem);
  const addClarification = useMutation(api.bidshield.addScopeClarification);
  const deleteClarification = useMutation(api.bidshield.deleteScopeClarification);

  const [demoState, setDemoState]         = useState<any[]>(DEMO_SCOPE_ITEMS);
  const [filter, setFilter]               = useState<FilterMode>("all");
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [copiedExclusions, setCopied]     = useState(false);
  const [demoClarifications, setDemoClarifications] = useState<{ _id: string; text: string; createdAt: number }[]>([]);
  const [newClarText, setNewClarText]     = useState("");
  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [aiExclusionsLoading, setAiExclusionsLoading] = useState(false);
  const [aiExclusionsText, setAiExclusionsText]       = useState<string | null>(null);
  const [aiExclusionsError, setAiExclusionsError]     = useState<string | null>(null);

  const resolvedClarifications = isDemo ? demoClarifications : (clarifications ?? []);

  const items = isDemo ? demoState : (scopeItems ?? []);

  // Counts
  const totalCount       = items.length;
  const unaddressedCount = items.filter((i: any) => i.status === "unaddressed").length;
  const includedCount    = items.filter((i: any) => i.status === "included").length;
  const excludedCount    = items.filter((i: any) => i.status === "excluded").length;
  const byOthersCount    = items.filter((i: any) => i.status === "by_others").length;
  const naCount          = items.filter((i: any) => i.status === "na").length;
  const decidedCount     = totalCount - unaddressedCount;
  const decidedPct       = totalCount > 0 ? Math.round((decidedCount / totalCount) * 100) : 0;
  const includedCost     = items
    .filter((i: any) => i.status === "included")
    .reduce((sum: number, i: any) => sum + (i.cost || 0), 0);

  const FILTERS: { id: FilterMode; label: string; count: number }[] = [
    { id: "all",         label: "All",       count: totalCount },
    { id: "unaddressed", label: "Undecided", count: unaddressedCount },
    { id: "included",    label: "Included",  count: includedCount },
    { id: "excluded",    label: "Excluded",  count: excludedCount },
    { id: "by_others",   label: "By Others", count: byOthersCount },
    { id: "na",          label: "N/A",       count: naCount },
  ];

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i: any) => i.status === filter);
  }, [items, filter]);

  // Group by category
  const groups = useMemo(() => {
    const g: Map<string, any[]> = new Map();
    for (const item of filteredItems) {
      const cat = item.category || "General";
      if (!g.has(cat)) g.set(cat, []);
      g.get(cat)!.push(item);
    }
    return g;
  }, [filteredItems]);

  const handleStatusChange = useCallback(async (item: any, newStatus: ScopeStatus) => {
    // Toggle: clicking active status resets to unaddressed
    const status = item.status === newStatus ? "unaddressed" : newStatus;
    if (isDemo) {
      setDemoState(prev => prev.map(i =>
        i._id === item._id ? { ...i, status, cost: status !== "included" ? 0 : i.cost } : i
      ));
      return;
    }
    const updates: any = { itemId: item._id, status };
    if (status !== "included") updates.cost = 0;
    await updateItem(updates);
  }, [isDemo, updateItem]);

  const handleCostChange = useCallback((item: any, value: string) => {
    const cost = value ? parseFloat(value) : 0;
    if (isDemo) { setDemoState(prev => prev.map(i => i._id === item._id ? { ...i, cost } : i)); return; }
    const id = item._id as string;
    const t = debounceRefs.current.get(id);
    if (t) clearTimeout(t);
    debounceRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, cost });
      debounceRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleNoteChange = useCallback((item: any, value: string) => {
    if (isDemo) { setDemoState(prev => prev.map(i => i._id === item._id ? { ...i, note: value } : i)); return; }
    const id = item._id as string;
    const t = debounceRefs.current.get(id);
    if (t) clearTimeout(t);
    debounceRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, note: value });
      debounceRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleCopyExclusions = () => {
    const excl   = items.filter((i: any) => i.status === "excluded");
    const others = items.filter((i: any) => i.status === "by_others");
    const lines: string[] = [];
    if (excl.length > 0) {
      lines.push("EXCLUSIONS:");
      excl.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`));
    }
    if (others.length > 0) {
      if (lines.length) lines.push("");
      lines.push("BY OTHERS:");
      others.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`));
    }
    if (resolvedClarifications.length > 0) {
      if (lines.length) lines.push("");
      lines.push("CLARIFICATIONS & ASSUMPTIONS:");
      resolvedClarifications.forEach((c: any) => lines.push(`• ${c.text}`));
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateExclusions = async () => {
    if (!isPro && !isDemo) return;
    setAiExclusionsLoading(true);
    setAiExclusionsText(null);
    setAiExclusionsError(null);
    try {
      const excl   = items.filter((i: any) => i.status === "excluded");
      const others = items.filter((i: any) => i.status === "by_others");
      const res = await fetch("/api/bidshield/generate-exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedItems: excl.map((i: any) => ({ name: i.name, note: i.note })),
          byOthersItems: others.map((i: any) => ({ name: i.name, note: i.note })),
          clarifications: resolvedClarifications.map((c: any) => ({ text: c.text })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAiExclusionsError(err?.error ?? "Failed to generate exclusions — please try again.");
        return;
      }
      const data = await res.json();
      if (!data.text) {
        setAiExclusionsError("AI returned an empty response. Please try again.");
        return;
      }
      setAiExclusionsText(data.text);
    } catch {
      setAiExclusionsError("Failed to generate exclusions — check your connection and try again.");
    } finally {
      setAiExclusionsLoading(false);
    }
  };

  const handleAddClarification = useCallback(async () => {
    const text = newClarText.trim();
    if (!text) return;
    if (isDemo) {
      setDemoClarifications(prev => [...prev, { _id: `demo_c_${Date.now()}`, text, createdAt: Date.now() }]);
    } else if (isValidConvexId && userId) {
      await addClarification({ projectId: projectId as Id<"bidshield_projects">, userId, text });
    }
    setNewClarText("");
  }, [newClarText, isDemo, isValidConvexId, userId, projectId, addClarification]);

  const handleDeleteClarification = useCallback(async (id: string) => {
    if (isDemo) {
      setDemoClarifications(prev => prev.filter(c => c._id !== id));
    } else {
      await deleteClarification({ id: id as Id<"bidshield_scope_clarifications"> });
    }
  }, [isDemo, deleteClarification]);

  const handleInitialize = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    await initScope({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      items: DEFAULT_SCOPE_ITEMS.map(i => ({ category: i.category, name: i.name, sortOrder: i.sortOrder })),
    });
  }, [isDemo, isValidConvexId, userId, projectId, initScope]);

  // Empty state
  if (items.length === 0 && !isDemo) {
    return (
      <div className="text-center py-16">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--bs-bg-elevated)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: "var(--bs-text-primary)" }}>No scope items yet</h3>
        <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Generate 40 common roofing scope items to review</p>
        <button
          onClick={handleInitialize}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
          Generate Scope Items
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── STATS BAR ── */}
      <div
        className="flex items-center overflow-hidden"
        style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}
      >
        {[
          { label: "Total", value: String(totalCount), color: "var(--bs-text-primary)" },
          { label: "Decided", value: `${decidedPct}%`, color: decidedPct === 100 ? "var(--bs-teal)" : decidedPct > 50 ? "var(--bs-amber)" : "var(--bs-red)" },
          { label: "Included", value: String(includedCount), color: "var(--bs-teal)" },
          { label: "Excluded", value: String(excludedCount), color: "var(--bs-red)" },
          { label: "By Others", value: String(byOthersCount), color: "var(--bs-blue)" },
          ...(unaddressedCount > 0 ? [{ label: "Undecided", value: String(unaddressedCount), color: "var(--bs-text-muted)" }] : []),
          ...(includedCost > 0 ? [{ label: "Included Cost", value: `$${includedCost >= 1000 ? `${(includedCost/1000).toFixed(0)}K` : includedCost.toLocaleString()}`, color: "var(--bs-teal)" }] : []),
        ].map(({ label, value, color }, i, arr) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center px-6 py-3.5 flex-1"
            style={{ borderRight: i < arr.length - 1 ? "1px solid var(--bs-border)" : "none" }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-widest mb-1"
              style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}
            >
              {label}
            </span>
            <span className="text-xl font-medium tabular-nums leading-none" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR: filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div style={{ display: "flex", gap: 2, background: "var(--bs-bg-elevated)", padding: 3, borderRadius: 8 }}>
          {FILTERS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="cursor-pointer transition-all"
              style={{
                height: 28, padding: "0 11px", borderRadius: 6, fontSize: 12,
                fontWeight: filter === id ? 500 : 400,
                background: filter === id ? "var(--bs-bg-card)" : "transparent",
                color: filter === id ? "var(--bs-text-primary)" : "var(--bs-text-muted)",
                border: filter === id ? "1px solid var(--bs-border)" : "1px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {label} {count > 0 && <span style={{ opacity: 0.55 }}>({count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCOPE TABLE ── */}
      {filteredItems.length === 0 ? (
        <div
          className="text-center py-12 text-sm"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10, color: "var(--bs-text-dim)" }}
        >
          No items match this filter
        </div>
      ) : (
        <div style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10, overflow: "hidden" }}>
          {Array.from(groups.entries()).map(([category, catItems], groupIdx) => (
            <div key={category} style={{ borderTop: groupIdx > 0 ? "1px solid var(--bs-border)" : "none" }}>
              {/* Category header */}
              <div
                className="px-5 py-2 flex items-center gap-2 sticky top-[44px] z-10"
                style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}
              >
                <span
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}
                >
                  {category}
                </span>
                <span className="text-[10px] font-medium" style={{ color: "var(--bs-text-dim)" }}>{catItems.length}</span>
                {catItems.filter((i: any) => i.status === "unaddressed").length > 0 && (
                  <span className="ml-auto text-[11px] font-medium" style={{ color: "var(--bs-amber)" }}>
                    {catItems.filter((i: any) => i.status === "unaddressed").length} undecided
                  </span>
                )}
              </div>

              {/* Rows */}
              {catItems.map((item: any, idx: number) => {
                const status      = item.status as ScopeStatus;
                const isExpanded  = expandedId === item._id;
                const dotOpt      = PILL_OPTIONS.find(o => o.value === status);
                const dotColor    = dotOpt ? dotOpt.color : "var(--bs-text-dim)";

                return (
                  <div key={item._id}>
                    {/* Main row */}
                    <div
                      className="flex items-center gap-3 transition-colors cursor-pointer"
                      style={{
                        minHeight: 44,
                        padding: "0 16px",
                        borderTop: idx > 0 ? "1px solid var(--bs-border)" : undefined,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    >
                      {/* Status dot */}
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />

                      {/* Item name */}
                      <span className="flex-1 min-w-0 text-[13px] select-none" style={{ color: "var(--bs-text-secondary)" }}>
                        {item.name}
                      </span>

                      {/* Note preview */}
                      {item.note && !isExpanded && (
                        <span
                          className="hidden md:block text-[11px] shrink-0 max-w-[140px] truncate"
                          style={{ color: "var(--bs-text-dim)" }}
                        >
                          {item.note}
                        </span>
                      )}

                      {/* Cost badge */}
                      {item.cost > 0 && (
                        <span className="text-[11px] font-medium shrink-0" style={{ color: "var(--bs-teal)" }}>
                          ${item.cost.toLocaleString()}
                        </span>
                      )}

                      {/* Segmented pill */}
                      <div className="shrink-0" onClick={e => e.stopPropagation()}>
                        <SegmentedPill value={status} onChange={(val) => handleStatusChange(item, val)} />
                      </div>
                    </div>

                    {/* Expanded: cost + note */}
                    {isExpanded && (
                      <div
                        className="flex flex-wrap gap-3 items-center"
                        style={{
                          padding: "10px 16px 10px 32px",
                          background: "var(--bs-bg-elevated)",
                          borderTop: "1px solid var(--bs-border)",
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {status === "included" && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>Cost $</span>
                            <input
                              type="number"
                              defaultValue={item.cost || ""}
                              placeholder="0"
                              onBlur={e => handleCostChange(item, e.target.value)}
                              className="w-24 text-[13px] font-medium rounded-md px-2 py-1 focus:outline-none"
                              style={{
                                background: "var(--bs-bg-input)",
                                border: "1px solid var(--bs-border)",
                                color: "var(--bs-teal)",
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          defaultValue={item.note || ""}
                          placeholder="Add note..."
                          onBlur={e => handleNoteChange(item, e.target.value)}
                          className="flex-1 min-w-[160px] text-[12px] rounded-md px-2 py-1 focus:outline-none"
                          style={{
                            background: "var(--bs-bg-input)",
                            border: "1px solid var(--bs-border)",
                            color: "var(--bs-text-muted)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Clarifications & Assumptions */}
      <div style={{ border: "1px solid var(--bs-border)", borderRadius: 10, overflow: "hidden" }}>
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}
        >
          <div>
            <span className="text-[13px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Clarifications &amp; Assumptions</span>
            <span className="ml-2 text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{resolvedClarifications.length} entries</span>
          </div>
          {!isPro && !isDemo && (
            <a href="/bidshield/pricing" className="text-[11px] font-medium" style={{ color: "var(--bs-teal)", textDecoration: "none" }}>
              Pro feature · Upgrade →
            </a>
          )}
        </div>

        {!isPro && !isDemo ? (
          <div className="p-6 text-center" style={{ background: "var(--bs-bg-card)" }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--bs-bg-elevated)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--bs-text-primary)" }}>Clarifications &amp; Assumptions</p>
            <p className="text-xs mb-3" style={{ color: "var(--bs-text-muted)" }}>Document your scope assumptions to prevent change orders. Available on Pro.</p>
            <a
              href="/bidshield/pricing"
              className="inline-block px-4 py-2 text-xs font-medium rounded-lg transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Upgrade to Pro
            </a>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2" style={{ background: "var(--bs-bg-card)" }}>
            {resolvedClarifications.length === 0 && (
              <p className="text-xs py-2" style={{ color: "var(--bs-text-dim)" }}>No clarifications yet. Assumptions that aren&apos;t documented become change orders.</p>
            )}
            {resolvedClarifications.map((c: any) => (
              <div key={c._id} className="flex items-start gap-2 group">
                <span className="mt-0.5 text-[11px] shrink-0" style={{ color: "var(--bs-text-dim)" }}>•</span>
                <span className="flex-1 text-[13px] leading-snug" style={{ color: "var(--bs-text-secondary)" }}>{c.text}</span>
                <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => handleDeleteClarification(c._id)}
                  className="transition-colors text-[12px] shrink-0 opacity-0 group-hover:opacity-100"
                  style={{ color: "var(--bs-text-dim)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newClarText}
                onChange={e => setNewClarText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddClarification(); }}
                placeholder="e.g., Assume single-layer tear-off"
                className="flex-1 text-[13px] rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--bs-bg-input)",
                  border: "1px solid var(--bs-border)",
                  color: "var(--bs-text-secondary)",
                }}
              />
              <button
                onClick={handleAddClarification}
                disabled={!newClarText.trim()}
                className="px-3 py-2 text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40"
                style={{
                  background: "transparent",
                  border: "1px solid var(--bs-border)",
                  color: "var(--bs-text-muted)",
                }}
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(excludedCount > 0 || byOthersCount > 0 || resolvedClarifications.length > 0) && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopyExclusions}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
            style={{
              background: "var(--bs-bg-card)",
              border: "1px solid var(--bs-border)",
              color: "var(--bs-text-muted)",
            }}
          >
            {copiedExclusions ? "Copied to clipboard" : "Copy exclusions for proposal"}
          </button>

          {(isPro || isDemo) ? (
            <button
              onClick={handleGenerateExclusions}
              disabled={aiExclusionsLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {aiExclusionsLoading ? "Generating..." : "Generate Exclusions with AI"}
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-center block transition-all"
              style={{
                background: "var(--bs-bg-elevated)",
                border: "1px solid var(--bs-border)",
                color: "var(--bs-text-dim)",
                textDecoration: "none",
              }}
            >
              Generate Exclusions with AI · Pro
            </a>
          )}
        </div>
      )}

      {/* AI Exclusions error */}
      {aiExclusionsError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "var(--bs-red-dim)",
            border: "1px solid var(--bs-red-border)",
            color: "var(--bs-red)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="flex-1">{aiExclusionsError}</span>
          <button
            onClick={() => setAiExclusionsError(null)}
            className="font-medium text-xs shrink-0"
            style={{ color: "var(--bs-red)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Exclusions result */}
      {aiExclusionsText && (
        <div
          className="rounded-lg p-4"
          style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: "var(--bs-teal)" }}>AI-Generated Exclusions</span>
            <button
              onClick={() => { navigator.clipboard.writeText(aiExclusionsText); }}
              className="text-[11px] font-medium"
              style={{ color: "var(--bs-teal)" }}
            >
              Copy
            </button>
          </div>
          <pre className="text-[13px] whitespace-pre-wrap leading-relaxed font-sans" style={{ color: "var(--bs-text-secondary)" }}>{aiExclusionsText}</pre>
        </div>
      )}
    </div>
  );
}
