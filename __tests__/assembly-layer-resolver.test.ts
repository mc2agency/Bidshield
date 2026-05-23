/**
 * Assembly Layer Resolver Tests
 *
 * All tests are pattern-based. No project names, roof label numbers, or
 * Steinway-specific strings. Each test validates:
 *   - fullLayerStack composition (base + modifier, deduplicated)
 *   - baseStack contains IRMA structural layers when applicable
 *   - modifierStack contains overburden layers
 *   - sectionValues extracted from layers (not hardcoded)
 */

import { describe, test, expect } from "vitest";
import { resolveFullLayerStack } from "../lib/bidshield/assembly-layer-resolver";

// ─── pedestal_paver_irma ──────────────────────────────────────────────────────

describe("pedestal_paver_irma — full IRMA stack from AI layers", () => {
  const layers = [
    "Structural Concrete Deck",
    "Cold Fluid-Applied Waterproofing Membrane",
    "Drainage Mat",
    '7" XPS Rigid Insulation',
    "Filter Fabric",
    "Adjustable Pedestals",
    "Concrete Pavers",
  ];

  test("fullLayerStack contains all base layers", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.fullLayerStack).toContain("Structural Concrete Deck");
    expect(r.fullLayerStack).toContain("Cold Fluid-Applied Waterproofing Membrane");
    expect(r.fullLayerStack).toContain("Drainage Mat");
    expect(r.fullLayerStack).toContain("Filter Fabric");
  });

  test("fullLayerStack contains modifier layers", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.fullLayerStack).toContain("Adjustable Pedestals");
  });

  test("modifierStack contains pedestals", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.modifierStack).toContain("Adjustable Pedestals");
  });

  test("modifierStack does NOT contain base IRMA layers", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.modifierStack).not.toContain("Drainage Mat");
    expect(r.modifierStack).not.toContain("Cold Fluid-Applied Waterproofing Membrane");
  });

  test("sectionValues.membrane extracted", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.sectionValues["membrane"]).toContain("Waterproofing");
  });

  test("sectionValues.insulation extracted with thickness", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.sectionValues["insulation"]).toContain('7"');
  });

  test("sectionValues.drainageMat set", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.sectionValues["drainageMat"]).toBeTruthy();
  });

  test("sectionValues.filterFabric is true", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.sectionValues["filterFabric"]).toBe(true);
  });

  test("sectionValues.pedestals extracted", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    expect(r.sectionValues["pedestals"]).toContain("Pedestal");
  });

  test("fullLayerStack has no duplicates", () => {
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    const lower = r.fullLayerStack.map(l => l.toLowerCase().trim());
    const unique = new Set(lower);
    expect(unique.size).toBe(lower.length);
  });
});

describe("pedestal_paver_irma — sparse AI output (only overburden label)", () => {
  // AI sometimes only extracts the overburden, not the full IRMA base
  const sparseLayersWithDrainageMat = [
    "Cold-Fluid IRMA / PMR",
    "Drainage Mat",
    "Pavers on Pedestal",
  ];

  test("fullLayerStack supplemented with IRMA canonical base layers", () => {
    const r = resolveFullLayerStack(sparseLayersWithDrainageMat, "pedestal_paver_irma");
    // Must contain canonical IRMA base tokens even though AI didn't list them
    const stack = r.fullLayerStack.map(l => l.toLowerCase());
    const hasInsulation = stack.some(l => /insulation|xps|polyiso/.test(l));
    const hasFilterFabric = stack.some(l => /filter\s*fabric/.test(l));
    expect(hasInsulation).toBe(true);
    expect(hasFilterFabric).toBe(true);
  });

  test("modifierStack contains pedestal phrase", () => {
    const r = resolveFullLayerStack(sparseLayersWithDrainageMat, "pedestal_paver_irma");
    expect(r.modifierStack.some(l => /pedestal/i.test(l))).toBe(true);
  });
});

// ─── green_roof_irma ──────────────────────────────────────────────────────────

describe("green_roof_irma — full IRMA stack from AI layers", () => {
  const layers = [
    "Structural Concrete Deck",
    "Waterproofing Membrane",
    "Drainage Mat",
    '7" XPS Insulation',
    "Filter Fabric",
    "Root Barrier",
    "Growing Media",
  ];

  test("baseStack contains structural + membrane + drainage mat", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    const base = r.baseStack.map(l => l.toLowerCase());
    expect(base.some(l => /concrete\s*deck|structural/.test(l))).toBe(true);
    expect(base.some(l => /membrane|waterproof/.test(l))).toBe(true);
    expect(base.some(l => /drainage\s*mat/.test(l))).toBe(true);
  });

  test("modifierStack contains root barrier", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.modifierStack.some(l => /root\s*barrier/i.test(l))).toBe(true);
  });

  test("modifierStack contains green roof / growing media", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.modifierStack.some(l => /green\s*roof|growing\s*media|vegetation/i.test(l))).toBe(true);
  });

  test("sectionValues.filterFabric is true", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.sectionValues["filterFabric"]).toBe(true);
  });

  test("sectionValues.rootBarrier is true", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.sectionValues["rootBarrier"]).toBe(true);
  });

  test("sectionValues.greenRoof extracted from layers", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.sectionValues["greenRoof"]).toBeTruthy();
  });

  test("sectionValues.insulation extracted", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.sectionValues["insulation"]).toBeTruthy();
  });
});

describe("green_roof_irma — sedum tray variant", () => {
  const layers = [
    "Waterproofing Membrane",
    "Drainage Mat",
    "Filter Fabric",
    "Root Barrier",
    "Sedum Tray System",
  ];

  test("modifierStack contains sedum tray", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.modifierStack.some(l => /sedum/i.test(l))).toBe(true);
  });

  test("sectionValues.greenRoof extracted from sedum", () => {
    const r = resolveFullLayerStack(layers, "green_roof_irma");
    expect(r.sectionValues["greenRoof"]).toBeTruthy();
  });
});

// ─── ballast_paver_irma ───────────────────────────────────────────────────────

describe("ballast_paver_irma — river ballast", () => {
  const layers = [
    "Structural Concrete Deck",
    "Waterproofing Membrane",
    "Drainage Mat",
    '7" XPS Insulation',
    "Filter Fabric",
    "River Ballast",
  ];

  test("modifierStack contains river ballast", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.modifierStack.some(l => /river\s*ballast/i.test(l))).toBe(true);
  });

  test("baseStack does NOT contain river ballast", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.baseStack.some(l => /ballast/i.test(l))).toBe(false);
  });

  test("sectionValues.ballast extracted", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.sectionValues["ballast"]).toContain("Ballast");
  });

  test("sectionValues.filterFabric is true", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.sectionValues["filterFabric"]).toBe(true);
  });
});

describe("ballast_paver_irma — lock-down paver ballast", () => {
  const layers = [
    "Structural Concrete Deck",
    "Cold Fluid-Applied Waterproofing Membrane",
    "Drainage Mat",
    '7" XPS Rigid Insulation',
    "Filter Fabric",
    "Lock-Down Precast Concrete Paver Ballast",
  ];

  test("modifierStack contains lock-down paver ballast phrase", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.modifierStack.some(l => /lock[- ]down/i.test(l))).toBe(true);
  });

  test("sectionValues.ballast extracted and contains lock-down", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    expect(r.sectionValues["ballast"]).toMatch(/lock[- ]down/i);
  });

  test("fullLayerStack is ordered base then modifier", () => {
    const r = resolveFullLayerStack(layers, "ballast_paver_irma");
    const lockIdx = r.fullLayerStack.findIndex(l => /lock[- ]down/i.test(l));
    const drainIdx = r.fullLayerStack.findIndex(l => /drainage\s*mat/i.test(l));
    // Drainage mat (base) must come before lock-down ballast (modifier)
    expect(drainIdx).toBeLessThan(lockIdx);
  });
});

// ─── concrete_pavement_roof ───────────────────────────────────────────────────

describe("concrete_pavement_roof — full stack from AI layers", () => {
  const layers = [
    "Waterproofing Membrane",
    "Protection Board",
    "Drainage Mat",
    '2" Rigid Insulation',
    "Gravel Layer",
    "Cast-in-Place Concrete Pavement",
  ];

  test("fullLayerStack contains all layers", () => {
    const r = resolveFullLayerStack(layers, "concrete_pavement_roof");
    expect(r.fullLayerStack.some(l => /waterproof/i.test(l))).toBe(true);
    expect(r.fullLayerStack.some(l => /gravel/i.test(l))).toBe(true);
    expect(r.fullLayerStack.some(l => /concrete\s*pavement|cast[- ]in[- ]place/i.test(l))).toBe(true);
  });

  test("sectionValues.gravelLayer extracted", () => {
    const r = resolveFullLayerStack(layers, "concrete_pavement_roof");
    expect(r.sectionValues["gravelLayer"]).toBeTruthy();
  });

  test("sectionValues.concretePavement extracted", () => {
    const r = resolveFullLayerStack(layers, "concrete_pavement_roof");
    expect(r.sectionValues["concretePavement"]).toBeTruthy();
  });

  test("sectionValues.membrane extracted", () => {
    const r = resolveFullLayerStack(layers, "concrete_pavement_roof");
    expect(r.sectionValues["membrane"]).toBeTruthy();
  });

  test("sectionValues.insulation extracted with thickness", () => {
    const r = resolveFullLayerStack(layers, "concrete_pavement_roof");
    expect(r.sectionValues["insulation"]).toContain('2"');
  });
});

// ─── built_up_panel_assembly ──────────────────────────────────────────────────

describe("built_up_panel_assembly — full stack", () => {
  const layers = [
    '5/8" DensGlass Sheathing',
    '7" Rigid Insulation',
    "Cementitious Board",
    "Waterproofing Membrane",
    "Aluminum Panel",
  ];

  test("fullLayerStack contains all layers", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    expect(r.fullLayerStack).toHaveLength(layers.length);
  });

  test("sectionValues.insulation extracted with 7 inches", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    expect(r.sectionValues["insulation"]).toContain('7"');
  });

  test("sectionValues.coverBoard extracted from DensGlass / cementitious board", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    // Either DensGlass or Cementitious Board should be extracted
    expect(r.sectionValues["coverBoard"]).toBeTruthy();
  });

  test("sectionValues.surfacing extracted from aluminum panel", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    expect(r.sectionValues["surfacing"]).toContain("Aluminum Panel");
  });

  test("sectionValues.membrane extracted", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    expect(r.sectionValues["membrane"]).toBeTruthy();
  });

  test("modifierStack is empty (no IRMA base/modifier split for panels)", () => {
    const r = resolveFullLayerStack(layers, "built_up_panel_assembly");
    expect(r.modifierStack).toHaveLength(0);
  });
});

// ─── Conventional archetypes ──────────────────────────────────────────────────

describe("single_ply_tpo — no base/modifier split", () => {
  const layers = ["Steel Deck", "Polyiso Insulation", "Cover Board", "TPO Membrane"];

  test("fullLayerStack equals raw layers", () => {
    const r = resolveFullLayerStack(layers, "single_ply_tpo");
    expect(r.fullLayerStack).toEqual(layers);
  });

  test("sectionValues.membrane extracted", () => {
    const r = resolveFullLayerStack(layers, "single_ply_tpo");
    expect(r.sectionValues["membrane"]).toContain("TPO");
  });

  test("sectionValues.insulation extracted", () => {
    const r = resolveFullLayerStack(layers, "single_ply_tpo");
    expect(r.sectionValues["insulation"]).toContain("Polyiso");
  });

  test("sectionValues.coverBoard extracted", () => {
    const r = resolveFullLayerStack(layers, "single_ply_tpo");
    expect(r.sectionValues["coverBoard"]).toContain("Cover Board");
  });
});

describe("conventional_liquid_applied — no IRMA split", () => {
  const layers = ["Concrete Deck", "Rigid Insulation", "Cover Board", "Waterproofing Membrane"];

  test("modifierStack is empty", () => {
    const r = resolveFullLayerStack(layers, "conventional_liquid_applied");
    expect(r.modifierStack).toHaveLength(0);
  });

  test("sectionValues.membrane set", () => {
    const r = resolveFullLayerStack(layers, "conventional_liquid_applied");
    expect(r.sectionValues["membrane"]).toBeTruthy();
  });
});

// ─── Deduplication ────────────────────────────────────────────────────────────

describe("Deduplication — no repeated layers in fullLayerStack", () => {
  test("pedestal IRMA with repeated drainage mat in raw input", () => {
    const layers = [
      "Drainage Mat",
      "Waterproofing Membrane",
      "Drainage Mat", // duplicate
      "Filter Fabric",
      "Adjustable Pedestals",
    ];
    const r = resolveFullLayerStack(layers, "pedestal_paver_irma");
    const drainCount = r.fullLayerStack.filter(l => /drainage\s*mat/i.test(l)).length;
    expect(drainCount).toBeLessThanOrEqual(1);
  });
});

// ─── IRMA base supplement — sparse input ─────────────────────────────────────

describe("IRMA base supplement — fills missing base layers", () => {
  test("ballast assembly with only membrane + drainage mat + ballast gets insulation supplemented", () => {
    const sparse = ["Waterproofing Membrane", "Drainage Mat", "River Ballast"];
    const r = resolveFullLayerStack(sparse, "ballast_paver_irma");
    const hasInsulation = r.fullLayerStack.some(l => /insulation|xps|polyiso/i.test(l));
    expect(hasInsulation).toBe(true);
  });

  test("green roof with only membrane + drainage mat + green roof gets filter fabric supplemented", () => {
    const sparse = ["Waterproofing Membrane", "Drainage Mat", "Green Roof"];
    const r = resolveFullLayerStack(sparse, "green_roof_irma");
    const hasFilterFabric = r.fullLayerStack.some(l => /filter\s*fabric/i.test(l));
    expect(hasFilterFabric).toBe(true);
  });
});
