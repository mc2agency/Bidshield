import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Writing Professional Roofing Proposals That Win Bids | BidShield',
  description: 'Master the art of crafting compelling commercial roofing proposals. Learn to communicate value, scope, and professionalism to win more projects against the competition.',
  keywords: 'roofing proposal writing, commercial roofing bid proposal, construction proposal template, winning roofing bids, scope of work proposal',
  alternates: { canonical: 'https://www.bidshield.co/resources/proposal-writing' },
};

export default function ProposalWritingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
