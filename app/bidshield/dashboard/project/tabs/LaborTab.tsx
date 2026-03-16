"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { defaultLaborRates } from "@/convex/bidshieldDefaults";
import type { TabProps } from "../tab-types";

const categories = [
  { id: "membrane", label: "Membrane", icon: "🔲" },
  { id: "insulation", label: "Insulation", icon: "🧱" },
  { id: "flashing", label: "Flashing", icon: "⚡" },
  { id: "accessories", label: "Accessories", icon: "🔩" },
  { id: "tearoff", label: "Tear-Off", icon: "🗑️" },
  { id: "general", label: "General", icon: "📋" },
];

export default function LaborTab({ isDemo, isPro, userId, projectId }: TabProps) {
  const rates = useQuery(
    api.bidshield.getLaborRates,
    !isDemo && userId ? { userId } : "skip"
  );
  const createRateMut = useMutation(api.bidshield.createLaborRate);
  const deleteRateMut = useMutation(api.bidshield.deleteLaborRate);
  const isValidProjectId = !isDemo && !!projectId && !projectId.startsWith("demo_");
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
    isValidProjectId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const updateProjectMut = useMutation(api.bidshield.updateProject);

  const [showAdd, setShowAdd] = useState(false);
  const [showEstimator, setShowEstimator] = useState(false);
  const [crewDayRate, setCrewDayRate] = useState(650);
  const [activeCategory, setActiveCategory] = useState("membrane");
  const [newRate, setNewRate] = useState({
    category: "membrane", task: "", rate: "", unit: "/day", crew: "2", notes: "",
  });

  const [demoRates, setDemoRates] = useState(() =>
    Object.entries(defaultLaborRates).flatMap(([cat, items]) =>
      items.map((item, idx) => ({
        _id: `demo_${cat}_${idx}` as any,
        category: cat, task: item.task, rate: item.rate, unit: item.unit, crew: item.crew, notes: item.notes || "",
      }))
    )
  );

  const resolvedRates = isDemo ? demoRates : (rates ?? []);
  const filteredRates = resolvedRates.filter((r: any) => r.category === activeCategory);

  const totalSF = isDemo
    ? 68000
    : (takeoffSections ?? []).reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);

  const sfTasks = useMemo(() => {
    if (!totalSF) return [];
    return resolvedRates
      .filter((r: any) => typeof r.rate === "string" && /\d+\s*SF/i.test(r.rate))
      .map((r: any) => {
        const match = (r.rate as string).match(/^(\d+(?:\.\d+)?)/);
        if (!match) return null;
        const rateVal = parseFloat(match[1]);
        const days = Math.ceil(totalSF / rateVal);
        const crew = (r.crew as number) || 2;
        const cost = days * crew * crewDayRate;
        return { taskName: r.task as string, rate: r.rate as string, unit: r.unit as string, category: r.category as string, days, crew, cost };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [resolvedRates, totalSF, crewDayRate]);

  const totalEstimatedLaborCost = sfTasks.reduce((sum, t) => sum + t.cost, 0);

  const handleApplyLaborCost = async () => {
    if (isDemo || !isValidProjectId || !totalEstimatedLaborCost) return;
    await updateProjectMut({ projectId: projectId as Id<"bidshield_projects">, laborCost: totalEstimatedLaborCost });
  };

  const handleAdd = async () => {
    if (!newRate.task || !newRate.rate) return;
    if (isDemo) {
      setDemoRates(p => [...p, { _id: `demo_new_${Date.now()}` as any, category: newRate.category, task: newRate.task, rate: newRate.rate, unit: newRate.unit, crew: parseInt(newRate.crew) || 2, notes: newRate.notes || "" }]);
    } else if (userId) {
      await createRateMut({ userId, category: newRate.category, task: newRate.task, rate: newRate.rate, unit: newRate.unit, crew: parseInt(newRate.crew) || 2, notes: newRate.notes || undefined });
    }
    setNewRate({ category: activeCategory, task: "", rate: "", unit: "/day", crew: "2", notes: "" });
    setShowAdd(false);
  };

  const handleDelete = async (rateId: Id<"bidshield_labor_rates">) => {
    if (isDemo) { setDemoRates(p => p.filter(r => r._id !== rateId)); return; }
    await deleteRateMut({ rateId });
  };

  const handleSeedDefaults = async () => {
    if (isDemo) return;
    if (!userId) return;
    const defaultCat = defaultLaborRates[activeCategory as keyof typeof defaultLaborRates];
    if (!defaultCat) return;
    for (const item of defaultCat) {
      await createRateMut({
        userId, category: activeCategory, task: item.task, rate: item.rate,
        unit: item.unit, crew: item.crew, notes: item.notes,
      });
    }
  };

  if (!isPro && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Labor Rate Database</h3>
        <p className="text-sm text-slate-500 mb-6">Build and reuse your production rates across every bid. Available on Pro.</p>
        <a href="/bidshield/pricing" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors">
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Labor Rate Database</h2>
          <p className="text-sm text-slate-500 mt-1">Your production rates — reuse across every bid</p>
        </div>
        {(
          <div className="flex gap-2">
            <button onClick={handleSeedDefaults} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Load Defaults</button>
            <button onClick={() => { setNewRate({ ...newRate, category: activeCategory }); setShowAdd(true); }} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors">+ Add Rate</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = resolvedRates.filter((r: any) => r.category === cat.id).length;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${activeCategory === cat.id ? "bg-emerald-600 text-slate-900" : "bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}>
              <span>{cat.icon}</span><span>{cat.label}</span>
              {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? "bg-emerald-500" : "bg-slate-100"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl p-5 border border-emerald-500/50">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Add Labor Rate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Task *</label>
              <input type="text" value={newRate.task} onChange={(e) => setNewRate({ ...newRate, task: e.target.value })} placeholder="TPO Install (mechanically attached)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Rate *</label>
                <input type="text" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} placeholder="450 SF" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Unit</label>
                <select value={newRate.unit} onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm">
                  <option value="/day">/day</option><option value="/hr">/hr</option><option value="/EA">/EA</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Crew Size</label>
              <input type="number" value={newRate.crew} onChange={(e) => setNewRate({ ...newRate, crew: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Notes</label>
              <input type="text" value={newRate.notes} onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })} placeholder="Standard conditions" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors">Save Rate</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {filteredRates.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-slate-500 font-medium">Task</th>
                <th className="px-4 py-3 text-slate-500 font-medium text-right">Rate</th>
                <th className="px-4 py-3 text-slate-500 font-medium text-center hidden sm:table-cell">Crew</th>
                <th className="px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Notes</th>
                {!isDemo && <th className="px-4 py-3 text-slate-500 font-medium w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate: any) => (
                <tr key={rate._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900">{rate.task}</td>
                  <td className="px-4 py-3 text-right"><span className="text-emerald-600 font-semibold">{rate.rate}</span><span className="text-slate-500 ml-1">{rate.unit}</span></td>
                  <td className="px-4 py-3 text-center text-slate-600 hidden sm:table-cell">{rate.crew}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{rate.notes || "—"}</td>
                  {(
                    <td className="px-4 py-3"><button onClick={() => handleDelete(rate._id)} className="text-slate-500 hover:text-red-600 text-xs transition-colors">Delete</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">{categories.find(c => c.id === activeCategory)?.icon || "👷"}</div>
          <p className="text-sm text-slate-500 mb-4">No rates in {categories.find(c => c.id === activeCategory)?.label || activeCategory} yet</p>
          {(
            <div className="flex gap-3 justify-center">
              <button onClick={handleSeedDefaults} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm rounded-lg transition-colors">Load Industry Defaults</button>
              <button onClick={() => { setNewRate({ ...newRate, category: activeCategory }); setShowAdd(true); }} style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors">Add Custom Rate</button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-white rounded-lg border border-slate-200 text-[13px] text-slate-500">
        Rates are saved to your account and can be reused across all projects.
        Click "Load Defaults" to start with industry-standard roofing production rates, then customize for your crew.
      </div>

      {/* Labor Cost Estimator */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowEstimator(s => !s)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Labor Cost Estimator</span>
            {totalSF > 0 && <span className="text-xs text-slate-500">{totalSF.toLocaleString()} SF</span>}
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${showEstimator ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {showEstimator && (
          <div className="px-5 pb-5 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-4">
              <label className="text-sm text-slate-600 whitespace-nowrap">Daily wage ($/person/day incl. burden)</label>
              <input
                type="number"
                value={crewDayRate}
                onChange={(e) => setCrewDayRate(parseInt(e.target.value) || 0)}
                className="w-28 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-900 text-sm"
              />
            </div>
            {sfTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-2 text-xs text-slate-500 font-medium">Task</th>
                      <th className="py-2 px-3 text-xs text-slate-500 font-medium text-right">Days</th>
                      <th className="py-2 px-3 text-xs text-slate-500 font-medium text-right">Crew</th>
                      <th className="py-2 text-xs text-slate-500 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sfTasks.map((task, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">
                          <div className="font-medium">{task.taskName}</div>
                          <div className="text-[10px] text-slate-400">{task.rate} {task.unit} · {task.category}</div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600 tabular-nums">{task.days}</td>
                        <td className="py-2 px-3 text-right text-slate-500 tabular-nums">{task.crew}</td>
                        <td className="py-2 text-right font-semibold text-emerald-600 tabular-nums">${task.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No SF-based rates in your database. Add rates with quantities like &ldquo;450 SF&rdquo; to see estimates here.</p>
            )}
            {sfTasks.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <div className="text-base font-bold text-slate-900">${totalEstimatedLaborCost.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Estimated total (SF-based tasks only)</div>
                </div>
                {!isDemo && isValidProjectId && (
                  <button
                    onClick={handleApplyLaborCost}
                    style={{ background: "#10b981" }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors"
                  >
                    Apply to Pricing
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
