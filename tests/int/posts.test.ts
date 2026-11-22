import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/payload'

let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
})

describe('posts', () => {
  it('cannot be published without a main topic', async () => {
    const parent = await payload.create({
      collection: 'topics',
      data: { title: 'Finance & Economics', slug: 'finance-posts-test', _status: 'published' },
    })
    const sub = await payload.create({
      collection: 'topics',
      data: {
        title: 'Banking',
        slug: 'banking-posts-test',
        parent: parent.id,
        _status: 'published',
      },
    })
    const base = {
      type: 'interview' as const,
      title: 'T',
      summary: 'S',
      originalLanguage: 'en' as const,
      _status: 'published' as const,
    }

    await expect(
      payload.create({
        collection: 'posts',
        data: { ...base, slug: 'no-main-topic', topics: [sub.id] },
      }),
    ).rejects.toThrow()

    const ok = await payload.create({
      collection: 'posts',
      data: { ...base, slug: 'with-main-topic', topics: [sub.id, parent.id] },
    })
    expect(ok.publishedAt).toBeTruthy()
  })

  it('may be saved as draft without topics and summary', async () => {
    const draft = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: 'Just a draft',
        slug: 'just-a-draft',
        originalLanguage: 'de',
        _status: 'draft',
      } as never,
    })
    expect(draft._status).toBe('draft')
  })

  it('falls back to the original language', async () => {
    const doc = await payload.create({
      collection: 'posts',
      locale: 'de',
      data: {
        title: 'Deutscher Titel',
        slug: 'nur-deutsch',
        summary: 'Zusammenfassung.',
        originalLanguage: 'de',
        _status: 'draft',
      },
      draft: true,
    })
    const inEnglish = await payload.findByID({
      collection: 'posts',
      id: doc.id,
      locale: 'en',
      draft: true,
    })
    expect(inEnglish.title).toBe('Deutscher Titel')
  })

  it('generates a slug from the title', async () => {
    const doc = await payload.create({
      collection: 'people',
      data: { name: 'Dr. Theodor Weimer', _status: 'published' } as never,
    })
    expect(doc.slug).toBe('dr-theodor-weimer')
  })
})
