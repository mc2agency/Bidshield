import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== GENERAL CONDITIONS =====

export const getGCItems = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    await assertProjectOwnership(ctx, projectId);
    return await ctx.db
      .query("bidshield_gc_items")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const seedGCItems = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, { projectId, userId }) => {
    await validateAuth(ctx, userId);
    await assertProjectOwnership(ctx, projectId);
    // Only seed if no items exist
    const existing = await ctx.db
      .query("bidshield_gc_items")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
    if (existing) return;

    const defaults = [
      // Bidding & Preconstruction
      { category: "bidding", description: "Bid bond premium", sortOrder: 1 },
      { category: "bidding", description: "Estimating / bid preparation time", sortOrder: 2 },
      { category: "bidding", description: "Pre-bid meeting attendance", sortOrder: 3 },

      // Site Setup & Logistics
      { category: "site", description: "Dumpster / debris disposal", sortOrder: 10 },
      { category: "site", description: "Crane / hoist rental", sortOrder: 11 },
      { category: "site", description: "Temporary weather protection", sortOrder: 12 },
      { category: "site", description: "Mobilization / demobilization", sortOrder: 13 },
      { category: "site", description: "Daily cleanup", sortOrder: 14 },

      // Safety & Compliance
      { category: "safety", description: "OSHA fall protection (guardrails, anchors)", sortOrder: 20 },
      { category: "safety", description: "Safety netting / debris containment", sortOrder: 21 },
      { category: "safety", description: "Fire watch", sortOrder: 22 },
      { category: "safety", description: "Hot work permits", sortOrder: 23 },

      // Supervision & Management
      { category: "supervision", description: "Project manager time", sortOrder: 30 },
      { category: "supervision", description: "Superintendent / foreman premium", sortOrder: 31 },
      { category: "supervision", description: "Submittals / shop drawings", sortOrder: 32 },
      { category: "supervision", description: "Owner / GC-required meetings", sortOrder: 33 },
      { category: "supervision", description: "Testing (flood test, core cuts)", sortOrder: 34 },

      // Insurance, Bonding & Fees
      { category: "insurance", description: "Permits", sortOrder: 40 },
      { category: "insurance", description: "Performance / payment bond", sortOrder: 41 },
      { category: "insurance", description: "Additional insured endorsement", sortOrder: 42 },
      { category: "insurance", description: "Builder's risk (if required)", sortOrder: 43 },
      { category: "insurance", description: "CCIP / OCIP enrollment fee", sortOrder: 44 },

      // Markups
      { category: "markup", description: "Overhead", isMarkup: true, markupPct: 10, sortOrder: 50 },
      { category: "markup", description: "Profit", isMarkup: true, markupPct: 8, sortOrder: 51 },
      { category: "markup", description: "Contingency", isMarkup: true, markupPct: 3, sortOrder: 52 },
    ];

    const now = Date.now();
    for (const item of defaults) {
      await ctx.db.insert("bidshield_gc_items", {
        projectId,
        userId,
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const upsertGCItem = mutation({
  args: {
    id: v.optional(v.id("bidshield_gc_items")),
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    category: v.string(),
    description: v.string(),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    unitCost: v.optional(v.number()),
    total: v.optional(v.number()),
    notes: v.optional(v.string()),
    isMarkup: v.optional(v.boolean()),
    markupPct: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await validateAuth(ctx, fields.userId);
    await assertProjectOwnership(ctx, fields.projectId);
    const now = Date.now();
    if (id) {
      await ctx.db.patch(id, { ...fields, updatedAt: now });
      return id;
    } else {
      return await ctx.db.insert("bidshield_gc_items", { ...fields, createdAt: now, updatedAt: now });
    }
  },
});

export const deleteGCItem = mutation({
  args: { id: v.id("bidshield_gc_items") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    await assertRecordOwnership(ctx, item, "GC item");
    await ctx.db.delete(id);
  },
});
