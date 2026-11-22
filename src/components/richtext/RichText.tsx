import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

import { fileUrl, isMedia } from '@/lib/media'
import type { EmbedBlock, PdfDownloadBlock, QABlock, QuoteBlock } from '@/payload-types'

import { MediaImage } from '../ui/MediaImage'
import { Embed } from './Embed'

type Props = {
  data: unknown
  locale?: string
  className?: string
  labels?: { question: string; answer: string; download: string }
}

const hrefForDoc =
  (locale: string) =>
  ({ linkNode }: { linkNode: { fields: { doc?: unknown } } }) => {
    const doc = linkNode.fields.doc as
      { relationTo?: string; value?: { slug?: string } } | undefined
    const slug = doc?.value?.slug
    if (!slug) return '#'
    switch (doc?.relationTo) {
      case 'posts':
        return `/${locale}/article/${slug}`
      case 'issues':
        return `/${locale}/issues/${slug}`
      case 'events':
        return `/${locale}/events/${slug}`
      case 'people':
        return `/${locale}/people/${slug}`
      default:
        return `/${locale}/${slug}`
    }
  }

/** Renders Lexical content with the site's blocks (Q&A, quote, embed, PDF) and images. */
export function RichText({ data, locale = 'en', className, labels }: Props) {
  if (!data || typeof data !== 'object') return null
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref: hrefForDoc(locale) }),
    upload: ({ node }) => {
      const media = node.value
      if (!isMedia(media)) return null
      if (media.mimeType === 'application/pdf') {
        return (
          <p>
            <a href={fileUrl(media) ?? '#'}>{media.filename}</a>
          </p>
        )
      }
      return (
        <figure className="not-prose my-8">
          <MediaImage
            media={media}
            size="hero"
            className="h-auto w-full rounded-card"
            sizes="(min-width: 960px) 920px, 100vw"
          />
          {media.caption && (
            <figcaption className="mt-2 text-sm text-muted">{media.caption}</figcaption>
          )}
        </figure>
      )
    },
    blocks: {
      qa: ({ node }: { node: { fields: QABlock } }) => (
        <div className="not-prose my-8 border-l-2 border-accent pl-5">
          <p className="font-semibold text-text">
            <span className="sr-only">{labels?.question ?? 'Question'}: </span>
            {node.fields.question}
          </p>
          <div className="prose prose-lg mt-3 max-w-none text-text dark:prose-invert">
            <RichText data={node.fields.answer} locale={locale} labels={labels} />
          </div>
        </div>
      ),
      quote: ({ node }: { node: { fields: QuoteBlock } }) => (
        <blockquote className="not-prose my-10 border-y border-line py-6 text-center font-serif text-3xl leading-snug text-text">
          «{node.fields.text}»
          {node.fields.attribution && (
            <footer className="mt-3 font-sans text-sm text-muted">
              — {node.fields.attribution}
            </footer>
          )}
        </blockquote>
      ),
      embed: ({ node }: { node: { fields: EmbedBlock } }) => (
        <Embed url={node.fields.url} caption={node.fields.caption} />
      ),
      pdfDownload: ({ node }: { node: { fields: PdfDownloadBlock } }) => {
        const href = fileUrl(node.fields.file)
        if (!href) return null
        return (
          <p className="not-prose my-6">
            <a
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-on-accent"
            >
              {node.fields.label || labels?.download || 'Download PDF'}
            </a>
          </p>
        )
      },
    },
  })
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={className}
      disableContainer={!className}
    />
  )
}
