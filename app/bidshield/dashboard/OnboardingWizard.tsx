"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const TRADES = [
  { id: "roofing", label: "Commercial Roofing", available: true },
  { id: "concrete", label: "Concrete", available: false },
  { id: "electrical", label: "Electrical", available: false },
  { id: "mechanical", label: "Mechanical / HVAC", available: false },
  { id: "plumbing", label: "Plumbing", available: false },
  { id: "steel", label: "Structural Steel", available: false },
];

const SYSTEMS: Record<string, { id: string; label: string }[]> = {
  roofing: [
    { id: "tpo", label: "TPO" },
    { id: "pvc", label: "PVC" },
    { id: "epdm", label: "EPDM" },
    { id: "sbs", label: "SBS Modified Bitumen" },
    { id: "app", label: "APP Modified Bitumen" },
    { id: "bur", label: "Built-Up Roofing (BUR)" },
    { id: "metal", label: "Metal (Standing Seam)" },
    { id: "spf", label: "Spray Foam (SPF)" },
  ],
};

const DECKS = [
  { id: "steel", label: "Steel Deck" },
  { id: "concrete", label: "Concrete Deck" },
  { id: "wood", label: "Wood Deck" },
  { id: "lightweight", label: "Lightweight Concrete" },
  { id: "gypsum", label: "Gypsum Deck" },
  { id: "tectum", label: "Tectum / Cementwood" },
];

interface Props {
  userId: string;
  onComplete: (projectId: string) => void;
  onSkip: () => void;
}

export default function OnboardingWizard({ userId, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [trade, setTrade] = useState("roofing");
  const [systemTypes, setSystemTypes] = useState<string[]>([]);
  const [deckType, setDeckType] = useState("");

  const toggleSystem = (id: string) => {
    setSystemTypes((prev: string[]) =>
      prev.includes(id) ? prev.filter((s: string) => s !== id) : [...prev, id]
    );
  };
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [bidDate, setBidDate] = useState("");
  const [gc, setGc] = useState("");
  const [sqft, setSqft] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const createProject = useMutation(api.bidshield.createProject);

  const handleCreate = async () => {
    if (!projectName || !location || !bidDate) return;
    setCreating(true);
    try {
      const projectId = await createProject({
        userId,
        name: projectName,
        location,
        bidDate,
        trade,
        systemType: systemTypes[0] || undefined,
        deckType: deckType || undefined,
        gc: gc || undefined,
        sqft: sqft ? parseInt(sqft) : undefined,
        assemblies: systemTypes.map((s: string) => s.toUpperCase()),
        roofAssemblies: systemTypes.length > 0
          ? systemTypes.map((s: string, i: number) => ({ label: `RT-0${i + 1}`, systemType: s }))
          : undefined,
      });
      setCreatedProjectId(projectId);
      setStep(4); // success + upgrade nudge screen
    } catch (err) {
      console.error("Failed to create project:", err);
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl max-w-lg w-full overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {/* Progress bar */}
        <div className="h-1" style={{ background: "var(--bs-bg-elevated)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: step === 4 ? "100%" : `${((step + 1) / 4) * 100}%`, background: "var(--bs-teal)" }}
          />
        </div>

        <div className="p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-teal-dim)" }}>
                <svg className="w-7 h-7" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
              </div>
              <h2 className="app-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
                Welcome to BidShield
              </h2>
              <p className="mb-8" style={{ color: "var(--bs-text-secondary)" }}>
                Your bid QA and workflow tool. Let&apos;s set up your first project in 60 seconds.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer"
                style={{ background: "var(--bs-teal)", color: "#13151a" }}
              >
                Create My First Project
              </button>
              <button
                onClick={onSkip}
                className="mt-3 text-sm transition-colors"
                style={{ color: "var(--bs-text-dim)" }}
              >
                Skip for now — I&apos;ll explore first
              </button>
            </div>
          )}

          {/* Step 1: Trade & System */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--bs-text-primary)" }}>
                What&apos;s your trade?
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>
                This customizes your checklist and scope items.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {TRADES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => t.available && setTrade(t.id)}
                    disabled={!t.available}
                    className="p-3 rounded-xl text-left text-sm transition-all"
                    style={trade === t.id
                      ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)" }
                      : t.available
                      ? { border: "1px solid var(--bs-border)" }
                      : { border: "1px solid var(--bs-border)", opacity: 0.4, cursor: "not-allowed" }}
                  >
                    <span className="block mt-1 font-medium" style={{ color: "var(--bs-text-secondary)" }}>{t.label}</span>
                    {!t.available && (
                      <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>Coming soon</span>
                    )}
                  </button>
                ))}
              </div>

              {trade === "roofing" && (
                <>
                  <label className="text-sm font-medium block mb-2" style={{ color: "var(--bs-text-secondary)" }}>
                    Roofing systems <span className="font-normal" style={{ color: "var(--bs-text-dim)" }}>(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {SYSTEMS.roofing.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toggleSystem(s.id)}
                        className="py-2 px-3 rounded-lg text-sm transition-all flex items-center justify-between"
                        style={systemTypes.includes(s.id)
                          ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", fontWeight: 500, color: "var(--bs-teal)" }
                          : { border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                      >
                        {s.label}
                        {systemTypes.includes(s.id) && (
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                  {systemTypes.length > 1 && (
                    <p className="text-xs mb-4" style={{ color: "var(--bs-teal)" }}>{systemTypes.length} systems selected</p>
                  )}

                  <label className="text-sm font-medium block mb-2" style={{ color: "var(--bs-text-secondary)" }}>
                    Deck type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DECKS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDeckType(d.id)}
                        className="py-1.5 px-3 rounded-lg text-sm transition-all"
                        style={deckType === d.id
                          ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", fontWeight: 500, color: "var(--bs-teal)" }
                          : { border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(0)}
                  className="text-sm"
                  style={{ color: "var(--bs-text-dim)" }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--bs-text-primary)" }}>
                Project details
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>
                Tell us about the bid you&apos;re working on.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                    Project name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Meridian Business Park"
                    className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Charlotte, NC"
                    className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                      Bid date *
                    </label>
                    <input
                      type="date"
                      value={bidDate}
                      onChange={(e) => setBidDate(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                      Roof area (SF)
                    </label>
                    <input
                      type="number"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      placeholder="e.g. 68000"
                      className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                    General Contractor
                  </label>
                  <input
                    type="text"
                    value={gc}
                    onChange={(e) => setGc(e.target.value)}
                    placeholder="e.g. Skanska USA"
                    className="w-full py-2.5 px-3 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm"
                  style={{ color: "var(--bs-text-dim)" }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (projectName && location && bidDate) setStep(3);
                  }}
                  disabled={!projectName || !location || !bidDate}
                  className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success + Upgrade nudge */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-teal-dim)" }}>
                <svg className="w-7 h-7" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--bs-text-primary)" }}>
                Your bid review is ready
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>
                <strong>{projectName}</strong> is set up with your 18-phase checklist, takeoff tracker, scope gap checker, and bid readiness scoring.
              </p>

              <button
                onClick={() => createdProjectId && onComplete(createdProjectId)}
                className="w-full py-3 px-8 rounded-xl text-sm font-semibold transition-colors mb-4"
                style={{ background: "var(--bs-teal)", color: "#13151a" }}
              >
                Start Reviewing My Bid →
              </button>

              <div className="mt-2 pt-5" style={{ borderTop: "1px solid var(--bs-border)" }}>
                <p className="text-xs mb-3" style={{ color: "var(--bs-text-muted)" }}>
                  Bidding more than one job? Upgrade for unlimited projects, PDF export, and win/loss analytics.
                </p>
                <a
                  href="/bidshield/pricing"
                  className="block w-full text-center py-2.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ border: "1px solid var(--bs-teal)", color: "var(--bs-teal)" }}
                >
                  Start 14-Day Pro Trial — No Card Required
                </a>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Create */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--bs-text-primary)" }}>
                Ready to go
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>
                Here&apos;s what BidShield will set up for you:
              </p>

              <div className="rounded-xl p-5 mb-6 space-y-3" style={{ background: "var(--bs-bg-elevated)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Project</span>
                  <span className="font-medium" style={{ color: "var(--bs-text-primary)" }}>{projectName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Location</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Bid Date</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{bidDate}</span>
                </div>
                {systemTypes.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>Systems</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {systemTypes.map(s => (
                        <span key={s} className="uppercase text-xs py-0.5 px-2 rounded" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {gc && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>GC</span>
                    <span style={{ color: "var(--bs-text-secondary)" }}>{gc}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-8">
                {[
                  `18-phase bid QA checklist customized for ${systemTypes.length > 0 ? systemTypes.map(s => s.toUpperCase()).join(" + ") : "roofing"}`,
                  "40 scope gap items pre-loaded",
                  "Bid readiness scoring active",
                  "Takeoff reconciliation ready",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--bs-text-secondary)" }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm"
                  style={{ color: "var(--bs-text-dim)" }}
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="py-3 px-8 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ background: "var(--bs-teal)", color: "#13151a" }}
                >
                  {creating ? "Creating project..." : "Create Project & Start"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
