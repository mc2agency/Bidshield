import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BidShield vs The EDGE — Commercial Roofing Estimating Software Comparison',
  description: 'BidShield and The EDGE serve different purposes. The EDGE quantifies your bid. BidShield reviews it before submission. See how they work together — and what happens when you use only one.',
  keywords: 'BidShield vs The EDGE, commercial roofing estimating software, bid review, pre-submission checklist, roofing estimating tools comparison',
  alternates: { canonical: 'https://www.bidshield.co/compare/bidshield-vs-the-edge' },
};

const comparisonRows = [
  {
    feature: 'Purpose',
    edge: 'Takeoff & pricing — quantify scope and build material/labor costs',
    bidshield: 'Pre-submission review — verify the bid is complete before it goes out',
  },
  {
    feature: 'Catches missed addenda',
    edge: 'No — only tracks what you manually enter',
    bidshield: 'Yes — Phase 10 Addenda Review flags missed addenda items',
  },
  {
    feature: 'Mechanical curb scope check',
    edge: 'No',
    bidshield: 'Yes — Phase 9 Mechanical Review, 40-item scope gap checker',
  },
  {
    feature: 'Submittal requirement verification',
    edge: 'No',
    bidshield: 'Yes — Phase 9 Specification Review',
  },
  {
    feature: 'Takeoff area reconciliation',
    edge: 'Calculates from what you enter',
    bidshield: 'Cross-references SF quantities against drawings, flags discrepancies',
  },
  {
    feature: 'Bid readiness score',
    edge: 'No',
    bidshield: '0–100 score updates as each phase is completed',
  },
  {
    feature: 'Phase-by-phase checklist',
    edge: 'No',
    bidshield: '18 phases, 100+ items — project setup through bid submission',
  },
  {
    feature: 'Material takeoff',
    edge: 'Yes — core feature',
    bidshield: 'No — not a takeoff tool',
  },
  {
    feature: 'Pricing database',
    edge: 'Yes — built-in material costs',
    bidshield: 'No — works alongside your pricing tool',
  },
  {
    feature: 'Works with existing tools',
    edge: 'Standalone',
    bidshield: 'Yes — designed to layer on top of The EDGE, STACK, Excel',
  },
  {
    feature: 'PDF bid summary export',
    edge: 'Yes',
    bidshield: 'Yes (Pro)',
  },
];

const costScenarios = [
  {
    icon: '🔩',
    title: 'Missed Mechanical Curbs',
    cost: '$47,000',
    description: 'The EDGE didn\'t include curbs you never entered. BidShield\'s Phase 9 Mechanical Review would have flagged the gap.',
  },
  {
    icon: '📋',
    title: 'Missed Addendum',
    cost: '$31,000',
    description: 'Addendum 3 added 18,000 SF of coverboard. The EDGE only knows what you tell it. BidShield\'s Phase 10 Addenda Review catches omissions.',
  },
  {
    icon: '📁',
    title: 'Wrong Submittal Requirements',
    cost: '$22,000',
    description: 'Spec required a 3rd-party submittal package. The EDGE prices materials — BidShield reviews spec compliance.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does BidShield compare to The EDGE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BidShield and The EDGE serve different purposes. The EDGE is takeoff and pricing software — you use it to quantify scope and build material/labor costs. BidShield is a pre-submission bid review tool — you use it after your takeoff is done to verify the bid is complete before it goes out. They complement each other rather than compete.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is BidShield better than The EDGE for commercial roofing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'They solve different problems. The EDGE is better for building your numbers — takeoff, material quantities, labor costs. BidShield is better for catching what your numbers missed — scope gaps, addenda, mechanical curbs, submittal requirements. Most commercial roofing estimators use both: The EDGE to build the bid, BidShield to verify it before submission.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use BidShield with The EDGE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. BidShield is designed to work alongside The EDGE, not replace it. Complete your takeoff and pricing in The EDGE, then run BidShield\'s 18-phase checklist to catch scope gaps, missed addenda, and compliance issues before the bid goes out.',
      },
    },
  ],
};

export default function BidShieldVsTheEdgePage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
            Tool Comparison
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            BidShield vs The EDGE
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            They do different things. The EDGE builds your bid. BidShield makes sure it&apos;s complete before you submit it.
          </p>
          <div className="inline-block px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium">
            The right answer: use both.
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <div className="text-2xl mb-4">📐</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">The EDGE</h2>
              <p className="text-slate-600 leading-relaxed">
                Industry-standard takeoff and pricing software. You use it to quantify scope, calculate material quantities, and build labor costs. It processes exactly what you enter — no more, no less.
              </p>
              <p className="text-slate-500 text-sm mt-4 font-medium">Best for: Building the numbers</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
              <div className="text-2xl mb-4">🛡️</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">BidShield</h2>
              <p className="text-slate-600 leading-relaxed">
                Pre-submission bid review platform. You use it after your takeoff is done to verify the bid is complete — checking scope gaps, addenda, mechanical systems, submittal requirements, and 90+ other items before the bid goes out.
              </p>
              <p className="text-slate-500 text-sm mt-4 font-medium">Best for: Catching what the numbers missed</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Gap Problem */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Why The EDGE alone isn&apos;t enough
          </h2>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            The EDGE is precise about what you give it. It doesn&apos;t know what you forgot.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {costScenarios.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-red-500 font-bold">{s.cost}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 mt-8 text-sm">
            These aren&apos;t edge cases. They happen every week on bids that looked complete.
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Feature Comparison</h2>
          <p className="text-lg text-slate-500 text-center mb-12">
            Side by side — what each tool does and doesn&apos;t do.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-6 py-4 font-semibold rounded-tl-xl w-1/3">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold w-1/3">The EDGE</th>
                  <th className="text-center px-6 py-4 font-semibold rounded-tr-xl w-1/3 text-emerald-400">BidShield</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 border-b border-slate-100">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm border-b border-slate-100 text-center">
                      {row.edge.startsWith('No') ? (
                        <span className="text-slate-400">{row.edge}</span>
                      ) : (
                        row.edge
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-slate-100 text-center">
                      {row.bidshield.startsWith('No') ? (
                        <span className="text-slate-400">{row.bidshield}</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">{row.bidshield}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The Together Pitch */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            The EDGE builds the bid.
            <br />
            <span className="text-emerald-400">BidShield protects it.</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            After your takeoff is done in The EDGE, run it through BidShield before you submit. 18 phases, 100+ check items, 40-item scope gap checker. The review a veteran estimator runs in their head — systematized so nothing slips through.
          </p>
          <div className="bg-slate-800 rounded-2xl p-8 mb-10 text-left">
            <h3 className="font-semibold text-white mb-4">Typical workflow:</h3>
            <ol className="space-y-3">
              {[
                'Receive bid documents — plans, specs, addenda',
                'Build your takeoff and price the job in The EDGE',
                'Open BidShield — run the 18-phase pre-submission review',
                'Fix any flagged gaps before submission',
                'Submit with confidence',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Start 14-Day Free Trial — No Card Required
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

      {/* Cross-link */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm mb-4">Also comparing:</p>
          <Link
            href="/compare/bidshield-vs-stack"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            BidShield vs STACK →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'Do I have to stop using The EDGE to use BidShield?',
                a: 'No. BidShield is not a replacement for The EDGE. Keep using The EDGE for takeoff and pricing. Use BidShield after your numbers are done to verify the bid is complete before submission.',
              },
              {
                q: 'Will BidShield integrate directly with The EDGE?',
                a: 'Not currently — BidShield works as a standalone review layer. You run the checklist manually against your completed bid. A direct integration is on the roadmap.',
              },
              {
                q: 'What if I use STACK or Excel instead of The EDGE?',
                a: 'BidShield works the same way regardless of your takeoff tool. The 18-phase review applies to any commercial roofing bid, built with any software.',
              },
              {
                q: 'What does BidShield actually check?',
                a: '18 phases covering: project setup, document receipt, architectural review, structural review, mechanical, plumbing, electrical, civil/site, specifications, addenda, takeoff areas, takeoff linear, takeoff counts, material pricing, labor pricing, subcontractor scope, pre-submission, and bid submission.',
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-slate-100 pb-8">
                <h3 className="font-bold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
