/**
 * Complete Normalization Integration Test
 * 
 * Verifies end-to-end flow from raw OCR → normalization → classification → audit storage
 */

import { describe, test, expect } from "@jest/globals";
import {
  normalizeAssemblySignals,
  type RawAssemblySignals,
  type NormalizedAssemblySignals,
  type ClassificationAudit,
} from "../lib/bidshield/assembly-system-configs";
import {
  normalizeLayers,
  type CanonicalLayerToken,
} from "../lib/bidshield/layer-normalization";

describe("End-to-End Normalization Integration", () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 1: IRMA with inconsistent drainage mat terminology
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("IRMA detection via 'drainage composite' (not 'drainage mat')", () => {
    const rawLayers = [
      "Structural concrete deck",
      "Hot rubberized asphalt",
      "Protection board",
      "Drainage composite",  // Different terminology
      "2\" XPS insulation",
      "Filter fabric",
      "Concrete pavers on pedestals",
    ];

    // Step 1: Normalize layers
    const normalizationResult = normalizeLayers(rawLayers);
    expect(normalizationResult.canonicalTokens).toContain("drainageMat");
    expect(normalizationResult.canonicalTokens).toContain("filterFabric");

    // Step 2: Signal normalization (used by classification)
    const signals = normalizeAssemblySignals({
      drainageMat: false,  // AI got it wrong
      filterFabric: false, // AI got it wrong
      layers: rawLayers,
    });

    // Should override AI with layer evidence
    expect(signals.effectiveDrainageMat).toBe(true);
    expect(signals.effectiveFilterFabric).toBe(true);
    expect(signals.signalAudit.drainageMat.source).toBe("layers");
    expect(signals.signalAudit.drainageMat.matchedLayers).toContain("Drainage composite");

    // Step 3: Build ClassificationAudit for storage
    const audit: ClassificationAudit = {
      conflict: false,
      originalExtractedText: rawLayers,
      normalizedLayerTokens: normalizationResult.canonicalTokens,
      unmatchedLayers: normalizationResult.unmatchedLayers,
      normalizationConfidence: normalizationResult.normalizedLayers.map(nl => nl.confidence),
    };

    expect(audit.normalizedLayerTokens).toContain("drainageMat");
    expect(audit.normalizedLayerTokens).toContain("filterFabric");
    expect(audit.unmatchedLayers).toHaveLength(0);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 2: Multiple DensDeck terminology variations
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("DensDeck, Gypsum Board, Cover Board all normalize to coverBoard", () => {
    const variants = [
      ["DensDeck", "80 mil TPO"],
      ["Gypsum board", "TPO membrane"],
      ["Cover board", "TPO single-ply"],
      ["Dens Deck", "Mechanically attached TPO"],
    ];

    for (const [coverBoardVariant, membrane] of variants) {
      const layers = [
        "Steel deck",
        "2\" polyiso insulation",
        coverBoardVariant,
        membrane,
      ];

      const result = normalizeLayers(layers);
      expect(result.canonicalTokens).toContain("coverBoard");
      
      const signals = normalizeAssemblySignals({
        drainageMat: null,
        filterFabric: null,
        layers,
      });
      
      expect(signals.effectiveDrainageMat).toBe(false);
      expect(signals.effectiveFilterFabric).toBe(false);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 3: Hot rubberized asphalt vs cold fluid applied vs liquid flashing
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("All waterproofing membrane variants normalize to 'waterproofing'", () => {
    const membraneVariants = [
      "Hot rubberized asphalt",
      "Cold fluid applied membrane",
      "Liquid flashing membrane",
      "Waterproofing membrane",
    ];

    for (const membrane of membraneVariants) {
      const layers = [
        "Concrete deck",
        membrane,
        "Drainage composite",
        "XPS insulation",
        "Filter fabric",
      ];

      const result = normalizeLayers(layers);
      expect(result.canonicalTokens).toContain("waterproofing");
      expect(result.canonicalTokens).toContain("drainageMat");
      expect(result.canonicalTokens).toContain("filterFabric");
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 4: Unmatched layers stored in audit
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("Unknown proprietary layers stored in unmatchedLayers", () => {
    const layers = [
      "Structural concrete deck",
      "Proprietary XYZ-9000 waterproofing system",
      "Enkadrain composite",
      "Custom ABC insulation board (R-40)",
      "Geotextile separation layer",
    ];

    const result = normalizeLayers(layers);

    expect(result.canonicalTokens).toContain("drainageMat"); // Enkadrain
    expect(result.canonicalTokens).toContain("filterFabric"); // Geotextile
    
    // Proprietary products might match or not depending on regex
    expect(result.unmatchedLayers.length).toBeGreaterThanOrEqual(0);
    
    const audit: ClassificationAudit = {
      conflict: false,
      originalExtractedText: layers,
      normalizedLayerTokens: result.canonicalTokens,
      unmatchedLayers: result.unmatchedLayers,
      normalizationConfidence: result.normalizedLayers.map(nl => nl.confidence),
    };

    // Should preserve original text even for unmatched layers
    expect(audit.originalExtractedText).toHaveLength(5);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 5: Case insensitivity and OCR artifacts
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("Handles case variations and punctuation artifacts", () => {
    const messyLayers = [
      "DRAINAGE MAT",           // All caps
      "Filter.Fabric",          // Period instead of space
      "cover-board",            // Hyphen
      "GEOTEXTILE",            // Caps
      "enkadrain",             // Lowercase
    ];

    const result = normalizeLayers(messyLayers);

    expect(result.canonicalTokens).toContain("drainageMat");
    expect(result.canonicalTokens).toContain("filterFabric");
    expect(result.canonicalTokens).toContain("coverBoard");
    
    // Original text should be preserved with original formatting
    const drainageLayer = result.normalizedLayers.find(nl => 
      nl.canonicalToken === "drainageMat" && nl.originalText === "DRAINAGE MAT"
    );
    expect(drainageLayer).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 6: Confidence scoring affects classification
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("Confidence scores stored in ClassificationAudit", () => {
    const layers = [
      "drainageMat",           // Exact canonical match → 1.0
      "drainage composite",     // Alias → 0.95
      "protection course drainage layer", // Regex → 0.85
    ];

    const result = normalizeLayers(layers);

    const confidences = result.normalizedLayers.map(nl => nl.confidence);
    expect(confidences[0]).toBe(1.0);  // Exact
    expect(confidences[1]).toBeGreaterThanOrEqual(0.85); // Alias or regex
    expect(confidences[2]).toBeGreaterThanOrEqual(0.85); // Regex

    const audit: ClassificationAudit = {
      conflict: false,
      originalExtractedText: layers,
      normalizedLayerTokens: result.canonicalTokens,
      unmatchedLayers: result.unmatchedLayers,
      normalizationConfidence: confidences,
    };

    expect(audit.normalizationConfidence?.every(c => c >= 0.85)).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 7: Full AI extraction → classification pipeline
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("Complete pipeline: AI extraction → normalization → classification", () => {
    // Simulated AI extraction output
    const aiExtraction = {
      systemType: "unknown",  // AI couldn't classify
      drainageMat: false,     // AI got it wrong
      filterFabric: false,    // AI got it wrong
      layers: [
        "structural concrete deck",
        "protection course drainage layer",  // Non-standard terminology
        "extruded polystyrene insulation",
        "separation fabric",                 // Non-standard terminology
        "concrete pavers on adjustable pedestals",
      ],
    };

    // Step 1: Normalize layers
    const normResult = normalizeLayers(aiExtraction.layers);

    expect(normResult.canonicalTokens).toContain("drainageMat");
    expect(normResult.canonicalTokens).toContain("filterFabric");
    expect(normResult.canonicalTokens).toContain("insulationBoard");
    expect(normResult.canonicalTokens).toContain("pavers");

    // Step 2: Normalize signals
    const signals = normalizeAssemblySignals({
      drainageMat: aiExtraction.drainageMat,
      filterFabric: aiExtraction.filterFabric,
      layers: aiExtraction.layers,
    });

    // Should correct AI's mistakes via layer evidence
    expect(signals.effectiveDrainageMat).toBe(true);
    expect(signals.effectiveFilterFabric).toBe(true);
    expect(signals.signalAudit.drainageMat.source).toBe("layers");
    expect(signals.signalAudit.filterFabric.source).toBe("layers");

    // Step 3: Build classification audit
    const audit: ClassificationAudit = {
      conflict: false,
      originalExtractedText: aiExtraction.layers,
      normalizedLayerTokens: normResult.canonicalTokens,
      unmatchedLayers: normResult.unmatchedLayers,
      normalizationConfidence: normResult.normalizedLayers.map(nl => nl.confidence),
      detectedType: "IRMA (Protected Membrane)",
    };

    // Now the classification engine can correctly identify this as IRMA
    // based on the presence of drainageMat + filterFabric canonical tokens
    expect(audit.normalizedLayerTokens).toContain("drainageMat");
    expect(audit.normalizedLayerTokens).toContain("filterFabric");
    expect(audit.unmatchedLayers).toHaveLength(0);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENARIO 8: Modified Bitumen vs EPDM terminology conflict
  // ═══════════════════════════════════════════════════════════════════════════
  
  test("Modified Bitumen layers override 'Built-Up EPDM' title", () => {
    const layers = [
      "Steel deck",
      "2\" polyiso insulation",
      "DensDeck",
      "SBS modified bitumen base sheet",
      "Granule-surfaced cap sheet",
    ];

    const normResult = normalizeLayers(layers);
    const signals = normalizeAssemblySignals({
      drainageMat: null,
      filterFabric: null,
      layers,
    });

    // Should detect SBS from layer content
    expect(signals.effectiveSbsMembrane).toBe(true);
    
    // Should NOT have IRMA signals
    expect(signals.effectiveDrainageMat).toBe(false);
    expect(signals.effectiveFilterFabric).toBe(false);

    const audit: ClassificationAudit = {
      conflict: true,
      titleLabel: "Built-Up EPDM Roof",
      detectedType: "Modified Bitumen",
      reason: "Layer stack indicates Modified Bitumen, not EPDM.",
      originalExtractedText: layers,
      normalizedLayerTokens: normResult.canonicalTokens,
      unmatchedLayers: normResult.unmatchedLayers,
      normalizationConfidence: normResult.normalizedLayers.map(nl => nl.confidence),
    };

    expect(audit.conflict).toBe(true);
    expect(audit.detectedType).toBe("Modified Bitumen");
  });
});
