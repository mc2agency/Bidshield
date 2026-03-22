"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { ASSEMBLY_TYPES } from "@/lib/bidshield/constants";

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

  const gcItems = useQuery(
    api.bidshield.getGCItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const gcLineItemsTotal = (gcItems ?? []).filter((i: any) => !i.isMarkup).reduce((s: number, i: any) => s + (i.total ?? 0), 0);
  const gcMarkupBase = computedMaterialTotal + (project?.laborCost ?? 0) + gcLineItemsTotal;
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
    totalBidAmount: "", laborCost: "", otherCost: "",
    primaryAssembly: "", lossReason: "", lossReasonNote: "",
  });

  const [actualsForm, setActualsForm] = useState({
    actualCost: "", actualMaterialCost: "", actualLaborCost: "", actualOtherCost: "",
    postJobStatus: "", postJobNotes: "", completedDate: "",
  });

  const startEdit = () => {
    setForm({
      totalBidAmount: pricing.totalBidAmount?.toString() ?? "",
      laborCost: pricing.laborCost?.toString() ?? "",
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
      setDemoPricing(p => ({ ...p, totalBidAmount: parse(form.totalBidAmount) ?? p.totalBidAmount, laborCost: parse(form.laborCost) ?? p.laborCost, otherCost: parse(form.otherCost) ?? p.otherCost, primaryAssembly: form.primaryAssembly || p.primaryAssembly, lossReason: form.lossReason || undefined, lossReasonNote: form.lossReasonNote || undefined }));
      setEditing(false); return;
    }
    if (!isValidConvexId) { setEditing(false); return; }
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: parse(form.totalBidAmount),
      laborCost: parse(form.laborCost), otherCost: parse(form.otherCost),
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
  const similarProjects = (allProjects ?? []).filter(
    (p: any) => p.primaryAssembly === assembly && p.totalBidAmount && p.sqft && p.sqft > 0 && p._id !== projectId
  );
  const avgDollarPerSf = similarProjects.length >= 3
    ? similarProjects.reduce((sum: number, p: any) => sum + p.totalBidAmount / p.sqft, 0) / similarProjects.length
    : null;
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
  const labVariance = pricing.actualLaborCost && pricing.laborCost ? pricing.actualLaborCost - pricing.laborCost : null;
  const labVariancePct = pricing.actualLaborCost && pricing.laborCost ? ((pricing.actualLaborCost - pricing.laborCost) / pricing.laborCost) * 100 : null;
  const othVariance = pricing.actualOtherCost && pricing.otherCost ? pricing.actualOtherCost - pricing.otherCost : null;
  const othVariancePct = pricing.actualOtherCost && pricing.otherCost ? ((pricing.actualOtherCost - pricing.otherCost) / pricing.otherCost) * 100 : null;
  const actualDpsf = pricing.actualCost && grossRoofArea && grossRoofArea > 0 ? pricing.actualCost / grossRoofArea : null;
  const dpsfVariance = actualDpsf && dollarPerSf ? actualDpsf - dollarPerSf : null;
  const dpsfVariancePct = actualDpsf && dollarPerSf ? ((actualDpsf - dollarPerSf) / dollarPerSf) * 100 : null;

  const postJobStatus = pricing.postJobStatus || (hasActuals ? "actuals_entered" : "in_progress");

  return (
    <div className="flex flex-col gap-5">
      {/* Section subtitle */}
      <p className="text-sm text-slate-500 -mb-1">
        Your bid total rollup — material, labor, and general conditions costs flow in automatically from their respective sections.
      </p>

      {/* Bid Pricing Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Bid Pricing & Outcome</h3>
          {(isPro || isDemo) ? (
            <button onClick={editing ? handleSave : startEdit} className={`text-xs font-medium transition-colors ${editing ? "text-emerald-600 hover:text-emerald-300" : "text-slate-500 hover:text-slate-700"}`}>
              {editing ? "Save" : "Edit"}
            </button>
          ) : (
            <a href="/bidshield/pricing" className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors">🔒 Edit · Pro</a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            {editing ? <input type="number" value={form.totalBidAmount} onChange={(e) => setForm({ ...form, totalBidAmount: e.target.value })} placeholder="Total" className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-slate-900">{pricing.totalBidAmount ? fmtDollar(pricing.totalBidAmount) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Total Bid</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            {computedMaterialTotal > 0 ? (
              <div className="text-lg font-bold text-blue-600">
                {fmtDollar(computedMaterialTotal)}
                <span className="text-[10px] text-blue-400 font-normal ml-1">(auto)</span>
              </div>
            ) : (
              <div className="text-base font-bold text-slate-400">—</div>
            )}
            <div className="text-[10px] text-slate-500">Material</div>
            {computedMaterialTotal > 0 ? (
              <button
                type="button"
                onClick={() => onNavigateTab?.("materials")}
                className="text-[9px] text-blue-500 hover:text-blue-700 mt-0.5 block w-full text-center"
              >
                → Material Reconciliation
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab?.("materials")}
                className="text-[9px] text-amber-500 hover:text-amber-700 mt-0.5 block w-full text-center leading-tight"
              >
                Upload report in Material Reconciliation
              </button>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            {editing ? <input type="number" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })} placeholder="Labor" className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-emerald-600">{pricing.laborCost ? fmtDollar(pricing.laborCost) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Labor</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            {editing ? (
              <div>
                <input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })} placeholder="Other" className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full text-center focus:outline-none focus:border-amber-500" />
                {computedGCTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, otherCost: computedGCTotal.toString() }))}
                    className="mt-1 text-[10px] text-amber-600 underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Pull from GC ({fmtDollar(computedGCTotal)})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-lg font-bold text-slate-600">
                {pricing.otherCost ? fmtDollar(pricing.otherCost) : computedGCTotal > 0 ? <span title="Computed from Gen. Conditions tab">{fmtDollar(computedGCTotal)} <span className="text-[10px] text-slate-400">(GC)</span></span> : "—"}
              </div>
            )}
            <div className="text-[10px] text-slate-500">Gen. Conds</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200 col-span-2 sm:col-span-1">
            <div className={`text-lg font-bold ${healthColor}`}>{dollarPerSf ? `$${dollarPerSf.toFixed(2)}` : "—"}</div>
            <div className="text-[10px] text-slate-500">$/SF</div>
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

      {/* Info callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <p className="text-sm text-slate-500">
          Material cost pulls automatically from{" "}
          <button onClick={() => onNavigateTab?.("materials")} className="text-blue-500 hover:text-blue-700 underline underline-offset-2 font-medium">
            Material Reconciliation
          </button>
          . Update Labor and Gen. Conds below to complete your bid total.
        </p>
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
