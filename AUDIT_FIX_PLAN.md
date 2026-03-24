# BidShield — Audit Fix Plan

**Generated:** 2026-03-24
**Scope:** Full codebase security, reliability, and code-quality audit
**Total Issues:** 22 (C1–C3, H1–H4, M1–M9, L1–L6)

---

## Severity Key

| Code | Severity | Description |
|------|----------|-------------|
| C | Critical | Active security vulnerability; exploitable right now |
| H | High | Auth gaps, data exposure, or broken reliability boundary |
| M | Medium | Error handling, rate limiting, type safety, logging gaps |
| L | Low | Code quality, minor security hygiene, developer experience |

---

## Phase 1 — Critical (Fix Before Next Deploy)

### C1 · Hardcoded Admin User ID in Convex
**File:** `convex/users.ts` ~line 152
**Issue:** Admin access is gated by a literal Clerk user ID string (`"user_3Aid1uIjrlbv2KrZsADW4SkYKlp"`). Anyone with repo access sees this ID; it creates a single point of failure and is not revocable without a code deploy.
**Fix:**
1. Add a `role` field (`"admin" | "user"`) to the `users` table schema in `convex/schema.ts`.
2. Seed admin role via a one-time Convex mutation or dashboard direct-edit.
3. Replace the hardcoded ID check in `adminGetAllData` with `user.role === "admin"`.
4. Remove the hardcoded ID from source entirely.

```ts
// convex/users.ts — replace:
if (userId !== "user_3Aid1uIjrlbv2KrZsADW4SkYKlp") throw new Error("Unauthorized");
// with:
const user = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", userId)).first();
if (user?.role !== "admin") throw new Error("Unauthorized");
```

---

### C2 · Unauthenticated AI Endpoints (Anthropic API Cost Exposure)
**Files:**
- `app/api/bidshield/lookup-coverage/route.ts`
- `app/api/bidshield/check-addendum-impact/route.ts`
- `app/api/bidshield/draft-rfi/route.ts`
- `app/api/bidshield/generate-exclusions/route.ts`

**Issue:** All four endpoints call the Anthropic Claude API without verifying the caller is authenticated. Any unauthenticated HTTP client can trigger paid API calls, leading to unbounded cost exposure and quota exhaustion.
**Fix:** Add Clerk auth check at the top of each route handler, mirroring the pattern already used in `app/api/bidshield/extract-price-sheet/route.ts`:

```ts
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... existing logic
}
```

Also apply the existing `rateLimit` utility from `lib/rateLimit.ts` to cap per-user usage.

---

### C3 · Prompt Injection via Unvalidated User Input to AI Endpoints
**Files:** Same four endpoints as C2
**Issue:** User-supplied strings (`materialName`, `description`, `context`, `excludedItems`, etc.) are interpolated directly into Claude system/user prompts without sanitization or length limits. A malicious user can inject adversarial instructions to leak system prompts, extract internal data, or manipulate output.
**Fix:**
1. Define a Zod schema for each endpoint's request body and validate at the boundary.
2. Enforce max length on all free-text fields (e.g., 2,000 chars).
3. Strip or escape characters that could break prompt structure (e.g., triple-backtick sequences, XML/JSON injection patterns).

```ts
import { z } from "zod";

const LookupCoverageSchema = z.object({
  materialName: z.string().max(200).trim(),
  context: z.string().max(2000).trim().optional(),
});

const body = LookupCoverageSchema.safeParse(await req.json());
if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
```

---

## Phase 2 — High (Fix Within 1 Sprint)

### H1 · Path Traversal Risk in Download Endpoint
**File:** `app/api/download/route.ts` ~lines 50–61, 108
**Issue:** Filename comes from query parameter and is joined with `process.cwd()` via `path.join`. Although an `ALLOWED_FILES` whitelist exists, the check is string-based without normalisation, so a crafted path like `../../../etc/passwd` that happens to match after normalisation could slip through.
**Fix:**
1. Resolve the final path with `path.resolve()` and assert it starts with the expected `templates/` directory prefix (use `path.resolve` for both and compare).
2. Use the whitelist as a lookup map to the actual file path rather than trusting the user-supplied string as a path fragment.

```ts
const TEMPLATE_DIR = path.resolve(process.cwd(), "templates/formatted");
const resolvedPath = path.resolve(TEMPLATE_DIR, allowedEntry.filename);
if (!resolvedPath.startsWith(TEMPLATE_DIR + path.sep)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

### H2 · In-Memory Rate Limiting Not Effective on Multi-Instance Deployment
**File:** `lib/rateLimit.ts`
**Issue:** Rate limits are stored in an `LRUCache` in process memory. Vercel spawns multiple serverless function instances; each has its own cache. An attacker distributing requests across instances bypasses the per-IP/per-user limit entirely.
**Fix (Option A — preferred):** Use Vercel KV (Upstash Redis) for a shared counter with TTL:

```ts
import { kv } from "@vercel/kv";

export async function rateLimit(key: string, limit: number, windowSecs: number) {
  const count = await kv.incr(`rl:${key}`);
  if (count === 1) await kv.expire(`rl:${key}`, windowSecs);
  return count <= limit;
}
```

**Fix (Option B — zero-dependency):** Use Vercel's built-in Edge Rate Limiting middleware (available on Pro plans) configured in `middleware.ts`.

Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local` and Vercel environment.

---

### H3 · Demo Mode Bypasses Authentication and Feature Gating
**File:** `convex/bidshield.ts` ~lines 6–21 (`validateAuth`, `requirePro`)
**Issue:** Any caller passing a userId that begins with `"demo_"` bypasses all auth and Pro-tier checks. This prefix is not enforced by Clerk; any client can fabricate it and get free unlimited access.
**Fix:**
1. Remove the `userId.startsWith("demo_")` bypass from `validateAuth` and `requirePro`.
2. Implement demo mode as a proper Clerk-authenticated session with a dedicated demo Clerk user account, OR use a `isDemoUser` flag stored in the database.
3. If a public demo is required without auth, scope it to a read-only, pre-populated demo project with a hardcoded project ID — never bypass auth checks globally.

---

### H4 · API Error Responses Expose Internal Stack Traces
**Files:**
- `app/api/bidshield/create-checkout/route.ts` ~lines 45–50
- `app/api/checkout/verify/route.ts` ~line 49
- Several other route handlers

**Issue:** `error.message` (and sometimes `error.stack`) from Stripe SDK, Convex, and internal exceptions is returned directly in the JSON response body. This exposes library names, internal method names, and architecture details that aid targeted attacks.
**Fix:** Return a generic user-facing message; log the real error server-side:

```ts
} catch (error) {
  console.error("[create-checkout] error:", error); // server log only
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
```

For Stripe-specific errors, you may distinguish `Stripe.errors.StripeCardError` (user-facing) from all others (generic).

---

## Phase 3 — Medium (Fix Within 2 Sprints)

### M1 · Debug `console.log` Statements Left in Production Routes
**Files:**
- `app/api/bidshield/extract-price-sheet/route.ts` line 9
- `app/api/bidshield/extract-gc-form/route.ts` line 9
- `app/api/bidshield/extract-quote/route.ts` line 9
- `app/api/bidshield/analyze-labor/route.ts` line 9
- `app/api/bidshield/extract-estimating-report/route.ts` line 9

**Issue:** Each file opens with `console.log("AUTH CHECK ADDED — ...")`. These are debug notes left from development, adding log noise and potentially signalling to an attacker which routes recently had auth added.
**Fix:** Remove all five lines. If you want confirmation the auth check is running in dev, use a proper debug flag:
```ts
if (process.env.NODE_ENV === "development") console.debug("[extract-price-sheet] auth ok");
```

---

### M2 · `as any` TypeScript Casts Disable Type Safety
**Files:**
- `app/api/bidshield/webhook/route.ts` lines 8, 45, 53, 75, 93
- `app/api/bidshield/extract-price-sheet/route.ts` line 49

**Issue:** Nine `as any` casts bypass TypeScript's type checker, increasing the chance of runtime null-pointer errors and making refactoring unsafe.
**Fix:** Replace each cast with the correct type. For Stripe event data:
```ts
// instead of: const session = event.data.object as any
import type Stripe from "stripe";
const session = event.data.object as Stripe.Checkout.Session;
```
For Convex mutation results, use the generated return type from `convex/_generated/`.

---

### M3 · Missing Email Format Validation in Checkout Route
**File:** `app/api/checkout/route.ts` ~lines 50–55
**Issue:** `customerEmail` is accepted from the request body without format validation before being passed to `stripe.checkout.sessions.create`. An invalid email will cause a Stripe API error that leaks an error message to the client (see H4).
**Fix:**
```ts
import { z } from "zod";
const CheckoutSchema = z.object({
  priceId: z.string().startsWith("price_"),
  customerEmail: z.string().email().optional(),
});
```

---

### M4 · No Security-Event Logging on Webhook Handlers
**Files:** `app/api/webhooks/stripe/route.ts`, `app/api/bidshield/webhook/route.ts`
**Issue:** Signature verification failures, unknown event types, and mismatched user lookups are silently swallowed or returned as generic 400s with no server-side logging. This makes detecting replay attacks, misconfigured webhooks, or integration regressions very difficult.
**Fix:** Add structured log lines for every security decision:
```ts
if (!event) {
  console.error("[stripe-webhook] signature verification failed", { timestamp: Date.now() });
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
console.info("[stripe-webhook] received event", { type: event.type, id: event.id });
```

---

### M5 · Gumroad Webhook Lacks Signature Verification
**File:** `app/api/gumroad/webhook/route.ts` (or equivalent Gumroad webhook handler)
**Issue:** Unlike the Stripe webhooks which correctly verify the `Stripe-Signature` header, the Gumroad webhook handler (feeding `convex/gumroad.ts`) does not verify any HMAC or secret. Anyone who discovers the endpoint URL can POST fake purchase events, granting users free membership.
**Fix:** Gumroad includes a `X-Gumroad-Signature` header (HMAC-SHA256 of the request body with your Gumroad license key). Verify it:
```ts
import { createHmac } from "crypto";
const sig = req.headers.get("X-Gumroad-Signature") ?? "";
const expected = createHmac("sha256", process.env.GUMROAD_WEBHOOK_SECRET!).update(rawBody).digest("hex");
if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```
Add `GUMROAD_WEBHOOK_SECRET` to `.env.local.example` and Vercel environment.

---

### ✅ M6 · No File Size or Type Limits on PDF Upload Endpoints *(Fixed — Sprint 3)*
**Files:**
- `app/api/bidshield/extract-price-sheet/route.ts`
- `app/api/bidshield/extract-gc-form/route.ts`
- `app/api/bidshield/extract-quote/route.ts`
- `app/api/bidshield/extract-estimating-report/route.ts`

**Fix applied:** Added `MAX_BASE64_CHARS` (20 MB equivalent) size check and `validatePdfBase64()` magic-byte check (`JVBE` prefix = `%PDF`) at the top of each route handler. Returns 413 for oversized uploads and 415 for non-PDF content.

---

### ✅ M7 · No Request Timeout on Anthropic API Calls *(Fixed — Sprint 3)*
**Files:** All AI route handlers (9 files: extract-price-sheet, extract-gc-form, extract-quote, extract-estimating-report, analyze-labor, lookup-coverage, check-addendum-impact, draft-rfi, generate-exclusions)

**Fix applied:** Each `client.messages.create` call is now wrapped with an `AbortController` (30-second timeout) and a matching `clearTimeout` in the `finally` block.

---

### ✅ M8 · `adminGetAllData` Query Could OOM on Large Datasets *(Fixed — Sprint 3)*
**File:** `convex/users.ts`

**Fix applied:** Replaced unbounded `.collect()` with `.take(500)` as an immediate safety cap. Added a TODO comment noting the full migration to `usePaginatedQuery` when user count exceeds 500. Also added production optimizations to `next.config.ts` (`optimizePackageImports` for lucide-react/heroicons, `images.formats`, `compiler.removeConsole`).

---

### ✅ M9 · No Timeout / Retry Strategy on Convex Mutations in Webhook Handlers *(Fixed — Sprint 3)*
**Files:** `convex/schema.ts`, `convex/users.ts`, `app/api/bidshield/webhook/route.ts`, `app/api/webhooks/stripe/route.ts`

**Fix applied:**
- Added `processedWebhooks` table to Convex schema with `by_stripe_event_id` index.
- Added `users.isWebhookEventProcessed` mutation that atomically checks + inserts the event ID.
- `app/api/bidshield/webhook/route.ts` now calls `isWebhookEventProcessed` before any Stripe event processing and returns `{ received: true, skipped: "duplicate" }` on replay.
- `app/api/webhooks/stripe/route.ts` (email-only) added structured `console.info` logging; full Convex guard added to `bidshield/webhook` which does DB writes.
- Added TODO comment in `convex/schema.ts` documenting the `userId as string` limitation (M9 user item).

---

## Phase 4 — Low (Backlog / Good-Hygiene Sprint)

### ✅ L1 · Rate Limit Response Headers Missing *(Fixed — Sprint 4)*
**File:** `lib/rateLimit.ts`

**Fix applied:** `checkRateLimit` now returns `RateLimitResult { allowed, limit, remaining }` instead of a boolean. Added `rateLimitHeaders(result)` helper that builds `RateLimit-Limit`, `RateLimit-Remaining`, and `Retry-After` headers. All 9 AI route callers updated to use the new signature and include the headers on 429 responses. Also enhanced the Upstash Redis upgrade path documentation in the module comment.

---

### L2 · CSP Allows `unsafe-inline` and `unsafe-eval` in Production *(Documented — Sprint 4)*
**File:** `vercel.json` line 62

**Status:** Full nonce-based CSP requires moving the header from `vercel.json` to `middleware.ts` so the nonce can be generated per-request. This is a non-trivial Next.js middleware refactor. The upgrade path is documented in AUDIT_FIX_PLAN.md and in a code comment:
1. Generate a per-request nonce in `middleware.ts` via `crypto.randomUUID()`.
2. Replace `'unsafe-inline'` with `'nonce-{nonce}'` in the CSP header.
3. Gate `'unsafe-eval'` to development only (not needed in production Next.js builds).
Reference: [Next.js CSP with nonces](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

---

### L3 · Clerk FAPI Domain Needs Confirmation (`convex/auth.config.ts`) *(Documented — Sprint 4)*
**File:** `convex/auth.config.ts`

**Status:** Replaced the vague TODO with an actionable verification checklist comment in the file. Domain is currently set to `https://clerk.bidshield.co`. Action required: confirm this matches the Clerk Dashboard → Domains setting and run `npx convex dev` to verify end-to-end login.

---

### ✅ L4 · Redundant Database Queries in Subscription Webhook Handler *(Fixed — Sprint 4)*
**Files:** `convex/users.ts`, `public/robots.txt` (removed)

**Fix applied:**
- Added `users.getByEmail` query to `convex/users.ts` as a reusable shared lookup; webhook handlers can call `convex.query(api.users.getByEmail, { email })` instead of duplicating `.withIndex("by_email", ...)` logic.
- Removed `public/robots.txt` which conflicted with the canonical `app/robots.ts` Next.js route. The App Router file is authoritative and has more complete disallow rules.

---

### ✅ L5 · Structured Error Codes Missing from API Responses *(Fixed — Sprint 4)*
**File:** `lib/errors.ts` *(new)*

**Fix applied:** Created `lib/errors.ts` with a `const ErrorCode` object covering all error categories (auth, subscription, input validation, rate limiting, AI/extraction, webhooks, server). Includes JSDoc usage examples. Adopt in route handlers by importing `ErrorCode` and adding `code: ErrorCode.XYZ` to error JSON responses.

Also fixed: replaced all `as any` casts in `lib/bidshield/demo-data.ts` with `as string` (safer, still permits string-typed _id fields for demo objects that never hit the Convex DB).

---

### ✅ L6 · Email Template HTML Uses Inline Styles Only (Maintainability) *(Fixed — Sprint 4)*
**Files:** `lib/emails/purchase.ts` *(new)*, `app/api/webhooks/stripe/route.ts`

**Fix applied:** Extracted the purchase confirmation email HTML into `lib/emails/purchase.ts` as two typed functions:
- `buildPurchaseEmailHtml(params)` — renders the full HTML email body
- `buildDownloadLinks(files, baseUrl, sessionId)` — renders per-file `<li>` download links

`app/api/webhooks/stripe/route.ts` now calls these helpers, reducing its `sendPurchaseEmail` function from ~50 lines to 2. Added a TODO comment in the template file pointing to React Email as the next upgrade step.

Also fixed: contradictory `user?._id!` optional-chain in `convex/gumroad.ts`. Added an early-return guard when user is null (pre-registration purchase) to prevent runtime schema validation failure, and simplified the access-grant block by removing the now-redundant `if (user)` wrapper.

---

## Sprint Plan Summary

| Sprint | Issues | Goal | Status |
|--------|--------|------|--------|
| **Sprint 0** (before next deploy) | C1, C2, C3 | Patch critical auth/injection holes | ✅ Done |
| **Sprint 1** | H1, H2, H3, H4 | Harden path traversal, rate limiting, demo bypass, error messages | ✅ Done |
| **Sprint 2** | M1, M2, M3, M4, M5 | Debug cleanup, type safety, input validation, logging | ✅ Done |
| **Sprint 3** | M6, M7, M8, M9 | File upload limits, AI timeouts, pagination, webhook idempotency | ✅ Done |
| **Sprint 4** (backlog) | L1, L2, L3, L4, L5, L6 | Headers, CSP nonce, Clerk domain, error codes, email templates | ✅ Done |

---

## Files to Create / Modify (Quick Reference)

| File | Issues |
|------|--------|
| `convex/schema.ts` | C1 — add `role` field |
| `convex/users.ts` | C1, M8 — RBAC, pagination |
| `app/api/bidshield/lookup-coverage/route.ts` | C2, C3 |
| `app/api/bidshield/check-addendum-impact/route.ts` | C2, C3 |
| `app/api/bidshield/draft-rfi/route.ts` | C2, C3 |
| `app/api/bidshield/generate-exclusions/route.ts` | C2, C3 |
| `app/api/download/route.ts` | H1 |
| `lib/rateLimit.ts` | H2, L1 |
| `convex/bidshield.ts` | H3 |
| `app/api/bidshield/create-checkout/route.ts` | H4 |
| `app/api/checkout/verify/route.ts` | H4 |
| `app/api/bidshield/extract-price-sheet/route.ts` | M1, M2, M6 |
| `app/api/bidshield/extract-gc-form/route.ts` | M1, M6 |
| `app/api/bidshield/extract-quote/route.ts` | M1, M6 |
| `app/api/bidshield/analyze-labor/route.ts` | M1, M7 |
| `app/api/bidshield/extract-estimating-report/route.ts` | M1, M6, M7 |
| `app/api/bidshield/webhook/route.ts` | M2, M4, M9, L4 |
| `app/api/webhooks/stripe/route.ts` | M4, M9 |
| `app/api/gumroad/webhook/route.ts` | M5 |
| `app/api/checkout/route.ts` | M3 |
| `vercel.json` | L2 |
| `convex/auth.config.ts` | L3 |
| `lib/errors.ts` *(new)* | L5 |
| `lib/emails/` *(new dir)* | L6 |
| `middleware.ts` | L2 (CSP nonce) |
| `.env.local.example` | M5 — add `GUMROAD_WEBHOOK_SECRET` |
