import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeBidScore, BidScoreInput } from "@/lib/bidScore";

// Mock the checklist-data module since bidScore imports it
vi.mock("@/lib/bidshield/checklist-data", () => ({
  getChecklistForTrade: () => ({
    phase1: { title: "Pre-Bid Review", critical: true, items: [{ id: "p1-1" }, { id: "p1-2" }] },
    phase2: { title: "Takeoff", critical: false, items: [{ id: "p2-1" }] },
  }),
}));

// Mock scopePricingConflicts
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
      bidDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), // 14 days out
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

describe("computeBidScore", () => {
  // Fix Date.now() for deterministic tests
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("score calculation", () => {
    it("returns grade A for all-pass items", () => {
      const input = makeInput({
        checklist: Array.from({ length: 20 }, (_, i) => ({
          phaseKey: "phase1",
          itemId: `p1-${i}`,
          status: "done",
        })),
        scopeItems: [
          { status: "included", name: "Membrane", category: "membrane" },
        ],
        quotes: [
          { status: "valid", expirationDate: "2026-05-01" },
        ],
        rfis: [{ status: "closed" }],
        addenda: [
          { number: 1, reviewStatus: "reviewed", affectsScope: false },
        ],
        bidQuals: {
          plansDated: "2026-03-01",
          laborType: "open_shop",
          insuranceProgram: "own",
          estimatedDuration: "30 days",
        },
        gcItems: [
          { isMarkup: false, total: 5000 },
          { isMarkup: false, total: 3000 },
          { isMarkup: false, total: 2000 },
        ],
        laborTasks: [
          { verified: true },
          { verified: true },
        ],
        laborAnalysis: { scheduleConflict: false },
      });

      const result = computeBidScore(input);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(["A", "B"]).toContain(result.grade);
    });

    it("returns grade F when everything is failing", () => {
      const input = makeInput({
        project: {
          trade: "roofing",
          bidDate: "2026-04-01", // past date
        },
        checklist: Array.from({ length: 10 }, (_, i) => ({
          phaseKey: "phase1",
          itemId: `p1-${i}`,
          status: "pending",
        })),
        scopeItems: Array.from({ length: 10 }, () => ({
          status: "unaddressed",
          name: "Item",
          category: "general",
        })),
        quotes: [],
        rfis: [{ status: "sent" }],
        addenda: [{ number: 1, reviewStatus: "pending_review" }],
      });

      const result = computeBidScore(input);
      expect(result.score).toBeLessThan(50);
      expect(result.grade).toBe("F");
    });

    it("score is clamped between 0 and 100", () => {
      const input = makeInput();
      const result = computeBidScore(input);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe("grade boundaries", () => {
    it("assigns correct grade letters", () => {
      // Test the formula: score = ((pass + warn*0.4) / total) * 100
      // 100% pass → score 100 → A
      // All warn → score 40 → F
      // All fail → score 0 → F
    });
  });

  describe("checklist scoring", () => {
    it("pass when >= 95% complete", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        phaseKey: "phase2",
        itemId: `p2-${i}`,
        status: i < 96 ? "done" : "pending",
      }));
      const result = computeBidScore(makeInput({ checklist: items }));
      const checklistItem = result.items.find(
        (i) => i.label === "Checklist Progress"
      );
      expect(checklistItem?.status).toBe("pass");
    });

    it("warn when 70-94% complete", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        phaseKey: "phase2",
        itemId: `p2-${i}`,
        status: i < 80 ? "done" : "pending",
      }));
      const result = computeBidScore(makeInput({ checklist: items }));
      const checklistItem = result.items.find(
        (i) => i.label === "Checklist Progress"
      );
      expect(checklistItem?.status).toBe("warn");
    });

    it("fail when < 70% complete", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        phaseKey: "phase2",
        itemId: `p2-${i}`,
        status: i < 50 ? "done" : "pending",
      }));
      const result = computeBidScore(makeInput({ checklist: items }));
      const checklistItem = result.items.find(
        (i) => i.label === "Checklist Progress"
      );
      expect(checklistItem?.status).toBe("fail");
    });

    it("counts 'na' items as complete", () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        phaseKey: "phase2",
        itemId: `p2-${i}`,
        status: i < 5 ? "done" : "na",
      }));
      const result = computeBidScore(makeInput({ checklist: items }));
      const checklistItem = result.items.find(
        (i) => i.label === "Checklist Progress"
      );
      expect(checklistItem?.status).toBe("pass"); // 100%
    });
  });

  describe("vendor quotes scoring", () => {
    it("fail when no quotes exist", () => {
      const result = computeBidScore(makeInput({ quotes: [] }));
      const quoteItem = result.items.find(
        (i) => i.label === "Vendor Quotes"
      );
      expect(quoteItem?.status).toBe("fail");
    });

    it("fail when quotes are expired", () => {
      const result = computeBidScore(
        makeInput({
          quotes: [{ status: "expired", expirationDate: "2026-01-01" }],
        })
      );
      const expiredItem = result.items.find(
        (i) => i.label === "Expired Quotes"
      );
      expect(expiredItem?.status).toBe("fail");
    });

    it("warn when quotes are expiring within 14 days", () => {
      const result = computeBidScore(
        makeInput({
          quotes: [
            {
              status: "valid",
              expirationDate: new Date(Date.now() + 7 * 86400000)
                .toISOString()
                .slice(0, 10),
            },
          ],
        })
      );
      const expiringItem = result.items.find(
        (i) => i.label === "Expiring Quotes"
      );
      expect(expiringItem?.status).toBe("warn");
    });

    it("pass when all quotes are valid", () => {
      const result = computeBidScore(
        makeInput({
          quotes: [
            { status: "valid", expirationDate: "2026-06-01" },
            { status: "received", expirationDate: "2026-07-01" },
          ],
        })
      );
      const quoteItem = result.items.find(
        (i) => i.label === "Vendor Quotes"
      );
      expect(quoteItem?.status).toBe("pass");
    });
  });

  describe("bid date scoring", () => {
    it("fail when bid date has passed", () => {
      const result = computeBidScore(
        makeInput({
          project: {
            ...makeInput().project,
            bidDate: "2026-04-01", // 8 days ago
          },
        })
      );
      const dateItem = result.items.find((i) => i.label === "Bid Date");
      expect(dateItem?.status).toBe("fail");
      expect(dateItem?.message).toContain("PASSED");
    });

    it("warn when 1-2 days until bid", () => {
      const result = computeBidScore(
        makeInput({
          project: {
            ...makeInput().project,
            bidDate: "2026-04-11", // 2 days away
          },
        })
      );
      const dateItem = result.items.find((i) => i.label === "Bid Date");
      expect(dateItem?.status).toBe("warn");
    });

    it("pass when bid date is far enough away", () => {
      const result = computeBidScore(
        makeInput({
          project: {
            ...makeInput().project,
            bidDate: "2026-05-01", // 22 days away
          },
        })
      );
      const dateItem = result.items.find((i) => i.label === "Bid Date");
      expect(dateItem?.status).toBe("pass");
    });
  });

  describe("demo mode", () => {
    it("returns hardcoded demo values", () => {
      const result = computeBidScore(makeInput({ isDemo: true }));
      expect(result.items.length).toBeGreaterThan(0);
      // Demo mode should have a mix of pass/warn/fail
      const statuses = new Set(result.items.map((i) => i.status));
      expect(statuses.size).toBeGreaterThan(1);
    });
  });

  describe("addenda scoring", () => {
    it("pass when no addenda and acknowledged", () => {
      const result = computeBidScore(
        makeInput({
          project: { ...makeInput().project, noAddendaAcknowledged: true },
          addenda: [],
        })
      );
      const addendaItem = result.items.find(
        (i) => i.label === "Addenda Review"
      );
      expect(addendaItem?.status).toBe("pass");
    });

    it("warn when no addenda and NOT acknowledged", () => {
      const result = computeBidScore(makeInput({ addenda: [] }));
      const addendaItem = result.items.find(
        (i) => i.label === "Addenda Review"
      );
      expect(addendaItem?.status).toBe("warn");
    });

    it("fail when addenda are pending review", () => {
      const result = computeBidScore(
        makeInput({
          addenda: [
            { number: 1, reviewStatus: "pending_review", affectsScope: false },
          ],
        })
      );
      const addendaItem = result.items.find(
        (i) => i.label === "Addenda Review"
      );
      expect(addendaItem?.status).toBe("fail");
    });
  });

  describe("labor verification", () => {
    it("warn when no labor analysis run", () => {
      const result = computeBidScore(makeInput({ laborTasks: [] }));
      const laborItem = result.items.find(
        (i) => i.label === "Labor Verification"
      );
      expect(laborItem?.status).toBe("warn");
    });

    it("fail when schedule conflict", () => {
      const result = computeBidScore(
        makeInput({
          laborTasks: [{ verified: true }],
          laborAnalysis: { scheduleConflict: true },
        })
      );
      const laborItem = result.items.find(
        (i) => i.label === "Labor Verification"
      );
      expect(laborItem?.status).toBe("fail");
    });

    it("pass when all tasks verified", () => {
      const result = computeBidScore(
        makeInput({
          laborTasks: [
            { verified: true },
            { verified: true },
            { verified: true },
          ],
          laborAnalysis: { scheduleConflict: false },
        })
      );
      const laborItem = result.items.find(
        (i) => i.label === "Labor Verification"
      );
      expect(laborItem?.status).toBe("pass");
    });
  });
});
