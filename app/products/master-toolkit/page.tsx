import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function MasterToolkitPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                SAVE $988 - ULTIMATE PACKAGE
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Master Toolkit
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8">
                Every single product and tool we offer in one comprehensive package. From complete beginner to expert estimator - this is everything you need to master construction estimating.
              </p>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-6xl font-bold">$997</span>
                <div>
                  <span className="text-3xl text-green-200 line-through block">$1,985</span>
                  <span className="text-yellow-400 font-semibold">Save $988</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GumroadCheckoutButton
                  productKey="masterToolkit"
                  text="Get Master Toolkit - $997"
                  variant="large"
                />
                <a
                  href="#whats-included"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors text-lg border-2 border-emerald-600"
                >
                  See Everything Included
                </a>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Instant Access to Everything</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="bg-white rounded-lg p-6 mb-4">
                  <div className="text-gray-900 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="font-bold text-xl mb-2">Master Toolkit Includes:</h3>
                    <div className="text-left space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="font-semibold">Everything in Professional Bundle</span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-blue-500">•</span>
                        <span className="text-xs">All templates, guides & 3 tools</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>SketchUp Visualization ($97)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Construction Submittals ($197)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Estimating Software ($197)</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold">Every Product & Tool We Offer</span>
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
              The Complete Construction Estimating Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From zero to expert - the Master Toolkit is the most comprehensive construction estimating resource program available
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Every Template</h3>
              <p className="text-gray-600">
                All roofing templates, checklists, and proposal systems for immediate professional estimates.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Every Tool</h3>
              <p className="text-gray-600">
                Complete resources from estimating essentials to advanced software and visualization techniques.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Every Guide</h3>
              <p className="text-gray-600">
                All business guides covering leads, technology, safety, insurance, and compliance.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Launch</h3>
              <p className="text-gray-600">
                Graduate with the complete skill set to work as a senior estimator or start your own contracting business.
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
              Everything Included in Master Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Individual value: $1,985 - Toolkit price: $997 (Save $988)
            </p>
          </div>

          {/* Professional Bundle Recap */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl p-8 mb-8 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-3xl">💼</span>
              Complete Professional Bundle ($1,491 value)
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Templates & Tools:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Template Bundle ($129)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Estimating Checklist ($29)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Proposal Templates ($79)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Guides:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Lead Gen Guide ($39)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Tech Setup Guide ($29)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>OSHA Guide ($39)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Insurance Guide ($49)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Core Tools:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Bluebeam Mastery ($147)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Estimating Essentials ($497)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>AutoCAD Submittals ($247)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Measurement Technology ($97)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">+ Advanced Tools</h3>
            <p className="text-gray-600">Complete your mastery with these additional specialized tools</p>
          </div>

          <div className="space-y-6">
            {/* SketchUp */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-green-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">🏗️</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">SketchUp Visualization Tool</h3>
                    <span className="text-green-600 font-semibold text-xl">$97 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Create 3D visualizations of your roofing projects for better client presentations and design coordination. Master the most popular 3D modeling software in construction.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>SketchUp basics and interface</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>3D modeling techniques for roofing</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Materials and textures application</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Creating client presentation renderings</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Exporting to AutoCAD and Bluebeam</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Design coordination and clash detection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Construction Submittals */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-green-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">📋</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Construction Submittals Tool</h3>
                    <span className="text-green-600 font-semibold text-xl">$197 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Master the complete submittal process from product data sheets to shop drawings. See what GCs and architects expect and how to get submittals approved quickly.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Understanding submittal requirements in specs</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Product data and cut sheet organization</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Shop drawing creation and formatting</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Submittal logs and tracking systems</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>RFI process and clarifications</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Samples and mock-ups coordination</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Working with manufacturers and reps</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Resubmittal strategies and best practices</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estimating Software */}
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-green-300">
              <div className="flex items-start gap-6">
                <div className="text-5xl">💻</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Estimating Software Tool</h3>
                    <span className="text-green-600 font-semibold text-xl">$197 Value</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Master the major estimating software platforms used in commercial construction including STACK, PlanSwift, On-Screen Takeoff, and cloud-based solutions.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Overview of estimating software platforms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>STACK construction takeoff and estimating</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>PlanSwift digital takeoff techniques</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>On-Screen Takeoff workflows</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Building custom assemblies and databases</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Integration with accounting systems</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Choosing the right software for your business</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>ROI analysis and implementation planning</span>
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Master Toolkit Value Breakdown</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Complete Professional Bundle</span>
                <span className="font-semibold text-gray-900">$1,491</span>
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">SketchUp Visualization Tool</span>
                <span className="font-semibold text-gray-900">$97</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Construction Submittals Tool</span>
                <span className="font-semibold text-gray-900">$197</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Estimating Software Tool</span>
                <span className="font-semibold text-gray-900">$197</span>
              </div>
              <div className="border-t-2 border-gray-400 pt-3 flex justify-between items-center text-lg">
                <span className="font-bold text-gray-900">Total Individual Price:</span>
                <span className="font-bold text-gray-900">$1,985</span>
              </div>
              <div className="flex justify-between items-center text-xl bg-white rounded-lg p-4">
                <span className="font-bold text-green-600">Master Toolkit Price:</span>
                <span className="font-bold text-green-600">$997</span>
              </div>
              <div className="flex justify-between items-center text-2xl bg-yellow-100 rounded-lg p-4">
                <span className="font-bold text-green-700">You Save:</span>
                <span className="font-bold text-green-700">$988 (50% off)</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 mt-4 text-center">
              <p className="text-gray-900 font-semibold">That's every single product and tool we offer - nothing held back!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who Is Master Toolkit For?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">All-In Users</h3>
              <p className="text-gray-600 text-sm">
                Committed to becoming an expert estimator and want the most comprehensive tools available. You want to master everything, not just pieces.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Future Chief Estimators</h3>
              <p className="text-gray-600 text-sm">
                Aspiring to lead an estimating department or become chief estimator at a commercial contractor. Need comprehensive skills across all areas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Contractors Starting a Business</h3>
              <p className="text-gray-600 text-sm">
                Planning to start your own roofing company and need to understand every aspect of estimating, bidding, and project coordination.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Career Accelerators</h3>
              <p className="text-gray-600 text-sm">
                Want to advance your career as quickly as possible by gaining comprehensive skills that typically take years to acquire on the job.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Complete Professionals</h3>
              <p className="text-gray-600 text-sm">
                Want to be a well-rounded construction professional who understands estimating, submittals, visualization, and all project phases.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Best Value Seekers</h3>
              <p className="text-gray-600 text-sm">
                Know you'll eventually want all our tools and want the best possible price. Save $988 versus buying individually.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Path */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Journey
            </h2>
            <p className="text-xl text-gray-600">
              Suggested path from beginner to expert (3-6 months at your own pace)
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Foundation (Weeks 1-4)</h3>
                <p className="text-gray-600">Start with Estimating Essentials and Bluebeam Mastery. Use the templates to practice on real projects. Read the business guides to understand the industry.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Skills (Weeks 5-8)</h3>
                <p className="text-gray-600">Master AutoCAD for Submittals and Measurement Technology. Master creating shop drawings and use modern measurement tools for accurate takeoffs.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Specialization (Weeks 9-12)</h3>
                <p className="text-gray-600">Complete SketchUp Visualization, Construction Submittals, and Estimating Software tools. Master the advanced skills that set you apart from other estimators.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-World Application (Ongoing)</h3>
                <p className="text-gray-600">Apply everything you've mastered to real projects. Use the templates and systems daily. Continue refining your skills with lifetime access to all content and updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How long does it take to complete the Master Toolkit?</h3>
              <p className="text-gray-600">
                Most dedicated users complete everything in 3-6 months studying 10-15 hours per week. However, you have lifetime access so you can take as long as you need. Many people start applying what they get immediately while still working through the tools.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is this really everything you offer?</h3>
              <p className="text-gray-600">
                Yes! The Master Toolkit includes every single product, template, guide, and tool we've created. Nothing is held back. If we create new products in the future, you'll get access to those too as part of your lifetime updates.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Do I need any software before starting?</h3>
              <p className="text-gray-600">
                You'll need Microsoft Excel (or Google Sheets) for the templates. For the tools, you'll eventually need Bluebeam Revu, AutoCAD (or AutoCAD LT), and SketchUp. Most have free trials, and we provide guidance on getting educational or subscription pricing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I really go from beginner to expert with this?</h3>
              <p className="text-gray-600">
                The Master Toolkit provides all the knowledge and skills you need. Combined with hands-on practice (estimating real projects), most users develop expert-level capabilities. Many graduates are working as senior estimators or running their own companies.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What if I already own some of your products?</h3>
              <p className="text-gray-600">
                Contact us! We'll create a custom upgrade price that credits what you've already purchased. We want to make sure you get the best value and we'll work with you on pricing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is there any support included?</h3>
              <p className="text-gray-600">
                Yes! Email support is included for life. You can ask questions about tool content, how to use templates, or get advice on specific estimating situations. We're committed to your success.
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
              We're so confident the Master Toolkit will transform your career that we offer a full 30-day money-back guarantee. If you're not completely satisfied, just email us for a full refund - no questions asked.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Instant Access to Everything</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Email Support for Life</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>No Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Bundle Options */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Not Ready for the Complete Package?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We also offer smaller bundles to get you started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/products/starter-bundle" className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-blue-200">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $107</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Bundle</h3>
              <p className="text-gray-600 mb-4">
                Templates, guides, and Bluebeam tools. Perfect for getting started with professional estimating.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-blue-600">$297</span>
                <span className="text-xl text-gray-500 line-through">$404</span>
              </div>
              <div className="text-blue-600 font-semibold">View Details →</div>
            </Link>

            <Link href="/products/professional-bundle" className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-2 border-purple-200">
              <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">SAVE $694</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Bundle</h3>
              <p className="text-gray-600 mb-4">
                Everything in Starter + Estimating Essentials, AutoCAD, and Measurement Technology tools.
              </p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-purple-600">$797</span>
                <span className="text-xl text-gray-500 line-through">$1,491</span>
              </div>
              <div className="text-purple-600 font-semibold">View Details →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Master Construction Estimating?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get lifetime access to every product and tool we offer - the most comprehensive construction estimating education available
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-4">
              <span className="text-6xl font-bold">$997</span>
              <div className="text-left">
                <span className="text-2xl text-green-200 line-through block">$1,985</span>
                <span className="text-yellow-400 font-semibold text-xl">Save $988</span>
              </div>
            </div>
            <p className="text-green-100 mb-6">One-time payment • Lifetime access • All future products included</p>

            <GumroadCheckoutButton
              productKey="masterToolkit"
              text="Get Master Toolkit - $997"
              variant="large"
            />

            <p className="mt-6 text-sm text-green-200">
              30-Day Money-Back Guarantee • Instant Access to Everything
            </p>
          </div>

          <p className="text-sm text-green-200">
            Questions? <Link href="/contact" className="underline hover:text-white">Contact us</Link> - we're here to help!
          </p>
        </div>
      </section>
    </main>
  );
}
