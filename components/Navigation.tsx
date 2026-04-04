'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, Component } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

// Baked in at build time — undefined when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/compare/bidshield-vs-the-edge', label: 'Compare' },
  { href: '/bidshield/demo', label: 'Demo' },
  { href: '/bidshield/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
];

// ============================================================
// Error boundary — catches Clerk hook errors when ClerkProvider
// is absent (preview deploys without the publishable key set,
// or local dev without .env.local). Falls back to static UI.
// ============================================================
class AuthErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ============================================================
// Auth sub-components — contain ALL Clerk hook calls.
// They are only ever mounted after isClient is true (client-side
// only) so they never run during SSR / static generation.
// ============================================================
function NavAuthDesktop({ isDashboard, pathname }: { isDashboard: boolean; pathname: string }) {
  const { isSignedIn, userId, signOut } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = userId ? userId.slice(5, 7).toUpperCase() : '??';
  const checkActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isSignedIn) {
    return (
      <>
        {!isDashboard && NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold select-none">
              {initials}
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
              <Link href="/bidshield/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                Dashboard
              </Link>
              <Link href="/bidshield/pricing" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                Billing
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { setDropdownOpen(false); signOut(() => router.push('/')); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Unauthenticated
  return (
    <>
      <Link href="/sign-in" className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
        Sign In
      </Link>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/sign-up"
        className="ml-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
      >
        Get Started →
      </Link>
    </>
  );
}

function NavAuthMobileInitials() {
  const { isSignedIn, userId } = useAuth();
  if (!isSignedIn) return null;
  const initials = userId ? userId.slice(5, 7).toUpperCase() : '??';
  return (
    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold select-none">
      {initials}
    </div>
  );
}

function NavAuthMobileMenu({ pathname, isDashboard, onClose }: { pathname: string; isDashboard: boolean; onClose: () => void }) {
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const checkActive = (href: string) => pathname.startsWith(href);

  if (isSignedIn) {
    return (
      <>
        <Link href="/bidshield/dashboard" className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={onClose}>
          Dashboard
        </Link>
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={onClose}
          >
            {label}
          </Link>
        ))}
        <div className="my-1 border-t border-slate-800" />
        <button
          onClick={() => { onClose(); signOut(() => router.push('/')); }}
          className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/sign-in" className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={onClose}>
        Sign In
      </Link>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={onClose}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/sign-up"
        className="block mx-2 mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-center font-semibold text-sm shadow-lg shadow-emerald-500/20"
        onClick={onClose}
      >
        Get Started →
      </Link>
    </>
  );
}

// ============================================================
// Static fallbacks — shown during SSR and before hydration
// ============================================================
function StaticDesktopNav({ pathname }: { pathname: string }) {
  const checkActive = (href: string) => pathname.startsWith(href);
  return (
    <>
      <Link href="/sign-in" className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
        Sign In
      </Link>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          {label}
        </Link>
      ))}
      <Link href="/sign-up" className="px-3.5 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors">
        Get Started →
      </Link>
    </>
  );
}

function StaticMobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const checkActive = (href: string) => pathname.startsWith(href);
  return (
    <>
      <Link href="/sign-in" className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={onClose}>
        Sign In
      </Link>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            checkActive(href) ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={onClose}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/sign-up"
        className="block mx-2 mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-center font-semibold text-sm shadow-lg shadow-emerald-500/20"
        onClick={onClose}
      >
        Get Started →
      </Link>
    </>
  );
}

// ============================================================
// Main Navigation — NO Clerk hooks at this level
// ============================================================
export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const ticking = useRef(false);
  const pathname = usePathname();

  useEffect(() => { setIsClient(true); }, []);

  const updateScrollState = useCallback(() => {
    setScrolled(window.scrollY > 10);
    ticking.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateScrollState]);

  const isDashboard = pathname.startsWith('/bidshield/dashboard');

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-700/50'
        : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span className="text-lg font-bold text-white tracking-tight">BidShield</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isClient && CLERK_KEY ? (
              <NavAuthDesktop isDashboard={isDashboard} pathname={pathname} />
            ) : (
              <StaticDesktopNav pathname={pathname} />
            )}
          </div>

          {/* Mobile: initials + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {isClient && CLERK_KEY && (
              <NavAuthMobileInitials />
            )}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 space-y-1">
          {isClient && CLERK_KEY ? (
            <NavAuthMobileMenu pathname={pathname} isDashboard={isDashboard} onClose={() => setMobileMenuOpen(false)} />
          ) : (
            <StaticMobileMenu pathname={pathname} onClose={() => setMobileMenuOpen(false)} />
          )}
        </div>
      </div>
    </nav>
  );
}
