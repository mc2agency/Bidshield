import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { getChecklistForTrade } from "../bidshieldDefaults";
import { isDemoUser } from "../utils";
import { validateAuth, assertProjectOwnership } from "./_helpers";

export const getProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // P0-7: Verify caller is the user they claim to be
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
      if (identity.subject !== args.userId) throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return null;
    return project;
  },
});

export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    location: v.string(),
    bidDate: v.string(),
    trade: v.optional(v.string()),
    systemType: v.optional(v.string()),
    deckType: v.optional(v.string()),
    gc: v.optional(v.string()),
    sqft: v.optional(v.number()),
    grossRoofArea: v.optional(v.number()),
    totalBidAmount: v.optional(v.number()),
    assemblies: v.array(v.string()),
    roofAssemblies: v.optional(v.array(v.object({
      label: v.string(),
      name: v.optional(v.string()),
      systemType: v.string(),
      deckType: v.optional(v.string()),
      insulationType: v.optional(v.string()),
      insulationThickness: v.optional(v.string()),
      rValue: v.optional(v.number()),
      surfaceType: v.optional(v.string()),
      vaporRetarder: v.optional(v.boolean()),
      protectionBoard: v.optional(v.string()),
      drainageMat: v.optional(v.boolean()),
      coverBoard: v.optional(v.string()),
      aiDescription: v.optional(v.string()),
      enabled: v.optional(v.boolean()),
      area: v.optional(v.number()),
      uValue: v.optional(v.number()),
    }))),
    systemDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);

    // Enforce free tier: 1 active project max
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();
    const isPro = user?.membershipLevel === "bidshield" || user?.membershipLevel === "pro";
    if (!isPro) {
      const existing = await ctx.db
        .query("bidshield_projects")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      const active = existing.filter((p) => p.status !== "won" && p.status !== "lost" && p.status !== "no_bid");
      if (active.length >= 1) throw new Error("Free plan limit: upgrade to Pro for unlimited projects");
    }

    const now = Date.now();
    const trade = args.trade || "roofing";

    // Create the project
    const projectId = await ctx.db.insert("bidshield_projects", {
      userId: args.userId,
      name: args.name,
      location: args.location,
      bidDate: args.bidDate,
      status: "setup",
      trade,
      systemType: args.systemType,
      deckType: args.deckType,
      gc: args.gc,
      sqft: args.sqft,
      grossRoofArea: args.grossRoofArea ?? args.sqft,
      totalBidAmount: args.totalBidAmount,
      assemblies: args.assemblies,
      roofAssemblies: args.roofAssemblies,
      systemDescription: args.systemDescription,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize checklist items from trade-specific template
    // When roofAssemblies exist, union checklist items across all unique systems
    const systemTypes = args.roofAssemblies
      ? [...new Set(args.roofAssemblies.map(a => a.systemType))]
      : args.systemType ? [args.systemType] : [];
    const checklist = getChecklistForTrade(trade, systemTypes.length > 0 ? systemTypes : undefined, args.deckType);
    for (const [phaseKey, phase] of Object.entries(checklist)) {
      for (const item of phase.items) {
        await ctx.db.insert("bidshield_checklist_items", {
          projectId,
          userId: args.userId,
          phaseKey,
          itemId: item.id,
          status: "pending",
          updatedAt: now,
        });
      }
    }

    return projectId;
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    bidDate: v.optional(v.string()),
    bidTime: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("setup"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("no_award"),
      v.literal("no_bid")
    )),
    gc: v.optional(v.string()),
    owner: v.optional(v.string()),
    sqft: v.optional(v.number()),
    assemblies: v.optional(v.array(v.string())),
    grossRoofArea: v.optional(v.number()),
    deckType: v.optional(v.string()),
    notes: v.optional(v.string()),
    totalBidAmount: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    laborCost: v.optional(v.number()),
    otherCost: v.optional(v.number()),
    primaryAssembly: v.optional(v.string()),
    lossReason: v.optional(v.string()),
    lossReasonNote: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    actualCost: v.optional(v.number()),
    actualMaterialCost: v.optional(v.number()),
    actualLaborCost: v.optional(v.number()),
    actualOtherCost: v.optional(v.number()),
    postJobStatus: v.optional(v.string()),
    postJobNotes: v.optional(v.string()),
    fmGlobal: v.optional(v.boolean()),
    pre1990: v.optional(v.boolean()),
    competitorName: v.optional(v.string()),
    competitorPrice: v.optional(v.number()),
    energyCode: v.optional(v.boolean()),
    climateZone: v.optional(v.string()),
    roofAssemblies: v.optional(v.array(v.object({
      label: v.string(),
      name: v.optional(v.string()),
      systemType: v.string(),
      deckType: v.optional(v.string()),
      insulationType: v.optional(v.string()),
      insulationThickness: v.optional(v.string()),
      rValue: v.optional(v.number()),
      surfaceType: v.optional(v.string()),
      vaporRetarder: v.optional(v.boolean()),
      protectionBoard: v.optional(v.string()),
      drainageMat: v.optional(v.boolean()),
      coverBoard: v.optional(v.string()),
      aiDescription: v.optional(v.string()),
      enabled: v.optional(v.boolean()),
      area: v.optional(v.number()),
      uValue: v.optional(v.number()),
    }))),
    systemDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const { projectId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(projectId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);

    // P2: Collect all child records across every project-linked table, then batch-delete.
    const pid = args.projectId;
    const byProject = (q: any) => q.eq("projectId", pid);

    const [
      checklistItems, quotes, rfis, takeoffSections, takeoffLineItems,
      materials, scopeItems, addenda, bidQuals, scopeClarifications,
      laborTasks, gcBidFormDocs, gcBidFormItems, laborAnalysis,
      gcItems, submissions, prebidMeetings, alternates, decisions,
    ] = await Promise.all([
      ctx.db.query("bidshield_checklist_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_quotes").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_rfis").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_takeoff_sections").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_takeoff_line_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_project_materials").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_scope_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_addenda").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_bid_quals").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_scope_clarifications").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_laborTasks").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_gcBidFormDocuments").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_gcBidFormItems").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_laborAnalysis").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_gc_items").withIndex("by_project", byProject).collect(),
      // Note: bidshield_datasheets is user-level (no projectId), not deleted here
      ctx.db.query("bidshield_submissions").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_prebid_meetings").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_alternates").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_decisions").withIndex("by_project", byProject).collect(),
    ]);

    // Flatten all records and delete in parallel
    const allDocs = [
      ...checklistItems, ...quotes, ...rfis, ...takeoffSections, ...takeoffLineItems,
      ...materials, ...scopeItems, ...addenda, ...bidQuals, ...scopeClarifications,
      ...laborTasks, ...gcBidFormDocs, ...gcBidFormItems, ...laborAnalysis,
      ...gcItems, ...submissions, ...prebidMeetings, ...alternates, ...decisions,
    ];
    await Promise.all(allDocs.map((d) => ctx.db.delete(d._id)));

    // Delete the project itself
    await ctx.db.delete(args.projectId);
  },
});
