import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../convex/_generated/server", () => ({}));
vi.mock("../convex/_generated/dataModel", () => ({}));

vi.mock("../convex/utils", () => ({
  isDemoUser: vi.fn(),
  DEMO_USER_ID: "demo_preview_only",
}));

import { validateAuth } from "../convex/bidshield/_helpers";
import { isDemoUser } from "../convex/utils";

function makeCtx(subject: string | null, convexId = "cvx_user_abc") {
  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(
        subject ? { subject, tokenIdentifier: subject } : null
      ),
    },
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(convexId ? { _id: convexId } : null),
        }),
      }),
    },
  };
}

describe("validateAuth", () => {
  beforeEach(() => {
    vi.mocked(isDemoUser).mockReturnValue(false);
  });

  it("resolves convex user ID when identity.subject matches userId", async () => {
    const ctx = makeCtx("user_123");
    const result = await validateAuth(ctx as any, "user_123");
    expect(result).toBe("cvx_user_abc");
  });

  it("throws when identity.subject does not match client-supplied userId", async () => {
    const ctx = makeCtx("user_123");
    await expect(validateAuth(ctx as any, "user_456")).rejects.toThrow(
      "Unauthorized: userId does not match authenticated identity"
    );
  });

  it("throws when there is no authenticated identity", async () => {
    const ctx = makeCtx(null);
    await expect(validateAuth(ctx as any, "user_123")).rejects.toThrow("Not authenticated");
  });

  it("returns undefined for demo user without touching auth", async () => {
    vi.mocked(isDemoUser).mockReturnValue(true);
    const ctx = makeCtx(null);
    const result = await validateAuth(ctx as any, "demo_preview_only");
    expect(result).toBeUndefined();
    expect(ctx.auth.getUserIdentity).not.toHaveBeenCalled();
  });
});
