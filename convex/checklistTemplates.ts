import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isDemoUser } from "./utils";

async function validateAuth(ctx: any, userId: string) {
  if (isDemoUser(userId)) return;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
}

// ===== CHECKLIST TEMPLATES =====

/** List all saved templates for a user. */
export const getChecklistTemplates = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (isDemoUser(args.userId)) return [];
    return await ctx.db
      .query("bidshield_checklist_templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/** Save the current project's checklist as a named template. */
export const saveChecklistTemplate = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("bidshield_projects"),
    name: v.string(),
    systemType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);

    // Pull the project's current checklist items
    const checklistItems = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Store all items (including pending) so the template reflects the full state
    const templateItems = checklistItems.map((item) => ({
      phaseKey: item.phaseKey,
      itemId: item.itemId,
      status: item.status,
    }));

    const now = Date.now();
    const templateId = await ctx.db.insert("bidshield_checklist_templates", {
      userId: args.userId,
      name: args.name.trim(),
      systemType: args.systemType,
      items: templateItems,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

/**
 * Apply a saved template to a project's checklist.
 * Matches template items to existing checklist items by phaseKey + itemId
 * and updates their status. Items not in the template are left unchanged.
 */
export const applyChecklistTemplate = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("bidshield_projects"),
    templateId: v.id("bidshield_checklist_templates"),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);

    // Verify the template belongs to this user
    const template = await ctx.db.get(args.templateId);
    if (!template || template.userId !== args.userId) {
      throw new Error("Template not found");
    }

    // Fetch the project's current checklist items
    const projectItems = await ctx.db
      .query("bidshield_checklist_items")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Build a lookup map: "phaseKey__itemId" -> db record
    const itemMap = new Map(
      projectItems.map((i) => [`${i.phaseKey}__${i.itemId}`, i])
    );

    // Fetch project for userId (needed for upsert case)
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const now = Date.now();
    let applied = 0;

    for (const templateItem of template.items) {
      const key = `${templateItem.phaseKey}__${templateItem.itemId}`;
      const existing = itemMap.get(key);

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: templateItem.status,
          updatedAt: now,
        });
        applied++;
      } else {
        // Item exists in template but not yet in the project checklist — insert it
        await ctx.db.insert("bidshield_checklist_items", {
          projectId: args.projectId,
          userId: project.userId,
          phaseKey: templateItem.phaseKey,
          itemId: templateItem.itemId,
          status: templateItem.status,
          updatedAt: now,
        });
        applied++;
      }
    }

    return { applied };
  },
});

/** Delete a saved template. */
export const deleteChecklistTemplate = mutation({
  args: {
    userId: v.string(),
    templateId: v.id("bidshield_checklist_templates"),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);

    const template = await ctx.db.get(args.templateId);
    if (!template || template.userId !== args.userId) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.templateId);
  },
});
