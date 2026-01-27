import Link from "next/link";

const features = [
  {
    icon: "📋",
    title: "16-Phase Bid Checklist",
    description: "Never miss a line item. From project setup to bid submission, every phase is tracked and validated.",
  },
  {
    icon: "🛡️",
    title: "Estimate Validator",
    description: "Auto-check your estimate against current quotes, coverage rates, and labor benchmarks before you submit.",
  },
  {
    icon: "💰",
    title: "Vendor Quote Tracker",
    description: "Track every vendor quote, expiration date, and pricing. Send quote requests directly from the platform.",
  },
  {
    icon: "👷",
    title: "Labor Rate Database",
    description: "Built-in production rates and labor burden calculator. Validate your hours against industry benchmarks.",
  },
  {
    icon: "📑",
    title: "Material Data Sheets",
    description: "Centralized database of coverage rates, pricing, and manufacturer specs. Always up to date.",
  },
  {
    icon: "📊",
    title: "Bid Dashboard",
    description: "See all active bids, pipeline value, expiring quotes, and open RFIs at a glance.",
  },
];

const checklistPhases = [
  "Project Setup", "Document Receipt", "Architectural Review", "Structural Review",
  "Mechanical Review", "Plumbing Review", "Electrical Review", "Civil/Site/DOT Review",
  "Specification Review", "Takeoff — Areas", "Takeoff — Linear", "Takeoff — Counts",
  "Pricing — Materials", "Pricing — Labor", "Pre-Submission", "Bid Submission",
];

export default function BidShieldLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              ← MC2 Estimating
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold tracking-tight">BidShield</span>
              <span className="text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">PRO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/bidshield/dashboard"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm text-slate-300 border border-white/10 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            From the makers of MC2 Estimating
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            BidShield
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Never Miss a Line Item Again
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            The complete bid management system for roofing contractors. 16-phase checklist,
            estimate validation, vendor tracking, and labor benchmarks — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bidshield/dashboard"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">16</div>
              <div className="text-slate-400 text-sm mt-1">Bid Phases Covered</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">100+</div>
              <div className="text-slate-400 text-sm mt-1">Checklist Items</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">$0</div>
              <div className="text-slate-400 text-sm mt-1">Costly Errors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Six Tools.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Zero Missed Items.
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Every tool a commercial roofing estimator needs to submit a complete, validated bid.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16-Phase Checklist Preview */}
      <section className="py-24 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The 16-Phase{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Bid Checklist
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From project setup to bid submission. Every phase. Every item. Nothing missed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {checklistPhases.map((phase, idx) => (
              <div
                key={phase}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-xs text-emerald-500 font-semibold mb-1">Phase {idx + 1}</div>
                <div className="text-sm font-medium text-slate-200">{phase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            One missed line item can cost you thousands. BidShield pays for itself on the first bid.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <div className="text-sm text-slate-400 mb-2">Monthly</div>
              <div className="text-5xl font-bold mb-1">$49</div>
              <div className="text-slate-500 mb-6">/month</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Full 16-phase checklist</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Estimate validator</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Vendor quote tracking</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Labor rate database</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unlimited projects</li>
              </ul>
              <Link
                href="/bidshield/dashboard"
                className="block w-full text-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Annual */}
            <div className="relative bg-slate-900 rounded-2xl p-8 border-2 border-emerald-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  SAVE $189/yr
                </span>
              </div>
              <div className="text-sm text-slate-400 mb-2">Annual</div>
              <div className="text-5xl font-bold mb-1">$399</div>
              <div className="text-slate-500 mb-6">/year ($33/mo)</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Everything in Monthly</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> MC2 template bundle included</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Early access to new tools</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Save $189/year</li>
              </ul>
              <Link
                href="/bidshield/dashboard"
                className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Stop Losing Money on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              Missed Line Items
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            One forgotten curb flashing, one expired quote, one wrong coverage rate — that&apos;s thousands off your bottom line.
            BidShield catches what you miss.
          </p>
          <Link
            href="/bidshield/dashboard"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
          >
            🛡️ Start Your Free Trial
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-slate-500">
          <span>© 2025 MC2 Estimating — BidShield PRO</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">MC2 Home</Link>
            <Link href="/products" className="hover:text-slate-300 transition-colors">Templates</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
