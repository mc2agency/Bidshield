import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores customer information
  users: defineTable({
    email: v.string(),
    name: v.string(),
    clerkId: v.string(), // Clerk authentication ID
    membershipLevel: v.union(
      v.literal("free"),
      v.literal("course"),
      v.literal("pro")
    ),
    purchasedCourses: v.array(v.string()),
    purchasedProducts: v.array(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"]),

  // Purchase history (from Gumroad)
  purchases: defineTable({
    userId: v.id("users"),
    email: v.string(), // For matching before user account exists
    productId: v.string(), // Gumroad product ID
    productName: v.string(),
    productType: v.union(
      v.literal("course"),
      v.literal("product"),
      v.literal("membership")
    ),
    amount: v.number(), // in cents
    currency: v.string(),
    gumroadOrderId: v.string(),
    gumroadSaleId: v.string(),
    purchasedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_gumroad_order", ["gumroadOrderId"])
    .index("by_gumroad_sale", ["gumroadSaleId"]),

});
