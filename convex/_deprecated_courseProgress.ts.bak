import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's progress for a specific course
export const getCourseProgress = query({
  args: {
    userId: v.id("users"),
    courseId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    return progress;
  },
});

// Get progress for a specific lesson
export const getLessonProgress = query({
  args: {
    userId: v.id("users"),
    courseId: v.string(),
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_lesson", (q) =>
        q
          .eq("userId", args.userId)
          .eq("courseId", args.courseId)
          .eq("lessonId", args.lessonId)
      )
      .first();

    return progress;
  },
});

// Update video progress (as student watches)
export const updateVideoProgress = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.string(),
    lessonId: v.string(),
    videoProgress: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_lesson", (q) =>
        q
          .eq("userId", args.userId)
          .eq("courseId", args.courseId)
          .eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      // Update existing progress
      await ctx.db.patch(existing._id, {
        videoProgress: args.videoProgress,
        lastWatchedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new progress entry
      const progressId = await ctx.db.insert("courseProgress", {
        userId: args.userId,
        courseId: args.courseId,
        lessonId: args.lessonId,
        completed: false,
        videoProgress: args.videoProgress,
        lastWatchedAt: Date.now(),
      });
      return progressId;
    }
  },
});

// Mark lesson as completed
export const markLessonComplete = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.string(),
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_lesson", (q) =>
        q
          .eq("userId", args.userId)
          .eq("courseId", args.courseId)
          .eq("lessonId", args.lessonId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: true,
        completedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create completed entry
      const progressId = await ctx.db.insert("courseProgress", {
        userId: args.userId,
        courseId: args.courseId,
        lessonId: args.lessonId,
        completed: true,
        completedAt: Date.now(),
        lastWatchedAt: Date.now(),
      });
      return progressId;
    }
  },
});

// Get completion percentage for a course
export const getCourseCompletionPercentage = query({
  args: {
    userId: v.id("users"),
    courseId: v.string(),
    totalLessons: v.number(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("courseProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId)
      )
      .collect();

    const completedLessons = progress.filter((p) => p.completed).length;
    const percentage = Math.round((completedLessons / args.totalLessons) * 100);

    return {
      completedLessons,
      totalLessons: args.totalLessons,
      percentage,
    };
  },
});
