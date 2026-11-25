/**
 * Double opt-in without storing pending signups (ADR 0021): the signup data travels
 * encrypted (AES-256-GCM) inside the confirmation link and is only written to Resend
 * after the click. Key derived from PAYLOAD_SECRET. Links expire after 7 days.
 */
import crypto from 'crypto'

import type { Interest, Locale } from './audience'

export const SIGNUP_VALID_DAYS = 7

export type SignupData = {
  email: string
  firstName?: string
  locale: Locale
  interests: Interest[]
  source: string
  consentAt: string
}

type Sealed = SignupData & { expiresAt: number }

function key(): Buffer {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is missing')
  return crypto.createHash('sha256').update(`newsletter-signup:${secret}`).digest()
}

export function sealSignup(data: SignupData, now = Date.now()): string {
  const sealed: Sealed = { ...data, expiresAt: now + SIGNUP_VALID_DAYS * 86_400_000 }
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(sealed), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')
}

/** Returns the signup, or null for a forged, damaged or expired link. */
export function openSignup(token: unknown, now = Date.now()): SignupData | null {
  if (typeof token !== 'string' || token.length < 40 || token.length > 2000) return null
  try {
    const raw = Buffer.from(token, 'base64url')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12))
    decipher.setAuthTag(raw.subarray(12, 28))
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString()
    const { expiresAt, ...data } = JSON.parse(json) as Sealed
    return typeof expiresAt === 'number' && expiresAt > now ? data : null
  } catch {
    return null
  }
}
