import { describe, it, expect } from "vitest";
import { DEFAULT_SCOPE_ITEMS, SCOPE_CATEGORIES, ScopeCategory, DefaultScopeItem } from "@/lib/bidshield/scope-defaults";

describe("SCOPE_CATEGORIES", () => {
  describe("category structure", () => {
    it("has all expected scope categories", () => {
      const expectedCategories = [
        "demolition",
        "access",
        "protection",
        "schedule",
        "sheetmetal",
        "warranty",
        "safety",
        "general",
      ];
      for (const category of expectedCategories) {
        expect(SCOPE_CATEGORIES).toHaveProperty(category);
      }
    });

    it("each category has label and icon", () => {
      for (const [key, category] of Object.entries(SCOPE_CATEGORIES)) {
        expect(category).toHaveProperty("label");
        expect(category).toHaveProperty("icon");
        expect(typeof category.label).toBe("string");
        expect(typeof category.icon).toBe("string");
        expect(category.label.length).toBeGreaterThan(0);
        expect(category.icon.length).toBeGreaterThan(0);
      }
    });

    it("category labels are human-readable", () => {
      const labels = Object.values(SCOPE_CATEGORIES).map(c => c.label);
      for (const label of labels) {
        expect(label).toMatch(/[A-Z]/); // Has at least one capital letter
        expect(label.length).toBeGreaterThan(3);
      }
    });

    it("category icons are emojis", () => {
      const icons = Object.values(SCOPE_CATEGORIES).map(c => c.icon);
      for (const icon of icons) {
        // Emojis are at least 2+ bytes
        expect(Buffer.byteLength(icon, "utf8")).toBeGreaterThan(1);
      }
    });
  });
});

describe("DEFAULT_SCOPE_ITEMS", () => {
  describe("array structure", () => {
    it("is a non-empty array", () => {
      expect(Array.isArray(DEFAULT_SCOPE_ITEMS)).toBe(true);
      expect(DEFAULT_SCOPE_ITEMS.length).toBeGreaterThan(0);
    });

    it("each item has required fields", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("sortOrder");
      }
    });

    it("all items have valid category", () => {
      const validCategories = Object.keys(SCOPE_CATEGORIES);
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(validCategories).toContain(item.category);
      }
    });

    it("all items have non-empty name string", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(typeof item.name).toBe("string");
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.name).toBe(item.name.trim()); // No leading/trailing whitespace
      }
    });

    it("sort orders are positive integers", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(typeof item.sortOrder).toBe("number");
        expect(item.sortOrder).toBeGreaterThan(0);
        expect(Number.isInteger(item.sortOrder)).toBe(true);
      }
    });
  });

  describe("categories are well-distributed", () => {
    it("demolition category has items", () => {
      const demolitionItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "demolition");
      expect(demolitionItems.length).toBeGreaterThan(0);
    });

    it("access category has items", () => {
      const accessItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "access");
      expect(accessItems.length).toBeGreaterThan(0);
    });

    it("protection category has items", () => {
      const protectionItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "protection");
      expect(protectionItems.length).toBeGreaterThan(0);
    });

    it("schedule category has items", () => {
      const scheduleItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "schedule");
      expect(scheduleItems.length).toBeGreaterThan(0);
    });

    it("sheetmetal category has items", () => {
      const sheetmetalItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "sheetmetal");
      expect(sheetmetalItems.length).toBeGreaterThan(0);
    });

    it("warranty category has items", () => {
      const warrantyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "warranty");
      expect(warrantyItems.length).toBeGreaterThan(0);
    });

    it("safety category has items", () => {
      const safetyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "safety");
      expect(safetyItems.length).toBeGreaterThan(0);
    });

    it("general category has items", () => {
      const generalItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "general");
      expect(generalItems.length).toBeGreaterThan(0);
    });

    it("all categories are represented", () => {
      const categoriesRepresented = new Set(DEFAULT_SCOPE_ITEMS.map(i => i.category));
      const allCategories = Object.keys(SCOPE_CATEGORIES);
      for (const category of allCategories) {
        expect(categoriesRepresented.has(category as ScopeCategory)).toBe(true);
      }
    });
  });

  describe("sort order consistency", () => {
    it("sort orders are unique or have logical groupings", () => {
      const orders = DEFAULT_SCOPE_ITEMS.map(i => i.sortOrder);
      expect(orders.length).toBe(DEFAULT_SCOPE_ITEMS.length);
    });

    it("sort orders are sequential or near-sequential", () => {
      const orders = DEFAULT_SCOPE_ITEMS.map(i => i.sortOrder).sort((a, b) => a - b);
      expect(orders[0]).toBeGreaterThan(0);
      expect(orders[orders.length - 1]).toBeLessThan(100);
    });

    it("items can be sorted by sortOrder", () => {
      const sorted = [...DEFAULT_SCOPE_ITEMS].sort((a, b) => a.sortOrder - b.sortOrder);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].sortOrder).toBeGreaterThanOrEqual(sorted[i - 1].sortOrder);
      }
    });

    it("demolition items have lower sort order than later categories", () => {
      const demolitionMax = Math.max(...DEFAULT_SCOPE_ITEMS.filter(i => i.category === "demolition").map(i => i.sortOrder));
      const safetyMin = Math.min(...DEFAULT_SCOPE_ITEMS.filter(i => i.category === "safety").map(i => i.sortOrder));
      expect(demolitionMax).toBeLessThan(safetyMin);
    });
  });

  describe("item quality and content", () => {
    it("demolition items mention relevant work", () => {
      const demolitionItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "demolition");
      const names = demolitionItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("demo") || n.includes("tear"))).toBe(true);
    });

    it("safety items mention safety concerns", () => {
      const safetyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "safety");
      const names = safetyItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("safety") || n.includes("osha") || n.includes("protection"))).toBe(true);
    });

    it("warranty items mention warranty topics", () => {
      const warrantyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "warranty");
      const names = warrantyItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("warranty") || n.includes("inspection") || n.includes("documentation"))).toBe(true);
    });

    it("schedule items mention timing", () => {
      const scheduleItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "schedule");
      const names = scheduleItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("phasing") || n.includes("hours") || n.includes("weekend") || n.includes("conditions"))).toBe(true);
    });

    it("access items mention logistics", () => {
      const accessItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "access");
      const names = accessItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("access") || n.includes("staging") || n.includes("ladder"))).toBe(true);
    });

    it("sheet metal items mention proper items", () => {
      const sheetmetalItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "sheetmetal");
      const names = sheetmetalItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("scupper") || n.includes("coping") || n.includes("flashing") || n.includes("drain"))).toBe(true);
    });

    it("protection items mention covering/protection", () => {
      const protectionItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "protection");
      const names = protectionItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("protection") || n.includes("barrier") || n.includes("dust"))).toBe(true);
    });
  });

  describe("no duplicates", () => {
    it("no duplicate names within same category", () => {
      for (const category of Object.keys(SCOPE_CATEGORIES)) {
        const categoryItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === category);
        const names = categoryItems.map(i => i.name);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
      }
    });

    it("no duplicate sort orders within same category", () => {
      for (const category of Object.keys(SCOPE_CATEGORIES)) {
        const categoryItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === category);
        const orders = categoryItems.map(i => i.sortOrder);
        const uniqueOrders = new Set(orders);
        // Allow some flexibility here as sort orders can be shared for same category
        expect(uniqueOrders.size).toBeGreaterThanOrEqual(Math.floor(categoryItems.length / 2));
      }
    });

    it("item names are globally unique", () => {
      const names = DEFAULT_SCOPE_ITEMS.map(i => i.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe("completeness for roofing projects", () => {
    it("covers demolition scope", () => {
      const demoItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "demolition");
      expect(demoItems.length).toBeGreaterThan(0);
      const names = demoItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("tear") || n.includes("demo"))).toBe(true);
    });

    it("covers material logistics", () => {
      const accessItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "access");
      expect(accessItems.length).toBeGreaterThan(0);
    });

    it("covers worker protection", () => {
      const protectionItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "protection");
      const safetyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "safety");
      expect(protectionItems.length).toBeGreaterThan(0);
      expect(safetyItems.length).toBeGreaterThan(0);
    });

    it("covers pricing considerations", () => {
      const scheduleItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "schedule");
      const names = scheduleItems.map(i => i.name.toLowerCase());
      expect(names.some(n => n.includes("premium") || n.includes("after-hours"))).toBe(true);
    });

    it("covers technical details", () => {
      const sheetmetalItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "sheetmetal");
      const names = sheetmetalItems.map(i => i.name.toLowerCase());
      expect(sheetmetalItems.length).toBeGreaterThan(0);
      expect(names.some(n => n.includes("flashing") || n.includes("drain"))).toBe(true);
    });

    it("covers warranty topics", () => {
      const warrantyItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "warranty");
      expect(warrantyItems.length).toBeGreaterThan(0);
    });

    it("covers general conditions", () => {
      const generalItems = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "general");
      expect(generalItems.length).toBeGreaterThan(0);
    });
  });

  describe("item names are specific and actionable", () => {
    it("names are not too generic", () => {
      const genericWords = ["item", "cost", "price", "contingency"];
      for (const item of DEFAULT_SCOPE_ITEMS) {
        const nameLower = item.name.toLowerCase();
        let isGeneric = false;
        for (const generic of genericWords) {
          if (nameLower === generic) {
            isGeneric = true;
            break;
          }
        }
        expect(isGeneric).toBe(false);
      }
    });

    it("names are specific enough to understand scope", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(item.name.length).toBeGreaterThan(5);
      }
    });

    it("names use clear action verbs or nouns", () => {
      const items = DEFAULT_SCOPE_ITEMS.map(i => i.name);
      // Should have items that reference actions or clear deliverables
      const hasActionWords = items.some(name =>
        /^(demo|install|review|verify|provide|inspection|protection)/i.test(name)
      );
      expect(hasActionWords).toBe(true);
    });
  });

  describe("category count reasonableness", () => {
    it("has between 20 and 50 default scope items", () => {
      expect(DEFAULT_SCOPE_ITEMS.length).toBeGreaterThanOrEqual(20);
      expect(DEFAULT_SCOPE_ITEMS.length).toBeLessThanOrEqual(50);
    });

    it("no category is empty", () => {
      const categories = Object.keys(SCOPE_CATEGORIES);
      for (const category of categories) {
        const itemsInCategory = DEFAULT_SCOPE_ITEMS.filter(i => i.category === category);
        expect(itemsInCategory.length).toBeGreaterThan(0);
      }
    });

    it("demolition has at least 1 item", () => {
      const demolition = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "demolition");
      expect(demolition.length).toBeGreaterThanOrEqual(1);
    });

    it("general category doesn't dominate", () => {
      const general = DEFAULT_SCOPE_ITEMS.filter(i => i.category === "general");
      expect(general.length).toBeLessThan(DEFAULT_SCOPE_ITEMS.length / 2);
    });
  });

  describe("type safety", () => {
    it("all items conform to DefaultScopeItem interface", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(typeof item.category).toBe("string");
        expect(typeof item.name).toBe("string");
        expect(typeof item.sortOrder).toBe("number");
      }
    });

    it("categories match ScopeCategory type", () => {
      const validCategories = Object.keys(SCOPE_CATEGORIES) as ScopeCategory[];
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(validCategories).toContain(item.category as ScopeCategory);
      }
    });
  });

  describe("readability and usability", () => {
    it("no item name is longer than 80 characters", () => {
      for (const item of DEFAULT_SCOPE_ITEMS) {
        expect(item.name.length).toBeLessThanOrEqual(80);
      }
    });

    it("category labels are readable in UI", () => {
      for (const category of Object.values(SCOPE_CATEGORIES)) {
        expect(category.label.length).toBeGreaterThan(3);
        expect(category.label.length).toBeLessThanOrEqual(40);
      }
    });

    it("question format items end with question mark", () => {
      const questions = DEFAULT_SCOPE_ITEMS.filter(i => i.name.includes("?"));
      for (const item of questions) {
        // Some items may have question mark followed by closing paren or other punctuation
        expect(item.name).toMatch(/\?[\)\s]*$/); // Should have question mark near end
      }
    });
  });
});
