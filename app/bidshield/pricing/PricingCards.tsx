"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { gtagEvent } from "@/lib/gtag";
import { track } from "@vercel/analytics";

const PRO_FEATURES = [
  "## Core Workflow",
  "Unlimited active projects",
  "134-item bid review checklist",
  "Scope tracker — Included / Excluded / By Others",
  "Takeoff & quantities reconciliation",
  "## Pricing & Costs",
  "Material Reconciliation — verify pricing vs quotes",
  "Labor Verification — AI scope analysis",
  "General Conditions tracker",
  "Full Bid Summary with $/SF benchmarking",
  "## Vendors & Quotes",
  "Vendor address book",
  "Quotes & Pricing library",
  "✨ AI Quote Extraction (PDF upload)",
  "## Bid Management",
  "Addenda & RFI tracking",
  "Bid Qualifications tracker",
  "GC Bid Forms — Exhibit A/B prep",
  "Unlimited Decision Log",
  "## AI Features",
  "✨ AI Material Report Extraction",
  "✨ AI Labor Verification (scope analysis)",
  "✨ AI GC Bid Form Auto-Confirm",
  "✨ Generate Exclusions with AI",
  "✨ Draft RFI with AI",
  "✨ Addendum Impact Check",
  "## Support",
  "14-day free trial — no card required",
  "Priority support",
];

const FREE_FEATURES = [
  "1 active project",
  "134-item bid checklist",
  "Scope tracker",
  "Takeoff & Materials (view)",
  "RFIs & Addenda tracking",
  "10 Decision Log entries",
];

const FREE_LIMITS = [
  "No AI features",
  "No Labor Verification",
  "No General Conditions / Bid Quals",
  "No GC Bid Forms",
  "No Vendor address book",
  "No full Bid Summary",
];

export default function PricingCards() {
  const { isSignedIn } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gtagEvent("view_pricing");
    track("pricing_viewed");
  }, []);

  const planId = annual ? "pro_annual" : "pro_monthly";
  const monthlyDisplay = annual ? "$208" : "$249";
  const billingNote = annual ? "Billed $2,490/year" : "Billed monthly — cancel anytime";

  const handleCheckout = async () => {
    gtagEvent("begin_checkout", { plan: planId });
    track("trial_started", { source: "pricing_page", plan: "pro", price: annual ? 2490 : 249 });

    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect=/bidshield/pricing`;
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-semibold transition-colors ${!annual ? "text-slate-900" : "text-slate-400"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(a => !a)}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          style={{ background: annual ? "#059669" : "#cbd5e1" }}
          aria-label="Toggle billing period"
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200"
            style={{ transform: annual ? "translateX(22px)" : "translateX(2px)" }}
          />
        </button>
        <span className={`text-sm font-semibold transition-colors ${annual ? "text-slate-900" : "text-slate-400"}`}>
          Annual
        </span>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
            annual
              ? "bg-emerald-100 text-emerald-700 opacity-100 scale-100"
              : "bg-slate-100 text-slate-400 opacity-60 scale-95"
          }`}
        >
          Save $498 · 2 months free
        </span>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

        {/* Free */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Free</h3>
            <p className="text-sm text-slate-500 mt-1">Try BidShield on one project — no card required.</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-slate-900">$0</span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">No credit card · No commitment</p>
          </div>
          <ul className="flex-1 space-y-2.5 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
            <li className="border-t border-slate-100 pt-2.5" />
            {FREE_LIMITS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                <svg className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={isSignedIn ? "/bidshield/dashboard" : "/sign-up"}
            className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {isSignedIn ? "Go to Dashboard" : "Start Free →"}
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl p-[2px] shadow-2xl" style={{ background: "linear-gradient(135deg, #059669, #10b981, #34d399)" }}>
          {/* Recommended badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-extrabold px-5 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-600/30">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Recommended
            </div>
          </div>

          <div className="bg-white rounded-[14px] p-8 flex flex-col h-full">
            <div className="mb-6 pt-2">
              <h3 className="text-xl font-bold text-slate-900">Pro</h3>
              <p className="text-sm text-slate-500 mt-1">For active estimators bidding weekly — full workflow.</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold text-slate-900">{monthlyDisplay}</span>
                <span className="text-slate-500 text-base">/mo</span>
                {annual && (
                  <span className="ml-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium text-slate-500">
                {billingNote}
              </p>
            </div>

            <ul className="flex-1 space-y-2 mb-8">
              {PRO_FEATURES.map((f, i) => {
                if (f.startsWith("## ")) {
                  return (
                    <li key={f} className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 ${i > 0 ? "pt-3" : ""}`}>
                      {f.slice(3)}
                    </li>
                  );
                }
                const isAI = f.startsWith("✨");
                return (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${isAI ? "text-emerald-700 font-medium" : "text-slate-700"}`}>
                    <svg
                      className={`w-4 h-4 mt-0.5 shrink-0 ${isAI ? "text-emerald-500" : "text-emerald-500"}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                );
              })}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
            >
              {loading ? "Redirecting…" : "Start 14-Day Free Trial →"}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </div>
    </>
  );
}
