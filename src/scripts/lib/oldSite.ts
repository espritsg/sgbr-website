/**
 * Readers for content that lives only in the HTML of the old child theme (not in the
 * REST API or the feeds): event detail pages (`?e=<id>`). Used by the sync with the old
 * site (src/scripts/sync-old-site.ts, docs/migration.md).
 */
import { decodeEntities } from './html'

export type EventChapter = { imageUrl: string; imageAlt?: string; heading?: string; text: string }

export type EventDetail = {
  /** Simple HTML (h3 + p) from "About the speaker", "About <company>", "About the event". */
  descriptionHtml?: string
  recap?: { title?: string; intro: string[]; chapters: EventChapter[] }
}

/** Text of inline HTML; tags go away without adding spaces ("<span>BaFin</span>." stays "BaFin."). */
function textOf(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Inner HTML of the first element with the class, assuming no nested element of the same tag. */
function innerOf(html: string, tag: string, className: string): string | undefined {
  const match = html.match(
    new RegExp(`<${tag}[^>]*class="${className}(?:\\s[^"]*)?"[^>]*>([\\s\\S]*?)</${tag}>`),
  )
  return match?.[1]
}

function paragraphTexts(html: string | undefined): string[] {
  if (!html) return []
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => textOf(match[1]))
    .filter(Boolean)
}

function detailBodyHtml(html: string): string | undefined {
  const start = html.indexOf('class="sgbr-se-detail-body"')
  if (start === -1) return undefined
  const body = html.slice(start)
  const parts: string[] = []
  const sectionPattern =
    /<h2 class="sgbr-se-h2">([\s\S]*?)<\/h2>\s*<div class="sgbr-se-text">([\s\S]*?)<\/div>/g
  for (const match of body.matchAll(sectionPattern)) {
    const heading = textOf(match[1])
    const texts = paragraphTexts(match[2])
    if (!heading || !texts.length) continue
    parts.push(`<h3>${escapeHtml(heading)}</h3>`)
    for (const text of texts) parts.push(`<p>${escapeHtml(text)}</p>`)
  }
  return parts.length ? parts.join('') : undefined
}

function recap(html: string): EventDetail['recap'] {
  const start = html.indexOf('<article class="sgbr-story"')
  if (start === -1) return undefined
  const end = html.indexOf('</article>', start)
  const story = html.slice(start, end === -1 ? undefined : end)
  const title = innerOf(story, 'h2', 'sgbr-story-intro-title')
  const intro = paragraphTexts(innerOf(story, 'div', 'sgbr-story-recap'))

  // One scene per chapter: the hero (chapter 1) and the steps (chapters 2 …).
  const scenes = story.split(/<section class="sgbr-story-(?:hero|step)"/).slice(1)
  const chapters: EventChapter[] = []
  for (const scene of scenes) {
    const image = scene.match(/<img[^>]*src="([^"]+)"[^>]*>/)
    if (!image) continue
    const alt = image[0].match(/alt="([^"]*)"/)?.[1]
    const heading = innerOf(scene, 'h3', 'sgbr-story-heading')
    chapters.push({
      imageUrl: decodeEntities(image[1]),
      imageAlt: alt ? decodeEntities(alt) : undefined,
      heading: heading ? textOf(heading) : undefined,
      text: paragraphTexts(innerOf(scene, 'div', 'sgbr-story-text')).join('\n\n'),
    })
  }
  if (!chapters.length) return undefined
  return { title: title ? textOf(title) : undefined, intro, chapters }
}

/** Reads description and recap of one event from its detail page on the old site. */
export function parseEventDetail(html: string): EventDetail {
  return { descriptionHtml: detailBodyHtml(html), recap: recap(html) }
}
