"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import Link from "next/link";

interface ScoreItem {
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  link?: string;
}

function ValidatorContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("project");
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const isValidConvexId = projectIdParam && !projectIdParam.startsWith("demo_");

  // Convex queries — all project data
  const project = useQuery(
    api.bidshield.getProject,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const checklist = useQuery(
    api.bidshield.getChecklist,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const quotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && userId ? { userId, projectId: isValidConvexId ? (projectIdParam as Id<"bidshield_projects">) : undefined } : "skip"
  );
  const rfis = useQuery(
    api.bidshield.getRFIs,
    !isDemo && isValidConvexId ? { projectId: projectIdParam as Id<"bidshield_projects"> } : "skip"
  );
  const projects = useQuery(
    api.bidshield.getProjects,
    !isDemo && userId ? { userId } : "skip"
  );

  const [selectedProject, setSelectedProject] = useState<string>(projectIdParam || "");
  const [hasRun, setHasRun] = useState(!!projectIdParam);

  // Demo data
  const demoProject = {
    name: "Harbor Point Tower",
    location: "Jersey City, NJ",
    bidDate: "2026-02-15",
    status: "in_progress",
    trade: "roofing",
    systemType: "tpo",
    deckType: "steel",
    sqft: 45000,
    estimatedValue: 850000,
  };

  const projectData = isDemo ? demoProject : project;

  // Build score when we have data
  function buildScore(): { items: ScoreItem[]; score: number; grade: string } {
    const items: ScoreItem[] = [];
    const demoQ = isDemo ? "&demo=true" : "";
    const pq = projectIdParam ? `project=${projectIdParam}${demoQ}` : "";

    // 1. CHECKLIST COMPLETION
    if (isDemo) {
      items.push({ label: "Checklist Progress", status: "warn", message: "68% complete — 30 items still pending", link: `/bidshield/dashboard/checklist?${pq}` });
    } else if (checklist) {
      const total = checklist.length;
      const done = checklist.filter((i: { status: string }) => i.status === "done" || i.status === "na").length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const pending = total - done;
      if (pct >= 95) {
        items.push({ label: "Checklist Progress", status: "pass", message: `${pct}% complete — ${pending} items remaining` });
      } else if (pct >= 70) {
        items.push({ label: "Checklist Progress", status: "warn", message: `${pct}% complete — ${pending} items still pending`, link: `/bidshield/dashboard/checklist?${pq}` });
      } else {
        items.push({ label: "Checklist Progress", status: "fail", message: `Only ${pct}% complete — ${pending} items need attention`, link: `/bidshield/dashboard/checklist?${pq}` });
      }
    }

    // 2. CRITICAL PHASES
    if (projectData) {
      const trade = (projectData as any)?.trade || "roofing";
      const sysType = (projectData as any)?.systemType;
      const dkType = (projectData as any)?.deckType;
      const template = getChecklistForTrade(trade, sysType, dkType);
      const criticalPhases = Object.entries(template).filter(([_, p]) => p.critical);
      const checklistItems = isDemo ? [] : (checklist ?? []);

      let allCriticalDone = true;
      for (const [phaseKey, phase] of criticalPhases) {
        const phaseItems = checklistItems.filter((i: any) => i.phaseKey === phaseKey);
        const phaseDone = phaseItems.filter((i: any) => i.status === "done" || i.status === "na").length;
        const phaseTotal = phase.items.length;
        if (isDemo) {
          // Demo: show one critical warning
          if (phaseKey === "phase14") {
            items.push({ label: `Critical: ${phase.title}`, status: "fail", message: "Labor pricing phase 0% complete — high risk of underestimate", link: `/bidshield/dashboard/checklist?${pq}` });
            allCriticalDone = false;
          }
        } else if (phaseDone < phaseTotal) {
          allCriticalDone = false;
          const pct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          if (pct < 50) {
            items.push({ label: `Critical: ${phase.title}`, status: "fail", message: `Only ${pct}% done — this phase has high impact on bid accuracy`, link: `/bidshield/dashboard/checklist?${pq}` });
          } else {
            items.push({ label: `Critical: ${phase.title}`, status: "warn", message: `${pct}% done — finish before submitting`, link: `/bidshield/dashboard/checklist?${pq}` });
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
      items.push({ label: "Vendor Quotes", status: "warn", message: "2 of 5 quotes expired — request updated pricing", link: `/bidshield/dashboard/quotes?${pq}` });
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

      if (expired > 0) {
        items.push({ label: "Expired Quotes", status: "fail", message: `${expired} quote${expired !== 1 ? "s" : ""} expired — pricing is stale`, link: `/bidshield/dashboard/quotes?${pq}` });
      }
      if (expiring > 0) {
        items.push({ label: "Expiring Quotes", status: "warn", message: `${expiring} quote${expiring !== 1 ? "s" : ""} expiring within 14 days`, link: `/bidshield/dashboard/quotes?${pq}` });
      }
      if (noQuote > 0) {
        items.push({ label: "Missing Quotes", status: "warn", message: `${noQuote} vendor${noQuote !== 1 ? "s" : ""} with no quote on file`, link: `/bidshield/dashboard/quotes?${pq}` });
      }
      if (expired === 0 && expiring === 0 && noQuote === 0 && total > 0) {
        items.push({ label: "Vendor Quotes", status: "pass", message: `All ${total} quotes current and valid` });
      }
      if (total === 0) {
        items.push({ label: "Vendor Quotes", status: "fail", message: "No vendor quotes logged — add quotes before submitting", link: `/bidshield/dashboard/quotes?${pq}` });
      }
    }

    // 4. RFIs
    const rfiList = isDemo ? null : rfis;
    if (isDemo) {
      items.push({ label: "Open RFIs", status: "warn", message: "1 RFI still awaiting response from GC", link: `/bidshield/dashboard/rfis?${pq}` });
    } else if (rfiList) {
      const open = rfiList.filter((r: any) => r.status === "sent").length;
      const draft = rfiList.filter((r: any) => r.status === "draft").length;
      if (open > 0) {
        items.push({ label: "Open RFIs", status: "warn", message: `${open} RFI${open !== 1 ? "s" : ""} sent but not yet answered`, link: `/bidshield/dashboard/rfis?${pq}` });
      }
      if (draft > 0) {
        items.push({ label: "Draft RFIs", status: "warn", message: `${draft} RFI${draft !== 1 ? "s" : ""} in draft — send or delete before bid day`, link: `/bidshield/dashboard/rfis?${pq}` });
      }
      if (open === 0 && draft === 0) {
        items.push({ label: "RFIs", status: "pass", message: rfiList.length > 0 ? `All ${rfiList.length} RFIs resolved` : "No RFIs — good to go" });
      }
    }

    // 5. BID DATE
    if (projectData?.bidDate) {
      const bidDate = new Date(projectData.bidDate);
      const daysLeft = Math.ceil((bidDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        items.push({ label: "Bid Date", status: "fail", message: "Bid date has PASSED" });
      } else if (daysLeft === 0) {
        items.push({ label: "Bid Date", status: "fail", message: "Bid is due TODAY" });
      } else if (daysLeft <= 2) {
        items.push({ label: "Bid Date", status: "warn", message: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} until bid — verify everything is ready` });
      } else {
        items.push({ label: "Bid Date", status: "pass", message: `${daysLeft} days until bid date` });
      }
    }

    // 6. PROJECT COMPLETENESS
    if (projectData) {
      const missing: string[] = [];
      if (!(projectData as any)?.gc) missing.push("GC");
      if (!(projectData as any)?.sqft) missing.push("Square footage");
      if (!(projectData as any)?.estimatedValue) missing.push("Estimated value");
      if (missing.length > 0) {
        items.push({ label: "Project Info", status: "warn", message: `Missing: ${missing.join(", ")}` });
      } else {
        items.push({ label: "Project Info", status: "pass", message: "All project details filled in" });
      }
    }

    // Calculate score
    const total = items.length;
    const passCount = items.filter(i => i.status === "pass").length;
    const warnCount = items.filter(i => i.status === "warn").length;
    const failCount = items.filter(i => i.status === "fail").length;
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

  const gradeColors: Record<string, string> = {
    A: "text-emerald-400 border-emerald-500",
    B: "text-blue-400 border-blue-500",
    C: "text-amber-400 border-amber-500",
    D: "text-orange-400 border-orange-500",
    F: "text-red-400 border-red-500",
  };

  // Project selector for non-demo, non-param mode
  const projectList = isDemo ? [] : (projects ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Bid Readiness Validator</h2>
        {!projectIdParam && !isDemo && projectList.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Select a project...</option>
              {projectList.map((p: any) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedProject) {
                  window.location.href = `/bidshield/dashboard/validator?project=${selectedProject}`;
                }
              }}
              disabled={!selectedProject}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Validate
            </button>
          </div>
        )}
      </div>

      {scoreData ? (
        <div className="flex flex-col gap-6">
          {/* Score Header */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col sm:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${gradeColors[scoreData.grade] || gradeColors.F}`}>
              <span className="text-4xl font-bold">{scoreData.grade}</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-lg font-semibold text-white">{projectData?.name || "Project"}</div>
              <div className="text-sm text-slate-400 mt-1">
                Readiness Score: <span className="font-bold text-white">{scoreData.score}/100</span>
              </div>
              <div className="w-full max-w-xs h-3 bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    scoreData.score >= 90 ? "bg-emerald-500" : scoreData.score >= 65 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${scoreData.score}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {scoreData.items.filter(i => i.status === "pass").length}
              </div>
              <div className="text-xs text-slate-400">of {scoreData.items.length} checks passed</div>
            </div>
          </div>

          {/* Summary Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{scoreData.items.filter(i => i.status === "fail").length}</div>
              <div className="text-[11px] text-slate-400">Must Fix</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{scoreData.items.filter(i => i.status === "warn").length}</div>
              <div className="text-[11px] text-slate-400">Warnings</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{scoreData.items.filter(i => i.status === "pass").length}</div>
              <div className="text-[11px] text-slate-400">Passed</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="flex flex-col gap-3">
            {/* Errors first */}
            {scoreData.items.filter(i => i.status === "fail").map((item, idx) => (
              <div key={`fail-${idx}`} className="bg-slate-800 rounded-lg border-l-4 border-red-500 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-lg mt-0.5">X</span>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-[13px] text-slate-400 mt-0.5">{item.message}</div>
                  </div>
                </div>
                {item.link && (
                  <Link href={item.link} className="shrink-0 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-medium rounded hover:bg-red-500/30 transition-colors">
                    Fix
                  </Link>
                )}
              </div>
            ))}
            {/* Warnings */}
            {scoreData.items.filter(i => i.status === "warn").map((item, idx) => (
              <div key={`warn-${idx}`} className="bg-slate-800 rounded-lg border-l-4 border-amber-500 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold text-lg mt-0.5">!</span>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-[13px] text-slate-400 mt-0.5">{item.message}</div>
                  </div>
                </div>
                {item.link && (
                  <Link href={item.link} className="shrink-0 px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded hover:bg-amber-500/30 transition-colors">
                    Review
                  </Link>
                )}
              </div>
            ))}
            {/* Passed */}
            {scoreData.items.filter(i => i.status === "pass").map((item, idx) => (
              <div key={`pass-${idx}`} className="bg-slate-800 rounded-lg border-l-4 border-emerald-500 p-4 flex items-start gap-3">
                <span className="text-emerald-500 font-bold text-lg mt-0.5">&#10003;</span>
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-[13px] text-slate-400 mt-0.5">{item.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <div className="text-6xl mb-4">&#128737;&#65039;</div>
          <h3 className="text-lg font-semibold text-white mb-2">Validate Your Bid</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Select a project to check checklist completion, quote freshness,
            open RFIs, and bid date readiness before you submit.
          </p>
          {isDemo && (
            <button
              onClick={() => {
                window.location.href = "/bidshield/dashboard/validator?project=demo_1&demo=true";
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Run Demo Validation
            </button>
          )}
          {!isDemo && projectList.length === 0 && (
            <p className="text-xs text-slate-500 mt-4">Create a project first, then come back to validate it.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ValidatorPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading validator...</div>}>
      <ValidatorContent />
    </Suspense>
  );
}
