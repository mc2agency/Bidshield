'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';


export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const ticking = useRef(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

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

  const navLinks = [
    ...(isSignedIn ? [{ href: '/bidshield/dashboard', label: 'Dashboard' }] : []),
    { href: '/bidshield/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
  ];

  const checkActive = (href: string) => {
    if (href === '/bidshield/dashboard') return pathname === '/bidshield/dashboard';
    return pathname.startsWith(href);
  };

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
              <span className="text-2xl">🛡️</span>
              <span className="text-lg font-bold text-white tracking-tight">BidShield</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  checkActive(href)
                    ? 'bg-slate-700/80 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {label}
              </Link>
            ))}

            {isClient ? (
              <Link
                href="/bidshield/dashboard?demo=true"
                className="ml-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
            ) : (
              <Link
                href="/bidshield/dashboard?demo=true"
                className="px-3.5 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                checkActive(href)
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/bidshield/dashboard"
            className="block mx-2 mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-center font-semibold text-sm shadow-lg shadow-emerald-500/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
