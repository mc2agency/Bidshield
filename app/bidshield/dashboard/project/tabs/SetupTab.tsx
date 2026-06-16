"use client";

import { useState, useEffect, useCallback } from "react";
import { useProGate } from "@/hooks/useProGate";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";
import {
  INSULATION_TYPES,
  SURFACE_TYPES,
  THICKNESS_PRESETS,
  computeInsulationRValue,
} from "@/lib/bidshield/insulation-data";
import { resolveFullLayerStack } from "@/lib/bidshield/assembly-layer-resolver";

const SYSTEMS = [
  { id: "tpo", label: "TPO" },
  { id: "pvc", label: "PVC" },
  { id: "epdm", label: "EPDM" },
  { id: "sbs", label: "SBS Modified Bitumen" },
  { id: "sbs_irma", label: "SBS IRMA / PMR" },
  { id: "sbs_irma_green", label: "SBS IRMA Green Roof" },
  { id: "app", label: "APP Modified Bitumen" },
  { id: "app_irma", label: "APP IRMA / PMR" },
  { id: "bur", label: "Built-Up (BUR)" },
  { id: "metal", label: "Standing Seam Metal" },
  { id: "spf", label: "Spray Foam (SPF)" },
  { id: "lam", label: "Liquid Applied Membrane" },
  { id: "lam_irma", label: "Cold-Fluid IRMA / PMR" },
  { id: "hydrotech", label: "Hydrotech (IRMA)" },
  { id: "concrete", label: "Concrete Pavement Roof" },
  { id: "panel", label: "Built-Up Panel Assembly" },
  { id: "custom", label: "Custom / Other" },
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
  layers?: string[];
  baseStack?: string[];
  modifierStack?: string[];
  archetypeId?: string;
  archetype?: string;
}

function systemLabel(id: string) {
  return SYSTEMS.find((s) => s.id === id)?.label || id.toUpperCase();
}

// ── Styles ──
const cardStyle = {
  background: "var(--bs-bg-card)",
  border: "1px solid var(--bs-border)",
  borderRadius: 14,
  padding: 24,
  marginBottom: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
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
  const updateTakeoffSection = useMutation(api.bidshield.updateTakeoffSection);
  const initProjectMaterials = useMutation(api.bidshield.initProjectMaterials);
  const clearProjectMaterials = useMutation(api.bidshield.clearProjectMaterials);
  const syncTakeoffToMaterials = useMutation(api.bidshield.syncTakeoffToMaterials);
  const updateChecklistItem = useMutation(api.bidshield.updateChecklistItem);
  const { user } = useUser();
  // System substitutions — loaded lazily, defaults to empty if unavailable
  const systemSubstitutions: { from: string; to: string }[] = [];
  const isValidConvexId = !isDemo && !!projectId && !projectId.startsWith("demo_");
  const takeoffSections = useQuery(api.bidshield.getTakeoffSections, isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip");
  const checklistItems = useQuery(
    api.bidshield.getChecklist,
    isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );

  // ── Section 1: Project Info ──
  const [info, setInfo] = useState({
    name: "",
    location: "",
    bidDate: "",
    gc: "",
    sqft: "",
    deckType: "",
    projectType: "",
    drawingDate: "",
    drawingRevision: "",
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
      drawingDate: (project as any).drawingDate || "",
      drawingRevision: (project as any).drawingRevision || "",
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
        drawingDate: info.drawingDate || undefined,
        drawingRevision: info.drawingRevision || undefined,
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

  // ── Section 1b: Bid Source ──
  const [bidSource, setBidSource] = useState({ bidType: "", bidContactName: "", bidContactEmail: "", bidContactPhone: "" });
  const [bidSourceSaving, setBidSourceSaving] = useState(false);
  const [bidSourceSaved, setBidSourceSaved] = useState(false);
  const [bidScanLoading, setBidScanLoading] = useState(false);
  const [bidScanError, setBidScanError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    setBidSource({
      bidType: (project as any).bidType || "",
      bidContactName: (project as any).bidContactName || "",
      bidContactEmail: (project as any).bidContactEmail || "",
      bidContactPhone: (project as any).bidContactPhone || "",
    });
  }, [project]);

  const handleBidSourceSave = async () => {
    if (isDemo) return;
    setBidSourceSaving(true);
    try {
      await updateProject({
        projectId: projectId as any,
        bidType: bidSource.bidType || undefined,
        bidContactName: bidSource.bidContactName || undefined,
        bidContactEmail: bidSource.bidContactEmail || undefined,
        bidContactPhone: bidSource.bidContactPhone || undefined,
      });
      setBidSourceSaved(true);
      setTimeout(() => setBidSourceSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save bid source:", e);
    } finally {
      setBidSourceSaving(false);
    }
  };

  const handleBidSourceScan = async (file: File) => {
    setBidScanLoading(true);
    setBidScanError(null);
    try {
      const ab = await file.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 8192, bytes.length)));
      }
      const pdfBase64 = btoa(binary);
      const res = await guardedFetch("/api/bidshield/extract-bid-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setBidSource(prev => ({
        bidType: data.bidType || prev.bidType,
        bidContactName: data.contactName || prev.bidContactName,
        bidContactEmail: data.contactEmail || prev.bidContactEmail,
        bidContactPhone: data.contactPhone || prev.bidContactPhone,
      }));
      if (data.gcName) setInfo(prev => ({ ...prev, gc: prev.gc || data.gcName }));
    } catch (e: any) {
      setBidScanError(e.message || "Failed to scan document");
    } finally {
      setBidScanLoading(false);
    }
  };

  // ── Section 2: Roof Assemblies ──
  const [assemblies, setAssemblies] = useState<AssemblyRow[]>([]);
  const [assembliesDirty, setAssembliesDirty] = useState(false);
  const [asmSaving, setAsmSaving] = useState(false);
  const [asmSaved, setAsmSaved] = useState(false);
  const [asmError, setAsmError] = useState("");
  const [areaWarning, setAreaWarning] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpanded = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Resolve the base/overburden layer split for a row: prefer persisted stacks,
  // else re-derive from raw layers + archetypeId via the shared resolver.
  const getRowStacks = (a: AssemblyRow): { baseStack: string[]; modifierStack: string[] } => {
    if ((a.baseStack && a.baseStack.length > 0) || (a.modifierStack && a.modifierStack.length > 0)) {
      return { baseStack: a.baseStack ?? [], modifierStack: a.modifierStack ?? [] };
    }
    if (a.layers && a.layers.length > 0) {
      const resolved = resolveFullLayerStack(a.layers, a.archetypeId ?? "", a.surfaceType || null);
      return { baseStack: resolved.baseStack, modifierStack: resolved.modifierStack };
    }
    return { baseStack: [], modifierStack: [] };
  };

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
          layers: Array.isArray(a.layers) ? a.layers : undefined,
          baseStack: Array.isArray(a.baseStack) ? a.baseStack : undefined,
          modifierStack: Array.isArray(a.modifierStack) ? a.modifierStack : undefined,
          archetypeId: a.archetypeId || undefined,
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
          if (a.layers && a.layers.length > 0) obj.layers = a.layers;
          if (a.baseStack && a.baseStack.length > 0) obj.baseStack = a.baseStack;
          if (a.modifierStack && a.modifierStack.length > 0) obj.modifierStack = a.modifierStack;
          if (a.archetypeId) obj.archetypeId = a.archetypeId;
          return obj;
        });
      await updateProject({
        projectId: projectId as any,
        roofAssemblies: cleanAssemblies as any,
      });

      // Sync assembly areas to takeoff sections: create missing sections, update existing ones.
      // TakeoffTab names sections as `${label}${name ? " — " + name : ""}` (label-first).
      // Match by label prefix so we find sections regardless of whether the assembly has a custom name.
      if (userId && cleanAssemblies.length > 0) {
        try {
          const existingSections: any[] = takeoffSections || [];
          for (const asm of cleanAssemblies) {
            const label: string = asm.label || "";
            const canonicalName: string = label + (asm.name ? ` — ${asm.name}` : "");
            const existing = existingSections.find((s: any) => {
              const sn: string = s.name || "";
              return sn === label || sn.startsWith(`${label} — `) || sn.startsWith(`${label} `);
            });
            if (existing) {
              // Update squareFeet when assembly area is set and differs from current section value
              if (asm.area != null && asm.area !== existing.squareFeet) {
                await updateTakeoffSection({
                  sectionId: existing._id,
                  squareFeet: asm.area,
                });
              }
            } else {
              await createTakeoffSection({
                projectId: projectId as any,
                userId,
                name: canonicalName || "Roof Section",
                assemblyType: (asm.systemType || "").toUpperCase(),
                squareFeet: asm.area || 0,
              });
            }
          }
        } catch (err) {
          // Takeoff sections may already exist or other error — log but don't fail the save
          console.warn("Warning: could not sync takeoff sections:", err);
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

  // Load saved spec summary from project
  useEffect(() => {
    if (project?.specSummary) {
      try {
        setSpecData(JSON.parse(project.specSummary));
        setSpecMode("done");
      } catch { /* ignore parse errors */ }
    }
  }, [project]);

  // Shared helper: apply spec data (accepts data param so it works before setState is flushed)
  const runApplySpec = useCallback(async (data: any, forceAssemblies = false) => {
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

      // Apply assemblies from spec.
      // Only skip if the project already has *saved* roofAssemblies (user manually entered/confirmed them).
      // Auto-generated placeholder assemblies (from systemType fallback) should always be overwritten by spec data.
      const hasSavedAssemblies = !forceAssemblies && Array.isArray(project?.roofAssemblies) && project.roofAssemblies.length > 0;
      const specAssemblies = Array.isArray(data.assemblies) ? data.assemblies : [];
      if (specAssemblies.length > 0 && !hasSavedAssemblies) {
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

      // Auto-create takeoff sections from ALL spec assemblies (dedup handled server-side)
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
        } catch (e) {
          console.error('createTakeoffSection failed:', e);
        }
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

      // Apply phase9Flags from spec to matching checklist items
      if (data.phase9Flags?.checklistItems?.length > 0 && userId && isValidConvexId) {
        try {
          const currentChecklist = checklistItems ?? [];
          for (const flagItem of data.phase9Flags.checklistItems) {
            // Map AI status to valid checklist status values
            const statusMap: Record<string, string> = {
              'flagged': 'warning',
              'attention': 'warning',
              'ok': 'done',
            };
            const newStatus = statusMap[flagItem.status] ?? 'pending';
            // Try to find existing checklist item by itemId match
            const match = currentChecklist.find((c: any) =>
              (c.phaseKey === 'phase9') && (c.itemId === flagItem.id)
            );
            // Only update if not already manually set to done/na
            if (!match || (match.status !== 'done' && match.status !== 'na')) {
              await updateChecklistItem({
                projectId: projectId as Id<'bidshield_projects'>,
                phaseKey: 'phase9',
                itemId: flagItem.id,
                status: newStatus as any,
                notes: flagItem.note || undefined,
              });
            }
          }
        } catch (e) {
          console.error('Failed to apply phase9 checklist flags:', e);
        }
      }
    } catch (e: any) {
      console.error("Failed to apply spec data:", e);
      const detail = e?.message || e?.data || "Unknown error";
      setSpecError(`Failed to apply spec data: ${detail}`);
    } finally {
      setSpecApplying(false);
    }
  }, [isDemo, project, projectId, info, assemblies, userId, isValidConvexId, checklistItems, updateProject, createTakeoffSection, updateTakeoffSection, clearProjectMaterials, initProjectMaterials, syncTakeoffToMaterials, updateChecklistItem, computeInsulationRValue]);

  // Apply spec data to assemblies and project info (thin wrapper for manual re-apply)
  const handleApplySpec = async () => {
    if (!specData || isDemo) return;
    await runApplySpec(specData, true); // force=true so Re-apply always overwrites saved assemblies
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
      // Only auto-apply if this is the first/base spec — addenda merge via mergeSpecMaterials
      if (pendingSourceType === 'base_spec' || (projectSpecs?.length ?? 0) === 0) {
        try {
          await runApplySpec(data, true);
        } catch (e) {
          console.error('Auto-apply failed:', e);
        }
      }
    } catch { setSpecError("Failed to read PDF."); setSpecMode("error"); }
  }, [isDemo, projectId, updateProject, userId, projectSpecs, pendingLabel, pendingSourceType, addProjectSpecMut, runApplySpec]);

  // ── Section 3b: Spec Assistant Chat ──
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleChatSend = useCallback(async (question: string) => {
    if (!question.trim() || !specData || chatLoading) return;
    const q = question.trim();
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/bidshield/spec-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, specContext: JSON.stringify(specData) }),
      });
      const data = await res.json();
      const answer = data.answer || data.error || "No response.";
      setChatHistory(prev => [...prev, { q, a: answer }]);
    } catch {
      setChatHistory(prev => [...prev, { q, a: "Failed to reach the spec assistant. Check your connection." }]);
    } finally {
      setChatLoading(false);
    }
  }, [specData, chatLoading]);

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

  // Derive completion status for 4-step tracker
  const stepsDone = [
    !!(info.name && info.bidDate),
    !!(bidSource.bidType || bidSource.bidContactName),
    assemblies.length > 0,
    specMode === "done" || (projectSpecs?.length ?? 0) > 0,
  ];
  const stepsCompleted = stepsDone.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      {proGateModal}

      {/* ── Intake progress tracker ── */}
      <div style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--bs-text-primary)" }}>
            Intake Progress
          </span>
          <span style={{ fontSize: 11, color: stepsCompleted === 4 ? "var(--bs-teal)" : "var(--bs-text-dim)", fontWeight: 600 }}>
            {stepsCompleted} of 4 complete
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { label: "Project Info", detail: "Name, GC, dates" },
            { label: "Bid Source", detail: "Type & contact" },
            { label: "Assemblies", detail: "Roof systems" },
            { label: "Spec Upload", detail: "AI extraction" },
          ].map((step, i) => {
            const done = stepsDone[i];
            const color = done ? "var(--bs-teal)" : "var(--bs-text-dim)";
            return (
              <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? "var(--bs-teal)" : "var(--bs-bg-elevated)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {done
                        ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#13151a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <span style={{ fontSize: 8, fontWeight: 800, color: "var(--bs-text-dim)", lineHeight: 1 }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: done ? "var(--bs-teal)" : "var(--bs-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{step.label}</div>
                      <div style={{ fontSize: 9, color: "var(--bs-text-dim)", whiteSpace: "nowrap" }}>{step.detail}</div>
                    </div>
                  </div>
                </div>
                {i < 3 && (
                  <div style={{ width: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="var(--bs-border)" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {stepsCompleted < 4 && (
          <div style={{ marginTop: 12, height: 4, background: "var(--bs-bg-elevated)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(stepsCompleted / 4) * 100}%`, background: "var(--bs-teal)", borderRadius: 9999, transition: "width 0.6s" }} />
          </div>
        )}
      </div>

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
          <div>
            <label style={labelStyle}>Drawing Date</label>
            <input
              value={info.drawingDate}
              onChange={(e) => setInfo({ ...info, drawingDate: e.target.value })}
              style={inputStyle}
              placeholder="e.g. 2026-03-15"
            />
          </div>
          <div>
            <label style={labelStyle}>Drawing Revision</label>
            <input
              value={info.drawingRevision}
              onChange={(e) => setInfo({ ...info, drawingRevision: e.target.value })}
              style={inputStyle}
              placeholder="e.g. 95% CD, Rev 3"
            />
          </div>
        </div>
      </div>

      {/* ── Bid Source ── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>Bid Source</h3>
            <p style={{ fontSize: 12, color: "var(--bs-text-muted)", marginTop: 2 }}>How this bid came in and who to contact.</p>
          </div>
          <div className="flex items-center gap-2">
            {bidSourceSaved && <span style={{ fontSize: 12, color: "var(--bs-teal)" }}>Saved</span>}
            <label
              style={{
                ...btnSecondary,
                display: "inline-flex", alignItems: "center", gap: 6,
                opacity: bidScanLoading ? 0.5 : 1,
                cursor: bidScanLoading ? "not-allowed" : "pointer",
                fontSize: 12,
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              {bidScanLoading ? "Scanning..." : "Scan Bid Invite PDF"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={bidScanLoading || isDemo}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleBidSourceScan(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={handleBidSourceSave}
              disabled={bidSourceSaving || isDemo}
              style={{ ...btnPrimary, opacity: bidSourceSaving ? 0.5 : 1 }}
            >
              {bidSourceSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {bidScanError && (
          <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bs-red-dim, rgba(239,68,68,0.1))", color: "var(--bs-red, #ef4444)", border: "1px solid var(--bs-red-border, rgba(239,68,68,0.2))" }}>
            {bidScanError}
          </div>
        )}

        {/* Bid type pills */}
        <div className="mb-4">
          <label style={{ ...labelStyle, marginBottom: 8 }}>Bid Type</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "gc_invited", label: "GC Invited" },
              { id: "private", label: "Private Owner" },
              { id: "public", label: "Public / Gov't" },
              { id: "pre_selective", label: "Pre-Selective" },
              { id: "design_build", label: "Design-Build" },
              { id: "negotiated", label: "Negotiated" },
            ].map((t) => {
              const active = bidSource.bidType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setBidSource(prev => ({ ...prev, bidType: active ? "" : t.id }))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    border: active ? "1px solid var(--bs-teal)" : "1px solid var(--bs-border)",
                    background: active ? "var(--bs-teal-dim)" : "transparent",
                    color: active ? "var(--bs-teal)" : "var(--bs-text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label style={labelStyle}>Contact Name</label>
            <input
              value={bidSource.bidContactName}
              onChange={(e) => setBidSource(prev => ({ ...prev, bidContactName: e.target.value }))}
              style={inputStyle}
              placeholder="e.g. John Smith"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label style={labelStyle}>Contact Phone</label>
            <input
              value={bidSource.bidContactPhone}
              onChange={(e) => setBidSource(prev => ({ ...prev, bidContactPhone: e.target.value }))}
              style={inputStyle}
              placeholder="e.g. (704) 555-0100"
            />
          </div>
          <div className="col-span-2">
            <label style={labelStyle}>Contact Email</label>
            <input
              type="email"
              value={bidSource.bidContactEmail}
              onChange={(e) => setBidSource(prev => ({ ...prev, bidContactEmail: e.target.value }))}
              style={inputStyle}
              placeholder="e.g. jsmith@gccompany.com"
            />
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
          <div style={{ overflowX: "auto", marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4 }}>
          <>
            {/* Table header */}
            <div
              className="grid gap-2 px-3 pb-2 mb-1"
              style={{
                gridTemplateColumns: "70px 1fr 1fr 90px 70px 90px 1fr 40px",
                minWidth: 620,
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
            {assemblies.map((a, idx) => {
              const { baseStack, modifierStack } = getRowStacks(a);
              const hasLayers = baseStack.length > 0 || modifierStack.length > 0;
              const isExpanded = expandedRows.has(idx);
              return (
              <div key={idx}>
              <div
                className="grid gap-2 px-3 py-2.5 rounded-lg mb-1.5 items-center"
                style={{
                  gridTemplateColumns: "70px 1fr 1fr 90px 70px 90px 1fr 40px",
                  minWidth: 620,
                  background: "var(--bs-bg-card)",
                  border: "1px solid var(--bs-border)",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => hasLayers && toggleRowExpanded(idx)}
                      title={hasLayers ? (isExpanded ? "Hide layers" : "Show layers") : "No layer detail"}
                      style={{
                        background: "none", border: "none", padding: 0, lineHeight: 1, flexShrink: 0,
                        cursor: hasLayers ? "pointer" : "default",
                        color: hasLayers ? "var(--bs-text-muted)" : "transparent",
                        transform: isExpanded ? "rotate(90deg)" : "none",
                        transition: "transform 0.12s",
                        fontSize: 11,
                      }}
                    >▶</button>
                    <input
                      value={a.label}
                      onChange={(e) => updateAssembly(idx, "label", e.target.value)}
                      className="font-bold"
                      style={{ ...inputStyle, padding: "4px 6px", fontWeight: 700, fontSize: 13, width: "100%", border: "none", background: "transparent" }}
                    />
                  </div>
                  {(a.name || a.archetype) && (
                    <span style={{ fontSize: 9, color: "var(--bs-text-dim)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.name || a.archetype}>
                      {a.name || a.archetype}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                {a.systemType && !SYSTEMS.find(s => s.id === a.systemType) ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={a.systemType}
                      onChange={(e) => updateAssembly(idx, "systemType", e.target.value)}
                      placeholder="System name..."
                      style={{ ...selectStyle, padding: "4px 6px", fontSize: 12, minWidth: 0, flex: 1 }}
                    />
                    <button
                      onClick={() => updateAssembly(idx, "systemType", "")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bs-text-dim)", fontSize: 11, padding: "0 2px", flexShrink: 0 }}
                      title="Pick from list"
                    >✕</button>
                  </div>
                ) : (
                  <select
                    value={a.systemType}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        updateAssembly(idx, "systemType", "");
                      } else {
                        updateAssembly(idx, "systemType", e.target.value);
                      }
                    }}
                    style={{ ...selectStyle, padding: "4px 6px", fontSize: 12 }}
                  >
                    <option value="">Select...</option>
                    {SYSTEMS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                )}
                {(() => {
                  const sub = systemSubstitutions.find((s: any) => s.from === a.systemType);
                  if (!sub) return null;
                  const toLabel = SYSTEMS.find(s => s.id === sub.to)?.label ?? sub.to;
                  return (
                    <button
                      onClick={() => updateAssembly(idx, "systemType", sub.to)}
                      className="text-[10px] font-medium mt-0.5"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--bs-teal)",
                        padding: 0,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                      title={`Switch to your preferred system: ${toLabel}`}
                    >
                      Use {toLabel} instead?
                    </button>
                  );
                })()}
                </div>
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

              {isExpanded && hasLayers && (
                <div
                  className="px-4 py-3 mb-1.5 rounded-lg"
                  style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)", marginLeft: 24 }}
                >
                  {baseStack.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--bs-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                        Base assembly
                      </div>
                      {baseStack.map((layer, i) => (
                        <div key={i} style={{ fontSize: 11, color: "var(--bs-text-secondary, #a0aec0)", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "var(--bs-teal, #2dd4bf)", fontSize: 9 }}>▸</span>
                          {layer}
                        </div>
                      ))}
                    </>
                  )}
                  {modifierStack.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--bs-teal, #2dd4bf)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 8, marginBottom: 3 }}>
                        Overburden
                      </div>
                      {modifierStack.map((layer, i) => (
                        <div key={i} style={{ fontSize: 11, color: "var(--bs-text-secondary, #a0aec0)", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#f59e0b", fontSize: 9 }}>▸</span>
                          {layer}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              </div>
              );
            })}

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
          </div>
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
                  Spec applied — {appliedMaterialCount} materials loaded{appliedSectionCount > 0 ? `, ${appliedSectionCount} roof sections created` : ''}
                </span>
                {!isDemo && (
                  <button onClick={handleApplySpec} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--bs-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>Re-apply</button>
                )}
              </div>
            )}
            {specMode === 'done' && projectSpecs && projectSpecs.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setPendingSourceType('addendum');
                    setPendingLabel('');
                    setSpecMode('upload');
                  }}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'var(--bs-teal)', border: 'none', color: '#13151a', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add Another Spec
                </button>
                <button
                  onClick={() => {
                    setPendingSourceType('base_spec');
                    setPendingLabel('');
                    setSpecMode('upload');
                  }}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'none', border: '1px solid var(--bs-border)', color: 'var(--bs-text-muted)', cursor: 'pointer' }}
                >
                  Re-upload Base Spec
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSpecMode('upload')}
                style={btnSecondary}
              >
                {specMode === 'done' ? 'Re-upload Spec' : 'Upload Spec PDF'}
              </button>
            )}
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

      {/* ── Spec Assistant Chat ── */}
      {specMode === "done" && specData && (
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--bs-teal)"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--bs-text-primary)", margin: 0 }}>Ask Your Spec</h3>
          </div>

          {/* Suggested chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["What's the warranty?", "What membrane thickness?", "Any certified installer required?", "What's the fire rating?", "Approved manufacturers?"].map(q => (
              <button
                key={q}
                onClick={() => handleChatSend(q)}
                disabled={chatLoading}
                className="text-[11px] px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
                style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bs-teal)"; (e.currentTarget as HTMLElement).style.color = "var(--bs-teal)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bs-border)"; (e.currentTarget as HTMLElement).style.color = "var(--bs-text-muted)"; }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat history */}
          {chatHistory.length > 0 && (
            <div className="space-y-3 mb-4">
              {chatHistory.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-end">
                    <div className="text-xs px-3 py-2 rounded-xl rounded-br-sm max-w-[80%]" style={{ background: "var(--bs-teal)", color: "#13151a", fontWeight: 500 }}>
                      {item.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="text-xs px-3 py-2 rounded-xl rounded-bl-sm max-w-[90%]" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-secondary)", lineHeight: 1.6 }}>
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="text-xs px-3 py-2 rounded-xl" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-dim)" }}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(chatInput); } }}
              placeholder="Ask anything about your spec..."
              disabled={chatLoading}
              style={{ ...inputStyle, flex: 1, fontSize: 13 }}
            />
            <button
              onClick={() => handleChatSend(chatInput)}
              disabled={chatLoading || !chatInput.trim()}
              style={{ ...btnPrimary, opacity: chatLoading || !chatInput.trim() ? 0.4 : 1, padding: "8px 16px", flexShrink: 0 }}
            >
              Ask
            </button>
          </div>
        </div>
      )}

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
