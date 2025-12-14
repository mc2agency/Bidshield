import Link from 'next/link';
import GumroadCheckoutButton from '@/components/GumroadCheckoutButton';

export default function LeadGenGuidePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-green-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
              ESSENTIAL GUIDE
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Lead Generation Playbook
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8">
              Stop waiting for leads. Learn the complete system for finding construction projects, tracking opportunities, and building relationships with general contractors.
            </p>

            <div className="flex items-baseline justify-center gap-4 mb-8">
              <span className="text-6xl font-bold">$39</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <GumroadCheckoutButton
                productKey="leadGenGuide"
                text="Get the Guide - $39"
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
                <span>Step-by-Step System</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Lead Tracking Template</span>
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
            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-4">Online Bid Platforms</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>BuildingConnected</strong> (Autodesk Construction Cloud) - Complete tutorial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Dodge Construction Network</strong> - Setup and usage guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>PlanHub, iSqFt, BidClerk</strong> - Platform comparisons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Best practices for each platform</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-4">Government Bid Sources</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>SAM.gov registration</strong> - Step-by-step process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>State and local bid portals by region</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Federal procurement opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>DBE/MBE/WBE certification guidance</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-4">Relationship Building</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>GC prospecting strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Getting on architect vendor lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Networking at industry events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Follow-up systems that work</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 border-2 border-blue-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-4">Lead Tracking System</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Excel tracking template</strong> (included)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Lead qualification criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Bid/no-bid decision framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Win/loss analysis system</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-center">Plus: Digital Marketing for Leads</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Website optimization for contractors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>LinkedIn prospecting strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Google Business Profile setup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Email marketing basics</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Who This Guide Is For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ New Contractors</h3>
              <p className="text-gray-700">Just starting out and need to build a pipeline of bidding opportunities</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Growing Companies</h3>
              <p className="text-gray-700">Looking to scale beyond word-of-mouth and referrals</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Estimators</h3>
              <p className="text-gray-700">Want to understand where leads come from and how to qualify them</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-3">✓ Sales Teams</h3>
              <p className="text-gray-700">Need a systematic approach to finding and tracking opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop Waiting for Leads to Find You
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the complete playbook for finding construction leads and building a consistent pipeline of opportunities.
          </p>
          <GumroadCheckoutButton
            productKey="leadGenGuide"
            text="Get the Lead Generation Playbook - $39"
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
