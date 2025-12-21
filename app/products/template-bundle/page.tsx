import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Contractor Estimating Bundle | MC2 Estimating',
  description: 'Get all 4 roofing estimating templates for $129. Asphalt, Tile, Metal, and Spray Foam templates. Save $67 with the complete bundle. Instant download.',
  keywords: 'roofing template bundle, estimating templates, roofing estimate excel, contractor templates',
};

export default function TemplateBundlePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                BEST VALUE - SAVE $67
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Complete Contractor Estimating Bundle
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                All 4 professional roofing estimating templates in one download. Everything you need to estimate residential and commercial roofing projects accurately.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$129</span>
                <div>
                  <span className="text-3xl text-blue-200 line-through block">$196</span>
                  <span className="text-green-400 font-semibold">Save $67 (34% OFF)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="templateBundle"
                  text="Buy Bundle - $129"
                  variant="large"
                  className="shadow-lg"
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
                  <span>Excel + Google Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>User Guides Included</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="text-gray-900 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="font-bold text-xl mb-2">Bundle Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Asphalt Shingle Roofing Estimator ($49 value)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Tile Roofing Estimator ($49 value)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Metal Roofing Estimator ($49 value)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Spray Foam Insulation Estimator ($49 value)</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="text-green-500">✓</span>
                        <span>User Guides + README</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose the Complete Bundle?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get everything you need to create professional, accurate estimates for any roofing project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Time</h3>
              <p className="text-gray-600">
                Pre-built templates with automated calculations cut your estimating time from hours to minutes. Stop reinventing the wheel for every project.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Improve Accuracy</h3>
              <p className="text-gray-600">
                Built-in formulas calculate materials, waste factors, and labor automatically. Reduce costly estimation errors.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save $67</h3>
              <p className="text-gray-600">
                Get all 4 templates for $129 instead of $196 if purchased separately. Best value for contractors who work with multiple roofing systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Detailed Breakdown */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Included in the Bundle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              4 Excel templates ($196 value) → Bundle price: $129 (Save $67)
            </p>
          </div>

          <div className="space-y-6">
            {/* Item 1 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🏠</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Asphalt Shingle Roofing Estimator</h3>
                    <span className="text-blue-600 font-semibold">$49 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Complete estimating template for residential and commercial asphalt shingle roofing projects.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Shingle material calculator with waste factors</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Underlayment and ice/water shield calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Starter strip and ridge cap quantities</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Labor rates by pitch and complexity</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Pitch multiplier reference charts</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Tear-off and disposal calculations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🏛️</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Tile Roofing Estimator</h3>
                    <span className="text-blue-600 font-semibold">$49 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Clay and concrete tile roofing estimation for residential and commercial projects.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Tile coverage per square calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Batten and lath material takeoff</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Mortar and adhesive quantity calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Hip and ridge tile calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Labor rates by tile type and installation method</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Underlayment and flashings</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🔩</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Metal Roofing Estimator</h3>
                    <span className="text-blue-600 font-semibold">$49 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Standing seam and corrugated metal roofing estimation system.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Panel coverage calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Standing seam vs corrugated options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Trim and flashing comprehensive takeoff</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Fastener quantities by system type</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Underlayment and accessories</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Substrate and structural requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💨</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Spray Foam Insulation Estimator</h3>
                    <span className="text-blue-600 font-semibold">$49 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    SPF (spray polyurethane foam) roofing and insulation system estimation.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Spray foam coverage calculators</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Coating application rates and materials</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Multi-layer system breakdown</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>R-value and thickness planning tools</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Material yield calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Surface preparation requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Formats Provided</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel (.xlsx)</h3>
                <p className="text-gray-600 text-sm">
                  All estimating templates work with Excel 2016+ with formulas and calculations
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  All files work seamlessly with Google Sheets - PC and Mac compatible
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is This For?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perfect for contractors at any experience level who want professional estimating systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Roofing Contractors</h3>
              <p className="text-gray-600 text-sm">
                Need accurate estimates for multiple roofing system types
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Companies</h3>
              <p className="text-gray-600 text-sm">
                Transitioning from residential to commercial work and need professional systems
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Estimators</h3>
              <p className="text-gray-600 text-sm">
                Want to standardize processes and ensure consistency across projects
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Small Roofing Companies</h3>
              <p className="text-gray-600 text-sm">
                1-20 employees looking to professionalize their estimating process
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use It Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Use the Templates
            </h2>
            <p className="text-xl text-gray-600">
              Simple 3-step process to create professional estimates
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download and Customize</h3>
                <p className="text-gray-600">
                  After purchase, instantly download all templates. Open in Excel or Google Sheets and add your company information, labor rates, and local pricing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Input Project Details</h3>
                <p className="text-gray-600">
                  Enter your project measurements, system type, and specific requirements. The templates automatically calculate materials with waste factors and labor hours.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Your Estimate</h3>
                <p className="text-gray-600">
                  Review the calculated totals, add your overhead/profit, and you have a professional estimate ready to present to clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professional Contractors
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "These templates cut my estimating time in half. I used to spend 3-4 hours on each estimate, now I can do it in less than an hour."
              </p>
              <p className="font-semibold text-gray-900">Mike Rodriguez</p>
              <p className="text-sm text-gray-500">Commercial Roofing Estimator</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "As a new estimator, these templates gave me a professional foundation. I'm not guessing anymore - everything is calculated and accounted for."
              </p>
              <p className="font-semibold text-gray-900">Sarah Chen</p>
              <p className="text-sm text-gray-500">Junior Estimator</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The bundle was a no-brainer. We do shingle, metal, and spray foam work - having all the templates saves us money and keeps our estimates consistent."
              </p>
              <p className="font-semibold text-gray-900">David Thompson</p>
              <p className="text-sm text-gray-500">Owner, Thompson Roofing Co.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Need Individual Templates?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you only work with one roofing system, individual templates are available
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Link href="/products/asphalt-shingle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Asphalt Shingle</h3>
              <div className="text-xl font-bold text-blue-600">$49</div>
            </Link>

            <Link href="/products/tile-roofing" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tile Roofing</h3>
              <div className="text-xl font-bold text-blue-600">$49</div>
            </Link>

            <Link href="/products/metal-roofing" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🔩</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Metal Roofing</h3>
              <div className="text-xl font-bold text-blue-600">$49</div>
            </Link>

            <Link href="/products/spray-foam" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Spray Foam</h3>
              <div className="text-xl font-bold text-blue-600">$49</div>
            </Link>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              <strong>Pro tip:</strong> The bundle saves you $67 compared to buying all 4 individually
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Estimating Process?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get all 4 professional estimating templates for one low price
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$129</span>
              <div className="text-left">
                <span className="text-2xl text-blue-200 line-through block">$196</span>
                <span className="text-green-400 font-semibold">Save $67 (34% OFF)</span>
              </div>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Instant download • Excel + Google Sheets</p>

            <GumroadCheckoutButton
              productKey="templateBundle"
              text="Buy Complete Bundle - $129"
              variant="large"
              className="shadow-2xl text-xl"
            />

            <p className="mt-6 text-sm text-blue-200">
              Instant Download • Works on PC and Mac
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
