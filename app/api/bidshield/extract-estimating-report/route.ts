import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }

    const systemPrompt = `You are extracting material line items from a commercial roofing estimating report. This could be exported from any estimating software (The EDGE, STACK, Bluebeam, Excel, etc.). Extract every line item and return a JSON array only, no other text, no markdown.

Each object in the array must have exactly these fields:
{
  "materialName": string,
  "category": "Membrane" | "Insulation" | "Fasteners & Plates" | "Adhesive & Sealant" | "Edge Metal" | "Accessories" | "Tear-Off" | "Lumber" | "Metal Work" | "General",
  "unit": string,
  "quantity": number,
  "coverageRate": string | null,
  "wastePct": number,
  "unitPrice": number,
  "extendedTotal": number
}

Infer category from material name:
- Cap Sheet / Base Sheet / TPO / EPDM / PVC / Membrane / Modified Bitumen = Membrane
- Polyiso / EPS / Coverboard / DensDeck / Insulation Board = Insulation
- Screws / Plates / Fasteners / Nails / Clips = Fasteners & Plates
- Adhesive / Primer / Cement / Sealant / Caulk / Mastic = Adhesive & Sealant
- Coping / Gravel Stop / Drip Edge / Flashing Metal / Reglet / Counterflashing = Edge Metal
- Lumber / Blocking / Nailer / Cant Strip = Lumber
- Sheet Metal / Custom Metal / Pre-fab Metal = Metal Work
- Pipe Boot / Drain / Penetration / Curb / Misc = Accessories
- Demo / Tear-Off / Removal = Tear-Off

For wastePct: extract the waste percentage as a number (e.g. 5 for 5%, 10 for 10%). Use 0 if not specified.
For coverageRate: extract as a string like "100 SF/RL" or "32 SF/BD". Use null if not present.
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
              text: "Extract all material line items from this estimating report. Return only the JSON array.",
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

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("extract-estimating-report error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
