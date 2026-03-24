import type { Metadata } from 'next';
import HomepageContent from '@/components/HomepageContent';

export const metadata: Metadata = {
  alternates: { canonical: 'https://mc2estimating.com' },
};

export default function Home() {
  return <HomepageContent />;
}
