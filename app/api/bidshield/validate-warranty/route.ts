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

const AssemblySchema = z.object({
  systemType: z.string().max(50).trim(),
  insulationThickness: z.string().max(50).trim().optional(),
  rValue: z.number().optional(),
  attachmentMethod: z.string().max(100).trim().optional(), // "mechanically_attached", "adhered", "ballasted"
  deckType: z.string().max(50).trim().optional(),
  manufacturer: z.string().max(200).trim().optional(),
  productName: z.string().max(200).trim().optional(),
});

const ValidateWarrantySchema = z.object({
  // What the contractor is promising
  warrantyYears: z.number().int().min(1).max(30).optional(),
  warrantyType: z.enum(["ndl", "total_system", "labor_material", "material_only", "labor_only"]).optional(),
  windSpeedMph: z.number().int().min(0).max(200).optional(),
  manufacturer: z.string().max(200).trim().optional(),

  // What's actually in the bid
  assemblies: z.array(AssemblySchema).max(10).optional(),
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  insulationThickness: z.string().max(50).trim().optional(),
  rValue: z.number().optional(),
  attachmentMethod: z.string().max(100).trim().optional(),
  deckType: z.string().max(50).trim().optional(),
  laborType: z.enum(["open_shop", "prevailing_wage", "union"]).optional(),

  // Spec requirement if known
  specWarrantyRequirement: z.string().max(300).trim().optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  totalBidAmount: z.number().positive().optional(),
  sqft: z.number().positive().optional(),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const WarrantyIssueSchema = z.object({
  issue: z.string().min(10).max(400),
  severity: z.enum(["blocker", "high", "medium"]),
  // blocker = warranty is void or unachievable, high = likely issue, medium = risk
  requirement: z.string().max(300).optional(), // What the manufacturer requires
  action: z.string().max(300),                // What to fix
});

const ValidateWarrantyResponseSchema = z.object({
  achievable: z.boolean(),
  confidenceNote: z.string().max(300), // How confident the AI is given available info
  issues: z.array(WarrantyIssueSchema).max(15),
  manufacturerRequirements: z.array(z.string().max(200)).max(10), // Key requirements for this warranty
  warningCount: z.number().int(),
  blockerCount: z.number().int(),
  summary: z.string().max(400),
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
    const parsed = ValidateWarrantySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      warrantyYears, warrantyType, windSpeedMph, manufacturer,
      assemblies, systemType, insulationThickness, rValue,
      attachmentMethod, deckType, laborType,
      specWarrantyRequirement, projectType, totalBidAmount, sqft,
    } = parsed.data;

    const warrantyTypeLabels: Record<string, string> = {
      ndl: "NDL (No Dollar Limit) — manufacturer covers all repair costs including labor",
      total_system: "Total System Warranty — manufacturer covers membrane + insulation system",
      labor_material: "Labor & Material Warranty — covers both material defects and labor",
      material_only: "Material Warranty Only",
      labor_only: "Labor Warranty Only",
    };

    const attachmentLabels: Record<string, string> = {
      mechanically_attached: "Mechanically Attached",
      adhered: "Fully Adhered",
      ballasted: "Ballasted",
    };

    const assemblyBlock = assemblies && assemblies.length > 0
      ? assemblies.map((a, i) =>
          `Assembly ${i + 1}: ${a.systemType?.toUpperCase()}${a.manufacturer ? ` (${a.manufacturer})` : ""}${a.productName ? ` — ${a.productName}` : ""}` +
          `${a.insulationThickness ? ` | insulation: ${a.insulationThickness}` : ""}` +
          `${a.rValue ? ` | R-${a.rValue}` : ""}` +
          `${a.attachmentMethod ? ` | ${attachmentLabels[a.attachmentMethod] ?? a.attachmentMethod}` : ""}` +
          `${a.deckType ? ` | deck: ${a.deckType}` : ""}`
        ).join("\n")
      : null;

    const prompt = `You are a commercial roofing warranty specialist. A contractor is about to bid a project and needs to know if the warranty they're promising is actually achievable with the system they've specified.

WARRANTY BEING PROMISED:
${warrantyYears ? `- Duration: ${warrantyYears} years` : "- Duration: not specified"}
${warrantyType ? `- Type: ${warrantyTypeLabels[warrantyType] ?? warrantyType}` : "- Type: not specified"}
${windSpeedMph ? `- Wind speed coverage: ${windSpeedMph} mph` : ""}
${manufacturer ? `- Manufacturer: ${manufacturer}` : ""}
${specWarrantyRequirement ? `- Spec requirement: "${specWarrantyRequirement}"` : ""}

SYSTEM SPECIFIED IN BID:
${assemblyBlock ?? [
  systemType && `System: ${systemType.toUpperCase()}`,
  insulationThickness && `Insulation thickness: ${insulationThickness}`,
  rValue && `R-value: R-${rValue}`,
  attachmentMethod && `Attachment: ${attachmentLabels[attachmentMethod] ?? attachmentMethod}`,
  deckType && `Deck type: ${deckType}`,
  manufacturer && `Manufacturer: ${manufacturer}`,
  laborType && `Labor type: ${laborType.replace("_", " ")}`,
].filter(Boolean).join("\n") || "(No system details provided)"}
${projectType ? `Project type: ${projectType}` : ""}
${sqft ? `Roof area: ${sqft.toLocaleString()} SF` : ""}
${totalBidAmount ? `Total bid: $${totalBidAmount.toLocaleString()}` : ""}

Your job: evaluate whether this warranty is achievable given what's specified. Check:

1. **Insulation R-value requirements** — NDL warranties typically require minimum R-25 to R-30 for most manufacturers. 20yr NDL often requires R-30+. Check if stated R-value meets threshold.

2. **Attachment method requirements** — Most NDL warranties require fully adhered systems or specific mechanically attached patterns. Ballasted systems often void NDL.

3. **Manufacturer certification** — NDL warranties require manufacturer-certified installers. Is this achievable / budgeted?

4. **Deck type compatibility** — Wood decks, lightweight concrete, and gypsum decks have restrictions for NDL warranties. Steel deck is standard.

5. **Re-cover vs. tear-off** — Many NDL warranties are void over existing roofing. If this is a recover, flag the risk.

6. **Wind speed coverage** — FM-rated wind uplift (FM 1-60, FM 1-90, FM 1-120) requires specific fastener patterns and insulation board sizes that add cost.

7. **Duration achievability** — 25-30 year warranties are only available from certain manufacturers with specific premium products. 20yr NDL is standard for most single-ply.

8. **Cost implications** — If the warranty is achievable but requires specific upgrades (thicker insulation, certified installer, specific product), flag the cost impact.

Severity levels:
- blocker: warranty is void or unachievable with what's specified — DO NOT promise this warranty
- high: likely issue that needs to be resolved before submitting
- medium: risk to confirm with manufacturer rep before bid submission

Be specific about actual manufacturer requirements (GAF, Firestone/Bridgestone, Carlisle, Versico, Johns Manville, Soprema, etc.) where applicable.

If there is insufficient information to make a determination on a specific check, note it as info only — don't fabricate requirements.

Respond with valid JSON only — no markdown fences:
{
  "achievable": <true|false — overall achievability>,
  "confidenceNote": "<how confident you are given the available info>",
  "issues": [
    {
      "issue": "<specific problem>",
      "severity": "blocker|high|medium",
      "requirement": "<what the manufacturer actually requires>",
      "action": "<what to fix>"
    }
  ],
  "manufacturerRequirements": ["<key requirement 1>", "<key requirement 2>"],
  "warningCount": <integer>,
  "blockerCount": <integer>,
  "summary": "<2-3 sentence overall assessment>"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
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
      console.error("[validate-warranty parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json({ error: "AI returned an unreadable response — please try again." }, { status: 422 });
    }

    const validated = ValidateWarrantyResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[validate-warranty shape-error]", { issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("validate-warranty error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
