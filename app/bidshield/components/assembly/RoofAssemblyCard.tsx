"use client";
import { useState } from "react";
import {
  getSystemConfig,
  validateAssembly,
  generateLayerStack,
  getDeckCompatibilityWarning,
  buildSectionValuesFromAssembly,
  SectionValues,
  SectionId,
  ValidationResult,
  ClassificationAudit,
  ROOF_SYSTEM_CONFIGS,
  SMART_PRESETS,
} from "@/lib/bidshield/assembly-system-configs";
import { DynamicAssemblyForm } from "./DynamicAssemblyForm";
import { AssemblyWarningsPanel } from "./AssemblyWarningsPanel";
import { LayerStackVisualizer } from "./LayerStackVisualizer";

export interface AssemblyCardData {
  label: string;
  name?: string;
  systemType: string;
  // Legacy fields (still used for backward compat)
  insulationType?: string;
  insulationThickness?: string;
  rValue?: number;
  surfaceType?: string;
  coverBoard?: string;
  deckType?: string;
  drainageMat?: boolean | null;
  filterFabric?: boolean | null;
  area?: number;
  uValue?: number;
  attachmentMethod?: string;
  layers?: string[];
  // New: section values (source of truth for system-specific data)
  sectionValues?: SectionValues;
  // AI extraction metadata
  confidence?: number;
  extractedFromPdf?: boolean;
  classificationAudit?: ClassificationAudit;
}

interface Props {
  assembly: AssemblyCardData;
  onChange: (updated: AssemblyCardData) => void;
  onRemove?: () => void;
  showLayerStack?: boolean;
}

export function RoofAssemblyCard({ assembly, onChange, onRemove, showLayerStack = true }: Props) {
  const [layersOpen, setLayersOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);

  // STEP 4 — trace systemType reaching render
  console.log("[RoofAssemblyCard render]", {
    label: assembly.label,
    systemType: assembly.systemType,
    layers: assembly.layers,
    rawLayers: (assembly as any).rawExtraction?.layers,
  });

  // STEP 6 — TEMP ASSERT: catch IRMA assembly downgraded to lam
  if (
    assembly.label === "RT-01" &&
    assembly.systemType === "lam" &&
    assembly.layers?.some(l => /drainage[\s_-]?mat/i.test(l))
  ) {
    throw new Error("IRMA assembly downgraded to lam at render");
  }

  const systemConfig = getSystemConfig(assembly.systemType);

  const sectionValues: SectionValues = assembly.sectionValues ?? buildSectionValuesFromAssembly({
    systemType: assembly.systemType,
    deckType: assembly.deckType,
    insulationType: assembly.insulationType,
    insulationThickness: assembly.insulationThickness,
    rValue: assembly.rValue,
    drainageMat: assembly.drainageMat,
    filterFabric: assembly.filterFabric,
    layers: assembly.layers,
  });

  const updateSections = (updated: SectionValues) => {
    onChange({ ...assembly, sectionValues: updated });
  };

  const baseWarnings = systemConfig ? validateAssembly(systemConfig, sectionValues) : [];

  // Deck compatibility intelligence
  const deckValue = sectionValues.deck as string | null | undefined;
  const deckWarning = getDeckCompatibilityWarning(deckValue, assembly.systemType);
  const allWarnings: ValidationResult[] = [
    ...baseWarnings,
    ...(deckWarning
      ? [{ sectionId: "deck" as SectionId, message: deckWarning.message, severity: deckWarning.severity }]
      : []),
  ];

  const generatedLayers = systemConfig ? generateLayerStack(systemConfig, sectionValues) : [];

  const systemLabel =
    ROOF_SYSTEM_CONFIGS.find((c) => c.systemId === assembly.systemType)?.label ??
    assembly.systemType.toUpperCase();

  const errorCount = allWarnings.filter((w) => w.severity === "error").length;
  const warnCount = allWarnings.filter((w) => w.severity === "warning").length;
  const hasIssues = allWarnings.length > 0;

  // Presets filtered to current system
  const systemPresets = SMART_PRESETS.filter((p) => p.systemId === assembly.systemType);

  const applyPreset = (presetId: string) => {
    const preset = systemPresets.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({ ...assembly, sectionValues: { ...sectionValues, ...preset.sectionValues } });
    setPresetsOpen(false);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid var(--bs-border)" }}
      >
        <input
          value={assembly.label}
          onChange={(e) => onChange({ ...assembly, label: e.target.value })}
          className="w-16 text-sm font-bold bg-transparent outline-none"
          style={{ color: "var(--bs-text-primary)" }}
        />
        <span
          className="text-[11px] px-2 py-0.5 rounded font-semibold"
          style={{ background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }}
        >
          {systemLabel}
        </span>
        {assembly.extractedFromPdf && assembly.confidence !== undefined && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
            title={`AI classification confidence: ${assembly.confidence}%`}
            style={
              assembly.confidence >= 85
                ? { background: "#14532d", color: "#4ade80" }
                : assembly.confidence >= 65
                ? { background: "#78350f", color: "#fbbf24" }
                : { background: "#1c1917", color: "#a8a29e" }
            }
          >
            AI {assembly.confidence}%
          </span>
        )}
        {assembly.area ? (
          <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>
            {assembly.area.toLocaleString()} SF
          </span>
        ) : null}

        {/* Validation badge */}
        {hasIssues ? (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            style={
              errorCount > 0
                ? { background: "#7f1d1d", color: "#f87171" }
                : { background: "#78350f", color: "#fbbf24" }
            }
          >
            {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? "s" : ""}` : `${warnCount} warn`}
          </span>
        ) : Object.values(sectionValues).some((v) => v !== null && v !== undefined && v !== false && v !== "") ? (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: "#14532d", color: "#4ade80" }}
          >
            ✓
          </span>
        ) : null}

        {/* Presets menu */}
        {systemPresets.length > 0 && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setPresetsOpen((v) => !v)}
              className="text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 transition-all"
              style={{
                background: presetsOpen ? "var(--bs-teal-dim)" : "var(--bs-bg-card)",
                border: "1px solid var(--bs-border)",
                color: presetsOpen ? "var(--bs-teal)" : "var(--bs-text-dim)",
                cursor: "pointer",
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
              Presets
            </button>
            {presetsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPresetsOpen(false)} />
                <div
                  className="absolute right-0 z-20 mt-1 rounded-xl py-1.5 shadow-xl min-w-[240px]"
                  style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}
                >
                  <div
                    className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--bs-text-dim)" }}
                  >
                    Apply preset assembly
                  </div>
                  {systemPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className="w-full text-left px-3 py-2 transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div className="text-xs font-semibold" style={{ color: "var(--bs-text-primary)" }}>
                        {preset.label}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--bs-text-dim)" }}>
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Remove button (if no presets or after presets) */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={`text-sm ${systemPresets.length > 0 ? "" : "ml-auto"}`}
            style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Classification conflict banner */}
      {assembly.classificationAudit?.conflict && (
        <div
          className="flex flex-col gap-0.5 px-4 py-2.5 text-xs"
          style={{ background: "#431407", borderBottom: "1px solid #7c2d12", color: "#fb923c" }}
        >
          <span className="font-bold text-[11px]">⚠ Classification conflict</span>
          {assembly.classificationAudit.titleLabel && (
            <span style={{ color: "#fdba74" }}>
              Title: <span style={{ color: "#fff7ed" }}>{assembly.classificationAudit.titleLabel}</span>
            </span>
          )}
          {assembly.classificationAudit.detectedType && (
            <span style={{ color: "#fdba74" }}>
              Detected: <span style={{ color: "#fff7ed" }}>{assembly.classificationAudit.detectedType}</span>
            </span>
          )}
          {assembly.classificationAudit.reason && (
            <span style={{ color: "#fdba74" }}>{assembly.classificationAudit.reason}</span>
          )}
        </div>
      )}

      {/* Area + name inputs */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--bs-text-dim)" }}>
              Area (SF)
            </label>
            <input
              type="number"
              value={assembly.area ?? ""}
              placeholder="—"
              onChange={(e) =>
                onChange({ ...assembly, area: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              className="py-1.5 px-2 rounded-lg text-xs outline-none"
              style={{
                background: "var(--bs-bg-card)",
                border: "1px solid var(--bs-border)",
                color: "var(--bs-text-primary)",
                width: 90,
              }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] block mb-0.5 font-medium" style={{ color: "var(--bs-text-dim)" }}>
              Assembly name
            </label>
            <input
              type="text"
              value={assembly.name ?? ""}
              placeholder="Optional label"
              onChange={(e) => onChange({ ...assembly, name: e.target.value || undefined })}
              className="py-1.5 px-2 rounded-lg text-xs outline-none"
              style={{
                background: "var(--bs-bg-card)",
                border: "1px solid var(--bs-border)",
                color: "var(--bs-text-primary)",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic sections */}
      <div className="px-4 pb-3">
        {systemConfig ? (
          <DynamicAssemblyForm
            systemConfig={systemConfig}
            sectionValues={sectionValues}
            onChange={updateSections}
            warnings={allWarnings}
          />
        ) : (
          <div className="text-xs py-2" style={{ color: "var(--bs-text-dim)" }}>
            Select a system to show assembly sections.
          </div>
        )}

        {/* Global warnings panel — shows only warnings without a visible form field */}
        <AssemblyWarningsPanel warnings={allWarnings} />

        {/* Layer stack toggle */}
        {showLayerStack && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setLayersOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] font-medium"
              style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={{ fontSize: 8, color: "var(--bs-teal)" }}>{layersOpen ? "▲" : "▼"}</span>
              Layer Stack
              {generatedLayers.length > 0 && (
                <span style={{ color: "var(--bs-text-dim)" }}>({generatedLayers.length} layers)</span>
              )}
            </button>
            {layersOpen && (
              <div className="mt-2">
                <LayerStackVisualizer
                  layers={generatedLayers}
                  aiLayers={assembly.layers}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
