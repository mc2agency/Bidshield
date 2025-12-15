import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function RestorationCoatingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-emerald-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                ROOF RESTORATION & COATING
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Roof Restoration & Coating Estimating Template
              </h1>
              <p className="text-xl sm:text-2xl text-emerald-100 mb-8">
                Complete Excel template for estimating roof coating and restoration projects. Calculate surface prep, coating coverage, repairs, and labor for silicone, acrylic, and elastomeric coating systems.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="restorationCoating"
                  text="Buy Template - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors text-lg border-2 border-teal-600"
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
                    <div className="text-6xl mb-4 text-center">🔄</div>
                    <h3 className="font-bold text-xl mb-4 text-center">Perfect For:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>Silicone, acrylic, and elastomeric coatings</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>Metal, TPO, modified, and built-up roofs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>Roof restoration and rejuvenation projects</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>Commercial and industrial buildings</span>
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
              Master Roof Coating & Restoration Estimates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extend roof life and win more restoration projects with accurate coating estimates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precise Coverage Calculations</h3>
              <p className="text-gray-600">
                Calculate coating coverage rates by mil thickness and surface type. Account for primer, base coat, and top coat applications with substrate-specific absorption rates.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Surface Prep</h3>
              <p className="text-gray-600">
                Detailed calculations for power washing, repairs, seam treatment, and substrate preparation. Track material and labor for every prep step.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-System Support</h3>
              <p className="text-gray-600">
                Estimate silicone, acrylic, urethane, and elastomeric systems. Built-in coverage rates and specs for all major coating manufacturers.
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
              Everything you need to estimate roof coating and restoration projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Material Calculators</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Coating Coverage Calculator</h4>
                    <p className="text-gray-600 text-sm">Gallons needed by square footage, mil thickness, and coating type (silicone, acrylic, urethane, elastomeric) with surface absorption factors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Primer & Base Coat Quantities</h4>
                    <p className="text-gray-600 text-sm">Coverage rates for primers, base coats, and adhesion promoters based on substrate type and condition</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Seam Treatment Materials</h4>
                    <p className="text-gray-600 text-sm">Reinforcing fabric, seam tape, mastic, and caulking linear foot calculations for seam preparation and reinforcement</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Repair Material Takeoff</h4>
                    <p className="text-gray-600 text-sm">Patch materials, fasteners, adhesives, and reinforcement for substrate repairs and damage correction</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashing & Detail Materials</h4>
                    <p className="text-gray-600 text-sm">Detail coating, flashing treatment, termination bars, and edge sealing materials by linear foot</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cleaning & Prep Supplies</h4>
                    <p className="text-gray-600 text-sm">Power washing chemicals, degreasers, rust inhibitors, and surface preparation materials</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Labor & Production Rates</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Surface Preparation Labor</h4>
                    <p className="text-gray-600 text-sm">Power washing, cleaning, and surface prep rates per square foot by substrate type and condition</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Repair Work Hours</h4>
                    <p className="text-gray-600 text-sm">Labor for patching, fastener replacement, seam repair, and substrate damage correction</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Coating Application Rates</h4>
                    <p className="text-gray-600 text-sm">Production rates for spray, roller, and brush application by coating type and thickness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Seam Treatment Labor</h4>
                    <p className="text-gray-600 text-sm">Linear foot rates for seam cleaning, priming, fabric installation, and seam coating</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Equipment & Access</h4>
                    <p className="text-gray-600 text-sm">Spray equipment, power washers, lifts, and safety equipment costs by project size and duration</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Control Time</h4>
                    <p className="text-gray-600 text-sm">Labor for mil thickness testing, adhesion testing, and multi-coat application monitoring</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Coating Systems Included</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Silicone Coating</h4>
                <p className="text-gray-700 text-sm">Single or multi-coat silicone systems with ponding water resistance and UV protection</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Acrylic Coating</h4>
                <p className="text-gray-700 text-sm">Water-based acrylic systems for metal and single-ply substrates with reflective properties</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Elastomeric Coating</h4>
                <p className="text-gray-700 text-sm">High-build elastomeric systems for waterproofing and crack bridging applications</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Urethane Coating</h4>
                <p className="text-gray-700 text-sm">Two-part urethane systems with superior abrasion resistance for high-traffic areas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coating Types Explanation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Understanding Roof Coating Systems
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right coating system for each substrate and application
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border-2 border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Silicone Coatings</h3>
              <p className="text-gray-700 mb-4">
                Premium coating option for roofs with ponding water issues. Excellent UV resistance and weather durability.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">→</span>
                  <span><strong>Best for:</strong> Metal roofs, TPO, modified bitumen, built-up roofs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">→</span>
                  <span><strong>Advantages:</strong> Ponding water resistance, long-term UV stability, self-cleaning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">→</span>
                  <span><strong>Warranty:</strong> Typically 10-20 years depending on mil thickness</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Acrylic Coatings</h3>
              <p className="text-gray-700 mb-4">
                Cost-effective water-based coating with excellent reflectivity and energy savings potential.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Best for:</strong> Metal roofs, spray foam, smooth surfaces without ponding</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Advantages:</strong> High solar reflectance, easy cleanup, lower cost</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Warranty:</strong> Typically 5-15 years with proper drainage</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Elastomeric Coatings</h3>
              <p className="text-gray-700 mb-4">
                High-build coating system ideal for aging roofs with cracks and minor damage requiring waterproofing.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">→</span>
                  <span><strong>Best for:</strong> Built-up roofs, modified bitumen, concrete substrates</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">→</span>
                  <span><strong>Advantages:</strong> Crack bridging, high build, excellent waterproofing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">→</span>
                  <span><strong>Warranty:</strong> Typically 5-12 years depending on substrate</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 border-2 border-orange-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Urethane Coatings</h3>
              <p className="text-gray-700 mb-4">
                Two-part coating system with superior chemical and abrasion resistance for high-traffic or industrial roofs.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">→</span>
                  <span><strong>Best for:</strong> Industrial roofs, high-traffic areas, chemical exposure</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">→</span>
                  <span><strong>Advantages:</strong> Extreme durability, chemical resistance, high tensile strength</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">→</span>
                  <span><strong>Warranty:</strong> Typically 10-20 years for industrial applications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to Restore vs Replace */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              When to Restore vs. Replace
            </h2>
            <p className="text-xl text-gray-600">
              Help your customers make the right decision for their roof
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✓</span>
                Good Candidates for Restoration
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Roof is structurally sound with minimal wet insulation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Surface oxidation, weathering, or minor coating failure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Fastener backing out or seam issues that can be repaired</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Metal roof rust or corrosion without structural damage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Building owner wants to extend roof life 10-20 years</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">•</span>
                  <span className="text-gray-700">Budget constraints or operational disruption concerns</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✕</span>
                Poor Candidates for Restoration
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Widespread wet insulation or structural deck damage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Severe membrane shrinkage or extensive cracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Metal roof with holes, severe corrosion, or panel failure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Inadequate drainage causing constant ponding water</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Building code changes requiring major upgrades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span className="text-gray-700">Roof has already been restored multiple times</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Cost Comparison Guide</h3>
            <p className="text-gray-700 max-w-3xl mx-auto">
              Roof restoration typically costs <strong>40-60% less than replacement</strong> while extending roof life by 10-20 years. The template includes cost comparison tools to help present both options to building owners.
            </p>
          </div>
        </div>
      </section>

      {/* Template Walkthrough */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Use the Template
            </h2>
            <p className="text-xl text-gray-600">
              From roof assessment to restoration bid in 5 steps
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Assess Substrate & Select Coating System</h3>
                <p className="text-gray-600">
                  Identify existing roof type (metal, TPO, modified, built-up) and condition. Choose coating system (silicone, acrylic, elastomeric, urethane) based on substrate and performance requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Measurements & Repair Quantities</h3>
                <p className="text-gray-600">
                  Input total square footage, seam linear footage, and document needed repairs (patches, fasteners, damaged areas). Template calculates prep materials and repair labor automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Calculate Coating Coverage & Materials</h3>
                <p className="text-gray-600">
                  Select mil thickness (typically 20-60 mils) and number of coats. Template calculates primer, base coat, and top coat gallons based on coverage rates and substrate absorption.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Labor & Equipment Requirements</h3>
                <p className="text-gray-600">
                  Template breaks down labor for power washing, repairs, seam treatment, and coating application. Includes spray equipment, power washer rentals, and access equipment costs.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                5
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Proposal & Compare to Replacement</h3>
                <p className="text-gray-600">
                  Export professional estimate showing restoration costs, warranty information, energy savings, and ROI analysis. Include side-by-side comparison with full replacement option.
                </p>
              </div>
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
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Does the template include coverage rates for different coating brands?
              </h3>
              <p className="text-gray-600">
                Yes! The template includes standard coverage rates for major coating manufacturers and allows you to customize rates based on your specific product specs and substrate conditions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I estimate both restoration and replacement to compare costs?
              </h3>
              <p className="text-gray-600">
                Absolutely. The template includes a comparison section where you can show restoration costs versus tear-off and replacement, helping building owners make informed decisions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                How does the template handle different substrate types?
              </h3>
              <p className="text-gray-600">
                The template has substrate-specific sections for metal, TPO, PVC, EPDM, modified bitumen, built-up roofs, and spray foam. Each substrate has appropriate prep requirements and coverage adjustments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Are seam treatment and reinforcement fabric calculations included?
              </h3>
              <p className="text-gray-600">
                Yes. The template calculates linear footage for seam cleaning, primer application, reinforcement fabric installation, and seam coating with material and labor breakdowns.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I adjust for different mil thicknesses and coat systems?
              </h3>
              <p className="text-gray-600">
                Definitely. Input your desired mil thickness (typically 20-60 mils total) and number of coats. The template automatically adjusts coverage rates and calculates material quantities for primer, base, and top coats.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Is power washing and surface preparation labor included?
              </h3>
              <p className="text-gray-600">
                Yes! The template includes labor rates for power washing, chemical cleaning, surface prep, and drying time. Equipment costs for pressure washers and cleaning supplies are also calculated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* File Formats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Format & Compatibility</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-900 mb-2">Microsoft Excel</h3>
                <p className="text-gray-600 text-sm">
                  Excel .xlsx format with formulas and protected cells
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
                  Adjust all pricing, coverage rates, and formulas to match your preferred products
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
              Who Is This Template For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Restoration Contractors</h3>
              <p className="text-gray-600 text-sm">
                Specializing in roof coating and restoration as an alternative to replacement
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Roofers</h3>
              <p className="text-gray-600 text-sm">
                Adding restoration services to complement traditional roofing installations
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Coating Applicators</h3>
              <p className="text-gray-600 text-sm">
                Professional coating contractors needing accurate material and labor estimates
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Maintenance Companies</h3>
              <p className="text-gray-600 text-sm">
                Building maintenance firms offering roof coating as preventive maintenance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Restoration Contractors Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The coating coverage calculator is spot-on. It accounts for substrate absorption and multiple coats - I haven't had a shortage issue since using it."
              </p>
              <p className="font-semibold text-gray-900">Marcus Rivera</p>
              <p className="text-sm text-gray-500">Owner, Superior Roof Coatings</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "Being able to show both restoration and replacement costs side-by-side has helped me win more projects. Owners appreciate the transparency."
              </p>
              <p className="font-semibold text-gray-900">Jennifer Chen</p>
              <p className="text-sm text-gray-500">Commercial Estimator</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <p className="text-gray-600 mb-4">
                "The seam treatment section alone is worth it. Finally, accurate calculations for fabric reinforcement and seam coating materials."
              </p>
              <p className="font-semibold text-gray-900">Tom Bradley</p>
              <p className="text-sm text-gray-500">Restoration Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              Use the template on restoration projects. If it doesn't improve your coating estimates and win rates, we'll refund your purchase - no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Your Estimating Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get all roofing templates in one bundle and save $200
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-emerald-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                BEST VALUE - SAVE $200
              </div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">
                All roofing templates including restoration, TPO, metal, and more
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$129</div>
              <div className="text-emerald-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/tpo-template" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TPO/PVC/EPDM Template</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Single-ply membrane roofing estimating for commercial flat roofs
              </p>
              <div className="text-2xl font-bold text-emerald-600 mb-4">$39</div>
              <div className="text-emerald-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/spray-foam" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
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
            Ready to Master Roof Restoration Estimating?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join restoration contractors using our proven coating template for accurate bids
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-emerald-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="restorationCoating"
              text="Buy Restoration Template - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-emerald-200">
              30-Day Money-Back Guarantee • Instant Download
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
