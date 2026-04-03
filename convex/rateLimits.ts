import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Record a new rate limit entry and return whether the request is allowed.
 * Returns { allowed, count } where count is calls in the current window.
 * This is an atomic mutation so it's safe across concurrent serverless instances.
 */
export const recordAndCheck = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    limit: v.optional(v.number()),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;
    const windowMs = args.windowMs ?? WINDOW_MS;
    const cutoff = Date.now() - windowMs;

    // Count existing calls in the window
    const recent = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action_time", (q) =>
        q.eq("userId", args.userId).eq("action", args.action).gt("timestamp", cutoff)
      )
      .collect();

    if (recent.length >= limit) {
      return { allowed: false, count: recent.length, limit };
    }

    // Record this call
    await ctx.db.insert("rateLimits", {
      userId: args.userId,
      action: args.action,
      timestamp: Date.now(),
    });

    return { allowed: true, count: recent.length + 1, limit };
  },
});

/**
 * Query-only version — check current count without recording.
 */
export const checkLimit = query({
  args: {
    userId: v.string(),
    action: v.string(),
    limit: v.optional(v.number()),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? DEFAULT_LIMIT;
    const windowMs = args.windowMs ?? WINDOW_MS;
    const cutoff = Date.now() - windowMs;

    const recent = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action_time", (q) =>
        q.eq("userId", args.userId).eq("action", args.action).gt("timestamp", cutoff)
      )
      .collect();

    return {
      allowed: recent.length < limit,
      count: recent.length,
      limit,
      remaining: Math.max(0, limit - recent.length),
    };
  },
});
