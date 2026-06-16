"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useProGate } from "@/hooks/useProGate";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { DEFAULT_SCOPE_ITEMS, getDynamicScopeItems } from "@/lib/bidshield/scope-defaults";
import { DEMO_SCOPE_ITEMS } from "@/lib/bidshield/demo-data";

type ScopeStatus = "unaddressed" | "included" | "excluded" | "by_others" | "na";
type FilterMode = "all" | "unaddressed" | "included" | "excluded" | "by_others" | "na";

const PILL_OPTIONS: {
  value: ScopeStatus;
  label: string;
  short: string;
  color: string;
  dimBg: string;
  border: string;
}[] = [
  { value: "included",  label: "Included",  short: "Inc",    color: "var(--bs-teal)",  dimBg: "var(--bs-teal-dim)",  border: "var(--bs-teal-border)" },
  { value: "excluded",  label: "Excluded",  short: "Exc",    color: "var(--bs-red)",   dimBg: "var(--bs-red-dim)",   border: "var(--bs-red-border)" },
  { value: "by_others", label: "By Others", short: "Others", color: "var(--bs-blue)",  dimBg: "var(--bs-blue-dim)",  border: "var(--bs-blue-border)" },
  { value: "na",        label: "N/A",       short: "N/A",    color: "var(--bs-text-muted)", dimBg: "rgba(255,255,255,0.06)", border: "var(--bs-border)" },
];

function SegmentedPill({
  value,
  onChange,
}: {
  value: ScopeStatus;
  onChange: (v: ScopeStatus) => void;
}) {
  return (
    <div
      className="flex shrink-0"
      style={{ border: "1px solid var(--bs-border)", borderRadius: 6, overflow: "hidden" }}
    >
      {PILL_OPTIONS.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={(e) => { e.stopPropagation(); onChange(opt.value); }}
            className="transition-all active:opacity-80 cursor-pointer"
            style={{
              height: 28,
              padding: "0 10px",
              fontSize: 11,
              fontWeight: isSelected ? 500 : 400,
              background: isSelected ? opt.dimBg : "transparent",
              color: isSelected ? opt.color : "var(--bs-text-dim)",
              borderLeft: i > 0 ? "1px solid var(--bs-border)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="sm:hidden">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ScopeTab({ projectId, isDemo, isPro, project, userId }: TabProps) {
  const { proGateModal, guardedFetch } = useProGate();
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const clarifications = useQuery(
    api.bidshield.getScopeClarifications,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  // All specs saved in Setup (base spec + addenda). Used so the alignment scan
  // can reuse the already-extracted spec data instead of asking for a re-upload.
  const projectSpecs = useQuery(
    api.bidshield.projectSpecs.listByProject,
    !isDemo && isValidConvexId && userId
      ? { projectId: projectId as Id<"bidshield_projects">, userId }
      : "skip"
  );
  const initScope        = useMutation(api.bidshield.initScopeItems);
  const updateItem       = useMutation(api.bidshield.updateScopeItem);
  const addClarification = useMutation(api.bidshield.addScopeClarification);
  const deleteClarification = useMutation(api.bidshield.deleteScopeClarification);
  const bulkUpdateStatus = useMutation(api.bidshield.bulkUpdateScopeStatus);

  const [demoState, setDemoState]         = useState<any[]>(DEMO_SCOPE_ITEMS);
  const [filter, setFilter]               = useState<FilterMode>("all");
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [copiedExclusions, setCopied]     = useState(false);
  const [demoClarifications, setDemoClarifications] = useState<{ _id: string; text: string; createdAt: number }[]>([]);
  const [newClarText, setNewClarText]     = useState("");
  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [bulkAction, setBulkAction] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);

  const handleBulkAction = useCallback(async (toStatus: ScopeStatus) => {
    if (isDemo || !userId || !isValidConvexId) return;
    setBulkRunning(true);
    try {
      await bulkUpdateStatus({
        projectId: projectId as Id<"bidshield_projects">,
        userId,
        fromStatus: "unaddressed",
        toStatus,
      });
    } catch (e) {
      console.error("Bulk update failed:", e);
    } finally {
      setBulkRunning(false);
      setBulkAction(false);
    }
  }, [isDemo, userId, isValidConvexId, projectId, bulkUpdateStatus]);

  const [aiExclusionsLoading, setAiExclusionsLoading] = useState(false);
  const [aiExclusionsText, setAiExclusionsText]       = useState<string | null>(null);
  const [aiExclusionsSuggestions, setAiExclusionsSuggestions] = useState<{ text: string; reason: string; priority: string }[]>([]);
  const [aiExclusionsError, setAiExclusionsError]     = useState<string | null>(null);

  // Exclusions Validator state
  type ValidatorCategory = { category: string; covered: boolean; coveredBy?: string; riskLevel: "critical" | "high" | "medium"; suggestedLanguage?: string };
  type ValidatorResult = { coverageScore: number; coveredCount: number; missingCount: number; categories: ValidatorCategory[]; topPriority: string };
  const [validatorLoading, setValidatorLoading]   = useState(false);
  const [validatorResult, setValidatorResult]     = useState<ValidatorResult | null>(null);
  const [validatorError, setValidatorError]       = useState<string | null>(null);
  const [validatorExpanded, setValidatorExpanded] = useState(false);

  // Spec-to-Bid Alignment Scanner state
  type AlignmentGap = { specRequirement: string; gapType: string; severity: "critical" | "high" | "medium"; specReference?: string; suggestedAction: string };
  type AlignmentResult = { alignmentScore: number; gapCount: number; criticalGaps: number; gaps: AlignmentGap[]; coveredWell: string[]; executiveSummary: string };
  const [alignLoading, setAlignLoading]     = useState(false);
  const [alignResult, setAlignResult]       = useState<AlignmentResult | null>(null);
  const [alignError, setAlignError]         = useState<string | null>(null);
  const [alignPanelOpen, setAlignPanelOpen] = useState(false);
  // "all" = send every saved spec; a number = index into projectSpecs array
  const [selectedSpecIdx, setSelectedSpecIdx] = useState<"all" | number>("all");
  const [alignExpanded, setAlignExpanded]   = useState(false);
  const alignFileRef = React.useRef<HTMLInputElement>(null);

  const resolvedClarifications = isDemo ? demoClarifications : (clarifications ?? []);

  const items = isDemo ? demoState : (scopeItems ?? []);

  // Counts
  const totalCount       = items.length;
  const unaddressedCount = items.filter((i: any) => i.status === "unaddressed").length;
  const includedCount    = items.filter((i: any) => i.status === "included").length;
  const excludedCount    = items.filter((i: any) => i.status === "excluded").length;
  const byOthersCount    = items.filter((i: any) => i.status === "by_others").length;
  const naCount          = items.filter((i: any) => i.status === "na").length;
  const decidedCount     = totalCount - unaddressedCount;
  const decidedPct       = totalCount > 0 ? Math.round((decidedCount / totalCount) * 100) : 0;
  const includedCost     = items
    .filter((i: any) => i.status === "included")
    .reduce((sum: number, i: any) => sum + (i.cost || 0), 0);
  // E-08: Track excluded item costs so estimators see the savings/risk
  const excludedCost     = items
    .filter((i: any) => i.status === "excluded")
    .reduce((sum: number, i: any) => sum + (i.cost || 0), 0);

  const FILTERS: { id: FilterMode; label: string; count: number }[] = [
    { id: "all",         label: "All",       count: totalCount },
    { id: "unaddressed", label: "Undecided", count: unaddressedCount },
    { id: "included",    label: "Included",  count: includedCount },
    { id: "excluded",    label: "Excluded",  count: excludedCount },
    { id: "by_others",   label: "By Others", count: byOthersCount },
    { id: "na",          label: "N/A",       count: naCount },
  ];

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i: any) => i.status === filter);
  }, [items, filter]);

  // Group by category
  const groups = useMemo(() => {
    const g: Map<string, any[]> = new Map();
    for (const item of filteredItems) {
      const cat = item.category || "General";
      if (!g.has(cat)) g.set(cat, []);
      g.get(cat)!.push(item);
    }
    return g;
  }, [filteredItems]);

  const handleStatusChange = useCallback(async (item: any, newStatus: ScopeStatus) => {
    // Toggle: clicking active status resets to unaddressed
    const status = item.status === newStatus ? "unaddressed" : newStatus;
    if (isDemo) {
      setDemoState(prev => prev.map(i =>
        i._id === item._id ? { ...i, status, cost: status !== "included" ? 0 : i.cost } : i
      ));
      return;
    }
    const updates: any = { itemId: item._id, status };
    if (status !== "included") updates.cost = 0;
    await updateItem(updates);
  }, [isDemo, updateItem]);

  const handleCostChange = useCallback((item: any, value: string) => {
    const cost = value ? parseFloat(value) : 0;
    if (isDemo) { setDemoState(prev => prev.map(i => i._id === item._id ? { ...i, cost } : i)); return; }
    const id = item._id as string;
    const t = debounceRefs.current.get(id);
    if (t) clearTimeout(t);
    debounceRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, cost });
      debounceRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleNoteChange = useCallback((item: any, value: string) => {
    if (isDemo) { setDemoState(prev => prev.map(i => i._id === item._id ? { ...i, note: value } : i)); return; }
    const id = item._id as string;
    const t = debounceRefs.current.get(id);
    if (t) clearTimeout(t);
    debounceRefs.current.set(id, setTimeout(async () => {
      await updateItem({ itemId: item._id, note: value });
      debounceRefs.current.delete(id);
    }, 600));
  }, [isDemo, updateItem]);

  const handleCopyExclusions = () => {
    const excl   = items.filter((i: any) => i.status === "excluded");
    const others = items.filter((i: any) => i.status === "by_others");
    const lines: string[] = [];
    if (excl.length > 0) {
      lines.push("EXCLUSIONS:");
      excl.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`));
    }
    if (others.length > 0) {
      if (lines.length) lines.push("");
      lines.push("BY OTHERS:");
      others.forEach((i: any) => lines.push(`• ${i.name}${i.note ? ` — ${i.note}` : ""}`));
    }
    if (resolvedClarifications.length > 0) {
      if (lines.length) lines.push("");
      lines.push("CLARIFICATIONS & ASSUMPTIONS:");
      resolvedClarifications.forEach((c: any) => lines.push(`• ${c.text}`));
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateExclusions = async () => {
    if (!isPro && !isDemo) return;
    setAiExclusionsLoading(true);
    setAiExclusionsText(null);
    setAiExclusionsError(null);
    try {
      const excl   = items.filter((i: any) => i.status === "excluded");
      const others = items.filter((i: any) => i.status === "by_others");
      const res = await guardedFetch("/api/bidshield/generate-exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedItems: excl.map((i: any) => ({ name: i.name, note: i.note })),
          byOthersItems: others.map((i: any) => ({ name: i.name, note: i.note })),
          clarifications: resolvedClarifications.map((c: any) => ({ text: c.text })),
          systemType: (project as any)?.systemType || undefined,
          projectType: (project as any)?.projectType || undefined,
          gcName: (project as any)?.gc || undefined,
        }),
      });
      if (!res) return;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAiExclusionsError(err?.error ?? "Failed to generate exclusions — please try again.");
        return;
      }
      const data = await res.json();
      if (!data.text) {
        setAiExclusionsError("AI returned an empty response. Please try again.");
        return;
      }
      setAiExclusionsText(data.text);
      setAiExclusionsSuggestions(data.suggestions ?? []);
    } catch {
      setAiExclusionsError("Failed to generate exclusions — check your connection and try again.");
    } finally {
      setAiExclusionsLoading(false);
    }
  };

  const handleValidateExclusions = async () => {
    if (!isPro && !isDemo) return;
    setValidatorLoading(true);
    setValidatorResult(null);
    setValidatorError(null);
    try {
      const excl = items.filter((i: any) => i.status === "excluded");
      const res = await guardedFetch("/api/bidshield/validate-exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exclusions: excl.map((i: any) => i.name).filter(Boolean),
          systemType: (project as any)?.systemType || undefined,
          projectType: (project as any)?.projectType || undefined,
          gcName: (project as any)?.gc || undefined,
          totalBidAmount: (project as any)?.totalBidAmount || undefined,
        }),
      });
      if (!res) return;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setValidatorError(err?.error ?? "Validation failed — please try again.");
        return;
      }
      const data = await res.json();
      setValidatorResult(data);
      setValidatorExpanded(true);
    } catch {
      setValidatorError("Failed to validate exclusions — check your connection and try again.");
    } finally {
      setValidatorLoading(false);
    }
  };

  // Saved spec detection — spec PDFs are uploaded + extracted in the Setup tab.
  // When a spec is already on the project, we reuse that extraction so the
  // estimator doesn't have to re-upload the same PDF in the Scope tab.
  // Cap each spec's extractionJson before sending — full extractions can be
  // 200-500K chars and sending 2+ specs untruncated will exceed the API body
  // limit or Claude's context. 40K chars per spec is enough for alignment.
  const MAX_SPEC_JSON_CHARS = 40_000;
  const savedSpecsPayload = useMemo(() => {
    if (projectSpecs && projectSpecs.length > 0) {
      const specsToUse = selectedSpecIdx === "all"
        ? projectSpecs
        : [projectSpecs[selectedSpecIdx as number]].filter(Boolean);
      return specsToUse.map((s: any) => ({
        label: s.label,
        sourceType: s.sourceType,
        extractionJson: typeof s.extractionJson === "string" && s.extractionJson.length > MAX_SPEC_JSON_CHARS
          ? s.extractionJson.slice(0, MAX_SPEC_JSON_CHARS) + "\n…[truncated for alignment scan]"
          : s.extractionJson,
      }));
    }
    const summary = (project as any)?.specSummary;
    if (typeof summary === "string" && summary.length > 2) {
      return [{ label: "Base Spec", sourceType: "base_spec", extractionJson: summary }];
    }
    return null;
  }, [projectSpecs, project, selectedSpecIdx]);

  const hasSavedSpec = !!savedSpecsPayload && savedSpecsPayload.length > 0;

  const runAlignmentScan = useCallback(async (opts: { pdfBase64?: string } = {}) => {
    if (!isPro && !isDemo) return;
    setAlignLoading(true);
    setAlignResult(null);
    setAlignError(null);
    try {
      const body: Record<string, any> = {
        scopeItems: items.map((i: any) => ({ item: i.name, status: i.status, cost: i.cost })),
        systemType: (project as any)?.systemType || undefined,
        projectType: (project as any)?.projectType || undefined,
        totalBidAmount: (project as any)?.totalBidAmount || undefined,
      };
      if (opts.pdfBase64) {
        body.pdfBase64 = opts.pdfBase64;
      } else if (savedSpecsPayload) {
        body.specs = savedSpecsPayload;
      } else {
        setAlignError("No spec found. Upload the project spec in Setup first.");
        return;
      }

      const res = await guardedFetch("/api/bidshield/scan-spec-alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res) return;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAlignError(err?.error ?? "Scan failed — please try again.");
        return;
      }
      const data = await res.json();
      setAlignResult(data);
      setAlignExpanded(true);
    } catch {
      setAlignError("Scan failed — check your connection and try again.");
    } finally {
      setAlignLoading(false);
    }
  }, [isPro, isDemo, items, project, savedSpecsPayload, guardedFetch]);

  const handleScanAlignment = async (file: File) => {
    const pdfBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const b64 = result.split(",")[1] ?? result;
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      await runAlignmentScan({ pdfBase64 });
    } finally {
      if (alignFileRef.current) alignFileRef.current.value = "";
    }
  };

  const handleAddClarification = useCallback(async () => {
    const text = newClarText.trim();
    if (!text) return;
    if (isDemo) {
      setDemoClarifications(prev => [...prev, { _id: `demo_c_${Date.now()}`, text, createdAt: Date.now() }]);
    } else if (isValidConvexId && userId) {
      await addClarification({ projectId: projectId as Id<"bidshield_projects">, userId, text });
    }
    setNewClarText("");
  }, [newClarText, isDemo, isValidConvexId, userId, projectId, addClarification]);

  const handleDeleteClarification = useCallback(async (id: string) => {
    if (isDemo) {
      setDemoClarifications(prev => prev.filter(c => c._id !== id));
    } else {
      await deleteClarification({ id: id as Id<"bidshield_scope_clarifications"> });
    }
  }, [isDemo, deleteClarification]);

  const handleInitialize = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    const dynamicItems = getDynamicScopeItems(project);
    await initScope({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      items: dynamicItems.map(i => ({ category: i.category, name: i.name, sortOrder: i.sortOrder })),
    });
  }, [isDemo, isValidConvexId, userId, projectId, project, initScope]);

  // Empty state — document-first design
  if (items.length === 0 && !isDemo) {
    const hasSpec = (projectSpecs?.length ?? 0) > 0;
    return (
      <div className="flex flex-col items-center py-12 px-6 max-w-lg mx-auto">
        {/* Primary path: scan from document */}
        <div
          className="w-full rounded-2xl p-6 mb-4 text-center"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-teal-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-teal-dim)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--bs-teal)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: "var(--bs-text-primary)" }}>
            {hasSpec ? "Scan your spec for scope" : "Upload Exhibit A or spec section"}
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--bs-text-muted)", lineHeight: 1.5 }}>
            {hasSpec
              ? "We'll extract what's included, excluded, and by-others directly from your uploaded document."
              : "Upload your Exhibit A or spec section and we'll extract scope items automatically — what's included, excluded, and by others."}
          </p>
          {hasSpec ? (
            <button
              onClick={() => { setAlignPanelOpen(true); runAlignmentScan(); }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              style={{ background: "var(--bs-teal)", color: "#13151a", border: "none" }}
            >
              Scan Uploaded Spec →
            </button>
          ) : (
            <label
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              Upload & Scan Document
              <input
                ref={alignFileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleScanAlignment(f); }}
              />
            </label>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full mb-4">
          <div style={{ flex: 1, height: 1, background: "var(--bs-border)" }} />
          <span style={{ fontSize: 11, color: "var(--bs-text-dim)", whiteSpace: "nowrap" }}>or start from a template</span>
          <div style={{ flex: 1, height: 1, background: "var(--bs-border)" }} />
        </div>

        {/* Secondary path: standard template */}
        <button
          onClick={handleInitialize}
          className="w-full rounded-xl px-5 py-3 text-sm font-medium transition-colors cursor-pointer text-left flex items-center gap-3"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-elevated)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bs-bg-card)"}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bs-bg-elevated)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-secondary)" }}>Use standard roofing template</div>
            <div style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 1 }}>40 common scope items to review and customize</div>
          </div>
          <svg className="ml-auto shrink-0" width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {proGateModal}

      {/* ── SPEC-UPLOADED INLINE BANNER ───────────────────────────────────────
           Contextual nudge when Setup already has a spec but the estimator
           hasn't run the alignment scan yet. Loss-aversion framing ("find gaps
           before you bid") — not accusatory, not "generate", just a CTA. */}
      {(isPro || isDemo) && hasSavedSpec && !alignResult && !alignLoading && !alignPanelOpen && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
          style={{ background: "var(--bs-blue-dim, var(--bs-bg-elevated))", border: "1px solid var(--bs-blue)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bs-blue)" strokeWidth={2} className="shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          <span className="flex-1 text-xs" style={{ color: "var(--bs-text-secondary)" }}>
            Spec uploaded — find scope gaps before you bid
          </span>
          <button
            onClick={() => { setAlignPanelOpen(true); runAlignmentScan(); }}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{ background: "var(--bs-blue)", color: "#13151a", border: "none" }}
          >
            Run Scope Analysis →
          </button>
        </div>
      )}

      {/* ── SPEC-TO-BID ALIGNMENT SCANNER ─────────────────────────────────────── */}
      {(isPro || isDemo) && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--bs-border)", background: "var(--bs-bg-card)" }}>
          <button
            onClick={() => setAlignPanelOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
            style={{ background: "none", border: "none" }}
          >
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--bs-blue)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: "var(--bs-text-primary)" }}>Spec-to-Bid Alignment · AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: "var(--bs-blue-dim, var(--bs-bg-elevated))", color: "var(--bs-blue)" }}>
                {hasSavedSpec ? "Pro · Spec ready" : "Pro · PDF"}
              </span>
              {alignResult && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${alignResult.criticalGaps > 0 ? "bg-red-900/40 text-red-400" : alignResult.gapCount > 0 ? "bg-amber-900/40 text-amber-400" : "bg-teal-900/40 text-teal-400"}`}>
                  {alignResult.criticalGaps > 0 ? `${alignResult.criticalGaps} critical` : alignResult.gapCount > 0 ? `${alignResult.gapCount} gaps` : "aligned"}
                </span>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={2}
              style={{ transform: alignPanelOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {alignPanelOpen && (
            <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--bs-border)" }}>

              {/* ── SPEC SELECTOR — only shown when multiple specs are on the project */}
              {projectSpecs && projectSpecs.length > 1 && (
                <div className="pt-3 flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--bs-text-dim)" }}>
                    Scan against
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSpecIdx("all")}
                      className="text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
                      style={{
                        background: selectedSpecIdx === "all" ? "var(--bs-blue)" : "var(--bs-bg-elevated)",
                        color: selectedSpecIdx === "all" ? "#13151a" : "var(--bs-text-secondary)",
                        border: `1px solid ${selectedSpecIdx === "all" ? "var(--bs-blue)" : "var(--bs-border)"}`,
                      }}
                    >
                      All specs
                    </button>
                    {(projectSpecs as any[]).map((s: any, i: number) => (
                      <button
                        key={s._id ?? i}
                        onClick={() => setSelectedSpecIdx(i)}
                        className="text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer max-w-[180px] truncate"
                        style={{
                          background: selectedSpecIdx === i ? "var(--bs-blue)" : "var(--bs-bg-elevated)",
                          color: selectedSpecIdx === i ? "#13151a" : "var(--bs-text-secondary)",
                          border: `1px solid ${selectedSpecIdx === i ? "var(--bs-blue)" : "var(--bs-border)"}`,
                        }}
                        title={s.label ?? `Spec ${i + 1}`}
                      >
                        {s.label ?? `Spec ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] pt-3" style={{ color: "var(--bs-text-muted)" }}>
                {hasSavedSpec
                  ? "Using the spec you uploaded in Setup. AI cross-references every requirement against your bid scope — flags what's missing, what you excluded that you shouldn't have, and what the spec assigns to you that's marked \"by others.\""
                  : "Upload the project spec PDF. AI reads every requirement and cross-references against your bid scope — flags what's missing, what you excluded that you shouldn't have, and what the spec assigns to you that's marked \"by others.\""}
              </p>

              {/* Hidden file input — only used when no spec is saved yet */}
              <input
                ref={alignFileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleScanAlignment(file);
                }}
              />

              <button
                onClick={() => hasSavedSpec ? runAlignmentScan() : alignFileRef.current?.click()}
                disabled={alignLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-blue)", color: "var(--bs-blue)" }}
              >
                {hasSavedSpec ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                )}
                {alignLoading
                  ? "Scanning spec…"
                  : hasSavedSpec
                    ? "Run Scope Analysis"
                    : "Upload Spec PDF & Scan"}
              </button>

              {hasSavedSpec && (
                <p className="text-[10px] text-center" style={{ color: "var(--bs-text-dim)" }}>
                  Uses the spec from Setup — no re-upload needed.
                </p>
              )}

              {alignError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)" }}>
                  <span className="flex-1">{alignError}</span>
                  <button onClick={() => setAlignError(null)} className="font-medium shrink-0">Dismiss</button>
                </div>
              )}

              {alignResult && (
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${alignResult.criticalGaps > 0 ? "var(--bs-red)" : alignResult.gapCount > 0 ? "var(--bs-amber)" : "var(--bs-teal)"}` }}>
                  {/* Score header */}
                  <div className="flex items-center gap-3 px-4 py-3" style={{ background: "var(--bs-bg-elevated)" }}>
                    <div className="flex items-center justify-center rounded-full text-sm font-bold shrink-0"
                      style={{
                        width: 44, height: 44,
                        background: alignResult.alignmentScore >= 80 ? "var(--bs-teal-dim)" : alignResult.alignmentScore >= 50 ? "var(--bs-amber-dim)" : "var(--bs-red-dim)",
                        border: `2px solid ${alignResult.alignmentScore >= 80 ? "var(--bs-teal)" : alignResult.alignmentScore >= 50 ? "var(--bs-amber)" : "var(--bs-red)"}`,
                        color: alignResult.alignmentScore >= 80 ? "var(--bs-teal)" : alignResult.alignmentScore >= 50 ? "var(--bs-amber)" : "var(--bs-red)",
                      }}>
                      {alignResult.alignmentScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--bs-text-primary)" }}>Spec Alignment Score</p>
                      <p className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
                        {alignResult.gapCount} gaps · {alignResult.criticalGaps} critical
                      </p>
                    </div>
                    <button onClick={() => setAlignExpanded(v => !v)} className="text-xs font-medium shrink-0" style={{ color: "var(--bs-blue)" }}>
                      {alignExpanded ? "Collapse" : "Show gaps"}
                    </button>
                  </div>

                  {/* Summary */}
                  {alignResult.executiveSummary && (
                    <div className="px-4 py-2.5" style={{ background: alignResult.criticalGaps > 0 ? "var(--bs-red-dim)" : "var(--bs-amber-dim)", borderTop: `1px solid ${alignResult.criticalGaps > 0 ? "var(--bs-red-border)" : "var(--bs-amber)"}` }}>
                      <p className="text-xs" style={{ color: "var(--bs-text-secondary)" }}>{alignResult.executiveSummary}</p>
                    </div>
                  )}

                  {/* Gap list */}
                  {alignExpanded && alignResult.gaps.length > 0 && (
                    <div className="divide-y" style={{ borderTop: "1px solid var(--bs-border)" }}>
                      {alignResult.gaps.map((gap, i) => (
                        <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ background: "var(--bs-bg-card)" }}>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5 ${gap.severity === "critical" ? "bg-red-900/40 text-red-400" : gap.severity === "high" ? "bg-amber-900/40 text-amber-400" : "bg-slate-700/60 text-slate-400"}`}>
                            {gap.severity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium" style={{ color: "var(--bs-text-primary)" }}>{gap.specRequirement}</p>
                            {gap.specReference && (
                              <p className="text-[11px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>Ref: {gap.specReference}</p>
                            )}
                            <p className="text-[11px] mt-1" style={{ color: "var(--bs-text-muted)" }}>→ {gap.suggestedAction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Covered well */}
                  {alignExpanded && alignResult.coveredWell.length > 0 && (
                    <div className="px-4 py-3" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-teal-dim)" }}>
                      <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--bs-teal)" }}>✓ Well covered</p>
                      <div className="flex flex-col gap-1">
                        {alignResult.coveredWell.map((item, i) => (
                          <p key={i} className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>• {item}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STATS BAR ── */}
      <div
        className="flex items-center overflow-hidden"
        style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}
      >
        {[
          { label: "Total", value: String(totalCount), color: "var(--bs-text-primary)" },
          { label: "Decided", value: `${decidedPct}%`, color: decidedPct === 100 ? "var(--bs-teal)" : decidedPct > 50 ? "var(--bs-amber)" : "var(--bs-red)" },
          { label: "Included", value: String(includedCount), color: "var(--bs-teal)" },
          { label: "Excluded", value: String(excludedCount), color: "var(--bs-red)" },
          { label: "By Others", value: String(byOthersCount), color: "var(--bs-blue)" },
          ...(unaddressedCount > 0 ? [{ label: "Undecided", value: String(unaddressedCount), color: "var(--bs-text-muted)" }] : []),
          ...(includedCost > 0 ? [{ label: "Included Cost", value: `$${includedCost >= 1000 ? `${(includedCost/1000).toFixed(0)}K` : includedCost.toLocaleString()}`, color: "var(--bs-teal)" }] : []),
          ...(excludedCost > 0 ? [{ label: "Excluded Cost", value: `$${excludedCost >= 1000 ? `${(excludedCost/1000).toFixed(0)}K` : excludedCost.toLocaleString()}`, color: "var(--bs-red)" }] : []),
        ].map(({ label, value, color }, i, arr) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center px-6 py-3.5 flex-1"
            style={{ borderRight: i < arr.length - 1 ? "1px solid var(--bs-border)" : "none" }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-widest mb-1"
              style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}
            >
              {label}
            </span>
            <span className="text-xl font-medium tabular-nums leading-none" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR: filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div style={{ display: "flex", gap: 2, background: "var(--bs-bg-elevated)", padding: 3, borderRadius: 8 }}>
          {FILTERS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="cursor-pointer transition-all"
              style={{
                height: 28, padding: "0 11px", borderRadius: 6, fontSize: 12,
                fontWeight: filter === id ? 500 : 400,
                background: filter === id ? "var(--bs-bg-card)" : "transparent",
                color: filter === id ? "var(--bs-text-primary)" : "var(--bs-text-muted)",
                border: filter === id ? "1px solid var(--bs-border)" : "1px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {label} {count > 0 && <span style={{ opacity: 0.55 }}>({count})</span>}
            </button>
          ))}
        </div>

        {/* E-07: Bulk actions for unaddressed items */}
        {!isDemo && unaddressedCount > 0 && (
          <div className="relative">
            <button
              onClick={() => setBulkAction(!bulkAction)}
              disabled={bulkRunning}
              className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
            >
              {bulkRunning ? "Updating..." : `Bulk: ${unaddressedCount} undecided`}
            </button>
            {bulkAction && (
              <div className="absolute top-full left-0 mt-1 z-50 rounded-lg shadow-lg py-1 min-w-[180px]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                {PILL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleBulkAction(opt.value)}
                    className="w-full text-left px-4 py-2 text-xs cursor-pointer transition-colors hover:opacity-80"
                    style={{ color: opt.color, background: "transparent", border: "none" }}
                  >
                    Mark all undecided → {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setBulkAction(false)}
                  className="w-full text-left px-4 py-2 text-xs cursor-pointer"
                  style={{ color: "var(--bs-text-dim)", background: "transparent", border: "none", borderTop: "1px solid var(--bs-border)" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SCOPE TABLE ── */}
      {filteredItems.length === 0 ? (
        <div
          className="text-center py-12 text-sm"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10, color: "var(--bs-text-dim)" }}
        >
          No items match this filter
        </div>
      ) : (
        <div style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10, overflow: "hidden" }}>
          {Array.from(groups.entries()).map(([category, catItems], groupIdx) => (
            <div key={category} style={{ borderTop: groupIdx > 0 ? "1px solid var(--bs-border)" : "none" }}>
              {/* Category header */}
              <div
                className="px-5 py-2 flex items-center gap-2 sticky top-[44px] z-10"
                style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}
              >
                <span
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}
                >
                  {category}
                </span>
                <span className="text-[10px] font-medium" style={{ color: "var(--bs-text-dim)" }}>{catItems.length}</span>
                {catItems.filter((i: any) => i.status === "unaddressed").length > 0 && (
                  <span className="ml-auto text-[11px] font-medium" style={{ color: "var(--bs-amber)" }}>
                    {catItems.filter((i: any) => i.status === "unaddressed").length} undecided
                  </span>
                )}
              </div>

              {/* Rows */}
              {catItems.map((item: any, idx: number) => {
                const status      = item.status as ScopeStatus;
                const isExpanded  = expandedId === item._id;
                const dotOpt      = PILL_OPTIONS.find(o => o.value === status);
                const dotColor    = dotOpt ? dotOpt.color : "var(--bs-text-dim)";
                // Row accent: 3px inset left bar, color-coded by status.
                // "Bloomberg alert bar" — lets you scan a long list and
                // instantly see which rows are decided / need attention.
                const accentColor = status === "unaddressed"
                  ? "var(--bs-amber)"  // undecided = needs attention
                  : dotColor;

                return (
                  <div key={item._id}>
                    {/* Main row */}
                    <div
                      className="flex items-center gap-3 transition-colors cursor-pointer"
                      style={{
                        minHeight: 44,
                        padding: "0 16px",
                        borderTop: idx > 0 ? "1px solid var(--bs-border)" : undefined,
                        boxShadow: `inset 3px 0 0 ${accentColor}`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    >
                      {/* Item name */}
                      <span className="flex-1 min-w-0 text-[13px] select-none" style={{ color: "var(--bs-text-secondary)" }}>
                        {item.name}
                      </span>

                      {/* Note preview */}
                      {item.note && !isExpanded && (
                        <span
                          className="hidden md:block text-[11px] shrink-0 max-w-[140px] truncate"
                          style={{ color: "var(--bs-text-dim)" }}
                        >
                          {item.note}
                        </span>
                      )}

                      {/* Cost badge */}
                      {item.cost > 0 && (
                        <span className="text-[11px] font-medium shrink-0" style={{ color: "var(--bs-teal)" }}>
                          ${item.cost.toLocaleString()}
                        </span>
                      )}

                      {/* Segmented pill */}
                      <div className="shrink-0" onClick={e => e.stopPropagation()}>
                        <SegmentedPill value={status} onChange={(val) => handleStatusChange(item, val)} />
                      </div>
                    </div>

                    {/* Expanded: cost + note */}
                    {isExpanded && (
                      <div
                        className="flex flex-wrap gap-3 items-center"
                        style={{
                          padding: "10px 16px 10px 32px",
                          background: "var(--bs-bg-elevated)",
                          borderTop: "1px solid var(--bs-border)",
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {status === "included" && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]" style={{ color: "var(--bs-text-dim)" }}>Cost $</span>
                            <input
                              type="number"
                              defaultValue={item.cost || ""}
                              placeholder="0"
                              onBlur={e => handleCostChange(item, e.target.value)}
                              className="w-24 text-[13px] font-medium rounded-md px-2 py-1 focus:outline-none"
                              style={{
                                background: "var(--bs-bg-input)",
                                border: "1px solid var(--bs-border)",
                                color: "var(--bs-teal)",
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          defaultValue={item.note || ""}
                          placeholder="Add note..."
                          onBlur={e => handleNoteChange(item, e.target.value)}
                          className="flex-1 min-w-[160px] text-[12px] rounded-md px-2 py-1 focus:outline-none"
                          style={{
                            background: "var(--bs-bg-input)",
                            border: "1px solid var(--bs-border)",
                            color: "var(--bs-text-muted)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Clarifications & Assumptions */}
      <div style={{ border: "1px solid var(--bs-border)", borderRadius: 10, overflow: "hidden" }}>
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}
        >
          <div>
            <span className="text-[13px] font-medium" style={{ color: "var(--bs-text-primary)" }}>Clarifications &amp; Assumptions</span>
            <span className="ml-2 text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{resolvedClarifications.length} entries</span>
          </div>
          {!isPro && !isDemo && (
            <a href="/bidshield/pricing" className="text-[11px] font-medium" style={{ color: "var(--bs-teal)", textDecoration: "none" }}>
              Pro feature · Upgrade →
            </a>
          )}
        </div>

        {!isPro && !isDemo ? (
          <div className="p-6 text-center" style={{ background: "var(--bs-bg-card)" }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--bs-bg-elevated)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--bs-text-primary)" }}>Clarifications &amp; Assumptions</p>
            <p className="text-xs mb-3" style={{ color: "var(--bs-text-muted)" }}>Document your scope assumptions to prevent change orders. Available on Pro.</p>
            <a
              href="/bidshield/pricing"
              className="inline-block px-4 py-2 text-xs font-medium rounded-lg transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Upgrade to Pro
            </a>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2" style={{ background: "var(--bs-bg-card)" }}>
            {resolvedClarifications.length === 0 && (
              <p className="text-xs py-2" style={{ color: "var(--bs-text-dim)" }}>No clarifications yet. Assumptions that aren&apos;t documented become change orders.</p>
            )}
            {resolvedClarifications.map((c: any) => (
              <div key={c._id} className="flex items-start gap-2 group">
                <span className="mt-0.5 text-[11px] shrink-0" style={{ color: "var(--bs-text-dim)" }}>•</span>
                <span className="flex-1 text-[13px] leading-snug" style={{ color: "var(--bs-text-secondary)" }}>{c.text}</span>
                <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => handleDeleteClarification(c._id)}
                  className="transition-colors text-[12px] shrink-0 opacity-0 group-hover:opacity-100"
                  style={{ color: "var(--bs-text-dim)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newClarText}
                onChange={e => setNewClarText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddClarification(); }}
                placeholder="e.g., Assume single-layer tear-off"
                className="flex-1 text-[13px] rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--bs-bg-input)",
                  border: "1px solid var(--bs-border)",
                  color: "var(--bs-text-secondary)",
                }}
              />
              <button
                onClick={handleAddClarification}
                disabled={!newClarText.trim()}
                className="px-3 py-2 text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40"
                style={{
                  background: "transparent",
                  border: "1px solid var(--bs-border)",
                  color: "var(--bs-text-muted)",
                }}
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(excludedCount > 0 || byOthersCount > 0 || resolvedClarifications.length > 0) && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopyExclusions}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
            style={{
              background: "var(--bs-bg-card)",
              border: "1px solid var(--bs-border)",
              color: "var(--bs-text-muted)",
            }}
          >
            {copiedExclusions ? "Copied to clipboard" : "Copy exclusions for proposal"}
          </button>

          {(isPro || isDemo) ? (
            <button
              onClick={handleGenerateExclusions}
              disabled={aiExclusionsLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {aiExclusionsLoading ? "Generating..." : "Generate Exclusions with AI"}
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-center block transition-all"
              style={{
                background: "var(--bs-bg-elevated)",
                border: "1px solid var(--bs-border)",
                color: "var(--bs-text-dim)",
                textDecoration: "none",
              }}
            >
              Generate Exclusions with AI · Pro
            </a>
          )}

          {(isPro || isDemo) ? (
            <button
              onClick={handleValidateExclusions}
              disabled={validatorLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-amber)", color: "var(--bs-amber)" }}
            >
              {validatorLoading ? "Checking coverage..." : "Validate Exclusions Coverage · AI"}
            </button>
          ) : (
            <a
              href="/bidshield/pricing"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-center block transition-all"
              style={{
                background: "var(--bs-bg-elevated)",
                border: "1px solid var(--bs-border)",
                color: "var(--bs-text-dim)",
                textDecoration: "none",
              }}
            >
              Validate Exclusions Coverage · Pro
            </a>
          )}
        </div>
      )}

      {/* AI Exclusions error */}
      {aiExclusionsError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
          style={{
            background: "var(--bs-red-dim)",
            border: "1px solid var(--bs-red-border)",
            color: "var(--bs-red)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="flex-1">{aiExclusionsError}</span>
          <button
            onClick={() => setAiExclusionsError(null)}
            className="font-medium text-xs shrink-0"
            style={{ color: "var(--bs-red)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Exclusions result */}
      {aiExclusionsText && (
        <div
          className="rounded-lg p-4"
          style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: "var(--bs-teal)" }}>AI-Generated Exclusions</span>
            <button
              onClick={() => { navigator.clipboard.writeText(aiExclusionsText); }}
              className="text-[11px] font-medium"
              style={{ color: "var(--bs-teal)" }}
            >
              Copy
            </button>
          </div>
          <pre className="text-[13px] whitespace-pre-wrap leading-relaxed font-sans" style={{ color: "var(--bs-text-secondary)" }}>{aiExclusionsText}</pre>
        </div>
      )}

      {/* AI Exclusions Suggestions */}
      {aiExclusionsSuggestions.length > 0 && (
        <div className="rounded-lg p-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-amber)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--bs-amber)" }}>⚠ AI-Suggested Missing Exclusions</p>
          <p className="text-[11px] mb-3" style={{ color: "var(--bs-text-muted)" }}>Based on your project type and scope, you may be missing these exclusions:</p>
          <ul className="flex flex-col gap-3">
            {aiExclusionsSuggestions.map((s, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5 ${s.priority === "high" ? "bg-red-900/40 text-red-400" : s.priority === "medium" ? "bg-amber-900/40 text-amber-400" : "bg-slate-700 text-slate-300"}`}>{s.priority}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--bs-text-primary)" }}>{s.text}</span>
                </div>
                <span className="text-[11px] pl-10" style={{ color: "var(--bs-text-muted)" }}>{s.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exclusions Validator error */}
      {validatorError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
          style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="flex-1">{validatorError}</span>
          <button onClick={() => setValidatorError(null)} className="font-medium text-xs shrink-0" style={{ color: "var(--bs-red)" }}>Dismiss</button>
        </div>
      )}

      {/* Exclusions Validator results */}
      {validatorResult && (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bs-amber)" }}>
          {/* Header / score bar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--bs-bg-card)" }}>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full text-sm font-bold"
                style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: validatorResult.coverageScore >= 80 ? "var(--bs-teal-dim)" : validatorResult.coverageScore >= 50 ? "var(--bs-amber-dim)" : "var(--bs-red-dim)",
                  border: `2px solid ${validatorResult.coverageScore >= 80 ? "var(--bs-teal)" : validatorResult.coverageScore >= 50 ? "var(--bs-amber)" : "var(--bs-red)"}`,
                  color: validatorResult.coverageScore >= 80 ? "var(--bs-teal)" : validatorResult.coverageScore >= 50 ? "var(--bs-amber)" : "var(--bs-red)",
                }}
              >
                {validatorResult.coverageScore}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--bs-text-primary)" }}>Exclusions Coverage Score</p>
                <p className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>
                  {validatorResult.coveredCount}/20 categories covered · {validatorResult.missingCount} missing
                </p>
              </div>
            </div>
            <button
              onClick={() => setValidatorExpanded(v => !v)}
              className="text-xs font-medium"
              style={{ color: "var(--bs-amber)" }}
            >
              {validatorExpanded ? "Collapse" : "Show details"}
            </button>
          </div>

          {/* Top priority callout */}
          {validatorResult.topPriority && (
            <div className="px-4 py-2.5" style={{ background: "var(--bs-amber-dim)", borderTop: "1px solid var(--bs-amber)" }}>
              <p className="text-[11px] font-semibold" style={{ color: "var(--bs-amber)" }}>⚠ Top Priority</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--bs-text-secondary)" }}>{validatorResult.topPriority}</p>
            </div>
          )}

          {/* Category breakdown */}
          {validatorExpanded && (
            <div className="divide-y" style={{ borderTop: "1px solid var(--bs-border)" }}>
              {validatorResult.categories.map((cat, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3" style={{ background: "var(--bs-bg-elevated)" }}>
                  <div className="mt-0.5 shrink-0">
                    {cat.covered ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bs-teal)" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cat.riskLevel === "critical" ? "var(--bs-red)" : cat.riskLevel === "high" ? "var(--bs-amber)" : "var(--bs-text-dim)"} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium" style={{ color: cat.covered ? "var(--bs-text-secondary)" : "var(--bs-text-primary)" }}>{cat.category}</p>
                      {!cat.covered && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${cat.riskLevel === "critical" ? "bg-red-900/40 text-red-400" : cat.riskLevel === "high" ? "bg-amber-900/40 text-amber-400" : "bg-slate-700/60 text-slate-400"}`}>
                          {cat.riskLevel}
                        </span>
                      )}
                    </div>
                    {cat.covered && cat.coveredBy && (
                      <p className="text-[11px] mt-0.5 italic" style={{ color: "var(--bs-text-muted)" }}>"{cat.coveredBy}"</p>
                    )}
                    {!cat.covered && cat.suggestedLanguage && (
                      <p className="text-[11px] mt-1" style={{ color: "var(--bs-text-muted)" }}>Add: {cat.suggestedLanguage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
