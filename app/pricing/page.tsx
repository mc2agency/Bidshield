import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'BidShield Pro — commercial roofing estimating platform. $249/month, 14-day free trial.',
  keywords: 'roofing estimating pricing, BidShield Pro, commercial roofing software',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              One Product.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">One Price.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              BidShield Pro — everything you need to protect every commercial roofing bid.
            </p>
          </div>
        </div>
      </section>

      {/* Single Pricing Card */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-10 text-white text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h2 className="text-3xl font-bold mb-2">BidShield Pro</h2>
            <div className="text-5xl font-bold mb-2">$249<span className="text-2xl font-normal">/mo</span></div>
            <p className="text-emerald-100 mb-8">or $2,490/year — save 2 months</p>

            <ul className="text-left space-y-3 mb-10">
              {[
                '18-phase scope checklist — never miss an item',
                '8 Excel estimating templates (all roofing systems)',
                'Bid readiness scoring before you submit',
                'Project dashboard & analytics',
                '14-day free trial, no credit card required',
                'Cancel anytime',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-emerald-300 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/bidshield/pricing"
              className="block w-full px-8 py-4 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Value Callout */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl font-bold text-amber-900 mb-3">
            A single missed mechanical curb on a $3M bid costs $30,000–$80,000.
          </p>
          <p className="text-amber-800">
            BidShield Pro pays for itself the first time it catches something you would have missed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Protect Your Bids?
          </h2>
          <Link
            href="/bidshield/pricing"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:scale-105 transition-all shadow-lg"
          >
            See Full Pricing & Start Free Trial
          </Link>
        </div>
      </section>
    </main>
  );
}
