import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Input schema — all the numbers from the PricingTab recap
// ---------------------------------------------------------------------------

const LineItemSchema = z.object({
  description: z.string().max(200).trim(),
  amount: z.number(),
  isMarkup: z.boolean().optional(),
  markupPct: z.number().optional(),
});

const AuditArithmeticSchema = z.object({
  // Individual cost buckets
  materialCost: z.number().optional(),
  laborCost: z.number().optional(),
  gcLineTotal: z.number().optional(),       // General conditions line items (non-markup)
  gcMarkupTotal: z.number().optional(),     // Overhead + profit markup total
  // What the estimator says the total is
  totalBidAmount: z.number().optional(),
  // Breakdown for re-verification
  gcLineItems: z.array(LineItemSchema).max(50).optional(),
  gcMarkupItems: z.array(LineItemSchema).max(20).optional(),
  // Addenda impacts
  addendaPriceImpact: z.number().optional(),
  // Project context
  systemType: z.enum(["tpo", "epdm", "sbs", "pvc", "metal", "bur", "spf"]).optional(),
  grossRoofArea: z.number().optional(),    // SF
});

// ---------------------------------------------------------------------------
// Output schema
// ---------------------------------------------------------------------------

const ArithmeticIssueSchema = z.object({
  type: z.enum(["error", "warning", "info"]),
  description: z.string(),
  expected: z.string().optional(),   // What the math says it should be
  found: z.string().optional(),      // What the bid shows
  delta: z.number().optional(),      // Dollar difference (positive = bid is over)
});

const AuditArithmeticResponseSchema = z.object({
  passed: z.boolean(),
  issueCount: z.number().int(),
  computedSubtotal: z.number().optional(),   // mat + labor + gcLine
  computedTotal: z.number().optional(),      // subtotal + markup
  issues: z.array(ArithmeticIssueSchema).max(20),
  summary: z.string(),  // One-sentence verdict
});

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
    const parsed = AuditArithmeticSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const {
      materialCost,
      laborCost,
      gcLineTotal,
      gcMarkupTotal,
      totalBidAmount,
      gcLineItems,
      gcMarkupItems,
      addendaPriceImpact,
      systemType,
      grossRoofArea,
    } = parsed.data;

    // Build a structured summary for the AI to audit
    const fmt = (n: number | undefined) =>
      n != null ? `$${Math.round(n).toLocaleString()}` : "not provided";
    const fmtPct = (n: number | undefined) =>
      n != null ? `${n}%` : "not provided";

    const lineItemsBlock =
      gcLineItems && gcLineItems.length > 0
        ? gcLineItems
            .map(
              (li) =>
                `  - ${li.description}: ${fmt(li.amount)}${li.isMarkup ? ` (markup @ ${fmtPct(li.markupPct)})` : ""}`
            )
            .join("\n")
        : "  (no line items provided)";

    const markupBlock =
      gcMarkupItems && gcMarkupItems.length > 0
        ? gcMarkupItems
            .map((li) => `  - ${li.description}: ${fmtPct(li.markupPct)} → ${fmt(li.amount)}`)
            .join("\n")
        : "  (no markup items provided)";

    const prompt = `You are a commercial roofing bid auditor. Re-verify every arithmetic calculation in this bid pricing recap before it is submitted to the GC.

Bid numbers provided:
- Material cost:         ${fmt(materialCost)}
- Labor cost:            ${fmt(laborCost)}
- GC line items total:   ${fmt(gcLineTotal)}
- GC markup total:       ${fmt(gcMarkupTotal)}
- Addenda price impact:  ${fmt(addendaPriceImpact)}
- STATED TOTAL BID:      ${fmt(totalBidAmount)}
${grossRoofArea ? `- Gross roof area:       ${grossRoofArea.toLocaleString()} SF` : ""}
${systemType ? `- System type:           ${systemType.toUpperCase()}` : ""}

GC line items breakdown:
${lineItemsBlock}

Markup breakdown:
${markupBlock}

Your job:
1. Re-compute the expected subtotal = materialCost + laborCost + gcLineTotal (+ addendaPriceImpact if provided).
2. Re-compute the expected total = subtotal + gcMarkupTotal.
3. Compare computed total to the stated totalBidAmount. Flag any discrepancy > $500.
4. Re-verify each markup line item: markupPct × (materialCost + laborCost + gcLineTotal) = the stated amount. Flag errors > $100.
5. Verify gcLineTotal = sum of all non-markup line items. Flag discrepancies.
6. Verify gcMarkupTotal = sum of all markup amounts. Flag discrepancies.
7. If grossRoofArea is provided, compute $/SF and flag if it's outside typical commercial roofing range ($8–$35/SF for single-ply reroof, $15–$60/SF for new construction).
8. Flag any zero or negative cost buckets that seem unusual.

Severity:
- error: math is wrong, total won't match what the GC receives
- warning: possible issue, likely explanation exists but worth confirming
- info: observation, no action required

If all numbers check out with no errors, set passed: true and issueCount: 0.

Respond with valid JSON only — no markdown fences, no explanation:
{
  "passed": <true|false>,
  "issueCount": <integer>,
  "computedSubtotal": <number or null>,
  "computedTotal": <number or null>,
  "issues": [
    {
      "type": "error|warning|info",
      "description": "<clear plain-English description>",
      "expected": "<what the math says>",
      "found": "<what the bid shows>",
      "delta": <dollar difference, positive = bid overstated>
    }
  ],
  "summary": "<one sentence verdict>"
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
      console.error("[audit-arithmetic parse-error]", { raw: cleaned?.substring(0, 500), error: parseErr?.message });
      return NextResponse.json(
        { error: "AI returned an unreadable response — please try again." },
        { status: 422 }
      );
    }

    const validated = AuditArithmeticResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("[audit-arithmetic shape-error]", { issues: validated.error.issues });
      return NextResponse.json(
        { error: "AI returned an unexpected response shape — please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("audit-arithmetic error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
