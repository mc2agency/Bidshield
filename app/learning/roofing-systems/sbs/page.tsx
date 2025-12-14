'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ModifiedBitumenPage() {
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
            Modified Bitumen Roofing (SBS)
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for SBS modified bitumen systems - from torch-applied to self-adhered multi-ply roofs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#intro" className="block text-sm text-gray-600 hover:text-blue-600">System Overview</a>
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">Application Methods</a>
                <a href="#materials" className="block text-sm text-gray-600 hover:text-blue-600">Key Materials</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Process</a>
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-blue-600">Material Takeoff</a>
                <a href="#labor" className="block text-sm text-gray-600 hover:text-blue-600">Labor Estimation</a>
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
                  Modified bitumen roofing combines the proven waterproofing properties of asphalt with modern polymer modifiers (SBS - Styrene-Butadiene-Styrene) to create a durable, flexible roofing membrane. These multi-ply systems are popular for small commercial buildings, additions, and retrofit applications.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Unlike single-ply membranes that come in large sheets, modified bitumen is installed in overlapping layers - typically a base sheet followed by one or more cap sheets. The redundancy of multiple layers provides excellent waterproofing and longevity.
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
                        <strong>Safety Note:</strong> Torch-applied systems involve open flame and require proper safety training, hot work permits, and fire watch procedures. Always check local code requirements and insurance restrictions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">15-20 years</div>
                    <div className="text-sm text-gray-600">Typical Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$4-$8/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">0-3:12</div>
                    <div className="text-sm text-gray-600">Typical Pitch Range</div>
                  </div>
                </div>
              </section>

              {/* Application Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Methods</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6 border-l-4 border-l-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Torch-Applied (Heat Welding)</h3>
                    <p className="text-gray-700 mb-4">
                      The most common application method. Propane torch melts the bottom surface of the membrane, bonding it to the substrate or previous layer as it is rolled out.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Strongest bond to substrate</li>
                          <li>• Immediate seal - no waiting for adhesive</li>
                          <li>• Works in cold weather</li>
                          <li>• Visual confirmation of proper heating</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <strong className="text-red-900">Disadvantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          <li>• Fire hazard - hot work permits required</li>
                          <li>• Cannot use on wood decks (most codes)</li>
                          <li>• Weather dependent (wind, rain)</li>
                          <li>• Requires skilled, certified crews</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <strong className="text-gray-900">Labor Rate:</strong> 2.5-3.5 hours per square
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Self-Adhered (Peel & Stick)</h3>
                    <p className="text-gray-700 mb-4">
                      Membrane with factory-applied adhesive backing protected by release paper. No heat required - simply peel and press into place.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• No fire risk - safer for occupied buildings</li>
                          <li>• Can use on wood decks</li>
                          <li>• Cleaner installation</li>
                          <li>• Less specialized labor required</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <strong className="text-red-900">Disadvantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          <li>• Higher material cost</li>
                          <li>• Temperature sensitive (50°F+ required)</li>
                          <li>• Substrate must be perfectly clean/dry</li>
                          <li>• Difficult to reposition</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <strong className="text-gray-900">Labor Rate:</strong> 2.0-3.0 hours per square
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Cold-Applied Adhesive</h3>
                    <p className="text-gray-700 mb-4">
                      Trowel or roll liquid adhesive onto substrate, then roll membrane into wet adhesive. Eliminates torch but requires proper cure time.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <strong className="text-blue-900">Best For:</strong>
                      <p className="mt-2 text-sm text-blue-800">
                        Occupied buildings where hot work is prohibited, wood decks, or buildings with extensive combustible materials nearby.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-4 text-sm mt-4">
                      <strong className="text-gray-900">Cost Impact:</strong> Adhesive adds $0.30-0.50/SF material cost
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Materials */}
              <section id="materials" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Materials & Components</h2>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Base Sheet</h4>
                    <p className="text-gray-700 mb-3">
                      First layer applied to roof deck. Provides foundation for cap sheet and redundant waterproofing.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Types:</strong>
                          <p className="text-gray-600">Smooth or granulated surface, fiberglass mat</p>
                        </div>
                        <div>
                          <strong>Roll Size:</strong>
                          <p className="text-gray-600">36 inch wide × 65 ft (1.5 squares per roll)</p>
                        </div>
                        <div>
                          <strong>Material Cost:</strong>
                          <p className="text-gray-600">$30-50 per square</p>
                        </div>
                        <div>
                          <strong>Coverage:</strong>
                          <p className="text-gray-600">1:1 with 3-6 inch side laps</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Cap Sheet (Finish Layer)</h4>
                    <p className="text-gray-700 mb-3">
                      Final layer with weather-resistant granulated surface. Available in various colors for aesthetics and solar reflectance.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Surface Options:</strong>
                          <p className="text-gray-600">Granulated (most common), mineral surface, reflective coating</p>
                        </div>
                        <div>
                          <strong>Roll Size:</strong>
                          <p className="text-gray-600">36 inch wide × 33.5 ft (1 square per roll)</p>
                        </div>
                        <div>
                          <strong>Material Cost:</strong>
                          <p className="text-gray-600">$50-90 per square</p>
                        </div>
                        <div>
                          <strong>Colors:</strong>
                          <p className="text-gray-600">White (reflective), tan, grey, black</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Primer/Adhesive</h4>
                    <p className="text-gray-700 mb-3">
                      Surface preparation for smooth substrates or cold-applied systems.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Asphalt Primer:</strong> $0.15-0.25/SF (concrete, existing EPDM)</div>
                        <div><strong>Cold Adhesive:</strong> $0.30-0.50/SF (solvent or water-based)</div>
                        <div><strong>Coverage:</strong> 100-200 SF per gallon (primer), 60-100 SF per gallon (adhesive)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Flashing Materials</h4>
                    <p className="text-gray-700 mb-3">
                      Modified bitumen or metal flashing for walls, penetrations, and terminations.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>MB Flashing Rolls:</strong> 9-24 inch wide rolls for walls and curbs</div>
                        <div><strong>Metal Termination Bar:</strong> $3-6 per linear foot</div>
                        <div><strong>Counter Flashing:</strong> $5-10 per linear foot installed</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Insulation (Optional but Common)</h4>
                    <p className="text-gray-700 mb-3">
                      Rigid insulation boards installed before base sheet for energy efficiency.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Polyiso:</strong> Most common, R-6 per inch, $1.50-2.50/SF</div>
                        <div><strong>Attachment:</strong> Mechanically fastened or adhered with hot asphalt</div>
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
                    <h3 className="font-bold text-gray-900 mb-2">System Configuration</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Two-ply systems (base + cap) are standard. Three-ply systems add a ply sheet between base and cap for enhanced performance.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>2-ply: Base + Cap (standard)</div>
                        <div>3-ply: Base + Ply + Cap (premium)</div>
                        <div>Single-ply: Cap only (recovers)</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Application Method</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Torch-applied is most common but local codes may restrict. Always verify fire department and insurance requirements.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Check: Hot work permits</div>
                        <div>Check: Deck type compatibility</div>
                        <div>Check: Insurance restrictions</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Existing Roof Condition</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Modified bitumen can often be installed over existing smooth-surfaced roofs with proper preparation.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Over smooth BUR: Primer + install</div>
                        <div>Over EPDM: Primer + install</div>
                        <div>Over gravel: Must remove/clean</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Project Size</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Modified bitumen is economical for smaller roofs (under 10,000 SF). Large roofs often favor single-ply for speed.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Under 5,000 SF: Very competitive</div>
                        <div>5,000-15,000 SF: Good option</div>
                        <div>Over 15,000 SF: Consider single-ply</div>
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
                            Measure total roof area in squares (100 SF each). Low-slope roofs use actual area.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 5,000 sq ft roof = 50 squares
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Base Sheet</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Base sheet has 3-6 inch side laps and 6 inch end laps. Add 8-10% for laps.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            50 squares × 1.10 = 55 squares ÷ 1.5 sq/roll = 37 rolls
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Cap Sheet</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Cap sheet also requires laps. Typically 6 inch side laps, 6 inch end laps.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            50 squares × 1.10 = 55 squares = 55 rolls (1 sq per roll)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure Wall Flashing</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate linear feet of walls/curbs and multiply by height (typically 8-12 inches).
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Perimeter walls: 300 LF × 8 in high</div>
                            <div>Flashing needed: 300 LF (9 in wide rolls)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Primer/Adhesive Quantities</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            If using primer or cold adhesive, calculate gallons based on coverage rate.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Primer: 5,000 SF ÷ 150 SF/gal = 34 gallons</div>
                            <div>Cold adhesive: 5,000 SF ÷ 80 SF/gal = 63 gallons</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Propane (Torch-Applied)</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Budget propane fuel for torching. Varies by crew and conditions.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Typical: 1-2 propane tanks (100 lb) per square</div>
                            <div>50 squares: 50-100 tanks</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

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
                          <td className="px-4 py-3 text-gray-900">Tearoff existing roof</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.5</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">BUR slower than single-ply</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Insulation install</td>
                          <td className="px-4 py-3 text-gray-700">0.8-1.2</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">If specified</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Base sheet - torch</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.0</td>
                          <td className="px-4 py-3 text-gray-700">3</td>
                          <td className="px-4 py-3 text-gray-600">2 torchers + 1 helper</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Cap sheet - torch</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.5</td>
                          <td className="px-4 py-3 text-gray-700">3</td>
                          <td className="px-4 py-3 text-gray-600">Requires more precision</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Self-adhered install</td>
                          <td className="px-4 py-3 text-gray-700">2.0-3.0</td>
                          <td className="px-4 py-3 text-gray-700">3</td>
                          <td className="px-4 py-3 text-gray-600">Per layer</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Flashing details</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">$10-18 per LF installed</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 50 square 2-ply torch-applied system</div>
                    <div className="mt-3">Tearoff: 50 sq × 2.0 hrs = 100 hours</div>
                    <div>Base sheet: 50 sq × 1.8 hrs = 90 hours</div>
                    <div>Cap sheet: 50 sq × 2.0 hrs = 100 hours</div>
                    <div>Wall flashing: 300 LF × 0.3 hrs = 90 hours</div>
                    <div>Details/cleanup: 20 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 400 hours ÷ 3 crew = 133 crew-hours (3-4 weeks)
                    </div>
                    <div className="mt-3">
                      Labor cost at $55/hr: 400 × $55 = $22,000
                    </div>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Two-ply systems (base + cap) are the standard configuration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Torch-applied is fastest but requires permits and certified crews</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Self-adhered eliminates fire risk but costs more in materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Most economical for small to medium roofs (under 15,000 SF)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Add 10% waste factor for laps and overlaps</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Modified Bitumen Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel template with 2-ply and 3-ply system calculators, torch vs. self-adhered cost comparison, lap calculations, primer/adhesive estimators, and complete labor breakdowns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/modified-bitumen-template"
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
