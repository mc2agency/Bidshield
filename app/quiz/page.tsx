import Link from 'next/link';

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Find Your Perfect Tools
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Answer a few quick questions to discover which estimating tools are right for your needs.
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
                <h3 className="text-lg font-bold mb-4">1. What type of roofing do you primarily estimate?</h3>
                <div className="space-y-3">
                  <Link href="/products/asphalt-shingle" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">Residential Shingle</div>
                    <div className="text-sm text-gray-600">Asphalt shingles for homes</div>
                  </Link>
                  <Link href="/products/tpo-template" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">Commercial Single-Ply</div>
                    <div className="text-sm text-gray-600">TPO, PVC, EPDM systems</div>
                  </Link>
                  <Link href="/products/metal-roofing" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">Metal Roofing</div>
                    <div className="text-sm text-gray-600">Standing seam and corrugated</div>
                  </Link>
                  <Link href="/products" className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-gray-900">Multiple Types</div>
                    <div className="text-sm text-gray-600">I work on various roofing systems</div>
                  </Link>
                </div>
              </div>

              {/* Recommendations by Need */}
              <div>
                <h3 className="text-lg font-bold mb-4">Or choose by what you need:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/products/template-bundle" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-bold text-gray-900 mb-2">Estimating Templates</div>
                    <div className="text-sm text-gray-600">Excel templates with formulas</div>
                  </Link>

                  <Link href="/products/estimating-checklist" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="font-bold text-gray-900 mb-2">Estimating Checklist</div>
                    <div className="text-sm text-gray-600">Never miss a cost item</div>
                  </Link>

                  <Link href="/products/proposal-templates" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="font-bold text-gray-900 mb-2">Proposal Templates</div>
                    <div className="text-sm text-gray-600">Win more bids</div>
                  </Link>

                  <Link href="/products/lead-generation-guide" className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="font-bold text-gray-900 mb-2">Finding Work</div>
                    <div className="text-sm text-gray-600">Lead generation guide</div>
                  </Link>
                </div>
              </div>

              {/* Bundle Option */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-3">Want Everything?</h3>
                <p className="text-blue-100 mb-6">
                  Get all templates, checklists, and guides in the Complete Bundle and save $988.
                </p>
                <div className="text-4xl font-bold mb-2">$997<span className="text-xl text-blue-200 line-through ml-2">$1,985</span></div>
                <Link
                  href="/products/complete-bundle"
                  className="inline-block px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors mt-4"
                >
                  View Complete Bundle →
                </Link>
              </div>

              {/* Back to Products */}
              <div className="text-center pt-4">
                <Link href="/products" className="text-blue-600 hover:text-blue-700 font-semibold">
                  ← View All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
