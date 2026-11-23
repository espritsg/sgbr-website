import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { TopicsExplorer, type TopicSearch } from '@/components/topics/TopicsExplorer'
import type { AppLocale } from '@/i18n/routing'
import { getTopic, getTopics } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: AppLocale; slug: string }>
  searchParams: Promise<TopicSearch>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const topic = await getTopic(locale, slug)
  if (!topic) return {}
  return buildMetadata({
    locale,
    path: `/topics/${slug}`,
    title: topic.title,
    description: topic.description,
  })
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const [topic, topics] = await Promise.all([getTopic(locale, slug), getTopics(locale)])
  if (!topic) notFound()
  return (
    <TopicsExplorer locale={locale} topics={topics} active={topic} search={await searchParams} />
  )
}
