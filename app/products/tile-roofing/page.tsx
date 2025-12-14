import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function TileRoofingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-300 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                CLAY & CONCRETE TILE
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Tile Roofing Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-red-100 mb-8">
                Complete Excel template for estimating clay and concrete tile roofing projects. Calculate tile coverage, battens, mortar, and labor for beautiful, long-lasting tile roofs.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="tileRoofing"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-lg border-2 border-red-600"
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
                    <div className="text-6xl mb-4 text-center">🏛️</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Clay and concrete tile roofs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Flat, S-tile, and barrel tile profiles</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Residential and commercial projects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>New install and re-tile projects</span>
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
              Estimate Tile Roofing with Confidence
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tile Coverage Calculations</h3>
              <p className="text-gray-600">
                Accurate tile per square calculations for flat, S-tile, and barrel profiles with waste factors and breakage allowances.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🪵</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Batten & Lath Systems</h3>
              <p className="text-gray-600">
                Complete wood batten and metal lath takeoffs with proper spacing requirements for different tile types and weights.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">⚒️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Labor & Installation</h3>
              <p className="text-gray-600">
                Production rates accounting for tile weight, roof pitch, and complexity. Hip and ridge tile installation labor included.
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
                    <h4 className="font-semibold text-gray-900">Tile Coverage Per Square</h4>
                    <p className="text-gray-600 text-sm">Calculations for flat tile, S-tile, barrel tile with coverage rates and waste factors by profile</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Batten & Lath Material</h4>
                    <p className="text-gray-600 text-sm">Wood battens, metal lath, and counter-batten linear foot takeoffs with proper spacing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Hip & Ridge Tiles</h4>
                    <p className="text-gray-600 text-sm">Specialty hip and ridge tile calculations with starter pieces and closure pieces</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mortar & Adhesives</h4>
                    <p className="text-gray-600 text-sm">Mortar quantities for hip/ridge setting and tile adhesive for high wind areas</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Underlayment & Flashings</h4>
                    <p className="text-gray-600 text-sm">High-temp underlayment, valley metal, and flashing materials specific to tile roofing</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Installation</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Batten Installation Rates</h4>
                    <p className="text-gray-600 text-sm">Labor hours for wood batten and metal lath installation by square footage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tile Installation Labor</h4>
                    <p className="text-gray-600 text-sm">Production rates by tile type (flat, S, barrel) and installation method (nailed, clipped, mortared)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Hip & Ridge Labor</h4>
                    <p className="text-gray-600 text-sm">Specialized labor rates for hip and ridge tile installation with mortar setting</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Pitch & Complexity Adjustments</h4>
                    <p className="text-gray-600 text-sm">Labor multipliers for steep pitch, complex valleys, and turrets or towers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Material Handling</h4>
                    <p className="text-gray-600 text-sm">Crane rental, hoisting equipment, and labor for heavy tile material handling and staging</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-orange-50 border-2 border-orange-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tile Type Options</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Flat Concrete Tile</h4>
                <p className="text-gray-700 text-sm">Coverage rates for flat profile concrete tiles with interlocking design (typically 90-100 per square)</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">S-Tile (Clay/Concrete)</h4>
                <p className="text-gray-700 text-sm">Traditional S-shape profile calculations with coverage rates around 80-90 tiles per square</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Barrel/Mission Tile</h4>
                <p className="text-gray-700 text-sm">Two-piece barrel tile systems with under and cover tiles, wood or metal lath requirements</p>
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
                <p className="text-gray-600 text-sm">Cloud access and collaboration</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-bold text-gray-900 mb-2">Customizable</h3>
                <p className="text-gray-600 text-sm">Adjust for your local pricing</p>
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
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Tile Specialists</h3>
              <p className="text-gray-600 text-sm">
                Contractors specializing in clay and concrete tile roofing installations
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🌴</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Warm Climate Roofers</h3>
              <p className="text-gray-600 text-sm">
                Contractors in markets where tile roofing is common (Southwest, Florida, California)
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏘️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Residential Builders</h3>
              <p className="text-gray-600 text-sm">
                Custom home builders offering tile roofing as premium option
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Expanding Contractors</h3>
              <p className="text-gray-600 text-sm">
                Adding tile roofing services and need professional estimating tools
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
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select Tile Type & Profile</h3>
                <p className="text-gray-600">Choose clay or concrete, select profile (flat, S-tile, barrel), and enter tile coverage rate from manufacturer specs.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Roof Measurements</h3>
                <p className="text-gray-600">Input roof area, pitch, hips, ridges, and valleys. Template calculates tile quantities with waste and breakage factors.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Materials & Labor</h3>
                <p className="text-gray-600">Check all batten, mortar, and accessory quantities. Review labor hours accounting for tile weight and installation complexity.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Present Professional Estimate</h3>
                <p className="text-gray-600">Export summary showing tile specifications, color options, warranty details, and total investment.</p>
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
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/metal-roofing" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🔩</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Metal Roofing Template</h3>
              <p className="text-gray-600 mb-4 text-sm">Standing seam and corrugated</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/spray-foam" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spray Foam Template</h3>
              <p className="text-gray-600 mb-4 text-sm">SPF roofing systems</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Estimating Tile Roofs Today</h2>
          <p className="text-xl text-red-100 mb-8">Accurate estimates for clay and concrete tile projects</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-red-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="tileRoofing"
              text="Buy Tile Roofing Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-red-200">30-Day Money-Back Guarantee • Instant Download</p>
          </div>

          <p className="text-sm text-red-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
