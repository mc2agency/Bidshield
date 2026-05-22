"use client";
import { SectionDef } from "@/lib/bidshield/assembly-system-configs";

interface Props {
  def: SectionDef;
  value: string | boolean | null | undefined;
  onChange: (val: string | boolean | null) => void;
  isRequired: boolean;
  onRemove?: () => void;
}

export function AssemblySectionRow({ def, value, onChange, isRequired, onRemove }: Props) {
  const inputBase: React.CSSProperties = {
    background: "var(--bs-bg-card)",
    border: "1px solid var(--bs-border)",
    color: "var(--bs-text-primary)",
    borderRadius: 8,
    fontSize: 12,
    padding: "5px 9px",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex-shrink-0 w-36">
        <span className="text-[11px] font-medium" style={{ color: "var(--bs-text-muted)" }}>
          {def.label}
        </span>
        {isRequired && (
          <span className="ml-1 text-[9px] font-bold uppercase" style={{ color: "var(--bs-teal)", letterSpacing: "0.05em" }}>
            req
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {def.type === "boolean" ? (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all"
            style={
              value
                ? { background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)", color: "var(--bs-teal)" }
                : { background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)", color: "var(--bs-text-muted)" }
            }
          >
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: value ? "var(--bs-teal)" : "var(--bs-border)" }}
            >
              {value && (
                <svg className="w-2 h-2" style={{ color: "#13151a" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </span>
            {value ? "Yes" : "No / TBD"}
          </button>
        ) : def.type === "select" && def.options ? (
          <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} style={inputBase}>
            <option value="">Select…</option>
            {def.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : def.type === "number" ? (
          <input
            type="number"
            value={(value as string) ?? ""}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value || null)}
            style={inputBase}
          />
        ) : (
          <input
            type="text"
            value={(value as string) ?? ""}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value || null)}
            style={inputBase}
          />
        )}
      </div>

      {onRemove && !isRequired && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all"
          style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer" }}
          title="Remove section"
        >
          ×
        </button>
      )}
    </div>
  );
}
