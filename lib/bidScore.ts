// Shared bid readiness scoring utility — single source of truth.
// Used by both ValidatorTab.tsx (live dashboard) and export/page.tsx (PDF).
// Scores MUST be identical for the same project state.

import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";
import { detectScopePricingConflicts } from "@/lib/bidshield/scopePricingConflicts";

export interface ScoreItem {
  label: string;
  status: "pass" | "warn" | "fail";
  message: string;
  tabLink?: string;
}

/** Loose record types — we accept Convex doc shapes without importing generated types. */
interface ProjectRecord {
  [key: string]: unknown;
  trade?: string;
  systemType?: string;
  deckType?: string;
  bidDate?: string;
  gc?: string;
  sqft?: number;
  totalBidAmount?: number;
  materialCost?: number;
  laborCost?: number;
  noAddendaAcknowledged?: boolean;
}

type ChecklistRecord = { phaseKey: string; itemId: string; status: string };
type ScopeRecord = { status: string; name?: string; item?: string; category?: string; cost?: number; note?: string };
type QuoteRecord = { status?: string; expirationDate?: string; vendorName?: string; category?: string; quoteAmount?: number };
type RFIRecord = { status: string };
type AddendumRecord = { number?: number; reviewStatus?: string; affectsScope?: boolean | null; repriced?: boolean };
type BidQualsRecord = { plansDated?: string; laborType?: string; insuranceProgram?: string; estimatedDuration?: string; addendaThrough?: number };
type GCItemRecord = { isMarkup?: boolean; total?: number; description?: string; markupPct?: number; category?: string; quantity?: number; unit?: string; unitCost?: number; notes?: string };
type MaterialRecord = { name: string; category: string; totalCost?: number; calcType?: string; coverageRate?: string | number; coverageSource?: string; wasteFactor?: number; unit?: string; quantity?: number; unitPrice?: number };
type DatasheetRecord = { productName: string; vendorName?: string };
type LaborTaskRecord = { verified: boolean; category?: string; task?: string; totalCost?: number };

export interface BidScoreInput {
  isDemo: boolean;
  project?: ProjectRecord | null;
  checklist?: ChecklistRecord[] | null;
  scopeItems?: ScopeRecord[] | null;
  quotes?: QuoteRecord[] | null;
  rfis?: RFIRecord[] | null;
  addenda?: AddendumRecord[] | null;
  bidQuals?: BidQualsRecord | null;
  gcItems?: GCItemRecord[] | null;
  projectMaterials?: MaterialRecord[] | null;
  datasheets?: DatasheetRecord[] | null;
  laborTasks?: LaborTaskRecord[] | null;
  laborAnalysis?: Record<string, unknown> | null;
  gcFormDocuments?: Record<string, unknown>[] | null;
  unconfirmedGcFormCount?: number | null;
}

export interface BidScoreResult {
  items: ScoreItem[];
  score: number;
  grade: string;
}

export function computeBidScore(input: BidScoreInput): BidScoreResult {
  const {
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
  } = input;

  const items: ScoreItem[] = [];

  // 1. CHECKLIST COMPLETION
  if (isDemo) {
    items.push({ label: "Checklist Progress", status: "warn", message: "68% complete — 30 items still pending", tabLink: "checklist" });
  } else if (checklist) {
    const total = checklist.length;
    const done = checklist.filter((i) => i.status === "done" || i.status === "na").length;
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
    const checklistItems: ChecklistRecord[] = isDemo ? [] : (checklist ?? []);
    let allCriticalDone = true;
    for (const [phaseKey, phase] of criticalPhases) {
      const phaseItems = checklistItems.filter((i) => i.phaseKey === phaseKey);
      const phaseDone = phaseItems.filter((i) => i.status === "done" || i.status === "na").length;
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
    const expired = quoteList.filter((q) => {
      if (q.status === "expired") return true;
      if (!q.expirationDate) return false;
      return new Date(q.expirationDate) < new Date();
    }).length;
    const expiring = quoteList.filter((q) => {
      if (q.status === "expiring") return true;
      if (!q.expirationDate) return false;
      const daysLeft = Math.ceil((new Date(q.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 14;
    }).length;
    const noQuote = quoteList.filter((q) => q.status === "none" || q.status === "requested").length;
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
    const open = rfiList.filter((r) => r.status === "sent").length;
    const draft = rfiList.filter((r) => r.status === "draft").length;
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
    if (!projectData?.totalBidAmount) missing.push("Bid amount");
    if (missing.length > 0) items.push({ label: "Project Info", status: "warn", message: `Missing: ${missing.join(", ")}` });
    else items.push({ label: "Project Info", status: "pass", message: "All project details filled in" });
  }

  // 7. SCOPE COVERAGE
  if (isDemo) {
    items.push({ label: "Scope Coverage", status: "fail", message: "Only 52% addressed — 19 scope items need review before bid", tabLink: "scope" });
  } else if (scopeItems) {
    const total = scopeItems.length;
    const addressed = scopeItems.filter((s) => s.status !== "unaddressed").length;
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
    items.push({ label: "Addenda Review", status: "fail", message: "Addendum #3 is pending review — must be reviewed before submitting", tabLink: "addenda" });
  } else if (addenda) {
    const total = addenda.length;
    // reviewStatus is authoritative; treat missing reviewStatus as pending_review
    const pendingReview = addenda.filter((a) => !a.reviewStatus || a.reviewStatus === "pending_review").length;
    const needsRePrice = addenda.filter((a) => a.affectsScope === true && !a.repriced).length;
    if (total === 0) {
      if (projectData?.noAddendaAcknowledged) {
        items.push({ label: "Addenda Review", status: "pass", message: "No addenda confirmed ✓" });
      } else {
        items.push({ label: "Addenda Review", status: "warn", message: "Confirm: no addenda received for this project?", tabLink: "addenda" });
      }
    } else if (pendingReview > 0) {
      const nums = addenda.filter((a) => !a.reviewStatus || a.reviewStatus === "pending_review").map((a) => `#${a.number}`).join(", ");
      items.push({ label: "Addenda Review", status: "fail", message: `Addend${pendingReview !== 1 ? "a" : "um"} ${nums} pending review — must acknowledge before submitting`, tabLink: "addenda" });
    } else if (needsRePrice > 0) {
      const nums = addenda.filter((a) => a.affectsScope === true && !a.repriced).map((a) => `#${a.number}`).join(", ");
      items.push({ label: "Addenda Review", status: "fail", message: `Addend${needsRePrice !== 1 ? "a" : "um"} ${nums} affect${needsRePrice === 1 ? "s" : ""} scope — not re-priced`, tabLink: "addenda" });
    } else {
      const maxNum = Math.max(...addenda.map((a) => a.number ?? 0));
      items.push({ label: "Addenda Review", status: "pass", message: `Addenda #1–#${maxNum} acknowledged ✓` });
    }
  }

  // 9. PRICING
  if (isDemo) {
    items.push({ label: "Pricing", status: "pass", message: "Bid amount and cost breakdown complete" });
  } else if (projectData) {
    const bidAmt = projectData?.totalBidAmount;
    const matCost = projectData?.materialCost;
    const labCost = projectData?.laborCost;
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
  } else if (gcItems !== undefined && gcItems !== null) {
    const lineItems = gcItems.filter((i) => !i.isMarkup && i.total);
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

  // 12. MATERIAL PRICING GAPS
  if (!isDemo && projectMaterials && datasheets) {
    const WASTE_REQUIRED = new Set(["membrane", "insulation", "fasteners"]);
    const hasQuoteMatch = (name: string): boolean => {
      const target = name.toLowerCase();
      return datasheets.some((ds) => {
        const p = (ds.productName || "").toLowerCase();
        if (p === target || p.includes(target) || target.includes(p)) return true;
        const words = target.split(/\s+/).filter((w: string) => w.length > 2);
        if (words.length === 0) return false;
        const matched = words.filter((w) => p.includes(w));
        return matched.length / words.length >= 0.4;
      });
    };
    const catTotals: Record<string, number> = {};
    const catHasMatch: Record<string, boolean> = {};
    for (const m of projectMaterials as any[]) {
      const cat = m.category;
      catTotals[cat] = (catTotals[cat] || 0) + (m.totalCost || 0);
      if (!catHasMatch[cat]) catHasMatch[cat] = false;
      if (hasQuoteMatch(m.name)) catHasMatch[cat] = true;
    }
    const uncoveredHighCostCats = Object.entries(catTotals).filter(([cat, cost]) =>
      cost > 5000 && catHasMatch[cat] === false
    );
    if (uncoveredHighCostCats.length > 0) {
      items.push({
        label: "Material Pricing",
        status: "fail",
        message: `${uncoveredHighCostCats.length} material categor${uncoveredHighCostCats.length !== 1 ? "ies have" : "y has"} no vendor quote — get quotes before submitting`,
        tabLink: "materials",
      });
    } else if (projectMaterials.length > 0) {
      const unmatched = projectMaterials.filter(m => !hasQuoteMatch(m.name));
      if (unmatched.length > 0) {
        items.push({
          label: "Material Pricing",
          status: "warn",
          message: `${unmatched.length} material${unmatched.length !== 1 ? "s" : ""} without a matching vendor quote in your library`,
          tabLink: "materials",
        });
      } else {
        items.push({ label: "Material Pricing", status: "pass", message: "All materials matched to vendor quote pricing" });
      }
    }
    // Coverage rates
    const missingCoverage = projectMaterials.filter(m => m.calcType === "coverage" && !m.coverageRate);
    const aiCoverage = projectMaterials.filter(m => m.coverageSource === "ai_estimated");
    if (missingCoverage.length > 0) {
      items.push({
        label: "Coverage Rates",
        status: "warn",
        message: `${missingCoverage.length} material${missingCoverage.length !== 1 ? "s" : ""} missing coverage rate — verify before submitting`,
        tabLink: "materials",
      });
    } else if (aiCoverage.length > 0) {
      items.push({
        label: "Coverage Rates",
        status: "warn",
        message: `${aiCoverage.length} coverage rate${aiCoverage.length !== 1 ? "s" : ""} AI-estimated — verify against spec sheets`,
        tabLink: "materials",
      });
    } else if (projectMaterials.length > 0) {
      items.push({ label: "Coverage Rates", status: "pass", message: "All coverage rates on file" });
    }
    // Waste factors
    const missingWaste = projectMaterials.filter(m =>
      WASTE_REQUIRED.has(m.category) && ((m.wasteFactor ?? 1) - 1) * 100 === 0
    );
    if (missingWaste.length > 0) {
      items.push({
        label: "Waste Factors",
        status: "warn",
        message: `${missingWaste.length} item${missingWaste.length !== 1 ? "s" : ""} (membrane/insulation/fasteners) missing waste factor`,
        tabLink: "materials",
      });
    } else if (projectMaterials.filter(m => WASTE_REQUIRED.has(m.category)).length > 0) {
      items.push({ label: "Waste Factors", status: "pass", message: "Waste factors applied to all membrane, insulation, and fastener items" });
    }
  }

  // 13. LABOR VERIFICATION
  if (isDemo) {
    items.push({ label: "Labor Verification", status: "warn", message: "3 of 8 labor tasks unverified — review before submitting", tabLink: "labor" });
  } else if (laborTasks !== undefined && laborTasks !== null) {
    const total = laborTasks.length;
    if (total === 0) {
      items.push({ label: "Labor Verification", status: "warn", message: "No labor analysis run — open Labor Verification to build your estimate", tabLink: "labor" });
    } else {
      const unverified = laborTasks.filter((t) => !t.verified).length;
      const hasConflict = !!(laborAnalysis as any)?.scheduleConflict;
      if (hasConflict) {
        items.push({ label: "Labor Verification", status: "fail", message: "Schedule conflict — estimated duration exceeds bid requirement. Review Labor Verification.", tabLink: "labor" });
      } else if (unverified > 0) {
        items.push({ label: "Labor Verification", status: "warn", message: `${unverified} of ${total} labor task${total !== 1 ? "s" : ""} not yet verified`, tabLink: "labor" });
      } else {
        items.push({ label: "Labor Verification", status: "pass", message: `All ${total} labor tasks verified` });
      }
    }
  }

  // 14. SCOPE-PRICING CONFLICTS
  if (isDemo) {
    items.push({ label: "Scope-Pricing Conflicts", status: "warn", message: "1 scope item marked Excluded but matching material cost found — review before submitting", tabLink: "scope" });
  } else if (scopeItems && (projectMaterials !== undefined || laborTasks !== undefined)) {
    const conflicts = detectScopePricingConflicts({
      scopeItems,
      projectMaterials: projectMaterials ?? [],
      laborTasks: laborTasks ?? [],
      project: projectData,
    });
    if (conflicts.length === 0) {
      if (scopeItems.length > 0) {
        items.push({ label: "Scope-Pricing Conflicts", status: "pass", message: "No conflicts between scope decisions and pricing" });
      }
    } else {
      // Surface each conflict as a separate score item so they're individually actionable
      for (const c of conflicts) {
        items.push({
          label: "Scope-Pricing Conflicts",
          status: c.severity,
          message: `${c.message} — ${c.detail}`,
          tabLink: "scope",
        });
      }
    }
  }

  // 15. GC BID FORMS (only shown if docs uploaded)
  if (!isDemo && gcFormDocuments !== undefined && gcFormDocuments !== null && gcFormDocuments.length > 0) {
    if (unconfirmedGcFormCount !== null && unconfirmedGcFormCount !== undefined && unconfirmedGcFormCount > 0) {
      items.push({
        label: "GC Bid Forms",
        status: "warn",
        message: `${unconfirmedGcFormCount} GC bid form item${unconfirmedGcFormCount !== 1 ? "s" : ""} need confirmation before submission`,
        tabLink: "bidquals",
      });
    } else if (unconfirmedGcFormCount === 0) {
      items.push({ label: "GC Bid Forms", status: "pass", message: "All GC bid form items confirmed" });
    }
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
