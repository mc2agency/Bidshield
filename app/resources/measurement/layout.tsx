import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Measuring Roofs Without Climbing — Aerial & Remote Tools | BidShield',
  description: 'Master aerial measurement technology and remote roof measurement techniques. Learn EagleView, Hover, drones, and digital tools to accurately measure any roof from the ground.',
  keywords: 'remote roof measurement, aerial roof measurement, EagleView estimating, Hover roof app, drone roof measurement, digital roof takeoff',
  alternates: { canonical: 'https://www.bidshield.co/resources/measurement' },
};

export default function MeasurementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
