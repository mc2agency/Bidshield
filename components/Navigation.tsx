'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { LanguageToggle } from '@/lib/i18n';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // SIMPLIFIED: Only what matters for sales
  const navLinks = [
    { href: '/products', label: 'Templates' },
    { href: '/bidshield', label: 'BidShield', badge: 'FREE' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50'
        : 'bg-white/50 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MC2
              </span>
              <span className="text-lg font-medium text-slate-700 hidden sm:inline">
                Estimating
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  {label}
                  {badge && (
                    <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}

            {/* Language Toggle */}
            {isClient && <LanguageToggle />}

            {isClient ? (
              <>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="ml-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/products"
                    className="ml-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
                  >
                    Get Templates
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/bidshield/dashboard"
                    className="ml-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="ml-4">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="ml-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
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
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/50 px-4 py-4 space-y-1">
          {/* Mobile Language Toggle */}
          <div className="px-4 py-2 mb-2">
            <LanguageToggle />
          </div>
          {navLinks.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
              {badge && (
                <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {badge}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/products"
            className="block mx-2 mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-center font-semibold shadow-lg shadow-emerald-500/30"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Templates
          </Link>
        </div>
      </div>
    </nav>
  );
}
