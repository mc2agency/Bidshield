# BidShield — AI-Powered Pre-Flight Checklist for Commercial Roofing Bids

## What This App Is

BidShield is a SaaS tool that helps commercial roofing contractors validate their bids before submission. A user uploads a project spec PDF, and the AI extracts materials, assemblies, manufacturers, deck types, attachment methods, and scope details. The app then builds a checklist, estimate, and document package — catching errors before they become costly mistakes.

**Owner:** MC2 Agency LLC (carlos@mc2agencyllc.com)

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Convex (real-time database, mutations, queries, actions, cron jobs)
- **Auth:** Clerk (user management, org support)
- **AI:** Anthropic Claude API (spec extraction, analysis)
- **Payments:** Stripe (subscriptions, webhooks)
- **Hosting:** Vercel
- **File Storage:** Convex file storage (spec PDFs, attachments)

---

## Project Structure

```
app/
  bidshield/
    dashboard/
      project/
        page.tsx              ← Main project page (5-view architecture)
        tab-types.ts          ← Tab type definitions
        tabs/
          SetupTab.tsx        ← Project setup + spec upload + "Apply Spec Data" logic
          ChecklistTab.tsx    ← Pre-bid checklist items
          EstimateTab.tsx     ← Wrapper: summary bar + sub-tabs (Recap, Takeoff, Materials, Labor, Gen Conds)
          DocumentsTab.tsx    ← Wrapper: sub-tabs (Scope, Quotes, Addenda, RFIs, Bid Quals)
          ValidatorTab.tsx    ← Validation + Decision Log
          MaterialsTab.tsx    ← Material list management + "Re-sync from Specs" button
          PricingTab.tsx      ← Bid recap / totals (sub-tab of Estimate, labeled "Recap")
          TakeoffTab.tsx      ← Quantity takeoffs
          LaborTab.tsx        ← Labor line items
          GeneralConditionsTab.tsx ← GC items
          ScopeTab.tsx        ← Scope documents
          QuotesTab.tsx       ← Subcontractor quotes
          AddendaTab.tsx      ← Addenda tracking
          RFIsTab.tsx         ← RFIs
          BidQualsTab.tsx     ← Bid qualifications
  api/
    bidshield/
      extract-specification/
        route.ts              ← AI spec extraction endpoint (Claude API)
      webhook/
        route.ts              ← Stripe webhook handler

convex/
  schema.ts                   ← Convex database schema
  bidshield/
    materials.ts              ← Material mutations (initProjectMaterials, syncTakeoffToMaterials, clearProjectMaterials)
    projects.ts               ← Project CRUD
    pricing.ts                ← Pricing queries/mutations
    labor.ts                  ← Labor queries/mutations
    generalConditions.ts      ← GC queries/mutations
    checklist.ts              ← Checklist logic
    validator.ts              ← Validation logic

lib/
  bidshield/
    material-templates.ts     ← Material template catalog (default pricing, calcTypes, units)
```

---

## Architecture: 5-View Layout

The app was restructured from 15 separate tabs into 5 clean workflow views:

| View | Tab ID | Contains |
|------|--------|----------|
| **Setup** | `setup` | Project info, spec upload, AI extraction, "Apply Spec Data" |
| **Checklist** | `checklist` | Pre-bid checklist items with status tracking |
| **Estimate** | `estimate` | Summary bar + sub-tabs: Recap, Takeoff, Materials, Labor, Gen. Conditions |
| **Documents** | `documents` | Sub-tabs: Scope, Quotes, Addenda, RFIs, Bid Quals |
| **Validate** | `validate` | Validator + Decision Log |

The main page (`project/page.tsx`) uses a `navigateTab` callback that maps legacy sub-tab IDs to their parent views.

---

## Critical Data Pipeline: Spec → Materials → Pricing

This is the core pipeline and where most bugs have occurred. Understand it well:

### 1. Spec Upload & AI Extraction
- User uploads PDF in SetupTab
- PDF sent to `/api/bidshield/extract-specification/route.ts`
- Claude API extracts structured JSON: materials, assemblies, deck types, attachment methods, manufacturers
- Result stored in `project.specSummary`

### 2. Material Initialization (SetupTab → "Apply Spec Data")
- Reads `project.specSummary`
- Detects deck type and attachment method from assemblies
- **Skips fastener materials** if system is adhered or deck is concrete
- For each spec material:
  - Extracts product name from `spec` field via regex (e.g., "Paradene 20TG" from spec description)
  - Falls back to generic `name` if no product name found
  - Fuzzy-matches against `material-templates.ts` to inherit pricing defaults (unitPrice, calcType, unit, qtyPerSf)
  - Creates material record in Convex
- Calls `clearProjectMaterials` first (fresh start)
- Calls `syncTakeoffToMaterials` after to compute quantities from takeoff data
- **NO template gap-fill** — only spec-extracted materials are added

### 3. Material Templates (`lib/bidshield/material-templates.ts`)
- Catalog of default materials with pricing, units, calcTypes
- `calcType` options: `coverage`, `qty_per_sf`, `linear_from_takeoff`, `count_from_takeoff`, `fixed`
- **Important:** `qtyPerSf` values are in PURCHASE UNITS per SF (boxes/SF, not individual items/SF)
  - Example: Fasteners come 500/box → qtyPerSf = 0.0005 (not 0.25)
- Templates are used for pricing inheritance only, not for adding materials to the list

### 4. Quantity Calculation (`syncTakeoffToMaterials`)
- Reads takeoff areas/quantities
- Applies calcType logic to compute material quantities
- Updates `quantity` and `totalCost` on each material record

### 5. Pricing Display
- **EstimateTab** summary bar: materialTotal + laborTotal + gcTotal = totalBid
- **PricingTab** (labeled "Recap"): full bid recap with all cost categories
- **MaterialsTab**: individual material costs with edit capability

---

## Known Patterns & Gotchas

### Product Name Extraction
The AI often puts product names in the `spec` field and generic descriptions in `name`:
```json
{"name": "SBS Modified Bitumen Base Ply", "spec": "Paradene 20TG, 80 mil thickness...", "manufacturer": "Siplast"}
```
Both SetupTab and MaterialsTab use this regex to extract the real name:
```typescript
const productName = mat.spec?.match(/^([A-Z][A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-\.]+){0,3})/)?.[1];
const baseName = productName && !productName.startsWith("ASTM") ? productName : mat.name;
```

### Fastener Filtering
Concrete decks and adhered membrane systems don't use mechanical fasteners:
```typescript
const skipFasteners = !isMechanicallyAttached || hasConcreteDeck;
```

### TypeScript Depth Errors
Convex types can hit TS2589 (type instantiation too deep). Use `@ts-ignore` when needed — this is a known Convex issue.

### Convex Mutations
Always define args in the mutation/query with Convex validators. The schema uses `v.string()`, `v.number()`, `v.optional()`, etc. Check `convex/schema.ts` for field types before writing mutations.

---

## What Was Just Completed (Sprint 11+)

1. Restructured 15 tabs → 5 workflow views
2. Fixed pricing showing $0 (materials had no unitPrice)
3. Renamed "Pricing" sub-tab → "Recap"
4. Made Materials tab show only spec-extracted materials (removed template gap-fill)
5. Fixed $1.8M fastener bug (500x quantity inflation from wrong unit conversion)
6. Added concrete deck / adhered system fastener filtering
7. Added "Re-sync from Specs" button on Materials tab
8. Updated AI prompt to extract actual product names
9. Added product name regex extraction from spec field (SetupTab + MaterialsTab)

---

## Next Feature: Auto-Fetch Product Datasheets for Submittals

### Goal
After spec extraction identifies materials with product names and manufacturers, automatically search for and download manufacturer datasheets (PDFs) and attach them as submittals.

### Approach
1. After spec extraction completes, loop through materials that have a product name + manufacturer
2. Web search for `"{product name}" datasheet site:{manufacturer}.com` (or filetype:pdf)
3. Download the PDF and store in Convex file storage
4. Create a submittal record linked to the project
5. Display in Documents tab under a new "Submittals" sub-tab

### Key Manufacturers to Handle
- Siplast (siplast.com) — Paradene, Teranap, Veral
- Carlisle (carlislesyntec.com)
- GAF (gaf.com)
- Johns Manville (jm.com)
- Firestone (firestonebpco.com)
- Tremco (tremcoinc.com)
- Soprema (soprema.us)

### Implementation Notes
- Start with a manual "Find Datasheets" button before making it automatic
- Need confidence check: verify downloaded PDF is actually a datasheet (file size, title match)
- Store the source URL for traceability
- Consider caching datasheets by product name to avoid repeated searches

---

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npx convex dev           # Start Convex dev server (run alongside npm run dev)

# Build & Deploy
npm run build            # Production build
npx convex deploy        # Deploy Convex functions

# Git
git push                 # Pushes to GitHub → auto-deploys to Vercel
```

---

## Environment Variables Needed

Check `.env.local` for:
- `CONVEX_DEPLOYMENT` — Convex project URL
- `NEXT_PUBLIC_CONVEX_URL` — Public Convex URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk auth
- `CLERK_SECRET_KEY` — Clerk server-side
- `ANTHROPIC_API_KEY` — Claude API for spec extraction
- `STRIPE_SECRET_KEY` — Stripe payments
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook verification
