"use client";

import { useState } from "react";

// ── Project types that determine what BidShield pre-configures ──
const PROJECT_TYPES = [
  { id: "new_construction", label: "New Construction", icon: "🏗️", desc: "New building, full roof system install" },
  { id: "reroof", label: "Re-Roof / Tear-Off", icon: "🔄", desc: "Existing building, remove & replace" },
  { id: "recover", label: "Recover / Overlay", icon: "📐", desc: "Install new system over existing" },
  { id: "repair", label: "Repair / Maintenance", icon: "🔧", desc: "Targeted repairs, leak fixes" },
];

const SYSTEMS = [
  { id: "tpo", label: "TPO", popular: true },
  { id: "pvc", label: "PVC", popular: true },
  { id: "epdm", label: "EPDM", popular: true },
  { id: "sbs", label: "SBS Modified Bitumen", popular: false },
  { id: "app", label: "APP Modified Bitumen", popular: false },
  { id: "bur", label: "Built-Up (BUR)", popular: false },
  { id: "metal", label: "Standing Seam Metal", popular: false },
  { id: "spf", label: "Spray Foam (SPF)", popular: false },
];

const DECKS = [
  { id: "steel", label: "Steel Deck" },
  { id: "concrete", label: "Concrete Deck" },
  { id: "wood", label: "Wood / Plywood" },
  { id: "lightweight", label: "Lightweight Concrete" },
];

// What BidShield auto-configures based on selections
function getConfigSummary(projectType: string, system: string) {
  const configs: string[] = [];

  // Common to all
  configs.push("18-phase bid QA checklist");
  configs.push("Bid readiness scoring");

  // Project-type specific
  if (projectType === "new_construction") {
    configs.push("Structural review items (new deck)");
    configs.push("Full scope gap checker (40+ items)");
    configs.push("Vapor barrier & insulation checks");
  } else if (projectType === "reroof") {
    configs.push("Demolition & removal scope items");
    configs.push("Hazmat / asbestos checks");
    configs.push("Deck inspection & repair items");
    configs.push("Full scope gap checker (40+ items)");
  } else if (projectType === "recover") {
    configs.push("Existing conditions checklist");
    configs.push("Moisture scan / core cut items");
    configs.push("Reduced scope checker (overlay-specific)");
  } else if (projectType === "repair") {
    configs.push("Damage assessment items");
    configs.push("Warranty impact checks");
    configs.push("Simplified scope checker");
  }

  // System-specific
  if (system === "metal") {
    configs.push("Panel layout & clip spacing checks");
    configs.push("Expansion/contraction calculations");
  } else if (system === "spf") {
    configs.push("SPF density & thickness specs");
    configs.push("Coating system verification");
  } else if (system === "tpo" || system === "pvc") {
    configs.push("Membrane seam & detail checks");
    configs.push("Attachment pattern verification");
  } else if (system === "sbs" || system === "app" || system === "bur") {
    configs.push("Ply count & adhesion method checks");
    configs.push("Base/cap sheet specification review");
  }

  return configs;
}

const STEPS = [
  { label: "Project Type" },
  { label: "System" },
  { label: "Project Info" },
  { label: "Review" },
];

interface Props {
  onClose: () => void;
  onCreate: (data: {
    name: string; location: string; bidDate: string; trade: string;
    projectType: string; systemType: string; deckType: string;
    gc: string; sqft: string; totalBidAmount: string; assemblies: string;
  }) => void;
  isDemo?: boolean;
}

export default function NewBidWizard({ onClose, onCreate, isDemo }: Props) {
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState("");
  const [system, setSystem] = useState("");
  const [deck, setDeck] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bidDate, setBidDate] = useState("");
  const [gc, setGc] = useState("");
  const [sqft, setSqft] = useState("");
  const [totalBidAmount, setTotalBidAmount] = useState("");

  const canAdvance = [
    projectType !== "",                          // Step 0: must pick type
    system !== "",                                // Step 1: must pick system
    name !== "" && location !== "" && bidDate !== "", // Step 2: required fields
    true,                                         // Step 3: confirm
  ];

  const configs = getConfigSummary(projectType, system);
  const inputCls = "w-full py-2.5 px-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-colors";

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Progress */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`} />
            </div>
          ))}
        </div>
        <div className="px-6 pb-2 flex justify-between">
          {STEPS.map((s, i) => (
            <span key={i} className={`text-[10px] font-medium ${i === step ? "text-emerald-600" : i < step ? "text-slate-400" : "text-slate-300"}`}>{s.label}</span>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* ── Step 0: Project Type ── */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">What kind of project?</h3>
              <p className="text-sm text-slate-500 mb-5">This determines your checklist items and scope categories.</p>
              <div className="flex flex-col gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProjectType(t.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      projectType === t.id
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                      <div className="text-xs text-slate-500">{t.desc}</div>
                    </div>
                    {projectType === t.id && (
                      <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: System & Deck ── */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Roofing system</h3>
              <p className="text-sm text-slate-500 mb-5">Configures material checks and spec verification.</p>

              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular</div>
                <div className="grid grid-cols-3 gap-2">
                  {SYSTEMS.filter(s => s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSystem(s.id)}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                        system === s.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">All Systems</div>
                <div className="grid grid-cols-2 gap-2">
                  {SYSTEMS.filter(s => !s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSystem(s.id)}
                      className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                        system === s.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deck Type <span className="text-slate-300 normal-case">(optional)</span></div>
                <div className="flex flex-wrap gap-2">
                  {DECKS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDeck(deck === d.id ? "" : d.id)}
                      className={`py-1.5 px-3 rounded-lg border text-xs transition-all ${
                        deck === d.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Project Info ── */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Project details</h3>
              <p className="text-sm text-slate-500 mb-5">The basics. You can add more later.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Project name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Business Park" className={inputCls} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Location *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Charlotte, NC" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Bid date *</label>
                    <input type="date" value={bidDate} onChange={(e) => setBidDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">General contractor</label>
                    <input type="text" value={gc} onChange={(e) => setGc(e.target.value)} placeholder="Skanska USA" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Roof area (SF)</label>
                    <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="68000" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Estimated bid value ($)</label>
                  <input type="number" value={totalBidAmount} onChange={(e) => setTotalBidAmount(e.target.value)} placeholder="1250000" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review — show what gets configured ── */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your bid is ready to build</h3>
              <p className="text-sm text-slate-500 mb-5">Here's what BidShield will set up based on your selections:</p>

              {/* Summary card */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Project</span>
                  <span className="font-semibold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-700">{PROJECT_TYPES.find(t => t.id === projectType)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">System</span>
                  <span className="text-slate-700 uppercase">{system}</span>
                </div>
                {deck && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Deck</span>
                    <span className="text-slate-700">{DECKS.find(d => d.id === deck)?.label}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-700">{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bid date</span>
                  <span className="text-slate-700">{bidDate}</span>
                </div>
                {gc && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">GC</span>
                    <span className="text-slate-700">{gc}</span>
                  </div>
                )}
              </div>

              {/* What BidShield configures */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">🛡️ BidShield will configure</div>
                <div className="space-y-2">
                  {configs.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-between items-center bg-white">
          {step === 0 ? (
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
          ) : (
            <button onClick={() => setStep(step - 1)} className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => canAdvance[step] && setStep(step + 1)}
              disabled={!canAdvance[step]}
              className="py-2.5 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => onCreate({
                name, location, bidDate, trade: "roofing",
                projectType, systemType: system, deckType: deck,
                gc, sqft, totalBidAmount, assemblies: system ? system.toUpperCase() : "",
              })}
              className="py-2.5 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Create Project & Start →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
