# BidShield — Master Plan
**Created:** June 30, 2026
**Owner:** You
**Executor:** Hermes (autonomous) + You (decisions only)
**Goal:** Working app → paying users → $3K MRR

---

## The One-Line Strategy
> Fix what's broken. Position correctly. Get 10 real users. Charge money.

---

## What We Know

### The opportunity is real
- No dedicated bid preflight tool exists for commercial roofing — anywhere
- Estimators lose $30K–$400K per missed scope item
- They use The EDGE + Bluebeam + Excel — none have a QA gate
- Simple focused tools win (SafetyCulture $2.2B, Fieldwire $300M exit)

### The core is solid
- 18-phase checklist is accurate and domain-specific ✅
- AI spec alignment route is architecturally correct ✅
- AI addendum impact analysis is a direct research fit ✅
- Readiness score + go/no-go gate is the right pattern ✅

### What's broken or wrong
- Core AI features broken (invalid model ID) 🔴
- Users can pay and not get Pro (Stripe bug) 🔴
- Price shown as $149 in email, $249 in app (trust killer) 🔴
- Onboarding drops users with no explanation 🟠
- Validator scores checklist-only users as "not ready" 🟠
- App entry point requires re-entering data from The EDGE 🟠
- Frontend still says "estimating tool" in places 🟡

---

## The 4 Phases

---

### PHASE 1 — Make It Work (2 Weeks)
**Goal:** App works correctly, says the right things, new users understand it.
**Rule:** Nothing ships to users until Phase 1 is done.

#### Sprint 1A — Critical Bugs (~3 hours, Hermes autonomous)
*These break the app right now. Fix first, fix fast.*

| # | Task | ID | Time |
|---|------|----|------|
| 1 | Fix invalid `claude-sonnet-4-6` model ID → `claude-sonnet-4-5-20251001` in `check-addendum-impact` and `scan-spec-alignment` | t_a6a5490a | 15 min |
| 2 | Fix `$149/mo` in Day-12 email → `$249/mo` to match upgrade modal | NEW | 5 min |
| 3 | Fix Stripe idempotency — mark event processed AFTER Convex write, not before | t_3a4c3fd4 | 30 min |
| 4 | Fix `no_award` not excluded from free tier project limit | t_a038cd4e | 15 min |
| 5 | Fix `extract-assemblies` not checking `stop_reason === "max_tokens"` | t_59b3d4c6 | 20 min |
| 6 | Document `RESEND_API_KEY` must be set in both Vercel AND Convex | t_5e6b1ea5 | 15 min |

**Done when:** Core AI works, payments work, free tier works, price is consistent.

---

#### Sprint 1B — Onboarding (~2 hours, Hermes autonomous)
*First impression fixes. New users need to understand what they signed up for.*

| # | Task | ID | Time |
|---|------|----|------|
| 7 | Delete dead `OnboardingWizard.tsx` — or clearly mark as unused | NEW | 10 min |
| 8 | Add product explanation to `NewBidWizard` step 1 — one sentence: what BidShield is | NEW | 20 min |
| 9 | Fix silent project creation failure — show error if location missing | NEW | 20 min |
| 10 | Add "what to do next" card after first project is created | NEW | 30 min |
| 11 | Extend trial from 14 → 30 days (`TRIAL_PERIOD_DAYS` env var — one line) | NEW | 5 min |

**Done when:** A new user can sign up, understand what BidShield does, create a project, and know what to do next — without getting stuck.

---

#### Sprint 1C — Architecture (~4 hours, Hermes autonomous)
*App feels like the wrong product to a real estimator. Fix the core misalignments.*

| # | Task | ID | Time |
|---|------|----|------|
| 12 | Fix Validator scoring — checklist + scope + addenda = 100%. Remove materials/takeoff/pricing weight | t_00d39041 | 1 hr |
| 13 | Move EDGE/Excel/PDF import to project creation step 1 — importer already exists | t_61b40908 | 2 hr |
| 14 | Remove estimating tables (`materials`, `takeoff`) from readiness score calculation | t_34830f4f | 1 hr |

**Done when:** An estimator who only uses the checklist (not entering material pricing) gets an accurate readiness score. And they can start from their EDGE export, not blank fields.

---

#### Sprint 1D — Positioning (~2 hours, Hermes autonomous)
*App and site still say "estimating tool" in places. Fix the contradictions.*

| # | Task | ID | Time |
|---|------|----|------|
| 15 | Fix About page — "as you build your bid" → "after your bid is built" | t_3cfad422 | 15 min |
| 16 | Fix About page — Step 2 "suggests assemblies" → "verifies assemblies" | t_390b751c | 15 min |
| 17 | Fix About page — Step 4 "Input your takeoff" → audit/reconcile language | t_81cf8e79 | 15 min |
| 18 | Fix Footer — "workflow tool" → "preflight tool" sitewide | t_ea79afa0 | 10 min |
| 19 | Fix Sign-up headline — "Start Building Today" → "Run your first bid preflight" | t_44dad08a | 10 min |
| 20 | Add "works alongside The EDGE / Bluebeam / Excel" to homepage and About | t_22a44a99 | 20 min |
| 21 | Add dollar loss stat above the fold — "$30K–$80K on one missed mechanical curb" | t_50345789 | 20 min |
| 22 | Rename phases 11–15 from Takeoff/Pricing → Verification/Audit language on homepage | t_73da59fd | 20 min |

**Done when:** Someone who lands on bidshield.co immediately understands it's a QA/preflight tool that works alongside their existing tools — not a replacement.

---

### PHASE 2 — Get Real Users (Weeks 3–4)
**Goal:** 5–10 commercial roofing estimators using BidShield on live bids.
**Rule:** No new features. Talk to real people.

| # | Task | ID | Who |
|---|------|----|-----|
| 23 | Find 10 commercial roofing estimators — Reddit r/estimators, roofing associations, LinkedIn | t_ac62c2e9 | Hermes |
| 24 | Write outreach message — free access offer, 30-min feedback ask | t_277752d2 | Hermes drafts, you send |
| 25 | Verify onboarding email sequence fires correctly end-to-end | t_ce03969b | Hermes |
| 26 | Set up tracking — who signs up, who creates a project, who completes phase 1 | t_b23001f1 | Hermes |

**Done when:** 5 estimators have run a real bid through BidShield and you've talked to at least 3 of them.

---

### PHASE 3 — Fix What Real Users Hit (Weeks 5–6)
**Goal:** Remove every friction point that stops a user from completing their first review.
**Rule:** Fix only what real users report. Do not invent features.

| # | Task | ID | Who |
|---|------|----|-----|
| 27 | Interview 5 users — what phase do they get stuck on? | t_ec3d1d32 | You |
| 28 | Fix the top 3 friction points from user feedback | t_cf3fd9b7 | Hermes |
| 29 | Verify AI addenda analysis works end-to-end with a real roofing PDF | t_e6c824e8 | Hermes |
| 30 | Verify AI spec alignment works end-to-end with a real spec PDF | NEW | Hermes |

**Done when:** Users complete a full 18-phase review without hitting a wall.

---

### PHASE 4 — Charge Money (Weeks 7–8)
**Goal:** 3 paying customers. Proof the problem is real and people will pay.
**Rule:** Ask for money. Don't wait for people to upgrade on their own.

| # | Task | ID | Who |
|---|------|----|-----|
| 31 | Test Stripe checkout end-to-end with a real card | t_e5347425 | You |
| 32 | Decide on pricing — keep $249/mo or raise to $349/mo? | t_7cb2e221 | You |
| 33 | Add team tier to pricing page — 3 seats, $699/mo (B2B buying happens at team level) | NEW | Hermes |
| 34 | Email every free user personally — explain the value, make the ask | t_4fc6a376 | You |
| 35 | Remove Calendly from roadmap — self-serve tool, no demos needed | t_55b55670 | Done ✅ |

**Done when:** 3 paying customers.

---

## What Hermes Does Automatically

| Automation | Schedule | Status |
|-----------|----------|--------|
| Morning briefing — open kanban tasks, priorities for the day | Daily 6am ET | ✅ Live |
| (Phase 2) Monitor r/estimators for outreach opportunities | Daily | Pending |
| (Phase 2) Weekly signup and conversion report | Weekly Monday | Pending |

---

## Decisions That Need You (Not Hermes)

These require a human call. Everything else Hermes handles:

| Decision | When |
|----------|------|
| Raise price from $249 → $349/mo? | Before Phase 4 |
| Add team tier at $699/mo? | Before Phase 4 |
| Approve outreach messages before sending | Phase 2 |
| Do the user interviews | Phase 3 |
| Send the upgrade emails personally | Phase 4 |

---

## Success Metrics

| Milestone | Target Date | Signal |
|-----------|-------------|--------|
| App works end-to-end | Week 2 | All P0 bugs fixed, AI works, payments work |
| First 5 real users | Week 4 | 5 estimators complete a full review |
| First paying customer | Week 6 | 1 Pro subscription |
| 3 paying customers | Week 8 | $747–$1,047 MRR |
| Product-market fit signal | Week 12 | Users coming back on every new bid |

---

## What We Are NOT Doing

- ❌ Building new features before Phase 3 feedback
- ❌ Mobile app
- ❌ Redesigning the UI
- ❌ Adding estimating features
- ❌ Building a Calendly / demo flow (self-serve product)
- ❌ Competing with The EDGE or Bluebeam
- ❌ Adding more AI routes before existing ones are verified

---

## The North Star Test
Before any task, ask:
> *"Does this help a commercial roofing estimator catch a scope gap before submitting a bid?"*

If no → don't do it.
If yes → what phase does it belong in?
