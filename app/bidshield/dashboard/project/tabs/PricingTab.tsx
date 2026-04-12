"use client";

import { useState, useEffect } from "react";
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
  if (abs <= 5) return "var(--bs-teal)";
  if (abs <= 10) return "var(--bs-amber)";
  return "var(--bs-red)";
}

function varianceBg(pct: number): { background: string; border: string } {
  const abs = Math.abs(pct);
  if (abs <= 5) return { background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" };
  if (abs <= 10) return { background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)" };
  return { background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" };
}

export default function PricingTab({ projectId, isDemo, isPro, project, userId, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const updateProject = useMutation(api.bidshield.updateProject);
  const addDecision = useMutation(api.bidshield.addDecision);
  const [editing, setEditing] = useState(false);
  const [editingActuals, setEditingActuals] = useState(false);

  // P2-3: Warn on unsaved changes when navigating away
  useEffect(() => {
    if (!editing && !editingActuals) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editing, editingActuals]);

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

  // E-06: Scope items with costs → pricing summary
  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const includedScopeWithCost = (scopeItems ?? []).filter((s: any) => s.status === "included" && s.cost && s.cost > 0);
  const scopeCostTotal = Math.round(includedScopeWithCost.reduce((sum: number, s: any) => sum + (s.cost ?? 0), 0));

  // E-09: Addendum price impacts → pricing summary
  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const addendaWithImpact = (addenda ?? []).filter((a: any) => a.priceImpact !== undefined && a.priceImpact !== null && a.priceImpact !== 0);
  const addendaPriceImpact = Math.round(addendaWithImpact.reduce((sum: number, a: any) => sum + (a.priceImpact ?? 0), 0));

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
    // E-19: Write computed totals back to project to keep single source of truth in sync
    const newBidAmount = parse(form.totalBidAmount);
    await updateProject({
      projectId: projectId as Id<"bidshield_projects">,
      totalBidAmount: newBidAmount,
      materialCost: computedMaterialTotal > 0 ? computedMaterialTotal : undefined,
      laborCost: computedLaborTotal > 0 ? computedLaborTotal : undefined,
      otherCost: parse(form.otherCost),
      primaryAssembly: form.primaryAssembly || undefined, lossReason: form.lossReason || undefined,
      lossReasonNote: form.lossReasonNote || undefined,
    });
    // E-31: Audit trail — log bid amount changes to decision log
    if (userId && isValidConvexId && newBidAmount !== pricing.totalBidAmount) {
      const oldAmt = pricing.totalBidAmount ? `$${pricing.totalBidAmount.toLocaleString()}` : "none";
      const newAmt = newBidAmount ? `$${newBidAmount.toLocaleString()}` : "cleared";
      try {
        await addDecision({
          projectId: projectId as Id<"bidshield_projects">,
          userId,
          text: `Bid amount changed from ${oldAmt} to ${newAmt}`,
          section: "pricing",
        });
      } catch { /* non-blocking */ }
    }
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
  // M-16: Use grossRoofArea with sqft fallback so legacy projects are included in benchmarks
  const getArea = (p: any) => p.grossRoofArea || p.sqft || 0;
  const similarProjects = (allProjects ?? []).filter((p: any) =>
    p.primaryAssembly === assembly && p.totalBidAmount && getArea(p) > 0 && p._id !== projectId
  );
  const avgDollarPerSf = similarProjects.length >= 3
    ? similarProjects.reduce((sum: number, p: any) => sum + p.totalBidAmount / getArea(p), 0) / similarProjects.length
    : null;

  // E-18: Material-to-bid reconciliation
  const unpricedMaterials = (projectMaterials ?? []).filter((m: any) => !m.unitPrice || m.unitPrice <= 0);
  const unsyncedMaterialCount = (projectMaterials ?? []).filter((m: any) =>
    ["coverage", "qty_per_sf", "linear_from_takeoff", "count_from_takeoff"].includes(m.calcType) && (!m.quantity || m.quantity <= 0)
  ).length;
  const materialReconciliationIssue = unpricedMaterials.length > 0 || unsyncedMaterialCount > 0;

  // Sanity check: components should sum to total bid
  const effectiveGC = pricing.otherCost ?? (computedGCTotal > 0 ? computedGCTotal : 0);
  // E-06/E-09: Include scope costs and addendum price impacts in the component sum
  const componentSum = computedMaterialTotal + computedLaborTotal + effectiveGC + scopeCostTotal + addendaPriceImpact;
  const totalBid = pricing.totalBidAmount ?? 0;
  const componentSumMismatch = totalBid > 0 && componentSum > 0 && Math.abs(componentSum - totalBid) / totalBid > 0.01;
  const variance = dollarPerSf && avgDollarPerSf ? ((dollarPerSf - avgDollarPerSf) / avgDollarPerSf) * 100 : null;
  const healthColor = variance === null ? "var(--bs-text-dim)" : Math.abs(variance) <= 5 ? "var(--bs-teal)" : Math.abs(variance) <= 15 ? "var(--bs-amber)" : "var(--bs-red)";
  const healthLabel = !dollarPerSf ? "Enter bid amount" : !assembly ? "Set assembly type" : similarProjects.length < 3 ? "Need more data" : Math.abs(variance!) <= 5 ? "On Target" : Math.abs(variance!) <= 15 ? "Watch" : "Off Target";

  const status = project?.status || "setup";
  const isWon = status === "won";
  const isLost = status === "lost";

  // Variance calculations
  const hasActuals = !!(pricing.actualCost);
  const totalVariance = hasActuals && pricing.totalBidAmount ? pricing.actualCost! - pricing.totalBidAmount : null;
  const totalVariancePct = hasActuals && pricing.totalBidAmount ? ((pricing.actualCost! - pricing.totalBidAmount) / pricing.totalBidAmount) * 100 : null;
  // E-19: Computed totals from Materials tab and Labor tab are the single source of truth.
  // Fallback to project-level fields only for legacy projects that haven't run the analysis yet.
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

  const inputStyle = { fontSize: 13, color: "var(--bs-text-secondary)", background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "7px 10px", width: "100%", outline: "none" };
  const labelStyle = { fontSize: 11, color: "var(--bs-text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block" as const, marginBottom: 4 };

  const healthBg = healthLabel === "On Target" ? "var(--bs-teal-dim)" : healthLabel === "Watch" ? "var(--bs-amber-dim)" : healthLabel === "Off Target" ? "var(--bs-red-dim)" : "rgba(255,255,255,0.04)";
  const healthBorder = healthLabel === "On Target" ? "var(--bs-teal-border)" : healthLabel === "Watch" ? "var(--bs-amber-border)" : healthLabel === "Off Target" ? "var(--bs-red-border)" : "var(--bs-border)";
  const healthTextColor = healthLabel === "On Target" ? "var(--bs-teal)" : healthLabel === "Watch" ? "var(--bs-amber)" : healthLabel === "Off Target" ? "var(--bs-red)" : "var(--bs-text-muted)";

  return (
    <div className="flex flex-col gap-5">

      {/* Sanity check warning */}
      {componentSumMismatch && (
        <div className="flex items-start gap-3 px-4 py-3" style={{ background: "var(--bs-amber-dim)", borderLeft: "3px solid var(--bs-amber)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 1, flexShrink: 0 }}><path d="M8 2l6 11H2L8 2z" stroke="var(--bs-amber)" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M8 7v2.5" stroke="var(--bs-amber)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.6" fill="var(--bs-amber)"/></svg>
          <div>
            <div className="text-[13px] font-medium" style={{ color: "var(--bs-amber)" }}>Cost components don&rsquo;t add up to Total Bid</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
              Material ({fmtDollar(computedMaterialTotal)}) + Labor ({fmtDollar(computedLaborTotal)}) + Gen. Conds ({fmtDollar(effectiveGC)}){scopeCostTotal > 0 ? ` + Scope (${fmtDollar(scopeCostTotal)})` : ""}{addendaPriceImpact !== 0 ? ` + Addenda (${fmtDollar(addendaPriceImpact)})` : ""} = {fmtDollar(componentSum)} — total bid is {fmtDollar(totalBid)} (${Math.abs(componentSum - totalBid).toLocaleString()} gap)
            </div>
          </div>
        </div>
      )}

      {/* E-18: Material-to-bid reconciliation warning */}
      {!isDemo && materialReconciliationIssue && (projectMaterials ?? []).length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3" style={{ background: "var(--bs-amber-dim)", borderLeft: "3px solid var(--bs-amber)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 1, flexShrink: 0 }}><path d="M8 2l6 11H2L8 2z" stroke="var(--bs-amber)" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><path d="M8 7v2.5" stroke="var(--bs-amber)" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.6" fill="var(--bs-amber)"/></svg>
          <div>
            <div className="text-[13px] font-medium" style={{ color: "var(--bs-amber)" }}>Material costs may be incomplete</div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
              {unpricedMaterials.length > 0 && `${unpricedMaterials.length} material${unpricedMaterials.length !== 1 ? "s" : ""} missing unit price`}
              {unpricedMaterials.length > 0 && unsyncedMaterialCount > 0 && " · "}
              {unsyncedMaterialCount > 0 && `${unsyncedMaterialCount} material${unsyncedMaterialCount !== 1 ? "s" : ""} not synced from takeoff`}
              {" — "}
              <button onClick={() => onNavigateTab?.("materials")} className="underline bg-transparent border-0 p-0 cursor-pointer" style={{ color: "var(--bs-amber)", fontSize: "inherit" }}>
                review in Materials tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Pricing Card */}
      <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="flex justify-between items-center px-[18px] py-[14px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Bid pricing &amp; outcome</h3>
          <div className="flex items-center gap-2">
            {/* E-30: Decision Log entry point */}
            <button onClick={() => onNavigateTab?.("decisions")} className="text-[11px] cursor-pointer transition-colors" style={{ color: "var(--bs-text-muted)", background: "none", border: "none" }}>
              Decision Log
            </button>
            {(isPro || isDemo) ? (
              <button onClick={editing ? handleSave : startEdit} className="bs-btn bs-btn-outline cursor-pointer">
                {editing ? "Save" : "Edit"}
              </button>
            ) : (
              <a href="/bidshield/pricing" className="bs-btn bs-btn-outline" style={{ textDecoration: "none" }}>Edit · Pro</a>
            )}
          </div>
        </div>

        {/* ── 5-column metric grid ── */}
        <div className="grid p-[18px] gap-3" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          {/* Total Bid */}
          <div className="rounded-[10px] p-[18px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Total bid</div>
            {editing ? (
              <input type="number" value={form.totalBidAmount} onChange={(e) => setForm({ ...form, totalBidAmount: e.target.value })} placeholder="0" style={inputStyle} />
            ) : (
              <div className="text-[24px] font-medium tabular-nums" style={{ color: "var(--bs-text-primary)", letterSpacing: "-0.5px" }}>{pricing.totalBidAmount ? fmtDollar(pricing.totalBidAmount) : "—"}</div>
            )}
          </div>
          {/* Material */}
          <div className="rounded-[10px] p-[18px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Material</div>
            <div className="text-[24px] font-medium tabular-nums" style={{ color: computedMaterialTotal > 0 ? "var(--bs-text-primary)" : "var(--bs-text-dim)", letterSpacing: "-0.5px" }}>
              {computedMaterialTotal > 0 ? fmtDollar(computedMaterialTotal) : "--"}
            </div>
            <button type="button" onClick={() => onNavigateTab?.("materials")} className="text-[11px] mt-2 cursor-pointer transition-colors bs-link">
              {computedMaterialTotal > 0 ? "Reconciliation" : "Run analysis"}
            </button>
          </div>
          {/* Labor */}
          <div className="rounded-[10px] p-[18px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Labor</div>
            <div className="text-[24px] font-medium tabular-nums" style={{ color: computedLaborTotal > 0 ? "var(--bs-text-primary)" : "var(--bs-text-dim)", letterSpacing: "-0.5px" }}>
              {computedLaborTotal > 0 ? fmtDollar(computedLaborTotal) : "--"}
            </div>
            <button type="button" onClick={() => onNavigateTab?.("labor")} className="text-[11px] mt-2 cursor-pointer transition-colors" style={{ color: "var(--bs-blue)", background: "none", border: "none" }}>
              {computedLaborTotal > 0 ? "Verification" : "Run analysis"}
            </button>
          </div>
          {/* Gen. Conds */}
          <div className="rounded-[10px] p-[18px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <div className="bs-metric-label">Gen. conds</div>
            {editing ? (
              <div className="flex flex-col gap-1">
                <input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: e.target.value })} placeholder="0" style={inputStyle} />
                {computedGCTotal > 0 && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, otherCost: computedGCTotal.toString() }))} className="text-[11px] cursor-pointer text-left bs-link">
                    Pull from GC ({fmtDollar(computedGCTotal)})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[24px] font-medium tabular-nums" style={{ color: "var(--bs-text-primary)", letterSpacing: "-0.5px" }}>
                {pricing.otherCost ? fmtDollar(pricing.otherCost) : computedGCTotal > 0 ? fmtDollar(computedGCTotal) : "—"}
              </div>
            )}
          </div>
          {/* Cost/SF */}
          <div className="rounded-[10px] p-[18px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-teal)" }}>
            <div className="bs-metric-label">Cost / SF</div>
            <div className="text-[24px] font-medium tabular-nums" style={{ color: "var(--bs-teal)", letterSpacing: "-0.5px" }}>
              {dollarPerSf ? `$${dollarPerSf.toFixed(2)}` : "—"}
            </div>
          </div>
        </div>

        {/* E-06/E-09: Scope costs + Addendum impacts */}
        {(scopeCostTotal > 0 || addendaPriceImpact !== 0) && (
          <div className="px-[18px] pb-2 flex flex-wrap gap-3">
            {scopeCostTotal > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                <span style={{ color: "var(--bs-text-dim)" }}>Scope inclusions:</span>
                <span className="font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{fmtDollar(scopeCostTotal)}</span>
                <span style={{ color: "var(--bs-text-dim)" }}>({includedScopeWithCost.length} item{includedScopeWithCost.length !== 1 ? "s" : ""})</span>
                <button type="button" onClick={() => onNavigateTab?.("scope")} className="bs-link cursor-pointer text-[11px]" style={{ background: "none", border: "none" }}>View</button>
              </div>
            )}
            {addendaPriceImpact !== 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                <span style={{ color: "var(--bs-text-dim)" }}>Addenda impact:</span>
                <span className="font-medium tabular-nums" style={{ color: addendaPriceImpact > 0 ? "var(--bs-red)" : "var(--bs-teal)" }}>
                  {addendaPriceImpact > 0 ? "+" : ""}{fmtDollar(addendaPriceImpact)}
                </span>
                <span style={{ color: "var(--bs-text-dim)" }}>({addendaWithImpact.length} addend{addendaWithImpact.length !== 1 ? "a" : "um"})</span>
                <button type="button" onClick={() => onNavigateTab?.("addenda")} className="bs-link cursor-pointer text-[11px]" style={{ background: "none", border: "none" }}>View</button>
              </div>
            )}
          </div>
        )}

        {/* Primary Assembly + Bid Health */}
        <div className="grid px-[18px] pb-[18px] gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="flex items-center justify-between px-4 py-3 rounded-[10px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <div>
              <div style={labelStyle}>Primary assembly</div>
              {editing ? (
                <select value={form.primaryAssembly} onChange={(e) => setForm({ ...form, primaryAssembly: e.target.value })} style={inputStyle}>
                  <option value="">Select assembly...</option>
                  {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <div className="text-[14px]" style={{ color: pricing.primaryAssembly ? "var(--bs-text-secondary)" : "var(--bs-text-dim)" }}>{pricing.primaryAssembly || "Not set"}</div>
              )}
            </div>
            {!editing && (
              <button onClick={startEdit} className="bs-btn bs-btn-outline cursor-pointer text-[12px] shrink-0">Set type</button>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-[10px]" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
            <span className="text-[14px]" style={{ color: "var(--bs-text-secondary)" }}>Bid health</span>
            {(dollarPerSf || assembly) ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2,3,4].map(i => (
                    <span key={i} className="w-7 h-[5px] rounded-sm" style={{ background: healthLabel === "On Target" && i < 5 ? "var(--bs-teal)" : healthLabel === "Watch" && i < 3 ? (i < 2 ? "var(--bs-teal)" : "var(--bs-amber)") : healthLabel === "Off Target" && i < 2 ? "var(--bs-red)" : "rgba(255,255,255,0.06)" }} />
                  ))}
                </div>
                <span className="text-[12px] font-medium" style={{ color: healthTextColor }}>{healthLabel}</span>
              </div>
            ) : (
              <span className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>Enter bid amount</span>
            )}
          </div>
        </div>

        {isLost && (
          <div className="mx-[18px] mb-[18px] p-4 rounded-[10px]" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>
            <h4 className="text-[12px] font-medium mb-2" style={{ color: "var(--bs-red)" }}>Loss Details</h4>
            {editing ? (
              <div className="flex flex-col gap-2">
                <select value={form.lossReason} onChange={(e) => setForm({ ...form, lossReason: e.target.value })} style={inputStyle}>
                  <option value="">Select reason...</option>
                  {LOSS_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input value={form.lossReasonNote} onChange={(e) => setForm({ ...form, lossReasonNote: e.target.value })} placeholder="Additional notes (optional)" style={inputStyle} />
              </div>
            ) : (
              <div className="text-[13px]" style={{ color: "var(--bs-text-muted)" }}>
                {pricing.lossReason || "No reason recorded"}
                {pricing.lossReasonNote && <span className="ml-2" style={{ color: "var(--bs-text-dim)" }}>— {pricing.lossReasonNote}</span>}
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="px-[18px] pb-[18px] flex gap-2">
            <button onClick={handleSave} className="bs-btn bs-btn-primary cursor-pointer">Save Changes</button>
            <button onClick={() => setEditing(false)} className="bs-btn bs-btn-outline cursor-pointer">Cancel</button>
          </div>
        )}
      </div>

      {/* Actual Costs Section (won projects only) */}
      {isWon && (
        <div className="rounded-[10px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="flex justify-between items-center px-[18px] py-[14px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Actual Costs</h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{
                background: postJobStatus === "actuals_entered" ? "var(--bs-teal-dim)" : postJobStatus === "completed" ? "var(--bs-blue-dim)" : "var(--bs-amber-dim)",
                color: postJobStatus === "actuals_entered" ? "var(--bs-teal)" : postJobStatus === "completed" ? "var(--bs-blue)" : "var(--bs-amber)",
              }}>
                {postJobStatus === "actuals_entered" ? "Actuals Entered" : postJobStatus === "completed" ? "Completed" : "In Progress"}
              </span>
            </div>
            {!isDemo && (
              <button onClick={editingActuals ? handleSaveActuals : startEditActuals} className="bs-btn bs-btn-outline cursor-pointer">
                {editingActuals ? "Save" : "Edit"}
              </button>
            )}
          </div>

          <div className="p-[18px]">
          {editingActuals ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label style={labelStyle}>Post-Job Status</label><select value={actualsForm.postJobStatus} onChange={(e) => setActualsForm({ ...actualsForm, postJobStatus: e.target.value })} style={inputStyle}><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="actuals_entered">Actuals Entered</option></select></div>
                <div><label style={labelStyle}>Completion Date</label><input type="date" value={actualsForm.completedDate} onChange={(e) => setActualsForm({ ...actualsForm, completedDate: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label style={labelStyle}>Actual Total</label><input type="number" value={actualsForm.actualCost} onChange={(e) => setActualsForm({ ...actualsForm, actualCost: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Actual Material</label><input type="number" value={actualsForm.actualMaterialCost} onChange={(e) => setActualsForm({ ...actualsForm, actualMaterialCost: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Actual Labor</label><input type="number" value={actualsForm.actualLaborCost} onChange={(e) => setActualsForm({ ...actualsForm, actualLaborCost: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Actual Other</label><input type="number" value={actualsForm.actualOtherCost} onChange={(e) => setActualsForm({ ...actualsForm, actualOtherCost: e.target.value })} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Notes / Lessons Learned</label><textarea value={actualsForm.postJobNotes} onChange={(e) => setActualsForm({ ...actualsForm, postJobNotes: e.target.value })} placeholder="What caused variances? Lessons for future bids..." rows={2} className="w-full resize-none focus:outline-none" style={inputStyle} /></div>
              <div className="flex gap-2">
                <button onClick={handleSaveActuals} className="bs-btn bs-btn-primary cursor-pointer">Save Actuals</button>
                <button onClick={() => setEditingActuals(false)} className="bs-btn bs-btn-outline cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {[
                  { label: "Actual Total", value: pricing.actualCost, color: "var(--bs-text-primary)" },
                  { label: "Actual Material", value: pricing.actualMaterialCost, color: "var(--bs-blue)" },
                  { label: "Actual Labor", value: pricing.actualLaborCost, color: "var(--bs-teal)" },
                  { label: "Actual Other", value: pricing.actualOtherCost, color: "var(--bs-text-muted)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-[10px] p-3 text-center" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                    <div className="text-[18px] font-medium tabular-nums" style={{ color }}>{value ? fmtDollar(value) : "—"}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{label}</div>
                  </div>
                ))}
              </div>
              {pricing.completedDate && <div className="text-[12px] mb-2" style={{ color: "var(--bs-text-dim)" }}>Completed: {pricing.completedDate}</div>}
              {pricing.postJobNotes && <div className="p-3 rounded-[8px] text-[13px] mb-3" style={{ background: "rgba(255,255,255,0.04)", color: "var(--bs-text-muted)" }}>{pricing.postJobNotes}</div>}
              {!hasActuals && <div className="text-center py-4 text-[13px]" style={{ color: "var(--bs-text-dim)" }}>No actual costs entered yet. Click Edit to log post-completion costs.</div>}
            </>
          )}
          </div>
        </div>
      )}

      {/* Estimate vs Actual Comparison */}
      {isWon && hasActuals && pricing.totalBidAmount && (
        <div className="rounded-[10px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="px-[18px] py-[14px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
            <h3 className="text-[15px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Estimate vs. Actual</h3>
          </div>
          <div className="p-[18px]">
            <div className="overflow-x-auto mb-4">
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    {["Category", "Estimated", "Actual", "Variance"].map((h, i) => (
                      <th key={h} className={`py-2 px-3 text-[11px] uppercase tracking-[0.5px]${i > 0 ? " text-right" : " text-left"}`} style={{ color: "var(--bs-text-dim)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow label="Total" estimated={pricing.totalBidAmount} actual={pricing.actualCost} varianceAmt={totalVariance} variancePct={totalVariancePct} bold />
                  {effectiveMaterialCost > 0 && <ComparisonRow label="Material" estimated={effectiveMaterialCost} actual={pricing.actualMaterialCost} varianceAmt={matVariance} variancePct={matVariancePct} />}
                  {pricing.laborCost && <ComparisonRow label="Labor" estimated={pricing.laborCost} actual={pricing.actualLaborCost} varianceAmt={labVariance} variancePct={labVariancePct} />}
                  {pricing.otherCost && <ComparisonRow label="Other" estimated={pricing.otherCost} actual={pricing.actualOtherCost} varianceAmt={othVariance} variancePct={othVariancePct} />}
                  {dollarPerSf && actualDpsf && (
                    <tr style={{ borderTop: "1px solid var(--bs-border)" }}>
                      <td className="py-2 px-3" style={{ color: "var(--bs-text-muted)" }}>$/SF</td>
                      <td className="py-2 px-3 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>${dollarPerSf.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>${actualDpsf.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums" style={{ color: dpsfVariancePct !== null ? varianceColor(dpsfVariancePct) : "var(--bs-text-dim)" }}>
                        {dpsfVariance !== null ? `${dpsfVariance > 0 ? "+" : ""}$${dpsfVariance.toFixed(2)} (${dpsfVariancePct!.toFixed(1)}%)` : "—"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalVariancePct !== null && (
              <div className="p-3 rounded-[8px]" style={{ background: Math.abs(totalVariancePct) <= 5 ? "var(--bs-teal-dim)" : totalVariancePct > 0 ? "var(--bs-red-dim)" : "var(--bs-teal-dim)", border: `1px solid ${Math.abs(totalVariancePct) <= 5 ? "var(--bs-teal-border)" : totalVariancePct > 0 ? "var(--bs-red-border)" : "var(--bs-teal-border)"}` }}>
                <div className="text-[13px] font-medium" style={{ color: Math.abs(totalVariancePct) <= 5 ? "var(--bs-teal)" : totalVariancePct > 0 ? "var(--bs-red)" : "var(--bs-teal)" }}>
                  {Math.abs(totalVariancePct) <= 5 ? "On budget" : totalVariancePct > 0 ? "Over budget" : "Under budget"} ({totalVariancePct > 0 ? "+" : ""}{totalVariancePct.toFixed(1)}%)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alternate Pricing */}
      <div className="rounded-[10px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="flex justify-between items-center px-[18px] py-[14px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <h3 className="text-[16px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Alternate pricing</h3>
          {(isPro || isDemo) && !showAltForm && !editingAltId && (
            <button
              onClick={() => { if (!isDemo) setShowAltForm(true); }}
              className="bs-btn bs-btn-ghost-teal cursor-pointer"
            >
              + Add alternate
            </button>
          )}
        </div>

        <div className="p-[18px]">
          {altList.length > 0 && (
            <div className="mb-3">
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    {["Label", "Type", "Amount", !isDemo ? "" : null].filter(Boolean).map((h, i) => (
                      <th key={i} className={`py-2 px-2 text-[11px] uppercase tracking-[0.5px]${i > 0 && i < 2 ? " text-center" : i === 2 ? " text-right" : " text-left"}`} style={{ color: "var(--bs-text-dim)" }}>{h}</th>
                    ))}
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
                      <tr key={a._id} className="group" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                        <td className="py-2 px-2">
                          <div className="text-[13px] font-medium" style={{ color: "var(--bs-text-secondary)" }}>{a.label}</div>
                          {a.description && <div className="text-[11px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{a.description}</div>}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded uppercase" style={{ background: a.type === "add" ? "var(--bs-teal-dim)" : "var(--bs-red-dim)", color: a.type === "add" ? "var(--bs-teal)" : "var(--bs-red)" }}>
                            {a.type === "add" ? "Add" : "Deduct"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {a.amount != null ? (
                            <span className="text-[13px] font-medium" style={{ color: a.type === "add" ? "var(--bs-teal)" : "var(--bs-red)" }}>
                              {a.type === "add" ? "+" : "-"}{fmtDollar(a.amount)}
                            </span>
                          ) : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}
                        </td>
                        {!isDemo && (
                          <td className="py-2 px-1">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditAlt(a)} className="text-xs px-1 cursor-pointer" style={{ color: "var(--bs-text-dim)", background: "none", border: "none" }}>✎</button>
                              <button onClick={() => deleteAlternate({ alternateId: a._id as Id<"bidshield_alternates">, userId: userId! })} className="text-xs px-1 cursor-pointer" style={{ color: "var(--bs-red)", background: "none", border: "none" }}>✕</button>
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
            <div className="py-8 text-center" style={{ border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
              <div className="text-[13px]" style={{ color: "var(--bs-text-dim)" }}>No alternates — add one if the GC requested add/deduct pricing</div>
            </div>
          )}

          {showAltForm && !editingAltId && (
            <AltForm form={altForm} setForm={setAltForm} saving={altSaving} onSave={saveAlt} onCancel={cancelAlt} fmtDollar={fmtDollar} />
          )}

          {!(isPro || isDemo) && (
            <a href="/bidshield/pricing" className="inline-flex items-center gap-1 text-xs font-medium transition-colors bs-link">
              Alternate Pricing · Pro
            </a>
          )}
        </div>
      </div>

      {/* Info callout */}
      <div className="px-4 py-3 rounded-[10px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <p className="text-[12px]" style={{ color: "var(--bs-text-muted)" }}>
          Material cost pulls from{" "}
          <button onClick={() => onNavigateTab?.("materials")} className="bs-link cursor-pointer" style={{ background: "none", border: "none" }}>
            Material reconciliation
          </button>
          {" "}and labor from{" "}
          <button onClick={() => onNavigateTab?.("labor")} className="bs-link cursor-pointer" style={{ background: "none", border: "none" }}>
            Labor verification
          </button>
          . Add gen. conds to complete your bid total.
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
    <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Alt 1 — Add tapered ISO)"
            className="w-full rounded px-2.5 py-1.5 text-[13px] focus:outline-none"
            style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
          />
        </div>
        <div className="flex gap-2">
          {(["add", "deduct"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              className="flex-1 text-[12px] font-medium py-1.5 rounded transition-colors cursor-pointer"
              style={form.type === t
                ? { background: t === "add" ? "var(--bs-teal-dim)" : "var(--bs-red-dim)", color: t === "add" ? "var(--bs-teal)" : "var(--bs-red)", border: `1px solid ${t === "add" ? "var(--bs-teal-border)" : "var(--bs-red-border)"}` }
                : { background: "transparent", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }
              }
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
          className="rounded px-2.5 py-1.5 text-[13px] focus:outline-none"
          style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
        />
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description (optional)"
          className="rounded px-2.5 py-1.5 text-[13px] focus:outline-none"
          style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving || !form.label.trim()}
          className="bs-btn bs-btn-primary text-[12px] disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="text-[12px] px-3 py-1.5 cursor-pointer" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
      </div>
    </div>
  );
}

function ComparisonRow({ label, estimated, actual, varianceAmt, variancePct, bold }: {
  label: string; estimated?: number; actual?: number; varianceAmt: number | null; variancePct: number | null; bold?: boolean;
}) {
  const fmt = (n?: number) => n != null ? `$${n.toLocaleString()}` : "—";
  return (
    <tr style={{ borderBottom: "1px solid var(--bs-border)" }}>
      <td className={`py-2 px-3 text-[13px] ${bold ? "font-medium" : ""}`} style={{ color: bold ? "var(--bs-text-primary)" : "var(--bs-text-secondary)" }}>{label}</td>
      <td className="py-2 px-3 text-right text-[13px] tabular-nums" style={{ color: "var(--bs-text-secondary)" }}>{fmt(estimated)}</td>
      <td className="py-2 px-3 text-right text-[13px] tabular-nums" style={{ color: "var(--bs-text-secondary)" }}>{fmt(actual)}</td>
      <td className="py-2 px-3 text-right text-[13px] tabular-nums" style={{ color: variancePct !== null ? varianceColor(variancePct) : "var(--bs-text-muted)" }}>
        {varianceAmt !== null ? `${varianceAmt > 0 ? "+" : ""}$${varianceAmt.toLocaleString()} (${variancePct!.toFixed(1)}%)` : "—"}
      </td>
    </tr>
  );
}
