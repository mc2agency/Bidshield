import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BidShield',
  description: 'BidShield is the pre-submission bid review platform built for commercial roofing estimators. Built by a 12-year estimator to catch what The EDGE, STACK, and Excel miss.',
  keywords: 'about BidShield, commercial roofing estimating, bid QA, pre-submission review, BidShield',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-semibold">
              About BidShield
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Built by an estimator
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">for estimators</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              BidShield is the pre-submission review platform that catches what The EDGE, STACK, and Excel can&apos;t — built after 12 years of commercial roofing estimation.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why BidShield exists</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12">
            <p className="text-xl text-slate-800 leading-relaxed mb-6">
              Estimating software tells you what&apos;s in your bid. Nobody tells you what&apos;s missing from it.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              A missed mechanical curb section on a $3M job costs $47,000. A missed addendum costs $31,000.
              Wrong submittal requirements: $22,000. These aren&apos;t edge cases — they happen every week,
              on bids that looked complete before submission.
            </p>
            <p className="text-lg text-slate-600">
              BidShield is the last line of defense before you submit. It runs every bid through 18 phases
              and 100+ check items — the same review a veteran estimator runs in their head, systematized
              so nothing gets missed when you&apos;re busy.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">What BidShield does</h2>
          <p className="text-lg text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Works alongside your existing estimating software — not instead of it.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">18-Phase Pre-Submission Review</h3>
              <p className="text-slate-600">
                Every bid runs through 18 phases covering scope verification, mechanical systems, addenda,
                submittal requirements, takeoff reconciliation, and bid form completeness. Each phase has
                5–8 specific check items.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bid Readiness Score</h3>
              <p className="text-slate-600">
                Each bid gets a 0–100 readiness score that updates as you complete phases. Know exactly
                where you stand before you submit — not after you win and discover what was missing.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">📐</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Takeoff Reconciliation</h3>
              <p className="text-slate-600">
                Cross-reference your SF quantities against drawings automatically. Flags area discrepancies
                before your bid goes out — not during a GC back-charge conversation.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">40-Item Scope Gap Checker</h3>
              <p className="text-slate-600">
                Runs 40 common scope gap items against your bid — mechanical curbs, edge metal systems,
                drain compatibility, expansion joints, warranty scope, liquidated damages clauses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
            <p className="text-lg font-semibold text-emerald-900 mb-2">
              The EDGE tells you what&apos;s in your bid.
            </p>
            <p className="text-2xl font-bold text-slate-900">
              BidShield tells you what&apos;s missing from it.
            </p>
            <p className="text-slate-600 mt-4">
              No replacement required. Use it on any bid, with any estimating software you already use today.
            </p>
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">By the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">18</div>
              <p className="text-slate-600 font-medium text-sm">Bid phases covered</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100+</div>
              <p className="text-slate-600 font-medium text-sm">Checklist items</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">40</div>
              <p className="text-slate-600 font-medium text-sm">Scope gap checks</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">12yr</div>
              <p className="text-slate-600 font-medium text-sm">Estimating experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Run your next bid through BidShield
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Free to start. One prevented scope gap pays for years of Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Start 14-Day Free Trial — No Card Required
            </Link>
            <Link
              href="/bidshield/demo"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-slate-400 text-white rounded-xl font-semibold text-lg transition-all"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
