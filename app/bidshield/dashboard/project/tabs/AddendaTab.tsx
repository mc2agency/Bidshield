"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const IMPACT_OPTIONS = ["material", "labor", "schedule", "scope"] as const;

function getAddendumStatus(add: any): { label: string; color: string; icon: string } {
  if (add.affectsScope === true && add.repriced) {
    return { label: "Reviewed & Re-priced", color: "text-emerald-600", icon: "✓" };
  }
  if (add.affectsScope === false) {
    return { label: "Reviewed — No impact", color: "text-emerald-600", icon: "✓" };
  }
  if (add.affectsScope === true && !add.repriced) {
    return { label: "Pending Re-price", color: "text-red-600", icon: "⚠" };
  }
  return { label: "Not Reviewed", color: "text-amber-600", icon: "⚠" };
}

function cardBorderColor(add: any): string {
  const priority = add.priority || "normal";
  if (priority === "critical") return "border-l-4 border-l-red-500";
  if (add.affectsScope === true && !add.repriced) return "border-l-4 border-l-red-500";
  if (add.affectsScope === undefined || add.affectsScope === null) return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-emerald-500";
}

export default function AddendaTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const createAddendumMut = useMutation(api.bidshield.createAddendum);
  const updateAddendumMut = useMutation(api.bidshield.updateAddendum);
  const deleteAddendumMut = useMutation(api.bidshield.deleteAddendum);

  const [showAdd, setShowAdd] = useState(false);
  const [newAddendum, setNewAddendum] = useState({
    title: "",
    receivedDate: new Date().toISOString().split("T")[0],
    priority: "normal",
    notes: "",
  });

  // Demo data with enhanced fields
  const demoAddenda = [
    {
      _id: "demo_add_1" as any, number: 1, title: "Revised mechanical equipment schedule",
      receivedDate: "2026-02-03", affectsScope: true, acknowledged: true, incorporated: true,
      scopeImpact: "Added 2 new RTU curbs requiring additional curb adapters and flashing",
      impactCategories: "material,labor", repriced: true, repricedDate: "2026-02-04",
      priceImpact: 2800, priority: "normal",
      notes: "Added to takeoff. Updated quote from ABC Supply.",
    },
    {
      _id: "demo_add_2" as any, number: 2, title: "Clarification on warranty requirements",
      receivedDate: "2026-02-05", affectsScope: false, acknowledged: true, incorporated: false,
      scopeImpact: undefined, impactCategories: undefined, repriced: undefined, repricedDate: undefined,
      priceImpact: undefined, priority: "normal",
      notes: "Confirms 20-year NDL. No change to our pricing.",
    },
    {
      _id: "demo_add_3" as any, number: 3, title: "Changed parapet coping to stainless steel",
      receivedDate: "2026-02-07", affectsScope: true, acknowledged: false, incorporated: false,
      scopeImpact: "All aluminum coping replaced with stainless steel. 1,200 LF affected.",
      impactCategories: "material", repriced: false, repricedDate: undefined,
      priceImpact: undefined, priority: "critical",
      notes: "",
    },
  ];

  const resolvedAddenda = isDemo ? demoAddenda : (addenda ?? []);
  const nextNumber = resolvedAddenda.length > 0 ? Math.max(...resolvedAddenda.map((a: any) => a.number)) + 1 : 1;

  // --- Stats ---
  const totalAddenda = resolvedAddenda.length;
  const scopeAffecting = resolvedAddenda.filter((a: any) => a.affectsScope === true).length;
  const repricedCount = resolvedAddenda.filter((a: any) => a.affectsScope === true && a.repriced === true).length;
  const pendingRePrice = resolvedAddenda.filter((a: any) => a.affectsScope === true && !a.repriced).length;
  const notReviewed = resolvedAddenda.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
  const netPriceImpact = resolvedAddenda.reduce((sum: number, a: any) => sum + (a.priceImpact || 0), 0);

  // --- Handlers ---
  const handleAdd = async () => {
    if (!newAddendum.title || !userId || isDemo) return;
    await createAddendumMut({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      number: nextNumber,
      title: newAddendum.title,
      receivedDate: newAddendum.receivedDate,
      priority: newAddendum.priority,
      notes: newAddendum.notes || undefined,
    });
    setNewAddendum({ title: "", receivedDate: new Date().toISOString().split("T")[0], priority: "normal", notes: "" });
    setShowAdd(false);
  };

  const handleUpdate = useCallback(async (addendumId: Id<"bidshield_addenda">, updates: Record<string, any>) => {
    if (isDemo) return;
    await updateAddendumMut({ addendumId, ...updates });
  }, [isDemo, updateAddendumMut]);

  const handleDelete = async (addendumId: Id<"bidshield_addenda">) => {
    if (isDemo) return;
    await deleteAddendumMut({ addendumId });
  };

  // Warning items: addenda that affect scope but aren't re-priced
  const warningItems = resolvedAddenda.filter((a: any) => a.affectsScope === true && !a.repriced);

  return (
    <div className="flex flex-col gap-6">
      {/* Focused summary */}
      {pendingRePrice > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-sm font-bold text-red-800">{pendingRePrice} addend{pendingRePrice > 1 ? "a" : "um"} needs re-pricing</div>
          <p className="text-xs text-red-600 mt-1">Scope-affecting changes without updated pricing are bid blockers</p>
          {netPriceImpact !== 0 && (
            <div className="mt-2 text-xs text-red-700">
              Net impact: <span className="font-bold">{netPriceImpact > 0 ? "+" : ""}${netPriceImpact.toLocaleString()}</span>
            </div>
          )}
        </div>
      ) : totalAddenda > 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="text-sm font-bold text-emerald-700">All {totalAddenda} addenda reviewed ✓</div>
          <div className="text-xs text-emerald-600 mt-0.5">{scopeAffecting} affect scope · {repricedCount} re-priced</div>
        </div>
      ) : null}

      {/* Add button */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"}</span>
        {!isDemo && (
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Addendum
          </button>
        )}
      </div>

      {/* Warning Banner */}
      {warningItems.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">⚠</span>
            <div>
              <div className="text-sm font-semibold text-red-600">
                {warningItems.length} addend{warningItems.length !== 1 ? "a" : "um"} affect{warningItems.length === 1 ? "s" : ""} your scope and {warningItems.length === 1 ? "has" : "have"} NOT been re-priced
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Review {warningItems.map(w => `Addendum #${(w as any).number}`).join(", ")} before submitting your bid.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Not Reviewed Warning */}
      {notReviewed > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-500/30 rounded-lg text-sm text-amber-600">
          {notReviewed} addend{notReviewed !== 1 ? "a" : "um"} not yet reviewed — determine if {notReviewed === 1 ? "it affects" : "they affect"} your scope.
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-xl p-5 border border-emerald-500/50">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Add Addendum #{nextNumber}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Title / Description *</label>
              <input type="text" value={newAddendum.title} onChange={(e) => setNewAddendum({ ...newAddendum, title: e.target.value })} placeholder="Revised RTU schedule — 2 units upsized" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Date Received</label>
                <input type="date" value={newAddendum.receivedDate} onChange={(e) => setNewAddendum({ ...newAddendum, receivedDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Priority</label>
                <select value={newAddendum.priority} onChange={(e) => setNewAddendum({ ...newAddendum, priority: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Notes (optional)</label>
              <textarea value={newAddendum.notes} onChange={(e) => setNewAddendum({ ...newAddendum, notes: e.target.value })} placeholder="What does this addendum cover?" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-900 text-sm font-semibold rounded-lg transition-colors">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Addenda List */}
      {resolvedAddenda.length > 0 ? (
        <div className="flex flex-col gap-4">
          {[...resolvedAddenda].sort((a: any, b: any) => a.number - b.number).map((add: any) => (
            <AddendumCard
              key={add._id}
              add={add}
              isDemo={isDemo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-sm text-slate-500 mb-2">No addenda logged for this project</p>
          <p className="text-xs text-slate-500">Click "+ Add Addendum" when you receive one from the GC</p>
        </div>
      )}
    </div>
  );
}

function AddendumCard({
  add,
  isDemo,
  onUpdate,
  onDelete,
}: {
  add: any;
  isDemo: boolean;
  onUpdate: (id: Id<"bidshield_addenda">, updates: Record<string, any>) => Promise<void>;
  onDelete: (id: Id<"bidshield_addenda">) => Promise<void>;
}) {
  const status = getAddendumStatus(add);
  const priority = add.priority || "normal";
  const impactCats = add.impactCategories ? add.impactCategories.split(",") : [];

  // Debounced text field saves
  const scopeImpactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceImpactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [localScopeImpact, setLocalScopeImpact] = useState(add.scopeImpact || "");
  const [localPriceImpact, setLocalPriceImpact] = useState(add.priceImpact != null ? String(add.priceImpact) : "");
  const [localNotes, setLocalNotes] = useState(add.notes || "");

  const toggleImpactCategory = (cat: string) => {
    const current = add.impactCategories ? add.impactCategories.split(",") : [];
    const updated = current.includes(cat) ? current.filter((c: string) => c !== cat) : [...current, cat];
    onUpdate(add._id, { impactCategories: updated.join(",") || undefined });
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 ${cardBorderColor(add)}`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">#{add.number}</span>
            {priority === "critical" && (
              <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase">Critical</span>
            )}
            {priority === "high" && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase">High</span>
            )}
            <span className="text-xs text-slate-500">Received: {add.receivedDate}</span>
          </div>
          <div className="text-sm text-slate-900 font-medium">{add.title}</div>
        </div>
        {!isDemo && (
          <button onClick={() => onDelete(add._id)} className="text-slate-600 hover:text-red-600 text-xs transition-colors shrink-0">Delete</button>
        )}
      </div>

      {/* Affects Scope Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Affects Roofing Scope?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (isDemo) return;
                const newVal = add.affectsScope === true ? undefined : true;
                onUpdate(add._id, { affectsScope: newVal });
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                add.affectsScope === true
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-500/50"
                  : "bg-slate-100 text-slate-500 border border-slate-300 hover:text-slate-700"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => {
                if (isDemo) return;
                const newVal = add.affectsScope === false ? undefined : false;
                onUpdate(add._id, { affectsScope: newVal });
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                add.affectsScope === false
                  ? "bg-slate-500/20 text-slate-600 border border-slate-500/50"
                  : "bg-slate-100 text-slate-500 border border-slate-300 hover:text-slate-700"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Scope Impact Section (expanded when affectsScope = true) */}
      {add.affectsScope === true && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-600 mb-3">Scope Impact</div>

          {/* What changed */}
          <div className="mb-3">
            <label className="block text-[11px] text-slate-500 mb-1">What changed:</label>
            <textarea
              value={localScopeImpact}
              onChange={(e) => {
                setLocalScopeImpact(e.target.value);
                if (scopeImpactTimer.current) clearTimeout(scopeImpactTimer.current);
                scopeImpactTimer.current = setTimeout(() => {
                  onUpdate(add._id, { scopeImpact: e.target.value });
                }, 800);
              }}
              placeholder="Describe the scope change..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm resize-none"
              readOnly={isDemo}
            />
          </div>

          {/* Impact Areas */}
          <div className="mb-3">
            <label className="block text-[11px] text-slate-500 mb-1.5">Impact Areas:</label>
            <div className="flex flex-wrap gap-2">
              {IMPACT_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => !isDemo && toggleImpactCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors capitalize ${
                    impactCats.includes(cat)
                      ? "bg-amber-50 text-amber-600 border border-amber-500/50"
                      : "bg-white text-slate-500 border border-slate-200 hover:text-slate-600"
                  }`}
                >
                  {impactCats.includes(cat) ? "✓ " : ""}{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Re-priced */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Re-priced?</span>
              <button
                onClick={() => {
                  if (isDemo) return;
                  const newVal = !add.repriced;
                  onUpdate(add._id, {
                    repriced: newVal,
                    repricedDate: newVal ? new Date().toISOString().split("T")[0] : undefined,
                    incorporated: newVal,
                  });
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  add.repriced
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-500/50"
                    : "bg-red-50 text-red-600 border border-red-500/30"
                }`}
              >
                {add.repriced ? "✓ Yes" : "✗ No"}
              </button>
            </div>
            {add.repriced && add.repricedDate && (
              <span className="text-[11px] text-slate-500">Date: {add.repricedDate}</span>
            )}
            {!add.repriced && (
              <span className="text-[11px] font-semibold text-red-600">⚠ NEEDS RE-PRICING</span>
            )}
          </div>

          {/* Price Impact */}
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">{add.repriced ? "Price Impact:" : "Estimated Impact:"}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">$</span>
              <input
                type="number"
                value={localPriceImpact}
                onChange={(e) => {
                  setLocalPriceImpact(e.target.value);
                  const num = parseFloat(e.target.value);
                  if (priceImpactTimer.current) clearTimeout(priceImpactTimer.current);
                  priceImpactTimer.current = setTimeout(() => {
                    if (!isNaN(num)) onUpdate(add._id, { priceImpact: num });
                  }, 800);
                }}
                placeholder="0"
                className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm"
                readOnly={isDemo}
              />
              {localPriceImpact && !isNaN(parseFloat(localPriceImpact)) && (
                <span className={`text-xs font-bold ${parseFloat(localPriceImpact) > 0 ? "text-red-600" : parseFloat(localPriceImpact) < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                  {parseFloat(localPriceImpact) > 0 ? "+" : ""}${parseFloat(localPriceImpact).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-3">
        <label className="block text-[11px] text-slate-500 mb-1">Notes:</label>
        <textarea
          value={localNotes}
          onChange={(e) => {
            setLocalNotes(e.target.value);
            if (notesTimer.current) clearTimeout(notesTimer.current);
            notesTimer.current = setTimeout(() => {
              onUpdate(add._id, { notes: e.target.value });
            }, 800);
          }}
          placeholder="Any additional notes..."
          rows={1}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-sm resize-none"
          readOnly={isDemo}
        />
      </div>

      {/* Status Footer */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${status.color}`}>{status.icon}</span>
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
        <button
          onClick={() => !isDemo && onUpdate(add._id, { acknowledged: !add.acknowledged })}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${add.acknowledged ? "text-emerald-600" : "text-slate-500 hover:text-slate-600"}`}
        >
          <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${add.acknowledged ? "bg-emerald-50 border-emerald-500" : "border-slate-300"}`}>{add.acknowledged ? "✓" : ""}</span>
          Acknowledged
        </button>
      </div>
    </div>
  );
}
