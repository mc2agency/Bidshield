"use client";

import { Suspense, useMemo, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

import { getRoofSystem, getRoofSystemByAssembly } from "@/lib/bidshield/roof-systems";
import { detectScopePricingConflicts } from "@/lib/bidshield/scopePricingConflicts";

import type { TabId } from "./tab-types";
import OverviewTab from "./tabs/OverviewTabRedesign";
import {
  ChecklistTab, TakeoffTab, PricingTab, MaterialsTab,
  ScopeTab, QuotesTab, RFIsTab, AddendaTab, LaborTab, GeneralConditionsTab, ValidatorTab, BidQualsTab, DecisionLogTab,
  SubmissionTab, PreBidMeetingsTab, SetupTab,
} from "./tabs";
import TabErrorBoundary from "./TabErrorBoundary";

function NavIcon({ paths }: { paths: React.ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      {paths}
    </svg>
  );
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  setup:             <><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.2 4.2l1.4 1.4M10.4 10.4l1.4 1.4M4.2 11.8l1.4-1.4M10.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/></>,
  overview:          <><rect x="2.5" y="2.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  checklist:         <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  scope:             <><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  takeoff:           <path d="M3 13L8 3l5 10H3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>,
  materials:         <><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  pricing:           <><path d="M8 2v12M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>,
  labor:             <><path d="M4 4h8v8H4z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M6 2v4M10 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  generalconditions: <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>,
  quotes:            <><path d="M4 3h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M6 7h4M6 9.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  addenda:           <><path d="M4 3h5l3 3v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M9 3v3h3" stroke="currentColor" strokeWidth="1.1"/></>,
  rfis:              <><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 7v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="5.5" r="0.6" fill="currentColor"/></>,
  bidquals:          <><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  validator:         <><path d="M8 2l1.8 3.6L14 6.5l-3 2.9.7 4.1L8 11.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></>,
  decisions:         <><path d="M3 5h10M3 8h7M3 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  submission:        <><path d="M14 2L2 7l5 2.5M14 2L9 14l-2-4.5M14 2L7 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></>,
  prebidmeetings:    <><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M2.5 7h11M6 2v3M10 2v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
};

const BROWSE_ITEMS: { id: TabId; label: string; shortLabel?: string }[] = [
  { id: "setup",             label: "Project Setup", shortLabel: "Setup" },
  { id: "overview",          label: "Overview" },
  { id: "checklist",         label: "Checklist" },
  { id: "scope",             label: "Scope" },
  { id: "takeoff",           label: "Takeoff" },
  { id: "materials",         label: "Material Reconciliation", shortLabel: "Reconciliation" },
  { id: "pricing",           label: "Pricing" },
  { id: "labor",             label: "Labor Verification",      shortLabel: "Labor" },
  { id: "generalconditions", label: "Gen. Conds" },
  { id: "quotes",            label: "Quotes" },
  { id: "addenda",           label: "Addenda" },
  { id: "rfis",              label: "RFIs" },
  { id: "bidquals",          label: "Bid Quals" },
  { id: "validator",         label: "Validator" },
  { id: "decisions",         label: "Decision Log" },
  { id: "submission",        label: "Submission" },
  { id: "prebidmeetings",    label: "Pre-Bid Meetings", shortLabel: "Pre-Bid" },
];

function scoreDot(s: number): string {
  if (s === 100) return "var(--bs-teal)";
  if (s >= 67)   return "var(--bs-blue)";
  if (s >= 34)   return "var(--bs-amber)";
  return "var(--bs-red)";
}

type ActionLevel = "blocker" | "warning" | "info";
interface ActionItem { level: ActionLevel; title: string; detail?: string; tab: TabId; }

function ProjectDetail() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const updateProject = useMutation(api.bidshield.updateProject);
  const [editingBidInline, setEditingBidInline] = useState(false);
  const [bidInlineValue, setBidInlineValue] = useState("");
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({ name: "", gc: "", location: "", bidDate: "", bidTime: "", sqft: "", totalBidAmount: "", fmGlobal: null as boolean | null, pre1990: null as boolean | null, energyCode: null as boolean | null, climateZone: "" });
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState<{
    result: "won" | "lost" | "no_award" | "pending" | null;
    competitorName: string;
    competitorPrice: string;
    lossReason: string;
  }>({ result: null, competitorName: "", competitorPrice: "", lossReason: "" });
  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionText, setDecisionText] = useState("");
  const [decisionWho, setDecisionWho] = useState("");

  const project = useQuery(api.bidshield.getProject, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const checklist = useQuery(api.bidshield.getChecklist, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const quotes = useQuery(api.bidshield.getQuotes, !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip");
  const rfis = useQuery(api.bidshield.getRFIs, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const addenda = useQuery(api.bidshield.getAddenda, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const projectMaterials = useQuery(api.bidshield.getProjectMaterials, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const scopeItems = useQuery(api.bidshield.getScopeItems, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const bidQuals = useQuery(api.bidshield.getBidQuals, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const decisions = useQuery(api.bidshield.getDecisions, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const unverifiedLaborCount = useQuery(api.bidshield.getUnverifiedLaborCount, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const laborTasks = useQuery(api.bidshield.getLaborTasks, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const unconfirmedGcFormCount = useQuery(api.bidshield.getUnconfirmedGcBidFormCount, !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip");
  const addDecision = useMutation(api.bidshield.addDecision);
  const subscription = useQuery(api.users.getUserSubscription, !isDemo && userId ? { clerkId: userId } : "skip");
  const isPro = isDemo || (subscription?.isPro ?? false);

  const projectData = isDemo
    ? { name: "Meridian Business Park — Bldg C", location: "Charlotte, NC", bidDate: "2026-03-07",
        status: "in_progress" as const, gc: "Skanska USA", sqft: 68000,
        assemblies: ["TPO 60mil", "Tapered ISO"],
        notes: "Pre-bid walkthrough completed 2/12. Owner wants 20-yr NDL warranty. Existing roof has wet insulation in NE quadrant.",
        trade: "roofing", systemType: "tpo", deckType: "steel",
        primaryAssembly: "TPO 60mil Mechanically Attached",
        grossRoofArea: 68000, totalBidAmount: 1250000, materialCost: 612000, laborCost: 488000 }
    : project;

  const openTab = useCallback((tab: TabId) => setActiveTab(tab), []);

  const saveBidInline = async () => {
    const val = parseFloat(bidInlineValue.replace(/[^0-9.]/g, ""));
    if (!isNaN(val) && isValidConvexId) {
      await updateProject({ projectId: projectIdParam as Id<"bidshield_projects">, totalBidAmount: val });
    }
    setEditingBidInline(false);
  };

  const openEditProject = () => {
    setEditProjectForm({
      name: projectData?.name ?? "",
      gc: (projectData as any)?.gc ?? "",
      location: projectData?.location ?? "",
      bidDate: projectData?.bidDate ?? "",
      bidTime: (projectData as any)?.bidTime ?? "",
      sqft: ((projectData as any)?.grossRoofArea ?? (projectData as any)?.sqft ?? "").toString(),
      totalBidAmount: ((projectData as any)?.totalBidAmount ?? "").toString(),
      fmGlobal: (projectData as any)?.fmGlobal ?? null,
      pre1990: (projectData as any)?.pre1990 ?? null,
      energyCode: (projectData as any)?.energyCode ?? null,
      climateZone: (projectData as any)?.climateZone ?? "",
    });
    setEditProjectOpen(true);
  };

  const saveEditProject = async () => {
    if (!isValidConvexId) { setEditProjectOpen(false); return; }
    const parseNum = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    await updateProject({
      projectId: projectIdParam as Id<"bidshield_projects">,
      name: editProjectForm.name || undefined,
      gc: editProjectForm.gc || undefined,
      location: editProjectForm.location || undefined,
      bidDate: editProjectForm.bidDate || undefined,
      bidTime: editProjectForm.bidTime || undefined,
      grossRoofArea: parseNum(editProjectForm.sqft),
      sqft: parseNum(editProjectForm.sqft),
      totalBidAmount: parseNum(editProjectForm.totalBidAmount),
      fmGlobal: editProjectForm.fmGlobal === null ? undefined : editProjectForm.fmGlobal,
      pre1990: editProjectForm.pre1990 === null ? undefined : editProjectForm.pre1990,
      energyCode: editProjectForm.energyCode === null ? undefined : editProjectForm.energyCode,
      climateZone: editProjectForm.climateZone || undefined,
    });
    setEditProjectOpen(false);
  };

  const saveOutcome = async () => {
    if (!isValidConvexId || !outcomeForm.result || outcomeForm.result === "pending") {
      setOutcomeModalOpen(false);
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const parseNum = (s: string) => { const n = parseFloat(s); return isNaN(n) ? undefined : n; };
    await updateProject({
      projectId: projectIdParam as Id<"bidshield_projects">,
      status: outcomeForm.result,
      completedDate: today,
      ...(outcomeForm.result === "lost" ? {
        competitorName: outcomeForm.competitorName || undefined,
        competitorPrice: parseNum(outcomeForm.competitorPrice),
        lossReason: outcomeForm.lossReason || undefined,
      } : {}),
    });
    setOutcomeModalOpen(false);
  };

  const { actionItems, readinessScore, passCount, scores, remaining, scopeConflictCount } = useMemo(() => {
    const items: ActionItem[] = [];
    const cl = isDemo ? [] : (checklist ?? []);
    const clTotal = isDemo ? 95 : cl.length;
    const clDone = isDemo ? 68 : cl.filter((i: any) => i.status === "done" || i.status === "na").length;
    const clPct = clTotal > 0 ? Math.round((clDone / clTotal) * 100) : 0;
    const clPending = clTotal - clDone;
    const clRfi = isDemo ? 3 : cl.filter((i: any) => i.status === "rfi").length;

    const sc = isDemo ? Array.from({ length: 40 }, (_, i) => ({ status: i < 14 ? "included" : i < 16 ? "excluded" : i < 18 ? "by_others" : i < 21 ? "na" : "unaddressed" })) : (scopeItems ?? []);
    const scTotal = sc.length;
    const scUnaddressed = sc.filter((s: any) => s.status === "unaddressed").length;
    const scPct = scTotal > 0 ? Math.round(((scTotal - scUnaddressed) / scTotal) * 100) : 100;

    const demoSections = [{ squareFeet: 28500 }, { squareFeet: 24800 }, { squareFeet: 8200 }, { squareFeet: 3400 }];
    const sections = isDemo ? demoSections : (takeoffSections ?? []);
    const takenOff = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
    const controlSF = isDemo ? 68000 : (projectData as any)?.grossRoofArea ?? 0;
    const deltaSF = controlSF > 0 ? Math.abs(controlSF - takenOff) : 0;
    const deltaPct = controlSF > 0 ? (deltaSF / controlSF) * 100 : null;

    const mats = isDemo ? Array.from({ length: 12 }, () => ({ unitPrice: 100, totalCost: 5000 })) : (projectMaterials ?? []);
    const matUnpriced = mats.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

    const qs = isDemo ? [] : (quotes ?? []);
    const qCount = isDemo ? 5 : qs.length;
    const expiring = isDemo ? 1 : qs.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;
    const expired = isDemo ? 0 : qs.filter((q: any) => { const d = q.expirationDate; return d && new Date(d).getTime() < Date.now(); }).length;

    const ad = isDemo ? [] : (addenda ?? []);
    const adCount = isDemo ? 3 : ad.length;
    const adNotReviewed = isDemo ? 0 : ad.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
    const adNotRepriced = isDemo ? 1 : ad.filter((a: any) => a.affectsScope === true && !a.repriced).length;

    const rs = isDemo ? [] : (rfis ?? []);
    const rCount = isDemo ? 3 : rs.length;
    const rPending = isDemo ? 1 : rs.filter((r: any) => r.status === "sent" || r.status === "draft").length;

    const bidAmt = (projectData as any)?.totalBidAmount;
    const matCost = (projectData as any)?.materialCost;
    const labCost = (projectData as any)?.laborCost;
    const pricingDone = !!(bidAmt && bidAmt > 0 && matCost && labCost);

    if (scUnaddressed > 0) items.push(scPct < 80
      ? { level: "blocker", title: `${scUnaddressed} scope items unaddressed`, detail: "Mark each as included, excluded, or by others", tab: "scope" }
      : { level: "warning", title: `${scUnaddressed} scope items remaining`, tab: "scope" });
    if (adNotRepriced > 0) items.push({ level: "blocker", title: `${adNotRepriced} addend${adNotRepriced > 1 ? "a" : "um"} not re-priced`, detail: "Scope changes need pricing updates", tab: "addenda" });
    if (deltaPct !== null && deltaPct > 5) items.push({ level: "blocker", title: `${deltaSF.toLocaleString()} SF gap in takeoff`, detail: `${Math.round(deltaPct)}% doesn't match plans`, tab: "takeoff" });
    else if (deltaPct !== null && deltaPct > 2) items.push({ level: "warning", title: `${deltaSF.toLocaleString()} SF takeoff gap`, tab: "takeoff" });
    if (expired > 0) items.push({ level: "blocker", title: `${expired} expired quote${expired > 1 ? "s" : ""}`, tab: "quotes" });
    if (expiring > 0) items.push({ level: "warning", title: `${expiring} quote${expiring > 1 ? "s" : ""} expiring soon`, tab: "quotes" });
    if (adNotReviewed > 0) items.push({ level: "warning", title: `${adNotReviewed} addend${adNotReviewed > 1 ? "a" : "um"} not reviewed`, tab: "addenda" });
    if (rPending > 0) items.push({ level: "info", title: `${rPending} RFI${rPending > 1 ? "s" : ""} awaiting response`, tab: "rfis" });
    if (clPct < 80) items.push({ level: clPct < 50 ? "blocker" : "warning", title: `Checklist ${clPct}% — ${clPending} items left`, tab: "checklist" });
    if (clRfi > 0) items.push({ level: "info", title: `${clRfi} checklist items flagged as RFI`, tab: "checklist" });
    if (mats.length === 0) items.push({ level: "warning", title: "Material Reconciliation: no items yet", tab: "materials" });
    else if (matUnpriced > 0) items.push({ level: "warning", title: `Material Reconciliation: ${matUnpriced} items missing pricing`, tab: "materials" });
    if (!pricingDone) items.push({ level: "warning", title: "Pricing not complete", tab: "pricing" });

    items.sort((a, b) => ({ blocker: 0, warning: 1, info: 2 }[a.level]) - ({ blocker: 0, warning: 1, info: 2 }[b.level]));

    const scores = {
      checklist: clPct,
      scope: scPct,
      takeoff: Math.round(deltaPct !== null ? Math.max(0, 100 - deltaPct * 10) : (controlSF > 0 ? 0 : 50)),
      pricing: pricingDone ? 100 : (bidAmt ? 50 : 0),
      materials: mats.length > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      quotes: qCount > 0 ? (expired === 0 ? (expiring === 0 ? 100 : 70) : 40) : 50,
      addenda: adCount > 0 ? (adNotRepriced === 0 && adNotReviewed === 0 ? 100 : 40) : 100,
      rfis: rCount > 0 ? (rPending === 0 ? 100 : 60) : 100,
    };
    const w = { checklist: 0.25, scope: 0.20, takeoff: 0.15, pricing: 0.15, materials: 0.10, quotes: 0.05, addenda: 0.05, rfis: 0.05 };
    const readiness = Math.round(Object.entries(w).reduce((s, [k, v]) => s + (scores[k as keyof typeof scores] ?? 0) * v, 0));
    const passes = [scPct >= 100, adCount === 0 || (adNotRepriced === 0 && adNotReviewed === 0), expired === 0 && expiring === 0, rPending === 0, clPct >= 80, mats.length > 0 && matUnpriced === 0, pricingDone].filter(Boolean).length;

    const remaining = {
      checklist: clPending,
      scope: scUnaddressed,
      takeoff: deltaPct !== null && deltaPct > 2 ? Math.round(deltaSF / 1000) + 1 : 0,
      materials: mats.length === 0 ? 1 : matUnpriced,
      pricing: pricingDone ? 0 : 1,
      quotes: expired + expiring,
      addenda: adNotReviewed + adNotRepriced,
      rfis: rPending,
    };

    // Labor Verification score
    const demoLaborTotal = 8, demoLaborVerified = 3;
    const taskList = isDemo ? Array.from({ length: demoLaborTotal }, (_, i) => ({ verified: i < demoLaborVerified })) : (laborTasks ?? []);
    const ltTotal = taskList.length;
    const ltVerified = taskList.filter((t: any) => t.verified).length;
    const laborScore = ltTotal === 0 ? 0 : ltVerified === 0 ? 25 : ltVerified === ltTotal ? 100 : Math.round((ltVerified / ltTotal) * 100);
    (scores as any).labor = laborScore;

    // Scope-Pricing conflict count (for sidebar badge)
    const scopeConflictCount = isDemo ? 1 : detectScopePricingConflicts({
      scopeItems: scopeItems ?? [],
      projectMaterials: projectMaterials ?? [],
      laborTasks: laborTasks ?? [],
      project: projectData,
    }).length;

    return { actionItems: items, readinessScore: readiness, passCount: passes, scores, remaining, scopeConflictCount };
  }, [isDemo, projectData, checklist, scopeItems, takeoffSections, projectMaterials, quotes, addenda, rfis, laborTasks]);

  const bidDeadlineMs = useMemo(() => {
    if (!projectData?.bidDate) return null;
    const bidTimeStr = (projectData as any)?.bidTime as string | undefined;
    if (bidTimeStr) {
      return new Date(`${projectData.bidDate}T${bidTimeStr}:00`).getTime();
    }
    return new Date(`${projectData.bidDate}T23:59:59`).getTime();
  }, [projectData]);

  if (!projectIdParam) return <div className="text-center py-20"><p style={{ color: "var(--bs-text-muted)" }}>No project selected.</p></div>;
  if (!isDemo && !projectData) return <div className="text-center py-20"><div style={{ color: "var(--bs-text-dim)", fontSize: "0.875rem" }}>Loading...</div></div>;

  const msUntilBid = bidDeadlineMs !== null ? bidDeadlineMs - nowMs : null;
  const hoursUntilBid = msUntilBid !== null ? msUntilBid / 3600000 : null;
  const daysUntilBid = msUntilBid !== null ? Math.ceil(msUntilBid / (1000 * 60 * 60 * 24)) : null;

  const activeWarning: "1h" | "4h" | "24h" | null = (() => {
    if (hoursUntilBid === null || hoursUntilBid <= 0) return null;
    if (hoursUntilBid <= 1 && !dismissedWarnings.has("1h")) return "1h";
    if (hoursUntilBid <= 4 && !dismissedWarnings.has("4h")) return "4h";
    if (hoursUntilBid <= 24 && !dismissedWarnings.has("24h")) return "24h";
    return null;
  })();

  function formatCountdown(ms: number): string {
    if (ms <= 0) return "Due now";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h >= 1) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const blockerCount = actionItems.filter(a => a.level === "blocker").length;
  const warnCount = actionItems.filter(a => a.level === "warning").length;
  const tabProps = {
    projectId: projectIdParam, isDemo, isPro, project: projectData, userId: userId ?? undefined, onNavigateTab: openTab,
    cachedData: isDemo ? undefined : { checklist: checklist ?? undefined, quotes: quotes ?? undefined, rfis: rfis ?? undefined, addenda: addenda ?? undefined, projectMaterials: projectMaterials ?? undefined, scopeItems: scopeItems ?? undefined, takeoffSections: takeoffSections ?? undefined },
  };
  const activeTabLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label;

  const sysId = (projectData as any)?.systemType;
  const assembly = (projectData as any)?.primaryAssembly;
  const sys = sysId ? getRoofSystem(sysId) : assembly ? getRoofSystemByAssembly(assembly) : undefined;
  const grossArea = (projectData as any)?.grossRoofArea;
  const bidAmt = (projectData as any)?.totalBidAmount;
  const dpsf = grossArea && bidAmt ? Math.round((bidAmt / grossArea) * 100) / 100 : null;

  const readinessColor = readinessScore >= 75 ? "var(--bs-teal)" : readinessScore >= 40 ? "var(--bs-amber)" : "var(--bs-red)";

  return (
    <>
    <div className="-m-6 flex" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Panel A — sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 230,
          minHeight: "calc(100vh - 4rem)",
          background: "var(--bs-bg-secondary)",
          borderRight: "1px solid var(--bs-border)",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bs-teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L12 4.5V9.5L7 13L2 9.5V4.5L7 1Z" stroke="#13151a" strokeWidth="1.8" fill="none"/><path d="M7 5V9M5 7H9" stroke="#13151a" strokeWidth="1.4"/></svg>
          </div>
          <span style={{ fontWeight: 500, fontSize: 15, color: "var(--bs-text-primary)", letterSpacing: "-0.3px" }}>BidShield</span>
        </div>

        {/* Project card */}
        <div style={{ padding: "0 12px 14px" }}>
          <div style={{ background: "var(--bs-bg-card)", borderRadius: 10, padding: "11px 13px", border: "1px solid var(--bs-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-primary)" }}>{projectData?.name}</span>
                {!isDemo && (
                  <button
                    onClick={openEditProject}
                    style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}
                    title="Edit project"
                  >
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                    </svg>
                  </button>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: readinessColor }}>{readinessScore}%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${readinessScore}%`, background: readinessColor, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>Bid readiness</span>
              {projectData?.location && <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>{projectData.location}</span>}
            </div>
          </div>
        </div>

        {/* Section nav with groups */}
        <nav className="flex-1 px-2 flex flex-col" style={{ fontSize: 13 }}>
          {[
            { label: "Review", ids: ["setup", "overview", "checklist", "scope", "takeoff", "materials"] },
            { label: "Pricing", ids: ["pricing", "labor", "generalconditions"] },
            { label: "Docs", ids: ["quotes", "addenda", "rfis", "bidquals", "validator", "decisions", "submission", "prebidmeetings"] },
          ].map(({ label: groupLabel, ids }) => (
            <div key={groupLabel}>
              <div style={{ fontSize: 10, color: "var(--bs-text-dim)", padding: "14px 10px 4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>
                {groupLabel}
              </div>
              {BROWSE_ITEMS.filter(b => ids.includes(b.id)).map(({ id, label, shortLabel }) => {
                const sectionScore = scores[id as keyof typeof scores];
                const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                const rawScore = sectionScore ?? (hasBlocker ? 0 : hasWarning ? 33 : undefined);
                const dot = rawScore !== undefined ? scoreDot(rawScore) : "var(--bs-text-dim)";
                const isActive = activeTab === id;
                const remainingCount = remaining[id as keyof typeof remaining] ?? 0;
                const showCount = sectionScore !== undefined && sectionScore > 0 && sectionScore < 100 && remainingCount > 0;

                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(isActive ? null : id)}
                    className="bs-nav-item w-full text-left"
                    style={isActive
                      ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500, border: "1px solid var(--bs-teal-border)" }
                      : { color: "var(--bs-text-muted)", border: "1px solid transparent" }
                    }
                  >
                    <NavIcon paths={NAV_ICONS[id]} />
                    <span style={{ flex: 1 }}>{shortLabel ?? label}</span>
                    {id === "labor" && unverifiedLaborCount !== null && unverifiedLaborCount !== undefined && unverifiedLaborCount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)", borderRadius: 9999, padding: "1px 5px", flexShrink: 0 }}>
                        {unverifiedLaborCount}
                      </span>
                    )}
                    {id === "scope" && scopeConflictCount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)", borderRadius: 9999, padding: "1px 5px", flexShrink: 0 }}>
                        {scopeConflictCount}
                      </span>
                    )}
                    {id === "bidquals" && unconfirmedGcFormCount !== null && unconfirmedGcFormCount !== undefined && unconfirmedGcFormCount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: "var(--bs-amber-dim)", color: "var(--bs-amber)", border: "1px solid var(--bs-amber-border)", borderRadius: 9999, padding: "1px 5px", flexShrink: 0 }}>
                        {unconfirmedGcFormCount}
                      </span>
                    )}
                    {showCount ? (
                      <span style={{ fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.06)", color: "var(--bs-text-dim)", borderRadius: 9999, padding: "1px 6px", flexShrink: 0 }}>
                        {remainingCount}
                      </span>
                    ) : (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Status summary */}
        <div className="px-3 pb-3 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Status</div>
          <div className="flex flex-wrap gap-1.5">
            {blockerCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 500, background: "var(--bs-red-dim)", color: "var(--bs-red)", padding: "3px 9px", borderRadius: 6, border: "1px solid var(--bs-red-border)" }}>
                {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
              </span>
            )}
            {warnCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 500, background: "var(--bs-amber-dim)", color: "var(--bs-amber)", padding: "3px 9px", borderRadius: 6, border: "1px solid var(--bs-amber-border)" }}>
                {warnCount} warning{warnCount > 1 ? "s" : ""}
              </span>
            )}
            {passCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 500, background: "var(--bs-teal-dim)", color: "var(--bs-teal)", padding: "3px 9px", borderRadius: 6, border: "1px solid var(--bs-teal-border)" }}>
                {passCount} passing
              </span>
            )}
            {blockerCount === 0 && warnCount === 0 && passCount === 0 && (
              <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>No issues yet</span>
            )}
          </div>
        </div>
      </aside>

      {/* Right side: breadcrumb + panels B + C */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── PROJECT COMMAND BAR ── always visible, carries full context across all tabs */}
        <div
          className="shrink-0 px-5"
          style={{ background: "var(--bs-bg-secondary)", borderBottom: "1px solid var(--bs-border)" }}
        >
          {/* Row 1 — breadcrumb */}
          <div className="flex items-center gap-1.5 pt-2.5 pb-1">
            <Link
              href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              className="flex items-center gap-0.5 transition-colors cursor-pointer"
              style={{ fontSize: 11, color: "var(--bs-text-muted)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Projects
            </Link>
            <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>/</span>
            <span
              style={{ fontSize: 11, color: activeTab ? "var(--bs-text-muted)" : "var(--bs-text-dim)", cursor: activeTab ? "pointer" : undefined, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onClick={activeTab ? () => setActiveTab(null) : undefined}
            >
              {projectData?.name ?? "Project"}
            </span>
            {activeTab && (
              <>
                <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>/</span>
                <span style={{ fontSize: 11, color: "var(--bs-text-dim)", fontWeight: 500 }}>{activeTabLabel}</span>
              </>
            )}
          </div>

          {/* Row 2 — project identity + key numbers + CTA */}
          <div className="flex items-center gap-0 pb-3 min-w-0">
            {/* Project name */}
            <div className="app-display mr-3 shrink-0" style={{ fontSize: 20, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {projectData?.name ?? "Project"}
            </div>

            {/* Status badge */}
            {(projectData as any)?.status && (projectData as any).status !== "in_progress" && (
              <span className="mr-3 shrink-0" style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 7px", borderRadius: 3,
                background: (projectData as any).status === "won" ? "var(--bs-teal-dim)" : (projectData as any).status === "lost" ? "var(--bs-red-dim)" : (projectData as any).status === "submitted" ? "var(--bs-blue-dim)" : "rgba(255,255,255,0.08)",
                color: (projectData as any).status === "won" ? "var(--bs-teal)" : (projectData as any).status === "lost" ? "var(--bs-red)" : (projectData as any).status === "submitted" ? "var(--bs-blue)" : "var(--bs-text-dim)",
              }}>
                {(projectData as any).status === "in_progress" ? "Active" : (projectData as any).status?.replace("_", " ")}
              </span>
            )}

            {/* Divider */}
            <div className="mr-4 shrink-0" style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />

            {/* Key numbers inline */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {grossArea ? (
                <span style={{ fontSize: 13, color: "var(--bs-text-muted)", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--bs-text-secondary)", fontWeight: 600 }}>{grossArea >= 1000 ? `${(grossArea/1000).toFixed(0)}K` : grossArea.toLocaleString()}</span>
                  <span style={{ color: "var(--bs-text-dim)", marginLeft: 3 }}>SF</span>
                </span>
              ) : null}
              {bidAmt ? (
                <span style={{ fontSize: 13, color: "var(--bs-text-muted)", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--bs-text-secondary)", fontWeight: 600 }}>${bidAmt >= 1_000_000 ? `${(bidAmt/1_000_000).toFixed(2)}M` : bidAmt >= 1000 ? `${(bidAmt/1000).toFixed(0)}K` : bidAmt.toLocaleString()}</span>
                  <span style={{ color: "var(--bs-text-dim)", marginLeft: 3 }}>bid</span>
                </span>
              ) : null}
              {dpsf ? (
                <span style={{ fontSize: 13, color: "var(--bs-text-muted)", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--bs-text-secondary)", fontWeight: 600 }}>${dpsf.toFixed(2)}</span>
                  <span style={{ color: "var(--bs-text-dim)", marginLeft: 3 }}>/SF</span>
                </span>
              ) : null}
              {projectData?.location && (
                <span style={{ fontSize: 12, color: "var(--bs-text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                  {[projectData.location, (projectData as any)?.gc].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            {/* Right: countdown + readiness + CTA */}
            <div className="flex items-center gap-2.5 shrink-0 ml-4">
              {/* Bid countdown */}
              {msUntilBid !== null && (
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 6,
                  background: msUntilBid <= 0 ? "var(--bs-red-dim)" : hoursUntilBid! <= 24 ? "var(--bs-amber-dim)" : "var(--bs-teal-dim)",
                  color: msUntilBid <= 0 ? "var(--bs-red)" : hoursUntilBid! <= 24 ? "var(--bs-amber)" : "var(--bs-teal)",
                  border: `1px solid ${msUntilBid <= 0 ? "var(--bs-red-border)" : hoursUntilBid! <= 24 ? "var(--bs-amber-border)" : "var(--bs-teal-border)"}`,
                  fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                }}>
                  {msUntilBid <= 0 ? "Past due" : (daysUntilBid ?? 0) > 1 ? `${daysUntilBid}d to bid` : formatCountdown(msUntilBid!)}
                </div>
              )}

              {/* Readiness */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ width: 28, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${readinessScore}%`, background: readinessColor, borderRadius: 9999, transition: "width 0.4s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: readinessColor, fontVariantNumeric: "tabular-nums" }}>{readinessScore}%</span>
              </div>

              {/* Primary CTA */}
              {(projectData as any)?.status === "submitted" ? (
                <button
                  onClick={() => { setOutcomeForm({ result: null, competitorName: "", competitorPrice: "", lossReason: "" }); setOutcomeModalOpen(true); }}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 6, background: "var(--bs-teal)", color: "#13151a", border: "none", whiteSpace: "nowrap" }}
                >
                  Record Outcome →
                </button>
              ) : (projectData as any)?.status === "won" ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-teal)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={13} height={13} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Won
                </span>
              ) : (projectData as any)?.status === "lost" ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-red)" }}>Lost</span>
              ) : (
                <button
                  onClick={() => openTab("validator")}
                  className="cursor-pointer transition-all hover:opacity-90"
                  style={{
                    fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 6, border: "none", whiteSpace: "nowrap",
                    background: blockerCount > 0 ? "rgba(239,68,68,0.12)" : "var(--bs-teal)",
                    color: blockerCount > 0 ? "var(--bs-red)" : "#13151a",
                  }}
                >
                  {blockerCount > 0 ? `${blockerCount} blocker${blockerCount !== 1 ? "s" : ""} · Fix` : "Validate →"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Deadline warning banner */}
        {activeWarning && (
          <div style={{
            background: activeWarning === "1h" ? "var(--bs-red-dim)" : "var(--bs-amber-dim)",
            borderBottom: `1px solid ${activeWarning === "1h" ? "var(--bs-red-border)" : "var(--bs-amber-border)"}`,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: activeWarning === "1h" ? "var(--bs-red)" : "var(--bs-amber)", display: "flex", alignItems: "center" }}>
                {activeWarning === "1h" ? (
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                ) : (
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                )}
              </span>
              <div>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: activeWarning === "1h" ? "var(--bs-red)" : "var(--bs-amber)",
                }}>
                  {activeWarning === "1h"
                    ? "Less than 1 hour until bid deadline!"
                    : activeWarning === "4h"
                    ? "Less than 4 hours until bid deadline"
                    : "Bid deadline in less than 24 hours"}
                </span>
                {msUntilBid !== null && msUntilBid > 0 && (
                  <span style={{ fontSize: 12, color: activeWarning === "1h" ? "var(--bs-red)" : "var(--bs-amber)", marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
                    ({formatCountdown(msUntilBid)} remaining)
                  </span>
                )}
                {blockerCount > 0 && (
                  <span style={{ fontSize: 12, color: "var(--bs-text-dim)", marginLeft: 8 }}>
                    · {blockerCount} blocker{blockerCount > 1 ? "s" : ""} unresolved
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setDismissedWarnings(s => new Set([...s, activeWarning]))}
              className="transition-colors duration-150 cursor-pointer shrink-0 p-1 rounded"
              style={{ color: "var(--bs-text-dim)", background: "none", border: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Panels B + C */}
        <div className="flex-1 flex overflow-hidden">

          {/* Panel B — main content, #f8fafc bg */}
          <main className="flex-1 overflow-auto min-w-0" style={{ background: "var(--bs-bg-page)" }}>
            {activeTab ? (
              <>
                {/* Tab section header — minimal, just a label */}
                <div
                  className="px-6 flex items-center gap-3 sticky top-0 z-10"
                  style={{ background: "var(--bs-bg-page)", height: 44, borderBottom: "1px solid var(--bs-border)" }}
                >
                  <button
                    onClick={() => setActiveTab(null)}
                    className="flex items-center gap-1 lg:hidden cursor-pointer"
                    style={{ fontSize: 12, color: "var(--bs-text-dim)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                  <h2 className="app-display" style={{ fontSize: 13, fontWeight: 700, color: "var(--bs-text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{activeTabLabel}</h2>
                </div>
                <div className="p-6">
                  {activeTab === "setup"    && <TabErrorBoundary tabLabel="Setup"><SetupTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "overview"  && <TabErrorBoundary tabLabel="Overview"><OverviewTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "checklist" && <TabErrorBoundary tabLabel="Checklist"><ChecklistTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "takeoff"   && <TabErrorBoundary tabLabel="Takeoff"><TakeoffTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "pricing"   && <TabErrorBoundary tabLabel="Pricing"><PricingTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "materials" && <TabErrorBoundary tabLabel="Materials"><MaterialsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "scope"     && <TabErrorBoundary tabLabel="Scope"><ScopeTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "quotes"    && <TabErrorBoundary tabLabel="Quotes"><QuotesTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "rfis"      && <TabErrorBoundary tabLabel="RFIs"><RFIsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "addenda"   && <TabErrorBoundary tabLabel="Addenda"><AddendaTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "labor"              && <TabErrorBoundary tabLabel="Labor"><LaborTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "generalconditions" && <TabErrorBoundary tabLabel="Gen. Conds"><GeneralConditionsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "validator"         && <TabErrorBoundary tabLabel="Validator"><ValidatorTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "bidquals"  && <TabErrorBoundary tabLabel="Bid Quals"><BidQualsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "decisions" && <TabErrorBoundary tabLabel="Decision Log"><DecisionLogTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "submission"     && <TabErrorBoundary tabLabel="Submission"><SubmissionTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "prebidmeetings" && <TabErrorBoundary tabLabel="Pre-Bid Meetings"><PreBidMeetingsTab {...tabProps} /></TabErrorBoundary>}
                </div>
              </>
            ) : (
              /* Overview */
              <div className="p-6 max-w-2xl">
                {/* Mobile section nav */}
                <div className="lg:hidden flex flex-wrap gap-2 mb-6">
                  {BROWSE_ITEMS.map(({ id, label, shortLabel }) => {
                    const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                    const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                    const dot = hasBlocker ? "var(--bs-red)" : hasWarning ? "var(--bs-amber)" : "var(--bs-teal)";
                    return (
                      <button
                        key={id}
                        onClick={() => openTab(id)}
                        className="flex items-center gap-1.5 transition-all active:scale-95"
                        style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 8, padding: "8px 12px" }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bs-text-secondary)" }}>{shortLabel ?? label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bid deadline countdown card */}
                {msUntilBid !== null && (
                  <div style={{
                    background: msUntilBid <= 0 ? "var(--bs-red-dim)" : hoursUntilBid! <= 4 ? "var(--bs-red-dim)" : hoursUntilBid! <= 24 ? "var(--bs-amber-dim)" : "var(--bs-bg-card)",
                    borderRadius: 10,
                    padding: "16px 20px",
                    marginBottom: 16,
                    border: `1px solid ${msUntilBid <= 0 ? "var(--bs-red-border)" : hoursUntilBid! <= 4 ? "var(--bs-red-border)" : hoursUntilBid! <= 24 ? "var(--bs-amber-border)" : "var(--bs-border)"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Bid Deadline
                        </div>
                        <div style={{
                          fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1,
                          color: msUntilBid <= 0 ? "var(--bs-red)" : hoursUntilBid! <= 4 ? "var(--bs-red)" : hoursUntilBid! <= 24 ? "var(--bs-amber)" : "var(--bs-text-primary)",
                          letterSpacing: "-0.02em",
                        }}>
                          {msUntilBid <= 0 ? "Past due" : formatCountdown(msUntilBid)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--bs-text-dim)", marginTop: 4 }}>
                          {projectData?.bidDate
                            ? (() => {
                                const bidTimeStr = (projectData as any)?.bidTime as string | undefined;
                                const dateLabel = new Date(`${projectData.bidDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                                return bidTimeStr ? `${dateLabel} at ${bidTimeStr}` : dateLabel;
                              })()
                            : "No deadline set"
                          }
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {blockerCount > 0 && (
                          <div style={{
                            fontSize: 12, fontWeight: 700, color: "var(--bs-red)",
                            background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)",
                            borderRadius: 6, padding: "4px 10px", marginBottom: 6,
                          }}>
                            {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
                          </div>
                        )}
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: readinessScore >= 80 ? "var(--bs-teal)" : readinessScore >= 50 ? "var(--bs-amber)" : "var(--bs-red)",
                          background: readinessScore >= 80 ? "var(--bs-teal-dim)" : readinessScore >= 50 ? "var(--bs-amber-dim)" : "var(--bs-red-dim)",
                          border: `1px solid ${readinessScore >= 80 ? "var(--bs-teal-border)" : readinessScore >= 50 ? "var(--bs-amber-border)" : "var(--bs-red-border)"}`,
                          borderRadius: 6, padding: "4px 10px",
                        }}>
                          {readinessScore}% ready
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action items */}
                {actionItems.length === 0 ? (
                  <div style={{ background: "var(--bs-bg-card)", borderRadius: 12, padding: "2rem", textAlign: "center", border: "1px solid var(--bs-teal-border)" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bs-teal-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bs-teal)", marginBottom: 4 }}>Bid ready to submit</div>
                    <div style={{ fontSize: 13, color: "var(--bs-text-dim)", marginBottom: 18 }}>All sections are complete and passing.</div>
                    <button
                      onClick={() => openTab("validator")}
                      style={{ padding: "10px 24px", background: "var(--bs-teal)", color: "#13151a", fontSize: 14, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "none" }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      Review & Export →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--bs-text-dim)" }}>
                        {blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} · ` : ""}
                        {actionItems.length} need attention
                      </h2>
                      {passCount > 0 && (
                        <span style={{ fontSize: 12, color: "var(--bs-text-muted)" }}>{passCount} passing</span>
                      )}
                    </div>
                    {actionItems.map((item, i) => (
                      <button
                        key={`${item.tab}-${i}`}
                        onClick={() => openTab(item.tab)}
                        className="w-full text-left transition-all duration-150 active:scale-[0.98] rounded-xl cursor-pointer"
                        style={{
                          background: item.level === "blocker" ? "var(--bs-red-dim)" : item.level === "warning" ? "var(--bs-amber-dim)" : "var(--bs-blue-dim)",
                          borderRadius: 10,
                          padding: 16,
                          borderLeft: `4px solid ${item.level === "blocker" ? "var(--bs-red)" : item.level === "warning" ? "var(--bs-amber)" : "var(--bs-blue)"}`,
                          border: `1px solid ${item.level === "blocker" ? "var(--bs-red-border)" : item.level === "warning" ? "var(--bs-amber-border)" : "var(--bs-blue-dim)"}`,
                          borderLeftWidth: 4,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-primary)" }}>{item.title}</div>
                            {item.detail && <div style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>{item.detail}</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{
                              background: item.level === "blocker" ? "var(--bs-red-dim)" : item.level === "warning" ? "var(--bs-amber-dim)" : "var(--bs-blue-dim)",
                              color: item.level === "blocker" ? "var(--bs-red)" : item.level === "warning" ? "var(--bs-amber)" : "var(--bs-blue)",
                            }}>
                              {item.level === "blocker" ? "Fix" : item.level === "warning" ? "Review" : "Info"}
                            </span>
                            <svg className="w-4 h-4" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section Progress */}
                <div style={{ marginTop: 32 }}>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--bs-text-dim)" }}>
                    Section Progress
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {BROWSE_ITEMS.map(({ id, label }) => {
                      const score = scores[id as keyof typeof scores];
                      if (score === undefined) return null;
                      const dot = scoreDot(score);
                      return (
                        <button key={id} onClick={() => openTab(id)} className="flex items-center gap-3 group">
                          <span
                            className="truncate"
                            style={{ fontSize: 12, color: "var(--bs-text-muted)", width: 140, textAlign: "left", flexShrink: 0 }}
                          >
                            {label}
                          </span>
                          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${score}%`, background: score >= 75 ? "var(--bs-teal)" : score >= 25 ? "var(--bs-amber)" : "var(--bs-red)", borderRadius: 9999, transition: "width 0.5s" }} />
                          </div>
                          {/* Dot indicator */}
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                          {/* % in gray, no color */}
                          <span style={{ fontSize: 12, color: "var(--bs-text-muted)", width: 32, textAlign: "right", flexShrink: 0 }}>
                            {score}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile bottom bar — readiness + validate */}
            <div
              className="lg:hidden sticky bottom-0 z-20 flex items-center justify-between gap-3 px-4 py-3"
              style={{ background: "var(--bs-bg-secondary)", borderTop: "1px solid var(--bs-border)" }}
            >
              <div className="flex items-center gap-2">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bs-teal-dim)", border: `2px solid ${readinessColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: readinessColor }}>{readinessScore}%</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--bs-text-primary)" }}>Bid Readiness</div>
                  <div style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>{blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""}` : actionItems.length > 0 ? `${actionItems.length} to review` : "Looking good"}</div>
                </div>
              </div>
              <button
                onClick={() => openTab("validator")}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: blockerCount > 0 ? "rgba(255,255,255,0.06)" : "var(--bs-teal)",
                  color: blockerCount > 0 ? "var(--bs-text-dim)" : "#13151a",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {blockerCount > 0 ? `Fix ${blockerCount}` : "Validate →"}
              </button>
            </div>
          </main>


        </div>
      </div>
    </div>

    {/* Floating Log Decision button — shown on any section tab except decisions itself */}
    {activeTab && activeTab !== "decisions" && (
      (() => {
        const sectionLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label ?? activeTab;
        const sectionCount = isDemo ? 0 : (decisions ?? []).filter((d: any) => d.section === sectionLabel).length;
        const totalDecisions = isDemo ? 0 : (decisions ?? []).length;
        const atLimit = !isPro && totalDecisions >= 5;
        return atLimit ? (
          <a
            href="/bidshield/pricing"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: "var(--bs-bg-card)",
              border: "1px solid var(--bs-border)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--bs-text-dim)",
              textDecoration: "none",
            }}
          >
            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
            Decision Log (5/5) · Upgrade
          </a>
        ) : (
          <button
            onClick={() => setDecisionModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            style={{
              background: "var(--bs-bg-card)",
              border: "1px solid var(--bs-border)",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--bs-text-secondary)",
              cursor: "pointer",
            }}
          >
            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Log Decision{sectionCount > 0 ? ` (${sectionCount})` : ""}
          </button>
        );
      })()
    )}

    {/* Decision Modal */}
    {decisionModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={() => setDecisionModalOpen(false)}
      >
        <div
          className="w-full sm:max-w-md mx-0 sm:mx-4 sm:rounded-xl"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: "12px 12px 0 0", padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--bs-text-primary)" }}>Log a Decision</h3>
            <button
              onClick={() => setDecisionModalOpen(false)}
              style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-dim)"}
            >
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Section (auto-filled, read-only) */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Section</label>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-secondary)", background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "8px 10px" }}>
                {BROWSE_ITEMS.find(b => b.id === activeTab)?.label ?? activeTab}
              </div>
            </div>

            {/* What was decided */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>What was decided <span style={{ color: "var(--bs-red)" }}>*</span></label>
              <textarea
                autoFocus
                rows={3}
                placeholder="e.g. Changed mech flashing labor from LF to EA per field team discussion"
                value={decisionText}
                onChange={e => setDecisionText(e.target.value)}
                style={{
                  width: "100%", fontSize: 13, border: "1px solid var(--bs-border)", borderRadius: 6,
                  padding: "8px 10px", color: "var(--bs-text-primary)", outline: "none", resize: "none",
                  boxSizing: "border-box", lineHeight: 1.5, background: "var(--bs-bg-elevated)",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--bs-teal)")}
                onBlur={e => (e.target.style.borderColor = "var(--bs-border)")}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit(); }}
              />
            </div>

            {/* Who */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Who <span style={{ color: "var(--bs-text-dim)", fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Per John / PM, Per pre-bid meeting"
                value={decisionWho}
                onChange={e => setDecisionWho(e.target.value)}
                style={{
                  width: "100%", fontSize: 13, border: "1px solid var(--bs-border)", borderRadius: 6,
                  padding: "8px 10px", color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box",
                  background: "var(--bs-bg-elevated)",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--bs-teal)")}
                onBlur={e => (e.target.style.borderColor = "var(--bs-border)")}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              disabled={!decisionText.trim()}
              onClick={async () => {
                if (!decisionText.trim()) return;
                const sectionLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label ?? (activeTab ?? "General");
                if (isDemo) {
                  // demo: just close
                } else if (isValidConvexId && userId) {
                  await addDecision({
                    projectId: projectIdParam as Id<"bidshield_projects">,
                    userId,
                    text: decisionText.trim(),
                    who: decisionWho.trim() || undefined,
                    section: sectionLabel,
                  });
                }
                setDecisionText("");
                setDecisionWho("");
                setDecisionModalOpen(false);
              }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: decisionText.trim() ? "var(--bs-teal)" : "rgba(255,255,255,0.06)",
                color: decisionText.trim() ? "#13151a" : "var(--bs-text-dim)",
                border: "none", cursor: decisionText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Save Decision
            </button>
            <button
              onClick={() => setDecisionModalOpen(false)}
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "1px solid var(--bs-border)", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Outcome Modal */}
    {outcomeModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={() => setOutcomeModalOpen(false)}
      >
        <div
          className="rounded-xl w-full max-w-md mx-4"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--bs-text-primary)", marginBottom: 6 }}>Did you win this bid?</h3>
          <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginBottom: 20 }}>{(projectData as any)?.name}</p>

          {/* Outcome buttons */}
          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            {([
              { label: "Won", value: "won" as const, bg: "var(--bs-teal-dim)", border: "var(--bs-teal)", color: "var(--bs-teal)" },
              { label: "Lost", value: "lost" as const, bg: "var(--bs-red-dim)", border: "var(--bs-red)", color: "var(--bs-red)" },
              { label: "No Award", value: "no_award" as const, bg: "rgba(255,255,255,0.04)", border: "var(--bs-text-dim)", color: "var(--bs-text-secondary)" },
              { label: "Still Pending", value: "pending" as const, bg: "var(--bs-amber-dim)", border: "var(--bs-amber)", color: "var(--bs-amber)" },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOutcomeForm(f => ({ ...f, result: opt.value }))}
                style={{
                  padding: "14px 0",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: outcomeForm.result === opt.value ? 700 : 500,
                  border: outcomeForm.result === opt.value ? `2px solid ${opt.border}` : "1px solid var(--bs-border)",
                  background: outcomeForm.result === opt.value ? opt.bg : "var(--bs-bg-elevated)",
                  color: outcomeForm.result === opt.value ? opt.color : "var(--bs-text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Lost — competitor fields */}
          {outcomeForm.result === "lost" && (
            <div className="flex flex-col gap-3" style={{ marginBottom: 20, padding: 14, background: "var(--bs-red-dim)", borderRadius: 8, border: "1px solid var(--bs-red-border)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--bs-red)", marginBottom: 2 }}>Loss details (optional but valuable)</p>
              <div>
                <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Who won? (competitor name)</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Roofing"
                  value={outcomeForm.competitorName}
                  onChange={e => setOutcomeForm(f => ({ ...f, competitorName: e.target.value }))}
                  style={{ width: "100%", border: "1px solid var(--bs-red-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box", background: "var(--bs-bg-elevated)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--bs-red)")}
                  onBlur={e => (e.target.style.borderColor = "var(--bs-red-border)")}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Their bid price ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 480000"
                  value={outcomeForm.competitorPrice}
                  onChange={e => setOutcomeForm(f => ({ ...f, competitorPrice: e.target.value }))}
                  style={{ width: "100%", border: "1px solid var(--bs-red-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box", background: "var(--bs-bg-elevated)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--bs-red)")}
                  onBlur={e => (e.target.style.borderColor = "var(--bs-red-border)")}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Loss reason</label>
                <select
                  value={outcomeForm.lossReason}
                  onChange={e => setOutcomeForm(f => ({ ...f, lossReason: e.target.value }))}
                  style={{ width: "100%", border: "1px solid var(--bs-red-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", background: "var(--bs-bg-elevated)", boxSizing: "border-box" }}
                >
                  <option value="">Select reason...</option>
                  <option value="Price too high">Price too high</option>
                  <option value="GC preference">GC preference</option>
                  <option value="Scope issue">Scope issue</option>
                  <option value="Relationship">Relationship</option>
                  <option value="No bid bond">No bid bond</option>
                  <option value="Timeline conflict">Timeline conflict</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={saveOutcome}
              disabled={!outcomeForm.result}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                background: outcomeForm.result ? "var(--bs-teal)" : "rgba(255,255,255,0.06)",
                color: outcomeForm.result ? "#13151a" : "var(--bs-text-dim)",
                border: "none",
                cursor: outcomeForm.result ? "pointer" : "not-allowed",
              }}
            >
              Save Outcome
            </button>
            <button
              onClick={() => setOutcomeModalOpen(false)}
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "1px solid var(--bs-border)", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Project Modal */}
    {editProjectOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={() => setEditProjectOpen(false)}
      >
        <div
          className="rounded-xl w-full max-w-md mx-4"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--bs-text-primary)", marginBottom: 20 }}>Edit Project</h3>
          <div className="flex flex-col gap-3">
            {([
              { label: "Project Name", key: "name", type: "text" },
              { label: "General Contractor", key: "gc", type: "text" },
              { label: "Location", key: "location", type: "text" },
              { label: "Gross Roof Area (SF)", key: "sqft", type: "number" },
              { label: "Bid Amount ($)", key: "totalBidAmount", type: "number" },
            ] as { label: string; key: keyof typeof editProjectForm; type: string }[]).map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>{label}</label>
                <input
                  type={type}
                  value={editProjectForm[key] as string}
                  onChange={e => setEditProjectForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", border: "1px solid var(--bs-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box", background: "var(--bs-bg-elevated)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--bs-teal)")}
                  onBlur={e => (e.target.style.borderColor = "var(--bs-border)")}
                />
              </div>
            ))}
            {/* Bid deadline — date + time on one row */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Bid Deadline</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={editProjectForm.bidDate}
                  onChange={e => setEditProjectForm(f => ({ ...f, bidDate: e.target.value }))}
                  style={{ flex: 2, border: "1px solid var(--bs-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box", background: "var(--bs-bg-elevated)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--bs-teal)")}
                  onBlur={e => (e.target.style.borderColor = "var(--bs-border)")}
                />
                <input
                  type="time"
                  value={editProjectForm.bidTime}
                  onChange={e => setEditProjectForm(f => ({ ...f, bidTime: e.target.value }))}
                  placeholder="Time (optional)"
                  style={{ flex: 1, border: "1px solid var(--bs-border)", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "var(--bs-text-primary)", outline: "none", boxSizing: "border-box", background: "var(--bs-bg-elevated)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--bs-teal)")}
                  onBlur={e => (e.target.style.borderColor = "var(--bs-border)")}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 4 }}>Time is optional — enables hour/minute countdown on bid day</div>
            </div>
            {/* FM Global toggle */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 6, display: "block" }}>FM Global Insured?</label>
              <div className="flex gap-2">
                {([{ label: "Unknown", value: null }, { label: "No", value: false }, { label: "Yes", value: true }] as { label: string; value: boolean | null }[]).map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setEditProjectForm(f => ({ ...f, fmGlobal: opt.value }))}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: editProjectForm.fmGlobal === opt.value ? 600 : 400,
                      border: editProjectForm.fmGlobal === opt.value
                        ? (opt.value === true ? "2px solid var(--bs-teal)" : opt.value === false ? "2px solid var(--bs-text-dim)" : "2px solid var(--bs-border)")
                        : "1px solid var(--bs-border)",
                      background: editProjectForm.fmGlobal === opt.value
                        ? (opt.value === true ? "var(--bs-teal-dim)" : "rgba(255,255,255,0.06)")
                        : "var(--bs-bg-elevated)",
                      color: editProjectForm.fmGlobal === opt.value
                        ? (opt.value === true ? "var(--bs-teal)" : "var(--bs-text-secondary)")
                        : "var(--bs-text-dim)",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.fmGlobal === true && (
                <p style={{ fontSize: 11, color: "var(--bs-teal)", marginTop: 5 }}>3 FM Global checklist items will appear in Specification Review</p>
              )}
            </div>
            {/* Pre-1990 toggle */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 6, display: "block" }}>Building constructed before 1990?</label>
              <div className="flex gap-2">
                {([{ label: "Unknown", value: null }, { label: "No", value: false }, { label: "Yes", value: true }] as { label: string; value: boolean | null }[]).map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setEditProjectForm(f => ({ ...f, pre1990: opt.value }))}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: editProjectForm.pre1990 === opt.value ? 600 : 400,
                      border: editProjectForm.pre1990 === opt.value
                        ? (opt.value === true ? "2px solid var(--bs-amber)" : opt.value === false ? "2px solid var(--bs-text-dim)" : "2px solid var(--bs-border)")
                        : "1px solid var(--bs-border)",
                      background: editProjectForm.pre1990 === opt.value
                        ? (opt.value === true ? "var(--bs-amber-dim)" : "rgba(255,255,255,0.06)")
                        : "var(--bs-bg-elevated)",
                      color: editProjectForm.pre1990 === opt.value
                        ? (opt.value === true ? "var(--bs-amber)" : "var(--bs-text-secondary)")
                        : "var(--bs-text-dim)",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.pre1990 === true && (
                <p style={{ fontSize: 11, color: "var(--bs-amber)", marginTop: 5 }} className="flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                  DSS warning item will appear in Architectural Review checklist
                </p>
              )}
            </div>
            {/* Energy code toggle */}
            <div>
              <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 4, display: "block" }}>Replaces &gt;50% of roof area or &gt;2,000 SF?</label>
              <p style={{ fontSize: 11, color: "var(--bs-text-dim)", marginBottom: 6 }}>Triggers energy code compliance requirement (ASHRAE 90.1)</p>
              <div className="flex gap-2">
                {([{ label: "Unknown", value: null }, { label: "No", value: false }, { label: "Yes", value: true }] as { label: string; value: boolean | null }[]).map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setEditProjectForm(f => ({ ...f, energyCode: opt.value }))}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: editProjectForm.energyCode === opt.value ? 600 : 400,
                      border: editProjectForm.energyCode === opt.value
                        ? (opt.value === true ? "2px solid var(--bs-blue)" : opt.value === false ? "2px solid var(--bs-text-dim)" : "2px solid var(--bs-border)")
                        : "1px solid var(--bs-border)",
                      background: editProjectForm.energyCode === opt.value
                        ? (opt.value === true ? "var(--bs-blue-dim)" : "rgba(255,255,255,0.06)")
                        : "var(--bs-bg-elevated)",
                      color: editProjectForm.energyCode === opt.value
                        ? (opt.value === true ? "var(--bs-blue)" : "var(--bs-text-secondary)")
                        : "var(--bs-text-dim)",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.energyCode === true && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--bs-text-muted)", marginBottom: 6, display: "block" }}>ASHRAE Climate Zone</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map(z => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setEditProjectForm(f => ({ ...f, climateZone: f.climateZone === z ? "" : z }))}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: editProjectForm.climateZone === z ? 700 : 400,
                          border: editProjectForm.climateZone === z ? "2px solid var(--bs-blue)" : "1px solid var(--bs-border)",
                          background: editProjectForm.climateZone === z ? "var(--bs-blue-dim)" : "var(--bs-bg-elevated)",
                          color: editProjectForm.climateZone === z ? "var(--bs-blue)" : "var(--bs-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--bs-blue)", marginTop: 5 }}>Energy code item will appear in Specification Review</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3" style={{ marginTop: 20 }}>
            <button
              onClick={saveEditProject}
              style={{ flex: 1, background: "var(--bs-teal)", color: "#13151a", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}
            >
              Save
            </button>
            <button
              onClick={() => setEditProjectOpen(false)}
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "1px solid var(--bs-border)", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div style={{ color: "var(--bs-text-dim)", fontSize: "0.875rem" }}>Loading...</div></div>}>
      <ProjectDetail />
    </Suspense>
  );
}
