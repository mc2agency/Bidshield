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

const MaterialItemSchema = z.object({
  productName: z.string().max(200).trim(),
  manufacturer: z.string().max(200).trim().optional(),
  category: z.string().max(100).trim().optional(),
});

const GenerateSubmittalChecklistSchema = z.object({
  // Materials on the project (from spec extraction or Materials tab)
  materials: z.array(MaterialItemSchema).max(100),
  // Project context
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  gcName: z.string().max(200).trim().optional(),
  // Any special requirements flagged from the spec
  specFlags: z.array(z.string().max(300).trim()).max(30).optional(),
  // Warranty type if known
  warrantyType: z.string().max(100).trim().optional(), // e.g. "20yr NDL", "15yr labor+material"
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const SubmittalItemSchema = z.object({
  item: z.string().min(5).max(300),
  category: z.enum([
    "product_data",      // Product data sheets / cut sheets
    "shop_drawing",      // Shop drawings
    "sample",            // Physical or color samples
    "certificate",       // Certifications (FM, UL, installer cert)
    "test_report",       // Test reports / third-party test data
    "warranty",          // Warranty documents / NDL application
    "inspection",        // Special inspection plan
    "other",
  ]),
  // Which material or requirement this is tied to
  relatedTo: z.string().max(200).optional(),
  required: z.boolean(), // Required by spec vs. recommended best practice
  // Typical lead time warning if long
  leadTimeNote: z.string().max(200).optional(),
});

const GenerateSubmittalChecklistResponseSchema = z.object({
  totalCount: z.number().int(),
  requiredCount: z.number().int(),
  items: z.array(SubmittalItemSchema).max(50),
  operationsNote: z.string().max(400), // One-sentence note for ops team
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
    const parsed = GenerateSubmittalChecklistSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { materials, systemType, projectType, gcName, specFlags, warrantyType } = parsed.data;

    const contextLines: string[] = [];
    if (systemType) contextLines.push(`Roof system: ${systemType.toUpperCase()}`);
    if (projectType) contextLines.push(`Project type: ${projectType}`);
    if (gcName) contextLines.push(`GC: ${gcName}`);
    if (warrantyType) contextLines.push(`Warranty type: ${warrantyType}`);
    const contextBlock = contextLines.length > 0
      ? `\nProject context:\n${contextLines.join("\n")}`
      : "";

    const materialsBlock = materials.length > 0
      ? materials.map((m, i) =>
          `${i + 1}. ${m.productName}${m.manufacturer ? ` (${m.manufacturer})` : ""}${m.category ? ` — ${m.category}` : ""}`
        ).join("\n")
      : "(No specific materials listed — generate based on system type)";

    const specFlagsBlock = specFlags && specFlags.length > 0
      ? `\nSpec flags / special requirements:\n${specFlags.map(f => `- ${f}`).join("\n")}`
      : "";

    const prompt = `You are a commercial roofing project manager generating a pre-bid submittal checklist so the operations team is ready on day one of award.

Your job: based on the materials specified and project context, generate a complete submittal checklist that the GC will require. Include every product data sheet, shop drawing, sample, certification, test report, and warranty document that will be required — both items required by the spec AND industry-standard best practices for this system type.${contextBlock}${specFlagsBlock}

Materials / products on this project:
${materialsBlock}

For each submittal item:
- Be specific (e.g. "GAF EverGuard TPO 60mil product data sheet" not just "membrane data sheet")
- Flag lead time issues (NDL warranty applications often take 2-4 weeks, manufacturer certs can take 1 week)
- Mark as required=true only if it's typically required by GCs / specs for this system type; false for recommended-but-optional items
- Include the FM/UL test reports if this is a new-construction or recover project (they're almost always required)
- Include installer certification if the system type typically requires it (GAF, Firestone, Carlisle all require certified installers for NDL warranties)

Categories:
- product_data: cut sheets, ICC listings, SDS sheets
- shop_drawing: layout drawings, details, penetration schedules
- sample: color chip, membrane sample, insulation sample
- certificate: FM Global approval, UL listing, installer certification, OSHA cert
- test_report: wind uplift test, FM test, fire resistance test
- warranty: manufacturer warranty application, NDL application, labor warranty
- inspection: special inspection plan, third-party inspection schedule
- other: anything that doesn't fit above

Respond with valid JSON only — no markdown fences:
{
  "totalCount": <integer>,
  "requiredCount": <integer of items where required=true>,
  "items": [
    {
      "item": "<specific submittal item description>",
      "category": "<category>",
      "relatedTo": "<product or requirement it's tied to>",
      "required": <true|false>,
      "leadTimeNote": "<lead time warning if applicable, else omit>"
    }
  ],
  "operationsNote": "<one sentence for the ops team about the most important thing to start on immediately>"
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
      console.error("[generate-submittal-checklist parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json(
        { error: "AI returned an unreadable response — please try again." },
        { status: 422 }
      );
    }

    const validated = GenerateSubmittalChecklistResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[generate-submittal-checklist shape-error]", { issues: validated.error.issues });
      return NextResponse.json(
        { error: "AI returned an unexpected response shape — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("generate-submittal-checklist error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
