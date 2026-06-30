import { cn } from "@/lib/bidshield/utils";

export interface ProgressProps {
  /** 0–100. Clamped. */
  value: number;
  /** Fill color token. Defaults to readiness-aware (green/amber/red by value). */
  color?: string;
  className?: string;
  "aria-label"?: string;
}

/** Readiness-aware default fill: green = ready, amber = partial, red = low. */
function readinessColor(v: number): string {
  if (v >= 67) return "var(--pass)";
  if (v >= 34) return "var(--bs-hivis)";
  return "var(--danger)";
}

/**
 * Progress — token-themed readiness bar (`.bs-progress-*`). Without an
 * explicit color it follows the accent-discipline readiness scale.
 */
export function Progress({ value, color, className, ...aria }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("bs-progress-track", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      {...aria}
    >
      <div
        className="bs-progress-fill"
        style={{ width: `${pct}%`, background: color ?? readinessColor(pct) }}
      />
    </div>
  );
}
