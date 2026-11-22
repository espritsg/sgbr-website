import crypto from 'crypto'
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTestPayload } from '../helpers/payload'

// Record every batch instead of sending; tests can make a batch fail.
const sentBatches: Array<{ key: string; to: string[] }> = []
let failOnBatchKey: string | null = null
vi.mock('@/lib/email/batch', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/email/batch')>()
  return {
    ...original,
    sendNewsletterBatch: vi.fn(
      async (mails: Array<{ to: string; headers?: Record<string, string> }>, key: string) => {
        if (key === failOnBatchKey) return { ok: false, error: 'simulated 503', retryable: true }
        sentBatches.push({ key, to: mails.map((mail) => mail.to) })
        expect(mails[0].headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
        return { ok: true, ids: mails.map((_, index) => `msg-${key}-${index}`) }
      },
    ),
  }
})

const { processNewsletter, startSending, countRecipients } =
  await import('@/lib/newsletter/sending')
const { subscribe, confirm, unsubscribe, updatePreferences, purgeUnconfirmed, findByToken } =
  await import('@/lib/newsletter/subscriptions')
const { newsletterEndpoints } = await import('@/endpoints/newsletter')

let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
})

beforeEach(() => {
  sentBatches.length = 0
  failOnBatchKey = null
})

async function getSubscriber(email: string) {
  const result = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    showHiddenFields: true,
  })
  return result.docs[0]
}

describe('double opt-in', () => {
  it('creates a pending subscriber and confirms with the token', async () => {
    expect(
      await subscribe(payload, {
        email: 'Ada@Example.com ',
        locale: 'de',
        source: 'footer',
        interests: ['events'],
      }),
    ).toBe('created')
    const pending = await getSubscriber('ada@example.com')
    expect(pending.status).toBe('pending')
    expect(pending.locale).toBe('de')
    expect(pending.interests).toEqual(['events'])
    expect(pending.consentAt).toBeTruthy()

    const confirmed = await confirm(payload, pending.confirmToken)
    expect(confirmed?.status).toBe('confirmed')
    // Opening the link again stays fine.
    expect((await confirm(payload, pending.confirmToken))?.status).toBe('confirmed')
    expect(await confirm(payload, 'not-a-valid-token-xxxxxxxx')).toBeNull()
  })

  it('does not reveal known addresses and does not change confirmed ones', async () => {
    expect(
      await subscribe(payload, { email: 'ada@example.com', locale: 'en', source: 'popup' }),
    ).toBe('unchanged')
    expect((await getSubscriber('ada@example.com')).locale).toBe('de')
    await subscribe(payload, { email: 'bo@example.com', locale: 'en', source: 'footer' })
    const firstToken = (await getSubscriber('bo@example.com')).confirmToken
    expect(
      await subscribe(payload, { email: 'bo@example.com', locale: 'en', source: 'footer' }),
    ).toBe('resent')
    expect((await getSubscriber('bo@example.com')).confirmToken).not.toBe(firstToken)
  })

  it('changes interests and unsubscribes without deleting', async () => {
    const ada = await getSubscriber('ada@example.com')
    expect(
      (await updatePreferences(payload, ada.preferencesToken, ['newsletter', 'events']))?.interests,
    ).toEqual(['newsletter', 'events'])
    expect(await unsubscribe(payload, ada.preferencesToken)).toBe(true)
    const after = await getSubscriber('ada@example.com')
    expect(after.status).toBe('unsubscribed')
    expect(after.unsubscribedAt).toBeTruthy()
    expect(await findByToken(payload, 'preferencesToken', ada.preferencesToken)).toBeTruthy()
  })

  it('deletes unconfirmed signups after 7 days', async () => {
    await subscribe(payload, { email: 'old@example.com', locale: 'en', source: 'footer' })
    const old = await getSubscriber('old@example.com')
    await payload.update({
      collection: 'subscribers',
      id: old.id,
      data: { consentAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
    })
    expect(await purgeUnconfirmed(payload)).toBeGreaterThanOrEqual(1)
    expect(await getSubscriber('old@example.com')).toBeUndefined()
    expect(await getSubscriber('bo@example.com')).toBeTruthy()
  })
})

describe('signup endpoint', () => {
  const endpoint = newsletterEndpoints.find((e) => e.path === '/newsletter/subscribe')!
  const call = (body: unknown, ip = '203.0.113.7') =>
    endpoint.handler({
      payload,
      headers: new Headers({ 'x-real-ip': ip }),
      json: async () => body,
    } as never) as Promise<Response>

  it('answers the same for new and known addresses and ignores bots', async () => {
    const known = await call(
      { email: 'bo@example.com', consent: true, locale: 'en' },
      '203.0.113.1',
    )
    const fresh = await call(
      { email: 'new@example.com', consent: true, locale: 'en' },
      '203.0.113.2',
    )
    expect(known.status).toBe(200)
    expect(await known.json()).toEqual(await fresh.json())
    const bot = await call(
      { email: 'bot@example.com', consent: true, website: 'spam' },
      '203.0.113.3',
    )
    expect(bot.status).toBe(200)
    expect(await getSubscriber('bot@example.com')).toBeUndefined()
    expect((await call({ email: 'x@example.com', consent: false }, '203.0.113.4')).status).toBe(400)
  })

  it('limits requests per IP', async () => {
    const statuses = []
    for (let i = 0; i < 12; i++)
      statuses.push(
        (await call({ email: `rl${i}@example.com`, consent: true }, '198.51.100.9')).status,
      )
    expect(statuses.slice(0, 10).every((status) => status === 200)).toBe(true)
    expect(statuses.at(-1)).toBe(429)
  })
})

describe('sending', () => {
  let newsletterId: number

  beforeAll(async () => {
    const now = new Date().toISOString()
    for (let i = 0; i < 205; i++) {
      await payload.create({
        collection: 'subscribers',
        data: {
          email: `reader${i}@example.org`,
          locale: i % 2 ? 'de' : 'en',
          interests: i < 200 ? ['newsletter'] : ['events'],
          status: 'confirmed',
          consentAt: now,
          preferencesToken: crypto.randomBytes(24).toString('base64url'),
        },
      })
    }
    const newsletter = await payload.create({
      collection: 'newsletters',
      data: {
        title: 'December',
        subject: 'SGBR December',
        slug: 'december-test',
        audience: 'newsletter',
        status: 'draft',
      },
    })
    newsletterId = newsletter.id
  })

  it('counts only confirmed subscribers with the matching interest', async () => {
    expect(await countRecipients(payload, 'newsletter')).toBe(200)
  })

  it('resumes after an interrupted batch without sending anything twice', async () => {
    const { recipients, batches } = await startSending(payload, newsletterId)
    expect(recipients).toBe(200)
    expect(batches).toBe(2)
    await expect(startSending(payload, newsletterId)).rejects.toThrow(/already/)

    failOnBatchKey = `newsletter-${newsletterId}-batch-1`
    expect(await processNewsletter(payload, newsletterId)).toBe(false)
    let doc = await payload.findByID({ collection: 'newsletters', id: newsletterId })
    expect(doc.status).toBe('sending')
    expect(doc.progress?.sentBatches).toBe(1)
    expect(doc.progress?.lastError).toContain('simulated')

    failOnBatchKey = null
    expect(await processNewsletter(payload, newsletterId)).toBe(true)
    doc = await payload.findByID({ collection: 'newsletters', id: newsletterId })
    expect(doc.status).toBe('sent')
    expect(doc.sentAt).toBeTruthy()

    const all = sentBatches.flatMap((batch) => batch.to)
    expect(all).toHaveLength(200)
    expect(new Set(all).size).toBe(200)
    expect(sentBatches.map((batch) => batch.key)).toEqual([
      `newsletter-${newsletterId}-batch-0`,
      `newsletter-${newsletterId}-batch-1`,
    ])
  })

  it('shows the newsletter in the archive only after the delay', async () => {
    const visible = async () =>
      (
        await payload.find({
          collection: 'newsletters',
          overrideAccess: false,
          where: { id: { equals: newsletterId } },
        })
      ).totalDocs
    expect(await visible()).toBe(0)
    await payload.update({
      collection: 'newsletters',
      id: newsletterId,
      data: { archiveDelayDays: 0 },
    })
    expect(await visible()).toBe(1)
    await payload.update({
      collection: 'newsletters',
      id: newsletterId,
      data: { showInArchive: false },
    })
    expect(await visible()).toBe(0)
  })
})

describe('Resend webhook', () => {
  const endpoint = newsletterEndpoints.find((e) => e.path === '/newsletter/webhook')!
  const secretBytes = crypto.randomBytes(24)
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${secretBytes.toString('base64')}`

  const call = (body: string, signature: string) => {
    const id = 'msg_1'
    const timestamp = String(Math.floor(Date.now() / 1000))
    const valid = crypto
      .createHmac('sha256', secretBytes)
      .update(`${id}.${timestamp}.${body}`)
      .digest('base64')
    return endpoint.handler({
      payload,
      headers: new Headers({
        'svix-id': id,
        'svix-timestamp': timestamp,
        'svix-signature': `v1,${signature || valid}`,
      }),
      text: async () => body,
    } as never) as Promise<Response>
  }

  it('rejects wrong signatures', async () => {
    const response = await call(
      JSON.stringify({ type: 'email.bounced', data: { to: ['reader1@example.org'] } }),
      'invalid',
    )
    expect(response.status).toBe(401)
  })

  it('marks bounced addresses', async () => {
    const response = await call(
      JSON.stringify({ type: 'email.bounced', data: { to: ['reader1@example.org'] } }),
      '',
    )
    expect(response.status).toBe(200)
    expect((await getSubscriber('reader1@example.org')).status).toBe('bounced')
  })
})
