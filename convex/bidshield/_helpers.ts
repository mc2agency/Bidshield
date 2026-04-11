import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { isDemoUser } from "../utils";

/** C2: Round currency values to 2 decimal places to prevent floating-point drift. */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function validateAuth(ctx: any, userId: string) {
  if (isDemoUser(userId)) return; // demo mode bypasses auth
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
}

/**
 * P0-7: Validate that the authenticated user owns the project.
 * Prevents horizontal privilege escalation — a user guessing another user's
 * project ID cannot read or modify their data.
 *
 * Demo projects (IDs starting with "demo_") are exempt because they use
 * hardcoded fixture data and never touch the actual database.
 */
export async function assertProjectOwnership(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"bidshield_projects">
): Promise<void> {
  // Demo projects use hardcoded data — skip ownership check
  if ((projectId as string).startsWith("demo_")) return;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("Project not found");
  // identity.subject is the Clerk user ID (matches project.userId)
  if (project.userId !== identity.subject) {
    throw new Error("Unauthorized: you do not own this project");
  }
}

/**
 * Validate that the authenticated user owns a record by checking its userId field.
 * Used for non-project-scoped resources like quotes, labor rates, vendors, etc.
 */
export async function assertRecordOwnership(
  ctx: QueryCtx | MutationCtx,
  record: { userId: string } | null,
  resourceName: string
): Promise<void> {
  // Demo records bypass ownership
  if (record && isDemoUser(record.userId)) return;
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  if (!record) throw new Error(`${resourceName} not found`);
  if (record.userId !== identity.subject) {
    throw new Error(`Unauthorized: you do not own this ${resourceName}`);
  }
}

export async function requirePro(ctx: any, userId: string) {
  if (isDemoUser(userId)) return; // demo always allowed
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userId))
    .first();
  const isPro = user?.membershipLevel === "bidshield" || user?.membershipLevel === "pro";
  if (!isPro) throw new Error("Pro subscription required");
}
