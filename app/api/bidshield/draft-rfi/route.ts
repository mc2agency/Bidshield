import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    const prompt = `You are a commercial roofing estimator writing an RFI (Request for Information) to a General Contractor. Write a professional, concise RFI question based on the following context. Be specific, reference relevant drawing or specification sections if implied, and ask for all information needed to complete the estimate.

Context: ${context}

Return only the RFI question text. No preamble, no subject line, no closing.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("draft-rfi error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
