import { describe, expect, it } from 'vitest'

import { confirmationEmail } from '@/emails/confirm'
import { button, emailLayout, styleRichText } from '@/emails/layout'

describe('email template', () => {
  it('wraps the body with logo and footer', () => {
    const html = emailLayout({ lang: 'de', body: '<p>Hallo</p>', footer: 'Adresse' })
    expect(html).toContain('/email/logo-sgbr.png')
    expect(html).toContain('<p>Hallo</p>')
    expect(html).toContain('Adresse')
    expect(html).toContain('lang="de"')
  })

  it('escapes text in the preview line and buttons', () => {
    const html = emailLayout({ lang: 'en', previewText: '<b>x</b>', body: '', footer: '' })
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
    expect(button('https://a.example/?a=1&b=2', 'Go <now>')).toContain('Go &lt;now&gt;')
  })

  it('styles rich text from the editor', () => {
    const html = styleRichText('<p>Text <a href="/x">Link</a></p><h2>Titel</h2>')
    expect(html).toContain('<p style="margin:0 0 16px">')
    expect(html).toMatch(/<a style="color:#17415B" href="\/x">/)
    expect(html).toMatch(/<h2 style="[^"]*font-family/)
  })

  it('keeps paragraphs that already have a style', () => {
    expect(styleRichText('<p style="font-weight:700">x</p>')).toBe(
      '<p style="font-weight:700">x</p>',
    )
  })

  it('keeps links that already have a style', () => {
    expect(styleRichText('<a style="color:red" href="/">x</a>')).toBe(
      '<a style="color:red" href="/">x</a>',
    )
  })

  it('renders the confirmation mail in the template', () => {
    const mail = confirmationEmail({
      locale: 'de',
      firstName: 'Ada',
      confirmUrl: 'https://example.com/confirm?t=1',
      address: 'St. Gallen',
    })
    expect(mail.html).toContain('Guten Tag Ada,')
    expect(mail.html).toContain('/email/logo-sgbr.png')
    expect(mail.text).toContain('https://example.com/confirm?t=1')
  })
})
