import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mc2estimating.com';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/products',
    '/pricing',
    '/updates',
    '/support',
    '/blog',
    '/privacy',
    '/terms',
  ];

  // Product pages - actual templates we sell
  const productPages = [
    '/products/template-bundle',
    '/products/asphalt-shingle',
    '/products/tpo',
    '/products/epdm',
    '/products/metal',
    '/products/tile',
    '/products/bur',
    '/products/sbs',
    '/products/spray-foam',
  ];

  // BidShield
  const bidshieldPages = [
    '/bidshield',
  ];

  // Blog pages
  const blogPages = [
    '/blog/what-is-a-roof-square',
    '/blog/how-to-read-construction-specifications',
    '/blog/tpo-vs-pvc-vs-epdm',
    '/blog/pictometry-vs-eagleview',
    '/blog/roofing-estimating-software-comparison',
    '/blog/spray-foam-roofing-101',
    '/blog/standing-seam-metal-roofing-guide',
    '/blog/buildingconnected-guide',
    '/blog/labor-burden-calculation-guide',
    '/blog/general-conditions-checklist',
    '/blog/how-to-calculate-roof-pitch',
  ];

  const allPages = [
    ...staticPages,
    ...productPages,
    ...bidshieldPages,
    ...blogPages,
  ];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/products') ? 0.9 : 0.8,
  }));
}
