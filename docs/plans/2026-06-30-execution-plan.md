# BidShield — Execution Plan
**Date:** June 30, 2026
**Goal:** Get from "app that exists" to "app that has paying users" in 60 days
**North Star:** docs/PRODUCT_STRATEGY.md

---

## The Gap We're Filling

Commercial roofing estimators use The EDGE + Bluebeam + Excel.
None of those tools have a pre-submission QA layer.
The only "tools" they have today are PDF checklists and sticky notes.
BidShield is the first purpose-built bid preflight tool for commercial roofing.

**We don't need to build more. We need to focus and sell.**

---

## Phase 1 — Clean Up (Week 1–2)
*Goal: Make the app match the product strategy. No new features.*

| Task | ID | Priority |
|------|----|----------|
| Hide estimating tabs from UI (EstimateTab, LaborTab, MaterialsTab, TakeoffTab, PricingTab, GeneralConditionsTab) | t_e484fe62 | 🔴 High |
| Rewrite homepage copy — position as QA/preflight, not estimating | t_9fd8e4be | 🔴 High |
| Add Calendly / booking link once account is created | t_aac4dc85 | 🟡 Medium |
| Set up git coding conventions and branch naming | t_48029d25 | 🟢 Low |
| Create project AGENTS.md for Hermes to work autonomously | t_21cf15e5 | 🟢 Low |

**Done when:** A roofing estimator lands on bidshield.co and immediately understands it's a bid QA tool, not estimating software.

---

## Phase 2 — Validate (Week 3–4)
*Goal: Get 5–10 real commercial roofing estimators using the app on live bids.*

| Task | Priority |
|------|----------|
| Find 10 commercial roofing estimators (LinkedIn, Reddit r/estimators, roofing associations) | 🔴 High |
| Reach out with a direct, honest message — offer free access, ask for 30 min feedback | 🔴 High |
| Set up a simple onboarding email sequence (Resend — already in stack) | 🟡 Medium |
| Track who signs up and follows through vs. drops off | 🟡 Medium |

**Done when:** 5 estimators have run at least one real bid through BidShield.

---

## Phase 3 — Listen & Fix (Week 5–6)
*Goal: Fix only what blocks real users. No feature additions.*

| Task | Priority |
|------|----------|
| Talk to the 5 users — what phase do they get stuck on? | 🔴 High |
| Fix the top 3 friction points they identify | 🔴 High |
| Verify AI addenda analysis works end-to-end on a real PDF | 🟡 Medium |
| Fix validator tab — make pass/fail per-rule visible | 🟡 Medium |
| Remove debug console.logs if any remain in production | 🟢 Low |

**Done when:** Users can complete a full 18-phase bid review without hitting a wall.

---

## Phase 4 — Charge (Week 7–8)
*Goal: Convert at least 3 users to paid.*

| Task | Priority |
|------|----------|
| Confirm Stripe checkout works end-to-end (test a real transaction) | 🔴 High |
| Email free users — explain the value, make the ask | 🔴 High |
| Set pricing anchor: free tier (1 project) vs. Pro ($X/month, unlimited) | 🟡 Medium |
| Create Calendly for demo calls (set up account first) | 🟡 Medium |

**Done when:** 3 paying customers. That's proof the problem is real.

---

## Hermes Automation Running in Background

| Job | Schedule | Status |
|-----|----------|--------|
| Morning briefing with open kanban tasks | Daily 6am ET | ✅ Active |
| (Future) Weekly outreach report | Weekly Monday | Pending |
| (Future) Monitor r/estimators for leads | Daily | Pending |

---

## What We Are NOT Doing

- ❌ Building new features before getting 10 users
- ❌ Adding more AI tools until core checklist is validated
- ❌ Redesigning the UI
- ❌ Building a mobile app
- ❌ Adding more estimating features

---

## Success Metrics

| Week | Target |
|------|--------|
| Week 2 | App focused — estimating tabs hidden, homepage rewritten |
| Week 4 | 5 real estimators using it on live bids |
| Week 6 | Users can complete full 18-phase review without blockers |
| Week 8 | 3 paying customers |

---

*Review this plan every Monday. If something isn't moving, cut it or simplify it.*
