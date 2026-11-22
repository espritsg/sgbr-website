/**
 * Mapping logic shared by the dev import (import-dev.ts) and the final migration
 * (migrate.ts). Sources differ, the way data lands in Payload is the same
 * (docs/migration.md). Every function can run repeatedly without duplicates.
 */
import type { Payload } from 'payload'

import { categoryMap, mainTopics, type CategoryTarget } from '@/lib/categoryMap'
import { parseFeedDate } from '@/lib/dates'
import { slugify } from '@/lib/slugify'

import {
  decodeEntities,
  findImages,
  paragraphs,
  prepareHtmlForLexical,
  stripShortcodes,
  stripTags,
} from './html'
import { detectLanguage } from './language'
import { htmlToLexical } from './lexical'
import type { MediaImporter } from './media'
import { createSummary } from './summary'
import { upsert } from './upsert'

type Id = number

export type ImportReport = {
  counts: Record<string, { created: number; updated: number }>
  postsWithoutMainTopic: string[]
  postsWithFallbackSummary: string[]
  uncertainLanguage: string[]
  shortcodeArticles: string[]
  notes: string[]
}

export function createReport(): ImportReport {
  return {
    counts: {},
    postsWithoutMainTopic: [],
    postsWithFallbackSummary: [],
    uncertainLanguage: [],
    shortcodeArticles: [],
    notes: [],
  }
}

function count(report: ImportReport, collection: string, created: boolean) {
  report.counts[collection] ??= { created: 0, updated: 0 }
  report.counts[collection][created ? 'created' : 'updated'] += 1
}

export function printReport(report: ImportReport, media: MediaImporter) {
  console.log('\n=== Bericht ===')
  for (const [collection, { created, updated }] of Object.entries(report.counts)) {
    console.log(`${collection.padEnd(18)} neu: ${created}, aktualisiert: ${updated}`)
  }
  const list = (title: string, items: string[]) => {
    if (!items.length) return
    console.log(`\n${title} (${items.length}):`)
    for (const item of items) console.log(`  - ${item}`)
  }
  list('Fehlende Dateien', media.missing)
  list('Artikel ohne Haupt-Thema (bitte zuordnen)', report.postsWithoutMainTopic)
  list('Artikel mit Zusammenfassung aus dem ersten Absatz', report.postsWithFallbackSummary)
  list('Sprache unsicher (bitte prüfen)', report.uncertainLanguage)
  list('Artikel mit entfernten Shortcodes (von Hand prüfen)', report.shortcodeArticles)
  list('Hinweise', report.notes)
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export type TopicIds = Map<string, Id>

/** Creates the four main topics and all sub-topics from src/lib/categoryMap.ts. */
export async function importTopics(payload: Payload, report: ImportReport): Promise<TopicIds> {
  const ids: TopicIds = new Map()
  for (const main of mainTopics) {
    const { doc, created } = await upsert(
      payload,
      'topics',
      { field: 'slug', value: main.slug },
      { title: main.title.en, slug: main.slug, order: main.order, _status: 'published' },
      { locale: 'en' },
    )
    await payload.update({
      collection: 'topics',
      id: doc.id,
      locale: 'de',
      data: { title: main.title.de },
    })
    ids.set(main.slug, doc.id as Id)
    count(report, 'topics', created)
  }
  let order = 100
  for (const target of Object.values(categoryMap)) {
    if (target.kind !== 'sub') continue
    const { doc, created } = await upsert(
      payload,
      'topics',
      { field: 'slug', value: target.topic },
      {
        title: target.title,
        slug: target.topic,
        parent: ids.get(target.parent),
        order: order++,
        _status: 'published',
      },
      { locale: 'en' },
    )
    ids.set(target.topic, doc.id as Id)
    count(report, 'topics', created)
  }
  return ids
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export type PersonInput = {
  wpId?: number
  name: string
  slug?: string
  bio?: string
  photoUrl?: string
  role?: string
  organization?: string
  organizationLogoUrl?: string
}

export async function importPerson(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  input: PersonInput,
): Promise<Id> {
  const slug = input.slug || slugify(input.name)
  const bio = input.bio
    ? decodeEntities(input.bio)
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : undefined
  const photo = input.photoUrl ? await media.get({ url: input.photoUrl, alt: input.name }) : null
  const logo = input.organizationLogoUrl
    ? await media.get({ url: input.organizationLogoUrl, alt: input.organization ?? input.name })
    : null
  const bioLocale = bio ? detectLanguage(bio).language : 'en'

  const data: Record<string, unknown> = {
    name: decodeEntities(input.name),
    slug,
    _status: 'published',
  }
  if (input.wpId) data.wpId = input.wpId
  if (input.organization) data.organization = input.organization
  if (photo) data.photo = photo
  if (logo) data.organizationLogo = logo
  const where = input.wpId ? { field: 'wpId', value: input.wpId } : { field: 'slug', value: slug }
  // A person may exist by slug from another source (e.g. an event speaker).
  const bySlug = input.wpId
    ? await payload.find({
        collection: 'people',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        draft: true,
      })
    : null
  const effectiveWhere =
    bySlug?.docs[0] && !bySlug.docs[0].wpId ? { field: 'slug', value: slug } : where

  const { doc, created } = await upsert(payload, 'people', effectiveWhere, data, { locale: 'en' })
  const localized: Record<string, unknown> = {}
  if (input.role) localized.role = input.role
  if (Object.keys(localized).length) {
    await payload.update({ collection: 'people', id: doc.id, locale: 'en', data: localized })
  }
  if (bio)
    await payload.update({ collection: 'people', id: doc.id, locale: bioLocale, data: { bio } })
  count(report, 'people', created)
  return doc.id as Id
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export type PostInput = {
  wpId: number
  slug: string
  title: string
  contentHtml: string
  publishedAt: string
  categorySlugs: string[]
  personIds: Id[]
  personNames: string[]
  featuredImage?: { url: string; alt?: string; wpId?: number } | null
  /** Inline images by WordPress media ID (from the REST API or the WXR export). */
  inlineImages: Map<number, { url: string; alt?: string }>
  seo?: { title?: string; description?: string }
  status: 'published' | 'draft'
}

export type IssueIds = Map<string, Id>

function resolveCategories(slugs: string[], topicIds: TopicIds, issueIds: IssueIds) {
  const topics = new Set<Id>()
  let issue: Id | undefined
  let hasMain = false
  for (const slug of slugs) {
    const target: CategoryTarget | undefined = categoryMap[slug]
    if (!target) continue
    if (target.kind === 'main') {
      hasMain = true
      const id = topicIds.get(target.topic)
      if (id) topics.add(id)
    } else if (target.kind === 'sub') {
      const id = topicIds.get(target.topic)
      if (id) topics.add(id)
      // A sub-topic implies its main topic.
      const parentId = topicIds.get(target.parent)
      if (parentId) {
        topics.add(parentId)
        hasMain = true
      }
    } else if (target.kind === 'issue') {
      issue = issueIds.get(target.issue) ?? issue
      const implied = target.impliesTopic ? topicIds.get(target.impliesTopic) : undefined
      if (implied) {
        topics.add(implied)
        hasMain = true
      }
    }
  }
  return { topics: [...topics], issue, hasMain }
}

/** Interviews have several bold paragraphs (the questions); guest articles do not. */
export function guessPostType(html: string): 'interview' | 'guest-article' {
  return paragraphs(html).filter((p) => p.bold).length >= 3 ? 'interview' : 'guest-article'
}

export async function importPost(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  context: { topicIds: TopicIds; issueIds: IssueIds },
  input: PostInput,
): Promise<Id> {
  const title = decodeEntities(stripTags(input.title))
  const { removed } = stripShortcodes(input.contentHtml)
  if (removed > 0) report.shortcodeArticles.push(`${input.slug} (${removed} Shortcodes)`)

  const plain = stripTags(input.contentHtml)
  const guess = detectLanguage(`${title} ${plain}`)
  if (!guess.confident) report.uncertainLanguage.push(`${input.slug} (geraten: ${guess.language})`)
  const locale = guess.language
  const type = guessPostType(input.contentHtml)

  // Inline images become upload nodes.
  const imageIds = new Map<string, Id>()
  for (const image of findImages(input.contentHtml)) {
    const known = image.wpId ? input.inlineImages.get(image.wpId) : undefined
    const id = await media.get({
      url: known?.url ?? image.src,
      alt: known?.alt ?? image.alt,
      wpId: image.wpId ?? undefined,
    })
    if (id) imageIds.set(image.src, id)
  }
  const html = prepareHtmlForLexical(input.contentHtml, (image) => imageIds.get(image.src) ?? null)
  const content = await htmlToLexical(payload.config, html, 'article')

  const heroImage = input.featuredImage
    ? await media.get({
        url: input.featuredImage.url,
        alt: input.featuredImage.alt,
        wpId: input.featuredImage.wpId,
      })
    : null

  const { topics, issue, hasMain } = resolveCategories(
    input.categorySlugs,
    context.topicIds,
    context.issueIds,
  )
  if (!hasMain) report.postsWithoutMainTopic.push(input.slug)

  // Never overwrite an existing summary (repeated runs must not destroy editorial work).
  const existing = await payload.find({
    collection: 'posts',
    where: { wpId: { equals: input.wpId } },
    locale,
    fallbackLocale: false,
    limit: 1,
    depth: 0,
    draft: true,
  } as never)
  const existingDoc = existing.docs[0] as { summary?: string | null } | undefined
  let summaryData: Record<string, unknown> = {}
  if (!existingDoc?.summary) {
    const { summary, source } = await createSummary({
      title,
      html: input.contentHtml,
      language: locale,
      people: input.personNames,
      type,
    })
    if (source === 'first-paragraph') report.postsWithFallbackSummary.push(input.slug)
    summaryData = { summary: summary || title, summaryNeedsReview: true }
  }

  const data: Record<string, unknown> = {
    wpId: input.wpId,
    slug: input.slug,
    type,
    title,
    content,
    ...summaryData,
    originalLanguage: locale,
    publishedAt: input.publishedAt,
    interviewees: input.personIds,
    topics,
    issue: issue ?? null,
    heroImage: heroImage ?? undefined,
    _status: input.status,
  }
  if (input.seo?.title || input.seo?.description) {
    data.meta = {
      title: input.seo.title ? decodeEntities(input.seo.title) : undefined,
      description: input.seo.description ? decodeEntities(input.seo.description) : undefined,
      image: heroImage ?? undefined,
    }
  }

  // Imported articles without a main topic are published anyway so their old URLs keep
  // working; the report lists them for the editorial team (docs/migration.md).
  const { doc, created } = await upsert(
    payload,
    'posts',
    { field: 'wpId', value: input.wpId },
    data,
    { locale },
  )
  count(report, 'posts', created)
  return doc.id as Id
}

// ---------------------------------------------------------------------------
// Issues and events from the espritsg.ch feeds
// ---------------------------------------------------------------------------

export type IssuesFeed = {
  digital: Array<{
    year: string
    title: string
    description: string
    url: string
    cover_url: string
  }>
  archive: Array<{
    year: string
    title: string
    description: string
    url: string
    cover_url: string
  }>
}

export type IssuePage = { tagline?: string; forewordHtml?: string; editorNames: string[] }

/** Reads foreword, tagline and editors from an old issue page (`sgbr-tfof-*` markup). */
export function parseIssuePage(html: string): IssuePage {
  const tagline = html.match(/class="sgbr-tfof-issue-subtitle"[^>]*>([\s\S]*?)<\/p>/)?.[1]
  const forewordHtml = html.match(/class="sgbr-tfof-foreword"[^>]*>([\s\S]*?)<\/div>/)?.[1]
  const editorNames = [
    ...html.matchAll(/class="sgbr-tfof-signoff-name[^"]*"[^>]*>([\s\S]*?)<\/span>/g),
  ].map((m) => stripTags(m[1]))
  return { tagline: tagline ? stripTags(tagline) : undefined, forewordHtml, editorNames }
}

function slugFromUrl(url: string): string {
  return new URL(url).pathname.split('/').filter(Boolean).pop() ?? slugify(url)
}

export async function importIssues(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  feed: IssuesFeed,
  loadIssuePage: (url: string) => Promise<string | null>,
  teamIdsByName: Map<string, Id>,
): Promise<IssueIds> {
  const ids: IssueIds = new Map()

  for (const item of feed.digital) {
    const slug = slugFromUrl(item.url)
    const pageHtml = await loadIssuePage(item.url)
    const page = pageHtml ? parseIssuePage(pageHtml) : { editorNames: [] as string[] }
    const cover = item.cover_url ? await media.get({ url: item.cover_url, alt: item.title }) : null
    const foreword = page.forewordHtml
      ? await htmlToLexical(payload.config, page.forewordHtml, 'default')
      : undefined
    const editors = page.editorNames
      .map((name) => teamIdsByName.get(name))
      .filter((id): id is Id => Boolean(id))
    const { doc, created } = await upsert(
      payload,
      'issues',
      { field: 'slug', value: slug },
      {
        slug,
        title: decodeEntities(item.title),
        tagline: page.tagline,
        description: decodeEntities(item.description),
        foreword,
        year: Number(item.year),
        format: 'digital',
        cover: cover ?? undefined,
        editors,
        _status: 'published',
      },
      { locale: 'en' },
    )
    ids.set(slug, doc.id as Id)
    count(report, 'issues', created)
  }

  for (const item of feed.archive) {
    const slug = slugify(`${item.title}-${item.year}`)
    const pdf = await media.get({ url: item.url, alt: `${item.title} ${item.year}` })
    const cover = item.cover_url
      ? await media.get({ url: item.cover_url, alt: `${item.title} ${item.year}` })
      : null
    const { doc, created } = await upsert(
      payload,
      'issues',
      { field: 'slug', value: slug },
      {
        slug,
        title: decodeEntities(item.title),
        description: item.description ? decodeEntities(item.description) : undefined,
        year: Number(item.year),
        format: 'pdf',
        pdf: pdf ?? undefined,
        cover: cover ?? undefined,
        _status: 'published',
      },
      { locale: 'en' },
    )
    ids.set(slug, doc.id as Id)
    count(report, 'issues', created)
  }
  return ids
}

export type EventsFeed = {
  events: Array<{
    id: string
    logo_url: string
    language: string
    name: string
    role: string
    company: string
    date: string
    time: string
    location: string
  }>
}

export async function importEvents(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  feed: EventsFeed,
): Promise<Map<string, Id>> {
  const ids = new Map<string, Id>()
  for (const item of feed.events) {
    const startsAt = parseFeedDate(item.date, item.time)
    if (!startsAt) {
      report.notes.push(
        `Event ${item.id}: Datum „${item.date} ${item.time}“ nicht lesbar, übersprungen`,
      )
      continue
    }
    const speaker = await importPerson(payload, media, report, {
      name: item.name,
      role: item.role,
      organization: item.company,
      organizationLogoUrl: item.logo_url || undefined,
    })
    const { doc, created } = await upsert(
      payload,
      'events',
      { field: 'slug', value: item.id },
      {
        slug: item.id,
        speaker,
        startsAt: startsAt.toISOString(),
        location: item.location,
        language: item.language.toLowerCase().startsWith('german') ? 'de' : 'en',
        _status: 'published',
      },
      { locale: 'en' },
    )
    ids.set(item.id, doc.id as Id)
    count(report, 'events', created)
  }
  return ids
}

// ---------------------------------------------------------------------------
// Team from the old About page
// ---------------------------------------------------------------------------

export type TeamMemberInput = {
  name: string
  group: 'editorial-board' | 'editors' | 'advisory'
  position?: string
  study?: string
  university?: string
  photoUrl?: string
  order: number
}

/** Reads the team from the About page markup (`sgbr-about-*`), which lives in the theme. */
export function parseAboutTeam(html: string, baseUrl: string): TeamMemberInput[] {
  const result: TeamMemberInput[] = []
  const sections = html.split(/<div class="sgbr-about-label">/).slice(1)
  for (const section of sections) {
    const label = stripTags(section.slice(0, section.indexOf('</div>'))).toLowerCase()
    const group = label.includes('advisory')
      ? 'advisory'
      : label.includes('board')
        ? 'editorial-board'
        : 'editors'
    const people = section.split(/<div class="sgbr-about-person[^"]*">/).slice(1)
    for (const person of people) {
      const field = (name: string) => {
        const match = person.match(
          new RegExp(`class="sgbr-about-${name}[^"]*"[^>]*>([\\s\\S]*?)</div>`),
        )
        return match ? stripTags(match[1]) || undefined : undefined
      }
      const name = field('name')
      if (!name) continue
      const src = person.match(/<img[^>]*src="([^"]+)"/)?.[1]
      const photoUrl =
        src && !src.startsWith('data:') ? new URL(src, baseUrl).toString() : undefined
      result.push({
        name,
        group,
        position: field('position'),
        study: field('meta'),
        university: field('uni'),
        photoUrl,
        order: result.length + 1,
      })
    }
  }
  return result
}

export async function importTeam(
  payload: Payload,
  media: MediaImporter,
  report: ImportReport,
  members: TeamMemberInput[],
): Promise<Map<string, Id>> {
  const ids = new Map<string, Id>()
  for (const member of members) {
    const photo = member.photoUrl
      ? await media.get({ url: member.photoUrl, alt: member.name })
      : null
    const existing = await payload.find({
      collection: 'team-members',
      where: { name: { equals: member.name } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const data = {
      name: member.name,
      group: member.group,
      position: member.position,
      study: member.study,
      university: member.university,
      photo: photo ?? undefined,
      active: true,
      order: member.order,
      _status: 'published' as const,
    }
    const doc = existing.docs[0]
      ? await payload.update({
          collection: 'team-members',
          id: existing.docs[0].id,
          data,
          locale: 'en',
        })
      : await payload.create({ collection: 'team-members', data, locale: 'en' })
    ids.set(member.name, doc.id)
    count(report, 'team-members', !existing.docs[0])
  }
  return ids
}
