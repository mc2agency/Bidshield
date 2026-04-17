import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Check if a Stripe webhook event has already been processed.
 * Used as an idempotency guard to prevent duplicate email sends on retries.
 */
export const isEventProcessed = query({
  args: { stripeEventId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("processedWebhooks")
      .withIndex("by_stripe_event_id", (q) =>
        q.eq("stripeEventId", args.stripeEventId)
      )
      .first();
    return !!existing;
  },
});

/**
 * Mark a Stripe webhook event as processed.
 * Call this AFTER successfully handling the event.
 */
export const markEventProcessed = mutation({
  args: { stripeEventId: v.string() },
  handler: async (ctx, args) => {
    // Double-check to prevent race conditions
    const existing = await ctx.db
      .query("processedWebhooks")
      .withIndex("by_stripe_event_id", (q) =>
        q.eq("stripeEventId", args.stripeEventId)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("processedWebhooks", {
      stripeEventId: args.stripeEventId,
      processedAt: Date.now(),
    });
  },
});

/**
 * GC-3: Delete processedWebhooks rows older than 14 days.
 * Called by the "purge-processed-webhooks" cron every 24 hours.
 * Stripe retries happen within 3 days; 14-day retention is more than sufficient
 * for deduplication while preventing unbounded table growth.
 */
export const purgeOldProcessedWebhooks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14 days ago
    const stale = await ctx.db
      .query("processedWebhooks")
      .withIndex("by_stripe_event_id")
      .filter((q) => q.lt(q.field("processedAt"), cutoff))
      .take(500);
    await Promise.all(stale.map((row) => ctx.db.delete(row._id)));
    return { deleted: stale.length };
  },
});
