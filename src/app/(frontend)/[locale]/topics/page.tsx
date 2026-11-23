import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { TopicsExplorer, type TopicSearch } from '@/components/topics/TopicsExplorer'
import type { AppLocale } from '@/i18n/routing'
import { getTopics } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<TopicSearch> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'topics' })
  return buildMetadata({ locale, path: '/topics', title: t('title') })
}

export default async function TopicsPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const topics = await getTopics(locale)
  return (
    <TopicsExplorer locale={locale} topics={topics} active={null} search={await searchParams} />
  )
}
