"use client";

import { useEffect, useState } from "react";

// Roof insulation thickness is mostly 2"/3"/4"/6"/8" but real specs
// routinely call out 1.5", 5", 7", 7.5" etc. The old chip-only selector
// couldn't represent those, so we pair quick-pick chips with a numeric
// input that accepts any 0.5" increment from 1 to 12.

const QUICK_PICKS = ["2", "3", "4", "6", "8"];
const MIN = 1;
const MAX = 12;
const STEP = 0.5;

function clamp(n: number): number {
  if (!Number.isFinite(n)) return MIN;
  return Math.min(MAX, Math.max(MIN, Math.round(n / STEP) * STEP));
}

export function ThicknessInput({
  value,
  onChange,
  compact,
}: {
  value: string; // "3", "1.5", "" etc. Stored without trailing quote.
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const [text, setText] = useState(value);

  useEffect(() => { setText(value); }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) {
      setText(value);
      return;
    }
    const clamped = clamp(n);
    const out = String(clamped);
    setText(out);
    if (out !== value) onChange(out);
  };

  const pickedChipActive = QUICK_PICKS.includes(value);

  return (
    <div className={compact ? "flex items-center gap-1.5" : "flex flex-col gap-2"}>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PICKS.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setText(t); onChange(t); }}
              className="py-1 px-2.5 rounded text-xs transition-all"
              style={active
                ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
            >
              {t}&quot;
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>{compact ? "" : "or"}</span>
        <input
          type="number"
          step={STEP}
          min={MIN}
          max={MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); } }}
          placeholder="7.5"
          className="text-xs rounded"
          style={{
            width: 60,
            padding: "4px 6px",
            background: "var(--bs-bg-card)",
            border: !pickedChipActive && value ? "1px solid var(--bs-teal)" : "1px solid var(--bs-border)",
            color: "var(--bs-text-primary)",
            outline: "none",
          }}
        />
        <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>&quot;</span>
      </div>
    </div>
  );
}
