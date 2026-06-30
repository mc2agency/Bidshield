import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  // PDF magic bytes in base64 always start with "JVBE"
  return b64.startsWith("JVBE");
}

// ── Input validation ──────────────────────────────────────────────────────────

const AnalyzeQuoteScopeInputSchema = z
  .object({
    quoteText: z.string().min(1).max(5000).trim().optional(),
    pdfBase64: z.string().min(1).max(MAX_BASE64_CHARS).optional(),
    projectExclusions: z.array(z.string().max(500)).max(100).optional(),
    projectSystemType: z
      .enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"])
      .optional(),
    vendorName: z.string().max(255).optional(),
    category: z
      .enum(["system", "labor", "accessories", "general_conditions"])
      .optional(),
  })
  .refine((data) => data.quoteText !== undefined || data.pdfBase64 !== undefined, {
    message: "At least one of quoteText or pdfBase64 must be provided",
  });

// ── Output validation ─────────────────────────────────────────────────────────

const ScopeGapItemSchema = z.object({
  item: z.string().min(1).max(500),
  risk: z.enum(["critical", "major", "minor"]),
  recommendation: z.string().min(1).max(1000),
});

const ScopeOverlapItemSchema = z.object({
  item: z.string().min(1).max(500),
  note: z.string().min(1).max(1000),
});

const AnalyzeQuoteScopeResponseSchema = z.object({
  scopeGaps: z.array(ScopeGapItemSchema),
  scopeOverlaps: z.array(ScopeOverlapItemSchema),
  expiryWarning: z.string().max(500).nullable(),
  summary: z.string().min(1).max(1000),
  overallRisk: z.enum(["high", "medium", "low"]),
});

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a commercial roofing bid QA specialist. Analyze a subcontractor or supplier quote and identify scope gaps, overlaps with the general contractor's own scope, and risk areas that could lead to underbidding or disputes.

Specifically look for:
1. Items that are typically in a roofing sub's scope but appear absent from this quote (e.g. flashings, termination bars, drains, edge metal, fasteners, tearoff, debris removal, temporary protection, permits, warranty registration).
2. Items listed as 'by others' or 'excluded' in the project that this quote seems to include — these are potential double-counts that inflate cost or create confusion.
3. Any validity/expiry language in the quote text (e.g. "quote valid for 30 days", "prices expire", "pricing subject to change").
4. Vague or ambiguous scope language that could lead to disputes (e.g. "as needed", "allowance", "per plan", "if required", "assumed", "not included unless requested").

Risk rating rules:
- "critical" — missing or ambiguous item could cause significant cost overrun, dispute, or failed warranty (e.g. primary membrane or attachment method not specified, tearoff not mentioned)
- "major" — missing or unclear item likely affects pricing accuracy or project execution (e.g. flashing details absent, no disposal mentioned)
- "minor" — administrative or clarification gap with small pricing impact (e.g. submittal schedule not mentioned, manufacturer approval not noted)

Overall risk:
- "high" — multiple critical gaps or the quote is so vague that relying on it carries serious financial risk
- "medium" — some major gaps that should be resolved before bid submission
- "low" — minor clarifications only; quote is generally complete and clear

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "scopeGaps": [
    {
      "item": "<what is missing or unclear — be specific>",
      "risk": "critical" | "major" | "minor",
      "recommendation": "<what the estimator should do — max 1000 chars>"
    }
  ],
  "scopeOverlaps": [
    {
      "item": "<what appears duplicated with GC scope or 'by others' list>",
      "note": "<explanation of the overlap and potential impact>"
    }
  ],
  "expiryWarning": "<exact quoted validity/expiry language from the quote, or null if none found>",
  "summary": "<two to three sentence executive summary of the overall quote quality and key risks>",
  "overallRisk": "high" | "medium" | "low"
}

Rules:
- If no scope gaps are found, return an empty array for scopeGaps.
- If no overlaps are found, return an empty array for scopeOverlaps.
- expiryWarning must be the actual language found in the quote, not a paraphrase, or null.
- Do not include any text outside the JSON object.`;

// ── Build user message ────────────────────────────────────────────────────────

function buildContextBlock(
  projectExclusions?: string[],
  projectSystemType?: string,
  vendorName?: string,
  category?: string
): string {
  const lines: string[] = [];

  if (vendorName) lines.push(`Vendor/Subcontractor: ${vendorName}`);
  if (projectSystemType) lines.push(`Project Roof System Type: ${projectSystemType.toUpperCase()}`);
  if (category) lines.push(`Quote Category: ${category.replace("_", " ")}`);

  if (projectExclusions && projectExclusions.length > 0) {
    lines.push(
      "\nProject Exclusions / 'By Others' Items (do NOT expect these in the sub quote):\n" +
        projectExclusions.map((e, i) => `  ${i + 1}. ${e}`).join("\n")
    );
  }

  return lines.length > 0 ? lines.join("\n") : "";
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  // Pro subscription guard
  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    // Parse and validate input
    const body = await req.json();
    const parsed = AnalyzeQuoteScopeInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const isPdf = typeof input.pdfBase64 === "string";

    const contextBlock = buildContextBlock(
      input.projectExclusions,
      input.projectSystemType,
      input.vendorName,
      input.category
    );

    // ── PDF path ───────────────────────────────────────────────────────────────
    if (isPdf) {
      const pdfBase64 = input.pdfBase64 as string;

      if (pdfBase64.length > MAX_BASE64_CHARS) {
        return NextResponse.json(
          { error: "File too large (max 20 MB)" },
          { status: 413 }
        );
      }
      if (!validatePdfBase64(pdfBase64)) {
        return NextResponse.json(
          { error: "File must be a valid PDF" },
          { status: 415 }
        );
      }

      const userTextParts: string[] = [
        "Analyze this subcontractor/supplier quote PDF and return the JSON scope analysis report.",
      ];
      if (contextBlock) userTextParts.push("\nProject context:\n" + contextBlock);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      let message: Awaited<ReturnType<typeof client.messages.create>>;
      try {
        message = await client.messages.create(
          {
            model: "claude-sonnet-4-5-20251001",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
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
                    text: userTextParts.join("\n"),
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

      return parseAndValidateResponse(message, "analyze-quote-scope/pdf");
    }

    // ── Text path ──────────────────────────────────────────────────────────────
    const quoteText = input.quoteText as string;

    const userMessageParts: string[] = [
      "Analyze this subcontractor/supplier quote and return the JSON scope analysis report.",
    ];
    if (contextBlock) userMessageParts.push("\nProject context:\n" + contextBlock);
    userMessageParts.push("\nQuote text:\n" + quoteText);

    const userMessage = userMessageParts.join("\n");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    return parseAndValidateResponse(message, "analyze-quote-scope/text");
  } catch (err: any) {
    console.error("analyze-quote-scope error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Shared response parser & validator ───────────────────────────────────────

function parseAndValidateResponse(
  message: any,
  endpoint: string
): NextResponse {
  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Strip accidental markdown fences the model may add despite instructions
  const cleaned = raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch (parseErr: any) {
    console.error("[ai-parse-error]", {
      endpoint,
      rawResponse: cleaned?.substring(0, 500),
      parseError: parseErr?.message,
    });
    return NextResponse.json(
      { error: "AI returned an unreadable response — please try again." },
      { status: 422 }
    );
  }

  const validated = AnalyzeQuoteScopeResponseSchema.safeParse(data);
  if (!validated.success) {
    console.error("[ai-shape-error]", {
      endpoint,
      issues: validated.error.issues,
      raw: cleaned?.substring(0, 500),
    });
    return NextResponse.json(
      { error: "AI returned an unexpected response shape — please try again." },
      { status: 422 }
    );
  }

  return NextResponse.json(validated.data);
}
