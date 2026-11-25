/**
 * Where newsletter subscribers live (ADR 0021): Resend is the only source.
 * - Contacts with properties locale, source, consent_at, confirmed_at
 * - one segment per language (RESEND_SEGMENT_EN, RESEND_SEGMENT_DE)
 * - one topic per interest (RESEND_TOPIC_NEWSLETTER, RESEND_TOPIC_EVENTS)
 * Unsubscribing, preferences, bounces and spam reports are handled by Resend.
 *
 * Without RESEND_API_KEY (local development, tests) a JSON file next to the mail
 * preview stands in for Resend (ADR 0007). It never talks to the network.
 */
import fs from 'fs/promises'
import path from 'path'
import { Resend } from 'resend'

import { emailConfig } from '@/lib/email/config'
import { PREVIEW_DIR, writePreview } from '@/lib/email/preview'

export type Interest = 'newsletter' | 'events'
export type Locale = 'en' | 'de'
export const LOCALES: Locale[] = ['en', 'de']

export type ContactInput = {
  email: string
  firstName?: string
  locale: Locale
  interests: Interest[]
  source: string
  consentAt: string
  confirmedAt: string
}

export type BroadcastInput = {
  name: string
  locale: Locale
  audience: Interest
  subject: string
  previewText?: string
  html: string
  text: string
}

export type BroadcastState = 'draft' | 'queued' | 'sent' | 'missing'

export interface Audience {
  /** New signup confirmed: create or update the contact and opt in to the chosen topics. */
  upsertContact(input: ContactInput): Promise<'created' | 'updated'>
  /** Migration: only create, never touch an existing contact (it may have unsubscribed). */
  createIfMissing(input: ContactInput): Promise<'created' | 'exists'>
  /** Contacts per language that are not unsubscribed (upper bound for a topic). */
  countContacts(locale: Locale): Promise<number>
  /** Creates a broadcast as draft; sending is a separate step (see sending.ts). */
  createBroadcast(input: BroadcastInput): Promise<string>
  sendBroadcast(id: string): Promise<void>
  broadcastState(id: string): Promise<BroadcastState>
}

/** Placeholder Resend replaces with a personal link to its unsubscribe/preferences page. */
export const UNSUBSCRIBE_PLACEHOLDER = '{{{RESEND_UNSUBSCRIBE_URL}}}'

export class AudienceError extends Error {}

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

export function resendIds() {
  const ids = {
    segments: { en: process.env.RESEND_SEGMENT_EN || '', de: process.env.RESEND_SEGMENT_DE || '' },
    topics: {
      newsletter: process.env.RESEND_TOPIC_NEWSLETTER || '',
      events: process.env.RESEND_TOPIC_EVENTS || '',
    },
  }
  const missing = [
    ['RESEND_SEGMENT_EN', ids.segments.en],
    ['RESEND_SEGMENT_DE', ids.segments.de],
    ['RESEND_TOPIC_NEWSLETTER', ids.topics.newsletter],
    ['RESEND_TOPIC_EVENTS', ids.topics.events],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)
  if (missing.length)
    throw new AudienceError(
      `Resend ist nicht vollständig eingerichtet, es fehlt: ${missing.join(', ')} (npm run resend:setup).`,
    )
  return ids
}

function unwrap<T>(result: { data: T | null; error: { name: string; message: string } | null }): T {
  if (result.error) throw new AudienceError(`Resend ${result.error.name}: ${result.error.message}`)
  return result.data as T
}

function properties(input: ContactInput) {
  return {
    locale: input.locale,
    source: input.source,
    consent_at: input.consentAt,
    confirmed_at: input.confirmedAt,
  }
}

export function resendAudience(apiKey: string): Audience {
  const client = new Resend(apiKey)

  async function exists(email: string): Promise<boolean> {
    const result = await client.contacts.get({ email })
    if (result.error?.name === 'not_found') return false
    unwrap(result)
    return true
  }

  async function create(input: ContactInput) {
    const ids = resendIds()
    unwrap(
      await client.contacts.create({
        email: input.email,
        firstName: input.firstName,
        unsubscribed: false,
        properties: properties(input),
        segments: [{ id: ids.segments[input.locale] }],
        topics: input.interests.map((interest) => ({
          id: ids.topics[interest],
          subscription: 'opt_in' as const,
        })),
      }),
    )
  }

  return {
    async upsertContact(input) {
      const ids = resendIds()
      if (!(await exists(input.email))) {
        await create(input)
        return 'created'
      }
      unwrap(
        await client.contacts.update({
          email: input.email,
          unsubscribed: false,
          ...(input.firstName ? { firstName: input.firstName } : {}),
          properties: properties(input),
        }),
      )
      // Language segment: in the new one, out of the other (it may have changed).
      const other: Locale = input.locale === 'en' ? 'de' : 'en'
      const current = unwrap(
        await client.contacts.segments.list({ email: input.email, limit: 100 }),
      ).data.map((segment) => segment.id)
      if (!current.includes(ids.segments[input.locale]))
        unwrap(
          await client.contacts.segments.add({
            email: input.email,
            segmentId: ids.segments[input.locale],
          }),
        )
      if (current.includes(ids.segments[other]))
        unwrap(
          await client.contacts.segments.remove({
            email: input.email,
            segmentId: ids.segments[other],
          }),
        )
      // A new signup adds interests; it never removes ones chosen earlier.
      unwrap(
        await client.contacts.topics.update({
          email: input.email,
          topics: input.interests.map((interest) => ({
            id: ids.topics[interest],
            subscription: 'opt_in' as const,
          })),
        }),
      )
      return 'updated'
    },

    async createIfMissing(input) {
      if (await exists(input.email)) return 'exists'
      await create(input)
      return 'created'
    },

    async countContacts(locale) {
      const ids = resendIds()
      let count = 0
      let after: string | undefined
      for (;;) {
        const page = unwrap(
          await client.contacts.list({
            segmentId: ids.segments[locale],
            limit: 100,
            ...(after ? { after } : {}),
          }),
        )
        count += page.data.filter((contact) => !contact.unsubscribed).length
        if (!page.has_more || !page.data.length) break
        after = page.data[page.data.length - 1].id
      }
      return count
    },

    async createBroadcast(input) {
      const ids = resendIds()
      const config = emailConfig()
      const data = unwrap(
        await client.broadcasts.create({
          name: input.name,
          segmentId: ids.segments[input.locale],
          topicId: ids.topics[input.audience],
          from: config.newsletterFrom,
          replyTo: config.newsletterReplyTo,
          subject: input.subject,
          ...(input.previewText ? { previewText: input.previewText } : {}),
          html: input.html,
          text: input.text,
        }),
      )
      return data.id
    },

    async sendBroadcast(id) {
      unwrap(await client.broadcasts.send(id))
    },

    async broadcastState(id) {
      const result = await client.broadcasts.get(id)
      if (result.error?.name === 'not_found') return 'missing'
      return unwrap(result).status
    },
  }
}

// ---------------------------------------------------------------------------
// Local stand-in (no RESEND_API_KEY)
// ---------------------------------------------------------------------------

type LocalContact = ContactInput & { unsubscribed: boolean }
type LocalBroadcast = BroadcastInput & { id: string; state: 'draft' | 'sent'; recipients: number }
type LocalStore = { contacts: LocalContact[]; broadcasts: LocalBroadcast[] }

export const LOCAL_AUDIENCE_FILE = () => path.join(PREVIEW_DIR, 'audience.json')

async function readStore(): Promise<LocalStore> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_AUDIENCE_FILE(), 'utf8')) as LocalStore
  } catch {
    return { contacts: [], broadcasts: [] }
  }
}

async function writeStore(store: LocalStore) {
  await fs.mkdir(PREVIEW_DIR, { recursive: true })
  await fs.writeFile(LOCAL_AUDIENCE_FILE(), JSON.stringify(store, null, 2))
}

/** Local contacts (development and tests only). */
export async function readLocalAudience(): Promise<LocalStore> {
  return readStore()
}

export async function resetLocalAudience() {
  await writeStore({ contacts: [], broadcasts: [] })
}

function recipientsOf(store: LocalStore, input: Pick<BroadcastInput, 'locale' | 'audience'>) {
  return store.contacts.filter(
    (contact) =>
      contact.locale === input.locale &&
      !contact.unsubscribed &&
      contact.interests.includes(input.audience),
  )
}

export const localAudience: Audience = {
  async upsertContact(input) {
    const store = await readStore()
    const existing = store.contacts.find((contact) => contact.email === input.email)
    if (existing) {
      Object.assign(existing, {
        ...input,
        firstName: input.firstName || existing.firstName,
        interests: [...new Set([...existing.interests, ...input.interests])],
        unsubscribed: false,
      })
    } else {
      store.contacts.push({ ...input, unsubscribed: false })
    }
    await writeStore(store)
    return existing ? 'updated' : 'created'
  },

  async createIfMissing(input) {
    const store = await readStore()
    if (store.contacts.some((contact) => contact.email === input.email)) return 'exists'
    store.contacts.push({ ...input, unsubscribed: false })
    await writeStore(store)
    return 'created'
  },

  async countContacts(locale) {
    const store = await readStore()
    return store.contacts.filter((contact) => contact.locale === locale && !contact.unsubscribed)
      .length
  },

  async createBroadcast(input) {
    const store = await readStore()
    const id = `local-${store.broadcasts.length + 1}-${input.locale}`
    store.broadcasts.push({ ...input, id, state: 'draft', recipients: 0 })
    await writeStore(store)
    return id
  },

  async sendBroadcast(id) {
    const store = await readStore()
    const broadcast = store.broadcasts.find((item) => item.id === id)
    if (!broadcast) throw new AudienceError(`Broadcast ${id} not found`)
    const recipients = recipientsOf(store, broadcast)
    broadcast.state = 'sent'
    broadcast.recipients = recipients.length
    await writeStore(store)
    // One preview mail per broadcast, as Resend would send it to the segment.
    await writePreview({
      to: `Broadcast ${broadcast.locale.toUpperCase()} / ${broadcast.audience} (${recipients.length} Kontakte)`,
      from: emailConfig().newsletterFrom,
      subject: broadcast.subject,
      html: broadcast.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, '#abmelden-bei-resend'),
      text: broadcast.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, '#abmelden-bei-resend'),
    })
  },

  async broadcastState(id) {
    const store = await readStore()
    return store.broadcasts.find((item) => item.id === id)?.state ?? 'missing'
  },
}

// ---------------------------------------------------------------------------

let resendInstance: { key: string; audience: Audience } | null = null

/** Resend with RESEND_API_KEY, otherwise the local stand-in. */
export function getAudience(): Audience {
  const key = emailConfig().resendApiKey
  if (!key) return localAudience
  if (resendInstance?.key !== key) resendInstance = { key, audience: resendAudience(key) }
  return resendInstance.audience
}
