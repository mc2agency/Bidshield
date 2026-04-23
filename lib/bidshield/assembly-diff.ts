// Diff utilities for Setup "Extract from plan PDF" and "Merge takeoff PDF"
// flows. Both flows show a preview modal before writing to the project, so
// we compute what changed up-front and let the estimator confirm.

import type { ClassifiedAssembly, ConsolidatedTakeoffRow } from "./assembly-classifier";
import { computeInsulationRValue } from "./insulation-data";

// A roof assembly as stored on the Convex project record.
export interface SetupAssembly {
  label: string;
  name?: string;
  systemType?: string;
  insulationType?: string;
  insulationThickness?: string;
  rValue?: number | null;
  surfaceType?: string;
  area?: number | null;
  uValue?: number | null;
}

export type DiffOp = "new" | "changed" | "unchanged" | "missing";

export interface FieldChange {
  field: string;
  from: unknown;
  to: unknown;
}

export interface PlanDiffRow {
  op: DiffOp;
  tag: string;
  name: string;
  extracted?: SetupAssembly; // the candidate to upsert (for new/changed)
  current?: SetupAssembly;   // the existing Setup row (for changed/missing)
  changes: FieldChange[];    // empty for new/missing/unchanged
}

export interface PlanDiff {
  rows: PlanDiffRow[];         // NEW + CHANGED + UNCHANGED + IN-SETUP-NOT-IN-PLAN
  dropped: ClassifiedAssembly[]; // category === "dropped" (soffit, waterproofing)
  applyCount: number;          // NEW + CHANGED
}

// Normalize thickness strings: "7\"" → "7", "1.5in" → "1.5"
function normThickness(v: unknown): string {
  if (v == null) return "";
  return String(v).replace(/"/g, "").replace(/in$/i, "").trim();
}

function mapExtractedToSetup(a: ClassifiedAssembly): SetupAssembly {
  const thickness = normThickness(a.thickness);
  const systemType = (a.inferredSystem || a.system || "") as string;
  const insulationType = (a.insulation || "") as string;
  let rValue: number | null = null;
  const rawR = (a as any).rValue;
  if (typeof rawR === "number") rValue = rawR;
  else if (typeof rawR === "string") {
    const parsed = parseFloat(rawR);
    if (Number.isFinite(parsed)) rValue = parsed;
  }
  if (rValue == null && insulationType && thickness) {
    const computed = computeInsulationRValue(insulationType, parseFloat(thickness));
    if (computed > 0) rValue = computed;
  }
  return {
    label: (a.label || "").toUpperCase(),
    name: (a.name as string) || undefined,
    systemType,
    insulationType,
    insulationThickness: thickness,
    rValue,
    surfaceType: (a.surface as string) || "",
    area: typeof a.area === "number" ? a.area : null,
    uValue: typeof (a as any).uValue === "number" ? (a as any).uValue : null,
  };
}

const COMPARABLE_FIELDS: Array<keyof SetupAssembly> = [
  "systemType",
  "insulationType",
  "insulationThickness",
  "rValue",
  "surfaceType",
];

function diffFields(current: SetupAssembly, next: SetupAssembly): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const f of COMPARABLE_FIELDS) {
    const a = current[f];
    const b = next[f];
    // Only count as change when next has a real value and it differs.
    if (b == null || b === "") continue;
    if (a == null || a === "") {
      changes.push({ field: f as string, from: a ?? null, to: b });
      continue;
    }
    if (String(a) !== String(b)) {
      changes.push({ field: f as string, from: a, to: b });
    }
  }
  return changes;
}

export function computePlanDiff(
  current: SetupAssembly[],
  extracted: ClassifiedAssembly[],
): PlanDiff {
  const dropped = extracted.filter((a) => a.category === "dropped");
  const keepable = extracted.filter((a) => a.category !== "dropped");

  const byLabel = new Map<string, SetupAssembly>();
  for (const c of current) byLabel.set((c.label || "").toUpperCase(), c);

  const extractedLabels = new Set<string>();
  const rows: PlanDiffRow[] = [];

  for (const e of keepable) {
    const mapped = mapExtractedToSetup(e);
    const label = mapped.label;
    if (!label) continue;
    extractedLabels.add(label);
    const existing = byLabel.get(label);
    if (!existing) {
      rows.push({
        op: "new",
        tag: label,
        name: mapped.name || "",
        extracted: mapped,
        changes: [],
      });
      continue;
    }
    const changes = diffFields(existing, mapped);
    if (changes.length === 0) {
      rows.push({
        op: "unchanged",
        tag: label,
        name: mapped.name || existing.name || "",
        current: existing,
        extracted: mapped,
        changes: [],
      });
    } else {
      rows.push({
        op: "changed",
        tag: label,
        name: mapped.name || existing.name || "",
        current: existing,
        extracted: { ...existing, ...mapped }, // merge: existing values preserved where new is empty
        changes,
      });
    }
  }

  // Rows in Setup that the plan didn't return — shown for transparency, never deleted.
  for (const c of current) {
    const label = (c.label || "").toUpperCase();
    if (!extractedLabels.has(label)) {
      rows.push({ op: "missing", tag: label, name: c.name || "", current: c, changes: [] });
    }
  }

  const applyCount = rows.filter((r) => r.op === "new" || r.op === "changed").length;
  return { rows, dropped, applyCount };
}

// ─────────────────────────────────────────────────────────────────
// Takeoff diff (area-only)
// ─────────────────────────────────────────────────────────────────

export interface TakeoffDiffRow {
  op: "changed" | "unchanged" | "unmatched";
  tag: string;
  currentArea: number | null;
  newArea: number;
  subAreas: Array<{ label: string; area: number }>;
}

export interface TakeoffDiff {
  rows: TakeoffDiffRow[];
  totalArea: number;
  applyCount: number; // number of rows that will actually change
}

export function computeTakeoffDiff(
  current: SetupAssembly[],
  consolidated: ConsolidatedTakeoffRow[],
): TakeoffDiff {
  const byLabel = new Map<string, SetupAssembly>();
  for (const c of current) byLabel.set((c.label || "").toUpperCase(), c);

  const rows: TakeoffDiffRow[] = [];
  let totalArea = 0;

  for (const r of consolidated) {
    const label = r.tag.toUpperCase();
    totalArea += r.area;
    const existing = byLabel.get(label);
    const existingArea = existing?.area ?? null;
    // Treat differences under 1 SF as noise (rounding across sub-areas).
    const isChange = existing && Math.abs((existing.area ?? 0) - r.area) >= 1;
    if (!existing) {
      rows.push({ op: "unmatched", tag: label, currentArea: null, newArea: r.area, subAreas: r.subAreas });
    } else if (isChange) {
      rows.push({ op: "changed", tag: label, currentArea: existingArea, newArea: r.area, subAreas: r.subAreas });
    } else {
      rows.push({ op: "unchanged", tag: label, currentArea: existingArea, newArea: r.area, subAreas: r.subAreas });
    }
  }

  const applyCount = rows.filter((r) => r.op === "changed").length;
  return { rows, totalArea, applyCount };
}

// Apply helpers — produce the next assemblies array without mutating input.

export function applyPlanDiff(
  current: SetupAssembly[],
  diff: PlanDiff,
): SetupAssembly[] {
  const byLabel = new Map<string, SetupAssembly>();
  for (const c of current) byLabel.set((c.label || "").toUpperCase(), c);

  for (const row of diff.rows) {
    if (row.op === "new" && row.extracted) {
      byLabel.set(row.tag, row.extracted);
    } else if (row.op === "changed" && row.extracted) {
      byLabel.set(row.tag, row.extracted);
    }
    // unchanged / missing: leave as-is
  }
  // Preserve insertion order — use the current order, append new tags at the end.
  const out: SetupAssembly[] = [];
  const seen = new Set<string>();
  for (const c of current) {
    const label = (c.label || "").toUpperCase();
    const next = byLabel.get(label);
    if (next) { out.push(next); seen.add(label); }
  }
  for (const [label, a] of byLabel.entries()) {
    if (!seen.has(label)) out.push(a);
  }
  return out;
}

export function applyTakeoffDiff(
  current: SetupAssembly[],
  diff: TakeoffDiff,
  addUnmatched: Set<string>,
): SetupAssembly[] {
  const byLabel = new Map<string, SetupAssembly>();
  for (const c of current) byLabel.set((c.label || "").toUpperCase(), c);

  for (const row of diff.rows) {
    if (row.op === "changed") {
      const existing = byLabel.get(row.tag);
      if (existing) byLabel.set(row.tag, { ...existing, area: row.newArea });
    } else if (row.op === "unmatched" && addUnmatched.has(row.tag)) {
      byLabel.set(row.tag, { label: row.tag, area: row.newArea });
    }
  }

  const out: SetupAssembly[] = [];
  const seen = new Set<string>();
  for (const c of current) {
    const label = (c.label || "").toUpperCase();
    const next = byLabel.get(label);
    if (next) { out.push(next); seen.add(label); }
  }
  for (const [label, a] of byLabel.entries()) {
    if (!seen.has(label)) out.push(a);
  }
  return out;
}
