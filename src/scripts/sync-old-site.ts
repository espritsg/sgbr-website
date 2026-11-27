/**
 * Sync with the old site while it is still the live site (docs/migration.md):
 * brings over what was added or exists only there, without touching what the editors
 * already changed in Payload.
 *
 *   npm run sync:old-site                 # local database
 *   SYNC_DRY_RUN=1 npm run sync:old-site  # only list what would change
 *
 * - New articles (REST API, the newest 30): only articles that do not exist yet.
 * - Speaker events: missing events are created; description ("About the speaker" …) and
 *   recap (title, introduction, chapters with photos) are filled only where empty.
 * - Team: email and LinkedIn from the About page, only where empty.
 *
 * Reads the old site only (no login). Against production: DATABASE_URL and R2_* as for
 * the final migration.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { Event } from '@/payload-types'

import { decodeEntities } from './lib/html'
import {
  createReport,
  importEvents,
  parseAboutTeam,
  printReport,
  type EventsFeed,
  type ImportReport,
} from './lib/importers'
import { htmlToLexical } from './lib/lexical'
import { createMediaImporter } from './lib/media'
import { parseEventDetail } from './lib/oldSite'
import { fetchWpPosts, importWpPost } from './lib/wpRest'

const SOURCE = (process.env.SYNC_SOURCE || 'https://stgallenbusinessreview.com').replace(/\/$/, '')
const USER_AGENT = 'Mozilla/5.0 (compatible; sgbr-sync)'
const DRY_RUN = process.env.SYNC_DRY_RUN === '1'
const POST_LIMIT = 30

const getJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${SOURCE}${path}`, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`)
  return (await response.json()) as T
}

async function getText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    return response.ok ? await response.text() : null
  } catch {
    return null
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function isEmptyRichText(value: unknown): boolean {
  const children = (value as { root?: { children?: Array<{ children?: unknown[] }> } } | null)?.root
    ?.children
  return !children?.length || children.every((child) => !child.children?.length)
}

async function idsBySlug(payload: Payload, collection: 'topics' | 'issues') {
  const result = await payload.find({ collection, limit: 500, depth: 0, draft: true })
  return new Map(result.docs.map((doc) => [doc.slug as string, doc.id]))
}

async function syncPosts(
  payload: Payload,
  media: ReturnType<typeof createMediaImporter>,
  report: ImportReport,
) {
  console.log('→ Neue Artikel')
  const posts = await fetchWpPosts(getJson, POST_LIMIT)
  const existing = await payload.find({
    collection: 'posts',
    where: { wpId: { in: posts.map((post) => post.id) } },
    limit: POST_LIMIT,
    depth: 0,
    draft: true,
    select: { wpId: true },
  })
  const known = new Set(existing.docs.map((doc) => doc.wpId))
  const missing = posts.filter((post) => !known.has(post.id))
  if (!missing.length) {
    console.log('  keine neuen Artikel')
    return
  }
  const categories = await getJson<Array<{ id: number; slug: string }>>(
    '/wp-json/wp/v2/categories?per_page=100',
  )
  const context = {
    topicIds: await idsBySlug(payload, 'topics'),
    issueIds: await idsBySlug(payload, 'issues'),
    categorySlug: new Map(categories.map((category) => [category.id, category.slug])),
  }
  for (const post of missing) {
    console.log(`  + ${post.slug}`)
    if (DRY_RUN) continue
    await importWpPost(payload, media, report, context, getJson, post)
    report.notes.push(`Neuer Artikel: ${decodeEntities(post.title.rendered)}`)
  }
}

async function syncEvents(
  payload: Payload,
  media: ReturnType<typeof createMediaImporter>,
  report: ImportReport,
) {
  console.log('→ Speaker Events')
  const feed = await getJson<EventsFeed>('/category/speaker-events/?sgbr_feed=1')
  for (const item of feed.events) {
    const found = await payload.find({
      collection: 'events',
      where: { slug: { equals: item.id } },
      limit: 1,
      depth: 0,
      draft: true,
      locale: 'en',
      fallbackLocale: false,
    } as never)
    let event = found.docs[0] as Event | undefined
    if (!event) {
      console.log(`  + Event ${item.id}`)
      if (DRY_RUN) continue
      const ids = await importEvents(payload, media, report, { events: [item] })
      const id = ids.get(item.id)
      if (!id) continue
      event = (await payload.findByID({
        collection: 'events',
        id,
        depth: 0,
        locale: 'en',
      })) as Event
    }

    const html = await getText(
      `${SOURCE}/category/speaker-events/?e=${encodeURIComponent(item.id)}`,
    )
    if (!html) {
      report.notes.push(`Event ${item.id}: Detailseite nicht erreichbar`)
      continue
    }
    const detail = parseEventDetail(html)
    const data: Record<string, unknown> = {}

    if (detail.descriptionHtml && isEmptyRichText(event.description)) {
      data.description = await htmlToLexical(payload.config, detail.descriptionHtml, 'default')
    }
    if (detail.recap && !(event.recapChapters ?? []).length) {
      const chapters = []
      for (const chapter of detail.recap.chapters) {
        const image = DRY_RUN
          ? 0
          : await media.get({ url: chapter.imageUrl, alt: chapter.imageAlt ?? item.name })
        if (image === null) continue
        chapters.push({ image, heading: chapter.heading, text: chapter.text })
      }
      if (chapters.length) {
        data.recapChapters = chapters
        if (!event.recapTitle && detail.recap.title) data.recapTitle = detail.recap.title
        if (isEmptyRichText(event.recapIntro) && detail.recap.intro.length) {
          data.recapIntro = await htmlToLexical(
            payload.config,
            detail.recap.intro.map((text) => `<p>${escapeHtml(text)}</p>`).join(''),
            'default',
          )
        }
      }
    }

    const fields = Object.keys(data)
    if (!fields.length) {
      console.log(`  = ${item.id} (nichts zu ergänzen)`)
      continue
    }
    console.log(`  ~ ${item.id}: ${fields.join(', ')}`)
    if (DRY_RUN) continue
    await payload.update({
      collection: 'events',
      id: event.id,
      locale: 'en',
      data,
      context: { import: true },
    })
    report.notes.push(`Event ${item.id}: ${fields.join(', ')} ergänzt`)
  }
}

async function syncTeam(payload: Payload, report: ImportReport) {
  console.log('→ Team (E-Mail, LinkedIn)')
  const html = await getText(`${SOURCE}/about/`)
  if (!html) {
    report.notes.push('About-Seite nicht erreichbar, Team übersprungen')
    return
  }
  for (const member of parseAboutTeam(html, SOURCE)) {
    const found = await payload.find({
      collection: 'team-members',
      where: { name: { equals: member.name } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      report.notes.push(`Team: ${member.name} fehlt in Payload (nicht angelegt)`)
      continue
    }
    const data: Record<string, string> = {}
    if (!doc.email && member.email) data.email = member.email
    if (!doc.linkedin && member.linkedin) data.linkedin = member.linkedin
    if (!Object.keys(data).length) continue
    console.log(`  ~ ${member.name}: ${Object.keys(data).join(', ')}`)
    if (DRY_RUN) continue
    await payload.update({ collection: 'team-members', id: doc.id, data, locale: 'en' })
  }
}

async function main() {
  const payload = await getPayload({ config })
  const report = createReport()
  const media = createMediaImporter(payload, USER_AGENT)
  console.log(`Abgleich mit ${SOURCE}${DRY_RUN ? ' (Probelauf, nichts wird geschrieben)' : ''}`)
  await syncPosts(payload, media, report)
  await syncEvents(payload, media, report)
  await syncTeam(payload, report)
  printReport(report, media)
  process.exit(0)
}

// Top-level await: `payload run` exits as soon as the import of this module resolves.
try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
