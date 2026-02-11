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

  // --- Data hooks (use parent cache when available to avoid duplicate subscriptions) ---
  const hasCached = !!cachedData;
  const _checklist = useQuery(api.bidshield.getChecklist,
    !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _quotes = useQuery(api.bidshield.getQuotes,
    !hasCached && !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectId as Id<"bidshield_projects">) : undefined } : "skip");
  const _rfis = useQuery(api.bidshield.getRFIs,
    !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _addenda = useQuery(api.bidshield.getAddenda,
    !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _projectMaterials = useQuery(api.bidshield.getProjectMaterials,
    !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const _scopeItems = useQuery(api.bidshield.getScopeItems,
    !hasCached && !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

  const checklist = cachedData?.checklist ?? _checklist;
  const quotes = cachedData?.quotes ?? _quotes;
  const rfis = cachedData?.rfis ?? _rfis;
  const addenda = cachedData?.addenda ?? _addenda;
  const projectMaterials = cachedData?.projectMaterials ?? _projectMaterials;
  const scopeItems = cachedData?.scopeItems ?? _scopeItems;

  // ============================================================
  // STATS COMPUTATION
  // ============================================================

  // Checklist
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: any) => i.status === "rfi").length;
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // Takeoff
  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections = isDemo ? demoSections : (takeoffSections ?? []);
  const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const controlSF = isDemo ? 45000 : project?.grossRoofArea ?? 0;
  const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct = controlSF > 0 ? Math.abs((controlSF - takenOff) / controlSF) * 100 : null;

  // Pricing
  const bidAmt = isDemo ? 850000 : project?.totalBidAmount;
  const matCost = isDemo ? 425000 : project?.materialCost;
  const labCost = isDemo ? 340000 : project?.laborCost;
  const grossArea = isDemo ? 45000 : project?.grossRoofArea;
  const dpsf = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;
  const pricingComplete = !!(bidAmt && bidAmt > 0 && matCost && labCost);

  // Materials
  const matList = isDemo
    ? [
        { totalCost: 13680, unitPrice: 285 }, { totalCost: 50218, unitPrice: 34 }, { totalCost: 32494, unitPrice: 22 },
        { totalCost: 3480, unitPrice: 145 }, { totalCost: 2640, unitPrice: 165 }, { totalCost: 36630, unitPrice: 185 },
        { totalCost: 16120, unitPrice: 65 }, { totalCost: 1512, unitPrice: 18 }, { totalCost: 1764, unitPrice: 42 },
        { totalCost: 840, unitPrice: 35 }, { totalCost: 1000, unitPrice: 125 }, { totalCost: 28600, unitPrice: 55 },
      ]
    : (projectMaterials ?? []);
  const matItemCount = matList.length;
  const matTotalCost = matList.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
  const matUnpriced = matList.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;
  const matPricedPct = matItemCount > 0 ? ((matItemCount - matUnpriced) / matItemCount) * 100 : 0;

  // Scope
  const scopeList = isDemo
    ? Array.from({ length: 40 }, (_, i) => ({
        status: i < 12 ? "included" : i < 16 ? "excluded" : i < 19 ? "by_others" : i < 21 ? "na" : "unaddressed",
      }))
    : (scopeItems ?? []);
  const scopeTotal = scopeList.length;
  const scopeAddressed = scopeList.filter((s: any) => s.status !== "unaddressed").length;
  const scopeUnaddressed = scopeTotal - scopeAddressed;
  const scopePct = scopeTotal > 0 ? (scopeAddressed / scopeTotal) * 100 : 100;

  // Quotes
  const quoteList = isDemo ? [] : (quotes ?? []);
  const quoteCount = isDemo ? 5 : quoteList.length;
  const expiringQuotes = isDemo ? 1 : quoteList.filter((q: any) => {
    const expDate = q.expirationDate;
    if (!expDate) return false;
    const days = Math.ceil((new Date(expDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 14;
  }).length;
  const expiredQuotes = isDemo ? 0 : quoteList.filter((q: any) => {
    const expDate = q.expirationDate;
    if (!expDate) return false;
    return new Date(expDate).getTime() < Date.now();
  }).length;

  // Addenda
  const addendaList = isDemo ? [] : (addenda ?? []);
  const addendaCount = isDemo ? 3 : addendaList.length;
  const addendaNotReviewed = isDemo ? 0 : addendaList.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
  const scopeNotRepriced = isDemo ? 1 : addendaList.filter((a: any) => a.affectsScope === true && !a.repriced).length;

  // RFIs
  const rfiList = isDemo ? [] : (rfis ?? []);
  const rfiCount = isDemo ? 3 : rfiList.length;
  const pendingRFIs = isDemo ? 1 : rfiList.filter((r: any) => r.status === "sent" || r.status === "draft").length;

  // Deadline
  const bidDate = project?.bidDate ? new Date(project.bidDate) : null;
  const daysUntilBid = bidDate ? Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  // ============================================================
  // BID READINESS SCORE (weighted average of 9 checks)
  // ============================================================

  // 1. Checklist (15%) — direct percentage
  const s_checklist = checklistPct;

  // 2. Takeoff reconciliation (15%) — bucket by delta %
  const s_takeoff = deltaPct === null || controlSF === 0 ? 0
    : deltaPct < 2 ? 100
    : deltaPct < 5 ? 75
    : deltaPct < 10 ? 50
    : 25;

  // 3. Pricing entered (15%) — complete, partial, or none
  const s_pricing = pricingComplete ? 100 : bidAmt && bidAmt > 0 ? 50 : 0;

  // 4. Materials calculated (10%) — existence and pricing coverage
  const s_materials = matItemCount === 0 ? 0
    : matPricedPct > 80 ? 100
    : matPricedPct > 0 ? 50
    : 0;

  // 5. Scope addressed (15%) — percentage of items not "unaddressed"
  const s_scope = scopeTotal === 0 ? 0 : scopePct;

  // 6. Quotes status (10%) — deductions for expired/expiring
  const s_quotes = quoteCount === 0 ? 0
    : Math.max(0, 100 - (expiredQuotes * 30) - (expiringQuotes * 20));

  // 7. Addenda reviewed (10%) — deductions for unreviewed/unrepriced
  const addendaIssues = addendaNotReviewed + scopeNotRepriced;
  const s_addenda = addendaCount === 0 ? 100
    : Math.max(0, Math.round(100 - (addendaIssues / addendaCount) * 100));

  // 8. RFIs resolved (5%) — deduction per pending
  const s_rfis = rfiCount === 0 ? 100
    : Math.max(0, 100 - (pendingRFIs * 25));

  // 9. Validator (5%) — simplified inline check (7 criteria)
  const s_validator = (() => {
    let passes = 0, warns = 0;
    const total = 7;
    if (checklistPct >= 95) passes++; else if (checklistPct >= 70) warns++;
    if (expiredQuotes > 0 || quoteCount === 0) { /* fail */ } else if (expiringQuotes > 0) warns++; else passes++;
    if (pendingRFIs > 0) warns++; else passes++;
    if (daysUntilBid !== null && daysUntilBid <= 0) { /* fail */ } else if (daysUntilBid !== null && daysUntilBid <= 2) warns++; else passes++;
    if (!project?.gc || !project?.sqft) warns++; else passes++;
    if (scopePct >= 100) passes++; else if (scopePct >= 80) warns++;
    if (scopeNotRepriced > 0) { /* fail */ } else if (addendaNotReviewed > 0) warns++; else passes++;
    return total > 0 ? ((passes + warns * 0.4) / total) * 100 : 0;
  })();

  const readinessScore = Math.round(
    (s_checklist / 100) * 15 +
    (s_takeoff / 100) * 15 +
    (s_pricing / 100) * 15 +
    (s_materials / 100) * 10 +
    (s_scope / 100) * 15 +
    (s_quotes / 100) * 10 +
    (s_addenda / 100) * 10 +
    (s_rfis / 100) * 5 +
    (s_validator / 100) * 5
  );

  const scoreColor = readinessScore >= 90 ? "text-emerald-400"
    : readinessScore >= 70 ? "text-amber-400"
    : readinessScore >= 50 ? "text-orange-400"
    : "text-red-400";
  const barColor = readinessScore >= 90 ? "bg-emerald-500"
    : readinessScore >= 70 ? "bg-amber-500"
    : readinessScore >= 50 ? "bg-orange-500"
    : "bg-red-500";
  const scoreLabel = readinessScore >= 90 ? "Ready to submit"
    : readinessScore >= 70 ? "Almost ready"
    : readinessScore >= 50 ? "Needs work"
    : "Not ready";

  const deadlineColor = daysUntilBid === null ? "text-slate-400"
    : daysUntilBid > 7 ? "text-slate-300"
    : daysUntilBid >= 3 ? "text-amber-400"
    : "text-red-400";
  const deadlineText = daysUntilBid === null ? ""
    : daysUntilBid > 1 ? `${daysUntilBid} days left`
    : daysUntilBid === 1 ? "1 day left"
    : daysUntilBid === 0 ? "DUE TODAY"
    : "OVERDUE";

  // ============================================================
  // ACTION ITEMS
  // ============================================================
  const actionItems: ActionItem[] = [];

  // Scope
  if (scopeTotal > 0) {
    if (scopePct < 80) {
      actionItems.push({ level: "red", text: `${scopeUnaddressed} scope item${scopeUnaddressed !== 1 ? "s" : ""} not addressed`, tab: "scope" });
    } else if (scopePct < 100) {
      actionItems.push({ level: "yellow", text: `${scopeUnaddressed} scope item${scopeUnaddressed !== 1 ? "s" : ""} remaining`, tab: "scope" });
    } else {
      actionItems.push({ level: "green", text: `All ${scopeTotal} scope items addressed`, tab: "scope" });
    }
  }

  // Addenda — show issues AND completions separately
  if (scopeNotRepriced > 0) {
    actionItems.push({ level: "red", text: `${scopeNotRepriced} addend${scopeNotRepriced > 1 ? "a" : "um"} affects scope — not re-priced`, tab: "addenda" });
  }
  if (addendaNotReviewed > 0) {
    actionItems.push({ level: "yellow", text: `${addendaNotReviewed} addend${addendaNotReviewed > 1 ? "a" : "um"} not yet reviewed`, tab: "addenda" });
  }
  const addendaOk = addendaCount - addendaNotReviewed - scopeNotRepriced;
  if (addendaOk > 0) {
    actionItems.push({ level: "green", text: `${addendaOk} addend${addendaOk > 1 ? "a" : "um"} reviewed & re-priced`, tab: "addenda" });
  }

  // Takeoff
  if (controlSF > 0 && deltaPct !== null) {
    if (deltaPct > 5) {
      actionItems.push({ level: "red", text: `${deltaSF.toLocaleString()} SF unaccounted in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    } else if (deltaPct > 2) {
      actionItems.push({ level: "yellow", text: `${deltaSF.toLocaleString()} SF gap in takeoff (${deltaPct.toFixed(1)}%)`, tab: "takeoff" });
    } else {
      actionItems.push({ level: "green", text: `Takeoff reconciled (${deltaPct.toFixed(1)}% delta)`, tab: "takeoff" });
    }
  }

  // Quotes
  if (expiredQuotes > 0) {
    actionItems.push({ level: "red", text: `${expiredQuotes} quote${expiredQuotes !== 1 ? "s" : ""} expired`, tab: "quotes" });
  }
  if (expiringQuotes > 0) {
    actionItems.push({ level: "yellow", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`, tab: "quotes" });
  }
  if (quoteCount > 0 && expiredQuotes === 0 && expiringQuotes === 0) {
    actionItems.push({ level: "green", text: `All ${quoteCount} quotes received`, tab: "quotes" });
  }

  // RFIs
  if (pendingRFIs > 0) {
    actionItems.push({ level: "yellow", text: `${pendingRFIs} RFI${pendingRFIs !== 1 ? "s" : ""} awaiting response`, tab: "rfis" });
  } else if (rfiCount > 0) {
    actionItems.push({ level: "green", text: `All ${rfiCount} RFIs resolved`, tab: "rfis" });
  }

  // Checklist
  if (checklistPct < 50) {
    actionItems.push({ level: "red", text: `Checklist only ${checklistPct}% complete`, tab: "checklist" });
  } else if (checklistPct < 80) {
    actionItems.push({ level: "yellow", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  } else if (checklistPct < 100) {
    actionItems.push({ level: "green", text: `Checklist ${checklistPct}% complete`, tab: "checklist" });
  } else if (totalItems > 0) {
    actionItems.push({ level: "green", text: "Checklist complete", tab: "checklist" });
  }
  if (rfiItems > 0) {
    actionItems.push({ level: "yellow", text: `${rfiItems} checklist item${rfiItems !== 1 ? "s" : ""} flagged as RFI`, tab: "checklist" });
  }

  // Materials
  if (matItemCount === 0) {
    actionItems.push({ level: "yellow", text: "Materials not yet calculated", tab: "materials" });
  } else if (matUnpriced > 0) {
    actionItems.push({ level: "yellow", text: `${matUnpriced} material${matUnpriced !== 1 ? "s" : ""} missing pricing`, tab: "materials" });
  } else {
    actionItems.push({ level: "green", text: `Materials calculated ($${matTotalCost.toLocaleString()})`, tab: "materials" });
  }

  // Pricing
  if (pricingComplete) {
    actionItems.push({ level: "green", text: `Pricing entered ($${bidAmt?.toLocaleString()})`, tab: "pricing" });
  } else if (bidAmt && bidAmt > 0) {
    actionItems.push({ level: "yellow", text: "Pricing incomplete — missing cost breakdown", tab: "pricing" });
  }

  // Sort: red → yellow → green
  const levelOrder = { red: 0, yellow: 1, green: 2 };
  actionItems.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  const redYellowItems = actionItems.filter(i => i.level !== "green");
  const greenItems = actionItems.filter(i => i.level === "green");
  const collapseGreen = greenItems.length >= 3;

  const levelStyles = {
    red: { bg: "bg-red-500/10", border: "border-l-red-500", dot: "bg-red-500", text: "text-slate-200" },
    yellow: { bg: "bg-amber-500/10", border: "border-l-amber-500", dot: "bg-amber-500", text: "text-slate-200" },
    green: { bg: "bg-emerald-500/5", border: "border-l-emerald-500", dot: "bg-emerald-500", text: "text-slate-400" },
  };

  const tabLabels: Record<string, string> = {
    scope: "Scope", addenda: "Addenda", takeoff: "Takeoff", quotes: "Quotes",
    rfis: "RFIs", checklist: "Checklist", materials: "Materials", pricing: "Pricing",
    validator: "Validator", overview: "Overview", labor: "Labor",
  };

  // ============================================================
  // PROJECT INFO — compact summary
  // ============================================================
  const projectInfoParts: string[] = [];
  if (project?.name) projectInfoParts.push(project.name);
  if (project?.location) projectInfoParts.push(project.location);
  if (project?.gc) projectInfoParts.push(project.gc);
  const projectLine1 = projectInfoParts.join("  \u2022  ");

  const detailParts: string[] = [];
  if (project?.assemblies?.length > 0) detailParts.push(project.assemblies.join(", "));
  if (project?.deckType) detailParts.push(`${project.deckType} deck`);
  if (project?.bidDate) detailParts.push(`Bid: ${project.bidDate}`);
  const projectLine2 = detailParts.join("  \u2022  ");

  return (
    <div className="flex flex-col gap-6">
      {/* ── SECTION 1: Bid Readiness Score ── */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Bid Readiness</h3>
          {daysUntilBid !== null && (
            <div className="text-right">
              <div className={`text-lg font-bold ${deadlineColor} ${daysUntilBid <= 2 ? "font-extrabold" : ""}`}>
                {deadlineText}
              </div>
              <div className="text-[11px] text-slate-500">until bid &bull; {project?.bidDate}</div>
            </div>
          )}
        </div>

        <div className="flex items-end gap-4 mb-4">
          <span className={`text-5xl font-bold tabular-nums ${scoreColor}`}>{readinessScore}%</span>
          <span className="text-sm text-slate-400 pb-2">{scoreLabel}</span>
        </div>

        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${readinessScore}%` }}
          />
        </div>

        {(bidAmt || grossArea) && (
          <div className="text-sm text-slate-400">
            {bidAmt ? `$${bidAmt.toLocaleString()} bid` : ""}
            {bidAmt && dpsf ? "  \u2022  " : ""}
            {dpsf ? `$${dpsf.toFixed(2)}/SF` : ""}
            {(bidAmt || dpsf) && grossArea ? "  \u2022  " : ""}
            {grossArea ? `${grossArea.toLocaleString()} SF` : ""}
          </div>
        )}
      </div>

      {/* ── SECTION 2: Action Items ── */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          Action Items ({redYellowItems.length})
        </h3>

        {actionItems.length === 0 ? (
          <div className="text-sm text-emerald-400 py-4 text-center">All clear — bid is ready to submit</div>
        ) : (
          <div className="space-y-2">
            {/* Red + Yellow items (always visible) */}
            {redYellowItems.map((item, i) => {
              const style = levelStyles[item.level];
              return (
                <button
                  key={`${item.tab}-${i}`}
                  onClick={() => onNavigateTab?.(item.tab)}
                  className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-lg border-l-4 ${style.border} ${style.bg} hover:bg-slate-700/50 transition-colors group`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                    <span className={`text-sm ${style.text}`}>{item.text}</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-300 flex-shrink-0 ml-4">
                    Open {tabLabels[item.tab]} &rarr;
                  </span>
                </button>
              );
            })}

            {/* Green items (collapsible if 3+) */}
            {greenItems.length > 0 && (
              <>
                {collapseGreen && !showCompleted ? (
                  <button
                    onClick={() => setShowCompleted(true)}
                    className="text-xs text-slate-500 hover:text-slate-300 py-2 px-4 transition-colors"
                  >
                    Show {greenItems.length} completed items &darr;
                  </button>
                ) : (
                  <>
                    {collapseGreen && (
                      <button
                        onClick={() => setShowCompleted(false)}
                        className="text-xs text-slate-500 hover:text-slate-300 py-2 px-4 transition-colors"
                      >
                        Hide completed items &uarr;
                      </button>
                    )}
                    {greenItems.map((item, i) => {
                      const style = levelStyles.green;
                      return (
                        <button
                          key={`green-${item.tab}-${i}`}
                          onClick={() => onNavigateTab?.(item.tab)}
                          className={`flex items-center justify-between w-full text-left px-4 py-2.5 rounded-lg border-l-4 ${style.border} ${style.bg} hover:bg-slate-700/30 transition-colors group opacity-75`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                            <span className="text-xs text-slate-400">{item.text}</span>
                          </div>
                          <span className="text-[10px] text-slate-600 group-hover:text-slate-400 flex-shrink-0 ml-4">
                            Open {tabLabels[item.tab]} &rarr;
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION 3: Project Info ── */}
      <div className="bg-slate-800/50 rounded-xl px-6 py-4 border border-slate-700/50">
        {projectLine1 && <div className="text-sm text-slate-300">{projectLine1}</div>}
        {projectLine2 && <div className="text-sm text-slate-400 mt-1">{projectLine2}</div>}
        {project?.notes && <div className="text-sm text-slate-500 mt-1">{project.notes}</div>}
      </div>
    </div>
  );
}
