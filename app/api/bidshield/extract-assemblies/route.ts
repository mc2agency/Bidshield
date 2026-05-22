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
- 'lam': Liquid Applied Membrane — IRMA/PRMA/inverted configuration where insulation is ABOVE the membrane. Labels like "Liquid Membrane Cold-Applied", "IRMA", "Inverted Roof Membrane Assembly", "Protected Roof Membrane". The insulation (XPS) sits ON TOP of the waterproofing membrane.
- 'hydrotech': Use ONLY when drawing or spec explicitly names Hydrotech as the manufacturer.

Key distinction — conventional vs inverted:
- CONVENTIONAL (sbs/tpo/pvc/epdm/bur): insulation is BELOW the membrane, membrane is on top
- INVERTED/IRMA (lam): membrane is on the deck, insulation (usually XPS) is ABOVE the membrane

insulation: 'polyiso' | 'xps' | 'eps' | 'mineral_wool' | 'rigid' | 'vacuum' | 'none'

Insulation selection guide:
- 'polyiso': explicitly named polyisocyanurate, polyiso, or ISO board
- 'xps': explicitly named XPS, extruded polystyrene
- 'eps': explicitly named EPS, expanded polystyrene
- 'mineral_wool': mineral wool, rock wool, stone wool
- 'rigid': drawing says "Rigid Insulation" or "Rigid Board" without specifying the product type
- 'vacuum': vacuum insulated panel
- 'none': no insulation present

thickness: total PRIMARY insulation thickness in inches as a number string — read directly from the drawing (e.g. "7", "3.5", "4", "2"). For multiple layers of the SAME insulation add them. Omit if not shown.

coverBoard: string — any non-membrane layer that is NOT the primary insulation. This includes substrate boards, cover boards, deck boards, sheathing, and concrete/cementitious toppings. Combine all such layers into one string, including thickness if shown. Examples: '5/8" DensGlass Sheathing', '3" Cementitious Board', '1/2" DensDeck', '5/8" Gypsum Board + 3" Concrete Topping'. Omit (do not include the field) if no such layers are present.

rValue: insulation R-value as a number if explicitly stated in the drawing (e.g. "R-39.2" → 39.2, "R-33 Min." → 33). Do NOT calculate — only extract if the drawing states it. Omit if not shown.

surface: 'exposed' | 'pavers_pedestals' | 'pavers_ballast' | 'green_roof' | 'walkpads' | 'traffic_coating' | 'aluminum_panel' | 'concrete_topping' | 'wood_tile'

Surface selection guide:
- 'exposed': membrane is the top visible surface
- 'pavers_pedestals': pavers set on pedestal supports
- 'pavers_ballast': loose-laid ballast pavers
- 'green_roof': vegetated/planted roof trays
- 'walkpads': walk pad protection strips
- 'traffic_coating': epoxy/urethane traffic deck coating
- 'aluminum_panel': aluminum or metal panel finish (e.g. "Aluminum Panel", "Metal Cladding")
- 'concrete_topping': concrete or cementitious topping slab as the finish surface
- 'wood_tile': wood tiles or wood decking on pedestals

attachmentMethod: 'mechanically_attached' | 'fully_adhered' | 'ballasted' | 'self_adhered' | 'hybrid' | 'unknown' — how the membrane is fastened. Look for words like "mechanically attached", "fully adhered", "ballasted", "self-adhered", "adhered", "hybrid". Use 'unknown' if not determinable from the drawing.

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
    let message: Awaited<ReturnType<typeof client.messages.create>>;
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
      attachmentMethod: z.string().nullable().optional(),
      area: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      coverBoard: z.string().nullable().optional(),
      deckType: z.string().nullable().optional(),
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
