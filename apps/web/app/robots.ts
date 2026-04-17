import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenius.onrender.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/exam', '/results', '/payment', '/profile'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
