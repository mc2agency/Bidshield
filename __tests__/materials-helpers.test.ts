import { describe, it, expect } from "vitest";
import {
  extractNumericTokens,
  getProductFamily,
  findBestQuoteMatch,
  findBestMatchAcrossAllQuotes,
  isStaleQuote,
  datasheetCategoryToMaterial,
  WASTE_REQUIRED_CATS,
  COVERAGE_RANGES,
} from "@/lib/bidshield/materials-helpers";

// These helpers drive the quote-matching pipeline that caused the $1.8M
// fastener bug (see CLAUDE.md). Tests encode the invariants that prevent
// that class of mismatch from recurring.

describe("extractNumericTokens", () => {
  it("extracts plain integers", () => {
    expect(extractNumericTokens("20 TG")).toEqual(["20"]);
  });

  it("extracts decimals", () => {
    expect(extractNumericTokens("Polyiso 2.5 inch")).toEqual(["2.5"]);
  });

  it("extracts tokens with mil suffix", () => {
    expect(extractNumericTokens("TPO 60mil membrane")).toEqual(["60mil"]);
  });

  it("extracts dimension tokens into separate parts", () => {
    // The regex consumes the "x" as a suffix for the first digit group, so
    // "4x8" splits into ["4x", "8"]. Encoded as a test so future regex
    // changes can be evaluated against current behavior.
    expect(extractNumericTokens("DensDeck 4x8 board")).toEqual(["4x", "8"]);
  });

  it("lowercases output", () => {
    expect(extractNumericTokens("TPO 60MIL")).toEqual(["60mil"]);
  });

  it("returns empty for non-numeric strings", () => {
    expect(extractNumericTokens("bonding adhesive")).toEqual([]);
  });
});

describe("getProductFamily", () => {
  it("classifies fasteners", () => {
    expect(getProductFamily("Insulation Screws + Plates")).toBeGreaterThanOrEqual(0);
    expect(getProductFamily("Insulation Screws + Plates")).toBe(
      getProductFamily("Membrane Fastener"),
    );
  });

  it("classifies adhesive products together", () => {
    const a = getProductFamily("Bonding Adhesive");
    const b = getProductFamily("TPO Primer");
    const c = getProductFamily("Edge Sealant");
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("returns different family ids for different product types", () => {
    const fastener = getProductFamily("Insulation Screws");
    const adhesive = getProductFamily("Bonding Adhesive");
    expect(fastener).not.toBe(adhesive);
  });

  it("returns -1 for unknown products", () => {
    expect(getProductFamily("TPO 60mil membrane roll")).toBe(-1);
  });
});

describe("findBestQuoteMatch", () => {
  // The critical invariant: a fastener material must NEVER match an adhesive
  // or membrane line item, even if many words overlap.
  it("refuses to cross product families (fastener vs adhesive)", () => {
    const result = findBestQuoteMatch("Insulation Fasteners + Plates", [
      { m: "Bonding Adhesive Plate System", u: "GL", p: 185 },
    ]);
    expect(result).toBeNull();
  });

  it("refuses to match different mil thicknesses", () => {
    const result = findBestQuoteMatch("TPO 60mil Membrane", [
      { m: "TPO 45mil Membrane Roll", u: "RL", p: 250 },
    ]);
    expect(result).toBeNull();
  });

  it("matches when numeric tokens, family, and words align", () => {
    const result = findBestQuoteMatch("TPO 60mil Membrane Roll", [
      { m: "TPO 60mil Membrane Roll supply", u: "RL", p: 285 },
    ]);
    expect(result).not.toBeNull();
    expect(result?.item.p).toBe(285);
    expect(result?.confidence).toBeGreaterThanOrEqual(65);
  });

  it("rejects candidates with extra numeric tokens not in target", () => {
    // "10ft" is in candidate but not in target → bidirectional numeric
    // check fails. Ensures we don't match "60mil 10ft rolls" against
    // "60mil roll" unless the target also specified 10ft.
    const result = findBestQuoteMatch("TPO 60mil Membrane Roll", [
      { m: "TPO 60mil Membrane 10ft Roll", u: "RL", p: 285 },
    ]);
    expect(result).toBeNull();
  });

  it("returns null when confidence below 65%", () => {
    // Only 1 of 3 target words matches → below threshold
    const result = findBestQuoteMatch("TPO Bonding Plate", [
      { m: "TPO Clip Strip", u: "EA", p: 5 },
    ]);
    expect(result).toBeNull();
  });

  it("requires at least 2 significant word matches", () => {
    const result = findBestQuoteMatch("membrane", [
      { m: "membrane roll", u: "RL", p: 100 },
    ]);
    // Only 1 word matches ("membrane"), below the min-2 threshold
    expect(result).toBeNull();
  });

  it("picks highest confidence when multiple candidates match", () => {
    // Cand A matches 3 of 4 target words ("tpo", "60mil", "membrane") — 75%.
    // Cand B matches all 4 — 100%. Higher confidence wins.
    const result = findBestQuoteMatch("TPO 60mil Membrane Roll", [
      { m: "TPO Membrane 60mil supply", u: "RL", p: 290 },
      { m: "TPO 60mil Membrane Roll supply", u: "RL", p: 285 },
    ]);
    expect(result?.item.p).toBe(285);
  });

  it("returns null for empty line items", () => {
    expect(findBestQuoteMatch("anything", [])).toBeNull();
  });
});

describe("findBestMatchAcrossAllQuotes", () => {
  it("searches across multiple quotes and returns highest-confidence hit", () => {
    const quotes = [
      {
        vendorName: "Vendor A",
        products: [
          JSON.stringify({ m: "TPO 60mil Membrane partial", u: "RL", p: 290 }),
        ],
      },
      {
        vendorName: "Vendor B",
        products: [
          JSON.stringify({ m: "TPO 60mil Membrane Roll supply supply", u: "RL", p: 280 }),
        ],
      },
    ];
    const result = findBestMatchAcrossAllQuotes("TPO 60mil Membrane Roll", quotes);
    expect(result?.quoteName).toBe("Vendor B");
    expect(result?.item.p).toBe(280);
  });

  it("skips quotes with price <= 0", () => {
    const quotes = [
      {
        vendorName: "Vendor A",
        products: [JSON.stringify({ m: "TPO 60mil Membrane Roll", u: "RL", p: 0 })],
      },
    ];
    expect(findBestMatchAcrossAllQuotes("TPO 60mil Membrane Roll", quotes)).toBeNull();
  });

  it("tolerates malformed JSON in products array", () => {
    const quotes = [
      {
        vendorName: "Bad Vendor",
        products: ["not-json", JSON.stringify({ m: "TPO 60mil Membrane Roll supply", u: "RL", p: 285 })],
      },
    ];
    const result = findBestMatchAcrossAllQuotes("TPO 60mil Membrane Roll", quotes);
    expect(result?.item.p).toBe(285);
  });

  it("uses 'Quote' as fallback when vendorName is missing", () => {
    const quotes = [
      {
        products: [JSON.stringify({ m: "TPO 60mil Membrane Roll supply", u: "RL", p: 285 })],
      },
    ];
    const result = findBestMatchAcrossAllQuotes("TPO 60mil Membrane Roll", quotes);
    expect(result?.quoteName).toBe("Quote");
  });
});

describe("isStaleQuote", () => {
  it("returns false for undefined date", () => {
    expect(isStaleQuote(undefined)).toBe(false);
  });

  it("returns true for quotes older than 90 days", () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStaleQuote(old)).toBe(true);
  });

  it("returns false for recent quotes", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStaleQuote(recent)).toBe(false);
  });
});

describe("datasheetCategoryToMaterial", () => {
  it("maps TPO to membrane", () => {
    expect(datasheetCategoryToMaterial("TPO")).toBe("membrane");
  });

  it("maps Cover Board to insulation", () => {
    expect(datasheetCategoryToMaterial("Cover Board")).toBe("insulation");
  });

  it("maps Fasteners to fasteners", () => {
    expect(datasheetCategoryToMaterial("Fasteners")).toBe("fasteners");
  });

  it("falls back to accessories for unknown categories", () => {
    expect(datasheetCategoryToMaterial("Some Weird Category")).toBe("accessories");
  });
});

describe("constants", () => {
  it("WASTE_REQUIRED_CATS contains the three always-waste categories", () => {
    expect(WASTE_REQUIRED_CATS.has("membrane")).toBe(true);
    expect(WASTE_REQUIRED_CATS.has("insulation")).toBe(true);
    expect(WASTE_REQUIRED_CATS.has("fasteners")).toBe(true);
    expect(WASTE_REQUIRED_CATS.has("sheet_metal")).toBe(false);
  });

  it("COVERAGE_RANGES has valid ranges for each category", () => {
    for (const cat of Object.keys(COVERAGE_RANGES)) {
      const r = COVERAGE_RANGES[cat];
      expect(r.max).toBeGreaterThan(r.min);
      expect(r.min).toBeGreaterThan(0);
      expect(typeof r.unit).toBe("string");
    }
  });
});
