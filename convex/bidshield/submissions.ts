import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership } from "./_helpers";
import { getChecklistForTrade } from "../bidshieldDefaults";

// ===== SUBMISSIONS =====

export const getSubmissions = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_submissions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const addSubmission = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    method: v.union(
      v.literal("email"), v.literal("portal"), v.literal("hand_delivered"),
      v.literal("mail"), v.literal("fax"), v.literal("other")
    ),
    portalOrRecipient: v.optional(v.string()),
    confirmationNumber: v.optional(v.string()),
    submittedAt: v.number(),
    notes: v.optional(v.string()),
    bidScore: v.optional(v.number()), // client passes current bid score for server-side enforcement
    bypassThreshold: v.optional(v.boolean()), // estimator acknowledged low score
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);

    // E-26: Submission threshold gate
    // Default minimum score: 70 (out of 100). Estimator can bypass with acknowledgment.
    const MIN_SUBMISSION_SCORE = 70;
    if (args.bidScore !== undefined && args.bidScore < MIN_SUBMISSION_SCORE && !args.bypassThreshold) {
      throw new Error(
        `Bid score is ${args.bidScore}/100 (minimum ${MIN_SUBMISSION_SCORE} required). ` +
        `Complete more checklist items before submitting, or acknowledge the low score to proceed.`
      );
    }

    // E-27: Component reconciliation — check that project has materials and scope
    const project = await ctx.db.get(args.projectId);
    const materials = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const scopeItems = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const warnings: string[] = [];
    if (materials.length === 0) warnings.push("No materials added to this project.");
    if (scopeItems.length === 0) warnings.push("No scope items defined.");
    const includedScope = scopeItems.filter((s: any) => s.status === "included");
    if (scopeItems.length > 0 && includedScope.length === 0) warnings.push("No scope items marked as included.");

    // E-04: Critical-phase enforcement — block submission if critical checklist phases are incomplete
    if (project) {
      const checklistItems = await ctx.db
        .query("bidshield_checklist_items")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();

      // Get phase definitions to know which phases are critical
      const phaseDefs = getChecklistForTrade(
        project.trade || "roofing",
        project.systemType,
        project.deckType,
        project.fmGlobal,
        project.pre1990,
        project.energyCode
      );

      // Group checklist items by phase and check critical phases
      const itemsByPhase: Record<string, Array<{ status: string }>> = {};
      for (const item of checklistItems) {
        if (!itemsByPhase[item.phaseKey]) itemsByPhase[item.phaseKey] = [];
        itemsByPhase[item.phaseKey].push(item);
      }

      const incompleteCritical: string[] = [];
      for (const [phaseKey, phaseDef] of Object.entries(phaseDefs)) {
        if (!phaseDef.critical) continue;
        const phaseItems = itemsByPhase[phaseKey] || [];
        if (phaseItems.length === 0) continue; // phase has no tracked items yet
        const incomplete = phaseItems.filter(
          (i) => i.status !== "done" && i.status !== "na"
        );
        if (incomplete.length > 0) {
          incompleteCritical.push(
            `${phaseDef.title}: ${incomplete.length} item${incomplete.length !== 1 ? "s" : ""} incomplete`
          );
        }
      }

      if (incompleteCritical.length > 0 && !args.bypassThreshold) {
        warnings.push(
          `Critical phases incomplete: ${incompleteCritical.join("; ")}.`
        );
      }
    }

    // If there are blocking warnings and estimator hasn't bypassed, throw
    if (warnings.length > 0 && !args.bypassThreshold) {
      throw new Error(`Cannot submit: ${warnings.join(" ")}`);
    }

    const now = Date.now();
    return await ctx.db.insert("bidshield_submissions", {
      projectId: args.projectId,
      userId: args.userId,
      method: args.method,
      portalOrRecipient: args.portalOrRecipient,
      confirmationNumber: args.confirmationNumber,
      submittedAt: args.submittedAt,
      notes: args.notes,
      bidScore: args.bidScore,
      thresholdBypassed: args.bypassThreshold || false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteSubmission = mutation({
  args: { submissionId: v.id("bidshield_submissions"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const doc = await ctx.db.get(args.submissionId);
    if (!doc || doc.userId !== args.userId) throw new Error("Not found");
    await ctx.db.delete(args.submissionId);
  },
});
