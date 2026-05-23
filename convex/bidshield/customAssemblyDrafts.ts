/**
 * Custom Assembly Drafts
 *
 * Stores unclassified assemblies extracted from drawings that could not be
 * matched to a known archetype with sufficient confidence. Estimators can
 * review, edit section values, and promote drafts to project presets once
 * they are satisfied with the classification.
 *
 * Schema fields (mirrors bidshield_customAssemblyDrafts in schema.ts):
 *   displayName          - human-readable label (e.g. "ROOF 07 – Unknown")
 *   archetypeId          - always "custom" for drafts
 *   archetypeVersion     - always 1 for drafts
 *   extractedLayers      - raw layer strings from OCR/AI
 *   sectionValues        - current section values (editable by estimator)
 *   classificationAttempt - full audit object from the classifier
 *   canPromoteToArchetype - true when estimator marks it ready for promotion
 *   promotedArchetypeId  - set when promoted to a real archetype preset
 *   needsReview          - always true for drafts (literal in schema)
 *   inferredCategory     - optional string hint from AI (e.g. "Single-Ply")
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_customAssemblyDrafts")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const listPromotable = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    // by_canPromote is a single-field index on canPromoteToArchetype
    return ctx.db
      .query("bidshield_customAssemblyDrafts")
      .withIndex("by_canPromote", (q) =>
        q.eq("canPromoteToArchetype", true)
      )
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("bidshield_customAssemblyDrafts") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db.get(id);
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    displayName: v.string(),
    extractedLayers: v.array(v.string()),
    ocrText: v.optional(v.string()),
    classificationAttempt: v.any(),
    canPromoteToArchetype: v.optional(v.boolean()),
    sectionValues: v.any(),
    inferredCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("bidshield_customAssemblyDrafts", {
      projectId: args.projectId,
      userId: args.userId,
      displayName: args.displayName,
      archetypeId: "custom",
      archetypeVersion: 1,
      extractedLayers: args.extractedLayers,
      sectionValues: args.sectionValues,
      classificationAttempt: args.classificationAttempt,
      canPromoteToArchetype: args.canPromoteToArchetype,
      inferredCategory: args.inferredCategory,
      needsReview: true,
      requiredSections: [],
      optionalSections: [],
      hiddenSections: [],
      defaultLayerOrder: [],
      validationRules: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id("bidshield_customAssemblyDrafts"),
    sectionValues: v.optional(v.any()),
    displayName: v.optional(v.string()),
    canPromoteToArchetype: v.optional(v.boolean()),
    inferredCategory: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { id };
  },
});

/**
 * Promote draft to project preset.
 * Sets promotedArchetypeId on the draft and creates a projectAssemblyPreset.
 */
export const promote = mutation({
  args: {
    draftId: v.id("bidshield_customAssemblyDrafts"),
    archetypeId: v.string(),
    archetypeVersion: v.number(),
    displayName: v.string(),
  },
  handler: async (ctx, { draftId, archetypeId, archetypeVersion, displayName }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found");

    if (!draft.canPromoteToArchetype) {
      throw new Error("Draft is not ready for promotion");
    }

    // Create project preset
    const presetId = await ctx.db.insert("bidshield_projectAssemblyPresets", {
      projectId: draft.projectId,
      userId: draft.userId,
      archetypeId,
      archetypeVersion,
      displayName,
      drawingAssemblyId: undefined,
      sectionValues: draft.sectionValues,
      legacySystemId: undefined,
      needsReview: false,
      classificationAudit: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mark draft as promoted
    await ctx.db.patch(draftId, {
      promotedArchetypeId: archetypeId,
      updatedAt: Date.now(),
    });

    return { draftId, presetId };
  },
});

export const discard = mutation({
  args: { id: v.id("bidshield_customAssemblyDrafts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { id };
  },
});

// ─── Bulk Operations ──────────────────────────────────────────────────────────

/**
 * Store multiple drafts from AI extraction in one batch.
 * Each draft item should have: displayName, extractedLayers, classificationAttempt,
 * sectionValues, canPromoteToArchetype, inferredCategory (optional).
 */
export const bulkCreate = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    drafts: v.array(v.any()),
  },
  handler: async (ctx, { projectId, userId, drafts }) => {
    const inserted = [];

    for (const draft of drafts) {
      const id = await ctx.db.insert("bidshield_customAssemblyDrafts", {
        projectId,
        userId,
        displayName: draft.displayName || draft.extractedLabel || "Unknown Assembly",
        archetypeId: "custom",
        archetypeVersion: 1,
        extractedLayers: draft.extractedLayers || [],
        sectionValues: draft.sectionValues || draft.draftSectionValues || {},
        classificationAttempt: draft.classificationAttempt || draft.classificationAttempts || null,
        canPromoteToArchetype: draft.canPromoteToArchetype ?? draft.canPromote ?? false,
        inferredCategory: draft.inferredCategory,
        needsReview: true,
        requiredSections: [],
        optionalSections: [],
        hiddenSections: [],
        defaultLayerOrder: [],
        validationRules: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      inserted.push({ id, label: draft.displayName || draft.extractedLabel || "Unknown" });
    }

    return {
      count: inserted.length,
      drafts: inserted,
    };
  },
});
