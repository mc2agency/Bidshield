import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roofing Systems Estimating Guide — TPO, SBS, Metal & More | BidShield',
  description: 'Free estimating guides for every major commercial roofing system — TPO, PVC, EPDM, SBS, metal, spray foam, green roofs, and tile. Built for commercial roofing estimators.',
  keywords: 'roofing systems guide, commercial roofing types, TPO estimating, SBS roofing, metal roofing, roofing system comparison',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems' },
};

export default function RoofingSystemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
