'use client';

import { useState } from 'react';

interface StripeCheckoutButtonProps {
  productId: string;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'large';
}

export default function StripeCheckoutButton({
  productId,
  text = 'Buy Now',
  className = '',
  variant = 'primary',
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105',
    secondary: 'px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200',
    outline: 'px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50',
    large: 'px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105',
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        text
      )}
    </button>
  );
}
