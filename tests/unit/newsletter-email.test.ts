import { describe, expect, it } from 'vitest'

import { introToHtml, renderNewsletter } from '@/emails/newsletter'
import type { Media, Newsletter, Post } from '@/payload-types'

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [{ type: 'text', version: 1, text, format: 0, mode: 'normal', detail: 0, style: '' }],
})

const media = (id: number, url: string): Media =>
  ({ id, filename: url.split('/').pop(), url, alt: `Bild ${id}`, mimeType: 'image/jpeg' }) as Media

const post = {
  id: 7,
  slug: 'urs-wietlisbach',
  title: 'Urs Wietlisbach on Private Markets',
  summary: 'Lessons from building Partners Group.',
  heroImage: media(3, 'https://media.example/group.jpg'),
} as Post

function newsletter(overrides: Partial<Newsletter> = {}): Newsletter {
  return {
    id: 1,
    slug: 'december-2026-edition',
    title: 'December 2026 Edition',
    subject: 'Newsletter',
    intro: 'Dear reader,\n\nWelcome.\n\nCaspar Moebius\nEditor-in-Chief',
    content: {
      root: {
        type: 'root',
        version: 1,
        children: [
          paragraph('Guest commentary'),
          {
            type: 'block',
            version: 2,
            fields: {
              blockType: 'newsletterSection',
              image: media(2, 'https://media.example/pauli.jpg'),
              imagePosition: 'left',
              title: 'Thorsten Pauli',
              subtitle: 'Bank of America',
              linkLabel: 'Read the full commentary',
              linkUrl: 'https://example.com/commentary',
              linkStyle: 'button',
            },
          },
          {
            type: 'block',
            version: 2,
            fields: { blockType: 'newsletterArticle', post, imagePosition: 'top' },
          },
          paragraph('Thank you for reading.'),
        ],
      },
    },
    featuredPosts: [],
    ...overrides,
  } as unknown as Newsletter
}

const links = {
  preferencesUrl: 'https://example.com/prefs',
  unsubscribeUrl: 'https://example.com/unsub',
  onlineUrl: 'https://example.com/online',
  articleUrl: (slug: string) => `https://example.com/en/article/${slug}`,
}

describe('newsletter email', () => {
  it('keeps paragraphs and line breaks of the intro', () => {
    const html = introToHtml('Dear reader,\n\nWelcome.\n\nCaspar Moebius\nEditor-in-Chief')
    expect(html.match(/<p /g)).toHaveLength(3)
    expect(html).toContain('Caspar Moebius<br>Editor-in-Chief')
  })

  it('renders section and article blocks with images in place', () => {
    const html = renderNewsletter(newsletter(), 'en', { address: 'St. Gallen' }).html(links)
    expect(html).toContain('src="https://media.example/pauli.jpg"')
    expect(html).toContain('Read the full commentary')
    expect(html).toContain('src="https://media.example/group.jpg"')
    expect(html).toContain('https://example.com/en/article/urs-wietlisbach')
    // The article sits before the closing words, not after them.
    expect(html.indexOf('Urs Wietlisbach on Private Markets')).toBeLessThan(
      html.indexOf('Thank you for reading.'),
    )
  })

  it('links further articles once, without an extra button', () => {
    const html = renderNewsletter(newsletter({ content: null, featuredPosts: [post] }), 'en', {
      address: 'St. Gallen',
    }).html(links)
    expect(html.split('Read the interview').length - 1).toBe(1)
  })

  it('shows the social links in the footer', () => {
    const html = renderNewsletter(newsletter(), 'en', {
      address: 'St. Gallen',
      socialLinks: [{ platform: 'linkedin', url: 'https://www.linkedin.com/company/sgbr/' }],
    }).html(links)
    expect(html).toContain('href="https://www.linkedin.com/company/sgbr/"')
    expect(html).toContain('>LinkedIn</a>')
  })
})
