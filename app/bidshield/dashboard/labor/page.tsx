"use client";

import { laborRates } from "@/lib/bidshield/demo-data";
import { useState } from "react";

export default function LaborPage() {
  const [burdenRate, setBurdenRate] = useState(45);
  const [baseRate, setBaseRate] = useState(85);
  const [crewSize, setCrewSize] = useState(4);
  const [hoursPerDay, setHoursPerDay] = useState(8);

  const totalBurdenedRate = baseRate + burdenRate;
  const dailyCrewCost = totalBurdenedRate * crewSize * hoursPerDay;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white">👷 Labor Production Rates</h2>
        <p className="text-sm text-slate-400 mt-1">
          Benchmark database for validating labor estimates
        </p>
      </div>

      {/* Labor Burden Calculator */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">💵 Labor Burden Calculator</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Base Rate ($/hr)</label>
            <input
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Burden ($/hr)</label>
            <input
              type="number"
              value={burdenRate}
              onChange={(e) => setBurdenRate(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Crew Size</label>
            <input
              type="number"
              value={crewSize}
              onChange={(e) => setCrewSize(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hours/Day</label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">${totalBurdenedRate}/hr</div>
            <div className="text-xs text-slate-400 mt-1">Burdened Rate</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">${dailyCrewCost.toLocaleString()}/day</div>
            <div className="text-xs text-slate-400 mt-1">Daily Crew Cost</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">${(dailyCrewCost * 5).toLocaleString()}/wk</div>
            <div className="text-xs text-slate-400 mt-1">Weekly Crew Cost</div>
          </div>
        </div>
      </div>

      {/* Rate Tables */}
      {Object.entries(laborRates).map(([category, rates]) => (
        <div key={category} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4 capitalize">{category}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Task", "Rate", "Unit", "Crew", "Notes"].map((h) => (
                    <th
                      key={h}
                      className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-b border-slate-700">
                    <td className="p-3 text-sm text-slate-200">{rate.task}</td>
                    <td className="p-3 text-sm font-bold text-emerald-500">{rate.rate}</td>
                    <td className="p-3 text-sm text-slate-200">{rate.unit}</td>
                    <td className="p-3 text-sm text-slate-200">{rate.crew} man</td>
                    <td className="p-3 text-[13px] text-slate-400">{rate.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
