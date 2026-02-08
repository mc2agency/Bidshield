"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";

const ASSEMBLY_TYPES = [
  "TPO 60mil Mechanically Attached",
  "TPO 60mil Fully Adhered",
  "TPO 80mil Mechanically Attached",
  "TPO 80mil Fully Adhered",
  "PVC 60mil Mechanically Attached",
  "PVC 60mil Fully Adhered",
  "Modified Bitumen 2-Ply (SBS)",
  "Modified Bitumen 3-Ply (SBS)",
  "Modified Bitumen (APP)",
  "EPDM 60mil",
  "Metal Roof Panels",
  "Metal Wall Panels",
  "Pavers / Ballast",
  "Green Roof",
  "Waterproofing / Below Grade",
  "Other",
];

// ===== TAKEOFF RECONCILIATION COMPONENT =====

type TakeoffSection = {
  _id: string;
  name: string;
  assemblyType: string;
  squareFeet: number;
  completed: boolean;
  notes?: string;
  sortOrder: number;
};

type DemoSection = TakeoffSection;

function TakeoffReconciliation({
  projectId,
  grossRoofArea,
  isDemo,
  userId,
}: {
  projectId: string;
  grossRoofArea: number | null;
  isDemo: boolean;
  userId: string | null | undefined;
}) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const sections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const updateProject = useMutation(api.bidshield.updateProject);
  const createSection = useMutation(api.bidshield.createTakeoffSection);
  const updateSection = useMutation(api.bidshield.updateTakeoffSection);
  const deleteSection = useMutation(api.bidshield.deleteTakeoffSection);

  // Demo data
  const demoSections: DemoSection[] = [
    { _id: "ts_1", name: "Main Roof Area A", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 22000, completed: true, sortOrder: 0 },
    { _id: "ts_2", name: "Main Roof Area B", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 12500, completed: true, sortOrder: 1 },
    { _id: "ts_3", name: "Mechanical Room", assemblyType: "Modified Bitumen 2-Ply (SBS)", squareFeet: 4200, completed: true, sortOrder: 2 },
    { _id: "ts_4", name: "Canopy", assemblyType: "Metal Roof Panels", squareFeet: 2800, completed: false, sortOrder: 3 },
  ];
  const demoGrossArea = 45000;

  const displaySections: TakeoffSection[] = isDemo ? demoSections : (sections ?? []) as TakeoffSection[];
  const controlNumber = isDemo ? demoGrossArea : grossRoofArea;

  const takenOff = displaySections.reduce((sum, s) => sum + s.squareFeet, 0);
  const delta = controlNumber ? controlNumber - takenOff : null;
  const deltaPct = controlNumber && controlNumber > 0 ? Math.abs(((delta ?? 0) / controlNumber) * 100) : null;
  const progressPct = controlNumber && controlNumber > 0 ? Math.min(100, (takenOff / controlNumber) * 100) : null;

  const getDeltaColor = () => {
    if (deltaPct === null) return { text: "text-slate-500", bg: "bg-slate-700", bar: "bg-slate-600" };
    if (deltaPct <= 2) return { text: "text-emerald-400", bg: "bg-emerald-500/20", bar: "bg-emerald-500" };
    if (deltaPct <= 5) return { text: "text-amber-400", bg: "bg-amber-500/20", bar: "bg-amber-500" };
    return { text: "text-red-400", bg: "bg-red-500/20", bar: "bg-red-500" };
  };
  const deltaColor = getDeltaColor();

  // Local state
  const [editingControl, setEditingControl] = useState(false);
  const [controlInput, setControlInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", assemblyType: "", squareFeet: "", notes: "" });

  const handleSaveControl = useCallback(async () => {
    if (isDemo) { setEditingControl(false); return; }
    const val = parseFloat(controlInput);
    if (!isNaN(val) && val > 0 && isValidConvexId) {
      await updateProject({ projectId: projectId as Id<"bidshield_projects">, grossRoofArea: val });
    }
    setEditingControl(false);
  }, [controlInput, isDemo, isValidConvexId, projectId, updateProject]);

  const handleAddSection = useCallback(async () => {
    if (isDemo || !userId || !isValidConvexId) { setShowAddForm(false); return; }
    const sf = parseFloat(newSection.squareFeet);
    if (!newSection.name.trim() || isNaN(sf) || sf <= 0) return;
    await createSection({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      name: newSection.name.trim(),
      assemblyType: newSection.assemblyType,
      squareFeet: sf,
      notes: newSection.notes.trim() || undefined,
    });
    setNewSection({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" });
    setShowAddForm(false);
  }, [isDemo, userId, isValidConvexId, newSection, projectId, createSection]);

  const handleToggleComplete = useCallback(async (section: TakeoffSection) => {
    if (isDemo) return;
    await updateSection({ sectionId: section._id as Id<"bidshield_takeoff_sections">, completed: !section.completed });
  }, [isDemo, updateSection]);

  const handleStartEdit = (section: TakeoffSection) => {
    setEditingId(section._id);
    setEditData({
      name: section.name,
      assemblyType: section.assemblyType,
      squareFeet: String(section.squareFeet),
      notes: section.notes || "",
    });
  };

  const handleSaveEdit = useCallback(async () => {
    if (isDemo || !editingId) { setEditingId(null); return; }
    const sf = parseFloat(editData.squareFeet);
    if (!editData.name.trim() || isNaN(sf) || sf <= 0) return;
    await updateSection({
      sectionId: editingId as Id<"bidshield_takeoff_sections">,
      name: editData.name.trim(),
      assemblyType: editData.assemblyType,
      squareFeet: sf,
      notes: editData.notes.trim() || undefined,
    });
    setEditingId(null);
  }, [isDemo, editingId, editData, updateSection]);

  const handleDelete = useCallback(async (sectionId: string) => {
    if (isDemo) return;
    await deleteSection({ sectionId: sectionId as Id<"bidshield_takeoff_sections"> });
  }, [isDemo, deleteSection]);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white">Takeoff Reconciliation</h3>
        {controlNumber !== null && !editingControl && (
          <button
            onClick={() => { setControlInput(String(controlNumber)); setEditingControl(true); }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Edit Control #
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Control Number */}
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          {editingControl ? (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                value={controlInput}
                onChange={(e) => setControlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveControl(); if (e.key === "Escape") setEditingControl(false); }}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-center text-white text-sm w-full focus:outline-none focus:border-amber-500"
                autoFocus
                placeholder="SF"
              />
              <div className="flex gap-1 justify-center">
                <button onClick={handleSaveControl} className="text-[10px] text-emerald-400 hover:text-emerald-300">Save</button>
                <button onClick={() => setEditingControl(false)} className="text-[10px] text-slate-500 hover:text-slate-300">Cancel</button>
              </div>
            </div>
          ) : controlNumber !== null ? (
            <>
              <div className="text-lg font-bold text-white">{fmt(controlNumber)} SF</div>
              <div className="text-[10px] text-slate-500">Control # (Gross Area)</div>
            </>
          ) : (
            <button
              onClick={() => { setControlInput(""); setEditingControl(true); }}
              className="w-full"
            >
              <div className="text-lg font-bold text-slate-500">Not set</div>
              <div className="text-[10px] text-amber-400">Click to set control #</div>
            </button>
          )}
        </div>

        {/* Taken Off */}
        <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700">
          <div className="text-lg font-bold text-white">{fmt(takenOff)} SF</div>
          <div className="text-[10px] text-slate-500">Taken Off (Sum)</div>
        </div>

        {/* Delta */}
        <div className={`bg-slate-900 rounded-lg p-3 text-center border border-slate-700`}>
          {delta !== null ? (
            <>
              <div className={`text-lg font-bold ${deltaColor.text}`}>
                {delta >= 0 ? "-" : "+"}{fmt(Math.abs(delta))} SF
              </div>
              <div className="text-[10px] text-slate-500">Delta</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-slate-500">—</div>
              <div className="text-[10px] text-slate-500">Set control # to compare</div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progressPct !== null && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500">Reconciliation Progress</span>
            <span className={`text-xs font-bold ${deltaColor.text}`}>{progressPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${deltaColor.bar}`}
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Section table */}
      {displaySections.length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 border-b border-slate-700">
                <th className="text-left py-2 font-medium">Section Name</th>
                <th className="text-left py-2 font-medium hidden sm:table-cell">Assembly</th>
                <th className="text-right py-2 font-medium">SF</th>
                <th className="text-center py-2 font-medium w-10">Status</th>
                <th className="text-right py-2 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {displaySections.map((section) => (
                editingId === section._id ? (
                  <tr key={section._id} className="border-b border-slate-700/50">
                    <td className="py-2 pr-2">
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2 pr-2 hidden sm:table-cell">
                      <select
                        value={editData.assemblyType}
                        onChange={(e) => setEditData({ ...editData, assemblyType: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-1 py-1 text-white text-xs w-full focus:outline-none focus:border-amber-500"
                      >
                        {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={editData.squareFeet}
                        onChange={(e) => setEditData({ ...editData, squareFeet: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs w-20 text-right focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td colSpan={2} className="py-2 text-right">
                      <button onClick={handleSaveEdit} className="text-[11px] text-emerald-400 hover:text-emerald-300 mr-2">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-[11px] text-slate-500 hover:text-slate-300">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={section._id} className="border-b border-slate-700/50 group">
                    <td className="py-2 text-slate-200">{section.name}</td>
                    <td className="py-2 text-slate-400 text-xs hidden sm:table-cell">{section.assemblyType}</td>
                    <td className="py-2 text-right text-slate-200 tabular-nums">{fmt(section.squareFeet)}</td>
                    <td className="py-2 text-center">
                      <button onClick={() => handleToggleComplete(section)} className="text-base">
                        {section.completed ? "✅" : "⬜"}
                      </button>
                    </td>
                    <td className="py-2 text-right">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStartEdit(section)} className="text-[11px] text-slate-400 hover:text-slate-200 mr-2">Edit</button>
                        <button onClick={() => handleDelete(section._id)} className="text-[11px] text-red-400 hover:text-red-300">Del</button>
                      </span>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {displaySections.length === 0 && !showAddForm && (
        <div className="text-center py-6 text-slate-500 text-sm mb-3">
          No sections yet. Add your first takeoff section to start reconciling.
        </div>
      )}

      {/* Add Section Form */}
      {showAddForm ? (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Section Name *</label>
              <input
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                placeholder="e.g., Main Roof Area A"
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Assembly Type *</label>
              <select
                value={newSection.assemblyType}
                onChange={(e) => setNewSection({ ...newSection, assemblyType: e.target.value })}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500"
              >
                {ASSEMBLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Square Feet *</label>
              <input
                type="number"
                value={newSection.squareFeet}
                onChange={(e) => setNewSection({ ...newSection, squareFeet: e.target.value })}
                placeholder="e.g., 22000"
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Notes</label>
              <input
                value={newSection.notes}
                onChange={(e) => setNewSection({ ...newSection, notes: e.target.value })}
                placeholder="Optional notes"
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSection}
              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Section
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          + Add Section
        </button>
      )}

      {/* Warning message */}
      <div className="mt-3">
        {controlNumber === null ? (
          <div className="p-3 bg-slate-700/50 rounded-lg text-sm text-slate-400">
            Enter your gross roof area from the site plan to enable reconciliation.
          </div>
        ) : deltaPct !== null && deltaPct > 5 ? (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {fmt(Math.abs(delta!))} SF unaccounted for ({deltaPct.toFixed(1)}%). Check plans for missed roof sections.
          </div>
        ) : deltaPct !== null && deltaPct > 2 ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
            Minor discrepancy of {fmt(Math.abs(delta!))} SF ({deltaPct.toFixed(1)}%). Verify all sections are accounted for.
          </div>
        ) : deltaPct !== null ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
            Takeoff reconciles within tolerance.
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
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
        trade: "roofing",
        systemType: "tpo",
        deckType: "steel",
      }
    : project;

  // Build trade-aware checklist template
  const trade = (projectData as any)?.trade || "roofing";
  const systemType = (projectData as any)?.systemType || undefined;
  const deckType = (projectData as any)?.deckType || undefined;
  const checklistTemplate = getChecklistForTrade(trade, systemType, deckType);

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
  const reconControl = isDemo ? 45000 : (projectData as any)?.grossRoofArea ?? null;
  const reconPct = reconControl && reconControl > 0 ? Math.min(100, Math.round((reconTakenOff / reconControl) * 100)) : null;
  const reconDeltaPct = reconControl && reconControl > 0 ? Math.abs(((reconControl - reconTakenOff) / reconControl) * 100) : null;
  const reconColor = reconDeltaPct === null ? "text-slate-500" : reconDeltaPct <= 2 ? "text-emerald-400" : reconDeltaPct <= 5 ? "text-amber-400" : "text-red-400";

  const statusStyle = statusColors[projectData?.status || "setup"] || statusColors.setup;
  const demoQuery = isDemo ? "&demo=true" : "";
  const projectQuery = `project=${projectIdParam}${demoQuery}`;

  // Calculate days until bid
  const bidDate = projectData?.bidDate ? new Date(projectData.bidDate) : null;
  const daysUntilBid = bidDate
    ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

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
            {systemType && (
              <span className="text-[10px] font-medium bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase">{systemType}</span>
            )}
            {deckType && (
              <span className="text-[10px] font-medium bg-slate-600/50 text-slate-400 px-2 py-0.5 rounded capitalize">{deckType} deck</span>
            )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className={`text-2xl font-bold ${reconColor}`}>
            {reconPct !== null ? `${reconPct}%` : "—"}
          </div>
          <div className="text-[11px] text-slate-400">{reconControl !== null ? "Reconciled" : "No Control #"}</div>
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

      {/* Takeoff Reconciliation */}
      <TakeoffReconciliation
        projectId={projectIdParam}
        grossRoofArea={reconControl}
        isDemo={isDemo}
        userId={userId}
      />
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
