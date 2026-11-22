import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/format'
import { bylineFor, mainTopicOf } from '@/lib/posts'
import type { Post } from '@/payload-types'

import { MediaImage } from '../ui/MediaImage'

type Props = {
  post: Post
  variant?: 'large' | 'medium' | 'list'
  /** Use the cut-out portrait (issue pages only, docs/design-system.md). */
  useIssueImage?: boolean
  priority?: boolean
}

/** Article card. Always shows the summary, never the start of the text. */
export async function ArticleCard({
  post,
  variant = 'medium',
  useIssueImage = false,
  priority,
}: Props) {
  const t = await getTranslations('article')
  const locale = await getLocale()
  const href = `/article/${post.slug}`
  const topic = mainTopicOf(post)
  const byline = bylineFor(post, (key, values) => t(key, values), locale)
  const image = useIssueImage && post.issueImage ? post.issueImage : post.heroImage

  if (variant === 'list') {
    return (
      <article className="group grid grid-cols-[1fr_auto] gap-4 border-b border-line py-5">
        <div>
          {topic && (
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {topic.title}
            </p>
          )}
          <h3 className="mt-1 font-serif text-xl leading-snug">
            <Link href={href} className="group-hover:text-accent">
              {post.title}
            </Link>
          </h3>
          {post.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{post.summary}</p>}
        </div>
        <div className="relative size-20 overflow-hidden rounded-lg bg-band sm:size-24">
          <MediaImage media={image} size="thumbnail" fill sizes="96px" className="object-cover" />
        </div>
      </article>
    )
  }

  const large = variant === 'large'
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[3/2] overflow-hidden rounded-card bg-band"
        tabIndex={-1}
        aria-hidden
      >
        <MediaImage
          media={image}
          size={large ? 'hero' : 'card'}
          fill
          priority={priority}
          sizes={
            large
              ? '(min-width: 1024px) 60vw, 100vw'
              : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'
          }
          className={`transition duration-500 group-hover:scale-[1.02] ${useIssueImage && post.issueImage ? 'object-contain' : 'object-cover'}`}
        />
      </Link>
      <div className="mt-4">
        {topic && (
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {topic.title}
          </p>
        )}
        <h3
          className={`mt-1 font-serif leading-tight ${large ? 'text-3xl md:text-4xl' : 'text-2xl'}`}
        >
          <Link href={href} className="group-hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {byline && <p className="mt-2 text-sm font-medium text-text">{byline}</p>}
        {post.summary && (
          <p className={`mt-2 text-muted ${large ? 'text-base' : 'line-clamp-3 text-sm'}`}>
            {post.summary}
          </p>
        )}
        {post.publishedAt && (
          <p className="mt-3 text-xs text-muted">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          </p>
        )}
      </div>
    </article>
  )
}
