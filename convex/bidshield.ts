import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getChecklistForTrade } from "./bidshieldDefaults";

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
    trade: v.optional(v.string()),
    systemType: v.optional(v.string()),
    deckType: v.optional(v.string()),
    gc: v.optional(v.string()),
    sqft: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    assemblies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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
      estimatedValue: args.estimatedValue,
      assemblies: args.assemblies,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize checklist items from trade-specific template
    const checklist = getChecklistForTrade(trade, args.systemType, args.deckType);
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
      v.literal("no_bid")
    )),
    gc: v.optional(v.string()),
    owner: v.optional(v.string()),
    sqft: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    assemblies: v.optional(v.array(v.string())),
    grossRoofArea: v.optional(v.number()),
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

    // Delete all quotes linked to this project
    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const quote of quotes) {
      await ctx.db.delete(quote._id);
    }

    // Delete all RFIs
    const rfis = await ctx.db
      .query("bidshield_rfis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const rfi of rfis) {
      await ctx.db.delete(rfi._id);
    }

    // Delete all takeoff sections
    const sections = await ctx.db
      .query("bidshield_takeoff_sections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const section of sections) {
      await ctx.db.delete(section._id);
    }

    // Delete all takeoff line items
    const lineItems = await ctx.db
      .query("bidshield_takeoff_line_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const li of lineItems) {
      await ctx.db.delete(li._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});

// ===== CHECKLIST =====

export const getChecklist = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
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
    } else {
      // Upsert: create item if it doesn't exist (e.g. new phases added after project creation)
      const project = await ctx.db.get(args.projectId);
      if (project) {
        await ctx.db.insert("bidshield_checklist_items", {
          projectId: args.projectId,
          userId: project.userId,
          phaseKey: args.phaseKey,
          itemId: args.itemId,
          status: args.status,
          notes: args.notes,
          updatedAt: Date.now(),
        });
      }
    }

    // Update project status if needed
    const doneCount = items.filter((i) => {
      if (i.phaseKey === args.phaseKey && i.itemId === args.itemId) {
        return args.status === "done" || args.status === "na";
      }
      return i.status === "done" || i.status === "na";
    }).length;
    // Include the current item if it was just created (upsert case)
    const totalDone = !item && (args.status === "done" || args.status === "na")
      ? doneCount + 1
      : doneCount;

    const project = item ? await ctx.db.get(args.projectId) : await ctx.db.get(args.projectId);
    if (project && project.status === "setup" && totalDone > 0) {
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
    vendorPhone: v.optional(v.string()),
    category: v.string(),
    products: v.array(v.string()),
    quoteAmount: v.optional(v.number()),
    quoteDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bidshield_quotes", {
      userId: args.userId,
      projectId: args.projectId,
      vendorName: args.vendorName,
      vendorEmail: args.vendorEmail,
      vendorPhone: args.vendorPhone,
      category: args.category,
      products: args.products,
      quoteAmount: args.quoteAmount,
      quoteDate: args.quoteDate,
      expirationDate: args.expirationDate,
      notes: args.notes,
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

    const expiringQuotes = quotes.filter((q) => {
      if (q.status === "expiring") return true;
      if (!q.expirationDate) return false;
      const expDate = new Date(q.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
    });

    const pipelineValue = activeProjects.reduce(
      (sum, p) => sum + (p.estimatedValue || 0),
      0
    );

    // Win/Loss stats
    const wonProjects = projects.filter((p) => p.status === "won");
    const lostProjects = projects.filter((p) => p.status === "lost");
    const decidedProjects = wonProjects.length + lostProjects.length;
    const winRate = decidedProjects > 0 ? Math.round((wonProjects.length / decidedProjects) * 100) : 0;
    const wonValue = wonProjects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);

    // Count open RFIs across all projects
    let openRFIs = 0;
    for (const project of activeProjects) {
      const rfis = await ctx.db
        .query("bidshield_rfis")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      openRFIs += rfis.filter((r) => r.status === "sent").length;
    }

    const projectsWithPricing = projects.filter(
      (p) => p.totalBidAmount && p.sqft && p.sqft > 0
    );
    const avgDollarPerSf =
      projectsWithPricing.length > 0
        ? projectsWithPricing.reduce(
            (sum, p) => sum + p.totalBidAmount! / p.sqft!,
            0
          ) / projectsWithPricing.length
        : 0;

    return {
      activeProjects: activeProjects.length,
      expiringQuotes: expiringQuotes.length,
      openRFIs,
      pipelineValue,
      wonProjects: wonProjects.length,
      lostProjects: lostProjects.length,
      winRate,
      wonValue,
      avgDollarPerSf,
    };
  },
});

// ===== BID COMPARISON DATA =====

export const getComparisonData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Aggregate $/SF stats by assembly type
    const assemblyStats: Record<
      string,
      { totalDollarPerSf: number; count: number; won: number; lost: number }
    > = {};
    for (const p of projects) {
      const assembly = p.primaryAssembly || "Other";
      if (!assemblyStats[assembly]) {
        assemblyStats[assembly] = { totalDollarPerSf: 0, count: 0, won: 0, lost: 0 };
      }
      if (p.totalBidAmount && p.sqft && p.sqft > 0) {
        assemblyStats[assembly].totalDollarPerSf += p.totalBidAmount / p.sqft;
        assemblyStats[assembly].count += 1;
      }
      if (p.status === "won") assemblyStats[assembly].won += 1;
      if (p.status === "lost") assemblyStats[assembly].lost += 1;
    }

    // Win rate by GC
    const gcStats: Record<string, { won: number; lost: number; total: number }> = {};
    for (const p of projects) {
      if (p.gc && (p.status === "won" || p.status === "lost")) {
        if (!gcStats[p.gc]) gcStats[p.gc] = { won: 0, lost: 0, total: 0 };
        gcStats[p.gc].total += 1;
        if (p.status === "won") gcStats[p.gc].won += 1;
        if (p.status === "lost") gcStats[p.gc].lost += 1;
      }
    }

    // Loss reason tallies
    const lossReasons: Record<string, number> = {};
    for (const p of projects) {
      if (p.status === "lost" && p.lossReason) {
        lossReasons[p.lossReason] = (lossReasons[p.lossReason] || 0) + 1;
      }
    }

    return { projects, assemblyStats, gcStats, lossReasons };
  },
});

// ===== LABOR RATES =====

export const getLaborRates = query({
  args: { userId: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("bidshield_labor_rates")
        .withIndex("by_category", (q) => q.eq("userId", args.userId).eq("category", args.category!))
        .collect();
    }
    return await ctx.db
      .query("bidshield_labor_rates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createLaborRate = mutation({
  args: {
    userId: v.string(),
    category: v.string(),
    task: v.string(),
    rate: v.string(),
    unit: v.string(),
    crew: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bidshield_labor_rates", {
      userId: args.userId,
      category: args.category,
      task: args.task,
      rate: args.rate,
      unit: args.unit,
      crew: args.crew,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateLaborRate = mutation({
  args: {
    rateId: v.id("bidshield_labor_rates"),
    task: v.optional(v.string()),
    rate: v.optional(v.string()),
    unit: v.optional(v.string()),
    crew: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { rateId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(rateId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteLaborRate = mutation({
  args: { rateId: v.id("bidshield_labor_rates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.rateId);
  },
});

// ===== ADDENDA =====

export const getAddenda = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bidshield_addenda")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const createAddendum = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    number: v.number(),
    title: v.string(),
    receivedDate: v.string(),
    affectsScope: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bidshield_addenda", {
      projectId: args.projectId,
      userId: args.userId,
      number: args.number,
      title: args.title,
      receivedDate: args.receivedDate,
      affectsScope: args.affectsScope,
      acknowledged: false,
      incorporated: false,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAddendum = mutation({
  args: {
    addendumId: v.id("bidshield_addenda"),
    title: v.optional(v.string()),
    affectsScope: v.optional(v.boolean()),
    acknowledged: v.optional(v.boolean()),
    incorporated: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { addendumId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(addendumId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteAddendum = mutation({
  args: { addendumId: v.id("bidshield_addenda") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.addendumId);
  },
});

// ===== TAKEOFF SECTIONS =====

export const getTakeoffSections = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
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
    await ctx.db.delete(args.itemId);
  },
});

// ===== CHECKLIST PROGRESS (helper) =====

export const getChecklistProgress = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (items.length === 0) return 0;
    const doneCount = items.filter((i) => i.status === "done" || i.status === "na").length;
    return Math.round((doneCount / items.length) * 100);
  },
});
