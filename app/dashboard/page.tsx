"use client";

import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Loading component shown during SSR and initial load
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Loading...
        </h2>
      </div>
    </div>
  );
}

// Main dashboard content - only rendered on client when providers are available
function DashboardContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const userData = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const userCreationAttempted = useRef(false);

  // Create user in Convex when they first sign in
  useEffect(() => {
    // Wait until Clerk has loaded and we have a user
    if (!isUserLoaded || !user) return;
    // userData being undefined means the query is still loading
    // userData being null means the user doesn't exist in Convex
    if (userData === undefined) return;
    // Only attempt creation once per session to prevent duplicate calls
    if (userCreationAttempted.current) return;

    if (userData === null) {
      userCreationAttempted.current = true;
      getOrCreateUser({
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.emailAddresses[0].emailAddress,
        clerkId: user.id,
      });
    }
  }, [user, isUserLoaded, userData, getOrCreateUser]);

  if (!user) {
    return <DashboardLoading />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}!
          </h1>
          <p className="text-slate-300 text-lg">
            Your MC2 Estimating dashboard
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Access Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Access Status
              </h2>
              <p className="text-slate-600">
                Current plan:{" "}
                <span className="font-semibold capitalize">
                  {userData?.membershipLevel === "pro" ? "MC2 Pro" : "Free"}
                </span>
              </p>
            </div>
            {userData?.membershipLevel === "free" && (
              <Link
                href="/membership"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* My Tools & Templates */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            My Tools & Templates
          </h2>
          {userData?.purchasedProducts && userData.purchasedProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.purchasedProducts.map((productId) => (
                <div
                  key={productId}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    {productId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <Link
                    href="/dashboard/downloads"
                    className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Download
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-6">
                You haven&apos;t purchased any tools yet.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Tools & Templates
              </Link>
            </div>
          )}
        </div>

        {/* BidShield */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🛡️</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">BidShield — Free Bid Management</h2>
              <p className="text-slate-300">
                Track projects, manage RFIs, validate estimates, and never miss a checklist item. Built by an 11-year estimator.
              </p>
            </div>
            <Link
              href="/bidshield/dashboard"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              Open BidShield
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Links
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Link
              href="/dashboard/downloads"
              className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all text-center"
            >
              <div className="text-4xl mb-3">📥</div>
              <h3 className="font-semibold text-slate-900">My Downloads</h3>
              <p className="text-sm text-slate-600 mt-2">Access your templates</p>
            </Link>
            <Link
              href="/products"
              className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all text-center"
            >
              <div className="text-4xl mb-3">🛠️</div>
              <h3 className="font-semibold text-slate-900">Browse Tools</h3>
              <p className="text-sm text-slate-600 mt-2">View all available templates</p>
            </Link>
            <Link
              href="/updates"
              className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all text-center"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-slate-900">Product Updates</h3>
              <p className="text-sm text-slate-600 mt-2">See latest improvements</p>
            </Link>
            <Link
              href="/contact"
              className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all text-center"
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-slate-900">Get Support</h3>
              <p className="text-sm text-slate-600 mt-2">Contact our team</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Page component - skip SSR to avoid Clerk/Convex provider issues during prerender
export default dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => <DashboardLoading />,
});
