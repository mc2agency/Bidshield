import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AnalyzeLaborSchema = z.object({
  description: z.string().min(1).max(5000).trim(),
  projectName: z.string().max(200).optional(),
  sqft: z.number().positive().optional(),
  systemType: z.string().max(50).optional(),
  deckType: z.string().max(50).optional(),
  laborType: z.enum(["open_shop", "prevailing_wage", "union"]).optional(),
  baseWage: z.number().positive().max(500).optional(),
  bidDate: z.string().max(20).optional(),
  estimatedDuration: z.string().max(100).optional(),
  assemblies: z.array(z.string().max(100)).max(20).optional(),
});

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
    const parsed = AnalyzeLaborSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const {
      description,
      projectName,
      sqft,
      systemType,
      deckType,
      laborType,
      baseWage,
      bidDate,
      estimatedDuration,
      assemblies,
    } = parsed.data;

    const burdenMap: Record<string, number> = {
      open_shop: 1.35,
      prevailing_wage: 1.55,
      union: 1.65,
    };
    const laborTypeLabel: Record<string, string> = {
      open_shop: "Open Shop",
      prevailing_wage: "Prevailing Wage",
      union: "Union",
    };
    const burdenMultiplier = burdenMap[laborType ?? "open_shop"] ?? 1.35;
    const resolvedBaseWage = baseWage ?? 35;
    const loadedRate = resolvedBaseWage * burdenMultiplier * 8; // $/person/day

    const systemPrompt = `You are a commercial roofing labor cost estimator with 20+ years of field experience in the US market.

Your job: analyze a roofing scope description and produce a detailed, task-level labor breakdown. You will return a single JSON object only — no markdown, no commentary.

=== LOADED LABOR RATE ===
Labor type: ${laborTypeLabel[laborType ?? "open_shop"] ?? "Open Shop"}
Base wage: $${resolvedBaseWage}/hr
Burden multiplier: ${burdenMultiplier}x
Loaded day rate: $${loadedRate.toFixed(2)}/person/day
Use this rate for all cost calculations.

=== PROJECT CONTEXT ===
Project: ${projectName ?? "Commercial Roofing Project"}
${sqft ? `Roof area: ${sqft.toLocaleString()} SF` : ""}
${systemType ? `System type: ${systemType}` : ""}
${deckType ? `Deck type: ${deckType}` : ""}
${assemblies?.length ? `Assemblies: ${assemblies.join(", ")}` : ""}
${estimatedDuration ? `Estimated duration (from Bid Quals): ${estimatedDuration}` : ""}
${bidDate ? `Bid date: ${bidDate}` : ""}

=== SCOPE BOUNDARY — GENERAL CONDITIONS (DO NOT GENERATE TASKS FOR THESE) ===
The following are General Conditions items — indirect costs that belong in a separate section of the bid.
DO NOT create labor tasks for them. Instead, if the scope mentions any of these items, add them to the "warnings" array with a note like "Mobilization mentioned — move to Gen. Conds: Site Setup":

- Mobilization / demobilization → Gen. Conds: Site Setup
- Daily cleanup / debris removal → Gen. Conds: Site Setup
- Fire watch (hot work) → Gen. Conds: Safety & Compliance
- Dumpster / haul-away → Gen. Conds: Site Setup
- Crane / lift equipment rental → Gen. Conds: Equipment & Rentals
- OSHA safety compliance → Gen. Conds: Safety & Compliance
- Hot work permits → Gen. Conds: Safety & Compliance
- Project manager time → Gen. Conds: Supervision
- Superintendent premium → Gen. Conds: Supervision
- Pre-roofing / post-roofing testing (nuclear density, flood test) → Gen. Conds: Testing & Inspections
- Temporary weather protection (tarps, drying fees) → Gen. Conds: Site Setup

=== TASK CATEGORIES ===
Use exactly one of these category values for each task:
- "membrane" — installing membrane, plies, base/cap, TPO/PVC/EPDM/SBS
- "insulation" — setting insulation boards, coverboards, tapered systems
- "flashing" — all flashing, metal work, counterflashing, curb wraps
- "tearoff" — demo, removal of existing roofing
- "accessories" — drains, penetrations, pipe boots, expansion joints, walkway pads
- "other" — anything that doesn't fit above (but is still direct labor)

=== OUTPUT FORMAT ===
Return exactly this JSON structure (no markdown fences, no other text):

{
  "tasks": [
    {
      "category": "membrane",
      "task": "TPO Membrane Install — mechanically attached",
      "unit": "SF",
      "quantity": 45000,
      "ratePerUnit": 0.18,
      "totalCost": 8100,
      "crewSize": 4,
      "days": 25,
      "notes": "Based on 450 SF/day/crew",
      "rateFlag": "ok",
      "detailType": "SF_based"
    }
  ],
  "totalLaborCost": 45000,
  "totalDays": 65,
  "laborPerSf": 1.00,
  "scheduleConflict": false,
  "scheduleNote": null,
  "assumptions": [
    "Standard conditions — no accelerated schedule premium applied",
    "Crew mobilizes once — assume no phasing"
  ],
  "warnings": [
    "Fire watch mentioned in scope — move to Gen. Conds: Safety & Compliance"
  ]
}

=== FIELD RULES ===
ratePerUnit: loaded cost PER UNIT (e.g. $/SF, $/LF, $/EA). Use the loaded day rate above divided by production rate.
totalCost: quantity × ratePerUnit (verify this matches)
rateFlag: "low" if rate is >25% below industry standard, "high" if >25% above, "ok" otherwise
detailType: "SF_based" | "LF_based" | "count" | "lump_sum"
scheduleConflict: true if estimated total days exceeds the stated estimatedDuration
scheduleNote: explain the conflict if true (e.g. "Estimated 65 days exceeds 45-day duration — risk of schedule premium")
assumptions: list every assumption you made (production rates, conditions, crew sizes)
warnings: list Gen. Conds items flagged from the scope, plus any high-risk items

DO NOT generate tasks for Gen. Conds items. Only direct field labor goes in the tasks array.
Return only the JSON object.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: "user", content: `Analyze this roofing scope and generate a labor breakdown:\n\n${description}` }],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let result: any;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[ai-parse-error]", { endpoint: req.url, rawResponse: cleaned?.substring(0, 500), parseError: parseErr?.message, userId });
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 422 }
      );
    }

    // M-3/L-3: Validate numeric fields in AI labor analysis to catch NaN/string issues
    const LaborTaskSchema = z.object({
      category: z.string().default("general"),
      task: z.string().default("Unnamed Task"),
      unit: z.string().default("SF"),
      quantity: z.number().min(0).default(0),
      ratePerUnit: z.number().min(0).default(0),
      totalCost: z.number().min(0).default(0),
      crewSize: z.number().min(1).default(1),
      days: z.number().min(0).default(0),
      notes: z.string().nullable().optional(),
      rateFlag: z.string().default("ok"),
      detailType: z.string().default("SF_based"),
    });
    const LaborResultSchema = z.object({
      tasks: z.array(LaborTaskSchema).default([]),
      totalLaborCost: z.number().min(0).default(0),
      totalDays: z.number().min(0).default(0),
      laborPerSf: z.number().min(0).default(0),
      scheduleConflict: z.boolean().default(false),
      scheduleNote: z.string().nullable().optional(),
      assumptions: z.array(z.string()).default([]),
      warnings: z.array(z.string()).default([]),
    });

    const validated = LaborResultSchema.safeParse(result);
    if (!validated.success) {
      console.error("[ai-shape-error]", { endpoint: req.url, zodErrors: validated.error.issues.slice(0, 5), userId });
      return NextResponse.json(
        { error: "AI returned labor data in an unexpected format — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ...validated.data,
      laborType: laborType ?? "open_shop",
      baseWage: resolvedBaseWage,
      burdenMultiplier,
      loadedRate,
    });
  } catch (err: any) {
    console.error("analyze-labor error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
