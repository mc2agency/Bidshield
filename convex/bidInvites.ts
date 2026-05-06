import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ===== QUERIES =====

// Get all bid invites for current user
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("pursuing"),
      v.literal("pass"),
      v.literal("converted")
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let invitesQuery = ctx.db
      .query("bidInvites")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject));

    if (args.status) {
      invitesQuery = invitesQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const invites = await invitesQuery.order("desc").collect();
    return invites;
  },
});

// Get single bid invite by ID
export const get = query({
  args: { id: v.id("bidInvites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const invite = await ctx.db.get(args.id);
    if (!invite) throw new Error("Bid invite not found");
    if (invite.userId !== identity.subject) throw new Error("Unauthorized");

    return invite;
  },
});

// Get upcoming bid invites (next 7 days)
export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const invites = await ctx.db
      .query("bidInvites")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("status"), "new"),
            q.eq(q.field("status"), "pursuing")
          ),
          q.gte(q.field("bidDateTime"), now),
          q.lte(q.field("bidDateTime"), sevenDaysFromNow)
        )
      )
      .order("asc")
      .collect();

    return invites;
  },
});

// ===== MUTATIONS =====

// Create bid invite manually
export const createManual = mutation({
  args: {
    projectName: v.string(),
    gc: v.string(),
    bidDateTime: v.number(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    prebidMeeting: v.optional(v.object({
      dateTime: v.number(),
      location: v.string(),
    })),
    plansLink: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const inviteId = await ctx.db.insert("bidInvites", {
      ...args,
      userId: identity.subject,
      source: "manual",
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    return inviteId;
  },
});

// Create bid invite from AI extraction
export const createFromExtraction = mutation({
  args: {
    extractedData: v.object({
      projectName: v.string(),
      gc: v.string(),
      bidDateTime: v.number(),
      contactName: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      prebidMeeting: v.optional(v.object({
        dateTime: v.number(),
        location: v.string(),
      })),
      plansLink: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    rawEmailBody: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    const inviteId = await ctx.db.insert("bidInvites", {
      ...args.extractedData,
      userId: identity.subject,
      source: "ai-extraction",
      rawEmailBody: args.rawEmailBody,
      extractedData: args.extractedData,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    return inviteId;
  },
});

// Update bid invite status
export const updateStatus = mutation({
  args: {
    id: v.id("bidInvites"),
    status: v.union(
      v.literal("new"),
      v.literal("pursuing"),
      v.literal("pass"),
      v.literal("converted")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const invite = await ctx.db.get(args.id);
    if (!invite) throw new Error("Bid invite not found");
    if (invite.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Update bid invite details
export const update = mutation({
  args: {
    id: v.id("bidInvites"),
    projectName: v.optional(v.string()),
    gc: v.optional(v.string()),
    bidDateTime: v.optional(v.number()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    prebidMeeting: v.optional(v.object({
      dateTime: v.number(),
      location: v.string(),
    })),
    plansLink: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const invite = await ctx.db.get(id);
    if (!invite) throw new Error("Bid invite not found");
    if (invite.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete bid invite
export const remove = mutation({
  args: { id: v.id("bidInvites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const invite = await ctx.db.get(args.id);
    if (!invite) throw new Error("Bid invite not found");
    if (invite.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

// Mark as converted and link to project
export const convertToProject = mutation({
  args: {
    inviteId: v.id("bidInvites"),
    projectId: v.id("bidshield_projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Bid invite not found");
    if (invite.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.inviteId, {
      status: "converted",
      projectId: args.projectId,
      updatedAt: Date.now(),
    });
  },
});

// ===== ACTIONS =====

// Extract bid invite details from email using AI
export const extractFromEmail = action({
  args: { emailBody: v.string() },
  handler: async (ctx, { emailBody }) => {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const prompt = `Extract bid invitation details from this email.

Return ONLY valid JSON with these fields:
{
  "projectName": "string (required, name of the construction project)",
  "gc": "string (required, general contractor company name)",
  "bidDateTime": "ISO 8601 datetime string (required, when bid is due)",
  "contactName": "string (optional, name of contact person)",
  "contactEmail": "string (optional, email address)",
  "contactPhone": "string (optional, phone number)",
  "prebidMeeting": {
    "dateTime": "ISO 8601 datetime string (optional)",
    "location": "string (optional, where prebid meeting is held)"
  },
  "plansLink": "string (optional, URL to download plans)",
  "notes": "string (optional, any other relevant information)"
}

Email content:
${emailBody}

Return ONLY the JSON object, no markdown, no explanation, no code blocks.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parse the JSON response
      const parsed = JSON.parse(content);
      
      // Convert ISO datetime strings to Unix timestamps
      const extracted = {
        projectName: parsed.projectName,
        gc: parsed.gc,
        bidDateTime: new Date(parsed.bidDateTime).getTime(),
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        contactPhone: parsed.contactPhone,
        prebidMeeting: parsed.prebidMeeting ? {
          dateTime: new Date(parsed.prebidMeeting.dateTime).getTime(),
          location: parsed.prebidMeeting.location,
        } : undefined,
        plansLink: parsed.plansLink,
        notes: parsed.notes,
      };

      return extracted;
    } catch (error) {
      console.error("AI extraction error:", error);
      throw new Error(`Failed to extract bid details: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});
