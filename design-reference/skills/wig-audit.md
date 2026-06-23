# web-design-guidelines — Audit

Skill: `web-design-guidelines` · Rules source: vercel-labs/web-interface-guidelines (fetched live).
Reviewed 2026-06-18 on branch `redesign/blueprint-system`. Format: `file:line - issue`.

## app/layout.tsx

app/layout.tsx:100 - `maximum-scale=1` disables pinch-zoom (a11y anti-pattern); remove it, keep `viewport-fit=cover`
app/layout.tsx:88 - no `color-scheme` for dark theme → wrong native scrollbar/inputs; set `color-scheme` to match `data-theme`
app/layout.tsx:94 - `theme-color` hardcoded `#059669` (emerald) doesn't match navy/light page bg; should track the theme

## components/EmailCapture.tsx

components/EmailCapture.tsx:108 - email `<input>` has no `<label>`/`aria-label` (placeholder ≠ label)
components/EmailCapture.tsx:108 - missing `autocomplete="email"`, `name`, `spellCheck={false}`, `inputMode="email"`
components/EmailCapture.tsx:108 - placeholder should end with `…` and is passed straight text
components/EmailCapture.tsx:98 - loading label `'Saving...'` should be `'Saving…'`
components/EmailCapture.tsx:117 - loading label `'Saving...'` should be `'Saving…'`
components/EmailCapture.tsx:120 - `transition-all` → list properties explicitly
components/EmailCapture.tsx:62 - success swap not announced; wrap in `aria-live="polite"`

## components/HomepageContent.tsx

components/HomepageContent.tsx:333 - hero `<h1>` should use `text-pretty`/`text-wrap:balance` to avoid widows
components/HomepageContent.tsx:349 - decorative play-icon `<svg>` in "See the live demo" link needs `aria-hidden="true"`
components/HomepageContent.tsx:37 - `HeroMockup` is purely decorative; wrap in `aria-hidden="true"` (its inner svgs/labels are noise to AT)
components/HomepageContent.tsx:288 - Google Fonts via CSS `@import` blocks render; prefer `<link rel="preconnect">` + `next/font` (perf)

## app/bidshield/dashboard/project/ProjectTabBar.tsx

ProjectTabBar.tsx:45 - `focus-visible:outline-none` removes focus ring with NO replacement (critical keyboard a11y)
ProjectTabBar.tsx:78 - `focus-visible:outline-none` removes focus ring with NO replacement (critical keyboard a11y)
ProjectTabBar.tsx:34 - tab state not reflected in URL (deep-link/refresh loses active tab) — query-param sync
ProjectTabBar.tsx:42 - phase tabs use raw `<button>`; add `role="tab"`/`aria-selected` for tablist semantics

## app/bidshield/dashboard/project/tabs/ChecklistTab.tsx

ChecklistTab.tsx:140 - placeholder `"Template name..."` → `"Template name…"`
ChecklistTab.tsx:149 - `"Saving..."` → `"Saving…"`
ChecklistTab.tsx:182 - busy label `"..."` → `"…"`
ChecklistTab.tsx:458 - `transition-all` → list properties explicitly
ChecklistTab.tsx:561 - `transition-all` on progress fill → use `transition-[width]`
ChecklistTab.tsx:703 - `transition-all` (and :712,:722,:729,:736) → list properties explicitly

## app/bidshield/dashboard/project/tabs/ValidatorTab.tsx

ValidatorTab.tsx:455 - "Fix →" / "Review →" (:476) are navigation but rendered as `<button>` w/ side-effect nav; acceptable, but ensure visible focus (inherits no outline removal here ✓)
ValidatorTab.tsx:581 - verify icon-only header buttons (:598,:615) carry `aria-label`

## Priority to fix now (highest a11y impact)
1. ProjectTabBar focus rings (45, 78) — keyboard users currently get no focus indicator.
2. layout viewport zoom (100) + color-scheme (88).
3. EmailCapture input semantics (108) + ellipses.
4. Ellipses + decorative `aria-hidden` across hero/checklist.
5. `transition-all` → explicit properties (animation rule).

---

## Resolution (fixed on this branch)
- ✅ ProjectTabBar:45,78 — replaced `focus-visible:outline-none` with `.focus-ring`; added `role="tablist"`/`role="tab"`/`aria-selected`; `transition-all`→`transition-colors`.
- ✅ layout.tsx:100 — removed `maximum-scale=1` (zoom restored). :88 — added `color-scheme: light/dark` per `data-theme` in globals.css.
- ✅ EmailCapture — both inputs: `sr-only` `<label>`, `name`, `autocomplete="email"`, `inputMode`, `spellCheck={false}`; `:focus`→`:focus-visible`; `transition-all`→`transition-[box-shadow,transform]`; `'Saving...'`→`'Saving…'`; success wrapped in `role="status" aria-live="polite"`; decorative check `aria-hidden`.
- ✅ HomepageContent — `<h1>` `text-pretty`; play-icon + whole `HeroMockup` `aria-hidden="true"`.
- ✅ ChecklistTab — `"Template name…"`, `"Saving…"`, `"…"` ellipses; progress `transition-[width]`; all other `transition-all`→`transition-colors`.
- ✅ ValidatorTab — header export buttons confirmed to carry visible text labels (not icon-only); loading already `"Generating PDF…"`. No change needed.

Verified: 752 Vitest tests pass; `tsc` clean except 2 pre-existing Convex `TS2589` deep-type errors (ChecklistTab:55, ValidatorTab:164) unrelated to these edits; homepage HTTP 200; email input now exposes accessible name "Email address".

## Deferred (tracked to later steps, larger scope)
- ProjectTabBar:34 — tab state → URL query param (deep-linking). → **Step 5** (app rollout) / `nuqs`.
- HomepageContent:288 — Google Fonts `@import` → `next/font` + preconnect (perf). → **Step 3** font reconcile / **Step 8** vercel-optimize.
- Decorative SVGs inside ValidatorTab status blocks could take `aria-hidden` (low priority cosmetic).
