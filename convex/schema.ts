import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores student information
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

  // Course progress tracking
  courseProgress: defineTable({
    userId: v.id("users"),
    courseId: v.string(), // e.g., "bluebeam-mastery"
    lessonId: v.string(), // e.g., "module-1-lesson-1"
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    videoProgress: v.optional(v.number()), // seconds watched
    lastWatchedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_lesson", ["userId", "courseId", "lessonId"]),

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

  // Quiz results (for learning center quizzes)
  quizResults: defineTable({
    userId: v.id("users"),
    quizId: v.string(),
    score: v.number(), // 0-100
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.string(),
        correct: v.boolean(),
      })
    ),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_quiz", ["userId", "quizId"]),

  // User notes (students can take notes during lessons)
  lessonNotes: defineTable({
    userId: v.id("users"),
    courseId: v.string(),
    lessonId: v.string(),
    content: v.string(),
    timestamp: v.optional(v.number()), // Video timestamp for the note
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_lesson", ["userId", "courseId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),
});
