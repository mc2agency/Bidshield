# BidShield — Claude Code Context

## What This App Is
BidShield is a **bid preflight / QA tool for commercial roofing estimators.**
It is NOT an estimating platform.

> "The last thing you do before a bid goes out."

Core product: 18-phase, 135-item preflight checklist that catches scope gaps
before a commercial roofing bid is submitted.

## Stack
- Next.js 16 (App Router) + TypeScript
- Convex (real-time DB + serverless functions)
- Clerk (auth)
- Stripe (payments)
- Anthropic Claude — Haiku for text/analysis, Sonnet for PDF parsing
- Resend (email)
- Vercel (auto-deploys on push to `main`)

## Key Paths
```
app/bidshield/dashboard/project/page.tsx     Main project UI + tab router
app/bidshield/dashboard/project/tabs/        Tab components (ChecklistTab, etc.)
app/bidshield/dashboard/project/tab-types.ts Phase + tab definitions
app/api/bidshield/                           AI API routes (28 routes)
components/                                  Shared UI (Navigation, HomepageContent)
convex/schema.ts                             Database schema
convex/bidshield/                            Mutations + queries
convex/bidshieldDefaults.ts                  18-phase checklist content
lib/bidshield/                               Shared logic (scoring, constants)
docs/PRODUCT_STRATEGY.md                     North star — read before adding features
docs/plans/MASTER-PLAN.md                    Current execution plan
```

## AI Route Rules
- `claude-haiku-4-5-20251001` — all text/analysis routes (cheap)
- `claude-sonnet-4-5-20251001` — PDF base64 parsing only (complex)
- Never use `claude-sonnet-4-6` — invalid model ID
- Always check `res.ok` and `stop_reason === "max_tokens"`
- Always check rate limit + Pro subscription before AI calls

## Design System
- Always use `var(--bs-*)` CSS tokens — never hardcode colors
- `var(--bs-teal)` primary, `var(--bs-bg-primary)` bg, `var(--bs-border)` borders

## Git Conventions
- Branch: `fix/<description>` or `feat/<description>`
- Commit: `fix: short description` or `feat: short description`
- Commit after every logical change

## Tab Architecture
5 phases visible in UI:
1. INTAKE (`setup`)
2. READ (`documents`, `scope`, `addenda`, `rfis`, `quotes`)
3. VERIFY (`checklist`)
4. VALIDATE (`validate`, `validator`, `decisions`, `bidquals`)
5. SUBMIT (`submit`)

Legacy estimating tab IDs exist in `TabId` type but redirect to `validate`.
Do NOT re-add EstimateTab, LaborTab, MaterialsTab, TakeoffTab, PricingTab, GeneralConditionsTab to the UI.

## North Star Rule
Before any change ask:
> "Does this help a commercial roofing estimator catch a scope gap before submitting a bid?"

If no — don't build it.

## Current Sprint (Phase 1A — In Progress)
Remaining tasks from the master plan:

### Still needs fixing:
- [ ] Fix Stripe idempotency bug — `app/api/bidshield/webhook/route.ts`
  Event is marked processed BEFORE Convex write completes.
  Fix: move `isWebhookEventProcessed` insert to AFTER successful Convex mutation.

- [ ] Verify RESEND_API_KEY set in both Vercel env AND Convex dashboard env vars
  If only set in Vercel, all onboarding emails silently fail.
  (This is a Vercel/Convex dashboard config check, not a code change)

### Phase 1B — Onboarding (next):
- [ ] Delete or clearly mark dead `OnboardingWizard.tsx` as unused
- [ ] Add product explanation to `NewBidWizard` step 1
- [ ] Fix silent project creation failure — show error if create fails
- [ ] Add "what to do next" after first project created
- [ ] Extend trial from 14 → 30 days (change `TRIAL_PERIOD_DAYS` env var)

### Phase 1C — Architecture (next):
- [ ] Fix Validator scoring — remove materials/takeoff/pricing weight for checklist-only users
- [ ] Move EDGE/Excel import to project creation step 1
- [ ] Remove estimating tables from readiness score calculation

### Phase 1D — Positioning (next):
- [ ] About page: "as you build your bid" → "after your bid is built"
- [ ] About page: Step 2 "suggests assemblies" → "verifies assemblies"
- [ ] About page: Step 4 "Input your takeoff" → audit language
- [ ] Footer: "workflow tool" → "preflight tool"
- [ ] Sign-up headline: "Start Building Today" → "Run your first bid preflight"
- [ ] Homepage: Add "works alongside The EDGE/Bluebeam/Excel"
- [ ] Homepage: Add dollar loss stat above fold ($30K-$80K missed mechanical curb)
- [ ] Homepage: Rename phases 11-15 from Takeoff/Pricing to Verification/Audit

## Already Fixed (Sprint 1A)
- ✅ Invalid model ID `claude-sonnet-4-6` → `claude-sonnet-4-5-20251001` (6 routes)
- ✅ Price mismatch $149 → $249 in Day-12 onboarding email
- ✅ Free tier `no_award` status not excluded from project limit (projects.ts + users.ts)
- ✅ extract-assemblies max_tokens 2048 → 4096 + stop_reason check added
- ✅ Waitlist gate removed — CTAs point to /sign-up
- ✅ EstimateTab removed from UI render
- ✅ Homepage copy updated — "Now Open", "Start Free Trial"
- ✅ PricingCards 134 → 135 item count

## Do Not
- Add estimating features
- Hardcode colors (use `var(--bs-*)`)
- Delete database schema tables (deprecate only)
- Push directly to `main` without testing
- Add new npm dependencies without clear justification
- Print API keys or secrets to logs
