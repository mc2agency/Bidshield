# BidShield Templates Feature Strategy Memo

**Date:** March 2026
**Subject:** Estimating Templates — Keeping Estimators on Platform
**Audience:** Product & Engineering Leadership

---

## Executive Summary

Commercial roofing estimators leave BidShield to do their actual cost math in Excel. They use our tool to organize projects and run QA checks, but the real estimating work — material takeoff calculations, labor pricing, margin formulas, bid comparison — happens in spreadsheets.

**The opportunity:** Build an in-app Templates feature that makes Excel unnecessary for the estimating phase. Competitors own takeoff (PlanSwift, STACK) or CRM (Bluebeam). Nobody owns the estimating math layer. We can claim that space and turn BidShield into a complete bid workflow.

**Bottom line:** An 8–12 week MVP that keeps estimators on-platform, feeds their estimates back into QA validation, and unlocks $49–$99/month add-on revenue.

---

## The Problem: The Excel Escape Hatch

Today's workflow looks like this:
- Estimator imports a project into BidShield, checks it against our QA checklist
- But to actually *estimate* the bid, they open Excel
- They build or pull up a spreadsheet with:
  - **Material quantity calculators** (square footage × waste factor → material cost)
  - **Labor hour estimators** (roofing system × crew productivity → labor cost)
  - **Pricing sheets** with built-in formulas (material cost + labor + overhead × markup = bid price)
  - **Bid comparison matrices** (compare quotes from suppliers, track historical pricing)
  - **Waste factor calculators** (TPO vs. shingles vs. metal all have different waste rates)
- They export the bid summary back into BidShield or email the spreadsheet
- We never see the math. The data never flows back through our QA validator.

**The cost:** Estimators don't experience BidShield as a complete solution. They use us as a checklist tool, not a workflow platform. High user friction = low retention, especially for mobile/field crews.

---

## Market Gap: Owning the Estimating Math

| Competitor | What They Own | What They Don't |
|---|---|---|
| **PlanSwift** | Takeoff (measurement from plans) | Estimating math, bid workflow, QA |
| **STACK (STACK Construction)** | CRM & pipeline mgmt | Takeoff, estimating, QA |
| **Bluebeam** | Plan markup & collaboration | Takeoff, estimating, CRM workflow |
| **BidShield (current)** | QA checklist, bid summary | Estimating math, templates, takeoff |
| **BidShield (with Templates)** | **Estimating math, templates, QA workflow** | Takeoff (and we don't need to) |

The estimating math layer is the gap. It's the hardest part for estimators to standardize, and it's where BidShield can deliver unique value.

---

## MVP Scope: 8–12 Weeks, Three Phases

### Phase 1: Pre-Built Template Library (Weeks 1–4)
**Goal:** Get estimators doing calculations inside BidShield, not Excel.

- Launch **10–15 read-only templates** for common roofing systems:
  - TPO (flat roof)
  - EPDM (flat roof alternative)
  - SBS Modified Bitumen
  - Metal standing seam
  - Asphalt shingles
  - Comp/dimensional shingles
  - Built-up roofing

- Each template includes:
  - **Material quantity calculator** (input square footage + waste %, get material costs by line item)
  - **Labor hour estimator** (roofing system + crew size + pitch difficulty → labor cost)
  - **Pricing sheet** (material cost + labor + overhead + contingency × company markup = final bid price)
  - Pre-filled industry benchmarks (waste factors, productivity rates, default markups by region)

- **User experience:** Estimator selects a template, plugs in square footage and crew info, sees a complete material + labor cost breakdown. Saves the estimate to the project.

- **No code complexity:** Read-only templates are simple to build and deploy.

### Phase 2: Editable Templates (Weeks 5–8)
**Goal:** Let estimators customize templates for their specific needs.

- Unlock template customization:
  - Copy a pre-built template, edit it for your company's rates
  - Adjust material costs, labor productivity, markup formulas
  - Save custom versions to your workspace
  - Reuse them across projects

- **Simple grid editor:** Not a full Excel clone. Think locked structure (rows can't be deleted) with editable cells. Built-in formula bar for basic math (cell references, SUM, ×, ÷).

- **Technical approach:** Use an open-source grid library (Univer or Handsontable) instead of building custom. These libraries provide Excel-like editing, formula support, and formatting out of the box, and integrate cleanly with React.

### Phase 3: Template Sharing & Marketplace (Weeks 9–12)
**Goal:** Enable network effects and new revenue streams.

- Publish templates:
  - Share a custom template with your team
  - Publish to a company-wide template library
  - Publish to a community marketplace (with pricing)

- **BidShield marketplace:** Estimators can find and buy specialized templates (regional pricing, niche systems, historical bid data).

- **Revenue model:** BidShield takes 20–30% cut, template creator takes remainder. Low operational overhead (we don't fulfill or support third-party templates).

---

## Technical Recommendation: Grid Library, Not Custom Engine

**Don't build a spreadsheet engine from scratch.** Use **Univer** (formerly Luckysheet) or **Handsontable**:

- **Pros:** Excel-like grid editing, formula support (SUM, AVERAGE, cell references), formatting, conditional rendering. Integrates with React. Both are open-source or affordable commercial licenses.
- **Cons:** Some learning curve for integration; requires cell-level permission models (read-only cells in Phase 1, editable cells in Phase 2).

This saves 4–6 weeks of custom engineering and reduces bugs. The tradeoff: we get 95% of the feature coverage at 50% of the development cost.

---

## Monetization: 4-Tier Model

| Tier | Cost | What's Included |
|---|---|---|
| **Standard (included in $249/mo)** | $0 | 5 basic pre-built templates (read-only) — material calculators and labor estimators for common systems. View and use with project data. |
| **Pro Templates** | +$49/mo | Full library of 50+ industry templates. Edit, customize, and save custom versions. Company template library. |
| **Template Builder** | +$99/mo | Build templates from scratch. Custom formulas, conditional logic, company branding. Share with team. Advanced formula bar. |
| **Marketplace Revenue** | 20–30% take | Estimators publish templates for sale. BidShield takes cut, creator gets remainder. |

**Rationale:**
- Free tier drives adoption (every $249 customer gets value immediately).
- $49/mo add-on targets estimators who customize frequently (likely 20–30% of users).
- $99/mo add-on targets power users and companies that build industry-specific templates.
- Marketplace is long-tail revenue; expect modest uptake in Year 1, but validates the ecosystem play.

---

## Retention Flywheel

Estimators who do their math inside BidShield have **no reason to export to Excel.** Here's the loop:

1. Estimator uses a template to calculate bid cost → estimate saved in BidShield
2. Estimate feeds into QA checklist → validator scores the bid
3. Validator surfaces risky assumptions (labor rates too low, waste factors inconsistent with history)
4. Estimator refines estimate inside BidShield → higher QA score
5. Estimator wins the bid → bid outcome feeds back into template database (historical accuracy)

**Result:** Templates become more accurate over time. Estimators trust the tool more. Harder to leave.

---

## Go-to-Market Recommendation

**Phase 1 strategy:**
1. **Launch as free value-add** to all $249 customers (no separate purchase).
2. **Seed with 10–15 best templates** for the most common roofing systems.
3. **Measure usage for 60 days:** Track which templates are used most, which roofing systems estimators are working on, how often they're returning to templates.

**Phase 2 strategy (after 60 days):**
- If >40% of active users have used at least one template:
  - Launch Phase 2 (editable templates) as the **$49/mo Pro Templates add-on**.
  - Announce Phase 3 (marketplace) as a future release.

- If <40% usage:
  - Gather feedback on missing templates or features.
  - Iterate on template design or onboarding before monetizing.

**Why this works:** We validate demand without overcommitting engineering. If estimators don't find templates valuable, we've learned that before investing in Phase 2. If they do, we have a clear 60-day runway to build the paid tier.

---

## Success Metrics (First 90 Days)

- **Adoption:** >40% of active users create at least one estimate using a template
- **Engagement:** Average 3+ templates used per paying customer per month
- **Retention:** 15–20% improvement in month-over-month churn for customers who use templates
- **NPS impact:** +5–10 point lift in NPS score among template users vs. non-users

---

## Recommendation

Approve Phase 1 (pre-built templates) as a **free feature in the standard $249 plan.** Target **12-week delivery** with Phase 2 (edit) and Phase 3 (marketplace) as backlog candidates based on Phase 1 performance.

This keeps estimators on platform, feeds estimate data back into our QA engine, and creates a new revenue tier ($49–$99/mo) that doesn't cannibalize existing customers.

**Next step:** Engineering feasibility review on grid library integration (1 week).
