// Pure helpers extracted from MaterialsTab.tsx so they can be unit-tested
// without rendering the full ~2000-line component. Nothing here touches
// React, Convex, or browser APIs.

// Categories where 0% waste is always a problem
export const WASTE_REQUIRED_CATS = new Set(["membrane", "insulation", "fasteners"]);

// Known coverage ranges per category for validation
export const COVERAGE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  tpo:        { min: 100, max: 2000, unit: "SF/RL" },
  epdm:       { min: 100, max: 2000, unit: "SF/RL" },
  pvc:        { min: 100, max: 2000, unit: "SF/RL" },
  membrane:   { min: 30,  max: 2000, unit: "SF" },
  insulation: { min: 16,  max: 64,   unit: "SF/BD" },
  adhesive:   { min: 50,  max: 500,  unit: "SF/GL" },
  fasteners:  { min: 100, max: 1000, unit: "EA/BX" },
};

// Product family groups — cross-family matches are rejected to prevent
// e.g. matching a "fastener" material against a "base sheet" quote line.
export const PRODUCT_FAMILIES: readonly string[][] = [
  ["cap sheet", "cap ply", "granulated", "torch cap"],
  ["base sheet", "base ply", "base coat", "torch base"],
  ["coverboard", "cover board", "densdeck", "dens deck", "gypsum board"],
  ["fastener", "screw", "plate", "nail", "clip"],
  ["adhesive", "bonding", "primer", "cement", "sealant", "caulk", "mastic"],
  ["flashing", "counterflashing", "coping", "drip edge", "gravel stop", "reglet"],
];

// Extract numeric tokens that must all appear in a match (e.g. "20", "2.5",
// "60mil", "4x8"). Used to prevent matching "60mil TPO" against "45mil TPO".
export function extractNumericTokens(s: string): string[] {
  return (s.match(/\d+\.?\d*(?:['"×xmil]+)?/gi) ?? []).map(t => t.toLowerCase());
}

// Returns the index of the product family `s` belongs to, or -1 if unknown.
export function getProductFamily(s: string): number {
  const lower = s.toLowerCase();
  for (let i = 0; i < PRODUCT_FAMILIES.length; i++) {
    if (PRODUCT_FAMILIES[i].some(k => lower.includes(k))) return i;
  }
  return -1;
}

export interface QuoteLineItem {
  m: string; // material name
  u: string; // unit
  p: number; // unit price
}

export interface QuoteMatch {
  item: QuoteLineItem;
  confidence: number;
}

// Match a material name against quote line items with strict confidence rules.
// Rules (all must hold):
//   1. Every numeric token in the target name must appear in the candidate
//      (and vice versa) — prevents 60mil/45mil cross-matches.
//   2. If both sides have a known product family, they must be the same —
//      prevents adhesive-vs-fastener style mismatches.
//   3. At least 2 significant words (>2 chars) must match.
//   4. Word-match confidence must be >= 65%.
export function findBestQuoteMatch(
  materialName: string,
  lineItems: QuoteLineItem[]
): QuoteMatch | null {
  if (!lineItems.length) return null;
  const target = materialName.toLowerCase();
  const targetNums = extractNumericTokens(target);
  const targetFamily = getProductFamily(target);
  const targetWords = target.split(/[\s,()\/]+/).filter(w => w.length > 2);

  let best: QuoteMatch | null = null;

  for (const li of lineItems) {
    const candidate = li.m.toLowerCase();
    const candidateNums = extractNumericTokens(candidate);
    const candidateFamily = getProductFamily(candidate);

    // Bidirectional numeric check
    if (targetNums.length > 0 && !targetNums.every(n => candidateNums.includes(n))) continue;
    if (candidateNums.length > 0 && !candidateNums.every(n => targetNums.includes(n))) continue;

    // No cross-family matching when both families are known
    if (targetFamily !== -1 && candidateFamily !== -1 && targetFamily !== candidateFamily) continue;

    const matched = targetWords.filter(w => candidate.includes(w));
    const confidence = targetWords.length > 0 ? (matched.length / targetWords.length) * 100 : 0;

    // Require at least 2 significant words matched
    if (matched.length < 2) continue;

    if (confidence > (best?.confidence ?? 0)) {
      best = { item: li, confidence };
    }
  }

  return best && best.confidence >= 65 ? best : null;
}

// Search across all project quotes and return the highest-confidence match.
// Each quote's `products` field is an array of JSON-encoded line item strings.
interface QuoteEnvelope {
  products?: string[];
  vendorName?: string;
}

export interface CrossQuoteMatch extends QuoteMatch {
  quoteName: string;
}

export function findBestMatchAcrossAllQuotes(
  materialName: string,
  allQuotes: QuoteEnvelope[]
): CrossQuoteMatch | null {
  let best: CrossQuoteMatch | null = null;
  for (const q of allQuotes) {
    const lineItems: QuoteLineItem[] = (q.products ?? []).flatMap((s) => {
      try {
        const p = JSON.parse(s) as QuoteLineItem;
        return p.p > 0 ? [p] : [];
      } catch {
        return [];
      }
    });
    const match = findBestQuoteMatch(materialName, lineItems);
    if (match && (!best || match.confidence > best.confidence)) {
      best = { ...match, quoteName: q.vendorName ?? "Quote" };
    }
  }
  return best;
}

// A quote is considered stale if dated more than 90 days ago.
export function isStaleQuote(quoteDate: string | undefined): boolean {
  if (!quoteDate) return false;
  return new Date(quoteDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
}

// Maps an AI-extracted datasheet category to the internal material category
// key used elsewhere in the app (materials table, template catalog, etc.).
export function datasheetCategoryToMaterial(cat: string): string {
  const map: Record<string, string> = {
    TPO: "membrane",
    PVC: "membrane",
    EPDM: "membrane",
    "Modified Bitumen": "membrane",
    "Built-Up Roofing": "membrane",
    "Spray Foam": "membrane",
    "Metal Roofing": "membrane",
    Insulation: "insulation",
    "Cover Board": "insulation",
    Fasteners: "fasteners",
    Adhesives: "adhesive",
    "Sheet Metal": "sheet_metal",
  };
  return map[cat] ?? "accessories";
}
