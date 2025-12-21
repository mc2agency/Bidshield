'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MetalRoofingPage() {
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
            Metal Roofing Systems
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for standing seam, corrugated, and metal panel roofing - from residential to commercial applications.
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
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">Metal Roof Types</a>
                <a href="#materials" className="block text-sm text-gray-600 hover:text-blue-600">Materials & Components</a>
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
                  Metal roofing has evolved from simple agricultural buildings to premium residential and commercial applications. Modern metal roofing systems offer exceptional durability (40-70 years), energy efficiency, and fire resistance. They are increasingly popular for both new construction and re-roofing projects.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As an estimator, understanding the distinctions between standing seam, exposed fastener panels, and specialty metal systems is critical. Material costs, labor rates, and installation complexity vary dramatically between system types. Metal roofing requires specialized crews, precise measurements, and attention to thermal movement details.
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
                        <strong>Pro Tip:</strong> Metal roofing requires expansion/contraction details for thermal movement. Panels can expand/contract up to 1 inch per 100 feet with temperature changes. Missing these details leads to oil-canning, fastener pullout, and warranty issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">40-70 years</div>
                    <div className="text-sm text-gray-600">Typical Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$6-$16/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">3:12 min</div>
                    <div className="text-sm text-gray-600">Typical Minimum Pitch</div>
                  </div>
                </div>
              </section>

              {/* Metal Roof Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Metal Roof Types</h2>

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
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Standing Seam Metal Roofing</h3>
                      <p className="text-gray-700 mb-4">
                        The premium metal roofing system. Vertical panels with concealed fasteners and raised seams create a clean, modern appearance. Clips allow thermal movement while maintaining watertight integrity. Most common for commercial and high-end residential projects.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Panel Widths:</strong>
                          <p className="text-gray-600">12 inch, 16 inch, 18 inch coverage</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Seam Heights:</strong>
                          <p className="text-gray-600">1 inch, 1.5 inch, 2 inch, 3 inch</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Materials:</strong>
                          <p className="text-gray-600">Galvalume, aluminum, copper, zinc</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Gauges:</strong>
                          <p className="text-gray-600">24 ga (residential), 22 ga (commercial)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$2.50-6.00/SF (panel only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Labor Rate:</strong>
                          <p className="text-gray-600">3.0-5.0 hours/square</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Clean appearance - no exposed fasteners</li>
                          <li>• Concealed clips allow thermal movement</li>
                          <li>• Superior wind and weather resistance</li>
                          <li>• Longest lifespan (50-70 years)</li>
                          <li>• Can accommodate solar panel attachments</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Exposed Fastener Metal Panels (R-Panel, PBR)</h3>
                      <p className="text-gray-700 mb-4">
                        Economical metal roofing where panels are screwed directly to purlins or decking. Fasteners with neoprene washers penetrate the panel face. Popular for agricultural, industrial, and budget-conscious projects.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Common Profiles:</strong>
                          <p className="text-gray-600">R-Panel (36 inch), PBR (26 inch), 7.2 panel</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Rib Heights:</strong>
                          <p className="text-gray-600">3/4 inch to 1.25 inch</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Materials:</strong>
                          <p className="text-gray-600">Galvanized, Galvalume, painted steel</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Gauges:</strong>
                          <p className="text-gray-600">26 ga, 29 ga (most common)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$0.80-2.00/SF (panel only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Labor Rate:</strong>
                          <p className="text-gray-600">2.0-3.5 hours/square</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <strong className="text-yellow-900">Considerations:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                          <li>• Fastener maintenance required (washers deteriorate)</li>
                          <li>• Thermal movement can cause fastener loosening</li>
                          <li>• Less aesthetic appeal than standing seam</li>
                          <li>• Lower cost makes it popular for barns, shops, sheds</li>
                          <li>• 30-40 year lifespan typical</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Corrugated Metal Panels</h3>
                      <p className="text-gray-700 mb-4">
                        Classic wavy profile with repeating rounded or angular ribs. Economical and quick to install. Common for agricultural buildings, sheds, and industrial applications.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Panel Widths:</strong>
                          <p className="text-gray-600">26 inch, 36 inch coverage</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Corrugation Pitch:</strong>
                          <p className="text-gray-600">2.67 inch (standard)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$0.75-1.80/SF</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Labor Rate:</strong>
                          <p className="text-gray-600">1.8-3.0 hours/square</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Metal Shingles & Tiles</h3>
                      <p className="text-gray-700 mb-4">
                        Stamped metal panels designed to replicate traditional roofing materials like slate, wood shake, or clay tile. Premium residential product combining metal durability with traditional aesthetics.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Styles:</strong>
                          <p className="text-gray-600">Slate profile, shake profile, tile profile</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Materials:</strong>
                          <p className="text-gray-600">Steel, aluminum, copper, zinc</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$3.00-8.00/SF</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Labor Rate:</strong>
                          <p className="text-gray-600">4.0-6.0 hours/square</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Metal shingles require extensive trim work, custom fabrication, and skilled labor. Labor costs often exceed material costs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Key Materials */}
              <section id="materials" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Materials & Components</h2>
                <p className="text-gray-700 mb-6">
                  A complete metal roof system includes far more than just panels. Underlayment, fasteners, trim, closures, and flashings are critical to performance and waterproofing.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Underlayment</h4>
                    <p className="text-gray-700 mb-3">
                      Required under all metal roofing to prevent condensation damage and provide secondary water barrier. Critical for noise reduction and thermal performance.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Synthetic Underlayment (recommended):</strong>
                          <p className="text-gray-600">$30-50 per square, slip-resistant</p>
                        </div>
                        <div>
                          <strong>High-temp Underlayment:</strong>
                          <p className="text-gray-600">$50-80 per square, dark metal roofs</p>
                        </div>
                      </div>
                      <p className="mt-3 text-gray-600">
                        <strong>Critical:</strong> Dark metal roofs can reach 180°F. Standard felt will deteriorate. Use high-temperature synthetic underlayment rated for 250°F+.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Fasteners & Clips</h4>
                    <p className="text-gray-700 mb-3">
                      Fastener type and quantity vary dramatically between exposed fastener and concealed clip systems.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Standing Seam Clips:</strong> $0.30-0.60 per clip, 1 clip per 2 LF of panel</div>
                        <div><strong>Exposed Fastener Screws:</strong> #12 or #14 with neoprene washer, $0.08-0.15 each</div>
                        <div><strong>Fastener Spacing:</strong> 12 inch OC at seams, 24 inch OC in field (varies by wind zone)</div>
                        <div><strong>Screw Quantity:</strong> 80-120 screws per square (exposed fastener panels)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Trim & Flashing</h4>
                    <p className="text-gray-700 mb-3">
                      Custom-fabricated or pre-formed metal trim pieces for edges, transitions, and penetrations. Often represents 20-30% of material cost.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Eave Trim (Drip Edge):</strong> $2-4 per linear foot</div>
                        <div><strong>Rake Trim:</strong> $2.50-5 per linear foot</div>
                        <div><strong>Ridge Cap:</strong> $4-8 per linear foot</div>
                        <div><strong>Valley Flashing:</strong> $5-10 per linear foot (depends on profile)</div>
                        <div><strong>Wall Flashing:</strong> $4-7 per linear foot</div>
                        <div><strong>Pipe Boots:</strong> $25-60 each (metal or EPDM)</div>
                      </div>
                      <p className="mt-3 text-yellow-700 bg-yellow-50 rounded p-2">
                        <strong>Note:</strong> Trim must match panel material (steel trim on steel panels, aluminum on aluminum). Mixing metals causes galvanic corrosion.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Closure Strips & Foam Fillers</h4>
                    <p className="text-gray-700 mb-3">
                      Profile-matched foam strips seal gaps at eaves and ridges to prevent insect, bird, and weather infiltration.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Eave Closure (solid foam):</strong> $1-2 per linear foot</div>
                        <div><strong>Ridge Closure (vented):</strong> $1.50-3 per linear foot</div>
                        <div><strong>Universal vs Custom:</strong> Custom-cut closures fit better but cost 30-50% more</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Sealants & Butyl Tape</h4>
                    <p className="text-gray-700 mb-3">
                      Critical for watertight seams, end laps, and penetration sealing. Metal roofing lives or dies by proper sealant application.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Butyl Tape:</strong> $8-15 per roll (used at all panel end laps)</div>
                        <div><strong>Metal Roof Sealant:</strong> $6-10 per tube (300-400 LF per tube)</div>
                        <div><strong>Coverage:</strong> Budget 1 tube per 4 squares of roof for trim sealant</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">6. Ventilation Components</h4>
                    <p className="text-gray-700 mb-3">
                      Metal roofs require proper attic ventilation. Ridge vents, gable vents, or continuous soffit intake must be included.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Metal Ridge Vent:</strong> $4-8 per linear foot installed</div>
                        <div><strong>Gable Vents (metal):</strong> $40-100 each</div>
                        <div><strong>Soffit Vents:</strong> $2-4 per linear foot</div>
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
                    <h3 className="font-bold text-gray-900 mb-2">Panel Run Length</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Standing seam panels can be manufactured in continuous lengths up to 40-50 feet. Longer runs reduce seams but increase handling difficulty and waste.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Continuous lengths: No horizontal seams, premium appearance</div>
                        <div>Standard 12-16 ft lengths: Easier handling, more end laps</div>
                        <div>End lap sealant: Required at all horizontal joints</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Roof Pitch Impact</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Steeper roofs require safety equipment, slower installation, and potentially shorter panel lengths for safe handling.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>3/12-5/12: Normal labor rates</div>
                        <div>6/12-8/12: Add 15-25% labor</div>
                        <div>9/12+: Add 30-50% labor, safety equipment</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Deck Type</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Solid decking (plywood/OSB) vs. open framing with purlins dramatically affects installation approach and cost.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Solid deck: Requires underlayment, can use any system</div>
                        <div>Open purlins: Agricultural/commercial, no underlayment, limited systems</div>
                        <div>Strapping over shingles: Add $0.50-1.00/SF for furring</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Complexity & Trim</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Dormers, valleys, multiple roof planes, and skylights significantly increase trim fabrication and labor time.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Simple gable: Minimal trim, straightforward</div>
                        <div>Hip roof: More ridge cap, corner details</div>
                        <div>Complex: Valleys, dormers, turrets add 40-60% labor</div>
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
                          <strong className="text-gray-900 block mb-2">Calculate Roof Area with Pitch Multiplier</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Metal roofing follows roof plane, so pitch multiplier is essential. Measure horizontal footprint and apply multiplier.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 2,400 sq ft footprint × 1.118 (4/12 pitch) = 2,683 sq ft = 26.83 squares
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Panel Quantity</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Determine panel coverage width and calculate number of panels needed. Add waste for cuts and errors.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Standing seam 16 inch coverage: 2,683 SF ÷ 1.33 SF/LF = 2,017 LF of panel</div>
                            <div>Building is 48 ft long: 2,017 LF ÷ 48 ft = 42 panels</div>
                            <div>Add 5-8% waste: 42 × 1.06 = 45 panels</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure All Linear Trim</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Metal roofing requires extensive trim. Measure eaves, rakes, ridges, hips, valleys, walls, and transitions separately.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Eave trim: 96 LF (both sides of building)</div>
                            <div>Rake trim: 120 LF (four gable ends)</div>
                            <div>Ridge cap: 48 LF</div>
                            <div>Valley: 0 LF (simple gable)</div>
                            <div>Wall flashing: 40 LF (chimney)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Clips or Fasteners</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Standing seam uses concealed clips. Exposed fastener panels use screws with washers.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div><strong>Standing Seam:</strong> 45 panels × 24 clips/panel = 1,080 clips</div>
                            <div><strong>Exposed Fastener:</strong> 26.83 squares × 100 screws/sq = 2,683 screws</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Underlayment & Accessories</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Underlayment covers entire roof area. Add closure strips, butyl tape, and sealant.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Underlayment: 26.83 squares × 1.1 waste = 29.5 squares</div>
                            <div>Eave closure: 96 LF</div>
                            <div>Ridge closure (vented): 48 LF</div>
                            <div>Butyl tape: 45 rolls (1 per panel end lap)</div>
                            <div>Sealant tubes: 7 tubes (1 per 4 squares)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Count Penetrations</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Each roof penetration requires a boot, flashing, or custom detail. Count and price individually.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Pipe boots: 4 (plumbing vents)</div>
                            <div>Chimney: 1 (custom flashing)</div>
                            <div>Ridge vents: 48 LF</div>
                            <div>Gable vents: 2</div>
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
                        <strong>Critical:</strong> Metal panels are ordered by coverage width, not actual width. A 16 inch coverage panel might be 18 inches actual width with 2 inches of overlap. Always verify coverage vs. actual dimensions with manufacturer.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  Metal roofing labor rates are heavily influenced by system type, roof complexity, and crew experience. Standing seam requires specialized training and equipment. Budget for setup time on first few projects.
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
                          <td className="px-4 py-3 text-gray-900">Tearoff (if required)</td>
                          <td className="px-4 py-3 text-gray-700">1.0-2.0</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Metal over existing roof common</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Underlayment install</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">Required for warranty</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Standing seam panels</td>
                          <td className="px-4 py-3 text-gray-700">3.0-5.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Includes clip installation</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Exposed fastener panels</td>
                          <td className="px-4 py-3 text-gray-700">2.0-3.5</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Faster than standing seam</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Corrugated panels</td>
                          <td className="px-4 py-3 text-gray-700">1.8-3.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Fastest panel type</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Metal shingles/tiles</td>
                          <td className="px-4 py-3 text-gray-700">4.0-6.0</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">Most labor intensive</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Trim fabrication & install</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">1-2</td>
                          <td className="px-4 py-3 text-gray-600">$3-8 per LF installed</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Ridge cap install</td>
                          <td className="px-4 py-3 text-gray-700">-</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">0.3-0.5 hrs per LF</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Factors That Speed Up Work:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Long, uninterrupted panel runs</li>
                      <li>• Simple gable or shed roof</li>
                      <li>• Pre-cut panels to exact length</li>
                      <li>• Experienced metal roofing crew</li>
                      <li>• Good weather (dry, low wind)</li>
                      <li>• Easy material access</li>
                      <li>• Low to moderate pitch (3/12-6/12)</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-bold text-red-900 mb-3">Factors That Slow Down Work:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Multiple roof planes and levels</li>
                      <li>• Extensive valleys and dormers</li>
                      <li>• Custom trim fabrication on-site</li>
                      <li>• Steep pitch (8/12+) requires safety gear</li>
                      <li>• Windy conditions (cannot install)</li>
                      <li>• Numerous penetrations</li>
                      <li>• Inexperienced crew with metal</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 27 square standing seam roof, 4/12 pitch, simple gable</div>
                    <div className="mt-3">Underlayment: 27 sq × 0.4 hrs = 11 hours</div>
                    <div>Panel install: 27 sq × 4.0 hrs = 108 hours</div>
                    <div>Eave trim: 96 LF × 0.15 hrs = 14 hours</div>
                    <div>Rake trim: 120 LF × 0.2 hrs = 24 hours</div>
                    <div>Ridge cap: 48 LF × 0.4 hrs = 19 hours</div>
                    <div>Details/cleanup: 12 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 188 hours ÷ 3 crew = 63 crew-hours (8-10 days)
                    </div>
                    <div className="mt-3">
                      Labor cost at $65/hr: 188 × $65 = $12,220
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Estimating Mistakes</h2>

                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">1. Forgetting Trim and Accessories</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Panels are only 60-70% of total material cost. Trim, fasteners, underlayment, and accessories add significant cost. Missing these items destroys profitability.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Create detailed trim takeoff for eaves, rakes, ridges, valleys, walls. Budget $2-4/SF for standing seam trim, $1-2/SF for exposed fastener trim.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">2. Underestimating Labor for Trim Work</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Custom trim fabrication and installation is time-consuming. Valley flashing, wall flashings, and complex transitions can take longer than panel installation.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Budget trim labor separately from panel labor. Complex roofs: trim labor equals or exceeds panel installation labor.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">3. Wrong Panel Coverage Width</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Confusing actual panel width with coverage width leads to ordering 10-15% too few panels. A 16 inch coverage panel is 18+ inches actual width.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always use coverage width for calculations. Verify with manufacturer cut sheets. For 16 inch coverage: divide roof width by 1.33 ft (16 inch = 1.33 ft).
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">4. Not Including High-Temp Underlayment</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Dark metal roofs reach 180°F in summer. Standard felt underlayment deteriorates rapidly, voiding warranties and causing odor problems.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always spec high-temperature synthetic underlayment (250°F rated) for metal roofing, especially dark colors. Add $20-30/square to material cost.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">5. Missing Closure Strips and Sealants</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Foam closures at eaves and ridges are essential to keep out pests, wind-driven rain, and snow. Butyl tape at end laps is required for waterproofing.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Include eave closure (entire perimeter), ridge closure (all peaks), butyl tape (all panel end laps), and sealant tubes (1 per 4 squares minimum).
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">6. Ignoring Thermal Movement Details</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Metal expands and contracts significantly. Fixed fasteners or improperly installed clips lead to oil-canning, fastener pullout, and leaks.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> For standing seam, use floating clips that allow movement. For exposed fastener, use oversize holes and do not overtighten screws. Never lock down thermal movement.
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
                    <span className="text-gray-700">Standing seam is premium system with concealed fasteners - higher cost but superior performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Trim and accessories represent 30-40% of material cost - never overlook in estimates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Use coverage width, not actual panel width, for calculating panel quantity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">High-temperature underlayment is required for dark metal roofs and warranty compliance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Labor varies dramatically by system type - standing seam is 50-100% more labor than exposed fastener</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Metal Roofing Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel-based template with panel calculators for all metal roof types, trim takeoff worksheets, coverage width converters, clip/fastener calculators, and detailed labor breakdowns for standing seam, exposed fastener, and corrugated systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Panel quantity calculator by coverage width</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Comprehensive trim takeoff sheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Clip and fastener quantity formulas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Labor estimators by system type</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Accessories checklist and pricing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Example estimates for all system types</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/metal-roofing-template"
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
