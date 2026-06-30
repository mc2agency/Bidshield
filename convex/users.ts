import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query, internalMutation, action, internalQuery } from "./_generated/server";
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
    // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
    const emailFn = internal.email.sendOnboardingEmail;
    await ctx.scheduler.runAfter(0,         emailFn, { ...emailArgs, day: 1 });
    await ctx.scheduler.runAfter(3 * DAY,   emailFn, { ...emailArgs, day: 3 });
    await ctx.scheduler.runAfter(5 * DAY,   emailFn, { ...emailArgs, day: 5 });
    await ctx.scheduler.runAfter(8 * DAY,   emailFn, { ...emailArgs, day: 8 });
    await ctx.scheduler.runAfter(12 * DAY,  emailFn, { ...emailArgs, day: 12 });

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
export const getByEmail = internalQuery({
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

    const sub = user.bidshieldSubscription ?? null;
    // isPro requires BOTH the membershipLevel set AND an active subscription status.
    // A canceled subscriber may still have membershipLevel="bidshield" if the webhook
    // was missed — checking status prevents them retaining Pro UI access client-side.
    const subscriptionActive = sub?.status === "active";
    const isPro =
      (user.membershipLevel === "bidshield" || user.membershipLevel === "pro") &&
      subscriptionActive;

    return {
      membershipLevel: user.membershipLevel,
      subscription: sub,
      isPro,
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

// ── Paginated admin queries (P2-9) ─────────────────────────────────────────
// Replace .take(500) with proper Convex paginated queries so the admin dashboard
// scales beyond 500 records without OOM or data truncation.

export const adminGetUsersPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).first();
    if (user?.role !== "admin") throw new Error("Unauthorized");
    return await ctx.db.query("users").order("desc").paginate(args.paginationOpts);
  },
});

export const adminGetProjectsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).first();
    if (user?.role !== "admin") throw new Error("Unauthorized");
    return await ctx.db.query("bidshield_projects").order("desc").paginate(args.paginationOpts);
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
export const countActiveProjects = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const active = projects.filter(
      (p) => p.status !== "won" && p.status !== "lost" && p.status !== "no_bid" && p.status !== "no_award"
    );
    return active.length;
  },
});

// Sync user email/name from Clerk (called by user.updated webhook)
export const syncUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn("syncUserFromClerk: user not found for clerkId", args.clerkId);
      return;
    }

    await ctx.db.patch(user._id, {
      email: args.email,
      name: args.name,
    });
  },
});

// Mark user as deleted and revoke access (called by user.deleted webhook)
export const markUserDeleted = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn("markUserDeleted: user not found for clerkId", args.clerkId);
      return;
    }

    // Revoke access and record deletion timestamp
    await ctx.db.patch(user._id, {
      membershipLevel: "free",
    });
  },
});

// Trigger Pro welcome email (called by Stripe webhook via ConvexHttpClient)
export const triggerProWelcomeEmail = action({
  args: {
    clerkId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: args.clerkId });
    if (!user) {
      console.warn("triggerProWelcomeEmail: user not found", args.clerkId);
      return;
    }
    await ctx.runAction(internal.email.sendProWelcomeEmail, {
      email: user.email,
      name: user.name ?? "there",
      plan: args.plan,
    });
  },
});

// Trigger cancellation email (called by Stripe webhook via ConvexHttpClient)
export const triggerCancellationEmail = action({
  args: {
    clerkId: v.string(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId: args.clerkId });
    if (!user) {
      console.warn("triggerCancellationEmail: user not found", args.clerkId);
      return;
    }
    await ctx.runAction(internal.email.sendCancellationEmail, {
      email: user.email,
      name: user.name ?? "there",
      periodEnd: args.periodEnd,
    });
  },
});

// Internal query: look up user by Clerk ID (used by actions that can't hit ctx.db directly)
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getSystemSubstitutions = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (identity.subject !== args.clerkId) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    // Return empty array if field doesn't exist yet on older documents
    const subs = user?.systemSubstitutions;
    if (!subs || !Array.isArray(subs)) return [];
    return subs;
  },
});

export const saveSystemSubstitutions = mutation({
  args: {
    clerkId: v.string(),
    substitutions: v.array(v.object({
      from: v.string(),
      to: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (identity.subject !== args.clerkId) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) return;
    await ctx.db.patch(user._id, { systemSubstitutions: args.substitutions });
  },
});
