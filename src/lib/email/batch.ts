import { Resend } from 'resend'

import { emailConfig } from './config'
import { writePreview } from './preview'

export type OutgoingMail = {
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

export type BatchResult =
  { ok: true; ids: string[] } | { ok: false; error: string; retryable: boolean }

/** Resend accepts at most 100 emails per batch call. */
export const MAX_BATCH_SIZE = 100

let client: Resend | null = null

/**
 * Sends one newsletter batch. The idempotency key makes a retried batch safe:
 * Resend does not send it twice (docs/newsletter.md).
 */
export async function sendNewsletterBatch(
  mails: OutgoingMail[],
  idempotencyKey: string,
): Promise<BatchResult> {
  if (mails.length > MAX_BATCH_SIZE) throw new Error(`Batch too large: ${mails.length}`)
  const config = emailConfig()

  if (!config.resendApiKey) {
    const ids = []
    for (const mail of mails) ids.push(await writePreview({ ...mail, from: config.newsletterFrom }))
    return { ok: true, ids }
  }

  client ??= new Resend(config.resendApiKey)
  const { data, error } = await client.batch.send(
    mails.map((mail) => ({
      from: config.newsletterFrom,
      replyTo: config.newsletterReplyTo,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.headers,
    })),
    { idempotencyKey },
  )
  if (error) {
    const status = (error as { statusCode?: number }).statusCode ?? 0
    return {
      ok: false,
      error: `${error.name}: ${error.message}`,
      retryable: status === 429 || status >= 500 || status === 0,
    }
  }
  return { ok: true, ids: (data?.data ?? []).map((item) => item.id) }
}
