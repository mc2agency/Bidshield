import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function OSHAGuidePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-900 via-red-800 to-yellow-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SAFETY & COMPLIANCE
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                OSHA Safety Guide for Roofing Contractors
              </h1>
              <p className="text-xl sm:text-2xl text-orange-100 mb-8">
                Complete guide to OSHA fall protection requirements, safety standards, and compliance for roofing contractors. Keep your crew safe and avoid costly citations.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$39</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="oshaGuide"
                  text="Buy Guide - $39"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-lg border-2 border-red-600"
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
                    <div className="text-6xl mb-4 text-center">⚠️</div>
                    <h3 className="font-bold text-xl mb-4 text-center">You'll Get:</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Fall protection requirements for roofing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Required safety equipment and requirements</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>How to avoid OSHA citations and fines</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Site-specific safety plan templates</span>
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
                OSHA Violations Are Costly
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Fall protection violations = $7,000+ per serious citation</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Worker injuries cost thousands in lost time and insurance claims</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>Not sure what fall protection system to use when</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <span>GCs require safety programs you don't have</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Work Safely & Compliant
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Understand exactly what OSHA requires for roofing work</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Implement proper fall protection systems and training</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Avoid costly citations and reduce insurance premiums</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Meet GC safety requirements and prequalify for larger projects</span>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fall Protection Requirements</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Personal Fall Arrest Systems</h4>
                    <p className="text-gray-600 text-sm">Harnesses, lanyards, anchors, and lifelines - what's required and how to use them properly</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Guardrail Systems</h4>
                    <p className="text-gray-600 text-sm">Height requirements, strength specifications, and when guardrails are the best option</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Safety Net Systems</h4>
                    <p className="text-gray-600 text-sm">When safety nets are required, proper installation height and mesh requirements</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Warning Line Systems</h4>
                    <p className="text-gray-600 text-sm">Low-slope roof work within 6 feet of edge - proper setup and limitations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Residential Construction Exception</h4>
                    <p className="text-gray-600 text-sm">When and how residential roofers can use alternative fall protection (1926.501(b)(13))</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Safety Programs & Compliance</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Written Safety Program</h4>
                    <p className="text-gray-600 text-sm">Template for comprehensive company safety program including fall protection plan</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Competent Person Training</h4>
                    <p className="text-gray-600 text-sm">Requirements for competent person designation, tools, and responsibilities on site</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Daily Safety Inspections</h4>
                    <p className="text-gray-600 text-sm">Checklist for daily fall protection equipment and jobsite inspections</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ladder Safety Requirements</h4>
                    <p className="text-gray-600 text-sm">Proper ladder setup, 3-point contact, and load limits per OSHA standards</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Emergency Response Plan</h4>
                    <p className="text-gray-600 text-sm">Fall rescue procedures and emergency contact protocols required by OSHA</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-orange-50 border-2 border-orange-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Safety Topics</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">PPE Requirements</h4>
                <p className="text-gray-700 text-sm">Hard hats, safety glasses, gloves, and proper footwear requirements for roofing work</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Hot Work & Fire Prevention</h4>
                <p className="text-gray-700 text-sm">Requirements for torch-down work, fire extinguishers, and hot work permits</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Hazard Communication</h4>
                <p className="text-gray-700 text-sm">SDS requirements for chemicals, labeling, and employee training (HazCom)</p>
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
                <p className="text-gray-600 text-sm">Comprehensive 45+ page guide</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-gray-900 mb-2">Checklists</h3>
                <p className="text-gray-600 text-sm">Daily inspection and safety checklists</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-bold text-gray-900 mb-2">Templates</h3>
                <p className="text-gray-600 text-sm">Safety program and training documentation</p>
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
              <div className="text-4xl mb-4">👷</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">All Roofing Contractors</h3>
              <p className="text-gray-600 text-sm">
                OSHA applies to everyone - residential and commercial contractors
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Safety Managers</h3>
              <p className="text-gray-600 text-sm">
                Need to develop or improve company safety programs
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">GC Subcontractors</h3>
              <p className="text-gray-600 text-sm">
                Required to have written safety programs for commercial work
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Crew Leaders</h3>
              <p className="text-gray-600 text-sm">
                Training to become competent person for fall protection
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
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Understand Fall Protection Options</h3>
                <p className="text-gray-600">Read the fall protection section to understand when each system (guardrails, PFAS, safety nets) is required or appropriate.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Written Safety Program</h3>
                <p className="text-gray-600">Use the templates to develop your company's written safety program and fall protection plan. Customize for your operations.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Train Your Crew</h3>
                <p className="text-gray-600">Use the guide to conduct safety meetings and designate competent persons. Document all training per OSHA requirements.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Implement Daily Inspections</h3>
                <p className="text-gray-600">Use the inspection checklists daily to verify equipment and jobsite conditions. Maintain documentation for compliance.</p>
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
              Review OSHA requirements with this guide. If it doesn't help you understand safety compliance better, full refund within 30 days.
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
            <Link href="/products/insurance-compliance-guide" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Insurance & Compliance Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">Everything about contractor insurance and bonding</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$49</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/lead-generation-guide" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lead Generation Guide</h3>
              <p className="text-gray-600 mb-4 text-sm">Find construction leads and build GC relationships</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$39</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/template-bundle" className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-600">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold mb-3">BEST VALUE</div>
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Template Bundle</h3>
              <p className="text-gray-600 mb-4 text-sm">All estimating templates and tools</p>
              <div className="text-2xl font-bold text-blue-600 mb-4">$129</div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-900 via-red-800 to-yellow-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Keep Your Crew Safe & Compliant</h2>
          <p className="text-xl text-orange-100 mb-8">Understand OSHA requirements and avoid costly citations</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$39</span>
            </div>
            <p className="text-orange-100 mb-6">One-time payment • Lifetime access • Free updates</p>

            <GumroadCheckoutButton
              productKey="oshaGuide"
              text="Buy OSHA Safety Guide - $39"
              variant="large"
            />

            <p className="mt-6 text-sm text-orange-200">30-Day Money-Back Guarantee • Instant Download</p>
          </div>

          <p className="text-sm text-orange-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
