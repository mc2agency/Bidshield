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
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
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

  // Projects (bids being worked on)
  bidshield_projects: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    location: v.string(),
    bidDate: v.string(), // YYYY-MM-DD
    bidTime: v.optional(v.string()),
    status: v.union(
      v.literal("setup"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("no_bid")
    ),
    trade: v.optional(v.string()), // "roofing", "concrete", etc.
    systemType: v.optional(v.string()), // "tpo", "sbs", "epdm", etc.
    deckType: v.optional(v.string()), // "steel", "concrete", "wood", etc.
    gc: v.optional(v.string()), // General Contractor
    owner: v.optional(v.string()),
    sqft: v.optional(v.number()),
    estimatedValue: v.optional(v.number()),
    assemblies: v.array(v.string()), // ["RT-1 IRMA", "RT-2 Green Roof"]
    grossRoofArea: v.optional(v.number()), // Control number from site plan (SF)
    notes: v.optional(v.string()),
    // Bid pricing
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["userId", "status"]),

  // Takeoff sections for reconciliation
  bidshield_takeoff_sections: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
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
    .index("by_user_project", ["userId", "projectId"]),

  // Vendor quotes
  bidshield_quotes: defineTable({
    userId: v.string(),
    projectId: v.optional(v.id("bidshield_projects")), // Can be project-specific or general
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["userId", "status"]),

  // RFIs (Request for Information)
  bidshield_rfis: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    question: v.string(),
    sentTo: v.optional(v.string()), // GC/Architect email
    sentAt: v.optional(v.number()),
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
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
    .index("by_user", ["userId"]),

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
    number: v.number(), // Addendum #1, #2, etc.
    title: v.string(),
    receivedDate: v.string(),
    affectsScope: v.boolean(),
    acknowledged: v.boolean(),
    incorporated: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // Project materials (calculated material list per project)
  bidshield_project_materials: defineTable({
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  // User-saved material prices (personal price book)
  bidshield_user_material_prices: defineTable({
    userId: v.string(),
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
});
