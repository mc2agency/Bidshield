import { describe, it, expect } from "vitest";
import { detectScopePricingConflicts } from "@/lib/bidshield/scopePricingConflicts";

function makeScope(overrides: any = {}) {
  return {
    _id: `scope_${Math.random()}`,
    name: "Demolition of existing roof",
    category: "demolition",
    status: "included",
    ...overrides,
  };
}

function makeMaterial(overrides: any = {}) {
  return {
    name: "TPO Membrane",
    category: "membrane",
    totalCost: 5000,
    ...overrides,
  };
}

function makeLabor(overrides: any = {}) {
  return {
    task: "TPO Membrane Install",
    category: "membrane",
    ...overrides,
  };
}

describe("detectScopePricingConflicts", () => {
  it("returns empty array when no scope items", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [],
      projectMaterials: [makeMaterial()],
      laborTasks: [],
      project: { totalBidAmount: 100000 },
    });
    expect(result).toEqual([]);
  });

  it("detects included scope with no pricing (Conflict 1)", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [makeScope({ status: "included" })],
      projectMaterials: [],
      laborTasks: [],
      project: { totalBidAmount: 0 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("included_no_price");
    expect(result[0].severity).toBe("fail");
  });

  it("does NOT flag included scope when pricing exists", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [makeScope({ status: "included" })],
      projectMaterials: [makeMaterial()],
      laborTasks: [],
      project: { totalBidAmount: 100000 },
    });
    const includedNoPriceConflicts = result.filter(
      (c) => c.type === "included_no_price"
    );
    expect(includedNoPriceConflicts).toHaveLength(0);
  });

  it("detects unreviewed scope with pricing (Conflict 2)", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [
        makeScope({ status: "unaddressed" }),
        makeScope({ status: "unaddressed" }),
      ],
      projectMaterials: [makeMaterial()],
      laborTasks: [],
      project: { totalBidAmount: 50000 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unreviewed_scope_with_price");
    expect(result[0].severity).toBe("warn");
  });

  it("detects excluded scope with matching material (Conflict 3)", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [
        makeScope({
          status: "excluded",
          name: "Sheet metal flashings",
          category: "sheetmetal",
        }),
      ],
      projectMaterials: [
        makeMaterial({ name: "Metal edge flashing", category: "sheetmetal" }),
      ],
      laborTasks: [],
      project: { totalBidAmount: 100000 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("excluded_has_material");
    expect(result[0].severity).toBe("warn");
  });

  it("detects excluded scope with matching labor task (Conflict 4)", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [
        makeScope({
          status: "excluded",
          name: "Insulation installation",
          category: "insulation",
        }),
      ],
      projectMaterials: [],
      laborTasks: [
        makeLabor({ task: "Polyiso insulation install", category: "insulation" }),
      ],
      project: { totalBidAmount: 100000 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("excluded_has_labor");
  });

  it("treats 'by_others' same as excluded", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [
        makeScope({
          status: "by_others",
          name: "Demolition work",
          category: "demolition",
        }),
      ],
      projectMaterials: [
        makeMaterial({ name: "Demolition debris container", category: "demolition" }),
      ],
      laborTasks: [],
      project: { totalBidAmount: 100000 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("excluded_has_material");
  });

  it("does not double-flag same scope item for material + labor", () => {
    const scopeItem = makeScope({
      status: "excluded",
      name: "Insulation board",
      category: "insulation",
    });
    const result = detectScopePricingConflicts({
      scopeItems: [scopeItem],
      projectMaterials: [
        makeMaterial({ name: "Polyiso insulation board", category: "insulation" }),
      ],
      laborTasks: [
        makeLabor({ task: "Insulation board install", category: "insulation" }),
      ],
      project: { totalBidAmount: 100000 },
    });
    // Should only flag once (material match found first, so labor check skipped)
    expect(result).toHaveLength(1);
  });

  it("no conflicts when everything is consistent", () => {
    const result = detectScopePricingConflicts({
      scopeItems: [
        makeScope({ status: "included", name: "TPO Membrane", category: "membrane" }),
        makeScope({ status: "excluded", name: "Gutters", category: "drainage" }),
      ],
      projectMaterials: [
        makeMaterial({ name: "TPO 60mil membrane", category: "membrane" }),
      ],
      laborTasks: [
        makeLabor({ task: "TPO membrane welding", category: "membrane" }),
      ],
      project: { totalBidAmount: 250000 },
    });
    // Excluded "Gutters" doesn't match any material or labor, so no conflicts
    expect(result).toHaveLength(0);
  });
});
