import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with BidShield. Questions about our bid workflow tool for commercial roofing estimators? Contact our support team or schedule a call.',
  alternates: { canonical: 'https://www.bidshield.co/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
