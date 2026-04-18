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

const ValidateExclusionsSchema = z.object({
  // The 20 most-litigated exclusion categories for commercial roofing
  exclusions: z.array(z.string().max(500).trim()).max(150),
  // Optional context to sharpen recommendations
  systemType: z
    .enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"])
    .optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  gcName: z.string().max(200).trim().optional(),
  totalBidAmount: z.number().positive().optional(),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const CategoryResultSchema = z.object({
  category: z.string(),
  covered: z.boolean(),
  // The specific exclusion text that covers it (if covered)
  coveredBy: z.string().optional(),
  // Risk level if NOT covered
  riskLevel: z.enum(["critical", "high", "medium"]),
  // What to add if missing
  suggestedLanguage: z.string().optional(),
});

const ValidateExclusionsResponseSchema = z.object({
  coverageScore: z.number().int().min(0).max(100),
  coveredCount: z.number().int(),
  missingCount: z.number().int(),
  categories: z.array(CategoryResultSchema).max(20),
  topPriority: z.string(), // One-sentence most urgent action
});

// ---------------------------------------------------------------------------
// The 20 categories (sent to AI as ground truth)
// ---------------------------------------------------------------------------

const EXCLUSION_CATEGORIES = [
  "Hazardous materials / asbestos / lead abatement",
  "Unknown or concealed deck conditions",
  "Structural repairs or reinforcement",
  "Drain lowering or interior plumbing work",
  "Warranties — scope, duration, and NDL limitations",
  "Owner-supplied or GC-furnished materials",
  "Liquidated damages",
  "Schedule delays not caused by roofing contractor",
  "Design errors or specification conflicts",
  "Concealed or unforeseen conditions below existing roofing",
  "Differing site conditions (access, staging, crane pad)",
  "Change in scope of work by owner or GC",
  "Premium time / overtime / shift-work requirements",
  "Subcontractor default or delay",
  "Permit fees and inspection costs",
  "Bonding and insurance upgrades beyond specified limits",
  "Adjacent work by other trades affecting roofing scope",
  "Consequential or indirect damages",
  "Pre-existing leaks or interior damage",
  "Solar, mechanical, or electrical work on the roof",
];

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
    const parsed = ValidateExclusionsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { exclusions, systemType, projectType, gcName, totalBidAmount } = parsed.data;

    const contextLines: string[] = [];
    if (systemType) contextLines.push(`Roof system: ${systemType.toUpperCase()}`);
    if (projectType) contextLines.push(`Project type: ${projectType}`);
    if (gcName) contextLines.push(`GC: ${gcName}`);
    if (totalBidAmount) contextLines.push(`Total bid: $${totalBidAmount.toLocaleString()}`);
    const contextBlock = contextLines.length > 0
      ? `\nProject context:\n${contextLines.join("\n")}`
      : "";

    const exclusionBlock = exclusions.length > 0
      ? exclusions.map((e, i) => `${i + 1}. ${e}`).join("\n")
      : "(No exclusions provided yet)";

    const prompt = `You are a commercial roofing contract specialist reviewing a bid's exclusions and assumptions section before submission.

Your task: evaluate whether the contractor's exclusions cover each of the 20 most-litigated categories in commercial roofing contracts. Missing exclusions create contract disputes and unpaid change orders.${contextBlock}

The 20 categories to check:
${EXCLUSION_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

The contractor's current exclusions:
${exclusionBlock}

For each category, determine if any of the contractor's exclusions meaningfully addresses it (exact wording not required — substance matters). If covered, note which exclusion covers it. If not covered, provide a brief, practical suggested exclusion in plain commercial roofing language (1-2 sentences max, no legalese).

Scoring: coverageScore = (covered categories / 20) × 100, rounded to nearest integer.

Respond with valid JSON only — no markdown, no explanation outside the JSON:
{
  "coverageScore": <0-100>,
  "coveredCount": <integer>,
  "missingCount": <integer>,
  "categories": [
    {
      "category": "<category name>",
      "covered": <true|false>,
      "coveredBy": "<exact exclusion text that covers this, if covered>",
      "riskLevel": "<critical|high|medium>",
      "suggestedLanguage": "<suggested exclusion text, only if NOT covered>"
    }
  ],
  "topPriority": "<single most urgent gap in one sentence>"
}

Risk levels (if NOT covered):
- critical: direct contract liability, GC will hold you to it (hazmat, concealed conditions, LDs, NDL warranty scope)
- high: common change order source, significant dollar exposure
- medium: situational, lower frequency`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2500,
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
      console.error("[validate-exclusions parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json(
        { error: "AI returned an unreadable response — please try again." },
        { status: 422 }
      );
    }

    const validated = ValidateExclusionsResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[validate-exclusions shape-error]", { issues: validated.error.issues });
      return NextResponse.json(
        { error: "AI returned an unexpected response shape — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("validate-exclusions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
