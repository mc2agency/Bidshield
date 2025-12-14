'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RestorationCoatingPage() {
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
            Restoration & Coating Systems
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for roof restoration coatings - extending roof life through elastomeric, silicone, and acrylic systems.
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
                <a href="#coating-types" className="block text-sm text-gray-600 hover:text-blue-600">Coating Types</a>
                <a href="#substrate" className="block text-sm text-gray-600 hover:text-blue-600">Substrate Compatibility</a>
                <a href="#system-components" className="block text-sm text-gray-600 hover:text-blue-600">System Components</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Considerations</a>
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-blue-600">Material Takeoff</a>
                <a href="#labor" className="block text-sm text-gray-600 hover:text-blue-600">Labor Estimation</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/learning/roofing-systems/spray-foam" className="text-sm text-blue-600 hover:text-blue-700">
                      → Spray Foam Roofing
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
                  Roof restoration coatings offer a cost-effective alternative to complete roof replacement by applying liquid-applied elastomeric membranes over existing roofs. These systems seal leaks, reflect UV radiation, improve energy efficiency, and extend roof life by 10-20+ years at a fraction of replacement cost.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Restoration coating systems can be applied to metal, single-ply, modified bitumen, BUR, spray foam, and concrete roofs. The coating creates a seamless, monolithic membrane that protects the existing roof from weathering and UV damage. As an estimator, understanding substrate compatibility, preparation requirements, and coating selection is essential for accurate pricing and system performance.
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
                        <strong>Pro Tip:</strong> Roof restoration is only viable on structurally sound roofs with minimal defects. Buildings with saturated insulation, failed deck, or extensive damage require replacement, not coating. Always conduct thorough roof assessment before proposing restoration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">10-20+ years</div>
                    <div className="text-sm text-gray-600">Life Extension</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$2-$6/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">40-80%</div>
                    <div className="text-sm text-gray-600">Cost vs. Replacement</div>
                  </div>
                </div>
              </section>

              {/* Coating Types */}
              <section id="coating-types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Coating Types</h2>

                <button
                  onClick={() => toggleSection('coating-types')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'coating-types' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'coating-types' || activeSection === null) && (
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6 border-l-4 border-l-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Silicone Roof Coatings</h3>
                      <p className="text-gray-700 mb-4">
                        Premium restoration coating with exceptional UV resistance, ponding water tolerance, and longest service life. Silicone coatings do not require primer on most substrates and maintain flexibility over decades. Most popular choice for commercial roof restoration.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Service Life:</strong>
                          <p className="text-gray-600">20-30+ years (with periodic top-coating)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Dry Mil Thickness:</strong>
                          <p className="text-gray-600">20-40 mils (2-3 coats typical)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$50-80 per gallon</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Coverage Rate:</strong>
                          <p className="text-gray-600">0.8-1.5 gallons per 100 SF (per coat)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Substrate Compatibility:</strong>
                          <p className="text-gray-600">Metal, SPF, EPDM, mod-bit, BUR, concrete</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Installed Cost:</strong>
                          <p className="text-gray-600">$2.50-4.50/SF (complete system)</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Superior ponding water resistance (can withstand weeks of standing water)</li>
                          <li>• Excellent UV stability - minimal chalking or degradation</li>
                          <li>• No primer required on most substrates (cost/time savings)</li>
                          <li>• Maintains flexibility at temperature extremes (-40°F to +180°F)</li>
                          <li>• Easy to recoat - silicone bonds to silicone</li>
                          <li>• Highest reflectivity retention over time</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Acrylic Roof Coatings</h3>
                      <p className="text-gray-700 mb-4">
                        Traditional restoration coating with good UV resistance and bright white finish. Lower cost than silicone but requires excellent drainage and cannot tolerate ponding water. Popular for metal roof restoration and well-drained low-slope roofs.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Service Life:</strong>
                          <p className="text-gray-600">10-15 years (proper drainage required)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Dry Mil Thickness:</strong>
                          <p className="text-gray-600">20-30 mils (2-3 coats)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$30-55 per gallon</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Coverage Rate:</strong>
                          <p className="text-gray-600">1.0-1.5 gallons per 100 SF (per coat)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Substrate Compatibility:</strong>
                          <p className="text-gray-600">Metal, mod-bit, BUR, concrete (primer required)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Installed Cost:</strong>
                          <p className="text-gray-600">$1.80-3.50/SF (complete system)</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <strong className="text-yellow-900">Limitations:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                          <li>• Cannot withstand ponding water (degrades in standing water)</li>
                          <li>• Requires primer on most substrates (adds cost/time)</li>
                          <li>• Shorter lifespan than silicone</li>
                          <li>• More maintenance intensive</li>
                          <li>• Not suitable for flat roofs with drainage issues</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Polyurethane & Polyurea Coatings</h3>
                      <p className="text-gray-700 mb-4">
                        High-performance coatings with excellent durability, abrasion resistance, and chemical resistance. Often used as base coat under silicone or acrylic top coat. More expensive but provides superior protection in demanding environments.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Service Life:</strong>
                          <p className="text-gray-600">15-25 years</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Dry Mil Thickness:</strong>
                          <p className="text-gray-600">30-50 mils</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$60-100+ per gallon</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Application:</strong>
                          <p className="text-gray-600">Spray, roll, or brush</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Best For:</strong> High-traffic roofs, chemical exposure environments, or as premium base coat in multi-layer systems. Often paired with silicone top coat for maximum performance.
                        </p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Asphalt Emulsion & Aluminum Coatings</h3>
                      <p className="text-gray-700 mb-4">
                        Traditional asphalt-based coatings for BUR and modified bitumen roofs. Lower performance than modern elastomerics but economical for short-term protection. Aluminum pigments provide reflectivity.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Service Life:</strong>
                          <p className="text-gray-600">3-7 years</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$15-35 per gallon</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Installed Cost:</strong>
                          <p className="text-gray-600">$0.80-1.80/SF</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Best For:</strong>
                          <p className="text-gray-600">Temporary protection, budget projects</p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-sm text-red-800">
                          <strong>Not Recommended:</strong> For long-term roof restoration or warranty-backed systems. Modern elastomeric coatings provide far superior performance and lifecycle value.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Substrate Compatibility */}
              <section id="substrate" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Substrate Compatibility</h2>
                <p className="text-gray-700 mb-6">
                  Success of a restoration coating system depends on proper substrate compatibility and preparation. Not all coatings work on all substrates.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Substrate Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Silicone</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Acrylic</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Polyurethane</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Special Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">Metal (all types)</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-gray-600">Clean, remove rust, prime if needed</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">SPF (spray foam)</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-gray-600">No primer needed (silicone)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">EPDM (rubber)</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-yellow-700">Fair</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-gray-600">Clean thoroughly, primer critical</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">TPO/PVC</td>
                        <td className="px-4 py-3 text-yellow-700">Fair</td>
                        <td className="px-4 py-3 text-yellow-700">Fair</td>
                        <td className="px-4 py-3 text-yellow-700">Fair</td>
                        <td className="px-4 py-3 text-gray-600">Difficult adhesion, primer essential</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">Modified Bitumen</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-gray-600">Granule surface ideal for coating</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">BUR (smooth)</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-gray-600">Prime if surface is weathered</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">BUR (gravel)</td>
                        <td className="px-4 py-3 text-red-700">Poor</td>
                        <td className="px-4 py-3 text-red-700">Poor</td>
                        <td className="px-4 py-3 text-red-700">Poor</td>
                        <td className="px-4 py-3 text-gray-600">Remove gravel first (costly)</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">Concrete</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-green-700">Good</td>
                        <td className="px-4 py-3 text-green-700">Excellent</td>
                        <td className="px-4 py-3 text-gray-600">Primer required, crack repair critical</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* System Components */}
              <section id="system-components" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">System Components</h2>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Roof Cleaning & Preparation</h4>
                    <p className="text-gray-700 mb-3">
                      Critical first step. Coating adhesion depends on clean, sound substrate. Dirt, oils, loose material, and biological growth must be removed.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Power Washing:</strong> $0.20-0.50/SF (typical method)</div>
                        <div><strong>Chemical Cleaning:</strong> $0.30-0.70/SF (for heavily soiled roofs)</div>
                        <div><strong>Mold/Algae Treatment:</strong> $0.15-0.40/SF additional</div>
                        <div><strong>Dry Time:</strong> 24-48 hours before coating</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Repairs & Substrate Preparation</h4>
                    <p className="text-gray-700 mb-3">
                      All defects must be repaired before coating. Seams, penetrations, fasteners, and damaged areas require attention.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Seam Repair:</strong> $3-8 per linear foot (caulk or tape)</div>
                        <div><strong>Fastener Replacement:</strong> $1-3 each (metal roofs)</div>
                        <div><strong>Flashing Repair:</strong> $5-15 per linear foot</div>
                        <div><strong>Patch Repairs:</strong> $8-20/SF (fabric-reinforced)</div>
                        <div><strong>Typical Allowance:</strong> 5-15% of roof area needs repair</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Primer (If Required)</h4>
                    <p className="text-gray-700 mb-3">
                      Improves coating adhesion to difficult substrates. Required for acrylic systems and some substrate types.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material Cost:</strong> $20-45 per gallon</div>
                        <div><strong>Coverage:</strong> 150-250 SF per gallon</div>
                        <div><strong>Installed Cost:</strong> $0.30-0.60/SF</div>
                        <div><strong>When Required:</strong> EPDM, TPO, weathered surfaces, concrete</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Base Coat</h4>
                    <p className="text-gray-700 mb-3">
                      First coating layer provides primary waterproofing and builds mil thickness. Applied at higher coverage rate for better penetration.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Application Rate:</strong> 1.0-1.5 gallons per 100 SF</div>
                        <div><strong>Typical Thickness:</strong> 12-20 dry mils</div>
                        <div><strong>Purpose:</strong> Seal substrate, build thickness, bond</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Reinforcing Fabric (Critical Areas)</h4>
                    <p className="text-gray-700 mb-3">
                      Polyester or fiberglass mesh embedded in coating at seams, penetrations, transitions, and stress points. Provides strength and crack-bridging.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material Cost:</strong> $0.40-1.20 per SF</div>
                        <div><strong>Installation:</strong> $0.80-2.00/SF (labor intensive)</div>
                        <div><strong>Typical Coverage:</strong> 10-20% of roof area</div>
                        <div><strong>Locations:</strong> Seams, walls, penetrations, valleys</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">6. Top Coat(s)</h4>
                    <p className="text-gray-700 mb-3">
                      Final layer(s) provide UV protection, color, and achieve target dry film thickness. One or two top coats depending on warranty requirement.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Application Rate:</strong> 0.8-1.2 gallons per 100 SF</div>
                        <div><strong>Typical Thickness:</strong> 10-15 dry mils per coat</div>
                        <div><strong>Total System:</strong> 25-40 dry mils (warranty requirement)</div>
                        <div><strong>Cure Time:</strong> 24-48 hours between coats</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">7. Granules or Surfacing (Optional)</h4>
                    <p className="text-gray-700 mb-3">
                      Embedded granules enhance durability, provide slip resistance, and improve hail resistance. Common in high-traffic areas or hail zones.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Ceramic Granules:</strong> $0.40-0.80/SF</div>
                        <div><strong>Coverage:</strong> 30-60 lbs per square</div>
                        <div><strong>Application:</strong> Broadcast into final wet coat</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Estimation Considerations */}
              <section id="estimation" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimation Considerations</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Roof Assessment Required</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Physical roof inspection is mandatory before bidding coating work. Cannot accurately estimate repairs without seeing condition.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Moisture survey: Nuclear or infrared</div>
                        <div>Test cuts: Verify insulation condition</div>
                        <div>Visual inspection: Document all defects</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Warranty Requirements</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Manufacturer warranties specify minimum dry mil thickness, preparation standards, and application methods. Must follow exactly.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>10-year: 20-25 dry mils typical</div>
                        <div>15-year: 30-35 dry mils</div>
                        <div>20-year: 35-40+ dry mils</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Access & Logistics</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Material handling for coating projects is labor-intensive. Buckets must be carried to roof, requiring significant manpower.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Staging area required on-site</div>
                        <div>Roof access: ladder, stair, hoist</div>
                        <div>Material hoisting time significant</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Weather & Scheduling</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Coating application requires dry conditions and proper temperature. Rain within 24 hours of application can ruin coating.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Substrate temp: 40-120°F</div>
                        <div>No rain: 24-48 hrs</div>
                        <div>Schedule buffer: 20-30% extra time</div>
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
                          <strong className="text-gray-900 block mb-2">Calculate Total Roof Area</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Measure entire roof surface. Coating systems cover all roof area including flashings and details.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 20,000 SF commercial roof + 1,200 SF walls/curbs = 21,200 SF total coating area
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Determine Coating System</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Based on substrate, warranty requirement, and budget. Typical system: base coat + reinforcement + 1-2 top coats.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Selected: Silicone system, 15-year warranty</div>
                            <div>Requirement: 30 dry mils minimum</div>
                            <div>Plan: Base coat (15 mils) + Top coat (15 mils) = 30 mils</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Coating Quantities</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Convert area and target thickness to gallons needed. Account for surface porosity and waste.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            <div>Base coat: 21,200 SF ÷ 80 SF/gal = 265 gallons</div>
                            <div>Top coat: 21,200 SF ÷ 100 SF/gal = 212 gallons</div>
                            <div>Add 8% waste: (265 + 212) × 1.08 = 515 gallons total</div>
                            <div>Cost: 515 gal × $65/gal = $33,475</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Reinforcing Fabric</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Measure all seams, penetrations, walls, and transitions requiring fabric reinforcement.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Perimeter walls: 1,200 SF</div>
                            <div>Seam reinforcement: 800 SF (major seams)</div>
                            <div>Penetration details: 400 SF (40 units × 10 SF avg)</div>
                            <div>Total fabric: 2,400 SF × $0.80 = $1,920</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Repairs & Preparation Materials</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Based on roof inspection findings. Budget allowance if inspection not yet complete.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Seam caulking: 2,000 LF × $4/LF = $8,000</div>
                            <div>Fastener repair: 150 units × $2 = $300</div>
                            <div>Patch material: 500 SF × $12 = $6,000</div>
                            <div>Cleaning: 20,000 SF × $0.30 = $6,000</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Primer (If Required)</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate primer coverage for substrate type. May not be needed for silicone on some substrates.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Substrate: Modified bitumen (no primer needed for silicone)</div>
                            <div>Primer: $0 (silicone bonds direct to mod-bit)</div>
                            <div>If acrylic: 20,000 SF ÷ 200 SF/gal = 100 gal × $35 = $3,500</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">7</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Accessories & Sundries</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Spray equipment, rollers, brushes, tape, drop cloths, safety equipment.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Spray tips/filters: $200</div>
                            <div>Rollers/brushes: $300</div>
                            <div>Masking/protection: $400</div>
                            <div>Misc supplies: $500</div>
                            <div>Total: $1,400</div>
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
                        <strong>Critical:</strong> Coverage rates vary significantly based on substrate porosity, texture, and condition. Porous or aged substrates absorb more coating. Always verify manufacturer coverage rates for specific substrate and add 10-15% waste factor.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  Coating application is labor-intensive. Preparation work (cleaning, repairs) often takes longer than coating application itself. Crew size typically 3-5 workers depending on project size.
                </p>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Baseline Productivity Rates</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Task</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Hours/Square</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Crew</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Roof cleaning/power wash</td>
                          <td className="px-4 py-3 text-gray-700">0.4-0.8</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Heavily soiled roofs take longer</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Repair work (seams/flashings)</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Depends on condition, $5-15/LF</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Primer application</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Spray or roll</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Fabric reinforcement install</td>
                          <td className="px-4 py-3 text-gray-700">2.0-3.5</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">Detail work, labor intensive</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Base coat (spray)</td>
                          <td className="px-4 py-3 text-gray-700">0.8-1.5</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Fastest method</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Base coat (roll/brush)</td>
                          <td className="px-4 py-3 text-gray-700">1.2-2.0</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Better mil build, slower</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Top coat (spray)</td>
                          <td className="px-4 py-3 text-gray-700">0.6-1.2</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">24-48 hr cure before top coat</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Top coat (roll/brush)</td>
                          <td className="px-4 py-3 text-gray-700">1.0-1.8</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Finish quality better</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Detail work & cleanup</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.6</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Final inspection, touch-ups</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 200 square roof, silicone restoration system</div>
                    <div className="mt-3">Cleaning: 200 sq × 0.6 hrs = 120 hours</div>
                    <div>Repairs: 2,000 LF seams × 0.15 hrs = 300 hours</div>
                    <div>Fabric install: 24 sq × 2.5 hrs = 60 hours</div>
                    <div>Base coat: 200 sq × 1.2 hrs = 240 hours</div>
                    <div>Top coat: 200 sq × 1.0 hrs = 200 hours</div>
                    <div>Details/cleanup: 200 sq × 0.4 hrs = 80 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 1,000 hours ÷ 4 crew = 250 crew-hours (6-8 weeks with cure times)
                    </div>
                    <div className="mt-3">
                      Labor cost at $55/hr: 1,000 × $55 = $55,000
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
                    <span className="text-gray-700">Roof restoration extends life 10-20 years at 40-80% cost of replacement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Silicone coatings offer best performance and longest life - premium choice for most applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Roof inspection is mandatory before estimating - cannot price repairs without seeing condition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Preparation work (cleaning, repairs) often equals or exceeds coating application time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Warranty requirements dictate minimum dry mil thickness - must meet or exceed to qualify</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Roof Coating Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel template with coating quantity calculators, mil thickness converters, substrate compatibility charts, repair allowance worksheets, labor estimators by application method, and warranty requirement checklists.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Gallon quantity calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Mil thickness to coverage converter</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Substrate compatibility matrix</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Repair allowance worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Labor by application method</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Warranty requirement checklist</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/coating-restoration-template"
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mb-3"
                >
                  Get the Template →
                </Link>
                <p className="text-sm text-gray-500">Instant download • Works with Excel & Google Sheets • 30-day guarantee</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
