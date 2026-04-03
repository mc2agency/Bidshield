import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isDemoUser } from "./utils";

const DEMO_USER_ID = "demo_user";

const DEMO_PROJECTS = [
  {
    name: "Meridian Business Park — Bldg C",
    location: "Charlotte, NC",
    bidDate: "2026-04-15",
    status: "in_progress" as const,
    gc: "Skanska USA",
    sqft: 68000,
    grossRoofArea: 68000,
    totalBidAmount: 1250000,
    trade: "roofing",
    systemType: "tpo",
    deckType: "steel",
    assemblies: ["TPO 60mil", "Tapered ISO"],
  },
  {
    name: "Lakeview Medical Center",
    location: "Raleigh, NC",
    bidDate: "2026-04-20",
    status: "setup" as const,
    gc: "Turner Construction",
    sqft: 42000,
    grossRoofArea: 42000,
    trade: "roofing",
    systemType: "sbs",
    deckType: "concrete",
    assemblies: ["SBS 2-ply"],
  },
];

/** Admin-only: check if demo data exists */
export const getDemoDataStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", DEMO_USER_ID))
      .collect();

    return {
      exists: projects.length > 0,
      projectCount: projects.length,
    };
  },
});

/** Admin-only: seed demo projects into the database */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const now = Date.now();
    let seeded = 0;

    for (const project of DEMO_PROJECTS) {
      // Check if a demo project with this name already exists
      const existing = await ctx.db
        .query("bidshield_projects")
        .withIndex("by_user", (q) => q.eq("userId", DEMO_USER_ID))
        .collect();
      const nameExists = existing.some((p) => p.name === project.name);
      if (nameExists) continue;

      await ctx.db.insert("bidshield_projects", {
        userId: DEMO_USER_ID,
        name: project.name,
        location: project.location,
        bidDate: project.bidDate,
        status: project.status,
        gc: project.gc,
        sqft: project.sqft,
        grossRoofArea: project.grossRoofArea,
        totalBidAmount: project.totalBidAmount,
        trade: project.trade,
        systemType: project.systemType,
        deckType: project.deckType,
        assemblies: project.assemblies,
        createdAt: now,
        updatedAt: now,
      });
      seeded++;
    }

    return { seeded };
  },
});

/** Admin-only: clear all demo data from the database */
export const clearDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const projects = await ctx.db
      .query("bidshield_projects")
      .withIndex("by_user", (q) => q.eq("userId", DEMO_USER_ID))
      .collect();

    let deleted = 0;
    for (const project of projects) {
      // Delete associated checklist items
      const items = await ctx.db
        .query("bidshield_checklist_items")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      for (const item of items) await ctx.db.delete(item._id);

      // Delete the project
      await ctx.db.delete(project._id);
      deleted++;
    }

    return { deleted };
  },
});
