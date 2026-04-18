# AI Mode Credit Optimization Plan
**Date:** 2026-04-18  
**Status:** Draft  
**Scope:** All 21 routes under `app/api/bidshield/`

---

## Goal

Give Carlos full control over AI spending — enforce a monthly credit budget, show users how many credits remain, surface usage in the account dashboard, and pick the cheapest model that's good enough for each task. Currently every Pro user can call any AI route up to 10× per 60-second window with no monthly ceiling, no UI feedback, and no cost-awareness.

---

## Current State Audit

### Infrastructure already in place
| Asset | What it does |
|---|---|
| `lib/rateLimit.ts` | Per-minute sliding window (10 calls/60 s). Three-tier: Upstash → Convex → LRU. |
| `convex/rateLimits.ts` | DB-backed `recordAndCheck` mutation + `checkLimit` query + GC cron. |
| `convex/bidshield/aiUsage.ts` | `logUsage` mutation + `getUsageStats` query (30-day rolling window, by endpoint). |
| `lib/bidshield/useAiUsageLog.ts` | Client-side hook that calls `logUsage` after each call. |
| `convex/schema.ts` → `bidshield_ai_usage` | Full table: endpoint, model, tokensIn, tokensOut, durationMs, success. |

### What's missing
1. **Monthly credit ceiling** — `rateLimit.ts` only enforces 10/min. No monthly cap exists.
2. **Usage is not logged** — `useAiUsageLog` exists but is not called from any tab component. `tokensIn`/`tokensOut` fields exist but are never written (routes don't return token counts to the client).
3. **No credit UI** — Users see no indicator of how many AI calls they've made or have left.
4. **Model over-provisioning** — `analyze-labor` uses Sonnet at `max_tokens: 8192`. `extract-estimating-report`, `extract-gc-form`, `extract-specification` all use Sonnet at `8192`. Several tasks could use Haiku.
5. **Prompt verbosity** — Several system prompts are 300-600 word narratives that inflate input token costs every call.
6. **`useProGate` only handles 403** — It doesn't handle 429 (rate limit hit) — users see a silent failure today.

---

## Proposed Approach

### Phase 1 — Monthly Credit Limit (Backend)
Add a `monthly` window to the rate limit system alongside the existing per-minute window.

**Credit budget (proposed defaults):**
| Tier | Monthly AI Calls |
|---|---|
| Pro (bidshield) | 300 credits/month |
| Free | 0 (hard blocked at `requireProSubscription`) |

A "credit" = 1 AI API call, regardless of model. Simple and legible to users.

**Implementation:**
1. Add `checkMonthlyRateLimit(userId)` to `lib/rateLimit.ts` using a 30-day window.
2. Call it in every route immediately after the existing per-minute check, return `402 { error: "Monthly AI credit limit reached", creditsUsed: N, creditsLimit: 300 }`.
3. The monthly count piggybacks on the existing Convex `rateLimits` table — just pass `windowMs: 30 * 24 * 60 * 60 * 1000` and `limit: 300`.

**No schema changes required.** The `rateLimits` table already stores `(userId, action, timestamp)` — we just query a longer window.

---

### Phase 2 — Wire Up Usage Logging (Routes → DB)
Currently `logUsage` is never called. Routes need to return usage metadata so the client can log it — OR we log server-side in the route itself.

**Recommended: log server-side in each route** (simpler, no client change needed):
- After `client.messages.create(...)`, extract `message.usage.input_tokens` and `message.usage.output_tokens`.
- Call a Convex HTTP mutation at the end of each route to write to `bidshield_ai_usage`.
- This is fire-and-forget (don't await or let it block the response).

**OR (simpler short-term):** Return `{ ...data, _usage: { tokensIn, tokensOut, durationMs } }` from every route and have `useAiUsageLog` log it client-side. Less reliable (client might close before logging) but requires no server-side Convex client setup in routes.

**Recommended path:** Server-side logging via the existing `ConvexHttpClient` already used in `rateLimit.ts`.

---

### Phase 3 — Credit UI (Frontend)
Two surfaces:

**A. Credit counter in the dashboard header or sidebar**
- A small indicator: `🤖 142 / 300 credits used` 
- Pulls from `api.bidshield.getUsageStats` (already returns `totalCalls30d`).
- Updates reactively (Convex query = live).
- Location: top-right of the dashboard nav or the account/settings page.

**B. 429 handling in `useProGate`**
- Currently `guardedFetch` only catches 403 (upgrade wall). 
- Add 429 handling: show a "Credit limit reached" toast or modal variant.
- Extend `ProGateModal` to accept a `reason: "pro" | "credits"` prop, or create a lightweight `CreditLimitToast` component.

---

### Phase 4 — Model Right-sizing (Cost Reduction)
Audit of current model assignments vs. what each task actually needs:

| Route | Current | Recommended | Rationale |
|---|---|---|---|
| `analyze-labor` | Sonnet, 8192 | **Sonnet, 4096** | Outputs are structured JSON, rarely needs >2k output tokens |
| `extract-specification` | Sonnet, 8192 | **Sonnet, 6000** | PDF extraction legitimately needs Sonnet; cap output |
| `extract-gc-form` | Sonnet, 8192 | **Sonnet, 4096** | Form extraction; 8192 is headroom waste |
| `extract-estimating-report` | Haiku, 8192 | **Haiku, 4096** | Haiku correct; max_tokens too generous |
| `check-addendum-impact` (PDF path) | Sonnet, 4096 | ✅ correct | PDF needs Sonnet |
| `scan-spec-alignment` | Sonnet, 3000 | ✅ correct | PDF cross-reference needs Sonnet |
| `analyze-quote-scope` | Sonnet, 2048 | **Haiku, 2048** | Quote scope comparison is pattern matching, not reasoning |
| `flag-rfi-risks` | Haiku, 3000 | **Haiku, 2000** | Cap; rarely needs 3k output |
| `generate-submittal-checklist` | Haiku, 3000 | **Haiku, 2000** | List generation; 3k overkill |

**Estimated savings: ~25–35% on token costs** from model downgrades + max_token tightening alone.

---

### Phase 5 — Prompt Compression
Several system prompts repeat the same framing every call. Quick wins:

- `generate-exclusions`: ~500 word system prompt. Can be cut to ~200 words by removing examples (Haiku doesn't need hand-holding on format).
- `validate-exclusions`: ~400 word prompt. Trim to schema-driven list.
- `analyze-labor`: ~600 word prompt. Trim 30% by removing redundant construction-context preamble.

**Estimated savings: 15–25% on input tokens for these routes.**

---

## Implementation Order

```
Phase 1  → Monthly credit ceiling (1 file: lib/rateLimit.ts + update all routes)
Phase 2  → Server-side usage logging (lib/aiLogger.ts new helper + wire 21 routes)
Phase 3A → Credit counter UI (1 component + 1 Convex query already exists)
Phase 3B → 429 handling in useProGate (patch hooks/useProGate.tsx)
Phase 4  → Model right-sizing (grep + patch 5 routes)
Phase 5  → Prompt compression (patch 3 routes)
```

---

## Files That Will Change

| File | Change |
|---|---|
| `lib/rateLimit.ts` | Add `checkMonthlyRateLimit()` export |
| `lib/aiLogger.ts` | **New** — server-side Convex usage logger (fire-and-forget) |
| `app/api/bidshield/*/route.ts` (all 21) | Add monthly rate limit check + server-side usage logging |
| `hooks/useProGate.tsx` | Handle 402 (credit limit) alongside existing 403 |
| `components/AiCreditBadge.tsx` | **New** — live credit counter component |
| `app/bidshield/dashboard/layout.tsx` (or header) | Mount `<AiCreditBadge />` |
| 5 routes (model changes) | Drop Sonnet → Haiku or reduce max_tokens |
| 3 routes (prompt compression) | Trim system prompts |

---

## Key Decisions & Open Questions

1. **Credit unit** — 1 call = 1 credit? Or weight by model (Sonnet = 3 credits, Haiku = 1)? Weighted is more accurate to cost but confusing to users. **Recommendation: flat credits for now, upgrade to weighted later.**

2. **Credit limit** — 300/month feels right for a $249/mo product (10/day average). Too tight for heavy users? Could offer a "power user" tier or simply not enforce until launch.

3. **Rollover** — Credits reset on the calendar month or on the user's billing anniversary? **Recommendation: billing anniversary** (aligns with Stripe `currentPeriodEnd`).

4. **Where to show the counter** — Dashboard header? Account settings page only? **Recommendation: account settings + a subtle indicator in the dashboard sidebar.**

5. **Server-side vs. client-side logging** — Server-side is more reliable but requires a Convex HTTP client in each route (already used in `rateLimit.ts`). **Recommendation: extract into `lib/aiLogger.ts` and reuse.**

---

## Risks & Tradeoffs

| Risk | Mitigation |
|---|---|
| Monthly rate limit check adds ~50ms latency (Convex round-trip) | Acceptable; use same tier-fallback as existing rate limiter |
| Server-side logging is fire-and-forget — failures are silent | Log errors to console; non-critical path |
| Prompt compression degrades output quality | Test each trimmed prompt manually before shipping |
| Model downgrades on complex routes cause worse results | Only downgrade routes where task is pattern-matching, not reasoning |

---

## Success Metrics

- ✅ Every Pro user has a monthly credit ceiling enforced server-side
- ✅ 100% of AI calls are logged to `bidshield_ai_usage` with token counts
- ✅ Users can see credit usage in the UI without opening Convex dashboard
- ✅ 429 credit-limit responses surface a clear message (not silent failure)
- ✅ Token cost per user per month reduced ~30% through model/prompt optimization
