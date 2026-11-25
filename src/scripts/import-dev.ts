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
  importPerson,
  importPostSafely,
  importTeam,
  importTopics,
  parseAboutTeam,
  printReport,
  type EventsFeed,
  type IssuesFeed,
} from './lib/importers'
import { createMediaImporter, originalImageUrl } from './lib/media'
import {
  attachApplicationForm,
  seedForms,
  seedGlobals,
  seedNewsletters,
  seedPages,
  seedSubscribers,
  seedUsers,
} from './lib/seed'

const SOURCE = process.env.DEV_IMPORT_SOURCE || 'https://stgallenbusinessreview.com'
const USER_AGENT = 'Mozilla/5.0 (compatible; sgbr-dev-import)'

type WpPost = {
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

// `payload run` passes only positional arguments, so the limit is a plain number.
function parseArgs() {
  const raw = process.argv.slice(2).find((arg) => /^\d+$/.test(arg)) ?? process.env.IMPORT_LIMIT
  const limit = Number(raw ?? 40)
  return { limit: Number.isFinite(limit) && limit > 0 ? limit : 40 }
}

async function getJson<T>(path: string): Promise<T> {
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

async function fetchPosts(limit: number): Promise<WpPost[]> {
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
  const posts = await fetchPosts(limit)
  for (const [index, post] of posts.entries()) {
    console.log(`  [${index + 1}/${posts.length}] ${post.slug}`)
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

    await importPostSafely(
      payload,
      media,
      report,
      { topicIds, issueIds },
      {
        wpId: post.id,
        slug: post.slug,
        title: post.title.rendered,
        contentHtml: post.content.rendered,
        publishedAt: `${post.date_gmt}Z`,
        categorySlugs: post.categories
          .map((id) => categorySlug.get(id))
          .filter((s): s is string => Boolean(s)),
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
