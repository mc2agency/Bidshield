import { cn } from "@/lib/bidshield/utils";
import type { HTMLAttributes } from "react";

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  /** Token color for text/border; defaults to neutral. */
  color?: string;
}

/**
 * Pill — small rounded label (roof system types, revision #, counts).
 * Pass a categorical token (e.g. "var(--cat-teal)") to color it.
 */
export function Pill({ color, className, style, ...props }: PillProps) {
  if (!color) {
    return <span className={cn("bs-pill bs-pill-neutral", className)} style={style} {...props} />;
  }
  return (
    <span
      className={cn("bs-pill", className)}
      style={{ color, background: "color-mix(in srgb, currentColor 14%, transparent)", ...style }}
      {...props}
    />
  );
}
