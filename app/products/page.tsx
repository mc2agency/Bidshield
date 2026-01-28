import Link from 'next/link';
import StripeCheckoutButton from '@/components/StripeCheckoutButton';
import { BundleSchema, FAQSchema } from '@/components/ProductSchema';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools & Templates | MC2 Estimating',
  description: 'Professional roofing estimating templates for 8 systems. Excel templates for asphalt shingle, TPO, EPDM, metal, tile, BUR, SBS, and spray foam roofing.',
  keywords: 'roofing templates, estimating template, roofing estimate template, construction templates, Excel estimating',
};

const TEMPLATES = [
  {
    id: 'asphalt-shingle',
    icon: '🏠',
    title: 'Asphalt Shingle',
    description: '3-tab, architectural, and designer shingles with pitch multipliers',
  },
  {
    id: 'tpo',
    icon: '🔷',
    title: 'TPO Single-Ply',
    description: 'Mechanically attached & fully adhered TPO membrane systems',
  },
  {
    id: 'epdm',
    icon: '⬛',
    title: 'EPDM Rubber',
    description: 'Mechanically attached, fully adhered, and ballasted rubber',
  },
  {
    id: 'metal',
    icon: '🔩',
    title: 'Metal Standing Seam',
    description: 'Standing seam, corrugated, and metal shingle systems',
  },
  {
    id: 'tile',
    icon: '🧱',
    title: 'Tile Roofing',
    description: 'Concrete, clay, and interlocking tile with breakage factors',
  },
  {
    id: 'bur',
    icon: '🔥',
    title: 'BUR (Built-Up)',
    description: 'Hot-applied & cold-applied multi-ply roofing systems',
  },
  {
    id: 'sbs',
    icon: '📜',
    title: 'Siplast SBS Modified',
    description: 'Torch-applied & self-adhered modified bitumen',
  },
  {
    id: 'spray-foam',
    icon: '💨',
    title: 'Spray Foam Insulation',
    description: 'Open-cell, closed-cell, and roof coating systems',
  },
];

export default function ProductsPage() {
  return (
    <>
      <BundleSchema />
      <FAQSchema />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Professional Estimating
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Templates</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              8 roofing system templates. Material takeoffs, labor calculators, and professional proposals.
              Download and start estimating in 10 minutes.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Excel & Google Sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bundle */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold">
                BEST VALUE — SAVE $133
              </div>
              <div className="p-8 sm:p-12 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">📦</span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold">Complete Template Bundle</h2>
                    <p className="text-emerald-100">All 8 templates for the price of 3</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-lg text-emerald-100 mb-6">
                      Every roofing system covered. Material takeoffs, labor calculators with overburden,
                      cost recaps, and professional proposals. Works with Excel and Google Sheets.
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-5xl font-bold">$99</span>
                        <span className="text-2xl text-emerald-200 line-through">$232</span>
                      </div>
                      <p className="text-sm text-emerald-200">One-time payment • Lifetime access</p>
                    </div>

                    <StripeCheckoutButton
                      productId="bundle-full"
                      text="Get All 8 Templates — $99"
                      variant="large"
                      className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-xl mb-4">All 8 Systems Included:</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map(t => (
                        <li key={t.id} className="flex items-center gap-2 text-sm">
                          <span>{t.icon}</span>
                          <span>{t.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-emerald-500/30">
                      <h4 className="font-semibold mb-2">Every template includes:</h4>
                      <ul className="space-y-1 text-sm text-emerald-100">
                        <li>✓ Material Takeoff Calculator</li>
                        <li>✓ Labor Calculator with Overburden</li>
                        <li>✓ Cost Recap (Estimating Edge format)</li>
                        <li>✓ Professional Customer Proposal</li>
                        <li>✓ Dashboard Summary</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Templates */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Individual Templates — $29 Each
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Need just one system? Purchase individual templates for the roofing systems you specialize in.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all group"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {template.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">$29</span>
                  <StripeCheckoutButton
                    productId={template.id}
                    text="Buy"
                    variant="primary"
                    className="px-4 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What's Inside Each Template</h2>
            <p className="text-lg text-slate-600">Professional tools built by estimators, for estimators</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Material Takeoff
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>• System-specific material lists</li>
                <li>• Auto-calculated quantities</li>
                <li>• Built-in waste factors</li>
                <li>• Customizable unit prices</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">👷</span> Labor Calculator
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Crew-based calculations</li>
                <li>• Full overburden tracking</li>
                <li>• Workers comp, unemployment, payroll</li>
                <li>• Adjustable production rates</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span> Cost Recap
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Estimating Edge format</li>
                <li>• Material vs labor breakdown</li>
                <li>• Subcontractor & equipment lines</li>
                <li>• Adjustable profit margins</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📄</span> Customer Proposal
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>• Print-ready format</li>
                <li>• Professional layout</li>
                <li>• Scope of work section</li>
                <li>• Terms and signature lines</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">What software do I need?</h3>
              <p className="text-slate-600">Microsoft Excel 2016 or newer, or Google Sheets (free). Works on PC and Mac.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Can I customize the templates?</h3>
              <p className="text-slate-600">Yes! Add your logo, adjust prices, change rates — they're fully editable Excel files.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Do I get updates?</h3>
              <p className="text-slate-600">Yes — lifetime updates at no extra cost. We'll email you when improvements are made.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">What's your refund policy?</h3>
              <p className="text-slate-600">30-day money-back guarantee. If the templates don't save you time, we'll refund you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Estimate Like a Pro?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Get the complete bundle and start creating accurate estimates in minutes.
          </p>
          <StripeCheckoutButton
            productId="bundle-full"
            text="Get All 8 Templates — $99"
            variant="large"
          />
          <p className="text-sm text-slate-400 mt-4">
            30-day money-back guarantee • Instant download • Lifetime updates
          </p>
        </div>
      </section>
    </main>
    </>
  );
}
