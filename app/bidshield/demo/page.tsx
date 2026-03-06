import Link from "next/link";

const PHASES = [
  "Project Setup",
  "Document Receipt",
  "Architectural Review",
  "Structural Review",
  "Mechanical Review",
  "Plumbing Review",
  "Electrical Review",
  "Civil/Site/DOT Review",
  "Specification Review",
  "Addenda Review",
  "Takeoff — Areas",
  "Takeoff — Linear",
  "Takeoff — Counts",
  "Pricing — Materials",
  "Pricing — Labor",
  "Subcontractor Scope",
  "Pre-Submission",
  "Bid Submission",
];

const DONE_PHASES = 8; // first 8 checked

const SCOPE_ITEMS = [
  {
    id: 1,
    phase: "Mechanical Review",
    title: "Mechanical curb locations verified",
    description: "All HVAC curb sizes, heights, and locations confirmed against mechanical plan sheets M-101 through M-104.",
    risk: "high",
  },
  {
    id: 2,
    phase: "Specification Review",
    title: "Submittal package requirements",
    description: "Owner requires 3rd-party submittal review. Verify submittal package cost is included in bid.",
    risk: "high",
  },
  {
    id: 3,
    phase: "Addenda Review",
    title: "Addendum 3 — coverboard scope change",
    description: "Addendum 3 added 18,000 SF of coverboard to base scope. Confirm pricing has been updated.",
    risk: "medium",
  },
  {
    id: 4,
    phase: "Takeoff — Counts",
    title: "Drain count and type verification",
    description: "Roof drains, overflow drains, and scuppers counted and cross-referenced with plumbing sheets.",
    risk: "low",
  },
];

const RISK_STYLES: Record<string, { badge: string; dot: string }> = {
  high: { badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  medium: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  low: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

export default function BidShieldDemoPage() {
  const progress = 48;
  const remaining = 21;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-medium text-emerald-300 border border-emerald-500/30 mb-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            Interactive Demo
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BidShield</h1>
          <p className="text-slate-400 text-sm mt-1">Pre-Submission Bid Review — catch scope gaps before they cost you</p>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Project Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Meridian Business Park</h2>
              <p className="text-xs text-slate-500 mt-0.5">Charlotte, NC · Skanska USA</p>
            </div>
            <span className="flex-shrink-0 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              In Progress
            </span>
          </div>

          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">System</div>
              <div className="font-medium text-slate-800">TPO 60mil</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Area</div>
              <div className="font-medium text-slate-800">48,000 SF</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Est. Value</div>
              <div className="font-medium text-slate-800">$2.1M</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Bid Date</div>
              <div className="font-medium text-slate-800">Mar 14</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">Review Progress</span>
              <span className="text-xs font-semibold text-amber-600">{remaining} items remaining</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-amber-600 tabular-nums w-10 text-right">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Phase Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">18-Phase Review Checklist</h3>
            <span className="text-xs text-slate-500">{DONE_PHASES} of 18 complete</span>
          </div>
          <div className="divide-y divide-slate-50">
            {PHASES.map((phase, i) => {
              const done = i < DONE_PHASES;
              return (
                <div
                  key={phase}
                  className={`flex items-center gap-3 px-5 py-2.5 ${done ? "opacity-100" : "opacity-60"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                      ${done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    {done ? "✓" : <span className="text-[10px]">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${done ? "text-slate-700" : "text-slate-400"}`}>{phase}</span>
                  {!done && i === DONE_PHASES && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-semibold">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scope Items — with locked overlay */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Open Scope Items</h3>
            <span className="text-xs text-slate-500">Sample — 4 of 21 shown</span>
          </div>

          <div className="space-y-3 relative">
            {SCOPE_ITEMS.map((item, idx) => {
              const risk = RISK_STYLES[item.risk];
              const blurred = idx >= 2;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${blurred ? "opacity-40 blur-[1.5px] pointer-events-none select-none" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${risk.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${risk.badge}`}>
                          {item.risk.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                      <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                        Phase: {item.phase}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Locked overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
              <div
                className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-5 text-center max-w-xs mx-auto"
                style={{ marginTop: "auto", position: "relative", zIndex: 10 }}
              >
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-semibold text-slate-800 mb-1">Sign up to review your bids</p>
                <p className="text-xs text-slate-500 mb-4">See all 21 open items and start catching scope gaps before they cost you.</p>
                <Link
                  href="/sign-up"
                  className="block w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/bidshield/pricing"
                  className="block mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  See Pricing →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-center text-white">
          <h3 className="text-lg font-bold mb-1">Ready to protect your bids?</h3>
          <p className="text-sm text-slate-400 mb-5">Free to start. Catch your first mistake in under 10 minutes.</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
          >
            Start Free Trial
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <div className="mt-3">
            <Link href="/bidshield/pricing" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              See Pricing →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          BidShield — Protecting contractors from costly bidding errors
        </p>
      </main>
    </div>
  );
}
