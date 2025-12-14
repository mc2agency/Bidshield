import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About MC2 Estimating Academy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              The premier online training platform for roofing and restoration estimators.
              From finding leads to winning bids to executing projects - we teach the complete system.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Mission</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-8 mb-8">
              <p className="text-xl text-gray-800 leading-relaxed mb-6">
                To empower construction professionals with the skills, tools, and knowledge needed to excel
                in roofing and restoration estimating - building profitable businesses through accurate
                estimates, winning proposals, and professional project execution.
              </p>
              <p className="text-lg text-gray-700">
                We believe that estimating is both an art and a science. It requires technical knowledge,
                business acumen, and the right technology. MC2 Estimating Academy provides all three.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                MC2 Estimating Academy was founded by experienced construction estimators and project managers
                who saw a critical gap in the industry: there was no comprehensive training program that taught
                the <em>complete</em> estimating and business development system.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Most estimators learn on the job through trial and error, making costly mistakes along the way.
                Books and traditional courses focus on isolated topics - plan reading OR software OR roofing
                systems - but never the full end-to-end process.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We built MC2 Estimating Academy to change that. Our curriculum covers the complete business
                system that professional estimators use every day:
              </p>
              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600 mb-6">
                <ol className="space-y-2 text-gray-800">
                  <li><strong>1. Find the Work</strong> - Lead generation, bid invitations, and project tracking</li>
                  <li><strong>2. Develop Accurate Estimates</strong> - Plan reading, measurement, material takeoff, pricing</li>
                  <li><strong>3. Win the Bid</strong> - Professional proposals, competitive pricing strategies</li>
                  <li><strong>4. Execute the Project</strong> - Submittals, shop drawings, project management</li>
                  <li><strong>5. Run a Professional Business</strong> - Insurance, compliance, safety, profitability</li>
                </ol>
              </div>
              <p className="text-lg text-gray-700">
                Today, MC2 Estimating Academy serves thousands of construction professionals - from entry-level
                estimators learning the fundamentals to experienced contractors expanding into new markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4 text-blue-900">Complete System Approach</h3>
                <p className="text-gray-800">
                  We don't just teach isolated skills - we teach the complete business system from lead
                  generation to project closeout. You'll learn how all the pieces fit together.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-green-300">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-2xl font-bold mb-4 text-green-900">Roofing-Specific Content</h3>
                <p className="text-gray-800">
                  Every course, template, and guide is tailored specifically for roofing and restoration
                  contractors. No generic construction content - just what you actually need.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border-2 border-purple-300">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-2xl font-bold mb-4 text-purple-900">Modern Technology Training</h3>
                <p className="text-gray-800">
                  Learn the latest tools and software - Bluebeam, AutoCAD, EagleView, AI estimating, and
                  more. We stay current with industry technology.
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border-2 border-orange-300">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-2xl font-bold mb-4 text-orange-900">Ready-to-Use Templates</h3>
                <p className="text-gray-800">
                  Get professional templates, checklists, and tools you can use immediately in your business.
                  No theory-only training - just practical, usable resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Expertise</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <p className="text-lg text-gray-700 mb-6">
                Our instructors and content creators bring decades of combined experience:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>Senior estimators with experience on $500M+ in commercial roofing projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>Certified Bluebeam and AutoCAD instructors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>Licensed contractors and construction project managers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>Expertise across all major roofing systems (TPO, EPDM, PVC, SBS, shingle, metal, tile)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 font-bold mr-3">✓</span>
                  <span>Experience with commercial, residential, industrial, and restoration projects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                <p className="text-gray-700 font-semibold">Students Trained</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">14</div>
                <p className="text-gray-700 font-semibold">Learning Blocks</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
                <p className="text-gray-700 font-semibold">Courses & Products</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
                <p className="text-gray-700 font-semibold">Hours of Training</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Estimating?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of construction professionals who have transformed their estimating skills
            and built more profitable businesses with MC2 Estimating Academy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Join MC2 Pro - $197/mo →
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg border-2 border-blue-600"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
