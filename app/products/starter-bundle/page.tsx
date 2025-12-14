import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function StarterBundlePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SAVE $107 - PERFECT FOR GETTING STARTED
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Starter Bundle
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Everything you need to launch your construction estimating career. Complete templates, guides, and foundational training to start creating professional estimates immediately.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$297</span>
                <div>
                  <span className="text-3xl text-blue-200 line-through block">$404</span>
                  <span className="text-green-400 font-semibold">Save $107</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="starterBundle"
                  text="Get Starter Bundle - $297"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
                >
                  See What's Included
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Instant Access</span>
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
                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="text-gray-900 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="font-bold text-xl mb-2">Starter Bundle Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Template Bundle ($129)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Estimating Checklist ($29)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Proposal Templates ($79)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Lead Gen Guide ($39)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Tech Setup Guide ($29)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>OSHA Guide ($39)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Insurance Guide ($49)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Bluebeam Mastery ($147)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Launch Your Estimating Career Right
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Starter Bundle gives you all the essential tools and knowledge to begin creating professional estimates from day one
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Templates</h3>
              <p className="text-gray-600">
                All 5 roofing system templates plus estimating checklists and proposal templates. Start estimating professionally from your first project.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Essential Training</h3>
              <p className="text-gray-600">
                Bluebeam Mastery course teaches you the industry-standard PDF markup and takeoff software used on commercial projects.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Foundations</h3>
              <p className="text-gray-600">
                Learn how to find leads, set up your tech stack, stay safe and compliant, and protect your business with proper insurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Detailed */}
      <section id="whats-included" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What's Included in the Starter Bundle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Individual value: $404 - Bundle price: $297 (Save $107)
            </p>
          </div>

          <div className="space-y-6">
            {/* Template Bundle */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📦</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Complete Template Bundle</h3>
                    <span className="text-blue-600 font-semibold">$129 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    All 5 roofing system templates with automated calculations, material takeoffs, and labor estimators.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Asphalt Shingle Template</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>TPO/PVC/EPDM Template</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Metal Roofing Template</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Tile Roofing Template</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Spray Foam Template</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estimating Checklist */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">✅</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Estimating Checklist</h3>
                    <span className="text-blue-600 font-semibold">$29 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Comprehensive checklist ensures you never miss a cost item. Covers materials, labor, equipment, and general conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Proposal Templates */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📄</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Proposal Templates</h3>
                    <span className="text-blue-600 font-semibold">$79 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Professional proposal templates for 8 roofing systems, cover letters, scope of work language, and payment terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Lead Generation Guide */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📋</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Lead Generation Guide</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Learn where to find construction leads, how to build relationships with general contractors, and get invited to bid on projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Tech Setup Guide */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💻</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Technology Setup Guide</h3>
                    <span className="text-blue-600 font-semibold">$29 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Complete guide to setting up your estimating workstation, software recommendations, and productivity tools for construction professionals.
                  </p>
                </div>
              </div>
            </div>

            {/* OSHA Guide */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">⚠️</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">OSHA Safety Guide</h3>
                    <span className="text-blue-600 font-semibold">$39 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Roofing-specific OSHA regulations, fall protection requirements, safety program templates, and compliance checklists.
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance Guide */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🛡️</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Insurance & Compliance Guide</h3>
                    <span className="text-blue-600 font-semibold">$49 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Everything you need to know about contractor insurance, bonding, certificates of insurance, and risk management strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Bluebeam Mastery */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-500">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🎓</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Bluebeam Mastery Course</h3>
                    <span className="text-blue-600 font-semibold">$147 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Complete video training on Bluebeam Revu - the industry-standard PDF software for takeoffs, markups, and plan management.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>PDF markup and annotation tools</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Measurement and takeoff techniques</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Custom tools and palettes</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Plan comparison and collaboration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Comparison */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bundle Value Breakdown</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Template Bundle</span>
                <span className="font-semibold text-gray-900">$129</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Estimating Checklist</span>
                <span className="font-semibold text-gray-900">$29</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Proposal Templates</span>
                <span className="font-semibold text-gray-900">$79</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Lead Gen Guide</span>
                <span className="font-semibold text-gray-900">$39</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tech Setup Guide</span>
                <span className="font-semibold text-gray-900">$29</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">OSHA Guide</span>
                <span className="font-semibold text-gray-900">$39</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Insurance Guide</span>
                <span className="font-semibold text-gray-900">$49</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Bluebeam Mastery Course</span>
                <span className="font-semibold text-gray-900">$147</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">Total Individual Price:</span>
                <span className="font-bold text-gray-900">$404</span>
              </div>
              <div className="flex justify-between items-center text-xl bg-white rounded-lg p-4">
                <span className="font-bold text-blue-600">Starter Bundle Price:</span>
                <span className="font-bold text-blue-600">$297</span>
              </div>
              <div className="flex justify-between items-center text-2xl bg-green-100 rounded-lg p-4">
                <span className="font-bold text-green-700">You Save:</span>
                <span className="font-bold text-green-700">$107</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is the Starter Bundle For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">New Estimators</h3>
              <p className="text-gray-600 text-sm">
                Just starting your construction estimating career and need professional templates and foundational knowledge to hit the ground running.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Career Changers</h3>
              <p className="text-gray-600 text-sm">
                Transitioning into construction estimating from field work or another industry and want to learn the business side quickly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Small Contractors</h3>
              <p className="text-gray-600 text-sm">
                Running a small roofing company and need to professionalize your estimating process without breaking the bank.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Residential to Commercial</h3>
              <p className="text-gray-600 text-sm">
                Moving from residential to commercial work and need to understand the business requirements and professional standards.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Self-Learners</h3>
              <p className="text-gray-600 text-sm">
                Want to learn construction estimating on your own time without expensive courses or formal training programs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Need Results Fast</h3>
              <p className="text-gray-600 text-sm">
                Have an estimate due soon and need professional templates and training to create accurate bids immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is this bundle good for complete beginners?</h3>
              <p className="text-gray-600">
                Absolutely! The Starter Bundle is specifically designed for people new to construction estimating. The templates guide you through the process step-by-step, and the guides explain all the business fundamentals you need to know.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What if I already have some of these products?</h3>
              <p className="text-gray-600">
                If you've already purchased individual products, contact us and we'll create a custom bundle discount for you based on what you already own. We want to make sure you get the best value.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I upgrade to a bigger bundle later?</h3>
              <p className="text-gray-600">
                Yes! If you want to upgrade to the Professional Bundle or Complete Academy later, we'll credit your Starter Bundle purchase toward the upgrade. Just contact us when you're ready.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What file formats do I get?</h3>
              <p className="text-gray-600">
                Templates are provided in Excel (.xlsx) format and work with both Microsoft Excel and Google Sheets. Guides are PDF format. Courses are video-based with downloadable resources.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How long do I have access?</h3>
              <p className="text-gray-600">
                Lifetime access! Once you purchase the Starter Bundle, you own it forever. You'll also get all future updates to the templates and guides at no additional cost.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What if I'm not satisfied?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If the Starter Bundle doesn't meet your expectations, just email us within 30 days for a full refund.
              </p>
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
              We're confident the Starter Bundle will help you launch your estimating career. If you're not completely satisfied within 30 days, we'll refund your purchase - no questions asked.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Email Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>No Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Want More Training?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Consider these larger bundles for comprehensive estimating education
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/products/professional-bundle" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-300">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $694</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Bundle</h3>
              <p className="text-gray-600 mb-4">
                Everything in Starter + Estimating Fundamentals, AutoCAD Submittals, and Measurement Technology courses.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-blue-600">$797</span>
                <span className="text-xl text-gray-500 line-through">$1,491</span>
              </div>
              <div className="text-blue-600 font-semibold">Learn More →</div>
            </Link>

            <Link href="/products/complete-academy" className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-green-300">
              <div className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $988 - BEST VALUE</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Academy</h3>
              <p className="text-gray-600 mb-4">
                Everything in Professional + SketchUp, Construction Submittals, and Estimating Software. Every product and course we offer.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-green-600">$997</span>
                <span className="text-xl text-gray-500 line-through">$1,985</span>
              </div>
              <div className="text-green-600 font-semibold">Learn More →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Estimating Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get everything you need to create professional estimates and launch your construction career
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$297</span>
              <div className="text-left">
                <span className="text-2xl text-blue-200 line-through block">$404</span>
                <span className="text-green-400 font-semibold">Save $107</span>
              </div>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • All future updates included</p>

            <GumroadCheckoutButton
              productKey="starterBundle"
              text="Get Starter Bundle - $297"
              variant="large"
            />

            <p className="mt-6 text-sm text-blue-200">
              30-Day Money-Back Guarantee • Instant Access
            </p>
          </div>

          <p className="text-sm text-blue-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
