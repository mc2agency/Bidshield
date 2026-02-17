"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { DEFAULT_SCOPE_ITEMS } from "@/lib/bidshield/scope-defaults";
import { DEMO_SCOPE_ITEMS } from "@/lib/bidshield/demo-data";

type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";

const STATUS_OPTIONS: { value: ScopeStatus; label: string; emoji: string; bg: string; border: string; text: string }[] = [
  { value: "included", label: "Included", emoji: "✓", bg: "bg-emerald-500", border: "border-emerald-500", text: "text-white" },
  { value: "excluded", label: "Excluded", emoji: "✗", bg: "bg-red-500", border: "border-red-500", text: "text-white" },
  { value: "by_others", label: "By Others", emoji: "→", bg: "bg-blue-500", border: "border-blue-500", text: "text-white" },
  { value: "na", label: "N/A", emoji: "—", bg: "bg-slate-400", border: "border-slate-400", text: "text-white" },
];

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  included: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  excluded: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
  by_others: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  na: { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-500" },
};

export default function ScopeTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const initScope = useMutation(api.bidshield.initScopeItems);
  const updateItem = useMutation(api.bidshield.updateScopeItem);

  const [demoState, setDemoState] = useState<any[]>(DEMO_SCOPE_ITEMS);
  const [lastAction, setLastAction] = useState<{ id: string; status: string } | null>(null);
  const [view, setView] = useState<"decide" | "review">("decide");
  const [copiedExclusions, setCopiedExclusions] = useState(false);
  const costTimerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const items = isDemo ? demoState : (scopeItems ?? []);

  // Stats
  const unaddressed = items.filter((i: any) => i.status === "unaddressed");
  const addressed = items.filter((i: any) => i.status !== "unaddressed");
  const included = items.filter((i: any) => i.status === "included");
  const excluded = items.filter((i: any) => i.status === "excluded");
  const byOthers = items.filter((i: any) => i.status === "by_others");
  const naItems = items.filter((i: any) => i.status === "na");
  const totalCount = items.length;
  const addressedPct = totalCount > 0 ? Math.round((addressed.length / totalCount) * 100) : 0;
  const includedCost = included.reduce((sum: number, i: any) => sum + (i.cost || 0), 0);

  // Handlers
  const handleStatusChange = useCallback(async (item: any, newStatus: ScopeStatus) => {
    const status = item.status === newStatus ? "unaddressed" : newStatus;
    setLastAction({ id: item._id, status });
    setTimeout(() => setLastAction(null), 600);
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
    const existing = costTimerRefs.current.get(id);
    if (existing) clearTimeout(existing);
    costTimerRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, cost });
      costTimerRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleNoteChange = useCallback((item: any, value: string) => {
    if (isDemo) { setDemoState(prev => prev.map(i => i._id === item._id ? { ...i, note: value } : i)); return; }
    const id = item._id as string;
    const existing = costTimerRefs.current.get(id);
    if (existing) clearTimeout(existing);
    costTimerRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, note: value });
      costTimerRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleCopyExclusions = () => {
    const lines: string[] = [];
    if (excluded.length > 0) { lines.push("EXCLUSIONS:"); excluded.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`)); }
    if (byOthers.length > 0) { if (lines.length) lines.push(""); lines.push("BY OTHERS:"); byOthers.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`)); }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedExclusions(true);
    setTimeout(() => setCopiedExclusions(false), 2000);
  };

  const handleInitialize = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    await initScope({ projectId: projectId as Id<"bidshield_projects">, userId, items: DEFAULT_SCOPE_ITEMS.map(i => ({ category: i.category, name: i.name, sortOrder: i.sortOrder })) });
  }, [isDemo, isValidConvexId, userId, projectId, initScope]);

  // Empty state
  if (items.length === 0 && !isDemo) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No scope items yet</h3>
        <p className="text-sm text-slate-500 mb-6">Generate 40 common roofing scope items to review</p>
        <button onClick={handleInitialize} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">Generate Scope Items</button>
      </div>
    );
  }

  // All done
  if (unaddressed.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-bold text-emerald-800">All {totalCount} scope items addressed</div>
          <div className="text-sm text-emerald-600 mt-1">{included.length} included · {excluded.length} excluded · {byOthers.length} by others · {naItems.length} N/A</div>
          {includedCost > 0 && <div className="text-lg font-bold text-emerald-700 mt-3">${includedCost.toLocaleString()} scope cost</div>}
        </div>
        <ReviewList items={addressed} onStatusChange={handleStatusChange} onCostChange={handleCostChange} onNoteChange={handleNoteChange} lastAction={lastAction} />
        {(excluded.length > 0 || byOthers.length > 0) && (
          <button onClick={handleCopyExclusions} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 active:scale-[0.98]">
            {copiedExclusions ? "✓ Copied to clipboard" : "📋 Copy exclusions for proposal"}
          </button>
        )}
      </div>
    );
  }

  // ── MAIN UI ──
  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div><span className="text-2xl font-bold text-slate-900">{unaddressed.length}</span><span className="text-sm text-slate-500 ml-1.5">items left</span></div>
        <div className="text-right"><span className="text-sm font-semibold text-emerald-600">{addressedPct}%</span><span className="text-xs text-slate-400 ml-1">done</span></div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${addressedPct}%` }} />
      </div>

      {/* Chips */}
      <div className="flex gap-2 flex-wrap">
        {included.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">{included.length} included</span>}
        {excluded.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium">{excluded.length} excluded</span>}
        {byOthers.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{byOthers.length} by others</span>}
        {naItems.length > 0 && <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{naItems.length} N/A</span>}
      </div>

      {/* Tab toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1">
        <button onClick={() => setView("decide")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === "decide" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Decide ({unaddressed.length})
        </button>
        <button onClick={() => setView("review")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === "review" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
          Reviewed ({addressed.length})
        </button>
      </div>

      {view === "decide" ? (
        <div className="flex flex-col gap-3">
          {unaddressed.map((item: any) => (
            <div key={item._id} className={`bg-white rounded-2xl border-2 border-slate-100 p-4 transition-all duration-300 ${lastAction?.id === item._id ? "scale-95 opacity-50" : ""}`}>
              <div className="text-base font-semibold text-slate-900 mb-3">{item.name}</div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => handleStatusChange(item, opt.value)}
                    className={`py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${opt.bg} ${opt.text} border-2 ${opt.border}`}>
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ReviewList items={addressed} onStatusChange={handleStatusChange} onCostChange={handleCostChange} onNoteChange={handleNoteChange} lastAction={lastAction} />
      )}

      {(excluded.length > 0 || byOthers.length > 0) && view === "review" && (
        <button onClick={handleCopyExclusions} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 active:scale-[0.98]">
          {copiedExclusions ? "✓ Copied to clipboard" : "📋 Copy exclusions for proposal"}
        </button>
      )}
      {includedCost > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">Included scope cost</span>
          <span className="text-lg font-bold text-emerald-600">${includedCost.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// REVIEW LIST
// ═══════════════════════════════════════════
function ReviewList({ items, onStatusChange, onCostChange, onNoteChange, lastAction }: {
  items: any[]; onStatusChange: (item: any, status: ScopeStatus) => void;
  onCostChange: (item: any, value: string) => void; onNoteChange: (item: any, value: string) => void;
  lastAction: { id: string; status: string } | null;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = { included: [], excluded: [], by_others: [], na: [] };
    for (const item of items) g[item.status]?.push(item);
    return g;
  }, [items]);

  const sections = [
    { status: "included", label: "Included", items: grouped.included },
    { status: "excluded", label: "Excluded", items: grouped.excluded },
    { status: "by_others", label: "By Others", items: grouped.by_others },
    { status: "na", label: "N/A", items: grouped.na },
  ].filter(s => s.items.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {sections.map(({ status, label, items: sectionItems }) => {
        const colors = STATUS_COLORS[status];
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{label} ({sectionItems.length})</span>
            </div>
            <div className="flex flex-col gap-1">
              {sectionItems.map((item: any) => {
                const isExpanded = expandedId === item._id;
                const justActed = lastAction?.id === item._id;
                return (
                  <div key={item._id} className={`rounded-xl border transition-all duration-300 ${justActed ? "ring-2 ring-emerald-400" : ""} ${colors.bg} border-transparent`}>
                    <button onClick={() => setExpandedId(isExpanded ? null : item._id)} className="w-full text-left px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 flex-1">{item.name}</span>
                      {item.cost > 0 && <span className="text-xs font-semibold text-emerald-600">${item.cost.toLocaleString()}</span>}
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 flex flex-col gap-2">
                        {item.note && <p className="text-xs text-slate-500 italic">{item.note}</p>}
                        <div className="flex gap-1.5">
                          {STATUS_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => onStatusChange(item, opt.value)}
                              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95 border ${
                                item.status === opt.value ? `${opt.bg} ${opt.text} ${opt.border}` : "bg-white border-slate-200 text-slate-400"
                              }`}>{opt.label}</button>
                          ))}
                        </div>
                        {item.status === "included" && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">$</span>
                            <input type="number" defaultValue={item.cost || ""} placeholder="Cost"
                              onBlur={(e) => onCostChange(item, e.target.value)}
                              className="w-28 text-sm text-emerald-600 font-medium rounded-lg px-2 py-1.5 border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          </div>
                        )}
                        <input type="text" defaultValue={item.note || ""} placeholder="Add note..."
                          onBlur={(e) => onNoteChange(item, e.target.value)}
                          className="text-xs text-slate-500 rounded-lg px-2 py-1.5 border border-slate-200 focus:border-slate-400 focus:outline-none" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
