import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roof Restoration & Coating Systems Estimating Guide | BidShield',
  description: 'Master estimating for roof restoration coatings — elastomeric, silicone, and acrylic systems. Learn how to extend roof life and build accurate restoration bids.',
  keywords: 'roof restoration estimating, roof coating bid, elastomeric coating, silicone roof coating, acrylic roofing, commercial roof restoration',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/restoration-coating' },
};

export default function RestorationCoatingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
