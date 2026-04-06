"use client";
import { DEMO_MATERIALS as IMPORTED_MATERIALS } from "@/lib/bidshield/demo-data";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { track } from "@vercel/analytics";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import {
  MATERIAL_CATEGORIES,
  MATERIAL_TEMPLATES,
  getTemplatesForSystem,
  calculateMaterialQuantity,
  type MaterialCategory,
  type MaterialTemplate,
} from "@/lib/bidshield/material-templates";

// Demo material data for Meridian Business Park (TPO 60mil, 68,000 SF)
const DEMO_MATERIALS = [
  { _id: "dm_1", templateKey: "tpo-60mil", category: "membrane", name: "TPO 60mil Membrane (10' wide)", unit: "RL", calcType: "coverage", quantity: 48, unitPrice: 285, totalCost: 13680, wasteFactor: 1.05, coverage: 1000, coverageRate: "1000 SF/RL" },
  { _id: "dm_2", templateKey: "iso-2.5in", category: "insulation", name: 'Polyiso 2.5" (4x8)', unit: "BD", calcType: "coverage", quantity: 1477, unitPrice: 34, totalCost: 50218, wasteFactor: 1.05, coverage: 32, coverageRate: "32 SF/BD" },
  { _id: "dm_3", templateKey: "densdeck", category: "insulation", name: 'DensDeck Cover Board 1/2"', unit: "BD", calcType: "coverage", quantity: 1477, unitPrice: 22, totalCost: 32494, wasteFactor: 1.05, coverage: 32, coverageRate: "32 SF/BD" },
  { _id: "dm_4", templateKey: "iso-fasteners", category: "fasteners", name: "Insulation Screws + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", quantity: 24, unitPrice: 145, totalCost: 3480, wasteFactor: 1.05, qtyPerSf: 0.25 },
  { _id: "dm_5", templateKey: "membrane-fasteners", category: "fasteners", name: "Membrane Fasteners + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", quantity: 16, unitPrice: 165, totalCost: 2640, wasteFactor: 1.05, qtyPerSf: 0.167 },
  { _id: "dm_6", templateKey: "bonding-adhesive", category: "adhesive", name: "Bonding Adhesive (5 gal pail)", unit: "GL", calcType: "coverage", quantity: 198, unitPrice: 185, totalCost: 36630, wasteFactor: 1.10, coverage: 250, coverageRate: "250 SF/GL" },
  { _id: "dm_7", templateKey: "tpo-primer", category: "adhesive", name: "TPO/PVC Primer (1 gal)", unit: "GL", calcType: "coverage", quantity: 248, unitPrice: 65, totalCost: 16120, wasteFactor: 1.10, coverage: 200, coverageRate: "200 SF/GL" },
  { _id: "dm_8", templateKey: "drip-edge", category: "sheet_metal", name: "Drip Edge (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 84, unitPrice: 18, totalCost: 1512, wasteFactor: 1.05 },
  { _id: "dm_9", templateKey: "coping-cap", category: "sheet_metal", name: "Coping Cap (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 42, unitPrice: 42, totalCost: 1764, wasteFactor: 1.05 },
  { _id: "dm_10", templateKey: "pipe-boots", category: "accessories", name: "Pipe Boots (TPO/PVC)", unit: "EA", calcType: "count_from_takeoff", quantity: 24, unitPrice: 35, totalCost: 840, wasteFactor: 1.0 },
  { _id: "dm_11", templateKey: "drain-assembly", category: "accessories", name: "Drain Assemblies", unit: "EA", calcType: "count_from_takeoff", quantity: 8, unitPrice: 125, totalCost: 1000, wasteFactor: 1.0 },
  { _id: "dm_12", templateKey: "seam-tape", category: "accessories", name: "Seaming Tape (100' roll)", unit: "RL", calcType: "coverage", quantity: 520, unitPrice: 55, totalCost: 28600, wasteFactor: 1.10, coverage: 100, coverageRate: "100 SF/RL" },
];

const DEMO_TAKEOFF_LINE_ITEMS = [
  { itemType: "edge_metal", quantity: 800 },
  { itemType: "coping", quantity: 400 },
  { itemType: "counterflashing", quantity: 320 },
  { itemType: "gravel_stop", quantity: 0 },
  { itemType: "reglet", quantity: 200 },
  { itemType: "base_flashing", quantity: 600 },
  { itemType: "pipe_penetration", quantity: 24 },
  { itemType: "roof_drain", quantity: 8 },
  { itemType: "overflow_drain", quantity: 4 },
  { itemType: "pitch_pan", quantity: 6 },
];

// Categories where 0% waste is always a problem
const WASTE_REQUIRED_CATS = new Set(["membrane", "insulation", "fasteners"]);

// Known coverage ranges per category for validation
const COVERAGE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  "tpo": { min: 100, max: 2000, unit: "SF/RL" },
  "epdm": { min: 100, max: 2000, unit: "SF/RL" },
  "pvc": { min: 100, max: 2000, unit: "SF/RL" },
  "membrane": { min: 30, max: 2000, unit: "SF" },
  "insulation": { min: 16, max: 64, unit: "SF/BD" },
  "adhesive": { min: 50, max: 500, unit: "SF/GL" },
  "fasteners": { min: 100, max: 1000, unit: "EA/BX" },
};

// Numeric tokens that must all appear in a match (e.g. "20", "2.5", "60mil", "4x8")
function extractNumericTokens(s: string): string[] {
  return (s.match(/\d+\.?\d*(?:['"×xmil]+)?/gi) ?? []).map(t => t.toLowerCase());
}

// Product family groups — cross-family matches are rejected
const PRODUCT_FAMILIES: string[][] = [
  ["cap sheet", "cap ply", "granulated", "torch cap"],
  ["base sheet", "base ply", "base coat", "torch base"],
  ["coverboard", "cover board", "densdeck", "dens deck", "gypsum board"],
  ["fastener", "screw", "plate", "nail", "clip"],
  ["adhesive", "bonding", "primer", "cement", "sealant", "caulk", "mastic"],
  ["flashing", "counterflashing", "coping", "drip edge", "gravel stop", "reglet"],
];

function getProductFamily(s: string): number {
  const lower = s.toLowerCase();
  for (let i = 0; i < PRODUCT_FAMILIES.length; i++) {
    if (PRODUCT_FAMILIES[i].some(k => lower.includes(k))) return i;
  }
  return -1;
}

// Match a material name against quote line items with strict confidence rules
function findBestQuoteMatch(
  materialName: string,
  lineItems: { m: string; u: string; p: number }[]
): { item: { m: string; u: string; p: number }; confidence: number } | null {
  if (!lineItems.length) return null;
  const target = materialName.toLowerCase();
  const targetNums = extractNumericTokens(target);
  const targetFamily = getProductFamily(target);
  const targetWords = target.split(/[\s,()\/]+/).filter(w => w.length > 2);

  let best: { item: { m: string; u: string; p: number }; confidence: number } | null = null;

  for (const li of lineItems) {
    const candidate = li.m.toLowerCase();
    const candidateNums = extractNumericTokens(candidate);
    const candidateFamily = getProductFamily(candidate);

    // Bidirectional numeric check: all target nums must be in candidate AND vice versa
    if (targetNums.length > 0 && !targetNums.every(n => candidateNums.includes(n))) continue;
    if (candidateNums.length > 0 && !candidateNums.every(n => targetNums.includes(n))) continue;

    // No cross-family matching when both families are known
    if (targetFamily !== -1 && candidateFamily !== -1 && targetFamily !== candidateFamily) continue;

    const matched = targetWords.filter(w => candidate.includes(w));
    const confidence = targetWords.length > 0 ? (matched.length / targetWords.length) * 100 : 0;

    // Require at least 2 significant words matched
    if (matched.length < 2) continue;

    if (confidence > (best?.confidence ?? 0)) {
      best = { item: li, confidence };
    }
  }

  return best && best.confidence >= 65 ? best : null;
}

// Search across ALL project quotes and return the highest-confidence match
function findBestMatchAcrossAllQuotes(
  materialName: string,
  allQuotes: any[]
): { item: { m: string; u: string; p: number }; confidence: number; quoteName: string } | null {
  let best: { item: { m: string; u: string; p: number }; confidence: number; quoteName: string } | null = null;
  for (const q of allQuotes) {
    const lineItems: { m: string; u: string; p: number }[] = (q.products ?? []).flatMap((s: string) => {
      try { const p = JSON.parse(s); return p.p > 0 ? [p] : []; } catch { return []; }
    });
    const match = findBestQuoteMatch(materialName, lineItems);
    if (match && (!best || match.confidence > best.confidence)) {
      best = { ...match, quoteName: q.vendorName ?? "Quote" };
    }
  }
  return best;
}

function isStaleQuote(quoteDate: string | undefined): boolean {
  if (!quoteDate) return false;
  return new Date(quoteDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
}

// Map datasheet category to material category
function datasheetCategoryToMaterial(cat: string): string {
  const map: Record<string, string> = {
    "TPO": "membrane", "PVC": "membrane", "EPDM": "membrane",
    "Modified Bitumen": "membrane", "Built-Up Roofing": "membrane", "Spray Foam": "membrane", "Metal Roofing": "membrane",
    "Insulation": "insulation", "Cover Board": "insulation",
    "Fasteners": "fasteners",
    "Adhesives": "adhesive",
    "Sheet Metal": "sheet_metal",
  };
  return map[cat] || "accessories";
}

// ── Pricing flag ─────────────────────────────────────────────────────────────
function PricingFlag({
  material,
  quoteLineItems,
  selectedQuoteId,
}: {
  material: any;
  quoteLineItems: { m: string; u: string; p: number }[];
  selectedQuoteId: string | null;
}) {
  if (!selectedQuoteId) return null;
  const match = findBestQuoteMatch(material.name, quoteLineItems);
  if (!match) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--bs-text-dim)", background: "rgba(255,255,255,0.04)" }}>
        — No match
      </span>
    );
  }
  const priceDiff = (material.unitPrice ?? 0) - match.item.p;
  const priceDiffPct = match.item.p > 0 ? Math.abs(priceDiff / match.item.p * 100) : 0;
  if (priceDiffPct < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--bs-teal)", background: "var(--bs-teal-dim)" }} title={`Quote: $${match.item.p.toFixed(2)}`}>
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
        Quoted
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-help"
      style={{ color: "var(--bs-amber)", background: "var(--bs-amber-dim)" }}
      title={`Quote price: $${match.item.p.toFixed(2)} — ${priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(2)} difference`}
    >
      Quote: ${match.item.p.toFixed(2)}
    </span>
  );
}

// ── Waste flag ───────────────────────────────────────────────────────────────
function WasteFlag({ material }: { material: any }) {
  if (!WASTE_REQUIRED_CATS.has(material.category)) return null;
  const wastePct = (material.wasteFactor - 1) * 100;
  if (wastePct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--bs-teal)" }} title="Waste factor applied">
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--bs-amber)" }} title="Waste factor required for this category">
      0%
    </span>
  );
}

// ── Coverage flag ────────────────────────────────────────────────────────────
function CoverageFlag({ material, onLookup, lookupResults }: {
  material: any;
  onLookup: (id: string, name: string) => void;
  lookupResults: Record<string, { coverageRate: string | null; confidence: string; loading?: boolean }>;
}) {
  const coverageRate = material.coverageRate as string | undefined;
  const coverageSource = material.coverageSource as string | undefined;
  const lookup = lookupResults[material._id];

  // If AI estimated
  if (coverageSource === "ai_estimated" && coverageRate) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--bs-teal)", background: "var(--bs-teal-dim)" }} title="AI-estimated coverage rate — verify against spec sheet">
        {coverageRate} (AI — verify)
      </span>
    );
  }

  // If coverage present and verified/from report
  if (coverageRate) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--bs-text-dim)" }} title="Coverage rate on file">
        {coverageRate}
      </span>
    );
  }

  // Not present — show lookup option or result
  if (lookup?.loading) {
    return <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>Looking up...</span>;
  }
  if (lookup && lookup.coverageRate) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--bs-teal)", background: "var(--bs-teal-dim)" }} title="AI-estimated coverage rate — verify against spec sheet">
        {lookup.coverageRate} (AI — verify)
      </span>
    );
  }
  if (lookup && !lookup.coverageRate) {
    return <span className="text-[10px]" style={{ color: "var(--bs-amber)" }}>Coverage unknown</span>;
  }

  // No coverage, no lookup yet — only show for coverage-type materials
  if (material.calcType === "coverage") {
    return (
      <button
        onClick={() => onLookup(material._id, material.name)}
        className="text-[10px] underline underline-offset-2"
        style={{ color: "var(--bs-amber)" }}
        title="Look up standard coverage rate with AI"
      >
        No coverage — look up
      </button>
    );
  }
  return null;
}

export default function MaterialsTab({ projectId, isDemo, isPro, project, userId, onNavigateTab }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const projectMaterials = useQuery(
    api.bidshield.getProjectMaterials,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const userPrices = useQuery(
    api.bidshield.getUserMaterialPrices,
    !isDemo && userId ? { userId } : "skip"
  );
  const takeoffLineItems = useQuery(
    api.bidshield.getTakeoffLineItems,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const takeoffSections = useQuery(
    api.bidshield.getTakeoffSections,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const datasheets = useQuery(
    api.bidshield.getDatasheets,
    !isDemo && userId ? { userId } : "skip"
  );
  const projectQuotes = useQuery(
    api.bidshield.getQuotes,
    !isDemo && isValidConvexId && userId ? { userId, projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  const initMaterials = useMutation(api.bidshield.initProjectMaterials);
  const addMaterial = useMutation(api.bidshield.addProjectMaterial);
  const updateMaterial = useMutation(api.bidshield.updateProjectMaterial);
  const deleteMaterial = useMutation(api.bidshield.deleteProjectMaterial);
  const upsertPrice = useMutation(api.bidshield.upsertUserMaterialPrice);
  const bulkSaveExtracted = useMutation(api.bidshield.bulkSaveMaterialsFromExtraction);
  const clearMaterials = useMutation(api.bidshield.clearProjectMaterials);
  const updateCoverageRate = useMutation(api.bidshield.updateMaterialCoverageRate);
  const fixCategories = useMutation(api.bidshield.fixMaterialCategories);

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>("__best_match__");
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editWaste, setEditWaste] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [checkRowId, setCheckRowId] = useState<string | null>(null);
  const [coverageLookups, setCoverageLookups] = useState<Record<string, { coverageRate: string | null; confidence: string; loading?: boolean }>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedFrom, setExtractedFrom] = useState<string | null>(null);
  const [alertExpanded, setAlertExpanded] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[] | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>("");
  const [isSavingExtraction, setIsSavingExtraction] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [isFixingCategories, setIsFixingCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve materials (demo vs real)
  const [demoMaterials, setDemoMaterials] = useState(DEMO_MATERIALS as any[]);
  const materials = isDemo ? demoMaterials : (projectMaterials ?? []);
  const lineItems = isDemo ? DEMO_TAKEOFF_LINE_ITEMS : (takeoffLineItems ?? []);
  const sections = isDemo ? [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }] : (takeoffSections ?? []);
  const totalSF = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);
  const ds = isDemo ? [] : (datasheets ?? []);
  const quotes = isDemo ? [] : (projectQuotes ?? []);
  const isBestMatch = selectedQuoteId === "__best_match__";
  const isComparing = selectedQuoteId !== null;
  const selectedQuoteLineItems = useMemo(() => {
    if (!selectedQuoteId || isBestMatch) return [];
    const q = quotes.find((q: any) => q._id === selectedQuoteId);
    if (!q) return [];
    return (q.products ?? []).flatMap((s: string) => {
      try { const p = JSON.parse(s); return p.p > 0 ? [p] : []; } catch { return []; }
    });
  }, [selectedQuoteId, isBestMatch, quotes]);

  // Filter
  const filteredMaterials = filterCategory === "all"
    ? materials
    : materials.filter((m: any) => m.category === filterCategory);

  // Grouped by category
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const m of filteredMaterials) {
      const cat = (m as any).category;
      if (!g[cat]) g[cat] = [];
      g[cat].push(m);
    }
    return g;
  }, [filteredMaterials]);

  // Summary stats
  const totalCost = materials.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
  const pricedCount = materials.filter((m: any) => m.unitPrice && m.unitPrice > 0).length;
  const unpricedCount = materials.length - pricedCount;
  const dollarPerSf = totalSF > 0 ? totalCost / totalSF : 0;

  // Category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const m of materials) {
      const cat = (m as any).category;
      totals[cat] = (totals[cat] || 0) + ((m as any).totalCost || 0);
    }
    return totals;
  }, [materials]);

  // ── Verification issue counts for the alert banner ──────────────────────
  const verificationIssues = useMemo(() => {
    const pricingGaps: string[] = [];
    const coverageIssues: string[] = [];
    const wasteIssues: string[] = [];

    for (const m of materials as any[]) {
      // Pricing gap: no quote match when a quote is selected
      if (isComparing) {
        const hasMatch = isBestMatch
          ? !!findBestMatchAcrossAllQuotes(m.name, quotes)
          : !!findBestQuoteMatch(m.name, selectedQuoteLineItems);
        if (!hasMatch) pricingGaps.push(m.name);
      }
      // Coverage issue: coverage-type material with no rate
      if (m.calcType === "coverage" && !m.coverageRate) {
        coverageIssues.push(m.name);
      }
      // Waste issue: required cat with 0% waste
      if (WASTE_REQUIRED_CATS.has(m.category) && (m.wasteFactor - 1) * 100 === 0) {
        wasteIssues.push(m.name);
      }
    }
    return { pricingGaps, coverageIssues, wasteIssues };
  }, [materials, ds, isComparing, isBestMatch, quotes, selectedQuoteLineItems]);

  const totalIssues = verificationIssues.pricingGaps.length + verificationIssues.coverageIssues.length + verificationIssues.wasteIssues.length;

  // ── Category-level quote coverage ─────────────────────────────────────────
  const categoryHasQuote = useMemo(() => {
    const covered: Record<string, boolean> = {};
    if (!isComparing) return covered;
    for (const m of materials as any[]) {
      const cat = m.category;
      if (!covered[cat]) covered[cat] = false;
      const hasMatch = isBestMatch
        ? !!findBestMatchAcrossAllQuotes(m.name, quotes)
        : !!findBestQuoteMatch(m.name, selectedQuoteLineItems);
      if (hasMatch) covered[cat] = true;
    }
    return covered;
  }, [materials, isComparing, isBestMatch, quotes, selectedQuoteLineItems]);

  // ── Coverage lookup via AI ─────────────────────────────────────────────────
  const handleCoverageLookup = useCallback(async (materialId: string, materialName: string) => {
    setCoverageLookups(prev => ({ ...prev, [materialId]: { coverageRate: null, confidence: "low", loading: true } }));
    try {
      const res = await fetch("/api/bidshield/lookup-coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialName }),
      });
      const data = await res.json();
      setCoverageLookups(prev => ({ ...prev, [materialId]: { coverageRate: data.coverageRate, confidence: data.confidence } }));
      // If high confidence and not demo, save to db
      if (data.confidence === "high" && data.coverageRate && !isDemo && materialId && !materialId.startsWith("dm_")) {
        await updateCoverageRate({
          materialId: materialId as Id<"bidshield_project_materials">,
          coverageRate: data.coverageRate,
          source: "ai_estimated",
        });
      }
    } catch {
      setCoverageLookups(prev => ({ ...prev, [materialId]: { coverageRate: null, confidence: "low" } }));
    }
  }, [isDemo, updateCoverageRate]);

  // ── PDF upload handler — reads file with FileReader to avoid stack overflow
  //    on large PDFs, then shows a preview modal before committing changes ────
  const handlePdfUpload = useCallback((file: File) => {
    if (!file || file.type !== "application/pdf") return;
    setIsUploading(true);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Split on comma to get only the base64 data portion (strip "data:application/pdf;base64," prefix)
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        if (!base64) { setIsUploading(false); return; }

        const res = await fetch("/api/bidshield/extract-estimating-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64 }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setUploadError(err?.error ?? "PDF extraction failed — please try again or use a different file.");
          setIsUploading(false);
          return;
        }

        const data = await res.json();
        if (!data.items?.length) {
          setUploadError("No materials found in this PDF. Make sure you're uploading an estimating report with line items.");
          setIsUploading(false);
          return;
        }

        // Show preview modal — don't save yet
        track("material_report_uploaded");
        setPreviewItems(data.items);
        setPreviewFilename(file.name);
      } catch (err: any) {
        setUploadError(err?.message ?? "Upload failed — check your connection and try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Could not read the file. Please try again.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Replace all existing materials with extracted items ───────────────────
  const handleReplaceAll = useCallback(async () => {
    if (!previewItems) return;
    setReplaceError(null);
    setIsSavingExtraction(true);
    try {
      if (isDemo) {
        const demoParsed = previewItems.map((item: any, i: number) => ({
          _id: `extracted_${i}`,
          category: item.category?.toLowerCase().replace(/[\s&]+/g, "_") || "accessories",
          name: item.materialName,
          unit: item.unit,
          calcType: "fixed",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalCost: item.extendedTotal,
          wasteFactor: item.wastePct > 0 ? 1 + item.wastePct / 100 : 1.0,
          coverageRate: item.coverageRate || null,
          coverageSource: item.coverageRate ? "report" : undefined,
          extractedFromPdf: true,
        }));
        setDemoMaterials(demoParsed);
      } else if (isValidConvexId && userId) {
        await clearMaterials({ projectId: projectId as Id<"bidshield_projects">, userId });
        const parseNum = (v: unknown, fallback = 0): number => {
          if (typeof v === "number" && !isNaN(v)) return v;
          if (typeof v === "string") { const n = parseFloat(v); return isNaN(n) ? fallback : n; }
          return fallback;
        };
        const sanitizedItems = previewItems.map((item: any) => ({
          materialName: item.materialName ?? "",
          category: item.category ?? "General",
          unit: item.unit ?? "EA",
          quantity: parseNum(item.quantity),
          coverageRate: item.coverageRate ?? undefined,
          wastePct: parseNum(item.wastePct),
          unitPrice: parseNum(item.unitPrice),
          extendedTotal: parseNum(item.extendedTotal),
        }));
        await bulkSaveExtracted({
          projectId: projectId as Id<"bidshield_projects">,
          userId,
          items: sanitizedItems,
        });
      } else {
        setReplaceError(`Cannot save: projectId=${projectId ?? "missing"}, userId=${userId ?? "missing — not signed in?"}`);
        return;
      }
      // Only reached on success
      setExtractedFrom(previewFilename);
      setPreviewItems(null);
      setPreviewFilename("");
    } catch (err: any) {
      console.error("Replace materials error:", err);
      setReplaceError(err?.message ?? "Server error — check browser console for details");
    } finally {
      setIsSavingExtraction(false);
    }
  }, [previewItems, previewFilename, isDemo, isValidConvexId, userId, projectId, clearMaterials, bulkSaveExtracted]);

  // Fix miscategorized items (edge_metal → sheet_metal, lumber out of accessories, etc.)
  const handleFixCategories = useCallback(async () => {
    if (isDemo || !isValidConvexId) return;
    setIsFixingCategories(true);
    try {
      await fixCategories({ projectId: projectId as Id<"bidshield_projects"> });
    } catch (err) {
      console.error("Fix categories error:", err);
    } finally {
      setIsFixingCategories(false);
    }
  }, [isDemo, isValidConvexId, projectId, fixCategories]);

  // Initialize materials from templates for this project's system type
  const handleInitialize = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    setIsInitializing(true);
    const systemType = project?.systemType || "tpo";
    const templates = getTemplatesForSystem(systemType);
    const userPriceMap: Record<string, number> = {};
    for (const p of (userPrices ?? [])) {
      userPriceMap[(p as any).materialName] = (p as any).unitPrice;
    }

    const materialsToAdd = templates.map((t) => {
      const qty = calculateMaterialQuantity(t, totalSF, lineItems as any);
      const price = userPriceMap[t.name] ?? t.defaultUnitPrice;
      return {
        templateKey: t.key,
        category: t.category,
        name: t.name,
        unit: t.unit,
        calcType: t.calcType,
        quantity: qty ?? undefined,
        unitPrice: price,
        totalCost: qty && price ? qty * price : undefined,
        wasteFactor: t.wasteFactor,
        coverage: t.defaultCoverage,
        qtyPerSf: t.defaultQtyPerSf,
        takeoffItemType: t.takeoffItemType,
      };
    });

    await initMaterials({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      materials: materialsToAdd,
    });
    setIsInitializing(false);
  }, [isDemo, isValidConvexId, userId, project, totalSF, lineItems, userPrices, projectId, initMaterials]);

  // Recalculate all quantities from current takeoff data
  const handleRecalculate = useCallback(async () => {
    if (isDemo) return;
    for (const m of materials) {
      const mat = m as any;
      if (!mat.templateKey) continue;
      const template = MATERIAL_TEMPLATES.find((t) => t.key === mat.templateKey);
      if (!template) continue;
      const qty = calculateMaterialQuantity(
        template,
        totalSF,
        lineItems as any,
        { coverage: mat.coverage, qtyPerSf: mat.qtyPerSf, wasteFactor: mat.wasteFactor }
      );
      if (qty !== null && qty !== mat.quantity) {
        const cost = mat.unitPrice ? qty * mat.unitPrice : undefined;
        await updateMaterial({
          materialId: mat._id,
          quantity: qty,
          totalCost: cost,
        });
      }
    }
  }, [isDemo, materials, totalSF, lineItems, updateMaterial]);

  // Start inline editing
  const startEdit = (m: any) => {
    setEditingId(m._id);
    setEditPrice(m.unitPrice?.toString() || "");
    setEditQty(m.quantity?.toString() || "");
    setEditWaste(((m.wasteFactor - 1) * 100).toFixed(0));
  };

  // Save inline edit
  const saveEdit = async (m: any) => {
    if (isDemo) {
      const price = editPrice ? parseFloat(editPrice) : undefined;
      const qty = editQty ? parseFloat(editQty) : undefined;
      const waste = editWaste ? 1 + parseFloat(editWaste) / 100 : undefined;
      const cost = price && qty ? qty * price : undefined;
      setDemoMaterials(p => p.map(i => i._id === m._id ? { ...i, unitPrice: price ?? i.unitPrice, quantity: qty ?? i.quantity, wasteFactor: waste ?? i.wasteFactor, totalCost: cost ?? i.totalCost } : i));
      setEditingId(null); return;
    }
    const price = editPrice ? parseFloat(editPrice) : undefined;
    const qty = editQty ? parseFloat(editQty) : undefined;
    const waste = editWaste ? 1 + parseFloat(editWaste) / 100 : undefined;
    const cost = price && qty ? qty * price : undefined;
    await updateMaterial({
      materialId: m._id,
      unitPrice: price,
      quantity: qty,
      wasteFactor: waste,
      totalCost: cost,
    });
    if (price && userId) {
      await upsertPrice({
        userId,
        materialName: m.name,
        unit: m.unit,
        unitPrice: price,
      });
    }
    setEditingId(null);
  };

  // Add a material from template
  const handleAddMaterial = async (template: MaterialTemplate) => {
    if (isDemo || !isValidConvexId || !userId) return;
    const qty = calculateMaterialQuantity(template, totalSF, lineItems as any);
    const userPriceMap: Record<string, number> = {};
    for (const p of (userPrices ?? [])) {
      userPriceMap[(p as any).materialName] = (p as any).unitPrice;
    }
    const price = userPriceMap[template.name] ?? template.defaultUnitPrice;
    await addMaterial({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      templateKey: template.key,
      category: template.category,
      name: template.name,
      unit: template.unit,
      calcType: template.calcType,
      quantity: qty ?? undefined,
      unitPrice: price,
      totalCost: qty && price ? qty * price : undefined,
      wasteFactor: template.wasteFactor,
      coverage: template.defaultCoverage,
      qtyPerSf: template.defaultQtyPerSf,
      takeoffItemType: template.takeoffItemType,
    });
    setShowAddModal(false);
  };

  // Add a material from the datasheet library
  const handleAddFromDatasheet = async (ds: any) => {
    if (isDemo || !isValidConvexId || !userId) return;
    const category = datasheetCategoryToMaterial(ds.category);
    const calcType = ds.coverage ? "coverage" : "fixed";
    await addMaterial({
      projectId: projectId as Id<"bidshield_projects">,
      userId,
      category,
      name: ds.productName,
      unit: ds.unit,
      calcType,
      unitPrice: ds.unitPrice,
      coverage: ds.coverage,
      wasteFactor: 1.05,
      totalCost: undefined,
      quantity: undefined,
    });
    setShowAddModal(false);
  };

  // If no materials and not demo, show setup screen
  if (!isDemo && materials.length === 0 && projectMaterials !== undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--bs-bg-elevated)" }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--bs-text-primary)" }}>No materials yet</h3>
        <p className="text-sm text-center max-w-md" style={{ color: "var(--bs-text-muted)" }}>
          Upload your estimating report PDF to auto-populate, or generate a material list from your project&apos;s system type ({project?.systemType?.toUpperCase() || "TPO"}).
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
            style={{ background: "var(--bs-teal)", color: "#13151a" }}
          >
            Upload Report PDF
          </button>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-secondary)", border: "1px solid var(--bs-border)" }}
          >
            {isInitializing ? "Generating..." : "Generate from Template"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--bs-text-dim)" }}>You can add or remove items after either option</p>
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section subtitle */}
      <p className="text-sm -mb-1" style={{ color: "var(--bs-text-muted)" }}>
        Reconcile your estimating report against vendor quotes — verify pricing, coverage, and waste factors before submission.
      </p>

      {/* Extracted from badge */}
      {extractedFrom && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", color: "var(--bs-teal)" }}>
          <span>Extracted from <span className="font-semibold">{extractedFrom}</span> — review and adjust quantities as needed</span>
          <button onClick={() => setExtractedFrom(null)} className="ml-auto" style={{ color: "var(--bs-teal)" }}>×</button>
        </div>
      )}

      {/* Summary alert banner — only shown when issues exist */}
      {totalIssues > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)" }}>
          <button
            onClick={() => setAlertExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--bs-amber)" }}>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-amber)"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              {verificationIssues.pricingGaps.length > 0 && `${verificationIssues.pricingGaps.length} pricing gap${verificationIssues.pricingGaps.length !== 1 ? "s" : ""}`}
              {verificationIssues.pricingGaps.length > 0 && verificationIssues.coverageIssues.length > 0 && " · "}
              {verificationIssues.coverageIssues.length > 0 && `${verificationIssues.coverageIssues.length} coverage issue${verificationIssues.coverageIssues.length !== 1 ? "s" : ""}`}
              {(verificationIssues.pricingGaps.length > 0 || verificationIssues.coverageIssues.length > 0) && verificationIssues.wasteIssues.length > 0 && " · "}
              {verificationIssues.wasteIssues.length > 0 && `${verificationIssues.wasteIssues.length} missing waste`}
              {" — review before submitting"}
            </span>
            <svg className={`w-4 h-4 transition-transform ${alertExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-amber)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {alertExpanded && (
            <div className="px-4 pb-4 grid sm:grid-cols-3 gap-4 pt-3" style={{ borderTop: "1px solid var(--bs-amber-border)" }}>
              {verificationIssues.pricingGaps.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--bs-amber)" }}>No quote match ({verificationIssues.pricingGaps.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.pricingGaps.map(n => (
                      <li key={n} className="text-xs truncate" style={{ color: "var(--bs-amber)" }}>• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {verificationIssues.coverageIssues.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--bs-amber)" }}>Missing coverage ({verificationIssues.coverageIssues.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.coverageIssues.map(n => (
                      <li key={n} className="text-xs truncate" style={{ color: "var(--bs-amber)" }}>• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {verificationIssues.wasteIssues.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--bs-amber)" }}>0% waste (required) ({verificationIssues.wasteIssues.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.wasteIssues.map(n => (
                      <li key={n} className="text-xs truncate" style={{ color: "var(--bs-amber)" }}>• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* System badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Materials for</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-primary)", border: "1px solid var(--bs-border)" }}>{project?.primaryAssembly || project?.systemType?.toUpperCase() || "TPO"}</span>
        <span className="text-xs ml-auto" style={{ color: "var(--bs-text-dim)" }}>{totalSF.toLocaleString()} SF</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Cost", value: `$${totalCost.toLocaleString()}`, valueColor: "var(--bs-teal)" },
          { label: "Line Items", value: String(materials.length), valueColor: "var(--bs-blue)" },
          { label: "Mat / SF", value: dollarPerSf > 0 ? `$${dollarPerSf.toFixed(2)}` : "—", valueColor: "var(--bs-text-primary)" },
          {
            label: unpricedCount > 0 ? "Unpriced Items" : "All Priced",
            value: unpricedCount > 0 ? String(unpricedCount) : "0",
            valueColor: unpricedCount > 0 ? "var(--bs-amber)" : "var(--bs-teal)",
          },
        ].map(({ label, value, valueColor }) => (
          <div key={label} style={{ background: "var(--bs-bg-card)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--bs-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: valueColor, letterSpacing: "-0.3px", lineHeight: 1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown bar */}
      {totalCost > 0 && (
        <div className="rounded-xl p-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 style={{ fontSize: 12, fontWeight: 500, color: "var(--bs-text-secondary)" }}>Cost Breakdown by Category</h3>
            <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>Based on {totalSF.toLocaleString()} SF</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            {(Object.entries(categoryTotals) as [string, number][])
              .filter(([_, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, val]) => {
                const pct = (val / totalCost) * 100;
                const barColors: Record<string, string> = {
                  membrane: "var(--bs-blue)",
                  insulation: "var(--bs-amber)",
                  fasteners: "var(--bs-text-dim)",
                  adhesive: "#a78bfa",
                  sheet_metal: "#71717a",
                  lumber: "#fb923c",
                  accessories: "var(--bs-red)",
                  miscellaneous: "var(--bs-text-dim)",
                };
                return (
                  <div key={cat} style={{ width: `${pct}%`, background: barColors[cat] || "var(--bs-text-dim)", transition: "width 0.3s" }} title={`${MATERIAL_CATEGORIES[cat as MaterialCategory]?.label}: $${val.toLocaleString()} (${pct.toFixed(0)}%)`} />
                );
              })}
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(categoryTotals) as [string, number][])
              .filter(([_, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, val]) => {
                const legendColors: Record<string, string> = {
                  membrane: "var(--bs-blue)",
                  insulation: "var(--bs-amber)",
                  fasteners: "var(--bs-text-dim)",
                  adhesive: "#a78bfa",
                  sheet_metal: "#71717a",
                  lumber: "#fb923c",
                  accessories: "var(--bs-red)",
                  miscellaneous: "var(--bs-text-dim)",
                };
                return (
                  <span key={cat} className="text-xs" style={{ color: legendColors[cat] || "var(--bs-text-muted)" }}>
                    {MATERIAL_CATEGORIES[cat as MaterialCategory]?.icon} {MATERIAL_CATEGORIES[cat as MaterialCategory]?.label}: ${val.toLocaleString()}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          {(["all", ...Object.keys(MATERIAL_CATEGORIES)] as (MaterialCategory | "all")[]).map((key) => {
            const isAll = key === "all";
            const cat = isAll ? null : MATERIAL_CATEGORIES[key as MaterialCategory];
            const isActive = filterCategory === key;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  background: isActive ? "var(--bs-teal-dim)" : "transparent",
                  color: isActive ? "var(--bs-teal)" : "var(--bs-text-muted)",
                  border: isActive ? "1px solid var(--bs-teal-border)" : "1px solid transparent",
                }}
              >
                {isAll ? "All" : <>{cat?.icon} <span className="hidden md:inline">{cat?.label}</span></>}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 ml-auto">
          {!isDemo && quotes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--bs-text-muted)" }}>vs. Quote:</span>
              <select
                value={selectedQuoteId ?? "__no_compare__"}
                onChange={e => {
                  const v = e.target.value;
                  setSelectedQuoteId(v === "__no_compare__" ? null : v);
                }}
                className="text-xs rounded-lg px-2 py-1.5 focus:outline-none bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-secondary)]"
              >
                <option value="__best_match__">Best match (all quotes)</option>
                {quotes.map((q: any) => (
                  <option key={q._id} value={q._id}>
                    {q.vendorName}{q.quoteDate ? ` — ${new Date(q.quoteDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                  </option>
                ))}
                <option value="__no_compare__">No comparison</option>
              </select>
            </div>
          )}
          {!isDemo && (
            <>
              <button
                onClick={handleFixCategories}
                disabled={isFixingCategories || !isValidConvexId}
                title="Auto-correct miscategorized materials (edge metal → Sheet Metal, lumber out of Accessories, etc.)"
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
              >
                {isFixingCategories ? "Fixing..." : "Fix Categories"}
              </button>
              <button
                onClick={handleRecalculate}
                disabled={totalSF === 0}
                title={totalSF === 0 ? "Enter SF in Takeoff tab first" : "Recalculate quantities from takeoff"}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--bs-blue-dim)", color: "var(--bs-blue)", border: "1px solid var(--bs-blue-border)" }}
              >
                Recalculate
              </button>
            </>
          )}
          {/* Upload Report PDF */}
          {(isPro || isDemo) ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}
              >
                {isUploading ? "Extracting..." : "Upload Report PDF"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); e.target.value = ""; }}
              />
            </>
          ) : (
            <a href="/bidshield/pricing" className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}>
              <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Upload PDF · Pro
            </a>
          )}
          {/* Add Material */}
          {(isPro || isDemo) ? (
            <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
              + Add Material
            </button>
          ) : (
            <a href="/bidshield/pricing" className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)", border: "1px solid var(--bs-border)" }}>
              <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Add Material · Pro
            </a>
          )}
        </div>
      </div>

      {/* PDF upload error banner */}
      {uploadError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)" }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-red)"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <span className="flex-1">{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="font-medium text-xs shrink-0" style={{ color: "var(--bs-red)" }}>Dismiss</button>
        </div>
      )}

      {/* No SF hint */}
      {!isDemo && totalSF === 0 && materials.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "var(--bs-blue-dim)", border: "1px solid var(--bs-blue-border)", color: "var(--bs-blue)" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-blue)"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
          <span>Enter SF in the <button onClick={() => onNavigateTab?.("takeoff")} className="font-semibold underline" style={{ color: "var(--bs-blue)" }}>Takeoff tab</button> to auto-calculate quantities</span>
        </div>
      )}

      {/* Material Table — single table, one header row, flat tbody */}
      {filteredMaterials.length > 0 && (() => {
        const colCount = isComparing ? 9 : 7;
        const selectedQuote = quotes.find((q: any) => q._id === selectedQuoteId);
        return (
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs" style={{ color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
                    <th className="text-left px-5 py-2.5 font-medium">Material</th>
                    <th className="text-center px-3 py-2.5 font-medium w-14">Unit</th>
                    <th className="text-right px-3 py-2.5 font-medium w-16">Qty</th>
                    <th className="text-center px-3 py-2.5 font-medium w-20">Waste</th>
                    <th className="text-right px-3 py-2.5 font-medium w-28">{isComparing ? "Your Price" : "Unit Price"}</th>
                    {isComparing && <th className="text-right px-3 py-2.5 font-medium w-28">Quote Price</th>}
                    {isComparing && <th className="text-right px-3 py-2.5 font-medium w-24">Diff</th>}
                    <th className="text-right px-5 py-2.5 font-medium w-28">Total</th>
                    <th className="text-center px-3 py-2.5 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                {Object.entries(grouped).map(([cat, items]) => {
                  const catInfo = MATERIAL_CATEGORIES[cat as MaterialCategory];
                  const catTotal = (items as any[]).reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
                  const noCategoryQuote = isComparing && categoryHasQuote[cat] === false && catTotal > 5000;
                  return (
                    <React.Fragment key={cat}>
                      {/* Category warning */}
                      {noCategoryQuote && (
                        <tr>
                          <td colSpan={colCount} className="px-5 py-2" style={{ background: "var(--bs-amber-dim)", borderBottom: "1px solid var(--bs-amber-border)" }}>
                            <span className="text-xs font-medium inline-flex items-center gap-1" style={{ color: "var(--bs-amber)" }}>
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-amber)"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                              No vendor quote for {catInfo?.label} — pricing may be estimated, not quoted
                            </span>
                          </td>
                        </tr>
                      )}
                      {/* Category group header */}
                      <tr style={{ background: "var(--bs-bg-elevated)", borderTop: "1px solid var(--bs-border)" }}>
                        <td colSpan={colCount} className="px-5 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{catInfo?.icon}</span>
                              <h3 className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{catInfo?.label}</h3>
                              <span className="text-xs" style={{ color: "var(--bs-text-dim)" }}>({(items as any[]).length} items)</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: "var(--bs-teal)" }}>${catTotal.toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                      {/* Material rows */}
                      {(items as any[]).map((m: any) => {
                        const isEditing = editingId === m._id;
                        const isChecking = checkRowId === m._id;
                        const quoteMatch = !isComparing ? null
                          : isBestMatch ? findBestMatchAcrossAllQuotes(m.name, quotes)
                          : findBestQuoteMatch(m.name, selectedQuoteLineItems);
                        return (
                          <tr
                            key={m._id}
                            style={{ borderBottom: "1px solid var(--bs-border)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "")}
                          >
                            {/* Material name + coverage */}
                            <td className="px-5 py-2.5">
                              <div style={{ color: "var(--bs-text-secondary)" }}>{m.name}</div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {m.calcType === "linear_from_takeoff" && <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>From takeoff (linear)</span>}
                                {m.calcType === "count_from_takeoff" && <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>From takeoff (count)</span>}
                                {m.calcType === "coverage" && !m.coverageRate && <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>{m.coverage} SF/unit</span>}
                                <CoverageFlag material={m} onLookup={handleCoverageLookup} lookupResults={coverageLookups} />
                              </div>
                            </td>
                            {/* Unit */}
                            <td className="text-center px-3 py-2.5 text-xs" style={{ color: "var(--bs-text-dim)" }}>{m.unit}</td>
                            {/* Qty */}
                            <td className="text-right px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-16 text-right text-xs rounded px-2 py-1 bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]" />
                              ) : (
                                <span className="text-xs" style={{ color: m.quantity ? "var(--bs-text-primary)" : "var(--bs-text-dim)" }}>{m.quantity ?? "—"}</span>
                              )}
                            </td>
                            {/* Waste + flag */}
                            <td className="text-center px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editWaste} onChange={(e) => setEditWaste(e.target.value)} className="w-12 text-center text-xs rounded px-1 py-1 bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]" />
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>{((m.wasteFactor - 1) * 100).toFixed(0)}%</span>
                                  <WasteFlag material={m} />
                                </div>
                              )}
                            </td>
                            {/* Your Price */}
                            <td className="text-right px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-20 text-right text-xs rounded px-2 py-1 bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]" step="0.01" />
                              ) : (
                                <span className="text-xs" style={{ color: m.unitPrice ? "var(--bs-text-secondary)" : "var(--bs-amber)" }}>
                                  {m.unitPrice ? `$${m.unitPrice.toFixed(2)}` : "No price"}
                                </span>
                              )}
                            </td>
                            {/* Quote Price (conditional) */}
                            {isComparing && (
                              <td className="text-right px-3 py-2.5 text-xs">
                                {quoteMatch ? (
                                  (() => {
                                    const diffPct = quoteMatch.item.p > 0 ? Math.abs(((m.unitPrice ?? 0) - quoteMatch.item.p) / quoteMatch.item.p * 100) : 0;
                                    const sourceName = isBestMatch ? (quoteMatch as any).quoteName : null;
                                    return (
                                      <div>
                                        <span className="font-medium" style={{ color: diffPct < 3 ? "var(--bs-teal)" : "var(--bs-amber)" }}>
                                          ${quoteMatch.item.p.toFixed(2)}
                                        </span>
                                        {sourceName && <div className="text-[10px] leading-tight" style={{ color: "var(--bs-text-dim)" }}>{sourceName}</div>}
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span style={{ color: "var(--bs-text-dim)" }}>—</span>
                                )}
                              </td>
                            )}
                            {/* Diff (conditional) */}
                            {isComparing && (
                              <td className="text-right px-3 py-2.5 text-xs">
                                {quoteMatch ? (
                                  (() => {
                                    const diff = (m.unitPrice ?? 0) - quoteMatch.item.p;
                                    const diffPct = quoteMatch.item.p > 0 ? Math.abs(diff / quoteMatch.item.p * 100) : 0;
                                    if (diffPct < 3) return <span style={{ color: "var(--bs-text-dim)" }}>—</span>;
                                    return (
                                      <span className="font-medium" style={{ color: diff > 0 ? "var(--bs-amber)" : "var(--bs-teal)" }}>
                                        {diff > 0 ? "+" : ""}${diff.toFixed(2)}
                                      </span>
                                    );
                                  })()
                                ) : (
                                  <span style={{ color: "var(--bs-text-dim)" }}>—</span>
                                )}
                              </td>
                            )}
                            {/* Total */}
                            <td className="text-right px-5 py-2.5 text-xs font-medium">
                              <span style={{ color: m.totalCost ? "var(--bs-teal)" : "var(--bs-text-dim)" }}>
                                {m.totalCost ? `$${m.totalCost.toLocaleString()}` : "—"}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="text-center px-3 py-2.5">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <button onClick={() => saveEdit(m)} className="text-xs" style={{ color: "var(--bs-teal)" }}>Save</button>
                                  <button onClick={() => setEditingId(null)} className="text-xs" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-1 items-center">
                                  <button
                                    onClick={() => setCheckRowId(isChecking ? null : m._id)}
                                    className="text-xs transition-colors"
                                    style={{ color: isChecking ? "var(--bs-blue)" : "var(--bs-text-dim)" }}
                                    onMouseEnter={e => { if (!isChecking) e.currentTarget.style.color = "var(--bs-blue)"; }}
                                    onMouseLeave={e => { if (!isChecking) e.currentTarget.style.color = "var(--bs-text-dim)"; }}
                                    title="Check against quote"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
                                  </button>
                                  {(isPro || isDemo) ? (
                                    <>
                                      <button
                                        onClick={() => startEdit(m)}
                                        className="text-xs"
                                        style={{ color: "var(--bs-text-muted)" }}
                                        onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-text-primary)")}
                                        onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-muted)")}
                                      >Edit</button>
                                      {!isDemo && (
                                        <button
                                          onClick={() => deleteMaterial({ materialId: m._id })}
                                          className="text-xs"
                                          style={{ color: "var(--bs-text-dim)" }}
                                          onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                                          onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}
                                        >×</button>
                                      )}
                                    </>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Quote comparison detail row */}
                      {checkRowId && isComparing && (() => {
                        const m = (items as any[]).find((x: any) => x._id === checkRowId);
                        if (!m) return null;
                        const match = isBestMatch
                          ? findBestMatchAcrossAllQuotes(m.name, quotes)
                          : findBestQuoteMatch(m.name, selectedQuoteLineItems);
                        const matchVendor = isBestMatch
                          ? (match as any)?.quoteName
                          : selectedQuote?.vendorName;
                        const matchQuote = isBestMatch
                          ? quotes.find((q: any) => q.vendorName === (match as any)?.quoteName)
                          : selectedQuote;
                        const stale = matchQuote?.quoteDate && isStaleQuote(matchQuote.quoteDate);
                        const priceDiff = match ? (m.unitPrice ?? 0) - match.item.p : 0;
                        const priceDiffPct = match && match.item.p ? Math.abs(priceDiff / match.item.p * 100) : 0;
                        return (
                          <tr>
                            <td colSpan={colCount} className="px-5 py-3" style={{ background: "var(--bs-blue-dim)", borderBottom: "1px solid var(--bs-blue-border)" }}>
                              {match ? (
                                <div className="flex flex-wrap gap-5 items-start text-xs">
                                  <div>
                                    <div className="mb-0.5" style={{ color: "var(--bs-text-dim)" }}>Matched in quote</div>
                                    <div className="font-medium" style={{ color: "var(--bs-text-primary)" }}>{match.item.m}</div>
                                    {matchVendor && <div style={{ color: "var(--bs-text-muted)" }}>{matchVendor}</div>}
                                  </div>
                                  <div>
                                    <div className="mb-0.5" style={{ color: "var(--bs-text-dim)" }}>Quote price</div>
                                    <div className="font-medium" style={{ color: "var(--bs-teal)" }}>${match.item.p.toFixed(2)} / {match.item.u}</div>
                                    {priceDiffPct >= 3 && (
                                      <div className="mt-0.5 font-medium" style={{ color: priceDiff > 0 ? "var(--bs-amber)" : "var(--bs-teal)" }}>
                                        Estimate is {priceDiff > 0 ? "+" : ""}${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct.toFixed(0)}% {priceDiff > 0 ? "higher" : "lower"})
                                      </div>
                                    )}
                                    {priceDiffPct < 3 && (m.unitPrice ?? 0) > 0 && <div className="mt-0.5" style={{ color: "var(--bs-text-dim)" }}>Prices match</div>}
                                  </div>
                                  <div>
                                    <div className="mb-0.5" style={{ color: "var(--bs-text-dim)" }}>Confidence</div>
                                    <div className="font-medium" style={{ color: "var(--bs-text-primary)" }}>{match.confidence.toFixed(0)}%</div>
                                  </div>
                                  <div>
                                    <div className="mb-0.5" style={{ color: "var(--bs-text-dim)" }}>Quote date</div>
                                    <div className="font-medium" style={{ color: stale ? "var(--bs-amber)" : "var(--bs-text-primary)" }}>
                                      {matchQuote?.quoteDate
                                        ? new Date(matchQuote.quoteDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                        : "No date on file"}
                                      {stale && " — >90 days"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs" style={{ color: "var(--bs-text-muted)" }}>
                                  {isBestMatch
                                    ? "No match found across any uploaded quotes (below 70% confidence or conflicting product identifiers)."
                                    : "No match found in the selected quote (below 70% confidence or conflicting product identifiers)."}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })()}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {filteredMaterials.length === 0 && materials.length > 0 && (
        <div className="text-center py-10" style={{ color: "var(--bs-text-muted)" }}>No materials in this category</div>
      )}

      {/* Extraction Preview Modal */}
      {previewItems && (
        <ExtractionPreviewModal
          items={previewItems}
          filename={previewFilename}
          isSaving={isSavingExtraction}
          replaceError={replaceError}
          onReplace={handleReplaceAll}
          onCancel={() => { setPreviewItems(null); setPreviewFilename(""); setReplaceError(null); }}
        />
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <AddMaterialModal
          systemType={project?.systemType}
          existingKeys={materials.map((m: any) => m.templateKey).filter(Boolean)}
          onAdd={handleAddMaterial}
          onAddFromDatasheet={handleAddFromDatasheet}
          onClose={() => setShowAddModal(false)}
          datasheets={ds}
        />
      )}
    </div>
  );
}

// ── PDF Extraction Preview Modal ─────────────────────────────────────────────
function ExtractionPreviewModal({
  items,
  filename,
  isSaving,
  replaceError,
  onReplace,
  onCancel,
}: {
  items: any[];
  filename: string;
  isSaving: boolean;
  replaceError?: string | null;
  onReplace: () => void;
  onCancel: () => void;
}) {
  const CATEGORY_MAP: Record<string, string> = {
    "Membrane": "membrane", "Insulation": "insulation",
    "Fasteners & Plates": "fasteners", "Adhesive & Sealant": "adhesive",
    "Edge Metal": "edge_metal", "Accessories": "accessories",
    "Tear-Off": "accessories", "Lumber": "accessories",
    "Metal Work": "edge_metal", "General": "accessories",
  };
  const CAT_LABELS: Record<string, string> = {
    "membrane": "Membrane", "insulation": "Insulation",
    "fasteners": "Fasteners & Plates", "adhesive": "Adhesive & Sealant",
    "edge_metal": "Edge Metal", "accessories": "Accessories",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        {/* Header */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-medium" style={{ color: "var(--bs-text-primary)" }}>
                {items.length} items extracted from report
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{filename}</p>
            </div>
            <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: "var(--bs-teal)", background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
              AI extracted
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--bs-text-muted)" }}>
            Review the extracted line items below. Clicking <strong style={{ color: "var(--bs-text-secondary)" }}>Replace all materials</strong> will clear your existing list and save these items.
          </p>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
              <tr style={{ color: "var(--bs-text-dim)" }}>
                <th className="text-left px-4 py-2 font-medium">Material</th>
                <th className="text-left px-3 py-2 font-medium w-28">Category</th>
                <th className="text-center px-2 py-2 font-medium w-12">Unit</th>
                <th className="text-right px-2 py-2 font-medium w-14">Qty</th>
                <th className="text-center px-2 py-2 font-medium w-14">Waste</th>
                <th className="text-right px-3 py-2 font-medium w-20">Unit Price</th>
                <th className="text-right px-4 py-2 font-medium w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const cat = CATEGORY_MAP[item.category] ?? "accessories";
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--bs-border)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <td className="px-4 py-2">
                      <div className="font-medium leading-snug" style={{ color: "var(--bs-text-secondary)" }}>{item.materialName}</div>
                      {item.coverageRate && (
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-teal)" }}>Coverage: {item.coverageRate}</div>
                      )}
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--bs-text-muted)" }}>{CAT_LABELS[cat] ?? item.category}</td>
                    <td className="px-2 py-2 text-center" style={{ color: "var(--bs-text-muted)" }}>{item.unit}</td>
                    <td className="px-2 py-2 text-right" style={{ color: "var(--bs-text-secondary)" }}>{item.quantity ?? "—"}</td>
                    <td className="px-2 py-2 text-center">
                      {item.wastePct > 0
                        ? <span className="font-medium" style={{ color: "var(--bs-teal)" }}>{item.wastePct}%</span>
                        : <span style={{ color: "var(--bs-amber)" }}>0%</span>
                      }
                    </td>
                    <td className="px-3 py-2 text-right" style={{ color: "var(--bs-text-secondary)" }}>
                      {item.unitPrice ? `$${Number(item.unitPrice).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium" style={{ color: "var(--bs-teal)" }}>
                      {item.extendedTotal ? `$${Number(item.extendedTotal).toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 flex flex-col gap-3 rounded-b-2xl" style={{ borderTop: "1px solid var(--bs-border)", background: "var(--bs-bg-elevated)" }}>
          {replaceError && (
            <p className="text-xs font-medium rounded-lg px-3 py-2" style={{ color: "var(--bs-red)", background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>
              {replaceError}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "var(--bs-text-muted)" }}>
            This will <strong style={{ color: "var(--bs-text-secondary)" }}>replace</strong> your current materials list.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ color: "var(--bs-text-muted)", background: "transparent", border: "1px solid var(--bs-border)" }}
            >
              Cancel
            </button>
            <button
              onClick={onReplace}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              style={{ background: "var(--bs-teal)", color: "#13151a" }}
            >
              {isSaving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Saving...
                </>
              ) : "Replace all materials"}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMaterialModal({
  systemType,
  existingKeys,
  onAdd,
  onAddFromDatasheet,
  onClose,
  datasheets,
}: {
  systemType?: string;
  existingKeys: string[];
  onAdd: (t: MaterialTemplate) => void;
  onAddFromDatasheet: (ds: any) => void;
  onClose: () => void;
  datasheets: any[];
}) {
  const [activeTab, setActiveTab] = useState<"templates" | "library">("templates");
  const [search, setSearch] = useState("");

  // Templates tab
  const templates = getTemplatesForSystem(systemType);
  const available = templates.filter((t) => !existingKeys.includes(t.key));
  const filteredTemplates = search
    ? available.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.includes(search.toLowerCase()))
    : available;
  const groupedTemplates: Record<string, MaterialTemplate[]> = {};
  for (const t of filteredTemplates) {
    if (!groupedTemplates[t.category]) groupedTemplates[t.category] = [];
    groupedTemplates[t.category].push(t);
  }

  // Library tab
  const filteredLibrary = search
    ? datasheets.filter((d: any) => d.productName.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()))
    : datasheets;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--bs-border)" }}>
          <h3 className="text-base font-medium" style={{ color: "var(--bs-text-primary)" }}>Add Material</h3>
          <button
            onClick={onClose}
            className="text-xl"
            style={{ color: "var(--bs-text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-muted)")}
          >&times;</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-5 pt-3 pb-1">
          {(["templates", "library"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: activeTab === tab ? "var(--bs-teal-dim)" : "transparent",
                color: activeTab === tab ? "var(--bs-teal)" : "var(--bs-text-muted)",
                border: activeTab === tab ? "1px solid var(--bs-teal-border)" : "1px solid transparent",
              }}
            >
              {tab === "templates" ? "System Templates" : `Price Library (${datasheets.length})`}
            </button>
          ))}
        </div>

        <div className="px-5 py-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {activeTab === "templates" ? (
            Object.entries(groupedTemplates).length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--bs-text-muted)" }}>All templates for this system type are already added</p>
            ) : (
              Object.entries(groupedTemplates).map(([cat, temps]) => (
                <div key={cat} className="mb-4">
                  <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)", letterSpacing: "0.8px" }}>
                    {MATERIAL_CATEGORIES[cat as MaterialCategory]?.label || cat}
                  </div>
                  <div className="space-y-1">
                    {temps.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => onAdd(t)}
                        className="w-full text-left px-3 py-2.5 rounded-lg transition-colors"
                        style={{ border: "1px solid var(--bs-border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <div className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{t.name}</div>
                        <div className="text-xs" style={{ color: "var(--bs-text-dim)" }}>{t.unit} · {t.calcType}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )
          ) : (
            filteredLibrary.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--bs-text-muted)" }}>No products in library yet. Add them from your vendor quotes.</p>
            ) : (
              <div className="space-y-1">
                {filteredLibrary.map((d: any) => (
                  <button
                    key={d._id}
                    onClick={() => onAddFromDatasheet(d)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-colors"
                    style={{ border: "1px solid var(--bs-border)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <div className="flex justify-between">
                      <div className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{d.productName}</div>
                      <div className="text-sm font-medium" style={{ color: "var(--bs-teal)" }}>${d.unitPrice.toFixed(2)}/{d.unit}</div>
                    </div>
                    <div className="text-xs" style={{ color: "var(--bs-text-dim)" }}>{d.category}{d.vendorName ? ` · ${d.vendorName}` : ""}{d.coverage ? ` · ${d.coverage} SF/unit` : ""}</div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
