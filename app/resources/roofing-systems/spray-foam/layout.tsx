import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spray Foam Roofing (SPF) Estimating Guide | BidShield',
  description: 'Master estimating for spray polyurethane foam (SPF) roofing systems. Covers foam thickness, coatings, labor, and bid line items for seamless commercial roofs.',
  keywords: 'spray foam roofing estimating, SPF roofing, polyurethane foam roof, spray foam takeoff, foam roofing bid, commercial foam roofing',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/spray-foam' },
};

export default function SprayFoamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
