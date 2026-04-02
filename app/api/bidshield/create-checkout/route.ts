import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as any });
}

// P1-9: Validate required env vars at module load, not per-request
const PRICE_IDS: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
};

// P1-10: Trial period configurable via env var (default 14 days)
const TRIAL_PERIOD_DAYS = parseInt(process.env.TRIAL_PERIOD_DAYS || "14", 10);

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { planId } = await req.json();
    const priceId = PRICE_IDS[planId];

    if (!priceId) {
      // P1-9: Distinguish between invalid plan ID vs missing env var
      const envKey = planId === "pro_monthly" ? "STRIPE_PRICE_PRO_MONTHLY" : "STRIPE_PRICE_PRO_ANNUAL";
      const envMissing = !process.env[envKey];
      console.error("Checkout failed:", { planId, envMissing, envKey });
      return NextResponse.json(
        { error: envMissing ? `Server misconfiguration: ${envKey} not set` : "Invalid plan" },
        { status: envMissing ? 500 : 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/bidshield/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/bidshield/pricing`,
      client_reference_id: userId,
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: { userId, planId },
      },
      metadata: { userId, planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
