import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// ── L-16: AI usage tracking ──────────────────────────────────────────────────

/** Log an AI API call */
export const logUsage = mutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
    model: v.optional(v.string()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bidshield_ai_usage", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Get usage stats for a user (last 30 days) */
export const getUsageStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    const allRecent = await ctx.db
      .query("bidshield_ai_usage")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(500);

    // Filter to last 30 days
    const last30 = allRecent.filter((r) => r.createdAt >= thirtyDaysAgo);
    const last7 = last30.filter((r) => r.createdAt >= sevenDaysAgo);
    const today = last30.filter((r) => r.createdAt >= todayMs);

    // Group by endpoint
    const byEndpoint: Record<string, { count: number; errors: number; totalTokensIn: number; totalTokensOut: number; avgDurationMs: number }> = {};
    for (const r of last30) {
      if (!byEndpoint[r.endpoint]) {
        byEndpoint[r.endpoint] = { count: 0, errors: 0, totalTokensIn: 0, totalTokensOut: 0, avgDurationMs: 0 };
      }
      const ep = byEndpoint[r.endpoint];
      ep.count++;
      if (!r.success) ep.errors++;
      ep.totalTokensIn += r.tokensIn ?? 0;
      ep.totalTokensOut += r.tokensOut ?? 0;
      ep.avgDurationMs += r.durationMs ?? 0;
    }
    for (const ep of Object.values(byEndpoint)) {
      if (ep.count > 0) ep.avgDurationMs = Math.round(ep.avgDurationMs / ep.count);
    }

    // Daily breakdown for chart (last 7 days)
    const dailyCounts: { date: string; count: number; errors: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().slice(0, 10);
      const dayStart = new Date(dayStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayItems = last7.filter((r) => r.createdAt >= dayStart && r.createdAt < dayEnd);
      dailyCounts.push({
        date: dayStr,
        count: dayItems.length,
        errors: dayItems.filter((r) => !r.success).length,
      });
    }

    return {
      totalCalls30d: last30.length,
      totalCalls7d: last7.length,
      totalCallsToday: today.length,
      successRate: last30.length > 0 ? Math.round((last30.filter((r) => r.success).length / last30.length) * 100) : 100,
      totalTokensIn: last30.reduce((s, r) => s + (r.tokensIn ?? 0), 0),
      totalTokensOut: last30.reduce((s, r) => s + (r.tokensOut ?? 0), 0),
      byEndpoint,
      dailyCounts,
      recentCalls: last30.slice(0, 10),
    };
  },
});
