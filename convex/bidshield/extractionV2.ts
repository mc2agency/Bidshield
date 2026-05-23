import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getRun = query({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db.get(runId);
  },
});

export const listRunsForProject = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_assemblyExtractionRuns")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const getItemsForRun = query({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_assemblyExtractionItems")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect();
  },
});

export const createRun = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    sourceFileName: v.string(),
    sourceFileId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const runId = await ctx.db.insert("bidshield_assemblyExtractionRuns", {
      ...args,
      status: "processing",
      extractedCount: 0,
      needsReviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { runId };
  },
});

export const createItem = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    drawingAssemblyId: v.string(),
    displayName: v.optional(v.string()),
    sourceSheet: v.optional(v.string()),
    sourceDetail: v.optional(v.string()),
    originalExtractedText: v.array(v.string()),
    extractedLayers: v.array(v.string()),
    normalizedLayerTokens: v.array(v.string()),
    archetypeId: v.string(),
    archetypeVersion: v.number(),
    confidence: v.number(),
    needsReview: v.boolean(),
    classificationAudit: v.any(),
    sectionValues: v.any(),
    requiredSectionsSnapshot: v.array(v.string()),
    optionalSectionsSnapshot: v.array(v.string()),
    hiddenSectionsSnapshot: v.array(v.string()),
    defaultLayerOrderSnapshot: v.array(v.string()),
    legacySystemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const itemId = await ctx.db.insert("bidshield_assemblyExtractionItems", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    return { itemId };
  },
});

export const completeRun = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    extractedCount: v.number(),
    needsReviewCount: v.number(),
  },
  handler: async (ctx, { runId, extractedCount, needsReviewCount }) => {
    await ctx.db.patch(runId, {
      status: "complete",
      extractedCount,
      needsReviewCount,
      updatedAt: Date.now(),
    });
  },
});

export const failRun = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    errorMessage: v.string(),
  },
  handler: async (ctx, { runId, errorMessage }) => {
    await ctx.db.patch(runId, {
      status: "failed",
      errorMessage,
      updatedAt: Date.now(),
    });
  },
});

export const updateItemStatus = mutation({
  args: {
    itemId: v.id("bidshield_assemblyExtractionItems"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("draft")),
  },
  handler: async (ctx, { itemId, status }) => {
    await ctx.db.patch(itemId, { status, updatedAt: Date.now() });
  },
});

export const approveAllItems = mutation({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const items = await ctx.db
      .query("bidshield_assemblyExtractionItems")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect();
    const now = Date.now();
    let approved = 0;
    for (const item of items) {
      if (item.status === "draft") {
        await ctx.db.patch(item._id, { status: "approved", updatedAt: now });
        approved++;
      }
    }
    return { approved };
  },
});
