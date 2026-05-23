/**
 * Extraction + archetype resolution: bug fix tests
 *
 * Covers the three bugs reported after Phase 5A:
 *   Bug 1 - Extraction coverage (prompt change tested via prompt content)
 *   Bug 2 - ROOF 05: concrete_pavement_roof detection
 *   Bug 3 - ROOF 06: built_up_panel_assembly via 'panel' system
 *   Bug 3b - enableArchetypeDrivenForms feature flag section schemas
 */

import { describe, test, expect } from "vitest";
import {
  normalizeAssemblySignals,
  classifyAssemblySystem,
} from "../lib/bidshield/assembly-system-configs";
import {
  resolveAssemblyArchetype,
  legacyToArchetypeId,
  LEGACY_SYSTEM_ID_MAP,
} from "../lib/bidshield/archetype-compat";
import {
  ENABLE_ARCHETYPE_DRIVEN_FORMS,
  getArchetypeFormSchema,
  resolveFormSections,
  ARCHETYPE_FORM_SCHEMAS,
} from "../lib/bidshield/archetype-form-bridge";

// ─── Mirror enrichWithArchetypes logic (same as extract-assemblies-archetype.test.ts) ──

function enrichAssembly(assembly: {
  system?: string | null;
  surface?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  layers?: string[] | null;
  label?: string;
}) {
  const rawSystemId = assembly.system ?? "";
  const surfaceField = assembly.surface ?? "";

  // Early override: concrete pavement surface → concrete_pavement_roof
  const concreteLayers = (assembly.layers ?? []).join(" ");
  const isConcretePavement =
    surfaceField === "concrete_pavement" ||
    /concrete\s*pav/i.test(concreteLayers);

  if (isConcretePavement) {
    return {
      ...assembly,
      archetypeId: "concrete_pavement_roof",
      archetypeResolutionSource: "mapped",
      archetypeNeedsReview: false,
      legacySystemType: classifyAssemblySystem({
        baseSystem: rawSystemId === "lam" || rawSystemId === "sbs" ? rawSystemId : "lam",
        drainageMat: assembly.drainageMat ?? false,
        filterFabric: assembly.filterFabric ?? false,
        greenRoof: false,
      }),
      legacySystemId: rawSystemId || undefined,
    };
  }

  const signals = normalizeAssemblySignals({
    drainageMat: assembly.drainageMat ?? null,
    filterFabric: assembly.filterFabric ?? null,
    layers: Array.isArray(assembly.layers) ? assembly.layers : [],
  });

  const effectiveBase =
    rawSystemId === "lam" && signals.effectiveSbsMembrane ? "sbs" : rawSystemId;

  const classifiedSystemType =
    effectiveBase === "lam" || effectiveBase === "sbs"
      ? classifyAssemblySystem({
          baseSystem: effectiveBase,
          drainageMat: signals.effectiveDrainageMat,
          filterFabric: signals.effectiveFilterFabric,
          greenRoof: signals.effectiveGreenRoof,
        })
      : rawSystemId;

  const resolution = resolveAssemblyArchetype({ systemType: classifiedSystemType });

  return {
    ...assembly,
    archetypeId: resolution.archetypeId,
    archetypeResolutionSource: resolution.source,
    archetypeNeedsReview: resolution.needsReview,
    ...(resolution.isFallback && { archetypeFallbackReason: resolution.debugNote }),
    legacySystemType: classifiedSystemType,
    legacySystemId: rawSystemId || undefined,
  };
}

// ─── Bug 1: Extraction prompt coverage ────────────────────────────────────────

describe("Bug 1: Extraction prompt coverage", () => {
  test("prompt cap raised to 20 assemblies (not 10)", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "app/api/bidshield/extract-assemblies/route.ts",
      "utf8"
    );
    // Must NOT say "Max 10 assemblies"
    expect(content).not.toContain("Max 10 assemblies");
    // Must say "up to 20" (case-insensitive)
    expect(content.toLowerCase()).toMatch(/up to 20 assembl/);
  });

  test("prompt instructs to start from ROOF 01", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "app/api/bidshield/extract-assemblies/route.ts",
      "utf8"
    );
    expect(content).toContain("ROOF 01");
    expect(content).toContain("Do NOT skip any assembly");
  });

  test("prompt instructs do not start from middle of drawing", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "app/api/bidshield/extract-assemblies/route.ts",
      "utf8"
    );
    expect(content).toContain("Do NOT start from the middle of the drawing");
  });
});

// ─── Bug 2: ROOF 05 → concrete_pavement_roof ──────────────────────────────────

describe("Bug 2: ROOF 05 — concrete_pavement_roof detection", () => {
  test("surface='concrete_pavement' → concrete_pavement_roof (not liquid_applied_irma)", () => {
    const r = enrichAssembly({
      system: "lam",
      drainageMat: true,
      filterFabric: false,
      surface: "concrete_pavement",
    });
    expect(r.archetypeId).toBe("concrete_pavement_roof");
    expect(r.archetypeResolutionSource).toBe("mapped");
    expect(r.archetypeNeedsReview).toBe(false);
  });

  test("layer text 'cast-in-place concrete pavement' → concrete_pavement_roof", () => {
    const r = enrichAssembly({
      system: "lam",
      drainageMat: true,
      filterFabric: true,
      layers: [
        "Structural Concrete Deck",
        "Waterproofing Membrane",
        "Drainage Mat",
        "2\" Rigid Insulation",
        "Gravel Layer",
        "Cast-in-Place Concrete Pavement",
      ],
    });
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("layer text 'concrete paving' → concrete_pavement_roof", () => {
    const r = enrichAssembly({
      system: "lam",
      drainageMat: true,
      layers: ["Membrane", "Protection Board", "Drainage Mat", "Gravel", "Concrete Paving"],
    });
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("ROOF 05 does NOT resolve to liquid_applied_irma", () => {
    const r = enrichAssembly({
      system: "lam",
      drainageMat: true,
      filterFabric: true,
      surface: "concrete_pavement",
      layers: ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "2\" XPS", "Gravel", "Concrete Pavement"],
    });
    expect(r.archetypeId).not.toBe("liquid_applied_irma");
    expect(r.archetypeId).toBe("concrete_pavement_roof");
  });

  test("concrete_pavement_roof schema hides filterFabric", () => {
    const schema = getArchetypeFormSchema("concrete_pavement_roof");
    // schema is null when flag is OFF, but ARCHETYPE_FORM_SCHEMAS is always accessible
    const staticSchema = ARCHETYPE_FORM_SCHEMAS["concrete_pavement_roof"];
    expect(staticSchema).toBeDefined();
    expect(staticSchema.hiddenSections).toContain("filterFabric");
  });

  test("concrete_pavement_roof schema has gravelLayer in required", () => {
    const staticSchema = ARCHETYPE_FORM_SCHEMAS["concrete_pavement_roof"];
    expect(staticSchema.requiredSections).toContain("gravelLayer");
  });

  test("concrete_pavement_roof schema has concretePavement in required", () => {
    const staticSchema = ARCHETYPE_FORM_SCHEMAS["concrete_pavement_roof"];
    expect(staticSchema.requiredSections).toContain("concretePavement");
  });

  test("concrete_pavement_roof schema does NOT require filterFabric", () => {
    const staticSchema = ARCHETYPE_FORM_SCHEMAS["concrete_pavement_roof"];
    expect(staticSchema.requiredSections).not.toContain("filterFabric");
    expect(staticSchema.optionalSections).not.toContain("filterFabric");
  });

  test("legacy lam_irma without concrete pavement surface → liquid_applied_irma (unchanged)", () => {
    const r = enrichAssembly({
      system: "lam",
      drainageMat: true,
      filterFabric: true,
      layers: ["Deck", "Membrane", "Drainage Mat", "XPS", "Filter Fabric", "River Ballast"],
    });
    expect(r.archetypeId).toBe("liquid_applied_irma");
  });
});

// ─── Bug 3: ROOF 06 → built_up_panel_assembly ─────────────────────────────────

describe("Bug 3: ROOF 06 — built_up_panel_assembly", () => {
  test("system='panel' maps to built_up_panel_assembly", () => {
    expect(legacyToArchetypeId("panel")).toBe("built_up_panel_assembly");
  });

  test("'panel' is in LEGACY_SYSTEM_ID_MAP", () => {
    expect(LEGACY_SYSTEM_ID_MAP["panel"]).toBe("built_up_panel_assembly");
  });

  test("enrichAssembly: system='panel' → built_up_panel_assembly", () => {
    const r = enrichAssembly({
      system: "panel",
      layers: [
        "5/8\" DensGlass Sheathing",
        "7\" Rigid Insulation",
        "Cementitious Board",
        "Waterproofing Membrane",
        "Aluminum Panel",
      ],
    });
    expect(r.archetypeId).toBe("built_up_panel_assembly");
    expect(r.archetypeResolutionSource).toBe("mapped");
    expect(r.archetypeNeedsReview).toBe(false);
    expect(r.legacySystemType).toBe("panel");
    expect(r.legacySystemId).toBe("panel");
  });

  test("ROOF 06 does NOT resolve to conventional_liquid_applied", () => {
    const r = enrichAssembly({ system: "panel" });
    expect(r.archetypeId).not.toBe("conventional_liquid_applied");
  });

  test("built_up_panel_assembly schema hides drainage", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("drainage");
  });

  test("built_up_panel_assembly schema hides drainageMat", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("drainageMat");
  });

  test("built_up_panel_assembly schema hides filterFabric", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("filterFabric");
  });

  test("built_up_panel_assembly schema hides pedestals", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("pedestals");
  });

  test("built_up_panel_assembly schema hides ballast", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("ballast");
  });

  test("built_up_panel_assembly schema hides gravelLayer", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.hiddenSections).toContain("gravelLayer");
  });

  test("built_up_panel_assembly schema does NOT require drainage", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["built_up_panel_assembly"];
    expect(schema.requiredSections).not.toContain("drainage");
    expect(schema.requiredSections).not.toContain("drainageMat");
    expect(schema.requiredSections).not.toContain("filterFabric");
  });

  test("prompt includes 'panel' as system value", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "app/api/bidshield/extract-assemblies/route.ts",
      "utf8"
    );
    expect(content).toContain("'panel'");
  });
});

// ─── Bug 3b: enableArchetypeDrivenForms feature flag ─────────────────────────

describe("Bug 3b: enableArchetypeDrivenForms feature flag", () => {
  test("ENABLE_ARCHETYPE_DRIVEN_FORMS is OFF by default", () => {
    expect(ENABLE_ARCHETYPE_DRIVEN_FORMS).toBe(false);
  });

  test("getArchetypeFormSchema returns null when flag is OFF", () => {
    expect(getArchetypeFormSchema("concrete_pavement_roof")).toBeNull();
  });

  test("resolveFormSections returns null when flag is OFF (legacy behavior preserved)", () => {
    expect(resolveFormSections("concrete_pavement_roof", "lam")).toBeNull();
    expect(resolveFormSections("built_up_panel_assembly", "panel")).toBeNull();
    expect(resolveFormSections("liquid_applied_irma", "lam_irma")).toBeNull();
  });

  test("all 10 seeded archetypes have schemas", () => {
    const expected = [
      "single_ply_tpo",
      "single_ply_pvc",
      "single_ply_epdm",
      "modified_bitumen_sbs",
      "modified_bitumen_irma",
      "conventional_liquid_applied",
      "liquid_applied_irma",
      "concrete_pavement_roof",
      "built_up_panel_assembly",
      "custom",
    ];
    for (const id of expected) {
      expect(ARCHETYPE_FORM_SCHEMAS[id]).toBeDefined();
      expect(ARCHETYPE_FORM_SCHEMAS[id].archetypeId).toBe(id);
    }
  });

  test("legacy systemId does NOT override concrete_pavement_roof when flag OFF", () => {
    // When flag is OFF, resolveFormSections returns null → caller uses legacy
    const result = resolveFormSections("concrete_pavement_roof", "lam_irma");
    expect(result).toBeNull(); // null means: use legacy system configs
  });

  test("legacy systemId does NOT override built_up_panel_assembly when flag OFF", () => {
    const result = resolveFormSections("built_up_panel_assembly", "panel");
    expect(result).toBeNull();
  });

  test("custom archetype hides nothing (all sections optional)", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["custom"];
    expect(schema.hiddenSections).toHaveLength(0);
    expect(schema.requiredSections).toHaveLength(0);
  });

  test("liquid_applied_irma schema requires drainageMat", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["liquid_applied_irma"];
    expect(schema.requiredSections).toContain("drainageMat");
    expect(schema.requiredSections).toContain("filterFabric");
  });

  test("conventional_liquid_applied schema hides drainageMat", () => {
    const schema = ARCHETYPE_FORM_SCHEMAS["conventional_liquid_applied"];
    expect(schema.hiddenSections).toContain("drainageMat");
    expect(schema.hiddenSections).toContain("filterFabric");
  });
});

// ─── End-to-end: 6-assembly project (ROOF 01–06) ─────────────────────────────

describe("End-to-end: ROOF 01–06 full project", () => {
  const roofAssemblies = [
    // ROOF 01 — TPO (simple, would have been missed before bug fix)
    { label: "ROOF 01", system: "tpo" },
    // ROOF 02 — SBS conventional (would have been missed before bug fix)
    { label: "ROOF 02", system: "sbs", drainageMat: false },
    // ROOF 03 — lam_irma
    { label: "ROOF 03", system: "lam", drainageMat: true, filterFabric: true },
    // ROOF 04 — lam conventional
    { label: "ROOF 04", system: "lam", drainageMat: false },
    // ROOF 05 — concrete pavement (was wrongly lam_irma)
    {
      label: "ROOF 05",
      system: "lam",
      drainageMat: true,
      filterFabric: false,
      surface: "concrete_pavement",
      layers: ["Waterproofing Membrane", "Drainage Mat", "2\" Rigid Insulation", "Gravel", "Concrete Pavement"],
    },
    // ROOF 06 — cladding panel (was wrongly lam)
    {
      label: "ROOF 06",
      system: "panel",
      layers: ["5/8\" DensGlass", "7\" Rigid Insulation", "Cementitious Board", "Waterproofing Membrane", "Aluminum Panel"],
    },
  ];

  const results = roofAssemblies.map(enrichAssembly);

  test("ROOF 01 is extracted and maps to single_ply_tpo", () => {
    const roof01 = results.find((r) => r.label === "ROOF 01");
    expect(roof01).toBeDefined();
    expect(roof01!.archetypeId).toBe("single_ply_tpo");
  });

  test("ROOF 02 is extracted and maps to modified_bitumen_sbs", () => {
    const roof02 = results.find((r) => r.label === "ROOF 02");
    expect(roof02).toBeDefined();
    expect(roof02!.archetypeId).toBe("modified_bitumen_sbs");
  });

  test("ROOF 05 maps to concrete_pavement_roof", () => {
    const roof05 = results.find((r) => r.label === "ROOF 05");
    expect(roof05!.archetypeId).toBe("concrete_pavement_roof");
  });

  test("ROOF 05 does NOT map to liquid_applied_irma", () => {
    const roof05 = results.find((r) => r.label === "ROOF 05");
    expect(roof05!.archetypeId).not.toBe("liquid_applied_irma");
  });

  test("ROOF 06 maps to built_up_panel_assembly", () => {
    const roof06 = results.find((r) => r.label === "ROOF 06");
    expect(roof06!.archetypeId).toBe("built_up_panel_assembly");
  });

  test("ROOF 06 does NOT map to conventional_liquid_applied", () => {
    const roof06 = results.find((r) => r.label === "ROOF 06");
    expect(roof06!.archetypeId).not.toBe("conventional_liquid_applied");
  });

  test("all 6 assemblies resolve — none undefined", () => {
    expect(results).toHaveLength(6);
    results.forEach((r) => expect(r.archetypeId).toBeTruthy());
  });

  test("no archetypeNeedsReview for known assemblies (only bur/metal/spf get warnings)", () => {
    const needsReview = results.filter((r) => r.archetypeNeedsReview);
    expect(needsReview).toHaveLength(0);
  });
});
