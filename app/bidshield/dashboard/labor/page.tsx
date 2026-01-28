"use client";

import { useState } from "react";

// Labor production rates database
const LABOR_RATES = {
  membrane: [
    { id: "m1", task: "TPO/PVC Install (mechanically attached)", rate: "12-15 SQ", unit: "/day", crew: 4, notes: "Standard conditions, open field" },
    { id: "m2", task: "TPO/PVC Install (fully adhered)", rate: "8-12 SQ", unit: "/day", crew: 4, notes: "Depends on deck condition" },
    { id: "m3", task: "EPDM Install (ballasted)", rate: "15-20 SQ", unit: "/day", crew: 4, notes: "Includes stone spread" },
    { id: "m4", task: "EPDM Install (fully adhered)", rate: "10-14 SQ", unit: "/day", crew: 4, notes: "Standard conditions" },
    { id: "m5", task: "Modified Bitumen (torch)", rate: "10-12 SQ", unit: "/day", crew: 3, notes: "2-ply system" },
    { id: "m6", task: "Modified Bitumen (cold adhesive)", rate: "12-15 SQ", unit: "/day", crew: 3, notes: "2-ply system" },
    { id: "m7", task: "Built-Up Roofing (BUR)", rate: "8-10 SQ", unit: "/day", crew: 4, notes: "4-ply system" },
  ],
  insulation: [
    { id: "i1", task: "Polyiso (1 layer, mech attached)", rate: "20-25 SQ", unit: "/day", crew: 4, notes: "Standard 4' x 8' boards" },
    { id: "i2", task: "Polyiso (2 layers, staggered)", rate: "12-16 SQ", unit: "/day", crew: 4, notes: "Includes joint staggering" },
    { id: "i3", task: "Tapered Insulation System", rate: "10-14 SQ", unit: "/day", crew: 4, notes: "Includes layout time" },
    { id: "i4", task: "Cover Board (HD ISO/Gypsum)", rate: "15-20 SQ", unit: "/day", crew: 4, notes: "Over insulation" },
    { id: "i5", task: "Spray Foam (SPF)", rate: "20-30 SQ", unit: "/day", crew: 2, notes: "Weather dependent" },
  ],
  flashing: [
    { id: "f1", task: "Wall Flashing (membrane)", rate: "80-120 LF", unit: "/day", crew: 2, notes: "Standard height <18\"" },
    { id: "f2", task: "Wall Flashing (metal counter)", rate: "60-100 LF", unit: "/day", crew: 2, notes: "Including sealant" },
    { id: "f3", task: "Edge Metal (fascia/gravel stop)", rate: "120-180 LF", unit: "/day", crew: 2, notes: "Pre-formed sections" },
    { id: "f4", task: "Coping Cap (2-piece)", rate: "60-100 LF", unit: "/day", crew: 2, notes: "With cleats" },
    { id: "f5", task: "Curb Flashing (pre-fab)", rate: "6-10 EA", unit: "/day", crew: 2, notes: "Standard RTU curb" },
    { id: "f6", task: "Curb Flashing (field-fab)", rate: "4-6 EA", unit: "/day", crew: 2, notes: "Custom sizes" },
    { id: "f7", task: "Expansion Joint Cover", rate: "40-60 LF", unit: "/day", crew: 2, notes: "Including membrane tie-in" },
  ],
  accessories: [
    { id: "a1", task: "Roof Drain Install (new)", rate: "4-6 EA", unit: "/day", crew: 2, notes: "New construction, includes flashing" },
    { id: "a2", task: "Roof Drain Retrofit", rate: "3-5 EA", unit: "/day", crew: 2, notes: "Tie into existing" },
    { id: "a3", task: "Pitch Pan (new)", rate: "8-12 EA", unit: "/day", crew: 2, notes: "Standard size" },
    { id: "a4", task: "Pipe Boot (prefab)", rate: "12-18 EA", unit: "/day", crew: 2, notes: "Pourable sealer type" },
    { id: "a5", task: "Roof Hatch Install", rate: "2-3 EA", unit: "/day", crew: 3, notes: "Includes curb & flashing" },
    { id: "a6", task: "Skylight (unit)", rate: "2-4 EA", unit: "/day", crew: 3, notes: "Pre-fab curb mount" },
    { id: "a7", task: "Walkway Pads", rate: "200-400 SF", unit: "/day", crew: 2, notes: "Adhered type" },
  ],
  tearoff: [
    { id: "t1", task: "Single-Ply Tearoff", rate: "25-35 SQ", unit: "/day", crew: 4, notes: "To deck, no wet insulation" },
    { id: "t2", task: "BUR/Mod Bit Tearoff", rate: "15-25 SQ", unit: "/day", crew: 4, notes: "Multiple layers" },
    { id: "t3", task: "Wet Insulation Removal", rate: "15-20 SQ", unit: "/day", crew: 4, notes: "Heavy, requires dumpster management" },
    { id: "t4", task: "Gravel Removal (vacuum)", rate: "20-30 SQ", unit: "/day", crew: 3, notes: "With vacuum truck" },
  ],
};

// Burden rate components
const DEFAULT_BURDEN = {
  workersComp: 25, // % of base wage
  fica: 7.65,
  sui: 3.5,
  fui: 0.6,
  benefits: 8, // health, etc as % of wage
};

export default function LaborPage() {
  const [baseWage, setBaseWage] = useState(28);
  const [burdenComponents, setBurdenComponents] = useState(DEFAULT_BURDEN);
  const [crewSize, setCrewSize] = useState(4);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate total burden percentage
  const totalBurdenPercent = 
    burdenComponents.workersComp + 
    burdenComponents.fica + 
    burdenComponents.sui + 
    burdenComponents.fui + 
    burdenComponents.benefits;

  const burdenedRate = baseWage * (1 + totalBurdenPercent / 100);
  const dailyCrewCost = burdenedRate * crewSize * hoursPerDay;

  const categories = Object.keys(LABOR_RATES);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white">👷 Labor Rates & Calculator</h2>
        <p className="text-sm text-slate-400 mt-1">
          Calculate burdened rates and reference production benchmarks
        </p>
      </div>

      {/* Labor Burden Calculator */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">💵 Labor Burden Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div>
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">Base Hourly Wage ($)</label>
              <input
                type="number"
                value={baseWage}
                onChange={(e) => setBaseWage(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-400 mb-2 font-medium">Burden Components (%)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Workers' Comp</label>
                <input
                  type="number"
                  value={burdenComponents.workersComp}
                  onChange={(e) => setBurdenComponents({ ...burdenComponents, workersComp: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">FICA (7.65%)</label>
                <input
                  type="number"
                  value={burdenComponents.fica}
                  onChange={(e) => setBurdenComponents({ ...burdenComponents, fica: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">State UI</label>
                <input
                  type="number"
                  value={burdenComponents.sui}
                  onChange={(e) => setBurdenComponents({ ...burdenComponents, sui: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Federal UI</label>
                <input
                  type="number"
                  value={burdenComponents.fui}
                  onChange={(e) => setBurdenComponents({ ...burdenComponents, fui: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">Benefits (Health, PTO, etc.)</label>
                <input
                  type="number"
                  value={burdenComponents.benefits}
                  onChange={(e) => setBurdenComponents({ ...burdenComponents, benefits: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Total Burden:</span>
                <span className="text-amber-400 font-bold">{totalBurdenPercent.toFixed(2)}%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                = ${baseWage} × {(1 + totalBurdenPercent / 100).toFixed(3)} = ${burdenedRate.toFixed(2)}/hr
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Crew Size</label>
                <input
                  type="number"
                  value={crewSize}
                  onChange={(e) => setCrewSize(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hours/Day</label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">${burdenedRate.toFixed(2)}</div>
                <div className="text-xs text-emerald-400/70 mt-1">Fully Burdened Rate / hour</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">${dailyCrewCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-[11px] text-blue-400/70">Daily Crew Cost</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-amber-400">${(dailyCrewCost * 5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-[11px] text-amber-400/70">Weekly Crew Cost</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-xs text-red-400 font-medium">⚠️ Common Mistake</div>
              <div className="text-[11px] text-red-400/80 mt-1">
                Using ${baseWage}/hr instead of ${burdenedRate.toFixed(2)}/hr loses you ${((burdenedRate - baseWage) * crewSize * hoursPerDay).toFixed(0)}/day per crew!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            selectedCategory === null
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-sm rounded-lg font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rate Tables */}
      {Object.entries(LABOR_RATES)
        .filter(([cat]) => !selectedCategory || cat === selectedCategory)
        .map(([category, rates]) => (
          <div key={category} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="text-base font-semibold text-white mb-4 capitalize flex items-center gap-2">
              {category === "membrane" && "🛡️"}
              {category === "insulation" && "🧱"}
              {category === "flashing" && "🔩"}
              {category === "accessories" && "📦"}
              {category === "tearoff" && "🗑️"}
              {category}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                      Task
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                      Production Rate
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                      Crew
                    </th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-3 text-sm text-slate-200">{rate.task}</td>
                      <td className="p-3">
                        <span className="text-sm font-bold text-emerald-400">{rate.rate}</span>
                        <span className="text-xs text-slate-500 ml-1">{rate.unit}</span>
                      </td>
                      <td className="p-3 text-sm text-slate-300">{rate.crew} crew</td>
                      <td className="p-3 text-[12px] text-slate-400">{rate.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Pro Tips */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3">💡 Pro Tips</h3>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• These are <strong>benchmark rates</strong> for standard conditions — adjust for complexity</li>
          <li>• Add 15-25% for cut-up roofs with many penetrations</li>
          <li>• Add 10-15% for high-rise or limited access</li>
          <li>• Weather delays: budget 1 lost day per week in shoulder seasons</li>
          <li>• Always include mobilization time (typically 0.5-1 day)</li>
        </ul>
      </div>
    </div>
  );
}
