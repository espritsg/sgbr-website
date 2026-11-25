import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { readLocalAudience } from '@/lib/newsletter/audience'
import { runMigration } from '@/scripts/lib/migration'
import { parseWxr } from '@/scripts/lib/wxr'

import { getTestPayload } from '../helpers/payload'

const dir = 'tests/fixtures/wp-export-sample'
let payload: Payload
let firstRun: Awaited<ReturnType<typeof runMigration>>

beforeAll(async () => {
  payload = await getTestPayload()
  firstRun = await runMigration(payload, { dir, offline: true })
}, 120_000)

const findPost = (slug: string, locale: 'en' | 'de' = 'en') =>
  payload
    .find({ collection: 'posts', where: { slug: { equals: slug } }, locale, draft: true, depth: 0 })
    .then((r) => r.docs[0])

describe('WXR parser', () => {
  it('reads authors, items, categories and meta', async () => {
    const fs = await import('fs')
    const wxr = parseWxr(fs.readFileSync(`${dir}/export.xml`, 'utf8'))
    expect(wxr.authors.map((a) => a.login)).toEqual(['ada-muster', 'bo-beispiel'])
    const post = wxr.items.find((item) => item.id === 1)!
    expect(post.title).toBe('Ada Muster on Curiosity &amp; Leadership')
    expect(post.categories.map((c) => c.slug)).toEqual(['business', 'leadership'])
    expect(post.meta._thumbnail_id).toBe('101')
  })
})

describe('final migration with the sample export', () => {
  it('imports articles with images, topics, SEO and language', async () => {
    const post = await findPost('ada-muster-on-curiosity')
    expect(post.title).toBe('Ada Muster on Curiosity & Leadership')
    expect(post._status).toBe('published')
    expect(post.type).toBe('interview')
    expect(post.heroImage).toBeTruthy()
    expect(post.meta?.title).toBe('Ada Muster on Curiosity')
    expect(post.summaryNeedsReview).toBe(true)
    expect(JSON.stringify(post.content)).toContain('"type":"upload"')
    expect(post.interviewees).toHaveLength(1)

    const german = await findPost('ueber-die-zukunft-der-schweiz', 'de')
    expect(german.originalLanguage).toBe('de')
    expect(german.meta?.title ?? null).toBeNull()
    expect(firstRun.report.postsWithoutMainTopic).toContain('ueber-die-zukunft-der-schweiz')
    expect(firstRun.report.shortcodeArticles.join()).toContain('ueber-die-zukunft-der-schweiz')

    expect((await findPost('a-draft'))._status).toBe('draft')
    expect(await findPost('trashed')).toBeUndefined()
  })

  it('keeps legacy paths for old file links', async () => {
    const pdf = await payload.find({
      collection: 'media',
      where: { legacyPath: { equals: '2020/05/Archive-2020.pdf' } },
    })
    expect(pdf.totalDocs).toBe(1)
  })

  it('imports people, team, issues, events and pages', async () => {
    const people = await payload.find({
      collection: 'people',
      where: { slug: { in: ['ada-muster', 'bo-beispiel', 'cleo-sample'] } },
    })
    expect(people.totalDocs).toBe(3)
    expect(
      (
        await payload.find({
          collection: 'team-members',
          where: { name: { equals: 'Dana Example' } },
        })
      ).totalDocs,
    ).toBe(1)
    const issues = await payload.find({
      collection: 'issues',
      where: { slug: { in: ['sample-issue', 'archive-2020'] } },
      depth: 0,
    })
    expect(issues.totalDocs).toBe(2)
    expect(issues.docs.find((i) => i.slug === 'archive-2020')?.pdf).toBeTruthy()
    expect(
      (await payload.find({ collection: 'events', where: { slug: { equals: 'sample-speaker' } } }))
        .totalDocs,
    ).toBe(1)
    const pages = await payload.find({
      collection: 'pages',
      where: { slug: { in: ['about', 'contact', 'imprint', 'privacy'] } },
    })
    expect(pages.totalDocs).toBe(4)
  })

  it('takes only confirmed MailPoet subscribers and plain redirects', async () => {
    const { contacts } = await readLocalAudience()
    const imported = contacts.filter((contact) => contact.source === 'mailpoet-import')
    expect(imported.map((contact) => contact.email)).toEqual(['reader@example.com'])
    expect(imported[0]).toMatchObject({
      locale: 'en',
      interests: ['newsletter'],
      consentAt: '2025-11-01T09:00:00.000Z',
    })
    const redirects = await payload.find({
      collection: 'redirects',
      where: { from: { equals: '/old-campaign/' } },
    })
    expect(redirects.docs[0]?.to?.url).toBe('/newsletter/')
    expect(firstRun.report.notes.join()).toContain('Regex')
  })

  it('can run again without duplicates and keeps edited summaries', async () => {
    const post = await findPost('ada-muster-on-curiosity')
    await payload.update({
      collection: 'posts',
      id: post.id,
      locale: 'en',
      data: { summary: 'Checked by the editors.', summaryNeedsReview: false },
    })
    const countAll = async () =>
      Promise.all(
        (['posts', 'people', 'media', 'issues', 'events', 'redirects', 'topics'] as const).map(
          (c) => payload.count({ collection: c }).then((r) => r.totalDocs),
        ),
      )
    const before = await countAll()
    const contactsBefore = (await readLocalAudience()).contacts.length
    await runMigration(payload, { dir, offline: true })
    expect(await countAll()).toEqual(before)
    expect((await readLocalAudience()).contacts).toHaveLength(contactsBefore)
    expect((await findPost('ada-muster-on-curiosity')).summary).toBe('Checked by the editors.')
  }, 120_000)
})
