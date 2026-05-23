/**
 * Project Assembly Presets
 * 
 * Manages project-specific assembly instances derived from archetypes.
 * These are the actual assemblies used in a project (e.g. "RT-01", "ROOF 05").
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("bidshield_projectAssemblyPresets")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getByLegacySystemId = query({
  args: {
    projectId: v.id("bidshield_projects"),
    legacySystemId: v.string(),
  },
  handler: async (ctx, { projectId, legacySystemId }) => {
    // by_legacySystemId is a single-field index; filter on projectId afterward
    return ctx.db
      .query("bidshield_projectAssemblyPresets")
      .withIndex("by_legacySystemId", (q) =>
        q.eq("legacySystemId", legacySystemId)
      )
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .first();
  },
});

export const getByArchetypeId = query({
  args: {
    projectId: v.id("bidshield_projects"),
    archetypeId: v.string(),
  },
  handler: async (ctx, { projectId, archetypeId }) => {
    // by_archetypeId is a single-field index; filter on projectId afterward
    return ctx.db
      .query("bidshield_projectAssemblyPresets")
      .withIndex("by_archetypeId", (q) =>
        q.eq("archetypeId", archetypeId)
      )
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    archetypeId: v.string(),
    archetypeVersion: v.number(),
    displayName: v.string(),
    drawingAssemblyId: v.optional(v.string()),
    sectionValues: v.any(),
    legacySystemId: v.optional(v.string()),
    classificationAudit: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("bidshield_projectAssemblyPresets", {
      ...args,
      needsReview: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id("bidshield_projectAssemblyPresets"),
    sectionValues: v.optional(v.any()),
    displayName: v.optional(v.string()),
    drawingAssemblyId: v.optional(v.string()),
    classificationAudit: v.optional(v.any()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { id };
  },
});

export const remove = mutation({
  args: { id: v.id("bidshield_projectAssemblyPresets") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { id };
  },
});

// ─── Backward Compatibility Migration ────────────────────────────────────────

/**
 * Migration helper: Create project presets from legacy roofSystemConfigs
 * 
 * Called during gradual migration (Phase 4).
 */
export const migrateFromLegacy = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, { projectId, userId }) => {
    // Get legacy roof system configs for this project
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    
    const legacyConfigs = (project as any).roofSystemConfigs || [];
    if (legacyConfigs.length === 0) {
      return { status: "no_legacy_configs", migrated: 0 };
    }
    
    // Check if already migrated
    const existingPresets = await ctx.db
      .query("bidshield_projectAssemblyPresets")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
    
    if (existingPresets.length > 0) {
      return { status: "already_migrated", existing: existingPresets.length };
    }
    
    // Create presets from legacy configs
    const migrated = [];
    for (const config of legacyConfigs) {
      const archetypeId = mapLegacySystemIdToArchetype(config.systemId);
      
      const id = await ctx.db.insert("bidshield_projectAssemblyPresets", {
        projectId,
        userId,
        archetypeId,
        archetypeVersion: 1,
        displayName: config.label || config.systemId,
        drawingAssemblyId: undefined,
        sectionValues: config.sections || {},
        legacySystemId: config.systemId,
        needsReview: false,
        classificationAudit: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      migrated.push({ id, archetypeId, legacySystemId: config.systemId });
    }
    
    return {
      status: "migrated",
      count: migrated.length,
      presets: migrated,
    };
  },
});

/**
 * Map legacy systemId to archetype
 */
function mapLegacySystemIdToArchetype(systemId: string): string {
  const map: Record<string, string> = {
    tpo: "single_ply_tpo",
    pvc: "single_ply_pvc",
    epdm: "single_ply_epdm",
    sbs: "modified_bitumen_sbs",
    app: "modified_bitumen_sbs",
    lam: "conventional_liquid_applied",
    lam_irma: "liquid_applied_irma",
    bur: "custom", // BUR not in initial 10 archetypes
    metal: "custom",
    spf: "custom",
    hydrotech: "concrete_pavement_roof",
    custom: "custom",
  };
  
  return map[systemId] || "custom";
}
