import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finding Commercial Roofing Leads & Construction Work | BidShield',
  description: 'The complete guide to finding high-quality commercial roofing projects and building relationships with general contractors. Learn where estimators find the best bids.',
  keywords: 'finding roofing work, commercial roofing leads, construction bid leads, general contractor relationships, roofing subcontractor, bidding opportunities',
  alternates: { canonical: 'https://www.bidshield.co/resources/finding-work' },
};

export default function FindingWorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
