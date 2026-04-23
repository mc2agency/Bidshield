import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

export const maxDuration = 120;

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
  },
  "phase9Flags": {
    "checklistItems": [
      { "id": "spec_submittal_requirements", "label": "Submittal Requirements", "status": "flagged", "note": "..." },
      { "id": "spec_mock_up", "label": "Mock-Up Required", "status": "ok", "note": "" }
    ],
    "complianceWarnings": [
      { "type": "special_inspection", "message": "...", "severity": "critical" }
    ],
    "presubmissionChecks": ["..."]
  }
}

EXTRACTION RULES:

1. ASSEMBLIES: Extract every distinct roof assembly/system described. Use standardized system IDs: tpo | pvc | epdm | sbs | app | bur | metal | spf | hydrotech. Extract the complete layer stack from deck up.

2. WARRANTY: Look for warranty sections — extract tier (10-yr, 15-yr, 20-yr, 25-yr, 30-yr), type (standard, NDL = No Dollar Limit), wind speed coverage, and any special requirements. Populate "years" ONLY when a specific number of years is stated in the document (e.g. "20-year NDL warranty"). If the type is stated but no specific year count is given, return "years": null and still populate "type". Never guess a year value. If the tier field is populated, ensure it is a complete human-readable string like "20-yr NDL" — never include the literal token "undefined".

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

10. PHASE 9 FLAGS — SPECIFICATION REVIEW CHECKLIST: Populate the "phase9Flags" object based on what you actually find in this document. For each checklist item, evaluate the specification and set the correct status and note:

Checklist item IDs and what to look for:
- "spec_submittal_requirements": Are submittal requirements clearly listed in the spec? (e.g., product data, shop drawings, installer credentials)
- "spec_mock_up": Is a mock-up section required? (look for mock-up, sample installation, field sample requirements)
- "spec_special_inspection": Are special inspections required? (look for IBC 1705, third-party inspector, special inspection program)
- "spec_warranty_tier": Is warranty tier and type clearly specified? (look for NDL, dollar limit, years, wind speed)
- "spec_approved_manufacturers": Are approved manufacturers explicitly listed? (look for "approved equal", "basis of design", manufacturer lists)
- "spec_energy_code": Are energy code or R-value requirements specified? (look for ASHRAE, IECC, minimum R-value)
- "spec_wind_uplift": Are wind uplift or FM rating requirements specified? (look for FM 1-60/1-90/1-120, ASCE 7, uplift pressure)
- "spec_testing": Are testing requirements listed? (look for flood test, pull test, core cuts, IR scan, NRCA test protocols)
- "spec_prevailing_wage": Are prevailing wage or certified payroll requirements noted? (look for Davis-Bacon, state prevailing wage, certified payroll)
- "spec_performance_bond": Is a performance bond required? (look for performance bond, payment bond, surety bond percentage)
- "spec_certified_installer": Is a certified installer required? (look for manufacturer certification, factory-trained applicator, approved contractor)

Status assignment rules:
- "flagged" = the requirement EXISTS in the spec and the estimator MUST take action or include a cost (e.g., special inspection is required, mock-up is required, prevailing wage applies, performance bond is required, certified installer is mandatory)
- "attention" = the item exists but with nuances or constraints the estimator should be aware of (e.g., warranty requires certified installer AND single-source, approved manufacturers listed but equals are allowed with approval, energy code referenced but R-value not explicit)
- "ok" = checked and not applicable, or a standard/routine requirement with no special burden (e.g., no mock-up required, no special inspection section found, open-shop labor, no bond required)

For the "note" field: write a concise, estimator-facing note explaining what was found (or not found). If "ok", the note can be blank or brief.

Compliance warnings — include ONLY those that apply based on the actual document:
- If special inspections are required → { "type": "special_inspection", "message": "...", "severity": "critical" }
- If prevailing wage / certified payroll is required → { "type": "prevailing_wage", "message": "...", "severity": "critical" }
- If only one manufacturer is approved (single-source) → { "type": "single_source", "message": "...", "severity": "warning" }
- If a performance bond is required → { "type": "performance_bond", "message": "Include bond premium in bid — [X]% bond required", "severity": "warning" }
- If a mock-up is required before production → { "type": "mock_up", "message": "Mock-up required before production roofing — schedule and price separately", "severity": "warning" }
- Add any other compliance or cost-risk items found in the spec as additional warnings with appropriate severity ("critical" | "warning" | "info").

Pre-submission checks — generate a list of actionable items the estimator should verify before submitting the bid, based on the actual requirements found. Be specific to the document (reference actual manufacturers, bond percentages, R-values, etc. found in the spec).

Only include fields where data is found in the document. Omit fields with no data rather than guessing. If a field is unclear, omit it.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
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
    } catch (apiErr: any) {
      clearTimeout(timeout);
      if (apiErr?.name === "AbortError" || apiErr?.message?.includes("abort")) {
        return NextResponse.json({ error: "Analysis timed out — the PDF may be too large. Try a smaller file or just the roofing division." }, { status: 504 });
      }
      throw apiErr;
    } finally {
      clearTimeout(timeout);
    }

    const stopReason = message!.stop_reason;
    const text = message!.content[0].type === "text" ? message!.content[0].text : "";

    if (stopReason === "max_tokens") {
      console.error("[extract-specification-truncated]", { userId, textLength: text.length });
      return NextResponse.json(
        { error: "The specification is too long to fully analyze. Try uploading just Division 07 (roofing) rather than the full project spec." },
        { status: 422 },
      );
    }

    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[extract-specification-parse-error]", {
        stopReason,
        rawResponse: cleaned?.substring(0, 500),
        parseError: parseErr?.message,
        userId,
      });
      return NextResponse.json(
        { error: "Could not extract specification data from this PDF" },
        { status: 422 },
      );
    }

    const Phase9ChecklistItemSchema = z.object({
      id: z.string(),
      label: z.string(),
      status: z.enum(["flagged", "ok", "attention"]),
      note: z.string(),
    }).passthrough();

    const Phase9ComplianceWarningSchema = z.object({
      type: z.string(),
      message: z.string(),
      severity: z.enum(["critical", "warning", "info"]),
    }).passthrough();

    const Phase9FlagsSchema = z.object({
      checklistItems: z.array(Phase9ChecklistItemSchema).optional().default([]),
      complianceWarnings: z.array(Phase9ComplianceWarningSchema).optional().default([]),
      presubmissionChecks: z.array(z.string()).optional().default([]),
    }).passthrough();

    const SpecResultSchema = z.object({
      specSections: z.array(z.object({ csiNumber: z.string(), title: z.string() }).passthrough()).optional().default([]),
      assemblies: z.array(z.object({ label: z.string(), system: z.string() }).passthrough()).optional().default([]),
      warranty: z.object({ tier: z.string().optional(), years: z.number().optional() }).passthrough().optional(),
      materials: z.array(z.object({ category: z.string(), productName: z.string() }).passthrough()).optional().default([]),
      generalConditions: z.array(z.string()).optional().default([]),
      laborRequirements: z.object({}).passthrough().optional(),
      submittals: z.array(z.string()).optional().default([]),
      specialInspections: z.array(z.string()).optional().default([]),
      phase9Flags: Phase9FlagsSchema.optional(),
    }).passthrough();
    const validated = SpecResultSchema.safeParse(data);
    if (!validated.success) {
      // Log the issue but don't fail — schema is permissive, return raw data so the UI still works
      console.error("[ai-shape-error]", { endpoint: "extract-specification", issues: validated.error.issues });
    }
    const result = validated.success ? validated.data : data;
    if (!result || Object.keys(result).length === 0) {
      return NextResponse.json({ error: "AI returned an empty specification — please try again." }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("extract-specification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
