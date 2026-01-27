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
    '/tools',
    '/resources',
    '/blog',
    '/privacy',
    '/terms',
    '/pricing',
    '/updates',
    '/support',
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
    '/products/starter-bundle',
    '/products/professional-bundle',
    '/products/master-toolkit',
    '/products/lead-generation-guide',
    '/products/insurance-compliance-guide',
    '/products/osha-safety-guide',
    '/products/technology-setup-guide',
  ];

  // Tool pages (formerly courses)
  const toolPages = [
    '/tools/estimating-essentials',
    '/tools/bluebeam-mastery',
    '/tools/autocad-submittals',
    '/tools/sketchup-visualization',
    '/tools/measurement-technology',
    '/tools/construction-submittals',
    '/tools/estimating-software',
    '/tools/beginner',
    '/tools/intermediate',
    '/tools/advanced',
  ];

  // Resource pages (formerly learning)
  const resourcePages = [
    '/resources/roofing-systems',
    '/resources/roofing-systems/shingle',
    '/resources/roofing-systems/tpo-pvc-epdm',
    '/resources/roofing-systems/metal',
    '/resources/roofing-systems/tile',
    '/resources/roofing-systems/spray-foam',
    '/resources/roofing-systems/green-roof',
    '/resources/roofing-systems/sbs',
    '/resources/roofing-systems/restoration-coating',
    '/resources/measurement',
    '/resources/plans-and-specs',
    '/resources/finding-work',
    '/resources/business-operations',
    '/resources/proposal-writing',
    '/resources/submittals',
    '/resources/technology',
    '/resources/estimating-best-practices',
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
    ...toolPages,
    ...resourcePages,
    ...blogPages,
  ];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/products') || route.startsWith('/tools') ? 0.9 : 0.8,
  }));
}
