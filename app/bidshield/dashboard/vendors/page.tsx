"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "membrane",   label: "Membrane",           color: "bg-blue-900/50 text-blue-300" },
  { key: "insulation", label: "Insulation",          color: "bg-purple-900/50 text-purple-300" },
  { key: "fasteners",  label: "Fasteners & Plates",  color: "bg-amber-900/50 text-amber-300" },
  { key: "adhesive",   label: "Adhesive & Sealant",  color: "bg-orange-900/50 text-orange-300" },
  { key: "sheet_metal",label: "Sheet Metal",         color: "bg-slate-700 text-slate-200" },
  { key: "lumber",     label: "Lumber & Blocking",   color: "bg-lime-900/40 text-lime-300" },
  { key: "accessories",label: "Accessories",         color: "bg-teal-900/40 text-teal-300" },
  { key: "miscellaneous", label: "Miscellaneous",    color: "bg-zinc-700 text-zinc-300" },
] as const;

type CategoryKey = typeof CATEGORIES[number]["key"];

function categoryMeta(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? { label: key, color: "bg-slate-700 text-slate-300" };
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_VENDORS = [
  {
    _id: "demo_v1" as unknown as Id<"bidshield_vendors">,
    userId: "demo",
    companyName: "Siplast Inc.",
    repName: "Mike Torres",
    repPhone: "(214) 555-0192",
    repEmail: "mtorres@siplast.com",
    territory: "Southwest",
    categories: ["membrane", "adhesive"],
    notes: "Preferred vendor for SBS systems. Typically 3–5 day lead on quotes.",
    active: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
  {
    _id: "demo_v2" as unknown as Id<"bidshield_vendors">,
    userId: "demo",
    companyName: "GAF Commercial",
    repName: "Sarah Chen",
    repPhone: "(973) 555-0148",
    repEmail: "schen@gaf.com",
    territory: "National",
    categories: ["membrane", "insulation", "accessories"],
    notes: "TPO and Timberline. Good pricing on system bundles.",
    active: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    _id: "demo_v3" as unknown as Id<"bidshield_vendors">,
    userId: "demo",
    companyName: "Polyglass USA",
    repName: "James Ruiz",
    repPhone: "(561) 555-0274",
    repEmail: "jruiz@polyglass.us",
    territory: "Southeast / Gulf",
    categories: ["membrane", "adhesive"],
    notes: "",
    active: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    _id: "demo_v4" as unknown as Id<"bidshield_vendors">,
    userId: "demo",
    companyName: "IKO Industries",
    repName: "Tom Waverly",
    repPhone: "(403) 555-0388",
    repEmail: "twaverly@iko.com",
    territory: "North / Midwest",
    categories: ["membrane", "insulation", "fasteners"],
    notes: "Competitive on polyiso. Requires 2 week lead for large orders.",
    active: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
  },
];

const DEMO_QUOTES_FOR_VENDOR: Record<string, Array<{
  projectName: string;
  quoteDate: string;
  quoteAmount: number;
  status: string;
  products: string[];
}>> = {
  demo_v1: [
    { projectName: "Riverside Medical Center", quoteDate: "2026-02-15", quoteAmount: 42800, status: "valid", products: ["Paradiene 20 TG Base Ply", "Paradiene 35 FR Cap Sheet", "Colply 20 Adhesive"] },
    { projectName: "Harbor View Office Park", quoteDate: "2026-01-08", quoteAmount: 38200, status: "expired", products: ["Paradiene 20 TG Base Ply", "Paradiene 35 FR Cap Sheet"] },
  ],
  demo_v2: [
    { projectName: "Riverside Medical Center", quoteDate: "2026-02-20", quoteAmount: 71400, status: "valid", products: ["TPO 60mil Membrane", "EnergyGuard Polyiso 2.5\"", "DensDeck Cover Board", "TPO Pipe Boots"] },
  ],
  demo_v3: [],
  demo_v4: [],
};

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

interface VendorFormData {
  companyName: string;
  repName: string;
  repPhone: string;
  repEmail: string;
  territory: string;
  categories: string[];
  notes: string;
  active: boolean;
}

const BLANK_FORM: VendorFormData = {
  companyName: "",
  repName: "",
  repPhone: "",
  repEmail: "",
  territory: "",
  categories: [],
  notes: "",
  active: true,
};

function VendorForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: VendorFormData;
  onSave: (data: VendorFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<VendorFormData>(initial);

  const toggleCat = (key: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(key)
        ? f.categories.filter((c) => c !== key)
        : [...f.categories, key],
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Company & Rep */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Company Name *</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            placeholder="e.g. Siplast Inc."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Rep Name</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
            value={form.repName}
            onChange={(e) => setForm((f) => ({ ...f, repName: e.target.value }))}
            placeholder="Mike Torres"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Territory / Region</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
            value={form.territory}
            onChange={(e) => setForm((f) => ({ ...f, territory: e.target.value }))}
            placeholder="Southwest"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Rep Phone</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
            value={form.repPhone}
            onChange={(e) => setForm((f) => ({ ...f, repPhone: e.target.value }))}
            placeholder="(214) 555-0100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Rep Email</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
            value={form.repEmail}
            onChange={(e) => setForm((f) => ({ ...f, repEmail: e.target.value }))}
            placeholder="rep@vendor.com"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--bs-text-muted)" }}>Categories Supplied</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label, color }) => {
            const selected = form.categories.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleCat(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? `${color} border-current`
                    : ""
                }`}
                style={!selected ? { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--bs-text-muted)" }}>Notes</label>
        <textarea
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
          style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--bs-teal)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--bs-border)"; }}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Lead times, preferences, contract notes..."
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors`}
          style={{ background: form.active ? "var(--bs-teal)" : "var(--bs-text-dim)" }}
        >
          <span className={`inline-block h-4 w-4 rounded-full transition-transform ${form.active ? "translate-x-4" : "translate-x-0"}`} style={{ background: "var(--bs-text-primary)" }} />
        </button>
        <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{form.active ? "Active" : "Inactive"}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          disabled={saving || !form.companyName.trim()}
          onClick={() => onSave(form)}
          className="px-4 py-2 disabled:opacity-50 text-sm font-semibold rounded-lg transition-colors"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
          {saving ? "Saving…" : "Save Vendor"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: "var(--bs-text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Vendor Detail Drawer ─────────────────────────────────────────────────────

function VendorDrawer({
  vendor,
  quotes,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
  isDemo,
}: {
  vendor: typeof DEMO_VENDORS[number];
  quotes: Array<{ projectName: string; quoteDate: string; quoteAmount: number; status: string; products: string[] }>;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isDemo: boolean;
}) {
  const totalQuoteValue = quotes.reduce((s, q) => s + q.quoteAmount, 0);

  // Compute price trend warnings
  const productPrices: Record<string, { date: string; price: number }[]> = {};
  for (const q of quotes) {
    for (const p of q.products) {
      if (!productPrices[p]) productPrices[p] = [];
      // Demo: fabricate per-product pricing from the quote total
      productPrices[p].push({ date: q.quoteDate, price: q.quoteAmount / q.products.length });
    }
  }

  const warnings: { product: string; from: number; to: number; pct: number }[] = [];
  for (const [product, entries] of Object.entries(productPrices)) {
    if (entries.length < 2) continue;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0].price;
    const last = sorted[sorted.length - 1].price;
    const pct = ((last - first) / first) * 100;
    if (pct > 3) warnings.push({ product, from: first, to: last, pct });
  }

  const statusColor: Record<string, string> = {
    valid: "",
    expiring: "",
    expired: "",
    received: "",
    requested: "",
  };
  const statusStyleMap: Record<string, { color: string; background: string }> = {
    valid: { color: "var(--bs-teal)", background: "var(--bs-teal-dim)" },
    expiring: { color: "var(--bs-amber)", background: "var(--bs-amber-dim)" },
    expired: { color: "var(--bs-red)", background: "var(--bs-red-dim)" },
    received: { color: "var(--bs-blue)", background: "var(--bs-blue-dim)" },
    requested: { color: "var(--bs-text-muted)", background: "var(--bs-bg-elevated)" },
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto flex flex-col"
        style={{ background: "var(--bs-bg-card)", borderLeft: "1px solid var(--bs-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-3" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold truncate" style={{ color: "var(--bs-text-primary)" }}>{vendor.companyName}</h2>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={vendor.active
                  ? { color: "var(--bs-teal)", background: "var(--bs-teal-dim)" }
                  : { color: "var(--bs-text-dim)", background: "var(--bs-bg-elevated)" }}>
                {vendor.active ? "Active" : "Inactive"}
              </span>
            </div>
            {vendor.territory && (
              <p className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{vendor.territory}</p>
            )}
          </div>
          <button onClick={onClose} className="transition-colors mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-5 flex flex-col gap-6">
          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Contact</h3>
            {vendor.repName && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--bs-text-secondary)" }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                {vendor.repName}
              </div>
            )}
            {vendor.repPhone && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--bs-text-secondary)" }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
                </svg>
                {vendor.repPhone}
              </div>
            )}
            {vendor.repEmail && (
              <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--bs-text-secondary)" }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <a href={`mailto:${vendor.repEmail}`} className="hover:underline" style={{ color: "var(--bs-teal)" }}>
                  {vendor.repEmail}
                </a>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--bs-text-dim)" }}>Categories Supplied</h3>
            <div className="flex flex-wrap gap-1.5">
              {vendor.categories.map((cat) => {
                const meta = categoryMeta(cat);
                return (
                  <span key={cat} className={`px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                );
              })}
              {vendor.categories.length === 0 && <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>None assigned</span>}
            </div>
          </div>

          {/* Notes */}
          {vendor.notes && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--bs-text-dim)" }}>Notes</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--bs-text-secondary)" }}>{vendor.notes}</p>
            </div>
          )}

          {/* Quote history */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Quote History</h3>
              {quotes.length > 0 && (
                <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{quotes.length} quote{quotes.length !== 1 ? "s" : ""} · ${totalQuoteValue.toLocaleString()} total</span>
              )}
            </div>
            {quotes.length === 0 ? (
              <div className="py-6 text-center text-sm rounded-lg" style={{ color: "var(--bs-text-dim)", background: "var(--bs-bg-elevated)" }}>
                No quotes uploaded from this vendor yet
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {quotes.map((q, i) => (
                  <div key={i} className="rounded-lg px-4 py-3 flex flex-col gap-1" style={{ background: "var(--bs-bg-elevated)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "var(--bs-text-primary)" }}>{q.projectName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={statusStyleMap[q.status] ?? { color: "var(--bs-text-muted)", background: "var(--bs-bg-card)" }}>
                        {q.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--bs-text-muted)" }}>
                      <span>{q.quoteDate}</span>
                      <span className="font-semibold" style={{ color: "var(--bs-text-secondary)" }}>${q.quoteAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: "var(--bs-text-muted)" }}>{q.products.join(" · ")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price trend warnings */}
          {warnings.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--bs-text-dim)" }}>Price Trends</h3>
              <div className="flex flex-col gap-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs" style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber)", color: "var(--bs-amber)" }}>
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--bs-amber)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                    <span>
                      <span className="font-semibold">{w.product}</span>:{" "}
                      ${w.from.toFixed(2)} → ${w.to.toFixed(2)}{" "}
                      <span className="font-bold">(+{w.pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--bs-border)" }}>
          <button
            onClick={onEdit}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: "var(--bs-teal)", color: "#13151a" }}
          >
            Edit Vendor
          </button>
          <button
            onClick={onToggleActive}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
          >
            {vendor.active ? "Deactivate" : "Activate"}
          </button>
          {!isDemo && (
            <button
              onClick={onDelete}
              className="px-3 py-2 transition-colors"
              style={{ color: "var(--bs-red)" }}
              title="Delete vendor"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  // Convex data (skip in demo)
  const liveVendors = useQuery(
    api.bidshield.getVendors,
    !isDemo && userId ? { userId } : "skip"
  );
  const createVendor = useMutation(api.bidshield.createVendor);
  const updateVendor = useMutation(api.bidshield.updateVendor);
  const deleteVendor = useMutation(api.bidshield.deleteVendor);

  const vendors = isDemo ? DEMO_VENDORS : (liveVendors ?? []);

  // UI state
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    if (filterCat === "all") return vendors;
    if (filterCat === "inactive") return vendors.filter((v) => !v.active);
    return vendors.filter((v) => v.categories.includes(filterCat) && v.active);
  }, [vendors, filterCat]);

  const selectedVendor = selectedId ? vendors.find((v) => String(v._id) === selectedId) ?? null : null;
  const editingVendor = editingId ? vendors.find((v) => String(v._id) === editingId) ?? null : null;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleCreate(data: VendorFormData) {
    if (isDemo) { setShowAddModal(false); return; }
    if (!userId) return;
    setSaving(true);
    try {
      await createVendor({
        userId,
        companyName: data.companyName,
        repName: data.repName || undefined,
        repPhone: data.repPhone || undefined,
        repEmail: data.repEmail || undefined,
        territory: data.territory || undefined,
        categories: data.categories,
        notes: data.notes || undefined,
      });
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(vendorId: string, data: VendorFormData) {
    if (isDemo) { setEditingId(null); return; }
    if (!userId) return;
    setSaving(true);
    try {
      await updateVendor({
        vendorId: vendorId as Id<"bidshield_vendors">,
        userId,
        companyName: data.companyName,
        repName: data.repName || undefined,
        repPhone: data.repPhone || undefined,
        repEmail: data.repEmail || undefined,
        territory: data.territory || undefined,
        categories: data.categories,
        notes: data.notes || undefined,
        active: data.active,
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(vendorId: string, currentActive: boolean) {
    if (isDemo) return;
    if (!userId) return;
    await updateVendor({
      vendorId: vendorId as Id<"bidshield_vendors">,
      userId,
      active: !currentActive,
    });
  }

  async function handleDelete(vendorId: string) {
    if (isDemo) return;
    if (!userId) return;
    await deleteVendor({ vendorId: vendorId as Id<"bidshield_vendors">, userId });
    setSelectedId(null);
    setConfirmDeleteId(null);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const activeCount = vendors.filter((v) => v.active).length;
  const inactiveCount = vendors.filter((v) => !v.active).length;
  const categoryCount = new Set(vendors.flatMap((v) => v.categories)).size;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="app-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>Vendors</h1>
          <p className="text-sm" style={{ color: "var(--bs-text-muted)" }}>
            Your material supplier address book — linked to quotes and pricing across all bids
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Vendor
        </button>
      </div>

      {/* Stat row */}
      {vendors.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Active Vendors", value: String(activeCount), accent: "var(--bs-teal)" },
            { label: "Inactive", value: String(inactiveCount), accent: "var(--bs-text-dim)" },
            { label: "Categories Covered", value: String(categoryCount), accent: "var(--bs-blue)" },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: "var(--bs-bg-card)", borderRadius: 12, padding: "12px 14px", borderLeft: `4px solid ${accent}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCat("all")}
          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
          style={filterCat === "all"
            ? { background: "var(--bs-teal)", color: "#13151a" }
            : { background: "var(--bs-bg-card)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
        >
          All ({vendors.filter(v => v.active).length})
        </button>
        {CATEGORIES.map(({ key, label }) => {
          const count = vendors.filter((v) => v.active && v.categories.includes(key)).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={filterCat === key
                ? { background: "var(--bs-teal)", color: "#13151a" }
                : { background: "var(--bs-bg-card)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
            >
              {label} ({count})
            </button>
          );
        })}
        {vendors.some((v) => !v.active) && (
          <button
            onClick={() => setFilterCat("inactive")}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={filterCat === "inactive"
              ? { background: "var(--bs-teal)", color: "#13151a" }
              : { background: "var(--bs-bg-card)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
          >
            Inactive ({vendors.filter((v) => !v.active).length})
          </button>
        )}
      </div>

      {/* Empty state */}
      {vendors.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg className="w-8 h-8" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--bs-text-primary)" }}>No vendors yet</p>
            <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--bs-text-muted)" }}>
              Add your material suppliers to speed up quote uploads and improve price matching
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: "var(--bs-teal)", color: "#13151a" }}
          >
            + Add Your First Vendor
          </button>
        </div>
      )}

      {/* Vendor grid */}
      {filteredVendors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const demoQuotes = isDemo ? (DEMO_QUOTES_FOR_VENDOR[String(vendor._id)] ?? []) : [];
            const lastQuote = demoQuotes.sort((a, b) => b.quoteDate.localeCompare(a.quoteDate))[0];
            const accentColor = vendor.active ? "var(--bs-teal)" : "var(--bs-text-dim)";
            return (
              <button
                key={String(vendor._id)}
                onClick={() => setSelectedId(String(vendor._id))}
                className={`text-left w-full flex flex-col gap-3 cursor-pointer ${!vendor.active ? "opacity-60" : ""}`}
                style={{ background: "var(--bs-bg-card)", borderRadius: 12, padding: "14px 16px", borderLeft: `4px solid ${accentColor}`, transition: "box-shadow 200ms ease, transform 150ms ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bs-text-primary)", lineHeight: 1.2 }} className="truncate">{vendor.companyName}</div>
                    {vendor.repName && (
                      <div style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }} className="truncate">{vendor.repName}</div>
                    )}
                  </div>
                  {!vendor.active && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)", flexShrink: 0 }}>
                      Inactive
                    </span>
                  )}
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-1.5">
                  {vendor.categories.slice(0, 3).map((cat) => {
                    const meta = categoryMeta(cat);
                    return (
                      <span key={cat} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    );
                  })}
                  {vendor.categories.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>
                      +{vendor.categories.length - 3}
                    </span>
                  )}
                  {vendor.categories.length === 0 && (
                    <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>No categories</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: "1px solid var(--bs-border)" }}>
                  {lastQuote ? (
                    <span style={{ fontSize: 11, color: "var(--bs-text-muted)" }}>Last quote: {lastQuote.quoteDate}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>No quotes yet</span>
                  )}
                  {demoQuotes.length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--bs-teal)" }}>{demoQuotes.length} quote{demoQuotes.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results for filter */}
      {filteredVendors.length === 0 && vendors.length > 0 && (
        <div className="py-12 text-center text-sm" style={{ color: "var(--bs-text-dim)" }}>
          No vendors match this filter
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <div className="relative w-full max-w-lg rounded-2xl p-6" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--bs-text-primary)" }}>Add Vendor</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--bs-text-dim)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <VendorForm
              initial={BLANK_FORM}
              onSave={handleCreate}
              onCancel={() => setShowAddModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <div className="relative w-full max-w-lg rounded-2xl p-6" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--bs-text-primary)" }}>Edit Vendor</h2>
              <button onClick={() => setEditingId(null)} style={{ color: "var(--bs-text-dim)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <VendorForm
              initial={{
                companyName: editingVendor.companyName,
                repName: editingVendor.repName ?? "",
                repPhone: editingVendor.repPhone ?? "",
                repEmail: editingVendor.repEmail ?? "",
                territory: editingVendor.territory ?? "",
                categories: editingVendor.categories,
                notes: editingVendor.notes ?? "",
                active: editingVendor.active,
              }}
              onSave={(data) => handleUpdate(editingId, data)}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Vendor Detail Drawer */}
      {selectedId && selectedVendor && !editingId && (
        <VendorDrawer
          vendor={selectedVendor as typeof DEMO_VENDORS[number]}
          quotes={isDemo ? (DEMO_QUOTES_FOR_VENDOR[selectedId] ?? []) : []}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setEditingId(selectedId); setSelectedId(null); }}
          onToggleActive={() => handleToggleActive(selectedId, selectedVendor.active)}
          onDelete={() => setConfirmDeleteId(selectedId)}
          isDemo={isDemo}
        />
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <div className="relative rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2" style={{ color: "var(--bs-text-primary)" }}>Delete vendor?</h3>
            <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>This will remove the vendor record. Linked quotes will not be deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ background: "var(--bs-red)" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
