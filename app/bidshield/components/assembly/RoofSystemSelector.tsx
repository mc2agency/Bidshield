"use client";
import { ROOF_SYSTEM_CONFIGS, getSystemBadges } from "@/lib/bidshield/assembly-system-configs";

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

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  PMR:              { bg: "var(--bs-teal-dim)", color: "var(--bs-teal)" },
  "IRMA Compatible":{ bg: "#0d2b2b", color: "#2dd4bf" },
  "Green Roof":     { bg: "#0f2010", color: "#86efac" },
  Recoverable:      { bg: "#1a1f12", color: "#a3e635" },
  "High Wind":      { bg: "#1c1a18", color: "#d6d3d1" },
  "High Traffic":   { bg: "#1a1818", color: "#fca5a5" },
  "Solar Ready":    { bg: "#1f1c10", color: "#fcd34d" },
  "Cold Applied":   { bg: "#0f1f2a", color: "#38bdf8" },
};

export function RoofSystemSelector({ selected, onToggle }: Props) {
  const categories = CATEGORY_ORDER.filter((cat) =>
    ROOF_SYSTEM_CONFIGS.some((c) => c.category === cat)
  );

  return (
    <div className="space-y-5">
      {categories.map((category) => {
        const systems = ROOF_SYSTEM_CONFIGS.filter((c) => c.category === category);
        return (
          <div key={category}>
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2"
              style={{ color: "var(--bs-text-dim)" }}
            >
              <span>{category}</span>
              <span
                className="flex-1 h-px"
                style={{ background: "var(--bs-border)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {systems.map((sys) => {
                const isSelected = selected.includes(sys.systemId);
                const badges = getSystemBadges(sys);

                return (
                  <button
                    key={sys.systemId}
                    type="button"
                    onClick={() => onToggle(sys.systemId)}
                    className="relative text-left rounded-xl p-3 transition-all"
                    style={
                      isSelected
                        ? {
                            border: "2px solid var(--bs-teal)",
                            background: "var(--bs-teal-dim)",
                            boxShadow: "0 0 0 1px var(--bs-teal-border) inset",
                          }
                        : {
                            border: "1px solid var(--bs-border)",
                            background: "var(--bs-bg-elevated)",
                          }
                    }
                  >
                    {/* Selected checkmark */}
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

                    {/* Title row */}
                    <div className="flex items-center gap-1.5 mb-1" style={{ paddingRight: isSelected ? 20 : 0 }}>
                      <span style={{ fontSize: 13 }}>{sys.icon}</span>
                      <span
                        className="text-sm font-bold leading-tight"
                        style={{ color: isSelected ? "var(--bs-teal)" : "var(--bs-text-primary)" }}
                      >
                        {sys.label}
                      </span>
                    </div>

                    {/* Assembly type */}
                    <div className="text-[10px] mb-1.5 leading-tight" style={{ color: "var(--bs-text-dim)" }}>
                      {sys.metadata.assemblyType}
                    </div>

                    {/* Typical insulation */}
                    <div
                      className="text-[9px] mb-1.5 truncate"
                      style={{ color: "var(--bs-text-dim)", opacity: 0.7 }}
                    >
                      {sys.metadata.typicalInsulation}
                    </div>

                    {/* Capability badges */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {badges.slice(0, 4).map((badge) => {
                          const style = BADGE_COLORS[badge] ?? { bg: "var(--bs-bg-card)", color: "var(--bs-text-dim)" };
                          return (
                            <span
                              key={badge}
                              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide"
                              style={{ background: style.bg, color: style.color }}
                            >
                              {badge}
                            </span>
                          );
                        })}
                        {sys.metadata.typicalSlope && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                            style={{ background: "var(--bs-bg-card)", color: "var(--bs-text-dim)" }}
                          >
                            {sys.metadata.typicalSlope}
                          </span>
                        )}
                      </div>
                    )}
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
