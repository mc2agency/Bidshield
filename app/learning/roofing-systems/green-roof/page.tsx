'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GreenRoofPage() {
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
            Green Roof Systems
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for vegetative roofs - from extensive sedum trays to intensive rooftop gardens.
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
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">Green Roof Types</a>
                <a href="#layers" className="block text-sm text-gray-600 hover:text-blue-600">System Layers</a>
                <a href="#components" className="block text-sm text-gray-600 hover:text-blue-600">Key Components</a>
                <a href="#estimation" className="block text-sm text-gray-600 hover:text-blue-600">Estimation Considerations</a>
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
                  Green roofs (vegetative or living roofs) transform conventional roofs into living ecosystems that provide stormwater management, thermal insulation, urban heat island reduction, and aesthetic benefits. These specialized assemblies layer drainage, growing media, and vegetation over a waterproof membrane.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As an estimator, understanding the differences between extensive (lightweight, low-maintenance) and intensive (garden-like, accessible) systems is critical. Green roofs involve coordination between roofing contractors, landscape architects, structural engineers, and irrigation specialists - making accurate scope definition essential.
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
                        <strong>Critical:</strong> Green roofs require structural verification before estimating. Saturated weight ranges from 15-25 psf (extensive) to 80-150 psf (intensive). Always confirm structural capacity with engineer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">30-50 years</div>
                    <div className="text-sm text-gray-600">Membrane Life (Protected)</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$15-$35/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">2% min</div>
                    <div className="text-sm text-gray-600">Minimum Slope</div>
                  </div>
                </div>
              </section>

              {/* Green Roof Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Green Roof Types</h2>

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
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Extensive Green Roof</h3>
                      <p className="text-gray-700 mb-4">
                        Lightweight, low-maintenance systems with shallow growing media (2-6 inches) and hardy, drought-tolerant plants like sedum. Not intended for regular access. Most common type for commercial buildings.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Media Depth:</strong>
                          <p className="text-gray-600">2-6 inches (typical 3-4 inches)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Saturated Weight:</strong>
                          <p className="text-gray-600">15-25 psf (lightweight)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Plant Types:</strong>
                          <p className="text-gray-600">Sedum, mosses, grasses, succulents</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Installation Method:</strong>
                          <p className="text-gray-600">Pre-grown trays or built-in-place</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$12-20/SF (system only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Maintenance:</strong>
                          <p className="text-gray-600">Low - 1-2 visits per year</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Lightweight - can retrofit many existing structures</li>
                          <li>• Lower cost than intensive systems</li>
                          <li>• Minimal maintenance requirements</li>
                          <li>• No irrigation required (after establishment)</li>
                          <li>• Modular tray systems speed installation</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Intensive Green Roof (Rooftop Garden)</h3>
                      <p className="text-gray-700 mb-4">
                        Deep-soil systems (6+ inches) that support diverse plantings including shrubs, trees, and perennials. Designed for regular access, recreation, and visual impact. Essentially a suspended garden.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Media Depth:</strong>
                          <p className="text-gray-600">6-36+ inches (varies by planting)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Saturated Weight:</strong>
                          <p className="text-gray-600">80-150+ psf (heavy)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Plant Types:</strong>
                          <p className="text-gray-600">Trees, shrubs, perennials, lawns, vegetables</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Installation Method:</strong>
                          <p className="text-gray-600">Built-in-place only</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$25-50+/SF (system only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Maintenance:</strong>
                          <p className="text-gray-600">High - weekly to monthly care</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                        <strong className="text-yellow-900">Requirements:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                          <li>• Requires structural design for heavy loads</li>
                          <li>• Irrigation system typically required</li>
                          <li>• Ongoing landscape maintenance needed</li>
                          <li>• Significantly higher initial and lifecycle costs</li>
                          <li>• Usually includes hardscape, seating, pathways</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Semi-Intensive Green Roof</h3>
                      <p className="text-gray-700 mb-4">
                        Hybrid system with moderate media depth (4-8 inches) supporting a wider plant palette than extensive but lighter than intensive. Balances aesthetics with structural demands.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Media Depth:</strong>
                          <p className="text-gray-600">4-8 inches</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Saturated Weight:</strong>
                          <p className="text-gray-600">30-50 psf</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Plant Types:</strong>
                          <p className="text-gray-600">Grasses, small perennials, herbs</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$18-28/SF</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Use Case:</strong> Projects wanting more visual diversity than sedum trays but cannot support full intensive loads. Often used for visible roofs on office buildings or multi-family housing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* System Layers */}
              <section id="layers" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Green Roof Assembly Layers (Bottom to Top)</h2>
                <p className="text-gray-700 mb-6">
                  A complete green roof is a multi-layer system. Each layer serves a specific function and must be estimated separately.
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                      <h4 className="font-bold text-gray-900">Structural Deck</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Concrete or steel deck - must support saturated green roof loads plus maintenance access.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                      <h4 className="font-bold text-gray-900">Waterproofing Membrane</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Root-resistant membrane (TPO, PVC, EPDM, modified bitumen, or liquid-applied). Must be certified root-resistant.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                      <h4 className="font-bold text-gray-900">Root Barrier (If Required)</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Additional protection layer if membrane is not inherently root-resistant. Typically HDPE or reinforced membrane.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</span>
                      <h4 className="font-bold text-gray-900">Protection Layer / Slip Sheet</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Non-woven geotextile protects membrane from punctures during installation and maintenance.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">5</span>
                      <h4 className="font-bold text-gray-900">Drainage Layer</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Engineered drainage mat or gravel layer that retains water while allowing excess to drain to roof outlets.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">6</span>
                      <h4 className="font-bold text-gray-900">Filter Fabric</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Geotextile prevents growing media fines from clogging drainage layer.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-blue-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">7</span>
                      <h4 className="font-bold text-gray-900">Growing Media (Engineered Soil)</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Lightweight blend of expanded shale/clay, compost, and sand. Not standard topsoil - engineered for drainage and weight.</p>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-green-600 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">8</span>
                      <h4 className="font-bold text-gray-900">Vegetation</h4>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">Plants installed as pre-grown mats, plugs, or seeded. Sedum trays are most common for extensive systems.</p>
                  </div>
                </div>
              </section>

              {/* Key Components */}
              <section id="components" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Components & Costs</h2>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Waterproofing Membrane</h4>
                    <p className="text-gray-700 mb-3">
                      Must be root-resistant certified or include separate root barrier. Green roof membranes typically include extended warranties (20-30 years) due to UV and thermal protection.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Root-resistant TPO/PVC:</strong>
                          <p className="text-gray-600">$2.50-4.00/SF installed</p>
                        </div>
                        <div>
                          <strong>Modified Bitumen + Root Barrier:</strong>
                          <p className="text-gray-600">$3.00-5.00/SF installed</p>
                        </div>
                        <div>
                          <strong>Liquid-applied:</strong>
                          <p className="text-gray-600">$4.00-6.00/SF installed</p>
                        </div>
                        <div>
                          <strong>Hot Rubberized Asphalt:</strong>
                          <p className="text-gray-600">$3.50-5.50/SF installed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Protection / Slip Sheet</h4>
                    <p className="text-gray-700 mb-3">
                      Non-woven geotextile fabric (10-16 oz) protects membrane from installation damage and root penetration.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material Cost:</strong> $0.30-0.60/SF</div>
                        <div><strong>Installation:</strong> Included in green roof labor</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Drainage Layer</h4>
                    <p className="text-gray-700 mb-3">
                      Engineered drainage mats (synthetic) or gravel/aggregate layer. Retains water for plants while draining excess to roof drains.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Drainage Mat:</strong> $2.00-4.00/SF (material + install)</div>
                        <div><strong>Gravel Layer:</strong> $1.50-3.00/SF (2-4 inch depth)</div>
                        <div><strong>Water Retention:</strong> 0.5-1.0 gallons per SF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Filter Fabric</h4>
                    <p className="text-gray-700 mb-3">
                      Lightweight geotextile prevents soil migration into drainage layer.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material Cost:</strong> $0.20-0.40/SF</div>
                        <div><strong>Weight:</strong> 4-8 oz non-woven</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Growing Media (Engineered Soil)</h4>
                    <p className="text-gray-700 mb-3">
                      Specialized lightweight mix - not topsoil. Typically 60-80% mineral aggregate (expanded shale/clay), 15-30% compost, 5-15% sand. Engineered for weight, drainage, and nutrient retention.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <strong>Cost per Cubic Yard:</strong>
                          <p className="text-gray-600">$80-150/CY delivered</p>
                        </div>
                        <div>
                          <strong>Weight (saturated):</strong>
                          <p className="text-gray-600">75-90 lbs per cubic foot</p>
                        </div>
                        <div>
                          <strong>Extensive (4 inch depth):</strong>
                          <p className="text-gray-600">$3.00-5.00/SF installed</p>
                        </div>
                        <div>
                          <strong>Intensive (12 inch depth):</strong>
                          <p className="text-gray-600">$9.00-15.00/SF installed</p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <strong className="text-yellow-900">Calculation:</strong> 1 inch depth = 1 CY per 324 SF
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Vegetation</h4>
                    <p className="text-gray-700 mb-3">
                      Pre-grown sedum trays are most common for extensive roofs. Plugs, cuttings, or seed used for larger areas. Intensive systems use container plants.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Pre-grown Sedum Trays:</strong> $8-15/SF (80-90% coverage)</div>
                        <div><strong>Sedum Plugs:</strong> $3-6/SF (4-6 plugs per SF)</div>
                        <div><strong>Sedum Cuttings/Seed:</strong> $1-3/SF (slower establishment)</div>
                        <div><strong>Intensive Plantings:</strong> $10-30+/SF (perennials, shrubs)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Edge Retention & Accessories</h4>
                    <p className="text-gray-700 mb-3">
                      Perimeter retention, root barriers at penetrations, inspection ports, and access pavers.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Metal Edge Retention:</strong> $8-15 per linear foot</div>
                        <div><strong>Gravel Ballast Strip:</strong> $5-10 per linear foot</div>
                        <div><strong>Inspection/Overflow Ports:</strong> $150-300 each</div>
                        <div><strong>Paver Pathways:</strong> $15-30/SF (for access)</div>
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
                    <h3 className="font-bold text-gray-900 mb-2">Structural Capacity</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Always verify existing structure can support saturated green roof loads. Retrofitting often requires structural reinforcement.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Extensive: 15-25 psf saturated</div>
                        <div>Semi-intensive: 30-50 psf</div>
                        <div>Intensive: 80-150+ psf</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Access & Material Handling</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Growing media is heavy and bulky. Crane, hoist, or boom truck required. Budget significant material handling costs.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Crane rental: $2,000-5,000/day</div>
                        <div>Hoisting labor: 30-50% of install time</div>
                        <div>Staging area required on-site</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Warranty & Maintenance</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Green roof warranties require proper installation and ongoing maintenance. Factor in establishment period care and annual maintenance contracts.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Membrane warranty: 20-30 years</div>
                        <div>Vegetation establishment: 1-2 year warranty</div>
                        <div>Annual maintenance: $1-3/SF per year</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Irrigation Requirements</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Extensive systems typically do not require irrigation after establishment. Semi-intensive and intensive require permanent irrigation.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Temporary irrigation: 4-8 weeks</div>
                        <div>Permanent drip system: $3-6/SF</div>
                        <div>Water source and backflow preventer</div>
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
                            Measure entire roof area. Deduct areas for pavers, gravel strips, and mechanical equipment zones not receiving vegetation.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 10,000 SF roof - 800 SF pavers - 400 SF gravel = 8,800 SF green roof area
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Waterproofing Membrane</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate membrane area including all flashings, penetrations, and waste. Use root-resistant certified membrane.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Field membrane: 10,000 SF × 1.08 waste = 10,800 SF</div>
                            <div>Wall flashing: 400 LF × 8 in high</div>
                            <div>Curb flashing: 20 curbs × average perimeter</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Protection & Filter Fabrics</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Protection layer covers entire membrane. Filter fabric covers entire green roof area above drainage layer.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Protection fabric: 10,000 SF × 1.05 = 10,500 SF
                            <br />Filter fabric: 8,800 SF × 1.05 = 9,240 SF
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Drainage Layer</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Drainage mats or aggregate layer sized to green roof area (exclude gravel strips and pavers).
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Drainage mat: 8,800 SF × 1.03 = 9,064 SF</div>
                            <div>OR Gravel (3 inch): 8,800 SF ÷ 4 SF/CF × 0.25 ft = 550 CF = 21 CY</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Growing Media Calculation</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate cubic yards based on specified depth. Add 5-8% for settling and waste.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div><strong>Formula:</strong> (Area × Depth in inches ÷ 324) = Cubic Yards</div>
                            <div className="mt-2"><strong>Example (4 inch extensive):</strong></div>
                            <div>8,800 SF × 4 inches ÷ 324 = 108.6 CY</div>
                            <div>Add 7% waste: 108.6 × 1.07 = 116 CY</div>
                            <div className="mt-2 text-blue-700"><strong>Cost:</strong> 116 CY × $120/CY = $13,920</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Vegetation</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate based on planting method. Pre-grown trays cover ~90%, plugs at specified spacing.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Sedum trays: 8,800 SF × 0.90 coverage = 7,920 SF</div>
                            <div>OR Sedum plugs: 8,800 SF × 4 plugs/SF = 35,200 plugs</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">7</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Edge Details & Accessories</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Perimeter retention system, gravel ballast strips, inspection ports, overflow drains.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Metal edge: 400 LF perimeter</div>
                            <div>Gravel ballast strip: 400 LF × 18 in wide</div>
                            <div>Inspection ports: 4 locations</div>
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
                        <strong>Common Mistake:</strong> Forgetting to account for material handling and hoisting costs. Growing media delivery alone can be 50+ tons for a modest roof. Budget crane time, staging area, and labor for material distribution across roof.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  Green roof installation requires coordination between roofing crews, landscaping teams, and potentially irrigation specialists. Labor rates are highly variable based on system complexity and site access.
                </p>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Baseline Productivity Rates</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Task</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Rate</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Crew</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Membrane installation</td>
                          <td className="px-4 py-3 text-gray-700">2.5-4.0 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Root-resistant system</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Protection fabric install</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Quick layer</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Drainage mat install</td>
                          <td className="px-4 py-3 text-gray-700">0.8-1.2 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">3</td>
                          <td className="px-4 py-3 text-gray-600">Includes cutting/fitting</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Filter fabric install</td>
                          <td className="px-4 py-3 text-gray-700">0.3-0.5 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Quick layer</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Growing media placement</td>
                          <td className="px-4 py-3 text-gray-700">1.5-2.5 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">4-5</td>
                          <td className="px-4 py-3 text-gray-600">Heavy labor, spreading</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Pre-grown tray install</td>
                          <td className="px-4 py-3 text-gray-700">0.8-1.5 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Fastest planting method</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Plug planting</td>
                          <td className="px-4 py-3 text-gray-700">2.0-3.5 hrs/sq</td>
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Labor intensive</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Edge detail/retention</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">$15-25 per LF installed</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Material hoisting</td>
                          <td className="px-4 py-3 text-gray-700">40-60% of total</td>
                          <td className="px-4 py-3 text-gray-700">Variable</td>
                          <td className="px-4 py-3 text-gray-600">Significant time component</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation - Extensive System</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 8,800 SF extensive green roof (4 inch media, sedum trays)</div>
                    <div className="mt-3">Membrane: 100 sq × 3.0 hrs = 300 hours</div>
                    <div>Protection/filter fabrics: 100 sq × 0.4 hrs = 40 hours</div>
                    <div>Drainage mat: 88 sq × 1.0 hrs = 88 hours</div>
                    <div>Growing media: 88 sq × 2.0 hrs = 176 hours</div>
                    <div>Sedum tray install: 88 sq × 1.2 hrs = 106 hours</div>
                    <div>Edge details: 400 LF × 0.4 hrs = 160 hours</div>
                    <div>Material hoisting: 350 hours (crane + labor)</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 1,220 hours ÷ 4 avg crew = 305 crew-hours
                    </div>
                    <div className="mt-3">
                      Labor cost at $65/hr: 1,220 × $65 = $79,300
                    </div>
                    <div className="mt-2 text-xs">
                      Plus crane rental: $3,500 | Total installed: ~$22/SF
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
                    <span className="text-gray-700">Always verify structural capacity before estimating - green roofs add 15-150 psf</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Extensive systems are most common - lightweight, low maintenance, sedum vegetation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Growing media is engineered lightweight mix - calculate in cubic yards, not by area</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Material handling is major cost - budget crane time and hoisting labor separately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Green roofs are multi-discipline - coordinate with landscape architect and structural engineer</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Green Roof Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel template with growing media calculators (cubic yard conversion), layer-by-layer takeoff worksheets, structural load calculators, vegetation quantity estimators, and complete cost breakdowns for extensive and intensive systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Growing media cubic yard calculator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">System layer breakdown worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Structural load calculator (psf)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Vegetation quantity estimators</span>
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
                      <span className="text-gray-700">Material handling cost calculator</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$49</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/green-roof-template"
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
