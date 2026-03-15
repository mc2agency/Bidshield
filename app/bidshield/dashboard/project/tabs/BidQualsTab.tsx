"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TabProps } from "../tab-types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
      <div className="px-5 py-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{title}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 5 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, marginLeft: 6, color: "#9ca3af" }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLS = "w-full text-[13px] rounded-lg px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none bg-white text-slate-800";

function RadioGroup<T extends string>({
  value, options, onChange,
}: {
  value: T | undefined;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0" style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", display: "inline-flex" }}>
      {options.map((opt, i) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: value === opt.id ? 600 : 400,
            background: value === opt.id ? "#1e293b" : "transparent",
            color: value === opt.id ? "#ffffff" : "#6b7280",
            borderLeft: i > 0 ? "1px solid #e2e8f0" : "none",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean | undefined; onChange: (v: boolean) => void; label?: string }) {
  const on = value === true;
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!on)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: on ? "#10b981" : "#d1d5db",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
          border: "none", cursor: "pointer",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: on ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }} />
      </button>
      {label && <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>}
    </div>
  );
}

// ── Demo state ─────────────────────────────────────────────────────────────────

const DEMO_QUALS = {
  plansDated: "2026-01-15",
  planRevision: "Bid Set",
  specSections: "07 52 13, 07 62 00, 07 72 00",
  addendaThrough: 2,
  drawingSheets: "A-501, A-502, S-201",
  laborType: "open_shop" as const,
  laborBurdenRate: "42%",
  estimatedDuration: "45 working days",
  earliestStart: "2026-04-01",
  materialLeadTime: "3-4 weeks ARO",
  submittalTurnaround: "10 business days after NTP",
  bidGoodFor: "30 days",
  insuranceProgram: "own" as "own" | "ccip" | "ocip",
  additionalInsuredRequired: true,
  buildersRiskBy: "owner" as "owner" | "gc" | "included",
  bondRequired: false,
  emr: "0.82",
  mbeGoals: false,
  certifiedPayrollRequired: false,
  safetyPlanRequired: true,
  backgroundChecksRequired: false,
  qualificationsNotes: "Price excludes after-hours work. Assumes single-layer tear-off. Bid does not include hazmat abatement.",
};

type QualFields = {
  plansDated?: string;
  planRevision?: string;
  specSections?: string;
  addendaThrough?: number;
  drawingSheets?: string;
  laborType?: "open_shop" | "union" | "prevailing_wage";
  laborBurdenRate?: string;
  wageDeterminationNum?: string;
  wageDeterminationDate?: string;
  unionLocal?: string;
  estimatedDuration?: string;
  earliestStart?: string;
  materialLeadTime?: string;
  submittalTurnaround?: string;
  bidGoodFor?: string;
  insuranceProgram?: "own" | "ccip" | "ocip";
  wrapUpNotes?: string;
  additionalInsuredRequired?: boolean;
  buildersRiskBy?: "owner" | "gc" | "included";
  bondRequired?: boolean;
  bondTypes?: string;
  emr?: string;
  mbeGoals?: boolean;
  mbeGoalPct?: string;
  mbeCertifications?: string;
  certifiedPayrollRequired?: boolean;
  safetyPlanRequired?: boolean;
  backgroundChecksRequired?: boolean;
  qualificationsNotes?: string;
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function BidQualsTab({ projectId, isDemo, userId }: TabProps) {
  const isValidConvexId = projectId && !projectId.startsWith("demo_");

  const qualsData = useQuery(
    api.bidshield.getBidQuals,
    !isDemo && isValidConvexId ? { projectId: projectId as Id<"bidshield_projects"> } : "skip"
  );
  const upsertQuals = useMutation(api.bidshield.upsertBidQuals);

  const [demoState, setDemoState] = useState<QualFields>(DEMO_QUALS);
  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const data: QualFields = isDemo ? demoState : (qualsData ?? {});

  // Save a single field (debounced for text, immediate for toggles/radios)
  const saveField = useCallback((field: string, value: any, immediate = false) => {
    if (isDemo) {
      setDemoState(prev => ({ ...prev, [field]: value }));
      return;
    }
    if (!isValidConvexId || !userId) return;
    const fire = () => {
      upsertQuals({ projectId: projectId as Id<"bidshield_projects">, userId, [field]: value });
    };
    if (immediate) { fire(); return; }
    const t = debounceRefs.current.get(field);
    if (t) clearTimeout(t);
    debounceRefs.current.set(field, setTimeout(() => { fire(); debounceRefs.current.delete(field); }, 600));
  }, [isDemo, isValidConvexId, userId, projectId, upsertQuals]);

  const bondTypesSet = new Set((data.bondTypes ?? "").split(",").filter(Boolean));
  const toggleBondType = (type: string) => {
    const next = new Set(bondTypesSet);
    if (next.has(type)) next.delete(type); else next.add(type);
    saveField("bondTypes", [...next].join(","), true);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Bid Qualifications Tracker</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Track the info you&apos;ll need for the GC&apos;s Exhibit A and bid submission forms.
        </p>
      </div>

      {/* Section 1: Basis of Bid */}
      <SectionCard title="📄 Basis of Bid — Documents">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plans dated">
            <input
              type="date"
              className={INPUT_CLS}
              defaultValue={data.plansDated ?? ""}
              onBlur={e => saveField("plansDated", e.target.value)}
            />
          </Field>
          <Field label="Plan revision" hint="e.g., Bid Set, 100% CD">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.planRevision ?? ""}
              placeholder="Bid Set"
              onBlur={e => saveField("planRevision", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Spec sections included" hint="e.g., 07 52 13, 07 62 00">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.specSections ?? ""}
            placeholder="07 52 13, 07 62 00, 07 72 00"
            onBlur={e => saveField("specSections", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Addenda incorporated through #">
            <input
              type="number"
              className={INPUT_CLS}
              defaultValue={data.addendaThrough ?? ""}
              min={0}
              placeholder="0"
              onBlur={e => saveField("addendaThrough", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </Field>
          <Field label="Drawing sheets referenced" hint="e.g., A-501, S-201">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.drawingSheets ?? ""}
              placeholder="A-501, A-502, S-201"
              onBlur={e => saveField("drawingSheets", e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Section 2: Labor */}
      <SectionCard title="👷 Labor">
        <Field label="Labor type">
          <RadioGroup
            value={data.laborType}
            options={[
              { id: "open_shop", label: "Open Shop" },
              { id: "prevailing_wage", label: "Prevailing Wage" },
              { id: "union", label: "Union" },
            ]}
            onChange={v => saveField("laborType", v, true)}
          />
        </Field>
        {data.laborType === "prevailing_wage" && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Wage determination #">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.wageDeterminationNum ?? ""}
                placeholder="WD-2025-00123"
                onBlur={e => saveField("wageDeterminationNum", e.target.value)}
              />
            </Field>
            <Field label="Effective date">
              <input
                type="date"
                className={INPUT_CLS}
                defaultValue={data.wageDeterminationDate ?? ""}
                onBlur={e => saveField("wageDeterminationDate", e.target.value)}
              />
            </Field>
          </div>
        )}
        {data.laborType === "union" && (
          <Field label="Union local #">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.unionLocal ?? ""}
              placeholder="Local 210"
              onBlur={e => saveField("unionLocal", e.target.value)}
            />
          </Field>
        )}
        <Field label="Labor burden rate" hint="for your reference">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.laborBurdenRate ?? ""}
            placeholder="42%"
            onBlur={e => saveField("laborBurdenRate", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 3: Schedule & Timing */}
      <SectionCard title="📅 Schedule & Timing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated duration">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.estimatedDuration ?? ""}
              placeholder="45 working days"
              onBlur={e => saveField("estimatedDuration", e.target.value)}
            />
          </Field>
          <Field label="Earliest start date">
            <input
              type="date"
              className={INPUT_CLS}
              defaultValue={data.earliestStart ?? ""}
              onBlur={e => saveField("earliestStart", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Material lead time">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.materialLeadTime ?? ""}
              placeholder="3-4 weeks ARO"
              onBlur={e => saveField("materialLeadTime", e.target.value)}
            />
          </Field>
          <Field label="Submittal turnaround">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.submittalTurnaround ?? ""}
              placeholder="10 business days after NTP"
              onBlur={e => saveField("submittalTurnaround", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Bid good for">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.bidGoodFor ?? "30 days"}
            placeholder="30 days"
            onBlur={e => saveField("bidGoodFor", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 4: Insurance & Bonding */}
      <SectionCard title="🛡️ Insurance & Bonding">
        <Field label="Insurance program">
          <RadioGroup
            value={data.insuranceProgram}
            options={[
              { id: "own", label: "Provide own GL/WC" },
              { id: "ccip", label: "CCIP" },
              { id: "ocip", label: "OCIP" },
            ]}
            onChange={v => saveField("insuranceProgram", v, true)}
          />
        </Field>
        {(data.insuranceProgram === "ccip" || data.insuranceProgram === "ocip") && (
          <Field label="Wrap-up enrollment / admin contact">
            <input
              type="text"
              className={INPUT_CLS}
              defaultValue={data.wrapUpNotes ?? ""}
              placeholder="Contact name, portal URL, or enrollment notes"
              onBlur={e => saveField("wrapUpNotes", e.target.value)}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Additional insured required">
            <Toggle value={data.additionalInsuredRequired} onChange={v => saveField("additionalInsuredRequired", v, true)} />
          </Field>
          <Field label="Builder's risk by">
            <RadioGroup
              value={data.buildersRiskBy}
              options={[
                { id: "owner", label: "Owner" },
                { id: "gc", label: "GC" },
                { id: "included", label: "Include in bid" },
              ]}
              onChange={v => saveField("buildersRiskBy", v, true)}
            />
          </Field>
        </div>
        <Field label="Bond required">
          <Toggle value={data.bondRequired} onChange={v => saveField("bondRequired", v, true)} />
        </Field>
        {data.bondRequired && (
          <Field label="Bond type(s)">
            <div className="flex gap-3 flex-wrap">
              {[
                { id: "performance", label: "Performance" },
                { id: "payment", label: "Payment" },
                { id: "bid_bond", label: "Bid Bond" },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bondTypesSet.has(opt.id)}
                    onChange={() => toggleBondType(opt.id)}
                    style={{ width: 14, height: 14, accentColor: "#1e293b" }}
                  />
                  <span style={{ fontSize: 13, color: "#374151" }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </Field>
        )}
        <Field label="EMR" hint="Experience Modification Rate">
          <input
            type="text"
            className={INPUT_CLS}
            defaultValue={data.emr ?? ""}
            placeholder="0.82"
            style={{ maxWidth: 120 }}
            onBlur={e => saveField("emr", e.target.value)}
          />
        </Field>
      </SectionCard>

      {/* Section 5: Compliance */}
      <SectionCard title="📋 Compliance">
        <Field label="MBE/WBE/DBE goals">
          <Toggle value={data.mbeGoals} onChange={v => saveField("mbeGoals", v, true)} label={data.mbeGoals ? "Yes — goals apply" : "No"} />
        </Field>
        {data.mbeGoals && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Goal %">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.mbeGoalPct ?? ""}
                placeholder="10%"
                onBlur={e => saveField("mbeGoalPct", e.target.value)}
              />
            </Field>
            <Field label="Certifications held">
              <input
                type="text"
                className={INPUT_CLS}
                defaultValue={data.mbeCertifications ?? ""}
                placeholder="MBE, WBE"
                onBlur={e => saveField("mbeCertifications", e.target.value)}
              />
            </Field>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Toggle
            value={data.certifiedPayrollRequired}
            onChange={v => saveField("certifiedPayrollRequired", v, true)}
            label="Prevailing wage certified payroll required"
          />
          <Toggle
            value={data.safetyPlanRequired}
            onChange={v => saveField("safetyPlanRequired", v, true)}
            label="Safety program / site-specific safety plan required"
          />
          <Toggle
            value={data.backgroundChecksRequired}
            onChange={v => saveField("backgroundChecksRequired", v, true)}
            label="Background checks required"
          />
        </div>
      </SectionCard>

      {/* Section 6: Qualifications & Exceptions */}
      <SectionCard title="📝 Qualifications & Exceptions to Bid">
        <Field label="Notes">
          <textarea
            className="w-full text-[13px] rounded-lg px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:outline-none bg-white text-slate-800 resize-none"
            rows={5}
            defaultValue={data.qualificationsNotes ?? ""}
            placeholder="List any qualifications, exceptions, or conditions you're attaching to your bid. E.g.: 'Price excludes after-hours work', 'Assumes single-layer tear-off', 'Bid does not include hazmat abatement'"
            onBlur={e => saveField("qualificationsNotes", e.target.value)}
          />
        </Field>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>
          💡 These notes will appear in your Pre-Submission checklist for final review.
        </p>
      </SectionCard>

    </div>
  );
}
