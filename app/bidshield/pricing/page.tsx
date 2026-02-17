"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "",
    description: "Try BidShield on one project",
    features: [
      "1 active project",
      "16-phase bid checklist",
      "Takeoff reconciliation",
      "Bid readiness score",
      "Scope gap checker",
      "Bid validator",
    ],
    limitations: [
      "No PDF export",
      "No historical analytics",
      "No material price book",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: 49,
    interval: "/mo",
    description: "For active estimators bidding weekly",
    features: [
      "Unlimited projects",
      "Everything in Free, plus:",
      "PDF bid package export",
      "Win/loss analytics & $/SF benchmarks",
      "Material price book (saved prices)",
      "Quote expiration alerts",
      "GC relationship tracking",
      "Priority support",
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    id: "pro_annual",
    name: "Pro Annual",
    price: 39,
    interval: "/mo",
    annualNote: "Billed $468/year (save $120)",
    description: "Best value for committed estimators",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Early access to new features",
      "Annual business review report",
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "free") {
      window.location.href = isSignedIn ? "/bidshield/dashboard" : "/sign-up";
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch("/api/bidshield/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">BidShield</span>
            <span className="text-xs text-slate-400">by MC2 Estimating</span>
          </Link>
          <Link
            href={isSignedIn ? "/bidshield/dashboard" : "/sign-in"}
            className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
          >
            {isSignedIn ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Never submit a bad bid again
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-2">
          BidShield is the bid-day assistant for commercial roofing subcontractors.
          It catches what your estimating software misses.
        </p>
        <p className="text-sm text-slate-400">
          Works alongside The EDGE, STACK, Excel, or whatever you use today.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border ${
                plan.popular
                  ? "border-emerald-300 ring-2 ring-emerald-100 shadow-lg"
                  : "border-slate-200 shadow-sm"
              } p-8 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                  {plan.interval && (
                    <span className="text-slate-500">{plan.interval}</span>
                  )}
                </div>
                {plan.annualNote && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {plan.annualNote}
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <svg
                      className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li
                    key={`lim-${i}`}
                    className="flex items-start gap-2 text-sm text-slate-400"
                  >
                    <svg
                      className="w-4 h-4 text-slate-300 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                    {limitation}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    : plan.price === 0
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                } ${loading === plan.id ? "opacity-50 cursor-wait" : ""}`}
              >
                {loading === plan.id ? "Redirecting..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Built by an estimator with 11 years of commercial roofing experience
          </p>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">16</div>
              <div className="text-xs text-slate-500">Phase checklist</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">100+</div>
              <div className="text-xs text-slate-500">QA check items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">40</div>
              <div className="text-xs text-slate-500">Scope gap items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">9</div>
              <div className="text-xs text-slate-500">Readiness dimensions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
