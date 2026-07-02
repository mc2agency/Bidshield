import Link from "next/link";
import type { Metadata } from "next";
import PricingCards from "./PricingCards";
import StickyBar from "./StickyBar";
import ChecklistAccordion from "./ChecklistAccordion";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "BidShield Pricing — Bid QA for Commercial Roofing Estimators",
  description:
    "BidShield is $249/mo or $2,490/yr for full Pro access. 18 phases, AI scope gap detection, takeoff reconciliation. 14-day free trial, no card required.",
  keywords:
    "BidShield pricing, bid QA tool, commercial roofing bid review, pre-submission checklist, roofing estimating software pricing",
  alternates: { canonical: "https://www.bidshield.co/bidshield/pricing" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { q: "What's included in Pro?", a: "Everything: 18-phase checklist, AI scope gap detection, takeoff reconciliation, addenda tracking, spec analysis, unlimited projects, PDF export." },
    { q: "What's the difference between monthly and annual?", a: "Same Pro features either way. Annual billing is $2,490/year — that's ~$208/mo effective, saving you $498 versus paying monthly." },
    { q: "What does the free trial include?", a: "Full Pro access for 14 days, no credit card required. Run a real bid through the complete checklist and all Pro features before you decide." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period." },
    { q: "Is BidShield only for roofing?", a: "Currently yes — BidShield is purpose-built for commercial roofing estimators. Additional trades are planned." },
  ].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <StickyBar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%))" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Simple, transparent pricing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
            One prevented scope gap
            <br />
            <span className="text-emerald-600">pays for months</span>
          </h1>

          <p className="text-lg text-slate-600 mb-2 max-w-2xl mx-auto">
            BidShield is $249/mo or $2,490/yr. Full Pro access: 18-phase checklist, AI scope gap detection, takeoff reconciliation, addenda tracking.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <PricingCards />

          {/* ROI reminder */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">
                    A single missed mechanical curb on a $3M bid = $30K–$80K loss.
                  </p>
                  <p className="text-sm text-amber-700">
                    Pro at $249/mo = $2,988/year. One prevented miss on a $2M job covers 10+ years.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">What's included in Pro</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🛡️", title: "18-Phase Review Checklist", desc: "Systematic workflow from project setup through submission. 100+ check items." },
              { icon: "🤖", title: "AI Scope Gap Detection", desc: "Scans plans/specs for 40 common gaps: curbs, edge metal, drains, expansion joints, warranty scope." },
              { icon: "📐", title: "Takeoff Reconciliation", desc: "Cross-references your SF quantities against drawings. Flags discrepancies before submission." },
              { icon: "📋", title: "Addenda Cross-Reference", desc: "Tracks what changed in each addendum and prompts you to update affected phases." },
              { icon: "📊", title: "Spec Analysis", desc: "Extracts submittal requirements, warranty scope, and liquidated damages from Division 07 specs." },
              { icon: "📄", title: "PDF Export", desc: "Generate a summary of your review checklist to attach to your bid or share with your team." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 18-PHASE CHECKLIST (collapsed by default) ── */}
      <section id="checklist" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              17 phases. Every bid. Every time.
            </h2>
            <p className="text-slate-600">
              The complete pre-submission workflow — from project setup through final validator score.
            </p>
          </div>

          <ChecklistAccordion />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Common Questions</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/40">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your next bid is due soon.
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Set up your first project in 60 seconds. Run it through the checklist before you submit.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-xl shadow-emerald-900/30 text-base hover:scale-[1.02] active:scale-[0.99]"
          >
            Start 14-Day Free Trial — No Card Required
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
