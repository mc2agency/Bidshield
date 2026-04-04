'use client';

import { useState } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { gtagEvent } from '@/lib/gtag';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

interface EmailCaptureProps {
  variant?: 'full' | 'banner';
}

export default function EmailCapture({ variant = 'full' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      if (convexUrl) {
        const client = new ConvexHttpClient(convexUrl);
        await client.mutation(api.leads.subscribeEmail, { email, source: 'checklist' });
      }
      gtagEvent('email_captured', { event_category: 'lead', event_label: 'free_checklist' });
      setSubmitted(true);
    } catch {
      // Still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={variant === 'banner' ? 'bg-emerald-50 border-y border-emerald-200 py-4' : 'rounded-2xl p-8 md:p-12 border border-emerald-500/20 bg-emerald-500/5'}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You&apos;re on the list!</h3>
          <p className="text-slate-400">We&apos;ll send your free Estimating Checklist soon. Keep an eye on your inbox.</p>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
            <span>FREE Estimating Checklist — Never miss a line item again</span>
          </div>
          <div className="flex gap-2 flex-1 sm:justify-end w-full sm:w-auto">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-2 rounded-lg text-gray-900 w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Get It Free'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? 'Saving...' : 'Get It Free'}
      </button>
    </form>
  );
}
