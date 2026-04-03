import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial Roofing Insulation Estimating Guide | BidShield',
  description: 'Master estimating for commercial roofing insulation — tapered systems, flat stock, cover boards, R-values, and PSI ratings. Includes insulation calculator for accurate bids.',
  keywords: 'roofing insulation estimating, tapered insulation, cover board, R-value roofing, commercial insulation takeoff, roofing ISO board',
  alternates: { canonical: 'https://www.bidshield.co/resources/insulation' },
};

export default function InsulationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
