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

  const cardStyle = { background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 12 };
  const sectionTitle = (t: string) => (
    <h2 className="text-sm font-semibold mb-0.5" style={{ color: "var(--bs-text-primary)" }}>{t}</h2>
  );
  const sectionDesc = (t: string) => (
    <p className="text-xs mb-4" style={{ color: "var(--bs-text-dim)" }}>{t}</p>
  );
  const fieldRow = (label: string, children: React.ReactNode) => (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-xs font-medium" style={{ color: "var(--bs-text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
  const inputStyle: React.CSSProperties = { ...selectStyle, width: "100%", borderRadius: 8 };
  const placeholderInput = (placeholder: string) => (
    <input disabled placeholder={placeholder} style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Settings</h1>
        <p className="text-sm" style={{ color: "var(--bs-text-dim)" }}>Manage your account, team, and notification preferences.</p>
      </div>

      {/* Profile */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Profile")}
        {sectionDesc("Your name and contact info as it appears in exported documents.")}
        {fieldRow("Full Name", <input defaultValue={user?.fullName ?? ""} placeholder="Your full name" style={inputStyle} />)}
        {fieldRow("Email", <input defaultValue={user?.emailAddresses[0]?.emailAddress ?? ""} disabled placeholder="Email" style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />)}
        {fieldRow("Company", <input placeholder="Company name (optional)" style={inputStyle} />)}
        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-teal)", color: "#fff", border: "none", cursor: "pointer" }}>
          Save Profile
        </button>
      </div>

      {/* Team / Seats */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Team & Seats")}
        {sectionDesc("Manage estimators on your Pro plan. Each seat gets full dashboard access.")}
        <div className="flex items-center justify-between py-3 rounded-lg px-3 mb-3" style={{ background: "var(--bs-bg-elevated)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>Pro plan — 1 seat included</span>
          <span className="text-xs px-2 py-1 rounded font-bold" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>Active</span>
        </div>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", cursor: "pointer" }}>
          + Invite team member
        </button>
        <p className="text-[11px] mt-2" style={{ color: "var(--bs-text-dim)" }}>Additional seats are $79/mo each. Contact support to add seats.</p>
      </div>

      {/* Notifications */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Notifications")}
        {sectionDesc("Choose when BidShield sends you alerts.")}
        {[
          { label: "Bid date approaching (3 days out)", defaultOn: true },
          { label: "Quote expiring soon", defaultOn: true },
          { label: "Checklist completion milestone", defaultOn: false },
          { label: "New RFI submitted", defaultOn: true },
        ].map(({ label, defaultOn }) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--bs-border)" }}>
            <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full peer-checked:bg-blue-600 bg-gray-300 peer-focus:outline-none after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Integrations")}
        {sectionDesc("Connect external tools to BidShield.")}
        {[
          { name: "Procore", desc: "Sync bid packages and documents", status: "coming_soon" },
          { name: "Autodesk Build", desc: "Import RFIs and submittals", status: "coming_soon" },
          { name: "QuickBooks", desc: "Export bid totals to accounting", status: "coming_soon" },
        ].map(({ name, desc, status }) => (
          <div key={name} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: "var(--bs-border)" }}>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>{name}</div>
              <div className="text-xs" style={{ color: "var(--bs-text-dim)" }}>{desc}</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)" }}>
              {status === "coming_soon" ? "Coming soon" : "Connected"}
            </span>
          </div>
        ))}
      </div>

      {/* Billing shortcut */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Billing")}
        {sectionDesc("Manage your subscription, payment method, and invoices.")}
        <a href="/bidshield/pricing" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", textDecoration: "none" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" /></svg>
          Manage Billing & Subscription →
        </a>
      </div>

      {/* Security */}
      <div className="p-5" style={cardStyle}>
        {sectionTitle("Security")}
        {sectionDesc("Password, two-factor authentication, and active sessions.")}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>Password</div>
              <div className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Last changed: unknown</div>
            </div>
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", cursor: "pointer" }}>
              Change password
            </button>
          </div>
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--bs-border)" }}>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>Two-factor authentication</div>
              <div className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Add an extra layer of security to your account</div>
            </div>
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", cursor: "pointer" }}>
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* System Substitutions */}
      <div className="p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-1">
          {sectionTitle("Preferred System Substitutions")}
          {saveStatus !== "idle" && (
            <span className="text-xs font-medium" style={{ color: saveStatus === "saved" ? "var(--bs-teal)" : "var(--bs-text-dim)" }}>
              {saveStatus === "saving" ? "Saving…" : "✓ Saved"}
            </span>
          )}
        </div>
        {sectionDesc("When an assembly is detected with a generic system type, BidShield will suggest swapping it to your preferred product. You still confirm each swap.")}

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
          <button onClick={addSub} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", cursor: "pointer" }}>
            + Add substitution
          </button>
          <button onClick={handleSave} disabled={saveStatus === "saving"} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--bs-teal)", color: "#fff", border: "none", cursor: "pointer", opacity: saveStatus === "saving" ? 0.7 : 1 }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
