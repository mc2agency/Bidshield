"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Does this replace my estimating software?",
    a: "No. BidShield is the last step before you submit — not a replacement for The EDGE, STACK, or your spreadsheets. It reviews your completed bid for things estimating software can't catch.",
  },
  {
    q: "What's the difference between monthly and annual?",
    a: "Same Pro features either way. Annual billing is $2,490/year — that's ~$208/mo effective, saving you $498 versus paying monthly. You're prepaying 12 months at the price of 10.",
  },
  {
    q: "What does the free trial include?",
    a: "Full Pro access for 14 days, no credit card required. Run a real bid through the complete checklist, AI quote extraction, and all Pro features before you decide.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time. Your data stays accessible until the end of your billing period.",
  },
  {
    q: "How does AI quote extraction work?",
    a: "Upload a supplier PDF quote and BidShield extracts line items — material name, unit, quantity, and price — directly into your Material Reconciliation sheet. No copy-paste.",
  },
  {
    q: "Is BidShield only for roofing?",
    a: "Currently yes — BidShield is purpose-built for commercial roofing estimators with checklist items, scope categories, and AI prompts tuned specifically for roofing. Additional trades are planned.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-emerald-700" : "text-slate-900"}`}>
                {item.q}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : "text-slate-400"}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <div
              className="overflow-hidden transition-all duration-200 ease-out"
              style={{ maxHeight: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0 }}
            >
              <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
