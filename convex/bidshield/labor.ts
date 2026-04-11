import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership, roundCurrency } from "./_helpers";

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
    await assertProjectOwnership(ctx, args.projectId);
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
      baseWage: roundCurrency(args.baseWage),
      burdenMultiplier: args.burdenMultiplier,
      loadedRate: roundCurrency(args.loadedRate),
      totalLaborCost: roundCurrency(args.totalLaborCost),
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
        ratePerUnit: roundCurrency(t.ratePerUnit),
        totalCost: roundCurrency(t.totalCost),
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
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_laborAnalysis")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});

export const getLaborTotal = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
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
    await assertProjectOwnership(ctx, args.projectId);
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
    await assertRecordOwnership(ctx, task, "labor task");

    const quantity = updates.quantity ?? task.quantity;
    const ratePerUnit = updates.ratePerUnit ?? task.ratePerUnit;
    const totalCost = roundCurrency(quantity * ratePerUnit);

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
    const newTotal = roundCurrency(allTasks.reduce((sum, t) =>
      t._id === taskId ? sum + totalCost : sum + t.totalCost, 0
    ));
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
    await assertRecordOwnership(ctx, task, "labor task");
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
    await assertProjectOwnership(ctx, args.projectId);
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
