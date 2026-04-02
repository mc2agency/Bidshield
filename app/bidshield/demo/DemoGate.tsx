"use client";

import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function DemoGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      // Fire-and-forget: subscribe the email (best-effort, don't block the demo)
      fetch("/api/demo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {/* ignore errors */});

      setUnlocked(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f2e20 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1.25rem",
          padding: "2.5rem",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            padding: "0.375rem 0.875rem",
            borderRadius: "9999px",
            background: "rgba(16,185,129,0.15)",
            color: "#34d399",
            border: "1px solid rgba(16,185,129,0.3)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          ✦ No account required
        </div>

        <h1
          style={{
            color: "#f8fafc",
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
            lineHeight: 1.2,
          }}
        >
          Try BidShield Free
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.6 }}>
          Enter your email to explore the live demo — see the full 18-phase bid
          workflow with real estimating data.
        </p>

        <form onSubmit={handleStart}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "#f8fafc",
              fontSize: "1rem",
              marginBottom: "0.75rem",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {error && (
            <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.875rem",
              borderRadius: "0.625rem",
              background: "#10b981",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Loading…" : "View Live Demo →"}
          </button>
        </form>

        <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: "1.25rem" }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
