import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

const ResponseSchema = z.object({
  gcName: z.string().nullable().optional(),
  bidType: z.enum(["gc_invited", "private", "public", "pre_selective", "design_build", "negotiated"]).nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(userId);
  if (!rl.allowed)
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rateLimitHeaders(rl) });

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const { pdfBase64 } = await req.json();
    if (!pdfBase64) return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
    if (pdfBase64.length > MAX_BASE64_CHARS) return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    if (!pdfBase64.startsWith("JVBE")) return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
                {
                  type: "text",
                  text: `Extract bid source information from this document (bid invitation, exhibit, or bid sheet).

Return ONLY valid JSON with these fields (use null for anything not found):
{
  "gcName": "<general contractor or company that sent the invite>",
  "bidType": "<one of: gc_invited, private, public, pre_selective, design_build, negotiated — or null>",
  "contactName": "<contact person name>",
  "contactEmail": "<contact email>",
  "contactPhone": "<contact phone>"
}

Bid type guide:
- gc_invited: a GC sent this bid invitation to the contractor
- private: private owner or developer (no GC)
- public: government, municipality, school district, public agency
- pre_selective: contractor was pre-qualified/shortlisted before receiving this
- design_build: design-build delivery with integrated GC/architect
- negotiated: negotiated work, no competitive bidding

Return ONLY the JSON object. No markdown, no explanation.`,
                },
              ],
            },
          ],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Could not read document — please try again." }, { status: 422 });
    }

    const validated = ResponseSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json({ error: "Unexpected AI response shape." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("extract-bid-source error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
