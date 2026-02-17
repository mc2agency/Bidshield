"use client";

const materialPrices: any[] = [];
import { useState } from "react";

export default function DatasheetsPage() {
  const [search, setSearch] = useState("");
  const [uploadModal, setUploadModal] = useState(false);

  const filtered = materialPrices.filter((m) =>
    m.product.toLowerCase().includes(search.toLowerCase())
  );

  const getDateColor = (date: string | null) => {
    if (!date) return "text-red-500";
    if (new Date(date) < new Date("2025-01-01")) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">📑 Material Database & Data Sheets</h2>
        <p className="text-sm text-slate-400 mt-1">
          Coverage rates and pricing from manufacturer specifications
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setUploadModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
        >
          📤 Upload Datasheet
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {["Product", "Price", "Unit", "Coverage", "Vendor", "Quote Date", "Data Sheet"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left p-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((mat) => (
                <tr key={mat.product} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-3.5 text-sm font-medium text-slate-200">{mat.product}</td>
                  <td className="p-3.5 text-sm font-bold text-emerald-500">
                    ${mat.price.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-sm text-slate-200">{mat.unit}</td>
                  <td className="p-3.5 text-sm text-slate-200">
                    {mat.coverage} {mat.coverageUnit}
                  </td>
                  <td className="p-3.5 text-sm text-slate-200">{mat.vendor || "—"}</td>
                  <td className={`p-3.5 text-sm ${getDateColor(mat.quoteDate)}`}>
                    {mat.quoteDate || "No quote"}
                  </td>
                  <td className="p-3.5">
                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-900 text-xs rounded transition-colors">
                      📄 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div
          onClick={() => setUploadModal(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 w-full max-w-lg border border-slate-200"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Datasheet</h2>
            <p className="text-sm text-slate-400 mb-6">
              Upload manufacturer data sheets for quick reference
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ProDiene 30 Cap FR"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Category</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Waterproofing</option>
                  <option>Modified Bitumen</option>
                  <option>Air Barriers</option>
                  <option>Insulation</option>
                  <option>Sheet Metal</option>
                  <option>Pavers</option>
                  <option>Green Roof</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">File</label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm text-slate-400">
                    Drag & drop or click to upload PDF
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUploadModal(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-400 rounded-md text-sm"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold rounded-md text-sm">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
