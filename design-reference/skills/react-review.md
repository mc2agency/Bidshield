# vercel-react-best-practices — Review

Skill: `vercel-react-best-practices` (70 rules, 8 categories). Reviewed the heaviest screens: `project/page.tsx` (1682 lines), `dashboard/page.tsx` (1288), `ChecklistTab.tsx` (910), `ValidatorTab.tsx` (630).

## Findings + fixes

ValidatorTab.tsx:342 - `rerender-no-inline-components`: `StatusIcon` defined inside the component → re-created every render, breaking reconciliation. **Fixed:** hoisted to module scope (pure function of `s`).
dashboard/page.tsx:612 - static `IC` color map re-created every render inside `RecentActivityPanel`. **Fixed:** hoisted to module scope.

## Checked, acceptable / no change
- `project/page.tsx` already uses 6 `useMemo`/`useCallback`; `ChecklistTab` 16. Reasonable memoization for their size.
- No barrel/heavy imports (`@heroicons`/`recharts`) in these files; icons are local module-level components (good).
- No other inline component definitions found.

## Recommended (deferred — needs running app to verify safely)
- `rendering-content-visibility`: ChecklistTab renders 95+ items; add `content-visibility: auto` + `contain-intrinsic-size` to item rows for off-screen render skipping. Deferred to **Step 5** (per-row change, verify visually once auth-unblocked).
- `bundle-dynamic-imports`: consider `next/dynamic` for the heaviest tab components loaded behind the 5-phase nav (they're only needed when their phase is active). Candidate for **Step 8** (vercel-optimize, metric-backed).

## Verified
`tsc` clean except 2 pre-existing Convex `TS2589`; Vitest suite green.
