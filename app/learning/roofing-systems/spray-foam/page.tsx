'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SprayFoamRoofingPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/learning/roofing-systems" className="inline-flex items-center text-blue-200 hover:text-white mb-4 text-sm">
            ← Back to Roofing Systems
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
            Free Learning Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Spray Foam Roofing (SPF)
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for spray polyurethane foam roofing systems - seamless, energy-efficient, and renewable commercial roofing.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#intro" className="block text-sm text-gray-600 hover:text-blue-600">System Overview</a>
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">SPF System Types</a>
                <a href="#components" className="block text-sm text-gray-600 hover:text-blue-600">System Components</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Process</a>
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-blue-600">Material Takeoff</a>
                <a href="#labor" className="block text-sm text-gray-600 hover:text-blue-600">Labor Estimation</a>
                <a href="#common-mistakes" className="block text-sm text-gray-600 hover:text-blue-600">Common Mistakes</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learning/roofing-systems/tpo-pvc-epdm" className="text-sm text-blue-600 hover:text-blue-700">
                      → Single-Ply Systems
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses/estimating-fundamentals" className="text-sm text-blue-600 hover:text-blue-700">
                      → Estimating Fundamentals
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">

              {/* Introduction */}
              <section id="intro" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">System Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Spray Polyurethane Foam (SPF) roofing is a unique system where insulation and waterproofing are combined in a single application. Liquid chemicals are sprayed onto the roof, expanding to create a rigid, seamless foam layer. A protective elastomeric coating is then applied to provide UV protection and weatherproofing.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  SPF systems excel at irregular roof shapes, complex penetrations, and re-roofing applications where weight is a concern. They offer exceptional insulation values (R-6 to R-7 per inch) and can be recoated indefinitely, making them a sustainable long-term roofing solution. However, SPF requires specialized equipment, certified applicators, and ideal weather conditions for application.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Weather Critical:</strong> SPF application requires ideal conditions - 40-100°F ambient temperature, low humidity, no wind, dry substrate, and no rain forecast for 24 hours. Weather delays are common and should be factored into scheduling and cost.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">20-30 years</div>
                    <div className="text-sm text-gray-600">Initial System Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$5-$10/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">R-6 to R-7</div>
                    <div className="text-sm text-gray-600">Insulation per Inch</div>
                  </div>
                </div>
              </section>

              {/* SPF System Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">SPF System Types</h2>

                <button
                  onClick={() => toggleSection('types')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'types' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'types' || activeSection === null) && (
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6 border-l-4 border-l-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">High-Density Closed-Cell SPF (Standard)</h3>
                      <p className="text-gray-700 mb-4">
                        The most common roofing foam. Rigid, closed-cell structure provides structural strength, excellent insulation, and vapor impermeability. Density of 2.5-3.0 lbs/cubic ft. This is the industry standard for roofing applications.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Density:</strong>
                          <p className="text-gray-600">2.5-3.0 lbs per cubic foot</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">R-Value:</strong>
                          <p className="text-gray-600">R-6.0 to R-6.5 per inch</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Typical Thickness:</strong>
                          <p className="text-gray-600">1.5 to 3 inches (R-9 to R-20)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Compressive Strength:</strong>
                          <p className="text-gray-600">40-60 psi (walkable roof)</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• High insulation value per inch</li>
                          <li>• Vapor barrier (closed-cell structure)</li>
                          <li>• Adds structural rigidity to deck</li>
                          <li>• Self-flashing at penetrations</li>
                          <li>• Lightweight (adds minimal load)</li>
                          <li>• Seamless application (no seams to fail)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Medium-Density Closed-Cell SPF</h3>
                      <p className="text-gray-700 mb-4">
                        Lower density foam (2.0-2.5 lbs/cubic ft) used for thicker applications where cost savings are important. Slightly lower R-value and compressive strength than high-density.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Density:</strong>
                          <p className="text-gray-600">2.0-2.5 lbs per cubic foot</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">R-Value:</strong>
                          <p className="text-gray-600">R-5.8 to R-6.2 per inch</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Cost Difference:</strong>
                          <p className="text-gray-600">10-20% less than high-density</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Best For:</strong>
                          <p className="text-gray-600">Thick applications (3+ inches)</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Low-Density Open-Cell SPF (Rare for Roofing)</h3>
                      <p className="text-gray-700 mb-4">
                        Soft, spongy foam at 0.5 lbs/cubic ft. Used primarily for wall insulation and soundproofing, not recommended for roofing due to water absorption and low strength. Included here for completeness.
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <strong className="text-red-900">Not Recommended for Roofing:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          <li>• Water permeable (absorbs moisture)</li>
                          <li>• No structural strength</li>
                          <li>• Lower R-value (R-3.5 to R-4 per inch)</li>
                          <li>• Cannot support coating or traffic</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* System Components */}
              <section id="components" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">System Components</h2>
                <p className="text-gray-700 mb-6">
                  An SPF roof system consists of foam insulation plus protective coatings, flashings, and surface preparation. Each component is critical to system performance and longevity.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Spray Polyurethane Foam (SPF)</h4>
                    <p className="text-gray-700 mb-3">
                      Two-component liquid chemicals (isocyanate and polyol) mixed at the spray gun, expanding 20-30 times volume. Applied in multiple passes to achieve target thickness.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material Cost:</strong> $1.80-3.50 per board foot (depends on density and thickness)</div>
                        <div><strong>Board Foot:</strong> 1 sq ft × 1 inch thick (R-6 coverage)</div>
                        <div><strong>2-inch application:</strong> $3.60-7.00/SF foam cost</div>
                        <div><strong>Yield:</strong> Varies by temperature, humidity, substrate (15-25% loss typical)</div>
                      </div>
                      <p className="mt-3 text-blue-700 bg-blue-50 rounded p-2">
                        <strong>Coverage Calculation:</strong> Target R-value ÷ R-6 per inch = inches needed. Example: R-20 roof requires 3.3 inches of foam @ 2.8 lbs/cf density.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Elastomeric Coating (Essential)</h4>
                    <p className="text-gray-700 mb-3">
                      Protective coating applied over foam to provide UV protection, waterproofing, and impact resistance. SPF foam degrades rapidly under UV exposure - coating is mandatory.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Silicone Coating (premium):</strong> $1.20-2.00/SF, 50-70 year lifespan</div>
                        <div><strong>Acrylic Coating (standard):</strong> $0.80-1.40/SF, 10-20 year lifespan</div>
                        <div><strong>Polyurethane Coating:</strong> $1.00-1.60/SF, 15-25 year lifespan</div>
                        <div><strong>Polyurea Coating:</strong> $1.50-2.50/SF, aromatic or aliphatic</div>
                        <div><strong>Application:</strong> 20-40 mils thick (2-3 coats typical)</div>
                      </div>
                      <p className="mt-3 text-yellow-700 bg-yellow-50 rounded p-2">
                        <strong>Note:</strong> Coating selection affects maintenance interval and total lifecycle cost. Silicone coatings last longest but cost more upfront. Acrylic requires recoating every 10-15 years.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Granules or Surfacing (Optional)</h4>
                    <p className="text-gray-700 mb-3">
                      Embedded granules provide impact resistance, improved traction, and enhanced UV protection. Common in high-traffic or hail-prone areas.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Ceramic Granules:</strong> Broadcast into final coat, $0.30-0.60/SF</div>
                        <div><strong>Aluminum Chips:</strong> Reflective, $0.40-0.80/SF</div>
                        <div><strong>Coverage:</strong> 30-50 lbs per square (varies by granule type)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Primer & Surface Preparation</h4>
                    <p className="text-gray-700 mb-3">
                      Existing roof surfaces must be cleaned, primed, and prepared for foam adhesion. Critical for system performance.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Power Washing:</strong> Remove dirt, oils, loose material ($0.20-0.40/SF)</div>
                        <div><strong>Primer:</strong> For smooth or non-porous substrates ($0.30-0.60/SF)</div>
                        <div><strong>Deck Repairs:</strong> Wet insulation removal, deck replacement (variable)</div>
                        <div><strong>Test Cuts:</strong> Required to assess existing roof condition ($200-500)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Flashings & Terminations</h4>
                    <p className="text-gray-700 mb-3">
                      Walls, curbs, and penetrations require special detailing with reinforcing fabric and additional coating.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Reinforcing Fabric:</strong> Polyester or fiberglass mesh at transitions</div>
                        <div><strong>Termination Bars:</strong> Metal bars to secure foam at walls ($4-8/LF)</div>
                        <div><strong>Cant Strips:</strong> Foam or wood at base of walls ($2-5/LF)</div>
                        <div><strong>Detail Coating:</strong> Extra coating at flashings (2-3 additional coats)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">6. Drainage Improvements</h4>
                    <p className="text-gray-700 mb-3">
                      SPF can be tapered to create positive drainage on flat roofs. Eliminates ponding water.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Tapered Application:</strong> Variable thickness to create slope</div>
                        <div><strong>Cost Adder:</strong> $1-3/SF for significant slope creation</div>
                        <div><strong>Benefits:</strong> Eliminates ponding, extends roof life, improves drainage</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Estimation Process */}
              <section id="estimation" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimation Considerations</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Existing Roof Condition</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      SPF can be installed over most existing roof systems if structurally sound and dry. Wet insulation must be removed. Test cuts are essential for accurate assessment.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Test cuts: 6-12 locations ($300-600)</div>
                        <div>Wet insulation removal: $1-3/SF</div>
                        <div>Deck repairs: Variable, 5-20% of area typical</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Target R-Value</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Energy code requirements dictate minimum insulation. Higher R-values increase foam thickness and cost proportionally.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>R-15: 2.5 inches foam ($4.50-8.75/SF)</div>
                        <div>R-20: 3.3 inches foam ($5.94-11.55/SF)</div>
                        <div>R-30: 5.0 inches foam ($9.00-17.50/SF)</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Weather & Scheduling</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      SPF application requires specific weather conditions. Schedule delays are common. Build in buffer time and weather contingency costs.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Ideal: 60-85°F, low humidity, no wind</div>
                        <div>Acceptable: 40-100°F, under 80% humidity</div>
                        <div>No rain for 24 hours before/after</div>
                        <div>Winter work: Budget 20-30% schedule delay</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Coating Selection</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Coating type affects initial cost and long-term maintenance. Silicone costs more but lasts 3-5x longer than acrylic.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Acrylic: Low cost, 10-year recoat</div>
                        <div>Polyurethane: Mid cost, 15-year recoat</div>
                        <div>Silicone: High cost, 30+ year lifespan</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Material Takeoff */}
              <section id="takeoff" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Material Takeoff Details</h2>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Step-by-Step Takeoff Process</h3>

                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Roof Area</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Measure total roof surface area. SPF is typically applied to flat or low-slope roofs, so pitch multipliers are usually minimal.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 15,000 sq ft flat commercial roof
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Determine Target Thickness & R-Value</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Based on energy code requirements or client specification. Convert R-value to foam thickness.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Target: R-20 roof</div>
                            <div>R-20 ÷ R-6 per inch = 3.33 inches average thickness</div>
                            <div>Add thickness for drainage slope if needed (0.5-1 inch)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Foam Quantity in Board Feet</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Board feet = area × thickness in inches. Add 15-25% for overspray, waste, and application inefficiency.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            <div>15,000 SF × 3.33 inches = 49,950 board feet</div>
                            <div>Add 20% waste: 49,950 × 1.20 = 59,940 board feet</div>
                            <div>At $2.50/BF: 59,940 × $2.50 = $149,850 foam cost</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Coating Material</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Elastomeric coating covers entire roof area. Gallons needed depends on application rate (typically 1.5-2 gallons per 100 SF per coat).
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>15,000 SF ÷ 100 = 150 squares</div>
                            <div>Base coat: 150 sq × 1.8 gal = 270 gallons</div>
                            <div>Top coat: 150 sq × 1.5 gal = 225 gallons</div>
                            <div>Total coating: 495 gallons @ $35/gal = $17,325</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure Flashing & Detail Areas</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Walls, curbs, penetrations, and transitions require additional material and labor for proper detailing.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Wall perimeter: 500 LF × 12 inch high = 500 SF detail area</div>
                            <div>HVAC curbs: 20 units × 15 SF each = 300 SF</div>
                            <div>Pipe penetrations: 30 × 2 SF = 60 SF</div>
                            <div>Total detail area: 860 SF (add 50% foam & coating)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Accessories & Preparation Materials</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Primer, termination bars, cant strips, reinforcing fabric, and granules (if specified).
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Primer: 15,000 SF × $0.40 = $6,000</div>
                            <div>Termination bars: 500 LF × $5 = $2,500</div>
                            <div>Cant strips: 500 LF × $3 = $1,500</div>
                            <div>Reinforcing fabric: 860 SF × $0.80 = $688</div>
                            <div>Granules (if used): 15,000 SF × $0.50 = $7,500</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">7</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Deck Repair Allowance</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Based on test cuts and visual inspection. Wet insulation removal and deck replacement are common on re-roof projects.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Assume 10% area needs wet insulation removal</div>
                            <div>1,500 SF × $2.00/SF = $3,000 removal</div>
                            <div>Deck repairs: 200 SF × $8/SF = $1,600</div>
                            <div>Include as allowance or contingency line item</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Critical:</strong> SPF yield varies significantly based on ambient temperature, substrate temperature, humidity, wind, and applicator skill. Industry standard is 15-25% waste/overspray. Conservative estimates use 25% waste factor. Experienced crews in ideal conditions may achieve 15%.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  SPF roofing requires specialized crews with proper equipment and certification. Labor rates are higher than conventional roofing due to equipment costs, chemical handling, and technical expertise. Production rates vary significantly based on roof complexity, access, and weather conditions.
                </p>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Baseline Productivity Rates</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Task</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Hours/Square</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Crew Size</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Roof cleaning/prep</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.6</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Power washing, repairs</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Primer application</td>
                          <td className="px-4 py-3 text-gray-700">0.2-0.4</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">If required</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">SPF application (2-3 inch)</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.5</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">1 sprayer + helpers</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">SPF application (4+ inch)</td>
                          <td className="px-4 py-3 text-gray-700">2.5-4.0</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Thick applications slower</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Detail work (flashings)</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">$15-30 per LF installed</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Coating application (2 coats)</td>
                          <td className="px-4 py-3 text-gray-700">1.0-1.8</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Includes dry time between</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Cleanup & inspection</td>
                          <td className="px-4 py-3 text-gray-700">0.2-0.4</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Final QC</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Factors That Speed Up Work:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Open, unobstructed roof area</li>
                      <li>• Few penetrations or equipment</li>
                      <li>• Good weather (60-85°F, dry, calm)</li>
                      <li>• Experienced SPF crew (3+ years)</li>
                      <li>• Easy equipment access</li>
                      <li>• Clean, sound existing substrate</li>
                      <li>• Simple perimeter (few transitions)</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-bold text-red-900 mb-3">Factors That Slow Down Work:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Multiple roof levels and obstacles</li>
                      <li>• 20+ HVAC units or penetrations</li>
                      <li>• Weather delays (cold, rain, wind)</li>
                      <li>• Thick foam applications (4+ inches)</li>
                      <li>• Extensive deck repairs needed</li>
                      <li>• Difficult access or occupied building</li>
                      <li>• Complex drainage slope creation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 150 square (15,000 SF) flat roof, 3.3 inch SPF (R-20), silicone coating</div>
                    <div className="mt-3">Prep/cleaning: 150 sq × 0.5 hrs = 75 hours</div>
                    <div>Primer: 150 sq × 0.3 hrs = 45 hours</div>
                    <div>SPF application: 150 sq × 2.0 hrs = 300 hours</div>
                    <div>Detail work: 500 LF × 0.5 hrs = 250 hours</div>
                    <div>Coating (2 coats): 150 sq × 1.4 hrs = 210 hours</div>
                    <div>Cleanup/QC: 150 sq × 0.3 hrs = 45 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 925 hours ÷ 3.5 crew = 264 crew-hours (6-8 weeks w/weather)
                    </div>
                    <div className="mt-3">
                      Labor cost at $75/hr: 925 × $75 = $69,375
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                  <h4 className="font-bold text-yellow-900 mb-2">Equipment Costs</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    SPF application requires specialized proportioner equipment costing $40,000-100,000. Crews typically charge equipment rental as separate line item or include in hourly rate.
                  </p>
                  <div className="space-y-1 text-xs text-yellow-800">
                    <div><strong>Equipment Daily Rate:</strong> $400-800 per day</div>
                    <div><strong>Mobilization:</strong> $1,000-2,500 (transport, setup)</div>
                    <div><strong>Include in Estimate:</strong> Equipment time equals project duration + 2 days (setup/cleanup)</div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Estimating Mistakes</h2>

                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">1. Insufficient Waste Factor</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Using 10% waste when actual overspray and application loss is 20-25%. SPF has significant material loss from overspray, wind drift, and application inefficiency. Running out of material mid-job is costly.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always use minimum 20% waste factor. In windy areas, high humidity, or with inexperienced crews, use 25-30% waste. Conservative estimates protect profit margins.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">2. Forgetting Coating Cost</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Bidding only foam cost without elastomeric coating. SPF must be coated - foam degrades under UV in weeks without protection. Coating adds $1-2/SF to total cost.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always include base coat + top coat (2-3 coats minimum). Specify coating type in proposal. Silicone costs more upfront but reduces long-term maintenance.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">3. Not Including Test Cuts</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Assuming existing roof is dry without verification. Wet insulation is common in old roofs and must be removed before SPF application. Discovering wet insulation mid-project leads to change orders and delays.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Include test cut inspection ($300-600) in every SPF re-roof estimate. Budget 5-15% area for wet insulation removal as allowance. Make findings-based scope clear in proposal.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">4. Missing Equipment Costs</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Not including spray equipment rental/amortization in bid. SPF proportioner equipment costs $50,000-100,000 and must be factored into pricing.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Include equipment daily rate for project duration + setup/cleanup days. Typical: $500-800/day. Small jobs: higher per-SF equipment cost. Large jobs: equipment cost diluted across more SF.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">5. Underestimating Weather Delays</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Scheduling SPF projects without weather contingency. SPF requires specific temperature and humidity conditions. Winter projects can have 30-50% downtime due to weather.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Build weather contingency into schedule and cost. Winter: add 20-30% to project duration. Include mobilization/demobilization costs if multiple trips required. Consider seasonal pricing adjustments.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">6. Wrong R-Value Calculation</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Using R-7 per inch when actual closed-cell foam is R-6 to R-6.5. Overestimating R-value means under-specifying foam thickness, failing to meet energy code.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Use conservative R-6 per inch for calculations. Verify actual product R-value with manufacturer. For R-20 roof, specify 3.5 inches minimum, not 2.9 inches. Include code compliance verification in scope.
                    </p>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">SPF provides combined insulation and waterproofing in one seamless application</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Coating is mandatory - foam degrades rapidly under UV without protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Use 20-25% waste factor for foam - overspray and application loss are significant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Weather requirements are strict - build schedule contingency for delays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Specialized equipment and certified crews required - include equipment costs in estimate</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete SPF Roofing Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel-based template with board foot calculators, R-value to thickness converters, coating quantity worksheets, waste factor adjustments, equipment cost tracking, and detailed labor breakdowns for spray foam roofing systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Board foot quantity calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">R-value to thickness converter</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Coating material worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Waste factor adjustment tools</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Equipment cost tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Labor and productivity formulas</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/spray-foam-template"
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mb-3"
                >
                  Get the Template →
                </Link>
                <p className="text-sm text-gray-500">Instant download • Works with Excel & Google Sheets • 30-day guarantee</p>
                <p className="text-sm text-gray-600 mt-4">
                  Or get all 5 roofing templates for <Link href="/products/template-bundle" className="text-blue-600 hover:text-blue-700 font-semibold">$129 (save $66)</Link>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
