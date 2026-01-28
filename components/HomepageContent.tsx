'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import EmailCapture from '@/components/EmailCapture';

export default function HomepageContent() {
  const { t } = useLanguage();

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
              {t('hero.badge')}
            </div>

            {/* Heading with gradient */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t('hero.title1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                {t('hero.title2')}
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
              >
                {t('hero.cta1')}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/products/template-bundle"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                {t('hero.cta2')}
              </Link>
            </div>

            {/* Credibility */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">17+</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">{t('stats.tools')}</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">8</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">{t('stats.systems')}</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">3h→10m</div>
                <div className="text-slate-400 text-sm mt-1 group-hover:text-slate-300 transition-colors">{t('stats.time')}</div>
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
                {t('problem.title1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                  {t('problem.title2')}
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {t('problem.desc')}
              </p>
              <ul className="space-y-5">
                {[
                  t('problem.benefit1'),
                  t('problem.benefit2'),
                  t('problem.benefit3'),
                  t('problem.benefit4'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-20" />
              <div className="relative bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {t('bundle.popular')}
                  </span>
                </div>
                <div className="text-center mb-8 pt-4">
                  <div className="text-sm text-slate-500 mb-2">{t('bundle.starting')}</div>
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    $99
                  </div>
                  <div className="text-slate-600">{t('bundle.onetime')} • Save $133</div>
                </div>
                <h3 className="text-xl font-bold mb-6 text-center text-slate-900">{t('bundle.title')}</h3>
                <ul className="space-y-4 mb-8">
                  {[
                    t('bundle.feature1'),
                    t('bundle.feature2'),
                    t('bundle.feature3'),
                    t('bundle.feature4'),
                    t('bundle.feature5'),
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
                  {t('bundle.cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* BidShield Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full mb-4">
              {t('bidshield.new')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('bidshield.title1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                {t('bidshield.title2')}
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t('bidshield.desc')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '📋', title: t('bidshield.feature1'), desc: t('bidshield.feature1.desc') },
              { icon: '🛡️', title: t('bidshield.feature2'), desc: t('bidshield.feature2.desc') },
              { icon: '💰', title: t('bidshield.feature3'), desc: t('bidshield.feature3.desc') },
              { icon: '👷', title: t('bidshield.feature4'), desc: t('bidshield.feature4.desc') },
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/bidshield"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
            >
              Learn More About BidShield
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('email.title')}</h2>
          <p className="text-lg text-slate-600 mb-8">{t('email.desc')}</p>
          <EmailCapture />
          <p className="text-sm text-slate-500 mt-4">{t('email.note')}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-xl text-emerald-100 mb-8">{t('cta.desc')}</p>
          <Link
            href="/products/template-bundle"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors"
          >
            {t('bundle.cta')}
          </Link>
          <p className="text-sm text-emerald-200 mt-6">{t('cta.guarantee')}</p>
        </div>
      </section>
    </main>
  );
}
