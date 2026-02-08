"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { trades } from "@/convex/bidshieldDefaults";

interface BidProject {
  _id: Id<"bidshield_projects">;
  name: string;
  location: string;
  bidDate: string;
  status: string;
  gc?: string;
  sqft?: number;
  estimatedValue?: number;
  assemblies?: string[];
  userId: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}

// Demo data for unauthenticated preview
const demoProjects = [
  {
    _id: "demo_1" as Id<"bidshield_projects">,
    name: "Harbor Point Tower",
    location: "Jersey City, NJ",
    bidDate: "2026-02-15",
    status: "in_progress" as const,
    gc: "Turner Construction",
    sqft: 45000,
    estimatedValue: 850000,
    assemblies: ["TPO 60mil", "Tapered ISO"],
    userId: "demo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    _id: "demo_2" as Id<"bidshield_projects">,
    name: "Riverside Medical Center",
    location: "Newark, NJ",
    bidDate: "2026-02-20",
    status: "setup" as const,
    gc: "Skanska",
    sqft: 28000,
    estimatedValue: 420000,
    assemblies: ["EPDM", "Green Roof"],
    userId: "demo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const demoStats = {
  activeProjects: 2,
  expiringQuotes: 1,
  openRFIs: 3,
  pipelineValue: 1270000,
  wonProjects: 8,
  lostProjects: 5,
  winRate: 62,
  wonValue: 3200000,
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  // Convex queries — only run when authenticated (not demo)
  const convexProjects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );
  const convexStats = useQuery(
    api.bidshield.getStats,
    !isDemo && userId ? { userId } : "skip"
  );

  // Convex mutations
  const createProjectMut = useMutation(api.bidshield.createProject);
  const updateProjectMut = useMutation(api.bidshield.updateProject);

  // Use demo data or real data
  const projects: BidProject[] = isDemo ? demoProjects : (convexProjects ?? []);
  const stats = isDemo ? demoStats : (convexStats ?? {
    activeProjects: 0, expiringQuotes: 0, openRFIs: 0, pipelineValue: 0,
    wonProjects: 0, lostProjects: 0, winRate: 0, wonValue: 0,
  });

  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    bidDate: "",
    trade: "roofing",
    systemType: "",
    deckType: "",
    gc: "",
    sqft: "",
    assemblies: "",
    estimatedValue: "",
  });

  // For demo mode local state (won/lost toggles)
  const [demoOverrides, setDemoOverrides] = useState<Record<string, string>>({});

  const isLoading = !isDemo && convexProjects === undefined;

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.location || !newProject.bidDate) return;

    if (isDemo) {
      setShowNewProject(false);
      router.push(`/bidshield/dashboard/checklist?demo=true&project=demo_1`);
      return;
    }

    if (!userId) return;

    const projectId = await createProjectMut({
      userId,
      name: newProject.name,
      location: newProject.location,
      bidDate: newProject.bidDate,
      trade: newProject.trade || "roofing",
      systemType: newProject.systemType || undefined,
      deckType: newProject.deckType || undefined,
      gc: newProject.gc || undefined,
      sqft: newProject.sqft ? parseInt(newProject.sqft) : undefined,
      estimatedValue: newProject.estimatedValue ? parseInt(newProject.estimatedValue) : undefined,
      assemblies: newProject.assemblies.split(",").map((a) => a.trim()).filter(Boolean),
    });

    setNewProject({ name: "", location: "", bidDate: "", trade: "roofing", systemType: "", deckType: "", gc: "", sqft: "", assemblies: "", estimatedValue: "" });
    setShowNewProject(false);
    router.push(`/bidshield/dashboard/checklist?project=${projectId}`);
  };

  const handleStatusChange = async (projectId: Id<"bidshield_projects">, status: "won" | "lost") => {
    if (isDemo) {
      setDemoOverrides(prev => ({ ...prev, [projectId]: status }));
      return;
    }
    await updateProjectMut({ projectId, status });
  };

  const getProjectStatus = (project: typeof projects[0]) => {
    if (isDemo && demoOverrides[project._id]) return demoOverrides[project._id];
    return project.status;
  };

  const activeProjects = projects.filter((p: BidProject) => {
    const status = getProjectStatus(p);
    return status === "setup" || status === "in_progress";
  });

  const completedProjects = projects.filter((p: BidProject) => {
    const status = getProjectStatus(p);
    return status === "won" || status === "lost";
  });


  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
              <div className="h-10 bg-slate-700 rounded mb-2" />
              <div className="h-4 bg-slate-700 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: stats.activeProjects, label: "Active Bids", color: "text-white" },
          { value: `${stats.winRate}%`, label: "Win Rate", color: stats.winRate >= 50 ? "text-emerald-500" : stats.winRate > 0 ? "text-amber-500" : "text-slate-400" },
          { value: `${stats.wonProjects}/${stats.wonProjects + stats.lostProjects}`, label: "Won / Decided", color: "text-emerald-500" },
          { value: `$${(stats.pipelineValue / 1000000).toFixed(1)}M`, label: "Pipeline Value", color: "text-blue-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700"
          >
            <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[13px] text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* MC2 Templates Promo Banner */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800 border border-emerald-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📊</div>
          <div>
            <p className="font-semibold text-emerald-100">Speed up your estimates with MC2 Templates</p>
            <p className="text-sm text-emerald-300/80">Material takeoffs, labor calcs & professional proposals — all pre-built</p>
          </div>
        </div>
        <a
          href="/products"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-sm whitespace-nowrap transition-colors"
        >
          View Templates →
        </a>
      </div>

      {/* Active Bids */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-white">Active Bids</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + New Bid
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project: BidProject) => (
            <ProjectCard
              key={project._id}
              project={project}
              isDemo={isDemo}
              onStatusChange={handleStatusChange}
              router={router}
            />
          ))}

          {/* New Bid Card */}
          <div
            onClick={() => setShowNewProject(true)}
            className="rounded-xl p-5 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-all min-h-[200px]"
          >
            <span className="text-4xl mb-2">+</span>
            <span>{activeProjects.length === 0 ? "Create Your First Bid" : "New Bid"}</span>
          </div>
        </div>
      </div>

      {/* Completed Bids */}
      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-5">📊 Completed Bids</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProjects.map((project: BidProject) => {
              const status = getProjectStatus(project);
              return (
                <div
                  key={project._id}
                  className={`bg-slate-800 rounded-xl p-5 border-2 ${
                    status === "won" ? "border-emerald-600/50" : "border-red-600/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[17px] font-semibold text-white">{project.name}</h3>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded text-white ${
                        status === "won" ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    >
                      {status === "won" ? "✅ WON" : "❌ LOST"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{project.location}</p>
                  <div className="text-[13px] text-slate-500 mb-2">
                    GC: {project.gc || "N/A"} • {project.sqft?.toLocaleString() || "?"} SF
                  </div>
                  {project.estimatedValue && (
                    <div className={`text-lg font-bold ${status === "won" ? "text-emerald-400" : "text-slate-500"}`}>
                      ${project.estimatedValue.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      {(stats.expiringQuotes > 0 || stats.openRFIs > 0) && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-5">⚠️ Alerts</h2>
          <div className="flex flex-col gap-3">
            {stats.expiringQuotes > 0 && (
              <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border-l-4 border-red-500 text-sm">
                <span>🔴</span>
                <div>
                  <strong>{stats.expiringQuotes} quote(s) expiring soon</strong> - Review your vendor quotes and request updates.
                </div>
              </div>
            )}
            {stats.openRFIs > 0 && (
              <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border-l-4 border-amber-500 text-sm">
                <span>🟡</span>
                <div>
                  <strong>{stats.openRFIs} RFI(s) pending response</strong> - Follow up with GC/Architect.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div
          onClick={() => setShowNewProject(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-white mb-6">New Bid Project</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="550 Harbor Point Tower"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Trade Selection */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Trade *</label>
                <select
                  value={newProject.trade}
                  onChange={(e) => setNewProject({ ...newProject, trade: e.target.value, systemType: "", deckType: "" })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {trades.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.available}>
                      {t.label}{!t.available ? " (Coming Soon)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* System Type & Deck Type (conditional on trade) */}
              {(() => {
                const selectedTrade = trades.find((t) => t.id === newProject.trade);
                if (!selectedTrade) return null;
                return (
                  <>
                    {selectedTrade.systemTypes.length > 0 && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">System Type</label>
                        <select
                          value={newProject.systemType}
                          onChange={(e) => setNewProject({ ...newProject, systemType: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">-- Select system --</option>
                          {selectedTrade.systemTypes.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">Adds system-specific checklist items</p>
                      </div>
                    )}
                    {selectedTrade.deckTypes.length > 0 && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Deck Type</label>
                        <select
                          value={newProject.deckType}
                          onChange={(e) => setNewProject({ ...newProject, deckType: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">-- Select deck --</option>
                          {selectedTrade.deckTypes.map((d) => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">Adds deck-specific structural items</p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Location *</label>
                  <input
                    type="text"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="Jersey City, NJ"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bid Date *</label>
                  <input
                    type="date"
                    value={newProject.bidDate}
                    onChange={(e) => setNewProject({ ...newProject, bidDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">General Contractor</label>
                  <input
                    type="text"
                    value={newProject.gc}
                    onChange={(e) => setNewProject({ ...newProject, gc: e.target.value })}
                    placeholder="ABC Construction"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Square Footage</label>
                  <input
                    type="number"
                    value={newProject.sqft}
                    onChange={(e) => setNewProject({ ...newProject, sqft: e.target.value })}
                    placeholder="15000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Estimated Value ($)</label>
                <input
                  type="number"
                  value={newProject.estimatedValue}
                  onChange={(e) => setNewProject({ ...newProject, estimatedValue: e.target.value })}
                  placeholder="500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Assemblies (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.assemblies}
                  onChange={(e) => setNewProject({ ...newProject, assemblies: e.target.value })}
                  placeholder="RT-1 TPO, RT-2 Modified Bitumen"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-400 rounded-md text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name || !newProject.location || !newProject.bidDate}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-md text-sm"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component for project cards to use individual progress queries
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

  const displayProgress = isDemo
    ? (project.status === "in_progress" ? 45 : 10)
    : (progress ?? 0);

  return (
    <div
      onClick={() => router.push(`/bidshield/dashboard/project?id=${project._id}${isDemo ? "&demo=true" : ""}`)}
      className="bg-slate-800 rounded-xl p-5 border border-slate-700 cursor-pointer hover:border-slate-600 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[17px] font-semibold text-white">{project.name}</h3>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded text-white ${
            project.status === "in_progress" ? "bg-emerald-600" : "bg-amber-600"
          }`}
        >
          {project.status === "in_progress" ? "In Progress" : "Setup"}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-2">{project.location}</p>
      {((project as any).trade || (project as any).systemType) && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(project as any).trade && (
            <span className="text-[10px] font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded capitalize">
              {(project as any).trade}
            </span>
          )}
          {(project as any).systemType && (
            <span className="text-[10px] font-medium bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase">
              {(project as any).systemType}
            </span>
          )}
          {(project as any).deckType && (
            <span className="text-[10px] font-medium bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded capitalize">
              {(project as any).deckType} deck
            </span>
          )}
        </div>
      )}
      <div className="flex justify-between text-[13px] text-slate-500 mb-2">
        <span>GC: {project.gc || "TBD"}</span>
        <span>{project.sqft?.toLocaleString() || "?"} SF</span>
      </div>
      <div className="text-[13px] text-slate-500 mb-3">
        Bid Date: {project.bidDate}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <span className="text-[13px] font-semibold text-emerald-500">
          {displayProgress}%
        </span>
      </div>
      {project.assemblies && project.assemblies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.assemblies.map((assembly: string, idx: number) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-700 text-slate-400 px-2 py-1 rounded"
            >
              {assembly}
            </span>
          ))}
        </div>
      )}
      {/* Won/Lost Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(project._id, "won");
          }}
          className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
        >
          ✅ Won
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(project._id, "lost");
          }}
          className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-semibold rounded-lg transition-colors"
        >
          ❌ Lost
        </button>
      </div>
    </div>
  );
}

export default function BidShieldDashboardPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
