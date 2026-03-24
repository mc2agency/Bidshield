import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ScopeItemSchema = z.object({
  name: z.string().max(200).trim(),
  note: z.string().max(500).trim().optional(),
});

const GenerateExclusionsSchema = z.object({
  excludedItems: z.array(ScopeItemSchema).max(100).optional(),
  byOthersItems: z.array(ScopeItemSchema).max(100).optional(),
  clarifications: z.array(z.object({ text: z.string().max(500).trim() })).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const parsed = GenerateExclusionsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { excludedItems, byOthersItems, clarifications } = parsed.data;

    const excluded = (excludedItems ?? []).map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
    const byOthers = (byOthersItems ?? []).map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
    const clars = (clarifications ?? []).map((c) => `- ${c.text}`).join("\n");

    const prompt = `You are a commercial roofing estimator preparing a bid proposal. Based on the following scope exclusions and clarifications, write a professional exclusions section ready to paste into a proposal document. Use industry terminology, be specific, and format as a numbered list.

EXCLUDED from our scope:
${excluded || "(none)"}

BY OTHERS:
${byOthers || "(none)"}

CLARIFICATIONS & ASSUMPTIONS:
${clars || "(none)"}

Return only the numbered list. No preamble, no closing remarks.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        { model: "claude-haiku-4-5-20251001", max_tokens: 1024, messages: [{ role: "user", content: prompt }] },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("generate-exclusions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
