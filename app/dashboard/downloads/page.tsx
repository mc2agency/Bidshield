"use client";

import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useEffect, useState } from "react";

// Product ID → file mapping (must match download API)
const PRODUCT_FILES: Record<string, { name: string; files: string[] }> = {
  "asphalt-shingle": { name: "Asphalt Shingle Estimator", files: ["Roofing_Estimator_Template.xlsx"] },
  "bur": { name: "BUR (Built-Up Roofing) Estimator", files: ["BUR_Estimator_Template.xlsx"] },
  "epdm": { name: "EPDM Estimator", files: ["EPDM_Roofing_Estimator_Template.xlsx"] },
  "metal": { name: "Metal Standing Seam Estimator", files: ["Metal_Roofing_Estimator_Template.xlsx"] },
  "metal-roofing": { name: "Metal Standing Seam Estimator", files: ["Metal_Roofing_Estimator_Template.xlsx"] },
  "sbs": { name: "SBS Modified Bitumen Estimator", files: ["Siplast_SBS_Estimator_Template.xlsx"] },
  "sbs-template": { name: "SBS Modified Bitumen Estimator", files: ["Siplast_SBS_Estimator_Template.xlsx"] },
  "spray-foam": { name: "Spray Foam Insulation Estimator", files: ["Spray_Foam_Insulation_Estimator_Template.xlsx"] },
  "tile": { name: "Tile Roofing Estimator", files: ["Tile_Roofing_Estimator_Template.xlsx"] },
  "tile-roofing": { name: "Tile Roofing Estimator", files: ["Tile_Roofing_Estimator_Template.xlsx"] },
  "tpo": { name: "TPO Single-Ply Estimator", files: ["TPO_Roofing_Estimator_Template.xlsx"] },
  "tpo-template": { name: "TPO Single-Ply Estimator", files: ["TPO_Roofing_Estimator_Template.xlsx"] },
  "template-bundle": {
    name: "Complete Template Bundle",
    files: [
      "Roofing_Estimator_Template.xlsx",
      "BUR_Estimator_Template.xlsx",
      "EPDM_Roofing_Estimator_Template.xlsx",
      "Metal_Roofing_Estimator_Template.xlsx",
      "Siplast_SBS_Estimator_Template.xlsx",
      "Spray_Foam_Insulation_Estimator_Template.xlsx",
      "Tile_Roofing_Estimator_Template.xlsx",
      "TPO_Roofing_Estimator_Template.xlsx",
    ],
  },
};

function DownloadsContent() {
  const { user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userData = useQuery(
    api.users.getCurrentUser,
    isClient && user ? { clerkId: user.id } : "skip"
  );

  if (!isClient || !isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your downloads...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign in to access your downloads</h1>
          <Link
            href="/sign-in"
            className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Get all downloadable files from purchased products
  const purchasedProducts = userData?.purchasedProducts ?? [];
  const isPro = userData?.membershipLevel === "pro";

  // Deduplicate files across purchases
  const allFiles = new Map<string, { productName: string; fileName: string }>();

  const productsToShow = isPro ? Object.keys(PRODUCT_FILES) : purchasedProducts;

  for (const productId of productsToShow) {
    const product = PRODUCT_FILES[productId];
    if (product) {
      for (const file of product.files) {
        if (!allFiles.has(file)) {
          allFiles.set(file, { productName: product.name, fileName: file });
        }
      }
    }
  }

  const downloadableFiles = Array.from(allFiles.values());

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">My Downloads</h1>
          <p className="text-slate-300">
            {isPro
              ? "BidShield Pro member — access all templates"
              : `${purchasedProducts.length} product${purchasedProducts.length !== 1 ? "s" : ""} purchased`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {downloadableFiles.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Templates</h2>
            <div className="space-y-3">
              {downloadableFiles.map(({ productName, fileName }) => (
                <a
                  key={fileName}
                  href={`/api/download?file=${encodeURIComponent(fileName)}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors group"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{fileName.replace(/_/g, " ").replace(".xlsx", "")}</p>
                    <p className="text-sm text-slate-500">{productName}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No templates yet</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Purchase estimating templates to access them here anytime. Templates are Excel files you can customize for your business.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Browse Templates
            </Link>
          </div>
        )}

        {/* BidShield promo */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🛡️</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Try BidShield FREE</h3>
              <p className="text-slate-300">
                Track your bids, manage RFIs, and never miss a checklist item. Built by a 11-year estimator.
              </p>
            </div>
            <Link
              href="/bidshield/dashboard?demo=true"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default dynamicImport(() => Promise.resolve(DownloadsContent), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading your downloads...</p>
      </div>
    </main>
  ),
});
