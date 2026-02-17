"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import type { TabProps, TabId } from "../tab-types";

interface ScoreItem {
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  tabLink?: TabId;
}

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

  const [hasRun, setHasRun] = useState(true);

  const projectData = project;

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

    // Calculate score
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

  const gradeColors: Record<string, string> = {
    A: "text-emerald-600 border-emerald-500",
    B: "text-blue-600 border-blue-500",
    C: "text-amber-600 border-amber-500",
    D: "text-orange-400 border-orange-500",
    F: "text-red-600 border-red-500",
  };

  return (
    <div className="flex flex-col gap-6">
      {scoreData ? (
        <div className="flex flex-col gap-4">
          {/* Focused status */}
          {scoreData.items.filter(i => i.status === "fail").length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-red-800">Not ready — {scoreData.items.filter(i => i.status === "fail").length} checks failing</div>
                  <p className="text-xs text-red-600 mt-0.5">Fix these before submitting your bid</p>
                </div>
                <div className="text-2xl font-extrabold text-red-600">{scoreData.score}<span className="text-sm font-normal text-red-400">/100</span></div>
              </div>
              <div className="h-2 bg-red-100 rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full ${scoreData.score >= 90 ? "bg-emerald-500" : scoreData.score >= 65 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${scoreData.score}%` }} />
              </div>
            </div>
          ) : scoreData.items.filter(i => i.status === "warn").length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-amber-800">Ready with {scoreData.items.filter(i => i.status === "warn").length} warnings</div>
                  <p className="text-xs text-amber-600 mt-0.5">Review warnings before submitting</p>
                </div>
                <div className="text-2xl font-extrabold text-amber-600">{scoreData.score}<span className="text-sm font-normal text-amber-400">/100</span></div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-emerald-700">All {scoreData.items.length} checks passing ✓</div>
                  <p className="text-xs text-emerald-600 mt-0.5">Bid is ready to submit</p>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600">{scoreData.score}<span className="text-sm font-normal text-emerald-400">/100</span></div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {scoreData.items.filter(i => i.status === "fail").map((item, idx) => (
              <div key={`fail-${idx}`} className="bg-white rounded-lg border-l-4 border-red-500 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-lg mt-0.5">X</span>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.label}</div>
                    <div className="text-[13px] text-slate-500 mt-0.5">{item.message}</div>
                  </div>
                </div>
                {item.tabLink && (
                  <button onClick={() => onNavigateTab?.(item.tabLink!)} className="shrink-0 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-500/30 transition-colors">
                    Fix
                  </button>
                )}
              </div>
            ))}
            {scoreData.items.filter(i => i.status === "warn").map((item, idx) => (
              <div key={`warn-${idx}`} className="bg-white rounded-lg border-l-4 border-amber-500 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 font-bold text-lg mt-0.5">!</span>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.label}</div>
                    <div className="text-[13px] text-slate-500 mt-0.5">{item.message}</div>
                  </div>
                </div>
                {item.tabLink && (
                  <button onClick={() => onNavigateTab?.(item.tabLink!)} className="shrink-0 px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded hover:bg-amber-500/30 transition-colors">
                    Review
                  </button>
                )}
              </div>
            ))}
            {scoreData.items.filter(i => i.status === "pass").map((item, idx) => (
              <div key={`pass-${idx}`} className="bg-white rounded-lg border-l-4 border-emerald-500 p-4 flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg mt-0.5">&#10003;</span>
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.label}</div>
                  <div className="text-[13px] text-slate-500 mt-0.5">{item.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SUBMIT GATE + EXPORT ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {scoreData.items.some(i => i.status === "fail") ? (
              <div className="text-center">
                <div className="text-3xl mb-2">🚫</div>
                <h3 className="text-sm font-bold text-red-600 uppercase">Not Ready to Submit</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Resolve all failing checks before exporting your bid package.</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`}
                    target="_blank"
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    📄 Export Draft (with warnings)
                  </a>
                </div>
              </div>
            ) : scoreData.items.some(i => i.status === "warn") ? (
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <h3 className="text-sm font-bold text-amber-600 uppercase">Ready with Warnings</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">No blockers, but {scoreData.items.filter(i => i.status === "warn").length} item{scoreData.items.filter(i => i.status === "warn").length > 1 ? "s" : ""} should be reviewed.</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`}
                    target="_blank"
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    📄 Export Bid Summary
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="text-sm font-bold text-emerald-600 uppercase">Ready to Submit</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">All checks passed. Your bid is ready.</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={`/bidshield/export?id=${projectId}${isDemo ? "&demo=true" : ""}`}
                    target="_blank"
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    📄 Export Bid Summary
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="text-6xl mb-4">&#128737;&#65039;</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Validate Your Bid</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Check checklist completion, quote freshness, open RFIs, and bid date readiness before you submit.
          </p>
          <button onClick={() => setHasRun(true)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-900 text-sm font-semibold rounded-lg transition-colors">
            Run Validation
          </button>
        </div>
      )}
    </div>
  );
}
