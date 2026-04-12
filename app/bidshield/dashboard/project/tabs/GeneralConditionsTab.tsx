"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

const GC_CATEGORIES = [
  { id: "bidding",    label: "Bidding & Preconstruction" },
  { id: "site",       label: "Site Setup & Logistics" },
  { id: "safety",     label: "Safety & Compliance" },
  { id: "supervision",label: "Supervision & Management" },
  { id: "insurance",  label: "Insurance, Bonding & Fees" },
  { id: "markup",     label: "Markups" },
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
  const projectMaterialsList = useQuery(
    api.bidshield.getProjectMaterials,
    isValidProjectId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const laborTotalQuery = useQuery(
    api.bidshield.getLaborTotal,
    isValidProjectId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

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

  const computedMaterialCost = isDemo
    ? 612000
    : (() => { const s = (projectMaterialsList ?? []).reduce((a: number, m: any) => a + (m.totalCost || 0), 0); return s > 0 ? s : (project?.materialCost ?? 0); })();
  const computedLaborCost = isDemo
    ? 488000
    : ((laborTotalQuery && laborTotalQuery > 0) ? laborTotalQuery : (project?.laborCost ?? 0));
  const base = computedMaterialCost + computedLaborCost;

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

  if (!isPro && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--bs-bg-elevated)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--bs-text-dim)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: "var(--bs-text-primary)" }}>General Conditions</h3>
        <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Track supervision, mobilization, insurance, bonding, and markups. Available on Pro.</p>
        <a
          href="/bidshield/pricing"
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bs-teal)" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
            </svg>
            <h2 className="text-xl font-medium m-0" style={{ color: "var(--bs-text-primary)" }}>General Conditions</h2>
          </div>
          <p className="text-sm m-0" style={{ color: "var(--bs-text-muted)" }}>
            Track all indirect costs — site logistics, safety, fees, and markups.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Line Items", value: fmt(lineItemsTotal), sub: "direct GC costs", accent: false },
          { label: "Markups",    value: fmt(markupTotal),    sub: `on ${fmt(markupBase)} base`, accent: false },
          { label: "GC Total",   value: fmt(gcTotal),        sub: "all-in GC", accent: true },
        ].map(({ label, value, sub, accent }) => (
          <div
            key={label}
            style={{
              background: "var(--bs-bg-card)",
              borderRadius: 10,
              padding: "14px 16px",
              border: accent ? "1px solid var(--bs-teal-border)" : "1px solid var(--bs-border)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: accent ? "var(--bs-teal)" : "var(--bs-text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--bs-text-dim)", marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* E-22: Markup calculation breakdown */}
      {markupItems.length > 0 && markupBase > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
          <div className="px-4 py-3" style={{ background: "var(--bs-bg-elevated)", borderBottom: "1px solid var(--bs-border)" }}>
            <span className="text-xs font-semibold" style={{ color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Markup Calculation Order</span>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: "var(--bs-text-muted)" }}>
              <span>Materials</span><span>{fmt(computedMaterialCost)}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--bs-text-muted)" }}>
              <span>+ Labor</span><span>{fmt(computedLaborCost)}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: "var(--bs-text-muted)" }}>
              <span>+ GC Line Items</span><span>{fmt(lineItemsTotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium pt-1" style={{ color: "var(--bs-text-primary)", borderTop: "1px solid var(--bs-border)" }}>
              <span>Markup Base</span><span>{fmt(markupBase)}</span>
            </div>
            {markupItems.map((item: any) => {
              const pct = item.markupPct ?? 0;
              const amt = markupBase * (pct / 100);
              return (
                <div key={item._id || item.name} className="flex justify-between text-xs" style={{ color: "var(--bs-text-muted)" }}>
                  <span>{item.name} ({pct}%)</span><span>{fmt(amt)}</span>
                </div>
              );
            })}
            <div className="flex justify-between text-xs font-medium pt-1" style={{ color: "var(--bs-teal)", borderTop: "1px solid var(--bs-border)" }}>
              <span>Total Markups</span><span>{fmt(markupTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category sections */}
      {GC_CATEGORIES.map((cat) => {
        const catItems   = categoryItems(cat.id);
        const catTotal   = categoryTotal(cat.id);
        const isCollapsed = collapsed[cat.id];

        return (
          <div
            key={cat.id}
            className="mb-3 overflow-hidden"
            style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 10 }}
          >
            {/* Category header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              style={{ background: "var(--bs-bg-elevated)", borderBottom: isCollapsed ? "none" : "1px solid var(--bs-border)" }}
              onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--bs-text-primary)" }}>{cat.label}</span>
                {catTotal > 0 && (
                  <span
                    className="text-xs font-medium rounded px-2 py-0.5"
                    style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}
                  >
                    {fmt(catTotal)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!isCollapsed && cat.id !== "markup" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAddRow(cat.id === showAddRow ? null : cat.id); }}
                    className="flex items-center gap-1 text-xs font-medium bg-transparent border-0 cursor-pointer p-0"
                    style={{ color: "var(--bs-teal)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Add
                  </button>
                )}
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ color: "var(--bs-text-dim)", transform: isCollapsed ? "none" : "rotate(180deg)", transition: "transform 0.15s" }}
                >
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {!isCollapsed && (
              <div>
                {/* Column headers */}
                {catItems.length > 0 && (
                  <div
                    className="grid gap-2 px-4 py-1.5"
                    style={{
                      gridTemplateColumns: cat.id === "markup" ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px",
                      fontSize: 10,
                      fontWeight: 500,
                      color: "var(--bs-text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "1px solid var(--bs-border)",
                      background: "var(--bs-bg-card)",
                    }}
                  >
                    <span>Description</span>
                    {cat.id !== "markup" && <span className="text-right">Qty</span>}
                    {cat.id !== "markup" && <span>Unit</span>}
                    <span className="text-right">{cat.id === "markup" ? "Rate" : "Unit $"}</span>
                    <span className="text-right">{cat.id === "markup" ? "Amount" : "Total"}</span>
                    <span />
                  </div>
                )}

                {catItems.map((item: any) => (
                  <div key={item._id}>
                    {editingId === item._id ? (
                      <div
                        className="grid gap-2 px-4 py-2 items-center"
                        style={{
                          gridTemplateColumns: item.isMarkup ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px",
                          background: "var(--bs-bg-elevated)",
                          borderBottom: "1px solid var(--bs-border)",
                        }}
                      >
                        <input value={editingValues.description} onChange={(e) => setEditingValues((v) => ({ ...v, description: e.target.value }))} className={editInputCls} />
                        {!item.isMarkup && (
                          <>
                            <input value={editingValues.quantity} onChange={(e) => setEditingValues((v) => ({ ...v, quantity: e.target.value }))} placeholder="Qty" className={`${editInputCls} text-right`} />
                            <input value={editingValues.unit} onChange={(e) => setEditingValues((v) => ({ ...v, unit: e.target.value }))} placeholder="Unit" className={editInputCls} />
                          </>
                        )}
                        <input
                          value={item.isMarkup ? editingValues.markupPct : editingValues.unitCost}
                          onChange={(e) => setEditingValues((v) => item.isMarkup ? { ...v, markupPct: e.target.value } : { ...v, unitCost: e.target.value })}
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
                        className="grid gap-2 px-4 py-2 items-center cursor-pointer transition-colors"
                        style={{ gridTemplateColumns: item.isMarkup ? "1fr 80px 90px 32px" : "1fr 60px 60px 90px 80px 32px", borderBottom: "1px solid var(--bs-border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                        onClick={() => startEdit(item)}
                      >
                        <span className="text-sm" style={{ color: "var(--bs-text-secondary)" }}>{item.description}</span>
                        {!item.isMarkup && (
                          <>
                            <span className="text-sm text-right" style={{ color: "var(--bs-text-muted)" }}>{item.quantity ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</span>
                            <span className="text-sm" style={{ color: "var(--bs-text-muted)" }}>{item.unit ?? <span style={{ color: "var(--bs-text-dim)" }}>—</span>}</span>
                          </>
                        )}
                        <span className="text-sm text-right" style={{ color: "var(--bs-text-muted)" }}>
                          {item.isMarkup
                            ? <span className="font-medium" style={{ color: "var(--bs-text-secondary)" }}>{item.markupPct ?? 0}%</span>
                            : (item.unitCost ? fmt(item.unitCost) : <span style={{ color: "var(--bs-text-dim)" }}>—</span>)}
                        </span>
                        <span className="text-sm font-medium text-right" style={{ color: "var(--bs-text-primary)" }}>
                          {item.isMarkup
                            ? fmt(markupBase * ((item.markupPct ?? 0) / 100))
                            : (item.total ? fmt(item.total) : <span style={{ color: "var(--bs-text-dim)", fontWeight: 400 }}>—</span>)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDemo) deleteGCMut({ id: item._id as Id<"bidshield_gc_items"> });
                          }}
                          className="bg-transparent border-0 cursor-pointer p-0 transition-colors"
                          style={{ color: "var(--bs-text-dim)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--bs-red)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--bs-text-dim)")}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {catItems.length === 0 && showAddRow !== cat.id && (
                  <div className="px-4 py-3 text-sm text-center" style={{ color: "var(--bs-text-dim)" }}>
                    No items — click <span style={{ color: "var(--bs-teal)", fontWeight: 500 }}>Add</span> to get started
                  </div>
                )}

                {/* Add new row */}
                {showAddRow === cat.id && (
                  <div
                    className="grid gap-2 px-4 py-2 items-center"
                    style={{ gridTemplateColumns: "1fr 60px 60px 90px 80px auto", background: "var(--bs-teal-dim)", borderTop: "1px solid var(--bs-teal-border)" }}
                  >
                    <input autoFocus placeholder="Description" value={newRow.description} onChange={(e) => setNewRow((r) => ({ ...r, description: e.target.value }))} className={editInputCls} />
                    <input placeholder="Qty" value={newRow.quantity} onChange={(e) => setNewRow((r) => ({ ...r, quantity: e.target.value }))} className={`${editInputCls} text-right`} />
                    <input placeholder="Unit" value={newRow.unit} onChange={(e) => setNewRow((r) => ({ ...r, unit: e.target.value }))} className={editInputCls} />
                    <input placeholder="Unit $" value={newRow.unitCost} onChange={(e) => setNewRow((r) => ({ ...r, unitCost: e.target.value }))} className={`${editInputCls} text-right`} />
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

      <p className="mt-4 text-xs text-center" style={{ color: "var(--bs-text-dim)" }}>
        Click any row to edit · Markups apply to Materials + Labor + GC line items
      </p>
    </div>
  );
}

const editInputCls = "rounded px-2 py-1 text-sm w-full focus:outline-none" + " bg-[var(--bs-bg-input)] border border-[var(--bs-border)] text-[var(--bs-text-primary)]";
const saveBtnCls   = "text-xs font-medium px-2.5 py-1 rounded cursor-pointer border-0 whitespace-nowrap" + " bg-[var(--bs-teal)] text-[#13151a]";
const cancelBtnCls = "text-xs px-2 py-1 rounded cursor-pointer" + " bg-transparent border border-[var(--bs-border)] text-[var(--bs-text-muted)]";
