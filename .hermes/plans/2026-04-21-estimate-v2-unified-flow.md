# Estimate V2 — Unified Spec-to-Estimate Flow

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace the fragmented spec → materials → takeoff sync UX with a single, guided, automatic flow that mirrors how a real estimator actually works a job.

**Architecture:** The core principle is *zero manual syncing*. When a spec is applied, materials populate automatically. When takeoff SF is entered, quantities recalculate automatically. The user is guided step-by-step with clear status at each stage. All duplicate sync buttons are consolidated or removed.

**Tech Stack:** Next.js 16, Convex (DB + mutations), React 19, TypeScript, Anthropic (AI extraction)

---

## Root Cause Summary (read before touching any file)

The current app was built feature-by-feature without a unified data flow. Here's what exists today and what's broken:

| Feature | What exists | What's broken |
|---|---|---|
| Spec AI extraction | `extract-specification` route → saves to `bidshield_project_specs` | Only returns JSON — doesn't auto-populate materials |
| Apply Spec (SetupTab) | `handleApplySpec` — does save materials | But it's buried behind a separate "Apply to Project" button after upload |
| Re-sync from Specs (MaterialsTab) | `handleResyncFromSpecs` — rebuilds materials from `getMergedMaterials` | Buried in materials tab, duplicate logic to handleApplySpec, confusing name |
| Sync to Materials (TakeoffTab) | `syncTakeoffToMaterials` mutation — pushes SF → quantities | Shown in wrong place, separate mental model from spec sync |
| Auto-recalc on SF change | `handleRecalculate` in MaterialsTab | Only runs on demand, not on save of takeoff |

**The fix:** Merge these into one coherent flow driven by three events:
1. Spec PDF uploaded + extracted → auto-apply materials (no extra button)
2. Takeoff SF saved → auto-recalculate quantities (no extra button)
3. AddendaTab spec extraction → merge into existing materials list (not replace)

---

## Phase 1 — Spec Upload Auto-Applies Materials

**Problem:** After uploading a spec and the AI extracts it, the user must click a separate "Apply to Project" button. This causes confusion — users think extraction = done.

**Fix:** Merge `handleApplySpec` into the upload handler so it runs automatically after extraction succeeds. Keep the spec preview (sections found, warranty, materials count) but remove the manual "Apply" button.

---

### Task 1: Merge apply into upload in SetupTab

**Objective:** After spec extraction succeeds, auto-run `handleApplySpec` logic inline — no separate button click required.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/SetupTab.tsx`

**Step 1:** Find the `handleExtractSpec` function (around line 330–424). After `setSpecMode("done")` and saving to `project_specs`, immediately call the apply logic.

**Step 2:** Move the `handleApplySpec` body into `handleExtractSpec`, executing it automatically after the spec is saved. Keep `specApplying` state so the UI shows "Applying..." while it runs.

**Step 3:** Change the success UI (currently shows "Apply to Project" button) to instead show a **read-only summary card**: `✓ Spec applied — N materials loaded, N takeoff sections created`. Add a small `Re-apply` link for edge cases.

**Step 4:** Remove the `handleApplySpec` function and the "Apply to Project" `<button>` from the JSX (around line 1000–1013).

**Key code change (conceptual):**
```tsx
// BEFORE (in handleExtractSpec, after setSpecMode("done")):
// User must click "Apply to Project" manually

// AFTER:
setSpecMode("done");
setSpecApplying(true);
try {
  await runApplyLogic(data); // inlined handleApplySpec body
} finally {
  setSpecApplying(false);
}
```

**Verify:** Upload a spec PDF → extraction runs → materials + takeoff sections appear automatically → no "Apply" button shown.

---

### Task 2: Update SetupTab spec status UI

**Objective:** Replace the "Apply to Project" button with a clear applied-state summary.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/SetupTab.tsx` (around line 1000–1050 in JSX)

**Step 1:** Find the `{specMode === "done" && specData && (` block in JSX.

**Step 2:** Replace the "Apply to Project" button with a green success banner showing:
- ✓ Spec applied
- N materials loaded
- N roof sections created
- Small "Re-apply" ghost button for corrections

**Step 3:** Add a `[appliedMaterialCount, setAppliedMaterialCount]` state that gets set during the apply logic so the banner can show accurate counts.

**Verify:** After spec upload, the Setup tab shows a green confirmation, no button to click.

---

## Phase 2 — Remove Duplicate Sync Buttons

**Problem:** "Sync to Materials" button in TakeoffTab and "Re-sync from Specs" in MaterialsTab are two different operations with confusing names. Users don't know which to use or when.

**Fix:**
- Remove "Sync to Materials" button from TakeoffTab entirely
- Auto-trigger `syncTakeoffToMaterials` mutation whenever takeoff sections are saved
- Remove "Re-sync from Specs" button from MaterialsTab header (keep only as fallback under an overflow/settings menu)

---

### Task 3: Auto-sync quantities when takeoff SF is saved

**Objective:** After any takeoff section SF is saved, automatically run `syncTakeoffToMaterials` in the background.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/TakeoffTab.tsx`

**Step 1:** Find `handleSaveControl` (around line 269) and `handleSaveEdit` (around line 298) — these are the two places where takeoff data is written to Convex.

**Step 2:** After each successful save, call `syncTakeoffToMaterials({ projectId, userId })` silently (no loading state shown to user — just fire-and-forget with a try/catch).

**Step 3:** Remove the entire "Sync to Materials" button block from the JSX (around line 538–560). Also remove `syncStatus`, `syncResult`, `handleSyncToMaterials` state/handlers since they're no longer needed.

**Key code change:**
```tsx
// In handleSaveControl, after successful save:
try {
  await syncTakeoffToMaterials({ projectId: projectId as Id<"bidshield_projects">, userId });
} catch { /* silent — quantities will sync next time */ }
```

**Verify:** Enter SF in a takeoff section, save → switch to Materials tab → quantities updated automatically.

---

### Task 4: Move "Re-sync from Specs" to overflow menu in MaterialsTab

**Objective:** Keep the re-sync capability for power users but don't surface it as a primary action.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/MaterialsTab.tsx`

**Step 1:** Find where `handleResyncFromSpecs` is called from a button in the JSX. Move it to a `⋯` overflow menu (kebab/ellipsis) in the Materials tab header, alongside other power-user actions like "Fix Categories" and "Clear All".

**Step 2:** Rename the button label from "Re-sync from Specs" to "Rebuild from Spec" so it's clearer.

**Step 3:** Add a tooltip: "Clears all materials and rebuilds the list from your uploaded spec PDFs."

**Verify:** Materials tab header is clean. The rebuild option is accessible via overflow menu.

---

## Phase 3 — Smart Empty State for Materials Tab

**Problem:** When materials are empty, users see a blank state with no guidance. They don't know they need to go to Setup first.

**Fix:** Add a contextual empty state that checks whether a spec has been uploaded and branches accordingly.

---

### Task 5: Add smart empty state to MaterialsTab

**Objective:** When `materials.length === 0`, show a state that guides the user based on whether a spec exists.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/MaterialsTab.tsx`

**Step 1:** Find the empty state render (when `materials.length === 0`). It currently shows a generic message.

**Step 2:** Replace it with a branching empty state:

```
IF no spec uploaded yet:
  → "No materials yet"
  → "Upload your spec PDF in Setup to auto-populate materials"
  → [Go to Setup] button (calls onNavigateTab("setup"))

IF spec exists but materials empty (shouldn't happen after Phase 1 but handle gracefully):
  → "Spec found — materials not yet loaded"
  → [Build from Spec] button (calls handleResyncFromSpecs)
```

**Step 3:** Use `mergedSpecMaterials` query to detect whether spec data exists.

**Verify:** New project with no spec → empty state shows "Go to Setup". Project with spec but no materials → shows "Build from Spec".

---

## Phase 4 — Addenda Spec Extraction Merges, Not Replaces

**Problem:** When a user uploads an addendum spec in AddendaTab, it currently saves the data to `bidshield_project_specs` but shows "N materials — Review in Materials tab." The user then goes to Materials and is confused about what changed.

**Fix:** After addendum spec extraction, auto-merge new materials into the existing list (deduplicated) and show an inline diff of what was added/changed.

---

### Task 6: Auto-merge addendum materials into project materials

**Objective:** After `extract-specification` succeeds in AddendaTab, call `getMergedMaterials` and sync any new materials not already in the project's materials list.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/AddendaTab.tsx`
- Read: `convex/bidshield/materials.ts` (to understand `initProjectMaterials` / `bulkSaveMaterialsFromExtraction`)

**Step 1:** In AddendaTab, after `addProjectSpec(...)` succeeds (around line 438–448), call a new Convex mutation `mergeSpecMaterials` that accepts `projectId + userId + specId` and adds only the *new* materials from that spec that don't already exist in `bidshield_project_materials` (match by `name`).

**Step 2:** Create `mergeSpecMaterials` mutation in `convex/bidshield/materials.ts`:
- Takes `projectId`, `userId`, `specId`
- Loads the `bidshield_project_specs` row by `specId`
- Parses `extractionJson.materials`
- For each material: check if a matching record exists by name in `bidshield_project_materials`
- If not found: insert it
- Returns `{ added: number, skipped: number }`

**Step 3:** Update AddendaTab success message to show: `"Added N new materials from addendum. Review in Materials tab."`

**Step 4:** Export `mergeSpecMaterials` from `convex/bidshield.ts`.

**Verify:** Upload an addendum with 2 new products → Materials tab shows those 2 products added without removing existing items.

---

## Phase 5 — TakeoffTab Guided Input UX

**Problem:** TakeoffTab shows raw SF input fields but gives no indication of what's missing or what the downstream effect is.

**Fix:** Add a lightweight status indicator showing: `N sections · Total SF · → Materials will recalculate on save`.

---

### Task 7: Add takeoff status bar

**Objective:** Show a summary row at the top of TakeoffTab: total sections, total SF, and a hint that saving updates materials.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/TakeoffTab.tsx`

**Step 1:** Find the TakeoffTab header/top JSX. Add a small stats row:
```
3 sections · 18,400 SF  ·  Quantities will update on save
```

**Step 2:** Remove the old sync result toast (`syncResult && syncResult.warnings.length > 0...`) since it's no longer needed after Task 3.

**Step 3:** If `totalSF === 0`, show a soft prompt: "Enter square footage for each section to calculate material quantities."

**Verify:** TakeoffTab shows totals. No sync button. Saving SF updates materials automatically.

---

## Phase 6 — Estimate Tab Summary Bar Completion

**Problem:** The EstimateTab summary bar at the top shows Materials, Labor, Gen. Conds totals — but the "Recap" sub-tab (PricingTab) is a separate click. Users don't always know the overall bid total is in "Recap."

**Fix:** Make the summary bar itself show the total bid amount prominently, with a clear label. Minor polish only — no architectural change.

---

### Task 8: Highlight total bid in EstimateTab summary bar

**Objective:** The EstimateTab summary bar already computes `totalBid` — just make it more visible.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/EstimateTab.tsx`

**Step 1:** Read EstimateTab lines 75–130 (the summary bar JSX). Find where `totalBid` is rendered.

**Step 2:** Make the total bid amount the visually dominant element in the summary bar (larger font, teal color, bold). Add label "Total Bid" clearly.

**Step 3:** Add a small "→ Recap" link next to the total that switches to the `pricing` sub-tab via `setActiveSubTab("pricing")`.

**Verify:** Estimate tab summary bar immediately communicates the total bid amount without requiring a sub-tab click.

---

---

## Phase 7 — Design: "Field Office" Visual Refresh

**Goal:** Make BidShield feel like a purpose-built trades tool, not a generic dark SaaS. Same dark theme, new depth, sharper typography, left sidebar shell.

---

### Task D1: Token refresh — colors, shadows, depth

**Objective:** Update `globals.css` design tokens to the "Field Office" palette — deeper teal, card shadows, monospace number support.

**Files:**
- Modify: `app/globals.css`

**Changes:**
1. Teal accent: `#2dd4a8` → `#00b896` (and update teal-hover to `#00cca8`)
2. Card shadow: currently `none` → `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`
3. Add new token: `--bs-font-mono: var(--font-geist-mono), 'Geist Mono', monospace;`
4. Add new utility class `.bs-num` → `font-family: var(--bs-font-mono); letter-spacing: -0.5px; font-variant-numeric: tabular-nums;`
5. Card bg subtle shift: `--bs-bg-card: #21242c` (slightly darker, more contrast vs elevated)
6. Add `--bs-shadow-card` to `.bs-metric-card` utility class

**Verify:** Load any tab — cards have visible depth, teal is richer, no layout breaks.

---

### Task D2: Font upgrade — add Geist Mono for numbers

**Objective:** Load Geist Mono font so `.bs-num` class works for dollar amounts and SF quantities.

**Files:**
- Modify: `app/layout.tsx`

**Changes:**
1. Import `GeistMono` from `'geist/font/mono'` (already in package.json as `geist` package — check first with `grep -r "geist" package.json`)
2. Add `GeistMono` variable `--font-geist-mono` alongside existing Inter setup
3. Add variable to body className

**Pitfall:** If `geist` package not installed, use `next/font/google` with `"Geist Mono"` instead.

**Verify:** `document.fonts` in browser console shows Geist Mono loaded.

---

### Task D3: Left sidebar app shell

**Objective:** Replace the top `ProjectTabBar` phase tabs with a permanent left sidebar showing all 5 phases + project metadata.

**Files:**
- Create: `app/bidshield/dashboard/project/AppSidebar.tsx`
- Modify: `app/bidshield/dashboard/project/page.tsx`

**AppSidebar.tsx spec:**
- Fixed 220px wide, full-height, `--bs-bg-secondary` background
- Top section: project name (truncated), bid date countdown, readiness score as a small circular progress
- Phase list: 5 phases, each showing icon + label + completion % pill
- Active phase: teal left border + teal text
- Each phase clickable → calls `onTabChange(phase.defaultTab)`
- Bottom: "← Back to Dashboard" link
- No sub-tabs in sidebar — those stay as a secondary row inside the content area when that phase is active

**page.tsx changes:**
- Wrap current layout in a flex row: `<AppSidebar /> <main className="flex-1 min-w-0">`
- Remove `ProjectTabBar` from the top-of-content position OR keep it as sub-tab row only (not phase row)
- Pass `phaseStatuses`, `activeTab`, `onTabChange`, `project` to AppSidebar

**Verify:** All 5 phases visible in sidebar, clicking navigates correctly, content area fills remaining width.

---

### Task D4: Apply `.bs-num` to all dollar/SF values

**Objective:** All dollar amounts and square footage numbers use Geist Mono via `.bs-num` class.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/PricingTab.tsx`
- Modify: `app/bidshield/dashboard/project/tabs/MaterialsTab.tsx`
- Modify: `app/bidshield/dashboard/project/tabs/EstimateTab.tsx`

**Changes:** Find all `fmtDollar(...)` render sites and `${totalSF}` / SF quantity renders — wrap the value span with `className="bs-num"`. Do NOT change any logic, only add the class to the display element.

**Verify:** Dollar amounts in Recap tab render in Geist Mono. Numbers are visually distinct from labels.

---

## Cleanup Tasks

### Task 9: Remove dead state and console.log debug statements

**Objective:** Remove leftover debug code from the sync refactor.

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/MaterialsTab.tsx`
- Modify: `app/bidshield/dashboard/project/tabs/TakeoffTab.tsx`

**Step 1:** In MaterialsTab, remove all `console.log("[Re-sync DEBUG]` and `console.log("[Re-sync]"` statements (lines ~710–800).

**Step 2:** In TakeoffTab, remove `syncStatus`, `syncResult`, `setSyncStatus`, `setSyncResult`, `handleSyncToMaterials` — all dead after Task 3.

**Step 3:** Run `tsc --noEmit` from `/opt/hermes/Bidshield` to confirm no TypeScript errors.

**Verify:** Clean console in production. No unused state.

---

### Task 10: Commit + deploy

**Files:** All modified files above.

```bash
cd /opt/hermes/Bidshield
npx tsc --noEmit
git add -A
git commit -m "feat: estimate v2 — unified spec-to-estimate flow, auto-sync, remove manual buttons"
git push origin main
```

**Verify:** Vercel build passes. No TypeScript errors.

---

## What This Delivers

| Before | After |
|---|---|
| Upload spec → click "Apply to Project" | Upload spec → materials auto-populate |
| "Sync to Materials" button in Takeoff | Takeoff saves → materials update automatically |
| "Re-sync from Specs" as primary action | Buried in overflow menu as power-user fallback |
| Addendum extraction = just saves JSON | Addendum extraction = merges new materials in |
| Empty materials with no guidance | Smart empty state pointing to Setup |
| Total bid buried in "Recap" sub-tab | Total bid visible in Estimate summary bar |

**End result:** A user uploads their spec, the estimate builds itself. They enter takeoff SF, quantities update. They add an addendum, new materials merge in. Zero manual sync steps.
