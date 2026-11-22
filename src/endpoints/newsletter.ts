/**
 * Public newsletter endpoints under /api/newsletter/… (docs/newsletter.md).
 */
import { after } from 'next/server'
import type { Endpoint, PayloadRequest } from 'payload'
import { Resend } from 'resend'

import { serverUrl } from '@/lib/media'
import { processNewsletter } from '@/lib/newsletter/sending'
import {
  isValidEmail,
  markDeliveryProblem,
  subscribe,
  unsubscribe,
  updatePreferences,
} from '@/lib/newsletter/subscriptions'
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

const preferencesEndpoint: Endpoint = {
  path: '/newsletter/preferences',
  method: 'post',
  handler: async (req) => {
    const body = await readJson(req)
    if (
      !(await checkRateLimit(req.payload, clientIp(req.headers), {
        purpose: 'newsletter-preferences',
        limit: 30,
      }))
    ) {
      return json({ ok: false }, 429)
    }
    if (body.unsubscribe === true) {
      return json({ ok: await unsubscribe(req.payload, body.token) })
    }
    const updated = await updatePreferences(req.payload, body.token, body.interests)
    return json({ ok: Boolean(updated) }, updated ? 200 : 404)
  },
}

/** One-click unsubscribe from the mail program (List-Unsubscribe-Post, RFC 8058). */
const unsubscribeEndpoint: Endpoint = {
  path: '/newsletter/unsubscribe',
  method: 'post',
  handler: async (req) => {
    const token = req.searchParams.get('token')
    const ok = await unsubscribe(req.payload, token)
    return json({ ok }, ok ? 200 : 404)
  },
}

/** Resend webhook for bounces and spam complaints. The signature is checked. */
const webhookEndpoint: Endpoint = {
  path: '/newsletter/webhook',
  method: 'post',
  handler: async (req) => {
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (!secret) return json({ ok: false, error: 'webhook not configured' }, 503)
    const raw = (await req.text?.()) ?? ''
    let event: { type: string; data?: { to?: string[] | string } }
    try {
      event = new Resend(process.env.RESEND_API_KEY || 're_dummy').webhooks.verify({
        payload: raw,
        // Resend signs webhooks with Svix headers.
        headers: {
          id: req.headers.get('svix-id') ?? '',
          timestamp: req.headers.get('svix-timestamp') ?? '',
          signature: req.headers.get('svix-signature') ?? '',
        },
        webhookSecret: secret,
      }) as typeof event
    } catch {
      return json({ ok: false, error: 'invalid signature' }, 401)
    }
    const status =
      event.type === 'email.bounced'
        ? 'bounced'
        : event.type === 'email.complained'
          ? 'complained'
          : null
    if (status) {
      const recipients = Array.isArray(event.data?.to)
        ? event.data.to
        : event.data?.to
          ? [event.data.to]
          : []
      for (const email of recipients) await markDeliveryProblem(req.payload, email, status)
    }
    return json({ ok: true })
  },
}

/** Continues a sending in a new function call (self-invocation, protected with CRON_SECRET). */
const continueEndpoint: Endpoint = {
  path: '/newsletter/continue',
  method: 'post',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`)
      return json({ ok: false }, 401)
    const body = await readJson(req)
    const id = Number(body.newsletterId)
    if (!Number.isInteger(id)) return json({ ok: false }, 400)
    const done = await processNewsletter(req.payload, id)
    if (!done) continueInBackground(id)
    return json({ ok: true, done })
  },
}

/**
 * Starts the next round after the response is sent. Without CRON_SECRET (local
 * development) the daily job or the next click continues instead.
 */
export function continueInBackground(newsletterId: number) {
  const secret = process.env.CRON_SECRET
  if (!secret) return
  after(async () => {
    await fetch(`${serverUrl()}/api/newsletter/continue`, {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
      body: JSON.stringify({ newsletterId }),
    }).catch((error) => console.error('Newsletter continue failed', error))
  })
}

export const newsletterEndpoints: Endpoint[] = [
  subscribeEndpoint,
  preferencesEndpoint,
  unsubscribeEndpoint,
  webhookEndpoint,
  continueEndpoint,
]
