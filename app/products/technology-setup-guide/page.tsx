import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function TechnologySetupGuidePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-purple-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
              TECH SETUP
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Complete Technology Setup Guide
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8">
              Build your professional estimating technology stack on any budget. From computer specs to software recommendations, backup solutions to internet requirements.
            </p>

            <div className="flex items-baseline justify-center gap-4 mb-8">
              <span className="text-6xl font-bold">$29</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <GumroadCheckoutButton
                productKey="techSetupGuide"
                text="Get the Tech Guide - $29"
                variant="large"
              />
              <a
                href="#whats-included"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
              >
                See What's Included
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm justify-center">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Budget Breakdowns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Software Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What's Included</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-200">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-bold mb-4">Computer Specifications</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Estimating workstation specs</strong> - CPU, RAM, storage requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>CAD workstation specs</strong> - For AutoCAD and SketchUp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Windows vs Mac considerations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Desktop vs laptop recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Monitor setup (dual monitors, size, resolution)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-4">Software Budget Breakdown</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Starter budget</strong> ($500-1,000/year)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Professional budget</strong> ($2,000-3,500/year)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Enterprise budget</strong> ($5,000+/year)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>One-time vs subscription cost comparison</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Free alternatives and trials</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-200">
              <div className="text-4xl mb-4">🖨️</div>
              <h3 className="text-xl font-bold mb-4">Large Format Printing</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>When you need a plotter (24", 36", 42")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Plotter recommendations by budget</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Outsourcing print shop options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Paper, ink, and maintenance costs</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-200">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-bold mb-4">Backup & Data Protection</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Cloud backup solutions (Dropbox, Google Drive, OneDrive)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Local backup strategies (NAS, external drives)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>3-2-1 backup rule explained</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Data recovery planning</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-center">Plus: Internet & Connectivity</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Minimum internet speed requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Business vs residential internet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>VPN setup for remote work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Mobile hotspot backup planning</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Budget Tiers */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Complete Setup Budgets</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$2,500</div>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Entry-level laptop/desktop</li>
                <li>✓ Basic software (Bluebeam, Excel)</li>
                <li>✓ Cloud storage (100GB)</li>
                <li>✓ Single monitor setup</li>
                <li>✓ Home internet</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-500">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$6,500</div>
              <ul className="space-y-3 text-gray-700">
                <li>✓ High-performance workstation</li>
                <li>✓ Full software suite (Bluebeam, AutoCAD, Office)</li>
                <li>✓ Cloud + local backup (1TB)</li>
                <li>✓ Dual 27" monitor setup</li>
                <li>✓ Business internet</li>
                <li>✓ 24" plotter (optional)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$12,000+</div>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Premium CAD workstation</li>
                <li>✓ Enterprise software licenses</li>
                <li>✓ NAS + cloud backup (unlimited)</li>
                <li>✓ Triple monitor setup</li>
                <li>✓ Fiber internet connection</li>
                <li>✓ 36"+ plotter</li>
                <li>✓ Network server (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Who This Guide Is For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ New Estimators</h3>
              <p className="text-gray-700">Setting up your first professional estimating workstation</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Growing Companies</h3>
              <p className="text-gray-700">Outfitting multiple estimators with the right technology</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Tech Upgrades</h3>
              <p className="text-gray-700">Modernizing outdated equipment and software</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Budget Planning</h3>
              <p className="text-gray-700">Understanding costs before making technology investments</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Build Your Professional Tech Stack
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the complete guide to setting up your estimating technology on any budget. Make smart investments that pay off.
          </p>
          <GumroadCheckoutButton
            productKey="techSetupGuide"
            text="Get the Technology Setup Guide - $29"
            variant="large"
          />
          <p className="text-sm text-blue-200 mt-4">
            30-day money-back guarantee • Instant download
          </p>
        </div>
      </section>
    </main>
  );
}
