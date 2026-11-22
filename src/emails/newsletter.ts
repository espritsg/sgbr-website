import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { Newsletter, Post } from '@/payload-types'

import { button, emailFonts, emailLayout, escapeHtml } from './layout'
import { emailStrings, type EmailLocale } from './strings'

export type NewsletterLinks = {
  preferencesUrl: string
  unsubscribeUrl: string
  onlineUrl: string
  articleUrl: (slug: string) => string
}

/** The newsletter rendered once per language; links are filled per recipient. */
export type RenderedNewsletter = {
  subject: string
  html: (links: NewsletterLinks) => string
  text: (links: NewsletterLinks) => string
}

function richTextToHtml(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  return convertLexicalToHTML({ data: data as SerializedEditorState, disableContainer: true })
    .replace(/<p>/g, '<p style="margin:0 0 16px">')
    .replace(/<a /g, '<a style="color:#0B3C6D" ')
}

function richTextToText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  return convertLexicalToPlaintext({ data: data as SerializedEditorState })
}

export function renderNewsletter(
  newsletter: Newsletter,
  locale: EmailLocale,
  address: string,
  isTest = false,
): RenderedNewsletter {
  const s = emailStrings[locale]
  const posts = (newsletter.featuredPosts ?? []).filter(
    (post): post is Post => typeof post === 'object' && post !== null,
  )
  const subject = `${isTest ? s.testPrefix : ''}${newsletter.subject}`
  const contentHtml = richTextToHtml(newsletter.content)
  const contentText = richTextToText(newsletter.content)

  const html = (links: NewsletterLinks) => {
    const featured = posts.length
      ? `<h2 style="font-family:${emailFonts.SERIF};font-size:24px;font-weight:normal;margin:32px 0 8px;border-top:2px solid #1A1A1A;padding-top:12px">${escapeHtml(s.featured)}</h2>` +
        posts
          .map(
            (post) =>
              `<div style="padding:16px 0;border-bottom:1px solid #E3E7ED"><a href="${escapeHtml(links.articleUrl(post.slug))}" style="font-family:${emailFonts.SERIF};font-size:21px;color:#1A1A1A;text-decoration:none">${escapeHtml(post.title)}</a>` +
              `<p style="margin:6px 0 0;font-size:14px;color:#6B6B6B">${escapeHtml(post.summary ?? '')}</p>` +
              `<a href="${escapeHtml(links.articleUrl(post.slug))}" style="font-size:14px;font-weight:600;color:#0B3C6D">${escapeHtml(s.readArticle)} →</a></div>`,
          )
          .join('')
      : ''
    return emailLayout({
      lang: locale,
      previewText: newsletter.previewText,
      body:
        `<p style="font-size:12px;text-align:right;margin:0 0 16px"><a href="${escapeHtml(links.onlineUrl)}" style="color:#6B6B6B">${escapeHtml(s.viewOnline)}</a></p>` +
        `<h1 style="font-family:${emailFonts.SERIF};font-size:32px;font-weight:normal;line-height:1.2;margin:0 0 16px">${escapeHtml(newsletter.title)}</h1>` +
        (newsletter.intro
          ? `<p style="font-size:18px;color:#1A1A1A">${escapeHtml(newsletter.intro)}</p>`
          : '') +
        contentHtml +
        featured +
        (posts[0] ? button(links.articleUrl(posts[0].slug), s.readArticle) : ''),
      footer:
        `${escapeHtml(s.footerReason)}<br><a href="${escapeHtml(links.preferencesUrl)}" style="color:#ffffff">${escapeHtml(s.preferences)}</a> · ` +
        `<a href="${escapeHtml(links.unsubscribeUrl)}" style="color:#ffffff">${escapeHtml(s.unsubscribe)}</a><br><br>${escapeHtml(address).replace(/\n/g, '<br>')}`,
    })
  }

  const text = (links: NewsletterLinks) =>
    [
      newsletter.title,
      '',
      newsletter.intro ?? '',
      contentText,
      posts.length ? `\n${s.featured}:` : '',
      ...posts.map(
        (post) => `\n${post.title}\n${post.summary ?? ''}\n${links.articleUrl(post.slug)}`,
      ),
      '',
      '--',
      s.footerReason,
      `${s.preferences}: ${links.preferencesUrl}`,
      `${s.unsubscribe}: ${links.unsubscribeUrl}`,
      '',
      address,
    ]
      .filter((line) => line !== undefined)
      .join('\n')

  return { subject, html, text }
}
