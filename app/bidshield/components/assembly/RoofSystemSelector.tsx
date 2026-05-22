"use client";
import { ROOF_SYSTEM_CONFIGS } from "@/lib/bidshield/assembly-system-configs";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

const CATEGORY_ORDER = [
  "Low-Slope Membrane",
  "Modified Bitumen",
  "Multi-Ply Asphaltic",
  "Protected Membrane",
  "Overburden Assembly",
  "Vegetated Assembly",
  "Hardscape Assembly",
  "Steep-Slope",
  "Fluid-Applied",
  "Custom",
];

export function RoofSystemSelector({ selected, onToggle }: Props) {
  const categories = CATEGORY_ORDER.filter((cat) =>
    ROOF_SYSTEM_CONFIGS.some((c) => c.category === cat)
  );

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const systems = ROOF_SYSTEM_CONFIGS.filter((c) => c.category === category);
        return (
          <div key={category}>
            <div
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--bs-text-dim)" }}
            >
              {category}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {systems.map((sys) => {
                const isSelected = selected.includes(sys.systemId);
                return (
                  <button
                    key={sys.systemId}
                    type="button"
                    onClick={() => onToggle(sys.systemId)}
                    className="relative text-left rounded-xl p-3 transition-all"
                    style={
                      isSelected
                        ? {
                            border: "1.5px solid var(--bs-teal)",
                            background: "var(--bs-teal-dim)",
                          }
                        : {
                            border: "1px solid var(--bs-border)",
                            background: "var(--bs-bg-elevated)",
                          }
                    }
                  >
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--bs-teal)" }}
                      >
                        <svg className="w-2.5 h-2.5" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span style={{ fontSize: 14 }}>{sys.icon}</span>
                      <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: isSelected ? "var(--bs-teal)" : "var(--bs-text-primary)" }}
                      >
                        {sys.label}
                      </span>
                    </div>

                    <div className="text-[10px] space-y-0.5" style={{ color: "var(--bs-text-dim)" }}>
                      <div>{sys.metadata.assemblyType}</div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                        <MetaChip label={sys.metadata.membraneExposure} />
                        {sys.metadata.isProtectedMembrane && <MetaChip label="PMR" teal />}
                        {sys.metadata.isRecoverable && <MetaChip label="Recoverable" />}
                        {sys.metadata.greenRoofCompatible && <MetaChip label="Green Roof" />}
                        {sys.metadata.typicalSlope && <MetaChip label={sys.metadata.typicalSlope} />}
                      </div>
                      <div className="mt-1 truncate">
                        {sys.metadata.typicalInsulation}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetaChip({ label, teal }: { label: string; teal?: boolean }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase"
      style={
        teal
          ? { background: "var(--bs-teal-dim)", color: "var(--bs-teal)" }
          : { background: "var(--bs-bg-card)", color: "var(--bs-text-dim)" }
      }
    >
      {label}
    </span>
  );
}
