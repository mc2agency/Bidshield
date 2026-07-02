import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BidShield — Systematic Bid QA for Commercial Roofing',
  description: 'BidShield is a pre-submission bid review platform for commercial roofing estimators. 18 phases, 100+ check items, AI-powered scope gap detection, and takeoff reconciliation — built by a 12-year estimator.',
  keywords: 'BidShield features, commercial roofing QA, bid preflight, pre-submission bid review, scope gap detection, takeoff reconciliation',
  alternates: { canonical: 'https://www.bidshield.co/about' },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.10)_1px,transparent_1px)] bg-[size:96px_96px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              About BidShield
            </div>
            <h1 className="text-pretty text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Your last line of defense
              <br />
              <span className="text-emerald-400">before you submit</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              BidShield is a pre-submission bid review platform that systematically checks every commercial roofing bid for scope gaps, addenda, mechanical items, and spec compliance, before it leaves your desk.
            </p>
          </div>
        </div>
      </section>

      {/* What You Actually Do */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">What you actually do in BidShield</h2>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Your preflight from completed bid through final submission.
          </p>
          
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Create a project',
                description: 'Enter project name, GC, bid date. Upload your bid documents — plans, specs, addenda, RFIs. BidShield extracts key info automatically.',
              },
              {
                step: '2',
                title: 'Set up roof assemblies',
                description: 'Define the roof systems you\'re bidding (TPO, PVC, EPDM, etc.). BidShield analyzes specs and verifies assemblies against project requirements.',
              },
              {
                step: '3',
                title: 'Run document review phases',
                description: 'Work through 18 phases after your bid is built: Architectural Review (parapets, access), Structural (deck, slopes), Mechanical (curbs, drains), Plumbing, Electrical, Civil/Site, Specifications, Addenda.',
              },
              {
                step: '4',
                title: 'Audit your takeoff for gaps',
                description: 'Pull in the SF, linear footage, and counts from your existing takeoff. BidShield cross-references them against the drawings and flags discrepancies before you submit.',
              },
              {
                step: '5',
                title: 'Run scope gap check',
                description: 'AI scans your documents and bid against 40 common scope gaps: mechanical curbs, edge metal systems, drain compatibility, expansion joints, warranty scope, liquidated damages.',
              },
              {
                step: '6',
                title: 'Review your readiness score',
                description: 'See your 0–100 bid readiness score. Know exactly what\'s complete and what still needs attention before submission.',
              },
              {
                step: '7',
                title: 'Export and submit',
                description: 'Generate a PDF summary of your review checklist. Submit your bid with confidence.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 text-white font-bold text-xl flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Core features</h2>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            What makes BidShield different from a spreadsheet checklist.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Scope Gap Detection</h3>
              <p className="text-slate-600 mb-4">
                Upload your plans and specs. AI scans for 40 common scope gaps — mechanical curbs, edge metal, drain compatibility, expansion joints, warranty scope language, liquidated damages clauses.
              </p>
              <p className="text-sm text-slate-500">
                Uses Claude Sonnet 4 to analyze PDFs and cross-reference against your bid setup.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Takeoff Reconciliation</h3>
              <p className="text-slate-600 mb-4">
                Enter your SF quantities. BidShield extracts area callouts from drawings and flags discrepancies. Catches transposition errors and missed sections before submission.
              </p>
              <p className="text-sm text-slate-500">
                Vision AI reads plan callouts and compares against your entered takeoff.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Addenda Cross-Reference</h3>
              <p className="text-slate-600 mb-4">
                Upload addenda as they arrive. BidShield tracks what changed and prompts you to update affected phases. Never miss an addendum item buried on page 6.
              </p>
              <p className="text-sm text-slate-500">
                Extracts changes and maps them to relevant bid phases automatically.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">18-Phase Review Checklist</h3>
              <p className="text-slate-600 mb-4">
                Systematic review from project setup through bid submission. Each phase has 5–8 specific check items. Track completion in real-time with a 0–100 readiness score.
              </p>
              <p className="text-sm text-slate-500">
                Based on 12 years of commercial roofing estimation experience.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Spec Analysis</h3>
              <p className="text-slate-600 mb-4">
                AI extracts submittal requirements, warranty scope, and liquidated damages clauses from Division 07 specs. Flags non-standard requirements before you price.
              </p>
              <p className="text-sm text-slate-500">
                Parses CSI format specs and highlights deviations from standard scope.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">System Substitution Preferences</h3>
              <p className="text-slate-600 mb-4">
                Set your preferred roof system substitutions once. BidShield auto-suggests when spec assemblies match your substitution rules (e.g., always sub Hydrotech for generic IRMA).
              </p>
              <p className="text-sm text-slate-500">
                Learns your business preferences and applies them across all projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">By the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">18</div>
              <p className="text-slate-600 font-medium text-sm">Review phases</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100+</div>
              <p className="text-slate-600 font-medium text-sm">Check items</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">40</div>
              <p className="text-slate-600 font-medium text-sm">AI scope gap checks</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">20-30m</div>
              <p className="text-slate-600 font-medium text-sm">Review time per bid</p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Use It */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">When to use BidShield</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <span className="text-emerald-600">✓</span> Use BidShield for:
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• Public bids (schools, municipalities, government)</li>
                <li>• Large commercial projects ($500K+)</li>
                <li>• Multi-building or phased work</li>
                <li>• Projects with 3+ addenda</li>
                <li>• Junior estimators learning the ropes</li>
                <li>• Any bid where missing scope = back-charge risk</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-slate-400">○</span> Maybe skip for:
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Emergency repairs (same-day turnaround)</li>
                <li>• Tiny service work (&lt;$10K)</li>
                <li>• Repeat clients with standard scope</li>
                <li>• Bids you\'re not serious about winning</li>
              </ul>
              <p className="text-sm text-slate-500 mt-4 italic">
                That said, even a 5-minute scope gap check on a small bid can save you from a costly miss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Try it on your next bid
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            14-day free trial. No card required. One prevented scope gap pays for months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href="/bidshield/demo"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-slate-400 text-white rounded-xl font-semibold text-lg transition-all"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
