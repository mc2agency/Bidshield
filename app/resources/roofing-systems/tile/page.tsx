'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TileRoofingPage() {
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
            Tile Roofing Systems
          </h1>
          <p className="text-xl text-blue-100">
            Master estimating for clay and concrete tile roofing - from Spanish mission to flat profile tile systems.
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
                <a href="#types" className="block text-sm text-gray-600 hover:text-blue-600">Tile Types</a>
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
                  Tile roofing represents one of the oldest and most durable roofing systems in existence, with installations lasting 50-100+ years. Clay and concrete tiles offer exceptional fire resistance, weather durability, and aesthetic appeal. They are the premium choice for Mediterranean, Spanish Colonial, Mission, and Southwestern architectural styles.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As an estimator, tile roofing requires careful attention to structural requirements (tiles are heavy - 8-15 lbs per square foot), specialized installation methods, and extensive underlayment and flashing systems. The material cost is high, labor is specialized, but longevity and curb appeal justify the premium price in appropriate markets.
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
                        <strong>Structural Warning:</strong> Tile roofing adds 800-1,500 lbs per square (8-15 psf) to roof load. Existing structures must be evaluated by an engineer before installation. Inadequate framing can lead to structural failure, especially in snow country.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">50-100 years</div>
                    <div className="text-sm text-gray-600">Typical Lifespan</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">$10-$25/SF</div>
                    <div className="text-sm text-gray-600">Installed Cost Range</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">4:12 min</div>
                    <div className="text-sm text-gray-600">Recommended Minimum Pitch</div>
                  </div>
                </div>
              </section>

              {/* Tile Types */}
              <section id="types" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Tile Types</h2>

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
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Clay Tile (Traditional)</h3>
                      <p className="text-gray-700 mb-4">
                        The original tile material - natural clay fired in kilns at high temperatures. Extremely durable, fade-resistant, and environmentally friendly. Premium product with centuries-long lifespan. Common in historic districts and high-end homes.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Weight:</strong>
                          <p className="text-gray-600">900-1,200 lbs per square</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Lifespan:</strong>
                          <p className="text-gray-600">75-100+ years (often outlasts building)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$4.00-10.00/SF (tile only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Common Colors:</strong>
                          <p className="text-gray-600">Terra cotta, red, brown, natural (unglazed)</p>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-4">
                        <strong className="text-green-900">Advantages:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Longest lifespan of any roofing material</li>
                          <li>• Natural, sustainable material</li>
                          <li>• Colors never fade (natural pigments)</li>
                          <li>• Class A fire rating</li>
                          <li>• Excellent thermal mass (energy efficient)</li>
                          <li>• Recyclable and non-toxic</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Concrete Tile (Modern Alternative)</h3>
                      <p className="text-gray-700 mb-4">
                        Manufactured from sand, cement, and pigments. Molded into various profiles to replicate clay tile appearance at lower cost. Most popular tile option for new construction. Available in extensive color palette.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong className="text-gray-900 block mb-2">Weight:</strong>
                          <p className="text-gray-600">800-1,100 lbs per square (lighter than clay)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Lifespan:</strong>
                          <p className="text-gray-600">40-60 years (50+ in ideal conditions)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Material Cost:</strong>
                          <p className="text-gray-600">$2.00-5.00/SF (tile only)</p>
                        </div>
                        <div>
                          <strong className="text-gray-900 block mb-2">Color Options:</strong>
                          <p className="text-gray-600">30+ colors, blends, custom matches</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <strong className="text-blue-900">Considerations:</strong>
                        <ul className="mt-2 space-y-1 text-sm text-blue-800">
                          <li>• Colors may fade over 15-20 years (recoating available)</li>
                          <li>• Quality varies by manufacturer</li>
                          <li>• Lower cost than clay (40-60% savings)</li>
                          <li>• Freeze-thaw durability issues in harsh climates</li>
                          <li>• Still requires structural evaluation for weight</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Profile Types</h3>
                      <p className="text-gray-700 mb-4">
                        Both clay and concrete tiles are available in various profiles, each with different coverage rates, installation methods, and aesthetic effects.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded p-4">
                          <h4 className="font-bold text-gray-900 mb-2">Mission "S" Tile (Barrel Tile)</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Classic curved profile with separate base (pan) and cap (cover) tiles. The iconic Spanish Colonial look. Most expensive and labor-intensive.
                          </p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                            <div><strong>Coverage:</strong> 80-90 tiles per square</div>
                            <div><strong>Weight:</strong> 900-1,200 lbs/square</div>
                            <div><strong>Installation:</strong> Two-piece system (pan + cover)</div>
                            <div><strong>Labor:</strong> Highest (5-7 hours/square)</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-4">
                          <h4 className="font-bold text-gray-900 mb-2">Two-Piece "S" Tile</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Interlocking curved tiles that create mission barrel appearance with single-layer installation. More economical than traditional mission.
                          </p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                            <div><strong>Coverage:</strong> 85-100 tiles per square</div>
                            <div><strong>Weight:</strong> 850-1,000 lbs/square</div>
                            <div><strong>Installation:</strong> Single layer, interlocking</div>
                            <div><strong>Labor:</strong> Moderate (4-5 hours/square)</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-4">
                          <h4 className="font-bold text-gray-900 mb-2">Flat Profile (Mediterranean/French)</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Low-profile interlocking tile with subtle curves. Sleeker, more modern appearance. Lighter weight than barrel tiles.
                          </p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                            <div><strong>Coverage:</strong> 90-110 tiles per square</div>
                            <div><strong>Weight:</strong> 800-950 lbs/square</div>
                            <div><strong>Installation:</strong> Interlocking, nail or clip</div>
                            <div><strong>Labor:</strong> Lower (3.5-4.5 hours/square)</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-4">
                          <h4 className="font-bold text-gray-900 mb-2">Low-Profile/Slate Look</h4>
                          <p className="text-sm text-gray-700 mb-2">
                            Flat tiles designed to mimic slate. Minimal profile for contemporary designs. Lightest tile option.
                          </p>
                          <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                            <div><strong>Coverage:</strong> 100-120 tiles per square</div>
                            <div><strong>Weight:</strong> 750-900 lbs/square</div>
                            <div><strong>Installation:</strong> Similar to shingles</div>
                            <div><strong>Labor:</strong> Fastest (3-4 hours/square)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Key Materials */}
              <section id="materials" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Materials & Components</h2>
                <p className="text-gray-700 mb-6">
                  Tile roofing systems require extensive underlayment, battens (optional), specialized flashings, and trim pieces. The tile itself is only 40-50% of total material cost.
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Underlayment (Critical for Tile)</h4>
                    <p className="text-gray-700 mb-3">
                      Tile roofs are not waterproof - tiles shed water to the underlayment, which is the actual water barrier. Two layers are standard; three layers recommended in severe climates.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Primary Layer (required):</strong> #30 felt or synthetic, full coverage</div>
                        <div><strong>Secondary Layer (standard):</strong> #30 felt or synthetic, lap joints offset</div>
                        <div><strong>Cool Roof Underlayment:</strong> Reflective synthetic, $50-80/square (hot climates)</div>
                        <div><strong>Ice & Water Shield:</strong> Eaves (2 courses) and valleys in cold climates</div>
                      </div>
                      <p className="mt-3 text-yellow-700 bg-yellow-50 rounded p-2">
                        <strong>Critical:</strong> Underlayment is the roof. Tiles only protect underlayment from UV and physical damage. Never skimp on underlayment layers.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Battens (Wood Strips)</h4>
                    <p className="text-gray-700 mb-3">
                      Horizontal wood strips fastened to deck create airspace under tiles for ventilation and drainage. Required in some regions, optional in others. Increases labor and cost but extends system life.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Material:</strong> Pressure-treated 1x2 or 1x3 (per building code)</div>
                        <div><strong>Spacing:</strong> Matches tile exposure (typically 10-14 inches OC)</div>
                        <div><strong>Cost:</strong> $0.60-1.20/SF installed</div>
                        <div><strong>Benefits:</strong> Better drainage, ventilation, easier re-roofing</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Fasteners</h4>
                    <p className="text-gray-700 mb-3">
                      Tiles in high-wind or steep-pitch areas must be mechanically fastened (nailed, screwed, or clipped). Fastening requirements vary by code and wind zone.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Nails:</strong> Corrosion-resistant (stainless or galvanized), #11 or #12 wire</div>
                        <div><strong>Clips:</strong> Metal hurricane clips for high-wind zones, $0.20-0.40 each</div>
                        <div><strong>Fastening Pattern:</strong> Every tile (high wind), every other tool (moderate), perimeter only (low wind)</div>
                        <div><strong>Quantity:</strong> 1 fastener per tile (high wind) = 80-120 per square</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Trim & Specialty Tiles</h4>
                    <p className="text-gray-700 mb-3">
                      Ridge, hip, rake, and eave closure pieces. Custom-fabricated or manufacturer-supplied specialty tiles.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Ridge/Hip Cap Tiles:</strong> $6-15 per linear foot</div>
                        <div><strong>Rake Tiles (Closed Gable):</strong> $4-10 per linear foot</div>
                        <div><strong>Eave Closure (Birdstops):</strong> $3-6 per linear foot</div>
                        <div><strong>Starter Tiles:</strong> Varies by profile, $3-8/LF</div>
                        <div><strong>Top/Bottom Closure Strips:</strong> Foam or mortar, $1-3/LF</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">5. Flashing Materials</h4>
                    <p className="text-gray-700 mb-3">
                      Valleys, walls, chimneys, and penetrations require metal flashing and pan systems designed for tile profiles.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Valley Pans:</strong> W-Valley or California valley, $8-15/LF installed</div>
                        <div><strong>Wall Flashing:</strong> Step and counter flashing, $6-12/LF</div>
                        <div><strong>Chimney Pans:</strong> Custom fabricated, $200-600 each</div>
                        <div><strong>Vent Pipe Flashings:</strong> $40-80 each (must accommodate tile profile)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">6. Adhesives & Sealants</h4>
                    <p className="text-gray-700 mb-3">
                      Ridge caps, hip tiles, and certain profiles require mortar or adhesive. Foam or mortar closures seal gaps.
                    </p>
                    <div className="bg-gray-50 rounded p-4 text-sm">
                      <div className="space-y-2 text-gray-600">
                        <div><strong>Ridge Mortar:</strong> $150-300 per square (ridge/hip length)</div>
                        <div><strong>Tile Adhesive (foam):</strong> Alternative to mortar, cleaner, $200-400/square</div>
                        <div><strong>Polyurethane Foam:</strong> Eave closures, top/bottom closure, $2-4/LF</div>
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
                    <h3 className="font-bold text-gray-900 mb-2">Structural Evaluation</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Always include cost for structural engineering review. Most jurisdictions require stamped plans for tile roof installations or conversions from lighter systems.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Engineering review: $800-2,500</div>
                        <div>Structural upgrades: $2-8/SF (if needed)</div>
                        <div>Make engineering a separate line item</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Waste Factor</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Tile breakage during shipping, handling, and installation requires significant waste allowance. Complex roofs increase waste dramatically.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Simple roof: 10-15% waste</div>
                        <div>Moderate complexity: 15-20% waste</div>
                        <div>Complex roof: 20-30% waste</div>
                        <div>Always order extra for future repairs</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Regional Variations</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Installation methods, code requirements, and material availability vary significantly by region. Verify local practices.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Florida: Hurricane codes, full fastening</div>
                        <div>California: Seismic requirements, battens common</div>
                        <div>Southwest: Minimal fastening, hot climate details</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Material Lead Time</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Custom colors and specialty tiles often have 6-12 week lead times. Standard colors: 2-4 weeks. Factor into project scheduling.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="space-y-1 text-xs">
                        <div>Stock colors: 2-4 weeks delivery</div>
                        <div>Custom colors: 8-12 weeks</div>
                        <div>Include lead time in proposals</div>
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
                            Measure all roof planes with pitch multipliers. Tile coverage follows actual roof surface, not horizontal footprint.
                          </p>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs">
                            Example: 2,800 sq ft footprint × 1.158 (5/12 pitch) = 3,242 sq ft = 32.42 squares
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Determine Tile Quantity</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Coverage varies by profile. Manufacturer specs list tiles per square. Add waste factor.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Two-piece S-tile: 90 tiles per square</div>
                            <div>Quantity needed: 32.42 sq × 90 = 2,918 tiles</div>
                            <div>With 15% waste: 2,918 × 1.15 = 3,356 tiles</div>
                            <div>Order extra 50-100 tiles for future repairs</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Underlayment Layers</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Two full layers are standard. Three layers in harsh climates. Include 10% lap waste.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Layer 1: 32.42 sq × 1.10 = 35.7 squares</div>
                            <div>Layer 2: 32.42 sq × 1.10 = 35.7 squares</div>
                            <div>Total underlayment: 71.4 squares (2 layers)</div>
                            <div>Ice & Water Shield: Eaves + valleys</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Measure Ridge, Hip, and Rake Trim</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            All linear transitions require specialty tiles or metal trim. Measure each separately.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Ridge cap tiles: 60 LF × 1.5 tiles/LF = 90 ridge tiles</div>
                            <div>Hip cap tiles: 80 LF × 1.5 tiles/LF = 120 hip tiles</div>
                            <div>Rake tiles: 140 LF</div>
                            <div>Starter course: 100 LF (eave length)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Calculate Battens (if used)</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Horizontal battens at tile exposure spacing. Calculate linear feet based on roof width and spacing.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Roof is 50 ft wide, 65 ft long</div>
                            <div>Tile exposure: 12 inches (12 tools per side)</div>
                            <div>Battens needed: 24 rows × 50 ft = 1,200 LF</div>
                            <div>1x3 PT batten @ $0.80/LF = $960 material</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Fasteners & Closure Materials</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Calculate nails, clips, mortar, and foam closures based on installation method.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Tile nails: 3,356 tiles × 1 nail = 3,356 nails</div>
                            <div>Eave closure foam: 100 LF</div>
                            <div>Ridge/hip mortar or foam: 140 LF</div>
                            <div>Bottom closure strips: As needed per profile</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">7</span>
                        <div className="flex-1">
                          <strong className="text-gray-900 block mb-2">Valley & Flashing Materials</strong>
                          <p className="text-sm text-gray-700 mb-2">
                            Custom metal pans and flashings for valleys and penetrations.
                          </p>
                          <div className="bg-gray-50 rounded p-3 text-xs">
                            <div>Valley pans: 2 valleys × 18 ft = 36 LF</div>
                            <div>Wall flashing: 40 LF (chimney)</div>
                            <div>Pipe boots: 5 (plumbing vents)</div>
                            <div>Chimney pan: 1 custom fabricated</div>
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
                        <strong>Important:</strong> Tile coverage rates vary significantly by profile and manufacturer. Always verify with actual product specifications. A 10% error in coverage rate means ordering 300+ tiles too few on a 30-square roof.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Labor Estimation */}
              <section id="labor" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Labor Estimation Guidance</h2>

                <p className="text-gray-700 mb-6">
                  Tile roofing is extremely labor-intensive. Skilled tile setters command premium wages. Expect 2-3x the labor hours of asphalt shingles. Complex roofs with extensive trim work can exceed material costs in labor.
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
                          <td className="px-4 py-3 text-gray-700">3-4</td>
                          <td className="px-4 py-3 text-gray-600">Tile tearoff is slow, heavy</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Underlayment (2 layers)</td>
                          <td className="px-4 py-3 text-gray-700">0.6-1.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Two full layers required</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Batten installation</td>
                          <td className="px-4 py-3 text-gray-700">1.0-1.5</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">If specified</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Flat profile tile</td>
                          <td className="px-4 py-3 text-gray-700">3.0-4.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Fastest tile type</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Two-piece S-tile</td>
                          <td className="px-4 py-3 text-gray-700">4.0-5.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Most common profile</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Mission barrel tile</td>
                          <td className="px-4 py-3 text-gray-700">5.0-7.0</td>
                          <td className="px-4 py-3 text-gray-700">2-3</td>
                          <td className="px-4 py-3 text-gray-600">Two-piece system, slowest</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-900">Ridge/hip installation</td>
                          <td className="px-4 py-3 text-gray-700">-</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">0.5-0.8 hrs per LF</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">Valley installation</td>
                          <td className="px-4 py-3 text-gray-700">-</td>
                          <td className="px-4 py-3 text-gray-700">2</td>
                          <td className="px-4 py-3 text-gray-600">0.8-1.2 hrs per LF</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Factors That Speed Up Work:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Simple gable or hip roof (no valleys)</li>
                      <li>• Low pitch (4/12-6/12)</li>
                      <li>• Experienced tile crew (5+ years)</li>
                      <li>• Batten system (easier tile alignment)</li>
                      <li>• Flat or low-profile tiles</li>
                      <li>• Good weather conditions</li>
                      <li>• Easy material staging and access</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-bold text-red-900 mb-3">Factors That Slow Down Work:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Multiple roof levels and dormers</li>
                      <li>• Extensive valleys and trim work</li>
                      <li>• Steep pitch (8/12+)</li>
                      <li>• Mission barrel tiles (two-piece system)</li>
                      <li>• Custom color or trim details</li>
                      <li>• Inexperienced crew with tile</li>
                      <li>• Difficult access or multi-story</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Example Labor Calculation</h4>
                  <div className="space-y-2 text-sm text-blue-800 font-mono">
                    <div>Project: 32 square two-piece S-tile roof, 5/12 pitch, moderate complexity</div>
                    <div className="mt-3">Tearoff: 32 sq × 2.0 hrs = 64 hours</div>
                    <div>Underlayment (2 layers): 32 sq × 0.8 hrs = 26 hours</div>
                    <div>Tile installation: 32 sq × 4.5 hrs = 144 hours</div>
                    <div>Ridge/hip: 140 LF × 0.6 hrs = 84 hours</div>
                    <div>Valley work: 36 LF × 1.0 hrs = 36 hours</div>
                    <div>Details/cleanup: 20 hours</div>
                    <div className="pt-2 border-t border-blue-300 mt-2 font-bold">
                      Total: 374 hours ÷ 3 crew = 125 crew-hours (4-5 weeks)
                    </div>
                    <div className="mt-3">
                      Labor cost at $70/hr: 374 × $70 = $26,180
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section id="common-mistakes" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Estimating Mistakes</h2>

                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">1. Missing Structural Engineering</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Converting from shingles to tile without structural evaluation. Most buildings are not designed for 8-15 psf additional dead load. Structural failure, code violations, and liability issues.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always include structural engineering review as a line item ($1,000-2,500). Budget for potential upgrades (rafters, trusses, sheathing) as allowance or exclusion.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">2. Insufficient Waste Factor</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Tile breakage from shipping, handling, cutting, and installation is significant. Using 10% waste on complex roofs guarantees running short and delays.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Use 15-20% waste minimum for standard jobs. Complex roofs with valleys, hips, dormers: 20-30% waste. Always order 50-100 extra tiles for future repairs (custom colors have long lead times).
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">3. Forgetting Second Underlayment Layer</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Bidding single layer of felt when two layers are standard and often required by code. Underlayment is the actual waterproof membrane in tile systems.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always include two full layers of #30 felt or synthetic underlayment. Three layers in severe climates or low pitch. Doubles underlayment cost but critical for warranty and performance.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">4. Underestimating Ridge/Hip Labor</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Ridge and hip cap installation is time-consuming and requires precision. Each cap tile must be individually set, mortared or adhered, and aligned. Can equal field tile installation time on hip roofs.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Budget 0.5-0.8 hours per linear foot for ridge/hip work. On hip roofs, this can add 80-120 hours to project. Never estimate ridge/hip as percentage of field time.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">5. Wrong Tile Coverage Rate</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Using generic tiles-per-square instead of actual product specs. Coverage varies from 80-120 tiles per square depending on profile, exposure, and manufacturer.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Always get manufacturer specs for exact product. Verify coverage rate, weight, and fastening requirements. A 10-tile-per-square error means 320 tiles short on 32-square roof.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-6">
                    <h4 className="font-bold text-red-900 mb-2">6. Missing Specialty Trim Tiles</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Forgetting starter tiles, rake tiles, eave closure, and specialty pieces. These can add 15-25% to material cost.
                    </p>
                    <p className="text-xs text-red-700 bg-red-100 rounded p-2">
                      <strong>Fix:</strong> Create separate takeoff for eave starters, rake edge, ridge cap, hip cap, and any specialty transitions. Budget $4-12/LF for trim tiles depending on profile.
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
                    <span className="text-gray-700">Structural engineering review is mandatory - tile adds 800-1,500 lbs per square to roof load</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Two layers of underlayment are standard - underlayment is the actual waterproof membrane</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Waste factor must be 15-30% due to breakage - always order extra tiles for future repairs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Labor is 2-3x shingles - experienced tile setters are essential and command premium rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Ridge and hip work is time-intensive - budget 0.5-0.8 hours per linear foot for quality work</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get the Complete Tile Roofing Estimating Template
                </h3>
                <p className="text-gray-600 mb-6">
                  Excel-based template with tile quantity calculators for all profiles, underlayment layer worksheets, trim tile takeoff tools, structural load calculators, waste factor formulas, and detailed labor breakdowns for clay and concrete tile systems.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Template Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Tile quantity calculator by profile type</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Multi-layer underlayment worksheets</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Trim and specialty tile takeoffs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Structural load calculator</span>
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
                      <span className="text-gray-700">Labor estimates by tile profile</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$39</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/products/tile-roofing-template"
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
