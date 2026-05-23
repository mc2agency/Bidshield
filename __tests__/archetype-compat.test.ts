/**
 * Archetype Compatibility Layer Tests
 *
 * Covers:
 *  - All known legacy systemId mappings
 *  - resolveAssemblyArchetype: explicit / mapped / fallback paths
 *  - Case-insensitive normalization
 *  - Reverse mapping archetypeId → legacySystemId
 *  - debugArchetypeResolutions batch output
 */

import { describe, test, expect } from "vitest";
import {
  legacyToArchetypeId,
  archetypeIdToLegacy,
  resolveAssemblyArchetype,
  formatArchetypeResolution,
  debugArchetypeResolutions,
  LEGACY_SYSTEM_ID_MAP,
  ARCHETYPE_ID_TO_LEGACY_SYSTEM_ID,
  type KnownArchetypeId,
} from "../lib/bidshield/archetype-compat";

// ─── legacyToArchetypeId ──────────────────────────────────────────────────────

describe("legacyToArchetypeId", () => {
  describe("Single-ply mappings", () => {
    test("tpo → single_ply_tpo", () => {
      expect(legacyToArchetypeId("tpo")).toBe("single_ply_tpo");
    });
    test("pvc → single_ply_pvc", () => {
      expect(legacyToArchetypeId("pvc")).toBe("single_ply_pvc");
    });
    test("epdm → single_ply_epdm", () => {
      expect(legacyToArchetypeId("epdm")).toBe("single_ply_epdm");
    });
  });

  describe("Modified bitumen — conventional", () => {
    test("sbs → modified_bitumen_sbs", () => {
      expect(legacyToArchetypeId("sbs")).toBe("modified_bitumen_sbs");
    });
    test("app → modified_bitumen_sbs (APP is a mod-bit variant)", () => {
      expect(legacyToArchetypeId("app")).toBe("modified_bitumen_sbs");
    });
  });

  describe("Modified bitumen — IRMA / PMR", () => {
    test("sbs_irma → modified_bitumen_irma", () => {
      expect(legacyToArchetypeId("sbs_irma")).toBe("modified_bitumen_irma");
    });
    test("sbs_irma_green → modified_bitumen_irma (green overburden, same membrane)", () => {
      expect(legacyToArchetypeId("sbs_irma_green")).toBe("modified_bitumen_irma");
    });
    test("app_irma → modified_bitumen_irma", () => {
      expect(legacyToArchetypeId("app_irma")).toBe("modified_bitumen_irma");
    });
  });

  describe("Liquid-applied — conventional", () => {
    test("lam → conventional_liquid_applied", () => {
      expect(legacyToArchetypeId("lam")).toBe("conventional_liquid_applied");
    });
  });

  describe("Liquid-applied — IRMA / PMR", () => {
    test("lam_irma → liquid_applied_irma", () => {
      expect(legacyToArchetypeId("lam_irma")).toBe("liquid_applied_irma");
    });
    test("hydrotech → liquid_applied_irma (Hydrotech is LAM IRMA brand)", () => {
      expect(legacyToArchetypeId("hydrotech")).toBe("liquid_applied_irma");
    });
  });

  describe("Hardscape", () => {
    test("concrete → concrete_pavement_roof", () => {
      expect(legacyToArchetypeId("concrete")).toBe("concrete_pavement_roof");
    });
  });

  describe("Custom / unmapped (fall to custom)", () => {
    test("bur → custom (no dedicated archetype yet)", () => {
      expect(legacyToArchetypeId("bur")).toBe("custom");
    });
    test("metal → custom", () => {
      expect(legacyToArchetypeId("metal")).toBe("custom");
    });
    test("spf → custom", () => {
      expect(legacyToArchetypeId("spf")).toBe("custom");
    });
    test("custom → custom", () => {
      expect(legacyToArchetypeId("custom")).toBe("custom");
    });
    test("unknown string → custom", () => {
      expect(legacyToArchetypeId("whatever_roof")).toBe("custom");
    });
    test("null → custom", () => {
      expect(legacyToArchetypeId(null)).toBe("custom");
    });
    test("undefined → custom", () => {
      expect(legacyToArchetypeId(undefined)).toBe("custom");
    });
    test("empty string → custom", () => {
      expect(legacyToArchetypeId("")).toBe("custom");
    });
  });

  describe("Case-insensitive normalization", () => {
    test("TPO (uppercase) → single_ply_tpo", () => {
      expect(legacyToArchetypeId("TPO")).toBe("single_ply_tpo");
    });
    test("SBS_IRMA (uppercase) → modified_bitumen_irma", () => {
      expect(legacyToArchetypeId("SBS_IRMA")).toBe("modified_bitumen_irma");
    });
    test("Lam (mixed case) → conventional_liquid_applied", () => {
      expect(legacyToArchetypeId("Lam")).toBe("conventional_liquid_applied");
    });
    test("  tpo  (with spaces) → single_ply_tpo", () => {
      expect(legacyToArchetypeId("  tpo  ")).toBe("single_ply_tpo");
    });
  });

  describe("Complete coverage of LEGACY_SYSTEM_ID_MAP", () => {
    test("every key in LEGACY_SYSTEM_ID_MAP produces its mapped value", () => {
      for (const [systemId, expectedArchetypeId] of Object.entries(LEGACY_SYSTEM_ID_MAP)) {
        expect(legacyToArchetypeId(systemId)).toBe(expectedArchetypeId);
      }
    });
  });
});

// ─── archetypeIdToLegacy ──────────────────────────────────────────────────────

describe("archetypeIdToLegacy", () => {
  test("single_ply_tpo → tpo", () => {
    expect(archetypeIdToLegacy("single_ply_tpo")).toBe("tpo");
  });
  test("single_ply_pvc → pvc", () => {
    expect(archetypeIdToLegacy("single_ply_pvc")).toBe("pvc");
  });
  test("single_ply_epdm → epdm", () => {
    expect(archetypeIdToLegacy("single_ply_epdm")).toBe("epdm");
  });
  test("modified_bitumen_sbs → sbs", () => {
    expect(archetypeIdToLegacy("modified_bitumen_sbs")).toBe("sbs");
  });
  test("modified_bitumen_irma → sbs_irma (canonical IRMA variant)", () => {
    expect(archetypeIdToLegacy("modified_bitumen_irma")).toBe("sbs_irma");
  });
  test("conventional_liquid_applied → lam", () => {
    expect(archetypeIdToLegacy("conventional_liquid_applied")).toBe("lam");
  });
  test("liquid_applied_irma → lam_irma", () => {
    expect(archetypeIdToLegacy("liquid_applied_irma")).toBe("lam_irma");
  });
  test("concrete_pavement_roof → concrete", () => {
    expect(archetypeIdToLegacy("concrete_pavement_roof")).toBe("concrete");
  });
  test("custom → custom", () => {
    expect(archetypeIdToLegacy("custom")).toBe("custom");
  });
  test("null → undefined", () => {
    expect(archetypeIdToLegacy(null)).toBeUndefined();
  });
  test("built_up_panel_assembly → panel (cladding panel legacy system)", () => {
    expect(archetypeIdToLegacy("built_up_panel_assembly")).toBe("panel");
  });
  test("complete coverage of ARCHETYPE_ID_TO_LEGACY_SYSTEM_ID", () => {
    for (const [archetypeId, expectedLegacy] of Object.entries(ARCHETYPE_ID_TO_LEGACY_SYSTEM_ID)) {
      expect(archetypeIdToLegacy(archetypeId as KnownArchetypeId)).toBe(expectedLegacy);
    }
  });
});

// ─── resolveAssemblyArchetype ─────────────────────────────────────────────────

describe("resolveAssemblyArchetype", () => {
  describe("Path 1: explicit archetypeId", () => {
    test("uses archetypeId directly when present", () => {
      const r = resolveAssemblyArchetype({ archetypeId: "liquid_applied_irma" });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.source).toBe("explicit");
      expect(r.isFallback).toBe(false);
      expect(r.needsReview).toBe(false);
    });

    test("explicit archetypeId takes priority over systemType", () => {
      const r = resolveAssemblyArchetype({
        archetypeId: "liquid_applied_irma",
        systemType: "tpo",
      });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.source).toBe("explicit");
    });

    test("explicit archetypeId: legacySystemId set from reverse map", () => {
      const r = resolveAssemblyArchetype({ archetypeId: "conventional_liquid_applied" });
      expect(r.legacySystemId).toBe("lam");
    });
  });

  describe("Path 2: systemType mapping", () => {
    test("maps tpo via systemType", () => {
      const r = resolveAssemblyArchetype({ systemType: "tpo" });
      expect(r.archetypeId).toBe("single_ply_tpo");
      expect(r.source).toBe("mapped");
      expect(r.legacySystemId).toBe("tpo");
      expect(r.isFallback).toBe(false);
      expect(r.needsReview).toBe(false);
    });

    test("maps lam_irma via systemType", () => {
      const r = resolveAssemblyArchetype({ systemType: "lam_irma" });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.source).toBe("mapped");
      expect(r.isFallback).toBe(false);
    });

    test("maps sbs_irma_green via systemType → modified_bitumen_irma", () => {
      const r = resolveAssemblyArchetype({ systemType: "sbs_irma_green" });
      expect(r.archetypeId).toBe("modified_bitumen_irma");
      expect(r.isFallback).toBe(false);
    });

    test("maps hydrotech → liquid_applied_irma", () => {
      const r = resolveAssemblyArchetype({ systemType: "hydrotech" });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.isFallback).toBe(false);
    });

    test("maps metal → custom with needsReview (unmapped)", () => {
      const r = resolveAssemblyArchetype({ systemType: "metal" });
      expect(r.archetypeId).toBe("custom");
      expect(r.isFallback).toBe(true);
      expect(r.needsReview).toBe(true);
    });

    test("maps bur → custom with needsReview", () => {
      const r = resolveAssemblyArchetype({ systemType: "bur" });
      expect(r.archetypeId).toBe("custom");
      expect(r.isFallback).toBe(true);
      expect(r.needsReview).toBe(true);
    });

    test("explicit custom systemType → custom without needsReview", () => {
      const r = resolveAssemblyArchetype({ systemType: "custom" });
      expect(r.archetypeId).toBe("custom");
      expect(r.isFallback).toBe(false);
      expect(r.needsReview).toBe(false);
    });

    test("falls back to systemId when systemType not present", () => {
      const r = resolveAssemblyArchetype({ systemId: "epdm" });
      expect(r.archetypeId).toBe("single_ply_epdm");
      expect(r.source).toBe("mapped");
    });

    test("systemType takes precedence over systemId", () => {
      const r = resolveAssemblyArchetype({ systemType: "tpo", systemId: "epdm" });
      expect(r.archetypeId).toBe("single_ply_tpo");
      expect(r.legacySystemId).toBe("tpo");
    });

    test("unknown systemType → custom fallback with needsReview", () => {
      const r = resolveAssemblyArchetype({ systemType: "whatever" });
      expect(r.archetypeId).toBe("custom");
      expect(r.source).toBe("fallback");
      expect(r.isFallback).toBe(true);
      expect(r.needsReview).toBe(true);
    });
  });

  describe("Path 3: no identifiers", () => {
    test("empty assembly → custom fallback with needsReview", () => {
      const r = resolveAssemblyArchetype({});
      expect(r.archetypeId).toBe("custom");
      expect(r.source).toBe("fallback");
      expect(r.isFallback).toBe(true);
      expect(r.needsReview).toBe(true);
      expect(r.legacySystemId).toBeUndefined();
    });

    test("all fields null → custom fallback", () => {
      const r = resolveAssemblyArchetype({ archetypeId: null, systemType: null, systemId: null });
      expect(r.archetypeId).toBe("custom");
      expect(r.isFallback).toBe(true);
    });
  });

  describe("All legacy systemIds produce valid resolutions", () => {
    const allLegacyIds = [
      "tpo", "pvc", "epdm",
      "sbs", "app", "sbs_irma", "sbs_irma_green", "app_irma",
      "lam", "lam_irma", "hydrotech",
      "concrete",
      "bur", "metal", "spf",
      "custom",
    ];

    for (const id of allLegacyIds) {
      test(`systemType="${id}" produces non-null archetypeId`, () => {
        const r = resolveAssemblyArchetype({ systemType: id });
        expect(r.archetypeId).toBeTruthy();
        expect(r.archetypeVersion).toBe(1);
        expect(r.source).not.toBe(undefined);
        expect(typeof r.debugNote).toBe("string");
      });
    }
  });
});

// ─── formatArchetypeResolution ────────────────────────────────────────────────

describe("formatArchetypeResolution", () => {
  test("formats a mapped resolution", () => {
    const r = resolveAssemblyArchetype({ systemType: "lam_irma" });
    const out = formatArchetypeResolution(r);
    expect(out).toContain("lam_irma");
    expect(out).toContain("liquid_applied_irma");
    expect(out).toContain("mapped");
    expect(out).toContain("[archetype-compat]");
  });

  test("formats an explicit resolution", () => {
    const r = resolveAssemblyArchetype({ archetypeId: "single_ply_tpo" });
    const out = formatArchetypeResolution(r);
    expect(out).toContain("explicit");
    expect(out).toContain("single_ply_tpo");
  });

  test("formats a fallback resolution", () => {
    const r = resolveAssemblyArchetype({ systemType: "metal" });
    const out = formatArchetypeResolution(r);
    expect(out).toContain("fallback");
    expect(out).toContain("needs-review");
    expect(out).toContain("metal");
  });

  test("formats a no-id fallback", () => {
    const r = resolveAssemblyArchetype({});
    const out = formatArchetypeResolution(r);
    expect(out).toContain("fallback");
    expect(out).toContain("(no systemId)");
  });
});

// ─── debugArchetypeResolutions ────────────────────────────────────────────────

describe("debugArchetypeResolutions", () => {
  test("returns correct summary totals for a mixed batch", () => {
    const assemblies = [
      { systemType: "tpo" },
      { systemType: "lam_irma" },
      { systemType: "metal" },           // fallback
      { archetypeId: "single_ply_pvc" }, // explicit
      {},                                // fallback
    ];
    const result = debugArchetypeResolutions(assemblies);

    expect(result.total).toBe(5);
    expect(result.resolved).toBe(3);   // tpo, lam_irma, explicit pvc
    expect(result.fallbacks).toBe(2);  // metal, empty
    expect(result.needsReview).toBe(2);
  });

  test("uses provided labels in rows", () => {
    const assemblies = [{ systemType: "epdm" }];
    const result = debugArchetypeResolutions(assemblies, ["RT-01"]);
    expect(result.rows[0].label).toBe("RT-01");
  });

  test("each row has the expected fields", () => {
    const assemblies = [{ systemType: "sbs" }];
    const result = debugArchetypeResolutions(assemblies);
    const row = result.rows[0];
    expect(row.archetypeId).toBe("modified_bitumen_sbs");
    expect(row.archetypeVersion).toBe(1);
    expect(row.legacySystemId).toBe("sbs");
    expect(row.source).toBe("mapped");
    expect(row.isFallback).toBe(false);
    expect(row.needsReview).toBe(false);
    expect(typeof row.note).toBe("string");
  });

  test("complete real-world batch: 6 typical project assemblies", () => {
    const assemblies = [
      { label: "RT-01", systemType: "lam_irma" },
      { label: "RT-02", systemType: "lam_irma" },
      { label: "RT-03", systemType: "tpo" },
      { label: "RT-04", systemType: "sbs_irma" },
      { label: "RT-05", systemType: "bur" },
      { label: "RT-06", systemType: "custom" },
    ];
    const labels = assemblies.map((a) => a.label);
    const result = debugArchetypeResolutions(assemblies, labels);

    expect(result.total).toBe(6);
    expect(result.resolved).toBe(5);  // lam_irma x2, tpo, sbs_irma, custom (explicit)
    expect(result.fallbacks).toBe(1); // bur → custom fallback
    expect(result.needsReview).toBe(1);

    expect(result.rows[0].archetypeId).toBe("liquid_applied_irma");
    expect(result.rows[2].archetypeId).toBe("single_ply_tpo");
    expect(result.rows[4].isFallback).toBe(true); // bur
    expect(result.rows[5].isFallback).toBe(false); // explicit custom
  });
});
