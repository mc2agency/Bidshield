"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const ASSEMBLY_TYPES = [
  "TPO 60mil Mechanically Attached", "TPO 60mil Fully Adhered",
  "TPO 80mil Mechanically Attached", "TPO 80mil Fully Adhered",
  "PVC 60mil Mechanically Attached", "PVC 60mil Fully Adhered",
  "Modified Bitumen 2-Ply (SBS)", "Modified Bitumen 3-Ply (SBS)",
  "Modified Bitumen (APP)", "EPDM 60mil", "Metal Roof Panels",
  "Metal Wall Panels", "Pavers / Ballast", "Green Roof",
  "Waterproofing / Below Grade", "Other",
];

const LOSS_REASONS = [
  "Price too high", "Scope issue", "Missed deadline", "GC preference",
  "Bonding issue", "Schedule conflict", "Incomplete bid", "Other",
];

function varianceColor(pct: number): string {
  const abs = Math.abs(pct);
  if (abs <= 5) return "text-emerald-400";
  if (abs <= 10) return "text-amber-400";
  return "text-red-400";
}

function varianceBg(pct: number): string {
  const abs = Math.abs(pct);
  if (abs <= 5) return "bg-emerald-500/10 border-emerald-500/30";
  if (abs <= 10) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
}

export default function PricingTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const updateProject = useMutation(api.bidshield.updateProject);
  const [editing, setEditing] = useState(false);
  const [editingActuals, setEditingActuals] = useState(false);

  const allProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );

  const grossRoofArea: number | null = isDemo ? 45000 : (project?.grossRoofArea ?? null);

  const demoPricing = {
    totalBidAmount: 850000, materialCost: 425000, laborCost: 340000, otherCost: 85000,
    primaryAssembly: "TPO 60mil Mechanically Attached",
    lossReason: undefined as string | undefined, lossReasonNote: undefined as string | undefined,
    actualCost: undefined as number | undefined, actualMaterialCost: undefined as number | undefined,
    actualLaborCost: undefined as number | undefined, actualOtherCost: undefined as number | undefined,
    postJobStatus: undefined as string | undefined, postJobNotes: undefined as string | undefined,
    completedDate: undefined as string | undefined,
  };

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
    totalBidAmount: "", materialCost: "", laborCost: "", otherCost: "",
    primaryAssembly: "", lossReason: "", lossReasonNote: "",
  });

  const [actualsForm, setActualsForm] = useState({
    actualCost: "", actualMaterialCost: "", actualLaborCost: "", actualOtherCost: "",
    postJobStatus: "", postJobNotes: "", completedDate: "",
  });

  const startEdit = () => {
    setForm({
      totalBidAmount: pricing.totalBidAmount?.toString() ?? "", materialCost: pricing.materialCost?.toString() ?? "",
      laborCost: pricing.laborCost?.toString() ?? "", otherCost: pricing.otherCost?.toString() ?? "",
      primaryAssembly: pricing.primaryAssembly ?? "", lossReason: pricing.lossReason ?? "",
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
    if (isDemo || !isValidConvexId) { setEditing(false); return; }
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: parse(form.totalBidAmount), materialCost: parse(form.materialCost),
      laborCost: parse(form.laborCost), otherCost: parse(form.otherCost),
      primaryAssembly: form.primaryAssembly || undefined, lossReason: form.lossReason || undefined,
      lossReasonNote: form.lossReasonNote || undefined,
    });
    setEditing(false);
  };

  const handleSaveActuals = async () => {
    if (isDemo || !isValidConvexId) { setEditingActuals(false); return; }
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
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
  const healthColor = variance === null ? "text-slate-500" : Math.abs(variance) <= 5 ? "text-emerald-400" : Math.abs(variance) <= 15 ? "text-amber-400" : "text-red-400";
  const healthLabel = !dollarPerSf ? "Enter bid amount" : !assembly ? "Set assembly type" : similarProjects.length < 3 ? "Need more data" : Math.abs(variance!) <= 5 ? "On Target" : Math.abs(variance!) <= 15 ? "Watch" : "Off Target";

  const status = project?.status || "setup";
  const isWon = status === "won";
  const isLost = status === "lost";

  // Variance calculations
  const hasActuals = !!(pricing.actualCost);
  const totalVariance = hasActuals && pricing.totalBidAmount ? pricing.actualCost! - pricing.totalBidAmount : null;
  const totalVariancePct = hasActuals && pricing.totalBidAmount ? ((pricing.actualCost! - pricing.totalBidAmount) / pricing.totalBidAmount) * 100 : null;
  const matVariance = pricing.actualMaterialCost && pricing.materialCost ? pricing.actualMaterialCost - pricing.materialCost : null;
  const matVariancePct = pricing.actualMaterialCost && pricing.materialCost ? ((pricing.actualMaterialCost - pricing.materialCost) / pricing.materialCost) * 100 : null;
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
      {/* Bid Pricing Card */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white">Bid Pricing & Outcome</h3>
          <button onClick={editing ? handleSave : startEdit} className={`text-xs font-medium transition-colors ${editing ? "text-emerald-400 hover:text-emerald-300" : "text-slate-400 hover:text-slate-200"}`}>
            {editing ? "Save" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
            {editing ? <input type="number" value={form.totalBidAmount} onChange={(e) => setForm({ ...form, totalBidAmount: e.target.value })} placeholder="Total" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-white">{pricing.totalBidAmount ? fmtDollar(pricing.totalBidAmount) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Total Bid</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
            {editing ? <input type="number" value={form.materialCost} onChange={(e) => setForm({ ...form, materialCost: e.target.value })} placeholder="Material" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-blue-400">{pricing.materialCost ? fmtDollar(pricing.materialCost) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Material</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
            {editing ? <input type="number" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })} placeholder="Labor" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-emerald-400">{pricing.laborCost ? fmtDollar(pricing.laborCost) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Labor</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
            {editing ? <input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })} placeholder="Other" className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full text-center focus:outline-none focus:border-amber-500" /> : <div className="text-lg font-bold text-slate-300">{pricing.otherCost ? fmtDollar(pricing.otherCost) : "—"}</div>}
            <div className="text-[10px] text-slate-500">Other</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700 col-span-2 sm:col-span-1">
            <div className={`text-lg font-bold ${healthColor}`}>{dollarPerSf ? `$${dollarPerSf.toFixed(2)}` : "—"}</div>
            <div className="text-[10px] text-slate-500">$/SF</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] text-slate-400 mb-1 block">Primary Assembly</label>
          {editing ? (
            <select value={form.primaryAssembly} onChange={(e) => setForm({ ...form, primaryAssembly: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500">
              <option value="">Select assembly...</option>
              {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <div className="text-sm text-slate-200">{pricing.primaryAssembly || "Not set"}</div>
          )}
        </div>

        {(dollarPerSf || assembly) && (
          <div className={`mb-4 p-3 rounded-lg border ${healthLabel === "On Target" ? "bg-emerald-500/10 border-emerald-500/30" : healthLabel === "Watch" ? "bg-amber-500/10 border-amber-500/30" : healthLabel === "Off Target" ? "bg-red-500/10 border-red-500/30" : "bg-slate-700/50 border-slate-600"}`}>
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
              <div className="text-[11px] text-slate-500 mt-1">Need at least 3 projects with &ldquo;{assembly}&rdquo; to compare. Have {similarProjects.length}.</div>
            )}
          </div>
        )}

        {isLost && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="text-xs font-semibold text-red-400 mb-2">Loss Details</h4>
            {editing ? (
              <div className="space-y-2">
                <select value={form.lossReason} onChange={(e) => setForm({ ...form, lossReason: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500">
                  <option value="">Select reason...</option>
                  {LOSS_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input value={form.lossReasonNote} onChange={(e) => setForm({ ...form, lossReasonNote: e.target.value })} placeholder="Additional notes (optional)" className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
              </div>
            ) : (
              <div className="text-sm text-slate-300">
                {pricing.lossReason || "No reason recorded"}
                {pricing.lossReasonNote && <span className="text-slate-500 ml-2">— {pricing.lossReasonNote}</span>}
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

      {/* Actual Costs Section (won projects only) */}
      {isWon && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Actual Costs (Post-Completion)</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                postJobStatus === "actuals_entered" ? "bg-emerald-500/20 text-emerald-400" :
                postJobStatus === "completed" ? "bg-blue-500/20 text-blue-400" :
                "bg-amber-500/20 text-amber-400"
              }`}>
                {postJobStatus === "actuals_entered" ? "Actuals Entered" : postJobStatus === "completed" ? "Completed" : "In Progress"}
              </span>
            </div>
            {!isDemo && (
              <button onClick={editingActuals ? handleSaveActuals : startEditActuals} className={`text-xs font-medium transition-colors ${editingActuals ? "text-emerald-400 hover:text-emerald-300" : "text-slate-400 hover:text-slate-200"}`}>
                {editingActuals ? "Save" : "Edit"}
              </button>
            )}
          </div>

          {editingActuals ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Post-Job Status</label>
                  <select value={actualsForm.postJobStatus} onChange={(e) => setActualsForm({ ...actualsForm, postJobStatus: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500">
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="actuals_entered">Actuals Entered</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Completion Date</label>
                  <input type="date" value={actualsForm.completedDate} onChange={(e) => setActualsForm({ ...actualsForm, completedDate: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Total</label><input type="number" value={actualsForm.actualCost} onChange={(e) => setActualsForm({ ...actualsForm, actualCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Material</label><input type="number" value={actualsForm.actualMaterialCost} onChange={(e) => setActualsForm({ ...actualsForm, actualMaterialCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Labor</label><input type="number" value={actualsForm.actualLaborCost} onChange={(e) => setActualsForm({ ...actualsForm, actualLaborCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Other</label><input type="number" value={actualsForm.actualOtherCost} onChange={(e) => setActualsForm({ ...actualsForm, actualOtherCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Notes / Lessons Learned</label>
                <textarea value={actualsForm.postJobNotes} onChange={(e) => setActualsForm({ ...actualsForm, postJobNotes: e.target.value })} placeholder="What caused variances? Lessons for future bids..." rows={2} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveActuals} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Save Actuals</button>
                <button onClick={() => setEditingActuals(false)} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-lg font-bold text-white">{pricing.actualCost ? fmtDollar(pricing.actualCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Total</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-lg font-bold text-blue-400">{pricing.actualMaterialCost ? fmtDollar(pricing.actualMaterialCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Material</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-lg font-bold text-emerald-400">{pricing.actualLaborCost ? fmtDollar(pricing.actualLaborCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Labor</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-lg font-bold text-slate-300">{pricing.actualOtherCost ? fmtDollar(pricing.actualOtherCost) : "—"}</div>
                  <div className="text-[10px] text-slate-500">Actual Other</div>
                </div>
              </div>
              {pricing.completedDate && (
                <div className="text-xs text-slate-500 mb-2">Completed: {pricing.completedDate}</div>
              )}
              {pricing.postJobNotes && (
                <div className="p-3 bg-slate-900 rounded-lg text-sm text-slate-300 mb-3">{pricing.postJobNotes}</div>
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
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-4">Estimate vs. Actual Comparison</h3>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-xs text-slate-500 font-semibold">Category</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Estimated</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Actual</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-semibold">Variance</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Total" estimated={pricing.totalBidAmount} actual={pricing.actualCost} varianceAmt={totalVariance} variancePct={totalVariancePct} bold />
                {pricing.materialCost && <ComparisonRow label="Material" estimated={pricing.materialCost} actual={pricing.actualMaterialCost} varianceAmt={matVariance} variancePct={matVariancePct} />}
                {pricing.laborCost && <ComparisonRow label="Labor" estimated={pricing.laborCost} actual={pricing.actualLaborCost} varianceAmt={labVariance} variancePct={labVariancePct} />}
                {pricing.otherCost && <ComparisonRow label="Other" estimated={pricing.otherCost} actual={pricing.actualOtherCost} varianceAmt={othVariance} variancePct={othVariancePct} />}
                {dollarPerSf && actualDpsf && (
                  <tr className="border-t border-slate-700">
                    <td className="py-2 px-3 text-slate-300">$/SF</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">${dollarPerSf.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-300 tabular-nums">${actualDpsf.toFixed(2)}</td>
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
                  <span className="text-xs text-slate-400 w-16">{v.label}</span>
                  <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden relative">
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
    </div>
  );
}

function ComparisonRow({ label, estimated, actual, varianceAmt, variancePct, bold }: {
  label: string; estimated?: number; actual?: number; varianceAmt: number | null; variancePct: number | null; bold?: boolean;
}) {
  const fmt = (n?: number) => n ? `$${n.toLocaleString()}` : "—";
  return (
    <tr className="border-b border-slate-700/50">
      <td className={`py-2 px-3 ${bold ? "text-white font-semibold" : "text-slate-300"}`}>{label}</td>
      <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{fmt(estimated)}</td>
      <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{fmt(actual)}</td>
      <td className={`py-2 px-3 text-right tabular-nums ${variancePct !== null ? varianceColor(variancePct) : "text-slate-500"}`}>
        {varianceAmt !== null ? `${varianceAmt > 0 ? "+" : ""}$${varianceAmt.toLocaleString()} (${variancePct!.toFixed(1)}%)` : "—"}
      </td>
    </tr>
  );
}
