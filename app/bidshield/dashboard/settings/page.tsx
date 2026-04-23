"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

const SYSTEMS = [
  { id: "tpo", label: "TPO" },
  { id: "pvc", label: "PVC" },
  { id: "epdm", label: "EPDM" },
  { id: "sbs", label: "SBS Modified Bitumen" },
  { id: "app", label: "APP Modified Bitumen" },
  { id: "bur", label: "Built-Up (BUR)" },
  { id: "metal", label: "Standing Seam Metal" },
  { id: "spf", label: "Spray Foam (SPF)" },
  { id: "lam", label: "Liquid Applied Membrane (IRMA)" },
  { id: "hydrotech", label: "Hydrotech (IRMA)" },
];

type Sub = { from: string; to: string };

export default function SettingsPage() {
  const { user } = useUser();
  const clerkId = user?.id ?? "";

  const saved = useQuery(api.users.getSystemSubstitutions, clerkId ? { clerkId } : "skip");
  const saveSubs = useMutation(api.users.saveSystemSubstitutions);

  const [subs, setSubs] = useState<Sub[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (saved) setSubs(saved);
  }, [saved]);

  const addSub = () => setSubs(prev => [...prev, { from: "", to: "" }]);
  const removeSub = (i: number) => setSubs(prev => prev.filter((_, idx) => idx !== i));
  const updateSub = (i: number, field: "from" | "to", val: string) => {
    setSubs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSave = async () => {
    if (!clerkId) return;
    setSaveStatus("saving");
    await saveSubs({ clerkId, substitutions: subs.filter(s => s.from && s.to) });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const selectStyle = {
    background: "var(--bs-bg-elevated)",
    border: "1px solid var(--bs-border)",
    color: "var(--bs-text-primary)",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Account Settings</h1>
      <p className="text-sm mb-8" style={{ color: "var(--bs-text-dim)" }}>Preferences that apply to your account across all projects.</p>

      {/* System Substitutions */}
      <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold" style={{ color: "var(--bs-text-primary)" }}>Preferred System Substitutions</h2>
          {saveStatus !== "idle" && (
            <span className="text-xs font-medium" style={{ color: saveStatus === "saved" ? "var(--bs-teal)" : "var(--bs-text-dim)" }}>
              {saveStatus === "saving" ? "Saving…" : "✓ Saved"}
            </span>
          )}
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--bs-text-dim)" }}>
          When an assembly is detected with a generic system type, BidShield will suggest swapping it to your preferred product. You still confirm each swap — nothing changes automatically.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {subs.length === 0 && (
            <p className="text-xs py-3 text-center" style={{ color: "var(--bs-text-muted)" }}>No substitutions set. Add one below.</p>
          )}
          {subs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <select value={s.from} onChange={e => updateSub(i, "from", e.target.value)} style={selectStyle}>
                <option value="">Detected as…</option>
                {SYSTEMS.map(sys => <option key={sys.id} value={sys.id}>{sys.label}</option>)}
              </select>
              <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>→ use</span>
              <select value={s.to} onChange={e => updateSub(i, "to", e.target.value)} style={selectStyle}>
                <option value="">Your preferred…</option>
                {SYSTEMS.map(sys => <option key={sys.id} value={sys.id}>{sys.label}</option>)}
              </select>
              <button onClick={() => removeSub(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bs-text-dim)", fontSize: 12, padding: "0 4px" }}>✕</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addSub}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", cursor: "pointer" }}
          >
            + Add substitution
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "var(--bs-teal)", color: "#13151a", border: "none", cursor: "pointer", opacity: saveStatus === "saving" ? 0.7 : 1 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
