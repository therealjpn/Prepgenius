import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://prepgenie.onrender.com';

const subjects = [
  'mathematics', 'english-language', 'biology', 'chemistry',
  'physics', 'economics', 'government',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${BASE}/subjects`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE}/signup`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  // Add subject-specific pages for SEO
  subjects.forEach(slug => {
    routes.push({
      url: `${BASE}/subjects/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });
  });

  return routes;
}
