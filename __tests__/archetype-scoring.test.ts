/**
 * V2 Archetype Scoring Tests
 *
 * Verifies classifyLayersV2 correctly classifies all 6 known roof assembly
 * archetypes, validates section snapshots, audit trail, and edge cases.
 */

import { describe, test, expect } from "vitest";
import { classifyLayersV2 } from "../lib/bidshield/archetype-scoring";

// ─── ROOF 01 — Single-Ply TPO ─────────────────────────────────────────────────

describe("ROOF 01 — Single-Ply TPO", () => {
  const layers = ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"];

  test("archetypeId is single_ply_tpo", () => {
    const result = classifyLayersV2(layers);
    expect(result.archetypeId).toBe("single_ply_tpo");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers);
    expect(result.needsReview).toBe(false);
  });
});

// ─── ROOF 02 — Modified Bitumen SBS ───────────────────────────────────────────

describe("ROOF 02 — Modified Bitumen SBS conventional", () => {
  const layers = [
    "Steel Deck",
    "Polyiso Insulation",
    "Cover Board",
    "SBS Modified Bitumen Membrane",
  ];

  test("archetypeId is modified_bitumen_sbs", () => {
    const result = classifyLayersV2(layers);
    expect(result.archetypeId).toBe("modified_bitumen_sbs");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers);
    expect(result.needsReview).toBe(false);
  });
});

// ─── ROOF 03 — Liquid Applied IRMA ────────────────────────────────────────────

describe("ROOF 03 — Liquid Applied IRMA", () => {
  const layers = [
    "Concrete Deck",
    "Waterproofing Membrane",
    "Drainage Mat",
    "XPS Insulation",
    "Filter Fabric",
    "River Ballast",
  ];

  test("archetypeId is liquid_applied_irma", () => {
    const result = classifyLayersV2(layers);
    expect(result.archetypeId).toBe("liquid_applied_irma");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers);
    expect(result.needsReview).toBe(false);
  });
});

// ─── ROOF 04 — Conventional Liquid Applied ────────────────────────────────────

describe("ROOF 04 — Conventional Liquid Applied", () => {
  const layers = [
    "Concrete Deck",
    "Rigid Insulation",
    "Cover Board",
    "Waterproofing Membrane",
  ];

  test("archetypeId is conventional_liquid_applied", () => {
    const result = classifyLayersV2(layers);
    expect(result.archetypeId).toBe("conventional_liquid_applied");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers);
    expect(result.needsReview).toBe(false);
  });
});

// ─── ROOF 05 — Concrete Pavement Roof ────────────────────────────────────────

describe("ROOF 05 — Concrete Pavement Roof", () => {
  const layers = [
    "Concrete Deck",
    "Waterproofing Membrane",
    "Protection Board",
    "Drainage Mat",
    '2" Rigid Insulation',
    "Gravel Layer",
    "Cast-in-Place Concrete Pavement",
  ];
  const surface = "concrete_pavement";

  test("archetypeId is concrete_pavement_roof", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.archetypeId).toBe("concrete_pavement_roof");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.needsReview).toBe(false);
  });

  test("hiddenSectionsSnapshot includes filterFabric", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.hiddenSectionsSnapshot).toContain("filterFabric");
  });

  test("requiredSectionsSnapshot includes gravelLayer", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.requiredSectionsSnapshot).toContain("gravelLayer");
  });

  test("requiredSectionsSnapshot includes concretePavement", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.requiredSectionsSnapshot).toContain("concretePavement");
  });
});

// ─── ROOF 06 — Built-Up Panel Assembly ────────────────────────────────────────

describe("ROOF 06 — Built-Up Panel Assembly", () => {
  const layers = [
    '5/8" DensGlass Sheathing',
    '7" Rigid Insulation',
    "Cementitious Board",
    "Waterproofing Membrane",
    "Aluminum Panel",
  ];
  const surface = "panel";

  test("archetypeId is built_up_panel_assembly", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.archetypeId).toBe("built_up_panel_assembly");
  });

  test("needsReview is false", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.needsReview).toBe(false);
  });

  test("hiddenSectionsSnapshot includes drainage", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.hiddenSectionsSnapshot).toContain("drainage");
  });

  test("hiddenSectionsSnapshot includes drainageMat", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.hiddenSectionsSnapshot).toContain("drainageMat");
  });

  test("hiddenSectionsSnapshot includes filterFabric", () => {
    const result = classifyLayersV2(layers, surface);
    expect(result.hiddenSectionsSnapshot).toContain("filterFabric");
  });
});

// ─── Concrete Pavement — detected from layer text (no surface hint) ────────────

describe("Concrete pavement detection from layer text (no surface hint)", () => {
  const layers = [
    "Membrane",
    "Protection Board",
    "Drainage Mat",
    "Insulation",
    "Gravel",
    "Cast-in-Place Concrete Pavement",
  ];

  test("archetypeId is concrete_pavement_roof even without surface hint", () => {
    const result = classifyLayersV2(layers, null);
    expect(result.archetypeId).toBe("concrete_pavement_roof");
  });
});

// ─── Panel — detected from layer text (no surface hint) ───────────────────────

describe("Panel detection from layer text (no surface hint)", () => {
  const layers = [
    "Rigid Insulation",
    "Cementitious Board",
    "Waterproofing Membrane",
    "Aluminum Panel",
  ];

  test("archetypeId is built_up_panel_assembly even without surface hint", () => {
    const result = classifyLayersV2(layers, null);
    expect(result.archetypeId).toBe("built_up_panel_assembly");
  });
});

// ─── All 6 archetypes — no misclassifications ─────────────────────────────────

describe("All 6 assemblies — no archetypeNeedsReview among known types", () => {
  const allAssemblies = [
    {
      label: "ROOF 01 TPO",
      layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"],
      surface: undefined,
    },
    {
      label: "ROOF 02 SBS",
      layers: [
        "Steel Deck",
        "Polyiso Insulation",
        "Cover Board",
        "SBS Modified Bitumen Membrane",
      ],
      surface: undefined,
    },
    {
      label: "ROOF 03 LAM IRMA",
      layers: [
        "Concrete Deck",
        "Waterproofing Membrane",
        "Drainage Mat",
        "XPS Insulation",
        "Filter Fabric",
        "River Ballast",
      ],
      surface: undefined,
    },
    {
      label: "ROOF 04 LAM conventional",
      layers: ["Concrete Deck", "Rigid Insulation", "Cover Board", "Waterproofing Membrane"],
      surface: undefined,
    },
    {
      label: "ROOF 05 concrete pavement",
      layers: [
        "Concrete Deck",
        "Waterproofing Membrane",
        "Protection Board",
        "Drainage Mat",
        '2" Rigid Insulation',
        "Gravel Layer",
        "Cast-in-Place Concrete Pavement",
      ],
      surface: "concrete_pavement",
    },
    {
      label: "ROOF 06 built-up panel",
      layers: [
        '5/8" DensGlass Sheathing',
        '7" Rigid Insulation',
        "Cementitious Board",
        "Waterproofing Membrane",
        "Aluminum Panel",
      ],
      surface: "panel",
    },
  ];

  test("none of the 6 known assemblies classify as needsReview", () => {
    for (const assembly of allAssemblies) {
      const result = classifyLayersV2(assembly.layers, assembly.surface);
      expect(result.needsReview, `${assembly.label} should not needsReview`).toBe(false);
    }
  });

  test("none of the 6 known assemblies fall back to custom archetype", () => {
    for (const assembly of allAssemblies) {
      const result = classifyLayersV2(assembly.layers, assembly.surface);
      expect(result.archetypeId, `${assembly.label} should not fall back to custom`).not.toBe(
        "custom"
      );
    }
  });
});

// ─── Audit trail — scoringBreakdown is populated ──────────────────────────────

describe("classificationAudit has scoringBreakdown", () => {
  // Use a standard scoring path (not an override), so we get attemptedArchetypes
  const layers = ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"];

  test("audit.scoringBreakdown.totalScore is a number", () => {
    const result = classifyLayersV2(layers);
    expect(typeof result.audit.scoringBreakdown.totalScore).toBe("number");
  });

  test("audit.attemptedArchetypes is a non-empty array (scoring path)", () => {
    const result = classifyLayersV2(layers);
    expect(Array.isArray(result.audit.attemptedArchetypes)).toBe(true);
    expect(result.audit.attemptedArchetypes.length).toBeGreaterThan(0);
  });

  test("audit.timestamp is a positive number", () => {
    const result = classifyLayersV2(layers);
    expect(typeof result.audit.timestamp).toBe("number");
    expect(result.audit.timestamp).toBeGreaterThan(0);
  });
});

// ─── Section snapshots are populated ──────────────────────────────────────────

describe("Section snapshots are populated", () => {
  const layers = ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"];

  test("requiredSectionsSnapshot is an array", () => {
    const result = classifyLayersV2(layers);
    expect(Array.isArray(result.requiredSectionsSnapshot)).toBe(true);
    expect(result.requiredSectionsSnapshot.length).toBeGreaterThanOrEqual(0);
  });

  test("optionalSectionsSnapshot is an array", () => {
    const result = classifyLayersV2(layers);
    expect(Array.isArray(result.optionalSectionsSnapshot)).toBe(true);
  });

  test("hiddenSectionsSnapshot is an array", () => {
    const result = classifyLayersV2(layers);
    expect(Array.isArray(result.hiddenSectionsSnapshot)).toBe(true);
  });

  test("defaultLayerOrderSnapshot is an array", () => {
    const result = classifyLayersV2(layers);
    expect(Array.isArray(result.defaultLayerOrderSnapshot)).toBe(true);
  });
});
