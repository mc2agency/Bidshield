"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { ChecklistPhaseDef } from "@/lib/bidshield/checklist-data";
import { computeBidScore } from "@/lib/bidScore";
import { generateBidSummaryPDF } from "@/lib/generateBidSummaryPDF";
import type { BidSummaryData } from "@/lib/generateBidSummaryPDF";

interface BidProject {
  name: string;
  location?: string;
  bidDate?: string;
  gc?: string;
  sqft?: number;
  grossRoofArea?: number;
  totalBidAmount?: number;
  systemType?: string;
  deckType?: string;
  trade?: string;
  assemblies?: string[];
  materialCost?: number;
  laborCost?: number;
  notes?: string;
  fmGlobal?: boolean;
  pre1990?: boolean;
  energyCode?: boolean;
  climateZone?: string;
}

interface ChecklistItem {
  phaseKey: string;
  itemId: string;
  status: string;
  notes?: string;
}

interface ScopeItem {
  item?: string;
  name?: string;
  status: string;
  cost?: number;
  notes?: string;
  category?: string;
}

interface Quote {
  vendorName?: string;
  category?: string;
  products?: string[];
  quoteAmount?: number;
  expirationDate?: string;
  status?: string;
  notes?: string;
}

interface RFI {
  question?: string;
  status: string;
  sentTo?: string;
  response?: string;
}

interface Addendum {
  affectsScope?: boolean | null;
  repriced?: boolean;
}

interface GCItem {
  category?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitCost?: number;
  total?: number;
  isMarkup?: boolean;
  markupPct?: number;
  notes?: string;
  sortOrder?: number;
}

interface BidQuals {
  laborType?: string;
  plansDated?: string;
  planRevision?: string;
  specSections?: string;
  addendaThrough?: number;
  bidGoodFor?: string;
  insuranceProgram?: string;
  bondRequired?: boolean;
  bondTypes?: string;
  mbeGoals?: boolean;
  mbeGoalPct?: string;
  estimatedDuration?: string;
  earliestStart?: string;
}

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
  const bidQuals = useQuery(api.bidshield.getBidQuals, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const gcItems = useQuery(api.bidshield.getGCItems, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const projectMaterials = useQuery(api.bidshield.getProjectMaterials, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const datasheets = useQuery(api.bidshield.getDatasheets, !isDemo && userId ? { userId } : "skip");
  const laborTasks = useQuery(api.bidshield.getLaborTasks, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const laborAnalysis = useQuery(api.bidshield.getLaborAnalysis, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const gcFormDocuments = useQuery(api.bidshield.getGcBidFormDocuments, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const unconfirmedGcFormCount = useQuery(api.bidshield.getUnconfirmedGcBidFormCount, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");

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
  const project: BidProject | null | undefined = isDemo ? {
    name: "Meridian Business Park — Bldg C", location: "Charlotte, NC", bidDate: "2026-03-07",
    gc: "Skanska USA", sqft: 68000, grossRoofArea: 68000, totalBidAmount: 2400000,
    systemType: "tpo", deckType: "steel", trade: "roofing",
    assemblies: ["TPO 60mil", "Tapered ISO"],
    materialCost: 425000, laborCost: 340000,
    notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
  } : projectData;

  const demoChecklist = useMemo(() => {
    const template = getChecklistForTrade("roofing", "tpo", "steel");
    const items: ChecklistItem[] = [];
    const doneIds = ["p1-1","p1-2","p1-3","p2-1","p2-2","p2-3","p3-1","p3-2","p3-3","p4-1","p4-2","p5-1","p5-2","p6-1","p6-2","p6-3","p9-1","p9-2","p9-3"];
    const rfiIds = ["p3-4","p5-3"];
    for (const [phaseKey, phase] of Object.entries(template) as [string, ChecklistPhaseDef][]) {
      for (const item of phase.items) {
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

  const checklistData: ChecklistItem[] = isDemo ? demoChecklist : (checklist ?? []) as ChecklistItem[];
  const scopeData: ScopeItem[] = isDemo ? demoScope : (scopeItems ?? []) as ScopeItem[];
  const quoteList: Quote[] = isDemo ? [] : (quotes ?? []) as Quote[];
  const rfiList: RFI[] = isDemo ? [] : (rfis ?? []) as RFI[];
  const addendaList: Addendum[] = isDemo ? [] : (addenda ?? []) as Addendum[];
  const gcItemsList: GCItem[] = isDemo ? [] : (gcItems ?? []) as GCItem[];
  const bidQualsData: BidQuals | null = isDemo ? null : (bidQuals ?? null) as BidQuals | null;

  // Build checklist template map for item labels
  const checklistTemplate = useMemo(() => {
    if (!project) return {};
    const trade = project.trade || "roofing";
    const sysType = project.systemType;
    const deckType = project.deckType;
    const fmGlobal = project.fmGlobal;
    const pre1990 = project.pre1990;
    const energyCode = project.energyCode;
    return getChecklistForTrade(trade, sysType, deckType, fmGlobal, pre1990, energyCode);
  }, [project]);

  // Stats
  const totalChecklist = checklistData.length;
  const doneChecklist = checklistData.filter((i) => i.status === "done" || i.status === "na").length;
  const checklistPct = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  const includedScope = scopeData.filter((s) => s.status === "included");
  const excludedScope = scopeData.filter((s) => s.status === "excluded");
  const byOthersScope = scopeData.filter((s) => s.status === "by_others");
  const unaddressedScope = scopeData.filter((s) => s.status === "unaddressed");

  const bidAmt = project?.totalBidAmount;
  const grossArea = project?.grossRoofArea || project?.sqft;
  const dpsf = bidAmt && grossArea ? (bidAmt / grossArea).toFixed(2) : null;

  // Readiness score — uses shared computeBidScore for identical results with ValidatorTab
  const readinessScore = useMemo(() => {
    if (!project) return 0;
    return computeBidScore({
      isDemo,
      project,
      checklist: checklistData,
      scopeItems: scopeData,
      quotes: quoteList,
      rfis: rfiList,
      addenda: addendaList,
      bidQuals: isDemo ? null : bidQuals,
      gcItems: isDemo ? null : gcItems,
      projectMaterials: isDemo ? null : projectMaterials,
      datasheets: isDemo ? null : datasheets,
      laborTasks: isDemo ? null : laborTasks,
      laborAnalysis: isDemo ? null : laborAnalysis,
      gcFormDocuments: isDemo ? null : gcFormDocuments,
      unconfirmedGcFormCount: isDemo ? null : unconfirmedGcFormCount,
    }).score;
  }, [isDemo, project, checklistData, scopeData, quoteList, rfiList, addendaList, bidQuals, gcItems, projectMaterials, datasheets, laborTasks, laborAnalysis, gcFormDocuments, unconfirmedGcFormCount]);

  // Merge checklist data with template for labels
  const checklistWithLabels = useMemo(() => {
    const map: Record<string, { phaseName: string; items: { id: string; label: string; status: string; notes: string }[] }> = {};
    for (const [phaseKey, phase] of Object.entries(checklistTemplate) as [string, ChecklistPhaseDef][]) {
      map[phaseKey] = { phaseName: phase.title, items: [] };
      for (const item of phase.items) {
        const record = checklistData.find((c) => c.phaseKey === phaseKey && c.itemId === item.id);
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

  const [pdfGenerating, setPdfGenerating] = useState(false);

  // L-5: Build BidSummaryData and trigger jsPDF download (proper PDF, not browser print)
  const handleDownloadPDF = useCallback(async () => {
    if (!project) return;
    setPdfGenerating(true);
    try {
      const matCost = (projectMaterials ?? []).reduce((s: number, m: any) => s + (m.totalCost ?? 0), 0) || (project as any).materialCost || 0;
      const laborCost = laborAnalysis ? (laborAnalysis as any).totalLaborCost ?? 0 : (project as any).laborCost || 0;
      const gcLineItems = gcItems ?? [];
      const gcLineTotal = gcLineItems.reduce((s: number, g: any) => s + (!g.isMarkup ? (g.total ?? 0) : 0), 0);
      const overheadItem = gcLineItems.find((g: any) => g.isMarkup && (g.description ?? "").toLowerCase().includes("overhead"));
      const profitItem = gcLineItems.find((g: any) => g.isMarkup && (g.description ?? "").toLowerCase().includes("profit"));
      const otherMarkups = gcLineItems.filter((g: any) => g.isMarkup && g !== overheadItem && g !== profitItem);
      const subtotal = matCost + laborCost + gcLineTotal;
      const area = (project as any).grossRoofArea || (project as any).sqft || 0;
      const totalBid = (project as any).totalBidAmount || subtotal;
      const scopeInc = scopeData.filter(s => s.status === "included").length;
      const scopeExc = scopeData.filter(s => s.status === "excluded").length;
      const scopeOth = scopeData.filter(s => s.status === "by_others").length;
      const exclusions = scopeData.filter(s => s.status === "excluded").map(s => (s as any).item || (s as any).name || "Unknown").slice(0, 10);

      const bidScore = computeBidScore({
        isDemo,
        project,
        checklist: checklistData,
        scopeItems: scopeData,
        quotes: quoteList,
        rfis: rfiList,
        addenda: addendaList,
        bidQuals: isDemo ? null : bidQuals,
        gcItems: isDemo ? null : gcItems,
        projectMaterials: isDemo ? null : projectMaterials,
        datasheets: isDemo ? null : datasheets,
        laborTasks: isDemo ? null : laborTasks,
        laborAnalysis: isDemo ? null : laborAnalysis,
        gcFormDocuments: isDemo ? null : gcFormDocuments,
        unconfirmedGcFormCount: isDemo ? null : unconfirmedGcFormCount,
      });

      const passCount = bidScore.items.filter(i => i.status === "pass").length;
      const warnCount = bidScore.items.filter(i => i.status === "warn").length;
      const failCount = bidScore.items.filter(i => i.status === "fail").length;
      const warnings = bidScore.items.filter(i => i.status === "warn").map(i => ({ label: i.label, message: i.message }));
      const failures = bidScore.items.filter(i => i.status === "fail").map(i => ({ label: i.label, message: i.message }));

      const summaryData: BidSummaryData = {
        project: {
          name: project.name,
          location: project.location,
          gc: (project as any).gc,
          bidDate: project.bidDate,
        },
        financials: {
          sumMaterial: matCost || null,
          sumLabor: laborCost || null,
          sumGCLine: gcLineTotal || null,
          sumSubtotal: subtotal || null,
          sumTotalBid: totalBid || null,
          sumSqft: area || null,
          sumDpSF: area && totalBid ? totalBid / area : null,
          overheadPct: overheadItem ? (overheadItem as any).markupPct ?? null : null,
          overheadAmt: overheadItem ? (overheadItem as any).total ?? null : null,
          profitPct: profitItem ? (profitItem as any).markupPct ?? null : null,
          profitAmt: profitItem ? (profitItem as any).total ?? null : null,
          otherMarkupAmt: otherMarkups.reduce((s: number, m: any) => s + (m.total ?? 0), 0) || null,
        },
        validator: {
          score: bidScore.score,
          passCount,
          warnCount,
          failCount,
          isReady: bidScore.score >= 80,
          allPass: failCount === 0 && warnCount === 0,
          warnings,
          failures,
        },
        scope: {
          includedCount: scopeInc,
          excludedCount: scopeExc,
          byOthersCount: scopeOth,
          exclusions,
        },
        addendaCount: addendaList.length,
        roofSystem: (project as any).systemType?.toUpperCase() ?? null,
        laborLabel: laborAnalysis ? `${((laborAnalysis as any).totalCrewDays ?? 0).toFixed(1)} crew-days` : null,
      };

      await generateBidSummaryPDF(summaryData);
    } catch (err) {
      console.error("[export] PDF generation failed:", err);
    } finally {
      setPdfGenerating(false);
    }
  }, [project, projectMaterials, laborAnalysis, gcItems, scopeData, checklistData, quoteList, rfiList, addendaList, bidQuals, datasheets, laborTasks, gcFormDocuments, unconfirmedGcFormCount, isDemo, readinessScore]);

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
          onClick={handleDownloadPDF}
          disabled={pdfGenerating}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-emerald-700 disabled:opacity-60"
        >
          {pdfGenerating ? "Generating..." : "Download PDF"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white text-slate-600 rounded-lg text-sm font-medium shadow-lg border hover:bg-slate-50"
        >
          Print
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
            <h1 className="text-2xl font-bold text-slate-900">{project?.name}</h1>
            <div className="text-sm text-slate-500 mt-1">{project?.location}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">🛡️ BidShield</div>
            <div className="text-xs text-slate-400 mt-1">Generated {today}</div>
          </div>
        </div>

        {/* ── PROJECT INFO GRID ── */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-8 p-6 bg-slate-50 rounded-xl">
          {project?.gc && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Contractor</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{project?.gc}</div>
            </div>
          )}
          {project?.bidDate && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bid Date</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{project?.bidDate}</div>
            </div>
          )}
          {grossArea && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roof Area</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{grossArea.toLocaleString()} SF</div>
            </div>
          )}
          {project?.systemType && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Type</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{project?.systemType?.toUpperCase()}</div>
            </div>
          )}
          {project?.materialCost && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material Cost</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">${project?.materialCost.toLocaleString()}</div>
            </div>
          )}
          {project?.laborCost && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Labor Cost</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">${project?.laborCost.toLocaleString()}</div>
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
                  {bidAmt && project?.materialCost && project?.laborCost ? "Complete" : bidAmt ? "Partial" : "Missing"}
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
                  {includedScope.map((item, i) => (
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
                  {excludedScope.map((item, i) => (
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
                {byOthersScope.map((item, i) => (
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
            const pendingCount = checklistData.filter((i) => i.status === "pending").length;
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

        {/* ── QUOTES ── */}
        {quoteList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
              Vendor Quotes ({quoteList.length})
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Products</th>
                  <th className="py-1.5 px-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expires</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {quoteList.map((q, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-1.5 px-2 font-medium text-slate-800">{q.vendorName ?? "—"}</td>
                    <td className="py-1.5 px-2 text-slate-500 capitalize">{q.category ?? "—"}</td>
                    <td className="py-1.5 px-2 text-slate-600">{(q.products ?? []).join(", ") || "—"}</td>
                    <td className="py-1.5 px-2 text-right text-slate-700">{q.quoteAmount ? `$${q.quoteAmount.toLocaleString()}` : "—"}</td>
                    <td className="py-1.5 px-2 text-slate-500">{q.expirationDate ?? "—"}</td>
                    <td className="py-1.5 px-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        q.status === "expired" ? "bg-red-100 text-red-600" :
                        q.status === "expiring" ? "bg-amber-100 text-amber-600" :
                        q.status === "received" || q.status === "valid" ? "bg-emerald-100 text-emerald-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {q.status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── RFIs ── */}
        {rfiList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
              RFIs — Requests for Information ({rfiList.length})
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-8">#</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent To</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="py-1.5 px-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Response</th>
                </tr>
              </thead>
              <tbody>
                {rfiList.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-1.5 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-1.5 px-2 text-slate-700">{r.question ?? "—"}</td>
                    <td className="py-1.5 px-2 text-slate-500">{r.sentTo ?? "—"}</td>
                    <td className="py-1.5 px-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                        r.status === "answered" || r.status === "closed" ? "bg-emerald-100 text-emerald-600" :
                        r.status === "sent" ? "bg-blue-100 text-blue-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-slate-500 italic">{r.response ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GENERAL CONDITIONS ── */}
        {gcItemsList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
              General Conditions
            </h2>
            {(() => {
              const byCategory: Record<string, GCItem[]> = {};
              for (const item of gcItemsList) {
                const cat = item.category ?? "other";
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(item);
              }
              const gcTotal = gcItemsList.reduce((sum, i) => sum + (i.total ?? 0), 0);
              return (
                <>
                  {Object.entries(byCategory).map(([cat, items]) => (
                    <div key={cat} className="mb-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 capitalize">{cat}</div>
                      <table className="w-full text-xs">
                        <tbody>
                          {items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((item, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                              <td className="py-1 px-2 text-slate-700">{item.description}</td>
                              <td className="py-1 px-2 text-slate-400 text-right w-20">{item.quantity ? `${item.quantity} ${item.unit ?? ""}` : ""}</td>
                              <td className="py-1 px-2 text-right text-slate-600 w-24">
                                {item.isMarkup && item.markupPct ? `${item.markupPct}%` : item.total ? `$${item.total.toLocaleString()}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  {gcTotal > 0 && (
                    <div className="flex justify-end pt-2 border-t border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Total Gen. Conds: ${gcTotal.toLocaleString()}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ── BID QUALIFICATIONS ── */}
        {bidQualsData && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-200">
              Bid Qualifications
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {bidQualsData.plansDated && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Plans Dated</span><span className="text-slate-700">{bidQualsData.plansDated}{bidQualsData.planRevision ? ` Rev. ${bidQualsData.planRevision}` : ""}</span></div>
              )}
              {bidQualsData.specSections && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Spec Sections</span><span className="text-slate-700">{bidQualsData.specSections}</span></div>
              )}
              {bidQualsData.laborType && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Labor Type</span><span className="text-slate-700 capitalize">{bidQualsData.laborType.replace("_", " ")}</span></div>
              )}
              {bidQualsData.bidGoodFor && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Bid Valid For</span><span className="text-slate-700">{bidQualsData.bidGoodFor} days</span></div>
              )}
              {bidQualsData.insuranceProgram && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Insurance</span><span className="text-slate-700 uppercase">{bidQualsData.insuranceProgram}</span></div>
              )}
              {bidQualsData.bondRequired !== undefined && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Bond Required</span><span className="text-slate-700">{bidQualsData.bondRequired ? `Yes${bidQualsData.bondTypes ? ` — ${bidQualsData.bondTypes}` : ""}` : "No"}</span></div>
              )}
              {bidQualsData.estimatedDuration && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Est. Duration</span><span className="text-slate-700">{bidQualsData.estimatedDuration}</span></div>
              )}
              {bidQualsData.earliestStart && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Earliest Start</span><span className="text-slate-700">{bidQualsData.earliestStart}</span></div>
              )}
              {bidQualsData.mbeGoals && (
                <div><span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">MBE/WBE Goal</span><span className="text-slate-700">{bidQualsData.mbeGoalPct ? `${bidQualsData.mbeGoalPct}%` : "Yes"}</span></div>
              )}
            </div>
          </div>
        )}

        {/* ── PROJECT NOTES ── */}
        {project?.notes && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
              Project Notes
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{project?.notes}</p>
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
          <span>BidShield • bidshield.co</span>
          <span>Confidential — {project?.name} — {today}</span>
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
