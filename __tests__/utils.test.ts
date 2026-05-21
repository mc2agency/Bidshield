import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isDemoUser, DEMO_USER_ID } from "@/lib/isDemoUser";
import { formatDate, daysUntil } from "@/lib/bidshield/utils";

describe("isDemoUser", () => {
  it("returns true only for the exact fixed demo ID", () => {
    expect(isDemoUser(DEMO_USER_ID)).toBe(true);
  });

  it("returns false for arbitrary demo_ prefixed IDs (no longer allowed by prefix match)", () => {
    expect(isDemoUser("demo_123")).toBe(false);
    expect(isDemoUser("demo_")).toBe(false);
    expect(isDemoUser("demo_user_abc")).toBe(false);
  });

  it("returns false for real user IDs", () => {
    expect(isDemoUser("user_2abc")).toBe(false);
    expect(isDemoUser("clerk_123")).toBe(false);
    expect(isDemoUser("")).toBe(false);
    expect(isDemoUser("DEMO_123")).toBe(false);
  });

  it("returns false for IDs that contain but do not equal the demo ID", () => {
    expect(isDemoUser(`${DEMO_USER_ID}_extra`)).toBe(false);
    expect(isDemoUser(`x${DEMO_USER_ID}`)).toBe(false);
  });
});

describe("formatDate", () => {
  it("formats a date string to 'MMM D, YYYY'", () => {
    // Use explicit UTC date to avoid timezone shifts
    const result = formatDate("2026-04-09T12:00:00Z");
    expect(result).toMatch(/Apr\s+9,\s+2026/);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-01-15T00:00:00Z"));
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
  });

  it("handles edge dates", () => {
    const result = formatDate("2026-12-31");
    expect(result).toContain("Dec");
    expect(result).toContain("2026");
  });
});

describe("daysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns positive days for future date", () => {
    expect(daysUntil("2026-04-16")).toBe(7);
  });

  it("returns negative days for past date", () => {
    expect(daysUntil("2026-04-02")).toBeLessThan(0);
  });

  it("returns 1 for tomorrow", () => {
    expect(daysUntil("2026-04-10")).toBe(1);
  });

  it("handles far future dates", () => {
    expect(daysUntil("2027-04-09")).toBeGreaterThan(360);
  });
});
