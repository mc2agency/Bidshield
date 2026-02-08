"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps } from "../tab-types";

export default function OverviewTab({ projectId, isDemo, project, userId, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const checklist = useQuery(
    api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined } : "skip"
  );
  const rfis = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // Compute stats
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: { status: string }) => i.status === "rfi").length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const quoteCount = isDemo ? 5 : (quotes ?? []).length;
  const rfiCount = isDemo ? 3 : (rfis ?? []).length;
  const openRFIs = isDemo ? 1 : (rfis ?? []).filter((r: { status: string }) => r.status === "sent").length;

  // Reconciliation stats
  const demoTakeoffSections = [
    { squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 },
  ];
  const reconSections = isDemo ? demoTakeoffSections : (takeoffSections ?? []);
  const reconTakenOff = reconSections.reduce((sum: number, s: { squareFeet: number }) => sum + s.squareFeet, 0);
  const reconControl = isDemo ? 45000 : project?.grossRoofArea ?? null;
  const reconPct = reconControl && reconControl > 0 ? Math.min(100, Math.round((reconTakenOff / reconControl) * 100)) : null;
  const reconDeltaPct = reconControl && reconControl > 0 ? Math.abs(((reconControl - reconTakenOff) / reconControl) * 100) : null;
  const reconColor = reconDeltaPct === null ? "text-slate-500" : reconDeltaPct <= 2 ? "text-emerald-400" : reconDeltaPct <= 5 ? "text-amber-400" : "text-red-400";

  // Build trade-aware checklist template
  const trade = project?.trade || "roofing";
  const systemType = project?.systemType || undefined;
  const deckType = project?.deckType || undefined;
  const checklistTemplate = getChecklistForTrade(trade, systemType, deckType);

  // Phase progress summary
  const phaseProgress = Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
    const phaseItems = checklistItems.filter((i: { phaseKey: string; status: string }) => i.phaseKey === phaseKey);
    const done = phaseItems.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
    const total = phase.items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { phaseKey, title: phase.title, icon: phase.icon, pct, done, total, critical: phase.critical };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button onClick={() => onNavigateTab?.("checklist")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-750 transition-colors">
          <div className="text-2xl font-bold text-emerald-400">{progress}%</div>
          <div className="text-[11px] text-slate-400">Checklist</div>
        </button>
        <button onClick={() => onNavigateTab?.("quotes")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-750 transition-colors">
          <div className="text-2xl font-bold text-blue-400">{quoteCount}</div>
          <div className="text-[11px] text-slate-400">Quotes</div>
        </button>
        <button onClick={() => onNavigateTab?.("rfis")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-750 transition-colors">
          <div className="text-2xl font-bold text-amber-400">{rfiCount}</div>
          <div className="text-[11px] text-slate-400">RFIs</div>
        </button>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-300">
            {project?.sqft ? `${(project.sqft / 1000).toFixed(0)}k` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">Sq Ft</div>
        </div>
        <button onClick={() => onNavigateTab?.("pricing")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-750 transition-colors">
          {(() => {
            const bidAmt = isDemo ? 850000 : project?.totalBidAmount;
            const area = isDemo ? 45000 : project?.grossRoofArea;
            const dpsf = bidAmt && area && area > 0 ? bidAmt / area : null;
            return dpsf ? (
              <>
                <div className="text-2xl font-bold text-emerald-400">${dpsf.toFixed(2)}</div>
                <div className="text-[11px] text-slate-400">$/SF</div>
              </>
            ) : project?.estimatedValue ? (
              <>
                <div className="text-2xl font-bold text-emerald-400">${(project.estimatedValue / 1000).toFixed(0)}k</div>
                <div className="text-[11px] text-slate-400">Value</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-500">—</div>
                <div className="text-[11px] text-slate-400">$/SF</div>
              </>
            );
          })()}
        </button>
        <button onClick={() => onNavigateTab?.("takeoff")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-750 transition-colors">
          <div className={`text-2xl font-bold ${reconColor}`}>
            {reconPct !== null ? `${reconPct}%` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">{reconControl !== null ? "Reconciled" : "No Control #"}</div>
        </button>
      </div>

      {/* Project Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            {project?.gc && (
              <div className="flex justify-between">
                <span className="text-slate-400">GC:</span>
                <span className="text-slate-200">{project.gc}</span>
              </div>
            )}
            {project?.owner && (
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="text-slate-200">{project.owner}</span>
              </div>
            )}
            {project?.assemblies && project.assemblies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Assemblies:</span>
                <span className="text-slate-200 text-right">{project.assemblies.join(", ")}</span>
              </div>
            )}
          </div>
          {project?.notes && (
            <div className="mt-3 p-3 bg-slate-900 rounded-lg text-sm text-slate-300">
              {project.notes}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab?.("checklist")}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📋</span> Open Checklist
            </button>
            <button
              onClick={() => onNavigateTab?.("quotes")}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>💰</span> Manage Quotes
            </button>
            <button
              onClick={() => onNavigateTab?.("rfis")}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>📨</span> View RFIs
            </button>
            <button
              onClick={() => onNavigateTab?.("validator")}
              className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <span>🛡️</span> Run Validator
            </button>
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
          <button
            onClick={() => onNavigateTab?.("checklist")}
            className="text-xs text-emerald-400 hover:text-emerald-300"
          >
            Open Full Checklist &rarr;
          </button>
        </div>
        <div className="space-y-2">
          {(isDemo
            ? Object.entries(checklistTemplate).map(([k, p]) => ({
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
