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
  '/sql-visualization',
  '/code-video',
  '/code-visualizer',
  '/video-editor',
  '/image-editor',
  ...PREVIEWABLE_FORMATS.map((format) => `/view/${format}`),
];

// /settings (per-browser preferences) and /documentation (overlaps /docs)
// are noindex, so they stay out of the sitemap too.
const INFO_ROUTES = [
  '/docs',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
];

// No lastModified: the build has no reliable per-page modification date, and
// stamping every URL with the build time tells crawlers unchanged pages
// changed on every deploy, which teaches them to ignore the field.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...TOOL_ROUTES.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...INFO_ROUTES.map((route) => ({
      url: `${baseUrl}${route}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ];
}
