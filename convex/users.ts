import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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

    // Schedule onboarding email sequence
    const DAY = 24 * 60 * 60 * 1000;
    const emailArgs = { email: args.email, name: args.name };
    await ctx.scheduler.runAfter(0,         internal.email.sendOnboardingEmail, { ...emailArgs, day: 1 });
    await ctx.scheduler.runAfter(3 * DAY,   internal.email.sendOnboardingEmail, { ...emailArgs, day: 3 });
    await ctx.scheduler.runAfter(5 * DAY,   internal.email.sendOnboardingEmail, { ...emailArgs, day: 5 });
    await ctx.scheduler.runAfter(8 * DAY,   internal.email.sendOnboardingEmail, { ...emailArgs, day: 8 });
    await ctx.scheduler.runAfter(12 * DAY,  internal.email.sendOnboardingEmail, { ...emailArgs, day: 12 });

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

      // Link all purchases to this user
      for (const purchase of orphanedPurchases) {
        await ctx.db.patch(purchase._id, { userId });

        if (purchase.productType === "course") {
          courses.add(purchase.productId);
        } else if (purchase.productType === "product") {
          products.add(purchase.productId);
        } else if (purchase.productType === "membership") {
          hasMembership = true;
        }
      }

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

// L4: Shared user lookup by email — used by webhook handlers to avoid duplicating
// identical query logic across checkout.session.completed and subscription.updated
// branches. Pass the customer email from the Stripe session/subscription object.
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
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


// Update BidShield subscription status (called by Stripe webhook)
export const updateBidShieldSubscription = mutation({
  args: {
    clerkId: v.string(),
    subscription: v.object({
      plan: v.union(v.literal("monthly"), v.literal("annual")),
      status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
      stripeSubscriptionId: v.optional(v.string()),
      currentPeriodEnd: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.error("User not found for clerkId:", args.clerkId);
      return;
    }

    await ctx.db.patch(user._id, {
      membershipLevel: args.subscription.status === "active" ? "bidshield" : "free",
      bidshieldSubscription: args.subscription,
    });
  },
});

// Get user subscription status
export const getUserSubscription = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    return {
      membershipLevel: user.membershipLevel,
      subscription: user.bidshieldSubscription ?? null,
      isPro: user.membershipLevel === "bidshield" || user.membershipLevel === "pro",
    };
  },
});

// Admin: get all users + all projects
// TODO (M8): Replace .take() with proper Convex paginated queries (usePaginatedQuery on
// the admin dashboard) to support unbounded growth beyond the 500-record safety limit.
export const adminGetAllData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");
    // Safety cap: prevents OOM on large datasets. Migrate to paginated query when user
    // count exceeds ~500. See AUDIT_FIX_PLAN.md M8 for the full pagination upgrade path.
    const users = await ctx.db.query("users").order("desc").take(500);
    const projects = await ctx.db.query("bidshield_projects").order("desc").take(500);
    return { users, projects };
  },
});

// P2-9: Paginated admin user list
export const adminGetUsersPaginated = query({
  args: {
    paginationOpts: v.object({
      cursor: v.union(v.string(), v.null()),
      numItems: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const result = await ctx.db
      .query("users")
      .order("desc")
      .paginate({ cursor: args.paginationOpts.cursor ?? null, numItems: args.paginationOpts.numItems });
    return result;
  },
});

// P2-9: Paginated admin project list
export const adminGetProjectsPaginated = query({
  args: {
    paginationOpts: v.object({
      cursor: v.union(v.string(), v.null()),
      numItems: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const result = await ctx.db
      .query("bidshield_projects")
      .order("desc")
      .paginate({ cursor: args.paginationOpts.cursor ?? null, numItems: args.paginationOpts.numItems });
    return result;
  },
});

// Idempotency guard for Stripe webhook events (M9).
// Returns true if the event was already processed; inserts and returns false otherwise.
// Call this at the start of each Stripe event handler before any writes.
export const isWebhookEventProcessed = mutation({
  args: { stripeEventId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("processedWebhooks")
      .withIndex("by_stripe_event_id", (q) => q.eq("stripeEventId", args.stripeEventId))
      .first();
    if (existing) return true;
    await ctx.db.insert("processedWebhooks", {
      stripeEventId: args.stripeEventId,
      processedAt: Date.now(),
    });
    return false;
  },
});

// Count user's active projects (for free tier limit)
export const countActiveProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const active = projects.filter(
      (p) => p.status !== "won" && p.status !== "lost" && p.status !== "no_bid"
    );
    return active.length;
  },
});
