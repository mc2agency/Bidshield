"use client";
import { DEMO_MATERIALS as IMPORTED_MATERIALS } from "@/lib/bidshield/demo-data";

import React, { useState, useMemo, useCallback, useRef } from "react";
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
  { _id: "dm_8", templateKey: "drip-edge", category: "edge_metal", name: "Drip Edge (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 84, unitPrice: 18, totalCost: 1512, wasteFactor: 1.05 },
  { _id: "dm_9", templateKey: "coping-cap", category: "edge_metal", name: "Coping Cap (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 42, unitPrice: 42, totalCost: 1764, wasteFactor: 1.05 },
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
let _quoteMatchLogCount = 0;
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

  // Debug: log top matches for first 5 materials processed
  if (_quoteMatchLogCount < 5 && lineItems.length > 0) {
    _quoteMatchLogCount++;
    console.log(
      `[QuoteMatch] "${materialName}" → ${best ? `"${best.item.m}" (${best.confidence.toFixed(0)}% confidence, $${best.item.p})` : "NO MATCH"}`
    );
  }

  return best && best.confidence >= 70 ? best : null;
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
    "Sheet Metal": "edge_metal",
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
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
        — No match
      </span>
    );
  }
  const priceDiff = (material.unitPrice ?? 0) - match.item.p;
  const priceDiffPct = match.item.p > 0 ? Math.abs(priceDiff / match.item.p * 100) : 0;
  if (priceDiffPct < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded" title={`Quote: $${match.item.p.toFixed(2)}`}>
        ✓ Quoted
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded cursor-help"
      title={`Quote price: $${match.item.p.toFixed(2)} — ${priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(2)} difference`}
    >
      ⚠ Quote: ${match.item.p.toFixed(2)}
    </span>
  );
}

// ── Waste flag ───────────────────────────────────────────────────────────────
function WasteFlag({ material }: { material: any }) {
  if (!WASTE_REQUIRED_CATS.has(material.category)) return null;
  const wastePct = (material.wasteFactor - 1) * 100;
  if (wastePct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600" title="Waste factor applied">
        ✓
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600" title="Waste factor required for this category">
      ⚠ 0%
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
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded" title="AI-estimated coverage rate — verify against spec sheet">
        ✨ {coverageRate} (AI — verify)
      </span>
    );
  }

  // If coverage present and verified/from report
  if (coverageRate) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500" title="Coverage rate on file">
        {coverageRate}
      </span>
    );
  }

  // Not present — show lookup option or result
  if (lookup?.loading) {
    return <span className="text-[10px] text-slate-400">Looking up...</span>;
  }
  if (lookup && lookup.coverageRate) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded" title="AI-estimated coverage rate — verify against spec sheet">
        ✨ {lookup.coverageRate} (AI — verify)
      </span>
    );
  }
  if (lookup && !lookup.coverageRate) {
    return <span className="text-[10px] text-amber-600">⚠ Coverage unknown</span>;
  }

  // No coverage, no lookup yet — only show for coverage-type materials
  if (material.calcType === "coverage") {
    return (
      <button
        onClick={() => onLookup(material._id, material.name)}
        className="text-[10px] text-amber-600 hover:text-amber-800 underline underline-offset-2"
        title="Look up standard coverage rate with AI"
      >
        ⚠ No coverage — look up
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
  const [extractedFrom, setExtractedFrom] = useState<string | null>(null);
  const [alertExpanded, setAlertExpanded] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[] | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string>("");
  const [isSavingExtraction, setIsSavingExtraction] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
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
          console.error("Extraction failed:", err);
          setIsUploading(false);
          return;
        }

        const data = await res.json();
        if (!data.items?.length) { setIsUploading(false); return; }

        // Show preview modal — don't save yet
        setPreviewItems(data.items);
        setPreviewFilename(file.name);
      } catch (err) {
        console.error("PDF upload error:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => { setIsUploading(false); };
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
        const sanitizedItems = previewItems.map((item: any) => ({
          materialName: item.materialName ?? "",
          category: item.category ?? "General",
          unit: item.unit ?? "EA",
          quantity: item.quantity ?? 0,
          coverageRate: item.coverageRate ?? undefined,
          wastePct: item.wastePct ?? 0,
          unitPrice: item.unitPrice ?? 0,
          extendedTotal: item.extendedTotal ?? 0,
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
        <div className="text-4xl">🧱</div>
        <h3 className="text-lg font-semibold text-slate-900">No materials yet</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          Upload your estimating report PDF to auto-populate, or generate a material list from your project&apos;s system type ({project?.systemType?.toUpperCase() || "TPO"}).
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors text-sm"
          >
            ✨ Upload Report PDF
          </button>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="px-5 py-2.5 bg-emerald-600 text-slate-900 rounded-lg font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50 text-sm"
          >
            {isInitializing ? "Generating..." : "Generate from Template"}
          </button>
        </div>
        <p className="text-xs text-slate-500">You can add or remove items after either option</p>
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section subtitle */}
      <p className="text-sm text-slate-500 -mb-1">
        Verify pricing, coverage, and waste factors against your vendor quotes before submission.
      </p>

      {/* Extracted from badge */}
      {extractedFrom && (
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-medium">
          <span>✨</span>
          <span>Extracted from <span className="font-semibold">{extractedFrom}</span> — review and adjust quantities as needed</span>
          <button onClick={() => setExtractedFrom(null)} className="ml-auto text-teal-400 hover:text-teal-700">×</button>
        </div>
      )}

      {/* Summary alert banner — only shown when issues exist */}
      {totalIssues > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <button
            onClick={() => setAlertExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-amber-800">
              ⚠ {verificationIssues.pricingGaps.length > 0 && `${verificationIssues.pricingGaps.length} pricing gap${verificationIssues.pricingGaps.length !== 1 ? "s" : ""}`}
              {verificationIssues.pricingGaps.length > 0 && verificationIssues.coverageIssues.length > 0 && " · "}
              {verificationIssues.coverageIssues.length > 0 && `${verificationIssues.coverageIssues.length} coverage issue${verificationIssues.coverageIssues.length !== 1 ? "s" : ""}`}
              {(verificationIssues.pricingGaps.length > 0 || verificationIssues.coverageIssues.length > 0) && verificationIssues.wasteIssues.length > 0 && " · "}
              {verificationIssues.wasteIssues.length > 0 && `${verificationIssues.wasteIssues.length} missing waste`}
              {" — review before submitting"}
            </span>
            <svg className={`w-4 h-4 text-amber-600 transition-transform ${alertExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {alertExpanded && (
            <div className="px-4 pb-4 grid sm:grid-cols-3 gap-4 border-t border-amber-100 pt-3">
              {verificationIssues.pricingGaps.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-1.5">No quote match ({verificationIssues.pricingGaps.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.pricingGaps.map(n => (
                      <li key={n} className="text-xs text-amber-700 truncate">• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {verificationIssues.coverageIssues.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-1.5">Missing coverage ({verificationIssues.coverageIssues.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.coverageIssues.map(n => (
                      <li key={n} className="text-xs text-amber-700 truncate">• {n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {verificationIssues.wasteIssues.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-1.5">0% waste (required) ({verificationIssues.wasteIssues.length})</div>
                  <ul className="space-y-0.5">
                    {verificationIssues.wasteIssues.map(n => (
                      <li key={n} className="text-xs text-amber-700 truncate">• {n}</li>
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
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Materials for</span>
        <span className="text-xs font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-lg">{project?.primaryAssembly || project?.systemType?.toUpperCase() || "TPO"}</span>
        <span className="text-xs text-slate-400 ml-auto">{totalSF.toLocaleString()} SF</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <div className="text-2xl font-bold text-emerald-600">${totalCost.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Total Material Cost</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{materials.length}</div>
          <div className="text-[11px] text-slate-500">Line Items</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-600">{dollarPerSf > 0 ? `$${dollarPerSf.toFixed(2)}` : "—"}</div>
          <div className="text-[11px] text-slate-500">Material $/SF</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
          <div className={`text-2xl font-bold ${unpricedCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {unpricedCount > 0 ? `${unpricedCount}` : "✓"}
          </div>
          <div className="text-[11px] text-slate-500">{unpricedCount > 0 ? "Unpriced" : "All Priced"}</div>
        </div>
      </div>

      {/* Category breakdown bar */}
      {totalCost > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Cost Breakdown by Category</h3>
            <span className="text-xs text-slate-500">Based on {totalSF.toLocaleString()} SF</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 mb-3">
            {(Object.entries(categoryTotals) as [string, number][])
              .filter(([_, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, val]) => {
                const pct = (val / totalCost) * 100;
                const colors: Record<string, string> = {
                  membrane: "bg-blue-500",
                  insulation: "bg-amber-500",
                  fasteners: "bg-slate-500",
                  adhesive: "bg-purple-500",
                  edge_metal: "bg-emerald-500",
                  accessories: "bg-red-400",
                };
                return (
                  <div key={cat} className={`${colors[cat] || "bg-slate-200"} transition-all`} style={{ width: `${pct}%` }} title={`${MATERIAL_CATEGORIES[cat as MaterialCategory]?.label}: $${val.toLocaleString()} (${pct.toFixed(0)}%)`} />
                );
              })}
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(categoryTotals) as [string, number][])
              .filter(([_, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, val]) => {
                const colors: Record<string, string> = {
                  membrane: "text-blue-600",
                  insulation: "text-amber-600",
                  fasteners: "text-slate-500",
                  adhesive: "text-violet-600",
                  edge_metal: "text-emerald-600",
                  accessories: "text-red-600",
                };
                return (
                  <span key={cat} className={`text-xs ${colors[cat] || "text-slate-500"}`}>
                    {MATERIAL_CATEGORIES[cat as MaterialCategory]?.icon} {MATERIAL_CATEGORIES[cat as MaterialCategory]?.label}: ${val.toLocaleString()}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterCategory === "all" ? "bg-emerald-600 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
          >
            All
          </button>
          {(Object.entries(MATERIAL_CATEGORIES) as [MaterialCategory, { label: string; icon: string }][]).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterCategory === key ? "bg-emerald-600 text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
            >
              {cat.icon} <span className="hidden md:inline">{cat.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {!isDemo && quotes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">vs. Quote:</span>
              <select
                value={selectedQuoteId ?? "__no_compare__"}
                onChange={e => {
                  _quoteMatchLogCount = 0;
                  const v = e.target.value;
                  setSelectedQuoteId(v === "__no_compare__" ? null : v);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            <button
              onClick={handleRecalculate}
              disabled={totalSF === 0}
              title={totalSF === 0 ? "Enter SF in Takeoff tab first" : "Recalculate quantities from takeoff"}
              className="px-3 py-1.5 bg-blue-600/20 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Recalculate
            </button>
          )}
          {/* Upload Report PDF */}
          {(isPro || isDemo) ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-teal-600/20 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-600/30 transition-colors disabled:opacity-50"
              >
                {isUploading ? "Extracting..." : "✨ Upload Report PDF"}
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
            <a href="/bidshield/pricing" className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
              🔒 Upload PDF · Pro
            </a>
          )}
          {/* Add Material */}
          {(isPro || isDemo) ? (
            <button onClick={() => setShowAddModal(true)} style={{ background: "#10b981" }} className="px-3 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 transition-colors">
              + Add Material
            </button>
          ) : (
            <a href="/bidshield/pricing" className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
              🔒 Add Material · Pro
            </a>
          )}
        </div>
      </div>

      {/* No SF hint */}
      {!isDemo && totalSF === 0 && materials.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
          <span>Enter SF in the <button onClick={() => onNavigateTab?.("takeoff")} className="font-semibold underline">Takeoff tab</button> to auto-calculate quantities</span>
        </div>
      )}

      {/* Material Table — single table, one header row, flat tbody */}
      {filteredMaterials.length > 0 && (() => {
        const colCount = isComparing ? 9 : 7;
        const selectedQuote = quotes.find((q: any) => q._id === selectedQuoteId);
        return (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left px-5 py-2.5 font-semibold">Material</th>
                    <th className="text-center px-3 py-2.5 font-semibold w-14">Unit</th>
                    <th className="text-right px-3 py-2.5 font-semibold w-16">Qty</th>
                    <th className="text-center px-3 py-2.5 font-semibold w-20">Waste</th>
                    <th className="text-right px-3 py-2.5 font-semibold w-28">{isComparing ? "Your Price" : "Unit Price"}</th>
                    {isComparing && <th className="text-right px-3 py-2.5 font-semibold w-28">Quote Price</th>}
                    {isComparing && <th className="text-right px-3 py-2.5 font-semibold w-24">Diff</th>}
                    <th className="text-right px-5 py-2.5 font-semibold w-28">Total</th>
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
                          <td colSpan={colCount} className="px-5 py-2 bg-amber-50 border-b border-amber-200">
                            <span className="text-amber-600 text-xs font-semibold">⚠ No vendor quote for {catInfo?.label} — pricing may be estimated, not quoted</span>
                          </td>
                        </tr>
                      )}
                      {/* Category group header */}
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td colSpan={colCount} className="px-5 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{catInfo?.icon}</span>
                              <h3 className="text-sm font-semibold text-slate-900">{catInfo?.label}</h3>
                              <span className="text-xs text-slate-500">({(items as any[]).length} items)</span>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600">${catTotal.toLocaleString()}</span>
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
                          <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                            {/* Material name + coverage */}
                            <td className="px-5 py-2.5">
                              <div className="text-slate-700">{m.name}</div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {m.calcType === "linear_from_takeoff" && <span className="text-[10px] text-slate-500">From takeoff (linear)</span>}
                                {m.calcType === "count_from_takeoff" && <span className="text-[10px] text-slate-500">From takeoff (count)</span>}
                                {m.calcType === "coverage" && !m.coverageRate && <span className="text-[10px] text-slate-500">{m.coverage} SF/unit</span>}
                                <CoverageFlag material={m} onLookup={handleCoverageLookup} lookupResults={coverageLookups} />
                              </div>
                            </td>
                            {/* Unit */}
                            <td className="text-center px-3 py-2.5 text-slate-500 text-xs">{m.unit}</td>
                            {/* Qty */}
                            <td className="text-right px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-16 bg-white border border-slate-300 text-slate-900 text-right text-xs rounded px-2 py-1" />
                              ) : (
                                <span className={`text-xs ${m.quantity ? "text-slate-900" : "text-slate-400"}`}>{m.quantity ?? "—"}</span>
                              )}
                            </td>
                            {/* Waste + flag */}
                            <td className="text-center px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editWaste} onChange={(e) => setEditWaste(e.target.value)} className="w-12 bg-white border border-slate-300 text-slate-900 text-center text-xs rounded px-1 py-1" />
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-slate-500 text-xs">{((m.wasteFactor - 1) * 100).toFixed(0)}%</span>
                                  <WasteFlag material={m} />
                                </div>
                              )}
                            </td>
                            {/* Your Price */}
                            <td className="text-right px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-20 bg-white border border-slate-300 text-slate-900 text-right text-xs rounded px-2 py-1" step="0.01" />
                              ) : (
                                <span className={`text-xs ${m.unitPrice ? "text-slate-700" : "text-amber-600"}`}>
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
                                        <span className={diffPct < 3 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                                          {diffPct < 3 ? "✓ " : "⚠ "}${quoteMatch.item.p.toFixed(2)}
                                        </span>
                                        {sourceName && <div className="text-slate-400 text-[10px] leading-tight">{sourceName}</div>}
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <span className="text-slate-300">—</span>
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
                                    if (diffPct < 3) return <span className="text-slate-400">—</span>;
                                    return (
                                      <span className={diff > 0 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                                        {diff > 0 ? "+" : ""}${diff.toFixed(2)}
                                      </span>
                                    );
                                  })()
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            )}
                            {/* Total */}
                            <td className="text-right px-5 py-2.5 text-xs font-semibold">
                              <span className={m.totalCost ? "text-emerald-600" : "text-slate-400"}>
                                {m.totalCost ? `$${m.totalCost.toLocaleString()}` : "—"}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="text-center px-3 py-2.5">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <button onClick={() => saveEdit(m)} className="text-emerald-600 hover:text-emerald-700 text-xs">Save</button>
                                  <button onClick={() => setEditingId(null)} className="text-slate-500 text-xs">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex gap-1 items-center">
                                  <button
                                    onClick={() => setCheckRowId(isChecking ? null : m._id)}
                                    className={`text-xs transition-colors ${isChecking ? "text-blue-500" : "text-slate-400 hover:text-blue-500"}`}
                                    title="Check against quote"
                                  >📋</button>
                                  {(isPro || isDemo) ? (
                                    <>
                                      <button onClick={() => startEdit(m)} className="text-slate-500 hover:text-slate-900 text-xs">Edit</button>
                                      {!isDemo && (
                                        <button onClick={() => deleteMaterial({ materialId: m._id })} className="text-red-600/50 hover:text-red-600 text-xs">×</button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-slate-300">🔒</span>
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
                            <td colSpan={colCount} className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                              {match ? (
                                <div className="flex flex-wrap gap-5 items-start text-xs">
                                  <div>
                                    <div className="text-slate-500 mb-0.5">Matched in quote</div>
                                    <div className="font-medium text-slate-800">{match.item.m}</div>
                                    {matchVendor && <div className="text-slate-400">{matchVendor}</div>}
                                  </div>
                                  <div>
                                    <div className="text-slate-500 mb-0.5">Quote price</div>
                                    <div className="font-semibold text-emerald-600">${match.item.p.toFixed(2)} / {match.item.u}</div>
                                    {priceDiffPct >= 3 && (
                                      <div className={`mt-0.5 font-medium ${priceDiff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                                        Estimate is {priceDiff > 0 ? "+" : ""}${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct.toFixed(0)}% {priceDiff > 0 ? "higher" : "lower"})
                                      </div>
                                    )}
                                    {priceDiffPct < 3 && (m.unitPrice ?? 0) > 0 && <div className="mt-0.5 text-slate-400">Prices match ✓</div>}
                                  </div>
                                  <div>
                                    <div className="text-slate-500 mb-0.5">Confidence</div>
                                    <div className="font-medium text-slate-800">{match.confidence.toFixed(0)}%</div>
                                  </div>
                                  <div>
                                    <div className="text-slate-500 mb-0.5">Quote date</div>
                                    <div className={`font-medium ${stale ? "text-amber-600" : "text-slate-800"}`}>
                                      {matchQuote?.quoteDate
                                        ? new Date(matchQuote.quoteDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                        : "No date on file"}
                                      {stale && " ⚠️ >90 days"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500">
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
        <div className="text-center py-10 text-slate-500">No materials in this category</div>
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {items.length} items extracted from report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{filename}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              ✨ AI extracted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Review the extracted line items below. Clicking <strong>Replace all materials</strong> will clear your existing list and save these items.
          </p>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500">
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
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <div className="text-slate-800 font-medium leading-snug">{item.materialName}</div>
                      {item.coverageRate && (
                        <div className="text-[10px] text-teal-600 mt-0.5">Coverage: {item.coverageRate}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{CAT_LABELS[cat] ?? item.category}</td>
                    <td className="px-2 py-2 text-center text-slate-500">{item.unit}</td>
                    <td className="px-2 py-2 text-right text-slate-700">{item.quantity ?? "—"}</td>
                    <td className="px-2 py-2 text-center text-slate-500">
                      {item.wastePct > 0
                        ? <span className="text-emerald-600 font-medium">{item.wastePct}%</span>
                        : <span className="text-amber-500">0%</span>
                      }
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {item.unitPrice ? `$${Number(item.unitPrice).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-emerald-600">
                      {item.extendedTotal ? `$${Number(item.extendedTotal).toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col gap-3 bg-slate-50 rounded-b-2xl">
          {replaceError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {replaceError}
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            This will <strong>replace</strong> your current materials list.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onReplace}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Add Material</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-xl">&times;</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-5 pt-3 pb-1">
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === "templates" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            System Templates
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === "library" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            Price Library ({datasheets.length})
          </button>
        </div>

        <div className="px-5 py-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {activeTab === "templates" ? (
            Object.entries(groupedTemplates).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">All templates for this system type are already added</p>
            ) : (
              Object.entries(groupedTemplates).map(([cat, temps]) => (
                <div key={cat} className="mb-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {MATERIAL_CATEGORIES[cat as MaterialCategory]?.label || cat}
                  </div>
                  <div className="space-y-1">
                    {temps.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => onAdd(t)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.unit} · {t.calcType}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )
          ) : (
            filteredLibrary.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No products in library yet. Add them from your vendor quotes.</p>
            ) : (
              <div className="space-y-1">
                {filteredLibrary.map((d: any) => (
                  <button
                    key={d._id}
                    onClick={() => onAddFromDatasheet(d)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-slate-900">{d.productName}</div>
                      <div className="text-sm font-semibold text-emerald-600">${d.unitPrice.toFixed(2)}/{d.unit}</div>
                    </div>
                    <div className="text-xs text-slate-500">{d.category}{d.vendorName ? ` · ${d.vendorName}` : ""}{d.coverage ? ` · ${d.coverage} SF/unit` : ""}</div>
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
