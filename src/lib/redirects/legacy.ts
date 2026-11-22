/**
 * Permanent redirects from the old WordPress URLs (docs/urls-und-weiterleitungen.md).
 * Next.js evaluates them before the proxy, in this order; the first match wins.
 * Kept free of database access so they cost nothing.
 */
import type { Redirect } from 'next/dist/lib/load-custom-routes'

import { categoryMap, categoryRedirectTarget } from '../categoryMap'

const noFeed = [{ type: 'query' as const, key: 'sgbr_feed' }]

/** First path segments that belong to the new site and must never be treated as old article slugs. */
export const reservedSegments = [
  'en',
  'de',
  'admin',
  'api',
  'files',
  'wp-content',
  'wp-admin',
  'wp-json',
  'next',
  '_next',
  '_vercel',
  'issues',
  'category',
  'tag',
  'author',
  'feed',
  'page',
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
]

const permanent = (source: string, destination: string, extra: Partial<Redirect> = {}): Redirect =>
  ({ source, destination, permanent: true, ...extra }) as Redirect

export function legacyRedirects(): Redirect[] {
  const categoryRules = Object.keys(categoryMap)
    .filter((slug) => slug !== 'speaker-events')
    .flatMap((slug) => {
      const target = `/en${categoryRedirectTarget(slug)}`
      return [
        permanent(`/category/${slug}/page/:page(\\d+)`, target),
        permanent(`/category/${slug}`, target),
      ]
    })

  return [
    // Old site search: /?s=term
    permanent('/', '/en/search?q=:term', {
      has: [{ type: 'query', key: 's', value: '(?<term>.*)' }],
    }),

    // Speaker events: with ?sgbr_feed the route handler answers with JSON (espritsg.ch).
    permanent('/category/speaker-events', '/en/events/:id', {
      has: [{ type: 'query', key: 'e', value: '(?<id>[a-z0-9-]+)' }],
      missing: noFeed,
    }),
    permanent('/category/speaker-events', '/en/events', { missing: noFeed }),
    permanent('/category/speaker-events/page/:page(\\d+)', '/en/events'),
    permanent('/issues', '/en/issues', { missing: noFeed }),

    ...categoryRules,
    // Never the speaker-events path: with ?sgbr_feed it must reach the JSON feed.
    permanent('/category/:slug/page/:page(\\d+)', '/en/topics', { missing: noFeed }),
    permanent('/category/:slug*', '/en/topics', { missing: noFeed }),
    permanent('/tag/:tag*', '/en/topics'),
    permanent('/author/:slug/page/:page(\\d+)', '/en/people/:slug'),
    permanent('/author/:slug', '/en/people/:slug'),
    permanent('/page/:page(\\d+)', '/en'),

    permanent('/the-future-of-finance', '/en/issues/the-future-of-finance'),
    permanent('/about', '/en/about'),
    permanent('/about-us', '/en/about'),
    permanent('/contact', '/en/contact'),
    permanent('/impressum', '/en/imprint'),
    permanent('/Impressum', '/en/imprint'),
    permanent('/imprint', '/en/imprint'),
    permanent('/privacy', '/en/privacy'),
    permanent('/newsletter', '/en/newsletter'),
    permanent('/unsubscribe', '/en/newsletter'),
    permanent('/manage-your-subscription', '/en/newsletter'),
    permanent('/subscription-confirmed', '/en/newsletter'),
    permanent('/you-have-been-unsubscribed', '/en/newsletter'),
    // Guest article page of the old newsletter.
    permanent('/capital-markets-between-europe-and-asia', '/en/newsletter'),
    permanent('/feed', '/en/feed.xml'),
    permanent('/feed/:rest*', '/en/feed.xml'),

    // Every other single-segment path is an old article: /{slug}/ → /en/article/{slug}
    permanent(
      `/:slug((?!(?:${reservedSegments.map((s) => s.replace('.', '\\.')).join('|')})(?:/|$))[^/.]+)`,
      '/en/article/:slug',
    ),
  ]
}
