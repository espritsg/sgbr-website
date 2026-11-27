import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { PageTitle } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { getNewsletter } from '@/lib/data/queries'
import { formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/seo'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const newsletter = await getNewsletter(locale, slug)
  if (!newsletter) return {}
  return buildMetadata({
    locale,
    path: `/newsletter/${slug}`,
    title: newsletter.title,
    description: newsletter.intro,
  })
}

/** A sent newsletter in the archive (visible after `archiveDelayDays`). */
export default async function NewsletterIssuePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const newsletter = await getNewsletter(locale, slug)
  if (!newsletter) notFound()
  const t = await getTranslations('newsletter')
  const posts = (newsletter.featuredPosts ?? []).filter(
    (post): post is Post => typeof post === 'object' && post !== null,
  )
  return (
    <>
      <AdminBarDocument collection="newsletters" id={newsletter.id} label={t('title')} />
      <PageTitle
        kicker={
          newsletter.sentAt
            ? t('sentOn', { date: formatDate(newsletter.sentAt, locale) })
            : t('title')
        }
        title={newsletter.title}
      />
      <div className="container-reading">
        {newsletter.intro && (
          <div className="prose prose-lg mb-8 max-w-none text-text dark:prose-invert">
            {newsletter.intro
              .replace(/\r\n/g, '\n')
              .split(/\n\s*\n/)
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph.trim()}
                </p>
              ))}
          </div>
        )}
        <RichText
          data={newsletter.content}
          locale={locale}
          className="prose prose-lg max-w-none text-text dark:prose-invert prose-headings:font-serif"
        />
      </div>
      {posts.length > 0 && (
        <div className="container-page mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
