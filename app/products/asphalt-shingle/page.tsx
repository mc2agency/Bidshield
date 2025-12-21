import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function AsphaltShinglePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                RESIDENTIAL & COMMERCIAL
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Asphalt Shingle Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Complete Excel template for estimating residential and commercial asphalt shingle roofing projects. Calculate materials, labor, and costs accurately every time.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="asphaltShingle"
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
                    <div className="text-6xl mb-4 text-center">🏠</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>3-tab and architectural shingles</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Tear-off and re-roof projects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>New construction shingle roofs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Residential and light commercial</span>
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
              Why You Need This Template
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop guessing and start estimating with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Hours</h3>
              <p className="text-gray-600">
                Pre-built formulas calculate everything automatically. Enter measurements and get instant material quantities and labor hours.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eliminate Errors</h3>
              <p className="text-gray-600">
                Built-in waste factors, pitch multipliers, and comprehensive checklists ensure you never miss a cost item or under-calculate materials.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Win More Work</h3>
              <p className="text-gray-600">
                Professional, detailed estimates build trust with homeowners and GCs. Stand out from competitors with organized, accurate bids.
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
              Everything you need to estimate asphalt shingle roofing projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Shingle Quantity Calculator</h4>
                    <p className="text-gray-600 text-sm">Automatic calculation based on roof area with waste factors for valleys, hips, and complexity</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Underlayment & Ice Dam Protection</h4>
                    <p className="text-gray-600 text-sm">Felt or synthetic underlayment coverage plus ice and water shield for eaves, valleys, and penetrations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Starter Shingles & Ridge Cap</h4>
                    <p className="text-gray-600 text-sm">Linear foot calculations for eaves, rakes, hips, and ridges with proper overlap factors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ventilation Components</h4>
                    <p className="text-gray-600 text-sm">Ridge vents, soffit vents, and static vents based on attic square footage and building codes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing & Valley Materials</h4>
                    <p className="text-gray-600 text-sm">Step flashing, counter flashing, drip edge, and valley metal quantities by linear foot</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fasteners & Accessories</h4>
                    <p className="text-gray-600 text-sm">Roofing nails, cap nails, adhesive, and caulk based on square footage and application rates</p>
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
                    <h4 className="font-semibold text-gray-900">Pitch Multiplier Reference</h4>
                    <p className="text-gray-600 text-sm">Built-in pitch multipliers from 3/12 to 12/12 for accurate area calculations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Labor Hours by Complexity</h4>
                    <p className="text-gray-600 text-sm">Production rates for simple, average, and complex roofs adjusted for pitch and cuts</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tear-Off Labor Calculator</h4>
                    <p className="text-gray-600 text-sm">Removal time based on layers, pitch, and difficulty with disposal labor included</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Installation Labor Rates</h4>
                    <p className="text-gray-600 text-sm">Separate rates for shingle installation, valley work, flashing, and ridge installation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Crew Size Optimization</h4>
                    <p className="text-gray-600 text-sm">Recommended crew sizes and project duration estimates based on roof size</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cleanup & Disposal Costs</h4>
                    <p className="text-gray-600 text-sm">Dumpster fees, haul-away costs, and final cleanup labor allowances</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plus These Essential Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Customizable Pricing</h4>
                <p className="text-gray-700 text-sm">Enter your local material costs and labor rates. Template remembers your pricing for future estimates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Overhead & Profit</h4>
                <p className="text-gray-700 text-sm">Built-in markup calculators for overhead, profit margin, and contingency percentages.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Professional Summary</h4>
                <p className="text-gray-700 text-sm">Auto-generated estimate summary with line-item breakdown ready to present to clients.</p>
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
                  Excel .xlsx format with formulas and protected cells to prevent accidental changes
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Sheets for cloud-based access and team collaboration
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="font-bold text-gray-900 mb-2">Mobile Friendly</h3>
                <p className="text-gray-600 text-sm">
                  Works on desktop, tablet, and mobile for estimating on the go
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
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Residential Roofers</h3>
              <p className="text-gray-600 text-sm">
                Specializing in residential shingle work and need consistent, accurate estimates for homeowners
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New Estimators</h3>
              <p className="text-gray-600 text-sm">
                Starting to estimate and need a proven template with all the formulas and factors already built in
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Small Contractors</h3>
              <p className="text-gray-600 text-sm">
                Running a 1-10 person roofing company and need professional estimating systems without expensive software
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Businesses</h3>
              <p className="text-gray-600 text-sm">
                Expanding into new markets or onboarding new estimators and need standardized processes
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
              Get started in minutes with this simple process
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download & Set Up Your Pricing</h3>
                <p className="text-gray-600">
                  After purchase, download the Excel template. Enter your local material costs (shingles, underlayment, etc.) and your labor rates. The template saves these for future estimates.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Project Measurements</h3>
                <p className="text-gray-600">
                  Input the roof area, pitch, number of valleys, hips, ridges, and any special conditions. The template automatically applies pitch multipliers and calculates actual square footage.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Automated Calculations</h3>
                <p className="text-gray-600">
                  The template instantly calculates all material quantities with waste factors, labor hours by task, and total project costs. Review and adjust as needed for site-specific conditions.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Present to Client</h3>
                <p className="text-gray-600">
                  Use the professional summary sheet to present your estimate. Export to PDF or print for client meetings. Update and revise easily if project scope changes.
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
              What Contractors Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "This template cut my estimating time from 2 hours to 20 minutes. All the formulas are built in and it catches things I used to forget like ridge cap and starter."
              </p>
              <p className="font-semibold text-gray-900">Tom Richards</p>
              <p className="text-sm text-gray-500">Owner, Richards Roofing</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "As a new estimator, this gave me confidence I was calculating everything correctly. The pitch multipliers and waste factors are spot-on."
              </p>
              <p className="font-semibold text-gray-900">Jessica Martinez</p>
              <p className="text-sm text-gray-500">Estimator, Apex Roofing</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Best $39 I've spent. The labor calculators alone are worth it. I can adjust for my crew's production rate and get accurate project timelines."
              </p>
              <p className="font-semibold text-gray-900">Michael Chen</p>
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
              Use the template on your next few estimates. If it doesn't save you time and improve accuracy, we'll refund your purchase - no questions asked.
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
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/tpo-template" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC/EPDM Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Single-ply membrane roofing template for commercial flat roofs
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/metal-roofing" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🔩</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Metal Roofing Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Standing seam and corrugated metal roofing estimating template
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Estimate Faster and More Accurately?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of contractors using our proven asphalt shingle template
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="asphaltShingle"
              text="Buy Asphalt Shingle Template - $39"
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
