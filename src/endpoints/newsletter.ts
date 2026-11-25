/**
 * Public newsletter endpoint /api/newsletter/subscribe (docs/newsletter.md).
 * Unsubscribing and preferences are handled by Resend (ADR 0021).
 */
import type { Endpoint, PayloadRequest } from 'payload'

import { isValidEmail, subscribe } from '@/lib/newsletter/subscriptions'
import { checkRateLimit, clientIp } from '@/lib/rateLimit'

const json = (body: unknown, status = 200) => Response.json(body, { status })

async function readJson(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return ((await req.json?.()) ?? {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

const subscribeEndpoint: Endpoint = {
  path: '/newsletter/subscribe',
  method: 'post',
  handler: async (req) => {
    const body = await readJson(req)
    // Honeypot filled: pretend success, do nothing.
    if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true })
    if (!(await checkRateLimit(req.payload, clientIp(req.headers), { purpose: 'newsletter' }))) {
      return json({ ok: false, error: 'too-many-requests' }, 429)
    }
    if (!isValidEmail(body.email) || body.consent !== true)
      return json({ ok: false, error: 'invalid' }, 400)
    const locale = body.locale === 'de' ? 'de' : 'en'
    const source = ['footer', 'popup', 'newsletter-page'].includes(String(body.source))
      ? (body.source as 'footer' | 'popup' | 'newsletter-page')
      : 'newsletter-page'
    await subscribe(req.payload, {
      email: body.email,
      firstName: typeof body.firstName === 'string' ? body.firstName : undefined,
      interests: Array.isArray(body.interests) ? (body.interests as string[]) : undefined,
      locale,
      source,
    })
    // Same answer for new, pending and known addresses (no enumeration).
    return json({ ok: true })
  },
}

export const newsletterEndpoints: Endpoint[] = [subscribeEndpoint]
