"use client";

export default function VendorsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="text-3xl mb-4">⚠️</div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">Unable to load vendors</h3>
      <p className="text-sm text-slate-500 mb-6">There was a problem connecting to the database. Please refresh the page.</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
