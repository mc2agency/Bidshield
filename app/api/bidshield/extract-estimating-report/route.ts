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
  "category": "Membrane" | "Insulation" | "Fasteners & Plates" | "Adhesive & Sealant" | "Sheet Metal" | "Lumber & Blocking" | "Accessories" | "Tear-Off" | "Miscellaneous",
  "unit": string,
  "quantity": number,
  "coverageRate": string | null,
  "wastePct": number,
  "unitPrice": number,
  "extendedTotal": number
}

Assign each item to exactly one of these categories:

Membrane: cap sheets, base sheets, base plies, any SBS/TPO/PVC/EPDM/PMMA membrane, liquid membranes, fleece

Insulation: polyiso flat or tapered boards, EPS boards, coverboards (HD coverboard, DensDeck, gypsum board)

Fasteners & Plates: insulation screws + plates, termination bars, termination bar screws, any mechanical roof fastener

Adhesive & Sealant: cold adhesives, bonding adhesives, foam adhesives, sealants, caulks, flashing cements, primers, pourable sealers, pitch pan fillers

Sheet Metal: ALL metal components including raw sheet stock AND finished descriptions like coping, counterflashing, gravel stop, fascia, lock strip, hook strip, cleat, drip edge, expansion joint cover. Any item with a gauge designation (e.g. "24 ga", "26 gauge") or containing aluminum, galvanized, stainless steel, Galvalume, or Kynar. Fabrication is labor not material — categorize the metal purchase here regardless of how it is described in the report.

Lumber & Blocking: ALL dimensional lumber (2x4 through 2x12 PT), ALL plywood (CDX, fire-treated, pressure-treated), posts, nailers, wood blocking, cant strips. Never put lumber in Accessories.

Accessories: walkway pads, prefabricated corners, pipe boots, roof drain parts, clamping rings, compression strips, backer rod, pitch pans (metal pan only — filler goes to Adhesive & Sealant)

Tear-Off: demolition, tear-off, removal line items

Miscellaneous: anything that does not clearly fit the above categories, items with generic or unclear names, equipment rental. When uncertain use Miscellaneous — never force a wrong category.

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
