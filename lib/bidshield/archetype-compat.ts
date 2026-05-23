/**
 * Archetype Compatibility Layer — Phase 4A
 *
 * Bridges the legacy systemId/systemType world to the archetype system.
 * Pure utility — no Convex imports, no UI changes, no data migration.
 *
 * Usage:
 *   import { resolveAssemblyArchetype, legacyToArchetypeId } from "@/lib/bidshield/archetype-compat";
 *
 * This module is safe to call anywhere (client, server, Convex functions)
 * because it has zero runtime dependencies.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** All known legacy systemId / systemType values used in BidShield. */
export type LegacySystemId =
  | "tpo"
  | "pvc"
  | "epdm"
  | "sbs"
  | "sbs_irma"
  | "sbs_irma_green"
  | "app"
  | "app_irma"
  | "bur"
  | "lam"
  | "lam_irma"
  | "hydrotech"
  | "concrete"
  | "metal"
  | "spf"
  | "panel"
  | "custom"
  | (string & {}); // allow unknown strings, fall through to custom

/** All archetypeIds currently seeded in bidshield_assemblyArchetypes. */
export type KnownArchetypeId =
  | "single_ply_tpo"
  | "single_ply_pvc"
  | "single_ply_epdm"
  | "modified_bitumen_sbs"
  | "modified_bitumen_irma"
  | "conventional_liquid_applied"
  | "liquid_applied_irma"
  | "concrete_pavement_roof"
  | "built_up_panel_assembly"
  | "custom";

export interface ArchetypeResolution {
  /** Resolved archetypeId — always set (defaults to "custom"). */
  archetypeId: KnownArchetypeId;
  /** Archetype version — always 1 for current seed. */
  archetypeVersion: 1;
  /** The legacy systemId that was used for resolution (if any). */
  legacySystemId: string | undefined;
  /** How the archetype was resolved. */
  source: "explicit" | "mapped" | "fallback";
  /** True when the assembly was not mapped and fell back to "custom". */
  isFallback: boolean;
  /** True when the assembly needs manual review (unmapped or ambiguous). */
  needsReview: boolean;
  /** Human-readable debug explanation. */
  debugNote: string;
}

/** Minimal shape needed by resolveAssemblyArchetype. */
export interface ResolvableAssembly {
  archetypeId?: string | null;
  archetypeVersion?: number | null;
  systemType?: string | null;
  // Some older records use systemId instead of systemType
  systemId?: string | null;
}

// ─── Core mapping table ───────────────────────────────────────────────────────

/**
 * Canonical legacy systemId → archetypeId mapping.
 *
 * Rules:
 *  - tpo/pvc/epdm → single-ply variants
 *  - sbs/app (conventional) → modified_bitumen_sbs
 *  - sbs_irma / sbs_irma_green / app_irma → modified_bitumen_irma (IRMA wins)
 *  - lam (conventional) → conventional_liquid_applied
 *  - lam_irma → liquid_applied_irma
 *  - hydrotech → liquid_applied_irma (Hydrotech is a brand of LAM IRMA)
 *  - concrete → concrete_pavement_roof
 *  - bur / metal / spf → custom (not yet seeded as dedicated archetypes)
 *  - custom → custom
 *  - everything else → custom + needsReview
 */
export const LEGACY_SYSTEM_ID_MAP: Record<string, KnownArchetypeId> = {
  // ── Single-ply ─────────────────────────────────────────────────────────────
  tpo: "single_ply_tpo",
  pvc: "single_ply_pvc",
  epdm: "single_ply_epdm",

  // ── Modified bitumen — conventional ────────────────────────────────────────
  sbs: "modified_bitumen_sbs",
  app: "modified_bitumen_sbs",     // APP is a mod-bit variant

  // ── Modified bitumen — IRMA / PMR ──────────────────────────────────────────
  sbs_irma: "modified_bitumen_irma",
  sbs_irma_green: "modified_bitumen_irma",   // green roof overburden doesn't change membrane type
  app_irma: "modified_bitumen_irma",

  // ── Liquid-applied — conventional ──────────────────────────────────────────
  lam: "conventional_liquid_applied",

  // ── Liquid-applied — IRMA / PMR ────────────────────────────────────────────
  lam_irma: "liquid_applied_irma",
  hydrotech: "liquid_applied_irma",           // Hydrotech = Henry 790 brand of LAM IRMA

  // ── Hardscape ──────────────────────────────────────────────────────────────
  concrete: "concrete_pavement_roof",

  // ── Not yet seeded — map to custom until dedicated archetypes added ─────────
  bur: "custom",     // Built-up roofing — planned Phase 5 archetype
  metal: "custom",   // Metal panel — planned Phase 5 archetype
  spf: "custom",     // Spray polyurethane foam — planned Phase 5 archetype

  // ── Cladding / wall panel assembly ─────────────────────────────────────────
  panel: "built_up_panel_assembly",

  // ── Explicit fallback ───────────────────────────────────────────────────────
  custom: "custom",
};

/**
 * Reverse map: archetypeId → primary legacy systemId.
 * Not all archetypes have a single canonical systemId
 * (e.g. modified_bitumen_irma covers sbs_irma + app_irma).
 * Returns the most common / canonical legacy value.
 */
export const ARCHETYPE_ID_TO_LEGACY_SYSTEM_ID: Partial<Record<KnownArchetypeId, string>> = {
  single_ply_tpo: "tpo",
  single_ply_pvc: "pvc",
  single_ply_epdm: "epdm",
  modified_bitumen_sbs: "sbs",
  modified_bitumen_irma: "sbs_irma",
  conventional_liquid_applied: "lam",
  liquid_applied_irma: "lam_irma",
  concrete_pavement_roof: "concrete",
  built_up_panel_assembly: "panel",
  custom: "custom",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Map a legacy systemId string → archetypeId.
 *
 * Case-insensitive. Trims whitespace. Unknown values → "custom".
 */
export function legacyToArchetypeId(systemId: string | null | undefined): KnownArchetypeId {
  if (!systemId) return "custom";
  const normalized = systemId.trim().toLowerCase();
  return LEGACY_SYSTEM_ID_MAP[normalized] ?? "custom";
}

/**
 * Map an archetypeId → the primary legacy systemId.
 * Returns undefined for archetypes with no direct legacy equivalent.
 */
export function archetypeIdToLegacy(archetypeId: string | null | undefined): string | undefined {
  if (!archetypeId) return undefined;
  return ARCHETYPE_ID_TO_LEGACY_SYSTEM_ID[archetypeId as KnownArchetypeId];
}

/**
 * Resolves the archetype for an assembly object.
 *
 * Resolution order:
 *  1. assembly.archetypeId (already migrated) → use directly
 *  2. assembly.systemType → map via LEGACY_SYSTEM_ID_MAP
 *  3. assembly.systemId → map via LEGACY_SYSTEM_ID_MAP
 *  4. Fallback → "custom" with needsReview = true
 *
 * Never throws. Always returns a valid ArchetypeResolution.
 */
export function resolveAssemblyArchetype(assembly: ResolvableAssembly): ArchetypeResolution {
  // ── Path 1: explicit archetypeId already set ─────────────────────────────
  if (assembly.archetypeId) {
    const knownId = assembly.archetypeId as KnownArchetypeId;
    return {
      archetypeId: knownId,
      archetypeVersion: 1,
      legacySystemId: archetypeIdToLegacy(knownId),
      source: "explicit",
      isFallback: false,
      needsReview: false,
      debugNote: `Explicit archetypeId "${knownId}" used directly.`,
    };
  }

  // ── Path 2: resolve from systemType ──────────────────────────────────────
  const rawSystemId = assembly.systemType ?? assembly.systemId;

  if (rawSystemId) {
    const normalized = rawSystemId.trim().toLowerCase();
    const mapped = LEGACY_SYSTEM_ID_MAP[normalized];

    if (mapped) {
      const isFallbackCustom = mapped === "custom" && normalized !== "custom";
      return {
        archetypeId: mapped,
        archetypeVersion: 1,
        legacySystemId: normalized,
        source: "mapped",
        isFallback: isFallbackCustom,
        needsReview: isFallbackCustom,
        debugNote: isFallbackCustom
          ? `Legacy systemId "${normalized}" has no dedicated archetype yet — mapped to "custom". Review needed.`
          : `Legacy systemId "${normalized}" mapped to archetype "${mapped}".`,
      };
    }

    // Unknown systemId — custom fallback
    return {
      archetypeId: "custom",
      archetypeVersion: 1,
      legacySystemId: normalized,
      source: "fallback",
      isFallback: true,
      needsReview: true,
      debugNote: `Unknown systemId "${normalized}" — no mapping found. Falling back to "custom". Review needed.`,
    };
  }

  // ── Path 3: no systemId at all ────────────────────────────────────────────
  return {
    archetypeId: "custom",
    archetypeVersion: 1,
    legacySystemId: undefined,
    source: "fallback",
    isFallback: true,
    needsReview: true,
    debugNote: "No archetypeId or systemId present on assembly. Falling back to \"custom\". Review needed.",
  };
}

// ─── Debug helpers ────────────────────────────────────────────────────────────

/**
 * Returns a compact debug string for logging / audit trails.
 *
 * Example output:
 *   "[archetype-compat] sbs → modified_bitumen_sbs v1 (mapped)"
 *   "[archetype-compat] lam_irma → liquid_applied_irma v1 (mapped)"
 *   "[archetype-compat] metal → custom v1 (fallback, needs-review)"
 */
export function formatArchetypeResolution(resolution: ArchetypeResolution): string {
  const src = resolution.source === "explicit"
    ? "explicit"
    : resolution.isFallback
      ? "fallback, needs-review"
      : "mapped";

  const legacyPart = resolution.legacySystemId
    ? `${resolution.legacySystemId} → `
    : "(no systemId) → ";

  return `[archetype-compat] ${legacyPart}${resolution.archetypeId} v${resolution.archetypeVersion} (${src})`;
}

/**
 * Debug summary for a batch of assemblies.
 * Returns a structured report suitable for logging or admin UI.
 */
export function debugArchetypeResolutions(
  assemblies: ResolvableAssembly[],
  labels?: string[],
): {
  total: number;
  resolved: number;
  fallbacks: number;
  needsReview: number;
  rows: {
    label: string;
    legacySystemId: string | undefined;
    archetypeId: KnownArchetypeId;
    archetypeVersion: number;
    source: string;
    isFallback: boolean;
    needsReview: boolean;
    note: string;
  }[];
} {
  const rows = assemblies.map((asm, i) => {
    const r = resolveAssemblyArchetype(asm);
    return {
      label: labels?.[i] ?? `assembly[${i}]`,
      legacySystemId: r.legacySystemId,
      archetypeId: r.archetypeId,
      archetypeVersion: r.archetypeVersion,
      source: r.source,
      isFallback: r.isFallback,
      needsReview: r.needsReview,
      note: r.debugNote,
    };
  });

  return {
    total: rows.length,
    resolved: rows.filter((r) => !r.isFallback).length,
    fallbacks: rows.filter((r) => r.isFallback).length,
    needsReview: rows.filter((r) => r.needsReview).length,
    rows,
  };
}
