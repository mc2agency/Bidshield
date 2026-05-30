import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";
import { normalizeAssemblySignals, classifyAssemblySystem } from "@/lib/bidshield/assembly-system-configs";
import {
  resolveAssemblyArchetype,
  formatArchetypeResolution,
} from "@/lib/bidshield/archetype-compat";

// AI PDF extraction is slow — give it the full Fluid Compute window.
export const maxDuration = 300;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  return b64.startsWith("JVBE");
}

// ─── Archetype enrichment ─────────────────────────────────────────────────────

/**
 * Replicates the same systemType resolution the wizard does client-side,
 * then appends archetype metadata to each assembly.
 *
 * Existing fields are NEVER modified — only new fields are added:
 *   archetypeId               — resolved archetype (e.g. "liquid_applied_irma")
 *   archetypeResolutionSource — "explicit" | "mapped" | "fallback"
 *   archetypeNeedsReview      — true when no direct mapping found
 *   archetypeFallbackReason   — human-readable explanation when fallback
 *   legacySystemType          — the final classified systemType used for mapping
 *   legacySystemId            — raw system from AI output (before IRMA classification)
 */
function enrichWithArchetypes(data: {
  assemblies: Array<{
    system?: string | null;
    surface?: string | null;
    drainageMat?: boolean | null;
    filterFabric?: boolean | null;
    layers?: string[] | null;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}) {
  const enrichedAssemblies = data.assemblies.map((assembly) => {
    const rawSystemId = (assembly.system as string | null | undefined) ?? "";

    // ── Concrete pavement override (must run BEFORE lam_irma resolution) ──────
    // If the top finish is concrete pavement, this is always concrete_pavement_roof
    // regardless of whether drainageMat/filterFabric are set.
    const surfaceField = (assembly.surface as string | null | undefined) ?? "";
    const layerText = Array.isArray(assembly.layers)
      ? assembly.layers.join(" ")
      : "";
    const isConcretePayement =
      surfaceField === "concrete_pavement" ||
      /concrete\s*pav/i.test(layerText);

    if (isConcretePayement) {
      console.log("[extract-assemblies:archetype] concrete_pavement_roof override", {
        label: assembly.label,
        rawSystem: rawSystemId,
        surface: surfaceField,
      });
      return {
        ...assembly,
        archetypeId: "concrete_pavement_roof" as const,
        archetypeResolutionSource: "mapped" as const,
        archetypeNeedsReview: false,
        legacySystemType: "lam_irma",
        legacySystemId: rawSystemId || undefined,
      };
    }

    // Mirror the wizard's IRMA resolution:
    // 1. Normalize signals (layer text can override missing AI booleans)
    const signals = normalizeAssemblySignals({
      drainageMat: assembly.drainageMat ?? null,
      filterFabric: assembly.filterFabric ?? null,
      layers: Array.isArray(assembly.layers) ? assembly.layers : [],
    });

    // 2. Resolve base: if AI said "lam" but SBS layers detected, base is "sbs"
    const effectiveBase =
      rawSystemId === "lam" && signals.effectiveSbsMembrane ? "sbs" : rawSystemId;

    // 3. Classify lam/sbs → lam_irma / sbs_irma / sbs_irma_green
    const classifiedSystemType =
      effectiveBase === "lam" || effectiveBase === "sbs"
        ? classifyAssemblySystem({
            baseSystem: effectiveBase,
            drainageMat: signals.effectiveDrainageMat,
            filterFabric: signals.effectiveFilterFabric,
            greenRoof: signals.effectiveGreenRoof,
          })
        : rawSystemId;

    // 4. Resolve archetype from the classified systemType
    const resolution = resolveAssemblyArchetype({ systemType: classifiedSystemType });

    // 5. Log for server-side audit trail
    console.log("[extract-assemblies:archetype]", formatArchetypeResolution(resolution), {
      label: assembly.label,
      rawSystem: rawSystemId,
      classifiedSystemType,
    });

    return {
      ...assembly,
      // ── New archetype fields (additive — do not replace existing) ──────────
      archetypeId: resolution.archetypeId,
      archetypeResolutionSource: resolution.source,
      archetypeNeedsReview: resolution.needsReview,
      ...(resolution.isFallback && {
        archetypeFallbackReason: resolution.debugNote,
      }),
      legacySystemType: classifiedSystemType,
      legacySystemId: rawSystemId || undefined,
    };
  });

  return {
    ...data,
    assemblies: enrichedAssemblies,
  };
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
  "gc": "string or null — general contractor name if shown on the drawing (e.g. 'Skanska USA Building', 'Turner Construction')",
  "drawingDate": "string or null — date shown on drawing title block (YYYY-MM-DD if parseable, otherwise as-is)",
  "drawingRevision": "string or null — revision label from title block (e.g. '95% CD', 'Rev 3', '100% DD')"
}

Each assembly object must use ONLY these exact values:

system: 'tpo' | 'pvc' | 'epdm' | 'sbs' | 'app' | 'bur' | 'metal' | 'spf' | 'lam' | 'hydrotech' | 'panel'

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
- 'panel': Use for wall/cladding/soffit assemblies with waterproofing below a panel finish. NOT a standard roof membrane system. Stack: deck/substrate → insulation → waterproofing membrane → cladding panel. Example: DensGlass → rigid insulation → cementitious board → waterproofing → aluminum panel.

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
  Stack: deck → insulation → membrane → exposed finish (NOT a cladding panel)
  Examples:
    - Built-up rigid insulation roof with liquid-applied waterproofing on top
    - Waterproofing membrane with traffic coating or topping (no drainage mat)
  Rules: drainageMat=false, filterFabric=false when none are labeled
  NOTE: If the assembly ends with an aluminum panel, cladding panel, or curtain wall panel, use system='panel' instead.

IRMA / PMR (lam — drainageMat: true and/or filterFabric: true):
  Stack: deck → membrane → drainage → insulation → filter fabric → overburden
  Examples:
    - Concrete Deck → Waterproofing Membrane → Drainage Mat → XPS Insulation → Filter Fabric → Gravel → Concrete Pavement
    - Plaza deck with paver ballast
    - Green roof system
  Rules: Only set drainageMat=true or filterFabric=true when explicitly labeled

═══════════════════════════════════════════════════════════════
EXAMPLE A — Roof 06 (PANEL cladding assembly — NOT IRMA)
═══════════════════════════════════════════════════════════════
Drawing shows: Concrete Deck → DensGlass → 7\" Rigid Insulation → Cementitious Board → Waterproofing Membrane → Aluminum Panel
Correct output:
{
  "system": "panel",
  "drainageMat": false,
  "filterFabric": false,
  "insulation": "rigid",
  "thickness": "7",
  "rValue": 35
}
Why: This is a cladding/wall panel assembly with waterproofing below aluminum panels. Use system='panel', NOT 'lam'.

═══════════════════════════════════════════════════════════════
EXAMPLE B — Roof 05 (IRMA / PMR with concrete pavement finish)
═══════════════════════════════════════════════════════════════
Drawing shows: Concrete Deck → Waterproofing Membrane → Drainage Mat → Rigid Insulation → Filter Fabric → Gravel → Concrete Pavement
Correct output:
{
  "system": "lam",
  "surface": "concrete_pavement",
  "drainageMat": true,
  "filterFabric": true,
  "insulation": "xps",
  "thickness": null
}
Why: drainage mat and filter fabric are explicitly labeled, insulation is above membrane. The top finish is cast-in-place concrete pavement → surface='concrete_pavement'.

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

surface: 'exposed' | 'pavers_pedestals' | 'pavers_ballast' | 'green_roof' | 'walkpads' | 'traffic_coating' | 'concrete_pavement'

Use surface='concrete_pavement' when the top finish layer is a cast-in-place concrete slab, concrete paving, or concrete pavement.

label: use label from drawing (RT-1, RT-2, RT-01, RT-02) if shown, otherwise RT-01, RT-02, etc. Up to 20 assemblies.

area: number in SF if a roof type takeoff schedule, region area, or area table is present. Include sub-areas (e.g. RT-01 and RT-01 N) as separate entries. Omit if no area data found.

uValue: thermal U-value if shown in the schedule. Omit if not found.

name: descriptive name from the schedule (e.g. "TERRACE PAVERS", "BALLAST PAVERS", "GREEN ROOF", "BULKHEAD ROOF"). Omit if not found.

deckType: Look for deck type info in detail drawings — concrete slab, steel deck, wood, etc. Use the standardized values above. Set to null if not identifiable.

projectName: If a title block shows a building/project name, extract it. Set to null if not found.

location: If a title block shows an address or location, extract it. Set to null if not found.

gc: If a title block, cover sheet, or stamp shows a general contractor / construction manager name, extract it. Set to null if not found.

drawingDate: If a title block, stamp, or revision block shows a drawing date or issue date, extract it. Format as YYYY-MM-DD if the date is parseable, otherwise return as-is (e.g. "03/15/2026"). Set to null if not found.

drawingRevision: If a title block or revision block shows a revision label or phase designation, extract it (e.g. "95% CD", "100% DD", "Rev 3", "Issued for Construction"). Set to null if not found.

IMPORTANT: 
- If the drawing contains a roof type takeoff schedule with area data, extract EVERY row including sub-areas (e.g. RT-01, RT-01 N as separate entries). Preserve the exact labels from the schedule.
- If the drawing shows multiple assembly DETAILS (sectional drawings with callout labels like "ROOF 01", "ROOF 02", "ROOF 03"), extract EVERY detail as a separate assembly. Process the ENTIRE drawing from top to bottom. Start from ROOF 01 (or the first labeled assembly on the page). Do NOT skip any assembly. Do NOT start from the middle of the drawing. For example, if the drawing contains ROOF 01, ROOF 02, ROOF 03, ROOF 04, ROOF 05, and ROOF 06, you must return all six — starting with ROOF 01 and ending with ROOF 06.
- Extract ALL assemblies visible on the page, regardless of layout (schedule, details, or mixed). Do not stop early.`;

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
      gc: z.string().nullable().optional(),
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

    return NextResponse.json(enrichWithArchetypes(validated.data));
  } catch (err: any) {
    console.error("extract-assemblies error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
