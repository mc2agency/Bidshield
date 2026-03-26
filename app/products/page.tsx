import ProductsContent from '@/components/ProductsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Professional roofing estimating templates for 8 systems. Excel templates for asphalt shingle, TPO, EPDM, metal, tile, BUR, SBS, and spray foam roofing.',
  keywords: 'roofing templates, estimating template, roofing estimate template, construction templates, Excel estimating',
  alternates: { canonical: 'https://www.bidshield.co/products' },
};

export default function ProductsPage() {
  return <ProductsContent />;
}
