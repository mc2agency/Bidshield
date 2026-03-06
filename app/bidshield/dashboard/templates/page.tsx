"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const TEMPLATES = [
  {
    id: "tpo",
    name: "TPO Single-Ply",
    description: "Material takeoff, coverage calcs, and labor for TPO membrane systems",
    icon: "🔵",
    file: "TPO_Roofing_Estimator_Template.xlsx",
    productId: "tpo-template",
  },
  {
    id: "epdm",
    name: "EPDM Single-Ply",
    description: "EPDM membrane estimating with waste factors and seam calculations",
    icon: "⬛",
    file: "EPDM_Roofing_Estimator_Template.xlsx",
    productId: "epdm",
  },
  {
    id: "sbs",
    name: "SBS Modified Bitumen",
    description: "SBS/APP mod-bit estimating with layer counts and mop calculations",
    icon: "🟤",
    file: "Siplast_SBS_Estimator_Template.xlsx",
    productId: "sbs-template",
  },
  {
    id: "metal",
    name: "Metal Standing Seam",
    description: "Panel counts, trim lineal footage, and fastener schedules",
    icon: "🩶",
    file: "Metal_Roofing_Estimator_Template.xlsx",
    productId: "metal-roofing",
  },
  {
    id: "asphalt-shingle",
    name: "Asphalt Shingle",
    description: "Square counts, starter and ridge calculations, underlayment coverage",
    icon: "🏠",
    file: "Roofing_Estimator_Template.xlsx",
    productId: "asphalt-shingle",
  },
  {
    id: "tile",
    name: "Tile Roofing",
    description: "Tile counts by exposure, mortar quantities, and underlayment",
    icon: "🪨",
    file: "Tile_Roofing_Estimator_Template.xlsx",
    productId: "tile-roofing",
  },
  {
    id: "bur",
    name: "Built-Up Roofing (BUR)",
    description: "Ply calculations, flood coat coverage, and aggregate quantities",
    icon: "🟫",
    file: "BUR_Estimator_Template.xlsx",
    productId: "bur",
  },
  {
    id: "spray-foam",
    name: "Spray Foam (SPF)",
    description: "Board-foot calculations, coverage rates, and coating quantities",
    icon: "🟡",
    file: "Spray_Foam_Insulation_Estimator_Template.xlsx",
    productId: "spray-foam",
  },
];

function TemplateCard({ template, isPro, isDemo }: {
  template: typeof TEMPLATES[0];
  isPro: boolean;
  isDemo: boolean;
}) {
  const downloadUrl = `/api/download?file=${encodeURIComponent(template.file)}&productId=${template.productId}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
          {template.icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{template.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Excel (.xlsx) &bull; Pre-built formulas
      </div>

      {isPro || isDemo ? (
        <a
          href={isDemo ? "/sign-up" : downloadUrl}
          className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg text-center transition-colors"
        >
          {isDemo ? "Sign up to download" : "↓ Download Excel"}
        </a>
      ) : (
        <Link
          href="/bidshield/pricing"
          className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg text-center transition-colors"
        >
          🔒 Pro only — Upgrade
        </Link>
      )}
    </div>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const { userId } = useAuth();

  const subscription = useQuery(
    api.users.getUserSubscription,
    !isDemo && userId ? { clerkId: userId } : "skip"
  );
  const isPro = isDemo ? false : (subscription?.isPro ?? false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">📊 Estimating Templates</h2>
        <p className="text-sm text-slate-400 mt-1">
          Pre-built Excel estimators for every roofing system
        </p>
      </div>

      {!isPro && !isDemo && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium">
            ⚡ Template downloads are included with Pro. Upgrade to access all 8 files.
          </p>
          <Link href="/bidshield/pricing" className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
            Upgrade to Pro
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.id} template={t} isPro={isPro} isDemo={isDemo} />
        ))}
      </div>

      {isPro && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">Need the full bundle? <Link href="/dashboard/downloads" className="text-emerald-600 hover:underline font-medium">View all your downloads →</Link></p>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400 text-sm">Loading templates...</div>
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
