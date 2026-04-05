import type { Metadata } from "next";
import Link from "next/link";
import DemoGate from "./DemoGate";

export const metadata: Metadata = {
  title: 'BidShield Demo — Live Bid Workflow Preview',
  description: 'Try BidShield free — no sign-up required. Walk through the 18-phase bid workflow, Material Reconciliation, Labor Verification, and Bid Validator with real demo data.',
  alternates: { canonical: 'https://www.bidshield.co/bidshield/demo' },
};

// ── Static preview data ────────────────────────────────────────────────────

const CHECKLIST_PHASES = [
  { label: "Plan Review",        total: 8,  done: 8  },
  { label: "Takeoff",            total: 12, done: 11 },
  { label: "Materials",          total: 10, done: 9  },
  { label: "Scope & Exclusions", total: 9,  done: 4  },
  { label: "Addenda",            total: 6,  done: 6  },
  { label: "Bid Quals",          total: 7,  done: 3  },
  { label: "Submission",         total: 5,  done: 1  },
];

const SCOPE_ITEMS = [
  { name: "TPO 60mil Membrane Installation",  status: "included"  },
  { name: "Polyiso Insulation (2.5\")",        status: "included"  },
  { name: "Tear-off & Disposal",              status: "included"  },
  { name: "Structural Steel Repairs",         status: "excluded"  },
  { name: "HVAC Curb Modifications",          status: "by_others" },
  { name: "Overflow Scupper Fabrication",     status: "excluded"  },
  { name: "Interior Water Damage Remediation",status: "by_others" },
  { name: "TPO Walkway Pads (64 LF)",         status: "included"  },
];

const QUOTE_LINE_ITEMS = [
  { desc: "TPO 60mil Membrane (10' roll)",       qty: 48,   unit: "RL",  up: 285,   total: 13680  },
  { desc: 'Polyiso 2.5" ISO Board (4x8)',        qty: 1477, unit: "BD",  up: 34,    total: 50218  },
  { desc: 'DensDeck Cover Board 1/2"',           qty: 1477, unit: "BD",  up: 22,    total: 32494  },
  { desc: "Insulation Screws + Plates (500 ct)", qty: 24,   unit: "BX",  up: 145,   total: 3480   },
  { desc: "TPO Pipe Boots",                      qty: 24,   unit: "EA",  up: 35,    total: 840    },
  { desc: "Drain Assemblies",                    qty: 8,    unit: "EA",  up: 125,   total: 1000   },
];

const GC_ITEMS = [
  { cat: "Site Setup",      label: "Dumpster / Roll-off (4 pulls)", total: 2800  },
  { cat: "Site Setup",      label: "Temporary protection / tarps",  total: 1200  },
  { cat: "Safety",          label: "OSHA safety plan + site logs",  total: 850   },
  { cat: "Supervision",     label: "Project Manager (14 days)",     total: 7000  },
  { cat: "Insurance",       label: "Builder's Risk Insurance",      total: 2400  },
  { cat: "Markups",         label: "Overhead (10%)",                total: 61060 },
  { cat: "Markups",         label: "Profit (8%)",                   total: 48848 },
];

const DECISIONS = [
  { section: "Labor",    text: "Changed mech flashing labor from LF to EA per field team — 12 pcs @ $85 each vs $4.50/LF",                                              who: "Per John / Field Super",    time: "2h ago"  },
  { section: "Materials",text: "Selected Carlisle 60-mil TPO over Firestone — better Carlisle pricing from last quarter's purchase",                                     who: "Carlos / PM",               time: "5h ago"  },
  { section: "Scope",    text: "Counterflashing furnished by GC per pre-bid meeting notes — excluded from our scope",                                                   who: "Per pre-bid RFI response",  time: "1d ago"  },
  { section: "Pricing",  text: "Added 8% contingency for unknown deck conditions — owner confirmed building is pre-1990 with original decking",                         who: "Carlos",                    time: "1d ago"  },
];

const SECTION_HEALTH = [
  { label: "Checklist",  score: 72, color: "#3b82f6" },
  { label: "Scope",      score: 44, color: "#f59e0b" },
  { label: "Takeoff",    score: 91, color: "#10b981" },
  { label: "Materials",  score: 100,color: "#10b981" },
  { label: "Pricing",    score: 100,color: "#10b981" },
  { label: "Labor",      score: 100,color: "#10b981" },
  { label: "Quotes",     score: 80, color: "#3b82f6" },
  { label: "Addenda",    score: 100,color: "#10b981" },
  { label: "RFIs",       score: 60, color: "#f59e0b" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1" style={{ background: "#e2e8f0" }} />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>{children}</span>
      <div className="h-px flex-1" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function FeatureSection({ label, tag, children }: { label: string; tag: string; children: React.ReactNode }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>{tag}</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: "#0f172a" }}>{label}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={44} cy={44} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
      <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" transform="rotate(-90 44 44)" />
      <text x={44} y={49} textAnchor="middle" fontSize={16} fontWeight={800} fill={color}>{score}%</text>
    </svg>
  );
}

const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
  included:  { label: "Included",  bg: "#10b981", color: "#fff" },
  excluded:  { label: "Excluded",  bg: "#ef4444", color: "#fff" },
  by_others: { label: "By Others", bg: "#3b82f6", color: "#fff" },
};

const sectionColors: Record<string, { bg: string; color: string }> = {
  Labor:    { bg: "#fef3c7", color: "#92400e" },
  Materials:{ bg: "#fff7ed", color: "#c2410c" },
  Scope:    { bg: "#f0fdf4", color: "#166534" },
  Pricing:  { bg: "#ecfdf5", color: "#065f46" },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function BidShieldDemoPage() {
  return (
    <DemoGate>
    <div style={{ background: "var(--bs-bg-page)" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f2e20 100%)" }} className="px-4 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
            ✦ Built for commercial roofing estimators
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            See BidShield<br />in Action
          </h1>
          <p className="text-lg sm:text-xl mb-8" style={{ color: "#94a3b8", lineHeight: 1.6 }}>
            The bid review tool that catches what&apos;s missing<br className="hidden sm:block" /> before you submit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up"
              className="px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "#10b981", color: "#fff" }}>
              Start Free →
            </Link>
            <Link href="/bidshield/pricing"
              className="px-8 py-4 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.07)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}>
              See Pricing
            </Link>
          </div>

          {/* Mini stat row */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
            {[
              { n: "134",   label: "Checklist items" },
              { n: "17",    label: "Bid phases covered" },
              { n: "~$0",   label: "Cost per AI extract" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="text-2xl font-extrabold" style={{ color: "#34d399" }}>{n}</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE 1: Checklist ── */}
      <FeatureSection label="134-Item Bid Checklist" tag="Feature 1">
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div>
            <p className="text-base mb-6" style={{ color: "#475569", lineHeight: 1.7 }}>
              17 phases covering every step from plan review to submission. See exactly where your bid stands — and what&apos;s still missing.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Bulk mark complete / incomplete",
                "Phase-by-phase progress tracking",
                "Readiness score updates live",
                "Flag items for follow-up",
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#334155" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#dcfce7", color: "#166534" }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Checklist preview card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span className="text-xs font-bold text-slate-700">Bid Checklist</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fef3c7", color: "#92400e" }}>72% complete</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {CHECKLIST_PHASES.map((p) => {
                const pct = Math.round((p.done / p.total) * 100);
                const color = pct === 100 ? "#10b981" : pct >= 60 ? "#3b82f6" : "#f59e0b";
                return (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{p.label}</span>
                      <span className="text-[11px] text-slate-400">{p.done}/{p.total}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button className="flex-1 py-2 text-xs font-semibold rounded-lg" style={{ background: "#0f172a", color: "#fff" }}>Mark Phase Done</button>
              <button className="px-3 py-2 text-xs font-medium rounded-lg" style={{ background: "#f1f5f9", color: "#64748b" }}>Filter ▾</button>
            </div>
          </div>
        </div>
      </FeatureSection>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── FEATURE 2: Scope Tracker ── */}
      <FeatureSection label="Scope Tracker" tag="Feature 2">
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          {/* Scope preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg order-2 sm:order-1" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span className="text-xs font-bold text-slate-700">Scope Items</span>
              <div className="flex gap-1.5 text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded" style={{ background: "#dcfce7", color: "#166534" }}>4 Included</span>
                <span className="px-2 py-0.5 rounded" style={{ background: "#fee2e2", color: "#991b1b" }}>2 Excluded</span>
                <span className="px-2 py-0.5 rounded" style={{ background: "#dbeafe", color: "#1e40af" }}>2 By Others</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {SCOPE_ITEMS.map((item) => {
                const cfg = statusCfg[item.status];
                return (
                  <div key={item.name} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{item.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "linear-gradient(135deg, #059669, #0d9488)", color: "white" }}>
                ✨ Generate Exclusions with AI
              </button>
            </div>
          </div>

          <div className="order-1 sm:order-2">
            <p className="text-base mb-6" style={{ color: "#475569", lineHeight: 1.7 }}>
              Know exactly what&apos;s in your bid and what&apos;s not. Every item gets marked Included, Excluded, or By Others — so nothing falls through the cracks.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "40+ pre-loaded roofing scope items",
                "Excluded items copy straight into proposals",
                "\"By Others\" tracking prevents disputes",
                "AI generates a professional exclusions section",
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#334155" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#dcfce7", color: "#166534" }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FeatureSection>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── FEATURE 3: AI Quote Extraction ── WOW FEATURE ── */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #0f2e20 0%, #0f172a 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <SectionLabel>
            <span style={{ color: "#34d399" }}>Feature 3 — AI-Powered</span>
          </SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-white">AI Quote Extraction</h2>
          <p className="text-center mb-10 text-base" style={{ color: "#94a3b8" }}>
            Upload a vendor PDF — AI reads every line item in seconds.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 items-start">
            {/* Quote card preview */}
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Card header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="text-sm font-bold text-white">ABC Roofing Supply</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>Quote #2024-0891 · Expires Apr 30</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                    ✨ AI Extracted
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div className="overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="text-left px-4 py-2 font-semibold" style={{ color: "#64748b" }}>Item</th>
                      <th className="text-right px-2 py-2 font-semibold" style={{ color: "#64748b" }}>Qty</th>
                      <th className="text-right px-2 py-2 font-semibold" style={{ color: "#64748b" }}>Unit</th>
                      <th className="text-right px-4 py-2 font-semibold" style={{ color: "#64748b" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUOTE_LINE_ITEMS.map((li, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-4 py-2" style={{ color: "#e2e8f0" }}>{li.desc}</td>
                        <td className="px-2 py-2 text-right" style={{ color: "#94a3b8" }}>{li.qty}</td>
                        <td className="px-2 py-2 text-right" style={{ color: "#94a3b8" }}>{li.unit}</td>
                        <td className="px-4 py-2 text-right font-semibold" style={{ color: "#34d399" }}>${li.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(16,185,129,0.05)" }}>
                  <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Quote Total</span>
                  <span className="text-sm font-extrabold" style={{ color: "#34d399" }}>$101,712</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-8">
                <p className="text-base mb-6" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
                  Stop manually keying in vendor quotes. Drag a PDF onto BidShield — Claude AI reads the document and pulls out every line item, price, expiration date, and rep contact.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    "Works on any vendor PDF format",
                    "Extracts vendor, rep, quote #, expiration",
                    "Pulls every line item with qty + price",
                    "Compares prices against your library",
                    "Flags stale or expiring quotes automatically",
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#cbd5e1" }}>
                      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upload mockup */}
              <div className="rounded-xl p-5 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(16,185,129,0.3)" }}>
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm font-semibold text-white mb-1">Drop vendor quote PDF here</p>
                <p className="text-xs mb-4" style={{ color: "#64748b" }}>or click to upload</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                  <span className="text-xs font-medium" style={{ color: "#34d399" }}>AI extracting line items…</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── FEATURE 4: General Conditions ── */}
      <FeatureSection label="General Conditions Tracker" tag="Feature 4">
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div>
            <p className="text-base mb-6" style={{ color: "#475569", lineHeight: 1.7 }}>
              Track every indirect cost — dumpsters, crane time, supervision, insurance, bonding, and markups. These are the line items that get forgotten and kill your margins.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "6 categories: site, safety, supervision, insurance, bonding, markups",
                "Overhead % and Profit % calculated live",
                "GC total rolls up into Bid Summary",
                "Templates pre-loaded — add custom items",
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#334155" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#dcfce7", color: "#166534" }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* GC card preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-4 py-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span className="text-xs font-bold text-slate-700">General Conditions</span>
            </div>
            <div className="divide-y divide-slate-50">
              {GC_ITEMS.map((item) => (
                <div key={item.label} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-700 truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.cat}</div>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 shrink-0">${item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <span className="text-xs font-semibold text-slate-500">GC Total</span>
              <span className="text-sm font-extrabold text-emerald-600">${GC_ITEMS.reduce((s, i) => s + i.total, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </FeatureSection>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── FEATURE 5: Decision Log ── */}
      <FeatureSection label="Decision Log" tag="Feature 5">
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          {/* Decision log preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg order-2 sm:order-1" style={{ border: "1px solid #e2e8f0" }}>
            <div className="px-4 py-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span className="text-xs font-bold text-slate-700">Decision Log — Meridian Bldg C</span>
            </div>
            <div className="divide-y divide-slate-50">
              {DECISIONS.map((d, i) => {
                const cfg = sectionColors[d.section] ?? { bg: "#f1f5f9", color: "#475569" };
                return (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>{d.section}</span>
                      <span className="text-[10px] text-slate-400">{d.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug mb-1">{d.text}</p>
                    <p className="text-[10px] text-slate-400">{d.who}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-1 sm:order-2">
            <p className="text-base mb-6" style={{ color: "#475569", lineHeight: 1.7 }}>
              End review arguments — every estimating decision has a paper trail. Who decided what, when, and why. Share with PMs and reviewers before submission.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Log decisions from any section with one click",
                "Tagged by section: Labor, Materials, Scope…",
                "Timestamped with who made the call",
                "Searchable — find any decision instantly",
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#334155" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#dcfce7", color: "#166534" }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FeatureSection>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── FEATURE 6: Validate Dashboard ── */}
      <FeatureSection label="Validate Dashboard" tag="Feature 6">
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div>
            <p className="text-base mb-6" style={{ color: "#475569", lineHeight: 1.7 }}>
              One screen tells you if your bid is ready to submit. Section health scores, blockers, warnings, and a full Bid Summary — all in one place before you hit send.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Readiness score updates as you work",
                "Blockers must be resolved before submission",
                "Bid Summary: materials, labor, GC, $/SF",
                "Project quick-facts for final review",
              ].map(t => (
                <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "#334155" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#dcfce7", color: "#166534" }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Validator preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ border: "1px solid #e2e8f0" }}>
            {/* Score ring */}
            <div className="px-4 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <ScoreRing score={72} color="#f59e0b" />
              <div>
                <div className="text-sm font-bold text-slate-900">Bid Readiness</div>
                <div className="text-xs text-slate-500 mt-0.5">2 blockers · 3 warnings</div>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">2 Blockers</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">3 Warnings</span>
                </div>
              </div>
            </div>

            {/* Section health grid */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Section Health</div>
              <div className="grid grid-cols-3 gap-1.5">
                {SECTION_HEALTH.map((s) => (
                  <div key={s.label} className="rounded-lg px-2 py-1.5 text-center" style={{ background: "#f8fafc" }}>
                    <div className="text-[10px] font-semibold" style={{ color: s.color }}>{s.score}%</div>
                    <div className="text-[9px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini bid summary */}
            <div className="px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Bid Summary</div>
              <div className="flex flex-col gap-1.5 text-xs">
                {[
                  ["Materials",  "$612,000"],
                  ["Labor",      "$488,000"],
                  ["GC / Other", "$163,448"],
                  ["TOTAL BID",  "$1,250,000"],
                  ["$/SF",       "$18.38"],
                ].map(([label, val], i) => (
                  <div key={label} className={`flex justify-between ${i === 3 ? "font-bold border-t pt-1.5 mt-0.5 border-slate-200" : ""}`}
                    style={{ color: i === 3 ? "#0f172a" : "#475569" }}>
                    <span>{label}</span>
                    <span style={{ color: i === 3 ? "#10b981" : "#1e293b" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* ── PRICING CTA ── */}
      <section className="py-20 px-4" style={{ background: "#0f172a" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Ready to stop missing items on your bids?
          </h2>
          <p className="text-base mb-12" style={{ color: "#94a3b8" }}>
            Start free — upgrade to Pro when you need full pricing and AI features.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-12 text-left">
            {/* Free */}
            <div className="rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>Free</div>
              <div className="text-2xl font-extrabold text-white mb-4">$0</div>
              <ul className="flex flex-col gap-2.5 mb-6">
                {[
                  "134-item checklist",
                  "Scope tracker (read-only edit)",
                  "Takeoff & Materials",
                  "RFIs & Addenda tracking",
                  "Up to 5 Decision Log entries",
                  "1 project at a time",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
                    <span style={{ color: "#34d399" }}>✓</span> {t}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up"
                className="block w-full py-3 rounded-xl text-sm font-bold text-center transition-all hover:opacity-90"
                style={{ background: "#334155", color: "#e2e8f0" }}>
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #064e3b 0%, #0f2e20 100%)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}>
                Most Popular
              </div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#34d399" }}>Pro</div>
              <div className="text-2xl font-extrabold text-white mb-4">$249<span className="text-base font-normal" style={{ color: "#64748b" }}>/mo</span></div>
              <ul className="flex flex-col gap-2.5 mb-6">
                {[
                  "Everything in Free",
                  "✨ AI Quote Extraction (PDF upload)",
                  "✨ AI Generate Exclusions",
                  "✨ Draft RFI with AI",
                  "✨ Addendum Impact Check",
                  "Labor Rate Database",
                  "General Conditions tracker",
                  "Bid Quals tracker",
                  "Unlimited Decision Log entries",
                  "Full Bid Summary ($/SF)",
                  "Unlimited projects",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm" style={{ color: "#a7f3d0" }}>
                    <span style={{ color: "#34d399" }}>✓</span> {t}
                  </li>
                ))}
              </ul>
              <Link href="/bidshield/pricing"
                className="block w-full py-3 rounded-xl text-sm font-bold text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "#10b981", color: "#fff" }}>
                Go Pro — $249/mo
              </Link>
            </div>
          </div>

          <p className="text-xs" style={{ color: "#475569" }}>
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </section>

    </div>
    </DemoGate>
  );
}
