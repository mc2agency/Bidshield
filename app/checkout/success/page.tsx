'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Download {
  name: string;
  url: string;
}

interface PurchaseData {
  success: boolean;
  productId: string;
  productName: string;
  customerEmail: string;
  downloads: Download[];
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPurchase(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to verify purchase');
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verifying your purchase...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-slate-600">
            Thank you for your purchase. Your templates are ready to download.
          </p>
        </div>

        {/* Purchase Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{purchase?.productName}</h2>
          
          {purchase?.customerEmail && (
            <p className="text-slate-600 mb-6">
              A confirmation email has been sent to <strong>{purchase.customerEmail}</strong>
            </p>
          )}

          {/* Download Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 mb-2">Your Downloads:</h3>
            {purchase?.downloads.map((download, i) => (
              <a
                key={i}
                href={download.url}
                className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{download.name}</p>
                  <p className="text-sm text-slate-500">Click to download</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Help Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-slate-600 mb-4">
            Need help getting started? Check out our quick start guide or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/resources/quick-start"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Quick Start Guide
            </Link>
            <Link
              href="/support"
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Save Links Notice */}
        <p className="text-center text-sm text-slate-500 mt-6">
          💡 Tip: Bookmark this page or save the download links. They're valid for 7 days.
        </p>
      </div>
    </main>
  );
}
