import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership } from "./_helpers";

export const getChecklist = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
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
    await assertProjectOwnership(ctx, args.projectId);
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

// ===== CHECKLIST PROGRESS (helper) =====

export const getChecklistProgress = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const items = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (items.length === 0) return 0;
    const doneCount = items.filter((i) => i.status === "done" || i.status === "na").length;
    return Math.round((doneCount / items.length) * 100);
  },
});
