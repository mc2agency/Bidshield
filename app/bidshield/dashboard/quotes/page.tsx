"use client";

import { useState } from "react";
import { vendorGroups } from "@/lib/bidshield/demo-data";

export default function QuotesPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const toggleVendor = (key: string) => {
    setSelectedVendors((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  const sendRequests = () => {
    setNotification(`Quote requests sent to ${selectedVendors.length} vendor(s)!`);
    setShowModal(false);
    setSelectedVendors([]);
    setTimeout(() => setNotification(null), 3000);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      valid: { bg: "bg-emerald-100", text: "text-emerald-800", label: "✓ Valid" },
      expiring: { bg: "bg-amber-100", text: "text-amber-800", label: "⚠ Expiring" },
      expired: { bg: "bg-red-100", text: "text-red-800", label: "✗ Expired" },
      none: { bg: "bg-slate-200", text: "text-slate-600", label: "○ No Quote" },
    };
    const s = map[status] || map.none;
    return (
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 bg-emerald-500 text-white px-5 py-3 rounded-lg text-sm font-medium z-50 animate-pulse">
          {notification}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">💰 Vendor Quotes & Send Requests</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          📧 Send Quote Requests
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(vendorGroups).map(([key, group]) => (
          <div key={key} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[15px] font-semibold text-white">{group.name}</h3>
              {statusBadge(group.vendors[0].quoteStatus)}
            </div>

            <div className="mb-4">
              {group.vendors.map((vendor) => (
                <div key={vendor.id} className="p-3 bg-slate-900 rounded-md mb-2">
                  <div className="text-sm font-medium text-white">{vendor.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{vendor.email}</div>
                  {vendor.lastQuote && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Last quote: {vendor.lastQuote}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-4 text-[13px] text-slate-400">
              <strong>Products:</strong>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.products.slice(0, 4).map((product, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-700 text-slate-400 px-2 py-1 rounded">
                    {product}
                  </span>
                ))}
                {group.products.length > 4 && (
                  <span className="text-[11px] bg-slate-700 text-slate-400 px-2 py-1 rounded">
                    +{group.products.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <button className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-[13px] rounded-md transition-colors">
              📧 Request Quote
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg border border-slate-700"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Send Quote Requests</h2>
            <p className="text-sm text-slate-400 mb-6">Select vendors to request updated pricing:</p>

            <div className="flex flex-col gap-2 mb-6">
              {Object.entries(vendorGroups).map(([key, group]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-850"
                >
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(key)}
                    onChange={() => toggleVendor(key)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="flex-1 text-sm">{group.name}</span>
                  <span
                    className={`text-xs ${
                      group.vendors[0].quoteStatus === "expired"
                        ? "text-red-500"
                        : group.vendors[0].quoteStatus === "none"
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    ●{" "}
                    {group.vendors[0].quoteStatus === "expired"
                      ? "Expired"
                      : group.vendors[0].quoteStatus === "none"
                      ? "Needed"
                      : "Valid"}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-400 rounded-md text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={sendRequests}
                disabled={selectedVendors.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-md text-sm"
              >
                📧 Send {selectedVendors.length} Request{selectedVendors.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
