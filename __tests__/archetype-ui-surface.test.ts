/**
 * Phase 5A: Archetype metadata UI surface tests
 *
 * Tests the data flow from extract-assemblies route response → AssemblyInput
 * and the badge rendering conditions, using pure function testing.
 *
 * We cannot render React components directly (no jsdom/testing-library setup),
 * so we test the logic that drives rendering:
 *   - field pass-through from route response to AssemblyInput
 *   - badge condition: needsReview badge shown when archetypeNeedsReview === true
 *   - fallback text shown when archetypeResolutionSource === "fallback"
 *   - old responses without archetype fields still work (no metadata shown)
 *   - non-fallback mapped archetype does NOT show warning
 */

import { describe, test, expect } from "vitest";
import { resolveAssemblyArchetype, formatArchetypeResolution } from "../lib/bidshield/archetype-compat";
import { normalizeAssemblySignals, classifyAssemblySystem } from "../lib/bidshield/assembly-system-configs";

// ─── Mirrors the mapped object construction in NewBidWizard ──────────────────

function buildAssemblyInput(routeAssembly: {
  label?: string;
  system?: string | null;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  layers?: string[] | null;
  area?: number | null;
  archetypeId?: string;
  archetypeResolutionSource?: string;
  archetypeNeedsReview?: boolean;
  archetypeFallbackReason?: string;
  legacySystemType?: string;
  legacySystemId?: string;
  [key: string]: unknown;
}) {
  return {
    label: routeAssembly.label || "RT-01",
    systemType: routeAssembly.system || "",
    area: typeof routeAssembly.area === "number" ? routeAssembly.area : undefined,
    extractedFromPdf: true,
    // Archetype metadata — passed through as-is
    archetypeId: routeAssembly.archetypeId || undefined,
    archetypeResolutionSource: routeAssembly.archetypeResolutionSource || undefined,
    archetypeNeedsReview: routeAssembly.archetypeNeedsReview === true,
    archetypeFallbackReason: routeAssembly.archetypeFallbackReason || undefined,
    legacySystemType: routeAssembly.legacySystemType || undefined,
    legacySystemId: routeAssembly.legacySystemId || undefined,
  };
}

// ─── Badge condition helpers (mirrors JSX conditions in NewBidWizard) ────────

function shouldShowArchetypeBadge(assembly: ReturnType<typeof buildAssemblyInput>): boolean {
  return !!assembly.archetypeId;
}

function shouldShowNeedsReviewBadge(assembly: ReturnType<typeof buildAssemblyInput>): boolean {
  return shouldShowArchetypeBadge(assembly) && assembly.archetypeNeedsReview === true;
}

function shouldShowMappedBadge(assembly: ReturnType<typeof buildAssemblyInput>): boolean {
  return shouldShowArchetypeBadge(assembly) && !assembly.archetypeNeedsReview;
}

function shouldShowFallbackText(assembly: ReturnType<typeof buildAssemblyInput>): boolean {
  return shouldShowArchetypeBadge(assembly) && assembly.archetypeResolutionSource === "fallback";
}

function getMappedBadgeText(assembly: ReturnType<typeof buildAssemblyInput>): string {
  return `✓ ${(assembly.archetypeId || "").replace(/_/g, " ")}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Phase 5A: archetype metadata UI surface", () => {
  describe("old extraction responses (no archetype fields) — backward compat", () => {
    test("assembly without archetypeId renders no badge", () => {
      const asm = buildAssemblyInput({ system: "tpo", label: "RT-01" });
      expect(asm.archetypeId).toBeUndefined();
      expect(shouldShowArchetypeBadge(asm)).toBe(false);
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
      expect(shouldShowFallbackText(asm)).toBe(false);
    });

    test("assembly with archetypeNeedsReview=false (default) renders no warning", () => {
      const asm = buildAssemblyInput({ system: "lam" });
      expect(asm.archetypeNeedsReview).toBe(false);
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
    });

    test("original fields preserved when no archetype metadata", () => {
      const asm = buildAssemblyInput({
        label: "RT-02",
        system: "sbs",
        area: 3200,
      });
      expect(asm.label).toBe("RT-02");
      expect(asm.systemType).toBe("sbs");
      expect(asm.area).toBe(3200);
      expect(asm.extractedFromPdf).toBe(true);
    });
  });

  describe("new responses with archetype metadata — mapped (non-fallback)", () => {
    test("lam → conventional_liquid_applied: mapped badge shown, no warning", () => {
      const asm = buildAssemblyInput({
        system: "lam",
        archetypeId: "conventional_liquid_applied",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
        legacySystemType: "lam",
        legacySystemId: "lam",
      });
      expect(shouldShowArchetypeBadge(asm)).toBe(true);
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
      expect(shouldShowMappedBadge(asm)).toBe(true);
      expect(shouldShowFallbackText(asm)).toBe(false);
      expect(getMappedBadgeText(asm)).toBe("✓ conventional liquid applied");
    });

    test("lam_irma → liquid_applied_irma: mapped badge, no warning", () => {
      const asm = buildAssemblyInput({
        system: "lam",
        archetypeId: "liquid_applied_irma",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
        legacySystemType: "lam_irma",
        legacySystemId: "lam",
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
      expect(shouldShowMappedBadge(asm)).toBe(true);
      expect(getMappedBadgeText(asm)).toBe("✓ liquid applied irma");
    });

    test("hydrotech → liquid_applied_irma: mapped badge, no warning", () => {
      const asm = buildAssemblyInput({
        system: "hydrotech",
        archetypeId: "liquid_applied_irma",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
        legacySystemType: "hydrotech",
        legacySystemId: "hydrotech",
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
      expect(shouldShowMappedBadge(asm)).toBe(true);
      expect(shouldShowFallbackText(asm)).toBe(false);
    });

    test("tpo: mapped badge shows correct label", () => {
      const asm = buildAssemblyInput({
        system: "tpo",
        archetypeId: "single_ply_tpo",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
      });
      expect(getMappedBadgeText(asm)).toBe("✓ single ply tpo");
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
    });

    test("sbs_irma: shows modified_bitumen_irma badge", () => {
      const asm = buildAssemblyInput({
        system: "sbs",
        archetypeId: "modified_bitumen_irma",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
        legacySystemType: "sbs_irma",
        legacySystemId: "sbs",
      });
      expect(shouldShowMappedBadge(asm)).toBe(true);
      expect(getMappedBadgeText(asm)).toBe("✓ modified bitumen irma");
    });
  });

  describe("fallback/custom — warning badge + fallback text", () => {
    test("bur → custom: warning badge shown", () => {
      const asm = buildAssemblyInput({
        system: "bur",
        archetypeId: "custom",
        archetypeResolutionSource: "fallback",
        archetypeNeedsReview: true,
        archetypeFallbackReason: 'Legacy systemId "bur" has no dedicated archetype yet — mapped to "custom". Review needed.',
        legacySystemType: "bur",
        legacySystemId: "bur",
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(true);
      expect(shouldShowMappedBadge(asm)).toBe(false);
      expect(shouldShowFallbackText(asm)).toBe(true);
      expect(asm.archetypeFallbackReason).toContain("bur");
    });

    test("metal → custom: warning + fallback text", () => {
      const asm = buildAssemblyInput({
        system: "metal",
        archetypeId: "custom",
        archetypeResolutionSource: "fallback",
        archetypeNeedsReview: true,
        archetypeFallbackReason: 'Legacy systemId "metal" has no dedicated archetype yet — mapped to "custom". Review needed.',
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(true);
      expect(shouldShowFallbackText(asm)).toBe(true);
    });

    test("spf → custom: warning shown", () => {
      const asm = buildAssemblyInput({
        system: "spf",
        archetypeId: "custom",
        archetypeResolutionSource: "fallback",
        archetypeNeedsReview: true,
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(true);
    });

    test("unknown system → custom: warning + fallback text", () => {
      const asm = buildAssemblyInput({
        system: "mystery_system",
        archetypeId: "custom",
        archetypeResolutionSource: "fallback",
        archetypeNeedsReview: true,
        archetypeFallbackReason: 'Unknown systemId "mystery_system" — no mapping found.',
      });
      expect(shouldShowNeedsReviewBadge(asm)).toBe(true);
      expect(shouldShowFallbackText(asm)).toBe(true);
      expect(asm.archetypeFallbackReason).toContain("mystery_system");
    });

    test("explicit custom (not fallback) — badge shown but no warning, no fallback text", () => {
      const asm = buildAssemblyInput({
        system: "custom",
        archetypeId: "custom",
        archetypeResolutionSource: "mapped",
        archetypeNeedsReview: false,
      });
      expect(shouldShowArchetypeBadge(asm)).toBe(true);
      expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
      expect(shouldShowFallbackText(asm)).toBe(false);
    });
  });

  describe("end-to-end: route output → badge conditions", () => {
    test("full enriched route batch: correct badge conditions per assembly", () => {
      // Simulates what extract-assemblies route now returns
      const routeAssemblies = [
        { system: "lam", drainageMat: false, archetypeId: "conventional_liquid_applied", archetypeResolutionSource: "mapped", archetypeNeedsReview: false, legacySystemType: "lam" },
        { system: "lam", drainageMat: true,  archetypeId: "liquid_applied_irma",          archetypeResolutionSource: "mapped", archetypeNeedsReview: false, legacySystemType: "lam_irma", legacySystemId: "lam" },
        { system: "hydrotech",               archetypeId: "liquid_applied_irma",          archetypeResolutionSource: "mapped", archetypeNeedsReview: false },
        { system: "tpo",                     archetypeId: "single_ply_tpo",               archetypeResolutionSource: "mapped", archetypeNeedsReview: false },
        { system: "bur",                     archetypeId: "custom",                       archetypeResolutionSource: "fallback", archetypeNeedsReview: true, archetypeFallbackReason: "bur has no archetype" },
        { system: "metal",                   archetypeId: "custom",                       archetypeResolutionSource: "fallback", archetypeNeedsReview: true },
      ];

      const assembled = routeAssemblies.map(buildAssemblyInput);

      // Mapped — no warnings
      expect(shouldShowNeedsReviewBadge(assembled[0])).toBe(false);
      expect(shouldShowMappedBadge(assembled[0])).toBe(true);

      expect(shouldShowNeedsReviewBadge(assembled[1])).toBe(false);
      expect(shouldShowNeedsReviewBadge(assembled[2])).toBe(false);
      expect(shouldShowNeedsReviewBadge(assembled[3])).toBe(false);

      // Fallbacks — warnings shown
      expect(shouldShowNeedsReviewBadge(assembled[4])).toBe(true);
      expect(shouldShowFallbackText(assembled[4])).toBe(true);
      expect(shouldShowNeedsReviewBadge(assembled[5])).toBe(true);

      const warnings = assembled.filter(shouldShowNeedsReviewBadge);
      expect(warnings).toHaveLength(2); // bur + metal
    });

    test("old response (no archetype fields) — badge not shown, no crash", () => {
      // Pre-Phase4B response shape
      const oldRouteAssemblies = [
        { system: "tpo", label: "RT-01", insulation: "polyiso", area: 4000 },
        { system: "lam", label: "RT-02", drainageMat: false },
      ];
      const assembled = oldRouteAssemblies.map(buildAssemblyInput);
      assembled.forEach((asm) => {
        expect(shouldShowArchetypeBadge(asm)).toBe(false);
        expect(shouldShowNeedsReviewBadge(asm)).toBe(false);
        expect(shouldShowFallbackText(asm)).toBe(false);
      });
    });
  });

  describe("field pass-through correctness", () => {
    test("archetypeId passed through correctly", () => {
      const asm = buildAssemblyInput({ archetypeId: "liquid_applied_irma" });
      expect(asm.archetypeId).toBe("liquid_applied_irma");
    });

    test("archetypeNeedsReview defaults to false when not present in response", () => {
      const asm = buildAssemblyInput({ system: "tpo" });
      expect(asm.archetypeNeedsReview).toBe(false);
    });

    test("archetypeNeedsReview is false when route sends false", () => {
      const asm = buildAssemblyInput({ archetypeNeedsReview: false });
      expect(asm.archetypeNeedsReview).toBe(false);
    });

    test("archetypeNeedsReview is true only when route explicitly sends true", () => {
      const asm = buildAssemblyInput({ archetypeNeedsReview: true });
      expect(asm.archetypeNeedsReview).toBe(true);
    });

    test("legacySystemId undefined when empty string from route", () => {
      const asm = buildAssemblyInput({ legacySystemId: "" });
      expect(asm.legacySystemId).toBeUndefined();
    });

    test("archetypeFallbackReason undefined when not in response", () => {
      const asm = buildAssemblyInput({ system: "tpo" });
      expect(asm.archetypeFallbackReason).toBeUndefined();
    });
  });
});
