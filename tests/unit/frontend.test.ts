import { describe, expect, it } from 'vitest'

import { embedSrc } from '@/components/richtext/Embed'
import { applicationState, isPastEvent } from '@/lib/events'
import { fileUrl, imageSrc } from '@/lib/media'
import { bylineFor } from '@/lib/posts'
import { documentPath } from '@/lib/preview'
import { buildMetadata } from '@/lib/seo'
import type { Media, Post } from '@/payload-types'

const media = (data: Partial<Media>) =>
  ({ id: 1, filename: 'a.jpg', updatedAt: '', createdAt: '', ...data }) as Media

describe('applicationState', () => {
  const base = { applicationForm: 1, startsAt: '2026-12-10T18:00:00.000Z' }
  const now = new Date('2026-12-01T10:00:00.000Z')

  it('is none without a form', () => {
    expect(applicationState({ ...base, applicationForm: null }, now)).toEqual({ state: 'none' })
  })
  it('is open between opening and deadline', () => {
    expect(
      applicationState(
        {
          ...base,
          applicationOpensAt: '2026-11-20T00:00:00.000Z',
          applicationDeadline: '2026-12-05T00:00:00.000Z',
        },
        now,
      ).state,
    ).toBe('open')
  })
  it('is not yet open before the opening date', () => {
    expect(
      applicationState({ ...base, applicationOpensAt: '2026-12-02T00:00:00.000Z' }, now).state,
    ).toBe('notYetOpen')
  })
  it('is closed after the deadline, or after the event without deadline', () => {
    expect(
      applicationState({ ...base, applicationDeadline: '2026-11-30T00:00:00.000Z' }, now).state,
    ).toBe('closed')
    expect(applicationState(base, new Date('2026-12-11T00:00:00.000Z')).state).toBe('closed')
  })
})

describe('media URLs', () => {
  it('uses the stable /files/ URL for downloads', () => {
    expect(fileUrl(media({ filename: 'Rising 2024.pdf' }))).toBe('/files/Rising%202024.pdf')
    expect(fileUrl(media({ filename: 'x.pdf' }), true)).toBe('http://localhost:3000/files/x.pdf')
    expect(fileUrl(5)).toBeNull()
  })
  it('makes local image URLs relative and keeps storage URLs', () => {
    expect(imageSrc(media({ url: 'http://localhost:3000/api/media/file/a.jpg' }))).toBe(
      '/api/media/file/a.jpg',
    )
    expect(imageSrc(media({ url: 'https://pub-abc.r2.dev/a.jpg' }))).toBe(
      'https://pub-abc.r2.dev/a.jpg',
    )
    expect(imageSrc(media({ url: '/x.jpg', sizes: { card: { url: '/x-800.jpg' } } }), 'card')).toBe(
      '/x-800.jpg',
    )
  })
})

describe('embeds', () => {
  it('uses privacy-friendly players', () => {
    expect(embedSrc('https://www.youtube.com/watch?v=abc')).toBe(
      'https://www.youtube-nocookie.com/embed/abc',
    )
    expect(embedSrc('https://youtu.be/abc')).toBe('https://www.youtube-nocookie.com/embed/abc')
    expect(embedSrc('https://open.spotify.com/episode/123')).toBe(
      'https://open.spotify.com/embed/episode/123',
    )
    expect(embedSrc('https://example.com')).toBeNull()
  })
})

describe('byline', () => {
  const t = (key: string, values?: Record<string, string>) => `${key}:${values?.names}`
  const person = { id: 1, name: 'Ada Muster', slug: 'ada', updatedAt: '', createdAt: '' }
  it('says "Interview with" for interviews and "By" for guest articles', () => {
    expect(
      bylineFor(
        { type: 'interview', interviewees: [person] } as Pick<Post, 'type' | 'interviewees'>,
        t,
        'en',
      ),
    ).toBe('interviewWith:Ada Muster')
    expect(
      bylineFor(
        { type: 'guest-article', interviewees: [person] } as Pick<Post, 'type' | 'interviewees'>,
        t,
        'en',
      ),
    ).toBe('by:Ada Muster')
    expect(bylineFor({ type: 'interview', interviewees: [] }, t, 'en')).toBeNull()
  })
})

describe('SEO and preview paths', () => {
  it('points the canonical URL to the original language', () => {
    const metadata = buildMetadata({
      locale: 'en',
      path: '/article/x',
      title: 'X',
      canonicalLocale: 'de',
    })
    expect(metadata.alternates?.canonical).toBe('http://localhost:3000/de/article/x')
    expect(metadata.alternates?.languages).toEqual({ de: 'http://localhost:3000/de/article/x' })
  })
  it('lists both languages for normal pages', () => {
    const metadata = buildMetadata({ locale: 'de', path: '/issues', title: 'Ausgaben' })
    expect(metadata.alternates?.canonical).toBe('http://localhost:3000/de/issues')
    expect(Object.keys(metadata.alternates?.languages ?? {})).toEqual(['en', 'de'])
  })
  it('builds website paths for documents', () => {
    expect(documentPath('posts', 'a', 'de')).toBe('/de/article/a')
    expect(documentPath('pages', 'about', 'en')).toBe('/en/about')
    expect(documentPath('topics', 'x', 'en')).toBeNull()
  })
})

describe('isPastEvent', () => {
  const now = new Date('2026-11-24T12:00:00Z')
  it('counts started events as past', () => {
    expect(isPastEvent({ startsAt: '2026-11-23T16:00:00Z' }, now)).toBe(true)
    expect(isPastEvent({ startsAt: '2026-11-24T12:00:00Z' }, now)).toBe(true)
  })
  it('keeps later events upcoming', () => {
    expect(isPastEvent({ startsAt: '2026-12-15T14:30:00Z' }, now)).toBe(false)
  })
})
