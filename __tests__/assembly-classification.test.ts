/**
 * Regression tests for assembly classification and insulation normalization.
 *
 * Tests:
 *  A — Roof 06: conventional lam (NOT IRMA)
 *  B — Roof 05: IRMA/PMR assembly
 *  C — Backward compatibility: existing lam records
 *  D — Insulation normalization formatting
 */

import { describe, it, expect } from "vitest";
import {
  classifyAssemblySystem,
  validateAssembly,
  formatInsulationLabel,
  mapAIResultToSectionValues,
  INSULATION_CODE_LABELS,
} from "@/lib/bidshield/assembly-system-configs";

// ─────────────────────────────────────────────────────────────────────────────
// TEST A — Roof 06: Conventional LAM (insulation below membrane, no IRMA signals)
// Stack: Concrete Deck → DensGlass → 7" Rigid Insulation → Cementitious Board
//        → Waterproofing Membrane → Aluminum Panel
// ─────────────────────────────────────────────────────────────────────────────

describe("Test A — Roof 06 conventional lam", () => {
  const roof06Input = {
    drainageMat: false as const,
    filterFabric: false as const,
    ocrText:
      "Concrete Deck, DensGlass Sheathing, 7\" Rigid Insulation (R-35), Cementitious Board, Waterproofing Membrane, Aluminum Panel",
  };

  it("classifies as lam, NOT lam_irma", () => {
    const system = classifyAssemblySystem(roof06Input);
    expect(system).toBe("lam");
    expect(system).not.toBe("lam_irma");
  });

  it("produces no IRMA validation errors", () => {
    const issues = validateAssembly({
      system: "lam",
      drainageMat: false,
      filterFabric: false,
    });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("produces no drainage mat error for lam", () => {
    const issues = validateAssembly({
      system: "lam",
      drainageMat: false,
      filterFabric: false,
    });
    const drainageErrors = issues.filter(
      (i) =>
        i.severity === "error" &&
        (i.code.includes("drainage") || i.code.includes("filter")),
    );
    expect(drainageErrors).toHaveLength(0);
  });

  it("produces no filter fabric error for lam", () => {
    const issues = validateAssembly({
      system: "lam",
      drainageMat: false,
      filterFabric: false,
    });
    const filterErrors = issues.filter(
      (i) => i.severity === "error" && i.code.includes("filter"),
    );
    expect(filterErrors).toHaveLength(0);
  });

  it("insulation label is never '3 rigid'", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "rigid",
      thickness: "7",
      rValue: 35,
      drainageMat: false,
      filterFabric: false,
    });
    expect(result.insulationLabel).not.toBe("3 rigid");
    expect(result.insulationLabel).not.toMatch(/^\d+\s+\w+$/); // no bare "N code" pattern
  });

  it("insulation label is '7\" Rigid Insulation (R-35)'", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "rigid",
      thickness: "7",
      rValue: 35,
      drainageMat: false,
      filterFabric: false,
    });
    expect(result.insulationLabel).toBe('7" Rigid Insulation (R-35)');
  });

  it("system is lam in mapAIResultToSectionValues output", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "rigid",
      thickness: "7",
      rValue: 35,
      drainageMat: false,
      filterFabric: false,
    });
    expect(result.assemblySystem).toBe("lam");
  });

  it("rValue is extracted correctly", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "rigid",
      thickness: "7",
      rValue: 35,
      drainageMat: false,
      filterFabric: false,
    });
    expect(result.rValue).toBe(35);
  });

  it("does not classify as lam_irma when ocrText has no IRMA keywords", () => {
    const system = classifyAssemblySystem({
      drainageMat: false,
      filterFabric: false,
      ocrText:
        "Concrete Deck, DensGlass, Rigid Insulation, Waterproofing Membrane, Aluminum Panel",
    });
    expect(system).toBe("lam");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST B — Roof 05: IRMA/PMR
// Stack: Concrete Deck → Waterproofing Membrane → Drainage Mat → Rigid Insulation
//        → Filter Fabric → Gravel → Concrete Pavement
// ─────────────────────────────────────────────────────────────────────────────

describe("Test B — Roof 05 IRMA/PMR", () => {
  const roof05Input = {
    drainageMat: true as const,
    filterFabric: true as const,
    ocrText:
      "Concrete Deck, Waterproofing Membrane, Drainage Mat, Rigid Insulation, Filter Fabric, Gravel, Concrete Pavement",
  };

  it("classifies as lam_irma when drainageMat=true", () => {
    const system = classifyAssemblySystem(roof05Input);
    expect(system).toBe("lam_irma");
  });

  it("classifies as lam_irma when filterFabric=true", () => {
    const system = classifyAssemblySystem({
      drainageMat: false,
      filterFabric: true,
    });
    expect(system).toBe("lam_irma");
  });

  it("classifies as lam_irma when drainageMat=true only", () => {
    const system = classifyAssemblySystem({
      drainageMat: true,
      filterFabric: false,
    });
    expect(system).toBe("lam_irma");
  });

  it("validates as a valid IRMA assembly with no errors", () => {
    const issues = validateAssembly({
      system: "lam_irma",
      drainageMat: true,
      filterFabric: true,
      insulationAboveMembrane: true,
    });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("mapAIResultToSectionValues returns lam_irma", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "xps",
      drainageMat: true,
      filterFabric: true,
    });
    expect(result.assemblySystem).toBe("lam_irma");
  });

  it("IRMA classification via explicit keyword in ocrText", () => {
    const system = classifyAssemblySystem({
      drainageMat: false,
      filterFabric: false,
      ocrText: "IRMA Assembly, Waterproofing Membrane, XPS Insulation",
    });
    expect(system).toBe("lam_irma");
  });

  it("IRMA classification via PMR keyword", () => {
    const system = classifyAssemblySystem({
      drainageMat: false,
      filterFabric: false,
      ocrText: "Protected Membrane Roof — PMR system with XPS insulation",
    });
    expect(system).toBe("lam_irma");
  });

  it("IRMA classification via 'inverted roof' keyword", () => {
    const system = classifyAssemblySystem({
      drainageMat: false,
      filterFabric: false,
      ocrText: "inverted roof assembly with drainage layer",
    });
    expect(system).toBe("lam_irma");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST C — Backward compatibility: existing lam records
// Existing records stored as lam must NOT suddenly require IRMA fields
// ─────────────────────────────────────────────────────────────────────────────

describe("Test C — Backward compatibility: existing lam records", () => {
  it("existing lam record with no drainageMat/filterFabric stays lam", () => {
    const system = classifyAssemblySystem({});
    expect(system).toBe("lam");
  });

  it("existing lam record with undefined flags has no errors", () => {
    const issues = validateAssembly({ system: "lam" });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("existing lam record with undefined flags has no filter fabric errors", () => {
    const issues = validateAssembly({ system: "lam" });
    const filterErrors = issues.filter(
      (i) => i.severity === "error" && i.code.includes("filter"),
    );
    expect(filterErrors).toHaveLength(0);
  });

  it("existing lam record with undefined flags has no drainage mat errors", () => {
    const issues = validateAssembly({ system: "lam" });
    const drainageErrors = issues.filter(
      (i) => i.severity === "error" && i.code.includes("drainage"),
    );
    expect(drainageErrors).toHaveLength(0);
  });

  it("existing lam record with null flags produces no errors", () => {
    const issues = validateAssembly({
      system: "lam",
      drainageMat: null,
      filterFabric: null,
    });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("drainage info item is a soft review (info/warning), not an error", () => {
    const issues = validateAssembly({
      system: "lam",
      drainageMat: false,
    });
    // If drainage is flagged at all, it must only be info severity
    const drainageIssues = issues.filter((i) => i.code.includes("drainage"));
    drainageIssues.forEach((issue) => {
      expect(issue.severity).not.toBe("error");
    });
  });

  it("mapAIResultToSectionValues with minimal lam input has no hard errors", () => {
    const result = mapAIResultToSectionValues({
      system: "lam",
      insulation: "polyiso",
      thickness: "3",
    });
    expect(result.assemblySystem).toBe("lam");
    const errors = result.validationIssues.filter(
      (i) => i.severity === "error",
    );
    expect(errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST D — Insulation normalization formatting
// ─────────────────────────────────────────────────────────────────────────────

describe("Test D — Insulation normalization", () => {
  it('formats {insulationType:"rigid", insulationThickness:"7", rValue:35} as \'7" Rigid Insulation (R-35)\'', () => {
    const label = formatInsulationLabel("rigid", "7", 35);
    expect(label).toBe('7" Rigid Insulation (R-35)');
  });

  it('formats {insulationType:"xps", insulationThickness:"7", rValue:35} as \'7" XPS Rigid Insulation (R-35)\'', () => {
    const label = formatInsulationLabel("xps", "7", 35);
    expect(label).toBe('7" XPS Rigid Insulation (R-35)');
  });

  it('formats {insulationType:"polyiso", insulationThickness:"3"} as \'3" Polyisocyanurate\'', () => {
    const label = formatInsulationLabel("polyiso", "3");
    expect(label).toBe('3" Polyisocyanurate');
  });

  it('formats {insulationType:"mineral_wool", insulationThickness:"5"} as \'5" Mineral Wool\'', () => {
    const label = formatInsulationLabel("mineral_wool", "5");
    expect(label).toBe('5" Mineral Wool');
  });

  it('never outputs "3 rigid"', () => {
    const label = formatInsulationLabel("rigid", "3");
    expect(label).not.toBe("3 rigid");
    expect(label).toBe('3" Rigid Insulation');
  });

  it('never outputs "7 xps"', () => {
    const label = formatInsulationLabel("xps", "7");
    expect(label).not.toBe("7 xps");
    expect(label).toBe('7" XPS Rigid Insulation');
  });

  it("does not append (R-N) when rValue is null", () => {
    const label = formatInsulationLabel("polyiso", "3", null);
    expect(label).not.toContain("(R-");
    expect(label).toBe('3" Polyisocyanurate');
  });

  it("does not append (R-N) when rValue is undefined", () => {
    const label = formatInsulationLabel("polyiso", "3", undefined);
    expect(label).not.toContain("(R-");
  });

  it("appends (R-N) when rValue is provided", () => {
    const label = formatInsulationLabel("xps", "7", 35);
    expect(label).toContain("(R-35)");
  });

  it("handles unknown insulation type by using the raw code", () => {
    const label = formatInsulationLabel("unknown_type", "4");
    expect(label).toBe('4" unknown_type');
  });

  it("handles null insulationType gracefully", () => {
    const label = formatInsulationLabel(null, "4");
    expect(label).toBe('4" Insulation');
  });

  it("handles null thickness gracefully", () => {
    const label = formatInsulationLabel("polyiso", null);
    expect(label).toBe("Polyisocyanurate");
  });

  it("mapAIResultToSectionValues uses formatInsulationLabel correctly", () => {
    const result = mapAIResultToSectionValues({
      insulation: "rigid",
      thickness: "7",
      rValue: 35,
      drainageMat: false,
      filterFabric: false,
    });
    expect(result.insulationLabel).toBe('7" Rigid Insulation (R-35)');
    expect(result.insulationType).toBe("rigid");
    expect(result.insulationThickness).toBe("7");
    expect(result.rValue).toBe(35);
  });

  it("INSULATION_CODE_LABELS has all expected keys", () => {
    const expected = [
      "polyiso",
      "xps",
      "xps_high",
      "eps",
      "mineral_wool",
      "rigid",
      "vacuum",
      "fiberglass",
      "spray_foam",
    ];
    expected.forEach((key) => {
      expect(INSULATION_CODE_LABELS).toHaveProperty(key);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTRA — Anti-hallucination: membrane type alone does not trigger IRMA
// ─────────────────────────────────────────────────────────────────────────────

describe("Anti-hallucination — no IRMA inference from membrane type alone", () => {
  it("lam system with no IRMA signals stays lam", () => {
    const system = classifyAssemblySystem({
      ocrText: "Liquid applied membrane waterproofing, aluminum panel cladding",
      drainageMat: false,
      filterFabric: false,
    });
    expect(system).toBe("lam");
  });

  it("'cold-applied membrane' text alone does not trigger IRMA", () => {
    const system = classifyAssemblySystem({
      ocrText: "Cold-applied liquid membrane, rigid insulation below membrane",
      drainageMat: false,
      filterFabric: false,
    });
    expect(system).toBe("lam");
  });

  it("'waterproofing membrane' text alone does not trigger IRMA", () => {
    const system = classifyAssemblySystem({
      ocrText:
        "Waterproofing membrane, cementitious board, aluminum panel system",
      drainageMat: false,
      filterFabric: false,
    });
    expect(system).toBe("lam");
  });

  it("null/undefined drainageMat and filterFabric results in lam", () => {
    expect(classifyAssemblySystem({ drainageMat: null, filterFabric: null })).toBe("lam");
    expect(classifyAssemblySystem({ drainageMat: undefined, filterFabric: undefined })).toBe("lam");
  });
});
