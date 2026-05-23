/**
 * V2 Archetype Scoring Engine
 *
 * Classifies a list of raw layer strings against known archetypes.
 * Pure function — no side effects, no Convex, no HTTP.
 *
 * Algorithm:
 *   1. Normalize layers via normalizeLayers() -> canonical tokens
 *   2. Surface hint overrides (concrete_pavement, panel) take priority
 *   3. Score all archetypes via token matching + keyword matching
 *   4. Return winner + full audit trail
 *
 * Scoring weights:
 *   Required layer tokens matched: 0-60 pts
 *   Drainage mat bonus:            0-15 pts
 *   Filter fabric bonus:           0-10 pts
 *   Keyword match:                 0-15 pts
 *   Total max:                     100 pts
 *
 * Thresholds:
 *   >= 75 pts  -> high confidence (needsReview=false)
 *   55-74 pts  -> medium confidence (needsReview=false but flagged)
 *   < 55 pts   -> needs review, falls back to custom
 */

import { normalizeLayers, type CanonicalLayerToken } from "./layer-normalization";
import { ARCHETYPE_FORM_SCHEMAS } from "./archetype-form-bridge";

// ─── Token Rules ──────────────────────────────────────────────────────────────

const ARCHETYPE_TOKEN_RULES: Record<
  string,
  {
    requiredTokens: CanonicalLayerToken[];
    bonusTokens: CanonicalLayerToken[];
    disqualifyTokens: CanonicalLayerToken[];
    keywords: string[];
    disqualifyKeywords: string[];
  }
> = {
  liquid_applied_irma: {
    requiredTokens: ["membrane", "drainageMat"],
    bonusTokens: ["filterFabric", "insulationBoard"],
    disqualifyTokens: ["basePly", "capSheet"],
    keywords: ["irma", "pmr", "inverted roof", "protected membrane", "plaza deck"],
    disqualifyKeywords: ["concrete pavement", "cast-in-place", "concrete paving", "pedestal", "ballast", "green roof", "vegetated"],
  },

  // ── IRMA sub-types — overburden-specific ─────────────────────────────────────
  // These are scored first via priority ordering. The presence of semantic
  // signals (pedestal/ballast/green roof) beats generic liquid_applied_irma.

  pedestal_paver_irma: {
    requiredTokens: ["membrane", "drainageMat", "pedestals"],
    bonusTokens: ["filterFabric", "insulationBoard", "pavers"],
    disqualifyTokens: ["basePly", "capSheet", "ballast", "greenRoof"],
    keywords: ["pedestal", "pavers on pedestal", "wood tiles on pedestal", "adjustable pedestal", "pedestal system"],
    disqualifyKeywords: ["concrete pavement", "cast-in-place", "green roof", "vegetated"],
  },

  green_roof_irma: {
    requiredTokens: ["membrane", "drainageMat", "greenRoof"],
    bonusTokens: ["filterFabric", "rootBarrier", "insulationBoard"],
    disqualifyTokens: ["basePly", "capSheet", "pedestals", "ballast"],
    keywords: ["green roof", "vegetated roof", "sustainable roof", "planting media", "root barrier", "growth medium", "growing media"],
    disqualifyKeywords: ["concrete pavement", "cast-in-place", "pedestal", "ballast"],
  },

  ballast_paver_irma: {
    requiredTokens: ["membrane", "drainageMat", "ballast"],
    bonusTokens: ["filterFabric", "insulationBoard", "pavers"],
    disqualifyTokens: ["basePly", "capSheet", "pedestals", "greenRoof"],
    keywords: ["ballast", "paver ballast", "lock-down paver ballast", "concrete paver ballast", "river ballast"],
    disqualifyKeywords: ["concrete pavement", "cast-in-place", "green roof", "vegetated", "pedestal"],
  },
  conventional_liquid_applied: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "vaporRetarder"],
    disqualifyTokens: ["basePly", "capSheet"],
    keywords: ["liquid applied", "fluid applied", "waterproofing membrane", "lam"],
    disqualifyKeywords: ["drainage mat", "filter fabric", "irma", "pmr"],
  },
  concrete_pavement_roof: {
    requiredTokens: ["membrane"],
    bonusTokens: ["protectionBoard", "drainageMat", "insulationBoard"],
    disqualifyTokens: ["filterFabric", "pedestals", "ballast", "pavers"],
    keywords: [
      "concrete pavement",
      "cast-in-place",
      "concrete paving",
      "concrete slab",
      "concrete_pavement",
      "plaza pavement",
    ],
    disqualifyKeywords: [],
  },
  built_up_panel_assembly: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "surfacing"],
    disqualifyTokens: ["drainageMat", "filterFabric", "ballast", "pedestals"],
    keywords: [
      "aluminum panel",
      "cladding panel",
      "panel assembly",
      "curtain wall",
      "densglass",
      "cementitious board",
      "dens-glass",
    ],
    disqualifyKeywords: [],
  },
  single_ply_tpo: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "vaporRetarder"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["tpo", "thermoplastic polyolefin"],
    disqualifyKeywords: ["modified bitumen", "sbs", "app", "irma"],
  },
  single_ply_pvc: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["pvc"],
    disqualifyKeywords: ["irma"],
  },
  single_ply_epdm: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "ballast"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["epdm", "rubber membrane", "epdm membrane"],
    disqualifyKeywords: ["irma"],
  },
  modified_bitumen_sbs: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "capSheet"],
    disqualifyTokens: ["drainageMat", "filterFabric"],
    keywords: ["sbs", "app", "modified bitumen", "mod bit", "torch applied", "sheet membrane"],
    disqualifyKeywords: ["irma", "pmr"],
  },
  modified_bitumen_irma: {
    requiredTokens: ["membrane", "drainageMat"],
    bonusTokens: ["filterFabric", "insulationBoard", "protectionBoard"],
    disqualifyTokens: ["basePly"],
    keywords: ["sbs irma", "modified bitumen irma", "irma", "pmr"],
    disqualifyKeywords: ["concrete pavement", "cast-in-place"],
  },
};

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface ScoringBreakdown {
  layerScore: number;
  drainageMatScore: number;
  filterFabricScore: number;
  keywordScore: number;
  totalScore: number;
}

export interface AttemptedArchetype {
  archetypeId: string;
  score: number;
  reason: string;
  disqualified: boolean;
}

export interface ClassificationAuditV2 {
  scoringBreakdown: ScoringBreakdown;
  matchedLayers: string[]; // canonical token names that matched
  rejectedLayers: string[]; // required tokens that did NOT match
  matchedKeywords: string[];
  attemptedArchetypes: AttemptedArchetype[];
  normalizedLayerTokens: string[]; // all canonical tokens found
  unmatchedLayers: string[]; // raw layer strings that didn't normalize
  normalizationConfidence: number[]; // per-token confidence scores
  timestamp: number;
}

export interface ClassificationResultV2 {
  archetypeId: string;
  archetypeVersion: number;
  confidence: number; // 0.0 - 1.0
  needsReview: boolean;
  audit: ClassificationAuditV2;
  // Snapshot from ARCHETYPE_FORM_SCHEMAS at classification time
  requiredSectionsSnapshot: string[];
  optionalSectionsSnapshot: string[];
  hiddenSectionsSnapshot: string[];
  defaultLayerOrderSnapshot: string[];
}

// ─── Token Aliases ────────────────────────────────────────────────────────────
//
// Some canonical tokens are contextual synonyms. "waterproofing" is the LAM /
// plaza-deck variant of "membrane" — both represent the primary waterproofing
// layer. When scoring, treat "waterproofing" as satisfying a "membrane"
// requirement (and vice-versa).

const TOKEN_ALIASES: Record<string, CanonicalLayerToken[]> = {
  membrane: ["waterproofing"],
  waterproofing: ["membrane"],
};

/** Expand a token set with its aliases so that alias tokens satisfy requirements. */
function expandWithAliases(tokens: CanonicalLayerToken[]): CanonicalLayerToken[] {
  const expanded = new Set<CanonicalLayerToken>(tokens);
  for (const t of tokens) {
    const aliases = TOKEN_ALIASES[t];
    if (aliases) {
      for (const alias of aliases) {
        expanded.add(alias);
      }
    }
  }
  return Array.from(expanded);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Build a defaultLayerOrder from a schema's required + optional sections. */
function buildDefaultLayerOrder(archetypeId: string): string[] {
  const schema = ARCHETYPE_FORM_SCHEMAS[archetypeId] ?? ARCHETYPE_FORM_SCHEMAS["custom"];
  if (!schema) return [];
  // required sections first, then optional — deduplicated
  const seen = new Set<string>();
  const order: string[] = [];
  for (const s of [...schema.requiredSections, ...schema.optionalSections]) {
    if (!seen.has(s)) {
      seen.add(s);
      order.push(s);
    }
  }
  return order;
}

/** Retrieve section snapshots for the given archetypeId, falling back to custom. */
function getSectionSnapshots(archetypeId: string): {
  requiredSectionsSnapshot: string[];
  optionalSectionsSnapshot: string[];
  hiddenSectionsSnapshot: string[];
  defaultLayerOrderSnapshot: string[];
} {
  const schema =
    ARCHETYPE_FORM_SCHEMAS[archetypeId] ?? ARCHETYPE_FORM_SCHEMAS["custom"];

  const requiredSectionsSnapshot = schema?.requiredSections ?? [];
  const optionalSectionsSnapshot = schema?.optionalSections ?? [];
  const hiddenSectionsSnapshot = schema?.hiddenSections ?? [];
  const defaultLayerOrderSnapshot = buildDefaultLayerOrder(archetypeId);

  return {
    requiredSectionsSnapshot,
    optionalSectionsSnapshot,
    hiddenSectionsSnapshot,
    defaultLayerOrderSnapshot,
  };
}

/** Score a single archetype against the provided token set and layer text. */
function scoreArchetype(
  archetypeId: string,
  tokensRaw: CanonicalLayerToken[],
  layerText: string,
): {
  score: number;
  breakdown: ScoringBreakdown;
  matchedLayers: string[];
  rejectedLayers: string[];
  matchedKeywords: string[];
  disqualified: boolean;
  reason: string;
} {
  const rule = ARCHETYPE_TOKEN_RULES[archetypeId];
  if (!rule) {
    return {
      score: 0,
      breakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
      matchedLayers: [],
      rejectedLayers: [],
      matchedKeywords: [],
      disqualified: true,
      reason: "No rule defined for archetype",
    };
  }

  // Expand with aliases (e.g. "waterproofing" satisfies "membrane" requirements)
  const tokens = expandWithAliases(tokensRaw);

  const lowerText = layerText.toLowerCase();

  // ── Disqualify by tokens ───────────────────────────────────────────────────
  for (const dq of rule.disqualifyTokens) {
    if (tokens.includes(dq)) {
      return {
        score: 0,
        breakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
        matchedLayers: [],
        rejectedLayers: rule.requiredTokens,
        matchedKeywords: [],
        disqualified: true,
        reason: `Disqualified: token '${dq}' present`,
      };
    }
  }

  // ── Disqualify by keywords ─────────────────────────────────────────────────
  for (const dkw of rule.disqualifyKeywords) {
    if (lowerText.includes(dkw.toLowerCase())) {
      return {
        score: 0,
        breakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
        matchedLayers: [],
        rejectedLayers: rule.requiredTokens,
        matchedKeywords: [],
        disqualified: true,
        reason: `Disqualified: keyword '${dkw}' found in layer text`,
      };
    }
  }

  // ── Required token scoring ─────────────────────────────────────────────────
  const matchedLayers: string[] = [];
  const rejectedLayers: string[] = [];
  for (const req of rule.requiredTokens) {
    if (tokens.includes(req)) {
      matchedLayers.push(req);
    } else {
      rejectedLayers.push(req);
    }
  }
  const layerScore =
    rule.requiredTokens.length > 0
      ? (matchedLayers.length / rule.requiredTokens.length) * 60
      : 0;

  // ── Bonus tokens ──────────────────────────────────────────────────────────
  const drainageMatScore =
    rule.bonusTokens.includes("drainageMat") && tokens.includes("drainageMat") ? 15 : 0;
  const filterFabricScore =
    rule.bonusTokens.includes("filterFabric") && tokens.includes("filterFabric") ? 10 : 0;

  // ── Keyword scoring ───────────────────────────────────────────────────────
  const matchedKeywords: string[] = [];
  for (const kw of rule.keywords) {
    if (lowerText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    }
  }
  const keywordScore =
    rule.keywords.length > 0
      ? Math.min((matchedKeywords.length / rule.keywords.length) * 15, 15)
      : 0;

  const totalScore = layerScore + drainageMatScore + filterFabricScore + keywordScore;

  return {
    score: totalScore,
    breakdown: {
      layerScore,
      drainageMatScore,
      filterFabricScore,
      keywordScore,
      totalScore,
    },
    matchedLayers,
    rejectedLayers,
    matchedKeywords,
    disqualified: false,
    reason: `Score: ${totalScore.toFixed(1)} pts`,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function classifyLayersV2(
  rawLayers: string[],
  surfaceHint?: string | null,
  labelHint?: string | null,
): ClassificationResultV2 {
  const timestamp = Date.now();

  // ── Normalize layers ───────────────────────────────────────────────────────
  const { normalizedLayers, canonicalTokens, unmatchedLayers } = normalizeLayers(rawLayers);

  // Concatenate all raw + label text for keyword scanning
  const allText = [
    ...rawLayers,
    labelHint ?? "",
    surfaceHint ?? "",
  ].join(" ");

  const normalizedLayerTokens = canonicalTokens as string[];
  const normalizationConfidence = normalizedLayers
    .filter((nl) => nl.canonicalToken !== null)
    .map((nl) => nl.confidence);

  // ── Semantic signal detection ─────────────────────────────────────────────
  //
  // All detection is based on normalized canonical tokens or exact phrase
  // matching against the combined layer text. No project-specific logic.
  // Signal priority (highest first):
  //   1. built_up_panel_assembly  (panel/DensGlass/cementitious board)
  //   2. green_roof_irma          (green roof / vegetated / root barrier)
  //   3. pedestal_paver_irma      (pedestal / pavers on pedestal)
  //   4. ballast_paver_irma       (ballast / paver ballast — NOT concrete pavers)
  //   5. concrete_pavement_roof   (exact phrase: concrete pavement / CIP)
  //   6. Scoring engine for all remaining archetypes

  const tokens = canonicalTokens;

  // Panel: semantic signals — aluminum panel, DensGlass, cementitious board, curtain wall
  // Must NOT have drainage mat or filter fabric (those indicate IRMA, not panel)
  const isPanelAssembly =
    surfaceHint === "panel" ||
    (
      (/aluminum[\s_-]?panel|cladding[\s_-]?panel|curtain[\s_-]?wall|metal[\s_-]?panel/i.test(allText) ||
       /dens[\s-]?glass|cementitious[\s_-]?board/i.test(allText)) &&
      !tokens.includes("drainageMat" as CanonicalLayerToken) &&
      !tokens.includes("filterFabric" as CanonicalLayerToken)
    );

  // Green roof: semantic signals — green roof token, root barrier, vegetated, planting media
  const isGreenRoof =
    tokens.includes("greenRoof" as CanonicalLayerToken) ||
    tokens.includes("rootBarrier" as CanonicalLayerToken) ||
    /\bgreen[\s_-]?roof\b/i.test(allText) ||
    /vegetated[\s_-]?roof/i.test(allText) ||
    /planting[\s_-]?media|growth[\s_-]?medi/i.test(allText);

  // Pedestal: semantic signals — pedestal token or phrase containing "pedestal"
  // Disallow if ballast or green roof is primary signal
  const hasPedestal =
    tokens.includes("pedestals" as CanonicalLayerToken) ||
    /\bpedestal/i.test(allText);

  // Ballast: semantic signals — ballast token
  // Covers: river ballast, paver ballast, lock-down paver ballast, concrete paver ballast
  // Does NOT fire on "concrete pavement" alone (no ballast token there)
  const hasBallast =
    tokens.includes("ballast" as CanonicalLayerToken);

  // Concrete pavement: EXACT phrase only.
  // "concrete paver" / "concrete slab" / "concrete deck" do NOT trigger this.
  // Required: drainageMat token present (prevents false positives from bare labels)
  const hasDrainageMat = tokens.includes("drainageMat" as CanonicalLayerToken);
  const hasExactConcretePavement =
    surfaceHint === "concrete_pavement" ||
    /\bconcrete[\s_-]?pavement\b/i.test(allText) ||
    /cast[\s-]*in[\s-]*place[\s_-]?concrete/i.test(allText) ||
    /\bcip[\s_-]?concrete[\s_-]?pav/i.test(allText) ||
    /\bcip[\s_-]?pavement\b/i.test(allText);

  // ── Priority overrides (checked in order, first match wins) ──────────────

  function makeOverrideResult(overrideId: string, conf: number) {
    const snapshots = getSectionSnapshots(overrideId);
    return {
      archetypeId: overrideId,
      archetypeVersion: 2,
      confidence: conf,
      needsReview: conf < 0.55,
      audit: {
        scoringBreakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
        matchedLayers: [],
        rejectedLayers: [],
        matchedKeywords: [],
        attemptedArchetypes: [],
        normalizedLayerTokens,
        unmatchedLayers,
        normalizationConfidence,
        timestamp,
      },
      ...snapshots,
    };
  }

  // 1. Panel assembly
  if (isPanelAssembly) return makeOverrideResult("built_up_panel_assembly", 0.92);

  // 2. Green roof IRMA (requires drainage mat to confirm IRMA stack)
  if (isGreenRoof && hasDrainageMat) return makeOverrideResult("green_roof_irma", 0.93);

  // 3. Pedestal paver IRMA (requires drainage mat to confirm IRMA stack)
  if (hasPedestal && hasDrainageMat && !isGreenRoof) return makeOverrideResult("pedestal_paver_irma", 0.93);

  // 4. Ballast paver IRMA (requires drainage mat to confirm IRMA stack)
  if (hasBallast && hasDrainageMat && !hasPedestal && !isGreenRoof) return makeOverrideResult("ballast_paver_irma", 0.90);

  // 5. Concrete pavement roof (exact phrase only)
  if (hasExactConcretePavement) return makeOverrideResult("concrete_pavement_roof", 0.95);

  // ── Score all archetypes ───────────────────────────────────────────────────
  const attemptedArchetypes: AttemptedArchetype[] = [];

  const scoredArchetypes = Object.keys(ARCHETYPE_TOKEN_RULES).map((archetypeId) => {
    const result = scoreArchetype(archetypeId, canonicalTokens, allText);
    attemptedArchetypes.push({
      archetypeId,
      score: result.score,
      reason: result.reason,
      disqualified: result.disqualified,
    });
    return { archetypeId, ...result };
  });

  // Sort by score descending
  scoredArchetypes.sort((a, b) => b.score - a.score);

  // ── Winner selection ───────────────────────────────────────────────────────
  const top = scoredArchetypes[0];
  const topScore = top?.score ?? 0;

  let winnerId: string;
  let confidence: number;
  let winnerBreakdown: ScoringBreakdown;
  let winnerMatchedLayers: string[];
  let winnerRejectedLayers: string[];
  let winnerMatchedKeywords: string[];

  if (topScore < 55) {
    winnerId = "custom";
    confidence = topScore / 100;
    winnerBreakdown = { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 };
    winnerMatchedLayers = [];
    winnerRejectedLayers = [];
    winnerMatchedKeywords = [];
  } else {
    winnerId = top.archetypeId;
    confidence = topScore / 100;
    winnerBreakdown = top.breakdown;
    winnerMatchedLayers = top.matchedLayers;
    winnerRejectedLayers = top.rejectedLayers;
    winnerMatchedKeywords = top.matchedKeywords;
  }

  const needsReview = confidence < 0.55;
  const snapshots = getSectionSnapshots(winnerId);

  return {
    archetypeId: winnerId,
    archetypeVersion: 2,
    confidence,
    needsReview,
    audit: {
      scoringBreakdown: winnerBreakdown,
      matchedLayers: winnerMatchedLayers,
      rejectedLayers: winnerRejectedLayers,
      matchedKeywords: winnerMatchedKeywords,
      attemptedArchetypes,
      normalizedLayerTokens,
      unmatchedLayers,
      normalizationConfidence,
      timestamp,
    },
    ...snapshots,
  };
}
