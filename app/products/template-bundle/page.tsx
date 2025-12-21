import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Template Bundle | MC2 Estimating',
  description: 'Get all 5 roofing system templates, estimating checklist, and proposal library for $129. Save $200 with the complete bundle. Instant download.',
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
                BEST VALUE - SAVE $200
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Complete Template Bundle
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                All 5 roofing system templates, estimating checklist, and proposal library in one complete package. Everything you need to estimate any roofing project professionally.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$129</span>
                <div>
                  <span className="text-3xl text-blue-200 line-through block">$329</span>
                  <span className="text-green-400 font-semibold">Save $200</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="templateBundle"
                  text="Buy Template Bundle - $129"
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
                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="text-gray-900 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="font-bold text-xl mb-2">Complete Bundle Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>5 Roofing System Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Estimating Checklist</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Proposal Template Library</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Material Calculators</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Labor Estimators</span>
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
                Never miss a cost item again. Our comprehensive checklists and calculators ensure you capture every material, labor, and equipment cost.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Win More Bids</h3>
              <p className="text-gray-600">
                Professional proposals with detailed breakdowns build trust with clients and general contractors. Stand out from competitors with polished estimates.
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
              Individual value: $329 - Bundle price: $129 (Save $200)
            </p>
          </div>

          <div className="space-y-6">
            {/* Item 1 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🏠</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Asphalt Shingle Template</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
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
                <div className="text-5xl">🏢</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Single-Ply Roofing Template (TPO/PVC/EPDM)</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Single-ply roofing systems template for flat and low-slope commercial roofs.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Membrane calculations by attachment type</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Insulation layer takeoffs (polyiso, XPS, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Fastener pattern calculators</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Flashing and edge detail quantities</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Seam and penetration calculations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Mechanically attached vs fully adhered options</span>
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
                    <h3 className="text-2xl font-bold text-gray-900">Metal Roofing Template</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
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
                <div className="text-5xl">🏛️</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Tile Roofing Template</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
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

            {/* Item 5 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💨</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Spray Foam Roofing Template</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
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

            {/* Item 6 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">✅</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Complete Estimating Checklist</h3>
                    <span className="text-blue-600 font-semibold">$29 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Never miss a cost item again with this comprehensive estimating checklist.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Complete line-item checklist for all divisions</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Material, labor, and equipment sections</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>General conditions comprehensive breakdown</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Common missed items highlighted</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Project closeout requirements</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Fully customizable for your business</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 7 */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📄</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Proposal Template Library</h3>
                    <span className="text-blue-600 font-semibold">$79 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Professional proposal templates for 8 different roofing systems.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>8 system-specific proposal templates</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Professional cover letter templates (3 versions)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Scope of work language library</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Payment terms and warranty templates</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Exclusions and assumptions checklist</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Company credentials template</span>
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
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  All estimating templates in .xlsx format with formulas and calculations
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Word</h3>
                <p className="text-gray-600 text-sm">
                  Proposal templates and checklists in .docx format for easy customization
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Docs Compatible</h3>
                <p className="text-gray-600 text-sm">
                  All files work seamlessly with Google Sheets and Google Docs
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
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Entry-Level Estimators</h3>
              <p className="text-gray-600 text-sm">
                Starting in the trade and need proven templates to build estimates correctly from day one
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Contractors</h3>
              <p className="text-gray-600 text-sm">
                Transitioning from residential to commercial work and need professional systems
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Experienced Pros</h3>
              <p className="text-gray-600 text-sm">
                Want to standardize processes and ensure consistency across multiple estimators
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Small Roofing Companies</h3>
              <p className="text-gray-600 text-sm">
                1-20 employees looking to professionalize their estimating and proposal process
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
              How to Use the Template Bundle
            </h2>
            <p className="text-xl text-gray-600">
              Simple 4-step process to create professional estimates
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review with Checklist</h3>
                <p className="text-gray-600">
                  Use the included estimating checklist to verify you haven't missed any cost items. Add general conditions, equipment, and overhead/profit.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Professional Proposal</h3>
                <p className="text-gray-600">
                  Use the proposal templates to present your estimate professionally. Include scope of work, timeline, payment terms, and warranty information.
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
                "These templates cut my estimating time in half. I used to spend 3-4 hours on each estimate, now I can do it in less than an hour. The checklist alone is worth the price."
              </p>
              <p className="font-semibold text-gray-900">Mike Rodriguez</p>
              <p className="text-sm text-gray-500">Commercial Roofing Estimator</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "As a new estimator, these templates gave me a professional foundation. I'm not guessing anymore - everything is calculated and accounted for. My boss is impressed with my estimates now."
              </p>
              <p className="font-semibold text-gray-900">Sarah Chen</p>
              <p className="text-sm text-gray-500">Junior Estimator, ABC Roofing</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The proposal templates are outstanding. We went from basic quotes to professional proposals that build trust with clients. Our win rate has increased significantly."
              </p>
              <p className="font-semibold text-gray-900">David Thompson</p>
              <p className="text-sm text-gray-500">Owner, Thompson Roofing Co.</p>
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
              We're confident you'll love the Complete Template Bundle. If you're not completely satisfied within 30 days, we'll refund your purchase - no questions asked.
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

      {/* Related Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upgrade your business with these additional resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/lead-generation-guide" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lead Generation Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Discover where to find construction leads and how to build relationships with GCs
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/insurance-compliance-guide" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Insurance & Compliance Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Everything you need to know about contractor insurance and compliance
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$49</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/tools" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Estimating Essentials Tool</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Complete video guides on estimating, reading plans, and using Bluebeam
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$497</div>
              <div className="text-blue-600 font-semibold">View Tools →</div>
            </Link>
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
            Join hundreds of contractors saving time and creating professional estimates with the Complete Template Bundle
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$129</span>
              <div className="text-left">
                <span className="text-2xl text-blue-200 line-through block">$329</span>
                <span className="text-green-400 font-semibold">Save $200</span>
              </div>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • All future updates included</p>

            <GumroadCheckoutButton
              productKey="templateBundle"
              text="Buy Complete Template Bundle - $129"
              variant="large"
              className="shadow-2xl text-xl"
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
