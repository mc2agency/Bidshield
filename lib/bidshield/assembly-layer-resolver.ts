/**
 * Assembly Layer Resolver
 *
 * Takes raw extracted layers + archetype classification and produces:
 *
 *   baseStack     — the structural/waterproofing foundation layers
 *   modifierStack — the overburden/finish layers specific to this assembly
 *   fullLayerStack — baseStack + modifierStack, deduplicated, ordered bottom→top
 *   sectionValues  — { sectionId: extractedValue } map for pre-filling the form
 *
 * Rules:
 *  - Classification is driven by the fullLayerStack (already done upstream)
 *  - This resolver is purely about BUILDING the stack, not classifying it
 *  - Works from normalized layer text only — no project names, no roof labels
 *  - For IRMA sub-types, the IRMA base stack is always included even when the
 *    AI only extracted the overburden label (e.g. "PAVER BALLAST")
 *  - sectionValues extraction uses regex against raw layer text — tolerates
 *    dimension prefixes ("7\" XPS", "2\" rigid"), brand names, etc.
 */

import { normalizeLayers } from "./layer-normalization";
import type { CanonicalLayerToken } from "./layer-normalization";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResolvedAssemblyStack {
  /** Base structural layers (deck → membrane for IRMA, deck → membrane → insulation for conventional) */
  baseStack: string[];
  /** Overburden / modifier layers (pedestal+pavers, ballast, green roof system, panel, CIP) */
  modifierStack: string[];
  /** Full ordered stack bottom→top, deduplicated */
  fullLayerStack: string[];
  /** Section field values extracted from the full stack for form pre-fill */
  sectionValues: Record<string, string | boolean | undefined>;
}

// ─── IRMA base layer templates ────────────────────────────────────────────────
//
// When the AI only returns an overburden label for an IRMA assembly (e.g.
// "PAVER BALLAST" without spelling out all base IRMA layers), we supplement
// with the canonical IRMA base stack. The actual insulation thickness and
// membrane spec are extracted from the raw layers when present.

const IRMA_BASE_CANONICAL = [
  "Structural Concrete Deck",
  "Cold Fluid-Applied Waterproofing Membrane",
  "Drainage Mat",
  "XPS Rigid Insulation",
  "Filter Fabric",
];

// ─── Section value extraction helpers ────────────────────────────────────────

/** Extract insulation spec from raw layer strings. Returns extracted string or undefined. */
function extractInsulation(layers: string[]): string | undefined {
  for (const l of layers) {
    // Match: "7\" XPS", "2\" rigid insulation", "3\" polyiso", "4\" EPS", etc.
    const m = l.match(/(\d+(?:\.\d+)?["']?\s*(?:inch(?:es)?)?)\s*(?:xps|polyiso(?:cyanurate)?|eps|rigid\s*insul(?:ation)?|extruded\s*poly(?:styrene)?)/i);
    if (m) return l.trim();
    if (/rigid\s*insul(?:ation)?|polyiso|xps|eps|extruded\s*poly/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Parse insulation type ID (for SetupTab dropdown) from an insulation layer string. */
function parseInsulationTypeId(text: string): string | undefined {
  if (/xps|extruded\s*poly(?:styrene)?/i.test(text)) return "xps";
  if (/polyiso(?:cyanurate)?/i.test(text)) return "polyiso";
  if (/\beps\b|expanded\s*poly/i.test(text)) return "eps";
  if (/mineral\s*wool|rock\s*wool/i.test(text)) return "mineral_wool";
  if (/vacuum/i.test(text)) return "vacuum";
  // Derive type from R-per-inch value when no explicit material keyword
  // e.g. "Rigid Insulation R-5 Per Inch" → xps, "Polyisocyanurate R-5.7 Per Inch" → polyiso
  const rMatch = text.match(/R[\s-]?(\d+(?:\.\d+)?)\s*(?:per\s*inch|\/in)/i);
  if (rMatch) {
    const r = parseFloat(rMatch[1]);
    if (Math.abs(r - 6.7) < 0.15) return "xps_high";
    if (Math.abs(r - 5.7) < 0.15) return "polyiso";
    if (Math.abs(r - 5.0) < 0.15) return "xps";
    if (Math.abs(r - 4.0) < 0.15) return "eps";
  }
  return "rigid";
}

/** Parse insulation thickness in inches from a layer string.
 *  Matches at the start (e.g., '8" XPS') OR inline (e.g., 'XPS Insulation, 4" thick'). */
function parseInsulationThicknessInches(text: string): string | undefined {
  // Prefer leading dimension: '8" XPS', '4\" Rigid Insulation'
  const leading = text.match(/^(\d+(?:\.\d+)?)\s*(?:"|inch(?:es)?|in\b)/i);
  if (leading) return leading[1];
  // Fallback: dimension anywhere in the string before a unit marker
  // Catches: 'Rigid Insulation, 8" thick', 'XPS 3.5"', 'Insulation (4 inch)'
  const inline = text.match(/\b(\d+(?:\.\d+)?)\s*(?:"|inch(?:es)?)\b/i);
  if (inline) return inline[1];
  return undefined;
}

/** Extract membrane spec. */
function extractMembrane(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/waterproof(?:ing)?\s*membrane|fluid[- ]applied|cold[- ]fluid|liquid[- ]applied|tpo|pvc|epdm|modified\s*bitumen|sbs|app\b/i.test(l)) {
      return l.trim();
    }
  }
  return undefined;
}

/** Extract deck type string. */
function extractDeck(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/concrete\s*deck|structural\s*(?:concrete|deck)|steel\s*deck|metal\s*deck|wood\s*deck/i.test(l)) {
      return l.trim();
    }
  }
  return undefined;
}

/** Extract pedestal spec. */
function extractPedestals(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/pedestal|buzon|dph[-\s]?\d|paver\s*support/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract pavers spec (for pedestal assemblies). */
function extractPavers(layers: string[]): string | undefined {
  for (const l of layers) {
    // Pavers but NOT ballast pavers (those go to ballast field)
    if (/\bpavers?\b/i.test(l) && !/ballast/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract ballast spec. */
function extractBallast(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/ballast|river\s*(stone|rock|ballast)|paver\s*ballast|lock[- ]down\s*paver/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract protection board. */
function extractProtectionBoard(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/protection\s*(board|course|mat)|hydroflex|fleece/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract drainage spec (roof drains, not drainage mat). */
function extractDrainage(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/roof\s*drain|overflow|primary\s*drain/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract flashing spec. */
function extractFlashing(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/flash(?:ing)?|sheet\s*metal|galv(?:anized)?/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract green roof spec. */
function extractGreenRoof(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/green\s*roof|vegetation|sedum|growing\s*media|planting\s*media|growth\s*medi/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract drainage mat spec. */
function extractDrainageMat(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/drainage\s*(mat|composite|layer)|drain\s*(mat|board)|enkadrain|hydrodrain/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract cover board spec. */
function extractCoverBoard(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/cover\s*board|dens\s*deck|densglass|dens[- ]glass|gypsum\s*board|securock|cement(?:itious)?\s*board|sheathing/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract surfacing (for panel assemblies). */
function extractSurfacing(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/aluminum\s*panel|metal\s*panel|cladding\s*panel|curtain\s*wall/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract concrete pavement spec. */
function extractConcretePavement(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/concrete\s*pavement|cast[- ]in[- ]place|cip\s*concrete|cip\s*pav/i.test(l)) return l.trim();
  }
  return undefined;
}

/** Extract gravel layer spec. */
function extractGravelLayer(layers: string[]): string | undefined {
  for (const l of layers) {
    if (/gravel\s*layer|aggregate\s*layer|compacted\s*gravel|aggregate\s*base/i.test(l)) return l.trim();
  }
  return undefined;
}

// ─── Canonical token presence helpers ────────────────────────────────────────

function hasToken(tokens: CanonicalLayerToken[], token: CanonicalLayerToken): boolean {
  return tokens.includes(token);
}

// ─── IRMA base stack supplement ───────────────────────────────────────────────
//
// Given raw layers from the AI, build the IRMA base stack by:
//  1. Keeping any recognized base layers from the AI
//  2. Supplementing with IRMA_BASE_CANONICAL for any missing layers
//
// This means if the AI extracted:
//   ["concrete deck", "waterproofing membrane", "drainage mat", "7\" XPS", "filter fabric", "river ballast"]
// the base stack is everything except the overburden (river ballast).
// If the AI only extracted ["cold-fluid IRMA / PMR", "lock-down paver ballast"],
// we supplement with IRMA_BASE_CANONICAL.

function buildIrmaBaseStack(layers: string[], modifierTokens: CanonicalLayerToken[]): string[] {
  const { canonicalTokens } = normalizeLayers(layers);

  // Layers that are part of the IRMA base (not overburden)
  const baseTokens: CanonicalLayerToken[] = ["deckBoard", "waterproofing", "membrane", "protectionBoard", "drainageMat", "insulationBoard", "filterFabric", "vaporRetarder"];

  // Extract recognized base layers from AI output in order
  const baseLayers: string[] = [];
  for (const layer of layers) {
    const { canonicalTokens: lt } = normalizeLayers([layer]);
    const tok = lt[0];
    if (!tok) continue;
    // Include if it's a base token AND not a modifier token
    if (baseTokens.includes(tok) && !modifierTokens.includes(tok)) {
      baseLayers.push(layer);
    }
  }

  // Supplement missing canonical base tokens with IRMA_BASE_CANONICAL entries
  const baseTokSet = new Set(normalizeLayers(baseLayers).canonicalTokens);
  const supplemented = [...baseLayers];

  // Check which IRMA base tokens are missing and fill from canonical
  const irmaRequired: [CanonicalLayerToken, string][] = [
    ["deckBoard", "Structural Concrete Deck"],
    ["waterproofing", "Cold Fluid-Applied Waterproofing Membrane"],
    ["drainageMat", "Drainage Mat"],
    ["insulationBoard", "XPS Rigid Insulation"],
    ["filterFabric", "Filter Fabric"],
  ];

  for (const [token, canonical] of irmaRequired) {
    if (!baseTokSet.has(token) && !hasToken(canonicalTokens, token)) {
      // Only supplement if completely absent from all layers (including modifiers)
      supplemented.push(canonical);
    }
  }

  return supplemented;
}

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Resolve the full assembly stack from raw AI-extracted layers + archetype.
 *
 * @param rawLayers    - Layers as extracted by AI (may be sparse or overburden-only)
 * @param archetypeId  - Classified archetype (from classifyLayersV2)
 * @param surfaceHint  - Optional surface hint from AI ("pavers_pedestals", "green_roof", etc.)
 */
export function resolveFullLayerStack(
  rawLayers: string[],
  archetypeId: string,
  surfaceHint?: string | null,
): ResolvedAssemblyStack {
  const allText = rawLayers.join(" ");
  const { canonicalTokens } = normalizeLayers(rawLayers);

  // ── IRMA sub-types: base + modifier pattern ────────────────────────────────

  if (archetypeId === "pedestal_paver_irma") {
    // Modifier layers: pedestals, pavers, drainage, flashing
    const modifierTokens: CanonicalLayerToken[] = ["pedestals", "pavers", "flashing"];
    const modifierLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      const tok = lt[0];
      return tok && modifierTokens.includes(tok);
    });
    // Add any unrecognized layers that look like overburden
    const extraLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      return lt.length === 0 && /pedestal|pavers?|wood\s*tile|tile\s*paver|drain/i.test(l);
    });
    const baseStack = buildIrmaBaseStack(rawLayers, modifierTokens);
    const modifierStack = [...new Set([...modifierLayers, ...extraLayers])];
    const fullLayerStack = dedup([...baseStack, ...modifierStack]);

    return {
      baseStack,
      modifierStack,
      fullLayerStack,
      sectionValues: buildSectionValues("pedestal_paver_irma", fullLayerStack),
    };
  }

  if (archetypeId === "green_roof_irma") {
    const modifierTokens: CanonicalLayerToken[] = ["rootBarrier", "greenRoof", "flashing"];
    const modifierLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      const tok = lt[0];
      return tok && modifierTokens.includes(tok);
    });
    const extraLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      return lt.length === 0 && /root\s*barrier|green\s*roof|vegetation|planting|growing|growth|sedum/i.test(l);
    });
    const baseStack = buildIrmaBaseStack(rawLayers, modifierTokens);
    const modifierStack = [...new Set([...modifierLayers, ...extraLayers])];
    const fullLayerStack = dedup([...baseStack, ...modifierStack]);

    return {
      baseStack,
      modifierStack,
      fullLayerStack,
      sectionValues: buildSectionValues("green_roof_irma", fullLayerStack),
    };
  }

  if (archetypeId === "ballast_paver_irma") {
    const modifierTokens: CanonicalLayerToken[] = ["ballast", "pavers", "flashing"];
    const modifierLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      const tok = lt[0];
      return tok && modifierTokens.includes(tok);
    });
    const extraLayers = rawLayers.filter(l => {
      const { canonicalTokens: lt } = normalizeLayers([l]);
      return lt.length === 0 && /ballast|lock[- ]down|paver\s*ballast|river\s*(stone|ballast)/i.test(l);
    });
    const baseStack = buildIrmaBaseStack(rawLayers, modifierTokens);
    const modifierStack = [...new Set([...modifierLayers, ...extraLayers])];
    const fullLayerStack = dedup([...baseStack, ...modifierStack]);

    return {
      baseStack,
      modifierStack,
      fullLayerStack,
      sectionValues: buildSectionValues("ballast_paver_irma", fullLayerStack),
    };
  }

  if (archetypeId === "liquid_applied_irma" || archetypeId === "modified_bitumen_irma") {
    // Generic IRMA without specific overburden — use all layers as full stack
    const baseStack = buildIrmaBaseStack(rawLayers, []);
    const fullLayerStack = dedup(baseStack);
    return {
      baseStack,
      modifierStack: [],
      fullLayerStack,
      sectionValues: buildSectionValues(archetypeId, fullLayerStack),
    };
  }

  // ── Non-IRMA archetypes: use raw layers directly ───────────────────────────

  const fullLayerStack = rawLayers.length > 0 ? rawLayers : [];
  return {
    baseStack: fullLayerStack,
    modifierStack: [],
    fullLayerStack,
    sectionValues: buildSectionValues(archetypeId, fullLayerStack),
  };
}

// ─── Section value builder ────────────────────────────────────────────────────
//
// Extracts field values from the full layer stack using regex matchers.
// Each archetype only populates its relevant sections.
// Unknown/unmatched layers are left undefined (form shows empty).

function buildSectionValues(
  archetypeId: string,
  fullLayerStack: string[],
): Record<string, string | boolean | undefined> {
  const sv: Record<string, string | boolean | undefined> = {};

  // Shared extractions used by multiple archetypes
  const deck = extractDeck(fullLayerStack);
  const membrane = extractMembrane(fullLayerStack);
  const insulation = extractInsulation(fullLayerStack);
  const drainageMat = extractDrainageMat(fullLayerStack);
  const flashing = extractFlashing(fullLayerStack);
  const drainage = extractDrainage(fullLayerStack);
  const protectionBoard = extractProtectionBoard(fullLayerStack);

  if (deck) sv["deck"] = deck;
  if (membrane) sv["membrane"] = membrane;

  switch (archetypeId) {
    case "pedestal_paver_irma": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat; else sv["drainageMat"] = "Drainage Mat";
      sv["filterFabric"] = true;
      const pedestals = extractPedestals(fullLayerStack);
      if (pedestals) sv["pedestals"] = pedestals;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "green_roof_irma": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat; else sv["drainageMat"] = "Drainage Mat";
      sv["filterFabric"] = true;
      sv["rootBarrier"] = true;
      const greenRoof = extractGreenRoof(fullLayerStack);
      if (greenRoof) sv["greenRoof"] = greenRoof;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "ballast_paver_irma": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat; else sv["drainageMat"] = "Drainage Mat";
      sv["filterFabric"] = true;
      const ballast = extractBallast(fullLayerStack);
      if (ballast) sv["ballast"] = ballast;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "liquid_applied_irma":
    case "modified_bitumen_irma": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat; else sv["drainageMat"] = "Drainage Mat";
      sv["filterFabric"] = true;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "concrete_pavement_roof": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      const gravelLayer = extractGravelLayer(fullLayerStack);
      if (gravelLayer) sv["gravelLayer"] = gravelLayer;
      const concretePavement = extractConcretePavement(fullLayerStack);
      if (concretePavement) sv["concretePavement"] = concretePavement;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "built_up_panel_assembly": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      const coverBoard = extractCoverBoard(fullLayerStack);
      if (coverBoard) sv["coverBoard"] = coverBoard;
      const surfacing = extractSurfacing(fullLayerStack);
      if (surfacing) sv["surfacing"] = surfacing;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "single_ply_tpo":
    case "single_ply_pvc":
    case "single_ply_epdm":
    case "modified_bitumen_sbs": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      const coverBoard = extractCoverBoard(fullLayerStack);
      if (coverBoard) sv["coverBoard"] = coverBoard;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    case "conventional_liquid_applied": {
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      const coverBoard = extractCoverBoard(fullLayerStack);
      if (coverBoard) sv["coverBoard"] = coverBoard;
      if (protectionBoard) sv["protectionBoard"] = protectionBoard;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
    default: {
      // Custom / unknown — extract whatever we can
      if (insulation) {
        sv["insulation"] = insulation;
        const iType = parseInsulationTypeId(insulation);
        const iThick = parseInsulationThicknessInches(insulation);
        if (iType) sv["insulationType"] = iType;
        if (iThick) sv["insulationThickness"] = iThick;
      }
      if (drainageMat) sv["drainageMat"] = drainageMat;
      if (drainage) sv["drainage"] = drainage;
      if (flashing) sv["flashing"] = flashing;
      break;
    }
  }

  return sv;
}

// ─── Dedup helper ─────────────────────────────────────────────────────────────

function dedup(layers: string[]): string[] {
  const seen = new Set<string>();
  return layers.filter(l => {
    const key = l.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
