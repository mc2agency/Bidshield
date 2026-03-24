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
    const membershipIds = ['bidshield-pro-membership'];

    if (courseIds.includes(args.productId)) {
      productType = "course";
    } else if (membershipIds.includes(args.productId)) {
      productType = "membership";
    } else {
      productType = "product";
    }

    // L6: The Gumroad webhook can fire before the buyer creates an account.
    // If user is null we cannot satisfy the required purchases.userId field.
    // Return early — the orphanedPurchases logic in users.getOrCreateUser will
    // backfill the purchase record when the user signs up.
    if (!user) {
      return {
        purchaseId: null,
        userId: undefined,
        message: "Purchase received. User must create account to access — will be linked on sign-up.",
      };
    }

    // Record the purchase
    const purchaseId = await ctx.db.insert("purchases", {
      userId: user._id, // safe: user is confirmed non-null above
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

    // Grant access — user is confirmed non-null at this point
    if (productType === "course") {
      if (!user.purchasedCourses.includes(args.productId)) {
        await ctx.db.patch(user._id, {
          purchasedCourses: [...user.purchasedCourses, args.productId],
        });
      }
    } else if (productType === "product") {
      if (!user.purchasedProducts.includes(args.productId)) {
        await ctx.db.patch(user._id, {
          purchasedProducts: [...user.purchasedProducts, args.productId],
        });
      }
    } else if (productType === "membership") {
      await ctx.db.patch(user._id, {
        membershipLevel: "pro",
      });
    }

    return {
      purchaseId,
      userId: user._id,
      message: "Purchase recorded and access granted",
    };
  },
});

// Check if a user owns a specific product (by email)
export const verifyPurchaseByEmail = query({
  args: {
    email: v.string(),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    const owned = purchases.some((p) => p.productId === args.productId);

    // Also check if user has a bundle that includes this product
    const hasBundle = purchases.some((p) =>
      p.productId === "template-bundle" ||
      p.productId === "starter-bundle" ||
      p.productId === "professional-bundle" ||
      p.productId === "master-toolkit"
    );

    return { owned: owned || hasBundle };
  },
});

// Get all purchased product IDs for a user (by email)
export const getPurchasedProductIds = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    return purchases.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      purchasedAt: p.purchasedAt,
    }));
  },
});

