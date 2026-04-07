"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TabProps } from "../tab-types";
import {
  INSULATION_TYPES,
  SURFACE_TYPES,
  THICKNESS_PRESETS,
  computeInsulationRValue,
} from "@/lib/bidshield/insulation-data";

const SYSTEMS = [
  { id: "tpo", label: "TPO" },
  { id: "pvc", label: "PVC" },
  { id: "epdm", label: "EPDM" },
  { id: "sbs", label: "SBS Modified Bitumen" },
  { id: "app", label: "APP Modified Bitumen" },
  { id: "bur", label: "Built-Up (BUR)" },
  { id: "metal", label: "Standing Seam Metal" },
  { id: "spf", label: "Spray Foam (SPF)" },
  { id: "hydrotech", label: "Hydrotech (IRMA)" },
];

const DECKS = [
  { id: "steel", label: "Steel Deck" },
  { id: "concrete", label: "Concrete Deck" },
  { id: "wood", label: "Wood / Plywood" },
  { id: "lightweight", label: "Lightweight Concrete" },
  { id: "gypsum", label: "Gypsum Deck" },
  { id: "tectum", label: "Tectum / Cementwood" },
];

interface AssemblyRow {
  label: string;
  systemType: string;
  insulationType: string;
  insulationThickness: string;
  rValue: number | null;
  surfaceType: string;
}

function systemLabel(id: string) {
  return SYSTEMS.find((s) => s.id === id)?.label || id.toUpperCase();
}

// ── Styles ──
const cardStyle = {
  background: "var(--bs-bg-elevated)",
  border: "1px solid var(--bs-border)",
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
};
const labelStyle = {
  fontSize: 12,
  fontWeight: 500 as const,
  color: "var(--bs-text-muted)",
  marginBottom: 4,
  display: "block" as const,
};
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  background: "var(--bs-bg-card)",
  border: "1px solid var(--bs-border)",
  color: "var(--bs-text-primary)",
};
const btnPrimary = {
  padding: "8px 20px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600 as const,
  background: "var(--bs-teal)",
  color: "#13151a",
  border: "none",
  cursor: "pointer",
};
const btnSecondary = {
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500 as const,
  background: "transparent",
  color: "var(--bs-teal)",
  border: "1px solid var(--bs-teal)",
  cursor: "pointer",
};

export default function SetupTab({ project, projectId, isDemo }: TabProps) {
  const updateProject = useMutation(api.bidshield.updateProject);

  // ── Section 1: Project Info ──
  const [info, setInfo] = useState({
    name: "",
    location: "",
    bidDate: "",
    gc: "",
    sqft: "",
    deckType: "",
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  useEffect(() => {
    if (!project) return;
    setInfo({
      name: project.name || "",
      location: project.location || "",
      bidDate: project.bidDate || "",
      gc: project.gc || "",
      sqft: project.sqft ? String(project.sqft) : project.grossRoofArea ? String(project.grossRoofArea) : "",
      deckType: project.deckType || "",
    });
  }, [project]);

  const handleInfoSave = async () => {
    if (isDemo) return;
    setInfoSaving(true);
    try {
      await updateProject({
        projectId: projectId as any,
        name: info.name || undefined,
        location: info.location || undefined,
        bidDate: info.bidDate || undefined,
        gc: info.gc || undefined,
        sqft: info.sqft ? parseInt(info.sqft) : undefined,
        grossRoofArea: info.sqft ? parseInt(info.sqft) : undefined,
        deckType: info.deckType || undefined,
      });
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save project info:", e);
    } finally {
      setInfoSaving(false);
    }
  };

  // ── Section 2: Roof Assemblies ──
  const [assemblies, setAssemblies] = useState<AssemblyRow[]>([]);
  const [assembliesDirty, setAssembliesDirty] = useState(false);
  const [asmSaving, setAsmSaving] = useState(false);
  const [asmSaved, setAsmSaved] = useState(false);

  useEffect(() => {
    if (!project) return;
    if (project.roofAssemblies && project.roofAssemblies.length > 0) {
      setAssemblies(
        project.roofAssemblies.map((a: any) => ({
          label: a.label || "",
          systemType: a.systemType || "",
          insulationType: a.insulationType || "",
          insulationThickness: a.insulationThickness || "",
          rValue: a.rValue ?? null,
          surfaceType: a.surfaceType || "",
        }))
      );
    }
  }, [project]);

  const updateAssembly = (idx: number, field: keyof AssemblyRow, value: string | number | null) => {
    setAssemblies((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: value };
      // Auto-compute R-value when insulation changes
      if (field === "insulationType" || field === "insulationThickness") {
        const thickness = field === "insulationThickness" ? parseFloat(value as string) : parseFloat(row.insulationThickness);
        const insType = field === "insulationType" ? (value as string) : row.insulationType;
        row.rValue = insType && thickness ? computeInsulationRValue(insType, thickness) : null;
      }
      next[idx] = row;
      return next;
    });
    setAssembliesDirty(true);
  };

  const addAssembly = () => {
    const nextNum = assemblies.length + 1;
    setAssemblies((prev) => [
      ...prev,
      {
        label: `RT-${String(nextNum).padStart(2, "0")}`,
        systemType: "",
        insulationType: "",
        insulationThickness: "",
        rValue: null,
        surfaceType: "",
      },
    ]);
    setAssembliesDirty(true);
  };

  const removeAssembly = (idx: number) => {
    setAssemblies((prev) => prev.filter((_, i) => i !== idx));
    setAssembliesDirty(true);
  };

  const handleAssembliesSave = async () => {
    if (isDemo) return;
    setAsmSaving(true);
    try {
      const cleanAssemblies = assemblies
        .filter((a) => a.systemType)
        .map((a) => {
          const obj: Record<string, any> = {
            label: a.label,
            systemType: a.systemType,
          };
          if (a.insulationType) obj.insulationType = a.insulationType;
          if (a.insulationThickness) obj.insulationThickness = a.insulationThickness;
          if (a.rValue != null) obj.rValue = a.rValue;
          if (a.surfaceType) obj.surfaceType = a.surfaceType;
          return obj;
        });
      await updateProject({
        projectId: projectId as any,
        roofAssemblies: cleanAssemblies as any,
      });
      setAssembliesDirty(false);
      setAsmSaved(true);
      setTimeout(() => setAsmSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save assemblies:", e);
    } finally {
      setAsmSaving(false);
    }
  };

  // ── Section 3: AI System Description ──
  const [description, setDescription] = useState("");
  const [descLoading, setDescLoading] = useState(false);
  const [descSaving, setDescSaving] = useState(false);
  const [descSaved, setDescSaved] = useState(false);

  useEffect(() => {
    if (project?.systemDescription) {
      setDescription(project.systemDescription);
    }
  }, [project]);

  const handleGenerateDescription = async () => {
    const rows = assemblies.filter((a) => a.systemType);
    if (rows.length === 0) return;
    setDescLoading(true);
    try {
      const res = await fetch("/api/bidshield/generate-system-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assemblies: rows.map((a) => ({
            label: a.label,
            systemType: a.systemType,
            insulationType: a.insulationType || undefined,
            insulationThickness: a.insulationThickness ? a.insulationThickness + "in" : undefined,
            rValue: a.rValue ?? undefined,
            surfaceType: a.surfaceType || undefined,
          })),
          deckType: info.deckType || undefined,
        }),
      });
      const data = await res.json();
      if (data.text) setDescription(data.text);
    } catch {
      // silent fail
    } finally {
      setDescLoading(false);
    }
  };

  const handleDescriptionSave = async () => {
    if (isDemo) return;
    setDescSaving(true);
    try {
      await updateProject({
        projectId: projectId as any,
        systemDescription: description,
      });
      setDescSaved(true);
      setTimeout(() => setDescSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save description:", e);
    } finally {
      setDescSaving(false);
    }
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    paddingRight: 28,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Project Info ── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>
            Project Information
          </h3>
          <div className="flex items-center gap-2">
            {infoSaved && <span style={{ fontSize: 12, color: "var(--bs-teal)" }}>Saved</span>}
            <button
              onClick={handleInfoSave}
              disabled={infoSaving || isDemo}
              style={{ ...btnPrimary, opacity: infoSaving ? 0.5 : 1 }}
            >
              {infoSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Project Name</label>
            <input
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              style={inputStyle}
              placeholder="e.g. Meridian Business Park"
            />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input
              value={info.location}
              onChange={(e) => setInfo({ ...info, location: e.target.value })}
              style={inputStyle}
              placeholder="e.g. Charlotte, NC"
            />
          </div>
          <div>
            <label style={labelStyle}>Bid Date</label>
            <input
              type="date"
              value={info.bidDate}
              onChange={(e) => setInfo({ ...info, bidDate: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>General Contractor</label>
            <input
              value={info.gc}
              onChange={(e) => setInfo({ ...info, gc: e.target.value })}
              style={inputStyle}
              placeholder="e.g. Skanska USA"
            />
          </div>
          <div>
            <label style={labelStyle}>Roof Area (SF)</label>
            <input
              type="number"
              value={info.sqft}
              onChange={(e) => setInfo({ ...info, sqft: e.target.value })}
              style={inputStyle}
              placeholder="e.g. 68000"
            />
          </div>
          <div>
            <label style={labelStyle}>Deck Type</label>
            <select
              value={info.deckType}
              onChange={(e) => setInfo({ ...info, deckType: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select...</option>
              {DECKS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Roof Assemblies ── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>
              Roof Assemblies
            </h3>
            <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>
              Define each roof area with its system, insulation, and surface type.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {asmSaved && <span style={{ fontSize: 12, color: "var(--bs-teal)" }}>Saved</span>}
            {assembliesDirty && (
              <button
                onClick={handleAssembliesSave}
                disabled={asmSaving || isDemo}
                style={{ ...btnPrimary, opacity: asmSaving ? 0.5 : 1 }}
              >
                {asmSaving ? "Saving..." : "Save Assemblies"}
              </button>
            )}
          </div>
        </div>

        {assemblies.length === 0 ? (
          <div
            className="text-center py-10 rounded-xl"
            style={{ border: "1px dashed var(--bs-border)", color: "var(--bs-text-dim)" }}
          >
            <p style={{ fontSize: 14, marginBottom: 12 }}>No assemblies defined yet.</p>
            <button onClick={addAssembly} style={btnSecondary}>
              + Add First Assembly
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid gap-2 px-3 pb-2 mb-1"
              style={{
                gridTemplateColumns: "70px 1fr 1fr 90px 70px 1fr 40px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--bs-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>Label</span>
              <span>System</span>
              <span>Insulation</span>
              <span>Thickness</span>
              <span>R-Value</span>
              <span>Surface</span>
              <span></span>
            </div>

            {/* Assembly rows */}
            {assemblies.map((a, idx) => (
              <div
                key={idx}
                className="grid gap-2 px-3 py-2.5 rounded-lg mb-1.5 items-center"
                style={{
                  gridTemplateColumns: "70px 1fr 1fr 90px 70px 1fr 40px",
                  background: "var(--bs-bg-card)",
                  border: "1px solid var(--bs-border)",
                }}
              >
                <input
                  value={a.label}
                  onChange={(e) => updateAssembly(idx, "label", e.target.value)}
                  className="font-bold"
                  style={{ ...inputStyle, padding: "4px 6px", fontWeight: 700, fontSize: 13, width: "100%", border: "none", background: "transparent" }}
                />
                <select
                  value={a.systemType}
                  onChange={(e) => updateAssembly(idx, "systemType", e.target.value)}
                  style={{ ...selectStyle, padding: "4px 6px", fontSize: 12 }}
                >
                  <option value="">Select...</option>
                  {SYSTEMS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={a.insulationType}
                  onChange={(e) => updateAssembly(idx, "insulationType", e.target.value)}
                  style={{ ...selectStyle, padding: "4px 6px", fontSize: 12 }}
                >
                  <option value="">None</option>
                  {INSULATION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <select
                  value={a.insulationThickness}
                  onChange={(e) => updateAssembly(idx, "insulationThickness", e.target.value)}
                  style={{ ...selectStyle, padding: "4px 6px", fontSize: 12 }}
                >
                  <option value="">—</option>
                  {THICKNESS_PRESETS.map((t) => (
                    <option key={t} value={t}>{t}&quot;</option>
                  ))}
                </select>
                <span
                  className="text-center font-semibold"
                  style={{
                    fontSize: 12,
                    color: a.rValue ? "var(--bs-teal)" : "var(--bs-text-dim)",
                    background: a.rValue ? "var(--bs-teal-dim)" : "transparent",
                    borderRadius: 6,
                    padding: "4px 0",
                  }}
                >
                  {a.rValue ? `R-${a.rValue}` : "—"}
                </span>
                <select
                  value={a.surfaceType}
                  onChange={(e) => updateAssembly(idx, "surfaceType", e.target.value)}
                  style={{ ...selectStyle, padding: "4px 6px", fontSize: 12 }}
                >
                  <option value="">Select...</option>
                  {SURFACE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeAssembly(idx)}
                  title="Remove assembly"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--bs-text-dim)",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 4,
                  }}
                >
                  &times;
                </button>
              </div>
            ))}

            <button
              onClick={addAssembly}
              className="mt-2"
              style={{ ...btnSecondary, fontSize: 12, padding: "6px 14px" }}
            >
              + Add Assembly
            </button>
          </>
        )}
      </div>

      {/* ── AI System Description ── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>
              System Description
            </h3>
            <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>
              AI-generated layer-by-layer description in manufacturer system letter format.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {descSaved && <span style={{ fontSize: 12, color: "var(--bs-teal)" }}>Saved</span>}
            <button
              onClick={handleGenerateDescription}
              disabled={descLoading || assemblies.filter((a) => a.systemType).length === 0}
              style={{
                ...btnSecondary,
                opacity: descLoading || assemblies.filter((a) => a.systemType).length === 0 ? 0.4 : 1,
              }}
            >
              {descLoading ? "Generating..." : description ? "Regenerate" : "Generate Description"}
            </button>
            {description && (
              <button
                onClick={handleDescriptionSave}
                disabled={descSaving || isDemo}
                style={{ ...btnPrimary, opacity: descSaving ? 0.5 : 1 }}
              >
                {descSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>

        {descLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg"
                style={{ height: 16, background: "var(--bs-bg-card)", width: `${90 - i * 15}%` }}
              />
            ))}
          </div>
        ) : description ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            style={{
              ...inputStyle,
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.6,
              resize: "vertical",
            }}
          />
        ) : (
          <div
            className="text-center py-8 rounded-xl"
            style={{ border: "1px dashed var(--bs-border)", color: "var(--bs-text-dim)" }}
          >
            <p style={{ fontSize: 13 }}>
              {assemblies.filter((a) => a.systemType).length === 0
                ? "Add assemblies above, then generate a system description."
                : "Click \"Generate Description\" to create a layer-by-layer system description."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
