import { cn } from "@/lib/bidshield/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bs-btn bs-btn-primary",
  outline: "bs-btn bs-btn-outline",
  ghost: "bs-btn bs-btn-ghost-teal",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Defaults to "primary" (blue = primary action). */
  variant?: Variant;
}

/**
 * Button — wraps the token-driven `.bs-btn*` classes so every call site
 * gets the same blue=action / token-themed styling. Pass `variant` to switch.
 */
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(VARIANT_CLASS[variant], "focus-ring", className)}
      {...props}
    />
  );
}
