"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { ASSEMBLY_TYPES } from "@/lib/bidshield/constants";

const DEMO_ALTERNATES = [
  { _id: "alt_1", label: "Alt 1 — Add 4\" Tapered Polyiso", type: "add" as const, amount: 42500, description: "Full tearoff and re-insulate NE quadrant with tapered system" },
  { _id: "alt_2", label: "Alt 2 — Deduct TPO to 45mil", type: "deduct" as const, amount: 18200, description: "Substitute 60mil TPO for 45mil on RT-1 field only" },
];

const LOSS_REASONS = [
  "Price too high", "Scope issue", "Missed deadline", "GC preference",
  "Bonding issue", "Schedule conflict", "Incomplete bid", "Other",
];

function varianceColor(pct: number): string {
  const abs = Math.abs(pct);
  if (abs <= 5) return "text-emerald-600";
  if (abs <= 10) return "text-amber-600";
  return "text-red-600";
}

function varianceBg(pct: number): string {
  const abs = Math.abs(pct);
  if (abs <= 5) return "bg-emerald-50 border-emerald-500/30";
  if (abs <= 10) return "bg-amber-50 border-amber-500/30";
  return "bg-red-50 border-red-500/30";
}

export default function PricingTab({ projectId, isDemo, isPro, project, userId, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const updateProject = useMutation(api.bidshield.updateProject);
  const [editing, setEditing] = useState(false);
  const [editingActuals, setEditingActuals] = useState(false);

  // Alternates
  const alternates = useQuery(
    api.bidshield.getAlternates,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const addAlternate = useMutation(api.bidshield.addAlternate);
  const updateAlternate = useMutation(api.bidshield.updateAlternate);
  const deleteAlternate = useMutation(api.bidshield.deleteAlternate);
  const altList = isDemo ? DEMO_ALTERNATES : (alternates ?? []);
  const [showAltForm, setShowAltForm] = useState(false);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altForm, setAltForm] = useState({ label: "", type: "add" as "add" | "deduct", amount: "", description: "" });
  const [altSaving, setAltSaving] = useState(false);

  const allProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );
  const projectMaterials = useQuery(
    api.bidshield.getProjectMaterials,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const computedMaterialTotal = Math.round(
    (projectMaterials ?? []).reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0)
  );

  const laborTotal = useQuery(
    api.bidshield.getLaborTotal,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const computedLaborTotal = isDemo ? 77430 : (laborTotal ?? 0);

  const gcItems = useQuery(
    api.bidshield.getGCItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const gcLineItemsTotal = (gcItems ?? []).filter((i: any) => !i.isMarkup).reduce((s: number, i: any) => s + (i.total ?? 0), 0);
  const gcMarkupBase = computedMaterialTotal + computedLaborTotal + gcLineItemsTotal;
  const gcMarkupTotal = (gcItems ?? []).filter((i: any) => i.isMarkup).reduce((s: number, i: any) => s + gcMarkupBase * ((i.markupPct ?? 0) / 100), 0);
  const computedGCTotal = Math.round(gcLineItemsTotal + gcMarkupTotal);

  const grossRoofArea: number | null = isDemo ? 68000 : (project?.grossRoofArea ?? null);

  const [demoPricing, setDemoPricing] = useState({
    totalBidAmount: 1250000 as number | undefined, materialCost: 612000 as number | undefined, laborCost: 488000 as number | undefined, otherCost: 150000 as number | undefined,
    primaryAssembly: "TPO 60mil Mechanically Attached" as string | undefined,
    lossReason: undefined as string | undefined, lossReasonNote: undefined as string | undefined,
    actualCost: undefined as number | undefined, actualMaterialCost: undefined as number | undefined,
    actualLaborCost: undefined as number | undefined, actualOtherCost: undefined as number | undefined,
    postJobStatus: undefined as string | undefined, postJobNotes: undefined as string | undefined,
    completedDate: undefined as string | undefined,
  });

  const pricing = isDemo ? demoPricing : {
    totalBidAmount: project?.totalBidAmount, materialCost: project?.materialCost,
    laborCost: project?.laborCost, otherCost: project?.otherCost,
    primaryAssembly: project?.primaryAssembly, lossReason: project?.lossReason,
    lossReasonNote: project?.lossReasonNote, actualCost: project?.actualCost,
    actualMaterialCost: project?.actualMaterialCost, actualLaborCost: project?.actualLaborCost,
    actualOtherCost: project?.actualOtherCost, postJobStatus: project?.postJobStatus,
    postJobNotes: project?.postJobNotes, completedDate: project?.completedDate,
  };

  const [form, setForm] = useState({
    totalBidAmount: "", otherCost: "",
    primaryAssembly: "", lossReason: "", lossReasonNote: "",
  });

  const [actualsForm, setActualsForm] = useState({
    actualCost: "", actualMaterialCost: "", actualLaborCost: "", actualOtherCost: "",
    postJobStatus: "", postJobNotes: "", completedDate: "",
  });

  const startEdit = () => {
    setForm({
      totalBidAmount: pricing.totalBidAmount?.toString() ?? "",
      otherCost: pricing.otherCost?.toString() ?? "",
      primaryAssembly: pricing.primaryAssembly ?? "",
      lossReason: pricing.lossReason ?? "",
      lossReasonNote: pricing.lossReasonNote ?? "",
    });
    setEditing(true);
  };

  const startEditActuals = () => {
    setActualsForm({
      actualCost: pricing.actualCost?.toString() ?? "", actualMaterialCost: pricing.actualMaterialCost?.toString() ?? "",
      actualLaborCost: pricing.actualLaborCost?.toString() ?? "", actualOtherCost: pricing.actualOtherCost?.toString() ?? "",
      postJobStatus: pricing.postJobStatus ?? "in_progress", postJobNotes: pricing.postJobNotes ?? "",
      completedDate: pricing.completedDate ?? "",
    });
    setEditingActuals(true);
  };

  const handleSave = async () => {
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    if (isDemo) {
      setDemoPricing(p => ({ ...p, totalBidAmount: parse(form.totalBidAmount) ?? p.totalBidAmount, otherCost: parse(form.otherCost) ?? p.otherCost, primaryAssembly: form.primaryAssembly || p.primaryAssembly, lossReason: form.lossReason || undefined, lossReasonNote: form.lossReasonNote || undefined }));
      setEditing(false); return;
    }
    if (!isValidConvexId) { setEditing(false); return; }
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: parse(form.totalBidAmount),
      otherCost: parse(form.otherCost),
      primaryAssembly: form.primaryAssembly || undefined, lossReason: form.lossReason || undefined,
      lossReasonNote: form.lossReasonNote || undefined,
    });
    setEditing(false);
  };

  const handleSaveActuals = async () => {
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    if (isDemo) {
      setDemoPricing(p => ({ ...p, actualCost: parse(actualsForm.actualCost), actualMaterialCost: parse(actualsForm.actualMaterialCost), actualLaborCost: parse(actualsForm.actualLaborCost), actualOtherCost: parse(actualsForm.actualOtherCost), postJobStatus: actualsForm.postJobStatus || undefined, postJobNotes: actualsForm.postJobNotes || undefined, completedDate: actualsForm.completedDate || undefined }));
      setEditingActuals(false); return;
    }
    if (!isValidConvexId) { setEditingActuals(false); return; }
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      actualCost: parse(actualsForm.actualCost), actualMaterialCost: parse(actualsForm.actualMaterialCost),
      actualLaborCost: parse(actualsForm.actualLaborCost), actualOtherCost: parse(actualsForm.actualOtherCost),
      postJobStatus: actualsForm.postJobStatus || undefined, postJobNotes: actualsForm.postJobNotes || undefined,
      completedDate: actualsForm.completedDate || undefined,
    });
    setEditingActuals(false);
  };

  const dollarPerSf = pricing.totalBidAmount && grossRoofArea && grossRoofArea > 0 ? pricing.totalBidAmount / grossRoofArea : null;
  const fmtDollar = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const assembly = pricing.primaryAssembly;
  const similarProjects = (allProjects ?? []).filter((p: any) =>
    p.primaryAssembly === assembly && p.totalBidAmount && p.grossRoofArea && p.grossRoofArea > 0 && p._id !== projectId
  );
  const avgDollarPerSf = similarProjects.length >= 3
    ? similarProjects.reduce((sum: number, p: any) => sum + p.totalBidAmount / p.grossRoofArea, 0) / similarProjects.length
    : null;

  // Sanity check: components should sum to total bid
  const effectiveGC = pricing.otherCost ?? (computedGCTotal > 0 ? computedGCTotal : 0);
  const componentSum = computedMaterialTotal + computedLaborTotal + effectiveGC;
  const totalBid = pricing.totalBidAmount ?? 0;
  const componentSumMismatch = totalBid > 0 && componentSum > 0 && Math.abs(componentSum - totalBid) / totalBid > 0.01;
  const variance = dollarPerSf && avgDollarPerSf ? ((dollarPerSf - avgDollarPerSf) / avgDollarPerSf) * 100 : null;
  const healthColor = variance === null ? "text-slate-500" : Math.abs(variance) <= 5 ? "text-emerald-600" : Math.abs(variance) <= 15 ? "text-amber-600" : "text-red-600";
  const healthLabel = !dollarPerSf ? "Enter bid amount" : !assembly ? "Set assembly type" : similarProjects.length < 3 ? "Need more data" : Math.abs(variance!) <= 5 ? "On Target" : Math.abs(variance!) <= 15 ? "Watch" : "Off Target";

  const status = project?.status || "setup";
  const isWon = status === "won";
  const isLost = status === "lost";

  // Variance calculations
  const hasActuals = !!(pricing.actualCost);
  const totalVariance = hasActuals && pricing.totalBidAmount ? pricing.actualCost! - pricing.totalBidAmount : null;
  const totalVariancePct = hasActuals && pricing.totalBidAmount ? ((pricing.actualCost! - pricing.totalBidAmount) / pricing.totalBidAmount) * 100 : null;
  const effectiveMaterialCost = computedMaterialTotal > 0 ? computedMaterialTotal : (pricing.materialCost ?? 0);
  const matVariance = pricing.actualMaterialCost && effectiveMaterialCost ? pricing.actualMaterialCost - effectiveMaterialCost : null;
  const matVariancePct = pricing.actualMaterialCost && effectiveMaterialCost ? ((pricing.actualMaterialCost - effectiveMaterialCost) / effectiveMaterialCost) * 100 : null;
  const effectiveLaborCost = computedLaborTotal > 0 ? computedLaborTotal : (pricing.laborCost ?? 0);
  const labVariance = pricing.actualLaborCost && effectiveLaborCost ? pricing.actualLaborCost - effectiveLaborCost : null;
  const labVariancePct = pricing.actualLaborCost && effectiveLaborCost ? ((pricing.actualLaborCost - effectiveLaborCost) / effectiveLaborCost) * 100 : null;
  const othVariance = pricing.actualOtherCost && pricing.otherCost ? pricing.actualOtherCost - pricing.otherCost : null;
  const othVariancePct = pricing.actualOtherCost && pricing.otherCost ? ((pricing.actualOtherCost - pricing.otherCost) / pricing.otherCost) * 100 : null;
  const actualDpsf = pricing.actualCost && grossRoofArea && grossRoofArea > 0 ? pricing.actualCost / grossRoofArea : null;
  const dpsfVariance = actualDpsf && dollarPerSf ? actualDpsf - dollarPerSf : null;
  const dpsfVariancePct = actualDpsf && dollarPerSf ? ((actualDpsf - dollarPerSf) / dollarPerSf) * 100 : null;

  const postJobStatus = pricing.postJobStatus || (hasActuals ? "actuals_entered" : "in_progress");

  const saveAlt = async () => {
    if (!altForm.label.trim()) return;
    const amt = parseFloat(altForm.amount);
    setAltSaving(true);
    try {
      if (editingAltId) {
        await updateAlternate({
          alternateId: editingAltId as Id<"bidshield_alternates">,
          userId: userId!,
          label: altForm.label,
          type: altForm.type,
          amount: isNaN(amt) ? undefined : amt,
          description: altForm.description || undefined,
        });
        setEditingAltId(null);
      } else {
        await addAlternate({
          projectId: projectId as Id<"bidshield_projects">,
          userId: userId!,
          label: altForm.label,
          type: altForm.type,
          amount: isNaN(amt) ? undefined : amt,
          description: altForm.description || undefined,
          sortOrder: altList.length,
        });
        setShowAltForm(false);
      }
      setAltForm({ label: "", type: "add", amount: "", description: "" });
    } finally {
      setAltSaving(false);
    }
  };

  const startEditAlt = (a: any) => {
    setAltForm({ label: a.label, type: a.type, amount: a.amount?.toString() ?? "", description: a.description ?? "" });
    setEditingAltId(a._id);
    setShowAltForm(false);
  };

  const cancelAlt = () => {
    setShowAltForm(false);
    setEditingAltId(null);
    setAltForm({ label: "", type: "add", amount: "", description: "" });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Section subtitle */}
      <p className="text-sm text-slate-500 -mb-1">
        Your bid total rollup — material, labor, and general conditions costs flow in automatically from their respective sections.
      </p>

      {/* Sanity check warning */}
      {componentSumMismatch && (
        <div className="bg-amber-50 border border-amber-400/50 rounded-xl px-4 py-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <div>
            <div className="text-xs font-semibold text-amber-700">Cost components don&rsquo;t add up to Total Bid</div>
            <div className="text-xs text-amber-600 mt-0.5">
              Material ({fmtDollar(computedMaterialTotal)}) + Labor ({fmtDollar(computedLaborTotal)}) + Gen. Conds ({fmtDollar(effectiveGC)}) = {fmtDollar(componentSum)}, but Total Bid is {fmtDollar(totalBid)} (${Math.abs(componentSum - totalBid).toLocaleString()} difference).
            </div>
          </div>
        </div>
      )}

      {/* Bid Pricing Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Bid Pricing & Outcome</h3>
          {(isPro || isDemo) ? (
            <button onClick={editing ? handleSave : startEdit} className={`text-xs font-medium transition-colors ${editing ? "text-emerald-600 hover:text-emerald-300" : "text-slate-500 hover:text-slate-700"}`}>
              {editing ? "Save" : "Edit"}
            </button>
          ) : (
            <a href="/bidshield/pricing" className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Edit · Pro
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {/* Total Bid */}
          <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", borderLeft: "4px solid #334155", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {editing ? <input type="number" value={form.totalBidAmount} onChange={(e) => setForm({ ...form, totalBidAmount: e.target.value })} placeholder="Total" className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full focus:outline-none focus:border-emerald-500" style={{ marginBottom: 4 }} /> : <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{pricing.totalBidAmount ? fmtDollar(pricing.totalBidAmount) : "—"}</div>}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Total Bid</div>
          </div>
          {/* Material */}
          <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", borderLeft: "4px solid #3b82f6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {computedMaterialTotal > 0 ? (
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{fmtDollar(computedMaterialTotal)}</div>
            ) : (
              <div style={{ fontSize: 18, fontWeight: 700, color: "#cbd5e1" }}>—</div>
            )}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Material</div>
            <button type="button" onClick={() => onNavigateTab?.("materials")} style={{ fontSize: 9, color: computedMaterialTotal > 0 ? "#3b82f6" : "#f59e0b", marginTop: 4, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              {computedMaterialTotal > 0 ? "→ Reconciliation" : "→ Upload report"}
            </button>
          </div>
          {/* Labor */}
          <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", borderLeft: "4px solid #059669", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {computedLaborTotal > 0 ? (
              <div style={{ fontSize: 20, fontWeight: 800, color: "#059669", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{fmtDollar(computedLaborTotal)}</div>
            ) : (
              <div style={{ fontSize: 18, fontWeight: 700, color: "#cbd5e1" }}>—</div>
            )}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Labor</div>
            <button type="button" onClick={() => onNavigateTab?.("labor")} style={{ fontSize: 9, color: computedLaborTotal > 0 ? "#059669" : "#f59e0b", marginTop: 4, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              {computedLaborTotal > 0 ? "→ Verification" : "→ Run analysis"}
            </button>
          </div>
          {/* Gen. Conds */}
          <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", borderLeft: "4px solid #8b5cf6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {editing ? (
              <div>
                <input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })} placeholder="Other" className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full focus:outline-none focus:border-emerald-500" style={{ marginBottom: 4 }} />
                {computedGCTotal > 0 && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, otherCost: computedGCTotal.toString() }))} style={{ fontSize: 9, color: "#f59e0b", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                    Pull from GC ({fmtDollar(computedGCTotal)})
                  </button>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 800, color: "#7c3aed", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {pricing.otherCost ? fmtDollar(pricing.otherCost) : computedGCTotal > 0 ? <span title="Computed from Gen. Conditions tab">{fmtDollar(computedGCTotal)}</span> : "—"}
              </div>
            )}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Gen. Conds</div>
          </div>
          {/* $/SF */}
          <div style={{ background: "white", borderRadius: 10, padding: "12px 14px", borderLeft: `4px solid ${dollarPerSf ? (healthColor === "text-emerald-600" ? "#059669" : healthColor === "text-amber-600" ? "#f59e0b" : "#ef4444") : "#e2e8f0"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} className="col-span-2 sm:col-span-1">
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, color: dollarPerSf ? (healthColor === "text-emerald-600" ? "#059669" : healthColor === "text-amber-600" ? "#d97706" : "#dc2626") : "#cbd5e1" }}>{dollarPerSf ? `$${dollarPerSf.toFixed(2)}` : "—"}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Cost / SF</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] text-slate-500 mb-1 block">Primary Assembly</label>
          {editing ? (
            <select value={form.primaryAssembly} onChange={(e) => setForm({ ...form, primaryAssembly: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500">
              <option value="">Select assembly...</option>
              {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <div className="text-sm text-slate-700">{pricing.primaryAssembly || "Not set"}</div>
          )}
        </div>

        {(dollarPerSf || assembly) && (
          <div className={`mb-4 p-3 rounded-lg border ${healthLabel === "On Target" ? "bg-emerald-50 border-emerald-500/30" : healthLabel === "Watch" ? "bg-amber-50 border-amber-500/30" : healthLabel === "Off Target" ? "bg-red-50 border-red-500/30" : "bg-slate-50 border-slate-300"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Bid Health</span>
              <span className={`text-xs font-bold ${healthColor}`}>{healthLabel}</span>
            </div>
            {variance !== null && (
              <div className="text-[11px] text-slate-500 mt-1">
                Your $/SF is {variance > 0 ? "+" : ""}{variance.toFixed(1)}% vs avg ${avgDollarPerSf!.toFixed(2)}/SF across {similarProjects.length} similar projects
              </div>
            )}
            {similarProjects.length < 3 && assembly && (
              <div className="text-[11px] text-slate-500 mt-1">Need at least 3 projects with &ldquo;{assembly}&rdquo; to compare. Have {similarProjects.length}.</div>
            )}
          </div>
        )}

        {isLost && (
          <div className="p-4 bg-red-50 border border-red-500/30 rounded-lg">
            <h4 className="text-xs font-semibold text-red-600 mb-2">Loss Details</h4>
            {editing ? (
              <div className="space-y-2">
                <select value={form.lossReason} onChange={(e) => setForm({ ...form, lossReason: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500">
                  <option value="">Select reason...</option>
                  {LOSS_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input value={form.lossReasonNote} onChange={(e) => setForm({ ...form, lossReasonNote: e.target.value })} placeholder="Additional notes (optional)" className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" />
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                {pricing.lossReason || "No reason recorded"}
                {pricing.lossReasonNote && <span className="text-slate-500 ml-2">— {pricing.lossReasonNote}</span>}
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} style={{ background: "#10b981" }} className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90">Save Changes</button>
            <button onClick={() => setEditing(false)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors">Cancel</button>
          </div>
        )}
      </div>

      {/* Actual Costs Section (won projects only) */}
      {isWon && (
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Actual Costs (Post-Completion)</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                postJobStatus === "actuals_entered" ? "bg-emerald-50 text-emerald-600" :
                postJobStatus === "completed" ? "bg-blue-50 text-blue-600" :
                "bg-amber-50 text-amber-600"
              }`}>
                {postJobStatus === "actuals_entered" ? "Actuals Entered" : postJobStatus === "completed" ? "Completed" : "In Progress"}
              </span>
            </div>
            {!isDemo && (
              <button onClick={editingActuals ? handleSaveActuals : startEditActuals} className={`text-xs font-medium transition-colors ${editingActuals ? "text-emerald-600 hover:text-emerald-300" : "text-slate-500 hover:text-slate-700"}`}>
                {editingActuals ? "Save" : "Edit"}
              </button>
            )}
          </div>

          {editingActuals ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Post-Job Status</label>
                  <select value={actualsForm.postJobStatus} onChange={(e) => setActualsForm({ ...actualsForm, postJobStatus: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500">
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="actuals_entered">Actuals Entered</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Completion Date</label>
                  <input type="date" value={actualsForm.completedDate} onChange={(e) => setActualsForm({ ...actualsForm, completedDate: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Total</label><input type="number" value={actualsForm.actualCost} onChange={(e) => setActualsForm({ ...actualsForm, actualCost: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Material</label><input type="number" value={actualsForm.actualMaterialCost} onChange={(e) => setActualsForm({ ...actualsForm, actualMaterialCost: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Labor</label><input type="number" value={actualsForm.actualLaborCost} onChange={(e) => setActualsForm({ ...actualsForm, actualLaborCost: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Other</label><input type="number" value={actualsForm.actualOtherCost} onChange={(e) => setActualsForm({ ...actualsForm, actualOtherCost: e.target.value })} className="bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 text-sm w-full focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Notes / Lessons Learned</label>
                <textarea value={actualsForm.postJobNotes} onChange={(e) => setActualsForm({ ...actualsForm, postJobNotes: e.target.value })} placeholder="What caused variances? Lessons for future bids..." rows={2} className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm resize-none focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveActuals} style={{ background: "#10b981" }} className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90">Save Actuals</button>
                <button onClick={() => setEditingActuals(false)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{pricing.actualCost ? fmtDollar(pricing.actualCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Total</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <div className="text-lg font-bold text-blue-600">{pricing.actualMaterialCost ? fmtDollar(pricing.actualMaterialCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Material</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <div className="text-lg font-bold text-emerald-600">{pricing.actualLaborCost ? fmtDollar(pricing.actualLaborCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Labor</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <div className="text-lg font-bold text-slate-600">{pricing.actualOtherCost ? fmtDollar(pricing.actualOtherCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Other</div>
                </div>
              </div>
              {pricing.completedDate && (
                <div className="text-xs text-slate-500 mb-2">Completed: {pricing.completedDate}</div>
              )}
              {pricing.postJobNotes && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 mb-3">{pricing.postJobNotes}</div>
              )}
              {!hasActuals && (
                <div className="text-center py-4 text-sm text-slate-500">
                  No actual costs entered yet. Click Edit to log post-completion costs.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Estimate vs Actual Comparison (won projects with actuals) */}
      {isWon && hasActuals && pricing.totalBidAmount && (
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Estimate vs. Actual Comparison</h3>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-xs text-slate-500 font-semibold">Category</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Estimated</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Actual</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Variance</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Total" estimated={pricing.totalBidAmount} actual={pricing.actualCost} varianceAmt={totalVariance} variancePct={totalVariancePct} bold />
                {effectiveMaterialCost > 0 && <ComparisonRow label="Material" estimated={effectiveMaterialCost} actual={pricing.actualMaterialCost} varianceAmt={matVariance} variancePct={matVariancePct} />}
                {pricing.laborCost && <ComparisonRow label="Labor" estimated={pricing.laborCost} actual={pricing.actualLaborCost} varianceAmt={labVariance} variancePct={labVariancePct} />}
                {pricing.otherCost && <ComparisonRow label="Other" estimated={pricing.otherCost} actual={pricing.actualOtherCost} varianceAmt={othVariance} variancePct={othVariancePct} />}
                {dollarPerSf && actualDpsf && (
                  <tr className="border-t border-slate-200">
                    <td className="py-2 px-3 text-slate-600">$/SF</td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">${dollarPerSf.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-600 tabular-nums">${actualDpsf.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right tabular-nums ${dpsfVariancePct !== null ? varianceColor(dpsfVariancePct) : "text-slate-500"}`}>
                      {dpsfVariance !== null ? `${dpsfVariance > 0 ? "+" : ""}$${dpsfVariance.toFixed(2)} (${dpsfVariancePct!.toFixed(1)}%)` : "—"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Overall Assessment */}
          {totalVariancePct !== null && (
            <div className={`p-3 rounded-lg border ${varianceBg(totalVariancePct)}`}>
              <div className={`text-sm font-semibold ${varianceColor(totalVariancePct)}`}>
                {Math.abs(totalVariancePct) <= 5 ? "On budget" : totalVariancePct > 0 ? "Over budget" : "Under budget"} ({totalVariancePct > 0 ? "+" : ""}{totalVariancePct.toFixed(1)}%)
              </div>
            </div>
          )}

          {/* Variance Bars */}
          {(matVariancePct !== null || labVariancePct !== null || othVariancePct !== null) && (
            <div className="mt-4 space-y-2">
              <div className="text-[11px] text-slate-500">Variance Breakdown:</div>
              {[
                { label: "Material", pct: matVariancePct },
                { label: "Labor", pct: labVariancePct },
                { label: "Other", pct: othVariancePct },
              ].filter(v => v.pct !== null).map((v) => (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-16">{v.label}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2" />
                      <div className="w-px bg-slate-500" />
                      <div className="w-1/2" />
                    </div>
                    {v.pct! > 0 ? (
                      <div className="absolute top-0 left-1/2 h-full bg-red-500/70 rounded-r-full" style={{ width: `${Math.min(50, Math.abs(v.pct!) * 2)}%` }} />
                    ) : (
                      <div className="absolute top-0 h-full bg-emerald-500/70 rounded-l-full" style={{ width: `${Math.min(50, Math.abs(v.pct!) * 2)}%`, right: "50%" }} />
                    )}
                  </div>
                  <span className={`text-xs font-bold w-16 text-right ${varianceColor(v.pct!)}`}>
                    {v.pct! > 0 ? "+" : ""}{v.pct!.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alternate Pricing */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Alternate Pricing</h3>
          {(isPro || isDemo) && !showAltForm && !editingAltId && (
            <button
              onClick={() => { if (!isDemo) setShowAltForm(true); }}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
            >
              + Add Alternate
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3 -mt-2">
          Base bid add/deduct alternates requested by the GC. These are listed separately from the base bid total.
        </p>

        {altList.length > 0 && (
          <div className="mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-1.5 px-2 text-xs text-slate-400 font-medium">Label</th>
                  <th className="text-center py-1.5 px-2 text-xs text-slate-400 font-medium">Type</th>
                  <th className="text-right py-1.5 px-2 text-xs text-slate-400 font-medium">Amount</th>
                  {!isDemo && <th className="w-10" />}
                </tr>
              </thead>
              <tbody>
                {altList.map((a: any) => (
                  editingAltId === a._id ? (
                    <tr key={a._id}>
                      <td colSpan={4} className="py-2 px-1">
                        <AltForm form={altForm} setForm={setAltForm} saving={altSaving} onSave={saveAlt} onCancel={cancelAlt} fmtDollar={fmtDollar} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50/50 group">
                      <td className="py-2 px-2">
                        <div className="text-xs font-medium text-slate-800">{a.label}</div>
                        {a.description && <div className="text-[10px] text-slate-400 mt-0.5">{a.description}</div>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${a.type === "add" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {a.type === "add" ? "Add" : "Deduct"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-xs text-slate-700">
                        {a.amount != null ? (
                          <span className={a.type === "add" ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>
                            {a.type === "add" ? "+" : "-"}{fmtDollar(a.amount)}
                          </span>
                        ) : "—"}
                      </td>
                      {!isDemo && (
                        <td className="py-2 px-1">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditAlt(a)} className="text-xs text-slate-400 hover:text-slate-700 px-1">✎</button>
                            <button onClick={() => deleteAlternate({ alternateId: a._id as Id<"bidshield_alternates">, userId: userId! })} className="text-xs text-slate-400 hover:text-red-500 px-1">✕</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}

        {altList.length === 0 && !showAltForm && (
          <div className="text-center py-4 text-xs text-slate-400">
            No alternates — add one if the GC requested add/deduct pricing.
          </div>
        )}

        {showAltForm && !editingAltId && (
          <AltForm form={altForm} setForm={setAltForm} saving={altSaving} onSave={saveAlt} onCancel={cancelAlt} fmtDollar={fmtDollar} />
        )}

        {!(isPro || isDemo) && (
          <a href="/bidshield/pricing" className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            Alternate Pricing · Pro
          </a>
        )}
      </div>

      {/* Info callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <p className="text-sm text-slate-500">
          Material cost pulls automatically from{" "}
          <button onClick={() => onNavigateTab?.("materials")} className="text-blue-500 hover:text-blue-700 underline underline-offset-2 font-medium">
            Material Reconciliation
          </button>
          {" "}and labor cost from{" "}
          <button onClick={() => onNavigateTab?.("labor")} className="text-emerald-600 hover:text-emerald-800 underline underline-offset-2 font-medium">
            Labor Verification
          </button>
          . Add Gen. Conds costs to complete your bid total.
        </p>
      </div>
    </div>
  );
}

function AltForm({ form, setForm, saving, onSave, onCancel, fmtDollar }: {
  form: { label: string; type: "add" | "deduct"; amount: string; description: string };
  setForm: (f: any) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  fmtDollar: (n: number) => string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Alt 1 — Add tapered ISO)"
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(["add", "deduct"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              className={`flex-1 text-xs font-semibold py-1.5 rounded transition-colors ${form.type === t ? (t === "add" ? "bg-emerald-600 text-white" : "bg-red-500 text-white") : "bg-white border border-slate-300 text-slate-500"}`}
            >
              {t === "add" ? "Add" : "Deduct"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Amount ($)"
          className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description (optional)"
          className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving || !form.label.trim()} style={{ background: "#10b981" }} className="text-white text-xs font-medium px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function ComparisonRow({ label, estimated, actual, varianceAmt, variancePct, bold }: {
  label: string; estimated?: number; actual?: number; varianceAmt: number | null; variancePct: number | null; bold?: boolean;
}) {
  const fmt = (n?: number) => n != null ? `$${n.toLocaleString()}` : "—";
  return (
    <tr className="border-b border-slate-200">
      <td className={`py-2 px-3 ${bold ? "text-slate-900 font-semibold" : "text-slate-600"}`}>{label}</td>
      <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{fmt(estimated)}</td>
      <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{fmt(actual)}</td>
      <td className={`py-2 px-3 text-right tabular-nums ${variancePct !== null ? varianceColor(variancePct) : "text-slate-500"}`}>
        {varianceAmt !== null ? `${varianceAmt > 0 ? "+" : ""}$${varianceAmt.toLocaleString()} (${variancePct!.toFixed(1)}%)` : "—"}
      </td>
    </tr>
  );
}
