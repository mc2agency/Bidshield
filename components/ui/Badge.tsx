import { cn } from "@/lib/bidshield/utils";
import type { HTMLAttributes } from "react";

/**
 * Badge tone follows the BidShield accent discipline:
 *  success = pass/ready (green) · hivis = warning (safety amber)
 *  danger = blocker · info = neutral info (blue)
 */
type Tone = "success" | "hivis" | "warning" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  success: "bs-badge-success",
  hivis: "bs-badge-hivis",
  // `warning` kept as an alias of the canonical hi-vis warning surface
  warning: "bs-badge-hivis",
  danger: "bs-badge-danger",
  info: "bs-badge-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "info", className, ...props }: BadgeProps) {
  return <span className={cn("bs-badge", TONE_CLASS[tone], className)} {...props} />;
}
