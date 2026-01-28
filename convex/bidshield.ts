import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { masterChecklist } from "./bidshield-defaults";

// ===== PROJECTS =====

export const getProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
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
    return await ctx.db.get(args.projectId);
  },
});

export const createProject = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    location: v.string(),
    bidDate: v.string(),
    gc: v.optional(v.string()),
    sqft: v.optional(v.number()),
    assemblies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the project
    const projectId = await ctx.db.insert("bidshield_projects", {
      userId: args.userId,
      name: args.name,
      location: args.location,
      bidDate: args.bidDate,
      status: "setup",
      gc: args.gc,
      sqft: args.sqft,
      assemblies: args.assemblies,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize checklist items from master template
    for (const [phaseKey, phase] of Object.entries(masterChecklist)) {
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
      v.literal("no_bid")
    )),
    gc: v.optional(v.string()),
    owner: v.optional(v.string()),
    sqft: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    assemblies: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    // Delete all checklist items
    const items = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete all RFIs
    const rfis = await ctx.db
      .query("bidshield_rfis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const rfi of rfis) {
      await ctx.db.delete(rfi._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});

// ===== CHECKLIST =====

export const getChecklist = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Group by phase
    const byPhase: Record<string, typeof items> = {};
    for (const item of items) {
      if (!byPhase[item.phaseKey]) {
        byPhase[item.phaseKey] = [];
      }
      byPhase[item.phaseKey].push(item);
    }

    return byPhase;
  },
});

export const updateChecklistItem = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    phaseKey: v.string(),
    itemId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("done"),
      v.literal("rfi"),
      v.literal("na"),
      v.literal("warning")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const item = items.find(
      (i) => i.phaseKey === args.phaseKey && i.itemId === args.itemId
    );

    if (item) {
      await ctx.db.patch(item._id, {
        status: args.status,
        notes: args.notes,
        updatedAt: Date.now(),
      });
    }

    // Update project status if needed
    const allItems = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const doneCount = allItems.filter((i) => i.status === "done" || i.status === "na").length;
    const progress = Math.round((doneCount / allItems.length) * 100);

    const project = await ctx.db.get(args.projectId);
    if (project && project.status === "setup" && progress > 0) {
      await ctx.db.patch(args.projectId, {
        status: "in_progress",
        updatedAt: Date.now(),
      });
    }
  },
});

// ===== QUOTES =====

export const getQuotes = query({
  args: { userId: v.string(), projectId: v.optional(v.id("bidshield_projects")) },
  handler: async (ctx, args) => {
    if (args.projectId) {
      return await ctx.db
        .query("bidshield_quotes")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }
    return await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createQuote = mutation({
  args: {
    userId: v.string(),
    projectId: v.optional(v.id("bidshield_projects")),
    vendorName: v.string(),
    vendorEmail: v.optional(v.string()),
    category: v.string(),
    products: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bidshield_quotes", {
      userId: args.userId,
      projectId: args.projectId,
      vendorName: args.vendorName,
      vendorEmail: args.vendorEmail,
      category: args.category,
      products: args.products,
      status: "none",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateQuote = mutation({
  args: {
    quoteId: v.id("bidshield_quotes"),
    vendorName: v.optional(v.string()),
    vendorEmail: v.optional(v.string()),
    vendorPhone: v.optional(v.string()),
    quoteAmount: v.optional(v.number()),
    quoteDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("none"),
      v.literal("requested"),
      v.literal("received"),
      v.literal("valid"),
      v.literal("expiring"),
      v.literal("expired")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { quoteId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    await ctx.db.patch(quoteId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// ===== RFIs =====

export const getRFIs = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
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
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("answered"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
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

// ===== STATS =====

export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeProjects = projects.filter(
      (p) => p.status === "setup" || p.status === "in_progress"
    );

    const expiringQuotes = quotes.filter((q) => q.status === "expiring");
    
    const pipelineValue = activeProjects.reduce(
      (sum, p) => sum + (p.estimatedValue || 0),
      0
    );

    // Count open RFIs across all projects
    let openRFIs = 0;
    for (const project of activeProjects) {
      const rfis = await ctx.db
        .query("bidshield_rfis")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      openRFIs += rfis.filter((r) => r.status === "sent").length;
    }

    return {
      activeProjects: activeProjects.length,
      expiringQuotes: expiringQuotes.length,
      openRFIs,
      pipelineValue,
    };
  },
});
