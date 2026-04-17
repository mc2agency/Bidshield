import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  return b64.startsWith("JVBE");
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }
    if (pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (!validatePdfBase64(pdfBase64)) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
    }

    const systemPrompt = `You are a commercial roofing specification analyst. Analyze this specification document (typically Division 07 — Thermal and Moisture Protection) and extract a structured summary of everything an estimator needs to price this job.

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:

{
  "specSections": [
    {
      "csiNumber": "07 54 23",
      "title": "Thermoplastic Polyolefin (TPO) Roofing"
    }
  ],
  "assemblies": [
    {
      "label": "RT-01",
      "name": "Main Roof - TPO Mechanically Attached",
      "system": "tpo",
      "membrane": { "type": "tpo", "thickness": "60mil", "manufacturer": "Carlisle" },
      "insulation": { "type": "polyiso", "thickness": "2.5", "rValue": 14.25, "layers": "1 layer 2.5in polyiso" },
      "coverBoard": "DensDeck 1/2in",
      "vaporRetarder": "self-adhered",
      "attachmentMethod": "mechanically_attached",
      "surfaceType": "exposed",
      "deckType": "steel"
    }
  ],
  "warranty": {
    "tier": "20-yr NDL",
    "manufacturer": "Carlisle",
    "type": "NDL",
    "years": 20,
    "windSpeed": "120 mph",
    "requirements": ["single source manufacturer", "certified installer required"]
  },
  "performance": {
    "windUplift": "FM 1-90",
    "fireRating": "Class A",
    "rValueRequired": 25,
    "energyCode": "ASHRAE 90.1-2019",
    "climateZone": "4A"
  },
  "approvedManufacturers": ["Carlisle SynTec", "Johns Manville", "Firestone"],
  "materials": [
    {
      "category": "membrane",
      "productName": "Sure-Weld TPO 60mil",
      "name": "Sure-Weld TPO 60mil Membrane",
      "spec": "ASTM D6878, min 60 mil thickness",
      "manufacturer": "Carlisle",
      "coverageRate": "100 SF/RL"
    },
    {
      "category": "insulation",
      "productName": "Polyiso 2.5in",
      "name": "Polyiso Insulation Board 2.5in",
      "spec": "ASTM C1289, Type II, Class 1, Grade 2",
      "manufacturer": "as specified",
      "coverageRate": "32 SF/BD"
    }
  ],
  "testingRequirements": [
    { "type": "flood_test", "description": "72-hour flood test of completed roof" },
    { "type": "core_cuts", "description": "Core cuts at 10,000 SF intervals" }
  ],
  "submittals": [
    "Product data sheets for all roofing materials",
    "Manufacturer warranty documentation",
    "Installer qualification documentation"
  ],
  "laborRequirements": {
    "laborType": "prevailing_wage",
    "certifiedInstaller": true,
    "manufacturerTraining": true
  },
  "generalConditions": [
    { "item": "Performance bond", "description": "100% performance and payment bond required" },
    { "item": "Insurance", "description": "CGL $2M aggregate, umbrella $5M" }
  ],
  "scopeNotes": [
    "Tear-off of existing BUR system to deck",
    "All flashing and sheet metal included",
    "Temporary waterproofing during construction"
  ],
  "projectInfo": {
    "projectName": "string or null",
    "location": "string or null",
    "bidDate": "string or null",
    "architect": "string or null",
    "gc": "string or null"
  }
}

EXTRACTION RULES:

1. ASSEMBLIES: Extract every distinct roof assembly/system described. Use standardized system IDs: tpo | pvc | epdm | sbs | app | bur | metal | spf | hydrotech. Extract the complete layer stack from deck up.

2. WARRANTY: Look for warranty sections — extract tier (10-yr, 15-yr, 20-yr, 25-yr, 30-yr), type (standard, NDL = No Dollar Limit), wind speed coverage, and any special requirements.

3. PERFORMANCE: Extract wind uplift ratings (FM 1-60, 1-90, 1-120, etc.), fire ratings (Class A/B/C), R-value requirements, energy code references (ASHRAE, IECC), climate zone.

4. MATERIALS: Extract every specified material. For EACH material return BOTH fields:
   - "productName": the ACTUAL manufacturer product name, short form. Examples: "Paradene 20TG", "Teranap 1M Sand", "Sure-Weld TPO 60mil", "Polyiso 2.5in", "Parapro 123". NEVER put a generic description here (no "SBS Modified Bitumen Base Ply", no "TPO Membrane").
   - "name": a slightly longer descriptive label, safe to show in a list. Usually the productName plus a short type hint ("Sure-Weld TPO 60mil Membrane").
   Also include:
   - "spec": ASTM standards and technical specs ("ASTM D6878, min 60 mil thickness")
   - "manufacturer": brand name ("Carlisle", "Siplast"). Use "as specified" only when the spec truly leaves it open.
   - "coverageRate": the unit-of-purchase coverage stated in the spec or product datasheet reference, formatted as "<number> <unit>/<purchaseUnit>". Examples: "100 SF/RL" (roll), "32 SF/BD" (board), "500 EA/BX" (box of fasteners), "1.5 GAL/100 SF" (liquid). Omit if not stated.
   Categories: membrane, insulation, fasteners, adhesive, sheet_metal, flashing, drainage, filter_fabric, pavers, lumber, accessories, miscellaneous.

5. TESTING: Extract all required testing (flood test, core cuts, pull tests, infrared scans, visual inspections).

6. LABOR: Extract labor type (open_shop, prevailing_wage, union), certified installer requirements, manufacturer training requirements.

7. GENERAL CONDITIONS: Extract bonding, insurance, permits, safety, and compliance items that affect pricing.

8. SCOPE: Extract key scope items and any noted exclusions or alternates.

9. PROJECT INFO: Extract from cover sheet, title block, or specification header if present.

Only include fields where data is found in the document. Omit fields with no data rather than guessing. If a field is unclear, omit it.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } } as any,
                { type: "text", text: "Extract a complete specification summary from this roofing specification document. Return only the JSON object." },
              ],
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[extract-specification-parse-error]", {
        rawResponse: cleaned?.substring(0, 500),
        parseError: parseErr?.message,
        userId,
      });
      return NextResponse.json(
        { error: "Could not extract specification data from this PDF" },
        { status: 422 },
      );
    }

    const SpecResultSchema = z.object({
      specSections: z.array(z.object({ csiNumber: z.string(), title: z.string() }).passthrough()).optional().default([]),
      assemblies: z.array(z.object({ label: z.string(), system: z.string() }).passthrough()).optional().default([]),
      warranty: z.object({ tier: z.string().optional(), years: z.number().optional() }).passthrough().optional(),
      materials: z.array(z.object({ category: z.string(), productName: z.string() }).passthrough()).optional().default([]),
      generalConditions: z.array(z.string()).optional().default([]),
      laborRequirements: z.object({}).passthrough().optional(),
      submittals: z.array(z.string()).optional().default([]),
      specialInspections: z.array(z.string()).optional().default([]),
    }).passthrough();
    const validated = SpecResultSchema.safeParse(data);
    if (!validated.success) {
      console.error("[ai-shape-error]", { endpoint: "extract-specification", issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }
    if (Object.keys(validated.data).length === 0) {
      return NextResponse.json({ error: "AI returned an empty specification — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("extract-specification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
