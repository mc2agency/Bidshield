import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AssemblyInputSchema = z.object({
  label: z.string().max(20).trim(),
  name: z.string().max(200).trim().optional(),
  systemType: z.string().max(50).trim(),
  deckType: z.string().max(50).trim().optional(),
  insulationType: z.string().max(50).trim().optional(),
  insulationThickness: z.string().max(20).trim().optional(),
  rValue: z.number().optional(),
  surfaceType: z.string().max(50).trim().optional(),
  vaporRetarder: z.boolean().optional(),
  protectionBoard: z.string().max(50).trim().optional(),
  drainageMat: z.boolean().optional(),
  coverBoard: z.string().max(100).trim().optional(),
});

const GenerateDescriptionSchema = z.object({
  assemblies: z.array(AssemblyInputSchema).min(1).max(10),
  projectType: z.string().max(50).trim().optional(),
  deckType: z.string().max(50).trim().optional(),
});

const SYSTEM_LABELS: Record<string, string> = {
  tpo: "TPO Single-Ply",
  pvc: "PVC Single-Ply",
  epdm: "EPDM Single-Ply",
  sbs: "SBS Modified Bitumen",
  app: "APP Modified Bitumen",
  bur: "Built-Up Roofing (BUR)",
  metal: "Standing Seam Metal",
  spf: "Spray Foam (SPF)",
};

const INSULATION_LABELS: Record<string, string> = {
  polyiso: "Polyisocyanurate (Polyiso)",
  xps: "XPS (Extruded Polystyrene)",
  eps: "EPS (Expanded Polystyrene)",
  mineral_wool: "Mineral Wool",
  vacuum: "Vacuum Insulated Panel (VIP)",
};

const SURFACE_LABELS: Record<string, string> = {
  exposed: "Exposed Membrane",
  pavers_pedestals: "Pavers on Pedestals",
  pavers_ballast: "Ballast Pavers",
  green_roof: "Green Roof Trays",
  walkpads: "Walk Pads",
  traffic_coating: "Traffic Coating",
};

function formatAssemblyForPrompt(a: z.infer<typeof AssemblyInputSchema>, defaultDeck?: string): string {
  const lines: string[] = [];
  lines.push(`${a.label}: ${a.name || SYSTEM_LABELS[a.systemType] || a.systemType.toUpperCase()}`);
  lines.push(`  System: ${SYSTEM_LABELS[a.systemType] || a.systemType.toUpperCase()}`);
  const deck = a.deckType || defaultDeck;
  if (deck) lines.push(`  Deck: ${deck}`);
  if (a.vaporRetarder) lines.push(`  Vapor Retarder: Yes`);
  if (a.insulationType) {
    const insLabel = INSULATION_LABELS[a.insulationType] || a.insulationType;
    const thickness = a.insulationThickness ? ` (${a.insulationThickness.replace(/in$/i, "")}") ` : " ";
    const rv = a.rValue ? `R-${a.rValue}` : "";
    lines.push(`  Insulation: ${insLabel}${thickness}${rv}`);
  }
  if (a.coverBoard) lines.push(`  Cover Board: ${a.coverBoard}`);
  if (a.protectionBoard) lines.push(`  Protection Board: ${a.protectionBoard}`);
  if (a.drainageMat) lines.push(`  Drainage Mat: Yes`);
  if (a.surfaceType) lines.push(`  Surface: ${SURFACE_LABELS[a.surfaceType] || a.surfaceType}`);
  return lines.join("\n");
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
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const parsed = GenerateDescriptionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { assemblies, projectType, deckType } = parsed.data;

    const assemblyDetails = assemblies
      .map(a => formatAssemblyForPrompt(a, deckType))
      .join("\n\n");

    const prompt = `Generate a professional roof system description for a commercial roofing bid proposal.

PROJECT TYPE: ${projectType || "New Construction"}

ASSEMBLIES:
${assemblyDetails}

For EACH assembly, write a layer-by-layer description from deck up, like an architect's detail schedule. Use this format:

RT-01: [ASSEMBLY NAME IN CAPS]
Deck → Primer → [each layer in order] → Surface
Assembly R-Value: [value if insulation provided]

Use industry-standard terminology (e.g., "fully adhered", "mechanically attached", manufacturer product naming conventions). Be concise — one line per assembly showing the full layer stack with arrows (→) between layers.

After all assemblies, add a one-line PROJECT SUMMARY that lists all systems used.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: "You are BidShield, a QA assistant for commercial roofing estimators. You have deep knowledge of commercial roof assemblies — membrane systems (TPO, EPDM, SBS, PVC, BUR), IRMA/PMR systems, insulation types (polyiso, XPS, EPS, VIP), attachment methods, vapor retarders, protection boards, drainage mats, paver systems, green roofs, and traffic coatings. Generate descriptions that match the format and terminology used in manufacturer system letters and architectural detail schedules (like Siplast, Carlisle, GAF, Firestone). Be precise about layer order — waterproofing membrane goes below insulation in IRMA/PMR assemblies, above insulation in conventional assemblies.",
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("generate-system-description error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
