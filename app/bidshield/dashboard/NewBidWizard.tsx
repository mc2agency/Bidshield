"use client";

import React, { useState } from "react";

// ── Project types that determine what BidShield pre-configures ──
const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
  new_construction: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>,
  reroof: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  recover: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" /></svg>,
  repair: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.65-4.65 3.086-3.086a1 1 0 0 1 1.414 1.414l-3.086 3.086m-5.65 4.65-.649-.352M6.75 7.5l4.59-4.59a1.952 1.952 0 0 1 2.763 2.763L9.513 9.672" /></svg>,
};
const PROJECT_TYPES = [
  { id: "new_construction", label: "New Construction", desc: "New building, full roof system install" },
  { id: "reroof", label: "Re-Roof / Tear-Off", desc: "Existing building, remove & replace" },
  { id: "recover", label: "Recover / Overlay", desc: "Install new system over existing" },
  { id: "repair", label: "Repair / Maintenance", desc: "Targeted repairs, leak fixes" },
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
  { id: "gypsum", label: "Gypsum Deck" },
  { id: "tectum", label: "Tectum / Cementwood" },
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
  const inputCls = "w-full py-2.5 px-3 rounded-lg text-sm outline-none transition-colors";
  const inputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" };

  return (
    <div onClick={onClose} className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {/* Progress */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? "var(--bs-teal)" : "var(--bs-bg-elevated)" }} />
            </div>
          ))}
        </div>
        <div className="px-6 pb-2 flex justify-between">
          {STEPS.map((s, i) => (
            <span key={i} className="text-[10px] font-medium" style={{ color: i === step ? "var(--bs-teal)" : i < step ? "var(--bs-text-muted)" : "var(--bs-text-dim)" }}>{s.label}</span>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* ── Step 0: Project Type ── */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>What kind of project?</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>This determines your checklist items and scope categories.</p>
              <div className="flex flex-col gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProjectType(t.id)}
                    className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                    style={projectType === t.id
                      ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)" }
                      : { border: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}
                  >
                    <span className="flex-shrink-0" style={{ color: "var(--bs-text-muted)" }}>{PROJECT_TYPE_ICONS[t.id]}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--bs-text-primary)" }}>{t.label}</div>
                      <div className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{t.desc}</div>
                    </div>
                    {projectType === t.id && (
                      <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--bs-teal)" }}>
                        <svg className="w-3 h-3" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
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
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Roofing system</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>Configures material checks and spec verification.</p>

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Popular</div>
                <div className="grid grid-cols-3 gap-2">
                  {SYSTEMS.filter(s => s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSystem(s.id)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                      style={system === s.id
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>All Systems</div>
                <div className="grid grid-cols-2 gap-2">
                  {SYSTEMS.filter(s => !s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSystem(s.id)}
                      className="py-2 px-3 rounded-lg text-sm transition-all"
                      style={system === s.id
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Deck Type <span className="normal-case" style={{ color: "var(--bs-text-dim)" }}>(optional)</span></div>
                <div className="flex flex-wrap gap-2">
                  {DECKS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDeck(deck === d.id ? "" : d.id)}
                      className="py-1.5 px-3 rounded-lg text-xs transition-all"
                      style={deck === d.id
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
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
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Project details</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>The basics. You can add more later.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Project name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Business Park" className={inputCls} style={inputStyle} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Location *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Charlotte, NC" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Bid date *</label>
                    <input type="date" value={bidDate} onChange={(e) => setBidDate(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>General contractor</label>
                    <input type="text" value={gc} onChange={(e) => setGc(e.target.value)} placeholder="Skanska USA" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Roof area (SF)</label>
                    <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="68000" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Estimated bid value ($)</label>
                  <input type="number" value={totalBidAmount} onChange={(e) => setTotalBidAmount(e.target.value)} placeholder="1250000" className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review — show what gets configured ── */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Your bid is ready to build</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>Here's what BidShield will set up based on your selections:</p>

              {/* Summary card */}
              <div className="rounded-xl p-4 mb-5 space-y-2" style={{ background: "var(--bs-bg-elevated)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Project</span>
                  <span className="font-semibold" style={{ color: "var(--bs-text-primary)" }}>{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Type</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{PROJECT_TYPES.find(t => t.id === projectType)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>System</span>
                  <span className="uppercase" style={{ color: "var(--bs-text-secondary)" }}>{system}</span>
                </div>
                {deck && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>Deck</span>
                    <span style={{ color: "var(--bs-text-secondary)" }}>{DECKS.find(d => d.id === deck)?.label}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Location</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Bid date</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{bidDate}</span>
                </div>
                {gc && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>GC</span>
                    <span style={{ color: "var(--bs-text-secondary)" }}>{gc}</span>
                  </div>
                )}
              </div>

              {/* What BidShield configures */}
              <div className="rounded-xl p-4" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--bs-teal)" }}>BidShield will configure</div>
                <div className="space-y-2">
                  {configs.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--bs-teal)" }}>
                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-bg-card)" }}>
          {step === 0 ? (
            <button onClick={onClose} className="text-sm transition-colors" style={{ color: "var(--bs-text-dim)" }}>Cancel</button>
          ) : (
            <button onClick={() => setStep(step - 1)} className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--bs-text-muted)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => canAdvance[step] && setStep(step + 1)}
              disabled={!canAdvance[step]}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
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
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Create Project & Start →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
