import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { MediaImage } from '@/components/ui/MediaImage'
import type { AppLocale } from '@/i18n/routing'
import { getIssue, getPostsByIds } from '@/lib/data/queries'
import { fileUrl } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'
import type { TeamMember } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const issue = await getIssue(locale, slug)
  if (!issue) return {}
  return buildMetadata({
    locale,
    path: `/issues/${slug}`,
    title: issue.title,
    description: issue.tagline ?? issue.description,
    meta: issue.meta,
    image: issue.cover,
  })
}

export default async function IssuePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const issue = await getIssue(locale, slug)
  if (!issue) notFound()
  const t = await getTranslations('issues')
  const articleIds = (issue.articles?.docs ?? []).map((doc) =>
    typeof doc === 'object' ? doc.id : doc,
  )
  const articles = await getPostsByIds(locale, articleIds)
  const editors = (issue.editors ?? []).filter(
    (m): m is TeamMember => typeof m === 'object' && m !== null,
  )
  const pdf = fileUrl(issue.pdf)

  return (
    <>
      <AdminBarDocument collection="issues" id={issue.id} label={t('title')} />
      <section className="container-page grid gap-10 pb-8 pt-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            SGBR · {issue.year}
          </p>
          <h1 className="mt-2 font-serif text-5xl leading-tight md:text-6xl">{issue.title}</h1>
          {issue.tagline && (
            <p className="mt-3 font-serif text-2xl italic text-muted">{issue.tagline}</p>
          )}
          {pdf && (
            <a
              href={pdf}
              className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              {t('downloadPdf')}
            </a>
          )}
          {issue.cover && (
            <div className="relative mt-8 aspect-[3/4] max-w-sm overflow-hidden rounded-card ring-1 ring-line">
              <MediaImage
                media={issue.cover}
                size="card"
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
          )}
        </div>
        {issue.foreword ? (
          <div>
            <h2 className="font-serif text-2xl">{t('foreword')}</h2>
            <RichText
              data={issue.foreword}
              locale={locale}
              className="prose prose-lg mt-4 max-w-none text-text dark:prose-invert"
            />
            {editors.length > 0 && (
              <div className="mt-8 border-t border-line pt-4">
                <p className="text-xs uppercase tracking-widest text-muted">{t('editors')}</p>
                <p className="mt-1 font-serif text-xl">
                  {editors.map((editor) => editor.name).join(' · ')}
                </p>
              </div>
            )}
          </div>
        ) : (
          issue.description && <p className="text-lg text-muted">{issue.description}</p>
        )}
      </section>
      {articles.length > 0 && (
        <section className="container-page py-12">
          <h2 className="mb-8 border-t-2 border-text pt-3 font-serif text-3xl">
            {t('inThisIssue')}
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.id} post={post} useIssueImage />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
