# BidShield — Agent Instructions

AI agent entry point for the BidShield codebase. Read this before making any changes.

## What BidShield Is

**BidShield is a bid preflight / QA tool for commercial roofing estimators.**
It is NOT an estimating platform. Read `docs/PRODUCT_STRATEGY.md` before adding any feature.

> "The last thing you do before a bid goes out."

The core product: an 18-phase, 135-item preflight checklist that catches scope gaps
before a commercial roofing bid is submitted.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Backend:** Convex (real-time DB + serverless functions)
- **Auth:** Clerk
- **Payments:** Stripe
- **AI:** Anthropic Claude (Haiku for text/analysis, Sonnet for PDF parsing)
- **Email:** Resend
- **Deployment:** Vercel (auto-deploys on push to `main`)

## Key Paths

```
app/                          Next.js app router
app/bidshield/dashboard/      Main app UI
app/bidshield/dashboard/project/page.tsx   Project detail + tab router
app/bidshield/dashboard/project/tabs/      Tab components
app/api/bidshield/            AI API routes
components/                   Shared components (Navigation, HomepageContent, etc.)
convex/                       Database schema + mutations/queries
lib/bidshield/                Shared logic (scoring, constants, roof systems)
docs/PRODUCT_STRATEGY.md      Product north star — read before adding features
docs/plans/                   Execution plans
```

## Architecture

### Tab System
The project UI has 5 phases:
1. **INTAKE** (`setup`) — project info, assembly recognition
2. **READ** (`documents`, `scope`, `addenda`, `rfis`, `quotes`) — spec review
3. **VERIFY** (`checklist`) — 18-phase, 135-item preflight checklist
4. **VALIDATE** (`validate`, `validator`, `decisions`, `bidquals`) — readiness scoring
5. **SUBMIT** (`submit`) — submission logging

Legacy estimating tab IDs (`estimate`, `takeoff`, `materials`, `pricing`, `labor`,
`generalconditions`) still exist as `TabId` types for backward compat but redirect
to `validate`. Do NOT re-add them to the UI.

### AI Routes
All AI routes follow this pattern:
```ts
// app/api/bidshield/<route>/route.ts
// 1. Auth check (Clerk)
// 2. Rate limit check
// 3. Pro subscription check
// 4. Zod input validation
// 5. Anthropic API call
// 6. Zod output validation
// 7. Return JSON
```
- Use `claude-haiku-4-5-20251001` for text/analysis routes (cost-efficient)
- Use `claude-sonnet-4-5-20251001` for PDF base64 parsing routes only
- Always check `res.ok` — never silently swallow errors

### Design Tokens
Always use CSS variables (`var(--bs-*)`), never hardcode colors:
```css
var(--bs-teal)        /* primary green */
var(--bs-bg-primary)  /* background */
var(--bs-text-muted)  /* muted text */
var(--bs-border)      /* borders */
```

## Conventions

### Git
- Branch naming: `fix/<description>`, `feat/<description>`, `docs/<description>`
- Commit format: `type: short description\n\nOptional body`
- Types: `fix:`, `feat:`, `refactor:`, `docs:`, `chore:`
- **Commit after every logical change. Push after every feature.**

### Code
- TypeScript strict — avoid `any` types
- All new tab components must use `useProGate()` for Pro feature gating
- All Convex queries must use `assertProjectOwnership()` server-side
- Use `get_hermes_home()` equivalent patterns — never hardcode paths

### Testing
```bash
npm test          # run vitest
npm run dev       # local dev server
npx convex dev    # run alongside npm dev for DB
```

## Before Adding Any Feature

Ask: **"Does this help a commercial roofing estimator catch a scope gap before submitting a bid?"**

If no — don't build it. Check `docs/PRODUCT_STRATEGY.md`.

## Current Priorities (as of June 2026)

See `docs/plans/2026-06-30-execution-plan.md` and the kanban board:
```bash
hermes kanban list
```

**Phase 1 — Clean Up (active):**
- Hide remaining estimating tabs from UI ✅ done
- Rewrite homepage copy ✅ done  
- Create AGENTS.md ← you are here
- Set up coding conventions
- Add Calendly booking link (owner action)

**Phase 2 — Get 10 real users on live bids**

## Do Not

- Add estimating features (takeoff math, material quantities, labor hours)
- Change the design system or color tokens without reading `docs/UIUX-GUIDE.md`
- Delete any database schema tables (deprecate, don't delete)
- Push directly to `main` without testing locally first
- Add new npm dependencies without clear justification
- Print API keys, tokens, or secrets to logs or responses
