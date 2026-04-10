import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BidReviewSchema = z.object({
  projectName: z.string().max(200).trim(),
  location: z.string().max(200).trim().optional(),
  gc: z.string().max(200).trim().optional(),
  bidDate: z.string().max(50).trim().optional(),
  systemType: z.string().max(100).trim().optional(),
  squareFeet: z.number().optional(),
  totalBid: z.number().optional(),
  materialCost: z.number().optional(),
  laborCost: z.number().optional(),
  gcCost: z.number().optional(),
  costPerSf: z.number().optional(),
  scopeSummary: z
    .object({
      included: z.number(),
      excluded: z.number(),
      byOthers: z.number(),
      unaddressed: z.number(),
    })
    .optional(),
  exclusions: z.array(z.string().max(200)).max(20).optional(),
  validatorScore: z.number().optional(),
  validatorWarnings: z.array(z.string().max(300)).max(10).optional(),
  validatorFailures: z.array(z.string().max(300)).max(10).optional(),
  addendaCount: z.number().optional(),
  quoteCount: z.number().optional(),
  rfiCount: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const parsed = BidReviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;

    const costBreakdown = [
      d.materialCost != null ? `Materials: $${d.materialCost.toLocaleString()}` : null,
      d.laborCost != null ? `Labor: $${d.laborCost.toLocaleString()}` : null,
      d.gcCost != null ? `General Conditions: $${d.gcCost.toLocaleString()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a senior commercial roofing estimating consultant reviewing a bid before submission. Provide a concise, actionable review.

PROJECT SUMMARY:
- Name: ${d.projectName}
- Location: ${d.location || "Not specified"}
- GC: ${d.gc || "Not specified"}
- Bid Date: ${d.bidDate || "Not specified"}
- System: ${d.systemType || "Not specified"}
- Area: ${d.squareFeet ? `${d.squareFeet.toLocaleString()} SF` : "Not specified"}

PRICING:
- Total Bid: ${d.totalBid ? `$${d.totalBid.toLocaleString()}` : "Not entered"}
- Cost/SF: ${d.costPerSf ? `$${d.costPerSf.toFixed(2)}/SF` : "N/A"}
${costBreakdown ? `- Breakdown:\n${costBreakdown}` : ""}

SCOPE:
${d.scopeSummary ? `- ${d.scopeSummary.included} included, ${d.scopeSummary.excluded} excluded, ${d.scopeSummary.byOthers} by others, ${d.scopeSummary.unaddressed} unaddressed` : "Not reviewed"}
${d.exclusions?.length ? `- Key exclusions: ${d.exclusions.slice(0, 10).join(", ")}` : ""}

PROJECT STATUS:
- Validator Score: ${d.validatorScore != null ? `${d.validatorScore}/100` : "N/A"}
${d.validatorWarnings?.length ? `- Warnings: ${d.validatorWarnings.join("; ")}` : ""}
${d.validatorFailures?.length ? `- Failures: ${d.validatorFailures.join("; ")}` : ""}
- Addenda: ${d.addendaCount ?? 0}, Quotes: ${d.quoteCount ?? 0}, RFIs: ${d.rfiCount ?? 0}

Provide your review in this format:
1. **OVERALL ASSESSMENT** — 1-2 sentences on bid readiness
2. **PRICING CHECK** — Is the $/SF reasonable for this system type and region? Flag if too high or low.
3. **SCOPE RISKS** — Missing exclusions, unclear scope boundaries, or unaddressed items
4. **PROCESS GAPS** — Missing quotes, unanswered RFIs, unacknowledged addenda
5. **RECOMMENDATIONS** — 2-3 specific actions before submission

Keep it under 400 words. Be direct and specific — don't pad with generic advice. If something looks good, say so briefly and move on.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json(
      { review: text },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (e: any) {
    console.error("ai-bid-review error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to generate review" },
      { status: 500 }
    );
  }
}
