"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const DATASHEET_CATEGORIES = [
  "Membrane",
  "Insulation",
  "Cover Board",
  "Adhesive",
  "Fasteners",
  "Flashing",
  "Sealant",
  "Drain",
  "Accessory",
  "Coatings",
  "Sheet Metal",
  "Other",
];

const COMMON_UNITS = ["RL", "BD", "BX", "GL", "PC", "EA", "SF", "LF", "SQ", "TN", "CS"];

const DAYS_ORANGE = 90;
const DAYS_RED = 180;
const MONTHLY_LIMIT = 50;

function getQuoteDateColor(date: string | null | undefined): string {
  if (!date) return "text-slate-400";
  const d = new Date(date).getTime();
  const now = Date.now();
  if (now - d > DAYS_RED * 86400000) return "text-red-500";
  if (now - d > DAYS_ORANGE * 86400000) return "text-amber-500";
  return "text-emerald-600";
}

function formatQuoteDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isStale(date: string | null | undefined): boolean {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() > DAYS_ORANGE * 86400000;
}

const blankForm = {
  productName: "",
  category: "Membrane",
  unit: "RL",
  unitPrice: "",
  coverage: "",
  coverageUnit: "SF",
  vendorName: "",
  quoteDate: "",
  pdfUrl: "",
  notes: "",
};

type ExtractedItem = {
  productName: string;
  category: string;
  unit: string;
  unitPrice: number;
  coverage: number | null;
  coverageUnit: string | null;
  notes: string | null;
  selected: boolean;
};

export default function DatasheetsPage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const datasheets = useQuery(api.bidshield.getDatasheets, userId ? { userId } : "skip");
  const subscription = useQuery(api.users.getUserSubscription, userId ? { clerkId: userId } : "skip");
  const monthlyCount = useQuery(api.bidshield.getMonthlyExtractionCount, userId ? { userId } : "skip");
  const addDatasheet = useMutation(api.bidshield.addDatasheet);
  const deleteDatasheet = useMutation(api.bidshield.deleteDatasheet);
  const generateUploadUrl = useMutation(api.bidshield.generatePdfUploadUrl);

  const isPro = subscription?.isPro ?? false;
  const extractionsUsed = monthlyCount ?? 0;
  const atLimit = extractionsUsed >= MONTHLY_LIMIT;

  // Search + filters
  const [search, setSearch] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Modals
  const [manualModal, setManualModal] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Manual add form
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  // PDF extraction
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfVendor, setPdfVendor] = useState("");
  const [pdfDate, setPdfDate] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [previewItems, setPreviewItems] = useState<ExtractedItem[] | null>(null);
  const [savingExtracted, setSavingExtracted] = useState(false);
  const [pdfStorageId, setPdfStorageId] = useState<string>("");

  // Derived lists
  const allVendors = Array.from(new Set((datasheets ?? []).map((d) => d.vendorName).filter(Boolean) as string[])).sort();

  const filtered = (datasheets ?? []).filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.productName.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      (d.vendorName ?? "").toLowerCase().includes(q);
    const matchVendor = !filterVendor || d.vendorName === filterVendor;
    const matchCategory = !filterCategory || d.category === filterCategory;
    return matchSearch && matchVendor && matchCategory;
  });

  const staleCount = (datasheets ?? []).filter((d) => isStale(d.quoteDate)).length;

  // Manual save
  const handleManualSave = async () => {
    if (!form.productName.trim() || !form.unit.trim() || !form.unitPrice) return;
    setSaving(true);
    await addDatasheet({
      userId,
      productName: form.productName.trim(),
      category: form.category,
      unit: form.unit.trim(),
      unitPrice: parseFloat(form.unitPrice),
      coverage: form.coverage ? parseFloat(form.coverage) : undefined,
      coverageUnit: form.coverageUnit.trim() || undefined,
      vendorName: form.vendorName.trim() || undefined,
      quoteDate: form.quoteDate || undefined,
      pdfUrl: form.pdfUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setSaving(false);
    setForm(blankForm);
    setManualModal(false);
  };

  // PDF extraction
  const handleExtract = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setExtractError("");
    setExtracting(true);
    setPreviewItems(null);

    try {
      // Upload to Convex storage
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
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/bidshield/extract-price-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, vendorName: pdfVendor, priceListDate: pdfDate }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Extraction failed");

      setPreviewItems(
        (data.items as Omit<ExtractedItem, "selected">[]).map((item) => ({
          ...item,
          category: DATASHEET_CATEGORIES.includes(item.category) ? item.category : "Other",
          selected: true,
        }))
      );
    } catch (err: any) {
      setExtractError(err.message ?? "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveExtracted = async () => {
    if (!previewItems) return;
    setSavingExtracted(true);
    const selected = previewItems.filter((i) => i.selected);
    for (const item of selected) {
      await addDatasheet({
        userId,
        productName: item.productName,
        category: item.category,
        unit: item.unit,
        unitPrice: item.unitPrice,
        coverage: item.coverage ?? undefined,
        coverageUnit: item.coverageUnit ?? undefined,
        vendorName: pdfVendor.trim() || undefined,
        quoteDate: pdfDate || undefined,
        sourcePdf: pdfStorageId || undefined,
        isExtracted: true,
        notes: item.notes ?? undefined,
      });
    }
    setSavingExtracted(false);
    setPdfModal(false);
    setPdfVendor("");
    setPdfDate("");
    setPdfStorageId("");
    setPreviewItems(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    await deleteDatasheet({ id: id as Id<"bidshield_datasheets"> });
    setDeleteConfirm(null);
  };

  const closePdfModal = () => {
    setPdfModal(false);
    setPdfVendor("");
    setPdfDate("");
    setPdfStorageId("");
    setPreviewItems(null);
    setExtractError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Material Datasheet Library</h2>
          <p className="text-sm text-slate-400 mt-1">
            Coverage rates and pricing from manufacturer specs — carries across all projects
          </p>
        </div>
        {staleCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ {staleCount} product{staleCount !== 1 ? "s" : ""} with quotes older than 90 days
          </div>
        )}
      </div>

      {/* Search + Filters + Add buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search products, categories, vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {allVendors.length > 0 && (
          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vendors</option>
            {allVendors.map((v) => <option key={v}>{v}</option>)}
          </select>
        )}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {DATASHEET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => { setForm(blankForm); setManualModal(true); }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Add Product
          </button>
          {isPro ? (
            <button
              onClick={() => { if (!atLimit) setPdfModal(true); }}
              disabled={atLimit}
              title={atLimit ? `Monthly limit of ${MONTHLY_LIMIT} extractions reached` : "Upload a vendor price sheet PDF"}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Upload Price Sheet</span>
              <span className="text-xs opacity-75">{extractionsUsed}/{MONTHLY_LIMIT}</span>
            </button>
          ) : (
            <button
              disabled
              title="Upgrade to Pro to upload vendor price sheets"
              className="px-4 py-2.5 bg-slate-200 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-2"
            >
              <span>Upload Price Sheet</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pro</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Product", "Category", "Price", "Unit", "Coverage", "Vendor", "Price List Date", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left p-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasheets === undefined && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-slate-400">Loading...</td>
                </tr>
              )}
              {datasheets !== undefined && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="text-3xl mb-3">📑</div>
                    <p className="text-sm text-slate-500 mb-1">
                      {search || filterVendor || filterCategory ? "No matching products" : "No products yet"}
                    </p>
                    {!search && !filterVendor && !filterCategory && (
                      <>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                          Add manufacturer products with pricing and coverage rates. Your library carries across all projects.
                        </p>
                        <button
                          onClick={() => { setForm(blankForm); setManualModal(true); }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                        >
                          + Add First Product
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((ds) => {
                const stale = isStale(ds.quoteDate);
                const veryStale = ds.quoteDate
                  ? Date.now() - new Date(ds.quoteDate).getTime() > DAYS_RED * 86400000
                  : false;
                return (
                  <tr
                    key={ds._id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${veryStale ? "bg-red-50/30" : stale ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-800">{ds.productName}</span>
                        {ds.isExtracted && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">AI</span>
                        )}
                      </div>
                      {ds.notes && <div className="text-xs text-slate-400 mt-0.5">{ds.notes}</div>}
                      {(ds.sourcePdfUrl || ds.pdfUrl) && (
                        <a
                          href={(ds.sourcePdfUrl || ds.pdfUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          📄 View PDF
                        </a>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ds.category}</span>
                    </td>
                    <td className="p-3.5 text-sm font-bold text-emerald-600">${ds.unitPrice.toFixed(2)}</td>
                    <td className="p-3.5 text-sm text-slate-600">{ds.unit}</td>
                    <td className="p-3.5 text-sm text-slate-600">
                      {ds.coverage ? `${ds.coverage} ${ds.coverageUnit || "SF"}` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3.5 text-sm text-slate-600">{ds.vendorName || <span className="text-slate-400">—</span>}</td>
                    <td className={`p-3.5 text-sm font-medium ${getQuoteDateColor(ds.quoteDate)}`}>
                      {formatQuoteDate(ds.quoteDate)}
                      {veryStale && <span className="ml-1 text-xs text-red-400">(!)</span>}
                      {!veryStale && stale && <span className="ml-1 text-xs text-amber-400">⚠</span>}
                    </td>
                    <td className="p-3.5">
                      {deleteConfirm === ds._id ? (
                        <div className="flex gap-1 items-center">
                          <span className="text-xs text-red-500">Delete?</span>
                          <button onClick={() => handleDelete(ds._id)} className="text-xs text-red-600 font-medium hover:text-red-800">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-slate-400 hover:text-slate-600">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(ds._id)} className="text-slate-400 hover:text-red-500 text-xs transition-colors">×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      {manualModal && (
        <div
          onClick={() => setManualModal(false)}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Product to Library</h2>
              <button onClick={() => setManualModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm(f => ({ ...f, productName: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TPO 60mil Membrane (10' wide)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DATASHEET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    list="units-list"
                    value={form.unit}
                    onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="RL, BD, GL..."
                  />
                  <datalist id="units-list">
                    {COMMON_UNITS.map((u) => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Coverage Rate</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={form.coverage}
                      onChange={(e) => setForm(f => ({ ...f, coverage: e.target.value }))}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                    />
                    <input
                      type="text"
                      value={form.coverageUnit}
                      onChange={(e) => setForm(f => ({ ...f, coverageUnit: e.target.value }))}
                      className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SF"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={form.vendorName}
                    onChange={(e) => setForm(f => ({ ...f, vendorName: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Distributor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price List Date</label>
                  <input
                    type="date"
                    value={form.quoteDate}
                    onChange={(e) => setForm(f => ({ ...f, quoteDate: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Spec Sheet URL</label>
                <input
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => setForm(f => ({ ...f, pdfUrl: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10' wide roll, mechanically attached only"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setManualModal(false)}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSave}
                disabled={saving || !form.productName.trim() || !form.unitPrice}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Add to Library"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {pdfModal && (
        <div
          onClick={previewItems ? undefined : closePdfModal}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 max-h-[90vh] flex flex-col"
          >
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={pdfVendor}
                        onChange={(e) => setPdfVendor(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ABC Roofing Supply"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price List Date</label>
                      <input
                        type="date"
                        value={pdfDate}
                        onChange={(e) => setPdfDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {extractError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {extractError}
                    </div>
                  )}

                  <button
                    onClick={handleExtract}
                    disabled={extracting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {extracting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Extracting pricing data...
                      </span>
                    ) : "Extract Pricing Data"}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    Uses AI to parse pricing tables — costs 1 of your {MONTHLY_LIMIT} monthly extractions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700 font-medium">
                      Found {previewItems.length} products — review and select which to save
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: true })) ?? null)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select all
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => setPreviewItems(items => items?.map(i => ({ ...i, selected: false })) ?? null)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Deselect all
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="w-8 p-3"></th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                          <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewItems.map((item, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-slate-100 ${item.selected ? "" : "opacity-40"}`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) =>
                                  setPreviewItems(items =>
                                    items?.map((it, i) => i === idx ? { ...it, selected: e.target.checked } : it) ?? null
                                  )
                                }
                                className="rounded"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={item.productName}
                                onChange={(e) =>
                                  setPreviewItems(items =>
                                    items?.map((it, i) => i === idx ? { ...it, productName: e.target.value } : it) ?? null
                                  )
                                }
                                className="w-full bg-transparent border-0 text-slate-800 text-sm focus:outline-none focus:bg-slate-50 focus:border focus:border-slate-300 rounded px-1 py-0.5"
                              />
                              {item.notes && <div className="text-xs text-slate-400 px-1">{item.notes}</div>}
                            </td>
                            <td className="p-3">
                              <select
                                value={item.category}
                                onChange={(e) =>
                                  setPreviewItems(items =>
                                    items?.map((it, i) => i === idx ? { ...it, category: e.target.value } : it) ?? null
                                  )
                                }
                                className="bg-transparent border-0 text-slate-600 text-xs focus:outline-none"
                              >
                                {DATASHEET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-0.5">
                                <span className="text-slate-400 text-xs">$</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    setPreviewItems(items =>
                                      items?.map((it, i) => i === idx ? { ...it, unitPrice: parseFloat(e.target.value) || 0 } : it) ?? null
                                    )
                                  }
                                  className="w-20 bg-transparent border-0 text-emerald-600 font-bold text-sm focus:outline-none focus:bg-slate-50 focus:border focus:border-slate-300 rounded px-1"
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) =>
                                  setPreviewItems(items =>
                                    items?.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it) ?? null
                                  )
                                }
                                className="w-16 bg-transparent border-0 text-slate-600 text-sm focus:outline-none focus:bg-slate-50 focus:border focus:border-slate-300 rounded px-1"
                              />
                            </td>
                            <td className="p-3 text-slate-500 text-xs">
                              {item.coverage ? `${item.coverage} ${item.coverageUnit || "SF"}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => { setPreviewItems(null); setExtractError(""); }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    ← Re-upload different PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={closePdfModal}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              {previewItems && (
                <button
                  onClick={handleSaveExtracted}
                  disabled={savingExtracted || previewItems.filter(i => i.selected).length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingExtracted
                    ? "Saving..."
                    : `Save ${previewItems.filter(i => i.selected).length} Product${previewItems.filter(i => i.selected).length !== 1 ? "s" : ""} to Library`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
