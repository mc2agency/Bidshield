import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== GC BID FORMS =====

export const saveGcBidForm = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    label: v.string(),
    items: v.array(v.object({
      questionText: v.string(),
      itemType: v.union(v.literal("fill-in"), v.literal("scope-item")),
      autoConfirmed: v.boolean(),
      confirmedValue: v.optional(v.string()),
      matchedField: v.optional(v.string()),
      foundInScope: v.optional(v.boolean()),
      foundInChecklist: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    const confirmedCount = args.items.filter(i => i.autoConfirmed).length;

    const documentId = await ctx.db.insert("bidshield_gcBidFormDocuments", {
      projectId: args.projectId,
      userId: args.userId,
      label: args.label,
      uploadedAt: now,
      processed: true,
      itemCount: args.items.length,
      confirmedCount,
    });

    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      await ctx.db.insert("bidshield_gcBidFormItems", {
        documentId,
        projectId: args.projectId,
        questionText: item.questionText,
        itemType: item.itemType,
        autoConfirmed: item.autoConfirmed,
        confirmedValue: item.confirmedValue,
        matchedField: item.matchedField,
        foundInScope: item.foundInScope,
        foundInChecklist: item.foundInChecklist,
        manuallyChecked: false,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
    }

    return documentId;
  },
});

export const reanalyzeGcBidForm = mutation({
  args: {
    documentId: v.id("bidshield_gcBidFormDocuments"),
    items: v.array(v.object({
      questionText: v.string(),
      itemType: v.union(v.literal("fill-in"), v.literal("scope-item")),
      autoConfirmed: v.boolean(),
      confirmedValue: v.optional(v.string()),
      matchedField: v.optional(v.string()),
      foundInScope: v.optional(v.boolean()),
      foundInChecklist: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    // Get projectId from the document
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    await assertRecordOwnership(ctx, doc, "GC bid form document");

    const now = Date.now();
    // Delete existing items
    const existing = await ctx.db
      .query("bidshield_gcBidFormItems")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const item of existing) await ctx.db.delete(item._id);

    const confirmedCount = args.items.filter(i => i.autoConfirmed).length;

    // Insert new items
    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      await ctx.db.insert("bidshield_gcBidFormItems", {
        documentId: args.documentId,
        projectId: doc.projectId,
        questionText: item.questionText,
        itemType: item.itemType,
        autoConfirmed: item.autoConfirmed,
        confirmedValue: item.confirmedValue,
        matchedField: item.matchedField,
        foundInScope: item.foundInScope,
        foundInChecklist: item.foundInChecklist,
        manuallyChecked: false,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update document counts
    await ctx.db.patch(args.documentId, {
      processed: true,
      itemCount: args.items.length,
      confirmedCount,
    });
  },
});

export const updateGcBidFormItem = mutation({
  args: {
    itemId: v.id("bidshield_gcBidFormItems"),
    manuallyChecked: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { itemId, ...updates } = args;
    const formItem = await ctx.db.get(itemId);
    if (!formItem) throw new Error("GC bid form item not found");
    // Ownership check via parent document (gcBidFormItems don't have userId directly)
    const parentDoc = await ctx.db.get(formItem.documentId);
    await assertRecordOwnership(ctx, parentDoc, "GC bid form document");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(itemId, { ...filtered, updatedAt: Date.now() });
  },
});

export const updateGcBidFormLabel = mutation({
  args: {
    documentId: v.id("bidshield_gcBidFormDocuments"),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    await assertRecordOwnership(ctx, doc, "GC bid form document");
    await ctx.db.patch(args.documentId, { label: args.label });
  },
});

export const deleteGcBidFormDocument = mutation({
  args: { documentId: v.id("bidshield_gcBidFormDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    await assertRecordOwnership(ctx, doc, "GC bid form document");
    const items = await ctx.db
      .query("bidshield_gcBidFormItems")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);
    await ctx.db.delete(args.documentId);
  },
});

export const getGcBidFormDocuments = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return [];
    const docs = await ctx.db
      .query("bidshield_gcBidFormDocuments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return docs.sort((a, b) => b.uploadedAt - a.uploadedAt);
  },
});

export const getGcBidFormItems = query({
  args: { documentId: v.id("bidshield_gcBidFormDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) return [];
    await assertProjectOwnership(ctx, doc.projectId);
    const items = await ctx.db
      .query("bidshield_gcBidFormItems")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getUnconfirmedGcBidFormCount = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const docs = await ctx.db
      .query("bidshield_gcBidFormDocuments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (docs.length === 0) return null; // no documents — no badge, no validator flag

    const allItems = await ctx.db
      .query("bidshield_gcBidFormItems")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return allItems.filter(i => !i.autoConfirmed && !i.manuallyChecked).length;
  },
});
