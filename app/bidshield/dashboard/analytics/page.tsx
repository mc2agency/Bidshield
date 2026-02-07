"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const demoStats = {
  activeProjects: 2,
  expiringQuotes: 1,
  openRFIs: 3,
  pipelineValue: 1270000,
  wonProjects: 8,
  lostProjects: 5,
  winRate: 62,
  wonValue: 3200000,
};

// Simple bar chart component
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const convexStats = useQuery(
    api.bidshield.getStats,
    !isDemo && userId ? { userId } : "skip"
  );

  const convexProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );

  const stats = isDemo ? demoStats : convexStats;
  const projects: { name: string; status: string; estimatedValue?: number; bidDate?: string }[] = isDemo
    ? [
        { name: "Harbor Point Tower", status: "in_progress", estimatedValue: 850000, bidDate: "2026-02-15" },
        { name: "Riverside Medical Center", status: "setup", estimatedValue: 420000, bidDate: "2026-02-20" },
        { name: "Warehouse District Remodel", status: "won", estimatedValue: 310000, bidDate: "2026-01-10" },
        { name: "City Hall Restoration", status: "won", estimatedValue: 620000, bidDate: "2025-12-05" },
        { name: "Metro Office Complex", status: "lost", estimatedValue: 480000, bidDate: "2025-11-22" },
        { name: "Greenfield Elementary", status: "won", estimatedValue: 180000, bidDate: "2025-11-01" },
        { name: "Sunset Ridge Condos", status: "lost", estimatedValue: 290000, bidDate: "2025-10-15" },
        { name: "Industrial Park Bldg C", status: "won", estimatedValue: 550000, bidDate: "2025-09-20" },
      ]
    : (convexProjects ?? []);

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  const totalBids = stats.wonProjects + stats.lostProjects;
  const wonProjects = projects.filter((p: { status: string }) => p.status === "won");
  const lostProjects = projects.filter((p: { status: string }) => p.status === "lost");

  // Revenue by month (demo data)
  const monthlyData = isDemo
    ? [
        { month: "Sep", won: 550000, lost: 0 },
        { month: "Oct", won: 0, lost: 290000 },
        { month: "Nov", won: 180000, lost: 480000 },
        { month: "Dec", won: 620000, lost: 0 },
        { month: "Jan", won: 310000, lost: 0 },
        { month: "Feb", won: 0, lost: 0 },
      ]
    : [];

  const maxMonthly = Math.max(...monthlyData.map((d) => Math.max(d.won, d.lost)), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-white">📈 Analytics & Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          Track your bidding performance and identify trends
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-emerald-400">{stats.winRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Win Rate</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-400">{totalBids}</div>
          <div className="text-xs text-slate-400 mt-1">Total Decided Bids</div>
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
      </div>

      {/* Win/Loss Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Win/Loss Split</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-400">Won</span>
                <span className="text-emerald-400 font-bold">{stats.wonProjects}</span>
              </div>
              <Bar value={stats.wonProjects} max={totalBids} color="bg-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-400">Lost</span>
                <span className="text-red-400 font-bold">{stats.lostProjects}</span>
              </div>
              <Bar value={stats.lostProjects} max={totalBids} color="bg-red-500" />
            </div>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg">
            <div className="text-sm text-slate-400">
              You win <span className="text-emerald-400 font-bold">{stats.winRate}%</span> of your bids.{" "}
              {stats.winRate >= 60
                ? "Strong performance! Consider being more selective to maximize margins."
                : stats.winRate >= 40
                  ? "Solid average. Look for patterns in your losses."
                  : "Below average. Review your pricing strategy."}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Pipeline Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-sm text-slate-300">Active Projects</span>
              <span className="text-lg font-bold text-blue-400">{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-sm text-slate-300">Expiring Quotes</span>
              <span className={`text-lg font-bold ${stats.expiringQuotes > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {stats.expiringQuotes}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-sm text-slate-300">Open RFIs</span>
              <span className={`text-lg font-bold ${stats.openRFIs > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {stats.openRFIs}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
              <span className="text-sm text-slate-300">Pipeline Value</span>
              <span className="text-lg font-bold text-emerald-400">
                ${stats.pipelineValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend (demo only for now) */}
      {isDemo && monthlyData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Monthly Bid Results</h3>
          <div className="grid grid-cols-6 gap-3">
            {monthlyData.map((d) => (
              <div key={d.month} className="text-center">
                <div className="h-32 flex flex-col justify-end gap-1">
                  {d.won > 0 && (
                    <div
                      className="bg-emerald-500 rounded-t mx-auto w-8"
                      style={{ height: `${(d.won / maxMonthly) * 100}%` }}
                    />
                  )}
                  {d.lost > 0 && (
                    <div
                      className="bg-red-500 rounded-t mx-auto w-8"
                      style={{ height: `${(d.lost / maxMonthly) * 100}%` }}
                    />
                  )}
                  {d.won === 0 && d.lost === 0 && (
                    <div className="bg-slate-700 rounded-t mx-auto w-8 h-1" />
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2">{d.month}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 justify-center text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded" /> Won
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded" /> Lost
            </div>
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">Recent Bid Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Project", "Value", "Bid Date", "Result"].map((h) => (
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
              {[...wonProjects, ...lostProjects]
                .sort((a: { bidDate?: string }, b: { bidDate?: string }) => (b.bidDate || "").localeCompare(a.bidDate || ""))
                .slice(0, 10)
                .map((p: { name: string; estimatedValue?: number; bidDate?: string; status: string }, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-3 text-sm text-slate-200">{p.name}</td>
                    <td className="p-3 text-sm font-bold text-slate-300">
                      ${((p.estimatedValue || 0) / 1000).toFixed(0)}k
                    </td>
                    <td className="p-3 text-sm text-slate-400">{p.bidDate}</td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          p.status === "won"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {p.status === "won" ? "WON" : "LOST"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {wonProjects.length === 0 && lostProjects.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">
            No completed bids yet. Mark projects as won or lost from the dashboard.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
