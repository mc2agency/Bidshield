/**
 * BIDSHIELD — A product of MC2 Estimating
 * =======================================
 * BidShield is a bid quality-assurance platform for commercial subcontractors.
 * It helps estimators catch mistakes before they cost money.
 *
 * Core product: guided 5-phase bidding workflow with readiness scoring
 * Target: commercial roofing estimators (expandable to other trades)
 * Companion tool: sits alongside The EDGE / STACK / Excel
 */

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import FooterWrapper from "@/components/FooterWrapper";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { GA_ID } from "@/lib/gtag";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BidShield — Bid Workflow Tool for Commercial Roofing Estimators",
    template: "%s | BidShield",
  },
  description: "BidShield is the structured bid workflow tool for commercial roofing estimators. 18-phase checklist, Material Reconciliation, Labor Verification, and GC Bid Forms — from first plan review to final submission.",
  keywords: ["commercial roofing bid checklist", "roofing bid workflow tool", "commercial roofing estimator software", "material reconciliation roofing", "labor verification roofing", "GC bid form prep", "roofing pre-submission review", "BidShield", "18-phase bid checklist roofing"],
  authors: [{ name: "MC2 Estimating" }],
  creator: "MC2 Estimating",
  publisher: "MC2 Estimating",
  metadataBase: new URL("https://mc2estimating.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mc2estimating.com",
    siteName: "BidShield",
    title: "BidShield — Bid Workflow Tool for Commercial Roofing Estimators",
    description: "The structured workflow commercial roofing estimators run from first plan review to final submission. 18-phase checklist, AI material extraction, labor verification, and GC bid form prep.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BidShield — Bid Workflow Tool for Commercial Roofing Estimators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BidShield — Bid Workflow Tool for Commercial Roofing Estimators",
    description: "The structured workflow commercial roofing estimators run from first plan review to final submission. 18-phase checklist, AI material extraction, labor verification, and GC bid form prep.",
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
    <html lang="en">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BidShield" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BidShield",
              "url": "https://mc2estimating.com",
              "logo": "https://mc2estimating.com/api/og",
              "description": "Bid workflow tool for commercial roofing estimators.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://mc2estimating.com/contact"
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
              "url": "https://mc2estimating.com",
              "description": "Bid workflow tool for commercial roofing estimators. 18-phase checklist, material reconciliation, labor verification, and GC bid form preparation.",
              "screenshot": "https://mc2estimating.com/api/og",
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
                "name": "MC2 Estimating",
                "url": "https://mc2estimating.com"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Navigation />
          {children}
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
