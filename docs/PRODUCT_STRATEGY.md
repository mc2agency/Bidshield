# BidShield — Product Strategy
**Date:** June 30, 2026
**Status:** Active — North Star document

---

## What BidShield Is

> **BidShield is the last thing a commercial roofing estimator does before submitting a bid.**
> An 18-phase, 135-item preflight checklist that catches what estimating software misses.

This is not an estimating tool. Estimators already have The EDGE, Bluebeam, and Excel.
BidShield is the **QA gate** they run through after the estimate is done — before the number goes out the door.

**The analogy:** A pilot's preflight checklist. You don't fly the plane in the checklist app.
You confirm everything is ready before you commit.

---

## The Problem We Solve

Commercial roofing estimators lose money on scope gaps — items that were in the specs
but not on the drawings, trade boundary disputes nobody caught, addenda changes not
reflected in the final number.

### Real dollar losses from missed scope items:
- **$400K** — cover board excluded on a single project
- **$35K** — metal fascia/coping excluded by both roofer and metal sub on a $30M job
- **$750K** — 5% error on a $15M commercial project
- Errors & omissions = **#1 cause of construction disputes** for 6 of the last 9 years (Arcadis)
- **$31 billion/year** in U.S. rework from bad data (FMI)

### Why existing tools don't solve it:
| Tool | What It Does | What It Misses |
|------|-------------|----------------|
| The EDGE | Estimating, assemblies, pricing | No pre-submission QA module |
| Bluebeam | Plan markup, takeoff | No scope completeness checking |
| Excel | Pricing, bid assembly | Nothing |
| AccuLynx | CRM, proposals | No QA layer |

**No dedicated bid preflight tool exists for commercial roofing.** The market uses PDF
checklists and sticky notes. BidShield is the first purpose-built tool for this workflow.

---

## Who We Serve

**Primary user:** Commercial roofing estimator at a specialty subcontractor
- Company size: $2M–$50M annual revenue
- Bids: 5–20 commercial jobs per month
- Tools they use: The EDGE or Bluebeam + Excel
- Pain: Losing bids or losing margin from missed scope items

**They are NOT:**
- General contractors (different workflow, different tools)
- Residential roofers (different scale, different complexity)
- Someone who needs another estimating platform

---

## What Belongs in BidShield

### ✅ Core — Keep and polish
| Tab | Why It Belongs |
|-----|----------------|
| **Checklist** | The 18-phase, 135-item core product |
| **Setup** | Project info — scope, contract type, bid date |
| **Addenda** | Track addenda + AI scope impact analysis |
| **Scope** | Scope gap review and exclusions |
| **Validator** | Bid readiness score before submission |
| **Submission** | Final submission confirmation |
| **Overview** | Dashboard summary |
| **RFIs** | Track open RFIs that affect scope |
| **Documents** | Upload and reference plan sets/specs |
| **Pre-Bid Meetings** | Notes and action items |
| **Decision Log** | Document assumptions and decisions |

### ❌ Feature bloat — Hide or remove
| Tab | Why It Doesn't Belong |
|-----|----------------------|
| **EstimateTab** | Estimating — The EDGE does this |
| **LaborTab** | Estimating — The EDGE does this |
| **MaterialsTab** | Estimating — The EDGE does this |
| **TakeoffTab** | Takeoff — Bluebeam does this |
| **PricingTab** | Estimating — The EDGE does this |
| **GeneralConditionsTab** | Estimating line items — belongs in their estimating tool |

### 🤔 AI drawing analysis — Keep if it serves the checklist
AI that reads drawings is valuable **only** when it answers QA questions:
- *"AI found 14 penetrations on the plan — did you account for all 14?"* ✅ QA
- *"AI calculated your material quantities"* ❌ Estimating

---

## Competitive Landscape

| Tool | Category | Roofing-Specific | Pre-submission QA |
|------|----------|-----------------|-------------------|
| **BidShield** | Bid preflight/QA | ✅ Yes | ✅ Yes |
| Helonic | AI drawing review | ❌ General construction | Partial |
| TenderScope | Bid intelligence | ❌ General construction | Partial |
| Provision | Scope management | ❌ GC-focused | Partial |
| The EDGE | Estimating | ✅ Yes | ❌ No |
| Bluebeam | Takeoff/markup | ❌ No | ❌ No |

**BidShield is the only roofing-specific bid preflight tool.**

---

## Why Focused Tools Win

- **SafetyCulture** — started as a simple mobile checklist → $2.2B valuation
- **Fieldwire** — stayed focused on field tasks → $300M exit to Hilti
- **PlanGrid** — got acquired, became bloated → users abandoned it
- **Procore** — users use fewer than 1/3 of features; called "overkill for specialty subs"

The lesson: **solve one painful thing exceptionally well.**

---

## Immediate Priorities

1. **Strip estimating tabs** — hide EstimateTab, LaborTab, MaterialsTab, TakeoffTab, PricingTab, GeneralConditionsTab behind a feature flag
2. **Sharpen the homepage** — every word should say "QA tool" not "estimating platform"
3. **Get 10 real users** — commercial roofing estimators using it on live bids
4. **Talk to them** — find out what's missing from the checklist, not what new features to build
5. **Charge money** — if they pay, the problem is real

---

## What We Are NOT Building

- Another estimating platform
- A takeoff tool
- A CRM
- A project management suite
- Procore for roofing

---

*This document is the product north star. Before adding any feature, ask:
"Does this help a commercial roofing estimator catch a scope gap before submitting a bid?"
If no — don't build it.*
