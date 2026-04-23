"use client";

import type { PlanDiff, PlanDiffRow, FieldChange, TakeoffDiff, TakeoffDiffRow } from "@/lib/bidshield/assembly-diff";

// Presentation-only shared shell used by both the plan-extract and takeoff-merge
// diff modals. Handles the dimmed backdrop, scroll lock, and close button.

export function DiffModalShell({
  title,
  subtitle,
  onClose,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl overflow-hidden flex flex-col"
        style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--bs-text-primary)" }}>{title}</h3>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-sm cursor-pointer" style={{ color: "var(--bs-text-dim)", background: "none", border: "none" }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: "1px solid var(--bs-border)" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Plan extraction diff (Change 3a)
// ─────────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  systemType: "system",
  insulationType: "insulation",
  insulationThickness: "thickness",
  rValue: "R-value",
  surfaceType: "surface",
};

function formatFieldValue(field: string, v: unknown): string {
  if (v == null || v === "") return "—";
  if (field === "insulationThickness") return `${v}"`;
  if (field === "rValue" && typeof v === "number") return `R-${v.toFixed(2)}`;
  if (typeof v === "string") return v;
  return String(v);
}

function ChangeList({ changes }: { changes: FieldChange[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      {changes.map((c, i) => (
        <div key={i} className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
          <span style={{ color: "var(--bs-text-dim)" }}>{FIELD_LABELS[c.field] || c.field}:</span>{" "}
          <span style={{ textDecoration: "line-through" }}>{formatFieldValue(c.field, c.from)}</span>
          {" → "}
          <span style={{ color: "var(--bs-teal)" }}>{formatFieldValue(c.field, c.to)}</span>
        </div>
      ))}
    </div>
  );
}

export function PlanDiffModal({
  filename,
  diff,
  onCancel,
  onApply,
  applying,
}: {
  filename: string;
  diff: PlanDiff;
  onCancel: () => void;
  onApply: () => void;
  applying: boolean;
}) {
  const newRows = diff.rows.filter((r) => r.op === "new");
  const changedRows = diff.rows.filter((r) => r.op === "changed");
  const unchangedRows = diff.rows.filter((r) => r.op === "unchanged");
  const missingRows = diff.rows.filter((r) => r.op === "missing");

  const sectionHeader = (label: string, count: number) => (
    <div className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-1.5" style={{ color: "var(--bs-text-dim)" }}>
      {label} {count > 0 && <span style={{ color: "var(--bs-text-muted)" }}>({count})</span>}
    </div>
  );

  return (
    <DiffModalShell
      title={`Re-extract roof assemblies`}
      subtitle={filename ? `from ${filename}` : undefined}
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel} disabled={applying} className="text-xs px-4 py-2 rounded-md" style={{ color: "var(--bs-text-muted)", background: "transparent", border: "1px solid var(--bs-border)", cursor: applying ? "not-allowed" : "pointer" }}>Cancel</button>
          <button onClick={onApply} disabled={applying || diff.applyCount === 0} className="text-xs font-semibold px-4 py-2 rounded-md" style={{ background: "var(--bs-teal)", color: "#13151a", border: "none", cursor: applying || diff.applyCount === 0 ? "not-allowed" : "pointer", opacity: applying || diff.applyCount === 0 ? 0.5 : 1 }}>
            {applying ? "Applying…" : diff.applyCount === 0 ? "No changes to apply" : `Apply ${diff.applyCount} change${diff.applyCount === 1 ? "" : "s"}`}
          </button>
        </>
      }
    >
      {newRows.length > 0 && (
        <>
          {sectionHeader("New (would be added)", newRows.length)}
          {newRows.map((r) => (
            <div key={r.tag} className="flex items-start gap-3 py-1.5" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <span className="text-[11px] font-bold shrink-0" style={{ color: "var(--bs-teal)", minWidth: 52 }}>+ {r.tag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs" style={{ color: "var(--bs-text-primary)" }}>{r.name || "—"}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                  {[r.extracted?.systemType, r.extracted?.insulationType, r.extracted?.insulationThickness && `${r.extracted.insulationThickness}"`, r.extracted?.rValue != null && `R-${Number(r.extracted.rValue).toFixed(2)}`].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {changedRows.length > 0 && (
        <>
          {sectionHeader("Changed (would update existing)", changedRows.length)}
          {changedRows.map((r) => (
            <div key={r.tag} className="flex items-start gap-3 py-1.5" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <span className="text-[11px] font-bold shrink-0" style={{ color: "var(--bs-amber)", minWidth: 52 }}>~ {r.tag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs" style={{ color: "var(--bs-text-primary)" }}>{r.name || "—"}</div>
                <ChangeList changes={r.changes} />
              </div>
            </div>
          ))}
        </>
      )}

      {unchangedRows.length > 0 && (
        <>
          {sectionHeader("Unchanged", unchangedRows.length)}
          {unchangedRows.map((r) => (
            <div key={r.tag} className="flex items-center gap-3 py-1" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <span className="text-[11px] shrink-0" style={{ color: "var(--bs-text-dim)", minWidth: 52 }}>{r.tag}</span>
              <span className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>{r.name || "—"}</span>
            </div>
          ))}
        </>
      )}

      {missingRows.length > 0 && (
        <>
          {sectionHeader("In Setup, not in plan (never deleted)", missingRows.length)}
          <p className="text-[11px] mb-1" style={{ color: "var(--bs-text-dim)" }}>
            These rows exist in your current Setup but weren&apos;t in this plan. We never delete — you may have added them manually.
          </p>
          {missingRows.map((r) => (
            <div key={r.tag} className="flex items-center gap-3 py-1" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <span className="text-[11px] shrink-0" style={{ color: "var(--bs-text-dim)", minWidth: 52 }}>{r.tag}</span>
              <span className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>{r.name || "—"}</span>
            </div>
          ))}
        </>
      )}

      {diff.dropped.length > 0 && (
        <>
          {sectionHeader("Dropped — not roofing (auto-filtered)", diff.dropped.length)}
          {diff.dropped.map((d, i) => (
            <div key={`${d.label}-${i}`} className="flex items-center gap-3 py-1" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <span className="text-[11px] shrink-0" style={{ color: "var(--bs-text-dim)", minWidth: 52 }}>- {d.label || "—"}</span>
              <span className="flex-1 text-[11px]" style={{ color: "var(--bs-text-muted)" }}>{d.name || "—"}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-dim)" }}>{d.dropReason || "other"}</span>
            </div>
          ))}
        </>
      )}

      {diff.rows.length === 0 && diff.dropped.length === 0 && (
        <p className="text-xs text-center py-6" style={{ color: "var(--bs-text-muted)" }}>
          The plan extraction returned no assemblies.
        </p>
      )}
    </DiffModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// Takeoff merge diff (Change 3b)
// ─────────────────────────────────────────────────────────────────

function formatSF(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${Math.round(n).toLocaleString()} SF`;
}

export function TakeoffDiffModal({
  filename,
  diff,
  addUnmatched,
  onToggleUnmatched,
  onCancel,
  onApply,
  applying,
}: {
  filename: string;
  diff: TakeoffDiff;
  addUnmatched: Set<string>;
  onToggleUnmatched: (tag: string) => void;
  onCancel: () => void;
  onApply: () => void;
  applying: boolean;
}) {
  const changedRows = diff.rows.filter((r) => r.op === "changed");
  const unchangedRows = diff.rows.filter((r) => r.op === "unchanged");
  const unmatchedRows = diff.rows.filter((r) => r.op === "unmatched");
  const totalApply = diff.applyCount + addUnmatched.size;

  const sectionHeader = (label: string, count: number) => (
    <div className="text-[10px] font-semibold uppercase tracking-wider mt-3 mb-1.5" style={{ color: "var(--bs-text-dim)" }}>
      {label} {count > 0 && <span style={{ color: "var(--bs-text-muted)" }}>({count})</span>}
    </div>
  );

  const row = (r: TakeoffDiffRow) => (
    <div key={r.tag} className="flex items-start gap-3 py-1.5" style={{ borderBottom: "1px solid var(--bs-border)" }}>
      <span className="text-[11px] font-bold shrink-0" style={{ color: r.op === "changed" ? "var(--bs-amber)" : r.op === "unmatched" ? "var(--bs-blue)" : "var(--bs-text-dim)", minWidth: 52 }}>
        {r.op === "unmatched" ? "+ " : "~ "}{r.tag}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
          {r.op === "unmatched" ? (
            <>new — {formatSF(r.newArea)}</>
          ) : (
            <>
              {formatSF(r.currentArea)} → <span style={{ color: r.op === "changed" ? "var(--bs-teal)" : "var(--bs-text-muted)" }}>{formatSF(r.newArea)}</span>
              {r.op === "unchanged" && <span style={{ color: "var(--bs-text-dim)" }}> (no change)</span>}
            </>
          )}
        </div>
        {r.subAreas.length > 1 && (
          <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
            {r.subAreas.map((s) => `${s.label} ${formatSF(s.area)}`).join(" + ")}
          </div>
        )}
      </div>
      {r.op === "unmatched" && (
        <button
          onClick={() => onToggleUnmatched(r.tag)}
          className="text-[11px] px-2 py-1 rounded"
          style={addUnmatched.has(r.tag)
            ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }
            : { background: "transparent", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
        >
          {addUnmatched.has(r.tag) ? "✓ Add" : "+ Add"}
        </button>
      )}
    </div>
  );

  return (
    <DiffModalShell
      title="Merge takeoff areas"
      subtitle={filename ? `from ${filename}` : undefined}
      onClose={onCancel}
      footer={
        <>
          <span className="text-xs mr-auto" style={{ color: "var(--bs-text-muted)" }}>Total: {formatSF(diff.totalArea)}</span>
          <button onClick={onCancel} disabled={applying} className="text-xs px-4 py-2 rounded-md" style={{ color: "var(--bs-text-muted)", background: "transparent", border: "1px solid var(--bs-border)", cursor: applying ? "not-allowed" : "pointer" }}>Cancel</button>
          <button onClick={onApply} disabled={applying} className="text-xs font-semibold px-4 py-2 rounded-md" style={{ background: "var(--bs-teal)", color: "#13151a", border: "none", cursor: applying ? "not-allowed" : "pointer", opacity: applying ? 0.5 : 1 }}>
            {applying ? "Applying…" : totalApply === 0 ? "Apply" : `Apply (${totalApply})`}
          </button>
        </>
      }
    >
      {changedRows.length > 0 && (
        <>
          {sectionHeader("Changed", changedRows.length)}
          {changedRows.map(row)}
        </>
      )}
      {unchangedRows.length > 0 && (
        <>
          {sectionHeader("Unchanged", unchangedRows.length)}
          {unchangedRows.map(row)}
        </>
      )}
      {unmatchedRows.length > 0 && (
        <>
          {sectionHeader("Unmatched (in takeoff, not in Setup)", unmatchedRows.length)}
          {unmatchedRows.map(row)}
        </>
      )}
      {diff.rows.length === 0 && (
        <p className="text-xs text-center py-6" style={{ color: "var(--bs-text-muted)" }}>
          The takeoff extraction returned no ROOF rows.
        </p>
      )}
    </DiffModalShell>
  );
}
