import Link from 'next/link';

export default function EstimatingChecklistPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                NEVER MISS A COST ITEM
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Complete Estimating Checklist
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                A comprehensive, step-by-step checklist that ensures you capture every material, labor, and equipment cost on every project. Stop leaving money on the table.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$29</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
                >
                  Buy Checklist - $29 →
                </a>
                <a
                  href="#preview"
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
                    <div className="text-6xl mb-4 text-center">✅</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Never Forget:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Material quantities with waste factors</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Labor burden calculations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                      <span>Equipment and tool costs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>General conditions items</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Permits, inspections, bonds</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Overhead and profit margins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Cost of Missed Items
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Forgetting just one material or labor item can cost you thousands on a project</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Missing general condition items like scaffolding, permits, or dump fees erodes your profit margin</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Inconsistent estimates across your team lead to unpredictable profitability</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Clients lose trust when you discover "missed items" after the contract is signed</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                A Simple Checklist Solves This
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Work through a proven checklist that captures every cost item systematically</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Common "gotcha" items are highlighted so you never miss them again</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Create consistency across your entire estimating team</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Build confidence with complete, thorough estimates every time</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section id="preview" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Included in the Checklist
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive line-item breakdown organized by division
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Division 01 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Division 01 - General Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Permits and plan review fees</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Temporary facilities and utilities</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Project signage and barricades</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Quality control and testing</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Project closeout documentation</span>
                </li>
              </ul>
            </div>

            {/* Division 02 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏗️ Division 02 - Site Work</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Site access and protection</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Debris removal and dumpsters</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Site cleanup and final broom clean</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Parking and staging areas</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Dust and erosion control</span>
                </li>
              </ul>
            </div>

            {/* Division 06 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🪵 Division 06 - Wood & Plastics</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Roof decking and substrate</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Blocking and nailers</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Cant strips and tapered insulation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Fascia and trim boards</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Fasteners and adhesives</span>
                </li>
              </ul>
            </div>

            {/* Division 07 - Roofing */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏠 Division 07 - Roofing & Waterproofing</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Tear-off and disposal (existing roof)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Underlayment and vapor barriers</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Insulation (all layers and types)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Primary roofing membrane or shingles</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Flashing (walls, penetrations, edges)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Drains, scuppers, and drainage accessories</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Edge metal and copings</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Roof accessories (vents, hatches, walkway pads)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Sealants and coatings</span>
                </li>
              </ul>
            </div>

            {/* Labor & Equipment */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">👷 Labor & Equipment</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Base labor hours by trade</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Labor burden (taxes, insurance, benefits)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Supervision and project management</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Equipment rental (lifts, cranes, hoists)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Small tools and consumables</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Fall protection and safety equipment</span>
                </li>
              </ul>
            </div>

            {/* General Conditions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💼 General Conditions & Closeout</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Performance and payment bonds</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Builder's risk insurance</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Warranty and service agreements</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>As-built documentation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Final inspections and certifications</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Operations and maintenance manuals</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Common Missed Items Callout */}
          <div className="mt-12 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span>⚠️</span>
              <span>Common Missed Items - Highlighted in Checklist</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Dump fees and haul-away costs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Scaffolding and fall protection</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Pitch and complexity multipliers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Worker's comp and liability insurance</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Small tools and consumables allowance</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Final cleanup and punch list</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Material delivery and storage fees</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Warranty labor and callbacks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">►</span>
                <span className="text-gray-700">Overhead and profit margins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Formats Provided</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  Interactive checklist with checkboxes and notes sections
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-bold text-gray-900 mb-2">PDF Format</h3>
                <p className="text-gray-600 text-sm">
                  Printable version for field use and offline reference
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Sheets for cloud-based collaboration
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
              Who Is This For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New Estimators</h3>
              <p className="text-gray-600 text-sm">
                Learning the ropes and need a systematic approach to ensure nothing is forgotten
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👔</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Experienced Estimators</h3>
              <p className="text-gray-600 text-sm">
                Want to double-check their work and avoid costly oversights
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Estimating Teams</h3>
              <p className="text-gray-600 text-sm">
                Need consistency across multiple estimators for quality control
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Small Contractors</h3>
              <p className="text-gray-600 text-sm">
                Wearing multiple hats and need a simple system to stay organized
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
              How to Use the Checklist
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download and Customize</h3>
                <p className="text-gray-600">
                  Open the checklist in Excel or Google Sheets. Customize it with items specific to your market or company standards. Remove items that don't apply to your work.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Use for Every Estimate</h3>
                <p className="text-gray-600">
                  As you build your estimate, work through the checklist systematically. Check off each item as you account for it in your pricing. Add notes for items that require special attention.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Final Review</h3>
                <p className="text-gray-600">
                  Before submitting your estimate, review the checklist one final time. Pay special attention to the "commonly missed items" section to ensure comprehensive coverage.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Improve Over Time</h3>
                <p className="text-gray-600">
                  Track items you've missed on past projects and add them to your customized checklist. Build a comprehensive tool that gets better with every project.
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
                "This checklist paid for itself on the first project. I caught $2,800 in items I would have missed. It's now part of my standard process for every estimate."
              </p>
              <p className="font-semibold text-gray-900">James Peterson</p>
              <p className="text-sm text-gray-500">Estimator, Commercial Roofing</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Simple but incredibly effective. I printed it out and keep it at my desk. No more wondering if I forgot something - I just work through the list."
              </p>
              <p className="font-semibold text-gray-900">Maria Gonzalez</p>
              <p className="text-sm text-gray-500">Owner, Gonzalez Roofing LLC</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The 'commonly missed items' section alone is worth the price. I was consistently forgetting about fall protection equipment costs. Not anymore!"
              </p>
              <p className="font-semibold text-gray-900">Robert Kim</p>
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
              If this checklist doesn't help you create more complete estimates, we'll refund your purchase - no questions asked.
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
            </div>
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
              Get the checklist plus templates for faster, more accurate estimates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All 5 roofing system templates, this checklist, and proposal library
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/proposal-templates" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Template Library</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Professional proposal templates for 8 different roofing systems
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$79</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/courses" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Estimating Fundamentals Course</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Complete video training on creating estimates from start to finish
              </p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$497</div>
              <div className="text-blue-600 font-semibold">View Courses →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Never Miss a Cost Item Again
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of contractors creating more complete, accurate estimates with our proven checklist
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$29</span>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <a
              href="#"
              className="inline-block px-12 py-5 bg-white text-blue-900 rounded-lg font-bold hover:bg-blue-50 transition-colors text-xl shadow-2xl"
            >
              Buy Estimating Checklist - $29 →
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
