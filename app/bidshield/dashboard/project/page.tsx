"use client";

import React, { Suspense, useMemo, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

import { getRoofSystem, getRoofSystemByAssembly } from "@/lib/bidshield/roof-systems";
import { detectScopePricingConflicts } from "@/lib/bidshield/scopePricingConflicts";

import type { TabId } from "./tab-types";
import { PHASES, getPhaseIndex } from "./tab-types";
import {
  ChecklistTab, ValidatorTab,
  SetupTab, EstimateTab, DocumentsTab, BidQualsTab, SubmissionTab,
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
  setup:     <><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.2 4.2l1.4 1.4M10.4 10.4l1.4 1.4M4.2 11.8l1.4-1.4M10.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/></>,
  documents: <><path d="M4 3h5l3 3v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M6 8h4M6 11h3M9 3v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  checklist: <><path d="M4 3h8a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>,
  validate:  <><path d="M8 2l1.8 3.6L14 6.5l-3 2.9.7 4.1L8 11.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></>,
  submit:    <><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
};

// 5 preflight phases — drives the overview card grid and breadcrumb
const BROWSE_ITEMS: { id: TabId; label: string; shortLabel?: string }[] = [
  { id: "setup",     label: "Intake" },
  { id: "documents", label: "Read" },
  { id: "checklist", label: "Verify" },
  { id: "validate",  label: "Validate" },
  { id: "submit",    label: "Submit" },
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
  // Map legacy/sub-tab IDs to the 5-phase preflight structure
  const navigateTab = useCallback((tab: TabId) => {
    const documentSubTabs: TabId[] = ["scope", "addenda", "rfis", "quotes"];
    const validateSubTabs: TabId[] = ["validator", "decisions", "bidquals"];
    const legacyEstimateTabs: TabId[] = ["estimate", "takeoff", "materials", "pricing", "labor", "generalconditions"];
    if (documentSubTabs.includes(tab)) { setActiveTab("documents"); return; }
    if (validateSubTabs.includes(tab)) { setActiveTab("validate"); return; }
    if (legacyEstimateTabs.includes(tab)) { setActiveTab("validate"); return; }
    if (tab === "overview") { setActiveTab("setup"); return; }
    setActiveTab(tab);
  }, []);
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
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── Keyboard shortcuts (L-17) ──────────────────────────────────────────────
  const TAB_ORDER: TabId[] = useMemo(() => [
    "setup", "documents", "checklist", "validate", "submit",
  ], []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs / textareas / contenteditable
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Backspace → block browser back-navigation when not in an input
      if (e.key === "Backspace") { e.preventDefault(); return; }
      // ? → toggle shortcut help
      if (e.key === "?") { e.preventDefault(); setShowShortcuts(s => !s); return; }
      // Escape → close shortcut help or close modals
      if (e.key === "Escape") { setShowShortcuts(false); return; }
      // [ / ] → prev / next tab
      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        const idx = activeTab ? TAB_ORDER.indexOf(activeTab) : -1;
        const next = e.key === "]"
          ? TAB_ORDER[Math.min(idx + 1, TAB_ORDER.length - 1)]
          : TAB_ORDER[Math.max(idx - 1, 0)];
        if (next) setActiveTab(next);
        return;
      }
      // 1-9 → jump to tab by position (1=overview, 2=setup, ...)
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9 && num <= TAB_ORDER.length) {
        e.preventDefault();
        setActiveTab(TAB_ORDER[num - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, TAB_ORDER]);

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
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
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
    const scPct = scTotal > 0 ? Math.round(((scTotal - scUnaddressed) / scTotal) * 100) : 0;

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
      takeoff: Math.round(deltaPct !== null ? Math.max(0, 100 - deltaPct * 10) : 0),
      pricing: pricingDone ? 100 : (bidAmt ? 50 : 0),
      materials: mats.length > 0 ? (matUnpriced === 0 ? 100 : 60) : 0,
      addenda: adCount > 0 ? (adNotRepriced === 0 && adNotReviewed === 0 ? 100 : 40) : 0,
      rfis: rCount > 0 ? (rPending === 0 ? 100 : 60) : 0,
      bidquals: (() => {
        const bqRawInner = Array.isArray(bidQuals) ? bidQuals : bidQuals ? [bidQuals] : [];
        const bqTotalInner = isDemo ? 3 : bqRawInner.length;
        if (bqTotalInner === 0) return 0;
        const bqUnconfirmedInner = isDemo ? 1 : (unconfirmedGcFormCount ?? 0);
        const bqConfirmedInner = Math.max(0, bqTotalInner - bqUnconfirmedInner);
        return Math.round((bqConfirmedInner / bqTotalInner) * 100);
      })(),
    };
    const w = { checklist: 0.25, scope: 0.20, takeoff: 0.15, pricing: 0.15, materials: 0.10, bidquals: 0.05, addenda: 0.05, rfis: 0.05 };
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
    const laborScore = ltTotal === 0 ? 0 : ltVerified === 0 ? 0 : ltVerified === ltTotal ? 100 : Math.round((ltVerified / ltTotal) * 100);
    (scores as any).labor = laborScore;

    // Scope-Pricing conflict count (for sidebar badge)
    const scopeConflictCount = isDemo ? 1 : detectScopePricingConflicts({
      scopeItems: scopeItems ?? [],
      projectMaterials: projectMaterials ?? [],
      laborTasks: laborTasks ?? [],
      project: projectData,
    }).length;

    return { actionItems: items, readinessScore: readiness, passCount: passes, scores, remaining, scopeConflictCount };
  }, [isDemo, projectData, checklist, scopeItems, takeoffSections, projectMaterials, quotes, addenda, rfis, laborTasks, bidQuals, unconfirmedGcFormCount]);

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
    projectId: projectIdParam, isDemo, isPro, project: projectData, userId: userId ?? undefined, onNavigate: navigateTab, onNavigateTab: navigateTab,
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

  const bqUnconfirmed = isDemo ? 1 : (unconfirmedGcFormCount ?? 0);
  const bqRaw = Array.isArray(bidQuals) ? bidQuals : bidQuals ? [bidQuals] : [];
  const bqTotal = isDemo ? 3 : bqRaw.length;
  const bqConfirmed = Math.max(0, bqTotal - bqUnconfirmed);

  // Phase scores for the 5 preflight phases
  const phaseScore: Record<string, number | null> = {
    // INTAKE: has the project been configured?
    setup:     (projectData as any)?.grossRoofArea > 0 || (projectData as any)?.assemblies?.length > 0 ? 100 : null,
    // READ: scope, addenda, RFIs addressed
    documents: Math.round((scores.scope + scores.addenda + scores.rfis) / 3),
    // VERIFY: checklist completion
    checklist: scores.checklist,
    // VALIDATE: readiness score blended with bid quals
    validate:  bqTotal > 0
      ? Math.round((readinessScore + Math.round((bqConfirmed / bqTotal) * 100)) / 2)
      : readinessScore,
    // SUBMIT: not scored — presence of a submission record = done
    submit:    null,
  };

  return (
    <>
    <div className="-m-6 flex" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Right side: breadcrumb + panels B + C */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── PROJECT COMMAND BAR ── always visible, carries full context across all tabs */}
        <div className="shrink-0" style={{ background: "var(--bs-bg-secondary)", borderBottom: "1px solid var(--bs-border)" }}>
          {/* Row 1: slim breadcrumb */}
          <div className="flex items-center gap-1.5 px-5 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {activeTab ? (
              <button
                onClick={() => setActiveTab(null)}
                className="flex items-center transition-colors cursor-pointer"
                style={{ fontSize: 11, color: "var(--bs-text-muted)", background: "none", border: "none", padding: 0 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              </button>
            ) : (
              <Link
                href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
                className="flex items-center transition-colors"
                style={{ fontSize: 11, color: "var(--bs-text-muted)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              </Link>
            )}
            <Link
              href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              style={{ fontSize: 11, color: "var(--bs-text-muted)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-secondary)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}
            >
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
            <div className="flex-1" />
            {blockerCount > 0 && (
              <button
                onClick={() => navigateTab("validator")}
                className="cursor-pointer"
                style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, border: "none", whiteSpace: "nowrap", background: "rgba(239,68,68,0.12)", color: "var(--bs-red)" }}
              >
                {blockerCount} blocker{blockerCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
          {/* Row 2: project identity — name + metadata chips + readiness ring + bid countdown */}
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--bs-text-primary)", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {projectData?.name ?? "Untitled Project"}
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {(() => {
                  const gc = (projectData as any)?.gc as string | undefined;
                  const location = (projectData as any)?.location as string | undefined;
                  const assemblies = (projectData as any)?.assemblies as any[] | undefined;
                  const firstAssembly = assemblies?.[0];
                  const chipBase: React.CSSProperties = { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)", whiteSpace: "nowrap" };
                  const chipTeal: React.CSSProperties = { ...chipBase, background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" };
                  const chips: React.ReactNode[] = [];
                  if (gc) chips.push(<span key="gc" style={chipBase}>{gc}</span>);
                  if (location) chips.push(<span key="loc" style={chipBase}>{location}</span>);
                  if (grossArea) chips.push(<span key="area" style={chipBase}>{Number(grossArea).toLocaleString()} SF</span>);
                  if (sys) chips.push(<span key="sys" style={chipTeal}>{sys.name}</span>);
                  else if (firstAssembly?.archetype) chips.push(<span key="arch" style={chipTeal}>{firstAssembly.archetype}{assemblies!.length > 1 ? ` +${assemblies!.length - 1}` : ""}</span>);
                  if (chips.length === 0) return <button onClick={() => setActiveTab("setup")} style={{ fontSize: 10, color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Add project details →</button>;
                  return chips;
                })()}
              </div>
            </div>
            {/* Readiness ring */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bs-bg-elevated)", border: `3px solid ${readinessColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: readinessColor, fontVariantNumeric: "tabular-nums" }}>{readinessScore}%</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ready</span>
            </div>
            {/* Bid countdown */}
            {msUntilBid !== null && (
              <div style={{ flexShrink: 0, textAlign: "right", borderLeft: "1px solid var(--bs-border)", paddingLeft: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: "-0.02em", color: msUntilBid <= 0 ? "var(--bs-red)" : hoursUntilBid! <= 4 ? "var(--bs-red)" : hoursUntilBid! <= 24 ? "var(--bs-amber)" : "var(--bs-text-primary)" }}>
                  {msUntilBid <= 0 ? "Past due" : (daysUntilBid ?? 0) > 1 ? `${daysUntilBid}d` : formatCountdown(msUntilBid)}
                </div>
                <div style={{ fontSize: 9, color: "var(--bs-text-dim)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {msUntilBid <= 0 ? "Overdue" : "To bid"}
                </div>
              </div>
            )}
            {!isDemo && (
              <button
                onClick={() => setActiveTab("setup")}
                style={{ flexShrink: 0, color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                title="Edit project"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" /></svg>
              </button>
            )}
          </div>
          {/* Row 3: phase stepper — always visible, serves as persistent phase nav */}
          <div style={{ display: "flex", borderTop: "1px solid var(--bs-border)", overflow: "hidden" }}>
            {PHASES.map((phase, idx) => {
              const isActive = activeTab ? getPhaseIndex(activeTab) === idx : false;
              const pScore = phaseScore[phase.id];
              const isDone = pScore !== null && pScore >= 90;
              const hasProgress = pScore !== null && pScore > 0;
              const hasBlockerPhase = actionItems.some(a => a.tab === phase.id && a.level === "blocker");
              const scoreColor = hasBlockerPhase ? "var(--bs-red)" : isDone ? "var(--bs-teal)" : hasProgress ? "var(--bs-amber)" : "rgba(255,255,255,0.15)";
              return (
                <React.Fragment key={phase.id}>
                  {idx > 0 && <div style={{ width: 1, background: "var(--bs-border)", flexShrink: 0 }} />}
                  <button
                    onClick={() => navigateTab(phase.defaultTab as TabId)}
                    style={{
                      flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
                      padding: 0, background: isActive ? "rgba(255,255,255,0.03)" : "none",
                      border: "none", cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 4px" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        background: isActive ? "var(--bs-teal)" : isDone ? "var(--bs-teal-dim)" : "rgba(255,255,255,0.07)",
                        border: `1.5px solid ${isActive ? "var(--bs-teal)" : hasBlockerPhase ? "var(--bs-red)" : isDone ? "var(--bs-teal)" : hasProgress ? "var(--bs-amber)" : "rgba(255,255,255,0.15)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isDone
                          ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={isActive ? "#13151a" : "var(--bs-teal)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <span style={{ fontSize: 8, fontWeight: 800, color: isActive ? "#13151a" : hasBlockerPhase ? "var(--bs-red)" : hasProgress ? "var(--bs-amber)" : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{idx + 1}</span>
                        }
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: isActive ? "var(--bs-teal)" : hasBlockerPhase ? "var(--bs-red)" : isDone ? "var(--bs-teal)" : "var(--bs-text-secondary)", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                          {phase.shortLabel}
                        </div>
                        <div className="hidden sm:block" style={{ fontSize: 9, color: "var(--bs-text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                          {phase.desc}
                        </div>
                      </div>
                      {pScore !== null && pScore > 0 && !isDone && (
                        <span style={{ fontSize: 9, fontWeight: 600, color: hasBlockerPhase ? "var(--bs-red)" : "var(--bs-amber)", flexShrink: 0 }}>
                          {pScore}%
                        </span>
                      )}
                    </div>
                    {/* Score bar at bottom of each cell */}
                    <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
                      {pScore !== null && pScore > 0 && (
                        <div style={{ height: "100%", width: `${pScore}%`, background: scoreColor, transition: "width 0.6s" }} />
                      )}
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
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
                {/* Mobile-only back button */}
                <div className="px-6 pt-3 lg:hidden">
                  <button
                    onClick={() => setActiveTab(null)}
                    className="flex items-center gap-1 cursor-pointer"
                    style={{ fontSize: 12, color: "var(--bs-text-dim)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                </div>
                <div className="p-6">
                  {activeTab === "setup"     && <TabErrorBoundary tabLabel="Intake"><SetupTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "documents" && <TabErrorBoundary tabLabel="Read"><DocumentsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "checklist" && <TabErrorBoundary tabLabel="Verify"><ChecklistTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "validate"  && <TabErrorBoundary tabLabel="Validate"><ValidatorTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "bidquals"  && <TabErrorBoundary tabLabel="Bid Quals"><BidQualsTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "submit"    && <TabErrorBoundary tabLabel="Submit"><SubmissionTab {...tabProps} /></TabErrorBoundary>}
                  {activeTab === "estimate"  && <TabErrorBoundary tabLabel="Pricing"><EstimateTab {...tabProps} /></TabErrorBoundary>}
                </div>
              </>
            ) : (
              /* Overview — full-width card grid */
              <div className="p-6">

                {/* Go/No-Go bid decision banner */}
                {(() => {
                  const hasBlockers = blockerCount > 0;
                  const tightDeadline = daysUntilBid !== null && daysUntilBid <= 2 && readinessScore < 80;
                  const isGo = !hasBlockers && readinessScore >= 80;
                  const isNoGo = hasBlockers || readinessScore < 50 || tightDeadline;
                  const label = isGo ? "GO" : isNoGo ? "NO-GO" : "CONDITIONAL";
                  const accent = isGo ? "var(--bs-teal)" : isNoGo ? "var(--bs-red)" : "var(--bs-amber)";
                  const dimBg = isGo ? "var(--bs-teal-dim)" : isNoGo ? "var(--bs-red-dim)" : "var(--bs-amber-dim)";
                  const borderColor = isGo ? "var(--bs-teal-border)" : isNoGo ? "var(--bs-red-border)" : "var(--bs-amber-border)";
                  const headline = isGo
                    ? "Ready to bid"
                    : isNoGo
                    ? hasBlockers ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} must be resolved` : tightDeadline ? `${daysUntilBid}d left — not ready` : "Address open items before bidding"
                    : "Review open items before submitting";
                  const sub = isGo
                    ? actionItems.length > 0 ? `${actionItems.length} optional item${actionItems.length > 1 ? "s" : ""} to review` : "All critical items complete"
                    : `${readinessScore}% readiness · ${actionItems.length} item${actionItems.length !== 1 ? "s" : ""} pending`;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", marginBottom: 16, borderRadius: 12, border: `1px solid ${borderColor}`, background: dimBg }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <span style={{ fontSize: 7, fontWeight: 800, color: "#13151a", letterSpacing: "0.1em", lineHeight: 1 }}>BID</span>
                        <span style={{ fontSize: label === "CONDITIONAL" ? 7 : 11, fontWeight: 900, color: "#13151a", letterSpacing: "0.05em", lineHeight: 1 }}>{label}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 2 }}>{headline}</div>
                        <div style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>{sub}</div>
                      </div>
                      {!isGo && blockerCount > 0 && (
                        <button
                          onClick={() => navigateTab("checklist")}
                          className="shrink-0 cursor-pointer"
                          style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 7, border: `1px solid ${borderColor}`, background: "none", color: accent, whiteSpace: "nowrap" }}
                        >
                          Fix blockers →
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Stats bar — all key project metrics in one horizontal strip */}
                <div style={{ display: "flex", alignItems: "stretch", background: "var(--bs-bg-card)", borderRadius: 14, border: "1px solid var(--bs-border)", overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.05)" }}>
                  {/* Deadline cell */}
                  <div style={{ flex: "1 1 0", padding: "14px 18px", minWidth: 0, borderRight: "1px solid var(--bs-border)", background: msUntilBid !== null && msUntilBid <= 0 ? "var(--bs-red-dim)" : msUntilBid !== null && hoursUntilBid! <= 24 ? "var(--bs-amber-dim)" : "transparent" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Bid Deadline</div>
                    <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: msUntilBid !== null && (msUntilBid <= 0 || hoursUntilBid! <= 4) ? "var(--bs-red)" : msUntilBid !== null && hoursUntilBid! <= 24 ? "var(--bs-amber)" : "var(--bs-text-primary)" }}>
                      {msUntilBid === null ? "—" : msUntilBid <= 0 ? "Past due" : (daysUntilBid ?? 0) > 1 ? `${daysUntilBid}d` : formatCountdown(msUntilBid)}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--bs-text-dim)", marginTop: 4 }}>
                      {projectData?.bidDate ? (() => { const t = (projectData as any)?.bidTime as string | undefined; const d = new Date(`${projectData.bidDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }); return t ? `${d} · ${t}` : d; })() : "No deadline set"}
                    </div>
                  </div>
                  {/* Readiness cell */}
                  <div style={{ flex: "1 1 0", padding: "14px 18px", minWidth: 0, borderRight: "1px solid var(--bs-border)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bs-bg-elevated)", border: `3px solid ${readinessColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: readinessColor, fontVariantNumeric: "tabular-nums" }}>{readinessScore}%</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-text-primary)" }}>Readiness</div>
                      <div style={{ fontSize: 10, color: "var(--bs-text-dim)", marginTop: 2 }}>{blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""}` : warnCount > 0 ? `${warnCount} to review` : passCount > 0 ? "On track" : "Get started"}</div>
                    </div>
                  </div>
                  {/* Roof area cell */}
                  {grossArea ? (
                    <div style={{ flex: "1 1 0", padding: "14px 18px", minWidth: 0, borderRight: "1px solid var(--bs-border)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Roof Area</div>
                      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "var(--bs-text-primary)", fontVariantNumeric: "tabular-nums" }}>{Number(grossArea).toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "var(--bs-text-dim)", marginTop: 4 }}>sq. ft.</div>
                    </div>
                  ) : null}
                  {/* Bid amount cell */}
                  {bidAmt ? (
                    <div style={{ flex: "1 1 0", padding: "14px 18px", minWidth: 0, borderRight: "1px solid var(--bs-border)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Bid Amount</div>
                      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "var(--bs-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {bidAmt >= 1_000_000 ? `$${(bidAmt / 1_000_000).toFixed(1)}M` : `$${Math.round(bidAmt / 1_000)}k`}
                      </div>
                      {dpsf && <div style={{ fontSize: 10, color: "var(--bs-teal)", marginTop: 4 }}>${dpsf}/SF</div>}
                    </div>
                  ) : null}
                  {/* Status cell */}
                  <div style={{ flex: "1 1 0", padding: "14px 18px", minWidth: 0, background: blockerCount > 0 ? "var(--bs-red-dim)" : actionItems.length > 0 ? "var(--bs-amber-dim)" : readinessScore > 0 ? "var(--bs-teal-dim)" : "transparent" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Status</div>
                    {actionItems.length === 0 ? (
                      <>
                        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: "var(--bs-teal)" }}>✓</div>
                        <div style={{ fontSize: 10, color: "var(--bs-teal)", marginTop: 4 }}>Ready to submit</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: blockerCount > 0 ? "var(--bs-red)" : "var(--bs-amber)" }}>{actionItems.length}</div>
                        <div style={{ fontSize: 10, color: "var(--bs-text-dim)", marginTop: 4 }}>{blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""}` : `${actionItems.length} item${actionItems.length > 1 ? "s" : ""}`}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Assembly summary strip */}
                {(() => {
                  // Prefer roofAssemblies (detailed objects) over assemblies (legacy string array)
                  const roofAssemblies = (projectData as any)?.roofAssemblies as any[] | undefined;
                  const assembliesLegacy = (projectData as any)?.assemblies as any[] | undefined;
                  const hasDetailed = roofAssemblies && roofAssemblies.length > 0;
                  if (!hasDetailed && !assembliesLegacy?.length && !sys) return null;
                  const rawItems = hasDetailed ? roofAssemblies
                    : assembliesLegacy?.length ? assembliesLegacy
                    : [{ label: sys?.name ?? "Roof System", systemType: sysId ?? null, area: grossArea ?? null }];
                  const items = rawItems!.map((a: any) => {
                    if (typeof a === "string") return { displayName: a, area: null };
                    const syslabel = a.systemType ? getRoofSystem(a.systemType)?.name : null;
                    const displayName = a.name || a.archetype || syslabel || a.label || "Assembly";
                    return { ...a, displayName };
                  });
                  return (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--bs-text-dim)", marginBottom: 8 }}>
                        {items.length === 1 ? "Roof System" : `${items.length} Roof Assemblies`}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {items.slice(0, 3).map((a: any, i: number) => (
                          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", borderRadius: 20, padding: "5px 10px 5px 7px" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--bs-bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--bs-teal)", whiteSpace: "nowrap", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{a.displayName}</div>
                              {(a.area || (a.label && a.label !== a.displayName)) && (
                                <div style={{ fontSize: 9, color: "var(--bs-text-dim)", marginTop: 1 }}>{a.area ? `${Number(a.area).toLocaleString()} SF` : a.label}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div style={{ display: "inline-flex", alignItems: "center", background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", borderRadius: 20, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "var(--bs-text-dim)" }}>
                            +{items.length - 3} more
                          </div>
                        )}
                        {dpsf !== null && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 20, padding: "5px 10px" }}>
                            <span style={{ fontSize: 9, color: "var(--bs-text-dim)" }}>Rate</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-text-primary)", fontVariantNumeric: "tabular-nums" }}>${dpsf}/SF</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Next-step banner */}
                {(() => {
                  const top = actionItems[0];
                  const isNew = actionItems.length > 0 && readinessScore === 0;
                  if (!top && readinessScore === 0) {
                    // Brand-new project — start at INTAKE
                    return (
                      <button
                        onClick={() => openTab("setup")}
                        className="w-full text-left cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
                        style={{ background: "var(--bs-teal-dim)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--bs-teal-border)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                      >
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-teal)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Step 1 · Intake</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bs-text-primary)" }}>Start here — upload your specs or drawings to kick off the preflight</div>
                        </div>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-teal)" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    );
                  }
                  if (!top && readinessScore >= 80) {
                    return (
                      <button
                        onClick={() => openTab("submit")}
                        className="w-full text-left cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
                        style={{ background: "var(--bs-teal-dim)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--bs-teal-border)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                      >
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--bs-teal)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Step 5 · Submit</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bs-text-primary)" }}>Preflight complete — {readinessScore}% ready. Log your bid submission.</div>
                        </div>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-teal)" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    );
                  }
                  if (!top) return null;
                  const isBlocker = top.level === "blocker";
                  const bannerColor = isBlocker ? "var(--bs-red)" : "var(--bs-amber)";
                  const bannerBg = isBlocker ? "var(--bs-red-dim)" : "var(--bs-amber-dim)";
                  const bannerBorder = isBlocker ? "var(--bs-red-border)" : "var(--bs-amber-border)";
                  const bannerLabel = isBlocker ? (isNew ? "Start here" : "Fix this first") : "Review needed";
                  return (
                    <button
                      onClick={() => navigateTab(top.tab)}
                      className="w-full text-left cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
                      style={{ background: bannerBg, borderRadius: 12, padding: "16px 20px", border: `1px solid ${bannerBorder}`, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                    >
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: bannerColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{bannerLabel}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bs-text-primary)" }}>{top.title}</div>
                        {top.detail && <div style={{ fontSize: 12, color: "var(--bs-text-dim)", marginTop: 2 }}>{top.detail}</div>}
                      </div>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={bannerColor} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  );
                })()}

                {/* Preflight Phases label */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--bs-text-dim)" }}>Preflight Phases</span>
                  <span style={{ fontSize: 10, color: "var(--bs-text-dim)" }}>{BROWSE_ITEMS.filter(({ id }) => (phaseScore[id] ?? 0) >= 90).length}/{BROWSE_ITEMS.length} complete</span>
                </div>

                {/* Section card grid — data-driven stats */}
                {(() => {
                  // Compute card-level stats from live Convex data
                  const cl = isDemo ? [] : (checklist ?? []);
                  const clTotal = isDemo ? 95 : cl.length;
                  const clDone = isDemo ? 68 : cl.filter((i: any) => i.status === "done" || i.status === "na").length;
                  const nextClPhase = isDemo ? null : cl.find((i: any) => i.status !== "done" && i.status !== "na")?.phaseKey as string | undefined;

                  const secs = isDemo
                    ? [{ squareFeet: 28500 }, { squareFeet: 24800 }, { squareFeet: 8200 }, { squareFeet: 3400 }]
                    : (takeoffSections ?? []);
                  const takenOff = secs.reduce((s: number, sec: any) => s + (sec.squareFeet || 0), 0);

                  const mats = isDemo ? Array.from({ length: 12 }, () => ({ unitPrice: 100 })) : (projectMaterials ?? []);
                  const matUnpriced = mats.filter((m: any) => !m.unitPrice || m.unitPrice <= 0).length;

                  const qs = isDemo ? [] : (quotes ?? []);
                  const qCount = isDemo ? 5 : qs.length;
                  const qExpired = isDemo ? 0 : qs.filter((q: any) => { const d = q.expirationDate; return d && new Date(d).getTime() < Date.now(); }).length;
                  const qExpiring = isDemo ? 1 : qs.filter((q: any) => { const d = q.expirationDate; if (!d) return false; const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); return days > 0 && days <= 14; }).length;

                  const sc = isDemo
                    ? Array.from({ length: 40 }, (_, i) => ({ status: i < 35 ? "included" : "unaddressed" }))
                    : (scopeItems ?? []);
                  const scTotal = sc.length;
                  const scUnaddressed = sc.filter((s: any) => s.status === "unaddressed").length;

                  const ad = isDemo ? [] : (addenda ?? []);
                  const adNotRepriced = isDemo ? 1 : ad.filter((a: any) => a.affectsScope === true && !a.repriced).length;

                  const rs = isDemo ? [] : (rfis ?? []);
                  const rPending = isDemo ? 1 : rs.filter((r: any) => r.status === "sent" || r.status === "draft").length;

                  const asmList = (projectData as any)?.assemblies as string[] | undefined;
                  const asmCount = asmList?.length ?? 0;
                  const sysName = sys?.name ?? ((projectData as any)?.primaryAssembly as string | undefined) ?? null;
                  const firstAsmName = asmList?.[0] ?? null;

                  const PHASE_NAMES: Record<string, string> = {
                    phase1: "Project Setup", phase2: "Document Receipt", phase3: "Architectural Review",
                    phase4: "Structural Review", phase5: "Mechanical Review", phase6: "Plumbing Review",
                    phase7: "Electrical Review", phase8: "Civil/Site Review", phase9: "Spec Review",
                    phase10: "Takeoff — Areas", phase11: "Takeoff — Linear", phase12: "Takeoff — Counts",
                    phase13: "Pricing — Materials", phase14: "Pricing — Labor", phase15: "Pre-Submission Review",
                    phase16: "Bid Submission", phase17: "Scope Boundaries", phase18: "General Conditions",
                  };

                  const cardLines: Record<string, [string, string]> = {
                    // INTAKE
                    setup: asmCount > 0
                      ? [`${asmCount} assembl${asmCount !== 1 ? "ies" : "y"} recognized`, sysName ?? firstAsmName ?? "Review & confirm assemblies"]
                      : ["Upload specs or drawings", "AI will extract roof assemblies for you"],
                    // READ
                    documents: [
                      scTotal > 0
                        ? (scUnaddressed > 0 ? `${scUnaddressed} of ${scTotal} scope items to address` : `All ${scTotal} scope items addressed`)
                        : "Scope not started — upload specs",
                      [
                        rPending > 0 ? `${rPending} RFI${rPending !== 1 ? "s" : ""} pending` : null,
                        adNotRepriced > 0 ? `${adNotRepriced} addend${adNotRepriced !== 1 ? "a" : "um"} unresolved` : null,
                      ].filter(Boolean).join(" · ") || (ad.length > 0 ? `${ad.length} addend${ad.length !== 1 ? "a" : "um"} reviewed` : "No open RFIs or addenda"),
                    ],
                    // VERIFY
                    checklist: clTotal > 0
                      ? [
                          `${clDone} of ${clTotal} items checked`,
                          clDone === clTotal ? "All clear!" : nextClPhase ? `Next: ${PHASE_NAMES[nextClPhase] ?? nextClPhase}` : `${clTotal - clDone} remaining`,
                        ]
                      : ["95+ preflight checklist items", "Tap to start the bid review"],
                    // VALIDATE
                    validate: [
                      `${readinessScore}% bid readiness`,
                      bqTotal > 0
                        ? (bqUnconfirmed > 0 ? `${bqUnconfirmed} bid qual item${bqUnconfirmed !== 1 ? "s" : ""} need confirmation` : `${bqTotal} bid quals confirmed`)
                        : blockerCount > 0 ? `${blockerCount} blocker${blockerCount !== 1 ? "s" : ""} to resolve` : warnCount > 0 ? `${warnCount} item${warnCount !== 1 ? "s" : ""} to review` : "Upload GC bid form to extract quals",
                    ],
                    // SUBMIT
                    submit: [
                      "Log your submission",
                      "Record method, confirmation # & timestamp",
                    ],
                  };

                  const cardStat: Record<string, string> = {
                    setup:     asmCount > 0 ? `${asmCount}` : "—",
                    documents: scTotal > 0 ? `${Math.round(((scTotal - scUnaddressed) / scTotal) * 100)}%` : "—",
                    checklist: clTotal > 0 ? `${clDone}/${clTotal}` : "95+",
                    validate:  `${readinessScore}%`,
                    submit:    "→",
                  };

                  const cardStatLabel: Record<string, string> = {
                    setup:     asmCount !== 1 ? "assemblies" : "assembly",
                    documents: scTotal > 0 ? "scope addressed" : "scope items",
                    checklist: clTotal > 0 ? "items verified" : "items total",
                    validate:  "bid readiness",
                    submit:    "submit",
                  };

                  const cardCta: Record<string, string> = {
                    setup:     "Set up & upload →",
                    documents: "Review docs →",
                    checklist: "Run preflight →",
                    validate:  "Validate bid →",
                    submit:    "Log submission →",
                  };

                  return (
                    <div style={{ borderRadius: 14, border: "1px solid var(--bs-border)", overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.05)", overflowX: "auto" }}>
                    <div style={{ display: "flex", alignItems: "stretch", background: "var(--bs-bg-card)", minWidth: 560 }}>
                      {BROWSE_ITEMS.map(({ id, label }, mapIdx) => {
                        const score = (phaseScore[id] ?? 0) as number;
                        const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                        const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                        const scoreColor = hasBlocker ? "var(--bs-red)" : hasWarning ? "var(--bs-amber)" : score >= 75 ? "var(--bs-teal)" : score > 0 ? "var(--bs-amber)" : "var(--bs-text-dim)";
                        const isDone = score >= 90 && !hasBlocker;
                        return (
                          <React.Fragment key={id}>
                            {mapIdx > 0 && <div style={{ width: 1, background: "var(--bs-border)", flexShrink: 0 }} />}
                            <button
                              onClick={() => navigateTab(id)}
                              className="transition-all duration-150 cursor-pointer"
                              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: 0, background: "none", border: "none", textAlign: "left" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                            >
                              <div style={{ height: 4, width: "100%", flexShrink: 0, background: hasBlocker ? "var(--bs-red)" : hasWarning ? "var(--bs-amber)" : score >= 75 ? "var(--bs-teal)" : score > 0 ? "var(--bs-amber)" : "var(--bs-border)" }} />
                              <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: isDone ? "var(--bs-teal)" : "var(--bs-bg-elevated)", border: `2px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {isDone
                                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#13151a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                      : <span style={{ fontSize: 9, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{mapIdx + 1}</span>
                                    }
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: score > 0 || isDone ? scoreColor : "var(--bs-text-dim)" }}>{label}</span>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: scoreColor, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", marginBottom: 3 }}>{cardStat[id]}</div>
                                <div style={{ fontSize: 10, color: "var(--bs-text-dim)", paddingBottom: 4 }}>{cardStatLabel[id]}</div>
                                <div style={{ fontSize: 9, color: "var(--bs-text-dim)", marginBottom: 4, fontStyle: "italic" }}>
                                  {PHASES.find(p => p.id === id)?.desc ?? ""}
                                </div>
                                <div style={{ height: 4, background: "var(--bs-bg-elevated)", borderRadius: 9999, overflow: "hidden", marginTop: "auto" }}>
                                  <div style={{ height: "100%", width: `${score}%`, background: scoreColor, borderRadius: 9999, transition: "width 0.6s" }} />
                                </div>
                              </div>
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    </div>
                  );
                })()}

                {/* Action items (compact, below cards) */}
                {actionItems.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--bs-text-dim)" }}>
                      {blockerCount > 0 ? `${blockerCount} Blocker${blockerCount > 1 ? "s" : ""} · ` : ""}{actionItems.length} Item{actionItems.length > 1 ? "s" : ""} Need Attention
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {actionItems.map((item, i) => (
                        <button
                          key={`${item.tab}-${i}`}
                          onClick={() => navigateTab(item.tab)}
                          className="w-full text-left transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          style={{
                            background: item.level === "blocker" ? "var(--bs-red-dim)" : item.level === "warning" ? "var(--bs-amber-dim)" : "var(--bs-blue-dim)",
                            borderRadius: 10, padding: "12px 14px",
                            border: `1px solid ${item.level === "blocker" ? "var(--bs-red-border)" : item.level === "warning" ? "var(--bs-amber-border)" : "var(--bs-blue-border, var(--bs-border))"}`,
                            borderLeft: `3px solid ${item.level === "blocker" ? "var(--bs-red)" : item.level === "warning" ? "var(--bs-amber)" : "var(--bs-blue)"}`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--bs-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                              {item.detail && <div style={{ fontSize: 11, color: "var(--bs-text-muted)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.detail}</div>}
                            </div>
                            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                onClick={() => navigateTab("validator")}
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

    {/* ── Keyboard Shortcut Help Overlay (L-17) ── */}
    {showShortcuts && (
      <div
        onClick={() => setShowShortcuts(false)}
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 14, padding: "24px 28px", maxWidth: 400, width: "90vw" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--bs-text-primary)" }}>Keyboard Shortcuts</span>
            <button onClick={() => setShowShortcuts(false)} style={{ background: "none", border: "none", color: "var(--bs-text-dim)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>&times;</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            {[
              ["1 – 9", "Jump to tab by position"],
              ["[", "Previous tab"],
              ["]", "Next tab"],
              ["?", "Toggle this help"],
              ["Esc", "Close overlay"],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <kbd style={{ display: "inline-block", minWidth: 32, textAlign: "center", padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)", fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{key}</kbd>
                <span style={{ color: "var(--bs-text-muted)" }}>{desc}</span>
              </div>
            ))}
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
