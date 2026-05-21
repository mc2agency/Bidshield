import { describe, it, expect } from "vitest";
import { isDemoUser, DEMO_USER_ID } from "@/lib/isDemoUser";

describe("isDemoUser", () => {
  it("returns true only for the fixed demo user ID", () => {
    expect(isDemoUser(DEMO_USER_ID)).toBe(true);
  });

  it("rejects arbitrary demo_ prefixed strings", () => {
    expect(isDemoUser("demo_attack")).toBe(false);
    expect(isDemoUser("demo_anything")).toBe(false);
    expect(isDemoUser("demo_")).toBe(false);
    expect(isDemoUser("demo_preview_only_extra")).toBe(false);
  });

  it("rejects real Clerk user IDs", () => {
    expect(isDemoUser("user_2abc123def456")).toBe(false);
    expect(isDemoUser("")).toBe(false);
  });

  it("rejects partial matches", () => {
    expect(isDemoUser("demo_preview_onl")).toBe(false);
    expect(isDemoUser(" demo_preview_only")).toBe(false);
    expect(isDemoUser("demo_preview_only ")).toBe(false);
  });
});
