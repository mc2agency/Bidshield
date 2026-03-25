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
// UPGRADE MODAL
// ============================================================
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;ve reached your free plan limit</h2>
          <p className="text-slate-500 text-sm mb-6">Upgrade to Pro for unlimited projects &mdash; $249/month</p>
          <a href="/bidshield/pricing" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-center transition-colors shadow-sm">
            Upgrade to Pro &rarr;
          </a>
          <button onClick={onClose} className="mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
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
function StatCard({ value, label, dimmed }: {
  value: string | number;
  label: string;
  dimmed?: boolean;
}) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 20, opacity: dimmed ? 0.5 : 1 }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1 }}>{dimmed ? "—" : value}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ============================================================
// WELCOME CARD (zero-project state)
// ============================================================
function WelcomeCard({ onNewBid }: { onNewBid: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-8 py-10 text-center">
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
function ProjectRow({ project, isDemo, onStatusChange, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  router: ReturnType<typeof useRouter>;
}) {
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
      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-[200px]">{project.name}</div>
        <div className="text-xs text-slate-400 truncate">{project.location}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{project.gc || "—"}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-sm font-medium ${isPastDue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-600"}`}>
          {isPastDue ? "Past due" : daysUntil === 0 ? "Today" : `${daysUntil}d`}
        </span>
        <div className="text-xs text-slate-400">{project.bidDate}</div>
      </td>
      <td className="px-4 py-3">
        {systemType ? (
          <span style={{ fontSize: 12, fontWeight: 500, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 4 }}>{systemType.toUpperCase()}</span>
        ) : project.assemblies && project.assemblies.length > 0 ? (
          <span className="text-xs text-slate-500 truncate max-w-[100px] block">{project.assemblies[0]}</span>
        ) : <span className="text-xs text-slate-400">—</span>}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium text-slate-700 whitespace-nowrap">
        {dpsf ? `$${dpsf}` : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${displayProgress >= 80 ? "bg-emerald-500" : displayProgress >= 40 ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${displayProgress}%` }} />
          </div>
          <span className={`text-xs font-bold tabular-nums w-8 text-right ${displayProgress >= 80 ? "text-emerald-600" : displayProgress >= 40 ? "text-amber-600" : "text-slate-400"}`}>{displayProgress}%</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md transition-colors ring-1 ring-emerald-200">Won</button>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-md transition-colors ring-1 ring-red-200">Lost</button>
        </div>
      </td>
    </tr>
  );
}

function ProjectTable({ projects, isDemo, onStatusChange, router, onNewBid }: {
  projects: BidProject[];
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
  router: ReturnType<typeof useRouter>;
  onNewBid: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">GC</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bid Date</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">System</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">$/SF</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ready</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow key={project._id} project={project} isDemo={isDemo} onStatusChange={onStatusChange} router={router} />
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
function ProjectCard({ project, isDemo, onStatusChange, router }: {
  project: BidProject;
  isDemo: boolean;
  onStatusChange: (id: Id<"bidshield_projects">, status: "won" | "lost") => void;
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
            <div className={`h-full rounded-full transition-all duration-500 ${displayProgress >= 80 ? "bg-emerald-500" : displayProgress >= 40 ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${displayProgress}%` }} />
          </div>
          <span className={`text-sm font-semibold tabular-nums ${displayProgress >= 80 ? "text-emerald-600" : displayProgress >= 40 ? "text-amber-600" : "text-slate-500"}`}>{displayProgress}%</span>
        </div>

        {project.assemblies && project.assemblies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
            {project.assemblies.map((assembly: string, idx: number) => (
              <span key={idx} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">{assembly}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "won"); }} className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors ring-1 ring-emerald-200">&check; Won</button>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(project._id, "lost"); }} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors ring-1 ring-red-200">&times; Lost</button>
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
  const projects: BidProject[] = isDemo ? demoProjects : (convexProjects ?? []);
  const stats = isDemo ? demoStats : (convexStats ?? {
    activeProjects: 0, expiringQuotes: 0, openRFIs: 0, pipelineValue: 0,
    wonProjects: 0, lostProjects: 0, winRate: 0, wonValue: 0,
  });

  const [showNewProject, setShowNewProject] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [demoOverrides, setDemoOverrides] = useState<Record<string, string>>({});

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

  const handleStatusChange = async (projectId: Id<"bidshield_projects">, status: "won" | "lost") => {
    if (isDemo) { setDemoOverrides(prev => ({ ...prev, [projectId]: status })); return; }
    await updateProjectMut({ projectId, status, completedDate: new Date().toISOString().split("T")[0] });
  };

  const getProjectStatus = (project: typeof projects[0]) => {
    if (isDemo && demoOverrides[project._id]) return demoOverrides[project._id];
    return project.status;
  };

  const activeProjects = projects.filter((p) => { const s = getProjectStatus(p); return s === "setup" || s === "in_progress"; });
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeProjects.length === 0 ? "No active bids. Create one to get started." : `${activeProjects.length} active bid${activeProjects.length !== 1 ? "s" : ""} in your pipeline`}
          </p>
        </div>
        <button onClick={handleNewBidClick} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Bid
        </button>
      </div>

      {/* Stats / Welcome */}
      {!isDemo && projects.length === 0 ? (
        <WelcomeCard onNewBid={handleNewBidClick} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={stats.activeProjects} label="Active Bids" />
          <StatCard
            value={`${stats.winRate}%`}
            label="Win Rate"
            dimmed={stats.winRate === 0 && stats.wonProjects + stats.lostProjects === 0}
          />
          <StatCard value={`${stats.wonProjects}/${stats.wonProjects + stats.lostProjects}`} label="Won / Decided" />
          <StatCard
            value={`$${(stats.pipelineValue / 1000000).toFixed(1)}M`}
            label="Pipeline Value"
            dimmed={stats.pipelineValue === 0}
          />
        </div>
      )}

      {/* Alerts */}
      {(stats.expiringQuotes > 0 || stats.openRFIs > 0) && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Alerts</h2>
          {stats.expiringQuotes > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 hover:shadow-sm transition-all">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-red-100 text-red-600">📋</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{stats.expiringQuotes} quote{stats.expiringQuotes !== 1 ? "s" : ""} expiring soon</p>
                <p className="text-sm text-slate-600 mt-0.5">Review your vendor quotes and request updates before they expire.</p>
              </div>
            </div>
          )}
          {stats.openRFIs > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:shadow-sm transition-all">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-amber-100 text-amber-600">📨</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{stats.openRFIs} RFI{stats.openRFIs !== 1 ? "s" : ""} pending response</p>
                <p className="text-sm text-slate-600 mt-0.5">Follow up with GC/Architect to keep your bid on track.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Bids — table on desktop, cards on mobile */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Bids</h2>

        {/* Desktop: pipeline table */}
        <div className="hidden md:block">
          <ProjectTable projects={activeProjects} isDemo={isDemo} onStatusChange={handleStatusChange} router={router} onNewBid={handleNewBidClick} />
        </div>

        {/* Mobile: card grid */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {activeProjects.map((project: BidProject) => (
            <ProjectCard key={project._id} project={project} isDemo={isDemo} onStatusChange={handleStatusChange} router={router} />
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Completed Bids</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProjects.map((project: BidProject) => {
              const status = getProjectStatus(project);
              const isWon = status === "won";
              return (
                <div key={project._id} className={`bg-white rounded-xl p-5 border-2 transition-all ${isWon ? "border-emerald-200" : "border-red-200"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isWon ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                      {isWon ? "\u2713 Won" : "\u2717 Lost"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{project.location}</p>
                  <p className="text-sm text-slate-500 mb-2">GC: {project.gc || "N/A"} &bull; {project.sqft?.toLocaleString() || "\u2014"} SF</p>
                  {project.totalBidAmount && <div className={`text-xl font-bold ${isWon ? "text-emerald-600" : "text-slate-400"}`}>${project.totalBidAmount.toLocaleString()}</div>}
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
