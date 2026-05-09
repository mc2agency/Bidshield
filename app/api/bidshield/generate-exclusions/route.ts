import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const ScopeItemSchema = z.object({
  name: z.string().max(200).trim(),
  note: z.string().max(500).trim().optional(),
});

const GenerateExclusionsSchema = z.object({
  excludedItems: z.array(ScopeItemSchema).max(100).optional(),
  byOthersItems: z.array(ScopeItemSchema).max(100).optional(),
  clarifications: z.array(z.object({ text: z.string().max(500).trim() })).max(100).optional(),
  // New optional context fields for the AI advisor
  systemType: z
    .enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"])
    .optional(),
  projectType: z.enum(["reroof", "new-construction", "new_construction", "recover", "repair", "pre_selective"]).optional(),
  gcName: z.string().max(200).trim().optional(),
  flaggedChecklistItems: z.array(z.string().max(500).trim()).max(50).optional(),
});

// ---------------------------------------------------------------------------
// Output schemas (used for runtime validation of AI JSON response)
// ---------------------------------------------------------------------------

const SuggestionSchema = z.object({
  text: z.string().min(1).max(300),
  reason: z.string().min(1).max(300),
  priority: z.enum(["high", "medium", "low"]),
});

const ExclusionsResponseSchema = z.object({
  text: z.string().min(1),
  suggestions: z.array(SuggestionSchema).max(10),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSystemTypeContext(systemType?: string): string {
  switch (systemType) {
    case "tpo":
    case "epdm":
    case "pvc":
      return `The roof system is ${systemType.toUpperCase()} (single-ply membrane). Common scope risks for this system type include:
- Deck repairs and unknown deck conditions
- Metal deck corrosion or section loss discovered after tear-off
- Structural modifications required to support the weight of added insulation
- Drain lowering or sump pans when adding insulation thickness
- Existing curb heights being too low for new system thickness
- Pipe boot heights and pitch-pocket ownership
- Penetration sleeves and inside/outside corners furnished by GC vs. roofing contractor`;

    case "sbs":
    case "bur":
      return `The roof system is ${systemType.toUpperCase()} (built-up / modified bitumen). Common scope risks for this system type include:
- Torch-applied fire watch requirements and their cost/responsibility
- Substrate preparation scope — who primes, who fills voids
- Vapor retarder ownership and specification compliance
- Existing insulation condition — whether it can be reused or must be replaced
- Hot asphalt access and kettle placement logistics`;

    case "metal":
      return `The roof system is a metal panel system. Common scope risks for this system type include:
- Substrate preparation and existing deck condition
- Structural clip installation — whether it is included in roofing scope or by steel sub
- Gutter and downspout extent, sizing, and color
- Trim, fascia, and rake metal extent
- Trim paint and touch-up responsibility
- Sealant and caulk at penetrations`;

    case "spf":
      return `The roof system is SPF (spray polyurethane foam). Common scope risks for this system type include:
- Substrate cleanliness and moisture — unknown deck conditions
- Coating type and number of coats
- Overspray protection and masking by others
- Wind speed restrictions during application
- Re-coat warranty intervals and owner responsibility`;

    default:
      return "No specific roof system type was provided. Apply general commercial roofing scope risk knowledge.";
  }
}

function buildProjectTypeContext(projectType?: string): string {
  switch (projectType) {
    case "reroof":
      return `This is a REROOF project. Additional scope risks to flag:
- Existing roof removal, haul-off, and disposal (is it included or excluded?)
- Unknown deck conditions concealed by existing roofing
- Hazardous material (asbestos, coal tar) testing and abatement
- Multiple existing roof layers requiring additional tear-off effort`;

    case "recover":
      return `This is a RECOVER (overlay) project. Additional scope risks to flag:
- Weight loading — confirm structure can support added layers
- Existing membrane moisture survey scope (who pays for it?)
- Edge metal termination compatibility with existing system
- Local code limits on number of roof layers`;

    case "new-construction":
    case "new_construction":
      return `This is a NEW CONSTRUCTION project. Additional scope risks to flag:
- Coordination with other trades for penetration sleeves and blocking
- Temporary weather protection / phased installation responsibility
- Substrate readiness verification — who confirms deck is ready?
- Owner-furnished equipment curbs and equipment weights`;

    case "repair":
      return `This is a REPAIR / MAINTENANCE project. Additional scope risks to flag:
- Scope creep — additional deterioration found once repair area is opened
- Matching existing membrane, granules, and surfacing for aesthetic continuity
- Liability for pre-existing conditions outside the repair scope
- Warranty exclusions: repairs on aged or incompatible existing systems may void warranty`;

    case "pre_selective":
      return `This is a PRE-SELECTIVE (invited / negotiated) bid. Additional considerations:
- Pre-qualification requirements must be documented (bonding capacity, experience, safety ratings)
- Invited bid scope may differ from open-bid specs — verify all exclusions match the agreed scope
- Negotiate scope gaps upfront; scope creep is harder to recover post-award on negotiated work
- Bonding and insurance levels may be elevated per pre-qualification requirements`;

    default:
      return "No specific project type was provided. Apply general commercial roofing project risk knowledge.";
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const parsed = GenerateExclusionsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      excludedItems,
      byOthersItems,
      clarifications,
      systemType,
      projectType,
      gcName,
      flaggedChecklistItems,
    } = parsed.data;

    // Build human-readable lists for the prompt
    const excluded = (excludedItems ?? [])
      .map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`)
      .join("\n");
    const byOthers = (byOthersItems ?? [])
      .map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ""}`)
      .join("\n");
    const clars = (clarifications ?? []).map((c) => `- ${c.text}`).join("\n");
    const flagged = (flaggedChecklistItems ?? []).map((f) => `- ${f}`).join("\n");

    const systemTypeContext = buildSystemTypeContext(systemType);
    const projectTypeContext = buildProjectTypeContext(projectType);

    const prompt = `You are an expert commercial roofing estimator and bid advisor. Your job has TWO parts:

PART 1 — FORMAT the provided exclusions into a professional, numbered proposal-ready list.
PART 2 — ADVISE the estimator by suggesting missing exclusions they likely need based on the project context.

---

PROJECT CONTEXT:
- System Type: ${systemType ? systemType.toUpperCase() : "Not specified"}
- Project Type: ${projectType ? projectType : "Not specified"}
- General Contractor: ${gcName ? gcName : "Not specified"}

SYSTEM-SPECIFIC RISKS:
${systemTypeContext}

PROJECT-TYPE RISKS:
${projectTypeContext}

UNIVERSAL COMMERCIAL ROOFING RISKS (always consider):
- Owner-furnished materials (OFM) scope and delivery responsibility
- GC-furnished scaffolding, crane, hoist, and man-lift access
- Liquidated damages acknowledgment (confirm LD clause and amount)
- Differing site conditions discovered after work begins
- Utility shutdowns (gas, HVAC, sprinkler) by owner/GC
- Interior protection for active building occupancy

---

ESTIMATOR'S CURRENT EXCLUSIONS:

EXCLUDED from our scope:
${excluded || "(none provided)"}

BY OTHERS:
${byOthers || "(none provided)"}

CLARIFICATIONS & ASSUMPTIONS:
${clars || "(none provided)"}

FLAGGED CHECKLIST ITEMS:
${flagged || "(none provided)"}

---

INSTRUCTIONS:

Return a single JSON object with EXACTLY this structure:
{
  "text": "<PART 1: professionally formatted, numbered exclusions list — ready to paste into the proposal. Incorporate all excluded items, by-others items, and clarifications into one unified, professional numbered list. Use industry terminology. No preamble, no closing remarks — just the numbered list.>",
  "suggestions": [
    {
      "text": "<concise, proposal-ready exclusion statement (max 300 chars)>",
      "reason": "<brief explanation of why this exclusion is important for this project (max 300 chars)>",
      "priority": "<'high', 'medium', or 'low'>"
    }
  ]
}

For "suggestions":
- Suggest between 3 and 8 exclusions the estimator has NOT already covered
- Do NOT repeat anything already present in the exclusions the estimator provided
- Prioritize based on financial risk: 'high' = likely cost dispute if missing, 'medium' = common scope gap, 'low' = good practice
- Base suggestions on the system type, project type, and universal risks listed above
- Each suggestion must be actionable and specific — not generic filler

Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system:
            "You are BidShield, a QA assistant and scope advisor for commercial roofing estimators. Your role is to help estimators produce clear, professional bid exclusions sections AND proactively flag missing exclusions that could lead to costly disputes. You have deep knowledge of commercial roofing scope — membrane systems (TPO, EPDM, SBS, PVC, BUR, SPF), metal roofing, insulation, deck conditions, and contractor risk allocation. You always respond with valid JSON only — no markdown, no preamble.",
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "AI returned an empty response — please try again." },
        { status: 422 }
      );
    }

    // Parse and validate the AI's JSON response
    let parsed2: z.infer<typeof ExclusionsResponseSchema>;
    try {
      const jsonData = JSON.parse(rawText);
      const validation = ExclusionsResponseSchema.safeParse(jsonData);
      if (!validation.success) {
        console.error(
          "generate-exclusions: AI response failed schema validation:",
          validation.error.flatten()
        );
        return NextResponse.json(
          {
            error:
              "AI response did not match expected format — please try again.",
          },
          { status: 422 }
        );
      }
      parsed2 = validation.data;
    } catch (parseErr) {
      console.error(
        "generate-exclusions: Failed to parse AI JSON response:",
        parseErr,
        "\nRaw response:",
        rawText.slice(0, 500)
      );
      return NextResponse.json(
        { error: "AI returned malformed JSON — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed2);
  } catch (err: any) {
    console.error("generate-exclusions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
