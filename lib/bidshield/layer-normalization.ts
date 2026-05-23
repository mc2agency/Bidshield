/**
 * Layer Normalization & Synonym System
 *
 * Handles inconsistent terminology across architects and consultants.
 * Normalizes raw OCR/extracted text into canonical layer tokens before
 * classification scoring.
 *
 * Benefits:
 *  - OCR tolerance
 *  - Consultant variation handling
 *  - Future ML training quality
 *  - Cross-project consistency
 *  - Improved fuzzy matching accuracy
 */

// ─── Canonical layer tokens ───────────────────────────────────────────────────

export type CanonicalLayerToken =
  | "drainageMat"
  | "filterFabric"
  | "coverBoard"
  | "membrane"
  | "protectionBoard"
  | "insulationBoard"
  | "vaporRetarder"
  | "rootBarrier"
  | "pedestals"
  | "pavers"
  | "ballast"
  | "greenRoof"
  | "deckBoard"
  | "separation"
  | "flashing"
  | "surfacing"
  | "capSheet"
  | "basePly"
  | "waterproofing";

// ─── Normalization rules ──────────────────────────────────────────────────────

export interface LayerNormalizationRule {
  /** Canonical token name */
  canonical: CanonicalLayerToken;
  /** Exact alias strings (case-insensitive) */
  aliases: string[];
  /** Regex patterns for fuzzy matching */
  regexPatterns: RegExp[];
  /** Optional description for documentation */
  description?: string;
}

export const LAYER_NORMALIZATION_RULES: LayerNormalizationRule[] = [
  // ─── Drainage mat variants ───────────────────────────────────────────────────
  {
    canonical: "drainageMat",
    aliases: [
      "drainage mat",
      "drainage composite",
      "drainage layer",
      "drain mat",
      "drain board",
      "drain layer",
      "enkadrain",
      "protection course drainage layer",
      "drainage course",
      "drainage sheet",
      "composite drainage",
    ],
    regexPatterns: [
      /drainage[\s_-]?mat/i,
      /drainage[\s_-]?composite/i,
      /drainage[\s_-]?layer/i,
      /drainage[\s_-]?course/i,
      /drain[\s_-]?board/i,
      /drain[\s_-]?mat/i,
      /enka[\s_-]?drain/i,
      /composite[\s_-]?drainage/i,
      /protection[\s_-]?course[\s_-]?drainage/i,
    ],
    description: "Drainage composite layer in IRMA/PMR assemblies",
  },

  // ─── Filter fabric variants ───────────────────────────────────────────────────
  {
    canonical: "filterFabric",
    aliases: [
      "filter fabric",
      "filter cloth",
      "geotextile",
      "separation fabric",
      "separation layer",
      "non-woven geotextile",
      "protective fabric",
      "filter mat",
    ],
    regexPatterns: [
      /filter[\s_-]?fabric/i,
      /filter[\s_-]?cloth/i,
      /geo[\s_-]?textile/i,
      /separation[\s_-]?fabric/i,
      /separation[\s_-]?layer/i,
      /non[\s_-]?woven/i,
      /protective[\s_-]?fabric/i,
      /filter[\s_-]?mat/i,
    ],
    description: "Filter/separation fabric layer",
  },

  // ─── Cover board variants ─────────────────────────────────────────────────────
  {
    canonical: "coverBoard",
    aliases: [
      "cover board",
      "substrate board",
      "sheathing",
      "densdeck",
      "dens deck",
      "gypsum board",
      "gypsum sheathing",
      "securock",
      "glasmat sheathing",
      "cementitious board",
      "cement board",
      "protection board sheathing",
    ],
    regexPatterns: [
      /cover[\s_-]?board/i,
      /substrate[\s_-]?board/i,
      /\bsheathing\b/i,
      /dens[\s_-]?deck/i,
      /gypsum[\s_-]?(board|sheathing)/i,
      /securock/i,
      /glasmat/i,
      /cement(itious)?[\s_-]?board/i,
      /protection[\s_-]?board[\s_-]?sheathing/i,
    ],
    description: "Cover board / substrate layer above insulation",
  },

  // ─── Membrane variants ────────────────────────────────────────────────────────
  {
    canonical: "membrane",
    aliases: [
      "waterproofing membrane",
      "hot rubberized asphalt",
      "cold fluid applied membrane",
      "liquid flashing membrane",
      "liquid membrane",
      "fluid applied",
      "cold applied",
      "torch applied",
      "self-adhered membrane",
      "peel and stick",
      "tpo membrane",
      "pvc membrane",
      "epdm membrane",
      "modified bitumen",
      "mod bit",
      "sbs membrane",
      "app membrane",
    ],
    regexPatterns: [
      /waterproof(ing)?[\s_-]?membrane/i,
      /hot[\s_-]?rubberized[\s_-]?asphalt/i,
      /cold[\s_-]?fluid[\s_-]?applied/i,
      /liquid[\s_-]?(flashing[\s_-]?)?membrane/i,
      /fluid[\s_-]?applied/i,
      /(torch|cold|self)[\s_-]?applied/i,
      /peel[\s_-]?and[\s_-]?stick/i,
      /(tpo|pvc|epdm)[\s_-]?membrane/i,
      /modified[\s_-]?bitumen/i,
      /\bmod[\s_-]?bit\b/i,
      /\b(sbs|app)[\s_-]?membrane/i,
    ],
    description: "Primary waterproofing membrane layer",
  },

  // ─── Protection board variants ────────────────────────────────────────────────
  {
    canonical: "protectionBoard",
    aliases: [
      "protection board",
      "protection course",
      "protection mat",
      "fleece backed",
      "fleece layer",
      "cushion course",
      "slip sheet",
    ],
    regexPatterns: [
      /protection[\s_-]?(board|course|mat)/i,
      /fleece[\s_-]?(backed|layer)/i,
      /cushion[\s_-]?course/i,
      /slip[\s_-]?sheet/i,
    ],
    description: "Protection layer for membrane or insulation",
  },

  // ─── Insulation board variants ────────────────────────────────────────────────
  {
    canonical: "insulationBoard",
    aliases: [
      "rigid insulation",
      "insulation board",
      "polyiso",
      "polyisocyanurate",
      "xps",
      "extruded polystyrene",
      "eps",
      "expanded polystyrene",
      "mineral wool",
      "rockwool",
      "iso board",
    ],
    regexPatterns: [
      /rigid[\s_-]?insulation/i,
      /insulation[\s_-]?board/i,
      /poly[\s_-]?iso(cyanurate)?/i,
      /\bxps\b/i,
      /extruded[\s_-]?polystyrene/i,
      /\beps\b/i,
      /expanded[\s_-]?polystyrene/i,
      /mineral[\s_-]?wool/i,
      /rock[\s_-]?wool/i,
      /iso[\s_-]?board/i,
    ],
    description: "Rigid insulation layer",
  },

  // ─── Vapor retarder variants ──────────────────────────────────────────────────
  {
    canonical: "vaporRetarder",
    aliases: [
      "vapor retarder",
      "vapor barrier",
      "air barrier",
      "vapor control layer",
      "vcl",
    ],
    regexPatterns: [
      /vapor[\s_-]?(retarder|barrier)/i,
      /air[\s_-]?barrier/i,
      /vapor[\s_-]?control[\s_-]?layer/i,
      /\bvcl\b/i,
    ],
    description: "Vapor control layer",
  },

  // ─── Root barrier variants ────────────────────────────────────────────────────
  {
    canonical: "rootBarrier",
    aliases: [
      "root barrier",
      "root resistant membrane",
      "anti-root layer",
      "root protection",
    ],
    regexPatterns: [
      /root[\s_-]?barrier/i,
      /root[\s_-]?resistant/i,
      /anti[\s_-]?root/i,
      /root[\s_-]?protection/i,
    ],
    description: "Root barrier for green roof systems",
  },

  // ─── Pedestals variants ───────────────────────────────────────────────────────
  {
    canonical: "pedestals",
    aliases: [
      "pedestal tabs",
      "pedestal system",
      "adjustable pedestals",
      "paver supports",
      "buzon pedestals",
      "dph pedestals",
    ],
    regexPatterns: [
      /pedestal[\s_-]?(tabs?|system)/i,
      /adjustable[\s_-]?pedestals/i,
      /paver[\s_-]?supports?/i,
      /buzon/i,
      /\bdph[\s_-]?\d/i,
    ],
    description: "Elevated pedestal support system",
  },

  // ─── Pavers variants ──────────────────────────────────────────────────────────
  {
    canonical: "pavers",
    aliases: [
      "pavers",
      "paver system",
      "precast pavers",
      "concrete pavers",
      "stone pavers",
      "porcelain pavers",
    ],
    regexPatterns: [
      /\bpavers?\b/i,
      /paver[\s_-]?system/i,
      /precast[\s_-]?pavers?/i,
      /(concrete|stone|porcelain)[\s_-]?pavers?/i,
    ],
    description: "Paver surfacing layer",
  },

  // ─── Ballast variants ─────────────────────────────────────────────────────────
  {
    canonical: "ballast",
    aliases: [
      "ballast",
      "river stone",
      "river rock",
      "gravel ballast",
      "aggregate",
      "stone ballast",
    ],
    regexPatterns: [
      /\bballast\b/i,
      /river[\s_-]?(stone|rock)/i,
      /gravel[\s_-]?ballast/i,
      /\baggregate\b/i,
      /stone[\s_-]?ballast/i,
    ],
    description: "Loose ballast layer",
  },

  // ─── Green roof variants ──────────────────────────────────────────────────────
  {
    canonical: "greenRoof",
    aliases: [
      "green tray",
      "vegetation layer",
      "growing media",
      "growth media",
      "planting media",
      "sedum tray",
      "green roof assembly",
    ],
    regexPatterns: [
      /green[\s_-]?(tray|roof)/i,
      /vegetation[\s_-]?layer/i,
      /(growing|growth|planting)[\s_-]?media/i,
      /sedum[\s_-]?tray/i,
      /planted[\s_-]?roof/i,
    ],
    description: "Green roof vegetation layer",
  },

  // ─── Deck board variants ──────────────────────────────────────────────────────
  {
    canonical: "deckBoard",
    aliases: [
      "structural deck",
      "steel deck",
      "concrete deck",
      "wood deck",
      "metal deck",
      "deck substrate",
    ],
    regexPatterns: [
      /structural[\s_-]?deck/i,
      /(steel|concrete|wood|metal)[\s_-]?deck/i,
      /deck[\s_-]?substrate/i,
    ],
    description: "Structural roof deck",
  },

  // ─── Separation layer variants ────────────────────────────────────────────────
  {
    canonical: "separation",
    aliases: [
      "separation sheet",
      "slip sheet",
      "bond breaker",
      "separation layer",
    ],
    regexPatterns: [
      /separation[\s_-]?(sheet|layer)/i,
      /slip[\s_-]?sheet/i,
      /bond[\s_-]?breaker/i,
    ],
    description: "Separation or slip sheet layer",
  },

  // ─── Flashing variants ────────────────────────────────────────────────────────
  {
    canonical: "flashing",
    aliases: [
      "sheet metal flashing",
      "metal flashing",
      "galvanized flashing",
      "aluminum flashing",
      "copper flashing",
      "flashing detail",
    ],
    regexPatterns: [
      /(sheet[\s_-]?)?metal[\s_-]?flashing/i,
      /(galvanized|aluminum|copper)[\s_-]?flashing/i,
      /flashing[\s_-]?detail/i,
      /\bflashing\b/i,
    ],
    description: "Metal flashing components",
  },

  // ─── Surfacing variants ───────────────────────────────────────────────────────
  {
    canonical: "surfacing",
    aliases: [
      "granule surfacing",
      "mineral surfacing",
      "aggregate surfacing",
      "white coating",
      "aluminum coating",
    ],
    regexPatterns: [
      /(granule|mineral|aggregate)[\s_-]?surfacing/i,
      /(white|aluminum)[\s_-]?coating/i,
      /\bsurfacing\b/i,
    ],
    description: "Surface coating or granules",
  },

  // ─── Cap sheet variants ───────────────────────────────────────────────────────
  {
    canonical: "capSheet",
    aliases: [
      "cap sheet",
      "granulated cap",
      "mineral cap sheet",
      "sbs cap",
      "app cap",
    ],
    regexPatterns: [
      /cap[\s_-]?sheet/i,
      /granulated[\s_-]?cap/i,
      /mineral[\s_-]?cap/i,
      /(sbs|app)[\s_-]?cap/i,
    ],
    description: "Granulated cap sheet for built-up systems",
  },

  // ─── Base ply variants ────────────────────────────────────────────────────────
  {
    canonical: "basePly",
    aliases: [
      "base ply",
      "base sheet",
      "interply",
      "ply sheet",
      "felt layer",
    ],
    regexPatterns: [
      /base[\s_-]?(ply|sheet)/i,
      /inter[\s_-]?ply/i,
      /ply[\s_-]?sheet/i,
      /felt[\s_-]?layer/i,
    ],
    description: "Base ply or interply in built-up systems",
  },

  // ─── Waterproofing variants ───────────────────────────────────────────────────
  {
    canonical: "waterproofing",
    aliases: [
      "waterproofing",
      "waterproof layer",
      "water barrier",
      "moisture barrier",
    ],
    regexPatterns: [
      /waterproof(ing)?/i,
      /water[\s_-]?barrier/i,
      /moisture[\s_-]?barrier/i,
    ],
    description: "Generic waterproofing layer",
  },
];

// ─── Normalization engine ─────────────────────────────────────────────────────

export interface NormalizedLayer {
  /** Original extracted text from OCR/AI */
  originalText: string;
  /** Canonical token after normalization */
  canonicalToken: CanonicalLayerToken | null;
  /** Confidence score (0-1) for the match */
  confidence: number;
  /** Match method: exact, alias, regex, none */
  matchMethod: "exact" | "alias" | "regex" | "none";
}

/**
 * Normalize a single layer string into a canonical token.
 * Returns null if no match found.
 */
export function normalizeLayer(rawText: string): NormalizedLayer {
  if (!rawText || typeof rawText !== "string") {
    return {
      originalText: rawText || "",
      canonicalToken: null,
      confidence: 0,
      matchMethod: "none",
    };
  }

  const cleanText = rawText.trim();
  const lowerText = cleanText.toLowerCase();

  // Try exact canonical match first
  const exactCanonical = LAYER_NORMALIZATION_RULES.find(
    (rule) => rule.canonical.toLowerCase() === lowerText,
  );
  if (exactCanonical) {
    return {
      originalText: cleanText,
      canonicalToken: exactCanonical.canonical,
      confidence: 1.0,
      matchMethod: "exact",
    };
  }

  // Try exact alias match
  for (const rule of LAYER_NORMALIZATION_RULES) {
    if (rule.aliases.some((alias) => alias.toLowerCase() === lowerText)) {
      return {
        originalText: cleanText,
        canonicalToken: rule.canonical,
        confidence: 0.95,
        matchMethod: "alias",
      };
    }
  }

  // Try regex pattern match
  for (const rule of LAYER_NORMALIZATION_RULES) {
    for (const pattern of rule.regexPatterns) {
      if (pattern.test(cleanText)) {
        return {
          originalText: cleanText,
          canonicalToken: rule.canonical,
          confidence: 0.85,
          matchMethod: "regex",
        };
      }
    }
  }

  // No match found
  return {
    originalText: cleanText,
    canonicalToken: null,
    confidence: 0,
    matchMethod: "none",
  };
}

/**
 * Normalize an array of layer strings.
 * Returns both normalized tokens and full audit trail.
 */
export function normalizeLayers(layers: string[]): {
  normalizedLayers: NormalizedLayer[];
  canonicalTokens: CanonicalLayerToken[];
  unmatchedLayers: string[];
} {
  const normalizedLayers = layers.map(normalizeLayer);
  const canonicalTokens = normalizedLayers
    .filter((nl) => nl.canonicalToken !== null)
    .map((nl) => nl.canonicalToken as CanonicalLayerToken);
  const unmatchedLayers = normalizedLayers
    .filter((nl) => nl.canonicalToken === null)
    .map((nl) => nl.originalText);

  return {
    normalizedLayers,
    canonicalTokens,
    unmatchedLayers,
  };
}

/**
 * Check if normalized layers contain a specific canonical token.
 * Use this in classification scoring instead of raw OCR text matching.
 */
export function hasCanonicalLayer(
  normalizedLayers: NormalizedLayer[],
  token: CanonicalLayerToken,
): boolean {
  return normalizedLayers.some((nl) => nl.canonicalToken === token);
}

/**
 * Get all canonical tokens from a layer array with confidence threshold.
 */
export function getCanonicalTokens(
  normalizedLayers: NormalizedLayer[],
  minConfidence = 0.8,
): CanonicalLayerToken[] {
  return normalizedLayers
    .filter((nl) => nl.canonicalToken !== null && nl.confidence >= minConfidence)
    .map((nl) => nl.canonicalToken as CanonicalLayerToken);
}

/**
 * Create a human-readable summary of the normalization results.
 */
export function summarizeNormalization(layers: string[]): string {
  const { normalizedLayers, canonicalTokens, unmatchedLayers } = normalizeLayers(layers);

  const matched = canonicalTokens.length;
  const total = layers.length;
  const matchRate = total > 0 ? ((matched / total) * 100).toFixed(0) : "0";

  let summary = `Normalized ${matched}/${total} layers (${matchRate}% match rate)\n`;

  if (canonicalTokens.length > 0) {
    summary += `\nMatched canonical tokens:\n${canonicalTokens.map((t) => `  - ${t}`).join("\n")}\n`;
  }

  if (unmatchedLayers.length > 0) {
    summary += `\nUnmatched layers:\n${unmatchedLayers.map((l) => `  - ${l}`).join("\n")}`;
  }

  return summary;
}
