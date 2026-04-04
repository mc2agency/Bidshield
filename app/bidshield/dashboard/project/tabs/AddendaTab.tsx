"use client";
import { DEMO_ADDENDA as IMPORTED_ADDENDA } from "@/lib/bidshield/demo-data";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const IMPACT_OPTIONS = ["material", "labor", "schedule", "scope"] as const;

function isReviewed(add: any): boolean {
  // reviewStatus is authoritative; treat missing as pending_review
  return add.reviewStatus === "reviewed";
}

function getAddendumStatus(add: any): { label: string; color: string; icon: string } {
  if (!isReviewed(add)) {
    return { label: "Pending Review", color: "text-red-600", icon: "!" };
  }
  if (add.affectsScope === true && add.repriced) {
    return { label: "Reviewed & Re-priced", color: "text-emerald-600", icon: "✓" };
  }
  if (add.affectsScope === false) {
    return { label: "Reviewed — No impact", color: "text-emerald-600", icon: "✓" };
  }
  if (add.affectsScope === true && !add.repriced) {
    return { label: "Reviewed — Needs Re-price", color: "text-amber-600", icon: "!" };
  }
  return { label: "Reviewed", color: "text-emerald-600", icon: "✓" };
}

function cardBorderColor(add: any): string {
  const priority = add.priority || "normal";
  if (!isReviewed(add)) return "border-l-4 border-l-red-500";
  if (priority === "critical") return "border-l-4 border-l-red-500";
  if (add.affectsScope === true && !add.repriced) return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-emerald-500";
}

export default function AddendaTab({ projectId, isDemo, isPro, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const createAddendumMut = useMutation(api.bidshield.createAddendum);
  const updateAddendumMut = useMutation(api.bidshield.updateAddendum);
  const deleteAddendumMut = useMutation(api.bidshield.deleteAddendum);
  const acknowledgeNoAddendaMut = useMutation(api.bidshield.acknowledgeNoAddenda);

  const [showAdd, setShowAdd] = useState(false);
  const [newAddendum, setNewAddendum] = useState({
    title: "",
    receivedDate: new Date().toISOString().split("T")[0],
    priority: "normal",
    notes: "",
  });
  const [impactCheckLoading, setImpactCheckLoading] = useState(false);
  const [impactCheckResults, setImpactCheckResults] = useState<{ section: string; action: string }[] | null>(null);

  // Demo data with enhanced fields
  const [demoAddendaState, setDemoAddendaState] = useState<any[]>([
    {
      _id: "demo_add_1" as any, number: 1, title: "Revised mechanical equipment schedule",
      receivedDate: "2026-02-03", affectsScope: true, acknowledged: true, incorporated: true,
      scopeImpact: "Added 2 new RTU curbs requiring additional curb adapters and flashing",
      impactCategories: "material,labor", repriced: true, repricedDate: "2026-02-04",
      priceImpact: 2800, priority: "normal",
      notes: "Added to takeoff. Updated quote from ABC Supply.",
      reviewStatus: "reviewed", reviewedBy: "demo_user", reviewedAt: 1738713600000,
    },
    {
      _id: "demo_add_2" as any, number: 2, title: "Clarification on warranty requirements",
      receivedDate: "2026-02-05", affectsScope: false, acknowledged: true, incorporated: false,
      scopeImpact: undefined, impactCategories: undefined, repriced: undefined, repricedDate: undefined,
      priceImpact: undefined, priority: "normal",
      notes: "Confirms 20-year NDL. No change to our pricing.",
      reviewStatus: "reviewed", reviewedBy: "demo_user", reviewedAt: 1738886400000,
    },
    {
      _id: "demo_add_3" as any, number: 3, title: "Changed parapet coping to stainless steel",
      receivedDate: "2026-02-07", affectsScope: true, acknowledged: false, incorporated: false,
      scopeImpact: "All aluminum coping replaced with stainless steel. 1,200 LF affected.",
      impactCategories: "material", repriced: false, repricedDate: undefined,
      priceImpact: undefined, priority: "critical",
      notes: "",
      reviewStatus: "pending_review", reviewedBy: undefined, reviewedAt: undefined,
    },
  ]);

  const resolvedAddenda = isDemo ? demoAddendaState : (addenda ?? []);
  const nextNumber = resolvedAddenda.length > 0 ? Math.max(...resolvedAddenda.map((a: any) => a.number)) + 1 : 1;

  // --- Stats ---
  const totalAddenda = resolvedAddenda.length;
  const reviewedCount = resolvedAddenda.filter((a: any) => isReviewed(a)).length;
  const pendingReviewCount = totalAddenda - reviewedCount;
  const scopeAffecting = resolvedAddenda.filter((a: any) => a.affectsScope === true).length;
  const repricedCount = resolvedAddenda.filter((a: any) => a.affectsScope === true && a.repriced === true).length;
  const pendingRePrice = resolvedAddenda.filter((a: any) => a.affectsScope === true && !a.repriced).length;
  const netPriceImpact = resolvedAddenda.reduce((sum: number, a: any) => sum + (a.priceImpact || 0), 0);
  const noAddendaAcknowledged = (project as any)?.noAddendaAcknowledged ?? false;

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
    setImpactCheckResults(null);
    setShowAdd(false);
  };

  const handleImpactCheck = async () => {
    const desc = [newAddendum.title, newAddendum.notes].filter(Boolean).join(". ");
    if (!desc.trim()) return;
    setImpactCheckLoading(true);
    setImpactCheckResults(null);
    try {
      const res = await fetch("/api/bidshield/check-addendum-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();
      setImpactCheckResults(data.impacts ?? []);
    } catch {
      setImpactCheckResults([]);
    } finally {
      setImpactCheckLoading(false);
    }
  };

  const handleUpdate = useCallback(async (addendumId: Id<"bidshield_addenda">, updates: Record<string, any>) => {
    if (isDemo) {
      setDemoAddendaState(prev => prev.map(a => a._id === addendumId ? { ...a, ...updates } : a));
      return;
    }
    await updateAddendumMut({ addendumId, ...updates });
  }, [isDemo, updateAddendumMut]);

  const handleMarkReviewed = useCallback(async (addendumId: Id<"bidshield_addenda">) => {
    const updates = {
      reviewStatus: "reviewed" as const,
      reviewedBy: userId ?? "unknown",
      reviewedAt: Date.now(),
    };
    if (isDemo) {
      setDemoAddendaState(prev => prev.map(a => a._id === addendumId ? { ...a, ...updates } : a));
      return;
    }
    await updateAddendumMut({ addendumId, ...updates });
  }, [isDemo, userId, updateAddendumMut]);

  const handleDelete = async (addendumId: Id<"bidshield_addenda">) => {
    if (isDemo) {
      setDemoAddendaState(prev => prev.filter(a => a._id !== addendumId));
      return;
    }
    await deleteAddendumMut({ addendumId });
  };

  const handleAcknowledgeNoAddenda = async () => {
    if (isDemo || !userId || !isValidConvexId) return;
    await acknowledgeNoAddendaMut({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary Bar ── */}
      {totalAddenda > 0 ? (
        pendingReviewCount > 0 ? (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm font-bold text-red-800">
                  {totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"} — {reviewedCount} reviewed, {pendingReviewCount} pending
                </div>
                <p className="text-xs text-red-600 mt-0.5">
                  Unreviewed addenda are a bid-day blocker. Mark each one as reviewed before submitting.
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                BLOCKING
              </span>
            </div>
            {netPriceImpact !== 0 && (
              <div className="mt-2 text-xs text-red-700">
                Net price impact: <span className="font-bold">{netPriceImpact > 0 ? "+" : ""}${netPriceImpact.toLocaleString()}</span>
              </div>
            )}
          </div>
        ) : pendingRePrice > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-sm font-bold text-amber-800">
              {totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"} — {reviewedCount} reviewed ✓ · {pendingRePrice} need{pendingRePrice === 1 ? "s" : ""} re-pricing
            </div>
            <p className="text-xs text-amber-600 mt-1">All addenda reviewed, but scope changes need updated pricing.</p>
            {netPriceImpact !== 0 && (
              <div className="mt-1 text-xs text-amber-700">
                Net impact: <span className="font-bold">{netPriceImpact > 0 ? "+" : ""}${netPriceImpact.toLocaleString()}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-sm font-bold text-emerald-700">
              {totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"} — all {reviewedCount} reviewed ✓
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">
              {scopeAffecting} affect scope · {repricedCount} re-priced
              {netPriceImpact !== 0 && ` · net ${netPriceImpact > 0 ? "+" : ""}$${netPriceImpact.toLocaleString()}`}
            </div>
          </div>
        )
      ) : (
        /* 0 addenda — prompt for confirmation */
        noAddendaAcknowledged ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✓</span>
            <div>
              <div className="text-sm font-bold text-emerald-700">No addenda confirmed</div>
              <div className="text-xs text-emerald-600 mt-0.5">You&apos;ve confirmed no addenda were received for this project.</div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-sm font-bold text-amber-800 mb-1">Confirm: no addenda received for this project?</div>
            <p className="text-xs text-amber-600 mb-3">
              If the GC issued no addenda, acknowledge it here so the Validator knows this was intentional — not an oversight.
            </p>
            {!isDemo && (
              <button
                onClick={handleAcknowledgeNoAddenda}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                ✓ Confirm — No Addenda Received
              </button>
            )}
            {isDemo && (
              <span className="text-xs text-amber-500 italic">Demo mode — confirmation disabled</span>
            )}
          </div>
        )
      )}

      {/* Add button */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"}</span>
        {!isDemo && (
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Addendum
          </button>
        )}
      </div>

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

            {(isPro || isDemo) && newAddendum.title && (
              <div>
                <button
                  onClick={handleImpactCheck}
                  disabled={impactCheckLoading}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)", color: "white" }}
                >
                  {impactCheckLoading ? "Checking..." : "Check Addendum Impact"}
                </button>
                {impactCheckResults && impactCheckResults.length > 0 && (
                  <div className="mt-2 rounded-lg p-3 border border-emerald-200" style={{ background: "#f0fdf4" }}>
                    <p className="text-[11px] font-semibold text-emerald-700 mb-2">Affected bid sections:</p>
                    <ul className="flex flex-col gap-1">
                      {impactCheckResults.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                          <span><strong>{item.section}:</strong> {item.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {impactCheckResults && impactCheckResults.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">No significant bid sections identified. Review manually.</p>
                )}
              </div>
            )}
            {!isPro && !isDemo && newAddendum.title && (
              <a href="/bidshield/pricing" className="inline-block text-xs text-slate-400 hover:text-emerald-600 transition-colors">
                <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Check Addendum Impact — Pro feature
              </a>
            )}

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
              onMarkReviewed={handleMarkReviewed}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0H2.25m19.5 0v3a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-3" /></svg>
          </div>
          <p className="text-sm text-slate-500 mb-2">No addenda logged for this project</p>
          <p className="text-xs text-slate-500">Click &quot;+ Add Addendum&quot; when you receive one from the GC</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">Missed addenda are one of the most common bid-day errors — BidShield tracks each one so nothing falls through.</p>
        </div>
      )}
    </div>
  );
}

function AddendumCard({
  add,
  isDemo,
  onUpdate,
  onMarkReviewed,
  onDelete,
}: {
  add: any;
  isDemo: boolean;
  onUpdate: (id: Id<"bidshield_addenda">, updates: Record<string, any>) => Promise<void>;
  onMarkReviewed: (id: Id<"bidshield_addenda">) => Promise<void>;
  onDelete: (id: Id<"bidshield_addenda">) => Promise<void>;
}) {
  const status = getAddendumStatus(add);
  const reviewed = isReviewed(add);
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
            {/* Review Status Badge */}
            {reviewed ? (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Reviewed ✓
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                Pending Review
              </span>
            )}
            {priority === "critical" && (
              <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase">Critical</span>
            )}
            {priority === "high" && (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase">High</span>
            )}
            <span className="text-xs text-slate-500">Received: {add.receivedDate}</span>
          </div>
          <div className="text-sm text-slate-900 font-medium">{add.title}</div>
          {reviewed && add.reviewedAt && (
            <div className="text-[10px] text-slate-400 mt-0.5">
              Reviewed {new Date(add.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(add._id)} className="text-slate-600 hover:text-red-600 text-xs transition-colors shrink-0">Delete</button>
      </div>

      {/* Mark as Reviewed CTA — shown prominently when pending */}
      {!reviewed && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-red-700">This addendum needs your review</div>
            <div className="text-[11px] text-red-500 mt-0.5">
              Determine if it affects your scope, then mark it as reviewed to unblock your bid.
            </div>
          </div>
          <button
            onClick={() => onMarkReviewed(add._id)}
            className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            Mark as Reviewed ✓
          </button>
        </div>
      )}

      {/* Affects Scope Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Affects Roofing Scope?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
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
              <span className="text-[11px] font-semibold text-red-600 inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                NEEDS RE-PRICING
              </span>
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
        {reviewed && (
          <button
            onClick={() => !isDemo && onUpdate(add._id, { reviewStatus: "pending_review", reviewedBy: undefined, reviewedAt: undefined })}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Undo review
          </button>
        )}
      </div>
    </div>
  );
}
