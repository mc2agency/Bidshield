"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const userData = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  // Create user in Convex when they first sign in
  useEffect(() => {
    if (user && !userData) {
      getOrCreateUser({
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || user.emailAddresses[0].emailAddress,
        clerkId: user.id,
      });
    }
  }, [user, userData, getOrCreateUser]);

  if (!user) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}!
          </h1>
          <p className="text-slate-300 text-lg">
            Continue your estimating journey
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Membership Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Membership Status
              </h2>
              <p className="text-slate-600">
                Current plan:{" "}
                <span className="font-semibold capitalize">
                  {userData?.membershipLevel || "Free"}
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

        {/* My Courses */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            My Courses
          </h2>
          {userData?.purchasedCourses && userData.purchasedCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.purchasedCourses.map((courseId) => (
                <div
                  key={courseId}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    {courseId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    Continue where you left off
                  </p>
                  <Link
                    href={`/courses/${courseId}`}
                    className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-6">
                You haven't purchased any courses yet.
              </p>
              <Link
                href="/courses"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* My Products */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            My Products
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
                    href={`/products/${productId}`}
                    className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    View Product →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-6">
                You haven't purchased any products yet.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
