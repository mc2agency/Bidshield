import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function SBSTemplatePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-emerald-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                COMMERCIAL FLAT ROOFING
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                SBS Modified Bitumen Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-emerald-100 mb-8">
                Professional Excel template for estimating commercial modified bitumen roofing systems. Calculate base sheets, cap sheets, primer, and labor for torch-applied and self-adhered SBS installations.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="sbsTemplate"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors text-lg border-2 border-teal-600"
                >
                  See What's Included
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
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
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>Torch-applied modified bitumen systems</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>Self-adhered SBS membrane installations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>Base sheet and cap sheet configurations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>Commercial low-slope and flat roofs</span>
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
              Master SBS modified bitumen estimating with proven formulas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Estimate Faster</h3>
              <p className="text-gray-600">
                Pre-configured formulas automatically calculate base sheets, cap sheets, primer coverage, and flashing quantities. Enter square footage and get instant material counts.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eliminate Costly Mistakes</h3>
              <p className="text-gray-600">
                Built-in overlap factors, waste allowances, and comprehensive material checklists ensure you never under-order rolls or miss critical components like primers and adhesives.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Win Commercial Bids</h3>
              <p className="text-gray-600">
                Professional, detailed estimates with proper system specifications build credibility with commercial property managers and general contractors.
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
              Everything you need to estimate SBS modified bitumen roofing projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Base Sheet & Cap Sheet Quantities</h4>
                    <p className="text-gray-600 text-sm">Automatic roll calculations with proper lap allowances for side and end laps. Includes both torch-applied and self-adhered configurations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Primer Coverage Calculator</h4>
                    <p className="text-gray-600 text-sm">Asphalt primer quantities for substrate preparation with application rate adjustments for concrete, wood, and existing membrane surfaces.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing Material Takeoffs</h4>
                    <p className="text-gray-600 text-sm">Perimeter flashing, parapet cap, penetration flashings, and corner details with proper material specifications and quantities.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Insulation & Cover Board</h4>
                    <p className="text-gray-600 text-sm">Rigid insulation board calculations with R-value options, tapered insulation layouts, and cover board requirements for torch applications.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fasteners & Adhesives</h4>
                    <p className="text-gray-600 text-sm">Mechanical fasteners for base sheet attachment, cold adhesive for self-adhered systems, and mastic quantities for detail work.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Drainage & Accessories</h4>
                    <p className="text-gray-600 text-sm">Roof drain components, scuppers, overflow drains, and edge metal specifications with linear foot calculations.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Production Rates</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Torch-Applied Installation Rates</h4>
                    <p className="text-gray-600 text-sm">Labor hours for torch-welding base and cap sheets with adjustments for crew experience and roof complexity.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Self-Adhered Application Labor</h4>
                    <p className="text-gray-600 text-sm">Production rates for peel-and-stick SBS systems including surface preparation and proper installation techniques.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tear-Off & Disposal Calculations</h4>
                    <p className="text-gray-600 text-sm">Removal labor for existing BUR or SBS systems with weight calculations for dumpster sizing and disposal costs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing & Detail Labor</h4>
                    <p className="text-gray-600 text-sm">Separate labor rates for parapet walls, penetration flashings, edge details, and complex corner configurations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Substrate Preparation Time</h4>
                    <p className="text-gray-600 text-sm">Labor for deck repairs, primer application, insulation installation, and surface preparation work.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Project Duration Estimator</h4>
                    <p className="text-gray-600 text-sm">Crew size optimization and timeline projections based on square footage, system type, and site conditions.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plus These Essential Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">System Specifications</h4>
                <p className="text-gray-700 text-sm">Pre-loaded manufacturer specs for major SBS brands. Choose from 2-ply, 3-ply, or hybrid systems with proper component selection.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Warranty Compliance</h4>
                <p className="text-gray-700 text-sm">Built-in checklists ensure your material quantities and installation methods meet manufacturer warranty requirements.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Professional Proposal Format</h4>
                <p className="text-gray-700 text-sm">Auto-generated scope of work with system details, material specifications, and line-item pricing ready for client presentation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Coverage Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Understanding SBS Modified Bitumen Systems
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This template covers all major SBS roofing configurations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Torch-Applied Systems</h3>
              <p className="text-gray-700 mb-4">
                The template includes complete calculations for heat-welded modified bitumen installations:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>2-ply systems: Base sheet + granulated cap sheet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>3-ply systems: Ply sheet + base + cap configurations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Hybrid systems combining mechanically-attached and torched layers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Torch equipment and safety considerations in labor rates</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-8 border border-teal-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Self-Adhered Systems</h3>
              <p className="text-gray-700 mb-4">
                Comprehensive support for cold-applied peel-and-stick SBS installations:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Self-adhering base sheets and cap sheets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Cold adhesive applications for full adherence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Low-temperature and all-weather installation options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>Ideal for occupied buildings and fire-restricted areas</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gray-900 text-white rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4">Typical SBS Applications</h3>
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div>
                <div className="text-3xl mb-2">🏢</div>
                <h4 className="font-semibold mb-1">Office Buildings</h4>
                <p className="text-gray-300">Low-slope commercial roofs with reliable long-term performance</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏭</div>
                <h4 className="font-semibold mb-1">Industrial Facilities</h4>
                <p className="text-gray-300">Warehouses and manufacturing plants requiring durable membranes</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏬</div>
                <h4 className="font-semibold mb-1">Retail Centers</h4>
                <p className="text-gray-300">Strip malls and shopping centers with flat or low-pitch roofs</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🏫</div>
                <h4 className="font-semibold mb-1">Schools & Institutions</h4>
                <p className="text-gray-300">Education and government buildings needing warranty-backed systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Format</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  Excel .xlsx format with protected formulas and easy-to-customize pricing fields
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Sheets for cloud access and team collaboration across offices
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="font-bold text-gray-900 mb-2">Mobile Friendly</h3>
                <p className="text-gray-600 text-sm">
                  Access on tablet or phone for on-site estimating and quick measurements
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is This Template For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 shadow-md border border-emerald-100">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Roofers</h3>
              <p className="text-gray-600 text-sm">
                Specializing in flat roof systems and need accurate SBS material calculations for property managers and GCs
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-6 shadow-md border border-teal-100">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New to Modified Bitumen</h3>
              <p className="text-gray-600 text-sm">
                Expanding into SBS work and need proven formulas for lap allowances, primer coverage, and system specifications
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 shadow-md border border-emerald-100">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Roofing Estimators</h3>
              <p className="text-gray-600 text-sm">
                Professional estimators needing standardized templates for consistent commercial flat roof bidding
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-6 shadow-md border border-teal-100">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Companies</h3>
              <p className="text-gray-600 text-sm">
                Scaling your commercial division and need repeatable estimating processes for SBS projects
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Use the Template
            </h2>
            <p className="text-xl text-gray-600">
              Start estimating SBS projects in minutes
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download & Configure Your Pricing</h3>
                <p className="text-gray-600">
                  After purchase, download the Excel template. Input your local material costs for SBS rolls, primers, insulation, and flashings. Enter your labor rates for torch crews or self-adhered installation teams.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select System Configuration</h3>
                <p className="text-gray-600">
                  Choose your SBS system type (2-ply, 3-ply, hybrid), application method (torch or self-adhered), and insulation requirements. The template adjusts all calculations based on your selections.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Roof Measurements</h3>
                <p className="text-gray-600">
                  Input total roof area, perimeter dimensions, parapet heights, number of penetrations, and drainage details. The template automatically calculates material rolls with proper overlap allowances.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Present Estimate</h3>
                <p className="text-gray-600">
                  The template generates complete material quantities, labor hours, and project costs. Review the professional summary sheet with system specifications and present to your client or submit your bid.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What You'll Get Using This Template
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond just calculations - understand SBS estimating best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Material Estimating Insights</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>How to calculate proper lap allowances for side laps (3") and end laps (6") in SBS installations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Standard roll coverage (1 square) vs. actual coverage after laps and waste</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Primer application rates for different substrate types (concrete vs. existing membrane)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>When to specify cover board over insulation for torch applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Flashing material selection for parapets, penetrations, and edge conditions</span>
                </li>
              </ul>
            </div>

            <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Labor & Production Knowledge</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>Realistic production rates for torch crews (15-25 squares/day for experienced teams)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>Labor differences between torch-applied and self-adhered installations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>How complexity factors (parapets, penetrations, drains) affect labor hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>Substrate preparation time for tear-off, deck repairs, and primer application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>Proper crew sizing and project duration for different roof sizes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Does this work for both torch-applied and self-adhered SBS?
              </h3>
              <p className="text-gray-600">
                Yes! The template includes separate calculation sections for torch-applied (heat-welded) and self-adhered (peel-and-stick) SBS systems. You can switch between methods with a simple dropdown selector.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I use this for 2-ply and 3-ply systems?
              </h3>
              <p className="text-gray-600">
                Absolutely. The template supports 2-ply (base + cap), 3-ply (ply sheet + base + cap), and hybrid configurations. Material calculations automatically adjust based on the system you select.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Are manufacturer-specific products included?
              </h3>
              <p className="text-gray-600">
                The template includes standard specifications that work with major SBS manufacturers (GAF, Soprema, Johns Manville, Siplast, etc.). You can customize material names and specifications to match your preferred brands.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                What about insulation and cover board calculations?
              </h3>
              <p className="text-gray-600">
                Yes, the template includes rigid insulation calculators with R-value options, tapered insulation layouts for drainage, and cover board (DensDeck, gypsum, etc.) requirements for torch applications.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Do I need special software to use this?
              </h3>
              <p className="text-gray-600">
                No. The template is a standard Excel file that works with Microsoft Excel (Windows/Mac), Google Sheets (free), or any spreadsheet software that supports .xlsx files.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Will this work for re-cover applications over existing SBS?
              </h3>
              <p className="text-gray-600">
                Yes. The template includes options for re-cover scenarios where you're installing new SBS over existing modified bitumen. It accounts for primer requirements and proper attachment methods for re-covers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Commercial Roofers Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Finally a template that understands SBS lap allowances. My material orders are now spot-on instead of running short or over-ordering by 15%. Worth every penny."
              </p>
              <p className="font-semibold text-gray-900">Carlos Mendoza</p>
              <p className="text-sm text-gray-500">Commercial Estimator, Apex Roofing</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "We do both torch and self-adhered work. Having one template that handles both methods with accurate labor rates has standardized our estimating across all our commercial jobs."
              </p>
              <p className="font-semibold text-gray-900">Jennifer Kowalski</p>
              <p className="text-sm text-gray-500">Owner, Flat Roof Solutions</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The flashing details and primer calculations were game-changers. I used to wing those numbers. Now every estimate includes proper quantities for all the detail work."
              </p>
              <p className="font-semibold text-gray-900">David Patterson</p>
              <p className="text-sm text-gray-500">Project Manager, Commercial Roof Systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              Use the template on your next commercial SBS projects. If it doesn't improve your estimating accuracy and save you time, we'll refund your purchase - no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Commercial Estimating Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get all roofing templates in one bundle and save $200
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-yellow-400">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE - SAVE $200
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All 5 roofing templates including SBS, TPO, metal, shingles, and BUR systems
              </p>
              <div className="text-2xl font-bold text-yellow-600 mb-4">$129</div>
              <div className="text-yellow-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/tpo-template" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC/EPDM Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Single-ply membrane estimating for commercial flat roofs
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$39</div>
              <div className="text-emerald-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/bur-template" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="text-4xl mb-3">🏭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">BUR Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Built-up roofing system estimating for tar and gravel installations
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$39</div>
              <div className="text-emerald-600 font-semibold">View Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Master SBS Modified Bitumen Estimating?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join commercial roofers using our proven SBS template for accurate material calculations
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-emerald-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="sbsTemplate"
              text="Buy SBS Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-emerald-200">
              30-Day Money-Back Guarantee • Instant Download
            </p>
          </div>

          <p className="text-sm text-emerald-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
