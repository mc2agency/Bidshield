import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== SCOPE ITEMS =====

export const getScopeItems = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const items = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const initScopeItems = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    items: v.array(v.object({
      category: v.string(),
      name: v.string(),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    // Check if items already exist
    const existing = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (existing.length > 0) return existing.sort((a, b) => a.sortOrder - b.sortOrder);

    const now = Date.now();
    const created = [];
    for (const item of args.items) {
      const id = await ctx.db.insert("bidshield_scope_items", {
        projectId: args.projectId,
        userId: args.userId,
        category: item.category,
        name: item.name,
        status: "unaddressed",
        isDefault: true,
        sortOrder: item.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ _id: id, ...item, status: "unaddressed", isDefault: true });
    }
    return created;
  },
});

export const updateScopeItem = mutation({
  args: {
    itemId: v.id("bidshield_scope_items"),
    status: v.optional(v.union(
      v.literal("unaddressed"),
      v.literal("included"),
      v.literal("excluded"),
      v.literal("by_others"),
      v.literal("na")
    )),
    cost: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const scopeItem = await ctx.db.get(args.itemId);
    await assertRecordOwnership(ctx, scopeItem, "scope item");
    const { itemId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(itemId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// E-07: Bulk status update for scope items (e.g., "mark all unaddressed as NA")
export const bulkUpdateScopeStatus = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    fromStatus: v.union(
      v.literal("unaddressed"),
      v.literal("included"),
      v.literal("excluded"),
      v.literal("by_others"),
      v.literal("na")
    ),
    toStatus: v.union(
      v.literal("unaddressed"),
      v.literal("included"),
      v.literal("excluded"),
      v.literal("by_others"),
      v.literal("na")
    ),
    category: v.optional(v.string()), // optional: only affect a specific category
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);

    const items = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const now = Date.now();
    let updated = 0;
    for (const item of items) {
      if (item.status !== args.fromStatus) continue;
      if (args.category && item.category !== args.category) continue;
      await ctx.db.patch(item._id, { status: args.toStatus, updatedAt: now });
      updated++;
    }
    return { updated };
  },
});

// ─── Scope Clarifications & Assumptions ──────────────────────────────────────

export const getScopeClarifications = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const rows = await ctx.db
      .query("bidshield_scope_clarifications")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const addScopeClarification = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db.insert("bidshield_scope_clarifications", {
      projectId: args.projectId,
      userId: args.userId,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

export const deleteScopeClarification = mutation({
  args: { id: v.id("bidshield_scope_clarifications") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    await assertRecordOwnership(ctx, record, "scope clarification");
    await ctx.db.delete(args.id);
  },
});

export const addCustomScopeItem = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    category: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const existing = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxSort = existing.length > 0
      ? Math.max(...existing.map((s) => s.sortOrder))
      : 0;
    const now = Date.now();
    return await ctx.db.insert("bidshield_scope_items", {
      projectId: args.projectId,
      userId: args.userId,
      category: args.category,
      name: args.name,
      status: "unaddressed",
      isDefault: false,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteScopeItem = mutation({
  args: { itemId: v.id("bidshield_scope_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return;
    await assertRecordOwnership(ctx, item, "scope item");
    // Only allow deleting custom items
    if (item.isDefault) return;
    await ctx.db.delete(args.itemId);
  },
});
