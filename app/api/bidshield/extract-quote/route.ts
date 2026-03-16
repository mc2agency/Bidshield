import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }

    const systemPrompt = `You are a construction quote extraction assistant. Extract all data from this vendor quote PDF. Return ONLY a valid JSON object — no markdown, no explanation.

The JSON object must have these exact fields:
- vendorName (string): manufacturer or distributor name
- repName (string | null): sales rep full name
- repEmail (string | null): sales rep email address
- repPhone (string | null): sales rep phone number
- quoteNumber (string | null): quote or reference number
- quoteDate (string | null): quote date in YYYY-MM-DD format
- expirationDate (string | null): expiration/valid-through date in YYYY-MM-DD format
- totalAmount (number | null): total quote amount in USD (numbers only, no $ or commas)
- notes (string | null): special terms, warranty info, delivery terms, or other notes
- lineItems (array): each element has:
  - material (string): product or material name
  - unit (string): unit of measure (use common abbreviations: RL, SQ, SF, LF, EA, GAL, BG, TON, LS, BDL, CS)
  - unitPrice (number): price per unit in USD
  - notes (string | null): product code, description, or notes

If a field cannot be determined, use null. Return only the JSON object.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            } as any,
            {
              type: "text",
              text: "Extract all quote data from this PDF. Return only the JSON object.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse extraction result", raw: text },
        { status: 422 }
      );
    }

    return NextResponse.json({ quote: data });
  } catch (err: any) {
    console.error("extract-quote error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
