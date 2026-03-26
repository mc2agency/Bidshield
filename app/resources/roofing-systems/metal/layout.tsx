import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Metal Roofing Estimating Guide — Standing Seam & Panels | BidShield',
  description: 'Master estimating for standing seam, corrugated, and metal panel roofing systems. Covers materials, flashing, labor rates, and bid line items for commercial metal roofs.',
  keywords: 'metal roofing estimating, standing seam roofing, metal panel roof, commercial metal roof, metal roof takeoff, corrugated metal roofing',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/metal' },
};

export default function MetalRoofingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
