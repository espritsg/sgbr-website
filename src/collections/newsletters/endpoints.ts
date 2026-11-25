import type { Endpoint } from 'payload'

import { canSendNewsletter, canSendTestNewsletter } from '@/access/actions'
import { AudienceError } from '@/lib/newsletter/audience'
import {
  countRecipients,
  NewsletterError,
  sendNewsletter,
  sendTest,
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
      try {
        return json({ recipients: (await countRecipients()).total, status: newsletter.status })
      } catch (error) {
        // Resend not reachable or not set up: show the reason in the sidebar.
        if (error instanceof AudienceError)
          return json({ recipients: null, status: newsletter.status, error: error.message })
        throw error
      }
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
        return json({ ok: true, ...(await sendNewsletter(req.payload, id)) })
      } catch (error) {
        if (error instanceof NewsletterError) return json({ error: error.message }, error.status)
        throw error
      }
    },
  },
]
