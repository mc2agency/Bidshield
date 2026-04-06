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

function getAddendumStatus(add: any): { label: string; color: string; icon: "check" | "warning" } {
  if (!isReviewed(add)) {
    return { label: "Pending Review", color: "var(--bs-red)", icon: "warning" };
  }
  if (add.affectsScope === true && add.repriced) {
    return { label: "Reviewed & Re-priced", color: "var(--bs-teal)", icon: "check" };
  }
  if (add.affectsScope === false) {
    return { label: "Reviewed — No impact", color: "var(--bs-teal)", icon: "check" };
  }
  if (add.affectsScope === true && !add.repriced) {
    return { label: "Reviewed — Needs Re-price", color: "var(--bs-amber)", icon: "warning" };
  }
  return { label: "Reviewed", color: "var(--bs-teal)", icon: "check" };
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
  const [selectedRFI, setSelectedRFI] = useState<string | null>(null);
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
    <div className="flex flex-col gap-5">

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <div className="flex items-stretch rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {([
          { label: "Total", value: totalAddenda, valueColor: "var(--bs-text-primary)" },
          { label: "Reviewed", value: reviewedCount, valueColor: "var(--bs-teal)" },
          { label: "Pending", value: pendingReviewCount, valueColor: pendingReviewCount > 0 ? "var(--bs-red)" : "var(--bs-text-dim)" },
          { label: "Needs Re-price", value: pendingRePrice, valueColor: pendingRePrice > 0 ? "var(--bs-amber)" : "var(--bs-text-dim)" },
          { label: "Net Impact", value: netPriceImpact !== 0 ? `${netPriceImpact > 0 ? "+" : ""}$${Math.abs(netPriceImpact).toLocaleString()}` : "—", valueColor: netPriceImpact > 0 ? "var(--bs-red)" : netPriceImpact < 0 ? "var(--bs-teal)" : "var(--bs-text-dim)" },
        ] as const).map(({ label, value, valueColor }, i) => (
          <div key={label} className="flex-1 px-5 py-4 flex flex-col gap-1" style={i > 0 ? { borderLeft: "1px solid var(--bs-border)" } : undefined}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>{label}</p>
            <p className="text-3xl font-black leading-none tabular-nums tracking-tight" style={{ color: valueColor }}>{value}</p>
          </div>
        ))}
        <div className="flex items-center px-5" style={{ borderLeft: "1px solid var(--bs-border)" }}>
          {pendingReviewCount > 0 ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-red)", color: "#13151a" }}>Blocking</span>
          ) : pendingRePrice > 0 ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-amber)", color: "#13151a" }}>Re-price needed</span>
          ) : totalAddenda > 0 ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-teal)", color: "#13151a" }}>All clear</span>
          ) : noAddendaAcknowledged ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-teal)", color: "#13151a" }}>None confirmed</span>
          ) : (
            <button onClick={handleAcknowledgeNoAddenda} disabled={isDemo} className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap transition-opacity cursor-pointer disabled:opacity-50" style={{ background: "var(--bs-amber)", color: "#13151a" }}>
              Confirm none
            </button>
          )}
        </div>
      </div>

      {/* ── TOOLBAR ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>{totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"}</p>
        {!isDemo && (
          <button onClick={() => setShowAdd(true)} className="h-8 px-4 text-[12px] font-semibold rounded-lg cursor-pointer transition-opacity hover:opacity-90" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
            + Add Addendum
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-teal-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--bs-text-primary)" }}>Add Addendum #{nextNumber}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Title / Description *</label>
              <input type="text" value={newAddendum.title} onChange={(e) => setNewAddendum({ ...newAddendum, title: e.target.value })} placeholder="Revised RTU schedule — 2 units upsized" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Date Received</label>
                <input type="date" value={newAddendum.receivedDate} onChange={(e) => setNewAddendum({ ...newAddendum, receivedDate: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Priority</label>
                <select value={newAddendum.priority} onChange={(e) => setNewAddendum({ ...newAddendum, priority: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Notes (optional)</label>
              <textarea value={newAddendum.notes} onChange={(e) => setNewAddendum({ ...newAddendum, notes: e.target.value })} placeholder="What does this addendum cover?" rows={2} className="w-full px-3 py-2 text-sm rounded-lg resize-none focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
            </div>

            {(isPro || isDemo) && newAddendum.title && (
              <div>
                <button
                  onClick={handleImpactCheck}
                  disabled={impactCheckLoading}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  {impactCheckLoading ? "Checking..." : "Check Addendum Impact"}
                </button>
                {impactCheckResults && impactCheckResults.length > 0 && (
                  <div className="mt-2 rounded-lg p-3" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--bs-teal)" }}>Affected bid sections:</p>
                    <ul className="flex flex-col gap-1">
                      {impactCheckResults.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--bs-text-secondary)" }}>
                          <span className="shrink-0 mt-0.5" style={{ color: "var(--bs-teal)" }}>•</span>
                          <span><strong>{item.section}:</strong> {item.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {impactCheckResults && impactCheckResults.length === 0 && (
                  <p className="mt-2 text-xs" style={{ color: "var(--bs-text-muted)" }}>No significant bid sections identified. Review manually.</p>
                )}
              </div>
            )}
            {!isPro && !isDemo && newAddendum.title && (
              <a href="/bidshield/pricing" className="inline-block text-xs transition-colors" style={{ color: "var(--bs-text-dim)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-teal)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}>
                <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Check Addendum Impact — Pro feature
              </a>
            )}

            <div className="flex gap-3">
              <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Save</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADDENDA LIST ──────────────────────────────────────────────────────── */}
      {resolvedAddenda.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest w-10" style={{ color: "var(--bs-text-muted)" }}>#</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Title</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hidden sm:table-cell w-28" style={{ color: "var(--bs-text-muted)" }}>Received</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest w-36" style={{ color: "var(--bs-text-muted)" }}>Status</th>
                <th className="px-5 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {[...resolvedAddenda].sort((a: any, b: any) => a.number - b.number).map((add: any) => {
                const status = getAddendumStatus(add);
                const reviewed = isReviewed(add);
                const priority = add.priority || "normal";
                const isExpanded = selectedRFI === add._id;
                const rowBorderColor = !reviewed ? "var(--bs-red)" : add.affectsScope && !add.repriced ? "var(--bs-amber)" : "var(--bs-teal)";
                const rowBg = isExpanded ? "var(--bs-bg-elevated)" : undefined;
                return (
                  <>
                    <tr
                      key={add._id}
                      onClick={() => setSelectedRFI(isExpanded ? null : add._id)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid var(--bs-border)", borderLeft: `3px solid ${rowBorderColor}`, background: rowBg }}
                      onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"; }}
                      onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-bold" style={{ color: "var(--bs-text-muted)" }}>#{add.number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{add.title}</span>
                          {priority === "critical" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ background: "var(--bs-red)", color: "#13151a" }}>Critical</span>}
                          {priority === "high" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ background: "var(--bs-amber)", color: "#13151a" }}>High</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{add.receivedDate ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                          style={{
                            background: !reviewed ? "var(--bs-red)" : add.affectsScope && !add.repriced ? "var(--bs-amber)" : "var(--bs-teal)",
                            color: "#13151a",
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--bs-text-muted)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${add._id}-detail`} style={{ borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                        <td colSpan={5} className="px-5 py-4">
                          <AddendumCard
                            add={add}
                            isDemo={isDemo}
                            onUpdate={handleUpdate}
                            onMarkReviewed={handleMarkReviewed}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg className="w-6 h-6" style={{ color: "var(--bs-text-muted)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0H2.25m19.5 0v3a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-3" /></svg>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--bs-text-secondary)" }}>No addenda logged</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--bs-text-muted)" }}>Missed addenda are one of the most common bid-day errors. Log each one when received from the GC.</p>
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
    <div className={`rounded-xl p-5 ${cardBorderColor(add)}`} style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-secondary)" }}>#{add.number}</span>
            {/* Review Status Badge */}
            {reviewed ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
                Reviewed
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }}>
                Pending Review
              </span>
            )}
            {priority === "critical" && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }}>Critical</span>
            )}
            {priority === "high" && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)" }}>High</span>
            )}
            <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>Received: {add.receivedDate}</span>
          </div>
          <div className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{add.title}</div>
          {reviewed && add.reviewedAt && (
            <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
              Reviewed {new Date(add.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(add._id)} className="text-xs transition-colors shrink-0" style={{ color: "var(--bs-text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-red)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>Delete</button>
      </div>

      {/* Mark as Reviewed CTA — shown prominently when pending */}
      {!reviewed && (
        <div className="mt-4 p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>
          <div>
            <div className="text-xs font-semibold" style={{ color: "var(--bs-red)" }}>This addendum needs your review</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--bs-red)" }}>
              Determine if it affects your scope, then mark it as reviewed to unblock your bid.
            </div>
          </div>
          <button
            onClick={() => onMarkReviewed(add._id)}
            className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: "var(--bs-teal)", color: "#13151a" }}
          >
            Mark as Reviewed
          </button>
        </div>
      )}

      {/* Affects Scope Toggle */}
      <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--bs-border)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>Affects Roofing Scope?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newVal = add.affectsScope === true ? undefined : true;
                onUpdate(add._id, { affectsScope: newVal });
              }}
              className="px-3 py-1 text-xs font-medium rounded transition-colors"
              style={add.affectsScope === true
                ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }
                : { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
            >
              Yes
            </button>
            <button
              onClick={() => {
                const newVal = add.affectsScope === false ? undefined : false;
                onUpdate(add._id, { affectsScope: newVal });
              }}
              className="px-3 py-1 text-xs font-medium rounded transition-colors"
              style={add.affectsScope === false
                ? { background: "var(--bs-bg-elevated)", color: "var(--bs-text-secondary)", border: "1px solid var(--bs-border)" }
                : { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Scope Impact Section (expanded when affectsScope = true) */}
      {add.affectsScope === true && (
        <div className="mt-3 p-4 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
          <div className="text-xs font-semibold mb-3" style={{ color: "var(--bs-text-secondary)" }}>Scope Impact</div>

          {/* What changed */}
          <div className="mb-3">
            <label className="block text-[11px] mb-1" style={{ color: "var(--bs-text-muted)" }}>What changed:</label>
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
              className="w-full px-3 py-2 text-sm rounded-lg resize-none focus:outline-none"
              style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
              readOnly={isDemo}
            />
          </div>

          {/* Impact Areas */}
          <div className="mb-3">
            <label className="block text-[11px] mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Impact Areas:</label>
            <div className="flex flex-wrap gap-2">
              {IMPACT_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => !isDemo && toggleImpactCategory(cat)}
                  className="px-2.5 py-1 text-xs font-medium rounded transition-colors capitalize"
                  style={impactCats.includes(cat)
                    ? { background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)" }
                    : { background: "var(--bs-bg-card)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Re-priced */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>Re-priced?</span>
              <button
                onClick={() => {
                  const newVal = !add.repriced;
                  onUpdate(add._id, {
                    repriced: newVal,
                    repricedDate: newVal ? new Date().toISOString().split("T")[0] : undefined,
                    incorporated: newVal,
                  });
                }}
                className="px-3 py-1 text-xs font-medium rounded transition-colors"
                style={add.repriced
                  ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }
                  : { background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }}
              >
                {add.repriced ? "Yes" : "No"}
              </button>
            </div>
            {add.repriced && add.repricedDate && (
              <span className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>Date: {add.repricedDate}</span>
            )}
            {!add.repriced && (
              <span className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--bs-red)" }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                NEEDS RE-PRICING
              </span>
            )}
          </div>

          {/* Price Impact */}
          <div>
            <label className="block text-[11px] mb-1" style={{ color: "var(--bs-text-muted)" }}>{add.repriced ? "Price Impact:" : "Estimated Impact:"}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--bs-text-muted)" }}>$</span>
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
                className="w-32 px-3 py-1.5 text-sm rounded-lg focus:outline-none"
                style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                readOnly={isDemo}
              />
              {localPriceImpact && !isNaN(parseFloat(localPriceImpact)) && (
                <span className="text-xs font-bold" style={{ color: parseFloat(localPriceImpact) > 0 ? "var(--bs-red)" : parseFloat(localPriceImpact) < 0 ? "var(--bs-teal)" : "var(--bs-text-muted)" }}>
                  {parseFloat(localPriceImpact) > 0 ? "+" : ""}${parseFloat(localPriceImpact).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-3">
        <label className="block text-[11px] mb-1" style={{ color: "var(--bs-text-muted)" }}>Notes:</label>
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
          className="w-full px-3 py-1.5 text-sm rounded-lg resize-none focus:outline-none"
          style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          readOnly={isDemo}
        />
      </div>

      {/* Status Footer */}
      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--bs-border)" }}>
        <div className="flex items-center gap-2">
          {status.icon === "check" ? (
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: status.color }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: status.color }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          )}
          <span className="text-xs font-medium" style={{ color: status.color }}>{status.label}</span>
        </div>
        {reviewed && (
          <button
            onClick={() => !isDemo && onUpdate(add._id, { reviewStatus: "pending_review", reviewedBy: undefined, reviewedAt: undefined })}
            className="text-[11px] transition-colors"
            style={{ color: "var(--bs-text-dim)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
          >
            Undo review
          </button>
        )}
      </div>
    </div>
  );
}
