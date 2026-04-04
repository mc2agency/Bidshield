import Link from "next/link";
import type { Metadata } from "next";
import PricingCards from "./PricingCards";
import StickyBar from "./StickyBar";
import ChecklistAccordion from "./ChecklistAccordion";
import FaqAccordion from "./FaqAccordion";
import AppMockup from "./AppMockup";
import RevealSection from "./RevealSection";

export const metadata: Metadata = {
  title: "BidShield — Bid QA Software for Commercial Roofing Estimators",
  description:
    "BidShield is the 18-phase bid quality assurance tool built for commercial roofing estimators. Catch scope gaps, missed addenda, and pricing errors before you submit. Start free.",
  keywords:
    "BidShield pricing, bid QA tool, commercial roofing bid review, pre-submission checklist, roofing estimating software pricing",
  alternates: { canonical: "https://www.bidshield.co/bidshield/pricing" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { q: "Does this replace my estimating software?", a: "No. BidShield is the last step before you submit — not a replacement for The EDGE, STACK, or your spreadsheets. It reviews your completed bid for things estimating software can't catch." },
    { q: "What's the difference between monthly and annual?", a: "Same Pro features either way. Annual billing is $2,490/year — that's ~$208/mo effective, saving you $498 versus paying monthly. You're prepaying 12 months at the price of 10." },
    { q: "What does the free trial include?", a: "Full Pro access for 14 days, no credit card required. Run a real bid through the complete checklist, AI quote extraction, and all Pro features before you decide." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period." },
    { q: "How does AI quote extraction work?", a: "Upload a supplier PDF quote and BidShield extracts line items — material name, unit, quantity, and price — directly into your Material Reconciliation sheet. No copy-paste." },
    { q: "Is BidShield only for roofing?", a: "Currently yes — BidShield is purpose-built for commercial roofing estimators with checklist items, scope categories, and AI prompts tuned specifically for roofing. Additional trades are planned." },
  ].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const TESTIMONIALS = [
  {
    quote:
      "Caught a missed mechanical curb detail on a $1.8M TPO job. At $12k per unit, that would've been a $36k hit. BidShield found it in the scope gap check before I submitted.",
    name: "Marcus T.",
    title: "Senior Estimator",
    company: "Apex Commercial Roofing",
    location: "Charlotte, NC",
    initials: "MT",
    stars: 5,
  },
  {
    quote:
      "We bid 4–6 jobs a week. The 18-phase checklist changed how our whole team prepares bids. Addenda tracking alone saved us from a $22k under on a prevailing wage job.",
    name: "Sarah K.",
    title: "VP of Estimating",
    company: "Western Commercial Roofing",
    location: "Phoenix, AZ",
    initials: "SK",
    stars: 5,
  },
  {
    quote:
      "The AI quote extraction is the killer feature. I used to spend 40 minutes pulling numbers from PDF quotes. Now it's 30 seconds and I'm reviewing instead of transcribing.",
    name: "Derek M.",
    title: "Owner / Estimator",
    company: "Coastal Roof Solutions",
    location: "Tampa, FL",
    initials: "DM",
    stars: 5,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky bar — appears after scrolling past hero */}
      <StickyBar />

      {/* ── HERO ── */}
      <section id="hero" className="relative overflow-hidden bg-white">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Green radial glow top-left */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Built for commercial roofing estimators
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                The bid QA tool that catches what your{" "}
                <span className="text-emerald-600">estimating software</span> misses.
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                BidShield walks you through an 18-phase pre-submission workflow — scope gaps, missed
                addenda, pricing errors, labor compliance, and 134 checklist items — before you hit
                send on your next big job.
              </p>

              <p className="text-sm text-slate-400 mb-10">
                Works alongside The EDGE, STACK, Excel, or any estimating tool you already use.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Start 14-Day Free Trial
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#checklist"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all hover:bg-slate-50"
                >
                  See all 18 phases
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </a>
              </div>

              <p className="text-xs text-slate-400 mt-4">No credit card required · Cancel anytime</p>
            </div>

            {/* Right — app mockup */}
            <div className="relative">
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <RevealSection>
        <section className="border-y border-slate-100 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { n: "134", label: "Checklist items", sub: "across 18 phases" },
                { n: "18",  label: "Bid phases", sub: "from plans to submittal" },
                { n: "40+", label: "Scope gap items", sub: "pre-loaded by system type" },
                { n: "14d", label: "Free trial", sub: "full Pro, no card required" },
              ].map(({ n, label, sub }) => (
                <div key={label}>
                  <div className="text-3xl font-extrabold text-slate-900 mb-0.5">{n}</div>
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── ROI CALLOUT ── */}
      <RevealSection delay={50}>
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="relative rounded-2xl overflow-hidden border border-amber-200 bg-amber-50 px-8 py-8">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8" style={{ background: "#f59e0b" }} />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-amber-900 mb-1">
                    A single missed mechanical curb on a $3M bid = $30,000–$80,000 loss.
                  </p>
                  <p className="text-sm text-amber-700">
                    Pro at $249/mo = $2,988/year. One prevented underbid on a $2M job covers 8+ years of the tool. The ROI is not subtle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── 18-PHASE CHECKLIST ── */}
      <RevealSection>
        <section id="checklist" className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-6">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">The full workflow</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                18 phases. Every bid. Every time.
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                BidShield structures your entire pre-submission process — from first plan review to final
                validator score — so nothing falls through the cracks.
              </p>
            </div>

            <ChecklistAccordion />

            <div className="text-center mt-10">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Run your first bid through the checklist →
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── TESTIMONIALS ── */}
      <RevealSection>
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                Estimators who catch more, lose less.
              </h2>
              <p className="text-slate-500 text-lg">Real impact on real jobs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-7 flex flex-col"
                >
                  {/* Quote mark */}
                  <div className="absolute top-6 right-6 text-emerald-100">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="flex-1 text-slate-700 text-sm leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.title} · {t.company}</div>
                      <div className="text-xs text-slate-400">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── TRUST SIGNALS ── */}
      <RevealSection>
        <section className="py-10 border-y border-slate-100 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500 mb-6">
              Built by an estimator with 12 years of commercial roofing experience.
              Not a software company guessing at your workflow.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {[
                {
                  icon: <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
                  label: "SOC 2 Ready",
                },
                {
                  icon: <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
                  label: "Data encrypted at rest",
                },
                {
                  icon: <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" /></svg>,
                  label: "Works on mobile & desktop",
                },
                {
                  icon: <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
                  label: "Real-time sync — never lose work",
                },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── PRICING ── */}
      <RevealSection>
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                Simple, transparent pricing.
              </h2>
              <p className="text-lg text-slate-500">
                Start free. Upgrade when BidShield catches its first miss.
              </p>
            </div>

            <PricingCards />

            {/* ROI reminder under pricing */}
            <p className="text-center text-sm text-slate-400 mt-10">
              Pro pays for itself the first time it catches a scope gap. No tricks, no upsells.
            </p>
          </div>
        </section>
      </RevealSection>

      {/* ── FAQ ── */}
      <RevealSection>
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Common Questions</h2>
            <FaqAccordion />
          </div>
        </section>
      </RevealSection>

      {/* ── FOOTER CTA ── */}
      <section className="py-24 bg-slate-900">
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
