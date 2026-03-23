import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  console.log("AUTH CHECK ADDED — extract-gc-form");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(userId)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const { pdfBase64, projectContext } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }

    const ctx = projectContext ?? {};

    const systemPrompt = `You are analyzing a GC bid form for a commercial roofing subcontractor. This could be an Exhibit A, Exhibit B, Bid Form, Scope Confirmation, or any similar document — the name varies by GC.

Extract every question, required field, and scope requirement from the document. Classify each item and determine if it can be auto-confirmed from the provided projectContext.

Return a JSON array only — no markdown, no other text. Each object in the array must have exactly these fields:
{
  "questionText": string,
  "itemType": "fill-in" | "scope-item",
  "autoConfirmed": boolean,
  "confirmedValue": string | null,
  "matchedField": string | null,
  "scopeMatch": {
    "foundInScope": boolean,
    "foundInChecklist": boolean
  } | null
}

=== PROJECT CONTEXT ===
${ctx.laborType ? `Labor type: ${ctx.laborType}` : ""}
${ctx.addendaNumbers?.length ? `Addenda incorporated: ${ctx.addendaNumbers.join(", ")}` : ""}
${ctx.specSections?.length ? `Spec sections: ${ctx.specSections.join(", ")}` : ""}
${ctx.insuranceProgram ? `Insurance program: ${ctx.insuranceProgram}` : ""}
${ctx.bidValidDays ? `Bid valid for: ${ctx.bidValidDays}` : ""}
${ctx.roofSystem ? `Roof system: ${ctx.roofSystem}` : ""}
${ctx.drawingDate ? `Drawing date: ${ctx.drawingDate}` : ""}
${ctx.planRevision ? `Plan revision: ${ctx.planRevision}` : ""}
${ctx.bondRequired !== undefined ? `Bond required: ${ctx.bondRequired}` : ""}
${ctx.prevailingWage !== undefined ? `Prevailing wage: ${ctx.prevailingWage}` : ""}
${ctx.mbeWbeGoals !== undefined ? `MBE/WBE goals: ${ctx.mbeWbeGoals}` : ""}
${ctx.scopeItems?.length ? `Scope items:\n${ctx.scopeItems.map((s: any) => `  - ${s.text} (${s.status})`).join("\n")}` : ""}
${ctx.checklistItems?.length ? `Checklist items:\n${ctx.checklistItems.slice(0, 40).map((c: any) => `  - ${c.text} (${c.status})`).join("\n")}` : ""}

=== AUTO-CONFIRM RULES ===
Only auto-confirm if the match is clear and unambiguous. Set autoConfirmed: true and populate confirmedValue and matchedField when:
- Labor type question → match laborType (e.g. "Open Shop", "Prevailing Wage", "Union")
- Addenda confirmation → check addendaNumbers (e.g. "Addenda 1, 2, 3")
- Spec sections included → match specSections
- Insurance program → match insuranceProgram ("own GL/WC", "CCIP", "OCIP")
- Bid validity period → match bidValidDays
- Bond requirement → match bondRequired
- Prevailing wage compliance → match prevailingWage
- MBE/WBE/DBE goals → match mbeWbeGoals
- Drawing/plan date → match drawingDate
- Plan revision/set → match planRevision
- Roof system type → match roofSystem

NEVER auto-confirm:
- Dollar amounts, bid pricing, unit prices
- Any field requiring calculation
- Anything with conditional or uncertain logic
- When unsure → set autoConfirmed: false

=== SCOPE MATCHING (for scope-item type) ===
For items classified as scope-item: semantically search scopeItems and checklistItems — do NOT require exact text match. A reasonable semantic match counts.
Set scopeMatch.foundInScope = true if any scope item with status "included" or "by_others" semantically matches.
Set scopeMatch.foundInChecklist = true if any checklist item with status "done" or "na" semantically matches.

=== FIELD RULES ===
- questionText: the original requirement or question from the GC form, verbatim or close paraphrase
- itemType: "fill-in" for text/number fields the sub must fill in; "scope-item" for yes/no scope confirmations
- confirmedValue: human-readable value if autoConfirmed, null otherwise
- matchedField: name of the BidShield field matched (e.g. "laborType", "bondRequired", "insuranceProgram"), null if not confirmed
- scopeMatch: only populate for scope-item type, null for fill-in type

Return only the JSON array. No explanation, no markdown fences.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            } as any,
            {
              type: "text",
              text: "Extract all requirements from this GC bid form document. Return only the JSON array.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let items: any[];
    try {
      const parsed = JSON.parse(cleaned);
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      return NextResponse.json(
        { error: "Failed to parse extraction result", raw: text },
        { status: 422 }
      );
    }

    // Normalize items
    const normalized = items.map((item: any) => ({
      questionText: item.questionText ?? "",
      itemType: item.itemType === "scope-item" ? "scope-item" : "fill-in",
      autoConfirmed: !!item.autoConfirmed,
      confirmedValue: item.confirmedValue ?? undefined,
      matchedField: item.matchedField ?? undefined,
      foundInScope: item.scopeMatch?.foundInScope ?? undefined,
      foundInChecklist: item.scopeMatch?.foundInChecklist ?? undefined,
    }));

    return NextResponse.json({ items: normalized });
  } catch (err: any) {
    console.error("extract-gc-form error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
