"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { defaultLaborRates } from "@/convex/bidshieldDefaults";

const categories = [
  { id: "membrane", label: "Membrane", icon: "🔲" },
  { id: "insulation", label: "Insulation", icon: "🧱" },
  { id: "flashing", label: "Flashing", icon: "⚡" },
  { id: "accessories", label: "Accessories", icon: "🔩" },
  { id: "tearoff", label: "Tear-Off", icon: "🗑️" },
  { id: "general", label: "General", icon: "📋" },
];

function LaborContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const rates = useQuery(
    api.bidshield.getLaborRates,
    !isDemo && userId ? { userId } : "skip"
  );
  const createRateMut = useMutation(api.bidshield.createLaborRate);
  const deleteRateMut = useMutation(api.bidshield.deleteLaborRate);

  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState("membrane");
  const [newRate, setNewRate] = useState({
    category: "membrane",
    task: "",
    rate: "",
    unit: "/day",
    crew: "2",
    notes: "",
  });

  // Demo data from defaults
  const demoRates = Object.entries(defaultLaborRates).flatMap(([cat, items]) =>
    items.map((item, idx) => ({
      _id: `demo_${cat}_${idx}` as any,
      category: cat,
      task: item.task,
      rate: item.rate,
      unit: item.unit,
      crew: item.crew,
      notes: item.notes,
    }))
  );

  const resolvedRates = isDemo ? demoRates : (rates ?? []);
  const filteredRates = resolvedRates.filter((r: any) => r.category === activeCategory);

  const handleAdd = async () => {
    if (!newRate.task || !newRate.rate || !userId) return;
    await createRateMut({
      userId,
      category: newRate.category,
      task: newRate.task,
      rate: newRate.rate,
      unit: newRate.unit,
      crew: parseInt(newRate.crew) || 2,
      notes: newRate.notes || undefined,
    });
    setNewRate({ category: activeCategory, task: "", rate: "", unit: "/day", crew: "2", notes: "" });
    setShowAdd(false);
  };

  const handleDelete = async (rateId: Id<"bidshield_labor_rates">) => {
    if (isDemo) return;
    await deleteRateMut({ rateId });
  };

  const handleSeedDefaults = async () => {
    if (!userId || isDemo) return;
    const defaultCat = defaultLaborRates[activeCategory as keyof typeof defaultLaborRates];
    if (!defaultCat) return;
    for (const item of defaultCat) {
      await createRateMut({
        userId,
        category: activeCategory,
        task: item.task,
        rate: item.rate,
        unit: item.unit,
        crew: item.crew,
        notes: item.notes,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Labor Rate Database</h2>
          <p className="text-sm text-slate-400 mt-1">Your production rates — reuse across every bid</p>
        </div>
        {!isDemo && (
          <div className="flex gap-2">
            <button
              onClick={handleSeedDefaults}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              Load Defaults
            </button>
            <button
              onClick={() => { setNewRate({ ...newRate, category: activeCategory }); setShowAdd(true); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Add Rate
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = resolvedRates.filter((r: any) => r.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id ? "bg-emerald-500" : "bg-slate-700"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Rate Form */}
      {showAdd && (
        <div className="bg-slate-800 rounded-xl p-5 border border-emerald-500/50">
          <h3 className="text-sm font-semibold text-white mb-4">Add Labor Rate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Task *</label>
              <input
                type="text"
                value={newRate.task}
                onChange={(e) => setNewRate({ ...newRate, task: e.target.value })}
                placeholder="TPO Install (mechanically attached)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rate *</label>
                <input
                  type="text"
                  value={newRate.rate}
                  onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                  placeholder="450 SF"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Unit</label>
                <select
                  value={newRate.unit}
                  onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="/day">/day</option>
                  <option value="/hr">/hr</option>
                  <option value="/EA">/EA</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Crew Size</label>
              <input
                type="number"
                value={newRate.crew}
                onChange={(e) => setNewRate({ ...newRate, crew: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notes</label>
              <input
                type="text"
                value={newRate.notes}
                onChange={(e) => setNewRate({ ...newRate, notes: e.target.value })}
                placeholder="Standard conditions"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Save Rate
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rates Table */}
      {filteredRates.length > 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium">Task</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Rate</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-center hidden sm:table-cell">Crew</th>
                <th className="px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Notes</th>
                {!isDemo && <th className="px-4 py-3 text-slate-400 font-medium w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredRates.map((rate: any) => (
                <tr key={rate._id} className="border-b border-slate-700/50 hover:bg-slate-750 transition-colors">
                  <td className="px-4 py-3 text-white">{rate.task}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-emerald-400 font-semibold">{rate.rate}</span>
                    <span className="text-slate-500 ml-1">{rate.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300 hidden sm:table-cell">{rate.crew}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{rate.notes || "—"}</td>
                  {!isDemo && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(rate._id)}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-4xl mb-3">{categories.find(c => c.id === activeCategory)?.icon || "👷"}</div>
          <p className="text-sm text-slate-400 mb-4">
            No rates in {categories.find(c => c.id === activeCategory)?.label || activeCategory} yet
          </p>
          {!isDemo && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Load Industry Defaults
              </button>
              <button
                onClick={() => { setNewRate({ ...newRate, category: activeCategory }); setShowAdd(true); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
              >
                Add Custom Rate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-[13px] text-slate-400">
        Rates are saved to your account and can be reused across all projects.
        Click "Load Defaults" to start with industry-standard roofing production rates, then customize for your crew.
      </div>
    </div>
  );
}

export default function LaborRatesPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading labor rates...</div>}>
      <LaborContent />
    </Suspense>
  );
}
