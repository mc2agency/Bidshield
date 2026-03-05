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
      "18-phase bid checklist",
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
    price: 149,
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
      "All 8 Excel estimating templates included",
      "Priority support",
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    id: "pro_annual",
    name: "Pro Annual",
    price: 124,
    interval: "/mo",
    annualNote: "Billed $1,490/year — save $298",
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

    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect=/bidshield/pricing`;
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
            <span className="text-xl">🛡️</span>
            <span className="text-xl font-bold text-slate-900">BidShield</span>
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
          One prevented mistake pays for years of BidShield
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-2">
          The 18-phase pre-submission review built for commercial roofing subcontractors.
          Catches what estimating software can&apos;t — addenda scope changes, mechanical curb mismatches,
          submittal risks, and missed sections.
        </p>
        <p className="text-sm text-slate-400 mt-3">
          Works alongside The EDGE, STACK, Excel, or whatever you use today. No replacement required.
        </p>
      </div>

      {/* Value callout */}
      <div className="max-w-2xl mx-auto px-6 mb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-amber-800">
            A single missed mechanical curb section on a $3M bid costs $30,000–$80,000.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Pro at $149/month = $1,788/year. One prevented error pays for 16+ years of the tool.
          </p>
        </div>
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
                {(plan as { annualNote?: string }).annualNote && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {(plan as { annualNote?: string }).annualNote}
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

        {/* Trust signals */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Built by an estimator with 12 years of commercial roofing experience. 14-day free trial. Cancel anytime.
          </p>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">18</div>
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
              <div className="text-2xl font-bold text-slate-900">8</div>
              <div className="text-xs text-slate-500">Excel templates included</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Does this replace my estimating software?",
                a: "No. BidShield is the last step before you submit — not a replacement for The EDGE, STACK, or your spreadsheets. It reviews your completed bid for things estimating software can't catch."
              },
              {
                q: "What does the free trial include?",
                a: "Full Pro access for 14 days. No credit card required to start. You can run a real bid through the complete 18-phase checklist before you decide."
              },
              {
                q: "What are the 8 Excel templates?",
                a: "System-specific estimating templates for TPO, EPDM, BUR, Metal, SBS, Spray Foam, Tile, and Asphalt — each with takeoff, material, labor, and proposal tabs. Included free with Pro."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period."
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="font-semibold text-slate-900 text-sm mb-2">{item.q}</p>
                <p className="text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
