# vercel-react-view-transitions — Applied

Skill: `vercel-react-view-transitions`. Pattern applied: **#5 Route change** ("going to a new place") — a crossfade between top-level pages, which is the verifiable case on localhost (the in-app phase-nav, pattern #3/lateral, is behind the Clerk auth wall and deferred to Step 5).

## Changes
- `next.config.ts` — enabled `experimental.viewTransition: true`.
- `app/layout.tsx` — `import { ViewTransition } from "react"`; wrapped `{children}` in `<ViewTransition>` so route changes animate. (Note: `unstable_ViewTransition` alias is `undefined` in this React build → use the bare `ViewTransition` export.)
- `app/globals.css` — added the reduced-motion guard from the skill's CSS recipe: `::view-transition-old/new/group(*) { animation: none !important }` inside the existing `prefers-reduced-motion: reduce` block.

## Verified
- Dev server boots with the flag (`✓ viewTransition`); `GET / 200`, `GET /about 200`.
- Home → About nav (Link click) succeeds with no "Element type is invalid" errors; crossfade active.
- `tsc` clean; 752 Vitest tests pass (run from project root).

## Step 5 — done
- **Lateral fade on phase/sub-tab switches (pattern #3).** `app/bidshield/dashboard/project/page.tsx`: wrapped the tab content panel in `<ViewTransition>` keyed by `activeTab`, and routed tab switches through `startTransition` (`navigateTab` + `openTab`) so each swap drives a crossfade. Bare fade, no directional slide — tabs aren't hierarchical. Callbacks annotated `(): void` to avoid `startTransition`'s async-action inference.
- Pre-existing `tsc` TS2589 on `useMutation(api.bidshield.updateProject)` (Convex generated-types depth) is unrelated — present on the clean tree before this change; `next build` is unaffected.

## Still deferred
- Shared-element morph from a dashboard project row → project detail (pattern #1), once verifiable.

## Note for Step 9 — resolved
`experimental.viewTransition` production build verified: `next build` succeeds (`✓ viewTransition`, `✓ Compiled successfully`, 108/108 pages). Safe to merge.
