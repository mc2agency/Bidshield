# Phase 1: Schema & Data Changes - Detailed Diff

## 1. CONVEX SCHEMA ADDITIONS

### New Tables to Add:

#### A. bidshield_assemblyArchetypes
```typescript
bidshield_assemblyArchetypes: defineTable({
  archetypeId: v.string(),
  version: v.number(),
  label: v.string(),
  
  category: v.union(
    v.literal("Single-Ply"),
    v.literal("Modified Bitumen"),
    v.literal("BUR"),
    v.literal("Protected Membrane"),
    v.literal("Fluid-Applied"),
    v.literal("Vegetated"),
    v.literal("Overburden"),
    v.literal("Hardscape"),
    v.literal("Steep-Slope"),
    v.literal("Custom")
  ),
  
  icon: v.string(),
  
  requiredSections: v.array(v.string()),
  optionalSections: v.array(v.string()),
  hiddenSections: v.array(v.string()),
  incompatibleSections: v.optional(v.array(v.string())),
  
  defaultLayerOrder: v.array(v.string()),
  
  validationRules: v.array(v.object({
    sectionId: v.string(),
    message: v.string(),
    severity: v.union(v.literal("error"), v.literal("warning"), v.literal("info")),
  })),
  
  scopeTemplate: v.array(v.string()),
  
  metadata: v.object({
    assemblyType: v.string(),
    membraneExposure: v.union(v.literal("Exposed"), v.literal("Protected"), v.literal("Buried")),
    typicalInsulation: v.string(),
    commonSurfaces: v.array(v.string()),
    isProtectedMembrane: v.boolean(),
    isRecoverable: v.boolean(),
    greenRoofCompatible: v.boolean(),
    irmaCompatible: v.boolean(),
    highWindRated: v.optional(v.boolean()),
    highTraffic: v.optional(v.boolean()),
    solarCompatible: v.optional(v.boolean()),
    coldApplied: v.optional(v.boolean()),
    typicalSlope: v.optional(v.string()),
  }),
  
  classificationHints: v.object({
    requiredKeywords: v.optional(v.array(v.string())),
    excludeKeywords: v.optional(v.array(v.string())),
    requiredLayers: v.optional(v.array(v.string())),
    excludeLayers: v.optional(v.array(v.string())),
    requiresDrainageMat: v.optional(v.boolean()),
    requiresFilterFabric: v.optional(v.boolean()),
  }),
  
  deprecated: v.boolean(),
  replacesArchetypeId: v.optional(v.string()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_archetypeId", ["archetypeId"])
  .index("by_archetypeId_version", ["archetypeId", "version"])
  .index("by_category", ["category"])
  .index("by_deprecated", ["deprecated"]),
```

#### B. bidshield_projectAssemblyPresets
```typescript
bidshield_projectAssemblyPresets: defineTable({
  projectId: v.id("bidshield_projects"),
  userId: v.string(),
  
  displayName: v.string(),
  drawingAssemblyId: v.optional(v.string()),
  
  archetypeId: v.string(),
  archetypeVersion: v.number(),
  
  // BACKWARD COMPATIBILITY: Keep legacy systemId
  legacySystemId: v.optional(v.string()),
  
  sectionValues: v.any(),
  
  sourceSheet: v.optional(v.string()),
  sourceDetail: v.optional(v.string()),
  confidence: v.optional(v.number()),
  
  needsReview: v.boolean(),
  
  classificationAudit: v.optional(v.object({
    conflict: v.boolean(),
    titleLabel: v.optional(v.string()),
    detectedType: v.optional(v.string()),
    reason: v.optional(v.string()),
    confidence: v.number(),
    archetypeId: v.string(),
    archetypeVersion: v.number(),
    
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
    rejectedKeywords: v.array(v.string()),
    
    attemptedArchetypes: v.array(v.object({
      archetypeId: v.string(),
      score: v.number(),
      reason: v.string(),
      disqualified: v.boolean(),
    })),
    
    originalExtractedText: v.optional(v.array(v.string())),
    normalizedLayerTokens: v.optional(v.array(v.string())),
    unmatchedLayers: v.optional(v.array(v.string())),
    normalizationConfidence: v.optional(v.array(v.number())),
    
    timestamp: v.number(),
  })),
  
  overrideRequiredSections: v.optional(v.array(v.string())),
  overrideOptionalSections: v.optional(v.array(v.string())),
  overrideHiddenSections: v.optional(v.array(v.string())),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_projectId", ["projectId"])
  .index("by_userId", ["userId"])
  .index("by_archetypeId", ["archetypeId"])
  .index("by_needsReview", ["needsReview"])
  .index("by_project_and_archetype", ["projectId", "archetypeId"])
  .index("by_legacySystemId", ["legacySystemId"]),
```

#### C. bidshield_customAssemblyDrafts
```typescript
bidshield_customAssemblyDrafts: defineTable({
  projectId: v.id("bidshield_projects"),
  userId: v.string(),
  
  displayName: v.string(),
  
  archetypeId: v.literal("custom"),
  archetypeVersion: v.number(),
  
  inferredCategory: v.optional(v.string()),
  
  extractedLayers: v.array(v.string()),
  
  requiredSections: v.array(v.string()),
  optionalSections: v.array(v.string()),
  hiddenSections: v.array(v.string()),
  defaultLayerOrder: v.array(v.string()),
  validationRules: v.array(v.object({
    sectionId: v.string(),
    message: v.string(),
    severity: v.union(v.literal("error"), v.literal("warning"), v.literal("info")),
  })),
  
  sectionValues: v.any(),
  
  needsReview: v.literal(true),
  
  classificationAttempt: v.any(),
  
  canPromoteToArchetype: v.optional(v.boolean()),
  promotedArchetypeId: v.optional(v.string()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_projectId", ["projectId"])
  .index("by_userId", ["userId"])
  .index("by_canPromote", ["canPromoteToArchetype"]),
```

---

## 2. SECTIONID UPDATES

### Add gravelLayer to SectionId union:

**Location:** `lib/bidshield/assembly-system-configs.ts`

**Before:**
```typescript
export type SectionId =
  | "deck"
  | "vaporRetarder"
  | "insulation"
  | "taperedInsulation"
  | "coverBoard"
  | "burPlies"
  | "capSheet"
  | "surfacing"
  | "membrane"
  | "drainageMat"
  | "filterFabric"
  | "rootBarrier"
  | "protectionBoard"
  | "pedestals"
  | "ballast"
  | "ballastRestraint"
  | "greenRoof"
  | "growingMedia"
  | "drainageLayer"
  | "irrigation"
  | "concretePavement"
  | "reinforcement"
  | "drainage"
  | "flashing"
  | "penetrations"
  | "edgeConditions";
```

**After:**
```typescript
export type SectionId =
  | "deck"
  | "vaporRetarder"
  | "insulation"
  | "taperedInsulation"
  | "coverBoard"
  | "burPlies"
  | "capSheet"
  | "surfacing"
  | "membrane"
  | "drainageMat"
  | "filterFabric"
  | "rootBarrier"
  | "protectionBoard"
  | "pedestals"
  | "ballast"
  | "ballastRestraint"
  | "greenRoof"
  | "growingMedia"
  | "drainageLayer"
  | "irrigation"
  | "concretePavement"
  | "reinforcement"
  | "drainage"
  | "flashing"
  | "penetrations"
  | "edgeConditions"
  | "gravelLayer"; // NEW: Aggregate layer below concrete pavement
```

### Add gravelLayer section definition:

**Location:** `lib/bidshield/assembly-system-configs.ts` (in ALL_SECTIONS or SECTION_DEFINITIONS array)

```typescript
{
  id: "gravelLayer",
  label: "Gravel / Aggregate Layer",
  type: "text",
  placeholder: "e.g., 2\" gravel layer, 4\" aggregate base",
  helperText: "Aggregate layer used below concrete pavement assemblies (NOT ballast)",
},
```

---

## 3. STABLE ARCHETYPES TO SEED (10 total)

### Archetypes for Phase 1:

1. **conventional_liquid_applied** (Fluid-Applied)
2. **liquid_applied_irma** (Protected Membrane)
3. **modified_bitumen_sbs** (Modified Bitumen)
4. **modified_bitumen_irma** (Protected Membrane)
5. **single_ply_epdm** (Single-Ply)
6. **single_ply_tpo** (Single-Ply)
7. **single_ply_pvc** (Single-Ply)
8. **concrete_pavement_roof** (Hardscape)
9. **built_up_panel_assembly** (Custom)
10. **custom** (Custom - fallback)

### Deferred to Phase 2+:
- hydrotech_irma
- pedestal_paver_irma
- ballast_paver_irma
- green_roof_irma
- modified_bitumen_app
- bur_roof

---

## 4. LEGACY COMPATIBILITY MAPPING

### systemId → archetypeId Mapping:

```typescript
const LEGACY_SYSTEM_TO_ARCHETYPE: Record<string, string> = {
  // Single-ply
  "tpo": "single_ply_tpo",
  "pvc": "single_ply_pvc",
  "epdm": "single_ply_epdm",
  
  // Modified bitumen
  "sbs": "modified_bitumen_sbs",
  "app": "modified_bitumen_sbs", // APP uses same archetype as SBS for now
  
  // BUR
  "bur": "custom", // BUR deferred to Phase 2
  
  // LAM (CRITICAL FIX)
  "lam": "conventional_liquid_applied", // FIX: was incorrectly mapped to IRMA
  "lam_irma": "liquid_applied_irma",
  
  // IRMA variants
  "sbs_irma": "modified_bitumen_irma",
  "sbs_irma_green": "modified_bitumen_irma", // Green variant uses same archetype
  "app_irma": "modified_bitumen_irma",
  
  // Hydrotech
  "hydrotech": "liquid_applied_irma", // Hydrotech is a brand of LAM IRMA
  
  // Specialized
  "green": "custom", // Green roof deferred to Phase 2
  "paver_ped": "custom", // Pedestal paver deferred to Phase 2
  "paver_bal": "custom", // Ballast paver deferred to Phase 2
  "concrete": "concrete_pavement_roof",
  "metal": "custom",
  "spf": "custom",
};
```

---

## 5. FEATURE FLAGS

### Add to user settings or config:

```typescript
interface BidShieldFeatureFlags {
  enableArchetypeSystem: boolean; // Default: true in Phase 1
  enableCustomAssemblies: boolean; // Default: false (Phase 2)
  enableClassificationAudit: boolean; // Default: true
  enableNormalization: boolean; // Default: true
}
```

### Environment-based toggles:

```typescript
// In convex/_generated/featureFlags.ts or similar
export const FEATURE_FLAGS = {
  ARCHETYPE_SYSTEM: process.env.FEATURE_ARCHETYPE_SYSTEM !== "false",
  CUSTOM_ASSEMBLIES: process.env.FEATURE_CUSTOM_ASSEMBLIES === "true",
  CLASSIFICATION_AUDIT: process.env.FEATURE_CLASSIFICATION_AUDIT !== "false",
  NORMALIZATION: process.env.FEATURE_NORMALIZATION !== "false",
};
```

---

## 6. BACKWARD COMPATIBILITY STRATEGY

### Read Path (existing code continues to work):

```typescript
// LEGACY: Read systemId from roofAssemblies
const assembly = project.roofAssemblies[0];
const systemType = assembly.systemType; // "lam", "sbs", "epdm", etc.

// NEW: Resolve to archetype
const archetypeId = LEGACY_SYSTEM_TO_ARCHETYPE[systemType] || "custom";
const archetype = await getArchetypeById(archetypeId);
```

### Write Path (new data includes both):

```typescript
// NEW: AI extraction produces archetypeId
const result = await classifyAssembly(extractedData);

// Store both for compatibility
await createProjectAssemblyPreset({
  archetypeId: result.archetypeId,
  legacySystemId: archetypeToLegacySystem(result.archetypeId),
  // ... other fields
});
```

### Helper function:

```typescript
function archetypeToLegacySystem(archetypeId: string): string {
  const reverseMap: Record<string, string> = {
    "single_ply_tpo": "tpo",
    "single_ply_pvc": "pvc",
    "single_ply_epdm": "epdm",
    "modified_bitumen_sbs": "sbs",
    "modified_bitumen_irma": "sbs_irma",
    "conventional_liquid_applied": "lam",
    "liquid_applied_irma": "lam_irma",
    "concrete_pavement_roof": "concrete",
    "built_up_panel_assembly": "lam", // Panel assemblies use LAM membrane
    "custom": "custom",
  };
  
  return reverseMap[archetypeId] || "custom";
}
```

---

## 7. INDEX SUMMARY

### New Indexes:

**bidshield_assemblyArchetypes:**
- `by_archetypeId` — lookup current archetype
- `by_archetypeId_version` — lookup specific version
- `by_category` — filter by category
- `by_deprecated` — filter active archetypes

**bidshield_projectAssemblyPresets:**
- `by_projectId` — all presets for a project
- `by_userId` — user's presets across projects
- `by_archetypeId` — find all usages of an archetype
- `by_needsReview` — filter presets needing review
- `by_project_and_archetype` — unique preset lookup
- `by_legacySystemId` — BACKWARD COMPAT: lookup by old systemId

**bidshield_customAssemblyDrafts:**
- `by_projectId` — custom drafts for a project
- `by_userId` — user's custom drafts
- `by_canPromote` — drafts eligible for promotion

---

## SUMMARY OF CHANGES

✅ 3 new Convex tables
✅ 1 new SectionId type (gravelLayer)
✅ 10 stable archetypes seeded
✅ Legacy systemId → archetypeId mapping
✅ Feature flags for gradual rollout
✅ Full backward compatibility
✅ No breaking changes to existing code

**Ready to proceed?**
