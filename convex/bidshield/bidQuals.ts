import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership } from "./_helpers";

// ─── Bid Qualifications ───────────────────────────────────────────────────────

export const getBidQuals = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_bid_quals")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

export const upsertBidQuals = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    plansDated: v.optional(v.string()),
    planRevision: v.optional(v.string()),
    specSections: v.optional(v.string()),
    addendaThrough: v.optional(v.number()),
    drawingSheets: v.optional(v.string()),
    laborType: v.optional(v.union(v.literal("open_shop"), v.literal("prevailing_wage"), v.literal("union"))),
    wageDeterminationNum: v.optional(v.string()),
    wageDeterminationDate: v.optional(v.string()),
    unionLocal: v.optional(v.string()),
    laborBurdenRate: v.optional(v.string()),
    estimatedDuration: v.optional(v.string()),
    earliestStart: v.optional(v.string()),
    materialLeadTime: v.optional(v.string()),
    submittalTurnaround: v.optional(v.string()),
    bidGoodFor: v.optional(v.string()),
    insuranceProgram: v.optional(v.union(v.literal("own"), v.literal("ccip"), v.literal("ocip"))),
    wrapUpNotes: v.optional(v.string()),
    additionalInsuredRequired: v.optional(v.boolean()),
    buildersRiskBy: v.optional(v.union(v.literal("owner"), v.literal("gc"), v.literal("included"))),
    bondRequired: v.optional(v.boolean()),
    bondTypes: v.optional(v.string()),
    bondAmount: v.optional(v.number()),
    bondAmountPct: v.optional(v.number()),
    bondAmountType: v.optional(v.string()),
    suretyCompany: v.optional(v.string()),
    suretyAgent: v.optional(v.string()),
    bondStatus: v.optional(v.string()),
    emr: v.optional(v.string()),
    mbeGoals: v.optional(v.boolean()),
    mbeGoalPct: v.optional(v.string()),
    mbeCertifications: v.optional(v.string()),
    certifiedPayrollRequired: v.optional(v.boolean()),
    safetyPlanRequired: v.optional(v.boolean()),
    backgroundChecksRequired: v.optional(v.boolean()),
    qualificationsNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, userId, ...fields } = args;
    await validateAuth(ctx, userId);
    await assertProjectOwnership(ctx, projectId);
    const existing = await ctx.db
      .query("bidshield_bid_quals")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updatedAt: now });
    } else {
      await ctx.db.insert("bidshield_bid_quals", { projectId, userId, ...fields, updatedAt: now });
    }
  },
});
