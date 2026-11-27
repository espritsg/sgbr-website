import {
  convertLexicalToHTML,
  type HTMLConvertersFunction,
} from '@payloadcms/richtext-lexical/html'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { isMedia, serverUrl } from '@/lib/media'
import type {
  Media,
  Newsletter,
  NewsletterArticleBlock,
  NewsletterSectionBlock,
  Post,
} from '@/payload-types'

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

/** Address and social links for the footer (site settings and footer global). */
export type NewsletterFooter = {
  address: string
  socialLinks?: Array<{ platform: string; url: string }>
}

/** The newsletter rendered once per language; links are filled per recipient. */
export type RenderedNewsletter = {
  subject: string
  html: (links: NewsletterLinks) => string
  text: (links: NewsletterLinks) => string
}

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  x: 'X',
  spotify: 'Spotify',
}

/** Absolute image URL for mails (medium size; local files get the server URL in front). */
function emailImageUrl(media: Media): string | null {
  const url = media.sizes?.card?.url || media.url
  if (!url) return null
  return url.startsWith('http') ? url : `${serverUrl()}${url}`
}

/**
 * Intro as paragraphs: a blank line starts a new paragraph, a single line break stays
 * a line break (e.g. "Caspar Moebius" / "Editor-in-Chief").
 */
export function introToHtml(intro: string): string {
  return intro
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:17px;line-height:1.6;color:${emailColors.text}">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`,
    )
    .join('')
}

function textLink(href: string, label: string): string {
  return `<p style="margin:12px 0 0"><a href="${escapeHtml(href)}" style="color:${emailColors.navy};font-weight:600">${escapeHtml(label)}</a></p>`
}

/** Image left of the copy (portraits, logos) or large above it (group photos). */
function imageWithCopy(media: Media | null, position: string | null | undefined, copy: string) {
  const src = media ? emailImageUrl(media) : null
  if (!src) return `<div style="margin:8px 0 28px">${copy}</div>`
  const alt = escapeHtml(media?.alt ?? '')
  if (position === 'top') {
    return (
      `<div style="margin:8px 0 28px"><img src="${escapeHtml(src)}" width="520" alt="${alt}" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 0 16px">` +
      `${copy}</div>`
    )
  }
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr>` +
    `<td width="150" valign="top" style="width:150px;padding:4px 20px 0 0"><img src="${escapeHtml(src)}" width="150" alt="${alt}" style="display:block;width:150px;height:auto;border:0"></td>` +
    `<td valign="top">${copy}</td></tr></table>`
  )
}

function richTextToText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  return convertLexicalToPlaintext({ data: data as SerializedEditorState })
}

function postOf(value: NewsletterArticleBlock['post']): Post | null {
  return typeof value === 'object' && value !== null ? value : null
}

export function renderNewsletter(
  newsletter: Newsletter,
  locale: EmailLocale,
  footerInfo: NewsletterFooter,
  isTest = false,
): RenderedNewsletter {
  const s = emailStrings[locale]
  const c = emailColors
  const posts = (newsletter.featuredPosts ?? []).filter(
    (post): post is Post => typeof post === 'object' && post !== null,
  )
  const subject = `${isTest ? s.testPrefix : ''}${newsletter.subject}`
  const contentText = richTextToText(newsletter.content)

  const contentHtml = (links: NewsletterLinks) => {
    if (!newsletter.content || typeof newsletter.content !== 'object') return ''
    const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
      ...defaultConverters,
      upload: ({ node }) => {
        const media = (node as { value?: unknown }).value
        if (!isMedia(media) || !media.mimeType?.startsWith('image/')) return ''
        const src = emailImageUrl(media)
        return src
          ? `<img src="${escapeHtml(src)}" width="520" alt="${escapeHtml(media.alt ?? '')}" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:8px 0 20px">`
          : ''
      },
      blocks: {
        newsletterSection: ({ node }: { node: unknown }) => {
          const block = (node as { fields: NewsletterSectionBlock }).fields
          const media = isMedia(block.image) ? block.image : null
          const text = block.text
            ? styleRichText(
                convertLexicalToHTML({
                  data: block.text as SerializedEditorState,
                  disableContainer: true,
                }),
              ).replace(/<p style="margin:0 0 16px">/g, '<p style="margin:0 0 10px">')
            : ''
          const linkHtml =
            block.linkUrl && block.linkLabel
              ? block.linkStyle === 'button'
                ? button(block.linkUrl, block.linkLabel)
                : textLink(block.linkUrl, block.linkLabel)
              : ''
          const copy =
            (block.title
              ? `<p style="margin:0 0 4px;font-weight:700;line-height:1.4">${escapeHtml(block.title)}</p>`
              : '') +
            (block.subtitle
              ? `<p style="margin:0 0 10px;font-style:italic;color:${c.muted};line-height:1.45">${escapeHtml(block.subtitle)}</p>`
              : '') +
            text +
            linkHtml
          return imageWithCopy(media, block.imagePosition, copy)
        },
        newsletterArticle: ({ node }: { node: unknown }) => {
          const block = (node as { fields: NewsletterArticleBlock }).fields
          const post = postOf(block.post)
          if (!post) return ''
          const media = isMedia(block.image)
            ? block.image
            : isMedia(post.heroImage)
              ? post.heroImage
              : null
          const href = links.articleUrl(post.slug)
          const copy =
            `<p style="margin:0 0 6px;font-weight:700;line-height:1.4"><a href="${escapeHtml(href)}" style="color:${c.text};text-decoration:none">${escapeHtml(post.title)}</a></p>` +
            `<p style="margin:0">${escapeHtml(block.text || post.summary || '')}</p>` +
            textLink(href, block.linkLabel || s.readArticle)
          return imageWithCopy(media, block.imagePosition, copy)
        },
      },
    })
    return styleRichText(
      convertLexicalToHTML({
        data: newsletter.content as SerializedEditorState,
        disableContainer: true,
        converters,
      }),
    )
  }

  const socialLinks = (footerInfo.socialLinks ?? []).filter((link) => link.url)

  const html = (links: NewsletterLinks) => {
    // Further articles after the text, each with one link (no extra button).
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
    const social = socialLinks.length
      ? `<br><br>${socialLinks
          .map(
            (link) =>
              `<a href="${escapeHtml(link.url)}" style="color:#ffffff">${escapeHtml(SOCIAL_LABELS[link.platform] ?? link.platform)}</a>`,
          )
          .join(' &middot; ')}`
      : ''
    return emailLayout({
      lang: locale,
      previewText: newsletter.previewText,
      body:
        `<p style="font-size:12px;text-align:right;margin:0 0 20px"><a href="${escapeHtml(links.onlineUrl)}" style="color:${c.muted}">${escapeHtml(s.viewOnline)}</a></p>` +
        kicker('Newsletter') +
        heading(newsletter.title) +
        (newsletter.intro ? introToHtml(newsletter.intro) : '') +
        contentHtml(links) +
        featured,
      footer:
        `${escapeHtml(s.footerReason)}<br><a href="${escapeHtml(links.preferencesUrl)}" style="color:#ffffff">${escapeHtml(s.preferences)}</a> &middot; ` +
        `<a href="${escapeHtml(links.unsubscribeUrl)}" style="color:#ffffff">${escapeHtml(s.unsubscribe)}</a>` +
        social +
        `<br><br>${escapeHtml(footerInfo.address).replace(/\n/g, '<br>')}`,
    })
  }

  const text = (links: NewsletterLinks) =>
    [
      newsletter.title,
      '',
      newsletter.intro ?? '',
      '',
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
      ...socialLinks.map((link) => `${SOCIAL_LABELS[link.platform] ?? link.platform}: ${link.url}`),
      '',
      footerInfo.address,
    ]
      .filter((line) => line !== undefined)
      .join('\n')

  return { subject, html, text }
}
