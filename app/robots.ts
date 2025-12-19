import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://mc2estimating.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
