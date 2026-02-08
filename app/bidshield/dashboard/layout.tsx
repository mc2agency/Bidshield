"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/bidshield/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/bidshield/dashboard/checklist", icon: "📋", label: "Checklist" },
  { href: "/bidshield/dashboard/addenda", icon: "📁", label: "Addenda" },
  { href: "/bidshield/dashboard/quotes", icon: "💰", label: "Quotes" },
  { href: "/bidshield/dashboard/rfis", icon: "📨", label: "RFIs" },
  { href: "/bidshield/dashboard/labor", icon: "👷", label: "Labor" },
  { href: "/bidshield/dashboard/validator", icon: "🛡️", label: "Validator" },
  { href: "/bidshield/dashboard/analytics", icon: "📈", label: "Analytics" },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const demoParam = searchParams.get("demo");
    if (demoParam === "true") {
      setIsDemo(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted && isLoaded && !isSignedIn && !isDemo) {
      router.push("/sign-in");
    }
  }, [mounted, isLoaded, isSignedIn, isDemo, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading BidShield...</div>
      </div>
    );
  }

  if (!isLoaded && !isDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading BidShield...</div>
      </div>
    );
  }

  if (!isSignedIn && !isDemo) {
    return null;
  }

  const getHref = (href: string) => isDemo ? `${href}?demo=true` : href;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {isDemo && (
        <div className="bg-amber-500 text-black text-center py-2 text-sm font-medium">
          🎯 Demo Mode — <Link href="/sign-up" className="underline">Sign up free</Link> to save your projects
        </div>
      )}

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Link href="/bidshield" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold text-white tracking-tight">BidShield</span>
          </Link>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">FREE</span>
        </div>

        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/bidshield/dashboard"
                ? pathname === "/bidshield/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← MC2 Home
          </Link>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : isDemo ? (
            <Link 
              href="/sign-up" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
          ) : null}
        </div>
      </header>

      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        {navItems.map((item) => {
          const isActive =
            item.href === "/bidshield/dashboard"
              ? pathname === "/bidshield/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={getHref(item.href)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">{children}</main>

      <footer className="flex justify-between px-6 py-4 border-t border-slate-700 text-xs text-slate-500">
        <span>BidShield — Roofing Estimating System</span>
        <span>Protecting contractors from costly bidding errors</span>
      </footer>
    </div>
  );
}

export default function BidShieldDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading BidShield...</div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
