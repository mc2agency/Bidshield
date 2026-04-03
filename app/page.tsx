import type { Metadata } from 'next';
import HomepageContent from '@/components/HomepageContent';

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.bidshield.co' },
};

export default function Home() {
  return <HomepageContent />;
}
