import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertRecordOwnership, roundCurrency } from "./_helpers";
import { parseLineItems } from "./quotes";

// ===== DATASHEETS =====

export const getDatasheets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // P0-7: Verify caller identity
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }
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
    await validateAuth(ctx, args.userId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_datasheets", {
      ...args,
      unitPrice: roundCurrency(args.unitPrice),
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
    const sheet = await ctx.db.get(id);
    await assertRecordOwnership(ctx, sheet, "datasheet");
    if (fields.unitPrice !== undefined) fields.unitPrice = roundCurrency(fields.unitPrice);
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const deleteDatasheet = mutation({
  args: { id: v.id("bidshield_datasheets") },
  handler: async (ctx, { id }) => {
    const sheet = await ctx.db.get(id);
    await assertRecordOwnership(ctx, sheet, "datasheet");
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
    // P0-7: Verify caller identity
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }
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
            unitPrice: roundCurrency(item.p),
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
            unitPrice: roundCurrency(item.p),
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
