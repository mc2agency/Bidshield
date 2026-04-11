import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== DECISION LOG =====

export const getDecisions = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    await assertProjectOwnership(ctx, projectId);
    return await ctx.db
      .query("bidshield_decisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const addDecision = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    text: v.string(),
    who: v.optional(v.string()),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    await ctx.db.insert("bidshield_decisions", { ...args, timestamp: Date.now() });
  },
});

export const deleteDecision = mutation({
  args: { id: v.id("bidshield_decisions") },
  handler: async (ctx, { id }) => {
    const decision = await ctx.db.get(id);
    await assertRecordOwnership(ctx, decision, "decision");
    await ctx.db.delete(id);
  },
});
