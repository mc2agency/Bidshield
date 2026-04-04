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
      <p className="text-sm text-slate-500 -mb-1">
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
              <div key={m._id} className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-800">{m.meetingDate}</span>
                      {m.mandatory ? (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wide">Mandatory</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-wide">Optional</span>
                      )}
                    </div>
                    {m.location && (
                      <div className="text-xs text-slate-600 mb-0.5">
                        <span className="text-slate-400">Location: </span>{m.location}
                      </div>
                    )}
                    {m.attendees && (
                      <div className="text-xs text-slate-600 mb-0.5">
                        <span className="text-slate-400">Attendees: </span>{m.attendees}
                      </div>
                    )}
                    {m.notes && (
                      <div className="text-xs text-slate-500 mt-1.5 italic border-l-2 border-slate-200 pl-2">{m.notes}</div>
                    )}
                  </div>
                  {!isDemo && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
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
        <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
          </div>
          <div className="text-sm text-slate-500">No pre-bid meetings logged.</div>
          <div className="text-xs text-slate-400 mt-1">Add one if a site walk or pre-bid conference was held.</div>
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
              style={{ background: "#10b981" }}
              className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              + Add Meeting
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
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
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Pre-Bid Meeting</h3>
      {error && <div className="text-xs text-red-600 bg-red-50 rounded p-2 mb-3">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-slate-500 mb-1 block">Meeting Date *</label>
          <input
            type="date"
            value={form.meetingDate}
            onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 mb-1 block">Attendance</label>
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
                  style={{ accentColor: "#10b981" }}
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] text-slate-500 mb-1 block">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Address or virtual link"
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] text-slate-500 mb-1 block">Attendees</label>
          <input
            type="text"
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: e.target.value })}
            placeholder="Names, companies, or roles"
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] text-slate-500 mb-1 block">Key Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Key takeaways, scope clarifications, items that may affect addenda…"
            rows={3}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm resize-none focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          style={{ background: "#10b981" }}
          className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Meeting"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
