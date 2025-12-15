import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TPO/PVC/EPDM Estimating Template | MC2 Estimating',
  description: 'Professional Excel template for single-ply membrane roofing estimates. Calculate materials, labor, and costs for TPO, PVC, and EPDM commercial roof projects. Instant download.',
  keywords: 'TPO template, EPDM estimating, PVC roofing template, single-ply membrane template, commercial roofing estimate',
};

export default function TPOTemplatePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                COMMERCIAL FLAT ROOFS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                TPO/PVC/EPDM Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Complete Excel template for estimating single-ply membrane roofing systems. Calculate materials, labor, and costs for TPO, PVC, and EPDM commercial roof projects.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="tpoTemplate"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
                >
                  See What's Included
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-gray-900">
                    <div className="text-6xl mb-4 text-center">🏢</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>TPO, PVC, and EPDM membranes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Mechanically attached or fully adhered</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Flat and low-slope commercial roofs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Re-roof and new construction</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Master Commercial Membrane Estimating
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handle complex commercial flat roof projects with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Takeoffs</h3>
              <p className="text-gray-600">
                Calculate membrane, insulation, fasteners, and adhesives precisely. Built-in formulas account for seams, overlaps, and waste.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Attachment Methods</h3>
              <p className="text-gray-600">
                Separate calculators for mechanically attached, fully adhered, and ballasted systems with accurate fastener patterns.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Presentations</h3>
              <p className="text-gray-600">
                Generate detailed breakdowns for GCs and building owners showing material specs, warranty options, and project timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Included in the Template
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to estimate single-ply membrane roofing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Membrane Coverage Calculator</h4>
                    <p className="text-gray-600 text-sm">Square footage calculations for TPO, PVC, or EPDM with seam overlap and waste factors by attachment method</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Insulation Layer Takeoffs</h4>
                    <p className="text-gray-600 text-sm">Multiple layer calculations for polyiso, XPS, EPS with taper systems and R-value tracking</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fastener Pattern Calculator</h4>
                    <p className="text-gray-600 text-sm">Plates and fasteners based on pattern requirements, wind zone, and building height</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Adhesive & Bonding Materials</h4>
                    <p className="text-gray-600 text-sm">Coverage rates for fully adhered systems, lap adhesive, and bonding adhesive by square footage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing & Edge Details</h4>
                    <p className="text-gray-600 text-sm">Linear foot calculations for perimeter edge, wall flashings, termination bars, and coping caps</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Penetration & Drain Materials</h4>
                    <p className="text-gray-600 text-sm">Pre-fabricated pipe boots, drain assemblies, walkway pads, and penetration flashings</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Production Rates</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tear-Off Labor by System</h4>
                    <p className="text-gray-600 text-sm">Removal rates for existing single-ply, built-up, or modified systems with disposal calculations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Insulation Installation Rates</h4>
                    <p className="text-gray-600 text-sm">Labor hours per square for rigid board insulation including mechanically attached and adhered methods</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Membrane Installation Labor</h4>
                    <p className="text-gray-600 text-sm">Production rates for mechanically attached, fully adhered, and ballasted systems by membrane type</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing & Detail Work</h4>
                    <p className="text-gray-600 text-sm">Labor for wall flashings, terminations, penetrations, and edge details per linear foot</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Equipment & Access Costs</h4>
                    <p className="text-gray-600 text-sm">Cranes, forklifts, hot air welders, and safety equipment allowances by project size</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Testing & Quality Control</h4>
                    <p className="text-gray-600 text-sm">Labor and materials for flood testing, seam testing, and core cut verification</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System-Specific Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">TPO Membrane</h4>
                <p className="text-gray-700 text-sm">45, 60, 80 mil thickness options with heat welding seam calculations and reinforced fabric allowances</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">PVC Membrane</h4>
                <p className="text-gray-700 text-sm">45, 60, 80 mil options with chemical resistance factors and reinforced flashing materials</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">EPDM Rubber</h4>
                <p className="text-gray-700 text-sm">45, 60, 90 mil thickness with splice tape, bonding adhesive, and batten bar systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Format</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  Excel .xlsx format with formulas and protected cells
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Sheets for cloud access
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-bold text-gray-900 mb-2">Fully Customizable</h3>
                <p className="text-gray-600 text-sm">
                  Adjust all pricing, rates, and formulas to match your market
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is This Template For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Roofers</h3>
              <p className="text-gray-600 text-sm">
                Specializing in commercial flat roofs and single-ply membrane systems for GC bid packages
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Contractors</h3>
              <p className="text-gray-600 text-sm">
                Expanding from residential to commercial work and need professional estimating tools
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Estimators</h3>
              <p className="text-gray-600 text-sm">
                Need accurate, detailed estimates for single-ply systems with proper fastener patterns
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Multi-System Contractors</h3>
              <p className="text-gray-600 text-sm">
                Handle TPO, PVC, and EPDM projects and need one template for all three systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Use the Template
            </h2>
            <p className="text-xl text-gray-600">
              From takeoff to bid submission in 4 easy steps
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select System Type & Set Pricing</h3>
                <p className="text-gray-600">
                  Choose TPO, PVC, or EPDM and select attachment method (mechanically attached, fully adhered, or ballasted). Enter your material costs and labor rates.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Roof Measurements</h3>
                <p className="text-gray-600">
                  Input total square footage, perimeter edge, wall flashings, penetrations, and drain locations. The template calculates all membrane overlaps and seam allowances.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Material & Labor Totals</h3>
                <p className="text-gray-600">
                  Template automatically calculates membrane, insulation, fasteners, adhesive, and all accessories. Labor hours are broken down by task with crew size recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Bid Package</h3>
                <p className="text-gray-600">
                  Export the professional summary showing material specifications, warranty options, project timeline, and total investment. Perfect for GC bid submissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Commercial Roofers Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The fastener calculator alone is worth the price. It accounts for wind zones and building height - exactly what I need for commercial work."
              </p>
              <p className="font-semibold text-gray-900">David Lopez</p>
              <p className="text-sm text-gray-500">Commercial Estimator</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Finally, a template that handles all three membrane types. I can switch between TPO, PVC, and EPDM estimates quickly and accurately."
              </p>
              <p className="font-semibold text-gray-900">Karen Williams</p>
              <p className="text-sm text-gray-500">Owner, Williams Commercial Roofing</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The adhesive coverage calculations are perfect. No more guessing how many gallons I need for fully adhered systems."
              </p>
              <p className="font-semibold text-gray-900">Robert Jackson</p>
              <p className="text-sm text-gray-500">Project Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              Use the template on commercial projects. If it doesn't improve your estimating accuracy and speed, we'll refund your purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Estimating Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get all roofing templates in one bundle and save $200
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE - SAVE $200
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All 5 roofing templates, estimating checklist, and proposal library
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/metal-roofing" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🔩</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Metal Roofing Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Standing seam and corrugated metal roofing estimating template
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/spray-foam" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spray Foam Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                SPF roofing and insulation system estimating template
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Master Commercial Membrane Estimating?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join commercial roofers using our proven single-ply template for accurate bids
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="tpoTemplate"
              text="Buy TPO/PVC/EPDM Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-blue-200">
              30-Day Money-Back Guarantee • Instant Download
            </p>
          </div>

          <p className="text-sm text-blue-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
