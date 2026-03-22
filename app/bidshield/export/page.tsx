"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function ExportContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const [printed, setPrinted] = useState(false);

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
    gc: "Skanska USA", sqft: 68000, totalBidAmount: 1250000,
    systemType: "TPO", deckType: "Steel", assemblies: ["TPO 60mil", "Tapered ISO"],
    materialCost: 425000, laborCost: 340000, notes: "Pre-bid meeting 2/5. Site visit scheduled 2/7.",
  } : projectData;

  const demoChecklist = Array.from({ length: 95 }, (_, i) => ({
    phase: ["Project Setup", "Document Receipt", "Architectural Review", "Structural Review", "Mechanical Review", "Specification Review", "Demolition & Removal", "Site Access & Logistics", "Takeoff Areas", "Takeoff Linear", "Takeoff Counts", "Pricing Strategy", "Labor Planning", "Quality Control", "Final Review", "Submission"][Math.floor(i / 6)] || "Final Review",
    item: `Checklist item ${i + 1}`,
    status: i < 65 ? "done" : i < 69 ? "rfi" : "pending",
  }));

  const demoScope = Array.from({ length: 40 }, (_, i) => ({
    category: ["Demolition & Removal", "Site Access & Logistics", "Roofing System", "Insulation & Vapor Barrier", "Sheet Metal & Flashing", "Penetrations & Equipment", "Warranty & Closeout", "General Conditions"][Math.floor(i / 5)] || "General Conditions",
    item: `Scope item ${i + 1}`,
    status: i < 12 ? "included" : i < 16 ? "excluded" : i < 19 ? "by_others" : i < 21 ? "na" : "unaddressed",
    cost: i < 12 ? Math.floor(Math.random() * 50000) + 1000 : undefined,
    notes: i < 16 ? "Per spec section 07 54 00" : "",
  }));

  const checklistData = isDemo ? demoChecklist : (checklist ?? []);
  const scopeData = isDemo ? demoScope : (scopeItems ?? []);

  // Stats
  const totalChecklist = checklistData.length;
  const doneChecklist = checklistData.filter((i: any) => i.status === "done" || i.status === "na").length;
  const checklistPct = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  const includedScope = scopeData.filter((s: any) => s.status === "included");
  const excludedScope = scopeData.filter((s: any) => s.status === "excluded");
  const byOthersScope = scopeData.filter((s: any) => s.status === "by_others");
  const unaddressedScope = scopeData.filter((s: any) => s.status === "unaddressed");

  const bidAmt = (project as any)?.totalBidAmount;
  const grossArea = (project as any)?.sqft || (project as any)?.grossRoofArea;
  const dpsf = bidAmt && grossArea ? (bidAmt / grossArea).toFixed(2) : null;

  // Auto-trigger print dialog
  useEffect(() => {
    if (project && !printed) {
      setPrinted(true);
      setTimeout(() => window.print(), 800);
    }
  }, [project, printed]);

  if (!project) {
    return <div className="p-12 text-center text-slate-500">Loading bid summary...</div>;
  }

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-[800px] mx-auto bg-white">
      {/* Print button (hidden in print) */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => window.print()} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-emerald-700">
          📄 Save as PDF
        </button>
        <button onClick={() => window.history.back()} className="px-4 py-2.5 bg-white text-slate-600 rounded-lg text-sm font-medium shadow-lg border hover:bg-slate-50">
          ← Back
        </button>
      </div>

      {/* ═══ PAGE 1: BID SUMMARY ═══ */}
      <div className="p-12 print:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-emerald-600">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">BID SUMMARY REPORT</div>
            <h1 className="text-2xl font-bold text-slate-900">{(project as any).name}</h1>
            <div className="text-sm text-slate-500 mt-1">{(project as any).location}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">🛡️ BidShield</div>
            <div className="text-xs text-slate-400">Generated {today}</div>
            <div className="text-xs text-slate-400">Readiness: {checklistPct}%</div>
          </div>
        </div>

        {/* Project Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-8">
          {(project as any).gc && <div><span className="text-xs text-slate-400 uppercase">General Contractor</span><div className="text-sm font-medium text-slate-900">{(project as any).gc}</div></div>}
          {(project as any).bidDate && <div><span className="text-xs text-slate-400 uppercase">Bid Date</span><div className="text-sm font-medium text-slate-900">{(project as any).bidDate}</div></div>}
          {grossArea && <div><span className="text-xs text-slate-400 uppercase">Roof Area</span><div className="text-sm font-medium text-slate-900">{grossArea.toLocaleString()} SF</div></div>}
          {bidAmt && <div><span className="text-xs text-slate-400 uppercase">Bid Amount</span><div className="text-sm font-medium text-slate-900">${bidAmt.toLocaleString()}</div></div>}
          {dpsf && <div><span className="text-xs text-slate-400 uppercase">Price per SF</span><div className="text-sm font-medium text-slate-900">${dpsf}/SF</div></div>}
          {(project as any).systemType && <div><span className="text-xs text-slate-400 uppercase">System</span><div className="text-sm font-medium text-slate-900">{(project as any).systemType}</div></div>}
          {(project as any).materialCost && <div><span className="text-xs text-slate-400 uppercase">Material Cost</span><div className="text-sm font-medium text-slate-900">${(project as any).materialCost.toLocaleString()}</div></div>}
          {(project as any).laborCost && <div><span className="text-xs text-slate-400 uppercase">Labor Cost</span><div className="text-sm font-medium text-slate-900">${(project as any).laborCost.toLocaleString()}</div></div>}
        </div>

        {/* Scope Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Scope of Work Summary</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-xl font-bold text-emerald-700">{includedScope.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium uppercase">Included</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{excludedScope.length}</div>
              <div className="text-[10px] text-red-500 font-medium uppercase">Excluded</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{byOthersScope.length}</div>
              <div className="text-[10px] text-blue-500 font-medium uppercase">By Others</div>
            </div>
            {unaddressedScope.length > 0 && (
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-600">{unaddressedScope.length}</div>
                <div className="text-[10px] text-amber-500 font-medium uppercase">Unaddressed</div>
              </div>
            )}
          </div>
        </div>

        {/* Inclusions */}
        {includedScope.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">✓ Included in This Bid</h3>
            <table className="w-full text-xs">
              <tbody>
                {includedScope.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-700">{item.item || item.name}</td>
                    {item.cost && <td className="py-1.5 text-right text-slate-500">${item.cost.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Exclusions */}
        {excludedScope.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">✗ Excluded from This Bid</h3>
            <table className="w-full text-xs">
              <tbody>
                {excludedScope.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 text-slate-700">{item.item || item.name}</td>
                    <td className="py-1.5 text-right text-slate-400">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* By Others */}
        {byOthersScope.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">● By Others</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              {byOthersScope.map((item: any, i: number) => (
                <li key={i}>• {item.item || item.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {unaddressedScope.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">⚠ Unaddressed Items ({unaddressedScope.length})</h3>
            <p className="text-xs text-amber-600 mb-2">The following scope items have not been categorized as included, excluded, or by others:</p>
            <ul className="text-xs text-amber-700 space-y-0.5">
              {unaddressedScope.map((item: any, i: number) => (
                <li key={i}>• {item.item || item.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {(project as any).notes && (
          <div className="mt-8 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Notes</h3>
            <p className="text-sm text-slate-600">{(project as any).notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-400">
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
