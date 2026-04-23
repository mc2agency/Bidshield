import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";
import {
  classifyAssembly,
  consolidateTakeoffRows,
  isRoofRow,
} from "@/lib/bidshield/assembly-classifier";

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
    const body = await req.json();
    const { pdfBase64 } = body;
    const mode: "detail" | "takeoff" = body.mode === "takeoff" ? "takeoff" : "detail";

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
  "location": "string or null if not found"
}

Each assembly object must use ONLY these exact values:

system: 'tpo' | 'pvc' | 'epdm' | 'sbs' | 'app' | 'bur' | 'metal' | 'spf' | 'hydrotech'

insulation: 'polyiso' | 'xps' | 'eps' | 'mineral_wool' | 'vacuum' | 'none'

thickness: '1.5' | '2' | '2.5' | '3' | '4' | '6' | '8'

surface: 'exposed' | 'pavers_pedestals' | 'pavers_ballast' | 'green_roof' | 'walkpads' | 'traffic_coating'

label: use label from drawing (RT-1, RT-2, RT-01, RT-02) if shown, otherwise RT-01, RT-02, etc. Max 10 assemblies.

area: number in SF if a roof type takeoff schedule, region area, or area table is present. Include sub-areas (e.g. RT-01 and RT-01 N) as separate entries. Omit if no area data found.

uValue: thermal U-value if shown in the schedule. Omit if not found.

name: descriptive name from the schedule (e.g. "TERRACE PAVERS", "BALLAST PAVERS", "GREEN ROOF", "BULKHEAD ROOF"). Omit if not found.

deckType: Look for deck type info in detail drawings — concrete slab, steel deck, wood, etc. Use the standardized values above. Set to null if not identifiable.

projectName: If a title block shows a building/project name, extract it. Set to null if not found.

location: If a title block shows an address or location, extract it. Set to null if not found.

IMPORTANT: If the drawing contains a roof type takeoff schedule with area data, extract EVERY row including sub-areas (e.g. RT-01, RT-01 N as separate entries). Preserve the exact labels from the schedule.

INCLUDE NON-ROOF ITEMS YOU ENCOUNTER: if the page also lists slab-on-grade waterproofing, soffits, canopies, or other non-roof wall/facade assemblies, INCLUDE them in the output. Use their actual tag (e.g. ST-01, RT-06). The server-side filter will classify them — your job is to report everything visible. Do NOT skip items because they aren't roofs.

For each assembly, also populate when possible:
  "facadeLocation": one of "ROOF" | "WALL" | "FACADE" | "SOFFIT" | "OTHER" (from the sheet's section header, e.g. on envelope takeoff schedules — ROOF section rows go here)
  "name": the descriptive title exactly as shown ("IRMA ROOF W/ PAVERS AT OCCUPIED TERRACES", "SLAB ON GRADE AT OCCUPIED", "FIBER CEMENT SOFFIT"). This is the single most important field for classification — never omit it.
  "uValue": thermal U-value if the schedule lists one.
  "rValue": assembly R-value if the schedule lists one (e.g. R-41.73).

Do NOT truncate or reword the name. The downstream classifier uses keyword matching on the full title (SOFFIT, SLAB ON GRADE, IRMA, EPDM, etc.).`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110_000);
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
    } catch (apiErr: any) {
      clearTimeout(timeout);
      if (apiErr?.name === "AbortError" || apiErr?.message?.includes("abort")) {
        return NextResponse.json({ error: "Analysis timed out — the PDF may be too large. Try uploading only the roof plan sheet." }, { status: 504 });
      }
      throw apiErr;
    } finally {
      clearTimeout(timeout);
    }

    const text = message!.content[0]?.type === "text" ? message!.content[0].text : "";
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
      system: z.string().nullable().optional(),
      insulation: z.string().nullable().optional(),
      thickness: z.string().nullable().optional(),
      surface: z.string().nullable().optional(),
      area: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      deckType: z.string().nullable().optional(),
      uValue: z.number().nullable().optional(),
      rValue: z.number().nullable().optional(),
      facadeLocation: z.string().nullable().optional(),
    });
    const AssembliesResultSchema = z.object({
      assemblies: z.array(AssemblyItemSchema).default([]),
      deckType: z.string().nullable().optional(),
      projectName: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
    });

    // Normalise array format to object format before validating
    const normalised = Array.isArray(data) ? { assemblies: data } : data;
    const validated = AssembliesResultSchema.safeParse(normalised);
    if (!validated.success) {
      console.error("[ai-shape-error]", { endpoint: "extract-assemblies", issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    const raw = validated.data.assemblies;

    if (mode === "takeoff") {
      // Takeoff/EN-sheet: drop non-ROOF rows, consolidate duplicate base tags
      // (RT-01 + RT-01 N collapse to a single row with subAreas preserved).
      const roofRows = raw.filter(isRoofRow);
      const consolidated = consolidateTakeoffRows(roofRows);
      return NextResponse.json({
        ...validated.data,
        mode,
        assemblies: consolidated,
      });
    }

    // Detail mode: classify each assembly, keep dropped items in the array
    // with category === "dropped" so the diff modal can show them.
    const classified = raw.map(classifyAssembly);
    return NextResponse.json({
      ...validated.data,
      mode,
      assemblies: classified,
    });
  } catch (err: any) {
    console.error("extract-assemblies error:", {
      name: err?.name,
      message: err?.message,
      status: err?.status,
      type: err?.type ?? err?.error?.error?.type,
    });
    if (err?.status === 401) {
      return NextResponse.json({ error: "AI service authentication failed. Please contact support." }, { status: 500 });
    }
    if (err?.status === 429) {
      return NextResponse.json({ error: "AI service is rate-limited right now. Please try again in a moment." }, { status: 429 });
    }
    if (err?.status === 529 || err?.status === 503) {
      return NextResponse.json({ error: "AI service is temporarily overloaded. Please try again in a moment." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
