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
    <div className="rounded-xl p-5 flex flex-col gap-4 transition-all" style={{ background: "var(--bs-bg-card)", border: "1px solid var(--bs-border)" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: "var(--bs-bg-elevated)" }}>
          {template.icon}
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--bs-text-primary)" }}>{template.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--bs-text-dim)" }}>
        <svg className="w-4 h-4" style={{ color: "var(--bs-teal)" }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Excel (.xlsx) &bull; Pre-built formulas
      </div>

      {isPro || isDemo ? (
        <a
          href={isDemo ? "/sign-up" : downloadUrl}
          className="block w-full py-2 text-xs font-semibold rounded-lg text-center transition-colors"
          style={{ background: "var(--bs-teal)", color: "#13151a" }}
        >
          {isDemo ? "Sign up to download" : "↓ Download Excel"}
        </a>
      ) : (
        <Link
          href="/bidshield/pricing"
          className="block w-full py-2 text-xs font-semibold rounded-lg text-center transition-colors"
          style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)", border: "1px solid var(--bs-border)" }}
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
        <h2 className="text-xl font-semibold" style={{ color: "var(--bs-text-primary)" }}>📊 Bid Starter Templates</h2>
        <p className="text-sm mt-1" style={{ color: "var(--bs-text-dim)" }}>
          Pre-built Excel workbooks for every roofing system — use as a starting point alongside BidShield
        </p>
      </div>

      {!isPro && !isDemo && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: "var(--bs-amber-dim)", border: "1px solid var(--bs-amber)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--bs-amber)" }}>
            ⚡ Template downloads are included with Pro. Upgrade to access all 8 files.
          </p>
          <Link href="/bidshield/pricing" className="shrink-0 text-xs font-semibold underline underline-offset-2 transition-colors" style={{ color: "var(--bs-amber)" }}>
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
          <p className="text-xs" style={{ color: "var(--bs-text-dim)" }}>Need the full bundle? <Link href="/dashboard/downloads" className="hover:underline font-medium" style={{ color: "var(--bs-teal)" }}>View all your downloads →</Link></p>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: "var(--bs-text-dim)" }}>Loading templates...</div>
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
