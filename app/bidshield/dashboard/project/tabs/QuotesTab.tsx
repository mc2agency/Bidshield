"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

// ─── Line item + meta encoding ──────────────────────────────────────────────
// products[] stores JSON-encoded line items: {m, u, p, n}
// notes stores: "__META__" + JSON.stringify({rep, quoteNum, notes})

interface LineItem { m: string; u: string; p: number; n: string; }
interface QuoteMeta { rep: string; quoteNum: string; notes: string; }

function decodeLineItems(products: string[]): LineItem[] {
  return products.map(s => { try { return JSON.parse(s); } catch { return { m: s, u: "", p: 0, n: "" }; } });
}
function encodeLineItems(items: LineItem[]): string[] {
  return items.map(i => JSON.stringify(i));
}
function decodeMeta(raw: string | undefined): QuoteMeta {
  if (!raw) return { rep: "", quoteNum: "", notes: "" };
  if (raw.startsWith("__META__")) { try { return JSON.parse(raw.slice(8)); } catch {} }
  return { rep: "", quoteNum: "", notes: raw };
}
function encodeMeta(m: QuoteMeta): string {
  return `__META__${JSON.stringify(m)}`;
}

// ─── Demo data ───────────────────────────────────────────────────────────────
const DEMO_QUOTES_RAW = [
  {
    _id: "demo_q1", vendorName: "Siplast", vendorEmail: "jmartinez@siplast.com", vendorPhone: "214-555-0192",
    category: "system", quoteDate: "2026-03-08", expirationDate: "2026-06-08", status: "valid", quoteAmount: 187420,
    isExtracted: true,
    products: [
      '{"m":"SBS Cap Sheet","u":"RL","p":95,"n":"180 SF/sq"}',
      '{"m":"SBS Base Sheet","u":"RL","p":65,"n":"180 SF/sq"}',
      '{"m":"Cold Adhesive","u":"GAL","p":42,"n":""}',
      '{"m":"Primer","u":"GAL","p":28,"n":""}',
    ],
    notes: '__META__{"rep":"John Martinez","quoteNum":"24-889","notes":""}',
  },
  {
    _id: "demo_q2", vendorName: "GAF", vendorEmail: "estimating@gaf.com", vendorPhone: "973-555-0140",
    category: "system", quoteDate: "2026-03-06", expirationDate: "2026-06-06", status: "received", quoteAmount: 171340,
    isExtracted: false,
    products: [
      '{"m":"SBS Cap Sheet","u":"RL","p":89,"n":""}',
      '{"m":"SBS Base Sheet","u":"RL","p":61,"n":""}',
      '{"m":"Cold Adhesive","u":"GAL","p":38,"n":""}',
      '{"m":"Primer","u":"GAL","p":24,"n":""}',
    ],
    notes: '__META__{"rep":"Sarah Chen","quoteNum":"GAF-2026-4421","notes":"NDL warranty included"}',
  },
  {
    _id: "demo_q3", vendorName: "Polyglass", vendorEmail: "quotes@polyglass.us", vendorPhone: "",
    category: "system", quoteDate: "2026-03-10", expirationDate: "2026-06-10", status: "received", quoteAmount: 176850,
    isExtracted: false,
    products: [
      '{"m":"SBS Cap Sheet","u":"RL","p":92,"n":""}',
      '{"m":"SBS Base Sheet","u":"RL","p":63,"n":""}',
      '{"m":"Cold Adhesive","u":"GAL","p":40,"n":""}',
      '{"m":"Primer","u":"GAL","p":26,"n":""}',
    ],
    notes: '__META__{"rep":"Mike Thompson","quoteNum":"PG-2026-0087","notes":""}',
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────
function getEffectiveStatus(quote: any): "valid" | "expiring" | "expired" | "received" | "requested" | "none" {
  if (!quote.expirationDate) return quote.status || "none";
  const days = Math.ceil((new Date(quote.expirationDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return "expired";
  if (days <= 14) return "expiring";
  if (quote.quoteAmount) return "valid";
  return quote.status || "received";
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BLANK_FORM = {
  vendorName: "", rep: "", email: "", phone: "",
  quoteNum: "", quoteDate: "", expirationDate: "", notes: "",
  quoteAmount: "",
};
const BLANK_LINE: LineItem = { m: "", u: "RL", p: 0, n: "" };
const UNITS = ["RL", "SQ", "SF", "LF", "EA", "GAL", "BG", "TON", "LS", "BDL", "CS"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuotesTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId
      ? isValidConvexId
        ? { userId, projectId: projectId as Id<"bidshield_projects"> }
        : { userId }
      : "skip"
  );
  const allUserQuotes = useQuery(
    api.bidshield.getQuotesWithProjects,
    !isDemo && userId ? { userId } : "skip"
  );
  const createQuoteMut = useMutation(api.bidshield.createQuote);
  const deleteQuoteMut = useMutation(api.bidshield.deleteQuote);
  const importQuoteMut = useMutation(api.bidshield.importQuoteToProject);
  const generateUploadUrl = useMutation(api.bidshield.generatePdfUploadUrl);

  const [demoQuotes, setDemoQuotes] = useState<any[]>(DEMO_QUOTES_RAW);
  const resolvedQuotes = isDemo ? demoQuotes : (quotes ?? []);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  // "upload" = show PDF upload UI; "review" = show form (AI-filled or blank)
  const [modalStage, setModalStage] = useState<"upload" | "review">("upload");
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...BLANK_LINE }]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  // Import from library state
  const [importModal, setImportModal] = useState(false);
  const [importSearch, setImportSearch] = useState("");
  const [importingId, setImportingId] = useState<string | null>(null);

  // Quotes available to import = all user quotes not already in this project
  const importableQuotes = useMemo(() => {
    if (!allUserQuotes) return [];
    const inProject = new Set((resolvedQuotes).map((q: any) => q._id));
    const linkedOrigins = new Set((resolvedQuotes).map((q: any) => q.globalQuoteId).filter(Boolean));
    return allUserQuotes.filter(q =>
      !inProject.has(q._id) &&
      !linkedOrigins.has(q._id) &&
      q.projectId !== (isValidConvexId ? projectId : undefined)
    );
  }, [allUserQuotes, resolvedQuotes, projectId, isValidConvexId]);

  const filteredImportable = useMemo(() => {
    if (!importSearch) return importableQuotes;
    const lq = importSearch.toLowerCase();
    return importableQuotes.filter(q => q.vendorName.toLowerCase().includes(lq));
  }, [importableQuotes, importSearch]);

  const handleImport = async (quoteId: string) => {
    if (!userId || !isValidConvexId) return;
    setImportingId(quoteId);
    try {
      await importQuoteMut({
        userId,
        quoteId: quoteId as Id<"bidshield_quotes">,
        projectId: projectId as Id<"bidshield_projects">,
      });
      setImportModal(false);
      notify("Quote imported!");
    } finally {
      setImportingId(null);
    }
  };

  // PDF extraction state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [pdfStorageId, setPdfStorageId] = useState("");

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const openModal = () => {
    setForm({ ...BLANK_FORM });
    setLineItems([{ ...BLANK_LINE }]);
    setModalStage("upload");
    setExtractError("");
    setPdfStorageId("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setExtractError("");
    setPdfStorageId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExtract = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) { setExtractError("Please select a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setExtractError("File must be under 10 MB."); return; }

    setExtractError("");
    setExtracting(true);

    try {
      // Upload to Convex storage for persistence
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { storageId } = await uploadRes.json();
      setPdfStorageId(storageId);

      // Read as base64 for Anthropic
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/bidshield/extract-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Extraction failed");

      const q = data.quote;
      if (!q || (!q.vendorName && !q.lineItems?.length && !q.totalAmount)) {
        setExtractError("Could not extract data from this PDF. Try a different file or enter details manually.");
        setModalStage("review");
        return;
      }
      setForm({
        vendorName: q.vendorName ?? "",
        rep: q.repName ?? "",
        email: q.repEmail ?? "",
        phone: q.repPhone ?? "",
        quoteNum: q.quoteNumber ?? "",
        quoteDate: q.quoteDate ?? "",
        expirationDate: q.expirationDate ?? "",
        notes: q.notes ?? "",
        quoteAmount: q.totalAmount != null ? String(q.totalAmount) : "",
      });
      setLineItems(
        (q.lineItems ?? []).length > 0
          ? q.lineItems.map((li: any) => ({
              m: li.material ?? "",
              u: UNITS.includes(li.unit) ? li.unit : "EA",
              p: li.unitPrice ?? 0,
              n: li.notes ?? "",
            }))
          : [{ ...BLANK_LINE }]
      );
      setModalStage("review");
    } catch (err: any) {
      setExtractError(err.message ?? "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!form.vendorName.trim() || (!isDemo && !userId)) return;
    setSaving(true);
    try {
      const products = encodeLineItems(lineItems.filter(l => l.m.trim()));
      const notes = encodeMeta({ rep: form.rep, quoteNum: form.quoteNum, notes: form.notes });

      if (isDemo) {
        const newQ = {
          _id: `demo_q${Date.now()}`, vendorName: form.vendorName,
          vendorEmail: form.email, vendorPhone: form.phone,
          category: "system", quoteDate: form.quoteDate, expirationDate: form.expirationDate,
          status: "received", quoteAmount: form.quoteAmount ? parseFloat(form.quoteAmount) : undefined,
          isExtracted: !!pdfStorageId, products, notes,
        };
        setDemoQuotes(p => [...p, newQ]);
      } else {
        await createQuoteMut({
          userId: userId!,
          projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined,
          vendorName: form.vendorName.trim(),
          vendorEmail: form.email.trim() || undefined,
          vendorPhone: form.phone.trim() || undefined,
          category: "system",
          products,
          quoteAmount: form.quoteAmount ? parseFloat(form.quoteAmount) : undefined,
          quoteDate: form.quoteDate || undefined,
          expirationDate: form.expirationDate || undefined,
          notes,
          sourcePdf: pdfStorageId || undefined,
          isExtracted: pdfStorageId ? true : undefined,
        });
      }
      notify("Quote saved!");
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quote: any) => {
    if (!confirm(`Delete quote from ${quote.vendorName}?`)) return;
    if (isDemo) { setDemoQuotes(p => p.filter(q => q._id !== quote._id)); notify("Deleted."); return; }
    if (!userId) return;
    await deleteQuoteMut({ quoteId: quote._id, userId });
    notify("Deleted.");
  };

  // Stats
  const stats = useMemo(() => {
    const all = resolvedQuotes;
    const statuses = all.map(getEffectiveStatus);
    const expiring = statuses.filter(s => s === "expiring").length;
    const expired  = statuses.filter(s => s === "expired").length;
    const bestDpsf = all
      .filter((q: any) => q.quoteAmount && project?.grossRoofArea)
      .reduce((best: number | null, q: any) => {
        const v = q.quoteAmount / (project as any).grossRoofArea;
        return best === null || v < best ? v : best;
      }, null);
    return { total: all.length, expiring, expired, bestDpsf };
  }, [resolvedQuotes, project]);

  // Comparison table
  const comparison = useMemo(() => {
    if (resolvedQuotes.length < 2) return null;
    const allMaterials = new Set<string>();
    for (const q of resolvedQuotes) {
      for (const item of decodeLineItems(q.products || [])) {
        if (item.m.trim()) allMaterials.add(item.m.trim());
      }
    }
    if (allMaterials.size === 0) return null;
    const materials = Array.from(allMaterials);
    const rows = materials.map(mat => {
      const prices = resolvedQuotes.map((q: any) => {
        const found = decodeLineItems(q.products || []).find(l => l.m.trim() === mat);
        return found ? found.p : null;
      });
      const validPrices = prices.filter((p): p is number => p !== null);
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
      return { mat, prices, minPrice };
    });
    const totals = resolvedQuotes.map((q: any) => q.quoteAmount ?? null);
    const minTotal = totals.filter((t): t is number => t !== null).reduce((a, b) => (b < a ? b : a), Infinity);
    return { vendors: resolvedQuotes.map((q: any) => q.vendorName), rows, totals, minTotal };
  }, [resolvedQuotes]);

  if (!isDemo && quotes === undefined) {
    return <div className="text-sm py-8 text-center" style={{ color: "var(--bs-text-muted)" }}>Loading quotes...</div>;
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-6 px-5 py-3 rounded-lg text-sm font-medium z-50" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
          {notification}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-stretch gap-3 flex-wrap">
          <div className="rounded-xl px-4 py-2.5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-muted)" }}>Quotes</div>
            <div className="text-2xl font-extrabold tracking-tight leading-none" style={{ color: "var(--bs-text-primary)" }}>{stats.total}</div>
          </div>
          {stats.bestDpsf && (
            <div className="rounded-xl px-4 py-2.5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-muted)" }}>Best $/SF</div>
              <div className="text-2xl font-extrabold tracking-tight leading-none" style={{ color: "var(--bs-teal)" }}>${stats.bestDpsf.toFixed(2)}</div>
            </div>
          )}
          {stats.expiring > 0 && (
            <div className="rounded-xl px-4 py-2.5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-muted)" }}>Expiring</div>
              <div className="text-2xl font-extrabold tracking-tight leading-none" style={{ color: "var(--bs-amber)" }}>{stats.expiring}</div>
            </div>
          )}
          {stats.expired > 0 && (
            <div className="rounded-xl px-4 py-2.5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-muted)" }}>Expired</div>
              <div className="text-2xl font-extrabold tracking-tight leading-none" style={{ color: "var(--bs-red)" }}>{stats.expired}</div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {comparison && (
            <button onClick={() => setShowCompare(!showCompare)} className="cursor-pointer transition-colors" style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", background: "var(--bs-bg-card)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-card)"}>
              {showCompare ? "Hide Compare" : "Compare →"}
            </button>
          )}
          {!isDemo && (
            <>
              {isValidConvexId && (
                <button onClick={() => { setImportSearch(""); setImportModal(true); }} className="cursor-pointer transition-colors" style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", background: "var(--bs-bg-card)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-card)"}>
                  Import from Library
                </button>
              )}
              <button onClick={openModal} className="cursor-pointer" style={{ fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, background: "var(--bs-teal)", color: "#13151a" }}>
                + Add Quote
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {showCompare && comparison && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
          <div className="px-4 py-2.5" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--bs-text-muted)" }}>Price Comparison</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="sticky top-0" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Material</th>
                  {comparison.vendors.map((v, i) => (
                    <th key={i} className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--bs-text-muted)" }}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map(({ mat, prices, minPrice }) => (
                  <tr key={mat} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    <td className="px-4 py-2.5" style={{ color: "var(--bs-text-secondary)" }}>{mat}</td>
                    {prices.map((p, i) => (
                      <td key={i} className="text-right px-4 py-2.5 tabular-nums font-medium" style={{
                        color: p === minPrice ? "var(--bs-teal)" : p !== null ? "var(--bs-text-secondary)" : "var(--bs-text-dim)",
                      }}>
                        {p !== null ? `$${p.toFixed(2)}` : "—"}
                        {p === minPrice && <svg className="inline ml-1 w-3 h-3 align-middle" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: "var(--bs-bg-elevated)", borderTop: "2px solid var(--bs-border)" }}>
                  <td className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--bs-text-primary)" }}>System Total</td>
                  {comparison.totals.map((t, i) => {
                    const isBest = t !== null && t === comparison.minTotal;
                    const dpsf = t && (project as any)?.grossRoofArea ? t / (project as any).grossRoofArea : null;
                    return (
                      <td key={i} className="text-right px-4 py-3 tabular-nums" style={{ color: isBest ? "var(--bs-teal)" : "var(--bs-text-secondary)" }}>
                        {t ? (
                          <>
                            <div className="font-bold text-[13px]">${(t / 1000).toFixed(0)}K</div>
                            <div className="text-[11px] font-medium">{dpsf ? `$${dpsf.toFixed(2)}/SF` : ""}</div>
                            {isBest && <div className="text-[10px] font-bold mt-0.5">Best value</div>}
                          </>
                        ) : "—"}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote cards */}
      {resolvedQuotes.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ border: "1px dashed var(--bs-border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg className="w-6 h-6" style={{ color: "var(--bs-text-muted)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
          </div>
          <div className="text-sm font-semibold mb-1" style={{ color: "var(--bs-text-secondary)" }}>No quotes yet</div>
          <div className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>Upload a vendor PDF or add manually to start comparing pricing</div>
          {!isDemo && (
            <button onClick={openModal} className="px-5 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
              + Add First Quote
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resolvedQuotes.map((quote: any) => {
            const status = getEffectiveStatus(quote);
            const meta   = decodeMeta(quote.notes);
            const items  = decodeLineItems(quote.products || []);
            const dpsf   = quote.quoteAmount && (project as any)?.grossRoofArea
              ? (quote.quoteAmount / (project as any).grossRoofArea).toFixed(2)
              : null;

            const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
              valid:     { bg: "var(--bs-teal-dim)",  text: "var(--bs-teal)",  label: "Active" },
              received:  { bg: "var(--bs-blue-dim)",  text: "var(--bs-blue)",  label: "Received" },
              requested: { bg: "var(--bs-bg-elevated)", text: "var(--bs-text-muted)", label: "Requested" },
              expiring:  { bg: "var(--bs-amber-dim)", text: "var(--bs-amber)", label: "Expiring" },
              expired:   { bg: "var(--bs-red-dim)",   text: "var(--bs-red)",   label: "Expired" },
              none:      { bg: "var(--bs-bg-elevated)", text: "var(--bs-text-dim)", label: "○ None" },
            };
            const ss = statusStyle[status] || statusStyle.none;

            return (
              <div key={quote._id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
                {/* Card header */}
                <div className="px-5 py-4" style={{ background: "var(--bs-bg-card)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] font-bold" style={{ color: "var(--bs-text-primary)" }}>{quote.vendorName}</span>
                        {meta.quoteNum && (
                          <span className="text-[11px] font-mono" style={{ color: "var(--bs-text-muted)" }}>Quote #{meta.quoteNum}</span>
                        )}
                        {quote.isExtracted && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>AI</span>
                        )}
                      </div>
                      {meta.rep && (
                        <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                          Rep: {meta.rep}
                          {quote.vendorEmail && <span> · <a href={`mailto:${quote.vendorEmail}`} className="transition-colors" style={{ color: "var(--bs-text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>{quote.vendorEmail}</a></span>}
                          {quote.vendorPhone && <span> · {quote.vendorPhone}</span>}
                        </div>
                      )}
                      {!meta.rep && quote.vendorEmail && (
                        <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{quote.vendorEmail}</div>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                      style={{ background: ss.bg, color: ss.text }}
                    >
                      {ss.label}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2.5 text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
                    {quote.quoteDate     && <span>Quoted: {formatDate(quote.quoteDate)}</span>}
                    {quote.expirationDate && <span style={{ color: status === "expired" ? "var(--bs-red)" : status === "expiring" ? "var(--bs-amber)" : "var(--bs-text-muted)" }}>Expires: {formatDate(quote.expirationDate)}</span>}
                  </div>
                </div>

                {/* Line items */}
                {items.length > 0 && (
                  <div style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    <div className="px-5 py-2" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--bs-text-muted)" }}>Materials Covered</span>
                    </div>
                    {items.map((li, i) => (
                      li.m.trim() ? (
                        <div
                          key={i}
                          className="flex items-center px-5 py-2.5"
                          style={{ borderBottom: i < items.length - 1 ? "1px solid var(--bs-border)" : undefined, background: "var(--bs-bg-card)" }}
                        >
                          <span className="flex-1 text-[13px]" style={{ color: "var(--bs-text-secondary)" }}>{li.m}</span>
                          {li.n && <span className="text-[11px] mr-4 hidden sm:block" style={{ color: "var(--bs-text-muted)" }}>{li.n}</span>}
                          <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--bs-text-primary)" }}>
                            ${li.p.toFixed(2)}/{li.u.toLowerCase()}
                          </span>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}

                {/* Totals + notes */}
                <div className="px-5 py-3 flex items-center justify-between gap-4" style={{ background: "var(--bs-bg-elevated)" }}>
                  <div>
                    {meta.notes && <p className="text-[11px] mb-1" style={{ color: "var(--bs-text-muted)" }}>{meta.notes}</p>}
                    {quote.quoteAmount ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-[15px] font-bold" style={{ color: "var(--bs-text-primary)" }}>${quote.quoteAmount.toLocaleString()}</span>
                        {dpsf && <span className="text-[13px] font-medium" style={{ color: "var(--bs-text-muted)" }}>${dpsf}/SF</span>}
                      </div>
                    ) : (
                      <span className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>Total not set</span>
                    )}
                  </div>
                  {!isDemo && (
                    <button
                      onClick={() => handleDelete(quote)}
                      className="text-[12px] transition-colors px-2 py-1"
                      style={{ color: "var(--bs-text-muted)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-red)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import from Library Modal */}
      {importModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setImportModal(false)}>
          <div className="rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ background: "var(--bs-bg-card)" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: "var(--bs-text-primary)" }}>Import from Library</h2>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>Link an existing quote from your database to this project</p>
              </div>
              <button onClick={() => setImportModal(false)} className="text-lg transition-colors" style={{ color: "var(--bs-text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>✕</button>
            </div>
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <input
                autoFocus
                type="text"
                placeholder="Search by vendor..."
                value={importSearch}
                onChange={e => setImportSearch(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none"
                style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredImportable.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bs-bg-elevated)" }}>
                    <svg className="w-5 h-5" style={{ color: "var(--bs-text-muted)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
                  </div>
                  <p className="text-sm" style={{ color: "var(--bs-text-muted)" }}>
                    {importSearch ? "No matching quotes" : "No quotes available to import"}
                  </p>
                  {!importSearch && (
                    <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: "var(--bs-text-dim)" }}>
                      Upload quotes to other projects or the Quotes & Pricing library to import them here.
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ borderTop: "none" }}>
                  {filteredImportable.map((q: any) => {
                    const meta = decodeMeta(q.notes);
                    const items = decodeLineItems(q.products || []).filter((l: LineItem) => l.m.trim());
                    return (
                      <div key={q._id} className="px-5 py-3.5 flex items-center justify-between gap-4 transition-colors" style={{ borderBottom: "1px solid var(--bs-border)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold truncate" style={{ color: "var(--bs-text-primary)" }}>{q.vendorName}</span>
                            {meta.quoteNum && <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--bs-text-muted)" }}>#{meta.quoteNum}</span>}
                            {q.isExtracted && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>AI</span>}
                          </div>
                          <div className="flex gap-3 mt-0.5 text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
                            {q.quoteDate && <span>{formatDate(q.quoteDate)}</span>}
                            {items.length > 0 && <span>{items.length} items</span>}
                            {q.quoteAmount && <span className="font-medium" style={{ color: "var(--bs-teal)" }}>${q.quoteAmount.toLocaleString()}</span>}
                            {q.projectName && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>{q.projectName}</span>}
                            {!q.projectName && <span style={{ color: "var(--bs-text-dim)" }}>General</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleImport(q._id)}
                          disabled={importingId === q._id}
                          style={{ background: importingId === q._id ? "var(--bs-bg-elevated)" : "var(--bs-teal)", color: importingId === q._id ? "var(--bs-text-muted)" : "#13151a" }}
                          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
                        >
                          {importingId === q._id ? "Importing..." : "Import"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button onClick={() => setImportModal(false)} className="text-[13px] font-medium transition-colors" style={{ color: "var(--bs-text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quote Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={closeModal}
        >
          <div
            className="rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
            style={{ background: "var(--bs-bg-card)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: "var(--bs-text-primary)" }}>Add Quote</h2>
                {modalStage === "upload" && (
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>Upload a vendor PDF — AI extracts everything automatically</p>
                )}
                {modalStage === "review" && pdfStorageId && (
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-teal)" }}>Extracted from PDF — review and save</p>
                )}
                {modalStage === "review" && !pdfStorageId && (
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>Enter quote details manually</p>
                )}
              </div>
              <button onClick={closeModal} className="text-lg transition-colors" style={{ color: "var(--bs-text-muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* ── Upload stage ── */}
              {modalStage === "upload" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Quote PDF *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold"
                      style={{ color: "var(--bs-text-secondary)" }}
                    />
                    <p className="text-[11px] mt-1" style={{ color: "var(--bs-text-dim)" }}>PDF only · max 10 MB</p>
                  </div>

                  {extractError && (
                    <div className="text-sm rounded-lg px-4 py-3" style={{ color: "var(--bs-red)", background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>
                      {extractError}
                    </div>
                  )}

                  <button
                    onClick={handleExtract}
                    disabled={extracting}
                    style={{ background: extracting ? "var(--bs-bg-elevated)" : "var(--bs-teal)", color: extracting ? "var(--bs-text-muted)" : "#13151a" }}
                    className="w-full py-2.5 font-semibold rounded-lg text-[13px] disabled:cursor-not-allowed transition-colors"
                  >
                    {extracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Reading quote...
                      </span>
                    ) : "Extract with AI →"}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => { setModalStage("review"); }}
                      className="text-[12px] underline transition-colors"
                      style={{ color: "var(--bs-text-dim)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
                    >
                      No PDF? Enter manually instead
                    </button>
                  </div>
                </div>
              )}

              {/* ── Review / Edit stage ── */}
              {modalStage === "review" && (
                <div className="flex flex-col gap-4">

                  {/* Vendor section */}
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Vendor / Manufacturer *</label>
                    <input
                      autoFocus
                      type="text"
                      value={form.vendorName}
                      onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))}
                      placeholder="e.g. Siplast, GAF, Carlisle"
                      className="w-full px-3 py-2 text-[14px] rounded-lg focus:outline-none"
                      style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Name</label>
                      <input type="text" value={form.rep} onChange={e => setForm(f => ({ ...f, rep: e.target.value }))} placeholder="John Martinez" className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Quote Number</label>
                      <input type="text" value={form.quoteNum} onChange={e => setForm(f => ({ ...f, quoteNum: e.target.value }))} placeholder="24-889" className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rep@vendor.com" className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Quote Date</label>
                      <input type="date" value={form.quoteDate} onChange={e => setForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Expiration Date</label>
                      <input type="date" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))} className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Total Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--bs-text-muted)" }}>$</span>
                        <input type="number" value={form.quoteAmount} onChange={e => setForm(f => ({ ...f, quoteAmount: e.target.value }))} placeholder="0.00" step="0.01" className="w-full pl-7 pr-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Notes</label>
                      <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="NDL warranty, delivery included..." className="w-full px-3 py-2 text-[13px] rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                    </div>
                  </div>

                  {/* Line items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-medium" style={{ color: "var(--bs-text-muted)" }}>Line Items</label>
                      <span className="text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{lineItems.filter(l => l.m.trim()).length} materials</span>
                    </div>
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
                      <div className="grid grid-cols-[1fr_56px_80px_24px] gap-0 px-3 py-2" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>Material</span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>Unit</span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>Price</span>
                        <span />
                      </div>
                      <div>
                        {lineItems.map((li, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_56px_80px_24px] gap-1 px-3 py-2 items-center" style={{ borderBottom: idx < lineItems.length - 1 ? "1px solid var(--bs-border)" : undefined }}>
                            <input
                              type="text"
                              value={li.m}
                              onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, m: e.target.value } : x))}
                              placeholder="SBS Cap Sheet"
                              className="border-0 bg-transparent text-[13px] focus:outline-none min-w-0"
                              style={{ color: "var(--bs-text-primary)" }}
                            />
                            <select
                              value={li.u}
                              onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, u: e.target.value } : x))}
                              className="rounded px-1 py-1 text-[12px] focus:outline-none"
                              style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                            >
                              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--bs-text-muted)" }}>$</span>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={li.p || ""}
                                onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, p: parseFloat(e.target.value) || 0 } : x))}
                                placeholder="0.00"
                                className="w-full rounded pl-5 pr-1 py-1 text-[12px] focus:outline-none"
                                style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                              />
                            </div>
                            <button
                              onClick={() => setLineItems(items => items.filter((_, i) => i !== idx))}
                              className="transition-colors text-center leading-none"
                              style={{ color: "var(--bs-text-dim)" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-red)"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setLineItems(items => [...items, { ...BLANK_LINE }])}
                      className="mt-2 text-[12px] font-medium transition-colors"
                      style={{ color: "var(--bs-teal)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                    >
                      + Add line item
                    </button>
                  </div>

                  {!pdfStorageId && (
                    <button
                      onClick={() => setModalStage("upload")}
                      className="text-[12px] underline text-left transition-colors"
                      style={{ color: "var(--bs-text-dim)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
                    >
                      ← Upload a PDF instead
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button
                onClick={modalStage === "review" && pdfStorageId ? () => { setModalStage("upload"); setPdfStorageId(""); } : closeModal}
                className="text-[13px] font-medium transition-colors"
                style={{ color: "var(--bs-text-muted)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
              >
                {modalStage === "review" && pdfStorageId ? "← Re-upload" : "Cancel"}
              </button>
              {modalStage === "review" && (
                <button
                  onClick={handleSave}
                  disabled={saving || !form.vendorName.trim()}
                  style={{ background: saving || !form.vendorName.trim() ? "var(--bs-bg-elevated)" : "var(--bs-teal)", color: saving || !form.vendorName.trim() ? "var(--bs-text-muted)" : "#13151a" }}
                  className="px-5 py-2 text-[13px] font-semibold rounded-lg disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Quote"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
