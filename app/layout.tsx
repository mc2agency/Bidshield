/**
 * BIDSHIELD
 * =======================================
 * BidShield is a bid quality-assurance platform for commercial subcontractors.
 * It helps estimators catch mistakes before they cost money.
 *
 * Core product: 18-phase bid preflight / QA gate with readiness scoring
 * Target: commercial roofing estimators (expandable to other trades)
 * Companion tool: sits alongside The EDGE / STACK / Excel
 */

import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import FooterWrapper from "@/components/FooterWrapper";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { GA_ID } from "@/lib/gtag";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "BidShield — Bid Preflight & QA for Commercial Roofing Estimators",
    template: "%s | BidShield",
  },
  description: "BidShield is the bid preflight tool for commercial roofing estimators — a pre-submission QA gate on top of The EDGE, Bluebeam, and Excel. An 18-phase, 135-item checklist that catches the scope gaps estimating software misses before your bid goes out.",
  keywords: ["commercial roofing bid preflight", "bid preflight tool", "pre-submission bid review roofing", "commercial roofing bid QA", "scope gap detection", "material reconciliation roofing", "labor verification roofing", "GC bid form prep", "BidShield", "18-phase bid checklist roofing"],
  authors: [{ name: "BidShield" }],
  creator: "BidShield",
  publisher: "BidShield",
  metadataBase: new URL("https://www.bidshield.co"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.bidshield.co",
    siteName: "BidShield",
    title: "BidShield — Bid Preflight & QA for Commercial Roofing Estimators",
    description: "The pre-submission QA gate commercial roofing estimators run before a bid goes out — on top of The EDGE, Bluebeam, and Excel. 18-phase checklist that catches the scope gaps estimating software misses.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BidShield — Bid Preflight & QA for Commercial Roofing Estimators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BidShield — Bid Preflight & QA for Commercial Roofing Estimators",
    description: "The pre-submission QA gate commercial roofing estimators run before a bid goes out — on top of The EDGE, Bluebeam, and Excel. 18-phase checklist that catches the scope gaps estimating software misses.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme: read preference before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('bidshield-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}if(t==='system'||!t){var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();` }} />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BidShield" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* TODO: Add social profile URLs to sameAs once created, e.g. "https://www.linkedin.com/company/bidshield" */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BidShield",
              "url": "https://www.bidshield.co",
              "logo": "https://www.bidshield.co/bidshield-logo.jpg",
              "description": "Bid preflight tool for commercial roofing estimators.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://www.bidshield.co/contact"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BidShield",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "url": "https://www.bidshield.co",
              "description": "Bid workflow tool for commercial roofing estimators. 18-phase checklist, material reconciliation, labor verification, and GC bid form preparation.",
              "screenshot": "https://www.bidshield.co/api/og",
              "offers": [
                {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "name": "Free Plan"
                },
                {
                  "@type": "Offer",
                  "price": "249",
                  "priceCurrency": "USD",
                  "name": "Pro Plan",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "249",
                    "priceCurrency": "USD",
                    "unitText": "MONTH"
                  }
                }
              ],
              "publisher": {
                "@type": "Organization",
                "name": "BidShield",
                "url": "https://www.bidshield.co"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "BidShield",
              "url": "https://www.bidshield.co",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.bidshield.co/blog?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <Navigation />
          <ViewTransition>{children}</ViewTransition>
          <FooterWrapper />
        </Providers>
        <Analytics />
        <SpeedInsights />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
