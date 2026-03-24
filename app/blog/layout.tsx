import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert guides, tutorials, and industry insights for commercial roofing estimators. Tips on bid workflow, takeoffs, specs, and winning more work.',
  keywords: 'roofing blog, estimating tips, construction tutorials, contractor guides, estimation guides',
  alternates: { canonical: 'https://www.bidshield.co/blog' },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
