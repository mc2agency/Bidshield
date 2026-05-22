"use client";
import { ValidationResult } from "@/lib/bidshield/assembly-system-configs";

interface Props {
  warnings: ValidationResult[];
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  error:   { bg: "#2d1a1a", text: "#f87171", border: "#7f1d1d", dot: "#ef4444" },
  warning: { bg: "#2d2210", text: "#fbbf24", border: "#78350f", dot: "#f59e0b" },
  info:    { bg: "var(--bs-teal-dim)", text: "var(--bs-teal)", border: "var(--bs-teal-border)", dot: "var(--bs-teal)" },
};

export function AssemblyWarningsPanel({ warnings }: Props) {
  if (!warnings.length) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {warnings.map((w, i) => {
        const s = SEVERITY_STYLES[w.severity] ?? SEVERITY_STYLES.info;
        return (
          <div
            key={i}
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
          >
            <span className="mt-0.5 w-2 h-2 flex-shrink-0 rounded-full" style={{ background: s.dot }} />
            {w.message}
          </div>
        );
      })}
    </div>
  );
}
