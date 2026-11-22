/**
 * Contract test for the feeds read by espritsg.ch (docs/esprit-feed.md).
 * The structure must stay exactly like the old WordPress feeds in tests/fixtures/esprit-feed.
 */
import fs from 'fs'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { buildEventsFeed, buildIssuesFeed, encodeLikeWordPress } from '@/lib/feeds/esprit'

import { getTestPayload } from '../helpers/payload'

const fixture = (name: string) =>
  JSON.parse(fs.readFileSync(`tests/fixtures/esprit-feed/${name}`, 'utf8'))
const eventsFixture = fixture('sgbr-feed-events-2026-11-22.json')
const issuesFixture = fixture('sgbr-feed-issues-2026-11-22.json')

const typeShape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.length ? [typeShape(value[0])] : []
  if (value && typeof value === 'object')
    return Object.entries(value).map(([key, inner]) => [key, typeShape(inner)])
  return typeof value
}

let payload: Payload
const originalUrl = process.env.NEXT_PUBLIC_SERVER_URL

beforeAll(async () => {
  payload = await getTestPayload()
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://stgallenbusinessreview.com'
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  )
  const logo = await payload.create({
    collection: 'media',
    data: { alt: 'Logo' },
    file: { data: png, mimetype: 'image/png', name: 'logo-feed.png', size: png.length },
  })
  const pdf = fs.readFileSync('tests/fixtures/sample-cv.pdf')
  const pdfMedia = await payload.create({
    collection: 'media',
    data: {},
    file: { data: pdf, mimetype: 'application/pdf', name: 'Rising-2024.pdf', size: pdf.length },
  })
  const speaker = await payload.create({
    collection: 'people',
    data: {
      name: 'Dr. Feed Speaker',
      slug: 'feed-speaker',
      role: 'CEO',
      organization: 'Feed AG',
      organizationLogo: logo.id,
      _status: 'published',
    },
  })
  const event = (slug: string, startsAt: string, status: 'published' | 'draft' = 'published') =>
    payload.create({
      collection: 'events',
      draft: status === 'draft',
      data: {
        slug,
        speaker: speaker.id,
        startsAt,
        language: 'de',
        location: 'HSG',
        _status: status,
      },
    })
  await event('feed-upcoming', '2099-10-15T17:00:00.000Z')
  await event('feed-past', '2020-10-15T17:00:00.000Z')
  await event('feed-draft', '2099-11-15T17:00:00.000Z', 'draft')
  await payload.create({
    collection: 'issues',
    data: {
      slug: 'feed-digital',
      title: 'Feed Digital',
      tagline: 'Who owns it?',
      year: 2099,
      format: 'digital',
      _status: 'published',
    },
  })
  await payload.create({
    collection: 'issues',
    data: {
      slug: 'feed-pdf',
      title: 'Rising',
      year: 2024,
      format: 'pdf',
      pdf: pdfMedia.id,
      _status: 'published',
    },
  })
})

afterAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = originalUrl
})

describe('events feed', () => {
  it('has exactly the structure, key order and types of the old feed', async () => {
    const feed = await buildEventsFeed(payload)
    expect(Object.keys(feed)).toEqual(Object.keys(eventsFixture))
    expect(typeShape(feed)).toEqual(typeShape(eventsFixture))
    for (const item of feed.events)
      expect(Object.keys(item)).toEqual(Object.keys(eventsFixture.events[0]))
  })

  it('uses the old formats and computes the status from the date', async () => {
    const feed = await buildEventsFeed(payload, new Date('2026-11-22T17:18:10Z'))
    expect(feed.generated_at).toBe('2026-11-22T17:18:10+00:00')
    const upcoming = feed.events.find((item) => item.id === 'feed-upcoming')!
    const past = feed.events.find((item) => item.id === 'feed-past')!
    expect(upcoming).toMatchObject({
      status: 'upcoming',
      date: '15 October 2099',
      time: '19:00',
      language: 'German',
      name: 'Dr. Feed Speaker',
      role: 'CEO',
      company: 'Feed AG',
    })
    expect(past.status).toBe('past')
    expect(upcoming.url).toBe('https://stgallenbusinessreview.com/en/events/feed-upcoming')
    expect(upcoming.logo_url).toMatch(
      /^https:\/\/stgallenbusinessreview\.com\/files\/logo-feed.*\.png$/,
    )
  })

  it('sorts by date ascending and leaves out drafts', async () => {
    const feed = await buildEventsFeed(payload)
    const ids = feed.events.map((item) => item.id)
    expect(ids).not.toContain('feed-draft')
    expect(ids.indexOf('feed-past')).toBeLessThan(ids.indexOf('feed-upcoming'))
  })
})

describe('issues feed', () => {
  it('has exactly the structure, key order and types of the old feed', async () => {
    const feed = await buildIssuesFeed(payload)
    expect(Object.keys(feed)).toEqual(Object.keys(issuesFixture))
    expect(typeShape(feed)).toEqual(typeShape(issuesFixture))
    for (const item of [...feed.digital, ...feed.archive])
      expect(Object.keys(item)).toEqual(Object.keys(issuesFixture.digital[0]))
  })

  it('fills values like the old feed: strings, empty string when missing, absolute https URLs', async () => {
    const feed = await buildIssuesFeed(payload)
    const digital = feed.digital.find((item) => item.title === 'Feed Digital')!
    expect(digital).toEqual({
      kind: 'digital',
      year: '2099',
      title: 'Feed Digital',
      description: 'Who owns it?',
      url: 'https://stgallenbusinessreview.com/en/issues/feed-digital',
      cover_url: '',
    })
    const pdf = feed.archive.find((item) => item.title === 'Rising')!
    expect(pdf.kind).toBe('pdf')
    expect(pdf.url).toMatch(/^https:\/\/stgallenbusinessreview\.com\/files\/Rising-2024.*\.pdf$/)
    const years = feed.digital.map((item) => Number(item.year))
    expect(years).toEqual([...years].sort((a, b) => b - a))
  })
})

describe('encoding', () => {
  it('escapes slashes like PHP json_encode and stays valid JSON', () => {
    const encoded = encodeLikeWordPress({ url: 'https://a.ch/x', name: 'Rühmkorf' })
    expect(encoded).toBe('{"url":"https:\\/\\/a.ch\\/x","name":"Rühmkorf"}')
    expect(JSON.parse(encoded)).toEqual({ url: 'https://a.ch/x', name: 'Rühmkorf' })
  })
})
