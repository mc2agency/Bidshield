import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";
import { classifyLayersV2 } from "@/lib/bidshield/archetype-scoring";
import { archetypeIdToLegacy } from "@/lib/bidshield/archetype-compat";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  return b64.startsWith("JVBE");
}

function getConvex(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
  return new ConvexHttpClient(url);
}

// ─── V2 AI Prompt ─────────────────────────────────────────────────────────────

const V2_SYSTEM_PROMPT = `You are a commercial roofing estimating assistant.
Extract ALL roof, wall, plaza, and cladding assemblies from this drawing sheet.

Return ONLY valid JSON with no markdown:
{
  "assemblies": [
    {
      "drawingAssemblyId": "ROOF 01",
      "displayName": "IRMA Plaza Deck",
      "sourceSheet": "A-401",
      "layers": [
        "Structural Concrete Deck",
        "Waterproofing Membrane",
        "Drainage Mat",
        "2\" XPS Insulation",
        "Filter Fabric",
        "River Ballast"
      ],
      "surface": "pavers_ballast",
      "area": 4500
    }
  ],
  "deckType": "concrete",
  "projectName": null,
  "location": null,
  "drawingDate": null,
  "drawingRevision": null
}

surface values: exposed | pavers_pedestals | pavers_ballast | green_roof | walkpads | traffic_coating | concrete_pavement | panel

SURFACE RULES:
- surface = concrete_pavement: top finish is cast-in-place concrete slab, concrete pavement, CIP concrete, concrete paving, or plaza pavement
- surface = panel: top finish is aluminum panel, cladding panel, curtain wall panel, or similar finish panel
- surface = pavers_pedestals: top finish is concrete pavers on pedestal supports
- surface = pavers_ballast: top finish is pavers on gravel or ballast
- surface = green_roof: top finish is vegetation, growing media, sedum

LAYER RULES:
- layers: list EVERY labeled component from bottom (deck/substrate) to top (finish), in order
- Include ALL layers explicitly labeled on the drawing — deck, insulation, membrane, drainage mat, filter fabric, protection board, pavers, ballast, concrete pavement, etc.
- drawingAssemblyId: the exact label from the drawing (ROOF 01, ROOF 02, RT-01, etc.)
- displayName: descriptive name from schedule if shown (IRMA PLAZA DECK, TERRACE ROOF, etc.)
- area: SF if shown in schedule, otherwise omit

EXTRACTION COVERAGE — CRITICAL:
- Process the ENTIRE drawing page from top-left to bottom-right.
- Start from ROOF 01 (or the first labeled assembly visible on the page).
- Do NOT skip any assembly. Do NOT start from the middle of the drawing.
- If the drawing contains ROOF 01, ROOF 02, ROOF 03, ROOF 04, ROOF 05, ROOF 06, return ALL SIX.
- Every section detail or roof type label on the page must become an assembly entry.
- Up to 20 assemblies per sheet.`;

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const V2AssemblySchema = z.object({
  drawingAssemblyId: z.string().default(""),
  displayName: z.string().nullable().optional(),
  sourceSheet: z.string().nullable().optional(),
  layers: z.array(z.string()).default([]),
  surface: z.string().nullable().optional(),
  area: z.number().nullable().optional(),
});

const V2ResultSchema = z.object({
  assemblies: z.array(V2AssemblySchema).default([]),
  deckType: z.string().nullable().optional(),
  projectName: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  drawingDate: z.string().nullable().optional(),
  drawingRevision: z.string().nullable().optional(),
});

type V2Assembly = z.infer<typeof V2AssemblySchema>;

// ─── Label post-processing ────────────────────────────────────────────────────
//
// Deterministic fallback: scan raw AI response text for drawing labels that
// match common patterns (ROOF 01–ROOF 20, RT-01–RT-20, etc.). If any label
// is found in the raw text but MISSING from the parsed JSON assemblies,
// create a placeholder item with needsReview=true.
// This prevents silent data loss when the AI truncates its own output.

const DRAWING_LABEL_PATTERN = /\b((?:ROOF|RT|ROOF TYPE|R)[-\s]?0*([1-9][0-9]?))\b/gi;

function extractLabelsFromText(rawText: string): Set<string> {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(DRAWING_LABEL_PATTERN.source, "gi");
  while ((match = re.exec(rawText)) !== null) {
    // Normalize all separator variants to a single space:
    //   "ROOF01"  → "ROOF 01"
    //   "ROOF-01" → "ROOF 01"
    //   "ROOF 01" → "ROOF 01"
    //   "RT01"    → "RT 01"
    const raw = match[0];
    // Insert space between trailing alpha chars and leading digits if absent
    const spaced = raw.replace(/([A-Za-z])(\d)/, "$1 $2").replace(/[-\s]+/, " ");
    const normalised = spaced
      .replace(/0*(\d+)$/, (_, n) => String(n).padStart(2, "0"))
      .toUpperCase()
      .trim();
    found.add(normalised);
  }
  return found;
}

function buildPlaceholderAssembly(label: string): V2Assembly {
  return {
    drawingAssemblyId: label,
    displayName: undefined,
    sourceSheet: undefined,
    layers: [],
    surface: null,
    area: null,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

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
    const body = await req.json();
    const { pdfBase64, projectId, fileName } = body as {
      pdfBase64?: string;
      projectId?: string;
      fileName?: string;
    };

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }
    if (pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (!validatePdfBase64(pdfBase64)) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
    }
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // ── 1. Call Claude with V2 prompt ────────────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let message: Anthropic.Message;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: V2_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
                } as any,
                { type: "text", text: "Extract ALL roof assemblies from this drawing. Return every labeled assembly including ROOF 01, ROOF 02, etc. Do not skip any." },
              ],
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timeout);
    }

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = rawText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    // ── 2. Parse + validate AI response ──────────────────────────────────────
    let rawData: unknown;
    try {
      rawData = JSON.parse(cleaned);
      console.log("[extract-assemblies-v2:parse-ok]", {
        assemblyCount: (rawData as any)?.assemblies?.length ?? 0,
        userId,
      });
    } catch (parseErr: unknown) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.error("[extract-assemblies-v2:parse-error]", {
        rawResponse: cleaned?.substring(0, 500),
        parseError: msg,
        userId,
      });
      return NextResponse.json(
        { error: "Could not extract assemblies from this PDF" },
        { status: 422 },
      );
    }

    const normalised = Array.isArray(rawData) ? { assemblies: rawData } : rawData;
    const validated = V2ResultSchema.safeParse(normalised);
    if (!validated.success) {
      console.error("[extract-assemblies-v2:shape-error]", {
        issues: validated.error.issues,
      });
      return NextResponse.json(
        { error: "AI returned an unexpected response shape — please try again." },
        { status: 422 },
      );
    }

    const { deckType, projectName, location, drawingDate, drawingRevision } =
      validated.data;
    let { assemblies } = validated.data;

    // ── 3. Post-processing: label scan for missed assemblies ──────────────────
    //
    // Scan the raw AI response text for drawing labels. If a label appears in
    // the raw text but is missing from the JSON output (AI silently truncated),
    // create a placeholder item with needsReview=true.
    const labelsInResponse = extractLabelsFromText(rawText);
    const labelsInJson = new Set(
      assemblies
        .map((a) => a.drawingAssemblyId?.toUpperCase().trim())
        .filter(Boolean),
    );

    const missingLabels: string[] = [];
    for (const label of labelsInResponse) {
      if (!labelsInJson.has(label)) {
        missingLabels.push(label);
      }
    }

    if (missingLabels.length > 0) {
      console.warn("[extract-assemblies-v2:missing-labels]", {
        found: Array.from(labelsInResponse),
        inJson: Array.from(labelsInJson),
        missing: missingLabels,
        userId,
      });
      // Append placeholder items — sorted so ROOF 01 comes first
      const placeholders = missingLabels
        .sort()
        .map(buildPlaceholderAssembly);
      assemblies = [...assemblies, ...placeholders];
    }

    // ── 4. Classify each assembly via classifyLayersV2 ────────────────────────
    const classifiedAssemblies = assemblies.map((asm: V2Assembly) => {
      const classification = classifyLayersV2(
        asm.layers,
        asm.surface ?? null,
        asm.drawingAssemblyId ?? null,
      );
      return { asm, classification };
    });

    console.log("[extract-assemblies-v2:classified]", {
      count: classifiedAssemblies.length,
      archetypes: classifiedAssemblies.map((c) => ({
        label: c.asm.drawingAssemblyId,
        archetype: c.classification.archetypeId,
        confidence: c.classification.confidence.toFixed(2),
        needsReview: c.classification.needsReview,
      })),
      userId,
    });

    // ── 5. Persist to Convex ──────────────────────────────────────────────────
    const convex = getConvex();

    // 5a. Create the extraction run
    // @ts-ignore — extractionV2 not yet in generated api.d.ts
    const { runId } = await convex.mutation(
      anyApi["bidshield/extractionV2"].createRun,
      {
        projectId: projectId as any,
        userId,
        sourceFileName: fileName ?? "upload.pdf",
      },
    );

    // 5b. Create items for each classified assembly
    const items: Array<{
      itemId: string;
      drawingAssemblyId: string;
      displayName: string | null | undefined;
      sourceSheet: string | null | undefined;
      layers: string[];
      archetypeId: string;
      archetypeVersion: number;
      confidence: number;
      needsReview: boolean;
      area: number | null | undefined;
      isPlaceholder: boolean;
    }> = [];

    for (const { asm, classification } of classifiedAssemblies) {
      const isPlaceholder = asm.layers.length === 0 && classification.needsReview;
      // Derive a legacy systemId so the legacy RoofAssemblyCard can render
      // with a fallback config if this item is ever promoted to a project preset.
      const legacySystemId = archetypeIdToLegacy(classification.archetypeId);

      // @ts-ignore — extractionV2 not yet in generated api.d.ts
      const { itemId } = await convex.mutation(
        anyApi["bidshield/extractionV2"].createItem,
        {
          runId: runId as any,
          projectId: projectId as any,
          userId,
          drawingAssemblyId: asm.drawingAssemblyId,
          displayName: asm.displayName ?? undefined,
          sourceSheet: asm.sourceSheet ?? undefined,
          originalExtractedText: asm.layers,
          extractedLayers: asm.layers,
          normalizedLayerTokens: classification.audit.normalizedLayerTokens,
          archetypeId: classification.archetypeId,
          archetypeVersion: classification.archetypeVersion,
          confidence: classification.confidence,
          needsReview: classification.needsReview,
          classificationAudit: classification.audit,
          sectionValues: {},
          requiredSectionsSnapshot: classification.requiredSectionsSnapshot,
          optionalSectionsSnapshot: classification.optionalSectionsSnapshot,
          hiddenSectionsSnapshot: classification.hiddenSectionsSnapshot,
          defaultLayerOrderSnapshot: classification.defaultLayerOrderSnapshot,
          legacySystemId: legacySystemId ?? undefined,
        },
      );

      items.push({
        itemId: itemId as string,
        drawingAssemblyId: asm.drawingAssemblyId,
        displayName: asm.displayName,
        sourceSheet: asm.sourceSheet,
        layers: asm.layers,
        archetypeId: classification.archetypeId,
        archetypeVersion: classification.archetypeVersion,
        confidence: classification.confidence,
        needsReview: classification.needsReview,
        area: asm.area,
        isPlaceholder,
      });
    }

    // 5c. Complete the run
    const needsReviewCount = classifiedAssemblies.filter(
      (c) => c.classification.needsReview,
    ).length;

    // @ts-ignore — extractionV2 not yet in generated api.d.ts
    await convex.mutation(anyApi["bidshield/extractionV2"].completeRun, {
      runId: runId as any,
      extractedCount: items.length,
      needsReviewCount,
    });

    // ── 6. Return result ──────────────────────────────────────────────────────
    return NextResponse.json({
      runId,
      items,
      deckType: deckType ?? null,
      projectName: projectName ?? null,
      location: location ?? null,
      drawingDate: drawingDate ?? null,
      drawingRevision: drawingRevision ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[extract-assemblies-v2:error]", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
