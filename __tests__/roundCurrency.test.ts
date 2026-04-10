import { describe, it, expect } from "vitest";

// Inline the function since it's not exported from convex/bidshield.ts
function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

describe("roundCurrency", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundCurrency(10.456)).toBe(10.46);
    expect(roundCurrency(10.454)).toBe(10.45);
    expect(roundCurrency(10.455)).toBe(10.46); // banker's rounding edge
  });

  it("handles classic floating-point issues", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    // Typical bid calculation: quantity * rate
    expect(roundCurrency(150 * 3.75)).toBe(562.5);
    expect(roundCurrency(1234.5 * 0.035)).toBe(43.21);
  });

  it("handles zero and whole numbers", () => {
    expect(roundCurrency(0)).toBe(0);
    expect(roundCurrency(100)).toBe(100);
    expect(roundCurrency(99999.99)).toBe(99999.99);
  });

  it("handles negative values", () => {
    expect(roundCurrency(-10.456)).toBe(-10.46);
    // -0.005 rounds to -0 in IEEE 754 (Math.round(-0.5) === -0)
    expect(roundCurrency(-0.005)).toBe(-0);
    expect(roundCurrency(-0.015)).toBe(-0.01);
  });

  it("handles very small amounts", () => {
    expect(roundCurrency(0.001)).toBe(0);
    expect(roundCurrency(0.004)).toBe(0);
    expect(roundCurrency(0.005)).toBe(0.01);
  });

  it("handles large bid amounts without precision loss", () => {
    // Typical commercial roofing bid
    expect(roundCurrency(1_500_000 * 1.035)).toBe(1552500);
    expect(roundCurrency(247_891.33 / 15_000)).toBe(16.53);
  });
});
