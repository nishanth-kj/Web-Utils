import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://webutils.site';

  const routes = [
    '',
    '/crypto',
    '/crypto/blockchain',
    '/docs',
    '/documentation',
    '/draw',
    '/editor',
    '/ide',
    '/settings',
    '/time',
    '/view',
    '/privacy',
    '/terms',
    '/about',
    '/faq',
    '/contact'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
