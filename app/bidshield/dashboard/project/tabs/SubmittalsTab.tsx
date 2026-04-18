"use client";

import { useState } from "react";
import { useProGate } from "@/hooks/useProGate";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

type FindResult = {
  productName: string;
  manufacturer?: string;
  category?: string;
  status: "downloaded" | "failed";
  sourceUrl?: string;
  title?: string;
  pdfBase64?: string;
  fileSize?: number;
  errorMessage?: string;
};

export default function SubmittalsTab({ projectId, project, userId }: TabProps) {
  const { proGateModal, guardedFetch } = useProGate();
  const submittals = useQuery(
    api.bidshield.submittals.listByProject,
    projectId && userId
      ? { projectId: projectId as Id<"bidshield_projects">, userId }
      : "skip",
  );
  // Use the same merged materials source as the Materials tab so we get
  // real product names from the new extraction pipeline (productName + manufacturer).
  const mergedMaterials = useQuery(
    api.bidshield.projectSpecs.getMergedMaterials,
    projectId && userId
      ? { projectId: projectId as Id<"bidshield_projects">, userId }
      : "skip",
  );
  const generateUploadUrl = useMutation(api.bidshield.submittals.generateUploadUrl);
  const addSubmittal = useMutation(api.bidshield.submittals.addSubmittal);
  const deleteSubmittal = useMutation(api.bidshield.submittals.deleteSubmittal);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Submittal Checklist Generator state
  type SubmittalItem = {
    item: string; category: string; relatedTo?: string; required: boolean; leadTimeNote?: string;
  };
  type ChecklistResult = { totalCount: number; requiredCount: number; items: SubmittalItem[]; operationsNote: string };
  const [checklistLoading, setChecklistLoading]   = useState(false);
  const [checklistResult, setChecklistResult]     = useState<ChecklistResult | null>(null);
  const [checklistError, setChecklistError]       = useState<string | null>(null);
  const [checklistFilter, setChecklistFilter]     = useState<"all" | "required">("required");

  async function handleFind() {
    if (!mergedMaterials || mergedMaterials.length === 0) {
      setStatus("No spec materials found. Upload spec PDFs in the Setup tab first.");
      return;
    }
    const candidates = mergedMaterials
      .filter((m) => m.manufacturer)
      .map((m) => ({
        productName: m.productName,
        manufacturer: m.manufacturer,
        category: m.category,
      }));
    if (candidates.length === 0) {
      setStatus("No materials with a manufacturer to search for.");
      return;
    }
    setBusy(true);
    setStatus(`Searching for ${candidates.length} products on manufacturer sites…`);
    try {
      const res = await guardedFetch("/api/bidshield/find-datasheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials: candidates }),
      });
      if (!res) { setBusy(false); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Search failed: ${err.error ?? res.statusText}`);
        return;
      }
      const data: { results: FindResult[]; message?: string } = await res.json();
      if (!data.results?.length) {
        setStatus(data.message ?? "No candidates found.");
        return;
      }

      let saved = 0;
      let failed = 0;
      for (const r of data.results) {
        if (r.status === "failed" || !r.pdfBase64) {
          await addSubmittal({
            projectId: projectId as Id<"bidshield_projects">,
            userId: userId!,
            productName: r.productName,
            manufacturer: r.manufacturer,
            category: r.category,
            sourceUrl: r.sourceUrl ?? "",
            title: r.title,
            status: "failed",
            errorMessage: r.errorMessage,
          });
          failed++;
          continue;
        }

        setStatus(`Uploading ${r.productName}…`);
        const uploadUrl = await generateUploadUrl();
        const bytes = Uint8Array.from(atob(r.pdfBase64), (c) => c.charCodeAt(0));
        const upload = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/pdf" },
          body: bytes,
        });
        if (!upload.ok) {
          failed++;
          continue;
        }
        const { storageId } = await upload.json();
        await addSubmittal({
          projectId: projectId as Id<"bidshield_projects">,
          userId: userId!,
          productName: r.productName,
          manufacturer: r.manufacturer,
          category: r.category,
          sourceUrl: r.sourceUrl ?? "",
          storageId: storageId as Id<"_storage">,
          fileSize: r.fileSize,
          title: r.title,
          status: "downloaded",
        });
        saved++;
      }
      setStatus(`Done. Saved ${saved}, failed ${failed}.`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateChecklist() {
    setChecklistLoading(true);
    setChecklistResult(null);
    setChecklistError(null);
    try {
      const materials = (mergedMaterials ?? []).map((m: any) => ({
        productName: m.productName ?? m.name ?? "Unknown",
        manufacturer: m.manufacturer || undefined,
        category: m.category || undefined,
      }));
      const res = await guardedFetch("/api/bidshield/generate-submittal-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materials,
          systemType: (project as any)?.systemType || undefined,
          projectType: (project as any)?.projectType || undefined,
          gcName: (project as any)?.gc || undefined,
          warrantyType: (project as any)?.warrantyType || undefined,
        }),
      });
      if (!res) return;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setChecklistError(err?.error ?? "Checklist generation failed — please try again.");
        return;
      }
      setChecklistResult(await res.json());
    } catch {
      setChecklistError("Failed to generate checklist — check your connection and try again.");
    } finally {
      setChecklistLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      {proGateModal}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--bs-text-primary)" }}>Submittals</h2>
          <p style={{ fontSize: 13, color: "var(--bs-text-muted)", marginTop: 4 }}>
            Auto-fetched product datasheets from manufacturer sites.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={handleGenerateChecklist}
            disabled={checklistLoading}
            style={{
              padding: "8px 14px",
              backgroundColor: checklistLoading ? "var(--bs-border)" : "var(--bs-bg-elevated)",
              border: "1px solid var(--bs-amber)",
              color: "var(--bs-amber)",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: checklistLoading ? "not-allowed" : "pointer",
            }}
          >
            {checklistLoading ? "Generating…" : "Generate Submittal Checklist · AI"}
          </button>
          <button
            onClick={handleFind}
            disabled={busy}
            style={{
              padding: "8px 14px",
              backgroundColor: busy ? "var(--bs-border)" : "var(--bs-teal)",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Searching…" : "Find Datasheets"}
          </button>
        </div>
      </div>

      {status && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: 12,
            backgroundColor: "var(--bs-bg-card)",
            border: "1px solid var(--bs-border)",
            borderRadius: 4,
            fontSize: 12,
            color: "var(--bs-text-muted)",
          }}
        >
          {status}
        </div>
      )}

      {!submittals && <div style={{ color: "var(--bs-text-muted)" }}>Loading…</div>}
      {submittals && submittals.length === 0 && (
        <div style={{ color: "var(--bs-text-muted)", fontSize: 13 }}>
          No submittals yet. Click "Find Datasheets" to auto-fetch from manufacturer sites.
        </div>
      )}

      {submittals && submittals.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Product</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Manufacturer</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Source</th>
              <th style={{ textAlign: "right", padding: "8px 10px" }}>Size</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {submittals.map((s) => (
              <tr key={s._id} style={{ borderBottom: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>
                <td style={{ padding: "8px 10px" }}>{s.productName}</td>
                <td style={{ padding: "8px 10px" }}>{s.manufacturer ?? "—"}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ color: s.status === "downloaded" ? "var(--bs-teal)" : "var(--bs-red)" }}>
                    {s.status}
                  </span>
                  {s.errorMessage && (
                    <div style={{ fontSize: 11, color: "var(--bs-text-muted)" }}>{s.errorMessage}</div>
                  )}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  {s.sourceUrl ? (
                    <a href={s.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--bs-blue)" }}>
                      link
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                  {s.fileSize ? `${(s.fileSize / 1024).toFixed(0)} KB` : "—"}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                  {s.downloadUrl && (
                    <a
                      href={s.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--bs-teal)", marginRight: 12 }}
                    >
                      open
                    </a>
                  )}
                  <button
                    onClick={() => deleteSubmittal({ id: s._id })}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--bs-red)",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Submittal Checklist Generator results */}
      {checklistError && (
        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{checklistError}</span>
          <button onClick={() => setChecklistError(null)} style={{ background: "none", border: "none", color: "var(--bs-red)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Dismiss</button>
        </div>
      )}

      {checklistResult && (
        <div style={{ marginTop: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--bs-text-primary)", margin: 0 }}>
                AI Submittal Checklist
              </h3>
              <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 3 }}>
                {checklistResult.requiredCount} required · {checklistResult.totalCount - checklistResult.requiredCount} recommended
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["required", "all"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setChecklistFilter(f)}
                  style={{
                    padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                    background: checklistFilter === f ? "var(--bs-teal-dim)" : "var(--bs-bg-elevated)",
                    border: `1px solid ${checklistFilter === f ? "var(--bs-teal-border)" : "var(--bs-border)"}`,
                    color: checklistFilter === f ? "var(--bs-teal)" : "var(--bs-text-muted)",
                  }}
                >
                  {f === "required" ? "Required only" : "All items"}
                </button>
              ))}
              <button onClick={() => setChecklistResult(null)} style={{ background: "none", border: "none", color: "var(--bs-text-dim)", cursor: "pointer", fontSize: 12 }}>Clear</button>
            </div>
          </div>

          {/* Ops note */}
          {checklistResult.operationsNote && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber)", marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: "var(--bs-amber)", margin: 0 }}>⚡ {checklistResult.operationsNote}</p>
            </div>
          )}

          {/* Category grouping */}
          {(() => {
            const visibleItems = checklistResult.items.filter(i => checklistFilter === "all" || i.required);
            const categoryLabels: Record<string, string> = {
              product_data: "Product Data Sheets",
              shop_drawing: "Shop Drawings",
              sample: "Samples",
              certificate: "Compliance Docs",
              test_report: "Test Reports",
              warranty: "Warranty Documents",
              inspection: "Special Inspections",
              other: "Other",
            };
            const grouped = visibleItems.reduce((acc: Record<string, typeof visibleItems>, item) => {
              const g = item.category;
              if (!acc[g]) acc[g] = [];
              acc[g].push(item);
              return acc;
            }, {});
            return Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--bs-text-dim)", marginBottom: 6 }}>
                  {categoryLabels[cat] ?? cat}
                </p>
                <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--bs-border)" }}>
                  {catItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                        background: "var(--bs-bg-elevated)",
                        borderTop: i > 0 ? "1px solid var(--bs-border)" : "none",
                      }}
                    >
                      <div style={{ marginTop: 2, flexShrink: 0 }}>
                        {item.required ? (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: "var(--bs-red-dim)", color: "var(--bs-red)", textTransform: "uppercase" }}>REQ</span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: "var(--bs-bg-card)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)", textTransform: "uppercase" }}>REC</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: "var(--bs-text-primary)", margin: 0 }}>{item.item}</p>
                        {item.relatedTo && (
                          <p style={{ fontSize: 11, color: "var(--bs-text-muted)", marginTop: 2 }}>{item.relatedTo}</p>
                        )}
                        {item.leadTimeNote && (
                          <p style={{ fontSize: 11, color: "var(--bs-amber)", marginTop: 3 }}>⏱ {item.leadTimeNote}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
