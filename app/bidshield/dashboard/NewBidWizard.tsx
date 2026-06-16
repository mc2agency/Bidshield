"use client";

import React, { useState, useEffect } from "react";
import { computeInsulationRValue } from "@/lib/bidshield/insulation-data";
import { mapAIResultToSectionValues, classifyAssemblySystem, normalizeAssemblySignals, SectionValues } from "@/lib/bidshield/assembly-system-configs";
import { archetypeIdToLegacy } from "@/lib/bidshield/archetype-compat";

// ─── V2 inline types ──────────────────────────────────────────────────────────

interface V2PersistItem {
  drawingAssemblyId: string;
  displayName?: string | null;
  sourceSheet?: string | null;
  originalExtractedText: string[];
  extractedLayers: string[];
  normalizedLayerTokens: string[];
  archetypeId: string;
  archetypeVersion: number;
  confidence: number;
  needsReview: boolean;
  classificationAudit: any;
  sectionValues: Record<string, string | boolean | undefined>;
  requiredSectionsSnapshot: string[];
  optionalSectionsSnapshot: string[];
  hiddenSectionsSnapshot: string[];
  defaultLayerOrderSnapshot: string[];
  legacySystemId?: string;
  area?: number | null;
}

interface V2Item {
  drawingAssemblyId: string;
  displayName?: string | null;
  archetypeId: string;
  confidence: number;
  needsReview: boolean;
  /** Raw layers as extracted by AI */
  extractedLayers: string[];
  /** Full resolved stack: baseStack + modifierStack, deduplicated bottom→top */
  fullLayerStack: string[];
  /** IRMA base stack or structural foundation layers */
  baseStack: string[];
  /** Overburden / finish modifier layers */
  modifierStack: string[];
  requiredSectionsSnapshot: string[];
  optionalSectionsSnapshot: string[];
  hiddenSectionsSnapshot: string[];
  sectionValues: Record<string, string | boolean | undefined>;
  area?: number | null;
}

// ─── V2 helpers ───────────────────────────────────────────────────────────────

function archetypeToSurfaceType(archetypeId: string): string {
  if (archetypeId === "pedestal_paver_irma") return "pavers_pedestals";
  if (archetypeId === "green_roof_irma") return "green_roof";
  if (archetypeId === "ballast_paver_irma") return "pavers_ballast";
  if (archetypeId === "built_up_panel_assembly") return "aluminum_panel";
  if (archetypeId === "concrete_pavement_roof") return "concrete_topping";
  return "";
}

// Paver/ballast IRMA archetypes describe the overburden, not the membrane —
// archetypeIdToLegacy maps them to cold-fluid IRMA by default. When the
// extracted layers show Modified Bitumen / SBS plies (and no cold-fluid /
// liquid-applied membrane), the true waterproofing is SBS, so use sbs_irma.
function resolveIrmaLegacySystem(archetypeId: string, layers: string[]): string {
  const base = archetypeIdToLegacy(archetypeId) || "custom";
  if (archetypeId !== "pedestal_paver_irma" && archetypeId !== "ballast_paver_irma") {
    return base;
  }
  const text = layers.join(" ").toLowerCase();
  const hasModBit = /modified bitumen|mod\.?\s*bit|\bsbs\b|\bapp\b/.test(text);
  const hasColdFluid = /cold[\s-]?fluid|liquid[\s-]?applied|fluid[\s-]?applied/.test(text);
  if (hasModBit && !hasColdFluid) return "sbs_irma";
  return base;
}

// ─── V2InlineCard ─────────────────────────────────────────────────────────────
// Renders a V2 extraction item from snapshots. No legacy imports.

function V2InlineCard({ item, areaOverride }: { item: V2Item; areaOverride?: number | null }) {
  const area = areaOverride != null ? areaOverride : item.area;
  const archLabel = item.archetypeId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const heading = item.displayName
    ? `${item.drawingAssemblyId} — ${item.displayName}`
    : item.drawingAssemblyId;
  const insulationType = item.sectionValues["insulationType"] as string | undefined;
  const insulationThickness = item.sectionValues["insulationThickness"] as string | undefined;
  const rValue = insulationType && insulationThickness
    ? computeInsulationRValue(insulationType, parseFloat(insulationThickness))
    : undefined;
  return (
    <div
      style={{
        background: "var(--bs-bg-card, #1a202c)",
        border: "1.5px solid var(--bs-border, #2d3748)",
        borderRadius: 8,
        padding: "14px 18px",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-text-primary, #e2e8f0)", textTransform: "uppercase" }}>
          {heading}
        </div>
        {area != null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--bs-teal, #2dd4bf)", whiteSpace: "nowrap", flexShrink: 0 }}>
            {area.toLocaleString()} SF
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{
          padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
          background: item.needsReview ? "rgba(239,68,68,0.15)" : "rgba(45,212,191,0.12)",
          color: item.needsReview ? "#ef4444" : "var(--bs-teal, #2dd4bf)",
          border: `1px solid ${item.needsReview ? "rgba(239,68,68,0.3)" : "rgba(45,212,191,0.3)"}`,
        }}>
          {item.needsReview ? `⚠ needs review — ${archLabel}` : `✔ ${archLabel}`}
        </span>
        <span style={{ fontSize: 11, color: "var(--bs-text-dim, #718096)" }}>
          {Math.round(item.confidence * 100)}%
        </span>
        {insulationType && (
          <span style={{ fontSize: 11, color: "var(--bs-text-dim, #718096)" }}>
            {insulationType.toUpperCase()}{insulationThickness ? ` ${insulationThickness}"` : ""}
          </span>
        )}
        {rValue != null && rValue > 0 && (
          <span style={{
            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: "rgba(96,165,250,0.12)", color: "#60a5fa",
            border: "1px solid rgba(96,165,250,0.3)",
          }}>
            R-{Math.round(rValue * 10) / 10}
          </span>
        )}
      </div>
      {item.fullLayerStack.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {item.baseStack.length > 0 && item.modifierStack.length > 0 && (
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--bs-text-dim, #718096)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
              Base assembly
            </div>
          )}
          {(item.baseStack.length > 0 ? item.baseStack : item.fullLayerStack).map((layer, i) => (
            <div key={i} style={{ fontSize: 11, color: "var(--bs-text-secondary, #a0aec0)", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--bs-teal, #2dd4bf)", fontSize: 9 }}>▸</span>
              {layer}
            </div>
          ))}
          {item.modifierStack.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--bs-teal, #2dd4bf)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 8, marginBottom: 3 }}>
                Overburden
              </div>
              {item.modifierStack.map((layer, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--bs-text-secondary, #a0aec0)", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#f59e0b", fontSize: 9 }}>▸</span>
                  {layer}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {item.needsReview && item.fullLayerStack.length === 0 && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#ef4444", fontStyle: "italic" }}>
          No layers extracted — needs manual review
        </div>
      )}
    </div>
  );
}

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Project" },
  { label: "Drawings" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssemblyInput {
  label: string;
  name?: string;
  systemType: string;
  insulationType?: string;
  insulationThickness?: string;
  rValue?: number;
  surfaceType?: string;
  coverBoard?: string;
  area?: number;
  uValue?: number;
  attachmentMethod?: string;
  layers?: string[];
  baseStack?: string[];
  modifierStack?: string[];
  sectionValues?: SectionValues;
  confidence?: number;
  extractedFromPdf?: boolean;
  archetypeId?: string;
  archetypeResolutionSource?: "explicit" | "mapped" | "fallback";
  archetypeNeedsReview?: boolean;
  archetypeFallbackReason?: string;
  legacySystemType?: string;
  legacySystemId?: string;
}

interface WizardData {
  name: string; location: string; bidDate: string; trade: string;
  drawingDate?: string;
  drawingRevision?: string;
  projectType: string; systemType: string; deckType: string;
  gc: string; sqft: string; totalBidAmount: string; assemblies: string;
  roofAssemblies?: AssemblyInput[];
  systemDescription?: string;
  v2ExtractionItems?: V2PersistItem[];
  v2FileName?: string;
}

export interface EditProjectData {
  projectType?: string;
  systemType?: string;
  deckType?: string;
  name?: string;
  location?: string;
  bidDate?: string;
  drawingDate?: string;
  drawingRevision?: string;
  gc?: string;
  sqft?: number;
  totalBidAmount?: number;
  roofAssemblies?: Array<{
    label: string; name?: string; systemType: string;
    insulationType?: string; insulationThickness?: string;
    rValue?: number; surfaceType?: string;
    area?: number; uValue?: number;
    attachmentMethod?: string;
    layers?: string[];
  }>;
  systemDescription?: string;
}

interface Props {
  onClose: () => void;
  onCreate: (data: WizardData) => void;
  isDemo?: boolean;
  isPro?: boolean;
  editProject?: EditProjectData;
  inviteData?: { inviteId: string; name?: string; gc?: string; bidDate?: string };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewBidWizard({ onClose, onCreate, isDemo, isPro, editProject, inviteData }: Props) {
  const isEdit = !!editProject;
  const [step, setStep] = useState(0);

  // Project fields
  const [name, setName] = useState(editProject?.name || inviteData?.name || "");
  const [gc, setGc] = useState(editProject?.gc || inviteData?.gc || "");
  const [bidDate, setBidDate] = useState(editProject?.bidDate || inviteData?.bidDate || "");
  const [sqft, setSqft] = useState(editProject?.sqft ? String(editProject.sqft) : "");
  // Location + drawing metadata — populated from PDF extraction, not shown in wizard
  const [location, setLocation] = useState(editProject?.location || "");
  const [drawingDate, setDrawingDate] = useState(editProject?.drawingDate || "");
  const [drawingRevision, setDrawingRevision] = useState(editProject?.drawingRevision || "");

  // Assembly state — populated by PDF extraction
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
        rValue: a.rValue ?? undefined,
        surfaceType: a.surfaceType || "",
        area: a.area ?? undefined,
        uValue: a.uValue ?? undefined,
        layers: a.layers ?? undefined,
      }));
    }
    return [];
  });
  const [deck, setDeck] = useState(editProject?.deckType || "");

  // PDF / V2 extraction state
  const [pdfMode, setPdfMode] = useState<"idle" | "loading" | "preview" | "error">("idle");
  const [pdfError, setPdfError] = useState("");
  const [pdfResults, setPdfResults] = useState<AssemblyInput[]>([]);
  const [pdfMeta, setPdfMeta] = useState<{ deckType?: string; projectName?: string; location?: string; gc?: string; drawingDate?: string; drawingRevision?: string }>({});
  const [v2Items, setV2Items] = useState<V2Item[]>([]);
  const [v2PersistItems, setV2PersistItems] = useState<V2PersistItem[]>([]);
  const [v2FileName, setV2FileName] = useState<string>("");

  // Takeoff schedule upload state
  const [takeoffMode, setTakeoffMode] = useState<"link" | "upload" | "loading" | "done" | "error">("link");
  const [takeoffError, setTakeoffError] = useState("");

  const canGoNext = name.trim() !== "" && bidDate !== "";
  const inputCls = "w-full py-2.5 px-3 rounded-lg text-sm outline-none transition-colors";
  const inputStyle = { background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" };

  // ── PDF extraction ────────────────────────────────────────────────────────

  const handlePdfFile = async (file: File) => {
    if (file.type !== "application/pdf") { setPdfError("Please select a PDF file."); setPdfMode("error"); return; }
    setPdfMode("loading");
    setPdfError("");
    setV2Items([]);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      // FileReader-based base64 — avoids btoa/spread stack overflow on large PDFs
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(new Blob([bytes], { type: "application/pdf" }));
      });

      // ── Try V2 route first ─────────────────────────────────────────────────
      let v2Ok = false;
      try {
        const v2Res = await fetch("/api/bidshield/v2/extract-assemblies-v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64, fileName: file.name }),
        });
        if (!v2Res.ok) {
          const errBody = await v2Res.json().catch(() => ({}));
          console.warn("[V2 extract] route returned", v2Res.status, errBody?.error ?? "");
        }
        if (v2Res.ok) {
          const v2Data = await v2Res.json();
          const v2Mapped: V2Item[] = (v2Data.items || []).map((item: any) => ({
            drawingAssemblyId: item.drawingAssemblyId ?? "",
            displayName: item.displayName ?? null,
            archetypeId: item.archetypeId ?? "custom",
            confidence: typeof item.confidence === "number" ? item.confidence : 0,
            needsReview: item.needsReview === true,
            extractedLayers: Array.isArray(item.layers) ? item.layers : [],
            fullLayerStack: Array.isArray(item.fullLayerStack) ? item.fullLayerStack : (Array.isArray(item.layers) ? item.layers : []),
            baseStack: Array.isArray(item.baseStack) ? item.baseStack : [],
            modifierStack: Array.isArray(item.modifierStack) ? item.modifierStack : [],
            requiredSectionsSnapshot: Array.isArray(item.requiredSectionsSnapshot) ? item.requiredSectionsSnapshot : [],
            optionalSectionsSnapshot: Array.isArray(item.optionalSectionsSnapshot) ? item.optionalSectionsSnapshot : [],
            hiddenSectionsSnapshot: Array.isArray(item.hiddenSectionsSnapshot) ? item.hiddenSectionsSnapshot : [],
            sectionValues: item.sectionValues && typeof item.sectionValues === "object" ? item.sectionValues : {},
            area: typeof item.area === "number" ? item.area : null,
          }));
          // Filter out non-roof assemblies (soffit/wall types like ST 01, ST 02)
          const roofOnlyMapped = v2Mapped.filter(
            item => !/^ST[\s\-]?\d/i.test(item.drawingAssemblyId)
          );
          if (roofOnlyMapped.length > 0) {
            setV2Items(roofOnlyMapped);
            const persist: V2PersistItem[] = (v2Data.items || []).filter(
              (item: any) => !/^ST[\s\-]?\d/i.test(item.drawingAssemblyId ?? "")
            ).map((item: any) => ({
              drawingAssemblyId: item.drawingAssemblyId ?? "",
              displayName: item.displayName ?? null,
              sourceSheet: item.sourceSheet ?? null,
              originalExtractedText: Array.isArray(item.layers) ? item.layers : [],
              extractedLayers: Array.isArray(item.layers) ? item.layers : [],
              normalizedLayerTokens: Array.isArray(item.normalizedLayerTokens) ? item.normalizedLayerTokens : [],
              archetypeId: item.archetypeId ?? "custom",
              archetypeVersion: typeof item.archetypeVersion === "number" ? item.archetypeVersion : 2,
              confidence: typeof item.confidence === "number" ? item.confidence : 0,
              needsReview: item.needsReview === true,
              classificationAudit: item.classificationAudit ?? null,
              sectionValues: item.sectionValues ?? {},
              requiredSectionsSnapshot: Array.isArray(item.requiredSectionsSnapshot) ? item.requiredSectionsSnapshot : [],
              optionalSectionsSnapshot: Array.isArray(item.optionalSectionsSnapshot) ? item.optionalSectionsSnapshot : [],
              hiddenSectionsSnapshot: Array.isArray(item.hiddenSectionsSnapshot) ? item.hiddenSectionsSnapshot : [],
              defaultLayerOrderSnapshot: Array.isArray(item.defaultLayerOrderSnapshot) ? item.defaultLayerOrderSnapshot : [],
              legacySystemId: archetypeIdToLegacy(item.archetypeId ?? "") ?? undefined,
              area: typeof item.area === "number" ? item.area : null,
            }));
            setV2PersistItems(persist);
            setV2FileName(file.name);
            const v2Assemblies: AssemblyInput[] = roofOnlyMapped.map((item) => ({
              label: item.drawingAssemblyId,
              name: item.displayName ?? undefined,
              systemType: resolveIrmaLegacySystem(item.archetypeId, item.extractedLayers),
              insulationType: (item.sectionValues["insulationType"] as string) || "",
              insulationThickness: (item.sectionValues["insulationThickness"] as string) || "",
              rValue: (() => {
                const t = (item.sectionValues["insulationType"] as string) || "";
                const th = parseFloat((item.sectionValues["insulationThickness"] as string) || "0");
                return t && th ? computeInsulationRValue(t, th) : undefined;
              })(),
              surfaceType: archetypeToSurfaceType(item.archetypeId),
              layers: item.extractedLayers.length > 0 ? item.extractedLayers : undefined,
              baseStack: item.baseStack.length > 0 ? item.baseStack : undefined,
              modifierStack: item.modifierStack.length > 0 ? item.modifierStack : undefined,
              sectionValues: Object.keys(item.sectionValues).length > 0 ? item.sectionValues as SectionValues : undefined,
              area: typeof item.area === "number" ? item.area : undefined,
              archetypeId: item.archetypeId,
              archetypeNeedsReview: item.needsReview,
              extractedFromPdf: true,
              confidence: Math.round(item.confidence * 100),
            }));
            setAssemblies(v2Assemblies);
            const totalArea = v2Assemblies.reduce((sum, a) => sum + (a.area || 0), 0);
            if (totalArea > 0) setSqft(String(Math.round(totalArea)));
            const v2AsLegacySystems = Array.from(new Set(
              roofOnlyMapped.map((i) => resolveIrmaLegacySystem(i.archetypeId, i.extractedLayers)).filter((s): s is string => !!s && s !== "custom")
            ));
            if (v2AsLegacySystems.length > 0) setSystems(v2AsLegacySystems);
            if (v2Data.deckType) setDeck(v2Data.deckType);
            const meta: typeof pdfMeta = {};
            if (v2Data.deckType) meta.deckType = v2Data.deckType;
            if (v2Data.projectName) meta.projectName = v2Data.projectName;
            if (v2Data.location) meta.location = v2Data.location;
            if (v2Data.gc) meta.gc = v2Data.gc;
            if (v2Data.drawingDate) meta.drawingDate = v2Data.drawingDate;
            if (v2Data.drawingRevision) meta.drawingRevision = v2Data.drawingRevision;
            setPdfMeta(meta);
            setPdfMode("preview");
            v2Ok = true;
          }
        }
      } catch (_v2Err) {
        // V2 failed — fall through to legacy route below
      }

      if (v2Ok) return;

      // ── Legacy fallback ────────────────────────────────────────────────────
      const res = await fetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPdfError(data.error || "Extraction failed"); setPdfMode("error"); return; }
      const mapped: AssemblyInput[] = (data.assemblies || []).map((a: any) => {
        const insulationType = a.insulation || a.insulationType || "";
        const insulationThickness = a.thickness?.replace(/"/g, "") || "";
        const extractedRValue = typeof a.rValue === "number" ? a.rValue : undefined;
        const computedRValue = !extractedRValue && insulationType && insulationThickness
          ? computeInsulationRValue(insulationType, parseFloat(insulationThickness))
          : undefined;
        const rawSystemId = a.system || a.systemType || "";

        console.log("[BidShield extract]", {
          label: a.label,
          rawSystem: a.system,
          drainageMat: a.drainageMat,
          filterFabric: a.filterFabric,
          layers: a.layers,
        });

        const signals = normalizeAssemblySignals({
          drainageMat: a.drainageMat,
          filterFabric: a.filterFabric,
          layers: a.layers,
        });

        const effectiveBase =
          (rawSystemId === "lam" && signals.effectiveSbsMembrane) ? "sbs" : rawSystemId;

        const classifiedSystem =
          (effectiveBase === "lam" || effectiveBase === "sbs")
            ? classifyAssemblySystem({
                baseSystem: effectiveBase,
                drainageMat: signals.effectiveDrainageMat,
                filterFabric: signals.effectiveFilterFabric,
                greenRoof: signals.effectiveGreenRoof,
              })
            : rawSystemId;
        const classifiedSystemId = classifiedSystem;

        console.log("[BidShield classify]", {
          label: a.label,
          classifiedSystem,
          rawSystem: a.system,
          layers: a.layers,
          signalAudit: signals.signalAudit,
        });

        const sectionValues = mapAIResultToSectionValues({
          systemType: classifiedSystemId,
          insulationType,
          insulationThickness,
          surfaceType: a.surface || a.surfaceType || "",
          coverBoard: a.coverBoard || undefined,
          drainageMat: signals.effectiveDrainageMat,
          vaporRetarder: a.vaporRetarder ?? false,
          protectionBoard: a.protectionBoard || undefined,
          layers: Array.isArray(a.layers) ? a.layers : [],
          deckType: a.deckType || data.deckType || undefined,
        }, classifiedSystemId);

        console.log("[BidShield state write]", {
          label: a.label,
          systemType: classifiedSystemId,
          layers: a.layers,
        });
        return {
          label: a.label || `RT-${String(assemblies.length + 1).padStart(2, "00")}`,
          name: a.name || undefined,
          systemType: classifiedSystemId,
          insulationType,
          insulationThickness,
          rValue: extractedRValue ?? computedRValue,
          surfaceType: a.surface || a.surfaceType || "",
          coverBoard: a.coverBoard || undefined,
          area: typeof a.area === "number" ? a.area : undefined,
          uValue: typeof a.uValue === "number" ? a.uValue : undefined,
          attachmentMethod: a.attachmentMethod || undefined,
          layers: Array.isArray(a.layers) && a.layers.length > 0 ? a.layers : undefined,
          sectionValues,
          confidence: typeof a.confidence === "number" ? a.confidence : undefined,
          extractedFromPdf: true,
          archetypeId: a.archetypeId || undefined,
          archetypeResolutionSource: a.archetypeResolutionSource || undefined,
          archetypeNeedsReview: a.archetypeNeedsReview === true,
          archetypeFallbackReason: a.archetypeFallbackReason || undefined,
          legacySystemType: a.legacySystemType || undefined,
          legacySystemId: a.legacySystemId || undefined,
        };
      });
      if (mapped.length === 0) { setPdfError("No assemblies found in this PDF."); setPdfMode("error"); return; }
      setPdfResults(mapped);
      const meta: typeof pdfMeta = {};
      if (data.deckType) meta.deckType = data.deckType;
      if (data.projectName) meta.projectName = data.projectName;
      if (data.location) meta.location = data.location;
      if (data.gc) meta.gc = data.gc;
      if (data.drawingDate) meta.drawingDate = data.drawingDate;
      if (data.drawingRevision) meta.drawingRevision = data.drawingRevision;
      setPdfMeta(meta);
      const extractedSystems = [...new Set(mapped.map(a => a.systemType).filter(Boolean))];
      if (extractedSystems.length > 0) setSystems(extractedSystems);
      if (data.deckType) setDeck(data.deckType);
      const totalArea = mapped.reduce((sum, a) => sum + (a.area || 0), 0);
      if (totalArea > 0) setSqft(String(Math.round(totalArea)));
      setAssemblies(mapped);
      setPdfMode("preview");
    } catch { setPdfError("Failed to read PDF."); setPdfMode("error"); }
  };

  const handleTakeoffFile = async (file: File) => {
    if (file.type !== "application/pdf") { setTakeoffError("Please select a PDF file."); setTakeoffMode("error"); return; }
    const mergeOnly = v2Items.length > 0;
    setTakeoffMode("loading");
    setTakeoffError("");
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(new Blob([bytes], { type: "application/pdf" }));
      });
      const res = await fetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setTakeoffError(data.error || "Extraction failed"); setTakeoffMode("error"); return; }
      const extracted: any[] = data.assemblies || [];
      if (extracted.length === 0) { setTakeoffError("No area data found in this PDF."); setTakeoffMode("error"); return; }

      const labelNum = (s: string) => { const m = s.match(/\d+/g); return m ? String(parseInt(m[m.length - 1], 10)) : null; };

      setAssemblies(prev => {
        const updated = [...prev];
        for (const ext of extracted) {
          const extLabel = (ext.label || "").toUpperCase().trim();
          const extNum = labelNum(extLabel);

          let match = updated.findIndex(a => a.label.toUpperCase().trim() === extLabel);
          if (match === -1 && extNum !== null) {
            match = updated.findIndex(a => labelNum(a.label) === extNum);
          }
          if (match === -1) {
            const baseLabel = extLabel.replace(/\s*N$/, "").trim();
            match = updated.findIndex(a => a.label.toUpperCase().trim() === baseLabel);
          }

          const area = typeof ext.area === "number" ? ext.area : undefined;
          const uValue = typeof ext.uValue === "number" ? ext.uValue : undefined;
          const name = ext.name || undefined;

          if (match !== -1) {
            updated[match] = {
              ...updated[match],
              area: (updated[match].area || 0) + (area || 0),
              uValue: uValue ?? updated[match].uValue,
              name: name || updated[match].name,
            };
          } else if (area && !mergeOnly) {
            updated.push({
              label: ext.label || `RT-${String(updated.length + 1).padStart(2, "0")}`,
              name,
              systemType: ext.system || ext.systemType || "",
              insulationType: ext.insulation || ext.insulationType || "",
              insulationThickness: ext.thickness?.replace(/"/g, "") || "",
              rValue: undefined,
              surfaceType: ext.surface || ext.surfaceType || "",
              coverBoard: ext.coverBoard || undefined,
              area,
              uValue,
            });
          }
        }
        return updated;
      });
      setAssemblies(latest => {
        const totalArea = latest.reduce((sum, a) => sum + (a.area || 0), 0);
        if (totalArea > 0) setSqft(String(Math.round(totalArea)));
        return latest;
      });
      setTakeoffMode("done");
      setTimeout(() => setTakeoffMode("link"), 3000);
    } catch { setTakeoffError("Failed to read PDF."); setTakeoffMode("error"); }
  };

  // Auto-fill project info fields from PDF extraction metadata
  useEffect(() => {
    if (pdfMeta.projectName && !name) setName(pdfMeta.projectName);
    if (pdfMeta.location && !location) setLocation(pdfMeta.location);
    if (pdfMeta.gc && !gc) setGc(pdfMeta.gc);
    if (pdfMeta.drawingDate && !drawingDate) setDrawingDate(pdfMeta.drawingDate);
    if (pdfMeta.drawingRevision && !drawingRevision) setDrawingRevision(pdfMeta.drawingRevision);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfMeta]);

  // ── Create handler ────────────────────────────────────────────────────────

  const handleCreate = () => {
    const effectiveSqft = sqft || (() => {
      const totalArea = assemblies.reduce((sum, a) => sum + (a.area || 0), 0);
      return totalArea > 0 ? String(Math.round(totalArea)) : "";
    })();
    onCreate({
      name,
      location,
      bidDate,
      drawingDate: drawingDate || undefined,
      drawingRevision: drawingRevision || undefined,
      trade: "roofing",
      projectType: "reroof",
      systemType: systems[0] || "",
      deckType: deck,
      gc,
      sqft: effectiveSqft,
      totalBidAmount: "",
      assemblies: assemblies.length > 0
        ? assemblies.map(a => a.systemType?.toUpperCase() || "").filter(Boolean).join(",")
        : "",
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
            attachmentMethod: a.attachmentMethod ?? undefined,
            layers: a.layers && a.layers.length > 0 ? a.layers : undefined,
          }))
        : undefined,
      systemDescription: undefined,
      v2ExtractionItems: v2PersistItems.length > 0 ? v2PersistItems : undefined,
      v2FileName: v2FileName || undefined,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasAssemblies = v2Items.length > 0 || pdfResults.length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>

        {/* Progress bar */}
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

          {/* ── Step 0: Name your bid ── */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>
                {isEdit ? "Edit project" : "Name your bid"}
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>
                {isEdit ? "Update the basics below." : "A few basics to get started. Everything else can be filled in from the project."}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Project name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Meridian Business Park"
                    className={inputCls}
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>Bid date *</label>
                    <input type="date" value={bidDate} onChange={(e) => setBidDate(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                      Roof area (SF) <span style={{ color: "var(--bs-text-dim)", fontWeight: 400 }}>(opt.)</span>
                    </label>
                    <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="68,000" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: "var(--bs-text-secondary)" }}>
                    General contractor <span style={{ color: "var(--bs-text-dim)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input type="text" value={gc} onChange={(e) => setGc(e.target.value)} placeholder="Skanska USA" className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Upload drawings ── */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--bs-text-primary)", letterSpacing: "-0.01em", marginBottom: 4 }}>Upload your drawings</h3>
              <p className="text-sm mb-5" style={{ color: "var(--bs-text-muted)" }}>
                {pdfMode === "preview" && hasAssemblies
                  ? `${v2Items.length || pdfResults.length} assembl${(v2Items.length || pdfResults.length) === 1 ? "y" : "ies"} extracted — review below, then create the project.`
                  : "Optional — AI extracts roof assemblies automatically. You can skip and upload from the project."}
              </p>

              {/* Drop zone (idle) */}
              {pdfMode === "idle" && (
                <div
                  className="rounded-xl p-8 text-center mb-4"
                  style={{ border: "2px dashed var(--bs-teal)", background: "var(--bs-teal-dim)", cursor: "pointer" }}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handlePdfFile(f); }}
                >
                  <svg className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--bs-text-secondary)" }}>Drop your roof plan PDF here</p>
                  <p className="text-xs mb-5" style={{ color: "var(--bs-text-dim)" }}>AI extracts roof assemblies, deck type &amp; insulation automatically</p>
                  <label className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
                    Choose PDF
                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); }} />
                  </label>
                </div>
              )}

              {/* Loading */}
              {pdfMode === "loading" && (
                <div className="rounded-xl p-8 text-center mb-4" style={{ border: "2px dashed var(--bs-teal)", background: "var(--bs-teal-dim)" }}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="animate-spin w-5 h-5" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: "var(--bs-text-secondary)" }}>Analyzing roof plan...</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Extracting systems, deck type, insulation &amp; assemblies</p>
                </div>
              )}

              {/* Error */}
              {pdfMode === "error" && (
                <div className="rounded-xl p-5 text-center mb-4" style={{ border: "1px solid var(--bs-red-border)", background: "var(--bs-red-dim)" }}>
                  <p className="text-sm font-medium mb-3" style={{ color: "var(--bs-red)" }}>{pdfError}</p>
                  <button onClick={() => setPdfMode("idle")} className="text-xs font-medium" style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
                </div>
              )}

              {/* V2 preview */}
              {pdfMode === "preview" && v2Items.length > 0 && (
                <div className="rounded-xl p-4 mb-4" style={{ border: "1px solid var(--bs-teal-border)", background: "var(--bs-teal-dim)" }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-teal)" }}>
                    {v2Items.length} assembl{v2Items.length === 1 ? "y" : "ies"} detected
                    {pdfMeta.deckType && <span className="normal-case font-normal"> · {pdfMeta.deckType} deck</span>}
                  </div>
                  {(pdfMeta.projectName || pdfMeta.gc || pdfMeta.drawingDate) && (
                    <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.2)", fontSize: 11, color: "var(--bs-text-secondary)" }}>
                      <span className="font-semibold" style={{ color: "var(--bs-teal)" }}>From drawing: </span>
                      {pdfMeta.projectName && <span>{pdfMeta.projectName}</span>}
                      {pdfMeta.gc && <span>{pdfMeta.projectName ? " · GC: " : "GC: "}{pdfMeta.gc}</span>}
                      {pdfMeta.drawingDate && <span> · {pdfMeta.drawingDate}</span>}
                      {pdfMeta.drawingRevision && <span> ({pdfMeta.drawingRevision})</span>}
                    </div>
                  )}
                  <div className="mb-3">
                    {v2Items.map((item, i) => (
                      <V2InlineCard
                        key={i}
                        item={item}
                        areaOverride={assemblies.find((a) => a.label === item.drawingAssemblyId)?.area ?? item.area}
                      />
                    ))}
                  </div>
                  {assemblies.some(a => a.area) && (
                    <div className="text-right mb-3 text-xs font-semibold" style={{ color: "var(--bs-teal)" }}>
                      Total: {assemblies.reduce((sum, a) => sum + (a.area || 0), 0).toLocaleString()} SF
                    </div>
                  )}
                  {/* Takeoff schedule upload */}
                  <div className="mb-2">
                    {takeoffMode === "link" && (
                      <button onClick={() => setTakeoffMode("upload")} className="text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>
                          {assemblies.some(a => a.area) ? "Re-upload takeoff schedule for areas" : "Upload takeoff schedule for areas"}
                        </span>
                      </button>
                    )}
                    {takeoffMode === "upload" && (
                      <div
                        className="rounded-xl p-4 text-center"
                        style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-elevated)" }}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleTakeoffFile(f); }}
                      >
                        <p className="text-xs mb-2" style={{ color: "var(--bs-text-muted)" }}>Drop a takeoff schedule PDF to add area (SF) to each assembly</p>
                        <label className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
                          Choose file
                          <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleTakeoffFile(f); }} />
                        </label>
                        <button onClick={() => setTakeoffMode("link")} className="block mx-auto mt-2 text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                      </div>
                    )}
                    {takeoffMode === "loading" && (
                      <div className="flex items-center gap-2 py-1">
                        <svg className="animate-spin w-3 h-3" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>Merging areas...</span>
                      </div>
                    )}
                    {takeoffMode === "done" && <span className="text-xs font-medium" style={{ color: "var(--bs-teal)" }}>Areas merged!</span>}
                    {takeoffMode === "error" && (
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--bs-red)" }}>{takeoffError}</p>
                        <button onClick={() => setTakeoffMode("upload")} className="text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setV2Items([]); setV2PersistItems([]); setPdfResults([]); setAssemblies([]); setSystems([]); setPdfMode("idle"); }}
                    className="mt-1 text-xs"
                    style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    ↩ Try a different file
                  </button>
                </div>
              )}

              {/* Legacy preview fallback */}
              {pdfMode === "preview" && v2Items.length === 0 && pdfResults.length > 0 && (
                <div className="rounded-xl p-4 mb-4" style={{ border: "1px solid var(--bs-teal-border)", background: "var(--bs-teal-dim)" }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-teal)" }}>
                    {pdfResults.length} assembl{pdfResults.length === 1 ? "y" : "ies"} detected
                  </div>
                  <div className="space-y-1 mb-3">
                    {pdfResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded" style={{ background: "var(--bs-bg-card)" }}>
                        <span className="font-bold" style={{ color: "var(--bs-text-primary)", minWidth: 40 }}>{r.label}</span>
                        <span style={{ color: "var(--bs-text-secondary)" }}>{r.systemType}</span>
                        {r.area && <span className="ml-auto font-medium" style={{ color: "var(--bs-teal)" }}>{r.area.toLocaleString()} SF</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setPdfResults([]); setAssemblies([]); setSystems([]); setPdfMode("idle"); }}
                    className="text-xs"
                    style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    ↩ Try a different file
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-between items-center" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-bg-card)" }}>
          {step === 0 ? (
            <button onClick={onClose} className="text-sm transition-colors" style={{ color: "var(--bs-text-dim)" }}>Cancel</button>
          ) : (
            <button onClick={() => setStep(0)} className="text-sm transition-colors flex items-center gap-1" style={{ color: "var(--bs-text-muted)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
              Back
            </button>
          )}

          {step === 0 ? (
            <button
              onClick={() => setStep(1)}
              disabled={!canGoNext}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={pdfMode === "loading"}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {pdfMode === "loading"
                ? "Analyzing..."
                : isEdit
                ? "Save Changes →"
                : pdfMode === "preview" && hasAssemblies
                ? "Create with Assemblies →"
                : "Create Project →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
