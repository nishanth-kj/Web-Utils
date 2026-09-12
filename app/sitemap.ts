import { MetadataRoute } from 'next';
import { PREVIEWABLE_FORMATS } from '@/lib/formats';

export const dynamic = 'force-static';

const baseUrl = 'https://webutils.site';

// Tool pages carry the search intent, so they rank above the informational pages.
const TOOL_ROUTES = [
  '/editor',
  '/ide',
  '/view',
  '/draw',
  '/time',
  '/crypto',
  '/password',
  '/dummy',
  ...PREVIEWABLE_FORMATS.map((format) => `/view/${format}`),
];

const INFO_ROUTES = [
  '/documentation',
  '/docs',
  '/about',
  '/faq',
  '/contact',
  '/settings',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...TOOL_ROUTES.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...INFO_ROUTES.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ];
}
