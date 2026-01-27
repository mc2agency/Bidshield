"use client";

import { useState } from "react";
import { runValidation } from "@/lib/bidshield/demo-data";
import type { ValidationResult } from "@/lib/bidshield/types";

export default function ValidatorPage() {
  const [results, setResults] = useState<ValidationResult | null>(null);

  const handleRun = () => {
    setResults(runValidation());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">🛡️ Estimate Validator</h2>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          ▶ Run Validation
        </button>
      </div>

      {results ? (
        <div className="flex flex-col gap-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-6 text-center border-2 border-emerald-500">
              <div className="text-5xl font-bold text-emerald-500">{results.passed.length}</div>
              <div className="text-sm text-slate-400 mt-1">Passed</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 text-center border-2 border-amber-500">
              <div className="text-5xl font-bold text-amber-500">{results.warnings.length}</div>
              <div className="text-sm text-slate-400 mt-1">Warnings</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 text-center border-2 border-red-500">
              <div className="text-5xl font-bold text-red-500">{results.errors.length}</div>
              <div className="text-sm text-slate-400 mt-1">Errors</div>
            </div>
          </div>

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-base font-semibold text-red-500 mb-4">
                ❌ Errors - Must Fix Before Submission
              </h3>
              {results.errors.map((error, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900 rounded-lg border-l-4 border-red-500 mb-3"
                >
                  <div className="flex gap-3 mb-2">
                    <span className="text-[11px] font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                      {error.type}
                    </span>
                    <span className="text-sm font-medium">{error.item}</span>
                  </div>
                  <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">{error.message}</p>
                  <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">
                    {error.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-base font-semibold text-amber-500 mb-4">
                ⚠️ Warnings - Review Before Submission
              </h3>
              {results.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900 rounded-lg border-l-4 border-amber-500 mb-3"
                >
                  <div className="flex gap-3 mb-2">
                    <span className="text-[11px] font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                      {warning.type}
                    </span>
                    <span className="text-sm font-medium">{warning.item}</span>
                  </div>
                  <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">
                    {warning.message}
                  </p>
                  <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">
                    {warning.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Passed */}
          {results.passed.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-base font-semibold text-emerald-500 mb-4">✓ Passed</h3>
              {results.passed.map((pass, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900 rounded-lg border-l-4 border-emerald-500 mb-3"
                >
                  <div className="flex gap-3 mb-2">
                    <span className="text-[11px] font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                      {pass.type}
                    </span>
                    <span className="text-sm font-medium">{pass.item}</span>
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{pass.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-7xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-3">Run Validation</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click &quot;Run Validation&quot; to check your estimate against current quotes,
            coverage rates, and labor benchmarks.
          </p>
        </div>
      )}
    </div>
  );
}
