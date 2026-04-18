import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Input validation ──────────────────────────────────────────────────────────

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

const TextInputSchema = z.object({
  description: z.string().min(1).max(5000).trim(),
  pdfBase64: z.undefined().optional(),
});

const PdfInputSchema = z.object({
  pdfBase64: z.string().min(1).max(MAX_BASE64_CHARS),
  filename: z.string().max(255).optional(),
  description: z.undefined().optional(),
});

const CheckAddendumInputSchema = z.union([TextInputSchema, PdfInputSchema]);

function validatePdfBase64(b64: string): boolean {
  // PDF magic bytes in base64 always start with "JVBE"
  return b64.startsWith("JVBE");
}

// ── Output validation ─────────────────────────────────────────────────────────

const ImpactItemSchema = z.object({
  phase: z.string().min(1).max(100),
  phaseKey: z.string().min(1).max(20),
  severity: z.enum(["critical", "major", "minor"]),
  action: z.string().min(1).max(500),
  detail: z.string().min(1).max(1000),
});

const ImpactResponseSchema = z.object({
  impacts: z.array(ImpactItemSchema),
  summary: z.string().min(1).max(500),
});

// ── BidShield phase reference (18 phases) ────────────────────────────────────

const BIDSHIELD_PHASES = `
BidShield has exactly 18 checklist phases. When identifying which phases are impacted, you MUST use only these exact phase names and keys:

| phaseKey | phase name                          |
|----------|-------------------------------------|
| phase1   | Project Setup                       |
| phase2   | Document Receipt & Addenda          |
| phase3   | Architectural Review                |
| phase4   | Structural Review                   |
| phase5   | Mechanical Review                   |
| phase6   | Plumbing Review                     |
| phase7   | Electrical Review                   |
| phase8   | Civil/Site Review                   |
| phase9   | Specification Review                |
| phase10  | Takeoff - Areas                     |
| phase11  | Takeoff - Linear                    |
| phase12  | Takeoff - Counts                    |
| phase13  | Pricing - Materials                 |
| phase14  | Pricing - Labor                     |
| phase15  | Pre-Submission Review               |
| phase16  | Bid Submission                      |
| phase17  | Scope Boundaries & Exclusions       |
| phase18  | General Conditions & Qualifications |
`.trim();

// ── Shared system prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior commercial roofing estimator reviewing a bid addendum. Your job is to identify every meaningful change in the addendum and map each change to the BidShield phase(s) that must be re-reviewed before submitting the bid.

${BIDSHIELD_PHASES}

Severity rating rules:
- "critical" — directly changes bid price, total scope, or contract value (e.g. new unit prices, scope additions/deletions, alternate changes, bond requirements, bid date change)
- "major"    — changes quantities, specifications, or materials that require re-takeoff or re-pricing (e.g. membrane thickness change, added penetrations, insulation R-value increase)
- "minor"    — administrative clarification with minimal pricing impact (e.g. clarifying a note, adding a detail reference, correcting a drawing label)

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "impacts": [
    {
      "phase": "<exact phase name from the table above>",
      "phaseKey": "<exact phaseKey from the table above>",
      "severity": "critical" | "major" | "minor",
      "action": "<concise action the estimator must take — max 500 chars>",
      "detail": "<specific detail from the addendum that drives this impact — max 1000 chars>"
    }
  ],
  "summary": "<one or two sentence executive summary of the overall addendum impact — max 500 chars>"
}

Rules:
- Include one impact item per phase per significant change. If a single addendum change touches multiple phases, add a separate item for each phase.
- If the addendum has no meaningful impact on a given phase, omit that phase entirely.
- Always include phase2 (Document Receipt & Addenda) with at minimum a "minor" severity to acknowledge the addendum itself.
- Use only the exact phaseKey values listed in the table. Never invent new keys.
- Do not include any text outside the JSON object.`;

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
    const parsed = CheckAddendumInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const input = parsed.data;
    const isPdf = "pdfBase64" in input && typeof input.pdfBase64 === "string";

    // ── PDF path ──────────────────────────────────────────────────────────────
    if (isPdf) {
      const { pdfBase64 } = input as { pdfBase64: string; filename?: string };

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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      let message: Awaited<ReturnType<typeof client.messages.create>>;
      try {
        message = await client.messages.create(
          {
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
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
                    text: "Analyze this addendum PDF and return the JSON impact report.",
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

      return parseAndValidateResponse(message, "check-addendum-impact/pdf");
    }

    // ── Text path ─────────────────────────────────────────────────────────────
    const { description } = input as { description: string };

    const userMessage = `Analyze this addendum description and return the JSON impact report.\n\nAddendum:\n${description}`;

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

    return parseAndValidateResponse(message, "check-addendum-impact/text");
  } catch (err: any) {
    console.error("check-addendum-impact error:", err);
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

  const validated = ImpactResponseSchema.safeParse(data);
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
