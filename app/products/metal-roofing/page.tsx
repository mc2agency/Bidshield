import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function MetalRoofingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                STANDING SEAM & CORRUGATED
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Metal Roofing Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-gray-100 mb-8">
                Complete Excel template for estimating standing seam and corrugated metal roofing. Calculate panel coverage, trim, fasteners, and labor for residential and commercial metal roof projects.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="metalRoofing"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors text-lg border-2 border-gray-500"
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
                    <div className="text-6xl mb-4 text-center">🔩</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Standing seam metal roofing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Corrugated and R-panel systems</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Residential and commercial projects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Retrofit and new construction</span>
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
              Master Metal Roofing Estimates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📏</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Panel Coverage</h3>
              <p className="text-gray-600">
                Calculate panel coverage accounting for width, length, and overlap. Get exact quantities for both standing seam and corrugated systems.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✂️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Trim Takeoffs</h3>
              <p className="text-gray-600">
                Comprehensive trim calculations for ridge, eave, rake, valley, and transition flashings with proper lengths and quantities.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fastener Calculators</h3>
              <p className="text-gray-600">
                Precise fastener quantities by panel type and spacing requirements. Never under-order screws, clips, or concealed fasteners again.
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
                    <h4 className="font-semibold text-gray-900">Panel Coverage Calculator</h4>
                    <p className="text-gray-600 text-sm">Standing seam and corrugated panel calculations with width coverage and overlap factors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trim & Flashing Takeoff</h4>
                    <p className="text-gray-600 text-sm">Ridge cap, eave trim, rake trim, valley, Z-bar, and transition flashing linear foot calculations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fastener Quantities</h4>
                    <p className="text-gray-600 text-sm">Exposed fastener screws, hidden clips, and panel seaming calculations by system type</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Underlayment & Accessories</h4>
                    <p className="text-gray-600 text-sm">Synthetic underlayment, closure strips, butyl tape, and sealant material quantities</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Substrate Requirements</h4>
                    <p className="text-gray-600 text-sm">Decking, purlins, and structural support calculations based on panel span requirements</p>
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
                    <h4 className="font-semibold text-gray-900">Panel Installation Rates</h4>
                    <p className="text-gray-600 text-sm">Labor hours per square for standing seam and corrugated systems by pitch and complexity</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trim Installation Labor</h4>
                    <p className="text-gray-600 text-sm">Linear foot labor rates for all trim types including custom bent flashing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Seaming & Fastening Time</h4>
                    <p className="text-gray-600 text-sm">Labor for mechanical seaming, snap-lock assembly, and exposed fastener installation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Equipment Costs</h4>
                    <p className="text-gray-600 text-sm">Seaming tools, panel brakes, lifts, and safety equipment allowances</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Production Adjustments</h4>
                    <p className="text-gray-600 text-sm">Pitch multipliers and complexity factors for cuts, valleys, and detail work</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-orange-50 border-2 border-orange-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Options Included</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Standing Seam</h4>
                <p className="text-gray-700 text-sm">Mechanical lock, snap-lock, and batten seam systems with concealed fastener calculations</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Corrugated/R-Panel</h4>
                <p className="text-gray-700 text-sm">Exposed fastener systems with screw spacing and washer quantities included</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Material Options</h4>
                <p className="text-gray-700 text-sm">Steel (galvanized, Galvalume), aluminum, copper, and zinc with gauge/thickness tracking</p>
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
                <p className="text-gray-600 text-sm">Excel .xlsx with formulas and protected cells</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets</h3>
                <p className="text-gray-600 text-sm">Cloud-based access and collaboration</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="font-bold text-gray-900 mb-2">Customizable</h3>
                <p className="text-gray-600 text-sm">Adjust pricing and rates for your market</p>
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
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Metal Roofers</h3>
              <p className="text-gray-600 text-sm">
                Specializing in metal roofing installations for residential and commercial projects
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Expanding Contractors</h3>
              <p className="text-gray-600 text-sm">
                Adding metal roofing to your service offerings and need proven estimating tools
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">General Contractors</h3>
              <p className="text-gray-600 text-sm">
                Self-performing metal roofing or verifying subcontractor quotes
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Estimators</h3>
              <p className="text-gray-600 text-sm">
                Need accurate panel coverage and trim calculations for metal roof bids
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
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select System & Material</h3>
                <p className="text-gray-600">Choose standing seam or corrugated, select material type (steel, aluminum, etc.), and enter panel width and gauge.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Roof Measurements</h3>
                <p className="text-gray-600">Input roof area, pitch, ridge length, valleys, eaves, and rakes. Template calculates panel quantities with coverage factors.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Adjust</h3>
                <p className="text-gray-600">Check all trim, fasteners, and accessories. Adjust labor rates and add any custom items specific to your project.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Present Estimate</h3>
                <p className="text-gray-600">Export professional summary with material specs, color choices, warranty info, and total investment.</p>
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
            <p className="text-lg text-gray-700 mb-4">
              Use the template on your metal roofing projects. Not satisfied? Full refund within 30 days.
            </p>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">All 5 roofing templates plus checklist and proposals</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/tile-roofing" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tile Roofing Template</h3>
              <p className="text-gray-600 mb-4 text-sm">Clay and concrete tile roofing estimating</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/asphalt-shingle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Asphalt Shingle Template</h3>
              <p className="text-gray-600 mb-4 text-sm">Residential asphalt shingle estimating</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get Your Metal Roofing Template Today</h2>
          <p className="text-xl text-gray-100 mb-8">Accurate estimates for standing seam and corrugated metal roofs</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-gray-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="metalRoofing"
              text="Buy Metal Roofing Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-gray-200">30-Day Money-Back Guarantee • Instant Download</p>
          </div>

          <p className="text-sm text-gray-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
