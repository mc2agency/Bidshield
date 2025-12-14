import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-700/50 rounded-full text-sm font-semibold">
              Professional Construction Estimating Training
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Master Roofing Estimation
              <br />
              <span className="text-blue-300">From Takeoff to Profit</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Learn professional estimating skills that take 5 years on the job in just 30 days.
              Templates, courses, and tools used by top contractors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Browse Courses →
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
              >
                View Templates
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-sm max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold">2,500+</div>
                <div className="text-blue-200">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-blue-200">Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-blue-200">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tired of Spending 3 Hours on Every Estimate?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Most contractors waste hours calculating materials, forgetting cost items, and losing money on inaccurate estimates.
                There's a better way.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 text-white text-sm">✓</span>
                  <span className="text-gray-700">Reduce estimate time from 3 hours to 10 minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 text-white text-sm">✓</span>
                  <span className="text-gray-700">Never forget labor burden or general conditions again</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 text-white text-sm">✓</span>
                  <span className="text-gray-700">Professional proposals that win more bids</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 text-white text-sm">✓</span>
                  <span className="text-gray-700">Learn to read plans like a seasoned estimator</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-500">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">Starting at</div>
                <div className="text-5xl font-bold text-blue-600 mb-2">$129</div>
                <div className="text-gray-600">One-time payment</div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Complete Template Bundle</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span> All 5 Roofing System Templates
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span> Complete Estimating Checklist
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span> Professional Proposal Templates
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span> Lifetime Updates
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-500">✓</span> 30-Day Money-Back Guarantee
                </li>
              </ul>
              <Link
                href="/products/template-bundle"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Blocks */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Business System for Contractors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From finding leads to executing projects, we cover everything you need to build a professional contracting business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LearningBlock
              title="Finding Work"
              description="Learn where to find high-quality leads: BuildingConnected, Dodge Reports, and more."
              href="/learning/finding-work"
              icon="📋"
            />
            <LearningBlock
              title="Roof Measurement"
              description="Master Pictometry, EagleView, and digital measurement tools to measure roofs without climbing."
              href="/learning/measurement"
              icon="📏"
            />
            <LearningBlock
              title="Reading Plans & Specs"
              description="Understand construction drawings, specifications, and how to coordinate multi-discipline plans."
              href="/learning/plans-and-specs"
              icon="📐"
            />
            <LearningBlock
              title="Estimating Fundamentals"
              description="Complete estimating process from takeoff to recap. Material pricing, labor burden, general conditions."
              href="/courses/estimating-fundamentals"
              icon="🧮"
            />
            <LearningBlock
              title="Bluebeam Mastery"
              description="Digital takeoff using industry-standard Bluebeam Revu. Measure faster and more accurately."
              href="/courses/bluebeam"
              icon="⚡"
            />
            <LearningBlock
              title="Roofing Systems"
              description="Deep dive into TPO, EPDM, SBS, metal, tile, and green roofs. System-specific calculations."
              href="/learning/roofing-systems"
              icon="🏗️"
            />
            <LearningBlock
              title="Proposal Writing"
              description="Professional proposal templates for every system. Win more bids with compelling proposals."
              href="/products/proposal-templates"
              icon="📄"
            />
            <LearningBlock
              title="Submittals & Shop Drawings"
              description="Create submittals, shop drawings, and project documentation using AutoCAD and SketchUp."
              href="/courses/submittals"
              icon="📊"
            />
            <LearningBlock
              title="Business Operations"
              description="Insurance, OSHA compliance, technology setup, and everything you need to run a professional business."
              href="/learning/business-operations"
              icon="💼"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Estimating?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get instant access to professional templates, courses, and tools. Start saving time and making accurate estimates today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              View All Products →
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg border-2 border-blue-600"
            >
              Join MC2 Pro - $197/mo
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            30-day money-back guarantee • Instant access • Lifetime updates
          </p>
        </div>
      </section>
    </main>
  );
}

function LearningBlock({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-500"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
        Learn More →
      </div>
    </Link>
  );
}
