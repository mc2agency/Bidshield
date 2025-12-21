import Link from 'next/link';

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Find Your Perfect Getting Started Path
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Answer a few quick questions to discover which tools are right for your experience level and career goals.
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Quick Tool Finder</h2>

            <div className="space-y-8">
              {/* Question 1 */}
              <div className="border-b pb-8">
                <h3 className="text-lg font-bold mb-4">1. What's your current experience level with construction estimating?</h3>
                <div className="space-y-3">
                  <Link href="/tools/beginner" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">I'm brand new</div>
                    <div className="text-sm text-gray-600">No estimating experience yet</div>
                  </Link>
                  <Link href="/tools/intermediate" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">I have some experience</div>
                    <div className="text-sm text-gray-600">I've done basic estimates but want to improve</div>
                  </Link>
                  <Link href="/tools/advanced" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">I'm experienced</div>
                    <div className="text-sm text-gray-600">Looking to master advanced tools and techniques</div>
                  </Link>
                </div>
              </div>

              {/* Recommendations by Goal */}
              <div>
                <h3 className="text-lg font-bold mb-4">Or choose by your goal:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/tools/estimating-essentials" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">🧮</div>
                    <div className="font-bold text-gray-900 mb-2">Master the Basics</div>
                    <div className="text-sm text-gray-600">Complete foundation tool</div>
                  </Link>

                  <Link href="/tools/bluebeam-mastery" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="font-bold text-gray-900 mb-2">Master Bluebeam</div>
                    <div className="text-sm text-gray-600">Digital takeoff mastery</div>
                  </Link>

                  <Link href="/tools/autocad-submittals" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">📐</div>
                    <div className="font-bold text-gray-900 mb-2">Create Shop Drawings</div>
                    <div className="text-sm text-gray-600">AutoCAD for contractors</div>
                  </Link>

                  <Link href="/tools/measurement-technology" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">📏</div>
                    <div className="font-bold text-gray-900 mb-2">Aerial Measurements</div>
                    <div className="text-sm text-gray-600">Pictometry, EagleView, etc.</div>
                  </Link>
                </div>
              </div>

              {/* All Access Option */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-3">Want Everything?</h3>
                <p className="text-blue-100 mb-6">
                  Join MC2 Pro and get access to all 7 tools, templates, and live Q&A sessions.
                </p>
                <div className="text-4xl font-bold mb-2">$197<span className="text-xl text-blue-200">/month</span></div>
                <Link
                  href="/membership"
                  className="inline-block px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors mt-4"
                >
                  View MC2 Pro Membership →
                </Link>
              </div>

              {/* Back to Tools */}
              <div className="text-center pt-4">
                <Link href="/tools" className="text-blue-600 hover:text-blue-700 font-semibold">
                  ← Back to All Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
