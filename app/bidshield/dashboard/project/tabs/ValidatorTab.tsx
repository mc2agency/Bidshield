"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";
import { computeBidScore } from "@/lib/bidScore";
import type { ScoreItem } from "@/lib/bidScore";
import { generateBidSummaryPDF } from "@/lib/generateBidSummaryPDF";
import {
  LayoutList, AlignLeft, DollarSign, Quote, FileText,
  HelpCircle, ClipboardList, Briefcase, Calendar,
  CheckCircle2, AlertTriangle, XCircle, ChevronRight, Download,
} from "lucide-react";


// ── Score ring ──────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [score]);
  const r = size / 2 - 9, sw = 9, circ = 2 * Math.PI * r;
  const offset = animated ? circ * (1 - score / 100) : circ;
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: size * 0.32, fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.03em" }}>{score}</span>
        <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>/100</span>
      </div>
    </div>
  );
}

// ── Section card definitions ─────────────────────────────────────────────────
const SECTION_DEFS: { tabId: TabId | null; label: string; Icon: React.ComponentType<any> }[] = [
  { tabId: "checklist",         label: "Checklist",     Icon: LayoutList   },
  { tabId: "scope",             label: "Scope",         Icon: AlignLeft    },
  { tabId: "pricing",           label: "Pricing",       Icon: DollarSign   },
  { tabId: "generalconditions", label: "Gen. Conds",    Icon: Briefcase    },
  { tabId: "quotes",            label: "Quotes",        Icon: Quote        },
  { tabId: "addenda",           label: "Addenda",       Icon: FileText     },
  { tabId: "rfis",              label: "RFIs",          Icon: HelpCircle   },
  { tabId: "bidquals",          label: "Bid Quals",     Icon: ClipboardList},
  { tabId: null,                label: "Project & Dates",Icon: Calendar    },
];

function getLabelGroup(label: string): TabId | "__meta__" {
  if (label.startsWith("Critical")) return "checklist";
  const map: Record<string, TabId | "__meta__"> = {
    "Checklist Progress": "checklist",
    "Critical Phases": "checklist",
    "Vendor Quotes": "quotes",
    "Expired Quotes": "quotes",
    "Expiring Quotes": "quotes",
    "Missing Quotes": "quotes",
    "Open RFIs": "rfis",
    "Draft RFIs": "rfis",
    "RFIs": "rfis",
    "Bid Date": "__meta__",
    "Project Info": "__meta__",
    "Scope Coverage": "scope",
    "Addenda Review": "addenda",
    "Pricing": "pricing",
    "General Conditions": "generalconditions",
    "Bid Qualifications": "bidquals",
    "Material Pricing": "materials" as any,
    "Coverage Rates": "materials" as any,
    "Waste Factors": "materials" as any,
    "Labor Verification": "labor" as any,
    "Scope-Pricing Conflicts": "scope",
    "GC Bid Forms": "bidquals",
  };
  return map[label] ?? "__meta__";
}

function worstStatus(items: ScoreItem[]): "pass" | "warn" | "fail" | "none" {
  if (!items.length) return "none";
  if (items.some(i => i.status === "fail")) return "fail";
  if (items.some(i => i.status === "warn")) return "warn";
  return "pass";
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ValidatorTab({ projectId, isDemo, isPro, project, userId, onNavigateTab }: TabProps) {
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
  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const addenda = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const bidQuals = useQuery(
    api.bidshield.getBidQuals,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const gcItems = useQuery(
    api.bidshield.getGCItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const projectMaterials = useQuery(
    api.bidshield.getProjectMaterials,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const datasheets = useQuery(
    api.bidshield.getDatasheets,
    !isDemo && userId ? { userId } : "skip"
  );
  const laborTasks = useQuery(
    api.bidshield.getLaborTasks,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborAnalysis = useQuery(
    api.bidshield.getLaborAnalysis,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const gcFormDocuments = useQuery(
    api.bidshield.getGcBidFormDocuments,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const unconfirmedGcFormCount = useQuery(
    api.bidshield.getUnconfirmedGcBidFormCount,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborTotal = useQuery(
    api.bidshield.getLaborTotal,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const [hasRun] = useState(true);
  const [exporting, setExporting] = useState(false);
  const projectData = project;

  const scoreData = (hasRun && (isDemo || projectData)) ? computeBidScore({
    isDemo,
    project: projectData,
    checklist,
    scopeItems,
    quotes,
    rfis,
    addenda,
    bidQuals,
    gcItems,
    projectMaterials,
    datasheets,
    laborTasks,
    laborAnalysis,
    gcFormDocuments,
    unconfirmedGcFormCount,
  }) : null;
  if (!scoreData) return null;

  const fails   = scoreData.items.filter(i => i.status === "fail");
  const warns   = scoreData.items.filter(i => i.status === "warn");
  const passes  = scoreData.items.filter(i => i.status === "pass");
  const total   = scoreData.items.length;
  const isReady = fails.length === 0;
  const allPass = fails.length === 0 && warns.length === 0;

  // ── Computed bid summary values (shared between render and PDF export) ──────
  const pd = project as any;
  const computedMat = (projectMaterials ?? []).reduce((s: number, m: any) => s + (m.totalCost || 0), 0);
  const sumMaterial: number | null = isDemo ? 612000 : (computedMat > 0 ? Math.round(computedMat) : (pd?.materialCost ?? null));
  const sumLabor: number | null    = isDemo ? 488000 : (laborTotal ?? pd?.laborCost ?? null);

  const gcLineItems  = isDemo ? [] : (gcItems ?? []);
  const gcNonMarkup  = gcLineItems.filter((i: any) => !i.isMarkup);
  const gcMarkupRows = gcLineItems.filter((i: any) => i.isMarkup);
  const gcLineTotal  = gcNonMarkup.reduce((s: number, i: any) => s + (i.total ?? 0), 0);
  const gcMarkupBase = (sumMaterial ?? 0) + (sumLabor ?? 0) + gcLineTotal;

  const demoGCLine   = 13600;
  const demoMBase    = 612000 + 488000 + demoGCLine;
  const demoMarkup   = Math.round(demoMBase * 0.21);

  const sumGCLine: number | null   = isDemo ? demoGCLine : (gcLineTotal  > 0 ? gcLineTotal  : null);
  const sumSubtotal: number | null = sumMaterial !== null || sumLabor !== null
    ? (sumMaterial ?? 0) + (sumLabor ?? 0) + (isDemo ? demoGCLine : gcLineTotal)
    : null;
  const sumTotalBid: number | null = isDemo ? 1250000 : (pd?.totalBidAmount ?? null);
  const sumSqft: number | null     = isDemo ? 68000   : (pd?.grossRoofArea ?? pd?.sqft ?? null);
  const sumDpSF: number | null     = sumTotalBid && sumSqft && sumSqft > 0 ? sumTotalBid / sumSqft : null;

  const overheadRow = isDemo ? { description: "Overhead", markupPct: 10 } : gcMarkupRows.find((i: any) => i.description?.toLowerCase().includes("overhead"));
  const profitRow   = isDemo ? { description: "Profit",   markupPct: 8  } : gcMarkupRows.find((i: any) => i.description?.toLowerCase().includes("profit"));
  const gcMarkupTotal = gcMarkupRows.reduce((s: number, i: any) => s + gcMarkupBase * ((i.markupPct ?? 0) / 100), 0);
  const sumMarkup: number | null = isDemo ? demoMarkup : (gcMarkupTotal > 0 ? gcMarkupTotal : null);
  const overheadAmt  = overheadRow ? (isDemo ? demoMBase : gcMarkupBase) * ((overheadRow.markupPct ?? 0) / 100) : null;
  const profitAmt    = profitRow   ? (isDemo ? demoMBase : gcMarkupBase) * ((profitRow.markupPct   ?? 0) / 100) : null;

  const laborMap: Record<string, string> = { open_shop: "Open Shop", prevailing_wage: "Prevailing Wage", union: "Union" };
  const laborKey   = isDemo ? "open_shop" : (bidQuals?.laborType ?? "");
  const laborLabel = laborKey ? (laborMap[laborKey] ?? null) : null;
  const addendaThru = isDemo ? 2 : (bidQuals?.addendaThrough ?? (addenda ? addenda.length : null));
  const systemLabel = pd?.systemType ? pd.systemType.toUpperCase() : null;

  const scopeExclusions = (scopeItems ?? [])
    .filter((s: any) => s.status === "excluded")
    .map((s: any) => (s.item || s.name || "").trim())
    .filter(Boolean) as string[];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateBidSummaryPDF({
        project: {
          name:     pd?.name,
          location: pd?.location,
          gc:       pd?.gc,
          owner:    pd?.owner,
          bidDate:  pd?.bidDate ?? (isDemo ? "2026-03-07" : undefined),
        },
        financials: {
          sumMaterial,
          sumLabor,
          sumGCLine,
          sumSubtotal,
          sumTotalBid,
          sumSqft,
          sumDpSF,
          overheadPct: overheadRow?.markupPct ?? null,
          overheadAmt,
          profitPct:   profitRow?.markupPct   ?? null,
          profitAmt,
          otherMarkupAmt: (!overheadRow && !profitRow) ? sumMarkup : null,
        },
        validator: {
          score:      scoreData.score,
          passCount:  passes.length,
          warnCount:  warns.length,
          failCount:  fails.length,
          isReady,
          allPass,
          warnings: warns.map(w => ({ label: w.label, message: w.message })),
          failures: fails.map(f => ({ label: f.label, message: f.message })),
        },
        scope: {
          includedCount:  (scopeItems ?? []).filter((s: any) => s.status === "included").length,
          excludedCount:  (scopeItems ?? []).filter((s: any) => s.status === "excluded").length,
          byOthersCount:  (scopeItems ?? []).filter((s: any) => s.status === "by_others").length,
          exclusions:     scopeExclusions,
        },
        addendaCount:  isDemo ? 2 : (addenda?.length ?? 0),
        roofSystem:    systemLabel,
        laborLabel:    laborLabel,
      });
    } finally {
      setExporting(false);
    }
  };

  // Hero status
  const heroTitle = allPass
    ? "Ready to Submit ✓"
    : isReady
    ? `Ready with ${warns.length} warning${warns.length !== 1 ? "s" : ""}`
    : `Not ready — ${fails.length} check${fails.length !== 1 ? "s" : ""} failing`;
  const heroSub = allPass
    ? "All checks passing. Your bid is ready."
    : isReady
    ? "No blockers, but review warnings before submitting."
    : "Fix these before submitting your bid.";
  const heroBg    = allPass ? "#f0fdf4" : isReady ? "#fffbeb" : "#fef2f2";
  const heroBdr   = allPass ? "#bbf7d0" : isReady ? "#fde68a" : "#fecaca";
  const heroColor = allPass ? "#065f46" : isReady ? "#92400e" : "#991b1b";

  // Stacked bar
  const passW = total > 0 ? (passes.length / total) * 100 : 0;
  const warnW = total > 0 ? (warns.length / total) * 100 : 0;
  const failW = total > 0 ? (fails.length / total) * 100 : 0;

  // Group items by section
  const grouped = new Map<string, ScoreItem[]>();
  for (const item of scoreData.items) {
    const key = getLabelGroup(item.label);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  // Status styling helpers
  const statusBorderColor = (s: "pass" | "warn" | "fail" | "none") =>
    s === "pass" ? "#10b981" : s === "warn" ? "#f59e0b" : s === "fail" ? "#ef4444" : "#d1d5db";
  const StatusIcon = ({ s }: { s: "pass" | "warn" | "fail" | "none" }) => {
    if (s === "pass") return <CheckCircle2 size={18} color="#10b981" />;
    if (s === "warn") return <AlertTriangle size={18} color="#f59e0b" />;
    if (s === "fail") return <XCircle size={18} color="#ef4444" />;
    return <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#e5e7eb" }} />;
  };

  return (
    <div className="p-6 flex flex-col gap-5 w-full">

      {/* ── ZONE 1: Hero ── */}
      <div style={{
        background: heroBg, border: `1px solid ${heroBdr}`,
        borderRadius: 14, padding: "24px 28px",
        display: "flex", alignItems: "center", gap: 28,
      }}>
        <ScoreRing score={scoreData.score} size={120} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: heroColor, marginBottom: 4 }}>{heroTitle}</div>
          <div style={{ fontSize: 14, color: heroColor, opacity: 0.75, marginBottom: 16 }}>{heroSub}</div>
          {/* Stacked bar */}
          <div style={{ height: 8, borderRadius: 9999, overflow: "hidden", display: "flex", background: "#e5e7eb", marginBottom: 8 }}>
            {passW > 0 && <div style={{ width: `${passW}%`, background: "#10b981", transition: "width 1s ease-out" }} />}
            {warnW > 0 && <div style={{ width: `${warnW}%`, background: "#f59e0b", transition: "width 1s ease-out" }} />}
            {failW > 0 && <div style={{ width: `${failW}%`, background: "#ef4444", transition: "width 1s ease-out" }} />}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280" }}>
            <span><span style={{ color: "#10b981", fontWeight: 700 }}>{passes.length}</span> passing</span>
            {warns.length > 0 && <span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{warns.length}</span> warnings</span>}
            {fails.length > 0 && <span><span style={{ color: "#ef4444", fontWeight: 700 }}>{fails.length}</span> failing</span>}
          </div>
        </div>
      </div>

      {/* ── ZONE 2: Section health grid ── */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Section Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SECTION_DEFS.map(({ tabId, label, Icon }) => {
            const key = tabId ?? "__meta__";
            const sectionItems = grouped.get(key) ?? [];
            const status = worstStatus(sectionItems);
            const border = statusBorderColor(status);
            // Best single message to show
            const worstItem = sectionItems.find(i => i.status === "fail") ?? sectionItems.find(i => i.status === "warn") ?? sectionItems[0];
            const canNavigate = tabId && (status === "fail" || status === "warn");

            const cardBg = status === "pass" ? "#f0fdf4" : status === "warn" ? "#fffbeb" : status === "fail" ? "#fef2f2" : "#f8fafc";
            const cardBorderColor = status === "pass" ? "#bbf7d0" : status === "warn" ? "#fde68a" : status === "fail" ? "#fecaca" : "#e5e7eb";
            return (
              <div
                key={label}
                onClick={() => canNavigate && onNavigateTab?.(tabId!)}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorderColor}`,
                  borderLeft: `4px solid ${border}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: canNavigate ? "pointer" : "default",
                  transition: "box-shadow 0.15s, transform 0.1s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => {
                  if (canNavigate) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon size={15} color="#6b7280" strokeWidth={1.75} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
                  </div>
                  <StatusIcon s={status} />
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>
                  {worstItem
                    ? worstItem.message
                    : <span style={{ color: "#d1d5db" }}>No checks for this section</span>}
                </div>
                {canNavigate && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 8, fontSize: 11, color: border, fontWeight: 600 }}>
                    Go to {label} <ChevronRight size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ZONE 3: Action items (fails + warns only) ── */}
      {(fails.length > 0 || warns.length > 0) && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Action Items</h3>
          <div className="flex flex-col gap-2">
            {fails.length > 0 && (
              <div className="mb-1">
                <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Blocking — must fix</div>
                {fails.map((item, idx) => (
                  <div key={`f-${idx}`} className="bg-white rounded-lg border border-red-100 border-l-4 border-l-red-500 px-4 py-3 flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <XCircle size={16} color="#ef4444" className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{item.label}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{item.message}</div>
                      </div>
                    </div>
                    {item.tabLink && (
                      <button onClick={() => onNavigateTab?.(item.tabLink! as TabId)} className="shrink-0 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full hover:bg-red-100 transition-colors border-0 cursor-pointer">
                        Fix →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {warns.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2">Warnings — review before submitting</div>
                {warns.map((item, idx) => (
                  <div key={`w-${idx}`} className="bg-white rounded-lg border border-amber-100 border-l-4 border-l-amber-500 px-4 py-3 flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={16} color="#f59e0b" className="mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{item.label}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{item.message}</div>
                      </div>
                    </div>
                    {item.tabLink && (
                      <button onClick={() => onNavigateTab?.(item.tabLink! as TabId)} className="shrink-0 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full hover:bg-amber-100 transition-colors border-0 cursor-pointer">
                        Review →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ZONE 4: Bid Summary ── */}
      {(() => {
        // Uses component-level computed variables (sumMaterial, sumLabor, etc.)
        const bidDateStr = pd?.bidDate ?? (isDemo ? "2026-03-07" : null);
        const daysLeft   = bidDateStr ? Math.ceil((new Date(bidDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const planDate   = isDemo ? "02/10/2026" : (bidQuals?.plansDated ?? null);

        const $ = (n: number | null, warn = false) => {
          if (n == null) return <span style={{ color: warn ? "#f59e0b" : "#d1d5db" }}>—</span>;
          return "$" + Math.round(n).toLocaleString("en-US");
        };
        const row = (label: string, value: React.ReactNode, bold = false, large = false) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: large ? 20 : bold ? 14 : 13, fontWeight: large ? 800 : bold ? 700 : 500, color: large ? "#111827" : bold ? "#1f2937" : "#374151" }}>{value}</span>
          </div>
        );
        const fact = (label: string, value: React.ReactNode) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", maxWidth: "60%", textAlign: "right" }}>{value}</span>
          </div>
        );

        return (
          <div className="relative">
          {!isPro && !isDemo && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl" style={{ background: "rgba(248,250,252,0.85)", backdropFilter: "blur(6px)" }}>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Bid Summary — Pro</p>
              <p className="text-xs text-slate-500 mb-3">See your complete cost breakdown and $/SF before submission.</p>
              <a href="/bidshield/pricing" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors">
                Upgrade to Pro
              </a>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Bid Summary</span>
              <span style={{ fontSize: 11, color: "#d1d5db" }}>· Final review before submission</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {/* LEFT: Cost breakdown */}
              <div style={{ padding: "16px 20px", borderRight: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Cost Breakdown</div>
                {row("Materials",  $(sumMaterial,  sumMaterial  == null))}
                {row("Labor",      $(sumLabor,     sumLabor     == null))}
                {row("GC Line Items", $(sumGCLine, sumGCLine    == null))}
                <div style={{ borderTop: "1px solid #e5e7eb", margin: "6px 0" }} />
                {row("Subtotal",   $(sumSubtotal), true)}
                {overheadRow && row(`Overhead (${overheadRow.markupPct}%)`, $(overheadAmt))}
                {profitRow   && row(`Profit (${profitRow.markupPct}%)`,     $(profitAmt))}
                {sumMarkup != null && !overheadRow && !profitRow && row("Markups", $(sumMarkup))}
                <div style={{ borderTop: "2px solid #111827", marginTop: 8, paddingTop: 10 }}>
                  {row("TOTAL BID", $(sumTotalBid, sumTotalBid == null), false, true)}
                </div>
                <div style={{ marginTop: 4 }}>
                  {row("$/SF", sumDpSF != null ? `$${sumDpSF.toFixed(2)}` : <span style={{ color: "#d1d5db" }}>—</span>, true)}
                </div>
              </div>

              {/* RIGHT: Project quick facts */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Project Quick Facts</div>
                {fact("Project", pd?.name ?? <span style={{ color: "#d1d5db" }}>—</span>)}
                {fact("Location", pd?.location ?? <span style={{ color: "#d1d5db" }}>—</span>)}
                {fact("GC / Owner", (pd?.gc ?? pd?.owner) ? `${pd?.gc ?? ""}${pd?.gc && pd?.owner ? " / " : ""}${pd?.owner ?? ""}` : <span style={{ color: "#f59e0b" }}>Not set</span>)}
                {fact("Roof system", systemLabel ?? <span style={{ color: "#d1d5db" }}>—</span>)}
                {fact("Square footage", sumSqft != null ? sumSqft.toLocaleString() + " SF" : <span style={{ color: "#f59e0b" }}>Not set</span>)}
                {fact("Bid date", bidDateStr
                  ? <span>{new Date(bidDateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{daysLeft != null && <span style={{ color: daysLeft <= 2 ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#6b7280", marginLeft: 6 }}>({daysLeft}d)</span>}</span>
                  : <span style={{ color: "#f59e0b" }}>Not set</span>)}
                {fact("Plans dated", planDate ?? <span style={{ color: "#d1d5db" }}>—</span>)}
                {fact("Addenda through", addendaThru != null ? `#${addendaThru}` : <span style={{ color: "#d1d5db" }}>None</span>)}
                {fact("Labor type", laborLabel ?? <span style={{ color: "#d1d5db" }}>—</span>)}
              </div>
            </div>
          </div>
          </div>
        );
      })()}

      {/* ── ZONE 5: Submit gate ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        {fails.length > 0 ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-1">Not Ready to Submit</h3>
            <p className="text-xs text-slate-500 mb-4">Resolve all failing checks before exporting your bid package.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
            >
              <Download size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF (draft)"}
            </button>
          </>
        ) : warns.length > 0 ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            </div>
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-1">Ready with Warnings</h3>
            <p className="text-xs text-slate-500 mb-4">No blockers, but {warns.length} item{warns.length > 1 ? "s" : ""} should be reviewed.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
            >
              <Download size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF"}
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-1">Ready to Submit</h3>
            <p className="text-xs text-slate-500 mb-4">All checks passed. Your bid is ready.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
            >
              <Download size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF"}
            </button>
          </>
        )}
      </div>

    </div>
  );
}
