import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CheckAddendumSchema = z.object({
  description: z.string().max(2000).trim(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const parsed = CheckAddendumSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { description } = parsed.data;

    const prompt = `You are a commercial roofing estimator reviewing an addendum to a bid. Based on the addendum description below, identify which parts of a roofing bid are affected and what action the estimator must take.

Addendum: ${description}

Return a JSON array of objects with this exact shape:
[{"section": "<bid section name>", "action": "<what to do>"}]

Possible sections: Takeoff & Quantities, Materials, Labor, General Conditions, Scope / Exclusions, Bid Price, Schedule, Subcontractors, Submittals.

Return only the JSON array. No explanation, no markdown fences.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    let impacts: { section: string; action: string }[] = [];
    try {
      impacts = JSON.parse(raw);
    } catch {
      impacts = [];
    }
    return NextResponse.json({ impacts });
  } catch (err: any) {
    console.error("check-addendum-impact error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
