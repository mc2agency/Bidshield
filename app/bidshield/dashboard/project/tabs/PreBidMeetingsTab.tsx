"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const emptyForm = {
  meetingDate: "",
  mandatory: false,
  location: "",
  attendees: "",
  notes: "",
};

export default function PreBidMeetingsTab({ projectId, isDemo, isPro, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const meetings = useQuery(
    api.bidshield.getPreBidMeetings,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const addMeeting = useMutation(api.bidshield.addPreBidMeeting);
  const updateMeeting = useMutation(api.bidshield.updatePreBidMeeting);
  const deleteMeeting = useMutation(api.bidshield.deletePreBidMeeting);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const demoMeetings = [
    {
      _id: "demo_mtg_1",
      meetingDate: "2026-02-12",
      mandatory: true,
      location: "Charlotte Convention Center, Room 4B",
      attendees: "J. Maldonado (MC2), GC rep, Architect rep",
      notes: "Owner confirmed 20-yr NDL warranty requirement. Wet insulation in NE quadrant acknowledged — separate demo allowance may be issued via addendum.",
    },
  ];

  const list = isDemo ? demoMeetings : (meetings ?? []);

  const startEdit = (m: any) => {
    setForm({
      meetingDate: m.meetingDate ?? "",
      mandatory: m.mandatory ?? false,
      location: m.location ?? "",
      attendees: m.attendees ?? "",
      notes: m.notes ?? "",
    });
    setEditingId(m._id);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.meetingDate) { setError("Meeting date is required."); return; }
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await updateMeeting({
          meetingId: editingId as Id<"bidshield_prebid_meetings">,
          userId: userId!,
          meetingDate: form.meetingDate,
          mandatory: form.mandatory,
          location: form.location || undefined,
          attendees: form.attendees || undefined,
          notes: form.notes || undefined,
        });
        setEditingId(null);
      } else {
        await addMeeting({
          projectId: projectId as Id<"bidshield_projects">,
          userId: userId!,
          meetingDate: form.meetingDate,
          mandatory: form.mandatory,
          location: form.location || undefined,
          attendees: form.attendees || undefined,
          notes: form.notes || undefined,
        });
        setShowForm(false);
      }
      setForm(emptyForm);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save meeting.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await deleteMeeting({
      meetingId: id as Id<"bidshield_prebid_meetings">,
      userId,
    });
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const isEditing = showForm || editingId !== null;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm -mb-1" style={{ color: "var(--bs-text-muted)" }}>
        Log pre-bid meetings for this project. Mandatory attendance and key notes often drive addenda.
      </p>

      {/* Meeting list */}
      {list.length > 0 && (
        <div className="flex flex-col gap-3">
          {list.map((m: any) => (
            editingId === m._id ? (
              <MeetingForm
                key={m._id}
                form={form}
                setForm={setForm}
                error={error}
                saving={saving}
                onSave={handleSave}
                onCancel={cancel}
              />
            ) : (
              <div key={m._id} className="rounded-xl p-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold" style={{ color: "var(--bs-text-secondary)" }}>{m.meetingDate}</span>
                      {m.mandatory ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>Mandatory</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wide" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)" }}>Optional</span>
                      )}
                    </div>
                    {m.location && (
                      <div className="text-xs mb-0.5" style={{ color: "var(--bs-text-muted)" }}>
                        <span style={{ color: "var(--bs-text-dim)" }}>Location: </span>{m.location}
                      </div>
                    )}
                    {m.attendees && (
                      <div className="text-xs mb-0.5" style={{ color: "var(--bs-text-muted)" }}>
                        <span style={{ color: "var(--bs-text-dim)" }}>Attendees: </span>{m.attendees}
                      </div>
                    )}
                    {m.notes && (
                      <div className="text-xs mt-1.5 italic pl-2" style={{ color: "var(--bs-text-muted)", borderLeft: "2px solid var(--bs-border)" }}>{m.notes}</div>
                    )}
                  </div>
                  {!isDemo && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs transition-colors"
                        style={{ color: "var(--bs-text-dim)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"; }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-xs transition-colors"
                        style={{ color: "var(--bs-text-dim)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-red)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"; }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {list.length === 0 && !isEditing && (
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg className="w-5 h-5" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
          </div>
          <div className="text-sm" style={{ color: "var(--bs-text-muted)" }}>No pre-bid meetings logged.</div>
          <div className="text-xs mt-1" style={{ color: "var(--bs-text-dim)" }}>Add one if a site walk or pre-bid conference was held.</div>
        </div>
      )}

      {/* Add form */}
      {showForm && !editingId && (
        <MeetingForm
          form={form}
          setForm={setForm}
          error={error}
          saving={saving}
          onSave={handleSave}
          onCancel={cancel}
        />
      )}

      {/* Add button */}
      {!isEditing && (
        <div>
          {(isPro || isDemo) ? (
            <button
              onClick={() => { if (!isDemo) setShowForm(true); }}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              + Add Meeting
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="text-xs font-medium transition-colors"
              style={{ color: "var(--bs-text-dim)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-teal)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"; }}
            >
              <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Add Meeting · Pro
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MeetingForm({
  form, setForm, error, saving, onSave, onCancel,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  error: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--bs-text-primary)" }}>Pre-Bid Meeting</h3>
      {error && <div className="text-xs rounded p-2 mb-3" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-muted)" }}>Meeting Date *</label>
          <input
            type="date"
            value={form.meetingDate}
            onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          />
        </div>
        <div>
          <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-muted)" }}>Attendance</label>
          <div className="flex items-center gap-4 pt-2">
            {[
              { label: "Mandatory", value: true },
              { label: "Optional", value: false },
            ].map((opt) => (
              <label key={String(opt.value)} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="mandatory"
                  checked={form.mandatory === opt.value}
                  onChange={() => setForm({ ...form, mandatory: opt.value })}
                  style={{ accentColor: "var(--bs-teal)" }}
                />
                <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-muted)" }}>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Address or virtual link"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-muted)" }}>Attendees</label>
          <input
            type="text"
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: e.target.value })}
            placeholder="Names, companies, or roles"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-muted)" }}>Key Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Key takeaways, scope clarifications, items that may affect addenda…"
            rows={3}
            className="w-full rounded px-3 py-2 text-sm resize-none focus:outline-none"
            style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
          {saving ? "Saving…" : "Save Meeting"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm px-4 py-2 transition-colors"
          style={{ color: "var(--bs-text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
