/**
 * Parser for the WordPress export (WXR, "Tools → Export → All content").
 * Returns plain objects; the mapping to Payload happens in migration.ts.
 */
import { XMLParser } from 'fast-xml-parser'

export type WxrAuthor = { id: number; login: string; email: string; displayName: string }
export type WxrCategory = { domain: string; slug: string; name: string }
export type WxrItem = {
  id: number
  type: string
  status: string
  title: string
  slug: string
  link: string
  dateGmt: string
  creator: string
  content: string
  excerpt: string
  parent: number
  attachmentUrl: string
  categories: WxrCategory[]
  meta: Record<string, string>
}
export type WxrExport = { siteUrl: string; authors: WxrAuthor[]; items: WxrItem[] }

const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]
const text = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'object' && '#text' in (value as Record<string, unknown>))
    return String((value as Record<string, unknown>)['#text'])
  return String(value)
}

export function parseWxr(xml: string): WxrExport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: false,
    isArray: (name) => ['item', 'category', 'wp:postmeta', 'wp:author'].includes(name),
  })
  const document = parser.parse(xml)
  const channel = document?.rss?.channel
  if (!channel) throw new Error('Not a WordPress export (WXR): <rss><channel> missing')

  const authors = asArray<Record<string, unknown>>(channel['wp:author']).map((author) => ({
    id: Number(text(author['wp:author_id'])),
    login: text(author['wp:author_login']).trim(),
    email: text(author['wp:author_email']).trim(),
    displayName: text(author['wp:author_display_name']).trim(),
  }))

  const items = asArray<Record<string, unknown>>(channel.item).map((item) => {
    const meta: Record<string, string> = {}
    for (const entry of asArray<Record<string, unknown>>(item['wp:postmeta'] as never)) {
      meta[text(entry['wp:meta_key']).trim()] = text(entry['wp:meta_value'])
    }
    const categories = asArray<Record<string, unknown>>(item.category as never).map((category) => ({
      domain: String(category['@_domain'] ?? ''),
      slug: String(category['@_nicename'] ?? ''),
      name: text(category).trim(),
    }))
    return {
      id: Number(text(item['wp:post_id'])),
      type: text(item['wp:post_type']).trim(),
      status: text(item['wp:status']).trim(),
      title: text(item.title).trim(),
      slug: decodeURIComponent(text(item['wp:post_name']).trim()),
      link: text(item.link).trim(),
      dateGmt: text(item['wp:post_date_gmt']).trim(),
      creator: text(item['dc:creator']).trim(),
      content: text(item['content:encoded']),
      excerpt: text(item['excerpt:encoded']),
      parent: Number(text(item['wp:post_parent']) || 0),
      attachmentUrl: text(item['wp:attachment_url']).trim(),
      categories,
      meta,
    }
  })
  return { siteUrl: text(channel['wp:base_site_url'] ?? channel.link).trim(), authors, items }
}

/** "2026-07-29 14:54:53" (GMT) → ISO. WordPress writes 0000-00-00 for drafts. */
export function wpDateToIso(value: string): string | undefined {
  if (!value || value.startsWith('0000')) return undefined
  return new Date(`${value.replace(' ', 'T')}Z`).toISOString()
}
