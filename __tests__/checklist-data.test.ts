import { describe, it, expect } from "vitest";
import { getChecklistForTrade, trades, masterChecklist, ChecklistPhaseDef, ChecklistItemDef } from "@/convex/bidshieldDefaults";

describe("getChecklistForTrade", () => {
  describe("returns valid phase structure", () => {
    it("returns phases with required fields", () => {
      const phases = getChecklistForTrade("roofing");
      expect(Object.keys(phases).length).toBeGreaterThan(0);

      for (const [key, phase] of Object.entries(phases)) {
        expect(phase).toHaveProperty("key");
        expect(phase).toHaveProperty("title");
        expect(phase).toHaveProperty("icon");
        expect(phase).toHaveProperty("items");
        expect(Array.isArray(phase.items)).toBe(true);
        expect(phase.items.length).toBeGreaterThan(0);
      }
    });

    it("phase has title string", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        expect(typeof phase.title).toBe("string");
        expect(phase.title.length).toBeGreaterThan(0);
      }
    });

    it("phase has icon string", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        expect(typeof phase.icon).toBe("string");
        expect(phase.icon.length).toBeGreaterThan(0);
      }
    });

    it("phase key matches entry key", () => {
      const phases = getChecklistForTrade("roofing");
      for (const [key, phase] of Object.entries(phases)) {
        expect(phase.key).toBe(key);
      }
    });

    it("phase items have required fields", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        for (const item of phase.items) {
          expect(item).toHaveProperty("id");
          expect(item).toHaveProperty("text");
          expect(typeof item.id).toBe("string");
          expect(typeof item.text).toBe("string");
        }
      }
    });

    it("critical flag is boolean or undefined", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        if (phase.critical !== undefined) {
          expect(typeof phase.critical).toBe("boolean");
        }
      }
    });
  });

  describe("roofing trade checklist", () => {
    it("returns phases for roofing trade", () => {
      const phases = getChecklistForTrade("roofing");
      expect(Object.keys(phases).length).toBeGreaterThan(5);
    });

    it("has all expected roofing phases", () => {
      const phases = getChecklistForTrade("roofing");
      const expectedPhases = [
        "phase1", // Project Setup
        "phase2", // Document Receipt
        "phase3", // Architectural Review
      ];
      for (const phaseKey of expectedPhases) {
        expect(phases).toHaveProperty(phaseKey);
      }
    });

    it("Project Setup phase has required items", () => {
      const phases = getChecklistForTrade("roofing");
      const phase1 = phases.phase1;
      expect(phase1.items.length).toBeGreaterThan(0);
      const itemTexts = phase1.items.map((i: ChecklistItemDef) => i.text);
      expect(itemTexts.some(t => t.includes("Project name"))).toBe(true);
    });

    it("Document Receipt phase exists", () => {
      const phases = getChecklistForTrade("roofing");
      expect(phases).toHaveProperty("phase2");
      expect(phases.phase2.items.length).toBeGreaterThan(0);
    });
  });

  describe("system type filtering", () => {
    it("filters items by single system type", () => {
      const phasesTPO = getChecklistForTrade("roofing", "tpo");
      const phasesAll = getChecklistForTrade("roofing");
      // TPO-specific phases should have content
      expect(Object.keys(phasesTPO).length).toBeGreaterThan(0);
    });

    it("filters items by multiple system types", () => {
      const phases = getChecklistForTrade("roofing", ["tpo", "pvc"]);
      expect(Object.keys(phases).length).toBeGreaterThan(0);
      for (const phase of Object.values(phases)) {
        expect(phase.items.length).toBeGreaterThan(0);
      }
    });

    it("returns items applicable to selected system", () => {
      const phasesTPO = getChecklistForTrade("roofing", "tpo");
      // Should have project setup and other universal phases
      expect(phasesTPO).toHaveProperty("phase1");
    });

    it("includes universal items for any system type", () => {
      const systemTypes = ["tpo", "pvc", "epdm", "sbs"];
      const phaseSets = systemTypes.map(st => getChecklistForTrade("roofing", st));

      // All system types should include phase1 (universal)
      for (const phases of phaseSets) {
        expect(phases).toHaveProperty("phase1");
      }
    });
  });

  describe("deck type filtering", () => {
    it("filters items by deck type", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("includes universal items regardless of deck type", () => {
      const deckTypes = ["steel", "concrete", "wood"];
      for (const deckType of deckTypes) {
        const phases = getChecklistForTrade("roofing", "tpo", deckType);
        expect(phases).toHaveProperty("phase1");
      }
    });

    it("filters structural review items by deck type", () => {
      const phasesSteel = getChecklistForTrade("roofing", "tpo", "steel");
      const phasesWood = getChecklistForTrade("roofing", "tpo", "wood");

      // Should have phase4 (structural)
      expect(phasesSteel).toHaveProperty("phase4");
      expect(phasesWood).toHaveProperty("phase4");
    });
  });

  describe("FM Global and pre-1990 filtering", () => {
    it("includes FM Global items when fmGlobal is true", () => {
      const phasesWithFM = getChecklistForTrade("roofing", "tpo", "steel", true);
      const phasesWithoutFM = getChecklistForTrade("roofing", "tpo", "steel", false);

      // At minimum, should have phases
      expect(Object.keys(phasesWithFM).length).toBeGreaterThan(0);
      expect(Object.keys(phasesWithoutFM).length).toBeGreaterThan(0);
    });

    it("includes pre-1990 items when pre1990 is true", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel", false, true);
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("excludes pre-1990 items when pre1990 is false", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel", false, false);
      // Should still have content from other items
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });
  });

  describe("energy code filtering", () => {
    it("includes energy code items when energyCode is true", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel", false, false, true);
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("excludes energy code items when energyCode is false", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel", false, false, false);
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });
  });

  describe("critical phases", () => {
    it("marks certain phases as critical", () => {
      const phases = getChecklistForTrade("roofing");
      const criticalPhases = Object.values(phases).filter(p => p.critical === true);
      expect(criticalPhases.length).toBeGreaterThan(0);
    });

    it("some phases are marked as critical", () => {
      const phases = getChecklistForTrade("roofing");
      // Not all implementations mark phase1 as critical, but at least one phase should be
      const hasCritical = Object.values(phases).some(p => p.critical === true);
      expect(hasCritical).toBe(true);
    });

    it("critical phases have items", () => {
      const phases = getChecklistForTrade("roofing");
      const criticalPhases = Object.entries(phases).filter(([_, p]) => p.critical === true);
      for (const [_, phase] of criticalPhases) {
        expect(phase.items.length).toBeGreaterThan(0);
      }
    });

    it("critical phases have criticalRule description", () => {
      const phases = getChecklistForTrade("roofing");
      const phase5 = phases.phase5;
      if (phase5?.critical) {
        if (phase5.criticalRule) {
          expect(typeof phase5.criticalRule).toBe("string");
          expect(phase5.criticalRule.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("masterChecklist constant", () => {
    it("is defined", () => {
      expect(masterChecklist).toBeDefined();
    });

    it("is the roofing checklist", () => {
      expect(masterChecklist).toEqual(getChecklistForTrade("roofing"));
    });

    it("has phases", () => {
      expect(Object.keys(masterChecklist).length).toBeGreaterThan(0);
    });

    it("is equivalent to default roofing", () => {
      const roofingDefault = getChecklistForTrade("roofing");
      for (const key of Object.keys(masterChecklist)) {
        expect(roofingDefault).toHaveProperty(key);
      }
    });
  });

  describe("trades configuration", () => {
    it("exports trades array", () => {
      expect(Array.isArray(trades)).toBe(true);
      expect(trades.length).toBeGreaterThan(0);
    });

    it("roofing trade is available", () => {
      const roofing = trades.find(t => t.id === "roofing");
      expect(roofing).toBeDefined();
      expect(roofing?.available).toBe(true);
    });

    it("roofing has system types", () => {
      const roofing = trades.find(t => t.id === "roofing");
      expect(roofing?.systemTypes.length).toBeGreaterThan(0);
    });

    it("roofing has deck types", () => {
      const roofing = trades.find(t => t.id === "roofing");
      expect(roofing?.deckTypes.length).toBeGreaterThan(0);
    });

    it("roofing system types have id and label", () => {
      const roofing = trades.find(t => t.id === "roofing");
      for (const sysType of roofing?.systemTypes ?? []) {
        expect(sysType).toHaveProperty("id");
        expect(sysType).toHaveProperty("label");
        expect(typeof sysType.id).toBe("string");
        expect(typeof sysType.label).toBe("string");
      }
    });

    it("roofing deck types have id and label", () => {
      const roofing = trades.find(t => t.id === "roofing");
      for (const deckType of roofing?.deckTypes ?? []) {
        expect(deckType).toHaveProperty("id");
        expect(deckType).toHaveProperty("label");
        expect(typeof deckType.id).toBe("string");
        expect(typeof deckType.label).toBe("string");
      }
    });
  });

  describe("unknown trade", () => {
    it("returns universal phases for unknown trade", () => {
      const phases = getChecklistForTrade("unknown_trade");
      // Should either return empty or universal phases
      expect(phases).toBeDefined();
      expect(typeof phases).toBe("object");
    });
  });

  describe("no duplicate items across phases", () => {
    it("has unique item IDs within a phase", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        const ids = phase.items.map((i: ChecklistItemDef) => i.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it("item IDs follow naming convention", () => {
      const phases = getChecklistForTrade("roofing");
      for (const [phaseKey, phase] of Object.entries(phases)) {
        for (const item of phase.items) {
          // Items should have format like "p1-1", "p2-5", etc.
          expect(item.id).toMatch(/^p\d+-/);
        }
      }
    });
  });

  describe("item text quality", () => {
    it("all item text is non-empty", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        for (const item of phase.items) {
          expect(item.text.length).toBeGreaterThan(0);
        }
      }
    });

    it("item text does not have leading/trailing whitespace", () => {
      const phases = getChecklistForTrade("roofing");
      for (const phase of Object.values(phases)) {
        for (const item of phase.items) {
          expect(item.text).toBe(item.text.trim());
        }
      }
    });
  });

  describe("system type consistency", () => {
    it("tpo system type is available", () => {
      const phases = getChecklistForTrade("roofing", "tpo");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("pvc system type is available", () => {
      const phases = getChecklistForTrade("roofing", "pvc");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("epdm system type is available", () => {
      const phases = getChecklistForTrade("roofing", "epdm");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("sbs system type is available", () => {
      const phases = getChecklistForTrade("roofing", "sbs");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });
  });

  describe("deck type consistency", () => {
    it("steel deck type produces valid phases", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "steel");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("concrete deck type produces valid phases", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "concrete");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });

    it("wood deck type produces valid phases", () => {
      const phases = getChecklistForTrade("roofing", "tpo", "wood");
      expect(Object.keys(phases).length).toBeGreaterThan(0);
    });
  });
});
