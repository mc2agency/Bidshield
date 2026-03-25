"use client";

import { Suspense, useMemo, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  LayoutList, AlignLeft, Ruler, Package,
  DollarSign, Users, Briefcase, Quote, FileText,
  HelpCircle, CheckSquare, ClipboardList, History, LayoutDashboard,
  Send, CalendarDays,
} from "lucide-react";

import { getRoofSystem, getRoofSystemByAssembly } from "@/lib/bidshield/roof-systems";
import { detectScopePricingConflicts } from "@/lib/bidshield/scopePricingConflicts";

import type { TabId } from "./tab-types";
import {
  OverviewTab, ChecklistTab, TakeoffTab, PricingTab, MaterialsTab,
  ScopeTab, QuotesTab, RFIsTab, AddendaTab, LaborTab, GeneralConditionsTab, ValidatorTab, BidQualsTab, DecisionLogTab,
  SubmissionTab, PreBidMeetingsTab,
} from "./tabs";
import TabErrorBoundary from "./TabErrorBoundary";

const BROWSE_ITEMS: { id: TabId; label: string; shortLabel?: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "overview",          label: "Overview",               Icon: LayoutDashboard },
  { id: "checklist",         label: "Checklist",              Icon: LayoutList },
  { id: "scope",             label: "Scope",                  Icon: AlignLeft },
  { id: "takeoff",           label: "Takeoff",                Icon: Ruler },
  { id: "materials",         label: "Material Reconciliation", shortLabel: "Reconciliation", Icon: Package },
  { id: "pricing",           label: "Pricing",                Icon: DollarSign },
  { id: "labor",             label: "Labor Verification", shortLabel: "Labor", Icon: Users },
  { id: "generalconditions", label: "Gen. Conds",   Icon: Briefcase },
  { id: "quotes",            label: "Quotes",       Icon: Quote },
  { id: "addenda",           label: "Addenda",      Icon: FileText },
  { id: "rfis",              label: "RFIs",         Icon: HelpCircle },
  { id: "bidquals",          label: "Bid Quals",        Icon: ClipboardList },
  { id: "validator",         label: "Validator",        Icon: CheckSquare },
  { id: "decisions",         label: "Decision Log",     Icon: History },
  { id: "submission",        label: "Submission",       Icon: Send },
  { id: "prebidmeetings",    label: "Pre-Bid Meetings", shortLabel: "Pre-Bid", Icon: CalendarDays },
];

function scoreDot(s: number): string {
  if (s === 100) return "#10b981";
  if (s >= 67)   return "#3b82f6";
  if (s >= 34)   return "#f59e0b";
  return "#ef4444";
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
  const [panelOverrides, setPanelOverrides] = useState<Record<string, boolean>>({});
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

  if (!projectIdParam) return <div className="text-center py-20"><p className="text-slate-500">No project selected.</p></div>;
  if (!isDemo && !projectData) return <div className="text-center py-20"><div className="text-slate-400 text-sm">Loading...</div></div>;

  const bidDeadlineMs = useMemo(() => {
    if (!projectData?.bidDate) return null;
    const bidTimeStr = (projectData as any)?.bidTime as string | undefined;
    if (bidTimeStr) {
      return new Date(`${projectData.bidDate}T${bidTimeStr}:00`).getTime();
    }
    return new Date(`${projectData.bidDate}T23:59:59`).getTime();
  }, [projectData]);

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
  const tabProps = { projectId: projectIdParam, isDemo, isPro, project: projectData, userId: userId ?? undefined, onNavigateTab: openTab };
  const activeTabLabel = BROWSE_ITEMS.find(b => b.id === activeTab)?.label;

  const sysId = (projectData as any)?.systemType;
  const assembly = (projectData as any)?.primaryAssembly;
  const sys = sysId ? getRoofSystem(sysId) : assembly ? getRoofSystemByAssembly(assembly) : undefined;
  const grossArea = (projectData as any)?.grossRoofArea;
  const bidAmt = (projectData as any)?.totalBidAmount;
  const dpsf = grossArea && bidAmt ? Math.round((bidAmt / grossArea) * 100) / 100 : null;

  const panelKey = activeTab ?? "__overview__";
  const defaultPanelOpen = activeTab === null || activeTab === "checklist";
  const panelOpen = panelKey in panelOverrides ? panelOverrides[panelKey] : defaultPanelOpen;
  const togglePanel = () => setPanelOverrides(prev => ({ ...prev, [panelKey]: !panelOpen }));
  const readinessColor = readinessScore === 100 ? "#10b981" : readinessScore >= 67 ? "#3b82f6" : readinessScore >= 34 ? "#f59e0b" : "#ef4444";

  return (
    <>
    <div className="-m-6 flex" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Panel A — premium dark sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 256,
          minHeight: "calc(100vh - 4rem)",
          background: "linear-gradient(180deg, #0f1117 0%, #141820 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Back to dashboard */}
        <Link
          href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs transition-colors"
          style={{ color: "#6b7280", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6b7280"}
        >
          ← Dashboard
        </Link>

        {/* Project info */}
        <div className="px-4 pt-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
              {projectData?.name}
            </div>
            {!isDemo && (
              <button
                onClick={openEditProject}
                style={{ color: "#4b5563", flexShrink: 0, marginTop: 2, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#9ca3af"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#4b5563"}
                title="Edit project"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                </svg>
              </button>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {projectData?.location}
          </div>
          {(projectData as any)?.gc && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{(projectData as any).gc}</div>
          )}
          {/* Progress bar — 4px, #10b981 fill */}
          <div style={{ marginTop: 14, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${readinessScore}%`, background: "#10b981", transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>{readinessScore}% bid ready</div>
        </div>

        {/* Section nav — icons + label + status dot */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {BROWSE_ITEMS.map(({ id, label, shortLabel, Icon }) => {
            const sectionScore = scores[id as keyof typeof scores];
            const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
            const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
            const dot = sectionScore !== undefined
              ? scoreDot(sectionScore)
              : (hasBlocker ? "#ef4444" : hasWarning ? "#f59e0b" : "#6b7280");
            const isActive = activeTab === id;
            const remainingCount = remaining[id as keyof typeof remaining] ?? 0;
            const showCount = sectionScore !== undefined && sectionScore > 0 && sectionScore < 100 && remainingCount > 0;
            const dotLabel =
              dot === "#10b981" ? "Complete" :
              dot === "#3b82f6" ? (remainingCount > 0 ? `In progress · ${remainingCount} left` : "In progress") :
              dot === "#f59e0b" ? (remainingCount > 0 ? `${remainingCount} item${remainingCount !== 1 ? "s" : ""} need attention` : "Needs attention") :
              "Not started";

            return (
              <button
                key={id}
                onClick={() => setActiveTab(isActive ? null : id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all group/item"
                style={isActive
                  ? { background: "rgba(16,185,129,0.12)", color: "#ffffff", borderLeft: "2px solid #10b981" }
                  : { color: "#9ca3af" }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#e5e7eb";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#9ca3af";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={17} strokeWidth={1.75} />
                  <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{shortLabel ?? label}</span>
                  {id === "labor" && unverifiedLaborCount !== null && unverifiedLaborCount !== undefined && (
                    unverifiedLaborCount > 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 9999, padding: "1px 5px", lineHeight: 1.5, flexShrink: 0 }}>
                        {unverifiedLaborCount}
                      </span>
                    ) : (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", flexShrink: 0 }} title="All tasks verified" />
                    )
                  )}
                  {id === "scope" && scopeConflictCount > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 9999, padding: "1px 5px", lineHeight: 1.5, flexShrink: 0 }} title={`${scopeConflictCount} scope-pricing conflict${scopeConflictCount !== 1 ? "s" : ""} detected`}>
                      {scopeConflictCount}
                    </span>
                  )}
                  {id === "bidquals" && unconfirmedGcFormCount !== null && unconfirmedGcFormCount !== undefined && unconfirmedGcFormCount > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: "#f59e0b", color: "#fff", borderRadius: 9999, padding: "1px 5px", lineHeight: 1.5, flexShrink: 0 }}>
                      {unconfirmedGcFormCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span title={dotLabel} style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block", cursor: "default", flexShrink: 0 }} />
                  {showCount && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, lineHeight: 1,
                      minWidth: 18, height: 18, borderRadius: 9999,
                      background: "rgba(255,255,255,0.1)", color: "#d1d5db",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      padding: "0 5px",
                    }}>{remainingCount}</span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Validate — separated, final review step */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 8 }}>
            {(() => {
              const isActive = activeTab === "validator";
              const scoreBadgeColor = readinessScore >= 90 ? "#10b981" : readinessScore >= 50 ? "#f59e0b" : "#ef4444";
              const scoreBadgeBg   = readinessScore >= 90 ? "rgba(16,185,129,0.15)" : readinessScore >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";
              const passChecks = actionItems.filter(a => a.level !== "blocker" && a.level !== "warning").length;
              const failChecks = actionItems.filter(a => a.level === "blocker").length;
              const warnChecks = actionItems.filter(a => a.level === "warning").length;
              const tooltip = `Final pre-submission review — ${passChecks} passing${warnChecks > 0 ? `, ${warnChecks} warning${warnChecks !== 1 ? "s" : ""}` : ""}${failChecks > 0 ? `, ${failChecks} blocker${failChecks !== 1 ? "s" : ""}` : ""}`;
              return (
                <button
                  title={tooltip}
                  onClick={() => setActiveTab(isActive ? null : "validator")}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                  style={isActive
                    ? { background: "rgba(16,185,129,0.15)", color: "#ffffff", borderLeft: "2px solid #10b981" }
                    : { background: "rgba(255,255,255,0.04)", color: "#d1d5db", borderLeft: "2px solid transparent" }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "#d1d5db";
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare size={17} strokeWidth={1.75} />
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Validate</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    minWidth: 28, height: 18, borderRadius: 9999,
                    background: scoreBadgeBg, color: scoreBadgeColor,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "0 6px",
                  }}>{readinessScore}%</span>
                </button>
              );
            })()}
          </div>
        </nav>

        {/* Status pills */}
        <div className="px-3 pb-4 pt-2 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {blockerCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "3px 10px", borderRadius: 9999 }}>
              {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
            </span>
          )}
          {warnCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#fbbf24", padding: "3px 10px", borderRadius: 9999 }}>
              {warnCount} warning{warnCount > 1 ? "s" : ""}
            </span>
          )}
          {passCount > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "3px 10px", borderRadius: 9999 }}>
              {passCount} passing
            </span>
          )}
        </div>
      </aside>

      {/* Right side: breadcrumb + panels B + C */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Breadcrumb bar — unified dark bg, 48px */}
        <div
          className="flex items-center justify-between shrink-0 px-5"
          style={{ background: "#0f1117", height: 48, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href={isDemo ? "/bidshield/dashboard?demo=true" : "/bidshield/dashboard"}
              className="shrink-0 flex items-center gap-1 transition-colors"
              style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#10b981"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#9ca3af"}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              All projects
            </Link>
            <span style={{ fontSize: 13, color: "#374151" }}>/</span>
            <span
              style={{
                fontSize: 13,
                color: activeTab ? "#6b7280" : "#e5e7eb",
                cursor: activeTab ? "pointer" : undefined,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
              onClick={activeTab ? () => setActiveTab(null) : undefined}
            >
              {projectData?.name ?? "Project"}
            </span>
            {activeTab && (
              <>
                <span style={{ fontSize: 13, color: "#374151" }}>/</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, flexShrink: 0 }}>{activeTabLabel}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {msUntilBid !== null && (
              <span style={{
                fontSize: 12, fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 8,
                background: msUntilBid <= 0 ? "rgba(239,68,68,0.15)" : hoursUntilBid! <= 4 ? "rgba(239,68,68,0.12)" : hoursUntilBid! <= 24 ? "rgba(245,158,11,0.12)" : "#1a2332",
                color: msUntilBid <= 0 ? "#f87171" : hoursUntilBid! <= 4 ? "#f87171" : hoursUntilBid! <= 24 ? "#fbbf24" : "#10b981",
                border: `1px solid ${msUntilBid <= 0 ? "rgba(239,68,68,0.4)" : hoursUntilBid! <= 4 ? "rgba(239,68,68,0.3)" : hoursUntilBid! <= 24 ? "rgba(245,158,11,0.3)" : "#10b981"}`,
                fontVariantNumeric: "tabular-nums",
              }}>
                {msUntilBid <= 0 ? "Past due" : hoursUntilBid! < 24 ? `⏰ ${formatCountdown(msUntilBid)}` : `${daysUntilBid}d to bid`}
              </span>
            )}
            {/* Static readiness — no spinner */}
            <span style={{ fontSize: 13, color: "#6b7280" }}>{readinessScore}% ready</span>
          </div>
        </div>

        {/* Deadline warning banner */}
        {activeWarning && (
          <div style={{
            background: activeWarning === "1h" ? "#fef2f2" : "#fffbeb",
            borderBottom: `1px solid ${activeWarning === "1h" ? "#fecaca" : "#fde68a"}`,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{activeWarning === "1h" ? "🚨" : "⏰"}</span>
              <div>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: activeWarning === "1h" ? "#dc2626" : "#d97706",
                }}>
                  {activeWarning === "1h"
                    ? "Less than 1 hour until bid deadline!"
                    : activeWarning === "4h"
                    ? "Less than 4 hours until bid deadline"
                    : "Bid deadline in less than 24 hours"}
                </span>
                {msUntilBid !== null && msUntilBid > 0 && (
                  <span style={{ fontSize: 12, color: activeWarning === "1h" ? "#ef4444" : "#f59e0b", marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
                    ({formatCountdown(msUntilBid)} remaining)
                  </span>
                )}
                {blockerCount > 0 && (
                  <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>
                    · {blockerCount} blocker{blockerCount > 1 ? "s" : ""} unresolved
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setDismissedWarnings(s => new Set([...s, activeWarning]))}
              style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 4px", flexShrink: 0 }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Panels B + C */}
        <div className="flex-1 flex overflow-hidden">

          {/* Panel B — main content, #f8fafc bg */}
          <main className="flex-1 overflow-auto min-w-0" style={{ background: "#f1f5f9" }}>
            {activeTab ? (
              <>
                {/* Tab header */}
                <div
                  className="px-6 py-3 border-b flex items-center gap-3 sticky top-0 z-10"
                  style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  <button
                    onClick={() => setActiveTab(null)}
                    className="flex items-center gap-1 lg:hidden"
                    style={{ fontSize: 13, color: "#9ca3af" }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{activeTabLabel}</h2>
                </div>
                <div className="p-6">
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
                  {BROWSE_ITEMS.map(({ id, label, shortLabel, Icon }) => {
                    const hasBlocker = actionItems.some(a => a.tab === id && a.level === "blocker");
                    const hasWarning = actionItems.some(a => a.tab === id && a.level === "warning");
                    const dot = hasBlocker ? "#ef4444" : hasWarning ? "#f59e0b" : "#10b981";
                    return (
                      <button
                        key={id}
                        onClick={() => openTab(id)}
                        className="flex items-center gap-1.5 transition-all active:scale-95"
                        style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{shortLabel ?? label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bid deadline countdown card */}
                {msUntilBid !== null && (
                  <div style={{
                    background: msUntilBid <= 0 ? "#fef2f2" : hoursUntilBid! <= 4 ? "#fef2f2" : hoursUntilBid! <= 24 ? "#fffbeb" : "white",
                    borderRadius: 10,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    padding: "16px 20px",
                    marginBottom: 16,
                    border: `1px solid ${msUntilBid <= 0 ? "#fecaca" : hoursUntilBid! <= 4 ? "#fecaca" : hoursUntilBid! <= 24 ? "#fde68a" : "#e5e7eb"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                          Bid Deadline
                        </div>
                        <div style={{
                          fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1,
                          color: msUntilBid <= 0 ? "#dc2626" : hoursUntilBid! <= 4 ? "#dc2626" : hoursUntilBid! <= 24 ? "#d97706" : "#111827",
                          letterSpacing: "-0.02em",
                        }}>
                          {msUntilBid <= 0 ? "Past due" : formatCountdown(msUntilBid)}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
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
                            fontSize: 12, fontWeight: 700, color: "#dc2626",
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: 6, padding: "4px 10px", marginBottom: 6,
                          }}>
                            {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
                          </div>
                        )}
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: readinessScore >= 80 ? "#059669" : readinessScore >= 50 ? "#d97706" : "#dc2626",
                          background: readinessScore >= 80 ? "#f0fdf4" : readinessScore >= 50 ? "#fffbeb" : "#fef2f2",
                          border: `1px solid ${readinessScore >= 80 ? "#bbf7d0" : readinessScore >= 50 ? "#fde68a" : "#fecaca"}`,
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
                  <div style={{ background: "white", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "2rem", textAlign: "center" }}>
                    <div className="text-3xl mb-3">✅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Bid ready to submit</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>All sections are complete and passing.</div>
                    <button
                      onClick={() => openTab("validator")}
                      style={{ padding: "10px 24px", background: "#10b981", color: "white", fontSize: 14, fontWeight: 500, borderRadius: 8 }}
                    >
                      Review & Export →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <h2 style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} · ` : ""}
                        {actionItems.length} need attention
                      </h2>
                      {passCount > 0 && (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{passCount} passing ✓</span>
                      )}
                    </div>
                    {actionItems.map((item, i) => (
                      <button
                        key={`${item.tab}-${i}`}
                        onClick={() => openTab(item.tab)}
                        className="w-full text-left transition-all active:scale-[0.98]"
                        style={{
                          background: "white",
                          borderRadius: 10,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          padding: 16,
                          borderLeft: `3px solid ${item.level === "blocker" ? "#ef4444" : item.level === "warning" ? "#f59e0b" : "#3b82f6"}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.title}</div>
                            {item.detail && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{item.detail}</div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999,
                              background: item.level === "blocker" ? "#fef2f2" : item.level === "warning" ? "#fffbeb" : "#eff6ff",
                              color: item.level === "blocker" ? "#dc2626" : item.level === "warning" ? "#d97706" : "#2563eb",
                            }}>
                              {item.level === "blocker" ? "Fix" : item.level === "warning" ? "Review" : "Info"}
                            </span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#d1d5db">
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
                  <h3 style={{ fontSize: 12, fontWeight: 500, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
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
                            className="group-hover:text-slate-900 transition-colors truncate"
                            style={{ fontSize: 12, color: "#6b7280", width: 140, textAlign: "left", flexShrink: 0 }}
                          >
                            {label}
                          </span>
                          <div style={{ flex: 1, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${score}%`, background: dot, borderRadius: 9999, transition: "width 0.5s" }} />
                          </div>
                          {/* Dot indicator */}
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, display: "inline-block" }} />
                          {/* % in gray, no color */}
                          <span style={{ fontSize: 12, color: "#6b7280", width: 32, textAlign: "right", flexShrink: 0 }}>
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
              style={{ background: "#ffffff", borderTop: "1px solid #e5e7eb", boxShadow: "0 -2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0fdf4", border: `2px solid ${readinessColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: readinessColor }}>{readinessScore}%</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>Bid Readiness</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{blockerCount > 0 ? `${blockerCount} blocker${blockerCount > 1 ? "s" : ""}` : actionItems.length > 0 ? `${actionItems.length} to review` : "Looking good"}</div>
                </div>
              </div>
              <button
                onClick={() => openTab("validator")}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: blockerCount > 0 ? "#f3f4f6" : "#10b981",
                  color: blockerCount > 0 ? "#9ca3af" : "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {blockerCount > 0 ? `Fix ${blockerCount}` : "Validate →"}
              </button>
            </div>
          </main>

          {/* Panel C — right info card */}
          {panelOpen ? (
            <aside
              className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
              style={{ width: 320, background: "#ffffff", borderLeft: "1px solid #e5e7eb", overflowX: "hidden" }}
            >
              <button
                onClick={togglePanel}
                className="hidden lg:flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors"
                style={{ height: 36, borderBottom: "1px solid #e5e7eb", color: "#9ca3af", flexShrink: 0 }}
                title="Collapse panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div style={{ padding: "20px 16px 0" }}>

              {/* 1. BID READINESS — top priority */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 6 }}>
                    Bid Readiness
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 10, transition: "all 0.3s" }}>
                    {readinessScore}%
                  </div>
                  <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 9999, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${readinessScore}%`, background: readinessColor, borderRadius: 9999, transition: "width 0.5s" }} />
                  </div>
                  {msUntilBid !== null && (
                    <div style={{
                      fontSize: 12,
                      color: msUntilBid <= 0 ? "#dc2626" : hoursUntilBid! <= 4 ? "#dc2626" : hoursUntilBid! <= 24 ? "#d97706" : "#6b7280",
                      fontWeight: hoursUntilBid !== null && hoursUntilBid <= 24 ? 600 : 400,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {msUntilBid <= 0 ? "Past due" : hoursUntilBid! < 24 ? `⏰ ${formatCountdown(msUntilBid)} remaining` : `${daysUntilBid} day${daysUntilBid !== 1 ? "s" : ""} until bid`}
                    </div>
                  )}
                </div>
              </div>

              {/* 1b. DEADLINE COUNTDOWN — only when < 24h */}
              {msUntilBid !== null && msUntilBid > 0 && hoursUntilBid! <= 24 && (
                <div style={{ paddingBottom: 20 }}>
                  <div style={{
                    borderRadius: 8, padding: 14,
                    background: hoursUntilBid! <= 4 ? "#fef2f2" : "#fffbeb",
                    border: `1px solid ${hoursUntilBid! <= 4 ? "#fecaca" : "#fde68a"}`,
                  }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: hoursUntilBid! <= 4 ? "#ef4444" : "#f59e0b", marginBottom: 4 }}>
                      Time Remaining
                    </div>
                    <div style={{
                      fontSize: 30, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1,
                      color: hoursUntilBid! <= 4 ? "#dc2626" : "#d97706",
                      letterSpacing: "-0.02em",
                    }}>
                      {formatCountdown(msUntilBid)}
                    </div>
                    {blockerCount > 0 && (
                      <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6, fontWeight: 600 }}>
                        ⚠ {blockerCount} unresolved blocker{blockerCount > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. SF / BID / $/SF stat card */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{grossArea ? grossArea.toLocaleString() : "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>SF</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    {editingBidInline && !isDemo ? (
                      <input
                        autoFocus
                        type="number"
                        value={bidInlineValue}
                        onChange={e => setBidInlineValue(e.target.value)}
                        onBlur={saveBidInline}
                        onKeyDown={e => { if (e.key === "Enter") saveBidInline(); if (e.key === "Escape") setEditingBidInline(false); }}
                        style={{ width: "100%", textAlign: "center", fontSize: 13, fontWeight: 600, border: "1px solid #10b981", borderRadius: 4, padding: "2px 4px", outline: "none", background: "white" }}
                      />
                    ) : (
                      <div
                        onClick={() => { if (!isDemo) { setBidInlineValue(bidAmt?.toString() ?? ""); setEditingBidInline(true); } }}
                        style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2, cursor: isDemo ? undefined : "pointer" }}
                        title={isDemo ? undefined : "Click to edit"}
                      >
                        {bidAmt ? `$${Math.round(bidAmt / 1000)}K` : "—"}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Bid</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{dpsf ? `$${dpsf.toFixed(2)}` : "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>$/SF</div>
                  </div>
                </div>
              </div>

              {/* 3. Roof system name + seam method */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 6 }}>
                  Roof System
                </div>
                {(() => {
                  const raw = assembly || sys?.fullName || sysId?.toUpperCase() || "Not set";
                  const m = raw.match(/^([^(]+?)(?:\s*\(([^)]+)\))?$/);
                  const main = m?.[1]?.trim() ?? raw;
                  const sub = m?.[2]?.trim() ?? null;
                  return (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{main}</div>
                      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{sub}</div>}
                    </>
                  );
                })()}
                {sys && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    {sys.seamMethod.split("(")[0].trim()}
                  </div>
                )}
                {sys && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>CSI {sys.csiSection}</div>}
              </div>

              {/* 3b. Project flags (FM Global, Pre-1990, Energy Code) */}
              {((projectData as any)?.fmGlobal === true || (projectData as any)?.pre1990 === true || (projectData as any)?.energyCode === true) && (
                <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(projectData as any)?.fmGlobal === true && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: 4 }}>
                      FM Global Insured
                    </span>
                  )}
                  {(projectData as any)?.pre1990 === true && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e", background: "#fffbeb", border: "1px solid #fcd34d", padding: "3px 8px", borderRadius: 4 }}>
                      ⚠ Pre-1990 — DSS Required
                    </span>
                  )}
                  {(projectData as any)?.energyCode === true && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#4338ca", background: "#eef2ff", border: "1px solid #c7d2fe", padding: "3px 8px", borderRadius: 4 }}>
                      ⚡ Energy Code{(projectData as any)?.climateZone ? ` CZ${(projectData as any).climateZone}` : ""}
                    </span>
                  )}
                </div>
              )}

              {/* 4. Manufacturers */}
              {sys && (
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 8 }}>
                    Manufacturers
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {sys.manufacturers.slice(0, 4).map(m => (
                      <span key={m} style={{ fontSize: 12, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 4 }}>{m}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => openTab("materials")}
                    style={{ fontSize: 12, color: "#10b981", marginTop: 8, fontWeight: 500 }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {sys.requiredMaterials.length} materials →
                  </button>
                </div>
              )}

              {/* 5. Warranty + Thickness (smaller) */}
              {sys && (
                <div style={{ paddingBottom: 20, display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 6 }}>
                      Warranty
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sys.warrantyOptions.map(w => (
                        <span key={w} style={{ fontSize: 11, background: "#f0fdf4", color: "#166534", padding: "2px 6px", borderRadius: 4 }}>{w}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 6 }}>
                      Thickness
                    </div>
                    <div style={{ fontSize: 12, color: "#374151", wordBreak: "break-word" }}>
                      {sys.thicknessOptions.join(" · ")}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Notes */}
              {(projectData as any)?.notes && (
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "#9ca3af", marginBottom: 6 }}>
                    Notes
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, wordBreak: "break-word" }}>
                    {(projectData as any).notes}
                  </p>
                </div>
              )}

            </div>

            {/* CTA — pinned to bottom */}
            <div style={{ padding: "0 16px 16px", marginTop: "auto" }}>
              {(projectData as any)?.status === "submitted" ? (
                <button
                  onClick={() => { setOutcomeForm({ result: null, competitorName: "", competitorPrice: "", lossReason: "" }); setOutcomeModalOpen(true); }}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "#6366f1", color: "#ffffff", cursor: "pointer", transition: "opacity 0.15s" }}
                  className="hover:opacity-90"
                >
                  Record Outcome →
                </button>
              ) : (projectData as any)?.status === "won" ? (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>✓ Won</span>
                </div>
              ) : (projectData as any)?.status === "lost" ? (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>✗ Lost{(projectData as any)?.competitorName ? ` — ${(projectData as any).competitorName} won` : ""}</span>
                </div>
              ) : (
                <button
                  onClick={() => openTab("validator")}
                  disabled={blockerCount > 0}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    background: blockerCount > 0 ? "#f3f4f6" : "#10b981",
                    color: blockerCount > 0 ? "#9ca3af" : "#ffffff",
                    cursor: blockerCount > 0 ? "not-allowed" : "pointer",
                    transition: "opacity 0.15s",
                  }}
                  className={blockerCount === 0 ? "hover:opacity-90" : ""}
                >
                  {blockerCount > 0
                    ? `Fix ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} →`
                    : actionItems.length > 0 ? "Review & Submit →" : "Submit Bid →"}
                </button>
              )}
            </div>
            </aside>
          ) : (
            <aside
              className="hidden lg:flex flex-col items-center shrink-0"
              style={{ width: 40, background: "#ffffff", borderLeft: "1px solid #e5e7eb" }}
            >
              <button
                onClick={togglePanel}
                className="flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors"
                style={{ width: 40, height: 40, borderBottom: "1px solid #e5e7eb", color: "#9ca3af", flexShrink: 0 }}
                title="Expand panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: activeTab === "validator" ? readinessColor : "#9ca3af",
                  whiteSpace: "nowrap",
                  paddingBottom: 16,
                  paddingTop: 16,
                }}
              >
                {activeTab === "validator" ? `${readinessScore}/100` : `Bid Readiness · ${readinessScore}%`}
              </div>
            </aside>
          )}

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
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "#94a3b8",
              textDecoration: "none",
            }}
          >
            🔒 Decision Log (5/5) · Upgrade
          </a>
        ) : (
          <button
            onClick={() => setDecisionModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: "#475569",
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
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={() => setDecisionModalOpen(false)}
      >
        <div
          className="bg-white w-full sm:max-w-md mx-0 sm:mx-4 sm:rounded-xl shadow-2xl"
          style={{ borderRadius: "12px 12px 0 0", padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Log a Decision</h3>
            <button
              onClick={() => setDecisionModalOpen(false)}
              style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: 4 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#374151"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#9ca3af"}
            >
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Section (auto-filled, read-only) */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Section</label>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#374151", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px" }}>
                {BROWSE_ITEMS.find(b => b.id === activeTab)?.label ?? activeTab}
              </div>
            </div>

            {/* What was decided */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>What was decided <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                autoFocus
                rows={3}
                placeholder="e.g. Changed mech flashing labor from LF to EA per field team discussion"
                value={decisionText}
                onChange={e => setDecisionText(e.target.value)}
                style={{
                  width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 6,
                  padding: "8px 10px", color: "#111827", outline: "none", resize: "none",
                  boxSizing: "border-box", lineHeight: 1.5,
                }}
                onFocus={e => (e.target.style.borderColor = "#94a3b8")}
                onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit(); }}
              />
            </div>

            {/* Who */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Who <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Per John / PM, Per pre-bid meeting"
                value={decisionWho}
                onChange={e => setDecisionWho(e.target.value)}
                style={{
                  width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 6,
                  padding: "8px 10px", color: "#111827", outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "#94a3b8")}
                onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
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
                background: decisionText.trim() ? "#1e293b" : "#f3f4f6",
                color: decisionText.trim() ? "#ffffff" : "#9ca3af",
                border: "none", cursor: decisionText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Save Decision
            </button>
            <button
              onClick={() => setDecisionModalOpen(false)}
              style={{ flex: 1, background: "#f3f4f6", color: "#6b7280", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}
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
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={() => setOutcomeModalOpen(false)}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
          style={{ padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Did you win this bid?</h3>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>{(projectData as any)?.name}</p>

          {/* Outcome buttons */}
          <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            {([
              { label: "🏆 Won", value: "won" as const, bg: "#ecfdf5", border: "#10b981", color: "#065f46" },
              { label: "✗ Lost", value: "lost" as const, bg: "#fef2f2", border: "#ef4444", color: "#991b1b" },
              { label: "No Award", value: "no_award" as const, bg: "#f8fafc", border: "#94a3b8", color: "#475569" },
              { label: "Still Pending", value: "pending" as const, bg: "#fffbeb", border: "#f59e0b", color: "#92400e" },
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
                  border: outcomeForm.result === opt.value ? `2px solid ${opt.border}` : "1px solid #e5e7eb",
                  background: outcomeForm.result === opt.value ? opt.bg : "white",
                  color: outcomeForm.result === opt.value ? opt.color : "#6b7280",
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
            <div className="flex flex-col gap-3" style={{ marginBottom: 20, padding: 14, background: "#fef2f2", borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", marginBottom: 2 }}>Loss details (optional but valuable)</p>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Who won? (competitor name)</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Roofing"
                  value={outcomeForm.competitorName}
                  onChange={e => setOutcomeForm(f => ({ ...f, competitorName: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" }}
                  onFocus={e => (e.target.style.borderColor = "#ef4444")}
                  onBlur={e => (e.target.style.borderColor = "#fca5a5")}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Their bid price ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 480000"
                  value={outcomeForm.competitorPrice}
                  onChange={e => setOutcomeForm(f => ({ ...f, competitorPrice: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "white" }}
                  onFocus={e => (e.target.style.borderColor = "#ef4444")}
                  onBlur={e => (e.target.style.borderColor = "#fca5a5")}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Loss reason</label>
                <select
                  value={outcomeForm.lossReason}
                  onChange={e => setOutcomeForm(f => ({ ...f, lossReason: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", background: "white", boxSizing: "border-box" }}
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
                background: outcomeForm.result ? "#111827" : "#f3f4f6",
                color: outcomeForm.result ? "white" : "#9ca3af",
                border: "none",
                cursor: outcomeForm.result ? "pointer" : "not-allowed",
              }}
            >
              Save Outcome
            </button>
            <button
              onClick={() => setOutcomeModalOpen(false)}
              style={{ flex: 1, background: "#f3f4f6", color: "#6b7280", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}
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
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={() => setEditProjectOpen(false)}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
          style={{ padding: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 20 }}>Edit Project</h3>
          <div className="flex flex-col gap-3">
            {([
              { label: "Project Name", key: "name", type: "text" },
              { label: "General Contractor", key: "gc", type: "text" },
              { label: "Location", key: "location", type: "text" },
              { label: "Gross Roof Area (SF)", key: "sqft", type: "number" },
              { label: "Bid Amount ($)", key: "totalBidAmount", type: "number" },
            ] as { label: string; key: keyof typeof editProjectForm; type: string }[]).map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>{label}</label>
                <input
                  type={type}
                  value={editProjectForm[key] as string}
                  onChange={e => setEditProjectForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = "#10b981")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
            ))}
            {/* Bid deadline — date + time on one row */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Bid Deadline</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={editProjectForm.bidDate}
                  onChange={e => setEditProjectForm(f => ({ ...f, bidDate: e.target.value }))}
                  style={{ flex: 2, border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = "#10b981")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
                <input
                  type="time"
                  value={editProjectForm.bidTime}
                  onChange={e => setEditProjectForm(f => ({ ...f, bidTime: e.target.value }))}
                  placeholder="Time (optional)"
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = "#10b981")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Time is optional — enables hour/minute countdown on bid day</div>
            </div>
            {/* FM Global toggle */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, display: "block" }}>FM Global Insured?</label>
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
                        ? (opt.value === true ? "2px solid #10b981" : opt.value === false ? "2px solid #6b7280" : "2px solid #d1d5db")
                        : "1px solid #e5e7eb",
                      background: editProjectForm.fmGlobal === opt.value
                        ? (opt.value === true ? "#ecfdf5" : opt.value === false ? "#f3f4f6" : "#f9fafb")
                        : "white",
                      color: editProjectForm.fmGlobal === opt.value
                        ? (opt.value === true ? "#059669" : "#374151")
                        : "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.fmGlobal === true && (
                <p style={{ fontSize: 11, color: "#059669", marginTop: 5 }}>3 FM Global checklist items will appear in Specification Review</p>
              )}
            </div>
            {/* Pre-1990 toggle */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, display: "block" }}>Building constructed before 1990?</label>
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
                        ? (opt.value === true ? "2px solid #f59e0b" : opt.value === false ? "2px solid #6b7280" : "2px solid #d1d5db")
                        : "1px solid #e5e7eb",
                      background: editProjectForm.pre1990 === opt.value
                        ? (opt.value === true ? "#fffbeb" : opt.value === false ? "#f3f4f6" : "#f9fafb")
                        : "white",
                      color: editProjectForm.pre1990 === opt.value
                        ? (opt.value === true ? "#b45309" : "#374151")
                        : "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.pre1990 === true && (
                <p style={{ fontSize: 11, color: "#b45309", marginTop: 5 }}>⚠ DSS warning item will appear in Architectural Review checklist</p>
              )}
            </div>
            {/* Energy code toggle */}
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, display: "block" }}>Replaces &gt;50% of roof area or &gt;2,000 SF?</label>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>Triggers energy code compliance requirement (ASHRAE 90.1)</p>
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
                        ? (opt.value === true ? "2px solid #6366f1" : opt.value === false ? "2px solid #6b7280" : "2px solid #d1d5db")
                        : "1px solid #e5e7eb",
                      background: editProjectForm.energyCode === opt.value
                        ? (opt.value === true ? "#eef2ff" : opt.value === false ? "#f3f4f6" : "#f9fafb")
                        : "white",
                      color: editProjectForm.energyCode === opt.value
                        ? (opt.value === true ? "#4338ca" : "#374151")
                        : "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {editProjectForm.energyCode === true && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, display: "block" }}>ASHRAE Climate Zone</label>
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
                          border: editProjectForm.climateZone === z ? "2px solid #6366f1" : "1px solid #e5e7eb",
                          background: editProjectForm.climateZone === z ? "#eef2ff" : "white",
                          color: editProjectForm.climateZone === z ? "#4338ca" : "#6b7280",
                          cursor: "pointer",
                        }}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#6366f1", marginTop: 5 }}>Energy code item will appear in Specification Review</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3" style={{ marginTop: 20 }}>
            <button
              onClick={saveEditProject}
              style={{ flex: 1, background: "#10b981", color: "white", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}
            >
              Save
            </button>
            <button
              onClick={() => setEditProjectOpen(false)}
              style={{ flex: 1, background: "#f3f4f6", color: "#6b7280", padding: "10px 0", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}
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
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-slate-400 text-sm">Loading...</div></div>}>
      <ProjectDetail />
    </Suspense>
  );
}
