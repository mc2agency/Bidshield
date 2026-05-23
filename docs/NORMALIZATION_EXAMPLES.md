# Layer Normalization Examples

## Overview

The normalization layer converts inconsistent terminology from drawings into canonical tokens used for classification scoring.

## Architecture

```
Raw OCR Text → Normalization Engine → Canonical Tokens → Classification Scoring
```

## Example 1: IRMA Assembly (Conventional Terminology)

### Raw Extracted Layers (from PDF OCR)
```
1. Structural concrete deck
2. Hot rubberized asphalt
3. Protection board
4. Drainage composite
5. 2" XPS insulation
6. Filter fabric
7. Concrete pavers on pedestals
```

### After Normalization
```javascript
{
  normalizedLayers: [
    {
      originalText: "Structural concrete deck",
      canonicalToken: "deckBoard",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Hot rubberized asphalt",
      canonicalToken: "waterproofing",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "Protection board",
      canonicalToken: "protectionBoard",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "Drainage composite",
      canonicalToken: "drainageMat",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "2\" XPS insulation",
      canonicalToken: "insulationBoard",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Filter fabric",
      canonicalToken: "filterFabric",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "Concrete pavers on pedestals",
      canonicalToken: "pavers",
      confidence: 0.85,
      matchMethod: "regex"
    }
  ],
  canonicalTokens: [
    "deckBoard",
    "waterproofing",
    "protectionBoard",
    "drainageMat",
    "insulationBoard",
    "filterFabric",
    "pavers"
  ],
  unmatchedLayers: []
}
```

### Classification Result
```javascript
{
  systemId: "liquid_applied_irma",
  score: 95,
  confidence: "high",
  signals: {
    drainageMat: true,  // Detected from canonical token
    filterFabric: true, // Detected from canonical token
    irma: true
  }
}
```

## Example 2: Same IRMA Assembly (Alternative Terminology)

### Raw Extracted Layers
```
1. Concrete structural deck
2. Cold fluid applied membrane
3. Protection course
4. Protection course drainage layer
5. Extruded polystyrene insulation
6. Separation fabric
7. Pavers on adjustable pedestals
```

### After Normalization
```javascript
{
  normalizedLayers: [
    {
      originalText: "Concrete structural deck",
      canonicalToken: "deckBoard",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Cold fluid applied membrane",
      canonicalToken: "waterproofing",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "Protection course",
      canonicalToken: "protectionBoard",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Protection course drainage layer",
      canonicalToken: "drainageMat",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Extruded polystyrene insulation",
      canonicalToken: "insulationBoard",
      confidence: 0.85,
      matchMethod: "regex"
    },
    {
      originalText: "Separation fabric",
      canonicalToken: "filterFabric",
      confidence: 0.95,
      matchMethod: "alias"
    },
    {
      originalText: "Pavers on adjustable pedestals",
      canonicalToken: "pavers",
      confidence: 0.85,
      matchMethod: "regex"
    }
  ],
  canonicalTokens: [
    "deckBoard",
    "waterproofing",
    "protectionBoard",
    "drainageMat",
    "insulationBoard",
    "filterFabric",
    "pavers"
  ],
  unmatchedLayers: []
}
```

### Classification Result
```javascript
{
  systemId: "liquid_applied_irma",
  score: 95,
  confidence: "high",
  signals: {
    drainageMat: true,  // Same result despite different terminology
    filterFabric: true,
    irma: true
  }
}
```

## Example 3: TPO Single-Ply (Multiple Cover Board Variations)

### Consultant A
```
1. Steel deck
2. Vapor retarder
3. 2" polyiso insulation
4. 1/2" DensDeck
5. 80 mil TPO membrane
```

### Consultant B
```
1. Steel roof deck
2. Vapor barrier
3. Polyisocyanurate insulation
4. Gypsum board
5. TPO single-ply membrane
```

### Consultant C
```
1. Structural steel decking
2. Self-adhering vapor retarder
3. Rigid insulation board
4. Cover board
5. Mechanically attached TPO
```

### All Three Normalize to Same Canonical Tokens
```javascript
{
  canonicalTokens: [
    "deckBoard",
    "vaporRetarder",
    "insulationBoard",
    "coverBoard",  // DensDeck, Gypsum board, Cover board all normalize here
    "membrane"
  ]
}
```

### Classification Result (All Three)
```javascript
{
  systemId: "single_ply_tpo",
  score: 92,
  confidence: "high",
  signals: {
    drainageMat: false,
    filterFabric: false,
    singlePly: true
  }
}
```

## Example 4: Unmatched Layers

### Raw Layers
```
1. Structural concrete deck
2. Proprietary XYZ-9000 waterproofing
3. Enkadrain composite
4. Custom insulation system ABC
5. Geotextile
```

### After Normalization
```javascript
{
  normalizedLayers: [
    { originalText: "Structural concrete deck", canonicalToken: "deckBoard", confidence: 0.85 },
    { originalText: "Proprietary XYZ-9000 waterproofing", canonicalToken: "waterproofing", confidence: 0.85 },
    { originalText: "Enkadrain composite", canonicalToken: "drainageMat", confidence: 0.95 },
    { originalText: "Custom insulation system ABC", canonicalToken: null, confidence: 0 },
    { originalText: "Geotextile", canonicalToken: "filterFabric", confidence: 0.95 }
  ],
  canonicalTokens: [
    "deckBoard",
    "waterproofing",
    "drainageMat",
    "filterFabric"
  ],
  unmatchedLayers: [
    "Custom insulation system ABC"
  ]
}
```

### Classification Audit
```javascript
{
  originalExtractedText: "...",
  normalizedLayerTokens: [
    "deckBoard",
    "waterproofing",
    "drainageMat",
    "filterFabric"
  ],
  unmatchedLayers: [
    "Custom insulation system ABC"
  ],
  normalizationConfidence: 0.80,  // 4/5 layers matched
  classificationScore: 85,
  topCandidates: [
    { systemId: "liquid_applied_irma", score: 85 },
    { systemId: "modified_bitumen_irma", score: 78 }
  ]
}
```

## Benefits

### 1. OCR Tolerance
```
"drainage mat" → drainageMat
"drainage.mat" → drainageMat
"drainage-mat" → drainageMat
"DRAINAGE MAT" → drainageMat
```

### 2. Consultant Variation
```
"DensDeck" → coverBoard
"gypsum board" → coverBoard
"substrate board" → coverBoard
"cover board" → coverBoard
```

### 3. Cross-Project Consistency
All projects with IRMA assemblies will have:
- `drainageMat` in canonicalTokens
- `filterFabric` in canonicalTokens
- Regardless of architect terminology

### 4. Future ML Training
Training data can use canonical tokens:
```javascript
// Instead of training on:
["drainage mat", "drainage composite", "drain layer", ...]

// Train on:
["drainageMat"]
```

### 5. Classification Scoring
```javascript
// Old way (brittle):
if (layers.some(l => /drainage[_\s-]?mat/i.test(l))) {
  score += 15;
}

// New way (robust):
if (hasCanonicalLayer(normalizedLayers, "drainageMat")) {
  score += 15;
}
```

## Storage Pattern

### ClassificationAudit
```javascript
{
  originalExtractedText: "1. Drainage composite\n2. Filter fabric\n...",
  normalizedLayerTokens: ["drainageMat", "filterFabric"],
  unmatchedLayers: ["Custom system ABC"],
  normalizationConfidence: 0.90,
  classificationScore: 95,
  topCandidates: [...]
}
```

### Future Queries
```javascript
// Find all projects with drainage mat (any terminology)
db.projects.find({
  "roofAssemblies.classificationAudit.normalizedLayerTokens": "drainageMat"
})

// Find assemblies missing filter fabric
db.projects.find({
  "roofAssemblies.classificationAudit.normalizedLayerTokens": {
    $all: ["drainageMat"],
    $nin: ["filterFabric"]
  }
})
```

## Summary

| Before Normalization | After Normalization |
|---------------------|---------------------|
| 50+ drainage mat variants | 1 canonical token |
| 20+ cover board variants | 1 canonical token |
| 15+ waterproofing variants | 1 canonical token |
| Brittle regex matching | Robust token checking |
| Inconsistent cross-project | Consistent cross-project |
| Hard to train ML models | Clean training data |
