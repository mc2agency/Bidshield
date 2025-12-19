import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-slate-300 border border-white/10 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Professional Roofing Estimating Tools
            </div>

            {/* Heading with gradient */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Build Accurate Bids
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Faster Than Ever
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Professional estimating templates, calculators, and checklists used by top roofing contractors.
              Download and start using immediately.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
              >
                View Templates
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/products/template-bundle"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                Get the Bundle
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">2,500+</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">Active Users</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">4.9/5</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">Average Rating</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">100%</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Tired of Spending 3 Hours on{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                  Every Estimate?
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most contractors waste hours calculating materials, forgetting cost items, and losing money on inaccurate estimates.
                There&apos;s a better way.
              </p>
              <ul className="space-y-5">
                {[
                  'Reduce estimate time from 3 hours to 10 minutes',
                  'Never forget labor burden or general conditions again',
                  'Professional proposals that win more bids',
                  'Pre-built formulas handle all calculations automatically',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mt-0.5 text-white text-sm shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      ✓
                    </span>
                    <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-20" />
              <div className="relative bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-8 pt-4">
                  <div className="text-sm text-slate-500 mb-2">Starting at</div>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    $129
                  </div>
                  <div className="text-slate-600">One-time payment</div>
                </div>
                <h3 className="text-xl font-bold mb-6 text-center text-slate-900">Complete Template Bundle</h3>
                <ul className="space-y-4 mb-8">
                  {[
                    'All 5 Roofing System Templates',
                    'Complete Estimating Checklist',
                    'Professional Proposal Templates',
                    'Lifetime Updates',
                    '30-Day Money-Back Guarantee',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/products/template-bundle"
                  className="block w-full text-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-300"
                >
                  Get Instant Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                Estimate Faster
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional tools designed by estimators, for estimators. Download and start using immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductBlock
              title="Roofing Templates"
              description="Complete Excel templates with built-in formulas for TPO, EPDM, metal, tile, shingle, and more."
              href="/products/template-bundle"
              icon="📊"
            />
            <ProductBlock
              title="Estimating Checklist"
              description="Never miss a line item again. Comprehensive checklist covers every cost category."
              href="/products/estimating-checklist"
              icon="✅"
            />
            <ProductBlock
              title="Proposal Templates"
              description="Professional proposal templates that help you win more bids. Ready to customize."
              href="/products/proposal-templates"
              icon="📄"
            />
            <ProductBlock
              title="Material Calculators"
              description="Built-in calculators for waste factors, coverage rates, and material quantities."
              href="/products"
              icon="🧮"
            />
            <ProductBlock
              title="Labor Worksheets"
              description="Pre-configured labor burden and crew productivity worksheets."
              href="/products"
              icon="👷"
            />
            <ProductBlock
              title="MC2 Pro Access"
              description="Get access to the complete tool vault with all templates and ongoing updates."
              href="/membership"
              icon="🔐"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Estimate{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Like a Pro?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Get instant access to professional templates, calculators, and tools. Start saving time and winning more bids today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Browse All Tools
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
            >
              Get MC2 Pro Access - $197/mo
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            30-day money-back guarantee • Instant download • Lifetime updates
          </p>
        </div>
      </section>
    </main>
  );
}

function ProductBlock({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">{description}</p>
        <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
          View Details
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
