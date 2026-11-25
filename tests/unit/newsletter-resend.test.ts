import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AudienceError, resendAudience, resendIds } from '@/lib/newsletter/audience'
import { openSignup, sealSignup } from '@/lib/newsletter/signupToken'

type Call = { method: string; path: string; body: unknown }

/** Stubs fetch for api.resend.com; `routes` answers by "METHOD path". */
function stubResend(routes: Record<string, { status?: number; body: unknown }>) {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const { pathname, search } = new URL(url)
      const method = init.method ?? 'GET'
      calls.push({
        method,
        path: pathname + search,
        body: init.body ? JSON.parse(String(init.body)) : null,
      })
      const route = routes[`${method} ${pathname}`] ?? { body: { object: 'ok', id: 'x' } }
      return new Response(JSON.stringify(route.body), {
        status: route.status ?? 200,
        headers: { 'content-type': 'application/json' },
      })
    }),
  )
  return calls
}

const contact = {
  email: 'ada@example.org',
  firstName: 'Ada',
  locale: 'de' as const,
  interests: ['newsletter' as const],
  source: 'footer',
  consentAt: '2026-11-25T10:00:00.000Z',
  confirmedAt: '2026-11-25T10:05:00.000Z',
}

describe('Resend audience', () => {
  beforeEach(() => {
    process.env.RESEND_SEGMENT_EN = 'seg-en'
    process.env.RESEND_SEGMENT_DE = 'seg-de'
    process.env.RESEND_TOPIC_NEWSLETTER = 'topic-news'
    process.env.RESEND_TOPIC_EVENTS = 'topic-events'
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    for (const name of [
      'RESEND_SEGMENT_EN',
      'RESEND_SEGMENT_DE',
      'RESEND_TOPIC_NEWSLETTER',
      'RESEND_TOPIC_EVENTS',
    ])
      delete process.env[name]
  })

  it('names the missing IDs', () => {
    delete process.env.RESEND_TOPIC_EVENTS
    expect(() => resendIds()).toThrow(AudienceError)
    expect(() => resendIds()).toThrow(/RESEND_TOPIC_EVENTS/)
  })

  it('creates a new contact with language segment, topics and consent fields', async () => {
    const calls = stubResend({
      'GET /contacts/ada@example.org': {
        status: 404,
        body: { name: 'not_found', message: 'Contact not found', statusCode: 404 },
      },
    })
    expect(await resendAudience('re_test').upsertContact(contact)).toBe('created')
    const create = calls.find((call) => call.method === 'POST' && call.path === '/contacts')
    expect(create?.body).toMatchObject({
      email: 'ada@example.org',
      first_name: 'Ada',
      unsubscribed: false,
      properties: {
        locale: 'de',
        source: 'footer',
        consent_at: '2026-11-25T10:00:00.000Z',
        confirmed_at: '2026-11-25T10:05:00.000Z',
      },
      segments: [{ id: 'seg-de' }],
      topics: [{ id: 'topic-news', subscription: 'opt_in' }],
    })
  })

  it('re-subscribes a known contact and moves it to the new language', async () => {
    const calls = stubResend({
      'GET /contacts/ada@example.org': {
        body: { object: 'contact', id: 'c1', email: 'ada@example.org', unsubscribed: true },
      },
      'GET /contacts/ada@example.org/segments': {
        body: { object: 'list', data: [{ id: 'seg-en', name: 'SGBR – English' }], has_more: false },
      },
    })
    expect(await resendAudience('re_test').upsertContact(contact)).toBe('updated')
    const summary = calls.map((call) => `${call.method} ${call.path}`)
    expect(summary).toContain('PATCH /contacts/ada@example.org')
    expect(summary).toContain('POST /contacts/ada@example.org/segments/seg-de')
    expect(summary).toContain('DELETE /contacts/ada@example.org/segments/seg-en')
    expect(
      calls.find((call) => call.method === 'PATCH' && call.path.includes('/contacts/ada'))?.body,
    ).toMatchObject({ unsubscribed: false })
    expect(calls.find((call) => call.path.endsWith('/topics'))?.body).toEqual([
      { id: 'topic-news', subscription: 'opt_in' },
    ])
  })

  it('migration does not touch existing contacts', async () => {
    const calls = stubResend({
      'GET /contacts/ada@example.org': { body: { object: 'contact', id: 'c1' } },
    })
    expect(await resendAudience('re_test').createIfMissing(contact)).toBe('exists')
    expect(calls.filter((call) => call.method !== 'GET')).toHaveLength(0)
  })

  it('creates the broadcast as draft for segment and topic', async () => {
    const calls = stubResend({ 'POST /broadcasts': { body: { id: 'b-1' } } })
    const id = await resendAudience('re_test').createBroadcast({
      name: 'December (EN)',
      locale: 'en',
      audience: 'events',
      subject: 'Hello',
      previewText: 'Preview',
      html: '<p>x</p>',
      text: 'x',
    })
    expect(id).toBe('b-1')
    expect(calls[0].body).toMatchObject({
      segment_id: 'seg-en',
      topic_id: 'topic-events',
      subject: 'Hello',
      preview_text: 'Preview',
    })
    expect((calls[0].body as { send?: boolean }).send).not.toBe(true)
  })

  it('counts contacts over all pages, without unsubscribed ones', async () => {
    let page = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        page++
        const data =
          page === 1
            ? [
                { id: 'a', unsubscribed: false },
                { id: 'b', unsubscribed: true },
              ]
            : [{ id: 'c', unsubscribed: false }]
        return new Response(JSON.stringify({ object: 'list', data, has_more: page === 1 }), {
          headers: { 'content-type': 'application/json' },
        })
      }),
    )
    expect(await resendAudience('re_test').countContacts('en')).toBe(2)
    expect(page).toBe(2)
  })
})

describe('signup token', () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = 'unit-test-secret'
  })

  const data = {
    email: 'ada@example.org',
    locale: 'en' as const,
    interests: ['newsletter' as const],
    source: 'footer',
    consentAt: '2026-11-25T10:00:00.000Z',
  }

  it('round-trips and hides the address', () => {
    const token = sealSignup(data)
    expect(token).not.toContain('ada')
    expect(openSignup(token)).toEqual(data)
  })

  it('rejects changed, expired and foreign tokens', () => {
    const token = sealSignup(data)
    const changed = token.slice(0, -2) + (token.endsWith('A') ? 'BB' : 'AA')
    expect(openSignup(changed)).toBeNull()
    expect(openSignup(sealSignup(data, Date.now() - 8 * 86_400_000))).toBeNull()
    process.env.PAYLOAD_SECRET = 'other-secret'
    expect(openSignup(token)).toBeNull()
    expect(openSignup(undefined)).toBeNull()
  })
})
