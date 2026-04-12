import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

export const getRFIs = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_rfis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createRFI = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    question: v.string(),
    sentTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_rfis", {
      projectId: args.projectId,
      userId: args.userId,
      question: args.question,
      sentTo: args.sentTo,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRFI = mutation({
  args: {
    rfiId: v.id("bidshield_rfis"),
    question: v.optional(v.string()),
    sentTo: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    responseDeadline: v.optional(v.string()), // E-11: YYYY-MM-DD
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("answered"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    const rfi = await ctx.db.get(args.rfiId);
    await assertRecordOwnership(ctx, rfi, "RFI");
    const { rfiId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(rfiId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteRFI = mutation({
  args: { rfiId: v.id("bidshield_rfis"), userId: v.string() },
  handler: async (ctx, args) => {
    const rfi = await ctx.db.get(args.rfiId);
    await assertRecordOwnership(ctx, rfi, "RFI");
    await ctx.db.delete(args.rfiId);
  },
});
