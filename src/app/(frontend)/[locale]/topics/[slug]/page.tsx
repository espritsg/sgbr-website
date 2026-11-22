import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { PageTitle } from '@/components/ui/Section'
import { Pagination } from '@/components/ui/Pagination'
import { TopicTabs } from '@/components/ui/TopicTabs'
import type { AppLocale } from '@/i18n/routing'
import { getPostsByTopic, getTopic, getTopics } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'
import type { Topic } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: AppLocale; slug: string }>
  searchParams: Promise<{ page?: string }>
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
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const t = await getTranslations('topics')
  const [topic, topics] = await Promise.all([getTopic(locale, slug), getTopics(locale)])
  if (!topic) notFound()

  const parent = typeof topic.parent === 'object' ? (topic.parent as Topic | null) : null
  const activeMain = parent ?? topic
  const activeSub = parent ? topic : null
  // A main topic shows its own articles plus those of its sub-topics.
  const ids = activeSub
    ? [topic.id]
    : [
        topic.id,
        ...topics
          .filter(
            (item) =>
              (typeof item.parent === 'object' ? item.parent?.id : item.parent) === topic.id,
          )
          .map((item) => item.id),
      ]
  const posts = await getPostsByTopic(locale, ids, page)

  return (
    <>
      <PageTitle
        kicker={parent ? parent.title : t('title')}
        title={topic.title}
        intro={topic.description}
      />
      <TopicTabs topics={topics} activeMain={activeMain} activeSub={activeSub} />
      {posts.docs.length ? (
        <div className="container-page mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="container-page mt-10 text-muted">{t('empty')}</p>
      )}
      <Pagination page={page} totalPages={posts.totalPages} basePath={`/topics/${slug}`} />
    </>
  )
}
