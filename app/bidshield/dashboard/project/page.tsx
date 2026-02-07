"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { masterChecklist } from "@/lib/bidshield/checklist-data";

const statusColors: Record<string, { text: string; bg: string }> = {
  setup: { text: "text-slate-400", bg: "bg-slate-700" },
  in_progress: { text: "text-blue-400", bg: "bg-blue-500/20" },
  submitted: { text: "text-amber-400", bg: "bg-amber-500/20" },
  won: { text: "text-emerald-400", bg: "bg-emerald-500/20" },
  lost: { text: "text-red-400", bg: "bg-red-500/20" },
  no_bid: { text: "text-slate-400", bg: "bg-slate-700" },
};

function ProjectDetail() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const checklist = useQuery(
    api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip"
  );
  const rfis = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );

  // Demo data
  const projectData = isDemo
    ? {
        name: "Harbor Point Tower",
        location: "Jersey City, NJ",
        bidDate: "2026-02-15",
        status: "in_progress" as const,
        gc: "Turner Construction",
        sqft: 45000,
        estimatedValue: 850000,
        assemblies: ["TPO 60mil", "Tapered ISO"],
        notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
      }
    : project;

  if (!projectIdParam) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No project selected. Go back to the dashboard.</p>
      </div>
    );
  }

  if (!isDemo && !projectData) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading project...</p>
      </div>
    );
  }

  // Compute stats
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i) => i.status === "rfi").length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const quoteCount = isDemo ? 5 : (quotes ?? []).length;
  const rfiCount = isDemo ? 3 : (rfis ?? []).length;
  const openRFIs = isDemo ? 1 : (rfis ?? []).filter((r) => r.status === "sent").length;

  const statusStyle = statusColors[projectData?.status || "setup"] || statusColors.setup;
  const demoQuery = isDemo ? "&demo=true" : "";
  const projectQuery = `project=${projectIdParam}${demoQuery}`;

  // Calculate days until bid
  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate
    ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Phase progress summary
  const phaseProgress = Object.entries(masterChecklist).map(([phaseKey, phase]) => {
    const phaseItems = checklistItems.filter((i) => i.phaseKey === phaseKey);
    const done = phaseItems.filter((i) => i.status === "done" || i.status === "na").length;
    const total = phase.items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { phaseKey, title: phase.title, icon: phase.icon, pct, done, total, critical: phase.critical };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <Link
            href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h2 className="text-xl font-semibold text-white">{projectData?.name || "Project"}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-slate-400">{projectData?.location}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${statusStyle.text} ${statusStyle.bg}`}>
              {(projectData?.status || "setup").replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="text-right">
          {daysUntilBid !== null && (
            <div className={`text-2xl font-bold ${daysUntilBid <= 3 ? "text-red-400" : daysUntilBid <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
              {daysUntilBid > 0 ? `${daysUntilBid} days` : daysUntilBid === 0 ? "TODAY" : "PAST DUE"}
            </div>
          )}
          <div className="text-xs text-slate-500">until bid • {projectData?.bidDate}</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">{progress}%</div>
          <div className="text-[11px] text-slate-400">Checklist</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-blue-400">{quoteCount}</div>
          <div className="text-[11px] text-slate-400">Quotes</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-amber-400">{rfiCount}</div>
          <div className="text-[11px] text-slate-400">RFIs</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-300">
            {projectData?.sqft ? `${(projectData.sqft / 1000).toFixed(0)}k` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">Sq Ft</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {projectData?.estimatedValue ? `$${(projectData.estimatedValue / 1000).toFixed(0)}k` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">Value</div>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            {projectData?.gc && (
              <div className="flex justify-between">
                <span className="text-slate-400">GC:</span>
                <span className="text-slate-200">{projectData.gc}</span>
              </div>
            )}
            {(projectData as any)?.owner && (
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="text-slate-200">{(projectData as any).owner}</span>
              </div>
            )}
            {projectData?.assemblies && projectData.assemblies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Assemblies:</span>
                <span className="text-slate-200 text-right">{projectData.assemblies.join(", ")}</span>
              </div>
            )}
          </div>
          {projectData?.notes && (
            <div className="mt-3 p-3 bg-slate-900 rounded-lg text-sm text-slate-300">
              {projectData.notes}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/bidshield/dashboard/checklist?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📋</span> Open Checklist
            </Link>
            <Link
              href={`/bidshield/dashboard/quotes?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>💰</span> Manage Quotes
            </Link>
            <Link
              href={`/bidshield/dashboard/rfis?${projectQuery}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📨</span> View RFIs
            </Link>
            <Link
              href={`/bidshield/dashboard/validator${isDemo ? "?demo=true" : ""}`}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>🛡️</span> Run Validator
            </Link>
          </div>
          {openRFIs > 0 && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              {openRFIs} open RFI{openRFIs !== 1 ? "s" : ""} awaiting response
            </div>
          )}
          {rfiItems > 0 && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              {rfiItems} checklist item{rfiItems !== 1 ? "s" : ""} flagged as RFI
            </div>
          )}
        </div>
      </div>

      {/* Phase Progress */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white">Checklist Progress by Phase</h3>
          <Link
            href={`/bidshield/dashboard/checklist?${projectQuery}`}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Open Full Checklist &rarr;
          </Link>
        </div>
        <div className="space-y-2">
          {(isDemo
            ? Object.entries(masterChecklist).map(([k, p]) => ({
                phaseKey: k,
                title: p.title,
                icon: p.icon,
                pct: Math.floor(Math.random() * 60 + 40),
                done: 0,
                total: p.items.length,
                critical: p.critical,
              }))
            : phaseProgress
          ).map((phase) => (
            <div key={phase.phaseKey} className="flex items-center gap-3">
              <span className="text-sm w-5">{phase.icon}</span>
              <span className="text-xs text-slate-400 w-40 truncate">{phase.title.replace(/^Phase \d+: /, "")}</span>
              {phase.critical && (
                <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">!</span>
              )}
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${phase.pct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${phase.pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold min-w-[32px] text-right ${phase.pct === 100 ? "text-emerald-400" : "text-slate-400"}`}>
                {phase.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading project...</div>}>
      <ProjectDetail />
    </Suspense>
  );
}
