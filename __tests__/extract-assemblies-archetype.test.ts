/**
 * extract-assemblies route — archetype enrichment tests
 *
 * Tests the enrichment logic that the route applies to AI output.
 * We test the composition of:
 *   normalizeAssemblySignals → classifyAssemblySystem → resolveAssemblyArchetype
 *
 * This matches exactly what enrichWithArchetypes() does in the route.
 * No HTTP mocking needed — pure function behavior.
 */

import { describe, test, expect } from "vitest";
import {
  normalizeAssemblySignals,
  classifyAssemblySystem,
} from "../lib/bidshield/assembly-system-configs";
import {
  resolveAssemblyArchetype,
  legacyToArchetypeId,
} from "../lib/bidshield/archetype-compat";

// ─── Helper: mirrors enrichWithArchetypes() logic exactly ────────────────────

function enrichAssembly(assembly: {
  system?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  layers?: string[] | null;
}) {
  const rawSystemId = assembly.system ?? "";

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

// ─── Core mapping correctness ─────────────────────────────────────────────────

describe("extract-assemblies archetype enrichment", () => {
  describe("Single-ply systems", () => {
    test("tpo → single_ply_tpo", () => {
      const r = enrichAssembly({ system: "tpo" });
      expect(r.archetypeId).toBe("single_ply_tpo");
      expect(r.archetypeResolutionSource).toBe("mapped");
      expect(r.archetypeNeedsReview).toBe(false);
      expect(r.legacySystemType).toBe("tpo");
      expect(r.legacySystemId).toBe("tpo");
    });

    test("pvc → single_ply_pvc", () => {
      const r = enrichAssembly({ system: "pvc" });
      expect(r.archetypeId).toBe("single_ply_pvc");
      expect(r.archetypeNeedsReview).toBe(false);
    });

    test("epdm → single_ply_epdm", () => {
      const r = enrichAssembly({ system: "epdm" });
      expect(r.archetypeId).toBe("single_ply_epdm");
      expect(r.archetypeNeedsReview).toBe(false);
    });
  });

  describe("lam: conventional vs IRMA classification", () => {
    test("lam (no drainage mat) → conventional_liquid_applied", () => {
      const r = enrichAssembly({ system: "lam", drainageMat: false, filterFabric: false });
      expect(r.archetypeId).toBe("conventional_liquid_applied");
      expect(r.legacySystemType).toBe("lam");
      expect(r.archetypeNeedsReview).toBe(false);
    });

    test("lam (drainageMat: true) → liquid_applied_irma", () => {
      const r = enrichAssembly({ system: "lam", drainageMat: true, filterFabric: false });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.legacySystemType).toBe("lam_irma");
      expect(r.legacySystemId).toBe("lam");
      expect(r.archetypeNeedsReview).toBe(false);
    });

    test("lam (filterFabric: true) → liquid_applied_irma", () => {
      const r = enrichAssembly({ system: "lam", drainageMat: false, filterFabric: true });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.legacySystemType).toBe("lam_irma");
    });

    test("lam (both true) → liquid_applied_irma", () => {
      const r = enrichAssembly({ system: "lam", drainageMat: true, filterFabric: true });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.legacySystemType).toBe("lam_irma");
    });

    test("lam_irma direct → liquid_applied_irma", () => {
      // Some callers already pass the classified systemType
      const r = enrichAssembly({ system: "lam_irma" });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.legacySystemType).toBe("lam_irma");
    });

    test("lam + drainage mat from layer text (not AI boolean) → liquid_applied_irma", () => {
      // AI returned drainageMat: false but layer text mentions drainage mat
      const r = enrichAssembly({
        system: "lam",
        drainageMat: false,
        filterFabric: false,
        layers: ["Concrete Deck", "Waterproofing Membrane", "Drainage Mat", "XPS Insulation", "Filter Fabric"],
      });
      // normalizeAssemblySignals upgrades drainageMat from layer evidence
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.legacySystemType).toBe("lam_irma");
    });
  });

  describe("hydrotech → liquid_applied_irma", () => {
    test("hydrotech maps to liquid_applied_irma", () => {
      const r = enrichAssembly({ system: "hydrotech" });
      expect(r.archetypeId).toBe("liquid_applied_irma");
      expect(r.archetypeResolutionSource).toBe("mapped");
      expect(r.archetypeNeedsReview).toBe(false);
      expect(r.legacySystemType).toBe("hydrotech");
      expect(r.legacySystemId).toBe("hydrotech");
    });
  });

  describe("sbs: conventional vs IRMA", () => {
    test("sbs (no signals) → modified_bitumen_sbs", () => {
      const r = enrichAssembly({ system: "sbs", drainageMat: false, filterFabric: false });
      expect(r.archetypeId).toBe("modified_bitumen_sbs");
      expect(r.legacySystemType).toBe("sbs");
    });

    test("sbs (drainageMat: true) → modified_bitumen_irma", () => {
      const r = enrichAssembly({ system: "sbs", drainageMat: true, filterFabric: false });
      expect(r.archetypeId).toBe("modified_bitumen_irma");
      expect(r.legacySystemType).toBe("sbs_irma");
      expect(r.legacySystemId).toBe("sbs");
    });

    test("app (conventional) → modified_bitumen_sbs", () => {
      const r = enrichAssembly({ system: "app", drainageMat: false });
      expect(r.archetypeId).toBe("modified_bitumen_sbs");
    });
  });

  describe("hardscape and concrete", () => {
    test("concrete → concrete_pavement_roof", () => {
      const r = enrichAssembly({ system: "concrete" });
      expect(r.archetypeId).toBe("concrete_pavement_roof");
      expect(r.archetypeNeedsReview).toBe(false);
    });
  });

  describe("unknown systems → custom + needsReview", () => {
    test("bur → custom with needsReview", () => {
      const r = enrichAssembly({ system: "bur" });
      expect(r.archetypeId).toBe("custom");
      expect(r.archetypeNeedsReview).toBe(true);
      expect(r.archetypeFallbackReason).toBeTruthy();
      expect(typeof r.archetypeFallbackReason).toBe("string");
    });

    test("metal → custom with needsReview", () => {
      const r = enrichAssembly({ system: "metal" });
      expect(r.archetypeId).toBe("custom");
      expect(r.archetypeNeedsReview).toBe(true);
    });

    test("spf → custom with needsReview", () => {
      const r = enrichAssembly({ system: "spf" });
      expect(r.archetypeId).toBe("custom");
      expect(r.archetypeNeedsReview).toBe(true);
    });

    test("completely unknown system → custom with needsReview", () => {
      const r = enrichAssembly({ system: "xyz_mystery_system" });
      expect(r.archetypeId).toBe("custom");
      expect(r.archetypeNeedsReview).toBe(true);
      expect(r.archetypeFallbackReason).toContain("xyz_mystery_system");
    });

    test("null system → custom with needsReview", () => {
      const r = enrichAssembly({ system: null });
      expect(r.archetypeId).toBe("custom");
      expect(r.archetypeNeedsReview).toBe(true);
    });
  });

  describe("backward compatibility — existing fields preserved", () => {
    test("all original fields remain present and unchanged", () => {
      const original = {
        system: "tpo",
        label: "RT-01",
        insulation: "polyiso",
        thickness: "3.5",
        rValue: 20,
        surface: "exposed",
        area: 4500,
        name: "MAIN ROOF",
        deckType: "steel",
        drainageMat: false,
        filterFabric: false,
      };
      const r = enrichAssembly(original);

      // Original fields must be unchanged
      expect(r.system).toBe(original.system);
      expect(r.label).toBe(original.label);
      expect(r.insulation).toBe(original.insulation);
      expect(r.thickness).toBe(original.thickness);
      expect(r.rValue).toBe(original.rValue);
      expect(r.surface).toBe(original.surface);
      expect(r.area).toBe(original.area);
      expect(r.name).toBe(original.name);
      expect(r.deckType).toBe(original.deckType);
      expect(r.drainageMat).toBe(original.drainageMat);
      expect(r.filterFabric).toBe(original.filterFabric);
    });

    test("new archetype fields are additive", () => {
      const r = enrichAssembly({ system: "tpo" });
      expect(r).toHaveProperty("archetypeId");
      expect(r).toHaveProperty("archetypeResolutionSource");
      expect(r).toHaveProperty("archetypeNeedsReview");
      expect(r).toHaveProperty("legacySystemType");
      expect(r).toHaveProperty("legacySystemId");
    });

    test("archetypeFallbackReason only present on fallback assemblies", () => {
      const tpo = enrichAssembly({ system: "tpo" });
      expect(tpo).not.toHaveProperty("archetypeFallbackReason");

      const metal = enrichAssembly({ system: "metal" });
      expect(metal).toHaveProperty("archetypeFallbackReason");
    });

    test("legacySystemId is undefined when system is empty", () => {
      const r = enrichAssembly({ system: "" });
      expect(r.legacySystemId).toBeUndefined();
    });
  });

  describe("real-world extraction batch", () => {
    test("6-assembly project: mixed systems all resolve correctly", () => {
      const batch = [
        { system: "lam", drainageMat: true, filterFabric: true },    // IRMA
        { system: "lam", drainageMat: false, filterFabric: false },  // conventional
        { system: "tpo" },
        { system: "sbs", drainageMat: true },                        // SBS IRMA
        { system: "concrete" },
        { system: "bur" },
      ];

      const results = batch.map(enrichAssembly);

      expect(results[0].archetypeId).toBe("liquid_applied_irma");
      expect(results[1].archetypeId).toBe("conventional_liquid_applied");
      expect(results[2].archetypeId).toBe("single_ply_tpo");
      expect(results[3].archetypeId).toBe("modified_bitumen_irma");
      expect(results[4].archetypeId).toBe("concrete_pavement_roof");
      expect(results[5].archetypeId).toBe("custom");

      // Only bur needs review
      const needsReview = results.filter((r) => r.archetypeNeedsReview);
      expect(needsReview).toHaveLength(1);
      expect(needsReview[0].legacySystemType).toBe("bur");
    });

    test("lam_irma legacySystemId is 'lam' (the AI output), not 'lam_irma'", () => {
      // The AI always returns "lam" — lam_irma is derived post-classification.
      // legacySystemId captures the raw AI output; legacySystemType is the classified form.
      const r = enrichAssembly({ system: "lam", drainageMat: true });
      expect(r.legacySystemId).toBe("lam");
      expect(r.legacySystemType).toBe("lam_irma");
    });
  });
});
