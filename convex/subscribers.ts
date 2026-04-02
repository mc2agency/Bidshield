import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const subscribeEmail = mutation({
  args: {
    email: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // Deduplicate by email
    const existing = await ctx.db
      .query("email_subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("email_subscribers", {
      email: args.email,
      source: args.source,
      subscribedAt: Date.now(),
    });
  },
});
