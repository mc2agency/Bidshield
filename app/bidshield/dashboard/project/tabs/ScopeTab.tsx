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
  bg: string;
}[] = [
  { value: "included",  label: "Included",  short: "Inc",    bg: "#10b981" },
  { value: "excluded",  label: "Excluded",  short: "Exc",    bg: "#ef4444" },
  { value: "by_others", label: "By Others", short: "Others", bg: "#3b82f6" },
  { value: "na",        label: "N/A",       short: "N/A",    bg: "#94a3b8" },
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
      style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}
    >
      {PILL_OPTIONS.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={(e) => { e.stopPropagation(); onChange(opt.value); }}
            className="transition-all active:opacity-80"
            style={{
              height: 30,
              padding: "0 10px",
              fontSize: 12,
              fontWeight: isSelected ? 600 : 400,
              background: isSelected ? opt.bg : "transparent",
              color: isSelected ? "#ffffff" : "#94a3b8",
              borderLeft: i > 0 ? "1px solid #e2e8f0" : "none",
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
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No scope items yet</h3>
        <p className="text-sm text-slate-500 mb-6">Generate 40 common roofing scope items to review</p>
        <button
          onClick={handleInitialize}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
        >
          Generate Scope Items
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Stat line + progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-slate-500">
            {totalCount} items
            {" · "}
            <span className="font-medium text-slate-700">{decidedPct}% decided</span>
            {includedCost > 0 && (
              <>
                {" · "}
                <span className="text-emerald-600 font-medium">${includedCost.toLocaleString()} included</span>
              </>
            )}
          </span>
          <div className="flex gap-2 text-[11px] font-medium">
            {includedCount > 0  && <span style={{ color: "#10b981" }}>{includedCount} in</span>}
            {excludedCount > 0  && <span style={{ color: "#ef4444" }}>{excludedCount} out</span>}
            {byOthersCount > 0  && <span style={{ color: "#3b82f6" }}>{byOthersCount} others</span>}
            {naCount > 0        && <span style={{ color: "#94a3b8" }}>{naCount} N/A</span>}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${decidedPct}%` }}
          />
        </div>
      </div>

      {/* Filter tabs — segmented control (Linear/Vercel pattern) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, background: "#f3f4f6", padding: 4, borderRadius: 8 }}>
        {FILTERS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              height: 30,
              padding: "0 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: filter === id ? 500 : 400,
              background: filter === id ? "#ffffff" : "transparent",
              color: filter === id ? "#111827" : "#6b7280",
              boxShadow: filter === id ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No items match this filter
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from(groups.entries()).map(([category, catItems]) => (
            <div key={category} className="rounded-lg overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              {/* Category header */}
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                <span className="text-[11px] text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">{catItems.length} items</span>
              </div>

              {/* Rows */}
              {catItems.map((item: any, idx: number) => {
                const status      = item.status as ScopeStatus;
                const isExpanded  = expandedId === item._id;
                const dotColor    = status === "included"  ? "#10b981"
                                  : status === "excluded"  ? "#ef4444"
                                  : status === "by_others" ? "#3b82f6"
                                  : status === "na"        ? "#94a3b8"
                                  : "#cbd5e1";

                return (
                  <div key={item._id}>
                    {/* Main row — 44px */}
                    <div
                      className="flex items-center gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                      style={{
                        minHeight: 44,
                        padding: "0 16px",
                        borderTop: idx > 0 ? "1px solid #e2e8f0" : undefined,
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    >
                      {/* Status dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: dotColor }}
                      />

                      {/* Item name */}
                      <span className="flex-1 min-w-0 text-[14px] select-none" style={{ color: "#0f172a" }}>
                        {item.name}
                      </span>

                      {/* Note preview — desktop only */}
                      {item.note && !isExpanded && (
                        <span className="hidden md:block text-[11px] text-slate-400 shrink-0 max-w-[140px] truncate">
                          {item.note}
                        </span>
                      )}

                      {/* Cost badge */}
                      {item.cost > 0 && (
                        <span className="text-[11px] font-medium shrink-0" style={{ color: "#10b981" }}>
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
                          background: "#f8fafc",
                          borderTop: "1px solid #e2e8f0",
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {status === "included" && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-slate-400">Cost $</span>
                            <input
                              type="number"
                              defaultValue={item.cost || ""}
                              placeholder="0"
                              onBlur={e => handleCostChange(item, e.target.value)}
                              className="w-24 text-[13px] font-medium rounded-md px-2 py-1 border border-slate-200 focus:border-emerald-400 focus:outline-none"
                              style={{ color: "#10b981" }}
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          defaultValue={item.note || ""}
                          placeholder="Add note..."
                          onBlur={e => handleNoteChange(item, e.target.value)}
                          className="flex-1 min-w-[160px] text-[12px] text-slate-500 rounded-md px-2 py-1 border border-slate-200 focus:border-slate-400 focus:outline-none"
                          style={{ background: "white" }}
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
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <span className="text-[13px] font-semibold text-slate-700">Clarifications &amp; Assumptions</span>
            <span className="ml-2 text-[11px] text-slate-400">{resolvedClarifications.length} entries</span>
          </div>
          {!isPro && !isDemo && (
            <a href="/bidshield/pricing" className="text-[11px] font-medium text-emerald-600 hover:text-emerald-500">
              Pro feature · Upgrade →
            </a>
          )}
        </div>

        {!isPro && !isDemo ? (
          <div className="p-6 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm font-medium text-slate-700 mb-1">Clarifications &amp; Assumptions</p>
            <p className="text-xs text-slate-500 mb-3">Document your scope assumptions to prevent change orders. Available on Pro.</p>
            <a href="/bidshield/pricing" className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Upgrade to Pro
            </a>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2">
            {resolvedClarifications.length === 0 && (
              <p className="text-xs text-slate-400 py-2">No clarifications yet. Assumptions that aren&apos;t documented become change orders.</p>
            )}
            {resolvedClarifications.map((c: any) => (
              <div key={c._id} className="flex items-start gap-2 group">
                <span className="mt-0.5 text-slate-300 text-[11px] shrink-0">•</span>
                <span className="flex-1 text-[13px] text-slate-700 leading-snug">{c.text}</span>
                <span className="text-[10px] text-slate-300 shrink-0 mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => handleDeleteClarification(c._id)}
                  className="text-slate-300 hover:text-red-400 transition-colors text-[12px] shrink-0 opacity-0 group-hover:opacity-100"
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
                className="flex-1 text-[13px] rounded-lg px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none"
                style={{ background: "white" }}
              />
              <button
                onClick={handleAddClarification}
                disabled={!newClarText.trim()}
                className="px-3 py-2 text-[12px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
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
            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            {copiedExclusions ? "✓ Copied to clipboard" : "📋 Copy exclusions for proposal"}
          </button>

          {(isPro || isDemo) ? (
            <button
              onClick={handleGenerateExclusions}
              disabled={aiExclusionsLoading}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)", color: "white" }}
            >
              {aiExclusionsLoading ? "✨ Generating..." : "✨ Generate Exclusions with AI"}
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="w-full py-3 rounded-xl text-sm font-medium text-center block transition-all"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8" }}
            >
              🔒 Generate Exclusions with AI · Pro
            </a>
          )}
        </div>
      )}

      {/* AI Exclusions error */}
      {aiExclusionsError && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <span className="flex-1">{aiExclusionsError}</span>
          <button onClick={() => setAiExclusionsError(null)} className="text-red-500 hover:text-red-700 font-medium text-xs shrink-0">Dismiss</button>
        </div>
      )}

      {/* AI Exclusions result */}
      {aiExclusionsText && (
        <div className="rounded-xl p-4 border border-emerald-200" style={{ background: "#f0fdf4" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-700">✨ AI-Generated Exclusions</span>
            <button
              onClick={() => { navigator.clipboard.writeText(aiExclusionsText); }}
              className="text-[11px] text-emerald-600 hover:text-emerald-500 font-medium"
            >
              Copy
            </button>
          </div>
          <pre className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{aiExclusionsText}</pre>
        </div>
      )}
    </div>
  );
}
