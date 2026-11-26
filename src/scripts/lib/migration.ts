/**
 * Final migration from the WordPress exports (docs/migration.md, phase 2).
 * Uses the same mapping as the dev import (importers.ts); only the sources differ.
 *
 * Expected folder (MIGRATION_DIR); the original file names of the exports work too:
 *   export.xml               WordPress export "All content" (WXR), required (or *.WordPress.*.xml)
 *   mailpoet.csv             MailPoet subscribers export (or MailPoet*.csv); only confirmed ones
 *   redirection.json|.csv    export of the plugin "Redirection" (or redirection*.json|csv)
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
import { compressPdf, hasGhostscript } from './pdf'
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
  /**
   * Also import media files no content uses (default: only used ones, imported on
   * demand; Vercel Blob Hobby allows 1 GB). Old links to unused files then give 404.
   */
  allMedia?: boolean
  /** Compress PDFs over 10 MB with Ghostscript before the upload (default: if gs exists). */
  compressPdfs?: boolean
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

/** `name` in `dir`, otherwise the first file matching `pattern` (original export names). */
export async function findExport(dir: string, name: string, pattern: RegExp): Promise<string> {
  const exact = path.join(dir, name)
  if (await exists(exact)) return exact
  const match = (await fs.readdir(dir)).sort().find((file) => pattern.test(file))
  return match ? path.join(dir, match) : exact
}

/** Rank Math titles often contain variables like %title% %sep%; those are left out. */
function seoText(value: string | undefined): string | undefined {
  if (!value || value.includes('%')) return undefined
  return value.trim() || undefined
}

/** WordPress accounts used by the editors themselves, not by an interview partner. */
export function isSystemAccount(name: string | undefined): boolean {
  return /^(it-vorstand|admin|administrator|redaktion|editor|sgbr|wordpress)$/i.test(
    (name ?? '').trim(),
  )
}

/**
 * WordPress display names often carry the role: "Joe Kaeser - CEO, Siemens AG",
 * "Daniel Kueng, CEO - Switzerland Global Enterprise". Splits at the first " - ",
 * " – " or ", " (hyphens inside names have no spaces). Names of several people
 * ("A & B", "A und B") stay as they are.
 */
export function splitNameAndRole(displayName: string): { name: string; role?: string } {
  const clean = displayName.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  const match = clean.match(/^(.+?)(?:\s[-–]\s|,\s)(.+)$/)
  if (!match) return { name: clean }
  const [, name, role] = match
  // Only when the first part looks like a name (2–6 words, no "&").
  const words = name.split(' ')
  if (words.length < 2 || words.length > 6 || /&| und | and /.test(name)) return { name: clean }
  return { name: name.trim(), role: role.replace(/\s[-–]\s/g, ', ').trim() }
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
  const compress = Boolean(options.compressPdfs) && (await hasGhostscript())
  const media = createMediaImporter(payload, userAgent, {
    uploadsDir: (await exists(uploadsDir)) ? uploadsDir : undefined,
    offline: options.offline,
    compressPdf: compress ? (data) => compressPdf(data) : undefined,
    onCompressed: (url, before, after) =>
      report.notes.push(
        `PDF komprimiert: ${path.basename(url)} ${(before / 1e6).toFixed(0)} → ${(after / 1e6).toFixed(0)} MB`,
      ),
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

  const xml = await fs.readFile(
    await findExport(options.dir, 'export.xml', /\.wordpress\..*\.xml$/i),
    'utf8',
  )
  const wxr = parseWxr(xml)
  const attachments = new Map(
    wxr.items.filter((item) => item.type === 'attachment').map((item) => [item.id, item]),
  )
  const allPosts = wxr.items.filter(
    (item) => item.type === 'post' && item.status !== 'trash' && item.status !== 'auto-draft',
  )
  // Drafts that are empty or an old copy of a published article (same title) are left out.
  const normalizeTitle = (title: string) =>
    title
      .replace(/<[^>]+>|&[a-z#0-9]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  const publishedTitles = new Set(
    allPosts.filter((item) => item.status === 'publish').map((item) => normalizeTitle(item.title)),
  )
  const skippedDrafts: string[] = []
  const posts = allPosts.filter((item) => {
    if (item.status === 'publish') return true
    const text = item.content
      .replace(/<[^>]+>|\[[^\]]*\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const reason =
      text.length < 100
        ? 'leer'
        : publishedTitles.has(normalizeTitle(item.title))
          ? 'Kopie eines veröffentlichten Artikels'
          : null
    if (reason) skippedDrafts.push(`${item.title || '(ohne Titel)'} [${item.id}]: ${reason}`)
    return !reason
  })
  const pages = wxr.items.filter((item) => item.type === 'page')
  log(
    `Export: ${posts.length} Artikel, ${pages.length} Seiten, ${attachments.size} Dateien, ${wxr.authors.length} Autoren`,
  )
  for (const draft of skippedDrafts) report.notes.push(`Entwurf nicht übernommen: ${draft}`)

  // 1. Media. By default only files that content uses, imported on demand below.
  //    With allMedia: every file of the library, so all old upload links keep working.
  log(options.allMedia ? 'Medien (alle)' : 'Medien: nur verwendete, beim Import der Inhalte')
  const mediaIds = new Map<number, number>()
  for (const attachment of options.allMedia ? attachments.values() : []) {
    const id = await media.get({
      url: attachment.attachmentUrl,
      alt: attachment.meta._wp_attachment_image_alt || undefined,
      wpId: attachment.id,
    })
    if (id) mediaIds.set(attachment.id, id)
  }
  if (options.allMedia) report.counts.media = { created: mediaIds.size, updated: 0 }

  // 2. Topics
  log('Themen')
  const topicIds = await importTopics(payload, report)

  // 3. People from the authors (dc:creator); details from the public REST API if reachable.
  log('Personen')
  type RestUser = { slug: string; description?: string; avatar?: string }
  // By display name; several accounts may share one (the same person twice).
  const restUsers = new Map<string, RestUser[]>()
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
      for (const user of list) {
        const entries = restUsers.get(user.name) ?? []
        entries.push({
          slug: user.slug,
          description: user.description,
          avatar: user.avatar_urls?.['96'],
        })
        restUsers.set(user.name, entries)
      }
      if (list.length < 100) break
    }
  }
  const personByLogin = new Map<string, { id: number; name: string }>()
  // Group the authors of articles by name: some people had two WordPress accounts
  // (one per interview) and become one person. Technical accounts become no person.
  const groups = new Map<string, typeof wxr.authors>()
  for (const author of wxr.authors) {
    if (!posts.some((post) => post.creator === author.login)) continue
    if (isSystemAccount(author.login) || isSystemAccount(author.displayName)) {
      const count = posts.filter((post) => post.creator === author.login).length
      report.notes.push(
        `Konto „${author.displayName || author.login}“ ist keine Person: ${count} Artikel ohne Interviewpartner, bitte im Admin ergänzen.`,
      )
      continue
    }
    const nameKey = (author.displayName || author.login).trim().toLowerCase()
    groups.set(nameKey, [...(groups.get(nameKey) ?? []), author])
  }
  for (const accounts of groups.values()) {
    const author = accounts[0]
    const { name, role } = splitNameAndRole(author.displayName || author.login)
    const rest = restUsers.get(author.displayName) ?? []
    // The shortest REST slug is the original one ("georges-kern", not "georges-kern-2").
    const slugs = [...new Set(rest.map((user) => user.slug))].sort((a, b) => a.length - b.length)
    const main = rest.find((user) => user.slug === slugs[0])
    const withBio = rest.find((user) => user.description?.trim()) ?? main
    const avatar = rest.find((user) => user.avatar?.includes('/wp-content/uploads/'))?.avatar
    const id = await importPerson(payload, media, report, {
      wpId: author.id,
      name,
      role,
      slug: slugs[0] || slugify(author.login),
      bio: withBio?.description,
      photoUrl: avatar ? originalImageUrl(avatar) : undefined,
      photoFallbackUrl: avatar,
    })
    const person = { id, name }
    for (const account of accounts) personByLogin.set(account.login, person)
    if (accounts.length > 1)
      report.notes.push(`Person „${name}“: ${accounts.length} WordPress-Konten, zusammengeführt.`)
    // Old author pages of the other accounts lead to the merged person.
    for (const oldSlug of slugs.slice(1)) {
      await upsert(
        payload,
        'redirects',
        { field: 'from', value: `/author/${oldSlug}` },
        {
          from: `/author/${oldSlug}`,
          to: { type: 'reference', reference: { relationTo: 'people', value: id } },
          type: '301',
        },
      )
    }
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
  for (const extension of ['json', 'csv']) {
    const file = await findExport(
      options.dir,
      `redirection.${extension}`,
      new RegExp(`^redirection.*\\.${extension}$`, 'i'),
    )
    const fileName = path.basename(file)
    const content = await readOptional(file)
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
  const csv = await readOptional(
    await findExport(options.dir, 'mailpoet.csv', /^mailpoet.*\.csv$/i),
  )
  if (csv) {
    log('Abonnenten')
    const audience = getAudience()
    let skipped = 0
    for (const row of parseCsv(csv)) {
      const email = column(row, 'e-mail', 'email').toLowerCase()
      // German exports have "Listen-Status" (per list) and "Globaler Status" (real state:
      // unconfirmed, bounced, unsubscribed). The global status decides.
      const status = column(row, 'globaler status', 'global status', 'status').toLowerCase()
      if (!email || !['subscribed', 'confirmed', 'abonniert'].includes(status)) {
        skipped++
        continue
      }
      const consent = column(row, 'abonnement-zeit', 'subscribed', 'created', 'angemeldet')
      const confirmation = column(row, 'bestätigungs-zeit', 'confirmed')
      const consentAt = parseLocalDate(consent) ?? parseLocalDate(confirmation)
      if (!consentAt) {
        report.notes.push('MailPoet-Eintrag ohne Anmeldedatum übersprungen.')
        skipped++
        continue
      }
      const confirmedAt = parseLocalDate(confirmation) ?? consentAt
      const result = await audience.createIfMissing({
        email,
        firstName: column(row, 'vorname', 'first') || undefined,
        locale: 'en',
        interests: ['newsletter'],
        source: 'mailpoet-import',
        consentAt,
        confirmedAt,
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
