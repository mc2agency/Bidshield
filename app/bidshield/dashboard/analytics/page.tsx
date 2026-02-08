"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// Demo data: 10 historical projects for demo mode
const DEMO_PROJECTS = [
  { _id: "d1", name: "Harbor Point Tower", gc: "Turner Construction", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 45000, totalBidAmount: 850000, materialCost: 425000, laborCost: 340000, otherCost: 85000, status: "in_progress", bidDate: "2026-02-15", lossReason: undefined },
  { _id: "d2", name: "Riverside Medical Center", gc: "Skanska USA", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 32000, totalBidAmount: 540000, materialCost: 270000, laborCost: 216000, otherCost: 54000, status: "won", bidDate: "2026-01-10", lossReason: undefined },
  { _id: "d3", name: "Warehouse District Remodel", gc: "Turner Construction", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 18000, totalBidAmount: 310000, materialCost: 155000, laborCost: 124000, otherCost: 31000, status: "won", bidDate: "2025-12-05", lossReason: undefined },
  { _id: "d4", name: "City Hall Restoration", gc: "Gilbane Building", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 28000, totalBidAmount: 620000, materialCost: 310000, laborCost: 248000, otherCost: 62000, status: "won", bidDate: "2025-11-22", lossReason: undefined },
  { _id: "d5", name: "Metro Office Complex", gc: "AECOM Tishman", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 52000, totalBidAmount: 780000, materialCost: 390000, laborCost: 312000, otherCost: 78000, status: "lost", bidDate: "2025-11-01", lossReason: "Price too high" },
  { _id: "d6", name: "Greenfield Elementary", gc: "Skanska USA", primaryAssembly: "TPO 60mil Fully Adhered", sqft: 14000, totalBidAmount: 280000, materialCost: 140000, laborCost: 112000, otherCost: 28000, status: "won", bidDate: "2025-10-15", lossReason: undefined },
  { _id: "d7", name: "Sunset Ridge Condos", gc: "Turner Construction", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 22000, totalBidAmount: 396000, materialCost: 198000, laborCost: 158400, otherCost: 39600, status: "lost", bidDate: "2025-09-20", lossReason: "GC preference" },
  { _id: "d8", name: "Industrial Park Bldg C", gc: "AECOM Tishman", primaryAssembly: "EPDM 60mil", sqft: 38000, totalBidAmount: 550000, materialCost: 275000, laborCost: 220000, otherCost: 55000, status: "won", bidDate: "2025-08-10", lossReason: undefined },
  { _id: "d9", name: "County Courthouse Annex", gc: "Gilbane Building", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 16000, totalBidAmount: 320000, materialCost: 160000, laborCost: 128000, otherCost: 32000, status: "lost", bidDate: "2025-07-15", lossReason: "Scope issue" },
  { _id: "d10", name: "Lakewood Shopping Center", gc: "Turner Construction", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 60000, totalBidAmount: 960000, materialCost: 480000, laborCost: 384000, otherCost: 96000, status: "won", bidDate: "2025-06-01", lossReason: undefined },
];

const STATUS_COLOR: Record<string, string> = {
  won: "#34d399",
  lost: "#f87171",
  in_progress: "#fbbf24",
  submitted: "#fbbf24",
  setup: "#94a3b8",
  no_bid: "#94a3b8",
};

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const convexStats = useQuery(
    api.bidshield.getStats,
    !isDemo && userId ? { userId } : "skip"
  );
  const comparisonData = useQuery(
    api.bidshield.getComparisonData,
    !isDemo && userId ? { userId } : "skip"
  );

  const rawProjects: any[] = isDemo ? DEMO_PROJECTS : (comparisonData?.projects ?? []);
  const stats = isDemo
    ? {
        activeProjects: 2,
        expiringQuotes: 1,
        openRFIs: 3,
        pipelineValue: 1270000,
        wonProjects: 6,
        lostProjects: 3,
        winRate: 67,
        wonValue: 3500000,
        avgDollarPerSf: 17.52,
      }
    : convexStats;

  // Filters
  const [assemblyFilter, setAssemblyFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Unique assemblies for filter dropdown
  const assemblies = useMemo(() => {
    const set = new Set<string>();
    rawProjects.forEach((p) => { if (p.primaryAssembly) set.add(p.primaryAssembly); });
    return Array.from(set).sort();
  }, [rawProjects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let list = rawProjects;
    if (assemblyFilter !== "all") list = list.filter((p) => p.primaryAssembly === assemblyFilter);
    if (outcomeFilter !== "all") list = list.filter((p) => p.status === outcomeFilter);
    if (dateRange !== "all") {
      const now = Date.now();
      const months = dateRange === "6mo" ? 6 : dateRange === "12mo" ? 12 : 24;
      const cutoff = now - months * 30 * 24 * 60 * 60 * 1000;
      list = list.filter((p) => p.bidDate && new Date(p.bidDate).getTime() >= cutoff);
    }
    return list;
  }, [rawProjects, assemblyFilter, outcomeFilter, dateRange]);

  // Projects with pricing data
  const pricedProjects = filteredProjects.filter(
    (p) => p.totalBidAmount && p.sqft && p.sqft > 0
  );

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  const totalBids = stats.wonProjects + stats.lostProjects;

  // $/SF chart data
  const dollarPerSfData = pricedProjects
    .map((p) => ({
      name: p.name?.length > 20 ? p.name.substring(0, 18) + "..." : p.name,
      fullName: p.name,
      dollarPerSf: +(p.totalBidAmount / p.sqft).toFixed(2),
      status: p.status,
      bidDate: p.bidDate,
    }))
    .sort((a, b) => (a.bidDate || "").localeCompare(b.bidDate || ""));

  const avgDpsf = pricedProjects.length > 0
    ? pricedProjects.reduce((sum, p) => sum + p.totalBidAmount / p.sqft, 0) / pricedProjects.length
    : 0;

  // Cost breakdown chart data
  const costBreakdownData = pricedProjects
    .filter((p) => p.materialCost || p.laborCost || p.otherCost)
    .map((p) => ({
      name: p.name?.length > 20 ? p.name.substring(0, 18) + "..." : p.name,
      fullName: p.name,
      material: p.materialCost || 0,
      labor: p.laborCost || 0,
      other: p.otherCost || 0,
    }))
    .sort((a, b) => (b.material + b.labor + b.other) - (a.material + a.labor + a.other));

  // Win rate by GC
  const gcData = isDemo ? compileGcStats(DEMO_PROJECTS) : Object.entries(comparisonData?.gcStats ?? {})
    .map(([gc, data]: [string, any]) => ({ gc, won: data.won, lost: data.lost, total: data.total, winRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0 }))
    .filter((g) => g.total >= 2)
    .sort((a, b) => b.total - a.total);

  // Loss reasons
  const lossReasonData = isDemo
    ? compileLossReasons(DEMO_PROJECTS)
    : Object.entries(comparisonData?.lossReasons ?? {})
        .map(([reason, count]: [string, any]) => ({ reason, count: count as number }))
        .sort((a, b) => b.count - a.count);

  const totalLosses = lossReasonData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Analytics & Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          Track your bidding performance, compare $/SF, and identify trends
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Assembly</label>
          <select value={assemblyFilter} onChange={(e) => setAssemblyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500">
            <option value="all">All Assemblies</option>
            {assemblies.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Outcome</label>
          <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500">
            <option value="all">All Outcomes</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500">
            <option value="all">All Time</option>
            <option value="6mo">Last 6 Months</option>
            <option value="12mo">Last 12 Months</option>
            <option value="24mo">Last 24 Months</option>
          </select>
        </div>
        <div className="flex items-end">
          <span className="text-[11px] text-slate-500">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} &middot; {pricedProjects.length} with pricing
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-emerald-400">{stats.winRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Win Rate</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400">{totalBids}</div>
          <div className="text-xs text-slate-400 mt-1">Decided Bids</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-emerald-400">
            ${(stats.wonValue / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-400 mt-1">Revenue Won</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-amber-400">
            ${(stats.pipelineValue / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-slate-400 mt-1">Active Pipeline</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-400">
            ${stats.avgDollarPerSf ? stats.avgDollarPerSf.toFixed(2) : "—"}
          </div>
          <div className="text-xs text-slate-400 mt-1">Avg $/SF</div>
        </div>
      </div>

      {/* $/SF by Project Chart */}
      {dollarPerSfData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-1">$/SF by Project</h3>
          <p className="text-xs text-slate-500 mb-4">
            Color: <span className="text-emerald-400">Won</span> &middot; <span className="text-red-400">Lost</span> &middot; <span className="text-amber-400">Pending</span>
            {avgDpsf > 0 && <> &middot; Avg: <span className="text-purple-400">${avgDpsf.toFixed(2)}/SF</span></>}
          </p>
          <div style={{ height: Math.max(200, dollarPerSfData.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dollarPerSfData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#f8fafc" }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}/SF`, "$/SF"]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                {avgDpsf > 0 && (
                  <ReferenceLine x={avgDpsf} stroke="#a78bfa" strokeDasharray="5 5" label={{ value: `Avg $${avgDpsf.toFixed(2)}`, fill: "#a78bfa", fontSize: 10, position: "top" }} />
                )}
                <Bar dataKey="dollarPerSf" radius={[0, 4, 4, 0]}>
                  {dollarPerSfData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLOR[entry.status] || "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {costBreakdownData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-1">Cost Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">
            <span className="text-blue-400">Material</span> &middot; <span className="text-emerald-400">Labor</span> &middot; <span className="text-slate-400">Other</span>
          </p>
          <div style={{ height: Math.max(200, costBreakdownData.length * 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdownData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#f8fafc" }}
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="material" stackId="cost" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="labor" stackId="cost" fill="#34d399" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" stackId="cost" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Win Rate by GC + Loss Reasons side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Win Rate by GC */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Win Rate by GC</h3>
          {gcData.length > 0 ? (
            <div className="space-y-3">
              {gcData.map((g) => (
                <div key={g.gc}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-200 truncate max-w-[180px]">{g.gc}</span>
                    <span className="text-xs text-slate-400">{g.won}W / {g.lost}L ({g.winRate}%)</span>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                    {g.won > 0 && (
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(g.won / g.total) * 100}%` }}
                      />
                    )}
                    {g.lost > 0 && (
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${(g.lost / g.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Need 2+ bids per GC to show data</p>
          )}
        </div>

        {/* Loss Reasons */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Loss Reasons</h3>
          {lossReasonData.length > 0 ? (
            <div className="space-y-3">
              {lossReasonData.map((d) => (
                <div key={d.reason}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-200">{d.reason}</span>
                    <span className="text-xs text-slate-400">{d.count} ({totalLosses > 0 ? Math.round((d.count / totalLosses) * 100) : 0}%)</span>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${totalLosses > 0 ? (d.count / totalLosses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No loss reasons recorded yet</p>
          )}
        </div>
      </div>

      {/* Project History Table */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">Project History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Project", "GC", "Assembly", "SF", "$/SF", "Amount", "Result", "Date"].map((h) => (
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
              {filteredProjects
                .sort((a, b) => (b.bidDate || "").localeCompare(a.bidDate || ""))
                .map((p: any, i: number) => {
                  const dpsf = p.totalBidAmount && p.sqft && p.sqft > 0 ? (p.totalBidAmount / p.sqft).toFixed(2) : "—";
                  const statusLabel = p.status === "won" ? "WON" : p.status === "lost" ? "LOST" : p.status === "submitted" ? "SUBMITTED" : p.status === "in_progress" ? "ACTIVE" : p.status === "no_bid" ? "NO BID" : "SETUP";
                  const statusClasses = p.status === "won" ? "bg-emerald-500/20 text-emerald-400" : p.status === "lost" ? "bg-red-500/20 text-red-400" : p.status === "in_progress" || p.status === "submitted" ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-400";
                  return (
                    <tr key={p._id || i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-3 text-sm text-slate-200 max-w-[160px] truncate">{p.name}</td>
                      <td className="p-3 text-sm text-slate-400 max-w-[120px] truncate">{p.gc || "—"}</td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-[140px] truncate">{p.primaryAssembly || "—"}</td>
                      <td className="p-3 text-sm text-slate-300 tabular-nums">{p.sqft ? p.sqft.toLocaleString() : "—"}</td>
                      <td className="p-3 text-sm text-slate-300 tabular-nums">{dpsf !== "—" ? `$${dpsf}` : "—"}</td>
                      <td className="p-3 text-sm font-bold text-slate-300 tabular-nums">
                        {p.totalBidAmount ? `$${(p.totalBidAmount / 1000).toFixed(0)}k` : p.estimatedValue ? `$${(p.estimatedValue / 1000).toFixed(0)}k` : "—"}
                      </td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusClasses}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-400">{p.bidDate || "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">
            No projects match your filters. Adjust filters above or add projects from the dashboard.
          </p>
        )}
      </div>
    </div>
  );
}

// Helper: compile GC stats from project list (for demo mode)
function compileGcStats(projects: any[]) {
  const gcMap: Record<string, { won: number; lost: number; total: number }> = {};
  for (const p of projects) {
    if (p.gc && (p.status === "won" || p.status === "lost")) {
      if (!gcMap[p.gc]) gcMap[p.gc] = { won: 0, lost: 0, total: 0 };
      gcMap[p.gc].total += 1;
      if (p.status === "won") gcMap[p.gc].won += 1;
      if (p.status === "lost") gcMap[p.gc].lost += 1;
    }
  }
  return Object.entries(gcMap)
    .map(([gc, data]) => ({ gc, ...data, winRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0 }))
    .filter((g) => g.total >= 2)
    .sort((a, b) => b.total - a.total);
}

// Helper: compile loss reasons from project list (for demo mode)
function compileLossReasons(projects: any[]) {
  const reasons: Record<string, number> = {};
  for (const p of projects) {
    if (p.status === "lost" && p.lossReason) {
      reasons[p.lossReason] = (reasons[p.lossReason] || 0) + 1;
    }
  }
  return Object.entries(reasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
