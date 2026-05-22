"use client";
import { useState } from "react";
import {
  getSystemConfig,
  validateAssembly,
  generateLayerStack,
  SectionValues,
  ROOF_SYSTEM_CONFIGS,
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
  area?: number;
  uValue?: number;
  attachmentMethod?: string;
  layers?: string[];
  // New: section values (source of truth for system-specific data)
  sectionValues?: SectionValues;
}

interface Props {
  assembly: AssemblyCardData;
  onChange: (updated: AssemblyCardData) => void;
  onRemove?: () => void;
  showLayerStack?: boolean;
}

export function RoofAssemblyCard({ assembly, onChange, onRemove, showLayerStack = true }: Props) {
  const [layersOpen, setLayersOpen] = useState(false);

  const systemConfig = getSystemConfig(assembly.systemType);
  const sectionValues = assembly.sectionValues ?? {};

  const updateSections = (updated: SectionValues) => {
    onChange({ ...assembly, sectionValues: updated });
  };

  const warnings = systemConfig ? validateAssembly(systemConfig, sectionValues) : [];
  const generatedLayers = systemConfig ? generateLayerStack(systemConfig, sectionValues) : [];

  const systemLabel =
    ROOF_SYSTEM_CONFIGS.find((c) => c.systemId === assembly.systemType)?.label ??
    assembly.systemType.toUpperCase();

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
        {assembly.area ? (
          <span className="text-xs" style={{ color: "var(--bs-text-muted)" }}>
            {assembly.area.toLocaleString()} SF
          </span>
        ) : null}
        {warnings.length > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: warnings.some((w) => w.severity === "error") ? "#7f1d1d" : "#78350f", color: warnings.some((w) => w.severity === "error") ? "#f87171" : "#fbbf24" }}
          >
            {warnings.length}
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-sm"
            style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
        )}
      </div>

      {/* Area input */}
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

      {/* Dynamic sections or fallback */}
      <div className="px-4 pb-3">
        {systemConfig ? (
          <DynamicAssemblyForm
            systemConfig={systemConfig}
            sectionValues={sectionValues}
            onChange={updateSections}
          />
        ) : (
          <div className="text-xs py-2" style={{ color: "var(--bs-text-dim)" }}>
            Select a system to show assembly sections.
          </div>
        )}

        {/* Validation warnings */}
        <AssemblyWarningsPanel warnings={warnings} />

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
