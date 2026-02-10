import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert guides, tutorials, and industry insights for construction estimators and roofing contractors. Tips on estimation, Bluebeam, specifications, and more.',
  keywords: 'roofing blog, estimating tips, construction tutorials, contractor guides, estimation guides',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
