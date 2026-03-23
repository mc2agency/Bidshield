"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";

function ExportContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const [printed, setPrinted] = useState(false);
  const [reviewerName, setReviewerName] = useState("");

  const { isLoaded, isSignedIn, userId } = useAuth();
  const subscription = useQuery(
    api.users.getUserSubscription,
    isLoaded && isSignedIn && userId ? { clerkId: userId } : "skip"
  );
  const isPro = isDemo || (subscription?.isPro ?? false);
  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");
  const projectData = useQuery(api.bidshield.getProject, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const checklist = useQuery(api.bidshield.getChecklist, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const scopeItems = useQuery(api.bidshield.getScopeItems, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const quotes = useQuery(api.bidshield.getQuotes, !isDemo && isValidConvexId && userId ? { userId, projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const rfis = useQuery(api.bidshield.getRFIs, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const addenda = useQuery(api.bidshield.getAddenda, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");

  // Gate: require auth and Pro subscription (demo mode bypasses)
  if (!isDemo) {
    if (!isLoaded || subscription === undefined) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-slate-400 text-sm">Loading...</div>
        </div>
      );
    }
    if (!isSignedIn) {
      return null; // middleware handles redirect
    }
    if (!isPro) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md px-4">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">PDF Export is a Pro feature</h2>
            <p className="text-slate-500 text-sm mb-6">
              Upgrade to Pro to export bid packages as PDF. 14-day free trial — no card required.
            </p>
            <a
              href="/bidshield/pricing"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      );
    }
  }

  // Demo data
  const project = isDemo ? {
    name: "Meridian Business Park — Bldg C", location: "Charlotte, NC", bidDate: "2026-03-07",
    gc: "Skanska USA", sqft: 68000, grossRoofArea: 68000, totalBidAmount: 2400000,
    systemType: "tpo", deckType: "steel", trade: "roofing",
    assemblies: ["TPO 60mil", "Tapered ISO"],
    materialCost: 425000, laborCost: 340000,
    notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
  } : projectData;

  const demoChecklist = useMemo(() => {
    const template = getChecklistForTrade("roofing", "tpo", "steel");
    const items: any[] = [];
    const doneIds = ["p1-1","p1-2","p1-3","p2-1","p2-2","p2-3","p3-1","p3-2","p3-3","p4-1","p4-2","p5-1","p5-2","p6-1","p6-2","p6-3","p9-1","p9-2","p9-3"];
    const rfiIds = ["p3-4","p5-3"];
    for (const [phaseKey, phase] of Object.entries(template)) {
      for (const item of (phase as any).items) {
        let status = "pending";
        if (doneIds.includes(item.id)) status = "done";
        if (rfiIds.includes(item.id)) status = "rfi";
        items.push({ phaseKey, itemId: item.id, status, notes: item.id === "p3-4" ? "Waiting on structural drawings from GC" : "" });
      }
    }
    return items;
  }, []);

  const demoScope = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    category: ["Demolition & Removal","Site Access & Logistics","Roofing System","Insulation & Vapor Barrier","Sheet Metal & Flashing","Penetrations & Equipment","Warranty & Closeout","General Conditions"][Math.floor(i / 5)] || "General Conditions",
    item: `Scope item ${i + 1}`,
    status: i < 27 ? "included" : i < 40 ? "excluded" : i < 39 ? "by_others" : "unaddressed",
    cost: i < 27 ? Math.floor((i + 1) * 1500) + 1000 : undefined,
    notes: i < 27 ? "" : "Excluded per addendum #2",
  })), []);

  const checklistData: any[] = isDemo ? demoChecklist : (checklist ?? []);
  const scopeData: any[] = isDemo ? demoScope : (scopeItems ?? []);
  const quoteList: any[] = isDemo ? [] : (quotes ?? []);
  const rfiList: any[] = isDemo ? [] : (rfis ?? []);
  const addendaList: any[] = isDemo ? [] : (addenda ?? []);

  // Build checklist template map for item labels
  const checklistTemplate = useMemo(() => {
    if (!project) return {};
    const trade = (project as any).trade || "roofing";
    const sysType = (project as any).systemType;
    const deckType = (project as any).deckType;
    const fmGlobal = (project as any).fmGlobal;
    const pre1990 = (project as any).pre1990;
    const energyCode = (project as any).energyCode;
    const climateZone = (project as any).climateZone;
    return getChecklistForTrade(trade, sysType, deckType, fmGlobal, pre1990, energyCode);
  }, [project]);

  // Stats
  const totalChecklist = checklistData.length;
  const doneChecklist = checklistData.filter((i: any) => i.status === "done" || i.status === "na").length;
  const checklistPct = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  const includedScope = scopeData.filter((s: any) => s.status === "included");
  const excludedScope = scopeData.filter((s: any) => s.status === "excluded");
  const byOthersScope = scopeData.filter((s: any) => s.status === "by_others");
  const unaddressedScope = scopeData.filter((s: any) => s.status === "unaddressed");

  const bidAmt = (project as any)?.totalBidAmount;
  const grossArea = (project as any)?.grossRoofArea || (project as any)?.sqft;
  const dpsf = bidAmt && grossArea ? (bidAmt / grossArea).toFixed(2) : null;

  // Readiness score (mirrors page.tsx logic)
  const readinessScore = useMemo(() => {
    const sc = scopeData;
    const scTotal = sc.length;
    const scUnaddressed = sc.filter((s: any) => s.status === "unaddressed").length;
    const scPct = scTotal > 0 ? Math.round(((scTotal - scUnaddressed) / scTotal) * 100) : 100;

    const expired = quoteList.filter((q: any) => q.expirationDate && new Date(q.expirationDate) < new Date()).length;
    const expiring = quoteList.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;
    const adNotReviewed = addendaList.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
    const adNotRepriced = addendaList.filter((a: any) => a.affectsScope === true && !a.repriced).length;
    const rPending = rfiList.filter((r: any) => r.status === "sent" || r.status === "draft").length;
    const matCost = (project as any)?.materialCost;
    const labCost = (project as any)?.laborCost;
    const pricingDone = !!(bidAmt && bidAmt > 0 && matCost && labCost);

    const scores = {
      checklist: isDemo ? 68 : checklistPct,
      scope: isDemo ? 85 : scPct,
      pricing: isDemo ? 100 : (pricingDone ? 100 : (bidAmt ? 50 : 0)),
      quotes: quoteList.length > 0 ? (expired === 0 ? (expiring === 0 ? 100 : 70) : 40) : 50,
      addenda: addendaList.length > 0 ? (adNotRepriced === 0 && adNotReviewed === 0 ? 100 : 40) : 100,
      rfis: rfiList.length > 0 ? (rPending === 0 ? 100 : 60) : 100,
    };
    const w = { checklist: 0.30, scope: 0.25, pricing: 0.20, quotes: 0.10, addenda: 0.10, rfis: 0.05 };
    return Math.round(Object.entries(w).reduce((s, [k, v]) => s + (scores[k as keyof typeof scores] ?? 0) * v, 0));
  }, [isDemo, scopeData, quoteList, addendaList, rfiList, project, checklistPct, bidAmt]);

  // Merge checklist data with template for labels
  const checklistWithLabels = useMemo(() => {
    const map: Record<string, { phaseName: string; items: { id: string; label: string; status: string; notes: string }[] }> = {};
    for (const [phaseKey, phase] of Object.entries(checklistTemplate)) {
      const p = phase as any;
      map[phaseKey] = { phaseName: p.title, items: [] };
      for (const item of p.items) {
        const record = checklistData.find((c: any) => c.phaseKey === phaseKey && c.itemId === item.id);
        if (record) {
          map[phaseKey].items.push({ id: item.id, label: item.text, status: record.status, notes: record.notes ?? "" });
        }
      }
    }
    return map;
  }, [checklistTemplate, checklistData]);

  // Auto-trigger print dialog
  useEffect(() => {
    if (project && !printed) {
      setPrinted(true);
      // Don't auto-print — let user set reviewer name first
    }
  }, [project, printed]);

  if (!project) {
    return <div className="p-12 text-center text-slate-500">Loading bid summary...</div>;
  }

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const scoreColor = readinessScore >= 80 ? "#059669" : readinessScore >= 60 ? "#d97706" : "#dc2626";
  const scoreBg = readinessScore >= 80 ? "#ecfdf5" : readinessScore >= 60 ? "#fffbeb" : "#fef2f2";
  const scoreBorder = readinessScore >= 80 ? "#a7f3d0" : readinessScore >= 60 ? "#fde68a" : "#fecaca";
  const scoreLabel = readinessScore >= 80 ? "Ready to Submit" : readinessScore >= 60 ? "Nearly Ready" : "Needs Attention";

  return (
    <div className="max-w-[800px] mx-auto bg-white">
      {/* Screen controls (hidden in print) */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Reviewed by:</label>
          <input
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            placeholder="Your name"
            className="text-sm text-slate-700 border-none outline-none w-36"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-emerald-700"
        >
          📄 Save as PDF
        </button>
        <button onClick={() => window.history.back()} className="px-4 py-2.5 bg-white text-slate-600 rounded-lg text-sm font-medium shadow-lg border hover:bg-slate-50">
          ← Back
        </button>
      </div>

      <div className="p-12 print:p-8">

        {/* ── HEADER ── */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-emerald-600">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">BID REVIEW SUMMARY</div>
            <h1 className="text-2xl font-bold text-slate-900">{(project as any).name}</h1>
            <div className="text-sm text-slate-500 mt-1">{(project as any).location}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">🛡️ BidShield</div>
            <div className="text-xs text-slate-400 mt-1">Generated {today}</div>
          </div>
        </div>

        {/* ── PROJECT INFO GRID ── */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-8 p-6 bg-slate-50 rounded-xl">
          {(project as any).gc && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Contractor</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{(project as any).gc}</div>
            </div>
          )}
          {(project as any).bidDate && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bid Date</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{(project as any).bidDate}</div>
            </div>
          )}
          {grossArea && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roof Area</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{grossArea.toLocaleString()} SF</div>
            </div>
          )}
          {(project as any).systemType && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Type</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{((project as any).systemType as string).toUpperCase()}</div>
            </div>
          )}
          {(project as any).materialCost && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material Cost</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">${(project as any).materialCost.toLocaleString()}</div>
            </div>
          )}
          {(project as any).laborCost && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Labor Cost</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">${(project as any).laborCost.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* ── BID READINESS SCORE ── */}
        <div className="mb-8 rounded-xl overflow-hidden" style={{ border: `2px solid ${scoreBorder}`, background: scoreBg }}>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: scoreColor }}>Bid Readiness Score</div>
                <div className="text-sm text-slate-500 mt-0.5">{scoreLabel}</div>
              </div>
              <div className="text-5xl font-black" style={{ color: scoreColor }}>
                {readinessScore}
                <span className="text-xl font-normal text-slate-400">/100</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${readinessScore}%`, background: scoreColor }}
              />
            </div>
            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Checklist</div>
                <div className="text-sm font-bold text-slate-700">{checklistPct}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Scope</div>
                <div className="text-sm font-bold text-slate-700">
                  {scopeData.length > 0 ? Math.round(((scopeData.length - unaddressedScope.length) / scopeData.length) * 100) : 100}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Pricing</div>
                <div className="text-sm font-bold text-slate-700">
                  {bidAmt && (project as any)?.materialCost && (project as any)?.laborCost ? "Complete" : bidAmt ? "Partial" : "Missing"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BID AMOUNT ── */}
        {bidAmt && (
          <div className="mb-8 flex gap-6 p-5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex-1 text-center">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Bid Amount</div>
              <div className="text-3xl font-black text-emerald-700 mt-1">${bidAmt.toLocaleString()}</div>
            </div>
            {dpsf && (
              <div className="flex-1 text-center border-l border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Price per SF</div>
                <div className="text-3xl font-black text-emerald-700 mt-1">${dpsf}<span className="text-sm font-normal">/SF</span></div>
              </div>
            )}
          </div>
        )}

        {/* ── SCOPE SUMMARY ── */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
            Scope of Work Summary
          </h2>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-black text-emerald-700">{includedScope.length}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Included</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-black text-red-600">{excludedScope.length}</div>
              <div className="text-[10px] font-bold text-red-400 uppercase mt-1">Excluded</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-black text-blue-600">{byOthersScope.length}</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase mt-1">By Others</div>
            </div>
            <div className="text-center p-3 rounded-lg border" style={{ background: unaddressedScope.length > 0 ? "#fffbeb" : "#f8fafc", borderColor: unaddressedScope.length > 0 ? "#fde68a" : "#e2e8f0" }}>
              <div className="text-2xl font-black" style={{ color: unaddressedScope.length > 0 ? "#d97706" : "#94a3b8" }}>{unaddressedScope.length}</div>
              <div className="text-[10px] font-bold uppercase mt-1" style={{ color: unaddressedScope.length > 0 ? "#d97706" : "#94a3b8" }}>Unaddressed</div>
            </div>
          </div>

          {includedScope.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">✓ Included in This Bid</div>
              <table className="w-full text-xs">
                <tbody>
                  {includedScope.map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="py-1.5 px-2 text-slate-700">{item.item || item.name}</td>
                      {item.cost && <td className="py-1.5 px-2 text-right text-slate-500 w-24">${item.cost.toLocaleString()}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {excludedScope.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">✗ Excluded from This Bid</div>
              <table className="w-full text-xs">
                <tbody>
                  {excludedScope.map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="py-1.5 px-2 text-slate-700">{item.item || item.name}</td>
                      {item.notes && <td className="py-1.5 px-2 text-right text-slate-400 italic">{item.notes}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {byOthersScope.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">● By Others</div>
              <div className="flex flex-wrap gap-2">
                {byOthersScope.map((item: any, i: number) => (
                  <span key={i} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-1">{item.item || item.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CHECKLIST REVIEW ── */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
            Checklist Review — {doneChecklist} of {totalChecklist} Complete ({checklistPct}%)
          </h2>

          {/* Completed items */}
          {Object.entries(checklistWithLabels).map(([phaseKey, phase]) => {
            const doneItems = phase.items.filter(i => i.status === "done" || i.status === "na");
            if (doneItems.length === 0) return null;
            return (
              <div key={`done-${phaseKey}`} className="mb-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{phase.phaseName}</div>
                <div className="pl-3 border-l-2 border-emerald-200">
                  {doneItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="text-emerald-600 text-xs font-bold mt-0.5 shrink-0">✓</span>
                      <span className="text-xs text-slate-700">{item.label}</span>
                      {item.status === "na" && <span className="text-[10px] text-slate-400 italic ml-1">N/A</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Flagged / RFI items */}
          {(() => {
            const flaggedPhases = Object.entries(checklistWithLabels)
              .map(([phaseKey, phase]) => ({
                ...phase,
                phaseKey,
                flagged: phase.items.filter(i => i.status === "rfi" || i.status === "warning"),
              }))
              .filter(p => p.flagged.length > 0);

            if (flaggedPhases.length === 0) return null;
            return (
              <div className="mt-5">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">⚑ Flagged &amp; Open RFIs</div>
                {flaggedPhases.map(phase => (
                  <div key={phase.phaseKey} className="mb-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{phase.phaseName}</div>
                    <div className="pl-3 border-l-2 border-amber-300">
                      {phase.flagged.map((item, i) => (
                        <div key={i} className="py-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-500 text-xs font-bold mt-0.5 shrink-0">
                              {item.status === "rfi" ? "?" : "⚑"}
                            </span>
                            <div>
                              <div className="text-xs font-medium text-slate-800">{item.label}</div>
                              {item.notes && (
                                <div className="text-[11px] text-amber-700 mt-0.5 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                  {item.status === "rfi" ? "RFI: " : "Note: "}{item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Pending items warning */}
          {(() => {
            const pendingCount = checklistData.filter((i: any) => i.status === "pending").length;
            if (pendingCount === 0) return null;
            return (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{pendingCount} checklist items</span> remain incomplete and are not shown above.
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── PROJECT NOTES ── */}
        {(project as any).notes && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
              Project Notes
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{(project as any).notes}</p>
          </div>
        )}

        {/* ── REVIEWER SIGN-OFF ── */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reviewed By</div>
              <div className="text-sm font-semibold text-slate-900 min-w-[200px]">
                {/* Screen: live input value; Print: show typed name or blank line */}
                <span className="print:hidden">{reviewerName || <span className="text-slate-300 italic">Enter name above</span>}</span>
                <span className="hidden print:inline">{reviewerName || "_______________________"}</span>
              </div>
              <div className="h-px bg-slate-300 mt-1 w-48" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Reviewed</div>
              <div className="text-sm font-semibold text-slate-900">{today}</div>
              <div className="h-px bg-slate-300 mt-1 w-36" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bid Readiness</div>
              <div className="text-sm font-bold" style={{ color: scoreColor }}>{readinessScore}/100 — {scoreLabel}</div>
              <div className="h-px bg-slate-300 mt-1 w-36" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
          <span>BidShield • mc2estimating.com</span>
          <span>Confidential — {(project as any).name} — {today}</span>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, footer, .print\\:hidden { display: none !important; }
          @page { margin: 0.5in; size: letter; }
        }
      `}</style>
    </div>
  );
}

export default function BidExportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <ExportContent />
    </Suspense>
  );
}
