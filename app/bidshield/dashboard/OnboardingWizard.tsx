"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const TRADES = [
  { id: "roofing", label: "Commercial Roofing", icon: "🏗️", available: true },
  { id: "concrete", label: "Concrete", icon: "🧱", available: false },
  { id: "electrical", label: "Electrical", icon: "⚡", available: false },
  { id: "mechanical", label: "Mechanical / HVAC", icon: "⚙️", available: false },
  { id: "plumbing", label: "Plumbing", icon: "🔧", available: false },
  { id: "steel", label: "Structural Steel", icon: "🔩", available: false },
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
  { id: "gypsum", label: "Gypsum" },
  { id: "tectum", label: "Tectum" },
];

interface Props {
  userId: string;
  onComplete: (projectId: string) => void;
  onSkip: () => void;
}

export default function OnboardingWizard({ userId, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [trade, setTrade] = useState("roofing");
  const [systemType, setSystemType] = useState("");
  const [deckType, setDeckType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [bidDate, setBidDate] = useState("");
  const [gc, setGc] = useState("");
  const [sqft, setSqft] = useState("");
  const [creating, setCreating] = useState(false);

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
        systemType: systemType || undefined,
        deckType: deckType || undefined,
        gc: gc || undefined,
        sqft: sqft ? parseInt(sqft) : undefined,
        assemblies: systemType ? [systemType.toUpperCase()] : [],
      });
      onComplete(projectId);
    } catch (err) {
      console.error("Failed to create project:", err);
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome to BidShield
              </h2>
              <p className="text-slate-600 mb-8">
                Your bid-day assistant. Let&apos;s set up your first project in 60 seconds.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Create My First Project
              </button>
              <button
                onClick={onSkip}
                className="mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now — I&apos;ll explore first
              </button>
            </div>
          )}

          {/* Step 1: Trade & System */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                What&apos;s your trade?
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                This customizes your checklist and scope items.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {TRADES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => t.available && setTrade(t.id)}
                    disabled={!t.available}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      trade === t.id
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : t.available
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-slate-100 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="block mt-1 font-medium text-slate-700">{t.label}</span>
                    {!t.available && (
                      <span className="text-[10px] text-slate-400">Coming soon</span>
                    )}
                  </button>
                ))}
              </div>

              {trade === "roofing" && (
                <>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Primary roofing system
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {SYSTEMS.roofing.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSystemType(s.id)}
                        className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                          systemType === s.id
                            ? "border-emerald-500 bg-emerald-50 font-medium"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Deck type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DECKS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDeckType(d.id)}
                        className={`py-1.5 px-3 rounded-lg border text-sm transition-all ${
                          deckType === d.id
                            ? "border-emerald-500 bg-emerald-50 font-medium"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
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
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="py-2.5 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Project details
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                Tell us about the bid you&apos;re working on.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Project name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Harbor Point Tower"
                    className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jersey City, NJ"
                    className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Bid date *
                    </label>
                    <input
                      type="date"
                      value={bidDate}
                      onChange={(e) => setBidDate(e.target.value)}
                      className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Roof area (SF)
                    </label>
                    <input
                      type="number"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    General Contractor
                  </label>
                  <input
                    type="text"
                    value={gc}
                    onChange={(e) => setGc(e.target.value)}
                    placeholder="e.g. Turner Construction"
                    className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (projectName && location && bidDate) setStep(3);
                  }}
                  disabled={!projectName || !location || !bidDate}
                  className="py-2.5 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & Create */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Ready to go
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Here&apos;s what BidShield will set up for you:
              </p>

              <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Project</span>
                  <span className="font-medium text-slate-900">{projectName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-700">{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bid Date</span>
                  <span className="text-slate-700">{bidDate}</span>
                </div>
                {systemType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">System</span>
                    <span className="text-slate-700 uppercase">{systemType}</span>
                  </div>
                )}
                {gc && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">GC</span>
                    <span className="text-slate-700">{gc}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-600">✓</span>
                  16-phase bid checklist customized for {systemType?.toUpperCase() || "roofing"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-600">✓</span>
                  40 scope gap items pre-loaded
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-600">✓</span>
                  Bid readiness scoring active
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-600">✓</span>
                  Takeoff reconciliation ready
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="py-3 px-8 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
