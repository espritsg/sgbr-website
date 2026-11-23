import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import { emailLayout, escapeHtml, styleRichText } from '@/emails/layout'

/**
 * Puts every form mail (confirmation to the applicant, notice to the editors) into the
 * SGBR email template. Editors only write the text in the form's email settings.
 */
export const formEmailTemplate: BeforeEmail = async (emails, { req }) => {
  const settings = await req.payload
    .findGlobal({ slug: 'site-settings', depth: 0, req })
    .catch(() => null)
  const address = settings?.address || 'St. Gallen Business Review'
  const lang = typeof req.locale === 'string' ? req.locale : 'en'
  return emails.map((email) => ({
    ...email,
    html: emailLayout({
      lang,
      previewText: email.subject,
      body: styleRichText(email.html ?? ''),
      footer: escapeHtml(address).replace(/\n/g, '<br>'),
    }),
  }))
}
