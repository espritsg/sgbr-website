import type { Endpoint } from 'payload'

import { canSendNewsletter, canSendTestNewsletter } from '@/access/actions'
import { continueInBackground } from '@/endpoints/newsletter'
import {
  countRecipients,
  NewsletterError,
  processNewsletter,
  sendTest,
  startSending,
} from '@/lib/newsletter/sending'

const json = (body: unknown, status = 200) => Response.json(body, { status })

function idOf(value: unknown): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Admin actions on a newsletter: recipient count, test sending, sending (docs/newsletter.md). */
export const newsletterAdminEndpoints: Endpoint[] = [
  {
    path: '/:id/recipients',
    method: 'get',
    handler: async (req) => {
      if (!canSendTestNewsletter(req.user)) return json({ error: 'forbidden' }, 403)
      const id = idOf(req.routeParams?.id)
      if (!id) return json({ error: 'invalid id' }, 400)
      const newsletter = await req.payload.findByID({ collection: 'newsletters', id, depth: 0 })
      return json({
        recipients: await countRecipients(req.payload, newsletter.audience),
        status: newsletter.status,
      })
    },
  },
  {
    path: '/:id/test',
    method: 'post',
    handler: async (req) => {
      const email = req.user && 'email' in req.user ? req.user.email : null
      if (!canSendTestNewsletter(req.user) || !email) return json({ error: 'forbidden' }, 403)
      const id = idOf(req.routeParams?.id)
      if (!id) return json({ error: 'invalid id' }, 400)
      const locale = req.searchParams.get('locale') === 'de' ? 'de' : 'en'
      await sendTest(req.payload, id, email, locale)
      return json({ ok: true, to: email })
    },
  },
  {
    path: '/:id/send',
    method: 'post',
    handler: async (req) => {
      if (!canSendNewsletter(req.user)) return json({ error: 'forbidden' }, 403)
      const id = idOf(req.routeParams?.id)
      if (!id) return json({ error: 'invalid id' }, 400)
      try {
        const started = await startSending(req.payload, id)
        // Send right away; if the time budget is not enough, continue in the background.
        const done = await processNewsletter(req.payload, id, 40_000)
        if (!done) continueInBackground(id)
        return json({ ok: true, ...started, done })
      } catch (error) {
        if (error instanceof NewsletterError) return json({ error: error.message }, error.status)
        throw error
      }
    },
  },
]
