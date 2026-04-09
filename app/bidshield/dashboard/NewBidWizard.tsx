"use client";

import React, { useState, useEffect } from "react";
import { INSULATION_TYPES, SURFACE_TYPES, THICKNESS_PRESETS, computeInsulationRValue } from "@/lib/bidshield/insulation-data";

// ── Project types that determine what BidShield pre-configures ──
const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
  new_construction: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>,
  reroof: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  recover: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" /></svg>,
  repair: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.65-4.65 3.086-3.086a1 1 0 0 1 1.414 1.414l-3.086 3.086m-5.65 4.65-.649-.352M6.75 7.5l4.59-4.59a1.952 1.952 0 0 1 2.763 2.763L9.513 9.672" /></svg>,
};
const PROJECT_TYPES = [
  { id: "new_construction", label: "New Construction", desc: "New building, full roof system install" },
  { id: "reroof", label: "Re-Roof / Tear-Off", desc: "Existing building, remove & replace" },
  { id: "recover", label: "Recover / Overlay", desc: "Install new system over existing" },
  { id: "repair", label: "Repair / Maintenance", desc: "Targeted repairs, leak fixes" },
];

const SYSTEMS = [
  { id: "tpo", label: "TPO", popular: true },
  { id: "pvc", label: "PVC", popular: true },
  { id: "epdm", label: "EPDM", popular: true },
  { id: "sbs", label: "SBS Modified Bitumen", popular: false },
  { id: "app", label: "APP Modified Bitumen", popular: false },
  { id: "bur", label: "Built-Up (BUR)", popular: false },
  { id: "metal", label: "Standing Seam Metal", popular: false },
  { id: "spf", label: "Spray Foam (SPF)", popular: false },
  { id: "hydrotech", label: "Hydrotech (IRMA)", popular: false },
];

const DECKS = [
  { id: "steel", label: "Steel Deck" },
  { id: "concrete", label: "Concrete Deck" },
  { id: "wood", label: "Wood / Plywood" },
  { id: "lightweight", label: "Lightweight Concrete" },
  { id: "gypsum", label: "Gypsum Deck" },
  { id: "tectum", label: "Tectum / Cementwood" },
];

// What BidShield auto-configures based on selections
function getConfigSummary(projectType: string, systems: string[]) {
  const configs: string[] = [];

  // Common to all
  configs.push("18-phase bid QA checklist");
  configs.push("Bid readiness scoring");

  // Project-type specific
  if (projectType === "new_construction") {
    configs.push("Structural review items (new deck)");
    configs.push("Full scope gap checker (40+ items)");
    configs.push("Vapor barrier & insulation checks");
  } else if (projectType === "reroof") {
    configs.push("Demolition & removal scope items");
    configs.push("Hazmat / asbestos checks");
    configs.push("Deck inspection & repair items");
    configs.push("Full scope gap checker (40+ items)");
  } else if (projectType === "recover") {
    configs.push("Existing conditions checklist");
    configs.push("Moisture scan / core cut items");
    configs.push("Reduced scope checker (overlay-specific)");
  } else if (projectType === "repair") {
    configs.push("Damage assessment items");
    configs.push("Warranty impact checks");
    configs.push("Simplified scope checker");
  }

  // System-specific (deduplicate by checking each system)
  const added = new Set<string>();
  for (const system of systems) {
    if (system === "metal") {
      if (!added.has("metal")) {
        configs.push("Panel layout & clip spacing checks");
        configs.push("Expansion/contraction calculations");
        added.add("metal");
      }
    } else if (system === "spf") {
      if (!added.has("spf")) {
        configs.push("SPF density & thickness specs");
        configs.push("Coating system verification");
        added.add("spf");
      }
    } else if (system === "tpo" || system === "pvc") {
      if (!added.has("membrane")) {
        configs.push("Membrane seam & detail checks");
        configs.push("Attachment pattern verification");
        added.add("membrane");
      }
    } else if (system === "sbs" || system === "app" || system === "bur") {
      if (!added.has("bitumen")) {
        configs.push("Ply count & adhesion method checks");
        configs.push("Base/cap sheet specification review");
        added.add("bitumen");
      }
    }
  }

  return configs;
}

const STEPS = [
  { label: "Project Type" },
  { label: "Systems" },
  { label: "Assemblies" },
  { label: "Project Info" },
  { label: "Review" },
];

interface AssemblyInput {
  label: string;
  name?: string;
  systemType: string;
  insulationType: string;
  insulationThickness: string;
  rValue?: number | null;
  surfaceType: string;
  area?: number | null;
  uValue?: number | null;
}

interface WizardData {
  name: string; location: string; bidDate: string; trade: string;
  projectType: string; systemType: string; deckType: string;
  gc: string; sqft: string; totalBidAmount: string; assemblies: string;
  roofAssemblies?: AssemblyInput[];
  systemDescription?: string;
}

export interface EditProjectData {
  projectType?: string;
  systemType?: string;
  deckType?: string;
  name?: string;
  location?: string;
  bidDate?: string;
  gc?: string;
  sqft?: number;
  totalBidAmount?: number;
  roofAssemblies?: Array<{
    label: string; name?: string; systemType: string;
    insulationType?: string; insulationThickness?: string;
    rValue?: number; surfaceType?: string;
    area?: number; uValue?: number;
  }>;
  systemDescription?: string;
}

interface Props {
  onClose: () => void;
  onCreate: (data: WizardData) => void;
  isDemo?: boolean;
  isPro?: boolean;
  editProject?: EditProjectData;
}

export default function NewBidWizard({ onClose, onCreate, isDemo, isPro, editProject }: Props) {
  const isEdit = !!editProject;
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [projectType, setProjectType] = useState(editProject?.projectType || "");
  const [systems, setSystems] = useState<string[]>(() => {
    if (editProject?.roofAssemblies?.length) {
      return [...new Set(editProject.roofAssemblies.map(a => a.systemType).filter(Boolean))];
    }
    if (editProject?.systemType) return [editProject.systemType];
    return [];
  });
  const [assemblies, setAssemblies] = useState<AssemblyInput[]>(() => {
    if (editProject?.roofAssemblies?.length) {
      return editProject.roofAssemblies.map(a => ({
        label: a.label,
        name: a.name,
        systemType: a.systemType,
        insulationType: a.insulationType || "",
        insulationThickness: a.insulationThickness || "",
        rValue: a.rValue ?? null,
        surfaceType: a.surfaceType || "",
        area: a.area ?? null,
        uValue: a.uValue ?? null,
      }));
    }
    return [];
  });
  const [aiDescription, setAiDescription] = useState(editProject?.systemDescription || "");
  const [descLoading, setDescLoading] = useState(false);
  // PDF extract state
  const [pdfMode, setPdfMode] = useState<"link" | "upload" | "loading" | "preview" | "error">("link");
  const [pdfError, setPdfError] = useState("");
  const [pdfResults, setPdfResults] = useState<AssemblyInput[]>([]);
  const [pdfMeta, setPdfMeta] = useState<{ deckType?: string; projectName?: string; location?: string }>({});
  // Takeoff schedule upload state
  const [takeoffMode, setTakeoffMode] = useState<"link" | "upload" | "loading" | "done" | "error">("link");
  const [takeoffError, setTakeoffError] = useState("");
  const [deck, setDeck] = useState(editProject?.deckType || "");
  const [name, setName] = useState(editProject?.name || "");
  const [location, setLocation] = useState(editProject?.location || "");
  const [bidDate, setBidDate] = useState(editProject?.bidDate || "");
  const [gc, setGc] = useState(editProject?.gc || "");
  const [sqft, setSqft] = useState(editProject?.sqft ? String(editProject.sqft) : "");
  const [totalBidAmount, setTotalBidAmount] = useState(editProject?.totalBidAmount ? String(editProject.totalBidAmount) : "");

  const toggleSystem = (id: string) => {
    setSystems(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const canAdvance = [
    projectType !== "",
    systems.length > 0,
    true, // assemblies step is optional
    name !== "" && location !== "" && bidDate !== "",
    true,
  ];

  const configs = getConfigSummary(projectType, systems);
  const inputCls = "w-full py-2.5 px-3 rounded-lg text-sm outline-none transition-colors";
  const inputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" };

  const handlePdfFile = async (file: File) => {
    if (file.type !== "application/pdf") { setPdfError("Please select a PDF file."); setPdfMode("error"); return; }
    setPdfMode("loading");
    setPdfError("");
    try {
      const buf = await file.arrayBuffer();
      // Chunk-based base64 conversion to avoid call stack overflow on large files
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binary);
      const res = await fetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPdfError(data.error || "Extraction failed"); setPdfMode("error"); return; }
      const mapped: AssemblyInput[] = (data.assemblies || []).map((a: any) => ({
        label: a.label || `RT-${String(assemblies.length + 1).padStart(2, "0")}`,
        name: a.name || undefined,
        systemType: a.system || a.systemType || "",
        insulationType: a.insulation || a.insulationType || "",
        insulationThickness: a.thickness?.replace(/"/g, "") || "",
        rValue: a.rValue ?? null,
        surfaceType: a.surface || a.surfaceType || "",
        area: typeof a.area === "number" ? a.area : null,
        uValue: typeof a.uValue === "number" ? a.uValue : null,
      }));
      if (mapped.length === 0) { setPdfError("No assemblies found in this PDF."); setPdfMode("error"); return; }
      setPdfResults(mapped);
      // Extract metadata (deck type, project name, location)
      const meta: typeof pdfMeta = {};
      if (data.deckType) meta.deckType = data.deckType;
      if (data.projectName) meta.projectName = data.projectName;
      if (data.location) meta.location = data.location;
      setPdfMeta(meta);
      // Auto-select systems from extracted assemblies
      const extractedSystems = [...new Set(mapped.map(a => a.systemType).filter(Boolean))];
      if (extractedSystems.length > 0) setSystems(extractedSystems);
      // Auto-set deck type
      if (data.deckType) setDeck(data.deckType);
      setPdfMode("preview");
    } catch { setPdfError("Failed to read PDF."); setPdfMode("error"); }
  };

  const handleTakeoffFile = async (file: File) => {
    if (file.type !== "application/pdf") { setTakeoffError("Please select a PDF file."); setTakeoffMode("error"); return; }
    setTakeoffMode("loading");
    setTakeoffError("");
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binary);
      const res = await fetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setTakeoffError(data.error || "Extraction failed"); setTakeoffMode("error"); return; }
      const extracted: any[] = data.assemblies || [];
      if (extracted.length === 0) { setTakeoffError("No area data found in this PDF."); setTakeoffMode("error"); return; }

      // Merge area data into existing assemblies by matching labels
      setAssemblies(prev => {
        const updated = [...prev];
        for (const ext of extracted) {
          const extLabel = (ext.label || "").replace(/-/g, "-").toUpperCase().trim();
          // Try exact match first, then prefix match (RT-01 matches RT-01 N)
          let match = updated.findIndex(a => a.label.toUpperCase().trim() === extLabel);
          if (match === -1) {
            // Try matching base label (e.g. extracted "RT-01" matches existing "RT-01")
            const baseLabel = extLabel.replace(/\s*N$/, "").trim();
            match = updated.findIndex(a => a.label.toUpperCase().trim() === baseLabel);
          }

          const area = typeof ext.area === "number" ? ext.area : null;
          const uValue = typeof ext.uValue === "number" ? ext.uValue : null;
          const name = ext.name || undefined;

          if (match !== -1) {
            // Merge into existing assembly
            updated[match] = {
              ...updated[match],
              area: (updated[match].area || 0) + (area || 0),
              uValue: uValue ?? updated[match].uValue,
              name: name || updated[match].name,
            };
          } else if (area) {
            // Add as new assembly if it has area data
            updated.push({
              label: ext.label || `RT-${String(updated.length + 1).padStart(2, "0")}`,
              name,
              systemType: ext.system || ext.systemType || "",
              insulationType: ext.insulation || ext.insulationType || "",
              insulationThickness: ext.thickness?.replace(/"/g, "") || "",
              rValue: null,
              surfaceType: ext.surface || ext.surfaceType || "",
              area,
              uValue,
            });
          }
        }
        return updated;
      });
      // Update total sqft from merged assembly areas
      setAssemblies(latest => {
        const totalArea = latest.reduce((sum, a) => sum + (a.area || 0), 0);
        if (totalArea > 0) setSqft(String(Math.round(totalArea)));
        return latest;
      });
      setTakeoffMode("done");
      setTimeout(() => setTakeoffMode("link"), 3000);
    } catch { setTakeoffError("Failed to read PDF."); setTakeoffMode("error"); }
  };

  // Auto-generate assemblies from selected systems when entering step 2
  useEffect(() => {
    if (step === 2 && assemblies.length === 0 && systems.length > 0) {
      setAssemblies(systems.map((s, i) => ({
        label: `RT-0${i + 1}`,
        systemType: s,
        insulationType: "",
        insulationThickness: "",
        rValue: null,
        surfaceType: "",
      })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, systems]);
  // Note: assemblies is intentionally not in the dep array to avoid re-seeding

  // Fire AI description when entering step 4
  useEffect(() => {
    if (step !== 4) return;
    const hasDetails = assemblies.some(a => a.insulationType || a.surfaceType);
    if (!hasDetails || aiDescription) return;
    setDescLoading(true);
    fetch("/api/bidshield/generate-system-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assemblies: assemblies.map(a => ({
          label: a.label,
          systemType: a.systemType,
          insulationType: a.insulationType || undefined,
          insulationThickness: a.insulationThickness ? a.insulationThickness + "in" : undefined,
          rValue: a.rValue ?? undefined,
          surfaceType: a.surfaceType || undefined,
        })),
        projectType,
        deckType: deck || undefined,
      }),
    })
      .then(r => r.json())
      .then(data => { if (data.text) setAiDescription(data.text); })
      .catch(() => {})
      .finally(() => setDescLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  // Note: other deps intentionally excluded to avoid re-firing

  return (
    <div onClick={onClose} className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {/* Progress */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? "var(--bs-teal)" : "var(--bs-bg-elevated)" }} />
            </div>
          ))}
        </div>
        <div className="px-6 pb-2 flex justify-between">
          {STEPS.map((s, i) => (
            <span key={i} className="text-[10px] font-medium" style={{ color: i === step ? "var(--bs-teal)" : i < step ? "var(--bs-text-muted)" : "var(--bs-text-dim)" }}>{s.label}</span>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* ── Step 0: Project Type ── */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>What kind of project?</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>This determines your checklist items and scope categories.</p>
              <div className="flex flex-col gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProjectType(t.id)}
                    className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                    style={projectType === t.id
                      ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)" }
                      : { border: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}
                  >
                    <span className="flex-shrink-0" style={{ color: "var(--bs-text-muted)" }}>{PROJECT_TYPE_ICONS[t.id]}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--bs-text-primary)" }}>{t.label}</div>
                      <div className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{t.desc}</div>
                    </div>
                    {projectType === t.id && (
                      <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--bs-teal)" }}>
                        <svg className="w-3 h-3" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Systems & Deck (Multi-select) ── */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Roofing systems</h3>
              <p className="text-sm mb-4" style={{ color: "var(--bs-text-muted)" }}>Select systems manually, or extract everything from a PDF.</p>

              {/* PDF quick-start */}
              {pdfMode === "link" && (
                <button
                  onClick={() => setPdfMode("upload")}
                  className="w-full mb-5 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ border: "1px dashed var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", cursor: "pointer" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                  Upload roof plan PDF — auto-detect systems, deck &amp; assemblies
                </button>
              )}

              {pdfMode === "upload" && (
                <div
                  className="mb-5 rounded-xl p-6 text-center"
                  style={{ border: "1px dashed var(--bs-teal)", background: "var(--bs-teal-dim)" }}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handlePdfFile(f); }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--bs-text-secondary)" }}>Drop a roof plan or detail drawing PDF</p>
                  <p className="text-xs mb-3" style={{ color: "var(--bs-text-dim)" }}>We&apos;ll extract systems, deck type, insulation, and assemblies automatically</p>
                  <label className="inline-block text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                    Choose PDF
                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); }} />
                  </label>
                  <button onClick={() => setPdfMode("link")} className="block mx-auto mt-3 text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancel — select manually</button>
                </div>
              )}

              {pdfMode === "loading" && (
                <div className="mb-5 rounded-xl p-6 text-center" style={{ border: "1px dashed var(--bs-teal)", background: "var(--bs-teal-dim)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>Analyzing roof plan...</span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--bs-text-dim)" }}>Extracting systems, deck type, insulation, and assemblies</p>
                </div>
              )}

              {pdfMode === "error" && (
                <div className="mb-5 rounded-xl p-4 text-center" style={{ border: "1px solid var(--bs-red-border)", background: "var(--bs-red-dim)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--bs-red)" }}>{pdfError}</p>
                  <button onClick={() => setPdfMode("upload")} className="text-xs font-medium" style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try Again</button>
                </div>
              )}

              {pdfMode === "preview" && pdfResults.length > 0 && (
                <div className="mb-5 rounded-xl p-4" style={{ border: "1px solid var(--bs-teal-border)", background: "var(--bs-teal-dim)" }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-teal)" }}>
                    Detected {pdfResults.length} assembl{pdfResults.length === 1 ? "y" : "ies"}
                    {pdfMeta.deckType && <span className="normal-case"> · {DECKS.find(d => d.id === pdfMeta.deckType)?.label || pdfMeta.deckType} deck</span>}
                  </div>
                  <div className="space-y-1 mb-3">
                    {pdfResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded" style={{ background: "var(--bs-bg-card)" }}>
                        <span className="font-bold" style={{ color: "var(--bs-text-primary)", minWidth: 40 }}>{r.label}</span>
                        <span style={{ color: "var(--bs-text-secondary)" }}>{SYSTEMS.find(s => s.id === r.systemType)?.label || r.systemType}</span>
                        {r.area && <span className="ml-auto font-medium" style={{ color: "var(--bs-teal)" }}>{r.area.toLocaleString()} SF</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setAssemblies(pdfResults);
                        if (pdfMeta.projectName && !name) setName(pdfMeta.projectName);
                        if (pdfMeta.location && !location) setLocation(pdfMeta.location);
                        const totalArea = pdfResults.reduce((sum, a) => sum + (a.area || 0), 0);
                        if (totalArea > 0 && !sqft) setSqft(String(Math.round(totalArea)));
                        setPdfMode("link");
                        setPdfResults([]);
                        setStep(2); // Jump straight to assembly builder to review
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--bs-teal)", color: "#13151a", border: "none", cursor: "pointer" }}
                    >
                      Use These &amp; Review Assemblies
                    </button>
                    <button onClick={() => { setPdfMode("upload"); setPdfResults([]); }} className="text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>Try Again</button>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Popular</div>
                <div className="grid grid-cols-3 gap-2">
                  {SYSTEMS.filter(s => s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSystem(s.id)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all relative"
                      style={systems.includes(s.id)
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                    >
                      {s.label}
                      {systems.includes(s.id) && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "var(--bs-teal)" }}>
                          <svg className="w-2 h-2" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>All Systems</div>
                <div className="grid grid-cols-2 gap-2">
                  {SYSTEMS.filter(s => !s.popular).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSystem(s.id)}
                      className="py-2 px-3 rounded-lg text-sm transition-all relative"
                      style={systems.includes(s.id)
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
                    >
                      {s.label}
                      {systems.includes(s.id) && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "var(--bs-teal)" }}>
                          <svg className="w-2 h-2" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Deck Type <span className="normal-case" style={{ color: "var(--bs-text-dim)" }}>(optional)</span></div>
                <div className="flex flex-wrap gap-2">
                  {DECKS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDeck(deck === d.id ? "" : d.id)}
                      className="py-1.5 px-3 rounded-lg text-xs transition-all"
                      style={deck === d.id
                        ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                        : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {systems.length > 1 && (
                <p className="text-xs mt-4 font-medium" style={{ color: "var(--bs-teal)" }}>
                  {systems.length} systems selected — you can define assemblies in the next step
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Assembly Builder ── */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Define assemblies</h3>
              <p className="text-sm mb-3" style={{ color: "var(--bs-text-muted)" }}>Review and edit insulation, surface, and area details. Optional — you can skip this.</p>

              <div className="space-y-3">
                {assemblies.map((a, idx) => (
                  <div key={idx} className="rounded-xl p-4" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={a.label}
                          onChange={(e) => { const next = [...assemblies]; next[idx] = { ...a, label: e.target.value }; setAssemblies(next); }}
                          className="w-16 text-sm font-bold bg-transparent outline-none"
                          style={{ color: "var(--bs-text-primary)" }}
                        />
                        <span className="text-xs px-2 py-0.5 rounded uppercase font-semibold" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>
                          {SYSTEMS.find(s => s.id === a.systemType)?.label || a.systemType}
                        </span>
                        {a.area && (
                          <span className="text-xs font-medium" style={{ color: "var(--bs-text-muted)" }}>
                            {a.area.toLocaleString()} SF
                          </span>
                        )}
                      </div>
                      {assemblies.length > 1 && (
                        <button onClick={() => setAssemblies(assemblies.filter((_, i) => i !== idx))} className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Remove</button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] block mb-1" style={{ color: "var(--bs-text-dim)" }}>Insulation</label>
                        <select
                          value={a.insulationType}
                          onChange={(e) => {
                            const next = [...assemblies];
                            const ins = e.target.value;
                            const thickness = a.insulationThickness ? parseFloat(a.insulationThickness) : 0;
                            next[idx] = { ...a, insulationType: ins, rValue: ins && thickness ? computeInsulationRValue(ins, thickness) : null };
                            setAssemblies(next);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg text-xs outline-none"
                          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                        >
                          <option value="">None / TBD</option>
                          {INSULATION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1" style={{ color: "var(--bs-text-dim)" }}>Surface</label>
                        <select
                          value={a.surfaceType}
                          onChange={(e) => { const next = [...assemblies]; next[idx] = { ...a, surfaceType: e.target.value }; setAssemblies(next); }}
                          className="w-full py-1.5 px-2 rounded-lg text-xs outline-none"
                          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}
                        >
                          <option value="">Select...</option>
                          {SURFACE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {a.insulationType && (
                      <div className="mt-3">
                        <label className="text-[11px] block mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Thickness</label>
                        <div className="flex flex-wrap gap-1.5">
                          {THICKNESS_PRESETS.map(t => (
                            <button
                              key={t}
                              onClick={() => {
                                const next = [...assemblies];
                                const thick = parseFloat(t);
                                next[idx] = { ...a, insulationThickness: t, rValue: computeInsulationRValue(a.insulationType, thick) };
                                setAssemblies(next);
                              }}
                              className="py-1 px-2.5 rounded text-xs transition-all"
                              style={a.insulationThickness === t
                                ? { border: "1px solid var(--bs-teal)", background: "var(--bs-teal-dim)", color: "var(--bs-teal)", fontWeight: 500 }
                                : { border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
                            >
                              {t}&quot;
                            </button>
                          ))}
                        </div>
                        {a.rValue !== null && (
                          <div className="mt-2 text-xs font-medium" style={{ color: "var(--bs-teal)" }}>
                            R-{a.rValue.toFixed(1)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {assemblies.some(a => a.area) && (
                <div className="text-right mt-2 text-xs font-semibold" style={{ color: "var(--bs-teal)" }}>
                  Total: {assemblies.reduce((sum, a) => sum + (a.area || 0), 0).toLocaleString()} SF
                </div>
              )}

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setAssemblies([...assemblies, {
                    label: `RT-0${assemblies.length + 1}`,
                    systemType: systems[0] || "tpo",
                    insulationType: "",
                    insulationThickness: "",
                    rValue: null,
                    surfaceType: "",
                  }])}
                  className="text-xs font-medium"
                  style={{ color: "var(--bs-teal)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  + Add Assembly
                </button>

                {assemblies.length > 0 && (
                  <span style={{ color: "var(--bs-border)" }}>|</span>
                )}

                {assemblies.length > 0 && takeoffMode === "link" && (
                  <button
                    onClick={() => setTakeoffMode("upload")}
                    className="text-xs flex items-center gap-1"
                    style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>Upload takeoff schedule for areas</span>
                  </button>
                )}

                {takeoffMode === "done" && (
                  <span className="text-xs font-medium" style={{ color: "var(--bs-teal)" }}>Areas merged!</span>
                )}
              </div>

              {takeoffMode === "upload" && (
                <div
                  className="mt-3 rounded-xl p-5 text-center"
                  style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-elevated)" }}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleTakeoffFile(f); }}
                >
                  <p className="text-xs mb-2" style={{ color: "var(--bs-text-muted)" }}>Drop a takeoff schedule PDF to merge area data into your assemblies</p>
                  <label className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
                    Choose file
                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleTakeoffFile(f); }} />
                  </label>
                  <button onClick={() => setTakeoffMode("link")} className="block mx-auto mt-2 text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                </div>
              )}

              {takeoffMode === "loading" && (
                <div className="mt-3 rounded-xl p-5 text-center" style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>Extracting areas from takeoff schedule...</span>
                  </div>
                </div>
              )}

              {takeoffMode === "error" && (
                <div className="mt-3 rounded-xl p-4 text-center" style={{ border: "1px solid var(--bs-red-border)", background: "var(--bs-red-dim)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--bs-red)" }}>{takeoffError}</p>
                  <button onClick={() => setTakeoffMode("upload")} className="text-xs font-medium" style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try Again</button>
                </div>
              )}

              <button
                onClick={() => { setAssemblies([]); setStep(3); }}
                className="block mt-3 text-xs"
                style={{ color: "var(--bs-text-dim)" }}
              >
                Skip — I&apos;ll set this up later
              </button>
            </div>
          )}

          {/* ── Step 3: Project Info ── */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Project details</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>The basics. You can add more later.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Project name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Business Park" className={inputCls} style={inputStyle} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Location *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Charlotte, NC" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Bid date *</label>
                    <input type="date" value={bidDate} onChange={(e) => setBidDate(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>General contractor</label>
                    <input type="text" value={gc} onChange={(e) => setGc(e.target.value)} placeholder="Skanska USA" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Roof area (SF)</label>
                    <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="68000" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Estimated bid value ($)</label>
                  <input type="number" value={totalBidAmount} onChange={(e) => setTotalBidAmount(e.target.value)} placeholder="1250000" className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Review — show what gets configured ── */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--bs-text-primary)" }}>Your bid is ready to build</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>Here&apos;s what BidShield will set up based on your selections:</p>

              {/* Summary card */}
              <div className="rounded-xl p-4 mb-5 space-y-2" style={{ background: "var(--bs-bg-elevated)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Project</span>
                  <span className="font-semibold" style={{ color: "var(--bs-text-primary)" }}>{name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Type</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{PROJECT_TYPES.find(t => t.id === projectType)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Systems</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {systems.map(s => (
                      <span key={s} className="uppercase text-xs py-0.5 px-2 rounded" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}>{s}</span>
                    ))}
                  </div>
                </div>
                {deck && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>Deck</span>
                    <span style={{ color: "var(--bs-text-secondary)" }}>{DECKS.find(d => d.id === deck)?.label}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Location</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--bs-text-muted)" }}>Bid date</span>
                  <span style={{ color: "var(--bs-text-secondary)" }}>{bidDate}</span>
                </div>
                {gc && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--bs-text-muted)" }}>GC</span>
                    <span style={{ color: "var(--bs-text-secondary)" }}>{gc}</span>
                  </div>
                )}
              </div>

              {/* Assemblies table */}
              {assemblies.length > 0 && (
                <div className="rounded-xl p-4 mb-5" style={{ background: "var(--bs-bg-elevated)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Assemblies</div>
                  <div className="space-y-1.5">
                    {assemblies.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs" style={{ color: "var(--bs-text-secondary)" }}>
                        <span className="font-medium" style={{ color: "var(--bs-text-primary)" }}>{a.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="uppercase">{a.systemType}</span>
                          {a.rValue !== null && <span style={{ color: "var(--bs-teal)" }}>R-{a.rValue.toFixed(1)}</span>}
                          {a.surfaceType && <span>{SURFACE_TYPES.find(s => s.id === a.surfaceType)?.label}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What BidShield configures */}
              <div className="rounded-xl p-4" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal)" }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--bs-teal)" }}>BidShield will configure</div>
                <div className="space-y-2">
                  {configs.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--bs-teal)" }}>
                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI System Description */}
              {(descLoading || aiDescription) && (
                <div className="rounded-xl p-4 mt-5" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>System Description</div>
                  {descLoading ? (
                    <div className="space-y-2">
                      <div className="h-3 rounded" style={{ background: "var(--bs-border)", width: "80%" }} />
                      <div className="h-3 rounded" style={{ background: "var(--bs-border)", width: "60%" }} />
                      <div className="h-3 rounded" style={{ background: "var(--bs-border)", width: "70%" }} />
                    </div>
                  ) : (
                    <textarea
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      rows={5}
                      className="w-full text-xs rounded-lg p-2 outline-none resize-none"
                      style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)" }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-bg-card)" }}>
          {step === 0 || (isEdit && step === 1) ? (
            <button onClick={onClose} className="text-sm transition-colors" style={{ color: "var(--bs-text-dim)" }}>Cancel</button>
          ) : (
            <button onClick={() => setStep(step - 1)} className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--bs-text-muted)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => canAdvance[step] && setStep(step + 1)}
              disabled={!canAdvance[step]}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                // Auto-calculate total sqft from assembly areas if not manually set
                const effectiveSqft = sqft || (() => {
                  const totalArea = assemblies.reduce((sum, a) => sum + (a.area || 0), 0);
                  return totalArea > 0 ? String(Math.round(totalArea)) : "";
                })();
                onCreate({
                name, location, bidDate, trade: "roofing",
                projectType, systemType: systems[0] || "", deckType: deck,
                gc, sqft: effectiveSqft, totalBidAmount,
                assemblies: systems.map(s => s.toUpperCase()).join(","),
                roofAssemblies: assemblies.length > 0
                  ? assemblies.map(a => ({
                      label: a.label,
                      name: a.name || undefined,
                      systemType: a.systemType,
                      insulationType: a.insulationType || "",
                      insulationThickness: a.insulationThickness || "",
                      rValue: a.rValue ?? undefined,
                      surfaceType: a.surfaceType || "",
                      area: a.area ?? undefined,
                      uValue: a.uValue ?? undefined,
                    }))
                  : undefined,
                systemDescription: aiDescription || undefined,
              });}}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {isEdit ? "Save Changes →" : "Create Project & Start →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
