'use client';

import Link from 'next/link';
import EmailCapture from '@/components/EmailCapture';
import { useEffect, useRef } from 'react';

function Reveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 0.22s ease-out ${delay}ms, transform 0.22s ease-out ${delay}ms`;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

const ROLE_PROOF = [
  {
    role: 'Chief Estimator',
    question: 'Can I trust the number before it leaves my department?',
    proof: 'Complete bid file with assumptions, exclusions, addenda log, quote coverage, and a reconciliation trail your team can review before submission.',
  },
  {
    role: 'Project Manager',
    question: 'Will the bid match what operations actually has to build?',
    proof: 'Scope notes call out access, phasing, staging, penetrations, equipment, warranty requirements, and coordination items that become field problems if missed.',
  },
  {
    role: 'Roofing Contractor',
    question: 'Does this team understand commercial roofing details?',
    proof: 'Roof system, insulation, edge metal, sheet metal, drains, curbs, penetrations, flashings, warranty language, and manufacturer requirements are reviewed as roofing scope—not generic takeoff lines.',
  },
  {
    role: 'General Contractor',
    question: 'Can I plug this proposal into my leveling process?',
    proof: 'Bid forms, alternates, unit prices, inclusions, exclusions, and clarifications are organized so the GC can see what is covered and what is not.',
  },
  {
    role: 'Preconstruction Manager',
    question: 'Will this reduce bid-day risk?',
    proof: 'MC2Estimating tracks open RFIs, addenda impacts, vendor coverage, quote gaps, and scope conflicts before the final number is released.',
  },
];

const DELIVERABLES = [
  'Marked roof plan quantities by area, perimeter, edge condition, and roof zone',
  'Specification compliance notes tied to Division 07 requirements',
  'Addenda and RFI log showing reviewed items and pricing impact status',
  'Supplier and subcontractor quote matrix with inclusions, exclusions, and gaps',
  'Bid qualification sheet with assumptions, exclusions, alternates, and unit-price notes',
  'Estimator handoff package ready for owner review, PM review, or GC submission',
];

const DEPARTMENT_STEPS = [
  {
    step: '01',
    title: 'Document control before takeoff',
    body: 'Plans, specs, addenda, bid forms, alternates, and submission requirements are logged first. A bid cannot be trusted if the document set is not controlled.',
    artifact: 'Document register + bid requirement checklist',
  },
  {
    step: '02',
    title: 'Scope review by drawing discipline',
    body: 'Architectural, structural, mechanical, plumbing, electrical, and site drawings are reviewed for roofing impacts before quantities are finalized.',
    artifact: 'Cross-discipline scope notes',
  },
  {
    step: '03',
    title: 'Roofing takeoff with audit trail',
    body: 'Quantities are organized so another estimator can understand what was measured, where it came from, and what still needs confirmation.',
    artifact: 'Marked plans + quantity summary',
  },
  {
    step: '04',
    title: 'Quote and scope reconciliation',
    body: 'Material quotes, subcontractor proposals, and vendor exclusions are leveled against the estimate so missing scope is visible before bid day.',
    artifact: 'Quote matrix + gap list',
  },
  {
    step: '05',
    title: 'Bid package review',
    body: 'The final output is checked for addenda, alternates, qualifications, exclusions, unit prices, warranty notes, and submission requirements.',
    artifact: 'Proposal-ready bid package',
  },
];

const ARTIFACTS = [
  {
    title: 'Marked Plan Sheet',
    detail: 'Area takeoff, perimeters, penetrations, drains, curbs, edge metal, and roof zones visible on the drawing—not buried in a spreadsheet.',
  },
  {
    title: 'Scope Matrix',
    detail: 'Each major scope item is assigned a status: included, excluded, by others, allowance, alternate, RFI, or quote pending.',
  },
  {
    title: 'Bid Qualifications',
    detail: 'Clear notes for assumptions, exclusions, alternates, warranty basis, schedule limits, and unresolved clarifications.',
  },
];

function BidFileMockup() {
  return (
    <div className="relative" aria-label="Example MC2Estimating bid file artifacts">
      <div className="absolute -inset-6 bg-emerald-500/10 rounded-3xl blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bs-mono">MC2 Bid File</div>
          <div className="text-[10px] text-slate-500 bs-mono">Roofing Estimate Review</div>
        </div>
        <div className="grid grid-cols-[150px_1fr] min-h-[345px]">
          <div className="border-r border-white/10 p-3 space-y-2 bg-slate-950">
            {['Document Log', 'Marked Plans', 'Scope Matrix', 'Quote Leveling', 'Bid Qualifications'].map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-2.5 py-2 text-[11px] ${index === 2 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'text-slate-500 border border-transparent'}`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Project</div>
                <div className="text-white font-semibold">Commercial Re-Roof Bid Package</div>
                <div className="text-[11px] text-slate-500 mt-1">Plans · Specs · Addenda · Vendor Quotes · Bid Form</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400 leading-none">Ready</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">review status</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                ['Addenda', 'Logged'],
                ['Quotes', 'Leveled'],
                ['RFIs', 'Tracked'],
              ].map(([label, status]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                  <div className="text-sm text-white font-semibold mt-1">{status}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="grid grid-cols-[1fr_90px] px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                <div>Scope item</div>
                <div>Status</div>
              </div>
              {[
                ['TPO field membrane and insulation assembly', 'Included'],
                ['Edge metal profile and finish confirmation', 'RFI'],
                ['Overflow drain flashing detail', 'Included'],
                ['Manufacturer warranty and inspection requirements', 'Qualified'],
              ].map(([item, status]) => (
                <div key={item} className="grid grid-cols-[1fr_90px] gap-3 px-3 py-2 border-b border-white/5 last:border-0 text-[11px]">
                  <div className="text-slate-300">{item}</div>
                  <div className={status === 'RFI' ? 'text-amber-300' : status === 'Qualified' ? 'text-sky-300' : 'text-emerald-300'}>{status}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Estimator flag</div>
              <div className="text-[11px] text-slate-300 mt-1">Clarify edge metal finish before final submission; quote excludes custom color premium.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-3 -bottom-3 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/40 whitespace-nowrap">
        Deliverables, not decoration
      </div>
    </div>
  );
}

export default function HomepageContent() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bs-display { font-family: 'Barlow Condensed', system-ui, sans-serif; letter-spacing: -0.01em; }
        .bs-body { font-family: 'DM Sans', system-ui, sans-serif; }
        .bs-mono { font-family: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace; }
      `}</style>

      <main className="min-h-screen bs-body bg-slate-950 text-white">
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.12)_1px,transparent_1px)] bg-[size:120px_120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(16,185,129,0.16)_0%,rgba(2,6,23,0.2)_38%,rgba(2,6,23,0.95)_78%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300 mb-8">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Commercial roofing estimating support for bid-critical projects
                </div>

                <h1 className="bs-display text-pretty text-[clamp(3.4rem,8vw,5.7rem)] font-bold uppercase leading-[0.9] mb-6">
                  Trust the Bid
                  <br />
                  <span className="text-emerald-400">Before It Goes Out.</span>
                </h1>

                <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
                  MC2Estimating operates like an outsourced estimating department for commercial contractors: document control, roofing takeoff, quote leveling, scope review, qualifications, and bid-day QA in one accountable file.
                </p>

                <div className="mb-4 max-w-md">
                  <EmailCapture source="homepage_bid_support" placeholder="work@email.com" buttonText="Request Bid Support" />
                </div>
                <p className="text-xs text-slate-500 mb-10">Send the project. Get back estimating artifacts your team can review.</p>

                <div className="grid grid-cols-3 gap-0 pt-8 mt-10 border-t border-white/10">
                  {[
                    { n: '5', label: 'department checkpoints' },
                    { n: '6', label: 'bid artifacts delivered' },
                    { n: '1', label: 'reviewable bid file' },
                  ].map(({ n, label }, i) => (
                    <div key={label} className={`${i > 0 ? 'pl-5 border-l border-white/10 ml-5' : ''}`}>
                      <div className="bs-display text-4xl sm:text-5xl font-bold text-white leading-none">{n}</div>
                      <div className="text-xs text-slate-500 mt-1.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <BidFileMockup />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14">
              <h2 className="bs-display text-5xl sm:text-6xl font-bold uppercase mb-4">
                Built for the People Who <span className="text-emerald-400">Approve the Bid</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl">
                Every section of the process answers one question: what evidence proves MC2Estimating can estimate this project successfully?
              </p>
            </Reveal>

            <div className="grid lg:grid-cols-5 gap-4">
              {ROLE_PROOF.map((item, i) => (
                <Reveal key={item.role} delay={i * 50}>
                  <div className="h-full rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bs-mono mb-3">{item.role}</div>
                    <h3 className="text-sm font-semibold text-white leading-snug mb-3">{item.question}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.proof}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-950 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
              <Reveal>
                <h2 className="bs-display text-5xl sm:text-6xl font-bold uppercase mb-4">
                  What You Receive <span className="text-emerald-400">Back</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  Not a pretty dashboard. Not a generic promise. A bid package with the files, notes, and checks a contractor needs to make a submission decision.
                </p>
                <Link href="/support" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                  Ask what to send for a project review
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </Reveal>

              <Reveal delay={80}>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                  {DELIVERABLES.map((item, i) => (
                    <div key={item} className="flex gap-4 p-5 border-b border-slate-800 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center justify-center text-xs font-bold bs-mono shrink-0">{i + 1}</div>
                      <div className="text-slate-300 leading-relaxed">{item}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14">
              <h2 className="bs-display text-5xl sm:text-6xl font-bold uppercase mb-4">
                How MC2Estimating Works Like a <span className="text-emerald-400">Department</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl">
                A takeoff service measures quantities. An estimating department controls the bid file, challenges missing scope, reconciles quotes, and prepares the proposal for review.
              </p>
            </Reveal>

            <div className="space-y-4">
              {DEPARTMENT_STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i * 50}>
                  <div className="grid md:grid-cols-[80px_1fr_260px] gap-5 items-start rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="bs-display text-4xl text-emerald-400 font-bold leading-none">{step.step}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.body}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold bs-mono mb-1">artifact</div>
                      <div className="text-sm text-slate-200">{step.artifact}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-950 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-14 text-center">
              <h2 className="bs-display text-5xl sm:text-6xl font-bold uppercase mb-4">
                Proof Beats <span className="text-emerald-400">Claims</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                The site should not ask contractors to admire the design. It should show the working papers behind a responsible bid.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {ARTIFACTS.map((artifact, i) => (
                <Reveal key={artifact.title} delay={i * 60}>
                  <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="h-36 rounded-xl border border-slate-700 bg-slate-950 mb-5 p-4 overflow-hidden">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest bs-mono mb-3">{artifact.title}</div>
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-emerald-500/40 w-11/12" />
                        <div className="h-2 rounded bg-slate-700 w-9/12" />
                        <div className="h-2 rounded bg-slate-700 w-10/12" />
                        <div className="h-2 rounded bg-amber-400/50 w-7/12" />
                        <div className="grid grid-cols-3 gap-2 pt-3">
                          <div className="h-10 rounded border border-slate-700" />
                          <div className="h-10 rounded border border-emerald-500/30" />
                          <div className="h-10 rounded border border-slate-700" />
                        </div>
                      </div>
                    </div>
                    <h3 className="bs-display text-2xl font-bold uppercase mb-3">{artifact.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{artifact.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-2xl border border-slate-700 p-10 sm:p-14 bg-slate-950">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bs-mono mb-4">Bid support request</div>
                <h2 className="bs-display text-5xl font-bold uppercase mb-4">
                  Send the Project. <span className="text-emerald-400">Review the Evidence.</span>
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl">
                  If MC2Estimating is going to help with your bid, the output should be inspectable by a chief estimator, usable by a PM, clear to a GC, and disciplined enough for preconstruction review.
                </p>
                <div className="max-w-md">
                  <EmailCapture source="homepage_final_cta" placeholder="work@email.com" buttonText="Request Bid Support" />
                </div>
                <p className="text-xs text-slate-500 mt-4">Tell us what you are bidding and what documents are available.</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
