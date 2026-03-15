"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps, TabId } from "../tab-types";
import {
  LayoutList, AlignLeft, DollarSign, Quote, FileText,
  HelpCircle, ClipboardList, Briefcase, Calendar, Info,
  CheckCircle2, AlertTriangle, XCircle, ChevronRight,
} from "lucide-react";

interface ScoreItem {
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  tabLink?: TabId;
}

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
export default function ValidatorTab({ projectId, isDemo, project, userId, onNavigateTab }: TabProps) {
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

  const [hasRun] = useState(true);
  const projectData = project;

  // ── buildScore — unchanged logic ─────────────────────────────────────────
  function buildScore(): { items: ScoreItem[]; score: number; grade: string } {
    const items: ScoreItem[] = [];

    // 1. CHECKLIST COMPLETION
    if (isDemo) {
      items.push({ label: "Checklist Progress", status: "warn", message: "68% complete — 30 items still pending", tabLink: "checklist" });
    } else if (checklist) {
      const total = checklist.length;
      const done = checklist.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const pending = total - done;
      if (pct >= 95) {
        items.push({ label: "Checklist Progress", status: "pass", message: `${pct}% complete — ${pending} items remaining` });
      } else if (pct >= 70) {
        items.push({ label: "Checklist Progress", status: "warn", message: `${pct}% complete — ${pending} items still pending`, tabLink: "checklist" });
      } else {
        items.push({ label: "Checklist Progress", status: "fail", message: `Only ${pct}% complete — ${pending} items need attention`, tabLink: "checklist" });
      }
    }

    // 2. CRITICAL PHASES
    if (projectData) {
      const trade = projectData?.trade || "roofing";
      const sysType = projectData?.systemType;
      const dkType = projectData?.deckType;
      const template = getChecklistForTrade(trade, sysType, dkType);
      const criticalPhases = Object.entries(template).filter(([_, p]) => p.critical);
      const checklistItems = isDemo ? [] : (checklist ?? []);
      let allCriticalDone = true;
      for (const [phaseKey, phase] of criticalPhases) {
        const phaseItems = checklistItems.filter((i: any) => i.phaseKey === phaseKey);
        const phaseDone = phaseItems.filter((i: any) => i.status === "done" || i.status === "na").length;
        const phaseTotal = phase.items.length;
        if (isDemo) {
          if (phaseKey === "phase14") {
            items.push({ label: `Critical: ${phase.title}`, status: "fail", message: "Labor pricing phase 0% complete — high risk of underestimate", tabLink: "checklist" });
            allCriticalDone = false;
          }
        } else if (phaseDone < phaseTotal) {
          allCriticalDone = false;
          const pct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          if (pct < 50) {
            items.push({ label: `Critical: ${phase.title}`, status: "fail", message: `Only ${pct}% done — this phase has high impact on bid accuracy`, tabLink: "checklist" });
          } else {
            items.push({ label: `Critical: ${phase.title}`, status: "warn", message: `${pct}% done — finish before submitting`, tabLink: "checklist" });
          }
        }
      }
      if (allCriticalDone && !isDemo) {
        items.push({ label: "Critical Phases", status: "pass", message: "All critical phases completed" });
      }
    }

    // 3. VENDOR QUOTES
    const quoteList = isDemo ? null : quotes;
    if (isDemo) {
      items.push({ label: "Vendor Quotes", status: "warn", message: "2 of 5 quotes expired — request updated pricing", tabLink: "quotes" });
    } else if (quoteList) {
      const total = quoteList.length;
      const expired = quoteList.filter((q: any) => {
        if (q.status === "expired") return true;
        if (!q.expirationDate) return false;
        return new Date(q.expirationDate) < new Date();
      }).length;
      const expiring = quoteList.filter((q: any) => {
        if (q.status === "expiring") return true;
        if (!q.expirationDate) return false;
        const daysLeft = Math.ceil((new Date(q.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 && daysLeft <= 14;
      }).length;
      const noQuote = quoteList.filter((q: any) => q.status === "none" || q.status === "requested").length;
      if (expired > 0) items.push({ label: "Expired Quotes", status: "fail", message: `${expired} quote${expired !== 1 ? "s" : ""} expired — pricing is stale`, tabLink: "quotes" });
      if (expiring > 0) items.push({ label: "Expiring Quotes", status: "warn", message: `${expiring} quote${expiring !== 1 ? "s" : ""} expiring within 14 days`, tabLink: "quotes" });
      if (noQuote > 0) items.push({ label: "Missing Quotes", status: "warn", message: `${noQuote} vendor${noQuote !== 1 ? "s" : ""} with no quote on file`, tabLink: "quotes" });
      if (expired === 0 && expiring === 0 && noQuote === 0 && total > 0) items.push({ label: "Vendor Quotes", status: "pass", message: `All ${total} quotes current and valid` });
      if (total === 0) items.push({ label: "Vendor Quotes", status: "fail", message: "No vendor quotes logged — add quotes before submitting", tabLink: "quotes" });
    }

    // 4. RFIs
    const rfiList = isDemo ? null : rfis;
    if (isDemo) {
      items.push({ label: "Open RFIs", status: "warn", message: "1 RFI still awaiting response from GC", tabLink: "rfis" });
    } else if (rfiList) {
      const open = rfiList.filter((r: any) => r.status === "sent").length;
      const draft = rfiList.filter((r: any) => r.status === "draft").length;
      if (open > 0) items.push({ label: "Open RFIs", status: "warn", message: `${open} RFI${open !== 1 ? "s" : ""} sent but not yet answered`, tabLink: "rfis" });
      if (draft > 0) items.push({ label: "Draft RFIs", status: "warn", message: `${draft} RFI${draft !== 1 ? "s" : ""} in draft — send or delete before bid day`, tabLink: "rfis" });
      if (open === 0 && draft === 0) items.push({ label: "RFIs", status: "pass", message: rfiList.length > 0 ? `All ${rfiList.length} RFIs resolved` : "No RFIs — good to go" });
    }

    // 5. BID DATE
    if (projectData?.bidDate) {
      const bidDate = new Date(projectData.bidDate);
      const daysLeft = Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) items.push({ label: "Bid Date", status: "fail", message: "Bid date has PASSED" });
      else if (daysLeft === 0) items.push({ label: "Bid Date", status: "fail", message: "Bid is due TODAY" });
      else if (daysLeft <= 2) items.push({ label: "Bid Date", status: "warn", message: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} until bid — verify everything is ready` });
      else items.push({ label: "Bid Date", status: "pass", message: `${daysLeft} days until bid date` });
    }

    // 6. PROJECT COMPLETENESS
    if (projectData) {
      const missing: string[] = [];
      if (!projectData?.gc) missing.push("GC");
      if (!projectData?.sqft) missing.push("Square footage");
      if (!projectData?.estimatedValue) missing.push("Estimated value");
      if (missing.length > 0) items.push({ label: "Project Info", status: "warn", message: `Missing: ${missing.join(", ")}` });
      else items.push({ label: "Project Info", status: "pass", message: "All project details filled in" });
    }

    // 7. SCOPE COVERAGE
    if (isDemo) {
      items.push({ label: "Scope Coverage", status: "fail", message: "Only 52% addressed — 19 scope items need review before bid", tabLink: "scope" });
    } else if (scopeItems) {
      const total = scopeItems.length;
      const addressed = scopeItems.filter((s: { status: string }) => s.status !== "unaddressed").length;
      const pct = total > 0 ? Math.round((addressed / total) * 100) : 0;
      const remaining = total - addressed;
      if (total === 0) {
        items.push({ label: "Scope Coverage", status: "warn", message: "No scope items initialized — open the Scope tab to generate", tabLink: "scope" });
      } else if (pct === 100) {
        items.push({ label: "Scope Coverage", status: "pass", message: `All ${total} scope items addressed` });
      } else if (pct >= 80) {
        items.push({ label: "Scope Coverage", status: "warn", message: `${pct}% addressed — ${remaining} item${remaining !== 1 ? "s" : ""} still need review`, tabLink: "scope" });
      } else {
        items.push({ label: "Scope Coverage", status: "fail", message: `Only ${pct}% addressed — ${remaining} scope item${remaining !== 1 ? "s" : ""} need review before bid`, tabLink: "scope" });
      }
    }

    // 8. ADDENDA REVIEW
    if (isDemo) {
      items.push({ label: "Addenda Review", status: "fail", message: "Addendum #3 affects scope and has not been re-priced", tabLink: "addenda" });
    } else if (addenda) {
      const total = addenda.length;
      const notReviewed = addenda.filter((a: any) => a.affectsScope === undefined || a.affectsScope === null).length;
      const needsRePrice = addenda.filter((a: any) => a.affectsScope === true && !a.repriced).length;
      if (total === 0) {
        items.push({ label: "Addenda Review", status: "pass", message: "No addenda received" });
      } else if (needsRePrice > 0) {
        const nums = addenda.filter((a: any) => a.affectsScope === true && !a.repriced).map((a: any) => `#${a.number}`).join(", ");
        items.push({ label: "Addenda Review", status: "fail", message: `Addend${needsRePrice !== 1 ? "a" : "um"} ${nums} affect${needsRePrice === 1 ? "s" : ""} scope — not re-priced`, tabLink: "addenda" });
      } else if (notReviewed > 0) {
        items.push({ label: "Addenda Review", status: "warn", message: `${notReviewed} addend${notReviewed !== 1 ? "a" : "um"} not yet reviewed`, tabLink: "addenda" });
      } else {
        items.push({ label: "Addenda Review", status: "pass", message: `All ${total} addenda reviewed${addenda.some((a: any) => a.affectsScope && a.repriced) ? " and re-priced" : ""}` });
      }
    }

    // 9. PRICING
    if (isDemo) {
      items.push({ label: "Pricing", status: "pass", message: "Bid amount and cost breakdown complete" });
    } else if (projectData) {
      const bidAmt = (projectData as any)?.totalBidAmount;
      const matCost = (projectData as any)?.materialCost;
      const labCost = (projectData as any)?.laborCost;
      if (!bidAmt) {
        items.push({ label: "Pricing", status: "fail", message: "No bid amount entered — complete pricing before submitting", tabLink: "pricing" });
      } else if (!matCost || !labCost) {
        items.push({ label: "Pricing", status: "warn", message: "Bid amount set but missing material or labor breakdown", tabLink: "pricing" });
      } else {
        items.push({ label: "Pricing", status: "pass", message: `Total bid $${bidAmt.toLocaleString()} with full cost breakdown` });
      }
    }

    // 10. GENERAL CONDITIONS
    if (isDemo) {
      items.push({ label: "General Conditions", status: "pass", message: "GC costs and markups entered", tabLink: "generalconditions" });
    } else if (gcItems !== undefined) {
      const lineItems = gcItems.filter((i: any) => !i.isMarkup && i.total);
      const priced = lineItems.length;
      if (priced === 0) {
        items.push({ label: "General Conditions", status: "warn", message: "No GC costs entered — open Gen. Conds to add site, safety, and fee items", tabLink: "generalconditions" });
      } else if (priced < 3) {
        items.push({ label: "General Conditions", status: "warn", message: `Only ${priced} GC item${priced !== 1 ? "s" : ""} priced — review all categories`, tabLink: "generalconditions" });
      } else {
        items.push({ label: "General Conditions", status: "pass", message: `${priced} GC line items priced`, tabLink: "generalconditions" });
      }
    }

    // 11. BID QUALIFICATIONS
    if (isDemo) {
      items.push({ label: "Bid Qualifications", status: "pass", message: "Basis of bid, labor type, insurance, and schedule documented" });
    } else if (bidQuals) {
      const filled = !!(bidQuals.plansDated && bidQuals.laborType && bidQuals.insuranceProgram && bidQuals.estimatedDuration);
      if (filled) {
        items.push({ label: "Bid Qualifications", status: "pass", message: "Basis of bid, labor, insurance, and schedule documented" });
      } else {
        const missing: string[] = [];
        if (!bidQuals.plansDated) missing.push("plans dated");
        if (!bidQuals.laborType) missing.push("labor type");
        if (!bidQuals.insuranceProgram) missing.push("insurance");
        if (!bidQuals.estimatedDuration) missing.push("schedule");
        items.push({ label: "Bid Qualifications", status: "warn", message: `Complete Bid Qualifications before submitting — missing: ${missing.join(", ")}`, tabLink: "bidquals" });
      }
    } else if (!isDemo) {
      items.push({ label: "Bid Qualifications", status: "warn", message: "Complete Bid Qualifications before submitting", tabLink: "bidquals" });
    }

    const total = items.length;
    const passCount = items.filter(i => i.status === "pass").length;
    const warnCount = items.filter(i => i.status === "warn").length;
    const rawScore = total > 0 ? Math.round(((passCount + warnCount * 0.4) / total) * 100) : 0;
    const score = Math.min(100, Math.max(0, rawScore));
    let grade = "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 65) grade = "C";
    else if (score >= 50) grade = "D";
    return { items, score, grade };
  }

  const scoreData = (hasRun && (isDemo || projectData)) ? buildScore() : null;
  if (!scoreData) return null;

  const fails   = scoreData.items.filter(i => i.status === "fail");
  const warns   = scoreData.items.filter(i => i.status === "warn");
  const passes  = scoreData.items.filter(i => i.status === "pass");
  const total   = scoreData.items.length;
  const isReady = fails.length === 0;
  const allPass = fails.length === 0 && warns.length === 0;

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

            return (
              <div
                key={label}
                onClick={() => canNavigate && onNavigateTab?.(tabId!)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${border}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: canNavigate ? "pointer" : "default",
                  transition: "box-shadow 0.15s, transform 0.1s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
                      <button onClick={() => onNavigateTab?.(item.tabLink!)} className="shrink-0 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full hover:bg-red-100 transition-colors border-0 cursor-pointer">
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
                      <button onClick={() => onNavigateTab?.(item.tabLink!)} className="shrink-0 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full hover:bg-amber-100 transition-colors border-0 cursor-pointer">
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
        const pd = project as any;
        // Materials: prefer computed from projectMaterials, fall back to project field
        const computedMat = (projectMaterials ?? []).reduce((s: number, m: any) => s + (m.totalCost || 0), 0);
        const sumMaterial: number | null = isDemo ? 612000 : (computedMat > 0 ? Math.round(computedMat) : (pd?.materialCost ?? null));
        const sumLabor: number | null    = isDemo ? 488000 : (pd?.laborCost ?? null);

        // GC breakdown from gcItems
        const gcLineItems   = isDemo ? [] : (gcItems ?? []);
        const gcNonMarkup   = gcLineItems.filter((i: any) => !i.isMarkup);
        const gcMarkupRows  = gcLineItems.filter((i: any) => i.isMarkup);
        const gcLineTotal   = gcNonMarkup.reduce((s: number, i: any) => s + (i.total ?? 0), 0);
        const gcMarkupBase  = (sumMaterial ?? 0) + (sumLabor ?? 0) + gcLineTotal;
        const gcMarkupTotal = gcMarkupRows.reduce((s: number, i: any) => s + gcMarkupBase * ((i.markupPct ?? 0) / 100), 0);

        // Demo GC constants
        const demoGCLine    = 13600;
        const demoMBase     = 612000 + 488000 + demoGCLine;
        const demoMarkup    = Math.round(demoMBase * 0.21);

        const sumGCLine: number | null    = isDemo ? demoGCLine : (gcLineTotal  > 0 ? gcLineTotal  : null);
        const sumMarkup: number | null    = isDemo ? demoMarkup : (gcMarkupTotal > 0 ? gcMarkupTotal : null);
        const sumSubtotal: number | null  = sumMaterial !== null || sumLabor !== null
          ? (sumMaterial ?? 0) + (sumLabor ?? 0) + (isDemo ? demoGCLine : gcLineTotal)
          : null;
        const sumTotalBid: number | null  = isDemo ? 1250000 : (pd?.totalBidAmount ?? null);
        const sumSqft: number | null      = isDemo ? 68000   : (pd?.grossRoofArea ?? pd?.sqft ?? null);
        const sumDpSF: number | null      = sumTotalBid && sumSqft && sumSqft > 0 ? sumTotalBid / sumSqft : null;

        // Overhead + Profit line items
        const overheadRow = isDemo ? { description: "Overhead",    markupPct: 10 } : gcMarkupRows.find((i: any) => i.description?.toLowerCase().includes("overhead"));
        const profitRow   = isDemo ? { description: "Profit",      markupPct: 8  } : gcMarkupRows.find((i: any) => i.description?.toLowerCase().includes("profit"));
        const overheadAmt = overheadRow ? (isDemo ? demoMBase : gcMarkupBase) * ((overheadRow.markupPct ?? 0) / 100) : null;
        const profitAmt   = profitRow   ? (isDemo ? demoMBase : gcMarkupBase) * ((profitRow.markupPct   ?? 0) / 100) : null;

        // Right column — project facts
        const bidDateStr  = pd?.bidDate   ?? (isDemo ? "2026-03-07" : null);
        const daysLeft    = bidDateStr ? Math.ceil((new Date(bidDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const laborMap: Record<string, string> = { open_shop: "Open Shop", prevailing_wage: "Prevailing Wage", union: "Union" };
        const laborKey   = isDemo ? "open_shop" : (bidQuals?.laborType ?? "");
        const laborLabel = laborKey ? (laborMap[laborKey] ?? null) : null;
        const planDate    = isDemo ? "02/10/2026" : (bidQuals?.plansDated ?? null);
        const addendaThru = isDemo ? 2 : (bidQuals?.addendaThrough ?? (addenda ? addenda.length : null));
        const systemLabel = pd?.systemType ? pd.systemType.toUpperCase() : null;

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
        );
      })()}

      {/* ── ZONE 5: Submit gate ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        {fails.length > 0 ? (
          <>
            <div className="text-2xl mb-2">🚫</div>
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-1">Not Ready to Submit</h3>
            <p className="text-xs text-slate-500 mb-4">Resolve all failing checks before exporting your bid package.</p>
            <a href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`} target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              📄 Export Draft (with warnings)
            </a>
          </>
        ) : warns.length > 0 ? (
          <>
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-1">Ready with Warnings</h3>
            <p className="text-xs text-slate-500 mb-4">No blockers, but {warns.length} item{warns.length > 1 ? "s" : ""} should be reviewed.</p>
            <a href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`} target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              📄 Export Bid Summary
            </a>
          </>
        ) : (
          <>
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-1">Ready to Submit</h3>
            <p className="text-xs text-slate-500 mb-4">All checks passed. Your bid is ready.</p>
            <a href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`} target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              📄 Export Bid Package
            </a>
          </>
        )}
      </div>

    </div>
  );
}
