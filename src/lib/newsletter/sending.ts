/**
 * Newsletter sending in batches through Resend (docs/newsletter.md).
 *
 * 1. startSending: snapshot of all recipients as newsletter-deliveries, numbered in
 *    batches of 100. Status draft → sending.
 * 2. processNewsletter: sends pending batches one after another until done or the
 *    time budget is used up. Each batch has a fixed idempotency key, so a batch that
 *    is retried after a crash is never delivered twice.
 * 3. When all batches are through: status sent, sentAt, archive date.
 */
import type { Payload } from 'payload'

import { renderNewsletter } from '@/emails/newsletter'
import { MAX_BATCH_SIZE, sendNewsletterBatch, type OutgoingMail } from '@/lib/email/batch'
import type { Newsletter, Subscriber } from '@/payload-types'

import { createToken } from './tokens'
import { newsletterUrls } from './urls'

export const MAX_ATTEMPTS = 3

export class NewsletterError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

export function recipientsWhere(audience: Newsletter['audience']) {
  return { and: [{ status: { equals: 'confirmed' } }, { interests: { contains: audience } }] }
}

export async function countRecipients(
  payload: Payload,
  audience: Newsletter['audience'],
): Promise<number> {
  const result = await payload.count({
    collection: 'subscribers',
    where: recipientsWhere(audience) as never,
  })
  return result.totalDocs
}

export function idempotencyKey(newsletterId: number, batch: number): string {
  return `newsletter-${newsletterId}-batch-${batch}`
}

async function siteAddress(payload: Payload): Promise<string> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  return settings.address || 'St. Gallen Business Review'
}

/** Creates the recipient snapshot and sets the status to "sending". */
export async function startSending(
  payload: Payload,
  newsletterId: number,
): Promise<{ recipients: number; batches: number }> {
  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    depth: 0,
  })
  if (newsletter.status === 'sent') throw new NewsletterError('Newsletter was already sent.', 409)
  if (newsletter.status === 'sending')
    throw new NewsletterError('Newsletter is already being sent.', 409)

  const existing = await payload.count({
    collection: 'newsletter-deliveries',
    where: { newsletter: { equals: newsletterId } },
  })
  if (existing.totalDocs === 0) {
    let page = 1
    let index = 0
    for (;;) {
      const subscribers = await payload.find({
        collection: 'subscribers',
        where: recipientsWhere(newsletter.audience) as never,
        sort: 'id',
        limit: 500,
        page,
        depth: 0,
      })
      for (const subscriber of subscribers.docs) {
        await payload.create({
          collection: 'newsletter-deliveries',
          data: {
            newsletter: newsletterId,
            subscriber: subscriber.id,
            batch: Math.floor(index / MAX_BATCH_SIZE),
            status: 'pending',
          },
          depth: 0,
        })
        index++
      }
      if (!subscribers.hasNextPage) break
      page++
    }
  }
  const recipients = (
    await payload.count({
      collection: 'newsletter-deliveries',
      where: { newsletter: { equals: newsletterId } },
    })
  ).totalDocs
  const batches = Math.ceil(recipients / MAX_BATCH_SIZE)
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    data: {
      status: 'sending',
      recipientCount: recipients,
      progress: {
        totalBatches: batches,
        sentBatches: 0,
        failedRecipients: 0,
        startedAt: new Date().toISOString(),
        lastError: null,
      },
    },
    context: { system: true },
  })
  return { recipients, batches }
}

type Delivery = {
  id: number
  batch: number
  attempts?: number | null
  subscriber: Subscriber | number
}

function mailFor(
  rendered: ReturnType<typeof renderNewsletter>,
  newsletter: Newsletter,
  subscriber: Subscriber,
): OutgoingMail {
  const token = subscriber.preferencesToken || ''
  const links = {
    preferencesUrl: newsletterUrls.preferences(subscriber.locale, token),
    unsubscribeUrl: newsletterUrls.preferences(subscriber.locale, token),
    onlineUrl: newsletterUrls.online(subscriber.locale, newsletter.slug),
    articleUrl: (slug: string) => newsletterUrls.article(subscriber.locale, slug),
  }
  return {
    to: subscriber.email,
    subject: rendered.subject,
    html: rendered.html(links),
    text: rendered.text(links),
    headers: {
      'List-Unsubscribe': `<${newsletterUrls.oneClickUnsubscribe(token)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
}

/**
 * Sends pending batches until done or until `budgetMs` is used up.
 * Returns true when the newsletter is completely sent (or failed for good).
 */
export async function processNewsletter(
  payload: Payload,
  newsletterId: number,
  budgetMs = 45_000,
): Promise<boolean> {
  const started = Date.now()
  const address = await siteAddress(payload)
  // Rendered once per language; only the personal links differ per recipient.
  const rendered: Partial<
    Record<'en' | 'de', { mail: ReturnType<typeof renderNewsletter>; newsletter: Newsletter }>
  > = {}
  let lastError: string | null = null

  while (Date.now() - started < budgetMs) {
    const next = await payload.find({
      collection: 'newsletter-deliveries',
      where: { and: [{ newsletter: { equals: newsletterId } }, { status: { equals: 'pending' } }] },
      sort: 'batch',
      limit: 1,
      depth: 0,
    })
    if (!next.docs[0]) break
    const batch = next.docs[0].batch
    const deliveries = (
      await payload.find({
        collection: 'newsletter-deliveries',
        where: {
          and: [
            { newsletter: { equals: newsletterId } },
            { batch: { equals: batch } },
            { status: { equals: 'pending' } },
          ],
        },
        limit: MAX_BATCH_SIZE,
        depth: 1,
        showHiddenFields: true,
      })
    ).docs as unknown as Delivery[]

    // Subscribers who unsubscribed after the snapshot are skipped.
    const sendable: Array<{ delivery: Delivery; subscriber: Subscriber }> = []
    for (const delivery of deliveries) {
      const subscriber = typeof delivery.subscriber === 'object' ? delivery.subscriber : null
      if (!subscriber || subscriber.status !== 'confirmed') {
        await payload.update({
          collection: 'newsletter-deliveries',
          id: delivery.id,
          data: { status: 'failed', error: 'not confirmed anymore' },
        })
        continue
      }
      if (!subscriber.preferencesToken) {
        subscriber.preferencesToken = createToken()
        await payload.update({
          collection: 'subscribers',
          id: subscriber.id,
          data: { preferencesToken: subscriber.preferencesToken },
        })
      }
      sendable.push({ delivery, subscriber })
    }

    if (sendable.length) {
      const mails = []
      for (const { subscriber } of sendable) {
        const locale = subscriber.locale
        if (!rendered[locale]) {
          const newsletter = await payload.findByID({
            collection: 'newsletters',
            id: newsletterId,
            locale,
            depth: 1,
          })
          rendered[locale] = { mail: renderNewsletter(newsletter, locale, address), newsletter }
        }
        const { mail, newsletter } = rendered[locale]!
        mails.push(mailFor(mail, newsletter, subscriber))
      }
      const result = await sendNewsletterBatch(mails, idempotencyKey(newsletterId, batch))
      if (result.ok) {
        for (const [index, { delivery }] of sendable.entries()) {
          await payload.update({
            collection: 'newsletter-deliveries',
            id: delivery.id,
            data: {
              status: 'sent',
              messageId: result.ids[index] ?? null,
              attempts: (delivery.attempts ?? 0) + 1,
            },
          })
        }
      } else {
        lastError = result.error
        const attempts = (sendable[0].delivery.attempts ?? 0) + 1
        const giveUp = !result.retryable || attempts >= MAX_ATTEMPTS
        for (const { delivery } of sendable) {
          await payload.update({
            collection: 'newsletter-deliveries',
            id: delivery.id,
            data: { attempts, ...(giveUp ? { status: 'failed', error: result.error } : {}) },
          })
        }
        await updateProgress(payload, newsletterId, lastError)
        // Retryable errors (rate limit, server error): stop now, the next run continues.
        if (!giveUp) return false
      }
    }
    await updateProgress(payload, newsletterId, lastError)
  }

  return finishIfDone(payload, newsletterId)
}

async function updateProgress(payload: Payload, newsletterId: number, lastError: string | null) {
  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    depth: 0,
  })
  const count = async (status: string) =>
    (
      await payload.count({
        collection: 'newsletter-deliveries',
        where: { and: [{ newsletter: { equals: newsletterId } }, { status: { equals: status } }] },
      })
    ).totalDocs
  const [pending, failed] = await Promise.all([count('pending'), count('failed')])
  const pendingBatches = Math.ceil(pending / MAX_BATCH_SIZE)
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    data: {
      progress: {
        ...newsletter.progress,
        sentBatches: Math.max(0, (newsletter.progress?.totalBatches ?? 0) - pendingBatches),
        failedRecipients: failed,
        lastError: lastError ?? newsletter.progress?.lastError ?? null,
      },
    },
    context: { system: true },
  })
}

async function finishIfDone(payload: Payload, newsletterId: number): Promise<boolean> {
  const pending = await payload.count({
    collection: 'newsletter-deliveries',
    where: { and: [{ newsletter: { equals: newsletterId } }, { status: { equals: 'pending' } }] },
  })
  if (pending.totalDocs > 0) return false
  const total = await payload.count({
    collection: 'newsletter-deliveries',
    where: { newsletter: { equals: newsletterId } },
  })
  const sent = await payload.count({
    collection: 'newsletter-deliveries',
    where: { and: [{ newsletter: { equals: newsletterId } }, { status: { equals: 'sent' } }] },
  })
  const failedCompletely = total.totalDocs > 0 && sent.totalDocs === 0
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    data: { status: failedCompletely ? 'failed' : 'sent', sentAt: new Date().toISOString() },
    context: { system: true },
  })
  return true
}

/** Test mail to one address, marked [TEST], with links that do not change anything. */
export async function sendTest(
  payload: Payload,
  newsletterId: number,
  to: string,
  locale: 'en' | 'de',
): Promise<void> {
  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    locale,
    depth: 1,
  })
  const rendered = renderNewsletter(newsletter, locale, await siteAddress(payload), true)
  const links = {
    preferencesUrl: `${newsletterUrls.online(locale, newsletter.slug)}#test`,
    unsubscribeUrl: `${newsletterUrls.online(locale, newsletter.slug)}#test`,
    onlineUrl: newsletterUrls.online(locale, newsletter.slug),
    articleUrl: (slug: string) => newsletterUrls.article(locale, slug),
  }
  await payload.sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html(links),
    text: rendered.text(links),
  })
}

/** Daily job: continue interrupted sendings and start scheduled newsletters. */
export async function runDueNewsletters(
  payload: Payload,
  now = new Date(),
): Promise<{ started: number; continued: number }> {
  let started = 0
  const scheduled = await payload.find({
    collection: 'newsletters',
    where: {
      and: [
        { status: { equals: 'draft' } },
        { scheduledFor: { less_than_equal: now.toISOString() } },
      ],
    },
    limit: 20,
    depth: 0,
  })
  for (const newsletter of scheduled.docs) {
    await startSending(payload, newsletter.id)
    started++
  }
  const sending = await payload.find({
    collection: 'newsletters',
    where: { status: { equals: 'sending' } },
    limit: 20,
    depth: 0,
  })
  for (const newsletter of sending.docs) await processNewsletter(payload, newsletter.id, 240_000)
  return { started, continued: sending.docs.length }
}
