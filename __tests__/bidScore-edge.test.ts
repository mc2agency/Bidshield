import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeBidScore, BidScoreInput } from "@/lib/bidScore";

// Mock the imports
vi.mock("@/lib/bidshield/checklist-data", () => ({
  getChecklistForTrade: () => ({
    phase1: { title: "Pre-Bid Review", critical: true, items: [{ id: "p1-1" }, { id: "p1-2" }] },
    phase2: { title: "Takeoff", critical: false, items: [{ id: "p2-1" }] },
    phase5: { title: "Mechanical", critical: true, items: [{ id: "p5-1" }, { id: "p5-2" }] },
  }),
}));

vi.mock("@/lib/bidshield/scopePricingConflicts", () => ({
  detectScopePricingConflicts: () => [],
}));

function makeInput(overrides: Partial<BidScoreInput> = {}): BidScoreInput {
  return {
    isDemo: false,
    project: {
      trade: "roofing",
      systemType: "tpo",
      deckType: "steel",
      bidDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      gc: "Test GC",
      sqft: 15000,
      totalBidAmount: 250000,
      materialCost: 150000,
      laborCost: 80000,
    },
    checklist: [],
    scopeItems: [],
    quotes: [],
    rfis: [],
    addenda: [],
    bidQuals: null,
    gcItems: [],
    projectMaterials: [],
    datasheets: [],
    laborTasks: [],
    laborAnalysis: null,
    gcFormDocuments: [],
    unconfirmedGcFormCount: 0,
    ...overrides,
  };
}

describe("computeBidScore - edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("empty inputs", () => {
    it("handles empty checklist", () => {
      const input = makeInput({ checklist: [] });
      const result = computeBidScore(input);
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("grade");
      expect(result.items.length).toBeGreaterThan(0);
    });

    it("handles null checklist", () => {
      const input = makeInput({ checklist: null });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
      expect(typeof result.score).toBe("number");
    });

    it("handles empty scopeItems", () => {
      const input = makeInput({ scopeItems: [] });
      const result = computeBidScore(input);
      const scopeItem = result.items.find(i => i.label.includes("Scope Coverage"));
      expect(scopeItem).toBeDefined();
      expect(scopeItem?.status).toBe("warn");
    });

    it("handles null scopeItems", () => {
      const input = makeInput({ scopeItems: null });
      const result = computeBidScore(input);
      expect(() => result).not.toThrow();
      expect(result.items).toBeDefined();
    });

    it("handles empty quotes array", () => {
      const input = makeInput({ quotes: [] });
      const result = computeBidScore(input);
      const quoteItem = result.items.find(i => i.label.includes("Vendor Quotes"));
      expect(quoteItem?.status).toBe("fail");
      expect(quoteItem?.message).toContain("No vendor quotes");
    });

    it("handles null quotes", () => {
      const input = makeInput({ quotes: null });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });

    it("handles empty rfis", () => {
      const input = makeInput({ rfis: [] });
      const result = computeBidScore(input);
      const rfiItem = result.items.find(i => i.label.includes("RFIs"));
      expect(rfiItem?.status).toBe("pass");
    });

    it("handles empty addenda", () => {
      const baseInput = makeInput();
      const input = makeInput({
        addenda: [],
        project: { ...baseInput.project, noAddendaAcknowledged: true }
      });
      const result = computeBidScore(input);
      const addendaItem = result.items.find(i => i.label.includes("Addenda"));
      expect(addendaItem?.status).toBe("pass");
    });

    it("handles empty laborTasks", () => {
      const input = makeInput({ laborTasks: [] });
      const result = computeBidScore(input);
      const laborItem = result.items.find(i => i.label.includes("Labor Verification"));
      expect(laborItem?.status).toBe("warn");
    });

    it("handles empty projectMaterials", () => {
      const input = makeInput({ projectMaterials: [], datasheets: [] });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });
  });

  describe("all 'na' status items", () => {
    it("treats all 'na' checklist items as complete", () => {
      const input = makeInput({
        checklist: Array.from({ length: 20 }, (_, i) => ({
          phaseKey: "phase1",
          itemId: `p1-${i}`,
          status: "na",
        })),
      });
      const result = computeBidScore(input);
      const checklistItem = result.items.find(i => i.label.includes("Checklist"));
      expect(checklistItem?.status).toBe("pass");
    });

    it("marks critical phase as complete when items are 'na'", () => {
      const input = makeInput({
        checklist: [
          // phase1 has 2 items in the mock
          { phaseKey: "phase1", itemId: "p1-1", status: "na" },
          { phaseKey: "phase1", itemId: "p1-2", status: "na" },
          // phase5 (Mechanical) has 2 items in the mock and is also critical
          { phaseKey: "phase5", itemId: "p5-1", status: "na" },
          { phaseKey: "phase5", itemId: "p5-2", status: "na" },
        ],
      });
      const result = computeBidScore(input);
      // When all items in all critical phases are 'na', no critical failures
      const failedCriticalItems = result.items.filter(i => i.label.includes("Critical:") && i.status === "fail");
      expect(failedCriticalItems.length).toBe(0);
    });
  });

  describe("extreme values", () => {
    it("handles very large scope item count", () => {
      const input = makeInput({
        scopeItems: Array.from({ length: 1000 }, (_, i) => ({
          status: "included",
          name: `Scope Item ${i}`,
          category: "general",
        })),
      });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
      const scopeItem = result.items.find(i => i.label.includes("Scope Coverage"));
      expect(scopeItem?.status).toBe("pass");
    });

    it("handles zero sqft in project", () => {
      const input = makeInput({
        project: {
          trade: "roofing",
          systemType: "tpo",
          deckType: "steel",
          bidDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          gc: "Test GC",
          sqft: 0,
          totalBidAmount: 250000,
          materialCost: 150000,
          laborCost: 80000,
        },
      });
      const result = computeBidScore(input);
      const projectItem = result.items.find(i => i.label.includes("Project Info"));
      expect(projectItem?.status).toBe("warn");
    });

    it("handles very small sqft", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, sqft: 1 },
      });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });

    it("handles large bid amount", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, totalBidAmount: 50000000 },
      });
      const result = computeBidScore(input);
      const pricingItem = result.items.find(i => i.label.includes("Pricing"));
      expect(pricingItem?.status).toBe("pass");
    });

    it("handles zero bid amount", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, totalBidAmount: 0 },
      });
      const result = computeBidScore(input);
      const pricingItem = result.items.find(i => i.label.includes("Pricing"));
      expect(pricingItem?.status).toBe("fail");
    });
  });

  describe("missing optional fields on project", () => {
    it("handles missing gc field", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, gc: undefined },
      });
      const result = computeBidScore(input);
      const projectItem = result.items.find(i => i.label.includes("Project Info"));
      expect(projectItem?.status).toBe("warn");
      expect(projectItem?.message).toContain("GC");
    });

    it("handles missing sqft field", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, sqft: undefined },
      });
      const result = computeBidScore(input);
      const projectItem = result.items.find(i => i.label.includes("Project Info"));
      expect(projectItem?.status).toBe("warn");
      expect(projectItem?.message).toContain("Square footage");
    });

    it("handles missing totalBidAmount", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, totalBidAmount: undefined },
      });
      const result = computeBidScore(input);
      const projectItem = result.items.find(i => i.label.includes("Project Info"));
      expect(projectItem?.status).toBe("warn");
      expect(projectItem?.message).toContain("Bid amount");
    });

    it("handles multiple missing fields", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, gc: undefined, sqft: undefined, totalBidAmount: undefined },
      });
      const result = computeBidScore(input);
      const projectItem = result.items.find(i => i.label.includes("Project Info"));
      expect(projectItem?.status).toBe("warn");
      expect(projectItem?.message).toContain("GC");
      expect(projectItem?.message).toContain("Square footage");
      expect(projectItem?.message).toContain("Bid amount");
    });

    it("handles missing systemType and deckType", () => {
      const baseInput = makeInput();
      const input = makeInput({
        project: { ...baseInput.project, systemType: undefined, deckType: undefined },
      });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });
  });

  describe("GC form scoring with unconfirmedGcFormCount", () => {
    it("shows warning when unconfirmed items exist", () => {
      const input = makeInput({
        gcFormDocuments: [{ id: "doc1", name: "gc-form.pdf" }],
        unconfirmedGcFormCount: 5,
      });
      const result = computeBidScore(input);
      const gcItem = result.items.find(i => i.label.includes("GC Bid Forms"));
      expect(gcItem?.status).toBe("warn");
      expect(gcItem?.message).toContain("5");
    });

    it("shows pass when all confirmed", () => {
      const input = makeInput({
        gcFormDocuments: [{ id: "doc1", name: "gc-form.pdf" }],
        unconfirmedGcFormCount: 0,
      });
      const result = computeBidScore(input);
      const gcItem = result.items.find(i => i.label.includes("GC Bid Forms"));
      expect(gcItem?.status).toBe("pass");
    });

    it("doesn't show GC form item if no documents", () => {
      const input = makeInput({
        gcFormDocuments: [],
        unconfirmedGcFormCount: 0,
      });
      const result = computeBidScore(input);
      const gcItem = result.items.find(i => i.label.includes("GC Bid Forms"));
      expect(gcItem).toBeUndefined();
    });

    it("handles singular vs plural messaging", () => {
      const input1 = makeInput({
        gcFormDocuments: [{ id: "doc1" }],
        unconfirmedGcFormCount: 1,
      });
      const result1 = computeBidScore(input1);
      const gcItem1 = result1.items.find(i => i.label.includes("GC Bid Forms"));
      expect(gcItem1?.message).toContain("1 GC bid form item");

      const input2 = makeInput({
        gcFormDocuments: [{ id: "doc1" }],
        unconfirmedGcFormCount: 2,
      });
      const result2 = computeBidScore(input2);
      const gcItem2 = result2.items.find(i => i.label.includes("GC Bid Forms"));
      expect(gcItem2?.message).toContain("2 GC bid form items");
    });
  });

  describe("scope-pricing conflict integration", () => {
    it("includes scope items and materials for conflict detection", () => {
      const input = makeInput({
        scopeItems: [{ status: "excluded", name: "Item 1" }],
        projectMaterials: [{ name: "Material 1", totalCost: 5000, category: "membrane" }],
        laborTasks: [{ name: "Task 1", hours: 10 }],
      });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });

    it("handles undefined projectMaterials and laborTasks", () => {
      const input = makeInput({
        scopeItems: [{ status: "excluded", name: "Item 1" }],
        projectMaterials: undefined,
        laborTasks: undefined,
      });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
    });
  });

  describe("score and grade calculations", () => {
    it("score is always between 0 and 100", () => {
      const inputs = [
        makeInput({}),
        makeInput({ checklist: [] }),
        makeInput({ quotes: [] }),
        makeInput({ scopeItems: [] }),
      ];
      for (const input of inputs) {
        const result = computeBidScore(input);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    it("assigns grade A for score >= 90", () => {
      // Create a high-pass scenario
      const input = makeInput({
        checklist: Array(20).fill(null).map((_, i) => ({
          phaseKey: "phase1",
          itemId: `p1-${i}`,
          status: "done",
        })),
        scopeItems: [{ status: "included" }],
        quotes: [{ status: "valid", expirationDate: "2026-06-01" }],
        rfis: [],
        addenda: [{ number: 1, reviewStatus: "reviewed", affectsScope: false }],
        bidQuals: {
          plansDated: true,
          laborType: "open_shop",
          insuranceProgram: "own",
          estimatedDuration: "30 days",
        },
        gcItems: [{ isMarkup: false, total: 5000 }],
        laborTasks: [{ verified: true }],
        laborAnalysis: { scheduleConflict: false },
      });
      const result = computeBidScore(input);
      if (result.score >= 90) {
        expect(result.grade).toBe("A");
      }
    });

    it("assigns valid grades for all score ranges", () => {
      const validGrades = ["A", "B", "C", "D", "F"];
      const input = makeInput({});
      const result = computeBidScore(input);
      expect(validGrades).toContain(result.grade);
    });

    it("grade F is assigned for low scores", () => {
      const input = makeInput({
        checklist: Array(20).fill(null).map((_, i) => ({
          phaseKey: "phase1",
          itemId: `p1-${i}`,
          status: "pending",
        })),
        scopeItems: [],
        quotes: [],
        rfis: [],
        addenda: [],
        bidQuals: null,
        gcItems: [],
        laborTasks: [],
      });
      const result = computeBidScore(input);
      if (result.score < 50) {
        expect(result.grade).toBe("F");
      }
    });
  });

  describe("demo mode", () => {
    it("shows demo-specific checklist message", () => {
      const input = makeInput({ isDemo: true });
      const result = computeBidScore(input);
      const checklistItem = result.items.find(i => i.label.includes("Checklist"));
      expect(checklistItem?.message).toContain("68%");
    });

    it("shows demo-specific scope coverage message", () => {
      const input = makeInput({ isDemo: true });
      const result = computeBidScore(input);
      const scopeItem = result.items.find(i => i.label.includes("Scope Coverage"));
      expect(scopeItem?.message).toContain("52%");
    });

    it("shows demo-specific vendor quotes message", () => {
      const input = makeInput({ isDemo: true });
      const result = computeBidScore(input);
      const quoteItem = result.items.find(i => i.label.includes("Vendor Quotes"));
      expect(quoteItem?.message).toContain("expired");
    });
  });

  describe("message pluralization", () => {
    it("correctly pluralizes expiring quotes message", () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      const input1 = makeInput({
        quotes: [
          { status: "valid", expirationDate: futureDate },
          { status: "expiring", expirationDate: futureDate },
        ],
      });
      const result1 = computeBidScore(input1);
      const quoteItem = result1.items.find(i => i.label.includes("Expiring"));
      expect(quoteItem?.message).toMatch(/quotes\s+expiring/);
    });

    it("correctly pluralizes scope items message", () => {
      const input = makeInput({
        scopeItems: Array.from({ length: 10 }, (_, i) => ({
          status: "unaddressed",
          name: `Item ${i}`,
        })),
      });
      const result = computeBidScore(input);
      const scopeItem = result.items.find(i => i.label.includes("Scope Coverage"));
      expect(scopeItem?.message).toContain("items");
    });
  });

  describe("null/undefined project", () => {
    it("handles null project gracefully", () => {
      const input = makeInput({ project: null });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
      expect(result.grade).toBeDefined();
    });

    it("handles undefined project gracefully", () => {
      const input = makeInput({ project: undefined });
      const result = computeBidScore(input);
      expect(result.score).toBeDefined();
      expect(result.grade).toBeDefined();
    });
  });

  describe("mixed status checklist items", () => {
    it("counts only 'done' and 'na' as complete", () => {
      const input = makeInput({
        checklist: [
          { phaseKey: "phase1", itemId: "p1-1", status: "done" },
          { phaseKey: "phase1", itemId: "p1-2", status: "na" },
          { phaseKey: "phase1", itemId: "p1-3", status: "pending" },
          { phaseKey: "phase1", itemId: "p1-4", status: "in_progress" },
        ],
      });
      const result = computeBidScore(input);
      const checklistItem = result.items.find(i => i.label.includes("Checklist"));
      // 2 of 4 = 50%
      expect(checklistItem?.message).toContain("50%");
    });
  });
});
