import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertRecordOwnership } from "./_helpers";

export const getLaborRates = query({
  args: { userId: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // P0-7: Verify caller identity
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    }
    if (args.category) {
      return await ctx.db
        .query("bidshield_labor_rates")
        .withIndex("by_category", (q) => q.eq("userId", args.userId).eq("category", args.category!))
        .collect();
    }
    return await ctx.db
      .query("bidshield_labor_rates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createLaborRate = mutation({
  args: {
    userId: v.string(),
    category: v.string(),
    task: v.string(),
    rate: v.string(),
    unit: v.string(),
    crew: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_labor_rates", {
      userId: args.userId,
      category: args.category,
      task: args.task,
      rate: args.rate,
      unit: args.unit,
      crew: args.crew,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateLaborRate = mutation({
  args: {
    rateId: v.id("bidshield_labor_rates"),
    task: v.optional(v.string()),
    rate: v.optional(v.string()),
    unit: v.optional(v.string()),
    crew: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const laborRate = await ctx.db.get(args.rateId);
    await assertRecordOwnership(ctx, laborRate, "labor rate");
    const { rateId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(rateId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteLaborRate = mutation({
  args: { rateId: v.id("bidshield_labor_rates") },
  handler: async (ctx, args) => {
    const laborRate = await ctx.db.get(args.rateId);
    await assertRecordOwnership(ctx, laborRate, "labor rate");
    await ctx.db.delete(args.rateId);
  },
});
