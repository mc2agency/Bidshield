"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useProGate } from "@/hooks/useProGate";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import {
  INSULATION_TYPES,
  SURFACE_TYPES,
  computeInsulationRValue,
} from "@/lib/bidshield/insulation-data";
import { ThicknessInput } from "@/components/bidshield/ThicknessInput";
import { PlanDiffModal, TakeoffDiffModal } from "@/components/bidshield/AssemblyDiffModal";
import {
  computePlanDiff,
  computeTakeoffDiff,
  applyPlanDiff,
  applyTakeoffDiff,
  type PlanDiff,
  type TakeoffDiff,
  type SetupAssembly,
} from "@/lib/bidshield/assembly-diff";

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
  { id: "plank", label: "Plank Deck (Precast / Cementitious)" },
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

// Extractor layer fields can arrive as plain strings OR as structured objects
// ({product, manufacturer, ...}) depending on which spec shape the model
// chose. Collapse to a display string; objects expose `product`/`name`/`label`
// most of the time. Booleans (e.g. vaporRetarder: true) become "Vapor Retarder".
function renderLayerField(v: unknown): string {
  if (v == null || v === false) return "";
  if (v === true) return "Vapor Retarder";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.product ?? o.name ?? o.label ?? o.type ?? "");
  }
  return "";
}

// Avoids the "undefined-yr ..." bug when the extractor can't parse a specific
// warranty year but still knows the type (e.g. "No Dollar Limit"). Prefer
// `tier` (e.g. "30-yr NDL"), then years+type, then type alone.
function formatWarrantyHeadline(w: { tier?: string | null; years?: number | null; type?: string | null }): string {
  if (w.tier) return w.tier;
  const hasYears = typeof w.years === "number" && w.years > 0;
  const type = w.type || "";
  if (hasYears && type) return `${w.years}-yr ${type}`;
  if (hasYears) return `${w.years}-yr`;
  return type || "—";
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
  const { proGateModal, guardedFetch } = useProGate();
  // @ts-ignore TS2589: Convex API generics hit type-depth limit with Zod v4
  const updateProject = useMutation(api.bidshield.updateProject);
  const createTakeoffSection = useMutation(api.bidshield.createTakeoffSection);
  const initProjectMaterials = useMutation(api.bidshield.initProjectMaterials);
  const clearProjectMaterials = useMutation(api.bidshield.clearProjectMaterials);
  const syncTakeoffToMaterials = useMutation(api.bidshield.syncTakeoffToMaterials);
  const isValidConvexId = !isDemo && !!projectId && !projectId.startsWith("demo_");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");

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
      });
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save project info:", e);
      setAreaWarning("Failed to save project info. Please try again.");
      setTimeout(() => setAreaWarning(null), 4000);
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
  const [areaWarning, setAreaWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    if (project.roofAssemblies && project.roofAssemblies.length > 0) {
      setAssemblies(
        project.roofAssemblies.map((a: any) => ({
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
        if (insType && thickness) {
          const computed = computeInsulationRValue(insType, thickness);
          if (computed) {
            row.rValue = computed;
          } else {
            row.rValue = null;
            setAreaWarning(`Could not calculate R-value for ${insType} at ${thickness}″. You can enter it manually.`);
            setTimeout(() => setAreaWarning(null), 4000);
          }
        } else {
          row.rValue = null;
        }
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
    const label = assemblies[idx]?.label || `Assembly ${idx + 1}`;
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;
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

      // Auto-create takeoff sections for assemblies that don't already have one
      if (userId && cleanAssemblies.length > 0) {
        try {
          const existingSectionNames = new Set((takeoffSections || []).map((s: any) => s.name));
          for (const asm of cleanAssemblies) {
            const sectionName = asm.name || asm.label || "Roof Section";
            // Only create if this section name doesn't already exist
            if (!existingSectionNames.has(sectionName)) {
              await createTakeoffSection({
                projectId: projectId as any,
                userId,
                name: sectionName,
                assemblyType: (asm.systemType || "").toUpperCase(),
                squareFeet: 0,
              });
            }
          }
        } catch (err) {
          // Takeoff sections may already exist or other error — log but don't fail the save
          console.warn("Warning: could not auto-create takeoff sections:", err);
        }
      }

      setAssembliesDirty(false);
      setAsmSaved(true);
      setTimeout(() => setAsmSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save assemblies:", e);
      setAsmError("Failed to save — please redeploy Convex and try again.");
      setAreaWarning("Failed to save assemblies. Please try again.");
      setTimeout(() => setAreaWarning(null), 4000);
    } finally {
      setAsmSaving(false);
    }
  };

  // ── Section 3: Spec Extraction ──
  const [specMode, setSpecMode] = useState<"idle" | "upload" | "loading" | "done" | "error">("idle");
  const [specError, setSpecError] = useState("");
  const [specData, setSpecData] = useState<any>(null);
  const [specApplying, setSpecApplying] = useState(false);
  const [appliedMaterialCount, setAppliedMaterialCount] = useState(0);
  const [appliedSectionCount, setAppliedSectionCount] = useState(0);
  // Multi-spec support: track all uploaded specs for this project
  const projectSpecs = useQuery(
    api.bidshield.projectSpecs.listByProject,
    !isDemo && projectId && userId
      ? { projectId: projectId as Id<"bidshield_projects">, userId }
      : "skip",
  );
  const addProjectSpecMut = useMutation(api.bidshield.projectSpecs.addProjectSpec);
  const deleteProjectSpecMut = useMutation(api.bidshield.projectSpecs.deleteProjectSpec);
  const updateProjectSpecMut = useMutation(api.bidshield.projectSpecs.updateProjectSpec);
  const [pendingLabel, setPendingLabel] = useState<string>("");
  const [pendingSourceType, setPendingSourceType] = useState<
    "base_spec" | "addendum" | "related_division" | "other"
  >("base_spec");

  // When the project has multiple specs (base + related division, addenda, etc.)
  // the Specification Review card drives its detail block off whichever tab
  // is active. Default to the base_spec, fall back to first uploaded.
  const [activeSpecId, setActiveSpecId] = useState<Id<"bidshield_project_specs"> | null>(null);

  useEffect(() => {
    if (!projectSpecs || projectSpecs.length === 0) return;
    if (activeSpecId && projectSpecs.some((s) => s._id === activeSpecId)) return;
    const base = projectSpecs.find((s) => s.sourceType === "base_spec");
    setActiveSpecId((base ?? projectSpecs[0])._id);
  }, [projectSpecs, activeSpecId]);

  // Re-parse the active spec's extractionJson into specData whenever the tab
  // changes. Leaves single-spec flow (no tab row) unaffected because the
  // uploaded-spec auto-parse on line 1 of this effect also handles that case.
  useEffect(() => {
    if (!projectSpecs || projectSpecs.length === 0) {
      if (project?.specSummary) {
        try {
          setSpecData(JSON.parse(project.specSummary));
          setSpecMode("done");
        } catch { /* ignore parse errors */ }
      }
      return;
    }
    const active = projectSpecs.find((s) => s._id === activeSpecId) ?? projectSpecs[0];
    if (!active) return;
    try {
      setSpecData(JSON.parse(active.extractionJson));
      setSpecMode("done");
    } catch { /* ignore parse errors */ }
  }, [projectSpecs, activeSpecId, project?.specSummary]);

  // Shared helper: apply spec data (accepts data param so it works before setState is flushed)
  const runApplySpec = useCallback(async (data: any) => {
    if (!data || isDemo) return;
    setSpecApplying(true);
    try {
      const updates: Record<string, any> = { projectId: projectId as any };

      // Apply project info
      if (data.projectInfo) {
        const pi = data.projectInfo;
        if (pi.projectName && !info.name) { setInfo(prev => ({ ...prev, name: pi.projectName })); updates.name = pi.projectName; }
        if (pi.location && !info.location) { setInfo(prev => ({ ...prev, location: pi.location })); updates.location = pi.location; }
        if (pi.gc && !info.gc) { setInfo(prev => ({ ...prev, gc: pi.gc })); updates.gc = pi.gc; }
        if (pi.bidDate && !info.bidDate) { setInfo(prev => ({ ...prev, bidDate: pi.bidDate })); updates.bidDate = pi.bidDate; }
      }

      // Apply assemblies from spec (overwrite if current assemblies are just auto-generated placeholders)
      const hasRealAssemblies = assemblies.some(a => a.insulationType || a.name || a.rValue != null);
      const specAssemblies = Array.isArray(data.assemblies) ? data.assemblies : [];
      if (specAssemblies.length > 0 && (!hasRealAssemblies || assemblies.length === 0)) {
        const mapped = specAssemblies.map((a: any, i: number) => {
          // AI can return rValue as string — coerce to number, reject NaN
          const rawR = a.insulation?.rValue;
          const parsedR = typeof rawR === "number" ? rawR : typeof rawR === "string" ? parseFloat(rawR) : null;
          return {
            label: a.label || `RT-${String(i + 1).padStart(2, "0")}`,
            name: a.name || undefined,
            systemType: a.system || a.membrane?.type || "",
            insulationType: a.insulation?.type || "",
            insulationThickness: a.insulation?.thickness?.replace(/"/g, "").replace(/in$/, "") || "",
            rValue: (parsedR != null && !isNaN(parsedR)) ? parsedR : null,
            surfaceType: a.surfaceType || "",
            area: null as number | null,
            uValue: null as number | null,
          };
        });
        // Auto-compute R-values where missing
        mapped.forEach((m: any) => {
          if (!m.rValue && m.insulationType && m.insulationThickness) {
            m.rValue = computeInsulationRValue(m.insulationType, parseFloat(m.insulationThickness));
          }
        });
        setAssemblies(mapped);
        setAssembliesDirty(true);

        // Clean nulls for Convex — filter out assemblies with no system type
        const cleanAssemblies = mapped
          .filter((a: any) => a.systemType)
          .map((a: any) => {
            const obj: Record<string, any> = { label: a.label, systemType: a.systemType };
            if (a.name) obj.name = a.name;
            if (a.insulationType) obj.insulationType = a.insulationType;
            if (a.insulationThickness) obj.insulationThickness = a.insulationThickness;
            if (a.rValue != null && typeof a.rValue === "number") obj.rValue = a.rValue;
            if (a.surfaceType) obj.surfaceType = a.surfaceType;
            return obj;
          });
        if (cleanAssemblies.length > 0) updates.roofAssemblies = cleanAssemblies;

        // Set deck type from first assembly
        const deckType = specAssemblies.find((a: any) => a.deckType)?.deckType;
        if (deckType && !info.deckType) { setInfo(prev => ({ ...prev, deckType })); updates.deckType = deckType; }
      }

      // Apply performance/compliance flags
      if (data.performance) {
        if (data.performance.rValueRequired) updates.energyCode = true;
        if (data.performance.climateZone) updates.climateZone = data.performance.climateZone;
      }
      if (data.warranty?.type === "NDL" || data.performance?.windUplift?.includes("FM")) {
        updates.fmGlobal = true;
      }

      // Also ensure specSummary is saved (retry if auto-save after extraction failed)
      const specSummaryStr = JSON.stringify(data);
      updates.specSummary = specSummaryStr.length > 500_000 ? specSummaryStr.slice(0, 500_000) : specSummaryStr;

      // Save all updates at once
      if (Object.keys(updates).length > 1) {
        await updateProject(updates as any);
      }

      // Auto-create takeoff sections from assemblies
      const sectionCount = data.assemblies?.length ?? 0;
      if (sectionCount > 0 && userId) {
        try {
          for (const a of data.assemblies) {
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

      // Initialize materials: spec-extracted materials are PRIMARY, templates fill gaps
      if (userId) {
        try {
          const { getTemplatesForSystem } = await import("@/lib/bidshield/material-templates");
          const systemTypes = data.assemblies?.length > 0
            ? [...new Set(data.assemblies.map((a: any) => a.system || a.membrane?.type || "").filter(Boolean))] as string[]
            : [];
          const templates = getTemplatesForSystem(systemTypes);

          const unitMap: Record<string, string> = {
            membrane: "RL", insulation: "BD", fasteners: "BX",
            adhesive: "GL", sheet_metal: "LF", lumber: "LF",
            accessories: "EA", miscellaneous: "EA",
          };
          const allMaterials: Array<{
            templateKey?: string; category: string; name: string; unit: string;
            calcType: string; wasteFactor: number; coverage?: number;
            qtyPerSf?: number; takeoffItemType?: string; unitPrice?: number;
          }> = [];

          // Determine if project uses mechanical fastening (skip fasteners for adhered/concrete)
          const attachMethods = (data.assemblies ?? []).map((a: any) => a.attachmentMethod).filter(Boolean);
          const deckTypes = (data.assemblies ?? []).map((a: any) => a.deckType).filter(Boolean);
          const isMechanicallyAttached = attachMethods.some((m: string) => m.includes("mechanic"));
          const hasConcreteDeck = deckTypes.some((d: string) => d.toLowerCase().includes("concrete"));
          const skipFasteners = !isMechanicallyAttached || hasConcreteDeck;

          // 1. Add spec-extracted materials FIRST — these are what the actual project requires
          const usedTemplateKeys = new Set<string>();
          if (data.materials?.length > 0) {
            for (const mat of data.materials) {
              if (!mat.name) continue;
              // Skip fastener materials for adhered/concrete systems
              if (skipFasteners && mat.category === "fasteners") continue;
              // Use actual product name from spec field if available (e.g. "Paradene 20TG, 80mil..." → "Paradene 20TG")
              const productName = mat.spec?.match(/^([A-Z][A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-\.]+){0,3})/)?.[1];
              const baseName = productName && !productName.startsWith("ASTM") ? productName : mat.name;
              const specName = mat.manufacturer && mat.manufacturer !== "as specified"
                ? `${baseName} — ${mat.manufacturer}`
                : baseName;
              const cat = mat.category || "miscellaneous";
              // Fuzzy-match against template catalog to inherit pricing + calc logic
              const nameWords = mat.name.toLowerCase().split(/\s+/);
              const matchedTemplate = templates.find(t =>
                t.category === cat &&
                nameWords.some((w: string) => w.length > 3 && t.name.toLowerCase().includes(w))
              );
              if (matchedTemplate) usedTemplateKeys.add(matchedTemplate.key);
              allMaterials.push({
                templateKey: matchedTemplate?.key,
                category: cat,
                name: specName,
                unit: matchedTemplate?.unit || unitMap[cat] || "EA",
                calcType: matchedTemplate?.calcType || "fixed",
                wasteFactor: matchedTemplate?.wasteFactor || 1.0,
                coverage: matchedTemplate?.defaultCoverage,
                qtyPerSf: matchedTemplate?.defaultQtyPerSf,
                takeoffItemType: matchedTemplate?.takeoffItemType,
                unitPrice: matchedTemplate?.defaultUnitPrice,
              });
            }
          }

          // No template gap-fill — only spec-extracted materials are added.
          // Users can add additional items manually via "+ Add Material".

          if (allMaterials.length > 0) {
            // Clear old materials before re-initializing from spec
            try {
              await clearProjectMaterials({ projectId: projectId as any, userId });
            } catch { /* may not have any to clear */ }
            await initProjectMaterials({
              projectId: projectId as any,
              userId,
              materials: allMaterials,
            });
            // Auto-calculate quantities from takeoff data (coverage, qty/SF, linear, count)
            // This computes quantity × unitPrice = totalCost for all materials
            try {
              await syncTakeoffToMaterials({
                projectId: projectId as any,
                userId,
              });
            } catch { /* takeoff data may not exist yet — quantities will sync when takeoff is filled in */ }
          }

          // Update applied counts for confirmation banner
          setAppliedMaterialCount(allMaterials.length);
          setAppliedSectionCount(sectionCount);
        } catch { /* materials may already exist */ }
      }
    } catch (e: any) {
      console.error("Failed to apply spec data:", e);
      const detail = e?.message || e?.data || "Unknown error";
      setSpecError(`Failed to apply spec data: ${detail}`);
    } finally {
      setSpecApplying(false);
    }
  }, [isDemo, projectId, info, assemblies, userId, updateProject, createTakeoffSection, clearProjectMaterials, initProjectMaterials, syncTakeoffToMaterials, computeInsulationRValue]);

  // Apply spec data to assemblies and project info (thin wrapper for manual re-apply)
  const handleApplySpec = async () => {
    if (!specData || isDemo) return;
    await runApplySpec(specData);
  };

  const handleSpecFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setSpecError("Please select a PDF file."); setSpecMode("error"); return; }
    if (file.size > 20 * 1024 * 1024) { setSpecError("File too large (max 20 MB)."); setSpecMode("error"); return; }
    setSpecMode("loading");
    setSpecError("");
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      // Use FileReader-based approach to avoid btoa/spread stack overflow on large PDFs
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // result is "data:application/pdf;base64,<data>" — strip the prefix
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(new Blob([bytes], { type: "application/pdf" }));
      });
      const res = await guardedFetch("/api/bidshield/extract-specification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok || data.error) { setSpecError(data.error || "Extraction failed"); setSpecMode("error"); return; }
      setSpecData(data);
      setSpecMode("done");
      // Save the raw spec data to Convex so it persists across navigation
      if (!isDemo) {
        try {
          const summaryStr = JSON.stringify(data);
          const specSummary = summaryStr.length > 500_000 ? summaryStr.slice(0, 500_000) : summaryStr;
          await updateProject({ projectId: projectId as any, specSummary } as any);
        } catch (e: any) {
          console.error("Failed to save spec data to project:", e);
          const detail = e?.message || e?.data || "Unknown error";
          setSpecError(`Spec extracted but failed to save (${detail}) — click Apply to retry.`);
        }
        // Persist as a project_spec row (multi-spec support)
        if (userId) {
          try {
            const existingCount = projectSpecs?.length ?? 0;
            const defaultLabel =
              pendingLabel.trim() ||
              (existingCount === 0 ? "Base Spec" : `Spec ${existingCount + 1} — ${file.name}`);
            await addProjectSpecMut({
              projectId: projectId as Id<"bidshield_projects">,
              userId,
              label: defaultLabel,
              sourceType: existingCount === 0 ? "base_spec" : pendingSourceType,
              filename: file.name,
              extractionJson: JSON.stringify(data),
            });
            setPendingLabel("");
            setPendingSourceType("other");
          } catch (e) {
            console.error("Failed to add project spec row:", e);
          }
        }
      }
      // Auto-apply spec to project immediately (non-fatal — spec data is already saved)
      try {
        await runApplySpec(data);
      } catch (e) {
        console.error('Auto-apply failed:', e);
      }
    } catch { setSpecError("Failed to read PDF."); setSpecMode("error"); }
  }, [isDemo, projectId, updateProject, userId, projectSpecs, pendingLabel, pendingSourceType, addProjectSpecMut, runApplySpec]);

  // ── Section 2b: Re-ingest roof assemblies (Change 3a / 3b / 3c) ──
  const addDecision = useMutation(api.bidshield.addDecision);
  const [planDiff, setPlanDiff] = useState<PlanDiff | null>(null);
  const [planDiffFilename, setPlanDiffFilename] = useState("");
  const [planIngestLoading, setPlanIngestLoading] = useState(false);
  const [planIngestApplying, setPlanIngestApplying] = useState(false);
  const [takeoffDiff, setTakeoffDiff] = useState<TakeoffDiff | null>(null);
  const [takeoffDiffFilename, setTakeoffDiffFilename] = useState("");
  const [takeoffIngestLoading, setTakeoffIngestLoading] = useState(false);
  const [takeoffIngestApplying, setTakeoffIngestApplying] = useState(false);
  const [takeoffAddUnmatched, setTakeoffAddUnmatched] = useState<Set<string>>(new Set());
  const [reingestError, setReingestError] = useState<string | null>(null);
  const [reingestToast, setReingestToast] = useState<string | null>(null);

  const pdfToBase64 = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(new Blob([bytes], { type: "application/pdf" }));
    });
  }, []);

  const handleExtractFromPlan = useCallback(async (file: File) => {
    if (isDemo) return;
    if (file.type !== "application/pdf") { setReingestError("Please select a PDF file."); return; }
    if (file.size > 20 * 1024 * 1024) { setReingestError("File too large (max 20 MB)."); return; }
    setReingestError(null);
    setPlanIngestLoading(true);
    try {
      const base64 = await pdfToBase64(file);
      const res = await guardedFetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, mode: "detail" }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok || data.error) { setReingestError(data.error || "Extraction failed"); return; }
      const extracted = Array.isArray(data.assemblies) ? data.assemblies : [];
      const currentSetup: SetupAssembly[] = assemblies.map((a) => ({
        label: a.label,
        name: a.name,
        systemType: a.systemType,
        insulationType: a.insulationType,
        insulationThickness: a.insulationThickness,
        rValue: a.rValue,
        surfaceType: a.surfaceType,
        area: a.area,
        uValue: a.uValue,
      }));
      setPlanDiff(computePlanDiff(currentSetup, extracted));
      setPlanDiffFilename(file.name);
    } catch (e: any) {
      setReingestError(e?.message || "Failed to read PDF.");
    } finally {
      setPlanIngestLoading(false);
    }
  }, [assemblies, guardedFetch, isDemo, pdfToBase64]);

  const handleMergeTakeoff = useCallback(async (file: File) => {
    if (isDemo) return;
    if (file.type !== "application/pdf") { setReingestError("Please select a PDF file."); return; }
    if (file.size > 20 * 1024 * 1024) { setReingestError("File too large (max 20 MB)."); return; }
    setReingestError(null);
    setTakeoffIngestLoading(true);
    try {
      const base64 = await pdfToBase64(file);
      const res = await guardedFetch("/api/bidshield/extract-assemblies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64, mode: "takeoff" }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok || data.error) { setReingestError(data.error || "Extraction failed"); return; }
      const consolidated = Array.isArray(data.assemblies) ? data.assemblies : [];
      const currentSetup: SetupAssembly[] = assemblies.map((a) => ({
        label: a.label,
        name: a.name,
        systemType: a.systemType,
        insulationType: a.insulationType,
        insulationThickness: a.insulationThickness,
        rValue: a.rValue,
        surfaceType: a.surfaceType,
        area: a.area,
        uValue: a.uValue,
      }));
      setTakeoffDiff(computeTakeoffDiff(currentSetup, consolidated));
      setTakeoffDiffFilename(file.name);
      setTakeoffAddUnmatched(new Set());
    } catch (e: any) {
      setReingestError(e?.message || "Failed to read PDF.");
    } finally {
      setTakeoffIngestLoading(false);
    }
  }, [assemblies, guardedFetch, isDemo, pdfToBase64]);

  const persistAssembliesAndLog = useCallback(async (
    next: SetupAssembly[],
    decisionText: string,
  ) => {
    const payload = next
      .filter((a) => a.systemType || a.name)
      .map((a) => ({
        label: a.label,
        name: a.name || undefined,
        systemType: a.systemType || "",
        insulationType: a.insulationType || undefined,
        insulationThickness: a.insulationThickness || undefined,
        rValue: a.rValue ?? undefined,
        surfaceType: a.surfaceType || undefined,
        area: a.area ?? undefined,
        uValue: a.uValue ?? undefined,
      }));
    await updateProject({ projectId: projectId as any, roofAssemblies: payload } as any);
    setAssemblies(next.map((a) => ({
      label: a.label,
      name: a.name,
      systemType: a.systemType || "",
      insulationType: a.insulationType || "",
      insulationThickness: a.insulationThickness || "",
      rValue: a.rValue ?? null,
      surfaceType: a.surfaceType || "",
      area: a.area ?? null,
      uValue: a.uValue ?? null,
    })));
    setAssembliesDirty(false);
    if (userId) {
      try {
        await addDecision({
          projectId: projectId as any,
          userId,
          text: decisionText,
          section: "Setup",
        });
      } catch (e) {
        console.error("Failed to write decision log:", e);
      }
    }
  }, [updateProject, projectId, userId, addDecision]);

  const applyPlanDiffNow = useCallback(async () => {
    if (!planDiff) return;
    setPlanIngestApplying(true);
    try {
      const currentSetup: SetupAssembly[] = assemblies.map((a) => ({ ...a } as SetupAssembly));
      const next = applyPlanDiff(currentSetup, planDiff);
      const newCount = planDiff.rows.filter((r) => r.op === "new").length;
      const changedCount = planDiff.rows.filter((r) => r.op === "changed").length;
      const summary = planDiff.applyCount === 0
        ? `Re-extracted roof assemblies from ${planDiffFilename} — no changes (plan matches current Setup)`
        : `Re-extracted roof assemblies from ${planDiffFilename} — ${newCount} added, ${changedCount} changed`;
      await persistAssembliesAndLog(next, summary);
      setReingestToast(planDiff.applyCount === 0 ? "No changes — Setup already matches the plan" : `${planDiff.applyCount} assemblies updated from ${planDiffFilename}`);
      setTimeout(() => setReingestToast(null), 4000);
      setPlanDiff(null);
    } catch (e: any) {
      setReingestError(e?.message || "Failed to apply changes.");
    } finally {
      setPlanIngestApplying(false);
    }
  }, [planDiff, planDiffFilename, assemblies, persistAssembliesAndLog]);

  const applyTakeoffDiffNow = useCallback(async () => {
    if (!takeoffDiff) return;
    setTakeoffIngestApplying(true);
    try {
      const currentSetup: SetupAssembly[] = assemblies.map((a) => ({ ...a } as SetupAssembly));
      const next = applyTakeoffDiff(currentSetup, takeoffDiff, takeoffAddUnmatched);
      const changedCount = takeoffDiff.applyCount;
      const addedCount = takeoffAddUnmatched.size;
      const summary = (changedCount === 0 && addedCount === 0)
        ? `Merged takeoff from ${takeoffDiffFilename} — no changes (areas already match)`
        : `Merged takeoff from ${takeoffDiffFilename} — ${changedCount} area${changedCount === 1 ? "" : "s"} updated${addedCount > 0 ? `, ${addedCount} added` : ""} — total ${Math.round(takeoffDiff.totalArea).toLocaleString()} SF`;
      await persistAssembliesAndLog(next, summary);
      setReingestToast(summary);
      setTimeout(() => setReingestToast(null), 4000);
      setTakeoffDiff(null);
      setTakeoffAddUnmatched(new Set());
    } catch (e: any) {
      setReingestError(e?.message || "Failed to apply changes.");
    } finally {
      setTakeoffIngestApplying(false);
    }
  }, [takeoffDiff, takeoffDiffFilename, assemblies, takeoffAddUnmatched, persistAssembliesAndLog]);

  const toggleUnmatched = useCallback((tag: string) => {
    setTakeoffAddUnmatched((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  // File input refs for the two re-ingest buttons
  const planInputRef = useRef<HTMLInputElement>(null);
  const takeoffInputRef = useRef<HTMLInputElement>(null);

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
      const res = await guardedFetch("/api/bidshield/generate-system-description", {
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
      if (!res) return;
      const data = await res.json();
      if (data.text) setDescription(data.text);
    } catch (err) {
      setAreaWarning("Failed to generate system description. Check your connection and try again.");
      setTimeout(() => setAreaWarning(null), 5000);
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
      {proGateModal}
      {planDiff && (
        <PlanDiffModal
          filename={planDiffFilename}
          diff={planDiff}
          applying={planIngestApplying}
          onCancel={() => setPlanDiff(null)}
          onApply={applyPlanDiffNow}
        />
      )}
      {takeoffDiff && (
        <TakeoffDiffModal
          filename={takeoffDiffFilename}
          diff={takeoffDiff}
          addUnmatched={takeoffAddUnmatched}
          onToggleUnmatched={toggleUnmatched}
          applying={takeoffIngestApplying}
          onCancel={() => { setTakeoffDiff(null); setTakeoffAddUnmatched(new Set()); }}
          onApply={applyTakeoffDiffNow}
        />
      )}
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
        <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>
              Roof Assemblies
            </h3>
            <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>
              Define each roof area with its system, insulation, and surface type.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {asmSaved && <span style={{ fontSize: 12, color: "var(--bs-teal)" }}>Saved</span>}
            {asmError && <span style={{ fontSize: 12, color: "var(--bs-red, #ef4444)" }}>{asmError}</span>}
            <button
              onClick={() => planInputRef.current?.click()}
              disabled={planIngestLoading || isDemo}
              style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px", opacity: planIngestLoading ? 0.5 : 1 }}
              title="Extract assemblies from an architectural detail sheet PDF"
            >
              {planIngestLoading ? "Reading plan…" : "Extract from plan PDF"}
            </button>
            <button
              onClick={() => takeoffInputRef.current?.click()}
              disabled={takeoffIngestLoading || isDemo}
              style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px", opacity: takeoffIngestLoading ? 0.5 : 1 }}
              title="Merge areas from an envelope takeoff schedule PDF"
            >
              {takeoffIngestLoading ? "Reading takeoff…" : "Merge takeoff PDF"}
            </button>
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

        {/* Hidden file inputs for the re-ingest buttons */}
        <input
          ref={planInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExtractFromPlan(f); if (planInputRef.current) planInputRef.current.value = ""; }}
        />
        <input
          ref={takeoffInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMergeTakeoff(f); if (takeoffInputRef.current) takeoffInputRef.current.value = ""; }}
        />

        {reingestError && (
          <div className="rounded-lg p-2.5 mb-3" style={{ background: "var(--bs-red-dim)", border: "1px solid var(--bs-red-border)" }}>
            <span className="text-xs" style={{ color: "var(--bs-red)" }}>{reingestError}</span>
          </div>
        )}
        {reingestToast && (
          <div className="rounded-lg p-2.5 mb-3" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
            <span className="text-xs" style={{ color: "var(--bs-teal)" }}>{reingestToast}</span>
          </div>
        )}

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
                <ThicknessInput
                  value={a.insulationThickness || ""}
                  onChange={(v) => updateAssembly(idx, "insulationThickness", v)}
                  compact
                />
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

            {assemblies.some((a) => a.area) && (() => {
              const totalAssemblyArea = assemblies.reduce((sum, a) => sum + (a.area || 0), 0);
              const grossArea = info.sqft ? parseInt(info.sqft) : 0;
              const delta = grossArea > 0 ? Math.abs(totalAssemblyArea - grossArea) / grossArea : 0;
              const hasAreaMismatch = grossArea > 0 && delta > 0.05;
              return (
                <div className="px-3 py-2">
                  <div className="flex justify-end text-xs font-semibold" style={{ color: "var(--bs-teal)" }}>
                    Total Area: {totalAssemblyArea.toLocaleString()} SF
                    {grossArea > 0 && (
                      <span style={{ color: hasAreaMismatch ? "#e53e3e" : "var(--bs-text-dim)", marginLeft: 12 }}>
                        Gross: {grossArea.toLocaleString()} SF ({delta > 0 ? (delta * 100).toFixed(1) : "0"}% {totalAssemblyArea > grossArea ? "over" : "under"})
                      </span>
                    )}
                  </div>
                  {hasAreaMismatch && (
                    <div style={{
                      marginTop: 6, padding: "8px 12px", borderRadius: 8,
                      background: "#FFF5F5", border: "1px solid #FED7D7",
                      fontSize: 12, color: "#C53030",
                    }}>
                      ⚠ Assembly areas ({totalAssemblyArea.toLocaleString()} SF) differ from gross roof area ({grossArea.toLocaleString()} SF) by {(delta * 100).toFixed(1)}%. Verify your areas before proceeding.
                    </div>
                  )}
                </div>
              );
            })()}

            {areaWarning && (
              <div style={{
                margin: "8px 12px", padding: "8px 12px", borderRadius: 8,
                background: "#FFFAF0", border: "1px solid #FEEBC8",
                fontSize: 12, color: "#C05621",
              }}>
                {areaWarning}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'var(--bs-teal-dim)', border: '1px solid var(--bs-teal-border)', marginTop: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bs-teal)" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                <span style={{ fontSize: 12, color: 'var(--bs-teal)', fontWeight: 500 }}>
                  Spec applied — {projectSpecs && projectSpecs.length > 1 ? (specData.materials?.length ?? 0) : appliedMaterialCount} materials loaded{projectSpecs && projectSpecs.length > 1 ? '' : (appliedSectionCount > 0 ? `, ${appliedSectionCount} roof sections created` : '')}
                </span>
                {!isDemo && (
                  <button onClick={handleApplySpec} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bs-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>Re-apply</button>
                )}
              </div>
            )}
            <button
              onClick={() => setSpecMode("upload")}
              style={btnSecondary}
            >
              {specMode === "done" ? "Re-upload Spec" : "Upload Spec PDF"}
            </button>
          </div>
        </div>

        {/* Uploaded spec list (multi-spec) */}
        {!isDemo && projectSpecs && projectSpecs.length > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--bs-text-dim)" }}>
              Uploaded Specs ({projectSpecs.length})
            </div>
            <div className="space-y-1">
              {projectSpecs.map((s) => (
                <div key={s._id} className="flex items-center gap-2 text-xs py-1" style={{ borderBottom: "1px solid var(--bs-border)" }}>
                  <select
                    value={s.sourceType}
                    onChange={async (e) => {
                      await updateProjectSpecMut({ id: s._id, sourceType: e.target.value as any });
                    }}
                    style={{ fontSize: 10, background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)", borderRadius: 4, padding: "2px 4px" }}
                  >
                    <option value="base_spec">Base Spec</option>
                    <option value="addendum">Addendum</option>
                    <option value="related_division">Related Division</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    defaultValue={s.label}
                    onBlur={async (e) => {
                      if (e.target.value !== s.label) {
                        await updateProjectSpecMut({ id: s._id, label: e.target.value });
                      }
                    }}
                    style={{ flex: 1, fontSize: 12, background: "transparent", color: "var(--bs-text-primary)", border: "none", outline: "none" }}
                  />
                  {s.filename && (
                    <span style={{ fontSize: 10, color: "var(--bs-text-dim)" }}>{s.filename}</span>
                  )}
                  <button
                    onClick={async () => {
                      if (confirm(`Delete "${s.label}"?`)) {
                        await deleteProjectSpecMut({ id: s._id });
                      }
                    }}
                    style={{ fontSize: 10, color: "var(--bs-red)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "var(--bs-text-dim)" }}>
              Materials across all specs are merged in the Materials tab.
            </p>
          </div>
        )}

        {specMode === "upload" && (
          <div
            className="rounded-xl p-6 text-center mb-4"
            style={{ border: "1px dashed var(--bs-border)", background: "var(--bs-bg-card)" }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleSpecFile(f); }}
          >
            {projectSpecs && projectSpecs.length > 0 && (
              <div className="flex items-center gap-2 mb-3 justify-center">
                <select
                  value={pendingSourceType}
                  onChange={(e) => setPendingSourceType(e.target.value as any)}
                  style={{ fontSize: 11, background: "var(--bs-bg-elevated)", color: "var(--bs-text-primary)", border: "1px solid var(--bs-border)", borderRadius: 4, padding: "4px 6px" }}
                >
                  <option value="addendum">Addendum</option>
                  <option value="related_division">Related Division</option>
                  <option value="base_spec">Base Spec</option>
                  <option value="other">Other</option>
                </select>
                <input
                  value={pendingLabel}
                  onChange={(e) => setPendingLabel(e.target.value)}
                  placeholder="Label (e.g. Addendum 2, Div 05 Metal Deck)"
                  style={{ fontSize: 11, width: 260, background: "var(--bs-bg-elevated)", color: "var(--bs-text-primary)", border: "1px solid var(--bs-border)", borderRadius: 4, padding: "4px 6px" }}
                />
              </div>
            )}
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
            {/* Spec switcher: one tab per uploaded spec PDF. Each tab parses
                its own extractionJson on click, so the detail block below
                re-renders with that spec's warranty / materials / assemblies
                / approved manufacturers. Hidden when only one spec exists. */}
            {!isDemo && projectSpecs && projectSpecs.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {projectSpecs.map((s) => {
                  const active = s._id === activeSpecId;
                  let tabLabel = s.label;
                  try {
                    const parsed = JSON.parse(s.extractionJson);
                    const first = parsed?.specSections?.[0];
                    if (first?.csiNumber || first?.title) {
                      tabLabel = [first.csiNumber, first.title].filter(Boolean).join(" — ");
                    }
                  } catch { /* keep fallback label */ }
                  return (
                    <button
                      key={s._id}
                      onClick={() => setActiveSpecId(s._id)}
                      className="text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                      style={active
                        ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)", border: "1px solid var(--bs-teal-border)" }
                        : { background: "var(--bs-bg-card)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
                    >
                      {tabLabel}
                    </button>
                  );
                })}
              </div>
            )}

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
                  <div className="text-sm font-bold" style={{ color: "var(--bs-teal)" }}>{formatWarrantyHeadline(specData.warranty)}</div>
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
                            a.membrane && `${(renderLayerField(a.membrane.type) || "").toUpperCase()} ${renderLayerField(a.membrane.thickness)}${renderLayerField(a.membrane.manufacturer) ? ` (${renderLayerField(a.membrane.manufacturer)})` : ""}`.trim(),
                            a.insulation && `${(renderLayerField(a.insulation.type) || "").replace("_", " ")} ${renderLayerField(a.insulation.thickness)}${a.insulation.rValue ? ` R-${a.insulation.rValue}` : ""}`.trim(),
                            renderLayerField(a.coverBoard),
                            renderLayerField(a.vaporRetarder) && `VR: ${renderLayerField(a.vaporRetarder)}`,
                            renderLayerField(a.attachmentMethod).replace(/_/g, " "),
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
                    <div className="text-xs py-0.5" style={{ color: "var(--bs-amber)" }}>Manufacturer certification required</div>
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
