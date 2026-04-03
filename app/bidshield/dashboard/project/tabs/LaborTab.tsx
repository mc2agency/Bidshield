"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { defaultLaborRates } from "@/convex/bidshieldDefaults";
import type { TabProps } from "../tab-types";

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
const CATEGORY_COLOR: Record<string, string> = {
  membrane: "bg-blue-100 text-blue-700",
  insulation: "bg-purple-100 text-purple-700",
  flashing: "bg-amber-100 text-amber-700",
  tearoff: "bg-red-100 text-red-700",
  accessories: "bg-slate-100 text-slate-600",
  other: "bg-zinc-100 text-zinc-600",
};
const RATE_FLAG_STYLE: Record<string, string> = {
  low: "bg-amber-50 text-amber-700 border border-amber-200",
  high: "bg-red-50 text-red-600 border border-red-200",
  ok: "bg-emerald-50 text-emerald-700 border border-emerald-200",
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
  { id: "membrane", label: "Membrane", icon: "🔲" },
  { id: "insulation", label: "Insulation", icon: "🧱" },
  { id: "flashing", label: "Flashing", icon: "⚡" },
  { id: "accessories", label: "Accessories", icon: "🔩" },
  { id: "tearoff", label: "Tear-Off", icon: "🗑️" },
  { id: "general", label: "General", icon: "📋" },
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
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Labor Verification</h3>
        <p className="text-sm text-slate-500 mb-6">AI-assisted labor cost verification and production rate database. Available on Pro.</p>
        <a href="/bidshield/pricing" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors">
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Labor Verification</h2>
        <p className="text-sm text-slate-500 mt-1">
          Describe your roofing scope and get an AI-generated task-level labor breakdown. Review, edit, and verify each line before it flows to Pricing.
        </p>
      </div>

      {/* ── State A: Input panel (always visible, collapses when analysis exists) ── */}
      {!hasAnalysis ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-900">Scope Description</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Labor Type</label>
              <select
                value={laborType}
                onChange={e => setLaborType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
              >
                {LABOR_TYPES.map(l => (
                  <option key={l.value} value={l.value}>{l.label} ({l.mult}× burden)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Base Wage ($/hr before burden)</label>
              <input
                type="number"
                value={baseWage}
                onChange={e => setBaseWage(parseFloat(e.target.value) || 35)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
                placeholder="35"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Loaded day rate: {fmtDollar((LABOR_TYPES.find(l => l.value === laborType)?.mult ?? 1.35) * baseWage * 8)}/person/day
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Scope Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Describe the full roofing scope:
• System type and area (e.g. 45,000 SF TPO mechanically attached)
• Insulation type and thickness
• Tear-off details (existing system, gravel, overlay vs. full tear)
• Flashing scope (counterflashing, edge metal, curbs)
• Penetrations (count of pipes, drains, HVAC curbs)
• Any special conditions (phasing, schedule restrictions, access)`}
              rows={7}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm resize-none font-mono"
            />
          </div>

          {analyzeError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {analyzeError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description.trim() || isDemo}
              style={{ background: "#10b981" }}
              className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
              <p className="text-xs text-slate-400 italic">Demo mode — showing sample analysis below</p>
            )}
          </div>
        </div>
      ) : (
        /* ── State B: Re-run bar ── */
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Analyzed scope</p>
            <p className="text-sm text-slate-700 line-clamp-2">{resolvedAnalysis.inputSummary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isDemo && (
              <button
                onClick={handleClearAnalysis}
                className="px-3 py-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Re-run
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── State B: Results ── */}
      {hasAnalysis && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{fmtDollar(liveTotal)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total Labor Cost</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {resolvedAnalysis.totalDays ?? "—"}
                {resolvedAnalysis.totalDays && <span className="text-base font-normal text-slate-400 ml-1">days</span>}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Estimated Duration</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                {resolvedAnalysis.laborPerSf ? `$${resolvedAnalysis.laborPerSf.toFixed(2)}` : "—"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Labor $/SF</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">
                ${Math.round(resolvedAnalysis.loadedRate).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Loaded Rate/Day</div>
            </div>
          </div>

          {/* Schedule flag banner */}
          {resolvedAnalysis.scheduleConflict && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Schedule Conflict</p>
                <p className="text-xs text-amber-700 mt-0.5">{resolvedAnalysis.scheduleNote}</p>
              </div>
            </div>
          )}

          {/* Verification progress */}
          {resolvedTasks.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${((resolvedTasks.length - unverifiedCount) / resolvedTasks.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {resolvedTasks.length - unverifiedCount}/{resolvedTasks.length} verified
              </span>
              {unverifiedCount === 0 && (
                <span className="text-xs text-emerald-600 font-semibold">All verified ✓</span>
              )}
            </div>
          )}

          {/* Task breakdown table by category */}
          <div className="flex flex-col gap-4">
            {orderedCategories.map(cat => {
              const tasks = tasksByCategory[cat];
              const catTotal = tasks.reduce((s: number, t: any) => s + (t.totalCost || 0), 0);
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOR[cat] ?? "bg-slate-100 text-slate-600"}`}>
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                      <span className="text-xs text-slate-400">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{fmtDollar(catTotal)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                          <th className="px-4 py-2 text-[11px] text-slate-400 font-medium">Task</th>
                          <th className="px-3 py-2 text-[11px] text-slate-400 font-medium text-right">Qty</th>
                          <th className="px-3 py-2 text-[11px] text-slate-400 font-medium text-right">Rate</th>
                          <th className="px-3 py-2 text-[11px] text-slate-400 font-medium text-right">Total</th>
                          <th className="px-4 py-2 text-[11px] text-slate-400 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task: any) => {
                          const isEditing = editingTaskId === task._id;
                          const isVerified = isDemo ? !!demoVerified[task._id] : !!task.verified;
                          return (
                            <tr key={task._id} className={`border-b border-slate-100 last:border-0 transition-colors ${isVerified ? "bg-emerald-50/30" : "hover:bg-slate-50"}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2">
                                  <div className="min-w-0">
                                    <div className="text-slate-900 font-medium leading-tight">{task.task}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {task.detailType && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                          {DETAIL_TYPE_LABEL[task.detailType] ?? task.detailType}
                                        </span>
                                      )}
                                      {task.rateFlag && task.rateFlag !== "ok" && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${RATE_FLAG_STYLE[task.rateFlag] ?? ""}`}>
                                          rate {task.rateFlag}
                                        </span>
                                      )}
                                      {task.days && (
                                        <span className="text-[10px] text-slate-400">{task.days}d · crew {task.crewSize}</span>
                                      )}
                                    </div>
                                    {task.notes && <div className="text-[11px] text-slate-400 mt-0.5">{task.notes}</div>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editQty}
                                    onChange={e => setEditQty(e.target.value)}
                                    className="w-20 text-right bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span>{task.quantity.toLocaleString()} {task.unit}</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editRate}
                                    onChange={e => setEditRate(e.target.value)}
                                    className="w-20 text-right bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span>${task.ratePerUnit.toFixed(2)}/{task.unit}</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">
                                {fmtDollar(isEditing
                                  ? (parseFloat(editQty) || 0) * (parseFloat(editRate) || 0)
                                  : task.totalCost
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <button onClick={() => handleSaveTaskEdit(task)} className="text-xs text-emerald-600 font-semibold hover:text-emerald-800">Save</button>
                                      <button onClick={() => setEditingTaskId(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                                    </>
                                  ) : (
                                    <>
                                      {!isDemo && (
                                        <button
                                          onClick={() => { setEditingTaskId(task._id); setEditQty(String(task.quantity)); setEditRate(String(task.ratePerUnit)); }}
                                          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleToggleVerified(task)}
                                        className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                                          isVerified
                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                      >
                                        {isVerified ? "✓ OK" : "Verify"}
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
          <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl px-5 py-4">
            <div>
              <div className="text-base font-bold">Total Labor Cost</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {LABOR_TYPES.find(l => l.value === resolvedAnalysis.laborType)?.label ?? "Open Shop"} ·{" "}
                ${Math.round(resolvedAnalysis.loadedRate).toLocaleString()}/person/day loaded
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{fmtDollar(liveTotal)}</div>
          </div>

          {/* AI Assumptions & Warnings */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowAssumptions(s => !s)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-900">
                AI Assumptions & Warnings
                {(resolvedAnalysis.warnings?.length ?? 0) > 0 && (
                  <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {resolvedAnalysis.warnings.length} flagged
                  </span>
                )}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showAssumptions ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showAssumptions && (
              <div className="px-5 pb-5 border-t border-slate-100 flex flex-col gap-4 pt-4">
                {(resolvedAnalysis.assumptions?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Assumptions</p>
                    <ul className="flex flex-col gap-1.5">
                      {resolvedAnalysis.assumptions.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(resolvedAnalysis.warnings?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Gen. Conds Items Flagged</p>
                    <ul className="flex flex-col gap-1.5">
                      {resolvedAnalysis.warnings.map((w: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                          <span className="mt-0.5">⚠</span>
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

      {/* ── Production Rate Reference (collapsed by default) ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowRateDb(s => !s)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Production Rate Reference</span>
            <span className="text-[11px] text-slate-400">Your crew rates — used by AI analysis</span>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${showRateDb ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showRateDb && (
          <div className="border-t border-slate-100">
            <div className="px-5 py-4 flex justify-end gap-2">
              <button onClick={handleSeedDefaults} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Load Defaults</button>
              <button onClick={() => { setNewRate({ ...newRate, category: activeRateCat }); setShowRateAdd(true); }} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors">+ Add Rate</button>
            </div>

            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {RATE_DB_CATEGORIES.map(cat => {
                const count = resolvedRates.filter((r: any) => r.category === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setActiveRateCat(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${activeRateCat === cat.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}>
                    <span>{cat.icon}</span><span>{cat.label}</span>
                    {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeRateCat === cat.id ? "bg-emerald-500" : "bg-slate-200"}`}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {showRateAdd && (
              <div className="mx-5 mb-4 bg-slate-50 rounded-xl p-4 border border-emerald-500/30">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Rate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Task *</label>
                    <input type="text" value={newRate.task} onChange={(e) => setNewRate({ ...newRate, task: e.target.value })} placeholder="TPO Install (MA)" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Rate *</label>
                      <input type="text" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} placeholder="450 SF" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Unit</label>
                      <select value={newRate.unit} onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm">
                        <option value="/day">/day</option><option value="/hr">/hr</option><option value="/EA">/EA</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Crew Size</label>
                    <input type="number" value={newRate.crew} onChange={(e) => setNewRate({ ...newRate, crew: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Notes</label>
                    <input type="text" value={newRate.notes} onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })} placeholder="Standard conditions" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={handleAddRate} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors">Save</button>
                  <button onClick={() => setShowRateAdd(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {filteredRates.length > 0 ? (
              <div className="overflow-x-auto mx-5 mb-5 rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left bg-slate-50">
                      <th className="px-4 py-3 text-slate-500 font-medium">Task</th>
                      <th className="px-4 py-3 text-slate-500 font-medium text-right">Rate</th>
                      <th className="px-4 py-3 text-slate-500 font-medium text-center hidden sm:table-cell">Crew</th>
                      <th className="px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Notes</th>
                      <th className="px-4 py-3 text-slate-500 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRates.map((rate: any) => (
                      <tr key={rate._id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{rate.task}</td>
                        <td className="px-4 py-3 text-right"><span className="text-emerald-600 font-semibold">{rate.rate}</span><span className="text-slate-500 ml-1">{rate.unit}</span></td>
                        <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">{rate.crew}</td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{rate.notes || "—"}</td>
                        <td className="px-4 py-3"><button onClick={() => handleDeleteRate(rate._id)} className="text-slate-400 hover:text-red-600 text-xs transition-colors">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 mx-5 mb-5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 mb-3">No rates in {RATE_DB_CATEGORIES.find(c => c.id === activeRateCat)?.label ?? activeRateCat}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={handleSeedDefaults} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm rounded-lg transition-colors">Load Defaults</button>
                  <button onClick={() => { setNewRate({ ...newRate, category: activeRateCat }); setShowRateAdd(true); }} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors">Add Rate</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
