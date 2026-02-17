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

  // ── STATS ──
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: any) => i.status === "rfi").length;
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections = isDemo ? demoSections : (takeoffSections ?? []);
  const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const controlSF = isDemo ? 45000 : project?.grossRoofArea ?? 0;
  const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct = controlSF > 0 ? Math.abs((controlSF - takenOff) / controlSF) * 100 : null;

  const bidAmt = isDemo ? 850000 : project?.totalBidAmount;
  const matCost = isDemo ? 425000 : project?.materialCost;
  const labCost = isDemo ? 340000 : project?.laborCost;
  const grossArea = isDemo ? 45000 : project?.grossRoofArea;
  const dpsf = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;
  const pricingComplete = !!(bidAmt && bidAmt > 0 && matCost && labCost);

  const matList = isDemo
    ? [{ totalCost: 13680, unitPrice: 285 }, { totalCost: 50218, unitPrice: 34 }, { totalCost: 32494, unitPrice: 22 }, { totalCost: 3480, unitPrice: 145 }, { totalCost: 2640, unitPrice: 165 }, { totalCost: 36630, unitPrice: 185 }, { totalCost: 16120, unitPrice: 65 }, { totalCost: 1512, unitPrice: 18 }, { totalCost: 1764, unitPrice: 42 }, { totalCost: 840, unitPrice: 35 }, { totalCost: 1000, unitPrice: 125 }, { totalCost: 28600, unitPrice: 55 }]
    : (projectMaterials ?? []);
  const matItemCount = matList.length;
  const matTotalCost = matList.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
  const matUnpriced = matList.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;
  const matPricedPct = matItemCount > 0 ? ((matItemCount - matUnpriced) / matItemCount) * 100 : 0;

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

  const bidDate = project?.bidDate ? new Date(project.bidDate) : null;
  const daysUntilBid = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / 86400000) : null;

  // ── READINESS SCORE ──
  const s_checklist = checklistPct;
  const s_takeoff = deltaPct === null || controlSF === 0 ? 0 : deltaPct < 2 ? 100 : deltaPct < 5 ? 75 : deltaPct < 10 ? 50 : 25;
  const s_pricing = pricingComplete ? 100 : bidAmt && bidAmt > 0 ? 50 : 0;
  const s_materials = matItemCount === 0 ? 0 : matPricedPct > 80 ? 100 : matPricedPct > 0 ? 50 : 0;
  const s_scope = scopeTotal === 0 ? 0 : scopePct;
  const s_quotes = quoteCount === 0 ? 0 : Math.max(0, 100 - (expiredQuotes * 30) - (expiringQuotes * 20));
  const addendaIssues = addendaNotReviewed + scopeNotRepriced;
  const s_addenda = addendaCount === 0 ? 100 : Math.max(0, Math.round(100 - (addendaIssues / addendaCount) * 100));
  const s_rfis = rfiCount === 0 ? 100 : Math.max(0, 100 - (pendingRFIs * 25));
  const s_validator = (() => {
    let passes = 0, warns = 0; const total = 7;
    if (checklistPct >= 95) passes++; else if (checklistPct >= 70) warns++;
    if (expiredQuotes > 0 || quoteCount === 0) {} else if (expiringQuotes > 0) warns++; else passes++;
    if (pendingRFIs > 0) warns++; else passes++;
    if (daysUntilBid !== null && daysUntilBid <= 0) {} else if (daysUntilBid !== null && daysUntilBid <= 2) warns++; else passes++;
    if (!project?.gc || !project?.sqft) warns++; else passes++;
    if (scopePct >= 100) passes++; else if (scopePct >= 80) warns++;
    if (scopeNotRepriced > 0) {} else if (addendaNotReviewed > 0) warns++; else passes++;
    return total > 0 ? ((passes + warns * 0.4) / total) * 100 : 0;
  })();

  const readinessScore = Math.round(
    (s_checklist / 100) * 15 + (s_takeoff / 100) * 15 + (s_pricing / 100) * 15 + (s_materials / 100) * 10 +
    (s_scope / 100) * 15 + (s_quotes / 100) * 10 + (s_addenda / 100) * 10 + (s_rfis / 100) * 5 + (s_validator / 100) * 5
  );

  const scoreColor = readinessScore >= 90 ? "text-emerald-600" : readinessScore >= 70 ? "text-amber-600" : readinessScore >= 50 ? "text-orange-600" : "text-red-600";
  const barColor = readinessScore >= 90 ? "bg-emerald-500" : readinessScore >= 70 ? "bg-amber-500" : readinessScore >= 50 ? "bg-orange-500" : "bg-red-500";
  const scoreLabel = readinessScore >= 90 ? "Ready to submit" : readinessScore >= 70 ? "Almost ready" : readinessScore >= 50 ? "Needs work" : "Not ready";
  const deadlineColor = daysUntilBid === null ? "text-slate-400" : daysUntilBid > 7 ? "text-slate-500" : daysUntilBid >= 3 ? "text-amber-600" : "text-red-600";
  const deadlineText = daysUntilBid === null ? "" : daysUntilBid > 1 ? `${daysUntilBid} days left` : daysUntilBid === 1 ? "1 day left" : daysUntilBid === 0 ? "DUE TODAY" : "OVERDUE";

  // ── ACTION ITEMS ──
  const actionItems: ActionItem[] = [];
  if (scopeTotal > 0) {
    if (scopePct < 80) actionItems.push({ level: "red", text: `${scopeUnaddressed} scope items not addressed`, tab: "scope" });
    else if (scopePct < 100) actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope items remaining`, tab: "scope" });
    else actionItems.push({ level: "green", text: `All ${scopeTotal} scope items addressed`, tab: "scope" });
  }
  if (scopeNotRepriced > 0) actionItems.push({ level: "red", text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope \u2014 not re-priced`, tab: "addenda" });
  if (addendaNotReviewed > 0) actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not yet reviewed`, tab: "addenda" });
  const addendaOk = addendaCount - addendaNotReviewed - scopeNotRepriced;
  if (addendaOk > 0) actionItems.push({ level: "green", text: `${addendaOk} addend${addendaOk > 1 ? "a" : "um"} reviewed & re-priced`, tab: "addenda" });
  if (controlSF > 0 && deltaPct !== null) {
    if (deltaPct > 5) actionItems.push({ level: "red", text: `${deltaSF.toLocaleString()} SF unaccounted in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    else if (deltaPct > 2) actionItems.push({ level: "yellow", text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    else actionItems.push({ level: "green", text: `Takeoff reconciled (${deltaPct.toFixed(1)}% delta)`, tab: "takeoff" });
  }
  if (expiredQuotes > 0) actionItems.push({ level: "red", text: `${expiredQuotes} quote${expiredQuotes !== 1 ? "s" : ""} expired`, tab: "quotes" });
  if (expiringQuotes > 0) actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`, tab: "quotes" });
  if (quoteCount > 0 && expiredQuotes === 0 && expiringQuotes === 0) actionItems.push({ level: "green", text: `All ${quoteCount} quotes received`, tab: "quotes" });
  if (pendingRFIs > 0) actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`, tab: "rfis" });
  else if (rfiCount > 0) actionItems.push({ level: "green", text: `All ${rfiCount} RFIs resolved`, tab: "rfis" });
  if (checklistPct < 50) actionItems.push({ level: "red", text: `Checklist only ${checklistPct}% complete`, tab: "checklist" });
  else if (checklistPct < 80) actionItems.push({ level: "yellow", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  else if (checklistPct < 100) actionItems.push({ level: "green", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  else if (totalItems > 0) actionItems.push({ level: "green", text: "Checklist complete", tab: "checklist" });
  if (rfiItems > 0) actionItems.push({ level: "yellow", text: `${rfiItems} checklist items flagged as RFI`, tab: "checklist" });
  if (matItemCount === 0) actionItems.push({ level: "yellow", text: "Materials not yet calculated", tab: "materials" });
  else if (matUnpriced > 0) actionItems.push({ level: "yellow", text: `${matUnpriced} materials missing pricing`, tab: "materials" });
  else actionItems.push({ level: "green", text: `Materials calculated ($${matTotalCost.toLocaleString()})`, tab: "materials" });
  if (pricingComplete) actionItems.push({ level: "green", text: `Pricing entered ($${bidAmt?.toLocaleString()})`, tab: "pricing" });
  else if (bidAmt && bidAmt > 0) actionItems.push({ level: "yellow", text: "Pricing incomplete \u2014 missing cost breakdown", tab: "pricing" });

  actionItems.sort((a, b) => ({ red: 0, yellow: 1, green: 2 }[a.level]) - ({ red: 0, yellow: 1, green: 2 }[b.level]));
  const redYellowItems = actionItems.filter(i => i.level !== "green");
  const greenItems = actionItems.filter(i => i.level === "green");
  const collapseGreen = greenItems.length >= 3;

  const levelStyles = {
    red: { bg: "bg-red-50", border: "border-l-red-500", dot: "bg-red-500", text: "text-slate-700" },
    yellow: { bg: "bg-amber-50", border: "border-l-amber-500", dot: "bg-amber-500", text: "text-slate-700" },
    green: { bg: "bg-emerald-50/50", border: "border-l-emerald-400", dot: "bg-emerald-500", text: "text-slate-500" },
  };

  const tabLabels: Record<string, string> = {
    scope: "Scope", addenda: "Addenda", takeoff: "Takeoff", quotes: "Quotes",
    rfis: "RFIs", checklist: "Checklist", materials: "Materials", pricing: "Pricing",
    validator: "Validator", overview: "Overview", labor: "Labor",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── BID READINESS ── */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Bid Readiness</h3>
          {daysUntilBid !== null && (
            <div className="text-right">
              <div className={`text-lg font-bold ${deadlineColor}`}>{deadlineText}</div>
              <div className="text-[11px] text-slate-400">until bid &bull; {project?.bidDate}</div>
            </div>
          )}
        </div>

        <div className="flex items-end gap-4 mb-4">
          <span className={`text-5xl font-bold tabular-nums ${scoreColor}`}>{readinessScore}%</span>
          <span className="text-sm text-slate-500 pb-2">{scoreLabel}</span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${readinessScore}%` }} />
        </div>

        {(bidAmt || grossArea) && (
          <div className="text-sm text-slate-500">
            {bidAmt ? `$${bidAmt.toLocaleString()} bid` : ""}
            {bidAmt && dpsf ? "  \u2022  " : ""}
            {dpsf ? `$${dpsf.toFixed(2)}/SF` : ""}
            {(bidAmt || dpsf) && grossArea ? "  \u2022  " : ""}
            {grossArea ? `${grossArea.toLocaleString()} SF` : ""}
          </div>
        )}
      </div>

      {/* ── ACTION ITEMS ── */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Action Items ({redYellowItems.length})
        </h3>

        {actionItems.length === 0 ? (
          <div className="text-sm text-emerald-600 py-4 text-center font-medium">All clear \u2014 bid is ready to submit</div>
        ) : (
          <div className="space-y-2">
            {redYellowItems.map((item, i) => {
              const style = levelStyles[item.level];
              return (
                <button key={`${item.tab}-${i}`} onClick={() => onNavigateTab?.(item.tab)}
                  className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-lg border-l-4 ${style.border} ${style.bg} hover:shadow-sm transition-all group`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                    <span className={`text-sm ${style.text}`}>{item.text}</span>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-emerald-600 flex-shrink-0 ml-4">Open {tabLabels[item.tab]} &rarr;</span>
                </button>
              );
            })}

            {greenItems.length > 0 && (
              <>
                {collapseGreen && !showCompleted ? (
                  <button onClick={() => setShowCompleted(true)} className="text-xs text-slate-400 hover:text-emerald-600 py-2 px-4 transition-colors">
                    Show {greenItems.length} completed items &darr;
                  </button>
                ) : (
                  <>
                    {collapseGreen && (
                      <button onClick={() => setShowCompleted(false)} className="text-xs text-slate-400 hover:text-emerald-600 py-2 px-4 transition-colors">
                        Hide completed items &uarr;
                      </button>
                    )}
                    {greenItems.map((item, i) => (
                      <button key={`green-${item.tab}-${i}`} onClick={() => onNavigateTab?.(item.tab)}
                        className={`flex items-center justify-between w-full text-left px-4 py-2.5 rounded-lg border-l-4 ${levelStyles.green.border} ${levelStyles.green.bg} hover:shadow-sm transition-all group opacity-80`}>
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500" />
                          <span className="text-xs text-slate-500">{item.text}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 flex-shrink-0 ml-4">Open {tabLabels[item.tab]} &rarr;</span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── PROJECT INFO ── */}
      <div className="bg-white rounded-xl px-6 py-4 border border-slate-200">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {project?.name && <span className="text-slate-700 font-medium">{project.name}</span>}
          {project?.location && <span className="text-slate-500">{project.location}</span>}
          {project?.gc && <span className="text-slate-500">GC: {project.gc}</span>}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-1">
          {project?.assemblies?.length > 0 && <span className="text-slate-400">{project.assemblies.join(", ")}</span>}
          {project?.deckType && <span className="text-slate-400">{project.deckType} deck</span>}
          {project?.bidDate && <span className="text-slate-400">Bid: {project.bidDate}</span>}
        </div>
        {project?.notes && <p className="text-sm text-slate-400 mt-2 italic">{project.notes}</p>}
      </div>
    </div>
  );
}
