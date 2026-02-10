"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { SCOPE_CATEGORIES, DEFAULT_SCOPE_ITEMS, type ScopeCategory } from "@/lib/bidshield/scope-defaults";

type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";

// === DEMO DATA (Harbor Point Tower ~65% addressed) ===
const DEMO_SCOPE_ITEMS = [
  // Included (12 items, $51,200 total)
  { _id: "ds_1", category: "demolition", name: "Demo / Tear-off of existing roof", status: "included" as ScopeStatus, cost: 28000, note: "Full tear-off to deck", isDefault: true, sortOrder: 1 },
  { _id: "ds_2", category: "demolition", name: "Dumpster / Debris disposal", status: "included" as ScopeStatus, cost: 4500, note: "3 pulls estimated", isDefault: true, sortOrder: 2 },
  { _id: "ds_5", category: "access", name: "Mobilization / Demobilization", status: "included" as ScopeStatus, cost: 3500, note: "", isDefault: true, sortOrder: 9 },
  { _id: "ds_6", category: "protection", name: "Temporary waterproofing", status: "included" as ScopeStatus, cost: 6200, note: "Phased work requires temp", isDefault: true, sortOrder: 10 },
  { _id: "ds_7", category: "flashing", name: "Penetration flashings (all)", status: "included" as ScopeStatus, cost: 0, note: "Included in membrane line item", isDefault: true, sortOrder: 18 },
  { _id: "ds_8", category: "flashing", name: "Parapet wall flashing / coping", status: "included" as ScopeStatus, cost: 0, note: "Included in edge metal", isDefault: true, sortOrder: 19 },
  { _id: "ds_9", category: "flashing", name: "Edge metal / Drip edge", status: "included" as ScopeStatus, cost: 0, note: "Included in materials tab", isDefault: true, sortOrder: 23 },
  { _id: "ds_10", category: "warranty", name: "Manufacturer warranty inspection fee", status: "included" as ScopeStatus, cost: 3000, note: "Carlisle NDL warranty", isDefault: true, sortOrder: 25 },
  { _id: "ds_11", category: "safety", name: "OSHA fall protection (guardrails, anchors)", status: "included" as ScopeStatus, cost: 4800, note: "Perimeter guardrails 4 weeks", isDefault: true, sortOrder: 29 },
  { _id: "ds_12", category: "general", name: "Permits", status: "included" as ScopeStatus, cost: 1200, note: "City of JC building permit", isDefault: true, sortOrder: 33 },
  { _id: "ds_13", category: "general", name: "Submittals / Shop drawings", status: "included" as ScopeStatus, cost: 0, note: "", isDefault: true, sortOrder: 36 },
  { _id: "ds_14", category: "general", name: "Punch list / Final cleanup", status: "included" as ScopeStatus, cost: 0, note: "", isDefault: true, sortOrder: 38 },

  // Excluded (4 items)
  { _id: "ds_20", category: "demolition", name: "Hazmat / Asbestos abatement", status: "excluded" as ScopeStatus, note: "Not expected per Phase I report", isDefault: true, sortOrder: 3 },
  { _id: "ds_21", category: "schedule", name: "Winter conditions premium", status: "excluded" as ScopeStatus, note: "Summer schedule", isDefault: true, sortOrder: 16 },
  { _id: "ds_22", category: "safety", name: "Safety netting / Debris containment", status: "excluded" as ScopeStatus, note: "Not required per spec", isDefault: true, sortOrder: 30 },
  { _id: "ds_23", category: "general", name: "Bonding (performance / payment)", status: "excluded" as ScopeStatus, note: "Not required", isDefault: true, sortOrder: 34 },

  // By Others (3 items)
  { _id: "ds_30", category: "access", name: "Crane / Hoist time", status: "by_others" as ScopeStatus, note: "GC providing per pre-bid meeting", isDefault: true, sortOrder: 5 },
  { _id: "ds_31", category: "protection", name: "Interior protection", status: "by_others" as ScopeStatus, note: "GC responsibility", isDefault: true, sortOrder: 11 },
  { _id: "ds_32", category: "flashing", name: "Counterflashing / reglet", status: "by_others" as ScopeStatus, note: "By sheet metal sub", isDefault: true, sortOrder: 20 },

  // N/A (2 items)
  { _id: "ds_40", category: "safety", name: "Hot work permits", status: "na" as ScopeStatus, note: "TPO — no torch work", isDefault: true, sortOrder: 32 },
  { _id: "ds_41", category: "safety", name: "Fire watch", status: "na" as ScopeStatus, note: "TPO — no torch work", isDefault: true, sortOrder: 31 },

  // Unaddressed (19 items)
  { _id: "ds_50", category: "demolition", name: "Wet insulation removal", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 4 },
  { _id: "ds_51", category: "access", name: "Roof access (ladder, stairs, hatch)", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 6 },
  { _id: "ds_52", category: "access", name: "Material staging area", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 7 },
  { _id: "ds_53", category: "access", name: "Material hoisting / conveyor", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 8 },
  { _id: "ds_54", category: "protection", name: "Vapor barrier", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 12 },
  { _id: "ds_55", category: "protection", name: "Dust / debris protection for occupied spaces", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 13 },
  { _id: "ds_56", category: "schedule", name: "Phasing / Sequencing plan", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 14 },
  { _id: "ds_57", category: "schedule", name: "After-hours / Weekend premium", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 15 },
  { _id: "ds_58", category: "schedule", name: "Occupied building restrictions", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 17 },
  { _id: "ds_59", category: "flashing", name: "Expansion joints / Area dividers", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 21 },
  { _id: "ds_60", category: "flashing", name: "Sheet metal gutters / Downspouts", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 22 },
  { _id: "ds_61", category: "flashing", name: "Scupper flashings", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 24 },
  { _id: "ds_62", category: "warranty", name: "Extended warranty upgrade", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 26 },
  { _id: "ds_63", category: "warranty", name: "Warranty-required details", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 27 },
  { _id: "ds_64", category: "warranty", name: "As-built documentation / Photos", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 28 },
  { _id: "ds_65", category: "general", name: "Insurance (additional insured)", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 35 },
  { _id: "ds_66", category: "general", name: "Project management / Supervision", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 37 },
  { _id: "ds_67", category: "general", name: "Testing (flood test, core cuts)", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 39 },
  { _id: "ds_68", category: "general", name: "Owner / GC-required meetings", status: "unaddressed" as ScopeStatus, isDefault: true, sortOrder: 40 },
];

const STATUS_BUTTONS: { value: ScopeStatus; label: string; icon: string; activeClass: string }[] = [
  { value: "included", label: "Included", icon: "✅", activeClass: "bg-emerald-500/20 border-emerald-500 text-emerald-400" },
  { value: "excluded", label: "Excluded", icon: "❌", activeClass: "bg-red-500/20 border-red-500 text-red-400" },
  { value: "by_others", label: "By Others", icon: "🔵", activeClass: "bg-blue-500/20 border-blue-500 text-blue-400" },
  { value: "na", label: "N/A", icon: "—", activeClass: "bg-slate-600/20 border-slate-500 text-slate-400" },
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

  // Debounced save refs
  const costTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = isDemo ? DEMO_SCOPE_ITEMS : (scopeItems ?? []);

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
    if (isDemo) return;
    const status = item.status === newStatus ? "unaddressed" : newStatus;
    // Clear cost when not included
    const updates: any = { itemId: item._id, status };
    if (status !== "included") updates.cost = 0;
    await updateItem(updates);
  };

  // Debounced cost save
  const handleCostChange = (item: any, value: string) => {
    if (isDemo) return;
    if (costTimerRef.current) clearTimeout(costTimerRef.current);
    costTimerRef.current = setTimeout(async () => {
      const cost = value ? parseFloat(value) : 0;
      await updateItem({ itemId: item._id, cost });
    }, 600);
  };

  // Debounced note save
  const handleNoteChange = (item: any, value: string) => {
    if (isDemo) return;
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(async () => {
      await updateItem({ itemId: item._id, note: value });
    }, 600);
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
        <h3 className="text-lg font-semibold text-white">Scope Gap Checker</h3>
        <p className="text-sm text-slate-400 text-center max-w-md">
          Auto-generate 40 common scope items to review. Address each item as Included, Excluded, By Others, or N/A before submitting your bid.
        </p>
        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {isInitializing ? "Generating..." : "Generate Scope Checklist"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">{includedItems.length}</div>
          <div className="text-[11px] text-slate-400">Included</div>
          <div className="text-xs text-emerald-400/70 mt-0.5">${includedCost.toLocaleString()}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-red-400">{excludedItems.length}</div>
          <div className="text-[11px] text-slate-400">Excluded</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-blue-400">{byOthersItems.length}</div>
          <div className="text-[11px] text-slate-400">By Others</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className={`text-2xl font-bold ${unaddressedItems.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {unaddressedItems.length > 0 ? unaddressedItems.length : "✓"}
          </div>
          <div className="text-[11px] text-slate-400">{unaddressedItems.length > 0 ? "Not Addressed" : "All Done"}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Progress: {addressedCount}/{totalCount} addressed</span>
          <span className={`text-sm font-bold ${addressedPct === 100 ? "text-emerald-400" : addressedPct >= 80 ? "text-amber-400" : "text-red-400"}`}>{addressedPct}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${addressedPct === 100 ? "bg-emerald-500" : addressedPct >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${addressedPct}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ScopeStatus | "all")}
          className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 border border-slate-700"
        >
          <option value="all">All ({totalCount})</option>
          <option value="unaddressed">Unaddressed ({unaddressedItems.length})</option>
          <option value="included">Included ({includedItems.length})</option>
          <option value="excluded">Excluded ({excludedItems.length})</option>
          <option value="by_others">By Others ({byOthersItems.length})</option>
          <option value="na">N/A ({naItems.length})</option>
        </select>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "default" | "unaddressed_first")}
          className="bg-slate-800 text-sm text-slate-300 rounded-lg px-3 py-2 border border-slate-700"
        >
          <option value="unaddressed_first">Unaddressed First</option>
          <option value="default">Default Order</option>
        </select>
        <button onClick={() => setShowAddModal(true)} className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition-colors">
          + Add Item
        </button>
      </div>

      {/* Scope Items by Category */}
      {Object.entries(grouped).map(([cat, catItems]) => {
        const catInfo = SCOPE_CATEGORIES[cat as ScopeCategory];
        const stats = categoryStats[cat];
        const isCollapsed = collapsedCategories.has(cat);
        const allDone = stats && stats.addressed === stats.total;

        return (
          <div key={cat} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs transition-transform ${isCollapsed ? "" : "rotate-90"}`}>&#9654;</span>
                <span className="text-base">{catInfo?.icon}</span>
                <h3 className="text-sm font-semibold text-white">{catInfo?.label}</h3>
              </div>
              <span className={`text-xs font-semibold ${allDone ? "text-emerald-400" : "text-amber-400"}`}>
                {allDone ? "✅" : "⚠"} {stats?.addressed || 0}/{stats?.total || 0}
              </span>
            </button>

            {!isCollapsed && (
              <div className="border-t border-slate-700/50">
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
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Exclusions Summary (for Proposal)</h3>
            <button
              onClick={handleCopyExclusions}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-600 transition-colors"
            >
              {copiedExclusions ? "Copied!" : "📋 Copy"}
            </button>
          </div>

          {excludedItems.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-red-400 font-semibold mb-1.5">EXCLUDED from this bid:</div>
              <div className="space-y-1">
                {excludedItems.map((item: any) => (
                  <div key={item._id} className="text-sm text-slate-300">
                    &bull; {item.name}{item.note ? ` — ${item.note}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}

          {byOthersItems.length > 0 && (
            <div>
              <div className="text-xs text-blue-400 font-semibold mb-1.5">BY OTHERS:</div>
              <div className="space-y-1">
                {byOthersItems.map((item: any) => (
                  <div key={item._id} className="text-sm text-slate-300">
                    &bull; {item.name}{item.note ? ` — ${item.note}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total Included Cost */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
        <span className="text-sm text-slate-400">Total Included Scope Cost:</span>
        <span className="text-lg font-bold text-emerald-400">${includedCost.toLocaleString()}</span>
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
    <div className={`px-5 py-3 border-l-3 ${isUnaddressed ? "border-l-amber-500/60 bg-amber-500/5" : "border-l-transparent"} hover:bg-slate-700/10`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* Name + unaddressed badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-200 truncate">{item.name}</span>
            {isUnaddressed && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-semibold shrink-0">UNADDRESSED</span>}
            {!item.isDefault && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded shrink-0">Custom</span>}
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {STATUS_BUTTONS.map((btn) => {
            const isActive = item.status === btn.value;
            return (
              <button
                key={btn.value}
                onClick={() => onStatusChange(item, btn.value)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-all ${
                  isActive
                    ? btn.activeClass
                    : "bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300"
                }`}
              >
                {btn.icon} {btn.label}
              </button>
            );
          })}
          {onDelete && (
            <button onClick={onDelete} className="text-red-400/40 hover:text-red-400 text-xs ml-1" title="Delete custom item">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Cost + Note row */}
      <div className="flex items-center gap-3 mt-1.5">
        {isIncluded && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">$</span>
            <input
              type="number"
              defaultValue={item.cost || ""}
              placeholder="0"
              onBlur={(e) => onCostChange(item, e.target.value)}
              className="w-20 bg-slate-700/50 text-sm text-emerald-400 text-right rounded px-2 py-0.5 border border-slate-600/50 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}
        <input
          type="text"
          defaultValue={item.note || ""}
          placeholder="Add a note..."
          onBlur={(e) => onNoteChange(item, e.target.value)}
          className="flex-1 bg-transparent text-[12px] text-slate-400 placeholder:text-slate-600 px-2 py-0.5 rounded border border-transparent hover:border-slate-700 focus:border-slate-600 focus:outline-none"
        />
      </div>
    </div>
  );
}

function AddScopeItemModal({ onAdd, onClose }: { onAdd: (category: string, name: string) => void; onClose: () => void }) {
  const [category, setCategory] = useState<string>("general");
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Add Scope Item</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-sm border border-slate-600"
            >
              {(Object.entries(SCOPE_CATEGORIES) as [ScopeCategory, { label: string; icon: string }][]).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Snow removal before install"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 text-sm border border-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
          <button
            onClick={() => name.trim() && onAdd(category, name.trim())}
            disabled={!name.trim()}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
