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

## Deferred to Step 5 (needs auth)
- Lateral fade on `ProjectTabBar` phase/sub-tab switches (`default="none"` + bare fade — no directional slide, since tabs aren't hierarchical).
- Shared-element morph from a dashboard project row → project detail (pattern #1), once the app screens are reachable for verification.

## Note for Step 9
`experimental.viewTransition` is experimental — confirm `next build` succeeds before merging (dev verified; production build not yet run).
