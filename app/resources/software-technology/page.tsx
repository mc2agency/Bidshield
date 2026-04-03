import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimating Software & Technology Guide for Roofers | BidShield',
  description: 'The complete guide to software tools professional roofing estimators use. Covers Bluebeam, STACK, The EDGE, aerial measurement, and AI estimating tools.',
  keywords: 'roofing estimating software, Bluebeam for roofers, STACK estimating, roofing technology, construction software guide',
  alternates: { canonical: 'https://www.bidshield.co/resources/software-technology' },
};

export default function SoftwareTechnologyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/resources" className="inline-flex items-center text-slate-300 hover:text-white mb-4 text-sm">
            ← Back to Resource Center
          </Link>
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 rounded-full text-sm font-semibold text-emerald-300">
            Free Resource
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Estimating Software & Technology
          </h1>
          <p className="text-xl text-slate-300">
            The complete guide to software tools that professional estimators use to work faster and more accurately.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#takeoff" className="block text-sm text-gray-600 hover:text-emerald-600">Takeoff Software</a>
                <a href="#measurement" className="block text-sm text-gray-600 hover:text-emerald-600">Measurement Tools</a>
                <a href="#estimating" className="block text-sm text-gray-600 hover:text-emerald-600">Estimating Platforms</a>
                <a href="#spreadsheets" className="block text-sm text-gray-600 hover:text-emerald-600">Spreadsheet Tools</a>
                <a href="#hardware" className="block text-sm text-gray-600 hover:text-emerald-600">Hardware Setup</a>
                <a href="#comparison" className="block text-sm text-gray-600 hover:text-emerald-600">Software Comparison</a>
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Related Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/tools/bluebeam-mastery" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Bluebeam Mastery Tool
                    </Link>
                  </li>
                  <li>
                    <Link href="/products/tech-setup-guide" className="text-sm text-emerald-600 hover:text-emerald-700">
                      → Tech Setup Guide
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-8">

              {/* Introduction */}
              <section className="mb-12">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Modern estimating requires a technology stack that enables speed, accuracy, and collaboration. This guide covers the essential software and hardware every professional estimator needs.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Investment Tip:</strong> A proper technology setup costs $2,000-$5,000 upfront but pays for itself quickly through time savings and accuracy improvements.
                  </p>
                </div>
              </section>

              {/* Takeoff Software */}
              <section id="takeoff" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Digital Takeoff Software</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-4">
                      <h3 className="text-xl font-bold">Bluebeam Revu</h3>
                      <p className="text-blue-100 text-sm">Industry Standard • $349/year</p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        The most widely used PDF markup and takeoff tool in construction. Essential for commercial estimating.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Area, length, count measurements</li>
                            <li>• Custom formulas and calculations</li>
                            <li>• Excel export capabilities</li>
                            <li>• Cloud collaboration (Studio)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Best For</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Commercial roofing takeoffs</li>
                            <li>• Multi-discipline coordination</li>
                            <li>• RFI and submittal markup</li>
                            <li>• Team collaboration</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-700 text-white px-6 py-4">
                      <h3 className="text-xl font-bold">PlanSwift</h3>
                      <p className="text-gray-300 text-sm">Alternative Option • $1,595 one-time</p>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        Popular alternative with good material/labor assembly features. One-time purchase vs subscription.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Assemblies</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Bid Templates</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">One-time Cost</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Measurement Tools */}
              <section id="measurement" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Aerial Measurement Tools</h2>
                <p className="text-gray-700 mb-6">
                  Measure roofs remotely without climbing. Essential for bid estimates and verification.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border-2 border-emerald-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">EagleView</h3>
                    <p className="text-sm text-gray-600 mb-3">Premium reports with detailed measurements, 3D views, and pitch analysis.</p>
                    <div className="text-emerald-600 font-semibold">$15-50 per report</div>
                  </div>
                  <div className="p-6 bg-white border-2 border-blue-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Pictometry/Nearmap</h3>
                    <p className="text-sm text-gray-600 mb-3">Subscription-based aerial imagery with measurement tools built in.</p>
                    <div className="text-blue-600 font-semibold">$200-500/month</div>
                  </div>
                  <div className="p-6 bg-white border-2 border-purple-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Google Earth Pro</h3>
                    <p className="text-sm text-gray-600 mb-3">Free tool for basic measurements and site visualization. Limited accuracy.</p>
                    <div className="text-purple-600 font-semibold">Free</div>
                  </div>
                  <div className="p-6 bg-white border-2 border-amber-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">RoofSnap / Hover</h3>
                    <p className="text-sm text-gray-600 mb-3">Residential-focused with quick turnaround. Good for shingle re-roofs.</p>
                    <div className="text-amber-600 font-semibold">$15-30 per report</div>
                  </div>
                </div>
              </section>

              {/* Estimating Platforms */}
              <section id="estimating" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Full Estimating Platforms</h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-4 font-bold text-gray-900">Platform</th>
                        <th className="text-left p-4 font-bold text-gray-900">Best For</th>
                        <th className="text-left p-4 font-bold text-gray-900">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="p-4 font-semibold">The Edge (Estimating Edge)</td>
                        <td className="p-4 text-gray-600">Roofing contractors, comprehensive</td>
                        <td className="p-4 text-gray-600">$500-1,500/month</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">STACK Construction</td>
                        <td className="p-4 text-gray-600">Cloud-based, collaboration</td>
                        <td className="p-4 text-gray-600">$299/month+</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">ProEst</td>
                        <td className="p-4 text-gray-600">Large contractors, integrations</td>
                        <td className="p-4 text-gray-600">$500+/month</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Buildertrend</td>
                        <td className="p-4 text-gray-600">Residential, project management</td>
                        <td className="p-4 text-gray-600">$99-499/month</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Spreadsheet Tools */}
              <section id="spreadsheets" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Spreadsheet-Based Estimating</h2>
                <p className="text-gray-700 mb-6">
                  Many successful estimators use Excel or Google Sheets with custom templates. This approach is flexible and cost-effective.
                </p>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Advantages of Template-Based Estimating</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> Full control over calculations
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> Easy to customize for your business
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> No monthly subscription fees
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> Works with any takeoff software
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> Easy to share and collaborate
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <span className="text-emerald-500">✓</span> Proven by thousands of contractors
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                  <h3 className="font-bold text-xl mb-2">Get Professional Excel Templates</h3>
                  <p className="text-emerald-100 mb-4">5 roofing system templates + checklist + proposals. Ready to use.</p>
                  <Link href="/products/template-bundle" className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                    Get Bundle - $129
                  </Link>
                </div>
              </section>

              {/* Hardware */}
              <section id="hardware" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Hardware Recommendations</h2>

                <div className="space-y-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3">🖥️ Computer Requirements</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Processor:</strong> Intel i5/i7 or AMD Ryzen 5/7</li>
                      <li><strong>RAM:</strong> 16GB minimum, 32GB recommended for large plans</li>
                      <li><strong>Storage:</strong> 512GB SSD minimum</li>
                      <li><strong>Graphics:</strong> Dedicated GPU helpful for CAD work</li>
                    </ul>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3">🖨️ Large Format Printer</h3>
                    <p className="text-gray-700 mb-3">For printing construction drawings at full size (24&quot; or 36&quot; wide).</p>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• HP DesignJet T-series: $1,500-3,000</li>
                      <li>• Canon imagePROGRAF: $2,000-4,000</li>
                      <li>• Consider local print shops for occasional needs</li>
                    </ul>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3">📺 Dual Monitor Setup</h3>
                    <p className="text-gray-700">Essential for estimating - plans on one screen, spreadsheet on the other. Two 27&quot; monitors recommended.</p>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Need Help Setting Up Your Tech Stack?</h2>
                <p className="text-slate-300 mb-6">
                  Our Tech Setup Guide walks you through everything step by step.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products/tech-setup-guide" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Tech Setup Guide - $29
                  </Link>
                  <Link href="/tools/estimating-software" className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20">
                    Software Mastery Tool - $197
                  </Link>
                </div>
              </section>

            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
