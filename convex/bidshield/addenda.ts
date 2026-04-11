import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

export const getAddenda = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_addenda")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createAddendum = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    number: v.number(),
    title: v.string(),
    receivedDate: v.string(),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_addenda", {
      projectId: args.projectId,
      userId: args.userId,
      number: args.number,
      title: args.title,
      receivedDate: args.receivedDate,
      affectsScope: undefined,
      acknowledged: false,
      incorporated: false,
      priority: args.priority || "normal",
      notes: args.notes,
      reviewStatus: "pending_review" as const,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAddendum = mutation({
  args: {
    addendumId: v.id("bidshield_addenda"),
    title: v.optional(v.string()),
    affectsScope: v.optional(v.boolean()),
    acknowledged: v.optional(v.boolean()),
    incorporated: v.optional(v.boolean()),
    scopeImpact: v.optional(v.string()),
    repriced: v.optional(v.boolean()),
    repricedDate: v.optional(v.string()),
    priceImpact: v.optional(v.number()),
    impactCategories: v.optional(v.string()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    reviewStatus: v.optional(v.union(v.literal("reviewed"), v.literal("pending_review"))),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const addendum = await ctx.db.get(args.addendumId);
    await assertRecordOwnership(ctx, addendum, "addendum");
    const { addendumId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(addendumId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteAddendum = mutation({
  args: { addendumId: v.id("bidshield_addenda") },
  handler: async (ctx, args) => {
    const addendum = await ctx.db.get(args.addendumId);
    await assertRecordOwnership(ctx, addendum, "addendum");
    await ctx.db.delete(args.addendumId);
  },
});

export const acknowledgeNoAddenda = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      noAddendaAcknowledged: true,
      updatedAt: Date.now(),
    });
  },
});
