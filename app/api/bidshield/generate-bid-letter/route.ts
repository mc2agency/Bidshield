import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BidLetterSchema = z.object({
  projectName: z.string().max(200).trim(),
  gc: z.string().max(200).trim().optional(),
  location: z.string().max(200).trim().optional(),
  bidDate: z.string().max(50).trim().optional(),
  systemDescription: z.string().max(2000).trim().optional(),
  exclusions: z.array(z.string().max(200)).max(50).optional(),
  bidQuals: z.array(z.string().max(500)).max(30).optional(),
  baseBid: z.number().optional(),
  alternates: z
    .array(z.object({ name: z.string().max(200), amount: z.number() }))
    .max(10)
    .optional(),
  companyName: z.string().max(200).trim().optional(),
  squareFeet: z.number().optional(),
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
    const parsed = BidLetterSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;

    const exclusionList =
      d.exclusions && d.exclusions.length > 0
        ? d.exclusions.map((e, i) => `${i + 1}. ${e}`).join("\n")
        : "None specified";

    const qualsList =
      d.bidQuals && d.bidQuals.length > 0
        ? d.bidQuals.map((q, i) => `${i + 1}. ${q}`).join("\n")
        : "Standard industry qualifications apply";

    const alternatesText =
      d.alternates && d.alternates.length > 0
        ? d.alternates
            .map((a) => `- ${a.name}: $${a.amount.toLocaleString()}`)
            .join("\n")
        : "";

    const prompt = `You are a commercial roofing estimator preparing a formal bid proposal letter. Generate a professional bid letter with these sections in order:

1. OPENING PARAGRAPH — Thank the GC for the opportunity, reference the project by name and location, and state you are pleased to submit your roofing proposal.

2. SCOPE OF WORK — Describe the roofing scope based on the system description provided. Be specific and professional.

3. BASE BID — State the base bid amount clearly.${alternatesText ? "\n\n4. ALTERNATES — List each alternate with its price." : ""}

${d.exclusions?.length ? `${alternatesText ? "5" : "4"}. EXCLUSIONS — List all items excluded from your scope.` : ""}

${d.bidQuals?.length ? `${alternatesText ? (d.exclusions?.length ? "6" : "5") : d.exclusions?.length ? "5" : "4"}. QUALIFICATIONS & ASSUMPTIONS — List all bid qualifications.` : ""}

FINAL PARAGRAPH — State the bid is valid for 30 days, express willingness to discuss, and provide a professional closing.

PROJECT DETAILS:
- Project: ${d.projectName}
- Location: ${d.location || "Not specified"}
- General Contractor: ${d.gc || "Not specified"}
- Bid Date: ${d.bidDate || "Not specified"}
- Approximate Area: ${d.squareFeet ? `${d.squareFeet.toLocaleString()} SF` : "Not specified"}
- System Description: ${d.systemDescription || "Commercial roofing system as specified"}
- Base Bid: ${d.baseBid ? `$${d.baseBid.toLocaleString()}` : "TBD"}
${alternatesText ? `- Alternates:\n${alternatesText}` : ""}

EXCLUSIONS:
${exclusionList}

QUALIFICATIONS:
${qualsList}

${d.companyName ? `Company Name: ${d.companyName}` : ""}

Write ONLY the letter body text. Use professional estimating language. Do not include placeholder brackets — use the actual data provided or omit sections gracefully. Format with clear section headers using ALL CAPS headers. Keep it concise (under 500 words).`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ letter: text }, { headers: rateLimitHeaders(rl) });
  } catch (e: any) {
    console.error("generate-bid-letter error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to generate bid letter" },
      { status: 500 }
    );
  }
}
