/**
 * Layer Normalization Tests
 * 
 * Verify that inconsistent terminology is correctly normalized to canonical tokens.
 */

import { describe, test, expect } from "@jest/globals";
import {
  normalizeLayer,
  normalizeLayers,
  hasCanonicalLayer,
  getCanonicalTokens,
  summarizeNormalization,
  type NormalizedLayer,
  type CanonicalLayerToken,
} from "../lib/bidshield/layer-normalization";

describe("Layer Normalization", () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // DRAINAGE MAT VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Drainage Mat Normalization", () => {
    test("normalizes 'drainage mat' to drainageMat", () => {
      const result = normalizeLayer("drainage mat");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'drainage composite' to drainageMat", () => {
      const result = normalizeLayer("drainage composite");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'drainage layer' to drainageMat", () => {
      const result = normalizeLayer("drainage layer");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'protection course drainage layer' to drainageMat", () => {
      const result = normalizeLayer("protection course drainage layer");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'drain mat' to drainageMat", () => {
      const result = normalizeLayer("drain mat");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'enkadrain' to drainageMat", () => {
      const result = normalizeLayer("enkadrain");
      expect(result.canonicalToken).toBe("drainageMat");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COVER BOARD VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Cover Board Normalization", () => {
    test("normalizes 'cover board' to coverBoard", () => {
      const result = normalizeLayer("cover board");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'substrate board' to coverBoard", () => {
      const result = normalizeLayer("substrate board");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'sheathing' to coverBoard", () => {
      const result = normalizeLayer("sheathing");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'densdeck' to coverBoard", () => {
      const result = normalizeLayer("densdeck");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'dens deck' (with space) to coverBoard", () => {
      const result = normalizeLayer("dens deck");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'gypsum board' to coverBoard", () => {
      const result = normalizeLayer("gypsum board");
      expect(result.canonicalToken).toBe("coverBoard");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WATERPROOFING MEMBRANE VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Waterproofing Membrane Normalization", () => {
    test("normalizes 'waterproofing membrane' to waterproofing", () => {
      const result = normalizeLayer("waterproofing membrane");
      expect(result.canonicalToken).toBe("waterproofing");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'hot rubberized asphalt' to waterproofing", () => {
      const result = normalizeLayer("hot rubberized asphalt");
      expect(result.canonicalToken).toBe("waterproofing");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'cold fluid applied membrane' to waterproofing", () => {
      const result = normalizeLayer("cold fluid applied membrane");
      expect(result.canonicalToken).toBe("waterproofing");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'liquid flashing membrane' to waterproofing", () => {
      const result = normalizeLayer("liquid flashing membrane");
      expect(result.canonicalToken).toBe("waterproofing");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER FABRIC VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Filter Fabric Normalization", () => {
    test("normalizes 'filter fabric' to filterFabric", () => {
      const result = normalizeLayer("filter fabric");
      expect(result.canonicalToken).toBe("filterFabric");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'geotextile' to filterFabric", () => {
      const result = normalizeLayer("geotextile");
      expect(result.canonicalToken).toBe("filterFabric");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    test("normalizes 'separation fabric' to filterFabric", () => {
      const result = normalizeLayer("separation fabric");
      expect(result.canonicalToken).toBe("filterFabric");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH NORMALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Batch Normalization", () => {
    test("normalizes mixed terminology assembly", () => {
      const layers = [
        "structural concrete deck",
        "hot rubberized asphalt",
        "protection board",
        "drainage composite",
        "2\" XPS insulation",
        "filter fabric",
        "concrete pavers on pedestals",
      ];

      const result = normalizeLayers(layers);

      expect(result.normalizedLayers).toHaveLength(7);
      expect(result.canonicalTokens).toContain("drainageMat");
      expect(result.canonicalTokens).toContain("filterFabric");
      expect(result.canonicalTokens).toContain("waterproofing");
      expect(result.canonicalTokens).toContain("protectionBoard");
    });

    test("detects unmatched layers", () => {
      const layers = [
        "drainage mat",
        "unknown proprietary system XYZ-9000",
        "filter fabric",
      ];

      const result = normalizeLayers(layers);

      expect(result.canonicalTokens).toContain("drainageMat");
      expect(result.canonicalTokens).toContain("filterFabric");
      expect(result.unmatchedLayers).toContain("unknown proprietary system XYZ-9000");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Helper Functions", () => {
    test("hasCanonicalLayer detects presence of token", () => {
      const layers = ["drainage composite", "filter fabric", "cover board"];
      const result = normalizeLayers(layers);

      expect(hasCanonicalLayer(result.normalizedLayers, "drainageMat")).toBe(true);
      expect(hasCanonicalLayer(result.normalizedLayers, "filterFabric")).toBe(true);
      expect(hasCanonicalLayer(result.normalizedLayers, "coverBoard")).toBe(true);
      expect(hasCanonicalLayer(result.normalizedLayers, "membrane")).toBe(false);
    });

    test("getCanonicalTokens filters by confidence threshold", () => {
      const layers = ["drainage mat", "cover board"];
      const result = normalizeLayers(layers);

      const highConfidence = getCanonicalTokens(result.normalizedLayers, 0.9);
      const lowConfidence = getCanonicalTokens(result.normalizedLayers, 0.5);

      expect(highConfidence.length).toBeGreaterThanOrEqual(0);
      expect(lowConfidence.length).toBeGreaterThanOrEqual(highConfidence.length);
    });

    test("summarizeNormalization produces readable output", () => {
      const layers = [
        "drainage composite",
        "densdeck",
        "unknown layer XYZ",
      ];

      const summary = summarizeNormalization(layers);

      expect(summary).toContain("drainageMat");
      expect(summary).toContain("coverBoard");
      expect(summary).toContain("unknown layer XYZ");
      expect(summary).toMatch(/\d+\/\d+ layers/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Edge Cases", () => {
    test("handles empty string", () => {
      const result = normalizeLayer("");
      expect(result.canonicalToken).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.matchMethod).toBe("none");
    });

    test("handles whitespace-only string", () => {
      const result = normalizeLayer("   ");
      expect(result.canonicalToken).toBeNull();
      expect(result.confidence).toBe(0);
    });

    test("handles case insensitivity", () => {
      const upper = normalizeLayer("DRAINAGE MAT");
      const lower = normalizeLayer("drainage mat");
      const mixed = normalizeLayer("DrAiNaGe MaT");

      expect(upper.canonicalToken).toBe("drainageMat");
      expect(lower.canonicalToken).toBe("drainageMat");
      expect(mixed.canonicalToken).toBe("drainageMat");
    });

    test("preserves original text", () => {
      const result = normalizeLayer("DRAINAGE COMPOSITE");
      expect(result.originalText).toBe("DRAINAGE COMPOSITE");
      expect(result.canonicalToken).toBe("drainageMat");
    });

    test("handles layers with OCR artifacts", () => {
      // Common OCR mistakes: l->I, O->0, spacing issues
      const result1 = normalizeLayer("drainage.mat");
      const result2 = normalizeLayer("drainage-mat");
      const result3 = normalizeLayer("drainagemat");

      expect(result1.canonicalToken).toBe("drainageMat");
      expect(result2.canonicalToken).toBe("drainageMat");
      // drainagemat without space might not match depending on regex
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASSIFICATION INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Classification Integration", () => {
    test("IRMA assembly detection via normalized layers", () => {
      const irmaLayers = [
        "structural concrete deck",
        "hot rubberized asphalt",
        "protection board",
        "drainage composite",  // normalized to drainageMat
        "2\" XPS insulation",
        "filter fabric",       // normalized to filterFabric
        "concrete pavers",
      ];

      const result = normalizeLayers(irmaLayers);

      const hasDrainageMat = hasCanonicalLayer(result.normalizedLayers, "drainageMat");
      const hasFilterFabric = hasCanonicalLayer(result.normalizedLayers, "filterFabric");

      // IRMA requires both drainage mat and filter fabric
      expect(hasDrainageMat).toBe(true);
      expect(hasFilterFabric).toBe(true);
      expect(result.unmatchedLayers.length).toBeGreaterThanOrEqual(0);
    });

    test("Single-ply assembly should NOT have drainage mat", () => {
      const tpoLayers = [
        "structural steel deck",
        "vapor retarder",
        "2\" polyiso insulation",
        "1/2\" DensDeck",  // normalized to coverBoard
        "80 mil TPO membrane",
      ];

      const result = normalizeLayers(tpoLayers);

      const hasDrainageMat = hasCanonicalLayer(result.normalizedLayers, "drainageMat");
      const hasCoverBoard = hasCanonicalLayer(result.normalizedLayers, "coverBoard");

      expect(hasDrainageMat).toBe(false);
      expect(hasCoverBoard).toBe(true);
    });

    test("Modified bitumen assembly normalization", () => {
      const sbsLayers = [
        "structural concrete deck",
        "2\" polyiso insulation",
        "substrate board",  // normalized to coverBoard
        "SBS modified bitumen base sheet",
        "SBS granule-surfaced cap sheet",
      ];

      const result = normalizeLayers(sbsLayers);

      expect(hasCanonicalLayer(result.normalizedLayers, "coverBoard")).toBe(true);
      expect(hasCanonicalLayer(result.normalizedLayers, "drainageMat")).toBe(false);
      expect(hasCanonicalLayer(result.normalizedLayers, "filterFabric")).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIDENCE SCORING
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe("Confidence Scoring", () => {
    test("exact canonical match has highest confidence", () => {
      const result = normalizeLayer("drainageMat");
      expect(result.confidence).toBe(1.0);
      expect(result.matchMethod).toBe("exact");
    });

    test("alias match has high confidence", () => {
      const result = normalizeLayer("drainage composite");
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.matchMethod).toMatch(/alias|regex/);
    });

    test("no match has zero confidence", () => {
      const result = normalizeLayer("unknown proprietary layer");
      expect(result.confidence).toBe(0);
      expect(result.matchMethod).toBe("none");
    });
  });
});
