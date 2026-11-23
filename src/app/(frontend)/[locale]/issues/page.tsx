import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { IssueCard, IssueCover } from '@/components/cards/IssueCard'
import { Reveal } from '@/components/ui/Reveal'
import { PageTitle, SectionHeader } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getIssues } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'issues' })
  return buildMetadata({ locale, path: '/issues', title: t('title') })
}

export default async function IssuesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('issues')
  const issues = await getIssues(locale)
  const digital = issues.filter((issue) => issue.format === 'digital')
  const archive = issues.filter((issue) => issue.format === 'pdf')
  return (
    <>
      <PageTitle title={t('title')} intro={t('intro')} />
      <section className="container-page">
        <SectionHeader title={t('digital')} />
        <div className="grid gap-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-line">
          {digital.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.slug}`}
              className="group grid grid-cols-[9rem_1fr] gap-6 md:px-8 md:first:pl-0 md:last:pr-0 lg:grid-cols-[12rem_1fr]"
            >
              <IssueCover issue={issue} sizes="200px" />
              <div>
                <p className="kicker">{issue.year}</p>
                <h3 className="headline-lg mt-2 link-headline">{issue.title}</h3>
                {issue.tagline && (
                  <p className="mt-2 font-serif text-lg italic text-muted">{issue.tagline}</p>
                )}
                {issue.description && (
                  <p className="mt-3 line-clamp-4 text-[0.9375rem] leading-relaxed text-muted">
                    {issue.description}
                  </p>
                )}
                <span className="meta mt-4 inline-block font-semibold text-text!">
                  {t('readIssue')} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Reveal as="section" className="mt-16 bg-band py-12">
        <div className="container-page">
          <SectionHeader title={t('archive')} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {archive.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </Reveal>
    </>
  )
}
