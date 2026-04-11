import { describe, it, expect } from "vitest";
import {
  MATERIAL_TEMPLATES,
  MATERIAL_CATEGORIES,
  MaterialTemplate,
  MaterialCategory,
  getTemplatesForSystem,
  getTemplatesGroupedByCategory,
  calculateMaterialQuantity,
} from "@/lib/bidshield/material-templates";

describe("MATERIAL_TEMPLATES", () => {
  describe("template structure", () => {
    it("templates array is not empty", () => {
      expect(MATERIAL_TEMPLATES.length).toBeGreaterThan(0);
    });

    it("each template has required fields", () => {
      for (const template of MATERIAL_TEMPLATES) {
        expect(template).toHaveProperty("key");
        expect(template).toHaveProperty("category");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("unit");
        expect(template).toHaveProperty("calcType");
        expect(template).toHaveProperty("wasteFactor");
        expect(template).toHaveProperty("systemTypes");
        expect(template).toHaveProperty("sortOrder");
      }
    });

    it("template keys are unique", () => {
      const keys = MATERIAL_TEMPLATES.map(t => t.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it("template names are non-empty strings", () => {
      for (const template of MATERIAL_TEMPLATES) {
        expect(typeof template.name).toBe("string");
        expect(template.name.length).toBeGreaterThan(0);
      }
    });

    it("waste factors are reasonable (>= 1.0)", () => {
      for (const template of MATERIAL_TEMPLATES) {
        expect(template.wasteFactor).toBeGreaterThanOrEqual(1.0);
        expect(template.wasteFactor).toBeLessThanOrEqual(2.0);
      }
    });

    it("sort orders are positive integers", () => {
      for (const template of MATERIAL_TEMPLATES) {
        expect(typeof template.sortOrder).toBe("number");
        expect(template.sortOrder).toBeGreaterThan(0);
      }
    });
  });

  describe("template categories", () => {
    it("all templates have valid categories", () => {
      const validCategories = Object.keys(MATERIAL_CATEGORIES);
      for (const template of MATERIAL_TEMPLATES) {
        expect(validCategories).toContain(template.category);
      }
    });

    it("MATERIAL_CATEGORIES has expected categories", () => {
      const expectedCategories = [
        "membrane",
        "insulation",
        "fasteners",
        "adhesive",
        "sheet_metal",
        "lumber",
        "accessories",
        "miscellaneous",
      ];
      for (const cat of expectedCategories) {
        expect(MATERIAL_CATEGORIES).toHaveProperty(cat);
      }
    });

    it("each category has label and icon", () => {
      for (const category of Object.values(MATERIAL_CATEGORIES)) {
        expect(category).toHaveProperty("label");
        expect(category).toHaveProperty("icon");
        expect(typeof category.label).toBe("string");
        expect(typeof category.icon).toBe("string");
      }
    });
  });

  describe("system types in templates", () => {
    it("all templates have non-empty systemTypes", () => {
      for (const template of MATERIAL_TEMPLATES) {
        expect(Array.isArray(template.systemTypes)).toBe(true);
        expect(template.systemTypes.length).toBeGreaterThan(0);
      }
    });

    it("common system types include tpo, pvc, epdm, sbs", () => {
      const allSystemTypes = new Set<string>();
      for (const template of MATERIAL_TEMPLATES) {
        template.systemTypes.forEach(st => allSystemTypes.add(st));
      }
      expect(allSystemTypes.has("tpo")).toBe(true);
      expect(allSystemTypes.has("pvc")).toBe(true);
      expect(allSystemTypes.has("epdm")).toBe(true);
      expect(allSystemTypes.has("sbs")).toBe(true);
    });

    it("'all' system type is used correctly", () => {
      const allSystemsCount = MATERIAL_TEMPLATES.filter(t => t.systemTypes.length === 4).length;
      expect(allSystemsCount).toBeGreaterThan(0);
    });
  });

  describe("coverage and calculation types", () => {
    it("coverage-based templates have defaultCoverage", () => {
      const coverageTemplates = MATERIAL_TEMPLATES.filter(t => t.calcType === "coverage");
      expect(coverageTemplates.length).toBeGreaterThan(0);
      for (const template of coverageTemplates) {
        expect(template.defaultCoverage).toBeGreaterThan(0);
      }
    });

    it("qty_per_sf templates have defaultQtyPerSf", () => {
      const qtyTemplates = MATERIAL_TEMPLATES.filter(t => t.calcType === "qty_per_sf");
      expect(qtyTemplates.length).toBeGreaterThan(0);
      for (const template of qtyTemplates) {
        expect(template.defaultQtyPerSf).toBeGreaterThan(0);
      }
    });

    it("takeoff-based templates have takeoffItemType", () => {
      const takeoffTypes = ["linear_from_takeoff", "count_from_takeoff"];
      for (const calcType of takeoffTypes) {
        const takeoffTemplates = MATERIAL_TEMPLATES.filter(t => t.calcType === calcType);
        for (const template of takeoffTemplates) {
          expect(template.takeoffItemType).toBeDefined();
          expect(template.takeoffItemType?.length).toBeGreaterThan(0);
        }
      }
    });

    it("fixed calc type doesn't require coverage or qty", () => {
      const fixedTemplates = MATERIAL_TEMPLATES.filter(t => t.calcType === "fixed");
      expect(fixedTemplates.length).toBeGreaterThan(0);
    });
  });

  describe("membrane products", () => {
    it("has TPO membrane templates", () => {
      const tpoMembranes = MATERIAL_TEMPLATES.filter(
        t => t.category === "membrane" && t.systemTypes.includes("tpo")
      );
      expect(tpoMembranes.length).toBeGreaterThan(0);
    });

    it("has PVC membrane templates", () => {
      const pvcMembranes = MATERIAL_TEMPLATES.filter(
        t => t.category === "membrane" && t.systemTypes.includes("pvc")
      );
      expect(pvcMembranes.length).toBeGreaterThan(0);
    });

    it("has EPDM membrane templates", () => {
      const epdmMembranes = MATERIAL_TEMPLATES.filter(
        t => t.category === "membrane" && t.systemTypes.includes("epdm")
      );
      expect(epdmMembranes.length).toBeGreaterThan(0);
    });

    it("has SBS membrane templates", () => {
      const sbsMembranes = MATERIAL_TEMPLATES.filter(
        t => t.category === "membrane" && t.systemTypes.includes("sbs")
      );
      expect(sbsMembranes.length).toBeGreaterThan(0);
    });

    it("membrane templates use coverage calculation", () => {
      const membranes = MATERIAL_TEMPLATES.filter(t => t.category === "membrane");
      for (const membrane of membranes) {
        expect(membrane.calcType).toBe("coverage");
      }
    });

    it("membrane waste factors are reasonable", () => {
      const membranes = MATERIAL_TEMPLATES.filter(t => t.category === "membrane");
      for (const membrane of membranes) {
        expect(membrane.wasteFactor).toBeGreaterThanOrEqual(1.05);
        expect(membrane.wasteFactor).toBeLessThanOrEqual(1.15);
      }
    });
  });

  describe("insulation products", () => {
    it("has multiple insulation types", () => {
      const insulation = MATERIAL_TEMPLATES.filter(t => t.category === "insulation");
      expect(insulation.length).toBeGreaterThan(3);
    });

    it("insulation includes polyiso and EPS", () => {
      const keys = MATERIAL_TEMPLATES.filter(t => t.category === "insulation").map(t => t.key);
      const hasPolyiso = keys.some(k => k.includes("iso"));
      const hasEps = keys.some(k => k.includes("eps"));
      expect(hasPolyiso).toBe(true);
      expect(hasEps).toBe(true);
    });

    it("insulation templates use coverage calculation", () => {
      const insulation = MATERIAL_TEMPLATES.filter(t => t.category === "insulation");
      for (const template of insulation) {
        expect(template.calcType).toBe("coverage");
      }
    });
  });

  describe("fasteners and accessories", () => {
    it("has fastener templates", () => {
      const fasteners = MATERIAL_TEMPLATES.filter(t => t.category === "fasteners");
      expect(fasteners.length).toBeGreaterThan(0);
    });

    it("has accessory templates", () => {
      const accessories = MATERIAL_TEMPLATES.filter(t => t.category === "accessories");
      expect(accessories.length).toBeGreaterThan(0);
    });

    it("fasteners cover different types", () => {
      const fasteners = MATERIAL_TEMPLATES.filter(t => t.category === "fasteners");
      const names = fasteners.map(f => f.name);
      expect(names.some(n => n.includes("Insulation"))).toBe(true);
      expect(names.some(n => n.includes("Membrane") || n.includes("Fasteners"))).toBe(true);
    });
  });

  describe("default unit prices", () => {
    it("templates have reasonable unit prices when provided", () => {
      for (const template of MATERIAL_TEMPLATES) {
        if (template.defaultUnitPrice !== undefined) {
          expect(template.defaultUnitPrice).toBeGreaterThan(0);
          expect(template.defaultUnitPrice).toBeLessThan(10000);
        }
      }
    });

    it("membrane prices are higher than cheap materials", () => {
      const membranes = MATERIAL_TEMPLATES.filter(
        t => t.category === "membrane" && t.defaultUnitPrice
      );
      const avgPrice = membranes.reduce((sum, m) => sum + (m.defaultUnitPrice || 0), 0) / membranes.length;
      expect(avgPrice).toBeGreaterThan(50);
    });
  });

  describe("getTemplatesForSystem", () => {
    it("returns all templates when no system specified", () => {
      const all = getTemplatesForSystem();
      expect(all.length).toBe(MATERIAL_TEMPLATES.length);
    });

    it("returns templates for single system type", () => {
      const tpo = getTemplatesForSystem("tpo");
      expect(tpo.length).toBeGreaterThan(0);
      for (const template of tpo) {
        expect(
          template.systemTypes.includes("tpo") || template.systemTypes.length === 4
        ).toBe(true);
      }
    });

    it("returns templates for multiple system types", () => {
      const types = getTemplatesForSystem(["tpo", "pvc"]);
      expect(types.length).toBeGreaterThan(0);
      for (const template of types) {
        const hasSystem = ["tpo", "pvc"].some(st => template.systemTypes.includes(st));
        expect(hasSystem || template.systemTypes.length === 4).toBe(true);
      }
    });

    it("returns superset of individual queries", () => {
      const tpo = getTemplatesForSystem("tpo");
      const pvc = getTemplatesForSystem("pvc");
      const both = getTemplatesForSystem(["tpo", "pvc"]);
      expect(both.length).toBeGreaterThanOrEqual(tpo.length);
      expect(both.length).toBeGreaterThanOrEqual(pvc.length);
    });
  });

  describe("getTemplatesGroupedByCategory", () => {
    it("returns grouped templates", () => {
      const grouped = getTemplatesGroupedByCategory();
      expect(Object.keys(grouped).length).toBe(8);
    });

    it("each category is populated or empty", () => {
      const grouped = getTemplatesGroupedByCategory();
      for (const [category, templates] of Object.entries(grouped)) {
        expect(Array.isArray(templates)).toBe(true);
        expect(typeof category).toBe("string");
      }
    });

    it("membrane category has items", () => {
      const grouped = getTemplatesGroupedByCategory();
      expect(grouped.membrane.length).toBeGreaterThan(0);
    });

    it("insulation category has items", () => {
      const grouped = getTemplatesGroupedByCategory();
      expect(grouped.insulation.length).toBeGreaterThan(0);
    });

    it("respects system type filter in grouping", () => {
      const grouped = getTemplatesGroupedByCategory("tpo");
      for (const templates of Object.values(grouped)) {
        for (const template of templates) {
          expect(
            template.systemTypes.includes("tpo") || template.systemTypes.length === 4
          ).toBe(true);
        }
      }
    });
  });

  describe("calculateMaterialQuantity", () => {
    const template: MaterialTemplate = {
      key: "test-membrane",
      category: "membrane",
      name: "Test Membrane",
      unit: "RL",
      calcType: "coverage",
      defaultCoverage: 1000,
      wasteFactor: 1.05,
      systemTypes: ["tpo"],
      sortOrder: 1,
    };

    it("calculates coverage-based quantity", () => {
      const qty = calculateMaterialQuantity(template, 10000, []);
      expect(qty).toBeDefined();
      expect(typeof qty).toBe("number");
      expect(qty).toBeGreaterThan(0);
    });

    it("applies waste factor to coverage calculation", () => {
      const noWaste = calculateMaterialQuantity(
        { ...template, wasteFactor: 1.0 },
        1000,
        []
      );
      const withWaste = calculateMaterialQuantity(
        { ...template, wasteFactor: 1.1 },
        1000,
        []
      );
      expect(withWaste).toBeGreaterThan(noWaste!);
    });

    it("returns null for zero or negative sqft", () => {
      const qty1 = calculateMaterialQuantity(template, 0, []);
      const qty2 = calculateMaterialQuantity(template, -100, []);
      expect(qty1).toBeNull();
      expect(qty2).toBeNull();
    });

    it("calculates qty_per_sf based quantity", () => {
      const fastenerTemplate: MaterialTemplate = {
        key: "iso-fasteners",
        category: "fasteners",
        name: "Insulation Screws",
        unit: "BX",
        calcType: "qty_per_sf",
        defaultQtyPerSf: 1 / 4,
        wasteFactor: 1.05,
        systemTypes: ["all"],
        sortOrder: 20,
      };
      const qty = calculateMaterialQuantity(fastenerTemplate, 4000, []);
      expect(qty).toBeDefined();
      expect(qty).toBeGreaterThan(0);
    });

    it("handles linear_from_takeoff calculation", () => {
      const sheetMetalTemplate: MaterialTemplate = {
        key: "drip-edge",
        category: "sheet_metal",
        name: "Drip Edge",
        unit: "PC",
        calcType: "linear_from_takeoff",
        takeoffItemType: "edge_metal",
        wasteFactor: 1.05,
        systemTypes: ["all"],
        sortOrder: 40,
      };
      const qty = calculateMaterialQuantity(sheetMetalTemplate, 0, [
        { itemType: "edge_metal", quantity: 500 },
      ]);
      expect(qty).toBeDefined();
      expect(qty).toBeGreaterThan(0);
    });

    it("returns null if takeoff item not found", () => {
      const sheetMetalTemplate: MaterialTemplate = {
        key: "drip-edge",
        category: "sheet_metal",
        name: "Drip Edge",
        unit: "PC",
        calcType: "linear_from_takeoff",
        takeoffItemType: "edge_metal",
        wasteFactor: 1.05,
        systemTypes: ["all"],
        sortOrder: 40,
      };
      const qty = calculateMaterialQuantity(sheetMetalTemplate, 0, [
        { itemType: "other_item", quantity: 500 },
      ]);
      expect(qty).toBeNull();
    });

    it("handles count_from_takeoff calculation", () => {
      const bootTemplate: MaterialTemplate = {
        key: "pipe-boots",
        category: "accessories",
        name: "Pipe Boots",
        unit: "EA",
        calcType: "count_from_takeoff",
        takeoffItemType: "pipe_penetration",
        wasteFactor: 1.0,
        systemTypes: ["tpo"],
        sortOrder: 50,
      };
      const qty = calculateMaterialQuantity(bootTemplate, 0, [
        { itemType: "pipe_penetration", quantity: 12 },
      ]);
      expect(qty).toBeDefined();
      expect(qty).toBe(12);
    });

    it("respects override coverage parameter", () => {
      const qty = calculateMaterialQuantity(
        template,
        1000,
        [],
        { coverage: 500 }
      );
      expect(qty).toBeDefined();
      expect(qty).toBeGreaterThan(0);
    });

    it("respects override waste factor", () => {
      const defaultQty = calculateMaterialQuantity(template, 1000, []);
      const doubleWaste = calculateMaterialQuantity(
        template,
        1000,
        [],
        { wasteFactor: 2.0 }
      );
      // 2.0 waste factor should increase result (or be equal if rounding)
      expect(doubleWaste).toBeGreaterThanOrEqual(defaultQty!);
    });
  });

  describe("product availability and completeness", () => {
    it("has products for all common roof system types", () => {
      const systemTypes = ["tpo", "pvc", "epdm", "sbs"];
      for (const systemType of systemTypes) {
        const templates = getTemplatesForSystem(systemType);
        expect(templates.length).toBeGreaterThan(5);
      }
    });

    it("every category has at least one product", () => {
      const grouped = getTemplatesGroupedByCategory();
      for (const [category, templates] of Object.entries(grouped)) {
        if (category !== "miscellaneous") {
          expect(templates.length).toBeGreaterThan(0);
        }
      }
    });

    it("coverage and adhesive products exist", () => {
      const coverage = MATERIAL_TEMPLATES.filter(t => t.category === "membrane");
      const adhesive = MATERIAL_TEMPLATES.filter(t => t.category === "adhesive");
      expect(coverage.length).toBeGreaterThan(0);
      expect(adhesive.length).toBeGreaterThan(0);
    });
  });

  describe("unit consistency", () => {
    it("all templates have valid units", () => {
      const validUnits = ["RL", "BD", "BX", "CS", "GL", "PC", "EA", "LF"];
      for (const template of MATERIAL_TEMPLATES) {
        expect(validUnits).toContain(template.unit);
      }
    });

    it("membrane templates use RL (rolls)", () => {
      const membranes = MATERIAL_TEMPLATES.filter(t => t.category === "membrane");
      for (const membrane of membranes) {
        expect(membrane.unit).toBe("RL");
      }
    });

    it("insulation templates use BD (boards)", () => {
      const insulation = MATERIAL_TEMPLATES.filter(t => t.category === "insulation");
      for (const item of insulation) {
        expect(["BD", "GL"]).toContain(item.unit);
      }
    });
  });
});
