import Link from "next/link";

const BLOCKERS = [
  { level: "blocker", title: "19 scope items unaddressed", detail: "Mark each as included, excluded, or by others", tag: "Fix" },
  { level: "blocker", title: "1 addendum not re-priced", detail: "Scope changes need pricing updates", tag: "Fix" },
  { level: "warning", title: "3,100 SF gap in takeoff", detail: "4.6% doesn't match plans", tag: "Review" },
  { level: "warning", title: "1 quote expiring soon", detail: null, tag: "Review" },
  { level: "warning", title: "Checklist 72% — 27 items left", detail: null, tag: "Review" },
  { level: "info", title: "1 RFI awaiting response", detail: null, tag: "Info" },
];

const UNFLAGGED = ["Materials", "Labor", "Pricing", "Validator"];

export default function BidShieldDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-emerald-600 text-white text-center py-2.5 text-sm font-medium">
        Sample project — <Link href="/sign-up" className="underline font-semibold">Start free</Link> to use BidShield on your bids
      </div>

      {/* Project Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto flex items-start gap-4">
          {/* Readiness Gauge */}
          <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
            <svg width={52} height={52} viewBox="0 0 52 52">
              <circle cx={26} cy={26} r={22} fill="none" stroke="#fef3c7" strokeWidth="5" />
              <circle cx={26} cy={26} r={22} fill="none" stroke="#f59e0b" strokeWidth="5"
                strokeDasharray={138.2} strokeDashoffset={138.2 * (1 - 0.72)}
                strokeLinecap="round" transform="rotate(-90 26 26)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-extrabold text-amber-500" style={{ lineHeight: 1 }}>72%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-400 mb-0.5">Demo Project</div>
            <h1 className="text-lg font-bold text-slate-900 truncate leading-tight">Meridian Business Park — Bldg C</h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
              <span>Charlotte, NC</span>
              <span>·</span>
              <span>Skanska USA</span>
              <span>·</span>
              <span>TPO 60mil</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xl font-extrabold leading-tight text-emerald-600">40d</div>
            <div className="text-[9px] text-slate-400">until bid</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">68,000</div>
            <div className="text-[10px] text-slate-500 font-medium">Square Feet</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">$1.25M</div>
            <div className="text-[10px] text-slate-500 font-medium">Bid Amount</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">$18.38</div>
            <div className="text-[10px] text-slate-500 font-medium">Per SF</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">Apr 15</div>
            <div className="text-[10px] text-slate-500 font-medium">Bid Date</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto flex flex-col gap-5">

        {/* Blockers Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2 blockers · 6 need attention
            </h2>
            <span className="text-[10px] text-emerald-600 font-medium">1 passing ✓</span>
          </div>

          {BLOCKERS.map((item, i) => (
            <div key={i} className="relative">
              <div className={`w-full text-left rounded-xl p-4 bg-white ${
                item.level === "blocker" ? "border-l-4 border-red-500 shadow-sm"
                  : item.level === "warning" ? "border-l-4 border-amber-400"
                  : "border-l-4 border-blue-300"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    {item.detail && <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.level === "blocker" ? "bg-red-100 text-red-600"
                        : item.level === "warning" ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>{item.tag}</span>
                    <svg className="w-4 h-4 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 rounded-xl flex items-center justify-end pr-4 cursor-default">
                <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-slate-200">
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Sign up to review</span>
                </div>
              </div>
            </div>
          ))}

          {/* Unflagged sections */}
          <div className="flex flex-wrap gap-2 mt-1">
            {UNFLAGGED.map((label) => (
              <div key={label} className="relative">
                <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-100 flex items-center gap-1.5 text-sm text-slate-500 select-none">
                  <span className="font-medium">{label}</span>
                  <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg cursor-default flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roof System Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">TPO 60mil Mechanically Attached</h3>
              <div className="text-[10px] text-slate-400 mt-0.5">CSI 07 54 23</div>
            </div>
            <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md uppercase">TPO</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-base font-bold text-slate-800">68,000</div>
              <div className="text-[10px] text-slate-500">SQ FT</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-base font-bold text-slate-800">$1.25M</div>
              <div className="text-[10px] text-slate-500">BID AMT</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-base font-bold text-slate-800">$18.38</div>
              <div className="text-[10px] text-slate-500">PER SF</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <span className="text-slate-400 w-24 shrink-0">Seam</span>
              <span className="font-medium">Hot-air welded</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 w-24 shrink-0">Thickness</span>
              <span className="font-medium">45 / 60 / 80 mil</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 w-24 shrink-0">Manufacturers</span>
              <span className="font-medium">Carlisle SynTec, Johns Manville, Firestone/Elevate, Versico, GAF</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 w-24 shrink-0">Warranty</span>
              <span className="font-medium">10-yr Standard, 15-yr NDL, 20-yr NDL, 25-yr NDL, 30-yr NDL</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-white mb-1">Ready to protect your next bid?</h2>
          <p className="text-sm text-emerald-100 mb-5">Catch scope gaps, pricing errors, and missed addenda before they cost you the job.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up" className="px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-sm transition-colors shadow-sm">
              Start Free Trial — No credit card required
            </Link>
            <Link href="/bidshield/pricing" className="px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-medium rounded-xl text-sm transition-colors">
              See Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
