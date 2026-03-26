import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SBS Modified Bitumen Roofing Estimating Guide | BidShield',
  description: 'Master estimating for SBS modified bitumen roofing systems — from torch-applied to self-adhered multi-ply roofs. Covers materials, labor, and commercial bid line items.',
  keywords: 'SBS roofing estimating, modified bitumen estimating, torch applied roofing, self adhered bitumen, multi-ply roofing, commercial bitumen roof',
  alternates: { canonical: 'https://www.bidshield.co/resources/roofing-systems/sbs' },
};

export default function SbsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
