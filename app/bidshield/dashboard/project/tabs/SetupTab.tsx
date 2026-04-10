"use client";

import { useState, useEffect, useCallback } from "react";
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
  name?: string;
  systemType: string;
  insulationType: string;
  insulationThickness: string;
  rValue: number | null;
  surfaceType: string;
  area: number | null;
  uValue: number | null;
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

export default function SetupTab({ project, projectId, isDemo, userId }: TabProps) {
  const updateProject = useMutation(api.bidshield.updateProject);
  const createTakeoffSection = useMutation(api.bidshield.createTakeoffSection);
  const initProjectMaterials = useMutation(api.bidshield.initProjectMaterials);

  // ── Section 1: Project Info ──
  const [info, setInfo] = useState({
    name: "",
    location: "",
    bidDate: "",
    gc: "",
    sqft: "",
    deckType: "",
    projectType: "",
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
      projectType: project.projectType || "",
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
        projectType: info.projectType || undefined,
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
  const [asmError, setAsmError] = useState("");

  useEffect(() => {
    if (!project) return;
    const ra = project.roofAssemblies as any[] | undefined;
    if (ra && ra.length > 0) {
      setAssemblies(
        ra.map((a: any) => ({
          label: a.label || "",
          name: a.name || undefined,
          systemType: a.systemType || "",
          insulationType: a.insulationType || "",
          insulationThickness: a.insulationThickness || "",
          rValue: a.rValue ?? null,
          surfaceType: a.surfaceType || "",
          area: a.area ?? null,
          uValue: a.uValue ?? null,
        }))
      );
    } else if (project.assemblies && project.assemblies.length > 0) {
      // Fallback: generate assembly rows from the legacy string array
      // (e.g. ["TPO", "SBS"]) when roofAssemblies hasn't been saved yet
      setAssemblies(
        project.assemblies.map((s: string, i: number) => ({
          label: `RT-${String(i + 1).padStart(2, "0")}`,
          systemType: s.toLowerCase(),
          insulationType: "",
          insulationThickness: "",
          rValue: null,
          surfaceType: "",
          area: null,
          uValue: null,
        }))
      );
    } else if (project.systemType) {
      // Last resort: create a single assembly from the project-level systemType
      setAssemblies([{
        label: "RT-01",
        systemType: project.systemType.toLowerCase(),
        insulationType: "",
        insulationThickness: "",
        rValue: null,
        surfaceType: "",
        area: project.sqft ?? project.grossRoofArea ?? null,
        uValue: null,
      }]);
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
        area: null,
        uValue: null,
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
    setAsmError("");
    try {
      const cleanAssemblies = assemblies
        .filter((a) => a.systemType)
        .map((a) => {
          const obj: Record<string, any> = {
            label: a.label,
            systemType: a.systemType,
          };
          if (a.name) obj.name = a.name;
          if (a.insulationType) obj.insulationType = a.insulationType;
          if (a.insulationThickness) obj.insulationThickness = a.insulationThickness;
          if (a.rValue != null) obj.rValue = a.rValue;
          if (a.surfaceType) obj.surfaceType = a.surfaceType;
          if (a.area != null) obj.area = a.area;
          if (a.uValue != null) obj.uValue = a.uValue;
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
      setAsmError("Failed to save — please redeploy Convex and try again.");
    } finally {
      setAsmSaving(false);
    }
  };

  // ── Section 3: Spec Extraction ──
  const [specMode, setSpecMode] = useState<"idle" | "upload" | "loading" | "done" | "error">("idle");
  const [specError, setSpecError] = useState("");
  const [specData, setSpecData] = useState<any>(null);
  const [specApplying, setSpecApplying] = useState(false);

  // Load saved spec summary from project
  useEffect(() => {
    if (project?.specSummary) {
      try {
        setSpecData(JSON.parse(project.specSummary));
        setSpecMode("done");
      } catch { /* ignore parse errors */ }
    }
  }, [project]);

  const handleSpecFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setSpecError("Please select a PDF file."); setSpecMode("error"); return; }
    if (file.size > 20 * 1024 * 1024) { setSpecError("File too large (max 20 MB)."); setSpecMode("error"); return; }
    setSpecMode("loading");
    setSpecError("");
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binary);
      const res = await fetch("/api/bidshield/extract-specification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setSpecError(data.error || "Extraction failed"); setSpecMode("error"); return; }
      setSpecData(data);
      setSpecMode("done");
      // Save the raw spec data to Convex so it persists across navigation
      if (!isDemo) {
        try {
          await updateProject({ projectId: projectId as any, specSummary: JSON.stringify(data) });
        } catch (e) {
          console.error("Failed to save spec data to project:", e);
          setSpecError("Spec extracted but failed to save — click Apply to retry.");
        }
      }
    } catch { setSpecError("Failed to read PDF."); setSpecMode("error"); }
  }, [isDemo, projectId, updateProject]);

  // Apply spec data to assemblies and project info
  const handleApplySpec = async () => {
    if (!specData || isDemo) return;
    setSpecApplying(true);
    try {
      const updates: Record<string, any> = { projectId: projectId as any };

      // Apply project info
      if (specData.projectInfo) {
        const pi = specData.projectInfo;
        if (pi.projectName && !info.name) { setInfo(prev => ({ ...prev, name: pi.projectName })); updates.name = pi.projectName; }
        if (pi.location && !info.location) { setInfo(prev => ({ ...prev, location: pi.location })); updates.location = pi.location; }
        if (pi.gc && !info.gc) { setInfo(prev => ({ ...prev, gc: pi.gc })); updates.gc = pi.gc; }
        if (pi.bidDate && !info.bidDate) { setInfo(prev => ({ ...prev, bidDate: pi.bidDate })); updates.bidDate = pi.bidDate; }
      }

      // Apply assemblies from spec (overwrite if current assemblies are just auto-generated placeholders)
      const hasRealAssemblies = assemblies.some(a => a.insulationType || a.name || a.rValue != null);
      if (specData.assemblies?.length > 0 && (!hasRealAssemblies || assemblies.length === 0)) {
        const mapped = specData.assemblies.map((a: any, i: number) => ({
          label: a.label || `RT-${String(i + 1).padStart(2, "0")}`,
          name: a.name || undefined,
          systemType: a.system || a.membrane?.type || "",
          insulationType: a.insulation?.type || "",
          insulationThickness: a.insulation?.thickness?.replace(/"/g, "").replace(/in$/, "") || "",
          rValue: a.insulation?.rValue ?? null,
          surfaceType: a.surfaceType || "",
          area: null as number | null,
          uValue: null as number | null,
        }));
        // Auto-compute R-values where missing
        mapped.forEach((m: any) => {
          if (!m.rValue && m.insulationType && m.insulationThickness) {
            m.rValue = computeInsulationRValue(m.insulationType, parseFloat(m.insulationThickness));
          }
        });
        setAssemblies(mapped);
        setAssembliesDirty(true);

        // Clean nulls for Convex
        const cleanAssemblies = mapped.map((a: any) => {
          const obj: Record<string, any> = { label: a.label, systemType: a.systemType };
          if (a.name) obj.name = a.name;
          if (a.insulationType) obj.insulationType = a.insulationType;
          if (a.insulationThickness) obj.insulationThickness = a.insulationThickness;
          if (a.rValue != null) obj.rValue = a.rValue;
          if (a.surfaceType) obj.surfaceType = a.surfaceType;
          return obj;
        });
        updates.roofAssemblies = cleanAssemblies;

        // Set deck type from first assembly
        const deckType = specData.assemblies.find((a: any) => a.deckType)?.deckType;
        if (deckType && !info.deckType) { setInfo(prev => ({ ...prev, deckType })); updates.deckType = deckType; }
      }

      // Apply performance/compliance flags
      if (specData.performance) {
        if (specData.performance.rValueRequired) updates.energyCode = true;
        if (specData.performance.climateZone) updates.climateZone = specData.performance.climateZone;
      }
      if (specData.warranty?.type === "NDL" || specData.performance?.windUplift?.includes("FM")) {
        updates.fmGlobal = true;
      }

      // Also ensure specSummary is saved (retry if auto-save after extraction failed)
      updates.specSummary = JSON.stringify(specData);

      // Save all updates at once
      if (Object.keys(updates).length > 1) {
        await updateProject(updates as any);
      }

      // Auto-create takeoff sections from assemblies
      if (specData.assemblies?.length > 0 && userId) {
        try {
          for (const a of specData.assemblies) {
            await createTakeoffSection({
              projectId: projectId as any,
              userId,
              name: a.name || a.label || "Roof Section",
              assemblyType: (a.system || a.membrane?.type || "").toUpperCase(),
              squareFeet: 0,
            });
          }
        } catch { /* takeoff sections may already exist */ }
      }

      // Initialize materials from templates + spec-extracted materials
      if (userId) {
        try {
          const { getTemplatesForSystem } = await import("@/lib/bidshield/material-templates");
          const systemTypes = specData.assemblies?.length > 0
            ? [...new Set(specData.assemblies.map((a: any) => a.system || a.membrane?.type || "").filter(Boolean))] as string[]
            : [];
          const templates = getTemplatesForSystem(systemTypes);

          // Build combined material list: templates + spec-extracted
          const unitMap: Record<string, string> = {
            membrane: "RL", insulation: "BD", fasteners: "BX",
            adhesive: "GL", sheet_metal: "LF", lumber: "LF",
            accessories: "EA", miscellaneous: "EA",
          };
          const allMaterials: Array<{
            templateKey?: string; category: string; name: string; unit: string;
            calcType: string; wasteFactor: number; coverage?: number;
            qtyPerSf?: number; takeoffItemType?: string; unitPrice?: number;
          }> = templates.map(t => ({
            templateKey: t.key,
            category: t.category,
            name: t.name,
            unit: t.unit,
            calcType: t.calcType,
            wasteFactor: t.wasteFactor,
            coverage: t.defaultCoverage,
            qtyPerSf: t.defaultQtyPerSf,
            takeoffItemType: t.takeoffItemType,
            unitPrice: t.defaultUnitPrice,
          }));

          // Add spec-extracted materials not covered by templates
          if (specData.materials?.length > 0) {
            const templateNames = new Set(allMaterials.map(m => m.name.toLowerCase()));
            for (const mat of specData.materials) {
              if (!mat.name || templateNames.has(mat.name.toLowerCase())) continue;
              const specName = mat.manufacturer && mat.manufacturer !== "as specified"
                ? `${mat.name} — ${mat.manufacturer}`
                : mat.name;
              allMaterials.push({
                category: mat.category || "miscellaneous",
                name: specName,
                unit: unitMap[mat.category] || "EA",
                calcType: "fixed",
                wasteFactor: 1.0,
              });
            }
          }

          if (allMaterials.length > 0) {
            await initProjectMaterials({
              projectId: projectId as any,
              userId,
              materials: allMaterials,
            });
          }
        } catch { /* materials may already exist */ }
      }
    } catch (e) {
      console.error("Failed to apply spec data:", e);
      setSpecError("Failed to apply spec data — Convex backend may need redeployment.");
    } finally {
      setSpecApplying(false);
    }
  };

  // ── Section 4: AI System Description ──
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
          <div>
            <label style={labelStyle}>Project Type</label>
            <select
              value={info.projectType}
              onChange={(e) => setInfo({ ...info, projectType: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select...</option>
              <option value="new_construction">New Construction</option>
              <option value="reroof">Re-Roof (Tear-off)</option>
              <option value="recover">Recover (Overlay)</option>
              <option value="repair">Repair</option>
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
            {asmError && <span style={{ fontSize: 12, color: "var(--bs-red, #ef4444)" }}>{asmError}</span>}
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
                gridTemplateColumns: "70px 1fr 1fr 90px 70px 90px 1fr 40px",
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
              <span>Area (SF)</span>
              <span>Surface</span>
              <span></span>
            </div>

            {/* Assembly rows */}
            {assemblies.map((a, idx) => (
              <div
                key={idx}
                className="grid gap-2 px-3 py-2.5 rounded-lg mb-1.5 items-center"
                style={{
                  gridTemplateColumns: "70px 1fr 1fr 90px 70px 90px 1fr 40px",
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
                <input
                  type="number"
                  value={a.area ?? ""}
                  onChange={(e) => updateAssembly(idx, "area", e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="—"
                  style={{ ...inputStyle, padding: "4px 6px", fontSize: 12, border: "none", background: "transparent", textAlign: "right" }}
                />
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

            {assemblies.some((a) => a.area) && (
              <div className="flex justify-end px-3 py-2 text-xs font-semibold" style={{ color: "var(--bs-teal)" }}>
                Total Area: {assemblies.reduce((sum, a) => sum + (a.area || 0), 0).toLocaleString()} SF
              </div>
            )}

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

      {/* ── Spec Extraction ── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>
              Specification Review
            </h3>
            <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>
              Upload a Division 07 spec PDF to auto-extract assemblies, materials, warranty, and compliance data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {specMode === "done" && specData && (
              <button
                onClick={handleApplySpec}
                disabled={specApplying || isDemo}
                style={{ ...btnPrimary, opacity: specApplying ? 0.5 : 1 }}
              >
                {specApplying ? "Applying..." : "Apply to Project"}
              </button>
            )}
            <button
              onClick={() => setSpecMode("upload")}
              style={btnSecondary}
            >
              {specMode === "done" ? "Re-upload Spec" : "Upload Spec PDF"}
            </button>
          </div>
        </div>

        {specMode === "upload" && (
          <div
            className="rounded-xl p-6 text-center mb-4"
            style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-card)" }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleSpecFile(f); }}
          >
            <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--bs-text-dim)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-xs mb-3" style={{ color: "var(--bs-text-muted)" }}>Drop a spec PDF or click to browse (Division 07 — Roofing)</p>
            <label className="inline-block text-xs font-medium px-4 py-2 rounded-lg cursor-pointer" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
              Choose File
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleSpecFile(f); }} />
            </label>
            <button onClick={() => setSpecMode("idle")} className="block mx-auto mt-2 text-xs" style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        )}

        {specMode === "loading" && (
          <div className="rounded-xl p-8 text-center" style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-card)" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="animate-spin w-5 h-5" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span className="text-sm font-medium" style={{ color: "var(--bs-teal)" }}>Analyzing specification...</span>
            </div>
            <p className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Extracting assemblies, warranty, materials, and compliance data</p>
          </div>
        )}

        {specMode === "error" && (
          <div className="rounded-xl p-4 text-center mb-4" style={{ border: "1px solid var(--bs-red-border)", background: "var(--bs-red-dim)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--bs-red)" }}>{specError}</p>
            <button onClick={() => setSpecMode("upload")} className="text-xs font-medium" style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try Again</button>
          </div>
        )}
        {specMode === "done" && specError && (
          <div className="rounded-xl p-3 mb-4" style={{ border: "1px solid var(--bs-red-border, #7f1d1d)", background: "var(--bs-red-dim, #1c0a0a)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--bs-red, #ef4444)" }}>{specError}</p>
          </div>
        )}

        {specMode === "done" && specData && (
          <div className="space-y-4">
            {/* Spec Sections */}
            {specData.specSections?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specData.specSections.map((s: any, i: number) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }}>
                    {s.csiNumber} — {s.title}
                  </span>
                ))}
              </div>
            )}

            {/* Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Warranty */}
              {specData.warranty && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Warranty</div>
                  <div className="text-sm font-bold" style={{ color: "var(--bs-teal)" }}>{specData.warranty.tier || `${specData.warranty.years}-yr ${specData.warranty.type}`}</div>
                  {specData.warranty.manufacturer && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{specData.warranty.manufacturer}</div>}
                  {specData.warranty.windSpeed && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{specData.warranty.windSpeed} wind</div>}
                </div>
              )}

              {/* Performance */}
              {specData.performance && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Performance</div>
                  {specData.performance.windUplift && <div className="text-sm font-bold" style={{ color: "var(--bs-text-primary)" }}>{specData.performance.windUplift}</div>}
                  {specData.performance.fireRating && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>Fire: {specData.performance.fireRating}</div>}
                  {specData.performance.rValueRequired && <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>R-{specData.performance.rValueRequired} min</div>}
                </div>
              )}

              {/* Assemblies Count */}
              {specData.assemblies?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Assemblies</div>
                  <div className="text-sm font-bold" style={{ color: "var(--bs-text-primary)" }}>{specData.assemblies.length} system{specData.assemblies.length !== 1 ? "s" : ""}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                    {[...new Set(specData.assemblies.map((a: any) => (a.system || a.membrane?.type || "").toUpperCase()))].filter(Boolean).join(", ")}
                  </div>
                </div>
              )}

              {/* Materials Count */}
              {specData.materials?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--bs-text-dim)" }}>Materials</div>
                  <div className="text-sm font-bold" style={{ color: "var(--bs-text-primary)" }}>{specData.materials.length} items</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                    {[...new Set(specData.materials.map((m: any) => m.category))].length} categories
                  </div>
                </div>
              )}
            </div>

            {/* Assemblies Detail */}
            {specData.assemblies?.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Assembly Details</div>
                <div className="space-y-2">
                  {specData.assemblies.map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-xs py-1.5" style={{ borderBottom: i < specData.assemblies.length - 1 ? "1px solid var(--bs-border)" : "none" }}>
                      <span className="font-bold shrink-0" style={{ color: "var(--bs-teal)", minWidth: 48 }}>{a.label || `RT-${String(i + 1).padStart(2, "0")}`}</span>
                      <div className="flex-1">
                        <div className="font-semibold" style={{ color: "var(--bs-text-primary)" }}>{a.name || (a.system || a.membrane?.type || "").toUpperCase()}</div>
                        <div className="mt-0.5" style={{ color: "var(--bs-text-muted)" }}>
                          {[
                            a.membrane && `${(a.membrane.type || "").toUpperCase()} ${a.membrane.thickness || ""}${a.membrane.manufacturer ? ` (${a.membrane.manufacturer})` : ""}`,
                            a.insulation && `${(a.insulation.type || "").replace("_", " ")} ${a.insulation.thickness || ""}${a.insulation.rValue ? ` R-${a.insulation.rValue}` : ""}`,
                            a.coverBoard,
                            a.vaporRetarder && `VR: ${a.vaporRetarder}`,
                            a.attachmentMethod && a.attachmentMethod.replace(/_/g, " "),
                          ].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials List */}
            {specData.materials?.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Specified Materials</div>
                <div className="space-y-1">
                  {specData.materials.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1" style={{ borderBottom: i < specData.materials.length - 1 ? "1px solid var(--bs-border)" : "none" }}>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-dim)", minWidth: 72, textAlign: "center" }}>{m.category}</span>
                      <span className="font-medium" style={{ color: "var(--bs-text-primary)" }}>{m.name}</span>
                      {m.manufacturer && <span style={{ color: "var(--bs-text-muted)" }}>— {m.manufacturer}</span>}
                      {m.spec && <span className="ml-auto shrink-0" style={{ color: "var(--bs-text-dim)", fontSize: 10 }}>{m.spec}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testing, Submittals, Scope in collapsible rows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {specData.testingRequirements?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Testing Required</div>
                  {specData.testingRequirements.map((t: any, i: number) => (
                    <div key={i} className="text-xs py-0.5" style={{ color: "var(--bs-text-muted)" }}>
                      <span className="font-medium" style={{ color: "var(--bs-text-secondary)" }}>{t.type?.replace(/_/g, " ")}</span>
                      {t.description && <span> — {t.description}</span>}
                    </div>
                  ))}
                </div>
              )}

              {specData.submittals?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Submittals</div>
                  {specData.submittals.map((s: string, i: number) => (
                    <div key={i} className="text-xs py-0.5" style={{ color: "var(--bs-text-muted)" }}>{s}</div>
                  ))}
                </div>
              )}

              {specData.scopeNotes?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Scope Notes</div>
                  {specData.scopeNotes.map((s: string, i: number) => (
                    <div key={i} className="text-xs py-0.5" style={{ color: "var(--bs-text-muted)" }}>{s}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Labor & Gen Conds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {specData.laborRequirements && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>Labor Requirements</div>
                  {specData.laborRequirements.laborType && (
                    <div className="text-xs py-0.5"><span className="font-medium" style={{ color: "var(--bs-text-secondary)" }}>Type:</span> <span style={{ color: "var(--bs-text-muted)" }}>{specData.laborRequirements.laborType.replace(/_/g, " ")}</span></div>
                  )}
                  {specData.laborRequirements.certifiedInstaller && (
                    <div className="text-xs py-0.5" style={{ color: "var(--bs-amber)" }}>Certified installer required</div>
                  )}
                  {specData.laborRequirements.manufacturerTraining && (
                    <div className="text-xs py-0.5" style={{ color: "var(--bs-amber)" }}>Manufacturer training required</div>
                  )}
                </div>
              )}

              {specData.generalConditions?.length > 0 && (
                <div className="rounded-lg p-3" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>General Conditions</div>
                  {specData.generalConditions.map((gc: any, i: number) => (
                    <div key={i} className="text-xs py-0.5" style={{ color: "var(--bs-text-muted)" }}>
                      <span className="font-medium" style={{ color: "var(--bs-text-secondary)" }}>{gc.item}</span>
                      {gc.description && <span> — {gc.description}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Manufacturers */}
            {specData.approvedManufacturers?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--bs-text-dim)" }}>Approved:</span>
                {specData.approvedManufacturers.map((m: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}>{m}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {specMode === "idle" && !specData && (
          <div
            className="text-center py-8 rounded-xl"
            style={{ border: "1px dashed var(--bs-border)", color: "var(--bs-text-dim)" }}
          >
            <svg className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm mb-1">No specification uploaded yet.</p>
            <p className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Upload a Division 07 spec to auto-extract warranty, materials, and compliance data.</p>
          </div>
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
