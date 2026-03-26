import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tile Roofing Estimating Guide — Clay & Concrete Tile | BidShield',
  description: 'Master estimating for clay and concrete tile roofing — from Spanish mission to flat profile tiles. Covers material calculations, underlayment, and labor for accurate bids.',
  keywords: 'tile roofing estimating, clay tile roofing, concrete tile roof, Spanish tile takeoff, tile roof bid, mission tile roofing',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/tile' },
};

export default function TileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
