import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TPO, PVC & EPDM Roofing Estimating Guide | BidShield',
  description: 'Master estimating for TPO, PVC, and EPDM single-ply membrane roofing — the dominant systems for commercial flat roofs. Covers materials, labor, and bid line items.',
  keywords: 'TPO roofing estimating, PVC roofing, EPDM estimating, single-ply membrane, commercial flat roof, membrane roofing takeoff',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/tpo-pvc-epdm' },
};

export default function TpoPvcEpdmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
