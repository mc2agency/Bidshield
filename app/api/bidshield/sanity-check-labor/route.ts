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

const LaborTaskSchema = z.object({
  task: z.string().max(200).trim(),
  category: z.string().max(100).trim(),
  unit: z.string().max(20).trim(),          // "SF", "LF", "EA", "/day"
  quantity: z.number().min(0),
  ratePerUnit: z.number().min(0),
  totalCost: z.number().min(0),
  crewSize: z.number().int().min(1).max(50).optional(),
  days: z.number().min(0).optional(),
});

const PastBidSchema = z.object({
  name: z.string().max(200).trim(),
  sqft: z.number().positive().optional(),
  systemType: z.string().max(50).trim().optional(),
  laborCost: z.number().positive(),
  totalBidAmount: z.number().positive().optional(),
});

const SanityCheckLaborSchema = z.object({
  tasks: z.array(LaborTaskSchema).max(50),
  totalLaborCost: z.number().min(0),
  // Project context
  sqft: z.number().positive().optional(),
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  projectType: z.enum(["reroof", "new-construction", "recover"]).optional(),
  laborType: z.enum(["open_shop", "prevailing_wage", "union"]).optional(),
  baseWage: z.number().positive().max(200).optional(),
  // Past bids from the user's own history for comparison
  pastBids: z.array(PastBidSchema).max(20).optional(),
  totalBidAmount: z.number().positive().optional(),
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const TaskFindingSchema = z.object({
  task: z.string(),
  finding: z.string(),
  severity: z.enum(["error", "warning", "info"]),
  expectedRange: z.string().optional(),   // e.g. "$0.28–$0.45/SF"
  actual: z.string().optional(),          // e.g. "$0.12/SF"
});

const SanityCheckLaborResponseSchema = z.object({
  passed: z.boolean(),
  overallVerdict: z.string(),             // One sentence
  laborPerSf: z.number().optional(),      // Computed $/SF
  laborAsPctOfBid: z.number().optional(), // Labor as % of total bid
  benchmarkLaborPerSf: z.string().optional(), // e.g. "$1.20–$2.10/SF"
  findings: z.array(TaskFindingSchema).max(20),
  topRisk: z.string(),                    // Single most urgent issue
});

// ---------------------------------------------------------------------------
// Regional benchmarks hardcoded (AI supplements with reasoning)
// ---------------------------------------------------------------------------

const BENCHMARKS: Record<string, { laborPerSf: string; laborPct: string }> = {
  tpo: { laborPerSf: "$1.10–$2.20/SF", laborPct: "28–38% of total bid" },
  epdm: { laborPerSf: "$0.95–$1.90/SF", laborPct: "25–36% of total bid" },
  sbs: { laborPerSf: "$1.30–$2.50/SF", laborPct: "30–42% of total bid" },
  pvc: { laborPerSf: "$1.10–$2.20/SF", laborPct: "28–38% of total bid" },
  metal: { laborPerSf: "$2.00–$4.50/SF", laborPct: "35–50% of total bid" },
  bur: { laborPerSf: "$1.50–$3.00/SF", laborPct: "32–45% of total bid" },
  spf: { laborPerSf: "$0.80–$1.60/SF", laborPct: "22–32% of total bid" },
};

const TASK_BENCHMARKS: Record<string, { unit: string; low: number; high: number }> = {
  tearoff: { unit: "SF", low: 0.18, high: 0.65 },
  membrane: { unit: "SF", low: 0.22, high: 0.55 },
  insulation: { unit: "SF", low: 0.12, high: 0.35 },
  flashing: { unit: "LF", low: 2.50, high: 8.00 },
  accessories: { unit: "EA", low: 45, high: 250 },
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
    const parsed = SanityCheckLaborSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      tasks, totalLaborCost, sqft, systemType, projectType,
      laborType, baseWage, pastBids, totalBidAmount,
    } = parsed.data;

    const laborPerSf = sqft && sqft > 0 ? totalLaborCost / sqft : undefined;
    const laborPct = totalBidAmount && totalBidAmount > 0 ? (totalLaborCost / totalBidAmount) * 100 : undefined;
    const benchmark = systemType ? BENCHMARKS[systemType] : undefined;

    const laborTypeLabel: Record<string, string> = {
      open_shop: "Open Shop",
      prevailing_wage: "Prevailing Wage",
      union: "Union",
    };

    const taskBlock = tasks.map((t, i) =>
      `${i + 1}. [${t.category}] ${t.task} | ${t.quantity.toLocaleString()} ${t.unit} @ $${t.ratePerUnit}/${t.unit} = $${Math.round(t.totalCost).toLocaleString()}${t.crewSize ? ` | crew: ${t.crewSize}` : ""}${t.days ? ` | ${t.days}d` : ""}`
    ).join("\n");

    const pastBidBlock = pastBids && pastBids.length > 0
      ? `\nEstimator's own past bids for comparison:\n${pastBids.map(b =>
          `- ${b.name}: ${b.sqft ? `${b.sqft.toLocaleString()} SF, ` : ""}${b.systemType ? `${b.systemType.toUpperCase()}, ` : ""}labor $${b.laborCost.toLocaleString()}${b.sqft ? ` ($${(b.laborCost / b.sqft).toFixed(2)}/SF)` : ""}${b.totalBidAmount ? `, ${((b.laborCost / b.totalBidAmount) * 100).toFixed(1)}% of bid` : ""}`
        ).join("\n")}`
      : "";

    const prompt = `You are a commercial roofing labor cost auditor reviewing a bid's labor breakdown before submission.

Project details:
- System type: ${systemType?.toUpperCase() ?? "not specified"}
- Project type: ${projectType ?? "not specified"}
- Roof area: ${sqft ? `${sqft.toLocaleString()} SF` : "not provided"}
- Labor type: ${laborType ? laborTypeLabel[laborType] : "not specified"}
- Base wage: ${baseWage ? `$${baseWage}/hr` : "not specified"}
- Total labor cost: $${Math.round(totalLaborCost).toLocaleString()}${laborPerSf ? ` ($${laborPerSf.toFixed(2)}/SF)` : ""}${laborPct ? ` (${laborPct.toFixed(1)}% of total bid)` : ""}
${benchmark ? `\nIndustry benchmarks for ${systemType?.toUpperCase()}:\n- Labor/SF: ${benchmark.laborPerSf}\n- Labor as % of bid: ${benchmark.laborPct}` : ""}${pastBidBlock}

Task-level breakdown:
${taskBlock || "(No tasks provided)"}

Task-level benchmarks (US commercial roofing, rate per unit):
- Tear-off: $0.18–$0.65/SF (depends on existing system, gravel vs. ballast, disposal)
- Insulation install: $0.12–$0.35/SF
- Single-ply membrane: $0.22–$0.55/SF mechanically attached; $0.28–$0.60/SF adhered
- Metal edge / gravel stop: $2.50–$6.00/LF
- Counterflashing: $3.00–$8.00/LF
- Pipe boots / penetrations: $45–$150/EA
- Roof drains (ring + flash): $180–$400/EA
- Curb flashings: $120–$350/EA

Your job:
1. Check if the total labor $/SF is within benchmark range for this system type. Flag if outside.
2. Check if labor as % of total bid is in normal range. Flag if outside.
3. Review each task's rate against benchmarks. Flag rates that are unusually low (underbid risk) or high (not competitive).
4. Check if critical task categories are missing (e.g., tear-off not budgeted on a reroof, flashing not included).
5. Compare against the estimator's own past bids if provided — flag meaningful deviations.
6. Check for crew size / day count inconsistencies (e.g., 2-person crew budgeted but 45,000 SF in 5 days is physically impossible).

Severity:
- error: rate is wrong or task missing — bid will lose money or be non-competitive
- warning: rate is outside normal range, needs justification
- info: observation, no action required

Respond with valid JSON only — no markdown fences:
{
  "passed": <true|false>,
  "overallVerdict": "<one sentence>",
  "laborPerSf": <computed number or null>,
  "laborAsPctOfBid": <computed number or null>,
  "benchmarkLaborPerSf": "<range string for this system>",
  "findings": [
    {
      "task": "<task name or 'Overall'>",
      "finding": "<plain English finding>",
      "severity": "error|warning|info",
      "expectedRange": "<benchmark range if applicable>",
      "actual": "<actual value>"
    }
  ],
  "topRisk": "<single most urgent issue in one sentence>"
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: any;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
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
      console.error("[sanity-check-labor parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json({ error: "AI returned an unreadable response — please try again." }, { status: 422 });
    }

    const validated = SanityCheckLaborResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[sanity-check-labor shape-error]", { issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("sanity-check-labor error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
