'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MeasurementPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resources" className="inline-flex items-center text-blue-200 hover:text-white mb-4 text-sm">
            ← Back to Resource Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
            Free Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Measuring Roofs Without Climbing
          </h1>
          <p className="text-xl text-blue-100">
            Master aerial measurement technologies and remote measurement techniques to accurately measure any roof from the ground.
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
                <a href="#intro" className="block text-sm text-gray-600 hover:text-blue-600">Why Aerial Measurement?</a>
                <a href="#pictometry" className="block text-sm text-gray-600 hover:text-blue-600">Pictometry / EagleView</a>
                <a href="#other-services" className="block text-sm text-gray-600 hover:text-blue-600">Other Services</a>
                <a href="#google-earth" className="block text-sm text-gray-600 hover:text-blue-600">Google Earth (Free)</a>
                <a href="#drones" className="block text-sm text-gray-600 hover:text-blue-600">Drone Measurements</a>
                <a href="#verification" className="block text-sm text-gray-600 hover:text-blue-600">Verification Methods</a>
                <a href="#calculations" className="block text-sm text-gray-600 hover:text-blue-600">Pitch & Calculations</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/resources/roofing-systems" className="text-sm text-blue-600 hover:text-blue-700">
                      → Roofing Systems
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Aerial Measurement?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Gone are the days when estimators had to climb every roof with a tape measure. Modern aerial measurement technology allows you to accurately measure roofs remotely, saving time, reducing liability, and enabling you to bid on projects across the country.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Benefits of Aerial Measurement:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Measure in minutes vs. hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Zero fall risk or liability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Work from your office</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Bid on distant projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Professional reports for clients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Consistent accuracy</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-bold text-blue-900 mb-3">When to Use Aerial vs. Manual:</h4>
                    <div className="space-y-3 text-sm text-blue-800">
                      <div>
                        <strong>Use Aerial:</strong>
                        <p>Commercial flat roofs, large residential, steep pitch, high buildings, bid phase</p>
                      </div>
                      <div>
                        <strong>Use Manual:</strong>
                        <p>Complex details, pre-construction verification, unusual shapes, final verification</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Industry Standard:</strong> Most commercial roofing contractors use aerial measurement for initial estimates, then verify critical dimensions on-site before ordering materials.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pictometry/EagleView */}
              <section id="pictometry" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pictometry / EagleView</h2>

                <button
                  onClick={() => toggleSection('pictometry')}
                  className="w-full text-left mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Click to expand/collapse section</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${activeSection === 'pictometry' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(activeSection === 'pictometry' || activeSection === null) && (
                  <div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      EagleView (formerly Pictometry) is the industry leader in aerial roof measurement. They use high-resolution oblique aerial imagery captured by aircraft to create detailed 3D models and measurement reports.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">How It Works:</h3>
                    <ol className="list-decimal list-inside space-y-3 mb-6 text-gray-700">
                      <li>
                        <strong>Submit Request:</strong> Enter property address on EagleView website or app
                      </li>
                      <li>
                        <strong>Select Report Type:</strong> Choose from Premium, Standard, or QuickSquares
                      </li>
                      <li>
                        <strong>Automated Processing:</strong> AI analyzes aerial imagery to detect roof planes
                      </li>
                      <li>
                        <strong>Human Verification:</strong> Technicians review and refine measurements
                      </li>
                      <li>
                        <strong>Receive Report:</strong> PDF with measurements, diagrams, and waste calculations (typically 24-48 hours)
                      </li>
                    </ol>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Report Types & Pricing:</h3>
                    <div className="space-y-4 mb-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">Premium Report</h4>
                          <span className="text-blue-600 font-bold">$45-75</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Most detailed report. Includes:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Individual roof plane measurements</li>
                          <li>• Ridge, hip, valley, rake, eave lengths</li>
                          <li>• Pitch diagrams for each plane</li>
                          <li>• Waste calculations (typically 10-15%)</li>
                          <li>• Drip edge, starter strip quantities</li>
                          <li>• Annotated aerial photos</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">Standard Report</h4>
                          <span className="text-blue-600 font-bold">$20-35</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Basic measurements. Includes:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Total roof area (with waste)</li>
                          <li>• Basic pitch information</li>
                          <li>• Perimeter measurements</li>
                          <li>• Overhead diagram</li>
                        </ul>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900">QuickSquares</h4>
                          <span className="text-blue-600 font-bold">$10-15</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Quick estimate only. Includes:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Total squares (100 sq ft)</li>
                          <li>• Instant delivery (minutes)</li>
                          <li>• Good for rough budgets</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-6 my-6">
                      <h4 className="font-bold text-gray-900 mb-3">Understanding the Report:</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        EagleView reports break down the roof into individual planes (facets). Each plane shows:
                      </p>
                      <div className="bg-white rounded p-4 font-mono text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Plane 1:</strong>
                            <div>Area: 1,245 sq ft</div>
                            <div>Pitch: 4/12</div>
                            <div>Ridge: 42 ft</div>
                            <div>Eave: 42 ft</div>
                          </div>
                          <div>
                            <strong>Plane 2:</strong>
                            <div>Area: 1,245 sq ft</div>
                            <div>Pitch: 4/12</div>
                            <div>Hip: 35 ft</div>
                            <div>Valley: 18 ft</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-300 font-bold">
                          Total Area: 2,490 sq ft (24.9 squares)
                        </div>
                        <div className="text-green-700">
                          + 10% Waste: 2,739 sq ft (27.4 squares)
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">Accuracy & Limitations:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-bold text-green-900 mb-2">High Accuracy:</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• ±2% on area measurements</li>
                          <li>• ±1-2 degrees on pitch</li>
                          <li>• Excellent for flat roofs</li>
                          <li>• Good for simple pitched roofs</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-bold text-yellow-900 mb-2">Limitations:</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Can miss small details</li>
                          <li>• Tree coverage affects accuracy</li>
                          <li>• Old imagery (1-3 years old)</li>
                          <li>• May miss recent additions</li>
                        </ul>
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
                            <strong>Pro Tip:</strong> Always order an EagleView report if the job is worth more than $5,000. The $50-75 cost is negligible compared to the risk of under-measuring and losing money.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Other Services */}
              <section id="other-services" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Other Aerial Measurement Services</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Nearmap</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Subscription Model</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      High-resolution aerial imagery with frequent updates. More current than EagleView but requires annual subscription (~$2,500/year).
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">Best For:</strong>
                        <p className="text-gray-600">High-volume contractors who measure 100+ roofs/year</p>
                      </div>
                      <div>
                        <strong className="text-gray-900">Advantages:</strong>
                        <p className="text-gray-600">More recent imagery, unlimited measurements, 3D modeling tools</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Hover</h3>
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">App-Based</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Smartphone app that creates 3D models from photos you take on-site. Walk around the building taking photos, and Hover processes them into measurements.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">Best For:</strong>
                        <p className="text-gray-600">Residential contractors, exterior renovations, siding & roofing</p>
                      </div>
                      <div>
                        <strong className="text-gray-900">Pricing:</strong>
                        <p className="text-gray-600">~$35-55 per report, no subscription required</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">RoofSnap</h3>
                      <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">All-in-One Platform</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Complete roofing business platform with integrated aerial measurement. Includes CRM, proposals, contracts, and ordering.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">Best For:</strong>
                        <p className="text-gray-600">Residential roofing companies wanting all-in-one solution</p>
                      </div>
                      <div>
                        <strong className="text-gray-900">Pricing:</strong>
                        <p className="text-gray-600">$99-199/month subscription + per-report fees</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Roofr</h3>
                      <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">Instant Measurements</span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      AI-powered instant measurements. Enter address, get measurements in seconds. Lower accuracy than EagleView but much faster.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">Best For:</strong>
                        <p className="text-gray-600">Quick residential estimates, insurance restoration</p>
                      </div>
                      <div>
                        <strong className="text-gray-900">Pricing:</strong>
                        <p className="text-gray-600">Freemium model, paid plans ~$99/month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Google Earth */}
              <section id="google-earth" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Google Earth (Free Method)</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  For budget-conscious contractors or quick ballpark estimates, Google Earth Pro (free) can provide rough measurements. While not as accurate as paid services, it's useful for screening projects before investing in a detailed report.
                </p>

                <div className="bg-gray-100 rounded-lg p-6 my-6">
                  <h4 className="font-bold text-gray-900 mb-3">Step-by-Step Guide:</h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">1.</span>
                      <div>
                        <strong>Download Google Earth Pro</strong> (free desktop application)
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">2.</span>
                      <div>
                        <strong>Navigate to property address</strong> - Zoom in until roof is clearly visible
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">3.</span>
                      <div>
                        <strong>Use the Polygon tool</strong> (Toolbar → Add Polygon) to trace roof perimeter
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">4.</span>
                      <div>
                        <strong>View area in measurements panel</strong> - Switch units to square feet
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">5.</span>
                      <div>
                        <strong>Apply pitch multiplier</strong> - Multiply by 1.05 (4/12), 1.12 (6/12), or 1.25 (9/12)
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 font-bold text-blue-600">6.</span>
                      <div>
                        <strong>Add 10-15% waste</strong> - Final estimate
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 my-6">
                  <h4 className="font-bold text-yellow-900 mb-2">Accuracy Warning:</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Google Earth measurements can be off by 10-20% depending on:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Image resolution and angle</li>
                    <li>• Roof complexity (many planes vs. simple gable)</li>
                    <li>• Your ability to estimate pitch from aerial view</li>
                    <li>• Overhangs and details not visible from above</li>
                  </ul>
                  <p className="text-sm text-yellow-800 mt-3">
                    <strong>Use Google Earth for:</strong> Preliminary budgets, deciding whether to bid, screening projects. <strong>Never for final material ordering.</strong>
                  </p>
                </div>
              </section>

              {/* Drone Measurements */}
              <section id="drones" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Drone Measurements</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Drones offer a middle ground between manual climbing and aerial imagery services. You capture your own high-resolution images and process them into measurements.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Equipment Needed:</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <strong className="text-gray-900">Consumer Drone (DJI Mini, Mavic)</strong>
                      <p className="text-sm text-gray-600">Good for simple roofs, single-family residential</p>
                    </div>
                    <span className="text-blue-600 font-bold">$500-1,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <strong className="text-gray-900">Professional Drone (DJI Phantom, M300)</strong>
                      <p className="text-sm text-gray-600">Better cameras, more stable, commercial roofs</p>
                    </div>
                    <span className="text-blue-600 font-bold">$1,500-5,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <strong className="text-gray-900">Processing Software (Drone Deploy, Pix4D)</strong>
                      <p className="text-sm text-gray-600">Converts photos into 3D models and measurements</p>
                    </div>
                    <span className="text-blue-600 font-bold">$150-350/month</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">Advantages:</h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• On-demand measurements (no waiting)</li>
                      <li>• Current imagery (not 2 years old)</li>
                      <li>• See roof condition during site visit</li>
                      <li>• Impress clients with technology</li>
                      <li>• Marketing content (aerial photos/video)</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-bold text-red-900 mb-3">Disadvantages:</h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Requires FAA Part 107 license ($175 + study time)</li>
                      <li>• Weather dependent (wind, rain)</li>
                      <li>• Difficulty for flying and processing</li>
                      <li>• Time investment per site</li>
                      <li>• Insurance and liability considerations</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Bottom Line:</strong> Drones make sense if you do 50+ roof measurements per year and want to offer additional services (inspections, marketing content). Otherwise, stick with EagleView.
                  </p>
                </div>
              </section>

              {/* Verification */}
              <section id="verification" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Methods</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Even with the best aerial technology, smart contractors verify critical dimensions before ordering materials. Here's how:
                </p>

                <div className="space-y-4">
                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">1. Ground-Level Verification</h4>
                    <p className="text-gray-700 mb-3">
                      Use a measuring wheel to verify perimeter dimensions. Walk the building and measure eave lengths, building width/length.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                      <strong>What to verify:</strong> Total perimeter, longest continuous runs, building footprint dimensions
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">2. Laser Distance Measurement</h4>
                    <p className="text-gray-700 mb-3">
                      Laser measuring tools (~$50-200) let you measure from the ground to roof edges, parapet heights, etc.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                      <strong>Recommended tools:</strong> Bosch GLM 50, Leica DISTO, Stanley TLM99
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">3. Physical Roof Access (When Safe)</h4>
                    <p className="text-gray-700 mb-3">
                      For low-slope commercial roofs accessible via interior ladder, verify complex areas like:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Expansion joints and transitions</li>
                      <li>• HVAC curb sizes and quantities</li>
                      <li>• Drain locations and types</li>
                      <li>• Parapet cap dimensions</li>
                      <li>• Existing material thickness (core samples)</li>
                    </ul>
                  </div>

                  <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">4. Compare to Architectural Drawings</h4>
                    <p className="text-gray-700">
                      If you have access to plans, cross-reference aerial measurements with drawing dimensions. Look for discrepancies that might indicate additions or errors in the aerial report.
                    </p>
                  </div>
                </div>
              </section>

              {/* Calculations */}
              <section id="calculations" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pitch Multipliers & Calculations</h2>

                <p className="text-gray-700 leading-relaxed mb-4">
                  Understanding roof pitch and how to convert horizontal measurements to actual roof surface area is essential for accurate estimating.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Common Pitch Multipliers:</h3>
                <div className="bg-gray-100 rounded-lg p-6 my-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 font-bold">Pitch</th>
                        <th className="text-left py-2 font-bold">Degrees</th>
                        <th className="text-left py-2 font-bold">Multiplier</th>
                        <th className="text-left py-2 font-bold">Common Use</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Flat (0/12)</td>
                        <td>0°</td>
                        <td className="font-mono">1.00</td>
                        <td>Commercial flat roofs</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">2/12</td>
                        <td>9.5°</td>
                        <td className="font-mono">1.01</td>
                        <td>Low-slope commercial</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">3/12</td>
                        <td>14°</td>
                        <td className="font-mono">1.03</td>
                        <td>Minimum for shingles</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">4/12</td>
                        <td>18.5°</td>
                        <td className="font-mono">1.05</td>
                        <td>Common residential</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">5/12</td>
                        <td>22.5°</td>
                        <td className="font-mono">1.08</td>
                        <td>Residential</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">6/12</td>
                        <td>26.5°</td>
                        <td className="font-mono">1.12</td>
                        <td>Common residential</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">8/12</td>
                        <td>33.5°</td>
                        <td className="font-mono">1.20</td>
                        <td>Steeper residential</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">9/12</td>
                        <td>37°</td>
                        <td className="font-mono">1.25</td>
                        <td>Steep, walkable limit</td>
                      </tr>
                      <tr>
                        <td className="py-2">12/12</td>
                        <td>45°</td>
                        <td className="font-mono">1.41</td>
                        <td>Very steep</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Example Calculation:</h3>
                <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                  <p className="text-gray-700 mb-3">
                    <strong>Scenario:</strong> Residential roof, 40 ft × 30 ft footprint, 6/12 pitch
                  </p>
                  <div className="space-y-2 font-mono text-sm bg-gray-50 p-4 rounded">
                    <div>Step 1: Calculate horizontal area</div>
                    <div className="pl-4">40 ft × 30 ft = 1,200 sq ft</div>
                    <div className="mt-3">Step 2: Apply pitch multiplier (6/12 = 1.12)</div>
                    <div className="pl-4">1,200 × 1.12 = 1,344 sq ft</div>
                    <div className="mt-3">Step 3: Add 10% waste</div>
                    <div className="pl-4">1,344 × 1.10 = 1,478 sq ft</div>
                    <div className="mt-3 pt-3 border-t border-gray-300 font-bold text-blue-600">
                      Final: 1,478 sq ft (14.78 squares)
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
                    <span className="text-gray-700">EagleView Premium reports ($50-75) are the gold standard for commercial estimating</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Google Earth is fine for rough budgets but never for final material orders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Always verify critical dimensions before ordering expensive materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Drones are worth it if you measure 50+ roofs/year, otherwise not cost-effective</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                    <span className="text-gray-700">Know your pitch multipliers - they're critical for accurate area calculations</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Master All Measurement Technologies
                </h3>
                <p className="text-gray-600 mb-6">
                  Get detailed video tutorials for EagleView, Nearmap, Google Earth Pro, and drone measurement. Includes practice exercises, measurement worksheets, and pitch multiplier calculator.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">$97</div>
                  <div className="text-gray-500">One-time purchase</div>
                </div>
                <Link
                  href="/tools/digital-measurement"
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mb-3"
                >
                  Take the Tool →
                </Link>
                <p className="text-sm text-gray-500">Instant access • Badge included • 30-day guarantee</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
