import { v } from "convex/values";
import { mutation, query, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// Helper: parse compact line item JSON {m, u, p, n} stored in products array
export function parseLineItems(products: string[]): Array<{ m: string; u: string; p: number; n: string }> {
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
export async function upsertLineItemsToDatasheets(
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

export const getQuotes = query({
  args: { userId: v.string(), projectId: v.optional(v.id("bidshield_projects")) },
  handler: async (ctx, args) => {
    // P0-7: Verify the requesting user matches the userId arg
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (args.userId !== identity.subject) throw new Error("Unauthorized");
    if (args.projectId) {
      await assertProjectOwnership(ctx, args.projectId);
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
    const quote = await ctx.db.get(args.quoteId);
    await assertRecordOwnership(ctx, quote, "quote");
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
    const quote = await ctx.db.get(args.quoteId);
    await assertRecordOwnership(ctx, quote, "quote");
    await ctx.db.delete(args.quoteId);
  },
});

// Returns all quotes for a user with project name resolved
export const getQuotesWithProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // P0-7: Verify caller identity
    const { isDemoUser } = await import("../utils");
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }
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
    await assertProjectOwnership(ctx, projectId);
    const source = await ctx.db.get(quoteId);
    if (!source) throw new Error("Quote not found");
    // Verify caller owns the source quote
    await assertRecordOwnership(ctx, source, "quote");
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
