import StripeCheckoutButton from '@/components/StripeCheckoutButton';
import { BundleSchema, FAQSchema } from '@/components/ProductSchema';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Template Bundle',
  description: 'All 8 professional roofing estimating templates in one bundle. Asphalt, TPO, EPDM, Metal, Tile, BUR, SBS, Spray Foam. Save $133.',
  alternates: { canonical: 'https://www.bidshield.co/products/template-bundle' },
};

const TEMPLATES = [
  { icon: '🏠', name: 'Asphalt Shingle', desc: '3-tab, architectural, designer shingles' },
  { icon: '🔷', name: 'TPO Single-Ply', desc: 'Mechanically attached & fully adhered' },
  { icon: '⬛', name: 'EPDM Rubber', desc: 'Rubber membrane systems' },
  { icon: '🔩', name: 'Metal Standing Seam', desc: 'Standing seam & corrugated' },
  { icon: '🧱', name: 'Tile Roofing', desc: 'Concrete, clay, interlocking' },
  { icon: '🔥', name: 'BUR (Built-Up)', desc: 'Hot & cold applied multi-ply' },
  { icon: '📜', name: 'Siplast SBS Modified', desc: 'Torch & self-adhered bitumen' },
  { icon: '💨', name: 'Spray Foam Insulation', desc: 'Open-cell, closed-cell, coatings' },
];

export default function TemplateBundlePage() {
  return (
    <>
      <BundleSchema />
      <FAQSchema />
      <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-emerald-200 mb-4">
            <Link href="/products" className="hover:text-white">Products</Link>
            <span>/</span>
            <span>Bundle</span>
          </div>
          
          <div className="flex items-start gap-6">
            <span className="text-6xl">📦</span>
            <div>
              <div className="inline-block bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                BEST VALUE — SAVE $133
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Complete Template Bundle</h1>
              <p className="text-xl text-emerald-100 max-w-2xl">
                All 8 professional roofing estimating templates. Material takeoffs, labor calculators,
                cost recaps, and proposals for every major roofing system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Templates Grid */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">8 Templates Included</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TEMPLATES.map(t => (
                    <div key={t.name} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{t.name}</p>
                        <p className="text-sm text-slate-600">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's in each */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">What's In Every Template</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">📊 Material Takeoff</h3>
                    <p className="text-sm text-slate-600">
                      System-specific material lists with auto-calculations, waste factors, and customizable prices.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">👷 Labor Calculator</h3>
                    <p className="text-sm text-slate-600">
                      Crew-based calculations with full overburden — WC, unemployment, payroll taxes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">💰 Cost Recap</h3>
                    <p className="text-sm text-slate-600">
                      Estimating Edge format breakdown with materials, labor, subs, equipment, and profit.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">📄 Customer Proposal</h3>
                    <p className="text-sm text-slate-600">
                      Print-ready professional proposals with scope, pricing, terms, and signatures.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compatibility */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Compatibility</h2>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Microsoft Excel 2016 and newer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Google Sheets (free)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Works on PC and Mac
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Fully editable — add your logo and customize
                  </li>
                </ul>
              </div>
            </div>

            {/* Right - Purchase Box */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-500 sticky top-24">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-4xl font-bold text-slate-900">$99</span>
                    <span className="text-xl text-slate-400 line-through">$232</span>
                  </div>
                  <p className="text-sm text-slate-600">One-time payment</p>
                </div>

                <StripeCheckoutButton
                  productId="bundle-full"
                  text="Buy Bundle — $99"
                  variant="large"
                  className="w-full mb-4"
                />

                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Instant download
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    All 8 templates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Lifetime updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    30-day money-back guarantee
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-xs text-slate-500">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
