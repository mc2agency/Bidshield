import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function InsuranceGuidePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-blue-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                PROTECT YOUR BUSINESS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Insurance & Compliance Guide for Contractors
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Complete guide to contractor insurance requirements, compliance, bonding, and risk management. Understand what coverage you need and how to meet GC and owner requirements.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$49</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="insuranceGuide"
                  text="Buy Guide - $49"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors text-lg border-2 border-indigo-600"
                >
                  See What's Inside
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-gray-900">
                    <div className="text-6xl mb-4 text-center">🛡️</div>
                    <h3 className="font-bold text-xl mb-4 text-center">You'll Learn:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Required insurance types and coverage limits</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>How bonding works and when you need it</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Compliance requirements by project type</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>How to reduce insurance costs legally</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Insurance & Compliance Confusion
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Not sure what insurance coverage you actually need</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>GCs reject your COI because limits are too low</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Don't understand bonding requirements or how to get bonded</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Overpaying for insurance you don't need</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Protect Your Business Properly
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Know exactly what coverage you need for your work</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Meet GC and owner insurance requirements confidently</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Understand bonding and get qualified for bonded work</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Reduce insurance costs through proper risk management</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Inside the Guide
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Insurance Coverage</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">General Liability Insurance</h4>
                    <p className="text-gray-600 text-sm">What it covers, typical limits ($1M/$2M vs $2M/$4M), per-occurrence vs aggregate, and when you need umbrella coverage</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Workers' Compensation</h4>
                    <p className="text-gray-600 text-sm">State requirements, how rates are calculated by class code, experience modification (mod rate), and legal requirements by state</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Commercial Auto Insurance</h4>
                    <p className="text-gray-600 text-sm">Coverage for company vehicles, hired/non-owned auto coverage, and minimum limits required by GCs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Builder's Risk & Tools</h4>
                    <p className="text-gray-600 text-sm">When you need builder's risk, inland marine for tools/equipment, and installation floaters</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional Liability (E&O)</h4>
                    <p className="text-gray-600 text-sm">Errors and omissions coverage for design-build or consultant work</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Bonding & Compliance</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Performance & Payment Bonds</h4>
                    <p className="text-gray-600 text-sm">How bonding works, the three C's (character, capacity, capital), and how to get bonded for the first time</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bid Bonds & Consent of Surety</h4>
                    <p className="text-gray-600 text-sm">Understanding bid bond requirements, consent of surety, and dual obligee bonds</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Certificates of Insurance (COI)</h4>
                    <p className="text-gray-600 text-sm">How to read and request COIs, additional insured endorsements, and waiver of subrogation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Prevailing Wage & Certified Payroll</h4>
                    <p className="text-gray-600 text-sm">Davis-Bacon Act requirements, prevailing wage compliance, and certified payroll reporting</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">DBE/MBE/WBE Requirements</h4>
                    <p className="text-gray-600 text-sm">Understanding diversity requirements on government projects and how to get certified</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Risk Management Strategies</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Safety Programs</h4>
                <p className="text-gray-700 text-sm">Implementing safety programs to reduce claims and lower your workers' comp mod rate</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contract Review</h4>
                <p className="text-gray-700 text-sm">Identifying unfavorable insurance clauses and negotiating better terms in subcontracts</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Claims Management</h4>
                <p className="text-gray-700 text-sm">Handling claims properly to minimize premium increases and protect your loss history</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Format */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">File Format</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-bold text-gray-900 mb-2">PDF Guide</h3>
                <p className="text-gray-600 text-sm">Comprehensive 50+ page guide</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-bold text-gray-900 mb-2">Checklists</h3>
                <p className="text-gray-600 text-sm">Insurance review and compliance checklists</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-gray-900 mb-2">Templates</h3>
                <p className="text-gray-600 text-sm">COI request letters and bond applications</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Who Is This For?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New Contractors</h3>
              <p className="text-gray-600 text-sm">
                Starting out and need to understand insurance requirements
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Growing Companies</h3>
              <p className="text-gray-600 text-sm">
                Expanding into commercial work and need higher coverage limits
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Government Bidders</h3>
              <p className="text-gray-600 text-sm">
                Pursuing bonded government work and need to understand requirements
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Cost-Conscious Owners</h3>
              <p className="text-gray-600 text-sm">
                Want to reduce insurance costs without sacrificing necessary coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How to Use This Guide</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Current Coverage</h3>
                <p className="text-gray-600">Use the insurance checklist to audit your current policies. Identify any gaps in coverage or limits that are too low.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Understand Requirements</h3>
                <p className="text-gray-600">Read the sections relevant to your work (residential, commercial, government). Learn what coverage levels you need to qualify for your target projects.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Talk to Your Agent</h3>
                <p className="text-gray-600">Have an informed conversation with your insurance agent. Use the guide to ask specific questions and get proper coverage at competitive rates.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Implement Risk Management</h3>
                <p className="text-gray-600">Use the risk management strategies to reduce claims and lower your insurance costs over time while protecting your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-lg text-gray-700">
              Review your coverage with this guide. If it doesn't help you understand your insurance needs better, full refund within 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complete Your Business Toolkit</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/products/osha-safety-guide" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">OSHA Safety Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">Roofing safety requirements and compliance</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/lead-generation-guide" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lead Generation Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">Find construction leads and build GC relationships</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">BEST VALUE</div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">All estimating templates and tools</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Protect Your Business Properly</h2>
          <p className="text-xl text-blue-100 mb-8">Understand insurance, bonding, and compliance requirements</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$49</span>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="insuranceGuide"
              text="Buy Insurance Guide - $49"
              variant="large"
            />

            <p className="mt-6 text-sm text-blue-200">30-Day Money-Back Guarantee • Instant Download</p>
          </div>

          <p className="text-sm text-blue-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
