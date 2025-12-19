import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Tool Bundle | MC2 Estimating',
  description: 'Every template, calculator, checklist, and guide we offer in one comprehensive package. Save $988 with the complete bundle. Instant download.',
  keywords: 'roofing estimating bundle, contractor tools bundle, estimating templates complete, construction calculator bundle',
};

export default function CompleteBundlePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SAVE $988 - ULTIMATE PACKAGE
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Complete Tool Bundle
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8">
                Every template, calculator, checklist, and guide we offer in one comprehensive package. Everything you need to estimate any roofing project professionally.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$997</span>
                <div>
                  <span className="text-3xl text-green-200 line-through block">$1,985</span>
                  <span className="text-yellow-400 font-semibold">Save $988</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="completeBundle"
                  text="Get Complete Bundle - $997"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors text-lg border-2 border-emerald-600"
                >
                  See Everything Included
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="text-gray-900 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="font-bold text-xl mb-2">Complete Bundle Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>All 8 Roofing System Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Complete Estimating Checklist</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Proposal Template Library</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Lead Generation Guide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Insurance & Compliance Guide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>OSHA Safety Guide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Technology Setup Guide</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold">Every Product We Offer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Complete Professional Estimating Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create accurate, professional estimates for any roofing project
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Every Template</h3>
              <p className="text-gray-600">
                All roofing system templates with automated calculations for instant professional estimates.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Checklists</h3>
              <p className="text-gray-600">
                Never miss a cost item with comprehensive checklists for every project type.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proposals</h3>
              <p className="text-gray-600">
                Professional proposal templates that help you win more bids and build client trust.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Guides</h3>
              <p className="text-gray-600">
                Essential guides covering leads, safety, insurance, and technology setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Detailed */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Included in Complete Bundle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Individual value: $1,985 - Bundle price: $997 (Save $988)
            </p>
          </div>

          {/* Roofing Templates */}
          <div className="bg-white rounded-xl p-8 mb-8 border-2 border-emerald-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🏠</span>
              Roofing System Templates ($312 value)
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Asphalt Shingle</h4>
                <p className="text-sm text-gray-600">Complete residential and commercial shingle estimating</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">TPO/PVC/EPDM</h4>
                <p className="text-sm text-gray-600">Single-ply membrane system calculations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Metal Roofing</h4>
                <p className="text-sm text-gray-600">Standing seam and corrugated metal</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Tile Roofing</h4>
                <p className="text-sm text-gray-600">Clay and concrete tile calculations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Spray Foam</h4>
                <p className="text-sm text-gray-600">SPF roofing and coating systems</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Green Roof</h4>
                <p className="text-sm text-gray-600">Vegetative roofing systems</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">SBS Modified</h4>
                <p className="text-sm text-gray-600">Modified bitumen systems</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Restoration Coating</h4>
                <p className="text-sm text-gray-600">Roof coating and restoration</p>
              </div>
            </div>
          </div>

          {/* Core Tools */}
          <div className="bg-white rounded-xl p-8 mb-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🛠️</span>
              Core Tools & Checklists ($108 value)
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Estimating Checklist ($29)</h4>
                <p className="text-sm text-gray-600">Comprehensive line-item checklist to never miss a cost</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Proposal Templates ($79)</h4>
                <p className="text-sm text-gray-600">8 system-specific proposal templates with cover letters</p>
              </div>
            </div>
          </div>

          {/* Business Guides */}
          <div className="bg-white rounded-xl p-8 mb-8 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">📖</span>
              Business Guides ($156 value)
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Lead Generation ($39)</h4>
                <p className="text-sm text-gray-600">Where to find work and build GC relationships</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Insurance Guide ($49)</h4>
                <p className="text-sm text-gray-600">Contractor insurance and compliance requirements</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">OSHA Safety ($39)</h4>
                <p className="text-sm text-gray-600">Fall protection and safety compliance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Tech Setup ($29)</h4>
                <p className="text-sm text-gray-600">Software and technology recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Comparison */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Bundle Value Breakdown</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">8 Roofing System Templates</span>
                <span className="font-semibold text-gray-900">$312</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Template Bundle (5 core templates)</span>
                <span className="font-semibold text-gray-900">$129</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Estimating Checklist</span>
                <span className="font-semibold text-gray-900">$29</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Proposal Template Library</span>
                <span className="font-semibold text-gray-900">$79</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Lead Generation Guide</span>
                <span className="font-semibold text-gray-900">$39</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Insurance & Compliance Guide</span>
                <span className="font-semibold text-gray-900">$49</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">OSHA Safety Guide</span>
                <span className="font-semibold text-gray-900">$39</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Technology Setup Guide</span>
                <span className="font-semibold text-gray-900">$29</span>
              </div>
              <div className="border-t-2 border-gray-400 pt-3 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">Total Individual Price:</span>
                <span className="font-bold text-gray-900">$1,985</span>
              </div>
              <div className="flex justify-between items-center text-xl bg-white rounded-lg p-4">
                <span className="font-bold text-green-600">Complete Bundle Price:</span>
                <span className="font-bold text-green-600">$997</span>
              </div>
              <div className="flex justify-between items-center text-2xl bg-yellow-100 rounded-lg p-4">
                <span className="font-bold text-green-700">You Save:</span>
                <span className="font-bold text-green-700">$988 (50% off)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is This Bundle For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New Estimators</h3>
              <p className="text-gray-600 text-sm">
                Starting your estimating career and need professional tools from day one.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Contractors</h3>
              <p className="text-gray-600 text-sm">
                Scaling your business and need systems that work for multiple estimators.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Business Owners</h3>
              <p className="text-gray-600 text-sm">
                Want complete toolset for your company without buying piecemeal.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">System Upgraders</h3>
              <p className="text-gray-600 text-sm">
                Replacing outdated spreadsheets with professional, proven templates.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Multi-System Contractors</h3>
              <p className="text-gray-600 text-sm">
                Work on multiple roofing types and need templates for all systems.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Value Seekers</h3>
              <p className="text-gray-600 text-sm">
                Want the best deal - save $988 versus buying products individually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What file formats are included?</h3>
              <p className="text-gray-600">
                All templates are provided in Microsoft Excel (.xlsx) format with working formulas. Proposal templates are in Microsoft Word (.docx). All files are compatible with Google Sheets and Google Docs.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is this really everything you offer?</h3>
              <p className="text-gray-600">
                Yes! The Complete Bundle includes every template, calculator, checklist, and guide we sell. Nothing is held back. When we release new tools, you'll get access to those as part of your lifetime updates.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I customize the templates?</h3>
              <p className="text-gray-600">
                Absolutely. All templates are fully customizable. Add your company logo, adjust labor rates for your market, modify formulas, and tailor everything to your specific needs.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What if I already own some products?</h3>
              <p className="text-gray-600">
                Contact us! We'll create a custom upgrade price that credits what you've already purchased. We want to make sure you get the best value.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is support included?</h3>
              <p className="text-gray-600">
                Yes! Email support is included for life. Ask questions about how to use templates, get advice on specific estimating situations, or request help customizing tools for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              We're confident the Complete Bundle will transform your estimating process. If you're not completely satisfied within 30 days, we'll refund your purchase - no questions asked.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Email Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>No Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Bundle Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Need Something Smaller?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We also offer smaller bundles to get you started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-200">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $200</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Template Bundle</h3>
              <p className="text-gray-600 mb-4">
                5 core roofing templates, estimating checklist, and proposal library.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-blue-600">$129</span>
                <span className="text-xl text-gray-500 line-through">$329</span>
              </div>
              <div className="text-blue-600 font-semibold">View Bundle →</div>
            </Link>

            <Link href="/products/starter-bundle" className="bg-gray-50 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-purple-200">
              <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $107</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Bundle</h3>
              <p className="text-gray-600 mb-4">
                Essential templates and guides to get your estimating started.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-purple-600">$297</span>
                <span className="text-xl text-gray-500 line-through">$404</span>
              </div>
              <div className="text-purple-600 font-semibold">View Bundle →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Every Tool You Need?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get lifetime access to every template, calculator, checklist, and guide we offer
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$997</span>
              <div className="text-left">
                <span className="text-2xl text-green-200 line-through block">$1,985</span>
                <span className="text-yellow-400 font-semibold text-xl">Save $988</span>
              </div>
            </div>
            <p className="text-green-100 mb-6">One-time payment • Lifetime access • All future updates included</p>

            <GumroadCheckoutButton
              productKey="completeBundle"
              text="Get Complete Bundle - $997"
              variant="large"
            />

            <p className="mt-6 text-sm text-green-200">
              30-Day Money-Back Guarantee • Instant Download
            </p>
          </div>

          <p className="text-sm text-green-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
