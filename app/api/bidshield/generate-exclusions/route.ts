import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    const { excludedItems, byOthersItems, clarifications } = await req.json();

    const excluded = (excludedItems ?? []).map((i: any) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
    const byOthers = (byOthersItems ?? []).map((i: any) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
    const clars = (clarifications ?? []).map((c: any) => `- ${c.text}`).join("\n");

    const prompt = `You are a commercial roofing estimator preparing a bid proposal. Based on the following scope exclusions and clarifications, write a professional exclusions section ready to paste into a proposal document. Use industry terminology, be specific, and format as a numbered list.

EXCLUDED from our scope:
${excluded || "(none)"}

BY OTHERS:
${byOthers || "(none)"}

CLARIFICATIONS & ASSUMPTIONS:
${clars || "(none)"}

Return only the numbered list. No preamble, no closing remarks.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("generate-exclusions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
