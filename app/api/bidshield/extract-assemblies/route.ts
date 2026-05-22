import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_BASE64_CHARS = Math.ceil(20 * 1024 * 1024 * (4 / 3));

function validatePdfBase64(b64: string): boolean {
  return b64.startsWith("JVBE");
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
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }
    if (pdfBase64.length > MAX_BASE64_CHARS) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }
    if (!validatePdfBase64(pdfBase64)) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
    }

    const systemPrompt = `You are a commercial roofing estimating assistant. Analyze this roof plan or spec page and extract all roof assemblies.

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "assemblies": [ ... ],
  "deckType": "steel" | "concrete" | "wood" | "lightweight" | "gypsum" | "tectum" | null,
  "projectName": "string or null if not found",
  "location": "string or null if not found",
  "drawingDate": "string or null — date shown on drawing title block (YYYY-MM-DD if parseable, otherwise as-is)",
  "drawingRevision": "string or null — revision label from title block (e.g. '95% CD', 'Rev 3', '100% DD')"
}

Each assembly object must use ONLY these exact values:

system: 'tpo' | 'pvc' | 'epdm' | 'sbs' | 'app' | 'bur' | 'metal' | 'spf' | 'lam' | 'hydrotech'

Classify each assembly independently based on its OWN layer stack and drawing label — do NOT assume all assemblies use the same system.

System selection guide:
- 'tpo': TPO membrane (thermoplastic polyolefin), white/gray single-ply. Brand names: UltraPly TPO / UltraPly Platinum (Firestone/Elevate), Sure-Weld TPO / FleeceBACK TPO (Carlisle), EverGuard TPO / EverGuard Extreme TPO / EverGuard SA TPO (GAF), JM TPO (Johns Manville), Sarnafil TS 77 (Sika), VersiWeld TPO / VersiFleece TPO (Versico), TremPly TPO / TremPly Max TPO (Tremco), IKO Innovi TPO, GenFlex EZ TPO, Duro-TECH TPO (Duro-Last). Typical thickness: 45 mil, 60 mil, or 80 mil.
- 'pvc': PVC or KEE/Elvaloy membrane, white single-ply. Brand names: Sure-Flex PVC / Sure-Flex KEE HP (Carlisle), Sarnafil S 327 / Sarnafil G 410 (Sika), EverGuard PVC (GAF), VersiFlex PVC (Versico), Duro-Last PVC / Duro-Tuff (Duro-Last). KEE = Ketone Ethylene Ester (Elvaloy plasticizer). Typical thickness: 48 mil, 60 mil, 72 mil, 80 mil.
- 'epdm': EPDM rubber membrane, typically black (white variants exist). Brand names: RubberGard EPDM / RubberGard MAX / RubberGard EcoWhite (Firestone/Elevate), Sure-Seal EPDM / Sure-Tough EPDM (Carlisle), EverGuard EPDM (GAF), VersiGard EPDM (Versico), JM EPDM. "Rubber membrane" or "black membrane" in drawings → EPDM. Typical thickness: 45 mil, 60 mil, 90 mil.
- 'sbs': SBS modified bitumen — multi-ply sheet membrane. Conventional (insulation below, membrane on top) OR buried plaza/vegetated waterproofing (membrane below overburden). Brand names: Siplast — Paradiene 20/30/40 FR, Paratech, Parafor, Veral, Teranap, Irex; Soprema — SOPRALENE, ELASTOPHENE, COLPHENE, COLPLY; Johns Manville — DynaBase, DynaPly, DynaKap FR, DynaMax; Carlisle — no separate SBS brand (specify as Carlisle SBS); others: "2-ply SBS", "3-ply SBS", "Modified Bitumen Cap Sheet". Typical Siplast conventional (metal deck to top): Metal Deck → Paratherm Polyiso → Coverboard → Paradiene 20 base ply → Paradiene 30 FR finish ply. Teranap plaza: Concrete Deck → Paradiene 20 → Teranap finish ply → protection course → drainage → overburden.
- 'app': APP (atactic polypropylene) modified bitumen — torch-applied. Distinguished from SBS by explicit "APP" label or "torch-applied" in warmer-climate specs. Brand names: Armourplast APP (IKO), some Soprema torch products. If drawing says "torch-applied modified bitumen" without specifying APP or SBS, default to 'sbs'.
- 'bur': Built-Up Roofing — multiple plies of felt/bitumen. Labels: "BUR", "built-up roofing", "4-ply", "gravel-surfaced", "smooth-surfaced BUR", "hot mopped". CSI Section 07 51 00.
- 'metal': Standing seam or structural metal panel roof where the metal IS the waterproofing element. Not for metal coping, fascia, or parapet cladding.
- 'spf': Spray polyurethane foam. Always has a protective coating on top (silicone, acrylic, or urethane). Brand names: GacoRoofFoam F2733 + GacoFlex S20 silicone coating (Gaco/Holcim), NCFI EnduraTech. Labels: "SPF roofing", "spray foam", "polyurethane foam + coating". R-value ~6.5/inch.
- 'lam': Liquid-Applied Membrane — any liquid-applied waterproofing, whether conventional or IRMA/inverted. Includes: hot-fluid rubberized asphalt (Tremco TREMproof 6100 — NOT Hydrotech), cold-applied fluid membranes ("Cold Fluid Applied Waterproofing Membrane", "Cold Applied Liquid Membrane"), PMMA systems (Siplast Parapro®, Paracoat®, Terapro®; Tremco AlphaGuard PUMA), polyurethane liquid membranes (Tremco AlphaGuard BIO/MT, Neogard, Vulkem 350, BASF MasterSeal TC), self-adhered rubberized asphalt (GCP BITUTHENE HRA — in IRMA config), Soprema COLPHENE SP. Also use for generic IRMA/PRMA/inverted assemblies where no manufacturer is named and no sheet membrane is identified. Labels: "Cold Fluid Applied Waterproofing Membrane", "Liquid Membrane Cold-Applied", "IRMA Roofing Assembly", "Inverted Roof Membrane Assembly", "Green Roofing Assembly" (with fluid membrane), "PMMA", "fluid-applied membrane", "Parapro", "AlphaGuard". CRITICAL: Cold fluid membrane on concrete deck under XPS with pavers = 'lam', surface = 'pavers_pedestals'. Sloped topping concrete BELOW membrane = substrate prep (layers only). Base sheet BELOW fluid membrane = reinforcement layer (layers only). Typical cold-fluid IRMA (deck to top): Concrete Deck → Sloped Topping Concrete → Base Sheet → Cold Fluid Applied Waterproofing Membrane → Drainage Mat → XPS Insulation → Filter Fabric → Pavers on Pedestals. Typical Parapro PMMA conventional (metal deck): Metal Deck → Paratherm Polyiso → Coverboard → Pro Base TS → Pro Fleece → Parapro® PMMA Membrane.
- 'hydrotech': Hydrotech Monolithic Membrane 6125® (MM6125®) — hot-applied rubberized asphalt PMR/IRMA. Use ONLY when drawing names Hydrotech, MM6125, Sika-Hydrotech, or Monolithic Membrane 6125, OR shows Hydrotech-specific components: Hydroflex®, Hydrodrain®, Gardendrain®, Systemfilter®, LiteTop®, Ultimate Assembly®, Garden Roof® Assembly, Blue Roof Assembly. Assembly (deck to top): Concrete/Steel Deck → Surface Conditioner → MM6125 membrane → Hydroflex® protection sheet → Styrofoam™ XPS → filter fabric → overburden. Insulation = 'xps' (Styrofoam™, R-5/inch). Surface: Ultimate Assembly® = 'pavers_pedestals', Garden Roof® = 'green_roof', stone ballast / Blue Roof = 'pavers_ballast', split slab = 'concrete_topping'.

PRODUCT NAME → SYSTEM TYPE quick reference (when product appears without explicit system label):
- "UltraPly", "RubberGard", "Sure-Weld", "Sure-Seal", "Sure-Flex", "EverGuard", "Sarnafil", "VersiWeld", "VersiGard", "VersiFlex", "TremPly", "FleeceBACK" → use membrane name to determine tpo/pvc/epdm
- "SOPRALENE", "ELASTOPHENE", "COLPHENE", "COLPLY", "DynaBase", "DynaKap", "DynaPly", "Paradiene", "Paratech", "Parafor", "Veral", "Teranap" → 'sbs'
- "Armourplast" → 'app' (torch-applied APP)
- "Parapro", "Paracoat", "AlphaGuard", "TREMproof 6100", "Vulkem", "MasterSeal TC", "BITUTHENE HRA" → 'lam'
- "GacoRoofFoam", "GacoFlex" → 'spf'
- "MM6125", "Hydroflex", "Hydrodrain", "Gardendrain" → 'hydrotech'

Key distinction — conventional vs inverted/buried:
- CONVENTIONAL (sbs/tpo/pvc/epdm/bur/lam-conventional): insulation is BELOW the membrane, membrane is topmost roofing layer
- INVERTED/IRMA/BURIED (lam/hydrotech, Teranap-sbs): membrane is at the deck, insulation or overburden is ABOVE the membrane. Identifiable in section drawings by insulation appearing ABOVE the membrane callout.
- Hydroflex® = PROTECTION SHEET (not insulation, not membrane) → list in coverBoard and layers
- Hydrodrain® / Gardendrain® / Enkadrain / Miradrain = DRAINAGE COMPOSITES → layers only (not coverBoard)
- Parabase FS / Parabase Plus / DynaBase / base sheets = BASE SHEETS → layers (not primary insulation)
- Paratherm = Siplast polyiso → 'polyiso'; Insulperm = Siplast insulation board → 'polyiso' or 'rigid'
- LWIC / Insulcel / NVS Concrete / Vermiculite Concrete = lightweight insulating concrete → layers/coverBoard, NOT primary insulation

insulation: 'polyiso' | 'xps' | 'eps' | 'mineral_wool' | 'rigid' | 'vacuum' | 'none'

Insulation selection guide:
- 'polyiso': polyisocyanurate, polyiso, ISO board, or any of these brand names — ACFoam / ACFoam-II (Atlas), EnergyGuard Polyiso / EnergyGuard Ultra / EnergyGuard NH (GAF), Enrgy 3 (Johns Manville), Therm-ISO (Carlisle), ISO 95+ GL (Firestone/Elevate), IKOTherm (IKO), Sarnatherm (Sika), Rmax Thermasheath-3 (Rmax/Sika), Hunter xCI / xCI SA (Hunter Panels), Paratherm (Siplast). Foil-faced or glass-mat-faced = polyiso. Typical R-value ~6.5/inch (LTTR). Most common commercial roof insulation.
- 'xps': extruded polystyrene or any of these brand names — Styrofoam Roofmate / Styrofoam Cavitymate (Dow/DuPont — blue; the IRMA-rated XPS), FOAMULAR 150 / FOAMULAR 250 / FOAMULAR NGX 250 / FOAMULAR 400 (Owens Corning — pink), Atlas ThermalStar XPS. R-value ~5.0/inch. Required in IRMA/PMR assemblies (sits above membrane exposed to water). Drawings may just say "XPS", "extruded polystyrene", or the brand name.
- 'eps': EPS, expanded polystyrene, or Carlisle EPS, JM IsoBoard. Lower cost; less moisture resistant than XPS.
- 'mineral_wool': mineral wool, rock wool, stone wool, ROCKWOOL Rockboard 40/60, Thermafiber. Used in fire-rated assemblies.
- 'rigid': drawing says "Rigid Insulation" or "Rigid Board" without identifying type; also Insulperm (Siplast LWIC system board) when type unclear.
- 'vacuum': vacuum insulated panel (VIP). Rare.
- 'none': no insulation present.

thickness: total PRIMARY insulation thickness in inches as a number string — read directly from the drawing (e.g. "7", "3.5", "4", "2"). For multiple layers of the SAME insulation add them. Omit if not shown.

coverBoard: string — ALL non-membrane, non-primary-insulation layers listed from bottom to top, separated by ' + '. Include substrate boards below insulation AND cover boards/toppings above insulation. Always include thickness. Common cover board / substrate board names to recognize: DensDeck / DensDeck Prime / DensDeck StormX Prime (GP gypsum cover board — most common), SECUROCK Gypsum-Fiber Roof Board / SECUROCK UltraLight / SECUROCK Cement Board (USG), StructoDek HD (Blue Ridge Fiberboard), Perlite Board, Hydroflex® (Hydrotech protection sheet). Examples: '1/2" DensDeck Prime', '5/8" DensGlass Sheathing + 3" Cementitious Board', '1/4" SECUROCK + 3" Concrete Topping', '5/8" Gypsum Board + 3" Cementitious Topping', 'Hydroflex® Protection Sheet'. If only one layer, list just that. Omit field entirely if NO such layers exist.

layers: string array — every layer in the assembly stack listed from bottom (deck) to top finish, one string per layer including thickness when shown. Capture ALL layers: substrate/sheathing boards, vapor retarders, each insulation layer, cover boards, the waterproofing membrane itself, and any finish above. Label architectural elements outside roofing scope with "(arch.)". Always include this field — use an empty array [] only when no layer information is present in the drawing. Examples:
- Conventional over concrete (ROOF 06): ["5/8\" DensGlass Sheathing", "7\" Rigid Insulation", "3\" Cementitious Board", "Waterproofing Membrane (Fully Adhered)", "Aluminum Panel (arch.)"]
- Siplast Paradiene SBS conventional (metal deck): ["Metal Deck", "Paratherm Polyisocyanurate", "Coverboard", "Paradiene 20 Base Ply", "Paradiene 30 FR Finish Ply"]
- Siplast Paradiene SBS over LWIC (metal deck): ["Metal Deck", "LWIC (NVS Concrete/Insulcel)", "Insulperm Insulation Board", "Parabase FS", "Paradiene 20 Base Ply", "Paradiene 30 FR Finish Ply"]
- Siplast Teranap plaza/vegetated (buried waterproofing): ["Concrete Deck", "Paradiene 20 Base Ply", "Teranap Finish Ply", "Protection Course", "Drainage Layer", "XPS Insulation", "Filter Fabric", "Pavers / Growing Media"]
- Siplast Parapro PMMA (liquid-applied, metal deck): ["Metal Deck", "Paratherm Polyisocyanurate", "Coverboard", "Pro Base TS", "Pro Fleece", "Parapro® PMMA Roof Membrane"]
- Hydrotech PMR Ultimate Assembly: ["Concrete Deck", "Surface Conditioner", "MM6125 Membrane (215 mil)", "Hydroflex® Protection Sheet", "Styrofoam™ XPS Insulation", "Architectural Pavers on Pedestals"]
- Hydrotech Garden Roof: ["Concrete Deck", "MM6125 Membrane", "Hydroflex® Protection Sheet", "Root Stop", "Gardendrain®", "Systemfilter®", "LiteTop® Growing Media", "Vegetation"]
- Cold-fluid IRMA/PRMA with pavers (the drawings above): ["Cast-in-Place Concrete Deck", "Sloped Topping Concrete (1/8\"/ft)", "Base Sheet", "Cold Fluid Applied Waterproofing Membrane", "Drainage Mat", "7\" XPS Insulation (R-35)", "Filter Fabric", "Pavers on Pedestals"]
- Generic IRMA/inverted assembly: ["Concrete Deck", "Waterproofing Membrane (Cold-Applied)", "Drainage Mat", "3\" XPS Insulation", "Filter Fabric", "Concrete Pavers on Pedestals"]
- Simple TPO: ["Steel Deck", "3\" Polyiso Insulation", "1/2\" DensDeck Cover Board", "TPO Membrane (Mechanically Attached)"]

rValue: insulation R-value as a number if explicitly stated in the drawing (e.g. "R-39.2" → 39.2, "R-33 Min." → 33). Do NOT calculate — only extract if the drawing states it. Omit if not shown.

surface: 'exposed' | 'pavers_pedestals' | 'pavers_ballast' | 'green_roof' | 'walkpads' | 'traffic_coating' | 'aluminum_panel' | 'concrete_topping' | 'wood_tile'

Surface selection guide — CRITICAL: surface describes what lies directly on TOP of the WATERPROOFING MEMBRANE within the roofing scope. Architectural cladding or finishes that sit above the membrane (e.g., aluminum panels, metal cladding, facade elements) are NOT roofing surfaces — they are architectural elements above the roofing system. Do NOT use 'aluminum_panel' or any finish-cladding type unless the aluminum panel IS the waterproofing membrane itself (e.g., standing seam metal roof).

- 'exposed': membrane is the topmost roofing layer with nothing bonded directly to it — use this when an aluminum panel, metal cladding, or architectural finish sits ABOVE the waterproofing membrane (the membrane is "exposed" within the roofing assembly even if covered architecturally)
- 'pavers_pedestals': pavers set on pedestal supports directly on or above the membrane
- 'pavers_ballast': loose-laid ballast pavers directly on or above the membrane
- 'green_roof': vegetated/planted roof trays directly on or above the membrane
- 'walkpads': walk pad protection strips bonded to or laid on the membrane
- 'traffic_coating': epoxy/urethane traffic deck coating applied to the membrane
- 'aluminum_panel': USE ONLY when the aluminum/metal panel IS the roofing system (standing seam metal roof, metal panel roof) — NOT when aluminum cladding sits above a separate waterproofing membrane
- 'concrete_topping': concrete or cementitious topping slab poured directly on the membrane as the finish surface (common in IRMA/plaza decks and traffic-bearing assemblies)
- 'wood_tile': wood tiles or wood decking on pedestals directly on or above the membrane

Assembly type distinction for surface:
- Conventional assembly (substrate → insulation → cover board → membrane → [architectural finish above]): surface = 'exposed' unless a roofing overburden (pavers, green roof, etc.) is directly above the membrane
- IRMA/inverted assembly (membrane → drainage → XPS → filter fabric → overburden): surface = whatever overburden sits on the XPS (pavers, concrete topping, green roof, etc.)
- Standing seam / metal panel ROOF: surface = 'aluminum_panel' because the metal IS the waterproofing
- PARAPET CLADDING WARNING: Aluminum panels or metal panels on parapet faces / parapet walls are architectural cladding — they are NEVER the roofing surface. Do not let parapet finish materials influence the surface classification of the roof assembly below. Look only at what sits on TOP of the horizontal roof membrane.

attachmentMethod: 'mechanically_attached' | 'fully_adhered' | 'ballasted' | 'self_adhered' | 'hybrid' | 'unknown' — how the membrane is fastened. Look for: "mechanically attached" / "mechanically fastened" / "MA" → 'mechanically_attached'; "fully adhered" / "FA" / "adhered" → 'fully_adhered'; "ballasted" / "BA" → 'ballasted'; "self-adhered" / "self-adhesive" / "SA" / "peel-and-stick" → 'self_adhered'; "hybrid" / "induction welded" (Firestone InvisiWeld) → 'hybrid'. Use 'unknown' if not determinable.

label: use label from drawing (RT-1, RT-2, RT-01, RT-02) if shown, otherwise RT-01, RT-02, etc. Max 10 assemblies.

area: number in SF if a roof type takeoff schedule, region area, or area table is present. Include sub-areas (e.g. RT-01 and RT-01 N) as separate entries. Omit if no area data found.

uValue: thermal U-value if shown in the schedule. Omit if not found.

name: descriptive name from the schedule (e.g. "TERRACE PAVERS", "BALLAST PAVERS", "GREEN ROOF", "BULKHEAD ROOF"). Omit if not found.

deckType: Look for deck type info in detail drawings — concrete slab, steel deck, wood, etc. Use the standardized values above. Set to null if not identifiable.

projectName: If a title block shows a building/project name, extract it. Set to null if not found.

location: If a title block shows an address or location, extract it. Set to null if not found.

drawingDate: If a title block, stamp, or revision block shows a drawing date or issue date, extract it. Format as YYYY-MM-DD if the date is parseable, otherwise return as-is (e.g. "03/15/2026"). Set to null if not found.

drawingRevision: If a title block or revision block shows a revision label or phase designation, extract it (e.g. "95% CD", "100% DD", "Rev 3", "Issued for Construction"). Set to null if not found.

IMPORTANT: If the drawing contains a roof type takeoff schedule with area data, extract EVERY row including sub-areas (e.g. RT-01, RT-01 N as separate entries). Preserve the exact labels from the schedule.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let message: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      message = await client.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3072,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } } as any,
                { type: "text", text: "Extract all roof assemblies from this drawing." },
              ],
            },
          ],
        },
        { signal: controller.signal },
      );
    } finally {
      clearTimeout(timeout);
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let data: any;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr: any) {
      console.error("[extract-assemblies-parse-error]", {
        rawResponse: cleaned?.substring(0, 500),
        parseError: parseErr?.message,
        userId,
      });
      return NextResponse.json(
        { error: "Could not extract assemblies from this PDF" },
        { status: 422 },
      );
    }

    const AssemblyItemSchema = z.object({
      label: z.string().default(""),
      system: z.string().default("tpo"),
      insulation: z.string().nullable().optional(),
      thickness: z.string().nullable().optional(),
      rValue: z.number().nullable().optional(),
      surface: z.string().nullable().optional(),
      attachmentMethod: z.string().nullable().optional(),
      area: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      coverBoard: z.string().nullable().optional(),
      deckType: z.string().nullable().optional(),
      layers: z.array(z.string()).nullable().optional(),
    });
    const AssembliesResultSchema = z.object({
      assemblies: z.array(AssemblyItemSchema).default([]),
      deckType: z.string().nullable().optional(),
      projectName: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      drawingDate: z.string().nullable().optional(),
      drawingRevision: z.string().nullable().optional(),
    });

    // Normalise array format to object format before validating
    const normalised = Array.isArray(data) ? { assemblies: data } : data;
    const validated = AssembliesResultSchema.safeParse(normalised);
    if (!validated.success) {
      console.error("[ai-shape-error]", { endpoint: "extract-assemblies", issues: validated.error.issues });
      return NextResponse.json({ error: "AI returned an unexpected response shape — please try again." }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("extract-assemblies error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
