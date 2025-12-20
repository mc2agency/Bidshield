import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from Clerk authentication
export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists by Clerk ID
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update last login
      await ctx.db.patch(existing._id, {
        lastLoginAt: Date.now(),
      });
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      clerkId: args.clerkId,
      membershipLevel: "free",
      purchasedCourses: [],
      purchasedProducts: [],
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });

    // Check for existing purchases with this email and link them
    const orphanedPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (orphanedPurchases.length > 0) {
      // Use Sets to avoid duplicates and enable O(1) lookups
      const courses = new Set<string>();
      const products = new Set<string>();
      let hasMembership = false;

      // Categorize purchases first (no DB calls)
      for (const purchase of orphanedPurchases) {
        if (purchase.productType === "course") {
          courses.add(purchase.productId);
        } else if (purchase.productType === "product") {
          products.add(purchase.productId);
        } else if (purchase.productType === "membership") {
          hasMembership = true;
        }
      }

      // Batch all purchase patches in parallel (single round-trip)
      await Promise.all(
        orphanedPurchases.map((purchase) =>
          ctx.db.patch(purchase._id, { userId })
        )
      );

      // Update user with purchased items
      await ctx.db.patch(userId, {
        purchasedCourses: [...courses],
        purchasedProducts: [...products],
        membershipLevel: hasMembership ? "pro" : "free",
      });
    }

    return userId;
  },
});

// Get current user info
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

// Check if user has access to a course
export const hasAccessToCourse = query({
  args: {
    clerkId: v.string(),
    courseId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return false;

    // Pro members have access to all courses
    if (user.membershipLevel === "pro") return true;

    // Check if user purchased this specific course
    return user.purchasedCourses.includes(args.courseId);
  },
});

// Grant course access (used by Gumroad webhook)
export const grantCourseAccess = mutation({
  args: {
    email: v.string(),
    courseId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found. They need to create an account first.");
    }

    // Add course to purchased courses if not already there
    if (!user.purchasedCourses.includes(args.courseId)) {
      await ctx.db.patch(user._id, {
        purchasedCourses: [...user.purchasedCourses, args.courseId],
      });
    }

    return user._id;
  },
});
