'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AsphaltShinglePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resources/roofing-systems" className="inline-flex items-center text-blue-200 hover:text-white mb-4 text-sm">
            ← Back to Roofing Systems
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
            Free Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Asphalt Shingle Roofing
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for the most common residential roofing system in North America - from 3-tab to architectural shingles.
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
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">Shingle Types</a>
                <a href="#materials" className="block text-sm text-gray-600 hover:text-blue-600">Key Materials</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Process</a>
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-blue-600">Material Takeoff</a>
                <a href="#labor" className="block text-sm text-gray-600 hover:text-blue-600">Labor Estimation</a>
                <a href="#common-mistakes" className="block text-sm text-gray-600 hover:text-blue-600">Common Mistakes</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/resources/measurement" className="text-sm text-blue-600 hover:text-blue-700">
                      → Roof Measurement
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/estimating-essentials" className="text-sm text-blue-600 hover:text-blue-700">
                      → Estimating Essentials
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
                  Asphalt shingles account for over 80% of residential roofing in North America. They offer an excellent balance of cost, durability, and ease of installation. As an estimator, understanding the nuances of shingle systems - from material calculations to labor factors - is essential for creating profitable bids.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A typical asphalt shingle roof consists of multiple layers working together: the roof deck (typically plywood or OSB), underlayment for waterproofing, ice and water shield in vulnerable areas, drip edge for water management, shingles for weather protection, and ridge cap for finishing peaks and hips.
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
                        <strong>Pro Tip:</strong> Most shingle roof failures occur at penetrations, valleys, and eaves - not the field shingles. Pay extra attention to detailing these areas in your estimates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">15-30 years</div>
                    <div className="text-sm text-gray-600">Typical Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$3-$6/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">3:12 min</div>
                    <div className="text-sm text-gray-600">Minimum Pitch</div>
                  </div>
                </div>
              </section>

              {/* Shingle Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Shingle Types</h2>

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
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">3-Tab Shingles</h3>
                      <p className="text-gray-700 mb-4">
                        The original and most economical asphalt shingle. Features a flat profile with three distinct tabs. Popular in builder-grade homes and rental properties.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-gray-900 block mb-2">Coverage:</strong>
                          <p className="text-gray-600">3 bundles = 1 square (100 sq ft)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Weight:</strong>
                          <p className="text-gray-600">200-250 lbs per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$70-$100 per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Lifespan:</strong>
                          <p className="text-gray-600">15-20 years</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6 border-l-4 border-l-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Architectural/Dimensional Shingles</h3>
                      <p className="text-gray-700 mb-4">
                        The most popular choice for modern residential roofing. Features a multi-layered, dimensional appearance that mimics wood shakes. Better wind resistance and longer warranties than 3-tab.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-gray-900 block mb-2">Coverage:</strong>
                          <p className="text-gray-600">3 bundles = 1 square (varies by product)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Weight:</strong>
                          <p className="text-gray-600">250-400 lbs per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$90-$200 per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Lifespan:</strong>
                          <p className="text-gray-600">25-30 years (50-year warranties available)</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                        <p className="text-sm text-blue-800">
                          <strong>Most Common:</strong> This is what you will estimate 80% of the time for residential work. Brands include GAF Timberline, CertainTeed Landmark, Owens Corning Duration.
                        </p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Premium/Designer Shingles</h3>
                      <p className="text-gray-700 mb-4">
                        High-end shingles with enhanced aesthetics, including slate replicas, multi-color blends, and oversized profiles. Used on luxury homes and historic restorations.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-gray-900 block mb-2">Coverage:</strong>
                          <p className="text-gray-600">Varies widely (2.5-4 bundles/square)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Weight:</strong>
                          <p className="text-gray-600">350-550 lbs per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$200-$400+ per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Lifespan:</strong>
                          <p className="text-gray-600">30-50 years (lifetime warranties available)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Key Materials */}
              <section id="materials" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Materials & Components</h2>
                <p className="text-gray-700 mb-6">
                  A complete shingle roof system includes multiple components beyond just the shingles themselves. Missing any of these in your estimate can eat into your profit margins.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Underlayment</h4>
                    <p className="text-gray-700 mb-3">
                      Waterproofing layer installed over the roof deck before shingles. Required by code and manufacturer warranties.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Standard Felt (#15 or #30):</strong>
                          <p className="text-gray-600">$15-25 per square</p>
                        </div>
                        <div>
                          <strong>Synthetic (preferred):</strong>
                          <p className="text-gray-600">$30-50 per square</p>
                        </div>
                      </div>
                      <p className="mt-3 text-gray-600">
                        <strong>Coverage:</strong> 1:1 ratio (100 sq ft covers 100 sq ft). Add 10% for laps and waste.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Ice & Water Shield</h4>
                    <p className="text-gray-700 mb-3">
                      Self-adhering waterproof membrane for vulnerable areas. Mandatory in cold climates, recommended everywhere.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Cost:</strong> $60-100 per square (200 sq ft roll)
                      </p>
                      <p className="text-gray-600">
                        <strong>Where to Install:</strong> Eaves (2 tools minimum in cold climates), valleys, skylights, chimneys, step flashings, low-pitch areas
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Drip Edge</h4>
                    <p className="text-gray-700 mb-3">
                      Metal flashing along eaves and rakes to direct water away from fascia boards.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Cost:</strong> $1.50-3.00 per linear foot (installed)
                      </p>
                      <p className="text-gray-600">
                        <strong>Takeoff:</strong> Measure total eave length + rake length. Add 10% for overlaps and cuts.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Starter Strip</h4>
                    <p className="text-gray-700 mb-3">
                      First tool of shingles along eaves and rakes. Provides proper seal and wind resistance.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Cost:</strong> $30-50 per square (105 LF per bundle)
                      </p>
                      <p className="text-gray-600">
                        <strong>Takeoff:</strong> Total eave length + total rake length
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Ridge Cap</h4>
                    <p className="text-gray-700 mb-3">
                      Specialized shingles for finishing ridge lines and hips. Pre-formed caps provide better appearance and seal than cut-up field shingles.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Cost:</strong> $50-75 per square (covers 30-35 LF)
                      </p>
                      <p className="text-gray-600">
                        <strong>Takeoff:</strong> Ridge length + hip length. Divide total LF by 30 to get squares needed.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">6. Valley Material</h4>
                    <p className="text-gray-700 mb-3">
                      Protection for roof valleys where two planes meet. Options include woven valley (no material), closed-cut valley (no material), or open metal valley.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Metal Valley Flashing:</strong> $3-6 per linear foot
                      </p>
                      <p className="text-gray-600">
                        <strong>Note:</strong> Many contractors use woven or closed-cut valleys with ice and water shield only (no additional cost beyond I&W).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">7. Ventilation</h4>
                    <p className="text-gray-700 mb-3">
                      Proper attic ventilation extends shingle life and prevents ice dams. Combination of intake (soffit) and exhaust (ridge vent) required.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Ridge Vent:</strong> $3-5 per linear foot
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong>Roof Vents (static or powered):</strong> $30-150 each installed
                      </p>
                      <p className="text-gray-600">
                        <strong>Rule:</strong> 1 sq ft of ventilation per 150 sq ft of attic floor (1:150 ratio with vapor barrier, 1:300 without)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">8. Fasteners</h4>
                    <p className="text-gray-700 mb-3">
                      Roofing nails or staples (code dependent). Use corrosion-resistant fasteners in coastal areas.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600 mb-2">
                        <strong>Quantity:</strong> 4-6 nails per shingle (320-480 nails per square)
                      </p>
                      <p className="text-gray-600">
                        <strong>Cost:</strong> Usually minor ($5-10 per square), often included in labor pricing
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Estimation Process */}
              <section id="estimation" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimation Considerations</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Roof Pitch Impact</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Steeper roofs require more material (higher pitch multiplier), more labor hours (safety equipment, slower installation), and potentially higher waste factors.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 font-mono text-xs">
                        <div>4/12 pitch: +5% material, normal labor</div>
                        <div>6/12 pitch: +12% material, +15% labor</div>
                        <div>8/12 pitch: +20% material, +30% labor</div>
                        <div>12/12 pitch: +41% material, +50%+ labor</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Roof Complexity</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Simple gable roofs are fastest to install. Multiple valleys, hips, dormers, skylights, and chimneys significantly increase labor time and material waste.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div><strong>Simple:</strong> Gable, 0-1 valleys</div>
                        <div><strong>Moderate:</strong> Hip, 2-4 valleys</div>
                        <div><strong>Complex:</strong> 5+ valleys, dormers</div>
                        <div><strong>Very Complex:</strong> Turrets, multiple levels</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Existing Roof Condition</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Tearoff of existing shingles adds labor and disposal costs. Multiple layers, wet/damaged deck, or old skip sheathing requires extra work.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Tearoff: 1-2 hours per square</div>
                        <div>Disposal: $50-100 per ton</div>
                        <div>Deck repair: $3-8 per sq ft</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Access & Site Conditions</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Multi-story homes, tight lot access, landscaping obstacles, and material staging limitations all affect labor productivity.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Stories: 2-story adds 10-15% labor</div>
                        <div>Tight access: Hand carry adds 20%+</div>
                        <div>Protection: Landscape/deck coverage time</div>
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
                            Measure horizontal footprint, apply pitch multiplier, convert to squares (1 square = 100 sq ft).
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 2,000 sq ft footprint × 1.12 (6/12 pitch) = 2,240 sq ft = 22.4 squares
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Add Waste Factor</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Account for cutting, damaged shingles, and complexity.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Simple roof: 10%</div>
                            <div>Moderate complexity: 15%</div>
                            <div>Complex roof: 20-25%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Shingle Bundles</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Most shingles: 3 bundles = 1 square. Always round up to whole bundles.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            22.4 squares × 1.15 waste = 25.76 squares × 3 bundles = 77.3 → 78 bundles
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure Linear Items</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Eaves, rakes, ridges, hips, valleys - measure each separately.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Drip edge: Total eave + rake length</div>
                            <div>Starter: Total eave + rake length</div>
                            <div>Ridge cap: Ridge + hip length ÷ 30</div>
                            <div>Ice & water: Eaves (2 tools = 6 LF) + valleys</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Count Penetrations</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Chimneys, skylights, vents, pipes - each requires flashing and detail work.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Pipe boots: Count each penetration</div>
                            <div>Chimneys: Measure perimeter for counter flashing</div>
                            <div>Skylights: Measure curb dimensions</div>
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
                        <strong>Critical:</strong> Always verify shingle bundle coverage with the manufacturer. While most are 3 bundles per square, some premium products vary (2.5, 3.3, or 4 bundles per square).
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  Labor costs typically represent 40-60% of total shingle roof cost. Accurate labor estimation requires understanding productivity rates and site-specific factors.
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
                          <td className="px-4 py-3 text-gray-900">Tearoff (1 layer)</td>
                          <td className="px-4 py-3 text-gray-700">1.0-1.5</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Add 50% for 2nd layer</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Underlayment install</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">Synthetic is faster</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Shingle installation (simple)</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Gable roof, low pitch</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Shingle installation (complex)</td>
                          <td className="px-4 py-3 text-gray-700">2.5-3.5</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Hips, valleys, dormers</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Ridge cap install</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5</td>
                          <td className="px-4 py-3 text-gray-700">1-2</td>
                          <td className="px-4 py-3 text-gray-600">Per square of ridge</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Flashing/detail work</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">1-2</td>
                          <td className="px-4 py-3 text-gray-600">Quote per item</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Factors That Speed Up Work:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Experienced crew (4+ years together)</li>
                      <li>• Simple roof geometry</li>
                      <li>• Good weather conditions</li>
                      <li>• Easy material access/staging</li>
                      <li>• Low pitch (4/12 or less)</li>
                      <li>• Pneumatic nail guns</li>
                      <li>• Single-story structure</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-bold text-red-900 mb-3">Factors That Slow Down Work:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Steep pitch (8/12+)</li>
                      <li>• Multiple roof levels</li>
                      <li>• Extensive valleys and hips</li>
                      <li>• Many penetrations</li>
                      <li>• Poor weather/wind</li>
                      <li>• Difficult access</li>
                      <li>• Inexperienced crew members</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 25 square roof, moderate complexity, 6/12 pitch</div>
                    <div className="mt-3">Tearoff: 25 sq × 1.2 hrs = 30 hours</div>
                    <div>Underlayment: 25 sq × 0.4 hrs = 10 hours</div>
                    <div>Shingle install: 25 sq × 2.5 hrs = 62.5 hours</div>
                    <div>Ridge cap: 3 sq × 0.4 hrs = 1.2 hours</div>
                    <div>Details/cleanup: 8 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 111.7 hours ÷ 3 crew = 37 crew-hours (4-5 days)
                    </div>
                    <div className="mt-3">
                      Labor cost at $50/hr: 111.7 × $50 = $5,585
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Estimating Mistakes</h2>

                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">1. Forgetting Pitch Multiplier</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Using horizontal square footage without applying the pitch multiplier results in under-ordering materials by 5-40%.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always multiply horizontal area by pitch multiplier before calculating squares.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">2. Insufficient Waste Factor</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Using 10% waste on complex roofs with valleys, hips, and dormers. You will run short and pay premium prices for extra material.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Use 15-20% waste for moderate complexity, 20-25% for complex roofs.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">3. Not Including Starter Strip</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Forgetting to quote starter strip material. This adds $30-50 per square of eave/rake length.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always measure total eave + rake length and include starter in material list.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">4. Underestimating Tearoff Labor</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Assuming tearoff is quick. Multiple layers, nailed decking, or difficult disposal access significantly increase time.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always inspect existing roof. Budget 1-1.5 hrs per square for single layer, 2-3 hours for double layer.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">5. Missing Ice & Water Shield</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Not including ice and water shield in cold climates or at critical areas. Code requires it in many jurisdictions.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Include 2 tools (6 LF) at all eaves, plus full coverage in valleys and around penetrations.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">6. Ignoring Deck Repair Costs</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Assuming the existing deck is perfect. Older roofs almost always need some sheathing replacement.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Include allowance for 5-10% deck repair or make it a clearly stated exclusion/contingency.
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
                    <span className="text-gray-700">Architectural shingles are the most common - know them inside and out</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Always apply pitch multiplier before calculating material quantities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">A complete estimate includes 8+ material components beyond just shingles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Use 15-20% waste for complex roofs - dont cut corners here</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Labor varies dramatically based on pitch, complexity, and site conditions</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Asphalt Shingle Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel-based template with built-in pitch multipliers, waste calculators, material takeoff worksheets, labor estimators, and pricing formulas. Just plug in your measurements and prices - the template does the math.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Automatic pitch multiplier calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Material quantity worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Labor hour calculator by task</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Waste factor formulas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Complete pricing breakdown</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Example estimates included</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/asphalt-shingle-template"
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
