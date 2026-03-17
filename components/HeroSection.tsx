import Link from 'next/link';

/**
 * HeroSection Component
 *
 * Product-first hero for MC2 Estimating homepage.
 * Features: gradient headline, dual CTAs, stats display, dark theme with grid overlay.
 * Fully responsive and accessible.
 */
export default function HeroSection() {
  return (
    <section
      aria-label="MC2 Estimating hero"
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden"
    >
      {/* Subtle grid pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:64px_64px]"
      />

      {/* Decorative gradient orbs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      {/* Main content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-slate-300 border border-white/10 mb-8">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Professional Roofing Estimating Tools
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Build Accurate Bids
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              Faster Than Ever
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Professional estimating templates, calculators, and checklists used by top roofing contractors.
            Download and start using immediately.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            role="group"
            aria-label="Call to action buttons"
          >
            {/* Primary CTA */}
            <Link
              href="/products"
              className="group inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
            >
              View Templates
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/products/template-bundle"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:border-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300"
            >
              Get the Bundle
            </Link>
          </div>

          {/* Stats Section */}
          <div
            className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
            role="list"
            aria-label="Key statistics"
          >
            {/* Stat 1: Active Users */}
            <div className="group text-center" role="listitem">
              <div
                className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                2,500+
              </div>
              <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">
                Active Users
              </div>
            </div>

            {/* Stat 2: Average Rating */}
            <div className="group text-center" role="listitem">
              <div
                className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-yellow-500/20 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                4.9/5
              </div>
              <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">
                Average Rating
              </div>
            </div>

            {/* Stat 3: Satisfaction */}
            <div className="group text-center" role="listitem">
              <div
                className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-teal-500/20 rounded-xl text-teal-400 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-teal-400 transition-colors">
                100%
              </div>
              <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">
                Satisfaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
