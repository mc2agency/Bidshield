import { v } from "convex/values";
import { mutation, query, internalMutation } from "../_generated/server";

// ── L-15: In-app notification system ──────────────────────────────────────────

/** Get unread + recent notifications for the current user */
export const getNotifications = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const take = args.limit ?? 20;
    return await ctx.db
      .query("bidshield_notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(take);
  },
});

/** Count unread notifications */
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("bidshield_notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();
    return unread.length;
  },
});

/** Mark a notification as read */
export const markRead = mutation({
  args: { notificationId: v.id("bidshield_notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

/** Mark all notifications as read for a user */
export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("bidshield_notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

/** Dismiss (soft-delete) a notification */
export const dismiss = mutation({
  args: { notificationId: v.id("bidshield_notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { dismissedAt: Date.now(), read: true });
  },
});

/**
 * Cron-callable: Scan all quotes with expirationDate and create notifications
 * for quotes expiring within 14 days or already expired.
 * Deduplicates by checking if a notification already exists for the same quote.
 */
export const checkQuoteExpirations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;

    // Get all quotes with expiration dates
    const allQuotes = await ctx.db.query("bidshield_quotes").collect();
    let created = 0;

    for (const quote of allQuotes) {
      if (!quote.expirationDate || !quote.userId) continue;
      const expMs = new Date(quote.expirationDate).getTime();
      if (isNaN(expMs)) continue;

      const daysUntil = Math.ceil((expMs - now) / (24 * 60 * 60 * 1000));
      let type: string | null = null;
      let title = "";
      let message = "";

      if (daysUntil < 0) {
        type = "quote_expired";
        title = "Quote expired";
        message = `${quote.vendorName} quote expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} ago`;
      } else if (daysUntil <= 14) {
        type = "quote_expiring";
        title = "Quote expiring soon";
        message = `${quote.vendorName} quote expires in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
      }

      if (!type) continue;

      // Deduplicate: check if we already notified about this quote in the last 24h
      const existing = await ctx.db
        .query("bidshield_notifications")
        .withIndex("by_user_created", (q) => q.eq("userId", quote.userId))
        .order("desc")
        .take(50);

      const alreadyNotified = existing.some(
        (n) => n.quoteId === quote._id && n.type === type && n.createdAt > now - 24 * 60 * 60 * 1000
      );
      if (alreadyNotified) continue;

      await ctx.db.insert("bidshield_notifications", {
        userId: quote.userId,
        type,
        title,
        message,
        projectId: quote.projectId,
        quoteId: quote._id,
        read: false,
        createdAt: now,
      });
      created++;
    }

    return { scanned: allQuotes.length, created };
  },
});

/**
 * Cron-callable: Check for bids due within 48 hours and notify the user.
 */
export const checkBidDeadlines = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twoDays = 48 * 60 * 60 * 1000;

    const projects = await ctx.db.query("bidshield_projects").collect();
    let created = 0;

    for (const p of projects) {
      if (!p.bidDate || !p.userId || p.status === "won" || p.status === "lost" || p.status === "no_bid") continue;
      const bidMs = new Date(p.bidDate).getTime();
      if (isNaN(bidMs)) continue;

      const hoursUntil = Math.ceil((bidMs - now) / (60 * 60 * 1000));
      if (hoursUntil < 0 || hoursUntil > 48) continue;

      // Deduplicate
      const existing = await ctx.db
        .query("bidshield_notifications")
        .withIndex("by_user_created", (q) => q.eq("userId", p.userId))
        .order("desc")
        .take(30);

      const alreadyNotified = existing.some(
        (n) => n.projectId === p._id && n.type === "bid_due_soon" && n.createdAt > now - 12 * 60 * 60 * 1000
      );
      if (alreadyNotified) continue;

      await ctx.db.insert("bidshield_notifications", {
        userId: p.userId,
        type: "bid_due_soon",
        title: "Bid due soon",
        message: `${p.name} is due in ${hoursUntil < 24 ? `${hoursUntil} hours` : `${Math.ceil(hoursUntil / 24)} day${Math.ceil(hoursUntil / 24) > 1 ? "s" : ""}`}`,
        projectId: p._id,
        read: false,
        createdAt: now,
      });
      created++;
    }

    return { scanned: projects.length, created };
  },
});
