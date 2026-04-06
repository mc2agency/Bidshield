"use client";

export default function VendorsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--bs-amber-dim)" }}>
        <svg className="w-6 h-6" style={{ color: "var(--bs-amber)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: "var(--bs-text-primary)" }}>Unable to load vendors</h3>
      <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>There was a problem connecting to the database. Please refresh the page.</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors"
        style={{ background: "var(--bs-teal)", color: "#13151a" }}
      >
        Try again
      </button>
    </div>
  );
}
