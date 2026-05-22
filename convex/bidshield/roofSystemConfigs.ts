import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const listAll = query({
  handler: async (ctx) => {
    return ctx.db.query("bidshield_roofSystemConfigs").collect();
  },
});

export const getBySystemId = query({
  args: { systemId: v.string() },
  handler: async (ctx, { systemId }) => {
    return ctx.db
      .query("bidshield_roofSystemConfigs")
      .withIndex("by_systemId", (q) => q.eq("systemId", systemId))
      .first();
  },
});

// ─── Seed mutation (idempotent — skips systems already present) ───────────────

const SEED_CONFIGS = [
  {
    systemId: "tpo", label: "TPO Single-Ply", category: "Low-Slope Membrane", icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "TPO membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" as const },
      { sectionId: "drainage", message: "Drainage not specified — confirm drain type and overflow details.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install vapor retarder where required.",
      "Install insulation ({insulation}).", "Install cover board ({coverBoard}).",
      "Install TPO single-ply membrane.", "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: { assemblyType: "Single-ply mechanically attached or fully adhered", membraneExposure: "Exposed", typicalInsulation: "Polyiso, XPS", commonSurfaces: ["Exposed TPO", "Ballast", "Pavers"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "pvc", label: "PVC Single-Ply", category: "Low-Slope Membrane", icon: "⬜",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "protectionBoard", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "protectionBoard", "membrane"],
    validationRules: [
      { sectionId: "membrane", message: "PVC membrane not specified.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation layer not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install vapor retarder where required.",
      "Install insulation ({insulation}).", "Install cover board ({coverBoard}).",
      "Install PVC single-ply membrane.", "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: { assemblyType: "Single-ply mechanically attached or fully adhered", membraneExposure: "Exposed", typicalInsulation: "Polyiso, XPS", commonSurfaces: ["Exposed PVC"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "epdm", label: "EPDM Single-Ply", category: "Low-Slope Membrane", icon: "⬛",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "ballast", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "ballast"],
    validationRules: [
      { sectionId: "membrane", message: "EPDM membrane not specified.", severity: "error" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).", "Install EPDM single-ply membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: { assemblyType: "Single-ply ballasted, mechanically attached, or adhered", membraneExposure: "Exposed", typicalInsulation: "Polyiso, XPS", commonSurfaces: ["Exposed EPDM", "Ballast"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "sbs", label: "SBS Modified Bitumen", category: "Modified Bitumen", icon: "🟫",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "SBS membrane not specified.", severity: "error" as const },
      { sectionId: "coverBoard", message: "Cover board not specified for SBS.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install vapor retarder where required.",
      "Install insulation ({insulation}).", "Install cover board ({coverBoard}).",
      "Install SBS modified bitumen membrane ({membrane}).", "Install roof drains and flashing.",
    ],
    metadata: { assemblyType: "Torch-applied or cold-applied modified bitumen", membraneExposure: "Exposed", typicalInsulation: "Polyiso", commonSurfaces: ["Granule-surfaced cap sheet", "Mineral surfaced"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "app", label: "APP Modified Bitumen", category: "Modified Bitumen", icon: "🟫",
    requiredSections: ["deck", "insulation", "coverBoard", "membrane", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["burPlies", "capSheet", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "APP membrane not specified.", severity: "error" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install insulation ({insulation}).",
      "Install cover board ({coverBoard}).", "Install APP modified bitumen membrane ({membrane}).",
      "Install roof drains and flashing.",
    ],
    metadata: { assemblyType: "Torch-applied APP modified bitumen", membraneExposure: "Exposed", typicalInsulation: "Polyiso", commonSurfaces: ["Granule cap sheet"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "bur", label: "Built-Up Roof (BUR)", category: "Multi-Ply Asphaltic", icon: "🔲",
    requiredSections: ["deck", "insulation", "coverBoard", "burPlies", "capSheet", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "taperedInsulation", "surfacing", "penetrations", "edgeConditions"],
    hiddenSections: ["membrane", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "protectionBoard"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "burPlies", "capSheet", "surfacing"],
    validationRules: [
      { sectionId: "burPlies", message: "BUR plies not specified — required for BUR assembly.", severity: "error" as const },
      { sectionId: "capSheet", message: "Cap sheet or exposed surface not specified.", severity: "error" as const },
      { sectionId: "coverBoard", message: "Cover board not specified — confirm or mark N/A.", severity: "warning" as const },
      { sectionId: "drainage", message: "Drainage details not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Prepare structural roof deck.", "Install vapor retarder where required.",
      "Install insulation ({insulation}).", "Install cover board ({coverBoard}).",
      "Install built-up roofing plies ({burPlies}).", "Install cap sheet or exposed membrane ({capSheet}).",
      "Install roof drains, overflow drains, and flashing.",
    ],
    metadata: { assemblyType: "Multi-ply hot-mopped or cold-applied asphaltic", membraneExposure: "Exposed", typicalInsulation: "Polyiso, XPS", commonSurfaces: ["Gravel ballast", "Mineral cap sheet"], isProtectedMembrane: false, isRecoverable: false, greenRoofCompatible: false },
  },
  {
    systemId: "lam", label: "Liquid Applied Membrane (IRMA)", category: "Protected Membrane", icon: "🔷",
    requiredSections: ["deck", "membrane", "insulation", "drainageMat", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "membrane", message: "Waterproofing membrane not specified — required for IRMA.", severity: "error" as const },
      { sectionId: "drainageMat", message: "Drainage mat not detected — required for IRMA assembly.", severity: "error" as const },
      { sectionId: "insulation", message: "Insulation above membrane not specified — required for IRMA.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed — required above insulation in IRMA.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection sheet/board ({protectionBoard}) above membrane.",
      "Install drainage mat ({drainageMat}) above membrane assembly.",
      "Install insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden (ballast/pavers/green roof).",
      "Install overflow drains and flashing.",
    ],
    metadata: { assemblyType: "Protected membrane — insulation above membrane", membraneExposure: "Protected", typicalInsulation: "XPS (extruded polystyrene)", commonSurfaces: ["Concrete pavers on pedestals", "River ballast", "Green roof"], isProtectedMembrane: true, isRecoverable: true, greenRoofCompatible: true },
  },
  {
    systemId: "hydrotech", label: "Hydrotech MM6125 (IRMA)", category: "Protected Membrane", icon: "🔷",
    requiredSections: ["deck", "membrane", "protectionBoard", "insulation", "filterFabric", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "drainageMat", "pedestals", "ballast", "greenRoof", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast", "pedestals", "greenRoof"],
    validationRules: [
      { sectionId: "membrane", message: "MM6125 membrane not specified.", severity: "error" as const },
      { sectionId: "protectionBoard", message: "Hydroflex® protection sheet not specified — required over MM6125.", severity: "error" as const },
      { sectionId: "insulation", message: "XPS insulation above membrane not specified.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed above insulation.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Apply surface conditioner and install Hydrotech MM6125® rubberized asphalt membrane.",
      "Install Hydroflex® or approved protection sheet.",
      "Install drainage mat ({drainageMat}) if required.",
      "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric above insulation.",
      "Install surface overburden.", "Install overflow drains and flashing.",
    ],
    metadata: { assemblyType: "Protected membrane — rubberized asphalt (Hydrotech)", membraneExposure: "Protected", typicalInsulation: "XPS (extruded polystyrene)", commonSurfaces: ["Pavers on pedestals", "Ballast", "Green roof", "Concrete plaza"], isProtectedMembrane: true, isRecoverable: true, greenRoofCompatible: true },
  },
  {
    systemId: "green", label: "Green Roof (Vegetated Assembly)", category: "Vegetated Assembly", icon: "🌿",
    requiredSections: ["deck", "membrane", "rootBarrier", "drainageLayer", "filterFabric", "growingMedia", "greenRoof", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "insulation", "drainageMat", "irrigation", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "pedestals", "ballast", "ballastRestraint", "concretePavement", "reinforcement", "taperedInsulation"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "rootBarrier", "protectionBoard", "insulation", "drainageMat", "drainageLayer", "filterFabric", "growingMedia", "greenRoof"],
    validationRules: [
      { sectionId: "rootBarrier", message: "Root barrier not specified — required for all vegetated assemblies.", severity: "error" as const },
      { sectionId: "drainageLayer", message: "Drainage layer not specified — required for green roof.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed — required above drainage layer.", severity: "error" as const },
      { sectionId: "growingMedia", message: "Growing media not specified.", severity: "warning" as const },
      { sectionId: "greenRoof", message: "Vegetation type not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).", "Install root barrier above membrane.",
      "Install protection board ({protectionBoard}).", "Install drainage mat and drainage layer ({drainageLayer}).",
      "Install filter fabric above drainage layer.", "Install growing media ({growingMedia}).",
      "Install vegetation assembly ({greenRoof}).", "Install irrigation system where required.",
      "Install overflow drains and flashing.",
    ],
    metadata: { assemblyType: "Vegetated extensive or intensive green roof", membraneExposure: "Buried", typicalInsulation: "XPS, Polyiso", commonSurfaces: ["Sedum", "Grasses", "Intensive planted"], isProtectedMembrane: true, isRecoverable: false, greenRoofCompatible: true },
  },
  {
    systemId: "paver_ped", label: "Paver Pedestal Roof", category: "Overburden Assembly", icon: "🔲",
    requiredSections: ["deck", "membrane", "drainageMat", "insulation", "filterFabric", "pedestals", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "ballast", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "pedestals"],
    validationRules: [
      { sectionId: "pedestals", message: "Pedestal system not specified — required for paver pedestal assembly.", severity: "error" as const },
      { sectionId: "drainageMat", message: "Drainage mat not specified.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed.", severity: "warning" as const },
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).", "Install protection board ({protectionBoard}).",
      "Install drainage mat ({drainageMat}).", "Install XPS insulation ({insulation}) above membrane.",
      "Install filter fabric.", "Install adjustable pedestal system ({pedestals}).",
      "Install concrete pavers on pedestals.", "Install perimeter restraint and flashing.",
    ],
    metadata: { assemblyType: "Protected membrane with pedestal paver overburden", membraneExposure: "Protected", typicalInsulation: "XPS", commonSurfaces: ["Concrete pavers on adjustable pedestals"], isProtectedMembrane: true, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "paver_bal", label: "Paver Ballast Roof", category: "Overburden Assembly", icon: "🔲",
    requiredSections: ["deck", "membrane", "drainageMat", "insulation", "filterFabric", "ballast", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "protectionBoard", "rootBarrier", "ballastRestraint", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "pedestals", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "filterFabric", "ballast"],
    validationRules: [
      { sectionId: "ballast", message: "Ballast not specified — required for ballasted assembly.", severity: "error" as const },
      { sectionId: "drainageMat", message: "Drainage mat not specified.", severity: "error" as const },
      { sectionId: "filterFabric", message: "Filter fabric not confirmed above insulation.", severity: "warning" as const },
      { sectionId: "ballastRestraint", message: "Ballast restraint detail should be reviewed at perimeter.", severity: "info" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}).", "Install drainage mat ({drainageMat}).",
      "Install XPS insulation ({insulation}).", "Install filter fabric above insulation.",
      "Install ballast ({ballast}).", "Install perimeter ballast restraint.",
      "Install overflow drains and flashing.",
    ],
    metadata: { assemblyType: "Protected membrane with ballast overburden", membraneExposure: "Protected", typicalInsulation: "XPS", commonSurfaces: ["River ballast stone", "Concrete pavers"], isProtectedMembrane: true, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "concrete", label: "Concrete Pavement Roof", category: "Hardscape Assembly", icon: "⬜",
    requiredSections: ["deck", "membrane", "protectionBoard", "drainageMat", "concretePavement", "drainage", "flashing"],
    optionalSections: ["vaporRetarder", "insulation", "reinforcement", "rootBarrier", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "taperedInsulation", "filterFabric"],
    defaultLayerOrder: ["deck", "vaporRetarder", "membrane", "protectionBoard", "drainageMat", "insulation", "reinforcement", "concretePavement"],
    validationRules: [
      { sectionId: "membrane", message: "Waterproofing membrane not specified.", severity: "error" as const },
      { sectionId: "concretePavement", message: "Concrete pavement specification not provided.", severity: "error" as const },
      { sectionId: "protectionBoard", message: "Protection board not specified over membrane.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install waterproofing membrane ({membrane}) over structural deck.",
      "Install protection board ({protectionBoard}).", "Install drainage mat ({drainageMat}).",
      "Install insulation ({insulation}) where required.",
      "Install concrete pavement slab ({concretePavement}).",
      "Install saw-cut control joints.", "Install overflow drains and flashing.",
    ],
    metadata: { assemblyType: "Buried membrane below concrete pavement slab", membraneExposure: "Buried", typicalInsulation: "XPS, none", commonSurfaces: ["Concrete pavement slab"], isProtectedMembrane: true, isRecoverable: false, greenRoofCompatible: false },
  },
  {
    systemId: "metal", label: "Standing Seam Metal", category: "Steep-Slope", icon: "🔩",
    requiredSections: ["deck", "membrane", "flashing", "drainage"],
    optionalSections: ["insulation", "vaporRetarder", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "surfacing", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "protectionBoard"],
    defaultLayerOrder: ["deck", "vaporRetarder", "insulation", "membrane"],
    validationRules: [
      { sectionId: "membrane", message: "Metal panel specification not provided.", severity: "error" as const },
      { sectionId: "flashing", message: "Flashing details not specified.", severity: "warning" as const },
    ],
    scopeTemplate: [
      "Install underlayment and vapor barrier.", "Install standing seam metal roofing panels ({membrane}).",
      "Install valley, ridge, and eave flashings.", "Install gutters and downspouts.",
    ],
    metadata: { assemblyType: "Standing seam metal panel system", membraneExposure: "Exposed", typicalInsulation: "Batt, Polyiso", commonSurfaces: ["Steel panels", "Aluminum panels"], isProtectedMembrane: false, isRecoverable: false, greenRoofCompatible: false, typicalSlope: "3:12 min" },
  },
  {
    systemId: "spf", label: "Spray Polyurethane Foam (SPF)", category: "Fluid-Applied", icon: "🟡",
    requiredSections: ["deck", "membrane", "surfacing", "drainage", "flashing"],
    optionalSections: ["insulation", "penetrations", "edgeConditions"],
    hiddenSections: ["coverBoard", "burPlies", "capSheet", "vaporRetarder", "drainageMat", "filterFabric", "rootBarrier", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "taperedInsulation", "protectionBoard"],
    defaultLayerOrder: ["deck", "insulation", "membrane", "surfacing"],
    validationRules: [
      { sectionId: "membrane", message: "SPF thickness and density not specified.", severity: "error" as const },
      { sectionId: "surfacing", message: "Protective coating/surfacing not specified — SPF requires UV protection.", severity: "error" as const },
    ],
    scopeTemplate: [
      "Prepare and clean existing substrate.", "Install spray polyurethane foam ({membrane}).",
      "Apply elastomeric protective coating ({surfacing}).", "Install flashing and roof drains.",
    ],
    metadata: { assemblyType: "Spray-applied closed-cell foam with protective coating", membraneExposure: "Exposed", typicalInsulation: "Integral to SPF", commonSurfaces: ["Elastomeric coating", "Granule-surfaced coating"], isProtectedMembrane: false, isRecoverable: true, greenRoofCompatible: false },
  },
  {
    systemId: "custom", label: "Custom / Other", category: "Custom", icon: "✏️",
    requiredSections: ["drainage", "flashing"],
    optionalSections: ["deck", "vaporRetarder", "insulation", "taperedInsulation", "coverBoard", "burPlies", "capSheet", "surfacing", "membrane", "drainageMat", "filterFabric", "rootBarrier", "protectionBoard", "pedestals", "ballast", "ballastRestraint", "greenRoof", "growingMedia", "drainageLayer", "irrigation", "concretePavement", "reinforcement", "penetrations", "edgeConditions"],
    hiddenSections: [],
    defaultLayerOrder: ["deck", "insulation", "membrane"],
    validationRules: [],
    scopeTemplate: ["Perform roofing work per contract documents."],
    metadata: { assemblyType: "Custom or unlisted assembly", membraneExposure: "Exposed", typicalInsulation: "Varies", commonSurfaces: ["Varies"], isProtectedMembrane: false, isRecoverable: false, greenRoofCompatible: false },
  },
];

export const seed = mutation({
  handler: async (ctx) => {
    let inserted = 0;
    for (const config of SEED_CONFIGS) {
      const existing = await ctx.db
        .query("bidshield_roofSystemConfigs")
        .withIndex("by_systemId", (q) => q.eq("systemId", config.systemId))
        .first();
      if (existing) continue;
      await ctx.db.insert("bidshield_roofSystemConfigs", {
        systemId: config.systemId,
        label: config.label,
        category: config.category,
        icon: config.icon,
        requiredSections: [...config.requiredSections] as string[],
        optionalSections: [...config.optionalSections] as string[],
        hiddenSections: [...config.hiddenSections] as string[],
        defaultLayerOrder: [...config.defaultLayerOrder] as string[],
        validationRules: config.validationRules.map((r) => ({ ...r })),
        scopeTemplate: [...config.scopeTemplate] as string[],
        metadata: { ...config.metadata },
        seeded: true,
      });
      inserted++;
    }
    return { inserted };
  },
});
