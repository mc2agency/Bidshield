"use client";

import { useState } from "react";

const PHASES = [
  {
    n: 1,
    title: "Pre-Bid Setup",
    summary: "Project info, bid date, GC, roof area, system type",
    items: ["Project name, address, and location entered", "Bid due date and time confirmed", "General Contractor and PM identified", "Estimated roof area (SF) set as control number", "Roof system type selected (TPO, PVC, EPDM, SBS, etc.)"],
  },
  {
    n: 2,
    title: "Plans & Drawing Review",
    summary: "Drawing date, revision set, spec section, plan coverage",
    items: ["Current drawing issue date and revision set confirmed", "Spec section 07 50 00 (or applicable) located", "Scope narrative and roof plan match", "Drawing scale verified and area cross-checked", "All roof areas shown on plan are included in scope"],
  },
  {
    n: 3,
    title: "Addenda Verification",
    summary: "All addenda received, scope changes captured and priced",
    items: ["Number of addenda issued confirmed with GC", "Each addendum reviewed for scope impact", "Addenda-driven changes reflected in estimate", "Addendum receipt confirmed in Bid Quals", "Spec or drawing changes noted and priced"],
  },
  {
    n: 4,
    title: "Site Conditions",
    summary: "Existing conditions, access, occupancy, safety requirements",
    items: ["Building occupancy status during work confirmed", "Roof access method identified (ladder, stairs, hatch)", "Rigging or crane requirements evaluated", "Existing insulation and membrane type noted for disposal", "Noise / hours restrictions documented"],
  },
  {
    n: 5,
    title: "Deck Identification",
    summary: "Deck type, thickness, attachment method per spec",
    items: ["Deck type confirmed (steel, concrete, wood, LWC, gypsum)", "Deck thickness and rib profile identified for steel", "Spec attachment requirements (fastener spacing) reviewed", "Deck condition noted — repair scope included if needed", "Vented vs unvented assembly addressed"],
  },
  {
    n: 6,
    title: "Drainage & Slope",
    summary: "Drain count, scuppers, slope-to-drain, ponding risk",
    items: ["Interior drain count and locations verified on plan", "Overflow drain / scupper locations confirmed", "Slope-to-drain requirement verified (1/4\" min per foot)", "Tapered insulation required for slope-to-drain noted", "Ponding areas identified and remediation scoped"],
  },
  {
    n: 7,
    title: "Perimeter & Edge Metal",
    summary: "Coping, fascia, gravel stops, expansion joints",
    items: ["Coping cap or gravel stop type and color confirmed", "Perimeter linear footage measured and included", "Expansion joint covers scoped and sized", "Fascia / soffits in scope or excluded and documented", "Special profile or custom metal noted for fabrication lead time"],
  },
  {
    n: 8,
    title: "Penetrations & Curbs",
    summary: "HVAC count, pipe boots, skylights, curb heights",
    items: ["HVAC equipment units counted against plan", "Pipe penetration count tallied by size", "Skylight curbs and dimensions noted", "Curb heights per spec (8\" min above finished roof)", "All penetration flashings included in scope"],
  },
  {
    n: 9,
    title: "Insulation Design",
    summary: "R-value, tapered vs flat, cover board, code compliance",
    items: ["Required R-value per spec or energy code confirmed", "Tapered insulation layout designed or referenced", "Cover board requirement (e.g., 1/2\" GP DensDeck) included", "Insulation thickness and layers priced", "Thermal bridging at fasteners addressed per spec"],
  },
  {
    n: 10,
    title: "Membrane Specification",
    summary: "Membrane type, thickness, seam method, warranty tier",
    items: ["Membrane type matches spec (TPO, PVC, EPDM, etc.)", "Membrane thickness confirmed (60 mil, 80 mil, etc.)", "Seam method — heat welded vs adhesive vs tape", "Manufacturer warranty level and requirements noted", "Color and UV reflectivity per spec confirmed"],
  },
  {
    n: 11,
    title: "Flashing & Accessories",
    summary: "Base flashing heights, walkway pads, pitch pans",
    items: ["Base flashing height at walls meets spec (min 8\")", "Walkway pad locations and coverage area scoped", "Pitch pans for odd-shaped penetrations included", "Pre-fabricated vs field-fabricated flashings determined", "Sealants and termination bar locations noted"],
  },
  {
    n: 12,
    title: "Takeoff Reconciliation",
    summary: "Takeoff SF vs control number, section-by-section delta",
    items: ["All roof areas taken off by section or zone", "Sum of sections checked against control SF", "Delta within ±2% tolerance — flagged if exceeded", "Deductions for equipment, skylights, curbs applied", "Waste factor applied by assembly type"],
  },
  {
    n: 13,
    title: "Labor Verification",
    summary: "Labor type, crew size, production rates, duration",
    items: ["Labor type declared: Open Shop, Union, or Prevailing Wage", "Prevailing wage rates pulled for correct county/trade", "Crew size and production rate assumptions documented", "Project duration estimated and weather days allocated", "Premium time / overtime factored if required"],
  },
  {
    n: 14,
    title: "Subcontractor Quote Review",
    summary: "All subs quoted, scope verified, expiry dates checked",
    items: ["All sub-trades (sheet metal, insulation, etc.) have quotes", "Each quote reviewed for scope inclusion/exclusion match", "Quote expiry date is after bid date", "Lowest responsive sub selected — scope verified", "Alternates priced for each major sub trade if required"],
  },
  {
    n: 15,
    title: "Material Pricing Verification",
    summary: "Quote prices vs estimate, waste factors, freight costs",
    items: ["Supplier quotes received for membrane and insulation", "Quote pricing vs budgeted unit prices reconciled", "Freight, delivery, and staging costs included", "Material lead times checked against schedule", "Fluctuating material pricing — escalation clause considered"],
  },
  {
    n: 16,
    title: "General Conditions",
    summary: "Supervision, equipment, safety, permits, dumpsters",
    items: ["Project superintendent cost included", "Equipment rental (crane, lifts, compressors) scoped", "Safety plan requirements (SSSP, fall protection) priced", "Dumpster and haul-off included for tear-off scope", "Permit fees and inspection costs included"],
  },
  {
    n: 17,
    title: "Bid Qualifications & Compliance",
    summary: "Labor type, insurance program, bond, GC bid form",
    items: ["Insurance program declared (GL/WC, CCIP, or OCIP)", "Bond requirement and cost included if required", "GC bid form / Exhibit A fully completed", "Addenda confirmed in bid form or cover letter", "MBE/WBE/DBE goal compliance addressed if required"],
  },
  {
    n: 18,
    title: "Final Validation & Submission",
    summary: "Readiness score ≥ 90%, exclusions drafted, bid packaged",
    items: ["Bid Readiness Score is 90% or higher", "Exclusions list drafted and reviewed", "Bid summary and $/SF benchmarked vs historical", "Submission format confirmed (email, portal, hard copy)", "All required attachments compiled and checked"],
  },
];

function PhaseIcon({ n }: { n: number }) {
  const icons: Record<number, React.ReactNode> = {
    1:  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75" />,
    2:  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
    3:  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    4:  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />,
    5:  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />,
    6:  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />,
    7:  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />,
    8:  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />,
    9:  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />,
    10: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />,
    11: <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />,
    12: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />,
    13: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
    14: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />,
    15: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />,
    16: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006-3.75 3.75m0 0-3.75-3.75m3.75 3.75V9.75m0 0a48.667 48.667 0 0 0-3.413.387c-1.069.16-1.837 1.094-1.837 2.175v1.33m0 0a2.178 2.178 0 0 1-.75 1.661V12.75m0 0v4.25" />,
    17: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />,
    18: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />,
  };

  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {icons[n]}
    </svg>
  );
}

export default function ChecklistAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (n: number) => setOpen(prev => prev === n ? null : n);

  return (
    <div className="space-y-2">
      {PHASES.map((phase) => {
        const isOpen = open === phase.n;
        return (
          <div
            key={phase.n}
            className={`rounded-xl border transition-all duration-200 ${
              isOpen ? "border-emerald-200 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <button
              onClick={() => toggle(phase.n)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              {/* Phase number + icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isOpen ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                <PhaseIcon n={phase.n} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phase {phase.n}</span>
                </div>
                <div className={`text-sm font-semibold ${isOpen ? "text-emerald-900" : "text-slate-900"}`}>
                  {phase.title}
                </div>
                {!isOpen && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{phase.summary}</div>
                )}
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-5 pb-5">
                <div className="pl-14">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Checklist items in this phase
                  </p>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
