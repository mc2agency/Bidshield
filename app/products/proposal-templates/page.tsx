import Link from 'next/link';

export default function ProposalTemplatesPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                WIN MORE BIDS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Professional Proposal Template Library
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Turn your estimates into winning proposals with professionally written templates for 8 roofing systems. Stand out from competitors and build trust with clients.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$79</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
                >
                  Buy Proposal Templates - $79 →
                </a>
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
                  <span>8 System Templates</span>
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
                    <div className="text-6xl mb-4 text-center">📄</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Library Includes:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>8 System-Specific Proposals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>3 Cover Letter Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Scope of Work Library</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Payment Terms Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Warranty Language</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Exclusions Checklist</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Professional Proposals Matter
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">→</span>
                  <span>First impressions matter. A polished proposal shows you're a professional organization worth trusting with a major project.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">→</span>
                  <span>Clear scope of work reduces misunderstandings and change orders. Everything is documented upfront.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">→</span>
                  <span>Professional warranty language protects both you and your client, building confidence in your work.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">→</span>
                  <span>Well-defined payment terms and exclusions prevent payment disputes and scope creep.</span>
                </p>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  From Basic Quote to Professional Proposal
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Before:</p>
                    <p className="text-sm text-gray-600">One-page quote with a price and signature line</p>
                  </div>
                  <div className="text-center text-2xl text-gray-400">↓</div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-gray-900 mb-1">After:</p>
                    <p className="text-sm text-gray-600">Professional multi-page proposal with detailed scope, timeline, warranty, and terms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              8 Complete Proposal Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each template includes cover letter, scope of work, pricing, timeline, warranty, and terms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Template 1 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏠</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Asphalt Shingle Roofing Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For residential and light commercial shingle replacement projects.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Tear-off and disposal scope language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Material specifications (shingle type, warranty)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Installation timeline by square footage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Manufacturer warranty details</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 2 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏢</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC Single-Ply Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For flat and low-slope commercial membrane roofing systems.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Membrane type and attachment method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Insulation specifications and R-values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Flashing and edge detail descriptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>20-year warranty language</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 3 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚫</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">EPDM Rubber Roofing Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For EPDM rubber membrane roofing installations.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Fully adhered vs mechanically attached options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Seam and penetration detail language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Drain and scupper specifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Maintenance recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 4 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📜</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Modified Bitumen (SBS) Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For torch-down and self-adhering modified systems.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Base sheet and cap sheet specifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Torch-applied vs self-adhering language</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Fire safety and hot work permits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Multi-ply system warranty details</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 5 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔩</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Metal Roofing Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For standing seam and corrugated metal roofing systems.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Panel type, gauge, and finish specifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Trim and flashing color coordination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Underlayment and accessories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Manufacturer paint warranty language</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 6 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏛️</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tile Roofing Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For clay and concrete tile roofing installations.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Tile type, profile, and color specifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Batten and lath system details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Hip and ridge tile installation method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Wind and seismic requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 7 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🌱</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Green Roof System Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For vegetative and garden roof installations.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Multi-layer system breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Waterproofing and root barrier details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Plant selection and installation specifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Maintenance plan and warranty</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template 8 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎨</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Restoration & Coating Proposal</h3>
                  <p className="text-gray-600 mb-3">
                    For roof restoration, coating, and repair projects.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Surface preparation and cleaning scope</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Repair and patch work descriptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Coating type, coverage rates, and mil thickness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Extended warranty language (10-20 years)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Components */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Plus These Essential Components
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📝 3 Cover Letter Templates</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Commercial general contractor format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Residential homeowner format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Property manager/HOA format</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">💰 Payment Terms Templates</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">→</span>
                  <span>Standard payment schedules (deposit, progress, final)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">→</span>
                  <span>AIA billing formats for commercial work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">→</span>
                  <span>Lien waiver language and requirements</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">⚖️ Legal & Warranty Language</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Workmanship warranty templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Material manufacturer warranty pass-through</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Exclusions and limitations checklist</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Exclusions & Assumptions Checklist</h3>
            <p className="text-gray-700 mb-3">
              Pre-written language for common items NOT included in your scope - protects you from scope creep:
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Structural repairs (unless specified)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Hazardous material abatement</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Building code upgrades (unless required)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Interior water damage repairs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Landscaping restoration</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">►</span>
                <span>Permits and fees (specify responsibility)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Formats Provided</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Word</h3>
                <p className="text-gray-600 text-sm">
                  Fully editable .docx files - customize with your company branding, colors, and logo
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Docs Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Docs for cloud-based editing and team collaboration
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
              Who Are These Templates For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Contractors</h3>
              <p className="text-gray-600 text-sm">
                Moving beyond basic quotes and want to present like an established professional company
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Bidders</h3>
              <p className="text-gray-600 text-sm">
                Need professional proposals that meet general contractor and architect expectations
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Busy Estimators</h3>
              <p className="text-gray-600 text-sm">
                Want to create consistent, professional proposals quickly without starting from scratch
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Win-Rate Optimizers</h3>
              <p className="text-gray-600 text-sm">
                Looking to improve bid success rates with more thorough, professional documentation
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
              How to Use the Templates
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customize with Your Branding</h3>
                <p className="text-gray-600">
                  Add your company logo, contact information, and branding colors. Adjust language to match your company voice and local market requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select the Right Template</h3>
                <p className="text-gray-600">
                  Choose the template that matches your project type. Use the cover letter format appropriate for your client (GC, homeowner, or property manager).
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fill in Project-Specific Details</h3>
                <p className="text-gray-600">
                  Enter project name, address, scope details, pricing, and timeline. Customize warranty terms and exclusions based on project requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review and Submit</h3>
                <p className="text-gray-600">
                  Proofread for accuracy, save as PDF for professional presentation, and submit your polished proposal. Track responses and win more bids!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Results from Professional Proposals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Our win rate went from 20% to 35% after switching to professional proposals. Clients tell us we look more established and trustworthy than competitors."
              </p>
              <p className="font-semibold text-gray-900">Jennifer Adams</p>
              <p className="text-sm text-gray-500">Owner, Adams Commercial Roofing</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The exclusions checklist alone has saved me from three scope disputes this year. Everything is clearly documented upfront - no surprises later."
              </p>
              <p className="font-semibold text-gray-900">Marcus Johnson</p>
              <p className="text-sm text-gray-500">Estimator, Superior Roofing</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "I can now create a professional multi-page proposal in 30 minutes instead of spending hours. The templates are comprehensive and look great."
              </p>
              <p className="font-semibold text-gray-900">Rachel Torres</p>
              <p className="text-sm text-gray-500">Project Manager</p>
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
              Use these templates on your next few proposals. If they don't help you win more business or save time, we'll refund your purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Build Complete Proposals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pair these proposal templates with our estimating tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All roofing templates, checklist, AND these proposal templates
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/estimating-checklist" className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Estimating Checklist</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Ensure you capture every cost item before creating your proposal
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$29</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/complete-bundle" className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Tool Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Every template, calculator, and guide in one comprehensive package
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$997</div>
              <div className="text-blue-600 font-semibold">View Bundle →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start Winning More Bids with Professional Proposals
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Stop competing on price alone. Stand out with polished, comprehensive proposals that build trust.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$79</span>
            </div>
            <p className="text-blue-100 mb-6">8 Complete Proposal Templates • Lifetime Access • Free Updates</p>

            <a
              href="#"
              className="inline-block px-12 py-5 bg-white text-blue-900 rounded-lg font-bold hover:bg-blue-50 transition-colors text-xl shadow-2xl"
            >
              Buy Proposal Templates - $79 →
            </a>

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
