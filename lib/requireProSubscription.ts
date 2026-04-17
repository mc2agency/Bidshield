/**
 * Pro subscription guard helper — shared by all AI API routes.
 *
 * Call `requireProSubscription(userId)` after `auth()` in any route
 * that should only be accessible to active BidShield Pro subscribers.
 * Returns a NextResponse error (403) if the user is not subscribed,
 * or null if the user is allowed to proceed.
 *
 * Usage:
 *   const guard = await requireProSubscription(userId);
 *   if (guard) return guard;
 */
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function getConvex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
  return new ConvexHttpClient(url);
}

export async function requireProSubscription(
  clerkId: string
): Promise<NextResponse | null> {
  try {
    const convex = getConvex();
    const user = await convex.query(api.users.getCurrentUser, { clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isActive = user.bidshieldSubscription?.status === "active";
    const isPro =
      (user.membershipLevel === "bidshield" ||
        user.membershipLevel === "pro") &&
      isActive;

    if (!isPro) {
      return NextResponse.json(
        {
          error:
            "BidShield Pro subscription required. Start your free trial at bidshield.co/sign-up",
        },
        { status: 403 }
      );
    }

    return null; // allowed
  } catch (err) {
    console.error("[requireProSubscription] Convex lookup failed:", err);
    // Fail open with a 503 so the client knows to retry — do NOT silently
    // allow access when we cannot verify the subscription.
    return NextResponse.json(
      { error: "Subscription check unavailable — please try again" },
      { status: 503 }
    );
  }
}
