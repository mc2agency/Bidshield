/**
 * Product Schema for SEO
 * Adds structured data to product pages for rich snippets in Google
 */

interface ProductSchemaProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  url: string;
}

export default function ProductSchema({ name, description, price, image, url }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image || 'https://mc2estimating.com/mc2-logo.jpg',
    url,
    brand: {
      '@type': 'Brand',
      name: 'MC2 Estimating',
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'MC2 Estimating',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Bundle schema for the complete template bundle
 */
export function BundleSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'MC2 Complete Template Bundle - All 8 Roofing Estimating Templates',
    description: 'Professional roofing estimating templates for 8 systems: Asphalt Shingle, TPO, EPDM, Metal, Tile, BUR, SBS Modified Bitumen, and Spray Foam. Includes material takeoff, labor calculator, cost recap, and professional proposals.',
    image: 'https://mc2estimating.com/mc2-logo.jpg',
    url: 'https://mc2estimating.com/products/template-bundle',
    brand: {
      '@type': 'Brand',
      name: 'MC2 Estimating',
    },
    offers: {
      '@type': 'Offer',
      price: 99,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31',
      seller: {
        '@type': 'Organization',
        name: 'MC2 Estimating',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema for product pages
 */
export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What software do I need to use the templates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Microsoft Excel 2016 or newer, or Google Sheets (free). Works on PC and Mac.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I customize the templates for my business?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! You can add your logo, adjust prices, change rates — the templates are fully editable Excel files.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I get updates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — lifetime updates at no extra cost. We email you when improvements are made.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the refund policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '30-day money-back guarantee. If the templates don\'t save you time, we\'ll refund you.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
