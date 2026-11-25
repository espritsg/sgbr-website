/**
 * All reads of the website. Server-only, through the Payload Local API.
 */
import { ISSUE_SORT } from '@/lib/data/issueOrder'
import type { Where } from 'payload'

import type { AppLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/payload'
import type { Event, Issue, Page, Person, Post, Topic } from '@/payload-types'

import { queryOptions } from './context'

const CARD_DEPTH = 1

async function client(locale: AppLocale) {
  const payload = await getPayloadClient()
  const options = await queryOptions(locale)
  return { payload, options }
}

/** Selected fields for cards keep list queries small. */
const cardSelect = {
  title: true,
  slug: true,
  summary: true,
  type: true,
  publishedAt: true,
  heroImage: true,
  issueImage: true,
  interviewees: true,
  topics: true,
  originalLanguage: true,
} as const

export async function getLatestPosts(
  locale: AppLocale,
  limit = 6,
  exclude: number[] = [],
): Promise<Post[]> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'posts',
    ...options,
    where: exclude.length ? { id: { not_in: exclude } } : undefined,
    sort: '-publishedAt',
    limit,
    depth: CARD_DEPTH,
    select: cardSelect,
  })
  return result.docs as Post[]
}

export async function getPostsByTopic(locale: AppLocale, topicIds: number[], page = 1, limit = 12) {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'posts',
    ...options,
    where: { topics: { in: topicIds } },
    sort: '-publishedAt',
    page,
    limit,
    depth: CARD_DEPTH,
    select: cardSelect,
  })
  return { ...result, docs: result.docs as Post[] }
}

export type PostFilter = {
  topicIds?: number[]
  query?: string
  type?: Post['type']
  page?: number
  limit?: number
}

/** Article list of the topics page: topic, free text (title or summary) and type combine. */
export async function findPosts(locale: AppLocale, filter: PostFilter) {
  const { payload, options } = await client(locale)
  const and: Where[] = []
  if (filter.topicIds?.length) and.push({ topics: { in: filter.topicIds } })
  if (filter.type) and.push({ type: { equals: filter.type } })
  const query = filter.query?.trim()
  if (query) and.push({ or: [{ title: { like: query } }, { summary: { like: query } }] })
  const result = await payload.find({
    collection: 'posts',
    ...options,
    where: and.length ? { and } : undefined,
    sort: '-publishedAt',
    page: filter.page ?? 1,
    limit: filter.limit ?? 12,
    depth: CARD_DEPTH,
    select: cardSelect,
  })
  return { ...result, docs: result.docs as Post[] }
}

/** Number of published articles per topic id (a main topic counts its sub-topics too). */
export async function countPostsByTopic(
  locale: AppLocale,
  groups: Array<{ id: number; topicIds: number[] }>,
): Promise<Map<number, number>> {
  const { payload, options } = await client(locale)
  const counts = await Promise.all(
    groups.map(async (group) => {
      const { totalDocs } = await payload.count({
        collection: 'posts',
        locale: options.locale,
        overrideAccess: options.overrideAccess,
        where: { topics: { in: group.topicIds } },
      })
      return [group.id, totalDocs] as const
    }),
  )
  return new Map(counts)
}

export async function getPost(locale: AppLocale, slug: string): Promise<Post | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'posts',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Post | undefined) ?? null
}

export async function getAdjacentPosts(locale: AppLocale, post: Post) {
  const { payload, options } = await client(locale)
  if (!post.publishedAt) return { previous: null, next: null }
  const find = async (where: Where, sort: string) =>
    (
      await payload.find({
        collection: 'posts',
        ...options,
        where,
        sort,
        limit: 1,
        depth: 0,
        select: { title: true, slug: true },
      })
    ).docs[0] as Pick<Post, 'id' | 'title' | 'slug'> | undefined
  const [previous, next] = await Promise.all([
    find({ publishedAt: { less_than: post.publishedAt } }, '-publishedAt'),
    find({ publishedAt: { greater_than: post.publishedAt } }, 'publishedAt'),
  ])
  return { previous: previous ?? null, next: next ?? null }
}

export async function getTopics(locale: AppLocale): Promise<Topic[]> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'topics',
    ...options,
    sort: 'order',
    limit: 200,
    depth: 0,
  })
  return result.docs as Topic[]
}

export async function getTopic(locale: AppLocale, slug: string): Promise<Topic | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'topics',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Topic | undefined) ?? null
}

export async function getIssues(locale: AppLocale): Promise<Issue[]> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'issues',
    ...options,
    sort: ISSUE_SORT,
    limit: 200,
    depth: 1,
  })
  return result.docs as Issue[]
}

export async function getIssue(locale: AppLocale, slug: string): Promise<Issue | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'issues',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    joins: { articles: { limit: 50, sort: 'publishedAt' } },
  })
  return (result.docs[0] as Issue | undefined) ?? null
}

export async function getEvents(
  locale: AppLocale,
  when: 'upcoming' | 'past',
  limit = 50,
): Promise<Event[]> {
  const { payload, options } = await client(locale)
  const now = new Date().toISOString()
  const result = await payload.find({
    collection: 'events',
    ...options,
    where:
      when === 'upcoming'
        ? { startsAt: { greater_than: now } }
        : { startsAt: { less_than_equal: now } },
    sort: when === 'upcoming' ? 'startsAt' : '-startsAt',
    limit,
    depth: 2,
  })
  return result.docs as Event[]
}

export async function getEvent(locale: AppLocale, slug: string): Promise<Event | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'events',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Event | undefined) ?? null
}

export async function getPerson(locale: AppLocale, slug: string): Promise<Person | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'people',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    joins: {
      articles: { limit: 100, sort: '-publishedAt' },
      events: { limit: 100, sort: '-startsAt' },
    },
  })
  return (result.docs[0] as Person | undefined) ?? null
}

/** Joined documents come as IDs in this depth; load them with access rules applied. */
export async function getPostsByIds(locale: AppLocale, ids: number[]): Promise<Post[]> {
  if (!ids.length) return []
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'posts',
    ...options,
    where: { id: { in: ids } },
    sort: '-publishedAt',
    limit: ids.length,
    depth: CARD_DEPTH,
    select: cardSelect,
  })
  return result.docs as Post[]
}

export async function getEventsByIds(locale: AppLocale, ids: number[]): Promise<Event[]> {
  if (!ids.length) return []
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'events',
    ...options,
    where: { id: { in: ids } },
    sort: '-startsAt',
    limit: ids.length,
    depth: 2,
  })
  return result.docs as Event[]
}

export async function getPage(locale: AppLocale, slug: string): Promise<Page | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'pages',
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Page | undefined) ?? null
}

export async function getTeam(locale: AppLocale, groups: string[]) {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'team-members',
    ...options,
    where: { and: [{ active: { equals: true } }, { group: { in: groups } }] },
    sort: 'order',
    limit: 200,
    depth: 1,
  })
  return result.docs
}

export async function getGlobals(locale: AppLocale) {
  const payload = await getPayloadClient()
  const [header, footer, settings] = await Promise.all([
    payload.findGlobal({ slug: 'header', locale, depth: 0 }),
    payload.findGlobal({ slug: 'footer', locale, depth: 0 }),
    // Site settings are read server-side only (not public through the API).
    payload.findGlobal({ slug: 'site-settings', locale, depth: 1 }),
  ])
  return { header, footer, settings }
}

export async function getHomepage(locale: AppLocale) {
  const payload = await getPayloadClient()
  const options = await queryOptions(locale)
  return payload.findGlobal({ slug: 'homepage', locale, depth: 2, draft: options.draft })
}

export async function getLatestDigitalIssue(locale: AppLocale): Promise<Issue | null> {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'issues',
    ...options,
    where: { format: { equals: 'digital' } },
    sort: ISSUE_SORT,
    limit: 1,
    depth: 1,
  })
  return (result.docs[0] as Issue | undefined) ?? null
}

export async function getForm(id: number) {
  const payload = await getPayloadClient()
  try {
    return await payload.findByID({ collection: 'forms', id, depth: 0 })
  } catch {
    return null
  }
}

/** Newsletter archive: the access rules show only sent newsletters after their delay. */
export async function getNewsletterArchive(locale: AppLocale) {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'newsletters',
    locale,
    overrideAccess: options.overrideAccess,
    where: { status: { equals: 'sent' } },
    sort: '-sentAt',
    limit: 100,
    depth: 0,
    select: { title: true, slug: true, intro: true, sentAt: true },
  })
  return result.docs
}

export async function getNewsletter(locale: AppLocale, slug: string) {
  const { payload, options } = await client(locale)
  const result = await payload.find({
    collection: 'newsletters',
    locale,
    overrideAccess: options.overrideAccess,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}
