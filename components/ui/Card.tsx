import { cn } from "@/lib/bidshield/utils";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the faint drafting-grid backdrop (blueprint signature). */
  blueprint?: boolean;
}

/**
 * Card — the standard token-themed surface (`.bs-metric-card`).
 * Set `blueprint` to overlay the drafting-grid motif on hero/feature cards.
 */
export function Card({ blueprint = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn("bs-metric-card", blueprint && "bs-blueprint-grid", className)}
      {...props}
    />
  );
}
