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
    default: "MC2 Estimating - Professional Roofing Estimating Tools & Templates",
    template: "%s | MC2 Estimating",
  },
  description: "Professional roofing estimating tools contractors use to build accurate bids faster. Templates, calculators, checklists, and workflow tools for roofing professionals.",
  keywords: ["roofing estimation", "construction estimating", "roofing templates", "estimating tools", "roofing calculators", "contractor tools", "bid templates"],
  authors: [{ name: "MC2 Estimating" }],
  creator: "MC2 Estimating",
  publisher: "MC2 Estimating",
  metadataBase: new URL("https://mc2estimating.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mc2estimating.com",
    siteName: "MC2 Estimating",
    title: "MC2 Estimating - Professional Roofing Estimating Tools & Templates",
    description: "Professional roofing estimating tools contractors use to build accurate bids faster. Templates, calculators, and workflow tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MC2 Estimating",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MC2 Estimating",
    description: "Professional roofing estimating tools, templates, and calculators.",
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
