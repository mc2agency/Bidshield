import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { isDemoUser } from "../utils";
import { validateAuth, assertRecordOwnership } from "./_helpers";

export const listByProject = query({
  args: { projectId: v.id("bidshield_projects"), userId: v.string() },
  handler: async (ctx, { projectId, userId }) => {
    if (!isDemoUser(userId)) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== userId) throw new Error("Unauthorized");
    }
    const items = await ctx.db
      .query("bidshield_submittals")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        downloadUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
      })),
    );
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const addSubmittal = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    productName: v.string(),
    manufacturer: v.optional(v.string()),
    category: v.optional(v.string()),
    sourceUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileSize: v.optional(v.number()),
    title: v.optional(v.string()),
    status: v.union(
      v.literal("found"),
      v.literal("downloaded"),
      v.literal("failed"),
      v.literal("manual"),
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const convexUserId = await validateAuth(ctx, args.userId);
    const now = Date.now();
    // Dedupe: same project + product → replace
    const existing = await ctx.db
      .query("bidshield_submittals")
      .withIndex("by_project_product", (q) =>
        q.eq("projectId", args.projectId).eq("productName", args.productName),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, convexUserId, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("bidshield_submittals", {
      ...args,
      convexUserId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteSubmittal = mutation({
  args: { id: v.id("bidshield_submittals") },
  handler: async (ctx, { id }) => {
    const sub = await ctx.db.get(id);
    await assertRecordOwnership(ctx, sub, "submittal");
    if (sub?.storageId) {
      try {
        await ctx.storage.delete(sub.storageId);
      } catch {}
    }
    await ctx.db.delete(id);
  },
});
