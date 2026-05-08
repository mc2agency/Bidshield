import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  try {
    const { question, specContext } = await req.json();
    if (!question?.trim()) return NextResponse.json({ error: "No question provided" }, { status: 400 });
    if (!specContext?.trim()) return NextResponse.json({ error: "No spec data available" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are a commercial roofing specification assistant. Answer questions about the roofing specification provided. Be concise and direct — 1 to 3 sentences max. If the information isn't in the spec, say so clearly. Do not speculate beyond what the spec states.

Specification data (JSON):
${specContext.slice(0, 40000)}`,
      messages: [{ role: "user", content: question.trim() }],
    });

    const answer = message.content[0].type === "text" ? message.content[0].text : "No response generated.";
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("spec-chat error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
