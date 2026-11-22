import type { AppLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/payload'

export type SearchResult = {
  id: number
  collection: string
  slug: string
  title: string
  excerpt: string
}

/**
 * Site search over the search index of plugin-search (articles, issues, events,
 * people). Matches title and excerpt, like the old WordPress search matched title and text.
 */
export async function searchSite(
  locale: AppLocale,
  query: string,
  limit = 30,
): Promise<SearchResult[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'search',
    locale,
    where: { or: [{ title: { like: query } }, { excerpt: { like: query } }] },
    sort: 'priority',
    limit,
    depth: 0,
    overrideAccess: false,
  })
  return result.docs
    .map((doc) => ({
      id: doc.id,
      collection: doc.doc.relationTo,
      slug: (doc as { slug?: string }).slug ?? '',
      title: doc.title ?? '',
      excerpt: (doc as { excerpt?: string }).excerpt ?? '',
    }))
    .filter((doc) => doc.slug)
}
