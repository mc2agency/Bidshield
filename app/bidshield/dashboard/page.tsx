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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--bs-text-primary)" }}>Delete bid?</h2>
        <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>
          Are you sure you want to delete <span className="font-semibold" style={{ color: "var(--bs-text-secondary)" }}>&ldquo;{projectName}&rdquo;</span>? This will permanently remove the project and all related data.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", background: "rgba(255,255,255,0.06)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors"
            style={{ background: "var(--bs-red)", color: "#fff", border: "none" }}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl w-full max-w-md p-8 relative" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer transition-colors" style={{ color: "var(--bs-text-dim)", background: "none", border: "none" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--bs-teal-dim)" }}>
            <svg className="w-7 h-7" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--bs-text-primary)" }}>You&apos;ve reached your free plan limit</h2>
          <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Upgrade to Pro for unlimited projects &mdash; $249/month</p>
          <a href="/bidshield/pricing" className="block w-full py-3 font-semibold rounded-xl text-center cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
            Upgrade to Pro &rarr;
          </a>
          <button onClick={onClose} className="mt-3 text-sm cursor-pointer transition-colors" style={{ background: "none", border: "none", color: "var(--bs-text-dim)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}>Cancel</button>
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
function StatCard({ value, label, dimmed, icon, accent = "var(--bs-teal)" }: {
  value: string | number;
  label: string;
  dimmed?: boolean;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl hover:-translate-y-0.5 transition-all duration-200 p-5"
      style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>{label}</span>
        {icon && <span style={{ color: dimmed ? "var(--bs-text-dim)" : accent, opacity: 0.6 }}>{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: dimmed ? "var(--bs-text-dim)" : "var(--bs-text-primary)" }}>
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
    <div className="relative rounded-xl px-8 py-10 text-center" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      <button onClick={onDismiss} className="absolute top-3 right-3 transition-colors" style={{ background: "none", border: "none", color: "var(--bs-text-dim)", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"} aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
      <h2 className="text-xl font-bold mb-2" style={{ color: "var(--bs-text-primary)" }}>Welcome to BidShield</h2>
      <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Start your first bid review to catch what estimating software misses.</p>
      <button
        onClick={onNewBid}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer hover:opacity-90"
        style={{ background: "var(--bs-teal)", color: "#13151a", border: "none" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        + New Bid
      </button>
      <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 mt-6 text-xs" style={{ color: "var(--bs-text-dim)" }}>
        <span>1. Create a project</span>
        <span style={{ color: "var(--bs-text-dim)", opacity: 0.6 }}>→</span>
        <span>2. Run through the checklist</span>
        <span style={{ color: "var(--bs-text-dim)", opacity: 0.6 }}>→</span>
        <span>3. Validate before you submit</span>
      </div>
    </div>
  );
}

// ============================================================
// PROJECT TABLE (desktop pipeline view)
// ============================================================
function ProjectRow({ project, isDemo, onStatusChange, onDelete, onEdit, onEditSetup, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  onEditSetup: (id: Id<"bidshield_projects">) => void;
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
      style={{ borderBottom: "1px solid var(--bs-border)" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-primary)" }} className="truncate max-w-[180px]">{project.name}</div>
            <div style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 1 }} className="truncate">{project.location}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5" style={{ fontSize: 13, color: "var(--bs-text-secondary)" }}>{project.gc || <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-sm font-medium tabular-nums" style={{ color: isPastDue ? "var(--bs-red)" : isUrgent ? "var(--bs-amber)" : "var(--bs-text-muted)" }}>
          {isPastDue ? "Past due" : daysUntil === 0 ? "Today" : `${daysUntil}d`}
        </span>
        <div style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 1 }}>{project.bidDate}</div>
      </td>
      <td className="px-4 py-3.5">
        {systemType ? (
          <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "var(--bs-text-secondary)", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.02em" }}>{systemType.toUpperCase()}</span>
        ) : project.assemblies && project.assemblies.length > 0 ? (
          <span style={{ fontSize: 12, color: "var(--bs-text-muted)" }} className="truncate max-w-[100px] block">{project.assemblies[0]}</span>
        ) : <span style={{ color: "var(--bs-text-dim)", fontSize: 13 }}>—</span>}
      </td>
      <td className="px-4 py-3.5 text-right whitespace-nowrap" style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-primary)", fontVariantNumeric: "tabular-nums" }}>
        {dpsf ? `$${dpsf}` : <span style={{ color: "var(--bs-text-dim)" }}>—</span>}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-14 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-400" style={{ width: `${displayProgress}%`, background: displayProgress >= 75 ? "var(--bs-teal)" : displayProgress >= 25 ? "var(--bs-amber)" : "var(--bs-red)" }} />
          </div>
          <span className="text-sm font-medium tabular-nums w-8 text-right" style={{ color: "var(--bs-text-secondary)" }}>{displayProgress}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 items-center justify-end">
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="py-1 px-2.5 text-[10px] font-bold rounded-md transition-colors duration-150 cursor-pointer flex items-center gap-0.5" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Won
            </button>
            <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="py-1 px-2.5 text-[10px] font-bold rounded-md transition-colors duration-150 cursor-pointer flex items-center gap-0.5" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }}>
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>Lost
            </button>
          </div>
          {!isDemo && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "var(--bs-text-dim)", background: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"; }}
                aria-label="More actions"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-lg py-1 z-20" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project._id); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                      style={{ color: "var(--bs-text-secondary)", background: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEditSetup(project._id); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                      style={{ color: "var(--bs-text-secondary)", background: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                      Edit Setup
                    </button>
                    <div className="my-1" style={{ borderTop: "1px solid var(--bs-border)" }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project._id, project.name); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                      style={{ color: "var(--bs-red)", background: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-red-dim)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
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

function ProjectTable({ projects, isDemo, onStatusChange, onDelete, onEdit, onEditSetup, router, onNewBid }: {
  projects: BidProject[];
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  onEditSetup: (id: Id<"bidshield_projects">) => void;
  router: ReturnType<typeof useRouter>;
  onNewBid: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Project</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>GC</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Bid Date</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>System</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>$/SF</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>Ready</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow key={project._id} project={project} isDemo={isDemo} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} onEditSetup={onEditSetup} router={router} />
          ))}
          <tr>
            <td colSpan={7} className="px-4 py-3" style={{ borderTop: "1px solid var(--bs-border)" }}>
              <button onClick={onNewBid} className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer" style={{ color: "var(--bs-teal)", background: "none", border: "none" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                {projects.length === 0 ? "Create your first bid" : "New Bid"}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Empty state — shown when pipeline is sparse */}
      {projects.length < 3 && (
        <div className="flex flex-col items-center justify-center py-12" style={{ borderTop: "1px solid var(--bs-border)" }}>
          <svg className="w-10 h-10 mb-3" style={{ color: "rgba(255,255,255,0.1)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p className="text-sm" style={{ color: "var(--bs-text-dim)" }}>Start a new bid to build your pipeline</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROJECT CARD
// ============================================================
function ProjectCard({ project, isDemo, onStatusChange, onDelete, onEdit, onEditSetup, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  onDelete: (id: Id<"bidshield_projects">, name: string) => void;
  onEdit: (id: Id<"bidshield_projects">) => void;
  onEditSetup: (id: Id<"bidshield_projects">) => void;
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
      className="rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden"
      style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}
    >
      <div className="h-1" style={{ background: isPastDue ? "var(--bs-red)" : isUrgent ? "var(--bs-amber)" : project.status === "in_progress" ? "var(--bs-teal)" : "rgba(255,255,255,0.15)" }} />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: "var(--bs-text-primary)" }}>{project.name}</h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{project.location}</p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full ml-3 shrink-0" style={{
            background: project.status === "in_progress" ? "var(--bs-teal-dim)" : "var(--bs-amber-dim)",
            color: project.status === "in_progress" ? "var(--bs-teal)" : "var(--bs-amber)",
            border: `1px solid ${project.status === "in_progress" ? "var(--bs-teal-border)" : "var(--bs-amber-border)"}`,
          }}>
            {project.status === "in_progress" ? "In Progress" : "Setup"}
          </span>
        </div>

        {((project as any).trade || (project as any).systemType) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(project as any).trade && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md capitalize" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)" }}>{(project as any).trade}</span>}
            {(project as any).systemType && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md uppercase" style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)" }}>{(project as any).systemType}</span>}
            {(project as any).deckType && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md capitalize" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-dim)" }}>{(project as any).deckType} deck</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-sm mb-3" style={{ color: "var(--bs-text-muted)" }}>
          <span className="truncate">GC: {project.gc || "TBD"}</span>
          <span className="font-medium ml-2 shrink-0" style={{ color: "var(--bs-text-secondary)" }}>{project.sqft?.toLocaleString() || "\u2014"} SF</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" /></svg>
          <span className="text-sm font-medium" style={{ color: isPastDue ? "var(--bs-red)" : isUrgent ? "var(--bs-amber)" : "var(--bs-text-muted)" }}>
            {isPastDue ? "Past due" : daysUntil === 0 ? "Due today" : `${daysUntil}d left`}
          </span>
          <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>&bull; {project.bidDate}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${displayProgress}%`, background: displayProgress >= 75 ? "var(--bs-teal)" : displayProgress >= 25 ? "var(--bs-amber)" : "var(--bs-red)" }} />
          </div>
          <span className="text-sm font-bold tabular-nums" style={{ color: displayProgress >= 75 ? "var(--bs-teal)" : displayProgress >= 25 ? "var(--bs-amber)" : "var(--bs-red)" }}>{displayProgress}%</span>
        </div>

        {project.assemblies && project.assemblies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--bs-border)" }}>
            {project.assemblies.map((assembly: string, idx: number) => (
              <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}>{assembly}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--bs-border)" }}>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="flex-1 py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Won
          </button>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="flex-1 py-2 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>Lost
          </button>
          {!isDemo && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(project._id); }} className="py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }} aria-label="Edit">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(project._id, project.name); }} className="py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)", border: "1px solid var(--bs-red-border)" }} aria-label="Delete">
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
  const [editingProject, setEditingProject] = useState<BidProject | null>(null);
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
    const baseArgs = {
      userId, name: np.name, location: np.location, bidDate: np.bidDate,
      trade: np.trade || "roofing",
      systemType: np.systemType || undefined,
      deckType: np.deckType || undefined,
      gc: np.gc || undefined,
      sqft: np.sqft ? parseInt(np.sqft) : undefined,
      grossRoofArea: np.sqft ? parseInt(np.sqft) : undefined,
      totalBidAmount: np.totalBidAmount ? parseInt(np.totalBidAmount) : undefined,
      assemblies: np.assemblies
        ? (Array.isArray(np.assemblies) ? np.assemblies : np.assemblies.split(",").map((a: string) => a.trim()).filter(Boolean))
        : [],
    };
    // Clean roofAssemblies: Convex v.optional(v.number()) rejects null — convert nulls to undefined
    const cleanedAssemblies = np.roofAssemblies?.map((a: any) => ({
      label: a.label,
      systemType: a.systemType,
      ...(a.name ? { name: a.name } : {}),
      ...(a.insulationType ? { insulationType: a.insulationType } : {}),
      ...(a.insulationThickness ? { insulationThickness: a.insulationThickness } : {}),
      ...(a.rValue != null ? { rValue: a.rValue } : {}),
      ...(a.surfaceType ? { surfaceType: a.surfaceType } : {}),
      ...(a.area != null ? { area: a.area } : {}),
      ...(a.uValue != null ? { uValue: a.uValue } : {}),
    }));
    let projectId: string;
    try {
      projectId = await createProjectMut({
        ...baseArgs,
        roofAssemblies: cleanedAssemblies && cleanedAssemblies.length > 0 ? cleanedAssemblies : undefined,
        systemDescription: np.systemDescription || undefined,
      });
    } catch (err) {
      // Fallback: backend may not support newer fields yet
      console.warn("createProject failed, retrying with base args only:", err);
      try {
        projectId = await createProjectMut(baseArgs as Parameters<typeof createProjectMut>[0]);
      } catch (err2) {
        console.error("createProject fallback also failed:", err2);
        return;
      }
    }
    if (isFirst) track("first_project_created");
    setShowNewProject(false);
    router.push(`/bidshield/dashboard/project?id=${projectId}`);
  };

  const handleEditSetup = (id: Id<"bidshield_projects">) => {
    const proj = projects.find(p => p._id === id);
    if (proj) setEditingProject(proj);
  };

  const handleUpdateProject = async (np: any) => {
    if (!editingProject) return;
    const cleanAssemblies = np.roofAssemblies?.map((a: any) => {
      const obj: any = { label: a.label, systemType: a.systemType };
      if (a.name) obj.name = a.name;
      if (a.insulationType) obj.insulationType = a.insulationType;
      if (a.insulationThickness) obj.insulationThickness = a.insulationThickness;
      if (a.rValue != null) obj.rValue = a.rValue;
      if (a.surfaceType) obj.surfaceType = a.surfaceType;
      if (a.area != null) obj.area = a.area;
      if (a.uValue != null) obj.uValue = a.uValue;
      return obj;
    });
    try {
      await updateProjectMut({
        projectId: editingProject._id,
        name: np.name || undefined,
        location: np.location || undefined,
        bidDate: np.bidDate || undefined,
        gc: np.gc || undefined,
        sqft: np.sqft ? parseInt(np.sqft) : undefined,
        grossRoofArea: np.sqft ? parseInt(np.sqft) : undefined,
        totalBidAmount: np.totalBidAmount ? parseInt(np.totalBidAmount) : undefined,
        deckType: np.deckType || undefined,
        roofAssemblies: cleanAssemblies,
        systemDescription: np.systemDescription || undefined,
      });
    } catch (err) {
      console.warn("updateProject with roofAssemblies failed, retrying without:", err);
      await updateProjectMut({
        projectId: editingProject._id,
        name: np.name || undefined,
        location: np.location || undefined,
        bidDate: np.bidDate || undefined,
        gc: np.gc || undefined,
        sqft: np.sqft ? parseInt(np.sqft) : undefined,
        grossRoofArea: np.sqft ? parseInt(np.sqft) : undefined,
        totalBidAmount: np.totalBidAmount ? parseInt(np.totalBidAmount) : undefined,
        deckType: np.deckType || undefined,
      });
    }
    setEditingProject(null);
    router.push(`/bidshield/dashboard/project?id=${editingProject._id}`);
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

  // M-17: Urgency-based sorting — bid date soonest first, then by status (in_progress before setup)
  const activeProjects = projects
    .filter((p) => { const s = getProjectStatus(p); return s === "setup" || s === "in_progress"; })
    .sort((a, b) => {
      const now = Date.now();
      const aDate = new Date(a.bidDate).getTime();
      const bDate = new Date(b.bidDate).getTime();
      // Overdue bids (past due) float to top
      const aOverdue = aDate < now ? 1 : 0;
      const bOverdue = bDate < now ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      // Then sort by bid date (soonest first)
      if (aDate !== bDate) return aDate - bDate;
      // Tie-break: in_progress before setup
      const statusOrder: Record<string, number> = { in_progress: 0, setup: 1 };
      return (statusOrder[getProjectStatus(a)] ?? 2) - (statusOrder[getProjectStatus(b)] ?? 2);
    });
  const completedProjects = projects
    .filter((p) => { const s = getProjectStatus(p); return s === "won" || s === "lost"; })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

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
            <div key={i} className="rounded-xl p-6 animate-pulse" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
              <div className="h-9 w-9 rounded-lg mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-8 rounded mb-2 w-16" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-4 rounded w-20" style={{ background: "rgba(255,255,255,0.06)" }} />
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
          <h1 className="app-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "var(--bs-text-muted)", marginTop: 6 }}>
            {activeProjects.length === 0 ? "No active bids — create one to get started." : `${activeProjects.length} active bid${activeProjects.length !== 1 ? "s" : ""} in your pipeline`}
          </p>
        </div>
        <button onClick={handleNewBidClick} className="inline-flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-95" style={{ background: "var(--bs-teal)", color: "#13151a", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none" }}>
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
            accent="var(--bs-teal)"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" /></svg>}
          />
          <StatCard
            value={`${stats.winRate}%`}
            label="Win Rate"
            accent="var(--bs-blue)"
            dimmed={stats.winRate === 0 && stats.wonProjects + stats.lostProjects === 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
          />
          <StatCard
            value={`${stats.wonProjects}/${stats.wonProjects + stats.lostProjects}`}
            label="Won / Decided"
            accent="var(--bs-teal)"
            dimmed={stats.wonProjects + stats.lostProjects === 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" /></svg>}
          />
          <StatCard
            value={`$${(stats.pipelineValue / 1000000).toFixed(1)}M`}
            label="Pipeline Value"
            accent="var(--bs-text-secondary)"
            dimmed={stats.pipelineValue === 0}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          />
        </div>
      )}

      {/* Alerts */}
      {(stats.expiringQuotes > 0 || stats.openRFIs > 0) && (
        <div className="flex flex-col gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-dim)" }}>Alerts</h2>
          {stats.expiringQuotes > 0 && (
            <div
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors cursor-pointer"
              style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)", borderLeft: "4px solid var(--bs-amber)" }}
              onClick={() => document.getElementById("active-bids")?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{stats.expiringQuotes} quote{stats.expiringQuotes !== 1 ? "s" : ""} expiring soon — review vendor quotes before they expire.</p>
              </div>
              <span className="text-sm font-medium shrink-0 whitespace-nowrap" style={{ color: "var(--bs-amber)" }}>View bids →</span>
            </div>
          )}
          {stats.openRFIs > 0 && (
            <div
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors cursor-pointer"
              style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)", borderLeft: "4px solid var(--bs-amber)" }}
              onClick={() => document.getElementById("active-bids")?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{stats.openRFIs} RFI{stats.openRFIs !== 1 ? "s" : ""} pending response — follow up with GC/Architect to keep your bid on track.</p>
              </div>
              <span className="text-sm font-medium shrink-0 whitespace-nowrap" style={{ color: "var(--bs-amber)" }}>View bids →</span>
            </div>
          )}
        </div>
      )}

      {/* Active Bids — table on desktop, cards on mobile */}
      <div id="active-bids">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--bs-text-primary)" }}>Active Bids</h2>
            {activeProjects.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", padding: "2px 8px", borderRadius: 9999 }}>
                {activeProjects.length}
              </span>
            )}
          </div>
        </div>

        {/* Desktop: pipeline table */}
        <div className="hidden md:block">
          <ProjectTable projects={activeProjects} isDemo={isDemo} onStatusChange={handleStatusChange} onDelete={handleDeleteRequest} onEdit={handleEdit} onEditSetup={handleEditSetup} router={router} onNewBid={handleNewBidClick} />
        </div>

        {/* Mobile: card grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {activeProjects.map((project: BidProject) => (
            <ProjectCard key={project._id} project={project} isDemo={isDemo} onStatusChange={handleStatusChange} onDelete={handleDeleteRequest} onEdit={handleEdit} onEditSetup={handleEditSetup} router={router} />
          ))}
          <div onClick={handleNewBidClick} className="rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[200px] group" style={{ border: "2px dashed var(--bs-border)", color: "var(--bs-text-dim)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>
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
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--bs-text-primary)" }}>Completed Bids</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-text-muted)", background: "rgba(255,255,255,0.06)", border: "1px solid var(--bs-border)", padding: "2px 8px", borderRadius: 9999 }}>
              {completedProjects.length}
            </span>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            {completedProjects.map((project: BidProject, i) => {
              const status = getProjectStatus(project);
              const isWon = status === "won";
              return (
                <div key={project._id} className="flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer" style={{ borderTop: i > 0 ? "1px solid var(--bs-border)" : undefined }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  onClick={() => router.push(`/bidshield/dashboard/project?id=${project._id}${isDemo ? "&demo=true" : ""}`)}
                >
                  <div style={{ width: 3, height: 36, borderRadius: 9999, background: isWon ? "var(--bs-teal)" : "var(--bs-red)", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bs-text-primary)" }} className="truncate">{project.name}</div>
                    <div style={{ fontSize: 12, color: "var(--bs-text-dim)", marginTop: 1 }}>{project.location}{project.gc ? ` · GC: ${project.gc}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {project.totalBidAmount ? (
                      <div style={{ fontSize: 15, fontWeight: 700, color: isWon ? "var(--bs-teal)" : "var(--bs-text-dim)", letterSpacing: "-0.02em" }}>${(project.totalBidAmount / 1000).toFixed(0)}K</div>
                    ) : null}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                      color: isWon ? "var(--bs-teal)" : "var(--bs-red)",
                      background: isWon ? "var(--bs-teal-dim)" : "var(--bs-red-dim)",
                      border: `1px solid ${isWon ? "var(--bs-teal-border)" : "var(--bs-red-border)"}`,
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
          <span style={{ fontSize: 13, color: "var(--bs-text-dim)" }}>
            Free plan · {activeProjects.length} of 1 project used ·{" "}
          </span>
          <a href="/bidshield/pricing" style={{ fontSize: 13, color: "var(--bs-teal)", fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
            Upgrade to Pro →
          </a>
        </div>
      )}

      {showNewProject && <NewBidWizard isDemo={isDemo} isPro={isPro} onClose={() => setShowNewProject(false)} onCreate={handleCreateProject} />}
      {editingProject && <NewBidWizard isDemo={isDemo} isPro={isPro} onClose={() => setEditingProject(null)} onCreate={handleUpdateProject} editProject={{
        projectType: (editingProject as any).projectType,
        systemType: (editingProject as any).systemType,
        deckType: (editingProject as any).deckType,
        name: editingProject.name,
        location: editingProject.location,
        bidDate: editingProject.bidDate,
        gc: editingProject.gc,
        sqft: editingProject.sqft,
        totalBidAmount: editingProject.totalBidAmount,
        roofAssemblies: (editingProject as any).roofAssemblies,
        systemDescription: (editingProject as any).systemDescription,
      }} />}
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
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div style={{ color: "var(--bs-text-dim)", fontSize: "0.875rem" }}>Loading dashboard...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
