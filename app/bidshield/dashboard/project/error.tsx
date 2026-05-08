"use client";

import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "var(--bs-red-dim, #fee2e2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-red, #ef4444)">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Something went wrong loading this project.</p>
      <p style={{ fontSize: 13, color: "var(--bs-text-muted)", marginBottom: 24, maxWidth: 320 }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: "8px 20px",
          background: "var(--bs-teal, #10b981)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
