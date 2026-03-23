"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { gtagEvent } from "@/lib/gtag";
import { track } from "@vercel/analytics";

// Items prefixed with "## " render as section headers, not feature rows
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
  "Full Bid Summary with $/SF",
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
  "14-day free trial",
  "Priority support",
];

const FREE_FEATURES = [
  "1 active project",
  "134-item bid checklist",
  "Scope tracker (read-only edits)",
  "Takeoff & Materials (read-only)",
  "RFIs & Addenda tracking",
  "Up to 5 Decision Log entries",
];

const FREE_LIMITS = [
  "No AI features",
  "No Labor Verification",
  "No Gen. Conds / Bid Quals",
  "No GC Bid Forms",
  "No Vendor address book",
  "No full Bid Summary",
  "No Material Reconciliation editing",
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gtagEvent("view_pricing");
    track("pricing_viewed");
  }, []);

  const planId = annual ? "pro_annual" : "pro_monthly";
  const monthlyDisplay = annual ? "$124" : "$149";
  const billingNote = annual ? "Billed $1,490/year — save $298" : "Billed monthly";

  const handleCheckout = async () => {
    gtagEvent("begin_checkout", { plan: planId });
    track("trial_started", { source: "pricing_page", plan: "pro", price: annual ? 1490 : 149 });

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
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">BidShield</span>
          </Link>
          <Link
            href={isSignedIn ? "/bidshield/dashboard" : "/sign-in"}
            className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
          >
            {isSignedIn ? "Dashboard →" : "Sign In"}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          The professional workflow for commercial roofing estimators.
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          The bid review tool built for commercial roofing estimators. Catches scope gaps, missed addenda, and pricing errors before you submit.
        </p>
        <p className="text-sm text-slate-400">
          Works alongside The EDGE, STACK, Excel, or any estimating tool you already use.
        </p>
      </div>

      {/* Value callout */}
      <div className="max-w-xl mx-auto px-6 mb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">
            A single missed mechanical curb on a $3M bid = $30,000–$80,000 loss.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Pro at $149/mo = $1,490/year. One prevented underbid on a $2M job covers 10+ years of the tool.
          </p>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(a => !a)}
          className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none"
          style={{ background: annual ? "#10b981" : "#cbd5e1" }}
          aria-label="Toggle billing period"
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
            style={{ transform: annual ? "translateX(22px)" : "translateX(2px)" }}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-400"}`}>
          Annual
        </span>
        {annual && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Save $298 · 2 months free
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <p className="text-sm text-slate-500 mt-1">Try BidShield on one project</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">$0</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">No credit card required</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
              {FREE_LIMITS.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
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
              {isSignedIn ? "Go to Dashboard" : "Start Free"}
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-white rounded-2xl border-2 border-emerald-400 shadow-lg ring-4 ring-emerald-50 p-8 flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
              <p className="text-sm text-slate-500 mt-1">For active estimators bidding weekly</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">{monthlyDisplay}</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: annual ? "#059669" : "#94a3b8" }}>
                {billingNote}
                {annual && <span className="ml-2 font-bold text-emerald-600">· Save $298</span>}
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
                  <li key={f} className={`flex items-start gap-2 text-sm ${isAI ? "text-emerald-700 font-medium" : "text-slate-700"}`}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
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
              className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? "Redirecting…" : "Start 14-Day Free Trial"}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">No credit card required · Cancel anytime</p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Built by an estimator with 12 years of commercial roofing experience.
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-center">
            {[
              { n: "134", label: "Checklist items" },
              { n: "17",  label: "Bid phases" },
              { n: "40+", label: "Scope gap items" },
              { n: "14d", label: "Free trial" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-slate-900">{n}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Does this replace my estimating software?",
                a: "No. BidShield is the last step before you submit — not a replacement for The EDGE, STACK, or your spreadsheets. It reviews your completed bid for things estimating software can't catch.",
              },
              {
                q: "What's the difference between monthly and annual?",
                a: "Same Pro features either way. Annual billing is $1,490/year — that's ~$124/mo effective, saving you $298 versus paying monthly. You're prepaying 12 months at the price of 10.",
              },
              {
                q: "What does the free trial include?",
                a: "Full Pro access for 14 days, no credit card required. Run a real bid through the complete checklist, AI quote extraction, and all Pro features before you decide.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period.",
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
