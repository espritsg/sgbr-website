import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { Byline } from '@/components/ui/Byline'
import { MediaImage } from '@/components/ui/MediaImage'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getAdjacentPosts, getPost } from '@/lib/data/queries'
import { formatDate, joinNames } from '@/lib/format'
import { mainTopicOf, topicsOf } from '@/lib/posts'
import { buildMetadata } from '@/lib/seo'
import type { TeamMember } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPost(locale, slug)
  if (!post) return {}
  return buildMetadata({
    locale,
    path: `/article/${slug}`,
    title: post.title,
    description: post.summary,
    meta: post.meta,
    image: post.heroImage,
    // Articles exist in one language only (ADR 0011).
    canonicalLocale: post.originalLanguage,
    type: 'article',
  })
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const post = await getPost(locale, slug)
  if (!post) notFound()

  const t = await getTranslations('article')
  const tLanguage = await getTranslations('language')
  const { previous, next } = await getAdjacentPosts(locale, post)
  const topic = mainTopicOf(post)
  const interviewers = (post.interviewers ?? []).filter(
    (m): m is TeamMember => typeof m === 'object' && m !== null,
  )
  const isOtherLanguage = post.originalLanguage !== locale

  return (
    <article>
      <AdminBarDocument collection="posts" id={post.id} label={t('types.interview')} />
      {isOtherLanguage && (
        <div role="note" className="bg-band">
          <p className="container-reading py-3 text-sm text-muted">
            {tLanguage('onlyAvailableIn', {
              language: tLanguage(`languageNames.${post.originalLanguage}`),
            })}
          </p>
        </div>
      )}
      <header className="container-reading pb-8 pt-12 text-center" lang={post.originalLanguage}>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {topic && (
            <Link href={`/topics/${topic.slug}`} className="hover:underline">
              {topic.title}
            </Link>
          )}
          {topic && ' · '}
          {t(`types.${post.type}`)}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <p className="mt-6 text-lg">
          <Byline post={post} />
        </p>
        <p className="mt-2 text-sm text-muted">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          )}
          {interviewers.length > 0 &&
            ` · ${t('interviewedBy', {
              names: joinNames(
                interviewers.map((m) => m.name),
                locale,
              ),
            })}`}
        </p>
      </header>
      {post.heroImage && (
        <div className="container-page">
          <div className="relative mx-auto aspect-[16/9] max-w-[1200px] overflow-hidden rounded-card bg-band">
            <MediaImage
              media={post.heroImage}
              size="hero"
              fill
              priority
              sizes="(min-width: 1240px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
      <div className="container-reading py-12" lang={post.originalLanguage}>
        <RichText
          data={post.content}
          locale={locale}
          className="prose prose-lg max-w-none text-text dark:prose-invert prose-headings:font-serif prose-a:text-accent prose-strong:text-text"
          labels={{ question: t('question'), answer: t('answer'), download: t('download') }}
        />
        {topicsOf(post).length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
            {topicsOf(post).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/topics/${item.slug}`}
                  className="inline-block rounded-full border border-line px-3 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <nav
        aria-label="Articles"
        className="container-reading grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
      >
        {next ? (
          <Link
            href={`/article/${next.slug}`}
            className="group rounded-card border border-line p-5 hover:border-accent"
          >
            <span className="text-xs uppercase tracking-wider text-muted">← {t('next')}</span>
            <span className="mt-1 block font-serif text-xl group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {previous && (
          <Link
            href={`/article/${previous.slug}`}
            className="group rounded-card border border-line p-5 text-right hover:border-accent"
          >
            <span className="text-xs uppercase tracking-wider text-muted">{t('previous')} →</span>
            <span className="mt-1 block font-serif text-xl group-hover:text-accent">
              {previous.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  )
}
