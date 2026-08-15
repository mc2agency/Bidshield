'use client';

import { useState } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function NewsletterSignup() {
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
        await client.mutation(api.leads.subscribeEmail, { email, source: 'blog_sidebar' });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-white font-semibold text-center py-2">✅ You&apos;re subscribed!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg mb-3 text-gray-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-60"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}
