import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Subscribe an email (checklist download, newsletter, etc.)
export const subscribeEmail = mutation({
  args: {
    email: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already subscribed
    const existing = await ctx.db
      .query("email_subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { alreadySubscribed: true, id: existing._id };
    }

    const id = await ctx.db.insert("email_subscribers", {
      email: args.email,
      source: args.source,
      subscribedAt: Date.now(),
    });

    return { alreadySubscribed: false, id };
  },
});

// Submit contact form
export const submitContactForm = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    newsletter: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contact_submissions", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });

    // Also subscribe to newsletter if checked
    if (args.newsletter) {
      const existing = await ctx.db
        .query("email_subscribers")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (!existing) {
        await ctx.db.insert("email_subscribers", {
          email: args.email,
          source: "contact_form",
          subscribedAt: Date.now(),
        });
      }
    }

    return { id };
  },
});
