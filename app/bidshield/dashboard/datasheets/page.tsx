"use client";

import React, { useState, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Shared constants ─────────────────────────────────────────────────────────

const DATASHEET_CATEGORIES = [
  "Membrane", "Insulation", "Cover Board", "Adhesive", "Fasteners",
  "Flashing", "Sealant", "Drain", "Accessory", "Coatings", "Sheet Metal", "Other",
];
const COMMON_UNITS = ["RL", "BD", "BX", "GL", "PC", "EA", "SF", "LF", "SQ", "TN", "CS"];
const QUOTE_UNITS = ["RL", "SQ", "SF", "LF", "EA", "GAL", "BG", "TON", "LS", "BDL", "CS"];
const DAYS_AMBER = 90;
const DAYS_RED = 180;
const MONTHLY_LIMIT = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isStale(date: string | null | undefined) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() > DAYS_AMBER * 86400000;
}

function isVeryStale(date: string | null | undefined) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() > DAYS_RED * 86400000;
}

function staleBg(date: string | null | undefined) {
  if (isVeryStale(date)) return "";
  if (isStale(date)) return "";
  return "";
}


function staleColorStyle(date: string | null | undefined): string {
  if (isVeryStale(date)) return "var(--bs-red)";
  if (isStale(date)) return "var(--bs-amber)";
  return "var(--bs-teal)";
}

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
function encodeMeta(m: QuoteMeta): string { return `__META__${JSON.stringify(m)}`; }

function getEffectiveStatus(quote: any): string {
  if (!quote.expirationDate) return quote.status || "none";
  const days = Math.ceil((new Date(quote.expirationDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return "expired";
  if (days <= 14) return "expiring";
  if (quote.quoteAmount) return "valid";
  return quote.status || "received";
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  valid:     { bg: "var(--bs-teal-dim)", text: "var(--bs-teal)", label: "Active" },
  received:  { bg: "var(--bs-blue-dim)", text: "var(--bs-blue)", label: "Received" },
  requested: { bg: "rgba(124,58,237,0.15)", text: "#a78bfa", label: "Requested" },
  expiring:  { bg: "var(--bs-amber-dim)", text: "var(--bs-amber)", label: "Expiring" },
  expired:   { bg: "var(--bs-red-dim)", text: "var(--bs-red)", label: "Expired" },
  none:      { bg: "var(--bs-bg-elevated)", text: "var(--bs-text-dim)", label: "○ Pending" },
};

// ─── Blank forms ──────────────────────────────────────────────────────────────

const BLANK_DS = {
  productName: "", category: "Membrane", unit: "RL", unitPrice: "",
  coverage: "", coverageUnit: "SF", vendorName: "", quoteDate: "", pdfUrl: "", notes: "",
};
const BLANK_QUOTE_FORM = {
  vendorName: "", rep: "", email: "", phone: "",
  quoteNum: "", quoteDate: "", expirationDate: "", notes: "", quoteAmount: "",
};
const BLANK_LINE: LineItem = { m: "", u: "RL", p: 0, n: "" };

type ExtractedItem = {
  productName: string; category: string; unit: string; unitPrice: number;
  coverage: number | null; coverageUnit: string | null; notes: string | null; selected: boolean;
};

// ─── ComparePricePanel ────────────────────────────────────────────────────────

function ComparePricePanel({
  vendor,
  history,
  onClose,
}: {
  vendor: string;
  history: { quotes: any[]; materialTrends: Record<string, { date: string; price: number; unit: string }[]> };
  onClose: () => void;
}) {
  const sortedQuotes = [...history.quotes].sort((a, b) => (a.quoteDate ?? "").localeCompare(b.quoteDate ?? ""));
  const older = sortedQuotes[sortedQuotes.length - 2];
  const newer = sortedQuotes[sortedQuotes.length - 1];
  const olderItems = decodeLineItems(older?.products ?? []).filter(l => l.m.trim());
  const newerItems = decodeLineItems(newer?.products ?? []).filter(l => l.m.trim());
  const olderMap = new Map(olderItems.map(l => [l.m.toLowerCase().trim(), l]));
  const newerMap = new Map(newerItems.map(l => [l.m.toLowerCase().trim(), l]));
  const allProducts = Array.from(new Set([...olderMap.keys(), ...newerMap.keys()])).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold" style={{ color: "#a78bfa" }}>Price Comparison — {vendor}</span>
        <button onClick={onClose} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>close ×</button>
      </div>
      <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid rgba(124,58,237,0.3)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(124,58,237,0.12)" }}>
              <th className="text-left px-3 py-2 text-xs font-semibold w-1/2" style={{ color: "#a78bfa" }}>Product</th>
              <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--bs-text-dim)" }}>{formatDate(older?.quoteDate)}</th>
              <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--bs-text-muted)" }}>{formatDate(newer?.quoteDate)}</th>
              <th className="text-right px-3 py-2 text-xs font-semibold" style={{ color: "var(--bs-text-dim)" }}>Change</th>
            </tr>
          </thead>
          <tbody style={{ background: "var(--bs-bg-card)" }}>
            {allProducts.map(key => {
              const o = olderMap.get(key);
              const n = newerMap.get(key);
              const pct = o && n ? ((n.p - o.p) / o.p) * 100 : null;
              const up = pct !== null && pct > 0;
              const down = pct !== null && pct < 0;
              return (
                <tr key={key} style={{ borderTop: "1px solid var(--bs-border)" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: "var(--bs-text-primary)" }}>{o?.m ?? n?.m}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>
                    {o ? `$${o.p.toFixed(2)}/${o.u.toLowerCase()}` : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {n ? (
                      <span style={{ color: up ? "var(--bs-red)" : down ? "var(--bs-teal)" : "var(--bs-text-primary)" }}>
                        ${n.p.toFixed(2)}/{n.u.toLowerCase()}
                      </span>
                    ) : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {pct !== null ? (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={up ? { background: "var(--bs-red-dim)", color: "var(--bs-red)" } : down ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" } : { background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)" }}>
                        {up ? "+" : ""}{pct.toFixed(1)}%
                        {up ? " ↑" : down ? " ↓" : ""}
                      </span>
                    ) : <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>new</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedQuotes.length > 2 && (
        <p className="text-xs mt-2" style={{ color: "#a78bfa" }}>Showing most recent 2 of {sortedQuotes.length} quotes. All price trends visible in each quote row.</p>
      )}
    </div>
  );
}

// ─── QuoteRows ────────────────────────────────────────────────────────────────

function QuoteRows({
  quote, meta, items, status, ss, isExpanded,
  vendorQuoteCount, compareVendor, vendorHistory,
  qDeleteConfirm, userId, hideVendorName,
  onToggleExpand, onToggleCompare, onDeleteConfirm, onDeleteCancel, onDelete,
}: {
  quote: any; meta: QuoteMeta; items: LineItem[]; status: string;
  ss: { bg: string; text: string; label: string }; isExpanded: boolean;
  vendorQuoteCount: number; compareVendor: string | null;
  vendorHistory: Record<string, any>; qDeleteConfirm: string | null;
  userId: string; hideVendorName?: boolean;
  onToggleExpand: () => void; onToggleCompare: () => void;
  onDeleteConfirm: () => void; onDeleteCancel: () => void; onDelete: () => Promise<void>;
}) {
  const hasCompare = vendorQuoteCount >= 2;
  const showComparePanel = compareVendor === quote.vendorName && !!vendorHistory[quote.vendorName] && !hideVendorName;

  return (
    <>
      <tr
        className="cursor-pointer transition-colors"
        style={{ borderBottom: "1px solid var(--bs-border)", background: isExpanded ? "rgba(59,130,246,0.06)" : undefined }}
        onClick={onToggleExpand}
      >
        {/* Expand chevron */}
        <td className="pl-3.5 pr-1 py-3.5 text-xs w-6" style={{ color: "var(--bs-text-dim)" }}>
          {items.length > 0 ? (isExpanded ? "▾" : "▸") : ""}
        </td>
        <td className="p-3.5">
          {!hideVendorName && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "var(--bs-text-primary)" }}>{quote.vendorName}</span>
              {quote.isExtracted && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>AI</span>}
              {hasCompare && (
                <button
                  onClick={e => { e.stopPropagation(); onToggleCompare(); }}
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
                >
                  Compare
                </button>
              )}
            </div>
          )}
          {hideVendorName && quote.isExtracted && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>AI</span>
          )}
          {meta.rep && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{meta.rep}</div>}
        </td>
        <td className="p-3.5 text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>{meta.quoteNum || <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</td>
        <td className="p-3.5">
          {quote.projectName
            ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>{quote.projectName}</span>
            : <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>General</span>
          }
        </td>
        <td className="p-3.5 text-sm font-medium" style={{ color: staleColorStyle(quote.quoteDate) }}>{formatDate(quote.quoteDate)}</td>
        <td className="p-3.5 text-sm" style={{ color: status === "expired" ? "var(--bs-red)" : status === "expiring" ? "var(--bs-amber)" : "var(--bs-text-muted)" }}>
          {formatDate(quote.expirationDate)}
        </td>
        <td className="p-3.5 text-sm font-bold" style={{ color: "var(--bs-teal)" }}>
          {quote.quoteAmount ? `$${quote.quoteAmount.toLocaleString()}` : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}
        </td>
        <td className="p-3.5 text-sm" style={{ color: "var(--bs-text-muted)" }}>{items.length || <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</td>
        <td className="p-3.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
        </td>
        <td className="p-3.5">
          {qDeleteConfirm === quote._id ? (
            <div className="flex gap-1 items-center">
              <span className="text-xs" style={{ color: "var(--bs-red)" }}>Delete?</span>
              <button onClick={async e => { e.stopPropagation(); await onDelete(); }} className="text-xs font-medium" style={{ color: "var(--bs-red)" }}>Yes</button>
              <button onClick={e => { e.stopPropagation(); onDeleteCancel(); }} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>No</button>
            </div>
          ) : (
            <button onClick={e => { e.stopPropagation(); onDeleteConfirm(); }} className="text-xs transition-colors" style={{ color: "var(--bs-text-dim)" }}>×</button>
          )}
        </td>
      </tr>

      {/* Expanded line items — compact data table */}
      {isExpanded && items.length > 0 && (
        <tr style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <td colSpan={10} className="px-0 py-0">
            <div style={{ background: "rgba(59,130,246,0.05)", borderTop: "1px solid rgba(59,130,246,0.15)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
                    <th className="text-left px-6 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Product</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Unit</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Unit Price</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Notes</th>
                    <th className="px-4 py-2 text-xs font-medium text-right cursor-pointer" style={{ color: "var(--bs-blue)" }} onClick={onToggleExpand}>
                      collapse ↑
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((li, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                      <td className="px-6 py-2 font-medium" style={{ color: "var(--bs-text-primary)" }}>{li.m}</td>
                      <td className="px-3 py-2 uppercase text-xs" style={{ color: "var(--bs-text-muted)" }}>{li.u}</td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: "var(--bs-teal)" }}>${li.p.toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: "var(--bs-text-dim)" }}>{li.n || "—"}</td>
                      <td className="px-4 py-2" />
                    </tr>
                  ))}
                </tbody>
              </table>
              {meta.notes && <p className="text-xs px-6 pb-2" style={{ color: "var(--bs-text-dim)" }}>{meta.notes}</p>}
            </div>
          </td>
        </tr>
      )}

      {/* Inline compare panel (flat list mode) */}
      {showComparePanel && (
        <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.2)" }}>
          <td colSpan={10} className="px-4 py-4" style={{ background: "rgba(124,58,237,0.06)" }}>
            <ComparePricePanel vendor={quote.vendorName} history={vendorHistory[quote.vendorName]} onClose={onToggleCompare} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuotesPricingPage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  // ── Active tab ──
  const [tab, setTab] = useState<"quotes" | "library">("quotes");

  // ── Queries ──
  const quotesWithProjects = useQuery(api.bidshield.getQuotesWithProjects, userId ? { userId } : "skip");
  const datasheets = useQuery(api.bidshield.getDatasheets, userId ? { userId } : "skip");
  const subscription = useQuery(api.users.getUserSubscription, userId ? { clerkId: userId } : "skip");
  const monthlyCount = useQuery(api.bidshield.getMonthlyExtractionCount, userId ? { userId } : "skip");

  // ── Mutations ──
  const addDatasheet = useMutation(api.bidshield.addDatasheet);
  const deleteDatasheet = useMutation(api.bidshield.deleteDatasheet);
  const createQuote = useMutation(api.bidshield.createQuote);
  const deleteQuote = useMutation(api.bidshield.deleteQuote);
  const generateUploadUrl = useMutation(api.bidshield.generatePdfUploadUrl);
  const backfillPriceLibrary = useMutation(api.bidshield.backfillPriceLibraryFromQuotes);

  const isPro = subscription?.isPro ?? false;
  const extractionsUsed = monthlyCount ?? 0;
  const atLimit = extractionsUsed >= MONTHLY_LIMIT;

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1 — VENDOR QUOTES state
  // ═══════════════════════════════════════════════════════════════════════════

  const [qSearch, setQSearch] = useState("");
  const [qFilterVendor, setQFilterVendor] = useState("");
  const [qFilterProject, setQFilterProject] = useState("");
  const [qFilterStatus, setQFilterStatus] = useState("");
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [historyVendor, setHistoryVendor] = useState<string | null>(null);
  const [groupByVendor, setGroupByVendor] = useState(false);
  const [compareVendor, setCompareVendor] = useState<string | null>(null);
  const [collapsedVendors, setCollapsedVendors] = useState<Set<string>>(new Set());

  // Quote upload modal state
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteModalStage, setQuoteModalStage] = useState<"upload" | "review">("upload");
  const [quoteForm, setQuoteForm] = useState({ ...BLANK_QUOTE_FORM });
  const [quoteLineItems, setQuoteLineItems] = useState<LineItem[]>([{ ...BLANK_LINE }]);
  const [quoteExtracting, setQuoteExtracting] = useState(false);
  const [quoteExtractError, setQuoteExtractError] = useState("");
  const [quotePdfStorageId, setQuotePdfStorageId] = useState("");
  const [quoteSaving, setQuoteSaving] = useState(false);
  const quoteFileRef = useRef<HTMLInputElement>(null);

  const [qDeleteConfirm, setQDeleteConfirm] = useState<string | null>(null);

  // Derived: unique vendors and projects across all quotes
  const allQuotes = quotesWithProjects ?? [];
  const quoteVendors = useMemo(() =>
    Array.from(new Set(allQuotes.map(q => q.vendorName).filter(Boolean))).sort() as string[],
    [allQuotes]
  );
  const quoteProjects = useMemo(() => {
    const seen = new Map<string, string>();
    allQuotes.forEach(q => { if (q.projectName) seen.set(q.projectName, q.projectName); });
    return Array.from(seen.values()).sort();
  }, [allQuotes]);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    const lq = qSearch.toLowerCase();
    return allQuotes.filter(q => {
      const meta = decodeMeta(q.notes);
      const matchSearch = !lq || q.vendorName.toLowerCase().includes(lq) || (meta.quoteNum && meta.quoteNum.toLowerCase().includes(lq));
      const matchVendor = !qFilterVendor || q.vendorName === qFilterVendor;
      const matchProject = !qFilterProject || q.projectName === qFilterProject || (!qFilterProject && !q.projectName);
      const status = getEffectiveStatus(q);
      const matchStatus =
        !qFilterStatus ||
        (qFilterStatus === "active" && (status === "valid" || status === "received" || status === "expiring")) ||
        (qFilterStatus === "expired" && status === "expired");
      return matchSearch && matchVendor && matchProject && matchStatus;
    });
  }, [allQuotes, qSearch, qFilterVendor, qFilterProject, qFilterStatus]);

  // Price history: vendors with >1 quote, grouped by date
  const vendorHistory = useMemo(() => {
    const byVendor = new Map<string, typeof allQuotes>();
    for (const q of allQuotes) {
      if (!byVendor.has(q.vendorName)) byVendor.set(q.vendorName, []);
      byVendor.get(q.vendorName)!.push(q);
    }
    const result: Record<string, { quotes: typeof allQuotes; materialTrends: Record<string, { date: string; price: number; unit: string }[]> }> = {};
    byVendor.forEach((quotes, vendor) => {
      if (quotes.length < 2) return;
      const sorted = [...quotes].sort((a, b) => (a.quoteDate ?? "").localeCompare(b.quoteDate ?? ""));
      const materialTrends: Record<string, { date: string; price: number; unit: string }[]> = {};
      sorted.forEach(q => {
        decodeLineItems(q.products || []).forEach(li => {
          if (!li.m.trim()) return;
          if (!materialTrends[li.m]) materialTrends[li.m] = [];
          materialTrends[li.m].push({ date: q.quoteDate ?? "", price: li.p, unit: li.u });
        });
      });
      // Only keep materials that appear in >1 quote
      Object.keys(materialTrends).forEach(mat => {
        if (materialTrends[mat].length < 2) delete materialTrends[mat];
      });
      if (Object.keys(materialTrends).length > 0) {
        result[vendor] = { quotes: sorted, materialTrends };
      }
    });
    return result;
  }, [allQuotes]);

  // Quote upload handlers
  const openQuoteModal = () => {
    setQuoteForm({ ...BLANK_QUOTE_FORM });
    setQuoteLineItems([{ ...BLANK_LINE }]);
    setQuoteModalStage("upload");
    setQuoteExtractError("");
    setQuotePdfStorageId("");
    setQuoteModal(true);
  };

  const closeQuoteModal = () => {
    setQuoteModal(false);
    setQuoteExtractError("");
    setQuotePdfStorageId("");
    if (quoteFileRef.current) quoteFileRef.current.value = "";
  };

  const handleQuoteExtract = async () => {
    const file = quoteFileRef.current?.files?.[0];
    if (!file) { setQuoteExtractError("Please select a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setQuoteExtractError("File must be under 10 MB."); return; }
    setQuoteExtractError("");
    setQuoteExtracting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { storageId } = await uploadRes.json();
      setQuotePdfStorageId(storageId);

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
      setQuoteForm({
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
      setQuoteLineItems(
        (q.lineItems ?? []).length > 0
          ? q.lineItems.map((li: any) => ({ m: li.material ?? "", u: QUOTE_UNITS.includes(li.unit) ? li.unit : "EA", p: li.unitPrice ?? 0, n: li.notes ?? "" }))
          : [{ ...BLANK_LINE }]
      );
      setQuoteModalStage("review");
    } catch (err: any) {
      setQuoteExtractError(err.message ?? "Extraction failed");
    } finally {
      setQuoteExtracting(false);
    }
  };

  const handleQuoteSave = async () => {
    if (!quoteForm.vendorName.trim() || !userId) return;
    setQuoteSaving(true);
    try {
      await createQuote({
        userId,
        // No projectId — this is a general/library quote
        vendorName: quoteForm.vendorName.trim(),
        vendorEmail: quoteForm.email.trim() || undefined,
        vendorPhone: quoteForm.phone.trim() || undefined,
        category: "system",
        products: encodeLineItems(quoteLineItems.filter(l => l.m.trim())),
        quoteAmount: quoteForm.quoteAmount ? parseFloat(quoteForm.quoteAmount) : undefined,
        quoteDate: quoteForm.quoteDate || undefined,
        expirationDate: quoteForm.expirationDate || undefined,
        notes: encodeMeta({ rep: quoteForm.rep, quoteNum: quoteForm.quoteNum, notes: quoteForm.notes }),
        sourcePdf: quotePdfStorageId || undefined,
        isExtracted: quotePdfStorageId ? true : undefined,
      });
      closeQuoteModal();
    } finally {
      setQuoteSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 2 — PRICE LIBRARY state
  // ═══════════════════════════════════════════════════════════════════════════

  const [dsSearch, setDsSearch] = useState("");
  const [dsFilterVendor, setDsFilterVendor] = useState("");
  const [dsFilterCategory, setDsFilterCategory] = useState("");
  const [manualModal, setManualModal] = useState(false);
  const [dsForm, setDsForm] = useState(BLANK_DS);
  const [dsSaving, setDsSaving] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfVendor, setPdfVendor] = useState("");
  const [pdfDate, setPdfDate] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [previewItems, setPreviewItems] = useState<ExtractedItem[] | null>(null);
  const [savingExtracted, setSavingExtracted] = useState(false);
  const [pdfStorageId, setPdfStorageId] = useState("");
  const [dsDeleteConfirm, setDsDeleteConfirm] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<{ upserted: number; updated: number } | null>(null);
  const dsFileRef = useRef<HTMLInputElement>(null);

  const allDsVendors = useMemo(() =>
    Array.from(new Set((datasheets ?? []).map(d => d.vendorName).filter(Boolean) as string[])).sort(),
    [datasheets]
  );

  const filteredDs = useMemo(() => {
    const lq = dsSearch.toLowerCase();
    return (datasheets ?? []).filter(d => {
      const matchSearch = !lq || d.productName.toLowerCase().includes(lq) || d.category.toLowerCase().includes(lq) || (d.vendorName ?? "").toLowerCase().includes(lq);
      const matchVendor = !dsFilterVendor || d.vendorName === dsFilterVendor;
      const matchCat = !dsFilterCategory || d.category === dsFilterCategory;
      return matchSearch && matchVendor && matchCat;
    });
  }, [datasheets, dsSearch, dsFilterVendor, dsFilterCategory]);

  const staleCount = useMemo(() => (datasheets ?? []).filter(d => isStale(d.quoteDate)).length, [datasheets]);

  const handleManualSave = async () => {
    if (!dsForm.productName.trim() || !dsForm.unit.trim() || !dsForm.unitPrice) return;
    setDsSaving(true);
    await addDatasheet({
      userId, productName: dsForm.productName.trim(), category: dsForm.category,
      unit: dsForm.unit.trim(), unitPrice: parseFloat(dsForm.unitPrice),
      coverage: dsForm.coverage ? parseFloat(dsForm.coverage) : undefined,
      coverageUnit: dsForm.coverageUnit.trim() || undefined,
      vendorName: dsForm.vendorName.trim() || undefined,
      quoteDate: dsForm.quoteDate || undefined,
      pdfUrl: dsForm.pdfUrl.trim() || undefined,
      notes: dsForm.notes.trim() || undefined,
    });
    setDsSaving(false);
    setDsForm(BLANK_DS);
    setManualModal(false);
  };

  const closePdfModal = () => {
    setPdfModal(false); setPdfVendor(""); setPdfDate(""); setPdfStorageId("");
    setPreviewItems(null); setExtractError("");
    if (dsFileRef.current) dsFileRef.current.value = "";
  };

  const handleExtract = async () => {
    const file = dsFileRef.current?.files?.[0];
    if (!file) return;
    setExtractError(""); setExtracting(true); setPreviewItems(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { storageId } = await uploadRes.json();
      setPdfStorageId(storageId);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/bidshield/extract-price-sheet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, vendorName: pdfVendor, priceListDate: pdfDate }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Extraction failed");
      setPreviewItems((data.items as Omit<ExtractedItem, "selected">[]).map(item => ({
        ...item,
        category: DATASHEET_CATEGORIES.includes(item.category) ? item.category : "Other",
        selected: true,
      })));
    } catch (err: any) {
      setExtractError(err.message ?? "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveExtracted = async () => {
    if (!previewItems) return;
    setSavingExtracted(true);
    for (const item of previewItems.filter(i => i.selected)) {
      await addDatasheet({
        userId, productName: item.productName, category: item.category,
        unit: item.unit, unitPrice: item.unitPrice,
        coverage: item.coverage ?? undefined, coverageUnit: item.coverageUnit ?? undefined,
        vendorName: pdfVendor.trim() || undefined, quoteDate: pdfDate || undefined,
        sourcePdf: pdfStorageId || undefined, isExtracted: true,
        notes: item.notes ?? undefined,
      });
    }
    setSavingExtracted(false);
    closePdfModal();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="app-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>Quotes & Pricing</h1>
          <p className="text-sm" style={{ color: "var(--bs-text-muted)" }}>Unified vendor quote database and material price library</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bs-bg-elevated)" }}>
        {([["quotes", "Vendor Quotes"], ["library", "Price Library"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={tab === id ? { background: "var(--bs-bg-card)", color: "var(--bs-text-primary)", border: "1px solid var(--bs-border)" } : { color: "var(--bs-text-muted)" }}
          >
            {label}
            {id === "quotes" && allQuotes.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bs-bg-card)", color: "var(--bs-text-muted)" }}>{allQuotes.length}</span>
            )}
            {id === "library" && (datasheets?.length ?? 0) > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bs-bg-card)", color: "var(--bs-text-muted)" }}>{datasheets!.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: VENDOR QUOTES
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "quotes" && (
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search vendor, quote #..."
              value={qSearch}
              onChange={e => setQSearch(e.target.value)}
              className="flex-1 min-w-[180px] rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--bs-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--bs-border)")}
            />
            {quoteVendors.length > 0 && (
              <select value={qFilterVendor} onChange={e => setQFilterVendor(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
                <option value="">All Vendors</option>
                {quoteVendors.map(v => <option key={v}>{v}</option>)}
              </select>
            )}
            {quoteProjects.length > 0 && (
              <select value={qFilterProject} onChange={e => setQFilterProject(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
                <option value="">All Projects</option>
                <option value="__general">General (no project)</option>
                {quoteProjects.map(p => <option key={p}>{p}</option>)}
              </select>
            )}
            <select value={qFilterStatus} onChange={e => setQFilterStatus(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            {/* Group by vendor toggle */}
            <button
              onClick={() => { setGroupByVendor(v => !v); setCollapsedVendors(new Set()); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={groupByVendor ? { background: "var(--bs-teal)", color: "#13151a", border: "1px solid var(--bs-teal)" } : { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
            >
              <span className="text-xs">⊞</span> Group by Vendor
            </button>
            <button
              onClick={openQuoteModal}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              + Upload Quote PDF
            </button>
          </div>

          {/* Quotes table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["", "Vendor", "Quote #", "Project", "Date", "Expires", "Total", "Items", "Status", ""].map((h, i) => (
                      <th key={i} className="text-left p-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotesWithProjects === undefined && (
                    <tr><td colSpan={10} className="text-center py-10 text-sm" style={{ color: "var(--bs-text-dim)" }}>Loading...</td></tr>
                  )}
                  {quotesWithProjects !== undefined && filteredQuotes.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bs-bg-elevated)" }}>
                          <svg className="w-5 h-5" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                        </div>
                        <p className="text-sm mb-1" style={{ color: "var(--bs-text-muted)" }}>{qSearch || qFilterVendor || qFilterProject || qFilterStatus ? "No matching quotes" : "No quotes yet"}</p>
                        {!qSearch && !qFilterVendor && !qFilterProject && !qFilterStatus && (
                          <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: "var(--bs-text-dim)" }}>
                            Upload vendor quote PDFs here, or add quotes inside any project. All quotes appear in this unified database.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* ── FLAT LIST (group by vendor OFF) ── */}
                  {!groupByVendor && filteredQuotes
                    .slice()
                    .sort((a, b) => (b.quoteDate ?? "").localeCompare(a.quoteDate ?? ""))
                    .map(quote => {
                      const meta = decodeMeta(quote.notes);
                      const items = decodeLineItems(quote.products || []).filter(l => l.m.trim());
                      const status = getEffectiveStatus(quote);
                      const ss = STATUS_STYLE[status] || STATUS_STYLE.none;
                      const isExpanded = expandedQuote === quote._id;
                      const vendorQuoteCount = allQuotes.filter(q => q.vendorName === quote.vendorName).length;
                      return (
                        <QuoteRows
                          key={quote._id}
                          quote={quote}
                          meta={meta}
                          items={items}
                          status={status}
                          ss={ss}
                          isExpanded={isExpanded}
                          vendorQuoteCount={vendorQuoteCount}
                          compareVendor={compareVendor}
                          vendorHistory={vendorHistory}
                          qDeleteConfirm={qDeleteConfirm}
                          userId={userId}
                          onToggleExpand={() => setExpandedQuote(isExpanded ? null : quote._id)}
                          onToggleCompare={() => setCompareVendor(compareVendor === quote.vendorName ? null : quote.vendorName)}
                          onDeleteConfirm={() => setQDeleteConfirm(quote._id)}
                          onDeleteCancel={() => setQDeleteConfirm(null)}
                          onDelete={async () => { await deleteQuote({ quoteId: quote._id as Id<"bidshield_quotes">, userId }); setQDeleteConfirm(null); }}
                        />
                      );
                    })}

                  {/* ── GROUPED BY VENDOR ── */}
                  {groupByVendor && (() => {
                    const byVendor = new Map<string, typeof filteredQuotes>();
                    for (const q of filteredQuotes.slice().sort((a, b) => (b.quoteDate ?? "").localeCompare(a.quoteDate ?? ""))) {
                      if (!byVendor.has(q.vendorName)) byVendor.set(q.vendorName, []);
                      byVendor.get(q.vendorName)!.push(q);
                    }
                    return Array.from(byVendor.entries()).map(([vendor, quotes]) => {
                      const isCollapsed = collapsedVendors.has(vendor);
                      const hasCompare = quotes.length >= 2;
                      return (
                        <>
                          {/* Vendor header row */}
                          <tr key={`vendor-${vendor}`} style={{ borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                            <td colSpan={10} className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setCollapsedVendors(prev => {
                                    const next = new Set(prev);
                                    next.has(vendor) ? next.delete(vendor) : next.add(vendor);
                                    return next;
                                  })}
                                  className="transition-colors"
                                  style={{ color: "var(--bs-text-dim)" }}
                                >
                                  {isCollapsed ? "▶" : "▼"}
                                </button>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-secondary)" }}>{vendor}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "var(--bs-bg-card)", color: "var(--bs-text-muted)" }}>
                                  {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
                                </span>
                                {hasCompare && (
                                  <button
                                    onClick={() => setCompareVendor(compareVendor === vendor ? null : vendor)}
                                    className="text-xs px-2 py-0.5 rounded font-semibold transition-colors"
                                    style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
                                  >
                                    Compare
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {/* Compare panel */}
                          {compareVendor === vendor && vendorHistory[vendor] && (
                            <tr key={`compare-${vendor}`}>
                              <td colSpan={10} className="px-4 py-4" style={{ background: "rgba(124,58,237,0.06)", borderBottom: "1px solid rgba(124,58,237,0.2)" }}>
                                <ComparePricePanel vendor={vendor} history={vendorHistory[vendor]} onClose={() => setCompareVendor(null)} />
                              </td>
                            </tr>
                          )}
                          {/* Quote rows for this vendor */}
                          {!isCollapsed && quotes.map(quote => {
                            const meta = decodeMeta(quote.notes);
                            const items = decodeLineItems(quote.products || []).filter(l => l.m.trim());
                            const status = getEffectiveStatus(quote);
                            const ss = STATUS_STYLE[status] || STATUS_STYLE.none;
                            const isExpanded = expandedQuote === quote._id;
                            return (
                              <QuoteRows
                                key={quote._id}
                                quote={quote}
                                meta={meta}
                                items={items}
                                status={status}
                                ss={ss}
                                isExpanded={isExpanded}
                                vendorQuoteCount={quotes.length}
                                compareVendor={compareVendor}
                                vendorHistory={vendorHistory}
                                qDeleteConfirm={qDeleteConfirm}
                                userId={userId}
                                hideVendorName
                                onToggleExpand={() => setExpandedQuote(isExpanded ? null : quote._id)}
                                onToggleCompare={() => setCompareVendor(compareVendor === quote.vendorName ? null : quote.vendorName)}
                                onDeleteConfirm={() => setQDeleteConfirm(quote._id)}
                                onDeleteCancel={() => setQDeleteConfirm(null)}
                                onDelete={async () => { await deleteQuote({ quoteId: quote._id as Id<"bidshield_quotes">, userId }); setQDeleteConfirm(null); }}
                              />
                            );
                          })}
                        </>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flat compare panel (when not grouped) */}
          {!groupByVendor && compareVendor && vendorHistory[compareVendor] && (
            <div className="rounded-xl p-4" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <ComparePricePanel vendor={compareVendor} history={vendorHistory[compareVendor]} onClose={() => setCompareVendor(null)} />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PRICE LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "library" && (
        <div className="flex flex-col gap-4">
          {/* Stale warning */}
          {staleCount > 0 && (
            <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 w-fit" style={{ color: "var(--bs-amber)", background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber)" }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              {staleCount} product{staleCount !== 1 ? "s" : ""} with pricing older than 90 days
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search products, categories, vendors..."
              value={dsSearch}
              onChange={e => setDsSearch(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--bs-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--bs-border)")}
            />
            {allDsVendors.length > 0 && (
              <select value={dsFilterVendor} onChange={e => setDsFilterVendor(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
                <option value="">All Vendors</option>
                {allDsVendors.map(v => <option key={v}>{v}</option>)}
              </select>
            )}
            <select value={dsFilterCategory} onChange={e => setDsFilterCategory(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
              <option value="">All Categories</option>
              {DATASHEET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 flex-wrap">
              {/* Backfill from quotes — shown when library is empty but quotes exist */}
              {allQuotes.length > 0 && (datasheets?.length ?? 0) === 0 && (
                <button
                  onClick={async () => {
                    setBackfilling(true);
                    try {
                      const result = await backfillPriceLibrary({ userId });
                      setBackfillResult(result);
                    } finally {
                      setBackfilling(false);
                    }
                  }}
                  disabled={backfilling}
                  className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  {backfilling ? "Importing…" : "↓ Import from Quotes"}
                </button>
              )}
              {backfillResult && (
                <span className="self-center text-xs px-2.5 py-1.5 rounded-lg" style={{ color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal)" }}>
                  Added {backfillResult.upserted}, updated {backfillResult.updated}
                </span>
              )}
              <button onClick={() => { setDsForm(BLANK_DS); setManualModal(true); }} className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-primary)", border: "1px solid var(--bs-border)" }}>
                + Add Product
              </button>
              {isPro ? (
                <button
                  onClick={() => { if (!atLimit) setPdfModal(true); }}
                  disabled={atLimit}
                  title={atLimit ? `Monthly limit of ${MONTHLY_LIMIT} reached` : "Upload a vendor price sheet PDF"}
                  className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  <span>Upload Price Sheet</span>
                  <span className="text-xs opacity-75">{extractionsUsed}/{MONTHLY_LIMIT}</span>
                </button>
              ) : (
                <button disabled title="Upgrade to Pro to upload vendor price sheets" className="px-4 py-2.5 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-2" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}>
                  <span>Upload Price Sheet</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>Pro</span>
                </button>
              )}
            </div>
          </div>

          {/* Library table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Product", "Category", "Price", "Unit", "Coverage", "Vendor", "Price List Date", ""].map(h => (
                      <th key={h} className="text-left p-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasheets === undefined && (
                    <tr><td colSpan={8} className="text-center py-10 text-sm" style={{ color: "var(--bs-text-dim)" }}>Loading...</td></tr>
                  )}
                  {datasheets !== undefined && filteredDs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "var(--bs-bg-elevated)" }}>
                          <svg className="w-5 h-5" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0H2.25m19.5 0v3a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-3" /></svg>
                        </div>
                        <p className="text-sm mb-1" style={{ color: "var(--bs-text-muted)" }}>{dsSearch || dsFilterVendor || dsFilterCategory ? "No matching products" : "No products yet"}</p>
                        {!dsSearch && !dsFilterVendor && !dsFilterCategory && (
                          <>
                            <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: "var(--bs-text-dim)" }}>Add products with pricing and coverage rates. This library carries across all projects.</p>
                            <button onClick={() => { setDsForm(BLANK_DS); setManualModal(true); }} className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: "var(--bs-teal)", color: "#13151a" }}>+ Add First Product</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                  {filteredDs.map(ds => {
                    const stale = isStale(ds.quoteDate);
                    const veryStale = isVeryStale(ds.quoteDate);
                    return (
                      <tr key={ds._id} style={{ borderBottom: "1px solid var(--bs-border)", background: veryStale ? "rgba(239,68,68,0.05)" : stale ? "rgba(245,158,11,0.05)" : undefined }}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{ds.productName}</span>
                            {ds.quoteId && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>From Quote</span>}
                            {ds.isExtracted && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>AI</span>}
                          </div>
                          {ds.notes && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{ds.notes}</div>}
                          {(ds.sourcePdfUrl || ds.pdfUrl) && (
                            <a href={(ds.sourcePdfUrl || ds.pdfUrl)!} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: "var(--bs-blue)" }}>View PDF</a>
                          )}
                        </td>
                        <td className="p-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>{ds.category}</span></td>
                        <td className="p-3.5 text-sm font-bold" style={{ color: "var(--bs-teal)" }}>${ds.unitPrice.toFixed(2)}</td>
                        <td className="p-3.5 text-sm" style={{ color: "var(--bs-text-muted)" }}>{ds.unit}</td>
                        <td className="p-3.5 text-sm" style={{ color: "var(--bs-text-muted)" }}>{ds.coverage ? `${ds.coverage} ${ds.coverageUnit || "SF"}` : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</td>
                        <td className="p-3.5 text-sm" style={{ color: "var(--bs-text-muted)" }}>{ds.vendorName || <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</td>
                        <td className="p-3.5 text-sm font-medium" style={{ color: staleColorStyle(ds.quoteDate) }}>
                          {formatDate(ds.quoteDate)}
                          {veryStale && <span className="ml-1 text-xs" style={{ color: "var(--bs-red)" }}>(!)</span>}
                          {!veryStale && stale && <svg className="w-3 h-3 inline-block ml-1" style={{ color: "var(--bs-amber)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
                        </td>
                        <td className="p-3.5">
                          {dsDeleteConfirm === ds._id ? (
                            <div className="flex gap-1 items-center">
                              <span className="text-xs" style={{ color: "var(--bs-red)" }}>Delete?</span>
                              <button onClick={() => { deleteDatasheet({ id: ds._id as Id<"bidshield_datasheets"> }); setDsDeleteConfirm(null); }} className="text-xs font-medium" style={{ color: "var(--bs-red)" }}>Yes</button>
                              <button onClick={() => setDsDeleteConfirm(null)} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDsDeleteConfirm(ds._id)} className="text-xs transition-colors" style={{ color: "var(--bs-text-dim)" }}>×</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Upload Quote (Tab 1) ══════════════════════════════════════ */}
      {quoteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={closeQuoteModal}>
          <div className="rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: "var(--bs-text-primary)" }}>Add Quote to Library</h2>
                {quoteModalStage === "upload" && <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>Upload a vendor PDF — AI extracts everything automatically</p>}
                {quoteModalStage === "review" && quotePdfStorageId && <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-teal)" }}>Extracted — review and save</p>}
                {quoteModalStage === "review" && !quotePdfStorageId && <p className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>Enter quote details manually</p>}
              </div>
              <button onClick={closeQuoteModal} className="text-lg" style={{ color: "var(--bs-text-dim)" }}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {quoteModalStage === "upload" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Quote PDF *</label>
                    <input ref={quoteFileRef} type="file" accept=".pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold" style={{ color: "var(--bs-text-muted)" }} />
                    <p className="text-[11px] mt-1" style={{ color: "var(--bs-text-dim)" }}>PDF only · max 10 MB</p>
                  </div>
                  {quoteExtractError && <div className="text-sm rounded-lg px-4 py-3" style={{ color: "var(--bs-red)", background: "var(--bs-red-dim)", border: "1px solid var(--bs-red)" }}>{quoteExtractError}</div>}
                  <button
                    onClick={handleQuoteExtract}
                    disabled={quoteExtracting}
                    className="w-full py-2.5 font-semibold rounded-lg text-[13px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ background: "var(--bs-teal)", color: "#13151a" }}
                  >
                    {quoteExtracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Reading quote...
                      </span>
                    ) : "Extract with AI →"}
                  </button>
                  <div className="text-center">
                    <button onClick={() => setQuoteModalStage("review")} className="text-[12px] underline" style={{ color: "var(--bs-text-dim)" }}>No PDF? Enter manually instead</button>
                  </div>
                </div>
              )}

              {quoteModalStage === "review" && (
                <div className="flex flex-col gap-4">
                  {(() => {
                    const qInputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" } as React.CSSProperties;
                    return (<>
                  <div>
                    <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Vendor / Manufacturer *</label>
                    <input autoFocus type="text" value={quoteForm.vendorName} onChange={e => setQuoteForm(f => ({ ...f, vendorName: e.target.value }))} placeholder="e.g. Siplast, GAF, Carlisle" className="w-full rounded-lg px-3 py-2 text-[14px] focus:outline-none" style={qInputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Name</label>
                      <input type="text" value={quoteForm.rep} onChange={e => setQuoteForm(f => ({ ...f, rep: e.target.value }))} placeholder="John Martinez" className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Quote Number</label>
                      <input type="text" value={quoteForm.quoteNum} onChange={e => setQuoteForm(f => ({ ...f, quoteNum: e.target.value }))} placeholder="24-889" className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Email</label>
                      <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(f => ({ ...f, email: e.target.value }))} placeholder="rep@vendor.com" className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Rep Phone</label>
                      <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Quote Date</label>
                      <input type="date" value={quoteForm.quoteDate} onChange={e => setQuoteForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Expiration Date</label>
                      <input type="date" value={quoteForm.expirationDate} onChange={e => setQuoteForm(f => ({ ...f, expirationDate: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Total Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--bs-text-dim)" }}>$</span>
                        <input type="number" value={quoteForm.quoteAmount} onChange={e => setQuoteForm(f => ({ ...f, quoteAmount: e.target.value }))} placeholder="0.00" step="0.01" className="w-full rounded-lg pl-7 pr-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1" style={{ color: "var(--bs-text-muted)" }}>Notes</label>
                      <input type="text" value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))} placeholder="NDL warranty, delivery..." className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none" style={qInputStyle} />
                    </div>
                  </div>
                  {/* Line items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-medium" style={{ color: "var(--bs-text-muted)" }}>Line Items</label>
                      <span className="text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{quoteLineItems.filter(l => l.m.trim()).length} materials</span>
                    </div>
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
                      <div className="grid grid-cols-[1fr_56px_80px_24px] px-3 py-2" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-dim)" }}>Material</span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-dim)" }}>Unit</span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--bs-text-dim)" }}>Price</span>
                        <span />
                      </div>
                      <div>
                        {quoteLineItems.map((li, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_56px_80px_24px] gap-1 px-3 py-2 items-center" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                            <input type="text" value={li.m} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, m: e.target.value } : x))} placeholder="SBS Cap Sheet" className="border-0 bg-transparent text-[13px] focus:outline-none min-w-0" style={{ color: "var(--bs-text-primary)" }} />
                            <select value={li.u} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, u: e.target.value } : x))} className="rounded px-1 py-1 text-[12px] focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>
                              {QUOTE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--bs-text-dim)" }}>$</span>
                              <input type="number" min={0} step={0.01} value={li.p || ""} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, p: parseFloat(e.target.value) || 0 } : x))} placeholder="0.00" className="w-full rounded pl-5 pr-1 py-1 text-[12px] focus:outline-none" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                            </div>
                            <button onClick={() => setQuoteLineItems(items => items.filter((_, i) => i !== idx))} className="transition-colors text-center leading-none" style={{ color: "var(--bs-text-dim)" }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setQuoteLineItems(items => [...items, { ...BLANK_LINE }])} className="mt-2 text-[12px] font-medium transition-colors" style={{ color: "var(--bs-blue)" }}>+ Add line item</button>
                  </div>
                  {!quotePdfStorageId && (
                    <button onClick={() => setQuoteModalStage("upload")} className="text-[12px] underline text-left" style={{ color: "var(--bs-text-dim)" }}>← Upload a PDF instead</button>
                  )}
                  </>);
                  })()}
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button
                onClick={quoteModalStage === "review" && quotePdfStorageId ? () => { setQuoteModalStage("upload"); setQuotePdfStorageId(""); } : closeQuoteModal}
                className="text-[13px] font-medium transition-colors"
                style={{ color: "var(--bs-text-muted)" }}
              >
                {quoteModalStage === "review" && quotePdfStorageId ? "← Re-upload" : "Cancel"}
              </button>
              {quoteModalStage === "review" && (
                <button
                  onClick={handleQuoteSave}
                  disabled={quoteSaving || !quoteForm.vendorName.trim()}
                  className="px-5 py-2 text-[13px] font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  {quoteSaving ? "Saving..." : "Save to Library"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Manual Add Product (Tab 2) ═══════════════════════════════ */}
      {manualModal && (() => {
        const mInputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" } as React.CSSProperties;
        return (
        <div onClick={() => setManualModal(false)} className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div onClick={e => e.stopPropagation()} className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--bs-text-primary)" }}>Add Product to Library</h2>
              <button onClick={() => setManualModal(false)} className="text-xl" style={{ color: "var(--bs-text-dim)" }}>&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Product Name *</label>
                <input type="text" value={dsForm.productName} onChange={e => setDsForm(f => ({ ...f, productName: e.target.value }))} className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="e.g., TPO 60mil Membrane (10' wide)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Category *</label>
                  <select value={dsForm.category} onChange={e => setDsForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle}>
                    {DATASHEET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Unit *</label>
                  <input type="text" list="units-list" value={dsForm.unit} onChange={e => setDsForm(f => ({ ...f, unit: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="RL, BD, GL..." />
                  <datalist id="units-list">{COMMON_UNITS.map(u => <option key={u} value={u} />)}</datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Unit Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--bs-text-dim)" }}>$</span>
                    <input type="number" value={dsForm.unitPrice} onChange={e => setDsForm(f => ({ ...f, unitPrice: e.target.value }))} className="w-full rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Coverage Rate</label>
                  <div className="flex gap-1">
                    <input type="number" value={dsForm.coverage} onChange={e => setDsForm(f => ({ ...f, coverage: e.target.value }))} className="flex-1 rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="1000" />
                    <input type="text" value={dsForm.coverageUnit} onChange={e => setDsForm(f => ({ ...f, coverageUnit: e.target.value }))} className="w-20 rounded-lg px-2 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="SF" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Vendor</label>
                  <input type="text" value={dsForm.vendorName} onChange={e => setDsForm(f => ({ ...f, vendorName: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="Distributor name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Price List Date</label>
                  <input type="date" value={dsForm.quoteDate} onChange={e => setDsForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Notes</label>
                <input type="text" value={dsForm.notes} onChange={e => setDsForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={mInputStyle} placeholder="e.g. 10' wide roll, mechanically attached only" />
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button onClick={() => setManualModal(false)} className="px-5 py-2.5 rounded-lg text-sm" style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Cancel</button>
              <button onClick={handleManualSave} disabled={dsSaving || !dsForm.productName.trim() || !dsForm.unitPrice} className="px-5 py-2.5 font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                {dsSaving ? "Saving..." : "Add to Library"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ═══ MODAL: PDF Price Sheet Upload (Tab 2) ═══════════════════════════ */}
      {pdfModal && (() => {
        const pInputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" } as React.CSSProperties;
        return (
        <div onClick={previewItems ? undefined : closePdfModal} className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div onClick={e => e.stopPropagation()} className="rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--bs-text-primary)" }}>Upload Vendor Price Sheet</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--bs-text-dim)" }}>AI will extract all products and pricing — review before saving</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>{extractionsUsed}/{MONTHLY_LIMIT} extractions this month</span>
                <button onClick={closePdfModal} className="text-xl" style={{ color: "var(--bs-text-dim)" }}>&times;</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!previewItems ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Price Sheet PDF *</label>
                    <input ref={dsFileRef} type="file" accept=".pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold" style={{ color: "var(--bs-text-muted)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Vendor Name</label>
                      <input type="text" value={pdfVendor} onChange={e => setPdfVendor(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={pInputStyle} placeholder="e.g., ABC Roofing Supply" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--bs-text-secondary)" }}>Price List Date</label>
                      <input type="date" value={pdfDate} onChange={e => setPdfDate(e.target.value)} className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={pInputStyle} />
                    </div>
                  </div>
                  {extractError && <div className="text-sm rounded-lg px-4 py-3" style={{ color: "var(--bs-red)", background: "var(--bs-red-dim)", border: "1px solid var(--bs-red)" }}>{extractError}</div>}
                  <button onClick={handleExtract} disabled={extracting} className="w-full py-3 font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                    {extracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Extracting pricing data...
                      </span>
                    ) : "Extract Pricing Data"}
                  </button>
                  <p className="text-xs text-center" style={{ color: "var(--bs-text-dim)" }}>Uses AI to parse pricing tables — costs 1 of your {MONTHLY_LIMIT} monthly extractions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>Found {previewItems.length} products — select which to save</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: true })) ?? null)} className="text-xs" style={{ color: "var(--bs-blue)" }}>Select all</button>
                      <span style={{ color: "var(--bs-border)" }}>|</span>
                      <button onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: false })) ?? null)} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Deselect all</button>
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                          <th className="w-8 p-3"></th>
                          <th className="text-left p-3 text-xs font-semibold uppercase" style={{ color: "var(--bs-text-dim)" }}>Product</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase" style={{ color: "var(--bs-text-dim)" }}>Category</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase" style={{ color: "var(--bs-text-dim)" }}>Price</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase" style={{ color: "var(--bs-text-dim)" }}>Unit</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase" style={{ color: "var(--bs-text-dim)" }}>Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewItems.map((item, idx) => (
                          <tr key={idx} className={item.selected ? "" : "opacity-40"} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                            <td className="p-3"><input type="checkbox" checked={item.selected} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, selected: e.target.checked } : it) ?? null)} className="rounded" /></td>
                            <td className="p-3">
                              <input type="text" value={item.productName} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it) ?? null)} className="w-full bg-transparent border-0 text-sm focus:outline-none rounded px-1 py-0.5" style={{ color: "var(--bs-text-primary)" }} />
                              {item.notes && <div className="text-xs px-1" style={{ color: "var(--bs-text-dim)" }}>{item.notes}</div>}
                            </td>
                            <td className="p-3">
                              <select value={item.category} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, category: e.target.value } : it) ?? null)} className="bg-transparent border-0 text-xs focus:outline-none" style={{ color: "var(--bs-text-muted)" }}>
                                {DATASHEET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-0.5">
                                <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>$</span>
                                <input type="number" value={item.unitPrice} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, unitPrice: parseFloat(e.target.value) || 0 } : it) ?? null)} className="w-20 bg-transparent border-0 font-bold text-sm focus:outline-none rounded px-1" style={{ color: "var(--bs-teal)" }} />
                              </div>
                            </td>
                            <td className="p-3"><input type="text" value={item.unit} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it) ?? null)} className="w-16 bg-transparent border-0 text-sm focus:outline-none rounded px-1" style={{ color: "var(--bs-text-muted)" }} /></td>
                            <td className="p-3 text-xs" style={{ color: "var(--bs-text-muted)" }}>{item.coverage ? `${item.coverage} ${item.coverageUnit || "SF"}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => { setPreviewItems(null); setExtractError(""); }} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>← Re-upload different PDF</button>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button onClick={closePdfModal} className="px-5 py-2.5 rounded-lg text-sm" style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Cancel</button>
              {previewItems && (
                <button onClick={handleSaveExtracted} disabled={savingExtracted || previewItems.filter(i => i.selected).length === 0} className="px-5 py-2.5 font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                  {savingExtracted ? "Saving..." : `Save ${previewItems.filter(i => i.selected).length} Products to Library`}
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
