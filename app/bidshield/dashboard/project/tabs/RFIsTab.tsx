"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

type RFIStatus = "draft" | "sent" | "answered" | "closed";

const statusConfig: Record<RFIStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-slate-500", bg: "bg-slate-100" },
  sent: { label: "Sent", color: "text-amber-600", bg: "bg-amber-50" },
  answered: { label: "Answered", color: "text-blue-600", bg: "bg-blue-50" },
  closed: { label: "Closed", color: "text-emerald-600", bg: "bg-emerald-50" },
};

const demoRFIs = [
  {
    _id: "demo_rfi_1" as Id<"bidshield_rfis">,
    projectId: "demo_1" as Id<"bidshield_projects">,
    userId: "demo",
    question: "Are the parapet walls concrete or CMU? Drawing A-401 shows conflicting details.",
    sentTo: "architect@smithgroup.com",
    sentAt: Date.now() - 86400000 * 3,
    response: "Parapet walls are CMU with brick veneer. See updated detail on A-401 Rev 2.",
    respondedAt: Date.now() - 86400000,
    status: "answered" as const,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "demo_rfi_2" as Id<"bidshield_rfis">,
    projectId: "demo_1" as Id<"bidshield_projects">,
    userId: "demo",
    question: "Spec section 07 52 00 calls for 60mil TPO but detail 5/A-501 shows EPDM. Which system should we price?",
    sentTo: "pm@turnerconstruction.com",
    sentAt: Date.now() - 86400000 * 2,
    status: "sent" as const,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    _id: "demo_rfi_3" as Id<"bidshield_rfis">,
    projectId: "demo_1" as Id<"bidshield_projects">,
    userId: "demo",
    question: "Is there an existing roof survey available? Need to confirm deck type for fastener pattern.",
    status: "draft" as const,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

export default function RFIsTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const convexRFIs = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const createRFIMut = useMutation(api.bidshield.createRFI);
  const updateRFIMut = useMutation(api.bidshield.updateRFI);
  const deleteRFIMut = useMutation(api.bidshield.deleteRFI);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newSentTo, setNewSentTo] = useState("");
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<RFIStatus | "all">("all");

  const rfis = isDemo ? demoRFIs : (convexRFIs ?? []);
  const filteredRFIs = filter === "all" ? rfis : rfis.filter((r: { status: string }) => r.status === filter);

  const handleCreate = async () => {
    if (!newQuestion.trim() || isDemo) return;
    await createRFIMut({
      projectId: projectId as Id<"bidshield_projects">,
      userId: userId || "",
      question: newQuestion,
      sentTo: newSentTo || undefined,
    });
    setNewQuestion("");
    setNewSentTo("");
    setShowCreateModal(false);
  };

  const handleSend = async (rfiId: Id<"bidshield_rfis">) => {
    if (isDemo) return;
    await updateRFIMut({ rfiId, status: "sent", sentAt: Date.now() });
  };

  const handleMarkAnswered = async (rfiId: Id<"bidshield_rfis">) => {
    const text = responseTexts[rfiId as string] || "";
    if (isDemo || !text.trim()) return;
    await updateRFIMut({ rfiId, status: "answered", response: text, respondedAt: Date.now() });
    setResponseTexts((prev) => { const next = { ...prev }; delete next[rfiId as string]; return next; });
    setSelectedRFI(null);
  };

  const handleClose = async (rfiId: Id<"bidshield_rfis">) => {
    if (isDemo) return;
    await updateRFIMut({ rfiId, status: "closed" });
  };

  const handleDelete = async (rfiId: Id<"bidshield_rfis">) => {
    if (isDemo || !userId) return;
    if (!confirm("Delete this RFI? This cannot be undone.")) return;
    await deleteRFIMut({ rfiId, userId });
    setSelectedRFI(null);
  };

  const statusCounts = {
    all: rfis.length,
    draft: rfis.filter((r: { status: string }) => r.status === "draft").length,
    sent: rfis.filter((r: { status: string }) => r.status === "sent").length,
    answered: rfis.filter((r: { status: string }) => r.status === "answered").length,
    closed: rfis.filter((r: { status: string }) => r.status === "closed").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">📨 RFIs — {project?.name || "Project"}</h2>
          <p className="text-sm text-slate-500">Track questions sent to GCs, architects, and engineers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isDemo}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          + New RFI
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "sent", "answered", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              filter === s ? "bg-emerald-600 text-slate-900" : "bg-white text-slate-500 hover:text-slate-900"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s].label} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {filteredRFIs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-5xl mb-4">📨</div>
          <p className="text-slate-500 mb-2">No RFIs {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
          <p className="text-sm text-slate-500">Create an RFI to track questions for this project.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRFIs.map((rfi: any) => {
            const config = statusConfig[rfi.status as RFIStatus];
            const isExpanded = selectedRFI === (rfi._id as string);

            return (
              <div key={rfi._id as string} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  onClick={() => setSelectedRFI(isExpanded ? null : (rfi._id as string))}
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${config.color} ${config.bg}`}>
                        {config.label}
                      </span>
                      {rfi.sentTo && <span className="text-[11px] text-slate-500">To: {rfi.sentTo}</span>}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{rfi.question}</p>
                    <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
                      <span>Created: {new Date(rfi.createdAt).toLocaleDateString()}</span>
                      {rfi.sentAt && <span>Sent: {new Date(rfi.sentAt).toLocaleDateString()}</span>}
                      {rfi.respondedAt && <span>Answered: {new Date(rfi.respondedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{isExpanded ? "▼" : "▶"}</span>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50">
                    {rfi.response && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="text-[11px] font-semibold text-blue-600 mb-1">Response:</div>
                        <p className="text-sm text-slate-600">{rfi.response}</p>
                      </div>
                    )}
                    {rfi.status === "sent" && !isDemo && (
                      <div className="mb-4">
                        <label className="block text-xs text-slate-500 mb-1">Record Response</label>
                        <textarea
                          value={responseTexts[rfi._id as string] || ""}
                          onChange={(e) => setResponseTexts((prev) => ({ ...prev, [rfi._id as string]: e.target.value }))}
                          placeholder="Paste or type the response received..."
                          rows={3}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {rfi.status === "draft" && (
                        <button onClick={() => handleSend(rfi._id)} disabled={isDemo} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">Mark as Sent</button>
                      )}
                      {rfi.status === "sent" && (
                        <button onClick={() => handleMarkAnswered(rfi._id)} disabled={isDemo || !(responseTexts[rfi._id as string] || "").trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">Mark Answered</button>
                      )}
                      {(rfi.status === "answered" || rfi.status === "sent") && (
                        <button onClick={() => handleClose(rfi._id)} disabled={isDemo} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">Close RFI</button>
                      )}
                      {!isDemo && (
                        <button onClick={() => handleDelete(rfi._id)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-600 text-xs font-semibold rounded-lg transition-colors ml-auto">🗑 Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">New RFI</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Question *</label>
                <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="What needs clarification?" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Send To (email)</label>
                <input type="email" value={newSentTo} onChange={(e) => setNewSentTo(e.target.value)} placeholder="architect@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 border border-slate-300 text-slate-500 rounded-lg text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={!newQuestion.trim()} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">Create RFI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
