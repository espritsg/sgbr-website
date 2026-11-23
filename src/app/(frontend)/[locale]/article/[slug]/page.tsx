import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { Byline } from '@/components/ui/Byline'
import { ArrowLeft, ArrowRight } from '@/components/ui/icons'
import { MediaImage } from '@/components/ui/MediaImage'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeader } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { redirectFromCms } from '@/lib/data/cmsRedirects'
import { getAdjacentPosts, getPost, getPostsByTopic } from '@/lib/data/queries'
import { formatDate, joinNames } from '@/lib/format'
import { isMedia } from '@/lib/media'
import { mainTopicOf, peopleOf, topicsOf } from '@/lib/posts'
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
  if (!post) {
    // Old single-segment URLs land here; editors may have a redirect for them.
    await redirectFromCms([`/${slug}`, `/${locale}/article/${slug}`], locale)
    notFound()
  }

  const t = await getTranslations('article')
  const tLanguage = await getTranslations('language')
  const { previous, next } = await getAdjacentPosts(locale, post)
  const topic = mainTopicOf(post)
  const people = peopleOf(post)
  const interviewers = (post.interviewers ?? []).filter(
    (m): m is TeamMember => typeof m === 'object' && m !== null,
  )
  const isOtherLanguage = post.originalLanguage !== locale
  const related = topic
    ? (await getPostsByTopic(locale, [topic.id], 1, 4)).docs
        .filter((item) => item.id !== post.id)
        .slice(0, 3)
    : []
  const hero = isMedia(post.heroImage) ? post.heroImage : null

  return (
    <article>
      <AdminBarDocument collection="posts" id={post.id} label={t('types.interview')} />
      {isOtherLanguage && (
        <div role="note" className="border-b border-line bg-band">
          <p className="container-reading meta py-3">
            {tLanguage('onlyAvailableIn', {
              language: tLanguage(`languageNames.${post.originalLanguage}`),
            })}
          </p>
        </div>
      )}
      <header className="container-reading pt-10 md:pt-14" lang={post.originalLanguage}>
        <p className="kicker">
          {topic && (
            <Link href={`/topics/${topic.slug}`} className="hover:underline">
              {topic.title}
            </Link>
          )}
          {topic && <span className="mx-2 text-line">|</span>}
          <span className="text-muted">{t(`types.${post.type}`)}</span>
        </p>
        <h1 className="headline-xl mt-4">{post.title}</h1>
        {post.summary && <p className="lead mt-5">{post.summary}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-sm">
          <span className="font-semibold">
            <Byline post={post} />
          </span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt} className="meta">
              {formatDate(post.publishedAt, locale)}
            </time>
          )}
          {interviewers.length > 0 && (
            <span className="meta">
              ·{' '}
              {t('interviewedBy', {
                names: joinNames(
                  interviewers.map((m) => m.name),
                  locale,
                ),
              })}
            </span>
          )}
        </div>
      </header>

      {hero && (
        <figure className="container-wide mt-8">
          <div className="relative aspect-[16/9] overflow-hidden bg-band">
            <MediaImage
              media={hero}
              size="hero"
              fill
              priority
              sizes="(min-width: 1080px) 1040px, 100vw"
              className="object-cover"
            />
          </div>
          {(hero.caption || hero.credit) && (
            <figcaption className="meta mt-2">
              {hero.caption}
              {hero.credit && <span className="ml-2 uppercase tracking-wider">{hero.credit}</span>}
            </figcaption>
          )}
        </figure>
      )}

      <div className="container-reading py-10" lang={post.originalLanguage}>
        <RichText
          data={post.content}
          locale={locale}
          className="prose prose-lg max-w-none text-text dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-p:leading-[1.75] prose-a:text-accent prose-a:underline-offset-2 prose-strong:text-text"
          labels={{ question: t('question'), answer: t('answer'), download: t('download') }}
        />

        {people.length > 0 && (
          <aside className="mt-12 border-t border-line pt-6">
            {people.map((person) => (
              <div key={person.id} className="flex items-center gap-5 py-2">
                {isMedia(person.photo) && (
                  <div className="relative size-24 shrink-0 self-stretch overflow-hidden bg-band sm:h-auto sm:min-h-24 sm:w-24">
                    <MediaImage
                      media={person.photo}
                      size="thumbnail"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <Link href={`/people/${person.slug}`} className="headline-sm link-headline">
                    {person.name}
                  </Link>
                  <p className="meta mt-0.5">
                    {[person.role, person.organization].filter(Boolean).join(', ')}
                  </p>
                  {person.bio && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                      {person.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </aside>
        )}

        {topicsOf(post).length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {topicsOf(post).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/topics/${item.slug}`}
                  className="inline-block border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-text"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {related.length > 0 && (
        <Reveal as="section" className="container-page mt-6">
          <SectionHeader title={t('readMoreTitle')} />
          <div className="grid gap-10 sm:-mx-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
            {related.map((item) => (
              <div key={item.id} className="sm:px-6">
                <ArticleCard post={item} />
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <div className="container-page mt-12">
        <nav
          aria-label="Articles"
          className="grid border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-line"
        >
          {next ? (
            <Link href={`/article/${next.slug}`} className="group py-6 sm:pr-8">
              <span className="kicker inline-flex items-center gap-1.5 text-muted!">
                <ArrowLeft aria-hidden className="size-3.5" />
                {t('next')}
              </span>
              <span className="headline-sm mt-1 block link-headline">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {previous && (
            <Link
              href={`/article/${previous.slug}`}
              className="group border-t border-line py-6 text-right sm:border-t-0 sm:pl-8"
            >
              <span className="kicker inline-flex items-center gap-1.5 text-muted!">
                {t('previous')}
                <ArrowRight aria-hidden className="size-3.5" />
              </span>
              <span className="headline-sm mt-1 block link-headline">{previous.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  )
}
