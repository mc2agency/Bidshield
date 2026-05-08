"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { DEMO_TAKEOFF_SECTIONS as IMPORTED_SECTIONS, DEMO_LINEAR_ITEMS as IMPORTED_LINEAR, DEMO_COUNT_ITEMS as IMPORTED_COUNT } from "@/lib/bidshield/demo-data";
import { ASSEMBLY_TYPES } from "@/lib/bidshield/constants";

type TakeoffSection = {
  _id: string; name: string; assemblyType: string; squareFeet: number;
  completed: boolean; notes?: string; sortOrder: number;
};

type LineItem = {
  _id: string; category: "linear" | "count"; itemType: string;
  label: string; quantity?: number; unit: string; verified: boolean;
  notes?: string; sortOrder: number;
};

type RescanRow = { label: string; extractedSF: number; matched: TakeoffSection | null; applied: boolean };

const DEMO_LINEAR_ITEMS: LineItem[] = [
  { _id: "li_1", category: "linear", itemType: "parapet_wall", label: "Parapet Wall", quantity: 1240, unit: "LF", verified: true, sortOrder: 0 },
  { _id: "li_2", category: "linear", itemType: "coping", label: "Coping", quantity: 1240, unit: "LF", verified: true, sortOrder: 1 },
  { _id: "li_3", category: "linear", itemType: "edge_metal", label: "Edge Metal / Drip Edge", quantity: 680, unit: "LF", verified: true, sortOrder: 2 },
  { _id: "li_4", category: "linear", itemType: "counterflashing", label: "Counterflashing", quantity: 320, unit: "LF", verified: true, sortOrder: 3 },
  { _id: "li_5", category: "linear", itemType: "expansion_joint", label: "Expansion Joint", unit: "LF", verified: false, sortOrder: 4 },
  { _id: "li_6", category: "linear", itemType: "area_divider", label: "Area Divider", unit: "LF", verified: false, sortOrder: 5 },
  { _id: "li_7", category: "linear", itemType: "gutter", label: "Gutter", quantity: 450, unit: "LF", verified: false, sortOrder: 6 },
  { _id: "li_8", category: "linear", itemType: "gravel_stop", label: "Gravel Stop", unit: "LF", verified: false, sortOrder: 7 },
  { _id: "li_9", category: "linear", itemType: "reglet", label: "Reglet", unit: "LF", verified: false, sortOrder: 8 },
  { _id: "li_10", category: "linear", itemType: "base_flashing", label: "Base Flashing", unit: "LF", verified: false, sortOrder: 9 },
];

const DEMO_COUNT_ITEMS: LineItem[] = [
  { _id: "ci_1", category: "count", itemType: "pipe_penetration", label: "Pipe Penetrations", quantity: 24, unit: "EA", verified: true, sortOrder: 0 },
  { _id: "ci_2", category: "count", itemType: "roof_drain", label: "Roof Drains", quantity: 8, unit: "EA", verified: true, sortOrder: 1 },
  { _id: "ci_3", category: "count", itemType: "overflow_drain", label: "Overflow Drains", quantity: 4, unit: "EA", verified: true, sortOrder: 2 },
  { _id: "ci_4", category: "count", itemType: "scupper", label: "Scuppers", unit: "EA", verified: false, sortOrder: 3 },
  { _id: "ci_5", category: "count", itemType: "rtu_curb", label: "RTU / Equipment Curbs", quantity: 6, unit: "EA", verified: false, sortOrder: 4 },
  { _id: "ci_6", category: "count", itemType: "skylight", label: "Skylights", quantity: 0, unit: "EA", verified: false, notes: "none on this project", sortOrder: 5 },
  { _id: "ci_7", category: "count", itemType: "exhaust_fan", label: "Exhaust Fan Curbs", quantity: 3, unit: "EA", verified: false, sortOrder: 6 },
  { _id: "ci_8", category: "count", itemType: "pitch_pan", label: "Pitch Pans", unit: "EA", verified: false, sortOrder: 7 },
  { _id: "ci_9", category: "count", itemType: "hatch", label: "Roof Hatches", quantity: 2, unit: "EA", verified: false, sortOrder: 8 },
  { _id: "ci_10", category: "count", itemType: "vent", label: "Vents / Stacks", unit: "EA", verified: false, sortOrder: 9 },
  { _id: "ci_11", category: "count", itemType: "lightning_protection", label: "Lightning Protection Points", unit: "EA", verified: false, sortOrder: 10 },
];

function LineItemTable({ title, unit, items, isDemo, onUpdateItem, onDeleteItem, onAddItem }: {
  title: string; unit: string; items: LineItem[]; isDemo: boolean;
  onUpdateItem: (id: string, updates: { quantity?: number; verified?: boolean; notes?: string }) => void;
  onDeleteItem: (id: string) => void; onAddItem: (label: string) => void;
}) {
  const verified = items.filter((i) => i.verified).length;
  const total = items.length;
  const allVerified = total > 0 && verified === total;
  const qtySum = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
  const unitLabel = unit === "EA" ? "items" : unit;
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="mt-5">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-medium" style={{ color: "var(--bs-text-muted)" }}>{title} ({unit})</h4>
        <span className="text-[11px] font-medium" style={{ color: allVerified ? "var(--bs-teal)" : "var(--bs-amber)" }}>{verified} of {total} verified</span>
      </div>
      {items.length > 0 && (
        <div className="overflow-x-auto mb-2">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ fontSize: 10, color: "var(--bs-text-dim)", borderBottom: "1px solid var(--bs-border)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th className="text-left py-1.5">Item</th>
                <th className="text-right py-1.5 w-24">{unit}</th>
                <th className="text-center py-1.5 w-16">Verified</th>
                <th className="text-left py-1.5 hidden sm:table-cell">Notes</th>
                <th className="text-right py-1.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const hasQty = item.quantity !== undefined && item.quantity !== null;
                const qtyColor = item.verified ? "var(--bs-teal)" : hasQty ? "var(--bs-amber)" : "var(--bs-text-muted)";
                return (
                  <tr key={item._id} className="group" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                    <td className="py-1.5 text-xs" style={{ color: "var(--bs-text-secondary)" }}>{item.label}</td>
                    <td className="py-1.5 text-right">
                      {editingQty === item._id ? (
                        <input type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { const val = qtyInput.trim() === "" ? undefined : parseFloat(qtyInput); onUpdateItem(item._id, { quantity: val !== undefined && !isNaN(val) ? val : undefined }); setEditingQty(null); } if (e.key === "Escape") setEditingQty(null); }}
                          onBlur={() => { const val = qtyInput.trim() === "" ? undefined : parseFloat(qtyInput); onUpdateItem(item._id, { quantity: val !== undefined && !isNaN(val) ? val : undefined }); setEditingQty(null); }}
                          className="rounded px-2 py-0.5 text-xs w-20 text-right focus:outline-none" autoFocus
                          style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
                      ) : (
                        <button onClick={() => { setEditingQty(item._id); setQtyInput(hasQty ? String(item.quantity) : ""); }} className="text-xs tabular-nums transition-colors" style={{ color: qtyColor }}>
                          {hasQty ? item.quantity!.toLocaleString("en-US") : "—"}
                        </button>
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      <button onClick={() => onUpdateItem(item._id, { verified: !item.verified })} className="cursor-pointer transition-colors">
                        {item.verified ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </button>
                    </td>
                    <td className="py-1.5 text-[11px] hidden sm:table-cell" style={{ color: "var(--bs-text-dim)" }}>{item.notes || ""}</td>
                    <td className="py-1.5 text-right">
                      {item.itemType === "custom" && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onDeleteItem(item._id)} className="text-[11px]" style={{ color: "var(--bs-red)" }}>Del</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--bs-border)", background: "rgba(255,255,255,0.03)" }}>
                <td className="py-2 text-xs font-medium" style={{ color: "var(--bs-text-primary)" }}>TOTAL</td>
                <td className="py-2 text-right text-xs font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{qtySum.toLocaleString("en-US")} {unitLabel}</td>
                <td colSpan={3} className="py-2 text-center text-[11px]" style={{ color: "var(--bs-text-dim)" }}>{verified} of {total} verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {showAddForm ? (
        <div className="flex items-center gap-2 mt-1">
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newLabel.trim()) { onAddItem(newLabel.trim()); setNewLabel(""); setShowAddForm(false); } if (e.key === "Escape") setShowAddForm(false); }}
            placeholder="Item name" className="rounded px-3 py-1.5 text-xs flex-1 focus:outline-none" autoFocus
            style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
          <button onClick={() => { if (newLabel.trim()) { onAddItem(newLabel.trim()); setNewLabel(""); setShowAddForm(false); } }} className="text-[11px]" style={{ color: "var(--bs-teal)" }}>Add</button>
          <button onClick={() => setShowAddForm(false)} className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="text-xs font-medium transition-colors mt-1 cursor-pointer" style={{ color: "var(--bs-teal)" }}>+ Add {title.split(" ")[0]} Item</button>
      )}
    </div>
  );
}

export default function TakeoffTab({ projectId, isDemo, project, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");
  const [demoGrossRoof, setDemoGrossRoof] = useState(68000);
  const grossRoofArea: number | null = isDemo ? demoGrossRoof : (project?.grossRoofArea ?? null);

  // Build assembly types list: project assemblies first, then generic fallback list
  const roofAssemblies = (project as any)?.roofAssemblies as { label: string; systemType: string; name?: string }[] | undefined;
  const projectAssemblyTypes = roofAssemblies?.map(a => `${a.label} — ${a.systemType.toUpperCase()}${a.name ? ` (${a.name})` : ""}`) ?? [];
  const assemblyTypeOptions = projectAssemblyTypes.length > 0
    ? [...projectAssemblyTypes, "---", ...ASSEMBLY_TYPES]
    : ASSEMBLY_TYPES;
  const defaultAssemblyType = projectAssemblyTypes[0] || ASSEMBLY_TYPES[0];

  const sections = useQuery(api.bidshield.getTakeoffSections, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const updateProject = useMutation(api.bidshield.updateProject);
  const createSection = useMutation(api.bidshield.createTakeoffSection);
  const updateSection = useMutation(api.bidshield.updateTakeoffSection);
  const deleteSection = useMutation(api.bidshield.deleteTakeoffSection);
  const lineItems = useQuery(api.bidshield.getTakeoffLineItems, !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const initLineItems = useMutation(api.bidshield.initTakeoffLineItems);
  const updateLineItem = useMutation(api.bidshield.updateTakeoffLineItem);
  const createLineItem = useMutation(api.bidshield.createTakeoffLineItem);
  const deleteLineItem = useMutation(api.bidshield.deleteTakeoffLineItem);
  const syncTakeoffToMaterials = useMutation(api.bidshield.syncTakeoffToMaterials);

  const silentSyncToMaterials = useCallback(async () => {
    if (isDemo || !isValidConvexId || !userId) return;
    try {
      await syncTakeoffToMaterials({ projectId: projectId as Id<"bidshield_projects">, userId });
    } catch {
      // Silent — quantities will sync next time takeoff is saved
    }
  }, [isDemo, isValidConvexId, userId, projectId, syncTakeoffToMaterials]);

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!isDemo && isValidConvexId && userId && lineItems !== undefined && lineItems.length === 0 && !initialized) {
      setInitialized(true);
      initLineItems({ projectId: projectId as Id<"bidshield_projects">, userId });
    }
  }, [isDemo, isValidConvexId, userId, lineItems, initialized, projectId, initLineItems]);

  // Auto-create sections from roof assemblies when sections are empty
  const [sectionsInitialized, setSectionsInitialized] = useState(false);
  useEffect(() => {
    if (
      !isDemo && isValidConvexId && userId &&
      sections !== undefined && sections.length === 0 &&
      !sectionsInitialized &&
      roofAssemblies && roofAssemblies.length > 0
    ) {
      setSectionsInitialized(true);
      (async () => {
        for (const a of roofAssemblies) {
          await createSection({
            projectId: projectId as Id<"bidshield_projects">,
            userId,
            name: `${a.label}${a.name ? ` — ${a.name}` : ""}`,
            assemblyType: `${a.label} — ${a.systemType.toUpperCase()}${a.name ? ` (${a.name})` : ""}`,
            squareFeet: (a as any).area || 0,
          });
        }
      })();
    }
  }, [isDemo, isValidConvexId, userId, sections, sectionsInitialized, roofAssemblies, projectId, createSection]);

  const [demoSections, setDemoSections] = useState<TakeoffSection[]>([
    { _id: "ts_1", name: "Main Roof Area A", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 22000, completed: true, sortOrder: 0 },
    { _id: "ts_2", name: "Main Roof Area B", assemblyType: "TPO 60mil Mechanically Attached", squareFeet: 12500, completed: true, sortOrder: 1 },
    { _id: "ts_3", name: "Mechanical Room", assemblyType: "Modified Bitumen 2-Ply (SBS)", squareFeet: 4200, completed: true, sortOrder: 2 },
    { _id: "ts_4", name: "Canopy", assemblyType: "Metal Roof Panels", squareFeet: 2800, completed: false, sortOrder: 3 },
  ]);

  const displaySections: TakeoffSection[] = isDemo ? demoSections : (sections ?? []) as TakeoffSection[];
  const controlNumber = grossRoofArea;
  const [demoLineItems, setDemoLineItems] = useState<LineItem[]>([...DEMO_LINEAR_ITEMS, ...DEMO_COUNT_ITEMS]);
  const displayLineItems: LineItem[] = isDemo ? demoLineItems : (lineItems ?? []) as LineItem[];
  const linearItems = displayLineItems.filter((i) => i.category === "linear");
  const countItems = displayLineItems.filter((i) => i.category === "count");

  const takenOff = displaySections.reduce((sum, s) => sum + s.squareFeet, 0);
  const delta = controlNumber ? controlNumber - takenOff : null;
  const deltaPct = controlNumber && controlNumber > 0 ? Math.abs(((delta ?? 0) / controlNumber) * 100) : null;
  const progressPct = controlNumber && controlNumber > 0 ? Math.min(100, (takenOff / controlNumber) * 100) : null;

  const linearVerified = linearItems.filter((i) => i.verified).length;
  const linearTotal = linearItems.length;
  const countVerified = countItems.filter((i) => i.verified).length;
  const countTotal = countItems.length;
  const linearUnverified = linearTotal - linearVerified;
  const countUnverified = countTotal - countVerified;

  const getDeltaColor = () => {
    if (deltaPct === null) return { color: "var(--bs-text-muted)", bg: "var(--bs-bg-elevated)", bar: "var(--bs-text-dim)" };
    if (deltaPct <= 2) return { color: "var(--bs-teal)", bg: "var(--bs-teal-dim)", bar: "var(--bs-teal)" };
    if (deltaPct <= 5) return { color: "var(--bs-amber)", bg: "var(--bs-amber-dim)", bar: "var(--bs-amber)" };
    return { color: "var(--bs-red)", bg: "var(--bs-red-dim)", bar: "var(--bs-red)" };
  };
  const deltaColor = getDeltaColor();

  const [editingControl, setEditingControl] = useState(false);
  const [controlInput, setControlInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", assemblyType: defaultAssemblyType, squareFeet: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", assemblyType: "", squareFeet: "", notes: "" });

  const handleSaveControl = useCallback(async () => {
    if (isDemo) { const v = parseFloat(controlInput); if (!isNaN(v) && v > 0) setDemoGrossRoof(v); setEditingControl(false); return; }
    const val = parseFloat(controlInput);
    if (!isNaN(val) && val > 0 && isValidConvexId) {
      await updateProject({ projectId: projectId as Id<"bidshield_projects">, grossRoofArea: val });
      await silentSyncToMaterials();
    }
    setEditingControl(false);
  }, [controlInput, isDemo, isValidConvexId, projectId, updateProject, silentSyncToMaterials]);

  const handleAddSection = useCallback(async () => {
    if (isDemo) { const sf = parseFloat(newSection.squareFeet); if (newSection.name.trim() && !isNaN(sf) && sf > 0) setDemoSections(p => [...p, { _id: `ts_${Date.now()}`, name: newSection.name.trim(), assemblyType: newSection.assemblyType, squareFeet: sf, completed: false, sortOrder: p.length }]); setNewSection({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" }); setShowAddForm(false); return; }
    if (!userId || !isValidConvexId) { setShowAddForm(false); return; }
    const sf = parseFloat(newSection.squareFeet);
    if (!newSection.name.trim() || isNaN(sf) || sf <= 0) return;
    await createSection({ projectId: projectId as Id<"bidshield_projects">, userId, name: newSection.name.trim(), assemblyType: newSection.assemblyType, squareFeet: sf, notes: newSection.notes.trim() || undefined });
    setNewSection({ name: "", assemblyType: ASSEMBLY_TYPES[0], squareFeet: "", notes: "" });
    setShowAddForm(false);
  }, [isDemo, userId, isValidConvexId, newSection, projectId, createSection]);

  const handleToggleComplete = useCallback(async (section: TakeoffSection) => {
    if (isDemo) { setDemoSections(p => p.map(s => s._id === section._id ? { ...s, completed: !s.completed } : s)); return; }
    await updateSection({ sectionId: section._id as Id<"bidshield_takeoff_sections">, completed: !section.completed });
  }, [isDemo, updateSection]);

  const handleStartEdit = (section: TakeoffSection) => {
    setEditingId(section._id);
    setEditData({ name: section.name, assemblyType: section.assemblyType, squareFeet: String(section.squareFeet), notes: section.notes || "" });
  };

  const handleSaveEdit = useCallback(async () => {
    if (isDemo) { if (editingId) { const sf = parseFloat(editData.squareFeet); if (editData.name.trim() && !isNaN(sf) && sf > 0) setDemoSections(p => p.map(s => s._id === editingId ? { ...s, name: editData.name.trim(), assemblyType: editData.assemblyType, squareFeet: sf, notes: editData.notes.trim() || undefined } : s)); } setEditingId(null); return; }
    if (!editingId) { setEditingId(null); return; }
    const sf = parseFloat(editData.squareFeet);
    if (!editData.name.trim() || isNaN(sf) || sf <= 0) return;
    await updateSection({ sectionId: editingId as Id<"bidshield_takeoff_sections">, name: editData.name.trim(), assemblyType: editData.assemblyType, squareFeet: sf, notes: editData.notes.trim() || undefined });
    await silentSyncToMaterials();
    setEditingId(null);
  }, [isDemo, editingId, editData, updateSection, silentSyncToMaterials]);

  const handleDeleteSection = useCallback(async (sectionId: string) => {
    if (isDemo) { setDemoSections(p => p.filter(s => s._id !== sectionId)); return; }
    await deleteSection({ sectionId: sectionId as Id<"bidshield_takeoff_sections"> });
  }, [isDemo, deleteSection]);

  const handleUpdateLineItem = useCallback(async (id: string, updates: { quantity?: number; verified?: boolean; notes?: string }) => {
    if (isDemo) { setDemoLineItems(p => p.map(i => i._id === id ? { ...i, ...updates } : i)); return; }
    await updateLineItem({ itemId: id as Id<"bidshield_takeoff_line_items">, ...updates });
    silentSyncToMaterials();
  }, [isDemo, updateLineItem, silentSyncToMaterials]);

  const handleDeleteLineItem = useCallback(async (id: string) => {
    if (isDemo) { setDemoLineItems(p => p.filter(i => i._id !== id)); return; }
    await deleteLineItem({ itemId: id as Id<"bidshield_takeoff_line_items"> });
  }, [isDemo, deleteLineItem]);

  const handleAddLinearItem = useCallback(async (label: string) => {
    if (isDemo) { setDemoLineItems(p => [...p, { _id: `li_${Date.now()}`, category: "linear", itemType: label.toLowerCase().replace(/ /g,"_"), label, unit: "LF", verified: false, sortOrder: p.length }]); return; }
    if (!userId || !isValidConvexId) return;
    await createLineItem({ projectId: projectId as Id<"bidshield_projects">, userId, category: "linear", label });
  }, [isDemo, userId, isValidConvexId, projectId, createLineItem]);

  const handleAddCountItem = useCallback(async (label: string) => {
    if (isDemo) { setDemoLineItems(p => [...p, { _id: `ci_${Date.now()}`, category: "count", itemType: label.toLowerCase().replace(/ /g,"_"), label, unit: "EA", verified: false, sortOrder: p.length }]); return; }
    if (!userId || !isValidConvexId) return;
    await createLineItem({ projectId: projectId as Id<"bidshield_projects">, userId, category: "count", label });
  }, [isDemo, userId, isValidConvexId, projectId, createLineItem]);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const areaHasIssue = controlNumber !== null && deltaPct !== null && deltaPct > 2;
  const areaIsRed = controlNumber !== null && deltaPct !== null && deltaPct > 5;
  const areaGood = controlNumber !== null && deltaPct !== null && deltaPct <= 2;
  const allGood = areaGood && linearUnverified === 0 && countUnverified === 0;

  const [activeTab, setActiveTab] = useState<"areas" | "linear" | "counts">("areas");

  // Re-scan PDF state
  const [showRescanModal, setShowRescanModal] = useState(false);
  const [rescanStep, setRescanStep] = useState<"upload" | "diff">("upload");
  const [rescanLoading, setRescanLoading] = useState(false);
  const [rescanError, setRescanError] = useState<string | null>(null);
  const [rescanDiff, setRescanDiff] = useState<RescanRow[]>([]);
  const rescanFileRef = useRef<HTMLInputElement>(null);

  const handleRescanPdf = useCallback(async (file: File) => {
    setRescanLoading(true);
    setRescanError(null);
    try {
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const res = await fetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setRescanError(data.error || "Extraction failed"); setRescanLoading(false); return; }
      const extracted: Array<{ label: string; area?: number }> = (data.assemblies || []).filter((a: any) => typeof a.area === "number" && a.area > 0);
      if (extracted.length === 0) { setRescanError("No area data found in this PDF. Make sure the drawing includes a roof type takeoff schedule."); setRescanLoading(false); return; }
      const rows: RescanRow[] = extracted.map((a) => {
        const lbl = (a.label || "").toLowerCase().trim();
        const matched = displaySections.find(s =>
          s.name.toLowerCase().startsWith(lbl) || s.assemblyType.toLowerCase().startsWith(lbl)
        ) ?? null;
        return { label: a.label, extractedSF: a.area!, matched, applied: false };
      });
      setRescanDiff(rows);
      setRescanStep("diff");
    } catch (err: any) {
      setRescanError(err?.message || "Unknown error");
    } finally {
      setRescanLoading(false);
    }
  }, [displaySections]);

  const handleApplyRescanRow = useCallback(async (rowIdx: number) => {
    const row = rescanDiff[rowIdx];
    if (!row || row.applied) return;
    if (row.matched) {
      if (!isDemo) {
        await updateSection({ sectionId: row.matched._id as Id<"bidshield_takeoff_sections">, squareFeet: row.extractedSF });
        await silentSyncToMaterials();
      } else {
        setDemoSections(p => p.map(s => s._id === row.matched!._id ? { ...s, squareFeet: row.extractedSF } : s));
      }
    } else {
      if (!isDemo && userId && isValidConvexId) {
        await createSection({ projectId: projectId as Id<"bidshield_projects">, userId, name: row.label, assemblyType: row.label, squareFeet: row.extractedSF });
      } else if (isDemo) {
        setDemoSections(p => [...p, { _id: `ts_rescan_${row.label}`, name: row.label, assemblyType: row.label, squareFeet: row.extractedSF, completed: false, sortOrder: p.length }]);
      }
    }
    setRescanDiff(p => p.map((r, i) => i === rowIdx ? { ...r, applied: true } : r));
  }, [rescanDiff, isDemo, userId, isValidConvexId, projectId, updateSection, createSection, silentSyncToMaterials]);

  const handleApplyAllRescan = useCallback(async () => {
    for (let i = 0; i < rescanDiff.length; i++) {
      if (!rescanDiff[i].applied) await handleApplyRescanRow(i);
    }
  }, [rescanDiff, handleApplyRescanRow]);

  const areaComplete = displaySections.length > 0 && displaySections.every((s) => s.completed) && areaGood;
  const areaPartial = displaySections.length > 0 && displaySections.some((s) => s.completed);
  const linearComplete = linearTotal > 0 && linearVerified === linearTotal;
  const linearPartial = linearVerified > 0;
  const countComplete = countTotal > 0 && countVerified === countTotal;
  const countPartial = countVerified > 0;

  const getStatusDot = (complete: boolean, partial: boolean) => {
    if (complete) return <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "var(--bs-teal)" }} />;
    if (partial) return <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "var(--bs-amber)" }} />;
    return <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "var(--bs-text-dim)" }} />;
  };

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      <div className="flex justify-between items-center mb-5">
        <h3 style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-primary)", letterSpacing: "-0.01em" }}>Takeoff Reconciliation</h3>
        {controlNumber !== null && !editingControl && (
          <button onClick={() => { setControlInput(String(controlNumber)); setEditingControl(true); }} style={{ fontSize: 11, color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"}>Edit Control #</button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Control # */}
        <div style={{ background: "var(--bs-bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--bs-border)" }}>
          {editingControl ? (
            <div className="flex flex-col gap-1.5">
              <input type="number" value={controlInput} onChange={(e) => setControlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveControl(); if (e.key === "Escape") setEditingControl(false); }}
                className="rounded px-2 py-1 text-sm w-full focus:outline-none" autoFocus placeholder="SF"
                style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} />
              <div className="flex gap-2">
                <button onClick={handleSaveControl} style={{ fontSize: 10, color: "var(--bs-teal)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>Save</button>
                <button onClick={() => setEditingControl(false)} style={{ fontSize: 10, color: "var(--bs-text-muted)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>Cancel</button>
              </div>
            </div>
          ) : controlNumber !== null ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Control # (Gross)</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: "var(--bs-text-primary)", letterSpacing: "-0.3px", lineHeight: 1 }}>{fmt(controlNumber)} <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>SF</span></div>
            </>
          ) : (
            <button onClick={() => { setControlInput(""); setEditingControl(true); }} className="w-full text-left cursor-pointer" style={{ background: "none", border: "none", padding: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Control #</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--bs-amber)" }}>Not set — click</div>
            </button>
          )}
        </div>
        {/* Taken Off */}
        <div style={{ background: "var(--bs-bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--bs-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Taken Off</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--bs-text-primary)", letterSpacing: "-0.3px", lineHeight: 1 }}>{fmt(takenOff)} <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>SF</span></div>
        </div>
        {/* Delta */}
        <div style={{ background: "var(--bs-bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--bs-border)" }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Delta</div>
          {delta !== null ? (
            <div style={{ fontSize: 20, fontWeight: 500, color: delta >= 0 ? "var(--bs-teal)" : "var(--bs-red)", letterSpacing: "-0.3px", lineHeight: 1 }}>{delta >= 0 ? "-" : "+"}{fmt(Math.abs(delta))} <span style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>SF</span></div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--bs-text-dim)" }}>Set control #</div>
          )}
        </div>
      </div>

      {progressPct !== null && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>Area Reconciliation</span>
            <span className="text-xs font-medium" style={{ color: deltaPct !== null && deltaPct <= 2 ? "var(--bs-teal)" : deltaPct !== null && deltaPct <= 5 ? "var(--bs-amber)" : "var(--bs-red)" }}>{progressPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progressPct)}%`, background: deltaPct !== null && deltaPct <= 2 ? "var(--bs-teal)" : deltaPct !== null && deltaPct <= 5 ? "var(--bs-amber)" : "var(--bs-red)" }} />
          </div>
        </div>
      )}

      {delta !== null && delta < 0 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-sm" style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber-border)", color: "var(--bs-amber)" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          <span><strong>Overage:</strong> Taken-off area ({fmt(takenOff)} SF) exceeds control # ({fmt(controlNumber!)} SF) by {fmt(Math.abs(delta))} SF. Verify sections before pricing.</span>
        </div>
      )}

      <div className="grid grid-cols-3 mb-0">
        {(["areas", "linear", "counts"] as const).map((tab, i) => {
          const isActive = activeTab === tab;
          const label = tab === "areas" ? "Areas (SF)" : tab === "linear" ? "Linear (LF)" : "Counts (EA)";
          const shortLabel = tab === "areas" ? "Areas" : tab === "linear" ? "Linear" : "Counts";
          const sub = tab === "areas" ? `${displaySections.length} section${displaySections.length !== 1 ? "s" : ""}` : tab === "linear" ? `${linearVerified} of ${linearTotal} verified` : `${countVerified} of ${countTotal} verified`;
          const complete = tab === "areas" ? areaComplete : tab === "linear" ? linearComplete : countComplete;
          const partial = tab === "areas" ? areaPartial : tab === "linear" ? linearPartial : countPartial;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="py-2.5 text-center text-xs font-medium transition-colors"
              style={{
                background: isActive ? "var(--bs-bg-elevated)" : "transparent",
                color: isActive ? "var(--bs-text-primary)" : "var(--bs-text-muted)",
                borderRadius: i === 0 ? "8px 0 0 0" : i === 2 ? "0 8px 0 0" : undefined,
                border: isActive ? `1px solid var(--bs-border)` : "1px solid transparent",
                borderBottom: isActive ? "2px solid var(--bs-teal)" : "2px solid transparent",
              }}
            >
              <div className="flex items-center justify-center">{getStatusDot(complete, partial)}<span className="hidden sm:inline">{label}</span><span className="sm:hidden">{shortLabel}</span></div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>{sub}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-b-lg p-4" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", borderTop: "none" }}>
        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--bs-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Sections</span>
            <span className="bs-num" style={{ fontSize: 14, fontWeight: 700, color: 'var(--bs-text-primary)' }}>{displaySections.length}</span>
          </div>
          <span style={{ color: 'var(--bs-border)', fontSize: 14 }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--bs-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Total SF</span>
            <span className="bs-num" style={{ fontSize: 14, fontWeight: 700, color: takenOff > 0 ? 'var(--bs-text-primary)' : 'var(--bs-text-dim)' }}>
              {takenOff > 0 ? takenOff.toLocaleString() : '—'}
            </span>
          </div>
          {takenOff === 0 && displaySections.length > 0 && (
            <>
              <span style={{ color: 'var(--bs-border)', fontSize: 14 }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--bs-text-dim)', fontStyle: 'italic' }}>Enter SF to calculate material quantities</span>
            </>
          )}
          {takenOff > 0 && (
            <>
              <span style={{ color: 'var(--bs-border)', fontSize: 14 }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--bs-teal)', fontWeight: 500 }}>Quantities update on save ✓</span>
            </>
          )}
        </div>
        {activeTab === "areas" && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={() => { setShowRescanModal(true); setRescanStep("upload"); setRescanDiff([]); setRescanError(null); }}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-teal)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bs-teal)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bs-border)"; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                Re-scan from Plans
              </button>
            </div>
            {displaySections.length > 0 && (
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--bs-border)", fontSize: 10, color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <th className="text-left py-2">Section Name</th><th className="text-left py-2 hidden sm:table-cell">Assembly</th><th className="text-right py-2">SF</th><th className="text-center py-2 w-10">Status</th><th className="text-right py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySections.map((section) =>
                      editingId === section._id ? (
                        <tr key={section._id} style={{ borderBottom: "1px solid var(--bs-border)" }}>
                          <td className="py-2 pr-2"><input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="rounded px-2 py-1 text-xs w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} /></td>
                          <td className="py-2 pr-2 hidden sm:table-cell"><select value={editData.assemblyType} onChange={(e) => setEditData({ ...editData, assemblyType: e.target.value })} className="rounded px-1 py-1 text-xs w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>{assemblyTypeOptions.map((t) => t === "---" ? <option key="---" disabled>──────────</option> : <option key={t} value={t}>{t}</option>)}</select></td>
                          <td className="py-2 pr-2"><input type="number" value={editData.squareFeet} onChange={(e) => setEditData({ ...editData, squareFeet: e.target.value })} className="rounded px-2 py-1 text-xs w-20 text-right focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} /></td>
                          <td colSpan={2} className="py-2 text-right">
                            <button onClick={handleSaveEdit} className="text-[11px] mr-2" style={{ color: "var(--bs-teal)" }}>Save</button>
                            <button onClick={() => setEditingId(null)} className="text-[11px]" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={section._id} className="group" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                          <td className="py-2" style={{ color: "var(--bs-text-secondary)" }}>{section.name}</td>
                          <td className="py-2 text-xs hidden sm:table-cell" style={{ color: "var(--bs-text-muted)" }}>{section.assemblyType}</td>
                          <td className="py-2 text-right tabular-nums" style={{ color: "var(--bs-text-secondary)" }}>{fmt(section.squareFeet)}</td>
                          <td className="py-2 text-center">
                            <button onClick={() => handleToggleComplete(section)} className="cursor-pointer transition-colors">
                              {section.completed ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              )}
                            </button>
                          </td>
                          <td className="py-2 text-right">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleStartEdit(section)} className="text-[11px] mr-2" style={{ color: "var(--bs-text-muted)" }}>Edit</button>
                              <button onClick={() => handleDeleteSection(section._id)} className="text-[11px]" style={{ color: "var(--bs-red)" }}>Del</button>
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid var(--bs-border)", background: "rgba(255,255,255,0.03)" }}>
                      <td className="py-2 text-xs font-medium" style={{ color: "var(--bs-text-primary)" }}>TOTAL</td>
                      <td className="py-2 text-[11px] hidden sm:table-cell" style={{ color: "var(--bs-text-dim)" }}>{displaySections.length} section{displaySections.length !== 1 ? "s" : ""} &middot; {displaySections.filter((s) => s.completed).length} of {displaySections.length} verified</td>
                      <td className="py-2 text-right text-xs font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{fmt(takenOff)} SF</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {displaySections.length === 0 && !showAddForm && (
              <div className="text-center py-6 text-sm mb-3" style={{ color: "var(--bs-text-muted)" }}>No sections yet. Add your first takeoff section to start reconciling.</div>
            )}
            {showAddForm ? (
              <div className="rounded-lg p-4 mb-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div><label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Section Name *</label><input value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} placeholder="e.g., Main Roof Area A" className="rounded px-3 py-2 text-sm w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} /></div>
                  <div><label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Assembly Type *</label><select value={newSection.assemblyType} onChange={(e) => setNewSection({ ...newSection, assemblyType: e.target.value })} className="rounded px-3 py-2 text-sm w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }}>{assemblyTypeOptions.map((t) => t === "---" ? <option key="---" disabled>──────────</option> : <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Square Feet *</label><input type="number" value={newSection.squareFeet} onChange={(e) => setNewSection({ ...newSection, squareFeet: e.target.value })} placeholder="e.g., 22000" className="rounded px-3 py-2 text-sm w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} /></div>
                  <div><label className="text-[11px] mb-1 block" style={{ color: "var(--bs-text-dim)" }}>Notes</label><input value={newSection.notes} onChange={(e) => setNewSection({ ...newSection, notes: e.target.value })} placeholder="Optional notes" className="rounded px-3 py-2 text-sm w-full focus:outline-none" style={{ background: "var(--bs-bg-input)", border: "1px solid var(--bs-border)", color: "var(--bs-text-primary)" }} /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddSection} className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: "var(--bs-teal)", color: "#13151a" }}>Add Section</button>
                  <button onClick={() => setShowAddForm(false)} className="text-sm px-4 py-2 transition-colors" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddForm(true)} className="text-sm font-medium transition-colors" style={{ color: "var(--bs-teal)" }}>+ Add Section</button>
            )}
          </div>
        )}
        {activeTab === "linear" && <LineItemTable title="Linear Items" unit="LF" items={linearItems} isDemo={isDemo} onUpdateItem={handleUpdateLineItem} onDeleteItem={handleDeleteLineItem} onAddItem={handleAddLinearItem} />}
        {activeTab === "counts" && <LineItemTable title="Count Items" unit="EA" items={countItems} isDemo={isDemo} onUpdateItem={handleUpdateLineItem} onDeleteItem={handleDeleteLineItem} onAddItem={handleAddCountItem} />}
      </div>


      <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
        {allGood ? (
          <div className="text-sm text-center" style={{ color: "var(--bs-teal)" }}>Takeoff fully reconciled and verified.</div>
        ) : controlNumber === null ? (
          <div className="text-sm text-center" style={{ color: "var(--bs-text-muted)" }}>Enter your gross roof area from the site plan to enable area reconciliation.</div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {areaGood && <span style={{ color: "var(--bs-teal)" }}>Area: Reconciled</span>}
            {areaHasIssue && !areaIsRed && <span style={{ color: "var(--bs-amber)" }}>Area: {fmt(Math.abs(delta!))} SF off ({deltaPct!.toFixed(1)}%)</span>}
            {areaIsRed && <span style={{ color: "var(--bs-red)" }}>Area: {fmt(Math.abs(delta!))} SF off ({deltaPct!.toFixed(1)}%)</span>}
            <span className="hidden sm:inline" style={{ color: "var(--bs-text-dim)" }}>&bull;</span>
            {linearUnverified === 0 ? <span style={{ color: "var(--bs-teal)" }}>Linear: All verified</span> : <span style={{ color: "var(--bs-amber)" }}>Linear: {linearUnverified}/{linearTotal} unverified</span>}
            <span className="hidden sm:inline" style={{ color: "var(--bs-text-dim)" }}>&bull;</span>
            {countUnverified === 0 ? <span style={{ color: "var(--bs-teal)" }}>Counts: All verified</span> : <span style={{ color: "var(--bs-amber)" }}>Counts: {countUnverified}/{countTotal} unverified</span>}
          </div>
        )}
      </div>

      {/* Re-scan from Plans Modal */}
      {showRescanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bs-text-primary)" }}>Re-scan from Plans PDF</div>
                <div style={{ fontSize: 11, color: "var(--bs-text-muted)", marginTop: 2 }}>
                  {rescanStep === "upload" ? "Upload a roof plan to extract area data" : "Review and apply AI-extracted areas"}
                </div>
              </div>
              <button onClick={() => setShowRescanModal(false)} style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5">
              {rescanStep === "upload" ? (
                <div className="space-y-4">
                  <div
                    className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-colors"
                    style={{ border: "2px dashed var(--bs-border)", padding: "32px 24px", background: "var(--bs-bg-elevated)" }}
                    onClick={() => rescanFileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type === "application/pdf") handleRescanPdf(file); }}
                  >
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-text-dim)"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    {rescanLoading ? (
                      <div style={{ fontSize: 13, color: "var(--bs-text-muted)" }}>
                        <svg className="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Extracting areas from PDF...
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--bs-text-primary)" }}>Drop PDF here or click to upload</div>
                        <div style={{ fontSize: 11, color: "var(--bs-text-muted)" }}>Roof plan with takeoff schedule — max 20 MB</div>
                      </>
                    )}
                  </div>
                  <input ref={rescanFileRef} type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleRescanPdf(file); e.target.value = ""; }} />
                  {rescanError && (
                    <div className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)", color: "var(--bs-red)" }}>{rescanError}</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--bs-text-dim)" }}>
                    AI reads the roof type takeoff schedule and extracts SF per assembly. You review before any changes are applied.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bs-border)" }}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
                          <th className="text-left px-3 py-2" style={{ color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}>Assembly</th>
                          <th className="text-right px-3 py-2" style={{ color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}>AI SF</th>
                          <th className="text-right px-3 py-2" style={{ color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}>Current SF</th>
                          <th className="text-right px-3 py-2" style={{ color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}>Δ</th>
                          <th className="text-center px-3 py-2 w-20" style={{ color: "var(--bs-text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rescanDiff.map((row, i) => {
                          const delta = row.matched ? row.extractedSF - row.matched.squareFeet : null;
                          const deltaPctRow = row.matched && row.matched.squareFeet > 0 ? (delta! / row.matched.squareFeet) * 100 : null;
                          const deltaColor = deltaPctRow === null ? "var(--bs-text-muted)" : Math.abs(deltaPctRow) <= 2 ? "var(--bs-teal)" : Math.abs(deltaPctRow) <= 5 ? "var(--bs-amber)" : "var(--bs-red)";
                          return (
                            <tr key={i} style={{ borderBottom: "1px solid var(--bs-border)", opacity: row.applied ? 0.5 : 1 }}>
                              <td className="px-3 py-2.5" style={{ color: "var(--bs-text-primary)", fontWeight: 500 }}>
                                {row.label}
                                {!row.matched && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bs-amber-dim)", color: "var(--bs-amber)" }}>New</span>}
                                {row.applied && <span className="ml-1.5 text-[10px]" style={{ color: "var(--bs-teal)" }}>✓ Applied</span>}
                              </td>
                              <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{fmt(row.extractedSF)}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{row.matched ? fmt(row.matched.squareFeet) : "—"}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: deltaColor }}>
                                {delta !== null ? (delta >= 0 ? "+" : "") + fmt(delta) : "—"}
                                {deltaPctRow !== null && <span className="ml-1 text-[10px]">({Math.abs(deltaPctRow).toFixed(1)}%)</span>}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => handleApplyRescanRow(i)}
                                  disabled={row.applied}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-40"
                                  style={{ background: row.matched ? "var(--bs-teal-dim)" : "var(--bs-amber-dim)", color: row.matched ? "var(--bs-teal)" : "var(--bs-amber)", border: `1px solid ${row.matched ? "var(--bs-teal-border, var(--bs-teal))" : "var(--bs-amber-border, var(--bs-amber))"}` }}
                                >
                                  {row.applied ? "Done" : row.matched ? "Apply" : "Create"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: "var(--bs-bg-elevated)", borderTop: "1px solid var(--bs-border)" }}>
                          <td className="px-3 py-2 text-xs font-medium" style={{ color: "var(--bs-text-primary)" }}>TOTAL</td>
                          <td className="px-3 py-2 text-right text-xs font-medium tabular-nums" style={{ color: "var(--bs-text-primary)" }}>{fmt(rescanDiff.reduce((s, r) => s + r.extractedSF, 0))}</td>
                          <td className="px-3 py-2 text-right text-xs tabular-nums" style={{ color: "var(--bs-text-muted)" }}>{fmt(rescanDiff.reduce((s, r) => s + (r.matched?.squareFeet ?? 0), 0))}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setRescanStep("upload"); setRescanDiff([]); setRescanError(null); }} className="flex-1 text-sm py-2 rounded-lg transition-colors" style={{ border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)", background: "none" }}>Back</button>
                    <button
                      onClick={async () => { await handleApplyAllRescan(); }}
                      disabled={rescanDiff.every(r => r.applied)}
                      className="flex-1 text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40"
                      style={{ background: "var(--bs-teal)", color: "#13151a" }}
                    >
                      Apply All
                    </button>
                  </div>
                  <button onClick={() => setShowRescanModal(false)} className="w-full text-xs text-center transition-colors" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>
                    Done — close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
