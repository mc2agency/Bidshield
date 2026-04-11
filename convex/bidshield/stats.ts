import { v } from "convex/values";
import { query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { requirePro, roundCurrency } from "./_helpers";

export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // P0-7: Verify caller identity before returning stats
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    }
    await requirePro(ctx, args.userId);
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeProjects = projects.filter(
      (p) => p.status === "setup" || p.status === "in_progress"
    );

    const expiringQuotes = quotes.filter((q) => {
      if (q.status === "expiring") return true;
      if (!q.expirationDate) return false;
      const expDate = new Date(q.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
    });

    const pipelineValue = activeProjects.reduce(
      (sum, p) => sum + (p.totalBidAmount || 0),
      0
    );

    // Win/Loss stats
    const wonProjects = projects.filter((p) => p.status === "won");
    const lostProjects = projects.filter((p) => p.status === "lost");
    const decidedProjects = wonProjects.length + lostProjects.length;
    const winRate = decidedProjects > 0 ? Math.round((wonProjects.length / decidedProjects) * 100) : 0;
    const wonValue = wonProjects.reduce((sum, p) => sum + (p.totalBidAmount || 0), 0);

    // P1: Count open RFIs — batch-load all user RFIs in one query instead of N+1
    const allRfis = await ctx.db
      .query("bidshield_rfis")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const activeProjectIds = new Set(activeProjects.map((p) => p._id));
    const openRFIs = allRfis.filter(
      (r) => r.status === "sent" && activeProjectIds.has(r.projectId)
    ).length;

    const projectsWithPricing = projects.filter(
      (p) => p.totalBidAmount && (p.grossRoofArea || p.sqft) && (p.grossRoofArea || p.sqft)! > 0
    );
    const avgDollarPerSf =
      projectsWithPricing.length > 0
        ? roundCurrency(projectsWithPricing.reduce(
            (sum, p) => sum + p.totalBidAmount! / (p.grossRoofArea || p.sqft)!,
            0
          ) / projectsWithPricing.length)
        : 0;

    return {
      activeProjects: activeProjects.length,
      expiringQuotes: expiringQuotes.length,
      openRFIs,
      pipelineValue,
      wonProjects: wonProjects.length,
      lostProjects: lostProjects.length,
      winRate,
      wonValue,
      avgDollarPerSf,
    };
  },
});

// ===== BID COMPARISON DATA =====

export const getComparisonData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // P0-7: Verify caller identity
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    }
    await requirePro(ctx, args.userId);
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Aggregate $/SF stats by assembly type
    const assemblyStats: Record<
      string,
      { totalDollarPerSf: number; count: number; won: number; lost: number }
    > = {};
    for (const p of projects) {
      const assembly = p.primaryAssembly || "Other";
      if (!assemblyStats[assembly]) {
        assemblyStats[assembly] = { totalDollarPerSf: 0, count: 0, won: 0, lost: 0 };
      }
      const pSf = p.grossRoofArea || p.sqft;
      if (p.totalBidAmount && pSf && pSf > 0) {
        assemblyStats[assembly].totalDollarPerSf += p.totalBidAmount / pSf;
        assemblyStats[assembly].count += 1;
      }
      if (p.status === "won") assemblyStats[assembly].won += 1;
      if (p.status === "lost") assemblyStats[assembly].lost += 1;
    }

    // Win rate by GC
    const gcStats: Record<string, { won: number; lost: number; total: number }> = {};
    for (const p of projects) {
      if (p.gc && (p.status === "won" || p.status === "lost")) {
        if (!gcStats[p.gc]) gcStats[p.gc] = { won: 0, lost: 0, total: 0 };
        gcStats[p.gc].total += 1;
        if (p.status === "won") gcStats[p.gc].won += 1;
        if (p.status === "lost") gcStats[p.gc].lost += 1;
      }
    }

    // Loss reason tallies
    const lossReasons: Record<string, number> = {};
    for (const p of projects) {
      if (p.status === "lost" && p.lossReason) {
        lossReasons[p.lossReason] = (lossReasons[p.lossReason] || 0) + 1;
      }
    }

    // Win rate by system type
    const systemStats: Record<string, { won: number; lost: number; total: number }> = {};
    for (const p of projects) {
      const sys = p.systemType || "other";
      if (p.status === "won" || p.status === "lost") {
        if (!systemStats[sys]) systemStats[sys] = { won: 0, lost: 0, total: 0 };
        systemStats[sys].total += 1;
        if (p.status === "won") systemStats[sys].won += 1;
        if (p.status === "lost") systemStats[sys].lost += 1;
      }
    }

    // Win rate by project size
    const sizeStats = { small: { won: 0, lost: 0 }, medium: { won: 0, lost: 0 }, large: { won: 0, lost: 0 } };
    for (const p of projects) {
      if (p.status !== "won" && p.status !== "lost") continue;
      const sf = p.grossRoofArea || p.sqft || 0;
      const bucket = sf < 5000 ? "small" : sf <= 25000 ? "medium" : "large";
      if (p.status === "won") sizeStats[bucket].won += 1;
      if (p.status === "lost") sizeStats[bucket].lost += 1;
    }

    // Competitor intelligence
    const competitorData: { name: string; count: number; avgPrice: number; avgDpsf: number }[] = [];
    const compMap: Record<string, { count: number; totalPrice: number; totalDpsf: number }> = {};
    for (const p of projects) {
      if (p.status === "lost" && p.competitorName) {
        const n = p.competitorName;
        if (!compMap[n]) compMap[n] = { count: 0, totalPrice: 0, totalDpsf: 0 };
        compMap[n].count += 1;
        if (p.competitorPrice) compMap[n].totalPrice += p.competitorPrice;
        const cSf = p.grossRoofArea || p.sqft;
        if (p.competitorPrice && cSf && cSf > 0) compMap[n].totalDpsf += p.competitorPrice / cSf;
      }
    }
    for (const [name, d] of Object.entries(compMap)) {
      competitorData.push({ name, count: d.count, avgPrice: d.count > 0 ? roundCurrency(d.totalPrice / d.count) : 0, avgDpsf: d.count > 0 ? roundCurrency(d.totalDpsf / d.count) : 0 });
    }
    competitorData.sort((a, b) => b.count - a.count);

    return { projects, assemblyStats, gcStats, lossReasons, systemStats, sizeStats, competitorData };
  },
});
