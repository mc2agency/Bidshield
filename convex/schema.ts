import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores customer information
  users: defineTable({
    email: v.string(),
    name: v.string(),
    clerkId: v.string(),
    membershipLevel: v.union(
      v.literal("free"),
      v.literal("course"),
      v.literal("pro"),
      v.literal("bidshield") // BidShield subscriber
    ),
    purchasedCourses: v.array(v.string()),
    purchasedProducts: v.array(v.string()),
    bidshieldSubscription: v.optional(v.object({
      plan: v.union(v.literal("monthly"), v.literal("annual")),
      status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
      stripeSubscriptionId: v.optional(v.string()),
      currentPeriodEnd: v.number(),
    })),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    systemSubstitutions: v.optional(v.array(v.object({
      from: v.string(), // e.g. "lam"
      to: v.string(),   // e.g. "hydrotech"
    }))),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"]),

  // Purchase history
  purchases: defineTable({
    userId: v.id("users"),
    email: v.string(),
    productId: v.string(),
    productName: v.string(),
    productType: v.union(
      v.literal("course"),
      v.literal("product"),
      v.literal("membership"),
      v.literal("bidshield")
    ),
    amount: v.number(),
    currency: v.string(),
    gumroadOrderId: v.optional(v.string()),
    gumroadSaleId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    purchasedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_gumroad_order", ["gumroadOrderId"])
    .index("by_gumroad_sale", ["gumroadSaleId"]),

  // ===== BIDSHIELD TABLES =====

  // Bid Invites - track incoming bid opportunities before creating projects
  bidInvites: defineTable({
    userId: v.string(), // Clerk user ID (matches bidshield_projects pattern)
    convexUserId: v.optional(v.id("users")),
    
    // Core fields
    projectName: v.string(),
    gc: v.string(), // General Contractor
    bidDateTime: v.number(), // Unix timestamp of bid deadline
    
    // Contact info
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    
    // Additional details
    prebidMeeting: v.optional(v.object({
      dateTime: v.number(), // Unix timestamp
      location: v.string(),
    })),
    plansLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    
    // Source tracking
    source: v.union(
      v.literal("manual"),
      v.literal("ai-extraction"),
      v.literal("email-forward")
    ),
    rawEmailBody: v.optional(v.string()), // Original email if extracted
    extractedData: v.optional(v.any()), // Full AI response for debugging
    
    // Status workflow
    status: v.union(
      v.literal("new"),        // Just received
      v.literal("pursuing"),   // Decided to bid
      v.literal("pass"),       // Decided not to bid
      v.literal("converted")   // Created a project from this invite
    ),
    
    // Link to created project
    projectId: v.optional(v.id("bidshield_projects")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_convex_user_id", ["convexUserId"])
    .index("by_status", ["status"])
    .index("by_bid_date", ["bidDateTime"])
    .index("by_user_and_status", ["userId", "status"]),

  // Projects (bids being worked on)
  bidshield_projects: defineTable({
    // TODO (M9): userId is stored as a plain Clerk ID string rather than a typed
    // v.id("users") reference. This prevents Convex from enforcing referential
    // integrity. Migrate to v.id("users") (storing the Convex _id) in a future
    // schema migration once all write paths are updated to use the Convex user _id.
    userId: v.string(), // Clerk user ID
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    name: v.string(),
    location: v.string(),
    bidDate: v.string(), // YYYY-MM-DD
    drawingDate: v.optional(v.string()),     // date on drawing set (YYYY-MM-DD or free text)
    drawingRevision: v.optional(v.string()), // revision label e.g. "Rev 3", "95% CD"
    bidTime: v.optional(v.string()),
    status: v.union(
      v.literal("setup"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("no_award"),
      v.literal("no_bid")
    ),
    trade: v.optional(v.string()), // "roofing", "concrete", etc.
    projectType: v.optional(v.string()), // "new_construction", "reroof", "recover", "repair"
    systemType: v.optional(v.string()), // "tpo", "sbs", "epdm", etc.
    deckType: v.optional(v.string()), // "steel", "concrete", "wood", etc.
    gc: v.optional(v.string()), // General Contractor
    owner: v.optional(v.string()),
    sqft: v.optional(v.number()),
    estimatedValue: v.optional(v.number()), // DEPRECATED — use totalBidAmount. Kept for legacy doc compatibility.
    assemblies: v.array(v.string()), // ["RT-1 IRMA", "RT-2 Green Roof"]
    // Structured roof assemblies — each assembly defines a roof area with its layer stack
    roofAssemblies: v.optional(v.array(v.object({
      label: v.string(),                       // "RT-01", "RT-02"
      name: v.optional(v.string()),            // "IRMA Roof w/ Drained Pavers"
      systemType: v.string(),                  // "sbs", "epdm", "tpo"
      deckType: v.optional(v.string()),        // per-assembly deck override
      insulationType: v.optional(v.string()),  // "xps", "polyiso", "eps", "vacuum"
      insulationThickness: v.optional(v.string()), // "8in", "3in", "1.5in"
      rValue: v.optional(v.number()),          // assembly R-value (e.g. 41.73)
      surfaceType: v.optional(v.string()),     // "pavers_pedestals", "green_roof", "exposed"
      vaporRetarder: v.optional(v.boolean()),
      protectionBoard: v.optional(v.string()),
      drainageMat: v.optional(v.boolean()),
      filterFabric: v.optional(v.boolean()),
      coverBoard: v.optional(v.string()),
      layers: v.optional(v.array(v.string())), // AI-extracted layer stack from deck to top
      aiDescription: v.optional(v.string()),   // per-assembly AI layer description
      enabled: v.optional(v.boolean()),        // ON/OFF toggle
      area: v.optional(v.number()),            // assembly area in SF
      uValue: v.optional(v.number()),          // thermal U-value
      attachmentMethod: v.optional(v.string()), // "mechanically_attached" | "fully_adhered" | "ballasted" | "self_adhered" | "hybrid" | "unknown"
    }))),
    systemDescription: v.optional(v.string()), // AI-generated project-level system summary
    specSummary: v.optional(v.string()), // JSON-stringified spec extraction result
    bidType: v.optional(v.string()), // "gc_invited", "private", "public", "pre_selective", "design_build", "negotiated"
    bidContactName: v.optional(v.string()),
    bidContactEmail: v.optional(v.string()),
    bidContactPhone: v.optional(v.string()),
    grossRoofArea: v.optional(v.number()), // Control number from site plan (SF)
    notes: v.optional(v.string()),
    // Bid pricing — canonical field is totalBidAmount
    totalBidAmount: v.optional(v.number()),
    materialCost: v.optional(v.number()),
    laborCost: v.optional(v.number()),
    otherCost: v.optional(v.number()),
    primaryAssembly: v.optional(v.string()),
    // Outcome details
    lossReason: v.optional(v.string()),
    lossReasonNote: v.optional(v.string()),
    completedDate: v.optional(v.string()),
    // Post-award tracking (won projects)
    actualCost: v.optional(v.number()),
    actualMaterialCost: v.optional(v.number()),
    actualLaborCost: v.optional(v.number()),
    actualOtherCost: v.optional(v.number()),
    postJobStatus: v.optional(v.string()), // "in_progress", "completed", "actuals_entered"
    postJobNotes: v.optional(v.string()), // Lessons learned, variance explanations
    fmGlobal: v.optional(v.boolean()), // Is this building FM Global insured?
    pre1990: v.optional(v.boolean()), // Was this building constructed before 1990?
    competitorName: v.optional(v.string()), // Who won when you lost
    competitorPrice: v.optional(v.number()), // Competitor's bid price
    energyCode: v.optional(v.boolean()), // Does project replace >50% roof area or >2,000 SF?
    climateZone: v.optional(v.string()), // ASHRAE climate zone (1-8)
    noAddendaAcknowledged: v.optional(v.boolean()), // User confirmed no addenda for this project
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_status", ["userId", "status"]),

  // Takeoff sections for reconciliation
  bidshield_takeoff_sections: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    name: v.string(),
    assemblyType: v.string(),
    squareFeet: v.number(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Takeoff line items (linear LF + count EA) for reconciliation
  bidshield_takeoff_line_items: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    category: v.union(v.literal("linear"), v.literal("count")),
    itemType: v.string(), // e.g., "parapet_wall", "pipe_penetration"
    label: v.string(),
    quantity: v.optional(v.number()), // null = not yet measured
    unit: v.string(), // "LF" or "EA"
    verified: v.boolean(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_category", ["projectId", "category"]),

  // Checklist items for each project
  bidshield_checklist_items: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    phaseKey: v.string(), // "phase1", "phase2", etc
    itemId: v.string(), // "p1-1", "p1-2", etc
    status: v.union(
      v.literal("pending"),
      v.literal("done"),
      v.literal("rfi"),
      v.literal("na"),
      v.literal("warning")
    ),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user_project", ["userId", "projectId"])
    .index("by_project_status", ["projectId", "status"]),

  // Account-level vendor address book
  bidshield_vendors: defineTable({
    userId: v.string(), // Clerk user ID
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    companyName: v.string(),
    repName: v.optional(v.string()),
    repPhone: v.optional(v.string()),
    repEmail: v.optional(v.string()),
    territory: v.optional(v.string()),
    categories: v.array(v.string()), // "membrane", "insulation", "fasteners", etc.
    notes: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_user_active", ["userId", "active"]),

  // Vendor quotes
  bidshield_quotes: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    projectId: v.optional(v.id("bidshield_projects")), // Can be project-specific or general
    vendorId: v.optional(v.id("bidshield_vendors")), // Link to vendor record
    vendorName: v.string(),
    vendorEmail: v.optional(v.string()),
    vendorPhone: v.optional(v.string()),
    category: v.string(), // "insulation", "membrane", "metal", etc
    products: v.array(v.string()),
    quoteAmount: v.optional(v.number()),
    quoteDate: v.optional(v.string()),
    expirationDate: v.optional(v.string()),
    status: v.union(
      v.literal("none"),
      v.literal("requested"),
      v.literal("received"),
      v.literal("valid"),
      v.literal("expiring"),
      v.literal("expired")
    ),
    notes: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    sourcePdf: v.optional(v.string()),
    isExtracted: v.optional(v.boolean()),
    globalQuoteId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["userId", "status"]),

  // RFIs (Request for Information)
  bidshield_rfis: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    question: v.string(),
    sentTo: v.optional(v.string()), // GC/Architect email
    sentAt: v.optional(v.number()),
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    responseDeadline: v.optional(v.string()), // E-11: YYYY-MM-DD deadline for response
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("answered"),
      v.literal("closed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_status", ["projectId", "status"]),

  // ===== LEADS & CONTACT =====

  // Email subscribers (checklist downloads, newsletter)
  email_subscribers: defineTable({
    email: v.string(),
    source: v.string(), // "checklist", "newsletter", "contact_form"
    subscribedAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Contact form submissions
  contact_submissions: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    newsletter: v.boolean(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied")
    ),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  // Addenda tracking per project
  bidshield_addenda: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    number: v.number(), // Addendum #1, #2, etc.
    title: v.string(),
    receivedDate: v.string(),
    affectsScope: v.optional(v.boolean()), // null = not yet reviewed
    acknowledged: v.boolean(),
    incorporated: v.boolean(),
    scopeImpact: v.optional(v.string()), // What changed for your scope
    repriced: v.optional(v.boolean()), // Have you re-priced for this?
    repricedDate: v.optional(v.string()), // When re-pricing completed
    priceImpact: v.optional(v.number()), // Dollar impact: +4500 or -2000
    impactCategories: v.optional(v.string()), // Comma-separated: "material,labor,schedule,scope"
    priority: v.optional(v.string()), // "critical", "high", "normal", "low"
    notes: v.optional(v.string()),
    // Review tracking fields
    reviewStatus: v.optional(v.union(v.literal("reviewed"), v.literal("pending_review"))),
    reviewedBy: v.optional(v.string()), // userId of reviewer
    reviewedAt: v.optional(v.number()), // timestamp
    aiImpacts: v.optional(v.string()), // JSON: { impacts: ImpactItem[], summary: string }
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Project materials (calculated material list per project)
  bidshield_project_materials: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    templateKey: v.optional(v.string()), // links to static template, null for custom
    category: v.string(), // "membrane", "insulation", "fasteners", "adhesive", "edge_metal", "accessories"
    name: v.string(),
    unit: v.string(), // "RL", "BD", "BX", "CS", "GL", "PC", "EA"
    calcType: v.string(), // "coverage", "qty_per_sf", "linear_from_takeoff", "count_from_takeoff", "fixed"
    quantity: v.optional(v.number()), // calculated or manual
    unitPrice: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    wasteFactor: v.number(), // 1.0 = no waste, 1.10 = 10% waste
    coverage: v.optional(v.number()), // SF per unit (for coverage calc)
    qtyPerSf: v.optional(v.number()), // units per SF (for qty_per_sf calc)
    takeoffItemType: v.optional(v.string()), // links to takeoff line item type for linear/count
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    // Verification fields
    coverageRate: v.optional(v.string()),   // e.g. "100 SF/RL" — from report, AI, or manual
    coverageSource: v.optional(v.string()), // "report" | "ai_estimated" | "manual"
    // Quote linkage — explicit link to the vendor quote a price came from, so the
    // Validator can deterministically flag stale/expired vendor pricing instead of
    // relying on fuzzy name matching.
    quoteId: v.optional(v.id("bidshield_quotes")),
    extractedFromPdf: v.optional(v.boolean()),
    pricingVerified: v.optional(v.boolean()),
    coverageVerified: v.optional(v.boolean()),
    wasteVerified: v.optional(v.boolean()),
    manufacturer: v.optional(v.string()), // vendor/manufacturer brand (Siplast, Hydrotech, etc.)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_category", ["projectId", "category"]),

  // Scope items (scope gap checker per project)
  bidshield_scope_items: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    category: v.string(), // "demolition", "access", "protection", "schedule", "flashing", "warranty", "safety", "general"
    name: v.string(),
    status: v.union(
      v.literal("unaddressed"),
      v.literal("included"),
      v.literal("excluded"),
      v.literal("by_others"),
      v.literal("na")
    ),
    cost: v.optional(v.number()), // cost if included
    note: v.optional(v.string()),
    isDefault: v.boolean(), // true = auto-generated, false = user-added
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_status", ["projectId", "status"]),

  // Bid Qualifications tracker per project (one document per project)
  bidshield_bid_quals: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    plansDated: v.optional(v.string()),
    planRevision: v.optional(v.string()),
    specSections: v.optional(v.string()),
    addendaThrough: v.optional(v.number()),
    drawingSheets: v.optional(v.string()),
    laborType: v.optional(v.union(v.literal("open_shop"), v.literal("prevailing_wage"), v.literal("union"))),
    wageDeterminationNum: v.optional(v.string()),
    wageDeterminationDate: v.optional(v.string()),
    unionLocal: v.optional(v.string()),
    laborBurdenRate: v.optional(v.string()),
    estimatedDuration: v.optional(v.string()),
    earliestStart: v.optional(v.string()),
    materialLeadTime: v.optional(v.string()),
    submittalTurnaround: v.optional(v.string()),
    bidGoodFor: v.optional(v.string()),
    insuranceProgram: v.optional(v.union(v.literal("own"), v.literal("ccip"), v.literal("ocip"))),
    wrapUpNotes: v.optional(v.string()),
    additionalInsuredRequired: v.optional(v.boolean()),
    buildersRiskBy: v.optional(v.union(v.literal("owner"), v.literal("gc"), v.literal("included"))),
    bondRequired: v.optional(v.boolean()),
    bondTypes: v.optional(v.string()),
    bondAmount: v.optional(v.number()),       // dollar amount
    bondAmountPct: v.optional(v.number()),    // percentage of bid (e.g. 100 = 100%)
    bondAmountType: v.optional(v.string()),   // "dollar" | "percentage"
    suretyCompany: v.optional(v.string()),
    suretyAgent: v.optional(v.string()),
    bondStatus: v.optional(v.string()),       // "not_started" | "in_progress" | "obtained" | "waived"
    emr: v.optional(v.string()),
    mbeGoals: v.optional(v.boolean()),
    mbeGoalPct: v.optional(v.string()),
    mbeCertifications: v.optional(v.string()),
    certifiedPayrollRequired: v.optional(v.boolean()),
    safetyPlanRequired: v.optional(v.boolean()),
    backgroundChecksRequired: v.optional(v.boolean()),
    qualificationsNotes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // Scope clarifications & assumptions per project
  bidshield_scope_clarifications: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // User-saved material prices (personal price book)
  bidshield_user_material_prices: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    materialName: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    vendorName: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_material", ["userId", "materialName"]),

  // Custom labor rates (user-specific)
  bidshield_labor_rates: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    category: v.string(), // "membrane", "flashing", "insulation"
    task: v.string(),
    rate: v.string(), // "450 SF/day"
    unit: v.string(),
    crew: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["userId", "category"]),

  // AI-generated labor task breakdown per project
  bidshield_laborTasks: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    category: v.string(),           // "membrane", "insulation", "flashing", "tearoff", "accessories", "other"
    task: v.string(),               // e.g. "TPO Membrane Install"
    unit: v.string(),               // "SF", "LF", "EA", "Day"
    quantity: v.number(),
    ratePerUnit: v.number(),        // loaded rate per unit
    totalCost: v.number(),
    crewSize: v.number(),
    days: v.optional(v.number()),   // duration estimate
    notes: v.optional(v.string()),
    rateFlag: v.optional(v.string()),  // "low" | "high" | "ok" — vs user rate DB
    detailType: v.optional(v.string()), // "SF_based" | "LF_based" | "count" | "lump_sum"
    verified: v.boolean(),          // user-confirmed
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // GC bid form documents (uploaded per project)
  bidshield_gcBidFormDocuments: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    label: v.string(),
    uploadedAt: v.number(),
    processed: v.boolean(),
    itemCount: v.number(),
    confirmedCount: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Items extracted from GC bid form documents
  bidshield_gcBidFormItems: defineTable({
    documentId: v.id("bidshield_gcBidFormDocuments"),
    projectId: v.id("bidshield_projects"),
    questionText: v.string(),
    itemType: v.union(v.literal("fill-in"), v.literal("scope-item")),
    autoConfirmed: v.boolean(),
    confirmedValue: v.optional(v.string()),
    matchedField: v.optional(v.string()),
    foundInScope: v.optional(v.boolean()),
    foundInChecklist: v.optional(v.boolean()),
    manuallyChecked: v.boolean(),
    notes: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_project", ["projectId"]),

  // AI labor analysis metadata per project (one record per analysis run)
  bidshield_laborAnalysis: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    inputSummary: v.string(),       // what the user described
    laborType: v.string(),          // "open_shop" | "prevailing_wage" | "union"
    baseWage: v.number(),           // $/hr
    burdenMultiplier: v.number(),   // 1.35 | 1.55 | 1.65
    loadedRate: v.number(),         // baseWage * burdenMultiplier * 8
    totalLaborCost: v.number(),
    totalDays: v.optional(v.number()),
    laborPerSf: v.optional(v.number()),
    scheduleConflict: v.optional(v.boolean()),
    scheduleNote: v.optional(v.string()),
    assumptions: v.array(v.string()),  // AI-stated assumptions
    warnings: v.array(v.string()),     // AI-stated warnings / Gen. Conds flags
    analyzedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // General Conditions line items per project
  bidshield_gc_items: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    category: v.string(), // "bidding", "site", "safety", "supervision", "insurance", "markup"
    description: v.string(),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    unitCost: v.optional(v.number()),
    total: v.optional(v.number()),
    notes: v.optional(v.string()),
    isMarkup: v.optional(v.boolean()), // true = percentage-based markup row
    markupPct: v.optional(v.number()), // e.g. 10 = 10%
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Master material/product datasheet library (global, per user)
  bidshield_datasheets: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    productName: v.string(),
    category: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    coverage: v.optional(v.number()),      // SF per unit (e.g. 1000 SF/RL)
    coverageUnit: v.optional(v.string()),  // e.g. "SF/RL"
    vendorName: v.optional(v.string()),
    quoteDate: v.optional(v.string()),     // YYYY-MM-DD — the date on the price list
    pdfUrl: v.optional(v.string()),        // External URL for manually-added spec sheets
    sourcePdf: v.optional(v.string()),     // Convex storage ID for uploaded PDFs
    isExtracted: v.optional(v.boolean()), // true = AI-extracted from price sheet
    quoteId: v.optional(v.id("bidshield_quotes")), // source quote (if auto-populated)
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_product", ["userId", "productName"]),

  // Submission tracking — records how/when a bid was submitted
  bidshield_submissions: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    method: v.union(
      v.literal("email"),
      v.literal("portal"),
      v.literal("hand_delivered"),
      v.literal("mail"),
      v.literal("fax"),
      v.literal("other")
    ),
    portalOrRecipient: v.optional(v.string()), // portal URL or recipient name/email
    confirmationNumber: v.optional(v.string()),
    submittedAt: v.number(), // unix ms timestamp of submission
    notes: v.optional(v.string()),
    bidScore: v.optional(v.number()), // score at time of submission
    thresholdBypassed: v.optional(v.boolean()), // estimator acknowledged low score
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Pre-bid meeting tracker
  bidshield_prebid_meetings: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    meetingDate: v.string(), // YYYY-MM-DD
    mandatory: v.boolean(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    attendees: v.optional(v.string()), // comma-separated or free text
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Alternate pricing line items per project
  bidshield_alternates: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    label: v.string(), // e.g. "Alt 1 — Add TPO over metal"
    type: v.union(v.literal("add"), v.literal("deduct")),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Checklist templates — user-saved QA checklists per roof system type
  bidshield_checklist_templates: defineTable({
    userId: v.string(), // Clerk user ID
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    name: v.string(), // e.g. "TPO Standard", "SBS Mod Bit - FM Global"
    systemType: v.optional(v.string()), // "tpo", "sbs", "epdm", "metal", etc.
    // Snapshot of item statuses (only non-pending items stored to keep it lean)
    items: v.array(v.object({
      phaseKey: v.string(), // "phase1", "phase9", etc.
      itemId: v.string(),   // "p1-1", "p9-3", etc.
      status: v.union(
        v.literal("pending"),
        v.literal("done"),
        v.literal("rfi"),
        v.literal("na"),
        v.literal("warning")
      ),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Processed webhook events — idempotency guard for Stripe/Gumroad webhooks.
  // Before processing any webhook, check this table by stripeEventId. If found,
  // skip processing (event already handled). Prevents duplicate writes on Stripe retries.
  processedWebhooks: defineTable({
    stripeEventId: v.string(), // Stripe event.id (e.g. "evt_1abc...")
    processedAt: v.number(),   // Unix ms timestamp
  })
    .index("by_stripe_event_id", ["stripeEventId"]),

  // Decision log — paper trail for estimating decisions per project
  bidshield_decisions: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    text: v.string(),
    who: v.optional(v.string()),
    section: v.string(),
    timestamp: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_section", ["projectId", "section"]),

  // Distributed rate limit entries — each row is one API call by a user.
  // To check rate: count rows for (userId, action) in the last windowMs.
  // Rows older than 1 hour can be garbage-collected in a scheduled job.
  rateLimits: defineTable({
    userId: v.string(),    // Clerk user ID
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    action: v.string(),    // e.g. "ai_endpoint", "demo_email"
    timestamp: v.number(), // Date.now() when the call was made
  })
    .index("by_user_action", ["userId", "action"])
    .index("by_user_action_time", ["userId", "action", "timestamp"]),

  // L-15: In-app notifications (quote expirations, reminders, system alerts)
  bidshield_notifications: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    type: v.string(),         // "quote_expiring" | "quote_expired" | "bid_due_soon" | "system"
    title: v.string(),
    message: v.string(),
    projectId: v.optional(v.id("bidshield_projects")),
    quoteId: v.optional(v.id("bidshield_quotes")),
    read: v.boolean(),
    dismissedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_user_created", ["userId", "createdAt"]),

  // L-16: AI usage tracking — logs each AI API call for dashboard/rate visibility
  bidshield_ai_usage: defineTable({
    userId: v.string(),
    convexUserId: v.optional(v.id("users")), // M-9: Convex native user ref
    endpoint: v.string(),     // "analyze-labor" | "extract-quote" | "extract-price-sheet"
    model: v.optional(v.string()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    projectId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_convex_user", ["convexUserId"])
    .index("by_user_endpoint", ["userId", "endpoint"])
    .index("by_user_created", ["userId", "createdAt"]),
  // Individual spec documents uploaded to a project (base spec, addenda, related divisions)
  // Each row is one uploaded PDF with its own AI extraction. Materials merge across rows.
  bidshield_project_specs: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")),
    label: v.string(), // "Base Spec", "Addendum 2", "Div 05 Metal Deck"
    sourceType: v.union(
      v.literal("base_spec"),
      v.literal("addendum"),
      v.literal("related_division"),
      v.literal("other"),
    ),
    addendumId: v.optional(v.id("bidshield_addenda")), // link back when extracted from addenda tab
    filename: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // original PDF
    extractionJson: v.string(), // JSON-stringified extraction result
    extractedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_addendum", ["addendumId"]),

  // Product datasheets / submittals — auto-fetched from manufacturer sites
  bidshield_submittals: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    convexUserId: v.optional(v.id("users")),
    productName: v.string(),
    manufacturer: v.optional(v.string()),
    category: v.optional(v.string()),
    sourceUrl: v.string(), // original PDF URL on manufacturer site
    storageId: v.optional(v.id("_storage")), // Convex file storage
    fileSize: v.optional(v.number()),
    title: v.optional(v.string()), // search result title
    status: v.union(
      v.literal("found"),
      v.literal("downloaded"),
      v.literal("failed"),
      v.literal("manual"),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_product", ["projectId", "productName"]),

  // ── Schema-driven roof assemblies (separate table, replaces embedded over time) ──
  bidshield_roofAssemblies: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    label: v.string(),
    roofName: v.optional(v.string()),
    roofArea: v.optional(v.number()),
    systemType: v.string(),
    insulationType: v.optional(v.string()),
    insulationThickness: v.optional(v.string()),
    rValue: v.optional(v.number()),
    uValue: v.optional(v.number()),
    surfaceType: v.optional(v.string()),
    coverBoard: v.optional(v.string()),
    deckType: v.optional(v.string()),
    attachmentMethod: v.optional(v.string()),
    slope: v.optional(v.string()),
    sectionValues: v.optional(v.record(v.string(), v.union(v.string(), v.boolean(), v.null()))),
    layers: v.optional(v.array(v.string())),
    extractedFromPdf: v.optional(v.boolean()),
    extractionMetadata: v.optional(v.object({
      confidence: v.optional(v.number()),
      model: v.optional(v.string()),
      drawingLabel: v.optional(v.string()),
      drawingPage: v.optional(v.string()),
      drawingRevision: v.optional(v.string()),
    })),
    warnings: v.optional(v.array(v.string())),
    generatedLayers: v.optional(v.array(v.string())),
    generatedScope: v.optional(v.array(v.string())),
    confidence: v.optional(v.number()),
    drawingReferences: v.optional(v.array(v.object({
      label: v.string(),
      date: v.optional(v.string()),
      page: v.optional(v.string()),
      revision: v.optional(v.string()),
    }))),
    enabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_system", ["projectId", "systemType"]),

  // ── Roof system configs (seeded once, drives dynamic form sections) ──
  bidshield_roofSystemConfigs: defineTable({
    systemId: v.string(),
    label: v.string(),
    category: v.string(),
    icon: v.optional(v.string()),
    requiredSections: v.array(v.string()),
    optionalSections: v.array(v.string()),
    hiddenSections: v.array(v.string()),
    defaultLayerOrder: v.array(v.string()),
    validationRules: v.array(v.object({
      sectionId: v.string(),
      message: v.string(),
      severity: v.union(v.literal("error"), v.literal("warning"), v.literal("info")),
    })),
    scopeTemplate: v.array(v.string()),
    metadata: v.object({
      assemblyType: v.string(),
      membraneExposure: v.string(),
      typicalInsulation: v.string(),
      commonSurfaces: v.array(v.string()),
      isProtectedMembrane: v.boolean(),
      isRecoverable: v.boolean(),
      greenRoofCompatible: v.boolean(),
      typicalSlope: v.optional(v.string()),
    }),
    seeded: v.optional(v.boolean()),
  })
    .index("by_systemId", ["systemId"]),
});
