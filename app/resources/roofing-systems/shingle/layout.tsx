import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asphalt Shingle Roofing Estimating Guide | BidShield',
  description: 'Master estimating for asphalt shingle roofing — from 3-tab to architectural shingles. Covers square calculations, waste factors, materials, and labor for accurate bids.',
  keywords: 'asphalt shingle estimating, shingle roofing takeoff, architectural shingles, 3-tab shingle, roofing squares, shingle roof bid',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/shingle' },
};

export default function ShingleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
