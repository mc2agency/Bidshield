import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertRecordOwnership } from "./_helpers";

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
    // P0-7: Verify caller identity
    if (!isDemoUser(args.userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    }
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
    // P0-7: Verify caller owns this vendor
    await assertRecordOwnership(ctx, vendor, "vendor");

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
    const vendor = await ctx.db.get(args.vendorId);
    await assertRecordOwnership(ctx, vendor, "vendor");
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
    const vendor = await ctx.db.get(args.vendorId);
    await assertRecordOwnership(ctx, vendor, "vendor");
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
    const quote = await ctx.db.get(args.quoteId);
    await assertRecordOwnership(ctx, quote, "quote");
    const vendor = await ctx.db.get(args.vendorId);
    await assertRecordOwnership(ctx, vendor, "vendor");
    await ctx.db.patch(args.quoteId, { vendorId: args.vendorId });
  },
});
