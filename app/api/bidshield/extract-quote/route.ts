import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 20 MB limit — base64 adds ~33% overhead so we check against 27.3 MB of chars
const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  return b64.startsWith("JVBE"); // base64-encoded %PDF magic bytes
}

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

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }
    if (pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (!validatePdfBase64(pdfBase64)) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000) // P1-4: 60s for PDF extraction;
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } } as any,
                { type: "text", text: "Extract all quote data from this PDF. Return only the JSON object." },
              ],
            },
          ],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[ai-parse-error]", { endpoint: req.url, rawResponse: cleaned?.substring(0, 500), parseError: parseErr?.message, userId });
      return NextResponse.json(
        { error: "Failed to parse extraction result" },
        { status: 422 }
      );
    }

    return NextResponse.json({ quote: data });
  } catch (err: any) {
    console.error("extract-quote error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
