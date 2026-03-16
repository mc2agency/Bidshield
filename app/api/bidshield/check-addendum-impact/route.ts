import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

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
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
