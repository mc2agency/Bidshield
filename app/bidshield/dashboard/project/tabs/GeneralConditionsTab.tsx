"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";

const GC_CATEGORIES = [
  { id: "bidding", label: "Bidding & Preconstruction", icon: "📋" },
  { id: "site", label: "Site Setup & Logistics", icon: "🚧" },
  { id: "safety", label: "Safety & Compliance", icon: "⚠️" },
  { id: "supervision", label: "Supervision & Management", icon: "👷" },
  { id: "insurance", label: "Insurance, Bonding & Fees", icon: "🛡️" },
  { id: "markup", label: "Markups", icon: "📈" },
];

function fmt(n: number | undefined | null) {
  if (n == null || isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function GeneralConditionsTab({ isDemo, userId, projectId, project }: TabProps) {
  const isValidProjectId = !isDemo && !!projectId && !projectId.startsWith("demo_");

  const gcItems = useQuery(
    api.bidshield.getGCItems,
    isValidProjectId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const seedGCMut = useMutation(api.bidshield.seedGCItems);
  const upsertGCMut = useMutation(api.bidshield.upsertGCItem);
  const deleteGCMut = useMutation(api.bidshield.deleteGCItem);
  const updateProjectMut = useMutation(api.bidshield.updateProject);

  const [activeCategory, setActiveCategory] = useState("bidding");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [showAddRow, setShowAddRow] = useState<string | null>(null);
  const [newRow, setNewRow] = useState({ description: "", quantity: "", unit: "EA", unitCost: "", notes: "" });
  const [seeded, setSeeded] = useState(false);

  // Seed on first load
  const items = gcItems ?? [];
  if (!isDemo && isValidProjectId && gcItems !== undefined && gcItems.length === 0 && !seeded) {
    setSeeded(true);
    seedGCMut({ projectId: projectId as Id<"bidshield_projects">, userId: userId ?? "" });
  }

  // Demo data
  const demoItems = useMemo(() => [
    { _id: "d1", category: "bidding", description: "Bid bond premium", quantity: 1, unit: "LS", unitCost: 500, total: 500, isMarkup: false, sortOrder: 1 },
    { _id: "d2", category: "site", description: "Dumpster / debris disposal", quantity: 2, unit: "EA", unitCost: 650, total: 1300, isMarkup: false, sortOrder: 10 },
    { _id: "d3", category: "site", description: "Crane / hoist rental", quantity: 3, unit: "day", unitCost: 1200, total: 3600, isMarkup: false, sortOrder: 11 },
    { _id: "d4", category: "site", description: "Mobilization / demobilization", quantity: 1, unit: "LS", unitCost: 1500, total: 1500, isMarkup: false, sortOrder: 13 },
    { _id: "d5", category: "safety", description: "OSHA fall protection", quantity: 1, unit: "LS", unitCost: 800, total: 800, isMarkup: false, sortOrder: 20 },
    { _id: "d6", category: "supervision", description: "Project manager time", quantity: 40, unit: "hr", unitCost: 95, total: 3800, isMarkup: false, sortOrder: 30 },
    { _id: "d7", category: "insurance", description: "Permits", quantity: 1, unit: "LS", unitCost: 600, total: 600, isMarkup: false, sortOrder: 40 },
    { _id: "d8", category: "insurance", description: "Performance / payment bond", quantity: 1, unit: "LS", unitCost: 1200, total: 1200, isMarkup: false, sortOrder: 41 },
    { _id: "d9", category: "markup", description: "Overhead", isMarkup: true, markupPct: 10, sortOrder: 50 },
    { _id: "d10", category: "markup", description: "Profit", isMarkup: true, markupPct: 8, sortOrder: 51 },
    { _id: "d11", category: "markup", description: "Contingency", isMarkup: true, markupPct: 3, sortOrder: 52 },
  ] as any[], []);

  const resolvedItems = isDemo ? demoItems : items;

  // Compute subtotals
  const materialCost = project?.materialCost ?? 0;
  const laborCost = project?.laborCost ?? 0;
  const base = materialCost + laborCost;

  const lineItemsTotal = resolvedItems
    .filter((i: any) => !i.isMarkup)
    .reduce((sum: number, i: any) => sum + (i.total ?? 0), 0);

  const markupBase = base + lineItemsTotal;

  const markupItems = resolvedItems.filter((i: any) => i.isMarkup && i.category === "markup");
  const markupTotal = markupItems.reduce((sum: number, item: any) => {
    return sum + (markupBase * ((item.markupPct ?? 0) / 100));
  }, 0);

  const gcTotal = lineItemsTotal + markupTotal;

  const categoryItems = (catId: string) =>
    resolvedItems.filter((i: any) => i.category === catId).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const categoryTotal = (catId: string) => {
    if (catId === "markup") return markupTotal;
    return categoryItems(catId).reduce((sum: number, i: any) => sum + (i.total ?? 0), 0);
  };

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
    const ev = editingValues;
    const qty = parseFloat(ev.quantity) || undefined;
    const uc = parseFloat(ev.unitCost) || undefined;
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
      markupPct: ev.isMarkup ? (parseFloat(ev.markupPct) || undefined) : undefined,
    });
    setEditingId(null);
  }

  async function addRow(catId: string) {
    if (isDemo) { setShowAddRow(null); return; }
    const qty = parseFloat(newRow.quantity) || undefined;
    const uc = parseFloat(newRow.unitCost) || undefined;
    const computed = qty && uc ? qty * uc : undefined;
    await upsertGCMut({
      projectId: projectId as Id<"bidshield_projects">,
      userId: userId ?? "",
      category: catId,
      description: newRow.description,
      quantity: qty,
      unit: newRow.unit || undefined,
      unitCost: uc,
      total: computed,
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

  return (
    <div style={{ padding: "24px 28px", maxWidth: 920 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Briefcase size={20} color="#10b981" strokeWidth={1.75} />
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f9fafb" }}>General Conditions</h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
            Track all indirect costs — site logistics, safety, fees, and markups.
          </p>
        </div>
        <button
          onClick={pullGCTotal}
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 8,
            color: "#10b981",
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Push to Pricing →
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Line Items", value: fmt(lineItemsTotal), sub: "direct GC costs" },
          { label: "Markups", value: fmt(markupTotal), sub: `on ${fmt(markupBase)} base` },
          { label: "GC Total", value: fmt(gcTotal), sub: "all-in GC", accent: true },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: card.accent ? "rgba(16,185,129,0.08)" : "#161b22",
              border: `1px solid ${card.accent ? "rgba(16,185,129,0.3)" : "#21262d"}`,
              borderRadius: 10,
              padding: "14px 18px",
            }}
          >
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.accent ? "#10b981" : "#f9fafb" }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Category sections */}
      {GC_CATEGORIES.map((cat) => {
        const catItems = categoryItems(cat.id);
        const catTotal = categoryTotal(cat.id);
        const isCollapsed = collapsed[cat.id];

        return (
          <div
            key={cat.id}
            style={{
              background: "#161b22",
              border: "1px solid #21262d",
              borderRadius: 10,
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            {/* Category header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>{cat.label}</span>
                {catTotal > 0 && (
                  <span style={{
                    fontSize: 12, color: "#10b981", fontWeight: 600,
                    background: "rgba(16,185,129,0.1)", borderRadius: 4, padding: "1px 7px",
                  }}>{fmt(catTotal)}</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!isCollapsed && cat.id !== "markup" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAddRow(cat.id === showAddRow ? null : cat.id); }}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                    }}
                  >
                    <Plus size={13} />
                    Add
                  </button>
                )}
                {isCollapsed ? <ChevronDown size={15} color="#6b7280" /> : <ChevronUp size={15} color="#6b7280" />}
              </div>
            </div>

            {!isCollapsed && (
              <div style={{ borderTop: "1px solid #21262d" }}>
                {/* Column headers */}
                {catItems.length > 0 && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: cat.id === "markup" ? "1fr 80px 80px 32px" : "1fr 70px 70px 90px 80px 32px",
                    gap: 8, padding: "6px 16px",
                    fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em",
                    borderBottom: "1px solid #21262d",
                  }}>
                    <span>Description</span>
                    {cat.id !== "markup" && <span style={{ textAlign: "right" }}>Qty</span>}
                    {cat.id !== "markup" && <span>Unit</span>}
                    <span style={{ textAlign: "right" }}>{cat.id === "markup" ? "Base" : "Unit Cost"}</span>
                    <span style={{ textAlign: "right" }}>{cat.id === "markup" ? "Amount" : "Total"}</span>
                    <span />
                  </div>
                )}

                {catItems.map((item: any) => (
                  <div key={item._id}>
                    {editingId === item._id ? (
                      // Edit row
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: item.isMarkup ? "1fr 80px 80px 32px" : "1fr 70px 70px 90px 80px 32px",
                        gap: 8, padding: "8px 16px", alignItems: "center",
                        borderBottom: "1px solid #21262d",
                      }}>
                        <input
                          value={editingValues.description}
                          onChange={(e) => setEditingValues((v) => ({ ...v, description: e.target.value }))}
                          style={inputStyle}
                        />
                        {!item.isMarkup && (
                          <>
                            <input
                              value={editingValues.quantity}
                              onChange={(e) => setEditingValues((v) => ({ ...v, quantity: e.target.value }))}
                              placeholder="Qty"
                              style={{ ...inputStyle, textAlign: "right" }}
                            />
                            <input
                              value={editingValues.unit}
                              onChange={(e) => setEditingValues((v) => ({ ...v, unit: e.target.value }))}
                              placeholder="Unit"
                              style={inputStyle}
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
                          style={{ ...inputStyle, textAlign: "right" }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => saveEdit(item)} style={saveBtnStyle}>Save</button>
                          <button onClick={() => setEditingId(null)} style={cancelBtnStyle}>✕</button>
                        </div>
                      </div>
                    ) : (
                      // Display row
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: item.isMarkup ? "1fr 80px 80px 32px" : "1fr 70px 70px 90px 80px 32px",
                          gap: 8, padding: "8px 16px", alignItems: "center",
                          borderBottom: "1px solid #1a1f27",
                          cursor: "pointer",
                        }}
                        onClick={() => startEdit(item)}
                      >
                        <span style={{ fontSize: 13, color: "#e5e7eb" }}>{item.description}</span>
                        {!item.isMarkup && (
                          <>
                            <span style={{ fontSize: 13, color: "#9ca3af", textAlign: "right" }}>{item.quantity ?? "—"}</span>
                            <span style={{ fontSize: 13, color: "#9ca3af" }}>{item.unit ?? "—"}</span>
                          </>
                        )}
                        <span style={{ fontSize: 13, color: "#9ca3af", textAlign: "right" }}>
                          {item.isMarkup
                            ? `${item.markupPct ?? 0}%`
                            : (item.unitCost ? fmt(item.unitCost) : "—")}
                        </span>
                        <span style={{ fontSize: 13, color: "#f9fafb", fontWeight: 600, textAlign: "right" }}>
                          {item.isMarkup
                            ? fmt(markupBase * ((item.markupPct ?? 0) / 100))
                            : fmt(item.total)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDemo) deleteGCMut({ id: item._id as Id<"bidshield_gc_items"> });
                          }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#4b5563" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {catItems.length === 0 && showAddRow !== cat.id && (
                  <div style={{ padding: "12px 16px", fontSize: 13, color: "#4b5563", textAlign: "center" }}>
                    No items — click Add to get started
                  </div>
                )}

                {/* Add new row */}
                {showAddRow === cat.id && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 70px 90px 80px auto",
                    gap: 8, padding: "8px 16px", alignItems: "center",
                    borderTop: "1px solid #21262d", background: "#0d1117",
                  }}>
                    <input
                      autoFocus
                      placeholder="Description"
                      value={newRow.description}
                      onChange={(e) => setNewRow((r) => ({ ...r, description: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      placeholder="Qty"
                      value={newRow.quantity}
                      onChange={(e) => setNewRow((r) => ({ ...r, quantity: e.target.value }))}
                      style={{ ...inputStyle, textAlign: "right" }}
                    />
                    <input
                      placeholder="Unit"
                      value={newRow.unit}
                      onChange={(e) => setNewRow((r) => ({ ...r, unit: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      placeholder="Unit $"
                      value={newRow.unitCost}
                      onChange={(e) => setNewRow((r) => ({ ...r, unitCost: e.target.value }))}
                      style={{ ...inputStyle, textAlign: "right" }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => addRow(cat.id)} style={saveBtnStyle}>Add</button>
                      <button onClick={() => setShowAddRow(null)} style={cancelBtnStyle}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer note */}
      <p style={{ marginTop: 16, fontSize: 12, color: "#4b5563", textAlign: "center" }}>
        Click any row to edit · Markups apply to Materials + Labor + GC line items
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 6,
  color: "#f9fafb",
  fontSize: 13,
  padding: "5px 8px",
  width: "100%",
  outline: "none",
};

const saveBtnStyle: React.CSSProperties = {
  background: "rgba(16,185,129,0.15)",
  border: "1px solid rgba(16,185,129,0.3)",
  borderRadius: 6,
  color: "#10b981",
  fontSize: 12,
  fontWeight: 600,
  padding: "4px 10px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #30363d",
  borderRadius: 6,
  color: "#6b7280",
  fontSize: 12,
  padding: "4px 8px",
  cursor: "pointer",
};
