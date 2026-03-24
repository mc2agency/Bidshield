import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bidshield.co';

  const staticPages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '',                   priority: 1.0, changeFrequency: 'weekly' },
    { path: '/bidshield/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/bidshield/demo',    priority: 0.9, changeFrequency: 'monthly' },
    { path: '/blog',              priority: 0.8, changeFrequency: 'daily' },
    { path: '/about',             priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact',           priority: 0.6, changeFrequency: 'monthly' },
    { path: '/terms',             priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy',           priority: 0.3, changeFrequency: 'yearly' },
  ];

  const blogPosts = [
    'commercial-roofing-scope-of-work-checklist',
    'roofing-takeoff-mistakes',
    'commercial-roofing-estimate-template',
    'how-to-win-more-commercial-roofing-bids',
    '5-costly-roofing-estimating-mistakes',
    'what-is-a-roof-square',
    'how-to-read-construction-specifications',
    'tpo-vs-pvc-vs-epdm',
    'roofing-estimating-software-comparison',
    'spray-foam-roofing-101',
    'standing-seam-metal-roofing-guide',
    'buildingconnected-guide',
    'labor-burden-calculation-guide',
    'general-conditions-checklist',
    'how-to-calculate-roof-pitch',
  ];

  const now = new Date();

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...blogPosts.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
