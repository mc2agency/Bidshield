# composition-patterns + shadcn + TDD — Primitives

Skills: `vercel-composition-patterns` (component API design), `vercel:shadcn` (primitive conventions), `test-driven-development` (tests-first). Output: a token-driven primitive library so every screen stops re-inlining the same `style={{…}}`.

## Library: `components/ui/` (import via `@/components/ui`)
All wrap the existing `--bs-*` token system + `.bs-*` utility classes (no hardcoded colors → theme-correct by construction). `cn()` reused from `lib/bidshield/utils.ts`.

| Primitive | Wraps / API | Replaces inline pattern |
|---|---|---|
| `Button` | `.bs-btn*`; `variant: primary\|outline\|ghost` | every inline button style block |
| `Badge` | `.bs-badge*`; `tone: success\|hivis\|warning\|danger\|info` | phase/status badges |
| `Card` | `.bs-metric-card`; `blueprint?` adds drafting grid | card containers |
| `Stat` | Card + label + mono value + annotation hint | dashboard stat cards |
| `Alert` | `.bs-alert*` / `.bs-redline`; `tone` incl. `redline` | inline warning/blocker banners |
| `Progress` | `.bs-progress-*`; readiness-aware color by value | readiness/phase bars |
| `Pill` | `.bs-pill*`; categorical color | roof-type / revision pills |
| `Dialog` | fixed overlay; Esc + backdrop close; `role="dialog"` | hand-rolled modals |
| `Table` / `TableHeader` / `TableRow` | `.bs-table-*` | pipeline/data tables |
| `TabBar` | `.bs-nav-item*`; `role="tablist"`/`tab` | tab rows |

## Accent discipline baked in
`Button` defaults to primary=blue (action). `Badge`/`Alert` map `warning`→hi-vis amber, `redline`→gap-caught. `Progress` auto-colors green/amber/red by value. Consumers can't accidentally misuse green.

## TDD
`__tests__/ui-primitives.test.tsx` (jsdom via docblock; `@testing-library/react` + `jest-dom`) asserts variant→class mapping, a11y attributes (progressbar clamps + aria), and accent rules. **9 component tests; full suite 752 pass.** Vitest config extended to include `.tsx` + setup file; Node logic tests unaffected.

## Status
Library complete. **Rollout across the 44 app screens is Step 5** (gated on auth verification). Each screen swaps inline blocks → these primitives, verified by screenshot diff once auth is unblocked.
