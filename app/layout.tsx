/**
 * MC2 ESTIMATING - PRODUCT POSITIONING DEFINITION
 * ================================================
 * MC2 Estimating is a PRODUCT company, NOT an education platform.
 *
 * We sell professional roofing estimating tools contractors use to build accurate bids faster:
 * - Templates (Excel spreadsheets with built-in formulas)
 * - Calculators (material and labor calculation tools)
 * - Checklists (comprehensive cost item lists)
 * - Workflow tools (proposals, submittals, documentation)
 *
 * FORBIDDEN TERMINOLOGY (do not use anywhere in the codebase):
 * - Tool / Courses
 * - Learn / Learning
 * - Training / Trained
 * - Academy / School
 * - Section / Part
 * - Student
 * - Enroll / Enrollment
 * - Certification / Certificate
 * - Fundamentals / Advanced (as levels)
 * - Coach / Coaching / Mentorship
 *
 * ALLOWED TERMINOLOGY:
 * - Tools, Templates, Downloads, Assets, Calculators, Checklists, Workflows
 * - Setup, Configuration, Usage notes, Walkthrough, Documentation
 * - Vault, Updates, Access
 * - Customers, Users (not users or members)
 *
 * VALIDATION CHECK: Would this feature still be valuable if all videos were removed?
 * If no, revise until the answer is yes.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BidShield — Bidding Command Center for Commercial Roofing",
    template: "%s | BidShield by MC2 Estimating",
  },
  description: "BidShield helps commercial roofing estimators catch mistakes before they cost money. Takeoff verification, material calculator, bid comparison, scope gap checker. Built by estimators, for estimators.",
  keywords: ["roofing estimation", "construction estimating", "roofing templates", "estimating tools", "roofing calculators", "contractor tools", "bid templates", "bidshield", "bid management"],
  authors: [{ name: "MC2 Estimating" }],
  creator: "MC2 Estimating",
  publisher: "MC2 Estimating",
  metadataBase: new URL("https://mc2estimating.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mc2estimating.com",
    siteName: "BidShield by MC2 Estimating",
    title: "BidShield — Bidding Command Center for Commercial Roofing",
    description: "BidShield helps commercial roofing estimators catch mistakes before they cost money. Takeoff verification, material calculator, bid comparison, scope gap checker.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BidShield by MC2 Estimating",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BidShield by MC2 Estimating",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BidShield by MC2 Estimating",
              "url": "https://mc2estimating.com",
              "logo": "https://mc2estimating.com/og-image.png",
              "description": "BidShield helps commercial roofing estimators catch mistakes before they cost money. Takeoff verification, material calculator, bid comparison, scope gap checker.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://mc2estimating.com/contact"
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
      </body>
    </html>
  );
}
