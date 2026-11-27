/**
 * The one email template of the site (docs/newsletter.md, docs/formulare.md): SGBR logo,
 * square, navy, serif headings, dark footer like the website. Every mail goes through
 * emailLayout; only the body changes. Tables and inline styles because many email
 * clients ignore CSS. Always light (the logo is navy).
 */
import { serverUrl } from '@/lib/media'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Same colours as the website tokens (src/app/(frontend)/globals.css). */
export const emailColors = {
  navy: '#17415B',
  text: '#121212',
  muted: '#5E6670',
  line: '#DFE2E6',
  band: '#F4F5F6',
  footer: '#10232D',
  footerText: '#B9C6D0',
} as const

// Source Serif 4 and Inter only if installed on the reader's device; no web fonts in mails
// (no requests to font services from the inbox).
const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

export const emailFonts = { SERIF, SANS }

/** Square navy button, as on the website. */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0"><tr><td style="background:${emailColors.navy}"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`
}

/** Small uppercase line above a title (kicker), as on the website. */
export function kicker(label: string): string {
  return `<p style="margin:0 0 10px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${emailColors.navy}">${escapeHtml(label)}</p>`
}

/** Main title of a mail. */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:${SERIF};font-size:30px;font-weight:600;line-height:1.2;color:${emailColors.text}">${escapeHtml(text)}</h1>`
}

/**
 * Brings HTML from the rich-text editor (newsletter, form mails) into the mail style:
 * spacing for paragraphs, serif headings, navy links. Elements that already have a style
 * (newsletter blocks) stay as they are.
 */
export function styleRichText(html: string): string {
  return html
    .replace(/<p(?![^>]*style=)(\s[^>]*)?>/g, '<p style="margin:0 0 16px">')
    .replace(
      /<h([1-3])(?![^>]*style=)(\s[^>]*)?>/g,
      `<h$1 style="margin:28px 0 12px;font-family:${SERIF};font-weight:600;line-height:1.25;color:${emailColors.text}">`,
    )
    .replace(/<a (?![^>]*style=)/g, `<a style="color:${emailColors.navy}" `)
    .replace(
      /<blockquote(\s[^>]*)?>/g,
      `<blockquote style="margin:20px 0;padding:0 0 0 16px;border-left:2px solid ${emailColors.navy};font-family:${SERIF};font-size:19px;line-height:1.5">`,
    )
}

export function emailLayout({
  lang,
  previewText,
  body,
  footer,
}: {
  lang: string
  previewText?: string | null
  body: string
  footer: string
}): string {
  const site = serverUrl()
  const c = emailColors
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>St. Gallen Business Review</title>
</head>
<body style="margin:0;padding:0;background:${c.band}">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.band}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="padding:36px 40px 28px;text-align:center">
<a href="${escapeHtml(site)}" style="text-decoration:none"><img src="${escapeHtml(site)}/email/logo-sgbr.png" width="220" height="47" alt="St. Gallen Business Review" style="display:inline-block;width:220px;height:auto;border:0"></a>
</td></tr>
<tr><td style="padding:0 40px"><div style="border-top:1px solid ${c.text};font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:32px 40px 36px;font-family:${SANS};font-size:16px;line-height:1.6;color:${c.text}">
${body}
</td></tr>
<tr><td style="padding:28px 40px;background:${c.footer};font-family:${SANS};font-size:12px;line-height:1.7;color:${c.footerText}">
<p style="margin:0 0 10px;font-family:${SERIF};font-size:16px;font-weight:600;color:#ffffff">St. Gallen Business Review</p>
${footer}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}
