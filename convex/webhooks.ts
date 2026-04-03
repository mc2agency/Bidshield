import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
