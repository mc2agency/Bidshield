# V2 Assembly Engine — Implementation Plan

> **Goal:** Build a parallel V2 assembly extraction + review pipeline inside the existing Convex app,
> without touching legacy code. First milestone: upload Steinway sheet → see all 6 roofs classified correctly.

## Architecture

```
PDF upload
  → POST /api/bidshield/v2/extract-assemblies-v2
      → Claude AI extracts raw assemblies (label + layers + surface)
      → Layer normalization (existing normalizeLayers)
      → Archetype scoring (NEW: scoreLayersForArchetype)
      → Convex mutation: createExtractionRun + createExtractionItems
  → /bidshield/dashboard/v2/review/[runId]
      → reads assemblyExtractionItems directly
      → renders sections from item's snapshot, NOT legacy config
      → approve / reject per item
      → approved items → bidshield_projectAssemblyPresets
```

**Tech stack:** Next.js API route, Convex mutations/queries, existing layer-normalization.ts,
new archetype-scoring.ts, new Convex tables.

**Key rule:** The V2 engine never reads ROOF_SYSTEM_CONFIGS, systemType, or legacy form configs.
All section visibility comes from the item's own snapshot fields.

---

## Task 1 — Convex schema: two new tables

**Files:** `convex/schema.ts`

Add after `bidshield_customAssemblyDrafts`:

```typescript
// ── V2 Assembly Extraction Runs ──
bidshield_assemblyExtractionRuns: defineTable({
  projectId: v.id("bidshield_projects"),
  userId: v.string(),
  sourceFileName: v.string(),
  sourceFileId: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("complete"),
    v.literal("failed"),
  ),
  extractedCount: v.number(),
  needsReviewCount: v.number(),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_projectId", ["projectId"])
  .index("by_userId", ["userId"])
  .index("by_status", ["status"]),

// ── V2 Assembly Extraction Items ──
bidshield_assemblyExtractionItems: defineTable({
  runId: v.id("bidshield_assemblyExtractionRuns"),
  projectId: v.id("bidshield_projects"),
  userId: v.string(),

  // From drawing
  drawingAssemblyId: v.string(),         // "ROOF 01", "ROOF 05"
  displayName: v.optional(v.string()),   // from drawing schedule
  sourceSheet: v.optional(v.string()),
  sourceDetail: v.optional(v.string()),

  // Raw AI extraction
  originalExtractedText: v.array(v.string()),
  extractedLayers: v.array(v.string()),

  // Normalization
  normalizedLayerTokens: v.array(v.string()),

  // Classification
  archetypeId: v.string(),
  archetypeVersion: v.number(),
  confidence: v.number(),               // 0.0 – 1.0
  needsReview: v.boolean(),

  // Full audit trail
  classificationAudit: v.object({
    scoringBreakdown: v.object({
      layerScore: v.number(),
      drainageMatScore: v.number(),
      filterFabricScore: v.number(),
      keywordScore: v.number(),
      totalScore: v.number(),
    }),
    matchedLayers: v.array(v.string()),
    rejectedLayers: v.array(v.string()),
    matchedKeywords: v.array(v.string()),
    attemptedArchetypes: v.array(v.object({
      archetypeId: v.string(),
      score: v.number(),
      reason: v.string(),
      disqualified: v.boolean(),
    })),
    normalizedLayerTokens: v.array(v.string()),
    unmatchedLayers: v.array(v.string()),
    normalizationConfidence: v.array(v.number()),
    timestamp: v.number(),
  }),

  // Section values the user will fill in
  sectionValues: v.any(),

  // Snapshots from archetype at extraction time (immutable once created)
  requiredSectionsSnapshot: v.array(v.string()),
  optionalSectionsSnapshot: v.array(v.string()),
  hiddenSectionsSnapshot: v.array(v.string()),
  defaultLayerOrderSnapshot: v.array(v.string()),

  // Workflow
  status: v.union(
    v.literal("draft"),
    v.literal("approved"),
    v.literal("rejected"),
  ),

  // Legacy metadata only — NOT used as form authority
  legacySystemId: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_runId", ["runId"])
  .index("by_projectId", ["projectId"])
  .index("by_userId", ["userId"])
  .index("by_status", ["status"])
  .index("by_run_and_status", ["runId", "status"]),
```

**Verify:** `npx tsc --noEmit` — zero errors

---

## Task 2 — Convex: extraction run + item mutations/queries

**File:** `convex/bidshield/extractionV2.ts`

```typescript
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const getRun = query({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db.get(runId);
  },
});

export const listRunsForProject = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_assemblyExtractionRuns")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const getItemsForRun = query({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("bidshield_assemblyExtractionItems")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect();
  },
});

// ── Mutations ──

export const createRun = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    sourceFileName: v.string(),
    sourceFileId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const runId = await ctx.db.insert("bidshield_assemblyExtractionRuns", {
      ...args,
      status: "processing",
      extractedCount: 0,
      needsReviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { runId };
  },
});

export const createItem = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    drawingAssemblyId: v.string(),
    displayName: v.optional(v.string()),
    sourceSheet: v.optional(v.string()),
    sourceDetail: v.optional(v.string()),
    originalExtractedText: v.array(v.string()),
    extractedLayers: v.array(v.string()),
    normalizedLayerTokens: v.array(v.string()),
    archetypeId: v.string(),
    archetypeVersion: v.number(),
    confidence: v.number(),
    needsReview: v.boolean(),
    classificationAudit: v.any(),
    sectionValues: v.any(),
    requiredSectionsSnapshot: v.array(v.string()),
    optionalSectionsSnapshot: v.array(v.string()),
    hiddenSectionsSnapshot: v.array(v.string()),
    defaultLayerOrderSnapshot: v.array(v.string()),
    legacySystemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const itemId = await ctx.db.insert("bidshield_assemblyExtractionItems", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    return { itemId };
  },
});

export const completeRun = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    extractedCount: v.number(),
    needsReviewCount: v.number(),
  },
  handler: async (ctx, { runId, extractedCount, needsReviewCount }) => {
    await ctx.db.patch(runId, {
      status: "complete",
      extractedCount,
      needsReviewCount,
      updatedAt: Date.now(),
    });
  },
});

export const failRun = mutation({
  args: {
    runId: v.id("bidshield_assemblyExtractionRuns"),
    errorMessage: v.string(),
  },
  handler: async (ctx, { runId, errorMessage }) => {
    await ctx.db.patch(runId, {
      status: "failed",
      errorMessage,
      updatedAt: Date.now(),
    });
  },
});

export const updateItemStatus = mutation({
  args: {
    itemId: v.id("bidshield_assemblyExtractionItems"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("draft")),
  },
  handler: async (ctx, { itemId, status }) => {
    await ctx.db.patch(itemId, { status, updatedAt: Date.now() });
  },
});

export const approveAllItems = mutation({
  args: { runId: v.id("bidshield_assemblyExtractionRuns") },
  handler: async (ctx, { runId }) => {
    const items = await ctx.db
      .query("bidshield_assemblyExtractionItems")
      .withIndex("by_runId", (q) => q.eq("runId", runId))
      .collect();
    const now = Date.now();
    for (const item of items) {
      if (item.status === "draft") {
        await ctx.db.patch(item._id, { status: "approved", updatedAt: now });
      }
    }
    return { approved: items.filter((i) => i.status === "draft").length };
  },
});
```

Also add exports to `convex/bidshield.ts` barrel — append:
```typescript
// V2 Assembly Engine
export {
  getRun as getExtractionRunV2,
  listRunsForProject as listExtractionRunsV2,
  getItemsForRun as getExtractionItemsV2,
  createRun as createExtractionRunV2,
  createItem as createExtractionItemV2,
  completeRun as completeExtractionRunV2,
  failRun as failExtractionRunV2,
  updateItemStatus as updateExtractionItemStatusV2,
  approveAllItems as approveAllExtractionItemsV2,
} from "./bidshield/extractionV2";
```

**Verify:** `npx tsc --noEmit`, then `CONVEX_DEPLOY_KEY=... npx convex deploy --yes`

---

## Task 3 — Archetype scoring engine

**File:** `lib/bidshield/archetype-scoring.ts`

This is the core of V2 — no binary IRMA flags, no legacy system strings.
Scores each archetype against normalized tokens and returns ranked candidates.

```typescript
import { normalizeLayers, type CanonicalLayerToken } from "./layer-normalization";
import { ARCHETYPE_FORM_SCHEMAS } from "./archetype-form-bridge";

export interface ScoringResult {
  archetypeId: string;
  archetypeVersion: number;
  score: number;           // 0–100
  confidence: number;      // 0.0–1.0
  needsReview: boolean;
  disqualified: boolean;
  disqualifyReason?: string;
  matchedLayers: string[];
  rejectedLayers: string[];
  matchedKeywords: string[];
  breakdown: {
    layerScore: number;    // 0–60
    drainageMatScore: number;  // 0–15
    filterFabricScore: number; // 0–10
    keywordScore: number;  // 0–15
    totalScore: number;
  };
}

export interface ClassificationResult {
  archetypeId: string;
  archetypeVersion: number;
  confidence: number;
  needsReview: boolean;
  audit: {
    scoringBreakdown: ScoringResult["breakdown"];
    matchedLayers: string[];
    rejectedLayers: string[];
    matchedKeywords: string[];
    attemptedArchetypes: {
      archetypeId: string;
      score: number;
      reason: string;
      disqualified: boolean;
    }[];
    normalizedLayerTokens: string[];
    unmatchedLayers: string[];
    normalizationConfidence: number[];
    timestamp: number;
  };
}

// Token sets per archetype — what tokens must/should/disqualify
const ARCHETYPE_TOKEN_RULES: Record<string, {
  requiredTokens: CanonicalLayerToken[];
  bonusTokens: CanonicalLayerToken[];
  disqualifyTokens: CanonicalLayerToken[];
  keywords: string[];
  disqualifyKeywords: string[];
}> = {
  liquid_applied_irma: {
    requiredTokens: ["membrane", "drainageMat"],
    bonusTokens: ["filterFabric", "insulationBoard", "pedestals", "pavers", "ballast"],
    disqualifyTokens: ["basePly", "capSheet"],
    keywords: ["irma", "pmr", "inverted", "protected membrane", "plaza"],
    disqualifyKeywords: ["concrete pavement", "concrete slab", "cast-in-place"],
  },
  conventional_liquid_applied: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "vaporRetarder"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["lam", "liquid applied", "fluid applied", "waterproofing"],
    disqualifyKeywords: ["irma", "pmr", "drainage mat", "filter fabric"],
  },
  concrete_pavement_roof: {
    requiredTokens: ["membrane"],
    bonusTokens: ["protectionBoard", "drainageMat", "insulationBoard"],
    disqualifyTokens: ["filterFabric", "pedestals", "ballast"],
    keywords: ["concrete pavement", "cast-in-place", "concrete paving", "concrete slab", "concrete_pavement"],
    disqualifyKeywords: [],
  },
  built_up_panel_assembly: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "surfacing"],
    disqualifyTokens: ["drainageMat", "filterFabric", "ballast", "pedestals"],
    keywords: ["aluminum panel", "cladding panel", "panel assembly", "curtain wall", "densglass", "cementitious board"],
    disqualifyKeywords: ["drain", "filter fabric"],
  },
  single_ply_tpo: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "vaporRetarder"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["tpo", "thermoplastic"],
    disqualifyKeywords: ["irma", "modified bitumen", "sbs"],
  },
  single_ply_pvc: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["pvc"],
    disqualifyKeywords: ["irma"],
  },
  single_ply_epdm: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "ballast"],
    disqualifyTokens: ["drainageMat", "filterFabric", "basePly", "capSheet"],
    keywords: ["epdm", "rubber membrane"],
    disqualifyKeywords: ["irma"],
  },
  modified_bitumen_sbs: {
    requiredTokens: ["membrane", "insulationBoard"],
    bonusTokens: ["coverBoard", "capSheet"],
    disqualifyTokens: ["drainageMat", "filterFabric"],
    keywords: ["sbs", "app", "modified bitumen", "mod bit", "torch applied"],
    disqualifyKeywords: ["irma", "pmr"],
  },
  modified_bitumen_irma: {
    requiredTokens: ["membrane", "drainageMat"],
    bonusTokens: ["filterFabric", "insulationBoard", "protectionBoard"],
    disqualifyTokens: ["basePly"],
    keywords: ["sbs irma", "modified bitumen irma", "irma"],
    disqualifyKeywords: ["concrete pavement"],
  },
  custom: {
    requiredTokens: [],
    bonusTokens: [],
    disqualifyTokens: [],
    keywords: [],
    disqualifyKeywords: [],
  },
};

const NEEDS_REVIEW_THRESHOLD = 0.55;
const HIGH_CONFIDENCE_THRESHOLD = 0.75;

export function classifyLayers(
  rawLayers: string[],
  surfaceHint?: string,
): ClassificationResult {
  const { normalizedLayers, unmatchedLayers } = normalizeLayers(rawLayers);
  const tokens = normalizedLayers.map((nl) => nl.canonicalToken).filter(Boolean) as CanonicalLayerToken[];
  const normConfidence = normalizedLayers.map((nl) => nl.confidence);
  const layerText = rawLayers.join(" ").toLowerCase();

  // Surface hint overrides: concrete_pavement → concrete_pavement_roof always wins
  if (surfaceHint === "concrete_pavement" || /concrete\s*pav/i.test(layerText)) {
    return buildResult("concrete_pavement_roof", 1, 0.92, false, tokens, unmatchedLayers, normConfidence, layerText);
  }
  if (surfaceHint === "panel" || /aluminum\s*panel|cladding\s*panel|curtain\s*wall/i.test(layerText)) {
    return buildResult("built_up_panel_assembly", 1, 0.88, false, tokens, unmatchedLayers, normConfidence, layerText);
  }

  // Score all known archetypes
  const scores: ScoringResult[] = Object.entries(ARCHETYPE_TOKEN_RULES)
    .filter(([id]) => id !== "custom")
    .map(([archetypeId, rules]) => scoreArchetype(archetypeId, rules, tokens, layerText));

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  const confidence = Math.min(best.score / 100, 1.0);
  const needsReview = confidence < NEEDS_REVIEW_THRESHOLD || best.disqualified;
  const winner = (needsReview || best.disqualified) ? "custom" : best.archetypeId;

  return {
    archetypeId: winner,
    archetypeVersion: 1,
    confidence: winner === "custom" ? 0.3 : confidence,
    needsReview: winner === "custom",
    audit: {
      scoringBreakdown: best.breakdown,
      matchedLayers: best.matchedLayers,
      rejectedLayers: best.rejectedLayers,
      matchedKeywords: best.matchedKeywords,
      attemptedArchetypes: scores.map((s) => ({
        archetypeId: s.archetypeId,
        score: s.score,
        reason: s.disqualified ? (s.disqualifyReason || "disqualified") : `score ${s.score}`,
        disqualified: s.disqualified,
      })),
      normalizedLayerTokens: tokens,
      unmatchedLayers,
      normalizationConfidence: normConfidence,
      timestamp: Date.now(),
    },
  };
}

function buildResult(
  archetypeId: string,
  version: number,
  confidence: number,
  needsReview: boolean,
  tokens: CanonicalLayerToken[],
  unmatchedLayers: string[],
  normConfidence: number[],
  layerText: string,
): ClassificationResult {
  return {
    archetypeId,
    archetypeVersion: version,
    confidence,
    needsReview,
    audit: {
      scoringBreakdown: { layerScore: 60, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 15, totalScore: 75 },
      matchedLayers: tokens,
      rejectedLayers: [],
      matchedKeywords: [],
      attemptedArchetypes: [],
      normalizedLayerTokens: tokens,
      unmatchedLayers,
      normalizationConfidence: normConfidence,
      timestamp: Date.now(),
    },
  };
}

function scoreArchetype(
  archetypeId: string,
  rules: typeof ARCHETYPE_TOKEN_RULES[string],
  tokens: CanonicalLayerToken[],
  layerText: string,
): ScoringResult {
  const tokenSet = new Set(tokens);

  // Disqualify check
  for (const dt of rules.disqualifyTokens) {
    if (tokenSet.has(dt)) {
      return {
        archetypeId, archetypeVersion: 1, score: 0, confidence: 0,
        needsReview: true, disqualified: true,
        disqualifyReason: `disqualify token "${dt}" present`,
        matchedLayers: [], rejectedLayers: [dt], matchedKeywords: [],
        breakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
      };
    }
  }
  for (const dk of rules.disqualifyKeywords) {
    if (layerText.includes(dk)) {
      return {
        archetypeId, archetypeVersion: 1, score: 0, confidence: 0,
        needsReview: true, disqualified: true,
        disqualifyReason: `disqualify keyword "${dk}" found in layers`,
        matchedLayers: [], rejectedLayers: [], matchedKeywords: [],
        breakdown: { layerScore: 0, drainageMatScore: 0, filterFabricScore: 0, keywordScore: 0, totalScore: 0 },
      };
    }
  }

  // Layer score (0–60): required tokens
  const reqMatched = rules.requiredTokens.filter((t) => tokenSet.has(t));
  const layerScore = rules.requiredTokens.length > 0
    ? Math.round((reqMatched.length / rules.requiredTokens.length) * 60)
    : 30; // no required tokens = neutral

  // Bonus score (up to 25 spread across drainageMat 15, filterFabric 10)
  const drainageMatScore = (rules.bonusTokens.includes("drainageMat") && tokenSet.has("drainageMat")) ? 15 : 0;
  const filterFabricScore = (rules.bonusTokens.includes("filterFabric") && tokenSet.has("filterFabric")) ? 10 : 0;

  // Keyword score (0–15)
  const matchedKeywords = rules.keywords.filter((kw) => layerText.includes(kw.toLowerCase()));
  const keywordScore = matchedKeywords.length > 0
    ? Math.min(Math.round((matchedKeywords.length / Math.max(rules.keywords.length, 1)) * 15), 15)
    : 0;

  const totalScore = layerScore + drainageMatScore + filterFabricScore + keywordScore;

  return {
    archetypeId, archetypeVersion: 1,
    score: totalScore,
    confidence: Math.min(totalScore / 100, 1.0),
    needsReview: totalScore < NEEDS_REVIEW_THRESHOLD * 100,
    disqualified: false,
    matchedLayers: reqMatched,
    rejectedLayers: rules.requiredTokens.filter((t) => !tokenSet.has(t)),
    matchedKeywords,
    breakdown: { layerScore, drainageMatScore, filterFabricScore, keywordScore, totalScore },
  };
}
```

**Test:** `npx vitest run __tests__/archetype-scoring.test.ts`

---

## Task 4 — V2 extraction API route

**File:** `app/api/bidshield/v2/extract-assemblies-v2/route.ts`

This route:
1. Accepts: `{ pdfBase64, projectId, fileName }`
2. Calls Claude — same PDF parsing but V2 prompt that requests `layers[]` per assembly
3. For each assembly: normalizes → scores → builds item payload
4. Creates Convex run + items
5. Returns `{ runId, items[] }`

**Prompt changes from legacy:**
- Request `layers` as array explicitly
- Request `surface` using new values including `concrete_pavement` and `panel`  
- No `system` field — archetype is determined server-side from layers
- Request `drawingAssemblyId` (the label: "ROOF 01") separately from `displayName`

```typescript
// Key parts only — see full file in implementation

const V2_SYSTEM_PROMPT = `You are a commercial roofing estimating assistant.
Extract all roof/wall/plaza assemblies from this drawing sheet.

Return ONLY valid JSON (no markdown):
{
  "assemblies": [
    {
      "drawingAssemblyId": "ROOF 01",       // exact label from drawing
      "displayName": "IRMA Plaza Deck",       // descriptive name if shown
      "sourceSheet": "A-401",                 // sheet/drawing reference
      "layers": [                             // ALL labeled layers, bottom to top
        "Structural Concrete Deck",
        "Waterproofing Membrane",
        "Drainage Mat",
        "2\" XPS Insulation",
        "Filter Fabric",
        "River Ballast"
      ],
      "surface": "pavers_ballast",            // top finish surface
      "area": 4500                            // SF if shown in schedule
    }
  ],
  "deckType": "concrete",
  "projectName": null,
  "location": null,
  "drawingDate": null,
  "drawingRevision": null
}

surface values: exposed | pavers_pedestals | pavers_ballast | green_roof | walkpads | traffic_coating | concrete_pavement | panel

EXTRACTION RULES:
- Extract EVERY labeled assembly. Start from ROOF 01 (or first label). Do NOT skip any.
- If drawing has ROOF 01 through ROOF 06, return all six.
- Do NOT stop early. Do NOT start from the middle.
- layers: list every labeled component from bottom (deck/substrate) to top (finish)
- surface = concrete_pavement: top finish is cast-in-place concrete slab
- surface = panel: top finish is aluminum/cladding/curtain wall panel
- Up to 20 assemblies per sheet
`;
```

Route also calls `classifyLayers()` from Task 3, then:
- Gets section snapshots from `ARCHETYPE_FORM_SCHEMAS`
- Calls Convex mutations to persist run + items
- Returns `{ runId, items }` to client

---

## Task 5 — V2 review page

**File:** `app/bidshield/dashboard/v2/review/[runId]/page.tsx`

Simple read-only review screen:
- `useQuery(api.bidshield.getExtractionItemsV2, { runId })`  
- One card per item showing:
  - `drawingAssemblyId` + `displayName`
  - `archetypeId` badge (teal) or needs-review badge (red)
  - `confidence` percentage
  - Layer list from `extractedLayers`
  - Required/optional sections from `requiredSectionsSnapshot`
  - Hidden sections NOT rendered (read from `hiddenSectionsSnapshot`)
  - Approve / Reject buttons → `updateItemStatusV2` mutation
- "Approve All" button
- Summary: X of N approved

**NO legacy systemType, NO ROOF_SYSTEM_CONFIGS, NO classifyAssemblySystem call.**
All rendering authority comes from the item's own snapshot fields.

---

## Task 6 — Tests

**File:** `__tests__/archetype-scoring.test.ts`

Cover:
- ROOF 05 (drainageMat + concrete pavement layers) → `concrete_pavement_roof`
- ROOF 06 (DensGlass + aluminum panel layers) → `built_up_panel_assembly`  
- ROOF 01 TPO → `single_ply_tpo`
- ROOF 02 SBS conventional → `modified_bitumen_sbs`
- ROOF 03/04 lam_irma → `liquid_applied_irma`
- All 6 assembled together, no misclassifications
- surface hint `concrete_pavement` always wins regardless of other signals
- surface hint `panel` always wins for panel assemblies
- Low-confidence result → needsReview = true
- `classificationAudit` has scoringBreakdown

---

## Task 7 — Deploy + verify

```bash
# TypeScript check
npx tsc --noEmit

# Full test suite
npm test

# Deploy Convex (new tables + new functions)
CONVEX_DEPLOY_KEY='dev:grand-goshawk-715|...' npx convex deploy --yes

# Build
npm run build
```

**Acceptance criteria:**
- Upload Steinway sheet to `/bidshield/dashboard/v2/review/[runId]`
- See 6 items: ROOF 01–06 all present
- ROOF 05 shows archetypeId: `concrete_pavement_roof`
- ROOF 06 shows archetypeId: `built_up_panel_assembly`
- ROOF 05 card does NOT show filterFabric section
- ROOF 06 card does NOT show drainage, drainageMat, filterFabric, pedestals, ballast
- Legacy wizard completely unaffected

---

## File checklist

| File | Action |
|------|--------|
| `convex/schema.ts` | Add 2 new tables |
| `convex/bidshield/extractionV2.ts` | Create — 9 mutations/queries |
| `convex/bidshield.ts` | Append V2 exports |
| `lib/bidshield/archetype-scoring.ts` | Create — scoring engine |
| `app/api/bidshield/v2/extract-assemblies-v2/route.ts` | Create — V2 extraction route |
| `app/bidshield/dashboard/v2/review/[runId]/page.tsx` | Create — review UI |
| `__tests__/archetype-scoring.test.ts` | Create — scoring tests |

**Do NOT touch:**
- `convex/schema.ts` existing tables
- `app/api/bidshield/extract-assemblies/route.ts` (legacy)
- `app/bidshield/dashboard/NewBidWizard.tsx` (legacy)
- `lib/bidshield/assembly-system-configs.ts` (legacy)
- Any existing tests
