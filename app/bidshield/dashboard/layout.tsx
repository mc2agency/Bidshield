"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
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
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg">Loading BidShield...</div>
      </div>
    );
  }

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
    <div className="min-h-[60vh] flex flex-col bg-slate-50">
      {isDemo && (
        <div className="bg-emerald-600 text-white text-center py-2.5 text-sm font-medium">
          🎯 You&apos;re viewing a demo project — <Link href="/sign-up" className="underline font-semibold">Start free</Link> to create your own
        </div>
      )}

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">{children}</main>

      <footer className="flex justify-between px-6 py-4 border-t border-slate-200 text-xs text-slate-400 bg-white">
        <span>BidShield by MC2Agency</span>
        <span>Protecting contractors from costly bidding errors</span>
      </footer>
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
