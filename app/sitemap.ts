import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bidshield.co';

  const staticPages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '',                                        priority: 1.0, changeFrequency: 'weekly' },
    { path: '/bidshield/pricing',                      priority: 0.9, changeFrequency: 'monthly' },
    { path: '/bidshield/demo',                         priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog',                                   priority: 0.8, changeFrequency: 'daily' },
    { path: '/about',                                  priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact',                                priority: 0.6, changeFrequency: 'monthly' },
    { path: '/updates',                                priority: 0.6, changeFrequency: 'monthly' },
    { path: '/support',                                priority: 0.6, changeFrequency: 'monthly' },
    { path: '/compare/bidshield-vs-the-edge',          priority: 0.8, changeFrequency: 'monthly' },
    { path: '/compare/bidshield-vs-stack',             priority: 0.8, changeFrequency: 'monthly' },
    { path: '/resources',                              priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/estimating-best-practices',   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/plans-and-specs',              priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems',              priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/tpo-pvc-epdm', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/metal',        priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/spray-foam',   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/sbs',          priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/shingle',      priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/tile',         priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/green-roof',   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/roofing-systems/restoration-coating', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/measurement',                  priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/software-technology',          priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/technology',                   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/proposal-writing',             priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/submittals',                   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/finding-work',                 priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/business-operations',          priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/insulation',                   priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools',                                  priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/estimating-essentials',            priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/estimating-software',              priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/measurement-technology',           priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/bluebeam-mastery',                 priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/construction-submittals',          priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/autocad-submittals',               priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/sketchup-visualization',           priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/beginner',                         priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/intermediate',                     priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tools/advanced',                         priority: 0.6, changeFrequency: 'monthly' },
    { path: '/products',                               priority: 0.7, changeFrequency: 'monthly' },
    { path: '/products/template-bundle',               priority: 0.7, changeFrequency: 'monthly' },
    { path: '/terms',                                  priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy',                                priority: 0.3, changeFrequency: 'yearly' },
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
