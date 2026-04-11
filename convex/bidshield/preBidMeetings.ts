import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { validateAuth, assertProjectOwnership, assertRecordOwnership } from "./_helpers";

// ===== PRE-BID MEETINGS =====

export const getPreBidMeetings = query({
  args: { projectId: v.id("bidshield_projects") },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    return await ctx.db
      .query("bidshield_prebid_meetings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
  },
});

export const addPreBidMeeting = mutation({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
    meetingDate: v.string(),
    mandatory: v.boolean(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    attendees: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    await assertProjectOwnership(ctx, args.projectId);
    const now = Date.now();
    return await ctx.db.insert("bidshield_prebid_meetings", { ...args, createdAt: now, updatedAt: now });
  },
});

export const updatePreBidMeeting = mutation({
  args: {
    meetingId: v.id("bidshield_prebid_meetings"),
    userId: v.string(),
    meetingDate: v.optional(v.string()),
    mandatory: v.optional(v.boolean()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    attendees: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const { meetingId, userId: _uid, ...fields } = args;
    const doc = await ctx.db.get(meetingId);
    await assertRecordOwnership(ctx, doc, "pre-bid meeting");
    await ctx.db.patch(meetingId, { ...fields, updatedAt: Date.now() });
  },
});

export const deletePreBidMeeting = mutation({
  args: { meetingId: v.id("bidshield_prebid_meetings"), userId: v.string() },
  handler: async (ctx, args) => {
    await validateAuth(ctx, args.userId);
    const doc = await ctx.db.get(args.meetingId);
    await assertRecordOwnership(ctx, doc, "pre-bid meeting");
    await ctx.db.delete(args.meetingId);
  },
});
