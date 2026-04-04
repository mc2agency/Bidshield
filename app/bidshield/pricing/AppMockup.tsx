const PHASES = [
  { label: "Plans & Specs Review", status: "done" },
  { label: "Addenda Verification", status: "done" },
  { label: "Scope Definition", status: "done" },
  { label: "Takeoff Reconciliation", status: "active" },
  { label: "Material Pricing", status: "pending" },
  { label: "Bid Qualifications", status: "pending" },
];

export default function AppMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Ambient glow */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
      />

      {/* Browser chrome */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200/80">
        {/* Browser toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1.5 mx-3 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span className="text-[11px] text-slate-400 truncate">bidshield.co/project/meridian-business-park</span>
          </div>
        </div>

        {/* App layout: sidebar + main */}
        <div className="flex" style={{ minHeight: 340 }}>
          {/* Sidebar */}
          <div className="w-32 bg-slate-900 flex-shrink-0 p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <div className="w-5 h-5 bg-emerald-600 rounded-md flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="text-white text-[10px] font-bold tracking-tight">BidShield</span>
            </div>
            {["Overview", "Checklist", "Takeoff", "Pricing", "Scope", "Validator", "Submit"].map((label) => (
              <div
                key={label}
                className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                  label === "Checklist" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 bg-slate-50 p-4">
            {/* Project header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Meridian Business Park</div>
                <div className="text-[9px] text-slate-500 mt-0.5">TPO · 68,000 SF · Bid: Jun 14, 2025</div>
              </div>
              <div className="px-2 py-1 bg-emerald-100 border border-emerald-200 rounded-lg">
                <div className="text-[10px] font-bold text-emerald-700">87% Ready</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "87%" }} />
            </div>

            {/* Phase rows */}
            <div className="space-y-1.5">
              {PHASES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 bg-white rounded-lg px-2.5 py-1.5 border border-slate-100 shadow-sm"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      item.status === "done"
                        ? "bg-emerald-100"
                        : item.status === "active"
                        ? "bg-amber-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {item.status === "done" ? (
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : item.status === "active" ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-slate-800 truncate">{item.label}</div>
                  </div>
                  <div
                    className={`text-[9px] font-semibold shrink-0 ${
                      item.status === "done"
                        ? "text-emerald-600"
                        : item.status === "active"
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {item.status === "done" ? "Complete" : item.status === "active" ? "Active" : "Pending"}
                  </div>
                </div>
              ))}
            </div>

            {/* Alert */}
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
              <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <span className="text-[9px] text-amber-700 font-medium">3 items flagged — review before submitting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-900">134 checks</div>
          <div className="text-[9px] text-slate-500">18 phases</div>
        </div>
      </div>
    </div>
  );
}
