/**
 * Light email layout in the SGBR design (always light, docs/design-system.md).
 * Tables and inline styles because many email clients ignore CSS.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SERIF = "Georgia, 'Cormorant Garamond', 'Times New Roman', serif"
const SANS = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:#0B3C6D;border-radius:999px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`
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
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>St. Gallen Business Review</title>
</head>
<body style="margin:0;padding:0;background:#F4F6F9">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px">
<tr><td style="padding:32px 40px 16px;border-bottom:1px solid #E3E7ED;text-align:center">
<div style="font-family:${SERIF};font-size:30px;color:#1A1A1A">St. Gallen Business Review</div>
</td></tr>
<tr><td style="padding:24px 40px 32px;font-family:${SANS};font-size:16px;line-height:1.6;color:#1A1A1A">
${body}
</td></tr>
<tr><td style="padding:24px 40px;background:#152E3A;border-radius:0 0 16px 16px;font-family:${SANS};font-size:12px;line-height:1.6;color:#C5CED8">
${footer}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export const emailFonts = { SERIF, SANS }
