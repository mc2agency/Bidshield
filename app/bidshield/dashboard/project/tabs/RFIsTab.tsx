"use client";
import { DEMO_RFIS as IMPORTED_RFIS } from "@/lib/bidshield/demo-data";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

type RFIStatus = "draft" | "sent" | "answered" | "closed";

const statusConfig: Record<RFIStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "var(--bs-text-muted)", bg: "var(--bs-bg-elevated)" },
  sent: { label: "Sent", color: "var(--bs-amber)", bg: "var(--bs-amber-dim)" },
  answered: { label: "Answered", color: "var(--bs-blue)", bg: "var(--bs-blue-dim)" },
  closed: { label: "Closed", color: "var(--bs-teal)", bg: "var(--bs-teal-dim)" },
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

export default function RFIsTab({ projectId, isDemo, isPro, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const convexRFIs = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const createRFIMut = useMutation(api.bidshield.createRFI);
  const updateRFIMut = useMutation(api.bidshield.updateRFI);
  const deleteRFIMut = useMutation(api.bidshield.deleteRFI);

  const [demoRFIState, setDemoRFIState] = useState(demoRFIs as any[]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newSentTo, setNewSentTo] = useState("");
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<RFIStatus | "all">("all");
  const [draftAiContext, setDraftAiContext] = useState("");
  const [draftAiLoading, setDraftAiLoading] = useState(false);

  const rfis = isDemo ? demoRFIState : (convexRFIs ?? []);
  const filteredRFIs = filter === "all" ? rfis : rfis.filter((r: { status: string }) => r.status === filter);

  const handleCreate = async () => {
    if (!newQuestion.trim()) return;
    if (isDemo) {
      setDemoRFIState(p => [...p, { _id: `demo_rfi_${Date.now()}`, number: p.length + 1, question: newQuestion, sentTo: newSentTo || undefined, status: "draft", createdAt: Date.now(), updatedAt: Date.now() }]);
    } else {
      await createRFIMut({ projectId: projectId as Id<"bidshield_projects">, userId: userId || "", question: newQuestion, sentTo: newSentTo || undefined });
    }
    setNewQuestion(""); setNewSentTo(""); setDraftAiContext(""); setShowCreateModal(false);
  };

  const handleDraftWithAI = async () => {
    if (!draftAiContext.trim()) return;
    setDraftAiLoading(true);
    try {
      const res = await fetch("/api/bidshield/draft-rfi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: draftAiContext }),
      });
      const data = await res.json();
      if (data.text) setNewQuestion(data.text);
    } catch {
      // leave textarea as-is
    } finally {
      setDraftAiLoading(false);
    }
  };

  const handleSend = async (rfiId: Id<"bidshield_rfis">) => {
    if (isDemo) { setDemoRFIState(p => p.map(r => r._id === rfiId ? { ...r, status: "sent", sentAt: Date.now() } : r)); return; }
    await updateRFIMut({ rfiId, status: "sent", sentAt: Date.now() });
  };

  const handleMarkAnswered = async (rfiId: Id<"bidshield_rfis">) => {
    const text = responseTexts[rfiId as string] || "";
    if (!text.trim()) return;
    if (isDemo) { setDemoRFIState(p => p.map(r => r._id === rfiId ? { ...r, status: "answered", response: text, respondedAt: Date.now() } : r)); }
    else { await updateRFIMut({ rfiId, status: "answered", response: text, respondedAt: Date.now() }); }
    setResponseTexts(prev => { const next = { ...prev }; delete next[rfiId as string]; return next; });
    setSelectedRFI(null);
  };

  const handleClose = async (rfiId: Id<"bidshield_rfis">) => {
    if (isDemo) { setDemoRFIState(p => p.map(r => r._id === rfiId ? { ...r, status: "closed" } : r)); return; }
    await updateRFIMut({ rfiId, status: "closed" });
  };

  const handleDelete = async (rfiId: Id<"bidshield_rfis">) => {
    if (!confirm("Delete this RFI?")) return;
    if (isDemo) { setDemoRFIState(p => p.filter(r => r._id !== rfiId)); setSelectedRFI(null); return; }
    if (!userId) return;
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
  const pendingCount = statusCounts.draft + statusCounts.sent;
  const items = rfis;

  return (
    <div className="flex flex-col gap-5">

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <div className="flex items-stretch rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {([
          { label: "Total", value: statusCounts.all, color: "var(--bs-text-primary)" },
          { label: "Draft", value: statusCounts.draft, color: "var(--bs-text-muted)" },
          { label: "Sent", value: statusCounts.sent, color: "var(--bs-amber)" },
          { label: "Answered", value: statusCounts.answered, color: "var(--bs-blue)" },
          { label: "Closed", value: statusCounts.closed, color: "var(--bs-teal)" },
        ] as const).map(({ label, value, color }, i) => (
          <div key={label} className={`flex-1 px-5 py-4 flex flex-col gap-1`} style={i > 0 ? { borderLeft: "1px solid var(--bs-border)" } : {}}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>{label}</p>
            <p className="text-3xl font-black leading-none tabular-nums tracking-tight" style={{ color }}>{value}</p>
          </div>
        ))}
        {pendingCount > 0 && (
          <div className="flex items-center px-5" style={{ borderLeft: "1px solid var(--bs-border)" }}>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>
              {pendingCount} pending
            </span>
          </div>
        )}
        {items.length > 0 && pendingCount === 0 && (
          <div className="flex items-center px-5" style={{ borderLeft: "1px solid var(--bs-border)" }}>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>
              All resolved
            </span>
          </div>
        )}
      </div>

      {/* ── TOOLBAR ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "draft", "sent", "answered", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="h-7 px-3 text-[11px] font-semibold rounded-full transition-colors duration-150 cursor-pointer uppercase tracking-wide"
              style={filter === s
                ? { background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", color: "var(--bs-teal)" }
                : { background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }
              }
            >
              {s === "all" ? "All" : statusConfig[s].label}
              {statusCounts[s] > 0 && <span className="ml-1 opacity-60">· {statusCounts[s]}</span>}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreateModal(true)} disabled={isDemo}
          className="h-8 px-4 text-[12px] font-semibold rounded-lg disabled:opacity-50 shrink-0 cursor-pointer"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}>
          + New RFI
        </button>
      </div>

      {/* ── RFI TABLE ─────────────────────────────────────────────────────────── */}
      {filteredRFIs.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg className="w-6 h-6" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--bs-text-secondary)" }}>No RFIs {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
          <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--bs-text-dim)" }}>Open RFIs show as warnings in Validate — log them to keep your bid status accurate.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Question</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest w-28" style={{ color: "var(--bs-text-dim)" }}>Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hidden sm:table-cell" style={{ color: "var(--bs-text-dim)" }}>Sent To</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hidden md:table-cell w-28" style={{ color: "var(--bs-text-dim)" }}>Date</th>
                <th className="px-5 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRFIs.map((rfi: any) => {
                const config = statusConfig[rfi.status as RFIStatus];
                const isExpanded = selectedRFI === (rfi._id as string);
                const statusColors: Record<RFIStatus, React.CSSProperties> = {
                  draft: { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" },
                  sent: { background: "var(--bs-amber-dim)", color: "var(--bs-amber)" },
                  answered: { background: "var(--bs-blue-dim)", color: "var(--bs-blue)" },
                  closed: { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" },
                };

                return (
                  <>
                    <tr
                      key={rfi._id as string}
                      onClick={() => setSelectedRFI(isExpanded ? null : (rfi._id as string))}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid var(--bs-border)", background: isExpanded ? "var(--bs-bg-elevated)" : undefined }}
                      onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"; }}
                      onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm leading-snug line-clamp-2" style={{ color: "var(--bs-text-secondary)" }}>{rfi.question}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest" style={statusColors[rfi.status as RFIStatus] ?? { background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{rfi.sentTo ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>{new Date(rfi.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${rfi._id}-detail`} style={{ borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                        <td colSpan={5} className="px-5 py-4">
                          {rfi.response && (
                            <div className="mb-3 p-3 rounded-lg" style={{ background: "var(--bs-blue-dim)", border: "1px solid var(--bs-blue-border, var(--bs-border))" }}>
                              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-blue)" }}>Response</div>
                              <p className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{rfi.response}</p>
                            </div>
                          )}
                          {rfi.status === "sent" && !isDemo && (
                            <div className="mb-3">
                              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-dim)" }}>Record Response</label>
                              <textarea
                                value={responseTexts[rfi._id as string] || ""}
                                onChange={(e) => setResponseTexts((prev) => ({ ...prev, [rfi._id as string]: e.target.value }))}
                                placeholder="Paste or type the response received..."
                                rows={2}
                                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
                                style={{ background: "var(--bs-bg-input, var(--bs-bg-card))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                              />
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {rfi.status === "draft" && (
                              <button onClick={() => handleSend(rfi._id)} disabled={isDemo} className="h-7 px-3 text-[11px] font-bold rounded-lg disabled:opacity-50 cursor-pointer" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>Mark Sent</button>
                            )}
                            {rfi.status === "sent" && (
                              <button onClick={() => handleMarkAnswered(rfi._id)} disabled={isDemo || !(responseTexts[rfi._id as string] || "").trim()} className="h-7 px-3 text-[11px] font-bold rounded-lg disabled:opacity-50 cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Mark Answered</button>
                            )}
                            {(rfi.status === "answered" || rfi.status === "sent") && (
                              <button onClick={() => handleClose(rfi._id)} disabled={isDemo} className="h-7 px-3 text-[11px] font-bold rounded-lg disabled:opacity-50 cursor-pointer" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}>Close</button>
                            )}
                            {!isDemo && (
                              <button onClick={() => handleDelete(rfi._id)} className="h-7 px-3 ml-auto text-[11px] font-bold rounded-lg cursor-pointer" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div onClick={(e) => e.stopPropagation()} className="rounded-2xl p-6 w-full max-w-lg" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--bs-text-primary)" }}>New RFI</h2>
            <div className="space-y-4 mb-6">
              {(isPro || isDemo) && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--bs-teal)" }}>Draft with AI</label>
                  <p className="text-[11px] mb-2" style={{ color: "var(--bs-teal)" }}>Describe what&apos;s unclear and AI will write a professional RFI question.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={draftAiContext}
                      onChange={(e) => setDraftAiContext(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleDraftWithAI(); }}
                      placeholder="e.g., Conflicting deck type between drawings and spec"
                      className="flex-1 text-xs rounded-md px-2 py-1.5 focus:outline-none"
                      style={{ background: "var(--bs-bg-input, var(--bs-bg-card))", border: "1px solid var(--bs-teal-border)", color: "var(--bs-text-primary)" }}
                    />
                    <button
                      onClick={handleDraftWithAI}
                      disabled={!draftAiContext.trim() || draftAiLoading}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md disabled:opacity-50"
                      style={{ background: "var(--bs-teal)", color: "#13151a" }}
                    >
                      {draftAiLoading ? "…" : "Draft"}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--bs-text-muted)" }}>Question *</label>
                <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="What needs clarification?" rows={4} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--bs-text-muted)" }}>Send To (email)</label>
                <input type="email" value={newSentTo} onChange={(e) => setNewSentTo(e.target.value)} placeholder="architect@example.com" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background: "var(--bs-bg-input, var(--bs-bg-elevated))", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-sm" style={{ color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={!newQuestion.trim()} className="px-5 py-2.5 font-semibold rounded-lg text-sm disabled:opacity-50" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Create RFI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
