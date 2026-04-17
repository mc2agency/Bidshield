"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";

interface ProGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  "AI labor analysis & verification",
  "PDF quote & price sheet extraction",
  "Automated addenda impact review",
] as const;

export default function ProGateModal({ isOpen, onClose }: ProGateModalProps) {
  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Keyframes injected once via a <style> tag */}
      <style>{`
        @keyframes progate-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes progate-card-in {
          from {
            opacity: 0;
            transform: scale(0.93) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "progate-backdrop-in 0.18s ease forwards",
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="progate-headline"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "var(--bs-bg-card, #22252d)",
            border: "1px solid var(--bs-border, rgba(255,255,255,0.08))",
            borderRadius: "1.25rem",
            padding: "2.25rem 2rem 2rem",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,168,0.08)",
            animation: "progate-card-in 0.22s cubic-bezier(0.34,1.2,0.64,1) forwards",
            pointerEvents: "auto",
          }}
        >
          {/* Lock icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "50%",
              background: "var(--bs-bg-elevated, #2a2d36)",
              border: "1px solid rgba(45,212,168,0.2)",
              fontSize: "1.5rem",
              marginBottom: "1.25rem",
            }}
          >
            🔒
          </div>

          {/* Headline */}
          <h2
            id="progate-headline"
            style={{
              color: "var(--bs-text-primary, #ffffff)",
              fontSize: "1.5rem",
              fontWeight: 800,
              margin: "0 0 0.5rem",
              lineHeight: 1.2,
            }}
          >
            Unlock AI Features
          </h2>

          {/* Subtext */}
          <p
            style={{
              color: "var(--bs-text-muted, #9ca0ab)",
              fontSize: "0.9375rem",
              margin: "0 0 1.5rem",
              lineHeight: 1.55,
            }}
          >
            This feature is included with BidShield Pro.
          </p>

          {/* Feature list */}
          <ul
            style={{
              listStyle: "none",
              margin: "0 0 1.75rem",
              padding: 0,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {FEATURES.map((feat) => (
              <li
                key={feat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  color: "var(--bs-text-secondary, #e8e9ec)",
                  fontSize: "0.9rem",
                  background: "var(--bs-bg-elevated, #2a2d36)",
                  borderRadius: "0.625rem",
                  padding: "0.625rem 0.875rem",
                  border: "1px solid var(--bs-border, rgba(255,255,255,0.08))",
                }}
              >
                <span
                  style={{
                    color: "var(--bs-teal, #2dd4a8)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {feat}
              </li>
            ))}
          </ul>

          {/* Primary CTA */}
          <Link
            href="/bidshield/pricing"
            style={{
              display: "block",
              width: "100%",
              padding: "0.875rem 1rem",
              borderRadius: "0.75rem",
              background: "var(--bs-teal, #2dd4a8)",
              color: "#13151a",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              marginBottom: "0.875rem",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Start 14-Day Free Trial →
          </Link>

          {/* Secondary text link */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--bs-text-muted, #9ca0ab)",
              fontSize: "0.875rem",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--bs-text-secondary, #e8e9ec)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--bs-text-muted, #9ca0ab)")
            }
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
