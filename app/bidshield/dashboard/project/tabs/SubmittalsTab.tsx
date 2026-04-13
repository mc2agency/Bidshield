"use client";

import { useState } from "react";
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
      const res = await fetch("/api/bidshield/find-datasheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materials: candidates }),
      });
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--bs-text-primary)" }}>Submittals</h2>
          <p style={{ fontSize: 13, color: "var(--bs-text-muted)", marginTop: 4 }}>
            Auto-fetched product datasheets from manufacturer sites.
          </p>
        </div>
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
    </div>
  );
}
