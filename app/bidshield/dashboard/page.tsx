"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import OnboardingWizard from "./OnboardingWizard";
import NewBidWizard from "./NewBidWizard";
import { track } from "@vercel/analytics";

// ============================================================
// DELETE CONFIRM DIALOG
// ============================================================
function DeleteConfirmDialog({ projectName, onConfirm, onCancel }: {
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Delete bid?</h2>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">&ldquo;{projectName}&rdquo;</span>? This will permanently remove the project and all related data.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// UPGRADE MODAL
// ============================================================
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;ve reached your free plan limit</h2>
          <p className="text-slate-500 text-sm mb-6">Upgrade to Pro for unlimited projects &mdash; $249/month</p>
          <a href="/bidshield/pricing" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-center transition-colors shadow-sm cursor-pointer">
            Upgrade to Pro &rarr;
          </a>
          <button onClick={onClose} className="mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

interface BidProject {
  _id: Id<"bidshield_projects">;
  name: string;
  location: string;
  bidDate: string;
  status: string;
  gc?: string;
  sqft?: number;
  totalBidAmount?: number;
  assemblies?: string[];
  userId: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}

const demoProjects = [
  {
    _id: "demo_1" as Id<"bidshield_projects">,
    name: "Meridian Business Park — Bldg C",
    location: "Charlotte, NC",
    bidDate: "2026-03-07",
    status: "in_progress" as const,
    gc: "Skanska USA",
    sqft: 68000,
    totalBidAmount: 1250000,
    assemblies: ["TPO 60mil", "Tapered ISO"],
    userId: "demo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const demoStats = {
  activeProjects: 1,
  expiringQuotes: 1,
  openRFIs: 3,
  pipelineValue: 1250000,
  wonProjects: 8,
  lostProjects: 5,
  winRate: 62,
  wonValue: 3200000,
};

// ============================================================
// STAT CARD
// ============================================================
function StatCard({ value, label, dimmed, icon, accent = "#059669" }: {
  value: string | number;
  label: string;
  dimmed?: boolean;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
      style={{ boxShadow: "var(--bs-shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        {icon && <span style={{ color: dimmed ? "#cbd5e1" : accent }} className="opacity-60">{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: dimmed ? "#cbd5e1" : "var(--bs-text-primary)" }}>
        {dimmed ? "—" : value}
      </div>
    </div>
  );
}

// ============================================================
// WELCOME CARD (zero-project state)
// ============================================================
function WelcomeCard({ onNewBid, onDismiss }: { onNewBid: () => void; onDismiss: () => void }) {
  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-10 text-center">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 transition-colors" aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to BidShield</h2>
      <p className="text-slate-500 text-sm mb-6">Start your first bid review to catch what estimating software misses.</p>
      <button
        onClick={onNewBid}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        + New Bid
      </button>
      <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 mt-6 text-xs text-slate-400">
        <span>1. Create a project</span>
        <span className="text-slate-300">→</span>
        <span>2. Run through the checklist</span>
        <span className="text-slate-300">→</span>
        <span>3. Validate before you submit</span>
      </div>
    </div>
  );
}

// ============================================================
// PROJECT TABLE (desktop pipeline view)
// ============================================================
function ProjectRow({ project, isDemo, onStatusChange, onDelete, onEdit, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useQuery(
    api.bidshield.getChecklistProgress,
    !isDemo ? { projectId: project._id } : "skip"
  );
  const displayProgress = isDemo ? 45 : (progress ?? 0);
  const bidDate = new Date(project.bidDate);
  const daysUntil = Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntil <= 3 && daysUntil >= 0;
  const isPastDue = daysUntil < 0;
  const totalBid = project.totalBidAmount;
  const roofArea = (project as any).grossRoofArea ?? project.sqft;
  const dpsf = (totalBid && roofArea) ? (totalBid / roofArea).toFixed(2) : null;
  const systemType = (project as any).systemType as string | undefined;

  return (
    <tr
      onClick={() => router.push(`/bidshield/dashboard/project?id=${project._id}${isDemo ? "&demo=true" : ""}`)}
      className="cursor-pointer transition-colors group"
      style={{ borderBottom: "1px solid #f1f5f9" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={e => (e.currentTarget.style.background = "")}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 3, height: 28, borderRadius: 9999, background: isPastDue ? "#ef4444" : isUrgent ? "#f59e0b" : "#059669", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }} className="truncate max-w-[180px] group-hover:text-emerald-700 transition-colors">{project.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }} className="truncate">{project.location}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5" style={{ fontSize: 13, color: "#475569" }}>{project.gc || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span style={{ fontSize: 13, fontWeight: 600, color: isPastDue ? "#dc2626" : isUrgent ? "#d97706" : "#334155", fontVariantNumeric: "tabular-nums" }}>
          {isPastDue ? "Past due" : daysUntil === 0 ? "Today" : `${daysUntil}d`}
        </span>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{project.bidDate}</div>
      </td>
      <td className="px-4 py-3.5">
        {systemType ? (
          <span style={{ fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.02em" }}>{systemType.toUpperCase()}</span>
        ) : project.assemblies && project.assemblies.length > 0 ? (
          <span style={{ fontSize: 12, color: "#64748b" }} className="truncate max-w-[100px] block">{project.assemblies[0]}</span>
        ) : <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>}
      </td>
      <td className="px-4 py-3.5 text-right whitespace-nowrap" style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
        {dpsf ? `$${dpsf}` : <span style={{ color: "#cbd5e1" }}>—</span>}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <div style={{ width: 56, height: 5, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${displayProgress}%`, borderRadius: 9999, background: displayProgress >= 75 ? "#059669" : displayProgress >= 25 ? "#f59e0b" : "#ef4444", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: displayProgress >= 75 ? "#059669" : displayProgress >= 25 ? "#d97706" : "#ef4444", fontVariantNumeric: "tabular-nums", width: 32, textAlign: "right" }}>{displayProgress}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 items-center justify-end">
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md transition-colors duration-150 ring-1 ring-emerald-200 cursor-pointer flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Won
            </button>
            <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-md transition-colors duration-150 ring-1 ring-red-200 cursor-pointer flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>Lost
            </button>
          </div>
          {!isDemo && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="More actions"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project._id); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                      Edit
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project._id, project.name); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function ProjectTable({ projects, isDemo, onStatusChange, onDelete, onEdit, router, onNewBid }: {
  projects: BidProject[];
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  router: ReturnType<typeof useRouter>;
  onNewBid: () => void;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Project</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">GC</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bid Date</th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">System</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">$/SF</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ready</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow key={project._id} project={project} isDemo={isDemo} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} router={router} />
          ))}
          <tr>
            <td colSpan={7} className="px-4 py-3">
              <button onClick={onNewBid} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {projects.length === 0 ? "Create your first bid" : "New Bid"}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// PROJECT CARD
// ============================================================
function ProjectCard({ project, isDemo, onStatusChange, onDelete, onEdit, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const progress = useQuery(
    api.bidshield.getChecklistProgress,
    !isDemo ? { projectId: project._id } : "skip"
  );
  const displayProgress = isDemo ? (project.status === "in_progress" ? 45 : 10) : (progress ?? 0);
  const bidDate = new Date(project.bidDate);
  const daysUntil = Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntil <= 3;
  const isPastDue = daysUntil < 0;

  return (
    <div
      onClick={() => router.push(`/bidshield/dashboard/project?id=${project._id}${isDemo ? "&demo=true" : ""}`)}
      className="bg-white rounded-xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200 group overflow-hidden"
    >
      <div className={`h-1 ${isPastDue ? "bg-red-500" : isUrgent ? "bg-amber-500" : project.status === "in_progress" ? "bg-emerald-500" : "bg-slate-300"}`} />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{project.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{project.location}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ml-3 shrink-0 ${
            project.status === "in_progress" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}>
            {project.status === "in_progress" ? "In Progress" : "Setup"}
          </span>
        </div>

        {((project as any).trade || (project as any).systemType) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(project as any).trade && <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md capitalize">{(project as any).trade}</span>}
            {(project as any).systemType && <span className="text-[10px] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md uppercase">{(project as any).systemType}</span>}
            {(project as any).deckType && <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md capitalize">{(project as any).deckType} deck</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
          <span className="truncate">GC: {project.gc || "TBD"}</span>
          <span className="font-medium text-slate-700 ml-2 shrink-0">{project.sqft?.toLocaleString() || "\u2014"} SF</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" /></svg>
          <span className={`text-sm font-medium ${isPastDue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-600"}`}>
            {isPastDue ? "Past due" : daysUntil === 0 ? "Due today" : `${daysUntil}d left`}
          </span>
          <span className="text-xs text-slate-400">&bull; {project.bidDate}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${displayProgress >= 75 ? "bg-emerald-500" : displayProgress >= 25 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${displayProgress}%` }} />
          </div>
          <span className={`text-sm font-bold tabular-nums ${displayProgress >= 75 ? "text-emerald-600" : displayProgress >= 25 ? "text-amber-600" : "text-red-500"}`}>{displayProgress}%</span>
        </div>

        {project.assemblies && project.assemblies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {project.assemblies.map((assembly: string, idx: number) => (
              <span key={idx} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">{assembly}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors duration-150 ring-1 ring-emerald-200 cursor-pointer flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Won
          </button>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors duration-150 ring-1 ring-red-200 cursor-pointer flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>Lost
          </button>
          {!isDemo && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(project._id); }} className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors ring-1 ring-slate-200" aria-label="Edit">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(project._id, project.name); }} className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors ring-1 ring-red-200" aria-label="Delete">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const convexProjects = useQuery(api.bidshield.getProjects, !isDemo && userId ? { userId } : "skip");
  const subscription = useQuery(api.users.getUserSubscription, !isDemo && userId ? { clerkId: userId } : "skip");
  // isPro must be derived before calling getStats — getStats throws for free users on the server
  const isPro = isDemo || (subscription?.isPro ?? false);
  const convexStats = useQuery(api.bidshield.getStats, !isDemo && userId && isPro ? { userId } : "skip");
  const createProjectMut = useMutation(api.bidshield.createProject);
  const updateProjectMut = useMutation(api.bidshield.updateProject);
  const deleteProjectMut = useMutation(api.bidshield.deleteProject);
  const projects: BidProject[] = isDemo ? demoProjects : (convexProjects ?? []);
  const stats = isDemo ? demoStats : (convexStats ?? {
    activeProjects: 0, expiringQuotes: 0, openRFIs: 0, pipelineValue: 0,
    wonProjects: 0, lostProjects: 0, winRate: 0, wonValue: 0,
  });

  const [showNewProject, setShowNewProject] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [demoOverrides, setDemoOverrides] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"bidshield_projects">; name: string } | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("bidshield_welcome_dismissed") === "1";
  });

  const handleDismissWelcome = () => {
    localStorage.setItem("bidshield_welcome_dismissed", "1");
    setWelcomeDismissed(true);
  };

  // Show onboarding for new users with zero projects
  useEffect(() => {
    if (!isDemo && convexProjects !== undefined && convexProjects.length === 0 && userId) {
      setShowOnboarding(true);
    }
  }, [isDemo, convexProjects, userId]);

  // Track demo views
  useEffect(() => {
    if (isDemo) track("demo_viewed");
  }, [isDemo]);

  // Track sign-up completions — Clerk redirects here with ?signup=1 after registration
  useEffect(() => {
    if (searchParams.get("signup") === "1") track("signup_completed");
  }, [searchParams]);
  const isLoading = !isDemo && convexProjects === undefined;

  const handleCreateProject = async (np: any) => {
    if (!np.name || !np.location || !np.bidDate) return;
    if (isDemo) { setShowNewProject(false); router.push(`/bidshield/dashboard/project?id=demo_1&demo=true`); return; }
    if (!userId) return;
    const isFirst = (convexProjects?.length ?? 0) === 0;
    const projectId = await createProjectMut({
      userId, name: np.name, location: np.location, bidDate: np.bidDate,
      trade: np.trade || "roofing",
      systemType: np.systemType || undefined,
      deckType: np.deckType || undefined,
      gc: np.gc || undefined,
      sqft: np.sqft ? parseInt(np.sqft) : undefined,
      grossRoofArea: np.sqft ? parseInt(np.sqft) : undefined,
      totalBidAmount: np.totalBidAmount ? parseInt(np.totalBidAmount) : undefined,
      assemblies: np.assemblies ? np.assemblies.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
    });
    if (isFirst) track("first_project_created");
    setShowNewProject(false);
    router.push(`/bidshield/dashboard/project?id=${projectId}`);
  };

  const handleDeleteRequest = (id: Id<"bidshield_projects">, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteProjectMut({ projectId: deleteTarget.id });
    setDeleteTarget(null);
  };

  const handleEdit = (id: Id<"bidshield_projects">) => {
    router.push(`/bidshield/dashboard/project?id=${id}`);
  };

  const handleStatusChange = async (projectId: Id<"bidshield_projects">, status: "won" | "lost") => {
    if (isDemo) { setDemoOverrides(prev => ({ ...prev, [projectId]: status })); return; }
    await updateProjectMut({ projectId, status, completedDate: new Date().toISOString().split("T")[0] });
  };

  const getProjectStatus = (project: typeof projects[0]) => {
    if (isDemo && demoOverrides[project._id]) return demoOverrides[project._id];
    return project.status;
  };

  const activeProjects = projects
    .filter((p) => { const s = getProjectStatus(p); return s === "setup" || s === "in_progress"; })
    .sort((a, b) => new Date(a.bidDate).getTime() - new Date(b.bidDate).getTime());
  const completedProjects = projects.filter((p) => { const s = getProjectStatus(p); return s === "won" || s === "lost"; });

  const handleNewBidClick = () => {
    if (!isDemo && !isPro && activeProjects.length >= 1) {
      setShowUpgradeModal(true);
    } else {
      setShowNewProject(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 animate-pulse">
              <div className="h-9 w-9 bg-slate-100 rounded-lg mb-3" />
              <div className="h-8 bg-slate-100 rounded mb-2 w-16" />
              <div className="h-4 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Onboarding for new users */}
      {showOnboarding && userId && (
        <OnboardingWizard
          userId={userId}
          onComplete={(projectId) => {
            setShowOnboarding(false);
            router.push(`/bidshield/dashboard/project?id=${projectId}#checklist`);
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ paddingBottom: 8 }}>
        <div>
          <h1 className="app-display" style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
            {activeProjects.length === 0 ? "No active bids — create one to get started." : `${activeProjects.length} active bid${activeProjects.length !== 1 ? "s" : ""} in your pipeline`}
          </p>
        </div>
        <button onClick={handleNewBidClick} className="inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-95" style={{ background: "#059669", color: "white", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 8, boxShadow: "0 1px 3px rgba(5,150,105,0.4), 0 0 0 1px rgba(5,150,105,0.3)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Bid
        </button>
      </div>

      {/* Stats / Welcome */}
      {!isDemo && projects.length === 0 && !welcomeDismissed ? (
        <WelcomeCard onNewBid={handleNewBidClick} onDismiss={handleDismissWelcome} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={stats.activeProjects}
            label="Active Bids"
            accent="#059669"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>}
          />
          <StatCard
            value={`${stats.winRate}%`}
            label="Win Rate"
            accent="#3b82f6"
            dimmed={stats.winRate === 0 && stats.wonProjects + stats.lostProjects === 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
          />
          <StatCard
            value={`${stats.wonProjects}/${stats.wonProjects + stats.lostProjects}`}
            label="Won / Decided"
            accent="#059669"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" /></svg>}
          />
          <StatCard
            value={`$${(stats.pipelineValue / 1000000).toFixed(1)}M`}
            label="Pipeline Value"
            accent="#334155"
            dimmed={stats.pipelineValue === 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          />
        </div>
      )}

      {/* Alerts */}
      {(stats.expiringQuotes > 0 || stats.openRFIs > 0) && (
        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alerts</h2>
          {stats.expiringQuotes > 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => document.getElementById("active-bids")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-100 text-red-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{stats.expiringQuotes} quote{stats.expiringQuotes !== 1 ? "s" : ""} expiring soon</p>
                <p className="text-sm text-slate-600 mt-0.5">Review your vendor quotes and request updates before they expire.</p>
              </div>
              <span className="text-xs text-red-400 shrink-0 self-center">View bids →</span>
            </div>
          )}
          {stats.openRFIs > 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => document.getElementById("active-bids")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{stats.openRFIs} RFI{stats.openRFIs !== 1 ? "s" : ""} pending response</p>
                <p className="text-sm text-slate-600 mt-0.5">Follow up with GC/Architect to keep your bid on track.</p>
              </div>
              <span className="text-xs text-amber-500 shrink-0 self-center">View bids →</span>
            </div>
          )}
        </div>
      )}

      {/* Active Bids — table on desktop, cards on mobile */}
      <div id="active-bids">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Bids</h2>
            {activeProjects.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 9999 }}>
                {activeProjects.length}
              </span>
            )}
          </div>
        </div>

        {/* Desktop: pipeline table */}
        <div className="hidden md:block">
          <ProjectTable projects={activeProjects} isDemo={isDemo} onStatusChange={handleStatusChange} onDelete={handleDeleteRequest} onEdit={handleEdit} router={router} onNewBid={handleNewBidClick} />
        </div>

        {/* Mobile: card grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {activeProjects.map((project: BidProject) => (
            <ProjectCard key={project._id} project={project} isDemo={isDemo} onStatusChange={handleStatusChange} onDelete={handleDeleteRequest} onEdit={handleEdit} router={router} />
          ))}
          <div onClick={handleNewBidClick} className="rounded-xl p-5 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all min-h-[200px] group">
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <span className="text-sm font-medium">{activeProjects.length === 0 ? "Create Your First Bid" : "New Bid"}</span>
          </div>
        </div>
      </div>

      {/* Completed Bids */}
      {completedProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Completed Bids</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: 9999 }}>
              {completedProjects.length}
            </span>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            {completedProjects.map((project: BidProject, i) => {
              const status = getProjectStatus(project);
              const isWon = status === "won";
              return (
                <div key={project._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer" style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : undefined }}
                  onClick={() => router.push(`/bidshield/dashboard/project?id=${project._id}${isDemo ? "&demo=true" : ""}`)}
                >
                  <div style={{ width: 3, height: 36, borderRadius: 9999, background: isWon ? "#059669" : "#ef4444", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }} className="truncate">{project.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{project.location}{project.gc ? ` · GC: ${project.gc}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {project.totalBidAmount ? (
                      <div style={{ fontSize: 15, fontWeight: 700, color: isWon ? "#059669" : "#94a3b8", letterSpacing: "-0.02em" }}>${(project.totalBidAmount / 1000).toFixed(0)}K</div>
                    ) : null}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                      color: isWon ? "#059669" : "#dc2626",
                      background: isWon ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${isWon ? "#bbf7d0" : "#fecaca"}`,
                      padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2,
                    }}>
                      {isWon ? "Won" : "Lost"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Free tier — subtle bottom notice */}
      {!isDemo && !isPro && (
        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Free plan · {activeProjects.length} of 1 project used ·{" "}
          </span>
          <a href="/bidshield/pricing" style={{ fontSize: 13, color: "#10b981", fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
            Upgrade to Pro →
          </a>
        </div>
      )}

      {showNewProject && <NewBidWizard isDemo={isDemo} onClose={() => setShowNewProject(false)} onCreate={handleCreateProject} />}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          projectName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default function BidShieldDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-slate-400 text-sm">Loading dashboard...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
