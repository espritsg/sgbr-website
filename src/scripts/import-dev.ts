/**
 * Dev import: fills the local database from the public SGBR website (read-only)
 * plus test data for features the old site does not have (docs/migration.md).
 *
 *   npm run import:dev            (40 articles)
 *   npm run import:dev -- 200     (number of articles; or IMPORT_LIMIT=200)
 *
 * Can run any number of times, also on an empty database.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  createReport,
  importEvents,
  importIssues,
  importTeam,
  importTopics,
  parseAboutTeam,
  printReport,
  type EventsFeed,
  type IssuesFeed,
} from './lib/importers'
import { createMediaImporter } from './lib/media'
import {
  attachApplicationForm,
  seedForms,
  seedGlobals,
  seedNewsletters,
  seedPages,
  seedSubscribers,
  seedUsers,
} from './lib/seed'
import { fetchWpPosts, importWpPost } from './lib/wpRest'

const SOURCE = process.env.DEV_IMPORT_SOURCE || 'https://stgallenbusinessreview.com'
const USER_AGENT = 'Mozilla/5.0 (compatible; sgbr-dev-import)'

// `payload run` passes only positional arguments, so the limit is a plain number.
function parseArgs() {
  const raw = process.argv.slice(2).find((arg) => /^\d+$/.test(arg)) ?? process.env.IMPORT_LIMIT
  const limit = Number(raw ?? 40)
  return { limit: Number.isFinite(limit) && limit > 0 ? limit : 40 }
}

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

async function main(limit: number) {
  const payload = await getPayload({ config })
  const report = createReport()
  const media = createMediaImporter(payload, USER_AGENT)

  console.log(`Dev-Import von ${SOURCE} (bis zu ${limit} Artikel)`)
  console.log(
    process.env.ANTHROPIC_API_KEY
      ? 'Zusammenfassungen: Claude'
      : 'Zusammenfassungen: erster Absatz (kein ANTHROPIC_API_KEY)',
  )

  console.log('→ Themen')
  const topicIds = await importTopics(payload, report)

  console.log('→ Team (About-Seite)')
  const aboutHtml = await getText(`${SOURCE}/about/`)
  const teamIds = aboutHtml
    ? await importTeam(payload, media, report, parseAboutTeam(aboutHtml, SOURCE))
    : new Map()

  console.log('→ Ausgaben (Feed)')
  const issuesFeed = await getJson<IssuesFeed>('/issues/?sgbr_feed=1')
  const issueIds = await importIssues(payload, media, report, issuesFeed, getText, teamIds)

  console.log('→ Speaker Events (Feed)')
  const eventsFeed = await getJson<EventsFeed>('/category/speaker-events/?sgbr_feed=1')
  await importEvents(payload, media, report, eventsFeed)

  console.log('→ Artikel')
  const categories = await getJson<Array<{ id: number; slug: string }>>(
    '/wp-json/wp/v2/categories?per_page=100',
  )
  const categorySlug = new Map(categories.map((c) => [c.id, c.slug]))
  const posts = await fetchWpPosts(getJson, limit)
  for (const [index, post] of posts.entries()) {
    console.log(`  [${index + 1}/${posts.length}] ${post.slug}`)
    await importWpPost(payload, media, report, { topicIds, issueIds, categorySlug }, getJson, post)
  }

  console.log('→ Formulare, Seiten, Globals')
  const forms = await seedForms(payload)
  await attachApplicationForm(payload, forms.application, report)
  const pagesJson = await getJson<Array<{ slug: string; content: { rendered: string } }>>(
    '/wp-json/wp/v2/pages?per_page=50',
  )
  const pageHtml = (slug: string) =>
    pagesJson.find((page) => page.slug === slug)?.content.rendered ?? null
  await seedPages(
    payload,
    media,
    { aboutHtml, imprintHtml: pageHtml('impressum'), contactHtml: pageHtml('contact') },
    forms.contact,
  )
  await seedGlobals(payload, 'vc-pe-family-offices')

  console.log('→ Testdaten: Newsletter, Abonnenten, Benutzer')
  await seedNewsletters(payload)
  await seedSubscribers(report)
  await seedUsers(payload, report)

  printReport(report, media)
  process.exit(0)
}

// Top-level await: `payload run` exits as soon as the import of this module resolves.
const { limit } = parseArgs()
try {
  await main(limit)
} catch (error) {
  console.error(error)
  process.exit(1)
}
