/**
 * Newsletter subscriptions with double opt-in (docs/newsletter.md).
 * All functions use the Local API; the endpoints in src/endpoints call them.
 */
import type { Payload } from 'payload'

import { confirmationEmail } from '@/emails/confirm'
import type { Subscriber } from '@/payload-types'

import { createToken, isWellFormedToken } from './tokens'
import { newsletterUrls } from './urls'

export type Interest = 'newsletter' | 'events'
export type SignupInput = {
  email: string
  firstName?: string
  interests?: string[]
  locale: 'en' | 'de'
  source: 'footer' | 'popup' | 'newsletter-page'
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PENDING_DAYS = 7

export function normalizeInterests(value: unknown): Interest[] {
  const list = Array.isArray(value) ? value : []
  const interests = list.filter(
    (item): item is Interest => item === 'newsletter' || item === 'events',
  )
  return interests.length ? [...new Set(interests)] : ['newsletter']
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email.trim())
}

async function address(payload: Payload): Promise<string> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  return settings.address || 'St. Gallen Business Review'
}

async function sendConfirmation(
  payload: Payload,
  subscriber: Pick<Subscriber, 'email' | 'firstName' | 'locale'>,
  token: string,
) {
  const mail = confirmationEmail({
    locale: subscriber.locale,
    firstName: subscriber.firstName,
    confirmUrl: newsletterUrls.confirm(subscriber.locale, token),
    address: await address(payload),
  })
  await payload.sendEmail({
    to: subscriber.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  })
}

/**
 * Signup. Never reveals whether an address is known: the caller always answers
 * the same. Confirmed, bounced or complained addresses are left as they are.
 */
export async function subscribe(
  payload: Payload,
  input: SignupInput,
): Promise<'created' | 'resent' | 'unchanged'> {
  const email = input.email.trim().toLowerCase()
  const interests = normalizeInterests(input.interests)
  const now = new Date().toISOString()
  const existing = (
    await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      showHiddenFields: true,
    })
  ).docs[0]

  if (
    existing &&
    (existing.status === 'confirmed' ||
      existing.status === 'bounced' ||
      existing.status === 'complained')
  ) {
    return 'unchanged'
  }

  const confirmToken = createToken()
  const data = {
    email,
    firstName: input.firstName?.trim().slice(0, 100) || existing?.firstName || undefined,
    interests,
    locale: input.locale,
    source: input.source,
    status: 'pending' as const,
    consentAt: now,
    confirmToken,
    preferencesToken: existing?.preferencesToken || createToken(),
  }

  if (existing) {
    // Pending again, or unsubscribed and signing up anew: fresh confirmation.
    await payload.update({
      collection: 'subscribers',
      id: existing.id,
      data: { ...data, unsubscribedAt: null },
    })
  } else {
    await payload.create({ collection: 'subscribers', data })
  }
  await sendConfirmation(
    payload,
    { email, firstName: data.firstName, locale: input.locale },
    confirmToken,
  )
  return existing ? 'resent' : 'created'
}

export async function findByToken(
  payload: Payload,
  field: 'confirmToken' | 'preferencesToken',
  token: unknown,
) {
  if (!isWellFormedToken(token)) return null
  const result = await payload.find({
    collection: 'subscribers',
    where: { [field]: { equals: token } },
    limit: 1,
    showHiddenFields: true,
  })
  return result.docs[0] ?? null
}

/** Confirms a pending subscription. Opening the link again stays successful. */
export async function confirm(payload: Payload, token: unknown): Promise<Subscriber | null> {
  const subscriber = await findByToken(payload, 'confirmToken', token)
  if (!subscriber) return null
  if (subscriber.status === 'confirmed') return subscriber
  if (subscriber.status !== 'pending') return null
  return payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: { status: 'confirmed', confirmedAt: new Date().toISOString() },
  })
}

export async function updatePreferences(
  payload: Payload,
  token: unknown,
  interests: unknown,
): Promise<Subscriber | null> {
  const subscriber = await findByToken(payload, 'preferencesToken', token)
  if (!subscriber || subscriber.status !== 'confirmed') return null
  return payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: { interests: normalizeInterests(interests) },
  })
}

/** Unsubscribing never deletes, so the address is not contacted again. */
export async function unsubscribe(payload: Payload, token: unknown): Promise<boolean> {
  const subscriber = await findByToken(payload, 'preferencesToken', token)
  if (!subscriber) return false
  if (subscriber.status === 'unsubscribed') return true
  await payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString() },
  })
  return true
}

/** Resend webhook: bounces and spam complaints. */
export async function markDeliveryProblem(
  payload: Payload,
  email: string,
  status: 'bounced' | 'complained',
): Promise<boolean> {
  const result = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
  })
  const subscriber = result.docs[0]
  if (!subscriber) return false
  await payload.update({ collection: 'subscribers', id: subscriber.id, data: { status } })
  return true
}

/** Deletes signups that were not confirmed within 7 days (daily job). */
export async function purgeUnconfirmed(payload: Payload, now = new Date()): Promise<number> {
  const before = new Date(now.getTime() - PENDING_DAYS * 24 * 3600 * 1000).toISOString()
  const result = await payload.delete({
    collection: 'subscribers',
    where: { and: [{ status: { equals: 'pending' } }, { consentAt: { less_than: before } }] },
  })
  return result.docs.length
}
