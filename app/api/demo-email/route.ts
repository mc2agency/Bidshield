import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await convex.mutation(api.subscribers.subscribeEmail, {
      email: email.trim().toLowerCase(),
      source: "demo",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Don't fail the demo experience on subscription errors
    console.error("[demo-email] error:", err);
    return NextResponse.json({ ok: true });
  }
}
