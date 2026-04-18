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

const PastBidSchema = z.object({
  name: z.string().max(200).trim(),
  sqft: z.number().positive(),
  systemType: z.string().max(50).trim().optional(),
  primaryAssembly: z.string().max(200).trim().optional(),
  totalBidAmount: z.number().positive(),
  laborCost: z.number().optional(),
  materialCost: z.number().optional(),
  bidDate: z.string().max(30).trim().optional(),
  won: z.boolean().optional(),
  location: z.string().max(200).trim().optional(),
});

const BenchmarkCompetitivenessSchema = z.object({
  // Current bid
  currentSqft: z.number().positive(),
  currentTotalBid: z.number().positive(),
  currentSystemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  currentPrimaryAssembly: z.string().max(200).trim().optional(),
  currentLaborCost: z.number().optional(),
  currentMaterialCost: z.number().optional(),
  currentProjectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  currentGcName: z.string().max(200).trim().optional(),
  currentLocation: z.string().max(200).trim().optional(),
  currentBidDate: z.string().max(30).trim().optional(),

  // User's own past bids
  pastBids: z.array(PastBidSchema).max(50),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const ComparableBidSchema = z.object({
  name: z.string(),
  sqft: z.number(),
  dollarPerSf: z.number(),
  systemType: z.string().optional(),
  won: z.boolean().optional(),
  deltaFromCurrent: z.number(), // % difference — positive = current bid is higher
});

const BenchmarkCompetitivenessResponseSchema = z.object({
  currentDollarPerSf: z.number(),
  verdict: z.enum(["competitive", "high", "very_high", "low", "very_low", "insufficient_data"]),
  verdictLabel: z.string(),          // Human-readable label
  industryRangeLow: z.number().optional(),   // $/SF
  industryRangeHigh: z.number().optional(),
  ownHistoryAvg: z.number().optional(),      // $/SF average from own past bids
  ownHistoryCount: z.number().int().optional(),
  comparableBids: z.array(ComparableBidSchema).max(10),
  pctFromOwnAvg: z.number().optional(),      // % above/below own history
  laborPct: z.number().optional(),           // Labor as % of this bid
  materialPct: z.number().optional(),
  insights: z.array(z.string().max(300)).max(6),
  recommendation: z.string().max(400),
});

// ---------------------------------------------------------------------------
// Industry benchmarks ($/SF, by system type + project type)
// ---------------------------------------------------------------------------

const INDUSTRY_BENCHMARKS: Record<string, { reroof: [number, number]; newConstruction: [number, number]; recover: [number, number] }> = {
  tpo:   { reroof: [8.50, 16.00],  newConstruction: [12.00, 22.00], recover: [7.00, 13.00] },
  epdm:  { reroof: [7.50, 14.00],  newConstruction: [11.00, 20.00], recover: [6.50, 12.00] },
  sbs:   { reroof: [9.00, 18.00],  newConstruction: [13.00, 24.00], recover: [8.00, 15.00] },
  pvc:   { reroof: [9.50, 17.00],  newConstruction: [13.00, 23.00], recover: [8.00, 14.00] },
  metal: { reroof: [18.00, 45.00], newConstruction: [22.00, 60.00], recover: [15.00, 38.00] },
  bur:   { reroof: [10.00, 20.00], newConstruction: [14.00, 26.00], recover: [9.00, 17.00] },
  spf:   { reroof: [6.00, 12.00],  newConstruction: [8.00, 16.00],  recover: [5.50, 10.00] },
};

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
    const parsed = BenchmarkCompetitivenessSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      currentSqft, currentTotalBid, currentSystemType, currentPrimaryAssembly,
      currentLaborCost, currentMaterialCost, currentProjectType, currentGcName,
      currentLocation, currentBidDate, pastBids,
    } = parsed.data;

    const currentDollarPerSf = currentTotalBid / currentSqft;

    // Filter past bids to same system type (or similar) with valid SF
    const comparable = pastBids
      .filter(b => b.sqft > 0 && b.totalBidAmount > 0)
      .map(b => ({
        ...b,
        dollarPerSf: b.totalBidAmount / b.sqft,
        deltaFromCurrent: ((currentDollarPerSf - b.totalBidAmount / b.sqft) / (b.totalBidAmount / b.sqft)) * 100,
      }))
      .sort((a, b) => {
        // Prioritize same system type
        const aMatch = a.systemType === currentSystemType ? 1 : 0;
        const bMatch = b.systemType === currentSystemType ? 1 : 0;
        return bMatch - aMatch;
      })
      .slice(0, 10);

    const ownHistoryRates = comparable.map(b => b.dollarPerSf);
    const ownHistoryAvg = ownHistoryRates.length > 0
      ? ownHistoryRates.reduce((s, r) => s + r, 0) / ownHistoryRates.length
      : null;

    const pctFromOwnAvg = ownHistoryAvg
      ? ((currentDollarPerSf - ownHistoryAvg) / ownHistoryAvg) * 100
      : null;

    const benchmark = currentSystemType ? INDUSTRY_BENCHMARKS[currentSystemType] : null;
    const projectTypeKey = currentProjectType === "new-construction" ? "newConstruction"
      : currentProjectType === "recover" ? "recover" : "reroof";
    const industryRange = benchmark ? benchmark[projectTypeKey] : null;

    const laborPct = currentLaborCost && currentTotalBid ? (currentLaborCost / currentTotalBid) * 100 : null;
    const materialPct = currentMaterialCost && currentTotalBid ? (currentMaterialCost / currentTotalBid) * 100 : null;

    const comparableBlock = comparable.length > 0
      ? comparable.map(b =>
          `- ${b.name}: ${b.sqft.toLocaleString()} SF${b.systemType ? ` (${b.systemType.toUpperCase()})` : ""} @ $${b.dollarPerSf.toFixed(2)}/SF${b.won != null ? (b.won ? " ✓ won" : " ✗ lost") : ""}${b.bidDate ? ` | ${b.bidDate}` : ""}`
        ).join("\n")
      : "(No past bids available for comparison)";

    const comparableBidsJson = JSON.stringify(
      comparable.map(b => ({
        name: b.name,
        sqft: b.sqft,
        dollarPerSf: Number(b.dollarPerSf.toFixed(2)),
        systemType: b.systemType ?? "",
        won: b.won ?? null,
        deltaFromCurrent: Number(b.deltaFromCurrent.toFixed(1)),
      }))
    );

    const prompt = `You are a commercial roofing bid analyst reviewing whether a bid is competitively priced.

CURRENT BID:
- Total: $${Math.round(currentTotalBid).toLocaleString()} on ${currentSqft.toLocaleString()} SF = $${currentDollarPerSf.toFixed(2)}/SF
${currentSystemType ? `- System: ${currentSystemType.toUpperCase()}` : ""}
${currentPrimaryAssembly ? `- Assembly: ${currentPrimaryAssembly}` : ""}
${currentProjectType ? `- Project type: ${currentProjectType}` : ""}
${currentGcName ? `- GC: ${currentGcName}` : ""}
${currentLocation ? `- Location: ${currentLocation}` : ""}
${currentBidDate ? `- Bid date: ${currentBidDate}` : ""}
${laborPct != null ? `- Labor: ${laborPct.toFixed(1)}% of bid` : ""}
${materialPct != null ? `- Materials: ${materialPct.toFixed(1)}% of bid` : ""}

INDUSTRY BENCHMARKS${currentSystemType ? ` for ${currentSystemType.toUpperCase()} ${currentProjectType ?? "reroof"}` : ""}:
${industryRange ? `- $/SF range: $${industryRange[0].toFixed(2)}–$${industryRange[1].toFixed(2)}/SF (US commercial, 2024-2025)` : "- No benchmark available for this system type"}

ESTIMATOR'S OWN HISTORY:
${comparableBlock}
${ownHistoryAvg != null ? `Own history average: $${ownHistoryAvg.toFixed(2)}/SF (${comparable.length} bids)` : ""}
${pctFromOwnAvg != null ? `Current bid is ${pctFromOwnAvg > 0 ? `${pctFromOwnAvg.toFixed(1)}% ABOVE` : `${Math.abs(pctFromOwnAvg).toFixed(1)}% BELOW`} own history average` : ""}

Your job: assess whether this bid is competitively priced, identify the most likely reasons for deviations, and give actionable insights.

Verdict options:
- competitive: within ±10% of own history and within industry range
- high: 10–25% above own history average or above industry range high
- very_high: >25% above own history or significantly above industry range
- low: 10–25% below own history average or below industry range low (margin risk)
- very_low: >25% below own history (likely underpriced — significant risk)
- insufficient_data: <3 comparable bids and no system-type match

Insights should be specific and actionable — e.g. "Your TPO bids average $11.20/SF; this bid at $14.80/SF is 32% higher — if the GC has seen your prior bids they'll negotiate hard" or "Labor at 42% of bid is above typical 30–38% for TPO — verify production rates aren't overstated."

Respond with valid JSON only — no markdown fences:
{
  "currentDollarPerSf": ${currentDollarPerSf.toFixed(2)},
  "verdict": "<verdict>",
  "verdictLabel": "<human-readable label>",
  "industryRangeLow": ${industryRange ? industryRange[0] : null},
  "industryRangeHigh": ${industryRange ? industryRange[1] : null},
  "ownHistoryAvg": ${ownHistoryAvg?.toFixed(2) ?? null},
  "ownHistoryCount": ${comparable.length},
  "comparableBids": ${comparableBidsJson},
  "pctFromOwnAvg": ${pctFromOwnAvg?.toFixed(1) ?? null},
  "laborPct": ${laborPct?.toFixed(1) ?? null},
  "materialPct": ${materialPct?.toFixed(1) ?? null},
  "insights": ["<insight 1>", "<insight 2>"],
  "recommendation": "<2-3 sentence recommendation on whether to adjust the bid>"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
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
      console.error("[benchmark-competitiveness parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json({ error: "AI returned an unreadable response — please try again." }, { status: 422 });
    }

    const validated = BenchmarkCompetitivenessResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[benchmark-competitiveness shape-error]", { issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("benchmark-competitiveness error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
