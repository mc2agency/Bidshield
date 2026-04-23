// Title-driven roof-assembly classification and system inference.
//
// The extract-assemblies model returns every detail it finds on a drawing
// — roof types, slab-on-grade waterproofing, soffits, canopies. We don't
// trust the model to distinguish these; we run a deterministic second pass
// on its output. Tag prefix is informational only (RT-06 on Arverne is
// "SLAB ON GRADE" despite the RT prefix).

export type AssemblyCategory = "roofing" | "uncertain" | "dropped";
export type DropReason = "soffit" | "waterproofing" | null;

export interface RawAssembly {
  label?: string | null;
  name?: string | null;
  system?: string | null;
  insulation?: string | null;
  thickness?: string | null;
  surface?: string | null;
  area?: number | null;
  deckType?: string | null;
  facadeLocation?: string | null;
  uValue?: number | null;
  rValue?: number | null;
  [k: string]: unknown;
}

export interface ClassifiedAssembly extends RawAssembly {
  category: AssemblyCategory;
  dropReason: DropReason;
  inferredSystem: string | null;
}

// Inferred system is returned as the lowercase ID used by the
// `bidshield_projects.roofAssemblies.systemType` Convex column and the
// wizard's `SYSTEMS` array:
//   tpo | pvc | epdm | sbs | app | bur | metal | spf | hydrotech
export function inferSystemFromTitle(title: string, layers?: Array<{ name?: string | null }>): string | null {
  const T = (title || "").toUpperCase();
  if (!T) return null;

  if (/\bEPDM\b/.test(T)) return "epdm";
  if (/\bTPO\b/.test(T)) return "tpo";
  if (/\bPVC\b/.test(T)) return "pvc";
  // IRMA / protected-membrane systems are almost always SBS-based.
  if (/\b(IRMA|PROTECTED MEMBRANE)\b/.test(T)) return "sbs";
  if (/\bSBS\b/.test(T)) return "sbs";
  if (/\bMODIFIED BITUMEN\b/.test(T) && !/\bAPP\b/.test(T)) return "sbs";
  if (/\bAPP\b/.test(T)) return "app";
  if (/\b(SPRAY|SPF)\b/.test(T)) return "spf";
  // BUR matches only when not also EPDM (built-up EPDM is a real thing on
  // Arverne-style bulkheads and should classify as EPDM, not BUR).
  if (/\b(BUR|BUILT[- ]UP)\b/.test(T) && !/\bEPDM\b/.test(T)) return "bur";

  // Green roofs are a surface treatment; the underlying waterproofing is
  // what matters. Look into the layer stack if it was provided.
  if (/\bGREEN ROOF\b/.test(T) && layers) {
    for (const l of layers) {
      const n = (l?.name || "").toUpperCase();
      if (/\b(MODIFIED BITUMEN|SBS)\b/.test(n)) return "sbs";
    }
    return null;
  }

  return null;
}

export function classifyAssembly(raw: RawAssembly): ClassifiedAssembly {
  const title = `${raw.label || ""} ${raw.name || ""}`.toUpperCase();

  const isRoof = /\bROOF\b/.test(title);
  const isSoffit = /\bSOFFIT\b/.test(title);
  const isWaterproofing =
    /\b(SLAB ON GRADE|UNDERSLAB|UNDER[- ]SLAB|BELOW GRADE|WATERPROOFING)\b/.test(title);

  let category: AssemblyCategory;
  let dropReason: DropReason = null;

  if (isRoof && !isSoffit) {
    category = "roofing";
  } else if (isSoffit) {
    category = "dropped";
    dropReason = "soffit";
  } else if (isWaterproofing && !isRoof) {
    category = "dropped";
    dropReason = "waterproofing";
  } else {
    category = "uncertain";
  }

  const inferredSystem = category === "dropped"
    ? null
    : inferSystemFromTitle(raw.name || raw.label || "");

  return { ...raw, category, dropReason, inferredSystem };
}

// Base-tag extraction for EN-sheet consolidation. "RT-01", "RT-01 N",
// "RT-01 TERRACE PAVERS" all collapse to "RT-01".
export function extractBaseTag(label: string): string | null {
  const m = label.match(/^(RT-\d+)\b/i);
  return m ? m[1].toUpperCase() : null;
}

export interface ConsolidatedTakeoffRow {
  tag: string;
  area: number;
  uValue: number | null;
  subAreas: Array<{ label: string; area: number }>;
}

export function consolidateTakeoffRows(
  rows: RawAssembly[],
): ConsolidatedTakeoffRow[] {
  const byTag = new Map<string, ConsolidatedTakeoffRow>();

  for (const r of rows) {
    const label = r.label || r.name || "";
    const base = extractBaseTag(label);
    if (!base) continue;
    const area = typeof r.area === "number" ? r.area : 0;
    const uValue = typeof (r as any).uValue === "number" ? (r as any).uValue : null;

    let entry = byTag.get(base);
    if (!entry) {
      entry = { tag: base, area: 0, uValue: null, subAreas: [] };
      byTag.set(base, entry);
    }
    entry.area += area;
    if (uValue != null && (entry.uValue == null || uValue > entry.uValue)) {
      entry.uValue = uValue;
    }
    entry.subAreas.push({
      label: r.name || label,
      area,
    });
  }

  return Array.from(byTag.values());
}

// ROOF-only filter. Takeoff sheets often include WALL / FACADE / SOFFIT
// sections we must never ingest as roof assemblies. The model should
// populate facadeLocation; if it doesn't, fall back to the classifier.
export function isRoofRow(raw: RawAssembly): boolean {
  const loc = (raw.facadeLocation || "").toUpperCase();
  if (loc === "ROOF") return true;
  if (loc && loc !== "ROOF") return false;
  const classified = classifyAssembly(raw);
  return classified.category === "roofing";
}
