import Link from 'next/link';
import type { Metadata } from 'next';
import PricingCards from '@/components/PricingCards';

export const metadata: Metadata = {
  title: 'BidShield Pricing — Commercial Roofing Bid Review Software',
  description: 'BidShield Pro for commercial roofing estimators. 18-phase bid quality assurance checklist, 100+ check items, AI features. Start free, then $249/mo or $208/mo annual.',
  keywords: 'BidShield pricing, bid QA tool, commercial roofing bid review, pre-submission checklist, roofing estimating software pricing',
  alternates: { canonical: 'https://www.bidshield.co/bidshield/pricing' },
};

const faqItems = [
  {
    q: 'Does this replace my estimating software?',
    a: "No. BidShield is the last step before you submit — not a replacement for The EDGE, STACK, or your spreadsheets. It reviews your completed bid for things estimating software can't catch.",
  },
  {
    q: "What's the difference between monthly and annual?",
    a: "Same Pro features either way. Annual billing is $2,490/year — that's ~$208/mo effective, saving you $498 versus paying monthly. You're prepaying 12 months at the price of 10.",
  },
  {
    q: 'What does the free trial include?',
    a: 'Full Pro access for 14 days, no credit card required. Run a real bid through the complete checklist, AI quote extraction, and all Pro features before you decide.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">BidShield</span>
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          The bid QA tool built for commercial roofing estimators.
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          Bid quality assurance that catches scope gaps, missed addenda, and pricing errors before you submit. The professional workflow from first plan review to final submission.
        </p>
        <p className="text-sm text-slate-400">
          Works alongside The EDGE, STACK, Excel, or any estimating tool you already use.
        </p>
      </div>

      {/* Value callout */}
      <div className="max-w-xl mx-auto px-6 mb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">
            A single missed mechanical curb on a $3M bid = $30,000–$80,000 loss.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Pro at $249/mo = $2,988/year. One prevented underbid on a $2M job covers 8+ years of the tool.
          </p>
        </div>
      </div>

      {/* Interactive pricing cards (client component) */}
      <div className="max-w-4xl mx-auto px-6 pb-10">
        <PricingCards />
      </div>

      {/* Trust signals */}
      <div className="max-w-4xl mx-auto px-6 pb-10">
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Built by an estimator with 12 years of commercial roofing experience.
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-center">
            {[
              { n: '134', label: 'Checklist items' },
              { n: '18',  label: 'Bid Phases' },
              { n: '40+', label: 'Scope gap items' },
              { n: '14d', label: 'Free trial' },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-slate-900">{n}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto pb-20">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-semibold text-slate-900 text-sm mb-2">{item.q}</p>
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQPage JSON-LD for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
