import { button, emailLayout, escapeHtml } from './layout'
import { emailStrings, type EmailLocale } from './strings'

/** Double opt-in confirmation mail, in the language of the signup page. */
export function confirmationEmail({
  locale,
  firstName,
  confirmUrl,
  address,
}: {
  locale: EmailLocale
  firstName?: string | null
  confirmUrl: string
  address: string
}) {
  const s = emailStrings[locale]
  const html = emailLayout({
    lang: locale,
    previewText: s.confirmButton,
    body: `<p>${escapeHtml(s.confirmGreeting(firstName))}</p><p>${escapeHtml(s.confirmText)}</p>${button(confirmUrl, s.confirmButton)}<p style="font-size:13px;color:#6B6B6B">${escapeHtml(s.confirmNote)}<br><a href="${escapeHtml(confirmUrl)}" style="color:#0B3C6D;word-break:break-all">${escapeHtml(confirmUrl)}</a></p>`,
    footer: escapeHtml(address).replace(/\n/g, '<br>'),
  })
  const text = `${s.confirmGreeting(firstName)}\n\n${s.confirmText}\n\n${s.confirmButton}: ${confirmUrl}\n\n${s.confirmNote}\n\n--\n${address}`
  return { subject: s.confirmSubject, html, text }
}
