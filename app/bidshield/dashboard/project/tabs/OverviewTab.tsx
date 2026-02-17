"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";

type ActionLevel = "red" | "yellow" | "green";
interface ActionItem { level: ActionLevel; text: string; tab: TabId }

export default function OverviewTab({ projectId, isDemo, project, userId, onNavigateTab, cachedData }: TabProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const hasCached = !!cachedData;
  const _checklist = useQuery(api.bidshield.getChecklist, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _quotes = useQuery(api.bidshield.getQuotes, !hasCached && !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined } : "skip");
  const _rfis = useQuery(api.bidshield.getRFIs, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _addenda = useQuery(api.bidshield.getAddenda, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _projectMaterials = useQuery(api.bidshield.getProjectMaterials, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _scopeItems = useQuery(api.bidshield.getScopeItems, !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

  const checklist = cachedData?.checklist ?? _checklist;
  const quotes = cachedData?.quotes ?? _quotes;
  const rfis = cachedData?.rfis ?? _rfis;
  const addenda = cachedData?.addenda ?? _addenda;
  const projectMaterials = cachedData?.projectMaterials ?? _projectMaterials;
  const scopeItems = cachedData?.scopeItems ?? _scopeItems;

  // Stats
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: any) => i.status === "rfi").length;
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections = isDemo ? demoSections : (takeoffSections ?? []);
  const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const controlSF = isDemo ? 68000 : project?.grossRoofArea ?? 0;
  const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct = controlSF > 0 ? Math.abs((controlSF - takenOff) / controlSF) * 100 : null;

  const bidAmt = isDemo ? 1250000 : project?.totalBidAmount;
  const matCost = isDemo ? 425000 : project?.materialCost;
  const labCost = isDemo ? 340000 : project?.laborCost;
  const grossArea = isDemo ? 68000 : project?.grossRoofArea;
  const dpsf = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;
  const pricingComplete = !!(bidAmt && bidAmt > 0 && matCost && labCost);

  const matList = isDemo
    ? [{ totalCost: 13680, unitPrice: 285 }, { totalCost: 50218, unitPrice: 34 }, { totalCost: 32494, unitPrice: 22 }, { totalCost: 3480, unitPrice: 145 }, { totalCost: 2640, unitPrice: 165 }, { totalCost: 36630, unitPrice: 185 }, { totalCost: 16120, unitPrice: 65 }, { totalCost: 1512, unitPrice: 18 }, { totalCost: 1764, unitPrice: 42 }, { totalCost: 840, unitPrice: 35 }, { totalCost: 1000, unitPrice: 125 }, { totalCost: 28600, unitPrice: 55 }]
    : (projectMaterials ?? []);
  const matItemCount = matList.length;
  const matTotalCost = matList.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
  const matUnpriced = matList.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

  const scopeList = isDemo ? Array.from({ length: 40 }, (_, i) => ({ status: i < 12 ? "included" : i < 16 ? "excluded" : i < 19 ? "by_others" : i < 21 ? "na" : "unaddressed" })) : (scopeItems ?? []);
  const scopeTotal = scopeList.length;
  const scopeAddressed = scopeList.filter((s: any) => s.status !== "unaddressed").length;
  const scopeUnaddressed = scopeTotal - scopeAddressed;
  const scopePct = scopeTotal > 0 ? (scopeAddressed / scopeTotal) * 100 : 100;

  const quoteList = isDemo ? [] : (quotes ?? []);
  const quoteCount = isDemo ? 5 : quoteList.length;
  const expiringQuotes = isDemo ? 1 : quoteList.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;
  const expiredQuotes = isDemo ? 0 : quoteList.filter((q: any) => { const d = q.expirationDate; return d && new Date(d).getTime() < Date.now(); }).length;

  const addendaList = isDemo ? [] : (addenda ?? []);
  const addendaCount = isDemo ? 3 : addendaList.length;
  const addendaNotReviewed = isDemo ? 0 : addendaList.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
  const scopeNotRepriced = isDemo ? 1 : addendaList.filter((a: any) => a.affectsScope === true && !a.repriced).length;

  const rfiList = isDemo ? [] : (rfis ?? []);
  const rfiCount = isDemo ? 3 : rfiList.length;
  const pendingRFIs = isDemo ? 1 : rfiList.filter((r: any) => r.status === "sent" || r.status === "draft").length;

  // Action items
  const actionItems: ActionItem[] = [];
  if (scopeTotal > 0) {
    if (scopePct < 80) actionItems.push({ level: "red", text: `${scopeUnaddressed} scope items not addressed`, tab: "scope" });
    else if (scopePct < 100) actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope items remaining`, tab: "scope" });
  }
  if (scopeNotRepriced > 0) actionItems.push({ level: "red", text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope — not re-priced`, tab: "addenda" });
  if (addendaNotReviewed > 0) actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not yet reviewed`, tab: "addenda" });
  if (controlSF > 0 && deltaPct !== null) {
    if (deltaPct > 5) actionItems.push({ level: "red", text: `${deltaSF.toLocaleString()} SF unaccounted in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    else if (deltaPct > 2) actionItems.push({ level: "yellow", text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
  }
  if (expiredQuotes > 0) actionItems.push({ level: "red", text: `${expiredQuotes} expired quote${expiredQuotes !== 1 ? "s" : ""}`, tab: "quotes" });
  if (expiringQuotes > 0) actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`, tab: "quotes" });
  if (pendingRFIs > 0) actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`, tab: "rfis" });
  if (checklistPct < 80) actionItems.push({ level: checklistPct < 50 ? "red" : "yellow", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  if (rfiItems > 0) actionItems.push({ level: "yellow", text: `${rfiItems} checklist items flagged as RFI`, tab: "checklist" });
  if (matItemCount === 0) actionItems.push({ level: "yellow", text: "Materials not yet calculated", tab: "materials" });
  else if (matUnpriced > 0) actionItems.push({ level: "yellow", text: `${matUnpriced} materials missing pricing`, tab: "materials" });
  if (!pricingComplete && (!bidAmt || bidAmt === 0)) actionItems.push({ level: "yellow", text: "Pricing not entered", tab: "pricing" });

  actionItems.sort((a, b) => ({ red: 0, yellow: 1, green: 2 }[a.level]) - ({ red: 0, yellow: 1, green: 2 }[b.level]));
  const greenCount = [
    scopeTotal > 0 && scopePct >= 100,
    addendaCount > 0 && addendaNotReviewed === 0 && scopeNotRepriced === 0,
    quoteCount > 0 && expiredQuotes === 0 && expiringQuotes === 0,
    rfiCount > 0 && pendingRFIs === 0,
    checklistPct >= 80,
    matItemCount > 0 && matUnpriced === 0,
    pricingComplete,
  ].filter(Boolean).length;

  const tabLabels: Record<string, string> = {
    scope: "Scope", addenda: "Addenda", takeoff: "Takeoff", quotes: "Quotes",
    rfis: "RFIs", checklist: "Checklist", materials: "Materials", pricing: "Pricing",
  };

  const levelStyles = {
    red: { border: "border-l-red-500", bg: "bg-red-50", dot: "bg-red-500" },
    yellow: { border: "border-l-amber-400", bg: "bg-amber-50", dot: "bg-amber-400" },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick stats row */}
      {(bidAmt || grossArea) && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {bidAmt ? <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-medium">${bidAmt.toLocaleString()} bid</span> : null}
          {dpsf ? <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">${dpsf.toFixed(2)}/SF</span> : null}
          {grossArea ? <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">{grossArea.toLocaleString()} SF</span> : null}
        </div>
      )}

      {/* Action items — the core of this tab */}
      {actionItems.length === 0 ? (
        <div className="bg-emerald-50 rounded-lg p-6 text-center border border-emerald-200">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-semibold text-emerald-700">All clear — bid is ready to submit</div>
          <div className="text-xs text-emerald-600 mt-1">{greenCount} items passing</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            What needs attention ({actionItems.length})
          </div>
          {actionItems.map((item, i) => {
            const style = levelStyles[item.level as "red" | "yellow"];
            return (
              <button
                key={`${item.tab}-${i}`}
                onClick={() => onNavigateTab?.(item.tab)}
                className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg border-l-3 ${style.border} ${style.bg} hover:shadow-sm transition-all group`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                  <span className="text-xs text-slate-700">{item.text}</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 flex-shrink-0 ml-3">
                  {tabLabels[item.tab]} →
                </span>
              </button>
            );
          })}
          {greenCount > 0 && (
            <div className="text-[10px] text-emerald-600 px-1 pt-1">{greenCount} item{greenCount > 1 ? "s" : ""} passing ✓</div>
          )}
        </div>
      )}

      {/* Project notes (only if they exist) */}
      {project?.notes && (
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Notes</div>
          <p className="text-xs text-slate-600">{project.notes}</p>
        </div>
      )}
    </div>
  );
}
