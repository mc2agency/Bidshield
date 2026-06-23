import { cn } from "@/lib/bidshield/utils";
import type { HTMLAttributes, ReactNode } from "react";

/** hivis = warning (safety amber) · danger = blocker · redline = "gap caught" */
type Tone = "hivis" | "warning" | "danger" | "redline";

const TONE_CLASS: Record<Tone, string> = {
  hivis: "bs-alert bs-alert-hivis",
  warning: "bs-alert bs-alert-hivis",
  danger: "bs-alert bs-alert-danger",
  redline: "bs-redline",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  icon?: ReactNode;
}

/**
 * Alert — inline status banner. `redline` renders the mono "gap caught"
 * callout (the BidShield signature); other tones use the `.bs-alert` surface.
 */
export function Alert({ tone = "hivis", icon, className, children, ...props }: AlertProps) {
  return (
    <div className={cn(TONE_CLASS[tone], "rounded-lg", className)} {...props}>
      {icon}
      <div>{children}</div>
    </div>
  );
}
