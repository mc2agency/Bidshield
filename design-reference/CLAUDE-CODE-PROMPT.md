# BidShield Dashboard Redesign — Claude Code Instructions

## IMPORTANT: Read these skills first
Before writing ANY code, read these skill files:
- `.claude/skills/web-design-guidelines/SKILL.md`
- `.claude/skills/ui-ux-pro-max/SKILL.md`
- `.claude/skills/ckm-design-system/SKILL.md`

## Context
BidShield's landing page (bidshield.co) has a premium dark aesthetic — dark backgrounds (#13151a, #1a1d23), teal accent (#2dd4a8), bold typography, translucent status colors. But the dashboard app looks like a completely different product — light theme, bootstrap-style, generic spacing. We need to unify them.

## Tech stack
- Next.js v16, React 19
- Tailwind CSS v4 (no tailwind.config.js — uses PostCSS + globals.css)
- Icons: @heroicons/react and lucide-react
- State: Convex (useQuery/useMutation) + Clerk (auth)
- No component library (no shadcn/MUI)

## What to do

### Step 1: Update design tokens
Replace the existing BidShield theme variables in `app/globals.css` with the tokens from `design-reference/dark-theme-tokens.css`. Keep any non-theme CSS that already exists. The new tokens include:
- Dark backgrounds: --bs-bg-primary (#1a1d23), --bs-bg-secondary (#13151a), --bs-bg-card (#22252d)
- Teal accent: --bs-teal (#2dd4a8) with translucent variants
- Status colors: red, amber, blue — all with `-dim` translucent backgrounds
- Utility classes: .bs-nav-item, .bs-metric-card, .bs-badge, .bs-btn, etc.

### Step 2: Rewrite the sidebar/navigation
The sidebar should use:
- Background: var(--bs-bg-secondary)
- Grouped sections with uppercase labels (REVIEW, PRICING, DOCS)
- Active item: teal translucent background with teal border (.bs-nav-item-active)
- Count pills: translucent backgrounds matching status color
- Status dots: 6px circles for section completion
- Project card at top with progress bar

Look at `design-reference/overview-reference.html` for the exact sidebar layout.

### Step 3: Rewrite pages one at a time

**Overview (app/bidshield/dashboard/project/tabs/OverviewTab.tsx)**
- Dark card backgrounds (--bs-bg-card) with subtle borders
- Readiness ring: SVG donut chart, teal stroke, 81% centered
- Metric cards: 4-column grid, uppercase labels, large numbers
- Cost/SF card: teal border accent, teal value
- Action items: dark table with grid rows, amber dots + badges
- Section progress: horizontal bars with labels, color-coded by status
- Alert banner: translucent red background, left border accent

**Checklist (app/bidshield/dashboard/project/tabs/ChecklistTab.tsx)**
- Tab bar with underline active indicator
- Grouped checklist sections with thin progress bars
- Critical/Complete/RFI badges using translucent status colors
- Expandable sections with warning callouts
- Incomplete items with checkbox + optional badge

**Pricing (app/bidshield/pricing/page.tsx)**
- 5-column metric card grid (Total bid, Material, Labor, Gen conds, Cost/SF)
- Warning alert with amber left border
- Primary assembly + Bid health row (2-column grid)
- Bid health: 5-segment progress indicator
- Alternate pricing: dashed border empty state
- Info footer with teal links

### Critical rules
1. **DO NOT patch the existing code.** Rewrite the JSX and className props from scratch for each component. Keep all data bindings, useQuery calls, event handlers, and business logic intact.
2. **Use Tailwind classes** that map to the CSS variables. Example: `bg-[var(--bs-bg-card)]`, `text-[var(--bs-teal)]`, `border-[var(--bs-border)]`.
3. **No shadows.** Dark themes don't need box-shadows. Use borders for depth.
4. **Translucent status colors.** Never use solid red/amber/green backgrounds. Always use the `-dim` variants (12% opacity).
5. **Typography hierarchy:** Labels are 11px uppercase tracking-wide. Values are 24px font-medium. Body text is 13px.
6. **Spacing:** Use 10-12px gaps in sidebar, 28px padding in main content, 12px grid gaps between cards.
7. **Keep existing icons** from @heroicons/react and lucide-react — just make sure they're 16px in the sidebar, sized appropriately elsewhere.
8. **Test after each page.** Don't rewrite everything at once. Do globals.css → sidebar → Overview → verify → Checklist → verify → Pricing → verify.

## Reference files
The `design-reference/` folder contains HTML mockups of the exact target design:
- `overview-reference.html` — Overview page with sidebar
- `pricing-reference.html` — Pricing page
- `checklist-reference.html` — Checklist page
- `dark-theme-tokens.css` — Complete CSS tokens

Open each reference file in a browser to see exactly what the result should look like. Match it as closely as possible.
