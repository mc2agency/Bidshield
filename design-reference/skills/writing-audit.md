# writing-guidelines — Audit

Skill: `writing-guidelines` · Rules source: vercel-labs/writing-guidelines (fetched live).
Reviewed 2026-06-22 on branch `redesign/blueprint-system`. Scope: UI copy in 4 files (the doc-specific rules — meta.contentType, Steps, code blocks — don't apply to app UI).

## Findings

components/HomepageContent.tsx:361 - em dash as prose punctuation in hero body ("checklist — so nothing…") → comma
app/bidshield/dashboard/project/tabs/ChecklistTab.tsx:82 - error copy weak next step ("Please try again.") → name the fix

## Checked, no change needed
- **Banned words** (`easy/simple/quick/just/very/really`): none in user-facing copy (only matches were code comments).
- **Button labels** specific, not generic: "Request Early Access", "Save", "Apply", "Export Bid Summary PDF (draft)" — all pass (no bare "Continue"/"Submit").
- **Voice**: hero + features use active voice, second person, present tense. Pass.
- **Ellipses/quotes**: fixed in Step 1 (`Saving…`, `…`, `&apos;`/curly). Pass.
- **Em dashes in phase labels** (`Takeoff — Areas`, `Phase 10 — Addenda Review`): intentional naming convention synced with `project/tab-types.ts`; structural separator, not prose punctuation. **Left as-is** (changing would desync the data model and is a deliberate design choice).
- **Empty state** ChecklistTab:198 ("No templates yet. Save your current checklist to reuse it on future bids.") — invites action, pass.

## Resolution (fixed)
- ✅ HomepageContent:361 — em dash → comma.
- ✅ ChecklistTab:82 — "Failed to save template. Please try again." → "Couldn't save the template. Check your connection and try again." (acknowledge + concrete next step, troubleshooting tone).
