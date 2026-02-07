"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const VENDOR_CATEGORIES = [
  { key: "insulation", name: "Insulation", icon: "🧱" },
  { key: "membrane", name: "Membrane", icon: "🛡️" },
  { key: "sheet_metal", name: "Sheet Metal", icon: "🔩" },
  { key: "fasteners", name: "Fasteners & Adhesives", icon: "🔧" },
  { key: "accessories", name: "Accessories", icon: "📦" },
  { key: "equipment", name: "Equipment Rental", icon: "🏗️" },
];

function QuotesContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  // Convex queries
  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId
      ? isValidConvexId
        ? { userId, projectId: projectIdParam as Id<"bidshield_projects"> }
        : { userId }
      : "skip"
  );

  // Convex mutations
  const createQuoteMut = useMutation(api.bidshield.createQuote);
  const updateQuoteMut = useMutation(api.bidshield.updateQuote);

  const resolvedQuotes = quotes ?? [];

  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [newQuote, setNewQuote] = useState({
    vendorName: "",
    vendorEmail: "",
    vendorPhone: "",
    category: "insulation",
    products: "",
    quoteAmount: "",
    quoteDate: "",
    expirationDate: "",
    notes: "",
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateQuote = async () => {
    if (!newQuote.vendorName || !newQuote.category || !userId) return;

    await createQuoteMut({
      userId,
      projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined,
      vendorName: newQuote.vendorName,
      vendorEmail: newQuote.vendorEmail || undefined,
      vendorPhone: newQuote.vendorPhone || undefined,
      category: newQuote.category,
      products: newQuote.products.split(",").map((p) => p.trim()).filter(Boolean),
      quoteAmount: newQuote.quoteAmount ? parseFloat(newQuote.quoteAmount) : undefined,
      quoteDate: newQuote.quoteDate || undefined,
      expirationDate: newQuote.expirationDate || undefined,
      notes: newQuote.notes || undefined,
    });

    setNewQuote({
      vendorName: "", vendorEmail: "", vendorPhone: "", category: "insulation",
      products: "", quoteAmount: "", quoteDate: "", expirationDate: "", notes: "",
    });
    setShowModal(false);
    showNotification("Quote added!");
  };

  const handleUpdateStatus = async (quoteId: Id<"bidshield_quotes">, status: string) => {
    await updateQuoteMut({
      quoteId,
      status: status as any,
    });
    showNotification("Quote updated!");
  };

  const getQuoteStatus = (quote: any): string => {
    if (!quote.expirationDate) return quote.status;
    const expDate = new Date(quote.expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 14) return "expiring";
    if (quote.quoteAmount) return "valid";
    return quote.status;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      valid: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "✓ Valid" },
      received: { bg: "bg-blue-500/20", text: "text-blue-400", label: "📥 Received" },
      requested: { bg: "bg-purple-500/20", text: "text-purple-400", label: "📧 Requested" },
      expiring: { bg: "bg-amber-500/20", text: "text-amber-400", label: "⚠ Expiring" },
      expired: { bg: "bg-red-500/20", text: "text-red-400", label: "✗ Expired" },
      none: { bg: "bg-slate-700", text: "text-slate-400", label: "○ No Quote" },
    };
    const s = map[status] || map.none;
    return (
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const groupedByCategory = VENDOR_CATEGORIES.map((cat) => ({
    ...cat,
    quotes: resolvedQuotes.filter((q: any) => q.category === cat.key),
  }));

  if (!isDemo && quotes === undefined) {
    return <div className="text-slate-400">Loading quotes...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 bg-emerald-500 text-white px-5 py-3 rounded-lg text-sm font-medium z-50 animate-pulse">
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">💰 Vendor Quotes</h2>
          {project && (
            <p className="text-sm text-slate-400">{project.name}</p>
          )}
        </div>
        {!isDemo && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Add Quote
          </button>
        )}
      </div>

      {/* Quote Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: resolvedQuotes.length, color: "text-white" },
          { label: "Valid", value: resolvedQuotes.filter((q: any) => getQuoteStatus(q) === "valid").length, color: "text-emerald-500" },
          { label: "Expiring Soon", value: resolvedQuotes.filter((q: any) => getQuoteStatus(q) === "expiring").length, color: "text-amber-500" },
          { label: "Expired", value: resolvedQuotes.filter((q: any) => getQuoteStatus(q) === "expired").length, color: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quotes by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groupedByCategory.map((cat) => (
          <div key={cat.key} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{cat.icon}</span>
              <h3 className="text-[15px] font-semibold text-white">{cat.name}</h3>
              <span className="text-xs text-slate-500 ml-auto">
                {cat.quotes.length} vendor{cat.quotes.length !== 1 ? "s" : ""}
              </span>
            </div>

            {cat.quotes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No quotes yet.{" "}
                {!isDemo && (
                  <button
                    onClick={() => {
                      setNewQuote({ ...newQuote, category: cat.key });
                      setShowModal(true);
                    }}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Add one →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cat.quotes.map((quote: any) => (
                  <div
                    key={quote._id}
                    className="p-3 bg-slate-900 rounded-lg hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-white">{quote.vendorName}</div>
                        {quote.vendorEmail && (
                          <div className="text-xs text-slate-500">{quote.vendorEmail}</div>
                        )}
                      </div>
                      {statusBadge(getQuoteStatus(quote))}
                    </div>

                    {quote.quoteAmount && (
                      <div className="text-lg font-bold text-emerald-400 mb-1">
                        ${quote.quoteAmount.toLocaleString()}
                      </div>
                    )}

                    {quote.products && quote.products.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {quote.products.slice(0, 3).map((product: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded"
                          >
                            {product}
                          </span>
                        ))}
                        {quote.products.length > 3 && (
                          <span className="text-[10px] text-slate-500">
                            +{quote.products.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 text-[11px]">
                      {quote.quoteDate && (
                        <span className="text-slate-500">Quoted: {quote.quoteDate}</span>
                      )}
                      {quote.expirationDate && (
                        <span className={`${
                          getQuoteStatus(quote) === "expired" ? "text-red-400" :
                          getQuoteStatus(quote) === "expiring" ? "text-amber-400" :
                          "text-slate-500"
                        }`}>
                          Exp: {quote.expirationDate}
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {!isDemo && (
                      <div className="flex gap-2 mt-3">
                        {getQuoteStatus(quote) !== "valid" && quote.quoteAmount && (
                          <button
                            onClick={() => handleUpdateStatus(quote._id, "valid")}
                            className="text-[11px] px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30"
                          >
                            Mark Valid
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(quote._id, "requested")}
                          className="text-[11px] px-2 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                        >
                          📧 Request Update
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Quote Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Add Vendor Quote</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  value={newQuote.vendorName}
                  onChange={(e) => setNewQuote({ ...newQuote, vendorName: e.target.value })}
                  placeholder="ABC Roofing Supply"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newQuote.vendorEmail}
                    onChange={(e) => setNewQuote({ ...newQuote, vendorEmail: e.target.value })}
                    placeholder="sales@vendor.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newQuote.vendorPhone}
                    onChange={(e) => setNewQuote({ ...newQuote, vendorPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category *</label>
                <select
                  value={newQuote.category}
                  onChange={(e) => setNewQuote({ ...newQuote, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {VENDOR_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Products (comma-separated)</label>
                <input
                  type="text"
                  value={newQuote.products}
                  onChange={(e) => setNewQuote({ ...newQuote, products: e.target.value })}
                  placeholder="TPO 60mil, Cover Board, Fasteners"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quote Amount ($)</label>
                  <input
                    type="number"
                    value={newQuote.quoteAmount}
                    onChange={(e) => setNewQuote({ ...newQuote, quoteAmount: e.target.value })}
                    placeholder="15000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quote Date</label>
                  <input
                    type="date"
                    value={newQuote.quoteDate}
                    onChange={(e) => setNewQuote({ ...newQuote, quoteDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expiration</label>
                  <input
                    type="date"
                    value={newQuote.expirationDate}
                    onChange={(e) => setNewQuote({ ...newQuote, expirationDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <textarea
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  placeholder="Contact John for bulk pricing..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-400 rounded-md text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuote}
                disabled={!newQuote.vendorName}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-md text-sm"
              >
                Add Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading quotes...</div>}>
      <QuotesContent />
    </Suspense>
  );
}
