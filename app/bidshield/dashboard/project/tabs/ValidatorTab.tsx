"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps, TabId } from "../tab-types";
import { computeBidScore } from "@/lib/bidScore";
import type { ScoreItem } from "@/lib/bidScore";
import { generateBidSummaryPDF } from "@/lib/generateBidSummaryPDF";
// SVG icon helpers (no lucide dependency)
function IconCheck({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
}
function IconWarn({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
}
function IconX({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
}
function IconChevron({ size = 11 }: { size?: number }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;
}
function IconDownload({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
}
function TabIcon({ id }: { id: string | null }) {
  const paths: Record<string, string> = {
    checklist: "M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
    scope: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    pricing: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    generalconditions: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0",
    quotes: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    addenda: "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0H2.25m19.5 0v3a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 18v-3",
    rfis: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
    bidquals: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
    "__meta__": "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  };
  const path = paths[id ?? "__meta__"] ?? paths["__meta__"];
  return (
    <svg width={15} height={15} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="var(--bs-text-dim)">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}


// ── Score ring ──────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 90) return "var(--bs-teal)";
  if (score >= 70) return "var(--bs-blue)";
  if (score >= 40) return "var(--bs-amber)";
  return "var(--bs-red)";
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bs-border)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: size * 0.32, fontWeight: 800, color: "var(--bs-text-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>{score}</span>
        <span style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 1 }}>/100</span>
      </div>
    </div>
  );
}

// ── Section card definitions ─────────────────────────────────────────────────
const SECTION_DEFS: { tabId: TabId | null; label: string }[] = [
  { tabId: "checklist",         label: "Checklist"      },
  { tabId: "scope",             label: "Scope"          },
  { tabId: "pricing",           label: "Pricing"        },
  { tabId: "generalconditions", label: "Gen. Conds"     },
  { tabId: "quotes",            label: "Quotes"         },
  { tabId: "addenda",           label: "Addenda"        },
  { tabId: "rfis",              label: "RFIs"           },
  { tabId: "bidquals",          label: "Bid Quals"      },
  { tabId: null,                label: "Project & Dates"},
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
    ? "Ready to Submit"
    : isReady
    ? `Ready with ${warns.length} warning${warns.length !== 1 ? "s" : ""}`
    : `Not ready — ${fails.length} check${fails.length !== 1 ? "s" : ""} failing`;
  const heroSub = allPass
    ? "All checks passing. Your bid is ready."
    : isReady
    ? "No blockers, but review warnings before submitting."
    : "Fix these before submitting your bid.";
  const heroBg    = allPass ? "var(--bs-teal-dim)" : isReady ? "var(--bs-amber-dim)" : "var(--bs-red-dim)";
  const heroBdr   = allPass ? "var(--bs-teal-border)" : isReady ? "var(--bs-amber-border)" : "var(--bs-red-border)";
  const heroColor = allPass ? "var(--bs-teal)" : isReady ? "var(--bs-amber)" : "var(--bs-red)";

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
    s === "pass" ? "var(--bs-teal)" : s === "warn" ? "var(--bs-amber)" : s === "fail" ? "var(--bs-red)" : "var(--bs-border)";
  const StatusIcon = ({ s }: { s: "pass" | "warn" | "fail" | "none" }) => {
    if (s === "pass") return <span style={{ color: "var(--bs-teal)" }}><IconCheck size={18} /></span>;
    if (s === "warn") return <span style={{ color: "var(--bs-amber)" }}><IconWarn size={18} /></span>;
    if (s === "fail") return <span style={{ color: "var(--bs-red)" }}><IconX size={18} /></span>;
    return <div className="w-4 h-4 rounded-full" style={{ background: "var(--bs-border)" }} />;
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
          <div style={{ height: 8, borderRadius: 9999, overflow: "hidden", display: "flex", background: "var(--bs-border)", marginBottom: 8 }}>
            {passW > 0 && <div style={{ width: `${passW}%`, background: "var(--bs-teal)", transition: "width 1s ease-out" }} />}
            {warnW > 0 && <div style={{ width: `${warnW}%`, background: "var(--bs-amber)", transition: "width 1s ease-out" }} />}
            {failW > 0 && <div style={{ width: `${failW}%`, background: "var(--bs-red)", transition: "width 1s ease-out" }} />}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--bs-text-dim)" }}>
            <span><span style={{ color: "var(--bs-teal)", fontWeight: 700 }}>{passes.length}</span> passing</span>
            {warns.length > 0 && <span><span style={{ color: "var(--bs-amber)", fontWeight: 700 }}>{warns.length}</span> warnings</span>}
            {fails.length > 0 && <span><span style={{ color: "var(--bs-red)", fontWeight: 700 }}>{fails.length}</span> failing</span>}
          </div>
        </div>
      </div>

      {/* ── ZONE 2: Section health grid ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Section Health</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {SECTION_DEFS.map(({ tabId, label }) => {
            const key = tabId ?? "__meta__";
            const sectionItems = grouped.get(key) ?? [];
            const status = worstStatus(sectionItems);
            const border = statusBorderColor(status);
            // Best single message to show
            const worstItem = sectionItems.find(i => i.status === "fail") ?? sectionItems.find(i => i.status === "warn") ?? sectionItems[0];
            const canNavigate = tabId && (status === "fail" || status === "warn");

            const cardBg = status === "pass" ? "var(--bs-teal-dim)" : status === "warn" ? "var(--bs-amber-dim)" : status === "fail" ? "var(--bs-red-dim)" : "var(--bs-bg-elevated)";
            const cardBorderColor = status === "pass" ? "var(--bs-teal-border)" : status === "warn" ? "var(--bs-amber-border)" : status === "fail" ? "var(--bs-red-border)" : "var(--bs-border)";
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
                  transition: "transform 0.1s",
                }}
                onMouseEnter={e => {
                  if (canNavigate) {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <TabIcon id={tabId} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-secondary)" }}>{label}</span>
                  </div>
                  <StatusIcon s={status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--bs-text-muted)", lineHeight: 1.4 }}>
                  {worstItem
                    ? worstItem.message
                    : <span style={{ color: "var(--bs-text-dim)" }}>No checks for this section</span>}
                </div>
                {canNavigate && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 8, fontSize: 11, color: border, fontWeight: 600 }}>
                    Go to {label} <IconChevron size={11} />
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
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--bs-text-dim)" }}>Action Items</h3>
          <div className="flex flex-col gap-2">
            {fails.length > 0 && (
              <div className="mb-1">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--bs-red)" }}>Blocking — must fix</div>
                {fails.map((item, idx) => (
                  <div key={`f-${idx}`} className="rounded-lg px-4 py-3 flex items-start justify-between gap-3 mb-2" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-red-border)", borderLeft: "4px solid var(--bs-red)" }}>
                    <div className="flex items-start gap-3">
                      <IconX size={16} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>{item.label}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{item.message}</div>
                      </div>
                    </div>
                    {item.tabLink && (
                      <button onClick={() => onNavigateTab?.(item.tabLink! as TabId)} className="shrink-0 px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer" style={{ background: "var(--bs-red-dim)", color: "var(--bs-red)" }}>
                        Fix →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {warns.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--bs-amber)" }}>Warnings — review before submitting</div>
                {warns.map((item, idx) => (
                  <div key={`w-${idx}`} className="rounded-lg px-4 py-3 flex items-start justify-between gap-3 mb-2" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-amber-border)", borderLeft: "4px solid var(--bs-amber)" }}>
                    <div className="flex items-start gap-3">
                      <IconWarn size={16} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>{item.label}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{item.message}</div>
                      </div>
                    </div>
                    {item.tabLink && (
                      <button onClick={() => onNavigateTab?.(item.tabLink! as TabId)} className="shrink-0 px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>
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
          if (n == null) return <span style={{ color: warn ? "var(--bs-amber)" : "var(--bs-text-dim)" }}>—</span>;
          return "$" + Math.round(n).toLocaleString("en-US");
        };
        const row = (label: string, value: React.ReactNode, bold = false, large = false) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid var(--bs-border)" }}>
            <span style={{ fontSize: 12, color: "var(--bs-text-muted)" }}>{label}</span>
            <span style={{ fontSize: large ? 20 : bold ? 14 : 13, fontWeight: large ? 800 : bold ? 700 : 500, color: large ? "var(--bs-text-primary)" : bold ? "var(--bs-text-secondary)" : "var(--bs-text-secondary)" }}>{value}</span>
          </div>
        );
        const fact = (label: string, value: React.ReactNode) => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid var(--bs-border)" }}>
            <span style={{ fontSize: 12, color: "var(--bs-text-muted)" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bs-text-secondary)", maxWidth: "60%", textAlign: "right" }}>{value}</span>
          </div>
        );

        return (
          <div className="relative">
          {!isPro && !isDemo && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl" style={{ background: "rgba(19,21,26,0.85)", backdropFilter: "blur(6px)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-bg-elevated)" }}>
                <svg className="w-5 h-5" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--bs-text-primary)" }}>Bid Summary — Pro</p>
              <p className="text-xs mb-3" style={{ color: "var(--bs-text-muted)" }}>See your complete cost breakdown and $/SF before submission.</p>
              <a href="/bidshield/pricing" className="px-4 py-2 text-xs font-semibold rounded-lg" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                Upgrade to Pro
              </a>
            </div>
          )}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-text-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Bid Summary</span>
              <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>· Final review before submission</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {/* LEFT: Cost breakdown */}
              <div style={{ padding: "16px 20px", borderRight: "1px solid var(--bs-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Cost Breakdown</div>
                {row("Materials",  $(sumMaterial,  sumMaterial  == null))}
                {row("Labor",      $(sumLabor,     sumLabor     == null))}
                {row("GC Line Items", $(sumGCLine, sumGCLine    == null))}
                <div style={{ borderTop: "1px solid var(--bs-border)", margin: "6px 0" }} />
                {row("Subtotal",   $(sumSubtotal), true)}
                {overheadRow && row(`Overhead (${overheadRow.markupPct}%)`, $(overheadAmt))}
                {profitRow   && row(`Profit (${profitRow.markupPct}%)`,     $(profitAmt))}
                {sumMarkup != null && !overheadRow && !profitRow && row("Markups", $(sumMarkup))}
                <div style={{ borderTop: "2px solid var(--bs-text-primary)", marginTop: 8, paddingTop: 10 }}>
                  {row("TOTAL BID", $(sumTotalBid, sumTotalBid == null), false, true)}
                </div>
                <div style={{ marginTop: 4 }}>
                  {row("$/SF", sumDpSF != null ? `$${sumDpSF.toFixed(2)}` : <span style={{ color: "var(--bs-text-dim)" }}>—</span>, true)}
                </div>
              </div>

              {/* RIGHT: Project quick facts */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Project Quick Facts</div>
                {fact("Project", pd?.name ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
                {fact("Location", pd?.location ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
                {fact("GC / Owner", (pd?.gc ?? pd?.owner) ? `${pd?.gc ?? ""}${pd?.gc && pd?.owner ? " / " : ""}${pd?.owner ?? ""}` : <span style={{ color: "var(--bs-amber)" }}>Not set</span>)}
                {fact("Roof system", systemLabel ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
                {fact("Square footage", sumSqft != null ? sumSqft.toLocaleString() + " SF" : <span style={{ color: "var(--bs-amber)" }}>Not set</span>)}
                {fact("Bid date", bidDateStr
                  ? <span>{new Date(bidDateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{daysLeft != null && <span style={{ color: daysLeft <= 2 ? "var(--bs-red)" : daysLeft <= 7 ? "var(--bs-amber)" : "var(--bs-text-dim)", marginLeft: 6 }}>({daysLeft}d)</span>}</span>
                  : <span style={{ color: "var(--bs-amber)" }}>Not set</span>)}
                {fact("Plans dated", planDate ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
                {fact("Addenda through", addendaThru != null ? `#${addendaThru}` : <span style={{ color: "var(--bs-text-dim)" }}>None</span>)}
                {fact("Labor type", laborLabel ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
              </div>
            </div>
          </div>
          </div>
        );
      })()}

      {/* ── ZONE 5: Submit gate ── */}
      <div className="rounded-xl p-6 text-center" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {fails.length > 0 ? (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-red-dim)" }}>
              <svg className="w-5 h-5" style={{ color: "var(--bs-red)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--bs-red)" }}>Not Ready to Submit</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>Resolve all failing checks before exporting your bid package.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
              style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
            >
              <IconDownload size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF (draft)"}
            </button>
          </>
        ) : warns.length > 0 ? (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-amber-dim)" }}>
              <svg className="w-5 h-5" style={{ color: "var(--bs-amber)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--bs-amber)" }}>Ready with Warnings</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>No blockers, but {warns.length} item{warns.length > 1 ? "s" : ""} should be reviewed.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              <IconDownload size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF"}
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "var(--bs-teal-dim)" }}>
              <svg className="w-5 h-5" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "var(--bs-teal)" }}>Ready to Submit</h3>
            <p className="text-xs mb-4" style={{ color: "var(--bs-text-muted)" }}>All checks passed. Your bid is ready.</p>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              <IconDownload size={15} />
              {exporting ? "Generating PDF…" : "Export Bid Summary PDF"}
            </button>
          </>
        )}
      </div>

    </div>
  );
}
