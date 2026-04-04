"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// P1-1: Admin ID from env var only. Set NEXT_PUBLIC_ADMIN_USER_ID in Vercel env vars.
// If not set, the admin page will be inaccessible (fails closed, not open).
const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? null;

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && (!ADMIN_ID || userId !== ADMIN_ID)) router.push("/");
  }, [isLoaded, userId, router]);

  const data = useQuery(api.users.adminGetAllData, ADMIN_ID && userId === ADMIN_ID ? {} : "skip");

  if (!isLoaded || !ADMIN_ID || userId !== ADMIN_ID) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Access denied.</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const proUsers = data.users.filter((u) => u.membershipLevel === "bidshield" || u.membershipLevel === "pro");
  const mrr = proUsers.length * 249; // P1-2: corrected from $149 to $249/mo
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSignups = data.users.filter((u) => u.createdAt >= sevenDaysAgo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">bidshield.co — internal only</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl font-bold text-white">{data.users.length}</div>
            <div className="text-xs text-slate-500 mt-1">Total Users</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl font-bold text-emerald-400">{proUsers.length}</div>
            <div className="text-xs text-slate-500 mt-1">Pro Subscribers</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl font-bold text-blue-400">${mrr.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">MRR (est.)</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <div className="text-3xl font-bold text-amber-400">{recentSignups.length}</div>
            <div className="text-xs text-slate-500 mt-1">Signups (7d)</div>
          </div>
        </div>

        {/* Recent signups */}
        {recentSignups.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Signups — Last 7 Days</h2>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((u) => (
                    <tr key={u._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-200">{u.email}</td>
                      <td className="px-4 py-3 text-slate-400">{u.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          u.membershipLevel === "bidshield" || u.membershipLevel === "pro"
                            ? "bg-emerald-900/50 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {u.membershipLevel === "bidshield" ? "Pro" : u.membershipLevel === "pro" ? "Pro" : "Free"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All users */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">All Users ({data.users.length})</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Projects</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Signed Up</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const projectCount = data.projects.filter((p) => p.userId === u.clerkId).length;
                  const isPro = u.membershipLevel === "bidshield" || u.membershipLevel === "pro";
                  return (
                    <tr key={u._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-200">{u.email}</td>
                      <td className="px-4 py-3 text-slate-400">{u.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isPro ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {isPro ? "Pro" : "Free"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">{projectCount}</td>
                      <td className="px-4 py-3 text-slate-500">{fmt(u.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-500">{u.lastLoginAt ? fmt(u.lastLoginAt) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* All projects */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">All Projects ({data.projects.length})</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bid Date</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((p) => {
                  const owner = data.users.find((u) => u.clerkId === p.userId);
                  const statusColors: Record<string, string> = {
                    won: "bg-emerald-900/50 text-emerald-400",
                    lost: "bg-red-900/50 text-red-400",
                    in_progress: "bg-amber-900/50 text-amber-400",
                    submitted: "bg-blue-900/50 text-blue-400",
                    setup: "bg-slate-800 text-slate-400",
                    no_bid: "bg-slate-800 text-slate-500",
                  };
                  return (
                    <tr key={p._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium truncate max-w-[220px]">{p.name}</div>
                        <div className="text-slate-500 text-xs">{p.location}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{owner?.email || p.userId.slice(0, 12) + "…"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusColors[p.status] || "bg-slate-800 text-slate-400"}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.bidDate}</td>
                      <td className="px-4 py-3 text-slate-500">{fmt(p.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
