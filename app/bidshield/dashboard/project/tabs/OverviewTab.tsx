"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps, TabId } from "../tab-types";

type HealthStatus = "green" | "amber" | "red" | "gray";

function healthColor(status: HealthStatus) {
  return {
    green: { border: "border-l-emerald-500", dot: "bg-emerald-500", text: "text-emerald-400" },
    amber: { border: "border-l-amber-500", dot: "bg-amber-500", text: "text-amber-400" },
    red: { border: "border-l-red-500", dot: "bg-red-500", text: "text-red-400" },
    gray: { border: "border-l-slate-600", dot: "bg-slate-600", text: "text-slate-500" },
  }[status];
}

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
  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const takeoffLineItems = useQuery(
    api.bidshield.getTakeoffLineItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // --- Checklist stats ---
  const checklistItems = isDemo ? [] : (checklist ?? []);
  const totalItems = isDemo ? 95 : checklistItems.length;
  const doneItems = isDemo ? 65 : checklistItems.filter((i: any) => i.status === "done" || i.status === "na").length;
  const rfiItems = isDemo ? 4 : checklistItems.filter((i: any) => i.status === "rfi").length;
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // --- Quotes stats ---
  const quoteList = isDemo ? [] : (quotes ?? []);
  const quoteCount = isDemo ? 5 : quoteList.length;
  const expiringQuotes = isDemo ? 1 : quoteList.filter((q: any) => {
    if (!q.expiresAt) return false;
    const days = Math.ceil((new Date(q.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 14;
  }).length;
  const expiredQuotes = isDemo ? 0 : quoteList.filter((q: any) => {
    if (!q.expiresAt) return false;
    return new Date(q.expiresAt).getTime() < Date.now();
  }).length;

  // --- RFIs stats ---
  const rfiList = isDemo ? [] : (rfis ?? []);
  const rfiCount = isDemo ? 3 : rfiList.length;
  const openRFIs = isDemo ? 1 : rfiList.filter((r: any) => r.status === "sent" || r.status === "draft").length;

  // --- Addenda stats ---
  const addendaList = isDemo ? [] : (addenda ?? []);
  const addendaCount = isDemo ? 3 : addendaList.length;
  const unincorporated = isDemo ? 1 : addendaList.filter((a: any) => !a.incorporated).length;
  const scopeNotRepriced = isDemo ? 1 : addendaList.filter((a: any) => a.affectsScope && !a.incorporated).length;

  // --- Takeoff stats ---
  const demoSections = [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }];
  const sections = isDemo ? demoSections : (takeoffSections ?? []);
  const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const controlSF = isDemo ? 45000 : project?.grossRoofArea ?? 0;
  const reconPct = controlSF > 0 ? Math.min(100, Math.round((takenOff / controlSF) * 100)) : null;
  const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
  const deltaPct = controlSF > 0 ? ((controlSF - takenOff) / controlSF) * 100 : null;

  const lineItems = isDemo ? [] : (takeoffLineItems ?? []);
  const linearItems = lineItems.filter((li: any) => li.itemType === "linear");
  const countItems = lineItems.filter((li: any) => li.itemType === "count");
  const linearVerified = isDemo ? 4 : linearItems.filter((li: any) => li.verified).length;
  const linearTotal = isDemo ? 10 : linearItems.length;
  const countVerified = isDemo ? 3 : countItems.filter((li: any) => li.verified).length;
  const countTotal = isDemo ? 11 : countItems.length;

  // --- Pricing stats ---
  const bidAmt = isDemo ? 850000 : project?.totalBidAmount;
  const matCost = isDemo ? 425000 : project?.materialCost;
  const labCost = isDemo ? 340000 : project?.laborCost;
  const othCost = isDemo ? 85000 : project?.otherCost;
  const grossArea = isDemo ? 45000 : project?.grossRoofArea;
  const dpsf = bidAmt && grossArea && grossArea > 0 ? bidAmt / grossArea : null;

  // --- Phase progress (top issues only) ---
  const trade = project?.trade || "roofing";
  const checklistTemplate = getChecklistForTrade(trade, project?.systemType, project?.deckType);
  const phaseProgress = Object.entries(checklistTemplate).map(([phaseKey, phase]) => {
    const items = checklistItems.filter((i: any) => i.phaseKey === phaseKey);
    const done = items.filter((i: any) => i.status === "done" || i.status === "na").length;
    const total = phase.items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { phaseKey, title: phase.title.replace(/^Phase \d+: /, ""), icon: phase.icon, pct, critical: phase.critical };
  });
  const demoPhases = Object.entries(checklistTemplate).map(([k, p]) => ({
    phaseKey: k, title: p.title.replace(/^Phase \d+: /, ""), icon: p.icon, pct: Math.floor(Math.random() * 60 + 40), critical: p.critical,
  }));
  const phases = isDemo ? demoPhases : phaseProgress;
  const topIssues = [...phases].sort((a, b) => a.pct - b.pct).slice(0, 4);

  // --- Health status logic ---
  const takeoffHealth: HealthStatus = reconPct === null ? "gray" : deltaPct !== null && Math.abs(deltaPct) <= 2 ? "green" : deltaPct !== null && Math.abs(deltaPct) <= 5 ? "amber" : "red";
  const pricingHealth: HealthStatus = dpsf === null ? "gray" : dpsf >= 14 && dpsf <= 24 ? "green" : dpsf >= 10 && dpsf <= 30 ? "amber" : "red";
  const quotesHealth: HealthStatus = expiredQuotes > 0 ? "red" : expiringQuotes > 0 ? "amber" : quoteCount > 0 ? "green" : "gray";
  const addendaHealth: HealthStatus = scopeNotRepriced > 0 ? "red" : unincorporated > 0 ? "amber" : addendaCount > 0 ? "green" : "gray";
  const checklistHealth: HealthStatus = checklistPct >= 80 ? "green" : checklistPct >= 50 ? "amber" : checklistPct > 0 ? "red" : "gray";
  const rfiHealth: HealthStatus = openRFIs > 0 ? "amber" : rfiCount > 0 ? "green" : "gray";

  // --- Alerts ---
  const alerts: { color: "red" | "amber"; text: string; tab: TabId }[] = [];
  if (deltaPct !== null && Math.abs(deltaPct) > 2) alerts.push({ color: deltaPct > 5 ? "red" : "amber", text: `${deltaSF.toLocaleString()} SF unaccounted in takeoff`, tab: "takeoff" });
  if (expiredQuotes > 0) alerts.push({ color: "red", text: `${expiredQuotes} quote${expiredQuotes !== 1 ? "s" : ""} expired`, tab: "quotes" });
  if (expiringQuotes > 0) alerts.push({ color: "amber", text: `${expiringQuotes} quote${expiringQuotes !== 1 ? "s" : ""} expiring soon`, tab: "quotes" });
  if (openRFIs > 0) alerts.push({ color: "amber", text: `${openRFIs} RFI${openRFIs !== 1 ? "s" : ""} awaiting response`, tab: "rfis" });
  if (rfiItems > 0) alerts.push({ color: "amber", text: `${rfiItems} checklist item${rfiItems !== 1 ? "s" : ""} flagged as RFI`, tab: "checklist" });
  if (scopeNotRepriced > 0) alerts.push({ color: "red", text: `${scopeNotRepriced} addend${scopeNotRepriced !== 1 ? "a" : "um"} not re-priced`, tab: "addenda" });

  return (
    <div className="flex flex-col gap-5">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button onClick={() => onNavigateTab?.("checklist")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-700/50 transition-colors">
          <div className="text-2xl font-bold text-emerald-400">{checklistPct}%</div>
          <div className="text-[11px] text-slate-400">Checklist</div>
        </button>
        <button onClick={() => onNavigateTab?.("quotes")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-700/50 transition-colors">
          <div className="text-2xl font-bold text-blue-400">{quoteCount}</div>
          <div className="text-[11px] text-slate-400">Quotes</div>
        </button>
        <button onClick={() => onNavigateTab?.("rfis")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-700/50 transition-colors">
          <div className="text-2xl font-bold text-amber-400">{rfiCount}</div>
          <div className="text-[11px] text-slate-400">RFIs</div>
        </button>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-2xl font-bold text-slate-300">{project?.sqft ? `${(project.sqft / 1000).toFixed(0)}k` : "—"}</div>
          <div className="text-[11px] text-slate-400">Sq Ft</div>
        </div>
        <button onClick={() => onNavigateTab?.("pricing")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-700/50 transition-colors">
          <div className="text-2xl font-bold text-emerald-400">{dpsf ? `$${dpsf.toFixed(2)}` : project?.estimatedValue ? `$${(project.estimatedValue / 1000).toFixed(0)}k` : "—"}</div>
          <div className="text-[11px] text-slate-400">{dpsf ? "$/SF" : project?.estimatedValue ? "Value" : "$/SF"}</div>
        </button>
        <button onClick={() => onNavigateTab?.("takeoff")} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center hover:bg-slate-700/50 transition-colors">
          <div className={`text-2xl font-bold ${healthColor(takeoffHealth).text}`}>{reconPct !== null ? `${reconPct}%` : "—"}</div>
          <div className="text-[11px] text-slate-400">{controlSF > 0 ? "Reconciled" : "No Control #"}</div>
        </button>
      </div>

      {/* Project Details + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Project Details</h3>
          <div className="space-y-2 text-sm">
            {project?.gc && <div className="flex justify-between"><span className="text-slate-400">GC:</span><span className="text-slate-200">{project.gc}</span></div>}
            {project?.owner && <div className="flex justify-between"><span className="text-slate-400">Owner:</span><span className="text-slate-200">{project.owner}</span></div>}
            {project?.assemblies?.length > 0 && <div className="flex justify-between"><span className="text-slate-400">Assemblies:</span><span className="text-slate-200 text-right">{project.assemblies.join(", ")}</span></div>}
            {project?.bidDate && <div className="flex justify-between"><span className="text-slate-400">Bid Date:</span><span className="text-slate-200">{project.bidDate}</span></div>}
          </div>
          {project?.notes && <div className="mt-3 p-3 bg-slate-900 rounded-lg text-sm text-slate-300">{project.notes}</div>}
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {([
              { icon: "📋", label: "Open Checklist", tab: "checklist" as TabId },
              { icon: "💰", label: "Manage Quotes", tab: "quotes" as TabId },
              { icon: "📨", label: "View RFIs", tab: "rfis" as TabId },
              { icon: "🛡️", label: "Run Validator", tab: "validator" as TabId },
            ]).map((a) => (
              <button key={a.tab} onClick={() => onNavigateTab?.(a.tab)} className="flex items-center gap-2 p-3 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bid Health Summary */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-4">Bid Health Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {([
            { tab: "takeoff" as TabId, label: "Takeoff", status: takeoffHealth, metric: reconPct !== null ? `${reconPct}% reconciled` : "Not started", detail: deltaSF > 0 && controlSF > 0 ? `${deltaSF.toLocaleString()} SF gap` : undefined },
            { tab: "pricing" as TabId, label: "Pricing", status: pricingHealth, metric: dpsf ? `$${dpsf.toFixed(2)}/SF` : "No pricing", detail: dpsf ? (pricingHealth === "green" ? "In Range" : "Review needed") : undefined },
            { tab: "quotes" as TabId, label: "Quotes", status: quotesHealth, metric: `${quoteCount} quote${quoteCount !== 1 ? "s" : ""}`, detail: expiringQuotes > 0 ? `${expiringQuotes} expiring soon` : expiredQuotes > 0 ? `${expiredQuotes} expired` : undefined },
            { tab: "addenda" as TabId, label: "Addenda", status: addendaHealth, metric: `${addendaCount} received`, detail: scopeNotRepriced > 0 ? `${scopeNotRepriced} not re-priced` : undefined },
            { tab: "checklist" as TabId, label: "Checklist", status: checklistHealth, metric: `${checklistPct}% complete`, detail: undefined },
            { tab: "rfis" as TabId, label: "RFIs", status: rfiHealth, metric: `${rfiCount} total`, detail: openRFIs > 0 ? `${openRFIs} awaiting` : undefined },
            { tab: "validator" as TabId, label: "Validator", status: "gray" as HealthStatus, metric: "Run check", detail: undefined },
          ]).map((card) => {
            const c = healthColor(card.status);
            return (
              <button key={card.tab} onClick={() => onNavigateTab?.(card.tab)} className={`bg-slate-900 rounded-lg p-3 border-l-2 ${c.border} text-left hover:bg-slate-700/50 transition-colors`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-semibold text-slate-300">{card.label}</span>
                </div>
                <div className={`text-xs ${c.text}`}>{card.metric}</div>
                {card.detail && <div className="text-[10px] text-slate-500 mt-0.5">{card.detail}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom grid: Checklist + Pricing | Takeoff + Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Checklist Summary */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">Checklist Summary</h3>
            <button onClick={() => onNavigateTab?.("checklist")} className="text-[11px] text-amber-500 hover:text-amber-400">Open Checklist &rarr;</button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${checklistPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${checklistPct}%` }} />
            </div>
            <span className={`text-sm font-bold ${checklistPct === 100 ? "text-emerald-400" : "text-slate-300"}`}>{checklistPct}%</span>
          </div>
          {topIssues.length > 0 && (
            <>
              <div className="text-[11px] text-slate-500 mb-2">Lowest scoring phases:</div>
              <div className="space-y-1.5">
                {topIssues.map((p) => (
                  <div key={p.phaseKey} className="flex items-center gap-2">
                    <span className="text-xs">{p.icon}</span>
                    <span className="text-xs text-slate-400 flex-1 truncate">{p.title}</span>
                    <span className={`text-xs font-bold ${p.pct < 50 ? "text-red-400" : p.pct < 80 ? "text-amber-400" : "text-emerald-400"}`}>{p.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pricing Snapshot */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">Pricing Snapshot</h3>
            <button onClick={() => onNavigateTab?.("pricing")} className="text-[11px] text-amber-500 hover:text-amber-400">Open Pricing &rarr;</button>
          </div>
          {bidAmt ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Total Bid:</span><span className="text-white font-semibold">${bidAmt.toLocaleString()}</span></div>
              {matCost && <div className="flex justify-between"><span className="text-slate-400">Material:</span><span className="text-slate-300">${matCost.toLocaleString()} ({bidAmt > 0 ? Math.round((matCost / bidAmt) * 100) : 0}%)</span></div>}
              {labCost && <div className="flex justify-between"><span className="text-slate-400">Labor:</span><span className="text-slate-300">${labCost.toLocaleString()} ({bidAmt > 0 ? Math.round((labCost / bidAmt) * 100) : 0}%)</span></div>}
              {othCost && <div className="flex justify-between"><span className="text-slate-400">Other:</span><span className="text-slate-300">${othCost.toLocaleString()} ({bidAmt > 0 ? Math.round((othCost / bidAmt) * 100) : 0}%)</span></div>}
              {dpsf && <div className="flex justify-between pt-2 border-t border-slate-700"><span className="text-slate-400">$/SF:</span><span className="text-emerald-400 font-bold">${dpsf.toFixed(2)}</span></div>}
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center">No pricing entered yet</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Takeoff Snapshot */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">Takeoff Snapshot</h3>
            <button onClick={() => onNavigateTab?.("takeoff")} className="text-[11px] text-amber-500 hover:text-amber-400">Open Takeoff &rarr;</button>
          </div>
          {controlSF > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Control #:</span><span className="text-white">{controlSF.toLocaleString()} SF</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Taken Off:</span><span className="text-slate-300">{takenOff.toLocaleString()} SF</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Delta:</span><span className={healthColor(takeoffHealth).text}>{deltaSF > 0 ? `-${deltaSF.toLocaleString()}` : "0"} SF ({deltaPct !== null ? `${Math.abs(deltaPct).toFixed(1)}%` : "—"})</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-700"><span className="text-slate-400">Linear:</span><span className="text-slate-300">{linearVerified}/{linearTotal} verified</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Counts:</span><span className="text-slate-300">{countVerified}/{countTotal} verified</span></div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center">No control # set</div>
          )}
        </div>

        {/* Alerts & Action Items */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Alerts & Action Items</h3>
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <button key={i} onClick={() => onNavigateTab?.(alert.tab)} className="flex items-center gap-2 w-full text-left text-sm hover:bg-slate-700/50 rounded-lg p-2 -mx-2 transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.color === "red" ? "bg-red-500" : "bg-amber-500"}`} />
                  <span className="text-slate-300">{alert.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-emerald-400 py-4 text-center">All clear — no issues found</div>
          )}
        </div>
      </div>
    </div>
  );
}
