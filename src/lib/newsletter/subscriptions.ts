/**
 * Newsletter signup with double opt-in (docs/newsletter.md, ADR 0021).
 * Nothing is stored before the click on the confirmation link; then the contact
 * is written to Resend, the only list of subscribers.
 */
import type { Payload } from 'payload'

import { confirmationEmail } from '@/emails/confirm'

import { getAudience, type Interest, type Locale } from './audience'
import { openSignup, sealSignup } from './signupToken'
import { newsletterUrls } from './urls'

export type { Interest }
export type SignupInput = {
  email: string
  firstName?: string
  interests?: string[]
  locale: Locale
  source: 'footer' | 'popup' | 'newsletter-page'
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

/**
 * Signup: sends the confirmation mail and nothing else. The answer is the same for
 * new and known addresses (no enumeration); confirming again is harmless.
 */
export async function subscribe(payload: Payload, input: SignupInput): Promise<void> {
  const email = input.email.trim().toLowerCase()
  const firstName = input.firstName?.trim().slice(0, 100) || undefined
  const token = sealSignup({
    email,
    firstName,
    locale: input.locale,
    interests: normalizeInterests(input.interests),
    source: input.source,
    consentAt: new Date().toISOString(),
  })
  const mail = confirmationEmail({
    locale: input.locale,
    firstName,
    confirmUrl: newsletterUrls.confirm(input.locale, token),
    address: await address(payload),
  })
  await payload.sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })
}

/** Click on the confirmation link: writes the contact to Resend. Opening it again is fine. */
export async function confirm(token: unknown): Promise<{ email: string; locale: Locale } | null> {
  const signup = openSignup(token)
  if (!signup) return null
  await getAudience().upsertContact({
    ...signup,
    interests: normalizeInterests(signup.interests),
    confirmedAt: new Date().toISOString(),
  })
  return { email: signup.email, locale: signup.locale }
}
