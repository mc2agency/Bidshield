import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
}

function getConvex() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) throw new Error("CONVEX_URL not configured");
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const convex = getConvex();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const planId = session.metadata?.planId;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await convex.mutation(api.users.updateBidShieldSubscription, {
            clerkId: userId,
            subscription: {
              plan: planId === "pro_annual" ? "annual" : "monthly",
              status: "active",
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: (subscription.items.data[0]?.current_period_end ?? 0) * 1000,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const status = subscription.status === "active" ? "active"
            : subscription.status === "past_due" ? "past_due"
            : "canceled";

          await convex.mutation(api.users.updateBidShieldSubscription, {
            clerkId: userId,
            subscription: {
              plan: subscription.metadata?.planId === "pro_annual" ? "annual" : "monthly",
              status: status as "active" | "canceled" | "past_due",
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: (subscription.items.data[0]?.current_period_end ?? 0) * 1000,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await convex.mutation(api.users.updateBidShieldSubscription, {
            clerkId: userId,
            subscription: {
              plan: subscription.metadata?.planId === "pro_annual" ? "annual" : "monthly",
              status: "canceled",
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: (subscription.items.data[0]?.current_period_end ?? 0) * 1000,
            },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
