/**
 * Final migration from the WordPress exports (docs/migration.md, phase 2).
 * Uses the same mapping as the dev import (importers.ts); only the sources differ.
 *
 * Expected folder (MIGRATION_DIR):
 *   export.xml               WordPress export "All content" (WXR), required
 *   mailpoet.csv             MailPoet subscribers export (only confirmed ones are taken)
 *   redirection.json|.csv    export of the plugin "Redirection"
 *   uploads/                 copy of wp-content/uploads (otherwise files are downloaded)
 *   feeds/issues.json        /issues/?sgbr_feed=1 (otherwise fetched from the old site)
 *   feeds/events.json        /category/speaker-events/?sgbr_feed=1 (same)
 *   about.html               the old /about/ page (otherwise fetched)
 */
import fs from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'

import { zurichToDate } from '@/lib/dates'
import { slugify } from '@/lib/slugify'

import { column, parseCsv } from './csv'
import {
  createReport,
  importEvents,
  importIssues,
  importPerson,
  importPostSafely,
  importTeam,
  importTopics,
  parseAboutTeam,
  type EventsFeed,
  type ImportReport,
  type IssuesFeed,
} from './importers'
import {
  createMediaImporter,
  legacyPathFromUrl,
  originalImageUrl,
  type MediaImporter,
} from './media'
import { parseRedirection } from './redirection'
import { seedForms, seedGlobals, seedPages } from './seed'
import { getAudience } from '@/lib/newsletter/audience'
import { upsert } from './upsert'
import { parseWxr, wpDateToIso, type WxrItem } from './wxr'

export type MigrationOptions = {
  dir: string
  /** Old site for feeds, About page and author details (read only). */
  sourceUrl?: string
  /** No network access at all (tests). */
  offline?: boolean
  userAgent?: string
}

export type MigrationResult = { report: ImportReport; media: MediaImporter }

const exists = (file: string) =>
  fs
    .access(file)
    .then(() => true)
    .catch(() => false)

async function readOptional(file: string): Promise<string | null> {
  return (await exists(file)) ? fs.readFile(file, 'utf8') : null
}

/** Rank Math titles often contain variables like %title% %sep%; those are left out. */
function seoText(value: string | undefined): string | undefined {
  if (!value || value.includes('%')) return undefined
  return value.trim() || undefined
}

/** MailPoet writes dates without time zone in the site's time (Zurich). */
export function parseLocalDate(value: string): string | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?$/)
  if (match) {
    const [, y, m, d, h = '0', min = '0'] = match
    return zurichToDate(Number(y), Number(m), Number(d), Number(h), Number(min)).toISOString()
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString()
}

export async function runMigration(
  payload: Payload,
  options: MigrationOptions,
): Promise<MigrationResult> {
  const report = createReport()
  const sourceUrl = (options.sourceUrl || 'https://stgallenbusinessreview.com').replace(/\/$/, '')
  const userAgent = options.userAgent || 'Mozilla/5.0 (compatible; sgbr-migration)'
  const uploadsDir = path.join(options.dir, 'uploads')
  const media = createMediaImporter(payload, userAgent, {
    uploadsDir: (await exists(uploadsDir)) ? uploadsDir : undefined,
    offline: options.offline,
  })
  const fetchText = async (url: string) => {
    if (options.offline) return null
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent } })
      return response.ok ? response.text() : null
    } catch {
      return null
    }
  }
  const log = (message: string) => console.log(`→ ${message}`)

  const xml = await fs.readFile(path.join(options.dir, 'export.xml'), 'utf8')
  const wxr = parseWxr(xml)
  const attachments = new Map(
    wxr.items.filter((item) => item.type === 'attachment').map((item) => [item.id, item]),
  )
  const posts = wxr.items.filter(
    (item) => item.type === 'post' && item.status !== 'trash' && item.status !== 'auto-draft',
  )
  const pages = wxr.items.filter((item) => item.type === 'page')
  log(
    `Export: ${posts.length} Artikel, ${pages.length} Seiten, ${attachments.size} Dateien, ${wxr.authors.length} Autoren`,
  )

  // 1. Media: all files, so old /wp-content/uploads links keep working.
  log('Medien')
  const mediaIds = new Map<number, number>()
  for (const attachment of attachments.values()) {
    const id = await media.get({
      url: attachment.attachmentUrl,
      alt: attachment.meta._wp_attachment_image_alt || undefined,
      wpId: attachment.id,
    })
    if (id) mediaIds.set(attachment.id, id)
  }
  report.counts.media = { created: mediaIds.size, updated: 0 }

  // 2. Topics
  log('Themen')
  const topicIds = await importTopics(payload, report)

  // 3. People from the authors (dc:creator); details from the public REST API if reachable.
  log('Personen')
  const restUsers = new Map<string, { slug: string; description?: string; avatar?: string }>()
  const usersJson = await fetchText(`${sourceUrl}/wp-json/wp/v2/users?per_page=100`)
  if (usersJson) {
    for (let page = 1; ; page++) {
      const batch =
        page === 1
          ? usersJson
          : await fetchText(`${sourceUrl}/wp-json/wp/v2/users?per_page=100&page=${page}`)
      const list = batch
        ? (JSON.parse(batch) as Array<{
            id: number
            name: string
            slug: string
            description?: string
            avatar_urls?: Record<string, string>
          }>)
        : []
      for (const user of list)
        restUsers.set(user.name, {
          slug: user.slug,
          description: user.description,
          avatar: user.avatar_urls?.['96'],
        })
      if (list.length < 100) break
    }
  }
  const personByLogin = new Map<string, { id: number; name: string }>()
  for (const author of wxr.authors) {
    if (!posts.some((post) => post.creator === author.login)) continue
    const rest = restUsers.get(author.displayName)
    const id = await importPerson(payload, media, report, {
      wpId: author.id,
      name: author.displayName || author.login,
      slug: rest?.slug || slugify(author.login),
      bio: rest?.description,
      photoUrl: rest?.avatar?.includes('/wp-content/uploads/')
        ? originalImageUrl(rest.avatar)
        : undefined,
      photoFallbackUrl: rest?.avatar?.includes('/wp-content/uploads/') ? rest.avatar : undefined,
    })
    personByLogin.set(author.login, { id, name: author.displayName || author.login })
  }

  // 4. Team and issues (issues reference the editorial board)
  log('Team und Ausgaben')
  const aboutHtml =
    (await readOptional(path.join(options.dir, 'about.html'))) ??
    (await fetchText(`${sourceUrl}/about/`))
  const teamIds = aboutHtml
    ? await importTeam(payload, media, report, parseAboutTeam(aboutHtml, sourceUrl))
    : new Map<string, number>()
  if (!aboutHtml) report.notes.push('Keine About-Seite: Team nicht übernommen.')
  const issuesJson =
    (await readOptional(path.join(options.dir, 'feeds', 'issues.json'))) ??
    (await fetchText(`${sourceUrl}/issues/?sgbr_feed=1`))
  const issueIds = issuesJson
    ? await importIssues(
        payload,
        media,
        report,
        JSON.parse(issuesJson) as IssuesFeed,
        fetchText,
        teamIds,
      )
    : new Map<string, number>()
  if (!issuesJson) report.notes.push('Kein Ausgaben-Feed: Ausgaben nicht übernommen.')

  const eventsJson =
    (await readOptional(path.join(options.dir, 'feeds', 'events.json'))) ??
    (await fetchText(`${sourceUrl}/category/speaker-events/?sgbr_feed=1`))
  if (eventsJson) await importEvents(payload, media, report, JSON.parse(eventsJson) as EventsFeed)
  else report.notes.push('Kein Event-Feed: Speaker Events nicht übernommen.')

  // 5. Articles
  log('Artikel')
  for (const [index, post] of posts.entries()) {
    console.log(`  [${index + 1}/${posts.length}] ${post.slug}`)
    const person = personByLogin.get(post.creator)
    const thumbnail = attachments.get(Number(post.meta._thumbnail_id))
    const inlineImages = new Map<number, { url: string; alt?: string }>()
    for (const [, id] of post.content.matchAll(/wp-image-(\d+)/g)) {
      const attachment = attachments.get(Number(id))
      if (attachment)
        inlineImages.set(attachment.id, {
          url: attachment.attachmentUrl,
          alt: attachment.meta._wp_attachment_image_alt,
        })
    }
    await importPostSafely(
      payload,
      media,
      report,
      { topicIds, issueIds },
      {
        wpId: post.id,
        slug: post.slug || slugify(post.title),
        title: post.title,
        contentHtml: post.content,
        publishedAt: wpDateToIso(post.dateGmt) ?? new Date().toISOString(),
        categorySlugs: post.categories
          .filter((category) => category.domain === 'category')
          .map((category) => category.slug),
        personIds: person ? [person.id] : [],
        personNames: person ? [person.name] : [],
        featuredImage: thumbnail
          ? {
              url: thumbnail.attachmentUrl,
              alt: thumbnail.meta._wp_attachment_image_alt,
              wpId: thumbnail.id,
            }
          : null,
        inlineImages,
        seo: {
          title: seoText(post.meta.rank_math_title),
          description: seoText(post.meta.rank_math_description),
        },
        status: post.status === 'publish' ? 'published' : 'draft',
      },
    )
  }

  // 6. Pages, forms and globals
  log('Seiten, Formulare, Globals')
  const pageContent = (slug: string) =>
    pages.find((page: WxrItem) => page.slug === slug)?.content ?? null
  const forms = await seedForms(payload)
  await seedPages(
    payload,
    media,
    { aboutHtml, imprintHtml: pageContent('impressum'), contactHtml: pageContent('contact') },
    forms.contact,
  )
  await seedGlobals(payload, 'vc-pe-family-offices')

  // 7. Redirects from the Redirection plugin
  log('Weiterleitungen')
  for (const fileName of ['redirection.json', 'redirection.csv']) {
    const content = await readOptional(path.join(options.dir, fileName))
    if (!content) continue
    for (const entry of parseRedirection(content, fileName)) {
      if (entry.regex || !entry.from || !entry.to) {
        report.notes.push(
          `Weiterleitung übersprungen (Regex oder leer): ${entry.from} → ${entry.to}`,
        )
        continue
      }
      const from = entry.from.startsWith('/') ? entry.from : `/${entry.from}`
      const legacyFile = legacyPathFromUrl(entry.to)
      const to = legacyFile
        ? `/wp-content/uploads/${legacyFile}`
        : entry.to.replace(/^https?:\/\/(www\.)?stgallenbusinessreview\.com/, '') || '/'
      const { created } = await upsert(
        payload,
        'redirects',
        { field: 'from', value: from },
        { from, to: { type: 'custom', url: to }, type: entry.code },
      )
      report.counts.redirects ??= { created: 0, updated: 0 }
      report.counts.redirects[created ? 'created' : 'updated']++
    }
  }

  // 8. Newsletter subscribers: only confirmed MailPoet subscribers, written to Resend
  //    (or the local stand-in without RESEND_API_KEY). Existing contacts stay untouched.
  const csv = await readOptional(path.join(options.dir, 'mailpoet.csv'))
  if (csv) {
    log('Abonnenten')
    const audience = getAudience()
    let skipped = 0
    for (const row of parseCsv(csv)) {
      const email = column(row, 'email', 'e-mail').toLowerCase()
      const status = column(row, 'status').toLowerCase()
      if (!email || !['subscribed', 'confirmed', 'abonniert'].includes(status)) {
        skipped++
        continue
      }
      const consent = column(row, 'subscribed', 'confirmed', 'created', 'angemeldet')
      const consentAt = parseLocalDate(consent) ?? new Date().toISOString()
      const result = await audience.createIfMissing({
        email,
        firstName: column(row, 'first', 'vorname') || undefined,
        locale: 'en',
        interests: ['newsletter'],
        source: 'mailpoet-import',
        consentAt,
        confirmedAt: consentAt,
      })
      report.counts.subscribers ??= { created: 0, updated: 0 }
      if (result === 'created') report.counts.subscribers.created++
    }
    if (skipped)
      report.notes.push(
        `${skipped} MailPoet-Einträge nicht übernommen (nicht bestätigt oder abgemeldet).`,
      )
  }

  // Summary checks for the report
  const withoutSummary = await payload.count({
    collection: 'posts',
    where: { summary: { exists: false } },
  })
  if (withoutSummary.totalDocs)
    report.notes.push(`${withoutSummary.totalDocs} Artikel ohne Zusammenfassung.`)
  return { report, media }
}
