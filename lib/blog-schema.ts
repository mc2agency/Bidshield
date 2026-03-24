export interface BlogPostingSchemaProps {
  title: string;
  description: string;
  slug: string;
  publishedDate: string; // ISO 8601, e.g. "2026-03-05"
  modifiedDate?: string;
  authorName?: string;
  imageUrl?: string;
}

export function generateBlogPostingSchema({
  title,
  description,
  slug,
  publishedDate,
  modifiedDate,
  authorName = 'BidShield',
  imageUrl,
}: BlogPostingSchemaProps): string {
  const url = `https://www.bidshield.co/blog/${slug}`;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: publishedDate,
    dateModified: modifiedDate ?? publishedDate,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BidShield',
      url: 'https://www.bidshield.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bidshield.co/bidshield-logo.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  if (imageUrl) {
    schema.image = {
      '@type': 'ImageObject',
      url: imageUrl.startsWith('http') ? imageUrl : `https://www.bidshield.co${imageUrl}`,
    };
  }

  return JSON.stringify(schema);
}
