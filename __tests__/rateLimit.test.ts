import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, rateLimitHeaders, RateLimitResult } from "@/lib/rateLimit";

// Mock process.env
const originalEnv = process.env;

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
    // Clear environment variables to force local LRU fallback
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe("checkRateLimit - local LRU mode", () => {
    it("allows first request for a new user", async () => {
      const result = await checkRateLimit("user_123");
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });

    it("allows requests up to the limit", async () => {
      const userId = "user_rate_limit";
      for (let i = 0; i < 10; i++) {
        const result = await checkRateLimit(userId);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it("denies request when limit is exceeded", async () => {
      const userId = "user_over_limit";
      // Fill up the quota
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(userId);
      }
      // 11th request should fail
      const result = await checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("resets after window expires", async () => {
      const userId = "user_window_reset";
      // Use up quota
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(userId);
      }
      expect((await checkRateLimit(userId)).allowed).toBe(false);

      // Advance time past the 60-second window
      vi.advanceTimersByTime(61 * 1000);

      // Should be allowed again
      const result = await checkRateLimit(userId);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("tracks separate quotas for different users", async () => {
      const user1 = await checkRateLimit("user_alice");
      const user2 = await checkRateLimit("user_bob");
      expect(user1.remaining).toBe(9);
      expect(user2.remaining).toBe(9);
    });

    it("shares quota across different actions in local mode", async () => {
      // In local LRU mode, the implementation tracks by userId only,
      // so different actions share the same quota.
      // In distributed mode (Upstash/Convex), they would be separate.
      const userId = "user_multi_action";
      const result1 = await checkRateLimit(userId, "ai_endpoint");
      const result2 = await checkRateLimit(userId, "extract_pdf");
      expect(result1.remaining).toBe(9);
      expect(result2.remaining).toBe(8); // Shares quota in local mode
    });

    it("respects custom limit parameter", async () => {
      const userId = "user_custom_limit";
      const result1 = await checkRateLimit(userId, "custom_action", 5);
      expect(result1.limit).toBe(5);
      expect(result1.remaining).toBe(4);

      // Fill custom limit
      for (let i = 1; i < 5; i++) {
        await checkRateLimit(userId, "custom_action", 5);
      }
      // 6th request should fail
      const result6 = await checkRateLimit(userId, "custom_action", 5);
      expect(result6.allowed).toBe(false);
    });

    it("handles edge case of zero remaining after exactly limit requests", async () => {
      const userId = "user_exact_limit";
      let lastResult: RateLimitResult = { allowed: true, limit: 10, remaining: 10 };
      for (let i = 0; i < 10; i++) {
        lastResult = await checkRateLimit(userId);
      }
      expect(lastResult.remaining).toBe(0);
      expect(lastResult.allowed).toBe(true);

      const denied = await checkRateLimit(userId);
      expect(denied.allowed).toBe(false);
    });

    it("preserves remaining count accuracy", async () => {
      const userId = "user_accuracy";
      const results: RateLimitResult[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(await checkRateLimit(userId));
      }
      // Check that remaining decremented correctly
      expect(results[0].remaining).toBe(9);
      expect(results[4].remaining).toBe(5);
      expect(results[9].remaining).toBe(0);
    });

    it("handles partial window resets correctly", async () => {
      const userId = "user_partial_reset";
      // Make 3 requests at t=0
      await checkRateLimit(userId);
      await checkRateLimit(userId);
      const result3 = await checkRateLimit(userId);
      expect(result3.remaining).toBe(7);

      // Advance time by 30s (still within 60s window for initial requests)
      vi.advanceTimersByTime(30 * 1000);

      // All 3 initial requests still in window, add 1 more
      const result4 = await checkRateLimit(userId);
      expect(result4.remaining).toBe(6);

      // Advance past initial requests' window (past 60s from start)
      vi.advanceTimersByTime(31 * 1000); // Now at 61s

      // Initial 3 requests expired, only the one at 30s remains, plus this new one
      const result5 = await checkRateLimit(userId);
      expect(result5.remaining).toBe(8); // 10 - 2 (30s request + new request)
    });
  });

  describe("rateLimitHeaders", () => {
    it("returns correct headers for allowed request", () => {
      const result: RateLimitResult = { allowed: true, limit: 10, remaining: 7 };
      const headers = rateLimitHeaders(result);
      expect(headers["RateLimit-Limit"]).toBe("10");
      expect(headers["RateLimit-Remaining"]).toBe("7");
      expect(headers["Retry-After"]).toBe("60");
    });

    it("returns correct headers for denied request", () => {
      const result: RateLimitResult = { allowed: false, limit: 10, remaining: 0 };
      const headers = rateLimitHeaders(result);
      expect(headers["RateLimit-Limit"]).toBe("10");
      expect(headers["RateLimit-Remaining"]).toBe("0");
      expect(headers["Retry-After"]).toBe("60");
    });

    it("returns standard Retry-After for any state", () => {
      const results: RateLimitResult[] = [
        { allowed: true, limit: 10, remaining: 9 },
        { allowed: true, limit: 10, remaining: 0 },
        { allowed: false, limit: 10, remaining: 0 },
      ];
      for (const result of results) {
        const headers = rateLimitHeaders(result);
        expect(headers["Retry-After"]).toBe("60");
      }
    });

    it("header values are strings", () => {
      const result: RateLimitResult = { allowed: true, limit: 10, remaining: 5 };
      const headers = rateLimitHeaders(result);
      expect(typeof headers["RateLimit-Limit"]).toBe("string");
      expect(typeof headers["RateLimit-Remaining"]).toBe("string");
      expect(typeof headers["Retry-After"]).toBe("string");
    });
  });

  describe("RateLimitResult interface", () => {
    it("has required fields", async () => {
      const result = await checkRateLimit("user_interface");
      expect(result).toHaveProperty("allowed");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("remaining");
    });

    it("remaining is never negative", async () => {
      const userId = "user_negative";
      for (let i = 0; i < 15; i++) {
        const result = await checkRateLimit(userId);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
      }
    });

    it("remaining never exceeds limit", async () => {
      const result = await checkRateLimit("user_bound");
      expect(result.remaining).toBeLessThanOrEqual(result.limit);
    });
  });

  describe("action type separation", () => {
    it("shares quota across action types in local mode", async () => {
      // In local LRU mode, different actions share the same quota per userId
      const userId = "user_actions";
      for (let i = 0; i < 10; i++) {
        await checkRateLimit(userId, "pdf_extract");
      }
      // ai_endpoint uses same quota since in local mode
      const result = await checkRateLimit(userId, "ai_endpoint");
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("respects custom action types in local mode", async () => {
      // In local LRU mode, actions share the same quota but the function
      // still accepts the action parameter (used in distributed mode)
      const userId = "user_custom_actions";
      const actions = ["analyze_labor", "extract_price_sheet", "draft_rfi"];
      let expectedRemaining = 9;
      for (const action of actions) {
        const result = await checkRateLimit(userId, action);
        expect(result.remaining).toBe(expectedRemaining);
        expectedRemaining--;
      }
    });
  });
});
