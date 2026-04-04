"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { getChecklistForTrade } from "@/lib/bidshield/checklist-data";

// ── Demo GC Bid Form fixtures ──────────────────────────────────────────────────

const DEMO_GC_DOCS = [
  {
    _id: "demo_doc_1",
    label: "Exhibit A — Scope Confirmation",
    uploadedAt: Date.now() - 1000 * 60 * 60 * 6,
    processed: true,
    itemCount: 9,
    confirmedCount: 5,
  },
];

const DEMO_GC_ITEMS: Record<string, any[]> = {
  demo_doc_1: [
    { _id: "di1", questionText: "Confirm labor type (open shop, prevailing wage, or union)", itemType: "fill-in", autoConfirmed: true, confirmedValue: "Open Shop", matchedField: "laborType", manuallyChecked: false },
    { _id: "di2", questionText: "Confirm addenda incorporated through #", itemType: "fill-in", autoConfirmed: true, confirmedValue: "Addenda 1, 2", matchedField: "addendaThrough", manuallyChecked: false },
    { _id: "di3", questionText: "Insurance program (own GL/WC, CCIP, or OCIP)", itemType: "fill-in", autoConfirmed: true, confirmedValue: "Provide own GL/WC", matchedField: "insuranceProgram", manuallyChecked: false },
    { _id: "di4", questionText: "Bond required — confirm type", itemType: "fill-in", autoConfirmed: true, confirmedValue: "No bond required", matchedField: "bondRequired", manuallyChecked: false },
    { _id: "di5", questionText: "Bid valid for how many days from bid date", itemType: "fill-in", autoConfirmed: true, confirmedValue: "30 days", matchedField: "bidGoodFor", manuallyChecked: false },
    { _id: "di6", questionText: "Confirm roofing scope includes single-ply membrane installation", itemType: "scope-item", autoConfirmed: false, confirmedValue: null, matchedField: null, foundInScope: true, foundInChecklist: false, manuallyChecked: false },
    { _id: "di7", questionText: "Confirm tear-off and disposal of existing roofing system", itemType: "scope-item", autoConfirmed: false, confirmedValue: null, matchedField: null, foundInScope: true, foundInChecklist: false, manuallyChecked: true },
    { _id: "di8", questionText: "Provide unit price per SF for additional roofing area", itemType: "fill-in", autoConfirmed: false, confirmedValue: null, matchedField: null, manuallyChecked: false },
    { _id: "di9", questionText: "Confirm MBE/WBE participation plan", itemType: "fill-in", autoConfirmed: false, confirmedValue: null, matchedField: null, manuallyChecked: false },
  ],
};

// ── GCBidFormsPanel ───────────────────────────────────────────────────────────

function GCBidFormsPanel({ projectId, userId, isDemo, isPro, project }: { projectId: string; userId: string | null; isDemo: boolean; isPro?: boolean; project?: any }) {
  const isValidConvexId = !isDemo && !!projectId && !projectId.startsWith("demo_");

  // Queries
  const gcDocs = useQuery(
    api.bidshield.getGcBidFormDocuments,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const bidQuals = useQuery(
    api.bidshield.getBidQuals,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const scopeItems = useQuery(
    api.bidshield.getScopeItems,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const checklist = useQuery(
    api.bidshield.getChecklist,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const addenda = useQuery(
    api.bidshield.getAddenda,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // Mutations
  const saveGcBidForm = useMutation(api.bidshield.saveGcBidForm);
  const reanalyzeGcBidForm = useMutation(api.bidshield.reanalyzeGcBidForm);
  const updateItem = useMutation(api.bidshield.updateGcBidFormItem);
  const updateLabel = useMutation(api.bidshield.updateGcBidFormLabel);
  const deleteDoc = useMutation(api.bidshield.deleteGcBidFormDocument);

  // State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [collapsedConfirmed, setCollapsedConfirmed] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [reanalyzeTargetId, setReanalyzeTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reanalFileRef = useRef<HTMLInputElement>(null);
  const labelDebounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Demo state
  const [demoDocs, setDemoDocs] = useState(DEMO_GC_DOCS);
  const [demoItems, setDemoItems] = useState<typeof DEMO_GC_ITEMS>(DEMO_GC_ITEMS);

  const resolvedDocs = isDemo ? demoDocs : (gcDocs ?? []);

  // Per-doc items query wrapper — we need a component for each
  const [expandedDocItemsCache, setExpandedDocItemsCache] = useState<Record<string, any[]>>({});

  const buildProjectContext = useCallback(() => {
    const q = bidQuals ?? {};

    // Build checklist item ID → human-readable label map
    const trade = project?.trade || "roofing";
    const sysType = project?.systemType;
    const deckType = project?.deckType;
    const checklistTemplate = getChecklistForTrade(trade, sysType, deckType);
    const labelMap: Record<string, string> = {};
    for (const phase of Object.values(checklistTemplate)) {
      for (const item of (phase as any).items ?? []) {
        labelMap[item.id] = item.text;
      }
    }

    // Use actual addenda numbers from records rather than sequential generation
    const addendaNumbers = (addenda ?? []).map((a: any) => a.number).filter((n: any) => n !== null && n !== undefined).sort((a: number, b: number) => a - b);

    return {
      laborType: (q as any).laborType ?? null,
      addendaNumbers,
      specSections: (q as any).specSections ? [(q as any).specSections] : [],
      insuranceProgram: (q as any).insuranceProgram ?? null,
      bidValidDays: (q as any).bidGoodFor ?? null,
      drawingDate: (q as any).plansDated ?? null,
      planRevision: (q as any).planRevision ?? null,
      bondRequired: (q as any).bondRequired ?? null,
      prevailingWage: (q as any).laborType === "prevailing_wage",
      mbeWbeGoals: (q as any).mbeGoals ?? null,
      scopeItems: (scopeItems ?? []).map((s: any) => ({ text: s.name, status: s.status })),
      checklistItems: (checklist ?? []).map((c: any) => ({
        text: labelMap[c.itemId] ?? c.itemId, // human-readable label, fallback to ID
        status: c.status,
      })),
    };
  }, [bidQuals, scopeItems, checklist, addenda, project]);

  const processFile = useCallback(async (file: File, existingDocId?: string) => {
    setUploading(true);
    setUploadError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const projectContext = buildProjectContext();

      const res = await fetch("/api/bidshield/extract-gc-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, projectContext }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Extraction failed");

      const items = data.items ?? [];

      if (existingDocId) {
        await reanalyzeGcBidForm({
          documentId: existingDocId as Id<"bidshield_gcBidFormDocuments">,
          items,
        });
        setReanalyzeTargetId(null);
      } else {
        if (!isValidConvexId || !userId) throw new Error("Project not saved — cannot store results");
        const label = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
        await saveGcBidForm({
          projectId: projectId as Id<"bidshield_projects">,
          userId,
          label,
          items,
        });
      }
    } catch (err: any) {
      setUploadError(err?.message ?? "Upload failed — try again");
    } finally {
      setUploading(false);
    }
  }, [buildProjectContext, isValidConvexId, userId, projectId, saveGcBidForm, reanalyzeGcBidForm]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, existingDocId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (isDemo) return;
    processFile(file, existingDocId);
  }, [isDemo, processFile]);

  const handleLabelChange = useCallback((docId: string, value: string) => {
    if (isDemo) {
      setDemoDocs(p => p.map(d => d._id === docId ? { ...d, label: value } : d));
      return;
    }
    const t = labelDebounceRefs.current.get(docId);
    if (t) clearTimeout(t);
    labelDebounceRefs.current.set(docId, setTimeout(() => {
      updateLabel({ documentId: docId as Id<"bidshield_gcBidFormDocuments">, label: value });
    }, 600));
  }, [isDemo, updateLabel]);

  const handleDelete = useCallback(async (docId: string) => {
    if (isDemo) {
      setDemoDocs(p => p.filter(d => d._id !== docId));
      return;
    }
    await deleteDoc({ documentId: docId as Id<"bidshield_gcBidFormDocuments"> });
  }, [isDemo, deleteDoc]);

  const handleToggleItem = useCallback(async (item: any, docId: string) => {
    if (isDemo) {
      setDemoItems(prev => {
        const items = prev[docId] ?? [];
        return {
          ...prev,
          [docId]: items.map(i => i._id === item._id ? { ...i, manuallyChecked: !i.manuallyChecked } : i),
        };
      });
      return;
    }
    await updateItem({ itemId: item._id, manuallyChecked: !item.manuallyChecked });
  }, [isDemo, updateItem]);

  const handleNoteChange = useCallback((item: any, notes: string) => {
    if (isDemo) return;
    updateItem({ itemId: item._id, notes });
  }, [isDemo, updateItem]);

  // ── Render a single document card ──
  function DocCard({ doc }: { doc: any }) {
    const isExpanded = expandedDocs.has(doc._id);
    const isConfirmedCollapsed = collapsedConfirmed.has(doc._id);

    // For real data, use a child component that can useQuery
    const items = isDemo
      ? (demoItems[doc._id] ?? [])
      : (expandedDocItemsCache[doc._id] ?? []);

    const confirmedItems = items.filter((i: any) => i.autoConfirmed);
    const needsReviewItems = items.filter((i: any) => !i.autoConfirmed);
    const totalConfirmed = confirmedItems.length + needsReviewItems.filter((i: any) => i.manuallyChecked).length;
    const totalItems = items.length;

    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              defaultValue={doc.label}
              onChange={e => handleLabelChange(doc._id, e.target.value)}
              placeholder="e.g. Exhibit A, Exhibit B, Bid Form"
              className="w-full text-[14px] font-semibold text-slate-900 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none pb-0.5 transition-colors"
            />
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-slate-400">
                {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {doc.processed ? (
                <span className="text-[11px] text-slate-500">
                  {doc.confirmedCount} auto-confirmed · {doc.itemCount - doc.confirmedCount} need review
                </span>
              ) : (
                <span className="text-[11px] text-amber-500">Processing…</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isDemo && (
              <>
                <button
                  onClick={() => { setReanalyzeTargetId(doc._id); reanalFileRef.current?.click(); }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Re-upload
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="text-[11px] text-slate-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </>
            )}
            <button
              onClick={() => setExpandedDocs(prev => {
                const next = new Set(prev);
                if (next.has(doc._id)) next.delete(doc._id); else next.add(doc._id);
                return next;
              })}
              className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              {isExpanded ? "Collapse" : "Expand"}
              <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-100">
            {/* Status bar */}
            {items.length > 0 && (
              <div className="px-5 py-3 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                <span className="text-[12px] text-slate-500 font-medium">{totalConfirmed} of {totalItems} items confirmed</span>
                {!isDemo && (
                  <button
                    onClick={() => { setReanalyzeTargetId(doc._id); reanalFileRef.current?.click(); }}
                    className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Re-analyze
                  </button>
                )}
              </div>
            )}

            {/* Section A: Auto-Confirmed */}
            {confirmedItems.length > 0 && (
              <div>
                <button
                  onClick={() => setCollapsedConfirmed(prev => {
                    const next = new Set(prev);
                    if (next.has(doc._id)) next.delete(doc._id); else next.add(doc._id);
                    return next;
                  })}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 9999 }}>Auto-Confirmed ({confirmedItems.length})</span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isConfirmedCollapsed ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {!isConfirmedCollapsed && (
                  <div className="flex flex-col divide-y divide-slate-100">
                    {confirmedItems.map((item: any) => (
                      <div key={item._id} className="flex items-start gap-3 px-5 py-3 bg-emerald-50/40 border-l-2 border-emerald-500">
                        <input
                          type="checkbox"
                          defaultChecked
                          onChange={() => handleToggleItem(item, doc._id)}
                          style={{ marginTop: 2, width: 14, height: 14, accentColor: "#10b981", flexShrink: 0 }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-slate-800">{item.questionText}</p>
                          {item.confirmedValue && (
                            <p className="text-[12px] text-emerald-700 mt-0.5 font-medium">
                              {item.confirmedValue}
                              {item.matchedField && <span className="text-[10px] text-emerald-500 ml-1">(matched from {item.matchedField})</span>}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-semibold shrink-0">AI</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section B: Needs Review */}
            {needsReviewItems.length > 0 && (
              <div>
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/30">
                  <span className="text-[12px] font-semibold text-slate-600">Needs Review ({needsReviewItems.length})</span>
                </div>
                <div className="flex flex-col divide-y divide-slate-100">
                  {needsReviewItems.map((item: any) => {
                    const inScope = item.foundInScope || item.foundInChecklist;
                    const showNotes = expandedNotes.has(item._id);
                    return (
                      <div key={item._id} className="px-5 py-3 flex flex-col gap-2">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!item.manuallyChecked}
                            onChange={() => handleToggleItem(item, doc._id)}
                            style={{ marginTop: 2, width: 14, height: 14, accentColor: "#1e293b", flexShrink: 0 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-800">{item.questionText}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {item.itemType === "fill-in" ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Fill-in</span>
                              ) : (
                                <>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Scope Item</span>
                                  {item.foundInScope !== undefined || item.foundInChecklist !== undefined ? (
                                    inScope ? (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">In Scope</span>
                                    ) : (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Not in Scope</span>
                                    )
                                  ) : null}
                                </>
                              )}
                              <button
                                onClick={() => setExpandedNotes(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item._id)) next.delete(item._id); else next.add(item._id);
                                  return next;
                                })}
                                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showNotes ? "Hide notes" : "+ Note"}
                              </button>
                            </div>
                            {showNotes && (
                              <textarea
                                defaultValue={item.notes ?? ""}
                                onBlur={e => handleNoteChange(item, e.target.value)}
                                placeholder="Add a note…"
                                rows={2}
                                className="mt-2 w-full text-[12px] rounded-lg px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none bg-white text-slate-700 resize-none"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-400">No items extracted — try re-uploading the document.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Real-mode: component to load items per doc when expanded
  function DocItemsLoader({ docId }: { docId: string }) {
    const items = useQuery(
      api.bidshield.getGcBidFormItems,
      { documentId: docId as Id<"bidshield_gcBidFormDocuments"> }
    );
    useEffect(() => {
      if (items !== undefined) {
        setExpandedDocItemsCache(prev => ({ ...prev, [docId]: items }));
      }
    }, [items, docId]);
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => handleFileChange(e)}
      />
      <input
        ref={reanalFileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => handleFileChange(e, reanalyzeTargetId ?? undefined)}
      />

      {/* Load items for expanded real docs */}
      {!isDemo && resolvedDocs.map((doc: any) =>
        expandedDocs.has(doc._id) ? <DocItemsLoader key={doc._id} docId={doc._id} /> : null
      )}

      {/* Empty state */}
      {resolvedDocs.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Upload GC Bid Documents</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Exhibit A, Exhibit B, Bid Form — whatever your GC calls it. AI extracts every requirement, auto-confirms what it can from your bid data, and flags the rest for review.
            </p>
          </div>
          <button
            onClick={() => { if (!isDemo) fileInputRef.current?.click(); }}
            disabled={uploading || isDemo}
            style={{ background: "#0f172a" }}
            className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-80 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : "Upload Document"}
          </button>
          <p className="text-[11px] text-slate-400">Not all GCs require these forms — only upload if provided. Upload is optional.</p>
        </div>
      )}

      {/* Document list */}
      {resolvedDocs.length > 0 && (
        <>
          {resolvedDocs.map((doc: any) => (
            <DocCard key={doc._id} doc={doc} />
          ))}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { if (!isDemo) fileInputRef.current?.click(); }}
              disabled={uploading || isDemo}
              style={{ background: "#0f172a" }}
              className="px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-80 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing…
                </>
              ) : "Upload Another Document"}
            </button>
          </div>
        </>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
      <div className="px-5 py-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{title}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function AutoBadge({ source }: { source: string }) {
  return (
    <span title={`Auto-filled from ${source}`} style={{
      marginLeft: 6, fontSize: 10, fontWeight: 600,
      color: "#2563eb", background: "#eff6ff",
      border: "1px solid #bfdbfe", borderRadius: 4,
      padding: "1px 5px", verticalAlign: "middle",
    }}>
      auto · {source}
    </span>
  );
}

function Field({ label, hint, children, autoSource }: { label: string; hint?: string; children: React.ReactNode; autoSource?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 5 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, marginLeft: 6, color: "#9ca3af" }}>({hint})</span>}
        {autoSource && <AutoBadge source={autoSource} />}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS = "w-full text-[13px] rounded-lg px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none bg-white text-slate-800";

function RadioGroup<T extends string>({
  value, options, onChange,
}: {
  value: T | undefined;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0" style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", display: "inline-flex" }}>
      {options.map((opt, i) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: value === opt.id ? 600 : 400,
            background: value === opt.id ? "#1e293b" : "transparent",
            color: value === opt.id ? "#ffffff" : "#6b7280",
            borderLeft: i > 0 ? "1px solid #e2e8f0" : "none",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean | undefined; onChange: (v: boolean) => void; label?: string }) {
  const on = value === true;
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!on)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: on ? "#10b981" : "#d1d5db",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
          border: "none", cursor: "pointer",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: on ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }} />
      </button>
      {label && <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>}
    </div>
  );
}

// ── Demo state ─────────────────────────────────────────────────────────────────

const DEMO_QUALS = {
  plansDated: "2026-01-15",
  planRevision: "Bid Set",
  specSections: "07 52 13, 07 62 00, 07 72 00",
  addendaThrough: 2,
  drawingSheets: "A-501, A-502, S-201",
  laborType: "open_shop" as const,
  laborBurdenRate: "42%",
  estimatedDuration: "45 working days",
  earliestStart: "2026-04-01",
  materialLeadTime: "3-4 weeks ARO",
  submittalTurnaround: "10 business days after NTP",
  bidGoodFor: "30 days",
  insuranceProgram: "own" as "own" | "ccip" | "ocip",
  additionalInsuredRequired: true,
  buildersRiskBy: "owner" as "owner" | "gc" | "included",
  bondRequired: false,
  emr: "0.82",
  mbeGoals: false,
  certifiedPayrollRequired: false,
  safetyPlanRequired: true,
  backgroundChecksRequired: false,
  qualificationsNotes: "Price excludes after-hours work. Assumes single-layer tear-off. Bid does not include hazmat abatement.",
};

type QualFields = {
  plansDated?: string;
  planRevision?: string;
  specSections?: string;
  addendaThrough?: number;
  drawingSheets?: string;
  laborType?: "open_shop" | "union" | "prevailing_wage";
  laborBurdenRate?: string;
  wageDeterminationNum?: string;
  wageDeterminationDate?: string;
  unionLocal?: string;
  estimatedDuration?: string;
  earliestStart?: string;
  materialLeadTime?: string;
  submittalTurnaround?: string;
  bidGoodFor?: string;
  insuranceProgram?: "own" | "ccip" | "ocip";
  wrapUpNotes?: string;
  additionalInsuredRequired?: boolean;
  buildersRiskBy?: "owner" | "gc" | "included";
  bondRequired?: boolean;
  bondTypes?: string;
  bondAmount?: number;
  bondAmountPct?: number;
  bondAmountType?: string;
  suretyCompany?: string;
  suretyAgent?: string;
  bondStatus?: string;
  emr?: string;
  mbeGoals?: boolean;
  mbeGoalPct?: string;
  mbeCertifications?: string;
  certifiedPayrollRequired?: boolean;
  safetyPlanRequired?: boolean;
  backgroundChecksRequired?: boolean;
  qualificationsNotes?: string;
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function BidQualsTab({ projectId, isDemo, isPro, userId, project }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const [activeSubTab, setActiveSubTab] = useState<"quals" | "forms">("quals");

  const qualsData = useQuery(
    api.bidshield.getBidQuals,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const upsertQuals = useMutation(api.bidshield.upsertBidQuals);

  // Queries for auto-population from other tabs
  const addendaData = useQuery(
    api.bidshield.getAddenda,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborAnalysis = useQuery(
    api.bidshield.getLaborAnalysis,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const [demoState, setDemoState] = useState<QualFields>(DEMO_QUALS);
  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const data: QualFields = isDemo ? demoState : (qualsData ?? {});

  // Auto-populated values derived from other tabs
  const autoAddendaThrough = (!isDemo && addendaData && addendaData.length > 0)
    ? Math.max(...addendaData.map((a: any) => a.number))
    : undefined;
  const autoLaborType = (!isDemo && laborAnalysis?.laborType)
    ? laborAnalysis.laborType as QualFields["laborType"]
    : undefined;
  const autoLaborBurdenRate = (!isDemo && laborAnalysis?.burdenMultiplier)
    ? `${Math.round((laborAnalysis.burdenMultiplier - 1) * 100)}%`
    : undefined;

  // Effective values: prefer user-set data, fall back to auto
  const effectiveAddendaThrough = data.addendaThrough ?? autoAddendaThrough;
  const effectiveLaborType = data.laborType ?? autoLaborType;
  const effectiveLaborBurdenRate = data.laborBurdenRate ?? autoLaborBurdenRate;

  // Track which fields are showing auto-sourced values
  const isAutoField = {
    addendaThrough: (data.addendaThrough === undefined || data.addendaThrough === null) && autoAddendaThrough !== undefined,
    laborType: !data.laborType && !!autoLaborType,
    laborBurdenRate: !data.laborBurdenRate && !!autoLaborBurdenRate,
  };

  // Save a single field (debounced for text, immediate for toggles/radios)
  const saveField = useCallback((field: string, value: any, immediate = false) => {
    if (isDemo) {
      setDemoState(prev => ({ ...prev, [field]: value }));
      return;
    }
    if (!isValidConvexId || !userId) return;
    const fire = () => {
      upsertQuals({ projectId: projectId as Id<"bidshield_projects">, userId, [field]: value });
    };
    if (immediate) { fire(); return; }
    const t = debounceRefs.current.get(field);
    if (t) clearTimeout(t);
    debounceRefs.current.set(field, setTimeout(() => { fire(); debounceRefs.current.delete(field); }, 600));
  }, [isDemo, isValidConvexId, userId, projectId, upsertQuals]);

  const bondTypesSet = new Set((data.bondTypes ?? "").split(",").filter(Boolean));
  const toggleBondType = (type: string) => {
    const next = new Set(bondTypesSet);
    if (next.has(type)) next.delete(type); else next.add(type);
    saveField("bondTypes", [...next].join(","), true);
  };

  if (!isPro && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Bid Qualifications</h3>
        <p className="text-sm text-slate-500 mb-6">Track bonding, insurance, exclusions, and other GC submission requirements. Available on Pro.</p>
        <a href="/bidshield/pricing" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors">
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Bid Qualifications Tracker</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Track the info you&apos;ll need for the GC&apos;s Exhibit A and bid submission forms.
        </p>
      </div>

      {/* Sub-tab switcher */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", display: "inline-flex" }}>
        {(["quals", "forms"] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: activeSubTab === tab ? 600 : 400,
              background: activeSubTab === tab ? "#1e293b" : "transparent",
              color: activeSubTab === tab ? "#ffffff" : "#6b7280",
              borderLeft: i > 0 ? "1px solid #e2e8f0" : "none",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {tab === "quals" ? "Bid Qualifications" : "GC Bid Forms"}
          </button>
        ))}
      </div>

      {activeSubTab === "forms" && (
        <GCBidFormsPanel
          projectId={projectId ?? ""}
          userId={userId ?? null}
          isDemo={isDemo}
          isPro={isPro}
          project={project}
        />
      )}

      {activeSubTab === "quals" && (
      <>
      {/* Section 1: Basis of Bid */}
      <SectionCard title="Basis of Bid — Documents">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plans dated">
            <input
              type="date"
              className={INPUT_CLS}
              defaultValue={data.plansDated ?? ""}
              onBlur={e => saveField("plansDated", e.target.value)}
            />
          </Field>
          <Field label="Plan revision" hint="e.g., Bid Set, 100% CD">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.planRevision ?? ""}
              placeholder="Bid Set"
              onBlur={e => saveField("planRevision", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Spec sections included" hint="e.g., 07 52 13, 07 62 00">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.specSections ?? ""}
            placeholder="07 52 13, 07 62 00, 07 72 00"
            onBlur={e => saveField("specSections", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Addenda incorporated through #" autoSource={isAutoField.addendaThrough ? "Addenda tab" : undefined}>
            <input
              type="number"
              key={`addendaThrough-${effectiveAddendaThrough}`}
              className={INPUT_CLS + (isAutoField.addendaThrough ? " border-blue-200 bg-blue-50/30" : "")}
              defaultValue={effectiveAddendaThrough ?? ""}
              min={0}
              placeholder="0"
              onBlur={e => saveField("addendaThrough", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </Field>
          <Field label="Drawing sheets referenced" hint="e.g., A-501, S-201">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.drawingSheets ?? ""}
              placeholder="A-501, A-502, S-201"
              onBlur={e => saveField("drawingSheets", e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Section 2: Labor */}
      <SectionCard title="Labor">
        <Field label="Labor type" autoSource={isAutoField.laborType ? "Labor tab" : undefined}>
          <RadioGroup
            value={effectiveLaborType}
            options={[
              { id: "open_shop", label: "Open Shop" },
              { id: "prevailing_wage", label: "Prevailing Wage" },
              { id: "union", label: "Union" },
            ]}
            onChange={v => saveField("laborType", v, true)}
          />
        </Field>
        {effectiveLaborType === "prevailing_wage" && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Wage determination #">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.wageDeterminationNum ?? ""}
                placeholder="WD-2025-00123"
                onBlur={e => saveField("wageDeterminationNum", e.target.value)}
              />
            </Field>
            <Field label="Effective date">
              <input
                type="date"
                className={INPUT_CLS}
                defaultValue={data.wageDeterminationDate ?? ""}
                onBlur={e => saveField("wageDeterminationDate", e.target.value)}
              />
            </Field>
          </div>
        )}
        {effectiveLaborType === "union" && (
          <Field label="Union local #">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.unionLocal ?? ""}
              placeholder="Local 210"
              onBlur={e => saveField("unionLocal", e.target.value)}
            />
          </Field>
        )}
        <Field label="Labor burden rate" hint="for your reference" autoSource={isAutoField.laborBurdenRate ? "Labor tab" : undefined}>
          <input
            type="text"
            key={`laborBurdenRate-${effectiveLaborBurdenRate}`}
            className={INPUT_CLS + (isAutoField.laborBurdenRate ? " border-blue-200 bg-blue-50/30" : "")}
            defaultValue={effectiveLaborBurdenRate ?? ""}
            placeholder="42%"
            onBlur={e => saveField("laborBurdenRate", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 3: Schedule & Timing */}
      <SectionCard title="Schedule & Timing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated duration">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.estimatedDuration ?? ""}
              placeholder="45 working days"
              onBlur={e => saveField("estimatedDuration", e.target.value)}
            />
          </Field>
          <Field label="Earliest start date">
            <input
              type="date"
              className={INPUT_CLS}
              defaultValue={data.earliestStart ?? ""}
              onBlur={e => saveField("earliestStart", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Material lead time">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.materialLeadTime ?? ""}
              placeholder="3-4 weeks ARO"
              onBlur={e => saveField("materialLeadTime", e.target.value)}
            />
          </Field>
          <Field label="Submittal turnaround">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.submittalTurnaround ?? ""}
              placeholder="10 business days after NTP"
              onBlur={e => saveField("submittalTurnaround", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Bid good for">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.bidGoodFor ?? "30 days"}
            placeholder="30 days"
            onBlur={e => saveField("bidGoodFor", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 4: Insurance & Bonding */}
      <SectionCard title="Insurance & Bonding">
        <Field label="Insurance program">
          <RadioGroup
            value={data.insuranceProgram}
            options={[
              { id: "own", label: "Provide own GL/WC" },
              { id: "ccip", label: "CCIP" },
              { id: "ocip", label: "OCIP" },
            ]}
            onChange={v => saveField("insuranceProgram", v, true)}
          />
        </Field>
        {(data.insuranceProgram === "ccip" || data.insuranceProgram === "ocip") && (
          <Field label="Wrap-up admin contact">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.wrapUpNotes ?? ""}
              placeholder="Contact name, portal URL, or admin notes"
              onBlur={e => saveField("wrapUpNotes", e.target.value)}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Additional insured required">
            <Toggle value={data.additionalInsuredRequired} onChange={v => saveField("additionalInsuredRequired", v, true)} />
          </Field>
          <Field label="Builder's risk by">
            <RadioGroup
              value={data.buildersRiskBy}
              options={[
                { id: "owner", label: "Owner" },
                { id: "gc", label: "GC" },
                { id: "included", label: "Include in bid" },
              ]}
              onChange={v => saveField("buildersRiskBy", v, true)}
            />
          </Field>
        </div>
        <Field label="Bond required">
          <Toggle value={data.bondRequired} onChange={v => saveField("bondRequired", v, true)} />
        </Field>
        {data.bondRequired && (
          <>
            <Field label="Bond type(s)">
              <div className="flex gap-3 flex-wrap">
                {[
                  { id: "performance", label: "Performance" },
                  { id: "payment", label: "Payment" },
                  { id: "bid_bond", label: "Bid Bond" },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bondTypesSet.has(opt.id)}
                      onChange={() => toggleBondType(opt.id)}
                      style={{ width: 14, height: 14, accentColor: "#1e293b" }}
                    />
                    <span style={{ fontSize: 13, color: "#374151" }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bond amount type">
                <RadioGroup
                  value={data.bondAmountType ?? "percentage"}
                  onChange={v => saveField("bondAmountType", v, true)}
                  options={[
                    { id: "percentage", label: "% of bid" },
                    { id: "dollar", label: "$ amount" },
                  ]}
                />
              </Field>
              <Field label={data.bondAmountType === "dollar" ? "Bond amount ($)" : "Bond amount (%)"}>
                <input
                  type="number"
                  className={INPUT_CLS}
                  defaultValue={
                    data.bondAmountType === "dollar"
                      ? (data.bondAmount ?? "")
                      : (data.bondAmountPct ?? "")
                  }
                  key={data.bondAmountType ?? "percentage"}
                  placeholder={data.bondAmountType === "dollar" ? "e.g. 50000" : "e.g. 100"}
                  style={{ maxWidth: 160 }}
                  onBlur={e => {
                    const n = parseFloat(e.target.value);
                    if (data.bondAmountType === "dollar") {
                      saveField("bondAmount", isNaN(n) ? undefined : n, true);
                    } else {
                      saveField("bondAmountPct", isNaN(n) ? undefined : n, true);
                    }
                  }}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Surety company">
                <input
                  type="text"
                  className={INPUT_CLS}
                  defaultValue={data.suretyCompany ?? ""}
                  placeholder="e.g. Travelers, Liberty Mutual"
                  onBlur={e => saveField("suretyCompany", e.target.value)}
                />
              </Field>
              <Field label="Surety agent / contact">
                <input
                  type="text"
                  className={INPUT_CLS}
                  defaultValue={data.suretyAgent ?? ""}
                  placeholder="Name, phone, or email"
                  onBlur={e => saveField("suretyAgent", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Bond status">
              <RadioGroup
                value={data.bondStatus ?? "not_started"}
                onChange={v => saveField("bondStatus", v, true)}
                options={[
                  { id: "not_started", label: "Not started" },
                  { id: "in_progress", label: "In progress" },
                  { id: "obtained", label: "Obtained" },
                  { id: "waived", label: "Waived" },
                ]}
              />
            </Field>
          </>
        )}
        <Field label="EMR" hint="Experience Modification Rate">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.emr ?? ""}
            placeholder="0.82"
            style={{ maxWidth: 120 }}
            onBlur={e => saveField("emr", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 5: Compliance */}
      <SectionCard title="Compliance">
        <Field label="MBE/WBE/DBE goals">
          <Toggle value={data.mbeGoals} onChange={v => saveField("mbeGoals", v, true)} label={data.mbeGoals ? "Yes — goals apply" : "No"} />
        </Field>
        {data.mbeGoals && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Goal %">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.mbeGoalPct ?? ""}
                placeholder="10%"
                onBlur={e => saveField("mbeGoalPct", e.target.value)}
              />
            </Field>
            <Field label="MBE/WBE credentials">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.mbeCertifications ?? ""}
                placeholder="MBE, WBE"
                onBlur={e => saveField("mbeCertifications", e.target.value)}
              />
            </Field>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Toggle
            value={data.certifiedPayrollRequired}
            onChange={v => saveField("certifiedPayrollRequired", v, true)}
            label="Prevailing wage certified payroll required"
          />
          <Toggle
            value={data.safetyPlanRequired}
            onChange={v => saveField("safetyPlanRequired", v, true)}
            label="Safety program / site-specific safety plan required"
          />
          <Toggle
            value={data.backgroundChecksRequired}
            onChange={v => saveField("backgroundChecksRequired", v, true)}
            label="Background checks required"
          />
        </div>
      </SectionCard>

      {/* Section 6: Qualifications & Exceptions */}
      <SectionCard title="Qualifications & Exceptions to Bid">
        <Field label="Notes">
          <textarea
            className="w-full text-[13px] rounded-lg px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:outline-none bg-white text-slate-800 resize-none"
            rows={5}
            defaultValue={data.qualificationsNotes ?? ""}
            placeholder="List any qualifications, exceptions, or conditions you're attaching to your bid. E.g.: 'Price excludes after-hours work', 'Assumes single-layer tear-off', 'Bid does not include hazmat abatement'"
            onBlur={e => saveField("qualificationsNotes", e.target.value)}
          />
        </Field>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>
          These notes will appear in your Pre-Submission checklist for final review.
        </p>
      </SectionCard>
      </>
      )}

    </div>
  );
}
