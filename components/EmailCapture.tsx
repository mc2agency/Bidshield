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
      <div className={variant === 'banner' ? 'bg-emerald-50 border-y border-emerald-200 py-4' : 'bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 border border-emerald-200'}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-xl font-bold text-emerald-800 mb-2">You&apos;re on the list!</h3>
          <p className="text-emerald-700">We&apos;ll send your free Estimating Checklist soon. Keep an eye on your inbox.</p>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="text-xl">📋</span>
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
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-emerald-200 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Download Our FREE Bid Review Checklist
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            The 18-phase checklist commercial roofing estimators use to catch scope gaps, missed addenda, and pricing errors before submission.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Get It Free'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
