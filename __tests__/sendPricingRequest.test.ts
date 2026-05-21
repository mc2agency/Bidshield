import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: "msg_ok" }, error: null }),
    };
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, limit: 20, remaining: 19 }),
  rateLimitHeaders: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/requireProSubscription", () => ({
  requireProSubscription: vi.fn().mockResolvedValue(null),
}));

import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { POST } from "@/app/api/bidshield/send-pricing-request/route";

const BASE_BODY = {
  vendorEmails: ["vendor@example.com"],
  manufacturer: "Siplast",
  items: [{ name: "TPO Membrane", qty: 10, unit: "SQ" }],
  projectName: "Test Project",
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/bidshield/send-pricing-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/bidshield/send-pricing-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
    vi.mocked(requireProSubscription).mockResolvedValue(null);
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, limit: 20, remaining: 19 });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const res = await POST(makeRequest(BASE_BODY));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, limit: 20, remaining: 0 });
    const res = await POST(makeRequest(BASE_BODY));
    expect(res.status).toBe(429);
  });

  it("returns 400 when vendorEmails is empty", async () => {
    const res = await POST(makeRequest({ ...BASE_BODY, vendorEmails: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when recipient cap (10) is exceeded", async () => {
    const manyEmails = Array.from({ length: 11 }, (_, i) => `v${i}@example.com`);
    const res = await POST(makeRequest({ ...BASE_BODY, vendorEmails: manyEmails }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid email address", async () => {
    const res = await POST(makeRequest({ ...BASE_BODY, vendorEmails: ["not-an-email"] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when projectName is missing", async () => {
    const { projectName: _, ...noName } = BASE_BODY;
    const res = await POST(makeRequest(noName));
    expect(res.status).toBe(400);
  });

  it("sends emails and returns counts on success", async () => {
    const res = await POST(makeRequest(BASE_BODY));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ sent: 1, failed: 0, total: 1 });
  });

  it("calls requireProSubscription with the authenticated userId", async () => {
    await POST(makeRequest(BASE_BODY));
    expect(requireProSubscription).toHaveBeenCalledWith("user_123");
  });

  it("calls checkRateLimit with the authenticated userId", async () => {
    await POST(makeRequest(BASE_BODY));
    expect(checkRateLimit).toHaveBeenCalledWith("user_123", "send_pricing_request", 20);
  });
});
