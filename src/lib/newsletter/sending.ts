/**
 * Newsletter sending as Resend broadcasts (docs/newsletter.md, ADR 0021).
 *
 * Per language one broadcast to the language segment, scoped to the topic of the
 * audience. Resend personalises the unsubscribe link and leaves out unsubscribed,
 * bounced and complained contacts.
 *
 * Never twice: the broadcast is first created as a draft and its id stored in the
 * newsletter; only then it is sent. A retry looks at the stored id: a draft is sent,
 * a queued or sent broadcast is left alone.
 */
import type { Payload } from 'payload'

import { renderNewsletter } from '@/emails/newsletter'
import type { Newsletter } from '@/payload-types'

import { getAudience, LOCALES, UNSUBSCRIBE_PLACEHOLDER, type Locale } from './audience'
import { newsletterUrls } from './urls'

export class NewsletterError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

const BROADCAST_FIELD = { en: 'broadcastEn', de: 'broadcastDe' } as const

/** Contacts per language that are not unsubscribed: an upper bound for the audience. */
export async function countRecipients(): Promise<{ en: number; de: number; total: number }> {
  const audience = getAudience()
  const [en, de] = await Promise.all([audience.countContacts('en'), audience.countContacts('de')])
  return { en, de, total: en + de }
}

async function siteAddress(payload: Payload): Promise<string> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  return settings.address || 'St. Gallen Business Review'
}

function broadcastLinks(locale: Locale, slug: string) {
  return {
    preferencesUrl: UNSUBSCRIBE_PLACEHOLDER,
    unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
    onlineUrl: newsletterUrls.online(locale, slug),
    articleUrl: (articleSlug: string) => newsletterUrls.article(locale, articleSlug),
  }
}

async function saveResend(
  payload: Payload,
  id: number,
  data: Partial<NonNullable<Newsletter['resend']>>,
  extra: Partial<Pick<Newsletter, 'status' | 'sentAt' | 'recipientCount'>> = {},
) {
  const current = await payload.findByID({ collection: 'newsletters', id, depth: 0 })
  await payload.update({
    collection: 'newsletters',
    id,
    data: { ...extra, resend: { ...current.resend, ...data } },
  })
}

/**
 * Sends the newsletter: one broadcast per language with recipients. Safe to call
 * again after an error; finished languages are skipped.
 */
export async function sendNewsletter(
  payload: Payload,
  newsletterId: number,
): Promise<{ recipients: number; broadcasts: string[] }> {
  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    depth: 0,
  })
  if (newsletter.status === 'sent') throw new NewsletterError('Newsletter was already sent.', 409)

  const audience = getAudience()
  const counts = await countRecipients()
  const address = await siteAddress(payload)
  const broadcasts: string[] = []

  for (const locale of LOCALES) {
    if (!counts[locale]) continue
    const field = BROADCAST_FIELD[locale]
    try {
      let broadcastId = newsletter.resend?.[field] || ''
      const state = broadcastId ? await audience.broadcastState(broadcastId) : 'missing'
      if (state === 'queued' || state === 'sent') {
        broadcasts.push(broadcastId)
        continue
      }
      if (state === 'missing') {
        const localized = await payload.findByID({
          collection: 'newsletters',
          id: newsletterId,
          locale,
          depth: 1,
        })
        const mail = renderNewsletter(localized, locale, address)
        const links = broadcastLinks(locale, localized.slug)
        broadcastId = await audience.createBroadcast({
          name: `${localized.title} (${locale.toUpperCase()})`,
          locale,
          audience: newsletter.audience,
          subject: mail.subject,
          previewText: localized.previewText || undefined,
          html: mail.html(links),
          text: mail.text(links),
        })
        await saveResend(payload, newsletterId, { [field]: broadcastId })
      }
      await audience.sendBroadcast(broadcastId)
      broadcasts.push(broadcastId)
    } catch (error) {
      const message = `${locale.toUpperCase()}: ${(error as Error).message}`
      await saveResend(payload, newsletterId, { lastError: message }, { status: 'failed' })
      throw new NewsletterError(message, 502)
    }
  }

  await saveResend(
    payload,
    newsletterId,
    { lastError: null },
    { status: 'sent', sentAt: new Date().toISOString(), recipientCount: counts.total },
  )
  return { recipients: counts.total, broadcasts }
}

/** Test mail to one address, marked [TEST], with links that do not change anything. */
export async function sendTest(
  payload: Payload,
  newsletterId: number,
  to: string,
  locale: Locale,
): Promise<void> {
  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    locale,
    depth: 1,
  })
  const rendered = renderNewsletter(newsletter, locale, await siteAddress(payload), true)
  const links = {
    ...broadcastLinks(locale, newsletter.slug),
    preferencesUrl: `${newsletterUrls.online(locale, newsletter.slug)}#test`,
    unsubscribeUrl: `${newsletterUrls.online(locale, newsletter.slug)}#test`,
  }
  await payload.sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html(links),
    text: rendered.text(links),
  })
}

/** Daily job: sends newsletters planned for today (status draft or failed). */
export async function runDueNewsletters(payload: Payload, now = new Date()): Promise<number> {
  const due = await payload.find({
    collection: 'newsletters',
    where: {
      and: [
        { status: { in: ['draft', 'failed'] } },
        { scheduledFor: { less_than_equal: now.toISOString() } },
      ],
    },
    limit: 20,
    depth: 0,
  })
  let sent = 0
  for (const newsletter of due.docs) {
    try {
      await sendNewsletter(payload, newsletter.id)
      sent++
    } catch (error) {
      payload.logger.error({ msg: 'Scheduled newsletter failed', id: newsletter.id, error })
    }
  }
  return sent
}
