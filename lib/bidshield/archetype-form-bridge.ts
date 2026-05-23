/**
 * archetype-form-bridge.ts
 *
 * Pure utility that maps archetypeId -> section visibility schema.
 *
 * This file is READ-ONLY infrastructure for the enableArchetypeDrivenForms
 * feature flag. The flag is OFF by default — no runtime behavior changes
 * until it is explicitly enabled.
 *
 * Section schemas are copied verbatim from the ARCHETYPE_SEEDS array in
 * convex/bidshield/assemblyArchetypes.ts.
 */

// ─── Feature Flag ─────────────────────────────────────────────────────────────

/**
 * Feature flag — OFF by default, no runtime behavior change.
 * Flip to `true` to enable archetype-driven form section visibility.
 */
export const ENABLE_ARCHETYPE_DRIVEN_FORMS = false;

// ─── Schema Interface ─────────────────────────────────────────────────────────

export interface ArchetypeFormSchema {
  archetypeId: string;
  requiredSections: string[];
  optionalSections: string[];
  hiddenSections: string[];
}

// ─── Static Schemas ───────────────────────────────────────────────────────────
//
// Copied exactly from convex/bidshield/assemblyArchetypes.ts ARCHETYPE_SEEDS.
// Do not diverge from those definitions without updating both files.

export const ARCHETYPE_FORM_SCHEMAS: Record<string, ArchetypeFormSchema> = {
  // ── Single-Ply ──────────────────────────────────────────────────────────────

  single_ply_tpo: {
    archetypeId: "single_ply_tpo",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
  },

  single_ply_pvc: {
    archetypeId: "single_ply_pvc",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
  },

  single_ply_epdm: {
    archetypeId: "single_ply_epdm",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "ballast", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard", "gravelLayer"],
  },

  // ── Modified Bitumen ────────────────────────────────────────────────────────

  modified_bitumen_sbs: {
    archetypeId: "modified_bitumen_sbs",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard", "gravelLayer"],
  },

  modified_bitumen_irma: {
    archetypeId: "modified_bitumen_irma",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "gravelLayer"],
  },

  // ── Fluid-Applied / Liquid Membrane ─────────────────────────────────────────

  conventional_liquid_applied: {
    archetypeId: "conventional_liquid_applied",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "gravelLayer"],
  },

  liquid_applied_irma: {
    archetypeId: "liquid_applied_irma",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "gravelLayer"],
  },

  // ── Hardscape / Concrete Pavement ───────────────────────────────────────────
  //
  // hiddenSections includes: filterFabric, pedestals, ballast, ballastRestraint,
  // coverBoard, burPlies, capSheet, surfacing, growingMedia, drainageLayer,
  // irrigation, taperedInsulation  (plus greenRoof per seed data)

  concrete_pavement_roof: {
    archetypeId: "concrete_pavement_roof",
    requiredSections: ["deck", "membrane", "protectionBoard", "drainageMat", "gravelLayer", "concretePavement", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "insulation", "reinforcement", "rootBarrier", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "taperedInsulation", "filterFabric"],
  },

  // ── Special Assemblies ──────────────────────────────────────────────────────
  //
  // hiddenSections includes: drainageMat, filterFabric, pedestals, ballast,
  // greenRoof, concretePavement, drainage, burPlies, capSheet, rootBarrier,
  // ballastRestraint, growingMedia, drainageLayer, irrigation, reinforcement,
  // taperedInsulation, gravelLayer

  built_up_panel_assembly: {
    archetypeId: "built_up_panel_assembly",
    requiredSections: ["insulation", "coverBoard", "membrane", "surfacing"],
    optionalSections: ["deck", "vaporRetarder", "protectionBoard", "flashing", "penetrations", "edgeConditions"],
    hiddenSections: ["drainageMat", "filterFabric", "pedestals", "ballast", "greenRoof", "concretePavement", "drainage", "burPlies", "capSheet", "rootBarrier", "ballastRestraint", "growingMedia", "drainageLayer", "irrigation", "reinforcement", "taperedInsulation", "gravelLayer"],
  },

  // ── Custom (Fallback) ───────────────────────────────────────────────────────

  custom: {
    archetypeId: "custom",
    requiredSections: [],
    optionalSections: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "drainageMat", "filterFabric", "protectionBoard", "pedestals", "ballast", "greenRoof", "surfacing", "drainage", "flashing", "penetrations", "edgeConditions", "concretePavement", "gravelLayer"],
    hiddenSections: [],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the ArchetypeFormSchema for the given archetypeId when the feature
 * flag is ON and the archetypeId is known.
 *
 * Returns null when:
 *   - ENABLE_ARCHETYPE_DRIVEN_FORMS is false (flag OFF), or
 *   - archetypeId is undefined/null, or
 *   - archetypeId is not found in ARCHETYPE_FORM_SCHEMAS.
 */
export function getArchetypeFormSchema(
  archetypeId: string | undefined
): ArchetypeFormSchema | null {
  if (!ENABLE_ARCHETYPE_DRIVEN_FORMS) return null;
  if (!archetypeId) return null;
  return ARCHETYPE_FORM_SCHEMAS[archetypeId] ?? null;
}

/**
 * Resolves form section visibility, preferring archetype-driven schemas when
 * the feature flag is ON.
 *
 * Returns null when:
 *   - ENABLE_ARCHETYPE_DRIVEN_FORMS is false  → caller uses legacy behavior
 *   - archetypeId is not found in ARCHETYPE_FORM_SCHEMAS
 *
 * Returns the archetype schema sections when:
 *   - Flag is ON and archetypeId resolves to a known schema
 *
 * @param archetypeId  - The archetype identifier (e.g. "concrete_pavement_roof")
 * @param legacySystemId - The legacy system id (e.g. "tpo") — currently unused
 *                         but kept for future fallback logic when the flag is ON.
 */
export function resolveFormSections(
  archetypeId: string | undefined,
  legacySystemId: string | undefined // eslint-disable-line @typescript-eslint/no-unused-vars
): { requiredSections: string[]; optionalSections: string[]; hiddenSections: string[] } | null {
  if (!ENABLE_ARCHETYPE_DRIVEN_FORMS) return null;

  const schema = archetypeId ? ARCHETYPE_FORM_SCHEMAS[archetypeId] : undefined;
  if (!schema) return null;

  return {
    requiredSections: schema.requiredSections,
    optionalSections: schema.optionalSections,
    hiddenSections: schema.hiddenSections,
  };
}
