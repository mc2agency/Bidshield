import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const FlagRfiRisksSchema = z.object({
  // Free-text spec excerpt or notes — estimator pastes in ambiguous language
  specText: z.string().min(10).max(8000).trim(),
  // Optional context
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  gcName: z.string().max(200).trim().optional(),
  bidDate: z.string().max(50).trim().optional(), // ISO or human-readable
  daysUntilBid: z.number().int().min(0).max(365).optional(),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const RfiQuestionSchema = z.object({
  question: z.string().min(10).max(600),
  reason: z.string().min(10).max(400),    // Why this matters for the estimate
  riskLevel: z.enum(["critical", "high", "medium"]),
  // Which spec section / drawing ref the ambiguity comes from (if identifiable)
  reference: z.string().max(200).optional(),
  // Cost exposure if not clarified (rough category)
  exposureCategory: z.enum([
    "scope_gap",
    "material_spec_conflict",
    "labor_scope",
    "warranty_liability",
    "compliance_cost",
    "schedule_risk",
    "unknown",
  ]),
});

const FlagRfiRisksResponseSchema = z.object({
  rfiCount: z.number().int(),
  urgencyNote: z.string().max(400), // Overall urgency given bid date
  questions: z.array(RfiQuestionSchema).max(15),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(userId);
  if (!rl.allowed)
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rateLimitHeaders(rl) });

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const parsed = FlagRfiRisksSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { specText, systemType, projectType, gcName, bidDate, daysUntilBid } = parsed.data;

    const contextLines: string[] = [];
    if (systemType) contextLines.push(`Roof system: ${systemType.toUpperCase()}`);
    if (projectType) contextLines.push(`Project type: ${projectType}`);
    if (gcName) contextLines.push(`GC: ${gcName}`);
    if (bidDate) contextLines.push(`Bid date: ${bidDate}`);
    if (daysUntilBid != null) contextLines.push(`Days until bid: ${daysUntilBid}`);
    const contextBlock = contextLines.length > 0
      ? `\nProject context:\n${contextLines.join("\n")}`
      : "";

    const urgencyContext = daysUntilBid != null
      ? daysUntilBid <= 3
        ? "URGENT: Bid is in 3 days or fewer. Prioritize only the most critical RFIs that would change the estimate by 5%+ if unanswered."
        : daysUntilBid <= 7
          ? "Bid is in less than a week. Focus on high-impact ambiguities that affect scope or cost."
          : "Standard urgency. Surface all meaningful ambiguities."
      : "Standard urgency.";

    const prompt = `You are a senior commercial roofing estimator reviewing spec language for ambiguities, conflicts, and hidden cost risks before submitting a bid.

${urgencyContext}${contextBlock}

Spec text / notes to analyze:
---
${specText}
---

Your job: identify every ambiguity, conflict, missing requirement, or spec clause that could cause a scope gap, cost overrun, or contract dispute. For each issue, draft a specific, professional RFI question the estimator should send to the GC before bid day.

Focus on:
1. Conflicting system requirements (spec vs. drawings, section vs. section)
2. Missing performance criteria (R-value, FM rating, wind uplift, fire class not specified)
3. Ambiguous scope boundaries (tear-off, deck repair, drain lowering — who does what?)
4. Undefined warranty requirements or installer certification mandates
5. Hidden cost items (prevailing wage, certified payroll, special inspections, mock-ups)
6. Owner-supplied or GC-furnished items not clearly delineated
7. Schedule constraints or premium time triggers
8. Alternates or unit prices not clearly scoped

Risk levels:
- critical: unanswered = cannot accurately price, or creates unlimited liability
- high: unanswered = 5%+ cost variance likely
- medium: worth asking, but bid can proceed with a conservative assumption

Each RFI question must be:
- Specific enough to send directly to the GC (no vague "please clarify")
- Written in professional construction industry language
- Reference a specific spec section, drawing number, or clause where identifiable

Respond with valid JSON only — no markdown fences:
{
  "rfiCount": <integer>,
  "urgencyNote": "<one sentence on overall urgency given the bid timeline>",
  "questions": [
    {
      "question": "<the actual RFI question text, ready to send>",
      "reason": "<why this matters for the estimate>",
      "riskLevel": "critical|high|medium",
      "reference": "<spec section / drawing ref if identifiable, else omit>",
      "exposureCategory": "scope_gap|material_spec_conflict|labor_scope|warranty_liability|compliance_cost|schedule_risk|unknown"
    }
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[flag-rfi-risks parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json(
        { error: "AI returned an unreadable response — please try again." },
        { status: 422 }
      );
    }

    const validated = FlagRfiRisksResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[flag-rfi-risks shape-error]", { issues: validated.error.issues });
      return NextResponse.json(
        { error: "AI returned an unexpected response shape — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("flag-rfi-risks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
