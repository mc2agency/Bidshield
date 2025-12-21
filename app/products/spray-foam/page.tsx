import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function SprayFoamPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-cyan-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SPF ROOFING SYSTEMS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Spray Foam Roofing Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Complete Excel template for estimating spray polyurethane foam (SPF) roofing and insulation systems. Calculate foam coverage, coatings, and labor with precision.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="sprayFoam"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors text-lg border-2 border-indigo-600"
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
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-gray-900">
                    <div className="text-6xl mb-4 text-center">💨</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>SPF roofing and restoration</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Commercial flat roof applications</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Insulation and waterproofing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Re-foam and coating projects</span>
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
              Master SPF Roofing Estimates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Yield Calculations</h3>
              <p className="text-gray-600">
                Calculate foam coverage based on thickness, density, and equipment yield rates. No more guessing on material quantities.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Coating Coverage Rates</h3>
              <p className="text-gray-600">
                Precise calculations for elastomeric and silicone coatings at specified mil thickness with multi-layer systems.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">R-Value Planning</h3>
              <p className="text-gray-600">
                Calculate foam thickness needed for specific R-values and insulation requirements based on building codes.
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
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Spray Foam Coverage Calculator</h4>
                    <p className="text-gray-600 text-sm">Board foot calculations based on thickness, density (2lb, 3lb), and equipment yield rates</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Coating Application Rates</h4>
                    <p className="text-gray-600 text-sm">Elastomeric, silicone, and acrylic coating coverage by gallon at specified mil thickness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">R-Value & Thickness Planning</h4>
                    <p className="text-gray-600 text-sm">Calculate foam thickness needed for target R-values (R-6.25 per inch for closed cell)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Surface Preparation Materials</h4>
                    <p className="text-gray-600 text-sm">Primers, cleaners, and repair materials for substrate preparation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Layer System Breakdown</h4>
                    <p className="text-gray-600 text-sm">Base foam layer plus coating layers with reinforcement fabric calculations</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Equipment</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Surface Prep Labor Rates</h4>
                    <p className="text-gray-600 text-sm">Cleaning, priming, and repair labor hours by square footage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Foam Application Production</h4>
                    <p className="text-gray-600 text-sm">Labor hours based on thickness, area, and detail work with crew size recommendations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Coating Application Labor</h4>
                    <p className="text-gray-600 text-sm">Spray or roll application rates for each coating layer</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Equipment Rental Costs</h4>
                    <p className="text-gray-600 text-sm">Spray rig rental, compressor, generator, and safety equipment allowances</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Detail Work & Penetrations</h4>
                    <p className="text-gray-600 text-sm">Extra labor for flashing details, penetrations, and edge terminations</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-purple-50 border-2 border-purple-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Components</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Closed-Cell SPF</h4>
                <p className="text-gray-700 text-sm">2lb and 3lb density options with R-6+ per inch insulation value and waterproofing properties</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Coating Systems</h4>
                <p className="text-gray-700 text-sm">Elastomeric, silicone, and acrylic options with UV protection and warranty requirements</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Reinforcement Fabric</h4>
                <p className="text-gray-700 text-sm">Polyester fabric for critical areas including penetrations, walls, and high-traffic zones</p>
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
                <p className="text-gray-600 text-sm">Excel .xlsx with all formulas</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets</h3>
                <p className="text-gray-600 text-sm">Cloud access and sharing</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-bold text-gray-900 mb-2">Customizable</h3>
                <p className="text-gray-600 text-sm">Adjust for your pricing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Who Is This For?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💨</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">SPF Contractors</h3>
              <p className="text-gray-600 text-sm">
                Spray foam roofing specialists need accurate material yield calculations
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Roofers</h3>
              <p className="text-gray-600 text-sm">
                Adding SPF services to commercial roofing portfolio
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Restoration Specialists</h3>
              <p className="text-gray-600 text-sm">
                Focus on roof restoration with spray foam and coatings
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Insulation Contractors</h3>
              <p className="text-gray-600 text-sm">
                Expanding into roofing applications with spray foam systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How to Use</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select System & Target R-Value</h3>
                <p className="text-gray-600">Choose foam density (2lb or 3lb) and enter target R-value. Template calculates required thickness.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Roof Area & Equipment Specs</h3>
                <p className="text-gray-600">Input square footage and your spray rig's yield rate. Template calculates board feet and material sets needed.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Add Coating Layers</h3>
                <p className="text-gray-600">Specify coating type and mil thickness for each layer. Template calculates gallons and fabric reinforcement.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Present Estimate</h3>
                <p className="text-gray-600">Check labor hours, equipment costs, and total investment. Export professional summary with warranty details.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-lg text-gray-700">Not satisfied? Full refund within 30 days.</p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Related Products</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">BEST VALUE</div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">All 5 roofing templates</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/tpo-template" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC Template</h3>
              <p className="text-gray-600 mb-4 text-sm">Single-ply membrane systems</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/estimating-checklist" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Estimating Checklist</h3>
              <p className="text-gray-600 mb-4 text-sm">Never miss a cost item</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$29</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Master SPF Roofing Estimates</h2>
          <p className="text-xl text-blue-100 mb-8">Accurate material yields and coating calculations</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="sprayFoam"
              text="Buy Spray Foam Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-blue-200">30-Day Money-Back Guarantee • Instant Download</p>
          </div>

          <p className="text-sm text-blue-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
