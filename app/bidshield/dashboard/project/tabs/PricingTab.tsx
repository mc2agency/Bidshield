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

export default function PricingTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const updateProject = useMutation(api.bidshield.updateProject);
  const [editing, setEditing] = useState(false);

  const allProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );

  const grossRoofArea: number | null = isDemo ? 45000 : (project?.grossRoofArea ?? null);

  const demoPricing = {
    totalBidAmount: 850000, materialCost: 425000, laborCost: 340000, otherCost: 85000,
    primaryAssembly: "TPO 60mil Mechanically Attached",
    lossReason: undefined as string | undefined, lossReasonNote: undefined as string | undefined,
    actualCost: undefined as number | undefined, actualMaterialCost: undefined as number | undefined, actualLaborCost: undefined as number | undefined,
  };

  const pricing = isDemo ? demoPricing : {
    totalBidAmount: project?.totalBidAmount, materialCost: project?.materialCost,
    laborCost: project?.laborCost, otherCost: project?.otherCost,
    primaryAssembly: project?.primaryAssembly, lossReason: project?.lossReason,
    lossReasonNote: project?.lossReasonNote, actualCost: project?.actualCost,
    actualMaterialCost: project?.actualMaterialCost, actualLaborCost: project?.actualLaborCost,
  };

  const [form, setForm] = useState({
    totalBidAmount: "", materialCost: "", laborCost: "", otherCost: "",
    primaryAssembly: "", lossReason: "", lossReasonNote: "",
    actualCost: "", actualMaterialCost: "", actualLaborCost: "",
  });

  const startEdit = () => {
    setForm({
      totalBidAmount: pricing.totalBidAmount?.toString() ?? "", materialCost: pricing.materialCost?.toString() ?? "",
      laborCost: pricing.laborCost?.toString() ?? "", otherCost: pricing.otherCost?.toString() ?? "",
      primaryAssembly: pricing.primaryAssembly ?? "", lossReason: pricing.lossReason ?? "",
      lossReasonNote: pricing.lossReasonNote ?? "", actualCost: pricing.actualCost?.toString() ?? "",
      actualMaterialCost: pricing.actualMaterialCost?.toString() ?? "", actualLaborCost: pricing.actualLaborCost?.toString() ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (isDemo || !isValidConvexId) { setEditing(false); return; }
    const parse = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: parse(form.totalBidAmount), materialCost: parse(form.materialCost),
      laborCost: parse(form.laborCost), otherCost: parse(form.otherCost),
      primaryAssembly: form.primaryAssembly || undefined, lossReason: form.lossReason || undefined,
      lossReasonNote: form.lossReasonNote || undefined, actualCost: parse(form.actualCost),
      actualMaterialCost: parse(form.actualMaterialCost), actualLaborCost: parse(form.actualLaborCost),
    });
    setEditing(false);
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
  const costVariance = pricing.actualCost && pricing.totalBidAmount ? ((pricing.actualCost - pricing.totalBidAmount) / pricing.totalBidAmount) * 100 : null;

  return (
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
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
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

      {isWon && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <h4 className="text-xs font-semibold text-emerald-400 mb-3">Post-Award Tracking</h4>
          {editing ? (
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Total</label><input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Material</label><input type="number" value={form.actualMaterialCost} onChange={(e) => setForm({ ...form, actualMaterialCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-slate-500 mb-1 block">Actual Labor</label><input type="number" value={form.actualLaborCost} onChange={(e) => setForm({ ...form, actualLaborCost: e.target.value })} className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm w-full focus:outline-none focus:border-amber-500" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center"><div className="text-sm font-bold text-white">{pricing.actualCost ? fmtDollar(pricing.actualCost) : "—"}</div><div className="text-[10px] text-slate-500">Actual Total</div></div>
              <div className="text-center"><div className="text-sm font-bold text-white">{pricing.actualMaterialCost ? fmtDollar(pricing.actualMaterialCost) : "—"}</div><div className="text-[10px] text-slate-500">Actual Material</div></div>
              <div className="text-center"><div className="text-sm font-bold text-white">{pricing.actualLaborCost ? fmtDollar(pricing.actualLaborCost) : "—"}</div><div className="text-[10px] text-slate-500">Actual Labor</div></div>
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
