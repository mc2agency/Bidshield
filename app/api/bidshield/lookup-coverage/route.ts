import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { materialName } = await req.json();

    if (!materialName) {
      return NextResponse.json({ error: "No materialName provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: `For the commercial roofing material named "${materialName}", what is the standard industry coverage rate? Return JSON only, no other text:
{ "coverageRate": string | null, "confidence": "high" | "low" }

Only return a coverageRate value if you are confident. Common standards:
- SBS/APP cap sheet or base sheet = "100 SF/RL"
- Polyiso 4x8 board = "32 SF/BD"
- TPO/PVC/EPDM membrane (10' wide) = "1000 SF/RL"
- TPO/PVC/EPDM membrane (5' wide) = "500 SF/RL"
- DensDeck / coverboard 4x8 = "32 SF/BD"
- Fasteners / screws box of 500 = "500 EA/BX"
- Bonding adhesive (5 gal) = "250 SF/GL"
- Return null if unsure.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let result: { coverageRate: string | null; confidence: "high" | "low" };
    try {
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ coverageRate: null, confidence: "low" });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
