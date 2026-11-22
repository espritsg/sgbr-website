import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'
import { serverUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { peopleOf } from '@/lib/posts'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

const xml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** RSS feed of the latest articles: /en/feed.xml and /de/feed.xml (replaces /feed/). */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return new Response('Not found', { status: 404 })
  const base = serverUrl()
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'posts',
    locale,
    overrideAccess: false,
    sort: '-publishedAt',
    limit: 50,
    depth: 1,
  })
  const items = (posts.docs as Post[])
    .map((post) => {
      const url = `${base}/${locale}/article/${post.slug}`
      const authors = peopleOf(post)
        .map((person) => person.name)
        .join(', ')
      return `<item><title>${xml(post.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid>${
        post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''
      }${authors ? `<dc:creator>${xml(authors)}</dc:creator>` : ''}<description>${xml(post.summary ?? '')}</description></item>`
    })
    .join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>St. Gallen Business Review</title><link>${base}/${locale}</link><atom:link href="${base}/${locale}/feed.xml" rel="self" type="application/rss+xml"/><description>${
    locale === 'de'
      ? 'Interviews mit Persönlichkeiten aus Wirtschaft, Finanzen und Politik'
      : 'Interviews with leaders from business, finance and politics'
  }</description><language>${locale}</language>${items}</channel></rss>`
  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600',
    },
  })
}
