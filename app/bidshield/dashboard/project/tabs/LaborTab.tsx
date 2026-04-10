"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { defaultLaborRates } from "@/convex/bidshieldDefaults";
import type { TabProps } from "../tab-types";
import { AddendumImpactBanner } from "../AddendumImpactBanner";

// ── Demo fixtures ────────────────────────────────────────────────────────────

const DEMO_ANALYSIS = {
  inputSummary: "45,000 SF TPO mechanically attached over 2\" polyiso. Remove existing gravel BUR. New counterflashing, pipe boots, edge metal.",
  laborType: "open_shop",
  baseWage: 35,
  burdenMultiplier: 1.35,
  loadedRate: 378,
  totalLaborCost: 77430,
  totalDays: 60,
  laborPerSf: 1.72,
  scheduleConflict: false,
  scheduleNote: null,
  assumptions: [
    "4-person crew throughout; no accelerated schedule premium",
    "Tear-off assumes single-ply over insulation — no overlay complications",
    "Counterflashing standard height; field-formed",
    "42 penetrations estimated from architectural plans",
  ],
  warnings: [
    "Mobilization mentioned in scope — move to Gen. Conds: Site Setup",
    "Fire watch mentioned — move to Gen. Conds: Safety & Compliance",
  ],
  analyzedAt: Date.now() - 1000 * 60 * 60 * 2,
};

const DEMO_TASKS = [
  { _id: "dt1", category: "tearoff", task: "Tear-Off — BUR Gravel", unit: "SF", quantity: 45000, ratePerUnit: 0.42, totalCost: 18900, crewSize: 4, days: 12, notes: "Gravel ballast adds time", rateFlag: "ok", detailType: "SF_based", verified: false, sortOrder: 0 },
  { _id: "dt2", category: "insulation", task: "Polyiso Install — 2 layers", unit: "SF", quantity: 45000, ratePerUnit: 0.28, totalCost: 12600, crewSize: 4, days: 8, notes: "Two-layer stagger pattern", rateFlag: "ok", detailType: "SF_based", verified: false, sortOrder: 1 },
  { _id: "dt3", category: "membrane", task: "TPO Membrane — mechanically attached", unit: "SF", quantity: 45000, ratePerUnit: 0.35, totalCost: 15750, crewSize: 4, days: 20, notes: "Standard MA 6' sheets", rateFlag: "ok", detailType: "SF_based", verified: true, sortOrder: 2 },
  { _id: "dt4", category: "membrane", task: "TPO Hot-Air Weld Seams", unit: "LF", quantity: 8200, ratePerUnit: 0.73, totalCost: 5986, crewSize: 2, days: 8, notes: "Field + detail seams", rateFlag: "ok", detailType: "LF_based", verified: false, sortOrder: 3 },
  { _id: "dt5", category: "flashing", task: "Counterflashing Install", unit: "LF", quantity: 1200, ratePerUnit: 4.20, totalCost: 5040, crewSize: 2, days: 5, notes: "", rateFlag: "ok", detailType: "LF_based", verified: false, sortOrder: 4 },
  { _id: "dt6", category: "flashing", task: "Edge Metal / Gravel Stop", unit: "LF", quantity: 900, ratePerUnit: 3.50, totalCost: 3150, crewSize: 2, days: 3, notes: "", rateFlag: "ok", detailType: "LF_based", verified: false, sortOrder: 5 },
  { _id: "dt7", category: "accessories", task: "Pipe Boots & Penetrations", unit: "EA", quantity: 42, ratePerUnit: 95, totalCost: 3990, crewSize: 1, days: 2, notes: "42 penetrations from plans", rateFlag: "ok", detailType: "count", verified: false, sortOrder: 6 },
  { _id: "dt8", category: "accessories", task: "Roof Drain Ring & Flash", unit: "EA", quantity: 18, ratePerUnit: 1126, totalCost: 20268, crewSize: 2, days: 2, notes: "", rateFlag: "high", detailType: "count", verified: false, sortOrder: 7 },
];

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  membrane: "Membrane", insulation: "Insulation", flashing: "Flashing",
  tearoff: "Tear-Off", accessories: "Accessories", other: "Other",
};
const CATEGORY_STYLE: Record<string, React.CSSProperties> = {
  membrane:   { background: "var(--bs-blue-dim)",              color: "var(--bs-blue)" },
  insulation: { background: "rgba(139,92,246,0.12)",           color: "#a78bfa" },
  flashing:   { background: "var(--bs-amber-dim)",             color: "var(--bs-amber)" },
  tearoff:    { background: "var(--bs-red-dim)",               color: "var(--bs-red)" },
  accessories:{ background: "rgba(255,255,255,0.06)",          color: "var(--bs-text-muted)" },
  other:      { background: "rgba(255,255,255,0.06)",          color: "var(--bs-text-dim)" },
};
const RATE_FLAG_STYLE: Record<string, React.CSSProperties> = {
  low:  { background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)" },
  high: { background: "var(--bs-red-dim)",   color: "var(--bs-red)",   border: "1px solid var(--bs-red-border)" },
  ok:   { background: "var(--bs-teal-dim)",  color: "var(--bs-teal)",  border: "1px solid var(--bs-teal-border)" },
};
const DETAIL_TYPE_LABEL: Record<string, string> = {
  SF_based: "SF", LF_based: "LF", count: "EA", lump_sum: "LS",
};
const LABOR_TYPES = [
  { value: "open_shop", label: "Open Shop", mult: 1.35 },
  { value: "prevailing_wage", label: "Prevailing Wage", mult: 1.55 },
  { value: "union", label: "Union", mult: 1.65 },
];
const RATE_DB_CATEGORIES = [
  { id: "membrane", label: "Membrane", icon: "" },
  { id: "insulation", label: "Insulation", icon: "" },
  { id: "flashing", label: "Flashing", icon: "" },
  { id: "accessories", label: "Accessories", icon: "" },
  { id: "tearoff", label: "Tear-Off", icon: "" },
  { id: "general", label: "General", icon: "" },
];

const fmtDollar = (n: number) => `$${Math.round(n).toLocaleString()}`;

// ── Main component ────────────────────────────────────────────────────────────

export default function LaborTab({ isDemo, isPro, userId, projectId, project }: TabProps) {
  const isValidConvexId = !isDemo && !!projectId && !projectId.startsWith("demo_");

  // Convex queries/mutations
  const laborTasks = useQuery(
    api.bidshield.getLaborTasks,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborAnalysis = useQuery(
    api.bidshield.getLaborAnalysis,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const bidQuals = useQuery(
    api.bidshield.getBidQuals,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const addenda = useQuery(
    api.bidshield.getAddenda,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const saveLaborAnalysis = useMutation(api.bidshield.saveLaborAnalysis);
  const updateLaborTask = useMutation(api.bidshield.updateLaborTask);
  const toggleVerified = useMutation(api.bidshield.toggleLaborTaskVerified);
  const clearLaborTasks = useMutation(api.bidshield.clearLaborTasks);

  // Rate DB (existing feature)
  const rates = useQuery(
    api.bidshield.getLaborRates,
    !isDemo && userId ? { userId } : "skip"
  );
  const createRateMut = useMutation(api.bidshield.createLaborRate);
  const deleteRateMut = useMutation(api.bidshield.deleteLaborRate);

  // ── UI state ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [showRateDb, setShowRateDb] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editRate, setEditRate] = useState("");

  // Demo task toggle state
  const [demoVerified, setDemoVerified] = useState<Record<string, boolean>>({});

  // Input form
  const [description, setDescription] = useState(
    isDemo
      ? DEMO_ANALYSIS.inputSummary
      : ""
  );
  const [laborType, setLaborType] = useState<string>(
    (project as any)?.bidQuals?.laborType ?? "open_shop"
  );
  const [baseWage, setBaseWage] = useState(35);

  // Rate DB state
  const [showRateAdd, setShowRateAdd] = useState(false);
  const [activeRateCat, setActiveRateCat] = useState("membrane");
  const [newRate, setNewRate] = useState({ category: "membrane", task: "", rate: "", unit: "/day", crew: "2", notes: "" });
  const [demoRates, setDemoRates] = useState(() =>
    Object.entries(defaultLaborRates).flatMap(([cat, items]) =>
      items.map((item, idx) => ({
        _id: `demo_${cat}_${idx}` as any,
        category: cat, task: item.task, rate: item.rate, unit: item.unit, crew: item.crew, notes: item.notes || "",
      }))
    )
  );

  // ── Resolved data ──
  const resolvedTasks: any[] = isDemo ? DEMO_TASKS : (laborTasks ?? []);
  const resolvedAnalysis: any = isDemo ? DEMO_ANALYSIS : laborAnalysis;
  const hasAnalysis = !!resolvedAnalysis;

  const resolvedRates = isDemo ? demoRates : (rates ?? []);
  const filteredRates = resolvedRates.filter((r: any) => r.category === activeRateCat);

  // Computed stats
  const liveTotal = useMemo(() => resolvedTasks.reduce((s, t) => s + (t.totalCost || 0), 0), [resolvedTasks]);
  const burdenMult = LABOR_TYPES.find(l => l.value === (resolvedAnalysis?.laborType ?? laborType))?.mult ?? 1.35;
  const loadedDayRate = (resolvedAnalysis?.baseWage ?? baseWage) * burdenMult * 8;

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const t of resolvedTasks) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [resolvedTasks]);

  const catOrder = ["tearoff", "insulation", "membrane", "flashing", "accessories", "other"];
  const orderedCategories = catOrder.filter(c => tasksByCategory[c]);

  // Unverified count
  const unverifiedCount = isDemo
    ? DEMO_TASKS.filter(t => !demoVerified[t._id]).length
    : resolvedTasks.filter(t => !t.verified).length;

  // ── Handlers ──
  const handleAnalyze = useCallback(async () => {
    if (!description.trim()) return;
    if (isDemo) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/bidshield/analyze-labor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          laborType,
          baseWage,
          projectName: project?.name,
          sqft: project?.sqft,
          systemType: project?.systemType,
          deckType: project?.deckType,
          assemblies: project?.assemblies,
          roofAssemblies: project?.roofAssemblies,
          bidDate: project?.bidDate,
          estimatedDuration: bidQuals?.estimatedDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAnalyzeError(data.error ?? "Analysis failed — try again");
        return;
      }
      if (!isValidConvexId || !userId) {
        setAnalyzeError("Project not saved — cannot store analysis");
        return;
      }
      await saveLaborAnalysis({
        projectId: projectId as Id<"bidshield_projects">,
        userId,
        inputSummary: description,
        laborType: data.laborType,
        baseWage: data.baseWage,
        burdenMultiplier: data.burdenMultiplier,
        loadedRate: data.loadedRate,
        totalLaborCost: data.totalLaborCost,
        totalDays: data.totalDays,
        laborPerSf: data.laborPerSf,
        scheduleConflict: data.scheduleConflict,
        scheduleNote: data.scheduleNote,
        assumptions: data.assumptions ?? [],
        warnings: data.warnings ?? [],
        tasks: (data.tasks ?? []).map((t: any) => ({
          category: t.category ?? "other",
          task: t.task ?? "",
          unit: t.unit ?? "SF",
          quantity: t.quantity ?? 0,
          ratePerUnit: t.ratePerUnit ?? 0,
          totalCost: t.totalCost ?? 0,
          crewSize: t.crewSize ?? 2,
          days: t.days,
          notes: t.notes,
          rateFlag: t.rateFlag,
          detailType: t.detailType,
        })),
      });
    } catch (err: any) {
      setAnalyzeError(err?.message ?? "Network error — check connection");
    } finally {
      setIsAnalyzing(false);
    }
  }, [description, laborType, baseWage, isDemo, isValidConvexId, userId, projectId, project, saveLaborAnalysis]);

  const handleClearAnalysis = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    await clearLaborTasks({ projectId: projectId as Id<"bidshield_projects">, userId });
  }, [isDemo, isValidConvexId, userId, projectId, clearLaborTasks]);

  const handleToggleVerified = useCallback(async (task: any) => {
    if (isDemo) {
      setDemoVerified(p => ({ ...p, [task._id]: !p[task._id] }));
      return;
    }
    await toggleVerified({ taskId: task._id });
  }, [isDemo, toggleVerified]);

  const handleSaveTaskEdit = useCallback(async (task: any) => {
    if (isDemo) { setEditingTaskId(null); return; }
    const qty = parseFloat(editQty);
    const rate = parseFloat(editRate);
    if (isNaN(qty) || isNaN(rate)) { setEditingTaskId(null); return; }
    await updateLaborTask({ taskId: task._id, quantity: qty, ratePerUnit: rate });
    setEditingTaskId(null);
  }, [isDemo, editQty, editRate, updateLaborTask]);

  const handleAddRate = async () => {
    if (!newRate.task || !newRate.rate) return;
    if (isDemo) {
      setDemoRates(p => [...p, { _id: `demo_new_${Date.now()}` as any, category: newRate.category, task: newRate.task, rate: newRate.rate, unit: newRate.unit, crew: parseInt(newRate.crew) || 2, notes: newRate.notes || "" }]);
    } else if (userId) {
      await createRateMut({ userId, category: newRate.category, task: newRate.task, rate: newRate.rate, unit: newRate.unit, crew: parseInt(newRate.crew) || 2, notes: newRate.notes || undefined });
    }
    setNewRate({ category: activeRateCat, task: "", rate: "", unit: "/day", crew: "2", notes: "" });
    setShowRateAdd(false);
  };

  const handleDeleteRate = async (rateId: any) => {
    if (isDemo) { setDemoRates(p => p.filter(r => r._id !== rateId)); return; }
    await deleteRateMut({ rateId });
  };

  const handleSeedDefaults = async () => {
    if (isDemo || !userId) return;
    const defaultCat = defaultLaborRates[activeRateCat as keyof typeof defaultLaborRates];
    if (!defaultCat) return;
    for (const item of defaultCat) {
      await createRateMut({ userId, category: activeRateCat, task: item.task, rate: item.rate, unit: item.unit, crew: item.crew, notes: item.notes });
    }
  };

  // Pro gate
  if (!isPro && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-bg-elevated)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: "var(--bs-text-primary)" }}>Labor Verification</h3>
        <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>AI-assisted labor cost verification and production rate database. Available on Pro.</p>
        <a href="/bidshield/pricing" className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-medium" style={{ color: "var(--bs-text-primary)" }}>Labor Verification</h2>
        <p className="text-sm mt-1" style={{ color: "var(--bs-text-muted)" }}>
          Describe your roofing scope and get an AI-generated task-level labor breakdown. Review, edit, and verify each line before it flows to Pricing.
        </p>
      </div>

      <AddendumImpactBanner addenda={addenda as any[]} section="Labor" />

      {/* ── State A: Input panel ── */}
      {!hasAnalysis ? (
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>Scope Description</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Labor Type</label>
              <select value={laborType} onChange={e => setLaborType(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
                {LABOR_TYPES.map(l => (
                  <option key={l.value} value={l.value}>{l.label} ({l.mult}× burden)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Base Wage ($/hr before burden)</label>
              <input type="number" value={baseWage} onChange={e => setBaseWage(parseFloat(e.target.value) || 35)} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} placeholder="35" />
              <p className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                Loaded day rate: {fmtDollar((LABOR_TYPES.find(l => l.value === laborType)?.mult ?? 1.35) * baseWage * 8)}/person/day
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Scope Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Describe the full roofing scope:\n• System type and area (e.g. 45,000 SF TPO mechanically attached)\n• Insulation type and thickness\n• Tear-off details (existing system, gravel, overlay vs. full tear)\n• Flashing scope (counterflashing, edge metal, curbs)\n• Penetrations (count of pipes, drains, HVAC curbs)\n• Any special conditions (phasing, schedule restrictions, access)`}
              rows={7}
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none font-mono focus:outline-none"
              style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            />
          </div>

          {analyzeError && (
            <p className="text-xs font-medium rounded-lg px-3 py-2" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)" }}>
              {analyzeError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description.trim() || isDemo}
              className="px-5 py-2.5 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </>
              ) : "Run Labor Analysis"}
            </button>
            {isDemo && (
              <p className="text-xs italic" style={{ color: "var(--bs-text-dim)" }}>Demo mode — showing sample analysis below</p>
            )}
          </div>
        </div>
      ) : (
        /* ── State B: Re-run bar ── */
        <div className="rounded-xl p-4 flex items-start gap-4" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>Analyzed scope</p>
            <p className="text-sm line-clamp-2" style={{ color: "var(--bs-text-secondary)" }}>{resolvedAnalysis.inputSummary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isDemo && (
              <button onClick={handleClearAnalysis} className="px-3 py-1.5 text-xs rounded-lg transition-colors" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
                Re-run
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── State B: Results ── */}
      {hasAnalysis && (
        <>
          {/* ── Stats bar ── */}
          <div className="flex items-stretch overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}>
            {[
              { label: "Total Labor Cost", value: fmtDollar(liveTotal), color: "var(--bs-teal)" },
              { label: "Est. Duration", value: resolvedAnalysis.totalDays ? `${resolvedAnalysis.totalDays}d` : "—", color: "var(--bs-text-primary)" },
              { label: "Labor / SF", value: resolvedAnalysis.laborPerSf ? `$${resolvedAnalysis.laborPerSf.toFixed(2)}` : "—", color: "var(--bs-blue)" },
              { label: "Loaded Rate / Day", value: `$${Math.round(resolvedAnalysis.loadedRate).toLocaleString()}`, color: "var(--bs-text-secondary)" },
            ].map(({ label, value, color }, i) => (
              <div key={label} className="flex-1 px-5 py-4 flex flex-col gap-1" style={{ borderLeft: i > 0 ? "1px solid var(--bs-border)" : "none" }}>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>{label}</p>
                <p className="text-2xl font-medium leading-none tabular-nums" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Schedule flag banner */}
          {resolvedAnalysis.scheduleConflict && (
            <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)" }}>
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--bs-amber)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--bs-amber)" }}>Schedule Conflict</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--bs-amber)" }}>{resolvedAnalysis.scheduleNote}</p>
              </div>
            </div>
          )}

          {/* Verification progress */}
          {resolvedTasks.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((resolvedTasks.length - unverifiedCount) / resolvedTasks.length) * 100}%`, background: "var(--bs-teal)" }} />
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--bs-text-muted)" }}>
                {resolvedTasks.length - unverifiedCount}/{resolvedTasks.length} verified
              </span>
              {unverifiedCount === 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>All verified</span>
              )}
            </div>
          )}

          {/* Task breakdown table by category */}
          <div className="overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}>
            {orderedCategories.map((cat, catIdx) => {
              const tasks = tasksByCategory[cat];
              const catTotal = tasks.reduce((s: number, t: any) => s + (t.totalCost || 0), 0);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--bs-bg-elevated)", borderTop: catIdx > 0 ? "1px solid var(--bs-border)" : "none" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full" style={CATEGORY_STYLE[cat] ?? { background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)" }}>
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{fmtDollar(catTotal)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                          <th className="px-5 py-2 text-[10px] font-medium uppercase" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.5px" }}>Task</th>
                          <th className="px-3 py-2 text-[10px] font-medium uppercase text-right" style={{ color: "var(--bs-text-dim)" }}>Qty</th>
                          <th className="px-3 py-2 text-[10px] font-medium uppercase text-right" style={{ color: "var(--bs-text-dim)" }}>Rate</th>
                          <th className="px-3 py-2 text-[10px] font-medium uppercase text-right" style={{ color: "var(--bs-text-dim)" }}>Total</th>
                          <th className="px-5 py-2 text-[10px] font-medium uppercase text-center" style={{ color: "var(--bs-text-dim)" }}>Verify</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task: any) => {
                          const isEditing = editingTaskId === task._id;
                          const isVerified = isDemo ? !!demoVerified[task._id] : !!task.verified;
                          return (
                            <tr key={task._id} className="transition-colors last:border-0" style={{ borderBottom: "1px solid var(--bs-border)", background: isVerified ? "rgba(45,212,168,0.04)" : "" }}
                              onMouseEnter={e => { if (!isVerified) e.currentTarget.style.background = "var(--bs-bg-elevated)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = isVerified ? "rgba(45,212,168,0.04)" : ""; }}>
                              <td className="px-4 py-3">
                                <div className="min-w-0">
                                  <div className="font-medium leading-tight" style={{ color: "var(--bs-text-primary)" }}>{task.task}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {task.detailType && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)" }}>
                                        {DETAIL_TYPE_LABEL[task.detailType] ?? task.detailType}
                                      </span>
                                    )}
                                    {task.rateFlag && task.rateFlag !== "ok" && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={RATE_FLAG_STYLE[task.rateFlag] ?? {}}>
                                        rate {task.rateFlag}
                                      </span>
                                    )}
                                    {task.days && (
                                      <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>{task.days}d · crew {task.crewSize}</span>
                                    )}
                                  </div>
                                  {task.notes && <div className="text-[11px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{task.notes}</div>}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>
                                {isEditing ? (
                                  <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} className="w-20 text-right rounded px-2 py-1 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                                ) : (
                                  <span>{task.quantity.toLocaleString()} {task.unit}</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>
                                {isEditing ? (
                                  <input type="number" step="0.01" value={editRate} onChange={e => setEditRate(e.target.value)} className="w-20 text-right rounded px-2 py-1 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                                ) : (
                                  <span>${task.ratePerUnit.toFixed(2)}/{task.unit}</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>
                                {fmtDollar(isEditing ? (parseFloat(editQty) || 0) * (parseFloat(editRate) || 0) : task.totalCost)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <button onClick={() => handleSaveTaskEdit(task)} className="text-xs font-medium" style={{ color: "var(--bs-teal)" }}>Save</button>
                                      <button onClick={() => setEditingTaskId(null)} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>✕</button>
                                    </>
                                  ) : (
                                    <>
                                      {!isDemo && (
                                        <button onClick={() => { setEditingTaskId(task._id); setEditQty(String(task.quantity)); setEditRate(String(task.ratePerUnit)); }} className="text-[11px] transition-colors" style={{ color: "var(--bs-text-dim)" }}>Edit</button>
                                      )}
                                      <button onClick={() => handleToggleVerified(task)} className="text-[11px] font-medium px-2 py-0.5 rounded transition-colors"
                                        style={isVerified ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" } : { background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}>
                                        {isVerified ? "Verified" : "Verify"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total row */}
          <div className="flex items-center justify-between rounded-xl px-5 py-4" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-teal-border)" }}>
            <div>
              <div className="text-base font-medium" style={{ color: "var(--bs-text-primary)" }}>Total Labor Cost</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                {LABOR_TYPES.find(l => l.value === resolvedAnalysis.laborType)?.label ?? "Open Shop"} ·{" "}
                ${Math.round(resolvedAnalysis.loadedRate).toLocaleString()}/person/day loaded
              </div>
            </div>
            <div className="text-2xl font-medium" style={{ color: "var(--bs-teal)" }}>{fmtDollar(liveTotal)}</div>
          </div>

          {/* AI Assumptions & Warnings */}
          <div className="overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}>
            <button onClick={() => setShowAssumptions(s => !s)} className="w-full flex items-center justify-between px-5 py-4 transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}>
              <span className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>
                AI Assumptions & Warnings
                {(resolvedAnalysis.warnings?.length ?? 0) > 0 && (
                  <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>
                    {resolvedAnalysis.warnings.length} flagged
                  </span>
                )}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showAssumptions ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-text-dim)">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showAssumptions && (
              <div className="px-5 pb-5 flex flex-col gap-4 pt-4" style={{ borderTop: "1px solid var(--bs-border)" }}>
                {(resolvedAnalysis.assumptions?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--bs-text-dim)" }}>Assumptions</p>
                    <ul className="flex flex-col gap-1.5">
                      {resolvedAnalysis.assumptions.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--bs-text-secondary)" }}>
                          <span className="mt-0.5" style={{ color: "var(--bs-text-dim)" }}>•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(resolvedAnalysis.warnings?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--bs-amber)" }}>Gen. Conds Items Flagged</p>
                    <ul className="flex flex-col gap-1.5">
                      {resolvedAnalysis.warnings.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm rounded-lg px-3 py-2" style={{ color: "var(--bs-amber)", background: "var(--bs-amber-dim)" }}>
                          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Production Rate Reference ── */}
      <div className="overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}>
        <button onClick={() => setShowRateDb(s => !s)} className="w-full flex items-center justify-between px-5 py-4 transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
          onMouseLeave={e => (e.currentTarget.style.background = "")}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>Production Rate Reference</span>
            <span className="text-[11px]" style={{ color: "var(--bs-text-dim)" }}>Your crew rates — used by AI analysis</span>
          </div>
          <svg className={`w-4 h-4 transition-transform ${showRateDb ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-text-dim)">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showRateDb && (
          <div style={{ borderTop: "1px solid var(--bs-border)" }}>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button onClick={handleSeedDefaults} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Load Defaults</button>
              <button onClick={() => { setNewRate({ ...newRate, category: activeRateCat }); setShowRateAdd(true); }} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>+ Add Rate</button>
            </div>

            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {RATE_DB_CATEGORIES.map(cat => {
                const count = resolvedRates.filter((r: any) => r.category === cat.id).length;
                const isActive = activeRateCat === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveRateCat(cat.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all"
                    style={isActive ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" } : { background: "rgba(255,255,255,0.04)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}>
                    <span>{cat.icon}</span><span>{cat.label}</span>
                    {count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: isActive ? "var(--bs-teal-dim)" : "rgba(255,255,255,0.06)", color: isActive ? "var(--bs-teal)" : "var(--bs-text-dim)" }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {showRateAdd && (
              <div className="mx-5 mb-4 rounded-xl p-4" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-teal-border)" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--bs-text-primary)" }}>Add Rate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Task *</label>
                    <input type="text" value={newRate.task} onChange={(e) => setNewRate({ ...newRate, task: e.target.value })} placeholder="TPO Install (MA)" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Rate *</label>
                      <input type="text" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} placeholder="450 SF" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Unit</label>
                      <select value={newRate.unit} onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
                        <option value="/day">/day</option><option value="/hr">/hr</option><option value="/EA">/EA</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Crew Size</label>
                    <input type="number" value={newRate.crew} onChange={(e) => setNewRate({ ...newRate, crew: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--bs-text-muted)" }}>Notes</label>
                    <input type="text" value={newRate.notes} onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })} placeholder="Standard conditions" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={handleAddRate} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Save</button>
                  <button onClick={() => setShowRateAdd(false)} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Cancel</button>
                </div>
              </div>
            )}

            {filteredRates.length > 0 ? (
              <div className="overflow-x-auto mx-5 mb-5 rounded-xl" style={{ border: "1px solid var(--bs-border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left" style={{ borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                      <th className="px-4 py-3 font-medium" style={{ color: "var(--bs-text-dim)", fontSize: 11 }}>Task</th>
                      <th className="px-4 py-3 font-medium text-right" style={{ color: "var(--bs-text-dim)", fontSize: 11 }}>Rate</th>
                      <th className="px-4 py-3 font-medium text-center hidden sm:table-cell" style={{ color: "var(--bs-text-dim)", fontSize: 11 }}>Crew</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell" style={{ color: "var(--bs-text-dim)", fontSize: 11 }}>Notes</th>
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRates.map((rate: any) => (
                      <tr key={rate._id} className="last:border-0 transition-colors" style={{ borderBottom: "1px solid var(--bs-border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        <td className="px-4 py-3" style={{ color: "var(--bs-text-primary)" }}>{rate.task}</td>
                        <td className="px-4 py-3 text-right"><span className="font-medium" style={{ color: "var(--bs-teal)" }}>{rate.rate}</span><span className="ml-1" style={{ color: "var(--bs-text-muted)" }}>{rate.unit}</span></td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell" style={{ color: "var(--bs-text-muted)" }}>{rate.crew}</td>
                        <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--bs-text-muted)" }}>{rate.notes || "—"}</td>
                        <td className="px-4 py-3"><button onClick={() => handleDeleteRate(rate._id)} className="text-xs transition-colors" style={{ color: "var(--bs-text-dim)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 mx-5 mb-5 rounded-xl" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                <p className="text-sm mb-3" style={{ color: "var(--bs-text-muted)" }}>No rates in {RATE_DB_CATEGORIES.find(c => c.id === activeRateCat)?.label ?? activeRateCat}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={handleSeedDefaults} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Load Defaults</button>
                  <button onClick={() => { setNewRate({ ...newRate, category: activeRateCat }); setShowRateAdd(true); }} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Add Rate</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
