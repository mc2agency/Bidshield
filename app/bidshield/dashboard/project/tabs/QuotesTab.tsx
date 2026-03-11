"use client";

import { useState, useMemo } from "react";
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

// ─── Blank quote form ─────────────────────────────────────────────────────────
const BLANK_FORM = {
  vendorName: "", rep: "", email: "", phone: "",
  quoteNum: "", quoteDate: "", expirationDate: "", notes: "",
};
const BLANK_LINE: LineItem = { m: "", u: "RL", p: 0, n: "" };
const UNITS = ["RL", "SQ", "SF", "LF", "EA", "GAL", "BG", "TON", "LS"];

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
  const createQuoteMut = useMutation(api.bidshield.createQuote);
  const updateQuoteMut = useMutation(api.bidshield.updateQuote);
  const deleteQuoteMut = useMutation(api.bidshield.deleteQuote);

  const [demoQuotes, setDemoQuotes] = useState<any[]>(DEMO_QUOTES_RAW);
  const resolvedQuotes = isDemo ? demoQuotes : (quotes ?? []);

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [form, setForm]               = useState(BLANK_FORM);
  const [lineItems, setLineItems]     = useState<LineItem[]>([{ ...BLANK_LINE }]);
  const [saving, setSaving]           = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const openModal = () => {
    setForm(BLANK_FORM);
    setLineItems([{ ...BLANK_LINE }]);
    setStep(1);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.vendorName || (!isDemo && !userId)) return;
    setSaving(true);
    try {
      const products = encodeLineItems(lineItems.filter(l => l.m.trim()));
      const notes    = encodeMeta({ rep: form.rep, quoteNum: form.quoteNum, notes: form.notes });
      const total    = lineItems.reduce((s, l) => s + (l.p || 0), 0); // rough sum; real total from quoteAmount

      if (isDemo) {
        const newQ = {
          _id: `demo_q${Date.now()}`, vendorName: form.vendorName,
          vendorEmail: form.email, vendorPhone: form.phone,
          category: "system", quoteDate: form.quoteDate, expirationDate: form.expirationDate,
          status: "received", quoteAmount: undefined, products, notes,
        };
        setDemoQuotes(p => [...p, newQ]);
      } else {
        await createQuoteMut({
          userId: userId!,
          projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined,
          vendorName: form.vendorName,
          vendorEmail: form.email || undefined,
          vendorPhone: form.phone || undefined,
          category: "system",
          products,
          quoteDate: form.quoteDate || undefined,
          expirationDate: form.expirationDate || undefined,
          notes,
        });
      }
      notify("Quote saved!");
      setModalOpen(false);
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

  // Comparison table — materials found in all quotes
  const comparison = useMemo(() => {
    if (resolvedQuotes.length < 2) return null;
    // Collect all unique material names
    const allMaterials = new Set<string>();
    for (const q of resolvedQuotes) {
      for (const item of decodeLineItems(q.products || [])) {
        if (item.m.trim()) allMaterials.add(item.m.trim());
      }
    }
    if (allMaterials.size === 0) return null;
    const materials = Array.from(allMaterials);
    // Build price map: material → [vendor price, ...]
    const rows = materials.map(mat => {
      const prices = resolvedQuotes.map((q: any) => {
        const found = decodeLineItems(q.products || []).find(l => l.m.trim() === mat);
        return found ? found.p : null;
      });
      const validPrices = prices.filter((p): p is number => p !== null);
      const minPrice    = validPrices.length > 0 ? Math.min(...validPrices) : null;
      return { mat, prices, minPrice };
    });
    // System totals per vendor
    const totals = resolvedQuotes.map((q: any) => q.quoteAmount ?? null);
    const minTotal = totals.filter((t): t is number => t !== null).reduce((a, b) => (b < a ? b : a), Infinity);
    return { vendors: resolvedQuotes.map((q: any) => q.vendorName), rows, totals, minTotal };
  }, [resolvedQuotes]);

  if (!isDemo && quotes === undefined) {
    return <div className="text-slate-500 text-sm py-8 text-center">Loading quotes...</div>;
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg text-sm font-medium z-50 shadow-lg">
          {notification}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          <span className="text-[13px] text-slate-500">quote{stats.total !== 1 ? "s" : ""}</span>
        </div>
        {stats.bestDpsf && (
          <>
            <span className="text-slate-200">·</span>
            <span className="text-[13px] text-slate-500">Best <span className="font-semibold text-emerald-600">${stats.bestDpsf.toFixed(2)}/SF</span></span>
          </>
        )}
        {stats.expiring > 0 && (
          <>
            <span className="text-slate-200">·</span>
            <span className="text-[13px] text-amber-600 font-medium">{stats.expiring} expiring soon</span>
          </>
        )}
        {stats.expired > 0 && (
          <>
            <span className="text-slate-200">·</span>
            <span className="text-[13px] text-red-500 font-medium">{stats.expired} expired</span>
          </>
        )}
        <div className="ml-auto flex gap-2">
          {comparison && (
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {showCompare ? "Hide Compare" : "Compare →"}
            </button>
          )}
          {!isDemo && (
            <button
              onClick={openModal}
              style={{ background: "#10b981" }} className="text-[13px] font-semibold px-4 py-1.5 rounded-lg text-white hover:opacity-90 transition-colors"
            >
              + Add Quote
            </button>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {showCompare && comparison && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <div className="px-4 py-2.5" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price Comparison</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[12px]">Material</th>
                  {comparison.vendors.map((v, i) => (
                    <th key={i} className="text-right px-4 py-2.5 font-semibold text-slate-600 text-[12px] whitespace-nowrap">{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map(({ mat, prices, minPrice }) => (
                  <tr key={mat} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td className="px-4 py-2.5 text-slate-700">{mat}</td>
                    {prices.map((p, i) => (
                      <td key={i} className="text-right px-4 py-2.5 tabular-nums font-medium" style={{
                        color: p === minPrice ? "#10b981" : p !== null ? "#374151" : "#9ca3af",
                      }}>
                        {p !== null ? `$${p.toFixed(2)}` : "—"}
                        {p === minPrice && <span className="ml-1 text-[10px]">✓</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* System total row */}
                <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                  <td className="px-4 py-3 font-bold text-slate-800 text-[12px] uppercase tracking-wider">System Total</td>
                  {comparison.totals.map((t, i) => {
                    const isBest = t !== null && t === comparison.minTotal;
                    const dpsf = t && (project as any)?.grossRoofArea ? t / (project as any).grossRoofArea : null;
                    return (
                      <td key={i} className="text-right px-4 py-3 tabular-nums" style={{ color: isBest ? "#10b981" : "#374151" }}>
                        {t ? (
                          <>
                            <div className="font-bold text-[13px]">${(t / 1000).toFixed(0)}K</div>
                            <div className="text-[11px] font-medium">{dpsf ? `$${dpsf.toFixed(2)}/SF` : ""}</div>
                            {isBest && <div className="text-[10px] font-bold mt-0.5">🏆 Best value</div>}
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
        <div className="text-center py-16 rounded-xl border border-dashed border-slate-200">
          <div className="text-3xl mb-3">📄</div>
          <div className="text-sm font-semibold text-slate-700 mb-1">No quotes yet</div>
          <div className="text-xs text-slate-400 mb-4">Add vendor quotes to compare pricing across manufacturers</div>
          {!isDemo && (
            <button onClick={openModal} style={{ background: "#10b981" }} className="px-5 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors">
              + Add First Quote
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resolvedQuotes.map((quote: any) => {
            const status    = getEffectiveStatus(quote);
            const meta      = decodeMeta(quote.notes);
            const items     = decodeLineItems(quote.products || []);
            const dpsf      = quote.quoteAmount && (project as any)?.grossRoofArea
              ? (quote.quoteAmount / (project as any).grossRoofArea).toFixed(2)
              : null;

            const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
              valid:     { bg: "#f0fdf4", text: "#16a34a", label: "✓ Active" },
              received:  { bg: "#eff6ff", text: "#2563eb", label: "📥 Received" },
              requested: { bg: "#f5f3ff", text: "#7c3aed", label: "📧 Requested" },
              expiring:  { bg: "#fffbeb", text: "#d97706", label: "⚠ Expiring" },
              expired:   { bg: "#fef2f2", text: "#dc2626", label: "✗ Expired" },
              none:      { bg: "#f8fafc", text: "#94a3b8", label: "○ None" },
            };
            const ss = statusStyle[status] || statusStyle.none;

            return (
              <div
                key={quote._id}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #e2e8f0" }}
              >
                {/* Card header */}
                <div className="px-5 py-4" style={{ background: "#0f1117" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] font-bold text-white">{quote.vendorName}</span>
                        {meta.quoteNum && (
                          <span className="text-[11px] text-slate-400 font-mono">Quote #{meta.quoteNum}</span>
                        )}
                      </div>
                      {meta.rep && (
                        <div className="text-[12px] text-slate-400 mt-0.5">
                          Rep: {meta.rep}
                          {quote.vendorEmail && <span> · <a href={`mailto:${quote.vendorEmail}`} className="hover:text-slate-200 transition-colors">{quote.vendorEmail}</a></span>}
                          {quote.vendorPhone && <span> · {quote.vendorPhone}</span>}
                        </div>
                      )}
                      {!meta.rep && quote.vendorEmail && (
                        <div className="text-[12px] text-slate-400 mt-0.5">{quote.vendorEmail}</div>
                      )}
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded shrink-0"
                      style={{ background: ss.bg, color: ss.text }}
                    >
                      {ss.label}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2.5 text-[11px] text-slate-500">
                    {quote.quoteDate     && <span>Quoted: {formatDate(quote.quoteDate)}</span>}
                    {quote.expirationDate && <span style={{ color: status === "expired" ? "#ef4444" : status === "expiring" ? "#f59e0b" : "#94a3b8" }}>Expires: {formatDate(quote.expirationDate)}</span>}
                  </div>
                </div>

                {/* Line items */}
                {items.length > 0 && (
                  <div style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <div className="px-5 py-2" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Materials Covered</span>
                    </div>
                    {items.map((li, i) => (
                      li.m.trim() ? (
                        <div
                          key={i}
                          className="flex items-center px-5 py-2.5"
                          style={{ borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : undefined }}
                        >
                          <span className="flex-1 text-[13px] text-slate-700">{li.m}</span>
                          {li.n && <span className="text-[11px] text-slate-400 mr-4 hidden sm:block">{li.n}</span>}
                          <span className="text-[13px] font-semibold text-slate-900 tabular-nums">
                            ${li.p.toFixed(2)}/{li.u.toLowerCase()}
                          </span>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}

                {/* Totals + notes */}
                <div className="px-5 py-3 flex items-center justify-between gap-4" style={{ background: "#fafafa" }}>
                  <div>
                    {meta.notes && (
                      <p className="text-[11px] text-slate-500 mb-1">{meta.notes}</p>
                    )}
                    {quote.quoteAmount ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-[15px] font-bold text-slate-900">${quote.quoteAmount.toLocaleString()}</span>
                        {dpsf && <span className="text-[13px] text-slate-500 font-medium">${dpsf}/SF</span>}
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-400">Total not set</span>
                    )}
                  </div>
                  {!isDemo && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(quote)}
                        className="text-[12px] text-slate-400 hover:text-red-600 transition-colors px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Quote Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">Add Quote</h2>
              <div className="flex items-center gap-4">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3] as const).map(s => (
                    <div
                      key={s}
                      className="flex items-center justify-center rounded-full text-[11px] font-bold transition-all"
                      style={{
                        width: 22, height: 22,
                        background: step >= s ? "#0f1117" : "#f1f5f9",
                        color: step >= s ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Step 1 — Vendor Info */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Vendor Info</h3>
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1">Manufacturer / Vendor *</label>
                    <input
                      autoFocus
                      type="text"
                      value={form.vendorName}
                      onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))}
                      placeholder="e.g. Siplast, GAF, Carlisle"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Name</label>
                      <input type="text" value={form.rep} onChange={e => setForm(f => ({ ...f, rep: e.target.value }))} placeholder="John Martinez" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Quote Number</label>
                      <input type="text" value={form.quoteNum} onChange={e => setForm(f => ({ ...f, quoteNum: e.target.value }))} placeholder="24-889" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rep@vendor.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Rep Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Quote Date</label>
                      <input type="date" value={form.quoteDate} onChange={e => setForm(f => ({ ...f, quoteDate: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-slate-500 mb-1">Expiration Date</label>
                      <input type="date" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-slate-500 mb-1">Notes</label>
                    <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Bulk pricing for 45k SF, includes delivery..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>
              )}

              {/* Step 2 — Line Items */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Materials Covered</h3>
                  <p className="text-[12px] text-slate-500">Enter each material with its unit price. Quantities come from the Materials tab.</p>

                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_64px_88px_24px] gap-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Material</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Unit</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Unit Price</div>
                    <div />
                  </div>

                  {lineItems.map((li, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_64px_88px_24px] gap-2 items-center">
                      <input
                        type="text"
                        value={li.m}
                        onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, m: e.target.value } : x))}
                        placeholder="SBS Cap Sheet"
                        className="border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-400"
                      />
                      <select
                        value={li.u}
                        onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, u: e.target.value } : x))}
                        className="border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-400"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">$</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={li.p || ""}
                          onChange={e => setLineItems(items => items.map((x, i) => i === idx ? { ...x, p: parseFloat(e.target.value) || 0 } : x))}
                          placeholder="0.00"
                          className="w-full border border-slate-200 rounded-md pl-5 pr-2 py-1.5 text-[13px] text-slate-900 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <button
                        onClick={() => setLineItems(items => items.filter((_, i) => i !== idx))}
                        className="text-slate-300 hover:text-red-400 transition-colors text-[16px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => setLineItems(items => [...items, { ...BLANK_LINE }])}
                    className="text-[13px] text-emerald-600 hover:text-emerald-700 font-medium text-left transition-colors"
                  >
                    + Add line item
                  </button>
                </div>
              )}

              {/* Step 3 — Summary */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Summary</h3>
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                    <div className="px-4 py-3" style={{ background: "#0f1117" }}>
                      <div className="text-[15px] font-bold text-white">{form.vendorName}</div>
                      {form.rep && <div className="text-[12px] text-slate-400">Rep: {form.rep}{form.email ? ` · ${form.email}` : ""}</div>}
                      {(form.quoteDate || form.expirationDate) && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          {form.quoteDate && `Quoted: ${formatDate(form.quoteDate)}`}
                          {form.quoteDate && form.expirationDate && " · "}
                          {form.expirationDate && `Expires: ${formatDate(form.expirationDate)}`}
                        </div>
                      )}
                    </div>
                    <div>
                      {lineItems.filter(l => l.m.trim()).map((li, i, arr) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-2.5"
                          style={{ borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : undefined }}
                        >
                          <span className="text-[13px] text-slate-700">{li.m}</span>
                          <span className="text-[13px] font-semibold text-slate-900 tabular-nums">${li.p.toFixed(2)}/{li.u.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                    {form.notes && (
                      <div className="px-4 py-2.5 border-t border-slate-100">
                        <p className="text-[11px] text-slate-500">{form.notes}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-400">Quantities will be auto-calculated using data from the Materials tab once saved.</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : setModalOpen(false)}
                className="text-[13px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                {step === 1 ? "Cancel" : "← Back"}
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
                  disabled={step === 1 && !form.vendorName.trim()}
                  className="px-5 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
