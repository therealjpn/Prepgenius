import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.xyz';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/exam', '/results', '/payment', '/profile'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
