import type { MetadataRoute } from 'next'

import { locales } from '@/i18n/routing'
import { serverUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Entry = MetadataRoute.Sitemap[number]

/** All public pages in both languages. Articles only in their original language (canonical). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverUrl()
  const payload = await getPayloadClient()
  const both = (path: string, lastModified?: string): Entry[] =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(locales.map((code) => [code, `${base}/${code}${path}`])),
      },
    }))
  const find = <T extends 'topics' | 'issues' | 'events' | 'people' | 'pages'>(collection: T) =>
    payload.find({
      collection,
      overrideAccess: false,
      limit: 0,
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true },
    })

  const [posts, topics, issues, events, people, pages] = await Promise.all([
    payload.find({
      collection: 'posts',
      overrideAccess: false,
      limit: 0,
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true, originalLanguage: true },
    }),
    find('topics'),
    find('issues'),
    find('events'),
    find('people'),
    find('pages'),
  ])

  return [
    ...both(''),
    ...['/topics', '/issues', '/events', '/newsletter'].flatMap((path) => both(path)),
    ...posts.docs.map((post) => ({
      url: `${base}/${post.originalLanguage}/article/${post.slug}`,
      lastModified: post.updatedAt,
    })),
    ...topics.docs.flatMap((doc) => both(`/topics/${doc.slug}`, doc.updatedAt)),
    ...issues.docs.flatMap((doc) => both(`/issues/${doc.slug}`, doc.updatedAt)),
    ...events.docs.flatMap((doc) => both(`/events/${doc.slug}`, doc.updatedAt)),
    ...people.docs.flatMap((doc) => both(`/people/${doc.slug}`, doc.updatedAt)),
    ...pages.docs.flatMap((doc) => both(`/${doc.slug}`, doc.updatedAt)),
  ]
}
