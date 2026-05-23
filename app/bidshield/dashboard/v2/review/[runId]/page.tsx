"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtractionItem = {
  _id: Id<"bidshield_assemblyExtractionItems">;
  drawingAssemblyId: string;
  displayName?: string;
  archetypeId: string;
  confidence: number;
  needsReview: boolean;
  status: "draft" | "approved" | "rejected";
  extractedLayers: string[];
  requiredSectionsSnapshot: string[];
  optionalSectionsSnapshot: string[];
  hiddenSectionsSnapshot: string[];
};

type ExtractionRun = {
  _id: Id<"bidshield_assemblyExtractionRuns">;
  sourceFileName: string;
  extractedCount: number;
  needsReviewCount: number;
  status: string;
};

// ─── Assembly Card ────────────────────────────────────────────────────────────

function AssemblyCard({
  item,
  onApprove,
  onReject,
}: {
  item: ExtractionItem;
  onApprove: (id: Id<"bidshield_assemblyExtractionItems">) => void;
  onReject: (id: Id<"bidshield_assemblyExtractionItems">) => void;
}) {
  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";

  const cardBorderColor = isApproved
    ? "#22c55e"
    : isRejected
    ? "rgba(239,68,68,0.4)"
    : "var(--bs-border, #2d3748)";

  const cardOpacity = isRejected ? 0.55 : 1;

  const archLabel = item.archetypeId.replace(/_/g, " ");
  const confidencePct = (item.confidence * 100).toFixed(0);

  return (
    <div
      style={{
        background: "var(--bs-bg-card, #1a202c)",
        border: `1.5px solid ${cardBorderColor}`,
        borderRadius: 8,
        padding: "20px 24px",
        marginBottom: 16,
        opacity: cardOpacity,
        transition: "border-color 0.2s, opacity 0.2s",
      }}
    >
      {/* Assembly ID */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--bs-text-dim, #718096)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {item.displayName ?? item.drawingAssemblyId}
      </div>

      {/* Archetype Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: item.needsReview
              ? "rgba(239,68,68,0.15)"
              : "rgba(45,212,191,0.12)",
            color: item.needsReview
              ? "var(--bs-red, #ef4444)"
              : "var(--bs-teal, #2dd4bf)",
            border: `1px solid ${
              item.needsReview
                ? "rgba(239,68,68,0.3)"
                : "rgba(45,212,191,0.3)"
            }`,
          }}
        >
          {item.needsReview ? "⚠" : "✔"}{" "}
          {item.needsReview ? `needs review (${archLabel})` : archLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--bs-text-dim, #718096)",
          }}
        >
          {(item.confidence).toFixed(2)}
          {" "}
          <span style={{ fontSize: 10 }}>({confidencePct}%)</span>
        </span>
      </div>

      {/* Layers */}
      {item.extractedLayers && item.extractedLayers.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-text-secondary, #a0aec0)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}
          >
            Layers:
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {item.extractedLayers.map((layer, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: "var(--bs-text-primary, #e2e8f0)",
                  lineHeight: 1.7,
                  paddingLeft: 2,
                }}
              >
                <span style={{ color: "var(--bs-teal, #2dd4bf)", marginRight: 6 }}>•</span>
                {layer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Sections */}
      {item.requiredSectionsSnapshot && item.requiredSectionsSnapshot.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-text-secondary, #a0aec0)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}
          >
            Required sections:
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--bs-teal, #2dd4bf)",
              lineHeight: 1.8,
            }}
          >
            {item.requiredSectionsSnapshot.join(" • ")}
          </div>
        </div>
      )}

      {/* Optional Sections */}
      {item.optionalSectionsSnapshot && item.optionalSectionsSnapshot.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-text-secondary, #a0aec0)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}
          >
            Optional sections:
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--bs-text-dim, #718096)",
              lineHeight: 1.8,
            }}
          >
            {item.optionalSectionsSnapshot.join(" • ")}
          </div>
        </div>
      )}

      {/* Hidden Sections (collapsed by default — debug only) */}
      {item.hiddenSectionsSnapshot && item.hiddenSectionsSnapshot.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--bs-text-dim, #718096)",
              opacity: 0.6,
            }}
          >
            Hidden: {item.hiddenSectionsSnapshot.join(", ")}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onApprove(item._id)}
          disabled={isApproved}
          style={{
            padding: "6px 18px",
            borderRadius: 6,
            border: "none",
            background: isApproved ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.15)",
            color: isApproved ? "#86efac" : "#22c55e",
            fontWeight: 600,
            fontSize: 13,
            cursor: isApproved ? "default" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {isApproved ? "Approved" : "Approve"}
        </button>
        <button
          onClick={() => onReject(item._id)}
          disabled={isRejected}
          style={{
            padding: "6px 18px",
            borderRadius: 6,
            border: "none",
            background: isRejected ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.1)",
            color: isRejected ? "#fca5a5" : "var(--bs-red, #ef4444)",
            fontWeight: 600,
            fontSize: 13,
            cursor: isRejected ? "default" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {isRejected ? "Rejected" : "Reject"}
        </button>
      </div>
    </div>
  );
}

// ─── Review Content ───────────────────────────────────────────────────────────

function V2ReviewContent({ runId }: { runId: string }) {
  const run = useQuery(
    api.bidshield.getExtractionRunV2,
    runId ? { runId: runId as Id<"bidshield_assemblyExtractionRuns"> } : "skip"
  ) as ExtractionRun | null | undefined;

  const items = useQuery(
    api.bidshield.getExtractionItemsV2,
    runId ? { runId: runId as Id<"bidshield_assemblyExtractionRuns"> } : "skip"
  ) as ExtractionItem[] | undefined;

  const updateStatus = useMutation(api.bidshield.updateExtractionItemStatusV2);
  const approveAll = useMutation(api.bidshield.approveAllExtractionItemsV2);

  const isLoading = items === undefined || run === undefined;

  function handleApprove(itemId: Id<"bidshield_assemblyExtractionItems">) {
    updateStatus({ itemId, status: "approved" });
  }

  function handleReject(itemId: Id<"bidshield_assemblyExtractionItems">) {
    updateStatus({ itemId, status: "rejected" });
  }

  function handleApproveAll() {
    if (!runId) return;
    approveAll({ runId: runId as Id<"bidshield_assemblyExtractionRuns"> });
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          color: "var(--bs-text-dim, #718096)",
          fontSize: 15,
        }}
      >
        Loading assemblies…
      </div>
    );
  }

  if (!run) {
    return (
      <div
        style={{
          padding: 40,
          color: "var(--bs-text-secondary, #a0aec0)",
          textAlign: "center",
        }}
      >
        Run not found or you do not have access.
      </div>
    );
  }

  const needsReviewCount = items.filter((i) => i.needsReview).length;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--bs-text-primary, #e2e8f0)",
              margin: 0,
              marginBottom: 6,
            }}
          >
            V2 Assembly Review
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--bs-text-secondary, #a0aec0)",
              margin: 0,
            }}
          >
            <span style={{ color: "var(--bs-text-primary, #e2e8f0)" }}>
              {run.sourceFileName}
            </span>
            <span style={{ margin: "0 8px", color: "var(--bs-border, #2d3748)" }}>·</span>
            {run.extractedCount} {run.extractedCount === 1 ? "assembly" : "assemblies"}
            <span style={{ margin: "0 8px", color: "var(--bs-border, #2d3748)" }}>·</span>
            <span
              style={{
                color:
                  needsReviewCount > 0
                    ? "var(--bs-red, #ef4444)"
                    : "var(--bs-teal, #2dd4bf)",
              }}
            >
              {needsReviewCount} need{needsReviewCount === 1 ? "s" : ""} review
            </span>
          </p>
        </div>

        <button
          onClick={handleApproveAll}
          style={{
            padding: "8px 20px",
            borderRadius: 7,
            border: "none",
            background: "var(--bs-teal, #2dd4bf)",
            color: "#0d1117",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Approve All
        </button>
      </div>

      {/* Run Status Badge */}
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            background:
              run.status === "complete"
                ? "rgba(45,212,191,0.12)"
                : run.status === "failed"
                ? "rgba(239,68,68,0.15)"
                : "rgba(234,179,8,0.15)",
            color:
              run.status === "complete"
                ? "var(--bs-teal, #2dd4bf)"
                : run.status === "failed"
                ? "var(--bs-red, #ef4444)"
                : "#facc15",
          }}
        >
          {run.status}
        </span>
      </div>

      {/* Assembly Cards */}
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--bs-text-dim, #718096)",
            fontSize: 14,
          }}
        >
          No assemblies extracted yet.
        </div>
      ) : (
        items.map((item) => (
          <AssemblyCard
            key={item._id}
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </div>
  );
}

// ─── Page (Auth Wrapper) ──────────────────────────────────────────────────────

export default function V2ReviewPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const params = useParams();
  const runId = params?.runId as string | undefined;

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "var(--bs-text-dim, #718096)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (!runId) {
    return (
      <div
        style={{
          padding: 40,
          color: "var(--bs-text-secondary, #a0aec0)",
          textAlign: "center",
        }}
      >
        No run ID provided.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            color: "var(--bs-text-dim, #718096)",
          }}
        >
          Loading…
        </div>
      }
    >
      <V2ReviewContent runId={runId} />
    </Suspense>
  );
}
