import { MetadataRoute } from 'next';
import { PREVIEWABLE_FORMATS } from '@/lib/formats';

export const dynamic = 'force-static';

const baseUrl = 'https://webutils.site';

// Tool pages carry the search intent, so they rank above the informational pages.
// /ide is intentionally excluded: it has no internal link anywhere in the
// nav/sidebar/homepage (its tools.ts entry is commented out), so it isn't
// part of the site's real navigation and shouldn't be promoted for indexing.
const TOOL_ROUTES = [
  '/editor',
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
