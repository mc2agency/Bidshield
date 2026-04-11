import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== TAKEOFF SECTIONS =====

export const getTakeoffSections = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const sections = await ctx.db
      .query("bidshield_takeoff_sections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return sections.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createTakeoffSection = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    name: v.string(),
    assemblyType: v.string(),
    squareFeet: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const existing = await ctx.db
      .query("bidshield_takeoff_sections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxSort = existing.length > 0
      ? Math.max(...existing.map((s) => s.sortOrder))
      : -1;
    const now = Date.now();
    return await ctx.db.insert("bidshield_takeoff_sections", {
      projectId: args.projectId,
      userId: args.userId,
      name: args.name,
      assemblyType: args.assemblyType,
      squareFeet: args.squareFeet,
      completed: false,
      notes: args.notes,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTakeoffSection = mutation({
  args: {
    sectionId: v.id("bidshield_takeoff_sections"),
    name: v.optional(v.string()),
    assemblyType: v.optional(v.string()),
    squareFeet: v.optional(v.number()),
    completed: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    await assertRecordOwnership(ctx, section, "takeoff section");
    const { sectionId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(sectionId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTakeoffSection = mutation({
  args: { sectionId: v.id("bidshield_takeoff_sections") },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    await assertRecordOwnership(ctx, section, "takeoff section");
    await ctx.db.delete(args.sectionId);
  },
});

// ===== TAKEOFF LINE ITEMS (Linear + Count) =====

const DEFAULT_LINEAR_ITEMS = [
  { itemType: "parapet_wall", label: "Parapet Wall" },
  { itemType: "coping", label: "Coping" },
  { itemType: "edge_metal", label: "Edge Metal / Drip Edge" },
  { itemType: "counterflashing", label: "Counterflashing" },
  { itemType: "expansion_joint", label: "Expansion Joint" },
  { itemType: "area_divider", label: "Area Divider" },
  { itemType: "gutter", label: "Gutter" },
  { itemType: "gravel_stop", label: "Gravel Stop" },
  { itemType: "reglet", label: "Reglet" },
  { itemType: "base_flashing", label: "Base Flashing" },
];

const DEFAULT_COUNT_ITEMS = [
  { itemType: "pipe_penetration", label: "Pipe Penetrations" },
  { itemType: "roof_drain", label: "Roof Drains" },
  { itemType: "overflow_drain", label: "Overflow Drains" },
  { itemType: "scupper", label: "Scuppers" },
  { itemType: "rtu_curb", label: "RTU / Equipment Curbs" },
  { itemType: "skylight", label: "Skylights" },
  { itemType: "exhaust_fan", label: "Exhaust Fan Curbs" },
  { itemType: "pitch_pan", label: "Pitch Pans" },
  { itemType: "hatch", label: "Roof Hatches" },
  { itemType: "vent", label: "Vents / Stacks" },
  { itemType: "lightning_protection", label: "Lightning Protection Points" },
];

export const getTakeoffLineItems = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const items = await ctx.db
      .query("bidshield_takeoff_line_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const initTakeoffLineItems = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    // Check if items already exist
    const existing = await ctx.db
      .query("bidshield_takeoff_line_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (existing.length > 0) return existing.sort((a, b) => a.sortOrder - b.sortOrder);

    const now = Date.now();
    const created = [];
    let sortOrder = 0;

    for (const item of DEFAULT_LINEAR_ITEMS) {
      const id = await ctx.db.insert("bidshield_takeoff_line_items", {
        projectId: args.projectId,
        userId: args.userId,
        category: "linear",
        itemType: item.itemType,
        label: item.label,
        unit: "LF",
        verified: false,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ _id: id, ...item, category: "linear" as const, unit: "LF", verified: false, sortOrder, createdAt: now, updatedAt: now });
      sortOrder++;
    }

    for (const item of DEFAULT_COUNT_ITEMS) {
      const id = await ctx.db.insert("bidshield_takeoff_line_items", {
        projectId: args.projectId,
        userId: args.userId,
        category: "count",
        itemType: item.itemType,
        label: item.label,
        unit: "EA",
        verified: false,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ _id: id, ...item, category: "count" as const, unit: "EA", verified: false, sortOrder, createdAt: now, updatedAt: now });
      sortOrder++;
    }

    return created;
  },
});

export const updateTakeoffLineItem = mutation({
  args: {
    itemId: v.id("bidshield_takeoff_line_items"),
    quantity: v.optional(v.number()),
    verified: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    await assertRecordOwnership(ctx, item, "takeoff line item");
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

export const createTakeoffLineItem = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    category: v.union(v.literal("linear"), v.literal("count")),
    label: v.string(),
    quantity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const existing = await ctx.db
      .query("bidshield_takeoff_line_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const sameCat = existing.filter((i) => i.category === args.category);
    const maxSort = sameCat.length > 0
      ? Math.max(...sameCat.map((s) => s.sortOrder))
      : (args.category === "linear" ? -1 : DEFAULT_LINEAR_ITEMS.length - 1);
    const now = Date.now();
    return await ctx.db.insert("bidshield_takeoff_line_items", {
      projectId: args.projectId,
      userId: args.userId,
      category: args.category,
      itemType: "custom",
      label: args.label,
      quantity: args.quantity,
      unit: args.category === "linear" ? "LF" : "EA",
      verified: false,
      notes: args.notes,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteTakeoffLineItem = mutation({
  args: { itemId: v.id("bidshield_takeoff_line_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    await assertRecordOwnership(ctx, item, "takeoff line item");
    await ctx.db.delete(args.itemId);
  },
});
