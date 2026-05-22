import { internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { assertProjectOwnership } from "./_helpers";

// ─── Shared sync helper ────────────────────────────────────────────────────────

async function _syncToProject(ctx: any, projectId: any) {
  const assemblies = await ctx.db
    .query("bidshield_roofAssemblies")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .collect();

  const embedded = assemblies.map((a: any) => ({
    label: a.label,
    systemType: a.systemType,
    ...(a.roofName && { name: a.roofName }),
    ...(a.insulationType && { insulationType: a.insulationType }),
    ...(a.insulationThickness && { insulationThickness: a.insulationThickness }),
    ...(a.rValue != null && { rValue: a.rValue }),
    ...(a.surfaceType && { surfaceType: a.surfaceType }),
    ...(a.coverBoard && { coverBoard: a.coverBoard }),
    ...(a.deckType && { deckType: a.deckType }),
    ...(a.attachmentMethod && { attachmentMethod: a.attachmentMethod }),
    ...(a.roofArea != null && { area: a.roofArea }),
    ...(a.uValue != null && { uValue: a.uValue }),
    ...(a.layers && a.layers.length > 0 && { layers: a.layers }),
    ...(a.enabled != null && { enabled: a.enabled }),
  }));

  await ctx.db.patch(projectId, {
    roofAssemblies: embedded.length > 0 ? embedded : undefined,
  });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const listByProject = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_roofAssemblies")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const get = query({
  args: { assemblyId: v.id("bidshield_roofAssemblies") },
  handler: async (ctx, { assemblyId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db.get(assemblyId);
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const upsert = mutation({
  args: {
    assemblyId: v.optional(v.id("bidshield_roofAssemblies")),
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    label: v.string(),
    systemType: v.string(),
    roofName: v.optional(v.string()),
    roofArea: v.optional(v.number()),
    insulationType: v.optional(v.string()),
    insulationThickness: v.optional(v.string()),
    rValue: v.optional(v.number()),
    uValue: v.optional(v.number()),
    surfaceType: v.optional(v.string()),
    coverBoard: v.optional(v.string()),
    deckType: v.optional(v.string()),
    attachmentMethod: v.optional(v.string()),
    slope: v.optional(v.string()),
    sectionValues: v.optional(v.record(v.string(), v.union(v.string(), v.boolean(), v.null()))),
    layers: v.optional(v.array(v.string())),
    extractedFromPdf: v.optional(v.boolean()),
    extractionMetadata: v.optional(v.object({
      confidence: v.optional(v.number()),
      model: v.optional(v.string()),
      drawingLabel: v.optional(v.string()),
      drawingPage: v.optional(v.string()),
      drawingRevision: v.optional(v.string()),
    })),
    warnings: v.optional(v.array(v.string())),
    generatedLayers: v.optional(v.array(v.string())),
    generatedScope: v.optional(v.array(v.string())),
    confidence: v.optional(v.number()),
    drawingReferences: v.optional(v.array(v.object({
      label: v.string(),
      date: v.optional(v.string()),
      page: v.optional(v.string()),
      revision: v.optional(v.string()),
    }))),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    const { assemblyId, ...fields } = args;

    let id: string;
    if (assemblyId) {
      await ctx.db.patch(assemblyId, { ...fields, updatedAt: now });
      id = assemblyId;
    } else {
      id = await ctx.db.insert("bidshield_roofAssemblies", {
        ...fields,
        createdAt: now,
        updatedAt: now,
      });
    }

    await _syncToProject(ctx, args.projectId);
    return id;
  },
});

export const updateSectionValues = mutation({
  args: {
    assemblyId: v.id("bidshield_roofAssemblies"),
    sectionValues: v.record(v.string(), v.union(v.string(), v.boolean(), v.null())),
    warnings: v.optional(v.array(v.string())),
    generatedLayers: v.optional(v.array(v.string())),
    generatedScope: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { assemblyId, sectionValues, warnings, generatedLayers, generatedScope }) => {
    const assembly = await ctx.db.get(assemblyId);
    if (!assembly) throw new Error("Assembly not found");
    await assertProjectOwnership(ctx, assembly.projectId);
    await ctx.db.patch(assemblyId, {
      sectionValues,
      ...(warnings !== undefined && { warnings }),
      ...(generatedLayers !== undefined && { generatedLayers }),
      ...(generatedScope !== undefined && { generatedScope }),
      updatedAt: Date.now(),
    });
    await _syncToProject(ctx, assembly.projectId);
  },
});

export const remove = mutation({
  args: { assemblyId: v.id("bidshield_roofAssemblies") },
  handler: async (ctx, { assemblyId }) => {
    const assembly = await ctx.db.get(assemblyId);
    if (!assembly) return;
    await assertProjectOwnership(ctx, assembly.projectId);
    const projectId = assembly.projectId;
    await ctx.db.delete(assemblyId);
    await _syncToProject(ctx, projectId);
  },
});

// ─── Internal: explicit sync mutation (callable from other mutations) ─────────

export const syncToProject = internalMutation({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    await _syncToProject(ctx, projectId);
  },
});
