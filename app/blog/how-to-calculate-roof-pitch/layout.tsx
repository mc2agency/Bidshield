import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Calculate Roof Pitch: Formula, Chart & Calculator [2025]",
  description: "Learn how to calculate roof pitch using the rise-over-run formula. Includes pitch multiplier chart, angle conversions, and interactive calculator for roofing estimates.",
  alternates: { canonical: 'https://www.bidshield.co/blog/how-to-calculate-roof-pitch' },
  openGraph: {
    title: "How to Calculate Roof Pitch: Formula, Chart & Calculator [2025]",
    description: "Learn how to calculate roof pitch using the rise-over-run formula. Includes pitch multiplier chart, angle conversions, and interactive calculator for roofing estimates.",
    type: "article",
    publishedTime: "2025-12-01",
    authors: ["BidShield"],
    images: [
      {
        url: "/api/og?title=How%20to%20Calculate%20Roof%20Pitch%3A%20Formula%2C%20Chart%20%26%20Calculator&type=article",
        width: 1200,
        height: 630,
        alt: "How to Calculate Roof Pitch: Formula, Chart & Calculator [2025]",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Calculate Roof Pitch: Formula, Chart & Calculator [2025]",
    description: "Learn how to calculate roof pitch using the rise-over-run formula.",
    images: ["/api/og?title=How%20to%20Calculate%20Roof%20Pitch&type=article"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
