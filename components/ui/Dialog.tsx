"use client";

import { cn } from "@/lib/bidshield/utils";
import { useEffect, type ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Footer actions (e.g. outline + primary buttons). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Dialog — the repeated fixed-overlay modal pattern. Closes on Escape and
 * backdrop click; centers a token-themed card with optional title/footer.
 */
export function Dialog({ open, onClose, title, children, footer, className }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn("bs-metric-card relative w-full max-w-lg", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title != null && (
          <div className="bs-metric-value mb-3" style={{ fontSize: "var(--bs-font-size-xl)" }}>
            {title}
          </div>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="bs-btn bs-btn-outline focus-ring absolute right-3 top-3"
        >
          ✕
        </button>
        <div>{children}</div>
        {footer != null && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
