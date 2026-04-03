import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BidShield Pro — Pricing',
  description: 'BidShield Pro gives commercial roofing estimators unlimited projects, 134-item bid review checklist, AI material extraction, labor verification, and GC bid form prep. $249/mo.',
  alternates: { canonical: 'https://www.bidshield.co/bidshield/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
