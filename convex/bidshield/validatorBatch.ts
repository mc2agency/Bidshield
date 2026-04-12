import { query } from "../_generated/server";
import { v } from "convex/values";
import { assertProjectOwnership } from "./_helpers";

/**
 * H-6: Single batched query for ValidatorTab — replaces 15 separate useQuery subscriptions
 * with one reactive query. Convex still tracks per-table changes, but this eliminates
 * 14 extra WebSocket round-trips on mount.
 */
export const getValidatorData = query({
  args: {
    projectId: v.id("bidshield_projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertProjectOwnership(ctx, args.projectId);
    const pid = args.projectId;
    const byProject = (q: any) => q.eq("projectId", pid);

    const [
      checklist,
      quotes,
      rfis,
      scopeItems,
      addenda,
      bidQuals,
      gcItems,
      projectMaterials,
      laborTasks,
      laborAnalysis,
      gcFormDocuments,
    ] = await Promise.all([
      ctx.db.query("bidshield_checklist_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_quotes").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_rfis").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_scope_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_addenda").withIndex("by_project", byProject).collect(),
      // bidQuals and laborAnalysis use .first() — single record per project
      ctx.db.query("bidshield_bid_quals").withIndex("by_project", byProject).first(),
      ctx.db.query("bidshield_gc_items").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_project_materials").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_laborTasks").withIndex("by_project", byProject).collect(),
      ctx.db.query("bidshield_laborAnalysis").withIndex("by_project", byProject).first(),
      ctx.db.query("bidshield_gcBidFormDocuments").withIndex("by_project", byProject).collect(),
    ]);

    // Compute labor total from analysis record (matches getLaborTotal behavior)
    const laborTotal = laborAnalysis ? (laborAnalysis as any).totalLaborCost : null;

    // Datasheets are user-scoped, not project-scoped
    const datasheets = await ctx.db
      .query("bidshield_datasheets")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    // Unconfirmed GC form count
    const unconfirmedGcFormCount = gcFormDocuments.filter(
      (d: any) => d.status === "needs_review" || d.status === "unconfirmed"
    ).length;

    return {
      checklist,
      quotes,
      rfis,
      scopeItems,
      addenda,
      bidQuals,
      gcItems,
      projectMaterials,
      datasheets,
      laborTasks,
      laborAnalysis,
      gcFormDocuments,
      unconfirmedGcFormCount,
      laborTotal,
    };
  },
});
