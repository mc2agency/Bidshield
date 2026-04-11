import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== ALTERNATES =====

export const getAlternates = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const items = await ctx.db
      .query("bidshield_alternates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const addAlternate = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    label: v.string(),
    type: v.union(v.literal("add"), v.literal("deduct")),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_alternates", { ...args, createdAt: now, updatedAt: now });
  },
});

export const updateAlternate = mutation({
  args: {
    alternateId: v.id("bidshield_alternates"),
    userId: v.string(),
    label: v.optional(v.string()),
    type: v.optional(v.union(v.literal("add"), v.literal("deduct"))),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const { alternateId, userId: _uid, ...fields } = args;
    const doc = await ctx.db.get(alternateId);
    await assertRecordOwnership(ctx, doc, "alternate");
    await ctx.db.patch(alternateId, { ...fields, updatedAt: Date.now() });
  },
});

export const deleteAlternate = mutation({
  args: { alternateId: v.id("bidshield_alternates"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const doc = await ctx.db.get(args.alternateId);
    await assertRecordOwnership(ctx, doc, "alternate");
    await ctx.db.delete(args.alternateId);
  },
});
