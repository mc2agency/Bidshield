"use client";
import { useState } from "react";
import {
  RoofSystemConfig,
  SectionId,
  SectionValues,
  SECTION_DEFS,
} from "@/lib/bidshield/assembly-system-configs";
import { AssemblySectionRow } from "./AssemblySectionRow";

interface Props {
  systemConfig: RoofSystemConfig;
  sectionValues: SectionValues;
  onChange: (updated: SectionValues) => void;
}

export function DynamicAssemblyForm({ systemConfig, sectionValues, onChange }: Props) {
  const [manuallyAdded, setManuallyAdded] = useState<Set<SectionId>>(new Set());

  const set = (id: SectionId, val: string | boolean | null) => {
    onChange({ ...sectionValues, [id]: val });
  };

  const removeOptional = (id: SectionId) => {
    const next = { ...sectionValues, [id]: null };
    onChange(next);
    setManuallyAdded((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const addOptional = (id: SectionId) => {
    setManuallyAdded((prev) => new Set([...prev, id]));
  };

  // Required sections — always shown
  const requiredIds = systemConfig.requiredSections;

  // Optional sections — shown if they have a value OR were manually added
  const visibleOptionalIds = systemConfig.optionalSections.filter(
    (id) => {
      const val = sectionValues[id];
      return manuallyAdded.has(id) || (val !== undefined && val !== null && val !== false && val !== "");
    }
  );

  // Addable sections — optional, not yet shown
  const addableIds = systemConfig.optionalSections.filter(
    (id) => !visibleOptionalIds.includes(id)
  );

  return (
    <div>
      <div
        className="rounded-lg divide-y overflow-hidden"
        style={{ border: "1px solid var(--bs-border)", divideColor: "var(--bs-border)" } as React.CSSProperties}
      >
        {requiredIds.map((id) => {
          const def = SECTION_DEFS[id];
          if (!def) return null;
          return (
            <div key={id} className="px-3" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <AssemblySectionRow
                def={def}
                value={sectionValues[id]}
                onChange={(val) => set(id, val)}
                isRequired
              />
            </div>
          );
        })}

        {visibleOptionalIds.map((id) => {
          const def = SECTION_DEFS[id];
          if (!def) return null;
          return (
            <div key={id} className="px-3" style={{ borderBottom: "1px solid var(--bs-border)" }}>
              <AssemblySectionRow
                def={def}
                value={sectionValues[id]}
                onChange={(val) => set(id, val)}
                isRequired={false}
                onRemove={() => removeOptional(id)}
              />
            </div>
          );
        })}
      </div>

      {addableIds.length > 0 && (
        <div className="mt-2">
          <AddSectionMenu sectionIds={addableIds} onAdd={addOptional} />
        </div>
      )}
    </div>
  );
}

function AddSectionMenu({ sectionIds, onAdd }: { sectionIds: SectionId[]; onAdd: (id: SectionId) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium flex items-center gap-1"
        style={{ color: "var(--bs-text-dim)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontSize: 14, lineHeight: 1, color: "var(--bs-teal)" }}>+</span>
        Add optional section
      </button>

      {open && (
        <div
          className="absolute left-0 z-20 mt-1 rounded-xl py-1 shadow-xl min-w-[200px]"
          style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}
        >
          {sectionIds.map((id) => {
            const def = SECTION_DEFS[id];
            if (!def) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { onAdd(id); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs transition-colors"
                style={{ color: "var(--bs-text-muted)", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bs-bg-elevated)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {def.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
