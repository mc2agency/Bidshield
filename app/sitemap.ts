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
    '/courses',
    '/learning',
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
    '/products/starter-bundle',
    '/products/professional-bundle',
    '/products/complete-academy',
    '/products/lead-generation-guide',
    '/products/insurance-compliance-guide',
    '/products/osha-safety-guide',
    '/products/technology-setup-guide',
  ];

  // Course pages
  const coursePages = [
    '/courses/estimating-fundamentals',
    '/courses/bluebeam-mastery',
    '/courses/autocad-submittals',
    '/courses/sketchup-visualization',
    '/courses/measurement-technology',
    '/courses/construction-submittals',
    '/courses/estimating-software',
    '/courses/beginner',
    '/courses/intermediate',
    '/courses/advanced',
  ];

  // Learning pages
  const learningPages = [
    '/learning/roofing-systems',
    '/learning/roofing-systems/shingle',
    '/learning/roofing-systems/tpo-pvc-epdm',
    '/learning/roofing-systems/metal',
    '/learning/roofing-systems/tile',
    '/learning/roofing-systems/spray-foam',
    '/learning/roofing-systems/green-roof',
    '/learning/roofing-systems/sbs',
    '/learning/roofing-systems/restoration-coating',
    '/learning/measurement',
    '/learning/plans-and-specs',
    '/learning/finding-work',
    '/learning/business-operations',
    '/learning/proposal-writing',
    '/learning/submittals',
    '/learning/technology',
    '/learning/estimating-best-practices',
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
    ...coursePages,
    ...learningPages,
    ...blogPages,
  ];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/products') || route.startsWith('/courses') ? 0.9 : 0.8,
  }));
}
