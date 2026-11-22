/**
 * HTML clean-up for WordPress content before converting it to Lexical.
 * Shared by the dev import and the final migration (docs/migration.md).
 */

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&[a-z]+;|&#0?39;/gi, (entity) => ENTITIES[entity] ?? entity)
}

export function stripTags(html: string): string {
  return decodeEntities(
    html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

/** Removes WPBakery and other shortcodes like [vc_row], [/vc_column], [gtranslate]. */
export function stripShortcodes(html: string): { html: string; removed: number } {
  let removed = 0
  const cleaned = html.replace(
    /\[\/?(vc_[a-z_]+|gtranslate|mailpoet_[a-z_]+|caption|embed)[^\]]*\]/gi,
    () => {
      removed += 1
      return ''
    },
  )
  return { html: cleaned, removed }
}

/** Paragraph texts in document order (for summaries and language detection). */
export function paragraphs(html: string): Array<{ text: string; bold: boolean }> {
  const result: Array<{ text: string; bold: boolean }> = []
  for (const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const inner = match[1]
    const text = stripTags(inner)
    if (!text) continue
    const bold = /^\s*<(strong|b)\b/i.test(inner) && /<\/(strong|b)>\s*$/i.test(inner)
    result.push({ text, bold })
  }
  return result
}

export type InlineImage = { wpId: number | null; src: string; alt: string }

/** Finds images in WordPress content. `wp-image-123` gives the media ID. */
export function findImages(html: string): InlineImage[] {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => {
    const tag = match[0]
    const wpId = tag.match(/wp-image-(\d+)/)?.[1]
    return {
      wpId: wpId ? Number(wpId) : null,
      src: tag.match(/\ssrc="([^"]+)"/)?.[1] ?? '',
      alt: decodeEntities(tag.match(/\salt="([^"]*)"/)?.[1] ?? ''),
    }
  })
}

/**
 * Prepares WordPress HTML for convertHTMLToLexical:
 * - removes shortcodes and links that only wrap an image
 * - turns images into Payload upload nodes (via data attributes), or drops them
 * - removes empty paragraphs and figure captions become paragraphs
 */
export function prepareHtmlForLexical(
  html: string,
  mediaIdFor: (image: InlineImage) => number | string | null,
): string {
  let result = stripShortcodes(html).html
  // <a href="…"><img …></a> → <img …>
  result = result.replace(/<a\b[^>]*>\s*(<img\b[^>]*>)\s*<\/a>/gi, '$1')
  result = result.replace(/<img\b[^>]*>/gi, (tag) => {
    const [image] = findImages(tag)
    const id = image ? mediaIdFor(image) : null
    if (id === null) return ''
    return `<img data-lexical-upload-relation-to="media" data-lexical-upload-id="${id}" src="${image.src}" alt="${image.alt}">`
  })
  result = result.replace(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi, '<p><em>$1</em></p>')
  result = result.replace(/<\/?(figure|div|section)\b[^>]*>/gi, '')
  result = result.replace(/<p\b[^>]*>\s*(&nbsp;|\s)*<\/p>/gi, '')
  return result
}
