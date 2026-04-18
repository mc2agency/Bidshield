import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const BidLineItemSchema = z.object({
  item: z.string().max(300).trim(),
  status: z.string().max(50).trim().optional(), // "included", "excluded", "by_others"
  cost: z.number().optional(),
});

const ScanSpecAlignmentSchema = z.object({
  pdfBase64: z.string().min(100),
  // Bid scope items (from ScopeTab)
  scopeItems: z.array(BidLineItemSchema).max(200).optional(),
  // Checklist completion (which phases are done)
  checklistPhases: z.array(z.string().max(100).trim()).max(30).optional(),
  // Project context
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  totalBidAmount: z.number().positive().optional(),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const AlignmentGapSchema = z.object({
  specRequirement: z.string().min(5).max(400),
  gapType: z.enum([
    "not_in_scope",       // Spec requires it, not in bid scope at all
    "excluded_but_required", // Estimator excluded it but spec mandates it
    "by_others_unclear",  // Assigned to others but spec doesn't support that
    "cost_risk",          // In scope but likely underpriced given spec requirement
    "compliance_item",    // Regulatory / certification requirement not addressed
  ]),
  severity: z.enum(["critical", "high", "medium"]),
  specReference: z.string().max(200).optional(),   // Section number if identifiable
  suggestedAction: z.string().max(300),
});

const ScanSpecAlignmentResponseSchema = z.object({
  alignmentScore: z.number().int().min(0).max(100),
  gapCount: z.number().int(),
  criticalGaps: z.number().int(),
  gaps: z.array(AlignmentGapSchema).max(25),
  coveredWell: z.array(z.string().max(200)).max(10), // Things the spec requires that ARE covered
  executiveSummary: z.string().max(500),
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
    const body = await req.json();

    // Validate PDF size before full schema parse
    if (typeof body.pdfBase64 === "string" && body.pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (typeof body.pdfBase64 === "string" && !body.pdfBase64.startsWith("JVBE")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
    }

    const parsed = ScanSpecAlignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { pdfBase64, scopeItems, checklistPhases, systemType, projectType, totalBidAmount } = parsed.data;

    const scopeBlock = scopeItems && scopeItems.length > 0
      ? `\nEstimator's current bid scope items:\n${scopeItems.map(s =>
          `- [${s.status ?? "unaddressed"}] ${s.item}${s.cost ? ` ($${s.cost.toLocaleString()})` : ""}`
        ).join("\n")}`
      : "\n(No scope items provided — assess based on spec alone)";

    const checklistBlock = checklistPhases && checklistPhases.length > 0
      ? `\nChecklist phases completed: ${checklistPhases.join(", ")}`
      : "";

    const contextBlock = [
      systemType && `System type: ${systemType.toUpperCase()}`,
      projectType && `Project type: ${projectType}`,
      totalBidAmount && `Total bid: $${totalBidAmount.toLocaleString()}`,
    ].filter(Boolean).join("\n");

    const userPrompt = `You are a commercial roofing contract specialist performing a spec-to-bid alignment scan.

Your job: read the attached spec PDF and cross-reference every requirement against the estimator's bid scope. Identify gaps — things the spec requires that are NOT properly covered in the bid.
${contextBlock ? `\nProject context:\n${contextBlock}` : ""}${scopeBlock}${checklistBlock}

Focus on:
1. Scope items the spec mandates that are NOT in the bid (tear-off, drain lowering, mock-ups, testing, etc.)
2. Items the estimator excluded that the spec actually requires them to provide
3. Items marked "by others" that the spec assigns to the roofing contractor
4. Compliance requirements not addressed: special inspections, certifications, prevailing wage, bonding
5. Warranty requirements that create scope obligations (deck attachment requirements, fastener patterns, etc.)
6. Performance criteria that add cost: FM ratings requiring specific fastener patterns, ASHRAE R-value minimums requiring extra insulation, fire ratings requiring specific assemblies

Gap types:
- not_in_scope: spec requires it, not mentioned in bid at all
- excluded_but_required: estimator excluded it, but spec mandates contractor provide it
- by_others_unclear: assigned to others, but spec language assigns it to roofing contractor
- cost_risk: in scope but spec requirement will cost more than typically budgeted
- compliance_item: regulatory/certification requirement not addressed

Severity:
- critical: unbid work the GC will hold the contractor to — direct contract loss
- high: significant dollar exposure if not addressed ($10K+)
- medium: worth noting, lower exposure

Alignment score: 100 = perfect coverage, 0 = completely uncovered. Deduct 20 pts per critical gap, 10 per high, 3 per medium.

Also note 3–10 things the spec requires that ARE well-covered in the bid (coveredWell).

Respond with valid JSON only — no markdown fences:
{
  "alignmentScore": <0-100>,
  "gapCount": <integer>,
  "criticalGaps": <integer>,
  "gaps": [
    {
      "specRequirement": "<what the spec requires>",
      "gapType": "<gap type>",
      "severity": "critical|high|medium",
      "specReference": "<section number if identifiable>",
      "suggestedAction": "<what the estimator should do>"
    }
  ],
  "coveredWell": ["<requirement 1>", "<requirement 2>"],
  "executiveSummary": "<2-3 sentence summary of alignment status>"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
                } as any,
                { type: "text", text: userPrompt },
              ],
            },
          ],
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
      console.error("[scan-spec-alignment parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json({ error: "AI returned an unreadable response — please try again." }, { status: 422 });
    }

    const validated = ScanSpecAlignmentResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[scan-spec-alignment shape-error]", { issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("scan-spec-alignment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
