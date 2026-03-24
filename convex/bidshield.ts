import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getChecklistForTrade } from "./bidshieldDefaults";
import { isDemoUser } from "./utils";

async function validateAuth(ctx: any, userId: string) {
  if (isDemoUser(userId)) return; // demo mode bypasses auth
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
}

async function requirePro(ctx: any, userId: string) {
  if (isDemoUser(userId)) return; // demo always allowed
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userId))
    .first();
  const isPro = user?.membershipLevel === "bidshield" || user?.membershipLevel === "pro";
  if (!isPro) throw new Error("Pro subscription required");
}

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
    estimatedValue: v.optional(v.number()),
    assemblies: v.array(v.string()),
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
      v.literal("no_award"),
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
    actualOtherCost: v.optional(v.number()),
    postJobStatus: v.optional(v.string()),
    postJobNotes: v.optional(v.string()),
    fmGlobal: v.optional(v.boolean()),
    pre1990: v.optional(v.boolean()),
    competitorName: v.optional(v.string()),
    competitorPrice: v.optional(v.number()),
    energyCode: v.optional(v.boolean()),
    climateZone: v.optional(v.string()),
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

    // Delete all project materials
    const materials = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const mat of materials) {
      await ctx.db.delete(mat._id);
    }

    // Delete all scope items
    const scopeItems = await ctx.db
      .query("bidshield_scope_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const si of scopeItems) {
      await ctx.db.delete(si._id);
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

// Helper: parse compact line item JSON {m, u, p, n} stored in products array
function parseLineItems(products: string[]): Array<{ m: string; u: string; p: number; n: string }> {
  return products.flatMap((s) => {
    try {
      const item = JSON.parse(s);
      if (item && typeof item.m === "string" && typeof item.p === "number") return [item];
      return [];
    } catch {
      return [];
    }
  });
}

// Helper: upsert quote line items into the datasheets price library
async function upsertLineItemsToDatasheets(
  ctx: MutationCtx,
  opts: {
    userId: string;
    quoteId: Id<"bidshield_quotes">;
    vendorName: string;
    category: string;
    quoteDate: string | undefined;
    sourcePdf: string | undefined;
    isExtracted: boolean | undefined;
    products: string[];
  }
) {
  const lineItems = parseLineItems(opts.products);
  if (lineItems.length === 0) return;

  // Load all existing datasheets for this user to do fuzzy matching
  const existing = await ctx.db
    .query("bidshield_datasheets")
    .withIndex("by_user", (q) => q.eq("userId", opts.userId))
    .collect();

  const now = Date.now();

  for (const item of lineItems) {
    if (!item.m || !item.u || item.p <= 0) continue;
    const productNameNorm = item.m.toLowerCase().trim();
    const vendorNorm = opts.vendorName.toLowerCase().trim();

    // Find existing entry matching vendor + product name (case-insensitive)
    const match = existing.find(
      (d) =>
        d.productName.toLowerCase().trim() === productNameNorm &&
        (d.vendorName ?? "").toLowerCase().trim() === vendorNorm
    );

    if (match) {
      await ctx.db.patch(match._id, {
        unitPrice: item.p,
        unit: item.u,
        quoteDate: opts.quoteDate,
        quoteId: opts.quoteId,
        isExtracted: opts.isExtracted,
        sourcePdf: opts.sourcePdf,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("bidshield_datasheets", {
        userId: opts.userId,
        productName: item.m,
        category: opts.category,
        unit: item.u,
        unitPrice: item.p,
        vendorName: opts.vendorName,
        quoteDate: opts.quoteDate,
        sourcePdf: opts.sourcePdf,
        isExtracted: opts.isExtracted,
        quoteId: opts.quoteId,
        notes: item.n || undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

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
    sourcePdf: v.optional(v.string()),
    isExtracted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const now = Date.now();
    const quoteId = await ctx.db.insert("bidshield_quotes", {
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
      sourcePdf: args.sourcePdf,
      isExtracted: args.isExtracted,
      status: "none",
      createdAt: now,
      updatedAt: now,
    });

    // Auto-populate Price Library from line items
    await upsertLineItemsToDatasheets(ctx, {
      userId: args.userId,
      quoteId,
      vendorName: args.vendorName,
      category: args.category,
      quoteDate: args.quoteDate,
      sourcePdf: args.sourcePdf,
      isExtracted: args.isExtracted,
      products: args.products,
    });

    return quoteId;
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

export const deleteQuote = mutation({
  args: { quoteId: v.id("bidshield_quotes"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new Error("Quote not found");
    await ctx.db.delete(args.quoteId);
  },
});

// Returns all quotes for a user with project name resolved
export const getQuotesWithProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projectMap = new Map(projects.map((p) => [p._id as string, p.name]));

    return quotes.map((q) => ({
      ...q,
      projectName: q.projectId ? (projectMap.get(q.projectId) ?? "Unknown Project") : null,
    }));
  },
});

// Copies a quote from the library into a project (linked via globalQuoteId)
export const importQuoteToProject = mutation({
  args: {
    userId: v.string(),
    quoteId: v.id("bidshield_quotes"),
    projectId: v.id("bidshield_projects"),
  },
  handler: async (ctx, { userId, quoteId, projectId }) => {
    await validateAuth(ctx, userId);
    const source = await ctx.db.get(quoteId);
    if (!source) throw new Error("Quote not found");
    const now = Date.now();
    return await ctx.db.insert("bidshield_quotes", {
      userId,
      projectId,
      globalQuoteId: quoteId,
      vendorName: source.vendorName,
      vendorEmail: source.vendorEmail,
      vendorPhone: source.vendorPhone,
      category: source.category,
      products: source.products,
      quoteAmount: source.quoteAmount,
      quoteDate: source.quoteDate,
      expirationDate: source.expirationDate,
      notes: source.notes,
      sourcePdf: source.sourcePdf,
      isExtracted: source.isExtracted,
      status: "received",
      createdAt: now,
      updatedAt: now,
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
    await validateAuth(ctx, args.userId);
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

export const deleteRFI = mutation({
  args: { rfiId: v.id("bidshield_rfis"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const rfi = await ctx.db.get(args.rfiId);
    if (!rfi) throw new Error("RFI not found");
    await ctx.db.delete(args.rfiId);
  },
});

// ===== STATS =====

export const getStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requirePro(ctx, args.userId);
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
      (p) => p.totalBidAmount && (p.grossRoofArea || p.sqft) && (p.grossRoofArea || p.sqft)! > 0
    );
    const avgDollarPerSf =
      projectsWithPricing.length > 0
        ? projectsWithPricing.reduce(
            (sum, p) => sum + p.totalBidAmount! / (p.grossRoofArea || p.sqft)!,
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
    await requirePro(ctx, args.userId);
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
      const pSf = p.grossRoofArea || p.sqft;
      if (p.totalBidAmount && pSf && pSf > 0) {
        assemblyStats[assembly].totalDollarPerSf += p.totalBidAmount / pSf;
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

    // Win rate by system type
    const systemStats: Record<string, { won: number; lost: number; total: number }> = {};
    for (const p of projects) {
      const sys = p.systemType || "other";
      if (p.status === "won" || p.status === "lost") {
        if (!systemStats[sys]) systemStats[sys] = { won: 0, lost: 0, total: 0 };
        systemStats[sys].total += 1;
        if (p.status === "won") systemStats[sys].won += 1;
        if (p.status === "lost") systemStats[sys].lost += 1;
      }
    }

    // Win rate by project size
    const sizeStats = { small: { won: 0, lost: 0 }, medium: { won: 0, lost: 0 }, large: { won: 0, lost: 0 } };
    for (const p of projects) {
      if (p.status !== "won" && p.status !== "lost") continue;
      const sf = p.grossRoofArea || p.sqft || 0;
      const bucket = sf < 5000 ? "small" : sf <= 25000 ? "medium" : "large";
      if (p.status === "won") sizeStats[bucket].won += 1;
      if (p.status === "lost") sizeStats[bucket].lost += 1;
    }

    // Competitor intelligence
    const competitorData: { name: string; count: number; avgPrice: number; avgDpsf: number }[] = [];
    const compMap: Record<string, { count: number; totalPrice: number; totalDpsf: number }> = {};
    for (const p of projects) {
      if (p.status === "lost" && p.competitorName) {
        const n = p.competitorName;
        if (!compMap[n]) compMap[n] = { count: 0, totalPrice: 0, totalDpsf: 0 };
        compMap[n].count += 1;
        if (p.competitorPrice) compMap[n].totalPrice += p.competitorPrice;
        const cSf = p.grossRoofArea || p.sqft;
        if (p.competitorPrice && cSf && cSf > 0) compMap[n].totalDpsf += p.competitorPrice / cSf;
      }
    }
    for (const [name, d] of Object.entries(compMap)) {
      competitorData.push({ name, count: d.count, avgPrice: d.count > 0 ? d.totalPrice / d.count : 0, avgDpsf: d.count > 0 ? d.totalDpsf / d.count : 0 });
    }
    competitorData.sort((a, b) => b.count - a.count);

    return { projects, assemblyStats, gcStats, lossReasons, systemStats, sizeStats, competitorData };
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
    await validateAuth(ctx, args.userId);
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
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_addenda", {
      projectId: args.projectId,
      userId: args.userId,
      number: args.number,
      title: args.title,
      receivedDate: args.receivedDate,
      affectsScope: undefined,
      acknowledged: false,
      incorporated: false,
      priority: args.priority || "normal",
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
    scopeImpact: v.optional(v.string()),
    repriced: v.optional(v.boolean()),
    repricedDate: v.optional(v.string()),
    priceImpact: v.optional(v.number()),
    impactCategories: v.optional(v.string()),
    priority: v.optional(v.string()),
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
    await validateAuth(ctx, args.userId);
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
    await validateAuth(ctx, args.userId);
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

// ===== PROJECT MATERIALS =====

export const getProjectMaterials = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return [];
    const items = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const addProjectMaterial = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    templateKey: v.optional(v.string()),
    category: v.string(),
    name: v.string(),
    unit: v.string(),
    calcType: v.string(),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    wasteFactor: v.number(),
    coverage: v.optional(v.number()),
    qtyPerSf: v.optional(v.number()),
    takeoffItemType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const maxSort = existing.length > 0
      ? Math.max(...existing.map((s) => s.sortOrder))
      : -1;
    const now = Date.now();
    return await ctx.db.insert("bidshield_project_materials", {
      projectId: args.projectId,
      userId: args.userId,
      templateKey: args.templateKey,
      category: args.category,
      name: args.name,
      unit: args.unit,
      calcType: args.calcType,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      totalCost: args.totalCost,
      wasteFactor: args.wasteFactor,
      coverage: args.coverage,
      qtyPerSf: args.qtyPerSf,
      takeoffItemType: args.takeoffItemType,
      notes: args.notes,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProjectMaterial = mutation({
  args: {
    materialId: v.id("bidshield_project_materials"),
    quantity: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    wasteFactor: v.optional(v.number()),
    coverage: v.optional(v.number()),
    qtyPerSf: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { materialId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(materialId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteProjectMaterial = mutation({
  args: { materialId: v.id("bidshield_project_materials") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.materialId);
  },
});

// Bulk add materials from templates
export const initProjectMaterials = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    materials: v.array(v.object({
      templateKey: v.optional(v.string()),
      category: v.string(),
      name: v.string(),
      unit: v.string(),
      calcType: v.string(),
      quantity: v.optional(v.number()),
      unitPrice: v.optional(v.number()),
      totalCost: v.optional(v.number()),
      wasteFactor: v.number(),
      coverage: v.optional(v.number()),
      qtyPerSf: v.optional(v.number()),
      takeoffItemType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Check if materials already exist
    const existing = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (existing.length > 0) return existing.sort((a, b) => a.sortOrder - b.sortOrder);

    const now = Date.now();
    const created = [];
    for (let i = 0; i < args.materials.length; i++) {
      const m = args.materials[i];
      const id = await ctx.db.insert("bidshield_project_materials", {
        projectId: args.projectId,
        userId: args.userId,
        templateKey: m.templateKey,
        category: m.category,
        name: m.name,
        unit: m.unit,
        calcType: m.calcType,
        quantity: m.quantity,
        unitPrice: m.unitPrice,
        totalCost: m.totalCost,
        wasteFactor: m.wasteFactor,
        coverage: m.coverage,
        qtyPerSf: m.qtyPerSf,
        takeoffItemType: m.takeoffItemType,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
      created.push({ _id: id, ...m, sortOrder: i });
    }
    return created;
  },
});

// Delete all materials for a project (used before replacing with extracted items)
export const clearProjectMaterials = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const existing = await ctx.db
        .query("bidshield_project_materials")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
      for (const m of existing) {
        await ctx.db.delete(m._id);
      }
      return { deleted: existing.length };
    } catch (error) {
      console.error("clearProjectMaterials error:", error);
      throw error;
    }
  },
});

// Bulk save materials extracted from PDF estimating report
export const bulkSaveMaterialsFromExtraction = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    items: v.array(v.object({
      materialName: v.string(),
      category: v.string(),
      unit: v.string(),
      quantity: v.optional(v.number()),
      coverageRate: v.optional(v.string()),
      wastePct: v.optional(v.number()),
      unitPrice: v.optional(v.number()),
      extendedTotal: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    try {
    const now = Date.now();
    const existing = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const sortBase = existing.length;
    const categoryMap: Record<string, string> = {
      "Membrane": "membrane",
      "Insulation": "insulation",
      "Fasteners & Plates": "fasteners",
      "Adhesive & Sealant": "adhesive",
      "Sheet Metal": "sheet_metal",
      "Lumber & Blocking": "lumber",
      "Accessories": "accessories",
      "Tear-Off": "accessories",
      "Miscellaneous": "miscellaneous",
      // Legacy mappings
      "Edge Metal": "sheet_metal",
      "Fabricated Metal": "sheet_metal",
      "Metal Work": "sheet_metal",
      "Lumber": "lumber",
      "General": "miscellaneous",
    };
    for (let i = 0; i < args.items.length; i++) {
      const item = args.items[i];
      const cat = categoryMap[item.category] ?? "accessories";
      const wastePct = item.wastePct ?? 0;
      const wasteFactor = wastePct > 0 ? 1 + wastePct / 100 : 1.0;
      await ctx.db.insert("bidshield_project_materials", {
        projectId: args.projectId,
        userId: args.userId,
        category: cat,
        name: item.materialName,
        unit: item.unit,
        calcType: "fixed",
        quantity: item.quantity ?? 0,
        unitPrice: item.unitPrice ?? 0,
        totalCost: item.extendedTotal ?? 0,
        wasteFactor,
        coverageRate: item.coverageRate ?? undefined,
        coverageSource: item.coverageRate ? "report" : undefined,
        extractedFromPdf: true,
        sortOrder: sortBase + i,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { inserted: args.items.length };
    } catch (error) {
      console.error("bulkSaveMaterialsFromExtraction error:", error);
      throw error;
    }
  },
});

// Update coverage rate for a single material
export const updateMaterialCoverageRate = mutation({
  args: {
    materialId: v.id("bidshield_project_materials"),
    coverageRate: v.string(),
    source: v.string(), // "report" | "ai_estimated" | "manual"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.materialId, {
      coverageRate: args.coverageRate,
      coverageSource: args.source,
      coverageVerified: args.source === "manual",
      updatedAt: Date.now(),
    });
  },
});

// Fix miscategorized materials for a project
export const fixMaterialCategories = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
  },
  handler: async (ctx, args) => {
    const materials = await ctx.db
      .query("bidshield_project_materials")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const SHEET_METAL_TERMS = [
      "coping", "counterflashing", "gravel stop", "fascia", "lock strip",
      "hook strip", "cleat", "drip edge", "expansion joint", "aluminum",
      "galvanized", "stainless", "galvalume", "kynar", " ga.", " ga ", "gauge",
      "sheet metal", "coil stock", "flash", "reglet",
    ];
    const LUMBER_TERMS = [
      "lumber", "plywood", "cdx", " pt ", "2x4", "2x6", "2x8", "2x10", "2x12",
      "4x4", "blocking", "nailer", "cant strip", "wood block",
    ];

    let fixed = 0;
    for (const m of materials) {
      const lower = m.name.toLowerCase();
      const oldCat = m.category;
      let newCat: string | null = null;

      // Recategorize edge_metal / fabricated items → sheet_metal
      if (
        oldCat === "edge_metal" ||
        oldCat === "accessories" ||
        oldCat === "miscellaneous"
      ) {
        if (SHEET_METAL_TERMS.some(t => lower.includes(t))) {
          newCat = "sheet_metal";
        }
      }

      // Recategorize accessories/miscellaneous → lumber
      if (!newCat && (oldCat === "accessories" || oldCat === "miscellaneous")) {
        if (LUMBER_TERMS.some(t => lower.includes(t))) {
          newCat = "lumber";
        }
      }

      if (newCat && newCat !== oldCat) {
        await ctx.db.patch(m._id, { category: newCat, updatedAt: Date.now() });
        fixed++;
      }
    }

    return { fixed };
  },
});

// ===== USER MATERIAL PRICES =====

export const getUserMaterialPrices = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bidshield_user_material_prices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const upsertUserMaterialPrice = mutation({
  args: {
    userId: v.string(),
    materialName: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    vendorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bidshield_user_material_prices")
      .withIndex("by_user_material", (q) => q.eq("userId", args.userId).eq("materialName", args.materialName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        unitPrice: args.unitPrice,
        unit: args.unit,
        vendorName: args.vendorName,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("bidshield_user_material_prices", {
      userId: args.userId,
      materialName: args.materialName,
      unit: args.unit,
      unitPrice: args.unitPrice,
      vendorName: args.vendorName,
      updatedAt: Date.now(),
    });
  },
});

// ===== SCOPE ITEMS =====

export const getScopeItems = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
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

// ─── Scope Clarifications & Assumptions ──────────────────────────────────────

export const getScopeClarifications = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
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
    // Only allow deleting custom items
    if (item.isDefault) return;
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

// ─── Bid Qualifications ───────────────────────────────────────────────────────

export const getBidQuals = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
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

// ===== DECISION LOG =====

export const getDecisions = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("bidshield_decisions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const addDecision = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    text: v.string(),
    who: v.optional(v.string()),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bidshield_decisions", { ...args, timestamp: Date.now() });
  },
});

export const deleteDecision = mutation({
  args: { id: v.id("bidshield_decisions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ===== GENERAL CONDITIONS =====

export const getGCItems = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
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
    await ctx.db.delete(id);
  },
});

// ===== DATASHEETS =====

export const getDatasheets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const items = await ctx.db
      .query("bidshield_datasheets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        sourcePdfUrl: item.sourcePdf
          ? await ctx.storage.getUrl(item.sourcePdf as any)
          : null,
      }))
    );
  },
});

export const addDatasheet = mutation({
  args: {
    userId: v.string(),
    productName: v.string(),
    category: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    coverage: v.optional(v.number()),
    coverageUnit: v.optional(v.string()),
    vendorName: v.optional(v.string()),
    quoteDate: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    sourcePdf: v.optional(v.string()),
    isExtracted: v.optional(v.boolean()),
    quoteId: v.optional(v.id("bidshield_quotes")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bidshield_datasheets", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDatasheet = mutation({
  args: {
    id: v.id("bidshield_datasheets"),
    productName: v.optional(v.string()),
    category: v.optional(v.string()),
    unit: v.optional(v.string()),
    unitPrice: v.optional(v.number()),
    coverage: v.optional(v.number()),
    coverageUnit: v.optional(v.string()),
    vendorName: v.optional(v.string()),
    quoteDate: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    quoteId: v.optional(v.id("bidshield_quotes")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const deleteDatasheet = mutation({
  args: { id: v.id("bidshield_datasheets") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const generatePdfUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMonthlyExtractionCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const items = await ctx.db
      .query("bidshield_datasheets")
      .withIndex("by_user_created", (q) =>
        q.eq("userId", userId).gte("createdAt", startOfMonth)
      )
      .collect();
    return items.filter((i) => i.isExtracted).length;
  },
});

export const backfillPriceLibraryFromQuotes = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    await validateAuth(ctx, userId);
    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let upserted = 0;
    let updated = 0;

    for (const quote of quotes) {
      if (!quote.products?.length) continue;
      const lineItems = parseLineItems(quote.products);
      if (lineItems.length === 0) continue;

      const existing = await ctx.db
        .query("bidshield_datasheets")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const now = Date.now();
      for (const item of lineItems) {
        if (!item.m || !item.u || item.p <= 0) continue;
        const productNameNorm = item.m.toLowerCase().trim();
        const vendorNorm = (quote.vendorName ?? "").toLowerCase().trim();

        const match = existing.find(
          (d) =>
            d.productName.toLowerCase().trim() === productNameNorm &&
            (d.vendorName ?? "").toLowerCase().trim() === vendorNorm
        );

        if (match) {
          await ctx.db.patch(match._id, {
            unitPrice: item.p,
            unit: item.u,
            quoteDate: quote.quoteDate,
            quoteId: quote._id,
            isExtracted: quote.isExtracted,
            sourcePdf: quote.sourcePdf,
            updatedAt: now,
          });
          updated++;
        } else {
          await ctx.db.insert("bidshield_datasheets", {
            userId,
            productName: item.m,
            category: quote.category ?? "Other",
            unit: item.u,
            unitPrice: item.p,
            vendorName: quote.vendorName,
            quoteDate: quote.quoteDate,
            sourcePdf: quote.sourcePdf,
            isExtracted: quote.isExtracted,
            quoteId: quote._id,
            notes: item.n || undefined,
            createdAt: now,
            updatedAt: now,
          });
          upserted++;
        }
      }
    }

    return { upserted, updated };
  },
});

// ===== LABOR VERIFICATION =====

export const saveLaborAnalysis = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    inputSummary: v.string(),
    laborType: v.string(),
    baseWage: v.number(),
    burdenMultiplier: v.number(),
    loadedRate: v.number(),
    totalLaborCost: v.number(),
    totalDays: v.optional(v.number()),
    laborPerSf: v.optional(v.number()),
    scheduleConflict: v.optional(v.boolean()),
    scheduleNote: v.optional(v.string()),
    assumptions: v.array(v.string()),
    warnings: v.array(v.string()),
    tasks: v.array(v.object({
      category: v.string(),
      task: v.string(),
      unit: v.string(),
      quantity: v.number(),
      ratePerUnit: v.number(),
      totalCost: v.number(),
      crewSize: v.number(),
      days: v.optional(v.number()),
      notes: v.optional(v.string()),
      rateFlag: v.optional(v.string()),
      detailType: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const now = Date.now();

    // Delete existing analysis + tasks for this project
    const existingAnalysis = await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const a of existingAnalysis) await ctx.db.delete(a._id);

    const existingTasks = await ctx.db
      .query("bidshield_laborTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const t of existingTasks) await ctx.db.delete(t._id);

    // Save new analysis metadata
    await ctx.db.insert("bidshield_laborAnalysis", {
      projectId: args.projectId,
      userId: args.userId,
      inputSummary: args.inputSummary,
      laborType: args.laborType,
      baseWage: args.baseWage,
      burdenMultiplier: args.burdenMultiplier,
      loadedRate: args.loadedRate,
      totalLaborCost: args.totalLaborCost,
      totalDays: args.totalDays,
      laborPerSf: args.laborPerSf,
      scheduleConflict: args.scheduleConflict,
      scheduleNote: args.scheduleNote,
      assumptions: args.assumptions,
      warnings: args.warnings,
      analyzedAt: now,
    });

    // Save tasks
    for (let i = 0; i < args.tasks.length; i++) {
      const t = args.tasks[i];
      await ctx.db.insert("bidshield_laborTasks", {
        projectId: args.projectId,
        userId: args.userId,
        category: t.category,
        task: t.task,
        unit: t.unit,
        quantity: t.quantity,
        ratePerUnit: t.ratePerUnit,
        totalCost: t.totalCost,
        crewSize: t.crewSize,
        days: t.days,
        notes: t.notes,
        rateFlag: t.rateFlag,
        detailType: t.detailType,
        verified: false,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { taskCount: args.tasks.length };
  },
});

export const getLaborTasks = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return [];
    const tasks = await ctx.db
      .query("bidshield_laborTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return tasks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getLaborAnalysis = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

export const getLaborTotal = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    return analysis ? analysis.totalLaborCost : null;
  },
});

export const getUnverifiedLaborCount = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("bidshield_laborTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (tasks.length === 0) return null; // no analysis run yet
    return tasks.filter(t => !t.verified).length;
  },
});

export const updateLaborTask = mutation({
  args: {
    taskId: v.id("bidshield_laborTasks"),
    quantity: v.optional(v.number()),
    ratePerUnit: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    const quantity = updates.quantity ?? task.quantity;
    const ratePerUnit = updates.ratePerUnit ?? task.ratePerUnit;
    const totalCost = quantity * ratePerUnit;

    await ctx.db.patch(taskId, {
      quantity,
      ratePerUnit,
      totalCost,
      notes: updates.notes ?? task.notes,
      updatedAt: Date.now(),
    });

    // Recompute analysis total
    const allTasks = await ctx.db
      .query("bidshield_laborTasks")
      .withIndex("by_project", (q) => q.eq("projectId", task.projectId))
      .collect();
    const newTotal = allTasks.reduce((sum, t) =>
      t._id === taskId ? sum + totalCost : sum + t.totalCost, 0
    );
    const analysis = await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", task.projectId))
      .first();
    if (analysis) {
      await ctx.db.patch(analysis._id, { totalLaborCost: newTotal });
    }
  },
});

export const toggleLaborTaskVerified = mutation({
  args: { taskId: v.id("bidshield_laborTasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(args.taskId, {
      verified: !task.verified,
      updatedAt: Date.now(),
    });
  },
});

export const clearLaborTasks = mutation({
  args: { projectId: v.id("bidshield_projects"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const tasks = await ctx.db
      .query("bidshield_laborTasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const t of tasks) await ctx.db.delete(t._id);

    const analyses = await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const a of analyses) await ctx.db.delete(a._id);
  },
});

// ===== VENDORS =====

export const getVendors = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    if (identity.subject !== args.userId) throw new Error("Unauthorized");
    return await ctx.db
      .query("bidshield_vendors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const getVendorsByCategory = query({
  args: { userId: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    const vendors = await ctx.db
      .query("bidshield_vendors")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("active", true))
      .collect();
    return vendors.filter((v) => v.categories.includes(args.category));
  },
});

export const getVendorWithQuoteHistory = query({
  args: { vendorId: v.id("bidshield_vendors") },
  handler: async (ctx, args) => {
    const vendor = await ctx.db.get(args.vendorId);
    if (!vendor) return null;

    const quotes = await ctx.db
      .query("bidshield_quotes")
      .withIndex("by_user", (q) => q.eq("userId", vendor.userId))
      .collect();

    const linkedQuotes = quotes.filter((q) => q.vendorId === args.vendorId);

    // Resolve project names
    const withProjects = await Promise.all(
      linkedQuotes.map(async (q) => {
        const project = q.projectId ? await ctx.db.get(q.projectId) : null;
        return { ...q, projectName: project?.name ?? null };
      })
    );

    return { vendor, quotes: withProjects };
  },
});

export const createVendor = mutation({
  args: {
    userId: v.string(),
    companyName: v.string(),
    repName: v.optional(v.string()),
    repPhone: v.optional(v.string()),
    repEmail: v.optional(v.string()),
    territory: v.optional(v.string()),
    categories: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    return await ctx.db.insert("bidshield_vendors", {
      userId: args.userId,
      companyName: args.companyName,
      repName: args.repName,
      repPhone: args.repPhone,
      repEmail: args.repEmail,
      territory: args.territory,
      categories: args.categories,
      notes: args.notes,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateVendor = mutation({
  args: {
    vendorId: v.id("bidshield_vendors"),
    userId: v.string(),
    companyName: v.optional(v.string()),
    repName: v.optional(v.string()),
    repPhone: v.optional(v.string()),
    repEmail: v.optional(v.string()),
    territory: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const { vendorId, userId, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(vendorId, patch);
  },
});

export const deleteVendor = mutation({
  args: { vendorId: v.id("bidshield_vendors"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await ctx.db.delete(args.vendorId);
  },
});

export const linkQuoteToVendor = mutation({
  args: {
    quoteId: v.id("bidshield_quotes"),
    vendorId: v.id("bidshield_vendors"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await ctx.db.patch(args.quoteId, { vendorId: args.vendorId });
  },
});

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
    const now = Date.now();
    // Delete existing items
    const existing = await ctx.db
      .query("bidshield_gcBidFormItems")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    for (const item of existing) await ctx.db.delete(item._id);

    // Get projectId from the document
    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");

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
    await ctx.db.patch(args.documentId, { label: args.label });
  },
});

export const deleteGcBidFormDocument = mutation({
  args: { documentId: v.id("bidshield_gcBidFormDocuments") },
  handler: async (ctx, args) => {
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

