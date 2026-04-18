import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DraftRfiSchema = z.object({
  context: z.string().min(1).max(2000).trim(),
  projectName: z.string().max(200).optional(),
  specSection: z.string().max(100).optional(),
  gcName: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const parsed = DraftRfiSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { context, projectName, specSection, gcName } = parsed.data;

    const optionalContext = [
      projectName ? `Project: ${projectName}` : "",
      gcName ? `General Contractor: ${gcName}` : "",
      specSection ? `Spec Section: ${specSection}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are a commercial roofing estimator writing an RFI (Request for Information) to a General Contractor. Write a professional, concise RFI question based on the following context. Be specific, reference relevant drawing or specification sections if implied, and ask for all information needed to complete the estimate.

${optionalContext ? optionalContext + "\n" : ""}Context: ${context}

Return only the RFI question text. No preamble, no subject line, no closing.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        { model: "claude-haiku-4-5-20251001", max_tokens: 768, system: "You are a commercial roofing subcontractor estimator writing RFIs to general contractors. Use formal construction industry language. Reference applicable drawing or spec sections when identifiable. Be concise and professional.", messages: [{ role: "user", content: prompt }] },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    if (!text.trim()) {
      return NextResponse.json({ error: "AI returned an empty response — please try again." }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("draft-rfi error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
