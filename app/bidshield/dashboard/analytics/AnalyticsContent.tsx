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

// Demo data: 10 historical projects for demo mode (4 won projects include actuals)
const DEMO_PROJECTS = [
  { _id: "d1", name: "Meridian Business Park — Bldg C", gc: "Skanska USA", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 68000, totalBidAmount: 1250000, materialCost: 612000, laborCost: 488000, otherCost: 150000, status: "in_progress", bidDate: "2026-03-07", lossReason: undefined },
  { _id: "d2", name: "Riverside Medical Center", gc: "Skanska USA", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 32000, totalBidAmount: 540000, materialCost: 270000, laborCost: 216000, otherCost: 54000, status: "won", bidDate: "2026-01-10", lossReason: undefined, actualCost: 527580, actualMaterialCost: 263700, actualLaborCost: 214200, actualOtherCost: 49680, postJobStatus: "actuals_entered", completedDate: "2026-01-28" },
  { _id: "d3", name: "Warehouse District Remodel", gc: "Turner Construction", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 18000, totalBidAmount: 310000, materialCost: 155000, laborCost: 124000, otherCost: 31000, status: "won", bidDate: "2025-12-05", lossReason: undefined, actualCost: 321160, actualMaterialCost: 162400, actualLaborCost: 126500, actualOtherCost: 32260, postJobStatus: "actuals_entered", completedDate: "2025-12-30" },
  { _id: "d4", name: "City Hall Restoration", gc: "Gilbane Building", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 28000, totalBidAmount: 620000, materialCost: 310000, laborCost: 248000, otherCost: 62000, status: "won", bidDate: "2025-11-22", lossReason: undefined, actualCost: 645420, actualMaterialCost: 318200, actualLaborCost: 261400, actualOtherCost: 65820, postJobStatus: "actuals_entered", completedDate: "2025-12-18" },
  { _id: "d5", name: "Metro Office Complex", gc: "AECOM Tishman", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 52000, totalBidAmount: 780000, materialCost: 390000, laborCost: 312000, otherCost: 78000, status: "lost", bidDate: "2025-11-01", lossReason: "Price too high", competitorName: "Apex Roofing", competitorPrice: 710000 },
  { _id: "d6", name: "Greenfield Elementary", gc: "Skanska USA", primaryAssembly: "TPO 60mil Fully Adhered", sqft: 14000, totalBidAmount: 280000, materialCost: 140000, laborCost: 112000, otherCost: 28000, status: "won", bidDate: "2025-10-15", lossReason: undefined },
  { _id: "d7", name: "Sunset Ridge Condos", gc: "Turner Construction", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 22000, totalBidAmount: 396000, materialCost: 198000, laborCost: 158400, otherCost: 39600, status: "lost", bidDate: "2025-09-20", lossReason: "GC preference", competitorName: "Peak Systems", competitorPrice: 360000 },
  { _id: "d8", name: "Industrial Park Bldg C", gc: "AECOM Tishman", primaryAssembly: "EPDM 60mil", sqft: 38000, totalBidAmount: 550000, materialCost: 275000, laborCost: 220000, otherCost: 55000, status: "won", bidDate: "2025-08-10", lossReason: undefined, actualCost: 583550, actualMaterialCost: 296000, actualLaborCost: 229000, actualOtherCost: 58550, postJobStatus: "actuals_entered", completedDate: "2025-09-05" },
  { _id: "d9", name: "County Courthouse Annex", gc: "Gilbane Building", primaryAssembly: "Modified Bitumen 2-Ply (SBS)", sqft: 16000, totalBidAmount: 320000, materialCost: 160000, laborCost: 128000, otherCost: 32000, status: "lost", bidDate: "2025-07-15", lossReason: "Scope issue", competitorName: "Apex Roofing", competitorPrice: 295000 },
  { _id: "d10", name: "Lakewood Shopping Center", gc: "Turner Construction", primaryAssembly: "TPO 60mil Mechanically Attached", sqft: 60000, totalBidAmount: 960000, materialCost: 480000, laborCost: 384000, otherCost: 96000, status: "won", bidDate: "2025-06-01", lossReason: undefined },
];

const STATUS_COLOR: Record<string, string> = {
  won: "#34d399",
  lost: "#f87171",
  in_progress: "#fbbf24",
  submitted: "#fbbf24",
  setup: "#94a3b8",
  no_bid: "#94a3b8",
  no_award: "#94a3b8",
};

function AnalyticsInner() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId, isLoaded, isSignedIn } = useAuth();

  const subscription = useQuery(
    api.users.getUserSubscription,
    !isDemo && isLoaded && isSignedIn && userId ? { clerkId: userId } : "skip"
  );
  const isPro = isDemo || (subscription?.isPro ?? false);

  const convexStats = useQuery(
    api.bidshield.getStats,
    !isDemo && userId && isPro ? { userId } : "skip"
  );
  const comparisonData = useQuery(
    api.bidshield.getComparisonData,
    !isDemo && userId && isPro ? { userId } : "skip"
  );

  // Gate: Pro only (demo bypasses)
  if (!isDemo) {
    if (!isLoaded || subscription === undefined) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      );
    }
    if (!isPro) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-bg-elevated)" }}>
              <svg className="w-7 h-7" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--bs-text-primary)" }}>Analytics is a Pro feature</h2>
            <p className="text-sm mb-2" style={{ color: "var(--bs-text-muted)" }}>
              Track win rate, $/SF by system type, GC hit rate, and pipeline value over time.
            </p>
            <p className="text-xs mb-6" style={{ color: "var(--bs-text-dim)" }}>14-day free trial — no card required.</p>
            <a
              href="/bidshield/pricing"
              className="inline-block px-6 py-3 font-semibold rounded-lg transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Start Free Trial
            </a>
          </div>
        </div>
      );
    }
  }

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
    (p) => p.totalBidAmount && ((p as any).grossRoofArea || p.sqft) > 0
  );

  // Enhanced GC Intelligence
  const gcIntelData = useMemo(() => {
    const gcMap: Record<string, { won: number; lost: number; total: number; totalSF: number; totalBid: number; wonBid: number; wonSF: number }> = {};
    for (const p of filteredProjects) {
      if (!p.gc || !(p.status === "won" || p.status === "lost")) continue;
      if (!gcMap[p.gc]) gcMap[p.gc] = { won: 0, lost: 0, total: 0, totalSF: 0, totalBid: 0, wonBid: 0, wonSF: 0 };
      const g = gcMap[p.gc];
      g.total += 1;
      if (p.status === "won") { g.won += 1; g.wonBid += (p.totalBidAmount || 0); g.wonSF += ((p as any).grossRoofArea || p.sqft || 0); }
      if (p.status === "lost") g.lost += 1;
      g.totalSF += ((p as any).grossRoofArea || p.sqft || 0);
      g.totalBid += (p.totalBidAmount || 0);
    }
    return Object.entries(gcMap)
      .map(([gc, d]) => ({
        gc,
        bids: d.total,
        wins: d.won,
        winRate: d.total > 0 ? Math.round((d.won / d.total) * 100) : 0,
        avgDpsf: d.totalSF > 0 ? d.totalBid / d.totalSF : 0,
        wonDpsf: d.wonSF > 0 ? d.wonBid / d.wonSF : 0,
        revenue: d.wonBid,
      }))
      .filter((g) => g.bids >= 2)
      .sort((a, b) => b.bids - a.bids);
  }, [filteredProjects]);

  // GC Insights
  const gcInsights = useMemo(() => {
    const insights: string[] = [];
    const bestGc = gcIntelData.reduce((best, g) => g.winRate > (best?.winRate ?? 0) ? g : best, gcIntelData[0]);
    const worstGc = gcIntelData.reduce((worst, g) => g.winRate < (worst?.winRate ?? 100) ? g : worst, gcIntelData[0]);
    const topRevenue = gcIntelData.reduce((top, g) => g.revenue > (top?.revenue ?? 0) ? g : top, gcIntelData[0]);
    if (bestGc && bestGc.winRate > 0) insights.push(`Highest win rate: ${bestGc.gc} at ${bestGc.winRate}% (${bestGc.wins}/${bestGc.bids})`);
    if (worstGc && worstGc.winRate < 100 && worstGc.gc !== bestGc?.gc) insights.push(`Lowest win rate: ${worstGc.gc} at ${worstGc.winRate}% — review pricing strategy`);
    if (topRevenue && topRevenue.revenue > 0) insights.push(`Top revenue source: ${topRevenue.gc} ($${(topRevenue.revenue / 1000).toFixed(0)}k won)`);
    return insights;
  }, [gcIntelData]);

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--bs-text-muted)" }}>Loading analytics...</p>
      </div>
    );
  }

  const totalBids = stats.wonProjects + stats.lostProjects;

  // $/SF chart data
  const dollarPerSfData = pricedProjects
    .map((p) => ({
      name: p.name?.length > 20 ? p.name.substring(0, 18) + "..." : p.name,
      fullName: p.name,
      dollarPerSf: +((p.totalBidAmount / ((p as any).grossRoofArea || p.sqft)).toFixed(2)),
      status: p.status,
      bidDate: p.bidDate,
    }))
    .sort((a, b) => (a.bidDate || "").localeCompare(b.bidDate || ""));

  const avgDpsf = pricedProjects.length > 0
    ? pricedProjects.reduce((sum, p) => sum + p.totalBidAmount / ((p as any).grossRoofArea || p.sqft), 0) / pricedProjects.length
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

  // --- Estimating Accuracy ---
  const projectsWithActuals = filteredProjects.filter(
    (p) => p.actualCost && p.totalBidAmount && p.totalBidAmount > 0
  );
  const accuracyData = projectsWithActuals.map((p) => {
    const totalVar = ((p.actualCost - p.totalBidAmount) / p.totalBidAmount) * 100;
    const matVar = p.materialCost && p.actualMaterialCost
      ? ((p.actualMaterialCost - p.materialCost) / p.materialCost) * 100 : null;
    const labVar = p.laborCost && p.actualLaborCost
      ? ((p.actualLaborCost - p.laborCost) / p.laborCost) * 100 : null;
    return {
      name: p.name,
      estimated: p.totalBidAmount,
      actual: p.actualCost,
      varianceDollar: p.actualCost - p.totalBidAmount,
      variancePct: totalVar,
      matVariancePct: matVar,
      labVariancePct: labVar,
    };
  });

  const avgTotalVariance = accuracyData.length > 0
    ? accuracyData.reduce((sum, d) => sum + d.variancePct, 0) / accuracyData.length : 0;
  const avgMatVariance = accuracyData.length > 0
    ? accuracyData.filter((d) => d.matVariancePct !== null).reduce((sum, d) => sum + (d.matVariancePct ?? 0), 0) / accuracyData.filter((d) => d.matVariancePct !== null).length : 0;
  const avgLabVariance = accuracyData.length > 0
    ? accuracyData.filter((d) => d.labVariancePct !== null).reduce((sum, d) => sum + (d.labVariancePct ?? 0), 0) / accuracyData.filter((d) => d.labVariancePct !== null).length : 0;

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
        <h1 className="app-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>Analytics & Reports</h1>
        <p className="text-sm" style={{ color: "var(--bs-text-muted)" }}>
          Track your bidding performance, compare $/SF, and identify trends
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: "var(--bs-text-muted)" }}>Assembly</label>
          <select value={assemblyFilter} onChange={(e) => setAssemblyFilter(e.target.value)}
            className="rounded px-3 py-1.5 text-xs focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
            <option value="all">All Assemblies</option>
            {assemblies.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: "var(--bs-text-muted)" }}>Outcome</label>
          <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
            className="rounded px-3 py-1.5 text-xs focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
            <option value="all">All Outcomes</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="no_award">No Award</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] block mb-1" style={{ color: "var(--bs-text-muted)" }}>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="rounded px-3 py-1.5 text-xs focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
            <option value="all">All Time</option>
            <option value="6mo">Last 6 Months</option>
            <option value="12mo">Last 12 Months</option>
            <option value="24mo">Last 24 Months</option>
          </select>
        </div>
        <div className="flex items-end">
          <span className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} &middot; {pricedProjects.length} with pricing
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Win Rate", value: `${stats.winRate}%`, accent: "var(--bs-teal)" },
          { label: "Decided Bids", value: String(totalBids), accent: "var(--bs-text-dim)" },
          { label: "Revenue Won", value: `$${(stats.wonValue / 1000).toFixed(0)}K`, accent: "var(--bs-teal)" },
          { label: "Active Pipeline", value: `$${(stats.pipelineValue / 1000).toFixed(0)}K`, accent: "var(--bs-amber)" },
          { label: "Avg $/SF", value: stats.avgDollarPerSf ? `$${stats.avgDollarPerSf.toFixed(2)}` : "—", accent: "#a78bfa" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: "var(--bs-bg-card)", borderRadius: 12, padding: "16px 18px", borderLeft: `4px solid ${accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* $/SF by Project Chart */}
      {dollarPerSfData.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>$/SF by Project</h3>
          <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>
            Color: <span style={{ color: "var(--bs-teal)" }}>Won</span> &middot; <span style={{ color: "var(--bs-red)" }}>Lost</span> &middot; <span style={{ color: "var(--bs-amber)" }}>Pending</span>
            {avgDpsf > 0 && <> &middot; Avg: <span style={{ color: "#a78bfa" }}>${avgDpsf.toFixed(2)}/SF</span></>}
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
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Cost Breakdown</h3>
          <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>
            <span style={{ color: "var(--bs-blue)" }}>Material</span> &middot; <span style={{ color: "var(--bs-teal)" }}>Labor</span> &middot; <span style={{ color: "var(--bs-text-muted)" }}>Other</span>
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

      {/* Estimating Accuracy */}
      {projectsWithActuals.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Estimating Accuracy</h3>
          <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>
            Comparing bid estimates to actual costs for completed projects
          </p>

          {/* Accuracy stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="rounded-lg p-4 text-center" style={{ background: "var(--bs-bg-elevated)" }}>
              <div className="text-2xl font-bold" style={{ color: "var(--bs-blue)" }}>{projectsWithActuals.length}</div>
              <div className="text-[10px] mt-1" style={{ color: "var(--bs-text-muted)" }}>Projects w/ Actuals</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: "var(--bs-bg-elevated)" }}>
              <div className="text-2xl font-bold" style={{ color: Math.abs(avgTotalVariance) <= 5 ? "var(--bs-teal)" : Math.abs(avgTotalVariance) <= 10 ? "var(--bs-amber)" : "var(--bs-red)" }}>
                {avgTotalVariance > 0 ? "+" : ""}{avgTotalVariance.toFixed(1)}%
              </div>
              <div className="text-[10px] mt-1" style={{ color: "var(--bs-text-muted)" }}>Avg Total Variance</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: "var(--bs-bg-elevated)" }}>
              <div className="text-2xl font-bold" style={{ color: Math.abs(avgMatVariance) <= 5 ? "var(--bs-teal)" : Math.abs(avgMatVariance) <= 10 ? "var(--bs-amber)" : "var(--bs-red)" }}>
                {avgMatVariance > 0 ? "+" : ""}{avgMatVariance.toFixed(1)}%
              </div>
              <div className="text-[10px] mt-1" style={{ color: "var(--bs-text-muted)" }}>Avg Material Var.</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: "var(--bs-bg-elevated)" }}>
              <div className="text-2xl font-bold" style={{ color: Math.abs(avgLabVariance) <= 5 ? "var(--bs-teal)" : Math.abs(avgLabVariance) <= 10 ? "var(--bs-amber)" : "var(--bs-red)" }}>
                {avgLabVariance > 0 ? "+" : ""}{avgLabVariance.toFixed(1)}%
              </div>
              <div className="text-[10px] mt-1" style={{ color: "var(--bs-text-muted)" }}>Avg Labor Var.</div>
            </div>
          </div>

          {/* Accuracy by project table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Project", "Estimated", "Actual", "Variance $", "Variance %", "Status"].map((h) => (
                    <th key={h} className="text-left p-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accuracyData.map((d, i) => {
                  const absPct = Math.abs(d.variancePct);
                  const varColor = absPct <= 5 ? "var(--bs-teal)" : absPct <= 10 ? "var(--bs-amber)" : "var(--bs-red)";
                  const statusLabel = absPct <= 5 ? "On Target" : absPct <= 10 ? "Review" : "Over Budget";
                  const statusStyle = absPct <= 5
                    ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
                    : absPct <= 10
                    ? { background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }
                    : { background: "var(--bs-red-dim)", color: "var(--bs-red)" };
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                      <td className="p-2.5 text-sm max-w-[160px] truncate" style={{ color: "var(--bs-text-secondary)" }}>{d.name}</td>
                      <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>${(d.estimated / 1000).toFixed(0)}k</td>
                      <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>${(d.actual / 1000).toFixed(0)}k</td>
                      <td className="p-2.5 text-sm tabular-nums font-semibold" style={{ color: varColor }}>
                        {d.varianceDollar > 0 ? "+" : ""}{d.varianceDollar > 999 || d.varianceDollar < -999 ? `$${(d.varianceDollar / 1000).toFixed(1)}k` : `$${d.varianceDollar.toLocaleString()}`}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tabular-nums" style={{ color: varColor }}>{d.variancePct > 0 ? "+" : ""}{d.variancePct.toFixed(1)}%</span>
                          {/* Mini variance bar */}
                          <div className="w-16 h-2 rounded-full overflow-hidden relative" style={{ background: "var(--bs-bg-elevated)" }}>
                            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "var(--bs-text-dim)" }} />
                            {d.variancePct > 0 ? (
                              <div className="absolute top-0 bottom-0 rounded-full" style={{ left: "50%", width: `${Math.min(50, absPct * 4)}%`, background: "var(--bs-red)" }} />
                            ) : (
                              <div className="absolute top-0 bottom-0 rounded-full" style={{ right: "50%", width: `${Math.min(50, absPct * 4)}%`, background: "var(--bs-teal)" }} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={statusStyle}>{statusLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Trend message */}
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>
            {avgTotalVariance <= 0
              ? `Your estimates are averaging ${Math.abs(avgTotalVariance).toFixed(1)}% under actual costs — strong estimating accuracy.`
              : avgTotalVariance <= 5
                ? `Your estimates average +${avgTotalVariance.toFixed(1)}% over actual — within acceptable range but monitor trends.`
                : `Your estimates average +${avgTotalVariance.toFixed(1)}% over actual — consider reviewing ${Math.abs(avgLabVariance) > Math.abs(avgMatVariance) ? "labor" : "material"} estimating methods.`
            }
          </div>
        </div>
      )}

      {/* GC Intelligence */}
      {gcIntelData.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>GC Intelligence</h3>
          <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>
            Performance breakdown by general contractor
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["General Contractor", "Bids", "Wins", "Win %", "Avg $/SF", "Won $/SF", "Revenue"].map((h) => (
                    <th key={h} className="text-left p-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gcIntelData.map((g) => (
                  <tr key={g.gc} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    <td className="p-2.5 text-sm max-w-[160px] truncate" style={{ color: "var(--bs-text-secondary)" }}>{g.gc}</td>
                    <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{g.bids}</td>
                    <td className="p-2.5 text-sm tabular-nums font-semibold" style={{ color: "var(--bs-teal)" }}>{g.wins}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums" style={{ color: g.winRate >= 60 ? "var(--bs-teal)" : g.winRate >= 40 ? "var(--bs-amber)" : "var(--bs-red)" }}>{g.winRate}%</span>
                        <div className="w-12 h-2 rounded-full overflow-hidden" style={{ background: "var(--bs-bg-elevated)" }}>
                          <div className="h-full rounded-full" style={{ width: `${g.winRate}%`, background: g.winRate >= 60 ? "var(--bs-teal)" : g.winRate >= 40 ? "var(--bs-amber)" : "var(--bs-red)" }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{g.avgDpsf > 0 ? `$${g.avgDpsf.toFixed(2)}` : "—"}</td>
                    <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-teal)" }}>{g.wonDpsf > 0 ? `$${g.wonDpsf.toFixed(2)}` : "—"}</td>
                    <td className="p-2.5 text-sm tabular-nums font-semibold" style={{ color: "var(--bs-text-muted)" }}>{g.revenue > 0 ? `$${(g.revenue / 1000).toFixed(0)}k` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Auto-generated insights */}
          {gcInsights.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {gcInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--bs-text-muted)" }}>
                  <span style={{ color: "var(--bs-amber)" }} className="mt-px">*</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Win Rate by System Type */}
      {(() => {
        const sysStats = isDemo
          ? (() => {
              const m: Record<string, { won: number; lost: number }> = {};
              for (const p of rawProjects) {
                const sys = (p.primaryAssembly || "").includes("TPO") ? "tpo" : (p.primaryAssembly || "").includes("SBS") || (p.primaryAssembly || "").includes("Modified") ? "sbs" : (p.primaryAssembly || "").includes("EPDM") ? "epdm" : "other";
                if (p.status !== "won" && p.status !== "lost") continue;
                if (!m[sys]) m[sys] = { won: 0, lost: 0 };
                if (p.status === "won") m[sys].won++;
                else m[sys].lost++;
              }
              return m;
            })()
          : (comparisonData?.systemStats ?? {});
        const rows = Object.entries(sysStats)
          .map(([sys, d]: [string, any]) => ({ sys: sys.toUpperCase(), won: d.won, lost: d.lost, total: d.won + d.lost, winRate: d.won + d.lost > 0 ? Math.round((d.won / (d.won + d.lost)) * 100) : 0 }))
          .filter(r => r.total >= 1)
          .sort((a, b) => b.total - a.total);
        if (rows.length === 0) return null;
        return (
          <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Win Rate by System Type</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>Performance broken down by membrane system</p>
            <div className="space-y-3">
              {rows.map(r => (
                <div key={r.sys}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>{r.sys}</span>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{r.won}W / {r.lost}L ({r.winRate}%)</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden flex" style={{ background: "var(--bs-bg-elevated)" }}>
                    {r.won > 0 && <div className="h-full" style={{ width: `${(r.won / r.total) * 100}%`, background: "var(--bs-teal)" }} />}
                    {r.lost > 0 && <div className="h-full" style={{ width: `${(r.lost / r.total) * 100}%`, background: "var(--bs-red)" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Win Rate by Project Size */}
      {(() => {
        const sz = isDemo
          ? (() => {
              const m = { small: { won: 0, lost: 0 }, medium: { won: 0, lost: 0 }, large: { won: 0, lost: 0 } };
              for (const p of rawProjects) {
                if (p.status !== "won" && p.status !== "lost") continue;
                const sf = (p as any).grossRoofArea || p.sqft || 0;
                const b = sf < 5000 ? "small" : sf <= 25000 ? "medium" : "large";
                if (p.status === "won") m[b].won++; else m[b].lost++;
              }
              return m;
            })()
          : (comparisonData?.sizeStats ?? { small: { won: 0, lost: 0 }, medium: { won: 0, lost: 0 }, large: { won: 0, lost: 0 } });
        const rows = [
          { label: "Small (<5k SF)", key: "small" as const },
          { label: "Medium (5k–25k SF)", key: "medium" as const },
          { label: "Large (>25k SF)", key: "large" as const },
        ].map(r => ({ ...r, ...(sz[r.key] || { won: 0, lost: 0 }), total: (sz[r.key]?.won || 0) + (sz[r.key]?.lost || 0), winRate: (sz[r.key]?.won || 0) + (sz[r.key]?.lost || 0) > 0 ? Math.round(((sz[r.key]?.won || 0) / ((sz[r.key]?.won || 0) + (sz[r.key]?.lost || 0))) * 100) : 0 }))
          .filter(r => r.total > 0);
        if (rows.length === 0) return null;
        return (
          <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Win Rate by Project Size</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>Where you compete most effectively</p>
            <div className="space-y-3">
              {rows.map(r => (
                <div key={r.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>{r.label}</span>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{r.won}W / {r.lost}L ({r.winRate}%)</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden flex" style={{ background: "var(--bs-bg-elevated)" }}>
                    {r.won > 0 && <div className="h-full" style={{ width: `${(r.won / r.total) * 100}%`, background: "var(--bs-teal)" }} />}
                    {r.lost > 0 && <div className="h-full" style={{ width: `${(r.lost / r.total) * 100}%`, background: "var(--bs-red)" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Competitor Intelligence */}
      {(() => {
        const competitors = isDemo
          ? [
              { name: "Apex Roofing", count: 2, avgPrice: 502500, avgDpsf: 14.82 },
              { name: "Peak Systems", count: 1, avgPrice: 360000, avgDpsf: 16.36 },
            ]
          : (comparisonData?.competitorData ?? []);
        if (competitors.length === 0) return null;
        return (
          <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Competitor Intelligence</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>Based on loss data — who is beating you and at what price</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Competitor", "Times Won vs You", "Avg Bid ($)", "Avg $/SF"].map(h => (
                      <th key={h} className="text-left p-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c: any) => (
                    <tr key={c.name} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                      <td className="p-2.5 text-sm font-semibold" style={{ color: "var(--bs-text-secondary)" }}>{c.name}</td>
                      <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{c.count}</td>
                      <td className="p-2.5 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{c.avgPrice > 0 ? `$${(c.avgPrice / 1000).toFixed(0)}k` : "—"}</td>
                      <td className="p-2.5 text-sm tabular-nums font-semibold" style={{ color: "var(--bs-teal)" }}>{c.avgDpsf > 0 ? `$${c.avgDpsf.toFixed(2)}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] mt-3" style={{ color: "var(--bs-text-dim)" }}>Only shown when competitor name is recorded on lost bids.</p>
          </div>
        );
      })()}

      {/* Win Rate by GC + Loss Reasons side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Win Rate by GC */}
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 16 }}>Win Rate by GC</h3>
          {gcData.length > 0 ? (
            <div className="space-y-3">
              {gcData.map((g) => (
                <div key={g.gc}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm truncate max-w-[180px]" style={{ color: "var(--bs-text-secondary)" }}>{g.gc}</span>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{g.won}W / {g.lost}L ({g.winRate}%)</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden flex" style={{ background: "var(--bs-bg-elevated)" }}>
                    {g.won > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{ width: `${(g.won / g.total) * 100}%`, background: "var(--bs-teal)" }}
                      />
                    )}
                    {g.lost > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{ width: `${(g.lost / g.total) * 100}%`, background: "var(--bs-red)" }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "var(--bs-text-muted)" }}>Need 2+ bids per GC to show data</p>
          )}
        </div>

        {/* Loss Reasons */}
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 16 }}>Loss Reasons</h3>
          {lossReasonData.length > 0 ? (
            <div className="space-y-3">
              {lossReasonData.map((d) => (
                <div key={d.reason}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{d.reason}</span>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{d.count} ({totalLosses > 0 ? Math.round((d.count / totalLosses) * 100) : 0}%)</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--bs-bg-elevated)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${totalLosses > 0 ? (d.count / totalLosses) * 100 : 0}%`, background: "var(--bs-red)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "var(--bs-text-muted)" }}>No loss reasons recorded yet</p>
          )}
        </div>
      </div>

      {/* Project History Table */}
      <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 16 }}>Project History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Project", "GC", "Assembly", "SF", "$/SF", "Amount", "Result", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left p-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}
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
                  const sf = (p as any).grossRoofArea || p.sqft || 0;
                  const dpsf = p.totalBidAmount && sf > 0 ? (p.totalBidAmount / sf).toFixed(2) : "—";
                  const statusLabel = p.status === "won" ? "WON" : p.status === "lost" ? "LOST" : p.status === "no_award" ? "NO AWARD" : p.status === "submitted" ? "SUBMITTED" : p.status === "in_progress" ? "ACTIVE" : p.status === "no_bid" ? "NO BID" : "SETUP";
                  const statusStyle = p.status === "won"
                    ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
                    : p.status === "lost"
                    ? { background: "var(--bs-red-dim)", color: "var(--bs-red)" }
                    : p.status === "in_progress" || p.status === "submitted"
                    ? { background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }
                    : { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" };
                  return (
                    <tr key={p._id || i} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                      <td className="p-3 text-sm max-w-[160px] truncate" style={{ color: "var(--bs-text-secondary)" }}>{p.name}</td>
                      <td className="p-3 text-sm max-w-[120px] truncate" style={{ color: "var(--bs-text-muted)" }}>{p.gc || "—"}</td>
                      <td className="p-3 text-[11px] max-w-[140px] truncate" style={{ color: "var(--bs-text-muted)" }}>{p.primaryAssembly || "—"}</td>
                      <td className="p-3 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{sf > 0 ? sf.toLocaleString() : "—"}</td>
                      <td className="p-3 text-sm tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{dpsf !== "—" ? `$${dpsf}` : "—"}</td>
                      <td className="p-3 text-sm font-bold tabular-nums" style={{ color: "var(--bs-text-muted)" }}>
                        {p.totalBidAmount ? `$${(p.totalBidAmount / 1000).toFixed(0)}k` : "—"}
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={statusStyle}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-sm" style={{ color: "var(--bs-text-muted)" }}>{p.bidDate || "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {filteredProjects.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: "var(--bs-text-muted)" }}>
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

export default function AnalyticsContent() {
  return (
    <Suspense fallback={<div style={{ color: "var(--bs-text-muted)" }}>Loading analytics...</div>}>
      <AnalyticsInner />
    </Suspense>
  );
}
