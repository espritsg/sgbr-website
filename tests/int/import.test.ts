import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { createReport, importPost, importTopics, type TopicIds } from '@/scripts/lib/importers'
import type { MediaImporter } from '@/scripts/lib/media'

import { getTestPayload } from '../helpers/payload'

let payload: Payload
let topicIds: TopicIds
let imageId: number

/** Media importer that never downloads: always returns one prepared image. */
const fakeMedia = (): MediaImporter => ({ get: async () => imageId, missing: [] })

const html = [
  '<p><strong>Mr. Muster, what drives you?</strong></p>',
  '<p>Curiosity drives me. I have worked in banking for twenty years and still learn something every day.</p>',
  '<figure class="wp-block-image"><a href="x"><img class="wp-image-77" src="https://example.com/wp-content/uploads/2026/01/chart-1024x600.png" alt="Chart"></a></figure>',
  '[vc_row]<p><strong>And what next?</strong></p>[/vc_row]',
  '<p>We will see what the future brings for the industry.</p>',
  '<p><strong>Thank you?</strong></p>',
].join('')

beforeAll(async () => {
  payload = await getTestPayload()
  const report = createReport()
  topicIds = await importTopics(payload, report)
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  )
  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Chart' },
    file: { data: png, mimetype: 'image/png', name: 'chart.png', size: png.length },
  })
  imageId = media.id
})

describe('importPost', () => {
  const input = () => ({
    wpId: 9001,
    slug: 'import-test-article',
    title: 'Max Muster on curiosity',
    contentHtml: html,
    publishedAt: '2026-01-15T08:00:00.000Z',
    categorySlugs: ['leadership', 'the-future-of-finance'],
    personIds: [],
    personNames: ['Max Muster'],
    featuredImage: null,
    inlineImages: new Map([
      [77, { url: 'https://example.com/wp-content/uploads/2026/01/chart.png', alt: 'Chart' }],
    ]),
    status: 'published' as const,
  })

  it('imports text, images, topics and a summary to review', async () => {
    const report = createReport()
    const id = await importPost(
      payload,
      fakeMedia(),
      report,
      { topicIds, issueIds: new Map() },
      input(),
    )
    const post = await payload.findByID({ collection: 'posts', id, depth: 0, locale: 'en' })

    expect(post.type).toBe('interview')
    expect(post.originalLanguage).toBe('en')
    expect(post.summaryNeedsReview).toBe(true)
    expect(post.summary).toContain('Curiosity drives me.')
    expect(post.topics).toEqual(
      expect.arrayContaining([topicIds.get('leadership'), topicIds.get('business')]),
    )
    const nodes = JSON.stringify(post.content)
    expect(nodes).toContain('"type":"upload"')
    expect(nodes).toContain(`"value":${imageId}`)
    expect(nodes).not.toContain('vc_row')
    expect(report.shortcodeArticles).toHaveLength(1)
  })

  it('runs again without duplicates and keeps an edited summary', async () => {
    const existing = await payload.find({ collection: 'posts', where: { wpId: { equals: 9001 } } })
    await payload.update({
      collection: 'posts',
      id: existing.docs[0].id,
      locale: 'en',
      data: { summary: 'Edited by the editorial team.', summaryNeedsReview: false },
    })

    await importPost(
      payload,
      fakeMedia(),
      createReport(),
      { topicIds, issueIds: new Map() },
      input(),
    )

    const after = await payload.find({
      collection: 'posts',
      where: { wpId: { equals: 9001 } },
      locale: 'en',
    })
    expect(after.totalDocs).toBe(1)
    expect(after.docs[0].summary).toBe('Edited by the editorial team.')
    expect(after.docs[0].summaryNeedsReview).toBe(false)
  })
})
