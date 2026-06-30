import { cn } from "@/lib/bidshield/utils";
import { Card } from "./Card";
import type { ReactNode } from "react";

export interface StatProps {
  label: string;
  value: ReactNode;
  /** Optional helper line under the value (e.g. a mono dimension annotation). */
  hint?: ReactNode;
  /** Left accent stripe color token, e.g. "var(--bs-teal)". */
  accent?: string;
  /** Render the value with the tabular mono face (takeoff-sheet feel). */
  mono?: boolean;
  className?: string;
}

/**
 * Stat — the repeated metric card (left accent stripe + label + big number).
 * Numerics read as mono by default to match the takeoff aesthetic.
 */
export function Stat({ label, value, hint, accent, mono = true, className }: StatProps) {
  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      <div className="bs-metric-label">{label}</div>
      <div className={cn("bs-metric-value", mono && "bs-num")}>{value}</div>
      {hint != null && <div className="bs-annotation mt-1">{hint}</div>}
    </Card>
  );
}
