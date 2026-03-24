import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.bidshield.co';

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
          '/bidshield/dashboard/',
          '/bidshield/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
