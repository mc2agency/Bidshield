'use client';

import Link from 'next/link';
import EmailCapture from '@/components/EmailCapture';
import { useEffect, useRef, useState } from 'react';

// ── Reveal animation wrapper ─────────────────────────────────────────────────
function Reveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 0.22s ease-out ${delay}ms, transform 0.22s ease-out ${delay}ms`;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

// ── Hero app mockup ──────────────────────────────────────────────────────────
function HeroMockup() {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-6 bg-emerald-500/8 rounded-3xl blur-3xl pointer-events-none" />
      {/* Browser chrome */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ background: '#0d1117' }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
          style={{ background: '#161b22' }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div
            className="flex-1 mx-3 h-5 rounded text-[10px] text-slate-500 flex items-center px-3 font-mono"
            style={{ background: '#0d1117' }}
          >
            bidshield.co/app/meridian-business-park
          </div>
        </div>
        {/* App layout */}
        <div className="flex" style={{ height: '330px' }}>
          {/* Sidebar */}
          <div
            className="w-44 border-r border-white/5 p-3 flex flex-col gap-1 shrink-0"
            style={{ background: '#0d1117' }}
          >
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest px-2 pt-1 pb-2 mb-1 border-b border-white/5">
              BidShield
            </div>
            {['Dashboard', 'Checklist', 'Materials', 'Labor', 'Vendors', 'Bid Forms', 'Decision Log'].map((item, i) => (
              <div
                key={item}
                className={`text-[11px] px-2 py-1.5 rounded flex items-center gap-2 ${
                  i === 1 ? 'bg-emerald-500/15 text-emerald-300 font-medium' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className={`w-1 h-1 rounded-full shrink-0 ${i === 1 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                {item}
              </div>
            ))}
          </div>
          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mb-0.5">Active Project</div>
                <div className="text-sm font-semibold text-white leading-tight">Meridian Business Park</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Phase 2 Re-roof · 42,800 SF · Due Apr 18</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400 leading-none">87%</div>
                <div className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wider">Readiness</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-slate-800 mb-4 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: '87%' }}
              />
            </div>
            {/* Phase rows */}
            <div className="space-y-1">
              {[
                { label: '01 · Project Setup', done: true },
                { label: '05 · Mechanical Review', done: true },
                { label: '11 · Takeoff — Areas', done: true },
                { label: '14 · Pricing — Materials', active: true },
                { label: '17 · Pre-Submission', pending: true },
                { label: '18 · Bid Submission', pending: true },
              ].map(({ label, done, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] ${
                    active ? 'bg-emerald-500/8 border border-emerald-500/20' : ''
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      done ? 'bg-emerald-500' : active ? 'border-2 border-emerald-400' : 'border border-slate-700'
                    }`}
                  >
                    {done && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={done ? 'text-slate-600 line-through' : active ? 'text-emerald-300 font-semibold' : 'text-slate-600'}>
                    {label}
                  </span>
                  {active && (
                    <span className="ml-auto text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                      In Progress
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Alert */}
            <div className="mt-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[9px] text-amber-400 font-mono">
              ⚠ 2 addenda not confirmed · Phase 10
            </div>
          </div>
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute -right-3 -bottom-3 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/40 whitespace-nowrap">
        134 checks · 18 phases
      </div>
    </div>
  );
}

// ── 18-phase accordion data ──────────────────────────────────────────────────
const PHASES = [
  { num: '01', name: 'Project Setup', items: ['Confirm project scope and contract type', 'Document project address and contacts', 'Verify bid date and submission requirements', 'Set up folder structure in BidShield'] },
  { num: '02', name: 'Document Receipt', items: ['Confirm full plan set received', 'Log spec book and addenda list', 'Verify project scope sheet', 'Note any missing documents'] },
  { num: '03', name: 'Architectural Review', items: ['Review roof plan for scope boundaries', 'Confirm drain locations and roof slopes', 'Check parapet heights and details', 'Note penetrations and curb counts'] },
  { num: '04', name: 'Structural Review', items: ['Review structural drawings for deck type', 'Identify steel joist vs concrete deck zones', 'Check for existing insulation notes', 'Confirm structural blocking requirements'] },
  { num: '05', name: 'Mechanical Review', items: ['Count mechanical curbs and equipment', 'Verify curb heights vs spec requirements', 'Check equipment support dunnage', 'Confirm screened enclosure scope'] },
  { num: '06', name: 'Plumbing Review', items: ['Count roof drains and overflow drains', 'Verify interior drain connection scope', 'Check area drain locations', 'Confirm sump pan requirements'] },
  { num: '07', name: 'Electrical Review', items: ['Identify conduit penetrations', 'Note electrical equipment pads on roof', 'Check lightning protection scope', 'Verify solar prep requirements'] },
  { num: '08', name: 'Civil/Site/DOT Review', items: ['Review site access restrictions', 'Note crane pad or staging area limits', 'Check DOT lane closure requirements', 'Confirm laydown zone availability'] },
  { num: '09', name: 'Specification Review', items: ['Review Division 07 spec sections', 'Confirm submittal and mock-up requirements', 'Check special inspection requirements', 'Note warranty requirements and exclusions'] },
  { num: '10', name: 'Addenda Review', items: ['Log all addenda received', 'Review each addendum for scope changes', 'Confirm pricing impacts are incorporated', 'Mark all addenda as confirmed'] },
  { num: '11', name: 'Takeoff — Areas', items: ['Measure all roof field areas by zone', 'Calculate insulation area separately', 'Verify total area against plan dimensions', 'Note area overlaps or exclusions'] },
  { num: '12', name: 'Takeoff — Linear', items: ['Measure perimeter linear feet', 'Count fascia and gutter linear footage', 'Measure expansion joint linear footage', 'Verify edge metal types and quantities'] },
  { num: '13', name: 'Takeoff — Counts', items: ['Count all penetration flashings', 'Tally drain flashings and covers', 'Count access hatches and skylights', 'Verify misc item counts vs plan'] },
  { num: '14', name: 'Pricing — Materials', items: ['Enter material quantities from takeoff', 'Upload supplier quotes for AI extraction', 'Reconcile material prices vs quotes', 'Flag any pricing discrepancies'] },
  { num: '15', name: 'Pricing — Labor', items: ['Enter labor hours by phase', 'Run AI scope analysis for labor check', 'Verify labor burden and payroll taxes', 'Confirm subcontractor labor scope'] },
  { num: '16', name: 'Subcontractor Scope', items: ['Document sub scope inclusions', 'Confirm exclusions and by-others items', 'Verify sub pricing is locked', 'Log any sub clarifications needed'] },
  { num: '17', name: 'Pre-Submission', items: ['Run full bid summary validation', 'Check $/SF against benchmarks', 'Confirm all qualifications are written', 'Verify alternates and unit prices'] },
  { num: '18', name: 'Bid Submission', items: ['Confirm GC bid form is complete', 'Attach all required exhibits', 'Submit before deadline with confirmation', 'Log bid result and feedback'] },
];

function PhaseList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="grid md:grid-cols-2 gap-2">
      {PHASES.map((p, i) => {
        const isOpen = open === i;
        return (
          <div
            key={p.num}
            className={`rounded-xl border transition-all duration-200 ${
              isOpen ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 hover:border-white/10'
            }`}
            style={{ background: isOpen ? undefined : 'rgba(255,255,255,0.02)' }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset rounded-xl"
            >
              <span className="text-[10px] font-bold text-emerald-500 font-mono w-5 shrink-0">{p.num}</span>
              <span className={`text-sm font-medium flex-1 ${isOpen ? 'text-emerald-300' : 'text-slate-300'}`}>
                {p.name}
              </span>
              <svg
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-600'}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-200 ease-out"
              style={{ maxHeight: isOpen ? '180px' : '0', opacity: isOpen ? 1 : 0 }}
            >
              <ul className="px-4 pb-3 space-y-1.5">
                {p.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                    <svg className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    tag: 'Phase 05 — Mechanical Review',
    title: 'Mechanical Plan Review',
    body: 'Every curb, equipment support, and dunnage verified against the plan set before takeoff. Quantities reconciled phase-by-phase, not at submission.',
    stat: '18',
    statLabel: 'phases covered start to finish',
  },
  {
    tag: 'Phase 10 — Addenda Review',
    title: 'Addenda Tracking',
    body: 'Every addendum logged, reviewed for scope impact, and confirmed incorporated before submission. No addendum slips through unreviewed.',
    stat: '100%',
    statLabel: 'addenda accountability',
  },
  {
    tag: 'Phase 09 — Specification Review',
    title: 'Specification Review',
    body: 'Spec sections reviewed for submittal requirements, special inspections, and compliance items that affect your scope and final cost.',
    stat: '134',
    statLabel: 'checklist items',
  },
];

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    initials: 'MR',
    name: 'Mike R.',
    role: 'Project Estimator',
    company: 'Summit Roofing, Denver',
    quote: '"Finally a tool that matches how I actually run bids. The phase-by-phase checklist catches everything I used to track on sticky notes. Haven\'t missed a line item since."',
  },
  {
    initials: 'JT',
    name: 'Jason T.',
    role: 'Senior Estimator',
    company: 'Apex Commercial Roofing, Houston',
    quote: '"Material Reconciliation alone is worth the subscription. I caught a $14k discrepancy on a TPO re-roof before it hit the GC\'s desk. That\'s real money saved on one job."',
  },
  {
    initials: 'DL',
    name: 'Dana L.',
    role: 'Estimating Manager',
    company: 'Ridgeline Contractors, Atlanta',
    quote: '"I run every bid through BidShield now. The pre-submission validator flags things I\'d never catch under deadline pressure. It\'s the QA process I always needed."',
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function HomepageContent() {
  return (
    <>
      {/* Distinctive typography: Barlow Condensed (industrial display) + DM Sans (clean body) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bs-display { font-family: 'Barlow Condensed', system-ui, sans-serif; letter-spacing: -0.01em; }
        .bs-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .bs-mono { font-family: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace; }
      `}</style>

      <main className="min-h-screen bs-body">

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  HERO — 2-column with app mockup                           */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-slate-950 text-white overflow-hidden">
          {/* Atmospheric background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Fine grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.016)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.016)_1px,transparent_1px)] bg-[size:48px_48px]" />
            {/* Top edge line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            {/* Left glow */}
            <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-emerald-700/6 rounded-full blur-[120px]" />
            {/* Right glow */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[500px] bg-teal-700/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

              {/* Left — copy */}
              <div>
                {/* Live badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-8">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Built for Commercial Roofing Estimators
                </div>

                {/* Headline — Barlow Condensed */}
                <h1 className="bs-display text-[clamp(3.5rem,8vw,5.5rem)] font-bold uppercase leading-[0.9] mb-6">
                  Every Bid.
                  <br />
                  Every Phase.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                    Every Time.
                  </span>
                </h1>

                <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                  BidShield is the bid quality assurance platform commercial roofing estimators run from first plan review to final submission — built by a 12-year estimator who needed it.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-200"
                  >
                    Start 14-Day Free Trial — No Card
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/bidshield/demo"
                    className="inline-flex items-center justify-center px-7 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-semibold text-sm transition-all duration-200"
                  >
                    See Live Demo
                  </Link>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-0 pt-8 border-t border-white/5">
                  {[
                    { n: '18', label: 'Bid Phases' },
                    { n: '134', label: 'Checklist Items' },
                    { n: '12yr', label: 'Field Experience' },
                  ].map(({ n, label }, i) => (
                    <div key={label} className={`${i > 0 ? 'pl-6 border-l border-white/5 ml-6' : ''}`}>
                      <div className="bs-display text-4xl sm:text-5xl font-bold text-white leading-none">{n}</div>
                      <div className="text-xs text-slate-500 mt-1.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — app mockup */}
              <div className="hidden lg:block">
                <HeroMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  WHAT BIDSHIELD COVERS — Feature cards                     */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16">
              <h2 className="bs-display text-5xl sm:text-6xl font-bold text-white uppercase mb-4">
                What BidShield{' '}
                <span className="text-emerald-400">Covers</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl">
                The bid QA tool that catches scope gaps and roofing takeoff mistakes before they reach the GC. 18 phases, every discipline, every item.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group relative bg-slate-950 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/50 overflow-hidden flex flex-col h-full">
                    {/* Left accent line */}
                    <div className="absolute left-0 top-6 bottom-6 w-[3px] bg-emerald-500/30 rounded-r-full group-hover:bg-emerald-400 transition-colors duration-200" />
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4 bs-mono">{f.tag}</div>
                    <h3 className="bs-display text-2xl font-bold text-white uppercase mb-3">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">{f.body}</p>
                    <div className="flex items-baseline gap-2 pt-4 border-t border-slate-800">
                      <span className="bs-display text-4xl font-bold text-emerald-400">{f.stat}</span>
                      <span className="text-xs text-slate-500">{f.statLabel}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  FOUNDER PULL-QUOTE                                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative pl-8 border-l-[3px] border-emerald-500">
                {/* Dot on border */}
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed italic">
                  "After 12 years estimating commercial roofing, I built the workflow I always ran on paper — finally in one place. Every phase, every discipline, every item that needs to be verified before you submit. Material reconciliation, scope verification, addenda review — the bid quality assurance process every estimator needs but few have systematized."
                </p>
                <footer className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm bs-mono shrink-0">
                    CM
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Carlos M.</div>
                    <div className="text-xs text-slate-500">Founder, BidShield · 12-year commercial roofing estimator</div>
                  </div>
                </footer>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  18-PHASE CHECKLIST — Interactive accordion                */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="bs-display text-5xl sm:text-6xl font-bold text-white uppercase mb-3">
                    The 18-Phase{' '}
                    <span className="text-emerald-400">Bid Checklist</span>
                  </h2>
                  <p className="text-lg text-slate-400 max-w-2xl">
                    From project setup to bid submission. Click any phase to see what's covered.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="bs-display text-3xl font-bold text-emerald-400">134</div>
                  <div className="text-xs text-slate-500 mt-0.5">total checklist items</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <PhaseList />
            </Reveal>
            <Reveal delay={100} className="mt-8 text-center">
              <Link
                href="/bidshield/pricing"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                See the full 134-item checklist on the pricing page
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  TESTIMONIALS                                              */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-950 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12">
              <h2 className="bs-display text-5xl sm:text-6xl font-bold text-white uppercase mb-4">
                Built by Estimators.{' '}
                <span className="text-emerald-400">Used by Estimators.</span>
              </h2>
              <p className="text-lg text-slate-400">Real feedback from commercial roofing estimators running BidShield on live bids.</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 60}>
                  <div className="flex flex-col h-full bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-slate-950/50 transition-all duration-200">
                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                    {/* Attribution */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold bs-mono shrink-0">
                        {t.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{t.name}, {t.role}</div>
                        <div className="text-xs text-slate-500">{t.company}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  PRICING CTA — link to pricing page                        */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-2xl border border-slate-700 p-10 sm:p-14" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0a1628 100%)' }}>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bs-mono mb-4">Pricing</div>
                <h2 className="bs-display text-5xl font-bold text-white uppercase mb-4">
                  Simple <span className="text-emerald-400">Pricing.</span>
                  <br />Zero Complexity.
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-xl">
                  Free plan for one project. Pro at $249/mo — or $208/mo on annual. 14-day free trial, no card required.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href="/bidshield/pricing"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200"
                  >
                    See Pricing & Start Free Trial →
                  </Link>
                  <div className="text-sm text-slate-500">Free plan available · No card required · Cancel anytime</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  EMAIL CAPTURE                                             */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Reveal>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                </svg>
              </div>
              <h2 className="bs-display text-4xl font-bold text-white uppercase mb-3">
                Get the Free Bid-Day Checklist
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                The 18-phase workflow professional estimators run before every submission — scope verification, material reconciliation, and addenda checks.
              </p>
              <EmailCapture />
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/*  FINAL CTA — atmospheric dark section                      */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section
          className="relative py-28 overflow-hidden border-t border-slate-800"
          style={{ background: 'linear-gradient(160deg, #050a07 0%, #071a12 50%, #0a0f0a 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.014)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.014)_1px,transparent_1px)] bg-[size:48px_48px]" />
            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-600/6 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <Reveal>
              <h2 className="bs-display text-[clamp(3rem,8vw,5.5rem)] font-bold text-white uppercase leading-[0.9] mb-6">
                Submit Every Bid{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  With Confidence.
                </span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
                Material Reconciliation, Labor Verification, Scope tracking, GC Bid Forms — every part of your pre-submission QA process in one place, from first plan review to final submission.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-200"
              >
                Start 14-Day Free Trial — No Card Required
              </Link>
              <p className="text-xs text-slate-700 mt-4">No credit card · Cancel anytime · 14-day money-back guarantee</p>
            </Reveal>
          </div>
        </section>

      </main>
    </>
  );
}
