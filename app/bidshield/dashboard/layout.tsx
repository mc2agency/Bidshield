"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/bidshield/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/bidshield/dashboard/checklist", icon: "📋", label: "Checklist" },
  { href: "/bidshield/dashboard/validator", icon: "🛡️", label: "Validator" },
  { href: "/bidshield/dashboard/quotes", icon: "💰", label: "Quotes" },
  { href: "/bidshield/dashboard/labor", icon: "👷", label: "Labor" },
  { href: "/bidshield/dashboard/datasheets", icon: "📑", label: "Data Sheets" },
];

export default function BidShieldDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading BidShield...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Link href="/bidshield" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold text-white tracking-tight">BidShield</span>
          </Link>
          <span className="text-[11px] text-slate-500 bg-slate-700 px-2 py-0.5 rounded">PRO</span>
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
                href={item.href}
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
          <UserButton afterSignOutUrl="/" />
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
              href={item.href}
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
        <span>BidShield PRO — Roofing Estimating Intelligence System</span>
        <span>Protecting contractors from costly bidding errors</span>
      </footer>
    </div>
  );
}
