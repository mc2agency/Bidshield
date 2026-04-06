"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const SUBMISSION_METHODS = [
  { value: "email",          label: "Email" },
  { value: "portal",         label: "Online Portal" },
  { value: "hand_delivered", label: "Hand Delivered" },
  { value: "mail",           label: "Mail / Courier" },
  { value: "fax",            label: "Fax" },
  { value: "other",          label: "Other" },
] as const;

type SubmissionMethod = typeof SUBMISSION_METHODS[number]["value"];

const METHOD_LABELS: Record<string, string> = Object.fromEntries(
  SUBMISSION_METHODS.map((m) => [m.value, m.label])
);

function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const emptyForm = {
  method: "email" as SubmissionMethod,
  portalOrRecipient: "",
  confirmationNumber: "",
  submittedAt: new Date().toISOString().slice(0, 16), // datetime-local value
  notes: "",
};

export default function SubmissionTab({ projectId, isDemo, isPro, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const submissions = useQuery(
    api.bidshield.getSubmissions,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const addSubmission = useMutation(api.bidshield.addSubmission);
  const deleteSubmission = useMutation(api.bidshield.deleteSubmission);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Demo mode: show a sample submission
  const demoSubmissions = [
    {
      _id: "demo_sub_1",
      method: "portal",
      portalOrRecipient: "Skanska BidMail Portal",
      confirmationNumber: "SM-2026-04821",
      submittedAt: Date.now() - 3600_000,
      notes: "Submitted base bid + Alt 1. Received auto-confirmation email.",
    },
  ];

  const list = isDemo ? demoSubmissions : (submissions ?? []);

  const handleSave = async () => {
    if (!form.method) { setError("Submission method is required."); return; }
    if (!form.submittedAt) { setError("Submission date/time is required."); return; }
    setError("");
    setSaving(true);
    try {
      await addSubmission({
        projectId: projectId as Id<"bidshield_projects">,
        userId: userId!,
        method: form.method,
        portalOrRecipient: form.portalOrRecipient || undefined,
        confirmationNumber: form.confirmationNumber || undefined,
        submittedAt: new Date(form.submittedAt).getTime(),
        notes: form.notes || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save submission.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await deleteSubmission({
      submissionId: id as Id<"bidshield_submissions">,
      userId,
    });
  };

  const inputCls = "w-full rounded px-3 py-2 text-sm focus:outline-none bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm -mb-1" style={{ color: "var(--bs-text-muted)" }}>
        Record how and when this bid was submitted. This closes the loop on the 5-phase workflow.
      </p>

      {/* Existing submissions */}
      {list.length > 0 && (
        <div className="flex flex-col gap-3">
          {list.map((s: any) => (
            <div key={s._id} className="rounded-xl p-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>
                      {METHOD_LABELS[s.method] ?? s.method}
                    </span>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{fmtDateTime(s.submittedAt)}</span>
                  </div>
                  {s.portalOrRecipient && (
                    <div className="text-sm mb-0.5" style={{ color: "var(--bs-text-secondary)" }}>
                      <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>To: </span>{s.portalOrRecipient}
                    </div>
                  )}
                  {s.confirmationNumber && (
                    <div className="text-sm mb-0.5" style={{ color: "var(--bs-text-secondary)" }}>
                      <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Confirmation: </span>
                      <span className="font-mono">{s.confirmationNumber}</span>
                    </div>
                  )}
                  {s.notes && (
                    <div className="text-xs mt-1 italic" style={{ color: "var(--bs-text-dim)" }}>{s.notes}</div>
                  )}
                </div>
                {!isDemo && (
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-xs flex-shrink-0 transition-colors"
                    style={{ color: "var(--bs-text-dim)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}
                    title="Delete submission record"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {list.length === 0 && !showForm && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-bg-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
          </div>
          <div className="text-sm" style={{ color: "var(--bs-text-muted)" }}>No submission recorded yet.</div>
          <div className="text-xs mt-1" style={{ color: "var(--bs-text-dim)" }}>Log how this bid was delivered once it&rsquo;s submitted.</div>
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--bs-text-primary)" }}>Log Submission</h3>
          {error && <div className="text-xs rounded p-2 mb-3" style={{ color: "var(--bs-red)", background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Submission Method *</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as SubmissionMethod })}
                className={inputCls}
              >
                {SUBMISSION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Date &amp; Time Submitted *</label>
              <input
                type="datetime-local"
                value={form.submittedAt}
                onChange={(e) => setForm({ ...form, submittedAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Portal URL / Recipient</label>
              <input
                type="text"
                value={form.portalOrRecipient}
                onChange={(e) => setForm({ ...form, portalOrRecipient: e.target.value })}
                placeholder="e.g. bids@gc.com or portal URL"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Confirmation Number</label>
              <input
                type="text"
                value={form.confirmationNumber}
                onChange={(e) => setForm({ ...form, confirmationNumber: e.target.value })}
                placeholder="Portal or email confirmation #"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any follow-up required, clarifications submitted, etc."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {saving ? "Saving…" : "Save Submission"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="text-sm px-4 py-2 transition-colors"
              style={{ color: "var(--bs-text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-text-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-muted)")}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {(isPro || isDemo) ? (
            <button
              onClick={() => { if (!isDemo) setShowForm(true); }}
              className="text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              + Log Submission
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="text-xs font-medium transition-colors"
              style={{ color: "var(--bs-text-dim)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "var(--bs-teal)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)")}
            >
              <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Log Submission · Pro
            </a>
          )}
        </div>
      )}
    </div>
  );
}
