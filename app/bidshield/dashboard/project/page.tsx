"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";

const ASSEMBLY_TYPES = [
  "TPO 60mil Mechanically Attached",
  "TPO 60mil Fully Adhered",
  "TPO 80mil Mechanically Attached",
  "TPO 80mil Fully Adhered",
  "PVC 60mil Mechanically Attached",
  "PVC 60mil Fully Adhered",
  "Modified Bitumen 2-Ply (SBS)",
  "Modified Bitumen 3-Ply (SBS)",
  "Modified Bitumen (APP)",
  "EPDM 60mil",
  "Metal Roof Panels",
  "Metal Wall Panels",
  "Pavers / Ballast",
  "Green Roof",
  "Waterproofing / Below Grade",
  "Other",
];

const LOSS_REASONS = [
  "Price too high",
  "Scope issue",
  "Missed deadline",
  "GC preference",
  "Bonding issue",
  "Schedule conflict",
  "Incomplete bid",
  "Other",
];

// ===== TAKEOFF RECONCILIATION COMPONENT =====

type TakeoffSection = {
  _id: string;
  name: string;
  assemblyType: string;
  squareFeet: number;
  completed: boolean;
  notes?: string;
  sortOrder: number;
};

type LineItem = {
  _id: string;
  category: "linear" | "count";
  itemType: string;
  label: string;
  quantity?: number;
  unit: string;
  verified: boolean;
  notes?: string;
  sortOrder: number;
};

// Demo line items
const DEMO_LINEAR_ITEMS: LineItem[] = [
  { _id: "li_1", category: "linear", itemType: "parapet_wall", label: "Parapet Wall", quantity: 1240, unit: "LF", verified: true, sortOrder: 0 },
  { _id: "li_2", category: "linear", itemType: "coping", label: "Coping", quantity: 1240, unit: "LF", verified: true, sortOrder: 1 },
  { _id: "li_3", category: "linear", itemType: "edge_metal", label: "Edge Metal / Drip Edge", quantity: 680, unit: "LF", verified: true, sortOrder: 2 },
  { _id: "li_4", category: "linear", itemType: "counterflashing", label: "Counterflashing", quantity: 320, unit: "LF", verified: true, sortOrder: 3 },
  { _id: "li_5", category: "linear", itemType: "expansion_joint", label: "Expansion Joint", unit: "LF", verified: false, sortOrder: 4 },
  { _id: "li_6", category: "linear", itemType: "area_divider", label: "Area Divider", unit: "LF", verified: false, sortOrder: 5 },
  { _id: "li_7", category: "linear", itemType: "gutter", label: "Gutter", quantity: 450, unit: "LF", verified: false, sortOrder: 6 },
  { _id: "li_8", category: "linear", itemType: "gravel_stop", label: "Gravel Stop", unit: "LF", verified: false, sortOrder: 7 },
  { _id: "li_9", category: "linear", itemType: "reglet", label: "Reglet", unit: "LF", verified: false, sortOrder: 8 },
  { _id: "li_10", category: "linear", itemType: "base_flashing", label: "Base Flashing", unit: "LF", verified: false, sortOrder: 9 },
];

const DEMO_COUNT_ITEMS: LineItem[] = [
  { _id: "ci_1", category: "count", itemType: "pipe_penetration", label: "Pipe Penetrations", quantity: 24, unit: "EA", verified: true, sortOrder: 0 },
  { _id: "ci_2", category: "count", itemType: "roof_drain", label: "Roof Drains", quantity: 8, unit: "EA", verified: true, sortOrder: 1 },
  { _id: "ci_3", category: "count", itemType: "overflow_drain", label: "Overflow Drains", quantity: 4, unit: "EA", verified: true, sortOrder: 2 },
  { _id: "ci_4", category: "count", itemType: "scupper", label: "Scuppers", unit: "EA", verified: false, sortOrder: 3 },
  { _id: "ci_5", category: "count", itemType: "rtu_curb", label: "RTU / Equipment Curbs", quantity: 6, unit: "EA", verified: false, sortOrder: 4 },
  { _id: "ci_6", category: "count", itemType: "skylight", label: "Skylights", quantity: 0, unit: "EA", verified: false, notes: "none on this project", sortOrder: 5 },
  { _id: "ci_7", category: "count", itemType: "exhaust_fan", label: "Exhaust Fan Curbs", quantity: 3, unit: "EA", verified: false, sortOrder: 6 },
  { _id: "ci_8", category: "count", itemType: "pitch_pan", label: "Pitch Pans", unit: "EA", verified: false, sortOrder: 7 },
  { _id: "ci_9", category: "count", itemType: "hatch", label: "Roof Hatches", quantity: 2, unit: "EA", verified: false, sortOrder: 8 },
  { _id: "ci_10", category: "count", itemType: "vent", label: "Vents / Stacks", unit: "EA", verified: false, sortOrder: 9 },
  { _id: "ci_11", category: "count", itemType: "lightning_protection", label: "Lightning Protection Points", unit: "EA", verified: false, sortOrder: 10 },
];

// Line item table sub-component
function LineItemTable({
  title,
  unit,
  items,
  isDemo,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: {
  title: string;
  unit: string;
  items: LineItem[];
  isDemo: boolean;
  onUpdateItem: (id: string, updates: { quantity?: number; verified?: boolean; notes?: string }) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (label: string) => void;
}) {
  const verified = items.filter((i) => i.verified).length;
  const total = items.length;
  const allVerified = total > 0 && verified === total;
  const qtySum = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
  const unitLabel = unit === "EA" ? "items" : unit;

  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="mt-5">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold text-slate-300">{title} ({unit})</h4>
        <span className={`text-[11px] font-medium ${allVerified ? "text-emerald-400" : "text-amber-400"}`}>
          {verified} of {total} verified
        </span>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto mb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 border-b border-slate-700">
                <th className="text-left py-1.5 font-medium">Item</th>
                <th className="text-right py-1.5 font-medium w-24">{unit}</th>
                <th className="text-center py-1.5 font-medium w-16">Verified</th>
                <th className="text-left py-1.5 font-medium hidden sm:table-cell">Notes</th>
                <th className="text-right py-1.5 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const hasQty = item.quantity !== undefined && item.quantity !== null;
                const qtyColor = item.verified ? "text-emerald-400" : hasQty ? "text-amber-400" : "text-slate-500";
                return (
                  <tr key={item._id} className="border-b border-slate-700/50 group">
                    <td className="py-1.5 text-slate-200 text-xs">{item.label}</td>
                    <td className="py-1.5 text-right">
                      {editingQty === item._id ? (
                        <input
                          type="number"
                          value={qtyInput}
                          onChange={(e) => setQtyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = qtyInput.trim() === "" ? undefined : parseFloat(qtyInput);
                              onUpdateItem(item._id, { quantity: val !== undefined && !isNaN(val) ? val : undefined });
                              setEditingQty(null);
                            }
                            if (e.key === "Escape") setEditingQty(null);
                          }}
                          onBlur={() => {
                            const val = qtyInput.trim() === "" ? undefined : parseFloat(qtyInput);
                            onUpdateItem(item._id, { quantity: val !== undefined && !isNaN(val) ? val : undefined });
                            setEditingQty(null);
                          }}
                          className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-white text-xs w-20 text-right focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => { setEditingQty(item._id); setQtyInput(hasQty ? String(item.quantity) : ""); }}
                          className={`text-xs tabular-nums ${qtyColor} hover:text-white transition-colors`}
                        >
                          {hasQty ? item.quantity!.toLocaleString("en-US") : "—"}
                        </button>
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      <button
                        onClick={() => onUpdateItem(item._id, { verified: !item.verified })}
                        className="text-base"
                      >
                        {item.verified ? "✅" : "⬜"}
                      </button>
                    </td>
                    <td className="py-1.5 text-slate-500 text-[11px] hidden sm:table-cell">
                      {item.notes || ""}
                    </td>
                    <td className="py-1.5 text-right">
                      {item.itemType === "custom" && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onDeleteItem(item._id)} className="text-[11px] text-red-400 hover:text-red-300">Del</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-500 bg-slate-700">
                  <td className="py-2 text-white text-xs font-semibold">TOTAL</td>
                  <td className="py-2 text-right text-white text-xs font-semibold tabular-nums">
                    {qtySum.toLocaleString("en-US")} {unitLabel}
                  </td>
                  <td colSpan={3} className="py-2 text-center text-slate-400 text-[11px]">
                    {verified} of {total} verified
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {showAddForm ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newLabel.trim()) { onAddItem(newLabel.trim()); setNewLabel(""); setShowAddForm(false); }
              if (e.key === "Escape") setShowAddForm(false);
            }}
            placeholder={`Item name`}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-xs flex-1 focus:outline-none focus:border-amber-500"
            autoFocus
          />
          <button
            onClick={() => { if (newLabel.trim()) { onAddItem(newLabel.trim()); setNewLabel(""); setShowAddForm(false); } }}
            className="text-[11px] text-emerald-400 hover:text-emerald-300"
          >
            Add
          </button>
          <button onClick={() => setShowAddForm(false)} className="text-[11px] text-slate-500 hover:text-slate-300">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors mt-1"
        >
          + Add {title.split(" ")[0]} Item
        </button>
      )}
    </div>
  );
}

function TakeoffReconciliation({
  projectId,
  grossRoofArea,
  isDemo,
  userId,
}: {
  projectId: string;
  grossRoofArea: number | null;
  isDemo: boolean;
  userId: string | null | undefined;
}) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  // Area sections
  const sections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const updateProject = useMutation(api.bidshield.updateProject);
  const createSection = useMutation(api.bidshield.createTakeoffSection);
  const updateSection = useMutation(api.bidshield.updateTakeoffSection);
  const deleteSection = useMutation(api.bidshield.deleteTakeoffSection);

  // Line items (linear + count)
  const lineItems = useQuery(
    api.bidshield.getTakeoffLineItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const initLineItems = useMutation(api.bidshield.initTakeoffLineItems);
  const updateLineItem = useMutation(api.bidshield.updateTakeoffLineItem);
  const createLineItem = useMutation(api.bidshield.createTakeoffLineItem);
  const deleteLineItem = useMutation(api.bidshield.deleteTakeoffLineItem);

  // Auto-initialize line items on first load (non-demo)
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!isDemo && isValidConvexId && userId && lineItems !== undefined && lineItems.length === 0 && !initialized) {
      setInitialized(true);
      initLineItems({ projectId: projectId as Id<"bidshield_projects">, userId });
    }
  }, [isDemo, isValidConvexId, userId, lineItems, initialized, projectId, initLineItems]);

  // Demo data
  const demoSections: TakeoffSection[] = [
    { _id: "ts_1", name: "Main Roof Area A", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 22000, completed: true, sortOrder: 0 },
    { _id: "ts_2", name: "Main Roof Area B", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 12500, completed: true, sortOrder: 1 },
    { _id: "ts_3", name: "Mechanical Room", assemblyType: "Modified Bitumen 2-Ply (SBS)", squareFeet: 4200, completed: true, sortOrder: 2 },
    { _id: "ts_4", name: "Canopy", assemblyType: "Metal Roof Panels", squareFeet: 2800, completed: false, sortOrder: 3 },
  ];
  const demoGrossArea = 45000;

  const displaySections: TakeoffSection[] = isDemo ? demoSections : (sections ?? []) as TakeoffSection[];
  const controlNumber = isDemo ? demoGrossArea : grossRoofArea;

  const displayLineItems: LineItem[] = isDemo
    ? [...DEMO_LINEAR_ITEMS, ...DEMO_COUNT_ITEMS]
    : (lineItems ?? []) as LineItem[];
  const linearItems = displayLineItems.filter((i) => i.category === "linear");
  const countItems = displayLineItems.filter((i) => i.category === "count");

  // Area calculations
  const takenOff = displaySections.reduce((sum, s) => sum + s.squareFeet, 0);
  const delta = controlNumber ? controlNumber - takenOff : null;
  const deltaPct = controlNumber && controlNumber > 0 ? Math.abs(((delta ?? 0) / controlNumber) * 100) : null;
  const progressPct = controlNumber && controlNumber > 0 ? Math.min(100, (takenOff / controlNumber) * 100) : null;

  // Linear/count verification stats
  const linearVerified = linearItems.filter((i) => i.verified).length;
  const linearTotal = linearItems.length;
  const countVerified = countItems.filter((i) => i.verified).length;
  const countTotal = countItems.length;
  const linearUnverified = linearTotal - linearVerified;
  const countUnverified = countTotal - countVerified;

  const getDeltaColor = () => {
    if (deltaPct === null) return { text: "text-slate-500", bg: "bg-slate-700", bar: "bg-slate-600" };
    if (deltaPct <= 2) return { text: "text-emerald-400", bg: "bg-emerald-500/20", bar: "bg-emerald-500" };
    if (deltaPct <= 5) return { text: "text-amber-400", bg: "bg-amber-500/20", bar: "bg-amber-500" };
    return { text: "text-red-400", bg: "bg-red-500/20", bar: "bg-red-500" };
  };
  const deltaColor = getDeltaColor();

  // Area section state
  const [editingControl, setEditingControl] = useState(false);
  const [controlInput, setControlInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", assemblyType: "", squareFeet: "", notes: "" });

  const handleSaveControl = useCallback(async () => {
    if (isDemo) { setEditingControl(false); return; }
    const val = parseFloat(controlInput);
    if (!isNaN(val) && val > 0 && isValidConvexId) {
      await updateProject({ projectId: projectId as Id<"bidshield_projects">, grossRoofArea: val });
    }
    setEditingControl(false);
  }, [controlInput, isDemo, isValidConvexId, projectId, updateProject]);

  const handleAddSection = useCallback(async () => {
    if (isDemo || !userId || !isValidConvexId) { setShowAddForm(false); return; }
    const sf = parseFloat(newSection.squareFeet);
    if (!newSection.name.trim() || isNaN(sf) || sf <= 0) return;
    await createSection({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      name: newSection.name.trim(),
      assemblyType: newSection.assemblyType,
      squareFeet: sf,
      notes: newSection.notes.trim() || undefined,
    });
    setNewSection({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" });
    setShowAddForm(false);
  }, [isDemo, userId, isValidConvexId, newSection, projectId, createSection]);

  const handleToggleComplete = useCallback(async (section: TakeoffSection) => {
    if (isDemo) return;
    await updateSection({ sectionId: section._id as Id<"bidshield_takeoff_sections">, completed: !section.completed });
  }, [isDemo, updateSection]);

  const handleStartEdit = (section: TakeoffSection) => {
    setEditingId(section._id);
    setEditData({ name: section.name, assemblyType: section.assemblyType, squareFeet: String(section.squareFeet), notes: section.notes || "" });
  };

  const handleSaveEdit = useCallback(async () => {
    if (isDemo || !editingId) { setEditingId(null); return; }
    const sf = parseFloat(editData.squareFeet);
    if (!editData.name.trim() || isNaN(sf) || sf <= 0) return;
    await updateSection({
      sectionId: editingId as Id<"bidshield_takeoff_sections">,
      name: editData.name.trim(),
      assemblyType: editData.assemblyType,
      squareFeet: sf,
      notes: editData.notes.trim() || undefined,
    });
    setEditingId(null);
  }, [isDemo, editingId, editData, updateSection]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (isDemo) return;
    await deleteSection({ sectionId: sectionId as Id<"bidshield_takeoff_sections"> });
  }, [isDemo, deleteSection]);

  // Line item handlers
  const handleUpdateLineItem = useCallback(async (id: string, updates: { quantity?: number; verified?: boolean; notes?: string }) => {
    if (isDemo) return;
    await updateLineItem({ itemId: id as Id<"bidshield_takeoff_line_items">, ...updates });
  }, [isDemo, updateLineItem]);

  const handleDeleteLineItem = useCallback(async (id: string) => {
    if (isDemo) return;
    await deleteLineItem({ itemId: id as Id<"bidshield_takeoff_line_items"> });
  }, [isDemo, deleteLineItem]);

  const handleAddLinearItem = useCallback(async (label: string) => {
    if (isDemo || !userId || !isValidConvexId) return;
    await createLineItem({ projectId: projectId as Id<"bidshield_projects">, userId, category: "linear", label });
  }, [isDemo, userId, isValidConvexId, projectId, createLineItem]);

  const handleAddCountItem = useCallback(async (label: string) => {
    if (isDemo || !userId || !isValidConvexId) return;
    await createLineItem({ projectId: projectId as Id<"bidshield_projects">, userId, category: "count", label });
  }, [isDemo, userId, isValidConvexId, projectId, createLineItem]);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  // Determine overall status for warnings
  const areaHasIssue = controlNumber !== null && deltaPct !== null && deltaPct > 2;
  const areaIsRed = controlNumber !== null && deltaPct !== null && deltaPct > 5;
  const areaGood = controlNumber !== null && deltaPct !== null && deltaPct <= 2;
  const allGood = areaGood && linearUnverified === 0 && countUnverified === 0;

  // Tab state
  const [activeTab, setActiveTab] = useState<"areas" | "linear" | "counts">("areas");

  // Tab status indicators
  const areaComplete = displaySections.length > 0 && displaySections.every((s) => s.completed) && areaGood;
  const areaPartial = displaySections.length > 0 && displaySections.some((s) => s.completed);
  const linearComplete = linearTotal > 0 && linearVerified === linearTotal;
  const linearPartial = linearVerified > 0;
  const countComplete = countTotal > 0 && countVerified === countTotal;
  const countPartial = countVerified > 0;

  const getStatusDot = (complete: boolean, partial: boolean) => {
    if (complete) return <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />;
    if (partial) return <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5" />;
    return <span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1.5" />;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white">Takeoff Reconciliation</h3>
        {controlNumber !== null && !editingControl && (
          <button
            onClick={() => { setControlInput(String(controlNumber)); setEditingControl(true); }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Edit Control #
          </button>
        )}
      </div>

      {/* Stat cards — always visible */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editingControl ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                value={controlInput}
                onChange={(e) => setControlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveControl(); if (e.key === "Escape") setEditingControl(false); }}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-center text-white text-sm w-full focus:outline-none focus:border-amber-500"
                autoFocus
                placeholder="SF"
              />
              <div className="flex gap-1 justify-center">
                <button onClick={handleSaveControl} className="text-[10px] text-emerald-400 hover:text-emerald-300">Save</button>
                <button onClick={() => setEditingControl(false)} className="text-[10px] text-slate-500 hover:text-slate-300">Cancel</button>
              </div>
            </div>
          ) : controlNumber !== null ? (
            <>
              <div className="text-lg font-bold text-white">{fmt(controlNumber)} SF</div>
              <div className="text-[10px] text-slate-500">Control # (Gross Area)</div>
            </>
          ) : (
            <button onClick={() => { setControlInput(""); setEditingControl(true); }} className="w-full">
              <div className="text-lg font-bold text-slate-500">Not set</div>
              <div className="text-[10px] text-amber-400">Click to set control #</div>
            </button>
          )}
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          <div className="text-lg font-bold text-white">{fmt(takenOff)} SF</div>
          <div className="text-[10px] text-slate-500">Taken Off (Sum)</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {delta !== null ? (
            <>
              <div className={`text-lg font-bold ${deltaColor.text}`}>
                {delta >= 0 ? "-" : "+"}{fmt(Math.abs(delta))} SF
              </div>
              <div className="text-[10px] text-slate-500">Delta</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-slate-500">—</div>
              <div className="text-[10px] text-slate-500">Set control # to compare</div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar — always visible */}
      {progressPct !== null && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500">Area Reconciliation</span>
            <span className={`text-xs font-bold ${deltaColor.text}`}>{progressPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${deltaColor.bar}`} style={{ width: `${Math.min(100, progressPct)}%` }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 mb-0">
        <button
          onClick={() => setActiveTab("areas")}
          className={`py-2.5 text-center text-xs font-medium transition-colors border-b-2 ${
            activeTab === "areas"
              ? "bg-slate-700 text-white border-amber-500"
              : "bg-slate-800 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-750"
          } rounded-tl-lg`}
        >
          <div className="flex items-center justify-center">
            {getStatusDot(areaComplete, areaPartial)}
            <span className="hidden sm:inline">Areas (SF)</span>
            <span className="sm:hidden">Areas</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{displaySections.length} section{displaySections.length !== 1 ? "s" : ""}</div>
        </button>
        <button
          onClick={() => setActiveTab("linear")}
          className={`py-2.5 text-center text-xs font-medium transition-colors border-b-2 ${
            activeTab === "linear"
              ? "bg-slate-700 text-white border-amber-500"
              : "bg-slate-800 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-750"
          }`}
        >
          <div className="flex items-center justify-center">
            {getStatusDot(linearComplete, linearPartial)}
            <span className="hidden sm:inline">Linear (LF)</span>
            <span className="sm:hidden">Linear</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{linearVerified} of {linearTotal} verified</div>
        </button>
        <button
          onClick={() => setActiveTab("counts")}
          className={`py-2.5 text-center text-xs font-medium transition-colors border-b-2 ${
            activeTab === "counts"
              ? "bg-slate-700 text-white border-amber-500"
              : "bg-slate-800 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-750"
          } rounded-tr-lg`}
        >
          <div className="flex items-center justify-center">
            {getStatusDot(countComplete, countPartial)}
            <span className="hidden sm:inline">Counts (EA)</span>
            <span className="sm:hidden">Counts</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{countVerified} of {countTotal} verified</div>
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-slate-700/30 rounded-b-lg p-4 border border-slate-700 border-t-0">
        {/* Areas tab */}
        {activeTab === "areas" && (
          <div>
            {displaySections.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-slate-500 border-b border-slate-700">
                      <th className="text-left py-2 font-medium">Section Name</th>
                      <th className="text-left py-2 font-medium hidden sm:table-cell">Assembly</th>
                      <th className="text-right py-2 font-medium">SF</th>
                      <th className="text-center py-2 font-medium w-10">Status</th>
                      <th className="text-right py-2 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySections.map((section) => (
                      editingId === section._id ? (
                        <tr key={section._id} className="border-b border-slate-700/50">
                          <td className="py-2 pr-2">
                            <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-amber-500" />
                          </td>
                          <td className="py-2 pr-2 hidden sm:table-cell">
                            <select value={editData.assemblyType} onChange={(e) => setEditData({ ...editData, assemblyType: e.target.value })}
                              className="bg-slate-900 border border-slate-600 rounded px-1 py-1 text-white text-xs w-full focus:outline-none focus:border-amber-500">
                              {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="py-2 pr-2">
                            <input type="number" value={editData.squareFeet} onChange={(e) => setEditData({ ...editData, squareFeet: e.target.value })}
                              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs w-20 text-right focus:outline-none focus:border-amber-500" />
                          </td>
                          <td colSpan={2} className="py-2 text-right">
                            <button onClick={handleSaveEdit} className="text-[11px] text-emerald-400 hover:text-emerald-300 mr-2">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-[11px] text-slate-500 hover:text-slate-300">Cancel</button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={section._id} className="border-b border-slate-700/50 group">
                          <td className="py-2 text-slate-200">{section.name}</td>
                          <td className="py-2 text-slate-400 text-xs hidden sm:table-cell">{section.assemblyType}</td>
                          <td className="py-2 text-right text-slate-200 tabular-nums">{fmt(section.squareFeet)}</td>
                          <td className="py-2 text-center">
                            <button onClick={() => handleToggleComplete(section)} className="text-base">{section.completed ? "✅" : "⬜"}</button>
                          </td>
                          <td className="py-2 text-right">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleStartEdit(section)} className="text-[11px] text-slate-400 hover:text-slate-200 mr-2">Edit</button>
                              <button onClick={() => handleDeleteSection(section._id)} className="text-[11px] text-red-400 hover:text-red-300">Del</button>
                            </span>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                  {displaySections.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-slate-500 bg-slate-700">
                        <td className="py-2 text-white text-xs font-semibold">TOTAL</td>
                        <td className="py-2 text-slate-400 text-[11px] hidden sm:table-cell">
                          {displaySections.length} section{displaySections.length !== 1 ? "s" : ""} &middot; {displaySections.filter((s) => s.completed).length} of {displaySections.length} verified
                        </td>
                        <td className="py-2 text-right text-white text-xs font-semibold tabular-nums">
                          {fmt(takenOff)} SF
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {displaySections.length === 0 && !showAddForm && (
              <div className="text-center py-6 text-slate-500 text-sm mb-3">
                No sections yet. Add your first takeoff section to start reconciling.
              </div>
            )}

            {showAddForm ? (
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Section Name *</label>
                    <input value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} placeholder="e.g., Main Roof Area A"
                      className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Assembly Type *</label>
                    <select value={newSection.assemblyType} onChange={(e) => setNewSection({ ...newSection, assemblyType: e.target.value })}
                      className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500">
                      {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Square Feet *</label>
                    <input type="number" value={newSection.squareFeet} onChange={(e) => setNewSection({ ...newSection, squareFeet: e.target.value })} placeholder="e.g., 22000"
                      className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Notes</label>
                    <input value={newSection.notes} onChange={(e) => setNewSection({ ...newSection, notes: e.target.value })} placeholder="Optional notes"
                      className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddSection} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Add Section</button>
                  <button onClick={() => setShowAddForm(false)} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddForm(true)} className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">+ Add Section</button>
            )}
          </div>
        )}

        {/* Linear tab */}
        {activeTab === "linear" && (
          <LineItemTable
            title="Linear Items"
            unit="LF"
            items={linearItems}
            isDemo={isDemo}
            onUpdateItem={handleUpdateLineItem}
            onDeleteItem={handleDeleteLineItem}
            onAddItem={handleAddLinearItem}
          />
        )}

        {/* Counts tab */}
        {activeTab === "counts" && (
          <LineItemTable
            title="Count Items"
            unit="EA"
            items={countItems}
            isDemo={isDemo}
            onUpdateItem={handleUpdateLineItem}
            onDeleteItem={handleDeleteLineItem}
            onAddItem={handleAddCountItem}
          />
        )}
      </div>

      {/* Compact warning summary — always visible below tabs */}
      <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
        {allGood ? (
          <div className="text-sm text-emerald-400 text-center">Takeoff fully reconciled and verified.</div>
        ) : controlNumber === null ? (
          <div className="text-sm text-slate-400 text-center">Enter your gross roof area from the site plan to enable area reconciliation.</div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {/* Area status */}
            {areaGood && (
              <span className="text-emerald-400">Area: Reconciled</span>
            )}
            {areaHasIssue && !areaIsRed && (
              <span className="text-amber-400">Area: {fmt(Math.abs(delta!))} SF off ({deltaPct!.toFixed(1)}%)</span>
            )}
            {areaIsRed && (
              <span className="text-red-400">Area: {fmt(Math.abs(delta!))} SF off ({deltaPct!.toFixed(1)}%)</span>
            )}
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            {/* Linear status */}
            {linearUnverified === 0 ? (
              <span className="text-emerald-400">Linear: All verified</span>
            ) : (
              <span className="text-amber-400">Linear: {linearUnverified}/{linearTotal} unverified</span>
            )}
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            {/* Count status */}
            {countUnverified === 0 ? (
              <span className="text-emerald-400">Counts: All verified</span>
            ) : (
              <span className="text-amber-400">Counts: {countUnverified}/{countTotal} unverified</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== BID PRICING & OUTCOME COMPONENT =====

function BidPricing({
  projectId,
  projectData,
  grossRoofArea,
  isDemo,
  allProjects,
}: {
  projectId: string;
  projectData: any;
  grossRoofArea: number | null;
  isDemo: boolean;
  allProjects: any[] | undefined;
}) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const updateProject = useMutation(api.bidshield.updateProject);
  const [editing, setEditing] = useState(false);

  // Demo pricing data for Harbor Point Tower
  const demoPricing = {
    totalBidAmount: 850000,
    materialCost: 425000,
    laborCost: 340000,
    otherCost: 85000,
    primaryAssembly: "TPO 60mil Mechanically Attached",
    lossReason: undefined as string | undefined,
    lossReasonNote: undefined as string | undefined,
    actualCost: undefined as number | undefined,
    actualMaterialCost: undefined as number | undefined,
    actualLaborCost: undefined as number | undefined,
  };

  const pricing = isDemo ? demoPricing : {
    totalBidAmount: projectData?.totalBidAmount,
    materialCost: projectData?.materialCost,
    laborCost: projectData?.laborCost,
    otherCost: projectData?.otherCost,
    primaryAssembly: projectData?.primaryAssembly,
    lossReason: projectData?.lossReason,
    lossReasonNote: projectData?.lossReasonNote,
    actualCost: projectData?.actualCost,
    actualMaterialCost: projectData?.actualMaterialCost,
    actualLaborCost: projectData?.actualLaborCost,
  };

  const [form, setForm] = useState({
    totalBidAmount: "",
    materialCost: "",
    laborCost: "",
    otherCost: "",
    primaryAssembly: "",
    lossReason: "",
    lossReasonNote: "",
    actualCost: "",
    actualMaterialCost: "",
    actualLaborCost: "",
  });

  const startEdit = () => {
    setForm({
      totalBidAmount: pricing.totalBidAmount?.toString() ?? "",
      materialCost: pricing.materialCost?.toString() ?? "",
      laborCost: pricing.laborCost?.toString() ?? "",
      otherCost: pricing.otherCost?.toString() ?? "",
      primaryAssembly: pricing.primaryAssembly ?? "",
      lossReason: pricing.lossReason ?? "",
      lossReasonNote: pricing.lossReasonNote ?? "",
      actualCost: pricing.actualCost?.toString() ?? "",
      actualMaterialCost: pricing.actualMaterialCost?.toString() ?? "",
      actualLaborCost: pricing.actualLaborCost?.toString() ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (isDemo || !isValidConvexId) { setEditing(false); return; }
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: parse(form.totalBidAmount),
      materialCost: parse(form.materialCost),
      laborCost: parse(form.laborCost),
      otherCost: parse(form.otherCost),
      primaryAssembly: form.primaryAssembly || undefined,
      lossReason: form.lossReason || undefined,
      lossReasonNote: form.lossReasonNote || undefined,
      actualCost: parse(form.actualCost),
      actualMaterialCost: parse(form.actualMaterialCost),
      actualLaborCost: parse(form.actualLaborCost),
    });
    setEditing(false);
  };

  const dollarPerSf = pricing.totalBidAmount && grossRoofArea && grossRoofArea > 0
    ? pricing.totalBidAmount / grossRoofArea
    : null;

  const fmtDollar = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  // Bid health: compare $/SF against similar assembly projects
  const assembly = pricing.primaryAssembly;
  const similarProjects = (allProjects ?? []).filter(
    (p: any) => p.primaryAssembly === assembly && p.totalBidAmount && p.sqft && p.sqft > 0 && p._id !== projectId
  );
  const avgDollarPerSf = similarProjects.length >= 3
    ? similarProjects.reduce((sum: number, p: any) => sum + p.totalBidAmount / p.sqft, 0) / similarProjects.length
    : null;
  const variance = dollarPerSf && avgDollarPerSf
    ? ((dollarPerSf - avgDollarPerSf) / avgDollarPerSf) * 100
    : null;
  const healthColor = variance === null ? "text-slate-500"
    : Math.abs(variance) <= 5 ? "text-emerald-400"
    : Math.abs(variance) <= 15 ? "text-amber-400"
    : "text-red-400";
  const healthLabel = !dollarPerSf ? "Enter bid amount"
    : !assembly ? "Set assembly type"
    : similarProjects.length < 3 ? "Need more data"
    : Math.abs(variance!) <= 5 ? "On Target"
    : Math.abs(variance!) <= 15 ? "Watch"
    : "Off Target";

  const status = projectData?.status || "setup";
  const isWon = status === "won";
  const isLost = status === "lost";

  // Actual cost variance (won projects)
  const costVariance = pricing.actualCost && pricing.totalBidAmount
    ? ((pricing.actualCost - pricing.totalBidAmount) / pricing.totalBidAmount) * 100
    : null;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white">Bid Pricing & Outcome</h3>
        <button
          onClick={editing ? handleSave : startEdit}
          className={`text-xs font-medium transition-colors ${editing ? "text-emerald-400 hover:text-emerald-300" : "text-slate-400 hover:text-slate-200"}`}
        >
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      {/* 5 stat mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editing ? (
            <input type="number" value={form.totalBidAmount} onChange={(e) => setForm({ ...form, totalBidAmount: e.target.value })}
              placeholder="Total" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" />
          ) : (
            <div className="text-lg font-bold text-white">{pricing.totalBidAmount ? fmtDollar(pricing.totalBidAmount) : "—"}</div>
          )}
          <div className="text-[10px] text-slate-500">Total Bid</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editing ? (
            <input type="number" value={form.materialCost} onChange={(e) => setForm({ ...form, materialCost: e.target.value })}
              placeholder="Material" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" />
          ) : (
            <div className="text-lg font-bold text-blue-400">{pricing.materialCost ? fmtDollar(pricing.materialCost) : "—"}</div>
          )}
          <div className="text-[10px] text-slate-500">Material</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editing ? (
            <input type="number" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })}
              placeholder="Labor" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" />
          ) : (
            <div className="text-lg font-bold text-emerald-400">{pricing.laborCost ? fmtDollar(pricing.laborCost) : "—"}</div>
          )}
          <div className="text-[10px] text-slate-500">Labor</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editing ? (
            <input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })}
              placeholder="Other" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" />
          ) : (
            <div className="text-lg font-bold text-slate-300">{pricing.otherCost ? fmtDollar(pricing.otherCost) : "—"}</div>
          )}
          <div className="text-[10px] text-slate-500">Other</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700 col-span-2 sm:col-span-1">
          <div className={`text-lg font-bold ${healthColor}`}>
            {dollarPerSf ? `$${dollarPerSf.toFixed(2)}` : "—"}
          </div>
          <div className="text-[10px] text-slate-500">$/SF</div>
        </div>
      </div>

      {/* Primary Assembly */}
      <div className="mb-4">
        <label className="text-[11px] text-slate-400 mb-1 block">Primary Assembly</label>
        {editing ? (
          <select value={form.primaryAssembly} onChange={(e) => setForm({ ...form, primaryAssembly: e.target.value })}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500">
            <option value="">Select assembly...</option>
            {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        ) : (
          <div className="text-sm text-slate-200">{pricing.primaryAssembly || "Not set"}</div>
        )}
      </div>

      {/* Bid Health indicator */}
      {(dollarPerSf || assembly) && (
        <div className={`mb-4 p-3 rounded-lg border ${
          healthLabel === "On Target" ? "bg-emerald-500/10 border-emerald-500/30" :
          healthLabel === "Watch" ? "bg-amber-500/10 border-amber-500/30" :
          healthLabel === "Off Target" ? "bg-red-500/10 border-red-500/30" :
          "bg-slate-700/50 border-slate-600"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Bid Health</span>
            <span className={`text-xs font-bold ${healthColor}`}>{healthLabel}</span>
          </div>
          {variance !== null && (
            <div className="text-[11px] text-slate-400 mt-1">
              Your $/SF is {variance > 0 ? "+" : ""}{variance.toFixed(1)}% vs avg ${avgDollarPerSf!.toFixed(2)}/SF across {similarProjects.length} similar projects
            </div>
          )}
          {similarProjects.length < 3 && assembly && (
            <div className="text-[11px] text-slate-500 mt-1">
              Need at least 3 projects with &ldquo;{assembly}&rdquo; to compare. Have {similarProjects.length}.
            </div>
          )}
        </div>
      )}

      {/* Loss Reason section (only when status=lost) */}
      {isLost && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-xs font-semibold text-red-400 mb-2">Loss Details</h4>
          {editing ? (
            <div className="space-y-2">
              <select value={form.lossReason} onChange={(e) => setForm({ ...form, lossReason: e.target.value })}
                className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500">
                <option value="">Select reason...</option>
                {LOSS_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input value={form.lossReasonNote} onChange={(e) => setForm({ ...form, lossReasonNote: e.target.value })}
                placeholder="Additional notes (optional)"
                className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
            </div>
          ) : (
            <div className="text-sm text-slate-300">
              {pricing.lossReason || "No reason recorded"}
              {pricing.lossReasonNote && <span className="text-slate-500 ml-2">— {pricing.lossReasonNote}</span>}
            </div>
          )}
        </div>
      )}

      {/* Actual Costs section (only when status=won) */}
      {isWon && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <h4 className="text-xs font-semibold text-emerald-400 mb-3">Post-Award Tracking</h4>
          {editing ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Actual Total</label>
                <input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Actual Material</label>
                <input type="number" value={form.actualMaterialCost} onChange={(e) => setForm({ ...form, actualMaterialCost: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Actual Labor</label>
                <input type="number" value={form.actualLaborCost} onChange={(e) => setForm({ ...form, actualLaborCost: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{pricing.actualCost ? fmtDollar(pricing.actualCost) : "—"}</div>
                <div className="text-[10px] text-slate-500">Actual Total</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{pricing.actualMaterialCost ? fmtDollar(pricing.actualMaterialCost) : "—"}</div>
                <div className="text-[10px] text-slate-500">Actual Material</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{pricing.actualLaborCost ? fmtDollar(pricing.actualLaborCost) : "—"}</div>
                <div className="text-[10px] text-slate-500">Actual Labor</div>
              </div>
            </div>
          )}
          {costVariance !== null && (
            <div className={`mt-2 text-xs text-center ${Math.abs(costVariance) <= 5 ? "text-emerald-400" : Math.abs(costVariance) <= 10 ? "text-amber-400" : "text-red-400"}`}>
              Variance: {costVariance > 0 ? "+" : ""}{costVariance.toFixed(1)}% from bid
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="mt-4 flex gap-2">
          <button onClick={handleSave} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Save Changes</button>
          <button onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 transition-colors">Cancel</button>
        </div>
      )}
    </div>
  );
}

const statusColors: Record<string, { text: string; bg: string }> = {
  setup: { text: "text-slate-400", bg: "bg-slate-700" },
  in_progress: { text: "text-blue-400", bg: "bg-blue-500/20" },
  submitted: { text: "text-amber-400", bg: "bg-amber-500/20" },
  won: { text: "text-emerald-400", bg: "bg-emerald-500/20" },
  lost: { text: "text-red-400", bg: "bg-red-500/20" },
  no_bid: { text: "text-slate-400", bg: "bg-slate-700" },
};

function ProjectDetail() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const checklist = useQuery(
    api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip"
  );
  const rfis = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  // All user projects (for Bid Health comparison)
  const allProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );

  // Demo data
  const projectData = isDemo
    ? {
        name: "Harbor Point Tower",
        location: "Jersey City, NJ",
        bidDate: "2026-02-15",
        status: "in_progress" as const,
        gc: "Turner Construction",
        sqft: 45000,
        estimatedValue: 850000,
        assemblies: ["TPO 60mil", "Tapered ISO"],
        notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
        trade: "roofing",
        systemType: "tpo",
        deckType: "steel",
      }
    : project;

  // Build trade-aware checklist template
  const trade = (projectData as any)?.trade || "roofing";
  const systemType = (projectData as any)?.systemType || undefined;
  const deckType = (projectData as any)?.deckType || undefined;
  const checklistTemplate = getChecklistForTrade(trade, systemType, deckType);

  if (!projectIdParam) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No project selected. Go back to the dashboard.</p>
      </div>
    );
  }

  if (!isDemo && !projectData) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading project...</p>
      </div>
    );
  }

  // Compute stats
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: { status: string }) => i.status === "rfi").length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const quoteCount = isDemo ? 5 : (quotes ?? []).length;
  const rfiCount = isDemo ? 3 : (rfis ?? []).length;
  const openRFIs = isDemo ? 1 : (rfis ?? []).filter((r: { status: string }) => r.status === "sent").length;

  // Reconciliation stats
  const demoTakeoffSections = [
    { squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 },
  ];
  const reconSections = isDemo ? demoTakeoffSections : (takeoffSections ?? []);
  const reconTakenOff = reconSections.reduce((sum: number, s: { squareFeet: number }) => sum + s.squareFeet, 0);
  const reconControl = isDemo ? 45000 : (projectData as any)?.grossRoofArea ?? null;
  const reconPct = reconControl && reconControl > 0 ? Math.min(100, Math.round((reconTakenOff / reconControl) * 100)) : null;
  const reconDeltaPct = reconControl && reconControl > 0 ? Math.abs(((reconControl - reconTakenOff) / reconControl) * 100) : null;
  const reconColor = reconDeltaPct === null ? "text-slate-500" : reconDeltaPct <= 2 ? "text-emerald-400" : reconDeltaPct <= 5 ? "text-amber-400" : "text-red-400";

  const statusStyle = statusColors[projectData?.status || "setup"] || statusColors.setup;
  const demoQuery = isDemo ? "&demo=true" : "";
  const projectQuery = `project=${projectIdParam}${demoQuery}`;

  // Calculate days until bid
  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate
    ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Phase progress summary
  const phaseProgress = Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
    const phaseItems = checklistItems.filter((i: { phaseKey: string; status: string }) => i.phaseKey === phaseKey);
    const done = phaseItems.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
    const total = phase.items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { phaseKey, title: phase.title, icon: phase.icon, pct, done, total, critical: phase.critical };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <Link
            href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h2 className="text-xl font-semibold text-white">{projectData?.name || "Project"}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-slate-400">{projectData?.location}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${statusStyle.text} ${statusStyle.bg}`}>
              {(projectData?.status || "setup").replace("_", " ")}
            </span>
            {systemType && (
              <span className="text-[10px] font-medium bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase">{systemType}</span>
            )}
            {deckType && (
              <span className="text-[10px] font-medium bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded capitalize">{deckType} deck</span>
            )}
          </div>
        </div>
        <div className="text-right">
          {daysUntilBid !== null && (
            <div className={`text-2xl font-bold ${daysUntilBid <= 3 ? "text-red-400" : daysUntilBid <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
              {daysUntilBid > 0 ? `${daysUntilBid} days` : daysUntilBid === 0 ? "TODAY" : "PAST DUE"}
            </div>
          )}
          <div className="text-xs text-slate-500">until bid • {projectData?.bidDate}</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">{progress}%</div>
          <div className="text-[11px] text-slate-400">Checklist</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-blue-400">{quoteCount}</div>
          <div className="text-[11px] text-slate-400">Quotes</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-amber-400">{rfiCount}</div>
          <div className="text-[11px] text-slate-400">RFIs</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-300">
            {projectData?.sqft ? `${(projectData.sqft / 1000).toFixed(0)}k` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">Sq Ft</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          {(() => {
            const bidAmt = isDemo ? 850000 : (projectData as any)?.totalBidAmount;
            const area = isDemo ? 45000 : (projectData as any)?.grossRoofArea;
            const dpsf = bidAmt && area && area > 0 ? bidAmt / area : null;
            return dpsf ? (
              <>
                <div className="text-2xl font-bold text-emerald-400">${dpsf.toFixed(2)}</div>
                <div className="text-[11px] text-slate-400">$/SF</div>
              </>
            ) : projectData?.estimatedValue ? (
              <>
                <div className="text-2xl font-bold text-emerald-400">${(projectData.estimatedValue / 1000).toFixed(0)}k</div>
                <div className="text-[11px] text-slate-400">Value</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-500">—</div>
                <div className="text-[11px] text-slate-400">$/SF</div>
              </>
            );
          })()}
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className={`text-2xl font-bold ${reconColor}`}>
            {reconPct !== null ? `${reconPct}%` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">{reconControl !== null ? "Reconciled" : "No Control #"}</div>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            {projectData?.gc && (
              <div className="flex justify-between">
                <span className="text-slate-400">GC:</span>
                <span className="text-slate-200">{projectData.gc}</span>
              </div>
            )}
            {(projectData as any)?.owner && (
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="text-slate-200">{(projectData as any).owner}</span>
              </div>
            )}
            {projectData?.assemblies && projectData.assemblies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Assemblies:</span>
                <span className="text-slate-200 text-right">{projectData.assemblies.join(", ")}</span>
              </div>
            )}
          </div>
          {projectData?.notes && (
            <div className="mt-3 p-3 bg-slate-900 rounded-lg text-sm text-slate-300">
              {projectData.notes}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/bidshield/dashboard/checklist?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📋</span> Open Checklist
            </Link>
            <Link
              href={`/bidshield/dashboard/quotes?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>💰</span> Manage Quotes
            </Link>
            <Link
              href={`/bidshield/dashboard/rfis?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📨</span> View RFIs
            </Link>
            <Link
              href={`/bidshield/dashboard/validator${isDemo ? "?demo=true" : ""}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>🛡️</span> Run Validator
            </Link>
          </div>
          {openRFIs > 0 && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              {openRFIs} open RFI{openRFIs !== 1 ? "s" : ""} awaiting response
            </div>
          )}
          {rfiItems > 0 && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              {rfiItems} checklist item{rfiItems !== 1 ? "s" : ""} flagged as RFI
            </div>
          )}
        </div>
      </div>

      {/* Phase Progress */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white">Checklist Progress by Phase</h3>
          <Link
            href={`/bidshield/dashboard/checklist?${projectQuery}`}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Open Full Checklist &rarr;
          </Link>
        </div>
        <div className="space-y-2">
          {(isDemo
            ? Object.entries(checklistTemplate).map(([k, p]) => ({
                phaseKey: k,
                title: p.title,
                icon: p.icon,
                pct: Math.floor(Math.random() * 60 + 40),
                done: 0,
                total: p.items.length,
                critical: p.critical,
              }))
            : phaseProgress
          ).map((phase) => (
            <div key={phase.phaseKey} className="flex items-center gap-3">
              <span className="text-sm w-5">{phase.icon}</span>
              <span className="text-xs text-slate-400 w-40 truncate">{phase.title.replace(/^Phase \d+: /, "")}</span>
              {phase.critical && (
                <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">!</span>
              )}
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${phase.pct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${phase.pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold min-w-[32px] text-right ${phase.pct === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                {phase.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Takeoff Reconciliation */}
      <TakeoffReconciliation
        projectId={projectIdParam}
        grossRoofArea={reconControl}
        isDemo={isDemo}
        userId={userId}
      />

      {/* Bid Pricing & Outcome */}
      <BidPricing
        projectId={projectIdParam}
        projectData={projectData}
        grossRoofArea={reconControl}
        isDemo={isDemo}
        allProjects={isDemo ? undefined : (allProjects as any[] | undefined)}
      />
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading project...</div>}>
      <ProjectDetail />
    </Suspense>
  );
}
