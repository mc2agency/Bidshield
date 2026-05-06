import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BidShield vs Manual Review — Systematic Bid QA for Commercial Roofing',
  description: 'Most estimators check their bids manually before submission. BidShield systematizes the process — 18 phases, 100+ items, every time. See the difference between hoping you remember everything and knowing you checked it all.',
  keywords: 'bid review checklist, commercial roofing QA, pre-submission review, estimating quality control, bid completeness check',
  alternates: { canonical: 'https://www.bidshield.co/compare/bidshield-vs-manual-review' },
};

const comparisonRows = [
  {
    feature: 'Consistency',
    manual: 'Depends on who\'s doing it and how busy they are',
    bidshield: 'Same 100+ item checklist every time, regardless of deadline pressure',
  },
  {
    feature: 'Addenda tracking',
    manual: 'Mental note of what arrived, easy to miss one under pressure',
    bidshield: 'Phase 10 Addenda Review — systematic cross-reference against all addenda items',
  },
  {
    feature: 'Mechanical scope gaps',
    manual: 'Relies on experience to remember what to look for',
    bidshield: '40-item scope gap checker — curbs, drains, expansion joints, compatibility',
  },
  {
    feature: 'Spec compliance verification',
    manual: 'Read what you have time to read',
    bidshield: 'Phase 9 Specification Review — submittal requirements, warranty language, liquidated damages',
  },
  {
    feature: 'Area reconciliation',
    manual: 'Spot-check if something feels off',
    bidshield: 'Flags SF discrepancies between takeoff and drawings',
  },
  {
    feature: 'Junior estimator support',
    manual: 'They don\'t know what they don\'t know yet',
    bidshield: 'Levels the playing field — systematized veteran knowledge',
  },
  {
    feature: 'Multiple concurrent bids',
    manual: 'Quality drops when juggling 3+ bids due the same day',
    bidshield: 'Review quality doesn\'t degrade under volume',
  },
  {
    feature: 'Bid readiness visibility',
    manual: 'Gut feel about whether you\'re done',
    bidshield: '0–100 score updates in real-time as phases complete',
  },
  {
    feature: 'Cost',
    manual: 'Free (but inconsistent)',
    bidshield: '$69/mo Pro — one prevented scope gap pays for months',
  },
];

const costScenarios = [
  {
    icon: '🔩',
    title: 'Missed Mechanical Curbs',
    cost: '$47,000',
    description: 'The curbs were on sheet M-3, not the roof plan. You were focused on the TPO takeoff. Manual review missed them because you didn\'t flip to mechanical that day.',
  },
  {
    icon: '📋',
    title: 'Missed Addendum',
    cost: '$31,000',
    description: 'Addendum 3 arrived during a busy week. You thought you checked everything. Turns out you missed 18,000 SF of coverboard buried on page 6.',
  },
  {
    icon: '📁',
    title: 'Wrong Submittal Package',
    cost: '$22,000',
    description: 'Spec required 3rd-party submittal review. You priced manufacturer-direct. Manual spec review caught the word "submittal" but not the implications.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'I already check my bids before I submit them. Why do I need BidShield?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Manual reviews are inconsistent — what you check depends on what you remember that day, how busy you are, and whether you\'ve had coffee yet. BidShield gives you the same systematic 18-phase, 100+ item review every single time, regardless of deadline pressure or concurrent bid volume.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does BidShield replace my takeoff tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. BidShield works after your takeoff is done. Keep using STACK, The EDGE, Excel, or whatever you use for quantities and pricing. BidShield reviews the completed bid for scope gaps, addenda, mechanical items, and spec compliance that your takeoff tool can\'t catch.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a BidShield review take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '20–30 minutes for a typical commercial roofing bid. You can do it in phases as you work (run Document Review after receiving plans, Mechanical Review after takeoff, etc.) or all at once before submission.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if I've been estimating for 15 years and never use checklists?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You're exactly who this is for. BidShield systematizes what you already do in your head — the mental checklist you run before submission. The difference: it catches the one item you forgot to check when you were juggling three bids at once on a Friday afternoon.',
      },
    },
  ],
};

export default function BidShieldVsManualReviewPage() {
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
            The Honest Comparison
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Manual Review vs BidShield
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            You already check your bids before submission. The question is: do you check the same 100+ items every time, or just the ones you remember that day?
          </p>
          <div className="inline-block px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium">
            Manual review is free. Missing scope isn't.
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            The problem with manual review
          </h2>
          <p className="text-xl text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            It works great — until it doesn&apos;t.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🧠',
                title: 'Memory-Dependent',
                description: 'What you check depends on what you remember. Miss one mental checklist item and it doesn&apos;t get reviewed.',
              },
              {
                icon: '⏰',
                title: 'Degrades Under Pressure',
                description: 'When you&apos;re juggling 3 bids due Friday at 2pm, your review gets shorter and sloppier.',
              },
              {
                icon: '👤',
                title: 'Experience Gap',
                description: 'Junior estimators don&apos;t have the 10+ years of scar tissue to know what to look for.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost of Inconsistency */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            When manual review fails
          </h2>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            These aren't hypotheticals. They're the bids that looked complete until they weren't.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {costScenarios.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-red-500 font-bold text-lg">{s.cost}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 mt-8 text-sm">
            One prevented scope gap pays for 6+ months of BidShield Pro.
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Side-by-Side Comparison</h2>
          <p className="text-lg text-slate-500 text-center mb-12">
            How manual review stacks up against systematic QA.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-6 py-4 font-semibold rounded-tl-xl w-1/3">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold w-1/3">Manual Review</th>
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
                      {row.manual}
                    </td>
                    <td className="px-6 py-4 text-sm border-b border-slate-100 text-center">
                      <span className="text-emerald-700 font-medium">{row.bidshield}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What BidShield Actually Does */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            What BidShield actually checks
          </h2>
          <p className="text-xl text-slate-300 mb-12 text-center max-w-2xl mx-auto">
            18 phases covering the entire bid lifecycle — from project setup through submission.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Document & Scope Review
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Plans received and current revision verified</li>
                <li>• Addenda cross-referenced and incorporated</li>
                <li>• Specification sections reviewed for scope</li>
                <li>• RFI log checked for clarifications</li>
              </ul>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Discipline Coordination
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Architectural review (parapets, equipment, access)</li>
                <li>• Structural review (deck type, slopes, load)</li>
                <li>• Mechanical (curbs, drains, HVAC compatibility)</li>
                <li>• Plumbing, electrical, civil/site coordination</li>
              </ul>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Takeoff Verification
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Area reconciliation (SF vs drawings)</li>
                <li>• Linear footage verification (edge, flashing)</li>
                <li>• Count verification (drains, penetrations, curbs)</li>
                <li>• Material quantities cross-check</li>
              </ul>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Contract & Compliance
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Warranty scope language reviewed</li>
                <li>• Submittal requirements identified</li>
                <li>• Liquidated damages clauses flagged</li>
                <li>• Labor/material pricing validated</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Turn your mental checklist into a system
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            BidShield doesn&apos;t replace your judgment — it systematizes it. The same review you&apos;d run if you had unlimited time and zero deadline pressure, every single bid.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Start 14-Day Free Trial — No Card Required
            </Link>
            <Link
              href="/bidshield/demo"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-semibold text-lg transition-all"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'I already check my bids before I submit them. Why do I need BidShield?',
                a: 'Manual reviews are inconsistent — what you check depends on what you remember that day, how busy you are, and whether you\'ve had coffee yet. BidShield gives you the same systematic 18-phase, 100+ item review every single time, regardless of deadline pressure or concurrent bid volume.',
              },
              {
                q: 'Does BidShield replace my takeoff tool?',
                a: 'No. BidShield works after your takeoff is done. Keep using STACK, The EDGE, Excel, or whatever you use for quantities and pricing. BidShield reviews the completed bid for scope gaps, addenda, mechanical items, and spec compliance that your takeoff tool can\'t catch.',
              },
              {
                q: 'How long does a BidShield review take?',
                a: '20–30 minutes for a typical commercial roofing bid. You can do it in phases as you work (run Document Review after receiving plans, Mechanical Review after takeoff, etc.) or all at once before submission.',
              },
              {
                q: 'What if I\'ve been estimating for 15 years and never use checklists?',
                a: 'You\'re exactly who this is for. BidShield systematizes what you already do in your head — the mental checklist you run before submission. The difference: it catches the one item you forgot to check when you were juggling three bids at once on a Friday afternoon.',
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-slate-200 pb-8 last:border-b-0">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
