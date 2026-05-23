/**
 * V2 regression tests — Steinway sheet bugs
 *
 * Covers the three failures reported after Phase 5A:
 *   1. ROOF 01 / ROOF 02 missing from extraction
 *   2. ROOF 05 still classified as liquid_applied_irma
 *   3. V2 review page not rendering sections from snapshots
 */

import { describe, test, expect } from "vitest";
import { classifyLayersV2 } from "../lib/bidshield/archetype-scoring";
import { ARCHETYPE_FORM_SCHEMAS } from "../lib/bidshield/archetype-form-bridge";

// ─── Re-export label scanner for testing ─────────────────────────────────────
// Mirror of extractLabelsFromText from the route

const DRAWING_LABEL_PATTERN = /\b((?:ROOF|RT|ROOF TYPE|R)[-\s]?0*([1-9][0-9]?))\b/gi;

function extractLabelsFromText(rawText: string): Set<string> {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(DRAWING_LABEL_PATTERN.source, "gi");
  while ((match = re.exec(rawText)) !== null) {
    const raw = match[0];
    const spaced = raw.replace(/([A-Za-z])(\d)/, "$1 $2").replace(/[-\s]+/, " ");
    const normalised = spaced
      .replace(/0*(\d+)$/, (_, n) => String(n).padStart(2, "0"))
      .toUpperCase()
      .trim();
    found.add(normalised);
  }
  return found;
}

function getMissingLabels(rawText: string, jsonLabels: string[]): string[] {
  const labelsInResponse = extractLabelsFromText(rawText);
  const labelsInJson = new Set(jsonLabels.map((l) => l.toUpperCase().trim()));
  const missing: string[] = [];
  for (const label of labelsInResponse) {
    if (!labelsInJson.has(label)) {
      missing.push(label);
    }
  }
  return missing;
}

// ─── Bug 1: Missing labels post-processor ────────────────────────────────────

describe("Bug 1: V2 label post-processor catches missing assemblies", () => {
  test("finds ROOF 01 and ROOF 02 in raw text when missing from JSON", () => {
    // AI returned only ROOF 03–06 in JSON, but raw text mentions all 6
    const rawAiText = `
      I can see the following roof assemblies on this drawing:
      ROOF 01: Cold-Fluid IRMA System
      ROOF 02: SBS Modified Bitumen
      ROOF 03: LAM IRMA System
      {"assemblies": [
        {"drawingAssemblyId": "ROOF 03", ...},
        {"drawingAssemblyId": "ROOF 04", ...},
        {"drawingAssemblyId": "ROOF 05", ...},
        {"drawingAssemblyId": "ROOF 06", ...}
      ]}
    `;
    const jsonLabels = ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(rawAiText, jsonLabels);

    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
    expect(missing).not.toContain("ROOF 03");
  });

  test("handles normalized label formats: ROOF01, ROOF-01, ROOF 01 all match", () => {
    const rawText = "ROOF01 is a TPO system. ROOF-02 is SBS.";
    const labels = extractLabelsFromText(rawText);
    expect(labels.has("ROOF 01")).toBe(true);
    expect(labels.has("ROOF 02")).toBe(true);
  });

  test("no false positives when all labels are in JSON", () => {
    const rawText = "ROOF 01 ROOF 02 ROOF 03";
    const jsonLabels = ["ROOF 01", "ROOF 02", "ROOF 03"];
    const missing = getMissingLabels(rawText, jsonLabels);
    expect(missing).toHaveLength(0);
  });

  test("RT-01 through RT-06 are also detected", () => {
    const rawText = "See RT-01 and RT-02 for details.";
    const labels = extractLabelsFromText(rawText);
    expect(labels.has("RT 01")).toBe(true);
    expect(labels.has("RT 02")).toBe(true);
  });

  test("placeholder assembly for missing label has needsReview=true", () => {
    // A placeholder has no layers — classifyLayersV2 with empty layers
    const result = classifyLayersV2([], null, "ROOF 01");
    expect(result.needsReview).toBe(true);
    expect(result.archetypeId).toBe("custom");
  });

  test("Steinway sheet scenario: AI mentions all 6, JSON only has 4", () => {
    const rawText = `
      Drawing sheet A-501 Roof Plan contains the following assemblies:
      ROOF 01 - TPO Roofing System at Level 7
      ROOF 02 - SBS Modified Bitumen System
      The following were extracted:
      {"assemblies": [
        {"drawingAssemblyId": "ROOF 03"},
        {"drawingAssemblyId": "ROOF 04"},
        {"drawingAssemblyId": "ROOF 05"},
        {"drawingAssemblyId": "ROOF 06"}
      ]}
    `;
    const jsonLabels = ["ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"];
    const missing = getMissingLabels(rawText, jsonLabels);

    expect(missing.length).toBe(2);
    expect(missing).toContain("ROOF 01");
    expect(missing).toContain("ROOF 02");
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
    // River ballast ≠ concrete pavement — must stay liquid_applied_irma
    const result = classifyLayersV2(
      ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric", "River Ballast"],
      "pavers_ballast",
      "ROOF 03",
    );
    expect(result.archetypeId).toBe("liquid_applied_irma");
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

  test("V2 review page renders from snapshot not legacy system — no required sections means empty array not null", () => {
    // The review page renders item.requiredSectionsSnapshot directly.
    // A concrete_pavement_roof item must have non-null, non-empty snapshot.
    const result = classifyLayersV2(
      ["Membrane", "Drainage Mat", "Gravel Layer", "Cast-in-Place Concrete Pavement"],
      "concrete_pavement",
      null,
    );
    // The snapshot is always an array (never undefined/null) — review page can join() it safely
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

  test("ROOF 03 → liquid_applied_irma", () => {
    expect(results[2].archetypeId).toBe("liquid_applied_irma");
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
});
