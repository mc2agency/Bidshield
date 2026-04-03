import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Green Roof & Vegetative Roofing Estimating Guide | BidShield',
  description: 'Master estimating for green roof systems — from extensive sedum trays to intensive rooftop gardens. Covers assemblies, drainage, waterproofing, and commercial bid line items.',
  keywords: 'green roof estimating, vegetative roof, living roof takeoff, extensive green roof, intensive rooftop garden, green roof bid',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/green-roof' },
};

export default function GreenRoofLayout({ children }: { children: React.ReactNode }) {
  return children;
}
