import type { MetadataRoute } from 'next'

import { serverUrl } from '@/lib/media'

/** Only the production site is indexed; Vercel previews are not. */
export default function robots(): MetadataRoute.Robots {
  const isProduction = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production'
  if (!isProduction) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/next/', '/*/search', '/*/newsletter/confirm'],
      },
    ],
    sitemap: `${serverUrl()}/sitemap.xml`,
  }
}
