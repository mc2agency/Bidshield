"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProjects,
  createProject,
  getStats,
  getChecklistProgress,
  type Project,
} from "@/lib/bidshield/storage";

export default function BidShieldDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({ activeProjects: 0, expiringQuotes: 0, openRFIs: 0, pipelineValue: 0 });
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    bidDate: "",
    gc: "",
    sqft: "",
    assemblies: "",
    estimatedValue: "",
  });

  // Load data
  useEffect(() => {
    setProjects(getProjects());
    setStats(getStats());
  }, []);

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.location || !newProject.bidDate) return;

    const project = createProject({
      name: newProject.name,
      location: newProject.location,
      bidDate: newProject.bidDate,
      gc: newProject.gc || undefined,
      sqft: newProject.sqft ? parseInt(newProject.sqft) : undefined,
      estimatedValue: newProject.estimatedValue ? parseInt(newProject.estimatedValue) : undefined,
      assemblies: newProject.assemblies.split(",").map((a) => a.trim()).filter(Boolean),
    });

    setProjects(getProjects());
    setStats(getStats());
    setNewProject({ name: "", location: "", bidDate: "", gc: "", sqft: "", assemblies: "", estimatedValue: "" });
    setShowNewProject(false);

    // Navigate to the new project's checklist
    router.push(`/bidshield/dashboard/checklist?project=${project.id}`);
  };

  const activeProjects = projects.filter(
    (p) => p.status === "setup" || p.status === "in_progress"
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: stats.activeProjects, label: "Active Bids", color: "text-white" },
          { value: stats.expiringQuotes, label: "Quotes Expiring", color: stats.expiringQuotes > 0 ? "text-red-500" : "text-white" },
          { value: stats.openRFIs, label: "Open RFIs", color: stats.openRFIs > 0 ? "text-amber-500" : "text-white" },
          { value: `$${(stats.pipelineValue / 1000000).toFixed(1)}M`, label: "Pipeline Value", color: "text-emerald-500" },
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
          {activeProjects.map((project) => {
            const progress = getChecklistProgress(project.id);
            return (
              <div
                key={project.id}
                onClick={() => router.push(`/bidshield/dashboard/checklist?project=${project.id}`)}
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
                <p className="text-sm text-slate-400 mb-3">{project.location}</p>
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
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-emerald-500">
                    {progress}%
                  </span>
                </div>
                {project.assemblies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.assemblies.map((assembly, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-700 text-slate-400 px-2 py-1 rounded"
                      >
                        {assembly}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

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
