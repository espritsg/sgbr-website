import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter } from 'payload'

import { emailConfig, parseAddress } from './config'
import { writePreview } from './preview'

/**
 * Payload email adapter: Resend with RESEND_API_KEY, otherwise the local preview.
 * Used for form mails, confirmation mails and admin password resets.
 */
export function emailAdapter(): EmailAdapter | Promise<EmailAdapter> {
  const config = emailConfig()
  const sender = parseAddress(config.from)
  if (config.resendApiKey) {
    return resendAdapter({
      apiKey: config.resendApiKey,
      defaultFromAddress: sender.address,
      defaultFromName: sender.name || 'St. Gallen Business Review',
    })
  }
  const previewAdapter: EmailAdapter = () => ({
    name: 'mail-preview',
    defaultFromAddress: sender.address,
    defaultFromName: sender.name || 'St. Gallen Business Review',
    sendEmail: async (message) => {
      const to = Array.isArray(message.to)
        ? message.to.map(String).join(', ')
        : String(message.to ?? '')
      const id = await writePreview({
        to,
        from: typeof message.from === 'string' ? message.from : config.from,
        subject: message.subject ?? '',
        html: typeof message.html === 'string' ? message.html : undefined,
        text: typeof message.text === 'string' ? message.text : undefined,
      })
      return { id }
    },
  })
  return previewAdapter
}
