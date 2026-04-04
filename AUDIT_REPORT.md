# BidShield Comprehensive Audit Report
**Date:** 2026-04-02
**Product:** BidShield — $249/mo SaaS bid workflow & QA tool for commercial roofing estimators
**Stack:** Next.js 16, React 19, Convex (backend-as-a-service), Clerk (auth), Stripe (payments), Anthropic Claude API, Tailwind CSS v4
**Branch:** `claude/quizzical-lederberg`

---

## Executive Summary

BidShield is a functional MVP with a comprehensive feature set: a 16-tab project editor, AI-powered PDF extraction, checklist tracking, scope gap analysis, labor task generation, and a full bid qualification workflow. The codebase is well-organized with a clear separation between Convex backend, Clerk auth, and Stripe integration.

However, **7 P0 security and architectural issues must be resolved before confident production deployment**, particularly around authentication enforcement, subscription gating, webhook idempotency, and rate limiting. 10 P1 gaps affect reliability and correctness. 13 P2 items affect polish and UX.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [P0 — Blocking Issues (7)](#p0--blocking-issues)
- [P1 — Important Gaps (10)](#p1--important-gaps)
- [P2 — Polish / Nice-to-Have (13)](#p2--polish--nice-to-have)
- [Missing Features Overview](#missing-features-overview)
- [Hardcoded Values Reference](#hardcoded-values-reference)
- [Recommended Fix Order](#recommended-fix-order)

---

## Project Structure

```
app/
├── api/
│   ├── bidshield/
│   │   ├── analyze-labor/route.ts          # Claude Sonnet — labor cost breakdown
│   │   ├── extract-quote/route.ts          # Claude Haiku — PDF vendor quote extraction
│   │   ├── extract-price-sheet/route.ts    # Claude Haiku — material cost extraction
│   │   ├── extract-estimating-report/route.ts  # Claude Haiku — estimate PDF parsing
│   │   ├── extract-gc-form/route.ts        # Claude Haiku — GC bid form extraction
│   │   ├── draft-rfi/route.ts              # Claude Sonnet — RFI question drafting
│   │   ├── check-addendum-impact/route.ts  # Claude Sonnet — addendum scope/pricing analysis
│   │   ├── generate-exclusions/route.ts    # Claude Sonnet — scope gap generator
│   │   ├── lookup-coverage/route.ts        # Claude Sonnet — material coverage lookups
│   │   └── create-checkout/route.ts        # Stripe checkout session creation
│   └── webhooks/
│       ├── stripe/route.ts                 # Stripe payment webhook handler
│       └── clerk/route.ts                  # Clerk user sync webhook
├── bidshield/
│   ├── dashboard/
│   │   ├── page.tsx                        # Project list, new bid wizard
│   │   ├── layout.tsx                      # Dashboard layout with sidebar
│   │   ├── project/
│   │   │   ├── page.tsx                    # Main 16-tab project editor
│   │   │   ├── TabErrorBoundary.tsx        # Error boundary for project tabs
│   │   │   └── tabs/                       # All 16 tab components
│   │   │       ├── OverviewTab.tsx
│   │   │       ├── ChecklistTab.tsx
│   │   │       ├── ScopeTab.tsx
│   │   │       ├── TakeoffTab.tsx
│   │   │       ├── MaterialsTab.tsx
│   │   │       ├── PricingTab.tsx
│   │   │       ├── LaborTab.tsx
│   │   │       ├── GeneralConditionsTab.tsx
│   │   │       ├── QuotesTab.tsx
│   │   │       ├── AddendaTab.tsx
│   │   │       ├── RFIsTab.tsx
│   │   │       ├── BidQualsTab.tsx
│   │   │       ├── ValidatorTab.tsx
│   │   │       ├── DecisionLogTab.tsx
│   │   │       ├── SubmissionTab.tsx
│   │   │       └── PreBidMeetingsTab.tsx
│   │   ├── analytics/page.tsx              # Pipeline analytics
│   │   ├── vendors/page.tsx                # Vendor address book
│   │   ├── templates/page.tsx              # Saved checklist templates
│   │   └── datasheets/page.tsx             # Quote/pricing database
│   ├── demo/page.tsx                       # Demo mode (no auth required)
│   ├── export/page.tsx                     # Export functionality
│   └── pricing/page.tsx                    # Pricing page
├── admin/page.tsx                          # Admin dashboard
├── blog/                                   # ~15 blog articles
├── resources/                              # Educational content (roofing systems, tools)
├── tools/                                  # Course/tool landing pages
├── products/                               # Template marketplace
└── [auth pages]                            # sign-in, sign-up
components/                                 # Shared React components
convex/
├── schema.ts                               # Database schema (20 tables)
├── bidshield.ts                            # BidShield queries/mutations
├── users.ts                                # User management
└── [other mutation files]
lib/
├── auth-shim.ts                            # Re-exports Clerk auth
├── isDemoUser.ts                           # Demo user prefix check
├── rateLimit.ts                            # In-memory LRU rate limiter
├── generateBidSummaryPDF.ts                # jsPDF bid summary export
├── emails/purchase.ts                      # Resend purchase email
└── bidshield/
    ├── types.ts                            # Type definitions
    ├── demo-data.ts                        # Hardcoded demo project fixture
    ├── constants.ts                        # Assembly types, enums
    └── roof-systems.ts                     # Roofing system definitions + coverage rates
```

---

## Database Schema

**File:** `convex/schema.ts` — 20 Convex tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts, subscriptions, memberships |
| `bidshield_projects` | Bid projects (userId stored as Clerk string) |
| `bidshield_checklist_items` | 18-phase bid QA checklist (134 items) |
| `bidshield_takeoff_sections` | Section-level takeoff organization |
| `bidshield_takeoff_line_items` | LF and EA measurement items |
| `bidshield_project_materials` | Material list per project |
| `bidshield_scope_items` | Scope gap tracker (40+ defaults) |
| `bidshield_bid_quals` | Bid qualifications (bonds, labor type, insurance, MBE) |
| `bidshield_quotes` | Vendor quote tracking per project |
| `bidshield_rfis` | RFI tracker (draft/sent/answered/closed) |
| `bidshield_addenda` | Change order tracking per project |
| `bidshield_vendors` | Account-level vendor address book |
| `bidshield_laborTasks` | AI-generated labor breakdown per project |
| `bidshield_labor_rates` | User's custom labor rate library |
| `bidshield_gc_items` | General Conditions line items |
| `bidshield_datasheets` | Material/product price library |
| `bidshield_gcBidFormDocuments` | Uploaded GC bid form PDFs |
| `bidshield_gcBidFormItems` | Items extracted from GC bid forms |
| `bidshield_submissions` | Submission tracking (method + confirmation) |
| `bidshield_prebid_meetings` | Pre-bid meeting records + attendance |

---

## P0 — Blocking Issues

These are security vulnerabilities, data integrity failures, or broken flows that must be fixed before production.

---

### P0-1: No Server-Side Auth Middleware

**File:** `middleware.ts` — DOES NOT EXIST
**Impact:** Unauthenticated users can access the `/bidshield/dashboard/*` page shell before the client-side auth check runs.

All protected routes rely solely on `useAuth()` from Clerk inside React components (e.g., `app/bidshield/dashboard/project/page.tsx:61`). There is no `middleware.ts` using `clerkMiddleware()` to redirect unauthenticated users server-side before the page is rendered.

During SSR/hydration, the page renders briefly before the auth state resolves. Any code that runs during that window (layout renders, data fetches initiated in Server Components, etc.) could expose structure or trigger unauthenticated queries.

**Fix:** Create `middleware.ts` at the project root using Clerk's `clerkMiddleware()` with a matcher for all `/bidshield/*` routes. Redirect unauthenticated requests to `/sign-in`.

---

### P0-2: Demo Mode Fully Accessible Without Authentication

**File:** `app/bidshield/demo/page.tsx`
**File:** `lib/isDemoUser.ts`
**File:** `app/bidshield/dashboard/page.tsx:87-102`
**Impact:** Unauthenticated visitors can access the full demo dashboard with no session required.

The demo check in `lib/isDemoUser.ts` is:
```ts
export const isDemoUser = (userId: string) => userId.startsWith("demo_");
```
Any string starting with `"demo_"` is treated as a valid demo user. The `?demo=true` query param on the dashboard page triggers a fake `demo_1` user ID and renders a fully functional project view with hardcoded data ("Meridian Business Park").

There is no rate limiting, session validation, or consent gate on demo access. This could be abused for scraping the UI or probing the API surface.

**Fix:** Either require authentication before accessing demo mode, or add an explicit consent/email-capture gate. At minimum, add rate limiting to demo page requests.

---

### P0-3: Free-Tier Project Limit Enforced Client-Side Only

**File:** `app/bidshield/dashboard/page.tsx:60`
**Impact:** Users on the free plan can bypass the project limit by calling Convex mutations directly or manipulating React state.

The check that prevents free users from creating more than N projects exists only in the React component. No corresponding server-side check exists in Convex mutations (`convex/bidshield.ts`). Any user who can inspect network requests can call `createProject` mutations without triggering the gate.

**Fix:** Add an `isPro` / membership level check inside the Convex `createProject` mutation. Query the user's current project count server-side and throw a `ConvexError` if the limit is exceeded.

---

### P0-4: Stripe Webhook Idempotency Guard Is Not Implemented

**File:** `app/api/webhooks/stripe/route.ts:31-35`
**Impact:** Stripe webhook retries (which are automatic) will send duplicate purchase confirmation emails and potentially trigger duplicate user upgrades.

A comment in the file states: "simple in-memory dedup using event.id." However, the actual code only **logs** the event ID — it never checks or writes to any dedup store (in-memory or Convex). Stripe retries failed webhooks up to 3× over 3 days.

**Fix:** Implement idempotency by storing processed Stripe event IDs in a Convex table (e.g., `processedWebhooks`). On each webhook receipt, check if the event ID already exists before processing; if it does, return 200 immediately.

---

### P0-5: In-Memory Rate Limiter Is Bypassed on Multiple Serverless Instances

**File:** `lib/rateLimit.ts`
**Impact:** Users can bypass AI call rate limits entirely by hitting different Vercel serverless instances.

The rate limiter uses an LRU in-memory cache keyed by user ID. On Vercel, each serverless function invocation may run on a different instance with its own memory. A user making 10 requests per minute to 5 different instances can make 50 AI calls per minute — 5× the intended limit.

There is a TODO comment in the file acknowledging this limitation but no fallback is implemented.

**Fix:** Integrate Upstash Redis (or similar distributed KV store) for rate limiting state. The existing LRU cache can remain as a local fallback in development.

---

### P0-6: `userId` in Convex Schema Stored as Plain String Instead of Typed Reference

**File:** `convex/schema.ts:59`
**Impact:** No referential integrity between `bidshield_projects` and `users` tables. Orphaned projects can exist. Convex cannot enforce ownership at the schema level.

The schema stores `userId` as a plain Clerk ID string:
```ts
userId: v.string(), // TODO: Migrate to v.id("users")
```
The TODO comment acknowledges the issue but it has not been addressed. This prevents Convex from using typed references, join-safe queries, or cascading deletes.

**Fix:** Migrate `userId` to `v.id("users")` across all tables. Update all write paths to store the Convex `_id` instead of the Clerk ID. This is a breaking schema migration requiring a Convex deployment.

---

### P0-7: Project Ownership Not Validated Server-Side in Convex Queries

**File:** `convex/bidshield.ts` (all project queries and mutations)
**Impact:** Any authenticated user who knows (or can guess) a project `_id` could potentially read or modify another user's project data.

Convex queries fetch project data by ID without verifying that the requesting user's `userId` matches `project.userId`. Since Convex IDs are not sequential integers but are also not cryptographically secret, this represents a horizontal privilege escalation risk.

**Fix:** In every Convex query and mutation that accepts a `projectId`, after fetching the document, assert `ctx.auth.userId === project.userId` (or the Convex equivalent). Throw a `ConvexError("Unauthorized")` on mismatch.

---

## P1 — Important Gaps

These issues affect reliability, correctness, or maintainability and should be fixed before or shortly after launch.

---

### P1-1: Admin Page Uses Hardcoded Clerk User ID

**File:** `app/admin/page.tsx:11`
**Impact:** Admin access will silently break if the account is rotated, deleted, or transferred. No RBAC exists.

```ts
const ADMIN_ID = "user_3Aid1uIjrlbv2KrZsADW4SkYKlp";
```

This production Clerk user ID is hardcoded in source code. There is no role-based access control system — a single string comparison is the only gate to the admin panel.

**Fix:** Move admin access control to a Clerk organization role or a custom `isAdmin` flag in the `users` Convex table. Remove the hardcoded ID from source code. Use environment variables at minimum.

---

### P1-2: Admin MRR Calculation Uses Wrong Price

**File:** `app/admin/page.tsx:36`
**Impact:** MRR displayed in the admin dashboard is ~40% understated. Business metrics are wrong.

The admin page calculates MRR using `$149/user`, but the product is priced at `$249/month`. This appears to be a stale value from an earlier pricing iteration.

**Fix:** Update the MRR calculation to use `$249` (or pull from the same price constant used elsewhere in the codebase).

---

### P1-3: Tab Error Boundary "Retry" Button Doesn't Actually Recover

**File:** `app/bidshield/dashboard/project/TabErrorBoundary.tsx`
**Impact:** After a tab throws an error, clicking "Retry" resets the error state visually but does not re-fetch data or re-mount the component. The tab appears to recover but remains broken.

The retry handler calls `setState({ hasError: false })` which clears the error boundary, but the underlying component will immediately throw again on re-render if the root cause (e.g., missing data, bad query result) hasn't changed.

**Fix:** The error boundary's retry should also trigger a data re-fetch. Consider using `key` prop rotation on the wrapped component to force a full re-mount, or integrate with Convex's `useQuery` to re-subscribe.

---

### P1-4: AI Call Timeout Too Aggressive With No Retry

**Files:** All routes in `app/api/bidshield/*/route.ts`
**Impact:** Large PDF uploads (up to 20MB) regularly exceed the 30-second hard timeout. Users see a generic "Internal server error" with no ability to retry.

Every AI route uses:
```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 30_000);
```
There is no retry logic, no `Retry-After` response header, and no user-facing guidance when this occurs.

**Fix:** Increase timeout to 60 seconds for PDF extraction routes. Add a `Retry-After: 5` header on timeout responses. Consider moving long-running AI jobs to a background queue with polling.

---

### P1-5: AI JSON Parse Errors Are Silently Swallowed

**Files:** All routes in `app/api/bidshield/*/route.ts`
**Impact:** When Claude returns malformed JSON (which happens), the API returns a generic 422 with no diagnostic information. Debugging production failures is nearly impossible.

Every AI route catches JSON parse errors like:
```ts
catch (e) {
  return NextResponse.json({ error: "Failed to parse AI response" }, { status: 422 });
}
```
The raw Claude response, the parse error message, and any relevant context are never logged.

**Fix:** Log `JSON.stringify({ rawResponse: text, parseError: e.message, userId, endpoint })` to a structured logger (or at minimum `console.error`) before returning the 422.

---

### P1-6: Membership Level Enum Is Inconsistently Used

**Files:** Multiple components and Convex mutations
**Impact:** Pro-tier feature gating may silently fail if the wrong enum value is checked. Users could be incorrectly granted or denied access to features.

Some code checks `membershipLevel === "pro"`, other code checks `membershipLevel === "bidshield"`. These appear to be different values representing the same concept from different points in the product's development.

**Fix:** Define a single canonical enum for membership levels in `lib/bidshield/constants.ts` and replace all inline string comparisons with references to that enum. Audit every gating check to confirm it uses the correct value.

---

### P1-7: Purchase Email Sent Fire-and-Forget With No Retry

**File:** `app/api/webhooks/stripe/route.ts:41-43`
**Impact:** If Resend is down or returns an error, the user is charged but never receives their purchase confirmation or download link. The failure is silently logged.

```ts
sendPurchaseEmail(session).catch((err) =>
  console.error("Purchase email failed for session", session.id, err)
);
```

The webhook still returns 200 to Stripe, so Stripe will not retry. The email failure is lost.

**Fix:** Either make email sending synchronous (await it before returning 200) so Stripe retries on failure, or implement a Convex-backed email job queue that retries failed sends.

---

### P1-8: No Email Address Validation Before Sending

**File:** `app/api/webhooks/stripe/route.ts:56`
**Impact:** Malformed email addresses from Stripe metadata pass directly to Resend without validation, which could cause silent send failures.

```ts
const customerEmail = session.customer_email || session.customer_details?.email;
```

No format validation, no null check before the send call.

**Fix:** Validate `customerEmail` with a simple regex or Zod schema before attempting to send. Log and alert (not silently drop) if the email is invalid.

---

### P1-9: Stripe Checkout Price IDs Fall Through With Generic Error

**File:** `app/api/bidshield/create-checkout/route.ts:10-12, 26-28`
**Impact:** If `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` or `_ANNUAL` env vars are missing or empty, checkout silently fails with a generic "Invalid plan" 400 — no indication that env vars are the root cause.

**Fix:** Add explicit startup validation for required environment variables. Consider using a library like `zod` to validate `process.env` at build time and fail loudly if required vars are missing.

---

### P1-10: Trial Period Hardcoded in Checkout Route

**File:** `app/api/bidshield/create-checkout/route.ts:38`
**Impact:** Changing the trial period requires a code change and deployment.

```ts
trial_period_days: 14
```

**Fix:** Move to an environment variable (`TRIAL_PERIOD_DAYS`) with a default of 14. This allows trial period changes without deploys.

---

## P2 — Polish / Nice-to-Have

These issues affect UX quality, developer experience, or long-term maintainability.

---

### P2-1: No Loading Skeleton Screens

**Files:** All dashboard page and tab components
**Impact:** While Convex `useQuery()` resolves (returns `undefined`), pages show nothing or flash empty content. This makes the app feel slow and broken on initial load.

**Fix:** Add skeleton placeholder components (e.g., using `shadcn/ui`'s `Skeleton`) for the project list, project tabs, and data tables. Show skeletons while `data === undefined`.

---

### P2-2: Demo Project Not Labeled as Demo in Dashboard

**File:** `app/bidshield/dashboard/page.tsx:87-102`
**Impact:** The hardcoded "Meridian Business Park" demo project appears in the dashboard alongside real projects with no visual distinction. New users may interact with it as if it were a real bid.

**Fix:** Add a "DEMO" badge to the project card. Add a dismissible banner explaining the demo project when it is visible.

---

### P2-3: No Unsaved Changes Warning on Navigation

**Files:** Multiple tab components with forms
**Impact:** Users filling out forms in any tab (Edit Project, Add Material, General Conditions rows, etc.) can navigate away and silently lose all unsaved work. No browser unload warning is shown.

**Fix:** Implement a dirty-state tracker using React context or `useEffect`. Use the browser's `beforeunload` event and Next.js router events to prompt the user before discarding changes.

---

### P2-4: Sidebar Hidden on Mobile With No Replacement

**File:** `app/bidshield/dashboard/layout.tsx:79`
**Impact:** On screens smaller than `lg` (1024px), the dashboard sidebar is hidden with `hidden lg:flex` and no mobile navigation replacement exists — no hamburger menu, no bottom nav, no drawer. The app is functionally unusable on mobile.

**Fix:** Implement a mobile drawer sidebar using a `Sheet` component (shadcn/ui). Add a hamburger button in the mobile header to open it.

---

### P2-5: Export Feature Is Incomplete

**File:** `app/bidshield/export/page.tsx`
**File:** `lib/generateBidSummaryPDF.ts`
**Impact:** Only a high-level bid summary PDF export is available. There is no full project export, no line-item CSV, no scope export, and no Excel output. Users who need to share detailed data with colleagues or import into another tool have no path to do so.

**Fix:** Implement at minimum a CSV export for: scope items, takeoff line items, materials list, and general conditions. The jsPDF integration could be extended for a more detailed PDF.

---

### P2-6: Validator Tab Appears to Be Read-Only Rules List

**File:** `app/bidshield/dashboard/project/tabs/ValidatorTab.tsx`
**Impact:** The Validator tab shows validation rules but does not appear to auto-check prerequisites (e.g., "at least one quote added," "all checklist phases complete," "takeoff sections have quantities"). It functions as documentation, not active enforcement.

**Fix:** Implement active validation checks. Query the project's actual data (checklist completeness, quote count, takeoff status) and display pass/fail status for each rule. Consider blocking submission if critical validators fail.

---

### P2-7: Decision Log Has No Auto-Capture

**File:** `app/bidshield/dashboard/project/tabs/DecisionLogTab.tsx`
**Impact:** The Decision Log is a freeform text field. Significant actions (scope changes, quote additions, addenda, RFI resolutions) do not automatically append log entries. The log is only as complete as the estimator remembers to make it.

**Fix:** Hook key Convex mutations (addenda creation, scope item status changes, quote additions) to also write a structured entry to the decision log with a timestamp, action type, and user ID.

---

### P2-8: `any` Type Used ~624 Times Across Codebase

**Files:** Widespread — notable instances in all tab components
**Impact:** TypeScript provides no protection for a large portion of the data flow. Runtime type errors will not be caught at compile time. Example: `PricingTab.tsx` accesses `(project as any).systemType`.

**Fix:** Enable TypeScript strict mode. Progressively replace `any` casts with proper types, starting with the Convex query return types (which are auto-generated and available from `convex/_generated/`).

---

### P2-9: Pagination Not Implemented for User/Project Lists

**File:** `convex/users.ts` and related query files
**Impact:** Queries use `.take(N)` instead of Convex's paginated query API. At scale (hundreds of projects or users), these queries will return incomplete results or degrade in performance.

**Fix:** Migrate list queries to use `usePaginatedQuery()` from Convex for all unbounded lists.

---

### P2-10: Demo Data Is Hardcoded in Source (Not Admin-Configurable)

**File:** `lib/bidshield/demo-data.ts`
**File:** `app/bidshield/dashboard/page.tsx:87-102`
**Impact:** Updating the demo project (name, scope items, bid amounts, vendor names) requires a code change and deployment. There is no admin UI to update demo content.

**Fix:** Move demo project data to a Convex table seeded at deployment time. Allow admins to update demo content through the admin panel.

---

### P2-11: No Bulk Operations in Dashboard

**File:** `app/bidshield/dashboard/page.tsx`
**Impact:** Users cannot multi-select projects to archive, delete, or duplicate them. Every operation must be performed one project at a time. Estimators with many active bids will find this tedious.

**Fix:** Add checkbox selection to project cards. Implement a bulk action toolbar that appears on selection with Archive, Delete, and Duplicate actions.

---

### P2-12: Custom Checklist Items Not Supported

**File:** `app/bidshield/dashboard/project/tabs/ChecklistTab.tsx`
**File:** `convex/bidshield.ts` (checklist mutations)
**Impact:** The 134-item checklist is fixed. Estimators cannot add project-specific checklist items for unusual bid requirements (e.g., specialty coating sign-off, owner-furnished equipment). This is a common request in workflow tools.

**Fix:** Add an "Add custom item" button at the bottom of each checklist phase. Store custom items with a `isCustom: true` flag so they can be distinguished from system items.

---

### P2-13: No Dependency Pinning on Critical Packages

**File:** `package.json`
**Impact:** `@anthropic-ai/sdk`, `stripe`, `convex`, and `@clerk/nextjs` all use `^` (caret) semver ranges. A minor-version bump from any of these vendors could introduce breaking API changes that silently ship to production.

**Fix:** Pin critical infrastructure dependencies to exact versions (remove `^`). Use `npm audit` and Dependabot/Renovate for controlled upgrade PRs.

---

## Missing Features Overview

The following capabilities are fully absent from the current implementation (not stubbed — simply not built):

| Feature | Priority | Notes |
|---------|----------|-------|
| Team collaboration / project sharing | High | Single-user only; no multi-user access model |
| Mobile navigation | High | Sidebar hidden on mobile, no replacement |
| Full project export (Excel/CSV) | High | Only bid summary PDF exists |
| Active Validator checks | Medium | Tab exists but doesn't auto-evaluate |
| Custom checklist items | Medium | Fixed 134-item list only |
| Bulk project operations | Medium | One-at-a-time only |
| Auto-capture to Decision Log | Medium | Manual entry only |
| Recurring project templates | Low | No duplication/template workflow |
| Offline mode / service worker | Low | No offline data sync |
| Advanced project search/filter | Low | Basic dashboard search only |
| Audit log (compliance-level) | Low | Decision Log is informal only |

---

## Hardcoded Values Reference

| Value | File | Line | Notes |
|-------|------|------|-------|
| Admin Clerk user ID | `app/admin/page.tsx` | 11 | `"user_3Aid1uIjrlbv2KrZsADW4SkYKlp"` |
| MRR per user ($149) | `app/admin/page.tsx` | 36 | Should be $249 |
| Trial period (14 days) | `app/api/bidshield/create-checkout/route.ts` | 38 | Should be env var |
| AI call timeout (30s) | All AI route files | varies | Too short for large PDFs |
| Rate limit (10/min) | `lib/rateLimit.ts` | 29 | Not distributed |
| Rate limit window (1 min) | `lib/rateLimit.ts` | 26 | Not distributed |
| Max file size (20MB) | `app/api/bidshield/extract-quote/route.ts` | 9 | `MAX_BASE64_CHARS` |
| Demo project name | `app/bidshield/dashboard/page.tsx` | 87-102 | "Meridian Business Park" |
| Pricing ($249/mo) | Multiple marketing pages | — | Inconsistent with `.env.local.example` ($149) |

---

## Recommended Fix Order

### Immediate (P0 — Before Any Production Traffic)

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1 | Add `middleware.ts` with `clerkMiddleware()` | `middleware.ts` (create) | 1 hr |
| 2 | Move free-tier gating to Convex mutation | `convex/bidshield.ts` | 2 hr |
| 3 | Validate project ownership in all queries/mutations | `convex/bidshield.ts` | 3 hr |
| 4 | Fix Stripe webhook idempotency | `app/api/webhooks/stripe/route.ts` | 2 hr |
| 5 | Gate demo mode behind auth or consent | `app/bidshield/demo/page.tsx` | 1 hr |
| 6 | Plan Convex schema migration for `userId` type | `convex/schema.ts` | 4 hr |
| 7 | Add Upstash Redis rate limiter with LRU fallback | `lib/rateLimit.ts` | 3 hr |

### Short-Term (P1 — Within First Sprint Post-Launch)

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 8 | Fix admin MRR calculation | `app/admin/page.tsx` | 30 min |
| 9 | Replace hardcoded admin Clerk ID with env var | `app/admin/page.tsx` | 30 min |
| 10 | Fix Tab Error Boundary retry logic | `TabErrorBoundary.tsx` | 1 hr |
| 11 | Standardize membership level enum | `lib/bidshield/constants.ts` + all consumers | 2 hr |
| 12 | Increase AI timeout to 60s for PDF routes | All AI route files | 30 min |
| 13 | Add structured logging for AI JSON parse errors | All AI route files | 1 hr |
| 14 | Make purchase email await (not fire-and-forget) | `app/api/webhooks/stripe/route.ts` | 1 hr |
| 15 | Add email validation before Resend call | `app/api/webhooks/stripe/route.ts` | 30 min |
| 16 | Add env var validation for Stripe price IDs | `app/api/bidshield/create-checkout/route.ts` | 1 hr |
| 17 | Move trial period to env var | `app/api/bidshield/create-checkout/route.ts` | 15 min |

### Medium-Term (P2 — Polish Sprint)

| # | Task | Effort |
|---|------|--------|
| 18 | Add loading skeleton screens | 4 hr |
| 19 | Add mobile sidebar drawer | 3 hr |
| 20 | Implement unsaved changes warning | 2 hr |
| 21 | Label demo project with "DEMO" badge | 1 hr |
| 22 | Implement active Validator tab checks | 6 hr |
| 23 | Add CSV export for scope/materials/takeoff | 8 hr |
| 24 | Add auto-capture to Decision Log | 4 hr |
| 25 | Implement custom checklist items | 4 hr |
| 26 | Pin critical package versions | 1 hr |
| 27 | Replace `any` types progressively (strict mode) | 8+ hr |
| 28 | Migrate list queries to `usePaginatedQuery` | 4 hr |

---

## Issue Count Summary

| Severity | Count |
|----------|-------|
| P0 — Blocking | 7 |
| P1 — Important | 10 |
| P2 — Polish | 13 |
| **Total** | **30** |

---

*Report generated by Claude Code audit — 2026-04-02*
