import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function GreenRoofTemplatePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                PREMIUM SPECIALTY SYSTEM
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Green Roof Systems Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-emerald-100 mb-8">
                Professional Excel template for estimating vegetated and living roof systems. Calculate soil volumes, plant schedules, drainage layers, waterproofing membranes, and structural load considerations for sustainable roofing projects.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$79</span>
                <span className="text-emerald-200 text-xl">Premium Template</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="greenRoof"
                  text="Buy Template - $79"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors text-lg border-2 border-emerald-600"
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
                    <div className="text-6xl mb-4 text-center">🌿</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Extensive and intensive green roofs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Vegetated roof assemblies</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Living roof systems with gardens</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Sustainable building projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Master Green Roof Estimating
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handle complex vegetated roof systems with precision and confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Layer Assembly</h3>
              <p className="text-gray-600">
                Calculate waterproofing, root barrier, drainage layer, filter fabric, growing media, and plant materials. Complete system integration with precise depth calculations.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Structural Load Analysis</h3>
              <p className="text-gray-600">
                Track dead loads and saturated weight for extensive and intensive systems. Ensure structural capacity with load per square foot calculations.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drainage & Irrigation</h3>
              <p className="text-gray-600">
                Size drainage systems for water retention and flow requirements. Calculate irrigation needs for plant establishment and ongoing maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Included in the Template
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to estimate green and living roof systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Waterproofing Membrane System</h4>
                    <p className="text-gray-600 text-sm">Hot-applied rubberized asphalt, cold-applied fluid membranes, or sheet membranes with root barrier protection and seam details</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Root Barrier Layer</h4>
                    <p className="text-gray-600 text-sm">Root-resistant membranes and barriers to protect waterproofing from penetration damage with overlap and termination calculations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Drainage Layer & Retention Mats</h4>
                    <p className="text-gray-600 text-sm">Drainage boards, water retention/detention mats, and modular drainage systems with flow capacity calculations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Filter Fabric Geotextiles</h4>
                    <p className="text-gray-600 text-sm">Non-woven geotextile filter fabrics to prevent growing media migration into drainage layer with seam overlap allowances</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Growing Media Volume Calculator</h4>
                    <p className="text-gray-600 text-sm">Engineered soil calculations by depth for extensive (2"-6") and intensive (6"-24"+) systems with weight per cubic foot tracking</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Plant Schedule & Quantities</h4>
                    <p className="text-gray-600 text-sm">Sedum mats, plug plants, container plants, and seed mix calculations by coverage area and spacing requirements</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Perimeter Edge & Retention</h4>
                    <p className="text-gray-600 text-sm">Edge restraints, gravel stops, ballast strips, and growing media retention systems by linear foot with height specifications</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Irrigation System Components</h4>
                    <p className="text-gray-600 text-sm">Drip irrigation tubing, emitters, controllers, valves, and backflow preventers for plant establishment and maintenance</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Installation</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Waterproofing Installation</h4>
                    <p className="text-gray-600 text-sm">Labor rates for membrane application, seam welding/taping, detail work, and flood testing with quality control requirements</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Protection & Drainage Layer Labor</h4>
                    <p className="text-gray-600 text-sm">Installation rates for root barriers, drainage boards, retention mats, and filter fabrics by square footage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Growing Media Placement</h4>
                    <p className="text-gray-600 text-sm">Labor and equipment for engineered soil delivery, placement, spreading, and depth verification per cubic yard</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Plant Installation Labor</h4>
                    <p className="text-gray-600 text-sm">Sedum mat laying, plug planting, container plant installation, and seed application by plant type and quantity</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Irrigation System Installation</h4>
                    <p className="text-gray-600 text-sm">Labor for irrigation layout, tubing installation, emitter placement, controller setup, and system testing</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Equipment & Crane Time</h4>
                    <p className="text-gray-600 text-sm">Material hoisting costs, crane rental, blowers for growing media placement, and roof access equipment</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Structural Load Analysis</h4>
                    <p className="text-gray-600 text-sm">Dead load calculations for all layers, saturated weight tracking, and structural verification requirements</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Establishment & Maintenance</h4>
                    <p className="text-gray-600 text-sm">Initial watering schedule, fertilization plan, and first-year maintenance requirements with cost estimates</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Types Covered</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Extensive Green Roofs (2"-6" depth)</h4>
                <p className="text-gray-700 text-sm">Lightweight systems with drought-tolerant sedums and grasses, minimal maintenance, ideal for slopes up to 40 degrees, saturated weight 10-35 lbs/sq ft</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Intensive Green Roofs (6"-24"+ depth)</h4>
                <p className="text-gray-700 text-sm">Full garden systems with perennials, shrubs, trees, accessible spaces, regular maintenance, level to low-slope, saturated weight 35-200+ lbs/sq ft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Green Roof Systems Explanation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Understanding Green Roof Systems
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multi-layer vegetated roof assemblies that require specialized estimating
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What Makes Green Roofs Complex</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Multiple Specialized Layers</h4>
                    <p className="text-gray-600 text-sm">Each layer serves a critical function and must be properly coordinated - waterproofing, root protection, drainage, filtration, and growing media</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Structural Load Considerations</h4>
                    <p className="text-gray-600 text-sm">Must calculate and verify dead loads and saturated weight to ensure existing structure can support the system safely</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Volume-Based Material Calculations</h4>
                    <p className="text-gray-600 text-sm">Growing media requires cubic foot/yard calculations, weight tracking, and delivery logistics unlike typical roofing materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Living Material Schedules</h4>
                    <p className="text-gray-600 text-sm">Plant quantities, spacing, coverage rates, and establishment requirements add complexity beyond standard construction estimating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits of Green Roofs</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Extend roof membrane lifespan by 2-3x through UV and temperature protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Reduce stormwater runoff by 50-90% with water retention and detention</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Lower building energy costs through natural insulation and cooling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Earn LEED points and meet sustainable building requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Create amenity space and increase property value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span className="text-gray-700">Mitigate urban heat island effect and improve air quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Layers Breakdown */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Green Roof Assembly Layers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete system breakdown from deck to vegetation
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Waterproofing Membrane</h3>
                  <p className="text-gray-600 mb-3">
                    Foundation of the system - must be 100% watertight and root-resistant. Options include modified bitumen, single-ply TPO/PVC, liquid-applied membranes, or hot rubberized asphalt.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Membrane square footage with overlap and waste</li>
                      <li>• Primer and adhesive requirements</li>
                      <li>• Detail work at penetrations and perimeters</li>
                      <li>• Flood testing and quality control costs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Root Barrier Protection</h3>
                  <p className="text-gray-600 mb-3">
                    Prevents root penetration damage to waterproofing membrane. Can be integral to membrane or separate layer using high-density polyethylene or reinforced membranes.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Root barrier material quantities with seam overlaps</li>
                      <li>• Installation labor by square foot</li>
                      <li>• Seaming tape or welding requirements</li>
                      <li>• Termination and edge detail materials</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Drainage Layer & Water Retention</h3>
                  <p className="text-gray-600 mb-3">
                    Removes excess water while retaining moisture for plants. Options include drainage boards, water retention mats, or modular systems with built-in water storage capacity.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Drainage layer coverage by system type</li>
                      <li>• Water flow capacity verification</li>
                      <li>• Retention volume for stormwater management</li>
                      <li>• Edge strips and perimeter protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Filter Fabric Separation</h3>
                  <p className="text-gray-600 mb-3">
                    Non-woven geotextile prevents growing media from migrating into drainage layer while allowing water to pass through. Critical for long-term system performance.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Geotextile square footage with overlap allowances</li>
                      <li>• Material weight and specifications</li>
                      <li>• Installation labor rates</li>
                      <li>• Overlap and seaming requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  5
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Growing Media / Engineered Soil</h3>
                  <p className="text-gray-600 mb-3">
                    Lightweight engineered substrate providing nutrients, water retention, and root support. Depth varies by system type: 2"-6" for extensive, 6"-24"+ for intensive systems.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cubic feet/yards by depth and area</li>
                      <li>• Dry weight and saturated weight per sq ft</li>
                      <li>• Delivery and placement costs</li>
                      <li>• Equipment rental for material handling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center font-bold text-xl">
                  6
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vegetation / Plant Layer</h3>
                  <p className="text-gray-600 mb-3">
                    Living plant material selected for climate, maintenance level, and system depth. Options include sedum mats, plug trays, container plants, or seed mix depending on project type.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Template Calculates:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Plant quantities by type and spacing</li>
                      <li>• Coverage rates for mats and plugs</li>
                      <li>• Installation labor by plant type</li>
                      <li>• Establishment watering and maintenance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Template Screenshots */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Template Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Intuitive Excel workbook designed specifically for green roof estimating
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Project Input Sheet</h3>
              <p className="text-gray-600 mb-4">
                Enter project details, roof area, system type (extensive/intensive), and depth specifications. Select waterproofing method, drainage system, and plant materials.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• System type selector (extensive vs. intensive)</li>
                <li>• Growing media depth calculator</li>
                <li>• Structural load verification tracker</li>
                <li>• Roof slope and drainage considerations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Material Takeoff Sheets</h3>
              <p className="text-gray-600 mb-4">
                Automated calculations for each layer of the assembly. Enter measurements once and all materials calculate automatically with proper waste factors.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Layer-by-layer material quantities</li>
                <li>• Overlap and seam allowances built in</li>
                <li>• Edge detail and termination materials</li>
                <li>• Irrigation component calculations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Plant Schedule Builder</h3>
              <p className="text-gray-600 mb-4">
                Create detailed plant schedules with quantities, spacing, and coverage calculations. Track sedum mats, plugs, containers, and seed by coverage area.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Multiple plant type tracking</li>
                <li>• Coverage rate calculations</li>
                <li>• Plant diversity requirements</li>
                <li>• Maintenance and warranty considerations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cost Summary & Proposal</h3>
              <p className="text-gray-600 mb-4">
                Professional cost breakdown showing materials, labor, equipment, and total investment. Export-ready format for client presentations and bid submissions.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Line-item material and labor costs</li>
                <li>• Structural load summary</li>
                <li>• Warranty and maintenance options</li>
                <li>• Project timeline and phases</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Format & Compatibility</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  Excel .xlsx format with advanced formulas and protected structure
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-gray-900 mb-2">Google Sheets Compatible</h3>
                <p className="text-gray-600 text-sm">
                  Upload to Google Sheets for cloud access and team collaboration
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-bold text-gray-900 mb-2">Fully Customizable</h3>
                <p className="text-gray-600 text-sm">
                  Adjust all pricing, rates, plant lists, and formulas for your region
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
              Who Is This Premium Template For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Specialty Contractors</h3>
              <p className="text-gray-600 text-sm">
                Contractors specializing in green roof and living roof systems for commercial and institutional projects
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Sustainable Builders</h3>
              <p className="text-gray-600 text-sm">
                Green building contractors pursuing LEED certification and sustainable design projects
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-4xl mb-4">👷</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Roofers</h3>
              <p className="text-gray-600 text-sm">
                Established roofing companies expanding into vegetated roof systems and specialized applications
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Project Estimators</h3>
              <p className="text-gray-600 text-sm">
                Professional estimators bidding green roof systems for GCs and needing accurate multi-layer takeoffs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Why is this template more expensive than other roofing templates?
              </h3>
              <p className="text-gray-600">
                Green roof systems are significantly more complex than standard roofing. This premium template includes specialized calculators for soil volume, structural loads, multi-layer assemblies, plant schedules, and irrigation systems - features not found in basic roofing templates. It represents months of development working with green roof specialists.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can this template handle both extensive and intensive green roofs?
              </h3>
              <p className="text-gray-600">
                Yes, the template includes calculators for both extensive (lightweight, shallow depth) and intensive (full garden, deeper) systems. Simply select your system type and the template adjusts all calculations including growing media depth, structural loads, and plant material quantities accordingly.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Does the template include structural load calculations?
              </h3>
              <p className="text-gray-600">
                Yes, the template tracks dead load and saturated weight for all layers of the assembly. It calculates pounds per square foot so you can verify the structure can support the system. However, it does not replace professional structural engineering - always have a structural engineer review green roof projects.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                What waterproofing systems does the template cover?
              </h3>
              <p className="text-gray-600">
                The template includes options for modified bitumen, TPO/PVC single-ply membranes, liquid-applied membranes, and hot-applied rubberized asphalt systems. All include root barrier considerations and proper detailing requirements for green roof applications.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                How does the plant material calculator work?
              </h3>
              <p className="text-gray-600">
                Enter your roof area and select plant types (sedum mats, plug plants, containers, or seed). The template calculates quantities based on coverage rates and spacing requirements. It includes establishment and maintenance considerations for accurate first-year cost projections.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I customize the template for my region and suppliers?
              </h3>
              <p className="text-gray-600">
                Absolutely. All material costs, labor rates, plant species, and system specifications are fully editable. Input your local pricing and the template maintains all formulas and calculations. Many contractors customize it with their preferred suppliers and manufacturers.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Do I need green roof experience to use this template?
              </h3>
              <p className="text-gray-600">
                The template helps you organize and calculate green roof projects, but basic knowledge of the systems is recommended. Consider using this alongside manufacturer training and industry resources. It's an excellent tool for contractors new to green roofs who want to ensure accurate estimates.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                What if I need help using the template?
              </h3>
              <p className="text-gray-600">
                All purchasers receive lifetime email support. If you have questions about calculations, formulas, or how to estimate a specific green roof scenario, just reach out. We also provide free updates when we add new features or improve calculations.
              </p>
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
              Use the template on green roof projects for 30 days. If it doesn't dramatically improve your estimating accuracy and save you time, we'll refund your purchase - no questions asked.
            </p>
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
              Get the complete template bundle and save on all specialty systems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-emerald-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE - SAVE $200
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All roofing templates including premium systems, estimating checklist, and proposal library
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$129</div>
              <div className="text-emerald-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/tpo-template" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC/EPDM Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Commercial single-ply membrane roofing estimating template
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$39</div>
              <div className="text-emerald-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/spray-foam" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spray Foam Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                SPF roofing and insulation system estimating template
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$39</div>
              <div className="text-emerald-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Master Green Roof Estimating?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join sustainable contractors using our premium template for accurate vegetated roof system estimates
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$79</span>
            </div>
            <p className="text-emerald-100 mb-6">One-time payment • Lifetime access • Free updates • Premium support</p>

            <GumroadCheckoutButton
              productKey="greenRoof"
              text="Buy Green Roof Template - $79"
              variant="large"
            />

            <p className="mt-6 text-sm text-emerald-200">
              30-Day Money-Back Guarantee • Instant Download
            </p>
          </div>

          <div className="bg-emerald-800/50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-xl mb-2">Why This Template is Worth the Investment</h3>
            <p className="text-emerald-100">
              Green roof projects typically range from $15-$35 per square foot installed. A 10,000 sq ft project is $150,000-$350,000. Getting your estimate right matters. This template pays for itself on your very first project by preventing costly errors and ensuring you account for all layers, materials, and labor.
            </p>
          </div>

          <p className="text-sm text-emerald-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
