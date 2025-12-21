import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function ProfessionalBundlePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-purple-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SAVE $694 - FOR SERIOUS PROFESSIONALS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Professional Bundle
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8">
                Complete professional tools for construction estimators. Everything in the Starter Bundle plus advanced tools on estimating essentials, AutoCAD submittals, and measurement technology.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$797</span>
                <div>
                  <span className="text-3xl text-blue-200 line-through block">$1,491</span>
                  <span className="text-green-400 font-semibold">Save $694</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="professionalBundle"
                  text="Get Professional Bundle - $797"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors text-lg border-2 border-indigo-600"
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
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="font-bold text-xl mb-2">Professional Bundle Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="font-semibold">Everything in Starter Bundle</span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-blue-500">•</span>
                        <span className="text-xs">Templates, Checklists, Guides</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Estimating Essentials ($497)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>AutoCAD Submittals ($247)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Measurement Technology ($97)</span>
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
              Become a Complete Professional Estimator
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Professional Bundle provides comprehensive tools from beginner to advanced, covering everything you need to excel in commercial construction estimating
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Master the Basics</h3>
              <p className="text-gray-600">
                Complete Estimating Essentials tool teaches you reading plans, understanding specifications, quantity takeoffs, and pricing strategies.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Technical Skills</h3>
              <p className="text-gray-600">
                Master AutoCAD for creating professional shop drawings and submittals, plus modern measurement technology for accurate takeoffs.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Ready</h3>
              <p className="text-gray-600">
                Graduate with the complete skill set needed to work as a professional estimator at a commercial roofing company or GC.
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
              What's Included in the Professional Bundle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Individual value: $1,491 - Bundle price: $797 (Save $694)
            </p>
          </div>

          {/* Starter Bundle Recap */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              Complete Starter Bundle ($404 value)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Template Bundle ($129)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Estimating Checklist ($29)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Proposal Templates ($79)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Lead Gen Guide ($39)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Tech Setup Guide ($29)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">OSHA Guide ($39)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Insurance Guide ($49)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700">Bluebeam Mastery ($147)</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Estimating Essentials */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🎓</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Estimating Essentials Tool</h3>
                    <span className="text-purple-600 font-semibold text-xl">$497 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Complete comprehensive tools covering everything from reading construction drawings to submitting winning bids. The flagship tool of MC2 Estimating.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Reading construction plans and specifications</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Quantity takeoff methods and best practices</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Pricing strategies and cost databases</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Overhead, profit, and contingency planning</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Bid preparation and submission process</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Working with subcontractors and suppliers</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Change orders and contract management</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Real-world project examples and case studies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AutoCAD Submittals */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📐</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">AutoCAD for Construction Submittals</h3>
                    <span className="text-purple-600 font-semibold text-xl">$247 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Master creating professional shop drawings, coordination drawings, and submittal packages using AutoCAD - an essential skill for commercial estimators.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>AutoCAD basics and interface navigation</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Creating shop drawings from architectural plans</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Roof plan layout and detailing</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Section and detail drawings</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Annotation and dimensioning standards</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Creating professional submittal packages</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Coordination with other trades</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>PDF export and plotting best practices</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Measurement Technology */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-purple-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📱</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Measurement Technology Tool</h3>
                    <span className="text-purple-600 font-semibold text-xl">$97 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Master modern measurement technology including aerial measurement services, drones, and laser scanning for fast, accurate takeoffs.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Aerial measurement services (EagleView, HoverView)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Drone-based roof inspections and measurements</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Laser distance meters and measuring tools</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>3D laser scanning technology</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Integrating measurements with estimating software</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Quality control and verification methods</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Cost vs. accuracy analysis for different methods</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Best practices for remote vs. field measurements</span>
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
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bundle Value Breakdown</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Complete Starter Bundle</span>
                <span className="font-semibold text-gray-900">$404</span>
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Estimating Essentials Tool</span>
                <span className="font-semibold text-gray-900">$497</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">AutoCAD Submittals Tool</span>
                <span className="font-semibold text-gray-900">$247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Measurement Technology Tool</span>
                <span className="font-semibold text-gray-900">$97</span>
              </div>
              <div className="border-t-2 border-gray-400 pt-3 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">Total Individual Price:</span>
                <span className="font-bold text-gray-900">$1,491</span>
              </div>
              <div className="flex justify-between items-center text-xl bg-white rounded-lg p-4">
                <span className="font-bold text-purple-600">Professional Bundle Price:</span>
                <span className="font-bold text-purple-600">$797</span>
              </div>
              <div className="flex justify-between items-center text-2xl bg-green-100 rounded-lg p-4">
                <span className="font-bold text-green-700">You Save:</span>
                <span className="font-bold text-green-700">$694 (47% off)</span>
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
              Who Is the Professional Bundle For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Serious Career Changers</h3>
              <p className="text-gray-600 text-sm">
                Committed to transitioning into construction estimating as a long-term career and want comprehensive professional tools.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Advancing Estimators</h3>
              <p className="text-gray-600 text-sm">
                Already doing basic estimates but need formal tools to advance to senior estimator or chief estimator roles.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Commercial Contractors</h3>
              <p className="text-gray-600 text-sm">
                Working in or moving to commercial construction where AutoCAD submittals and formal estimating processes are required.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Project Managers</h3>
              <p className="text-gray-600 text-sm">
                Project managers who want to understand estimating better to improve project planning and cost control.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Construction Professionals</h3>
              <p className="text-gray-600 text-sm">
                Recent construction management graduates or users who want practical, real-world estimating skills employers value.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Field to Office Transition</h3>
              <p className="text-gray-600 text-sm">
                Experienced field workers ready to move into the office and need the technical skills required for estimating roles.
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">How long will it take to complete the Professional Bundle?</h3>
              <p className="text-gray-600">
                Most users complete the Professional Bundle in 2-3 months studying part-time (5-10 hours per week). However, you have lifetime access so you can work at your own pace. Some people finish faster if they're highly motivated.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Do I need AutoCAD already to take the AutoCAD tool?</h3>
              <p className="text-gray-600">
                No! The AutoCAD tool starts from the beginning and assumes no prior experience. You will need to have access to AutoCAD software (or AutoCAD LT), but we cover everything from installation to advanced submittal creation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is this enough to get a job as an estimator?</h3>
              <p className="text-gray-600">
                The Professional Bundle provides the complete skill set needed for entry to mid-level estimating positions. Combined with some industry experience (field work or internships), most users are qualified for estimator roles at roofing contractors or general contractors.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I upgrade to the Master Toolkit later?</h3>
              <p className="text-gray-600">
                Absolutely! If you decide you want the Master Toolkit with SketchUp, Construction Submittals, and Estimating Software tools, we'll credit your Professional Bundle purchase. Just contact us for upgrade pricing.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What's the difference between this and the Starter Bundle?</h3>
              <p className="text-gray-600">
                The Starter Bundle includes templates and guides - great for getting started quickly. The Professional Bundle adds three comprehensive tools (Estimating Essentials, AutoCAD, and Measurement Technology) that provide comprehensive resources on the theory and skills needed to excel as a professional estimator.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is there any ongoing support?</h3>
              <p className="text-gray-600">
                Yes! All bundle purchases include email support. You can ask questions about tool content, templates, or specific estimating scenarios you encounter. We typically respond within 24-48 hours.
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
              We're confident the Professional Bundle will transform your estimating career. If you're not completely satisfied within 30 days, we'll refund your purchase - no questions asked.
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

      {/* Upgrade Option */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Want the Complete Package?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get every product and tool we offer with the Master Toolkit
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Link href="/products/master-toolkit" className="block bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-green-300">
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">SAVE $988 - ULTIMATE VALUE</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Master Toolkit</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Everything in Professional Bundle + SketchUp Visualization, Construction Submittals, and Estimating Software tools. Every single product and tool we offer in one complete package.
              </p>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-bold text-green-600">$997</span>
                <div>
                  <span className="text-2xl text-gray-500 line-through">$1,985</span>
                  <span className="block text-green-600 font-semibold">Save $988</span>
                </div>
              </div>
              <div className="text-green-600 font-semibold text-lg">View Master Toolkit Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Become a Professional Estimator?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get complete professional tools plus all the templates and tools you need to succeed
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$797</span>
              <div className="text-left">
                <span className="text-2xl text-blue-200 line-through block">$1,491</span>
                <span className="text-green-400 font-semibold">Save $694</span>
              </div>
            </div>
            <p className="text-blue-100 mb-6">One-time payment • Lifetime access • All future updates included</p>

            <GumroadCheckoutButton
              productKey="professionalBundle"
              text="Get Professional Bundle - $797"
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
