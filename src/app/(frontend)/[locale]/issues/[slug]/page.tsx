import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { IssueCover } from '@/components/cards/IssueCard'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { ButtonLink } from '@/components/ui/Button'
import { BackLink, SectionHeader } from '@/components/ui/Section'
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
      <header className="container-page pt-10 md:pt-14">
        <div className="grid gap-10 border-b border-line pb-10 md:grid-cols-[14rem_1fr] lg:grid-cols-[18rem_1fr] lg:gap-14">
          <div className="max-w-[16rem] md:max-w-none">
            <IssueCover issue={issue} sizes="288px" />
          </div>
          <div className="self-end">
            <BackLink href="/issues">
              {t('title')} · {issue.year}
            </BackLink>
            <h1 className="display mt-4">{issue.title}</h1>
            {issue.tagline && (
              <p className="mt-3 font-serif text-2xl italic text-muted">{issue.tagline}</p>
            )}
            {issue.description && <p className="lead mt-4 max-w-2xl">{issue.description}</p>}
            {pdf && (
              <ButtonLink href={pdf} variant="secondary" className="mt-6">
                {t('downloadPdf')} ↓
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      {issue.foreword && (
        <section className="container-reading mt-12">
          <p className="kicker mb-4">{t('foreword')}</p>
          <RichText
            data={issue.foreword}
            locale={locale}
            className="prose prose-lg max-w-none text-text dark:prose-invert prose-p:leading-[1.75]"
          />
          {editors.length > 0 && (
            <div className="mt-8 border-t border-line pt-4">
              <p className="kicker text-muted!">{t('editors')}</p>
              <p className="headline-sm mt-1">{editors.map((editor) => editor.name).join(' · ')}</p>
            </div>
          )}
        </section>
      )}

      {articles.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeader title={t('inThisIssue')} />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.id} post={post} useIssueImage />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
