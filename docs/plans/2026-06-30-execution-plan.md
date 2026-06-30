# BidShield — Execution Plan
**Updated:** June 30, 2026
**Goal:** Fix what's broken, then get paying users. In that order.
**North Star:** docs/PRODUCT_STRATEGY.md

---

## What We Know Now (From Research + Audit)

### The market gap is real
- No dedicated bid preflight tool exists for commercial roofing
- Estimators use The EDGE + Bluebeam + Excel — they don't need another estimating tool
- They need a QA gate AFTER estimating is done
- Single missed mechanical curb = $30K–$80K loss
- $31B/year in rework from scope gaps

### The core is solid
- 18-phase checklist is accurate and domain-specific
- `scan-spec-alignment` AI is architecturally correct
- `check-addendum-impact` is a direct research fit
- Readiness score + go/no-go gate is the right pattern

### What's broken or misaligned
- Invalid model ID breaks core AI for all Pro users (P0)
- Stripe bug means users can pay and not get Pro access (P0)
- Free tier blocks users after no_award status (P0)
- Onboarding emails silently failing (P0)
- Validator scoring penalizes checklist-only users (Architecture)
- Entry point requires re-entering data from The EDGE (Architecture)
- Frontend positioning still says "estimating tool" in places (Cleanup)

---

## Phase 1 — Fix What's Broken (Week 1–2)
*Nothing else matters until the app actually works.*

### P0 — Breaks the app right now
| Task | ID | Time |
|------|----|------|
| Fix invalid `claude-sonnet-4-6` model ID — breaks addendum AI + spec alignment | t_a6a5490a | 15 min |
| Fix Stripe idempotency — users pay, don't get Pro | t_3a4c3fd4 | 30 min |
| Fix `no_award` free tier blocker | t_a038cd4e | 15 min |
| Fix RESEND_API_KEY silent email failure | t_5e6b1ea5 | 30 min |
| Fix `extract-assemblies` max_tokens truncation | t_59b3d4c6 | 20 min |

### Architecture — App feels wrong to real users
| Task | ID | Time |
|------|----|------|
| Fix Validator scoring — remove estimating weight for checklist-only users | t_00d39041 | 1 hr |
| Move EDGE/Excel import to project creation step 1 | t_61b40908 | 2 hr |
| Deprecate estimating tables from readiness scoring | t_34830f4f | 1 hr |

### Frontend cleanup — App says wrong things
| Task | ID | Time |
|------|----|------|
| Fix About page — "as you build" → "after your bid is built" | t_3cfad422 | 15 min |
| Fix About page — assembly suggestion → assembly verification | t_390b751c | 15 min |
| Fix About page — "Input your takeoff" → audit language | t_81cf8e79 | 15 min |
| Fix Footer — "workflow tool" → "preflight tool" | t_ea79afa0 | 10 min |
| Fix Sign-up headline — "Start Building Today" is off-brand | t_44dad08a | 10 min |
| Add "works alongside The EDGE/Bluebeam" to homepage + About | t_22a44a99 | 20 min |
| Add dollar loss stat above fold on homepage | t_50345789 | 20 min |
| Rename phases 11-15 to Verification/Audit language | t_73da59fd | 20 min |

**Done when:** App works, Pro features work, new users get emails, checklist-only score is accurate.

---

## Phase 2 — Validate (Week 3–4)
*Get 5–10 real commercial roofing estimators using it on live bids.*

| Task | ID |
|------|----|
| Find 10 commercial roofing estimators (Reddit r/estimators, roofing associations, LinkedIn) | t_ac62c2e9 |
| Write outreach message — offer free access, ask for 30min feedback | t_277752d2 |
| Set up onboarding email sequence via Resend | t_ce03969b |
| Track signups — who completes a full review vs. drops off | t_b23001f1 |

**Done when:** 5 estimators have run a real bid through BidShield.

---

## Phase 3 — Listen & Fix (Week 5–6)
*Fix only what blocks real users. No new features.*

| Task | ID |
|------|----|
| Interview 5 users — what phase do they get stuck on? | t_ec3d1d32 |
| Fix top 3 friction points from user feedback | t_cf3fd9b7 |
| Verify AI addenda analysis works end-to-end on a real PDF | t_e6c824e8 |

**Done when:** Users can complete a full 18-phase review without hitting a wall.

---

## Phase 4 — Charge (Week 7–8)
*Convert at least 3 users to paid.*

| Task | ID |
|------|----|
| Test Stripe checkout end-to-end with a real transaction | t_e5347425 |
| Email free users — explain value, make the paid upgrade ask | t_4fc6a376 |
| Confirm pricing — free (1 project) vs Pro (unlimited) | t_7cb2e221 |

**Done when:** 3 paying customers.

---

## Hermes Automation
| Job | Schedule | Status |
|-----|----------|--------|
| Morning briefing with open kanban tasks | Daily 6am ET | ✅ Active |

---

## Rules
- Fix before sell — don't send users to a broken app
- Don't build new features until Phase 3 feedback
- Every task goes through kanban — nothing ad hoc
- Check `docs/PRODUCT_STRATEGY.md` before any code change
