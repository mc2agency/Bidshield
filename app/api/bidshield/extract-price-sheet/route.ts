import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 20 MB limit — base64 adds ~33% overhead so we check against 27.3 MB of chars
const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  // PDF magic bytes: %PDF → base64 prefix "JVBE"
  return b64.startsWith("JVBE");
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
    const { pdfBase64, vendorName, priceListDate } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }
    if (pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (!validatePdfBase64(pdfBase64)) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
    }

    const systemPrompt = `You are a construction materials pricing assistant. Extract all product pricing data from this vendor price sheet PDF. Return ONLY a valid JSON array — no markdown, no explanation.

Each item in the array must have these fields:
- productName (string): product/material name
- category (string): one of: Membrane, Insulation, Adhesive, Fasteners, Flashing, Sealant, Drain, Accessory, Other
- unit (string): unit of measure (e.g. "SQ", "LF", "EA", "GAL", "ROLL", "BDL")
- unitPrice (number): price per unit in USD
- coverage (number | null): coverage per unit if available (e.g. 100 for a square)
- coverageUnit (string | null): unit for coverage (e.g. "SF", "LF")
- notes (string | null): any relevant notes (product code, description, etc.)

Return only the JSON array. If a field cannot be determined, use null.`;

    const userContent: Anthropic.MessageParam["content"] = [
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
        text: `Extract all pricing data from this price sheet${vendorName ? ` from ${vendorName}` : ""}${priceListDate ? ` dated ${priceListDate}` : ""}. Return only the JSON array.`,
      },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        { model: "claude-haiku-4-5-20251001", max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: userContent }] },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let items: any[];
    try {
      items = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse extraction result" },
        { status: 422 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Extraction did not return an array" },
        { status: 422 }
      );
    }

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("extract-price-sheet error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
