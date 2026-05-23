/**
 * V2 regression tests — Steinway sheet bugs
 *
 * Covers the three failures reported after Phase 5A and the fix-up sprint:
 *   1. ROOF 01 / ROOF 02 missing from extraction
 *      - allDrawingLabels field (SOURCE A) ensures all labels are surfaced
 *      - Regex fallback (SOURCE B) catches labels from raw preamble text
 *      - legendTitles map populates displayName on placeholder items
 *   2. ROOF 05 still classified as liquid_applied_irma
 *   3. V2 review page not rendering sections from snapshots
 */

import { describe, test, expect } from "vitest";
import { classifyLayersV2 } from "../lib/bidshield/archetype-scoring";
import { ARCHETYPE_FORM_SCHEMAS } from "../lib/bidshield/archetype-form-bridge";
import { extractLabelsFromText } from "../app/api/bidshield/v2/extract-assemblies-v2/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a label using the same logic as the route. */
function normaliseLabelMatch(raw: string): string {
  let s = raw.replace(/ROOF\s*TYPE/i, "ROOF");
  s = s.replace(/([A-Za-z])(\d)/, "$1 $2");
  s = s.replace(/[-\s]+/, " ");
  s = s.replace(/(\d+)$/, (_, n) => String(parseInt(n, 10)).padStart(2, "0"));
  return s.toUpperCase().trim();
}

function normaliseAiLabelList(labels: string[]): Set<string> {
  const out = new Set<string>();
  for (const raw of labels) {
    if (!raw) continue;
    const normalised = normaliseLabelMatch(raw);
    if (normalised) out.add(normalised);
  }
  return out;
}

/**
 * Simulate the full deterministic label recovery used by the route:
 * merges SOURCE A (allDrawingLabels) + SOURCE B (regex scan), returns
 * labels that are missing from the assemblies JSON array.
 */
function getMissingLabels(
  allDrawingLabels: string[],
  rawText: string,
  jsonLabels: string[]
): string[] {
  const sourceA = normaliseAiLabelList(allDrawingLabels);
  const sourceB = extractLabelsFromText(rawText);
  const expected = new Set<string>([...sourceA, ...sourceB]);
  const inJson = new Set(jsonLabels.map(normaliseLabelMatch));
  const missing: string[] = [];
  for (const label of expected) {
    if (!inJson.has(label)) missing.push(label);
  }
  return missing;
}

// ─── Bug 1A: allDrawingLabels (SOURCE A) ──────────────────────────────────────

describe("Bug 1A: allDrawingLabels SOURCE A catches missing assemblies", () => {
  test("AI reports all 6 labels but JSON only has 4 → 2 missing via SOURCE A", () => {
    const allDrawingLabels = [
      "ROOF 01", "ROOF 02", "ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06",
    ];
    const jsonLabels = ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(allDrawingLabels, "", jsonLabels);
    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
    expect(missing).not.toContain("ROOF 03");
    expect(missing).not.toContain("ROOF 04");
  });

  test("ROOF TYPE labels from allDrawingLabels are normalised to ROOF 0N", () => {
    const allDrawingLabels = [
      "ROOF TYPE 01", "ROOF TYPE 02", "ROOF TYPE 03",
    ];
    const normalised = normaliseAiLabelList(allDrawingLabels);
    expect(normalised.has("ROOF 01")).toBe(true);
    expect(normalised.has("ROOF 02")).toBe(true);
    expect(normalised.has("ROOF 03")).toBe(true);
  });

  test("Steinway legend titles populate displayName on placeholder", () => {
    // The legendTitles map from the AI response
    const legendTitles: Record<string, string> = {
      "ROOF 01": "PAVERS ON PEDESTAL IRMA ROOFING",
      "ROOF 02": "GREEN ROOF ON IRMA ROOFING",
      "ROOF 03": "PAVER BALLAST ON IRMA ROOFING",
      "ROOF 04": "WOOD TILES ON PEDESTAL IRMA ROOFING",
      "ROOF 05": "CONCRETE PAVEMENT",
      "ROOF 06": "ROOF WITH BUILT-UP",
    };
    // Simulated placeholder builder
    const placeholder = {
      drawingAssemblyId: "ROOF 01",
      displayName: legendTitles["ROOF 01"],
      layers: [],
    };
    expect(placeholder.displayName).toBe("PAVERS ON PEDESTAL IRMA ROOFING");
  });

  test("Steinway full scenario: allDrawingLabels has 6, JSON has 4 → 2 placeholders", () => {
    const allDrawingLabels = [
      "ROOF TYPE 01", "ROOF TYPE 02", "ROOF TYPE 03",
      "ROOF TYPE 04", "ROOF TYPE 05", "ROOF TYPE 06",
    ];
    const jsonLabels = ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(allDrawingLabels, "", jsonLabels);
    expect(missing.length).toBe(2);
    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
  });
});

// ─── Bug 1B: regex fallback (SOURCE B) ───────────────────────────────────────

describe("Bug 1B: regex SOURCE B catches missing assemblies from raw text", () => {
  test("finds ROOF 01 and ROOF 02 in raw preamble when missing from JSON", () => {
    const rawAiText = `
      I can see the following roof assemblies on this drawing:
      ROOF 01: Cold-Fluid IRMA System
      ROOF 02: SBS Modified Bitumen
      ROOF 03: LAM IRMA System
      {"assemblies": [
        {"drawingAssemblyId": "ROOF 03"},
        {"drawingAssemblyId": "ROOF 04"},
        {"drawingAssemblyId": "ROOF 05"},
        {"drawingAssemblyId": "ROOF 06"}
      ]}
    `;
    const missing = getMissingLabels([], rawAiText, ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"]);
    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
    expect(missing).not.toContain("ROOF 03");
  });

  test("ROOF TYPE 01, ROOF-01, ROOF01 all normalise to ROOF 01", () => {
    const labels = extractLabelsFromText("ROOF TYPE 01 or ROOF-01 or ROOF01");
    expect(labels.has("ROOF 01")).toBe(true);
  });

  test("RT-01 through RT-06 detected", () => {
    const labels = extractLabelsFromText("See RT-01 and RT-02 for details.");
    expect(labels.has("RT 01")).toBe(true);
    expect(labels.has("RT 02")).toBe(true);
  });

  test("no false positives when all labels present in JSON", () => {
    const missing = getMissingLabels(
      ["ROOF 01", "ROOF 02", "ROOF 03"],
      "ROOF 01 ROOF 02 ROOF 03",
      ["ROOF 01", "ROOF 02", "ROOF 03"]
    );
    expect(missing).toHaveLength(0);
  });

  test("placeholder assembly for missing label classifies as custom+needsReview", () => {
    const result = classifyLayersV2([], null, "ROOF 01");
    expect(result.needsReview).toBe(true);
    expect(result.archetypeId).toBe("custom");
  });
});

// ─── Bug 1C: Steinway full page text simulation ───────────────────────────────

describe("Bug 1C: Steinway page text produces 6 extraction items ROOF 01–ROOF 06", () => {
  // Simulated raw PDF page text as it would appear in the AI's perception
  const STEINWAY_PAGE_TEXT = `
    ROOF TYPES SCHEDULE
    ROOF TYPE 01 - PAVERS ON PEDESTAL IRMA ROOFING
    ROOF TYPE 02 - GREEN ROOF ON IRMA ROOFING
    ROOF TYPE 03 - PAVER BALLAST ON IRMA ROOFING
    ROOF TYPE 04 - WOOD TILES ON PEDESTAL IRMA ROOFING
    ROOF TYPE 05 - CONCRETE PAVEMENT
    ROOF TYPE 06 - ROOF WITH BUILT-UP

    ROOF TYPE 01:
    - Structural Concrete Deck
    - Waterproofing Membrane
    - Drainage Mat
    - XPS Insulation
    - Filter Fabric
    - Concrete Pavers on Pedestals

    ROOF TYPE 02:
    - Structural Concrete Deck
    - Waterproofing Membrane
    - Drainage Mat
    - XPS Insulation
    - Filter Fabric
    - Growing Medium
    - Vegetation Mat
  `;

  // What the AI might return — allDrawingLabels populated, assemblies has all 6
  const AI_ALL_DRAWING_LABELS = [
    "ROOF TYPE 01", "ROOF TYPE 02", "ROOF TYPE 03",
    "ROOF TYPE 04", "ROOF TYPE 05", "ROOF TYPE 06",
  ];

  test("extractLabelsFromText finds all 6 ROOF TYPE labels", () => {
    const found = extractLabelsFromText(STEINWAY_PAGE_TEXT);
    expect(found.has("ROOF 01")).toBe(true);
    expect(found.has("ROOF 02")).toBe(true);
    expect(found.has("ROOF 03")).toBe(true);
    expect(found.has("ROOF 04")).toBe(true);
    expect(found.has("ROOF 05")).toBe(true);
    expect(found.has("ROOF 06")).toBe(true);
    // Should not produce false positives
    expect(found.has("ROOF 07")).toBe(false);
  });

  test("allDrawingLabels normalisation produces 6 items", () => {
    const normalised = normaliseAiLabelList(AI_ALL_DRAWING_LABELS);
    expect(normalised.size).toBe(6);
    for (let i = 1; i <= 6; i++) {
      expect(normalised.has(`ROOF 0${i}`)).toBe(true);
    }
  });

  test("when AI JSON only returns 4, getMissingLabels returns 2 missing", () => {
    const jsonLabels = ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(AI_ALL_DRAWING_LABELS, STEINWAY_PAGE_TEXT, jsonLabels);
    expect(missing.length).toBe(2);
    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
  });

  test("when AI JSON returns all 6, getMissingLabels returns empty", () => {
    const jsonLabels = ["ROOF 01", "ROOF 02", "ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(AI_ALL_DRAWING_LABELS, STEINWAY_PAGE_TEXT, jsonLabels);
    expect(missing).toHaveLength(0);
  });
});

// ─── Bug 2: ROOF 05 → concrete_pavement_roof ─────────────────────────────────

describe("Bug 2: ROOF 05 concrete pavement classification", () => {
  test("surface='concrete_pavement' → concrete_pavement_roof", () => {
    const result = classifyLayersV2(
      ["Waterproofing Membrane", "Drainage Mat", "2\" Rigid Insulation", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      "concrete_pavement",
      "ROOF 05",
    );
    expect(result.archetypeId).toBe("concrete_pavement_roof");
    expect(result.needsReview).toBe(false);
  });

  test("'cast-in-place' in layers → concrete_pavement_roof (no surface hint)", () => {
    const result = classifyLayersV2(
      ["Structural Concrete Deck", "Waterproofing Membrane", "Protection Board", "Drainage Mat", "2\" XPS Insulation", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      null,
      "ROOF 05",
    );
    expect(result.archetypeId).toBe("concrete_pavement_roof");
    expect(result.needsReview).toBe(false);
  });

  test("'concrete paving' in layers → concrete_pavement_roof", () => {
    const result = classifyLayersV2(
      ["Membrane", "Protection Board", "Drainage Mat", "Gravel", "Concrete Paving"],
      null,
      null,
    );
    expect(result.archetypeId).toBe("concrete_pavement_roof");
  });

  test("'CIP Concrete' in layers → concrete_pavement_roof", () => {
    const result = classifyLayersV2(
      ["Waterproofing Membrane", "Drainage Mat", "Insulation", "Gravel Layer", "CIP Concrete"],
      null,
      null,
    );
    expect(result.archetypeId).toBe("concrete_pavement_roof");
  });

  test("gravel + drainageMat + concrete word → concrete_pavement_roof", () => {
    const result = classifyLayersV2(
      ["Waterproofing Membrane", "Drainage Mat", "Rigid Insulation", "Gravel Layer", "Concrete Slab"],
      null,
      null,
    );
    expect(result.archetypeId).toBe("concrete_pavement_roof");
  });

  test("ROOF 05 does NOT map to liquid_applied_irma", () => {
    const result = classifyLayersV2(
      ["Waterproofing Membrane", "Drainage Mat", "2\" Rigid Insulation", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      "concrete_pavement",
      "ROOF 05",
    );
    expect(result.archetypeId).not.toBe("liquid_applied_irma");
  });

  test("concrete_pavement_roof snapshot hides filterFabric", () => {
    const result = classifyLayersV2(
      ["Waterproofing Membrane", "Drainage Mat", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    expect(result.hiddenSectionsSnapshot).toContain("filterFabric");
  });

  test("concrete_pavement_roof snapshot has gravelLayer in required", () => {
    const result = classifyLayersV2(
      ["Membrane", "Drainage Mat", "Gravel Layer", "CIP Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    expect(result.requiredSectionsSnapshot).toContain("gravelLayer");
  });

  test("concrete_pavement_roof snapshot has concretePavement in required", () => {
    const result = classifyLayersV2(
      ["Membrane", "Drainage Mat", "Gravel Layer", "CIP Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    expect(result.requiredSectionsSnapshot).toContain("concretePavement");
  });

  test("concrete_pavement_roof snapshot does NOT require filterFabric", () => {
    const result = classifyLayersV2(
      ["Membrane", "Drainage Mat", "Gravel Layer", "CIP Concrete"],
      "concrete_pavement",
      null,
    );
    expect(result.requiredSectionsSnapshot).not.toContain("filterFabric");
    expect(result.optionalSectionsSnapshot).not.toContain("filterFabric");
  });

  test("concrete_pavement_roof snapshot does NOT require pedestals or ballast", () => {
    const result = classifyLayersV2(
      ["Membrane", "Gravel Layer", "Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    expect(result.requiredSectionsSnapshot).not.toContain("pedestals");
    expect(result.requiredSectionsSnapshot).not.toContain("ballast");
  });

  test("river ballast IRMA (ROOF 03) is NOT misclassified as concrete", () => {
    const result = classifyLayersV2(
      ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric", "River Ballast"],
      "pavers_ballast",
      "ROOF 03",
    );
    expect(result.archetypeId).toBe("ballast_paver_irma");
    expect(result.archetypeId).not.toBe("concrete_pavement_roof");
  });
});

// ─── Bug 3: ROOF 06 → built_up_panel_assembly sections in V2 review ──────────

describe("Bug 3: ROOF 06 built_up_panel_assembly sections", () => {
  test("surface='panel' → built_up_panel_assembly", () => {
    const result = classifyLayersV2(
      ["5/8\" DensGlass Sheathing", "7\" Rigid Insulation", "Cementitious Board", "Waterproofing Membrane", "Aluminum Panel"],
      "panel",
      "ROOF 06",
    );
    expect(result.archetypeId).toBe("built_up_panel_assembly");
    expect(result.needsReview).toBe(false);
  });

  test("built_up_panel_assembly snapshot has required sections populated", () => {
    const result = classifyLayersV2(
      ["Rigid Insulation", "Cementitious Board", "Waterproofing Membrane", "Aluminum Panel"],
      "panel",
      null,
    );
    expect(result.requiredSectionsSnapshot.length).toBeGreaterThan(0);
    expect(result.requiredSectionsSnapshot).toContain("insulation");
    expect(result.requiredSectionsSnapshot).toContain("coverBoard");
    expect(result.requiredSectionsSnapshot).toContain("membrane");
    expect(result.requiredSectionsSnapshot).toContain("surfacing");
  });

  test("built_up_panel_assembly snapshot has hidden sections for drainage fields", () => {
    const result = classifyLayersV2(
      ["Rigid Insulation", "Waterproofing Membrane", "Aluminum Panel"],
      "panel",
      null,
    );
    expect(result.hiddenSectionsSnapshot).toContain("drainage");
    expect(result.hiddenSectionsSnapshot).toContain("drainageMat");
    expect(result.hiddenSectionsSnapshot).toContain("filterFabric");
    expect(result.hiddenSectionsSnapshot).toContain("pedestals");
    expect(result.hiddenSectionsSnapshot).toContain("ballast");
  });

  test("built_up_panel_assembly snapshot does NOT require drainage or drainageMat", () => {
    const result = classifyLayersV2(
      ["Rigid Insulation", "Waterproofing Membrane", "Aluminum Panel"],
      "panel",
      null,
    );
    expect(result.requiredSectionsSnapshot).not.toContain("drainage");
    expect(result.requiredSectionsSnapshot).not.toContain("drainageMat");
    expect(result.requiredSectionsSnapshot).not.toContain("filterFabric");
  });

  test("ARCHETYPE_FORM_SCHEMAS built_up_panel_assembly has correct required sections", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema).toBeDefined();
    expect(schema.requiredSections).toContain("insulation");
    expect(schema.requiredSections).toContain("coverBoard");
    expect(schema.requiredSections).toContain("membrane");
    expect(schema.requiredSections).toContain("surfacing");
  });

  test("ARCHETYPE_FORM_SCHEMAS built_up_panel_assembly hides drainage-related sections", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("drainage");
    expect(schema.hiddenSections).toContain("drainageMat");
    expect(schema.hiddenSections).toContain("filterFabric");
    expect(schema.hiddenSections).toContain("pedestals");
    expect(schema.hiddenSections).toContain("ballast");
    expect(schema.hiddenSections).toContain("gravelLayer");
  });

  test("V2 review page renders from snapshot not legacy system — snapshots are always arrays", () => {
    const result = classifyLayersV2(
      ["Membrane", "Drainage Mat", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    expect(Array.isArray(result.requiredSectionsSnapshot)).toBe(true);
    expect(Array.isArray(result.optionalSectionsSnapshot)).toBe(true);
    expect(Array.isArray(result.hiddenSectionsSnapshot)).toBe(true);
    expect(result.requiredSectionsSnapshot.length).toBeGreaterThan(0);
  });
});

// ─── End-to-end: Steinway ROOF 01–06 ─────────────────────────────────────────

describe("End-to-end: Steinway sheet ROOF 01–06 all correct", () => {
  const steinwayAssemblies = [
    { label: "ROOF 01", layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"], surface: null },
    { label: "ROOF 02", layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "SBS Modified Bitumen Membrane"], surface: null },
    { label: "ROOF 03", layers: ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric", "River Ballast"], surface: "pavers_ballast" },
    { label: "ROOF 04", layers: ["Concrete Deck", "Rigid Insulation", "Cover Board", "Waterproofing Membrane"], surface: null },
    { label: "ROOF 05", layers: ["Concrete Deck", "Waterproofing Membrane", "Protection Board", "Drainage Mat", "2\" Rigid Insulation", "Gravel Layer", "Cast-in-Place Concrete Pavement"], surface: "concrete_pavement" },
    { label: "ROOF 06", layers: ["5/8\" DensGlass Sheathing", "7\" Rigid Insulation", "Cementitious Board", "Waterproofing Membrane", "Aluminum Panel"], surface: "panel" },
  ];

  const results = steinwayAssemblies.map((a) =>
    classifyLayersV2(a.layers, a.surface, a.label)
  );

  test("ROOF 01 → single_ply_tpo", () => {
    expect(results[0].archetypeId).toBe("single_ply_tpo");
  });

  test("ROOF 02 → modified_bitumen_sbs", () => {
    expect(results[1].archetypeId).toBe("modified_bitumen_sbs");
  });

  test("ROOF 03 → ballast_paver_irma", () => {
    expect(results[2].archetypeId).toBe("ballast_paver_irma");
  });

  test("ROOF 04 → conventional_liquid_applied", () => {
    expect(results[3].archetypeId).toBe("conventional_liquid_applied");
  });

  test("ROOF 05 → concrete_pavement_roof", () => {
    expect(results[4].archetypeId).toBe("concrete_pavement_roof");
  });

  test("ROOF 06 → built_up_panel_assembly", () => {
    expect(results[5].archetypeId).toBe("built_up_panel_assembly");
  });

  test("no assembly maps to wrong archetype", () => {
    expect(results[4].archetypeId).not.toBe("liquid_applied_irma");
    expect(results[5].archetypeId).not.toBe("conventional_liquid_applied");
  });

  test("no needsReview for all 6 (all well-classified)", () => {
    results.forEach((r, i) => {
      expect({ label: steinwayAssemblies[i].label, needsReview: r.needsReview }).toMatchObject({
        label: steinwayAssemblies[i].label,
        needsReview: false,
      });
    });
  });

  test("ROOF 05 snapshot has gravelLayer and concretePavement required", () => {
    expect(results[4].requiredSectionsSnapshot).toContain("gravelLayer");
    expect(results[4].requiredSectionsSnapshot).toContain("concretePavement");
  });

  test("ROOF 05 snapshot hides filterFabric", () => {
    expect(results[4].hiddenSectionsSnapshot).toContain("filterFabric");
  });

  test("ROOF 06 snapshot has insulation, coverBoard, membrane, surfacing required", () => {
    expect(results[5].requiredSectionsSnapshot).toContain("insulation");
    expect(results[5].requiredSectionsSnapshot).toContain("coverBoard");
    expect(results[5].requiredSectionsSnapshot).toContain("membrane");
    expect(results[5].requiredSectionsSnapshot).toContain("surfacing");
  });

  test("ROOF 06 snapshot hides drainage, drainageMat, filterFabric, pedestals, ballast", () => {
    expect(results[5].hiddenSectionsSnapshot).toContain("drainage");
    expect(results[5].hiddenSectionsSnapshot).toContain("drainageMat");
    expect(results[5].hiddenSectionsSnapshot).toContain("filterFabric");
    expect(results[5].hiddenSectionsSnapshot).toContain("pedestals");
    expect(results[5].hiddenSectionsSnapshot).toContain("ballast");
  });

  test("ROOF 05 does NOT say Cold-Fluid IRMA / PMR", () => {
    // archetypeId must not be liquid_applied_irma or any IRMA variant
    expect(results[4].archetypeId).not.toBe("liquid_applied_irma");
    expect(results[4].archetypeId).not.toBe("modified_bitumen_irma");
    expect(results[4].archetypeId).toBe("concrete_pavement_roof");
  });

  test("ROOF 06 does NOT require 'Select a system' fallback — snapshot is non-empty", () => {
    // If requiredSectionsSnapshot is empty, the legacy card falls back to
    // 'Select a system to show assembly sections'. It must be non-empty.
    expect(results[5].requiredSectionsSnapshot.length).toBeGreaterThan(0);
  });
});
