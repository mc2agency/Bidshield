# frontend-design — BidShield Design Spec

Skill: `frontend-design`. Subject: a bid-QA tool for **commercial roofing estimators**. Page job: convince an estimator this catches what they'd miss before the GC sees it. The direction is drawn from the estimator's own world — blueprints, takeoffs, Exhibit-A bid forms, addenda, redlines — so it can't be mistaken for a generic dark-SaaS template.

## Color (named tokens — source: `app/globals.css`)
Base surfaces (light): `--bg #F4F6FA`, `--surface #FFFFFF`. Base (dark): `--bg #0A1220`, `--surface #111B2E`. Sidebar is always navy `--navy-900 #0F2A47`.

**Accent discipline — one accent per meaning. This is the rule, not a suggestion:**
- **Green** `--pass #10B981` → pass / ready ONLY.
- **Hi-vis amber** `--bs-hivis #F59E0B` → warning / needs review.
- **Red / redline** `--bs-redline #DC2626` → blocker / gap caught.
- **Blue** `--bs-teal → --blue #2563EB` → primary action / info.
- **Blueprint blue** `--bs-grid-line` (sky, low alpha) → the drafting grid only.
Never use green as decoration. If a color isn't carrying one of these meanings, it shouldn't be there.

## Type (roles)
- **Display:** Barlow Condensed 600–800, uppercase, tight tracking — headlines and big numbers.
- **Body:** DM Sans 400–600.
- **Mono/data:** `--bs-font-mono` (Geist Mono) with `tabular-nums` — every measurement, %, SF, count, and the dimension annotations. Data must read like a takeoff sheet.

## Layout concept
Two-column hero: thesis copy left, a live app mockup right showing a real project (readiness %, phase checklist, the caught gap). Sections below stay quiet and disciplined so the signature carries.

## Signature (the one memorable thing)
The **blueprint / takeoff overlay**: a sky-blue drafting grid, mono **dimension runs** (`|—— 42,800 SF · FIELD AREA ——|`), a draftsman's **title block** (`DWG · BID-QA-18 · SCALE 1:1 · REV C`), and the **redline "GAP CAUGHT"** callout — a red ledger rule flagging exactly what BidShield catches. Reusable in product via `.bs-blueprint-grid`, `.bs-annotation`, `.bs-redline` / `.bs-redline-tag` (defined in `globals.css`).

Per the skill's "spend boldness in one place": the hero + redline are bold; everything else is restrained. Don't plaster the grid on every section.

## Applied so far
- Hero (`components/HomepageContent.tsx`): full blueprint grid, dimension run, title block, redline GAP CAUGHT, single-accent headline.
- App shell (`dashboard/layout.tsx`): `.bs-blueprint-grid` behind all authenticated screens.
- ValidatorTab: redline "Gap caught" tag on blocking items.

## To apply (rest of marketing)
`app/about, pricing, products, resources, tools, quiz, contact` — inherit tokens; hand-touch each hero/header to use the display+mono pairing and accent discipline. Keep sections quiet; reserve grid/redline for where they carry meaning. Reconcile font wiring in `app/layout.tsx` (tokens reference Geist + Barlow; marketing injects Barlow/DM Sans via `<style>` @import — consolidate to `next/font` in a later perf step).
