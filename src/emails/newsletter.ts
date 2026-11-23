import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { Newsletter, Post } from '@/payload-types'

import {
  button,
  emailColors,
  emailFonts,
  emailLayout,
  escapeHtml,
  heading,
  kicker,
  styleRichText,
} from './layout'
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
  return styleRichText(
    convertLexicalToHTML({ data: data as SerializedEditorState, disableContainer: true }),
  )
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
    const c = emailColors
    const featured = posts.length
      ? `<div style="margin:36px 0 4px;border-top:2px solid ${c.text};padding-top:12px">${kicker(s.featured)}</div>` +
        posts
          .map(
            (post) =>
              `<div style="padding:16px 0;border-bottom:1px solid ${c.line}"><a href="${escapeHtml(links.articleUrl(post.slug))}" style="font-family:${emailFonts.SERIF};font-size:20px;font-weight:600;line-height:1.3;color:${c.text};text-decoration:none">${escapeHtml(post.title)}</a>` +
              `<p style="margin:6px 0 8px;font-size:14px;line-height:1.55;color:${c.muted}">${escapeHtml(post.summary ?? '')}</p>` +
              `<a href="${escapeHtml(links.articleUrl(post.slug))}" style="font-size:14px;font-weight:600;color:${c.navy}">${escapeHtml(s.readArticle)} &rarr;</a></div>`,
          )
          .join('')
      : ''
    return emailLayout({
      lang: locale,
      previewText: newsletter.previewText,
      body:
        `<p style="font-size:12px;text-align:right;margin:0 0 20px"><a href="${escapeHtml(links.onlineUrl)}" style="color:${c.muted}">${escapeHtml(s.viewOnline)}</a></p>` +
        kicker('Newsletter') +
        heading(newsletter.title) +
        (newsletter.intro
          ? `<p style="margin:0 0 20px;font-size:18px;line-height:1.55;color:${c.text}">${escapeHtml(newsletter.intro)}</p>`
          : '') +
        contentHtml +
        featured +
        (posts[0] ? button(links.articleUrl(posts[0].slug), s.readArticle) : ''),
      footer:
        `${escapeHtml(s.footerReason)}<br><a href="${escapeHtml(links.preferencesUrl)}" style="color:#ffffff">${escapeHtml(s.preferences)}</a> &middot; ` +
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
