import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BidShield vs STACK — Commercial Roofing Estimating Comparison',
  description: 'STACK handles cloud takeoff. BidShield runs the pre-submission review. Here\'s the difference, how they work together, and what STACK can\'t catch before bid day.',
  keywords: 'BidShield vs STACK, STACK estimating, commercial roofing bid review, pre-submission checklist, roofing software comparison',
};

const comparisonRows = [
  {
    feature: 'Primary purpose',
    stack: 'Cloud-based takeoff and estimation — measure, count, quantify from digital plans',
    bidshield: 'Pre-submission bid review — verify completeness before the bid goes out',
  },
  {
    feature: 'Plan markup & measuring',
    stack: 'Yes — core feature, digital plan takeoff',
    bidshield: 'No — not a takeoff tool',
  },
  {
    feature: 'Addenda review',
    stack: 'No — only tracks what you measure',
    bidshield: 'Yes — Phase 10 Addenda Review catches missed addendum items',
  },
  {
    feature: 'Mechanical scope gaps',
    stack: 'No',
    bidshield: 'Yes — 40-item scope gap checker covers mechanical curbs, drain compatibility, expansion joints',
  },
  {
    feature: 'Spec / submittal verification',
    stack: 'No',
    bidshield: 'Yes — Phase 9 Specification Review',
  },
  {
    feature: 'Takeoff area reconciliation',
    stack: 'Calculates from your measurements',
    bidshield: 'Flags SF discrepancies between your numbers and the drawings',
  },
  {
    feature: 'Bid readiness score',
    stack: 'No',
    bidshield: '0–100 score, updates as phases are completed',
  },
  {
    feature: '18-phase pre-submission checklist',
    stack: 'No',
    bidshield: 'Yes — 100+ check items from project setup through bid submission',
  },
  {
    feature: 'Team collaboration',
    stack: 'Yes — cloud-based, multi-user',
    bidshield: 'Single estimator workflow (team features on roadmap)',
  },
  {
    feature: 'Works with existing tools',
    stack: 'Integrates with some estimating platforms',
    bidshield: 'Yes — designed to work alongside any takeoff tool',
  },
  {
    feature: 'PDF export',
    stack: 'Yes',
    bidshield: 'Yes (Pro)',
  },
];

export default function BidShieldVsStackPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
            Tool Comparison
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            BidShield vs STACK
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            STACK measures your plans. BidShield reviews your bid. They solve completely different problems — and the biggest losses happen in the gap between them.
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
              <div className="text-2xl mb-4">☁️</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">STACK</h2>
              <p className="text-slate-600 leading-relaxed">
                Cloud-based takeoff and estimating. You upload digital plans, measure areas and linear footage directly on-screen, and build quantity takeoffs. Precise and fast for what you explicitly measure.
              </p>
              <p className="text-slate-500 text-sm mt-4 font-medium">Best for: Measuring from digital plans</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
              <div className="text-2xl mb-4">🛡️</div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">BidShield</h2>
              <p className="text-slate-600 leading-relaxed">
                Pre-submission bid review platform. After your takeoff is done, you run the bid through 18 phases and 100+ check items — mechanical scope gaps, addenda, submittal requirements, area reconciliation — before the bid leaves your desk.
              </p>
              <p className="text-slate-500 text-sm mt-4 font-medium">Best for: Verifying the bid is complete</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Blind Spot */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            STACK&apos;s blind spot
          </h2>
          <p className="text-xl text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            STACK measures everything you touch. It has no way of knowing what you didn&apos;t touch.
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">What STACK catches</h3>
                <ul className="space-y-3">
                  {[
                    'Areas you measured',
                    'Linear footage you traced',
                    'Counts you clicked',
                    'Materials you priced',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-4 text-lg">What STACK misses</h3>
                <ul className="space-y-3">
                  {[
                    'Addendum pages you didn\'t review',
                    'Mechanical curbs not on the roof plan',
                    'Spec sections you didn\'t read',
                    'Submittal requirements buried in Division 01',
                    'Expansion joints across building transitions',
                    'Warranty scope language in the contract',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-600">
                      <span className="text-red-400 font-bold">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Feature Comparison</h2>
          <p className="text-lg text-slate-500 text-center mb-12">
            Side by side — what each tool covers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-6 py-4 font-semibold rounded-tl-xl w-1/3">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold w-1/3">STACK</th>
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
                      {row.stack.startsWith('No') ? (
                        <span className="text-slate-400">{row.stack}</span>
                      ) : (
                        row.stack
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

      {/* Together */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            STACK measures the bid.
            <br />
            <span className="text-emerald-400">BidShield protects it.</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            After your STACK takeoff is done, run it through BidShield before submission. It only takes 20–30 minutes to complete the 18-phase review — and one prevented scope gap pays for months of Pro.
          </p>
          <div className="bg-slate-800 rounded-2xl p-8 mb-10 text-left">
            <h3 className="font-semibold text-white mb-4">Typical workflow with both tools:</h3>
            <ol className="space-y-3">
              {[
                'Receive plans, specs, addenda from GC',
                'Upload to STACK — measure areas, linear, counts',
                'Price materials and labor',
                'Open BidShield — run 18-phase pre-submission review',
                'Resolve any flagged gaps (addenda, mechanical, spec)',
                'Submit the bid',
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

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'Does BidShield replace STACK?',
                a: 'No. Keep using STACK for your digital takeoff. BidShield runs after takeoff is done — it reviews the completed bid for gaps, missing addenda, mechanical scope items, and spec requirements that your takeoff tool can\'t catch.',
              },
              {
                q: 'I already double-check my bids manually. Why do I need BidShield?',
                a: 'Manual reviews are inconsistent — especially when you\'re running multiple bids at once. BidShield gives you a systematic 18-phase, 100+ item review every time, not just the items you happen to remember under deadline pressure.',
              },
              {
                q: 'What does the 40-item scope gap checker actually look for?',
                a: 'Mechanical curbs, edge metal systems, drain compatibility, expansion joints, warranty scope language, liquidated damages clauses, coverboard requirements, through-wall flashings, and more — items frequently buried in the mechanical plans or spec sections rather than the roof plan.',
              },
              {
                q: 'Does this work for reroofing jobs, not just new construction?',
                a: 'Yes. The 18-phase checklist applies to commercial roofing bids of any type — TPO reroof, modified bitumen, PVC, coatings, new construction. The scope gap checker flags the items most commonly missed on reroof work.',
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

      {/* Cross-link */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm mb-4">Also comparing:</p>
          <Link
            href="/compare/bidshield-vs-the-edge"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            BidShield vs The EDGE →
          </Link>
        </div>
      </section>
    </main>
  );
}
