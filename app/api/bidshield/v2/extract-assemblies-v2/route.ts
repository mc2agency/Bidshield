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
import { resolveFullLayerStack } from "@/lib/bidshield/assembly-layer-resolver";

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
  "allDrawingLabels": ["ROOF 01", "ROOF 02", "ROOF 03", "ROOF 04", "ROOF 05", "ROOF 06"],
  "legendTitles": {
    "ROOF 01": "PAVERS ON PEDESTAL IRMA ROOFING",
    "ROOF 02": "GREEN ROOF ON IRMA ROOFING"
  },
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

allDrawingLabels: REQUIRED. List EVERY drawing label found anywhere on this page —
  in legends, schedules, section callouts, detail bubbles, title blocks.
  Include ALL labels even if you cannot extract their full layer stack.
  Format: "ROOF 01", "ROOF 02", etc. (normalized, with space and zero-padded number).
  If the drawing shows "ROOF TYPE 01", normalize to "ROOF 01".
  If the drawing shows "RT-01", normalize to "RT 01".

legendTitles: Optional map of drawingAssemblyId → title from legend or schedule
  (e.g. "PAVERS ON PEDESTAL IRMA ROOFING"). Include if visible on the sheet.

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
- drawingAssemblyId: the exact label from the drawing (ROOF 01, ROOF 02, RT-01, etc.) — normalized with space
- displayName: descriptive name from schedule if shown (IRMA PLAZA DECK, TERRACE ROOF, etc.)
- area: SF if shown in schedule, otherwise omit

EXTRACTION COVERAGE — CRITICAL:
- Scan the ENTIRE drawing page from top-left to bottom-right.
- First, populate allDrawingLabels with EVERY label you can see anywhere on the page.
- Then extract layers for each assembly in allDrawingLabels.
- Do NOT skip any assembly. Do NOT start from the middle of the drawing.
- Every section detail or roof type label on the page must appear in allDrawingLabels.
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
  allDrawingLabels: z.array(z.string()).default([]),
  legendTitles: z.record(z.string(), z.string()).optional(),
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
// Deterministic label recovery uses TWO sources:
//
// SOURCE A: allDrawingLabels from the AI JSON response.
//   The prompt requires the AI to list every visible label before extracting
//   layers. This catches labels the AI would otherwise silently skip.
//
// SOURCE B: Regex scan of the raw AI response text.
//   Fallback in case allDrawingLabels is missing or incomplete. Scans the
//   full raw text (including any preamble) for ROOF 01, ROOF TYPE 01, etc.
//
// Both sets are merged. Any label not in the assemblies array becomes a
// placeholder with needsReview=true.
//
// This guarantees that if the drawing shows ROOF TYPE 01 through ROOF TYPE 06,
// all six appear in the extraction result even if the AI only fully extracts
// 4 of them.

// Matches: ROOF 01, ROOF01, ROOF-01, ROOF TYPE 01, ROOF TYPE01, RT-01, RT 01
const DRAWING_LABEL_PATTERN =
  /\b((?:ROOF\s*TYPE|ROOF|RT)[-\s]?0*([1-9][0-9]?))\b/gi;

/** Normalise a raw matched label string to canonical form: "ROOF 01", "RT 01" */
function normaliseLabelMatch(raw: string): string {
  // Strip "TYPE" from "ROOF TYPE 01" → "ROOF 01"
  let s = raw.replace(/ROOF\s*TYPE/i, "ROOF");
  // Insert space between letters and digits: "ROOF01" → "ROOF 01"
  s = s.replace(/([A-Za-z])(\d)/, "$1 $2");
  // Collapse multiple separators: "ROOF  01", "ROOF-01" → "ROOF 01"
  s = s.replace(/[-\s]+/, " ");
  // Zero-pad the trailing number to 2 digits: "ROOF 1" → "ROOF 01"
  s = s.replace(/(\d+)$/, (_, n) => String(parseInt(n, 10)).padStart(2, "0"));
  return s.toUpperCase().trim();
}

/** Scan raw text for drawing label patterns (SOURCE B fallback). */
export function extractLabelsFromText(rawText: string): Set<string> {
  const found = new Set<string>();
  const re = new RegExp(DRAWING_LABEL_PATTERN.source, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawText)) !== null) {
    found.add(normaliseLabelMatch(match[0]));
  }
  return found;
}

/** Normalise every label in the AI-returned allDrawingLabels array (SOURCE A). */
function normaliseAiLabelList(labels: string[]): Set<string> {
  const out = new Set<string>();
  for (const raw of labels) {
    if (!raw) continue;
    // Apply same normalisation used by regex scanner
    const normalised = normaliseLabelMatch(raw);
    if (normalised) out.add(normalised);
  }
  return out;
}

function buildPlaceholderAssembly(
  label: string,
  legendTitles?: Record<string, string>
): V2Assembly {
  const displayName = legendTitles?.[label] ?? undefined;
  return {
    drawingAssemblyId: label,
    displayName,
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
    // projectId is optional — when absent, skip Convex persistence and return
    // extracted items in-memory only. Used by wizard (project not yet created).
    const persistToConvex = !!projectId;

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
                {
                  type: "text",
                  text: "First, list ALL drawing labels visible anywhere on this page in allDrawingLabels. Then extract layers for each assembly. Do not skip any label.",
                },
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
        allDrawingLabelsCount: (rawData as any)?.allDrawingLabels?.length ?? 0,
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

    const { deckType, projectName, location, drawingDate, drawingRevision, legendTitles } =
      validated.data;
    let { assemblies } = validated.data;

    // ── 3. Deterministic label recovery ──────────────────────────────────────
    //
    // Merge SOURCE A (allDrawingLabels from AI JSON) and SOURCE B (regex scan
    // of raw AI response text) to build a complete expected label set.
    //
    // Any label not present in the assemblies array gets a placeholder item.

    // SOURCE A: AI-reported label list (most reliable — AI saw the full page)
    const labelsFromAiList = normaliseAiLabelList(validated.data.allDrawingLabels);

    // SOURCE B: Regex fallback scanning raw AI response preamble / echoes
    const labelsFromRegex = extractLabelsFromText(rawText);

    // Merge both sources
    const expectedLabels = new Set<string>([
      ...Array.from(labelsFromAiList),
      ...Array.from(labelsFromRegex),
    ]);

    // Labels already present in the extracted assemblies array
    const labelsInJson = new Set(
      assemblies
        .map((a) => normaliseLabelMatch(a.drawingAssemblyId))
        .filter(Boolean),
    );

    const missingLabels: string[] = [];
    for (const label of Array.from(expectedLabels)) {
      if (!labelsInJson.has(label)) {
        missingLabels.push(label);
      }
    }

    if (missingLabels.length > 0) {
      console.warn("[extract-assemblies-v2:missing-labels]", {
        sourceA: Array.from(labelsFromAiList),
        sourceB: Array.from(labelsFromRegex),
        inJson: Array.from(labelsInJson),
        missing: missingLabels,
        userId,
      });
      // Insert placeholders sorted before existing assemblies so ROOF 01 comes first
      const placeholders = missingLabels
        .sort()
        .map((label) => buildPlaceholderAssembly(label, legendTitles));
      assemblies = [...placeholders, ...assemblies];
    }

    // Sort all assemblies by drawingAssemblyId so ROOF 01 < ROOF 02 < ...
    assemblies.sort((a, b) =>
      (a.drawingAssemblyId ?? "").localeCompare(b.drawingAssemblyId ?? "", undefined, {
        numeric: true,
      })
    );

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

    // ── 5. Build items array (always) ─────────────────────────────────────────
    const items: Array<{
      itemId: string;
      drawingAssemblyId: string;
      displayName: string | null | undefined;
      sourceSheet: string | null | undefined;
      layers: string[];
      fullLayerStack: string[];
      baseStack: string[];
      modifierStack: string[];
      archetypeId: string;
      archetypeVersion: number;
      confidence: number;
      needsReview: boolean;
      area: number | null | undefined;
      isPlaceholder: boolean;
      sectionValues: Record<string, string | boolean | undefined>;
      requiredSectionsSnapshot: string[];
      optionalSectionsSnapshot: string[];
      hiddenSectionsSnapshot: string[];
      classificationAudit: any;
      normalizedLayerTokens: string[];
      defaultLayerOrderSnapshot: string[];
    }> = [];

    for (const { asm, classification } of classifiedAssemblies) {
      const isPlaceholder = asm.layers.length === 0 && classification.needsReview;

      // Resolve full layer stack: base IRMA stack + overburden modifier
      const resolved = resolveFullLayerStack(
        asm.layers,
        classification.archetypeId,
        asm.surface ?? null,
      );

      items.push({
        itemId: "", // populated below if persisting to Convex
        drawingAssemblyId: asm.drawingAssemblyId,
        displayName: asm.displayName,
        sourceSheet: asm.sourceSheet,
        layers: asm.layers,
        fullLayerStack: resolved.fullLayerStack,
        baseStack: resolved.baseStack,
        modifierStack: resolved.modifierStack,
        archetypeId: classification.archetypeId,
        archetypeVersion: classification.archetypeVersion,
        confidence: classification.confidence,
        needsReview: classification.needsReview,
        area: asm.area,
        isPlaceholder,
        sectionValues: resolved.sectionValues,
        requiredSectionsSnapshot: classification.requiredSectionsSnapshot,
        optionalSectionsSnapshot: classification.optionalSectionsSnapshot,
        hiddenSectionsSnapshot: classification.hiddenSectionsSnapshot,
        classificationAudit: classification.audit,
        normalizedLayerTokens: classification.audit.normalizedLayerTokens,
        defaultLayerOrderSnapshot: classification.defaultLayerOrderSnapshot,
      });
    }

    // ── 5b. Persist to Convex only when projectId is present ──────────────────
    let runId: string | null = null;
    if (persistToConvex) {
      const convex = getConvex();

      // Create the extraction run
      // @ts-ignore — extractionV2 not yet in generated api.d.ts
      const run = await convex.mutation(
        anyApi["bidshield/extractionV2"].createRun,
        {
          projectId: projectId as any,
          userId,
          sourceFileName: fileName ?? "upload.pdf",
        },
      );
      runId = run.runId as string;

      // Create items in Convex and backfill itemIds
      for (let i = 0; i < classifiedAssemblies.length; i++) {
        const { asm, classification } = classifiedAssemblies[i];
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
        items[i].itemId = itemId as string;
      }

      // Complete the run
      const needsReviewCount = classifiedAssemblies.filter(
        (c) => c.classification.needsReview,
      ).length;
      // @ts-ignore — extractionV2 not yet in generated api.d.ts
      await convex.mutation(anyApi["bidshield/extractionV2"].completeRun, {
        runId: runId as any,
        extractedCount: items.length,
        needsReviewCount,
      });
    }

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
