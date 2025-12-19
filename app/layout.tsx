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
    default: "MC2 Estimating Academy - Professional Roofing Estimation Training",
    template: "%s | MC2 Estimating Academy",
  },
  description: "Learn professional estimating skills for roofing and construction. Templates, courses, and tools used by top contractors. Master estimation from takeoff to profit.",
  keywords: ["roofing estimation", "construction estimating", "contractor training", "roofing templates", "building estimation", "Bluebeam training", "estimating courses"],
  authors: [{ name: "MC2 Estimating Academy" }],
  creator: "MC2 Estimating Academy",
  publisher: "MC2 Estimating Academy",
  metadataBase: new URL("https://mc2estimating.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mc2estimating.com",
    siteName: "MC2 Estimating Academy",
    title: "MC2 Estimating Academy - Professional Roofing Estimation Training",
    description: "Learn professional estimating skills for roofing and construction. Templates, courses, and tools used by top contractors.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MC2 Estimating Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MC2 Estimating Academy",
    description: "Professional roofing estimation training, templates, and courses.",
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
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
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
