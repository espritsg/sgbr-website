import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/format'
import { bylineFor, mainTopicOf } from '@/lib/posts'
import type { Post } from '@/payload-types'

import { MediaImage } from '../ui/MediaImage'

type Variant = 'lead' | 'standard' | 'horizontal' | 'compact'

type Props = {
  post: Post
  variant?: Variant
  /** Use the cut-out portrait (issue pages only, docs/design-system.md). */
  useIssueImage?: boolean
  priority?: boolean
  /** Number for ranked lists ("Latest"). */
  rank?: number
  showSummary?: boolean
}

/**
 * The one article teaser of the site: kicker (main topic), headline, summary, byline.
 * Never the start of the text, never a box around it; separation by rules.
 */
export async function ArticleCard({
  post,
  variant = 'standard',
  useIssueImage = false,
  priority,
  rank,
  showSummary = true,
}: Props) {
  const t = await getTranslations('article')
  const locale = await getLocale()
  const href = `/article/${post.slug}`
  const topic = mainTopicOf(post)
  const byline = bylineFor(post, (key, values) => t(key, values), locale)
  const image = useIssueImage && post.issueImage ? post.issueImage : post.heroImage
  const meta = [byline, post.publishedAt ? formatDate(post.publishedAt, locale) : null]
    .filter(Boolean)
    .join(' · ')

  const kicker = topic ? <p className="kicker mb-2">{topic.title}</p> : null
  const title = (size: string) => (
    <h3 className={size}>
      <Link href={href} className="link-headline">
        {post.title}
      </Link>
    </h3>
  )

  if (variant === 'compact') {
    return (
      <article className="group flex gap-4 py-4">
        {rank !== undefined && (
          <span className="font-serif w-6 shrink-0 text-2xl font-semibold leading-none text-muted">
            {rank}
          </span>
        )}
        <div>
          {kicker}
          {title('headline-sm')}
          {showSummary && post.summary && (
            <p className="meta mt-1.5 line-clamp-2">{post.summary}</p>
          )}
          {byline && <p className="meta mt-1.5">{byline}</p>}
        </div>
      </article>
    )
  }

  if (variant === 'horizontal') {
    return (
      <article className="group grid grid-cols-[1fr_7.5rem] gap-5 py-5 sm:grid-cols-[1fr_11rem]">
        <div>
          {kicker}
          {title('headline-sm sm:text-[1.375rem]')}
          {showSummary && post.summary && (
            <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
              {post.summary}
            </p>
          )}
          {meta && <p className="meta mt-2">{meta}</p>}
        </div>
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[4/3] overflow-hidden bg-band"
        >
          <MediaImage
            media={image}
            size="card"
            fill
            sizes="176px"
            className="img-zoom object-cover"
          />
        </Link>
      </article>
    )
  }

  const lead = variant === 'lead'
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className={`relative mb-4 block overflow-hidden bg-band ${lead ? 'aspect-[3/2]' : 'aspect-[3/2]'}`}
      >
        <MediaImage
          media={image}
          size={lead ? 'hero' : 'card'}
          fill
          priority={priority}
          sizes={
            lead
              ? '(min-width: 1024px) 50vw, 100vw'
              : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
          }
          className={`img-zoom ${useIssueImage && post.issueImage ? 'object-contain' : 'object-cover'}`}
        />
      </Link>
      {kicker}
      {title(lead ? 'headline-lg' : 'headline-md')}
      {showSummary && post.summary && (
        <p
          className={`mt-2 leading-relaxed text-muted ${lead ? 'text-[1.0625rem]' : 'line-clamp-3 text-[0.9375rem]'}`}
        >
          {post.summary}
        </p>
      )}
      {meta && <p className="meta mt-3">{meta}</p>}
    </article>
  )
}
