/**
 * M-9: One-time backfill migration to populate convexUserId on all existing records.
 *
 * Run from the Convex dashboard: Actions → Run function → bidshield:backfillConvexUserId
 *
 * This internal mutation scans each table that has userId (Clerk ID string) and
 * resolves it to the Convex users table _id, writing it into convexUserId.
 * Records that already have convexUserId are skipped. Demo records are skipped.
 *
 * Safe to run multiple times (idempotent).
 */
import { internalMutation } from "../_generated/server";
import { isDemoUser } from "../utils";

// All tables that have userId: v.string() + convexUserId: v.optional(v.id("users"))
const TABLES_WITH_USER_ID = [
  "bidshield_projects",
  "bidshield_takeoff_sections",
  "bidshield_takeoff_line_items",
  "bidshield_checklist_items",
  "bidshield_vendors",
  "bidshield_quotes",
  "bidshield_rfis",
  "bidshield_addenda",
  "bidshield_project_materials",
  "bidshield_scope_items",
  "bidshield_bid_quals",
  "bidshield_scope_clarifications",
  "bidshield_user_material_prices",
  "bidshield_labor_rates",
  "bidshield_laborTasks",
  "bidshield_gcBidFormDocuments",
  "bidshield_laborAnalysis",
  "bidshield_gc_items",
  "bidshield_datasheets",
  "bidshield_submissions",
  "bidshield_prebid_meetings",
  "bidshield_alternates",
  "bidshield_checklist_templates",
  "bidshield_decisions",
  "rateLimits",
  "bidshield_notifications",
  "bidshield_ai_usage",
] as const;

export const backfillConvexUserId = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Build a cache of clerkId → Convex _id to avoid repeated lookups
    const allUsers = await ctx.db.query("users").collect();
    const clerkToConvex = new Map<string, any>();
    for (const user of allUsers) {
      clerkToConvex.set(user.clerkId, user._id);
    }

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const tableName of TABLES_WITH_USER_ID) {
      let updated = 0;
      let skipped = 0;

      // Convex doesn't support dynamic table names in the type system,
      // so we use ctx.db.query with an any cast for the migration.
      const records = await (ctx.db as any).query(tableName).collect();

      for (const record of records) {
        // Skip if already backfilled
        if (record.convexUserId) {
          skipped++;
          continue;
        }

        // Skip demo users
        if (!record.userId || isDemoUser(record.userId)) {
          skipped++;
          continue;
        }

        const convexId = clerkToConvex.get(record.userId);
        if (convexId) {
          await ctx.db.patch(record._id, { convexUserId: convexId } as any);
          updated++;
        } else {
          // User not found — orphaned record, skip
          skipped++;
        }
      }

      if (updated > 0 || skipped > 0) {
        console.log(`[backfill] ${tableName}: updated=${updated}, skipped=${skipped}`);
      }
      totalUpdated += updated;
      totalSkipped += skipped;
    }

    console.log(`[backfill] DONE: totalUpdated=${totalUpdated}, totalSkipped=${totalSkipped}`);
    return { totalUpdated, totalSkipped };
  },
});
