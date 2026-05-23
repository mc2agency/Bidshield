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

    const systemPrompt = `You are a commercial roofing estimating assistant. Analyze this roof plan or spec page and extract all roof assemblies.

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "assemblies": [ ... ],
  "deckType": "steel" | "concrete" | "wood" | "lightweight" | "gypsum" | "tectum" | null,
  "projectName": "string or null if not found",
  "location": "string or null if not found",
  "drawingDate": "string or null — date shown on drawing title block (YYYY-MM-DD if parseable, otherwise as-is)",
  "drawingRevision": "string or null — revision label from title block (e.g. '95% CD', 'Rev 3', '100% DD')"
}

Each assembly object must use ONLY these exact values:

system: 'tpo' | 'pvc' | 'epdm' | 'sbs' | 'app' | 'bur' | 'metal' | 'spf' | 'lam' | 'hydrotech'

Classify each assembly independently based on its OWN layer stack and drawing label — do NOT assume all assemblies use the same system.

System selection guide:
- 'tpo': TPO membrane (thermoplastic polyolefin), typically white/gray single-ply
- 'pvc': PVC membrane, typically white single-ply
- 'epdm': EPDM rubber membrane, typically black single-ply
- 'sbs': SBS modified bitumen — sheet membrane, torch-applied or cold-applied, with polyiso or other insulation BELOW the membrane (conventional assembly). Labels like "Sheet Membrane Roofing System", "Modified Bitumen", "SBS".
- 'app': APP modified bitumen — similar to SBS but torch-applied
- 'bur': Built-Up Roofing — multiple plies of felt/bitumen
- 'metal': Standing seam or metal panel roof
- 'spf': Spray polyurethane foam
- 'lam': Liquid Applied Membrane — Use for CONVENTIONAL liquid-applied assemblies (insulation BELOW membrane) OR for IRMA/inverted assemblies. Classification into lam vs lam_irma is determined post-extraction by drainageMat and filterFabric flags below.
- 'hydrotech': Use ONLY when drawing or spec explicitly names Hydrotech as the manufacturer.

═══════════════════════════════════════════════════════════════
CRITICAL: CONVENTIONAL vs IRMA CLASSIFICATION
═══════════════════════════════════════════════════════════════

The ONLY reliable signals for IRMA/PMR are:
  1. drainageMat is explicitly labeled or leader-lined in the drawing
  2. filterFabric is explicitly labeled or leader-lined in the drawing
  3. The OCR text explicitly contains: IRMA, PMR, "inverted roof", or "protected membrane"

DO NOT infer IRMA from membrane type alone.
DO NOT invent drainageMat or filterFabric layers that are not explicitly visible.

CONVENTIONAL LAM (lam — drainageMat: false, filterFabric: false):
  Stack: deck → insulation → membrane → finish/cladding
  Examples:
    - Concrete Deck → DensGlass → 7" Rigid Insulation → Cementitious Board → Waterproofing Membrane → Aluminum Panel
    - Built-up rigid insulation roof with liquid-applied waterproofing on top
    - Aluminum panel cladding systems with waterproofing below cladding
  Rules: drainageMat=false, filterFabric=false when none are labeled

IRMA / PMR (lam — drainageMat: true and/or filterFabric: true):
  Stack: deck → membrane → drainage → insulation → filter fabric → overburden
  Examples:
    - Concrete Deck → Waterproofing Membrane → Drainage Mat → XPS Insulation → Filter Fabric → Gravel → Concrete Pavement
    - Plaza deck with paver ballast
    - Green roof system
  Rules: Only set drainageMat=true or filterFabric=true when explicitly labeled

═══════════════════════════════════════════════════════════════
EXAMPLE A — Roof 06 (CONVENTIONAL lam — NOT IRMA)
═══════════════════════════════════════════════════════════════
Drawing shows: Concrete Deck → DensGlass → 7" Rigid Insulation → Cementitious Board → Waterproofing Membrane → Aluminum Panel
Correct output:
{
  "system": "lam",
  "drainageMat": false,
  "filterFabric": false,
  "insulation": "rigid",
  "thickness": "7",
  "rValue": 35
}
Why: insulation is BELOW the membrane, no drainage mat labeled, no filter fabric labeled.

═══════════════════════════════════════════════════════════════
EXAMPLE B — Roof 05 (IRMA / PMR)
═══════════════════════════════════════════════════════════════
Drawing shows: Concrete Deck → Waterproofing Membrane → Drainage Mat → Rigid Insulation → Filter Fabric → Gravel → Concrete Pavement
Correct output:
{
  "system": "lam",
  "drainageMat": true,
  "filterFabric": true,
  "insulation": "xps",
  "thickness": null
}
Why: drainage mat and filter fabric are explicitly labeled, insulation is above membrane.

═══════════════════════════════════════════════════════════════
INSULATION THICKNESS EXTRACTION RULES
═══════════════════════════════════════════════════════════════
ONLY use dimensions directly associated with insulation layers.

NEVER use dimensions from:
  - Aluminum panels or cladding
  - Cementitious boards
  - Cover boards or substrate boards
  - DensGlass or gypsum sheathing
  - Finish layers or protective coatings

If thickness is ambiguous or dimension is not clearly tied to insulation:
  - Do NOT guess
  - Set thickness to null
  - This is correct behavior — wrong data is worse than missing data

thickness field: total insulation thickness in inches as a number string — read ONLY from insulation layer annotations (e.g. "7", "3.5", "4"). For multiple insulation layers add them. Set to null if not shown or ambiguous.

rValue: R-value as a number if explicitly stated for the insulation layer (e.g. "R-35" → 35, "R-39.2" → 39.2). Do NOT calculate — only extract if the drawing states it for the insulation. Set to null if not shown.

insulation: 'polyiso' | 'xps' | 'eps' | 'mineral_wool' | 'rigid' | 'vacuum' | 'none'
Use 'rigid' when the drawing says "rigid insulation" without specifying XPS, polyiso, or EPS.
Use 'xps' only when XPS is explicitly named.

═══════════════════════════════════════════════════════════════

drainageMat: true if drainage mat is EXPLICITLY labeled or leader-lined in the drawing. false otherwise. NEVER infer.
filterFabric: true if filter fabric is EXPLICITLY labeled or leader-lined in the drawing. false otherwise. NEVER infer.

surface: 'exposed' | 'pavers_pedestals' | 'pavers_ballast' | 'green_roof' | 'walkpads' | 'traffic_coating'

label: use label from drawing (RT-1, RT-2, RT-01, RT-02) if shown, otherwise RT-01, RT-02, etc. Max 10 assemblies.

area: number in SF if a roof type takeoff schedule, region area, or area table is present. Include sub-areas (e.g. RT-01 and RT-01 N) as separate entries. Omit if no area data found.

uValue: thermal U-value if shown in the schedule. Omit if not found.

name: descriptive name from the schedule (e.g. "TERRACE PAVERS", "BALLAST PAVERS", "GREEN ROOF", "BULKHEAD ROOF"). Omit if not found.

deckType: Look for deck type info in detail drawings — concrete slab, steel deck, wood, etc. Use the standardized values above. Set to null if not identifiable.

projectName: If a title block shows a building/project name, extract it. Set to null if not found.

location: If a title block shows an address or location, extract it. Set to null if not found.

drawingDate: If a title block, stamp, or revision block shows a drawing date or issue date, extract it. Format as YYYY-MM-DD if the date is parseable, otherwise return as-is (e.g. "03/15/2026"). Set to null if not found.

drawingRevision: If a title block or revision block shows a revision label or phase designation, extract it (e.g. "95% CD", "100% DD", "Rev 3", "Issued for Construction"). Set to null if not found.

IMPORTANT: If the drawing contains a roof type takeoff schedule with area data, extract EVERY row including sub-areas (e.g. RT-01, RT-01 N as separate entries). Preserve the exact labels from the schedule.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } } as any,
                { type: "text", text: "Extract all roof assemblies from this drawing." },
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
      // Log assembly count to debug skipped assemblies
      console.log("[extract-assemblies-success]", {
        assemblyCount: data?.assemblies?.length || 0,
        labels: data?.assemblies?.map((a: any) => a.label) || [],
        userId,
      });
    } catch (parseErr: any) {
      console.error("[extract-assemblies-parse-error]", {
        rawResponse: cleaned?.substring(0, 500),
        parseError: parseErr?.message,
        userId,
      });
      return NextResponse.json(
        { error: "Could not extract assemblies from this PDF" },
        { status: 422 },
      );
    }

    const AssemblyItemSchema = z.object({
      label: z.string().default(""),
      system: z.string().default("tpo"),
      insulation: z.string().nullable().optional(),
      thickness: z.string().nullable().optional(),
      rValue: z.number().nullable().optional(),
      surface: z.string().nullable().optional(),
      area: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      deckType: z.string().nullable().optional(),
      // IRMA classification signals — only true when explicitly labeled in drawing
      drainageMat: z.boolean().nullable().optional(),
      filterFabric: z.boolean().nullable().optional(),
    });
    const AssembliesResultSchema = z.object({
      assemblies: z.array(AssemblyItemSchema).default([]),
      deckType: z.string().nullable().optional(),
      projectName: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      drawingDate: z.string().nullable().optional(),
      drawingRevision: z.string().nullable().optional(),
    });

    // Normalise array format to object format before validating
    const normalised = Array.isArray(data) ? { assemblies: data } : data;
    const validated = AssembliesResultSchema.safeParse(normalised);
    if (!validated.success) {
      console.error("[ai-shape-error]", { endpoint: "extract-assemblies", issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("extract-assemblies error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
