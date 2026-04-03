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

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 -mb-1">
        Record how and when this bid was submitted. This closes the loop on the 5-phase workflow.
      </p>

      {/* Existing submissions */}
      {list.length > 0 && (
        <div className="flex flex-col gap-3">
          {list.map((s: any) => (
            <div key={s._id} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {METHOD_LABELS[s.method] ?? s.method}
                    </span>
                    <span className="text-xs text-slate-500">{fmtDateTime(s.submittedAt)}</span>
                  </div>
                  {s.portalOrRecipient && (
                    <div className="text-sm text-slate-700 mb-0.5">
                      <span className="text-slate-400 text-xs">To: </span>{s.portalOrRecipient}
                    </div>
                  )}
                  {s.confirmationNumber && (
                    <div className="text-sm text-slate-700 mb-0.5">
                      <span className="text-slate-400 text-xs">Confirmation: </span>
                      <span className="font-mono">{s.confirmationNumber}</span>
                    </div>
                  )}
                  {s.notes && (
                    <div className="text-xs text-slate-500 mt-1 italic">{s.notes}</div>
                  )}
                </div>
                {!isDemo && (
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="text-xs text-slate-400 hover:text-red-500 flex-shrink-0 transition-colors"
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
        <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
          <div className="text-slate-400 text-2xl mb-2">📤</div>
          <div className="text-sm text-slate-500">No submission recorded yet.</div>
          <div className="text-xs text-slate-400 mt-1">Log how this bid was delivered once it&rsquo;s submitted.</div>
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Log Submission</h3>
          {error && <div className="text-xs text-red-600 bg-red-50 rounded p-2 mb-3">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Submission Method *</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as SubmissionMethod })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              >
                {SUBMISSION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Date &amp; Time Submitted *</label>
              <input
                type="datetime-local"
                value={form.submittedAt}
                onChange={(e) => setForm({ ...form, submittedAt: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Portal URL / Recipient</label>
              <input
                type="text"
                value={form.portalOrRecipient}
                onChange={(e) => setForm({ ...form, portalOrRecipient: e.target.value })}
                placeholder="e.g. bids@gc.com or portal URL"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Confirmation Number</label>
              <input
                type="text"
                value={form.confirmationNumber}
                onChange={(e) => setForm({ ...form, confirmationNumber: e.target.value })}
                placeholder="Portal or email confirmation #"
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 mb-1 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any follow-up required, clarifications submitted, etc."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm resize-none focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#10b981" }}
              className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Submission"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors"
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
              style={{ background: "#10b981" }}
              className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Log Submission
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
            >
              🔒 Log Submission · Pro
            </a>
          )}
        </div>
      )}
    </div>
  );
}
