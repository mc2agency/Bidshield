"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const SECTION_COLORS: Record<string, { bg: string; color: string }> = {
  Checklist:  { bg: "#eff6ff", color: "#1d4ed8" },
  Scope:      { bg: "#f0fdf4", color: "#166534" },
  Takeoff:    { bg: "#faf5ff", color: "#7e22ce" },
  Materials:  { bg: "#fff7ed", color: "#c2410c" },
  Pricing:    { bg: "#ecfdf5", color: "#065f46" },
  Labor:      { bg: "#fef3c7", color: "#92400e" },
  Quotes:     { bg: "#fdf4ff", color: "#86198f" },
  Addenda:    { bg: "#fffbeb", color: "#b45309" },
  RFIs:       { bg: "#fef2f2", color: "#991b1b" },
  Validate:   { bg: "#f8fafc", color: "#374151" },
  "Bid Quals":{ bg: "#eef2ff", color: "#4338ca" },
};

const ALL_SECTIONS = ["All", "Checklist", "Scope", "Takeoff", "Materials", "Pricing", "Labor", "Quotes", "Addenda", "RFIs", "Validate", "Bid Quals"];

const DEMO_DECISIONS = [
  { _id: "d1", section: "Labor", text: "Changed mech flashing labor from LF to EA per field team — 12 pcs @ $85 each vs $4.50/LF", who: "Per John / Field Super", timestamp: Date.now() - 1000 * 60 * 60 * 2 },
  { _id: "d2", section: "Materials", text: "Selected Carlisle 60-mil TPO over Firestone — better Carlisle pricing from last quarter's purchase", who: "Carlos / PM", timestamp: Date.now() - 1000 * 60 * 60 * 5 },
  { _id: "d3", section: "Scope", text: "Counterflashing is furnished by GC per pre-bid meeting notes — excluded from our scope", who: "Per pre-bid RFI response", timestamp: Date.now() - 1000 * 60 * 60 * 24 },
  { _id: "d4", section: "Pricing", text: "Added 8% contingency for unknown deck conditions — owner confirmed building is pre-1990 with original decking", who: "Carlos", timestamp: Date.now() - 1000 * 60 * 60 * 26 },
  { _id: "d5", section: "Takeoff", text: "Used 68,000 SF gross roof area from architect's drawing A-501 Rev B — not the original GC estimate of 71,200 SF", who: "Carlos", timestamp: Date.now() - 1000 * 60 * 60 * 48 },
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DecisionLogTab({ projectId, isDemo, isPro, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const decisionsRaw = useQuery(
    api.bidshield.getDecisions,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const deleteDecision = useMutation(api.bidshield.deleteDecision);

  const decisions = isDemo ? DEMO_DECISIONS : (decisionsRaw ?? []);

  const [filterSection, setFilterSection] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = decisions.filter((d: any) => {
    if (filterSection !== "All" && d.section !== filterSection) return false;
    if (search && !d.text.toLowerCase().includes(search.toLowerCase()) && !(d.who ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Count by section for filter tabs
  const countBySection = ALL_SECTIONS.slice(1).reduce((acc: Record<string, number>, s) => {
    acc[s] = decisions.filter((d: any) => d.section === s).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Decision Log</h2>
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          A paper trail of estimating decisions — who decided what and when. Share with PMs and reviewers to prevent second-guessing.
        </p>
      </div>

      {!isPro && !isDemo && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-amber-200" style={{ background: "#fffbeb" }}>
          <span className="text-sm text-amber-700">
            {decisions.length >= 10
              ? `Decision Log full (${decisions.length}/10) — upgrade to log unlimited decisions`
              : `Free plan: ${decisions.length}/10 decisions used`}
          </span>
          <a href="/bidshield/pricing" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 ml-4 shrink-0">
            Upgrade →
          </a>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <svg
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
          width={14} height={14} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search decisions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
            fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8,
            background: "#ffffff", color: "#111827", outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => (e.target.style.borderColor = "#94a3b8")}
          onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>

      {/* Section filter tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ALL_SECTIONS.map(s => {
          const count = s === "All" ? decisions.length : (countBySection[s] ?? 0);
          const isActive = filterSection === s;
          return (
            <button
              key={s}
              onClick={() => setFilterSection(s)}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                borderRadius: 6,
                border: isActive ? "1px solid #1e293b" : "1px solid #e2e8f0",
                background: isActive ? "#1e293b" : "#ffffff",
                color: isActive ? "#ffffff" : count === 0 ? "#d1d5db" : "#374151",
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              {s}{count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {/* Decision list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto" style={{ marginBottom: 10 }}>
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
            {search || filterSection !== "All" ? "No matching decisions" : "No decisions logged yet"}
          </div>
          <p style={{ fontSize: 13, color: "#9ca3af", maxWidth: 360, margin: "0 auto" }}>
            Use the "Log Decision" button on any section page to record why you made an estimating call.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((d: any) => {
            const style = SECTION_COLORS[d.section] ?? { bg: "#f8fafc", color: "#374151" };
            return (
              <div
                key={d._id}
                className="bg-white rounded-xl border border-slate-200 p-4 group"
                style={{ borderLeft: `3px solid ${style.color}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999,
                        background: style.bg, color: style.color,
                      }}>
                        {d.section}
                      </span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatTime(d.timestamp)}</span>
                      {d.who && (
                        <span style={{ fontSize: 11, color: "#6b7280" }}>— {d.who}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: "#111827", lineHeight: 1.5 }}>{d.text}</p>
                  </div>
                  {!isDemo && (
                    <button
                      onClick={() => deleteDecision({ id: d._id as Id<"bidshield_decisions"> })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: "#d1d5db", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#d1d5db"}
                      title="Delete"
                    >
                      <svg width={14} height={14} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
