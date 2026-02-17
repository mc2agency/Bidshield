"use client";
import { DEMO_SCOPE_ITEMS as IMPORTED_SCOPE } from "@/lib/bidshield/demo-data";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { SCOPE_CATEGORIES, DEFAULT_SCOPE_ITEMS, type ScopeCategory } from "@/lib/bidshield/scope-defaults";

type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";

// Use centralized demo data
const DEMO_SCOPE_ITEMS_DATA = IMPORTED_SCOPE;

const STATUS_BUTTONS: { value: ScopeStatus; label: string; icon: string; activeClass: string }[] = [
  { value: "included", label: "Included", icon: "✅", activeClass: "bg-emerald-50 border-emerald-500 text-emerald-600" },
  { value: "excluded", label: "Excluded", icon: "❌", activeClass: "bg-red-50 border-red-500 text-red-600" },
  { value: "by_others", label: "By Others", icon: "🔵", activeClass: "bg-blue-50 border-blue-500 text-blue-600" },
  { value: "na", label: "N/A", icon: "—", activeClass: "bg-slate-200/20 border-slate-500 text-slate-500" },
];

export default function ScopeTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const initScope = useMutation(api.bidshield.initScopeItems);
  const updateItem = useMutation(api.bidshield.updateScopeItem);
  const addCustomItem = useMutation(api.bidshield.addCustomScopeItem);
  const deleteItem = useMutation(api.bidshield.deleteScopeItem);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<ScopeStatus | "all">("all");
  const [sortMode, setSortMode] = useState<"default" | "unaddressed_first">("unaddressed_first");
  const [isInitializing, setIsInitializing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedExclusions, setCopiedExclusions] = useState(false);
  const [demoScopeState, setDemoScopeState] = useState<any[]>(DEMO_SCOPE_ITEMS_DATA);

  // Debounced save refs (keyed by item ID to avoid cross-item cancellation)
  const costTimerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const noteTimerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const items = isDemo ? demoScopeState : (scopeItems ?? []);

  // Summary stats
  const totalCount = items.length;
  const includedItems = items.filter((i: any) => i.status === "included");
  const excludedItems = items.filter((i: any) => i.status === "excluded");
  const byOthersItems = items.filter((i: any) => i.status === "by_others");
  const naItems = items.filter((i: any) => i.status === "na");
  const unaddressedItems = items.filter((i: any) => i.status === "unaddressed");
  const addressedCount = totalCount - unaddressedItems.length;
  const addressedPct = totalCount > 0 ? Math.round((addressedCount / totalCount) * 100) : 0;
  const includedCost = includedItems.reduce((sum: number, i: any) => sum + (i.cost || 0), 0);

  // Filtering & sorting
  const filteredItems = useMemo(() => {
    let filtered = filterStatus === "all" ? items : items.filter((i: any) => i.status === filterStatus);
    if (sortMode === "unaddressed_first") {
      filtered = [...filtered].sort((a: any, b: any) => {
        if (a.status === "unaddressed" && b.status !== "unaddressed") return -1;
        if (a.status !== "unaddressed" && b.status === "unaddressed") return 1;
        return a.sortOrder - b.sortOrder;
      });
    }
    return filtered;
  }, [items, filterStatus, sortMode]);

  // Group by category
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const item of filteredItems) {
      const cat = (item as any).category;
      if (!g[cat]) g[cat] = [];
      g[cat].push(item);
    }
    return g;
  }, [filteredItems]);

  // Category completion stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; addressed: number }> = {};
    for (const item of items) {
      const cat = (item as any).category;
      if (!stats[cat]) stats[cat] = { total: 0, addressed: 0 };
      stats[cat].total++;
      if ((item as any).status !== "unaddressed") stats[cat].addressed++;
    }
    return stats;
  }, [items]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Initialize scope items
  const handleInitialize = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    setIsInitializing(true);
    await initScope({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      items: DEFAULT_SCOPE_ITEMS.map((i) => ({
        category: i.category,
        name: i.name,
        sortOrder: i.sortOrder,
      })),
    });
    setIsInitializing(false);
  }, [isDemo, isValidConvexId, userId, projectId, initScope]);

  // Handle status change (instant save, toggle behavior)
  const handleStatusChange = async (item: any, newStatus: ScopeStatus) => {
    const status = item.status === newStatus ? "unaddressed" : newStatus;
    if (isDemo) {
      setDemoScopeState(prev => prev.map(i => i._id === item._id ? { ...i, status, cost: status !== "included" ? 0 : i.cost } : i));
      return;
    }
    const updates: any = { itemId: item._id, status };
    if (status !== "included") updates.cost = 0;
    await updateItem(updates);
  };

  // Debounced cost save
  const handleCostChange = (item: any, value: string) => {
    const cost = value ? parseFloat(value) : 0;
    if (isDemo) {
      setDemoScopeState(prev => prev.map(i => i._id === item._id ? { ...i, cost } : i));
      return;
    }
    const id = item._id as string;
    const existing = costTimerRefs.current.get(id);
    if (existing) clearTimeout(existing);
    costTimerRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, cost });
      costTimerRefs.current.delete(id);
    }, 600));
  };

  // Debounced note save
  const handleNoteChange = (item: any, value: string) => {
    if (isDemo) {
      setDemoScopeState(prev => prev.map(i => i._id === item._id ? { ...i, note: value } : i));
      return;
    }
    const id = item._id as string;
    const existing = noteTimerRefs.current.get(id);
    if (existing) clearTimeout(existing);
    noteTimerRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, note: value });
      noteTimerRefs.current.delete(id);
    }, 600));
  };

  // Build exclusions text for clipboard
  const buildExclusionsText = useCallback(() => {
    const lines: string[] = [];
    if (excludedItems.length > 0) {
      lines.push("EXCLUSIONS:");
      for (const item of excludedItems) {
        const i = item as any;
        lines.push(`- ${i.name}${i.note ? `: ${i.note}` : ""}`);
      }
    }
    if (byOthersItems.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("BY OTHERS:");
      for (const item of byOthersItems) {
        const i = item as any;
        lines.push(`- ${i.name}${i.note ? `: ${i.note}` : ""}`);
      }
    }
    return lines.join("\n");
  }, [excludedItems, byOthersItems]);

  const handleCopyExclusions = async () => {
    const text = buildExclusionsText();
    await navigator.clipboard.writeText(text);
    setCopiedExclusions(true);
    setTimeout(() => setCopiedExclusions(false), 2000);
  };

  // Empty state
  if (!isDemo && items.length === 0 && scopeItems !== undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-4xl">🔍</div>
        <h3 className="text-lg font-semibold text-slate-900">Scope Gap Checker</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          Auto-generate 40 common scope items to review. Address each item as Included, Excluded, By Others, or N/A before submitting your bid.
        </p>
        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className="px-6 py-3 bg-emerald-600 text-slate-900 rounded-lg font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {isInitializing ? "Generating..." : "Generate Scope Checklist"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Focused summary — what you're here to do */}
      {unaddressedItems.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-amber-800">
              {unaddressedItems.length} scope items need a decision
            </span>
            <span className="text-xs font-bold text-amber-600">{addressedPct}% addressed</span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${addressedPct >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${addressedPct}%` }} />
          </div>
          <p className="text-xs text-amber-700 mt-2">For each item: mark as Included, Excluded, By Others, or N/A</p>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-emerald-700">All scope items addressed ✓</div>
              <div className="text-xs text-emerald-600 mt-0.5">{includedItems.length} included · {excludedItems.length} excluded · {byOthersItems.length} by others</div>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-2">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ScopeStatus | "all")}
          className="bg-white text-xs text-slate-600 rounded-lg px-3 py-2 border border-slate-200 flex-1">
          <option value="all">All ({totalCount})</option>
          <option value="unaddressed">Unaddressed ({unaddressedItems.length})</option>
          <option value="included">Included ({includedItems.length})</option>
          <option value="excluded">Excluded ({excludedItems.length})</option>
          <option value="by_others">By Others ({byOthersItems.length})</option>
          <option value="na">N/A ({naItems.length})</option>
        </select>
        <button onClick={() => setShowAddModal(true)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500">+ Add</button>
      </div>

      {/* Scope Items by Category */}
      {Object.entries(grouped).map(([cat, catItems]) => {
        const catInfo = SCOPE_CATEGORIES[cat as ScopeCategory];
        const stats = categoryStats[cat];
        const isCollapsed = collapsedCategories.has(cat);
        const allDone = stats && stats.addressed === stats.total;

        return (
          <div key={cat} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-[10px] transition-transform ${isCollapsed ? "" : "rotate-90"}`}>&#9654;</span>
                <span className="text-sm">{catInfo?.icon}</span>
                <h3 className="text-xs font-semibold text-slate-800">{catInfo?.label}</h3>
              </div>
              <span className={`text-[10px] font-semibold ${allDone ? "text-emerald-600" : "text-amber-600"}`}>
                {stats?.addressed || 0}/{stats?.total || 0}
              </span>
            </button>

            {!isCollapsed && (
              <div className="border-t border-slate-200">
                {(catItems as any[]).map((item: any) => (
                  <ScopeItemRow
                    key={item._id}
                    item={item}
                    isDemo={isDemo}
                    onStatusChange={handleStatusChange}
                    onCostChange={handleCostChange}
                    onNoteChange={handleNoteChange}
                    onDelete={!item.isDefault && !isDemo ? () => deleteItem({ itemId: item._id }) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-10 text-slate-500">No items match this filter</div>
      )}

      {/* Exclusions Summary */}
      {(excludedItems.length > 0 || byOthersItems.length > 0) && (
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Exclusions Summary (for Proposal)</h3>
            <button
              onClick={handleCopyExclusions}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              {copiedExclusions ? "Copied!" : "📋 Copy"}
            </button>
          </div>

          {excludedItems.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-red-600 font-semibold mb-1.5">EXCLUDED from this bid:</div>
              <div className="space-y-1">
                {excludedItems.map((item: any) => (
                  <div key={item._id} className="text-sm text-slate-600">
                    &bull; {item.name}{item.note ? ` — ${item.note}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}

          {byOthersItems.length > 0 && (
            <div>
              <div className="text-xs text-blue-600 font-semibold mb-1.5">BY OTHERS:</div>
              <div className="space-y-1">
                {byOthersItems.map((item: any) => (
                  <div key={item._id} className="text-sm text-slate-600">
                    &bull; {item.name}{item.note ? ` — ${item.note}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Included Cost */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
        <span className="text-sm text-slate-500">Total Included Scope Cost:</span>
        <span className="text-lg font-bold text-emerald-600">${includedCost.toLocaleString()}</span>
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <AddScopeItemModal
          onAdd={async (category, name) => {
            if (isDemo || !isValidConvexId || !userId) return;
            await addCustomItem({
              projectId: projectId as Id<"bidshield_projects">,
              userId,
              category,
              name,
            });
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function ScopeItemRow({
  item,
  isDemo,
  onStatusChange,
  onCostChange,
  onNoteChange,
  onDelete,
}: {
  item: any;
  isDemo: boolean;
  onStatusChange: (item: any, status: ScopeStatus) => void;
  onCostChange: (item: any, value: string) => void;
  onNoteChange: (item: any, value: string) => void;
  onDelete?: () => void;
}) {
  const isUnaddressed = item.status === "unaddressed";
  const isIncluded = item.status === "included";

  return (
    <div className={`px-4 py-3 ${isUnaddressed ? "bg-amber-50/50" : ""}`}>
      {/* Item name */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm text-slate-800 font-medium">{item.name}</span>
          {!item.isDefault && <span className="text-[9px] bg-violet-50 text-violet-600 px-1 py-0.5 rounded shrink-0">Custom</span>}
        </div>
        {onDelete && (
          <button onClick={onDelete} className="text-red-600/40 hover:text-red-600 text-xs" title="Delete">×</button>
        )}
      </div>

      {/* Status buttons — full width, big tappable */}
      <div className="flex gap-1.5">
        {STATUS_BUTTONS.map((btn) => {
          const isActive = item.status === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => onStatusChange(item, btn.value)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                isActive
                  ? btn.activeClass
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 active:scale-95"
              }`}
            >
              {btn.icon} {btn.label}
            </button>
          );
        })}
      </div>

      {/* Cost + Note */}
      <div className="flex items-center gap-2 mt-2">
        {isIncluded && (
          <div className="flex items-center gap-0.5">
            <span className="text-xs text-slate-400">$</span>
            <input type="number" defaultValue={item.cost || ""} placeholder="0"
              onBlur={(e) => onCostChange(item, e.target.value)}
              className="w-20 bg-white text-sm text-emerald-600 text-right rounded-lg px-2 py-1 border border-slate-200 focus:border-emerald-500 focus:outline-none" />
          </div>
        )}
        <input type="text" defaultValue={item.note || ""} placeholder="Add note..."
          onBlur={(e) => onNoteChange(item, e.target.value)}
          className="flex-1 bg-transparent text-xs text-slate-500 placeholder:text-slate-300 px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-300 focus:outline-none" />
      </div>
    </div>
  );
}

function AddScopeItemModal({ onAdd, onClose }: { onAdd: (category: string, name: string) => void; onClose: () => void }) {
  const [category, setCategory] = useState<string>("general");
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Scope Item</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-xl">&times;</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm border border-slate-300"
            >
              {(Object.entries(SCOPE_CATEGORIES) as [ScopeCategory, { label: string; icon: string }][]).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Snow removal before install"
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm border border-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900">Cancel</button>
          <button
            onClick={() => name.trim() && onAdd(category, name.trim())}
            disabled={!name.trim()}
            className="px-4 py-2 bg-emerald-600 text-slate-900 text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
