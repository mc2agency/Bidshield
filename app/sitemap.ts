import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mc2estimating.com';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/membership',
    '/products',
    '/pricing',
    '/updates',
    '/support',
    '/blog',
    '/quiz',
    '/privacy',
    '/terms',
  ];

  // Product pages
  const productPages = [
    '/products/template-bundle',
    '/products/asphalt-shingle',
    '/products/tpo-template',
    '/products/metal-roofing',
    '/products/tile-roofing',
    '/products/spray-foam',
    '/products/green-roof-template',
    '/products/sbs-template',
    '/products/restoration-coating-template',
    '/products/estimating-checklist',
    '/products/proposal-templates',
    '/products/complete-bundle',
    '/products/lead-generation-guide',
    '/products/insurance-compliance-guide',
    '/products/osha-safety-guide',
    '/products/technology-setup-guide',
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
    ...blogPages,
  ];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/products') ? 0.9 : 0.8,
  }));
}
