import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAudience,
  localAudience,
  readLocalAudience,
  resetLocalAudience,
  UNSUBSCRIBE_PLACEHOLDER,
} from '@/lib/newsletter/audience'
import { sealSignup } from '@/lib/newsletter/signupToken'

import { getTestPayload } from '../helpers/payload'

const { sendNewsletter, countRecipients } = await import('@/lib/newsletter/sending')
const { subscribe, confirm } = await import('@/lib/newsletter/subscriptions')
const { newsletterEndpoints } = await import('@/endpoints/newsletter')

let payload: Payload
let sentMails: Array<{ to: string; html: string }> = []

beforeAll(async () => {
  payload = await getTestPayload()
})

beforeEach(() => {
  sentMails = []
  vi.spyOn(payload, 'sendEmail').mockImplementation(async (message) => {
    sentMails.push({ to: String(message.to), html: String(message.html) })
    return {}
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

/** The token from the confirmation link in the last mail to `email`. */
function tokenFromMail(email: string): string {
  const mail = sentMails.filter((item) => item.to === email).at(-1)
  const match = mail?.html.match(/confirm\?token=([A-Za-z0-9_%-]+)/)
  if (!match) throw new Error(`no confirmation mail to ${email}`)
  return decodeURIComponent(match[1])
}

const contact = async (email: string) =>
  (await readLocalAudience()).contacts.find((item) => item.email === email)

describe('double opt-in', () => {
  beforeAll(async () => {
    await resetLocalAudience()
  })

  it('stores nothing before the click, then writes the contact', async () => {
    await subscribe(payload, {
      email: 'Ada@Example.com ',
      locale: 'de',
      source: 'footer',
      interests: ['events'],
    })
    expect(sentMails).toHaveLength(1)
    expect(await contact('ada@example.com')).toBeUndefined()

    const token = tokenFromMail('ada@example.com')
    expect(await confirm(token)).toEqual({ email: 'ada@example.com', locale: 'de' })
    expect(await contact('ada@example.com')).toMatchObject({
      locale: 'de',
      interests: ['events'],
      source: 'footer',
      unsubscribed: false,
    })
    // Opening the link again stays fine and does not duplicate.
    expect(await confirm(token)).toBeTruthy()
    expect((await readLocalAudience()).contacts).toHaveLength(1)
  })

  it('rejects forged and expired links', async () => {
    expect(await confirm('not-a-valid-token-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBeNull()
    const token = sealSignup(
      {
        email: 'late@example.com',
        locale: 'en',
        interests: ['newsletter'],
        source: 'footer',
        consentAt: new Date().toISOString(),
      },
      Date.now() - 8 * 86_400_000,
    )
    expect(await confirm(token)).toBeNull()
    expect(await contact('late@example.com')).toBeUndefined()
  })

  it('a new signup adds interests and never removes earlier ones', async () => {
    await subscribe(payload, {
      email: 'ada@example.com',
      locale: 'de',
      source: 'popup',
      interests: ['newsletter'],
    })
    await confirm(tokenFromMail('ada@example.com'))
    expect((await contact('ada@example.com'))?.interests.sort()).toEqual(['events', 'newsletter'])
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
      { email: 'ada@example.com', consent: true, locale: 'en' },
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
    expect(sentMails.some((mail) => mail.to === 'bot@example.com')).toBe(false)
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

describe('sending as broadcasts', () => {
  let newsletterId: number

  beforeAll(async () => {
    await resetLocalAudience()
    const now = new Date().toISOString()
    for (let i = 0; i < 6; i++) {
      await localAudience.createIfMissing({
        email: `reader${i}@example.org`,
        locale: i % 2 ? 'de' : 'en',
        interests: i < 5 ? ['newsletter'] : ['events'],
        source: 'admin',
        consentAt: now,
        confirmedAt: now,
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

  it('counts contacts per language as an upper bound', async () => {
    expect(await countRecipients()).toEqual({ en: 3, de: 3, total: 6 })
  })

  it('retries after an error without sending anything twice', async () => {
    const audience = getAudience()
    const realSend = audience.sendBroadcast
    let failDe = true
    vi.spyOn(audience, 'sendBroadcast').mockImplementation(async (id) => {
      if (failDe && id.endsWith('-de')) throw new Error('simulated 503')
      return realSend(id)
    })

    await expect(sendNewsletter(payload, newsletterId)).rejects.toThrow(/DE: simulated/)
    let doc = await payload.findByID({ collection: 'newsletters', id: newsletterId })
    expect(doc.status).toBe('failed')
    expect(doc.resend?.broadcastEn).toBeTruthy()
    expect(doc.resend?.broadcastDe).toBeTruthy()
    expect(doc.resend?.lastError).toContain('simulated')

    failDe = false
    const result = await sendNewsletter(payload, newsletterId)
    expect(result.broadcasts).toHaveLength(2)
    doc = await payload.findByID({ collection: 'newsletters', id: newsletterId })
    expect(doc.status).toBe('sent')
    expect(doc.sentAt).toBeTruthy()
    expect(doc.resend?.lastError).toBeFalsy()

    const { broadcasts } = await readLocalAudience()
    // One broadcast per language, each sent once; DE reused the stored draft.
    expect(broadcasts.map((item) => [item.locale, item.state, item.recipients])).toEqual([
      ['en', 'sent', 3],
      ['de', 'sent', 2],
    ])
    expect(broadcasts[0].html).toContain(UNSUBSCRIBE_PLACEHOLDER)

    await expect(sendNewsletter(payload, newsletterId)).rejects.toThrow(/already/)
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
