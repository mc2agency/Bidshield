"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";

const GC_CATEGORIES = [
  { id: "bidding",    label: "Bidding & Preconstruction",    icon: "📋" },
  { id: "site",       label: "Site Setup & Logistics",       icon: "🚧" },
  { id: "safety",     label: "Safety & Compliance",          icon: "⚠️" },
  { id: "supervision",label: "Supervision & Management",     icon: "👷" },
  { id: "insurance",  label: "Insurance, Bonding & Fees",    icon: "🛡️" },
  { id: "markup",     label: "Markups",                      icon: "📈" },
];

function fmt(n: number | undefined | null) {
  if (n == null || isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function GeneralConditionsTab({ isDemo, isPro, userId, projectId, project }: TabProps) {
  const isValidProjectId = !isDemo && !!projectId && !projectId.startsWith("demo_");

  const gcItems = useQuery(
    api.bidshield.getGCItems,
    isValidProjectId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const seedGCMut    = useMutation(api.bidshield.seedGCItems);
  const upsertGCMut  = useMutation(api.bidshield.upsertGCItem);
  const deleteGCMut  = useMutation(api.bidshield.deleteGCItem);
  const updateProjectMut = useMutation(api.bidshield.updateProject);

  const [collapsed,     setCollapsed]     = useState<Record<string, boolean>>({});
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [showAddRow,    setShowAddRow]    = useState<string | null>(null);
  const [newRow,        setNewRow]        = useState({ description: "", quantity: "", unit: "EA", unitCost: "", notes: "" });
  const [seeded,        setSeeded]        = useState(false);

  // Seed on first load
  const items = gcItems ?? [];
  if (!isDemo && isValidProjectId && gcItems !== undefined && gcItems.length === 0 && !seeded) {
    setSeeded(true);
    seedGCMut({ projectId: projectId as Id<"bidshield_projects">, userId: userId ?? "" });
  }

  const demoItems = useMemo(() => [
    { _id: "d1",  category: "bidding",     description: "Bid bond premium",            quantity: 1,  unit: "LS",  unitCost: 500,  total: 500,  isMarkup: false, sortOrder: 1  },
    { _id: "d2",  category: "site",        description: "Dumpster / debris disposal",  quantity: 2,  unit: "EA",  unitCost: 650,  total: 1300, isMarkup: false, sortOrder: 10 },
    { _id: "d3",  category: "site",        description: "Crane / hoist rental",        quantity: 3,  unit: "day", unitCost: 1200, total: 3600, isMarkup: false, sortOrder: 11 },
    { _id: "d4",  category: "site",        description: "Mobilization / demobilization",quantity:1,  unit: "LS",  unitCost: 1500, total: 1500, isMarkup: false, sortOrder: 13 },
    { _id: "d5",  category: "safety",      description: "OSHA fall protection",        quantity: 1,  unit: "LS",  unitCost: 800,  total: 800,  isMarkup: false, sortOrder: 20 },
    { _id: "d6",  category: "supervision", description: "Project manager time",        quantity: 40, unit: "hr",  unitCost: 95,   total: 3800, isMarkup: false, sortOrder: 30 },
    { _id: "d7",  category: "insurance",   description: "Permits",                     quantity: 1,  unit: "LS",  unitCost: 600,  total: 600,  isMarkup: false, sortOrder: 40 },
    { _id: "d8",  category: "insurance",   description: "Performance / payment bond",  quantity: 1,  unit: "LS",  unitCost: 1200, total: 1200, isMarkup: false, sortOrder: 41 },
    { _id: "d9",  category: "markup",      description: "Overhead",   isMarkup: true, markupPct: 10, sortOrder: 50 },
    { _id: "d10", category: "markup",      description: "Profit",     isMarkup: true, markupPct: 8,  sortOrder: 51 },
    { _id: "d11", category: "markup",      description: "Contingency",isMarkup: true, markupPct: 3,  sortOrder: 52 },
  ] as any[], []);

  const resolvedItems = isDemo ? demoItems : items;

  const materialCost  = project?.materialCost ?? (isDemo ? 612000 : 0);
  const laborCost     = project?.laborCost    ?? (isDemo ? 488000 : 0);
  const base          = materialCost + laborCost;

  const lineItemsTotal = resolvedItems
    .filter((i: any) => !i.isMarkup)
    .reduce((sum: number, i: any) => sum + (i.total ?? 0), 0);

  const markupBase  = base + lineItemsTotal;
  const markupItems = resolvedItems.filter((i: any) => i.isMarkup && i.category === "markup");
  const markupTotal = markupItems.reduce((sum: number, item: any) =>
    sum + markupBase * ((item.markupPct ?? 0) / 100), 0);
  const gcTotal = lineItemsTotal + markupTotal;

  const categoryItems = (catId: string) =>
    resolvedItems.filter((i: any) => i.category === catId)
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const categoryTotal = (catId: string) =>
    catId === "markup"
      ? markupTotal
      : categoryItems(catId).reduce((sum: number, i: any) => sum + (i.total ?? 0), 0);

  function startEdit(item: any) {
    setEditingId(item._id);
    setEditingValues({
      description: item.description,
      quantity: item.quantity ?? "",
      unit: item.unit ?? "",
      unitCost: item.unitCost ?? "",
      total: item.total ?? "",
      notes: item.notes ?? "",
      isMarkup: item.isMarkup,
      markupPct: item.markupPct ?? "",
    });
  }

  async function saveEdit(item: any) {
    if (isDemo) { setEditingId(null); return; }
    const ev  = editingValues;
    const qty = parseFloat(ev.quantity) || undefined;
    const uc  = parseFloat(ev.unitCost) || undefined;
    const computed = qty && uc ? qty * uc : (parseFloat(ev.total) || undefined);
    await upsertGCMut({
      id: item._id as Id<"bidshield_gc_items">,
      projectId: projectId as Id<"bidshield_projects">,
      userId: userId ?? "",
      category: item.category,
      description: ev.description,
      quantity: qty,
      unit: ev.unit || undefined,
      unitCost: uc,
      total: computed,
      notes: ev.notes || undefined,
      isMarkup: item.isMarkup,
      markupPct: item.isMarkup ? (parseFloat(ev.markupPct) || undefined) : undefined,
    });
    setEditingId(null);
  }

  async function addRow(catId: string) {
    if (isDemo) { setShowAddRow(null); return; }
    const qty = parseFloat(newRow.quantity) || undefined;
    const uc  = parseFloat(newRow.unitCost) || undefined;
    await upsertGCMut({
      projectId: projectId as Id<"bidshield_projects">,
      userId: userId ?? "",
      category: catId,
      description: newRow.description,
      quantity: qty,
      unit: newRow.unit || undefined,
      unitCost: uc,
      total: qty && uc ? qty * uc : undefined,
      notes: newRow.notes || undefined,
    });
    setNewRow({ description: "", quantity: "", unit: "EA", unitCost: "", notes: "" });
    setShowAddRow(null);
  }

  async function pullGCTotal() {
    if (isDemo || !isValidProjectId) return;
    await updateProjectMut({
      projectId: projectId as Id<"bidshield_projects">,
      otherCost: Math.round(gcTotal),
    });
  }

  if (!isPro && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">General Conditions</h3>
        <p className="text-sm text-slate-500 mb-6">Track supervision, mobilization, insurance, bonding, and markups. Available on Pro.</p>
        <a href="/bidshield/pricing" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors">
          Upgrade to Pro
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-emerald-600" strokeWidth={1.75} />
            <h2 className="text-xl font-bold text-slate-900 m-0">General Conditions</h2>
          </div>
          <p className="text-sm text-slate-500 m-0">
            Track all indirect costs — site logistics, safety, fees, and markups.
          </p>
        </div>
        <button
          onClick={pullGCTotal}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer border-0"
        >
          Push to Pricing →
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Line Items</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(lineItemsTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">direct GC costs</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Markups</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(markupTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">on {fmt(markupBase)} base</div>
        </div>
        <div className="bg-white rounded-xl border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-200 shadow-sm p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">GC Total</div>
          <div className="text-2xl font-bold text-emerald-600">{fmt(gcTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">all-in GC</div>
        </div>
      </div>

      {/* Category sections */}
      {GC_CATEGORIES.map((cat) => {
        const catItems   = categoryItems(cat.id);
        const catTotal   = categoryTotal(cat.id);
        const isCollapsed = collapsed[cat.id];

        return (
          <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm mb-3 overflow-hidden">
            {/* Category header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none"
              onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                {catTotal > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                    {fmt(catTotal)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!isCollapsed && cat.id !== "markup" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAddRow(cat.id === showAddRow ? null : cat.id); }}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-transparent border-0 cursor-pointer p-0"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                )}
                {isCollapsed
                  ? <ChevronDown size={15} className="text-slate-400" />
                  : <ChevronUp   size={15} className="text-slate-400" />}
              </div>
            </div>

            {!isCollapsed && (
              <div className="border-t border-slate-100">
                {/* Column headers */}
                {catItems.length > 0 && (
                  <div
                    className="grid gap-2 px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-white"
                    style={{ gridTemplateColumns: cat.id === "markup" ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px" }}
                  >
                    <span>Description</span>
                    {cat.id !== "markup" && <span className="text-right">Qty</span>}
                    {cat.id !== "markup" && <span>Unit</span>}
                    <span className="text-right">{cat.id === "markup" ? "Rate" : "Unit $"}</span>
                    <span className="text-right">{cat.id === "markup" ? "Amount" : "Total"}</span>
                    <span />
                  </div>
                )}

                {catItems.map((item: any, idx: number) => (
                  <div key={item._id}>
                    {editingId === item._id ? (
                      <div
                        className="grid gap-2 px-4 py-2 items-center bg-blue-50 border-b border-slate-100"
                        style={{ gridTemplateColumns: item.isMarkup ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px" }}
                      >
                        <input
                          value={editingValues.description}
                          onChange={(e) => setEditingValues((v) => ({ ...v, description: e.target.value }))}
                          className={editInputCls}
                        />
                        {!item.isMarkup && (
                          <>
                            <input
                              value={editingValues.quantity}
                              onChange={(e) => setEditingValues((v) => ({ ...v, quantity: e.target.value }))}
                              placeholder="Qty"
                              className={`${editInputCls} text-right`}
                            />
                            <input
                              value={editingValues.unit}
                              onChange={(e) => setEditingValues((v) => ({ ...v, unit: e.target.value }))}
                              placeholder="Unit"
                              className={editInputCls}
                            />
                          </>
                        )}
                        <input
                          value={item.isMarkup ? editingValues.markupPct : editingValues.unitCost}
                          onChange={(e) => setEditingValues((v) => item.isMarkup
                            ? { ...v, markupPct: e.target.value }
                            : { ...v, unitCost: e.target.value }
                          )}
                          placeholder={item.isMarkup ? "%" : "$"}
                          className={`${editInputCls} text-right`}
                        />
                        <div className="flex gap-1.5">
                          <button onClick={() => saveEdit(item)} className={saveBtnCls}>Save</button>
                          <button onClick={() => setEditingId(null)} className={cancelBtnCls}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2 px-4 py-2 items-center border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}
                        style={{ gridTemplateColumns: item.isMarkup ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px" }}
                        onClick={() => startEdit(item)}
                      >
                        <span className="text-sm text-slate-800">{item.description}</span>
                        {!item.isMarkup && (
                          <>
                            <span className="text-sm text-right text-slate-500">{item.quantity ?? <span className="text-slate-300">—</span>}</span>
                            <span className="text-sm text-slate-500">{item.unit ?? <span className="text-slate-300">—</span>}</span>
                          </>
                        )}
                        <span className="text-sm text-right text-slate-500">
                          {item.isMarkup
                            ? <span className="font-medium">{item.markupPct ?? 0}%</span>
                            : (item.unitCost ? fmt(item.unitCost) : <span className="text-slate-300">—</span>)}
                        </span>
                        <span className="text-sm font-semibold text-right text-slate-800">
                          {item.isMarkup
                            ? fmt(markupBase * ((item.markupPct ?? 0) / 100))
                            : (item.total ? fmt(item.total) : <span className="text-slate-300 font-normal">—</span>)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDemo) deleteGCMut({ id: item._id as Id<"bidshield_gc_items"> });
                          }}
                          className="bg-transparent border-0 cursor-pointer p-0 text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {catItems.length === 0 && showAddRow !== cat.id && (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center bg-white">
                    No items — click <span className="text-emerald-600 font-medium">Add</span> to get started
                  </div>
                )}

                {/* Add new row */}
                {showAddRow === cat.id && (
                  <div
                    className="grid gap-2 px-4 py-2 items-center bg-emerald-50 border-t border-emerald-100"
                    style={{ gridTemplateColumns: "1fr 60px 60px 90px 80px auto" }}
                  >
                    <input
                      autoFocus
                      placeholder="Description"
                      value={newRow.description}
                      onChange={(e) => setNewRow((r) => ({ ...r, description: e.target.value }))}
                      className={editInputCls}
                    />
                    <input
                      placeholder="Qty"
                      value={newRow.quantity}
                      onChange={(e) => setNewRow((r) => ({ ...r, quantity: e.target.value }))}
                      className={`${editInputCls} text-right`}
                    />
                    <input
                      placeholder="Unit"
                      value={newRow.unit}
                      onChange={(e) => setNewRow((r) => ({ ...r, unit: e.target.value }))}
                      className={editInputCls}
                    />
                    <input
                      placeholder="Unit $"
                      value={newRow.unitCost}
                      onChange={(e) => setNewRow((r) => ({ ...r, unitCost: e.target.value }))}
                      className={`${editInputCls} text-right`}
                    />
                    <div className="flex gap-1.5">
                      <button onClick={() => addRow(cat.id)} className={saveBtnCls}>Add</button>
                      <button onClick={() => setShowAddRow(null)} className={cancelBtnCls}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <p className="mt-4 text-xs text-slate-400 text-center">
        Click any row to edit · Markups apply to Materials + Labor + GC line items
      </p>
    </div>
  );
}

const editInputCls = "bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm w-full focus:outline-none focus:border-emerald-500";
const saveBtnCls   = "bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded cursor-pointer border-0 hover:bg-emerald-700 whitespace-nowrap";
const cancelBtnCls = "bg-white border border-slate-300 text-slate-500 text-xs px-2 py-1 rounded cursor-pointer hover:bg-slate-50";
