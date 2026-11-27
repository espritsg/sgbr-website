/**
 * Articles from the public WordPress REST API of the old site, shared by the dev import
 * (import-dev.ts) and the sync with the old site (sync-old-site.ts). Read-only.
 */
import type { Payload } from 'payload'

import {
  importPerson,
  importPostSafely,
  type ImportReport,
  type IssueIds,
  type TopicIds,
} from './importers'
import { originalImageUrl, type MediaImporter } from './media'

export type WpPost = {
  id: number
  slug: string
  date_gmt: string
  title: { rendered: string }
  content: { rendered: string }
  author: number
  categories: number[]
  _embedded?: {
    author?: Array<{
      id: number
      name: string
      slug: string
      description?: string
      avatar_urls?: Record<string, string>
    }>
    'wp:featuredmedia'?: Array<{ id: number; source_url: string; alt_text?: string }>
  }
}

export type GetJson = <T>(path: string) => Promise<T>

/** Newest published articles, newest first. */
export async function fetchWpPosts(getJson: GetJson, limit: number): Promise<WpPost[]> {
  const posts: WpPost[] = []
  // The page size must stay the same on every page, otherwise WordPress offsets shift.
  const perPage = Math.min(100, limit)
  for (let page = 1; posts.length < limit; page++) {
    const batch = await getJson<WpPost[]>(
      `/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=author,wp:featuredmedia`,
    )
    posts.push(...batch)
    if (batch.length < perPage) break
  }
  return posts.slice(0, limit)
}

/** Imports one REST article with its author (interviewee), images and categories. */
export async function importWpPost(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  context: { topicIds: TopicIds; issueIds: IssueIds; categorySlug: Map<number, string> },
  getJson: GetJson,
  post: WpPost,
) {
  const author = post._embedded?.author?.[0]
  const personIds = []
  const personNames = []
  if (author?.name) {
    const avatar = author.avatar_urls?.['96']
    personIds.push(
      await importPerson(payload, media, report, {
        wpId: author.id,
        name: author.name,
        slug: author.slug,
        bio: author.description,
        photoUrl: avatar?.includes('/wp-content/uploads/') ? originalImageUrl(avatar) : undefined,
        photoFallbackUrl: avatar?.includes('/wp-content/uploads/') ? avatar : undefined,
      }),
    )
    personNames.push(author.name)
  }

  // Inline images: look up their originals in the media API.
  const inlineImages = new Map<number, { url: string; alt?: string }>()
  for (const [, id] of post.content.rendered.matchAll(/wp-image-(\d+)/g)) {
    try {
      const item = await getJson<{ source_url: string; alt_text?: string }>(
        `/wp-json/wp/v2/media/${id}`,
      )
      inlineImages.set(Number(id), { url: item.source_url, alt: item.alt_text })
    } catch {
      // Fall back to the URL in the HTML.
    }
  }
  const featured = post._embedded?.['wp:featuredmedia']?.[0]

  return importPostSafely(
    payload,
    media,
    report,
    { topicIds: context.topicIds, issueIds: context.issueIds },
    {
      wpId: post.id,
      slug: post.slug,
      title: post.title.rendered,
      contentHtml: post.content.rendered,
      publishedAt: `${post.date_gmt}Z`,
      categorySlugs: post.categories
        .map((id) => context.categorySlug.get(id))
        .filter((slug): slug is string => Boolean(slug)),
      personIds,
      personNames,
      featuredImage: featured?.source_url
        ? { url: featured.source_url, alt: featured.alt_text, wpId: featured.id }
        : null,
      inlineImages,
      status: 'published',
    },
  )
}
