import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | MC2 Estimating',
  description: 'MC2 Estimating sells professional roofing estimating tools contractors use to build accurate bids faster. Templates, calculators, and workflow tools.',
  keywords: 'about MC2, estimating tools, roofing templates, construction estimating tools',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              About Us
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              About
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">MC2 Estimating</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Professional roofing estimating tools contractors use to build accurate bids faster.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-slate-900">Our Mission</h2>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 md:p-12 shadow-xl">
              <p className="text-xl text-slate-800 leading-relaxed mb-6">
                To provide construction professionals with ready-to-use tools that make roofing estimation
                faster, more accurate, and more profitable - without the steep curve of building
                systems from scratch.
              </p>
              <p className="text-lg text-slate-600">
                We believe estimators shouldn&apos;t have to reinvent the wheel. Our templates, calculators,
                and checklists give you a professional foundation you can customize for your business.
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
                MC2 Estimating was founded by experienced construction estimators and project managers
                who saw a critical gap in the industry: contractors were wasting hours building
                estimation spreadsheets from scratch, making costly mistakes, and losing bids.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We built the tools we wished we had when we started - professional templates with
                built-in formulas, comprehensive checklists that prevent missed costs, and
                proposal systems that win more work.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Today, MC2 Estimating provides ready-to-use tools to thousands of contractors across
                the country. Our products are designed to deliver value immediately - download,
                customize with your pricing, and start bidding.
              </p>
              <div className="bg-emerald-50 rounded-lg p-6 border-l-4 border-emerald-600 mb-6">
                <p className="text-lg font-semibold text-emerald-900 mb-2">What We Provide:</p>
                <ol className="space-y-2 text-gray-800">
                  <li><strong>1. Estimating Templates</strong> - Pre-built spreadsheets for every major roofing system</li>
                  <li><strong>2. Checklists</strong> - Comprehensive cost item lists to prevent missed expenses</li>
                  <li><strong>3. Calculators</strong> - Material and labor calculators with waste factors</li>
                  <li><strong>4. Proposal Templates</strong> - Professional documents that win more bids</li>
                  <li><strong>5. Business Guides</strong> - Reference materials for compliance and operations</li>
                </ol>
              </div>
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
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-8 border-2 border-emerald-300">
                <div className="text-4xl mb-4">🛠️</div>
                <h3 className="text-2xl font-bold mb-4 text-emerald-900">Tools, Not Sections</h3>
                <p className="text-gray-800">
                  We sell ready-to-use tools, not explanations. Every product provides immediate
                  value - download and start using the same day.
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 border-2 border-teal-300">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-2xl font-bold mb-4 text-teal-900">Roofing-Specific</h3>
                <p className="text-gray-800">
                  Every template and calculator is tailored specifically for roofing and restoration
                  contractors. No generic construction tools here.
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-8 border-2 border-cyan-300">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-2xl font-bold mb-4 text-cyan-900">Industry Standard Formats</h3>
                <p className="text-gray-800">
                  Excel-based templates work with the software you already use. No proprietary
                  systems or expensive subscriptions required.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border-2 border-slate-300">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Immediate Value</h3>
                <p className="text-gray-800">
                  Every product is designed to save you time on your very first use. Built-in
                  formulas and checklists work right out of the box.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Built By Experts</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <p className="text-lg text-gray-700 mb-6">
                Our tools are built by professionals with decades of combined experience:
              </p>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="text-emerald-600 font-bold mr-3">✓</span>
                  <span>Senior estimators with experience on $500M+ in commercial roofing projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 font-bold mr-3">✓</span>
                  <span>Licensed contractors and construction project managers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 font-bold mr-3">✓</span>
                  <span>Expertise across all major roofing systems (TPO, EPDM, PVC, SBS, shingle, metal, tile)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 font-bold mr-3">✓</span>
                  <span>Experience with commercial, residential, industrial, and restoration projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 font-bold mr-3">✓</span>
                  <span>Proficiency with industry tools like Bluebeam, AutoCAD, EagleView, and more</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">By the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-200">
                <div className="text-4xl font-bold text-emerald-600 mb-2">2,500+</div>
                <p className="text-gray-700 font-semibold">Active Users</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
                <div className="text-4xl font-bold text-teal-600 mb-2">17+</div>
                <p className="text-gray-700 font-semibold">Professional Tools</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-200">
                <div className="text-4xl font-bold text-cyan-600 mb-2">8</div>
                <p className="text-gray-700 font-semibold">Roofing Systems</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                <div className="text-4xl font-bold text-slate-600 mb-2">4.9/5</div>
                <p className="text-gray-700 font-semibold">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Estimate Faster?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Join thousands of contractors who save hours every week with MC2 Estimating tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-lg"
            >
              Browse Tools
            </Link>
            <Link
              href="/products/template-bundle"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-lg"
            >
              Get Template Bundle - $129
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
