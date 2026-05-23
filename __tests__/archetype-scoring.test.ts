/**
 * V2 Archetype Scoring Tests
 *
 * All tests are pattern-based, not project-specific.
 * Classification must generalize across architects, projects, and legend styles.
 *
 * Test structure:
 *   1. Semantic signal tests — each archetype by its defining layer patterns
 *   2. Priority ordering — when multiple signals present, correct one wins
 *   3. Negative cases — greedy-match prevention
 *   4. Multi-project regression — Steinway, Greenpoint, Arverne, generic
 *   5. Section snapshot verification — requiredSections match archetype
 *   6. Audit trail — scoring breakdown populated
 */

import { describe, test, expect } from "vitest";
import { classifyLayersV2 } from "../lib/bidshield/archetype-scoring";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classify(layers: string[], hint?: string) {
  return classifyLayersV2(layers, hint ?? null, null);
}

// ─── 1. Semantic signal tests ─────────────────────────────────────────────────

describe("pedestal_paver_irma — semantic signals", () => {
  test("pedestal keyword in layers", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
      "Concrete Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("'pavers on pedestal' phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Pavers on Pedestal",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("'wood tiles on pedestal' phrase", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Wood Tiles on Pedestal",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("adjustable pedestal system phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Adjustable Pedestal System",
      "Porcelain Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("needsReview is false", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Pedestals",
    ]);
    expect(r.needsReview).toBe(false);
  });

  test("requiredSections includes pedestals", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("pedestals");
  });

  test("requiredSections includes drainageMat", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("drainageMat");
  });

  test("requiredSections includes filterFabric", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("filterFabric");
  });

  test("hiddenSections does NOT include pedestals", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
    ]);
    expect(r.hiddenSectionsSnapshot).not.toContain("pedestals");
  });
});

describe("green_roof_irma — semantic signals", () => {
  test("'green roof' phrase in layers", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Growing Media",
      "Green Roof",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("root barrier token alone (with drainage mat)", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Vegetation Layer",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("vegetated roof phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Vegetated Roof",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("planting media phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Planting Media",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("growth medium phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Growth Medium",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("needsReview is false", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
    ]);
    expect(r.needsReview).toBe(false);
  });

  test("requiredSections includes greenRoof", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("greenRoof");
  });

  test("requiredSections includes rootBarrier", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("rootBarrier");
  });

  test("requiredSections includes filterFabric", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("filterFabric");
  });

  test("hiddenSections does NOT include rootBarrier", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
    ]);
    expect(r.hiddenSectionsSnapshot).not.toContain("rootBarrier");
  });
});

describe("ballast_paver_irma — semantic signals", () => {
  test("'river ballast' in layers", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("'paver ballast' phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("'lock-down paver ballast' phrase", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Lock-Down Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("'concrete paver ballast' phrase — ballast not pavement", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Concrete Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("'lock-down precast concrete paver ballast' full legend text", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Lock-Down Precast Concrete Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("needsReview is false", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.needsReview).toBe(false);
  });

  test("requiredSections includes ballast", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("ballast");
  });

  test("requiredSections includes drainageMat", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("drainageMat");
  });

  test("hiddenSections does NOT include ballast", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.hiddenSectionsSnapshot).not.toContain("ballast");
  });
});

describe("concrete_pavement_roof — exact phrase only", () => {
  test("'concrete pavement' exact phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "Gravel Layer",
      "Concrete Pavement",
    ]);
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("'cast-in-place concrete pavement' phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("CIP pavement phrase", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "CIP Pavement",
    ]);
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("surface hint concrete_pavement", () => {
    const r = classify(
      ["Waterproofing Membrane", "Protection Board", "Drainage Mat", "Gravel Layer"],
      "concrete_pavement"
    );
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("requiredSections includes gravelLayer", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("gravelLayer");
  });

  test("requiredSections includes concretePavement", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("concretePavement");
  });

  test("hiddenSections includes filterFabric", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.hiddenSectionsSnapshot).toContain("filterFabric");
  });

  test("needsReview is false", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.needsReview).toBe(false);
  });
});

describe("built_up_panel_assembly — semantic signals", () => {
  test("aluminum panel in layers", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });

  test("metal panel phrase", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Metal Panel",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });

  test("DensGlass sheathing", () => {
    const r = classify([
      '5/8" DensGlass Sheathing',
      '7" Rigid Insulation',
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ], "panel");
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });

  test("cladding panel phrase", () => {
    const r = classify([
      "Rigid Insulation",
      "Waterproofing Membrane",
      "Cladding Panel",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });

  test("curtain wall phrase", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Curtain Wall Assembly",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });

  test("needsReview is false", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.needsReview).toBe(false);
  });

  test("requiredSections includes insulation", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("insulation");
  });

  test("requiredSections includes membrane", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("membrane");
  });

  test("requiredSections includes surfacing", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.requiredSectionsSnapshot).toContain("surfacing");
  });

  test("hiddenSections includes drainage", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.hiddenSectionsSnapshot).toContain("drainage");
  });

  test("hiddenSections includes drainageMat", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.hiddenSectionsSnapshot).toContain("drainageMat");
  });
});

// ─── 2. Priority ordering ─────────────────────────────────────────────────────

describe("Priority ordering — specific overburden beats generic IRMA", () => {
  test("pedestal beats liquid_applied_irma when pedestal present", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
      "Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
    expect(r.archetypeId).not.toBe("liquid_applied_irma");
  });

  test("ballast beats liquid_applied_irma when ballast present", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
    expect(r.archetypeId).not.toBe("liquid_applied_irma");
  });

  test("green roof beats liquid_applied_irma when green roof present", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Growing Media",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
    expect(r.archetypeId).not.toBe("liquid_applied_irma");
  });

  test("green roof beats pedestal when both present (green is higher priority)", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Green Roof",
      "Adjustable Pedestals",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("panel beats concrete pavement when panel signals present without drainageMat", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });
});

// ─── 3. Negative cases — greedy-match prevention ─────────────────────────────

describe("concrete_pavement_roof — must NOT fire on generic concrete terms", () => {
  test("'concrete paver ballast' → ballast_paver_irma NOT concrete_pavement_roof", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Concrete Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });

  test("'pavers on pedestal irma roofing' → pedestal_paver_irma NOT concrete_pavement_roof", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Pavers on Pedestal",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });

  test("'concrete deck' alone does NOT trigger concrete_pavement_roof", () => {
    const r = classify([
      "Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });

  test("'concrete slab' does NOT trigger concrete_pavement_roof", () => {
    const r = classify([
      "Concrete Slab",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
    ]);
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });

  test("built-up panel does NOT trigger concrete_pavement_roof", () => {
    const r = classify([
      "Rigid Insulation",
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ]);
    expect(r.archetypeId).not.toBe("concrete_pavement_roof");
  });
});

describe("pedestal_paver_irma — must NOT fire without drainage mat", () => {
  test("pedestal without drainage mat does not override — falls to scoring", () => {
    const r = classify([
      "TPO Membrane",
      "Polyiso Insulation",
      "Cover Board",
      "Pedestals",
    ]);
    // Without drainageMat, override should not fire — scored normally
    expect(r.archetypeId).not.toBe("pedestal_paver_irma");
  });
});

describe("ballast_paver_irma — must NOT fire without drainage mat", () => {
  test("ballast without drainage mat does not override", () => {
    const r = classify([
      "TPO Membrane",
      "Polyiso Insulation",
      "Cover Board",
      "River Stone Ballast",
    ]);
    // EPDM ballast-retained is valid — should not force ballast_paver_irma
    expect(r.archetypeId).not.toBe("ballast_paver_irma");
  });
});

// ─── 4. Multi-project regression suites ──────────────────────────────────────

describe("Steinway project — 6 roof assemblies", () => {
  // All patterns derived from semantic layer content, not roof label numbers

  test("IRMA / PMR with pavers on pedestal → pedestal_paver_irma", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Cold-Fluid Applied Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Adjustable Pedestals",
      "Concrete Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("IRMA / PMR with green roof overburden → green_roof_irma", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Cold-Fluid Applied Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Root Barrier",
      "Growing Media",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("IRMA / PMR with lock-down paver ballast → ballast_paver_irma", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Cold-Fluid Applied Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Lock-Down Precast Concrete Paver Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("IRMA / PMR with pedestal (second assembly) → pedestal_paver_irma", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Cold-Fluid Applied Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "Filter Fabric",
      "Adjustable Pedestal System",
      "Porcelain Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("CIP concrete pavement over IRMA → concrete_pavement_roof", () => {
    const r = classify([
      "Structural Concrete Deck",
      "Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "Rigid Insulation",
      "Gravel Layer",
      "Cast-in-Place Concrete Pavement",
    ]);
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("Built-up rigid insulation with aluminum panel → built_up_panel_assembly", () => {
    const r = classify([
      '5/8" DensGlass Sheathing',
      '7" Rigid Insulation',
      "Cementitious Board",
      "Waterproofing Membrane",
      "Aluminum Panel",
    ], "panel");
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });
});

describe("Greenpoint project — typical NYC waterfront assemblies", () => {
  test("plaza deck with river ballast → ballast_paver_irma", () => {
    const r = classify([
      "Concrete Deck",
      "Fluid-Applied Waterproofing",
      "Drainage Mat",
      "2\" XPS Insulation",
      "Filter Fabric",
      "River Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("sustainable roof zone (vegetated) → green_roof_irma", () => {
    const r = classify([
      "Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Sustainable Roof Zone",
      "Growing Media",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("conventional TPO over steel deck → single_ply_tpo", () => {
    const r = classify([
      "Steel Deck",
      "Polyiso Insulation",
      "Cover Board",
      "TPO Membrane",
    ]);
    expect(r.archetypeId).toBe("single_ply_tpo");
  });

  test("conventional LAM over concrete → conventional_liquid_applied", () => {
    const r = classify([
      "Concrete Deck",
      "Rigid Insulation",
      "Cover Board",
      "Waterproofing Membrane",
    ]);
    expect(r.archetypeId).toBe("conventional_liquid_applied");
  });
});

describe("Arverne project — Far Rockaway coastal assemblies", () => {
  test("IRMA with stone ballast over concrete → ballast_paver_irma", () => {
    const r = classify([
      "Concrete Deck",
      "Fluid Applied Waterproofing Membrane",
      "Drainage Mat",
      "4\" XPS Insulation",
      "Filter Fabric",
      "Stone Ballast",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("pedestal paver plaza deck → pedestal_paver_irma", () => {
    const r = classify([
      "Concrete Deck",
      "Waterproofing Membrane",
      "Protection Board",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
      "Buzon Pedestals",
      "Precast Concrete Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("SBS modified bitumen conventional → modified_bitumen_sbs", () => {
    const r = classify([
      "Steel Deck",
      "Polyiso Insulation",
      "Cover Board",
      "SBS Modified Bitumen Membrane",
    ]);
    expect(r.archetypeId).toBe("modified_bitumen_sbs");
  });
});

describe("Generic — future uploaded jobs, unknown architects", () => {
  test("any assembly with paver supports → pedestal_paver_irma", () => {
    const r = classify([
      "Membrane",
      "Drainage Mat",
      "Insulation",
      "Filter Fabric",
      "Paver Supports",
      "Pavers",
    ]);
    expect(r.archetypeId).toBe("pedestal_paver_irma");
  });

  test("any assembly with sedum tray → green_roof_irma", () => {
    const r = classify([
      "Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Root Barrier",
      "Sedum Tray",
    ]);
    expect(r.archetypeId).toBe("green_roof_irma");
  });

  test("any assembly with aggregate ballast → ballast_paver_irma", () => {
    const r = classify([
      "Membrane",
      "Drainage Mat",
      "Insulation",
      "Filter Fabric",
      "Aggregate",
    ]);
    expect(r.archetypeId).toBe("ballast_paver_irma");
  });

  test("CIP concrete pavement minimal layers → concrete_pavement_roof", () => {
    const r = classify([
      "Membrane",
      "Drainage Mat",
      "CIP Concrete Pavement",
    ]);
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("DensGlass + insulation panel assembly → built_up_panel_assembly", () => {
    const r = classify([
      "DensGlass Sheathing",
      "Rigid Insulation",
      "Waterproofing Membrane",
      "Metal Panel",
    ]);
    expect(r.archetypeId).toBe("built_up_panel_assembly");
  });
});

// ─── 5. Known-good archetypes still classify correctly ───────────────────────

describe("Existing archetypes — no regressions", () => {
  test("single_ply_tpo", () => {
    expect(classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"]).archetypeId)
      .toBe("single_ply_tpo");
  });

  test("single_ply_pvc", () => {
    expect(classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "PVC Membrane"]).archetypeId)
      .toBe("single_ply_pvc");
  });

  test("single_ply_epdm", () => {
    expect(classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "EPDM Membrane"]).archetypeId)
      .toBe("single_ply_epdm");
  });

  test("modified_bitumen_sbs", () => {
    expect(classify([
      "Steel Deck", "Polyiso Insulation", "Cover Board", "SBS Modified Bitumen Membrane",
    ]).archetypeId).toBe("modified_bitumen_sbs");
  });

  test("conventional_liquid_applied", () => {
    expect(classify([
      "Concrete Deck", "Rigid Insulation", "Cover Board", "Waterproofing Membrane",
    ]).archetypeId).toBe("conventional_liquid_applied");
  });

  test("liquid_applied_irma — bare IRMA without specific overburden", () => {
    // No ballast, no pedestal, no green roof — generic IRMA
    expect(classify([
      "Concrete Deck",
      "Waterproofing Membrane",
      "Drainage Mat",
      "XPS Insulation",
      "Filter Fabric",
    ]).archetypeId).toBe("liquid_applied_irma");
  });

  test("none of the 8 base archetypes fall back to custom", () => {
    const assemblies = [
      { layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"] },
      { layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "PVC Membrane"] },
      { layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "EPDM Membrane"] },
      { layers: ["Steel Deck", "Polyiso Insulation", "Cover Board", "SBS Modified Bitumen Membrane"] },
      { layers: ["Concrete Deck", "Rigid Insulation", "Cover Board", "Waterproofing Membrane"] },
      { layers: ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric"] },
      { layers: ["Rigid Insulation", "Cementitious Board", "Waterproofing Membrane", "Aluminum Panel"], hint: "panel" },
      { layers: ["Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric", "River Ballast"] },
      { layers: ["Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric", "Adjustable Pedestals"] },
      { layers: ["Waterproofing Membrane", "Drainage Mat", "Filter Fabric", "Root Barrier", "Green Roof"] },
      { layers: ["Waterproofing Membrane", "Drainage Mat", "Rigid Insulation", "Gravel Layer", "Cast-in-Place Concrete Pavement"] },
    ];
    for (const a of assemblies) {
      const r = classify(a.layers, a.hint);
      expect(r.archetypeId, `Expected non-custom for: ${a.layers.slice(-1)[0]}`).not.toBe("custom");
    }
  });
});

// ─── 6. Audit trail integrity ─────────────────────────────────────────────────

describe("Audit trail", () => {
  test("scoring path populates attemptedArchetypes", () => {
    const r = classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"]);
    expect(Array.isArray(r.audit.attemptedArchetypes)).toBe(true);
    expect(r.audit.attemptedArchetypes.length).toBeGreaterThan(0);
  });

  test("audit.timestamp is a positive number", () => {
    const r = classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"]);
    expect(r.audit.timestamp).toBeGreaterThan(0);
  });

  test("normalizedLayerTokens is an array", () => {
    const r = classify(["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"]);
    expect(Array.isArray(r.audit.normalizedLayerTokens)).toBe(true);
  });

  test("override path still returns valid section snapshots", () => {
    const r = classify([
      "Waterproofing Membrane",
      "Drainage Mat",
      "Filter Fabric",
      "Adjustable Pedestals",
    ]);
    expect(Array.isArray(r.requiredSectionsSnapshot)).toBe(true);
    expect(r.requiredSectionsSnapshot.length).toBeGreaterThan(0);
    expect(Array.isArray(r.hiddenSectionsSnapshot)).toBe(true);
  });
});
