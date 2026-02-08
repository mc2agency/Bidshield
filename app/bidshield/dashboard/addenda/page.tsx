"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

function AddendaContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const createAddendumMut = useMutation(api.bidshield.createAddendum);
  const updateAddendumMut = useMutation(api.bidshield.updateAddendum);
  const deleteAddendumMut = useMutation(api.bidshield.deleteAddendum);

  const [showAdd, setShowAdd] = useState(false);
  const [newAddendum, setNewAddendum] = useState({
    title: "",
    receivedDate: new Date().toISOString().split("T")[0],
    affectsScope: false,
    notes: "",
  });

  // Demo data
  const demoAddenda = [
    {
      _id: "demo_add_1" as any,
      number: 1,
      title: "Revised RTU schedule — 2 units upsized",
      receivedDate: "2026-02-03",
      affectsScope: true,
      acknowledged: true,
      incorporated: true,
      notes: "RTU-3 changed from 4x6 to 5x8 curb. RTU-7 added (new unit on L3 roof).",
    },
    {
      _id: "demo_add_2" as any,
      number: 2,
      title: "Spec clarification — membrane manufacturer",
      receivedDate: "2026-02-05",
      affectsScope: false,
      acknowledged: true,
      incorporated: false,
      notes: "Carlisle or approved equal accepted. GAF no longer on approved list.",
    },
    {
      _id: "demo_add_3" as any,
      number: 3,
      title: "Added roof hatch at stair tower B",
      receivedDate: "2026-02-07",
      affectsScope: true,
      acknowledged: false,
      incorporated: false,
      notes: "",
    },
  ];

  const projectData = isDemo ? { name: "Harbor Point Tower", bidDate: "2026-02-15" } : project;
  const resolvedAddenda = isDemo ? demoAddenda : (addenda ?? []);

  const nextNumber = resolvedAddenda.length > 0
    ? Math.max(...resolvedAddenda.map((a: any) => a.number)) + 1
    : 1;

  const handleAdd = async () => {
    if (!newAddendum.title || !userId || !projectIdParam || isDemo) return;
    await createAddendumMut({
      projectId: projectIdParam as Id<"bidshield_projects">,
      userId,
      number: nextNumber,
      title: newAddendum.title,
      receivedDate: newAddendum.receivedDate,
      affectsScope: newAddendum.affectsScope,
      notes: newAddendum.notes || undefined,
    });
    setNewAddendum({ title: "", receivedDate: new Date().toISOString().split("T")[0], affectsScope: false, notes: "" });
    setShowAdd(false);
  };

  const toggleAcknowledged = async (addendumId: Id<"bidshield_addenda">, current: boolean) => {
    if (isDemo) return;
    await updateAddendumMut({ addendumId, acknowledged: !current });
  };

  const toggleIncorporated = async (addendumId: Id<"bidshield_addenda">, current: boolean) => {
    if (isDemo) return;
    await updateAddendumMut({ addendumId, incorporated: !current });
  };

  const handleDelete = async (addendumId: Id<"bidshield_addenda">) => {
    if (isDemo) return;
    await deleteAddendumMut({ addendumId });
  };

  // Stats
  const totalAddenda = resolvedAddenda.length;
  const scopeImpact = resolvedAddenda.filter((a: any) => a.affectsScope).length;
  const acknowledged = resolvedAddenda.filter((a: any) => a.acknowledged).length;
  const incorporated = resolvedAddenda.filter((a: any) => a.incorporated).length;
  const needsAction = totalAddenda - incorporated;

  if (!projectIdParam) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-white mb-2">Addenda Tracker</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Select a project from the dashboard to track addenda.
        </p>
        <Link
          href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Addenda Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">
            {projectData?.name || "Project"} — {totalAddenda} addend{totalAddenda !== 1 ? "a" : "um"} received
          </p>
        </div>
        {!isDemo && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Log Addendum
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-white">{totalAddenda}</div>
          <div className="text-[11px] text-slate-400">Total Received</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className={`text-2xl font-bold ${scopeImpact > 0 ? "text-amber-400" : "text-slate-400"}`}>{scopeImpact}</div>
          <div className="text-[11px] text-slate-400">Affect Scope</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-emerald-400">{acknowledged}</div>
          <div className="text-[11px] text-slate-400">Acknowledged</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className={`text-2xl font-bold ${needsAction > 0 ? "text-red-400" : "text-emerald-400"}`}>{needsAction}</div>
          <div className="text-[11px] text-slate-400">Not Yet Incorporated</div>
        </div>
      </div>

      {/* Warning banner */}
      {needsAction > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
          {needsAction} addend{needsAction !== 1 ? "a" : "um"} not yet incorporated into your estimate. Review before submitting.
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-800 rounded-xl p-5 border border-emerald-500/50">
          <h3 className="text-sm font-semibold text-white mb-4">Log Addendum #{nextNumber}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description *</label>
              <input
                type="text"
                value={newAddendum.title}
                onChange={(e) => setNewAddendum({ ...newAddendum, title: e.target.value })}
                placeholder="Revised RTU schedule — 2 units upsized"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date Received</label>
                <input
                  type="date"
                  value={newAddendum.receivedDate}
                  onChange={(e) => setNewAddendum({ ...newAddendum, receivedDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddendum.affectsScope}
                    onChange={(e) => setNewAddendum({ ...newAddendum, affectsScope: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-900 text-emerald-500"
                  />
                  <span className="text-sm text-slate-300">Affects my scope</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notes</label>
              <textarea
                value={newAddendum.notes}
                onChange={(e) => setNewAddendum({ ...newAddendum, notes: e.target.value })}
                placeholder="What changed? How does it affect your bid?"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Save
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addenda List */}
      {resolvedAddenda.length > 0 ? (
        <div className="flex flex-col gap-3">
          {[...resolvedAddenda].sort((a: any, b: any) => a.number - b.number).map((add: any) => (
            <div
              key={add._id}
              className={`bg-slate-800 rounded-xl p-4 border ${
                add.affectsScope && !add.incorporated ? "border-amber-500/50" : "border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      #{add.number}
                    </span>
                    {add.affectsScope && (
                      <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        SCOPE IMPACT
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{add.receivedDate}</span>
                  </div>
                  <div className="text-sm text-white font-medium">{add.title}</div>
                  {add.notes && (
                    <div className="text-[13px] text-slate-400 mt-1">{add.notes}</div>
                  )}
                </div>
                {!isDemo && (
                  <button
                    onClick={() => handleDelete(add._id)}
                    className="text-slate-600 hover:text-red-400 text-xs transition-colors shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Status toggles */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => toggleAcknowledged(add._id, add.acknowledged)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    add.acknowledged ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                    add.acknowledged ? "bg-emerald-500/20 border-emerald-500" : "border-slate-600"
                  }`}>
                    {add.acknowledged ? "✓" : ""}
                  </span>
                  Acknowledged on bid form
                </button>
                <button
                  onClick={() => toggleIncorporated(add._id, add.incorporated)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    add.incorporated ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                    add.incorporated ? "bg-emerald-500/20 border-emerald-500" : "border-slate-600"
                  }`}>
                    {add.incorporated ? "✓" : ""}
                  </span>
                  Incorporated into estimate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-sm text-slate-400 mb-2">No addenda logged for this project</p>
          <p className="text-xs text-slate-500">Click "+ Log Addendum" when you receive one from the GC</p>
        </div>
      )}
    </div>
  );
}

export default function AddendaPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading addenda...</div>}>
      <AddendaContent />
    </Suspense>
  );
}
