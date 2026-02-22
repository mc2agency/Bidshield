'use client';

import Link from 'next/link';
import EmailCapture from '@/components/EmailCapture';

const features = [
  {
    icon: '📐',
    title: 'Takeoff Verification',
    description: 'Catch missed roof sections before they cost you. Reconcile your takeoff against the control number — no other tool does this.',
  },
  {
    icon: '📊',
    title: 'Bid Comparison',
    description: 'See your $/SF vs. every past bid. Compare assembly costs, track trends, and price with confidence.',
  },
  {
    icon: '📦',
    title: 'Material Calculator',
    description: 'Enter SF, get roll counts and costs. Automatic waste factors, coverage rates, and vendor pricing in seconds.',
  },
  {
    icon: '🔍',
    title: 'Scope Gap Checker',
    description: '40 items to include or exclude. Demolition, access, protection, schedule — no surprises on bid day.',
  },
  {
    icon: '📄',
    title: 'Addenda Tracker',
    description: 'Track which addenda hit your scope. Review, re-price, and confirm before you submit. Never miss an addendum again.',
  },
  {
    icon: '📈',
    title: 'Win/Loss Intelligence',
    description: 'Win rate by GC, loss reasons, estimating accuracy. Know where you win and where to adjust your strategy.',
  },
];

const checklistPhases = [
  'Project Setup', 'Document Receipt', 'Architectural Review', 'Structural Review',
  'Mechanical Review', 'Plumbing Review', 'Electrical Review', 'Civil/Site/DOT Review',
  'Specification Review', 'Takeoff — Areas', 'Takeoff — Linear', 'Takeoff — Counts',
  'Pricing — Materials', 'Pricing — Labor', 'Pre-Submission', 'Bid Submission',
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
            Stop Leaving Money
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              on the Table.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Catch missed sections. Compare $/SF against history.
            Calculate materials instantly. Never forget a scope item.
          </p>
          <p className="text-sm text-slate-500 mb-10">
            Free to start. $49/month for the full Bidding Command Center.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bidshield/dashboard?demo=true"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              See Demo
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/bidshield/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-slate-400 text-white rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Start Free
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
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Six Tools.{' '}
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
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
            I spent 11 years estimating commercial roofing jobs. I got tired of losing bids because
            of missed scope items and spreadsheet chaos. So I built the tool I always needed.{' '}
            <span className="text-white font-semibold">This is it.</span>
          </p>
          <p className="mt-6 text-sm text-slate-500">
            — Carlos Maldonado, Founder
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
            Built by estimators,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              for estimators.
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            {[
              '40-point scope checklist catches what you forget',
              'Takeoff reconciliation — no other tool does this',
              '$/SF comparison across every past bid',
              'Material quantities calculated in seconds',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16-Phase Checklist */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The 16-Phase{' '}
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
                className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-xs text-emerald-500 font-semibold mb-1">Phase {idx + 1}</div>
                <div className="text-sm font-medium text-slate-200">{phase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Estimators Are{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Saying
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                initials: 'JR',
                quote: 'Placeholder testimonial — replace with a real quote from an estimator who used BidShield on a live bid.',
                name: 'Jason R.',
                title: 'Senior Estimator — Commercial Roofing',
                location: 'Dallas, TX',
              },
              {
                initials: 'MH',
                quote: 'Placeholder testimonial — replace with a real quote about catching missed scope items or saving time on material calcs.',
                name: 'Maria H.',
                title: 'Estimating Manager',
                location: 'Phoenix, AZ',
              },
              {
                initials: 'DW',
                quote: 'Placeholder testimonial — replace with a real quote about bid comparison or the 16-phase checklist.',
                name: 'Derek W.',
                title: 'Project Estimator — Commercial Roofing',
                location: 'Atlanta, GA',
              },
            ].map((t) => (
              <div
                key={t.initials}
                className="bg-slate-950 rounded-2xl p-6 border border-slate-800"
              >
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.title}</div>
                    <div className="text-slate-600 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
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
                href="/bidshield/dashboard"
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
              <div className="text-5xl font-bold text-white mb-1">$49</div>
              <div className="text-slate-500 mb-6">/month</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 text-left">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unlimited projects</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Full material calculator</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Bid comparison analytics</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Scope gap checker</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> PDF export</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Priority support</li>
              </ul>
              <Link
                href="/bidshield/dashboard"
                className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
              >
                Start Pro Trial
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
            Download the 16-phase checklist commercial roofing estimators use to catch every line item.
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
            href="/bidshield/dashboard"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
          >
            Start Your Free Trial
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            No credit card required &bull; Free forever plan available
          </p>
        </div>
      </section>
    </main>
  );
}
