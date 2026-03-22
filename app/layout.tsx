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
import Footer from "@/components/Footer";
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
    default: "BidShield — Bidding Command Center for Commercial Roofing",
    template: "%s | BidShield",
  },
  description: "One missed mechanical curb costs $30K–$80K. BidShield's 18-phase pre-submission review catches what estimating software can't — works alongside The EDGE, STACK, and Excel.",
  keywords: ["commercial roofing bid checklist", "pre-submission bid review roofing", "roofing scope gap checker", "bid QA commercial roofing", "roofing estimating tools", "BidShield", "missed mechanical curb commercial roofing", "addendum review roofing"],
  authors: [{ name: "MC2 Estimating" }],
  creator: "MC2 Estimating",
  publisher: "MC2 Estimating",
  metadataBase: new URL("https://mc2estimating.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mc2estimating.com",
    siteName: "BidShield",
    title: "BidShield — Bidding Command Center for Commercial Roofing",
    description: "BidShield helps commercial roofing estimators catch mistakes before they cost money. Takeoff verification, material calculator, bid comparison, scope gap checker.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BidShield — Bid QA for Commercial Roofing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BidShield",
    description: "The bidding command center for commercial roofing estimators. Catch mistakes before they cost money.",
    images: ["/og-image.png"],
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
              "logo": "https://mc2estimating.com/og-image.png",
              "description": "BidShield's 18-phase pre-submission review catches what estimating software can't — works alongside The EDGE, STACK, and Excel.",
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
              "url": "https://mc2estimating.com/bidshield/dashboard",
              "description": "BidShield is the pre-submission bid review platform for commercial roofing estimators. 18-phase checklist, scope gap checker, takeoff reconciliation, and bid readiness score.",
              "offers": [
                {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "name": "Free Plan"
                },
                {
                  "@type": "Offer",
                  "price": "149",
                  "priceCurrency": "USD",
                  "name": "Pro Plan",
                  "billingIncrement": "monthly"
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
          <Footer />
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
