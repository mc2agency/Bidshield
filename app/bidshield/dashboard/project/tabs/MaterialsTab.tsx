"use client";
import { DEMO_MATERIALS as IMPORTED_MATERIALS } from "@/lib/bidshield/demo-data";

import { useState, useMemo, useCallback } from "react";
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
  { _id: "dm_1", templateKey: "tpo-60mil", category: "membrane", name: "TPO 60mil Membrane (10' wide)", unit: "RL", calcType: "coverage", quantity: 48, unitPrice: 285, totalCost: 13680, wasteFactor: 1.05, coverage: 1000 },
  { _id: "dm_2", templateKey: "iso-2.5in", category: "insulation", name: 'Polyiso 2.5" (4x8)', unit: "BD", calcType: "coverage", quantity: 1477, unitPrice: 34, totalCost: 50218, wasteFactor: 1.05, coverage: 32 },
  { _id: "dm_3", templateKey: "densdeck", category: "insulation", name: 'DensDeck Cover Board 1/2"', unit: "BD", calcType: "coverage", quantity: 1477, unitPrice: 22, totalCost: 32494, wasteFactor: 1.05, coverage: 32 },
  { _id: "dm_4", templateKey: "iso-fasteners", category: "fasteners", name: "Insulation Screws + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", quantity: 24, unitPrice: 145, totalCost: 3480, wasteFactor: 1.05, qtyPerSf: 0.25 },
  { _id: "dm_5", templateKey: "membrane-fasteners", category: "fasteners", name: "Membrane Fasteners + Plates (box of 500)", unit: "BX", calcType: "qty_per_sf", quantity: 16, unitPrice: 165, totalCost: 2640, wasteFactor: 1.05, qtyPerSf: 0.167 },
  { _id: "dm_6", templateKey: "bonding-adhesive", category: "adhesive", name: "Bonding Adhesive (5 gal pail)", unit: "GL", calcType: "coverage", quantity: 198, unitPrice: 185, totalCost: 36630, wasteFactor: 1.10, coverage: 250 },
  { _id: "dm_7", templateKey: "tpo-primer", category: "adhesive", name: "TPO/PVC Primer (1 gal)", unit: "GL", calcType: "coverage", quantity: 248, unitPrice: 65, totalCost: 16120, wasteFactor: 1.10, coverage: 200 },
  { _id: "dm_8", templateKey: "drip-edge", category: "edge_metal", name: "Drip Edge (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 84, unitPrice: 18, totalCost: 1512, wasteFactor: 1.05 },
  { _id: "dm_9", templateKey: "coping-cap", category: "edge_metal", name: "Coping Cap (10' sticks)", unit: "PC", calcType: "linear_from_takeoff", quantity: 42, unitPrice: 42, totalCost: 1764, wasteFactor: 1.05 },
  { _id: "dm_10", templateKey: "pipe-boots", category: "accessories", name: "Pipe Boots (TPO/PVC)", unit: "EA", calcType: "count_from_takeoff", quantity: 24, unitPrice: 35, totalCost: 840, wasteFactor: 1.0 },
  { _id: "dm_11", templateKey: "drain-assembly", category: "accessories", name: "Drain Assemblies", unit: "EA", calcType: "count_from_takeoff", quantity: 8, unitPrice: 125, totalCost: 1000, wasteFactor: 1.0 },
  { _id: "dm_12", templateKey: "seam-tape", category: "accessories", name: "Seaming Tape (100' roll)", unit: "RL", calcType: "coverage", quantity: 520, unitPrice: 55, totalCost: 28600, wasteFactor: 1.10, coverage: 100 },
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

// Fuzzy match a material name against the datasheet library
function findBestDatasheetMatch(name: string, datasheets: any[]): any | null {
  if (!datasheets || datasheets.length === 0) return null;
  const target = name.toLowerCase();
  let best: any = null;
  let bestScore = 0;
  for (const ds of datasheets) {
    const p = (ds.productName || "").toLowerCase();
    let score = 0;
    if (p === target) score = 100;
    else if (p.includes(target) || target.includes(p)) score = 70;
    else {
      const words = target.split(/\s+/).filter((w) => w.length > 2);
      const matched = words.filter((w) => p.includes(w));
      score = words.length > 0 ? (matched.length / words.length) * 50 : 0;
    }
    if (score > bestScore) { bestScore = score; best = ds; }
  }
  return bestScore >= 20 ? best : null;
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

  const initMaterials = useMutation(api.bidshield.initProjectMaterials);
  const addMaterial = useMutation(api.bidshield.addProjectMaterial);
  const updateMaterial = useMutation(api.bidshield.updateProjectMaterial);
  const deleteMaterial = useMutation(api.bidshield.deleteProjectMaterial);
  const upsertPrice = useMutation(api.bidshield.upsertUserMaterialPrice);

  const [filterCategory, setFilterCategory] = useState<MaterialCategory | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editWaste, setEditWaste] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [checkRowId, setCheckRowId] = useState<string | null>(null);

  // Resolve materials (demo vs real)
  const [demoMaterials, setDemoMaterials] = useState(DEMO_MATERIALS as any[]);
  const materials = isDemo ? demoMaterials : (projectMaterials ?? []);
  const lineItems = isDemo ? DEMO_TAKEOFF_LINE_ITEMS : (takeoffLineItems ?? []);
  const sections = isDemo ? [{ squareFeet: 22000 }, { squareFeet: 12500 }, { squareFeet: 4200 }, { squareFeet: 2800 }] : (takeoffSections ?? []);
  const totalSF = sections.reduce((sum: number, s: any) => sum + (s.squareFeet || 0), 0);

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
    if (isDemo) return; // demo materials already have quantities
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
    // Save to user price book
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
          Auto-generate a material list based on your project&apos;s system type ({project?.systemType?.toUpperCase() || "TPO"}) and takeoff data.
        </p>
        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className="px-6 py-3 bg-emerald-600 text-slate-900 rounded-lg font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {isInitializing ? "Generating..." : "Generate Material List"}
        </button>
        <p className="text-xs text-slate-500">You can add or remove items after generation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section subtitle */}
      <p className="text-sm text-slate-500 -mb-1">
        Enter your material line items with quantities and unit costs — pulled from your vendor quotes or The EDGE takeoff.
      </p>

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

      {/* Material Table by Category */}
      {Object.entries(grouped).map(([cat, items]) => {
        const catInfo = MATERIAL_CATEGORIES[cat as MaterialCategory];
        const catTotal = (items as any[]).reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
        return (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">{catInfo?.icon}</span>
                <h3 className="text-sm font-semibold text-slate-900">{catInfo?.label}</h3>
                <span className="text-xs text-slate-500">({(items as any[]).length} items)</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">${catTotal.toLocaleString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-200">
                    <th className="text-left px-5 py-2 font-medium">Material</th>
                    <th className="text-center px-3 py-2 font-medium w-16">Unit</th>
                    <th className="text-right px-3 py-2 font-medium w-20">Qty</th>
                    <th className="text-center px-3 py-2 font-medium w-16">Waste</th>
                    <th className="text-right px-3 py-2 font-medium w-24">Unit Price</th>
                    <th className="text-right px-5 py-2 font-medium w-28">Total</th>
                    <th className="text-center px-3 py-2 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {(items as any[]).map((m: any) => {
                    const isEditing = editingId === m._id;
                    const isChecking = checkRowId === m._id;
                    return (
                      <tr key={m._id} className="border-b border-slate-200/30 hover:bg-slate-100/20">
                        <td className="px-5 py-2.5">
                          <div className="text-slate-700">{m.name}</div>
                          {m.calcType === "linear_from_takeoff" && <span className="text-[10px] text-slate-500">From takeoff (linear)</span>}
                          {m.calcType === "count_from_takeoff" && <span className="text-[10px] text-slate-500">From takeoff (count)</span>}
                          {m.calcType === "coverage" && <span className="text-[10px] text-slate-500">{m.coverage} SF/unit</span>}
                        </td>
                        <td className="text-center px-3 py-2.5 text-slate-500">{m.unit}</td>
                        <td className="text-right px-3 py-2.5">
                          {isEditing ? (
                            <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-16 bg-white border border-slate-300 text-slate-900 text-right text-xs rounded px-2 py-1" />
                          ) : (
                            <span className={m.quantity ? "text-slate-900" : "text-slate-500"}>{m.quantity ?? "—"}</span>
                          )}
                        </td>
                        <td className="text-center px-3 py-2.5">
                          {isEditing ? (
                            <input type="number" value={editWaste} onChange={(e) => setEditWaste(e.target.value)} className="w-12 bg-white border border-slate-300 text-slate-900 text-center text-xs rounded px-1 py-1" />
                          ) : (
                            <span className="text-slate-500 text-xs">{((m.wasteFactor - 1) * 100).toFixed(0)}%</span>
                          )}
                        </td>
                        <td className="text-right px-3 py-2.5">
                          {isEditing ? (
                            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-20 bg-white border border-slate-300 text-slate-900 text-right text-xs rounded px-2 py-1" step="0.01" />
                          ) : (
                            <span className={m.unitPrice ? "text-slate-700" : "text-amber-600"}>{m.unitPrice ? `$${m.unitPrice.toFixed(2)}` : "No price"}</span>
                          )}
                        </td>
                        <td className="text-right px-5 py-2.5 font-semibold">
                          <span className={m.totalCost ? "text-emerald-600" : "text-slate-500"}>
                            {m.totalCost ? `$${m.totalCost.toLocaleString()}` : "—"}
                          </span>
                        </td>
                        <td className="text-center px-3 py-2.5">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <button onClick={() => saveEdit(m)} className="text-emerald-600 hover:text-emerald-300 text-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-slate-500 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex gap-1 items-center">
                              <button
                                onClick={() => setCheckRowId(isChecking ? null : m._id)}
                                className={`text-xs transition-colors ${isChecking ? "text-blue-500" : "text-slate-400 hover:text-blue-500"}`}
                                title="Check against datasheet library"
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
                  {/* Datasheet comparison rows — rendered separately to avoid fragment-in-table issues */}
                  {checkRowId && (() => {
                    const m = (items as any[]).find((x: any) => x._id === checkRowId);
                    if (!m) return null;
                    const match = findBestDatasheetMatch(m.name, datasheets ?? []);
                    const stale = match && isStaleQuote(match.quoteDate);
                    const priceDiff = match ? (m.unitPrice ?? 0) - match.unitPrice : 0;
                    const priceDiffPct = match && match.unitPrice ? Math.abs(priceDiff / match.unitPrice * 100) : 0;
                    return (
                      <tr>
                        <td colSpan={7} className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                          {match ? (
                            <div className="flex flex-wrap gap-5 items-start text-xs">
                              <div>
                                <div className="text-slate-500 mb-0.5">Matched product</div>
                                <div className="font-medium text-slate-800">{match.productName}</div>
                                {match.vendorName && <div className="text-slate-400">{match.vendorName}</div>}
                              </div>
                              <div>
                                <div className="text-slate-500 mb-0.5">Library price</div>
                                <div className="font-semibold text-emerald-600">${match.unitPrice.toFixed(2)} / {match.unit}</div>
                                {priceDiffPct >= 3 && (
                                  <div className={`mt-0.5 font-medium ${priceDiff > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                                    Project is {priceDiff > 0 ? "+" : ""}${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct.toFixed(0)}% {priceDiff > 0 ? "higher" : "lower"})
                                  </div>
                                )}
                                {priceDiffPct < 3 && (m.unitPrice ?? 0) > 0 && <div className="mt-0.5 text-slate-400">Prices match ✓</div>}
                              </div>
                              {match.coverage && (
                                <div>
                                  <div className="text-slate-500 mb-0.5">Coverage rate</div>
                                  <div className="font-medium text-slate-800">{match.coverage} {match.coverageUnit || "SF/unit"}</div>
                                </div>
                              )}
                              <div>
                                <div className="text-slate-500 mb-0.5">Quote date</div>
                                <div className={`font-medium ${stale ? "text-amber-600" : "text-slate-800"}`}>
                                  {match.quoteDate
                                    ? new Date(match.quoteDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "No date on file"}
                                  {stale && " ⚠️ >90 days"}
                                </div>
                              </div>
                              {match.pdfUrl && (
                                <div className="self-center">
                                  <a href={match.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">📄 Spec sheet →</a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>No matching product in your datasheet library.</span>
                              <a href="/bidshield/dashboard/datasheets" className="text-blue-500 hover:underline font-medium">Add one →</a>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {filteredMaterials.length === 0 && materials.length > 0 && (
        <div className="text-center py-10 text-slate-500">No materials in this category</div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <AddMaterialModal
          systemType={project?.systemType}
          existingKeys={materials.map((m: any) => m.templateKey).filter(Boolean)}
          onAdd={handleAddMaterial}
          onAddFromDatasheet={handleAddFromDatasheet}
          onClose={() => setShowAddModal(false)}
          datasheets={datasheets ?? []}
        />
      )}
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
    ? datasheets.filter((d) => d.productName.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()))
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
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "templates" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "library" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            📋 From Library {datasheets.length > 0 && <span className="ml-1 text-xs opacity-70">({datasheets.length})</span>}
          </button>
        </div>

        <div className="px-5 py-2">
          <input
            type="text"
            placeholder={activeTab === "templates" ? "Search templates..." : "Search your library..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {activeTab === "templates" && (
            <>
              {Object.entries(groupedTemplates).map(([cat, items]) => {
                const catInfo = MATERIAL_CATEGORIES[cat as MaterialCategory];
                return (
                  <div key={cat} className="mb-4">
                    <div className="text-xs text-slate-500 font-semibold mb-2">{catInfo?.icon} {catInfo?.label}</div>
                    <div className="space-y-1">
                      {items.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => onAdd(t)}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm text-slate-700">{t.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {t.calcType === "coverage" && `${t.defaultCoverage} SF/${t.unit}`}
                              {t.calcType === "qty_per_sf" && `${t.defaultQtyPerSf} per SF`}
                              {t.calcType === "linear_from_takeoff" && "From takeoff (linear)"}
                              {t.calcType === "count_from_takeoff" && "From takeoff (count)"}
                              {t.calcType === "fixed" && "Manual qty"}
                            </div>
                          </div>
                          {t.defaultUnitPrice && <span className="text-xs text-slate-500">${t.defaultUnitPrice}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredTemplates.length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">
                  {available.length === 0 ? "All templates already added" : "No matching templates"}
                </div>
              )}
            </>
          )}

          {activeTab === "library" && (
            <>
              {filteredLibrary.length === 0 && datasheets.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-2xl mb-2">📑</div>
                  <p className="text-sm text-slate-500 mb-1">Your datasheet library is empty</p>
                  <p className="text-xs text-slate-400 mb-3">Add products in the Datasheets section to pull them here.</p>
                  <a href="/bidshield/dashboard/datasheets" className="text-sm text-blue-500 hover:underline font-medium">Go to Datasheets →</a>
                </div>
              )}
              {filteredLibrary.length === 0 && datasheets.length > 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">No matching products</div>
              )}
              <div className="space-y-1">
                {filteredLibrary.map((ds: any) => {
                  const stale = isStaleQuote(ds.quoteDate);
                  return (
                    <button
                      key={ds._id}
                      onClick={() => onAddFromDatasheet(ds)}
                      className="w-full flex items-start justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{ds.productName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {ds.category}
                          {ds.coverage && ` · ${ds.coverage} ${ds.coverageUnit || "SF/unit"}`}
                          {ds.vendorName && ` · ${ds.vendorName}`}
                        </div>
                        {stale && <div className="text-[10px] text-amber-500 mt-0.5">⚠️ Quote &gt;90 days old</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-emerald-600">${ds.unitPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">/{ds.unit}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
