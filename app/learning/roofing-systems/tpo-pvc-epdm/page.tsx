'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SinglePlyPage() {
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
            Single-Ply Membrane Roofing
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for TPO, PVC, and EPDM - the dominant systems for commercial flat roofs.
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
                <a href="#membrane-types" className="block text-sm text-gray-600 hover:text-blue-600">Membrane Types</a>
                <a href="#attachment" className="block text-sm text-gray-600 hover:text-blue-600">Attachment Methods</a>
                <a href="#components" className="block text-sm text-gray-600 hover:text-blue-600">System Components</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Process</a>
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-blue-600">Material Takeoff</a>
                <a href="#labor" className="block text-sm text-gray-600 hover:text-blue-600">Labor Estimation</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learning/measurement" className="text-sm text-blue-600 hover:text-blue-700">
                      → Roof Measurement
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
                  Single-ply membrane roofing systems dominate the commercial flat roof market, accounting for over 60% of new installations. These systems consist of factory-manufactured sheets of waterproof material that are mechanically attached, adhered, or ballasted to create a seamless protective layer.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Understanding the differences between TPO, PVC, and EPDM - plus the various attachment methods and their cost implications - is critical for competitive and profitable commercial roofing estimates.
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
                        <strong>Pro Tip:</strong> Single-ply systems are often specified by the architect/engineer. Always verify the specified membrane type, thickness, and attachment method in Division 07 specifications before estimating.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">20-30 years</div>
                    <div className="text-sm text-gray-600">Typical Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$5-$10/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">0-2:12</div>
                    <div className="text-sm text-gray-600">Typical Pitch Range</div>
                  </div>
                </div>
              </section>

              {/* Membrane Types */}
              <section id="membrane-types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Membrane Types</h2>

                <button
                  onClick={() => toggleSection('membrane-types')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'membrane-types' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'membrane-types' || activeSection === null) && (
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6 border-l-4 border-l-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">TPO (Thermoplastic Polyolefin)</h3>
                      <p className="text-gray-700 mb-4">
                        The most popular single-ply membrane today, TPO combines the benefits of EPDM and PVC at a lower cost. White reflective surface reduces cooling costs and qualifies for Energy Star and cool roof programs.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Common Thicknesses:</strong>
                          <p className="text-gray-600">45 mil, 60 mil, 80 mil (60 mil most common)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Roll Sizes:</strong>
                          <p className="text-gray-600">10 ft, 12 ft wide × 50-100 ft long</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$0.60-1.20/SF (45-80 mil)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Seaming:</strong>
                          <p className="text-gray-600">Hot-air welding (heat gun)</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Lower cost than PVC</li>
                          <li>• Energy efficient (white reflective)</li>
                          <li>• Heat-welded seams (strongest)</li>
                          <li>• Good puncture resistance</li>
                          <li>• Wide acceptance and availability</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">PVC (Polyvinyl Chloride)</h3>
                      <p className="text-gray-700 mb-4">
                        Premium single-ply membrane with excellent chemical resistance and fire performance. Preferred for restaurants, chemical facilities, and buildings requiring superior fire ratings.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Common Thicknesses:</strong>
                          <p className="text-gray-600">45 mil, 50 mil, 60 mil, 80 mil</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Roll Sizes:</strong>
                          <p className="text-gray-600">10 ft, 12 ft wide × 50-100 ft long</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$0.80-1.60/SF (higher than TPO)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Seaming:</strong>
                          <p className="text-gray-600">Hot-air or chemical welding</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <strong className="text-blue-900">Best For:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-blue-800">
                          <li>• Buildings with grease/chemical exposure</li>
                          <li>• High fire-rating requirements</li>
                          <li>• Long-term performance critical</li>
                          <li>• Premium warranty requirements</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">EPDM (Ethylene Propylene Diene Monomer)</h3>
                      <p className="text-gray-700 mb-4">
                        The original single-ply membrane, EPDM (rubber roofing) has been used since the 1960s. Black membrane absorbs heat but remains popular for its proven durability and lower cost.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Common Thicknesses:</strong>
                          <p className="text-gray-600">45 mil, 60 mil (60 mil standard)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Roll Sizes:</strong>
                          <p className="text-gray-600">10 ft, 20 ft, 25 ft wide × 50-100 ft</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$0.50-0.90/SF (lowest cost)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Seaming:</strong>
                          <p className="text-gray-600">Tape or liquid adhesive</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <strong className="text-yellow-900">Considerations:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                          <li>• Black color absorbs heat (higher cooling costs)</li>
                          <li>• Tape seams less reliable than welded</li>
                          <li>• Proven 30+ year track record</li>
                          <li>• Lowest material cost</li>
                          <li>• White EPDM available but less common</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Attachment Methods */}
              <section id="attachment" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Attachment Methods</h2>
                <p className="text-gray-700 mb-6">
                  The attachment method dramatically impacts material costs, labor hours, and warranty terms. Specifications will typically dictate the required method.
                </p>

                <div className="space-y-6">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Fully Adhered</h4>
                    <p className="text-gray-700 mb-3">
                      Membrane bonded to substrate with adhesive or self-adhered backing. Highest wind uplift resistance and warranty coverage.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Adhesive Types:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• Solvent-based (fast cure, strong)</li>
                          <li>• Water-based (low VOC, slower cure)</li>
                          <li>• Two-part urethane (premium)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Cost Impact:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• Adhesive: $0.30-0.60/SF</li>
                          <li>• Labor: 2.5-3.5 hours/square</li>
                          <li>• Most expensive method</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <strong className="text-green-900">Best For:</strong> High wind zones, warranty requirements, smooth substrates (concrete, existing EPDM)
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Mechanically Attached</h4>
                    <p className="text-gray-700 mb-3">
                      Membrane fastened to deck with screws and plates at seams or throughout the field. Most common method for new construction.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Fastener Patterns:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• Seam only (12 inch on-center)</li>
                          <li>• 6-inch pattern (high wind)</li>
                          <li>• 4-inch pattern (hurricane zones)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Cost Impact:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• Fasteners/plates: $0.15-0.40/SF</li>
                          <li>• Labor: 2.0-3.0 hours/square</li>
                          <li>• Mid-range cost</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <strong className="text-green-900">Best For:</strong> Steel or wood decks, new construction, cost-conscious projects
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Ballasted</h4>
                    <p className="text-gray-700 mb-3">
                      Membrane laid loose and held down with river rock, pavers, or concrete blocks. Requires structural capacity for ballast weight (10-15 psf).
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Ballast Options:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• River rock (1.5-2 inch, 10-12 psf)</li>
                          <li>• Concrete pavers (easier to maintain)</li>
                          <li>• Protection mat required under ballast</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <strong className="text-gray-900">Cost Impact:</strong>
                        <ul className="mt-2 space-y-1 text-gray-600">
                          <li>• Ballast: $0.40-0.80/SF delivered</li>
                          <li>• Labor: 1.5-2.5 hours/square</li>
                          <li>• Crane/material handling costs</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                      <strong className="text-yellow-900">Limitations:</strong> Requires structural capacity, not for high wind zones, difficult roof access for maintenance
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Hybrid Systems</h4>
                    <p className="text-gray-700 mb-3">
                      Combination of methods - such as adhered at perimeter/penetrations with mechanically attached field, or ballasted field with adhered perimeter.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <p className="text-gray-600">
                        <strong>Common approach:</strong> Mechanically attach field of roof, fully adhere 10-15 ft perimeter zone for enhanced wind uplift resistance.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Components */}
              <section id="components" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">System Components</h2>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Insulation</h4>
                    <p className="text-gray-700 mb-3">
                      Most single-ply systems include rigid insulation for energy efficiency and to create positive drainage (tapered systems).
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Polyiso (most common):</strong>
                          <p className="text-gray-600">R-6 per inch, $1.50-2.50/SF</p>
                        </div>
                        <div>
                          <strong>XPS (high compression):</strong>
                          <p className="text-gray-600">R-5 per inch, $2.00-3.00/SF</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Cover Board</h4>
                    <p className="text-gray-700 mb-3">
                      Protective layer between insulation and membrane. Required for some warranties and high-traffic areas.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <p className="text-gray-600">
                        <strong>Options:</strong> 1/2 inch DensDeck, 1/4 inch Securock, 1/2 inch fiberboard ($0.60-1.20/SF)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Flashing Materials</h4>
                    <p className="text-gray-700 mb-3">
                      Membrane flashing, metal termination bars, drip edges, and coping caps for transitions and penetrations.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div>• Membrane flashing: Same as field (TPO/PVC/EPDM)</div>
                        <div>• Termination bars: $3-6 per linear foot</div>
                        <div>• Coping cap: $8-15 per linear foot</div>
                        <div>• Pipe boots: $15-30 each</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Drainage Components</h4>
                    <p className="text-gray-700 mb-3">
                      Roof drains, scuppers, overflow drains, and sump pans. Critical for proper water management.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div>• Roof drains: $150-400 each</div>
                        <div>• Scuppers: $100-250 each</div>
                        <div>• Sump pans: $50-150 each</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">HVAC Curbs & Penetrations</h4>
                    <p className="text-gray-700 mb-3">
                      Pre-fabricated or field-built curbs for HVAC units, skylights, and other roof-mounted equipment.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div>• Pre-fab curbs: $200-600 each</div>
                        <div>• Field-built curbs: Labor + materials</div>
                        <div>• Pitch pans: $30-75 each</div>
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
                    <h3 className="font-bold text-gray-900 mb-2">Deck Type Impact</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Steel, concrete, and wood decks require different fastener types, insulation attachment methods, and labor approaches.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div><strong>Steel:</strong> Self-drilling fasteners, faster install</div>
                        <div><strong>Concrete:</strong> Adhesive or induction welding</div>
                        <div><strong>Wood:</strong> Standard screws, verify capacity</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Warranty Requirements</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      NDL (No Dollar Limit) warranties require specific attachment methods, cover board, and manufacturer-approved details.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>10-year: Standard install acceptable</div>
                        <div>15-20 year: Enhanced details required</div>
                        <div>NDL: Strict compliance, inspections</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Roof Complexity</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Penetrations, multiple roof levels, curved parapets, and limited access significantly increase labor hours.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Simple: Open roof, few penetrations</div>
                        <div>Complex: 20+ HVAC units, multi-level</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Access & Staging</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      High-rise buildings, occupied facilities, and limited crane access drive up material handling and labor costs.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Crane access: Budget crane time</div>
                        <div>Hand carry: Add 20-30% labor</div>
                        <div>Occupied building: Night/weekend premium</div>
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
                          <strong className="text-gray-900 block mb-2">Calculate Field Area</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Measure total roof area. Flat roofs use actual area (no pitch multiplier needed).
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 20,000 sq ft roof = 200 squares
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
                            Account for seam overlaps (typically 6-12 inches), cuts around penetrations, and damaged material.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Simple roof: 5-8%</div>
                            <div>Moderate complexity: 8-12%</div>
                            <div>Complex roof: 12-15%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Membrane Rolls</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Determine roll size (typically 10 ft or 12 ft wide × 100 ft long) and calculate coverage.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            12 ft × 100 ft roll = 1,200 SF = 12 squares per roll
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure Linear Flashing</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Perimeter walls, curbs, expansion joints - all require membrane flashing.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Wall flashing: Perimeter length × height</div>
                            <div>Curb flashing: (2 × L) + (2 × W) × H</div>
                            <div>Add 10% for laps and corners</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Count Fasteners (Mechanical Attachment)</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate based on specified fastener pattern and seam spacing.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>12-inch OC at 12 ft seams: 1 per LF</div>
                            <div>6-inch OC pattern: 2 per LF</div>
                            <div>Add plates: 1 per fastener typically</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Insulation & Cover Board</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate layers of insulation (match roof area + 3% waste). Tapered systems require detailed layouts.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Flat insulation: 1:1 coverage + 3%</div>
                            <div>Tapered: Get layout from manufacturer</div>
                            <div>Cover board: Same as membrane area</div>
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

                <p className="text-gray-700 mb-6">
                  Single-ply labor rates vary significantly based on attachment method, roof height, and complexity. Use these baseline rates and adjust for site conditions.
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
                          <td className="px-4 py-3 text-gray-900">Tearoff existing roof</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.5</td>
                          <td className="px-4 py-3 text-gray-700">4-5</td>
                          <td className="px-4 py-3 text-gray-600">Varies by system type</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Insulation install</td>
                          <td className="px-4 py-3 text-gray-700">0.8-1.2</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Mechanical or adhered</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Membrane - Fully Adhered</td>
                          <td className="px-4 py-3 text-gray-700">2.5-3.5</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Most labor intensive</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Membrane - Mechanically Attached</td>
                          <td className="px-4 py-3 text-gray-700">2.0-3.0</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Standard method</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Membrane - Ballasted</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.0</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Plus ballast placement</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Wall/curb flashing</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">$8-15 per LF installed</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">HVAC curb (each)</td>
                          <td className="px-4 py-3 text-gray-700">-</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">2-4 hours per unit</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 200 square TPO roof, mechanically attached, 15 HVAC units</div>
                    <div className="mt-3">Tearoff: 200 sq × 2.0 hrs = 400 hours</div>
                    <div>Insulation: 200 sq × 1.0 hrs = 200 hours</div>
                    <div>TPO membrane: 200 sq × 2.5 hrs = 500 hours</div>
                    <div>Wall flashing: 800 LF × 0.15 hrs = 120 hours</div>
                    <div>HVAC curbs: 15 × 3 hrs = 45 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 1,265 hours ÷ 4 crew = 316 crew-hours (8-10 weeks)
                    </div>
                    <div className="mt-3">
                      Labor cost at $60/hr: 1,265 × $60 = $75,900
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
                    <span className="text-gray-700">TPO is the most common - white, heat-welded, cost-effective</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Attachment method drives cost - fully adhered most expensive, ballasted cheapest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Always verify specifications for membrane type, thickness, and attachment requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Flashing and detail work is where quality matters - dont cut corners on labor hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Insulation and cover board add significant cost but are usually required for warranty</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Single-Ply Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel template with attachment method calculators, fastener pattern worksheets, insulation layouts, flashing takeoff tools, and labor estimators for TPO, PVC, and EPDM systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Fastener pattern calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Membrane roll quantity calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Insulation layer breakdowns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Flashing detail worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Labor by attachment method</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Complete pricing breakdown</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/single-ply-template"
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
