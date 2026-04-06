"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
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
    href: "/bidshield/dashboard/vendors",
    label: "Vendors",
    exact: false,
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
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

function Sidebar({ isDemo, pathname, isPro }: { isDemo: boolean; pathname: string; isPro: boolean }) {
  // Project pages have their own sidebar — hide the outer one entirely
  if (pathname.startsWith("/bidshield/dashboard/project")) return null;

  const { userId, isSignedIn } = useAuth();
  const demoSuffix = isDemo ? "?demo=true" : "";

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
      style={{ background: "var(--bs-bg-secondary)", borderRight: "1px solid var(--bs-border)" }}
    >
      {/* Logo */}
      <div className="px-[18px] py-4 flex items-center gap-[10px]" style={{ borderBottom: "1px solid var(--bs-border)" }}>
        <a href="https://www.bidshield.co" target="_blank" rel="noopener" className="flex items-center gap-[10px] hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bs-teal)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12 4.5V9.5L7 13L2 9.5V4.5L7 1Z" stroke="#13151a" strokeWidth="1.8" fill="none"/>
              <path d="M7 5V9M5 7H9" stroke="#13151a" strokeWidth="1.4"/>
            </svg>
          </div>
          <span style={{ fontWeight: 500, fontSize: 15, color: "var(--bs-text-primary)", letterSpacing: "-0.3px" }}>BidShield</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col">
        {NAV_ITEMS.map(({ href, label, exact, icon }) => {
          const active = isActive(href, exact);
          const fullHref = href + demoSuffix;
          return (
            <Link
              key={href}
              href={fullHref}
              className={`bs-nav-item${active ? " bs-nav-item-active" : ""}`}
            >
              <span style={{ width: 16, height: 16, flexShrink: 0 }}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Free plan upgrade nudge */}
      {!isDemo && !isPro && isSignedIn && (
        <div className="mx-2 mb-2 px-3 py-3 rounded-lg" style={{ background: "var(--bs-teal-dim)", border: "1px solid var(--bs-teal-border)" }}>
          <p className="text-[11px] font-medium mb-0.5" style={{ color: "var(--bs-text-secondary)" }}>Free Plan</p>
          <p className="text-[10px] mb-2" style={{ color: "var(--bs-text-dim)" }}>Unlock unlimited projects & PDF export</p>
          <Link href="/bidshield/pricing" className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* User / Plan footer */}
      <div className="px-2 pb-3 pt-2" style={{ borderTop: "1px solid var(--bs-border)" }}>
        {isDemo ? (
          <div className="flex flex-col gap-2 px-2 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-dim)" }}>D</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: "var(--bs-text-secondary)" }}>Demo Mode</div>
                <div className="text-[10px]" style={{ color: "var(--bs-text-dim)" }}>Not saved to account</div>
              </div>
            </div>
            <Link href="/sign-up" className="block text-center py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
              Start Free →
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "var(--bs-bg-elevated)", color: "var(--bs-text-muted)" }}>
              {userId ? userId.slice(5, 7).toUpperCase() : "??"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: "var(--bs-text-secondary)" }}>
                {isSignedIn ? "Signed in" : "—"}
              </div>
              <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 tracking-wider uppercase" style={{ background: isPro ? "var(--bs-teal-dim)" : "rgba(255,255,255,0.05)", color: isPro ? "var(--bs-teal)" : "var(--bs-text-dim)" }}>
                {isPro ? "Pro" : "Free"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function MobileNav({ pathname, isDemo, isPro }: { pathname: string; isDemo: boolean; isPro: boolean }) {
  // Project pages have their own mobile bottom bar
  if (pathname.startsWith("/bidshield/dashboard/project")) return null;

  const demoSuffix = isDemo ? "?demo=true" : "";
  const tabs = [
    { href: "/bidshield/dashboard", label: "Dashboard", exact: true, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
      </svg>
    )},
    { href: "/bidshield/dashboard/analytics", label: "Analytics", exact: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    )},
    { href: "/bidshield/dashboard/vendors", label: "Vendors", exact: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    )},
    { href: "/bidshield/dashboard/datasheets", label: "Pricing", exact: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25v2.625c0 2.278-3.694 4.125-8.25 4.125S3.75 13.522 3.75 11.25V8.625m16.5 2.625v2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-2.625" />
      </svg>
    )},
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center" style={{ background: "var(--bs-bg-secondary)", borderTop: "1px solid var(--bs-border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ href, label, exact, icon }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href + demoSuffix}
            style={{ color: active ? "var(--bs-teal)" : "var(--bs-text-dim)" }}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors"
          >
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isDemo = searchParams.get("demo") === "true";
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const existingUser = useQuery(api.users.getCurrentUser, userId ? { clerkId: userId } : "skip");
  const subscription = useQuery(
    api.users.getUserSubscription,
    !isDemo && isSignedIn && userId ? { clerkId: userId } : "skip"
  );
  const isPro = isDemo || (subscription?.isPro ?? false);

  const [showTrialBanner, setShowTrialBanner] = useState(false);

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

  useEffect(() => {
    if (!userId || !isSignedIn || isPro || isDemo) return;
    const seenKey = `bs_trial_banner_dismissed_${userId}`;
    if (localStorage.getItem(seenKey)) return;
    setShowTrialBanner(true);
  }, [userId, isSignedIn, isPro, isDemo]);

  const dismissTrialBanner = () => {
    if (userId) localStorage.setItem(`bs_trial_banner_dismissed_${userId}`, "1");
    setShowTrialBanner(false);
  };

  // Ensure user row exists in Convex (needed for subscription checks)
  useEffect(() => {
    if (!user || !isSignedIn || existingUser === undefined) return;
    if (existingUser === null) {
      getOrCreateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? user.emailAddresses[0]?.emailAddress ?? "",
      });
    }
  }, [user, isSignedIn, existingUser, getOrCreateUser]);

  if (!isLoaded && !isDemo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "var(--bs-bg-primary)" }}>
        <div style={{ color: "var(--bs-text-muted)", fontSize: "1.125rem" }}>Loading BidShield...</div>
      </div>
    );
  }

  if (!isSignedIn && !isDemo) {
    return null;
  }

  return (
    <>
    {/* App-wide typography: Barlow Condensed display + DM Sans body */}
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
      #bidshield-app { font-family: 'DM Sans', system-ui, sans-serif; }
      #bidshield-app .app-display { font-family: 'Barlow Condensed', system-ui, sans-serif; }
    `}</style>
    <div id="bidshield-app" className="flex" style={{ minHeight: "calc(100vh - 4rem)", background: "var(--bs-bg-primary)" }}>
      <Sidebar isDemo={isDemo} pathname={pathname} isPro={isPro} />

      <div className="flex-1 flex flex-col min-w-0">
        {isDemo && (
          <div className="text-center py-2.5 text-sm font-medium shrink-0" style={{ background: "var(--bs-teal)", color: "#13151a" }}>
            Demo mode — <Link href="/sign-up" className="underline font-semibold">Start free</Link> to save your own bids
          </div>
        )}
        {showTrialBanner && !isDemo && !isPro && (
          <div className="px-4 py-2.5 flex items-center justify-between gap-4 shrink-0" style={{ background: "var(--bs-teal-dim)", borderBottom: "1px solid var(--bs-teal-border)" }}>
            <p className="text-sm" style={{ color: "var(--bs-teal)" }}>
              <strong>14-day Pro trial available.</strong> Unlimited projects, PDF export, win/loss analytics — no card required.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/bidshield/pricing"
                className="text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap"
                style={{ background: "var(--bs-teal)", color: "#13151a" }}
              >
                Start Free Trial
              </Link>
              <button
                onClick={dismissTrialBanner}
                className="text-xl leading-none transition-colors"
                style={{ color: "var(--bs-teal)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-text-primary)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--bs-teal)"}
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        <main className="flex-1 min-w-0 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      <MobileNav pathname={pathname} isDemo={isDemo} isPro={isPro} />
    </div>
    </>
  );
}

export default function BidShieldDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "var(--bs-bg-primary)" }}>
        <div style={{ color: "var(--bs-text-muted)", fontSize: "1.125rem" }}>Loading BidShield...</div>
      </div>
    }>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
