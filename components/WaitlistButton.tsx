'use client';

import { useState } from 'react';

interface WaitlistButtonProps {
  productName?: string;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'large';
}

export default function WaitlistButton({
  productName = 'this product',
  text = 'Coming Soon — Join Waitlist',
  className = '',
  variant = 'primary',
}: WaitlistButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer';

  const variantStyles = {
    primary: 'px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:scale-105',
    secondary: 'px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 shadow-md hover:shadow-lg',
    outline: 'px-6 py-3 bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50',
    large: 'px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl text-lg hover:scale-105',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Wire to email service
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-lg font-semibold border border-emerald-200">
        <span>✅</span>
        <span>You&apos;re on the waitlist!</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-gray-900 focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:scale-105 transition-all whitespace-nowrap"
        >
          Notify Me
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <span>{text}</span>
      <span className="text-lg">→</span>
    </button>
  );
}
