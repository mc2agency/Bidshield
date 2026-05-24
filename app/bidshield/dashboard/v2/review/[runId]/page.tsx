"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { SECTION_DEFS } from "@/lib/bidshield/assembly-system-configs";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionValues = Record<string, string | boolean | undefined>;

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
  defaultLayerOrderSnapshot: string[];
  sectionValues: SectionValues;
};

type ExtractionRun = {
  _id: Id<"bidshield_assemblyExtractionRuns">;
  projectId: Id<"bidshield_projects">;
  sourceFileName: string;
  extractedCount: number;
  needsReviewCount: number;
  status: string;
};

// ─── Section field renderer ───────────────────────────────────────────────────
// Renders a single assembly section field from SECTION_DEFS.
// Never imports or calls legacy RoofAssemblyCard, DynamicAssemblyForm,
// SMART_PRESETS, roofSystemConfigs, or any legacy systemType/systemId config.

function SectionField({
  sectionId,
  value,
  isRequired,
}: {
  sectionId: string;
  value: string | boolean | undefined;
  isRequired: boolean;
}) {
  const def = SECTION_DEFS[sectionId as keyof typeof SECTION_DEFS];
  if (!def) return null;

  const label = def.label;
  const type = def.type;

  const displayValue =
    value === undefined || value === null || value === ""
      ? null
      : type === "boolean"
      ? (value as boolean) === true
        ? "Yes"
        : "No"
      : String(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Required indicator */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isRequired ? "var(--bs-teal, #2dd4bf)" : "rgba(113,128,150,0.4)",
          marginTop: 6,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isRequired
              ? "var(--bs-text-secondary, #a0aec0)"
              : "var(--bs-text-dim, #718096)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.4,
          }}
        >
          {label}
          {isRequired && (
            <span
              style={{
                marginLeft: 4,
                fontSize: 9,
                color: "var(--bs-teal, #2dd4bf)",
                opacity: 0.7,
              }}
            >
              REQUIRED
            </span>
          )}
        </div>
        {displayValue !== null ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--bs-text-primary, #e2e8f0)",
              marginTop: 2,
              lineHeight: 1.5,
            }}
          >
            {displayValue}
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: "var(--bs-text-dim, #718096)",
              fontStyle: "italic",
              marginTop: 2,
            }}
          >
            {type === "select"
              ? "Not selected"
              : type === "boolean"
              ? "Not specified"
              : "Not filled"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── V2ReviewAssemblyCard ─────────────────────────────────────────────────────
// Renders directly from V2 snapshot fields. Does NOT import or use:
//   - RoofAssemblyCard
//   - DynamicAssemblyForm
//   - SMART_PRESETS
//   - roofSystemConfigs
//   - legacy systemType / systemId config lookup

function V2ReviewAssemblyCard({
  item,
  onApprove,
  onReject,
}: {
  item: ExtractionItem;
  onApprove: (id: Id<"bidshield_assemblyExtractionItems">) => void;
  onReject: (id: Id<"bidshield_assemblyExtractionItems">) => void;
}) {
  const [showOptional, setShowOptional] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";

  const cardBorderColor = isApproved
    ? "#22c55e"
    : isRejected
    ? "rgba(239,68,68,0.4)"
    : "var(--bs-border, #2d3748)";

  const cardOpacity = isRejected ? 0.55 : 1;

  // Archetype display name: replace underscores with spaces, title-case
  const archLabel = item.archetypeId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const confidencePct = Math.round(item.confidence * 100);

  // Section visibility from snapshots — never from legacy config
  const required: string[] = item.requiredSectionsSnapshot ?? [];
  const optional: string[] = item.optionalSectionsSnapshot ?? [];
  const hidden: string[] = item.hiddenSectionsSnapshot ?? [];
  const sectionValues: SectionValues = item.sectionValues ?? {};

  const hasRequired = required.length > 0;
  const hasOptional = optional.length > 0;

  // Heading: prefer displayName, fall back to drawingAssemblyId
  const heading = item.displayName
    ? `${item.drawingAssemblyId} — ${item.displayName}`
    : item.drawingAssemblyId;

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
      {/* DEBUG badge — confirms this is the V2 snapshot card, not the legacy card */}
      <div style={{ padding: "2px 8px", marginBottom: 8, background: "#14532d", borderRadius: 4, fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", textAlign: "center" }}>
        V2 SNAPSHOT CARD
      </div>

      {/* Assembly ID + display name */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--bs-text-primary, #e2e8f0)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {heading}
      </div>

      {/* Archetype Badge + confidence */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
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
          {item.needsReview ? `needs review — ${archLabel}` : archLabel}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--bs-text-dim, #718096)",
          }}
        >
          {confidencePct}% confidence
        </span>
      </div>

      {/* Required Sections — always shown */}
      {hasRequired ? (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-teal, #2dd4bf)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            Assembly Sections
          </div>
          <div>
            {required.map((sectionId) => (
              <SectionField
                key={sectionId}
                sectionId={sectionId}
                value={sectionValues[sectionId]}
                isRequired={true}
              />
            ))}
          </div>
        </div>
      ) : item.needsReview ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--bs-red, #ef4444)",
              lineHeight: 1.5,
            }}
          >
            ⚠ Incomplete extraction — layer data missing. Review extracted layers below and classify manually.
          </div>
        </div>
      ) : null}

      {/* Optional Sections — collapsible */}
      {hasOptional && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowOptional((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: "4px 0",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-text-dim, #718096)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9 }}>{showOptional ? "▼" : "▶"}</span>
            Optional sections ({optional.length})
          </button>
          {showOptional && (
            <div style={{ marginTop: 6 }}>
              {optional.map((sectionId) => (
                <SectionField
                  key={sectionId}
                  sectionId={sectionId}
                  value={sectionValues[sectionId]}
                  isRequired={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden sections summary (debug — tiny) */}
      {hidden.length > 0 && (
        <div
          style={{
            fontSize: 10,
            color: "var(--bs-text-dim, #718096)",
            opacity: 0.5,
            marginBottom: 10,
          }}
        >
          Hidden: {hidden.join(", ")}
        </div>
      )}

      {/* Extracted Layers — collapsible */}
      {item.extractedLayers && item.extractedLayers.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => setShowLayers((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: "4px 0",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bs-text-dim, #718096)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9 }}>{showLayers ? "▼" : "▶"}</span>
            Extracted layers ({item.extractedLayers.length})
          </button>
          {showLayers && (
            <ul style={{ margin: "6px 0 0 0", padding: 0, listStyle: "none" }}>
              {item.extractedLayers.map((layer, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12,
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
          )}
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

  async function handleApproveAll() {
    if (!runId || !run) return;
    await approveAll({ runId: runId as Id<"bidshield_assemblyExtractionRuns"> });
    window.location.href = `/bidshield/dashboard/project?id=${run.projectId}`;
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

  const needsReviewCount = (items ?? []).filter((i) => i.needsReview).length;
  const approvedCount = (items ?? []).filter((i) => i.status === "approved").length;
  const totalCount = items?.length ?? 0;

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
            {totalCount} {totalCount === 1 ? "assembly" : "assemblies"}
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
            {approvedCount > 0 && (
              <>
                <span style={{ margin: "0 8px", color: "var(--bs-border, #2d3748)" }}>·</span>
                <span style={{ color: "#22c55e" }}>{approvedCount} approved</span>
              </>
            )}
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
      {totalCount === 0 ? (
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
        (items ?? []).map((item) => (
          <V2ReviewAssemblyCard
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
