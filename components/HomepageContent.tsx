'use client';

import Link from 'next/link';
import EmailCapture from '@/components/EmailCapture';

const mistakeScenarios = [
  {
    icon: '🔩',
    cost: '$47,000',
    title: 'Missed Mechanical Curbs',
    scenario: 'TPO job, 2.8M SF. Estimator skipped the mechanical plan. 14 curbs not in scope. GC back-charges the sub after installation.',
    phase: 'Caught in Phase 9 — Mechanical Review',
  },
  {
    icon: '📋',
    cost: '$31,000',
    title: 'Missed Addendum',
    scenario: 'Addendum 3 added 18,000 SF of coverboard. Estimator missed it. Won the bid, now eating the material cost.',
    phase: 'Caught in Phase 10 — Addenda Review',
  },
  {
    icon: '📁',
    cost: '$22,000',
    title: 'Wrong Submittal Requirements',
    scenario: 'Spec required 3rd-party submittal package. Estimator excluded it. Owner deducts the full package cost from final payment.',
    phase: 'Caught in Phase 9 — Specification Review',
  },
];

const checklistPhases = [
  'Project Setup', 'Document Receipt', 'Architectural Review', 'Structural Review',
  'Mechanical Review', 'Plumbing Review', 'Electrical Review', 'Civil/Site/DOT Review',
  'Specification Review', 'Addenda Review', 'Takeoff — Areas', 'Takeoff — Linear',
  'Takeoff — Counts', 'Pricing — Materials', 'Pricing — Labor', 'Subcontractor Scope',
  'Pre-Submission', 'Bid Submission',
];

export default function HomepageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
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
            The Bidding Command Center for Commercial Roofing
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            One mistake on bid day
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              costs $30,000–$80,000.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            BidShield is the pre-submission review layer that works alongside The EDGE, STACK, and Excel — built by a 12-year commercial roofing estimator for the mistakes those tools can&apos;t catch.
          </p>
          <p className="text-sm text-emerald-400 font-medium mb-10">
            Works alongside The EDGE, STACK, and Excel — no replacement required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              Start 14-Day Free Trial — No Card Required
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/bidshield/demo"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-slate-400 text-white rounded-xl font-semibold text-lg transition-all duration-300"
            >
              See Live Demo
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">18</div>
              <div className="text-slate-400 text-sm mt-1">Bid Phases Covered</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">100+</div>
              <div className="text-slate-400 text-sm mt-1">Checklist Items</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">0</div>
              <div className="text-slate-400 text-sm mt-1">Missed Items</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mistake Scenarios */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              These mistakes happen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
                every week.
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              BidShield runs each one through 18 phases before you submit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mistakeScenarios.map((m) => (
              <div
                key={m.title}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-red-500/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{m.icon}</span>
                  <span className="text-red-400 font-bold text-lg">{m.cost}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{m.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{m.scenario}</p>
                <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 rounded-lg px-3 py-2">
                  ✓ {m.phase}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            After 12 years estimating commercial roofing, I built the review process I always wished existed.
            Every phase, every discipline, every item that costs you money when you miss it.
          </p>
          <p className="mt-6 text-sm text-slate-500">
            — Founder, MC2 Estimating
          </p>
        </div>
      </section>

      {/* 18-Phase Checklist */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The 18-Phase{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Bid Checklist
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From project setup to bid submission. Every phase. Every item. Nothing missed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {checklistPhases.map((phase, idx) => (
              <div
                key={phase}
                className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-xs text-emerald-500 font-semibold mb-1">Phase {idx + 1}</div>
                <div className="text-xs font-medium text-slate-200">{phase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Screenshots + Demo Video */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See it in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                60 seconds
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Walk through an actual bid review. No sign-up required.
            </p>
          </div>

          {/* Loom embed — replace REPLACE_WITH_YOUR_LOOM_ID with your actual Loom video ID */}
          <div
            className="relative w-full mb-16 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            style={{ paddingTop: '56.25%' }}
          >
            <iframe
              src="https://www.loom.com/embed/REPLACE_WITH_YOUR_LOOM_ID"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              title="BidShield 60-second walkthrough"
            />
          </div>

          {/* Screenshots */}
          <div className="space-y-16">
            {/* Screenshot 1 — Project list */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-2">Dashboard</div>
                <h3 className="text-xl font-bold text-white mb-3">All your bids in one place</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Each project shows status, bid date, and readiness score at a glance.
                  Free plan: 1 active project. Pro: unlimited.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-800 aspect-video flex items-center justify-center">
                {/* Replace with: <img src="/screenshots/dashboard-project-list.png" alt="BidShield project list dashboard" className="w-full block" /> */}
                <p className="text-slate-500 text-sm text-center px-4">
                  Add screenshot: /public/screenshots/dashboard-project-list.png<br />
                  Capture from /bidshield/demo
                </p>
              </div>
            </div>

            {/* Screenshot 2 — Checklist in progress */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-800 aspect-video flex items-center justify-center">
                {/* Replace with: <img src="/screenshots/checklist-in-progress.png" alt="BidShield 18-phase checklist" className="w-full block" /> */}
                <p className="text-slate-500 text-sm text-center px-4">
                  Add screenshot: /public/screenshots/checklist-in-progress.png<br />
                  Capture ChecklistTab mid-review from /bidshield/demo
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-2">18-Phase Checklist</div>
                <h3 className="text-xl font-bold text-white mb-3">Every discipline. Every item.</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Flag items as done, RFI, N/A, or blocked. Add notes per item.
                  Phase progress updates in real time as you work through the bid.
                </p>
              </div>
            </div>

            {/* Screenshot 3 — Bid Readiness Score */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-2">Bid Validator</div>
                <h3 className="text-xl font-bold text-white mb-3">Submit with confidence, not gut feel</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The Bid Readiness Score checks checklist completion, critical phase status,
                  quote expiration, open RFIs, and addenda acknowledgment — before you click submit.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-800 aspect-video flex items-center justify-center">
                {/* Replace with: <img src="/screenshots/bid-readiness-score.png" alt="BidShield bid readiness score" className="w-full block" /> */}
                <p className="text-slate-500 text-sm text-center px-4">
                  Add screenshot: /public/screenshots/bid-readiness-score.png<br />
                  Capture ValidatorTab from /bidshield/demo
                </p>
              </div>
            </div>
          </div>

          {/* CTA after screenshots */}
          <div className="text-center mt-16 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/bidshield/demo"
              className="inline-flex items-center justify-center px-8 py-4 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Try Demo — No Sign-Up
            </a>
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            One missed line item can cost you thousands. BidShield pays for itself on the first bid.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800">
              <div className="text-sm text-slate-400 mb-2">Free</div>
              <div className="text-5xl font-bold text-white mb-1">$0</div>
              <div className="text-slate-500 mb-6">forever</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 1 active project</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Basic checklist</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Takeoff tracking</li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-slate-950 rounded-2xl p-8 border-2 border-emerald-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <div className="text-sm text-slate-400 mb-2">Pro</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold text-white">$149</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium mb-6">
                or $1,490/year — save $298 (2 months free)
              </div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unlimited projects</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> PDF bid package export</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Win/loss analytics &amp; $/SF benchmarks</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> All 8 Excel templates included</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Material price book &amp; quote tracking</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Priority support</li>
              </ul>
              <Link
                href="/bidshield/pricing"
                className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
              >
                Start 14-Day Free Trial — No Card Required
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <h2 className="text-3xl font-bold text-white mb-4">Get the Free Bid-Day Checklist</h2>
          <p className="text-lg text-slate-400 mb-8">
            Download the 18-phase checklist commercial roofing estimators use to catch every line item.
          </p>
          <EmailCapture />
          <p className="text-sm text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stop Losing Money on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              Missed Line Items
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            One forgotten curb flashing, one expired quote, one wrong coverage rate — that&apos;s thousands off your bottom line.
            BidShield catches what you miss.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
          >
            Start 14-Day Free Trial — No Card Required
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            Works alongside The EDGE, STACK, and Excel &bull; Free forever plan available
          </p>
        </div>
      </section>
    </main>
  );
}
