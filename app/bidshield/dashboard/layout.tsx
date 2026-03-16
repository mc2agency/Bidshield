"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { gtagEvent } from "@/lib/gtag";

const NAV_ITEMS = [
  {
    href: "/bidshield/dashboard",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/bidshield/dashboard/analytics",
    label: "Analytics",
    exact: false,
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    href: "/bidshield/dashboard/templates",
    label: "Templates",
    exact: false,
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    href: "/bidshield/dashboard/datasheets",
    label: "Quotes & Pricing",
    exact: false,
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25v2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 13.522 3.75 11.25V8.625m16.5 2.625v2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-2.625" />
      </svg>
    ),
  },
];

function Sidebar({ isDemo, pathname }: { isDemo: boolean; pathname: string }) {
  // Project pages have their own sidebar — hide the outer one entirely
  if (pathname.startsWith("/bidshield/dashboard/project")) return null;

  const { userId, isSignedIn } = useAuth();
  const subscription = useQuery(
    api.users.getUserSubscription,
    !isDemo && userId ? { clerkId: userId } : "skip"
  );
  const isPro = isDemo || (subscription?.isPro ?? false);
  const demoSuffix = isDemo ? "?demo=true" : "";

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-900 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">BidShield</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, exact, icon }) => {
          const active = isActive(href, exact);
          const fullHref = href + demoSuffix;
          return (
            <Link
              key={href}
              href={fullHref}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                active
                  ? "bg-emerald-600/15 text-emerald-400 border-emerald-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 border-transparent"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Free plan — subtle single-line at sidebar bottom */}
      {!isDemo && !isPro && isSignedIn && (
        <div className="px-4 pb-2">
          <span className="text-[12px] text-slate-500">Free plan · </span>
          <Link href="/bidshield/pricing" className="text-[12px] text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
            Upgrade →
          </Link>
        </div>
      )}

      {/* User / Plan footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        {isDemo ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">D</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-300 truncate">Demo Mode</div>
                <div className="text-[10px] text-slate-500">Not saved</div>
              </div>
            </div>
            <Link href="/sign-up" className="block text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Start Free
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userId ? userId.slice(5, 7).toUpperCase() : "??"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">
                {isSignedIn ? "Signed in" : "—"}
              </div>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${isPro ? "bg-emerald-900 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                {isPro ? "Pro" : "Free"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (isLoaded && !isSignedIn && !isDemo) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, isDemo, router]);

  useEffect(() => {
    if (!userId || !isSignedIn) return;
    const key = `bs_signup_tracked_${userId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    gtagEvent("sign_up");
  }, [userId, isSignedIn]);

  if (!isLoaded && !isDemo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg">Loading BidShield...</div>
      </div>
    );
  }

  if (!isSignedIn && !isDemo) {
    return null;
  }

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 4rem)", background: "#f8fafc" }}>
      <Sidebar isDemo={isDemo} pathname={pathname} />

      <div className="flex-1 flex flex-col min-w-0">
        {isDemo && (
          <div className="bg-emerald-600 text-white text-center py-2.5 text-sm font-medium shrink-0">
            🎯 Demo mode — <Link href="/sign-up" className="underline font-semibold">Start free</Link> to save your own bids
          </div>
        )}
        <main className="flex-1 min-w-0 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function BidShieldDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg">Loading BidShield...</div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
