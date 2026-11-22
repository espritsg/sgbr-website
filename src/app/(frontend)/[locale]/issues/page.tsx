import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { IssueCard } from '@/components/cards/IssueCard'
import { PageTitle, Section } from '@/components/ui/Section'
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
      <PageTitle title={t('title')} />
      <Section title={t('digital')}>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {digital.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </Section>
      <Section title={t('archive')} band>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {archive.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </Section>
    </>
  )
}
