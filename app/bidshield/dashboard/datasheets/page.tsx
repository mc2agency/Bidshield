"use client";

import { useState, useRef, useMemo } from "react";
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
  if (isVeryStale(date)) return "bg-red-50/40";
  if (isStale(date)) return "bg-amber-50/40";
  return "";
}

function staleTextColor(date: string | null | undefined) {
  if (isVeryStale(date)) return "text-red-500";
  if (isStale(date)) return "text-amber-500";
  return "text-emerald-600";
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
  valid:     { bg: "#f0fdf4", text: "#16a34a", label: "Active" },
  received:  { bg: "#eff6ff", text: "#2563eb", label: "Received" },
  requested: { bg: "#f5f3ff", text: "#7c3aed", label: "Requested" },
  expiring:  { bg: "#fffbeb", text: "#d97706", label: "Expiring" },
  expired:   { bg: "#fef2f2", text: "#dc2626", label: "Expired" },
  none:      { bg: "#f8fafc", text: "#94a3b8", label: "○ Pending" },
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
        <span className="text-sm font-bold text-violet-700">Price Comparison — {vendor}</span>
        <button onClick={onClose} className="text-xs text-violet-400 hover:text-violet-600">close ×</button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-violet-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-100/70">
              <th className="text-left px-3 py-2 text-xs font-semibold text-violet-700 w-1/2">Product</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">{formatDate(older?.quoteDate)}</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-700">{formatDate(newer?.quoteDate)}</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Change</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {allProducts.map(key => {
              const o = olderMap.get(key);
              const n = newerMap.get(key);
              const pct = o && n ? ((n.p - o.p) / o.p) * 100 : null;
              const up = pct !== null && pct > 0;
              const down = pct !== null && pct < 0;
              return (
                <tr key={key} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-800 font-medium">{o?.m ?? n?.m}</td>
                  <td className="px-3 py-2 text-right text-slate-500 tabular-nums">
                    {o ? `$${o.p.toFixed(2)}/${o.u.toLowerCase()}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {n ? (
                      <span className={up ? "text-red-600" : down ? "text-emerald-600" : "text-slate-800"}>
                        ${n.p.toFixed(2)}/{n.u.toLowerCase()}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {pct !== null ? (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${up ? "bg-red-100 text-red-600" : down ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {up ? "+" : ""}{pct.toFixed(1)}%
                        {up ? " ↑" : down ? " ↓" : ""}
                      </span>
                    ) : <span className="text-slate-300 text-xs">new</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedQuotes.length > 2 && (
        <p className="text-xs text-violet-500 mt-2">Showing most recent 2 of {sortedQuotes.length} quotes. All price trends visible in each quote row.</p>
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
        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50/30" : ""}`}
        onClick={onToggleExpand}
      >
        {/* Expand chevron */}
        <td className="pl-3.5 pr-1 py-3.5 text-slate-400 text-xs w-6">
          {items.length > 0 ? (isExpanded ? "▾" : "▸") : ""}
        </td>
        <td className="p-3.5">
          {!hideVendorName && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-800">{quote.vendorName}</span>
              {quote.isExtracted && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">AI</span>}
              {hasCompare && (
                <button
                  onClick={e => { e.stopPropagation(); onToggleCompare(); }}
                  className="text-[10px] bg-violet-100 text-violet-700 hover:bg-violet-200 px-1.5 py-0.5 rounded font-semibold transition-colors"
                >
                  Compare
                </button>
              )}
            </div>
          )}
          {hideVendorName && quote.isExtracted && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">AI</span>
          )}
          {meta.rep && <div className="text-xs text-slate-400 mt-0.5">{meta.rep}</div>}
        </td>
        <td className="p-3.5 text-sm text-slate-600 font-mono">{meta.quoteNum || <span className="text-slate-400">—</span>}</td>
        <td className="p-3.5">
          {quote.projectName
            ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{quote.projectName}</span>
            : <span className="text-xs text-slate-400">General</span>
          }
        </td>
        <td className={`p-3.5 text-sm font-medium ${staleTextColor(quote.quoteDate)}`}>{formatDate(quote.quoteDate)}</td>
        <td className={`p-3.5 text-sm ${status === "expired" ? "text-red-500" : status === "expiring" ? "text-amber-500" : "text-slate-500"}`}>
          {formatDate(quote.expirationDate)}
        </td>
        <td className="p-3.5 text-sm font-bold text-emerald-600">
          {quote.quoteAmount ? `$${quote.quoteAmount.toLocaleString()}` : <span className="text-slate-400">—</span>}
        </td>
        <td className="p-3.5 text-sm text-slate-500">{items.length || <span className="text-slate-400">—</span>}</td>
        <td className="p-3.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
        </td>
        <td className="p-3.5">
          {qDeleteConfirm === quote._id ? (
            <div className="flex gap-1 items-center">
              <span className="text-xs text-red-500">Delete?</span>
              <button onClick={async e => { e.stopPropagation(); await onDelete(); }} className="text-xs text-red-600 font-medium hover:text-red-800">Yes</button>
              <button onClick={e => { e.stopPropagation(); onDeleteCancel(); }} className="text-xs text-slate-400 hover:text-slate-600">No</button>
            </div>
          ) : (
            <button onClick={e => { e.stopPropagation(); onDeleteConfirm(); }} className="text-slate-400 hover:text-red-500 text-xs transition-colors">×</button>
          )}
        </td>
      </tr>

      {/* Expanded line items — compact data table */}
      {isExpanded && items.length > 0 && (
        <tr className="border-b border-blue-100">
          <td colSpan={10} className="px-0 py-0">
            <div className="bg-blue-50/40 border-t border-blue-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-100">
                    <th className="text-left px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Price</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</th>
                    <th className="px-4 py-2 text-xs text-blue-500 font-medium text-right cursor-pointer hover:text-blue-700" onClick={onToggleExpand}>
                      collapse ↑
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {items.map((li, i) => (
                    <tr key={i} className="hover:bg-blue-50/60">
                      <td className="px-6 py-2 text-slate-800 font-medium">{li.m}</td>
                      <td className="px-3 py-2 text-slate-500 uppercase text-xs">{li.u}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700 tabular-nums">${li.p.toFixed(2)}</td>
                      <td className="px-3 py-2 text-slate-400 text-xs">{li.n || "—"}</td>
                      <td className="px-4 py-2" />
                    </tr>
                  ))}
                </tbody>
              </table>
              {meta.notes && <p className="text-xs text-slate-400 px-6 pb-2">{meta.notes}</p>}
            </div>
          </td>
        </tr>
      )}

      {/* Inline compare panel (flat list mode) */}
      {showComparePanel && (
        <tr className="border-b border-violet-100">
          <td colSpan={10} className="px-4 py-4 bg-violet-50/60">
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
          <h1 className="app-display" style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>Quotes & Pricing</h1>
          <p className="text-sm text-slate-500">Unified vendor quote database and material price library</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {([["quotes", "Vendor Quotes"], ["library", "Price Library"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
            {id === "quotes" && allQuotes.length > 0 && (
              <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{allQuotes.length}</span>
            )}
            {id === "library" && (datasheets?.length ?? 0) > 0 && (
              <span className="ml-2 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{datasheets!.length}</span>
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
              className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {quoteVendors.length > 0 && (
              <select value={qFilterVendor} onChange={e => setQFilterVendor(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Vendors</option>
                {quoteVendors.map(v => <option key={v}>{v}</option>)}
              </select>
            )}
            {quoteProjects.length > 0 && (
              <select value={qFilterProject} onChange={e => setQFilterProject(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Projects</option>
                <option value="__general">General (no project)</option>
                {quoteProjects.map(p => <option key={p}>{p}</option>)}
              </select>
            )}
            <select value={qFilterStatus} onChange={e => setQFilterStatus(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            {/* Group by vendor toggle */}
            <button
              onClick={() => { setGroupByVendor(v => !v); setCollapsedVendors(new Set()); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                groupByVendor
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="text-xs">⊞</span> Group by Vendor
            </button>
            <button
              onClick={openQuoteModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Upload Quote PDF
            </button>
          </div>

          {/* Quotes table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["", "Vendor", "Quote #", "Project", "Date", "Expires", "Total", "Items", "Status", ""].map((h, i) => (
                      <th key={i} className="text-left p-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotesWithProjects === undefined && (
                    <tr><td colSpan={10} className="text-center py-10 text-sm text-slate-400">Loading...</td></tr>
                  )}
                  {quotesWithProjects !== undefined && filteredQuotes.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">{qSearch || qFilterVendor || qFilterProject || qFilterStatus ? "No matching quotes" : "No quotes yet"}</p>
                        {!qSearch && !qFilterVendor && !qFilterProject && !qFilterStatus && (
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
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
                          <tr key={`vendor-${vendor}`} className="bg-slate-50 border-b border-slate-200">
                            <td colSpan={10} className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setCollapsedVendors(prev => {
                                    const next = new Set(prev);
                                    next.has(vendor) ? next.delete(vendor) : next.add(vendor);
                                    return next;
                                  })}
                                  className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {isCollapsed ? "▶" : "▼"}
                                </button>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{vendor}</span>
                                <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                                  {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
                                </span>
                                {hasCompare && (
                                  <button
                                    onClick={() => setCompareVendor(compareVendor === vendor ? null : vendor)}
                                    className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-200 px-2 py-0.5 rounded font-semibold transition-colors"
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
                              <td colSpan={10} className="px-4 py-4 bg-violet-50/60 border-b border-violet-100">
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
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
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
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
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
              className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {allDsVendors.length > 0 && (
              <select value={dsFilterVendor} onChange={e => setDsFilterVendor(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Vendors</option>
                {allDsVendors.map(v => <option key={v}>{v}</option>)}
              </select>
            )}
            <select value={dsFilterCategory} onChange={e => setDsFilterCategory(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
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
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {backfilling ? "Importing…" : "↓ Import from Quotes"}
                </button>
              )}
              {backfillResult && (
                <span className="self-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                  Added {backfillResult.upserted}, updated {backfillResult.updated}
                </span>
              )}
              <button onClick={() => { setDsForm(BLANK_DS); setManualModal(true); }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                + Add Product
              </button>
              {isPro ? (
                <button
                  onClick={() => { if (!atLimit) setPdfModal(true); }}
                  disabled={atLimit}
                  title={atLimit ? `Monthly limit of ${MONTHLY_LIMIT} reached` : "Upload a vendor price sheet PDF"}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Upload Price Sheet</span>
                  <span className="text-xs opacity-75">{extractionsUsed}/{MONTHLY_LIMIT}</span>
                </button>
              ) : (
                <button disabled title="Upgrade to Pro to upload vendor price sheets" className="px-4 py-2.5 bg-slate-200 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-2">
                  <span>Upload Price Sheet</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pro</span>
                </button>
              )}
            </div>
          </div>

          {/* Library table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Product", "Category", "Price", "Unit", "Coverage", "Vendor", "Price List Date", ""].map(h => (
                      <th key={h} className="text-left p-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasheets === undefined && (
                    <tr><td colSpan={8} className="text-center py-10 text-sm text-slate-400">Loading...</td></tr>
                  )}
                  {datasheets !== undefined && filteredDs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-16">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0H2.25m19.5 0v3a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-3" /></svg>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">{dsSearch || dsFilterVendor || dsFilterCategory ? "No matching products" : "No products yet"}</p>
                        {!dsSearch && !dsFilterVendor && !dsFilterCategory && (
                          <>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">Add products with pricing and coverage rates. This library carries across all projects.</p>
                            <button onClick={() => { setDsForm(BLANK_DS); setManualModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">+ Add First Product</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                  {filteredDs.map(ds => {
                    const stale = isStale(ds.quoteDate);
                    const veryStale = isVeryStale(ds.quoteDate);
                    return (
                      <tr key={ds._id} className={`border-b border-slate-100 hover:bg-slate-50 ${veryStale ? "bg-red-50/30" : stale ? "bg-amber-50/30" : ""}`}>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-slate-800">{ds.productName}</span>
                            {ds.quoteId && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">From Quote</span>}
                            {ds.isExtracted && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">AI</span>}
                          </div>
                          {ds.notes && <div className="text-xs text-slate-400 mt-0.5">{ds.notes}</div>}
                          {(ds.sourcePdfUrl || ds.pdfUrl) && (
                            <a href={(ds.sourcePdfUrl || ds.pdfUrl)!} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View PDF</a>
                          )}
                        </td>
                        <td className="p-3.5"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ds.category}</span></td>
                        <td className="p-3.5 text-sm font-bold text-emerald-600">${ds.unitPrice.toFixed(2)}</td>
                        <td className="p-3.5 text-sm text-slate-600">{ds.unit}</td>
                        <td className="p-3.5 text-sm text-slate-600">{ds.coverage ? `${ds.coverage} ${ds.coverageUnit || "SF"}` : <span className="text-slate-400">—</span>}</td>
                        <td className="p-3.5 text-sm text-slate-600">{ds.vendorName || <span className="text-slate-400">—</span>}</td>
                        <td className={`p-3.5 text-sm font-medium ${staleTextColor(ds.quoteDate)}`}>
                          {formatDate(ds.quoteDate)}
                          {veryStale && <span className="ml-1 text-xs text-red-400">(!)</span>}
                          {!veryStale && stale && <svg className="w-3 h-3 inline-block ml-1 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
                        </td>
                        <td className="p-3.5">
                          {dsDeleteConfirm === ds._id ? (
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-red-500">Delete?</span>
                              <button onClick={() => { deleteDatasheet({ id: ds._id as Id<"bidshield_datasheets"> }); setDsDeleteConfirm(null); }} className="text-xs text-red-600 font-medium hover:text-red-800">Yes</button>
                              <button onClick={() => setDsDeleteConfirm(null)} className="text-xs text-slate-400 hover:text-slate-600">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDsDeleteConfirm(ds._id)} className="text-slate-400 hover:text-red-500 text-xs transition-colors">×</button>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeQuoteModal}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Add Quote to Library</h2>
                {quoteModalStage === "upload" && <p className="text-[12px] text-slate-400 mt-0.5">Upload a vendor PDF — AI extracts everything automatically</p>}
                {quoteModalStage === "review" && quotePdfStorageId && <p className="text-[12px] text-emerald-600 mt-0.5">Extracted — review and save</p>}
                {quoteModalStage === "review" && !quotePdfStorageId && <p className="text-[12px] text-slate-400 mt-0.5">Enter quote details manually</p>}
              </div>
              <button onClick={closeQuoteModal} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {quoteModalStage === "upload" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Quote PDF *</label>
                    <input ref={quoteFileRef} type="file" accept=".pdf" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <p className="text-[11px] text-slate-400 mt-1">PDF only · max 10 MB</p>
                  </div>
                  {quoteExtractError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{quoteExtractError}</div>}
                  <button
                    onClick={handleQuoteExtract}
                    disabled={quoteExtracting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[13px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {quoteExtracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Reading quote...
                      </span>
                    ) : "Extract with AI →"}
                  </button>
                  <div className="text-center">
                    <button onClick={() => setQuoteModalStage("review")} className="text-[12px] text-slate-400 hover:text-slate-600 underline">No PDF? Enter manually instead</button>
                  </div>
                </div>
              )}

              {quoteModalStage === "review" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1">Vendor / Manufacturer *</label>
                    <input autoFocus type="text" value={quoteForm.vendorName} onChange={e => setQuoteForm(f => ({ ...f, vendorName: e.target.value }))} placeholder="e.g. Siplast, GAF, Carlisle" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Name</label>
                      <input type="text" value={quoteForm.rep} onChange={e => setQuoteForm(f => ({ ...f, rep: e.target.value }))} placeholder="John Martinez" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Quote Number</label>
                      <input type="text" value={quoteForm.quoteNum} onChange={e => setQuoteForm(f => ({ ...f, quoteNum: e.target.value }))} placeholder="24-889" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Email</label>
                      <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(f => ({ ...f, email: e.target.value }))} placeholder="rep@vendor.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Phone</label>
                      <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Quote Date</label>
                      <input type="date" value={quoteForm.quoteDate} onChange={e => setQuoteForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Expiration Date</label>
                      <input type="date" value={quoteForm.expirationDate} onChange={e => setQuoteForm(f => ({ ...f, expirationDate: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Total Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input type="number" value={quoteForm.quoteAmount} onChange={e => setQuoteForm(f => ({ ...f, quoteAmount: e.target.value }))} placeholder="0.00" step="0.01" className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Notes</label>
                      <input type="text" value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))} placeholder="NDL warranty, delivery..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  {/* Line items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-medium text-slate-500">Line Items</label>
                      <span className="text-[11px] text-slate-400">{quoteLineItems.filter(l => l.m.trim()).length} materials</span>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[1fr_56px_80px_24px] px-3 py-2 bg-slate-50 border-b border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Material</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Unit</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                        <span />
                      </div>
                      <div className="divide-y divide-slate-100">
                        {quoteLineItems.map((li, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_56px_80px_24px] gap-1 px-3 py-2 items-center">
                            <input type="text" value={li.m} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, m: e.target.value } : x))} placeholder="SBS Cap Sheet" className="border-0 bg-transparent text-[13px] text-slate-900 focus:outline-none placeholder-slate-300 min-w-0" />
                            <select value={li.u} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, u: e.target.value } : x))} className="border border-slate-200 rounded px-1 py-1 text-[12px] text-slate-700 focus:outline-none focus:border-blue-400">
                              {QUOTE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">$</span>
                              <input type="number" min={0} step={0.01} value={li.p || ""} onChange={e => setQuoteLineItems(items => items.map((x, i) => i === idx ? { ...x, p: parseFloat(e.target.value) || 0 } : x))} placeholder="0.00" className="w-full border border-slate-200 rounded pl-5 pr-1 py-1 text-[12px] text-slate-900 focus:outline-none focus:border-blue-400" />
                            </div>
                            <button onClick={() => setQuoteLineItems(items => items.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-400 transition-colors text-center leading-none">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setQuoteLineItems(items => [...items, { ...BLANK_LINE }])} className="mt-2 text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors">+ Add line item</button>
                  </div>
                  {!quotePdfStorageId && (
                    <button onClick={() => setQuoteModalStage("upload")} className="text-[12px] text-slate-400 hover:text-slate-600 underline text-left">← Upload a PDF instead</button>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <button
                onClick={quoteModalStage === "review" && quotePdfStorageId ? () => { setQuoteModalStage("upload"); setQuotePdfStorageId(""); } : closeQuoteModal}
                className="text-[13px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                {quoteModalStage === "review" && quotePdfStorageId ? "← Re-upload" : "Cancel"}
              </button>
              {quoteModalStage === "review" && (
                <button
                  onClick={handleQuoteSave}
                  disabled={quoteSaving || !quoteForm.vendorName.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {quoteSaving ? "Saving..." : "Save to Library"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Manual Add Product (Tab 2) ═══════════════════════════════ */}
      {manualModal && (
        <div onClick={() => setManualModal(false)} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Product to Library</h2>
              <button onClick={() => setManualModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input type="text" value={dsForm.productName} onChange={e => setDsForm(f => ({ ...f, productName: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g., TPO 60mil Membrane (10' wide)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select value={dsForm.category} onChange={e => setDsForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    {DATASHEET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit *</label>
                  <input type="text" list="units-list" value={dsForm.unit} onChange={e => setDsForm(f => ({ ...f, unit: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="RL, BD, GL..." />
                  <datalist id="units-list">{COMMON_UNITS.map(u => <option key={u} value={u} />)}</datalist>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" value={dsForm.unitPrice} onChange={e => setDsForm(f => ({ ...f, unitPrice: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Coverage Rate</label>
                  <div className="flex gap-1">
                    <input type="number" value={dsForm.coverage} onChange={e => setDsForm(f => ({ ...f, coverage: e.target.value }))} className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="1000" />
                    <input type="text" value={dsForm.coverageUnit} onChange={e => setDsForm(f => ({ ...f, coverageUnit: e.target.value }))} className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="SF" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                  <input type="text" value={dsForm.vendorName} onChange={e => setDsForm(f => ({ ...f, vendorName: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Distributor name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price List Date</label>
                  <input type="date" value={dsForm.quoteDate} onChange={e => setDsForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input type="text" value={dsForm.notes} onChange={e => setDsForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. 10' wide roll, mechanically attached only" />
              </div>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200">
              <button onClick={() => setManualModal(false)} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleManualSave} disabled={dsSaving || !dsForm.productName.trim() || !dsForm.unitPrice} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {dsSaving ? "Saving..." : "Add to Library"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: PDF Price Sheet Upload (Tab 2) ═══════════════════════════ */}
      {pdfModal && (
        <div onClick={previewItems ? undefined : closePdfModal} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Upload Vendor Price Sheet</h2>
                <p className="text-xs text-slate-400 mt-0.5">AI will extract all products and pricing — review before saving</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{extractionsUsed}/{MONTHLY_LIMIT} extractions this month</span>
                <button onClick={closePdfModal} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!previewItems ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Sheet PDF *</label>
                    <input ref={dsFileRef} type="file" accept=".pdf" className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name</label>
                      <input type="text" value={pdfVendor} onChange={e => setPdfVendor(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g., ABC Roofing Supply" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price List Date</label>
                      <input type="date" value={pdfDate} onChange={e => setPdfDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                  </div>
                  {extractError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{extractError}</div>}
                  <button onClick={handleExtract} disabled={extracting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {extracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Extracting pricing data...
                      </span>
                    ) : "Extract Pricing Data"}
                  </button>
                  <p className="text-xs text-slate-400 text-center">Uses AI to parse pricing tables — costs 1 of your {MONTHLY_LIMIT} monthly extractions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700 font-medium">Found {previewItems.length} products — select which to save</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: true })) ?? null)} className="text-xs text-blue-600 hover:text-blue-800">Select all</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: false })) ?? null)} className="text-xs text-slate-500 hover:text-slate-700">Deselect all</button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="w-8 p-3"></th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewItems.map((item, idx) => (
                          <tr key={idx} className={`border-b border-slate-100 ${item.selected ? "" : "opacity-40"}`}>
                            <td className="p-3"><input type="checkbox" checked={item.selected} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, selected: e.target.checked } : it) ?? null)} className="rounded" /></td>
                            <td className="p-3">
                              <input type="text" value={item.productName} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it) ?? null)} className="w-full bg-transparent border-0 text-slate-800 text-sm focus:outline-none focus:bg-slate-50 focus:border focus:border-slate-300 rounded px-1 py-0.5" />
                              {item.notes && <div className="text-xs text-slate-400 px-1">{item.notes}</div>}
                            </td>
                            <td className="p-3">
                              <select value={item.category} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, category: e.target.value } : it) ?? null)} className="bg-transparent border-0 text-slate-600 text-xs focus:outline-none">
                                {DATASHEET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-0.5">
                                <span className="text-slate-400 text-xs">$</span>
                                <input type="number" value={item.unitPrice} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, unitPrice: parseFloat(e.target.value) || 0 } : it) ?? null)} className="w-20 bg-transparent border-0 text-emerald-600 font-bold text-sm focus:outline-none focus:bg-slate-50 rounded px-1" />
                              </div>
                            </td>
                            <td className="p-3"><input type="text" value={item.unit} onChange={e => setPreviewItems(items => items?.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it) ?? null)} className="w-16 bg-transparent border-0 text-slate-600 text-sm focus:outline-none focus:bg-slate-50 rounded px-1" /></td>
                            <td className="p-3 text-slate-500 text-xs">{item.coverage ? `${item.coverage} ${item.coverageUnit || "SF"}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => { setPreviewItems(null); setExtractError(""); }} className="text-xs text-slate-400 hover:text-slate-600">← Re-upload different PDF</button>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200 flex-shrink-0">
              <button onClick={closePdfModal} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              {previewItems && (
                <button onClick={handleSaveExtracted} disabled={savingExtracted || previewItems.filter(i => i.selected).length === 0} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingExtracted ? "Saving..." : `Save ${previewItems.filter(i => i.selected).length} Products to Library`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
