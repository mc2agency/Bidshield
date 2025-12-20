import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Handle Gumroad webhook purchase
export const handleGumroadPurchase = mutation({
  args: {
    email: v.string(),
    productId: v.string(),
    productName: v.string(),
    amount: v.number(),
    currency: v.string(),
    gumroadOrderId: v.string(),
    gumroadSaleId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    // Determine product type based on product ID
    let productType: "course" | "product" | "membership" = "product";

    // Course IDs
    const courseIds = [
      'bluebeam-mastery',
      'estimating-fundamentals',
      'measurement-technology',
      'construction-submittals',
      'autocad-submittals',
      'estimating-software',
      'sketchup-visualization',
    ];

    // Membership IDs
    const membershipIds = ['mc2-pro-membership'];

    if (courseIds.includes(args.productId)) {
      productType = "course";
    } else if (membershipIds.includes(args.productId)) {
      productType = "membership";
    } else {
      productType = "product";
    }

    // Record the purchase
    const purchaseId = await ctx.db.insert("purchases", {
      userId: user?._id!,
      email: args.email,
      productId: args.productId,
      productName: args.productName,
      productType,
      amount: args.amount,
      currency: args.currency,
      gumroadOrderId: args.gumroadOrderId,
      gumroadSaleId: args.gumroadSaleId,
      purchasedAt: Date.now(),
    });

    // Grant access if user exists
    if (user) {
      if (productType === "course") {
        // Add course to user's purchased courses
        if (!user.purchasedCourses.includes(args.productId)) {
          await ctx.db.patch(user._id, {
            purchasedCourses: [...user.purchasedCourses, args.productId],
          });
        }
      } else if (productType === "product") {
        // Add product to user's purchased products
        if (!user.purchasedProducts.includes(args.productId)) {
          await ctx.db.patch(user._id, {
            purchasedProducts: [...user.purchasedProducts, args.productId],
          });
        }
      } else if (productType === "membership") {
        // Upgrade user to pro membership
        await ctx.db.patch(user._id, {
          membershipLevel: "pro",
        });
      }
    }

    return {
      purchaseId,
      userId: user?._id,
      message: user
        ? "Purchase recorded and access granted"
        : "Purchase recorded. User must create account to access.",
    };
  },
});

// Get user's purchase history
export const getUserPurchases = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50; // Default pagination limit
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return purchases;
  },
});

// Sync purchases when user creates account
// Called after user signs up to link existing purchases to their account
export const syncPurchasesToUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find all purchases with this email that don't have a userId yet
    const orphanedPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Use Sets for O(1) lookup instead of O(n) array.includes()
    const existingCourses = new Set(user.purchasedCourses);
    const existingProducts = new Set(user.purchasedProducts);
    const newCourses = new Set<string>();
    const newProducts = new Set<string>();
    let membershipGranted = false;

    // Categorize purchases first (no DB calls)
    for (const purchase of orphanedPurchases) {
      if (purchase.productType === "course") {
        if (!existingCourses.has(purchase.productId)) {
          newCourses.add(purchase.productId);
        }
      } else if (purchase.productType === "product") {
        if (!existingProducts.has(purchase.productId)) {
          newProducts.add(purchase.productId);
        }
      } else if (purchase.productType === "membership") {
        membershipGranted = true;
      }
    }

    // Batch all purchase patches in parallel (single round-trip)
    if (orphanedPurchases.length > 0) {
      await Promise.all(
        orphanedPurchases.map((purchase) =>
          ctx.db.patch(purchase._id, { userId: args.userId })
        )
      );
    }

    // Only update if there are changes
    if (newCourses.size > 0 || newProducts.size > 0 || membershipGranted) {
      await ctx.db.patch(args.userId, {
        purchasedCourses: [...existingCourses, ...newCourses],
        purchasedProducts: [...existingProducts, ...newProducts],
        membershipLevel: membershipGranted ? "pro" : user.membershipLevel,
      });
    }

    return {
      purchasesLinked: orphanedPurchases.length,
      coursesGranted: newCourses.size,
      productsGranted: newProducts.size,
      membershipGranted,
    };
  },
});
