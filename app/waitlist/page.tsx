'use client';

import Link from 'next/link';
import EmailCapture from '@/components/EmailCapture';
import { useState } from 'react';

export default function WaitlistPage() {
  const [joined, setJoined] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bs-display { font-family: 'Barlow Condensed', system-ui, sans-serif; letter-spacing: -0.01em; }
        .bs-body { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>

      <main className="min-h-screen bs-body bg-slate-950 text-white flex flex-col">

        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.014)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.014)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-700/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-700/5 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#10B981' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 4.5V9.5L7 13L2 9.5V4.5L7 1Z" stroke="#fff" strokeWidth="1.8" fill="none"/>
                <path d="M7 5V9M5 7H9" stroke="#fff" strokeWidth="1.4"/>
              </svg>
            </div>
            <span className="font-bold text-white text-[15px]" style={{ letterSpacing: '-0.3px' }}>BidShield</span>
          </Link>
          <Link
            href="/bidshield/demo"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            See the demo →
          </Link>
        </header>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-2xl mx-auto w-full text-center">

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-10">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Building now · Early access opening soon
            </div>

            {/* Headline */}
            <h1 className="bs-display text-[clamp(3rem,9vw,6rem)] font-bold uppercase leading-[0.88] mb-6">
              The Preflight
              <br />
              Check For
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Every Bid.
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-4 max-w-lg mx-auto leading-relaxed">
              BidShield catches the scope gaps, missed addenda, and unresolved RFIs before your number goes out the door.
            </p>
            <p className="text-sm text-slate-500 mb-12 max-w-md mx-auto">
              Built for commercial roofing estimators. You have your estimate — we make sure it&apos;s right before you submit.
            </p>

            {/* Email capture */}
            <div className="max-w-md mx-auto mb-6">
              <EmailCapture
                source="waitlist"
                placeholder="your@email.com"
                buttonText="Request Early Access"
                successHeading="You're on the list!"
                successBody="We'll reach out with early access details as spots open up. Thanks for your interest."
              />
            </div>
            <p className="text-xs text-slate-600">No credit card. No commitments. Early access is free.</p>

            {/* Social proof / trust signals */}
            <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-3 gap-8">
              {[
                { stat: '5', label: 'Preflight phases', sub: 'Intake → Read → Verify → Validate → Submit' },
                { stat: '95+', label: 'Checklist items', sub: 'Nothing left to chance' },
                { stat: 'AI', label: 'Scope extraction', sub: 'From drawings & specs' },
              ].map(({ stat, label, sub }) => (
                <div key={label} className="text-center">
                  <div className="bs-display text-4xl font-bold text-white mb-1">{stat}</div>
                  <div className="text-xs font-semibold text-slate-300 mb-1">{label}</div>
                  <div className="text-[10px] text-slate-600">{sub}</div>
                </div>
              ))}
            </div>

            {/* What it does */}
            <div className="mt-14 grid sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  ),
                  title: 'Scope Verification',
                  body: 'Every item marked included, excluded, or by others — before submission.',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  ),
                  title: 'Addenda Tracking',
                  body: 'Every change captured, repriced, and documented before bid day.',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                  ),
                  title: 'RFI Management',
                  body: 'Open questions flagged and tracked so nothing slips through.',
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl p-4 border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3 text-emerald-400"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {icon}
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{title}</div>
                  <div className="text-xs text-slate-500">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-6 text-center">
          <p className="text-xs text-slate-700">
            &copy; {new Date().getFullYear()} BidShield ·{' '}
            <Link href="/privacy" className="hover:text-slate-500 transition-colors">Privacy</Link>
            {' · '}
            <Link href="/terms" className="hover:text-slate-500 transition-colors">Terms</Link>
          </p>
        </footer>

      </main>
    </>
  );
}
