/**
 * Assembly Archetypes — Phase 3
 *
 * 10 stable seed archetypes + idempotent seeding + full query surface.
 *
 * Seed archetypes (by archetypeId):
 *   single_ply_tpo, single_ply_pvc, single_ply_epdm
 *   modified_bitumen_sbs, modified_bitumen_irma
 *   conventional_liquid_applied, liquid_applied_irma
 *   concrete_pavement_roof, built_up_panel_assembly, custom
 *
 * Seeding is idempotent:
 *   - Existing seeded records are updated in-place (archetypeId + version match)
 *   - User-created archetypes (not in SEED_IDS) are never touched
 *   - Re-running seed never creates duplicates
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Canonical set of seed archetypeIds — used to distinguish seeded vs user-created
const SEED_IDS = new Set([
  "single_ply_tpo",
  "single_ply_pvc",
  "single_ply_epdm",
  "modified_bitumen_sbs",
  "modified_bitumen_irma",
  "conventional_liquid_applied",
  "liquid_applied_irma",
  "concrete_pavement_roof",
  "built_up_panel_assembly",
  "custom",
]);

// ─── Queries ──────────────────────────────────────────────────────────────────

/** List all active (non-deprecated) archetypes. */
export const listActive = query({
  handler: async (ctx) => {
    return ctx.db
      .query("bidshield_assemblyArchetypes")
      .withIndex("by_deprecated", (q) => q.eq("deprecated", false))
      .collect();
  },
});

/** @deprecated Use listActive. Kept for backward compat with existing callers. */
export const listAll = query({
  handler: async (ctx) => {
    return ctx.db
      .query("bidshield_assemblyArchetypes")
      .withIndex("by_deprecated", (q) => q.eq("deprecated", false))
      .collect();
  },
});

/** List deprecated archetypes only. */
export const listDeprecated = query({
  handler: async (ctx) => {
    return ctx.db
      .query("bidshield_assemblyArchetypes")
      .withIndex("by_deprecated", (q) => q.eq("deprecated", true))
      .collect();
  },
});

/**
 * Get an archetype by archetypeId.
 * If version is omitted, returns the highest non-deprecated version.
 */
export const getByArchetypeId = query({
  args: { archetypeId: v.string(), version: v.optional(v.number()) },
  handler: async (ctx, { archetypeId, version }) => {
    if (version !== undefined) {
      return ctx.db
        .query("bidshield_assemblyArchetypes")
        .withIndex("by_archetypeId_version", (q) =>
          q.eq("archetypeId", archetypeId).eq("version", version)
        )
        .first();
    }
    const all = await ctx.db
      .query("bidshield_assemblyArchetypes")
      .withIndex("by_archetypeId", (q) => q.eq("archetypeId", archetypeId))
      .filter((q) => q.eq(q.field("deprecated"), false))
      .collect();
    if (all.length === 0) return null;
    return all.sort((a, b) => b.version - a.version)[0];
  },
});

/** Returns the current (highest non-deprecated) version number for an archetype. */
export const getCurrentVersion = query({
  args: { archetypeId: v.string() },
  handler: async (ctx, { archetypeId }) => {
    const all = await ctx.db
      .query("bidshield_assemblyArchetypes")
      .withIndex("by_archetypeId", (q) => q.eq("archetypeId", archetypeId))
      .filter((q) => q.eq(q.field("deprecated"), false))
      .collect();
    if (all.length === 0) return null;
    return all.sort((a, b) => b.version - a.version)[0].version;
  },
});

/**
 * Admin/dev verification query.
 * Returns a summary of all seeded archetypes: id, version, deprecated,
 * requiredSections, optionalSections, hiddenSections.
 * Safe to expose — read-only, no auth required (data is not user-specific).
 */
export const adminSummary = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("bidshield_assemblyArchetypes").collect();
    const seeded = all.filter((a) => SEED_IDS.has(a.archetypeId));
    const userCreated = all.filter((a) => !SEED_IDS.has(a.archetypeId));

    return {
      totalAll: all.length,
      totalSeeded: seeded.length,
      totalUserCreated: userCreated.length,
      totalActive: all.filter((a) => !a.deprecated).length,
      totalDeprecated: all.filter((a) => a.deprecated).length,
      seeded: seeded
        .sort((a, b) => a.archetypeId.localeCompare(b.archetypeId))
        .map((a) => ({
          archetypeId: a.archetypeId,
          version: a.version,
          label: a.label,
          category: a.category,
          deprecated: a.deprecated,
          requiredSections: a.requiredSections,
          optionalSections: a.optionalSections,
          hiddenSections: a.hiddenSections,
        })),
    };
  },
});

// ─── Seed Data ────────────────────────────────────────────────────────────────

const ARCHETYPE_SEEDS = [
  // ══════════════════════════════════════════════════════════════════════════
  // SINGLE-PLY SYSTEMS
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "single_ply_tpo",
    version: 1,
    label: "TPO Single-Ply Roof",
    category: "Single-Ply" as const,
    icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
    incompatibleSections: ["drainageMat", "filterFabric"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "TPO membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" as const },
      { sectionId: "drainage", message: "Drainage not specified — confirm drain type and overflow details.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install TPO single-ply membrane.",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply mechanically attached or fully adhered",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed TPO", "Ballast", "Pavers"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      highWindRated: true,
      solarCompatible: true,
      coldApplied: false,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "modified_bitumen"],
      requiredLayers: ["membrane", "insulationBoard"],
      excludeLayers: ["drainageMat", "filterFabric"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  {
    archetypeId: "single_ply_pvc",
    version: 1,
    label: "PVC Single-Ply Roof",
    category: "Single-Ply" as const,
    icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane"],
    validationRules: [
      { sectionId: "membrane", message: "PVC membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install PVC single-ply membrane.",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply mechanically attached or fully adhered",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed PVC"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      solarCompatible: true,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "modified_bitumen"],
      requiredLayers: ["membrane", "insulationBoard"],
      excludeLayers: ["drainageMat", "filterFabric"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  {
    archetypeId: "single_ply_epdm",
    version: 1,
    label: "EPDM Single-Ply Roof",
    category: "Single-Ply" as const,
    icon: "⬛",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "ballast", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "ballast"],
    validationRules: [
      { sectionId: "membrane", message: "EPDM membrane not specified.", severity: "error" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install EPDM single-ply membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Single-ply ballasted, mechanically attached, or adhered",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed EPDM", "Ballast"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "modified_bitumen", "bur"],
      requiredLayers: ["membrane", "insulationBoard"],
      excludeLayers: ["drainageMat", "filterFabric", "basePly", "capSheet"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MODIFIED BITUMEN
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "modified_bitumen_sbs",
    version: 1,
    label: "SBS/APP Modified Bitumen Roof",
    category: "Modified Bitumen" as const,
    icon: "🟫",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "Modified bitumen membrane not specified.", severity: "error" as const },
      { sectionId: "coverBoard", message: "Cover board not specified for modified bitumen.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Install modified bitumen membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Torch-applied or cold-applied modified bitumen",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Polyiso",
      commonSurfaces: ["Granule-surfaced cap sheet", "Mineral surfaced"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "single_ply"],
      requiredLayers: ["membrane", "insulationBoard"],
      excludeLayers: ["drainageMat", "filterFabric"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  {
    archetypeId: "modified_bitumen_irma",
    version: 1,
    label: "Modified Bitumen (IRMA/PMR)",
    category: "Protected Membrane" as const,
    icon: "🔷",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "membrane", message: "Modified bitumen membrane not specified.", severity: "error" as const },
      { sectionId: "drainageMat", message: "Drainage mat not detected — required for IRMA.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation above membrane not specified.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install modified bitumen membrane ({membrane}).",
      "Install protection board ({protectionBoard}).",
      "Install drainage mat ({drainageMat}).",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden.",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — modified bitumen with insulation above",
      membraneExposure: "Protected" as const,
      typicalInsulation: "XPS",
      commonSurfaces: ["Pavers", "Ballast", "Green roof"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: true,
      irmaCompatible: true,
    },
    classificationHints: {
      requiredKeywords: ["irma"],
      excludeKeywords: [],
      requiredLayers: ["membrane", "drainageMat", "insulationBoard", "filterFabric"],
      excludeLayers: [],
      requiresDrainageMat: true,
      requiresFilterFabric: true,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FLUID-APPLIED / LIQUID MEMBRANE
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "conventional_liquid_applied",
    version: 1,
    label: "Conventional Liquid Applied Membrane",
    category: "Fluid-Applied" as const,
    icon: "💧",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "Liquid-applied membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation below membrane not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.",
      "Install vapor retarder where required.",
      "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).",
      "Apply liquid-applied waterproofing membrane.",
      "Install roof drains and flashing.",
    ],
    metadata: {
      assemblyType: "Conventional liquid-applied — insulation below membrane",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Polyiso, XPS",
      commonSurfaces: ["Exposed membrane", "Cladding panel"],
      isProtectedMembrane: false,
      isRecoverable: true,
      greenRoofCompatible: false,
      irmaCompatible: false,
      coldApplied: true,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "protected_membrane"],
      requiredLayers: ["membrane", "insulationBoard"],
      excludeLayers: ["drainageMat", "filterFabric"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  {
    archetypeId: "liquid_applied_irma",
    version: 1,
    label: "Liquid Applied Membrane (IRMA)",
    category: "Protected Membrane" as const,
    icon: "🔷",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "membrane", message: "Waterproofing membrane not specified — required for IRMA.", severity: "error" as const },
      { sectionId: "drainageMat", message: "Drainage mat not detected — required for IRMA assembly.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation above membrane not specified — required for IRMA.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed — required above insulation in IRMA.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection sheet/board ({protectionBoard}) above membrane.",
      "Install drainage mat ({drainageMat}) above membrane assembly.",
      "Install insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden (ballast/pavers/green roof).",
      "Install overflow drains and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane — insulation above membrane",
      membraneExposure: "Protected" as const,
      typicalInsulation: "XPS (extruded polystyrene)",
      commonSurfaces: ["Concrete pavers on pedestals", "River ballast", "Green roof"],
      isProtectedMembrane: true,
      isRecoverable: true,
      greenRoofCompatible: true,
      irmaCompatible: true,
      coldApplied: true,
    },
    classificationHints: {
      requiredKeywords: ["irma"],
      excludeKeywords: [],
      requiredLayers: ["membrane", "drainageMat", "insulationBoard", "filterFabric"],
      excludeLayers: [],
      requiresDrainageMat: true,
      requiresFilterFabric: true,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HARDSCAPE / CONCRETE PAVEMENT
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "concrete_pavement_roof",
    version: 1,
    label: "Concrete Pavement Roof",
    category: "Hardscape" as const,
    icon: "⬜",
    requiredSections: ["deck", "membrane", "protectionBoard", "drainageMat", "gravelLayer", "concretePavement", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "insulation", "reinforcement", "rootBarrier", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "taperedInsulation", "filterFabric"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "gravelLayer", "reinforcement", "concretePavement"],
    validationRules: [
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" as const },
      { sectionId: "concretePavement", message: "Concrete pavement specification not provided.", severity: "error" as const },
      { sectionId: "protectionBoard", message: "Protection board not specified over membrane.", severity: "warning" as const },
      { sectionId: "gravelLayer", message: "Gravel layer not specified below concrete.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection board ({protectionBoard}).",
      "Install drainage mat ({drainageMat}).",
      "Install XPS insulation ({insulation}) if required.",
      "Install gravel leveling layer ({gravelLayer}).",
      "Place reinforcement ({reinforcement}).",
      "Pour cast-in-place concrete pavement ({concretePavement}).",
      "Install drainage and flashing.",
    ],
    metadata: {
      assemblyType: "Protected membrane with cast-in-place concrete overburden",
      membraneExposure: "Buried" as const,
      typicalInsulation: "XPS (optional)",
      commonSurfaces: ["Concrete plaza deck", "Traffic-rated pavement"],
      isProtectedMembrane: true,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: true,
      highTraffic: true,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: [],
      requiredLayers: ["membrane", "protectionBoard", "concretePavement"],
      excludeLayers: ["pedestals", "ballast"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SPECIAL ASSEMBLIES
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "built_up_panel_assembly",
    version: 1,
    label: "Built-Up Panel Assembly",
    category: "Custom" as const,
    icon: "📦",
    requiredSections: ["insulation", "coverBoard", "membrane", "surfacing"],
    optionalSections: ["deck", "vaporRetarder", "protectionBoard", "flashing", "penetrations", "edgeConditions"],
    hiddenSections: ["drainageMat", "filterFabric", "pedestals", "ballast", "greenRoof", "concretePavement", "drainage", "burPlies", "capSheet", "rootBarrier", "ballastRestraint", "growingMedia", "drainageLayer", "irrigation", "reinforcement", "taperedInsulation", "gravelLayer"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "error" as const },
      { sectionId: "coverBoard", message: "Cover board / substrate not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install insulation ({insulation}).",
      "Install cover board / substrate ({coverBoard}).",
      "Apply waterproofing membrane ({membrane}).",
      "Install cladding panel or finish system ({surfacing}).",
      "Install flashing and penetration details.",
    ],
    metadata: {
      assemblyType: "Panelized wall/soffit/screen assembly with waterproofing",
      membraneExposure: "Buried" as const,
      typicalInsulation: "Rigid insulation",
      commonSurfaces: ["Aluminum panel", "Rainscreen cladding", "Soffit panel"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: ["irma", "roof", "green"],
      requiredLayers: ["insulationBoard", "coverBoard", "membrane", "surfacing"],
      excludeLayers: ["drainageMat", "filterFabric", "pedestals", "ballast"],
      requiresDrainageMat: false,
      requiresFilterFabric: false,
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOM (FALLBACK)
  // ══════════════════════════════════════════════════════════════════════════

  {
    archetypeId: "custom",
    version: 1,
    label: "Custom Assembly",
    category: "Custom" as const,
    icon: "❓",
    requiredSections: [],
    optionalSections: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "drainageMat", "filterFabric", "protectionBoard", "pedestals", "ballast", "greenRoof", "surfacing", "drainage", "flashing", "penetrations", "edgeConditions", "concretePavement", "gravelLayer"],
    hiddenSections: [],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [],
    scopeTemplate: ["Custom assembly — review and specify all layers."],
    metadata: {
      assemblyType: "Custom or unclassified assembly",
      membraneExposure: "Exposed" as const,
      typicalInsulation: "Varies",
      commonSurfaces: ["Custom"],
      isProtectedMembrane: false,
      isRecoverable: false,
      greenRoofCompatible: false,
      irmaCompatible: false,
    },
    classificationHints: {
      requiredKeywords: [],
      excludeKeywords: [],
      requiredLayers: [],
      excludeLayers: [],
    },
    deprecated: false,
    replacesArchetypeId: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ─── Seed Mutation (idempotent) ───────────────────────────────────────────────

/**
 * Idempotent seed mutation.
 *
 * For each archetype in ARCHETYPE_SEEDS:
 *   - If a record with the same (archetypeId, version) already exists: patch it
 *   - If no record exists for that (archetypeId, version): insert it
 *   - User-created archetypes (not in SEED_IDS) are never touched
 *
 * Safe to run multiple times — never creates duplicates, never deletes.
 */
export const seed = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const results: { archetypeId: string; action: "inserted" | "updated" }[] = [];

    for (const archetype of ARCHETYPE_SEEDS) {
      // Look for exact (archetypeId, version) match
      const existing = await ctx.db
        .query("bidshield_assemblyArchetypes")
        .withIndex("by_archetypeId_version", (q) =>
          q.eq("archetypeId", archetype.archetypeId).eq("version", archetype.version)
        )
        .first();

      if (existing) {
        // Update in-place — preserve createdAt, update everything else
        await ctx.db.patch(existing._id, {
          label: archetype.label,
          category: archetype.category,
          icon: archetype.icon,
          requiredSections: [...archetype.requiredSections],
          optionalSections: [...archetype.optionalSections],
          hiddenSections: [...archetype.hiddenSections],
          incompatibleSections: "incompatibleSections" in archetype
            ? [...(archetype as any).incompatibleSections]
            : undefined,
          defaultLayerOrder: [...archetype.defaultLayerOrder],
          validationRules: archetype.validationRules.map((r) => ({ ...r })),
          scopeTemplate: [...archetype.scopeTemplate],
          metadata: { ...archetype.metadata },
          classificationHints: { ...archetype.classificationHints },
          deprecated: archetype.deprecated,
          updatedAt: now,
        });
        results.push({ archetypeId: archetype.archetypeId, action: "updated" });
      } else {
        await ctx.db.insert("bidshield_assemblyArchetypes", {
          ...archetype,
          replacesArchetypeId: undefined,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ archetypeId: archetype.archetypeId, action: "inserted" });
      }
    }

    const inserted = results.filter((r) => r.action === "inserted").length;
    const updated = results.filter((r) => r.action === "updated").length;

    return {
      status: inserted > 0 ? "seeded" : "updated",
      inserted,
      updated,
      total: results.length,
      archetypes: results,
    };
  },
});
